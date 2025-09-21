// src/pages/CompleteProfile.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  User, Mail, Calendar, MapPin, Dumbbell, 
  Save, Ruler, Weight, Target 
} from "lucide-react";
import { updateProfile } from "firebase/auth";

function CompleteProfile() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    dob: "",
    location: "",
    height: "",
    weight: "",
    gender: "",
    fitnessGoal: "",
    activityLevel: "",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("No user found. Please log in again.");
      }

      // Update profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
  ...formData,
  profileCompleted: true,
  lastUpdated: new Date().toISOString(),
}, { merge: true });


      // Update display name in Firebase Auth if changed
      if (formData.name !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.name
        });
      }

      // Redirect to dashboard or profile page
      navigate(user.displayName ? "/profile" : "/dashboard");

    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">
              Please log in to complete your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 pt-[100px] bg-gray-50 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Complete Your Profile</h1>
            <p className="text-gray-600">Help us personalize your fitness journey</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="text-blue-600 flex-shrink-0" />
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="text-blue-600 flex-shrink-0" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Email"
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="text-purple-600 flex-shrink-0" />
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  placeholder="Date of Birth"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="text-red-600 flex-shrink-0" />
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Location"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Ruler className="text-green-600 flex-shrink-0" />
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="Height (cm)"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Weight className="text-orange-600 flex-shrink-0" />
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Weight (kg)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === "other"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Other</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your activity level</option>
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                  <option value="very-active">Very Active (hard exercise daily)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Dumbbell className="mr-2 text-orange-500" />
                  Fitness Goal
                </label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => handleInputChange("fitnessGoal", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your fitness goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="endurance">Endurance Training</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="general-fitness">General Fitness</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompleteProfile;