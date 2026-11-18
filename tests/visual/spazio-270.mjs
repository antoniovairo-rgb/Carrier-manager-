#!/usr/bin/env node
/* [giro 270] GUARDIANO: nel post partita la riga «🧠 La tua scelta al N'» (riep259, PO-259) sta a SP.box dal riquadro dopo (regola PO-296).
   Misurato da spazio-296 sul telefono, su 7.999.196 e su lavoro/197: 14 px («1 distanze oltre 10 (14 div«🧠 La tua scelta al 90»)»), perche'
   il riquadro aveva margin-bottom 14 scritto a mano. Dal giro 270 spazio-296 arriva al fischio saltando all'85' e la scelta non nasce piu':
   qui la si PROVOCA. Banco: salvataggio save-194 (partita di carriera, post partita a schede del giro 200), telefono 412x915 e PC 1440x900;
   si gioca fino al 3', poi l'orologio va all'80' sull'1-1 (momento «pari dopo il 75'» di INT259) e si aspetta il fischio naturale
   (lib/fischio-270.mjs); l'autoplay risponde alla scheda del mister. Nel post partita si apre la scheda 2 (Avanti) e si misura la distanza
   verticale fra il fondo di riep259 e il primo riquadro visibile dopo di lui.
   VERDE: riep259 presente e distanza 6-10 px in ogni formato. ROSSO (__CPM_NO_G270): la distanza torna 14 (> 10) in ogni formato.
   «Non giudicato» (niente fischio, niente riga della scelta) = rosso. Uso: node spazio-270.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { aspettaFischio270 } from './lib/fischio-270.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const FORMATI = [{ k: 'tel', w: 412, h: 915, touch: true }, { k: 'pc', w: 1440, h: 900, touch: false }];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(f, rosso) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_SCMS681 = 1500; if (o.rosso) window.__CPM_NO_G270 = 1; localStorage.setItem('cpm-match-speed', '2'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save: SAVE, rosso });
  const out = { f: f.k, rosso, errs };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
    await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    out.pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2701, policy: 'seeded', tickMs: 300 }));
    out.fischio = await aspettaFischio270(page, { daMin: 3, aMin: 80, punteggio: { home: 1, away: 1 } });
    if (out.fischio.fase === 'ceremony') await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ended', null, { timeout: 30000 }).catch(() => {});
    await sleep(1500);
    out.schede = await page.evaluate(() => ((window.__CPM_S259 || {}).schede || []).map(x => x.min + "'" + x.fatto));
    for (let i = 0; i < 4; i++) { const vis = await page.evaluate(() => { const r = document.querySelector('[data-cpm="riep259"]'); return !!(r && r.offsetParent); }); if (vis) break;
      await page.evaluate(() => { const a = document.querySelector('[data-cpm="avanti200"]'); if (a) a.click(); }); await sleep(700); }
    out.misura = await page.evaluate(() => { const r = document.querySelector('[data-cpm="riep259"]'); if (!r || !r.offsetParent) return null;
      const rb = r.getBoundingClientRect(); const cand = [...document.querySelectorAll('div,section')].filter(x => x !== r && !r.contains(x) && !x.contains(r) && x.offsetParent && x.getBoundingClientRect().height > 8 && x.getBoundingClientRect().top >= rb.bottom - 1);
      cand.sort((a, c) => a.getBoundingClientRect().top - c.getBoundingClientRect().top); const n = cand[0];
      return { testo: (r.innerText || '').slice(0, 60), mb: getComputedStyle(r).marginBottom, dist: n ? Math.round((n.getBoundingClientRect().top - rb.bottom) * 10) / 10 : null, dopo: n ? (n.innerText || '').trim().slice(0, 30) : null }; });
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  await ctx.close(); return out;
}
const R = [];
for (const rosso of [false, true]) for (const f of FORMATI) { const o = await giro(f, rosso); R.push(o); console.log(`${rosso ? 'rosso' : 'verde'} ${f.k}: ${JSON.stringify({ pm: o.pm, fischio: o.fischio, schede: o.schede, misura: o.misura, errore: o.errore, errs: o.errs.slice(0, 2) })}`); }
await b.close(); srv.close();
const g = [];
for (const o of R) {
  const tag = `${o.rosso ? 'rosso' : 'verde'} ${o.f}`;
  if (!o.fischio || !o.fischio.fine) { g.push(`${tag}: non giudicato, niente fischio`); continue; }
  if (!o.misura || o.misura.dist == null) { g.push(`${tag}: non giudicato, riga della scelta assente (schede ${JSON.stringify(o.schede)})`); continue; }
  if (!o.rosso && !(o.misura.dist >= 6 && o.misura.dist <= 10)) g.push(`${tag}: distanza ${o.misura.dist} px fuori da 6-10`);
  if (o.rosso && !(o.misura.dist > 10)) g.push(`${tag}: il rosso non si vede (distanza ${o.misura.dist} px)`);
  if (!o.rosso && o.errs.length) g.push(`${tag}: errori di pagina ${o.errs[0]}`);
}
if (g.length) { console.log('❌ spazio-270 ROSSO — ' + g.join(' · ')); process.exit(1); }
console.log('✅ spazio-270 verde: riga della scelta a SP.box dal riquadro dopo (tel, pc) e col rosso torna oltre 10 px');
