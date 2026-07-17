import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import firebaseConfig from './firebase-applet-config.json';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase Admin
if (getApps().length === 0) {
  try {
    // Try to initialize without explicit config to use environment defaults (ADC)
    initializeApp();
    console.log('Firebase Admin initialized with default credentials');
  } catch (error) {
    console.log('Default initialization failed, using explicit projectId');
    initializeApp({
      projectId: firebaseConfig.projectId
    });
  }
}

// Ensure the correct database is accessed.
// If firestoreDatabaseId is '(default)' or empty, we use the default database.
const dbId = (firebaseConfig.firestoreDatabaseId === '(default)' || !firebaseConfig.firestoreDatabaseId) 
  ? undefined 
  : firebaseConfig.firestoreDatabaseId;

const db = getFirestore(dbId);
console.log('Firestore connected to database:', dbId || '(default)');

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === '1@2#3$4_5&') {
    res.json({ success: true, token: 'fake-admin-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Admin Data Fetch
app.get('/api/admin/contributions', async (req, res) => {
  const token = req.headers.authorization;
  if (!token?.startsWith('fake-admin-token-')) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const snapshot = await db.collection('contributions').orderBy('createdAt', 'desc').get();
    const contributions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(contributions);
  } catch (error: any) {
    console.error('Error fetching contributions:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    res.status(500).json({ success: false, message: 'Failed to fetch data', error: error.message });
  }
});

// Admin Update Record
app.put('/api/admin/contributions/:id', async (req, res) => {
  const token = req.headers.authorization;
  if (!token?.startsWith('fake-admin-token-')) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { id } = req.params;
  const updateData = req.body;

  try {
    await db.collection('contributions').doc(id).update(updateData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update record' });
  }
});

// Admin Delete Record
app.delete('/api/admin/contributions/:id', async (req, res) => {
  const token = req.headers.authorization;
  if (!token?.startsWith('fake-admin-token-')) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    await db.collection('contributions').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
