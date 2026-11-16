#!/usr/bin/env node
/* GUARDIANO dribbling-226 — giro 226, PO-491 «Migliora anche i dribbling, alcuni sono davvero confusionari».
   Stesso strumento del banco che ha preso la decisione (lib/dribbling-226.mjs, testimone __CPM_G226W di src/12), GLB ACCESO, pagina
   nuova ogni 4 esecuzioni. Provoca le azioni di dribbling dell'eroe di TUTTE le varianti del catalogo (dribbling puro, finta,
   rientro, sterzata, doppio passo, roulette; CPM_PER_VARIANTE azioni per variante, default 2) con esito riuscito e fallito e
   pretende, per ogni esecuzione:
     1. PALLONE AL PIEDE  quando e' «controllato» (conduzione dell'eroe, a terra, niente arco) non oltre 2,0u dal piede in piu' del 10% dei fotogrammi
     2. CORPI             eroe e avversario mai coi centri sotto 0,5u per piu' di 0,15 s di scena
     3. MOTO              nessuna accelerazione oltre 80 u/s², nessuna inversione oltre 120° in corsa, nessun teletrasporto di eroe o pallone
     4. ESITO             cio' che si vede a fine scena non smentisce il testo (gol ⇒ in rete; fallita ⇒ non in rete; palla persa ⇒ non all'eroe)
     5. CAMERA            nessun salto fuori dagli stacchi neri; eroe in quadro nel tratto di dribbling (fuori ≤ 15% dei fotogrammi)
     6. DUELLO            la finta si gioca davanti a un avversario: il piu' vicino entro 3,5u (mediana sul tratto di finta)
     7. GESTO             la finta ha una clip montata (senza gesto ≤ 40% dei fotogrammi della finta)
   Le soglie stanno in lib/dribbling-226.mjs → S, dichiarate prima di misurare. «Non giudicata» = ROSSO.
   RIPETIZIONE DICHIARATA (PROCESSO «Controlli instabili»): il gioco ha sorteggi non seedati nei voli; una esecuzione rossa si rifa'
   UNA volta su pagina nuova. Verde = verde alla prima o alla ripetizione (contata e stampata come «instabile»); rosso = due su due.
   BRACCIO ROSSO (window.__CPM_NO_G226, la regia del duello spenta): sulle stesse azioni il guardiano DEVE trovare violazioni del
   punto 6 (finta nel vuoto) in almeno CPM_ROSSO_MIN esecuzioni (default 3) — senza ripetizioni. Esce 0 solo con verde verde E rosso rosso.
   USO: CPM_CHROME=/opt/pw-browsers/chromium node dribbling-226.mjs     (CPM_SOLO_VERDE=1 / CPM_SOLO_ROSSO=1 per un braccio solo)   */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, __dirname as LIBDIR } from './lib/harness.mjs';
import { S, INIT, catalogo, esegui, rigaBreve, sleep } from './lib/dribbling-226.mjs';

const OUT = path.join(LIBDIR, '..', 'out', 'dribbling-226'); fs.mkdirSync(OUT, { recursive: true });
const PER_VAR = Math.max(1, +(process.env.CPM_PER_VARIANTE || 2)), PER_PAGINA = 4, ROSSO_MIN = +(process.env.CPM_ROSSO_MIN || 3);
const T0 = Date.now();
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function nuovaPagina(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT);
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_G226 = 1; });
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  page._glb = await page.evaluate(() => window.__CPM_GLB_READY === true);
  await sleep(600);
  return page;
}
/* le sette pretese su una esecuzione → elenco delle violazioni (vuoto = verde) */
function violazioni(r) {
  if (!r.giudicata) return ['NON GIUDICATA: ' + (r.nonGiud || r.errore || '?')];
  const m = r.m, v = [];
  if (m.palla.nCtrl >= 5 && m.palla.qStacc > S.Q_STACCATO) v.push(`1 pallone staccato dal piede nel ${(m.palla.qStacc * 100).toFixed(0)}% dei fotogrammi controllati (max ${m.palla.dMax}u)`);
  if (m.comp.t > S.T_COMP) v.push(`2 corpi compenetrati per ${m.comp.t}s (minimo ${m.comp.dMin}u)`);
  if (m.moto.accOltre || m.moto.giri || m.moto.saltiEroe || m.moto.saltiPalla) v.push(`3 moto: ${m.moto.accOltre} accelerazioni oltre soglia (max ${m.moto.aMax}), ${m.moto.giri} inversioni, ${m.moto.saltiEroe} salti eroe, ${m.moto.saltiPalla} salti pallone${m.moto.es.length ? ' — ' + m.moto.es[0] : ''}`);
  if (m.coerenza) v.push('4 esito: ' + m.coerenza);
  if (m.camera.salti) v.push(`5 camera: ${m.camera.salti} salti fuori dagli stacchi`);
  if (m.camera.qFuoriEroeDrib != null && m.camera.qFuoriEroeDrib > S.Q_FUORI) v.push(`5 camera: eroe fuori quadro nel ${(m.camera.qFuoriEroeDrib * 100).toFixed(0)}% del tratto di dribbling`);
  if (m.duello == null) v.push('6 duello NON GIUDICATO: nessun tratto di finta nel testimone');
  else if (m.duello > S.D_DUELLO) v.push(`6 finta nel vuoto: avversario piu' vicino a ${m.duello}u`);
  if (m.gesti.qSenzaGesto == null) v.push('7 gesto NON GIUDICATO');
  else if (m.gesti.qSenzaGesto > S.Q_SENZA_GESTO) v.push(`7 finta senza gesto nel ${(m.gesti.qSenzaGesto * 100).toFixed(0)}% dei fotogrammi`);
  return v;
}

