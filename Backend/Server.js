require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Define allowed origins
const allowedOrigins = [
  'https://cse-election-2025.vercel.app',
  'https://cse-election.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001'
];

// CORS Middleware - This must work even if other parts fail
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin;
    
    console.log(`${req.method} ${req.url} - Origin: ${origin}`);
    
    // Set CORS headers for all requests
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // Allow requests with no origin
      res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Max-Age', '86400');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request for:', req.url);
      return res.status(200).end();
    }
    
    next();
  } catch (error) {
    console.error('CORS middleware error:', error);
    res.status(500).json({ error: 'CORS middleware failed', message: error.message });
  }
});

// Body parsing middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection - make it non-blocking
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('⚠️ No MONGODB_URI provided, running without database');
      return;
    }
    
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
    // Don't throw - let the app continue
  }
};

// Initialize database connection (non-blocking)
connectToDatabase().catch(console.error);

// Root route - always works
app.get('/', (req, res) => {
  try {
    res.json({ 
      message: 'Voting API is running!', 
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      allowedOrigins: allowedOrigins,
      database: isConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ error: 'Root route error', message: error.message });
  }
});

// Health check route
app.get('/health', (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: isConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check error', message: error.message });
  }
});

// CORS test route
app.get('/api/test-cors', (req, res) => {
  try {
    res.json({
      message: 'CORS test successful',
      origin: req.headers.origin,
      method: req.method,
      allowedOrigins: allowedOrigins,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'CORS test error', message: error.message });
  }
});

// Basic login endpoint that doesn't depend on external files
app.post('/api/vote/login', (req, res) => {
  try {
    console.log('Login endpoint hit');
    console.log('Request body:', req.body);
    console.log('Request origin:', req.headers.origin);
    
    const { Email, Password } = req.body;
    
    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Email and Password are required'
      });
    }
    
    // For now, just return success (replace with real auth later)
    res.json({
      success: true,
      message: 'Login endpoint working - implement authentication logic',
      user: { Email },
      timestamp: new Date().toISOString(),
      note: 'This is a basic implementation. Add your auth logic here.'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login endpoint error', 
      message: error.message 
    });
  }
});

// Basic register endpoint
app.post('/api/vote/register', (req, res) => {
  try {
    const { Email, Password } = req.body;
    
    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Email and Password are required'
      });
    }
    
    res.json({
      success: true,
      message: 'Register endpoint working - implement registration logic',
      user: { Email },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Register endpoint error', 
      message: error.message 
    });
  }
});

// Try to load the User router, but don't crash if it fails
let userRouterLoaded = false;

try {
  const vote = require('./router/User');
  // Only use the router if it loaded successfully
  if (vote) {
    app.use('/api/vote-advanced', vote); // Use different path to avoid conflicts
    userRouterLoaded = true;
    console.log('✅ User router loaded successfully on /api/vote-advanced');
  }
} catch (error) {
  console.error('⚠️ User router failed to load:', error.message);
  console.error('Stack:', error.stack);
  // Don't crash - continue with basic endpoints
}

// API info route
app.get('/api', (req, res) => {
  try {
    res.json({
      message: 'API base endpoint',
      status: 'running',
      userRouterLoaded,
      availableRoutes: [
        'GET /',
        'GET /health', 
        'GET /api/test-cors',
        'GET /api',
        'POST /api/vote/login',
        'POST /api/vote/register',
        ...(userRouterLoaded ? ['All routes under /api/vote-advanced'] : [])
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'API info error', message: error.message });
  }
});

// 404 handler for API routes
app.all('/api/*', (req, res) => {
  try {
    console.log(`404 - API endpoint not found: ${req.method} ${req.path}`);
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.path,
      method: req.method,
      availableEndpoints: ['/api/vote/login', '/api/vote/register', '/api/test-cors'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: '404 handler error', message: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  try {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  } catch (responseError) {
    console.error('Error in error handler:', responseError);
    res.end('Critical error');
  }
});

// Global 404 handler
app.all('*', (req, res) => {
  try {
    console.log(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ 
      error: 'Route not found', 
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Global 404 handler error', message: error.message });
  }
});

// Export for Vercel
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