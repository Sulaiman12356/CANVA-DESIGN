import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, ParticipantRecord } from './server/db';
import {
  authenticateAdminCredentials,
  generateToken,
  requireAdminAuth,
  AuthenticatedRequest,
} from './server/auth';
import {
  sendEmailToParticipant,
  sendBulkEmails,
  interpolateEmailTemplate,
  resendConfirmationToParticipant,
} from './server/email';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper function to SHA-256 hash customer data according to Meta Graph API specifications
function hashMetaField(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function hashMetaPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (!digitsOnly) return undefined;
  return crypto.createHash('sha256').update(digitsOnly).digest('hex');
}

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

// 1. Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    participantsCount: db.getParticipants().length,
    metaConfigured: Boolean(
      process.env.META_ACCESS_TOKEN && (process.env.META_PIXEL_ID || process.env.META_DATASET_ID)
    ),
  });
});

// 2. Real-time Public Activity Tracking Endpoint
app.post('/api/track', (req: Request, res: Response) => {
  try {
    const {
      event,
      url,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      session_id,
    } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'event parameter is required' });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || '';

    const recorded = db.addAnalyticsEvent({
      event,
      url: url || '/',
      source: source || utm_source || 'Direct',
      utm_source,
      utm_medium,
      utm_campaign,
      session_id,
      ip_address: clientIp,
      user_agent: userAgent,
    });

    res.json({ success: true, eventId: recorded.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Public Class Settings (to check if registration is OPEN or CLOSED)
app.get('/api/public/class-settings', (req: Request, res: Response) => {
  const settings = db.getClassSettings();
  res.json({
    className: settings.class_name,
    classDate: settings.class_date,
    classTime: settings.class_time,
    whatsappGroupLink: settings.whatsapp_group_link,
    registrationStatus: settings.registration_status,
  });
});

// 3. Public Student Registration Endpoint
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const settings = db.getClassSettings();
    if (settings.registration_status === 'CLOSED') {
      return res.status(403).json({
        error: 'Registration is currently closed for this cohort.',
      });
    }

    const {
      fullName,
      email,
      whatsappNumber,
      device = 'Smartphone',
      canvaExperience = 'Beginner',
      learningInterest = 'Everything',
      utmSource = 'Direct',
      utmMedium = 'none',
      utmCampaign = 'Canva Free Class',
      utmContent = '',
      utmTerm = '',
    } = req.body;

    if (!fullName || !email || !whatsappNumber) {
      return res.status(400).json({ error: 'Full Name, Email, and WhatsApp number are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate
    const existing = db.findParticipantByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        error: 'This email address is already registered for the Canva class.',
        participant: existing,
      });
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const ticketNumber = `CDA-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: ParticipantRecord = {
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      full_name: fullName.trim(),
      email: normalizedEmail,
      whatsapp: whatsappNumber.trim(),
      device: (device as any) || 'Smartphone',
      canva_experience: (canvaExperience as any) || 'Beginner',
      learning_interest: learningInterest || 'Flyer Design & Visual Branding',
      registration_date: dateStr,
      registration_time: timeStr,
      utm_source: utmSource || 'Direct',
      utm_medium: utmMedium || 'none',
      utm_campaign: utmCampaign || 'Canva Free Class',
      utm_content: utmContent || '',
      utm_term: utmTerm || '',
      status: 'REGISTERED',
      whatsapp_joined: false,
      attendance_day_1: false,
      attendance_day_2: false,
      attendance_day_3: false,
      masterclass_interest: false,
      email_status: 'none',
      admin_notes: '',
      ticket_number: ticketNumber,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const saved = db.addParticipant(newRecord);

    // Track registration_completed event
    db.addAnalyticsEvent({
      event: 'registration_completed',
      url: req.headers.referer || '/',
      source: saved.utm_source || 'Direct',
      utm_source: saved.utm_source,
      utm_medium: saved.utm_medium,
      utm_campaign: saved.utm_campaign,
      ip_address: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      user_agent: (req.headers['user-agent'] as string) || '',
    });

    // Audit log
    db.addAuditLog(
      'Participant registered',
      `${saved.full_name} (${saved.email}) registered from ${saved.utm_source}`,
      'system',
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    );

    // Always Trigger Automated Email immediately on every registration
    let template = (settings.automation_enabled && settings.automation_template_id)
      ? db.getTemplateById(settings.automation_template_id)
      : null;
    if (!template) {
      template = db.getTemplateById('tmpl_reg_confirmation') || db.getEmailTemplates()[0];
    }
    if (template) {
      sendEmailToParticipant(saved, template.subject, template.body).catch((err) =>
        console.error('Auto-email dispatch error:', err)
      );
    }

    return res.status(201).json({
      success: true,
      participant: saved,
      ticketNumber: saved.ticket_number,
    });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// 4. Meta Conversions API (CAPI) endpoint
app.post('/api/meta-conversions', async (req: Request, res: Response) => {
  try {
    const {
      eventName,
      eventId,
      eventTime = Math.floor(Date.now() / 1000),
      eventSourceUrl,
      userData = {},
      customData = {},
    } = req.body;

    if (!eventName) {
      return res.status(400).json({ error: 'eventName is required' });
    }

    const pixelOrDatasetId = process.env.META_DATASET_ID || process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';
    const testEventCode = process.env.META_TEST_EVENT_CODE;

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';
    const userAgent = (req.headers['user-agent'] as string) || '';

    const hashedUserData: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    if (userData.email) hashedUserData.em = [hashMetaField(userData.email)];
    if (userData.phone) hashedUserData.ph = [hashMetaPhone(userData.phone)];
    if (userData.fullName) {
      const parts = userData.fullName.trim().split(' ');
      if (parts.length > 0) hashedUserData.fn = [hashMetaField(parts[0])];
      if (parts.length > 1) hashedUserData.ln = [hashMetaField(parts.slice(1).join(' '))];
    }
    if (userData.fbp) hashedUserData.fbp = userData.fbp;
    if (userData.fbc) hashedUserData.fbc = userData.fbc;

    const eventPayload: Record<string, any> = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId || `cda_capi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      event_source_url: eventSourceUrl || req.headers.referer || '',
      action_source: 'website',
      user_data: hashedUserData,
      custom_data: {
        ...customData,
        platform: 'Clarity Digital Academy Lead Engine',
      },
    };

    const requestBody: Record<string, any> = {
      data: [eventPayload],
    };

    if (testEventCode) {
      requestBody.test_event_code = testEventCode;
    }

    if (accessToken && pixelOrDatasetId && pixelOrDatasetId !== '[INSERT META PIXEL ID]') {
      const metaUrl = `https://graph.facebook.com/${apiVersion}/${pixelOrDatasetId}/events?access_token=${accessToken}`;
      const metaResponse = await fetch(metaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const metaResult = await metaResponse.json();
      return res.json({
        success: metaResponse.ok,
        mode: 'live_capi',
        metaResponse: metaResult,
        eventId: eventPayload.event_id,
      });
    }

    return res.json({
      success: true,
      mode: 'simulated_capi',
      payload: eventPayload,
      eventId: eventPayload.event_id,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = authenticateAdminCredentials(email, password);
  if (!user) {
    db.addAuditLog(
      'Failed admin login attempt',
      `Failed attempt for email: ${email}`,
      email,
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    );
    return res.status(401).json({ error: 'Invalid administrator email or password' });
  }

  const token = generateToken(user);
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  
  // Persist ongoing admin login details to Firebase Firestore console
  db.syncAdminUserToFirestore({
    email: user.email,
    name: user.name,
    role: user.role,
    last_login: new Date().toISOString(),
    ip: clientIp,
  });

  db.addAuditLog(
    'Admin login',
    `Administrator ${user.name} logged into dashboard`,
    user.email,
    clientIp
  );

  return res.json({
    success: true,
    token,
    user,
  });
});

app.get('/api/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.admin });
});

app.post('/api/admin/logout', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  db.addAuditLog(
    'Admin logout',
    `Administrator ${req.admin?.name || req.admin?.email} logged out`,
    req.admin?.email || 'admin',
    (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
  );
  res.json({ success: true });
});

// -------------------------------------------------------------
// ADMIN CRM & PARTICIPANTS ENDPOINTS
// -------------------------------------------------------------

// 1. Dynamic Stats & Analytics
app.get('/api/admin/stats', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const participants = db.getParticipants();
  const total = participants.length;
  const analyticsSummary = db.getAnalyticsSummary();

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let todayCount = 0;
  let thisWeekCount = 0;
  let whatsappJoinedCount = 0;
  let classAttendedCount = 0;
  let masterclassInterestCount = 0;

  const sourceCounts: Record<string, number> = { Facebook: 0, Instagram: 0, Organic: 0, Other: 0 };
  const deviceCounts: Record<string, number> = { Smartphone: 0, Laptop: 0, Both: 0 };
  const experienceCounts: Record<string, number> = {
    Beginner: 0,
    'Used Canva Before': 0,
    Intermediate: 0,
  };
  const skillCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};

  for (const p of participants) {
    if (p.registration_date === todayStr) todayCount++;
    if (new Date(p.registration_date) >= weekAgo) thisWeekCount++;
    if (p.whatsapp_joined || p.status === 'WHATSAPP JOINED') whatsappJoinedCount++;
    if (
      p.attendance_day_1 ||
      p.attendance_day_2 ||
      p.attendance_day_3 ||
      p.status.includes('ATTENDED')
    ) {
      classAttendedCount++;
    }
    if (p.masterclass_interest || p.status === 'MASTER CLASS INTERESTED') {
      masterclassInterestCount++;
    }

    // Source breakdown
    const src = (p.utm_source || 'Organic').toLowerCase();
    if (src.includes('facebook') || src.includes('fb')) {
      sourceCounts.Facebook = (sourceCounts.Facebook || 0) + 1;
    } else if (src.includes('instagram') || src.includes('ig')) {
      sourceCounts.Instagram = (sourceCounts.Instagram || 0) + 1;
    } else if (src.includes('direct') || src.includes('organic') || !p.utm_source) {
      sourceCounts.Organic = (sourceCounts.Organic || 0) + 1;
    } else {
      sourceCounts.Other = (sourceCounts.Other || 0) + 1;
    }

    // Device
    if (p.device) {
      deviceCounts[p.device] = (deviceCounts[p.device] || 0) + 1;
    }

    // Experience
    if (p.canva_experience) {
      experienceCounts[p.canva_experience] = (experienceCounts[p.canva_experience] || 0) + 1;
    }

    // Skills
    if (p.learning_interest) {
      skillCounts[p.learning_interest] = (skillCounts[p.learning_interest] || 0) + 1;
    }

    // Daily breakdown
    if (p.registration_date) {
      dayCounts[p.registration_date] = (dayCounts[p.registration_date] || 0) + 1;
    }
  }

  res.json({
    total,
    today: todayCount,
    thisWeek: thisWeekCount,
    whatsappJoined: whatsappJoinedCount,
    classAttended: classAttendedCount,
    masterClassInterested: masterclassInterestCount,
    // Real tracked funnel metrics
    totalVisitors: analyticsSummary.totalVisitors,
    registrationStarted: analyticsSummary.registrationStarted,
    totalRegistered: analyticsSummary.totalRegistered,
    todayRegistrations: analyticsSummary.todayRegistrations,
    whatsappClicks: analyticsSummary.whatsappClicks,
    emailsSent: analyticsSummary.emailsSent,
    emailsFailed: analyticsSummary.emailsFailed,
    registrationConversionRate: analyticsSummary.registrationConversionRate,
    funnel: analyticsSummary.funnel,
    sourceCounts,
    deviceCounts,
    experienceCounts,
    skillCounts,
    dayCounts,
  });
});

// 2. Search, Filter, and Paginated List of Participants
app.get('/api/admin/participants', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  let list = db.getParticipants();
  const {
    q,
    status,
    device,
    canva_experience,
    source,
    learning_interest,
    page = '1',
    limit = '25',
    sort_by = 'created_at',
    sort_order = 'desc',
  } = req.query;

  // Search
  if (q && typeof q === 'string') {
    const query = q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.full_name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.whatsapp.toLowerCase().includes(query) ||
        p.ticket_number?.toLowerCase().includes(query)
    );
  }

  // Filters
  if (status && status !== 'All') {
    list = list.filter((p) => p.status === status);
  }
  if (device && device !== 'All') {
    list = list.filter((p) => p.device === device);
  }
  if (canva_experience && canva_experience !== 'All') {
    list = list.filter((p) => p.canva_experience === canva_experience);
  }
  if (source && source !== 'All') {
    const srcQuery = (source as string).toLowerCase();
    list = list.filter((p) => p.utm_source.toLowerCase().includes(srcQuery));
  }
  if (learning_interest && learning_interest !== 'All') {
    list = list.filter((p) => p.learning_interest === learning_interest);
  }

  // Sorting
  list.sort((a: any, b: any) => {
    const fieldA = a[sort_by as string] || '';
    const fieldB = b[sort_by as string] || '';
    if (sort_order === 'asc') {
      return fieldA > fieldB ? 1 : -1;
    }
    return fieldA < fieldB ? 1 : -1;
  });

  const totalFiltered = list.length;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 25);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedList = list.slice(startIndex, startIndex + limitNum);

  res.json({
    participants: paginatedList,
    total: totalFiltered,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalFiltered / limitNum),
  });
});

