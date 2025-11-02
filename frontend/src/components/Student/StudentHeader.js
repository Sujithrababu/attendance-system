import React, { useState } from 'react';
import './StudentHeader.css';

const StudentHeader = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="student-header">
      <div className="header-content">
        <div className="header-brand">
          <div className="brand-logo">
            <span className="logo-icon">🎯</span>
            <span className="brand-text">AI Attendance</span>
          </div>
          <div className="header-tag">Student Portal</div>
        </div>

        <div className="header-actions">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-id">{user?.student_id}</span>
            </div>
            <button 
              className="dropdown-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              ▼
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu slide-down">
                <div className="dropdown-item">
                  <span>👤</span>
                  Profile
                </div>
                <div className="dropdown-item">
                  <span>⚙️</span>
                  Settings
                </div>
                <div className="dropdown-divider"></div>
                <div 
                  className="dropdown-item logout-item"
                  onClick={onLogout}
                >
                  <span>🚪</span>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;