# Pizza Napoletana con Biga — Il calcolatore di Paolo Taverna

Calcolatore interattivo e ricetta completa della mia pizza napoletana con biga,
ispirata al video [«Pizza Napoletana con Biga»](https://www.youtube.com/watch?v=ZVU9D4OkviM)
di Vincenzo Viscusi.

Live: https://pizza-biga-calculator.netlify.app

## Funzionalità

- **Calcolo per panetti** (numero × peso) con percentuali del panificatore
  ancorate alla farina totale; biga idratata al 50%.
- **Controllo completo**: idratazione, farina in biga dal 45% al 100%, sale,
  lievito fresco/secco, dosi di lievito in biga e in chiusura.
- **Olio** in chiusura (g/kg farina), di default 0 come da tradizione.
- **Germe di grano** (5 g/kg in chiusura) — omaggio al maestro Susta.
- **Malto diastasico** in chiusura, obbligatorio automaticamente sopra l'80%
  di biga: senza, l'impasto non ha abbastanza zuccheri freschi da fermentare.
- **Ripristino della ricetta di default** con un tocco.
- **Bilingue IT / EN**: selettore in alto a destra, scelta ricordata sul
  dispositivo e trasportata nei link condivisi (`?lang=en`).
- **Account e ricette nel cloud**: registrazione con email e password (min 8
  caratteri, hash scrypt); le ricette salvate seguono l'utente su ogni
  dispositivo. Storage su Netlify Blobs, funzioni serverless in
  `netlify/functions/`. Password dimenticata: l'amministratore esegue
  `node tools/reset-password.mjs <email> <password-temporanea>` e l'utente
  poi la cambia dal sito («Cambia password»).
- **Mobile-first**: verificato su viewport iPhone (390px), Android (360px)
  e iPad (820px).
- **Link condivisibili**: tutto lo stato del calcolatore vive nella query string.

## Sviluppo

Front end in un solo file (`public/index.html`), backend in quattro piccole
funzioni Netlify (`netlify/functions/`), dati su Netlify Blobs.

```sh
npm install         # solo @netlify/blobs, per le funzioni
node test.js        # matematica dell'impasto e codec URL
node test-auth.mjs  # hash password e token di sessione
netlify dev         # sito + funzioni in locale
```

Il deploy è su Netlify: `netlify deploy --prod --dir public` dalla root del
repo (pubblica `public/` e impacchetta le funzioni, vedi `netlify.toml`).
Richiede la env var `AUTH_SECRET` (già impostata sul sito).

## Crediti

Procedimento ispirato al video di [Vincenzo Viscusi](https://www.youtube.com/watch?v=ZVU9D4OkviM);
questo calcolatore è un progetto personale non affiliato.
