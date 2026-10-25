# Changelog

## 2026.10.25-2 · 2026-10-25

- Diretta col frigo: nuovo campo «Lievito in più (%)» (0–100, codec lb) — la dose del programma sale di x % (fino al doppio) e l'appretto dei panetti si accorcia di conseguenza (la fermentazione ÷ (1+x)^0.8, il riscaldamento resta), le ore tolte tornano al frigo; nota sotto il campo con «da 9 a 7½ h», riepilogo ricetta con «lievito +x %»; tarato sul 25/10/2026 (+50 % a 19 °C ≈ 7 h invece di 9); solo percorso frigo

## 2026.10.25-1 · 2026-10-25

- Diretta col frigo, dai dati del 24–25/10/2026 (sonda nella massa e nel panetto): nuova riga «Il freddo arriva al cuore della massa» (~3 h per kg perché il cuore scenda sotto i 10 °C: 8 h per 2.7 kg) con avviso quando il frigo è troppo corto per la massa; riscaldamento dei panetti 3 h a 21 °C (era 2: partono a ~10 °C e in cassetta chiusa il cuore arriva a 2 °C dalla stanza solo dopo ~3 h), sempre scalato sul peso del panetto; appretto fino a 9 h sotto i 19 °C (era 8); suggerimento sul frigo (vicino alla massa fa 1–2 °C meno del display); passo 2 spiega il ritardo della massa; passo 3 e regola della sonda contano da «2 °C sotto la stanza» e non più da 20 °C (in cucina a 19 °C non ci arriva mai); playbook PDF rigenerato

## 2026.10.12-1 · 2026-10-12

- Versione visibile nel piè di pagina con link alle novità; avviso «Aggiorna» quando è online una versione nuova (controllo di version.json all'apertura, al ritorno sulla scheda e ogni 15 min); ricette salvate migrate ai parametri più recenti (metodo, impastatrice, attrito, minuti, ore fuori dal frigo) e riepilogo della diretta nella lista; ogni ricetta registra la versione con cui è stata salvata; script di rilascio tools/release.mjs (npm run release). Inoltre: appretto del percorso frigo 6½ h a 21 °C e scalato sul peso, regola della sonda, playbook PDF rigenerato.

## 2026-08 (prima del numero di versione)

- 23/08 — Diretta col frigo: ripartizione fuori-frigo/appretto dai dati della sonda nel panetto.
- 22/08 — Sezione «In forno»: due gradienti della platea, zona di lancio, manopola, base croccante, condimenti asciutti.
- 21/08 — Ore fuori dal frigo prima dello staglio regolabili (0 = staglio a freddo).
- 17/08 — Minuti di impastamento, calibrazione dell'attrito dall'impasto misurato, giri/min della spirale.
- 16/08 — Acqua di chiusura col bilancio termico; diretta a T.A. con regola 20/80; avviso farina forte + idratazione bassa.

## 2026-07 (prima del numero di versione)

- 25/07 — Variante Diretta (frigo o T.A., lievito guidato dalle ore, farina per ore, calendario, impastatrice, pieghe, segreti del panetto).
- 23/07 — Calendario a ritroso dalla data di infornata.
- 20/07 — Programma tempi/temperature da casa e frigo.
- 12/07 — Account e ricette nel cloud, inglese, unità sale/olio, germe e malto.
- 09/07 — Prima versione del calcolatore con biga.
