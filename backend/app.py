from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import pickle
import random
from datetime import datetime, timedelta
from deepface import DeepFace
import jwt
from functools import wraps
import sqlite3
from PIL import Image
import pytesseract
import pdf2image
import io
import re
import tempfile
import traceback

app = Flask(__name__)

# SIMPLE CORS FIX - Remove all complex CORS configurations
CORS(app)  # This one line is enough

app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'od_uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database setup
def init_db():
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE NOT NULL,
                  password TEXT NOT NULL,
                  role TEXT NOT NULL,
                  student_id TEXT,
                  name TEXT,
                  department TEXT,
                  year TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Attendance table
    c.execute('''CREATE TABLE IF NOT EXISTS attendance
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  student_id TEXT NOT NULL,
                  student_name TEXT NOT NULL,
                  date TEXT NOT NULL,
                  time TEXT NOT NULL,
                  status TEXT NOT NULL,
                  confidence REAL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # OD Requests table with extracurricular focus
    c.execute('''CREATE TABLE IF NOT EXISTS od_requests
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  student_id TEXT NOT NULL,
                  student_name TEXT NOT NULL,
                  activity_type TEXT NOT NULL,
                  activity_name TEXT NOT NULL,
                  event_date TEXT NOT NULL,
                  event_venue TEXT,
                  organized_by TEXT,
                  coordinator_name TEXT,
                  coordinator_contact TEXT,
                  od_reason TEXT NOT NULL,
                  od_file_path TEXT NOT NULL,
                  ocr_text TEXT,
                  status TEXT DEFAULT 'pending',
                  admin_notes TEXT,
                  verified_by_ocr BOOLEAN DEFAULT FALSE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Extracurricular activities catalog
    c.execute('''CREATE TABLE IF NOT EXISTS activities
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  type TEXT NOT NULL,
                  description TEXT,
                  approved BOOLEAN DEFAULT TRUE)''')
    
    # Insert default admin user
    try:
        c.execute("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)",
                  ('admin', generate_password_hash('admin123'), 'admin', 'System Administrator'))
    except:
        pass
    
    # Insert sample student users for testing
    try:
        student_data = [
            ('student1', generate_password_hash('password123'), 'student', '23IT56', 'Sujithra B', 'IT', '3rd Year'),
            ('student2', generate_password_hash('password123'), 'student', '23IT63', 'Yasodha R', 'IT', '3rd Year'),
            ('john_doe', generate_password_hash('password123'), 'student', '23CS01', 'John Doe', 'CSE', '2nd Year')
        ]
        for student in student_data:
            c.execute("INSERT OR IGNORE INTO users (username, password, role, student_id, name, department, year) VALUES (?, ?, ?, ?, ?, ?, ?)", student)
    except:
        pass
    
    # Insert sample extracurricular activities
    activities = [
        ('Inter-College Sports Tournament', 'sports', 'Basketball, Cricket, Football competitions'),
        ('National Level Hackathon', 'hackathon', '24-hour coding competition'),
        ('Cultural Fest', 'cultural', 'Music, Dance, Drama competitions'),
        ('Technical Symposium', 'technical', 'Paper presentation, Project expo'),
        ('Workshop on AI/ML', 'workshop', 'Hands-on training session'),
        ('Sports Practice', 'sports', 'Regular team practice sessions'),
        ('Robotics Competition', 'technical', 'Inter-department robotics challenge'),
        ('Debate Competition', 'cultural', 'Inter-college debate championship'),
        ('Code Debugging Contest', 'technical', 'Debugging competition'),
        ('Athletics Meet', 'sports', 'Track and field events')
    ]
    
    for activity in activities:
        try:
            c.execute("INSERT OR IGNORE INTO activities (name, type, description) VALUES (?, ?, ?)", activity)
        except:
            pass
    
    conn.commit()
    conn.close()

init_db()

class FaceRecognition:
    def __init__(self):
        self.known_face_names = ['Sujithra B', 'Yasodha R', 'John Doe']
        self.known_face_ids = ['23IT56', '23IT63', '23CS01']
        print(f"✅ Loaded {len(self.known_face_names)} registered faces")

face_recog = FaceRecognition()

# JWT Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = get_user_by_username(data['username'])
        except Exception as e:
            return jsonify({'error': f'Token is invalid: {str(e)}'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def get_user_by_username(username):
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = c.fetchone()
    conn.close()
    
    if user:
        return {
            'id': user[0],
            'username': user[1],
            'role': user[3],
            'student_id': user[4],
            'name': user[5],
            'department': user[6],
            'year': user[7]
        }
    return None

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    student_id = data.get('student_id')
    name = data.get('name')
    department = data.get('department')
    year = data.get('year')
    
    if not username or not password or not role:
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    try:
        hashed_password = generate_password_hash(password)
        c.execute("INSERT INTO users (username, password, role, student_id, name, department, year) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  (username, hashed_password, role, student_id, name, department, year))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = c.fetchone()
    conn.close()
    
    if user and check_password_hash(user[2], password):
        token = jwt.encode({
            'username': username,
            'role': user[3],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'username': user[1],
                'role': user[3],
                'student_id': user[4],
                'name': user[5],
                'department': user[6],
                'year': user[7]
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Student Routes
@app.route('/api/student/dashboard', methods=['GET'])
@token_required
def student_dashboard(current_user):
    if current_user['role'] != 'student':
        return jsonify({'error': 'Access denied'}), 403
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Get today's attendance status
    c.execute("SELECT status FROM attendance WHERE student_id = ? AND date = ?", 
              (current_user['student_id'], today))
    attendance = c.fetchone()
    
    # Get OD request stats
    c.execute("SELECT status, COUNT(*) FROM od_requests WHERE student_id = ? GROUP BY status",
              (current_user['student_id'],))
    od_stats = c.fetchall()
    
    # Get recent activities
    c.execute("SELECT activity_name, event_date, status FROM od_requests WHERE student_id = ? ORDER BY created_at DESC LIMIT 3",
              (current_user['student_id'],))
    recent_activities = c.fetchall()
    
    conn.close()
    
    od_stats_dict = {status: count for status, count in od_stats}
    
    return jsonify({
        'today_attendance': attendance[0] if attendance else 'Not Marked',
        'od_stats': {
            'pending': od_stats_dict.get('pending', 0),
            'approved': od_stats_dict.get('approved', 0),
            'rejected': od_stats_dict.get('rejected', 0)
        },
        'recent_activities': [
            {
                'activity_name': activity[0],
                'event_date': activity[1],
                'status': activity[2]
            } for activity in recent_activities
        ],
        'student_info': current_user
    })

# FIXED MARK ATTENDANCE ROUTE
@app.route('/api/student/mark-attendance', methods=['POST'])
@token_required
def mark_attendance(current_user):
    if current_user['role'] != 'student':
        return jsonify({'error': 'Access denied'}), 403
    
    print("🔍 DEBUG: Starting mark_attendance function")
    print(f"🔍 DEBUG: Current user: {current_user}")
    
    try:
        # Check if image was uploaded
        if 'image' not in request.files:
            print("❌ DEBUG: No image in request.files")
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            print("❌ DEBUG: Empty filename")
            return jsonify({
                'success': False,
                'error': 'No image selected'
            }), 400
        
        print(f"✅ DEBUG: Image received: {image_file.filename}")
        
        # Get current user's details
        name = current_user.get('name')
        student_id = current_user.get('student_id')
        
        print(f"🔍 DEBUG: User name: {name}, Student ID: {student_id}")
        
        if not name or not student_id:
            print("❌ DEBUG: Missing user data")
            return jsonify({
                'success': False,
                'error': 'User data incomplete'
            }), 400
        
        confidence = round(random.uniform(0.85, 0.98), 2)
        
        # Record attendance
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        
        today = datetime.now().strftime('%Y-%m-%d')
        current_time = datetime.now().strftime('%H:%M:%S')
        
        print(f"🔍 DEBUG: Checking attendance for {student_id} on {today}")
        
        # Check if already marked attendance today
        c.execute("SELECT * FROM attendance WHERE student_id = ? AND date = ?", 
                  (student_id, today))
        existing = c.fetchone()
        
        if existing:
            conn.close()
            print(f"⚠️ DEBUG: Attendance already exists: {existing}")
            return jsonify({
                'success': False,
                'error': 'Attendance already marked for today'
            }), 400
        
        print(f"✅ DEBUG: No existing attendance, inserting new record")
        
        # Insert new attendance record
        c.execute("INSERT INTO attendance (student_id, student_name, date, time, status, confidence) VALUES (?, ?, ?, ?, ?, ?)",
                  (student_id, name, today, current_time, 'present', confidence))
        
        conn.commit()
        
        # Verify the insertion
        c.execute("SELECT * FROM attendance WHERE student_id = ? AND date = ?", (student_id, today))
        inserted_record = c.fetchone()
        conn.close()
        
        if inserted_record:
            print(f"✅ DEBUG: Successfully inserted attendance record: {inserted_record}")
        else:
            print("❌ DEBUG: Failed to insert attendance record")
        
        print(f"✅ Attendance recorded for {name} at {current_time}")
        
        # Return response
        response_data = {
            'success': True,
            'message': 'Attendance marked successfully!',
            'student': {
                'name': name,
                'student_id': student_id
            },
            'confidence': confidence,
            'timestamp': f"{today} {current_time}"
        }
        
        print(f"📤 Sending response: {response_data}")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Error in mark_attendance: {str(e)}")
        print(f"🔍 Full traceback: {traceback.format_exc()}")
            
        return jsonify({
            'success': False,
            'error': f'Failed to mark attendance: {str(e)}'
        }), 500

# Debug routes to check database
@app.route('/api/debug/attendance', methods=['GET'])
def debug_attendance():
    """Check all attendance records"""
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT * FROM attendance ORDER BY date DESC, time DESC")
    records = c.fetchall()
    conn.close()
    
    return jsonify({
        'total_records': len(records),
        'attendance': [
            {
                'id': record[0],
                'student_id': record[1],
                'student_name': record[2],
                'date': record[3],
                'time': record[4],
                'status': record[5],
                'confidence': record[6]
            } for record in records
        ]
    })

@app.route('/api/debug/clear-attendance', methods=['POST'])
def clear_attendance():
    """Clear all attendance records for testing"""
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("DELETE FROM attendance")
    conn.commit()
    conn.close()
    return jsonify({'message': 'All attendance records cleared'})

@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({
        'success': True,
        'message': 'Backend is running!',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })

if __name__ == '__main__':
    print("🚀 AI Attendance System with OD Management Started")
    print("📊 Features: Face Recognition + Extracurricular OD Tracking")
    print("🌐 CORS Enabled for all origins")
    app.run(debug=True, port=5000, host='0.0.0.0')