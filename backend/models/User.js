// models/User.js (Firebase version)
const bcrypt = require('bcryptjs');
const { doc, setDoc, getDoc } = require('firebase/firestore');
const { db } = require('../firebase'); // your initialized Firestore instance

class User {
  constructor(data) {
    this.username = data.username || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.role = data.role || 'user'; // 'user' or 'admin'
    this.avatar = data.avatar || '';

    this.profile = {
      age: data.profile?.age || null,
      weight: data.profile?.weight || null,
      height: data.profile?.height || null,
      fitnessLevel: data.profile?.fitnessLevel || 'beginner',
      goals: data.profile?.goals || [],
      injuries: data.profile?.injuries || [],
      preferences: {
        audioFeedback: data.profile?.preferences?.audioFeedback ?? true,
        visualFeedback: data.profile?.preferences?.visualFeedback ?? true,
        notifications: data.profile?.preferences?.notifications ?? true
      }
    };

    this.stats = {
      totalWorkouts: data.stats?.totalWorkouts || 0,
      totalDuration: data.stats?.totalDuration || 0,
      caloriesBurned: data.stats?.caloriesBurned || 0,
      streak: data.stats?.streak || 0
    };

    this.achievements = data.achievements || [];
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Hash password before saving
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Compare password
  async correctPassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Save user to Firebase
  async save() {
    if (!this.email) throw new Error('Email is required');
    const userRef = doc(db, 'users', this.email);
    await setDoc(userRef, { ...this });
  }

  // Get user by email
  static async findByEmail(email) {
    const userRef = doc(db, 'users', email);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    return new User(userSnap.data());
  }
}

module.exports = User;
