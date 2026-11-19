#!/usr/bin/env node
/* GUARDIANO giro 286 (PO-545) — «PRIMA DELLA SCELTA CHI HA IL PALLONE STA FERMO, NON VA AVANTI E INDIETRO».

   MISURATO (misura-286, GLB acceso, stacco di scena attivo __CPM_PRESENT=1, una pagina nuova per scena, un campione per FOTOGRAMMA
   col TEMPO DI SCENA; stessi numeri sulla 7.999.196, quindi il difetto non e' nato nella 197):
   · battitore messo in scena (corner, rimessa, consegna: gi6, gi37, gi50): un fotogramma sul pallone e uno alla sua base di prima,
     a 12-60 u — 37 inversioni di direzione per secondo di scena (colla 7.405 contro attesa attiva 7.685 / 7.999.144);
   · avversario col pallone nelle scene difensive (gi31, gi36, gi44, gi54): cambia lato a ogni fotogramma per mezzo periodo
     dell'attesa attiva (11-21 inversioni al secondo, fino a 2 u) — a tratti, dipende da chi il 3D aggancia come portatore.
   Dopo la correzione: 0 inversioni, corpo fermo sul pallone.

   ⚠️ TEMPO DI SCENA, NON DI OROLOGIO: sul banco il disegno gira a pochi fotogrammi al secondo e il passo di scena e' tappato a 0,05 s
   (20 fotogrammi per secondo di scena). Le inversioni si contano per secondo DI SCENA. Sul telefono a 60 fotogrammi il conflitto e'
   lo stesso (uno scrittore per fotogramma), piu' fitto: il guardiano non dipende dalla frequenza.
   ⚠️ I PRIMI 0,6 s DI SCENA NON SI GIUDICANO: e' l'apertura (scatto dei corpi sotto lo stacco nero), la giudica apertura-261.

   COSA GIUDICA, per scena, sul corpo piu' spesso vicino al pallone (entro 3,5 u) nelle fasi hl_intro / hl_move / hl_choose:
     ✗ «avanti e indietro»  piu' di 1 inversione di direzione per secondo di scena (isteresi 0,12 u per asse; misurato: verde 0, rosso 11-38);
     ✗ «si sposta»          escursione fra due inversioni oltre 0,5 u (misurato: verde 0, rosso 1-60 u).
   Un caso senza almeno 2,5 s di scena giudicabili, o senza un corpo vicino al pallone, e' NON GIUDICATO = rosso.
   RIPETIZIONE DICHIARATA, per braccio: 7 scene forzate (3 col battitore, 4 difensive) + 2 highlight del flusso vero (non forzati, primo
   highlight di due partite con nomi diversi = semi diversi, hl_intro compresa). Ogni caso ha un nome di giocatore diverso (seme diverso).
   VERDE = 0 difetti su 9. ROSSO (__CPM_NO_G286, comportamento di prima) = almeno 5 delle 7 scene forzate con un difetto (misurato: 7
   su 7; nelle difensive il difetto dipende da chi il 3D aggancia come portatore, e in gi37 il battitore parte gia' sul pallone e fa
   solo il «respiro» di 0,2-0,3 u: 1,45 inversioni al secondo, vicino alla soglia). Il flusso vero si stampa e nel verde si giudica:
   nei due highlight misurati il pallone lo ha l'eroe, che non ha mai avuto il difetto (0 inversioni in entrambi i bracci).

     CPM_CHROME=… node tests/visual/portatore-286.mjs      (verde, poi rosso)
     CPM_ROOT=<cartella di un'altra versione del gioco> CPM_SOLO=verde   (confronto con una versione precedente: li' il «verde» e' il suo comportamento)
     CPM_SOLO=verde|rosso · CPM_SCENE=6:b,31:d,f · CPM_SEC=<secondi di scena, default 4> · CPM_TRACCIA=1 */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '6:b,37:b,50:b,31:d,36:d,44:d,54:d,f,f').split(',').map(s => { const [gi, k] = s.split(':'); return gi === 'f' ? { f: 1 } : { gi: +gi, k: k || 'd' }; });
