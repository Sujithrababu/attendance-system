import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import AdminHeader from './AdminHeader.js';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [odRequests, setOdRequests] = useState([]);
  const [filter, setFilter] = useState('all'); // Add this state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchODRequests();
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
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchODRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/od-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOdRequests(data.od_requests || []);
      }
    } catch (error) {
      console.error('Error fetching OD requests:', error);
    }
  };

  // Filter OD requests based on selected filter
  const filteredRequests = filter === 'all' 
    ? odRequests 
    : odRequests.filter(req => req.status === filter);

  // Get counts for each filter
  const getRequestCount = (status) => {
    if (status === 'all') return odRequests.length;
    return odRequests.filter(req => req.status === status).length;
  };

  if (loading) {
    return (
      <div className="professional-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-logo">👨‍💼</div>
        </div>
        <h3>Loading Admin Dashboard</h3>
        <p>Preparing administrative insights...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminHeader user={user} onLogout={logout} />
      
      <div className="admin-content">
        {/* Welcome Section */}
        <div className="admin-welcome">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Manage student attendance and OD requests efficiently</p>
          </div>
          <div className="admin-badges">
            <div className="admin-badge primary">
              <span className="badge-icon">👨‍💼</span>
              <span>Administrator</span>
            </div>
            <div className="admin-badge warning">
              <span className="badge-icon">⏳</span>
              <span>{getRequestCount('pending')} Pending</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{dashboardData?.stats?.total_students || 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{dashboardData?.stats?.today_attendance || 0}</div>
            <div className="stat-label">Today's Attendance</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{getRequestCount('pending')}</div>
            <div className="stat-label">Pending OD Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{getRequestCount('approved')}</div>
            <div className="stat-label">Approved Requests</div>
          </div>
        </div>

        {/* OD Requests Section */}
        <div className="od-requests-section">
          <div className="section-header">
            <h2>📋 OD Requests</h2>
            <div className="od-filters">
              <div className="filter-group">
                <button 
                  className={`filter-option all ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <span className="filter-icon">📊</span>
                  All
                  <span className="filter-count">{getRequestCount('all')}</span>
                </button>
                
                <button 
                  className={`filter-option pending ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilter('pending')}
                >
                  <span className="filter-icon">⏳</span>
                  Pending
                  <span className="filter-count">{getRequestCount('pending')}</span>
                </button>
                
                <button 
                  className={`filter-option approved ${filter === 'approved' ? 'active' : ''}`}
                  onClick={() => setFilter('approved')}
                >
                  <span className="filter-icon">✅</span>
                  Approved
                  <span className="filter-count">{getRequestCount('approved')}</span>
                </button>
                
                <button 
                  className={`filter-option rejected ${filter === 'rejected' ? 'active' : ''}`}
                  onClick={() => setFilter('rejected')}
                >
                  <span className="filter-icon">❌</span>
                  Rejected
                  <span className="filter-count">{getRequestCount('rejected')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Request Count */}
          <div className="request-count">
            <span className="count-text">Showing {filteredRequests.length} of {odRequests.length} requests</span>
            <span className="count-number">{filteredRequests.length}</span>
          </div>

          {/* Filter Status (only show when filtered) */}
          {filter !== 'all' && (
            <div className="filter-status">
              <div className="filter-tag">
                <span>Filter:</span>
                <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
              </div>
              <button className="clear-filters" onClick={() => setFilter('all')}>
                Clear Filters
              </button>
            </div>
          )}

          {/* OD Requests Grid or Empty State */}
          {filteredRequests.length > 0 ? (
            <div className="od-requests-grid">
              {filteredRequests.map(request => (
                <div key={request.id} className="od-request-card">
                  <div className="request-header">
                    <div className="student-info">
                      <h4>{request.student_name}</h4>
                      <p>ID: {request.student_id}</p>
                    </div>
                    <div className={`status-badge ${request.status}`}>
                      {request.status}
                    </div>
                  </div>
                  
                  <div className="activity-details">
                    <div className="activity-type">{request.activity_type}</div>
                    <div className="activity-name">{request.activity_name}</div>
                    <div className="activity-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>Event Date: {request.event_date}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🏢</span>
                        <span>Organized by: {request.organized_by || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`ocr-verification ${request.verified_by_ocr ? 'ocr-verified' : 'ocr-pending'}`}>
                    <div className="ocr-icon">
                      {request.verified_by_ocr ? '✓' : '!'}
                    </div>
                    <div className="ocr-text">
                      {request.verified_by_ocr ? 'OCR Verified' : 'Pending OCR Verification'}
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button className="action-btn view-btn">
                      👁️ View Details
                    </button>
                    <button className="action-btn approve-btn">
                      ✅ Approve
                    </button>
                    <button className="action-btn reject-btn">
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-requests">
              <div className="no-requests-icon">📋</div>
              <h3>No OD Requests Found</h3>
              <p>There are no OD requests matching your criteria.</p>
              <button className="refresh-btn" onClick={fetchODRequests}>
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;