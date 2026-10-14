#!/usr/bin/env node
/* [collaudo release 7.999.165 · PO-236 «non ci sono i bambini accompagnati dalla squadra avversaria»] Ingresso in campo della
   partita della Nazionale arrivata da sola (salvataggio di fine giro C della collaudatrice 164: S13 sett. 9, Spagna-Portogallo),
   GLB ACCESO, 412x915. Ogni 1,5 s dell'ingresso: foto + per squadra quanti bambini sono visibili, a che distanza dal loro calciatore
   e quanti sono DENTRO l'inquadratura (proiezione della camera di scena, se il gioco la espone) — cosi' si separa «non ci sono» da
   «ci sono ma la camera non li mostra». Uscita docs/collaudi/release-166/dati/ingresso.json + foto ing-*.jpg */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { clickAdvance } from './lib/collaudo166.mjs';
const OUT = path.resolve('../../docs/collaudi/release-166');
const sv = JSON.parse(fs.readFileSync(process.env.CPM_SAVE || '../../docs/collaudi/release-166/dati/partenza-giroB-da-164c.json', 'utf8'));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 }); await sleep(1500);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const t0 = Date.now(); while (Date.now() - t0 < 90000) { const f = await ph();  if (f === 'walkout') break; if (!f) { if (!fs.existsSync(path.join(OUT, 'ing-convocazione.jpg'))) await page.screenshot({ path: path.join(OUT, 'ing-convocazione.jpg'), type: 'jpeg', quality: 72, fullPage: true }); await clickAdvance(page, [/Gioca la Partita/i]); } else if (f === 'matchday' || f === 'formations') await clickAdvance(page, [/Vedi le formazioni/, /Ingresso in campo/, /Formazioni →/]); await sleep(1500); }
const righe = []; const tw = Date.now(); let k = 0;
while (Date.now() - tw < +(process.env.CPM_WMAX || 70000) && (await ph()) === 'walkout') {
  const r = await page.evaluate(() => { const L = window.__CPM_HYPER_MASCOT_LIST || []; const cam = window.__CPM_CAMERA || window.__CPM_CAM || null;
    const vis = q => q && q.glb911 && q.glb911.root && q.glb911.root.visible; const d = q => (vis(q) && q.p) ? +Math.hypot(q.glb911.root.position.x - q.p.position.x, q.glb911.root.position.z - q.p.position.z).toFixed(2) : null;
    const lato = c => { const S = L.filter(q => q && !!q.casa === c); return { n: S.length, vis: S.filter(vis).length, dist: S.map(d).filter(v => v != null).sort((a, b) => a - b).slice(0, 11), calcVis: S.filter(q => q.p && q.p.visible !== false).length, z: S.filter(vis).map(q => +q.glb911.root.position.z.toFixed(1)).slice(0, 3), visMondo: S.filter(q => { if (!vis(q)) return false; let o = q.glb911.root; while (o) { if (!o.visible) return false; o = o.parent; } return true; }).length, inScena: S.filter(q => { if (!vis(q)) return false; let o = q.glb911.root; while (o.parent) o = o.parent; return o.type === 'Scene'; }).length, scala: S.filter(vis).slice(0, 1).map(q => { try { const v = new q.glb911.root.position.constructor(); q.glb911.root.getWorldScale(v); return +v.y.toFixed(3); } catch (e) { return null; } })[0], scalaCalc: S.slice(0, 1).map(q => { try { const v = new q.p.position.constructor(); q.p.getWorldScale(v); return +v.y.toFixed(3); } catch (e) { return null; } })[0] }; };
    const pz = c => L.filter(q => q && !!q.casa === c && q.p).slice(0, 3).map(q => [+q.p.position.x.toFixed(1), +q.p.position.z.toFixed(1)]); return { casa: lato(true), osp: lato(false), camera: !!cam, calcCasa: pz(true), calcOsp: pz(false) }; }).catch(e => ({ err: String(e.message).slice(0, 80) }));
  const f = process.env.CPM_NOFOTO ? null : `${process.env.CPM_PFX || 'ing'}-${String(++k).padStart(2, '0')}.jpg`; if (f) await page.screenshot({ path: path.join(OUT, f), type: 'jpeg', quality: 72 });
  r.t = +((Date.now() - tw) / 1000).toFixed(1); r.foto = f; righe.push(r); console.log(JSON.stringify(r).slice(0, 300)); await sleep(+(process.env.CPM_PASSO || 1200));
}
fs.writeFileSync(path.join(OUT, 'dati', (process.env.CPM_PFX || 'ingresso') + '.json'), JSON.stringify(righe, null, 1));
await b.close(); srv.close();
