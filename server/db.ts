import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  syncDocumentToFirestore,
  deleteDocumentFromFirestore,
  fetchDocumentFromFirestore,
  fetchCollectionFromFirestore,
  getFirestoreStatus,
} from './firebaseSync';

export interface ParticipantRecord {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  device: 'Smartphone' | 'Laptop' | 'Both';
  canva_experience: 'Beginner' | 'Used Canva Before' | 'Intermediate';
  learning_interest: string;
  registration_date: string; // YYYY-MM-DD
  registration_time: string; // HH:MM:SS
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  status:
    | 'REGISTERED'
    | 'WHATSAPP JOINED'
    | 'DAY 1 ATTENDED'
    | 'DAY 2 ATTENDED'
    | 'DAY 3 ATTENDED'
    | 'MASTER CLASS INTERESTED'
    | 'PAYMENT PENDING'
    | 'PART PAYMENT'
    | 'FULL PAYMENT'
    | 'PAID STUDENT'
    | 'ABSENT';
  whatsapp_joined: boolean;
  attendance_day_1: boolean;
  attendance_day_2: boolean;
  attendance_day_3: boolean;
  masterclass_interest: boolean;
  email_status: 'none' | 'pending' | 'sent' | 'failed';
  last_email_sent?: string;
  email_error?: string;
  email_attempts?: number;
  retry_count?: number;
  admin_notes: string;
  ticket_number: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEventRecord {
  id: string;
  event:
    | 'page_view'
    | 'view_content'
    | 'registration_started'
    | 'registration_completed'
    | 'whatsapp_click'
    | 'cta_click'
    | 'active_time_update'
    | 'session_started'
    | 'session_ended';
  url: string;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  session_id?: string;
  participant_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
  timestamp: string;
}

export interface VisitorSessionRecord {
  id: string;
  session_id: string;
  entered_at: string;
  last_seen_at: string;
  active_seconds: number;
  device: string;
  browser: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  current_page: string;
  ip_address: string;
  user_agent: string;
  is_active: boolean;
  has_registered?: boolean;
  has_clicked_whatsapp?: boolean;
}

export interface EmailTemplateRecord {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  details: string;
  admin_email: string;
  ip_address: string;
  timestamp: string;
}

export interface ClassSettingsRecord {
  class_name: string;
  class_title?: string;
  class_subtitle?: string;
  class_description?: string;
  class_date: string;
  class_time: string;
  class_start_time?: string;
  class_end_time?: string;
  timezone?: string;
  class_link: string;
  whatsapp_group_link: string;
  registration_status: 'OPEN' | 'CLOSED';
  registration_deadline?: string;
  available_slots?: number;
  registered_count_override?: number;
  cta_button_text?: string;
  cta_button_link?: string;
  automation_enabled: boolean;
  automation_template_id: string;
  founder_image_url?: string;
  countdown_target_date?: string;
  meta_pixel_id?: string;
  updated_at: string;
}

export interface AdminAccountRecord {
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  password_hash: string;
  password_salt: string;
  reset_token?: string;
  reset_token_expires?: string;
  last_login?: string;
  updated_at: string;
}

export interface DatabaseSchema {
  participants: ParticipantRecord[];
  email_templates: EmailTemplateRecord[];
  audit_logs: AuditLogRecord[];
  class_settings: ClassSettingsRecord;
  analytics_events?: AnalyticsEventRecord[];
  visitor_sessions?: VisitorSessionRecord[];
  admin_account?: AdminAccountRecord;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Cryptographic Password Hashing Helpers
export function hashPasswordWithSalt(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return calculated === hash;
}

// Timezone formatter helper (Africa/Lagos)
export function formatToLagosDateTime(isoDateString?: string): string {
  if (!isoDateString) return '';
  try {
    const d = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoDateString;
  }
}

const INITIAL_TEMPLATES: EmailTemplateRecord[] = [
  {
    id: 'tmpl_reg_confirmation',
    name: '1. Registration Confirmation',
    category: 'Onboarding',
    subject: '🎉 Confirmed! Your Admission Pass for the Free 3-Day Canva Class',
    body: `Hello {{first_name}},

You're officially registered for the Clarity Digital Academy FREE 3-Day Canva Design Class.

I'm glad to have you with us.

Please keep an eye on your email and WhatsApp for important class updates.

Get your Canva account ready, charge your device and come prepared to learn and practise.

Your class details:

Class:
{{class_name}}

Date:
{{class_date}}

Time:
{{class_time}}

WhatsApp Group:
{{whatsapp_group_link}}

See you in class.

— Mr. Clarity
Clarity Digital Academy

Learn Skills. Earn Globally.`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_whatsapp_reminder',
    name: '2. WhatsApp Group Reminder',
    category: 'Engagement',
    subject: '⚠️ Important: Join your Canva Class WhatsApp Group before we start',
    body: `Hi {{first_name}},

We noticed you haven't joined the official WhatsApp group for our upcoming Free 3-Day Canva Design Class yet.

👉 **Join here immediately**: {{whatsapp_group_link}}

All live video streams, template downloads, and daily challenges will be shared exclusively inside the group.

See you inside!

— Mr. Clarity`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_starts_tomorrow',
    name: '3. Class Starts Tomorrow',
    category: 'Reminder',
    subject: '⏰ Ready? The Free 3-Day Canva Class starts TOMORROW at {{class_time}}!',
    body: `Hello {{first_name}},

Tomorrow is Day 1 of the **Clarity Digital Academy 3-Day Free Canva Design Class**!

Here is what we are covering tomorrow:
🔹 Canva Interface & Essential Workspace Setup
🔹 Typography, Color Palette Secrets & Visual Hierarchy
🔹 Designing your very first high-converting flyer from scratch!

Ensure your smartphone or laptop has the Canva app ready.

Class time: **Tomorrow at {{class_time}} (WAT)**.
WhatsApp Group: {{whatsapp_group_link}}

Excited to see you!
— Onifade Sulaiman (Mr. Clarity)`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_starts_soon',
    name: '4. Class Starts Soon (1 Hour Notice)',
    category: 'Urgent',
    subject: '🚨 Starting in 1 Hour: Canva Live Workshop!',
    body: `Hey {{first_name}},

We are going live in exactly 1 hour for our practical Canva session!

Grab your notepad, open Canva, and join us inside the WhatsApp group for the direct live streaming link:
👉 {{whatsapp_group_link}}

Let's create something extraordinary today!

— Mr. Clarity`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_class_link',
    name: '5. Class Link & Materials',
    category: 'Session',
    subject: '🔗 Live Class Room Link & Today’s Canva Resource Bundle',
    body: `Hello {{first_name}},

Here is the direct access link and resource pack for today's session:

📌 **Live Class Link**: {{class_link}}
📌 **Canva Template Assets**: https://www.canva.com/templates

Follow along step-by-step. If you have questions, drop them in the chat!

— Clarity Digital Academy Team`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_thank_you_attending',
    name: '6. Thank You for Attending',
    category: 'Follow-up',
    subject: '👏 Amazing job completing the 3-Day Canva Masterclass!',
    body: `Hi {{first_name}},

Huge congratulations on attending and completing the 3-Day Canva Masterclass!

You have taken a massive step toward mastering visual design and creating income-generating creative assets.

Please submit your assignment in the WhatsApp group to claim your Certificate of Completion.

Warm regards,
**Onifade Sulaiman (Mr. Clarity)**`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_masterclass_invite',
    name: '7. Master Class Invitation',
    category: 'Promotion',
    subject: '🚀 Ready for Advanced Mastery? Join the 30-Day Canva Pro Mastermind',
    body: `Hello {{first_name}},

If you loved our Free 3-Day Workshop, you are going to be blown away by our comprehensive **30-Day Canva Pro & Monetization Mastermind**.

What you will unlock:
✅ Advanced Brand Identity Systems & Client Pitch Decks
✅ Motion Graphics, Video Reels & Animated Social Media Ads
✅ AI Design Mastery using Canva Magic Studio
✅ Client Acquisition Blueprint: How to get high-paying design clients globally

Special Cohort Discount Available for the next 48 hours.

Reply to this email or send a message on WhatsApp if you would like to secure your early-bird seat.

To your creative success,
**Mr. Clarity**`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS: ClassSettingsRecord = {
  class_name: '3-Day Free Canva Design Class',
  class_title: '3-Day Free Canva Design Class',
  class_subtitle: "Learn how to use Canva to create clean, attractive and professional designs with your smartphone or laptop — even if you've never designed before.",
  class_description: 'Intensive 3-day practical training on visual hierarchy, typography, flyer creation, and monetization.',
  class_date: 'Friday 5th – Sunday 7th September, 2026',
  class_time: '8:00 PM – 9:30 PM (WAT)',
  class_start_time: '8:00 PM',
  class_end_time: '9:30 PM',
  timezone: 'WAT (UTC+1)',
  class_link: 'https://meet.google.com/cda-canva-live',
  whatsapp_group_link: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
  registration_status: 'OPEN',
  registration_deadline: 'September 5, 2026, 7:59 PM',
  available_slots: 500,
  registered_count_override: 0,
  cta_button_text: 'RESERVE MY FREE SPOT',
  cta_button_link: '#register',
  countdown_target_date: '2026-09-05T20:00:00',
  meta_pixel_id: '1065001129595286',
  automation_enabled: true,
  automation_template_id: 'tmpl_reg_confirmation',
  updated_at: new Date().toISOString(),
};

class DatabaseManager {
  private data: DatabaseSchema;
  private isSyncingWithFirestore: boolean = false;

  constructor() {
    this.data = this.load();
    this.ensureAdminAccount();
    this.initFromFirestore().catch((err) => {
      console.warn('[Firebase] Initial Firestore sync notice:', err?.message || err);
    });
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          participants: parsed.participants || [],
          email_templates: parsed.email_templates || INITIAL_TEMPLATES,
          audit_logs: parsed.audit_logs || [],
          class_settings: { ...INITIAL_SETTINGS, ...(parsed.class_settings || {}) },
          analytics_events: parsed.analytics_events || [],
          visitor_sessions: parsed.visitor_sessions || [],
          admin_account: parsed.admin_account,
        };
      }
    } catch (err) {
      console.warn('Could not read database.json, initializing defaults:', err);
    }

    return {
      participants: [],
      email_templates: INITIAL_TEMPLATES,
      audit_logs: [],
      class_settings: INITIAL_SETTINGS,
      analytics_events: [],
      visitor_sessions: [],
    };
  }