let page = await nuovaPagina(false);
const TOT = await page.evaluate(() => SITUATIONS.length);
const cat = await catalogo(page);
const perVar = {}; for (const a of cat) (perVar[a.v] = perVar[a.v] || []).push(a);
const scelte = []; for (const v of Object.keys(perVar).sort()) scelte.push(...perVar[v].slice(0, PER_VAR));
console.log(`[dribbling-226] catalogo ${cat.length} azioni · varianti: ${Object.entries(perVar).map(([k, v]) => `${k} ${v.length}`).join(', ')}`);
console.log(`[dribbling-226] provate ${scelte.length} azioni × riuscito/fallito: ${scelte.map(a => `gi${a.gi}k${a.k}`).join(' ')} · GLB ${page._glb ? 'acceso' : 'NON PRONTO'}`);

async function braccio(rosso, azioni) {
  console.log(`\n== ${rosso ? 'ROSSO (__CPM_NO_G226)' : 'VERDE'} ==`);
  if (rosso) { await page.close().catch(() => {}); page = await nuovaPagina(true); }
  let usate = 0; const esiti = [];
  const una = async (a, out) => { if (usate >= PER_PAGINA) { await page.close().catch(() => {}); page = await nuovaPagina(rosso); usate = 0; } usate++; let r; try { r = await esegui(page, { ...a, out }, { totale: TOT }); } catch (e) { r = { ...a, out, errore: String(e.message || e).slice(0, 160) }; } return r; };
  for (const a of azioni) for (const out of ['success', 'fail']) {
    let r = await una(a, out); let v = violazioni(r); let instabile = false;
    if (v.length && !rosso) { console.log(`  ↻ ${rigaBreve(r)}\n      prima passata rossa: ${v.join(' · ')} — si ripete una volta su pagina nuova`); usate = PER_PAGINA; const r2 = await una(a, out); const v2 = violazioni(r2); if (!v2.length) instabile = true; r = r2; v = v2; }
    esiti.push({ a, out, r, v, instabile });
    console.log(`  ${v.length ? '❌' : (instabile ? '⚠️' : '✅')} ${rigaBreve(r)}`); for (const x of v) console.log('      ✗ ' + x);
  }
  return esiti;
}

let rc = 0; const rapporto = { quando: new Date().toISOString(), soglie: S };
if (!process.env.CPM_SOLO_ROSSO) {
  const E = await braccio(false, scelte);
  const rossi = E.filter(e => e.v.length), inst = E.filter(e => e.instabile);
  rapporto.verde = E.map(e => ({ gi: e.a.gi, k: e.a.k, v: e.a.v, out: e.out, violazioni: e.v, instabile: e.instabile, m: e.r.m || null }));
  console.log(`\nVERDE: ${E.length - rossi.length}/${E.length} esecuzioni senza violazioni · instabili (verdi alla ripetizione) ${inst.length} · rosse ${rossi.length}`);
  if (rossi.length) rc = 1;
}
if (!process.env.CPM_SOLO_VERDE) {
  /* braccio rosso: la prima azione di ogni variante */
  const azR = Object.keys(perVar).sort().map(v => perVar[v][0]);
  const E = await braccio(true, azR);
  const visto = E.filter(e => e.v.some(x => x.startsWith('6 finta nel vuoto'))), qualunque = E.filter(e => e.v.length), ng = E.filter(e => !e.r.giudicata);
  rapporto.rosso = E.map(e => ({ gi: e.a.gi, k: e.a.k, v: e.a.v, out: e.out, violazioni: e.v, m: e.r.m || null }));
  console.log(`\nROSSO: finta nel vuoto vista in ${visto.length}/${E.length} esecuzioni (minimo ${ROSSO_MIN}) · con almeno una violazione ${qualunque.length} · non giudicate ${ng.length}`);
  if (visto.length < ROSSO_MIN) { console.log('  ✗ il braccio rosso NON e\' rosso: il guardiano non vede il difetto che dichiara di guardare'); rc = 1; }
}
const errs = [...new Set(page._errs)]; if (errs.length) console.log('pageerror: ' + errs.slice(0, 3).join(' | '));
await page.close().catch(() => {}); await b.close(); srv.close();
fs.writeFileSync(path.join(OUT, 'guardiano.json'), JSON.stringify(rapporto, null, 1));
console.log(`\n${rc ? '❌ dribbling-226 ROSSO' : '✅ dribbling-226 VERDE (verde col verde, rosso col rosso)'} · ${Math.round((Date.now() - T0) / 1000)} s`);
process.exit(rc);
