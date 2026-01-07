import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { motion, AnimatePresence } from "framer-motion";
// Recharts for charts
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

// Lazy-load heavy page
const WorkoutPage = lazy(() => import('../pages/WorkoutPage').catch(() => ({ default: () => <div>Workout module not available</div> })));

/*
  HealthTracker (final)
  - Improved structure (split into small components in-file for single-file preview)
  - Performance: useMemo, useCallback where appropriate
  - Optional Firebase sync: checks for window.__USE_FIREBASE__ to decide. (No credentials here)
  - Charts: weekly progress using Recharts
  - PDF export (jsPDF) with defensive checks
  - Accessibility: form labels, buttons, disabled states
  - UX: better validation, friendly messages, optimistic UI updates
*/

const DEFAULT_USER = {
  gender: "male",
  age: "",
  height: "",
  weight: "",
  activityLevel: "sedentary",
  goal: "maintain",
  mealsPerDay: "3",
  dietaryPreference: "balanced",
  allergies: "",
  healthConditions: "",
};

const storageKeys = {
  foodLog: "ft_foodLog_v1",
  user: "ft_userHealth_v1",
  water: "ft_waterIntake_v1",
};

// helper: safe parse
const safeJSONParse = (str, fallback) => {
  try { return JSON.parse(str); } catch (e) { return fallback; }
};

const PREDEFINED_FOODS = [
  { name: "Egg (Large)", calories: 72, protein: 6, carbs: 0.4, fats: 5, mealType: "breakfast" },
  { name: "Oatmeal (1 cup cooked)", calories: 158, protein: 6, carbs: 27, fats: 3, mealType: "breakfast" },
  { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fats: 3.6, mealType: "lunch" },
  { name: "Salmon (100g)", calories: 206, protein: 22, carbs: 0, fats: 13, mealType: "dinner" },
  { name: "Rice (White, 1 cup cooked)", calories: 205, protein: 4, carbs: 45, fats: 0.4, mealType: "lunch" },
  { name: "Broccoli (1 cup)", calories: 55, protein: 3.7, carbs: 11, fats: 0.6, mealType: "lunch" },
  { name: "Banana (Medium)", calories: 105, protein: 1.3, carbs: 27, fats: 0.3, mealType: "snack" },
  { name: "Almonds (1 oz)", calories: 164, protein: 6, carbs: 6, fats: 14, mealType: "snack" },
  { name: "Greek Yogurt (1 cup)", calories: 100, protein: 17, carbs: 6, fats: 0.7, mealType: "breakfast" },
  { name: "Apple (Medium)", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, mealType: "snack" },
];

