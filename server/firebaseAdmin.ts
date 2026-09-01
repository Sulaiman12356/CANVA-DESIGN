import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
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

const projectId = firebaseConfig.projectId || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0350081011';
const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId || 'ai-studio-3dayfreecanvades-da13a5e2-bb2f-43b9-8099-9b71e19b366e';

let app: App | null = null;
try {
  if (getApps().length === 0) {
    app = initializeApp({
      projectId: projectId,
    });
  } else {
    app = getApp();
  }
} catch (err) {
  console.error('Firebase admin initialization notice:', err);
}

// Export Firestore instance
let firestoreAdmin: Firestore | null = null;
try {
  if (app) {
    if (firestoreDatabaseId) {
      firestoreAdmin = getFirestore(app, firestoreDatabaseId);
    } else {
      firestoreAdmin = getFirestore(app);
    }
  }
} catch (err) {
  console.warn('Firestore Admin init warning:', err);
}

export const adminDb = firestoreAdmin;
export { app as firebaseAdminApp };
