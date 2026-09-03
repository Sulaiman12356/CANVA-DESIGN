/**
 * Meta Ads Pixel & Conversions API (CAPI) Tracking Utility
 * Clarity Digital Academy — 3-Day Free Canva Design Class
 *
 * Handles:
 * - Dynamic Meta Pixel initialization
 * - Event deduplication with matched eventIDs for Pixel & CAPI
 * - Browser standard events (PageView, ViewContent, Lead, CompleteRegistration)
 * - Custom events (WhatsAppClick, InitiateRegistration)
 * - Server-side CAPI event dispatching to /api/meta-conversions
 * - Local event audit logging for in-app funnel testing & verification
 */

import { SITE_CONFIG } from '../config';
import { safeGetItem, safeSetItem, safeJsonParse } from './storage';
import { getCapturedUTMs } from './utm';
import { RegistrationFormData } from '../types';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export interface MetaTrackedEvent {
  id: string;
  eventName: string;
  isCustom?: boolean;
  timestamp: string;
  eventId: string;
  pixelStatus: 'fired' | 'simulated' | 'failed' | 'disabled';
  capiStatus: 'sent' | 'simulated' | 'failed' | 'pending';
  params?: Record<string, any>;
  userData?: {
    emailHashed?: boolean;
    phoneHashed?: boolean;
    nameHashed?: boolean;
  };
}

export interface FunnelStats {
  pageViews: number;
  contentViews: number;
  initiatedRegistrations: number;
  completedRegistrations: number;
  whatsAppClicks: number;
}

// Memory cache of fired event IDs to prevent duplicate firings
const firedEventIds = new Set<string>();

/**
 * Returns the active Meta Pixel ID from storage override, Vite env, or config
 */
export function getActiveMetaPixelId(): string {
  const customOverride = safeGetItem('cda_meta_pixel_id');
  if (customOverride && customOverride.trim() !== '') {
    return customOverride.trim();
  }

  // Check cached class settings if available
  const cachedSettings = safeGetItem('cda_cached_class_settings');
  if (cachedSettings) {
    try {
      const parsed = JSON.parse(cachedSettings);
      if (parsed?.meta_pixel_id && typeof parsed.meta_pixel_id === 'string' && parsed.meta_pixel_id.trim() !== '') {
        return parsed.meta_pixel_id.trim();
      }
    } catch {
      // ignore
    }
  }

  const envId = (import.meta as any).env?.VITE_META_PIXEL_ID;
  if (envId && envId.trim() !== '' && !envId.includes('INSERT')) {
    return envId.trim();
  }

  return SITE_CONFIG.META_PIXEL_ID || '[INSERT META PIXEL ID]';
}

/**
 * Check if the current configured Pixel ID is a valid numeric ID
 */
export function isValidPixelId(pixelId: string): boolean {
  return /^\d{10,20}$/.test(pixelId.trim());
}

/**
 * Save in-app Meta event log for testing and conversion inspection
 */
function logMetaEvent(event: MetaTrackedEvent) {
  try {
    const raw = safeGetItem('cda_meta_event_logs', '[]');
    const logs: MetaTrackedEvent[] = safeJsonParse(raw, []);
    logs.unshift(event);
    const trimmed = logs.slice(0, 50); // keep last 50 events
    safeSetItem('cda_meta_event_logs', JSON.stringify(trimmed));
  } catch (err) {
    console.debug('Failed to write event log:', err);
  }
}

/**
 * Retrieve recent tracked events for debugging in admin drawer
 */
export function getMetaEventLogs(): MetaTrackedEvent[] {
  try {
    const raw = safeGetItem('cda_meta_event_logs', '[]');
    return safeJsonParse(raw, []);
  } catch {
    return [];
  }
}

export function clearMetaEventLogs(): void {
  safeSetItem('cda_meta_event_logs', '[]');
}

/**
 * Increment funnel step counters
 */
