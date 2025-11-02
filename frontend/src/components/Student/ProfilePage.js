// src/components/student/ProfilePage.js
import React from 'react';
import StudentHeader from './StudentHeader';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="professional-student-dashboard">
      <StudentHeader user={user} onLogout={logout} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>👤 Student Profile</h1>
            <p>Manage your personal information and academic details</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <h3>Personal Information</h3>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name || 'Not available'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Student ID:</span>
                <span className="info-value">{user?.student_id || 'Not available'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Department:</span>
                <span className="info-value">{user?.department || 'Not available'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.username || 'Not available'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;