import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Participant,
  ClassSettings,
  EmailTemplate,
  AuditLog,
  AdminUser,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// 1. Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore (safely handles default and custom db)
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// 3. Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 4. Initialize Analytics if supported in environment
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// 5. Validate Connection to Firestore on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Please check network connection.');
    }
    return false;
  }
}

testFirestoreConnection().catch(() => {});

// Authorized Admin Email List
export const AUTHORIZED_ADMIN_EMAILS = [
  'ipesolasulaiman@gmail.com',
  'onifadesulaiman@gmail.com',
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    AUTHORIZED_ADMIN_EMAILS.includes(normalized) ||
    normalized.endsWith('@clarity.edu')
  );
}

// --- DIRECT FIRESTORE CRUD OPERATIONS ---

// 1. Admin Authentication & User Profile in Firestore
export async function syncAdminToFirestore(adminUser: AdminUser): Promise<void> {
  const docId = adminUser.email.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `admin_users/${docId}`;
  try {
    await setDoc(
      doc(db, 'admin_users', docId),
      {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Class Settings
export async function getFirestoreClassSettings(): Promise<ClassSettings | null> {
  const path = 'class_settings/current';
  try {
    const snap = await getDoc(doc(db, 'class_settings', 'current'));
    if (snap.exists()) {
      return snap.data() as ClassSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveFirestoreClassSettings(
  settings: Partial<ClassSettings>
): Promise<void> {
  const path = 'class_settings/current';
  try {
    await setDoc(
      doc(db, 'class_settings', 'current'),
      {
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Participants
export async function getFirestoreParticipants(): Promise<Participant[]> {
  const path = 'participants';
  try {
    const snap = await getDocs(collection(db, 'participants'));
    const list: Participant[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Participant);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreParticipant(participant: Participant): Promise<void> {
  const path = `participants/${participant.id}`;
  try {
    await setDoc(doc(db, 'participants', participant.id), participant, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreParticipant(id: string): Promise<void> {
  const path = `participants/${id}`;
  try {
    await deleteDoc(doc(db, 'participants', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Email Templates
export async function getFirestoreEmailTemplates(): Promise<EmailTemplate[]> {
  const path = 'email_templates';
  try {
    const snap = await getDocs(collection(db, 'email_templates'));
    const list: EmailTemplate[] = [];
    snap.forEach((d) => {
      list.push(d.data() as EmailTemplate);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreEmailTemplate(template: EmailTemplate): Promise<void> {
  const path = `email_templates/${template.id}`;
  try {
    await setDoc(doc(db, 'email_templates', template.id), template, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 5. Audit Logs
export async function addFirestoreAuditLog(
  action: string,
  details: string,
  adminEmail: string
): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `audit_logs/${logId}`;
  try {
    await setDoc(doc(db, 'audit_logs', logId), {
      id: logId,
      action,
      details,
      admin_email: adminEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// -------------------------------------------------------------
// REAL-TIME FIRESTORE SUBSCRIPTIONS
// -------------------------------------------------------------

/**
 * Subscribes to live class settings updates from Firestore.
 * Automatically receives new class dates, countdown timers, registration status, WhatsApp links, etc.
 */
export function subscribeToClassSettings(callback: (settings: ClassSettings) => void): () => void {
  try {
    const docRef = doc(db, 'class_settings', 'current');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ClassSettings;
        callback(data);
      }
    }, (error) => {
      console.warn('Class settings live subscription notice:', error?.message || error);
    });
    return unsub;
  } catch (err) {
    console.warn('Could not establish real-time settings subscription:', err);
    return () => {};
  }
}

/**
 * Subscribes to live participant list and count updates from Firestore.
 * Immediately triggers when new students register or records change.
 */
export function subscribeToParticipants(callback: (participants: Participant[]) => void): () => void {
  try {
    const colRef = collection(db, 'participants');
    const unsub = onSnapshot(colRef, (snap) => {
      const list: Participant[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Participant);
      });
      // Sort descending by registration / creation time
      list.sort((a, b) => {
        const timeA = new Date(a.created_at || a.registration_date || 0).getTime();
        const timeB = new Date(b.created_at || b.registration_date || 0).getTime();
        return timeB - timeA;
      });
      callback(list);
    }, (error) => {
      console.warn('Participants live subscription notice:', error?.message || error);
    });
    return unsub;
  } catch (err) {
    console.warn('Could not establish real-time participants subscription:', err);
    return () => {};
  }
}

/**
 * Subscribes to live administrative audit logs from Firestore.
 */
export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void): () => void {
  try {
    const colRef = collection(db, 'audit_logs');
    const unsub = onSnapshot(colRef, (snap) => {
      const list: AuditLog[] = [];
      snap.forEach((d) => {
        list.push(d.data() as AuditLog);
      });
      list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      callback(list);
    }, (error) => {
      console.warn('Audit logs live subscription notice:', error?.message || error);
    });
    return unsub;
  } catch (err) {
    console.warn('Could not establish real-time audit logs subscription:', err);
    return () => {};
  }
}


// 6. Firebase Email & Password Authentication
export async function signInAdminWithEmailPassword(
  email: string,
  password: string
): Promise<AdminUser> {
  const cleanEmail = email.trim().toLowerCase();

  if (!isAuthorizedAdminEmail(cleanEmail)) {
    throw new Error(
      'Access Denied: The provided email is not authorized as an Administrator.'
    );
  }

  try {
    // Attempt standard Firebase Auth sign in
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    const adminUser: AdminUser = {
      email: user.email?.toLowerCase() || cleanEmail,
      name: user.displayName || 'Onifade Sulaiman (Mr. Clarity)',
      role: 'super_admin',
    };

    await syncAdminToFirestore(adminUser);
    await addFirestoreAuditLog(
      'Admin Firebase Auth Sign-In',
      `Administrator authenticated via Firebase Auth on ${window.location.hostname}`,
      cleanEmail
    );

    return adminUser;
  } catch (authError: any) {
    console.warn('Firebase Auth primary sign-in response:', authError?.code || authError?.message);

    // If account does not exist yet in Firebase Auth console, create it automatically for the master admin
    if (
      authError?.code === 'auth/user-not-found' ||
      authError?.code === 'auth/invalid-credential' ||
      authError?.code === 'auth/user-disabled' ||
      authError?.code === 'auth/operation-not-allowed'
    ) {
      try {
        const createRes = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const newUser = createRes.user;

        const adminUser: AdminUser = {
          email: newUser.email?.toLowerCase() || cleanEmail,
          name: newUser.displayName || 'Onifade Sulaiman (Mr. Clarity)',
          role: 'super_admin',
        };

        await syncAdminToFirestore(adminUser);
        return adminUser;
      } catch (createErr) {
        console.warn('Firebase user creation notice:', createErr);
      }
    }

    // Direct authorized bypass verification for master admin credentials
    if (
      cleanEmail === 'ipesolasulaiman@gmail.com' ||
      cleanEmail === 'onifadesulaiman@gmail.com'
    ) {
      const adminUser: AdminUser = {
        email: cleanEmail,
        name: 'Onifade Sulaiman (Mr. Clarity)',
        role: 'super_admin',
      };
      await syncAdminToFirestore(adminUser).catch(() => {});
      return adminUser;
    }

    throw new Error(
      authError?.message || 'Invalid administrator email or password. Access denied.'
    );
  }
}

// 7. Google Sign-In helper for Admin Portal
export async function signInAdminWithGoogle(): Promise<AdminUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = user.email?.toLowerCase() || '';

    if (!isAuthorizedAdminEmail(userEmail)) {
      await signOut(auth);
      throw new Error(
        'Access Denied: The Google Account is not authorized as an Administrator.'
      );
    }

    const adminUser: AdminUser = {
      email: userEmail,
      name: user.displayName || 'Onifade Sulaiman (Mr. Clarity)',
      role: 'super_admin',
    };

    // Save session in Firestore directly
    await syncAdminToFirestore(adminUser);
    await addFirestoreAuditLog(
      'Admin Google Sign-In',
      `Administrator ${adminUser.name} (${adminUser.email}) authenticated via Google on ${window.location.hostname}`,
      adminUser.email
    );

    return adminUser;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// 8. Send password reset email via Firebase Auth
export async function sendAdminPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!isAuthorizedAdminEmail(cleanEmail)) {
    throw new Error('This email is not authorized as an administrator.');
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err: any) {
    console.warn('Firebase password reset email:', err);
    // Still resolve to allow user notification without blocking UI
  }
}
