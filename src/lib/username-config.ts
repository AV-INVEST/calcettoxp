export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export const RESERVED_USERNAMES = new Set<string>([
  'admin',
  'admins',
  'administrator',
  'api',
  'app',
  'apps',
  'auth',
  'about',
  'blog',
  'calcettoxp',
  'contact',
  'cookie',
  'cookie-policy',
  'cookies',
  'dashboard',
  'dev',
  'developer',
  'developers',
  'disclaimer',
  'docs',
  'documentation',
  'faq',
  'feed',
  'forum',
  'help',
  'home',
  'impressum',
  'index',
  'legal',
  'login',
  'logout',
  'mail',
  'marketing',
  'media',
  'news',
  'newsletter',
  'oauth',
  'onboarding',
  'p',
  'panel',
  'password',
  'payment',
  'payments',
  'policy',
  'pricing',
  'privacy',
  'profile',
  'register',
  'reset',
  'robots',
  'sitemap',
  'settings',
  'shop',
  'signin',
  'signup',
  'signout',
  'statistiche',
  'stats',
  'store',
  'support',
  'team',
  'terms',
  'termini',
  'test',
  'testing',
  'tos',
  'user',
  'users',
  'verify',
  'webhook',
  'www',
  'wip',
]);

export const CARD_THEMES = ['CLASSIC', 'NIGHT', 'ELITE', 'NEON'] as const;
export type CardTheme = (typeof CARD_THEMES)[number];

export const DAYS_USERNAME_CHANGE_COOLDOWN = 30;

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}

export function validateUsernameFormat(username: string): { valid: boolean; reason?: string } {
  if (typeof username !== 'string') {
    return { valid: false, reason: 'invalid' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, reason: 'invalid' };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, reason: 'invalid' };
  }
  if (isReservedUsername(trimmed)) {
    return { valid: false, reason: 'reserved' };
  }
  return { valid: true };
}

export function generateUsernameFromNickname(nickname: string, suffixSeed = 1): string {
  const base = nickname
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 16);
  const clean = base || 'giocatore';
  const suffix = suffixSeed > 1 ? `_${suffixSeed}` : '';
  const candidate = `${clean}${suffix}`;
  return candidate.slice(0, 20);
}

export function canChangeUsername(lastUsernameChangeAt: Date | null | undefined): {
  allowed: boolean;
  nextChangeDate?: Date;
} {
  if (!lastUsernameChangeAt) return { allowed: true };
  const nextChange = new Date(lastUsernameChangeAt.getTime());
  nextChange.setDate(nextChange.getDate() + DAYS_USERNAME_CHANGE_COOLDOWN);
  if (new Date() >= nextChange) return { allowed: true };
  return { allowed: false, nextChangeDate: nextChange };
}
