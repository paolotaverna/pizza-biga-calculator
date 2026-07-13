#!/usr/bin/env node
// Reset manuale della password di un utente (per l'amministratore del sito).
//
//   node tools/reset-password.mjs utente@esempio.com PasswordTemporanea1
//
// Calcola l'hash in locale e aggiorna il blob dell'utente tramite la CLI di
// Netlify (serve essere loggati: `netlify status`). Comunica all'utente la
// password temporanea e invitalo a cambiarla dal sito («Cambia password»).
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hashPassword, normalizeEmail, validPassword } from '../netlify/functions/lib/core.mjs';

// la CLI blobs usa il sito collegato alla cartella: eseguiamo dalla root del repo
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

const [, , rawEmail, newPassword] = process.argv;
const email = normalizeEmail(rawEmail);
if (!email || !validPassword(newPassword)) {
  console.error('Uso: node tools/reset-password.mjs <email> <nuova-password (min 8 caratteri)>');
  process.exit(1);
}

const blob = (args, input) =>
  execFileSync('netlify', ['blobs:' + args[0], ...args.slice(1)], {
    input, encoding: 'utf8', cwd: REPO_ROOT,
  });

let user;
try {
  user = JSON.parse(blob(['get', 'users', email]));
} catch {
  console.error(`Utente non trovato: ${email}`);
  process.exit(1);
}

const { salt, hash } = hashPassword(newPassword);
const updated = { ...user, salt, hash, updatedAt: new Date().toISOString(), resetBy: 'admin' };
blob(['set', 'users', email, JSON.stringify(updated)]);
console.log(`Password di ${email} aggiornata. Comunica la password temporanea e fai cambiare password dal sito.`);
