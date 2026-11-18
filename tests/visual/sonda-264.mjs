#!/usr/bin/env node
/* [giro 264] SONDA (non guardiano): ripete la misura del 259 (sonda-259b) per CPM_N corse. Ogni corsa gioca la stessa partita
   («Collaudo Salienti», seme 7300) intera e a soli highlight, fermate al minuto CPM_MIN (12), e confronta il libro mastro.
   In piu' registra, dentro la pagina, l'ordine delle chiamate al motore: quanti passi (tick) e quante estrazioni del flusso rnd
   (__CPM_RND14) ha gia' consumato il motore quando la scena gioca (giocaScena). Se i due modi differiscono li', la partita che segue
   e' un'altra partita. CPM_ROSSO=1 accende window.__CPM_NO_G264. CPM_VEL = velocita' della partita intera (1 · 1.5 · 2). */
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const MIN = +(process.env.CPM_MIN || 12), N = +(process.env.CPM_N || 20), ROSSO = process.env.CPM_ROSSO === '1', VEL = process.env.CPM_VEL || '1';
async function una(modo) {
  const A = await apriCarriera166({ nome: 'Collaudo Salienti', vel: modo === 'intera' ? VEL : '1', init: ROSSO ? { __CPM_NO_G264: true } : {} });
  await A.page.evaluate(() => { window.__CPM_RND14 = {}; window.__T264 = { tick: 0, scene: [], avvolto: false };
    const tot = () => { let s = 0; const r = window.__CPM_RND14 || {}; for (const k in r) s += r[k] | 0; return s; };
    const iv = setInterval(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!M || M.__t264) return; M.__t264 = 1; window.__T264.avvolto = true;
      const t0 = M.tick; M.tick = function (o) { window.__T264.tick++; window.__T264.um = o && o.min; return t0.apply(this, arguments); };
      const g0 = M.giocaScena; if (g0) M.giocaScena = function (o) { const prima = { tick: window.__T264.tick, rnd: tot(), um: window.__T264.um, smin: M._S && M._S.min, fam: o && o.fam };
        const r = g0.apply(this, arguments); prima.esito = r && (r.esito || (r.ok ? 'ok' : 'no')); window.__T264.scene.push(prima); return r; };
      clearInterval(iv); } catch (e) {} }, 3); });
  await apriPrompt166(A.page);
  const g = await gioca166(A.page, modo, { seme: 7300, fermaAlMinuto: MIN });
  const T = await A.page.evaluate(() => window.__T264).catch(() => null);
  await A.b.close(); A.srv.close(); return { seq: seq166(g.ev || []), T, err: A.errs };
}
let div = 0, divMot = 0, nonGiud = 0; const t00 = Date.now();
for (let n = 1; n <= N; n++) {
  const I = await una('intera'), S = await una('solo');
  let d = -1; const L = Math.min(I.seq.length, S.seq.length); for (let i = 0; i < L; i++) if (JSON.stringify(I.seq[i]) !== JSON.stringify(S.seq[i])) { d = i; break; }
  const sI = (I.T && I.T.scene) || [], sS = (S.T && S.T.scene) || [];
  /* prima scena in cui il motore arriva con un conto diverso di passi o di estrazioni */
  let dm = -1; for (let i = 0; i < Math.min(sI.length, sS.length); i++) if (sI[i].tick !== sS[i].tick || sI[i].rnd !== sS[i].rnd) { dm = i; break; }
  const giud = L >= 8 && sI.length > 0 && sS.length > 0; if (!giud) nonGiud++;
  if (d >= 0) div++; if (dm >= 0) divMot++;
  console.log(JSON.stringify({ corsa: n, voci: [I.seq.length, S.seq.length], primaDiff: d, I: d >= 0 ? I.seq[d] : null, S: d >= 0 ? S.seq[d] : null, sceneI: sI.slice(0, 3), sceneS: sS.slice(0, 3), giudicata: giud, err: [I.err.length, S.err.length] }));
}
console.log(JSON.stringify({ FINE: true, rosso: ROSSO, vel: VEL, corse: N, divergentiLibro: div, divergentiMotore: divMot, nonGiudicate: nonGiud, sec: Math.round((Date.now() - t00) / 1000) }));
process.exit(0);
