import {
  AdminParticipant,
  AdminUser,
  AdminAccountInfo,
  CRMStats,
  EmailTemplate,
  AuditLog,
  ClassSettings,
  LiveVisitorMetrics,
} from '../types';
import {
  safeGetSessionItem,
  safeSetSessionItem,
  safeRemoveSessionItem,
  safeRemoveItem,
} from './storage';

const TOKEN_KEY = 'cda_admin_auth_token';

export function getAdminToken(): string | null {
  return safeGetSessionItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  safeSetSessionItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  safeRemoveSessionItem(TOKEN_KEY);
  safeRemoveItem(TOKEN_KEY); // Also clean any legacy persistent storage
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
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
  }

  return response;
}

export const adminApi = {
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setAdminToken(data.token);
    return data;
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
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

    const data = await res.json();
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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update password');
    }
    return data;
  },

  async getAdminAccount(): Promise<AdminAccountInfo> {
    const res = await fetchWithAuth('/api/admin/account');
    if (!res.ok) throw new Error('Failed to fetch admin account');
    const data = await res.json();
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

    const data = await res.json();
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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update admin account');
    }
    return data;
  },

  async getMe(): Promise<AdminUser | null> {
    try {
      const res = await fetchWithAuth('/api/admin/me');
      if (!res.ok) return null;
      const data = await res.json();
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
    const res = await fetchWithAuth('/api/admin/live-activity');
    if (!res.ok) throw new Error('Failed to fetch live activity monitor');
    return res.json();
  },

  async getStats(): Promise<CRMStats> {
    const res = await fetchWithAuth('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch CRM stats');
    return res.json();
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
    return res.json();
  },

  async getParticipant(id: string): Promise<AdminParticipant> {
    const res = await fetchWithAuth(`/api/admin/participants/${id}`);
    if (!res.ok) throw new Error('Participant not found');
    const data = await res.json();
    return data.participant;
  },

  async updateParticipant(id: string, updates: Partial<AdminParticipant>): Promise<AdminParticipant> {
    const res = await fetchWithAuth(`/api/admin/participants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update participant');
    const data = await res.json();
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Email sending failed');
    return data;
  },

  async resendConfirmation(
    participantId: string
  ): Promise<{ success: boolean; message: string; participant?: AdminParticipant }> {
    const res = await fetchWithAuth(`/api/admin/resend-confirmation/${participantId}`, {
      method: 'POST',
    });
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'CSV import failed');
    return data;
  },

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const res = await fetchWithAuth('/api/admin/email-templates');
    if (!res.ok) throw new Error('Failed to fetch email templates');
    const data = await res.json();
    return data.templates;
  },

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const res = await fetchWithAuth('/api/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to create template');
    const data = await res.json();
    return data.template;
  },

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const res = await fetchWithAuth(`/api/admin/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update template');
    const data = await res.json();
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
    const data = await res.json();
    return data.settings;
  },

  async updateClassSettings(updates: Partial<ClassSettings>): Promise<ClassSettings> {
    const res = await fetchWithAuth('/api/admin/class-settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update class settings');
    const data = await res.json();
    return data.settings;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetchWithAuth('/api/admin/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const data = await res.json();
    return data.logs;
  },
};
