const admin = require('firebase-admin');

try {
  // Initialize without any parameters to use Application Default Credentials
  admin.initializeApp({
    projectId: 'sample-firbase-ai-app-c1fc3'
  });
  
  console.log('Firebase Admin initialized using Application Default Credentials');
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
  process.exit(1);
}

const adminDb = admin.firestore();

module.exports = { admin, adminDb };
