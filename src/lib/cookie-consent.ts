export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookieConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: number;
  updatedAt: number;
}

const STORAGE_KEY = 'calcettoxp-consent';

export const DEFAULT_REJECTED: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  version: 1,
  updatedAt: Date.now(),
};

export const DEFAULT_ACCEPTED_ALL: CookieConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  version: 1,
  updatedAt: Date.now(),
};

export type ConsentSource = 'banner' | 'settings' | 'footer';

export function readConsent(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      readCookie(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      version: parsed.version || 1,
      updatedAt: parsed.updatedAt || Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeConsent(
  prefs: Omit<CookieConsentPreferences, 'necessary' | 'version' | 'updatedAt'> & {
    version?: number;
    updatedAt?: number;
  },
): CookieConsentPreferences {
  const finalPrefs: CookieConsentPreferences = {
    necessary: true,
    analytics: !!prefs.analytics,
    marketing: !!prefs.marketing,
    version: prefs.version || 1,
    updatedAt: prefs.updatedAt || Date.now(),
  };
  const json = JSON.stringify(finalPrefs);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, json);
    } catch {
      /* ignore storage disabled */
    }
    try {
      writeCookie(STORAGE_KEY, json, 365);
    } catch {
      /* ignore */
    }
    try {
      window.dispatchEvent(
        new CustomEvent<CookieConsentPreferences>('calcettoxp:consent-updated', {
          detail: finalPrefs,
        }),
      );
    } catch {
      /* ignore */
    }
  }
  return finalPrefs;
}

export function hasConsent(): boolean {
  return !!readConsent();
}

export function acceptAll(_source?: ConsentSource): CookieConsentPreferences {
  return writeConsent({ analytics: true, marketing: true });
}

export function rejectNonNecessary(_source?: ConsentSource): CookieConsentPreferences {
  return writeConsent({ analytics: false, marketing: false });
}

export function saveCustom(
  prefs: { analytics: boolean; marketing: boolean },
  _source?: ConsentSource,
): CookieConsentPreferences {
  return writeConsent(prefs);
}

export function loadOptionalScripts(_prefs: CookieConsentPreferences): void {
  // No analytics or marketing scripts are currently active in CalcettoXP.
  // This hook is reserved for future integrations (e.g. Vercel Analytics, Plausible, ad pixels),
  // which must be loaded ONLY if the user has given explicit consent for their category.
  // Loading should happen here and nowhere else to ensure cookie-blocking compliance.
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}
