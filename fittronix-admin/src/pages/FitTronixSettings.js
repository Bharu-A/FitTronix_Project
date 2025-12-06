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
import { auth, db } from '../firebase';
import { useNavigate } from "react-router-dom";

const FitTronixSettings = () => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          setLoading(true);
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            setUser({
              uid: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              avatar: userData.avatar
                || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
              ...userData
            });

            setAccount({
              username: userData.username || 'user',
              email: firebaseUser.email,
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });

          } else {
            const defaultUserData = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || 'user',
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
              createdAt: new Date()
            };

            await setDoc(userDocRef, defaultUserData);
            setUser({ uid: firebaseUser.uid, ...defaultUserData });
            setAccount((prev) => ({
              ...prev,
              username: defaultUserData.username,
              email: defaultUserData.email
            }));
          }
        } catch (err) {
          setError("Failed to load user data");
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Account handlers
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const saveUsername = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), { username: account.username });
      setUser((prev) => ({ ...prev, username: account.username }));
    } catch (err) {
      setError('Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    if (!auth.currentUser) return;

    try {
      setSaving(true);
      await updateEmail(auth.currentUser, account.email);

      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), { email: account.email });
      }

      setUser((prev) => ({ ...prev, email: account.email }));
    } catch (err) {
      setError('Failed to update email (Re-authentication required)');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!auth.currentUser) return;

    if (account.newPassword !== account.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      setSaving(true);
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        account.currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, account.newPassword);

      setAccount((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError('Failed to update password. Check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      setError("Logout failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user?.uid) return;

    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      setSaving(true);

      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(auth.currentUser);

    } catch {
      setError('Failed to delete account. Re-authentication required.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-center text-cyan-400 flex items-center justify-center">
        Loading settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-center text-red-400 flex items-center justify-center">
        Please log in to access settings.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          FitTronix Settings
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile */}
        <div className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Profile</h2>
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={user.avatar}
              className="w-16 h-16 rounded-full border-2 border-cyan-400"
              alt="Avatar"
            />
            <div>
              <p className="text-lg">{user.name}</p>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

         <button 
  onClick={() => navigate("/profile")}
  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg hover:opacity-80 transition"
>
  Edit Profile
</button>

        </div>

        {/* Account Settings */}
        <div className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">
            Account Settings
          </h2>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Username</label>
            <div className="flex space-x-2">
              <input
                name="username"
                value={account.username}
                onChange={handleAccountChange}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              />
              <button
                onClick={saveUsername}
                disabled={saving}
                className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700"
              >
                Save
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Email</label>
            <div className="flex space-x-2">
              <input
                type="email"
                name="email"
                value={account.email}
                onChange={handleAccountChange}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              />
              <button
                onClick={saveEmail}
                disabled={saving}
                className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700"
              >
                Save
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={account.currentPassword}
              onChange={handleAccountChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={account.newPassword}
              onChange={handleAccountChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={account.confirmPassword}
              onChange={handleAccountChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            />
          </div>

          <button
            onClick={savePassword}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg hover:opacity-90"
          >
            Update Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-red-500/30">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-700 rounded-lg hover:bg-red-800"
            >
              Log Out
            </button>

            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-gray-700 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/20"
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
