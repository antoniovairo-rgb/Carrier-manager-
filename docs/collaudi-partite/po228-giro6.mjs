/* PO-228 zona B — giro 6: statistiche a 86' con la TABELLA aperta (righe PASSAGGI/CROSS). Sola lettura sul gioco.
   Correzione rispetto al giro 5: il pannello «linguette918» nasce CHIUSO (chevron aria-label «Mostra»); il tab
   «Statistiche» cambia solo la vista. Senza aprire il pannello, `stat77` (la tabella) non esiste nel DOM.
   Alle 86' si apre il pannello, si sceglie il tab Statistiche e si legge il TESTO del contenitore `stat77`.
   Uso: FROM=1 TO=1 OUT=file.jsonl node po228-giro6.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('../../tests/visual/fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FROM = +(process.env.FROM || 1), TO = +(process.env.TO || 10), OUT = process.env.OUT || 'po228-giro6.jsonl';
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apriStat(page) { // 1) pannello chiuso → chevron «Mostra»; 2) tab «Statistiche» dentro le linguette
  await page.locator('button[aria-label="Mostra"]').first().click({ timeout: 3000 }).catch(() => {});
  await sleep(300);
  await page.locator('[data-cpm="linguette918"] button').filter({ hasText: /^statistiche$/i }).first().click({ timeout: 3000 }).catch(() => {});
  await sleep(500);
}
async function leggiStat(page) { // testo grezzo della TABELLA (stat77), null se assente
  return page.evaluate(() => { const e = document.querySelector('[data-cpm="stat77"]'); return e ? e.innerText : null; });
}
for (let k = FROM; k <= TO; k++) {
  const t0 = Date.now(); const rec = { k, name: null, err: null, lettura86: null, fine: null, fischio: false, scoreFine: null, tabFine: null, statFine: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' PO228-' + k; rec.name = pl.name;
    await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    // snapshot DENTRO la pagina: scatta al primo istante in cui il cronometro e' 86 (polling a 5 ms, il minuto dura 150 ms)
    await page.evaluate(() => {
      window.__PO228_86 = null;
      const iv = setInterval(() => {
        try {
          const m = window.__CPM_CLOCK ? window.__CPM_CLOCK() : null;
          if (m != null && m >= 86) {
            clearInterval(iv);
            const e = document.querySelector('[data-cpm="stat77"]');
            window.__PO228_86 = { min: m, phase: window.__CPM_PHASE ? window.__CPM_PHASE() : null, score: window.__CPM_SCORE ? window.__CPM_SCORE() : null,
              tab: e ? e.innerText : null, riep: document.body.innerText.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 60).join('\n') };
          }
        } catch (err) { clearInterval(iv); window.__PO228_86 = { err: String(err) }; }
      }, 5);
    });
    const tp = Date.now(); let ph = ''; let apertoStat = false;
    while (Date.now() - tp < 420000) {
      ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'ended' || ph === 'ceremony') break;
      const snap = await page.evaluate(() => window.__PO228_86);
      if (snap) { rec.lettura86 = snap; break; }
      const min = await page.evaluate(() => (window.__CPM_CLOCK ? window.__CPM_CLOCK() : null));
      if (!apertoStat && min != null && min >= 2 && ph === 'playing') { await apriStat(page); apertoStat = true; }
      await sleep(300);
    }
    rec.fine = ph; await sleep(2500);
    let txt = '';
    for (let i = 0; i < 10; i++) {
      txt = await page.evaluate(() => document.body.innerText);
      if (txt.includes('TABELLINO DELLA GARA')) break;
      await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
      await sleep(2500);
    }
    rec.fischio = txt.includes('FISCHIO FINALE');
    rec.scoreFine = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
    rec.tabellinoFine = txt.slice(Math.max(0, txt.indexOf('TABELLINO DELLA GARA')), txt.indexOf('TABELLINO DELLA GARA') + 2500);
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  console.log(`k${k} fine=${rec.fine} fischio=${rec.fischio} tabella86=${rec.lettura86 && rec.lettura86.tabella ? 'SI' : 'NO'} ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''}`);
  await ctx.close();
}
console.log('FINE');
await b.close(); srv.close();
