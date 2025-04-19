// Using the exact same approach as the successful test script
const admin = require('firebase-admin');
const path = require('path');

try {
  console.log('Initializing Firebase Admin with verified configuration...');
  
  // Only initialize if not already done
  if (!admin.apps.length) {
    // This is exactly how the test script loads the service account - use require directly
    const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log(`✅ Firebase Admin initialized with service account for project: ${serviceAccount.project_id}`);
  } else {
    console.log('Firebase Admin was already initialized');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  process.exit(1); // Exit if initialization fails
}

// Get Firestore instance - use the same variable name as the test script
const db = admin.firestore();

// Verify db is initialized and working by testing connection
db.collection('test').limit(1).get()
  .then(snapshot => {
    console.log('✅ Firebase Admin DB connection verified');
  })
  .catch(error => {
    console.error('❌ Firebase Admin DB connection error:', error);
  });

// Export the admin instance and db
module.exports = { admin, db };
