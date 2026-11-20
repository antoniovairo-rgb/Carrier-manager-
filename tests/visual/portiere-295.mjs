#!/usr/bin/env node
/* GUARDIANO giro 295 — IL PORTIERE: quattro decisioni del PO del 18/11 (PO-518 · PO-519 · PO-520 · PO-530). Rosso unico: __CPM_NO_G295.

   Corpi GLB accesi, pagina NUOVA per scena, stacco di scena e congelamento di lettura attivi (__CPM_PRESENT=1: come li vede il
   giocatore) e copione del build-up acceso (__CPM_CINE=1: sotto ?cpmtest=1 senza bandiera e' spento). Testimone per fotogramma
   __CPM_GK229 (esteso nel giro 295: gn = guide che muovono il portiere avversario nel fotogramma, tl = build-up acceso).
   Ogni pagina: forza la scena, TIENE APERTA LA SCELTA per 2,1 s di scena, poi risolve con esito fallito del tipo chiesto.

   BRACCIO 1 «una guida per fotogramma» (PO-518, tutte le pagine con costruzione dell'azione): nei fotogrammi di hl_result col build-up
     acceso il portiere riceve UNA guida. ✗ un fotogramma con due guide. Scena senza costruzione = non si applica (servono >= 8 giudicate).
   BRACCIO 2 «nessuna scivolata durante la scelta» (PO-519, le 8 pagine «palo»): passata l'apertura (0,6 s di scena, non si giudica) la
     sonda sposta il bersaglio del portiere di 5 u di lato; da li' alla fine della lettura (almeno 0,5 s di scena: la lettura finisce a
     2,1 s di scena o quando il gioco chiude la scelta col suo timer d'esitazione) il portiere non si sposta di piu' di 0,5 u. Nel gioco
     lo tiene fermo il congelamento di lettura (5.49.10); il rosso lo toglie al solo portiere.
   BRACCIO 3 «tuffo sempre sul filo della portata» (PO-520, 8 pagine «palo»: bersaglio dell'arco in z forzato da __CPM_GK229GEO e portiere
     messo a 4,62 u di lato dal pallone dal gancio di collaudo __CPM_LAT295 — da una corsa all'altra la distanza cambia di 0,1-0,2 u e la
     fascia di 0,25 u non si centra da sola): il gioco stesso scrive in __CPM_G223P la distanza di lato; la pagina e' «sul filo» se cade
     nella fascia 0,25 u oltre una delle tre soglie (lato 4,5 · distanza 5,5 · quota 2,6). ✗ sul filo e nessun gesto del portiere.
     Fuori dal filo = NON GIUDICATO.
   BRACCIO 4 «parata chiusa entro la portata del portiere» (PO-530, 8 pagine «parata» col portiere ARRETRATO sulla linea, x 97, messo
     dal gancio __CPM_GKAT119, e bersaglio dell'arco fissato a x 43,5 dal gancio __CPM_PARX295 — nel gioco e' sorteggiato, misurato da 40 a
     46,9; il giro 271 ha misurato 42-43,9): dall'armo dell'arco alla fine della scena il pallone arriva a non piu' di 2 u dal corpo del portiere in
     pianta (le mani arrivano ~1,3 u oltre il centro del corpo disteso). ✗ oltre 2 u.
   Un caso senza i fotogrammi che servono e' NON GIUDICATO = rosso (mai abbassare soglie).
   VERDE = 0 difetti e >= 8 scene giudicate per braccio. ROSSO (__CPM_NO_G295) = ogni braccio rivede il suo difetto in almeno 6 scene
   giudicate su 8 (ripetizione dichiarata: una corsa per braccio di colore; un rosso si riprova una volta sola e si dichiara).

     CPM_CHROME=… node portiere-295.mjs     (CPM_SOLO=verde|rosso · CPM_TIPI=palo,parata · CPM_PAR=2 · CPM_GLB=0 · CPM_MISURA=1 stampa e basta
                                              · CPM_PALO='1:0,62:1:4.7,…' (terzo campo = distanza di lato chiesta) · CPM_LATO=4.62 · CPM_PARATA='1:0,…') */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const P = (s, k) => s.split(',').filter(Boolean).map(q => { const [gi, ai, gz] = q.split(':'); return { gi: +gi, ai: +ai, k, gz: gz == null ? null : +gz }; });
