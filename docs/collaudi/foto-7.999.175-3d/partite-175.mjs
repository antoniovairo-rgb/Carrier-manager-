#!/usr/bin/env node
/* Collaudo 7.999.175: partite intere in autoplay (GLB acceso, 412x915). Modo 'nuova' = carriera nuova da openMatch (nessuna scelta di stile);
   modo 'mig' = salvataggio vecchio (fixtures/save-190, centravanti) migrato al caricamento. Sola lettura del prodotto.
   Uso: CPM_MODO=nuova CPM_ID=1 CPM_SEED=1571 node partite-175.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/col175-3d/tests/visual/lib/harness.mjs';
const MODO = process.env.CPM_MODO || 'nuova', ID = process.env.CPM_ID || '1', SEED = +(process.env.CPM_SEED || 1571), NOME = process.env.CPM_NOME || ('Coll175p' + ID);
const SCR = (process.env.CPM_SCR || '/tmp/p175/') + MODO + ID + '/'; fs.mkdirSync(SCR, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + String(e.message).slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
const R = { modo: MODO, id: ID, seed: SEED, nome: NOME };
if (MODO === 'nuova') {
  await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__CPM_REC = true; });
  await openMatch(page, port, { skipLoadAll: true, name: NOME });
  R.creazioneTesto = null;
} else {
  const sv = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/col175-3d/tests/visual/fixtures/save-190-s12-ovr93.json')); const pl = sv.player || sv; pl.name = process.env.CPM_NOMEFULL ? pl.name + ' ' + NOME : NOME; R.prima = { arch: pl.archetype, tratti: pl.tratti };
  await page.addInitScript(([s, SPD]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', SPD); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, process.env.CPM_SPEED || '1']);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 }); await sleep(2500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 90000 }).catch(async e => { await page.screenshot({ path: SCR + 'errore-carriera.png' }); console.log(await page.evaluate(() => document.body.innerText.slice(0, 600))); throw e; }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  R.dopoMig = await page.evaluate(() => { try { const p = JSON.parse(localStorage.getItem('cpm-v3')); const q = p.player || p; return { arch: q.archetype && (q.archetype.id || q.archetype.name), tratti: q.tratti, stilePrima75: q.stilePrima75, enfantPrima75: q.enfantPrima75, archetipoOrig: q.archetipoOrig }; } catch (e) { return String(e); } });
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
}
await page.evaluate(([s, tk]) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: tk }), [SEED, +(process.env.CPM_TICK || 300)]);
const t0 = Date.now(); let ph = null, sc = null, shots = 0; const hist = []; const seen = {}; let lastPhT = Date.now(), stuck = 0; const tl = new Map(); const esiti = []; let lastDom = '';
const foto = async (tag) => { if (shots >= 40) return; shots++; await page.screenshot({ path: `${SCR}${String(shots).padStart(2, '0')}-${tag}.png` }).catch(() => {}); };
const leggiTL = async () => { const t = await page.evaluate(() => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).map(e => JSON.stringify(e).slice(0, 400))).catch(() => []); for (const x of t) if (!tl.has(x)) tl.set(x, tl.size); };
let nHL = 0;
while (Date.now() - t0 < 480000) {
  const s = await page.evaluate(() => ({ p: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK && window.__CPM_CLOCK(), sc: window.__CPM_SCORE ? JSON.stringify(window.__CPM_SCORE()) : null })).catch(() => ({}));
  await leggiTL();
  if (s.p !== ph) { hist.push([s.p, s.c, Math.round((Date.now() - t0) / 1000), s.sc]); lastPhT = Date.now();
    if (s.p === 'hl_result') { nHL++; const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 500)).catch(() => ''); await sleep(1200); esiti.push({ min: s.c, testo: txt }); if (nHL <= 8) await foto('hl_result-' + s.c); }
    else if (s.p === 'hl_choose' && nHL < 4) { await sleep(300); await foto('hl_choose-' + s.c); }
    ph = s.p; if (s.p === 'ended' || s.p === 'ceremony') { break; } }
  if (s.sc && s.sc !== sc) { if (sc != null) { await sleep(1000); await foto('gol-' + s.c + '-' + s.sc.replace(/[^0-9a-z]/gi, '')); } sc = s.sc; }
  if (s.p === 'playing' && s.c) { for (const m of [25, 50, 70, 85]) if (s.c >= m && !seen['c' + m]) { seen['c' + m] = 1; await foto('cronaca-' + s.c); } }
  if (Date.now() - lastPhT > 90000) { stuck++; lastPhT = Date.now(); await foto('fermo-' + s.p); if (stuck >= 2) break; }
  await sleep(150);
}
R.fasiFine = ph; R.durataS = Math.round((Date.now() - t0) / 1000); R.hist = hist; R.esiti = esiti;
// dopo il fischio: dati del motore e DOM, poi avanza fra le schermate
await sleep(1500); await foto('fine');
const motore = async () => page.evaluate(() => {
  const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ();
  let pag = null, golLog = null; try { pag = M && M.pagelle ? (M.pagelle() || []).map(p => ({ eroe: !!p.eroe, i: p.i, gol: p.gol, ass: p.ass, voto: p.voto })).filter(p => p.eroe || p.gol) : null; golLog = M && M._S && M._S._golLog ? M._S._golLog.map(g => ({ m: g.m || g.min, chi: g.chi, scena: !!g.scena, t: g.team || g.lato })) : null; } catch (e) { pag = String(e); }
  return { pag, golLog, golEroe: window.__CPM_GOLEROE228, pag75: window.__CPM_PAG75, score: window.__CPM_SCORE && window.__CPM_SCORE(), fase: window.__CPM_PHASE && window.__CPM_PHASE() };
}).catch(e => ({ err: String(e) }));
R.motore1 = await motore();
R.schermate = [];
for (let i = 0; i < 10; i++) {
  const txt = await page.evaluate(() => document.body.innerText.replace(/[ \t]+/g, ' ').replace(/\n+/g, ' | ').slice(0, 2500)).catch(() => '');
  R.schermate.push(txt); await foto('schermata-' + i);
  const sc2 = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
  if (/Pagella|pagella/.test(txt) && i > 0) { /* resta */ }
  const ok = await page.getByText('Continua', { exact: false }).first().click({ timeout: 2500 }).then(() => true).catch(() => page.getByText('Salta premiazione', { exact: false }).first().click({ timeout: 2500 }).then(() => true).catch(() => false));
  if (!ok) break; await sleep(2500);
  R.motore2 = await motore();
}
R.motoreFin = await motore();
R.tlJson = [...tl.keys()];
R.errs = [...new Set(errs)];
fs.writeFileSync(SCR + 'dati.json', JSON.stringify(R, null, 1));
console.log(`${MODO}${ID}: ${R.durataS}s fase ${R.fasiFine} score ${JSON.stringify(R.motoreFin.score)} pagella ${JSON.stringify(R.motoreFin.pag)} golEroe228 ${R.motoreFin.golEroe} fasi: ${hist.map(h => h[0]).join('>').slice(0, 300)} errs ${R.errs.length}`);
await Promise.race([b.close(), sleep(5000)]); srv.close(); process.exit(0);
