#!/usr/bin/env node
/* [giro 369 · PO-419] GUARDIANO profilo-369 — «Calciatore coerente: stessa statura e peso ovunque, piede preferito mostrato e scelto
   alla creazione». Gioco vero (?cpmtest=1), una pagina nuova per prova, telefono 412x915 (dpr 2). Soglie fissate PRIMA della
   correzione (misura-369 sulla base 7.999.215: 5 carriere su 5 con creazione ≠ testata, es. aspetto 0: 187/80 contro 170/63;
   nessun piede nel Profilo; nessuna scelta del piede nella creazione). Per ogni prova (aspetto 0, 3, 8):
     - statura e peso letti in CREAZIONE, nella figurina della TESTATA e in Carriera › PROFILO: tutti e tre presenti e uguali
       (una schermata senza numero = non giudicato = rosso);
     - salvataggio VECCHIO (senza altezzaCm/pesoKg): la migration li scrive, uguali ai numeri che la testata mostrava gia' prima
       (formula del corpo 3D, `fisicoEroe369`);
     - piede: scelta presente nella creazione, preselezionata sul piede di oggi (F8, da nome+nazione); il Profilo scrive il piede
       salvato.
   Percorso vero: si sceglie il piede OPPOSTO al preselezionato e si preme «Crea»: il calciatore salvato ha quel piede e la statura.
   Zero errori di pagina. Rosso window.__CPM_NO_G369 (com'era) → DEVE essere bocciato.
   Foto in docs/sviluppo/giro369/ (prima = rosso, dopo = verde). Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node profilo-369.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { PROVE, misuraCreazione, misuraCarriera, piedeAtteso, confronta } from './misura-369.mjs';

const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro369'); fs.mkdirSync(FOTO, { recursive: true });
const SCELTE = [PROVE[0], PROVE[1], PROVE[3]];
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
/* numeri che la testata mostrava gia' sulla base (misura-369 prima, aspetto → cm/kg): non devono cambiare */
const BASE = { 0: [170, 63], 3: [174, 72], 8: [187, 80] };

async function creaDavvero(browser, port, prova, flags) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  await installCdnRoutes(page); const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript((fl) => { window.__CPM_GLB = false; for (const f of fl) window[f] = 1; try { localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} }, flags);
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')), null, { timeout: 90000 });
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /^\s*Nuova carriera\s*$/.test(x.textContent || '')).click());
    await page.waitForFunction(() => /Crea il tuo calciatore/i.test(document.body.innerText), null, { timeout: 20000 });
    await page.evaluate((id) => { const lbl = AVATARS[id].label; const b = [...document.querySelectorAll('.cpm-create button[title]')].find(x => x.getAttribute('title') === lbl); if (b) b.click(); }, prova.avatarId);
    await page.fill('input[name="cpm-hero-name"]', prova.name); await page.selectOption('[data-cpm="crea-nazione"]', prova.nation).catch(() => {});
    await sleep(400);
    const pre = await page.evaluate(() => { const s = document.querySelector('[data-cpm="crea-piede369"] [aria-pressed="true"]'); return s ? s.getAttribute('data-piede') : null; });
    const voluto = pre === 'L' ? 'R' : 'L';
    await page.evaluate((k) => { const b = document.querySelector(`[data-cpm="crea-piede369"] [data-piede="${k}"]`); if (b) b.click(); }, voluto);
    await sleep(300);
    await page.click('[data-cpm="crea-avanti-v2"]');
    await sleep(1500);
    const p = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-trial-prog')).p; } catch (e) { return null; } });
    return { pre, voluto, p: p ? { foot: p.foot, altezzaCm: p.altezzaCm, pesoKg: p.pesoKg, avatarId: p.avatarId } : null, errors };
  } finally { await page.close(); }
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
try {
  for (const [flags, rosso] of [[[], false], [['__CPM_NO_G369'], true]]) {
    const braccio = rosso ? 'rosso' : 'verde'; const ko = [];
    for (const p of SCELTE) {
      const fo = (k) => path.join(FOTO, `${rosso ? 'prima' : 'dopo'}-${k}-aspetto${p.avatarId}.png`);
      const crea = await misuraCreazione(browser, port, p, flags, p === SCELTE[0] ? fo('creazione') : null);
      const car = await misuraCarriera(browser, port, p, flags, {}, p === SCELTE[0] ? fo('carriera') : null);
      const at = await piedeAtteso(browser, port, p);
      const r = confronta(p, crea, car, at); const base = BASE[p.avatarId];
      const tre = r.coppie === 3, uguali = tre && r.diverse === 0;
      const migr = car.snap.altezzaCm === base[0] && car.snap.pesoKg === base[1] && car.testata && car.testata.cm === base[0] && car.testata.kg === base[1];
      const piedeC = !!(crea.piede && crea.piede.presente && crea.piede.scelto === at);
      const piedeP = car.profilo.piede != null && ((car.snap.foot === 'L') === /sinistro|mancino/i.test(car.profilo.piede));
      const err = crea.errors.length + car.errors.length;
      const d = `${r.prova}: ${JSON.stringify(r.schermi)} (${r.coppie} coppie, ${r.diverse} diverse) · salvato ${car.snap.altezzaCm}/${car.snap.pesoKg} (base ${base.join('/')}) · piede creazione ${crea.piede ? crea.piede.scelto : 'assente'} (atteso ${at}) · profilo ${car.profilo.piede || 'assente'} · errori ${err}`;
      const v = uguali && migr && piedeC && piedeP && err === 0;
      if (!rosso) ok(v, `verde ${d}`); else { console.log(`  · rosso ${d}`); if (v) ko.push(r.prova); }
    }
    const cd = await creaDavvero(browser, port, PROVE[2], flags);
    const at2 = await piedeAtteso(browser, port, PROVE[2]);
    const vCd = !!cd.p && cd.pre === at2 && cd.p.foot === cd.voluto && cd.p.altezzaCm > 0 && cd.p.pesoKg > 0 && cd.errors.length === 0;
    const dCd = `creazione vera ${PROVE[2].name}: preselezionato ${cd.pre} (atteso ${at2}), scelto ${cd.voluto}, salvato ${cd.p ? `${cd.p.foot} · ${cd.p.altezzaCm}/${cd.p.pesoKg}` : 'nessun calciatore'} · errori ${cd.errors.length}`;
    if (!rosso) ok(vCd, `verde ${dCd}`); else { console.log(`  · rosso ${dCd}`); if (vCd) ko.push('creazione vera'); }
    if (rosso) ok(ko.length === 0, `rosso bocciato su tutte le ${SCELTE.length + 1} prove${ko.length ? ' (passate col rosso: ' + ko.join(', ') + ')' : ''}`);
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `\n✗ profilo-369 ROSSO (${fails.length})` : '\n✓ profilo-369 VERDE');
process.exit(fails.length ? 1 : 0);
