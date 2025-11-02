


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

app = Flask(__name__)
CORS(app)
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
            c.execute("INSERT INTO activities (name, type, description) VALUES (?, ?, ?)", activity)
        except:
            pass
    
    conn.commit()
    conn.close()

init_db()

class FaceRecognition:
    def __init__(self):
        self.known_face_names = ['Sujithra B', 'Yasodha R']
        self.known_face_ids = ['23IT56', '23IT63']
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
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
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

# OCR Function for OD Verification
def extract_text_from_file(file_path, file_type):
    try:
        if file_type == 'pdf':
            images = pdf2image.convert_from_path(file_path)
            text = ''
            for image in images:
                text += pytesseract.image_to_string(image)
        else:  # image
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
        
        return text.strip()
    except Exception as e:
        return f"OCR Error: {str(e)}"

def verify_od_content(text):
    """Enhanced OD verification for extracurricular activities"""
    text_lower = text.lower()
    
    # Keywords for extracurricular activities
    activity_keywords = {
        'sports': ['sports', 'tournament', 'match', 'game', 'practice', 'coach', 'team', 'athlete'],
        'technical': ['hackathon', 'workshop', 'symposium', 'technical', 'coding', 'programming', 'project'],
        'cultural': ['cultural', 'fest', 'music', 'dance', 'drama', 'debate', 'competition'],
        'general': ['certificate', 'participation', 'event', 'activity', 'program', 'college', 'institute']
    }
    
    # Verification keywords
    verification_keywords = [
        'on duty', 'od', 'permission', 'authorized', 'approved', 'coordinator',
        'faculty', 'head', 'department', 'signature', 'stamp', 'official'
    ]
    
    # Count matches for each category
    category_scores = {}
    for category, keywords in activity_keywords.items():
        category_scores[category] = sum(1 for keyword in keywords if keyword in text_lower)
    
    verification_score = sum(1 for keyword in verification_keywords if keyword in text_lower)
    
    # Determine activity type
    detected_activity = max(category_scores, key=category_scores.get)
    total_score = sum(category_scores.values()) + verification_score
    
    if total_score >= 3:
        return True, f"Valid {detected_activity.capitalize()} activity detected", detected_activity
    else:
        return False, "Insufficient evidence of valid extracurricular activity", None

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

# Get available activities
@app.route('/api/activities', methods=['GET'])
@token_required
def get_activities(current_user):
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT * FROM activities WHERE approved = TRUE")
    activities = c.fetchall()
    conn.close()
    
    activity_list = []
    for activity in activities:
        activity_list.append({
            'id': activity[0],
            'name': activity[1],
            'type': activity[2],
            'description': activity[3]
        })
    
    return jsonify({'activities': activity_list})

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

@app.route('/api/student/mark-attendance', methods=['POST'])
@token_required
def mark_attendance(current_user):
    if current_user['role'] != 'student':
        return jsonify({'error': 'Access denied'}), 403
    
    # Mock face recognition
    student_index = random.randint(0, len(face_recog.known_face_names) - 1)
    name = face_recog.known_face_names[student_index]
    student_id = face_recog.known_face_ids[student_index]
    confidence = round(random.uniform(0.7, 0.95), 2)
    
    # Record attendance
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    today = datetime.now().strftime('%Y-%m-%d')
    current_time = datetime.now().strftime('%H:%M:%S')
    
    c.execute("INSERT INTO attendance (student_id, student_name, date, time, status, confidence) VALUES (?, ?, ?, ?, ?, ?)",
              (student_id, name, today, current_time, 'present', confidence))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Attendance marked successfully!',
        'student': {'name': name, 'student_id': student_id},
        'confidence': confidence,
        'timestamp': f"{today} {current_time}"
    })

