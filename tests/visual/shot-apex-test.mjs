#!/usr/bin/env node
/* [7.213.0 «sembra sempre un pallonetto» · 7.215.0 «la parata non è nitida»] GUARDIANO DELLA TRAIETTORIA VERTICALE.
   La parabola del pallone è `y = 0.65 + sin(u·π)·ballArcH + (y0−0.65)(1−u) + (ballArcTgtY−0.65)·u`:
   `ballArcH` è il RIGONFIAMENTO sopra la corda (in metri) e `ballArcTgtY` è la quota di ARRIVO. La traversa
   (`_GH`) sta a 2.44 m — due difetti storici che nessun controllo vedeva (l'arco non è nella firma golden):
     1. gli apici erano il doppio della traversa → ogni conclusione leggeva come un pallonetto;
     2. la quota d'arrivo era SEMPRE 0.65 → l'angolo alto non esisteva, ogni tiro moriva sulla linea rasoterra
        e il portiere non aveva nulla da parare in alto.
   La probe NON copia il modello: estrae il blocco d'arco dal sorgente e lo ESEGUE, come fa la suite analitica,
   così misura ciò che il gioco fa davvero. Statico, nessun browser. */
import fs from 'fs';

const SRC = new URL('../../CARRIER-MANAGER-AV.html', import.meta.url);
const src = fs.readFileSync(SRC, 'utf8');
const L = src.split('\n');
const issues = [];

const gm = src.match(/const _GW=([\d.]+),_GH=([\d.]+)/);
if (!gm) { console.log('❌ FAIL — geometria porta (_GW/_GH) non trovata nel sorgente'); process.exit(1); }
const CROSSBAR = parseFloat(gm[2]);
const GK_REACH = CROSSBAR + 0.35;

if (!/ball\.position\.y=0\.65\+Math\.sin\(u\*Math\.PI\)\*ballArcH\+\(ballArcY0-0\.65\)\*\(1-u\)\+\(ballArcTgtY-0\.65\)\*u/.test(src))
  issues.push('la formula della parabola è cambiata — questa probe non misura più ciò che il gioco disegna');

/* ── esecuzione del blocco d'arco REALE (stesso pattern della suite analitica) ── */
const rz = L.findIndex(l => /const _rz=\(Math\.random\(\)-\.5\)/.test(l));
let arcEnd = -1;
for (let i = rz; i < rz + 140; i++) if (/ARC_BLOCK_END/.test(L[i])) { for (let j = i; j < i + 30; j++) if (/^\s*\}\s*$/.test(L[j])) { arcEnd = j; break; } break; }
if (rz < 0 || arcEnd < 0) { console.log('❌ FAIL — blocco d\'arco non estraibile dal sorgente'); process.exit(1); }
const arcBlock = L.slice(rz, arcEnd + 1).join('\n');
const runArc = (t, variant, q) => {
  const fn = `(function(t,P,AWAY_GOAL_X,RND){
    var ballArcH=0,ballArcDur=0,ballArcTgtX=0,ballArcTgtZ=0,ballArcT=0,ballArcActive=false,ballArcTgtY=0.65;
    var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
    (function(Math){
${arcBlock}
    })(Object.assign(Object.create(globalThis.Math),{random:RND}));
    return {ballArcH,ballArcDur,ballArcTgtY};
  })`;
  return (0, eval)(fn)(t, { hlVariant: variant, playerY: 50, playerX: 84, hlQuality: q }, 46, () => 0.5);
};
/* apice REALE della traiettoria (partenza a terra), non il solo rigonfiamento */
const peakOf = (h, y1) => { let m = 0; for (let u = 0; u <= 1.0001; u += 0.01) m = Math.max(m, 0.65 + Math.sin(u * Math.PI) * h + (y1 - 0.65) * u); return m; };

