// Test della logica del calcolatore: estrae i blocchi CALC e CODEC da index.html
// e li verifica contro le quantità note della ricetta di default. Esegui con: node test.js
'use strict';
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
function block(name) {
  const m = html.match(new RegExp(`// === ${name} START ===([\\s\\S]*?)// === ${name} END ===`));
  if (!m) { console.error(`blocco ${name} non trovato in index.html`); process.exit(1); }
  return m[1];
}
const { calcDough, paramsToQuery, queryToParams } = new Function(
  block('CALC') + block('CODEC') + '; return { calcDough, paramsToQuery, queryToParams };'
)();

let fails = 0;
function eq(name, got, want, tol = 0.001) {
  const ok = typeof want === 'number' ? Math.abs(got - want) <= tol : got === want;
  if (!ok) { fails++; console.log('FAIL', name, '| got', got, '| want', want); }
  else console.log('ok  ', name);
}

// Base: la ricetta di default (valori del video sorgente). Con n×peso = 1730 g
// la farina totale deve tornare esattamente a 1000 g.
const base = { n: 1, peso: 1730, idr: 70, bigaPct: 50, saleGkg: 20, olioGkg: 0, lievBigaPct: 1, lievChiusuraPct: 0.5, secco: false, germe: false, malto: false, maltoGkg: 5 };

// --- CALC: lotto di riferimento (1 kg farina) ---
let r = calcDough(base);
eq('farina totale = 1000', r.farinaTot, 1000);
eq('biga farina = 500', r.bigaFarina, 500);
eq('biga acqua = 250', r.bigaAcqua, 250);
eq('biga lievito = 5', r.bigaLiev, 5);
eq('chiusura farina = 500', r.chiFarina, 500);
eq('chiusura acqua = 450', r.chiAcqua, 450);
eq('sale = 20', r.sale, 20);
eq('chiusura lievito = 5', r.chiLiev, 5);
eq('impasto totale = 1730', r.impasto, 1730);
eq('senza germe: 0 g', r.germe, 0);
eq('senza malto: 0 g', r.malto, 0);
eq('olio default: 0 g', r.olio, 0);

// --- CALC: olio 20 g/kg ---
r = calcDough({ ...base, peso: 1750, olioGkg: 20 });
eq('olio: farina totale = 1000', r.farinaTot, 1000);
eq('olio = 20 g/kg', r.olio, 20);
eq('olio: impasto = 1750', r.impasto, 1750);

// --- CALC: round-trip 6 × 270 e idratazione reale ---
r = calcDough({ ...base, n: 6, peso: 270 });
eq('impasto = 6×270 = 1620', r.impasto, 1620);
eq('idratazione reale = 70%', (r.bigaAcqua + r.chiAcqua) / r.farinaTot, 0.70);

// --- CALC: lievito secco = metà dose ---
r = calcDough({ ...base, secco: true });
eq('lievito secco biga = metà', r.bigaLiev, r.bigaFarina * 0.005);
eq('lievito secco chiusura = metà', r.chiLiev, r.farinaTot * 0.0025);

// --- CALC: germe di grano 5 g/kg (omaggio al maestro Susta) ---
r = calcDough({ ...base, peso: 1735, germe: true });
eq('germe: farina totale = 1000', r.farinaTot, 1000);
eq('germe = 5 g/kg', r.germe, 5);
eq('germe: impasto = 1735', r.impasto, 1735);

// --- CALC: biga 100% con malto obbligatorio ---
r = calcDough({ ...base, peso: 1740, bigaPct: 100, malto: true });
eq('biga 100%: farina totale = 1000', r.farinaTot, 1000);
eq('malto = 5 g/kg', r.malto, 5);
eq('biga 100%: farina chiusura = 0', r.chiFarina, 0);
eq('biga 100%: acqua chiusura = 200', r.chiAcqua, 200);

// --- CODEC: round-trip completo ---
const p1 = { n: 4, peso: 260, idr: 68, bigaPct: 85, saleGkg: 22.5, olioGkg: 12.5, lievBigaPct: 1.2, lievChiusuraPct: 0.3, secco: true, germe: true, malto: true, maltoGkg: 8 };
const back = queryToParams(paramsToQuery(p1));
for (const k of Object.keys(p1)) {
  eq(`codec round-trip ${k}`, back[k], p1[k], 0.01);
}

// --- CODEC: valori fuori range vengono clampati ---
let c = queryToParams('idr=200&biga=30&n=999&mg=99&olio=999&liev=s&germe=1&malto=0');
eq('clamp idr 200 -> 90', c.idr, 90);
eq('clamp olio 999 -> 50', c.olioGkg, 50);
eq('clamp biga 30 -> 45', c.bigaPct, 45);
eq('clamp n 999 -> 30', c.n, 30);
eq('clamp mg 99 -> 30', c.maltoGkg, 30);
eq('liev=s -> secco', c.secco, true);
eq('germe=1 -> true', c.germe, true);
eq('malto=0 -> false', c.malto, false);

// --- CODEC: query vuota o spazzatura -> nessun campo ---
eq('query vuota -> 0 campi', Object.keys(queryToParams('')).length, 0);
eq('query spazzatura -> 0 campi', Object.keys(queryToParams('idr=abc&mode=farina&f=1000&foo=1')).length, 0);

console.log(fails === 0 ? '\nALL TESTS PASSED' : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
