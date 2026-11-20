#!/usr/bin/env node
/* GUARDIANO giro 293 (PO-562, ritorno di PO-545) — «PRIMA DELLA SCELTA IL PORTATORE, EROE O COMPAGNO O AVVERSARIO, NON VA AVANTI E INDIETRO».

   MISURATO (misura-293: GLB acceso, stacco di scena attivo __CPM_PRESENT=1, pagina nuova, un campione per FOTOGRAMMA col TEMPO DI SCENA):
   · IL CASO DELLA FOTO (flusso vero, partita «Nunez» 44', «Cross di COLOMBO: attacca il pallone», origine del motore sulla fascia): il compagno
     crossatore col pallone fa 62 inversioni in 7 s di scena (8,8 al secondo, 1,4 u, 59 u di strada). Il motore lo nomina anche «ricevente» del
     cast: il punto di ricezione del giro 99 lo tira via dal pallone, la colla del battitore (7.405) ce lo rimette. Fuori dall'attesa di lettura,
     quindi il giro 286 non lo fermava. Le scene forzate non hanno il cast del motore: la sonda PROVOCA il caso col varco di prova
     __CPM_RIC293='batt' («il ricevente del cast e' il battitore della scena») e pretende il testimone che il conflitto c'e' stato.
   · SCENE DIFENSIVE senza un avversario entro 6 u dal pallone logico (gi129 3 su 3, gi44 2 su 2 — gi44 e' una scena di portatore-286 ed era la
     sua instabilita'): il portatore veniva sganciato e riagganciato a ogni fotogramma, il pallone saltava di 17-19 u fra due avversari (14-34
     inversioni del pallone in 6 s di scena) e i due corpi si muovevano a turno.

   COSA GIUDICA, per scena, nelle fasi hl_intro / hl_move / hl_choose, dopo i primi 0,6 s di scena (l'apertura la giudica apertura-261):
     ✗ «avanti e indietro»   il portatore (il corpo piu' spesso piu' vicino al pallone) fa piu' di 1 inversione per secondo di scena
                             (isteresi 0,12 u per asse) — stessa soglia di portatore-286;
     ✗ «si sposta»           escursione del portatore fra due inversioni oltre 0,5 u — stessa soglia di portatore-286;
     ✗ «il pallone cambia padrone»  il pallone salta di oltre 3 u in un fotogramma da un corpo a un altro (misurato: verde 0, rosso 7-17).
   NON GIUDICATO = ROSSO: meno di 2,5 s di scena, modelli GLB non pronti, portatore non campionato; nei casi «foto» anche: il portatore non e'
   un compagno, oppure il testimone del conflitto (__CPM_G293W.batt) e' a zero (la provocazione non ha preso).
   RIPETIZIONE DICHIARATA: ogni scena una volta per braccio, una pagina nuova per scena, un nome di giocatore diverso per scena (seme diverso);
   gi129 e gi44 col nome «Validator» e ripetute come scritto sotto (il salto dipende dalle posizioni di partenza e dalla fase dell'attesa).
   VERDE = 0 difetti su 14 scene di famiglie diverse: 5 «foto» (battitore nominato ricevente: angolo-inserimento gi6/gi76/gi77, angolo-cross gi50,
           consegna del compagno gi37), 4 difensive (recupero gi129/gi44/gi31, intercetto gi130), 5 con l'eroe sul pallone (tiro gi1, dribbling
           gi18, cross gi16, uno-due gi27, punizione gi13).
   ROSSO (__CPM_NO_G293) = sulle scene provocate: almeno 4 dei 5 casi «foto» con un difetto (misurato: 5 su 5, 8,6-9,9 inversioni al secondo
           contro 0) E almeno una delle due scene difensive gi129/gi44 col pallone che cambia padrone, in al massimo 3 corse per scena di 6,5 s
           di scena (nel verde: 2 corse per scena, tutte pulite).

     CPM_CHROME=… node tests/visual/portatore-293.mjs      (verde, poi rosso)
     CPM_SOLO=verde|rosso · CPM_SCENE=6:f,129:d,1:e · CPM_SEC=<secondi di scena, default 4> · CPM_TRACCIA=1 · CPM_ROOT=<altra copia del gioco> */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '6:f,76:f,77:f,50:f,37:f,129:d,44:d,31:d,130:d,1:e,18:e,16:e,27:e,13:e').split(',').map(s => { const [gi, k] = s.split(':'); return { gi: +gi, k: k || 'e' }; });
