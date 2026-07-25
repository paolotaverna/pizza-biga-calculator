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
const { calcDough, calcSchedule, calcTimeline, lievDirettaPct, dirWTier, calcDiretta, calcScheduleDiretta, calcTimelineDiretta, paramsToQuery, queryToParams } = new Function(
  block('CALC') + block('CODEC') + '; return { calcDough, calcSchedule, calcTimeline, lievDirettaPct, dirWTier, calcDiretta, calcScheduleDiretta, calcTimelineDiretta, paramsToQuery, queryToParams };'
)();

let fails = 0;
function eq(name, got, want, tol = 0.001) {
  const ok = typeof want === 'number' ? Math.abs(got - want) <= tol : got === want;
  if (!ok) { fails++; console.log('FAIL', name, '| got', got, '| want', want); }
  else console.log('ok  ', name);
}

// Base: la ricetta di default. Con n×peso = 1730 g
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

// --- SCHEDULE: programma alle temperature di default (21 °C casa, 4 °C frigo) ---
let s = calcSchedule({ tAmb: 21, tFrigo: 4 }, calcDough(base));
eq('sched riposo TA = 65 min', s.restMin, 65);
eq('sched frigo = 20 h', s.fridgeH, 20);
eq('sched fuori dal frigo = 3 h', s.pullOutH, 3);
eq('sched acqua = 17 °C', s.waterC, 17);
eq('sched appretto = 3 h', s.apprettoH, 3);

// --- SCHEDULE: cucina calda -> riposo e appretto corti, acqua quasi di frigo ---
s = calcSchedule({ tAmb: 28, tFrigo: 4 }, calcDough(base));
eq('caldo: riposo = 30 min', s.restMin, 30);
eq('caldo: appretto = 1.5 h', s.apprettoH, 1.5);
eq('caldo: acqua clampata a 5 °C', s.waterC, 5);

// --- SCHEDULE: casa fredda e frigo gelido -> clamp verso l'alto ---
s = calcSchedule({ tAmb: 15, tFrigo: 1 }, calcDough(base));
eq('freddo: riposo = 90 min', s.restMin, 90);
eq('freddo: frigo = 24 h', s.fridgeH, 24);
eq('freddo: fuori dal frigo = 4 h', s.pullOutH, 4);

// --- SCHEDULE: senza tAmb/tFrigo usa i default 21/4 ---
s = calcSchedule({}, calcDough(base));
eq('sched default = come 21/4', s.waterC, 17);

// --- TIMELINE: a ritroso dall'infornata, con il programma di default (21/4) ---
{
  const H = 3600000, MIN = 60000, bake = 1000000000000;
  const tl = calcTimeline(bake, calcSchedule({ tAmb: 21, tFrigo: 4 }, calcDough(base)));
  const at = Object.fromEntries(tl.map(x => [x.k, x.at]));
  eq('timeline: 6 tappe', tl.length, 6);
  eq('timeline: inforna = orario scelto', at.calBake, bake);
  eq('timeline: staglio = -3 h', at.calBalls, bake - 3 * H);
  eq('timeline: chiusura = staglio - 25 min', at.calMix, at.calBalls - 25 * MIN);
  eq('timeline: fuori dal frigo = chiusura - 3 h', at.calFridgeOut, at.calMix - 3 * H);
  eq('timeline: in frigo = fuori - 20 h', at.calFridgeIn, at.calFridgeOut - 20 * H);
  eq('timeline: biga = in frigo - 65 min', at.calBiga, at.calFridgeIn - 65 * MIN);
  eq('timeline: ordine crescente', tl.every((x, i) => i === 0 || x.at > tl[i - 1].at), true);
}

