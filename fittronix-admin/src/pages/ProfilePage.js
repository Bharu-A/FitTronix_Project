// src/pages/ProfilePage.js
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  User, Mail, Phone, Calendar, MapPin, Dumbbell, 
  Edit, Save, X, Camera, Award, Activity, Upload, Trash2
} from "lucide-react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase"; // Make sure storage is exported from your Firebase config

// Custom hook for Firebase user data management
function useFirebaseUser() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Fetch additional profile data from Firestore if needed
          try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setProfileData(docSnap.data());
            } else {
              // Create a basic profile if it doesn't exist
              const basicProfile = {
                name: firebaseUser.displayName || "",
                email: firebaseUser.email || "",
                phone: "",
                dob: "",
                location: "",
                fitnessGoal: "",
                joined: new Date().toISOString().split('T')[0],
                photoURL: firebaseUser.photoURL || ""
              };
              
              await setDoc(docRef, basicProfile);
              setProfileData(basicProfile);
            }
          } catch (firestoreError) {
            console.error("Error fetching Firestore data:", firestoreError);
            setProfileData({});
          }
        } else {
          setUser(null);
          setProfileData(null);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error in auth state change:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUserData = async (updatedData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No user logged in");
      }

      // Update Firebase Auth profile if name or photo changed
      const authUpdates = {};
      if (updatedData.name && updatedData.name !== user.displayName) {
        authUpdates.displayName = updatedData.name;
      }
      if (updatedData.photoURL && updatedData.photoURL !== user.photoURL) {
        authUpdates.photoURL = updatedData.photoURL;
      }
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }

      // Update Firestore data
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, updatedData);
      
      // Update local state
      setProfileData(prev => ({ ...prev, ...updatedData }));
      setUser(prev => prev ? { ...prev, ...authUpdates } : null);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error("Error updating user data:", err);
      return { success: false, error: err.message };
    }
  };

  return { 
    user: { ...user, ...profileData }, 
    loading, 
    error, 
    updateUserData 
  };
}

