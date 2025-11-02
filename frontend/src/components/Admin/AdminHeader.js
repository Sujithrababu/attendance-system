import React, { useState } from 'react';
import './AdminHeader.css';

const AdminHeader = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="header-brand">
          <div className="brand-logo">
            <span className="logo-icon">⚙️</span>
            <span className="brand-text">AI Attendance</span>
          </div>
          <div className="header-tag">Admin Portal</div>
        </div>

        <div className="header-actions">
          <div className="admin-notifications">
            <button className="notifications-btn">
              🔔
              <span className="notification-dot"></span>
            </button>
          </div>

          <div className="user-info">
            <div className="user-avatar admin">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Administrator</span>
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
                  Admin Profile
                </div>
                <div className="dropdown-item">
                  <span>⚙️</span>
                  System Settings
                </div>
                <div className="dropdown-item">
                  <span>📊</span>
                  Analytics
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

export default AdminHeader;