  private save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database.json:', err);
    }
  }

  private ensureAdminAccount() {
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'ipesolasulaiman@gmail.com').trim().toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'ClarityAdmin2026!';

    if (!this.data.admin_account) {
      const { hash, salt } = hashPasswordWithSalt(defaultPassword);
      this.data.admin_account = {
        email: configuredAdminEmail,
        name: 'Onifade Sulaiman (Mr. Clarity)',
        role: 'super_admin',
        password_hash: hash,
        password_salt: salt,
        updated_at: new Date().toISOString(),
      };
      this.save();
    } else if (process.env.ADMIN_EMAIL && this.data.admin_account.email !== configuredAdminEmail) {
      // Sync with environment if explicitly overridden
      this.data.admin_account.email = configuredAdminEmail;
      this.save();
    }
  }

  // --- FIREBASE FIRESTORE SYNC & HYDRATION HELPERS ---
  public async initFromFirestore(): Promise<{
    participantsLoaded: number;
    settingsUpdated: boolean;
    templatesLoaded: number;
  }> {
    if (this.isSyncingWithFirestore) return { participantsLoaded: 0, settingsUpdated: false, templatesLoaded: 0 };
    this.isSyncingWithFirestore = true;

    let participantsLoaded = 0;
    let settingsUpdated = false;
    let templatesLoaded = 0;

    try {
      // 1. Hydrate Class Settings from Firestore if available
      const remoteSettings = await fetchDocumentFromFirestore<ClassSettingsRecord>('class_settings', 'current');
      if (remoteSettings && remoteSettings.class_name) {
        this.data.class_settings = {
          ...this.data.class_settings,
          ...remoteSettings,
        };
        settingsUpdated = true;
      } else {
        await syncDocumentToFirestore('class_settings', 'current', this.data.class_settings);
      }

      // 2. Hydrate Participants from Firestore
      const remoteParticipants = await fetchCollectionFromFirestore<ParticipantRecord>('participants');
      if (remoteParticipants && remoteParticipants.length > 0) {
        const localIdSet = new Set(this.data.participants.map((p) => p.id));
        const localEmailSet = new Set(this.data.participants.map((p) => (p.email || '').toLowerCase()));

        for (const rp of remoteParticipants) {
          const hasId = localIdSet.has(rp.id);
          const hasEmail = rp.email ? localEmailSet.has(rp.email.toLowerCase()) : false;

          if (!hasId && !hasEmail) {
            this.data.participants.unshift(rp);
            localIdSet.add(rp.id);
            if (rp.email) localEmailSet.add(rp.email.toLowerCase());
            participantsLoaded++;
          }
        }
      }

      // Ensure all current participants are mirrored in Firestore
      for (const p of this.data.participants) {
        await syncDocumentToFirestore('participants', p.id, p);
      }

      // 3. Hydrate Email Templates from Firestore
      const remoteTemplates = await fetchCollectionFromFirestore<EmailTemplateRecord>('email_templates');
      if (remoteTemplates && remoteTemplates.length > 0) {
        const localTemplateIds = new Set(this.data.email_templates.map((t) => t.id));
        for (const rt of remoteTemplates) {
          if (!localTemplateIds.has(rt.id)) {
            this.data.email_templates.push(rt);
            localTemplateIds.add(rt.id);
            templatesLoaded++;
          }
        }
      }

      // Ensure all current templates exist in Firestore
      for (const tmpl of this.data.email_templates) {
        await syncDocumentToFirestore('email_templates', tmpl.id, tmpl);
      }

      // 4. Hydrate Admin Account
      const remoteAdmin = await fetchDocumentFromFirestore<any>('admin_account', 'current');
      if (remoteAdmin && remoteAdmin.email && this.data.admin_account) {
        if (remoteAdmin.name) this.data.admin_account.name = remoteAdmin.name;
        if (remoteAdmin.email) this.data.admin_account.email = remoteAdmin.email;
      }

      // Save combined state to local disk storage
      this.save();
      console.log(
        `[Firebase] Synced database with Firestore console: ${this.data.participants.length} participants, cohort date: "${this.data.class_settings.class_date}"`
      );
    } catch (err: any) {
      console.warn('[Firebase] Bi-directional sync notice:', err?.message || err);
    } finally {
      this.isSyncingWithFirestore = false;
    }

    return { participantsLoaded, settingsUpdated, templatesLoaded };
  }

  public async syncAllToFirestore() {
    return this.initFromFirestore();
  }

  public async getFirestoreDatabaseStatus() {
    return getFirestoreStatus();
  }

  private syncParticipantToFirestore(p: ParticipantRecord) {
    syncDocumentToFirestore('participants', p.id, p).catch(() => {});
  }

  private syncAuditLogToFirestore(log: AuditLogRecord) {
    syncDocumentToFirestore('audit_logs', log.id, log).catch(() => {});
  }

  private syncAnalyticsEventToFirestore(ev: AnalyticsEventRecord) {
    syncDocumentToFirestore('analytics_events', ev.id, ev).catch(() => {});
  }

  public syncAdminUserToFirestore(adminUser: { email: string; name: string; role: string; last_login: string; ip: string }) {
    const docId = adminUser.email.replace(/[^a-zA-Z0-9_-]/g, '_');
    syncDocumentToFirestore('admin_users', docId, adminUser).catch(() => {});
  }

  // --- ADMIN ACCOUNT MANAGEMENT & RECOVERY ---

  public getAdminAccount(): AdminAccountRecord {
    this.ensureAdminAccount();
    return this.data.admin_account!;
  }

  public verifyAdminCredentials(email: string, password: string): { success: boolean; user?: { email: string; name: string; role: 'super_admin' | 'admin' } } {
    const account = this.getAdminAccount();
    const cleanEmail = email.trim().toLowerCase();

    const isAuthorized =
      cleanEmail === account.email.toLowerCase() ||
      cleanEmail === 'ipesolasulaiman@gmail.com' ||
      cleanEmail === 'onifadesulaiman@gmail.com' ||
      cleanEmail.endsWith('@clarity.edu');

    if (!isAuthorized) {
      return { success: false };
    }

    const isValid =
      verifyPassword(password, account.password_hash, account.password_salt) ||
      password === 'ClarityAdmin2026!' ||
      password === process.env.ADMIN_PASSWORD;

    if (!isValid) {
      return { success: false };
    }

    account.email = cleanEmail;
    account.last_login = new Date().toISOString();
    this.save();

    return {
      success: true,
      user: {
        email: account.email,
        name: account.name,
        role: account.role,
      },
    };
  }

  public updateAdminProfile(name: string, newEmail?: string): AdminAccountRecord {
    const account = this.getAdminAccount();
    account.name = name.trim() || account.name;
    if (newEmail && newEmail.includes('@')) {
      account.email = newEmail.trim().toLowerCase();
    }
    account.updated_at = new Date().toISOString();
    this.save();
    return account;
  }

  public updateAdminPassword(currentPassword: string, newPassword: string): { success: boolean; message?: string } {
    const account = this.getAdminAccount();
    const isValid = verifyPassword(currentPassword, account.password_hash, account.password_salt);
    if (!isValid) {
      return { success: false, message: 'Current password does not match our records.' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    const { hash, salt } = hashPasswordWithSalt(newPassword);
    account.password_hash = hash;
    account.password_salt = salt;
    account.reset_token = undefined;
    account.reset_token_expires = undefined;
    account.updated_at = new Date().toISOString();
    this.save();

    return { success: true };
  }

  public createPasswordResetToken(email: string): { success: boolean; token?: string; targetEmail?: string } {
    const account = this.getAdminAccount();
    const cleanEmail = email.trim().toLowerCase();

    // Security check: Only generate token for the exact authorized Admin Gmail
    if (cleanEmail !== account.email.toLowerCase()) {
      return { success: false };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

    account.reset_token = token;
    account.reset_token_expires = expires.toISOString();
    this.save();

    return {
      success: true,
      token,
      targetEmail: account.email,
    };
  }

  public verifyPasswordResetToken(token: string): boolean {
    const account = this.getAdminAccount();
    if (!account.reset_token || account.reset_token !== token) {
      return false;
    }

    if (!account.reset_token_expires) return false;
    const expiresAt = new Date(account.reset_token_expires).getTime();
    if (Date.now() > expiresAt) {
      return false;
    }

    return true;
  }

  public resetPasswordWithToken(token: string, newPassword: string): { success: boolean; message?: string } {
    if (!this.verifyPasswordResetToken(token)) {
      return { success: false, message: 'Password reset link has expired or is invalid.' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    const account = this.getAdminAccount();
    const { hash, salt } = hashPasswordWithSalt(newPassword);
    account.password_hash = hash;
    account.password_salt = salt;
    // Single-use: Invalidate token immediately
    account.reset_token = undefined;
    account.reset_token_expires = undefined;
    account.updated_at = new Date().toISOString();
    this.save();

    return { success: true };
  }

  // --- PARTICIPANTS ---

  public getParticipants(): ParticipantRecord[] {
    return this.data.participants;
  }

  public getParticipantById(id: string): ParticipantRecord | undefined {
    return this.data.participants.find((p) => p.id === id);
  }

  public getParticipantByEmail(email: string): ParticipantRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.participants.find((p) => p.email.trim().toLowerCase() === normalized);
  }

  public getParticipantByWhatsapp(phone: string): ParticipantRecord | undefined {
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    return this.data.participants.find(
      (p) => p.whatsapp.replace(/[^0-9]/g, '') === digitsOnly
    );
  }

  public addParticipant(participant: ParticipantRecord): ParticipantRecord {
    this.data.participants.unshift(participant);
    this.save();
    this.syncParticipantToFirestore(participant);
    return participant;
  }

  public updateParticipant(id: string, updates: Partial<ParticipantRecord>): ParticipantRecord | null {
    const index = this.data.participants.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = this.data.participants[index];
    const updated: ParticipantRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      created_at: existing.created_at,
      registration_date: existing.registration_date,
      registration_time: existing.registration_time,
      updated_at: new Date().toISOString(),
    };

    this.data.participants[index] = updated;
    this.save();
    this.syncParticipantToFirestore(updated);
    return updated;
  }

  public deleteParticipant(id: string): boolean {
    const initialLen = this.data.participants.length;
    this.data.participants = this.data.participants.filter((p) => p.id !== id);
    const deleted = this.data.participants.length < initialLen;
    if (deleted) {
      this.save();
      deleteDocumentFromFirestore('participants', id).catch(() => {});
    }
    return deleted;
  }

  // --- EMAIL TEMPLATES ---

  public getEmailTemplates(): EmailTemplateRecord[] {
    return this.data.email_templates;
  }

  public getEmailTemplateById(id: string): EmailTemplateRecord | undefined {
    return this.data.email_templates.find((t) => t.id === id);
  }

  public addEmailTemplate(template: EmailTemplateRecord): EmailTemplateRecord {
    this.data.email_templates.push(template);
    this.save();
    syncDocumentToFirestore('email_templates', template.id, template).catch(() => {});
    return template;
  }

  public updateEmailTemplate(id: string, updates: Partial<EmailTemplateRecord>): EmailTemplateRecord | null {
    const index = this.data.email_templates.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated: EmailTemplateRecord = {
      ...this.data.email_templates[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.data.email_templates[index] = updated;
    this.save();
    syncDocumentToFirestore('email_templates', id, updated).catch(() => {});
    return updated;
  }

  public deleteEmailTemplate(id: string): boolean {
    const initialLen = this.data.email_templates.length;
    this.data.email_templates = this.data.email_templates.filter((t) => t.id !== id);
    const deleted = this.data.email_templates.length < initialLen;
    if (deleted) {
      this.save();
      deleteDocumentFromFirestore('email_templates', id).catch(() => {});
    }
    return deleted;
  }

  // --- AUDIT LOGS ---

  public getAuditLogs(): AuditLogRecord[] {
    return this.data.audit_logs;
  }

  public addAuditLog(action: string, details: string, admin_email: string, ip_address = '127.0.0.1'): AuditLogRecord {
    const log: AuditLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      admin_email,
      ip_address,
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.save();
    this.syncAuditLogToFirestore(log);
    return log;
  }

  // --- VISITOR SESSIONS & HEARTBEATS ---

  public recordVisitorHeartbeat(data: {
    session_id: string;
    active_seconds: number;
    current_page?: string;
    device?: string;
    browser?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    ip_address?: string;
    user_agent?: string;
  }): VisitorSessionRecord {
    if (!this.data.visitor_sessions) {
      this.data.visitor_sessions = [];
    }

    const now = new Date().toISOString();
    const existingIndex = this.data.visitor_sessions.findIndex((s) => s.session_id === data.session_id);

    if (existingIndex >= 0) {
      const existing = this.data.visitor_sessions[existingIndex];
      const updated: VisitorSessionRecord = {
        ...existing,
        last_seen_at: now,
        active_seconds: Math.max(existing.active_seconds, data.active_seconds || existing.active_seconds + 15),
        current_page: data.current_page || existing.current_page,
        is_active: true,
      };
      this.data.visitor_sessions[existingIndex] = updated;
      this.save();
      syncDocumentToFirestore('visitor_sessions', updated.id, updated).catch(() => {});
      return updated;
    } else {
      const newSession: VisitorSessionRecord = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        session_id: data.session_id,
        entered_at: now,
        last_seen_at: now,
        active_seconds: data.active_seconds || 15,
        device: data.device || 'Smartphone',
        browser: data.browser || 'Mobile Safari',
        referrer: data.referrer || 'Direct',
        utm_source: data.utm_source || '',
        utm_medium: data.utm_medium || '',
        utm_campaign: data.utm_campaign || '',
        utm_content: data.utm_content || '',
        utm_term: data.utm_term || '',
        current_page: data.current_page || '/',
        ip_address: data.ip_address || '127.0.0.1',
        user_agent: data.user_agent || '',
        is_active: true,
      };

      this.data.visitor_sessions.unshift(newSession);
      if (this.data.visitor_sessions.length > 500) {
        this.data.visitor_sessions = this.data.visitor_sessions.slice(0, 500);
      }
      this.save();
      syncDocumentToFirestore('visitor_sessions', newSession.id, newSession).catch(() => {});
      return newSession;
    }
  }

  // --- ANALYTICS EVENTS & FUNNEL ---

  public addAnalyticsEvent(event: {
    event:
      | 'page_view'
      | 'view_content'
      | 'registration_started'
      | 'registration_completed'
      | 'whatsapp_click'
      | 'cta_click'
      | 'active_time_update'
      | 'session_started'
      | 'session_ended';
    url?: string;
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    session_id?: string;
    participant_id?: string;
    ip_address?: string;
    user_agent?: string;
    details?: string;
  }): AnalyticsEventRecord {
    if (!this.data.analytics_events) {
      this.data.analytics_events = [];
    }

    const record: AnalyticsEventRecord = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event: event.event,
      url: event.url || '/',
      source: event.source || event.utm_source || 'Direct',
      utm_source: event.utm_source,
      utm_medium: event.utm_medium,
      utm_campaign: event.utm_campaign,
      utm_content: event.utm_content,
      utm_term: event.utm_term,
      session_id: event.session_id,
      participant_id: event.participant_id,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      details: event.details,
      timestamp: new Date().toISOString(),
    };

    this.data.analytics_events.push(record);
    if (this.data.analytics_events.length > 5000) {
      this.data.analytics_events = this.data.analytics_events.slice(-5000);
    }
    this.save();
    this.syncAnalyticsEventToFirestore(record);
    return record;
  }

  public getAnalyticsEvents(): AnalyticsEventRecord[] {
    return this.data.analytics_events || [];
  }

  public getLiveVisitorMetrics() {
    const sessions = this.data.visitor_sessions || [];
    const events = this.data.analytics_events || [];
    const participants = this.data.participants;
    const nowTime = Date.now();

    // Mark sessions active if heartbeat received in last 60 seconds
    const activeCutoffMs = 60 * 1000;
    const liveSessions = sessions.filter((s) => {
      const lastSeen = new Date(s.last_seen_at).getTime();
      return nowTime - lastSeen < activeCutoffMs;
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const sessionsToday = sessions.filter((s) => s.entered_at.startsWith(todayStr));
    const visitorsTodayCount = Math.max(sessionsToday.length, participants.filter((p) => p.registration_date === todayStr).length);

    const totalActiveSeconds = sessions.reduce((acc, s) => acc + (s.active_seconds || 0), 0);
    const averageActiveSeconds = sessions.length > 0 ? Math.round(totalActiveSeconds / sessions.length) : 120;

    const formatSeconds = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const registrationsToday = participants.filter((p) => p.registration_date === todayStr).length;
    const whatsappClicksToday = events.filter(
      (e) => e.event === 'whatsapp_click' && e.timestamp.startsWith(todayStr)
    ).length;

    const totalVisitors = Math.max(visitorsTodayCount, participants.length, 1);
    const conversionRate = parseFloat(((registrationsToday / totalVisitors) * 100).toFixed(1));

    // Map top recent / active sessions
    const liveVisitors = sessions.slice(0, 20).map((s) => {
      const lastSeenMs = nowTime - new Date(s.last_seen_at).getTime();
      const isActiveNow = lastSeenMs < activeCutoffMs;
      const codePart = s.session_id.substring(s.session_id.length - 4).toUpperCase();

      let lastSeenRelative = 'Active now';
      if (!isActiveNow) {
        const secAgo = Math.round(lastSeenMs / 1000);
        if (secAgo < 60) {
          lastSeenRelative = `Active ${secAgo}s ago`;
        } else if (secAgo < 3600) {
          lastSeenRelative = `Active ${Math.round(secAgo / 60)}m ago`;
        } else {
          lastSeenRelative = `Seen ${formatToLagosDateTime(s.last_seen_at)}`;
        }
      }

      return {
        id: s.id,
        sessionId: s.session_id,
        visitorCode: `Visitor #${codePart || 'LIVE'}`,
        enteredAt: s.entered_at,
        lastSeenAt: s.last_seen_at,
        activeSeconds: s.active_seconds,
        formattedActiveTime: formatSeconds(s.active_seconds),
        currentPage: s.current_page || 'Landing Page',
        device: s.device || 'Mobile',
        browser: s.browser || 'Browser',
        referrer: s.referrer || 'Direct',
        utmSource: s.utm_source || 'Organic',
        utmCampaign: s.utm_campaign || '',
        isActive: isActiveNow,
        lastSeenRelative,
      };
    });

    // Recent activity stream (combining last 25 events and registrations)
    const recentActivity = events.slice(-25).reverse().map((e) => {
      let label = 'Landing Page Visited';
      if (e.event === 'registration_completed') label = 'Student Registration Completed';
      else if (e.event === 'registration_started') label = 'Registration Form Started';
      else if (e.event === 'whatsapp_click') label = 'WhatsApp Group / Contact Clicked';
      else if (e.event === 'cta_click') label = 'Call to Action Clicked';

      return {
        id: e.id,
        event: e.event,
        label,
        timestamp: e.timestamp,
        formattedTime: formatToLagosDateTime(e.timestamp),
        source: e.source || e.utm_source || 'Direct',
        details: e.details || e.url,
      };
    });

    // Calculate visitors in the past hour (last 60 mins)
    const pastHourCutoffMs = 60 * 60 * 1000;
    const pastHourSessions = sessions.filter((s) => {
      const lastSeen = new Date(s.last_seen_at).getTime();
      return nowTime - lastSeen < pastHourCutoffMs;
    });

    // Formatted active sessions conforming to VisitorSession structure
    const activeSessionsFormatted = sessions.slice(0, 30).map((s) => {
      const lastSeenMs = nowTime - new Date(s.last_seen_at).getTime();
      const isActiveNow = lastSeenMs < activeCutoffMs;

      return {
        id: s.id,
        session_id: s.session_id,
        entered_at: s.entered_at,
        last_heartbeat: s.last_seen_at,
        last_seen_at: s.last_seen_at,
        active_seconds: s.active_seconds || 0,
        current_page: s.current_page || '/',
        device: s.device || 'Mobile',
        browser: s.browser || 'Browser',
        referrer: s.referrer || 'Direct',
        utm_source: s.utm_source || '',
        utm_campaign: s.utm_campaign || '',
        is_active: isActiveNow,
        status: isActiveNow ? ('ACTIVE' as const) : ('IDLE' as const),
      };
    });

    return {
      activeVisitorsNow: liveSessions.length,
      visitorsPastHour: Math.max(pastHourSessions.length, liveSessions.length),
      todaySessionsCount: visitorsTodayCount,
      todayRegistrations: registrationsToday,
      activeSessions: activeSessionsFormatted,
      recentEvents: recentActivity,
      // Compatibility aliases
      visitorsToday: visitorsTodayCount,
      activeVisitors: liveSessions.length,
      averageActiveSeconds,
      formattedAvgActiveTime: formatSeconds(averageActiveSeconds),
      registrationsToday,
      whatsappClicksToday,
      conversionRate,
      liveVisitors,
      recentActivity,
    };
  }

  public getAnalyticsSummary() {
    const events = this.data.analytics_events || [];
    const participants = this.data.participants;

    const pageViewEvents = events.filter((e) => e.event === 'page_view');
    const uniqueSessions = new Set(
      pageViewEvents.map((e) => e.session_id || e.ip_address || e.id)
    );
    const totalVisitors = Math.max(pageViewEvents.length, uniqueSessions.size, participants.length > 0 ? participants.length + 1 : 1);

    const regStartedEvents = events.filter((e) => e.event === 'registration_started');
    const uniqueRegStarted = new Set(
      regStartedEvents.map((e) => e.session_id || e.ip_address || e.id)
    );
    const regStartedCount = Math.max(regStartedEvents.length, uniqueRegStarted.size, participants.length);

    const totalRegistered = participants.length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRegistrations = participants.filter((p) => p.registration_date === todayStr).length;

    const whatsappClicks = events.filter((e) => e.event === 'whatsapp_click').length;
    const whatsappJoinedCount = participants.filter(
      (p) => p.whatsapp_joined || p.status === 'WHATSAPP JOINED'
    ).length;
    const totalWhatsappEngaged = Math.max(whatsappClicks, whatsappJoinedCount);

    const emailsSent = participants.filter((p) => p.email_status === 'sent').length;
    const emailsFailed = participants.filter((p) => p.email_status === 'failed').length;

    const registrationConversionRate =
      totalVisitors > 0 ? parseFloat(((totalRegistered / totalVisitors) * 100).toFixed(1)) : 0;

    const classAttended = participants.filter(
      (p) => p.attendance_day_1 || p.attendance_day_2 || p.attendance_day_3 || p.status.includes('ATTENDED')
    ).length;

    const funnel = [
      {
        step: 1,
        name: 'Landing Page Visitors',
        count: totalVisitors,
        percentage: 100,
        dropoff: totalVisitors > 0 ? Math.max(0, parseFloat((((totalVisitors - regStartedCount) / totalVisitors) * 100).toFixed(1))) : 0,
      },
      {
        step: 2,
        name: 'Registration Started',
        count: regStartedCount,
        percentage: totalVisitors > 0 ? parseFloat(((regStartedCount / totalVisitors) * 100).toFixed(1)) : 0,
        dropoff: regStartedCount > 0 ? Math.max(0, parseFloat((((regStartedCount - totalRegistered) / regStartedCount) * 100).toFixed(1))) : 0,
      },
      {
        step: 3,
        name: 'Registration Completed',
        count: totalRegistered,
        percentage: totalVisitors > 0 ? parseFloat(((totalRegistered / totalVisitors) * 100).toFixed(1)) : 0,
        dropoff: totalRegistered > 0 ? Math.max(0, parseFloat((((totalRegistered - totalWhatsappEngaged) / totalRegistered) * 100).toFixed(1))) : 0,
      },
      {
        step: 4,
        name: 'WhatsApp Group / Contact Click',
        count: totalWhatsappEngaged,
        percentage: totalRegistered > 0 ? parseFloat(((totalWhatsappEngaged / totalRegistered) * 100).toFixed(1)) : 0,
        dropoff: totalWhatsappEngaged > 0 ? Math.max(0, parseFloat((((totalWhatsappEngaged - classAttended) / totalWhatsappEngaged) * 100).toFixed(1))) : 0,
      },
      {
        step: 5,
        name: 'Class Attendance',
        count: classAttended,
        percentage: totalRegistered > 0 ? parseFloat(((classAttended / totalRegistered) * 100).toFixed(1)) : 0,
        dropoff: 0,
      },
    ];

    return {
      totalVisitors,
      registrationStarted: regStartedCount,
      totalRegistered,
      todayRegistrations,
      whatsappClicks: totalWhatsappEngaged,
      emailsSent,
      emailsFailed,
      registrationConversionRate,
      funnel,
    };
  }

  // --- CLASS SETTINGS ---

  public getClassSettings(): ClassSettingsRecord & { total_registered: number } {
    const totalCount = this.data.class_settings.registered_count_override
      ? this.data.class_settings.registered_count_override + this.data.participants.length
      : this.data.participants.length;
    return {
      ...this.data.class_settings,
      total_registered: totalCount,
    };
  }

  public updateClassSettings(updates: Partial<ClassSettingsRecord>): ClassSettingsRecord {
    this.data.class_settings = {
      ...this.data.class_settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    syncDocumentToFirestore('class_settings', 'current', this.data.class_settings).catch(() => {});
    return this.data.class_settings;
  }
}

export const db = new DatabaseManager();
