/* [collaudo 177 carriera 2] SONDA: «tocco il bottone X, il gioco risolve X?» — due bracci: tocco subito (150 ms) e tocco dopo la lettura (2500 ms).
   Usa le scene forzate del gate per ripetere in fretta; il bottone è cliccato col mouse come un dito. Solo collaudo. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, forceSituation } from './lib/harness.mjs';
process.env.CPM_CHROME = process.env.CPM_CHROME || '/opt/pw-browsers/chromium';
import fs from 'fs';
const N = +(process.env.N || 24); const arms = [150, 2500];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 100)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
const { total } = await openMatch(page, port, { name: 'SondaTocco' });
const out = [];
const norm = x => (x || '').replace(/(TIRO|PASSAGGIO|FISICO|TECNICA|VELOCITÀ|MENTALITÀ|DRIBBLING|POSIZIONAMENTO)\s*·\s*\d+.*$/, '').replace(/^\W+/, '').trim().toLowerCase();
for (const delay of arms) {
  for (let i = 0; i < N; i++) {
    const gi = (i * 7 + (delay === 150 ? 3 : 5)) % total;
    try {
      await forceSituation(page, gi, { settle: 500, choose: true });
      const fase = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      await sleep(delay);
      const rr = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent && x.textContent.trim().length > 5 && !/^(⏸|▶|\d(\.\d)?×|⚠️|Statistiche|Pagelle|▴|Scegli)/.test(x.textContent.trim())); const lista = bs.map(x => x.textContent.trim().replace(/\s+/g, ' ')); return { lista }; });
      if (!rr.lista.length) { out.push({ delay, gi, fase, vuoto: true }); continue; }
      const k = i % rr.lista.length;
      const pt = await page.evaluate(kk => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent && x.textContent.trim().length > 5 && !/^(⏸|▶|\d(\.\d)?×|⚠️|Statistiche|Pagelle|▴|Scegli)/.test(x.textContent.trim())); const q = bs[kk].getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, k);
      await page.mouse.click(pt.x, pt.y);
      await sleep(1800);
      const res = await page.evaluate(() => ({ o: window.__CPM_OUTCOME, ph: window.__CPM_PHASE && window.__CPM_PHASE() }));
      out.push({ delay, gi, fase, lista: rr.lista, k, click: rr.lista[k], outcome: res.o && { actionLabel: res.o.actionLabel, text: (res.o.text || '').slice(0, 120), ok: res.o.ok, key: res.o.outKey }, ph: res.ph });
    } catch (e) { out.push({ delay, gi, errore: String(e).slice(0, 120) }); }
  }
}
fs.writeFileSync(new URL('../../docs/collaudi/dati-carriera-177-2/sonda-tocco-bottone.json', import.meta.url), JSON.stringify(out, null, 1));
for (const delay of arms) {
  const r = out.filter(x => x.delay === delay && x.outcome); const mis = r.filter(x => { const a = norm(x.click), l = norm(x.outcome.actionLabel); return !(l && (l.slice(0, 9) === a.slice(0, 9) || a.includes(l.slice(0, 9)) || l.includes(a.slice(0, 9)))); });
  console.log(`braccio ${delay} ms: ${r.length} scene · mismatch ${mis.length}`); mis.slice(0, 8).forEach(x => console.log('   ', x.gi, '| click:', norm(x.click).slice(0, 30), '| risolto:', (x.outcome.actionLabel || '').slice(0, 34), '|', x.outcome.key));
}
console.log('errori pagina:', errs.length, errs.slice(0, 2));
await b.close(); srv.close();
