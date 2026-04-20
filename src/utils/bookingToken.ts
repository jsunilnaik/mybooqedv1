/**
 * bookingToken.ts
 *
 * Short-lived, single-use confirmation token for the booking flow.
 *
 * The token is stored in sessionStorage (not localStorage) so it is
 * automatically destroyed when the browser tab is closed.
 * It also has an explicit TTL (15 minutes) and is consumed (deleted)
 * as soon as the confirmation page mounts, making re-use impossible.
 */

const SESSION_KEY = 'bms_confirmation_token';
const TTL_MS = 15 * 60 * 1000; // 15 minutes

interface TokenRecord {
  token: string;
  expiresAt: number;
}

/** Generate a cryptographically-safe 32-char hex token and persist it. */
export function generateBookingToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const token = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const record: TokenRecord = {
    token,
    expiresAt: Date.now() + TTL_MS,
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(record));
  } catch {
    // sessionStorage unavailable (private-mode edge case) — token still returned
    // but won't survive navigation; the guard will redirect.
  }

  return token;
}

/** Return true if the token exists in sessionStorage and has not expired. */
export function validateBookingToken(token: string): boolean {
  if (!token) return false;

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    const record: TokenRecord = JSON.parse(raw);
    return record.token === token && Date.now() < record.expiresAt;
  } catch {
    return false;
  }
}

/**
 * Validate and delete the token in one atomic step.
 * Returns true if the token was valid at the moment of consumption.
 * After this call the token can never be used again.
 */
export function consumeBookingToken(token: string): boolean {
  const valid = validateBookingToken(token);
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  return valid;
}
