import React from 'react';
import './DashboardStats.css';

const DashboardStats = ({ data }) => {
  const { today_attendance, od_stats, student_info } = data;

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'present': return '#10b981';
      case 'on_duty': return '#3b82f6';
      case 'absent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case 'present': return '✅';
      case 'on_duty': return '📋';
      case 'absent': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="dashboard-stats">
      <h2>Today's Overview</h2>
      <div className="stats-grid">
        <div className="stat-card attendance-status">
          <div className="stat-icon" style={{ color: getAttendanceColor(today_attendance) }}>
            {getAttendanceIcon(today_attendance)}
          </div>
          <div className="stat-content">
            <h3>Attendance Status</h3>
            <p className="stat-value">{today_attendance || 'Not Marked'}</p>
            <p className="stat-label">Today</p>
          </div>
        </div>

        <div className="stat-card od-stats">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>OD Requests</h3>
            <div className="od-breakdown">
              <div className="od-item">
                <span className="od-count approved">{od_stats?.approved || 0}</span>
                <span className="od-label">Approved</span>
              </div>
              <div className="od-item">
                <span className="od-count pending">{od_stats?.pending || 0}</span>
                <span className="od-label">Pending</span>
              </div>
              <div className="od-item">
                <span className="od-count rejected">{od_stats?.rejected || 0}</span>
                <span className="od-label">Rejected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card student-info">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>Student Info</h3>
            <p className="info-item">
              <strong>ID:</strong> {student_info?.student_id}
            </p>
            <p className="info-item">
              <strong>Dept:</strong> {student_info?.department || 'Not set'}
            </p>
            <p className="info-item">
              <strong>Year:</strong> {student_info?.year || 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;