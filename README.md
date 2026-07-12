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
- **Germe di grano** (5 g/kg in chiusura) — omaggio al maestro Susta.
- **Malto diastasico** in chiusura, obbligatorio automaticamente sopra l'80%
  di biga: senza, l'impasto non ha abbastanza zuccheri freschi da fermentare.
- **Ripristino della ricetta di default** con un tocco.
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

Procedimento ispirato al video di [Vincenzo Viscusi](https://www.youtube.com/watch?v=ZVU9D4OkviM);
questo calcolatore è un progetto personale non affiliato.
