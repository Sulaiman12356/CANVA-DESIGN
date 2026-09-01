import fs from 'fs';
import path from 'path';
import { adminDb } from './firebaseAdmin';

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
  event: 'page_view' | 'view_content' | 'registration_started' | 'registration_completed' | 'whatsapp_click';
  url: string;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
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
  class_date: string;
  class_time: string;
  class_link: string;
  whatsapp_group_link: string;
  registration_status: 'OPEN' | 'CLOSED';
  automation_enabled: boolean;
  automation_template_id: string;
  updated_at: string;
}

export interface DatabaseSchema {
  participants: ParticipantRecord[];
  email_templates: EmailTemplateRecord[];
  audit_logs: AuditLogRecord[];
  class_settings: ClassSettingsRecord;
  analytics_events?: AnalyticsEventRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

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

👉 **Join here immediately**: https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y

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
    subject: '⏰ Ready? The Free 3-Day Canva Class starts TOMORROW at 8:00 PM!',
    body: `Hello {{first_name}},

Tomorrow is Day 1 of the **Clarity Digital Academy 3-Day Free Canva Design Class**!

Here is what we are covering tomorrow:
🔹 Canva Interface & Essential Workspace Setup
🔹 Typography, Color Palette Secrets & Visual Hierarchy
🔹 Designing your very first high-converting flyer from scratch!

Ensure your smartphone or laptop has the Canva app ready.

Class time: **Tomorrow at 8:00 PM (WAT)**.
WhatsApp Group: https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y

Excited to see you!
— Onifade Sulaiman`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_starts_soon',
    name: '4. Class Starts Soon (1 Hour Notice)',
    category: 'Urgent',
    subject: '🚨 Starting in 1 Hour: Day {{day}} Canva Live Workshop!',
    body: `Hey {{first_name}},

We are going live in exactly 1 hour for our practical Canva session!

Grab your notepad, open Canva, and join us inside the WhatsApp group for the direct live streaming link:
👉 https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y

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

📌 **Live Class Link**: https://meet.google.com/cda-canva-live
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

Please submit your Day 3 assignment in the group to claim your Certificate of Completion.

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
    subject: '🚀 Invitation: Join the Clarity Global Design & Monetization Mentorship',
    body: `Hello {{first_name}},

Now that you know the foundations of Canva design, are you ready to monetize your skills globally and attract international clients?

We are opening 25 exclusive seats for the **Clarity Advanced Design & Freelancing Mentorship Program**.

In this 6-week intensive mentorship, you will learn:
✅ Advanced Brand Identity & Packaging Design
✅ Portfolio Building & International Upwork/Fiverr Client Acquisition
✅ AI-Powered Design Systems & Automation
✅ 1-on-1 Portfolio Reviews with Mr. Clarity

Click below to secure your early-bird seat:
👉 https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y?text=InterestedInMasterclass

To your global success,
**Mr. Clarity**`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tmpl_general_announcement',
    name: '8. General Announcement',
    category: 'Broadcast',
    subject: '📢 Important Update from Clarity Digital Academy',
    body: `Hello {{first_name}},

We have an important announcement regarding our training schedule and new student resources.

Please check the official WhatsApp group for all details and downloadable files:
👉 https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y

Thank you for being part of Clarity Digital Academy!

"Learn Skills. Earn Globally."`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS: ClassSettingsRecord = {
  class_name: 'Free 3-Day Canva Design Class',
  class_date: 'March 20th - 22nd, 2026',
  class_time: '8:00 PM (WAT)',
  class_link: 'https://meet.google.com/cda-canva-live',
  whatsapp_group_link: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
  registration_status: 'OPEN',
  automation_enabled: true,
  automation_template_id: 'tmpl_reg_confirmation',
  updated_at: new Date().toISOString(),
};

class DatabaseManager {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = {
      participants: [],
      email_templates: INITIAL_TEMPLATES,
      audit_logs: [],
      class_settings: INITIAL_SETTINGS,
      analytics_events: [],
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          participants: parsed.participants || [],
          email_templates: parsed.email_templates?.length ? parsed.email_templates : INITIAL_TEMPLATES,
          audit_logs: parsed.audit_logs || [],
          class_settings: { ...INITIAL_SETTINGS, ...(parsed.class_settings || {}) },
          analytics_events: parsed.analytics_events || [],
        };
      } else {
        this.save();
      }
      this.isLoaded = true;

      // Asynchronously sync initial state with Firebase Firestore
      this.syncAllToFirestore().catch((err) => {
        console.warn('Initial Firestore background sync note:', err?.message || err);
      });
    } catch (err) {
      console.error('Error loading database file:', err);
      this.save();
      this.isLoaded = true;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- FIREBASE FIRESTORE SYNC HELPERS ---
  public async syncAllToFirestore() {
    if (!adminDb) return;
    try {
      // Sync class settings
      await adminDb.collection('class_settings').doc('current').set(this.data.class_settings, { merge: true });

      // Sync email templates
      for (const tmpl of this.data.email_templates) {
        await adminDb.collection('email_templates').doc(tmpl.id).set(tmpl, { merge: true });
      }
    } catch (err: any) {
      console.warn('Firestore bulk sync note:', err.message);
    }
  }

  private syncParticipantToFirestore(p: ParticipantRecord) {
    if (!adminDb) return;
    adminDb
      .collection('participants')
      .doc(p.id)
      .set(p, { merge: true })
      .catch((err) => console.warn('Firestore participant sync error:', err.message));
  }

  private syncAuditLogToFirestore(log: AuditLogRecord) {
    if (!adminDb) return;
    adminDb
      .collection('audit_logs')
      .doc(log.id)
      .set(log, { merge: true })
      .catch((err) => console.warn('Firestore audit log sync error:', err.message));
  }

  private syncAnalyticsEventToFirestore(ev: AnalyticsEventRecord) {
    if (!adminDb) return;
    adminDb
      .collection('analytics_events')
      .doc(ev.id)
      .set(ev, { merge: true })
      .catch((err) => console.warn('Firestore analytics event sync error:', err.message));
  }

  public syncAdminUserToFirestore(adminUser: { email: string; name: string; role: string; last_login: string; ip: string }) {
    if (!adminDb) return;
    const docId = adminUser.email.replace(/[^a-zA-Z0-9_-]/g, '_');
    adminDb
      .collection('admin_users')
      .doc(docId)
      .set(adminUser, { merge: true })
      .catch((err) => console.warn('Firestore admin_user sync error:', err.message));
  }

  // --- PARTICIPANTS ---

  public getParticipants(): ParticipantRecord[] {
    return [...this.data.participants];
  }

  public getParticipantById(id: string): ParticipantRecord | undefined {
    return this.data.participants.find((p) => p.id === id);
  }

  public findParticipantByEmail(email: string): ParticipantRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.participants.find((p) => p.email.trim().toLowerCase() === normalized);
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
      if (adminDb) {
        adminDb.collection('participants').doc(id).delete().catch((err) => console.warn('Firestore delete error:', err.message));
      }
    }
    return deleted;
  }

  // --- EMAIL TEMPLATES ---

  public getEmailTemplates(): EmailTemplateRecord[] {
    return [...this.data.email_templates];
  }

  public getTemplateById(id: string): EmailTemplateRecord | undefined {
    return this.data.email_templates.find((t) => t.id === id);
  }

  public addEmailTemplate(template: EmailTemplateRecord): EmailTemplateRecord {
    this.data.email_templates.push(template);
    this.save();
    if (adminDb) {
      adminDb.collection('email_templates').doc(template.id).set(template, { merge: true }).catch(() => {});
    }
    return template;
  }

  public updateEmailTemplate(id: string, updates: Partial<EmailTemplateRecord>): EmailTemplateRecord | null {
    const index = this.data.email_templates.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.email_templates[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.data.email_templates[index] = updated;
    this.save();
    if (adminDb) {
      adminDb.collection('email_templates').doc(id).set(updated, { merge: true }).catch(() => {});
    }
    return updated;
  }

  public deleteEmailTemplate(id: string): boolean {
    const initialLen = this.data.email_templates.length;
    this.data.email_templates = this.data.email_templates.filter((t) => t.id !== id);
    const deleted = this.data.email_templates.length < initialLen;
    if (deleted) {
      this.save();
      if (adminDb) {
        adminDb.collection('email_templates').doc(id).delete().catch(() => {});
      }
    }
    return deleted;
  }

  // --- AUDIT LOGS ---

  public getAuditLogs(limit = 100): AuditLogRecord[] {
    return this.data.audit_logs.slice(0, limit);
  }

  public addAuditLog(action: string, details: string, admin_email = 'ipesolasulaiman@gmail.com', ip_address = '127.0.0.1') {
    const log: AuditLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      admin_email,
      ip_address,
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    // keep maximum 500 audit logs
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.save();
    this.syncAuditLogToFirestore(log);
    return log;
  }

  // --- ANALYTICS EVENTS & FUNNEL ---

  public addAnalyticsEvent(event: {
    event: 'page_view' | 'view_content' | 'registration_started' | 'registration_completed' | 'whatsapp_click';
    url?: string;
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
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
      session_id: event.session_id,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
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

    // Conversion Funnel: Visitors -> Reg Started -> Reg Completed -> WhatsApp Click -> Class Attendance
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

  public getClassSettings(): ClassSettingsRecord {
    return { ...this.data.class_settings };
  }

  public updateClassSettings(updates: Partial<ClassSettingsRecord>): ClassSettingsRecord {
    this.data.class_settings = {
      ...this.data.class_settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    if (adminDb) {
      adminDb.collection('class_settings').doc('current').set(this.data.class_settings, { merge: true }).catch(() => {});
    }
    return this.data.class_settings;
  }
}

export const db = new DatabaseManager();
