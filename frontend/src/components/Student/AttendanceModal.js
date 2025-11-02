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

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, []);

  const closeCamera = () => {
    if (streamRef.current) {
      console.log('🛑 Stopping camera stream');
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.readyState);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      console.log('🚀 Starting camera...');
      setLoading(true);
      setCameraStatus('Requesting camera access...');

      // Stop any existing stream first
      closeCamera();

      // Reset video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      console.log('📹 Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      console.log('✅ Camera stream obtained:', stream);
      console.log('📹 Video tracks:', stream.getVideoTracks());
      console.log('📹 Track settings:', stream.getVideoTracks()[0]?.getSettings());
      
      setCameraStatus('Camera accessed, setting up video...');

      if (videoRef.current) {
        const video = videoRef.current;
        
        // CRITICAL: Set srcObject BEFORE any event listeners
        console.log('🎬 Setting srcObject on video element...');
        video.srcObject = stream;
        streamRef.current = stream;
        
        console.log('🔍 Video srcObject after assignment:', video.srcObject);
        
        // Set up event listeners
        const events = {
          loadstart: () => console.log('📹 Video loadstart'),
          loadeddata: () => console.log('📹 Video loadeddata'),
          loadedmetadata: () => console.log('📹 Video loadedmetadata'),
          canplay: () => console.log('🎬 Video canplay'),
          play: () => console.log('▶️ Video play'),
          playing: () => console.log('🎭 Video playing'),
          error: (e) => console.error('❌ Video error:', e)
        };

        // Add all event listeners
        Object.entries(events).forEach(([event, handler]) => {
          video.addEventListener(event, handler);
        });

        // Try to play the video
        console.log('▶️ Attempting to play video...');
        try {
          await video.play();
          console.log('✅ Video play() successful');
        } catch (playError) {
          console.error('❌ Video play() failed:', playError);
        }

        // Wait for video to be ready with timeout
        await new Promise((resolve) => {
          const onReady = () => {
            console.log('✅ Video is ready to display');
            console.log('📐 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
            setCameraStatus(`Camera ready! ${video.videoWidth}x${video.videoHeight}`);
            resolve();
          };

          if (video.readyState >= 3) { // HAVE_FUTURE_DATA or better
            console.log('⚡ Video already ready, state:', video.readyState);
            onReady();
            return;
          }

          video.addEventListener('canplay', onReady, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            console.log('⏰ Video ready timeout, current state:', video.readyState);
            console.log('📐 Current dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.removeEventListener('canplay', onReady);
            resolve();
          }, 3000);
        });

        // Clean up event listeners
        Object.entries(events).forEach(([event, handler]) => {
          video.removeEventListener(event, handler);
        });
      }

      setStep('camera');
      
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      setCameraStatus(`Camera error: ${error.message}`);
      
      alert(`Camera Error: ${error.name}\n${error.message}\n\nPlease ensure:\n1. Camera permissions are allowed\n2. No other app is using the camera\n3. Your camera is working properly`);
    } finally {
      setLoading(false);
    }
  };

  const captureAndRecognize = async () => {
    setLoading(true);
    setCameraStatus('Capturing image...');

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert('Camera not initialized. Please try again.');
      setLoading(false);
      return;
    }

    // Check if video is actually playing
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Camera not ready. Please wait for camera to initialize.');
      setLoading(false);
      return;
    }

    try {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
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
            alert(result.error || 'Recognition failed');
            setCameraStatus('Recognition failed');
          }
        } catch (error) {
          alert('Recognition failed: ' + error.message);
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
    closeCamera();
    onClose();
  };

  const handleBackToInstructions = () => {
    closeCamera();
    setStep('instructions');
    setCameraStatus('Ready to start');
  };

  // Test function to check if video is working
  const testVideoElement = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      console.log('🔍 VIDEO ELEMENT DEBUG INFO:');
      console.log('- srcObject:', video.srcObject);
      console.log('- videoWidth:', video.videoWidth);
      console.log('- videoHeight:', video.videoHeight);
      console.log('- readyState:', video.readyState);
      console.log('- paused:', video.paused);
      console.log('- currentTime:', video.currentTime);
      console.log('- networkState:', video.networkState);
      console.log('- error:', video.error);
      
      if (streamRef.current) {
        console.log('🔍 STREAM DEBUG INFO:');
        console.log('- Stream active:', streamRef.current.active);
        console.log('- Video tracks:', streamRef.current.getVideoTracks().length);
        streamRef.current.getVideoTracks().forEach((track, index) => {
          console.log(`  Track ${index}:`, track.readyState, track.getSettings());
        });
      }
      
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setCameraStatus(`✅ Video working: ${video.videoWidth}x${video.videoHeight}`);
      } else {
        setCameraStatus('❌ Video not displaying - check console for details');
      }
    } else {
      console.log('❌ videoRef.current is null');
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

            <div className="camera-status-info">
              <p>Status: {cameraStatus}</p>
            </div>

            <div className="modal-actions">
              <button className="btn secondary" onClick={handleClose}>
                Cancel
              </button>
              <button 
                className="btn primary" 
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
            <div className="camera-container">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted
                className="camera-video"
              />
              <div className="camera-overlay">
                <div className="face-guide"></div>
              </div>
              
              {/* Debug button */}
              <button 
                className="debug-btn"
                onClick={testVideoElement}
                title="Test video element - Check console for details"
              >
                🔍 Debug
              </button>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="camera-instructions">
              <p>Position your face within the frame and click capture</p>
              <div className="camera-status-info">
                <p>{cameraStatus}</p>
                {videoRef.current && videoRef.current.videoWidth > 0 && (
                  <p className="camera-resolution">
                    Resolution: {videoRef.current.videoWidth}×{videoRef.current.videoHeight}
                  </p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn secondary" onClick={handleBackToInstructions}>
                Back
              </button>
              <button 
                className="btn primary capture-btn"
                onClick={captureAndRecognize}
                disabled={loading || !videoRef.current || videoRef.current.videoWidth === 0}
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="spinner"></div>
                    Processing...
                  </div>
                ) : (
                  '📸 Capture & Recognize'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && result && (
          <div className="modal-content">
            <div className="result-success">
              <div className="success-animation">
                <div className="checkmark">✓</div>
              </div>
              
              <h3>Attendance Marked Successfully!</h3>
              
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
              <button className="btn primary" onClick={handleClose}>
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