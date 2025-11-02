import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import AdminHeader from './AdminHeader.js';
import AdminStats from './AdminStats.js';
import ODRequestsTable from './ODRequestsTable.js';
import ODReviewModal from './ODReviewModal.js';
import StudentsManagement from './StudentsManagement.js';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewOD = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const handleODDecision = () => {
    setShowReviewModal(false);
    setSelectedRequest(null);
    fetchDashboardData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animated-logo">
          <div className="pulse-ring"></div>
          <div className="logo-icon">⚙️</div>
        </div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminHeader user={user} onLogout={logout} />
      
      <div className="admin-content">
        {/* Welcome Section */}
        <div className="admin-welcome fade-in">
          <div className="welcome-content">
            <h1>Welcome, {user?.name}! 🎯</h1>
            <p>Manage student attendance and OD requests efficiently</p>
          </div>
          <div className="admin-badges">
            <div className="admin-badge primary">
              <span className="badge-icon">👥</span>
              <span className="badge-text">
                {dashboardData?.stats?.total_students || 0} Students
              </span>
            </div>
            <div className="admin-badge warning">
              <span className="badge-icon">⏳</span>
              <span className="badge-text">
                {dashboardData?.stats?.pending_od_requests || 0} Pending OD
              </span>
            </div>
            <div className="admin-badge success">
              <span className="badge-icon">✅</span>
              <span className="badge-text">
                {dashboardData?.stats?.today_attendance || 0} Today's Attendance
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'od-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('od-requests')}
          >
            📋 OD Requests
            {dashboardData?.stats?.pending_od_requests > 0 && (
              <span className="tab-badge">
                {dashboardData.stats.pending_od_requests}
              </span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Students
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && dashboardData && (
            <>
              <AdminStats data={dashboardData} />
              
              {/* Recent OD Requests */}
              <div className="recent-section slide-up">
                <h2>Recent OD Requests</h2>
                <div className="recent-requests">
                  {dashboardData.recent_requests?.map((request, index) => (
                    <div 
                      key={request.id} 
                      className="request-card"
                      onClick={() => handleReviewOD(request)}
                    >
                      <div className="request-header">
                        <span className="student-name">{request.student_name}</span>
                        <span className={`status-badge ${request.status}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="request-details">
                        <span className="activity">{request.activity_name}</span>
                        <span className="activity-type">{request.activity_type}</span>
                      </div>
                      <div className="request-meta">
                        <span className="date">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {request.verified_by_ocr && (
                          <span className="ocr-verified">✅ OCR Verified</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!dashboardData.recent_requests || dashboardData.recent_requests.length === 0) && (
                    <div className="no-requests">
                      <div className="no-requests-icon">📋</div>
                      <p>No recent OD requests</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'od-requests' && (
            <ODRequestsTable onReviewRequest={handleReviewOD} />
          )}

          {activeTab === 'students' && (
            <StudentsManagement />
          )}
        </div>

        {/* OD Review Modal */}
        {showReviewModal && selectedRequest && (
          <ODReviewModal 
            request={selectedRequest}
            onClose={() => setShowReviewModal(false)}
            onDecision={handleODDecision}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;