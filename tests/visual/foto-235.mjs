#!/usr/bin/env node
/* [giro 235] FOTO per il rapporto (non giudica): il Profilo dove cominciano i gruppi (o le fisarmoniche, col rosso) e la scheda
   Opzioni › Lettura, a 375 e 1366. Braccio «dopo» = gioco; braccio «prima» = window.__CPM_NO_G235.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node foto-235.mjs <cartella> */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, vai, opzioni } from './misura-234.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const OUT = process.argv[2] || 'out/foto-235'; fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
try {
  for (const [nome, flags] of [['dopo', []], ['prima', ['__CPM_NO_G235']]]) for (const w of [375, 1366]) {
    const a = await apri(b, port, w, { flags, h: w < 900 ? 667 : 800 });
    try {
      await vai(a.page, 'profile', 1300);
      /* il primo gruppo (o la prima fisarmonica dopo la figurina) in cima allo schermo */
      await a.page.evaluate(() => { const g = document.querySelector('[data-gruppo235]') || [...document.querySelectorAll('[data-cpm-fis]')][1]; if (g) g.scrollIntoView({ block: 'start' }); });
      await sleep(500); await a.page.screenshot({ path: path.join(OUT, `${nome}-${w}-profilo-gruppi.png`) });
      if (nome === 'dopo') { /* tutti i gruppi chiusi: i cinque nomi in una schermata */
        await a.page.evaluate(() => { for (const g of document.querySelectorAll('[data-gruppo235] > button[aria-expanded=true]')) g.click(); });
        await sleep(500); await a.page.evaluate(() => { const g = document.querySelector('[data-gruppo235]'); if (g) g.scrollIntoView({ block: 'center' }); });
        await sleep(400); await a.page.screenshot({ path: path.join(OUT, `${nome}-${w}-profilo-chiusi.png`) });
      }
      await vai(a.page, 'agente', 1000); await a.page.screenshot({ path: path.join(OUT, `${nome}-${w}-agente.png`) });
      await vai(a.page, 'dashboard', 800);
      const o = await opzioni(a.page, a.cdp);
      if (o.aperta) { await a.page.evaluate(() => { const c = document.querySelector('[data-cpm=lettura234]'); if (c) c.scrollIntoView({ block: 'center' }); }); await sleep(400);
        const c = await a.page.$('[data-cpm=lettura234]'); if (c) await c.screenshot({ path: path.join(OUT, `${nome}-${w}-lettura.png`) }); }
    } finally { await a.ctx.close(); }
  }
} finally { await b.close(); srv.close(); }
console.log('foto in ' + OUT);
