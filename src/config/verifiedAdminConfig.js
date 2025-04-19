const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

try {
  console.log('Initializing Firebase Admin...');
  
  // Only initialize if not already done
  if (!admin.apps.length) {
    let serviceAccount;
    
    // Method 1: Try to use environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Using FIREBASE_SERVICE_ACCOUNT environment variable');
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } 
    // Method 2: Try to load from local file
    else {
      const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
      if (fs.existsSync(serviceAccountPath)) {
        console.log('Using local serviceAccountKey.json file');
        const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(serviceAccountContent);
      } else {
        throw new Error('No Firebase credentials found. Please set FIREBASE_SERVICE_ACCOUNT environment variable or create a serviceAccountKey.json file in the project root.');
      }
    }
    
    // Fix private key format if needed
    if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log(`✅ Firebase Admin initialized for project: ${serviceAccount.project_id}`);
  } else {
    console.log('Firebase Admin was already initialized');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  process.exit(1);
}

const db = admin.firestore();

module.exports = { admin, db };
