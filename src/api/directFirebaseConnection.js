// Direct Firebase connection using the exact pattern from the successful test script
const admin = require('firebase-admin');
const path = require('path');

// Clear any existing Firebase apps to prevent conflicts
admin.apps.forEach(app => {
  try {
    app.delete();
  } catch (error) {
    console.error('Error deleting existing Firebase app:', error);
  }
});

// Get absolute path to service account file - exact same as test script
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
console.log(`Loading service account from: ${serviceAccountPath}`);

try {
  // Use require to load the JSON - exact same as test script
  const serviceAccount = require(serviceAccountPath);
  
  // Initialize Firebase Admin
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log(`🔥 Direct Firebase Admin initialized with project: ${serviceAccount.project_id}`);
  
  // Get Firestore instance - exact same as test script
  const db = admin.firestore();
  
  module.exports = { admin, db };
} catch (error) {
  console.error('❌ Direct Firebase Admin initialization error:', error);
  process.exit(1); // Critical error - exit the process
}
