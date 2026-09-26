#!/usr/bin/env node
/* [7.999.8] GUARDIANO DELLA CADUTA DELL'EROE (Passo 4, gesti 3D).
   Nell'highlight, se l'esito e' «fallo subito» o «punizione conquistata», l'eroe inciampa (trip), resta a terra
   (fallen) e si rialza (standUp). Le tre clip Mixamo avevano la radice rotta (inciampo che scivola 4 m avanti,
   a terra che galleggia a 1,1 m, rialzarsi che vola a 6,4 m): `riparaCadute7` le ripara al caricamento.
   A · le tre clip sono state riparate (window.__CPM_CADUTA8.riparate).
   B · forzando un dribbling con esito «fouled», l'eroe monta trip → fallen → standUp, e nessuna manca la clip.
   ⚠️ GLB-ON: le clip esistono solo sul corpo CGTrader. In headless il tempo di scena scorre lento, quindi si
   aspetta finche' la sequenza compare (tetto CPM_MS) invece di un tempo fisso.
   CPM_ROSSO=1 → __CPM_NO_CADUTA8: niente riparazione, niente gesti, niente sequenza; deve andare ROSSO. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const MS = +(process.env.CPM_MS || 90000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => { window.__CPM_REC = true; if (r) window.__CPM_NO_CADUTA8 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Caduta8' });
for (let k = 0; k < 40; k++) { await sleep(1000); if (await page.evaluate(() => { const g = window.__CPM_GESTURE && window.__CPM_GESTURE(); return !!(g && g.glb); })) break; }
const fails = [];
const glb = await page.evaluate(() => { const g = window.__CPM_GESTURE && window.__CPM_GESTURE(); return !!(g && g.glb); });
if (!glb) { console.log('❌ SONDA CIECA: avatar GLB non montati'); await b.close(); srv.close(); process.exit(2); }
await sleep(3000);
const A = await page.evaluate(() => window.__CPM_CADUTA8 || null);
console.log(`A · clip riparate: ${JSON.stringify(A)}`);
if (!A || A.riparate !== true) fails.push('A: le tre clip della caduta non sono state riparate');
const gis = await page.evaluate(() => { const out = []; const S = window.__CPM_SITS || [];
  for (let i = 0; i < S.length && out.length < 3; i++) { const it = window.deriveIntent ? window.deriveIntent(S[i]) : null; if (it === 'dribble') out.push(i); } return out; });
let seq = [], senza = 0, prove = 0, bac = null;
for (const gi of gis) {
  await page.evaluate(g => { if (window.__CPM_CADUTA8) { window.__CPM_CADUTA8.seq = []; window.__CPM_CADUTA8.senzaClip = 0; } window.__CPM_FORCE_KIND = 'fouled'; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(1500);
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
  prove++;
  const t0 = Date.now();
  while (Date.now() - t0 < MS) { await sleep(1000); const W = await page.evaluate(() => window.__CPM_CADUTA8 || null); if (W && (W.seq || []).includes('standUp')) break; }
  /* [7.999.19] la sonda si fermava APPENA compariva «standUp» e leggeva il bacino a rialzo appena iniziato: con pochi fotogrammi al
     secondo (software GL) il massimo restava 0,4-0,7 m e il test falliva a caso (7.999.16 rosso, 7.999.17 verde sullo stesso codice).
     Ora si osserva il rialzo fino a 5 s o finche' il bacino supera 0,8 m. */
  { const t1 = Date.now(); while (Date.now() - t1 < 5000) { const W2 = await page.evaluate(() => window.__CPM_CADUTA8 || null); const su = W2 && W2.bacino && W2.bacino.standUp; if (!su || su[1] >= 0.8) break; await sleep(400); } }
  const W = await page.evaluate(() => ({ w: window.__CPM_CADUTA8 || null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null }));
  seq = (W.w && W.w.seq) || []; senza = (W.w && W.w.senzaClip) | 0;
  console.log(`B · gi${gi}: sequenza ${JSON.stringify(seq)} · fotogrammi senza clip ${senza} · fase ${W.ph}`);
  bac = (W.w && W.w.bacino) || null; if (bac) console.log(`B · bacino dell'eroe (m sopra la radice, min-max): ${JSON.stringify(bac)} · tempo clip ${JSON.stringify(W.w.clipT||null)}`);
  if (seq.length) break;
}
if (seq.join(',') !== 'trip,fallen,standUp') fails.push(`B: l'eroe non fa inciampo → a terra → rialzarsi (${JSON.stringify(seq)} su ${prove} prove)`);
/* a terra il bacino sta sotto i 40 cm (clip riparata: 0,17 m nel provino; in piedi ~1 m) */
if (!ROSSO && bac && bac.fallen && bac.fallen[1] > 0.4) fails.push(`B: a terra il bacino dell'eroe sta a ${bac.fallen[1]} m: il corpo galleggia`);
if (!ROSSO && bac && bac.standUp && bac.standUp[1] < 0.8) fails.push(`B: l'eroe non si rialza (bacino al massimo a ${bac.standUp[1]} m)`);
if (senza > 0) fails.push(`B: ${senza} fotogrammi con gesto di caduta chiesto e clip assente`);
if (errors.length) fails.push('errori di pagina: ' + errors.slice(0, 2).join(' | '));
await b.close(); srv.close();
if (ROSSO) { const ok = fails.some(f => f.startsWith('A:')) && fails.some(f => f.startsWith('B:'));
  console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.8 l\'eroe non cade' : '❌ il rosso non riproduce il vecchio comportamento\n  ' + fails.join('\n  ')); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL caduta-eroe\n  ' + fails.join('\n  ') : '✅ PASS caduta-eroe'); process.exit(fails.length ? 1 : 0);
