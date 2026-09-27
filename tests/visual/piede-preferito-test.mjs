#!/usr/bin/env node
/* [7.999.31 guardiano — IL PIEDE PREFERITO SCEGLIE LA CLIP DELL'EROE. Decisione PO 26/09 «mancino: specchiati tiri, passaggi, cross e rigori»]
   Due pagine, eroe mancino (L) e destro (R) forzati con __CPM_FORCE_PIEDE31, stesse N scene di tiro risolte: il testimone __CPM_PIEDE31
   conta le clip montate sull'eroe per gesto. Il mancino deve calciare SOLO con clip sinistre (kick, pass, penalty~m), il destro SOLO con
   clip destre (kick~m, pass~m, penalty). Rosso: CPM_RED=1 accende __CPM_NO_PIEDE31 → torna il sorteggio → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1', N = +(process.env.CPM_N || 6);
const PIEDE = { 'kick': 'L', 'kick~m': 'R', 'pass': 'L', 'pass~m': 'R', 'penalty': 'R', 'penalty~m': 'L', 'mx-kick-soccerball': 'L', 'mx-kick-soccerball-2': 'R' };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
for (const F of ['L', 'R']) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(c => { window.__CPM_FORCE_PIEDE31 = c.F; if (c.red) window.__CPM_NO_PIEDE31 = 1; }, { F, red: RED });
  await openMatch(page, port, { name: 'Piede31' }); await sleep(1500);
  /* le clip specchiate nascono quando arriva il pacchetto Mixamo: prima esiste solo la clip base. In partita la prima scena cade dopo l'8'. */
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, { timeout: 60000 }).catch(() => {});
  const GIS = await page.evaluate(L => { const o = [], S = window.__CPM_SITS || []; for (let i = 0; i < S.length && o.length < L; i++) { const s = S[i]; if (s && s.actions && s.actions[0] && s.actions[0].rew === 'goal' && !s.def) o.push(i); } return o; }, N);
  for (const gi of GIS) {
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(600);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
    await sleep(4500);
    if (process.env.CPM_VERB) console.log('  gi' + gi, JSON.stringify(await page.evaluate(() => (window.__CPM_PIEDE31 || {}).scelte || null)));
  }
  const W = await page.evaluate(() => window.__CPM_PIEDE31 || null);
  await page.close();
  const tot = {}; let giusti = 0, sbagliati = 0;
  for (const g in (W && W.scelte) || {}) for (const n in W.scelte[g]) { const p = PIEDE[n]; tot[n] = (tot[n] || 0) + W.scelte[g][n]; if (p === F) giusti += W.scelte[g][n]; else if (p) sbagliati += W.scelte[g][n]; }
  console.log(`piede ${F}: ${JSON.stringify(tot)} · giusti ${giusti} · sbagliati ${sbagliati}`);
  ok(!errs.length, `piede ${F}: nessun errore di pagina ${errs.slice(0, 1).join('')}`);
  ok(giusti >= 2, `piede ${F}: almeno 2 gesti di calcio dell'eroe misurati (${giusti})`);
  ok(sbagliati === 0, `piede ${F}: nessuna clip del piede sbagliato (${sbagliati})`);
}
await b.close(); srv.close();
if (err.length) { console.log('\nPIEDE PREFERITO: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nPIEDE PREFERITO: PASS'); process.exit(0);
