#!/usr/bin/env node
/* PROBE RILASCIO giro 2 (punto 4): quanto pesa il Babel in-browser. Misura il tempo da navigazione a React montato
   (#root popolato) per la SORGENTE (CARRIER-MANAGER-AV.html, Babel nel browser) e per la DIST WEB (dist-web/index.html,
   quella che il workflow deploy-pages serve), 3 caricamenti ciascuna, contesto nuovo ad ogni caricamento (cache fredda).
   Registra anche i messaggi Babel in console. Esito: solo misura. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const CASI = [['sorgente', 'CARRIER-MANAGER-AV.html'], ['dist-web', 'dist-web/index.html']];
const esito = {};
for (const [nome, file] of CASI) {
  esito[nome] = [];
  for (let k = 1; k <= 3; k++) {
    const ctx = await b.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const babel = []; page.on('console', m => { if (/babel/i.test(m.text())) babel.push(m.type()); });
    const t0 = Date.now();
    await page.goto(`http://localhost:${port}/${file}`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root') && document.getElementById('root').children.length > 0, null, { timeout: 90000 });
    const ms = Date.now() - t0;
    esito[nome].push({ ms, babelMsg: babel.length });
    console.log(`${nome} #${k}: montato in ${ms} ms · messaggi Babel in console: ${babel.length}${babel.length ? ' (' + babel.join(',') + ')' : ''}`);
    await ctx.close(); await sleep(300);
  }
}
for (const nome of Object.keys(esito)) {
  const v = esito[nome].map(x => x.ms).sort((a, b) => a - b);
  console.log(`MEDIANA ${nome}: ${v[1]} ms (min ${v[0]}, max ${v[2]})`);
}
await b.close(); srv.close();
