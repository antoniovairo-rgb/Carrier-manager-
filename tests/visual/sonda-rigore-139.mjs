#!/usr/bin/env node
/* [giro 139] SONDA DEL DOPPIO RIGORE DELL'EROE, CASO NATURALE (strumento, non guardiano).
   Giro 111: dopo il gol di rigore dell'eroe al 77' (rigore concesso dal motore al 75') l'eroe ha avuto una SECONDA battuta di rigore
   al 78' (testimone __CPM_PEN94). Il guardiano carriera3-94 D2 il rigore lo PROVOCA scrivendo lo stato nel motore; qui no: il rigore
   lo concede il motore da un fallo in area, come in partita.
   Partite di carriera vere dal salvataggio fixtures/save-190-s12-ovr93.json (l'unico percorso che arriva al 90': il provino di
   openMatch fischia al 50'), autoplay seedato. Il seme di partita nasce da avversario+stagione+settimana+NOME: ogni partita cambia il
   NOME del giocatore nel salvataggio, quindi ogni partita e' davvero diversa (stampata l'impronta per dimostrarlo).
   Registra per partita: tutte le voci di __CPM_PEN94 (rigori del motore, battute, tiri, occasioni d'eroe da rigore, piazzati giocati
   in scena, gol in scena), gli eventi di __CPM_EV, le fasi da __CPM_PHASE col minuto. Una «battuta di rigore dell'eroe» e':
     - scena: `piazzato_giocato` (handleSetPiece ha risolto un rigore/punizione dell'eroe) con un'occasione da rigore aperta prima, o
     - motore: `battuta` kind pen calciata dall'eroe (il motore lo fa tirare a gioco fluido).
   Uso: CPM_N=12 [CPM_PAR=2] [CPM_K=1] [CPM_TAG=a] [CPM_NOMI=a,b] [CPM_SEMI=7,13] [CPM_SPEED=2] [CPM_ROSSO=1] node sonda-rigore-139.mjs
     CPM_K: se dato, __CPM_RIG190_K (probabilita' che un fallo in area sia rigore; il gioco usa 0,25). Il rigore resta CONCESSO DAL
            MOTORE (fallo vero in area, nessuno stato scritto dalla sonda): cambia solo quanto spesso.
     CPM_ROSSO=1 accende __CPM_NO_G139 (braccio rosso della correzione del giro 139, se esiste).
   Esce sempre 0 (strumento); il riassunto sta nell'ultima riga RIASSUNTO {...} e in CPM_OUT (json). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const N = +(process.env.CPM_N || 6), PAR = Math.max(1, +(process.env.CPM_PAR || 2)), TAG = process.env.CPM_TAG || 'g139';
const K = process.env.CPM_K != null && process.env.CPM_K !== '' ? +process.env.CPM_K : null;
const SPEED = process.env.CPM_SPEED || '2', ROSSO = !!process.env.CPM_ROSSO, CAP = +(process.env.CPM_CAP || 420000);
const NOMI = process.env.CPM_NOMI ? process.env.CPM_NOMI.split(',') : Array.from({ length: N }, (_, i) => `${TAG}-${i}`);
const SEMI = process.env.CPM_SEMI ? process.env.CPM_SEMI.split(',').map(Number) : null; /* seme dell'autoplay per partita (default: indice+1) */
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`; const b = await launchBrowser();

async function partita(nome, idx) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + nome;
  await page.addInitScript(([s, k, sp, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1;
    if (k != null) window.__CPM_RIG190_K = k; if (r) window.__CPM_NO_G139 = 1;
    localStorage.setItem('cpm-match-speed', sp); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, K, SPEED, ROSSO]);
  const t0 = Date.now();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), SEMI ? SEMI[idx % SEMI.length] : idx + 1);
  } catch (e) { await ctx.close(); return { nome, err: 'apertura: ' + String(e.message).slice(0, 120) }; }
  const fasi = []; let ph = '', last = '';
  while (Date.now() - t0 < CAP) {
    const s = await page.evaluate(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), min: M && M._S ? M._S.min | 0 : null, no94: M && M._S ? M._S.noPiaz94 : null }; } catch (e) { return {}; } });
    ph = s.ph || ''; if (ph !== last) { fasi.push((s.min == null ? '?' : s.min) + ':' + ph + (s.no94 != null ? '|g' + s.no94 : '')); last = ph; }
    if (ph === 'ended' || ph === 'ceremony') break; await sleep(400);
  }
  const R = await page.evaluate(() => ({ pen: window.__CPM_PEN94 || [], score: window.__CPM_SCORE ? window.__CPM_SCORE() : null,
    ev: (typeof window.__CPM_EV === 'function' ? window.__CPM_EV() : []).filter(e => e && /goal|scena|recita|fine|rigore|pen/i.test(JSON.stringify(e))).slice(0, 200).map(e => JSON.stringify(e).slice(0, 160)),
    conta: (() => { try { const S = window.__CPM_MOTORE_OBJ()._S; return { piaz94: S.conta.piaz94 | 0, piazNo94: S.conta.piazNo94 | 0, rigNo190: S.conta.rigNo190 | 0, g139: S.conta.g139 | 0 }; } catch (e) { return null; } })() })).catch(e => ({ err: String(e.message) }));
  await ctx.close();
  return { nome, fine: ph, s: Math.round((Date.now() - t0) / 1000), errs: errs.length, fasi, ...R };
}

/* battute di rigore dell'eroe: dalla registrazione __CPM_PEN94 */
function battute(P) {
  const out = []; let occ = -99;
  for (const e of P) {
    if (e.t === 'occasione_eroe') occ = e.min;
    if (e.t === 'battuta' && e.eroe) out.push({ min: e.min, via: 'motore' });
    if (e.t === 'piazzato_giocato' && e.min - occ <= 6) out.push({ min: e.min, via: 'scena', fermo: e.fermo, tolto: e.tolto });
  }
  return out;
}

const res = []; let next = 0;
async function lavoratore() { while (next < NOMI.length) { const i = next++; const r = await partita(NOMI[i], i); res.push(r);
  const bt = battute(r.pen || []);
  console.log(`[${res.length}/${NOMI.length}] ${r.nome} fine=${r.fine} ${r.s}s errs=${r.errs} score=${JSON.stringify(r.score)} rigori=${(r.pen || []).filter(e => e.t === 'rigore').length} battuteEroe=${bt.map(x => x.min + "'" + x.via).join(',') || '-'} conta=${JSON.stringify(r.conta)}`);
  console.log('   PEN94: ' + (r.pen || []).map(e => e.min + "'" + e.t + (e.eroe ? '*' : '') + (e.per ? '(' + e.per + ')' : '') + (e.fermo ? '[' + e.fermo + (e.tolto ? ',tolto' : '') + ']' : '') + (e.kind ? '{' + e.kind + '}' : '')).join(' '));
  if (r.err) console.log('   ERR ' + r.err);
} }
await Promise.all(Array.from({ length: PAR }, lavoratore));
await b.close(); srv.close();

const giud = res.filter(r => r.fine === 'ended' || r.fine === 'ceremony');
let rig = 0, batt = 0; const doppi = [];
for (const r of giud) { rig += (r.pen || []).filter(e => e.t === 'rigore').length; const bt = battute(r.pen || []); batt += bt.length;
  for (let i = 1; i < bt.length; i++) if (bt[i].min - bt[i - 1].min <= 10) doppi.push({ nome: r.nome, a: bt[i - 1], b: bt[i] }); }
const S = { partite: res.length, giudicate: giud.length, rigoriMotore: rig, battuteEroe: batt, doppi: doppi.length, dettaglioDoppi: doppi, K, rosso: ROSSO, speed: SPEED };
if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify({ S, res }, null, 1));
console.log('RIASSUNTO ' + JSON.stringify(S));