const PALO = P(process.env.CPM_PALO || '1:0,62:1,86:0,90:0,88:0,9:0,3:0,11:0', 'post');
const PARATA = P(process.env.CPM_PARATA || '165:0,90:0,9:0,11:0,4:0,10:0,1:0,86:0', 'saved');
const TIPI = (process.env.CPM_TIPI || 'palo,parata').split(',');
const SCENE = [...(TIPI.includes('palo') ? PALO : []), ...(TIPI.includes('parata') ? PARATA : [])];
const PAR = +(process.env.CPM_PAR || 2), GLB = process.env.CPM_GLB !== '0', MISURA = !!process.env.CPM_MISURA;
const LATO = +(process.env.CPM_LATO || 4.62);/* distanza di lato chiesta: dentro la fascia «sul filo» (4,5 ; 4,75] */
const LETT = +(process.env.CPM_LETT || 2.1), DOPO = 0.5, APRE = 0.6, SCIV = 0.5, CHIUSA = 2.0, TZ = 3.5;
const srv = await startServer(), port = srv.address().port, b = await launchBrowser();

async function scena(sc, rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([r, glb, dietro]) => { window.__CPM_GLB = !!glb; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_CINE = 1; if (r) window.__CPM_NO_G295 = 1; if (dietro) { window.__CPM_GKAT119 = { x: 97, y: 50 }; window.__CPM_PARX295 = 43.5; } }, [rosso, GLB, sc.k === 'saved']);
  const o = { sc };
  try {
    await openMatch(page, port); await sleep(800);
    if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), sc.gi)) { await page.close(); o.err = 'force fallito'; return o; }
    await sleep(300);
    await page.evaluate(([kk, geo]) => { window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_G223P = []; window.__CPM_PARATA295 = []; window.__CPM_REC229 = 1; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = kk; if (geo) { window.__CPM_GK229GEO = geo[0]; window.__CPM_LAT295 = geo[1]; } }, [sc.k, sc.k === 'post' ? [{ tz: TZ }, sc.gz != null ? sc.gz : LATO] : null]);
    /* EVENTO: 2,1 s di SCENA nella lettura, oppure il gioco chiude la scelta da solo (timer d'esitazione, 9-16 s di parete: su una pagina
       lenta arriva prima). Tetto di parete 300 s. Nelle pagine «palo», passata l'apertura (0,6 s di scena), la sonda SPOSTA IL BERSAGLIO del
       portiere di 5 u di lato (__CPM_GKAT119, solo ?cpmtest=1): nel gioco il bersaglio si sposta coi passi del motore (misurato: 0-2,4 u
       nelle partite vere, 0,1-12 u nelle scene forzate, secondo la scena), qui si sposta sempre. Prima del tiro il bersaglio torna libero. */
    let t0 = Date.now(), ckP = null;
    while (Date.now() - t0 < 300000) { await sleep(300);
      const q = await page.evaluate(() => { const R = window.__CPM_GK229 || [], L = R.filter(f => f.ph === 'hl_intro' || f.ph === 'hl_move' || f.ph === 'hl_choose'), z = R[R.length - 1]; return { d: L.length > 1 ? L[L.length - 1].ck - L[0].ck : 0, ck: z ? z.ck : 0, fuori: !!(z && z.ph === 'hl_result'), t: (window.__CPM_GKT705 && window.__CPM_GKT705.away) || null }; });
      if (sc.k === 'post' && ckP == null && q.d >= APRE && q.t) { ckP = q.ck; await page.evaluate(g => { window.__CPM_GKAT119 = g; }, { x: q.t.x, y: q.t.y + (q.t.y > 50 ? -7.35 : 7.35) }); }
      if (q.d >= LETT || q.fuori) break; }
    if (sc.k === 'post') await page.evaluate(() => { window.__CPM_GKAT119 = null; });
    await page.evaluate(a => window.__CPM_RESOLVE(a), sc.ai);
    /* EVENTO: arco finito + 1 s di scena (tetto di parete 300 s) */
    t0 = Date.now();
    while (Date.now() - t0 < 300000) { await sleep(400);
      const s = await page.evaluate(() => { const R = window.__CPM_GK229 || [], L = R[R.length - 1]; let iE = -1, arm = false; for (let i = 0; i < R.length; i++) { if (R[i].ph !== 'hl_result') continue; if (R[i].at) arm = true; if (arm && !R[i].at) { iE = i; break; } } return { ck: L ? L.ck : 0, ckE: iE >= 0 ? R[iE].ck : null }; });
      if (s.ckE != null && s.ck - s.ckE > 1.0) break; }
    const [R, G, PA] = await page.evaluate(() => [(window.__CPM_GK229 || []).slice(), (window.__CPM_G223P || []).slice(), (window.__CPM_PARATA295 || []).slice()]); await page.close();
    o.n = R.length;
    /* braccio 1 */
    const B = R.filter(f => f.tl && f.ph === 'hl_result'), B2 = B.filter(f => f.gn >= 2);
    o.b1 = B.length < 3 ? { na: 1, bu: B.length } : { bu: B.length, due: B2.length, dist: B2.length ? +Math.max(...B2.map(f => Math.hypot(f.g1x - f.g2x, f.g1z - f.g2z))).toFixed(2) : 0 };
    /* braccio 2: dalla provocazione alla fine della lettura */
    const L = R.filter(f => f.ph === 'hl_intro' || f.ph === 'hl_move' || f.ph === 'hl_choose');
    if (sc.k === 'post') { if (ckP == null) o.b2 = { ng: 'lettura finita prima della provocazione (0,6 s di scena)' };
      else { const L1 = L.filter(f => f.ck >= ckP); const dur = L1.length > 1 ? L1[L1.length - 1].ck - L1[0].ck : 0;
        if (dur < DOPO) o.b2 = { ng: `solo ${dur.toFixed(2)} s di lettura dopo la provocazione (servono ${DOPO})` };
        else { let mx = 0, st = 0; for (let i = 1; i < L1.length; i++) { mx = Math.max(mx, Math.hypot(L1[i].gx - L1[0].gx, L1[i].gz - L1[0].gz)); st += Math.hypot(L1[i].gx - L1[i - 1].gx, L1[i].gz - L1[i - 1].gz); }
          const fz = L1[L1.length - 1]; o.b2 = { dur: +dur.toFixed(2), scarto: +mx.toFixed(2), strada: +st.toFixed(2), guide: Math.max(...L1.map(f => f.gn || 0)), bers: fz.ex != null ? +Math.hypot(fz.ex - L1[0].gx, fz.ez - L1[0].gz).toFixed(2) : null }; } } }
    const iA = R.findIndex(f => f.ph === 'hl_result' && f.at), esito = (R.filter(f => f.ok).pop() || {}).ok || null, gesto = (R.find((f, i) => i >= iA && iA >= 0 && f.op) || {}).op || null;
    /* braccio 3 */
    if (sc.k === 'post') { const g = G[G.length - 1];
      if (iA < 0 || !g) o.b3 = { ng: iA < 0 ? 'arco non armato' : 'portata non calcolata dal gioco (esito ' + esito + ')' };
      else if (esito !== 'post') o.b3 = { ng: 'esito ' + esito + ' invece di palo' };
      else { const est = g.lat <= 4.75 && g.d <= 5.75 && g.y <= 2.85, base = g.lat <= 4.5 && g.d <= 5.5 && g.y <= 2.6; o.b3 = { lat: g.lat, d: g.d, y: g.y, filo: est && !base, dentro: base, gesto }; if (!o.b3.filo) o.b3.ng = `fuori dal filo (lato ${g.lat}, distanza ${g.d}, quota ${g.y})`; } }
    /* braccio 4 */
    if (sc.k === 'saved') {
      if (iA < 0) o.b4 = { ng: 'arco non armato' };
      else if (esito !== 'saved' && esito !== 'save') o.b4 = { ng: 'esito ' + esito + ' invece di parata' };
      else if (R[iA].gx < 46) o.b4 = { ng: `portiere non arretrato (x ${R[iA].gx})` };
      else { let m = 99, at = null; for (let i = iA; i < R.length; i++) { const f = R[i]; if (f.ph !== 'hl_result') break; const d = Math.hypot(f.bx - f.gx, f.bz - f.gz); if (d < m) { m = d; at = f; } }
        o.b4 = { minGB: +m.toFixed(2), bx: at.bx, bz: at.bz, gx: at.gx, gz: at.gz, atx: R[Math.min(R.length - 1, iA + 1)].atx, gesto, allungo: PA.length ? PA[PA.length - 1] : null }; } }
  } catch (e) { try { await page.close(); } catch (_e) {} o.err = 'errore: ' + String(e.message || e).slice(0, 100); }
  return o;
}

