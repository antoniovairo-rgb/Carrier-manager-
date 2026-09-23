/* [23/09] TABELLINO CONTRO TABELLONE. Vision test del PO-giocatore: risultato 2-1 ma «Gol 2 — 2» nel tabellino della gara.
   Il tabellone legge `__CPM_SCORE` (stato del punteggio), il tabellino legge il MOTORE (`__CPM_MOTORE_OBJ().tabellino()`),
   il registro eventi `__CPM_EV` annota ogni gol col suo percorso. Questa sonda gioca partite vere (scelte via hook, «Continua»
   premuto come un giocatore, velocita' 2x) e a ogni cambio di uno dei tre annota i tre valori, cosi' si vede QUALE canale
   diverge e QUANDO. CPM_PARTITE (default 2), CPM_BASE=1 per la partita normale (default: review CGTrader). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const PARTITE = Number(process.env.CPM_PARTITE || 2), BASE = process.env.CPM_BASE === '1', ROSSO = process.env.CPM_ROSSO || '';
const server = await startServer(); const browser = await launchBrowser();
const esiti = [];
for (let p = Number(process.env.CPM_DA || 0); p < PARTITE; p++) {
  const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
  if (process.env.CPM_1X === '1') await page.addInitScript(() => { window.__cpm1x = 1; });
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__CPM_REC = 1; window.__CPM_GOLPERSO_REC = 1; try { if (!window.__cpm1x) localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} if (r) window[r] = true; }, ROSSO);
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: process.env.CPM_NOME || ('Tabellino ' + p), query: BASE ? {} : { hyperCharacter: 'cgtrader-highlight-optimized' } });
  const log = []; let prev = ''; const t0 = Date.now(); let hl = 0;
  while (Date.now() - t0 < Number(process.env.CPM_SEC || 270) * 1000) {
    const s = await page.evaluate(() => { const _m = window.__CPM_MOTORE_OBJ ? !!window.__CPM_MOTORE_OBJ() : 'nohook';
      let tab = null; try { const m = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const t = m && m.tabellino && m.tabellino(); tab = t ? { h: t.home.gol, a: t.away.gol } : null; } catch (e) {}
      const EV = typeof window.__CPM_EV === 'function' ? window.__CPM_EV() : (window.__CPM_EV || []); const ev = (EV || []).filter(e => e && (e.ev === 'goal' || e.ev === 'esito')).map(e => ({ ev: e.ev, min: e.min, side: e.side, src: e.src, key: e.key, ok: e.ok }));
      return { motore: _m, fase: window.__CPM_PHASE?.() || null, min: window.__CPM_STATE?.()?.minute ?? null, score: window.__CPM_SCORE ? window.__CPM_SCORE() : null, tab, evGol: ev.length, ev: ev.slice(-3) };
    }).catch(() => null);
    if (!s) break;
    const k = JSON.stringify([s.score, s.tab, s.evGol]);
    if (k !== prev) { prev = k; log.push({ t: Math.round((Date.now() - t0) / 1000), ...s }); }
    if (s.fase === 'ended') break;
    if (s.fase === 'hl_choose') { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k % 3), hl++).catch(() => {}); await sleep(2500); }
    if (s.fase === 'hl_result') { await sleep(3500); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Continua/i.test(x.textContent || '')); if (b) b.click(); }).catch(() => {}); }
    await sleep(500);
  }
  const testimoni = await page.evaluate(() => ({ golPersi: window.__CPM_GOLPERSO || [], intx669: (window.__CPM_INTX669 || []).slice(-40) })).catch(() => ({}));
  console.log('  testimoni:', JSON.stringify(testimoni).slice(0, 1500));
  const fine = log.at(-1) || {};
  const diverge = log.filter(l => l.score && l.tab && (l.score.home !== l.tab.h || l.score.away !== l.tab.a));
  esiti.push({ partita: p, finale: { score: fine.score, tabellino: fine.tab, fase: fine.fase }, divergenze: diverge.length, testimoni, primaDivergenza: diverge[0] || null, log });
  console.log(`partita ${p}: tabellone ${JSON.stringify(fine.score)} · tabellino motore ${JSON.stringify(fine.tab)} · campioni divergenti ${diverge.length} · fase ${fine.fase}`);
  await page.close();
}
fs.writeFileSync(path.join(here, `tabellino-coerenza${BASE ? '-base' : ''}${ROSSO ? '-rosso' : ''}.json`), JSON.stringify(esiti, null, 1));
await browser.close(); server.close();
