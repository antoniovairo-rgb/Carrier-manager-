/* Fase 2 «partita vera» — IL BANCO DA 1000 PARTITE.
   node prototipo/partita-vera/banco.mjs [N] [--vecchio]
   Bande: min e max di Serie A, Premier, LaLiga, Bundesliga 2022/23-2024/25 (football-data.co.uk, 4.337 partite) con ±10%.
   Scenario «campionato»: forze da 60 a 82 estratte dal seme, casa/trasferta dell'eroe a caso → si confronta con le medie di lega.
   --vecchio: stesso banco col motore di oggi (v2 spento): deve andare ROSSO. */
import './motore-v2.js'; import './partita.js';
const N = +(process.argv.find(a => /^\d+$/.test(a)) || 1000); const VECCHIO = process.argv.includes('--vecchio');
const lcg = (s) => { s = (s >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
const BANDE = { gol: [2.3, 3.5], casaV: [37, 50], pari: [21, 31], zeroZero: [3, 9], tiriSquadra: [9, 16], inPortaPct: [30, 40], golPerTiro: [9, 13.5],
  falli: [19, 28], corner: [8.5, 11.5], gialli: [3.5, 5.2], rossi: [0.08, 0.30], xgSuGol: [0.85, 1.15] };
const fails = []; const viol = {}; const V = (k, m) => { viol[k] = (viol[k] || 0) + 1; if (viol[k] <= 3) fails.push(k + ': ' + m); };
/* [7.999.5] --tattiche: ogni partita riceve uno stile del mister (squadra dell'eroe = «home» del motore) e una persona NPC
   (avversario), scelti dal seme: le bande reali devono tenere anche con gli stili accesi */
const TATT = process.argv.includes('--tattiche');
function tatticaDi(seed) { if (!TATT || !globalThis.TATTICHE_MOTORE) return null; const T = globalThis.TATTICHE_MOTORE;
  const m = Object.keys(T.mister), p = Object.keys(T.persona); const h = Math.imul(seed ^ 0x7ac1, 2654435761) >>> 0;
  return { home: T.mister[m[h % m.length]], away: T.persona[p[(h >>> 8) % p.length]] }; }
function gioca(seed, fc, fo, eroeLato) {
  const P = globalThis.creaPartita({ registra: false, v2: !VECCHIO, seed, casa: { sigla: 'CAS', forza: fc }, ospite: { sigla: 'OSP', forza: fo }, eroeLato, eroe: { nome: 'EROE', ovr: Math.round((eroeLato === 'home' ? fc : fo) + 4) }, tattica: tatticaDi(seed), k2: process.env.K2 ? JSON.parse(process.env.K2) : null });
  const r = P.tuttaSubito(); const ev = P.stato.eventi;
  /* regole «niente di impossibile», sullo stream */
  const golEv = { home: 0, away: 0 }; const esp = new Map(); let fine = null, ultimoTiro = {};
  for (const e of ev) {
    if (fine != null && e.t !== 'fischio_finale') V('evento dopo il fischio', e.t);
    if (e.t === 'fischio_finale') fine = e.min;
    if (e.t === 'tiro') ultimoTiro[e.chi.team] = e;
    if (e.t === 'gol') { golEv[e.lato]++; const t = ultimoTiro[e.lato]; if (!t || t.esito !== 'goal' || !(t.xg > 0) && !VECCHIO) V('gol senza tiro con xG', JSON.stringify(t)); }
    if (e.t === 'espulsione' && e.chi) esp.set(e.chi.i, e.tick);
    else if (e.chi && esp.has(e.chi.i) && e.tick > esp.get(e.chi.i) && e.t !== 'sostituzione') V('espulso ancora in gioco', e.t + ' ' + e.chi.i);/* il fallo che causa il rosso e' nello stesso battito */
  }
  const T = r.tab; if (golEv.home !== r.eroe.fatti || golEv.away !== r.eroe.subiti) V('gol stream ≠ risultato', '');
  for (const s of ['eroe', 'avv']) { const t = T[s]; if (t.inPorta > t.tiri) V('in porta > tiri', ''); if (t.gol > t.inPorta) V('gol > in porta', ''); if (t.tiri > 0 && !(t.xg > 0) && !VECCHIO) V('tiri con xG 0', ''); }
  const sp = T.eroe.espulsioni + T.avv.espulsioni; if (!sp && (T.eroe.possesso < 25 || T.eroe.possesso > 75)) V('possesso fuori 25-75 in 11 contro 11', T.eroe.possesso);
  if (r.durata.secondo > 97 || r.durata.primo > 49) V('tempo di gioco irrealistico', JSON.stringify(r.durata));
  /* dal punto di vista dello stadio */
  const c = eroeLato === 'home' ? T.eroe : T.avv, o = eroeLato === 'home' ? T.avv : T.eroe;
  return { gc: r.casa, go: r.ospite, c, o };
}
function serie(nome, fn) { const A = { n: 0, gol: 0, cv: 0, pa: 0, zz: 0, tc: 0, to: 0, ip: 0, tt: 0, fa: 0, co: 0, gi: 0, ro: 0, xg: 0, pc: 0 };
  const t0 = Date.now();
  for (let k = 0; k < N; k++) { const r = fn(k); A.n++; A.gol += r.gc + r.go; if (r.gc > r.go) A.cv++; else if (r.gc === r.go) A.pa++; if (r.gc + r.go === 0) A.zz++;
    A.tc += r.c.tiri; A.to += r.o.tiri; A.ip += r.c.inPorta + r.o.inPorta; A.fa += r.c.falli + r.o.falli; A.co += r.c.corner + r.o.corner; A.gi += r.c.ammonizioni + r.o.ammonizioni; A.ro += r.c.espulsioni + r.o.espulsioni; A.xg += r.c.xg + r.o.xg; A.pc += r.c.possesso; }
  const n = A.n, m = { gol: A.gol / n, casaV: 100 * A.cv / n, pari: 100 * A.pa / n, zeroZero: 100 * A.zz / n, tiriCasa: A.tc / n, tiriOsp: A.to / n, inPortaPct: 100 * A.ip / (A.tc + A.to), golPerTiro: 100 * A.gol / (A.tc + A.to),
    falli: A.fa / n, corner: A.co / n, gialli: A.gi / n, rossi: A.ro / n, xgSuGol: A.xg / Math.max(1, A.gol), possessoCasa: A.pc / n, secondi: (Date.now() - t0) / 1000 };
  const r2 = (x) => Math.round(x * 100) / 100; console.log(nome.padEnd(34), Object.entries(m).map(([k, v]) => k + ' ' + r2(v)).join(' · ')); return m; }
const seedDi = (k, sal) => ((k + 1) * 2654435761 ^ sal) >>> 0;
const camp = serie('campionato (forze 60-82, mista)', (k) => { const r = lcg(seedDi(k, 77)); const fc = 60 + Math.floor(r() * 23), fo = 60 + Math.floor(r() * 23); return gioca(seedDi(k, 1), fc, fo, r() < 0.5 ? 'home' : 'away'); });
const pari = serie('pari forza 70-70', (k) => gioca(seedDi(k, 2), 70, 70, k % 2 ? 'home' : 'away'));
const forte = serie('forte 85 in casa contro 55', (k) => gioca(seedDi(k, 3), 85, 55, k % 2 ? 'home' : 'away'));
const debole = serie('debole 55 in casa contro 85', (k) => gioca(seedDi(k, 4), 55, 85, k % 2 ? 'home' : 'away'));
const chk = (k, v, b) => { if (!(v >= b[0] && v <= b[1])) fails.push(`banda ${k}: ${Math.round(v * 100) / 100} fuori da [${b[0]}; ${b[1]}]`); };
for (const k of Object.keys(BANDE)) if (k === 'tiriSquadra') { chk('tiri casa', camp.tiriCasa, BANDE.tiriSquadra); chk('tiri ospite', camp.tiriOsp, BANDE.tiriSquadra); } else chk(k, camp[k], BANDE[k]);
if (!(camp.tiriCasa > camp.tiriOsp)) fails.push('la squadra di casa non tira piu\' dell\'ospite');
chk('favorito forte in casa vince %', forte.casaV, [65, 85]); if (!(debole.casaV < pari.casaV && pari.casaV < forte.casaV)) fails.push('la forza non ordina le vittorie');
if (!(forte.possessoCasa > 52)) fails.push(`il forte non ha piu' palla: ${forte.possessoCasa}`);
/* determinismo: stesso seme due volte → stessa impronta; e simulazione rapida = partita «guardata» scegliendo come la scelta automatica */
/* [7.999.6] il seme del controllo e' il primo da 4242 in cui l'eroe ha almeno un'occasione: con la marcatura (eroe dal gioco) una stella
   in trasferta resta senza occasioni nel 2% delle partite, e «una scelta diversa cambia la partita» ha senso solo se una scelta esiste */
const semeConScelta = (base) => { for (let s = base; s < base + 40; s++) { const c = { seed: s, casa: { sigla: 'CAS', forza: 72 }, ospite: { sigla: 'OSP', forza: 68 }, eroeLato: 'away', eroe: { nome: 'EROE', ovr: 78 }, v2: !VECCHIO, scelte: {} };
  const Q = globalThis.creaPartita(c); while (!Q.stato.finita) { const r = Q.passo({ chiedi: true }); if (r && r.attesa) return s; } } return base; };
const conf = { k2: process.env.K2 ? JSON.parse(process.env.K2) : null, seed: semeConScelta(4242), casa: { sigla: 'CAS', forza: 72 }, ospite: { sigla: 'OSP', forza: 68 }, eroeLato: 'away', eroe: { nome: 'EROE', ovr: 78 }, v2: !VECCHIO };
const a = globalThis.creaPartita({ ...conf, registra: false }).tuttaSubito(), b = globalThis.creaPartita({ ...conf, registra: false }).tuttaSubito();
if (a.impronta !== b.impronta) fails.push('determinismo: stesso seme, impronte diverse');
/* 20 semi, eroe in casa e in trasferta: la partita guardata con le scelte automatiche deve dare la stessa impronta della sim rapida */
let nDet = 0; for (let s = 1; s <= 20; s++) { const c2 = { ...conf, seed: s * 1013, eroeLato: s % 2 ? 'home' : 'away' };
  const x = globalThis.creaPartita({ ...c2, registra: false }).tuttaSubito(); const G2 = globalThis.creaPartita({ ...c2, scelte: {}, registra: false });
  while (!G2.stato.finita) { const r = G2.passo({ chiedi: true }); if (r && r.attesa) G2.scegli(r.attesa.k, r.attesa.auto); } if (G2.risultato().impronta === x.impronta) nDet++; }
if (nDet !== 20) fails.push(`determinismo: ${nDet}/20 semi con impronta identica`);
const L = globalThis.creaPartita({ ...conf, scelte: {} }); let occ = 0;
while (!L.stato.finita) { const r = L.passo({ chiedi: true }); if (r && r.attesa) { occ++; L.scegli(r.attesa.k, r.attesa.auto); } }
const lv = L.risultato(); if (lv.impronta !== a.impronta) fails.push(`determinismo: sim rapida ${a.impronta} ≠ partita guardata ${lv.impronta}`);
/* una scelta diversa cambia la partita (la scelta conta davvero) */
const D = globalThis.creaPartita({ ...conf, scelte: {} }); let cambiata = false;
while (!D.stato.finita) { const r = D.passo({ chiedi: true }); if (r && r.attesa) { const alt = r.attesa.auto === 'tiro' ? 'passaggio' : 'tiro'; D.scegli(r.attesa.k, cambiata ? r.attesa.auto : alt); cambiata = true; } }
if (!VECCHIO && D.risultato().impronta === a.impronta) fails.push('una scelta diversa non cambia la partita');
console.log(`determinismo: ${nDet}/20 semi identici · sim ${a.impronta} · guardata ${lv.impronta} (${occ} occasioni dell'eroe) · scelta diversa ${D.risultato().impronta}`);
for (const [k, v] of Object.entries(viol)) fails.push(`regola «${k}» violata ${v} volte`);
console.log(fails.length ? '✗ ROSSO\n  ' + [...new Set(fails)].join('\n  ') : `✓ VERDE — ${N} partite per scenario, bande e regole rispettate`);
process.exit(fails.length ? 1 : 0);
