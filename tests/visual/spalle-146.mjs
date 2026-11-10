#!/usr/bin/env node
/* [giro 146 · PO-348 «occhio alla gestione delle spalle, braccia e mani dei calciatori 3D. Devono avere le spalle larghe e proporzionate
   al corpo in tutte le scene e negli highlights!»] GUARDIANO NON-gate, GLB ACCESO, sul gioco vero. Quattro scene: highlight dell'eroe
   (scelta + gesto, gi18 e gi3) · premiazione (alzata del trofeo) · intro · serata di presentazione. Misura ogni corpo 3D vivo con
   __misura146 (spalle-146-misura.mjs: vertici skinnati + ossa, nel mondo, rapporti adimensionali).
   SOGLIE (fissate dopo la misura del giro 146, mai da abbassare — tabella in docs/sviluppo/RAPPORTO-giro146.md):
     · spalle/anche alle articolazioni (Sj/Aj) di OGNI corpo in OGNI campione dentro [2,30 · 2,65]
       (prima: presentazione 1,96-2,00, alzata 1,25-2,12, highlight fino a 2,21; dopo: 2,33-2,44);
     · spalle/statura (Sj/H) di ogni corpo dentro [0,21 · 0,28] (prima: 0,127 nell'alzata, 0,190 nella presentazione; dopo 0,221-0,263);
     · STESSO EROE IN OGNI SCENA: mediana di Sj/Aj per scena, massima/minima <= 1,05 (prima 1,43; dopo 1,03);
     · mani (polso → punta piu' lontana) / statura dentro [0,06 · 0,12] (dopo 0,068-0,105; riferimento mano aperta ~0,108);
     · omero/statura dentro [0,10 · 0,13], avambraccio/statura dentro [0,12 · 0,155] (nessun braccio stirato dalla corporatura).
   Copertura minima per scena (altrimenti «non giudicato» = rosso). Rosso: __CPM_NO_G146 → deve CADERE.
   Uso: node spalle-146.mjs  (CPM_FORMATO=360x800 di default, oppure 1440x900 · CPM_SOLO=verde|rosso) — verde e rosso stampati per ultimi. */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const M = await import('./spalle-146-scene.mjs');
const [VW, VH] = (process.env.CPM_FORMATO || '360x800').split('x').map(Number);
const SJAJ = [2.30, 2.65], SJH = [0.21, 0.28], COER = 1.05, MANO = [0.06, 0.12], UA = [0.10, 0.13], FA = [0.12, 0.155];
const COPERTURA = { highlight: { eroe: 6, tutti: 10 }, premiazione: { eroe: 1, tutti: 3 }, intro: { eroe: 4, tutti: 6 }, presentazione: { eroe: 1, tutti: 5 } };
const srv = await M.startServer(); const port = srv.address().port; const browser = await M.launchBrowser();
async function braccio(rosso) {
  const vp = { width: VW, height: VH }, tag = `guardiano-${rosso ? 'rosso' : 'verde'}-${VW}x${VH}`; const S = [];
  S.push(...await M.scenaPartita(browser, port, vp, rosso, tag)); S.push(...await M.scenaIntro(browser, port, vp, rosso, tag)); S.push(...await M.scenaPresentazione(browser, port, vp, rosso, tag));
  const ko = [], ok = S.filter(x => !x.errore && x.H), r3 = x => +x.toFixed(3);
  S.filter(x => x.errore).forEach(x => ko.push('non giudicato: ' + x.errore));
  const fuori = (k, [a, b], nome) => { const L = ok.filter(x => !(x[k] >= a && x[k] <= b)); if (L.length) ko.push(`${nome} fuori da [${a}, ${b}] su ${L.length} campioni: ` + [...new Set(L.map(x => `${x.scena}/${x.chi} ${x[k]}`))].slice(0, 6).join(' · ')); };
  fuori('SjAj', SJAJ, 'spalle/anche'); fuori('SjH', SJH, 'spalle/statura'); fuori('manoH', MANO, 'mano/statura'); fuori('uaH', UA, 'omero/statura'); fuori('faH', FA, 'avambraccio/statura');
  const med = a => { a = a.slice().sort((p, q) => p - q); return a[Math.floor(a.length / 2)]; }, per = {};
  for (const [sc, c] of Object.entries(COPERTURA)) { const L = ok.filter(x => x.scena === sc), E = L.filter(x => x.chi === 'eroe');
    if (E.length < c.eroe || L.length < c.tutti) ko.push(`non giudicato: ${sc} — campioni eroe ${E.length}/${c.eroe}, tutti ${L.length}/${c.tutti}`);
    if (E.length) per[sc] = { SjAj: r3(med(E.map(x => x.SjAj))), SjH: r3(med(E.map(x => x.SjH))), mano: r3(med(E.map(x => x.manoH))), min: r3(Math.min(...L.map(x => x.SjAj))) }; }
  const v = Object.values(per).map(x => x.SjAj); const coer = v.length === 4 ? r3(Math.max(...v) / Math.min(...v)) : null;
  if (coer == null) ko.push('non giudicato: eroe non misurato in tutte e quattro le scene'); else if (!(coer <= COER)) ko.push(`eroe: spalle/anche cambiano fra le scene (massima/minima ${coer} > ${COER}) ` + JSON.stringify(per));
  return { formato: `${VW}x${VH}`, campioni: ok.length, eroe: per, coerenza: coer, rilievi: ko };
}
const SOLO = process.env.CPM_SOLO; const V = SOLO === 'rosso' ? null : await braccio(false), R = SOLO === 'verde' ? null : await braccio(true);
await browser.close(); srv.close();
const verdeOk = !V || V.rilievi.length === 0, rossoCade = !R || (R.rilievi.length > 0 && !R.rilievi.every(x => /^non giudicato/.test(x)));
if (V) console.log('VERDE ' + JSON.stringify(V)); if (R) console.log('ROSSO (__CPM_NO_G146) ' + JSON.stringify(R));
if (!verdeOk || !rossoCade) { console.log('❌ spalle-146' + (!verdeOk ? ' — verde con rilievi' : '') + (!rossoCade ? ' — il rosso non cade' : '')); process.exit(1); }
console.log('✅ spalle-146 verde (e il rosso cade)');
