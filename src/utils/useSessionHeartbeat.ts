import { useEffect, useRef } from 'react';
import { getCapturedUTMs } from './utm';
import { safeGetSessionItem, safeSetSessionItem } from './storage';

const SESSION_KEY = 'cda_visitor_session_id';

export function getOrCreateSessionId(): string {
  let sid = safeGetSessionItem(SESSION_KEY);
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    safeSetSessionItem(SESSION_KEY, sid);
  }
  return sid;
}

function detectDevice(): string {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'Smartphone';
  }
  if (/ipad|tablet/i.test(ua)) {
    return 'Tablet';
  }
  return 'Desktop';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Browser';
}

export function useSessionHeartbeat() {
  const activeSecondsRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track public visitors, don't track admin routes
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/admin')) return;

    const sessionId = getOrCreateSessionId();
    const utms = getCapturedUTMs();
    const device = detectDevice();
    const browser = detectBrowser();
    const referrer = document.referrer || 'Direct';

    const sendHeartbeat = async (secondsToAdd: number) => {
      try {
        await fetch('/api/track/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            active_seconds: secondsToAdd,
            current_page: window.location.pathname + window.location.search,
            device,
            browser,
            referrer,
            utm_source: utms?.utm_source,
            utm_medium: utms?.utm_medium,
            utm_campaign: utms?.utm_campaign,
            utm_content: utms?.utm_content,
            utm_term: utms?.utm_term,
          }),
        });
      } catch {
        // Silent fail for non-blocking analytics
      }
    };

    // Initial heartbeat
    sendHeartbeat(5);

    // Periodic heartbeat every 20 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeSecondsRef.current += 20;
        sendHeartbeat(20);
      }
    }, 20000);

    timerRef.current = interval;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat(5);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
