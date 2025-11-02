import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login.js';
import Register from './components/Auth/Register.js';
import StudentDashboard from './components/Student/StudentDashboard.js';
import AdminDashboard from './components/Admin/AdminDashboard.js';
import AnalyticsPage from './components/Student/AnalyticsPage.js';
import ActivitiesPage from './components/Student/ActivitiesPage.js';
import ReportsPage from './components/Student/ReportsPage.js';

import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student/*" element={<StudentRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Student Routes Component
function StudentRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animated-logo">
          <div className="pulse-ring"></div>
          <div className="logo-icon">🎓</div>
        </div>
        <p>Loading Student Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'student') {
    return <Navigate to={`/${user.role}`} />;
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/activities" element={<ActivitiesPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/" element={<Navigate to="/student/dashboard" />} />
      <Route path="*" element={<Navigate to="/student/dashboard" />} />
      
    </Routes>
  );
}

// Admin Routes Component
function AdminRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animated-logo">
          <div className="pulse-ring"></div>
          <div className="logo-icon">⚙️</div>
        </div>
        <p>Loading Admin Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to={`/${user.role}`} />;
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      {/* Add admin-specific routes here when needed */}
      <Route path="/" element={<Navigate to="/admin/dashboard" />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
   
    </Routes>
  );
}

export default App;