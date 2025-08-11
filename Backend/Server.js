require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vote')
  .then(() => {
    console.log('DB connected');
  })
  .catch((err) => {
    console.log('MongoDB error:', err);
  });

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Voting API is running!', 
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API routes
try {
  const userRouter = require('./router/User');
  app.use('/api/vote', userRouter);
} catch (err) {
  console.log('Router loading error:', err.message);
  // Continue without router for now
}

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.get('*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found', 
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// For Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}