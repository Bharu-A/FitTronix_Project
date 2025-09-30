import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import WorkoutPage from '../pages/WorkoutPage';

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
  const [validationErrors, setValidationErrors] = useState({});
  const [editingFoodId, setEditingFoodId] = useState(null);

  // Memoized calculations for better performance
  const todayFood = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return foodLog.filter(entry => entry.date === today);
  }, [foodLog]);

  const dietPlan = useMemo(() => {
    if (!bmrResult) return null;
    const calories = parseInt(bmrResult.goalCalories);
    const protein = Math.round(calories * 0.3 / 4);
    const carbs = Math.round(calories * 0.4 / 4);
    const fats = Math.round(calories * 0.3 / 9);
    return { calories, protein, carbs, fats };
  }, [bmrResult]);

  const mealPlan = useMemo(() => {
    if (!dietPlan || !userData.mealsPerDay) return null;
    const meals = parseInt(userData.mealsPerDay);
    return {
      meals,
      caloriesPerMeal: Math.round(dietPlan.calories / meals),
      proteinPerMeal: Math.round(dietPlan.protein / meals),
      carbsPerMeal: Math.round(dietPlan.carbs / meals),
      fatsPerMeal: Math.round(dietPlan.fats / meals)
    };
  }, [dietPlan, userData.mealsPerDay]);

  // Load & save data in localStorage
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

  // Calculate progress
  useEffect(() => {
    if (bmrResult && todayFood.length > 0) {
      const totalCalories = todayFood.reduce((sum, food) => sum + parseInt(food.calories || 0), 0);
      const totalProtein = todayFood.reduce((sum, food) => sum + parseInt(food.protein || 0), 0);
      const totalCarbs = todayFood.reduce((sum, food) => sum + parseInt(food.carbs || 0), 0);
      const totalFats = todayFood.reduce((sum, food) => sum + parseInt(food.fats || 0), 0);
      
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
  }, [todayFood, bmrResult]);

  // Form validation
  const validateForm = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'age':
        if (value < 1 || value > 120) {
          errors.age = 'Age must be between 1 and 120';
        } else {
          delete errors.age;
        }
        break;
      case 'height':
        if (value < 50 || value > 250) {
          errors.height = 'Height must be between 50 and 250 cm';
        } else {
          delete errors.height;
        }
        break;
      case 'weight':
        if (value < 10 || value > 300) {
          errors.weight = 'Weight must be between 10 and 300 kg';
        } else {
          delete errors.weight;
        }
        break;
      case 'calories':
        if (value < 0 || value > 5000) {
          errors.calories = 'Calories must be reasonable (0-5000)';
        } else {
          delete errors.calories;
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
    validateForm(name, value);
  };

  const calculateBMI = () => {
    const heightInMeters = userData.height / 100;
    const bmi = userData.weight / (heightInMeters * heightInMeters);
    setBmiResult(bmi.toFixed(1));
  };

  const calculateBMR = () => {
    let bmr;
    if (userData.gender === "male") {
      bmr = 88.362 + 13.397 * userData.weight + 4.799 * userData.height - 5.677 * userData.age;
    } else {
      bmr = 447.593 + 9.247 * userData.weight + 3.098 * userData.height - 4.33 * userData.age;
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
    validateForm(name, value);
  };

  const addFoodEntry = () => {
    if (!newFood.name.trim()) {
      setValidationErrors({...validationErrors, foodName: 'Food name is required'});
      return;
    }
    
    if (!newFood.calories || newFood.calories <= 0) {
      setValidationErrors({...validationErrors, calories: 'Calories must be positive'});
      return;
    }

    const entry = {
      ...newFood,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: editingFoodId || Date.now()
    };

    if (editingFoodId) {
      // Update existing entry
      setFoodLog(foodLog.map(item => item.id === editingFoodId ? entry : item));
      setEditingFoodId(null);
    } else {
      // Add new entry
      setFoodLog([...foodLog, entry]);
    }

    setNewFood({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      mealType: "breakfast"
    });
    setValidationErrors({});
  };

  const editFoodEntry = (food) => {
    setNewFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      mealType: food.mealType
    });
    setEditingFoodId(food.id);
  };

  const cancelEdit = () => {
    setNewFood({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      mealType: "breakfast"
    });
    setEditingFoodId(null);
    setValidationErrors({});
  };

  const addWaterIntake = () => {
    if (waterIntake < 20) { // Reasonable upper limit
      setWaterIntake(prev => prev + 1);
    }
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

  const getSupplements = () => {
    const baseSupplements = ["Multivitamin", "Vitamin D", "Omega-3 Fish Oil"];

    if (userData.goal === "lose") {
      return [...baseSupplements, "Green Tea Extract", "CLA", "Fiber Supplement"];
    } else if (userData.goal === "gain") {
      return [...baseSupplements, "Creatine", "Whey Protein", "BCAAs", "L-Glutamine"];
    }

    return baseSupplements;
  };

  const getFoodSuggestions = () => {
    return {
      breakfast: ["Oatmeal with berries", "Greek yogurt with nuts", "Eggs with whole grain toast", "Smoothie with protein powder"],
      lunch: ["Grilled chicken salad", "Quinoa bowl with vegetables", "Turkey wrap", "Lentil soup"],
      dinner: ["Salmon with roasted vegetables", "Lean steak with sweet potato", "Tofu stir-fry", "Chicken and vegetable skewers"],
      snack: ["Apple with peanut butter", "Handful of almonds", "Protein bar", "Greek yogurt"]
    };
  };

  const generateReport = (type = "daily") => {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text(type === "weekly" ? "WEEKLY HEALTH & NUTRITION REPORT" : "DAILY HEALTH & NUTRITION REPORT", 14, yPos);
    yPos += 15;

    // Personal Information Table
    doc.setFontSize(14);
    doc.text("Personal Information", 14, yPos);
    yPos += 8;

    const personalInfo = [
      ["Gender", userData.gender],
      ["Age", `${userData.age} years`],
      ["Height", `${userData.height} cm`],
      ["Weight", `${userData.weight} kg`],
      ["Activity Level", userData.activityLevel],
      ["Goal", userData.goal],
      ["Meals per day", userData.mealsPerDay],
      ["Dietary Preference", userData.dietaryPreference]
    ];

    doc.autoTable({
      startY: yPos,
      head: [['Field', 'Value']],
      body: personalInfo,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Results Section
    doc.setFontSize(14);
    doc.text("Health Analysis", 14, yPos);
    yPos += 8;

    const healthResults = [
      ["BMI", `${bmiResult} (${getBmiCategory(bmiResult)})`],
      ["BMR", `${bmrResult.bmr} calories`],
      ["TDEE", `${bmrResult.tdee} calories`],
      ["Daily Calorie Target", `${bmrResult.goalCalories} calories`]
    ];

    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: healthResults,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
      styles: { fontSize: 10 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Nutrition Plan Table
    doc.setFontSize(14);
    doc.text("Nutrition Plan", 14, yPos);
    yPos += 8;

    const nutritionData = [
      ["Calories", `${dietPlan.calories} kcal`],
      ["Protein", `${dietPlan.protein} g`],
      ["Carbohydrates", `${dietPlan.carbs} g`],
      ["Fats", `${dietPlan.fats} g`]
    ];

    doc.autoTable({
      startY: yPos,
      head: [['Nutrient', 'Daily Target']],
      body: nutritionData,
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] },
      styles: { fontSize: 10 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    if (type === "daily") {
      // Today's Food Intake Table
      doc.setFontSize(14);
      doc.text("Today's Food Intake", 14, yPos);
      yPos += 8;

      if (todayFood.length > 0) {
        const foodData = todayFood.map(food => [
          food.mealType,
          food.name,
          `${food.calories} kcal`,
          `${food.protein}g`,
          `${food.carbs}g`,
          `${food.fats}g`
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Meal', 'Food', 'Calories', 'Protein', 'Carbs', 'Fats']],
          body: foodData,
          theme: 'grid',
          headStyles: { fillColor: [230, 126, 34] },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 60 },
            2: { cellWidth: 25 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 }
          }
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Progress Section
      doc.setFontSize(14);
      doc.text("Daily Progress", 14, yPos);
      yPos += 8;

      const progressData = [
        ["Calories", `${progress.calories}%`],
        ["Protein", `${progress.protein}%`],
        ["Carbohydrates", `${progress.carbs}%`],
        ["Fats", `${progress.fats}%`],
        ["Water Intake", `${waterIntake}/8 glasses`]
      ];

      doc.autoTable({
        startY: yPos,
        head: [['Nutrient', 'Progress']],
        body: progressData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 10 }
      });
    }

    // Add page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }

    const fileName = type === "weekly" ? "weekly-nutrition-report.pdf" : "daily-nutrition-report.pdf";
    doc.save(fileName);
  };

  const ProgressBar = ({ percentage, nutrient, goal }) => {
    const getColor = (percent) => {
      if (percent > 100) return '#e74c3c';
      if (percent > 90) return '#f39c12';
      if (percent > 70) return '#2ecc71';
      return '#3498db';
    };

    const getMessage = (percent, nutrient) => {
      if (percent > 100) return `Over ${nutrient} goal!`;
      if (percent > 90) return `Almost at ${nutrient} goal`;
      if (percent > 70) return `Good progress on ${nutrient}`;
      return `Keep going with ${nutrient}`;
    };

    return (
  <motion.div 
    className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 "
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex justify-between mb-2 ">
      <span className="font-medium text-gray-700">{nutrient}</span>
      <div className="text-right">
        <span className="font-semibold">{percentage}%</span>
        <div className="text-xs text-gray-500">
          {getMessage(percentage, nutrient.toLowerCase())}
        </div>
      </div>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-3">
      <motion.div 
        className="h-3 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Number(percentage), 100)}%` }}
        style={{ backgroundColor: getColor(Number(percentage)) }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
    </div>

    {goal && (
      <div className="text-xs text-gray-500 mt-1">Goal: {goal}</div>
    )}
  </motion.div>
);

  };

  const TabButton = ({ tab, children }) => (
    <motion.button
      className={`py-3 px-6 cursor-pointer font-medium transition-all duration-300 ${
        activeTab === tab 
          ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
      onClick={() => setActiveTab(tab)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-[95px]">
      <motion.header 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Health & Nutrition Tracker</h1>
        <p className="text-gray-600 text-lg">Calculate your BMI, BMR, and get personalized nutrition plans</p>
      </motion.header>

      <div className="flex border-b mb-6 bg-white rounded-t-lg shadow-sm overflow-x-auto">
        <TabButton tab="calculator">Calculator</TabButton>
        <TabButton tab="food-log">Food Log</TabButton>
        <TabButton tab="progress">Daily Progress</TabButton>
        <TabButton tab="report">Report</TabButton>
        <TabButton tab="workout">Workout Plan</TabButton>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Calculator Tab */}
          {activeTab === "calculator" && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Gender", name: "gender", type: "select", options: ["male", "female"] },
                    { label: "Age (years)", name: "age", type: "number", min: 1, max: 120 },
                    { label: "Height (cm)", name: "height", type: "number", min: 50, max: 250 },
                    { label: "Weight (kg)", name: "weight", type: "number", min: 10, max: 300 },
                    { label: "Activity Level", name: "activityLevel", type: "select", options: ["sedentary", "light", "moderate", "active", "extra"] },
                    { label: "Goal", name: "goal", type: "select", options: ["lose", "maintain", "gain"] },
                    { label: "Meals per Day", name: "mealsPerDay", type: "select", options: ["3", "4", "5", "6"] },
                    { label: "Dietary Preference", name: "dietaryPreference", type: "select", options: ["balanced", "vegetarian", "vegan", "lowCarb", "keto"] },
                    { label: "Allergies (optional)", name: "allergies", type: "text", placeholder: "Nuts, dairy, gluten, etc." },
                    { label: "Health Conditions (optional)", name: "healthConditions", type: "text", placeholder: "Diabetes, hypertension, etc." }
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      className="mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block text-gray-700 mb-2 font-medium">{field.label}</label>
                      {field.type === "select" ? (
                        <select 
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            validationErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          name={field.name}
                          value={userData[field.name]}
                          onChange={handleInputChange}
                        >
                          {field.options.map(option => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            validationErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          type={field.type}
                          name={field.name}
                          value={userData[field.name]}
                          onChange={handleInputChange}
                          min={field.min}
                          max={field.max}
                          placeholder={field.placeholder}
                        />
                      )}
                      {validationErrors[field.name] && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors[field.name]}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              
            </div>
          )}

          {/* Other tabs remain similar but with enhanced components */}
          {/* Food Log Tab */}
          {activeTab === "food-log" && (
            <FoodLogTab
              waterIntake={waterIntake}
              addWaterIntake={addWaterIntake}
              resetWaterIntake={resetWaterIntake}
              newFood={newFood}
              handleFoodInputChange={handleFoodInputChange}
              addFoodEntry={addFoodEntry}
              todayFood={todayFood}
              deleteFoodEntry={deleteFoodEntry}
              editFoodEntry={editFoodEntry}
              editingFoodId={editingFoodId}
              cancelEdit={cancelEdit}
              validationErrors={validationErrors}
            />
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <ProgressTab
              progress={progress}
              waterIntake={waterIntake}
              setWaterIntake={setWaterIntake}
              dietPlan={dietPlan}
            />
          )}

          {/* Report Tab */}
          {activeTab === "report" && (
            <ReportTab generateReport={generateReport} />
          )}

          {/* Workout Plan Tab */}
          {activeTab === "workout" && (
            <WorkoutPage reportText={reportText} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Enhanced ProgressTab component
const ProgressTab = ({ progress, waterIntake, setWaterIntake, dietPlan }) => {
  const waterPercentage = Math.min(100, (waterIntake / 8) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">Daily Progress</h2>
      <p className="text-gray-600 mb-8">Track your progress towards your daily nutrition goals</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-700">Nutrition Progress</h3>
          <ProgressBar percentage={progress.calories} nutrient="Calories" goal={`${dietPlan?.calories} kcal`} />
          <ProgressBar percentage={progress.protein} nutrient="Protein" goal={`${dietPlan?.protein} g`} />
          <ProgressBar percentage={progress.carbs} nutrient="Carbohydrates" goal={`${dietPlan?.carbs} g`} />
          <ProgressBar percentage={progress.fats} nutrient="Fats" goal={`${dietPlan?.fats} g`} />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-700">Hydration</h3>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{waterIntake}/8</div>
              <div className="text-blue-700 font-medium">Glasses Today</div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-blue-800">Water Intake</span>
                <span className="font-semibold text-blue-700">{waterPercentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-4">
                <motion.div 
                  className="h-4 rounded-full bg-blue-500 transition-all duration-1000 ease-out"
                  initial={{ width: 0 }}
                  animate={{ width: `${waterPercentage}%` }}
                ></motion.div>
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-2 mb-4">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-blue-400 flex items-center justify-center cursor-pointer transition-all ${
                    i < waterIntake 
                      ? 'bg-blue-400 text-white scale-110' 
                      : 'bg-white text-blue-400 hover:bg-blue-100'
                  }`}
                  onClick={() => setWaterIntake(i + 1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            
            <div className="text-center text-blue-600 text-sm">
              {waterIntake >= 8 ? '🎉 Great job! You reached your water goal!' : 'Goal: 8 glasses per day'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced FoodLogTab component
const FoodLogTab = ({
  waterIntake, addWaterIntake, resetWaterIntake, newFood, handleFoodInputChange,
  addFoodEntry, todayFood, deleteFoodEntry, editFoodEntry, editingFoodId, cancelEdit, validationErrors
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Log Your Food & Water</h2>
      
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-lg mb-3 text-blue-800">Water Intake: {waterIntake} glasses</h3>
        <div className="flex gap-3">
          <motion.button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium shadow-md"
            onClick={addWaterIntake}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={waterIntake >= 20}
          >
            + Add Glass
          </motion.button>
          <motion.button 
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium shadow-md"
            onClick={resetWaterIntake}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset
          </motion.button>
        </div>
        {waterIntake > 12 && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-700 text-sm">
            💡 You're drinking a lot of water! Make sure to space it out throughout the day.
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Food Name", name: "name", type: "text" },
          { label: "Meal Type", name: "mealType", type: "select", options: ["breakfast", "lunch", "dinner", "snack"] },
          { label: "Calories", name: "calories", type: "number" },
          { label: "Protein (g)", name: "protein", type: "number" },
          { label: "Carbs (g)", name: "carbs", type: "number" },
          { label: "Fats (g)", name: "fats", type: "number" }
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">{field.label}</label>
            {field.type === "select" ? (
              <select 
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                }`}
                name={field.name}
                value={newFood[field.name]}
                onChange={handleFoodInputChange}
              >
                {field.options.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <input 
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                }`}
                type={field.type}
                name={field.name}
                value={newFood[field.name]}
                onChange={handleFoodInputChange}
                placeholder={field.placeholder}
              />
            )}
            {validationErrors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{validationErrors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex gap-3 mb-8">
        <motion.button 
          className={`py-2 px-6 rounded-lg font-medium shadow-md ${
            editingFoodId 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          onClick={addFoodEntry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {editingFoodId ? 'Update Food Entry' : 'Add Food Entry'}
        </motion.button>
        
        {editingFoodId && (
          <motion.button 
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium shadow-md"
            onClick={cancelEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel Edit
          </motion.button>
        )}
      </div>
      
      <div className="food-log">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Today's Food Intake</h3>
        {todayFood.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2">🍽️</div>
            <p>No food entries for today.</p>
            <p className="text-sm">Start by adding your first food entry above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayFood.map((food) => (
              <motion.div
                key={food.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                whileHover={{ scale: 1.01 }}
                layout
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="capitalize font-semibold text-gray-800">{food.mealType}</span>
                    <span className="text-lg font-bold text-gray-900">{food.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{food.calories} kcal</span>
                    <span className="mx-2">•</span>
                    <span>P: {food.protein || 0}g</span>
                    <span className="mx-2">•</span>
                    <span>C: {food.carbs || 0}g</span>
                    <span className="mx-2">•</span>
                    <span>F: {food.fats || 0}g</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{food.time}</span>
                  <div className="flex gap-2">
                    <motion.button
                      className="text-blue-500 hover:text-blue-700 p-1"
                      onClick={() => editFoodEntry(food)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✏️
                    </motion.button>
                    <motion.button
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => deleteFoodEntry(food.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🗑️
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced ReportTab component
const ReportTab = ({ generateReport }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">Generate Report</h2>
      <p className="text-gray-600 mb-8">
        Create comprehensive reports of your health analysis and nutrition plan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200 text-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-3 text-blue-800">Daily Report</h3>
          <p className="text-gray-600 mb-4">Get a detailed overview of your daily progress and nutrition intake.</p>
          <motion.button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md"
            onClick={() => generateReport("daily")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download Daily Report
          </motion.button>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200 text-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-3 text-green-800">Weekly Report</h3>
          <p className="text-gray-600 mb-4">View your weekly trends and progress summary (sample data).</p>
          <motion.button 
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-md"
            onClick={() => generateReport("weekly")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download Weekly Report
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Keep the existing ResultsSection and WorkoutPlanner components (enhanced versions would follow similar patterns)

export default HealthTracker;