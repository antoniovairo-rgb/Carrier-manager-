#!/usr/bin/env node
/* [giro 13 GUARDIANO MIG194 — decisione PO 14/10 «Si', ripara i salvataggi», eccezione zona G limitata a CL194]
   La classifica dei salvataggi gia' colpiti da CL194 (partita di campionato dal vivo registrata col NOME dell'avversario: l'avversario
   senza il risultato speculare, una squadra col turno di riposo contro nessuno) si rimette in pari al caricamento (src/09
   riparaClassifica194, chiamata da migratePlayer in src/17).
   Casi: (1) fixtures/save-195-primavera-w39.json — salvataggio del PO, GF 792 / GS 789, V 229 / P 225;
         (2) fixtures/save-194-cl194-dal-vivo.json — save-194 con la 34a giornata giocata DAL VIVO col difetto acceso
             (classifica-194 con CPM_RED=1 CPM_DUMP=…): GF 793 / GS 789;
         (3) fixtures/save-190-s12-ovr93.json — lega in pari: la riparazione NON la tocca (classifica identica al caricamento con
             __CPM_NO_MIG194; le altre migrazioni, es. il recupero 103 delle giornate mancate, agiscono uguali nei due bracci).
   VERDE → (1)(2) dopo il caricamento GF = GS, V = P, pareggi pari, tutte le squadre con le giornate del calendario, riga dell'eroe
           identica a quella salvata, testimone __CPM_MIG194 presente; ricaricando il salvataggio migrato la classifica resta identica
           e il testimone non scatta (idempotente). (3) nessun testimone, identica al braccio spento.
   ROSSO (CPM_RED=1 → __CPM_NO_MIG194) → lo sbilancio di (1)(2) resta: il guardiano esce 0 solo se lo vede.
   Uso: node migrazione-194.mjs  ·  CPM_RED=1 node migrazione-194.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const fx = f => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const PAGINA = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const errori = [];
async function carica(save, noMig = RED) {
  const ctx = await browser.newContext(); const page = await ctx.newPage({ viewport: { width: 414, height: 896 } }); await installCdnRoutes(page);
  page.on('pageerror', e => errori.push(String(e && e.message || e)));
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_MIG194 = 1; if (!sessionStorage.getItem('mig194')) { sessionStorage.setItem('mig194', '1'); localStorage.setItem('cpm-v3', s); } }, [JSON.stringify(save), noMig]);
  await page.goto(PAGINA, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(1500);
  const r = await page.evaluate(() => { let raw = null; try { raw = JSON.parse(localStorage.getItem('cpm-v3')); } catch (e) {} return { raw, w: window.__CPM_MIG194 || null }; });
  await ctx.close(); return r;
}
const pl = s => (s && (s.player || s)) || {};
const tot = st => st.reduce((o, r) => ({ gf: o.gf + r.gf, ga: o.ga + r.ga, w: o.w + r.wins, l: o.l + r.losses, d: o.d + r.draws }), { gf: 0, ga: 0, w: 0, l: 0, d: 0 });
const K = ['played', 'wins', 'draws', 'losses', 'gf', 'ga', 'pts'];
const firma = st => JSON.stringify([...st].map(r => [r.id, ...K.map(k => r[k])]).sort());
let ok = true; const vistoRosso = [];
for (const [f, sbil] of [['save-195-primavera-w39.json', true], ['save-194-cl194-dal-vivo.json', true], ['save-190-s12-ovr93.json', false]]) {
  const save = fx(f); const p0 = pl(save); const s0 = tot(p0.standings);
  const A = await carica(save); const pA = pl(A.raw); const sA = tot(pA.standings || []);
  const giocate = (pA.calendar || []).filter(m => m && !m.type && m.played && m.result).length;
  const inPari = sA.gf === sA.ga && sA.w === sA.l && sA.d % 2 === 0;
  const myId = p0.club.id; const e0 = p0.standings.find(r => r.id === myId), eA = (pA.standings || []).find(r => r.id === myId) || {};
  const eroeUguale = K.every(k => e0[k] === eA[k]); const partite = [...new Set((pA.standings || []).map(r => r.played))];
  console.log(`${f}: prima GF ${s0.gf} GS ${s0.ga} V ${s0.w} P ${s0.l} · dopo GF ${sA.gf} GS ${sA.ga} V ${sA.w} P ${sA.l} N ${sA.d} · partite ${partite.join('/')} (calendario ${giocate}) · eroe ${eroeUguale ? 'identico' : 'CAMBIATO'} · testimone ${A.w ? JSON.stringify({ giornate: A.w.giornate, dalVivo: A.w.dalVivo }) : 'no'}`);
  if (RED) { if (sbil) vistoRosso.push(!inPari && !A.w); continue; }
  if (sbil) {
    const B = await carica(A.raw); const pB = pl(B.raw);
    const idem = firma(pB.standings || []) === firma(pA.standings || []) && !B.w;
    console.log(`   ricarica: classifica ${idem ? 'identica, testimone assente' : 'DIVERSA o testimone di nuovo'}`);
    const v = inPari && partite.length === 1 && partite[0] === giocate && eroeUguale && !!A.w && idem; ok = ok && v;
    console.log(`   → ${v ? 'verde' : 'ROSSO'}`);
  } else {
    const C = await carica(save, true);/* stesso caricamento con la riparazione spenta: le altre migrazioni (es. recupero 103) agiscono uguali */
    const v = firma(pA.standings || []) === firma(pl(C.raw).standings || []) && !A.w && inPari; ok = ok && v; console.log(`   lega in pari: ${v ? 'la riparazione non la tocca (identica al caricamento con __CPM_NO_MIG194)' : 'TOCCATA dalla riparazione'}`);
  }
}
await browser.close(); srv.close();
if (errori.length) { console.log('pageerror:', errori.slice(0, 3)); ok = false; }
if (RED) { const v = vistoRosso.length === 2 && vistoRosso.every(Boolean); console.log(v ? '✅ ROSSO come atteso (__CPM_NO_MIG194): lo sbilancio resta' : '❌ il rosso non riproduce lo sbilancio'); process.exit(v ? 0 : 1); }
console.log(ok ? '✅ migrazione-194 verde' : '❌ migrazione-194 ROSSO'); process.exit(ok ? 0 : 1);
