# Pizza Napoletana con Biga — Calcolatore

Calcolatore interattivo e ricetta completa della pizza napoletana con biga,
fedele al video [«Pizza Napoletana con Biga»](https://www.youtube.com/watch?v=ZVU9D4OkviM)
del canale **Malati di Pizza** (Vincenzo Viscusi).

## Funzionalità

- **Calcolo per panetti o per farina totale** — percentuali del panificatore
  ancorate alla farina totale; biga idratata al 50% come nel video.
- **Controllo completo**: idratazione, % di farina in biga, sale, lievito
  fresco/secco, dosi di lievito in biga e in chiusura.
- **Preset «Ricetta originale del video»**: 1 kg farina, 700 g acqua, 20 g sale,
  5+5 g lievito fresco → 1730 g di impasto (≈ 6 panetti da ~288 g).
- **Ricette salvate** sul dispositivo (localStorage) con ricarica al volo.
- **Link condivisibili**: tutto lo stato del calcolatore vive nella query string.

## Sviluppo

Un solo file, `index.html` — nessuna build, nessuna dipendenza.

```sh
node test.js    # verifica la matematica dell'impasto e il codec URL
open index.html # prova locale
```

Il deploy è su Netlify (pubblica la root del repo, vedi `netlify.toml`).

## Crediti

Ricetta e procedimento di [Malati di Pizza](https://www.instagram.com/malati_di_pizza/) —
questo progetto è solo un calcolatore non ufficiale costruito sulla loro ricetta.
