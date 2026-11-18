#!/usr/bin/env node
/* GUARDIANO giro 241 (PO-506, decisione PO «Sì, eroe sempre in quadro») — DOPO UN'AZIONE FALLITA DELL'EROE LA CAMERA TIENE EROE E
   PALLONE; e su gi55 «Stacco sul palo lontano» il pallone non passa dentro il portiere.

   STRUMENTO: lo stesso del banco misura-241 (lib/camera-241.mjs, testimone __CPM_G241W: un campione per fotogramma, tempo di scena,
   stacco nero). GLB acceso (direttiva PO 29/07), pagina nuova ogni CPM_PER_PAGINA esecuzioni (7.483).

   CAMPIONE DICHIARATO. Il catalogo ha 483 azioni non difensive dell'eroe (tiro, cross, passaggio, dribbling): a ~27 s l'una sono 3 ore
   e mezza, quindi tutte le azioni le misura il banco (node misura-241.mjs, numeri nel rapporto del giro) e il guardiano ne prova
   CPM_PER_FAM per famiglia (default 4: le prime del catalogo prese a passo regolare) + le azioni che nel banco PRIMA della correzione
   erano le peggiori (TESTIMONI). CPM_AZIONI=gi:k,gi:k per cambiarlo.
   PRETESA 1 (ogni esecuzione fallita, dal clic alla chiusura della scena): eroe in quadro in almeno il 95% dei fotogrammi
     (a) nella camera della REGIA (centro del corpo: la grandezza del banco 226) e (b) sul fotogramma DISEGNATO (piedi e testa dentro);
     (c) eroe mai «enorme» (altezza apparente oltre il 35% del quadro). Si stampano, senza giudicarle, la quota di fotogrammi con
     l'eroe sul bordo e quella con eroe e pallone insieme.
   PRETESA 2 (gi55 azione 0, esito «palo» chiesto dal collaudo, CPM_GI55 volte, default 3, pagina nuova ogni volta): in scena l'esito
     non e' «palo» (si mostra «fuori», decisione tecnica del giro) e il pallone non passa a meno di 0,7 u dal centro del portiere a
     quota <= 2 u (la misura «attraverso» di portiere-223).
   «Non giudicata» = rosso. RIPETIZIONE DICHIARATA: una esecuzione rossa nel braccio verde si rifa' UNA volta su pagina nuova (verde alla
   ripetizione = «instabile», contata e stampata).
   BRACCIO ROSSO (__CPM_NO_G241, i TESTIMONI + gi55 × 2): deve mostrare l'eroe fuori dal quadro della regia in almeno CPM_ROSSO_MIN
   testimoni (default 3) e l'esito «palo» in scena su gi55, senza ripetizioni.  CPM_SOLO_VERDE=1 / CPM_SOLO_ROSSO=1 per un braccio solo.
     CPM_CHROME=/opt/pw-browsers/chromium node camera-241.mjs                                                                    */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, __dirname as LIBDIR } from './lib/harness.mjs';
import { S, INIT, catalogo, esegui, rigaBreve, violazioni, sleep } from './lib/camera-241.mjs';

const OUT = path.join(LIBDIR, '..', 'out', 'camera-241'); fs.mkdirSync(OUT, { recursive: true });
const T0 = Date.now();
const PER_PAGINA = Math.max(1, +(process.env.CPM_PER_PAGINA || 3)), PER_FAM = Math.max(1, +(process.env.CPM_PER_FAM || 4)), ROSSO_MIN = +(process.env.CPM_ROSSO_MIN || 3), N55 = +(process.env.CPM_GI55 || 3);
const TESTIMONI = (process.env.CPM_TESTIMONI || '109:0,89:0,16:0,61:0,182:0,142:0,30:0,6:0').split(',').filter(Boolean);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function nuovaPagina(rosso) { let err; for (let i = 0; i < 3; i++) { try { return await nuovaPagina0(rosso); } catch (e) { err = e; console.log('  (apertura pagina fallita: ' + String(e.message || e).split('\n')[0].slice(0, 90) + ' — riprovo)'); await sleep(2000); } } throw err; }
async function nuovaPagina0(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT);
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_G241 = 1; });
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  page._glb = await page.evaluate(() => window.__CPM_GLB_READY === true);
  await sleep(600);
  return page;
}
let page = await nuovaPagina(false);
const TOT = await page.evaluate(() => SITUATIONS.length);
const cat = await catalogo(page);
const trova = s => { const [gi, k] = s.split(':').map(Number); return cat.find(a => a.gi === gi && a.k === k); };
const perFam = {}; for (const a of cat) (perFam[a.fam] = perFam[a.fam] || []).push(a);
let scelte = [];
if (process.env.CPM_AZIONI) scelte = process.env.CPM_AZIONI.split(',').map(trova).filter(Boolean);
else { for (const f of Object.keys(perFam).sort()) { const L = perFam[f], passo = Math.max(1, Math.floor(L.length / PER_FAM)); for (let i = 0; i < PER_FAM && i * passo < L.length; i++) scelte.push(L[i * passo]); }
  for (const t of TESTIMONI.map(trova).filter(Boolean)) if (!scelte.includes(t)) scelte.push(t); }
