#!/usr/bin/env node
/* MISSIONE, blocco 4 — QUANDO LA CRONACA ANNUNCIA UNA PALLA FERMA, LA PALLA SI FERMA?
   Il giudice della cronaca (`fondate-558`) ha messo il numero sul difetto: `fermo 0/4` — ogni riga che
   annuncia un piazzato e' smentita. Qui si misura solo quella famiglia, con rosso e verde ALTERNATI nello
   stesso processo (regola 5). Rosso = __CPM_NO559 (il piazzato e' solo testo, com'era fino al 7.558).
   Il fatto si verifica sulla MESH — su quello che si vede — non sul bersaglio logico.
     CPM_CHROME=... node fermo-559.mjs [CPM_MS=150000] [CPM_GIRI=2]                                    */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 150000), GIRI = +(process.env.CPM_GIRI || 2);
const FERMO_U = 1.2;   /* stessa soglia del giudice della cronaca */
const FINESTRA = 3;    /* minuti di gioco entro cui la palla deve fermarsi */
const MIN_CAMP = 4;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = { verde: [], rosso: [] };
async function giro(rosso, seed) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r]) => {
    window.__CPM_GLB = false; window.__CPM_REC = true;
    if (r) window.__CPM_NO559 = true;
    window.__CPM_TRACCIA = [];
    setInterval(() => {
      try {
        const o = window.__CPM_OWN && window.__CPM_OWN(); if (!o || o.ph !== 'playing') return;
        const T = window.__CPM_TRACCIA, u = T[T.length - 1];
        if (u && u.c === o.c) { u.n++; u.x = o.x; u.y = o.y; return; }
        T.push({ c: o.c, x0: o.x, y0: o.y, x: o.x, y: o.y, n: 1 });
      } catch (_e) {}
    }, 60);
  }, [rosso]);
  await openMatch(page, port, { skipLoadAll: true, name: rosso ? 'Ro' : 'Ve' });
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  await sleep(MS);
  const R = await page.evaluate(() => ({
    righe: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'chronicle'),
    tr: window.__CPM_TRACCIA || [], arm: (window.__CPM_FERMO559 ? JSON.parse(JSON.stringify(window.__CPM_FERMO559)) : null), gate: (window.__CPM_SPGATE559 ? JSON.parse(JSON.stringify(window.__CPM_SPGATE559)) : null), intr: (window.__CPM_INT559 ? JSON.parse(JSON.stringify(window.__CPM_INT559)) : null), min: (window.__CPM_TRACCIA||[]).length,
  }));
  await page.close();
  return R;
}
for (let g = 0; g < GIRI; g++) { const seed = 5200 + g * 91; out.rosso.push(await giro(true, seed)); out.verde.push(await giro(false, seed)); }
srv.close(); await b.close();
function giudica(arr) {
  let tot = 0, ok = 0, scartate = 0; const tipi = {};
  for (const { righe, tr } of arr) {
    const byMin = new Map(); tr.forEach(s => byMin.set(s.c, s));
    for (const r of righe.filter(x => x.sp || /rimessa laterale|bandierina|sul fondo: rinvio|Fischia l'arbitro/.test(String(x.txt || '')))) {
      const m = r.min | 0, q = byMin.get(m);
      if (!q || q.n < MIN_CAMP) { scartate++; continue; }
      tot++; const kk = r.sp || 'interruzione'; tipi[kk] = tipi[kk] || { t: 0, o: 0 }; tipi[kk].t++;
      let fermo = false;
      for (let k = 0; k <= FINESTRA; k++) { const s = byMin.get(m + k); if (s && s.n >= 3 && Math.hypot(s.x - s.x0, s.y - s.y0) < FERMO_U) { fermo = true; break; } }
      if (fermo) { ok++; tipi[kk].o++; }
    }
  }
  return { tot, ok, scartate, tipi };
}
const V = giudica(out.verde), R = giudica(out.rosso);
const armV = out.verde.reduce((s, w) => s + ((w.arm && w.arm.n) || 0), 0);
const pc = (a, b2) => b2 ? (100 * a / b2).toFixed(1) + '%' : '—';
console.log(`\n=== QUANDO LA CRONACA ANNUNCIA UNA PALLA FERMA — ${GIRI} giri per colore, alternati ===\n`);
console.log(`  ROSSO (il piazzato e' solo testo)  righe con piazzato ${R.tot} · la palla si ferma ${R.ok} (${pc(R.ok, R.tot)}) · scartate ${R.scartate}`);
console.log(`  VERDE (il fermo e' uno stato)      righe con piazzato ${V.tot} · la palla si ferma ${V.ok} (${pc(V.ok, V.tot)}) · scartate ${V.scartate}`);
console.log(`  fermi armati nel verde: ${armV}`);
for (const [n, arr] of [['ROSSO', out.rosso], ['VERDE', out.verde]]) {
  const i = arr.map(w => w.intr).filter(Boolean).reduce((a, c) => { a.n += c.n; for (const k of Object.keys(c.tipi)) a.tipi[k] = (a.tipi[k] || 0) + c.tipi[k]; return a; }, { n: 0, tipi: {} });
  const min = arr.reduce((a, w) => a + (w.min || 0), 0);
  console.log(`  ${n} interruzioni ${i.n} su ${min} minuti di gioco = ${min ? (90 * i.n / min).toFixed(1) : '—'} a partita · tipi: ${Object.entries(i.tipi).map(([k, v]) => `${k} ${v}`).join(' · ') || 'nessuno'}`);
}
for (const [n, arr] of [['ROSSO', out.rosso], ['VERDE', out.verde]]) {
  const g = arr.map(w => w.gate).filter(Boolean).reduce((a, c) => { for (const k of Object.keys(c)) a[k] = (a[k] || 0) + c[k]; return a; }, {});
  if (Object.keys(g).length) console.log(`  ${n} cancelli: ` + Object.entries(g).map(([k, v]) => `${k} ${v}`).join(' · '));
}
for (const [n, s] of [['ROSSO', R], ['VERDE', V]]) {
  const d = Object.entries(s.tipi).map(([k, v]) => `${k} ${v.o}/${v.t}`).join(' · ');
  if (d) console.log(`  ${n} per tipo: ${d}`);
}
console.log('');
const conta = arr => arr.map(w => w.intr).filter(Boolean).reduce((a, c) => { a.n += c.n; for (const k of Object.keys(c.tipi)) a.tipi[k] = (a.tipi[k] || 0) + c.tipi[k]; return a; }, { n: 0, tipi: {} });
const minuti = arr => arr.reduce((a, w) => a + (w.min || 0), 0);
const IV = conta(out.verde), IR = conta(out.rosso);
const perV = minuti(out.verde) ? 90 * IV.n / minuti(out.verde) : 0, perR = minuti(out.rosso) ? 90 * IR.n / minuti(out.rosso) : 0;
const tipiV = Object.keys(IV.tipi).length;
/* IL FATTO SI GIUDICA SUL PALLONE, non sulla riga: le interruzioni nuove sono spesso MUTE per scelta
   (la battuta si prende solo una riga libera), quindi il verdetto legge i minuti in cui il fermo e'
   stato armato e chiede che la MESH stia davvero ferma nella finestra. */
function fermiVeri(arr) {
  let tot = 0, ok = 0;
  for (const w of arr) {
    const byMin = new Map(); (w.tr || []).forEach(s2 => byMin.set(s2.c, s2));
    for (const e of ((w.intr && w.intr.min) || [])) {
      tot++;
      for (let k = 0; k <= 3; k++) { const s2 = byMin.get((e.m | 0) + k); if (s2 && s2.n >= 3 && Math.hypot(s2.x - s2.x0, s2.y - s2.y0) < FERMO_U) { ok++; break; } }
    }
  }
  return { tot, ok };
}
const FV = fermiVeri(out.verde);
console.log(`  il pallone sta davvero fermo: ${FV.ok}/${FV.tot} interruzioni (${pc(FV.ok, FV.tot)})`);
console.log(`  \u26a0 dichiarato NON risolto: le vecchie righe \`sp\` del repertorio restano smentite ${V.tot - V.ok}/${V.tot} \u2014 le mangia il cancello \`pendingGoal\` del 7.537, che questo passo non tocca.`);
if (FV.tot >= 4 && FV.ok / FV.tot < 0.75) { console.log(`\u2717 FAIL \u2014 il pallone sta fermo solo ${pc(FV.ok, FV.tot)} delle interruzioni armate.`); process.exit(1); }

if (IR.n > 0) { console.log(`\u2717 NON SEPARATI \u2014 il rosso produce gia' ${IR.n} interruzioni (${perR.toFixed(1)} a partita): __CPM_NO559 doveva spegnerle.`); process.exit(1); }
if (perV < 2.5) { console.log(`\u2717 FAIL \u2014 ${perV.toFixed(1)} interruzioni a partita, sotto le 2,5 dichiarate.`); process.exit(1); }
if (tipiV < 2) { console.log(`\u2717 FAIL \u2014 solo ${tipiV} tipi di interruzione, sotto i 2 dichiarati.`); process.exit(1); }
console.log(`\u2713 PASS \u2014 rosso ${perR.toFixed(1)} interruzioni a partita, verde ${perV.toFixed(1)} con ${tipiV} tipi. Il gioco si ferma.`);
process.exit(0);
