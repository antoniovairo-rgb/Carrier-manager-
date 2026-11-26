#!/usr/bin/env node
/* [giro 364, PO-650 «urgentemente risolviamo le azioni sulle fasce, al momento sono terribili e confusionarie» — rosso __CPM_NO_G364]
   GUARDIANO «LA SCENA DI FASCIA SI GIOCA SULLA FASCIA · IL CROSS CADE SU UN COMPAGNO CHE ARRIVA DI CORSA».

   Note del PO sulla 7.999.208: «le azioni sulla fascia non sono disegnate, proprio nei movimenti, bene ed i cross sono terribili»
   (eroe al contatto a z -0,4, cioe' al centro) · «si accentra l'eroe ed il passaggio e' freezato per qualche istante poi interviene
   magicamente il compagno» (eroe al contatto a z -6,9). Cause misurate (docs/sviluppo/RAPPORTO-giro364.md): la costruzione del cross
   portava l'eroe 12 unita' verso il CENTRO; il cross mirava un punto sorteggiato tirato verso il compagno piu' vicino dov'era; i due
   compagni piu' vicini venivano richiamati accanto all'eroe; il ricevente arrivava scivolando e il pallone lo aspettava parcheggiato;
   la camera restava di fianco all'eroe e l'area non si vedeva.

   (A) node, sequenza pura (buildHLTimeline) e scena del motore (scenaDalMotoreFascia): 24 partenze larghe x 3 tipi di cross.
       VERDE: l'eroe arriva al cross a 32 o piu' dal centro (fuori dall'area disegnata, 29,65) e mai piu' stretto di dov'era;
              «Rientra e tira» finisce entro 12 dal centro; la zona di movimento della scena di fascia non scende sotto 20 dal centro;
              la sequenza resta valida (validateHLTimeline: nessuna violazione).
       ROSSO: l'eroe al cross e' piu' stretto di dov'era partito in almeno il 90% dei casi.
   (B) browser, GLB ACCESO, teatro acceso, scene costruite dal motore in 3 punti di fascia (misura-364, testimone __CPM_F364, tutto
       dalle mesh). Per ogni cross dell'eroe:
       VERDE, tutte insieme: 1. eroe al contatto a |z| >= 18 sul lato del testo e accentramento <= 2 u;
              2. cross lungo almeno 15 u che cade in area; 3. c'e' un ricevente e all'arrivo e' entro 3 u dal pallone;
              4. il ricevente e' nel quadro per almeno il 60% del volo; 5. pallone mai fermo oltre 0,5 s di scena prima che l'esito sia deciso (costruzione, volo, consegna);
              6. nessun salto del pallone ne' della camera fuori dallo stacco; 7. esito «occasione» = pallone NON in rete, gol = in rete.
              I compagni in area nel quadro alla scelta si dichiarano e non si giudicano (PO-653, in coda).
       ROSSO: accentramento mediano >= 6 u e almeno meta' dei cross non passa.
       Una scena senza fotogrammi o senza arco = NON GIUDICATA = rosso. Almeno 8 cross giudicati per braccio.
   Uso: node fasce-364.mjs (verde poi rosso) · CPM_SOLO=verde|rosso · CPM_SOLO_A=1 (solo la parte node). */
import { loadCine } from './lib/cine.mjs';
import { loadSituations } from './lib/situations.mjs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apri, gioca, metriche } from './misura-364.mjs';

const med = a => { const s = a.filter(x => x != null).sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };

/* ---------- (A) node ---------- */
function parteA(rosso) {
  const prima = globalThis.window; globalThis.window = rosso ? { __CPM_NO_G364: 1 } : undefined;
  try {
    const { buildHLTimeline, validateHLTimeline } = loadCine(); const R = { n: 0, stretto: 0, sotto32: 0, viol: 0, rientroN: 0, rientroLargo: 0, es: [] };
    const PAT = [['NEAR_POST_CROSS', 'cross_near_post'], ['FAR_POST_CROSS', 'cross_far_post'], ['CUTBACK', 'cross_cutback']];
    for (const x of [62, 68, 74, 80]) for (const lat of [20, 24, 30, 36, 42, 46]) for (const sg of [1, -1]) {
      const y = 50 + sg * lat;
      for (const [pattern, variant] of PAT) for (const support of [0, 2]) {
        const hl = { type: 'cross', pattern, variant }; const tl = buildHLTimeline(hl, { x, y, reward: 'assist', support });
        let hy = y; const ic = tl.beats.findIndex(b => b.tag === 'cross'); tl.beats.slice(0, ic).forEach(b => (b.moves || []).forEach(m => { if (m.who === 'HERO') hy = m.to[1]; }));
        const latC = Math.abs(hy - 50); R.n++; if (latC < Math.min(lat, 42) - 0.01) R.stretto++;/* oltre 42 dal centro (a due passi dalla linea laterale) rientra a 42 */ if (latC < 32) { R.sotto32++; if (R.es.length < 3) R.es.push(`x ${x} y ${y} ${pattern}: al cross a ${latC.toFixed(1)} dal centro`); }
        const v = validateHLTimeline(tl, hl); if (v.length) { R.viol++; if (R.es.length < 5) R.es.push(`x ${x} y ${y} ${pattern}: ${v[0]}`); }
      }
      const tlR = buildHLTimeline({ type: 'shot', pattern: 'DRIBBLE_SHOT', variant: 'shot_power' }, { x, y, reward: 'goal', lbl: '🎯 Rientra e tira' });
      let ry = y; tlR.beats.forEach(b => (b.moves || []).forEach(m => { if (m.who === 'HERO') ry = m.to[1]; })); R.rientroN++; if (Math.abs(ry - 50) > 12) R.rientroLargo++;
    }
    return R;
  } finally { globalThis.window = prima; }
}
/* la zona di movimento della scena di fascia: si costruisce la scena vera dentro la pagina (scenaDalMotoreFascia) */
async function zonaMovimento(pg) {
  return pg.evaluate(() => { const o = []; for (const [x, y] of [[66, 72], [70, 76], [72, 84], [68, 28], [72, 16], [80, 22]]) for (const seme of [3, 11, 29]) {
    const s = scenaDalMotoreFascia({ tipo: 'fascia', x, y, press: 1, liberi: 1, cast: {} }, { name: 'G364', stats: {}, ovr: 70 }, seme); if (!s) continue;
    const z = s.moveZone, sg = y >= 50 ? 1 : -1; o.push({ y, interno: +(sg > 0 ? z.y[0] - 50 : 50 - z.y[1]).toFixed(1) }); } return o; });
}

/* ---------- (B) browser ---------- */
const PUNTI = [[72, 84, 1.2], [72, 16, 1.2], [66, 22, 2.0]];
async function parteB(b, port, rosso) {
  const rossi = rosso ? ['__CPM_NO_G364'] : []; let pg = await apri(b, port, rossi); const zm = await zonaMovimento(pg); const R = []; let n = 0;
  const lista = []; for (const p of PUNTI) for (let k = 0; k < 3; k++) lista.push({ sc: { occ: p, seme: 7 }, k, kind: null });
  for (let k = 0; k < 3; k++) lista.push({ sc: { occ: PUNTI[0], seme: 43 }, k, kind: 'chance' });
  for (let k = 0; k < 3; k++) lista.push({ sc: { occ: PUNTI[1], seme: 19 }, k, kind: null });/* il seme 19 offre «Rientra e tira» */
  for (const e of lista) {
    if (n && n % 6 === 0) { await pg.close(); pg = await apri(b, port, rossi); } n++;/* una pagina stanca non e' il gioco */
    let run; try { run = await gioca(pg, e.sc, e.k, 'success', { kind: e.kind }); } catch (err) { run = { err: String(err && err.message).slice(0, 100) }; try { await pg.close(); } catch (_e) { } pg = await apri(b, port, rossi); }
    if (run.err) { R.push({ ...e, err: run.err }); continue; }
    if (run.errori && run.errori.length) { R.push({ ...e, err: 'errore di pagina: ' + run.errori[0] }); continue; }/* un errore nel ciclo 3D toglie fotogrammi al testimone: non si giudica */
    R.push({ ...e, az: run.st.az[e.k], m: metriche(run) });
  }
  await pg.close(); return { zm, R };
}

