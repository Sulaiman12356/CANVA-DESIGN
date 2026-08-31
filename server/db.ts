import fs from 'fs';
import path from 'path';

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
  admin_notes: string;
  ticket_number: string;
  created_at: string;
  updated_at: string;
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
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_TEMPLATES: EmailTemplateRecord[] = [
  {
    id: 'tmpl_reg_confirmation',
    name: '1. Registration Confirmation',
    category: 'Onboarding',
    subject: '🎉 Confirmed! Your Admission Pass & WhatsApp Class Access (Save Contact)',
    body: `Hello {{first_name}},

Congratulations! Your registration for the **Clarity Digital Academy Free 3-Day Canva Design Class** is officially confirmed!

Here are your admission details:
• **Student Name**: {{full_name}}
• **Admission Ticket**: #{{ticket_number}}
• **Class Dates**: {{class_date}}
• **Class Time**: {{class_time}}
• **Device Mode**: {{device}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL ACTION 1: SAVE MR. CLARITY'S CONTACT NUMBER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To ensure you receive daily class broadcast announcements, Canva templates, and certificate verification without message loss, please save my contact number to your phone right now:

• **Instructor Name**: Onifade Sulaiman (Mr. Clarity)
• **WhatsApp Phone Number**: +234 805 178 0169
• **1-Click Message**: https://wa.me/2348051780169?text=Hello%20Mr.%20Clarity%2C%20my%20name%20is%20{{first_name}}.%20I%20have%20saved%20your%20number%20(Ticket%20%23{{ticket_number}}).%20Please%20save%20my%20contact!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📲 CRITICAL ACTION 2: JOIN THE OFFICIAL WHATSAPP GROUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All live video lessons, homework critiques, and Canva templates will be shared inside our private cohort room. Join below immediately before the group is locked:

👉 **Click to Join Group**: {{whatsapp_link}}

Come ready to learn and practise. I look forward to mentoring you in class!

Warm regards,
**Onifade Sulaiman (Mr. Clarity)**
Founder, Clarity Digital Academy
"Learn Skills. Earn Globally."
Email: ipesolasulaiman@gmail.com | WhatsApp: +234 805 178 0169`,
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
        };
      } else {
        this.save();
      }
      this.isLoaded = true;
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
    return updated;
  }

  public deleteParticipant(id: string): boolean {
    const initialLen = this.data.participants.length;
    this.data.participants = this.data.participants.filter((p) => p.id !== id);
    const deleted = this.data.participants.length < initialLen;
    if (deleted) {
      this.save();
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
    return updated;
  }

  public deleteEmailTemplate(id: string): boolean {
    const initialLen = this.data.email_templates.length;
    this.data.email_templates = this.data.email_templates.filter((t) => t.id !== id);
    const deleted = this.data.email_templates.length < initialLen;
    if (deleted) this.save();
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
    return log;
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
    return this.data.class_settings;
  }
}

export const db = new DatabaseManager();