function ProfilePage() {
  const { user, loading, error, updateUserData } = useFirebaseUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveStatus, setSaveStatus] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize edit form when user data is loaded
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.displayName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
        location: user.location || "",
        fitnessGoal: user.fitnessGoal || "",
        photoURL: user.photoURL || ""
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const result = await updateUserData(editForm);
    setSaveStatus(result);
    
    if (result.success) {
      setIsEditing(false);
      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus({}), 3000);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user.displayName || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      dob: user.dob || "",
      location: user.location || "",
      fitnessGoal: user.fitnessGoal || "",
      photoURL: user.photoURL || ""
    });
    setIsEditing(false);
    setSaveStatus({});
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setSaveStatus({ error: "Please select an image file" });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveStatus({ error: "Image size must be less than 5MB" });
      return;
    }
    
    setUploading(true);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("No user logged in");
      }
      
      // Delete old photo if it exists and is from Firebase Storage
      if (user.photoURL && user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          const oldPhotoRef = ref(storage, user.photoURL);
          await deleteObject(oldPhotoRef);
        } catch (error) {
          console.warn("Could not delete old photo:", error);
        }
      }
      
      // Upload new photo
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update form with new photo URL
      setEditForm(prev => ({ ...prev, photoURL: downloadURL }));
      
      // Update user data immediately
      const result = await updateUserData({ photoURL: downloadURL });
      if (result.success) {
        setSaveStatus({ success: "Profile photo updated successfully!" });
        setTimeout(() => setSaveStatus({}), 3000);
      } else {
        setSaveStatus(result);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setSaveStatus({ error: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Delete photo from storage if it exists
      if (user.photoURL && user.photoURL.includes('firebasestorage.googleapis.com')) {
        const photoRef = ref(storage, user.photoURL);
        await deleteObject(photoRef);
      }
      
      // Update user data with empty photo URL
      const result = await updateUserData({ photoURL: "" });
      if (result.success) {
        setEditForm(prev => ({ ...prev, photoURL: "" }));
        setSaveStatus({ success: "Profile photo removed successfully!" });
        setTimeout(() => setSaveStatus({}), 3000);
      } else {
        setSaveStatus(result);
      }
    } catch (err) {
      console.error("Error removing photo:", err);
      setSaveStatus({ error: err.message });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-40"></div>
              <div className="h-4 bg-gray-300 rounded w-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading profile: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen padding-top: 50px;">
      {/* Header */}
      <div className="flex justify-between items-center padding-top: 50px;">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👤 Profile</h1>
          <p className="text-gray-600">Manage your personal details & fitness goals</p>
        </div>
        
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              disabled={uploading}
            >
              <Save size={16} />
              <span>{uploading ? "Uploading..." : "Save"}</span>
            </Button>
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="flex items-center space-x-2"
              disabled={uploading}
            >
              <X size={16} />
              <span>Cancel</span>
            </Button>
          </div>
        )}
      </div>

      {saveStatus.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {saveStatus.error}
        </div>
      )}

      {saveStatus.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {typeof saveStatus.success === 'string' ? saveStatus.success : "Profile updated successfully!"}
        </div>
      )}

      {/* Profile Card */}
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {editForm.photoURL ? (
                <img 
                  src={editForm.photoURL} 
                  alt={editForm.name || "User"} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
                  {editForm.name ? editForm.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              
              {isEditing && (
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={14} />
                    )}
                  </button>
                  
                  {editForm.photoURL && (
                    <button 
                      onClick={handleRemovePhoto}
                      className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      disabled={uploading}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your Name"
                  className="text-2xl font-semibold"
                />
              ) : (
                <>
                  <h2 className="text-2xl font-semibold">{user.displayName || user.name || "Unknown User"}</h2>
                  <p className="text-gray-500 flex items-center">
                    <Award size={16} className="mr-1" />
                    Fitness Enthusiast
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="text-blue-600 flex-shrink-0" />
              {isEditing ? (
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Email Address"
                  disabled // Email typically shouldn't be editable directly
                />
              ) : (
                <span>{user.email || "Not provided"}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="text-green-600 flex-shrink-0" />
              {isEditing ? (
                <Input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Phone Number"
                />
              ) : (
                <span>{user.phone || "Not provided"}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="text-purple-600 flex-shrink-0" />
              {isEditing ? (
                <Input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  placeholder="Date of Birth"
                />
              ) : (
                <span>DOB: {user.dob || "Not provided"}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="text-red-600 flex-shrink-0" />
              {isEditing ? (
                <Input
                  value={editForm.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Location"
                />
              ) : (
                <span>{user.location || "Not provided"}</span>
              )}
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Dumbbell className="text-orange-500" /> 
              <span>Fitness Goal</span>
            </h3>
            {isEditing ? (
              <textarea
                value={editForm.fitnessGoal}
                onChange={(e) => handleInputChange("fitnessGoal", e.target.value)}
                placeholder="Describe your fitness goals..."
                className="w-full mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            ) : (
              <p className="text-gray-600 mt-2">
                {user.fitnessGoal || "No fitness goal set yet. Click edit to add one!"}
              </p>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-500">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5/7</div>
              <div className="text-sm text-gray-500">Active Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12.4k</div>
              <div className="text-sm text-gray-500">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">78%</div>
              <div className="text-sm text-gray-500">Progress</div>
            </div>
          </div>

          {/* Joined Date */}
          <p className="text-sm text-gray-500 mt-6">
            Member since {user.joined || "January 2025"}
          </p>
        </CardContent>
      </Card>

      {/* Additional Stats Card */}
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="mr-2 text-blue-500" />
            Fitness Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Weekly Progress</h4>
              <div className="space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.substring(0, 3)}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Goals Tracking</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Weight Loss</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Muscle Gain</span>
                    <span>40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Endurance</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;