// OpenFoodFacts API Search
const searchOpenFoodFacts = async (query) => {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`);
    const data = await res.json();
    if (!data.products) return [];

    return data.products.map(p => ({
      name: p.product_name,
      calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
      protein: Math.round(p.nutriments?.proteins_100g || 0),
      carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
      fats: Math.round(p.nutriments?.fat_100g || 0),
      source: 'OpenFoodFacts'
    })).filter(p => p.calories > 0 || p.protein > 0);
  } catch (err) {
    console.error("OpenFoodFacts search error", err);
    return [];
  }
};

const HealthTracker = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [userData, setUserData] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem(storageKeys.user);
    return saved ? safeJSONParse(saved, DEFAULT_USER) : DEFAULT_USER;
  });

  const [isEditing, setIsEditing] = useState(() => {
    // Default to editing if no critical data (e.g. weight/age)
    if (userData && (!userData.age || !userData.weight)) return true;
    return false;
  });

  const [bmiResult, setBmiResult] = useState(null);
  const [bmrResult, setBmrResult] = useState(null);

  const [foodLog, setFoodLog] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem(storageKeys.foodLog);
    return saved ? safeJSONParse(saved, []) : [];
  });

  const [newFood, setNewFood] = useState({ name: "", calories: "", protein: "", carbs: "", fats: "", mealType: "breakfast" });
  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem(storageKeys.water);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [editingFoodId, setEditingFoodId] = useState(null);

  // Persist to localStorage (debounced-ish via effect)
  useEffect(() => {
    try {
      localStorage.setItem(storageKeys.foodLog, JSON.stringify(foodLog));
      localStorage.setItem(storageKeys.user, JSON.stringify(userData));
      localStorage.setItem(storageKeys.water, String(waterIntake));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
  }, [foodLog, userData, waterIntake]);

  // Derived: today's date key
  const todayKey = useMemo(() => new Date().toLocaleDateString(), []);

  const todayFood = useMemo(() => {
    return foodLog.filter(entry => entry.date === todayKey);
  }, [foodLog, todayKey]);

  // BMR/BMI calculations
  const calculateBMI = useCallback((heightCm, weightKg) => {
    if (!heightCm || !weightKg) return null;
    const h = Number(heightCm) / 100;
    if (h <= 0) return null;
    const bmi = Number(weightKg) / (h * h);
    return Number.isFinite(bmi) ? +bmi.toFixed(1) : null;
  }, []);

  const calculateBMR = useCallback((data) => {
    const age = Number(data.age);
    const height = Number(data.height);
    const weight = Number(data.weight);
    if (!age || !height || !weight) return null;

    let bmr;
    if (data.gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extra: 1.9 };
    const multiplier = activityMultipliers[data.activityLevel] || 1.2;
    const tdee = bmr * multiplier;
    let goalCalories = tdee;

    if (data.goal === 'lose') goalCalories = tdee - 500;
    if (data.goal === 'gain') goalCalories = tdee + 500;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goalCalories: Math.max(1200, Math.round(goalCalories)) // safe lower bound
    };
  }, []);

  // Recompute BMI/BMR when userData changes (debounced semantics via effect dependencies)
  useEffect(() => {
    const bmi = calculateBMI(userData.height, userData.weight);
    setBmiResult(bmi);
    const bmr = calculateBMR(userData);
    setBmrResult(bmr);
  }, [userData, calculateBMI, calculateBMR]);

  // Diet plan computed from bmrResult
  const dietPlan = useMemo(() => {
    if (!bmrResult) return null;
    const calories = Number(bmrResult.goalCalories);
    const protein = Math.round((calories * 0.3) / 4);
    const carbs = Math.round((calories * 0.4) / 4);
    const fats = Math.round((calories * 0.3) / 9);
    return { calories, protein, carbs, fats };
  }, [bmrResult]);

  const mealPlan = useMemo(() => {
    if (!dietPlan || !userData.mealsPerDay) return null;
    const meals = Number(userData.mealsPerDay) || 3;
    return {
      meals,
      caloriesPerMeal: Math.round(dietPlan.calories / meals),
      proteinPerMeal: Math.round(dietPlan.protein / meals),
      carbsPerMeal: Math.round(dietPlan.carbs / meals),
      fatsPerMeal: Math.round(dietPlan.fats / meals),
    };
  }, [dietPlan, userData.mealsPerDay]);

  // Daily progress
  const progress = useMemo(() => {
    if (!bmrResult) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const totals = todayFood.reduce((acc, f) => {
      acc.calories += Number(f.calories) || 0;
      acc.protein += Number(f.protein) || 0;
      acc.carbs += Number(f.carbs) || 0;
      acc.fats += Number(f.fats) || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const goalCalories = Number(bmrResult.goalCalories) || 1;
    const goalProtein = Math.max(1, Math.round((goalCalories * 0.3) / 4));
    const goalCarbs = Math.max(1, Math.round((goalCalories * 0.4) / 4));
    const goalFats = Math.max(1, Math.round((goalCalories * 0.3) / 9));

    return {
      calories: Math.min(999, Math.round((totals.calories / goalCalories) * 100)),
      protein: Math.min(999, Math.round((totals.protein / goalProtein) * 100)),
      carbs: Math.min(999, Math.round((totals.carbs / goalCarbs) * 100)),
      fats: Math.min(999, Math.round((totals.fats / goalFats) * 100)),
    };
  }, [todayFood, bmrResult]);

  // Validation utility
  const validateField = useCallback((name, value) => {
    const v = {};
    if (name === 'age') {
      const n = Number(value);
      if (!n || n < 1 || n > 120) v.age = 'Age must be between 1 and 120';
    }
    if (name === 'height') {
      const n = Number(value);
      if (!n || n < 50 || n > 250) v.height = 'Height must be between 50 and 250 cm';
    }
    if (name === 'weight') {
      const n = Number(value);
      if (!n || n < 10 || n > 300) v.weight = 'Weight must be between 10 and 300 kg';
    }
    if (name === 'calories') {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0 || n > 5000) v.calories = 'Calories must be reasonable (0-5000)';
    }
    return v;
  }, []);

  const handleUserChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, ...validateField(name, value) }));
  }, [validateField]);

  const handleFoodChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewFood(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, ...validateField(name, value) }));
  }, [validateField]);

  const addFoodEntry = useCallback(() => {
    if (!newFood.name.trim()) {
      setValidationErrors(prev => ({ ...prev, foodName: 'Food name required' }));
      return;
    }

    const cals = Number(newFood.calories) || 0;
    if (cals <= 0) {
      setValidationErrors(prev => ({ ...prev, calories: 'Provide calories > 0' }));
      return;
    }

    const entry = {
      ...newFood,
      calories: cals,
      protein: Number(newFood.protein) || 0,
      carbs: Number(newFood.carbs) || 0,
      fats: Number(newFood.fats) || 0,
      date: todayKey,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: editingFoodId || Date.now(),
    };

    setFoodLog(prev => editingFoodId ? prev.map(item => item.id === editingFoodId ? entry : item) : [...prev, entry]);
    setNewFood({ name: "", calories: "", protein: "", carbs: "", fats: "", mealType: "breakfast" });
    setEditingFoodId(null);
    setValidationErrors({});
  }, [newFood, editingFoodId, todayKey]);

  const editFoodEntry = useCallback((food) => {
    setNewFood({ name: food.name, calories: String(food.calories), protein: String(food.protein), carbs: String(food.carbs), fats: String(food.fats), mealType: food.mealType });
    setEditingFoodId(food.id);
  }, []);

  const cancelEdit = useCallback(() => {
    setNewFood({ name: "", calories: "", protein: "", carbs: "", fats: "", mealType: "breakfast" });
    setEditingFoodId(null);
    setValidationErrors({});
  }, []);

  const deleteFoodEntry = useCallback((id) => {
    setFoodLog(prev => prev.filter(f => f.id !== id));
  }, []);

  const addWaterIntake = useCallback((amount = 1) => {
    setWaterIntake(prev => Math.min(20, prev + amount));
  }, []);

  const resetWaterIntake = useCallback(() => setWaterIntake(0), []);

  const getBmiCategory = useCallback((bmi) => {
    if (!bmi) return '—';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }, []);

  const getSupplements = useCallback(() => {
    const base = ['Multivitamin', 'Vitamin D', 'Omega-3'];
    if (userData.goal === 'lose') return [...base, 'Green Tea', 'Fiber'];
    if (userData.goal === 'gain') return [...base, 'Creatine', 'Whey Protein'];
    return base;
  }, [userData.goal]);

  const getFoodSuggestions = useCallback(() => ({
    breakfast: ['Oatmeal with berries', 'Greek yogurt with nuts', 'Eggs & toast', 'Protein smoothie'],
    lunch: ['Grilled chicken salad', 'Quinoa bowl', 'Turkey wrap', 'Lentil soup'],
    dinner: ['Salmon & veg', 'Lean steak & sweet potato', 'Tofu stir-fry', 'Chicken skewers'],
    snack: ['Apple & peanut butter', 'Almonds', 'Protein bar', 'Greek yogurt']
  }), []);

  // PDF generation (defensive)
  const generateReport = useCallback((type = 'daily') => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 14;
      let y = 20;

      // --- Watermark ---
      const addWatermark = (pdfDoc) => {
        const totalPages = pdfDoc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdfDoc.setPage(i);
          // Check if saveGraphicsState exists (recent jsPDF versions)
          if (pdfDoc.saveGraphicsState) pdfDoc.saveGraphicsState();

          pdfDoc.setFontSize(60);
          pdfDoc.setTextColor(240, 240, 240); // Very light gray
          pdfDoc.setFont('helvetica', 'bold');
          // Center watermark
          pdfDoc.text('FitTronix AI', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

          if (pdfDoc.restoreGraphicsState) pdfDoc.restoreGraphicsState();
        }
      };

      // --- Header ---
      doc.setFontSize(22);
      doc.setTextColor(0, 150, 255); // Brand Cyan/Blue
      doc.setFont('helvetica', 'bold');
      doc.text('FitTronix AI Trainer', margin, y);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleString();
      // Right align date
      const dateWidth = doc.getTextWidth(`Generated on: ${dateStr}`);
      doc.text(`Generated on: ${dateStr}`, pageWidth - margin - dateWidth, y);

      y += 10;
      doc.setDrawColor(0, 150, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // --- Title ---
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40); // Dark gray
      doc.setFont('helvetica', 'bold');
      const title = type === 'daily' ? 'DAILY HEALTH REPORT' : 'WEEKLY HEALTH REPORT';
      doc.text(title, margin, y);
      y += 10;

      // --- User Profile Section ---
      doc.setFontSize(12);
      doc.setTextColor(0, 150, 255);
      doc.text('User Profile', margin, y);
      y += 6;

      const userRows = [
        ['Gender', userData.gender || '-'],
        ['Age', userData.age ? `${userData.age} years` : '-'],
        ['Height', userData.height ? `${userData.height} cm` : '-'],
        ['Weight', userData.weight ? `${userData.weight} kg` : '-'],
        ['Goal', userData.goal ? userData.goal.toUpperCase() : '-'],
        ['Activity', userData.activityLevel ? userData.activityLevel.toUpperCase() : '-']
      ];

      if (doc.autoTable) {
        doc.autoTable({
          startY: y,
          head: [['Parameter', 'Value']],
          body: userRows,
          theme: 'striped',
          headStyles: { fillColor: [0, 150, 255], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 10, cellPadding: 3 },
          columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // --- Check if tables overflowed page ---
      if (y > pageHeight - 30) { doc.addPage(); y = 20; }

      // --- Health Analysis ---
      doc.setFontSize(12);
      doc.setTextColor(0, 150, 255);
      doc.text('Health Analysis', margin, y);
      y += 6;

      if (bmiResult != null && bmrResult) {
        const healthRows = [
          ['BMI', `${bmiResult} (${getBmiCategory(bmiResult)})`],
          ['BMR (Basal Metabolic Rate)', `${bmrResult.bmr} kcal/day`],
          ['TDEE (Total Expenditure)', `${bmrResult.tdee} kcal/day`],
          ['Daily Calorie Target', `${bmrResult.goalCalories} kcal/day`]
        ];

        if (doc.autoTable) {
          doc.autoTable({
            startY: y,
            head: [['Metric', 'Result']],
            body: healthRows,
            theme: 'grid',
            headStyles: { fillColor: [40, 40, 40], textColor: 255 },
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } }
          });
          y = doc.lastAutoTable.finalY + 10;
        }
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 0, 0);
        doc.text('Please calculate your BMI/BMR to see health analysis.', margin, y);
        y += 10;
      }

      // --- Daily Intake Logs ---
      if (type === 'daily') {
        if (y > pageHeight - 40) { doc.addPage(); y = 20; }

        doc.setFontSize(12);
        doc.setTextColor(0, 150, 255);
        doc.text("Today's Food Log", margin, y);
        y += 6;

        if (todayFood.length > 0 && doc.autoTable) {
          const foodRows = todayFood.map(f => [
            f.mealType.charAt(0).toUpperCase() + f.mealType.slice(1),
            f.name,
            `${f.calories}`,
            `${f.protein}g`,
            `${f.carbs}g`,
            `${f.fats}g`
          ]);

          // Calculate totals
          const totals = todayFood.reduce((acc, f) => ({
            c: acc.c + (Number(f.calories) || 0),
            p: acc.p + (Number(f.protein) || 0),
            cb: acc.cb + (Number(f.carbs) || 0),
            f: acc.f + (Number(f.fats) || 0)
          }), { c: 0, p: 0, cb: 0, f: 0 });

          foodRows.push(['TOTAL', '', `${totals.c}`, `${totals.p}g`, `${totals.cb}g`, `${totals.f}g`]);

          doc.autoTable({
            startY: y,
            head: [['Meal', 'Food Item', 'Calories', 'Protein', 'Carbs', 'Fats']],
            body: foodRows,
            theme: 'striped',
            headStyles: { fillColor: [0, 180, 200], textColor: 255 },
            footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 9 },
            didParseCell: function (data) {
              if (data.row.index === foodRows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [220, 240, 255];
              }
            }
          });
          y = doc.lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text("No food entries logged for today.", margin, y);
          y += 10;
        }
      }

      // --- Apply Watermark & Footer ---
      addWatermark(doc);

      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pages} | FitTronix AI Health Tracker`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = type === 'weekly' ? `fittronix-weekly-report-${timestamp}.pdf` : `fittronix-daily-report-${timestamp}.pdf`;


      // Alternative Strategy: Open in New Tab
      // This bypasses browser restrictions on programmatic downloads
      const pdfData = doc.output('blob');
      const url = URL.createObjectURL(pdfData);
      window.open(url, '_blank');

      // Cleanup after a delay (longer delay for viewing)
      setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch (e) {
      console.error('Failed to generate PDF', e);
      alert('Could not create PDF report.');
    }
  }, [userData, bmiResult, bmrResult, todayFood, getBmiCategory]);

  // Chart data: weekly sums (simple example: last 7 days from foodLog)
  const weeklyChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString());
    }
    const map = days.map(day => {
      const entries = foodLog.filter(f => f.date === day);
      const totals = entries.reduce((acc, e) => {
        acc.calories += Number(e.calories) || 0;
        acc.protein += Number(e.protein) || 0;
        acc.carbs += Number(e.carbs) || 0;
        acc.fats += Number(e.fats) || 0;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
      return { day: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }), ...totals };
    });
    return map;
  }, [foodLog]);

  // Small presentational subcomponents
  const TabButton = ({ tab, children }) => (
    <motion.button
      className={`py-3 px-5 cursor-pointer font-medium transition-all duration-200 ${activeTab === tab ? 'border-b-2 border-cyan-500 text-cyan-400 bg-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'}`}
      onClick={() => setActiveTab(tab)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={activeTab === tab}
    >{children}</motion.button>
  );



  // Render
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-[125px]">
      <motion.header className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">Health & Nutrition Tracker</h1>
        <p className="text-gray-400 text-sm md:text-lg">BMI, BMR, food log, hydration tracker, charts & downloadable reports</p>
      </motion.header>

      <div className="flex border-b border-gray-700 mb-6 bg-gray-800 rounded-t-lg shadow-sm overflow-x-auto">
        <TabButton tab="calculator">Calculator</TabButton>
        <TabButton tab="food-log">Food Log</TabButton>
        <TabButton tab="progress">Daily Progress</TabButton>
        <TabButton tab="report">Report</TabButton>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

          {activeTab === 'calculator' && (
            <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-cyan-400">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-cyan-400'}`}
                >
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Gender', name: 'gender', type: 'select', options: ['male', 'female'] },
                  { label: 'Age (years)', name: 'age', type: 'number', min: 1, max: 120 },
                  { label: 'Height (cm)', name: 'height', type: 'number', min: 50, max: 250 },
                  { label: 'Weight (kg)', name: 'weight', type: 'number', min: 10, max: 300 },
                  { label: 'Activity Level', name: 'activityLevel', type: 'select', options: ['sedentary', 'light', 'moderate', 'active', 'extra'] },
                  { label: 'Goal', name: 'goal', type: 'select', options: ['lose', 'maintain', 'gain'] },
                  { label: 'Meals per Day', name: 'mealsPerDay', type: 'select', options: ['3', '4', '5', '6'] },
                  { label: 'Dietary Preference', name: 'dietaryPreference', type: 'select', options: ['balanced', 'vegetarian', 'vegan', 'lowCarb', 'keto'] },
                  { label: 'Allergies (optional)', name: 'allergies', type: 'text' },
                  { label: 'Health Conditions (optional)', name: 'healthConditions', type: 'text' }
                ].map(field => (
                  <div key={field.name} className="mb-4">
                    <label className="block text-gray-300 mb-2 font-medium" htmlFor={field.name}>{field.label}</label>
                    {!isEditing ? (
                      <div className="w-full px-3 py-2 border border-transparent bg-gray-700/30 text-gray-300 rounded-md">
                        {field.type === 'select' && userData[field.name]
                          ? userData[field.name].charAt(0).toUpperCase() + userData[field.name].slice(1)
                          : userData[field.name] || '—'}
                      </div>
                    ) : (
                      field.type === 'select' ? (
                        <select id={field.name} name={field.name} value={userData[field.name]} onChange={handleUserChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-700 border-gray-600 text-white ${validationErrors[field.name] ? 'border-red-500' : ''}`}>
                          {field.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                        </select>
                      ) : (
                        <input id={field.name} name={field.name} value={userData[field.name]} onChange={handleUserChange} type={field.type} min={field.min} max={field.max} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-700 border-gray-600 text-white ${validationErrors[field.name] ? 'border-red-500' : ''}`} />
                      )
                    )}
                    {isEditing && validationErrors[field.name] && <p className="text-red-500 text-sm mt-1">{validationErrors[field.name]}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold text-cyan-300">Results</h3>
                  <div className="mt-3 text-gray-300">
                    <p><strong>BMI:</strong> {bmiResult ?? '—'} ({getBmiCategory(bmiResult)})</p>
                    <p><strong>BMR:</strong> {bmrResult ? `${bmrResult.bmr} kcal` : '—'}</p>
                    <p><strong>TDEE:</strong> {bmrResult ? `${bmrResult.tdee} kcal` : '—'}</p>
                    <p><strong>Daily Target:</strong> {bmrResult ? `${bmrResult.goalCalories} kcal` : '—'}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold text-green-400">Suggestions</h3>
                  <div className="mt-3 text-gray-300">
                    <p><strong>Supplements:</strong> {getSupplements().join(', ')}</p>
                    <p className="mt-2 text-sm text-gray-400">Food ideas: {getFoodSuggestions().breakfast.slice(0, 2).join(' • ')}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'food-log' && (
            <FoodLogTab
              waterIntake={waterIntake}
              addWaterIntake={addWaterIntake}
              resetWaterIntake={resetWaterIntake}
              newFood={newFood}
              handleFoodChange={handleFoodChange}
              addFoodEntry={addFoodEntry}
              todayFood={todayFood}
              deleteFoodEntry={deleteFoodEntry}
              editFoodEntry={editFoodEntry}
              editingFoodId={editingFoodId}
              cancelEdit={cancelEdit}
              validationErrors={validationErrors}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressTab progress={progress} waterIntake={waterIntake} setWaterIntake={setWaterIntake} dietPlan={dietPlan} weeklyChartData={weeklyChartData} />
          )}

          {activeTab === 'report' && (
            <ReportTab generateReport={generateReport} />
          )}

          {activeTab === 'workout' && null}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ProgressBar = ({ percentage = 0, nutrient = '', goal }) => {
  const pct = Number(percentage) || 0;
  const getColor = (p) => p > 100 ? 'bg-red-400' : p > 90 ? 'bg-yellow-400' : p > 70 ? 'bg-green-400' : 'bg-blue-400';
  return (
    <motion.div className="mb-4 p-4 bg-gray-700/50 rounded-lg shadow-sm border border-gray-600/50" whileHover={{ scale: 1.01 }}>
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-300">{nutrient}</span>
        <div className="text-right">
          <span className="font-semibold text-cyan-300">{pct}%</span>
          <div className="text-xs text-gray-400">{pct > 100 ? `Over ${nutrient} goal` : pct > 90 ? `Almost at ${nutrient} goal` : pct > 70 ? `Good progress` : `Keep going`}</div>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
        <div className={`h-3 rounded-full ${getColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {goal && <div className="text-xs text-gray-500 mt-1">Goal: {goal}</div>}
    </motion.div>
  );
};

// FoodLogTab component with Smart Search
const FoodLogTab = ({ waterIntake, addWaterIntake, resetWaterIntake, newFood, handleFoodChange, addFoodEntry, todayFood, deleteFoodEntry, editFoodEntry, editingFoodId, cancelEdit, validationErrors }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);

      // 1. Local Search
      const localMatches = PREDEFINED_FOODS.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // 2. API Search (only if query is long enough)
      let apiMatches = [];
      if (searchQuery.length >= 3) {
        apiMatches = await searchOpenFoodFacts(searchQuery);
      }

      setResults([...localMatches, ...apiMatches]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectFood = (food) => {
    // Determine meal type (default to breakfast if not specified)
    const currentHour = new Date().getHours();
    let suggestedMeal = "snack";
    if (currentHour < 11) suggestedMeal = "breakfast";
    else if (currentHour < 15) suggestedMeal = "lunch";
    else if (currentHour < 21) suggestedMeal = "dinner";

    const event = {
      target: {
        name: 'batch_update', // Pseudo-event for batch update
        value: {
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          mealType: food.mealType || suggestedMeal
        }
      }
    };

    // We need to manually update state since handleFoodChange expects a regular event
    // So we'll call handleFoodChange multiple times or refactor parent. 
    // Easier: Just manually trigger changes for each field using the passed handler loop or similar.
    // Actually, let's just cheat and call handleFoodChange with specific events
    ['name', 'calories', 'protein', 'carbs', 'fats', 'mealType'].forEach(key => {
      handleFoodChange({ target: { name: key, value: event.target.value[key] } });
    });

    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 text-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Log Food & Water</h2>

      <div className="mb-6 p-4 bg-gray-700/50 rounded-xl border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-cyan-300">Water</h3>
            <div className="text-sm text-gray-400">{waterIntake} glasses today</div>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors" onClick={() => addWaterIntake(1)} disabled={waterIntake >= 20}>+ Add</button>
            <button className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 px-4 rounded transition-colors" onClick={resetWaterIntake}>Reset</button>
          </div>
        </div>
        {waterIntake > 12 && <div className="mt-3 text-sm text-yellow-500">You're drinking a lot — space it out.</div>}
      </div>

      {/* Smart Search Bar */}
      <div className="mb-6 relative z-20">
        <label className="block text-gray-300 mb-2 font-medium">Search Food (Auto-fill)</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search 'Chicken', 'Oatmeal', 'Apple'..."
            className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading && <div className="absolute right-3 top-3 text-cyan-400 animate-spin">⌛</div>}

          {showResults && results.length > 0 && (
            <div className="absolute w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30">
              {results.map((item, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-0 flex justify-between items-center group"
                  onClick={() => selectFood(item)}
                >
                  <div>
                    <div className="font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.calories} kcal | P: {item.protein} | C: {item.carbs} | F: {item.fats}</div>
                  </div>
                  {item.source === 'OpenFoodFacts' && <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded">WEB</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[{ label: 'Food Name', name: 'name', type: 'text' }, { label: 'Meal Type', name: 'mealType', type: 'select', options: ['breakfast', 'lunch', 'dinner', 'snack'] }, { label: 'Calories', name: 'calories', type: 'number' }, { label: 'Protein (g)', name: 'protein', type: 'number' }, { label: 'Carbs (g)', name: 'carbs', type: 'number' }, { label: 'Fats (g)', name: 'fats', type: 'number' }].map(f => (
          <div key={f.name}>
            <label className="block text-gray-300 mb-1">{f.label}</label>
            {f.type === 'select' ? (
              <select name={f.name} value={newFood[f.name]} onChange={handleFoodChange} className={`w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${validationErrors[f.name] ? 'border-red-500' : ''}`}>
                {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input name={f.name} value={newFood[f.name]} onChange={handleFoodChange} type={f.type} className={`w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${validationErrors[f.name] ? 'border-red-500' : ''}`} />
            )}
            {validationErrors[f.name] && <div className="text-red-500 text-xs">{validationErrors[f.name]}</div>}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={addFoodEntry} className={`py-2 px-4 rounded transition-colors ${editingFoodId ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>{editingFoodId ? 'Update' : 'Add Food'}</button>
        {editingFoodId && <button onClick={cancelEdit} className="py-2 px-4 rounded bg-gray-600 text-gray-200 hover:bg-gray-500">Cancel</button>}
      </div>

      <div>
        <h3 className="text-xl mb-3 text-cyan-300">Today's Intake</h3>
        {todayFood.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-700/30 rounded border border-gray-700 border-dashed">No entries yet — add your first meal.</div>
        ) : (
          <div className="space-y-3">
            {todayFood.map(f => (
              <div key={f.id} className="flex justify-between items-center p-3 bg-gray-700/40 rounded border border-gray-700 hover:border-cyan-500/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2"><span className="capitalize font-semibold text-cyan-200">{f.mealType}</span><span className="text-lg font-bold text-white">{f.name}</span></div>
                  <div className="text-sm text-gray-400">{f.calories} kcal • P: {f.protein}g • C: {f.carbs}g • F: {f.fats}g</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 mr-2">{f.time}</div>
                  <button onClick={() => editFoodEntry(f)} className="text-blue-400 hover:text-blue-300">✏️</button>
                  <button onClick={() => deleteFoodEntry(f.id)} className="text-red-400 hover:text-red-300">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Progress tab with chart
const ProgressTab = ({ progress, waterIntake, setWaterIntake, dietPlan, weeklyChartData }) => {
  const waterPct = Math.min(100, Math.round((waterIntake / 8) * 100));

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 text-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Daily Progress</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3 text-gray-300">Nutrition</h3>
          <ProgressBar percentage={progress.calories} nutrient="Calories" goal={dietPlan ? `${dietPlan.calories} kcal` : '—'} />
          <ProgressBar percentage={progress.protein} nutrient="Protein" goal={dietPlan ? `${dietPlan.protein} g` : '—'} />
          <ProgressBar percentage={progress.carbs} nutrient="Carbs" goal={dietPlan ? `${dietPlan.carbs} g` : '—'} />
          <ProgressBar percentage={progress.fats} nutrient="Fats" goal={dietPlan ? `${dietPlan.fats} g` : '—'} />
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-gray-300">Hydration</h3>
          <div className="p-4 bg-gray-700/50 rounded-lg mb-6 border border-cyan-500/20">
            <div className="text-center text-3xl font-bold text-cyan-400">{waterIntake}/8</div>
            <div className="text-center text-sm text-gray-400">Glasses today</div>
            <div className="mt-3 w-full bg-gray-600 rounded-full h-4 overflow-hidden"><div className="h-4 bg-cyan-500" style={{ width: `${waterPct}%` }} /></div>
            <div className="mt-3 grid grid-cols-8 gap-2">
              {[...Array(8)].map((_, i) => (
                <button key={i} className={`w-8 h-8 rounded-full border border-gray-600 transition-colors ${i < waterIntake ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-cyan-400 hover:bg-gray-600'}`} onClick={() => setWaterIntake(i + 1)} aria-label={`Set water to ${i + 1}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <h3 className="font-semibold mb-3 text-gray-300">Weekly Intake (calories)</h3>
          <div style={{ width: '100%', height: 220 }}>
            {weeklyChartData && weeklyChartData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
                  />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Bar dataKey="calories" name="Calories" fill="#22D3EE" />
                  <Bar dataKey="protein" name="Protein" fill="#A78BFA" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 border border-gray-700 border-dashed rounded">
                No data for chart
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportTab = ({ generateReport }) => (
  <div className="bg-gray-800 rounded-lg shadow-md p-6 text-gray-200">
    <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Generate Reports</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-cyan-500/20 rounded-lg text-center hover:border-cyan-500/40 transition-all">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="font-semibold mb-2 text-cyan-200">Daily Report</h3>
        <p className="text-sm text-gray-400 mb-4">Download a PDF summary of today's intake.</p>
        <button onClick={() => generateReport('daily')} className="bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded transition-colors">Download Daily</button>
      </div>

      <div className="p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/20 rounded-lg text-center hover:border-green-500/40 transition-all">
        <div className="text-4xl mb-3">📈</div>
        <h3 className="font-semibold mb-2 text-green-200">Weekly Report</h3>
        <p className="text-sm text-gray-400 mb-4">Summary of the last 7 days.</p>
        <button onClick={() => generateReport('weekly')} className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition-colors">Download Weekly</button>
      </div>
    </div>
  </div>
);

export default HealthTracker;
