#!/usr/bin/env node
/* [giro 403 — PO-579] GUARDIANO DEL PESO DEI MODELLI 3D.
   Tetti DICHIARATI PRIMA DI COMPRIMERE (commit del guardiano, sugli asset originali = rosso):
     A. GLB che entrano nel pacchetto (stesse regole di tools/build-dist.mjs, lette dal file): <= 60 MiB   (originali: 94,33 MiB, 53 file)
     B. GLB scaricati da UNA partita vera al telefono (412x915, GLB acceso, fino alla prima scena): <= 16 MiB   (originali: 22,40 MiB, 28 file)
   C. CARICAMENTO: ogni GLB chiesto dalla partita arriva carico (window.__CPM_FATTI233[url]), corpi pronti (__CPM_CORPI232), zero
      pageerror e zero errori di console di GLTFLoader/WebP/texture.
   Il peso B e' quello che il giocatore paga davvero (rete mobile e memoria); A e' l'AAB del Play Store e il sito.
   PROVA DEL ROSSO (CPM_PROVA_ROSSO=1): A conta anche i file che build-dist esclude come non referenziati (come CPM_DIST_CON_SORGENTI=1),
   B+C servono il PRIMO corpo CGTrader chiesto troncato a meta' (file rotto). Il braccio rosso esce 0 solo se vede i rossi di A e di C.
   Il rosso del tetto B e' la misura sugli asset ORIGINALI (commit del guardiano prima della compressione: 22,40 MiB > 16).
   «Non giudicato» (partita senza nessun GLB chiesto, scena mai arrivata) = rosso.
   Uso (da tests/visual): CPM_CHROME=/opt/pw-browsers/chromium node peso-403.mjs  ·  CPM_PROVA_ROSSO=1 node peso-403.mjs */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const MiB = 1048576, TETTO_PACCHETTO = 60 * MiB, TETTO_PARTITA = 16 * MiB;
const mb = x => (x / MiB).toFixed(2);
const g = []; const rosso = (k, m) => { g.push(k + ': ' + m); console.log('  ❌ ' + k + ': ' + m); };
console.log(`peso-403 · braccio ${ROSSO ? 'ROSSO (sorgenti inclusi + corpo troncato)' : 'verde'}`);

/* ---- A. statico: le regole di esclusione si leggono da build-dist (una sola sorgente) ---- */
const bd = fs.readFileSync(path.join(ROOT, 'tools/build-dist.mjs'), 'utf8');
const rx = nome => { const m = bd.match(new RegExp('const ' + nome + ' = (/.+?/[a-z]*);')); if (!m) throw new Error('build-dist: non trovo ' + nome); return (0, eval)(m[1]); };
const ESC = { ch38: rx('_ch38Dist'), src: rx('_srcDist'), orig: rx('_origDist'), origNome: rx('_origNome') };
const tutti = []; (function giu(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) giu(p); else if (/\.glb$/i.test(f)) tutti.push(p); } })(path.join(ROOT, 'assets'));
const pacchetto = tutti.filter(p => !ESC.orig.test(p) && !ESC.origNome.test(p) && !ESC.ch38.test(p) && (ROSSO || !ESC.src.test(p)));
const pesoPk = pacchetto.reduce((a, p) => a + fs.statSync(p).size, 0);
console.log(`  A. pacchetto: ${pacchetto.length} GLB, ${mb(pesoPk)} MiB (tetto ${mb(TETTO_PACCHETTO)})`);
if (pacchetto.length < 20) rosso('A', `solo ${pacchetto.length} GLB nel pacchetto: misura non giudicata`);
else if (pesoPk > TETTO_PACCHETTO) rosso('A', `${mb(pesoPk)} MiB > tetto ${mb(TETTO_PACCHETTO)} MiB`);

