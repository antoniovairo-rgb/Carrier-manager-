#!/usr/bin/env node
/* [giro 211 · PO-473] FOTO prima/dopo (strumento, non guardiano): il caso del PO — ottavi di coppa europea, 0-0, fuori ai rigori.
   La domanda la sceglie la decisione vera (intervista183) sul salvataggio di prova S12; la finestra dell'intervista la apre il varco
   di collaudo __CPM_CAREER.forceIv183 (solo sonde). Braccio «prima» = window.__CPM_NO_G211. Uso: node interviste-211-foto.mjs <cartella> */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const DIR = process.argv[2] || '../../docs/sviluppo/giro211'; fs.mkdirSync(DIR, { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
for (const rosso of [true, false]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G211 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const q = await page.evaluate(() => {
    for (let sn = 1; sn < 300; sn++) {   /* la stagione in cui ai rigori si esce (stessi semi del gioco) */
      const sv = JSON.parse(localStorage.getItem('cpm-v3')); const p = { ...(sv.player || sv), season: sn, week: 20, ivMem183: null, euro: { phase: 'r16', competition: 'UCL' }, calendar: [{ week: 20, type: 'euro', euroPhase: 'r16', played: false }] };
      if (koShootoutWin(p, 'euroko|' + sn + '|r16')) continue;
      const r = { context: 'euro_ko', won: false, drew: true, homeScore: 0, awayScore: 0, isHome: true, goals: 0, assists: 0, rating: 5.6, opponent: 'FC Munchen' };
      const d = intervista183(p, { type: 'euro_ko', opponentName: r.opponent }, r);
      const i = d && d.si ? IV_FATTI183.indexOf(d.q) : -1;
      if (i >= 0) { window.__CPM_CAREER.forceIv183(i, 'draw', { hs: 0, as: 0, casa: true, voto: 5.6, gol: 0 }); return d.q.q; }
    }
    return null;
  });
  await sleep(1800);
  const f = `${DIR}/intervista-eliminazione-europea-${rosso ? 'prima' : 'dopo'}.png`;
  await page.screenshot({ path: f });
  console.log((rosso ? 'PRIMA' : 'DOPO') + ': «' + q + '» → ' + f);
  await ctx.close();
}
await b.close(); srv.close();
