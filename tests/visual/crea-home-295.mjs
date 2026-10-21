#!/usr/bin/env node
/* [7.999.177 PO-295 guardiano] «Da qui non si può tornare alla home» (creazione del calciatore, telefono).
   Pagina pulita a 412 e 1280 px: «Nuova carriera» → schermata «Crea il tuo calciatore» → c'e' [data-cpm=crea295-home] visibile
   nella prima schermata (senza scorrere) → il click riporta alla home (torna «Nuova carriera»), senza errori di pagina.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_IND295 e pretende che il controllo cada. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function prova(w, rosso) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 600 ? 915 : 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_IND295 = 1; });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  const nuova = () => page.evaluate(() => [...document.querySelectorAll('button')].some(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')));
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera/.test(x.textContent || '')), null, { timeout: 60000 });
  await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')).click());
  await page.waitForFunction(() => /Crea il tuo calciatore/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  await sleep(400);
  const ko = [];
  if (!/Crea il tuo calciatore/.test(await page.evaluate(() => document.body.innerText))) ko.push(`${w}px: la creazione non si apre`);
  const btn = await page.evaluate(() => { const e = document.querySelector('[data-cpm="crea295-home"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight, w: r.width }; });
  if (!btn) ko.push(`${w}px: nessun pulsante per tornare alla home`);
  else {
    if (btn.bottom > btn.h || btn.top < 0 || btn.w < 40) ko.push(`${w}px: pulsante fuori dalla prima schermata (${JSON.stringify(btn)})`);
    await page.click('[data-cpm="crea295-home"]'); await sleep(600);
    if (!(await nuova())) ko.push(`${w}px: il pulsante non riporta alla home`);
  }
  if (errs.length) ko.push(`${w}px: errori di pagina: ${errs.slice(0, 2).join(' | ')}`);
  await ctx.close(); return ko;
}
let ok = true;
for (const w of [412, 1280]) { const ko = await prova(w, false); ko.forEach(k => console.log('  ❌ ' + k)); if (ko.length) ok = false; else console.log(`  ✅ ${w}px: «← Home» visibile e funzionante`); }
if (process.env.CPM_PROVA_ROSSO) { const ko = await prova(412, true); if (!ko.length) { console.log('  ❌ il rosso non si distingue'); ok = false; } else console.log('  ✅ col rosso il pulsante manca (' + ko[0] + ')'); }
await b.close(); srv.close();
console.log(ok ? 'CREA-HOME-295: ✅ VERDE' : 'CREA-HOME-295: ❌ ROSSO'); process.exit(ok ? 0 : 1);
