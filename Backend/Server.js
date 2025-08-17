require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const vote = require('./router/User');

const app = express();

// Define allowed origins in one place
const allowedOrigins = [
  'https://cse-election-2025.vercel.app',
  'https://cse-election.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001'
];

// Enhanced CORS configuration for Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));

// Fixed OPTIONS handler that respects the origin
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Set the origin header dynamically based on the request
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600'); // Cache preflight for 1 hour
  res.status(200).end();
});

// Additional manual CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  // Log the request for debugging
  console.log(`${req.method} ${req.path} - Origin: ${origin}`);
  
  next();
});

// Body parsing middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

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
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't throw error, let the app continue
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
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    allowedOrigins: allowedOrigins
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

// CORS test route
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    method: req.method,
    allowedOrigins: allowedOrigins,
    corsHeaders: {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
    },
    timestamp: new Date().toISOString()
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

// API base route
app.get('/api', (req, res) => {
  res.json({
    message: 'API base endpoint',
    availableRoutes: [
      'GET /',
      'GET /health', 
      'GET /test',
      'GET /api/test-cors',
      'GET /api',
      'POST /api/vote/login'
    ]
  });
});

// Load and use vote routes
try {
  app.use('/api/vote', vote);
  console.log('✅ User router loaded successfully');
} catch (err) {
  console.log('⚠️ User router error:', err.message);
  
  // Fallback login route for testing
  app.post('/api/vote/login', (req, res) => {
    console.log('Fallback login route hit');
    console.log('Request body:', req.body);
    console.log('Request origin:', req.headers.origin);
    
    res.json({
      success: true,
      message: 'Fallback login endpoint - User router had error',
      body: req.body,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
  });

  // Fallback test route
  app.get('/api/vote/test', (req, res) => {
    res.json({
      message: 'Vote API test endpoint (fallback)',
      note: 'User router had error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  });
}

// Catch-all for API routes
app.all('/api/*', (req, res) => {
  console.log(`404 - API endpoint not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler
app.all('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    method: req.method,
    availableRoutes: ['/', '/health', '/test', '/api', '/api/vote/*'],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
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
    console.log(`🌐 Allowed origins:`, allowedOrigins);
  });
}