const PROVOCATE = q => q.k === 'f' || q.gi === 129 || q.gi === 44;
const SEC = +(process.env.CPM_SEC || 4), SALTA = 0.6, MIN = 2.5, INV_MAX = 1.0, AMP_MAX = 0.5, IST = 0.12, SALTO = 3;
const FAM = { f: 'foto: battitore nominato ricevente', d: 'difensiva', e: 'eroe sul pallone' };
const srv = await startServer(process.env.CPM_ROOT || undefined), port = srv.address().port, b = await launchBrowser();
const PRE = ph => ph === 'hl_intro' || ph === 'hl_move' || ph === 'hl_choose';

function analizza(R, MP, W, sc) {
  R = R.filter(f => PRE(f.ph)); if (R.length < 2) return { nonGiud: 'nessun fotogramma prima della scelta' };
  const st0 = R[0].st; R = R.filter(f => f.st - st0 >= SALTA);
  if (R.length < 12) return { nonGiud: `solo ${R.length} fotogrammi dopo l'apertura` };
  const dur = R[R.length - 1].st - R[0].st; if (!(dur >= MIN)) return { nonGiud: `solo ${dur.toFixed(2)} s di scena giudicabili (minimo ${MIN})` };
  const c = {}; for (const f of R) c[f.i] = (c[f.i] || 0) + 1;
  const ord = Object.entries(c).sort((a, b) => b[1] - a[1]); const pi = +ord[0][0];
  const P = R.map(f => { const q = f.pl[pi]; return q ? { st: f.st, x: q.mx - 50, z: (q.my - 50) * 0.68, bx: f.bx - 50, bz: (f.by - 50) * 0.68, ph: f.ph } : null; }).filter(Boolean);
  if (P.length < 12) return { nonGiud: 'portatore non campionato' };
  let n = 0, amp = 0;
  for (const ax of ['x', 'z']) { let dir = 0, ext = P[0][ax]; const v0 = P[0][ax];
    for (const p of P) { const v = p[ax];
      if (!dir) { if (v - v0 > IST) { dir = 1; ext = v; } else if (v0 - v > IST) { dir = -1; ext = v; } continue; }
      if (dir > 0) { if (v > ext) ext = v; else if (ext - v > IST) { n++; amp = Math.max(amp, ext - v); dir = -1; ext = v; } }
      else { if (v < ext) ext = v; else if (v - ext > IST) { n++; amp = Math.max(amp, v - ext); dir = 1; ext = v; } } } }
  let strada = 0; for (let i = 1; i < P.length; i++) strada += Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z);
  let cambi = 0; for (let i = 1; i < R.length; i++) if (R[i].i !== R[i - 1].i && Math.hypot(R[i].bx - R[i - 1].bx, (R[i].by - R[i - 1].by) * 0.68) > SALTO) cambi++;
  const chi = pi === 23 ? 'eroe' : (MP && MP[pi] ? (MP[pi].t === 'home' ? 'compagno ' : 'avversario ') + MP[pi].n : 'corpo ' + pi);
  if (process.env.CPM_TRACCIA) for (const p of P) console.log(`     ${(p.st - st0).toFixed(2)} ${p.ph} corpo(${p.x.toFixed(2)};${p.z.toFixed(2)}) pallone(${p.bx.toFixed(2)};${p.bz.toFixed(2)})`);
  const o = { pi, chi, quota: Math.round(100 * ord[0][1] / R.length), fot: P.length, dur: +dur.toFixed(2), inv: n, invS: +(n / dur).toFixed(2), amp: +amp.toFixed(2), strada: +strada.toFixed(2), cambi, batt: (W && W.batt) | 0, lont: (W && W.lont) | 0, fasi: [...new Set(P.map(p => p.ph.replace('hl_', '')))].join('+') };
  if (sc.k === 'f') { if (!(MP && MP[pi] && MP[pi].t === 'home' && pi !== 23)) return { ...o, nonGiud: `caso «foto» ma il portatore e' ${chi}` }; if (!o.batt) return { ...o, nonGiud: 'caso «foto» ma il testimone del conflitto e\' a zero: la provocazione non ha preso' }; }
  return o;
}

