import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentHeader.css';

const StudentHeader = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/student/profile');
  };

  const handleSettingsClick = () => {
    setShowDropdown(false);
    navigate('/student/settings');
  };

  return (
    <header className="professional-header">
      <div className="header-container">
        {/* Left Section - Brand */}
        <div className="header-brand">
          <div className="brand-logo">
            <div className="logo-icon">
              <span>🎓</span>
            </div>
            <div className="brand-text">
              <h1>EduTrack Pro</h1>
              <span className="brand-subtitle">Student Portal</span>
            </div>
          </div>
        </div>

        {/* Right Section - User Profile */}
        <div className="header-profile" ref={dropdownRef}>
          <div 
            className="profile-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="profile-avatar">
              <span className="avatar-text">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <div className="avatar-status"></div>
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.name}</span>
              <span className="profile-role">Student • {user?.department}</span>
            </div>
            <div className="profile-arrow">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path 
                  d="M3 4.5L6 7.5L9 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  <span className="avatar-text-large">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="dropdown-user-info">
                  <h4>{user?.name}</h4>
                  <p>{user?.student_id} • {user?.department}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>

              <div className="dropdown-menu">
                <div className="menu-item" onClick={handleProfileClick}>
                  <div className="menu-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 20C6 17.7909 7.79086 16 10 16H14C16.2091 16 18 17.7909 18 20V21H6V20Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span>My Profile</span>
                </div>

                <div className="menu-item" onClick={handleSettingsClick}>
                  <div className="menu-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19.4 15C19.2669 15.3031 19.1337 15.6062 19.0006 15.9094C18.6138 16.7486 18.227 17.5878 17.8402 18.427C17.303 19.605 16.7658 20.783 16.2286 21.961C16.1108 22.224 15.8516 22.4 15.5652 22.4H8.4348C8.14836 22.4 7.88917 22.224 7.77142 21.961C7.23418 20.783 6.69694 19.605 6.1597 18.427C5.77294 17.5878 5.38618 16.7486 4.99942 15.9094C4.73373 15.3031 4.60039 15 4.60039 15" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19.4 15C19.4 11.749 17.8333 9.33333 15 9.33333C17.8333 9.33333 19.4 6.91765 19.4 3.66667C19.4 6.91765 20.9667 9.33333 23.8 9.33333C20.9667 9.33333 19.4 11.749 19.4 15Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span>Settings</span>
                </div>

                <div className="dropdown-divider"></div>

                <div className="menu-item logout-item" onClick={handleLogout}>
                  <div className="menu-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;