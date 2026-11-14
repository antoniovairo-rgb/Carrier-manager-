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
const PROVOCA = +(process.env.CPM_PROVOCA || 0); /* [giro 187] vedi il ciclo di partita */
const SOLO = !!process.env.CPM_SOLO; /* [giro 187] CPM_SOLO=1: soli highlight forzati dal gancio __CPM_SOLO166 (solo per CERCARE candidati in fretta: il guardiano gioca la partita intera) */
const PROD = !!process.env.CPM_PROD, ROSSO191 = !!process.env.CPM_ROSSO191; /* [giro 191] */
const SPEED = process.env.CPM_SPEED || '2', ROSSO = !!process.env.CPM_ROSSO, CAP = +(process.env.CPM_CAP || 420000);
const NOMI = process.env.CPM_NOMI ? process.env.CPM_NOMI.split(',') : Array.from({ length: N }, (_, i) => `${TAG}-${i}`);
const SEMI = process.env.CPM_SEMI ? process.env.CPM_SEMI.split(',').map(Number) : null; /* seme dell'autoplay per partita (default: indice+1) */
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`; const b = await launchBrowser();

async function partita(nome, idx) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + nome;
  await page.addInitScript(([s, k, sp, r, so, pr, r191]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1;
    if (k != null) window.__CPM_RIG190_K = k; if (r) window.__CPM_NO_G139 = 1; if (so) window.__CPM_SOLO166 = 1; if (!pr) window.__CPM_NO_G154 = 1; if (r191) window.__CPM_NO_G191A = 1;/* [giro 191] CPM_PROD=1: come in produzione (il rigore dell'eroe fuori scena lo batte un compagno); CPM_ROSSO191=1: braccio rosso del giro 191 *//* [giro 154] dal PO-357 il rigore dell'eroe fuori scena lo batte un compagno: le battute del motore dell'eroe non esistono piu' e il guardiano del giro 139 restava non giudicato. Si ricrea quella condizione in ENTRAMBI i bracci, come pagella-75 */
    localStorage.setItem('cpm-match-speed', sp); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, K, SPEED, ROSSO, SOLO, PROD, ROSSO191]);
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
  /* CPM_SPIA=1: avvolge tick() del motore (lato sonda, nessun ramo nel gioco) e registra, per ogni passo con un rigore fermo, il minuto
     passato, se era decisivo, i passi d'attesa _o27 e se il live aveva accettato la scena (_acc94), piu' chi ha chiamato attendiPiazzato */
  if (process.env.CPM_SPIA) await page.evaluate(() => { const arm = () => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!M || !M.tick || M._spia139) return !!(M && M._spia139);
    M._spia139 = 1; const W = (window.__CPM_SPIA139 = []); const t0 = M.tick.bind(M); const S = M._S;
    M.tick = function (ctx) { const f = S.fermo; const out = t0(ctx); const f2 = S.fermo; const pen = (f && f.kind === 'pen') || (f2 && f2.kind === 'pen');
      if (pen || out.some(e => e && (e.t === 'battuta' || e.t === 'occasione_eroe')) ) { if (W.length < 4000) W.push({ min: ctx.min, dec: !!ctx.dec, sc: !!S.scena, rp: !!(S.richieste && S.richieste.piazzati), o27: f ? f._o27 | 0 : null, acc: f ? f._acc94 | 0 : null, t: f ? f.t : null, ev: out.filter(e => e && /battuta|occasione_eroe|rigore|tiro|gol/.test(e.t)).map(e => e.t + (e.chi && e.chi.eroe ? '*' : '')).join(',') }); }
      return out; };
    const ap = M.chiedi && M.chiedi.attendiPiazzato; if (ap) M.chiedi.attendiPiazzato = function () { const r = ap.apply(this, arguments); W.push({ attendi: 1, r, min: S.min, o27: S.fermo ? S.fermo._o27 | 0 : null }); return r; };
    return true; }; window.__arm139 = setInterval(() => { if (arm()) clearInterval(window.__arm139); }, 50); });
  const fasi = []; let ph = '', last = '', provocato = false;
  while (Date.now() - t0 < CAP) {
    const s = await page.evaluate(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), min: M && M._S ? M._S.min | 0 : null, no94: M && M._S ? M._S.noPiaz94 : null }; } catch (e) { return {}; } });
    /* [giro 187] CPM_PROVOCA=<minuto>: cio' che il gioco non produce si provoca dalla sonda (PROCESSO.md). A quel minuto del motore, a
       gioco fluido, si chiede al motore un rigore per la squadra dell'eroe con l'eroe battitore (chiedi.piazzato, come carriera3-94 D2):
       da li' in poi offerta, attesa, scena e battuta seguono il gioco. Una volta sola; testimone in __CPM_PEN94 (t:'provocato'). */
    if (PROVOCA && !provocato && s.min != null && s.min >= PROVOCA && s.ph === 'playing') provocato = await page.evaluate((m) => { try { const M = window.__CPM_MOTORE_OBJ(); M.chiedi.piazzato({ lato: 'home', kind: 'pen', x: 89, y: 50, batt: 21 }); (window.__CPM_PEN94 = window.__CPM_PEN94 || []).push({ min: M._S.min | 0, t: 'provocato', fermo: M._S.fermo ? M._S.fermo.kind + ':' + (M._S.fermo.batt) : null }); return true; } catch (e) { return false; } }, PROVOCA);
    ph = s.ph || ''; if (ph !== last) { fasi.push((s.min == null ? '?' : s.min) + ':' + ph + (s.no94 != null ? '|g' + s.no94 : '')); last = ph; }
    if (ph === 'ended' || ph === 'ceremony') break; await sleep(400);
  }
  const R = await page.evaluate(() => ({ spia: window.__CPM_SPIA139 || null, pen: window.__CPM_PEN94 || [], score: window.__CPM_SCORE ? window.__CPM_SCORE() : null,
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
/* [giro 191 PO-399] DOPO IL CALCIO DEL MOTORE: una scena di rigore dell'eroe (piazzato_giocato entro 6' da un'occasione da rigore)
   giocata quando il motore aveva gia' battuto quel rigore (una battuta, di chiunque, fra l'occasione e la scena). */
const dopo191 = [];
for (const r of giud) { let occ = null; const P = r.pen || [];
  for (let i = 0; i < P.length; i++) { const e = P[i]; if (e.t === 'occasione_eroe') occ = { min: e.min, i };
    if (e.t === 'piazzato_giocato' && occ && e.min - occ.min <= 6) { const bat = P.slice(occ.i + 1).filter(q => q.t === 'battuta' && q.min <= e.min + 1 && q.min >= occ.min);
      const vuoto = String(e.fermo || '').startsWith('nullo');
      if (bat.length || vuoto) dopo191.push({ nome: r.nome, occ: occ.min, scena: e.min, fermo: e.fermo, battute: bat.map(q => q.min + (q.eroe ? '*' : '')) }); occ = null; } } }
const S = { partite: res.length, giudicate: giud.length, rigoriMotore: rig, battuteEroe: batt, doppi: doppi.length, dettaglioDoppi: doppi, dopo191: dopo191.length, dettaglioDopo191: dopo191, prod: PROD, rosso191: ROSSO191, K, rosso: ROSSO, speed: SPEED };
if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify({ S, res }, null, 1));
console.log('RIASSUNTO ' + JSON.stringify(S));