// 3. Single Participant Detail
app.get('/api/admin/participants/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const p = db.getParticipantById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Participant not found' });
  db.addAuditLog('Participant viewed', `Viewed profile for ${p.full_name} (${p.email})`, req.admin?.email);
  res.json({ participant: p });
});

// 4. Update Participant (Status, Notes, Attendance flags, etc.)
app.patch('/api/admin/participants/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getParticipantById(id);
  if (!existing) return res.status(404).json({ error: 'Participant not found' });

  const updated = db.updateParticipant(id, req.body);

  if (req.body.status && req.body.status !== existing.status) {
    db.addAuditLog(
      'Status changed',
      `Changed status of ${existing.full_name} from ${existing.status} to ${req.body.status}`,
      req.admin?.email
    );
  } else {
    db.addAuditLog('Participant edited', `Updated profile of ${existing.full_name}`, req.admin?.email);
  }

  res.json({ participant: updated });
});

// 5. Delete Participant
app.delete('/api/admin/participants/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getParticipantById(id);
  if (!existing) return res.status(404).json({ error: 'Participant not found' });

  db.deleteParticipant(id);
  db.addAuditLog(
    'Participant deleted',
    `Deleted record of ${existing.full_name} (${existing.email})`,
    req.admin?.email
  );

  res.json({ success: true, message: `Participant ${existing.full_name} deleted successfully` });
});

