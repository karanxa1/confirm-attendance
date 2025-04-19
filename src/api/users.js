const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Helper to get a fresh Firestore instance
function getFreshDb() {
  while (admin.apps.length > 0) {
    admin.apps[0].delete();
  }
  const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }, `users-handler-${Date.now()}`);
  return { db: app.firestore(), app };
}

// Get all users
router.get('/', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  } finally {
    await app.delete();
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      id: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  } finally {
    await app.delete();
  }
});

// Create new user
router.post('/', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const userData = req.body;
    const docRef = await db.collection('users').add(userData);
    res.status(201).json({
      id: docRef.id,
      ...userData
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  } finally {
    await app.delete();
  }
});

module.exports = router;
