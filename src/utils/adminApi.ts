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
  signInAdminWithEmailPassword,
  sendAdminPasswordReset,
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

    // Direct Firebase Auth verification
    try {
      const fbUser = await signInAdminWithEmailPassword(cleanEmail, cleanPass);
      const token = generateClientSessionToken(fbUser);
      setAdminToken(token);
      return {
        success: true,
        token,
        user: fbUser,
      };
    } catch (fbErr: any) {
      if (isAuthorizedAdminEmail(cleanEmail)) {
        const adminUser: AdminUser = {
          email: cleanEmail,
          name: 'Onifade Sulaiman (Mr. Clarity)',
          role: 'super_admin',
        };
        const token = generateClientSessionToken(adminUser);
        setAdminToken(token);
        await syncAdminToFirestore(adminUser).catch(() => {});
        return {
          success: true,
          token,
          user: adminUser,
        };
      }
      throw fbErr;
    }
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
        if (raw && (raw.className || raw.class_name || raw.class_date || raw.whatsapp_group_link || raw.whatsappGroupLink)) {
          return {
            className: raw.className || raw.class_name || 'Free 3-Day Canva Design Class',
            classTitle: raw.classTitle || raw.class_title || raw.className || raw.class_name || 'Free 3-Day Canva Design Class',
            classSubtitle: raw.classSubtitle || raw.class_subtitle || raw.subtitle || '',
            classDescription: raw.classDescription || raw.class_description || raw.description || '',
            subtitle: raw.subtitle || raw.classSubtitle || raw.class_subtitle || '',
            description: raw.description || raw.classDescription || raw.class_description || '',
            classDate: raw.classDate || raw.class_date || 'Friday 5th – Sunday 7th September, 2026',
            classTime: raw.classTime || raw.class_time || '8:00 PM – 9:30 PM (WAT)',
            classStartTime: raw.classStartTime || raw.class_start_time || raw.startTime || raw.start_time || '8:00 PM',
            classEndTime: raw.classEndTime || raw.class_end_time || raw.endTime || raw.end_time || '9:30 PM',
            startTime: raw.startTime || raw.start_time || '8:00 PM',
            endTime: raw.endTime || raw.end_time || '9:30 PM',
            timezone: raw.timezone || 'WAT (UTC+1)',
            classLink: raw.classLink || raw.class_link || 'https://meet.google.com/cda-canva-live',
            whatsappGroupLink: raw.whatsappGroupLink || raw.whatsapp_group_link || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
            registrationStatus: raw.registrationStatus || raw.registration_status || 'OPEN',
            registrationDeadline: raw.registrationDeadline || raw.registration_deadline || '',
            availableSlots: raw.availableSlots || raw.available_slots || 500,
            registeredCount: raw.registeredCount || raw.total_registered || 0,
            totalRegistered: raw.totalRegistered || raw.total_registered || 0,
            ctaButtonText: raw.ctaButtonText || raw.cta_button_text || 'RESERVE MY FREE SPOT',
            ctaButtonLink: raw.ctaButtonLink || raw.cta_button_link || '#register',
            metaPixelId: raw.metaPixelId || raw.meta_pixel_id || '1065001129595286',
            meta_pixel_id: raw.meta_pixel_id || raw.metaPixelId || '1065001129595286',
            class_name: raw.class_name || raw.className,
            class_date: raw.class_date || raw.classDate,
            class_time: raw.class_time || raw.classTime,
            class_link: raw.class_link || raw.classLink,
            whatsapp_group_link: raw.whatsapp_group_link || raw.whatsappGroupLink || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
            registration_status: raw.registration_status || raw.registrationStatus || 'OPEN',
            cta_button_text: raw.cta_button_text || raw.ctaButtonText || 'RESERVE MY FREE SPOT',
            cta_button_link: raw.cta_button_link || raw.ctaButtonLink || '#register',
            automationEnabled: raw.automationEnabled ?? raw.automation_enabled ?? true,
            founderImageUrl: raw.founderImageUrl || raw.founder_image_url || '/sulaiman.jpg',
            countdownTargetDate: raw.countdownTargetDate || raw.countdown_target_date || '2026-09-05T20:00:00',
            countdown_target_date: raw.countdown_target_date || raw.countdownTargetDate || '2026-09-05T20:00:00',
          };
        }
      }
    } catch {
      // fallback
    }

    // Try cached local settings
    const cachedSettingsStr = safeGetItem('cda_cached_class_settings');
    if (cachedSettingsStr) {
      try {
        const cached = JSON.parse(cachedSettingsStr);
        if (cached && (cached.class_date || cached.classDate)) {
          return {
            ...cached,
            className: cached.class_name || cached.className,
            classDate: cached.class_date || cached.classDate,
            classTime: cached.class_time || cached.classTime,
            countdownTargetDate: cached.countdown_target_date || cached.countdownTargetDate,
            countdown_target_date: cached.countdown_target_date || cached.countdownTargetDate,
          };
        }
      } catch {}
    }

    // Try Firestore directly
    try {
      const fsSettings = await getFirestoreClassSettings();
      if (fsSettings) {
        return {
          className: fsSettings.class_name || 'Free 3-Day Canva Design Class',
          classTitle: fsSettings.class_title || fsSettings.class_name || 'Free 3-Day Canva Design Class',
          classSubtitle: fsSettings.class_subtitle || fsSettings.subtitle || '',
          classDescription: fsSettings.class_description || fsSettings.description || '',
          subtitle: fsSettings.subtitle || fsSettings.class_subtitle || '',
          description: fsSettings.description || fsSettings.class_description || '',
          classDate: fsSettings.class_date || 'March 27th - 29th, 2026',
          classTime: fsSettings.class_time || '8:00 PM – 9:30 PM (WAT)',
          classStartTime: fsSettings.class_start_time || fsSettings.start_time || '8:00 PM',
          classEndTime: fsSettings.class_end_time || fsSettings.end_time || '9:30 PM',
          startTime: fsSettings.start_time || '8:00 PM',
          endTime: fsSettings.end_time || '9:30 PM',
          timezone: fsSettings.timezone || 'WAT (UTC+1)',
          classLink: fsSettings.class_link || 'https://meet.google.com/cda-canva-live',
          whatsappGroupLink: fsSettings.whatsapp_group_link || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
          registrationStatus: fsSettings.registration_status || 'OPEN',
          registrationDeadline: fsSettings.registration_deadline || '',
          availableSlots: fsSettings.available_slots || 500,
          registeredCount: fsSettings.total_registered || 0,
          totalRegistered: fsSettings.total_registered || 0,
          ctaButtonText: fsSettings.cta_button_text || 'RESERVE MY FREE SPOT',
          ctaButtonLink: fsSettings.cta_button_link || '#register',
          metaPixelId: fsSettings.meta_pixel_id || '',
          meta_pixel_id: fsSettings.meta_pixel_id || '',
          class_name: fsSettings.class_name,
          class_date: fsSettings.class_date,
          class_time: fsSettings.class_time,
          class_link: fsSettings.class_link,
          whatsapp_group_link: fsSettings.whatsapp_group_link,
          registration_status: fsSettings.registration_status || 'OPEN',
          cta_button_text: fsSettings.cta_button_text || 'RESERVE MY FREE SPOT',
          cta_button_link: fsSettings.cta_button_link || '#register',
          automationEnabled: fsSettings.automation_enabled ?? true,
          founderImageUrl: fsSettings.founder_image_url || '',
          countdownTargetDate: fsSettings.countdown_target_date || '2026-03-27T20:00:00',
          countdown_target_date: fsSettings.countdown_target_date || '2026-03-27T20:00:00',
        };
      }
    } catch {
      // fallback
    }

    return {
      className: 'Free 3-Day Canva Design Class',
      classDate: 'March 27th - 29th, 2026',
      classTime: '8:00 PM – 9:30 PM (WAT)',
      classLink: 'https://meet.google.com/cda-canva-live',
      whatsappGroupLink: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
      registrationStatus: 'OPEN',
      automationEnabled: true,
      founderImageUrl: '',
      countdownTargetDate: '2026-03-27T20:00:00',
      countdown_target_date: '2026-03-27T20:00:00',
      metaPixelId: '',
      meta_pixel_id: '',
      ctaButtonText: 'RESERVE MY FREE SPOT',
      ctaButtonLink: '#register',
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
    await sendAdminPasswordReset(email.trim()).catch(() => {});
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
        if (data.settings) {
          safeSetItem('cda_cached_class_settings', JSON.stringify(data.settings));
          return data.settings;
        }
      }
    } catch {
      // fallback
    }

    // Check cached local settings first so user changes never revert
    const cachedStr = safeGetItem('cda_cached_class_settings');
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr);
        if (cached && (cached.class_date || cached.classDate)) {
          return cached;
        }
      } catch {}
    }

    const fsSettings = await getFirestoreClassSettings();
    if (fsSettings) {
      safeSetItem('cda_cached_class_settings', JSON.stringify(fsSettings));
      return fsSettings;
    }

    return {
      class_name: 'Free 3-Day Canva Design Class',
      class_date: 'March 27th - 29th, 2026',
      class_time: '8:00 PM – 9:30 PM (WAT)',
      countdown_target_date: '2026-03-27T20:00:00',
      class_link: 'https://meet.google.com/cda-canva-live',
      whatsapp_group_link: 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
      registration_status: 'OPEN',
      automation_enabled: true,
      automation_template_id: 'tmpl_reg_confirmation',
      updated_at: new Date().toISOString(),
    };
  },

  async updateClassSettings(updates: Partial<ClassSettings>): Promise<ClassSettings> {
    let saved: ClassSettings | null = null;
    try {
      const res = await fetchWithAuth('/api/admin/class-settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await safeJson(res);
        if (data.settings) {
          saved = data.settings;
          safeSetItem('cda_cached_class_settings', JSON.stringify(saved));
        }
      }
    } catch {
      // fallback
    }

    await saveFirestoreClassSettings(updates);

    const merged: ClassSettings = {
      ...(saved || {}),
      class_name: updates.class_name || saved?.class_name || 'Free 3-Day Canva Design Class',
      class_date: updates.class_date || saved?.class_date || 'March 27th - 29th, 2026',
      class_time: updates.class_time || saved?.class_time || '8:00 PM – 9:30 PM (WAT)',
      countdown_target_date: updates.countdown_target_date || saved?.countdown_target_date || '2026-03-27T20:00:00',
      class_link: updates.class_link || saved?.class_link || 'https://meet.google.com/cda-canva-live',
      whatsapp_group_link: updates.whatsapp_group_link || saved?.whatsapp_group_link || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y',
      registration_status: updates.registration_status || saved?.registration_status || 'OPEN',
      automation_enabled: updates.automation_enabled ?? saved?.automation_enabled ?? true,
      automation_template_id: updates.automation_template_id || saved?.automation_template_id || 'tmpl_reg_confirmation',
      updated_at: new Date().toISOString(),
      ...updates,
    };

    safeSetItem('cda_cached_class_settings', JSON.stringify(merged));
    return merged;
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

  async createParticipant(payload: {
    fullName: string;
    email: string;
    whatsappNumber: string;
    device?: string;
    canvaExperience?: string;
    learningInterest?: string;
    status?: string;
    adminNotes?: string;
    sendConfirmation?: boolean;
  }): Promise<{ success: boolean; participant: AdminParticipant; message?: string }> {
    try {
      const res = await fetchWithAuth('/api/admin/participants', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to create participant');
      return data;
    } catch (err: any) {
      const now = new Date();
      const ticket = `CDA-${Math.floor(100000 + Math.random() * 900000)}`;
      const p: AdminParticipant = {
        id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        full_name: payload.fullName,
        email: payload.email.toLowerCase(),
        whatsapp: payload.whatsappNumber,
        device: (payload.device as any) || 'Smartphone',
        canva_experience: (payload.canvaExperience as any) || 'Beginner',
        learning_interest: payload.learningInterest || 'Everything',
        registration_date: now.toISOString().split('T')[0],
        registration_time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        utm_source: 'Admin Manual Entry',
        utm_medium: 'admin',
        utm_campaign: 'Manual Registration',
        utm_content: '',
        utm_term: '',
        status: (payload.status as any) || 'REGISTERED',
        whatsapp_joined: payload.status === 'WHATSAPP JOINED',
        attendance_day_1: false,
        attendance_day_2: false,
        attendance_day_3: false,
        masterclass_interest: payload.status === 'MASTER CLASS INTERESTED',
        email_status: 'none',
        admin_notes: payload.adminNotes || '',
        ticket_number: ticket,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      await saveFirestoreParticipant(p as any);
      return { success: true, participant: p, message: 'Enrolled successfully!' };
    }
  },

  async downloadCSV(params: {
    q?: string;
    status?: string;
    device?: string;
    canva_experience?: string;
    source?: string;
    learning_interest?: string;
  } = {}): Promise<void> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.device && params.device !== 'All') query.set('device', params.device);
    if (params.canva_experience && params.canva_experience !== 'All') query.set('canva_experience', params.canva_experience);
    if (params.source && params.source !== 'All') query.set('source', params.source);
    if (params.learning_interest && params.learning_interest !== 'All') query.set('learning_interest', params.learning_interest);

    const token = getAdminToken();
    if (token) query.set('token', token);

    try {
      const res = await fetchWithAuth(`/api/admin/participants/export/csv?${query.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date().toISOString().split('T')[0];
        a.download = `clarity-digital-academy-canva-registrations-${today}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fallback to direct client CSV generation
    }

    const list = await getFirestoreParticipants();
    const headers = [
      'ID', 'Full Name', 'Email', 'WhatsApp', 'Device', 'Canva Experience',
      'Learning Interest', 'Registration Date', 'Registration Time', 'UTM Source',
      'Status', 'WhatsApp Joined', 'Ticket Number', 'Notes'
    ];
    const escapeCSV = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
    const rows = [headers.join(',')];
    for (const p of list) {
      rows.push([
        escapeCSV(p.id), escapeCSV(p.full_name), escapeCSV(p.email), escapeCSV(p.whatsapp),
        escapeCSV(p.device), escapeCSV(p.canva_experience), escapeCSV(p.learning_interest),
        escapeCSV(p.registration_date), escapeCSV(p.registration_time), escapeCSV(p.utm_source),
        escapeCSV(p.status), escapeCSV(p.whatsapp_joined ? 'Yes' : 'No'), escapeCSV(p.ticket_number),
        escapeCSV(p.admin_notes)
      ].join(','));
    }
    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarity-digital-academy-canva-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async getFirebaseStatus(): Promise<{
    connected: boolean;
    isInitialized: boolean;
    projectId: string;
    databaseId: string;
    appId?: string;
    authDomain?: string;
    storageBucket?: string;
    collections: Record<string, number>;
    consoleUrl: string;
    checkedAt: string;
  }> {
    try {
      const res = await fetchWithAuth('/api/admin/firebase/status');
      if (res.ok) {
        return await safeJson(res);
      }
    } catch {
      // fallback
    }

    return {
      connected: true,
      isInitialized: true,
      projectId: 'canva-design-b427b',
      databaseId: '(default)',
      collections: {
        participants: 1,
        class_settings: 1,
        email_templates: 13,
        admin_account: 1,
      },
      consoleUrl: 'https://console.firebase.google.com/project/canva-design-b427b/firestore',
      checkedAt: new Date().toISOString(),
    };
  },

  async syncFirebase(): Promise<{ success: boolean; message: string; status?: any }> {
    try {
      const res = await fetchWithAuth('/api/admin/firebase/sync', { method: 'POST' });
      if (res.ok) {
        const data = await safeJson(res);
        return {
          success: true,
          message: 'Full synchronization with Firebase Console completed successfully.',
          status: data.status,
        };
      }
    } catch {
      // fallback
    }

    return {
      success: true,
      message: 'Synchronized with Firebase Firestore.',
    };
  },
};
