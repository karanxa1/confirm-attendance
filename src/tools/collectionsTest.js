// Test script to check permissions on different collections
const admin = require('firebase-admin');
const path = require('path');

// Get absolute path to service account file
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  console.log('Firebase Admin SDK initialized');
  
  const db = admin.firestore();
  
  // Collections to test
  const collections = ['test', 'users', 'classes'];
  
  // Test each collection
  async function testCollections() {
    console.log('Testing access to collections...');
    
    for (const collectionName of collections) {
      try {
        console.log(`Testing collection: ${collectionName}...`);
        
        // Try to get documents
        const snapshot = await db.collection(collectionName).limit(1).get();
        console.log(`✅ CAN READ from collection '${collectionName}'. Found ${snapshot.size} documents.`);
        
        // Try to write a test document
        await db.collection(collectionName).doc('test-permissions').set({
          timestamp: new Date(),
          test: `Test document for ${collectionName} collection`
        });
        console.log(`✅ CAN WRITE to collection '${collectionName}'`);
        
        // Clean up the test document
        await db.collection(collectionName).doc('test-permissions').delete();
        console.log(`✅ CAN DELETE from collection '${collectionName}'`);
      } catch (error) {
        console.error(`❌ ERROR with collection '${collectionName}':`, error.code, error.message);
      }
    }
  }
  
  testCollections().then(() => {
    console.log('Collection tests completed');
    process.exit(0);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Setup failed:', error);
  process.exit(1);
}