const testimoni = TESTIMONI.map(trova).filter(Boolean);
console.log(`[camera-241] catalogo ${cat.length} azioni non difensive (${Object.entries(perFam).map(([k, v]) => `${k} ${v.length}`).join(', ')}) · provate ${scelte.length} con esito fallito: ${scelte.map(a => `gi${a.gi}k${a.k}`).join(' ')} · gi55 palo × ${N55} · GLB ${page._glb ? 'acceso' : 'NON PRONTO'}`);

/* PRETESA 2: il pallone non passa dentro il portiere (stessa soglia «attraverso» di portiere-223: 0,7 u in pianta a quota <= 2 u) */
function dentroPortiere(r) {
  const W = (r.grezzo || []).filter(f => f.ph === 'hl_result' && f.gk && (f.arc || f.pa)); let m = 9e9, n = 0;
  for (const f of W) { if (f.b[1] > 2.0) continue; const d = Math.hypot(f.b[0] - f.gk[0], f.b[2] - f.gk[2]); if (d < m) m = d; if (d < 0.7) n++; }
  return { n: W.length, dMin: m > 1e8 ? null : +m.toFixed(2), dentro: n };
}
async function braccio(rosso, azioni) {
  console.log(`\n== ${rosso ? 'ROSSO (__CPM_NO_G241)' : 'VERDE'} ==`);
  if (rosso) { await page.close().catch(() => {}); page = await nuovaPagina(true); }
  let usate = 0; const esiti = [];
  const una = async (a, kind) => { if (usate >= PER_PAGINA) { await page.close().catch(() => {}); page = await nuovaPagina(rosso); usate = 0; } usate++; let r; try { r = await esegui(page, { ...a, out: 'fail' }, { totale: TOT, kind }); } catch (e) { r = { ...a, out: 'fail', errore: String(e.message || e).slice(0, 160) }; usate = PER_PAGINA; } return r; };
  for (const a of azioni) {
    let r = await una(a, null); let v = violazioni(r); let instabile = false;
    if (v.length && !rosso) { console.log(`  ↻ ${rigaBreve(r)}\n      prima passata rossa: ${v.join(' · ')} — si ripete una volta su pagina nuova`); usate = PER_PAGINA; const r2 = await una(a, null); const v2 = violazioni(r2); if (!v2.length) instabile = true; r = r2; v = v2; }
    delete r.grezzo; esiti.push({ a, r, v, instabile });
    console.log(`  ${v.length ? '❌' : (instabile ? '⚠️' : '✅')} ${rigaBreve(r)}`); for (const x of v) console.log('      ✗ ' + x);
  }
  /* gi55 «Stacco sul palo lontano», esito palo chiesto */
  const a55 = trova('55:0'); const e55 = [];
  if (a55) { process.env.CPM_GREZZO = '1';
    for (let i = 0; i < (rosso ? Math.min(2, N55) : N55); i++) { usate = PER_PAGINA; const r = await una(a55, 'post'); const g = r.giudicata ? dentroPortiere(r) : null; const v = violazioni(r).filter(x => x.startsWith('non giudicata') || x.startsWith('errore'));
      if (g && g.n < 5) v.push(`non giudicata: solo ${g.n} fotogrammi di volo`); if (r.giudicata && r.kd === 'post' && !rosso) v.push('esito in scena «palo»: su questa scena deve mostrarsi «fuori»'); if (g && g.dentro > 0) v.push(`pallone dentro il portiere: ${g.dentro} fotogrammi sotto 0,7 u (minimo ${g.dMin} u)`);
      delete r.grezzo; e55.push({ r, g, v }); console.log(`  ${v.length ? '❌' : '✅'} gi55 palo #${i + 1}: esito in scena ${r.kd || '?'} · ${g ? `${g.n} fotogrammi di volo, distanza minima dal portiere ${g.dMin} u` : (r.nonGiud || r.errore)}`); for (const x of v) console.log('      ✗ ' + x); }
    delete process.env.CPM_GREZZO; }
  return { esiti, e55 };
}

