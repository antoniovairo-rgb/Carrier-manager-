#!/usr/bin/env node
/* [giro 212 · PO-474] FOTO prima/dopo della festa del fischio finale con il guardalinee in quadro (strumento di collaudo, non guardiano).
   Percorso vero da salvataggio (trasferta, 375x812, GLB acceso) → ingresso → partita → festa «Doppietta» forzata. Dal testimone
   __CPM_G212W si legge dove sta il guardalinee del lato lontano e si mette la camera dove la mette la regia della festa nella foto del
   PO: sul prato, ad altezza d'uomo, venti unita' davanti a lui, guardando verso gli spalti (gancio di collaudo __CPM_CAM904).
   La stessa inquadratura si scatta col rosso (__CPM_NO_G212 = prima) e senza (dopo). Uso: node foto-gigante-212.mjs [--rosso] */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.argv.includes('--rosso'), TAG = ROSSO ? 'prima' : 'dopo';
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro212'); fs.mkdirSync(FOTO, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
await installCdnRoutes(ctx); const page = await ctx.newPage();
await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'night'; if (o.r) window.__CPM_NO_G212 = 1;
  localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { r: ROSSO, s: SAVE });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
const t0 = Date.now();
while (Date.now() - t0 < 200000) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  if (ph === 'playing') break;
  if (ph === 'matchday' || ph === 'formations') await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
  if (ph === 'walkout') await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => /Salta ingresso/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
  await sleep(600); }
await page.evaluate(() => { window.__CPM_FORCE_CEREMONY({ name: 'Doppietta', kind: 'bigwin', light: true, festa: { titolo: 'Doppietta', punteggio: '0 – 2', avversario: 'FC Islington', casa: false, facce: [{ eroe: true, id: 0 }], voci: [{ n: 2, et: 'gol', oro: true }, { n: '7,8', et: 'voto', oro: true }] } }); });
await sleep(3000);
await page.evaluate(() => { window.__CPM_G212W = []; }); await sleep(1500);
const g = await page.evaluate(() => { const W = (window.__CPM_G212W || []).splice(0); window.__CPM_G212W = null; for (let i = W.length - 1; i >= 0; i--) { const c = W[i].corpi.filter(x => x.ruolo === 'guardalinee').sort((a, b) => a.pos[2] - b.pos[2]); if (c.length) return c.map(x => ({ pos: x.pos, hM: x.hM, scala: x.scala })); } return null; });
console.log('guardalinee', JSON.stringify(g));
if (!g) { console.log('❌ guardalinee non misurati'); process.exit(1); }
const L = g[0]; /* lato z negativo */
await page.evaluate(([x, z]) => { window.__CPM_CAM904 = { x, y: 1.7, z: z + 22, lx: x, ly: 6, lz: z - 6 }; window.__CPM_G212W = []; }, [L.pos[0], L.pos[2]]);
await sleep(2500);
const f = await page.evaluate(() => { const W = (window.__CPM_G212W || []); const u = W[W.length - 1]; return u ? u.corpi.filter(c => c.ruolo === 'guardalinee').map(c => ({ hM: c.hM, quota: c.quota, d: c.d })) : null; });
await page.screenshot({ path: path.join(FOTO, `${TAG}-festa-guardalinee-in-quadro.jpg`), type: 'jpeg', quality: 72 });
console.log(`${TAG}: guardalinee in quadro ${JSON.stringify(f)} → ${path.join('docs/sviluppo/giro212', `${TAG}-festa-guardalinee-in-quadro.jpg`)}`);
await b.close(); srv.close();
