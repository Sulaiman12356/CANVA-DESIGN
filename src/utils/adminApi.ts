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
    clearAdminToken();
  }

  return response;
}

export const adminApi = {
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check your administrator credentials.');
    }

    if (data.token) {
      setAdminToken(data.token);
    }
    return data;
  },

  getAdminToken,
  setAdminToken,
  clearAdminToken,

  async getPublicClassSettings(): Promise<PublicClassSettings> {
    try {
      const res = await fetch('/api/public/class-settings');
      if (!res.ok) throw new Error('Failed to fetch class settings');
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
    } catch {
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
    }
  },

  async checkAuthSession(): Promise<AdminUser | null> {
    const token = getAdminToken();
    if (!token) return null;
    try {
      const res = await fetchWithAuth('/api/admin/me');
      if (!res.ok) {
        clearAdminToken();
        return null;
      }
      const data = await safeJson(res);
      return data.user || null;
    } catch {
      return null;
    }
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Password reset request failed');
    }
    return data;
  },

  async verifyResetToken(token: string): Promise<{ success: boolean; adminEmail: string }> {
    const res = await fetch('/api/admin/auth/verify-reset-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Invalid or expired reset token');
    }
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update password');
    }
    return data;
  },

  async getAdminAccount(): Promise<AdminAccountInfo> {
    const res = await fetchWithAuth('/api/admin/account');
    if (!res.ok) throw new Error('Failed to fetch admin account');
    const data = await safeJson(res);
    return data.account;
  },

  async updateAccount(payload: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message: string; user: AdminUser }> {
    const res = await fetchWithAuth('/api/admin/account/update', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update admin account');
    }
    return {
      success: true,
      message: data.message,
      user: {
        email: data.account.email,
        name: data.account.name,
        role: 'super_admin',
      },
    };
  },

  async updateAdminAccount(payload: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message: string; account: AdminAccountInfo }> {
    const res = await fetchWithAuth('/api/admin/account/update', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update admin account');
    }
    return data;
  },

  async getMe(): Promise<AdminUser | null> {
    try {
      const res = await fetchWithAuth('/api/admin/me');
      if (!res.ok) return null;
      const data = await safeJson(res);
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      clearAdminToken();
    }
  },

  async getLiveActivity(): Promise<LiveVisitorMetrics> {
    try {
      const res = await fetchWithAuth('/api/admin/live-activity');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      // Return safe fallback metrics on network or transient failure
      return {
        activeVisitorsNow: 0,
        visitorsPastHour: 0,
        todaySessionsCount: 0,
        todayRegistrations: 0,
        activeSessions: [],
        recentEvents: [],
        serverLagosTime: new Date().toISOString(),
      };
    }
  },

  async getStats(): Promise<CRMStats> {
    const res = await fetchWithAuth('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch CRM stats');
    return safeJson<CRMStats>(res);
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
    if (!res.ok) throw new Error('Failed to fetch participants');
    return safeJson(res);
  },

  async getParticipant(id: string): Promise<AdminParticipant> {
    const res = await fetchWithAuth(`/api/admin/participants/${id}`);
    if (!res.ok) throw new Error('Participant not found');
    const data = await safeJson(res);
    return data.participant;
  },

  async updateParticipant(id: string, updates: Partial<AdminParticipant>): Promise<AdminParticipant> {
    const res = await fetchWithAuth(`/api/admin/participants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update participant');
    const data = await safeJson(res);
    return data.participant;
  },

  async deleteParticipant(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/admin/participants/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete participant');
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
    const res = await fetchWithAuth('/api/admin/email-templates');
    if (!res.ok) throw new Error('Failed to fetch email templates');
    const data = await safeJson(res);
    return data.templates;
  },

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const res = await fetchWithAuth('/api/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Failed to create template');
    return data.template;
  },

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const res = await fetchWithAuth(`/api/admin/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Failed to update template');
    return data.template;
  },

  async deleteEmailTemplate(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/admin/email-templates/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete template');
  },

  async getClassSettings(): Promise<ClassSettings> {
    const res = await fetchWithAuth('/api/admin/class-settings');
    if (!res.ok) throw new Error('Failed to fetch class settings');
    const data = await safeJson(res);
    return data.settings;
  },

  async updateClassSettings(updates: Partial<ClassSettings>): Promise<ClassSettings> {
    const res = await fetchWithAuth('/api/admin/class-settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Failed to update class settings');
    return data.settings;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetchWithAuth('/api/admin/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const data = await safeJson(res);
    return data.logs;
  },
};
