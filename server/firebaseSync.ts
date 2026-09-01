import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import path from 'path';
import fs from 'fs';

// Read config for project ID and database
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

let dbInstance: Firestore | null = null;
try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
} catch (err: any) {
  console.warn('Firestore client initialization in server:', err?.message || err);
}

export async function syncDocumentToFirestore(collectionName: string, docId: string, data: any) {
  if (!dbInstance) return;
  try {
    const docRef = doc(dbInstance, collectionName, docId);
    // Sanitize undefined fields which Firestore does not accept
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err: any) {
    // Gracefully handle any permission or connection notice without breaking execution
    // Do not spam console if permissions are updating
  }
}

export async function deleteDocumentFromFirestore(collectionName: string, docId: string) {
  if (!dbInstance) return;
  try {
    const docRef = doc(dbInstance, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err: any) {
    // Gracefully ignore delete errors
  }
}

export const firestoreClientDb = dbInstance;
