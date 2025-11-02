// src/components/student/SettingsPage.js
import React from 'react';
import StudentHeader from './StudentHeader';
import { useAuth } from '../../contexts/AuthContext';

const SettingsPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="professional-student-dashboard">
      <StudentHeader user={user} onLogout={logout} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>⚙️ Settings</h1>
            <p>Customize your application preferences</p>
          </div>
        </div>

        <div className="settings-content">
          <div className="settings-card">
            <h3>Notification Settings</h3>
            <p>Configure how you receive notifications and alerts.</p>
            <div className="setting-item">
              <span>Email Notifications</span>
              <button className="btn primary">Enable</button>
            </div>
            <div className="setting-item">
              <span>Push Notifications</span>
              <button className="btn secondary">Configure</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;