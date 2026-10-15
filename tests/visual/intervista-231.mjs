#!/usr/bin/env node
/* [7.999.161 PO-231, decisione PO 12/10 «Sempre, dopo ogni partita»] GUARDIANO: dopo una partita di carriera giocata davvero
   (salvataggio S12, playMatch + autoplay fino al fischio) l'intervista post partita [data-cpm=intervista231] compare.
   Un osservatore nella pagina registra se la finestra e' mai comparsa, cosi' l'Invio usato per uscire da fine partita non la nasconde.
   VERDE → compare. ROSSO (__CPM_NO_IV231 = probabilita' di prima, 18% per una gara normale da pro) → al fischio si fissa
   Math.random a 0,999 cosi' il sorteggio di prima fallisce sempre: l'intervista NON compare. Uso: node intervista-231.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso, naz) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r === 1) window.__CPM_NO_IV231 = 1; if (r === 2) window.__CPM_NO_IV243 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s));
    window.__IV231 = null; const os = () => { if (window.__IV231) return; const el = document.querySelector('[data-cpm="intervista231"]'); if (el) window.__IV231 = { ctx: el.getAttribute('data-ctx') }; };
    document.addEventListener('DOMContentLoaded', () => { new MutationObserver(os).observe(document.body, { childList: true, subtree: true }); }); }, [save, rosso ? (naz ? 2 : 1) : 0]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const w0 = await page.evaluate(() => { try { return window.__CPM_CAREER.snapshot().week; } catch (e) { return null; } });
  if (naz) { await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'].filter(n => n !== s.nation), matchIdx: 0, pts: 0, matches: [], done: false, season: s.season } }); }); await sleep(1500); }/* [giro 19 PO-243] la Coppa delle Nazioni con la stessa forma della sonda del collaudo 164 */
  const pm = await page.evaluate(n => { try { return n ? window.__CPM_CAREER.apriNC243() : window.__CPM_CAREER.playMatch(); } catch (e) { return 'err ' + e.message; } }, naz);
  for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti|Salta e gioca/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
    await sleep(900); }
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2311, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph; while (Date.now() - t0 < 400000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
  if (rosso && !naz) await page.evaluate(() => { Math.random = () => 0.999; });/* il sorteggio di prima (18%) fallisce sempre */
  const settimana = () => page.evaluate(() => { try { return window.__CPM_CAREER.snapshot().week; } catch (e) { return null; } });
  for (let k = 0; k < 24 && (await settimana()) === w0; k++) { if (await page.evaluate(() => !!window.__IV231)) break; await page.keyboard.press('Enter'); await sleep(500); }
  for (let k = 0; k < 30 && !(await page.evaluate(() => !!window.__IV231)); k++) { await sleep(700);/* la finestra parte 0,9 s dopo il risultato e aspetta in coda (mercato, momento, pagella del mese) */
    if (k > 3) await page.evaluate(() => { if (window.__CPM_IVBLK231 && /settimana|mercato/.test(window.__CPM_IVBLK231)) { try { window.__CPM_CAREER.dismiss(); } catch (e) {} } const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const x = bs.find(b => /^(Continua|Chiudi|Prosegui|Avanti|OK|Ho capito)/i.test((b.textContent || '').trim()) && !/Vivi la Settimana|Gioca/i.test(b.textContent || '')); if (x) x.click(); }); }
  const chieste = await page.evaluate(() => window.__CPM_IV231 | 0); const blocco = await page.evaluate(() => window.__CPM_IVBLK231);
  const testo = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 300));
  const iv = await page.evaluate(() => window.__IV231);
  if (iv) await page.screenshot({ path: new URL('./out/intervista-231-' + (naz ? 'naz-' : '') + (rosso ? 'rosso' : 'verde') + '.png', import.meta.url).pathname }).catch(() => {});
  const w1 = await settimana();
  await ctx.close(); return { pm, fine: ph, w0, w1, iv, chieste, blocco, testo: iv ? undefined : testo };
}
const v = await braccio(false), r = await braccio(true);
/* [giro 19 PO-243] braccio NAZIONALE (collaudi 164 N2 / 165 K2: 0 interviste su 6 gare): Coppa delle Nazioni giocata fino al fischio.
   VERDE → intervista. ROSSO (__CPM_NO_IV243: i rami Nazionale escono senza intervista) → nessuna intervista. */
const nv = await braccio(false, true), nr = await braccio(true, true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_IV231):', JSON.stringify(r));
console.log('NAZIONALE VERDE:', JSON.stringify(nv)); console.log('NAZIONALE ROSSO (__CPM_NO_IV243):', JSON.stringify(nr));
await b.close(); srv.close();
const g = [];
if (!(nv.pm === true)) g.push('nazionale verde: la partita non si apre ' + JSON.stringify(nv.pm));
if (!(nv.fine === 'ended' || nv.fine === 'ceremony')) g.push('nazionale verde: la partita non e\' arrivata al fischio');
if (!nv.iv) g.push('nazionale verde: nessuna intervista dopo la Nazionale ' + JSON.stringify(nv));
if (!(nr.fine === 'ended' || nr.fine === 'ceremony')) g.push('nazionale rosso: la partita non e\' arrivata al fischio');
if (nr.iv) g.push('nazionale rosso: il difetto non si vede ' + JSON.stringify(nr));
if (!(v.fine === 'ended' || v.fine === 'ceremony')) g.push('verde: la partita non e\' arrivata al fischio ' + JSON.stringify(v));
if (!v.iv) g.push('verde: nessuna intervista dopo la partita ' + JSON.stringify(v));
if (!(r.fine === 'ended' || r.fine === 'ceremony')) g.push('rosso: la partita non e\' arrivata al fischio ' + JSON.stringify(r));
if (r.iv) g.push('rosso: il difetto non si vede (l\'intervista compare anche col sorteggio di prima) ' + JSON.stringify(r));
if (g.length) { console.log('❌ intervista-231'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ intervista-231 verde (intervista dopo la partita di club, esito ' + v.iv.ctx + ', e dopo la Nazionale, esito ' + nv.iv.ctx + ') e i due rossi si vedono');
