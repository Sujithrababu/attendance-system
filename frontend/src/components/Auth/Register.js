import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student',
    student_id: '',
    name: '',
    department: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="success-message scale-in">
          <div className="success-icon">✅</div>
          <h2>Registration Successful!</h2>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <h1>Create Account</h1>
          </div>
          <p>Join our AI-powered attendance system</p>
        </div>

        {error && (
          <div className="error-message slide-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="glow-input"
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="glow-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="glow-input"
              />
            </div>

            <div className="form-group">
              <label>Student ID *</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                className="glow-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="glow-input"
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">Electronics</option>
                <option value="EEE">Electrical</option>
                <option value="MECH">Mechanical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="glow-input"
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="glow-input"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;