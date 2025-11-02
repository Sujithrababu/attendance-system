import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import StudentHeader from './StudentHeader.js';
import AttendanceModal from './AttendanceModal.js';
import ODModal from './ODModal.js';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  // Navigation handlers - Updated with correct paths
  const handleViewAnalytics = () => {
    navigate('/student/analytics');
  };

  const handleViewAllActivities = () => {
    navigate('/student/activities');
  };

  const handleViewReports = () => {
    navigate('/student/reports');
  };

  const handleActivityClick = (activity) => {
    // You can navigate to a detailed activity page or show a modal
    console.log('Activity clicked:', activity);
    // navigate(`/student/activity/${activity.id}`); // If you have individual activity pages
  };

  const getAttendanceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return '#10b981';
      case 'absent': return '#ef4444';
      case 'on_duty': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getAttendanceStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'on_duty': return 'On Duty';
      default: return 'Not Marked';
    }
  };

  if (loading) {
    return (
      <div className="professional-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-logo">🎓</div>
        </div>
        <h3>Loading Your Academic Dashboard</h3>
        <p>Preparing your personalized insights...</p>
      </div>
    );
  }

  return (
    <div className="professional-student-dashboard">
      <StudentHeader user={user} onLogout={logout} />
      
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's your academic overview for today</p>
          </div>
          <div className="header-actions">
            <div className="date-display">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <span>📊</span>
            </div>
            <div className="stat-content">
              <h3>Today's Attendance</h3>
              <div className="stat-value" style={{ color: getAttendanceStatusColor(dashboardData?.today_attendance) }}>
                {getAttendanceStatusText(dashboardData?.today_attendance)}
              </div>
              <p>Last updated: Today</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <span>✅</span>
            </div>
            <div className="stat-content">
              <h3>Approved OD</h3>
              <div className="stat-value">{dashboardData?.od_stats?.approved || 0}</div>
              <p>This semester</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <span>⏳</span>
            </div>
            <div className="stat-content">
              <h3>Pending Requests</h3>
              <div className="stat-value">{dashboardData?.od_stats?.pending || 0}</div>
              <p>Awaiting approval</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <span>👤</span>
            </div>
            <div className="stat-content">
              <h3>Student ID</h3>
              <div className="stat-value">{user?.student_id}</div>
              <p>{user?.department}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Left Column - Actions */}
          <div className="content-column">
            <div className="action-section">
              <h2>Quick Actions</h2>
              <div className="action-cards">
                <div 
                  className="action-card primary"
                  onClick={() => setShowAttendanceModal(true)}
                >
                  <div className="action-icon">
                    <span>📷</span>
                  </div>
                  <div className="action-content">
                    <h3>Mark Attendance</h3>
                    <p>Use face recognition to mark your presence for today</p>
                    <div className="action-badge">
                      {dashboardData?.today_attendance === 'present' ? 'Already Marked' : 'Required'}
                    </div>
                  </div>
                  <div className="action-arrow">→</div>
                </div>

                <div 
                  className="action-card secondary"
                  onClick={() => setShowODModal(true)}
                >
                  <div className="action-icon">
                    <span>📄</span>
                  </div>
                  <div className="action-content">
                    <h3>Submit OD Request</h3>
                    <p>Upload documents for extracurricular activities</p>
                    <div className="action-badge pending">
                      {dashboardData?.od_stats?.pending || 0} Pending
                    </div>
                  </div>
                  <div className="action-arrow">→</div>
                </div>

                <div 
                  className="action-card tertiary"
                  onClick={handleViewAnalytics}
                >
                  <div className="action-icon">
                    <span>📈</span>
                  </div>
                  <div className="action-content">
                    <h3>View Analytics</h3>
                    <p>Check your attendance trends and performance</p>
                    <div className="action-badge" onClick={(e) => {
                      e.stopPropagation();
                      handleViewReports();
                    }}>
                      View Reports
                    </div>
                  </div>
                  <div className="action-arrow">→</div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="recent-activities">
              <div className="section-header">
                <h2>Recent Activities</h2>
                
              </div>
              <div className="activities-list">
                {dashboardData?.recent_activities?.length > 0 ? (
                  dashboardData.recent_activities.map((activity, index) => (
                    <div 
                      key={index} 
                      className="activity-item"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="activity-icon">
                        <span>📋</span>
                      </div>
                      <div className="activity-content">
                        <h4>{activity.activity_name}</h4>
                        <p>Event Date: {activity.event_date}</p>
                      </div>
                      <div className={`activity-status ${activity.status}`}>
                        {activity.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-activities">
                    <div className="no-activities-icon">📋</div>
                    <p>No recent activities</p>
                    <span>Your OD requests will appear here</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="content-column">
            {/* Attendance Overview */}
            <div className="stats-card">
              <div className="card-header">
                <h3>Attendance Overview</h3>
                <span className="card-badge">This Week</span>
              </div>
              <div className="attendance-stats">
                <div className="attendance-metric">
                  <span className="metric-label">Present</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill present" 
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <span className="metric-value">85%</span>
                </div>
                <div className="attendance-metric">
                  <span className="metric-label">On Duty</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill on-duty" 
                      style={{ width: '10%' }}
                    ></div>
                  </div>
                  <span className="metric-value">10%</span>
                </div>
                <div className="attendance-metric">
                  <span className="metric-label">Absent</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill absent" 
                      style={{ width: '5%' }}
                    ></div>
                  </div>
                  <span className="metric-value">5%</span>
                </div>
              </div>
            </div>

            {/* OD Statistics */}
            <div className="stats-card">
              <div className="card-header">
                <h3>OD Request Status</h3>
                <span className="card-badge">Current</span>
              </div>
              <div className="od-stats-grid">
                <div className="od-stat approved">
                  <span className="od-count">{dashboardData?.od_stats?.approved || 0}</span>
                  <span className="od-label">Approved</span>
                </div>
                <div className="od-stat pending">
                  <span className="od-count">{dashboardData?.od_stats?.pending || 0}</span>
                  <span className="od-label">Pending</span>
                </div>
                <div className="od-stat rejected">
                  <span className="od-count">{dashboardData?.od_stats?.rejected || 0}</span>
                  <span className="od-label">Rejected</span>
                </div>
              </div>
            </div>

           
            
          </div>
        </div>

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