async function caso(sc, rosso, nome, sec = SEC) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([r, foto]) => { window.__CPM_PRESENT = 1; window.__CPM_G293W = {}; if (r) window.__CPM_NO_G293 = 1; if (foto) window.__CPM_RIC293 = 'batt';
    window.__R293 = []; const giro = () => { try { if (window.__R293_ON && window.__CPM_OWN && window.__CPM_PHASE) { const ph = window.__CPM_PHASE(); if (/^hl_/.test(ph || '')) { const o = window.__CPM_OWN(); if (o) { const pl = []; for (let i = 0; i < 23; i++) { const q = window.__CPM_PLPOS(i); pl.push(q ? { mx: q.mx, my: q.my } : null); } try { const S = window.__CPM_STATE(); const h = S && S.hero; pl[23] = h ? { mx: h.x, my: h.y } : null; } catch (_e) { pl[23] = null; } window.__R293.push({ st: window.__CPM_SCENET || 0, ph, bx: o.x, by: o.y, i: o.i === -2 ? 23 : o.i, d: o.d, pl }); } } } } catch (_e) {} requestAnimationFrame(giro); }; requestAnimationFrame(giro); }, [rosso, sc.k === 'f']);
  try {
    await openMatch(page, port, { name: nome }); await sleep(600);
    const t9 = Date.now(); let glb = false; while (Date.now() - t9 < 60000) { if (await page.evaluate(() => window.__CPM_GLB_READY === true)) { glb = true; break; } await sleep(400); }
    if (!glb) { await page.close(); return { nonGiud: 'modelli GLB non pronti: la misura va fatta coi corpi veri' }; }
    if (!await page.evaluate(g => { window.__CPM_FROZEN = false; window.__R293 = []; window.__CPM_G293W = {}; window.__R293_ON = 1; return window.__CPM_FORCE_SIT(g, false); }, sc.gi)) { await page.close(); return { nonGiud: 'force fallito' }; }
    /* si aspetta un EVENTO in tempo di scena: SEC secondi di scena dal primo fotogramma prima della scelta (tetto di parete 240 s) */
    const t0 = Date.now();
    while (Date.now() - t0 < 240000) { await sleep(400);
      const s = await page.evaluate(() => { const R = window.__R293; return R.length ? [R[0].st, R[R.length - 1].st, R[R.length - 1].ph] : null; });
      if (s && s[1] - s[0] >= sec + 0.6) break; if (s && !/^hl_(intro|move|choose)$/.test(s[2])) break; }
    const [R, MP, W] = await page.evaluate(() => { window.__R293_ON = 0; return [window.__R293, window.__CPM_MP ? window.__CPM_MP() : null, window.__CPM_G293W]; }); await page.close();
    return analizza(R, MP, W, sc);
  } catch (e) { try { await page.close(); } catch (_e) {} return { nonGiud: 'errore: ' + String(e.message || e).slice(0, 100) }; }
}

