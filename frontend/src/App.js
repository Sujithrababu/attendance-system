import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login.js';
import Register from './components/Auth/Register.js';
import StudentDashboard from './components/Student/StudentDashboard.js';
import AdminDashboard from './components/Admin/AdminDashboard.js';
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
            <Route path="/student/*" element={<ProtectedRoute role="student" />} />
            <Route path="/admin/*" element={<ProtectedRoute role="admin" />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animated-logo">
          <div className="pulse-ring"></div>
          <div className="logo-icon">🎯</div>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} />;
  }

  return role === 'student' ? <StudentDashboard /> : <AdminDashboard />;
}

export default App;