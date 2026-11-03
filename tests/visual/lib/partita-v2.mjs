/* [PO-302 · grafica V2, tappa 3] il banco della PARTITA: dal salvataggio save-194 (primavera, sett. 38) fino alla partita di carriera.
   apriPartitaV2(b, port, f, {rosso, errs, ingresso}) → { ctx, page } a fase 'playing' (o 'walkout' se ingresso:true).
   Passi successivi in pagina: forzaHL(page, gi) → hl_choose · finePartita(page) → 'ended' (orologio portato all'89'). */
import fs from 'node:fs';
import { installCdnRoutes, sleep } from './harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('../fixtures/save-194-primavera-w38.json', import.meta.url)));
export async function apriPartitaV2(b, port, f, { rosso = false, errs = [], ingresso = false, rossi = [] } = {}) {
  const opt = { viewport: { width: f.w, height: f.h }, serviceWorkers: 'block', deviceScaleFactor: 1 }; if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 140)}`));
  await page.addInitScript(([s, r, rs]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_V2 = true; for (const k of rs) window[k] = true; try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-match-speed', '1'); } catch (e) {} }, [SAVE, rosso, rossi]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
  await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
  await page.keyboard.press('Enter'); await sleep(1500); await page.keyboard.press('Enter');
  if (ingresso) { await page.waitForFunction(() => window.__CPM_PHASE() === 'walkout', null, { timeout: 30000 }).catch(() => {}); return { ctx, page }; }
  for (let i = 0; i < 40; i++) { await sleep(500); const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; }
  await page.waitForFunction(() => window.__CPM_PHASE() === 'playing', null, { timeout: 60000 });
  await sleep(1500);
  return { ctx, page };
}
export async function forzaHL(page, gi = 4) { await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(2500); }
export async function finePartita(page) {
  await page.evaluate(() => { try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} const s = window.__CPM_SCORE(); window.__CPM_SALTA297(88, Math.max(1, s.home), s.away); });
  for (let i = 0; i < 150; i++) { const ph = await page.evaluate(() => window.__CPM_PHASE());
    if (ph === 'ended') return true;
    await page.evaluate(ph => { const vis = b => b && b.offsetParent && !b.disabled && getComputedStyle(b).visibility !== 'hidden';
      const bs = [...document.querySelectorAll('button')].filter(vis);
      let x = null;
      if (ph === 'hl_choose') x = document.querySelector('[data-cpm="scelte-righe"] button') || document.querySelector('[data-sp292]') || bs.find(b => /^[⚡🎯🦶⚽]/.test((b.textContent || '').trim()));
      else if (ph === 'hl_move') x = bs.find(b => /Pronto/.test(b.textContent || ''));
      else if (ph === 'hl_result' || ph === 'ceremony') x = document.querySelector('[data-cpm="continua-hl-v2"]') || bs.find(b => /^(Continua|Salta)/.test((b.textContent || '').trim()));
      if (x && vis(x)) x.click(); }, ph);
    await sleep(800); }
  return false;
}
