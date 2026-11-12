#!/usr/bin/env node
/* [giro 176 · PO-367 D1] PROVINI DI TAGLIA PER LA SCELTA DEL PO + foto PRIMA/DOPO.
   Stesse scene (una per famiglia d'azione), pagina nuova per ogni braccio (lezione 7.483), corpi veri (GLB) e teatro attivo.
   Bracci: rosso (__CPM_NO_G176 = regia di prima) · p · m (predefinita) · g (window.__CPM_TAGLIA176).
   Foto: «scelta» (hl_choose, scelte armate) e «gesto» (hl_result quando il TEMPO DI SCENA della finestra ha passato CPM_TG s —
   si aspetta un evento del gioco, non un orologio: in headless il tempo di scena scorre piu' lento del reale).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node regia-176-provini.mjs   [CPM_FMT=tel412|tel375|pc] [CPM_BRACCI=rosso,p,m,g] [CPM_OUT=<cartella>]
   Le foto sono PNG di lavoro (fuori dal repo); i JPEG e i fogli si fanno a parte (vedi rapporto giro 176). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
const FORMATI = { tel375: { width: 375, height: 812 }, tel412: { width: 412, height: 915 }, pc: { width: 1440, height: 900 } };
const FMT = process.env.CPM_FMT || 'tel412', BR = (process.env.CPM_BRACCI || 'rosso,p,m,g').split(','), TG = +(process.env.CPM_TG || 0.6);
const OUT = process.env.CPM_OUT || '/tmp/provini176'; fs.mkdirSync(OUT, { recursive: true });
const SCENE = (process.env.CPM_SCENE || 'tiro:92,cross:84,testa:44,rigore:58,punizione:81,passaggio:113,dribbling:150,difesa:133,costruzione:140').split(',').map(x => x.split(':'));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const misure = [];
for (const br of BR) {
  const ctx = await b.newContext({ viewport: FORMATI[FMT], deviceScaleFactor: 2, serviceWorkers: 'block' }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => console.log('  ⚠ pageerror', String(e.message || e).slice(0, 140)));
  await page.addInitScript(a => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'day'; if (a === 'rosso') window.__CPM_NO_G176 = true; else window.__CPM_TAGLIA176 = a; }, br);
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => console.log('  ⚠ GLB non pronto'));
  console.log(`== ${FMT} braccio ${br}`);
  for (const [nome, gi] of SCENE) {
    await page.evaluate(g => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_FORCE_SIT(+g, true); }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose' && [...document.querySelectorAll('[data-cpm="scelte-righe"] button')].some(x => getComputedStyle(x).visibility !== 'hidden'), null, { timeout: 15000 }).catch(() => {});
    await sleep(900);
    const s = await page.evaluate(() => window.__CPM_REGIA176()).catch(() => null);
    await page.screenshot({ path: path.join(OUT, `${FMT}-${nome}-${br}-1-scelta.png`) });
    await page.evaluate(() => window.__CPM_RESOLVE(0)).catch(() => {});
    const ok = await page.waitForFunction(t => { const r = window.__CPM_REGIA176 && window.__CPM_REGIA176(); return r && r.fase === 'hl_result' && r.g176 && r.g176.t >= t; }, TG, { timeout: 12000, polling: 50 }).then(() => true).catch(() => false);
    const g = await page.evaluate(() => window.__CPM_REGIA176()).catch(() => null);
    await page.screenshot({ path: path.join(OUT, `${FMT}-${nome}-${br}-2-gesto.png`) });
    const hS = s && !s.err ? +((s.piedi.y - s.testa.y) / s.vh * 100).toFixed(1) : null, hG = g && !g.err ? +((g.piedi.y - g.testa.y) / g.vh * 100).toFixed(1) : null;
    misure.push({ fmt: FMT, br, nome, gi: +gi, eroeScelta: hS, eroeGesto: hG, tScena: g && g.g176 ? g.g176.t : null, giudicata: ok });
    console.log(`  ${nome.padEnd(11)} gi${gi}: scelta ${hS}% · gesto ${hG}%${ok ? '' : ' (finestra NON raggiunta: non giudicata)'}`);
    for (let k = 0; k < 40; k++) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (!/^hl_/.test(String(ph))) break; await sleep(300); }
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, `misure-${FMT}.json`), JSON.stringify(misure, null, 1));
await b.close(); srv.close(); console.log('FINE provini', FMT, OUT);
