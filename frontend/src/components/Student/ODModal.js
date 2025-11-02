import React, { useState, useEffect } from 'react';
import './ODModal.css';

const ODModal = ({ onClose }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    activity_type: '',
    activity_name: '',
    event_date: '',
    event_venue: '',
    organized_by: '',
    coordinator_name: '',
    coordinator_contact: '',
    od_reason: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size too large. Please select a file smaller than 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedFile) {
      alert('Please select an OD document');
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    
    // Append form data
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    // Append file
    submitData.append('od_file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/upload-od', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        setResult(result);
        setStep('result');
      } else {
        alert(result.error || 'Failed to upload OD');
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'sports': return '⚽';
      case 'technical': return '💻';
      case 'cultural': return '🎭';
      case 'workshop': return '🔧';
      default: return '📋';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="od-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>📄 Upload On Duty Request</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="modal-content">
            <div className="od-instructions">
              <p>Submit On Duty request for extracurricular activities participation</p>
            </div>

            <form onSubmit={handleSubmit} className="od-form">
              <div className="form-section">
                <h3>Activity Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Activity Type *</label>
                    <select
                      name="activity_type"
                      value={formData.activity_type}
                      onChange={handleInputChange}
                      required
                      className="glow-input"
                    >
                      <option value="">Select Type</option>
                      <option value="sports">🏈 Sports</option>
                      <option value="technical">💻 Technical</option>
                      <option value="cultural">🎭 Cultural</option>
                      <option value="workshop">🔧 Workshop</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Activity Name *</label>
                    <select
                      name="activity_name"
                      value={formData.activity_name}
                      onChange={handleInputChange}
                      required
                      className="glow-input"
                    >
                      <option value="">Select Activity</option>
                      {activities.map(activity => (
                        <option key={activity.id} value={activity.name}>
                          {getActivityTypeIcon(activity.type)} {activity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      required
                      className="glow-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Event Venue</label>
                    <input
                      type="text"
                      name="event_venue"
                      value={formData.event_venue}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Auditorium"
                      className="glow-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Organized By</label>
                    <input
                      type="text"
                      name="organized_by"
                      value={formData.organized_by}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science Department"
                      className="glow-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Coordinator Name</label>
                    <input
                      type="text"
                      name="coordinator_name"
                      value={formData.coordinator_name}
                      onChange={handleInputChange}
                      placeholder="Faculty coordinator name"
                      className="glow-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Coordinator Contact</label>
                    <input
                      type="text"
                      name="coordinator_contact"
                      value={formData.coordinator_contact}
                      onChange={handleInputChange}
                      placeholder="Email or phone number"
                      className="glow-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>OD Document</h3>
                
                <div className="form-group full-width">
                  <label>Reason for OD *</label>
                  <textarea
                    name="od_reason"
                    value={formData.od_reason}
                    onChange={handleInputChange}
                    placeholder="Briefly describe why you need On Duty for this activity..."
                    required
                    rows="3"
                    className="glow-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Upload OD Document *</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="od-file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="file-input"
                    />
                    <label htmlFor="od-file" className="file-upload-label">
                      <div className="upload-icon">📎</div>
                      <div className="upload-text">
                        {selectedFile ? (
                          <>
                            <strong>{selectedFile.name}</strong>
                            <span>Click to change file</span>
                          </>
                        ) : (
                          <>
                            <strong>Choose OD Document</strong>
                            <span>PDF, JPG, PNG (Max 10MB)</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-requirements">
                <h4>📋 Required in OD Document:</h4>
                <ul>
                  <li>Official letterhead or certificate</li>
                  <li>Clear mention of activity and dates</li>
                  <li>Coordinator/faculty signature</li>
                  <li>College stamp (if applicable)</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="btn-loading">
                      <div className="spinner"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Submit OD Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && result && (
          <div className="modal-content">
            <div className="result-section">
              <div className={`verification-status ${result.verification.is_valid ? 'valid' : 'review'}`}>
                <div className="status-icon">
                  {result.verification.is_valid ? '✅' : '🔍'}
                </div>
                <h3>
                  {result.verification.is_valid 
                    ? 'OD Submitted Successfully!' 
                    : 'OD Under Review'
                  }
                </h3>
                <p>{result.verification.message}</p>
                
                {result.verification.detected_activity && (
                  <div className="activity-detected">
                    Detected: <strong>{result.verification.detected_activity}</strong> activity
                  </div>
                )}
              </div>

              <div className="next-steps">
                <h4>Next Steps:</h4>
                <ul>
                  <li>✅ Your request has been submitted</li>
                  <li>⏳ Admin will review your OD document</li>
                  <li>📧 You'll be notified once approved/rejected</li>
                  <li>📊 Check status in your dashboard</li>
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn primary" onClick={onClose}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ODModal;