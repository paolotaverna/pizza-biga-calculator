# Hosting Netlify, repo GitHub e ricette salvate — Design

Data: 2026-07-12. Estende il calcolatore del 2026-07-09.

## Obiettivi

1. Repo GitHub pubblico `paolotaverna/pizza-biga-calculator` come sorgente.
2. Hosting su Netlify: https://pizza-biga-calculator.netlify.app
3. Salvataggio e ricarica rapida delle ricette.

## Ricette salvate

- Pannello «Le mie ricette»: nome + Salva; lista con caricamento al tocco ed
  eliminazione. Persistenza in `localStorage` (chiave `pizzaBigaRicette`),
  array di `{name, params, savedAt}`. Salvare con un nome esistente sovrascrive.
- Solo sul dispositivo: nessun backend, nessun account.

## Link condivisibili

- Lo stato completo del calcolatore è serializzato nella query string
  (blocco CODEC in `index.html`: `paramsToQuery` / `queryToParams`, valori
  clampati ai limiti dei controlli). L'URL si aggiorna con `replaceState`
  (debounce 300 ms); al caricamento la query, se presente, sovrascrive i default.
- Pulsante «Copia il link a questa ricetta» con fallback se la clipboard è negata.

## Deploy

- Nessuna build: Netlify pubblica la root (`netlify.toml`).
- Deploy iniziale manuale via CLI (`netlify deploy --prod`). Il collegamento
  del repo per l'auto-deploy a ogni push richiede un'autorizzazione
  interattiva GitHub↔Netlify, da completare una volta in app.netlify.com
  (Site configuration → Build & deploy → Link repository) o con `netlify init`.

## Verifica

- `node test.js`: 31 asserzioni — matematica dell'impasto (preset video esatto,
  round-trip panetti, lievito secco, casi limite) e codec URL (round-trip,
  clamp, query spazzatura).
- Chrome headless: caricamento con query string e controllo dei valori renderizzati.
- Sito live verificato: title corretto, query 200, nessun file estraneo pubblicato.
