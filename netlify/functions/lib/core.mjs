// Nucleo dell'autenticazione: hashing password (scrypt), token di sessione
// firmati (HMAC-SHA256), normalizzazione email. Nessuna dipendenza: solo
// node:crypto, così è testabile con `node test-auth.mjs`.
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

export const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 giorni
const SCRYPT_KEYLEN = 64;

export function normalizeEmail(email) {
  if (typeof email !== 'string') return null;
  const e = email.trim().toLowerCase();
  // validazione minima: qualcosa@qualcosa.qualcosa, senza spazi
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

export function validPassword(pw) {
  return typeof pw === 'string' && pw.length >= 8 && pw.length <= 200;
}

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, expectedHash) {
  const got = scryptSync(password, salt, SCRYPT_KEYLEN);
  const want = Buffer.from(expectedHash, 'hex');
  return got.length === want.length && timingSafeEqual(got, want);
}

const b64u = (buf) => Buffer.from(buf).toString('base64url');

export function signToken(email, secret, now = Date.now(), ttlMs = TOKEN_TTL_MS) {
  const payload = b64u(JSON.stringify({ e: email, x: now + ttlMs }));
  const mac = createHmac('sha256', secret).update(payload).digest('base64url');
  return payload + '.' + mac;
}

// Ritorna l'email se il token è integro e non scaduto, altrimenti null.
export function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string') return null;
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return null;
  const expected = createHmac('sha256', secret).update(payload).digest();
  const got = Buffer.from(mac, 'base64url');
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.e !== 'string' || typeof data.x !== 'number' || now >= data.x) return null;
    return data.e;
  } catch {
    return null;
  }
}

// ---- helper HTTP per le functions ----
export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function bearerEmail(req, secret) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/^Bearer (.+)$/);
  return m ? verifyToken(m[1], secret) : null;
}

export async function readJson(req) {
  try { return await req.json(); } catch { return null; }
}
