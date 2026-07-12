# Calcolatore Pizza Napoletana con Biga — Design

Data: 2026-07-09
Fonte: "PIZZA NAPOLETANA CON BIGA - La Ricetta di Malati di Pizza" (Vincenzo Viscusi)
https://www.youtube.com/watch?v=ZVU9D4OkviM — trascrizione estratta dai sottotitoli auto-generati.

## Deliverable

Una singola pagina HTML autonoma in italiano: `pizza-biga-calculator.html` nella
cartella `/Users/paolotaverna/AI/MDP`, pubblicata anche come Artifact. Nessuna
dipendenza esterna, tema chiaro/scuro, mobile-friendly.

## Input (controllo completo)

| Input | Default (video) | Note |
|---|---|---|
| Numero panetti | 6 | |
| Peso panetto | 270 g | video: 250–270 g per pizza 30–33 cm |
| Idratazione totale | 70% | |
| % biga (farina prefermentata / farina totale) | 50% | idratazione biga fissa al 50% |
| Sale | 2% (20 g/kg farina) | |
| Lievito | fresco (toggle secco = metà dose) | biga: 1% della farina della biga; chiusura: 0,5% della farina totale |

Pulsante "Ricetta originale del video": imposta il lotto esatto del video
(1 kg farina totale, 700 ml acqua, 20 g sale, 5+5 g lievito fresco ≈ 6 panetti).

## Modello di calcolo

Percentuali del panificatore ancorate alla farina totale F:

- peso impasto totale D = n × peso panetto
- F = D / (1 + idr + sale% + lievito_totale%)
- farina biga = %biga × F; acqua biga = 50% farina biga; lievito biga = 1% farina biga
- chiusura: farina restante, acqua restante (idr × F − acqua biga), sale,
  lievito chiusura = 0,5% × F
- lievito secco = metà del fresco. Arrotondamenti a grammi sensati (0,1 g per il lievito).

## Contenuto ricetta (dal video)

1. **Biga (giorno 1):** sciogliere il lievito nell'acqua fredda di frigo; metodo
   forchetta/no-stress fino a "gnocchetti"; 20 min a TA; panno umido sopra;
   frigo 12–24 h (video: ~16 h). Farina forte W ≥ 300 (o Manitoba).
2. **Chiusura (giorno 2):** biga + farina (anche debole, W ~290 o supermercato) +
   acqua fredda + sale + lievito; impastatrice 12–15 min; temperatura impasto
   target ~21 °C; riposo 10 min; staglio; contenitori unti con olio di semi.
3. **Lievitazione (appretto):** 2–3 h a TA, oppure frigo per arrivare a 5–6 h;
   opzionale 30 min di frigo prima della stesura.
4. **Cottura:** forno elettrico (F1 Gara Evolution, preset pizza contemporanea):
   460 °C sopra / 420 °C sotto, ~90 secondi, una girata a metà.
5. **Bonus — topping "pizza fiocco"** (omaggio a Roberto Susta): panna alla base,
   prosciutto cotto sfilacciato, poca mozzarella, patata schiacciata, tanto
   formaggio, olio, pepe nero.

Timeline visiva dei due giorni sopra i passi.

## Verifica

Script indipendente (node) che ricalcola i valori attesi per il preset video e
li confronta con le formule della pagina; test di rendering della pagina.

## Stato approvazione

Design approvato da Paolo il 2026-07-09 ("love it go"); gate di revisione spec
saltato su esplicito via libera dell'utente. Cartella non-git: nessun commit.
