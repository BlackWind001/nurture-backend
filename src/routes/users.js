const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { getUserDetails } = require('../middleware/auth');

// All routes here require authentication (ClerkExpressRequireAuth applied in server.js)
// Apply getUserDetails middleware to all routes in this router
router.use(getUserDetails);

/**
 * GET /api/users/profile
 * Get user profile from Firestore
 */
router.get('/profile', userController.getProfile);

/**
 * PATCH /api/users/profile
 * Update user profile data
 * Body: { profileData: { key: value, ... } }
 */
router.patch('/profile', userController.updateProfile);

module.exports = router;
