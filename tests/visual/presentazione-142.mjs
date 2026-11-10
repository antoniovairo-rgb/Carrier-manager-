#!/usr/bin/env node
/* [giro 142 PO-343 + D23] GUARDIANO della serata di presentazione (GLB acceso, sul gioco vero, apriPresentazione).
   Collaudo PO: «nella presentazione della squadra sono tutti uguali e sembrano manichini», «hanno pure una posa da impiccato», e il
   marchio in fondo letto «K O rward Elite». Giudica, sui corpi della fila:
     · ASPETTI DISTINTI: combinazioni diverse di (variante della testa, corporatura a passi di 0,02) >= SOGLIA_ASPETTI su 7 corpi;
     · TESTA: scarto dall'orientamento di riposo rispetto al busto <= SOGLIA_TESTA gradi, per tutti;
     · PIEDI: punta piu' bassa entro [-2, +3] cm dalla quota di riposo, l'altra entro +5 cm, inclinazione della punta entro 5 gradi;
     · VIVI: nessuno fermo per piu' di SOGLIA_FERMO secondi di tempo di scena;
     · MARCHIO: letto dal DOM uguale a «Korward Elite».
     · [giro 144] SALUTO: il chiamato (compagno al beat 3, EROE all'ultimo beat) alza la mano sopra la spalla per almeno SOGLIA_SALUTO s
       di scena dopo il passo, col palmo verso la tribuna, poi riabbassa e torna in fila; e all'ultimo beat avanza l'eroe;
     · [giro 144] SALA STAMPA: piastrelle del pannello e tovaglia lette dal DOM uguali a «Korward Elite».
   Rosso: __CPM_NO_G142 (squadra e postura) + __CPM_NO_G142M (marchio) + __CPM_NO_G144S (saluto) + __CPM_NO_G144M (sala stampa) — deve cadere. «Non giudicato» = rosso. Soglie fissate dopo la
   misura del giro 142 (verde: 6 combinazioni su 7, testa <= 9,4 gradi, punte <= 1,9 gradi, piedi 0..1,5 cm), mai da abbassare. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { misura } from './presentazione-142-misura.mjs';
import { campionaSaluto } from './saluto-144-misura.mjs';
import { apriStampa, leggiStampa } from './stampa-144-foto.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g142', { recursive: true });
const SOGLIA_ASPETTI = 5, SOGLIA_TESTA = 15, SOGLIA_FERMO = 1.0;
/* [giro 144 PO-347] saluto: mano destra sopra la spalla di almeno SOGLIA_MANO m per almeno SOGLIA_SALUTO s di scena dopo il passo,
   palmo verso la tribuna (coseno >= SOGLIA_PALMO) al culmine, poi mano giu' (sotto la spalla di 0,25 m) e corpo di nuovo in fila
   (entro 0,4 dalla fila) — sul compagno del beat 3 e sull'EROE all'ultimo beat. Soglie fissate dopo la misura (culmine +0,46…+0,49 m,
   palmo 0,97, riposo −0,36…−0,40 m). */
