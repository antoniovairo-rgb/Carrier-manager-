#!/usr/bin/env node
/* [giro 264] GUARDIANO «il battito del motore e l'apertura della scena hanno un ordine solo» — `npm run battito-264`.
   La partita intera e quella a soli highlight sono la stessa partita solo se, quando la scena gioca (giocaScena, src/14), il motore
   ha ricevuto gli stessi passi e consumato le stesse estrazioni del suo flusso rnd. Prima del giro 264 la partita intera poteva
   ricevere un passo in piu' fra il battito che apre la scena e la scena: l'intervallo del metronomo si spegneva solo quando React
   aveva reso (tempo reale). Dal 264 ogni battito dell'intervallo gira dentro flushSync (src/15, _batt264), come nel lotto.
   COSA FA. Gioca la stessa partita («Collaudo Salienti», seme 7300) intera e a soli highlight fino al minuto CPM_MIN (30) e confronta:
     a. il libro mastro voce per voce (senza ts/t/npd), sul tratto comune;
     b. per ogni scena, le estrazioni rnd gia' consumate e il minuto del motore all'ingresso in giocaScena (testimone __CPM_RND14).
   LA GARA SI PROVOCA DALLA SONDA (regola «ciò che il gioco non produce si provoca»): a tempo reale la gara esce in ~1 corsa su 5-10.
   Nelle coppie «provocate» l'intervallo del metronomo (periodo 77 ms a 1x) batte DUE volte di fila senza restituire il controllo al
   browser — e' quello che succede su un processore conteso quando due scadenze arrivano prima che React renda. La seconda battuta
   rispetta clearInterval come farebbe il browser (un intervallo spento non batte piu').
   Bracci: VERDE = CPM_NV (2) coppie provocate + 1 a tempo reale, 0 divergenze. ROSSO (`__CPM_NO_G264`) = fino a CPM_NR (2) coppie
   provocate, almeno una divergenza. Coppia senza scene o non montata = NON GIUDICATO = rosso. Verde e rosso stampati per ultimi. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(QUI, '../..');
const MIN = +(process.env.CPM_MIN || 30), NV = +(process.env.CPM_NV || 2), NR = +(process.env.CPM_NR || 2), PER = +(process.env.CPM_PER || 77);

/* ---- statico ---- */
const s15 = fs.readFileSync(path.join(ROOT, 'src/15-live-match.jsx'), 'utf8');
const statico = (s15.match(/const _batt264=\(\)=>\{ReactDOM\.flushSync\(_batt166\);\};/g) || []).length === 1
  && /setInterval\(_solo166\?_lotto166:\(_g264\?_batt264:_batt166\),/.test(s15) && /const _g264=!\(typeof window!=='undefined'&&window\.__CPM_NO_G264\);/.test(s15);

/* la provocazione: gira nella pagina prima del gioco */
function provoca(per) { const si = window.setInterval, ci = window.clearInterval; const spenti = new Set(); window.__P264 = { doppi: 0, per };
  window.clearInterval = function (id) { spenti.add(id); return ci.call(window, id); };
  window.setInterval = function (fn, ms, ...a) { if (ms !== per || typeof fn !== 'function') return si.call(window, fn, ms, ...a);
    const id = si.call(window, function () { fn(); if (!spenti.has(id)) { window.__P264.doppi++; fn(); } }, ms); return id; }; }
async function una(modo, rosso, prov) {
  const A = await apriCarriera166({ nome: 'Collaudo Salienti', init: rosso ? { __CPM_NO_G264: true } : {} });
  /* la provocazione si arma a carriera aperta, prima del prompt: tocca solo gli intervalli nati da qui in poi (il metronomo) */
  if (prov && modo === 'intera') await A.page.evaluate(`(${provoca.toString()})(${PER})`);
  await A.page.evaluate(() => { window.__CPM_RND14 = {}; window.__T264 = { tick: 0, scene: [] };
    const tot = () => { let s = 0; const r = window.__CPM_RND14 || {}; for (const k in r) s += r[k] | 0; return s; };
    const iv = setInterval(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!M || M.__t264) return; M.__t264 = 1;
      const g0 = M.giocaScena; if (g0) M.giocaScena = function (o) { const p = { rnd: tot(), smin: M._S && M._S.min, fam: o && o.fam }; const r = g0.apply(this, arguments); p.esito = r && (r.esito || (r.ok ? 'ok' : 'no')); window.__T264.scene.push(p); return r; };
      clearInterval(iv); } catch (e) {} }, 3); });
  let g = { ev: [], note: ['non aperta'] }, T = null, P = null;
  try { if (!A.W) throw new Error('nessuna settimana con giornata di lega'); await apriPrompt166(A.page); g = await gioca166(A.page, modo, { seme: 7300, fermaAlMinuto: MIN });
    T = await A.page.evaluate(() => window.__T264); P = await A.page.evaluate(() => window.__P264 || null); } catch (e) { g.note = [...(g.note || []), String(e.message).slice(0, 120)]; }
  await A.b.close(); A.srv.close(); return { seq: seq166(g.ev || []), scene: (T && T.scene) || [], doppi: P ? P.doppi : 0, err: A.errs.slice(0, 3), min: g.minMax | 0, note: g.note || [] };
}
async function coppia(rosso, prov) {
  const I = await una('intera', rosso, prov), S = await una('solo', rosso, false);
  const L = Math.min(I.seq.length, S.seq.length); let d = -1; for (let i = 0; i < L; i++) if (JSON.stringify(I.seq[i]) !== JSON.stringify(S.seq[i])) { d = i; break; }
  const K = Math.min(I.scene.length, S.scene.length); let dm = -1; for (let i = 0; i < K; i++) if (I.scene[i].rnd !== S.scene[i].rnd || I.scene[i].smin !== S.scene[i].smin) { dm = i; break; }
  const giud = L >= 20 && K >= 1 && I.min >= MIN && S.min >= MIN && I.err.length === 0 && S.err.length === 0 && (!prov || I.doppi > 50);
  return { rosso, prov, giud, d, dm, voci: [I.seq.length, S.seq.length], scene: [I.scene.length, S.scene.length], doppi: I.doppi, min: [I.min, S.min],
    info: d >= 0 ? `prima voce diversa ${d}: ${JSON.stringify(I.seq[d]).slice(0, 110)} ≠ ${JSON.stringify(S.seq[d]).slice(0, 110)}` : (dm >= 0 ? `scena ${dm}: motore ${JSON.stringify(I.scene[dm])} ≠ ${JSON.stringify(S.scene[dm])}` : 'identiche'),
    primaScena: dm >= 0 ? [I.scene[dm], S.scene[dm]] : null, err: [...I.err, ...S.err], note: [...I.note, ...S.note] };
}
const riga = c => `  ${c.giud ? (c.d < 0 && c.dm < 0 ? '=' : '≠') : '?'} ${c.prov ? 'provocata' : 'tempo reale'} · voci ${c.voci.join('/')} · scene ${c.scene.join('/')} · minuti ${c.min.join('/')} · battute doppie ${c.doppi} · ${c.info}${c.giud ? '' : ' · NON GIUDICATO ' + JSON.stringify(c.err) + ' ' + c.note.join(' ')}`;
const V = []; for (let i = 0; i < NV; i++) V.push(await coppia(false, true)); V.push(await coppia(false, false));
const R = []; for (let i = 0; i < NR; i++) { const c = await coppia(true, true); R.push(c); if (c.giud && (c.d >= 0 || c.dm >= 0)) break; }
console.log(`A. STATICO  ${statico ? '✓' : '✗'} un solo _batt264 che chiama il battito in flushSync, usato dall'intervallo quando __CPM_NO_G264 e' assente`);
console.log(`B. VERDE (fino al ${MIN}')`); for (const c of V) console.log(riga(c));
console.log('C. ROSSO (__CPM_NO_G264)'); for (const c of R) console.log(riga(c));
const divV = V.filter(c => c.d >= 0 || c.dm >= 0).length, ngV = V.filter(c => !c.giud).length, divR = R.filter(c => c.giud && (c.d >= 0 || c.dm >= 0)).length;
const verde = statico && ngV === 0 && divV === 0, rossoCade = divR > 0;
console.log(`MISURA — verde: divergenti ${divV} su ${V.length} coppie (non giudicate ${ngV}) · rosso: divergenti ${divR} su ${R.length}`);
console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
console.log(`ROSSO: ${rossoCade ? 'CADE (come deve): la partita intera diverge dai soli highlight' : 'NON CADE — il guardiano e\' cieco'}`);
process.exit(verde && rossoCade ? 0 : 1);
