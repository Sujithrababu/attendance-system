import React, { useState, useEffect } from 'react';
import './ODRequestsTable.css';

const ODRequestsTable = ({ onReviewRequest }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchODRequests();
  }, [filter]);

  const fetchODRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? 'http://localhost:5000/api/admin/od-requests'
        : `http://localhost:5000/api/admin/od-requests?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.od_requests || []);
      }
    } catch (error) {
      console.error('Error fetching OD requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sports': return '⚽';
      case 'technical': return '💻';
      case 'cultural': return '🎭';
      case 'workshop': return '🔧';
      default: return '📋';
    }
  };

  const filteredRequests = requests.filter(request =>
    request.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.activity_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Loading OD requests...</p>
      </div>
    );
  }

  return (
    <div className="od-requests-table">
      <div className="table-header">
        <h2>On Duty Requests</h2>
        
        <div className="table-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search students or activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              ⏳ Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              ✅ Approved
            </button>
            <button 
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              ❌ Rejected
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <div className="no-requests-icon">📋</div>
            <h3>No OD Requests Found</h3>
            <p>There are no OD requests matching your criteria.</p>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Activity</th>
                <th>Event Date</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>OCR</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr key={request.id} className="table-row slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="student-cell">
                    <div className="student-info">
                      <div className="student-name">{request.student_name}</div>
                      <div className="student-id">{request.student_id}</div>
                    </div>
                  </td>
                  <td className="activity-cell">
                    <div className="activity-info">
                      <span className="activity-icon">
                        {getActivityIcon(request.activity_type)}
                      </span>
                      <div>
                        <div className="activity-name">{request.activity_name}</div>
                        <div className="activity-type">{request.activity_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="date-cell">
                    {new Date(request.event_date).toLocaleDateString()}
                  </td>
                  <td className="submitted-cell">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="status-cell">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(request.status)}20`,
                        color: getStatusColor(request.status)
                      }}
                    >
                      {getStatusIcon(request.status)} {request.status}
                    </span>
                  </td>
                  <td className="ocr-cell">
                    {request.verified_by_ocr ? (
                      <span className="ocr-verified">✅</span>
                    ) : (
                      <span className="ocr-pending">🔍</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="review-btn"
                      onClick={() => onReviewRequest(request)}
                    >
                      👁️ Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-footer">
        <div className="table-info">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
        <button className="refresh-btn" onClick={fetchODRequests}>
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default ODRequestsTable;