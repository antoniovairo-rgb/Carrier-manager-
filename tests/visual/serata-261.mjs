#!/usr/bin/env node
/* [giro 261] GUARDIANO NON-gate della serata di presentazione, GLB acceso, sul gioco vero. Tre correzioni, tre misure (misura-261.mjs), ognuna
   verde col verde e rossa con window.__CPM_NO_G261 (= la serata com'era su lavoro/197):
     A) LA FILA E' VIVA. Dal giro 192 le braccia della fila erano scritte in una direzione fissa (la loro oscillazione era cancellata): velocita'
        mediana delle ossa 8-10 mm/s di scena (prima 19-24) e presentazione-142 cadeva a seconda della corsa (fermo 0,5-1,6 s contro 1 s).
        Traccia di 30 s reali al beat 1, stesso campione e stesso criterio di presentazione-142: nessun corpo fermo piu' di FERMO s di scena
        e velocita' mediana di OGNI corpo >= VMED mm/s (misurato: verde fermo 0 s e 19-30 mm/s; rosso 0,9-1,6 s e 7,5-13 mm/s).
     B) LE SPALLE NON ARRETRANO COL TEMPO. Dal giro 192 la clavicola si accumulava fotogramma dopo fotogramma fra la regola delle spalle e la
        posa delle braccia: teste degli omeri da +0,016·H a −0,004·H in 5 s. Stessa scena e stesso metro di spalle-146 (tre momenti): pro >= PRO
        su ogni corpo, nuca mediana dell'eroe <= NUCA (le soglie del giro 146b, invariate) e deriva di pro fra primo e ultimo momento <= DERIVA
        (misurato: verde pro 0,016-0,026, nuca −0,007, deriva 0,0001-0,0014; rosso pro fino a −0,002, nuca +0,010, deriva 0,008-0,012).
     C) LA REGOLA DELLE SPALLE ENTRA IN RAMPA NEL SALUTO (dubbio 1 del giro 256). Saluto al rallentatore: al primo fotogramma del saluto il
        braccio destro non fa un gradino (omero e avambraccio <= PRIMO gradi; misurato verde 0,5-1,5 e 1,4-2,4, rosso 6,6-7,8 e 8,5-9,0) e nei
        primi 0,20 s del saluto (dove cadeva il salto del dubbio 1) l'eccesso sui vicini resta <= INGRESSO gradi; su tutto il saluto vale il
        limite del giro 256 (<= SALTI gradi; misurato verde 3,7-6,0, per un gradino del braccio sinistro a 2,62 s che questo giro non ha
        risolto: dubbio 9 del rapporto). Il metro dei salti si prova nella stessa corsa (salto provocato di 30 gradi letto >= 25), altrimenti
        «non giudicato».
   «Non giudicato» = rosso. Soglie fissate dopo la misura, mai da abbassare. Verde e rosso stampati per ultimi.
   Uso: node serata-261.mjs   (CPM_SOLO=verde|rosso · CPM_MISURE=ABC per provarne una parte: una corsa parziale NON vale come guardiano) */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const M = await import('./misura-261.mjs');
