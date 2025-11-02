import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import StudentHeader from './StudentHeader.js';
import DashboardStats from './DashboardStats.js';
import AttendanceModal from './AttendanceModal.js';
import ODModal from './ODModal.js';
import ActivityFeed from './ActivityFeed.js';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showODModal, setShowODModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSelect = (action) => {
    if (action === 'attendance') {
      setShowAttendanceModal(true);
    } else if (action === 'od') {
      setShowODModal(true);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animated-logo">
          <div className="pulse-ring"></div>
          <div className="logo-icon">🎯</div>
        </div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <StudentHeader user={user} onLogout={logout} />
      
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section fade-in">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Ready to manage your attendance and extracurricular activities?</p>
          </div>
          <div className="welcome-graphic">
            <div className="floating-element">📚</div>
            <div className="floating-element">🏆</div>
            <div className="floating-element">🎭</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions slide-up">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <div 
              className="action-card attendance-card"
              onClick={() => handleActionSelect('attendance')}
            >
              <div className="action-icon">📷</div>
              <h3>Mark Attendance</h3>
              <p>Use face recognition to mark your presence</p>
              <div className="action-badge pulse">
                {dashboardData?.today_attendance === 'present' ? 'Marked' : 'Pending'}
              </div>
            </div>

            <div 
              className="action-card od-card"
              onClick={() => handleActionSelect('od')}
            >
              <div className="action-icon">📄</div>
              <h3>Upload OD</h3>
              <p>Submit On Duty for extracurricular activities</p>
              <div className="action-badge">
                {dashboardData?.od_stats?.pending || 0} Pending
              </div>
            </div>

            <div className="action-card stats-card">
              <div className="action-icon">📊</div>
              <h3>My Stats</h3>
              <p>View your attendance and activity history</p>
              <div className="stats-preview">
                <span>OD Approved: {dashboardData?.od_stats?.approved || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {dashboardData && (
          <DashboardStats data={dashboardData} />
        )}

        {/* Recent Activities */}
        {dashboardData?.recent_activities && (
          <ActivityFeed activities={dashboardData.recent_activities} />
        )}

        {/* Modals */}
        {showAttendanceModal && (
          <AttendanceModal 
            onClose={() => {
              setShowAttendanceModal(false);
              fetchDashboardData();
            }}
          />
        )}

        {showODModal && (
          <ODModal 
            onClose={() => {
              setShowODModal(false);
              fetchDashboardData();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;