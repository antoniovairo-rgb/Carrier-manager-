#!/usr/bin/env node
/* 7.538 — «PARTITA GIA' GIOCATA», 9ª ricorrenza: riproduzione dal SALVATAGGIO REALE del PO (S.7 W.37).
   Lo stato è coerente (Blucerchiati md33 played=true, registro e classifica a 33, resta la FINALE UCL
   vs FC Amsterdam md999). Si carica il save e si chiede al gioco che partita propone. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const SAVE = JSON.parse(fs.readFileSync('/root/.claude/uploads/6dd74479-f58d-5f3f-a846-19342f6001fd/f3d93dec-cpmSamuelitoVairoS7_1.json', 'utf8'));
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERROR', String(e.message).slice(0, 140)));
await page.addInitScript(sv => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, SAVE);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
await sleep(1200);
const r = await page.evaluate(() => {
  const md = window.__CPM_CAREER.thisWeekMd();
  const g = window.__CPM_CAREER.get ? window.__CPM_CAREER.get() : null;
  return { md, week: (g && g.week) || null };
});
console.log('settimana corrente:', r.week);
console.log('partita proposta da getThisWeekMatchday():', JSON.stringify(r.md));
const txt = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 700));
console.log('--- schermata ---'); console.log(txt);
await page.screenshot({ path: '/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad/ripeti-538.png' });
await b.close(); srv.close();
