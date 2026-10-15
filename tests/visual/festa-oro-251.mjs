#!/usr/bin/env node
/* [giro 23 PO-251, questionario 14/10 «Oro da festa»] GUARDIANO: alla festa del trofeo il pulsante «🎉 Festeggia» e' ORO (variante
   ufficiale «festa» del kit: TH.festaGrad / Btn v="festa"), anche per «CAMPIONI!» della Nazionale, dove prima prendeva il verde del
   titolo (#34d399). Telefono 412x915: festa aperta con il varco di collaudo festa251(kind) per Nazionale, campionato e coppa; si legge
   lo sfondo calcolato del pulsante.
   VERDE: per tutti e tre i trofei lo sfondo contiene l'oro della variante (#f5c542 = rgb(245, 197, 66)) e niente verde.
   ROSSO (__CPM_NO_ORO251): sulla Nazionale torna il verde rgb(52, 211, 153). Uso: node festa-oro-251.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ORO = 'rgb(245, 197, 66)', VERDE = 'rgb(52, 211, 153)';
async function giro(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_ORO251 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const out = { rosso, trofei: {} };
  for (const k of ['nation', 'league', 'cup']) {
    await page.evaluate(k => window.__CPM_CAREER.festa251(k), k); await sleep(900);
    out.trofei[k] = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Festeggia$/.test((x.textContent || '').trim()) && x.offsetParent !== null);
      if (!bt) return null; const cs = getComputedStyle(bt); return { sfondo: (cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor), testo: cs.color }; });
    if (k === 'nation') await page.screenshot({ path: new URL('./out/festa-oro-251' + (rosso ? '-rosso' : '') + '.png', import.meta.url).pathname }).catch(() => {});
    await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Festeggia$/.test((x.textContent || '').trim())); if (bt) bt.click(); }); await sleep(500);
  }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const V = await giro(false), R = await giro(true);
console.log('VERDE ' + JSON.stringify(V)); console.log('ROSSO ' + JSON.stringify(R));
await b.close(); srv.close();
const g = [];
for (const k of ['nation', 'league', 'cup']) { const t = V.trofei[k];
  if (!t) g.push('verde: pulsante non trovato (' + k + ')'); else if (!t.sfondo.includes(ORO) || t.sfondo.includes(VERDE)) g.push('verde: ' + k + ' non e\' oro: ' + t.sfondo); }
if (V.errori.length) g.push('verde: errori di pagina ' + V.errori.join(' | '));
if (!(R.trofei.nation && R.trofei.nation.sfondo.includes(VERDE))) g.push('rosso: il difetto non si vede ' + JSON.stringify(R.trofei.nation));
if (g.length) { console.log('❌ festa-oro-251'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ festa-oro-251 verde (oro da festa su tutti i trofei) e il rosso si vede');
