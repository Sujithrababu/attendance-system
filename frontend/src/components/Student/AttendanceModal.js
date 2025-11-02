import React, { useState, useRef, useEffect } from 'react';
import './AttendanceModal.css';

const AttendanceModal = ({ onClose }) => {
  const [step, setStep] = useState('instructions');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('Ready to start');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Debug: Check video ref when step changes to camera
  useEffect(() => {
    if (step === 'camera' && videoRef.current) {
      console.log('🎬 Video ref is now available:', videoRef.current);
    }
  }, [step]);

  const startCamera = async () => {
    try {
      console.log('🚀 Starting camera...');
      setLoading(true);
      setCameraStatus('Requesting camera access...');

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      console.log('📹 Getting user media...');
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('✅ Camera stream obtained');
      streamRef.current = stream;
      
      setCameraStatus('Camera accessed, setting up video...');
      setStep('camera'); // Switch to camera step FIRST
      
      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🎬 Looking for video element...');
      
      // Now the video element should be available since we're on camera step
      if (videoRef.current) {
        const video = videoRef.current;
        console.log('✅ Video element found:', video);
        
        // Set the stream to video element
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        
        console.log('🎬 Stream assigned to video element');
        console.log('🔍 Video srcObject after assignment:', video.srcObject);

        // Wait for video to load
        await new Promise((resolve) => {
          const onLoadedData = () => {
            console.log('✅ Video loaded data');
            console.log('📐 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.removeEventListener('loadeddata', onLoadedData);
            resolve();
          };

          video.addEventListener('loadeddata', onLoadedData);
          
          // Fallback timeout
          setTimeout(() => {
            console.log('⏰ Video load timeout');
            video.removeEventListener('loadeddata', onLoadedData);
            resolve();
          }, 3000);
        });

        // Try to play
        try {
          await video.play();
          console.log('✅ Video play successful');
          setCameraStatus('✅ Camera ready! Position your face in the circle');
          setIsCameraActive(true);
        } catch (playError) {
          console.log('⚠️ Video play failed, but stream might work:', playError);
          setCameraStatus('🎥 Camera active - Position your face');
          setIsCameraActive(true);
        }

        // Final check
        setTimeout(() => {
          console.log('🔍 Final check - Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            console.log('🎉 SUCCESS: Video is displaying!');
          }
        }, 1000);

      } else {
        console.error('❌ Video element still not found!');
        setCameraStatus('❌ Camera setup failed - Please try again');
        // Fallback: try to set stream again after a delay
        setTimeout(() => {
          if (videoRef.current && streamRef.current) {
            console.log('🔄 Fallback: Setting stream to video element');
            videoRef.current.srcObject = streamRef.current;
          }
        }, 500);
      }
      
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      setCameraStatus(`Camera error: ${error.message}`);
      
      let errorMessage = 'Camera Error:\n\n';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please check if your camera is connected.';
      } else {
        errorMessage += `${error.message}\n\nPlease check camera permissions and try again.`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current) {
      alert('Camera not ready. Please try again.');
      return;
    }

    setLoading(true);
    setCameraStatus('Capturing image...');

    const video = videoRef.current;
    const canvas = canvasRef.current;

    try {
      const context = canvas.getContext('2d');
      
      // Use actual dimensions or fallback
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      canvas.width = width;
      canvas.height = height;

      console.log('📸 Capturing image...');
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCameraStatus('Processing face recognition...');

      // Convert to blob and send to backend
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to capture image. Please try again.');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'face_capture.jpg');

        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/student/mark-attendance', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData
          });

          const result = await response.json();

          if (result.success) {
            setResult(result);
            setStep('result');
            setCameraStatus('Attendance marked successfully!');
          } else {
            alert(result.error || 'Face recognition failed. Please try again.');
            setCameraStatus('Recognition failed - Try again');
          }
        } catch (error) {
          alert('Network error: ' + error.message);
          setCameraStatus('Network error');
        } finally {
          setLoading(false);
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Capture error:', error);
      alert('Failed to capture image: ' + error.message);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    onClose();
  };

  const handleBackToInstructions = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setStep('instructions');
    setCameraStatus('Ready to start');
  };

  const testVideoElement = () => {
    console.log('=== VIDEO DEBUG ===');
    console.log('videoRef.current:', videoRef.current);
    console.log('streamRef.current:', streamRef.current);
    
    if (videoRef.current) {
      const video = videoRef.current;
      console.log('Video srcObject:', video.srcObject);
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      console.log('Video readyState:', video.readyState);
      
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setCameraStatus(`✅ Video working: ${video.videoWidth}x${video.videoHeight}`);
      } else {
        setCameraStatus('❌ Video not displaying');
      }
    } else {
      console.log('❌ Video element not found');
      setCameraStatus('❌ Video element not found');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="attendance-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>
            {step === 'instructions' && '📷 Mark Attendance'}
            {step === 'camera' && '🎯 Face Recognition'}
            {step === 'result' && '✅ Attendance Marked'}
          </h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {/* Instructions Step */}
        {step === 'instructions' && (
          <div className="modal-content">
            <div className="instructions">
              <div className="instruction-item">
                <div className="instruction-icon">🔒</div>
                <div className="instruction-text">
                  <h3>Allow Camera Access</h3>
                  <p>Click "Allow" when browser asks for camera permission</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <div className="instruction-icon">💡</div>
                <div className="instruction-text">
                  <h3>Good Lighting</h3>
                  <p>Face a light source for better recognition</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <div className="instruction-icon">👤</div>
                <div className="instruction-text">
                  <h3>Position Face</h3>
                  <p>Keep your face centered in the circle</p>
                </div>
              </div>
            </div>

            <div className="camera-status">
              <span>{cameraStatus}</span>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={startCamera}
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="spinner"></div>
                    Starting Camera...
                  </div>
                ) : (
                  'Start Camera'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Camera Step */}
        {step === 'camera' && (
          <div className="modal-content">
            <div className="camera-section">
              <div className="camera-container">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  muted
                  className="camera-video"
                />
                <div className="camera-overlay">
                  <div className="face-guide">
                    <div className="guide-circle"></div>
                    <div className="guide-text">Position face here</div>
                  </div>
                </div>
                
                <button 
                  className="debug-btn"
                  onClick={testVideoElement}
                >
                  🔍 Debug
                </button>
              </div>
              
              <div className="camera-info">
                <div className="camera-status">
                  <div className={`status-indicator ${isCameraActive ? 'active' : ''}`}></div>
                  <span>{cameraStatus}</span>
                </div>
                
                <div className="capture-instructions">
                  <p>Make sure your face is clearly visible within the circle</p>
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleBackToInstructions}>
                ← Back
              </button>
              <button 
                className="btn btn-primary btn-capture"
                onClick={captureAndRecognize}
                disabled={loading || !isCameraActive}
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="spinner"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <span className="capture-icon">📸</span>
                    Capture & Recognize
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && result && (
          <div className="modal-content">
            <div className="result-section">
              <div className="success-animation">
                <div className="checkmark">✓</div>
              </div>
              
              <h3 className="success-title">Attendance Marked Successfully!</h3>
              
              <div className="attendance-details">
                <div className="detail-item">
                  <span className="label">Student:</span>
                  <span className="value">{result.student.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">ID:</span>
                  <span className="value">{result.student.student_id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Confidence:</span>
                  <span className="value confidence">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{result.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary btn-done" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceModal;