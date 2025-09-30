import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  deleteUser, 
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Adjust import path as needed

const FitTronixSettings = () => {
  // User profile state
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          setLoading(true);
          setError('');
          
          // Get user document from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
              ...userData
            });
            
            // Set account state
            setAccount(prev => ({
              ...prev,
              username: userData.username || firebaseUser.displayName || 'user',
              email: firebaseUser.email
            }));
            
            // Set preferences
            if (userData.preferences) {
              setPreferences(userData.preferences);
            }
          } else {
            // Create new user document with default values
            const defaultUserData = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || 'user',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
              preferences: {
                darkMode: true,
                emailNotifications: true,
                pushNotifications: false
              },
              createdAt: new Date()
            };
            
            await setDoc(userDocRef, defaultUserData);
            
            setUser({
              uid: firebaseUser.uid,
              ...defaultUserData
            });
            
            setAccount(prev => ({
              ...prev,
              username: defaultUserData.username,
              email: defaultUserData.email
            }));
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      } else {
        // No user logged in
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle input changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = async (name) => {
    const newPreferences = { ...preferences, [name]: !preferences[name] };
    setPreferences(newPreferences);
    
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          preferences: newPreferences
        });
      } catch (err) {
        console.error('Error updating preferences:', err);
        setError('Failed to update preferences');
        // Revert on error
        setPreferences(preferences);
      }
    }
  };

  // Save handlers
  const saveUsername = async () => {
    if (!user?.uid) return;
    
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        username: account.username
      });
      
      // Update local user state
      setUser(prev => ({ ...prev, name: account.username }));
      
      console.log('Username saved:', account.username);
    } catch (err) {
      console.error('Error saving username:', err);
      setError('Failed to save username');
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    if (!auth.currentUser) return;
    
    try {
      setSaving(true);
      await updateEmail(auth.currentUser, account.email);
      
      // Update Firestore
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          email: account.email
        });
      }
      
      // Update local state
      setUser(prev => ({ ...prev, email: account.email }));
      
      console.log('Email saved:', account.email);
    } catch (err) {
      console.error('Error saving email:', err);
      setError('Failed to save email. You may need to reauthenticate.');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!auth.currentUser) return;
    
    if (account.newPassword !== account.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    try {
      setSaving(true);
      
      // Reauthenticate user before password change
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email, 
        account.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, account.newPassword);
      
      // Clear password fields
      setAccount(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      console.log('Password changed successfully');
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  // Action handlers
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out');
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user?.uid) return;
    
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setSaving(true);
        
        // Delete user document from Firestore
        await deleteDoc(doc(db, 'users', user.uid));
        
        // Delete user from Firebase Auth
        await deleteUser(auth.currentUser);
        
        console.log('Account deleted');
      } catch (err) {
        console.error('Error deleting account:', err);
        setError('Failed to delete account. You may need to reauthenticate.');
        setSaving(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Not Logged In</h1>
          <p className="text-gray-400">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          FitTronix Settings
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-400 hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Profile Section */}
        <div className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Profile</h2>
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-cyan-400"
            />
            <div>
              <p className="text-lg font-medium">{user.name}</p>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
            Edit Profile
          </button>
        </div>

        {/* Account Settings */}
        <div className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Account Settings</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="username"
                value={account.username}
                onChange={handleAccountChange}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={saving}
              />
              <button 
                onClick={saveUsername}
                disabled={saving}
                className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="flex space-x-2">
              <input
                type="email"
                name="email"
                value={account.email}
                onChange={handleAccountChange}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={saving}
              />
              <button 
                onClick={saveEmail}
                disabled={saving}
                className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={account.currentPassword}
              onChange={handleAccountChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={saving}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={account.newPassword}
              onChange={handleAccountChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={saving}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={account.confirmPassword}
              onChange={handleAccountChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={saving}
            />
          </div>

          <button 
            onClick={savePassword}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Preferences Section */}
        <div className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-lg shadow-pink-500/10">
          <h2 className="text-xl font-semibold mb-4 text-pink-400">Preferences</h2>
          
          <div className="flex justify-between items-center mb-4 py-2">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-400">Toggle dark/light theme</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('darkMode')}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences.darkMode ? 'bg-cyan-600' : 'bg-gray-600'} disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.darkMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          <div className="flex justify-between items-center mb-4 py-2">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive email updates</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('emailNotifications')}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences.emailNotifications ? 'bg-purple-600' : 'bg-gray-600'} disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-400">Receive app notifications</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('pushNotifications')}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences.pushNotifications ? 'bg-pink-600' : 'bg-gray-600'} disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-red-500/30">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
          
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <button
              onClick={handleLogout}
              disabled={saving}
              className="px-4 py-2 bg-red-700 rounded-lg hover:bg-red-800 transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log Out
            </button>
            
            <button
              onClick={handleDeleteAccount}
              disabled={saving}
              className="px-4 py-2 bg-gray-700 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitTronixSettings;