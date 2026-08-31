export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  referrer?: string;
  landingPage?: string;
  capturedAt?: string;
}

const UTM_STORAGE_KEY = 'cda_canva_utm_params';

/**
 * Extracts UTM parameters and ad tracking IDs from current URL search params.
 * Falls back to stored UTM parameters from the initial session entry if available.
 */
export function getCapturedUTMs(): UTMParams {
  if (typeof window === 'undefined') {
    return {
      utm_source: 'direct',
      utm_medium: 'organic',
      utm_campaign: 'canva_free_class',
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const currentParams: UTMParams = {};

  const keys: (keyof UTMParams)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'fbclid',
    'gclid',
  ];

  let hasUrlParams = false;
  keys.forEach((key) => {
    const val = searchParams.get(key);
    if (val) {
      currentParams[key] = val;
      hasUrlParams = true;
    }
  });

  if (document.referrer && !currentParams.referrer) {
    currentParams.referrer = document.referrer;
  }

  // If URL has UTM parameters, save them for the entire session
  if (hasUrlParams) {
    currentParams.landingPage = window.location.pathname;
    currentParams.capturedAt = new Date().toISOString();
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(currentParams));
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(currentParams));
    } catch {
      // Ignore storage errors
    }
    return currentParams;
  }

  // Otherwise, retrieve previously captured UTMs from session or localStorage
  try {
    const sessionSaved = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (sessionSaved) {
      return JSON.parse(sessionSaved);
    }
    const localSaved = localStorage.getItem(UTM_STORAGE_KEY);
    if (localSaved) {
      return JSON.parse(localSaved);
    }
  } catch {
    // Ignore storage errors
  }

  // Default fallback if no ad params detected
  return {
    utm_source: 'direct',
    utm_medium: 'organic',
    utm_campaign: 'canva_free_class',
    capturedAt: new Date().toISOString(),
  };
}
