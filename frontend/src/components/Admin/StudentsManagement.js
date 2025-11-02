import React, { useState, useEffect } from 'react';
import './StudentsManagement.css';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // This would typically come from your backend
      // For now, we'll use mock data
      const mockStudents = [
        {
          id: 1,
          student_id: '23IT56',
          name: 'Sujithra B',
          department: 'IT',
          year: '3',
          email: 'sujithra@college.edu',
          attendance_rate: '95%'
        },
        {
          id: 2,
          student_id: '23IT63',
          name: 'Yasodha R',
          department: 'IT',
          year: '3',
          email: 'yasodha@college.edu',
          attendance_rate: '92%'
        }
      ];
      
      setStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="students-loading">
        <div className="loading-spinner"></div>
        <p>Loading students data...</p>
      </div>
    );
  }

  return (
    <div className="students-management">
      <div className="section-header">
        <h2>Students Management</h2>
        <p>Manage and view all registered students</p>
      </div>

      <div className="students-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students by name, ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="control-buttons">
          <button className="control-btn primary">
            📥 Export List
          </button>
          <button className="control-btn secondary">
            👥 Add Student
          </button>
        </div>
      </div>

      <div className="students-grid">
        {filteredStudents.map((student, index) => (
          <div key={student.id} className="student-card slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="student-header">
              <div className="student-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="student-basic-info">
                <h3>{student.name}</h3>
                <p className="student-id">{student.student_id}</p>
              </div>
              <div className="attendance-rate">
                <span className="rate-badge">{student.attendance_rate}</span>
                <span className="rate-label">Attendance</span>
              </div>
            </div>

            <div className="student-details">
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{student.department}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Year:</span>
                <span className="detail-value">Year {student.year}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{student.email}</span>
              </div>
            </div>

            <div className="student-actions">
              <button className="action-btn view">
                👁️ View Profile
              </button>
              <button className="action-btn attendance">
                📊 Attendance
              </button>
              <button className="action-btn contact">
                ✉️ Contact
              </button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="no-students">
            <div className="no-students-icon">👥</div>
            <h3>No Students Found</h3>
            <p>No students match your search criteria.</p>
          </div>
        )}
      </div>

      <div className="students-footer">
        <div className="footer-info">
          Total Students: {students.length}
        </div>
        <div className="footer-actions">
          <button className="footer-btn" onClick={fetchStudents}>
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;