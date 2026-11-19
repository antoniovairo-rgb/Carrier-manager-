#!/usr/bin/env node
/* GUARDIANO giro 265 — «NEGLI HIGHLIGHT IL PORTIERE STA SUL SUO PUNTO» (riparazione di portiere-223, rosso a tratti su lavoro/197).

   MISURATO (giro 265, gi86 «Stacco sul secondo palo» esito fuori, pagina nuova per tiro): sul banco la scena viene forzata mentre il
   portiere e' in viaggio verso il punto della scena precedente; il suo bersaglio commesso restava indietro di 6 u, lui lo inseguiva e
   tornava con un giro largo (fino a 5,6 u dal suo punto) finendo a x 49,2, oltre la linea di porta (48,6). Da li' si tuffava su un
   pallone largo: e' il rosso a tratti di portiere-223 («tuffo su un pallone largo», gi86/gi62). Con lo stacco di scena attivo
   (CPM_PRESENT=1, come nel gioco) il portiere viene rimesso sul punto e il difetto non compare (0 su 12).
   Il difetto spontaneo dipende da dove si trova il portiere quando la scena viene forzata (misurato col rosso: 5 su 8, 3 su 4, 2 su 8):
   percio' il guardiano lo PROVOCA, e giudica due cose diverse.
   A) RIENTRO PROVOCATO (:p, nessun tiro): nella fase di scelta, dove il portiere ha una guida sola, la sonda gli sposta il bersaglio
      (__CPM_GKAT119, solo ?cpmtest=1) a 10 u dal suo punto e, appena lui e' IN CORSA (oltre 4 u/s, a piu' di 2 u dal punto), lo
      riporta sul suo punto (97; 47), tenuto fisso: e' l'inversione del bersaglio a corpo lanciato, la stessa che il banco produce da
      solo a tratti. Da fermo il difetto non nasce (misurato: 0 su 3 anche col rosso). Nei 2,5 s di scena dopo l'inversione:
        ✗ «giro largo»  si scosta piu' di 1 u di lato dalla retta verso il suo punto (misurato: verde 0,01-0,04 u, rosso 3,9-4,4 u);
        ✗ «in porta»    oltre la linea di porta (x > 48,6);
        ✗ «non torna»   alla fine a piu' di 1 u dal suo punto, o ancora in movimento a piu' di 1 u/s (misurato: verde 0,08-0,41 u
                        fermo; rosso 3,3-4,6 u a 6-7 u/s). La frenata dopo l'inversione (1,5-1,7 u ancora in avanti) si stampa e non
                        si giudica: un corpo lanciato ha bisogno di spazio per fermarsi.
   B) TIRO SPONTANEO (come lo fa portiere-223: force + esito fallito), fra l'inizio della scena e il calcio:
        ✗ «in porta»    oltre la linea di porta (x > 48,6);
        ✗ «in corsa»    al calcio si sta spostando a piu' di 2 u/s.
      (Durante la costruzione dell'azione il portiere ha DUE guide — il suo ciclo e il copione del build-up — e sta fra i due punti:
      la distanza da «un» punto li' non e' un metro, e non si giudica.)
   Un caso senza i fotogrammi che servono e' NON GIUDICATO = rosso.
   RIPETIZIONE DICHIARATA: per braccio 3 rientri provocati (gi86) + 4 tiri spontanei (gi86 fuori x2, gi86 palo, gi62 fuori).
   VERDE = 0 difetti su 7. ROSSO (__CPM_NO_G265, comportamento di prima) = tutti e 3 i rientri provocati con un difetto.

     CPM_CHROME=… node tests/visual/portiere-265.mjs            (verde, poi rosso)
     CPM_SOLO=verde|rosso · CPM_SCENE=86:0:wide:p,62:1:wide · CPM_PRESENT=1 (stacco di scena attivo) · CPM_TRACCIA=<passo> (fotogrammi) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '86:0:wide:p,86:0:wide:p,86:0:wide:p,86:0:wide,86:0:wide,86:0:post,62:1:wide').split(',').map(s => { const [gi, ai, k, p] = s.split(':'); return { gi: +gi, ai: +ai, k: k || 'wide', p: p === 'p' }; });
const PUNTO = { x: 97, y: 47 }; /* il punto del portiere in gi86 (misurato: 97; 45,6-47,6), coordinate di gioco */
const FUORI = { x: 87, y: 41 }; /* bersaglio provocato, coordinate di gioco: ~5 u dal punto del portiere (97; 46-47) */
const GIRO = 1.0, LINEA = 48.6, CORSA = 2.0;
const srv = await startServer(), port = srv.address().port, b = await launchBrowser();

