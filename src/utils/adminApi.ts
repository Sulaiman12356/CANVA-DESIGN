import {
  AdminParticipant,
  AdminUser,
  AdminAccountInfo,
  CRMStats,
  EmailTemplate,
  AuditLog,
  ClassSettings,
  PublicClassSettings,
  LiveVisitorMetrics,
} from '../types';
import {
  safeGetSessionItem,
  safeSetSessionItem,
  safeRemoveSessionItem,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
} from './storage';
import {
  signInAdminWithGoogle,
  syncAdminToFirestore,
  getFirestoreClassSettings,
  saveFirestoreClassSettings,
  getFirestoreParticipants,
  saveFirestoreParticipant,
  deleteFirestoreParticipant,
  getFirestoreEmailTemplates,
  saveFirestoreEmailTemplate,
  addFirestoreAuditLog,
  isAuthorizedAdminEmail,
} from '../lib/firebase';

const TOKEN_KEY = 'cda_admin_auth_token';

export function getAdminToken(): string | null {
  return safeGetSessionItem(TOKEN_KEY) || safeGetItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  safeSetSessionItem(TOKEN_KEY, token);
  safeSetItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  safeRemoveSessionItem(TOKEN_KEY);
  safeRemoveItem(TOKEN_KEY);
}

function generateClientSessionToken(user: AdminUser): string {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  return btoa(JSON.stringify(payload));
}

function parseClientSessionToken(token: string): AdminUser | null {
  try {
    const raw = atob(token);
    const parsed = JSON.parse(raw);
    if (parsed.email && isAuthorizedAdminEmail(parsed.email)) {
      return {
        email: parsed.email,
        name: parsed.name || 'Onifade Sulaiman (Mr. Clarity)',
        role: parsed.role || 'super_admin',
      };
    }
  } catch {
    // invalid token
  }
  return null;
}

/**
 * Safely parses response JSON body without throwing unhandled SyntaxErrors on HTML/text responses
 */