let rc = 0; const rapporto = { quando: new Date().toISOString(), soglie: S };
if (!process.env.CPM_SOLO_ROSSO) {
  const { esiti: E, e55 } = await braccio(false, scelte);
  const rossi = E.filter(e => e.v.length), inst = E.filter(e => e.instabile), r55 = e55.filter(e => e.v.length);
  rapporto.verde = { azioni: E.map(e => ({ gi: e.a.gi, k: e.a.k, fam: e.a.fam, violazioni: e.v, instabile: e.instabile, qDentro: e.r.qDentro, qInsieme: e.r.qInsieme, nFot: e.r.nFot })), gi55: e55.map(e => ({ kd: e.r.kd, g: e.g, violazioni: e.v })) };
  console.log(`\nVERDE: ${E.length - rossi.length}/${E.length} azioni fallite con l'eroe in quadro >= 95% (regia e schermo) e mai enorme · sul bordo in media ${(100 * E.reduce((a, e) => a + (e.r.qBordo || 0), 0) / E.length).toFixed(1)}% · eroe e pallone insieme in media ${(100 * E.reduce((a, e) => a + (e.r.qInsieme || 0), 0) / E.length).toFixed(1)}% · instabili (verdi alla ripetizione) ${inst.length} · rosse ${rossi.length} · gi55: ${e55.length - r55.length}/${e55.length} senza pallone dentro il portiere`);
  if (rossi.length || r55.length || !e55.length) rc = 1;
}
if (!process.env.CPM_SOLO_VERDE) {
  const { esiti: E, e55 } = await braccio(true, testimoni);
  const visto = E.filter(e => e.v.some(x => x.startsWith('eroe in quadro (regia)'))), ng = E.filter(e => !e.r.giudicata), v55 = e55.filter(e => e.v.some(x => x.startsWith('pallone dentro')));
  rapporto.rosso = { azioni: E.map(e => ({ gi: e.a.gi, k: e.a.k, fam: e.a.fam, violazioni: e.v, qDentro: e.r.qDentro })), gi55: e55.map(e => ({ kd: e.r.kd, g: e.g, violazioni: e.v })) };
  console.log(`\nROSSO: eroe fuori dal quadro della regia (sotto il 95%) visto in ${visto.length}/${E.length} testimoni (minimo ${ROSSO_MIN}) · sul bordo in media ${(100 * E.reduce((a, e) => a + (e.r.qBordo || 0), 0) / E.length).toFixed(1)}% · non giudicate ${ng.length} · gi55 col pallone dentro il portiere ${v55.length}/${e55.length}`);
  if (visto.length < ROSSO_MIN) { console.log('  ✗ il braccio rosso NON e\' rosso sulla camera: il guardiano non vede il difetto che dichiara di guardare'); rc = 1; }
  const p55 = e55.filter(e => e.r.kd === 'post').length;
  if (!e55.length || p55 < e55.length) { console.log(`  ✗ il braccio rosso NON e' rosso su gi55: senza la correzione l'esito in scena deve restare «palo» (visto ${p55}/${e55.length})`); rc = 1; }
  else console.log(`  gi55 senza la correzione: esito in scena «palo» ${p55}/${e55.length} (e' la condizione del difetto: nel banco il pallone entra nel portiere 1 volta su 8, quando nessun palo e' libero)`);
}
const errs = [...new Set(page._errs)]; if (errs.length) console.log('pageerror: ' + errs.slice(0, 3).join(' | '));
await page.close().catch(() => {}); await b.close(); srv.close();
fs.writeFileSync(path.join(OUT, 'guardiano.json'), JSON.stringify(rapporto, null, 1));
console.log(`\n${rc ? '❌ camera-241 ROSSO' : '✅ camera-241 VERDE (verde col verde, rosso col rosso)'} · ${Math.round((Date.now() - T0) / 1000)} s`);
process.exit(rc);
