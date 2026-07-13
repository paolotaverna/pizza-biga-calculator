# Account e ricette nel cloud — Design

Data: 2026-07-12. Estende il calcolatore con salvataggio ricette lato server.

## Decisioni (con Paolo)

- Storage: **Netlify Blobs** (incluso nel piano, nessun servizio esterno).
- Identità: **email + password** (min 8 caratteri).
- Il salvataggio **richiede l'account**: sostituisce il salvataggio locale;
  le ricette locali esistenti si importano con un tocco dopo il login.
- ~10 utenti previsti. Password dimenticata → reset manuale di Paolo con
  `node tools/reset-password.mjs <email> <password-temporanea>`, poi
  l'utente la cambia dal sito («Cambia password»).

## Struttura repo (cambia!)

- `public/index.html` — il sito (spostato da root: la publish dir non può
  più essere la root, altrimenti verrebbero pubblicati node_modules).
- `netlify/functions/` — funzioni serverless (functions v2, `config.path`):
  - `register.mjs` → POST `/api/register` {email, password} → token (auto-login)
  - `login.mjs` → POST `/api/login` {email, password} → token
  - `recipes.mjs` → `/api/recipes` GET (lista) / PUT {recipes} (sostituisce
    l'intera lista — liste piccole, sync semplice) — autenticate
  - `password.mjs` → POST `/api/password` {oldPassword, newPassword} — autenticata
  - `lib/core.mjs` — hash scrypt + verifica timing-safe, firma/verifica token
    HMAC (scadenza 90 giorni), normalizzazione email, helper risposta. Puro,
    testabile con Node.
- `tools/reset-password.mjs` — reset admin: calcola l'hash in locale e scrive
  il blob utente via `netlify blobs:set` (richiede login CLI di Paolo).
- `package.json` (+lock): dipendenza `@netlify/blobs`; `node_modules` in .gitignore.
- `netlify.toml`: publish `public`, functions `netlify/functions`.

## Dati (Netlify Blobs)

- Store `users`, chiave = email normalizzata (trim+lowercase):
  `{email, hash, salt, createdAt}` — hash scrypt N=16384.
- Store `recipes`, chiave = email: array `{name, params, savedAt}` (stessa
  forma del localStorage attuale).

## Sessioni

Token stateless: `base64url(payload).base64url(hmac_sha256(payload, AUTH_SECRET))`
con payload `{e: email, x: scadenza}`; 90 giorni; salvato in localStorage
(`pizzaBigaAuth`). `AUTH_SECRET` è una env var Netlify generata casualmente.
401 dal server → logout automatico nel client.

## Front end (pannello «Le mie ricette»)

- Sloggato: campi email/password + «Accedi» / «Registrati», riga errori,
  nota "serve un account gratuito per salvare".
- Loggato: "Connesso come <email>" + «Esci»; salvataggio col nome come oggi
  ma su cloud; lista cloud con carica/elimina; se esistono ricette locali,
  pulsante «Importa le ricette di questo dispositivo» (poi svuota il locale);
  «Cambia password» in un details.
- Tutte le stringhe nuove bilingui IT/EN.
- Artifact claude.ai: la sandbox blocca fetch esterni → il pannello mostra
  un avviso con link al sito Netlify (rilevato dal fallimento della fetch).

## Limiti dichiarati

Nessuna verifica email; reset password solo manuale (admin); rate limiting
minimo (ritardo sui login falliti). Adeguato a ~10 utenti e dati non sensibili.

## Verifica

- Unit: `node test.js` (calcolo, invariato ma path aggiornato) +
  `node test-auth.mjs` (hash/verify, token sign/verify/scadenza/manomissione).
- E2E locale con `netlify dev`: register → login → PUT/GET ricette → password
  sbagliata → 401.
- E2E produzione dopo il deploy con un account di prova, poi pulizia blob.
