const express = require('express');
const router = express.Router();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const authController = require('../controllers/authController');
const { getUserDetails } = require('../middleware/auth');

/**
 * POST /api/auth/signup
 * Create a new user account
 * Public endpoint
 */
router.post('/signup', authController.signUp);

/**
 * POST /api/auth/signin
 * Sign in with email and password
 * Public endpoint
 */
router.post('/signin', authController.signIn);

/**
 * POST /api/auth/signout
 * Sign out current user (revoke session)
 * Public endpoint (requires sessionId in body)
 */
router.post('/signout', authController.signOut);

/**
 * POST /api/auth/webhook
 * Clerk webhook endpoint to sync users with Firestore
 * This is called by Clerk when users are created/updated/deleted
 */
router.post('/webhook', authController.handleWebhook);

/**
 * GET /api/auth/me
 * Get current authenticated user information
 * Requires valid Clerk authentication token
 */
router.get('/me', 
  ClerkExpressRequireAuth(), 
  getUserDetails, 
  authController.getCurrentUser
);

module.exports = router;