@app.route('/api/student/upload-od', methods=['POST'])
@token_required
def upload_od(current_user):
    if current_user['role'] != 'student':
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        data = request.form
        file = request.files['od_file']
        
        # Validate required fields
        required_fields = ['activity_type', 'activity_name', 'event_date', 'od_reason']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        if not file:
            return jsonify({'error': 'No file uploaded'}), 400
        
        # Save uploaded file
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in ['pdf', 'jpg', 'jpeg', 'png']:
            return jsonify({'error': 'Invalid file format. Please upload PDF or image files.'}), 400
        
        filename = f"od_{current_user['student_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Extract text using OCR
        ocr_text = extract_text_from_file(file_path, 'pdf' if file_extension == 'pdf' else 'image')
        
        # Verify OD content
        is_valid, verification_message, detected_activity = verify_od_content(ocr_text)
        
        # Create OD request record
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        
        c.execute('''INSERT INTO od_requests 
                    (student_id, student_name, activity_type, activity_name, event_date, 
                     event_venue, organized_by, coordinator_name, coordinator_contact,
                     od_reason, od_file_path, ocr_text, verified_by_ocr) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (current_user['student_id'], current_user['name'],
                   data.get('activity_type'), data.get('activity_name'), data.get('event_date'),
                   data.get('event_venue'), data.get('organized_by'), 
                   data.get('coordinator_name'), data.get('coordinator_contact'),
                   data.get('od_reason'), file_path, ocr_text, is_valid))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'OD request submitted successfully!',
            'verification': {
                'is_valid': is_valid,
                'message': verification_message,
                'detected_activity': detected_activity
            },
            'request_id': c.lastrowid
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to upload OD: {str(e)}'}), 500

@app.route('/api/student/od-requests', methods=['GET'])
@token_required
def get_student_od_requests(current_user):
    if current_user['role'] != 'student':
        return jsonify({'error': 'Access denied'}), 403
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute('''SELECT * FROM od_requests WHERE student_id = ? ORDER BY created_at DESC''',
              (current_user['student_id'],))
    requests = c.fetchall()
    conn.close()
    
    od_requests = []
    for req in requests:
        od_requests.append({
            'id': req[0],
            'activity_type': req[3],
            'activity_name': req[4],
            'event_date': req[5],
            'status': req[13],
            'admin_notes': req[14],
            'verified_by_ocr': bool(req[15]),
            'created_at': req[16]
        })
    
    return jsonify({'od_requests': od_requests})

# Admin Routes
@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
def admin_dashboard(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    # Get statistics
    c.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
    total_students = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM attendance WHERE date = ?", (datetime.now().strftime('%Y-%m-%d'),))
    today_attendance = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM od_requests WHERE status = 'pending'")
    pending_od = c.fetchone()[0]
    
    c.execute("SELECT status, COUNT(*) FROM od_requests GROUP BY status")
    od_stats = c.fetchall()
    
    # Get recent OD requests
    c.execute('''SELECT r.id, r.student_name, r.activity_name, r.activity_type, 
                        r.status, r.created_at, r.verified_by_ocr
                 FROM od_requests r 
                 ORDER BY r.created_at DESC LIMIT 5''')
    recent_requests = c.fetchall()
    
    conn.close()
    
    return jsonify({
        'stats': {
            'total_students': total_students,
            'today_attendance': today_attendance,
            'pending_od_requests': pending_od,
            'od_breakdown': {status: count for status, count in od_stats}
        },
        'recent_requests': [
            {
                'id': req[0],
                'student_name': req[1],
                'activity_name': req[2],
                'activity_type': req[3],
                'status': req[4],
                'created_at': req[5],
                'verified_by_ocr': bool(req[6])
            } for req in recent_requests
        ]
    })

@app.route('/api/admin/od-requests', methods=['GET'])
@token_required
def get_all_od_requests(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    status_filter = request.args.get('status', 'all')
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    if status_filter == 'all':
        c.execute('''SELECT * FROM od_requests ORDER BY created_at DESC''')
    else:
        c.execute('''SELECT * FROM od_requests WHERE status = ? ORDER BY created_at DESC''', (status_filter,))
    
    requests = c.fetchall()
    conn.close()
    
    od_requests = []
    for req in requests:
        od_requests.append({
            'id': req[0],
            'student_id': req[1],
            'student_name': req[2],
            'activity_type': req[3],
            'activity_name': req[4],
            'event_date': req[5],
            'event_venue': req[6],
            'organized_by': req[7],
            'coordinator_name': req[8],
            'coordinator_contact': req[9],
            'od_reason': req[10],
            'status': req[13],
            'admin_notes': req[14],
            'verified_by_ocr': bool(req[15]),
            'created_at': req[16]
        })
    
    return jsonify({'od_requests': od_requests})

@app.route('/api/admin/od-request/<int:request_id>', methods=['GET'])
@token_required
def get_od_request_details(current_user, request_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute('''SELECT * FROM od_requests WHERE id = ?''', (request_id,))
    request_data = c.fetchone()
    conn.close()
    
    if not request_data:
        return jsonify({'error': 'OD request not found'}), 404
    
    return jsonify({
        'id': request_data[0],
        'student_id': request_data[1],
        'student_name': request_data[2],
        'activity_type': request_data[3],
        'activity_name': request_data[4],
        'event_date': request_data[5],
        'event_venue': request_data[6],
        'organized_by': request_data[7],
        'coordinator_name': request_data[8],
        'coordinator_contact': request_data[9],
        'od_reason': request_data[10],
        'ocr_text': request_data[12],
        'status': request_data[13],
        'admin_notes': request_data[14],
        'verified_by_ocr': bool(request_data[15]),
        'created_at': request_data[16]
    })

@app.route('/api/admin/approve-od/<int:request_id>', methods=['POST'])
@token_required
def approve_od_request(current_user, request_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    notes = data.get('notes', '')
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    # Get OD request details
    c.execute('''SELECT student_id, student_name, event_date FROM od_requests WHERE id = ?''', (request_id,))
    od_request = c.fetchone()
    
    if not od_request:
        conn.close()
        return jsonify({'error': 'OD request not found'}), 404
    
    student_id, student_name, event_date = od_request
    
    # Update OD request status
    c.execute('''UPDATE od_requests SET status = 'approved', admin_notes = ? WHERE id = ?''',
              (notes, request_id))
    
    # Mark attendance as OD for that date
    c.execute('''INSERT OR REPLACE INTO attendance 
                 (student_id, student_name, date, time, status, confidence) 
                 VALUES (?, ?, ?, ?, ?, ?)''',
              (student_id, student_name, event_date, '00:00:00', 'on_duty', 1.0))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'OD request approved successfully'
    })

@app.route('/api/admin/reject-od/<int:request_id>', methods=['POST'])
@token_required
def reject_od_request(current_user, request_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    notes = data.get('notes', '')
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    # Update OD request status
    c.execute('''UPDATE od_requests SET status = 'rejected', admin_notes = ? WHERE id = ?''',
              (notes, request_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'OD request rejected'
    })

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image provided'}), 400

        image_file = request.files['image']

        # Mock face recognition - simulate processing time
        import time
        time.sleep(1)

        # Randomly select a known face for demo
        student_index = random.randint(0, len(face_recog.known_face_names) - 1)
        name = face_recog.known_face_names[student_index]
        student_id = face_recog.known_face_ids[student_index]
        confidence = round(random.uniform(0.75, 0.98), 2)

        # In a real implementation, you would:
        # 1. Save the uploaded image temporarily
        # 2. Use DeepFace.find() or similar to match against known faces
        # 3. Return the matched student information

        return jsonify({
            'success': True,
            'message': f'Face recognized successfully! Welcome {name}',
            'student': {
                'name': name,
                'student_id': student_id
            },
            'confidence': confidence
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Face recognition failed: {str(e)}'
        }), 500

@app.route('/')
def home():
    return jsonify({
        "status": "AI Attendance System with OD Management",
        "version": "2.0",
        "features": ["Face Recognition", "OD Management", "Extracurricular Tracking"]
    })

if __name__ == '__main__':
    print("🚀 AI Attendance System with OD Management Started")
    print("📊 Features: Face Recognition + Extracurricular OD Tracking")
    app.run(debug=True, port=5000, host='0.0.0.0')