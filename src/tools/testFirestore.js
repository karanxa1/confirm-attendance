const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Get absolute path to service account file
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin SDK initialized');
  
  const db = admin.firestore();
  
  // Try to write a test document
  db.collection('test').doc('test-doc').set({
    timestamp: new Date(),
    test: 'This is a test document'
  })
  .then(() => {
    console.log('✅ Successfully wrote to Firestore!');
    return db.collection('test').doc('test-doc').get();
  })
  .then((doc) => {
    console.log('✅ Successfully read from Firestore:', doc.data());
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Firestore operation failed:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Setup failed:', error);
  process.exit(1);
}
