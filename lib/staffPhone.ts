/** Ghana mobile in international form: +233 plus exactly 9 national digits. */
export const GHANA_INTL_PHONE_RE = /^\+233\d{9}$/;

export const GHANA_CC_PREFIX = "+233";

/**
 * Strip to up to 9 national digits (digits only). Handles pasted `233…`, `0…`, or local 9 digits.
 */
export function extractGhanaNationalNineDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("233")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 9);
}

/**
 * Controlled input value: always `+233` plus 0–9 digits (user types digits only; prefix is fixed).
 */
export function formatGhanaPhoneInputValue(storedOrRaw: string): string {
  const trimmed = storedOrRaw.trim();
  if (!trimmed) return GHANA_CC_PREFIX;
  const national = trimmed.startsWith(GHANA_CC_PREFIX)
    ? trimmed.slice(GHANA_CC_PREFIX.length).replace(/\D/g, "").slice(0, 9)
    : extractGhanaNationalNineDigits(trimmed);
  return `${GHANA_CC_PREFIX}${national}`;
}

/** True when there are exactly 9 national digits after +233. */
export function isCompleteGhanaPhoneInput(value: string): boolean {
  if (!value.startsWith(GHANA_CC_PREFIX)) return false;
  const rest = value.slice(GHANA_CC_PREFIX.length);
  return /^\d{9}$/.test(rest);
}

/**
 * Normalize user input to `+233` + 9 digits, or null if invalid.
 * Accepts `+233XXXXXXXXX`, `0XXXXXXXXX`, or `XXXXXXXXX` (9 digits).
 */
export function normalizeToGhanaInternationalPhone(raw: string): string | null {
  const t = raw.trim().replace(/[\s-]/g, "");
  if (GHANA_INTL_PHONE_RE.test(t)) return t;

  const digitsOnly = t.replace(/\D/g, "");
  if (t.startsWith("+")) {
    if (digitsOnly.startsWith("233") && digitsOnly.length === 12) {
      return `+${digitsOnly}`;
    }
    return null;
  }
  if (digitsOnly.length === 9) return `+233${digitsOnly}`;
  if (digitsOnly.length === 10 && digitsOnly.startsWith("0")) {
    return `+233${digitsOnly.slice(1)}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("233")) {
    return `+${digitsOnly}`;
  }
  return null;
}