function giudica(nome, A, B) {
  const rosso = nome === 'rosso'; const motivi = [];
  console.log(`\n[${nome}] (A) sequenza pura, ${A.n} cross da largo: al cross piu' stretto di dov'era ${A.stretto} · sotto 32 dal centro ${A.sotto32} · sequenze non valide ${A.viol} · «Rientra e tira» ancora largo ${A.rientroLargo}/${A.rientroN}${A.es.length ? ' · es. ' + A.es.slice(0, 2).join(' | ') : ''}`);
  if (!rosso) { if (A.stretto) motivi.push(`A: ${A.stretto} cross con l'eroe piu' stretto di dov'era`); if (A.sotto32) motivi.push(`A: ${A.sotto32} cross da meno di 32 dal centro`); if (A.viol) motivi.push(`A: ${A.viol} sequenze non valide`); if (A.rientroLargo) motivi.push(`A: ${A.rientroLargo} «Rientra e tira» che non rientrano`); }
  if (A.n < 100) motivi.push('A cieco: meno di 100 cross');
  let rossoVisto = rosso && A.stretto >= 0.9 * A.n;
  if (rosso && !rossoVisto) motivi.push(`A: nel rosso solo ${A.stretto}/${A.n} cross si accentrano (attesi almeno il 90%)`);
  if (!B) return { motivi, rossoVisto };
  const zmMin = Math.min(...B.zm.map(z => z.interno));
  console.log(`[${nome}] (B) zona di movimento delle scene di fascia: bordo interno a ${zmMin} dal centro (minimo su ${B.zm.length} scene)`);
  if (!rosso && zmMin < 20) motivi.push(`B: la zona di movimento arriva a ${zmMin} dal centro (minimo 20)`);
  if (B.zm.length < 12) motivi.push('B cieco: meno di 12 scene costruite');
  const NG = B.R.filter(r => r.err || !r.m || r.m.cieco), V = B.R.filter(r => r.m && !r.m.cieco);
  for (const r of NG) motivi.push(`B NON GIUDICATA: ${r.err || (r.m && r.m.cieco)}`);
  const cross = V.filter(r => r.m.ht === 'cross'), rientro = V.filter(r => /rientra e tira/i.test(r.az || ''));
  const bocc = [];
  for (const r of cross) { const m = r.m, q = [];
    if (m.zCont == null || !m.arco) q.push('cross mai partito');
    else { if (m.zCont < 18) q.push(`eroe al contatto a z ${m.zCont}`); if (m.accentra > 2) q.push(`accentramento ${m.accentra} u`);
      if (m.arco.lung < 15) q.push(`cross di ${m.arco.lung} u`); if (!m.arco.inArea) q.push('caduta fuori area');
      if (!m.ric) q.push('nessun ricevente'); else { if (m.ric.dArrivo == null || m.ric.dArrivo > 3) q.push(`ricevente a ${m.ric.dArrivo} u dal pallone all'arrivo`); if (m.ricQuadroVolo == null || m.ricQuadroVolo < 0.6) q.push(`ricevente nel quadro per il ${Math.round((m.ricQuadroVolo || 0) * 100)}% del volo`); }
      if (m.fermoAzione > 0.5) q.push(`pallone fermo ${m.fermoAzione} s prima dell'esito`); if (m.saltoPalla) q.push(`salto del pallone ${m.saltoPalla.d} u (${m.saltoPalla.src || 'ws' + m.saltoPalla.ws})`); if (m.saltoCam) q.push(`salto della camera ${m.saltoCam.d} u`);
      if (m.kd === 'chance' && m.inRete) q.push('esito «occasione» ma pallone in rete'); if (m.kd === 'goal' && !m.inRete) q.push('gol dichiarato ma pallone non in rete');
      /* i compagni in area nel quadro alla scelta si DICHIARANO e non si giudicano: sulle partite vere la camera di lettura nuova non li aumenta (18 prima, 17 dopo su 11 scene); e' PO-653, in coda */ }
    console.log(`  ${m.lato > 0 ? 'dx' : 'sx'} «${(r.az || '').slice(0, 28)}» ${m.kd}: z contatto ${m.zCont} (acc ${m.accentra}) · cross ${m.arco ? m.arco.lung + ' u quota ' + m.arco.quota : 'MAI'} · ricevente ${m.ric ? `a ${m.ric.dArrivo} u all'arrivo, nel quadro ${Math.round((m.ricQuadroVolo || 0) * 100)}% del volo` : 'NESSUNO'} · fermo ${m.fermoAzione} s · in area nel quadro alla scelta ${m.compagniInAreaQuadro}${q.length ? '  ✗ ' + q.join('; ') : ''}`);
    if (q.length) bocc.push(q[0]); }
  for (const r of rientro) { console.log(`  «${r.az}»: eroe al tiro a z ${r.m.zCont} (partiva a ${r.m.zApe})`); if (!rosso && !(r.m.zCont != null && r.m.zCont <= 12)) motivi.push(`B: «Rientra e tira» tira da z ${r.m.zCont} (deve rientrare entro 12)`); }
  const accMed = med(cross.map(r => r.m.accentra));
  console.log(`[${nome}] (B) cross giudicati ${cross.length} · bocciati ${bocc.length} · accentramento mediano ${accMed} u · z al contatto mediana ${med(cross.map(r => r.m.zCont))} · lunghezza mediana ${med(cross.map(r => r.m.arco && r.m.arco.lung))} u · ricevente all'arrivo mediana ${med(cross.map(r => r.m.ric && r.m.ric.dArrivo))} u`);
  if (cross.length < 8) motivi.push(`B cieco: solo ${cross.length} cross giudicati (minimo 8)`);
  if (!rientro.length) motivi.push('B cieco: «Rientra e tira» mai offerto');
  if (!rosso) { if (bocc.length) motivi.push(`B: ${bocc.length} cross bocciati su ${cross.length} (${bocc.slice(0, 3).join(' · ')})`); }
  else { const ok = accMed != null && accMed >= 6 && bocc.length >= cross.length / 2; rossoVisto = rossoVisto && ok; if (!ok) motivi.push(`B: nel rosso accentramento mediano ${accMed} u e ${bocc.length}/${cross.length} bocciati (attesi >= 6 u e almeno meta')`); }
  return { motivi, rossoVisto };
}

async function main() {
  const solo = process.env.CPM_SOLO || '', soloA = !!process.env.CPM_SOLO_A; let esito = 0;
  let server = null, b = null, port = 0; if (!soloA) { server = await startServer(); port = server.address().port; b = await launchBrowser(); }
  for (const nome of ['verde', 'rosso']) { if (solo && solo !== nome) continue; const rosso = nome === 'rosso';
    const A = parteA(rosso); const B = soloA ? null : await parteB(b, port, rosso); const g = giudica(nome, A, B);
    if (!rosso) { if (g.motivi.length) { esito = 1; console.log(`\n❌ fasce-364 [verde] ROSSO: ${g.motivi.join(' · ')}`); } else console.log('\n✅ fasce-364 [verde]: la scena di fascia si gioca sulla fascia e il cross cade su un compagno che arriva');
    } else { const rotti = g.motivi.filter(m => /cieco|NON GIUDICATA|nel rosso/.test(m)); if (rotti.length || !g.rossoVisto) { esito = 1; console.log(`\n❌ fasce-364 [rosso __CPM_NO_G364] NON dimostra il difetto: ${rotti.join(' · ') || 'difetto non visto'}`); } else console.log('\n✅ fasce-364 [rosso __CPM_NO_G364]: senza la correzione il difetto si vede (eroe che si accentra, cross corti, ricevente lontano)'); }
  }
  if (b) await b.close(); if (server) server.close();
  console.log(esito ? '\nFASCE-364: ROSSO' : '\nFASCE-364: VERDE'); process.exit(esito);
}
main().catch(e => { console.error(e); console.log('\nFASCE-364: ROSSO (errore)'); process.exit(1); });