async function tiro(sc, rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_REC = true; window.__CPM_CINE = 1; if (r[0]) window.__CPM_NO_G265 = 1; if (r[1]) window.__CPM_PRESENT = 1; }, [rosso, !!process.env.CPM_PRESENT]);
  try {
    await openMatch(page, port); await sleep(800);
    if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), sc.gi)) { await page.close(); return { nonGiud: 'force fallito' }; }
    await sleep(400);
    await page.evaluate(kk => { window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_REC229 = 1; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = kk; }, sc.k);
    if (sc.p) { /* RIENTRO PROVOCATO: si aspetta l'EVENTO «arrivato e fermo sul bersaglio spostato», poi 2,5 s di SCENA dal rilascio */
      await page.evaluate(f => { window.__CPM_GKAT119 = f; }, FUORI); let t1 = Date.now(), ok1 = false; const wx = FUORI.x - 50, wz = (FUORI.y - 50) * 0.68;
      while (Date.now() - t1 < 20000) { await sleep(60); const L = await page.evaluate(() => { const R = window.__CPM_GK229 || []; return R.length ? R[R.length - 1] : null; }); if (L && Math.hypot(L.gx - (PUNTO.x - 50), L.gz - (PUNTO.y - 50) * 0.68) > 2.0 && Math.hypot(L.vx || 0, L.vz || 0) > 4.0) { ok1 = true; break; } }
      if (!ok1) { await page.close(); return { nonGiud: 'il portiere non parte verso il bersaglio provocato' }; }
      const iR = await page.evaluate(f => { window.__CPM_GKAT119 = f; return (window.__CPM_GK229 || []).length; }, PUNTO); /* il «rilascio» e' il ritorno del bersaglio sul punto del portiere, tenuto FISSO dalla sonda: lasciato libero, nella fase di scelta il punto logico scivola verso il pallone (misurato: z da 4,8 a 11,7 in 2,4 s) e non c'e' piu' un punto contro cui misurare */
      t1 = Date.now(); let R = [];
      while (Date.now() - t1 < 40000) { await sleep(250); R = await page.evaluate(i => (window.__CPM_GK229 || []).slice(i), iR); if (R.length > 3 && R[R.length - 1].ck - R[0].ck >= 2.5) break; }
      await page.close();
      if (R.length < 4 || R[R.length - 1].ck - R[0].ck < 2.5) return { nonGiud: 'meno di 2,5 s di scena dopo il rilascio' };
      const iF = R.findIndex(f => f.ck - R[0].ck >= 2.5), F = R[iF]; if (F.ex == null) return { nonGiud: 'bersaglio del portiere non campionato' };
      if (R.slice(0, iF + 1).some(f => f.ph !== 'hl_choose')) return { nonGiud: 'la fase di scelta e\' finita prima dei 2,5 s' };
      let strada = 0, xMax = -99; for (let i = 0; i <= iF; i++) { if (i) strada += Math.hypot(R[i].gx - R[i - 1].gx, R[i].gz - R[i - 1].gz); xMax = Math.max(xMax, R[i].gx); }
      const px = PUNTO.x - 50, pz = (PUNTO.y - 50) * 0.68, d0p = Math.hypot(R[0].gx - px, R[0].gz - pz); let dPiu = 0, lat = 0;
      for (let i = 0; i <= iF; i++) { const f = R[i]; dPiu = Math.max(dPiu, Math.hypot(f.gx - px, f.gz - pz) - d0p); lat = Math.max(lat, Math.abs((f.gx - px) * (R[0].gz - pz) - (f.gz - pz) * (R[0].gx - px)) / Math.max(0.01, d0p)); }
      const retta = Math.hypot(F.gx - R[0].gx, F.gz - R[0].gz), dF = Math.hypot(F.gx - F.ex, F.gz - F.ez), vF = Math.hypot(F.vx || 0, F.vz || 0);
      if (process.env.CPM_TRACCIA) for (let i = 0; i <= iF; i += +(process.env.CPM_TRACCIA)) { const f = R[i]; console.log(`     ${(f.ck - R[0].ck).toFixed(2)} ${f.ph} corpo(${f.gx};${f.gz}) bersaglio(${f.ex};${f.ez}) commesso(${f.cx};${f.cz}) v(${f.vx};${f.vz})`); }
      return { prov: 1, v0: +Math.hypot(R[0].vx || 0, R[0].vz || 0).toFixed(2), dPiu: +dPiu.toFixed(2), lat: +lat.toFixed(2), d0: +Math.hypot(R[0].gx - F.ex, R[0].gz - F.ez).toFixed(2), strada: +strada.toFixed(2), retta: +retta.toFixed(2), rap: +(strada / Math.max(0.01, retta)).toFixed(2), xMax, dF: +dF.toFixed(2), vF: +vF.toFixed(2) }; }
    await page.evaluate(a => window.__CPM_RESOLVE(a), sc.ai);
    /* si aspetta un EVENTO in tempo di scena: arco finito + 1 s di scena (tetto di parete 60 s) */
    const t0 = Date.now();
    while (Date.now() - t0 < 60000) { await sleep(300);
      const s = await page.evaluate(() => { const R = window.__CPM_GK229 || [], L = R[R.length - 1]; let iE = -1, arm = false; for (let i = 0; i < R.length; i++) { if (R[i].at) arm = true; if (arm && !R[i].at) { iE = i; break; } } return { ck: L ? L.ck : 0, ckE: iE >= 0 ? R[iE].ck : null }; });
      if (s.ckE != null && s.ck - s.ckE > 1.0) break; }
    const R = await page.evaluate(() => (window.__CPM_GK229 || []).slice()); await page.close();
    const i0 = R.findIndex(f => f.at), iK = R.findIndex((f, i) => i >= i0 && i0 >= 0 && f.at && f.aT >= 0), iA = R.findIndex((f, i) => i >= i0 && i0 >= 0 && f.op);
    if (iK < 0) return { nonGiud: 'calcio non campionato' };
    const iB = 0;
    const B = []; for (let i = iB; i <= iK; i++) { const f = R[i]; if (f.ex == null) continue; if (!B.some(q => Math.hypot(q[0] - f.ex, q[1] - f.ez) < 0.05)) B.push([f.ex, f.ez]); }
    if (!B.length) return { nonGiud: 'bersaglio del portiere non campionato' };
    const dd = f => Math.min(...B.map(q => Math.hypot(f.gx - q[0], f.gz - q[1])));
    let dMax = 0, xMax = -99; for (let i = iB; i <= iK; i++) { const f = R[i]; dMax = Math.max(dMax, dd(f)); xMax = Math.max(xMax, f.gx); }
    const K = R[iK], vK = Math.hypot(K.vx || 0, K.vz || 0);
    if (process.env.CPM_TRACCIA) for (let i = 0; i <= iK + 2 && i < R.length; i += +(process.env.CPM_TRACCIA)) { const f = R[i]; console.log(`     ${f.ck.toFixed(2)} ${f.ph} arco${f.at} corpo(${f.gx};${f.gz}) bersaglio(${f.ex};${f.ez}) commesso(${f.cx};${f.cz}) v(${f.vx};${f.vz}) stacco${f.sn} pallone(${f.bx};${f.bz}) ${f.op || ''}`); }
    return { dMax: +dMax.toFixed(2), xMax, xK: K.gx, zK: K.gz, vK: +vK.toFixed(2), bers: B.length, gesto: iA >= 0 ? R[iA].op : null };
  } catch (e) { try { await page.close(); } catch (_e) {} return { nonGiud: 'errore: ' + String(e.message || e).slice(0, 100) }; }
}

