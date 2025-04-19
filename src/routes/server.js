// Load environment variables at the start
require('dotenv').config();

// Use the environment-based admin config
const { admin, db } = require('../config/envAdminConfig');

const express = require('express');
const path = require('path');
const app = express();
const adminRouter = require('./admin');
const attendanceRouter = require('./attendance');
const classesRouter = require('./classes');
const graphRouter = require('./graph');
const authRouter = require('./auth');
const sheetsRouter = require('./sheets');
const excelRouter = require('./excel');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../../public')));

// Enable CORS (optional, add if frontend and backend are on different origins)
const cors = require('cors');
app.use(cors());

// API routes
app.use('/api', adminRouter);
app.use('/api', attendanceRouter);
app.use('/api', classesRouter);
app.use('/api', graphRouter);
app.use('/api', authRouter);
app.use('/api', sheetsRouter);
app.use('/api', excelRouter);

// Add the test route
app.use('/api/test', require('../api/test'));

// Add the direct test route
app.use('/api/direct-test', require('../api/directTest'));

// Fallback to serve index.html for SPA, but only for non-API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../../public', 'index.html'));
    } else {
        res.status(404).json({ message: 'API route not found' });
    }
});

// Add error handling middleware at the end
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Configure port options
const PORT = process.env.PORT || 3000;
const ALT_PORT = 3001;  // Alternative port if default port is busy

// Start server with error handling for port conflicts
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`For local development, access at http://localhost:${PORT}`);
  console.log(`API endpoint available at: http://localhost:${PORT}/api`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is busy, trying alternative port ${ALT_PORT}`);
    app.listen(ALT_PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${ALT_PORT}`);
      console.log(`For local development, access at http://localhost:${ALT_PORT}`);
      console.log(`API endpoint available at: http://localhost:${ALT_PORT}/api`);
    });
  } else {
    console.error('Error starting server:', err);
  }
});