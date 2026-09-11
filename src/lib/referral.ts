const REFERRAL_CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(length = 8): string {
  let out = "";
  if (typeof globalThis !== "undefined" && globalThis.crypto && "getRandomValues" in globalThis.crypto) {
    const arr = new Uint32Array(length);
    globalThis.crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) {
      out += REFERRAL_CODE_ALPHABET[arr[i] % REFERRAL_CODE_ALPHABET.length];
    }
    return out;
  }
  for (let i = 0; i < length; i++) {
    out += REFERRAL_CODE_ALPHABET[Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length)];
  }
  return out;
}

export const REFERRAL_COOKIE_NAME = "cxp_ref";

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim().toUpperCase();
  if (trimmed.length < 4) return null;
  if (!/^[A-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}
