#!/usr/bin/env node
/* [7.213.0 revisione PO «sembra sempre un pallonetto» — 25 verdetti su 86] GUARDIANO DELL'APICE DEL TIRO.
   La parabola del pallone è `y = 0.65 + sin(u·π)·ballArcH` → **ballArcH è l'apice in METRI**. La traversa sta a
   2.44 m: un tiro di potenza con apice 4.8 passava al doppio dell'altezza della porta a metà volo, e ogni
   conclusione — tiro, testa, punizione, rigore — leggeva come un pallonetto. Il difetto era invisibile al gate
   (l'arco non è nella firma golden) e alla suite analitica (che sorvegliava solo il tetto assurdo, 14 m).
   Questa probe legge i valori REALI dal sorgente (nessuna copia del modello) e li confronta con la geometria
   della porta: le conclusioni tese devono stare sotto un tetto calcistico, e SOLO cucchiaio e pallonetto devono
   scavalcare il portiere — restando riconoscibili come tali. Statico, nessun browser. */
import fs from 'fs';

const SRC = new URL('../../CARRIER-MANAGER-AV.html', import.meta.url);
const src = fs.readFileSync(SRC, 'utf8');
const L = src.split('\n');
const issues = [];

/* geometria REALE della porta, letta dal sorgente (mai cablata qui) */
const gm = src.match(/const _GW=([\d.]+),_GH=([\d.]+)/);
if (!gm) { console.log('❌ FAIL — geometria porta (_GW/_GH) non trovata nel sorgente'); process.exit(1); }
const CROSSBAR = parseFloat(gm[2]);
const GK_REACH = CROSSBAR + 0.35;        // allungo del portiere in tuffo/uscita alta

/* la parabola è la sorgente di verità dell'unità di misura: se cambia, questa probe non è più valida */
if (!/ball\.position\.y=0\.65\+Math\.sin\(u\*Math\.PI\)\*ballArcH/.test(src))
  issues.push('la formula della parabola è cambiata: `ballArcH` potrebbe non essere più un apice in metri — rivedere questa probe');

/* estrazione dei literal per-variante direttamente dal blocco d'arco */
const rz = L.findIndex(l => /const _rz=\(Math\.random\(\)-\.5\)/.test(l));
if (rz < 0) { console.log('❌ FAIL — blocco d\'arco non trovato'); process.exit(1); }
const block = L.slice(rz, rz + 96).join('\n');
const apexOf = (key) => {
  const m = block.match(new RegExp(key + '=([\\d.]+)'));
  return m ? parseFloat(m[1]) : null;
};
/* famiglia → { apice, tetto ammesso, deve scavalcare il portiere? } */
const FAM = [
  ['rigore',              '\\}else\\{ballArcH',                 2.6, false],
  ['rigore a cucchiaio',  'penalty_panenka"\\)\\{ballArcH',    null, true],
  ['tiro a pallonetto',   'shot_chip"\\)\\{ballArcH',          null, true],
  ['volée',               'shot_volley"\\)\\{ballArcH',         3.0, false],
  ['tiro a giro',         'shot_curled"\\)\\{ballArcH',         3.0, false],
  ['tiro di prima',       'shot_first_time"\\)\\{ballArcH',     2.6, false],
  ['tiro in 1 contro 1',  'shot_one_on_one"\\)\\{ballArcH',     2.2, false],
  ['colpo di testa in tuffo', 'header_diving"\\)\\{ballArcH',   2.2, false],
  ['colpo di testa al secondo palo', 'header_far_post"\\)\\{ballArcH', 2.8, false],
  ['punizione',           't==="freekick"\\)\\{ballArcH',       3.0, false],
];
const got = {};
for (const [nome, key, cap, mustLob] of FAM) {
  const h = apexOf(key);
  got[nome] = h;
  if (h == null) { issues.push(`${nome}: apice non estratto dal sorgente (il blocco d'arco è cambiato)`); continue; }
  const peak = 0.65 + h;
  if (cap != null && h > cap)
    issues.push(`${nome}: apice ${h} m (il pallone tocca ${peak.toFixed(2)} m contro una traversa di ${CROSSBAR} m) — legge come un pallonetto, tetto ${cap} m`);
  if (mustLob && peak < GK_REACH + 0.6)
    issues.push(`${nome}: apice ${h} m — non scavalca il portiere (allungo ${GK_REACH.toFixed(2)} m), il pallonetto non si riconosce`);
}
/* relazioni: il pallonetto deve staccarsi nettamente dalla conclusione tesa della stessa famiglia */
const power = apexOf('\\n\\s*else\\{ballArcH');
if (power != null) {
  got['tiro di potenza'] = power;
  if (power > 2.6) issues.push(`tiro di potenza: apice ${power} m — una conclusione tesa non può superare ${(0.65 + 2.6).toFixed(2)} m a metà volo`);
  if (got['tiro a pallonetto'] != null && got['tiro a pallonetto'] < power * 2)
    issues.push(`il pallonetto (${got['tiro a pallonetto']} m) non si distingue dal tiro di potenza (${power} m)`);
}
if (got['rigore a cucchiaio'] != null && got['rigore'] != null && got['rigore a cucchiaio'] < got['rigore'] * 1.6)
  issues.push(`il cucchiaio (${got['rigore a cucchiaio']} m) non si distingue dal rigore normale (${got['rigore']} m)`);

console.log(`traversa ${CROSSBAR} m · allungo del portiere ~${GK_REACH.toFixed(2)} m`);
for (const [k, v] of Object.entries(got))
  console.log(`  ${k.padEnd(30)} apice ${v == null ? '—' : (0.65 + v).toFixed(2) + ' m'}${v != null && 0.65 + v > GK_REACH ? '  (scavalca il portiere)' : ''}`);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n')
  : '✅ APICI CALCISTICI (le conclusioni tese restano sotto la traversa alta; solo cucchiaio e pallonetto scavalcano il portiere)');
process.exit(issues.length ? 1 : 0);
