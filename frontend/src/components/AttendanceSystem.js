import React, { useState, useEffect, useRef } from 'react';
import './AttendanceSystem.css';

const AttendanceSystem = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [studentCount, setStudentCount] = useState(0);
  const [faceRecogStatus, setFaceRecogStatus] = useState('Loading...');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [studentsData, setStudentsData] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoStreamRef = useRef(null);

  const backendUrl = 'http://localhost:5000';

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showCameraModal) {
      initializeCamera();
    } else {
      closeCamera();
    }
  }, [showCameraModal]);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/`);
      const data = await response.json();
      
      setBackendStatus('Connected ✓');
      setStudentCount(data.registered_students || 0);
      setFaceRecogStatus('Ready ✓');
      setIsBackendConnected(true);
      
    } catch (error) {
      setBackendStatus('Disconnected ✗');
      setFaceRecogStatus('Backend Offline');
      setIsBackendConnected(false);
      console.error('Backend connection failed:', error);
    }
  };

  const startRecognition = () => {
    if (!isBackendConnected) {
      alert('❌ Backend is not connected. Please make sure the Flask server is running on http://localhost:5000');
      return;
    }
    setShowCameraModal(true);
    setCameraStatus('🎯 Initializing camera...');
    setCameraLoading(true);
  };

  const initializeCamera = async () => {
    try {
      console.log('🚀 Starting camera initialization...');
      
      // Stop any existing stream first
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user'
        } 
      });
      
      console.log('✅ Camera stream obtained');
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        videoStreamRef.current = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          const onCanPlay = () => {
            console.log('🎬 Video can play, dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.removeEventListener('canplay', onCanPlay);
            resolve();
          };

          if (video.readyState >= 3) {
            console.log('⚡ Video already ready');
            resolve();
            return;
          }

          video.addEventListener('canplay', onCanPlay);
          
          setTimeout(() => {
            console.log('⏰ Video ready timeout');
            video.removeEventListener('canplay', onCanPlay);
            resolve();
          }, 3000);
        });

        // Force play
        await video.play();
      }
      
      setCameraStatus('✅ Camera ready! Position your face and click "Capture & Recognize"');
      setCameraLoading(false);
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraStatus('❌ Camera access denied. Please allow camera permissions and try again.');
      setCameraLoading(false);
    }
  };

  const captureAndRecognize = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCameraStatus('❌ Camera not initialized. Please try again.');
      return;
    }

    // Ensure video has loaded and has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraStatus('❌ Video not ready. Please wait for camera to load.');
      return;
    }

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas and draw video frame
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setCameraStatus('🔍 Processing face recognition...');

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setCameraStatus('❌ Failed to capture image. Please try again.');
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'face_capture.jpg');

      try {
        const response = await fetch(`${backendUrl}/recognize`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          setCameraStatus(`✅ ${result.message}\nStudent: ${result.student.name}\nID: ${result.student.student_id}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`);
          
          // Update student count
          const count = await getStudentCount();
          setStudentCount(count);
          
          // Auto-close after 3 seconds
          setTimeout(() => {
            setShowCameraModal(false);
          }, 3000);
          
        } else {
          setCameraStatus(`❌ ${result.message}`);
        }
      } catch (error) {
        setCameraStatus(`❌ Recognition failed: ${error.message}`);
      }
    }, 'image/jpeg', 0.9);
  };

  const closeCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    setShowCameraModal(false);
    setCameraLoading(false);
  };

  const openDashboard = async () => {
    if (!isBackendConnected) {
      alert('❌ Backend is not connected. Please start the Flask server first.');
      return;
    }

    try {
      const [attendanceResponse, studentsResponse] = await Promise.all([
        fetch(`${backendUrl}/attendance`),
        fetch(`${backendUrl}/students`)
      ]);

      const attendanceData = await attendanceResponse.json();
      const studentsData = await studentsResponse.json();

      setAttendanceData(attendanceData);
      setStudentsData(studentsData);
      setShowDashboard(true);
      
    } catch (error) {
      alert('❌ Failed to load dashboard: ' + error.message);
    }
  };

  const getStudentCount = async () => {
    try {
      const response = await fetch(`${backendUrl}/students`);
      const data = await response.json();
      return data.total_students || 0;
    } catch (error) {
      return 0;
    }
  };

  const formatAttendanceRecords = (records) => {
    if (!records || records.length === 0) {
      return <div className="no-data">No attendance records yet. Start recognizing faces!</div>;
    }

    const recentRecords = records.slice(-8).reverse();
    
    return (
      <div className="records-list">
        {recentRecords.map((record, index) => (
          <div key={index} className="record-item">
            <div className="student-info">
              <div className="student-name">{record.name}</div>
              <div className="student-id">ID: {record.student_id}</div>
              {record.confidence && (
                <div className="confidence">{(record.confidence * 100).toFixed(1)}% confidence</div>
              )}
            </div>
            <div className="timestamp">
              <div style={{fontWeight: 'bold', color: '#007bff'}}>{record.date}</div>
              <div>{record.time}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const formatStudentList = (students) => {
    if (!students || students.length === 0) {
      return <div className="no-data">No students registered yet. Register students in Colab first.</div>;
    }

    return (
      <div className="students-list">
        {students.map((student, index) => (
          <div key={index} className="student-item">
            <div className="student-info">
              <div className="student-name">{student.name}</div>
              <div className="student-id">ID: {student.id}</div>
            </div>
            <div className="reg-date">Registered</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AI Attendance System</h1>
        <p>Real Face Recognition with Google Colab Integration</p>
        <div className="badge">Powered by DeepFace & Colab Training</div>
      </div>

      <div className="content">
        <div className="status-section">
          <h2>📊 System Status</h2>
          <div className="status-grid">
            <div className="status-card">
              <h3>Backend Connection</h3>
              <div className={`status-value ${backendStatus.includes('Connected') ? 'connected' : 'disconnected'}`}>
                {backendStatus}
              </div>
            </div>
            <div className="status-card">
              <h3>Registered Students</h3>
              <div className="status-value">{studentCount}</div>
            </div>
            <div className="status-card">
              <h3>Face Recognition</h3>
              <div className={`status-value ${faceRecogStatus.includes('Ready') ? 'connected' : 'disconnected'}`}>
                {faceRecogStatus}
              </div>
            </div>
            <div className="status-card">
              <h3>Model Source</h3>
              <div className="status-value">Google Colab</div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card recognition-card">
            <div className="feature-icon">📷</div>
            <h3>Face Recognition</h3>
            <p>Real-time face recognition using Colab-trained model. Capture your face and the system will automatically identify you and mark attendance.</p>
            <button className="feature-button" onClick={startRecognition}>
              Start Face Recognition
            </button>
          </div>

          <div className="feature-card dashboard-card">
            <div className="feature-icon">📊</div>
            <h3>Admin Dashboard</h3>
            <p>View detailed attendance records, student information, and system analytics. Monitor attendance patterns and export reports.</p>
            <button className="feature-button" onClick={openDashboard}>
              Open Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>AI Attendance System &copy; 2024 | Integrated with Google Colab Face Recognition</p>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="modal-overlay">
          <div className="camera-modal">
            <div className="camera-header">
              <h2>📷 Face Recognition</h2>
              <button className="close-btn" onClick={closeCamera}>×</button>
            </div>
            
            <div className="camera-container">
              {cameraLoading ? (
                <div className="camera-loading">
                  <div className="loading-spinner"></div>
                  <p>Initializing camera...</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
              )}
              <canvas ref={canvasRef} style={{display: 'none'}}></canvas>
            </div>
            
            <div className={`status-message ${cameraStatus.includes('✅') ? 'status-success' : cameraStatus.includes('❌') ? 'status-error' : 'status-loading'}`}>
              {cameraStatus}
            </div>
            
            <div className="camera-controls">
              <button 
                className="camera-btn capture-btn" 
                onClick={captureAndRecognize} 
                disabled={cameraLoading || cameraStatus.includes('❌') || !videoRef.current || videoRef.current?.videoWidth === 0}
              >
                {cameraLoading ? '🔄 Initializing...' : '📸 Capture & Recognize'}
              </button>
              <button className="camera-btn cancel-btn" onClick={closeCamera}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Modal */}
      {showDashboard && (
        <div className="modal-overlay" onClick={() => setShowDashboard(false)}>
          <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
            <div className="camera-header">
              <h2>📊 Admin Dashboard</h2>
              <button className="close-btn" onClick={() => setShowDashboard(false)}>×</button>
            </div>
            
            <div className="dashboard-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Students</h3>
                  <p className="stat-number">{studentsData?.total_students || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Today's Attendance</h3>
                  <p className="stat-number">{attendanceData?.total_records || 0}</p>
                </div>
              </div>

              <div className="section">
                <h3>📝 Recent Attendance Records</h3>
                {formatAttendanceRecords(attendanceData?.attendance_records)}
              </div>

              <div className="section">
                <h3>👥 Registered Students</h3>
                {formatStudentList(studentsData?.students)}
              </div>
            </div>

            <button className="camera-btn cancel-btn" onClick={() => setShowDashboard(false)} style={{marginTop: '20px'}}>
              Close Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSystem;