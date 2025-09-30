// src/services/aiService.js
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export async function requestWorkoutPlan(goals, fitnessLevel = "beginner", weeks = 4) {
  const generateFn = httpsCallable(functions, "generateWorkoutPlan");
  const res = await generateFn({ goals, fitnessLevel, durationWeeks: weeks });
  return res.data; // { ok, result, id }
}

export async function runAgent(goal) {
  const agentFn = httpsCallable(functions, "agentOrchestrator");
  const res = await agentFn({ goal });
  return res.data;
}
