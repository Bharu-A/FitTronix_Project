// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const OPENAI_KEY = functions.config().openai?.key;

// helper using fetch (node 18+ has global fetch)
async function callOpenAIChat(systemPrompt, userPrompt) {
  if (!OPENAI_KEY) throw new Error("OpenAI key not set");
  const payload = {
    model: "gpt-4o-mini", // change to the model you have access to
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 800,
    temperature: 0.3
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  return j;
}

// generate workout plan
exports.generateWorkoutPlan = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { goals = "general fitness", fitnessLevel = "beginner", durationWeeks = 4 } = data;
  const prompt = `Create a ${durationWeeks}-week workout plan for a ${fitnessLevel} person with goals: ${goals}. Return JSON: { weeks: [ {weekNumber:1, days:[{day:'Monday',exercises:[{name,sets,reps,notes}]}]}] }`;

  try {
    const aiRes = await callOpenAIChat("You are a helpful fitness coach.", prompt);
    const content = aiRes?.choices?.[0]?.message?.content || JSON.stringify(aiRes);
    // Save to ai_tasks
    const docRef = await db.collection("ai_tasks").add({
      uid: context.auth.uid,
      prompt,
      result: content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      type: "generateWorkout"
    });
    return { ok: true, result: content, id: docRef.id };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError("internal", "AI call failed");
  }
});

// agent orchestrator (simplified)
exports.agentOrchestrator = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { goal } = data;
  const prompt = `You are an orchestration agent. For goal: "${goal}", return a JSON array "actions" with items like {"tool":"generateWorkout","args":{...}} or {"tool":"createFirestoreDoc","args":{collection:"workouts", doc:{...}}}. Return only JSON.`;

  try {
    const aiRes = await callOpenAIChat("You are an agent orchestrator that returns JSON actions.", prompt);
    const content = aiRes?.choices?.[0]?.message?.content || "";
    const plan = JSON.parse(content);
    const results = [];
    for (const action of plan.actions || []) {
      if (action.tool === "generateWorkout") {
        // simple wrap: call the generateWorkoutPlan function logic inline
        const genRes = await callOpenAIChat("You are a fitness coach.", `Create a workout: ${JSON.stringify(action.args)}`);
        results.push({ action, output: genRes?.choices?.[0]?.message?.content || "" });
      } else if (action.tool === "createFirestoreDoc") {
        const ref = await db.collection(action.args.collection).add(action.args.doc);
        results.push({ action, output: `created:${ref.id}` });
      } else {
        results.push({ action, output: "unknown_tool" });
      }
    }

    await db.collection("ai_tasks").add({
      uid: context.auth.uid,
      goal,
      plan,
      results,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { ok: true, results };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError("internal", "Agent failed");
  }
});
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Compute comprehensive user analytics
exports.computeUserAnalytics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = data.userId || context.auth.uid;
  
  try {
    // Fetch user workouts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const workoutsSnapshot = await admin.firestore()
      .collection('workouts')
      .where('userId', '==', userId)
      .where('completedAt', '>=', thirtyDaysAgo)
      .orderBy('completedAt', 'desc')
      .get();

    const workouts = [];
    workoutsSnapshot.forEach(doc => workouts.push(doc.data()));

    // Calculate analytics metrics
    const analytics = {
      userId: userId,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      totalWorkouts: workouts.length,
      totalCalories: workouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0),
      averageIntensity: calculateAverageIntensity(workouts),
      formAccuracy: calculateFormAccuracy(workouts),
      recoveryStatus: calculateRecoveryStatus(workouts),
      aiAnalysisScore: calculateAIAnalysisScore(workouts),
      currentStreak: await calculateCurrentStreak(userId),
      weeklySummary: generateWeeklySummary(workouts),
      todaysFocus: generateTodaysFocus(workouts)
    };

    // Store analytics in Firestore for real-time access
    await admin.firestore()
      .collection('analytics')
      .doc(userId)
      .set(analytics, { merge: true });

    return { success: true, analytics: analytics };
  } catch (error) {
    console.error('Error computing analytics:', error);
    throw new functions.https.HttpsError('internal', 'Failed to compute analytics');
  }
});

// Helper functions for analytics calculations
function calculateAverageIntensity(workouts) {
  if (workouts.length === 0) return 0;
  const total = workouts.reduce((sum, workout) => sum + (workout.intensity || 0), 0);
  return Math.round(total / workouts.length);
}

function calculateFormAccuracy(workouts) {
  if (workouts.length === 0) return 0;
  const recentWorkouts = workouts.slice(0, 5); // Last 5 workouts
  const total = recentWorkouts.reduce((sum, workout) => sum + (workout.formAccuracy || 0), 0);
  return Math.round(total / recentWorkouts.length);
}

function calculateRecoveryStatus(workouts) {
  // Simplified recovery calculation based on workout frequency and intensity
  if (workouts.length === 0) return 100;
  
  const lastWorkout = workouts[0];
  const hoursSinceLastWorkout = (new Date() - lastWorkout.completedAt.toDate()) / (1000 * 60 * 60);
  
  let recovery = Math.min(100, (hoursSinceLastWorkout / 48) * 100);
  
  // Adjust based on workout intensity
  if (lastWorkout.intensity > 80) {
    recovery *= 0.8; // High intensity workouts need more recovery
  }
  
  return Math.round(recovery);
}

function calculateAIAnalysisScore(workouts) {
  if (workouts.length === 0) return 0;
  
  const scores = workouts.map(workout => {
    let score = workout.formAccuracy || 50;
    // Bonus for consistency
    if (workout.intensity > 70) score += 10;
    if (workout.duration > 30) score += 5;
    return Math.min(100, score);
  });
  
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

async function calculateCurrentStreak(userId) {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();
  return userData?.currentStreak || 0;
}

function generateWeeklySummary(workouts) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const summary = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = days[date.getDay()];
    
    const dayWorkouts = workouts.filter(workout => {
      const workoutDate = workout.completedAt.toDate();
      return workoutDate.toDateString() === date.toDateString();
    });
    
    const dayPerformance = dayWorkouts.length > 0 ? 
      Math.round(dayWorkouts.reduce((sum, w) => sum + (w.performance || 0), 0) / dayWorkouts.length) : 0;
    
    const dayCalories = dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const primaryType = dayWorkouts[0]?.type || 'Rest';
    
    summary.push({
      day: dayStr,
      value: dayPerformance,
      calories: dayCalories,
      type: primaryType
    });
  }
  
  return summary;
}

function generateTodaysFocus(workouts) {
  const recentWorkouts = workouts.slice(0, 3);
  const types = {};
  
  recentWorkouts.forEach(workout => {
    types[workout.type] = (types[workout.type] || 0) + 1;
  });
  
  // Return the most frequent type, or a balanced workout if no clear focus
  const sortedTypes = Object.entries(types).sort((a, b) => b[1] - a[1]);
  return sortedTypes.length > 0 ? `${sortedTypes[0][0]} Focus` : "Full Body Workout";
}