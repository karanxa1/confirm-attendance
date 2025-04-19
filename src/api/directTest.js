const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Create a test endpoint that directly initializes Firebase Admin
router.get('/', async (req, res) => {
  try {
    console.log('🧪 DIRECT TEST: Starting fresh Firebase Admin initialization');
    
    // Delete any existing Firebase apps
    while (admin.apps.length > 0) {
      await admin.apps[0].delete();
      console.log('Deleted existing Firebase app instance');
    }
    
    // Get absolute path to service account file
    const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
    console.log(`Loading service account from: ${serviceAccountPath}`);
    
    // Check if file exists
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account file not found at ${serviceAccountPath}`);
    }
    
    // Read file directly
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountContent);
    
    // Initialize Firebase Admin directly within the route handler
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    }, `direct-test-${Date.now()}`);
    
    const db = app.firestore();
    console.log(`Firebase Admin initialized for project: ${serviceAccount.project_id}`);
    
    // Test collections
    const testResults = {};
    
    // Test reading from classes collection
    console.log('Testing classes collection...');
    try {
      const classesSnapshot = await db.collection('classes').get();
      testResults.classes = {
        success: true,
        count: classesSnapshot.size,
        items: []
      };
      
      classesSnapshot.forEach(doc => {
        testResults.classes.items.push({
          id: doc.id,
          data: doc.data()
        });
      });
      
      console.log(`Successfully fetched ${classesSnapshot.size} classes`);
    } catch (error) {
      testResults.classes = {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
      console.error('Failed to fetch classes:', error);
    }
    
    // Test reading from users collection
    console.log('Testing users collection...');
    try {
      const usersSnapshot = await db.collection('users').get();
      testResults.users = {
        success: true,
        count: usersSnapshot.size,
        items: []
      };
      
      usersSnapshot.forEach(doc => {
        testResults.users.items.push({
          id: doc.id,
          data: doc.data()
        });
      });
      
      console.log(`Successfully fetched ${usersSnapshot.size} users`);
    } catch (error) {
      testResults.users = {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
      console.error('Failed to fetch users:', error);
    }
    
    // Send response
    res.json({
      status: 'success',
      projectId: serviceAccount.project_id,
      results: testResults
    });
    
    // Clean up
    await app.delete();
    console.log('Test Firebase app deleted');
    
  } catch (error) {
    console.error('DIRECT TEST ERROR:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
