const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const path = require('path');

// Test connection route
router.get('/', async (req, res) => {
  try {
    console.log('⚡ TEST ENDPOINT: Starting fresh Firebase Admin initialization');
    
    // Clear any existing apps first
    let appsCleared = 0;
    admin.apps.forEach(app => {
      try {
        app.delete();
        appsCleared++;
      } catch (error) {
        console.error('Error clearing app:', error);
      }
    });
    console.log(`Cleared ${appsCleared} existing Firebase app instances`);
    
    // Initialize Firebase Admin directly in the route
    const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
    console.log(`Loading service account from: ${serviceAccountPath}`);
    
    // Load service account directly
    const serviceAccount = require(serviceAccountPath);
    
    // Initialize new instance
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    }, 'direct-test-' + Date.now()); // Unique name to avoid conflicts
    
    console.log(`Test route: Firebase Admin initialized with project ${serviceAccount.project_id}`);
    
    // Get fresh Firestore instance
    const db = app.firestore();
    
    // Test collections
    const collections = ['test', 'users', 'classes'];
    const results = {};
    
    // Test each collection
    for (const collection of collections) {
      try {
        const snapshot = await db.collection(collection).limit(5).get();
        results[collection] = {
          success: true,
          count: snapshot.size,
          documents: []
        };
        
        snapshot.forEach(doc => {
          results[collection].documents.push({
            id: doc.id,
            exists: doc.exists,
            data: doc.data()
          });
        });
      } catch (error) {
        results[collection] = {
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        };
      }
    }
    
    // Success response
    res.json({
      status: 'success',
      firebaseInitialized: true,
      projectId: serviceAccount.project_id,
      collections: results
    });
    
    // Clean up the test app
    app.delete()
      .then(() => console.log('Test Firebase app deleted'))
      .catch(error => console.error('Error deleting test app:', error));
      
  } catch (error) {
    console.error('TEST ENDPOINT ERROR:', error);
    
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'unknown',
        message: error.message,
        stack: error.stack
      }
    });
  }
});

module.exports = router;
