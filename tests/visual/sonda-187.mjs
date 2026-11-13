#!/usr/bin/env node
/* [giro 187] SONDA (non guardiano) — il minuto dei turni annotati dai sotto-tick del motore.
   Gioca NOME × 3 (1× · 1,5× · 2×, in parallelo, come riproduci-175) fermandosi al minuto CPM_S187_FERMA (15), per braccio
   (verde; rosso = __CPM_NO_G187) e stampa: il testimone __CPM_W187 (finestra = sotto-tick col minuto del battito diverso da
   clockRef; turni = turni annotati in quella finestra; ritardo = sotto-tick col minuto diverso da quello aperto dal battito) e
   la prima differenza del libro mastro fra le ripetizioni (prefisso fino a FERMA-3). */
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const E = process.env, NOME = E.CPM_S187_NOME || 'Livio Corradini', FERMA = +(E.CPM_S187_FERMA || 15), GIRI = +(E.CPM_S187_GIRI || 1);
const VEL = ['1', '1.5', '2'];
async function una(k, init) {
  const A = await apriCarriera166({ init, nome: NOME, vel: VEL[k], reseed: 1000 + 77 * k });
  let r = { ev: [] }, w = null;
  try { await apriPrompt166(A.page); r = await gioca166(A.page, 'intera', { seme: 7300, tetto: 300000, fermaAlMinuto: FERMA }); w = await A.page.evaluate(() => window.__CPM_W187 || null); } catch (e) { r.note = [String(e.message).slice(0, 120)]; }
  await A.b.close(); A.srv.close();
  return { k, w, seq: seq166(r.ev || []), minMax: r.minMax };
}
const pref = q => { const j = q.findIndex(e => (e.min | 0) > FERMA - 3); return j < 0 ? q : q.slice(0, j); };
const diff = (a, b) => { const A = pref(a), B = pref(b); for (let i = 0; i < Math.max(A.length, B.length); i++) if (JSON.stringify(A[i]) !== JSON.stringify(B[i])) return { i, a: A[i], b: B[i] }; return null; };
for (const [nomeB, init] of [['VERDE', {}], ['ROSSO __CPM_NO_G187', { __CPM_NO_G187: true }]]) for (let g = 0; g < GIRI; g++) {
  const P = await Promise.all([0, 1, 2].map(k => una(k, init)));
  const t0 = P.map(p => p.seq.filter(e => e.ev === 'turn').slice(0, 2).map(e => e.min + ':' + e.causa).join(','));
  const d1 = diff(P[0].seq, P[1].seq), d2 = diff(P[0].seq, P[2].seq);
  console.log(`${nomeB} giro ${g + 1}: testimone ${JSON.stringify(P.map(p => p.w))}`);
  console.log(`   primi turni ${JSON.stringify(t0)} · voci ${P.map(p => pref(p.seq).length)} · min ${P.map(p => p.minMax)}`);
  console.log(`   ${d1 || d2 ? 'DIVERSE: ' + JSON.stringify(d1 || d2).slice(0, 260) : 'identiche fino al ' + (FERMA - 3) + "'"}`);
}