const SEC = +(process.env.CPM_SEC || 4), SALTA = 0.6, MIN = 2.5, INV_MAX = 1.0, AMP_MAX = 0.5, IST = 0.12;
const srv = await startServer(process.env.CPM_ROOT || undefined), port = srv.address().port, b = await launchBrowser();
const PRE = ph => ph === 'hl_intro' || ph === 'hl_move' || ph === 'hl_choose';

function analizza(R) {
  R = R.filter(f => PRE(f.ph)); if (R.length < 2) return { nonGiud: 'nessun fotogramma prima della scelta' };
  const st0 = R[0].st; R = R.filter(f => f.st - st0 >= SALTA);
  if (R.length < 12) return { nonGiud: `solo ${R.length} fotogrammi dopo l'apertura` };
  const dur = R[R.length - 1].st - R[0].st; if (!(dur >= MIN)) return { nonGiud: `solo ${dur.toFixed(2)} s di scena giudicabili (minimo ${MIN})` };
  const c = {}; for (const f of R) if (f.d < 3.5) c[f.i] = (c[f.i] || 0) + 1;
  const ord = Object.entries(c).sort((a, b) => b[1] - a[1]); if (!ord.length) return { nonGiud: 'nessun corpo entro 3,5 u dal pallone' };
  const pi = +ord[0][0], P = R.map(f => { const q = f.pl[pi]; return q ? { st: f.st, x: q.mx - 50, z: (q.my - 50) * 0.68, bx: f.bx - 50, bz: (f.by - 50) * 0.68, ph: f.ph } : null; }).filter(Boolean);
  if (P.length < 12) return { nonGiud: 'portatore non campionato' };
  let n = 0, amp = 0;
  for (const ax of ['x', 'z']) { let dir = 0, ext = P[0][ax]; const v0 = P[0][ax];
    for (const p of P) { const v = p[ax];
      if (!dir) { if (v - v0 > IST) { dir = 1; ext = v; } else if (v0 - v > IST) { dir = -1; ext = v; } continue; }
      if (dir > 0) { if (v > ext) ext = v; else if (ext - v > IST) { n++; amp = Math.max(amp, ext - v); dir = -1; ext = v; } }
      else { if (v < ext) ext = v; else if (v - ext > IST) { n++; amp = Math.max(amp, v - ext); dir = 1; ext = v; } } } }
  let strada = 0; for (let i = 1; i < P.length; i++) strada += Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z);
  if (process.env.CPM_TRACCIA) for (const p of P) console.log(`     ${(p.st - st0).toFixed(2)} ${p.ph} corpo(${p.x.toFixed(2)};${p.z.toFixed(2)}) pallone(${p.bx.toFixed(2)};${p.bz.toFixed(2)})`);
  const fasi = [...new Set(P.map(p => p.ph.replace('hl_', '')))].join('+');
  return { pi, quota: Math.round(100 * ord[0][1] / R.length), fot: P.length, dur: +dur.toFixed(2), inv: n, invS: +(n / dur).toFixed(2), amp: +amp.toFixed(2), strada: +strada.toFixed(2), fasi };
}

async function caso(sc, rosso, nome) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G286 = 1;
    window.__R286 = []; const giro = () => { try { if (window.__R286_ON && window.__CPM_OWN && window.__CPM_PHASE) { const ph = window.__CPM_PHASE(); if (/^hl_/.test(ph || '')) { const o = window.__CPM_OWN(); if (o) { const pl = []; for (let i = 0; i < 23; i++) pl.push(window.__CPM_PLPOS(i)); try { const S = window.__CPM_STATE(); const h = S && S.hero; pl[23] = h ? { mx: h.x, my: h.y } : null; } catch (_e) { pl[23] = null; } window.__R286.push({ st: window.__CPM_SCENET || 0, ph, bx: o.x, by: o.y, i: o.i === -2 ? 23 : o.i, d: o.d, pl }); } } } } catch (_e) {} requestAnimationFrame(giro); }; requestAnimationFrame(giro); }, rosso);
  try {
    await openMatch(page, port, sc.f ? { skipLoadAll: true, name: nome } : { name: nome }); await sleep(600);
    const t9 = Date.now(); let glb = false; while (Date.now() - t9 < 60000) { if (await page.evaluate(() => window.__CPM_GLB_READY === true)) { glb = true; break; } await sleep(400); }
    if (!glb) { await page.close(); return { nonGiud: 'modelli GLB non pronti: la misura va fatta coi corpi veri' }; }
    if (sc.f) await page.evaluate(() => { window.__R286_ON = 1; });
    else if (!await page.evaluate(g => { window.__CPM_FROZEN = false; window.__R286 = []; window.__R286_ON = 1; return window.__CPM_FORCE_SIT(g, false); }, sc.gi)) { await page.close(); return { nonGiud: 'force fallito' }; }
    /* si aspetta un EVENTO in tempo di scena: SEC secondi di scena dal primo fotogramma prima della scelta (tetto di parete 240 s) */
    const t0 = Date.now();
    while (Date.now() - t0 < 240000) { await sleep(400);
      const s = await page.evaluate(() => { const R = window.__R286; return R.length ? [R[0].st, R[R.length - 1].st, R[R.length - 1].ph] : null; });
      if (s && s[1] - s[0] >= SEC + 0.6) break; if (s && !/^hl_(intro|move|choose)$/.test(s[2])) break; }
    const R = await page.evaluate(() => { window.__R286_ON = 0; return window.__R286; }); await page.close();
    return analizza(R);
  } catch (e) { try { await page.close(); } catch (_e) {} return { nonGiud: 'errore: ' + String(e.message || e).slice(0, 100) }; }
}

