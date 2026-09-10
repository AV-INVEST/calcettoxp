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

const OFFENSIVE_PATTERNS: RegExp[] = [
  /(?:f+u*c+k|f+u*c+k+e+r|s+h+i+t+|b+i+t+c+h+|c+u+n+t+|d+i+c+k+|p+u+s+s+y+|p+e+n+i+s+|v+a+g+i+n+a+|n+i+g+g+e+r+|n+i+g+g+a+|r+e+t+a+r+d+|f+a+g+|f+a+g+g+o+t+|w+h+o+r+e+|s+l+u+t+|a+s+s+h+o+l+e+|m+o+t+h+e+r+f+u+c+k+e+r+|c+o+c+k+|t+i+t+t+y+|t+i+t+s+|b+o+l+l+o+c+k+|j+e+r+k+o+f+f+|j+a+c+k+o+f+f+|m+a+s+t+u+r+b+a+t+e+|p+o+r+n+|p+o+r+n+o+|r+a+p+e+|p+a+e+d+o+|p+a+e+d+o+p+h+i+l+e+|k+i+l+l+|m+u+r+d+e+r+|t+e+r+r+o+r+i+s+t+|n+a+z+i+|h+i+t+l+e+r+|k+k+k+|f+a+s+c+i+s+t+|x+n+i+g+g+e+r+|x+n+i+g+g+a+|n+e+g+r+o+|s+p+i+c+|c+h+i+n+k+|g+y+p+o+|w+e+t+b+a+c+k+|r+e+d+s+k+i+n+)/i,
  /(?:merda|cazzo|fanculo|stronzo|stronza|bastardo|bastarda|troia|puttana|porc[aio]|dio|ges[uù]|cristo|madonna|santissimo|imbecille|ritardato|ritardata|handicappato|mongoloide|mongola|deficiente|deficiente|negr[oaei]|spaccone|ricchione|frocio|froscio|culattone|pompin[io]|succhialberi|pirla|coglione|cogliona|testa+di+c+azzo|minchia|vaffanculo|cornuto|cornuta|zoccola|bagascia|smandrappata|chiavare|scopare|sborra|sborrone|pisciare|cagare|m+e+r+d+a+s+s+i+m+o|s+c+k+a+n+a+|t+r+a+s+c+a+n+e+|b+r+a+v+i+s+s+i+m+o|d+e+l+i+n+q+u+e+n+t+e)/i,
  /(?:d+1+0|d+i+0+|g+e+s+u+|m+a+d+o+n+n+a+|v+a+f+[a4]+n+c+u+l+0|c+4+z+z+0|m+3+r+d+[a4]|s+t+r+0+n+z+|p+u+t+t+a+n+[a4]|t+r+0+i+a+|f+4+n+c+u+l+0|b+a+s+t+a+r+d+|r+i+t+a+r+d+|m+o+n+g+o+l+|c+o+g+l+i+o+n+|m+i+n+c+h+i+a+|n+e+g+r+o+|f+r+0+c+|r+i+c+c+h+i+o+n+e+)/i,
];

export const CARD_THEMES = ['CLASSIC', 'NIGHT', 'ELITE', 'NEON'] as const;
export type CardTheme = (typeof CARD_THEMES)[number];

export const DAYS_USERNAME_CHANGE_COOLDOWN = 30;

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}

export function isOffensiveUsername(username: string): boolean {
  if (typeof username !== 'string') return false;
  const cleaned = username.toLowerCase().replace(/[_0-9]+/g, '');
  return OFFENSIVE_PATTERNS.some((pattern) => pattern.test(username) || pattern.test(cleaned));
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
  if (isOffensiveUsername(trimmed)) {
    return { valid: false, reason: 'offensive' };
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
