const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Helper to get a fresh Firestore instance
function getFreshDb() {
  // Delete all existing apps to avoid conflicts
  while (admin.apps.length > 0) {
    admin.apps[0].delete();
  }
  const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }, `classes-handler-${Date.now()}`);
  return { db: app.firestore(), app };
}

// Get all classes
router.get('/', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const classesSnapshot = await db.collection('classes').get();
    const classes = [];
    classesSnapshot.forEach(doc => {
      classes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes', details: error.message });
  } finally {
    await app.delete();
  }
});

// TEMP: Direct Firestore test endpoint for debugging
router.get('/_firestore-test', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const testSnapshot = await db.collection('classes').limit(1).get();
    res.json({
      status: 'success',
      count: testSnapshot.size,
      docs: testSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  } finally {
    await app.delete();
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.status(200).json({
      id: classDoc.id,
      ...classDoc.data()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class', details: error.message });
  } finally {
    await app.delete();
  }
});

// Create new class
router.post('/', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const classData = req.body;
    const docRef = await db.collection('classes').add(classData);
    res.status(201).json({
      id: docRef.id,
      ...classData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class', details: error.message });
  } finally {
    await app.delete();
  }
});

// Update class
router.put('/:id', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const { id } = req.params;
    const classData = req.body;
    await db.collection('classes').doc(id).update(classData);
    res.status(200).json({
      id,
      ...classData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class', details: error.message });
  } finally {
    await app.delete();
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  const { db, app } = getFreshDb();
  try {
    const { id } = req.params;
    await db.collection('classes').doc(id).delete();
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class', details: error.message });
  } finally {
    await app.delete();
  }
});

module.exports = router;
