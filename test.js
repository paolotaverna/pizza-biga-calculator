// Test della logica del calcolatore: estrae i blocchi CALC e CODEC da index.html
// e li verifica contro le quantità note del video. Esegui con: node test.js
'use strict';
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
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

// --- CALC: preset del video (modalità farina, F = 1000) ---
const video = { mode: 'farina', n: 6, peso: 270, farinaTot: 1000, idr: 70, bigaPct: 50, saleGkg: 20, lievBigaPct: 1, lievChiusuraPct: 0.5, secco: false };
let r = calcDough(video);
eq('biga farina = 500', r.bigaFarina, 500);
eq('biga acqua = 250', r.bigaAcqua, 250);
eq('biga lievito = 5', r.bigaLiev, 5);
eq('chiusura farina = 500', r.chiFarina, 500);
eq('chiusura acqua = 450', r.chiAcqua, 450);
eq('sale = 20', r.sale, 20);
eq('chiusura lievito = 5', r.chiLiev, 5);
eq('impasto totale = 1730', r.impasto, 1730);

// --- CALC: modalità panetti, round-trip 6 × 270 ---
r = calcDough({ ...video, mode: 'panetti' });
eq('impasto = 6×270 = 1620', r.impasto, 1620);
eq('peso panetto = 270', r.peso, 270);
eq('idratazione reale = 70%', (r.bigaAcqua + r.chiAcqua) / r.farinaTot, 0.70);

// --- CALC: lievito secco = metà dose ---
r = calcDough({ ...video, secco: true });
eq('lievito secco biga = 2.5', r.bigaLiev, 2.5);
eq('lievito secco chiusura = 2.5', r.chiLiev, 2.5);

// --- CALC: caso limite biga 100%, idratazione minima ---
r = calcDough({ ...video, idr: 55, bigaPct: 100 });
eq('biga 100%: farina chiusura = 0', r.chiFarina, 0);
eq('biga 100% idr 55: acqua chiusura = 50 (>= 0)', r.chiAcqua, 50);

// --- CODEC: round-trip completo ---
const p1 = { mode: 'panetti', n: 4, peso: 260, farinaTot: 800, idr: 68, bigaPct: 45, saleGkg: 22.5, lievBigaPct: 1.2, lievChiusuraPct: 0.3, secco: true };
const q1 = paramsToQuery(p1);
const back = queryToParams(q1);
for (const k of ['mode', 'n', 'peso', 'farinaTot', 'idr', 'bigaPct', 'saleGkg', 'lievBigaPct', 'lievChiusuraPct', 'secco']) {
  eq(`codec round-trip ${k}`, back[k], p1[k], 0.01);
}

// --- CODEC: valori fuori range vengono clampati ---
let c = queryToParams('idr=200&biga=1&n=999&liev=s');
eq('clamp idr 200 -> 90', c.idr, 90);
eq('clamp biga 1 -> 10', c.bigaPct, 10);
eq('clamp n 999 -> 30', c.n, 30);
eq('liev=s -> secco', c.secco, true);

// --- CODEC: query vuota o spazzatura -> nessun campo ---
eq('query vuota -> 0 campi', Object.keys(queryToParams('')).length, 0);
eq('query spazzatura -> 0 campi', Object.keys(queryToParams('idr=abc&mode=xyz&foo=1')).length, 0);

console.log(fails === 0 ? '\nALL TESTS PASSED' : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
