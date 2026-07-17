import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import firebaseConfig from './firebase-applet-config.json';

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Firebase Admin
if (getApps().length === 0) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
      const config = JSON.parse(serviceAccount);
      initializeApp({
        credential: cert(config),
        projectId: firebaseConfig.projectId
      });
      console.log('Firebase Admin initialized with service account from env');
    } else {
      // Try default initialization
      initializeApp();
      console.log('Firebase Admin initialized with default credentials');
    }
  } catch (error) {
    console.log('Fallback initialization using explicit projectId');
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
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch data', 
      error: error.message,
      code: error.code,
      details: error.details
    });
  }
});

// Admin Create Record
app.post('/api/admin/contributions', async (req, res) => {
  const token = req.headers.authorization;
  if (!token?.startsWith('fake-admin-token-')) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const data = req.body;
  try {
    const docRef = await db.collection('contributions').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    res.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error('Error creating contribution:', error);
    res.status(500).json({ success: false, message: 'Failed to create record', error: error.message });
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
    await db.collection('contributions').doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating contribution:', error);
    res.status(500).json({ success: false, message: 'Failed to update record', error: error.message });
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
