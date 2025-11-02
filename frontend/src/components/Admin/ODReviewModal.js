import React, { useState } from 'react';
import './ODReviewModal.css';

const ODReviewModal = ({ request, onClose, onDecision }) => {
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!decision) {
      alert('Please select Approve or Reject');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = decision === 'approve' 
        ? `http://localhost:5000/api/admin/approve-od/${request.id}`
        : `http://localhost:5000/api/admin/reject-od/${request.id}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        alert(`OD request ${decision === 'approve' ? 'approved' : 'rejected'} successfully!`);
        onDecision();
      } else {
        alert('Failed to process request');
      }
    } catch (error) {
      alert('Error processing request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
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
      <div className="od-review-modal">
        <div className="modal-header">
          <h2>📋 Review OD Request</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Student Information */}
          <div className="review-section">
            <h3>Student Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{request.student_name}</span>
              </div>
              <div className="info-item">
                <label>Student ID:</label>
                <span>{request.student_id}</span>
              </div>
            </div>
          </div>

          {/* Activity Details */}
          <div className="review-section">
            <h3>Activity Details</h3>
            <div className="activity-details">
              <div className="activity-header">
                <span className="activity-icon">
                  {getActivityIcon(request.activity_type)}
                </span>
                <div>
                  <h4>{request.activity_name}</h4>
                  <p className="activity-type">{request.activity_type}</p>
                </div>
              </div>
              
              <div className="activity-info-grid">
                <div className="info-item">
                  <label>Event Date:</label>
                  <span>{new Date(request.event_date).toLocaleDateString()}</span>
                </div>
                {request.event_venue && (
                  <div className="info-item">
                    <label>Venue:</label>
                    <span>{request.event_venue}</span>
                  </div>
                )}
                {request.organized_by && (
                  <div className="info-item">
                    <label>Organized By:</label>
                    <span>{request.organized_by}</span>
                  </div>
                )}
                {request.coordinator_name && (
                  <div className="info-item">
                    <label>Coordinator:</label>
                    <span>{request.coordinator_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OD Reason */}
          <div className="review-section">
            <h3>Reason for OD</h3>
            <div className="reason-box">
              <p>{request.od_reason}</p>
            </div>
          </div>

          {/* OCR Verification */}
          {request.ocr_text && (
            <div className="review-section">
              <h3>OCR Analysis</h3>
              <div className={`ocr-status ${request.verified_by_ocr ? 'verified' : 'not-verified'}`}>
                <div className="ocr-header">
                  <span className="ocr-icon">
                    {request.verified_by_ocr ? '✅' : '⚠️'}
                  </span>
                  <span>
                    {request.verified_by_ocr ? 'OCR Verified' : 'Needs Manual Review'}
                  </span>
                </div>
                <div className="ocr-text-preview">
                  <p>{request.ocr_text.substring(0, 200)}...</p>
                </div>
              </div>
            </div>
          )}

          {/* Decision Section */}
          <div className="review-section">
            <h3>Decision</h3>
            <div className="decision-options">
              <label className="decision-option">
                <input
                  type="radio"
                  name="decision"
                  value="approve"
                  checked={decision === 'approve'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                <span className="decision-label approve">
                  ✅ Approve OD
                </span>
              </label>
              
              <label className="decision-option">
                <input
                  type="radio"
                  name="decision"
                  value="reject"
                  checked={decision === 'reject'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                <span className="decision-label reject">
                  ❌ Reject OD
                </span>
              </label>
            </div>

            <div className="notes-section">
              <label>Admin Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments for the student..."
                rows="3"
                className="notes-textarea"
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className={`btn ${decision === 'approve' ? 'success' : 'danger'}`}
            onClick={handleApprove}
            disabled={!decision || loading}
          >
            {loading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                Processing...
              </div>
            ) : decision === 'approve' ? (
              '✅ Approve OD'
            ) : (
              '❌ Reject OD'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ODReviewModal;