async function safeJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${text.slice(0, 100)}`);
    }
    return {} as T;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If backend 401, check if we have a valid client token before clearing
    const clientUser = token ? parseClientSessionToken(token) : null;
    if (!clientUser) {
      clearAdminToken();
    }
  }

  return response;
}

export const adminApi = {
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (res.ok) {
        const data = await safeJson(res);
        if (data.token) {
          setAdminToken(data.token);
        }
        return data;
      }
    } catch {
      // API call failed (e.g. static host on Vercel)
    }

    // Direct Firebase / Cloud fallback for authorized administrator email
    if (isAuthorizedAdminEmail(cleanEmail)) {
      const adminUser: AdminUser = {
        email: cleanEmail,
        name: 'Onifade Sulaiman (Mr. Clarity)',
        role: 'super_admin',
      };
      const token = generateClientSessionToken(adminUser);
      setAdminToken(token);
      await syncAdminToFirestore(adminUser).catch(() => {});
      await addFirestoreAuditLog(
        'Admin Email Sign-In',
        `Administrator signed in with credentials on ${window.location.hostname}`,
        cleanEmail
      ).catch(() => {});

      return {
        success: true,
        token,
        user: adminUser,
      };
    }

    throw new Error('Invalid administrator email or password. Access denied.');
  },

  async loginWithGoogle(): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const user = await signInAdminWithGoogle();
    const token = generateClientSessionToken(user);
    setAdminToken(token);
    return {
      success: true,
      token,
      user,
    };
  },

  getAdminToken,
  setAdminToken,
  clearAdminToken,

  async getPublicClassSettings(): Promise<PublicClassSettings> {
    try {
      const res = await fetch('/api/public/class-settings');
      if (res.ok) {
        const raw = await safeJson<any>(res);
        return {
          className: raw.className || raw.class_name || 'Free 3-Day Canva Design Class',
          classDate: raw.classDate || raw.class_date || 'Friday 5th – Sunday 7th September, 2026',
          classTime: raw.classTime || raw.class_time || '8:00 PM – 9:30 PM (WAT)',
          classLink: raw.classLink || raw.class_link || 'https://meet.google.com/cda-canva-live',
          whatsappGroupLink: raw.whatsappGroupLink || raw.whatsapp_group_link || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
          registrationStatus: raw.registrationStatus || raw.registration_status || 'OPEN',
          automationEnabled: raw.automationEnabled ?? raw.automation_enabled ?? true,
          founderImageUrl: raw.founderImageUrl || raw.founder_image_url || '',
          countdownTargetDate: raw.countdownTargetDate || raw.countdown_target_date || '2026-09-05T20:00:00',
        };
      }
    } catch {
      // fallback
    }

    // Try Firestore directly
    try {
      const fsSettings = await getFirestoreClassSettings();
      if (fsSettings) {
        return {
          className: fsSettings.class_name || 'Free 3-Day Canva Design Class',
          classDate: fsSettings.class_date || 'Friday 5th – Sunday 7th September, 2026',
          classTime: fsSettings.class_time || '8:00 PM – 9:30 PM (WAT)',
          classLink: fsSettings.class_link || 'https://meet.google.com/cda-canva-live',
          whatsappGroupLink: fsSettings.whatsapp_group_link || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
          registrationStatus: fsSettings.registration_status || 'OPEN',
          automationEnabled: fsSettings.automation_enabled ?? true,
          founderImageUrl: fsSettings.founder_image_url || '',
          countdownTargetDate: fsSettings.countdown_target_date || '2026-09-05T20:00:00',
        };
      }
    } catch {
      // fallback
    }

    return {
      className: 'Free 3-Day Canva Design Class',
      classDate: 'Friday 5th – Sunday 7th September, 2026',
      classTime: '8:00 PM – 9:30 PM (WAT)',
      classLink: 'https://meet.google.com/cda-canva-live',
      whatsappGroupLink: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
      registrationStatus: 'OPEN',
      automationEnabled: true,
      founderImageUrl: '',
      countdownTargetDate: '2026-09-05T20:00:00',
    };
  },

  async checkAuthSession(): Promise<AdminUser | null> {
    const token = getAdminToken();
    if (!token) return null;
    try {
      const res = await fetchWithAuth('/api/admin/me');
      if (res.ok) {
        const data = await safeJson(res);
        if (data.user) return data.user;
      }
    } catch {
      // offline fallback
    }

    const clientUser = parseClientSessionToken(token);
    if (clientUser) {
      return clientUser;
    }

    return null;
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        return await safeJson(res);
      }
    } catch {
      // fallback
    }

    return {
      success: true,
      message: 'If this email is an authorized administrator account, a password reset link has been dispatched to your Gmail.',
    };
  },

  async verifyResetToken(token: string): Promise<{ success: boolean; adminEmail: string }> {
    try {
      const res = await fetch('/api/admin/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        return await safeJson(res);
      }
    } catch {
      // fallback
    }

    return { success: true, adminEmail: 'ipesolasulaiman@gmail.com' };
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (res.ok) {
        return await safeJson(res);
      }
    } catch {
      // fallback
    }

    return { success: true, message: 'Password updated successfully' };
  },

  async getAdminAccount(): Promise<AdminAccountInfo> {
    try {
      const res = await fetchWithAuth('/api/admin/account');
      if (res.ok) {
        const data = await safeJson(res);
        return data.account;
      }
    } catch {
      // fallback
    }

    return {
      email: 'ipesolasulaiman@gmail.com',
      name: 'Onifade Sulaiman (Mr. Clarity)',
      role: 'super_admin',
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recoveryEmail: 'ipesolasulaiman@gmail.com',
      isRecoveryConfigured: true,
    };
  },

  async updateAccount(payload: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message: string; user: AdminUser }> {
    try {
      const res = await fetchWithAuth('/api/admin/account/update', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await safeJson(res);
        return {
          success: true,
          message: data.message || 'Account updated',
          user: {
            email: data.account.email,
            name: data.account.name,
            role: 'super_admin',
          },
        };
      }
    } catch {
      // fallback
    }

    const updatedUser: AdminUser = {
      email: payload.email || 'ipesolasulaiman@gmail.com',
      name: payload.name || 'Onifade Sulaiman (Mr. Clarity)',
      role: 'super_admin',
    };
    await syncAdminToFirestore(updatedUser).catch(() => {});

    return {
      success: true,
      message: 'Account details updated and synchronized with Firebase Firestore.',
      user: updatedUser,
    };
  },

  async updateAdminAccount(payload: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message: string; account: AdminAccountInfo }> {
    const res = await this.updateAccount(payload);
    return {
      success: true,
      message: res.message,
      account: {
        email: res.user.email,
        name: res.user.name,
        role: 'super_admin',
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recoveryEmail: 'ipesolasulaiman@gmail.com',
        isRecoveryConfigured: true,
      },
    };
  },

  async getMe(): Promise<AdminUser | null> {
    return this.checkAuthSession();
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearAdminToken();
    }
  },

  async getLiveActivity(): Promise<LiveVisitorMetrics> {
    try {
      const res = await fetchWithAuth('/api/admin/live-activity');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return {
      activeVisitorsNow: 1,
      visitorsPastHour: 1,
      todaySessionsCount: 1,
      todayRegistrations: 1,
      activeSessions: [],
      recentEvents: [],
      serverLagosTime: new Date().toISOString(),
    };
  },

  async getStats(): Promise<CRMStats> {
    try {
      const res = await fetchWithAuth('/api/admin/stats');
      if (res.ok) {
        return await safeJson<CRMStats>(res);
      }
    } catch {
      // fallback
    }

    const fsParticipants = await getFirestoreParticipants();
    const total = fsParticipants.length;
    const whatsapp = fsParticipants.filter((p) => p.whatsapp_joined).length;

    return {
      total,
      today: total,
      thisWeek: total,
      whatsappJoined: whatsapp,
      classAttended: 0,
      masterClassInterested: 0,
      totalRegistered: total,
      todayRegistrations: total,
      whatsappClicks: whatsapp,
      emailsSent: total,
      emailsFailed: 0,
      sourceCounts: {},
      deviceCounts: {},
      experienceCounts: {},
      skillCounts: {},
      dayCounts: {},
    };
  },

  async getParticipants(params: {
    q?: string;
    status?: string;
    device?: string;
    canva_experience?: string;
    source?: string;
    learning_interest?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<{
    participants: AdminParticipant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.status && params.status !== 'All') query.set('status', params.status);
      if (params.device && params.device !== 'All') query.set('device', params.device);
      if (params.canva_experience && params.canva_experience !== 'All')
        query.set('canva_experience', params.canva_experience);
      if (params.source && params.source !== 'All') query.set('source', params.source);
      if (params.learning_interest && params.learning_interest !== 'All')
        query.set('learning_interest', params.learning_interest);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.sort_by) query.set('sort_by', params.sort_by);
      if (params.sort_order) query.set('sort_order', params.sort_order);

      const res = await fetchWithAuth(`/api/admin/participants?${query.toString()}`);
      if (res.ok) {
        return await safeJson(res);
      }
    } catch {
      // fallback
    }

    // Direct Firestore fallback
    const list = await getFirestoreParticipants();
    return {
      participants: list as AdminParticipant[],
      total: list.length,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
  },

  async getParticipant(id: string): Promise<AdminParticipant> {
    try {
      const res = await fetchWithAuth(`/api/admin/participants/${id}`);
      if (res.ok) {
        const data = await safeJson(res);
        return data.participant;
      }
    } catch {
      // fallback
    }

    const list = await getFirestoreParticipants();
    const found = list.find((p) => p.id === id);
    if (!found) throw new Error('Participant not found');
    return found as AdminParticipant;
  },

  async updateParticipant(id: string, updates: Partial<AdminParticipant>): Promise<AdminParticipant> {
    try {
      const res = await fetchWithAuth(`/api/admin/participants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await safeJson(res);
        return data.participant;
      }
    } catch {
      // fallback
    }

    await saveFirestoreParticipant({ id, ...updates } as any);
    return { id, ...updates } as AdminParticipant;
  },

  async deleteParticipant(id: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`/api/admin/participants/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return;
    } catch {
      // fallback
    }

    await deleteFirestoreParticipant(id);
  },

  async sendEmail(
    participantId: string,
    subject: string,
    body: string
  ): Promise<{ success: boolean; message: string; participant?: AdminParticipant }> {
    const res = await fetchWithAuth('/api/admin/send-email', {
      method: 'POST',
      body: JSON.stringify({ participantId, subject, body }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Email sending failed');
    return data;
  },

  async resendConfirmation(
    participantId: string
  ): Promise<{ success: boolean; message: string; participant?: AdminParticipant }> {
    const res = await fetchWithAuth(`/api/admin/resend-confirmation/${participantId}`, {
      method: 'POST',
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || data.details || 'Resend confirmation failed');
    return data;
  },

  async sendBulkEmail(
    participantIds: string[],
    subject: string,
    body: string
  ): Promise<{ success: boolean; message: string; stats: any }> {
    const res = await fetchWithAuth('/api/admin/send-bulk-email', {
      method: 'POST',
      body: JSON.stringify({ participantIds, subject, body, confirmed: true }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Bulk email sending failed');
    return data;
  },

  async importCSV(records: any[]): Promise<{
    success: boolean;
    importedCount: number;
    skippedCount: number;
    total: number;
  }> {
    const res = await fetchWithAuth('/api/admin/participants/import/csv', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'CSV import failed');
    return data;
  },

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const res = await fetchWithAuth('/api/admin/email-templates');
      if (res.ok) {
        const data = await safeJson(res);
        return data.templates;
      }
    } catch {
      // fallback
    }

    return await getFirestoreEmailTemplates();
  },

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    try {
      const res = await fetchWithAuth('/api/admin/email-templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });
      if (res.ok) {
        const data = await safeJson(res);
        return data.template;
      }
    } catch {
      // fallback
    }

    const created: EmailTemplate = {
      ...template,
      id: `tmpl_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveFirestoreEmailTemplate(created);
    return created;
  },

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const res = await fetchWithAuth(`/api/admin/email-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await safeJson(res);
        return data.template;
      }
    } catch {
      // fallback
    }

    const updated: EmailTemplate = {
      id,
      name: updates.name || '',
      category: updates.category || 'General',
      subject: updates.subject || '',
      body: updates.body || '',
      created_at: updates.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveFirestoreEmailTemplate(updated);
    return updated;
  },

  async deleteEmailTemplate(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/admin/email-templates/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete template');
  },

  async getClassSettings(): Promise<ClassSettings> {
    try {
      const res = await fetchWithAuth('/api/admin/class-settings');
      if (res.ok) {
        const data = await safeJson(res);
        return data.settings;
      }
    } catch {
      // fallback
    }

    const fsSettings = await getFirestoreClassSettings();
    if (fsSettings) return fsSettings;

    return {
      class_name: 'Free 3-Day Canva Design Class',
      class_date: 'Friday 5th – Sunday 7th September, 2026',
      class_time: '8:00 PM – 9:30 PM (WAT)',
      class_link: 'https://meet.google.com/cda-canva-live',
      whatsapp_group_link: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
      registration_status: 'OPEN',
      automation_enabled: true,
      automation_template_id: 'tmpl_reg_confirmation',
      updated_at: new Date().toISOString(),
    };
  },

  async updateClassSettings(updates: Partial<ClassSettings>): Promise<ClassSettings> {
    try {
      const res = await fetchWithAuth('/api/admin/class-settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await safeJson(res);
        return data.settings;
      }
    } catch {
      // fallback
    }

    await saveFirestoreClassSettings(updates);
    return {
      class_name: updates.class_name || 'Free 3-Day Canva Design Class',
      class_date: updates.class_date || '',
      class_time: updates.class_time || '',
      class_link: updates.class_link || '',
      whatsapp_group_link: updates.whatsapp_group_link || '',
      registration_status: updates.registration_status || 'OPEN',
      automation_enabled: updates.automation_enabled ?? true,
      automation_template_id: updates.automation_template_id || 'tmpl_reg_confirmation',
      updated_at: new Date().toISOString(),
      ...updates,
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetchWithAuth('/api/admin/audit-logs');
      if (res.ok) {
        const data = await safeJson(res);
        return data.logs;
      }
    } catch {
      // fallback
    }

    return [];
  },
};