// --- DIRETTA: dose di lievito guidata dalle ore (benchmark verace) ---
// Con frigo 24 h a 21/4: frigo = 24 - 1 - 2.5 - 3 = 17.5 h; ore equivalenti
// a T.A. = 6.5 + 17.5 * 2^((4-21)/6); dose = 0.2% * 8 / eq.
{
  // percorso frigo: +40% (FRIGO_BOOST) per rigonfiare i panetti freddi
  const eq24 = 6.5 + 17.5 * Math.pow(2, (4 - 21) / 6);
  eq('diretta lievito frigo 24 h (+40%)', lievDirettaPct({ frigoDiretta: true, dirOre: 24, tAmb: 21, tFrigo: 4 }), 0.002 * 8 / eq24 * 1.4, 1e-6);
  // il boost vale solo col frigo: a parità di ore equivalenti, T.A. non è toccato
  const fr = lievDirettaPct({ frigoDiretta: true, dirOre: 24, tAmb: 21, tFrigo: 4 });
  const noBoost = 0.002 * 8 / eq24;
  eq('diretta: boost frigo = 1.4x del non-boost', fr, noBoost * 1.4, 1e-6);
}
eq('diretta lievito T.A. 8 h = 0.2% (nessun boost)', lievDirettaPct({ frigoDiretta: false, dirOre: 8, tAmb: 21 }), 0.002, 1e-6);
eq('diretta lievito T.A. 10 h = 0.16%', lievDirettaPct({ frigoDiretta: false, dirOre: 10, tAmb: 21 }), 0.0016, 1e-6);
eq('diretta lievito T.A. 8 h a 27° = 0.1%', lievDirettaPct({ frigoDiretta: false, dirOre: 8, tAmb: 27 }), 0.001, 1e-6);
eq('diretta lievito: tetto 0.5%', lievDirettaPct({ frigoDiretta: false, dirOre: 6, tAmb: 15 }), 0.005, 1e-6);
eq('diretta lievito: ore clampate (T.A. max 24)', lievDirettaPct({ frigoDiretta: false, dirOre: 99, tAmb: 21 }), lievDirettaPct({ frigoDiretta: false, dirOre: 24, tAmb: 21 }), 1e-9);

// --- DIRETTA: impasto di riferimento (65%, sale 28 g/kg, frigo 24 h) ---
const dbase = { n: 1, peso: 1681, idr: 65, saleGkg: 28, olioGkg: 0, secco: false, germe: false, malto: false, maltoGkg: 5, frigoDiretta: true, dirOre: 24, tAmb: 21, tFrigo: 4 };
const rd = calcDiretta(dbase);
{
  const pct = lievDirettaPct(dbase);
  const perFlour = 1 + 0.65 + 0.028 + pct;
  eq('diretta: farina coerente', rd.farinaTot, 1681 / perFlour, 0.01);
  eq('diretta: acqua = 65% farina', rd.acqua, rd.farinaTot * 0.65, 0.01);
  eq('diretta: sale = 2.8% farina', rd.sale, rd.farinaTot * 0.028, 0.01);
  eq('diretta: lievito = dose calcolata', rd.liev, rd.farinaTot * pct, 0.001);
  eq('diretta: impasto = 1681', rd.impasto, 1681, 0.001);
}

// --- DIRETTA: forza della farina richiesta (W) da percorso, ore e temperature ---
eq('W: frigo 24 h -> classica', dirWTier({ frigoDiretta: true, dirOre: 24, tAmb: 21, tFrigo: 4 }).tier, 1);
eq('W: frigo 48 h -> taglio', dirWTier({ frigoDiretta: true, dirOre: 48, tAmb: 21, tFrigo: 4 }).tier, 2);
eq('W: T.A. 8 h -> classica', dirWTier({ frigoDiretta: false, dirOre: 8, tAmb: 21 }).tier, 1);
eq('W: T.A. 16 h -> taglio', dirWTier({ frigoDiretta: false, dirOre: 16, tAmb: 21 }).tier, 2);
eq('W: T.A. 24 h -> forte', dirWTier({ frigoDiretta: false, dirOre: 24, tAmb: 21 }).tier, 3);
eq('W: T.A. 16 h a 27° -> forte (estate)', dirWTier({ frigoDiretta: false, dirOre: 16, tAmb: 27 }).tier, 3);
eq('W: tier 3 = 320-340', dirWTier({ frigoDiretta: false, dirOre: 24, tAmb: 21 }).wMin, 320);

