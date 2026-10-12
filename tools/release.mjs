#!/usr/bin/env node
// Rilascio di una nuova versione del sito.
//   node tools/release.mjs "cosa cambia" [--no-deploy] [--no-push]
// 1. nuova versione AAAA.MM.GG-n (n riparte da 1 ogni giorno)
// 2. aggiorna APP_VERSION in public/index.html e public/version.json
// 3. aggiunge la voce in cima a CHANGELOG.md
// 4. node test.js + node test-auth.mjs (se falliscono, si ferma prima del commit)
// 5. git commit di tutto, deploy Netlify in produzione, git push
// Variabile opzionale RELEASE_TRAILER: righe aggiunte in coda al messaggio di commit.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = '1f852971-63a5-43f8-8fb4-0f498421b0cf';
const args = process.argv.slice(2);
const msg = args.filter((a) => !a.startsWith('--')).join(' ').trim();
if (!msg) { console.error('Uso: node tools/release.mjs "cosa cambia" [--no-deploy] [--no-push]'); process.exit(1); }
const sh = (cmd, opts = {}) => execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });

const today = new Date();
const p2 = (n) => String(n).padStart(2, '0');
const day = `${today.getFullYear()}.${p2(today.getMonth() + 1)}.${p2(today.getDate())}`;
const vPath = join(root, 'public', 'version.json');
const cur = JSON.parse(readFileSync(vPath, 'utf8')).version || '';
const m = cur.match(/^(\d{4}\.\d{2}\.\d{2})-(\d+)$/);
const n = m && m[1] === day ? +m[2] + 1 : 1;
const version = `${day}-${n}`;

const iPath = join(root, 'public', 'index.html');
let html = readFileSync(iPath, 'utf8');
const re = /var APP_VERSION = '[^']*';/;
if (!re.test(html)) throw new Error('APP_VERSION non trovato in public/index.html');
html = html.replace(re, `var APP_VERSION = '${version}';`);
writeFileSync(iPath, html);
writeFileSync(vPath, JSON.stringify({ version, date: `${today.getFullYear()}-${p2(today.getMonth() + 1)}-${p2(today.getDate())}` }, null, 2) + '\n');

const cPath = join(root, 'CHANGELOG.md');
let cl = readFileSync(cPath, 'utf8');
const head = '# Changelog\n\n';
if (!cl.startsWith(head)) throw new Error('CHANGELOG.md non inizia con "# Changelog"');
cl = head + `## ${version} · ${day.replace(/\./g, '-')}\n\n- ${msg}\n\n` + cl.slice(head.length);
writeFileSync(cPath, cl);

console.log(`Versione ${version} — test…`);
sh('node test.js > /dev/null && node test-auth.mjs > /dev/null');

const trailer = process.env.RELEASE_TRAILER ? `\n\n${process.env.RELEASE_TRAILER}` : '';
sh('git add -A');
execSync('git commit -q -F -', { cwd: root, input: `Release ${version}: ${msg}${trailer}\n`, stdio: ['pipe', 'inherit', 'inherit'] });
if (!args.includes('--no-deploy')) sh(`netlify deploy --prod --dir public --site ${SITE}`);
if (!args.includes('--no-push')) sh('git push -q origin main');
console.log(`Rilasciata la versione ${version}`);
