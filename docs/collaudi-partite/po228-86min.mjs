/* PO-228 zona B — statistiche a 86' su 10 partite vere (sessione collaudatrice 2, sola lettura sul gioco).
   Stesso flusso di po228-partite.mjs (salvataggio S12, nome PO228-k, autoplay seedato, tickMs 150, speed 4).
   In partita: si apre il pannello «Statistiche» e si legge il suo testo quando __CPM_CLOCK() arriva a 86.
   A fine partita: tabellino finale dal DOM (come il giro 4). Testo grezzo salvato per ogni lettura.
   Uso: FROM=1 TO=10 OUT=file.jsonl node po228-86min.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('../../tests/visual/fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FROM = +(process.env.FROM || 1), TO = +(process.env.TO || 10), OUT = process.env.OUT || 'po228-86min.jsonl';
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const numRe = /^-?\d+(\.\d+)?%?$/;
function righe(txt) { // coppie [voce, mio, loro] dal blocco «Passaggi»…: si cerca la voce e i due valori che la seguono
  const L = txt.split('\n').map(s => s.trim()).filter(Boolean); const out = {};
  for (let j = 0; j + 2 < L.length; j++) if (numRe.test(L[j]) && !numRe.test(L[j + 1]) && numRe.test(L[j + 2])) out[L[j + 1]] = { mine: L[j], loro: L[j + 2] };
  return out;
}
for (let k = FROM; k <= TO; k++) {
  const t0 = Date.now(); const rec = { k, name: null, err: null, lettura86: null, fine: null, fischio: false, tabFine: null, score86: null, scoreFine: null };
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
    const tp = Date.now(); let ph = ''; let aperto = false;
    while (Date.now() - tp < 420000) {
      ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'ended' || ph === 'ceremony') break;
      const min = await page.evaluate(() => (window.__CPM_CLOCK ? window.__CPM_CLOCK() : null));
      if (min != null && min >= 86 && !rec.lettura86) {
        if (!aperto) { try { await page.getByText('Statistiche', { exact: true }).first().click({ timeout: 3000 }); aperto = true; } catch (e) {} await sleep(400); }
        const txt = await page.evaluate(() => document.body.innerText);
        rec.lettura86 = { min, phase: ph, score: await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE()), righe: righe(txt), raw: txt.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 400).join('\n') };
      }
      await sleep(400);
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
    const i0 = txt.indexOf('TABELLINO DELLA GARA');
    rec.tabFine = i0 < 0 ? null : righe(txt.slice(i0, txt.indexOf('IL TUO TABELLINO IN NUMERI', i0) > 0 ? txt.indexOf('IL TUO TABELLINO IN NUMERI', i0) : undefined));
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  console.log(`k${k} fine=${rec.fine} fischio=${rec.fischio} lettura86=${rec.lettura86 ? rec.lettura86.min + '/' + rec.lettura86.phase + '/righe' + Object.keys(rec.lettura86.righe).length : 'NO'} ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''}`);
  await ctx.close();
}
console.log('FINE');
await b.close(); srv.close();
