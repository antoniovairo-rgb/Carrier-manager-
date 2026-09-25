#!/usr/bin/env node
/* [7.999.9] GUARDIANO DEL CARTELLINO (Passo 4, gesti 3D).
   A (node, motore da solo): il fallo SUBITO dall'eroe in scena passa dall'arbitro con la regola di ogni fallo (_cart913), e il
     cartellino a comando diventa un fatto del motore (evento di scena + ammonizioni nel tabellino avversario). Il fallo COMMESSO
     dall'eroe col cartellino deciso dalla partita finisce nel tabellino della sua squadra.
     Frequenza: su 400 falli subiti in scena i gialli devono stare nella banda della regola (un giallo ogni 4-9 falli).
   B (browser, GLB-ON, scena vera): forzato un dribbling con esito «fouled» e il giallo, l'arbitro raggiunge il colpevole (< 3,5 u),
     alza il braccio con la mano sopra la testa e il cartellino e' visibile.
   CPM_ROSSO=1 → __CPM_NO_CARTA9: niente cartellino in scena, deve andare ROSSO. */
import '../../prototipo/partita-vera/motore-v2.js'; import '../../prototipo/partita-vera/partita.js';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const MS = +(process.env.CPM_MS || 60000);
const fails = [];

/* A — motore da solo */
globalThis.window = ROSSO ? { __CPM_NO_CARTA9: 1 } : {};
{
  const nuova = seed => { const P = globalThis.creaPartita({ registra: false, v2: true, seed, casa: { sigla: 'CAS', forza: 70 }, ospite: { sigla: 'OSP', forza: 70 }, eroeLato: 'home', eroe: { nome: 'EROE', ovr: 74 } }); for (let k = 0; k < 60; k++) P.passo(); return P.motore; };
  const M = nuova(4242);
  globalThis.window.__CPM_FORZA_CARTA9 = 'yellow';
  const a0 = M.tabellino().away.ammonizioni;
  const out = M.risolviEroe.eventi('fouled', { rew: 'dribble', ok: false, cast: {} });
  const c = out.find(e => e.t === 'ammonizione');
  const a1 = M.tabellino().away.ammonizioni;
  console.log(`A · fallo subito con giallo a comando: evento ${c ? 'ammonizione a ' + (c.chi && c.chi.nome) + (c.scena ? ' (di scena)' : '') : 'assente'} · ammonizioni avversarie ${a0} → ${a1}`);
  if (!c || !c.scena || a1 !== a0 + 1) fails.push('A: il cartellino per il fallo subito dall\'eroe non diventa un fatto del motore');
  delete globalThis.window.__CPM_FORZA_CARTA9;
  const h0 = M.tabellino().home.ammonizioni;
  const out2 = M.risolviEroe.eventi('foul', { rew: 'recovery', ok: false, cast: {}, carta: 'yellow' });
  const h1 = M.tabellino().home.ammonizioni;
  console.log(`A · fallo dell'eroe col giallo della partita: ${out2.some(e => e.t === 'ammonizione' && e.chi && e.chi.eroe) ? 'ammonizione all\'eroe' : 'nessuna'} · ammonizioni ${h0} → ${h1}`);
  if (h1 !== h0 + 1) fails.push('A: il giallo dell\'eroe non entra nel tabellino del motore');
  let falli = 0, gialli = 0;
  for (let s = 1; s <= 400; s++) { const Mx = nuova(9000 + s); for (let k = 0; k < 1; k++) { falli++;/* un fallo per partita: ripeterli sullo stesso difensore misurerebbe il secondo giallo, che la regola rende raro */ const o = Mx.risolviEroe.eventi('fouled', { rew: 'dribble', ok: false, cast: {} }); if (o.some(e => e.t === 'ammonizione' || e.t === 'espulsione')) gialli++; } }
  const ogni = gialli ? falli / gialli : Infinity;
  console.log(`A · ${falli} falli subiti in scena → ${gialli} cartellini (uno ogni ${ogni.toFixed(1)} falli; regola della partita 5-6)`);
  if (!ROSSO && (ogni < 4 || ogni > 9)) fails.push(`A: frequenza dei cartellini fuori banda (uno ogni ${ogni.toFixed(1)} falli)`);
  if (ROSSO && gialli === 0) fails.push('A: nessun cartellino in scena');
}
delete globalThis.window;

