import React, { useState, useEffect } from 'react';
import StudentHeader from './StudentHeader.js';
import { useAuth } from '../../contexts/AuthContext.js';

const ActivitiesPage = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching activities
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          activity_name: 'Sports Tournament',
          event_date: '2024-01-10',
          status: 'approved',
          type: 'sports'
        },
        {
          id: 2,
          activity_name: 'Hackathon',
          event_date: '2024-01-15',
          status: 'pending',
          type: 'technical'
        },
        {
          id: 3,
          activity_name: 'Cultural Fest',
          event_date: '2024-01-20',
          status: 'approved',
          type: 'cultural'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="professional-student-dashboard">
      <StudentHeader user={user} onLogout={logout} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>All Activities</h1>
            <p>Complete history of your OD requests and activities</p>
          </div>
        </div>

        <div className="activities-content">
          {loading ? (
            <div className="loading-state">Loading activities...</div>
          ) : (
            <div className="activities-table">
              <div className="table-header">
                <span>Activity Name</span>
                <span>Event Date</span>
                <span>Type</span>
                <span>Status</span>
              </div>
              {activities.map(activity => (
                <div key={activity.id} className="table-row">
                  <span>{activity.activity_name}</span>
                  <span>{activity.event_date}</span>
                  <span className={`activity-type ${activity.type}`}>
                    {activity.type}
                  </span>
                  <span className={`status-badge ${activity.status}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;