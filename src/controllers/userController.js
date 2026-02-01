const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Get user profile from Firestore
 */
async function getProfile(req, res) {
  try {
    const userId = req.userId;

    // Fetch user document from Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User profile not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const userData = userDoc.data();

    // Return user profile
    res.json({
      profile: {
        clerkId: userData.clerkId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        relationshipId: userData.relationshipId,
        partnerId: userData.partnerId,
        profileData: userData.profileData || {},
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      error: 'Failed to get profile',
      code: 'PROFILE_FETCH_ERROR'
    });
  }
}

/**
 * Update user profile data
 * Updates the flexible profileData object in Firestore
 */
async function updateProfile(req, res) {
  try {
    const userId = req.userId;
    const { profileData } = req.body;

    if (!profileData || typeof profileData !== 'object') {
      return res.status(400).json({ 
        error: 'profileData must be a valid object',
        code: 'INVALID_PROFILE_DATA'
      });
    }

    // Update user document in Firestore
    const userRef = db.collection('users').doc(userId);
    
    // Check if user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User profile not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Merge new profile data with existing data
    await userRef.update({
      profileData: {
        ...userDoc.data().profileData,
        ...profileData
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get updated document
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();

    res.json({
      message: 'Profile updated successfully',
      profile: {
        profileData: updatedData.profileData,
        updatedAt: updatedData.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile
};
