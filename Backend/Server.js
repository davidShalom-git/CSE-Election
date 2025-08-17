require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection with better error handling
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vote';

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't throw error, let the app continue for testing
  }
};

// Initialize database connection
connectToDatabase();

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Voting API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'API base endpoint',
    availableRoutes: [
      'POST /api/vote/register',
      'POST /api/vote/login', 
      'POST /api/vote/:role',
      'GET /api/vote/candidates',
      'GET /api/vote/stats',
      'GET /api/vote/stats/:role',
      'GET /api/vote/user-status/:role'
    ]
  });
});

// Load user routes - SINGLE REGISTRATION
try {
  const userRouter = require('./router/User');
  app.use('/api/vote', userRouter);
  console.log('✅ User router loaded successfully');
} catch (err) {
  console.log('⚠️ User router not found or has errors:', err.message);

  // Create a fallback route
  app.get('/api/vote/test', (req, res) => {
    res.json({
      message: 'Vote API test endpoint (fallback)',
      note: 'User router not loaded',
      error: err.message
    });
  });
}

// Catch-all route for API
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: [
      '/',
      '/health',
      '/test',
      '/api',
      'POST /api/vote/register',
      'POST /api/vote/login',
      'POST /api/vote/:role',
      'GET /api/vote/candidates',
      'GET /api/vote/stats',
      'GET /api/vote/stats/:role',
      'GET /api/vote/user-status/:role'
    ],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel serverless
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Local URL: http://localhost:${PORT}`);
  });
}