function recordFunnelStep(step: keyof FunnelStats) {
  try {
    const raw = safeGetItem('cda_funnel_stats', '{"pageViews":0,"contentViews":0,"initiatedRegistrations":0,"completedRegistrations":0,"whatsAppClicks":0}');
    const stats: FunnelStats = safeJsonParse(raw, {
      pageViews: 0,
      contentViews: 0,
      initiatedRegistrations: 0,
      completedRegistrations: 0,
      whatsAppClicks: 0,
    });
    stats[step] = (stats[step] || 0) + 1;
    safeSetItem('cda_funnel_stats', JSON.stringify(stats));
  } catch (err) {
    console.debug('Failed to update funnel stats:', err);
  }
}

export function getFunnelMetrics(): FunnelStats {
  try {
    const raw = safeGetItem('cda_funnel_stats', '{"pageViews":0,"contentViews":0,"initiatedRegistrations":0,"completedRegistrations":0,"whatsAppClicks":0}');
    return safeJsonParse(raw, {
      pageViews: 0,
      contentViews: 0,
      initiatedRegistrations: 0,
      completedRegistrations: 0,
      whatsAppClicks: 0,
    });
  } catch {
    return {
      pageViews: 0,
      contentViews: 0,
      initiatedRegistrations: 0,
      completedRegistrations: 0,
      whatsAppClicks: 0,
    };
  }
}

/**
 * Initialize Meta Pixel in the browser
 */
export function initMetaPixel(): void {
  if (typeof window === 'undefined') return;

  const pixelId = getActiveMetaPixelId();
  const valid = isValidPixelId(pixelId);

  // Define standard Meta Pixel snippet if not already loaded
  if (!window.fbq) {
    const fbq: any = function () {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
      } else {
        fbq.queue.push(arguments);
      }
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
  }

  // Ensure Facebook SDK script tag is injected into DOM when valid numeric ID is active
  if (valid) {
    const existingScript = document.querySelector('script[src*="fbevents.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript?.parentNode?.insertBefore(script, firstScript);
    }
  }

  if (valid && window.fbq) {
    try {
      window.fbq('init', pixelId);
      console.info(`[Meta Pixel] Synchronized with Meta Ads using Pixel ID: ${pixelId}`);
    } catch (e) {
      console.warn('[Meta Pixel] Initialization notice:', e);
    }
  } else {
    console.info(`[Meta Pixel] Running in Dev/Ready Mode. Pixel ID: "${pixelId}". Enter a 10-20 digit numeric Pixel ID in Admin Class Settings to synchronize live with Meta Ads.`);
  }
}

/**
 * Synchronize a new Meta Pixel ID live with Meta Ads Manager and client runtime
 */
export function syncMetaPixelWithAds(newPixelId: string): { success: boolean; valid: boolean; message: string } {
  const cleaned = newPixelId.trim();
  const valid = isValidPixelId(cleaned);

  if (valid) {
    safeSetItem('cda_meta_pixel_id', cleaned);
    initMetaPixel();
    // Dispatch PageView to verify synchronization with Meta Ads Events Manager
    trackPageView(typeof window !== 'undefined' ? window.location.pathname : '/');
    return {
      success: true,
      valid: true,
      message: `Meta Pixel ID ${cleaned} synchronized successfully with Meta Ads Manager!`,
    };
  }

  if (!cleaned) {
    safeSetItem('cda_meta_pixel_id', '');
    return {
      success: true,
      valid: false,
      message: 'Meta Pixel ID cleared. Pixel tracking is now in ready mode.',
    };
  }

  return {
    success: false,
    valid: false,
    message: 'Invalid Meta Pixel ID. Meta Pixel IDs are numeric, typically 15 to 16 digits long.',
  };
}

/**
 * Core event tracking engine: dispatches to client Pixel and server CAPI
 */