const SEC_D = +(process.env.CPM_SEC_D || 6.5), RIP_V = 2, RIP_R = 3;
async function braccio(rosso) {
  const dif = []; let n = 0, foto = 0, nFoto = 0, salto = 0, nSalto = 0; const lista = rosso ? SCENE.filter(PROVOCATE) : SCENE;
  console.log(`\n— braccio ${rosso ? 'ROSSO (__CPM_NO_G293), solo le scene provocate' : 'VERDE'} —`);
  for (const sc of lista) { n++; const dp = sc.k === 'd' && PROVOCATE(sc); if (sc.k === 'f') nFoto++; if (dp) nSalto++;
    /* gi129 e gi44: il salto fra due avversari dipende dalle posizioni di partenza e dalla fase dell'attesa (orologio): misurato 7 volte su 7 in 6 s
       di scena, 1 su 2 in 4 s. Ripetizione dichiarata: SEC_D secondi di scena; nel VERDE RIP_V corse per scena, tutte pulite; nel ROSSO fino a
       RIP_R corse per scena, ci si ferma alla prima col difetto. */
    const giri = dp ? (rosso ? RIP_R : RIP_V) : 1; let visto = false;
    for (let g = 0; g < giri && !(rosso && visto); g++) {
      const nome = dp ? 'Validator' : 'Prova' + 'ABCDEFGHIJKLMNOPQRST'[n % 20] + (rosso ? 'r' : 'v');
      const o = await caso(sc, rosso, nome, dp ? SEC_D : SEC), id = `gi${sc.gi} ${FAM[sc.k]} #${n}${giri > 1 ? ' corsa ' + (g + 1) : ''}`;
      const d = []; if (o.nonGiud) d.push(`non giudicato (${o.nonGiud})`);
      else { if (o.invS > INV_MAX) d.push(`avanti e indietro (${o.invS} inversioni al secondo di scena)`); if (o.amp > AMP_MAX) d.push(`si sposta (${o.amp} u fra due inversioni)`); if (o.cambi > 0) d.push(`il pallone cambia padrone ${o.cambi} volte`); }
      console.log(o.pi == null ? `  ⚠ ${id}: NON GIUDICATO (${o.nonGiud})` : `  ${d.length ? '✗' : '·'} ${id}: portatore ${o.chi} (vicino al pallone ${o.quota}%) · fasi ${o.fasi} · ${o.fot} fotogrammi in ${o.dur} s di scena · inversioni ${o.inv} (${o.invS}/s) · escursione massima ${o.amp} u · strada ${o.strada} u · cambi di padrone ${o.cambi} · testimoni: conflitto battitore ${o.batt}, portatore lontano ${o.lont}${d.length ? ' → ' + d.join(', ') : ''}`);
      if (d.length) { dif.push(`${id}: ${d.join(', ')}`); if (!o.nonGiud) visto = true; } }
    if (visto) { if (sc.k === 'f') foto++; if (dp) salto++; } }
  Object.assign(dif, { foto, nFoto, salto, nSalto, n: lista.length }); return dif;
}
const SOLO = process.env.CPM_SOLO || '';
let ok = true; const fine = [];
if (SOLO !== 'rosso') { const d = await braccio(false); if (d.length) { ok = false; fine.push(`braccio VERDE: ${d.length} difetti su ${d.n} scene — ${d.join(' | ')}`); } else fine.push(`braccio VERDE: 0 difetti su ${d.n} scene`); }
if (SOLO !== 'verde') { const d = await braccio(true); const minF = d.nFoto ? Math.max(1, d.nFoto - 1) : 0, minS = d.nSalto ? 1 : 0;
  if (!d.n || d.foto < minF || d.salto < minS) { ok = false; fine.push(`braccio ROSSO: casi «foto» col difetto ${d.foto} su ${d.nFoto} (attesi almeno ${minF}), scene difensive col pallone che cambia padrone ${d.salto} su ${d.nSalto} (attesa almeno ${minS}): il guardiano non separa`); }
  else fine.push(`braccio ROSSO: casi «foto» col difetto ${d.foto} su ${d.nFoto} (attesi almeno ${minF}), scene difensive col pallone che cambia padrone ${d.salto} su ${d.nSalto} (attesa almeno ${minS})`); }
await b.close(); srv.close();
for (const r of fine) console.log(r);
console.log(ok ? `\n✅ portatore-293 VERDE (verde col verde, rosso col rosso): prima della scelta il portatore sta fermo e il pallone non cambia padrone.` : `\n❌ portatore-293 ROSSO — ${fine.join(' · ')}`);
process.exit(ok ? 0 : 1);
