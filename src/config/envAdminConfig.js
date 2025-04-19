const admin = require('firebase-admin');

// Serverless-friendly Firebase Admin initialization 
let db;

function getFirestore() {
  // Initialize only if not already initialized
  if (!db) {
    try {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
      }

      // Parse the JSON from the environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Fix the private key format by properly handling newlines
      if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      // Initialize or reuse Firebase Admin app
      const app = !admin.apps.length 
        ? admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          })
        : admin.app();
      
      // Initialize Firestore
      db = admin.firestore();
      console.log('✅ Firebase Admin initialized for serverless environment');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error);
      throw error;
    }
  }
  
  return db;
}

module.exports = { 
  admin,
  // Get a fresh instance each time
  get db() {
    return getFirestore();
  }
};
