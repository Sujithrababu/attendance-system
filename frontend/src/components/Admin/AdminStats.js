import React from 'react';
import './AdminStats.css';

const AdminStats = ({ data }) => {
  const { stats, od_breakdown } = data.stats || {};

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.total_students || 0,
      icon: '👥',
      color: '#3b82f6',
      change: '+5%'
    },
    {
      title: "Today's Attendance",
      value: stats?.today_attendance || 0,
      icon: '✅',
      color: '#10b981',
      change: '+12%'
    },
    {
      title: 'Pending OD Requests',
      value: stats?.pending_od_requests || 0,
      icon: '⏳',
      color: '#f59e0b',
      change: '-3%'
    },
    {
      title: 'OD Approval Rate',
      value: '85%',
      icon: '📈',
      color: '#8b5cf6',
      change: '+2%'
    }
  ];

  const odStatusData = [
    { status: 'Approved', count: od_breakdown?.approved || 0, color: '#10b981' },
    { status: 'Pending', count: od_breakdown?.pending || 0, color: '#f59e0b' },
    { status: 'Rejected', count: od_breakdown?.rejected || 0, color: '#ef4444' }
  ];

  return (
    <div className="admin-stats">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={stat.title} 
            className="stat-card slide-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change" style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* OD Status Breakdown */}
      <div className="od-breakdown-section">
        <h3>OD Requests Breakdown</h3>
        <div className="od-breakdown">
          {odStatusData.map((item, index) => (
            <div key={item.status} className="od-status-item">
              <div className="status-info">
                <div 
                  className="status-color" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="status-name">{item.status}</span>
              </div>
              <div className="status-count">{item.count}</div>
              <div className="status-bar">
                <div 
                  className="status-fill"
                  style={{ 
                    width: `${(item.count / Math.max(1, odStatusData.reduce((sum, i) => sum + i.count, 0)) * 100)}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            📥 Export Reports
          </button>
          <button className="action-btn secondary">
            🔄 Refresh Data
          </button>
          <button className="action-btn warning">
            ⚙️ System Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;