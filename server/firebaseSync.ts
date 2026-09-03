import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  Firestore,
} from 'firebase/firestore';
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
  console.warn('[Firebase] Could not read firebase-applet-config.json:', e);
}

let dbInstance: Firestore | null = null;
try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  dbInstance =
    firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  console.log(`[Firebase] Server connected to Firestore console (Project: ${firebaseConfig.projectId || 'canva-design-b427b'}, DB: ${firebaseConfig.firestoreDatabaseId || '(default)'})`);
} catch (err: any) {
  console.warn('[Firebase] Firestore client initialization warning in server:', err?.message || err);
}

export async function syncDocumentToFirestore(collectionName: string, docId: string, data: any): Promise<boolean> {
  if (!dbInstance) {
    console.warn(`[Firebase] Cannot sync to ${collectionName}/${docId}: Firestore dbInstance not ready`);
    return false;
  }
  try {
    const docRef = doc(dbInstance, collectionName, docId);
    // Sanitize undefined fields which Firestore does not accept
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (err: any) {
    console.warn(`[Firebase] Sync notice for ${collectionName}/${docId}:`, err?.message || err);
    return false;
  }
}

export async function deleteDocumentFromFirestore(collectionName: string, docId: string): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    const docRef = doc(dbInstance, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.warn(`[Firebase] Delete notice for ${collectionName}/${docId}:`, err?.message || err);
    return false;
  }
}

export async function fetchDocumentFromFirestore<T = any>(collectionName: string, docId: string): Promise<T | null> {
  if (!dbInstance) return null;
  try {
    const docRef = doc(dbInstance, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (err: any) {
    console.warn(`[Firebase] Fetch notice for ${collectionName}/${docId}:`, err?.message || err);
    return null;
  }
}

export async function fetchCollectionFromFirestore<T = any>(collectionName: string): Promise<T[]> {
  if (!dbInstance) return [];
  try {
    const colRef = collection(dbInstance, collectionName);
    const snap = await getDocs(colRef);
    const results: T[] = [];
    snap.forEach((d) => {
      results.push(d.data() as T);
    });
    return results;
  } catch (err: any) {
    console.warn(`[Firebase] Fetch collection notice for ${collectionName}:`, err?.message || err);
    return [];
  }
}

export async function getFirestoreStatus() {
  const isAvailable = Boolean(dbInstance);
  let liveCollections: Record<string, number> = {};
  let pingSuccessful = false;

  if (dbInstance) {
    try {
      const collectionsToCheck = ['participants', 'class_settings', 'email_templates', 'admin_account', 'audit_logs'];
      for (const col of collectionsToCheck) {
        const snap = await getDocs(collection(dbInstance, col));
        liveCollections[col] = snap.size;
      }
      pingSuccessful = true;
    } catch (e: any) {
      console.warn('[Firebase] Status check notice:', e?.message || e);
    }
  }

  return {
    connected: pingSuccessful,
    isInitialized: isAvailable,
    projectId: firebaseConfig.projectId || 'canva-design-b427b',
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    appId: firebaseConfig.appId || '',
    authDomain: firebaseConfig.authDomain || '',
    storageBucket: firebaseConfig.storageBucket || '',
    collections: liveCollections,
    consoleUrl: `https://console.firebase.google.com/project/${firebaseConfig.projectId || 'canva-design-b427b'}/firestore`,
    checkedAt: new Date().toISOString(),
  };
}

export const firestoreClientDb = dbInstance;
export const firebaseProjectConfig = firebaseConfig;
