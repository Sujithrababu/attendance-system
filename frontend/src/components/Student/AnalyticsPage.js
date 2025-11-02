import React, { useState } from 'react';
import StudentHeader from './StudentHeader.js';
import { useAuth } from '../../contexts/AuthContext.js';

const ReportsPage = () => {
  const { user, logout } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);

  // Sample report data
  const reportStats = {
    monthly: {
      generated: 12,
      lastGenerated: '2024-01-15',
      size: '2.4 MB'
    },
    semester: {
      generated: 3,
      lastGenerated: '2024-01-10',
      size: '5.1 MB'
    },
    performance: {
      generated: 8,
      lastGenerated: '2024-01-18',
      size: '3.2 MB'
    },
    odSummary: {
      generated: 5,
      lastGenerated: '2024-01-20',
      size: '1.8 MB'
    }
  };

  const handleGenerateReport = (reportType) => {
    setSelectedReport(reportType);
    // Simulate report generation
    setTimeout(() => {
      alert(`${reportType} report generated successfully!`);
      setSelectedReport(null);
    }, 2000);
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'monthly': return '📅';
      case 'semester': return '📊';
      case 'performance': return '🎯';
      case 'odSummary': return '📈';
      default: return '📋';
    }
  };

  const getReportTitle = (type) => {
    switch (type) {
      case 'monthly': return 'Monthly Report';
      case 'semester': return 'Semester Report';
      case 'performance': return 'Performance Report';
      case 'odSummary': return 'OD Summary Report';
      default: return 'Report';
    }
  };

  return (
    <div className="professional-student-dashboard">
      <StudentHeader user={user} onLogout={logout} />
      
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>📋 Attendance Reports</h1>
            
          </div>
          <div className="date-display">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="reports-content">
          <div className="reports-grid">
            {/* Monthly Report Card */}
            <div className="report-card">
              <div className="report-icon">
                <span>📅</span>
              </div>
              <div className="report-content">
                <h3>Monthly Attendance Report</h3>
                <p>Detailed monthly summary with attendance patterns and analytics</p>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Generated</span>
                    <span className="stat-value">{reportStats.monthly.generated} times</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last</span>
                    <span className="stat-value">{reportStats.monthly.lastGenerated}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Size</span>
                    <span className="stat-value">{reportStats.monthly.size}</span>
                  </div>
                </div>
              </div>
              <button 
                className={`generate-btn ${selectedReport === 'monthly' ? 'loading' : ''}`}
                onClick={() => handleGenerateReport('monthly')}
                disabled={selectedReport}
              >
                {selectedReport === 'monthly' ? (
                  <>
                    <div className="btn-spinner"></div>
                    Generating...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
            </div>

            {/* Semester Report Card */}
            <div className="report-card">
              <div className="report-icon">
                <span>📊</span>
              </div>
              <div className="report-content">
                <h3>Semester Report</h3>
                <p>Complete semester overview with trends and comparative analysis</p>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Generated</span>
                    <span className="stat-value">{reportStats.semester.generated} times</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last</span>
                    <span className="stat-value">{reportStats.semester.lastGenerated}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Size</span>
                    <span className="stat-value">{reportStats.semester.size}</span>
                  </div>
                </div>
              </div>
              <button 
                className={`generate-btn ${selectedReport === 'semester' ? 'loading' : ''}`}
                onClick={() => handleGenerateReport('semester')}
                disabled={selectedReport}
              >
                {selectedReport === 'semester' ? (
                  <>
                    <div className="btn-spinner"></div>
                    Generating...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
            </div>

            {/* Performance Report Card */}
            <div className="report-card">
              <div className="report-icon">
                <span>🎯</span>
              </div>
              <div className="report-content">
                <h3>Performance Analytics</h3>
                <p>Detailed performance analysis with insights and recommendations</p>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Generated</span>
                    <span className="stat-value">{reportStats.performance.generated} times</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last</span>
                    <span className="stat-value">{reportStats.performance.lastGenerated}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Size</span>
                    <span className="stat-value">{reportStats.performance.size}</span>
                  </div>
                </div>
              </div>
              <button 
                className={`generate-btn ${selectedReport === 'performance' ? 'loading' : ''}`}
                onClick={() => handleGenerateReport('performance')}
                disabled={selectedReport}
              >
                {selectedReport === 'performance' ? (
                  <>
                    <div className="btn-spinner"></div>
                    Generating...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
            </div>

            {/* OD Summary Report Card */}
            <div className="report-card">
              <div className="report-icon">
                <span>📈</span>
              </div>
              <div className="report-content">
                <h3>OD Summary Report</h3>
                <p>On Duty requests summary with approval status and history</p>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Generated</span>
                    <span className="stat-value">{reportStats.odSummary.generated} times</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last</span>
                    <span className="stat-value">{reportStats.odSummary.lastGenerated}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Size</span>
                    <span className="stat-value">{reportStats.odSummary.size}</span>
                  </div>
                </div>
              </div>
              <button 
                className={`generate-btn ${selectedReport === 'odSummary' ? 'loading' : ''}`}
                onClick={() => handleGenerateReport('odSummary')}
                disabled={selectedReport}
              >
                {selectedReport === 'odSummary' ? (
                  <>
                    <div className="btn-spinner"></div>
                    Generating...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
            </div>
          </div>

          {/* Recent Reports Section */}
          <div className="recent-reports-section">
            <div className="section-header">
              <h2>📄 Recently Generated Reports</h2>
              <span className="section-badge">Last 30 days</span>
            </div>
            <div className="reports-list">
              <div className="report-item">
                <div className="report-item-icon">📅</div>
                <div className="report-item-content">
                  <h4>January 2024 Monthly Report</h4>
                  <p>Generated on Jan 15, 2024 • 2.4 MB</p>
                </div>
                <button className="download-btn">⬇️</button>
              </div>
              
              <div className="report-item">
                <div className="report-item-icon">🎯</div>
                <div className="report-item-content">
                  <h4>Performance Analytics Q4 2023</h4>
                  <p>Generated on Jan 10, 2024 • 3.2 MB</p>
                </div>
                <button className="download-btn">⬇️</button>
              </div>
              
              <div className="report-item">
                <div className="report-item-icon">📊</div>
                <div className="report-item-content">
                  <h4>Fall Semester 2023 Report</h4>
                  <p>Generated on Jan 5, 2024 • 5.1 MB</p>
                </div>
                <button className="download-btn">⬇️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;