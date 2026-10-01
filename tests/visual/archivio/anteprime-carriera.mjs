#!/usr/bin/env node
/* [23/09 POC] ANTEPRIME DELLA CARRIERA per la revisione col PO (a misura di telefono 412x915): guida una carriera vera con
   `__CPM_CAREER` e fotografa, alla prima comparsa, i momenti del procuratore (reminder, ingaggio, ambizione, firma, confronto,
   iniziativa) e la schermata di FINE STAGIONE (in alto e scorsa in basso). Scrive in tests/character-lab/anteprime-carriera/. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = path.resolve('../character-lab/anteprime-carriera'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = {
    phase: 'career', player: {
      name: 'Ciclo Procuratore', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 2, age: 22, ovr: 74,
      club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
      stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 73, tiro: 75, passaggio: 73, dribbling: 74, posizionamento: 73 },
      form: 72, morale: 70, fatigue: 10, popularity: 34, value: 9, bankBalance: 60000,
      hasAgent: false, contract: { duration: 3, wage: 4000, expiresAtSeason: 5, years: 3 },
    },
  };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);
const foto = async (n) => { await page.screenshot({ path: path.join(OUT, n + '.png') }); console.log('  foto ' + n); };
const leggi = () => page.evaluate(() => { try { const st = window.__CPM_CAREER.get() || {}; const a = st.ag || {}; return { s: st.season, w: st.week, has: !!a.has, hint: a.hint || null, checkin: !!a.checkin, init: a.init || null }; } catch (e) { return { err: String(e) }; } });
const clic = (re) => page.evaluate(r => { const b = [...document.querySelectorAll('button')].find(x => new RegExp(r, 'i').test(x.textContent || '')); if (!b) return false; b.click(); return true; }, re);
const visto = {}; let fine = false;
await foto('00-home');
for (let i = 0; i < 160 && !fine; i++) {
  const st = await leggi(); if (st.err) break;
  if (st.hint && !visto.hint) { visto.hint = 1; await foto('01-procuratore-reminder');
    if (await clic('Ingaggia')) { await sleep(600); await foto('02-procuratore-ingaggio');
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => /vincere|giocare|guadagnare|crescere|nome|Nazionale|straniero|legato|Champions/i.test(b.textContent || '')); if (bs[0]) bs[0].click(); });
      await sleep(500); await foto('03-procuratore-ambizione'); await clic('Firma'); await sleep(700); await foto('04-procuratore-firmato'); } }
  if (st.checkin && !visto.checkin) { visto.checkin = 1;
    /* [24/09] una finestra alla volta: il confronto aspetta in fila dietro intervista/verifica/momento -> prima si chiudono quelle */
    for (let k = 0; k < 8 && !(await page.evaluate(() => !!document.querySelector('[data-cpm="confronto23"]'))); k++) { await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (_e) {} }); await clic('Diplomatico|Accetto|Continua|Chiudi|Mi metta dove serve|Rimanda a dopo'); await sleep(500); }
    await foto('05-procuratore-confronto'); await clic("Sto benissimo|piu' importante|più importante|guardarci intorno|cambiare completamente"); await sleep(500); await foto('06-procuratore-confronto-risposta'); await clic('Chiudi'); await sleep(300); }
  if (st.init && !visto.init) { visto.init = 1; await foto('07-procuratore-iniziativa'); }
  const res = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
  if (res === 'seasonEnd') { await sleep(1500); await foto('08-gala');
    await clic('Apri la busta'); await sleep(1500); await foto('09-gala-busta');
    await clic('Salta il gala'); await sleep(1500); await foto('10-dopo-gala');
    for (let k = 0; k < 8; k++) { const t = await page.evaluate(() => (document.body.innerText || '').slice(0, 80).replace(/\n/g, ' | ')); console.log('   schermata: ' + t);
      if (/FINE STAGIONE|Riepilogo|Nuova stagione|Stagione successiva/i.test(await page.evaluate(() => document.body.innerText))) { await foto('11-fine-stagione'); 
        await page.evaluate(() => { const els = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 40 && getComputedStyle(d).overflowY !== 'visible'); els.forEach(d => d.scrollTop = d.scrollHeight / 2); }); await sleep(600); await foto('12-fine-stagione-meta');
        await page.evaluate(() => { const els = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 40 && getComputedStyle(d).overflowY !== 'visible'); els.forEach(d => d.scrollTop = d.scrollHeight); }); await sleep(600); await foto('13-fine-stagione-fondo'); break; }
      await foto('1' + k + '-passo'); if (!(await clic('Continua|Avanti|cerimonia|Vai'))) break; await sleep(1500); }
    fine = true; }
  await sleep(50);
}
console.log(JSON.stringify({ visto, fine, errori: errors.slice(0, 3) }));
await browser.close(); srv.close();
