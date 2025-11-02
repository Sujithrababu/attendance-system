import React from 'react';
import StudentHeader from './StudentHeader.js';
import { useAuth } from '../../contexts/AuthContext.js';

const ReportsPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="professional-student-dashboard">
      <StudentHeader user={user} onLogout={logout} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Attendance Reports</h1>
            <p>Generate and download detailed attendance reports</p>
          </div>
        </div>

        <div className="reports-content">
          <div className="reports-grid">
            <div className="report-card">
              <h3>📋 Monthly Report</h3>
              <p>Generate monthly attendance summary</p>
              <button className="generate-btn">Generate Report</button>
            </div>

            <div className="report-card">
              <h3>📅 Semester Report</h3>
              <p>Complete semester attendance overview</p>
              <button className="generate-btn">Generate Report</button>
            </div>

            <div className="report-card">
              <h3>🎯 Performance Report</h3>
              <p>Detailed performance analysis</p>
              <button className="generate-btn">Generate Report</button>
            </div>

            <div className="report-card">
              <h3>📊 OD Summary</h3>
              <p>On Duty requests summary</p>
              <button className="generate-btn">Generate Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;