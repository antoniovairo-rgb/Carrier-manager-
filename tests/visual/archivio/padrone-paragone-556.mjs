#!/usr/bin/env node
/* MISSIONE, blocco 2 / P1 — GUARDIANO DEL PADRONE UNICO, con prova del rosso nello stesso giro.
   Verde = 7.555 (il padrone si elegge una volta sola, i tre rami sono esclusivi per costruzione).
   Rosso = __CPM_NO555 (i tre gate indipendenti di prima, che si prevedevano a vicenda).
   Il numero giudicato e' `multi`: fotogrammi in cui DUE scrittori hanno scritto lo stesso pallone.
   Regola 5: rosso e verde girano ALTERNATI nello STESSO processo, mai confrontando giri diversi.
     CPM_CHROME=... node padrone-paragone-555.mjs [CPM_MS=120000] [CPM_GIRI=2]                        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 120000), GIRI = +(process.env.CPM_GIRI || 2);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = { verde: [], rosso: [] };
async function giro(rosso, seed) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r]) => {
    window.__CPM_GLB = false; window.__CPM_REC = true;
    if (r) { window.__CPM_NO555 = true; window.__CPM_NO556 = true; }
    window.__CPM_OWN497 = { f: 0, dich: 0, multi: 0, mosso: 0, anon: 0, coppie: {} };
    window.__CPM_ATT556 = { tot: 0, nom: 0 };
  }, [rosso]);
  await openMatch(page, port, { skipLoadAll: true, name: rosso ? 'Ro' : 'Ve' });
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  await sleep(MS);
  const W = await page.evaluate(() => ({ o: window.__CPM_OWN497, a: window.__CPM_ATT556 }));
  await page.close();
  W.o._att = W.a; return W.o;
}
for (let g = 0; g < GIRI; g++) {
  const seed = 9400 + g * 101;
  out.rosso.push(await giro(true, seed));
  out.verde.push(await giro(false, seed));
}
srv.close(); await b.close();
const som = (a, k) => a.reduce((s, w) => s + (w[k] || 0), 0);
const P = (a) => ({ f: som(a, 'f'), mosso: som(a, 'mosso'), multi: som(a, 'multi'), anon: som(a, 'anon') });
const V = P(out.verde), R = P(out.rosso);
const pc = (x, y) => y ? (100 * x / y).toFixed(2) + '%' : '—';
console.log(`\n=== IL PADRONE E' UNO SOLO — ${GIRI} giri per colore, alternati ===\n`);
for (const [n, s] of [['ROSSO (tre gate indipendenti)', R], ['VERDE (elezione unica)', V]])
  console.log(`  ${n.padEnd(30)} fotogrammi ${s.f} · si muove ${s.mosso} · DOPPIE SCRITTURE ${s.multi} (${pc(s.multi, s.mosso)}) · anonimi ${s.anon} (${pc(s.anon, s.mosso)})`);
for (const [n, arr] of [['ROSSO', out.rosso], ['VERDE', out.verde]]) {
  const pf = {};
  for (const w of arr) for (const [f, v] of Object.entries(w.perFase || {})) {
    const b = (pf[f] = pf[f] || { f: 0, mosso: 0, anon: 0, multi: 0 });
    b.f += v.f; b.mosso += v.mosso; b.anon += v.anon; b.multi += v.multi;
  }
  console.log(`\n  --- ${n}, per fase ---`);
  for (const [f, v] of Object.entries(pf))
    console.log(`  ${f.padEnd(12)} si muove ${String(v.mosso).padStart(5)} · anonimi ${String(v.anon).padStart(4)} (${pc(v.anon, v.mosso)}) · doppie ${v.multi}`);
}
const AV = out.verde.reduce((s2, w) => ({ tot: s2.tot + ((w._att || {}).tot || 0), nom: s2.nom + ((w._att || {}).nom || 0) }), { tot: 0, nom: 0 });
const AR = out.rosso.reduce((s2, w) => ({ tot: s2.tot + ((w._att || {}).tot || 0), nom: s2.nom + ((w._att || {}).nom || 0) }), { tot: 0, nom: 0 });
console.log(`\n  --- P2: il passatore NOMINATO diventa portatore ---`);
console.log(`  ROSSO (__CPM_NO556)  archi con un attore dichiarato ${AR.tot} · riconosciuti sul campo ${AR.nom}`);
console.log(`  VERDE                archi con un attore dichiarato ${AV.tot} · riconosciuti sul campo ${AV.nom} (${pc(AV.nom, AV.tot)})`);
const cop = {};
for (const w of out.verde) for (const [k, n] of Object.entries(w.coppie || {})) cop[k] = (cop[k] || 0) + n;
const rim = Object.entries(cop).sort((a, c) => c[1] - a[1]);
if (rim.length) { console.log(`\n  doppie rimaste nel verde:`); for (const [k, n] of rim) console.log(`    ${k}  x${n}`); }
const rossoVede = R.multi > 0;
const verdePulito = V.multi === 0;
console.log('');
if (!rossoVede) { console.log(`✗ NON SEPARATI — il rosso non mostra nessuna doppia scrittura: il guardiano non prova niente.`); process.exit(1); }
if (!verdePulito) { console.log(`✗ FAIL — il verde ha ancora ${V.multi} doppie scritture (il rosso ne aveva ${R.multi}).`); process.exit(1); }
if (AV.tot > 0 && AV.nom === 0) { console.log(`✗ FAIL — P2: ${AV.tot} archi dichiarano un passatore e NESSUNO e' stato riconosciuto sul campo.`); process.exit(1); }
if (AR.nom > 0) { console.log(`✗ NON SEPARATI — P2: il rosso riconosce ${AR.nom} passatori, ma __CPM_NO556 doveva spegnere il ponte.`); process.exit(1); }
console.log(`✓ PASS — P1: rosso ${R.multi} doppie scritture, verde 0. P2: ${AV.nom}/${AV.tot} passatori dichiarati riconosciuti (rosso ${AR.nom}).`);