async function braccio(rosso) {
  console.log(`\n— braccio ${rosso ? 'ROSSO (__CPM_NO_G295)' : 'VERDE'} — ${SCENE.length} pagine, ${PAR} per volta, GLB ${GLB ? 'acceso' : 'spento'}`);
  const coda = SCENE.map((sc, i) => ({ sc, i })), ris = [];
  await Promise.all(Array.from({ length: PAR }, async () => { while (coda.length) { const q = coda.shift(); ris[q.i] = await scena(q.sc, rosso); } }));
  const A = { 1: { g: 0, d: 0, ng: 0, t: [] }, 2: { g: 0, d: 0, ng: 0, t: [] }, 3: { g: 0, d: 0, ng: 0, t: [] }, 4: { g: 0, d: 0, ng: 0, t: [] } };
  const segna = (n, dif, ng, txt) => { const a = A[n]; if (ng) { a.ng++; a.t.push('⚠ ' + txt); } else { a.g++; if (dif) a.d++; a.t.push((dif ? '✗ ' : '· ') + txt); } };
  for (const o of ris) { const id = `gi${o.sc.gi} a${o.sc.ai} ${o.sc.k === 'post' ? 'palo' : 'parata'}`;
    if (o.err) { segna(o.sc.k === 'post' ? 3 : 4, 0, 1, `${id}: NON GIUDICATO (${o.err})`); if (o.sc.k === 'post') segna(2, 0, 1, `${id}: NON GIUDICATO (${o.err})`); continue; }
    if (o.b1 && !o.b1.na) segna(1, o.b1.due > 0, 0, `${id}: build-up ${o.b1.bu} fotogrammi, con due guide ${o.b1.due}${o.b1.due ? ' (bersagli a ' + o.b1.dist + ' u uno dall\'altro)' : ''}`);
    else if (o.b1) A[1].t.push(`  ${id}: senza costruzione dell'azione (${o.b1.bu} fotogrammi), non si applica`);
    if (o.sc.k === 'post') {
      if (o.b2.ng) segna(2, 0, 1, `${id}: NON GIUDICATO (${o.b2.ng})`); else segna(2, o.b2.scarto > SCIV, 0, `${id}: bersaglio spostato a ${o.b2.bers} u da lui, poi ${o.b2.dur} s di scena di lettura: scarto ${o.b2.scarto} u, strada ${o.b2.strada} u, guide ${o.b2.guide}`);
      if (o.b3.ng) segna(3, 0, 1, `${id}: NON GIUDICATO (${o.b3.ng})${o.b3.gesto !== undefined ? ' gesto ' + (o.b3.gesto || 'nessuno') : ''}`); else segna(3, !o.b3.gesto, 0, `${id}: sul filo (lato ${o.b3.lat} u, distanza ${o.b3.d}, quota ${o.b3.y}) · gesto ${o.b3.gesto || 'NESSUNO'}`); }
    else { if (o.b4.ng) segna(4, 0, 1, `${id}: NON GIUDICATO (${o.b4.ng})`); else segna(4, o.b4.minGB > CHIUSA, 0, `${id}: minimo pallone-portiere ${o.b4.minGB} u (pallone ${o.b4.bx};${o.b4.bz} · portiere ${o.b4.gx};${o.b4.gz}) · bersaglio dell'arco x ${o.b4.atx} · gesto ${o.b4.gesto || 'nessuno'}${o.b4.allungo ? ' · arco allungato da x ' + o.b4.allungo.prima + ' a ' + o.b4.allungo.dopo : ''}`); } }
  const NOMI = { 1: 'una guida per fotogramma', 2: 'nessuna scivolata durante la scelta', 3: 'tuffo sempre sul filo della portata', 4: 'parata chiusa entro la portata del portiere' };
  for (const n of [1, 2, 3, 4]) { if (!A[n].t.length) continue; console.log(`  braccio ${n} «${NOMI[n]}»: giudicate ${A[n].g}, con difetto ${A[n].d}, non giudicate ${A[n].ng}`); for (const t of A[n].t) console.log('    ' + t); }
  return { A, NOMI };
}
const SOLO = process.env.CPM_SOLO || ''; let ok = true; const fine = [];
const attivi = [1, ...(TIPI.includes('palo') ? [2, 3] : []), ...(TIPI.includes('parata') ? [4] : [])];
if (SOLO !== 'rosso') { const { A, NOMI } = await braccio(false); for (const n of attivi) { const a = A[n]; const v = a.d === 0 && a.ng === 0 && a.g >= 8; if (!v) ok = false; fine.push(`VERDE braccio ${n} «${NOMI[n]}»: ${a.d} difetti su ${a.g} giudicate, ${a.ng} non giudicate${v ? '' : ' → NON VERDE'}`); } }
if (SOLO !== 'verde') { const { A, NOMI } = await braccio(true); for (const n of attivi) { const a = A[n]; const v = a.d >= 6 && a.g >= 8; if (!v) ok = false; fine.push(`ROSSO braccio ${n} «${NOMI[n]}»: difetto rivisto in ${a.d} scene su ${a.g} giudicate (attese almeno 6 su almeno 8), ${a.ng} non giudicate${v ? '' : ' → IL ROSSO NON SI VEDE'}`); } }
await b.close(); srv.close();
for (const r of fine) console.log(r);
if (MISURA) { console.log('\n(CPM_MISURA: stampa senza giudicare)'); process.exit(0); }
console.log(ok ? `\n✅ portiere-295 VERDE (verde col verde, rosso col rosso): una guida per fotogramma, portiere fermo durante la scelta, tuffo sul palo sul filo della portata, parata chiusa al portiere.` : `\n❌ portiere-295 ROSSO — ${fine.filter(r => /→/.test(r)).join(' · ')}`);
process.exit(ok ? 0 : 1);
