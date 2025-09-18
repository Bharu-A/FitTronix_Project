import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";

function AdminDashboardPage() {
  const [userCount, setUserCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      setUserCount(usersSnap.size);

      const workoutsSnap = await getDocs(collection(db, "workouts"));
      setWorkoutCount(workoutsSnap.size);

      const q = query(collection(db, "workouts"), orderBy("timestamp", "desc"), limit(5));
      const recentSnap = await getDocs(q);
      const recentData = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentWorkouts(recentData);
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-3xl">{userCount}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-xl font-semibold">Total Workouts</h2>
          <p className="text-3xl">{workoutCount}</p>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>User</th>
              <th>Exercise</th>
              <th>Reps</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentWorkouts.map((w) => (
              <tr key={w.id}>
                <td>{w.uid}</td>
                <td>{w.exercise}</td>
                <td>{w.reps}</td>
                <td>{w.form_score ?? "-"}</td>
                <td>{new Date(w.timestamp.toDate()).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
    