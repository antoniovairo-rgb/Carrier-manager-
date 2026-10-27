#!/usr/bin/env node
/* [collaudo grafico 178 · PO-299] PARTITA di carriera dal vivo (pre-partita → formazioni → ingresso → gioco 2D → highlight → fischio finale → tabellino/pagelle → cerimonie),
   GLB acceso, con foto a ogni cambio di fase e misure D(). Formato: C178_FORMATO (tel|tabv|tabo|pc). Non tocca src/. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { D, FORMATI, SCRATCH, sintesiGap } from './c178-graf-lib.mjs';
import { INIT } from './lib/banco-g0.mjs';
const f = FORMATI[process.env.C178_FORMATO || 'tel']; const MAXS = +(process.env.C178_MAX_S || 420);
const OUT = path.join(SCRATCH, 'partita', f.k); fs.mkdirSync(OUT, { recursive: true });
const SAVE_PARTITA = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = [];
const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [], save: SAVE_PARTITA }); await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000); await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
let n = 0; const log = []; const visti = {};
const snap = async (tag, { misura = true } = {}) => { n++; const id = String(n).padStart(2, '0') + '-' + tag; const p = path.join(OUT, id + '.jpg');
  try { await page.screenshot({ path: p, type: 'jpeg', quality: 60, timeout: 40000 }); } catch (e) {}
  let m = null; if (misura) { try { m = await page.evaluate(D, f.touch); m.gap = sintesiGap(m); delete m.gaps; } catch (e) {} }
  log.push({ id, tag, foto: p, m: m && { overlay: m.overlay, hs: m.hs, nFuori: m.nFuori, fuori: m.fuori, nPiccoli: m.nPiccoli, piccoli: m.piccoli, tagliati: m.tagliati, nTagliati: m.nTagliati, sovTesti: m.sovTesti, minFs: m.minFs, figurine: m.figurine, gap: m.gap, sovr: m.sovr, testoLen: m.testoLen } });
  process.stdout.write(`  ${f.k} ${id.padEnd(28)} ${m ? `tasti<40:${m.nPiccoli} tagl:${m.nTagliati} sovT:${m.sovTesti.length} fuori:${m.nFuori} hs:${m.hs} minFs:${m.minFs}` : ''}\n`); };
const fase = () => page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }).catch(() => null);
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(400);
await snap('dashboard-prima');
const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch()); console.log('playMatch', pm);
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 40000 }); await sleep(1200);
let prev = null, t0 = Date.now(), nOgni = {}, autoOn = false, walk = 0, ceremony = 0;
while ((Date.now() - t0) / 1000 < MAXS) {
  const ph = await fase(); if (!ph) { await sleep(500); continue; }
  const k = ph; nOgni[k] = nOgni[k] || 0;
  if (ph !== prev) { nOgni[k]++; prev = ph;
    const lim = { matchday: 2, formations: 2, walkout: 6, playing: 6, hl_intro: 4, hl_move: 4, hl_choose: 4, hl_result: 4, ended: 3, ceremony: 5 }[ph] || 2;
    if (nOgni[k] <= lim) { await sleep(ph === 'playing' ? 2500 : 900); await snap(`${ph}-${nOgni[k]}`); } }
  if (ph === 'matchday') { await page.keyboard.press('Enter').catch(() => {}); await sleep(900); }
  else if (ph === 'formations') { await page.keyboard.press('Enter').catch(() => {}); await sleep(900); }
  else if (ph === 'walkout') { walk++; if (walk === 3 || walk === 8 || walk === 14 || walk === 20) await snap(`ingresso-t${walk}`); if (walk > 24) { const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); } await sleep(900); }
  else if (ph === 'playing') { if (!autoOn) { autoOn = true; await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 })).catch(() => {}); }
    /* 2D: apri pannello statistiche una volta */ await sleep(1200); }
  else if (ph === 'ended' || ph === 'ceremony') { ceremony++; if (ceremony === 3 || ceremony === 8) await snap('ended-' + ceremony); if (ph === 'ended' && ceremony === 4) { /* tab del post-partita */
      const tabs = await page.evaluate(() => [...document.querySelectorAll('button,[role=tab]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map(e => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)).filter(Boolean)); log.push({ tag: 'bottoni-ended', tabs });
      for (const rx of ['Statistiche', 'Pagelle', 'Tabellino', 'Cronaca', 'Highlights?|Momenti']) { const ok = await premiRx(rx); if (ok) { await sleep(700); await snap('ended-' + rx.replace(/\W.*/, '')); } } }
    if (ceremony > 30) break; await sleep(1500); }
  else await sleep(700);
}
async function premiRx(rx) { return page.evaluate(s => { const r = new RegExp(s); const x = [...document.querySelectorAll('button,[role=tab]')].find(y => { const rc = y.getBoundingClientRect(); return rc.width > 0 && r.test((y.textContent || '').trim()); }); if (x) { x.click(); return true; } return false; }, rx).catch(() => false); }
fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify({ f: f.k, log, errs, fasi: nOgni, secondi: Math.round((Date.now() - t0) / 1000) }));
console.log('fasi viste', JSON.stringify(nOgni), 'errori', errs.slice(0, 4)); await b.close(); srv.close();
