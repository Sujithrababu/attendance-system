import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
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

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      navigate(`/${user.role}`);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

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
            <h1>AI Attendance</h1>
          </div>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        {error && (
          <div className="error-message slide-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
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
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="glow-input"
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
          <div className="demo-accounts">
            <p><strong>Demo Accounts:</strong></p>
            <p>Admin: admin / admin123</p>
            <p>Student: Register new account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;