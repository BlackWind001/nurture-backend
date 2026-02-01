require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize Firebase (this runs the initialization)
require('./config/firebase');

// Create Express application
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Public routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Nurture backend is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (includes webhook which is public)
app.use('/api/auth', authRoutes);

// Protected routes - require Clerk authentication
app.use('/api/users', ClerkExpressRequireAuth(), userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Nurture Backend Server Started');
  console.log('================================');
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /health - Health check`);
  console.log(`  POST /api/auth/webhook - Clerk webhook`);
  console.log(`  GET  /api/auth/me - Get current user (protected)`);
  console.log(`  GET  /api/users/profile - Get user profile (protected)`);
  console.log(`  PATCH /api/users/profile - Update user profile (protected)`);
  console.log('');
});

module.exports = app;
