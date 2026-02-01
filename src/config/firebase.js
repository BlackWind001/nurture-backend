require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

/**
 * Initialize Firebase Admin SDK
 * Supports both service account JSON file and individual credentials
 */
function initializeFirebase() {
  try {
    // Option 1: Use service account JSON file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      
      // Check if file exists
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath.startsWith('.') 
          ? '../../' + serviceAccountPath 
          : serviceAccountPath
        );
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        
        console.log('✅ Firebase initialized with service account JSON');
        // #region agent log
        fs.appendFileSync('/Users/anirudhms/Desktop/Projects/nurture-backend/.cursor/debug.log', JSON.stringify({location:'firebase.js:22',message:'Firebase Admin initialized',data:{projectId:serviceAccount.project_id,clientEmail:serviceAccount.client_email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})+'\n');
        // #endregion
      } else {
        console.warn('⚠️  Firebase service account file not found. Using individual credentials.');
        initializeWithIndividualCredentials();
      }
    } 
    // Option 2: Use individual credentials
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeWithIndividualCredentials();
    } 
    else {
      console.error('❌ Firebase credentials not configured. Please set up Firebase environment variables.');
      console.error('Either provide FIREBASE_SERVICE_ACCOUNT_PATH or individual credentials (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    throw error;
  }
}

/**
 * Initialize Firebase with individual environment variables
 */
function initializeWithIndividualCredentials() {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  
  console.log('✅ Firebase initialized with individual credentials');
}

// Initialize Firebase
initializeFirebase();

// Get Firestore instance
const db = admin.firestore();
// #region agent log
fs.appendFileSync('/Users/anirudhms/Desktop/Projects/nurture-backend/.cursor/debug.log', JSON.stringify({location:'firebase.js:65',message:'Firestore instance created',data:{hasDb:!!db},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})+'\n');
// #endregion

// Configure Firestore settings for better performance
db.settings({
  ignoreUndefinedProperties: true
});
// #region agent log
fs.appendFileSync('/Users/anirudhms/Desktop/Projects/nurture-backend/.cursor/debug.log', JSON.stringify({location:'firebase.js:70',message:'Firestore settings configured',data:{settings:{ignoreUndefinedProperties:true}},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})+'\n');
// #endregion

module.exports = {
  admin,
  db
};
