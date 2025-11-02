class AttendanceSystem {
    constructor() {
        this.backendUrl = 'http://localhost:5000';
        this.initializeEventListeners();
        this.checkBackendStatus();
        this.startStatusMonitor();
    }

    async checkBackendStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/`);
            const data = await response.json();
            
            this.updateSystemStatus('Backend: Connected ✓', true);
            this.updateRegisteredCount(data.registered_count);
            
        } catch (error) {
            this.updateSystemStatus('Backend: Disconnected ✗', false);
            console.error('Backend connection failed:', error);
        }
    }

    initializeEventListeners() {
        const buttons = document.querySelectorAll('button');
        
        buttons[0].addEventListener('click', () => this.openRegistration());
        buttons[1].addEventListener('click', () => this.startRecognition());
        buttons[2].addEventListener('click', () => this.openDashboard());
    }

    async openRegistration() {
        const name = prompt('Enter student name:');
        if (!name) {
            alert('Registration cancelled');
            return;
        }

        const studentId = prompt('Enter student ID:');
        if (!studentId) {
            alert('Registration cancelled');
            return;
        }

        try {
            // Try to access camera
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Close camera immediately since we're simulating for now
            stream.getTracks().forEach(track => track.stop());
            
            alert('Camera access granted! Simulating face capture...');
            
            // Simulate face capture delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const result = await this.registerStudent(studentId, name);
            
            if (result.success) {
                alert(`✅ Student ${name} registered successfully!`);
                this.updateRegisteredCount(await this.getStudentCount());
            } else {
                alert(`❌ Registration failed: ${result.error}`);
            }
            
        } catch (error) {
            console.error('Camera error:', error);
            // Continue with simulation even if camera fails
            const proceed = confirm('Camera not available. Continue with simulated registration?');
            if (proceed) {
                const result = await this.registerStudent(studentId, name);
                if (result.success) {
                    alert(`✅ Student ${name} registered successfully! (Simulated)`);
                    this.updateRegisteredCount(await this.getStudentCount());
                }
            }
        }
    }

    async registerStudent(studentId, name) {
        try {
            const response = await fetch(`${this.backendUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    name: name
                })
            });

            return await response.json();
            
        } catch (error) {
            return { success: false, error: 'Network error: ' + error.message };
        }
    }

    async startRecognition() {
        try {
            // Try to access camera
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            alert('Camera started! Looking for faces...');
            
            // Simulate face recognition process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Close camera
            stream.getTracks().forEach(track => track.stop());
            
            const result = await this.recognizeFace();
            
            if (result.success) {
                alert(`✅ ${result.message}`);
            } else {
                alert(`❌ ${result.message}`);
            }
            
        } catch (error) {
            console.error('Camera error:', error);
            // Simulate recognition without camera
            const result = await this.recognizeFace();
            if (result.success) {
                alert(`✅ ${result.message} (Simulated)`);
            } else {
                alert(`❌ ${result.message}`);
            }
        }
    }

    async recognizeFace() {
        try {
            const response = await fetch(`${this.backendUrl}/recognize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}) // Empty for simulated recognition
            });

            return await response.json();
            
        } catch (error) {
            return { success: false, error: 'Network error: ' + error.message };
        }
    }

    async openDashboard() {
        try {
            const [attendanceResponse, studentsResponse] = await Promise.all([
                fetch(`${this.backendUrl}/attendance`),
                fetch(`${this.backendUrl}/students`)
            ]);

            const attendanceData = await attendanceResponse.json();
            const studentsData = await studentsResponse.json();

            this.displayDashboard(attendanceData, studentsData);
            
        } catch (error) {
            alert('Failed to load dashboard: ' + error.message);
        }
    }

    displayDashboard(attendanceData, studentsData) {
        const dashboardHTML = `
            <div class="dashboard-modal">
                <div class="dashboard-header">
                    <h2>📊 Admin Dashboard</h2>
                    <button class="close-btn" onclick="this.closest('.dashboard-modal').remove()">×</button>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Students</h3>
                        <p class="stat-number">${studentsData.total_students || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Today's Attendance</h3>
                        <p class="stat-number">${attendanceData.total_records || 0}</p>
                    </div>
                </div>

                <div class="section">
                    <h3>📝 Recent Attendance Records</h3>
                    ${this.formatAttendanceRecords(attendanceData.attendance_records)}
                </div>

                <div class="section">
                    <h3>👥 Registered Students</h3>
                    ${this.formatStudentList(studentsData.students)}
                </div>

                <button class="close-dashboard" onclick="this.closest('.dashboard-modal').remove()">Close Dashboard</button>
            </div>
        `;

        // Remove existing dashboard if any
        const existingModal = document.querySelector('.dashboard-modal');
        if (existingModal) existingModal.remove();

        // Add to page
        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
    }

    formatAttendanceRecords(records) {
        if (!records || records.length === 0) {
            return '<p class="no-data">No attendance records yet.</p>';
        }

        return `
            <div class="records-list">
                ${records.slice(-10).reverse().map(record => `
                    <div class="record-item">
                        <strong>${record.name}</strong> (ID: ${record.student_id})
                        <span class="timestamp">${new Date(record.timestamp).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    formatStudentList(students) {
        if (!students || students.length === 0) {
            return '<p class="no-data">No students registered yet.</p>';
        }

        return `
            <div class="students-list">
                ${students.map(student => `
                    <div class="student-item">
                        <strong>${student.name}</strong> 
                        <span class="student-id">ID: ${student.student_id}</span>
                        <span class="reg-date">Registered: ${new Date(student.registration_date).toLocaleDateString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async getStudentCount() {
        try {
            const response = await fetch(`${this.backendUrl}/students`);
            const data = await response.json();
            return data.total_students || 0;
        } catch (error) {
            return 0;
        }
    }

    updateRegisteredCount(count) {
        const statusElement = document.querySelector('h3');
        if (statusElement) {
            statusElement.innerHTML = statusElement.innerHTML.replace(
                /Registered Students: \d+/,
                `Registered Students: ${count}`
            );
        }
    }

    updateSystemStatus(message, isSuccess) {
        const backendStatus = document.querySelector('h3');
        if (backendStatus && backendStatus.nextElementSibling) {
            backendStatus.nextElementSibling.textContent = message;
            backendStatus.nextElementSibling.style.color = isSuccess ? 'green' : 'red';
        }
    }

    startStatusMonitor() {
        // Check system status every 10 seconds
        setInterval(() => this.checkBackendStatus(), 10000);
    }
}

// Add some basic styles
const styles = `
    .dashboard-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
    }
    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 20px;
    }
    .stat-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        border-left: 4px solid #007bff;
    }
    .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        margin: 5px 0 0 0;
    }
    .section {
        margin: 20px 0;
    }
    .section h3 {
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }
    .records-list, .students-list {
        max-height: 200px;
        overflow-y: auto;
    }
    .record-item, .student-item {
        background: #f8f9fa;
        margin: 5px 0;
        padding: 10px;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .timestamp, .reg-date {
        font-size: 12px;
        color: #666;
    }
    .no-data {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 20px;
    }
    .close-dashboard {
        width: 100%;
        padding: 10px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
    }
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize system when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AttendanceSystem();
});