// Unit test del nucleo auth (hash password + token). Esegui con: node test-auth.mjs
import {
  normalizeEmail, validPassword, hashPassword, verifyPassword,
  signToken, verifyToken, TOKEN_TTL_MS,
} from './netlify/functions/lib/core.mjs';

let fails = 0;
function eq(name, got, want) {
  const ok = got === want;
  if (!ok) { fails++; console.log('FAIL', name, '| got', got, '| want', want); }
  else console.log('ok  ', name);
}

// --- email ---
eq('email normalizzata', normalizeEmail('  Paolo@Example.COM '), 'paolo@example.com');
eq('email senza @ -> null', normalizeEmail('paolo.example.com'), null);
eq('email senza dominio -> null', normalizeEmail('paolo@'), null);
eq('email non stringa -> null', normalizeEmail(42), null);

// --- password ---
eq('password corta -> no', validPassword('1234567'), false);
eq('password 8 char -> ok', validPassword('12345678'), true);

// --- hash ---
const { salt, hash } = hashPassword('margherita2026');
eq('verifica password giusta', verifyPassword('margherita2026', salt, hash), true);
eq('verifica password sbagliata', verifyPassword('marinara2026', salt, hash), false);
const again = hashPassword('margherita2026');
eq('salt sempre diverso', again.salt === salt, false);
eq('stesso input + stesso salt = stesso hash', hashPassword('margherita2026', salt).hash, hash);

// --- token ---
const SECRET = 'test-secret';
const now = 1_800_000_000_000;
const token = signToken('paolo@example.com', SECRET, now);
eq('token valido -> email', verifyToken(token, SECRET, now + 1000), 'paolo@example.com');
eq('token scaduto -> null', verifyToken(token, SECRET, now + TOKEN_TTL_MS + 1), null);
eq('segreto sbagliato -> null', verifyToken(token, 'altro-segreto', now), null);
const [p] = token.split('.');
const forged = Buffer.from(p, 'base64url').toString().replace('paolo', 'mario');
eq('payload manomesso -> null',
  verifyToken(Buffer.from(forged).toString('base64url') + '.' + token.split('.')[1], SECRET, now), null);
eq('token spazzatura -> null', verifyToken('abc', SECRET, now), null);
eq('token non stringa -> null', verifyToken(null, SECRET, now), null);

console.log(fails === 0 ? '\nALL AUTH TESTS PASSED' : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
