import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

const HealthTracker = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [userData, setUserData] = useState({
    gender: "male",
    age: "",
    height: "",
    weight: "",
    activityLevel: "sedentary",
    goal: "maintain",
    mealsPerDay: "3",
    dietaryPreference: "balanced",
    allergies: "",
    healthConditions: ""
  });
  const [bmiResult, setBmiResult] = useState(null);
  const [bmrResult, setBmrResult] = useState(null);
  const [foodLog, setFoodLog] = useState([]);
  const [todayFood, setTodayFood] = useState([]);
  const [newFood, setNewFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    mealType: "breakfast"
  });
  const [waterIntake, setWaterIntake] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [progress, setProgress] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const [reportText, setReportText] = useState("");
  const [showWorkoutPlanner, setShowWorkoutPlanner] = useState(false);

  // Load & save food log and user data in localStorage
  useEffect(() => {
    const storedLog = JSON.parse(localStorage.getItem("foodLog")) || [];
    setFoodLog(storedLog);
    
    const storedUserData = JSON.parse(localStorage.getItem("userHealthData"));
    if (storedUserData) {
      setUserData(storedUserData);
    }
    
    const storedWater = parseInt(localStorage.getItem("waterIntake")) || 0;
    setWaterIntake(storedWater);
  }, []);

  useEffect(() => {
    localStorage.setItem("foodLog", JSON.stringify(foodLog));
    localStorage.setItem("userHealthData", JSON.stringify(userData));
    localStorage.setItem("waterIntake", waterIntake.toString());
  }, [foodLog, userData, waterIntake]);

  // Calculate BMI and BMR
  useEffect(() => {
    if (userData.height && userData.weight && userData.age) {
      calculateBMI();
      calculateBMR();
    }
  }, [userData]);

  // Filter today's food entries and calculate progress
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const todayEntries = foodLog.filter((entry) => entry.date === today);
    setTodayFood(todayEntries);
    
    // Calculate progress
    if (bmrResult) {
      const totalCalories = todayEntries.reduce((sum, food) => sum + parseInt(food.calories || 0), 0);
      const totalProtein = todayEntries.reduce((sum, food) => sum + parseInt(food.protein || 0), 0);
      const totalCarbs = todayEntries.reduce((sum, food) => sum + parseInt(food.carbs || 0), 0);
      const totalFats = todayEntries.reduce((sum, food) => sum + parseInt(food.fats || 0), 0);
      
      const goalCalories = parseInt(bmrResult.goalCalories);
      const goalProtein = parseInt(bmrResult.goalCalories * 0.3 / 4);
      const goalCarbs = parseInt(bmrResult.goalCalories * 0.4 / 4);
      const goalFats = parseInt(bmrResult.goalCalories * 0.3 / 9);
      
      setProgress({
        calories: Math.min(100, Math.round((totalCalories / goalCalories) * 100)),
        protein: Math.min(100, Math.round((totalProtein / goalProtein) * 100)),
        carbs: Math.min(100, Math.round((totalCarbs / goalCarbs) * 100)),
        fats: Math.min(100, Math.round((totalFats / goalFats) * 100))
      });
    }
  }, [foodLog, bmrResult]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const calculateBMI = () => {
    const heightInMeters = userData.height / 100;
    const bmi = userData.weight / (heightInMeters * heightInMeters);
    setBmiResult(bmi.toFixed(1));
  };

  const calculateBMR = () => {
    let bmr;
    if (userData.gender === "male") {
      bmr =
        88.362 +
        13.397 * userData.weight +
        4.799 * userData.height -
        5.677 * userData.age;
    } else {
      bmr =
        447.593 +
        9.247 * userData.weight +
        3.098 * userData.height -
        4.33 * userData.age;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9,
    };

    const tdee = bmr * activityMultipliers[userData.activityLevel];

    let goalCalories;
    switch (userData.goal) {
      case "lose":
        goalCalories = tdee - 500;
        break;
      case "gain":
        goalCalories = tdee + 500;
        break;
      default:
        goalCalories = tdee;
    }

    setBmrResult({
      bmr: bmr.toFixed(0),
      tdee: tdee.toFixed(0),
      goalCalories: goalCalories.toFixed(0),
    });
  };

  const handleFoodInputChange = (e) => {
    const { name, value } = e.target;
    setNewFood({
      ...newFood,
      [name]: value,
    });
  };

  const addFoodEntry = () => {
    if (newFood.name && newFood.calories) {
      const entry = {
        ...newFood,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() // Add unique ID for possible deletion
      };

      setFoodLog([...foodLog, entry]);
      setNewFood({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        mealType: "breakfast"
      });
    }
  };

  const addWaterIntake = () => {
    setWaterIntake(prev => prev + 1);
  };

  const resetWaterIntake = () => {
    setWaterIntake(0);
  };

  const deleteFoodEntry = (id) => {
    setFoodLog(foodLog.filter(entry => entry.id !== id));
  };

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const getDietPlan = () => {
    if (!bmrResult) return null;

    const calories = parseInt(bmrResult.goalCalories);
    const protein = (calories * 0.3 / 4).toFixed(0);
    const carbs = (calories * 0.4 / 4).toFixed(0);
    const fats = (calories * 0.3 / 9).toFixed(0);

    return { calories, protein, carbs, fats };
  };

  const getSupplements = () => {
    const baseSupplements = ["Multivitamin", "Vitamin D", "Omega-3 Fish Oil"];

    if (userData.goal === "lose") {
      return [...baseSupplements, "Green Tea Extract", "CLA", "Fiber Supplement"];
    } else if (userData.goal === "gain") {
      return [...baseSupplements, "Creatine", "Whey Protein", "BCAAs", "L-Glutamine"];
    }

    return baseSupplements;
  };

  const getMealPlan = () => {
    if (!bmrResult) return null;
    
    const dietPlan = getDietPlan();
    const meals = parseInt(userData.mealsPerDay);
    const caloriesPerMeal = Math.round(dietPlan.calories / meals);
    const proteinPerMeal = Math.round(dietPlan.protein / meals);
    const carbsPerMeal = Math.round(dietPlan.carbs / meals);
    const fatsPerMeal = Math.round(dietPlan.fats / meals);
    
    return { meals, caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatsPerMeal };
  };

  const getFoodSuggestions = () => {
    const suggestions = {
      breakfast: ["Oatmeal with berries", "Greek yogurt with nuts", "Eggs with whole grain toast", "Smoothie with protein powder"],
      lunch: ["Grilled chicken salad", "Quinoa bowl with vegetables", "Turkey wrap", "Lentil soup"],
      dinner: ["Salmon with roasted vegetables", "Lean steak with sweet potato", "Tofu stir-fry", "Chicken and vegetable skewers"],
      snack: ["Apple with peanut butter", "Handful of almonds", "Protein bar", "Greek yogurt"]
    };
    
    return suggestions;
  };