async function braccio(rosso) {
  const dif = []; let n = 0, batt = 0;
  console.log(`\n— braccio ${rosso ? 'ROSSO (__CPM_NO_G286)' : 'VERDE'} —`);
  for (const sc of SCENE) { n++; const nome = 'Prova' + 'ABCDEFGHIJKLMNOP'[n % 16] + (rosso ? 'r' : 'v');
    const o = await caso(sc, rosso, nome), id = sc.f ? `flusso vero #${n} (${nome})` : `gi${sc.gi} ${sc.k === 'b' ? 'battitore' : 'difensiva'} #${n}`;
    if (o.nonGiud) { console.log(`  ⚠ ${id}: NON GIUDICATO (${o.nonGiud})`); dif.push(`${id}: non giudicato (${o.nonGiud})`); continue; }
    const d = []; if (o.invS > INV_MAX) d.push(`avanti e indietro (${o.invS} inversioni al secondo di scena)`); if (o.amp > AMP_MAX) d.push(`si sposta (${o.amp} u fra due inversioni)`);
    console.log(`  ${d.length ? '✗' : '·'} ${id}: portatore ${o.pi === 23 ? 'eroe' : o.pi} (vicino al pallone ${o.quota}%) · fasi ${o.fasi} · ${o.fot} fotogrammi in ${o.dur} s di scena · inversioni ${o.inv} (${o.invS}/s) · escursione massima ${o.amp} u · strada ${o.strada} u${d.length ? ' → ' + d.join(', ') : ''}`);
    if (d.length) { dif.push(`${id}: ${d.join(', ')}`); if (!sc.f) batt++; } }
  dif.batt = batt; return dif;
}
const SOLO = process.env.CPM_SOLO || '';
let ok = true; const fine = [];
if (SOLO !== 'rosso') { const d = await braccio(false); if (d.length) { ok = false; fine.push(`braccio VERDE: ${d.length} difetti su ${SCENE.length} casi — ${d.join(' | ')}`); } else fine.push(`braccio VERDE: 0 difetti su ${SCENE.length} casi`); }
if (SOLO !== 'verde') { const d = await braccio(true); const nb = SCENE.filter(q => !q.f).length, min = Math.ceil(nb * 5 / 7); if (d.batt < min || !nb) { ok = false; fine.push(`braccio ROSSO: ${d.batt} scene forzate con un difetto su ${nb} (attese almeno ${min}): il guardiano non separa`); } else fine.push(`braccio ROSSO: ${d.batt} scene forzate su ${nb} con un difetto (attese almeno ${min}; ${d.length} casi su ${SCENE.length} in tutto)`); }
await b.close(); srv.close();
for (const r of fine) console.log(r);
console.log(ok ? `\n✅ portatore-286 VERDE (verde col verde, rosso col rosso): prima della scelta chi ha il pallone sta fermo.` : `\n❌ portatore-286 ROSSO — ${fine.join(' · ')}`);
process.exit(ok ? 0 : 1);
