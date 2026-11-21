#!/usr/bin/env node
/* [giro 294 PO-556] SONDA (non guardiano): dove sta il pallone durante l'ingresso in campo e chi gli sta piu' vicino.
   Legge __CPM_OWN (pallone, ventidue ed eroe dalle MESH) ogni 400 ms per tutta la fase `walkout`, piu' i primi secondi di `playing`.
   Uso: node misura-294.mjs   (CPM_W/CPM_H quadro, CPM_NO294=1 braccio rosso, CPM_POS=ruolo per cambiare il ruolo dell'eroe) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
if (process.env.CPM_POS) SAVE.position = process.env.CPM_POS;
const DOPO = +(process.env.CPM_DOPO || 12), SALTA = +(process.env.CPM_SALTA || 0);
const W = +(process.env.CPM_W || 412), H = +(process.env.CPM_H || 915);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: W, height: H } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_PAL294W = []; if (o.r) window.__CPM_NO_G294 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: process.env.CPM_NO294 === '1' });
const out = { quadro: W + 'x' + H, ruolo: SAVE.position };
try {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  for (let k = 0; k < 60; k++) { const p = await ph(); if (p === 'walkout') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }); await sleep(700);
    if (SALTA === 1 && await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => /Salta l'ingresso/.test(b.textContent || '') && b.offsetParent !== null); if (x) { x.click(); return true; } return false; })) break; }
  await sleep(300); out.walk = (await ph()) === 'walkout';
  const S = []; const t0 = Date.now(); let dopo = 0, salt = 0;
  while (Date.now() - t0 < 480000) { const p = await ph(); if (p !== 'walkout') { if (++dopo > DOPO) break; }
    if (SALTA === 2 && p === 'walkout' && !salt && Date.now() - t0 > 6000) { salt = 1; await page.evaluate(() => { const x = document.querySelector('[data-cpm="salta-ingresso-v2"]'); if (x) x.click(); }); }
    const o = await page.evaluate(() => { try { const o = window.__CPM_OWN && window.__CPM_OWN(); const bq = window.__CPM_BALL && window.__CPM_BALL(); const st = window.__CPM_BALLQ ? null : null; return o ? { ...o, wy: bq && bq.worldY, p294: window.__CPM_PAL294 || null } : null; } catch (e) { return null; } });
    if (o) S.push({ t: +((Date.now() - t0) / 1000).toFixed(1), ph: p, ...o }); await sleep(400); }
  out.realeS = Math.round((Date.now() - t0) / 1000);
  const Wk = S.filter(s => s.ph === 'walkout'), Pl = S.filter(s => s.ph !== 'walkout');
  const riass = A => A.length ? { n: A.length, dMin: Math.min(...A.map(s => s.d)), dUlt: A[A.length - 1].d, vicinoUlt: A[A.length - 1].i, eroeEntro2: A.filter(s => s.i === -2 && s.d < 2).length, qualcunoEntro2: A.filter(s => s.d < 2).length, palla: [A[0].x, A[0].y, A[0].wy], pallaUlt: [A[A.length - 1].x, A[A.length - 1].y, A[A.length - 1].wy] } : null;
  out.ingresso = riass(Wk); out.dopo = riass(Pl); out.p294 = S.length ? S[S.length - 1].p294 : null;
  out.tracciaDopo = Pl.filter((_, i) => i % Math.max(1, Math.floor(Pl.length / 14)) === 0).map(s => [s.t, s.ph, s.c, s.x, s.y, s.i, s.d]);
  out.traccia = Wk.filter((_, i) => i % Math.max(1, Math.floor(Wk.length / 12)) === 0).map(s => [s.t, s.x, s.y, s.i, s.d]);
  await page.screenshot({ path: new URL('./out/misura-294-' + W + '.png', import.meta.url).pathname }).catch(() => {});
} catch (e) { out.errore = String(e.message).slice(0, 200); }
try { const Wt = await page.evaluate(() => window.__CPM_PAL294W || []); const per = f => { const A = Wt.filter(f); if (!A.length) return null; const m = A.reduce((x, y) => y.d < x.d ? y : x); return { n: A.length, dMinEroe: m.d, alMin: m, colla: A.filter(x => x.k).length, pallaFuoriCentro: A.filter(x => Math.hypot(x.b[0], x.b[2]) > 0.5).length, vMaxEroe: Math.max(...A.map(x => x.v)) }; };
  out.fasi = Wt.reduce((o, x) => (o[x.ph] = (o[x.ph] || 0) + 1, o), {}); out.gioco1 = Wt.filter(x => x.ph === 'playing' && x.c <= 6).filter((_, i, A) => i % Math.max(1, Math.floor(A.length / 10)) === 0).map(x => [x.c, x.d, x.k, x.b[0], x.b[2], x.h[0], x.h[1], x.v]);
  out.testimone = { ingresso: per(x => x.ph === 'walkout'), gioco: per(x => x.ph === 'playing'), primaColla: Wt.find(x => x.k) || null }; } catch (e) {}
out.errori = errs.slice(0, 3);
console.log('MISURA-294 ' + JSON.stringify(out));
await b.close(); srv.close();