/* B — scena vera, corpi 3D */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => { window.__CPM_REC = true; window.__CPM_CARTA9_REC = 1; if (r) window.__CPM_NO_CARTA9 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Carta9' });
for (let k = 0; k < 40; k++) { await sleep(1000); if (await page.evaluate(() => { const g = window.__CPM_GESTURE && window.__CPM_GESTURE(); return !!(g && g.glb); })) break; }
if (!await page.evaluate(() => { const g = window.__CPM_GESTURE && window.__CPM_GESTURE(); return !!(g && g.glb); })) { console.log('❌ SONDA CIECA: avatar GLB non montati'); await b.close(); srv.close(); process.exit(2); }
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 77, policy: 'seeded', tickMs: 300 }));
for (let k = 0; k < 40; k++) { await sleep(500); if (await page.evaluate(() => !!(window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ()))) break; }
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
const gis = await page.evaluate(() => { const out = []; const S = window.__CPM_SITS || []; for (let i = 0; i < S.length && out.length < 4; i++) { let h = null; try { h = window.deriveHL ? window.deriveHL(S[i], (S[i].actions || [])[0]) : null; } catch (e) {} if (h && h.type === 'dribble') out.push(i); }/* una scena di DRIBBLING vera: e' li' che nasce il fallo subito, col contrasto in scena */ return out; });
let W = null;
for (const gi of gis) {
  await page.evaluate(g => { window.__CPM_CARTA9 = null; window.__CPM_FORCE_KIND = 'fouled'; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORZA_CARTA9 = 'yellow'; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(1500);
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
  const t0 = Date.now();
  while (Date.now() - t0 < MS) { await sleep(1000); W = await page.evaluate(() => window.__CPM_CARTA9 || null); if (W && W.cartaVista > 5 && W.t > 3) break; }
  console.log(`B · gi${gi}: ${JSON.stringify(W)}`);
  if (process.env.CPM_DEBUG) console.log(JSON.stringify(await page.evaluate(() => ({ b2: (window.__CPM_B2EV || []).slice(-2), ph: window.__CPM_PHASE && window.__CPM_PHASE(), mot: !!(window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ()) }))));
  if (W && W.fotogrammi) break;
}
if (!W || !W.fotogrammi) fails.push('B: l\'arbitro non mostra nessun cartellino nella scena del fallo');
else {
  if (!(W.dist < 3.5)) fails.push(`B: l'arbitro resta a ${W.dist} u dal colpevole`);
  if (!(W.cartaVista > 0)) fails.push('B: il cartellino non e\' mai visibile');
  if (!(W.manoSopraTesta > 0)) fails.push(`B: la mano col cartellino non supera la testa (${W.manoSopraTesta})`);
  if (W.opp && !W.oppUguale && !W.dalContrasto) fails.push('B: il cartellino va a un corpo diverso da chi ha fatto il contrasto in scena');
  if (W.colore !== 'y') fails.push(`B: colore del cartellino ${W.colore}, atteso giallo`);
}
if (errors.length) fails.push('errori di pagina: ' + errors.slice(0, 2).join(' | '));
await b.close(); srv.close();
if (ROSSO) { const ok = fails.some(f => f.startsWith('A:')) && fails.some(f => f.startsWith('B:'));
  console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.9 il fallo in scena non ha cartellino' : '❌ il rosso non riproduce il vecchio comportamento\n  ' + fails.join('\n  ')); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL cartellino\n  ' + fails.join('\n  ') : '✅ PASS cartellino'); process.exit(fails.length ? 1 : 0);
