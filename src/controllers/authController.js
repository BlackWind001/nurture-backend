const { Webhook } = require('svix');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Clerk webhook handler to sync users with Firestore
 * This creates/updates/deletes users in Firestore when they sign up/update/delete via Clerk
 */
async function handleWebhook(req, res) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
    }

    // Get the headers
    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    };

    // Get the body
    const payload = req.body;

    // Verify the webhook
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;
    
    try {
      evt = wh.verify(JSON.stringify(payload), headers);
    } catch (err) {
      console.error('Error verifying webhook:', err.message);
      return res.status(400).json({ 
        error: 'Invalid webhook signature',
        code: 'INVALID_SIGNATURE'
      });
    }

    const { id, email_addresses, first_name, last_name } = evt.data;
    const eventType = evt.type;

    console.log(`📥 Webhook received: ${eventType} for user ${id}`);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/4750a9d6-0ad5-4837-a953-eafec6a31688',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:44',message:'Webhook event received',data:{eventType,userId:id,email:email_addresses[0]?.email_address},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Handle different event types
    if (eventType === 'user.created') {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/4750a9d6-0ad5-4837-a953-eafec6a31688',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:48',message:'Entering user.created handler',data:{userId:id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const userRef = db.collection('users').doc(id);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/4750a9d6-0ad5-4837-a953-eafec6a31688',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:50',message:'Created userRef, attempting set operation',data:{userId:id,collectionPath:'users'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
      
      try {
        await userRef.set({
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          relationshipId: null,
          partnerId: null,
          profileData: {},
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/4750a9d6-0ad5-4837-a953-eafec6a31688',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:62',message:'userRef.set() succeeded',data:{userId:id,email:email_addresses[0]?.email_address},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } catch (setError) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/4750a9d6-0ad5-4837-a953-eafec6a31688',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:64',message:'userRef.set() failed',data:{userId:id,errorCode:setError.code,errorMessage:setError.message,errorDetails:setError.details,errorReason:setError.reason},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C,D'})}).catch(()=>{});
        // #endregion
        throw setError;
      }
      
      console.log(`✅ User created in Firestore: ${email_addresses[0]?.email_address}`);
    }

    if (eventType === 'user.updated') {
      const userRef = db.collection('users').doc(id);
      
      await userRef.update({
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ User updated in Firestore: ${email_addresses[0]?.email_address}`);
    }

    if (eventType === 'user.deleted') {
      const userRef = db.collection('users').doc(id);
      await userRef.delete();
      
      console.log(`✅ User deleted from Firestore: ${id}`);
    }

    res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ 
      error: error.message,
      code: 'WEBHOOK_ERROR'
    });
  }
}

/**
 * Get current authenticated user
 * Returns user data from Clerk + Firestore
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.userId;

    // Fetch user data from Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // User exists in Clerk but not in Firestore (shouldn't happen with webhook)
      console.warn(`User ${userId} exists in Clerk but not in Firestore`);
      
      return res.json({
        user: {
          id: userId,
          email: req.userEmail,
          firstName: req.clerkUser.firstName,
          lastName: req.clerkUser.lastName,
          hasRelationship: false,
          relationshipId: null,
          partnerId: null
        }
      });
    }

    const userData = userDoc.data();

    res.json({
      user: {
        id: userId,
        email: req.userEmail,
        firstName: req.clerkUser.firstName,
        lastName: req.clerkUser.lastName,
        hasRelationship: !!userData.relationshipId,
        relationshipId: userData.relationshipId,
        partnerId: userData.partnerId,
        profileData: userData.profileData || {}
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      code: 'USER_FETCH_ERROR'
    });
  }
}

module.exports = {
  handleWebhook,
  getCurrentUser
};
