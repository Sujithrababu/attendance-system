import React from 'react';
import './ActivityFeed.css';

const ActivityFeed = ({ activities }) => {
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

  if (!activities || activities.length === 0) {
    return (
      <div className="activity-feed">
        <h2>Recent Activities</h2>
        <div className="no-activities">
          <div className="no-activities-icon">📊</div>
          <p>No recent activities found</p>
          <span>Your OD requests and attendance will appear here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <h2>Recent Activities</h2>
      <div className="activities-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="activity-icon">
              {getStatusIcon(activity.status)}
            </div>
            <div className="activity-content">
              <h4>{activity.activity_name}</h4>
              <p>Event Date: {activity.event_date}</p>
            </div>
            <div 
              className="activity-status"
              style={{ color: getStatusColor(activity.status) }}
            >
              {activity.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;