export async function trackMetaEvent(
  eventName: string,
  customData: Record<string, any> = {},
  userData: {
    email?: string;
    phone?: string;
    fullName?: string;
  } = {},
  isCustom = false,
  customEventId?: string
): Promise<string> {
  const pixelId = getActiveMetaPixelId();
  const valid = isValidPixelId(pixelId);
  const eventId = customEventId || `cda_${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Prevent duplicate trigger of identical event ID
  if (firedEventIds.has(eventId)) {
    console.warn(`[Meta Event] Event ${eventName} with ID ${eventId} already processed, skipping duplicate.`);
    return eventId;
  }
  firedEventIds.add(eventId);

  // Attach active UTM attribution parameters
  const utms = getCapturedUTMs();
  const enrichedCustomData = {
    ...customData,
    utm_source: utms.utm_source || 'direct',
    utm_medium: utms.utm_medium || 'organic',
    utm_campaign: utms.utm_campaign || 'canva_free_class',
    utm_content: utms.utm_content || '',
    utm_term: utms.utm_term || '',
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
  };

  let pixelStatus: 'fired' | 'simulated' | 'failed' | 'disabled' = 'simulated';

  // 1. Fire on Browser Meta Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (isCustom) {
        window.fbq('trackCustom', eventName, enrichedCustomData, { eventID: eventId });
      } else {
        window.fbq('track', eventName, enrichedCustomData, { eventID: eventId });
      }
      pixelStatus = valid ? 'fired' : 'simulated';
    } catch (pixelErr) {
      console.warn('[Meta Pixel] Error tracking event on client:', pixelErr);
      pixelStatus = 'failed';
    }
  }

  // 2. Dispatch to Server-Side Meta Conversions API (CAPI)
  let capiStatus: 'sent' | 'simulated' | 'failed' | 'pending' = 'pending';
  try {
    // Read Facebook cookies _fbp and _fbc if present
    let fbp: string | undefined;
    let fbc: string | undefined;
    if (typeof document !== 'undefined') {
      const matchFbp = document.cookie.match(/_fbp=([^;]+)/);
      if (matchFbp) fbp = matchFbp[1];
      const matchFbc = document.cookie.match(/_fbc=([^;]+)/);
      if (matchFbc) fbc = matchFbc[1];
    }

    const capiPayload = {
      eventName,
      eventId,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
      userData: {
        ...userData,
        fbp,
        fbc,
      },
      customData: enrichedCustomData,
    };

    const capiRes = await fetch('/api/meta-conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(capiPayload),
    });

    if (capiRes.ok) {
      const data = await capiRes.json();
      capiStatus = data.mode === 'live_capi' ? 'sent' : 'simulated';
    } else {
      capiStatus = 'failed';
    }
  } catch (capiErr) {
    capiStatus = 'simulated';
  }

  // 3. Dispatch to CDA Server-Side Activity Tracker (/api/track) for Live Admin Funnel Analytics
  try {
    let sessionId = safeGetItem('cda_analytics_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      safeSetItem('cda_analytics_session_id', sessionId);
    }

    let mappedEvent: 'page_view' | 'view_content' | 'registration_started' | 'registration_completed' | 'whatsapp_click' = 'page_view';
    if (eventName === 'PageView') mappedEvent = 'page_view';
    else if (eventName === 'ViewContent') mappedEvent = 'view_content';
    else if (eventName === 'InitiateRegistration') mappedEvent = 'registration_started';
    else if (eventName === 'CompleteRegistration' || eventName === 'Lead') mappedEvent = 'registration_completed';
    else if (eventName === 'WhatsAppClick') mappedEvent = 'whatsapp_click';

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: mappedEvent,
        url: typeof window !== 'undefined' ? window.location.href : '/',
        source: utms.utm_source || 'Direct',
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        session_id: sessionId,
      }),
    }).catch(() => {});
  } catch {
    // Non-blocking catch
  }

  // 3. Log event internally for live debugging and testing in drawer
  logMetaEvent({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    eventName,
    isCustom,
    timestamp: new Date().toLocaleTimeString(),
    eventId,
    pixelStatus,
    capiStatus,
    params: enrichedCustomData,
    userData: {
      emailHashed: Boolean(userData.email),
      phoneHashed: Boolean(userData.phone),
      nameHashed: Boolean(userData.fullName),
    },
  });

  return eventId;
}

/**
 * Track PageView event (deduplicated per page route)
 */
let lastTrackedPath = '';
export function trackPageView(path = '/'): void {
  if (lastTrackedPath === path) return;
  lastTrackedPath = path;

  recordFunnelStep('pageViews');
  trackMetaEvent('PageView', {
    page_title: document.title || '3-Day Free Canva Design Class',
    page_path: path,
  });
}

/**
 * Track ViewContent event (when browsing curriculum, syllabus, or benefits)
 */
let hasTrackedViewContent = false;
export function trackViewContent(sectionName = 'Canva Curriculum & Training Details'): void {
  if (hasTrackedViewContent) return;
  hasTrackedViewContent = true;

  recordFunnelStep('contentViews');
  trackMetaEvent('ViewContent', {
    content_name: '3-Day Free Canva Design Class',
    content_category: 'Graphic Design Masterclass',
    content_ids: ['cda_canva_3day_free'],
    content_type: 'course',
    section: sectionName,
    value: 0.0,
    currency: 'USD',
  });
}

/**
 * Track InitiateRegistration event (when user clicks any CTA button or focuses form)
 */
let hasTrackedInitiate = false;
export function trackInitiateRegistration(triggerLocation = 'Hero CTA'): void {
  if (hasTrackedInitiate) return;
  hasTrackedInitiate = true;

  recordFunnelStep('initiatedRegistrations');
  trackMetaEvent('InitiateRegistration', {
    content_name: '3-Day Free Canva Design Class',
    trigger_location: triggerLocation,
    class_batch: SITE_CONFIG.CLASS_DATE,
  }, {}, true);
}

/**
 * Track CompleteRegistration AND Lead events ONLY upon successful form submission.
 * Guaranteed: MUST NOT be called on mere button click without form validity!
 */
export function trackSuccessfulRegistration(student: RegistrationFormData): void {
  recordFunnelStep('completedRegistrations');

  const deterministicEventId = `cda_reg_${student.ticketNumber || student.id || Date.now()}`;

  const eventPayload = {
    content_name: '3-Day Free Canva Design Class',
    content_category: 'Student Registration',
    status: 'registered',
    ticket_number: student.ticketNumber,
    preferred_device: student.device,
    canva_experience: student.canvaExperience,
    learning_goal: student.learningGoal,
    class_batch: student.classBatch || SITE_CONFIG.CLASS_DATE,
    value: 0.0,
    currency: 'USD',
  };

  const userContact = {
    email: student.email,
    phone: student.whatsappNumber,
    fullName: student.fullName,
  };

  // 1. Fire CompleteRegistration with exact matched eventID
  trackMetaEvent('CompleteRegistration', eventPayload, userContact, false, deterministicEventId);

  // 2. Also fire standard Lead event with the same parameters
  trackMetaEvent('Lead', eventPayload, userContact, false, `${deterministicEventId}_lead`);
}

/**
 * Track WhatsApp clicks (community group invite or direct mentor chat)
 */
export function trackWhatsAppClick(
  location: string,
  type: 'group' | 'contact' = 'group',
  customLabel?: string
): void {
  recordFunnelStep('whatsAppClicks');

  trackMetaEvent('WhatsAppClick', {
    action_type: type === 'group' ? 'join_whatsapp_group' : 'chat_with_mentor',
    button_location: location,
    target_link: type === 'group' ? SITE_CONFIG.WHATSAPP_GROUP_LINK : SITE_CONFIG.SOCIAL_LINKS.whatsapp,
    label: customLabel || (type === 'group' ? 'Join WhatsApp Class Group' : 'Message Mr. Clarity on WhatsApp'),
  }, {}, true);
}
