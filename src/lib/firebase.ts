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
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Initialize Firebase Client App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Validate Connection to Firestore on startup
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

// Initialize connection test silently
testFirestoreConnection().catch(() => {});

// Authorized Admin Email List (Defaults to primary admin)
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

// 6. Google Sign-In helper for Admin Portal
export async function signInAdminWithGoogle(): Promise<AdminUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = user.email?.toLowerCase() || '';

    if (!isAuthorizedAdminEmail(userEmail)) {
      await signOut(auth);
      throw new Error(
        `Access Denied: The Google Account (${userEmail}) is not authorized as an Administrator. Please use ipesolasulaiman@gmail.com.`
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