const SOGLIA_MANO = 0.15, SOGLIA_SALUTO = 1.5, SOGLIA_PALMO = 0.7, LZ = 6;
const PRO = { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#facc15', c2: '#2563eb', nat: '🇮🇹', lg: 'Lega A' };
const save = { phase: 'career', player: {
  name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 16, ovr: 60,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 1, presidentModalSeason: 1,
  drawSeen: 1, mercatoSeen: 1, coachPactSeason: 1, presentedClub: PRO.id, presentSeason: 1,
  seasonPledge: { season: 1, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 },
  form: 70, morale: 70, fatigue: 20, coachTrust: 60, teamChemistry: 60, popularity: 10, bankBalance: 1000,
  goals: 0, assists: 0, matches: 0, totalMatches: 0, totalGoals: 0, matchHistory: [],
  contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
const srv = await startServer(); const browser = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } }); await installCdnRoutes(page);
  await page.addInitScript(([o, r]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) { window.__CPM_NO_G142 = 1; window.__CPM_NO_G142M = 1; window.__CPM_NO_G144S = 1; window.__CPM_NO_G144M = 1; }
    localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, rosso]);
  let g = [], m = null, sal = null, st = null;
  try {
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
    await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    m = await misura({ page, beat: 1, finestra: 3000 });
    await page.screenshot({ path: `out/g142/guardiano-${rosso ? 'rosso' : 'verde'}.png` }).catch(() => {});
    /* [giro 144] il saluto: un compagno (beat 3) e l'eroe (ultimo beat) */
    const nb = await page.evaluate(() => { try { return window.__CPM_CAREER.presBeats().length; } catch (e) { return 0; } });
    if (!(nb >= 4)) g.push('non giudicato: beat della serata ' + nb);
    sal = [];
    for (const b of [3, nb - 1]) {
      const S = await campionaSaluto(page, b);
      const eroe = b === nb - 1, chi = S.length ? S[S.length - 1].avanti : -1, H = S.length ? S[0].eroe : -1;
      let sopra = 0, palmo = -2, picco = -9;
      for (let k = 1; k < S.length; k++) { const dtS = (S[k].t || 0) - (S[k - 1].t || 0); if (S[k].mr >= SOGLIA_MANO && dtS > 0) sopra += dtS; if (S[k].mr > picco) { picco = S[k].mr; palmo = S[k].palmo; } }
      const fine = S[S.length - 1] || {}, tFin = fine.t || 0;
      const giu = fine.mr != null && fine.mr <= -0.25, fila = fine.z ? Math.max(...fine.z.map(z => Math.abs(z - LZ))) <= 0.4 : false;
      const r = { beat: b, eroe, avanti: S.map(x => x.avanti).filter((v, i, a) => a.indexOf(v) === i), sopra: +sopra.toFixed(2), picco: +picco.toFixed(3), palmo, tFin: +tFin.toFixed(2), giu, fila, campioni: S.length };
      sal.push(r);
      const nome = eroe ? 'eroe' : 'compagno';
      if (S.length < 10 || !(tFin >= 5.5)) g.push(`non giudicato: saluto ${nome} — campioni ${S.length}, scena ${tFin}`);
      if (eroe && !S.some(x => x.avanti === H)) g.push(`ultimo beat: avanza il #${chi}, non l'eroe #${H}`);
      if (!(sopra >= SOGLIA_SALUTO)) g.push(`saluto ${nome}: mano sopra la spalla ${r.sopra} s di scena < ${SOGLIA_SALUTO} (picco ${r.picco} m)`);
      else if (!(palmo >= SOGLIA_PALMO)) g.push(`saluto ${nome}: palmo ${palmo} < ${SOGLIA_PALMO}`);
      if (!giu || !fila) g.push(`saluto ${nome}: non torna in posa/fila (mano ${fine.mr} · fila ${fila})`);
    }
  } catch (e) { g.push('non giudicato: ' + (e && e.message || e).toString().slice(0, 160)); }
  /* [giro 144 PO-346] la sala stampa: piastrelle del pannello e tovaglia leggono «Korward Elite» */
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx); const pg = await ctx.newPage();
    await apriStampa(pg, srv.address().port, rosso); st = await leggiStampa(pg); await ctx.close();
    if (!st.scena || !st.p144.length || !st.t144.length) g.push(`non giudicato: sala stampa (scena ${st.scena}, piastrelle ${st.p144.length}, tovaglia ${st.t144.length})`);
    const male = st.p144.concat(st.t144).filter(x => x !== 'Korward Elite');
    if (male.length) g.push('sala stampa: marchio letto ' + JSON.stringify([...new Set(male)]));
  } catch (e) { g.push('non giudicato: sala stampa — ' + (e && e.message || e).toString().slice(0, 160)); }
  if (m) {
    const men = m.men || [];
    if (men.length < 5) g.push('non giudicato: corpi in fila ' + men.length);
    const comb = new Set(men.map(x => (x.capelli || '?') + '|' + (Math.round(x.corp / 0.02) * 0.02).toFixed(2)));
    if (comb.size < SOGLIA_ASPETTI) g.push(`aspetti distinti ${comb.size} < ${SOGLIA_ASPETTI}`);
    const tMax = Math.max(...men.map(x => x.testaRiposo)); if (!(tMax <= SOGLIA_TESTA)) g.push(`testa fuori asse ${tMax} gradi > ${SOGLIA_TESTA}`);
    const pd = men.filter(x => !(x.piedeMin >= -0.02 && x.piedeMin <= 0.03 && x.piedeMax <= 0.05 && Math.max(...x.puntaGradi.map(Math.abs)) <= 5));
    if (pd.length) g.push('piedi non a terra: ' + pd.map(x => `#${x.i} min ${x.piedeMin} max ${x.piedeMax} punta ${x.puntaGradi}`).join(' · '));
    const tr = m.traccia || {}; if (!(tr.scena > 2)) g.push('non giudicato: tempo di scena ' + tr.scena);
    const fm = Math.max(...(tr.fermo || [99])); if (!(fm <= SOGLIA_FERMO)) g.push(`fermo per ${fm} s di scena > ${SOGLIA_FERMO}`);
    if (m.marchio !== 'Korward Elite') g.push('marchio letto ' + JSON.stringify(m.marchio));
    esito[rosso ? 'rosso' : 'verde'] = { corpi: men.length, aspetti: comb.size, testaMax: tMax, piediKO: pd.length, fermoMax: fm, scena: tr.scena, marchio: m.marchio, saluto: sal, stampa: st && { piastrelle: [...new Set(st.p144)], tovaglia: st.t144 }, rilievi: g };
  } else esito[rosso ? 'rosso' : 'verde'] = { rilievi: g };
  await page.close();
}
await browser.close(); srv.close();
const V = esito.verde, R = esito.rosso;
const verdeOk = V && V.rilievi.length === 0;
const rossoCade = R && R.rilievi.length > 0 && !R.rilievi.every(x => /^non giudicato/.test(x));
console.log('verde ' + JSON.stringify(V));
console.log('rosso ' + JSON.stringify(R));
if (!verdeOk || !rossoCade) { console.log('❌ presentazione-142' + (!verdeOk ? ' — verde con rilievi' : '') + (!rossoCade ? ' — il rosso non cade' : '')); process.exit(1); }
console.log('✅ presentazione-142 verde (e il rosso cade)');
