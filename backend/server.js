const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Student database (will be loaded from file)
let students = [];

// Load students from file
async function loadStudentsFromFile() {
  try {
    const data = await fs.readFile('./data/students.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Save students to file
async function saveStudentsToFile() {
  try {
    const data = JSON.stringify(students, null, 2);
    await fs.writeFile('./data/students.json', data);
    console.log('💾 Students data saved successfully');
  } catch (error) {
    console.error('❌ Error saving students data:', error);
  }
}

// Initialize server
async function initializeServer() {
  try {
    // Load existing students
    students = await loadStudentsFromFile();
    console.log(`📚 Loaded ${students.length} students from database`);

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`🎯 Face Recognition Attendance System`);
      console.log(`✅ System ready for development`);
    });
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
  }
}

// Basic API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Get all students
app.get('/api/students', (req, res) => {
  res.json({
    success: true,
    students: students,
    count: students.length
  });
});

// Get system status
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    system: 'Face Recognition Attendance',
    status: 'Running',
    students: students.length,
    version: '1.0.0',
    models: 'Ready to load'
  });
});

// Initialize and start server
initializeServer();