fs.mkdirSync('out/g261', { recursive: true });
const FERMO = 1.0, VMED = 15, PRO = 0.008, NUCA = 0.005, DERIVA = 0.003, PRIMO = 4, INGRESSO = 5, SALTI = 15, PROVA = 25;
const SOLO = process.env.CPM_SOLO || '', MIS = process.env.CPM_MISURE || 'ABC';
const srv = await M.startServer(), port = srv.address().port, browser = await M.launchBrowser();
async function braccio(NO) {
  const r = { A: null, B: null, C: null }, ko = { A: [], B: [], C: [] };
  if (/A/.test(MIS)) { const a = r.A = await M.misuraA(browser, port, NO, { dur: 30000 });
    if (a.errore) ko.A.push('non giudicato: ' + a.errore);
    else if (!(a.corpi.length >= 5 && a.campioni >= 30 && a.el1 - a.el0 >= 15 && a.corpi.every(c => c.vMed != null))) ko.A.push(`non giudicato: fila — corpi ${a.corpi.length}, campioni ${a.campioni}, scena ${(a.el1 - a.el0).toFixed(1)} s`);
    else { if (!(a.max <= FERMO)) ko.A.push(`un corpo della fila fermo per ${a.max} s di scena > ${FERMO}`);
      const v = Math.min(...a.corpi.map(c => c.vMed)); if (!(v >= VMED)) ko.A.push(`fila quasi ferma: velocita' mediana ${v} mm/s < ${VMED} (` + a.corpi.map(c => c.vMed).join(' · ') + ')'); } }
  if (/B/.test(MIS)) { const b = r.B = await M.misuraB(browser, port, NO);
    if (b.errori.length) ko.B.push('non giudicato: ' + b.errori.join(' · '));
    else if (!(b.n >= 15 && b.nucaEroe.length >= 3 && b.derivaMax != null)) ko.B.push(`non giudicato: spalle — campioni ${b.n}, eroe ${b.nucaEroe.length}`);
    else { if (b.sotto) ko.B.push(`spalle ARRETRATE dietro il torace (pro < ${PRO}) su ${b.sotto} campioni, minimo ${b.proMin}`);
      if (!(b.nucaMed <= NUCA)) ko.B.push(`testa davanti alle spalle (nuca ${b.nucaMed} > ${NUCA})`);
      if (!(b.derivaMax <= DERIVA)) ko.B.push(`le spalle si spostano col tempo (deriva di pro ${b.derivaMax} > ${DERIVA})`); } }
  if (/C/.test(MIS)) { const c = r.C = await M.misuraC(browser, port, NO); if (c && c.primi) c.primi = c.primi.slice(0, 4);
    if (c.errore) ko.C.push('non giudicato: ' + c.errore);
    else if (!(c.campioni >= 300 && c.primo && c.salti && c.salti.passi >= 500 && c.saltiIngresso && c.saltiIngresso.passi >= 40)) ko.C.push(`non giudicato: saluto — campioni ${c.campioni}, primo fotogramma ${c.primo ? 'visto' : 'non visto'}, passi ${c.salti && c.salti.passi}`);
    else if (!(c.prova >= PROVA)) ko.C.push(`non giudicato: il metro dei salti non vede un salto provocato di 30 gradi (letto ${c.prova})`);
    else { if (!(c.primo.omeroDx <= PRIMO && c.primo.avambraccioDx <= PRIMO)) ko.C.push(`gradino al primo fotogramma del saluto: omero destro ${c.primo.omeroDx}°, avambraccio destro ${c.primo.avambraccioDx}° > ${PRIMO}`);
      if (!(c.saltiIngresso.max <= INGRESSO)) ko.C.push(`salto nei primi 0,20 s del saluto: ${c.saltiIngresso.max}° piu' dei vicini (${c.saltiIngresso.osso} a ${c.saltiIngresso.t} s) > ${INGRESSO}`);
      if (!(c.salti.max <= SALTI)) ko.C.push(`salto a saluto in corso: ${c.salti.max}° piu' dei vicini (${c.salti.osso} a ${c.salti.t} s) > ${SALTI}`); } }
  return { misure: r, ko };
}
const V = SOLO === 'rosso' ? null : await braccio([]), R = SOLO === 'verde' ? null : await braccio(['__CPM_NO_G261']);
await browser.close(); srv.close();
const giud = x => x.length > 0 && !x.every(s => /^non giudicato/.test(s));
let ok = true; const motivi = [];
for (const k of MIS) {
  if (V && V.ko[k].length) { ok = false; motivi.push(`${k}: verde con rilievi`); }
  if (R && !giud(R.ko[k])) { ok = false; motivi.push(`${k}: il rosso __CPM_NO_G261 non cade` + (R.ko[k].length ? ' (non giudicato)' : '')); }
}
if (SOLO || MIS !== 'ABC') { ok = false; motivi.push('corsa parziale: non vale come guardiano'); }
const breve = x => x && { A: x.misure.A && { fermoMax: x.misure.A.max, vMed: (x.misure.A.corpi || []).map(c => c.vMed), campioni: x.misure.A.campioni, scena: x.misure.A.el1 != null ? +(x.misure.A.el1 - x.misure.A.el0).toFixed(1) : null },
  B: x.misure.B && { proMin: x.misure.B.proMin, proMax: x.misure.B.proMax, sotto: x.misure.B.sotto, nucaMed: x.misure.B.nucaMed, deriva: x.misure.B.derivaMax, n: x.misure.B.n },
  C: x.misure.C && { primo: x.misure.C.primo, saltiIngresso: x.misure.C.saltiIngresso, salti: x.misure.C.salti, prova: x.misure.C.prova, campioni: x.misure.C.campioni }, rilievi: [].concat(x.ko.A, x.ko.B, x.ko.C) };
fs.writeFileSync('out/g261/serata-261.json', JSON.stringify({ verde: V, rosso: R }, null, 1));
console.log('verde ' + JSON.stringify(breve(V)));
console.log('rosso (__CPM_NO_G261) ' + JSON.stringify(breve(R)));
if (!ok) { console.log('❌ serata-261 — ' + motivi.join(' · ')); process.exit(1); }
console.log('✅ serata-261 verde (e il rosso __CPM_NO_G261 cade su A, B e C)');