// 6. Export CSV (filtered or all)
app.get('/api/admin/participants/export/csv', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  let list = db.getParticipants();
  const { q, status, device, canva_experience, source, learning_interest } = req.query;

  if (q && typeof q === 'string') {
    const query = q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.full_name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.whatsapp.toLowerCase().includes(query)
    );
  }
  if (status && status !== 'All') list = list.filter((p) => p.status === status);
  if (device && device !== 'All') list = list.filter((p) => p.device === device);
  if (canva_experience && canva_experience !== 'All')
    list = list.filter((p) => p.canva_experience === canva_experience);
  if (source && source !== 'All') {
    list = list.filter((p) => p.utm_source.toLowerCase().includes((source as string).toLowerCase()));
  }
  if (learning_interest && learning_interest !== 'All')
    list = list.filter((p) => p.learning_interest === learning_interest);

  const headers = [
    'ID',
    'Full Name',
    'Email',
    'WhatsApp',
    'Device',
    'Canva Experience',
    'Learning Interest',
    'Registration Date',
    'Registration Time',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Content',
    'UTM Term',
    'Status',
    'WhatsApp Joined',
    'Day 1 Attended',
    'Day 2 Attended',
    'Day 3 Attended',
    'Master Class Interest',
    'Email Status',
    'Last Email Sent',
    'Admin Notes',
    'Ticket Number',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [headers.join(',')];
  for (const p of list) {
    csvRows.push(
      [
        escapeCSV(p.id),
        escapeCSV(p.full_name),
        escapeCSV(p.email),
        escapeCSV(p.whatsapp),
        escapeCSV(p.device),
        escapeCSV(p.canva_experience),
        escapeCSV(p.learning_interest),
        escapeCSV(p.registration_date),
        escapeCSV(p.registration_time),
        escapeCSV(p.utm_source),
        escapeCSV(p.utm_medium),
        escapeCSV(p.utm_campaign),
        escapeCSV(p.utm_content),
        escapeCSV(p.utm_term),
        escapeCSV(p.status),
        escapeCSV(p.whatsapp_joined ? 'Yes' : 'No'),
        escapeCSV(p.attendance_day_1 ? 'Yes' : 'No'),
        escapeCSV(p.attendance_day_2 ? 'Yes' : 'No'),
        escapeCSV(p.attendance_day_3 ? 'Yes' : 'No'),
        escapeCSV(p.masterclass_interest ? 'Yes' : 'No'),
        escapeCSV(p.email_status),
        escapeCSV(p.last_email_sent || ''),
        escapeCSV(p.admin_notes || ''),
        escapeCSV(p.ticket_number || ''),
      ].join(',')
    );
  }

  const csvContent = csvRows.join('\r\n');
  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `clarity-digital-academy-canva-registrations-${todayStr}.csv`;

  db.addAuditLog('CSV downloaded', `Exported ${list.length} participants to CSV`, req.admin?.email);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

// 7. Import CSV
app.post('/api/admin/participants/import', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Valid array of participant records is required' });
  }

  let imported = 0;
  let skipped = 0;
  const now = new Date();

  for (const r of records) {
    const email = (r.email || r.Email || '').trim().toLowerCase();
    const fullName = (r.full_name || r.fullName || r['Full Name'] || '').trim();
    const whatsapp = (r.whatsapp || r.whatsappNumber || r.WhatsApp || '').trim();

    if (!email || !fullName) {
      skipped++;
      continue;
    }

    if (db.findParticipantByEmail(email)) {
      skipped++;
      continue;
    }

    const newRecord: ParticipantRecord = {
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      full_name: fullName,
      email,
      whatsapp: whatsapp || '08000000000',
      device: r.device || r.Device || 'Smartphone',
      canva_experience: r.canva_experience || r.canvaExperience || 'Beginner',
      learning_interest: r.learning_interest || r.learningInterest || 'Flyer Design',
      registration_date: r.registration_date || now.toISOString().split('T')[0],
      registration_time: r.registration_time || now.toTimeString().split(' ')[0],
      utm_source: r.utm_source || 'CSV Import',
      utm_medium: r.utm_medium || 'import',
      utm_campaign: r.utm_campaign || 'manual',
      utm_content: r.utm_content || '',
      utm_term: r.utm_term || '',
      status: r.status || 'REGISTERED',
      whatsapp_joined: Boolean(r.whatsapp_joined),
      attendance_day_1: Boolean(r.attendance_day_1),
      attendance_day_2: Boolean(r.attendance_day_2),
      attendance_day_3: Boolean(r.attendance_day_3),
      masterclass_interest: Boolean(r.masterclass_interest),
      email_status: 'none',
      admin_notes: r.admin_notes || 'Imported via CSV',
      ticket_number: `CDA-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    db.addParticipant(newRecord);
    imported++;
  }

  db.addAuditLog(
    'CSV imported',
    `Imported ${imported} participants, skipped ${skipped} duplicates`,
    req.admin?.email
  );

  res.json({ success: true, imported, skipped, totalProcessed: records.length });
});

// -------------------------------------------------------------
// EMAIL & TEMPLATES ENDPOINTS
// -------------------------------------------------------------

// 1. Send Individual Email
app.post('/api/admin/send-email', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { participantId, subject, body } = req.body;
  if (!participantId || !subject || !body) {
    return res.status(400).json({ error: 'participantId, subject, and body are required' });
  }

  const p = db.getParticipantById(participantId);
  if (!p) return res.status(404).json({ error: 'Participant not found' });

  const result = await sendEmailToParticipant(p, subject, body);

  db.addAuditLog(
    'Email sent',
    `Sent email "${subject}" to ${p.full_name} (${p.email}) - Result: ${result.success ? 'Success' : 'Failed'}`,
    req.admin?.email
  );

  if (!result.success) {
    return res.status(500).json({
      error: 'Email could not be sent. Please try again.',
      details: result.error,
      participant: db.getParticipantById(participantId),
    });
  }

  res.json({
    success: true,
    result,
    message: 'Email sent successfully.',
    participant: db.getParticipantById(participantId),
  });
});

// 1b. Resend Registration Confirmation Email
app.post('/api/admin/resend-confirmation/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const p = db.getParticipantById(id);
  if (!p) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  try {
    const result = await resendConfirmationToParticipant(id);
    const updated = db.getParticipantById(id);

    db.addAuditLog(
      'Confirmation email resent',
      `Resent admission confirmation email to ${p.full_name} (${p.email}) - Status: ${result.success ? 'Delivered' : 'Failed'}`,
      req.admin?.email
    );

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to send confirmation email',
        details: result.error,
        participant: updated,
      });
    }

    res.json({
      success: true,
      message: `Confirmation email successfully sent to ${p.email}`,
      result,
      participant: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing email resend' });
  }
});

// 2. Send Bulk Email
app.post('/api/admin/send-bulk-email', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { participantIds, subject, body, confirmed } = req.body;
  if (!confirmed) {
    return res.status(400).json({ error: 'Double confirmation is required before mass sending.' });
  }

  if (!Array.isArray(participantIds) || participantIds.length === 0 || !subject || !body) {
    return res.status(400).json({ error: 'participantIds, subject, and body are required' });
  }

  const all = db.getParticipants();
  const targets = all.filter((p) => participantIds.includes(p.id));

  if (targets.length === 0) {
    return res.status(400).json({ error: 'No matching participants found for given IDs' });
  }

  const bulkResult = await sendBulkEmails(targets, subject, body);

  db.addAuditLog(
    'Bulk email sent',
    `Bulk email "${subject}" dispatched to ${bulkResult.sent} / ${targets.length} participants`,
    req.admin?.email
  );

  res.json({
    success: true,
    message: `Dispatched to ${bulkResult.sent} participants successfully.`,
    stats: bulkResult,
  });
});

// 3. Email Templates CRUD
app.get('/api/admin/email-templates', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ templates: db.getEmailTemplates() });
});

app.post('/api/admin/email-templates', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, category = 'General', subject, body } = req.body;
  if (!name || !subject || !body) {
    return res.status(400).json({ error: 'Name, subject, and body are required' });
  }

  const newTmpl = db.addEmailTemplate({
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    category,
    subject,
    body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  db.addAuditLog('Template created', `Created email template: ${name}`, req.admin?.email);
  res.status(201).json({ template: newTmpl });
});

app.put('/api/admin/email-templates/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateEmailTemplate(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Template not found' });
  db.addAuditLog('Template updated', `Updated email template: ${updated.name}`, req.admin?.email);
  res.json({ template: updated });
});

app.delete('/api/admin/email-templates/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteEmailTemplate(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Template not found' });
  db.addAuditLog('Template deleted', `Deleted email template ID: ${req.params.id}`, req.admin?.email);
  res.json({ success: true });
});

// -------------------------------------------------------------
// CLASS SETTINGS & AUDIT LOGS
// -------------------------------------------------------------

app.get('/api/admin/class-settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ settings: db.getClassSettings() });
});

app.put('/api/admin/class-settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateClassSettings(req.body);
  db.addAuditLog(
    'Class settings updated',
    `Updated class configuration (Status: ${updated.registration_status})`,
    req.admin?.email
  );
  res.json({ settings: updated });
});

app.get('/api/admin/audit-logs', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs(150);
  res.json({ logs });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SPA FALLBACK
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clarity Digital Academy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
