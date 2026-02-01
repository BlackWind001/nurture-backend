const { clerkClient } = require('@clerk/clerk-sdk-node');

/**
 * Middleware to get full user details from Clerk
 * Attaches user information to the request object
 */
async function getUserDetails(req, res, next) {
  try {
    const userId = req.auth.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized - No user ID found',
        code: 'NO_USER_ID'
      });
    }

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Attach user information to request
    req.clerkUser = user;
    req.userId = userId;
    req.userEmail = user.emailAddresses[0]?.emailAddress;
    
    // Get relationship data from user metadata if it exists
    req.relationshipId = user.publicMetadata?.relationshipId || null;
    req.partnerId = user.publicMetadata?.partnerId || null;
    
    next();
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user details',
      code: 'USER_FETCH_ERROR'
    });
  }
}

/**
 * Middleware to check if user is in a relationship
 * Use this to protect relationship-specific endpoints
 */
function requireRelationship(req, res, next) {
  if (!req.relationshipId) {
    return res.status(403).json({ 
      error: 'You must be in a relationship to access this resource',
      code: 'NO_RELATIONSHIP'
    });
  }
  next();
}

/**
 * Middleware to check if user is NOT in a relationship
 * Use this for endpoints like creating/accepting invitations
 */
function requireNoRelationship(req, res, next) {
  if (req.relationshipId) {
    return res.status(400).json({ 
      error: 'You are already in a relationship',
      code: 'ALREADY_IN_RELATIONSHIP'
    });
  }
  next();
}

module.exports = {
  getUserDetails,
  requireRelationship,
  requireNoRelationship
};