// --- DIRETTA: germe e malto sono accessori della biga, qui ignorati ---
{
  const rIgn = calcDiretta({ ...dbase, germe: true, malto: true });
  eq('diretta ignora il germe', rIgn.germe, 0);
  eq('diretta ignora il malto', rIgn.malto, 0);
  eq('diretta: impasto invariato con germe/malto', rIgn.impasto, 1681, 0.001);
}

// --- DIRETTA: programma 21/4, frigo 24 h — il totale torna a 24 ---
const sd = calcScheduleDiretta(dbase, rd);
eq('diretta: ore totali = 24', sd.ore, 24);
eq('diretta: puntata pre-frigo = 60 min', sd.bulkMin, 60);
eq('diretta: frigo = 17.5 h', sd.fridgeH, 17.5);
eq('diretta: fuori dal frigo = 2.5 h', sd.pullOutH, 2.5);
eq('diretta: appretto = 3 h', sd.apprettoH, 3);
eq('diretta: acqua = 13 °C', sd.waterC, 13);
eq('diretta: 1 + 17.5 + 2.5 + 3 = 24', sd.bulkMin / 60 + sd.fridgeH + sd.pullOutH + sd.apprettoH, 24);

// --- DIRETTA: calendario — l'inizio è esattamente (infornata - ore) ---
{
  const H = 3600000, bake = 1000000000000;
  const tl = calcTimelineDiretta(bake, sd);
  eq('diretta timeline frigo: 5 tappe', tl.length, 5);
  eq('diretta timeline: staglio = -3 h', tl[3].at, bake - 3 * H);
  eq('diretta timeline frigo: inizio = -24 h', tl[0].at, bake - 24 * H);
  const sTA = calcScheduleDiretta({ ...dbase, frigoDiretta: false, dirOre: 8 }, rd);
  const tl2 = calcTimelineDiretta(bake, sTA);
  eq('diretta timeline T.A.: 3 tappe', tl2.length, 3);
  eq('diretta timeline T.A. 8 h: inizio = -8 h', tl2[0].at, bake - 8 * H);
  const s10 = calcScheduleDiretta({ ...dbase, frigoDiretta: false, dirOre: 10 }, rd);
  eq('diretta timeline T.A. 10 h: inizio = -10 h', calcTimelineDiretta(bake, s10)[0].at, bake - 10 * H);
}

// --- CODEC: metodo e percorso frigo ---
{
  const backD = queryToParams(paramsToQuery({ n: 6, peso: 270, metodo: 'diretta', frigoDiretta: false, dirOre: 10 }));
  eq('codec metodo = diretta', backD.metodo, 'diretta');
  eq('codec frigoDiretta = false', backD.frigoDiretta, false);
  eq('codec dirOre = 10', backD.dirOre, 10);
  eq('codec dirOre clamp 99 -> 48', queryToParams('do=99').dirOre, 48);
  const backB = queryToParams(paramsToQuery({ n: 6, peso: 270 }));
  eq('codec metodo default = biga', backB.metodo, 'biga');
}

// --- CODEC: round-trip completo ---
const p1 = { n: 4, peso: 260, idr: 68, bigaPct: 85, saleGkg: 22.5, olioGkg: 12.5, lievBigaPct: 1.2, lievChiusuraPct: 0.3, secco: true, germe: true, malto: true, maltoGkg: 8, tAmb: 25, tFrigo: 6 };
const back = queryToParams(paramsToQuery(p1));
for (const k of Object.keys(p1)) {
  eq(`codec round-trip ${k}`, back[k], p1[k], 0.01);
}

// --- CODEC: valori fuori range vengono clampati ---
let c = queryToParams('idr=200&biga=30&n=999&mg=99&olio=999&ta=99&tf=0&liev=s&germe=1&malto=0');
eq('clamp ta 99 -> 35', c.tAmb, 35);
eq('clamp tf 0 -> 1', c.tFrigo, 1);
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