/* famiglia → [tipo, variante, tetto dell'apice, deve scavalcare il portiere?] */
const FAM = [
  ['rigore',                      'penalty', null,                2.9,  false],
  ['rigore a cucchiaio',          'penalty', 'penalty_panenka',   null, true],
  ['tiro a pallonetto',           'shot',    'shot_chip',         null, true],
  ['tiro di potenza',             'shot',    'shot_power',        3.1,  false],
  ['volée',                       'shot',    'shot_volley',       3.4,  false],
  ['tiro a giro',                 'shot',    'shot_curled',       3.6,  false],
  ['tiro di prima',               'shot',    'shot_first_time',   3.0,  false],
  ['tiro in 1 contro 1',          'shot',    'shot_one_on_one',   2.4,  false],
  ['colpo di testa in tuffo',     'header',  'header_diving',     2.3,  false],
  ['colpo di testa (primo palo)', 'header',  'header_near_post',  3.0,  false],
  ['colpo di testa (secondo palo)','header', 'header_far_post',   3.2,  false],
  ['punizione',                   'freekick', null,               3.6,  false],
  ['cross al primo palo',         'cross',   'cross_near_post',   null, false],
  ['cross al secondo palo',       'cross',   'cross_far_post',    null, false],
  ['cross teso',                  'cross',   'cross_low_driven',  null, false],
  ['cross a rientrare',           'cross',   'cross_cutback',     null, false],
];
const CONCL = new Set(['shot', 'header', 'freekick', 'penalty']);
const got = {};
console.log(`traversa ${CROSSBAR} m · allungo del portiere ~${GK_REACH.toFixed(2)} m`);
for (const [nome, t, variant, cap, mustLob] of FAM) {
  const lo = runArc(t, variant, 0.15), hi = runArc(t, variant, 0.95);
  const pk = Math.max(peakOf(lo.ballArcH, lo.ballArcTgtY), peakOf(hi.ballArcH, hi.ballArcTgtY));
  got[nome] = { pk, yLo: lo.ballArcTgtY, yHi: hi.ballArcTgtY };
  console.log(`  ${nome.padEnd(31)} apice ${pk.toFixed(2)} m · arrivo ${lo.ballArcTgtY.toFixed(2)}→${hi.ballArcTgtY.toFixed(2)} m`);
  if (cap != null && pk > cap) issues.push(`${nome}: apice ${pk.toFixed(2)} m contro una traversa di ${CROSSBAR} m — legge come un pallonetto (tetto ${cap} m)`);
  if (mustLob && pk < GK_REACH + 0.6) issues.push(`${nome}: apice ${pk.toFixed(2)} m — non scavalca il portiere, il pallonetto non si riconosce`);
  /* una CONCLUSIONE deve arrivare dentro lo specchio: sopra la traversa non sarebbe un gol */
  if (CONCL.has(t) && Math.max(lo.ballArcTgtY, hi.ballArcTgtY) > CROSSBAR - 0.15)
    issues.push(`${nome}: arriva a ${Math.max(lo.ballArcTgtY, hi.ballArcTgtY).toFixed(2)} m, sopra la traversa (${CROSSBAR} m)`);
}
/* il pallonetto deve staccarsi dalla conclusione tesa della stessa famiglia */
if (got['tiro a pallonetto'].pk < got['tiro di potenza'].pk * 1.7)
  issues.push(`il pallonetto (${got['tiro a pallonetto'].pk.toFixed(2)} m) non si distingue dal tiro di potenza (${got['tiro di potenza'].pk.toFixed(2)} m)`);
if (got['rigore a cucchiaio'].pk < got['rigore'].pk * 1.4)
  issues.push(`il cucchiaio (${got['rigore a cucchiaio'].pk.toFixed(2)} m) non si distingue dal rigore normale (${got['rigore'].pk.toFixed(2)} m)`);
/* [7.215.0] l'ANGOLO ALTO deve esistere: almeno una conclusione ben calciata arriva sopra il metro e mezzo */
const topCorner = Object.entries(got).filter(([n]) => /tiro|punizione|rigore/.test(n)).some(([, v]) => v.yHi >= 1.5);
if (!topCorner) issues.push('nessuna conclusione arriva in alto: l\'angolo alto non esiste e il portiere non ha nulla da parare sopra la vita');
/* un CROSS alto deve consegnare all'altezza della testa, altrimenti lo stacco non può essere sincronizzato */
for (const n of ['cross al primo palo', 'cross al secondo palo'])
  if (got[n].yLo < 1.5) issues.push(`${n}: consegna a ${got[n].yLo.toFixed(2)} m — troppo basso perché un compagno ci stacchi di testa`);
for (const n of ['cross teso', 'cross a rientrare'])
  if (got[n].yLo > 1.1) issues.push(`${n}: arriva a ${got[n].yLo.toFixed(2)} m — un cross basso deve restare raso`);

console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n')
  : '✅ TRAIETTORIA VERTICALE CALCISTICA (apici sotto controllo, angolo alto esistente, cross alti all\'altezza della testa)');
process.exit(issues.length ? 1 : 0);
