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

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Voting API is running!', 
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Import and use routes (comment out if User.js doesn't exist yet)
try {
  const user = require('./router/User');
  app.use('/api/vote', user);
} catch (err) {
  console.log('Router not found, skipping...');
}

// Catch all route
app.get('*', (req, res) => {
  res.json({ message: 'API endpoint not found', path: req.path });
});

// IMPORTANT: Export for Vercel
module.exports = app;