async function braccio(rosso) {
  const dif = []; let n = 0;
  console.log(`\n— braccio ${rosso ? 'ROSSO (__CPM_NO_G265)' : 'VERDE'} —`);
  for (const sc of SCENE) { n++; const o = await tiro(sc, rosso); const id = sc.p ? `gi${sc.gi} rientro provocato #${n}` : `gi${sc.gi} ${sc.k} #${n}`;
    if (o.nonGiud) { console.log(`  ⚠ ${id}: NON GIUDICATO (${o.nonGiud})`); dif.push(`${id}: non giudicato (${o.nonGiud})`); continue; }
    const d = [];
    if (o.prov) { if (o.lat > GIRO) d.push(`giro largo (${o.lat} u di lato rispetto alla retta verso il suo punto)`); if (o.xMax > LINEA) d.push(`in porta (x ${o.xMax}, linea ${LINEA})`); if (o.dF > 1.0 || o.vF > 1.0) d.push(`non torna (dopo 2,5 s a ${o.dF} u dal suo punto, ${o.vF} u/s)`);
      console.log(`  ${d.length ? '✗' : '·'} ${id}: rilasciato a ${o.d0} u dal suo punto in corsa a ${o.v0} u/s · si allontana ancora di ${o.dPiu} u · scarto di lato ${o.lat} u · x massima ${o.xMax} · dopo 2,5 s a ${o.dF} u dal punto, ${o.vF} u/s${d.length ? ' → ' + d.join(', ') : ''}`); }
    else { if (o.xMax > LINEA) d.push(`in porta prima del calcio (x ${o.xMax}, linea ${LINEA})`); if (o.vK > CORSA) d.push(`in corsa al calcio (${o.vK} u/s)`);
      console.log(`  ${d.length ? '✗' : '·'} ${id}: x massima ${o.xMax} · al calcio (${o.xK}; ${o.zK}) a ${o.vK} u/s · massimo dal bersaglio del suo ciclo ${o.dMax} u (non giudicato) · gesto ${o.gesto || 'nessuno'}${d.length ? ' → ' + d.join(', ') : ''}`); }
    if (d.length) { dif.push(`${id}: ${d.join(', ')}`); if (sc.p) dif.prov = (dif.prov | 0) + 1; } }
  return dif;
}
const SOLO = process.env.CPM_SOLO || '';
let ok = true; const fine = [];
if (SOLO !== 'rosso') { const d = await braccio(false); if (d.length) { ok = false; fine.push(`braccio VERDE: ${d.length} difetti su ${SCENE.length} casi — ${d.join(' | ')}`); } else fine.push(`braccio VERDE: 0 difetti su ${SCENE.length} casi`); }
if (SOLO !== 'verde') { const d = await braccio(true); const np = SCENE.filter(q => q.p).length; if ((d.prov | 0) < np || !np) { ok = false; fine.push(`braccio ROSSO: ${d.prov | 0} rientri provocati con un difetto su ${np} (attesi tutti): il guardiano non separa`); } else fine.push(`braccio ROSSO: ${d.prov} rientri provocati su ${np} con un difetto (${d.length} casi su ${SCENE.length} in tutto)`); }
await b.close(); srv.close();
for (const r of fine) console.log(r);
console.log(ok ? `\n✅ portiere-265 VERDE (verde col verde, rosso col rosso): negli highlight il portiere resta sul suo punto, davanti alla linea, fermo al calcio.` : `\n❌ portiere-265 ROSSO — ${fine.join(' · ')}`);
process.exit(ok ? 0 : 1);