const generateReport = (type = "daily") => {
  const dietPlan = getDietPlan();
  const supplements = getSupplements();
  const mealPlan = getMealPlan();

  let reportTitle = type === "weekly" ? "WEEKLY HEALTH & NUTRITION REPORT" : "DAILY HEALTH & NUTRITION REPORT";

  // Create jsPDF document
  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(18);
  doc.text(reportTitle, 14, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Personal Information:`, 14, yPos);
  yPos += 7;
  doc.text(`Gender: ${userData.gender}`, 14, yPos); yPos += 6;
  doc.text(`Age: ${userData.age} years`, 14, yPos); yPos += 6;
  doc.text(`Height: ${userData.height} cm`, 14, yPos); yPos += 6;
  doc.text(`Weight: ${userData.weight} kg`, 14, yPos); yPos += 6;
  doc.text(`Activity Level: ${userData.activityLevel}`, 14, yPos); yPos += 6;
  doc.text(`Goal: ${userData.goal}`, 14, yPos); yPos += 6;
  doc.text(`Meals per day: ${userData.mealsPerDay}`, 14, yPos); yPos += 6;
  doc.text(`Dietary Preference: ${userData.dietaryPreference}`, 14, yPos); yPos += 6;
  if (userData.allergies) { doc.text(`Allergies: ${userData.allergies}`, 14, yPos); yPos += 6; }
  if (userData.healthConditions) { doc.text(`Health Conditions: ${userData.healthConditions}`, 14, yPos); yPos += 6; }

  yPos += 10;
  doc.setFontSize(14);
  doc.text("Results:", 14, yPos);
  yPos += 7;
  doc.setFontSize(12);
  doc.text(`BMI: ${bmiResult} (${getBmiCategory(bmiResult)})`, 14, yPos); yPos += 6;
  doc.text(`BMR: ${bmrResult.bmr} calories`, 14, yPos); yPos += 6;
  doc.text(`TDEE: ${bmrResult.tdee} calories`, 14, yPos); yPos += 6;
  doc.text(`Daily Calorie Target: ${bmrResult.goalCalories} calories`, 14, yPos); yPos += 10;

  doc.text("Nutrition Plan:", 14, yPos); yPos += 7;
  doc.text(`Calories: ${dietPlan.calories} kcal`, 14, yPos); yPos += 6;
  doc.text(`Protein: ${dietPlan.protein} g`, 14, yPos); yPos += 6;
  doc.text(`Carbohydrates: ${dietPlan.carbs} g`, 14, yPos); yPos += 6;
  doc.text(`Fats: ${dietPlan.fats} g`, 14, yPos); yPos += 10;

  if (type === "daily") {
    doc.text(`Meal Plan (${mealPlan.meals} meals per day):`, 14, yPos); yPos += 7;
    doc.text(`Calories per meal: ~${mealPlan.caloriesPerMeal} kcal`, 14, yPos); yPos += 6;
    doc.text(`Protein per meal: ~${mealPlan.proteinPerMeal} g`, 14, yPos); yPos += 6;
    doc.text(`Carbs per meal: ~${mealPlan.carbsPerMeal} g`, 14, yPos); yPos += 6;
    doc.text(`Fats per meal: ~${mealPlan.fatsPerMeal} g`, 14, yPos); yPos += 10;

    doc.text("Today's Food Intake:", 14, yPos); yPos += 7;
    if (todayFood.length === 0) {
      doc.text("No entries for today.", 14, yPos); yPos += 6;
    } else {
      todayFood.forEach((food, index) => {
        doc.text(
          `${index + 1}. ${food.mealType}: ${food.name} - ${food.calories} kcal (P:${food.protein}g C:${food.carbs}g F:${food.fats}g)`,
          14,
          yPos
        );
        yPos += 6;
      });
    }
    yPos += 10;

    doc.text("Progress Today:", 14, yPos); yPos += 7;
    doc.text(`Calories: ${progress.calories}% of goal`, 14, yPos); yPos += 6;
    doc.text(`Protein: ${progress.protein}% of goal`, 14, yPos); yPos += 6;
    doc.text(`Carbs: ${progress.carbs}% of goal`, 14, yPos); yPos += 6;
    doc.text(`Fats: ${progress.fats}% of goal`, 14, yPos);
  }
  // Put this near your state declarations in NutritionPage.js
const weeklyData = [
  { date: "Mon", calories: 2000, protein: 120, carbs: 220, fats: 70 },
  { date: "Tue", calories: 2100, protein: 130, carbs: 200, fats: 65 },
  { date: "Wed", calories: 1900, protein: 110, carbs: 180, fats: 60 },
  { date: "Thu", calories: 2200, protein: 140, carbs: 230, fats: 80 },
  { date: "Fri", calories: 2000, protein: 125, carbs: 210, fats: 68 },
  { date: "Sat", calories: 1950, protein: 118, carbs: 190, fats: 62 },
  { date: "Sun", calories: 2050, protein: 135, carbs: 205, fats: 70 },
];

  if (type === "weekly") {
    doc.text("Weekly Summary:", 14, yPos); yPos += 7;

    weeklyData.forEach((day, index) => {
      doc.text(`Day ${index + 1} (${day.date}):`, 14, yPos); yPos += 6;
      doc.text(`- Calories: ${day.calories} kcal`, 20, yPos); yPos += 6;
      doc.text(`- Protein: ${day.protein} g`, 20, yPos); yPos += 6;
      doc.text(`- Carbs: ${day.carbs} g`, 20, yPos); yPos += 6;
      doc.text(`- Fats: ${day.fats} g`, 20, yPos); yPos += 8;
    });
  }

  // Save PDF
  const fileName = type === "weekly" ? "weekly-nutrition-report.pdf" : "daily-nutrition-report.pdf";
  doc.save(fileName);
};


  const ProgressBar = ({ percentage, nutrient }) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="font-medium">{nutrient}</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full" 
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: 
                percentage > 100 ? '#e74c3c' : 
                percentage > 90 ? '#f39c12' : '#2ecc71' 
            }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-[75px]">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Health & Nutrition Tracker</h1>
        <p className="text-gray-600">Calculate your BMI, BMR, and get personalized nutrition plans</p>
      </header>

      <div className="flex border-b mb-6">
        <div
          className={`py-2 px-4 cursor-pointer ${activeTab === "calculator" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("calculator")}
        >
          Calculator
        </div>
        <div
          className={`py-2 px-4 cursor-pointer ${activeTab === "food-log" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("food-log")}
        >
          Food Log
        </div>
        <div
          className={`py-2 px-4 cursor-pointer ${activeTab === "progress" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("progress")}
        >
          Daily Progress
        </div>
        <div
          className={`py-2 px-4 cursor-pointer ${activeTab === "report" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("report")}
        >
          Report
        </div>
        <div
          className={`py-2 px-4 cursor-pointer ${activeTab === "workout" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("workout")}
        >
          Workout Plan
        </div>
      </div>

      {/* Calculator Tab */}
      <div className={`${activeTab === "calculator" ? "block" : "hidden"}`}>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Gender</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="gender" 
                value={userData.gender} 
                onChange={handleInputChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Age (years)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" 
                name="age" 
                value={userData.age} 
                onChange={handleInputChange} 
                min="1" 
                max="120" 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Height (cm)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" 
                name="height" 
                value={userData.height} 
                onChange={handleInputChange} 
                min="50" 
                max="250" 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Weight (kg)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" 
                name="weight" 
                value={userData.weight} 
                onChange={handleInputChange} 
                min="10" 
                max="300" 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Activity Level</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="activityLevel" 
                value={userData.activityLevel} 
                onChange={handleInputChange}
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="active">Active (exercise 6-7 days/week)</option>
                <option value="extra">Extra Active (hard exercise daily)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Goal</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="goal" 
                value={userData.goal} 
                onChange={handleInputChange}
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight/Muscle</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Meals per Day</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="mealsPerDay" 
                value={userData.mealsPerDay} 
                onChange={handleInputChange}
              >
                <option value="3">3 meals</option>
                <option value="4">4 meals</option>
                <option value="5">5 meals</option>
                <option value="6">6 meals</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Dietary Preference</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="dietaryPreference" 
                value={userData.dietaryPreference} 
                onChange={handleInputChange}
              >
                <option value="balanced">Balanced</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="lowCarb">Low Carb</option>
                <option value="keto">Keto</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Allergies (optional)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text" 
                name="allergies" 
                value={userData.allergies} 
                onChange={handleInputChange} 
                placeholder="Nuts, dairy, gluten, etc." 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Health Conditions (optional)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text" 
                name="healthConditions" 
                value={userData.healthConditions} 
                onChange={handleInputChange} 
                placeholder="Diabetes, hypertension, etc." 
              />
            </div>
          </div>
        </div>
        
        {bmiResult && bmrResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Results & Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-lg">BMI: {bmiResult}</h3>
                <p className="text-gray-600">Category: {getBmiCategory(bmiResult)}</p>
                <button 
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => setShowTips(!showTips)}
                >
                  {showTips ? "Hide Tips" : "Show Health Tips"}
                </button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-lg">BMR: {bmrResult.bmr} calories</h3>
                <p className="text-gray-600">Basal Metabolic Rate</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-lg">TDEE: {bmrResult.tdee} calories</h3>
                <p className="text-gray-600">Total Daily Energy Expenditure</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-lg">Daily Target: {bmrResult.goalCalories} calories</h3>
                <p className="text-gray-600">To {userData.goal} weight</p>
              </div>
            </div>
            
            {showTips && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h3 className="font-semibold text-lg mb-2">Health Tips</h3>
                {bmiResult < 18.5 ? (
                  <ul className="list-disc pl-5">
                    <li>Focus on calorie-dense foods like nuts, avocados, and whole grains</li>
                    <li>Include protein with every meal to support muscle growth</li>
                    <li>Consider weight training to build muscle mass</li>
                    <li>Eat frequent, smaller meals if you have a small appetite</li>
                  </ul>
                ) : bmiResult < 25 ? (
                  <ul className="list-disc pl-5">
                    <li>Maintain your current healthy habits</li>
                    <li>Focus on a balanced diet with variety</li>
                    <li>Continue regular physical activity</li>
                    <li>Monitor your weight periodically to maintain your healthy range</li>
                  </ul>
                ) : bmiResult < 30 ? (
                  <ul className="list-disc pl-5">
                    <li>Focus on gradual weight loss of 0.5-1kg per week</li>
                    <li>Increase your daily physical activity</li>
                    <li>Reduce processed foods and sugary drinks</li>
                    <li>Include more fiber-rich foods in your diet</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-5">
                    <li>Consult with a healthcare provider for a personalized plan</li>
                    <li>Aim for gradual, sustainable weight loss</li>
                    <li>Focus on both diet and exercise changes</li>
                    <li>Consider working with a registered dietitian</li>
                  </ul>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Nutrition Plan</h3>
              {getDietPlan() && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Calories:</p>
                    <p>{getDietPlan().calories} kcal</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Protein:</p>
                    <p>{getDietPlan().protein} g</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Carbohydrates:</p>
                    <p>{getDietPlan().carbs} g</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Fats:</p>
                    <p>{getDietPlan().fats} g</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Meal Planning</h3>
              {getMealPlan() && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Meals per day:</p>
                    <p>{getMealPlan().meals}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Calories per meal:</p>
                    <p>~{getMealPlan().caloriesPerMeal} kcal</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Protein per meal:</p>
                    <p>~{getMealPlan().proteinPerMeal} g</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Fats per meal:</p>
                    <p>~{getMealPlan().fatsPerMeal} g</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Recommended Supplements</h3>
              <ul className="list-disc pl-5 columns-1 md:columns-2">
                {getSupplements().map((supplement, index) => (
                  <li key={index} className="mb-1">{supplement}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Meal Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Breakfast Ideas</h4>
                  <ul className="list-disc pl-5">
                    {getFoodSuggestions().breakfast.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Lunch Ideas</h4>
                  <ul className="list-disc pl-5">
                    {getFoodSuggestions().lunch.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Dinner Ideas</h4>
                  <ul className="list-disc pl-5">
                    {getFoodSuggestions().dinner.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Snack Ideas</h4>
                  <ul className="list-disc pl-5">
                    {getFoodSuggestions().snack.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              onClick={generateReport}
            >
              Download Full Report
            </button>
          </div>
        )}
      </div>
      
      {/* Food Log Tab */}
      <div className={`${activeTab === "food-log" ? "block" : "hidden"}`}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Log Your Food & Water</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Water Intake: {waterIntake} glasses</h3>
            <div className="flex gap-2">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                onClick={addWaterIntake}
              >
                + Add Glass
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                onClick={resetWaterIntake}
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Food Name</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text" 
                name="name" 
                value={newFood.name} 
                onChange={handleFoodInputChange} 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Meal Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="mealType" 
                value={newFood.mealType} 
                onChange={handleFoodInputChange}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Calories</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" 
                name="calories" 
                value={newFood.calories} 
                onChange={handleFoodInputChange} 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Protein (g)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" 
                name="protein" 
                value={newFood.protein} 
                onChange={handleFoodInputChange} 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Carbs (g)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" 
                name="carbs" 
                value={newFood.carbs} 
                onChange={handleFoodInputChange} 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Fats (g)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" 
                name="fats" 
                value={newFood.fats} 
                onChange={handleFoodInputChange} 
              />
            </div>
          </div>
          
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded mb-6"
            onClick={addFoodEntry}
          >
            Add Food Entry
          </button>
          
          <div className="food-log">
            <h3 className="text-lg font-semibold mb-4">Today's Food Intake</h3>
            {todayFood.length === 0 ? (
              <p className="text-gray-500">No food entries for today.</p>
            ) : (
              todayFood.map((food, index) => (
                <div key={index} className="flex justify-between items-center p-3 border-b border-gray-200">
                  <div>
                    <strong className="capitalize">{food.mealType}: {food.name}</strong>
                    <br />
                    <span className="text-sm text-gray-600">
                      {food.calories} kcal (P: {food.protein}g, C: {food.carbs}g, F: {food.fats}g)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{food.time}</span>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteFoodEntry(food.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Progress Tab */}
      <div className={`${activeTab === "progress" ? "block" : "hidden"}`}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Daily Progress</h2>
          <p className="text-gray-600 mb-6">Track your progress towards your daily nutrition goals</p>
          
          <div className="progress-tracker mb-8">
            <ProgressBar percentage={progress.calories} nutrient="Calories" />
            <ProgressBar percentage={progress.protein} nutrient="Protein" />
            <ProgressBar percentage={progress.carbs} nutrient="Carbs" />
            <ProgressBar percentage={progress.fats} nutrient="Fats" />
          </div>
          
          <div className="water-progress">
            <h3 className="font-medium mb-2">Water Intake: {waterIntake} glasses</h3>
            <div className="flex gap-2 mb-2">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full border-2 border-blue-400 flex items-center justify-center cursor-pointer ${
                    i < waterIntake ? 'bg-blue-400' : 'bg-white'
                  }`}
                  onClick={() => setWaterIntake(i + 1)}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-gray-600">Goal: 8 glasses per day</p>
          </div>
        </div>
      </div>
      
      {/* Report Tab */}
      <div className={`${activeTab === "report" ? "block" : "hidden"}`}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Generate Report</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to generate and download a comprehensive report
            of your health analysis and nutrition plan.
          </p>

          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            onClick={generateReport}
          >
            Download Full Report
          </button>
        </div>
      </div>

      {/* Workout Plan Tab */}
      <div className={`${activeTab === "workout" ? "block" : "hidden"}`}>
        <WorkoutPlanner reportText={reportText} />
      </div>
    </div>
  );
};

// Workout Planner Component
const WorkoutPlanner = ({ reportText }) => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock API response data for demonstration purposes.
  // In a real application, this would come from an AI service.
  const mockApiResponse = {
    "goal": "Fat Loss & Endurance Improvement",
    "introduction": "Based on your Health & Nutrition Report, your goal is to lose weight and improve overall fitness. This plan focuses on high-intensity workouts and steady-state cardio to maximize calorie expenditure while preserving muscle mass.",
    "schedule": [
      {
        "day": "Day 1: Full-Body Strength & HIIT",
        "focus": "Building muscle and burning fat simultaneously.",
        "exercises": [
          {
            "name": "Barbell Squats",
            "sets": "3-4",
            "reps": "8-12",
            "notes": "Focus on form. If you're new, use lighter weights or dumbbells."
          },
          {
            "name": "Push-Ups",
            "sets": "3",
            "reps": "As many as possible",
            "notes": "Modify on your knees if needed."
          },
          {
            "name": "Dumbbell Rows",
            "sets": "3",
            "reps": "10-15 (per arm)",
            "notes": "Keep your back straight and core engaged."
          },
          {
            "name": "Plank",
            "sets": "3",
            "reps": "Hold for 30-60 seconds",
            "notes": "Maintain a straight line from head to heels."
          },
          {
            "name": "HIIT: Burpees",
            "sets": "4",
            "reps": "30s on, 30s off",
            "notes": "Go all-out for the 30 seconds."
          }
        ]
      },
      {
        "day": "Day 2: Steady-State Cardio",
        "focus": "Improving cardiovascular health and burning calories.",
        "exercises": [
          {
            "name": "Jogging/Running",
            "sets": "1",
            "reps": "30-45 minutes",
            "notes": "Maintain a consistent pace where you can still hold a conversation."
          }
        ]
      },
      {
        "day": "Day 3: Rest & Recovery",
        "focus": "Allowing muscles to repair and grow.",
        "exercises": [
          {
            "name": "Active Recovery",
            "sets": "N/A",
            "reps": "15-20 minutes",
            "notes": "Light stretching, walking, or foam rolling."
          }
        ]
      },
      {
        "day": "Day 4: Upper-Body Strength",
        "focus": "Targeting chest, back, and arms.",
        "exercises": [
          {
            "name": "Overhead Press",
            "sets": "3",
            "reps": "8-12",
            "notes": "Start with a lighter weight to protect your shoulders."
          },
          {
            "name": "Pull-Ups (or Lat Pulldowns)",
            "sets": "3",
            "reps": "As many as possible",
            "notes": "Focus on squeezing your back muscles."
          },
          {
            "name": "Bicep Curls",
            "sets": "3",
            "reps": "10-15",
            "notes": "Keep your elbows tucked into your sides."
          },
          {
            "name": "Tricep Dips",
            "sets": "3",
            "reps": "8-12",
            "notes": "Can be done on a bench or chair."
          }
        ]
      },
      {
        "day": "Day 5: Lower-Body Strength & Core",
        "focus": "Building strength in your legs and core.",
        "exercises": [
          {
            "name": "Deadlifts",
            "sets": "3-4",
            "reps": "6-10",
            "notes": "Ensure proper form to avoid injury. Watch a tutorial if you are new."
          },
          {
            "name": "Lunges",
            "sets": "3",
            "reps": "10-15 (per leg)",
            "notes": "Step forward and lower until both knees are at a 90-degree angle."
          },
          {
            "name": "Leg Press",
            "sets": "3",
            "reps": "12-15",
            "notes": "Machine exercise, great for targeting quads and glutes."
          },
          {
            "name": "Russian Twists",
            "sets": "3",
            "reps": "15-20 (per side)",
            "notes": "Twist from your torso, not just your arms."
          }
        ]
      },
      {
        "day": "Day 6: HIIT & Optional Cardio",
        "focus": "Another high-intensity day to burn fat.",
        "exercises": [
          {
            "name": "Sprints",
            "sets": "8",
            "reps": "100m sprint, 1-min walk",
            "notes": "Find an open area or use a treadmill. Go all-out on the sprints."
          },
          {
            "name": "Kettlebell Swings",
            "sets": "3",
            "reps": "15-20",
            "notes": "Drive the movement with your hips."
          },
          {
            "name": "Mountain Climbers",
            "sets": "3",
            "reps": "45s on, 15s off",
            "notes": "Keep your core tight and don't let your hips sag."
          }
        ]
      },
      {
        "day": "Day 7: Rest & Recovery",
        "focus": "Full recovery to prepare for the next week.",
        "exercises": [
          {
            "name": "Light Walk",
            "sets": "1",
            "reps": "30 minutes",
            "notes": "A low-impact activity to aid in recovery."
          }
        ]
      }
    ],
    "additional_notes": "Remember to listen to your body and adjust the plan as needed. Stay hydrated and be consistent with your diet. Warm up with 5-10 minutes of light cardio and cool down with static stretching after each workout."
  };

  const handleGeneratePlan = () => {
    if (!reportText.trim()) {
      setError('Please generate a health report first by clicking "Download Full Report" in the Calculator tab.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate an API call with a delay
    setTimeout(() => {
      try {
        // In a real application, you would send reportText to an AI API.
        setWorkoutPlan(mockApiResponse);
      } catch (err) {
        console.error('API call failed:', err);
        setError('Failed to generate plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 2000); // Simulate a 2-second API response time
  };


const handleDownloadPDF = () => {
  if (!workoutPlan) {
    return;
  }

  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(22);
  doc.text('AI-Generated Workout Plan', 14, yPos);
  yPos += 10;

  doc.setFontSize(16);
  doc.text(`Fitness Goal: ${workoutPlan.goal}`, 14, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(workoutPlan.introduction, 180), 14, yPos);
  yPos += doc.splitTextToSize(workoutPlan.introduction, 180).length * 5 + 5;

  workoutPlan.schedule.forEach(dayPlan => {
    doc.setFontSize(14);
    doc.text(dayPlan.day, 14, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.text(`Focus: ${dayPlan.focus}`, 14, yPos);
    yPos += 5;

    dayPlan.exercises.forEach(exercise => {
      const exerciseText = `• ${exercise.name} (Sets: ${exercise.sets}, Reps: ${exercise.reps}) - ${exercise.notes}`;
      doc.text(doc.splitTextToSize(exerciseText, 180), 20, yPos);
      yPos += doc.splitTextToSize(exerciseText, 180).length * 4 + 2;
    });
    yPos += 5;
  });

  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(`Notes: ${workoutPlan.additional_notes}`, 180), 14, yPos);
  doc.save('workout-plan.pdf');
};


  return (
    <>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">AI Workout Planner</h2>
        <p className="text-gray-600 mb-6">Generate a personalized workout plan based on your health report analysis.</p>
        
        <div className="mb-6">
          <label htmlFor="report-input" className="block text-lg font-medium mb-2 text-gray-700">
            Your Health Report:
          </label>
          <textarea
            id="report-input"
            rows="8"
            className="w-full p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
            value={reportText}
            readOnly
          ></textarea>
          <p className="text-sm text-gray-500 mt-2">
            To generate a workout plan, first create a health report in the Calculator tab.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center font-medium">
            {error}
          </div>
        )}
        
        <button
          onClick={handleGeneratePlan}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !reportText}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Plan...
            </div>
          ) : (
            'Generate Workout Plan'
          )}
        </button>

        {workoutPlan && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b border-gray-300 pb-4">
              <h2 className="text-2xl font-bold text-green-600 mb-2 sm:mb-0">Your Personalized Workout Plan</h2>
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v7.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L10 10.586V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Download PDF
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-xl font-semibold text-blue-600 mb-2">Goal: {workoutPlan.goal}</p>
              <p className="text-gray-700 leading-relaxed">{workoutPlan.introduction}</p>
            </div>
            
            <div className="space-y-6">
              {workoutPlan.schedule.map((dayPlan, index) => (
                <div key={index} className="bg-gray-100 p-5 rounded-lg shadow-md border border-gray-300">
                  <h3 className="text-xl font-bold mb-2 text-yellow-600">{dayPlan.day}</h3>
                  <p className="text-gray-600 mb-4">{dayPlan.focus}</p>
                  
                  <ul className="space-y-4">
                    {dayPlan.exercises.map((exercise, exerciseIndex) => (
                      <li key={exerciseIndex} className="bg-white p-4 rounded-md border border-gray-300">
                        <p className="font-semibold text-lg text-gray-800">{exercise.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-bold">Sets:</span> {exercise.sets} | <span className="font-bold">Reps:</span> {exercise.reps}
                        </p>
                        <p className="text-sm italic text-gray-500 mt-1">{exercise.notes}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-sm italic text-center mt-6 text-gray-500">{workoutPlan.additional_notes}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HealthTracker;