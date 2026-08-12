// Password hashing utilities using the browser's native Web Crypto API (SHA-256 + a
// per-user salt). Passwords are never stored or compared in plaintext.
//
// Honest limitation: this is a fully client-side PWA with no backend server. That means
// there is no server keeping secrets away from the device — anyone with local access to
// the browser/devtools could, in principle, inspect storage. What this DOES provide, and
// what the app lacked before, is a real login gate: no one can open the app or see any
// screen (including the Admin Dashboard) without providing a correct password for a real
// account, and passwords are hashed at rest instead of being stored as plaintext.
// For a production deployment handling real company data, swap this for real server-side
// auth (e.g. Supabase Auth, already stubbed in services/supabaseClient.js).

const encoder = new TextEncoder();

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export async function hashPassword(password, salt) {
  const data = encoder.encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

export async function verifyPassword(password, salt, expectedHash) {
  if (!expectedHash) return false;
  const hash = await hashPassword(password, salt);
  return hash === expectedHash;
}

// Generates a reasonably random temporary password for admin-created accounts / resets.
export function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  const rand = new Uint32Array(10);
  crypto.getRandomValues(rand);
  for (let i = 0; i < 10; i++) out += chars[rand[i] % chars.length];
  return out;
}