/* ---- B + C. partita vera al telefono ---- */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); const page = await ctx.newPage();
await installCdnRoutes(page);
const rete = []; const errs = []; let troncato = null;
await ctx.route(/\/assets\/.*\.glb(\?|$)/, async r => {
  const u = decodeURIComponent(new URL(r.request().url()).pathname); let body;
  try { body = fs.readFileSync(path.join(ROOT, u)); } catch (e) { rete.push({ u, b: 0 }); return r.fulfill({ status: 404, body: '' }); }
  if (ROSSO && !troncato && /cgtrader-review/.test(u)) { troncato = u; body = body.subarray(0, body.length >> 1); }
  rete.push({ u, b: body.length }); return r.fulfill({ status: 200, contentType: 'model/gltf-binary', body });
});
page.on('pageerror', e => errs.push('pageerror ' + e.message.slice(0, 160)));
page.on('console', m => { if (m.type() === 'error' && /GLTF|glb|WebP|texture|Draco|meshopt/i.test(m.text())) errs.push('console ' + m.text().slice(0, 160)); });
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; });
let scena = false, pronti = null, fatti = [];
try {
  await openMatch(page, port, { skipLoadAll: true, name: 'Peso 403' });
  const t0 = Date.now(); let ult = -1;
  while (Date.now() - t0 < 180000) {
    const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0, p: window.__CPM_CORPI232 ? window.__CPM_CORPI232() : null })).catch(() => null);
    if (!s || s.ph === 'ended') break;
    if (s.p && s.p.pronti && s.p.motivo !== 'glb-off') pronti = s.p;
    if (s.ph === 'playing' && s.c >= 8 && s.c !== ult) { ult = s.c; await page.evaluate(() => window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE()).catch(() => {}); }
    if (/^hl_/.test(s.ph)) scena = true;
    if (scena && (pronti || (ROSSO && Date.now() - t0 > 60000))) break;
    if (s.ph === 'hl_choose') await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
    await sleep(1000);
  }
  await sleep(1500);
  fatti = await page.evaluate(() => Object.keys(window.__CPM_FATTI233 || {}).map(u => decodeURIComponent(new URL(u, location.href).pathname)));
} catch (e) { errs.push('sonda ' + e.message.slice(0, 160)); }
await ctx.close(); await b.close(); srv.close();

const pesoPt = rete.reduce((a, x) => a + x.b, 0);
const nonArrivati = [...new Set(rete.map(x => x.u))].filter(u => !fatti.includes(u));
console.log(`  B. partita al telefono: ${rete.length} GLB chiesti, ${mb(pesoPt)} MiB (tetto ${mb(TETTO_PARTITA)}) · scena ${scena ? 'si' : 'no'} · corpi pronti ${pronti ? pronti.motivo : 'no'}`);
console.log(`  C. caricati ${fatti.length}/${new Set(rete.map(x => x.u)).size} · errori ${errs.length}${troncato ? ' · troncato ' + path.basename(troncato) : ''}`);
if (rete.length < 5 || !scena) rosso('B', `non giudicato: ${rete.length} GLB chiesti, scena ${scena ? 'arrivata' : 'mai arrivata'}`);
else if (pesoPt > TETTO_PARTITA) rosso('B', `${mb(pesoPt)} MiB > tetto ${mb(TETTO_PARTITA)} MiB`);
if (nonArrivati.length) rosso('C', `${nonArrivati.length} GLB chiesti e mai caricati: ${nonArrivati.map(u => path.basename(u)).slice(0, 4).join(', ')}`);
if (errs.length) rosso('C', `${errs.length} errori: ${errs.slice(0, 3).join(' | ')}`);
if (!pronti) rosso('C', 'corpi mai pronti (__CPM_CORPI232)');

if (ROSSO) {
  const visti = ['A', 'C'].map(k => g.some(m => m.startsWith(k + ':')));
  if (visti.every(Boolean)) { console.log(`✅ peso-403 · prova del rosso: il guardiano vede (${g.length} rossi: pacchetto oltre il tetto, corpo rotto)`); process.exit(0); }
  console.log(`❌ peso-403 · prova del rosso CIECA su ${['A pacchetto', 'C caricamento'].filter((_, i) => !visti[i]).join(', ')}`); process.exit(1);
}
if (g.length) { console.log(`❌ peso-403 · ${g.length} rossi`); process.exit(1); }
console.log(`✅ peso-403 verde · pacchetto ${mb(pesoPk)} MiB · partita ${mb(pesoPt)} MiB · ${fatti.length} GLB caricati senza errori`);
