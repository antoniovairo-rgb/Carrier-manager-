#!/usr/bin/env node
/* [giro 201 · PO-418 (G189-06)] GUARDIANO provini-201 — le offerte dei provini sono STABILI e SPIEGATE.
   Gioco vero, percorso del giocatore (SENZA ?cpmtest=1: la ripresa dei provini da cpm-trial-prog vale solo fuori dal banco).
   Si scrive la busta dei provini finiti (ph:"offers", tre risultati, slot 0) come la scrive il gioco, si apre l'app, si leggono le
   offerte; poi si RICARICA la pagina tre volte e si rileggono. Due casi: provini sotto la soglia (2 gol, voto 7,3 → due offerte) e
   sopra (8 gol, voto 8,5 → tre offerte).
   Verde: stesse offerte, nello stesso ordine, a ogni riapertura; la riga del motivo c'e', dice gol, voto, punti e la soglia, e
   nomina la lega delle offerte; il numero di offerte e' quello della regola; zero errori di pagina.
   Rosso window.__CPM_NO_G201 (sorteggio Math.random, nessun motivo) → DEVE essere bocciato.
   Uscita 0 solo se il verde passa E il rosso e' bocciato.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node provini-201.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro201'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const P = { name: 'Dario Ferrante', nation: 'Italia', avatarId: 0, age: 16, position: 'ATT', proStatus: 'u18', season: 1, week: 1,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 }, ovr: 60, totalGoals: 0, totalAssists: 0, totalMatches: 3 };
const CASI = [
  { id: 'sotto', res: [{ goals: 0, assists: 1, rating: 7.0 }, { goals: 0, assists: 1, rating: 7.0 }, { goals: 2, assists: 0, rating: 7.8 }], attese: 2, re: /2 gol e voto medio 7,3.*40,5 punti.*più di 50 punti.*mancavano 10.*Primavera 2/ },
  { id: 'sopra', res: [{ goals: 3, assists: 1, rating: 8.6 }, { goals: 3, assists: 0, rating: 8.4 }, { goals: 2, assists: 2, rating: 8.5 }], attese: 3, re: /8 gol e voto medio 8,5.*58,5 punti.*oltre la soglia di 50.*tre club/ },
];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function leggi(page) {
  await page.waitForFunction(() => !!document.querySelector('.cpm-offers'), null, { timeout: 60000 }); await sleep(600);
  return page.evaluate(() => {
    const nomi = [...document.querySelectorAll('.cpm-offers > *')].map(c => { const d = c.querySelector('div[style*="font-weight: 700"]') || c; return d.innerText.split('\n')[0].trim(); });
    const m = document.querySelector('[data-cpm="offerte201-motivo"]');
    return { nomi, motivo: m ? m.innerText.replace(/\s+/g, ' ') : null };
  });
}
try {
  for (const braccio of ['verde', 'rosso']) {
    const flag = braccio === 'rosso' ? '__CPM_NO_G201' : null;
    for (const c of CASI) {
      const page = await browser.newPage({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 });
      await installCdnRoutes(page);
      const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
      await page.addInitScript(([pl, res, f]) => { window.__CPM_GLB = false; if (f) window[f] = 1;
        if (!sessionStorage.getItem('p201')) { localStorage.clear(); localStorage.setItem('cpm-trial-prog', JSON.stringify({ ph: 'offers', p: pl, res, slot: 0 })); sessionStorage.setItem('p201', '1'); } }, [P, c.res, flag]);
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 60000 });
      const giri = [await leggi(page)];
      if (braccio === 'verde') await page.screenshot({ path: path.join(FOTO, `dopo-offerte-${c.id}-375.png`) });
      else await page.screenshot({ path: path.join(FOTO, `prima-offerte-${c.id}-375.png`) });
      for (let i = 0; i < 3; i++) { await page.reload({ waitUntil: 'load', timeout: 60000 }); giri.push(await leggi(page)); }
      const firme = giri.map(g => g.nomi.join(' | '));
      const stabili = firme.every(f => f === firme[0]) && giri[0].nomi.length > 0;
      const numero = giri[0].nomi.length === c.attese;
      const motivo = giri[0].motivo;
      console.log(`    ${braccio} ${c.id}: ${firme.map((f, i) => `giro ${i + 1}: ${f}`).join(' · ')}`);
      console.log(`       motivo «${motivo}» · errori ${errors.length}${errors.length ? ' ' + errors[0] : ''}`);
      const v = stabili && numero && !!motivo && c.re.test(motivo) && !errors.length;
      if (braccio === 'verde') ok(v, `verde ${c.id}: ${c.attese} offerte uguali in 4 aperture, motivo mostrato e coerente`);
      else ok(!v, `rosso ${c.id} bocciato (stabili ${stabili}, motivo ${!!motivo})`);
      await page.close();
    }
  }
} finally { await browser.close(); srv.close(); }
if (fails.length) { console.log(`\n❌ provini-201: ${fails.length} controlli falliti`); process.exit(1); }
console.log('\n✅ provini-201 verde'); process.exit(0);
