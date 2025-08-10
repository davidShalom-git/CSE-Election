require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const user = require('./router/User');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection - USE ENVIRONMENT VARIABLE
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vote')
  .then(() => {
    console.log('DB connected');
  })
  .catch((err) => {
    console.log(err);
  });

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Voting API is running!', status: 'success' });
});

// Routes
app.use('/api/vote', user);

// Export for Vercel (IMPORTANT!)
module.exports = app;