#!/usr/bin/env node
/* CENSIMENTO STATICO — QUANTE INTERRUZIONI PUÒ PRODURRE UNA SCENA DELL'EROE.
   Fase 7 della roadmap. Gira in node, senza browser: legge dal sorgente le funzioni PURE che decidono
   l'esito (`decideExecution` r.11065 · `resolveDefensiveOutcome` r.11136) e la tabella SITUATIONS, e
   percorre TUTTE le coppie scena×azione. Non simula la partita: enumera cosa il motore SA produrre.

   PERCHÉ. Il numero «2,7 interruzioni a partita» (7.548) è una misura di CRONACA — conta le righe `sp`.
   Ma l'altra metà del gioco sono le scene dell'eroe, e lì un'interruzione può nascere solo come ESITO
   di un'azione fallita. Questa passata dice quali esiti di interruzione sono RAGGIUNGIBILI, da quali
   famiglie, e con che peso — perché un esito che nessuna lente può produrre non è raro: è assente.

   LA LENTE. `handleAction` (r.22708) non chiede al motore l'intento della scena: lo RIMAPPA su cinque
   lenti — cross · dribble · through/onetwo · intercept · shot — e tutto ciò che non è una di quelle
   quattro finisce nella LENTE-TIRO, che di interruzioni non ne ha nessuna.

   ⚠️ MISURA DI MODELLO, non di partita: enumera lo spazio degli esiti, non la loro frequenza a schermo
   (che dipende da quante scene escono e da quante falliscono). Dichiarato.                            */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';

const lines = fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').split('\n');
const grab = (re) => { const s = lines.findIndex(l => re.test(l)); if (s < 0) throw new Error('non trovato: ' + re); let e = -1; for (let i = s + 1; i < lines.length; i++) { if (/^\}/.test(lines[i])) { e = i; break; } } return lines.slice(s, e + 1).join('\n'); };
const code = [
  'const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));',
  grab(/^function hashStr\(s\)\{/),
  grab(/^function deriveSitCine\(sit\)\{/),
  grab(/^function hlBallState\(sit\)\{/),
  grab(/^function deriveHL\(sit,act\)\{/),
  grab(/^function decideExecution\(intent, ctx\)\{/),
  grab(/^function resolveDefensiveOutcome\(ctx\)\{/),
  'return {deriveHL,decideExecution,resolveDefensiveOutcome,hashStr};'
].join('\n');
const { deriveHL, decideExecution, resolveDefensiveOutcome, hashStr } = Function(code)();

/* le famiglie di esito che nel calcio FERMANO il gioco (r.3840-3846 · r.3856-3864) */
const FERMA = { corner: 'calcio d\'angolo', out: 'rimessa/rinvio', offside: 'fuorigioco', fouled: 'punizione', win_freekick: 'punizione', foul: 'punizione', deflected_out: 'rimessa/angolo', shielded_out: 'rimessa', overhit: 'rinvio dal fondo', wide: 'rinvio dal fondo (non recitato)' };
const S = loadSituations();
const GIRI = +(process.env.CPM_GIRI || 24);   /* seed diversi per coppia: la varianza è dichiarata */

const perLente = {}, perEsito = {}, perFamiglia = {};
let coppie = 0;
for (let gi = 0; gi < S.length; gi++) {
  const sit = S[gi];
  for (const act of (sit.actions || [])) {
    const cn = deriveHL(sit, act) || {};
    const htp = cn.type, hpp = cn.pattern;
    /* la stessa rimappatura di r.22708 — nessuna reinterpretazione */
    const di = htp === 'cross' ? 'cross' : htp === 'dribble' ? 'dribble' : htp === 'pass' ? (hpp === 'THROUGH_BALL' ? 'through' : 'onetwo') : htp === 'tackle' ? 'intercept' : 'shot';
    coppie++;
    (perLente[di] ||= { n: 0, ferma: 0 }).n++;
    (perFamiglia[htp] ||= { n: 0, lente: {} }).n++;
    perFamiglia[htp].lente[di] = (perFamiglia[htp].lente[di] || 0) + 1;
    for (let g = 0; g < GIRI; g++) {
      const seed = (hashStr(sit.text + '|' + act.label + '|' + gi + '|' + g) ^ 0x5f3759df) >>> 0;
      const o = decideExecution(di, { attrs: {}, pressure: 1 + (g % 4), fatigue: 20, morale: 60, x: (sit.startZone && sit.startZone.x) ? (sit.startZone.x[0] + sit.startZone.x[1]) / 2 : 50, weather: 'clear', foot: 'R', side: 'R', seed }).outcome;
      (perEsito[di] ||= {})[o] = ((perEsito[di] || {})[o] || 0) + 1;
      if (FERMA[o]) perLente[di].ferma++;
    }
  }
}
console.log('\n=== QUANTE INTERRUZIONI SA PRODURRE UNA SCENA DELL\'EROE ===\n');
console.log(`  coppie scena×azione: ${coppie} · ${GIRI} tiri di dado per coppia (pressione 1-4)\n`);
console.log('  LENTE          coppie   esiti che FERMANO il gioco');
for (const [k, v] of Object.entries(perLente).sort((a, b) => b[1].n - a[1].n)) {
  const pct = (v.ferma / (v.n * GIRI)) * 100;
  console.log(`  ${k.padEnd(12)} ${String(v.n).padStart(6)}   ${pct.toFixed(1)}%${pct === 0 ? '   <-- nessuna interruzione rappresentabile' : ''}`);
}
console.log('\n  DOVE VA OGNI FAMIGLIA (hlType → lente di r.22708):');
for (const [k, v] of Object.entries(perFamiglia).sort((a, b) => b[1].n - a[1].n)) console.log(`    ${k.padEnd(10)} ${String(v.n).padStart(4)}  ->  ${Object.entries(v.lente).map(([a, b]) => a + ' ' + b).join(' · ')}`);
console.log('\n  ESITI PER LENTE (su fallimento):');
for (const [k, v] of Object.entries(perEsito)) {
  const tot = Object.values(v).reduce((a, b) => a + b, 0);
  console.log(`    ${k}:  ` + Object.entries(v).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e} ${((n / tot) * 100).toFixed(0)}%${FERMA[e] ? '*' : ''}`).join(' · '));
}
console.log('\n  (* = esito che nel calcio ferma il gioco)');

/* la lente difensiva ha già throw_in e corner_conceded: quanto pesano? */
const d = {};
for (let g = 0; g < 4000; g++) {
  const r = resolveDefensiveOutcome({ success: g % 2 === 0, x: 10 + (g % 40), y: (g * 7) % 100, pressure: g % 5, attrs: {}, seed: (g * 2654435761) >>> 0 });
  d[r.kind] = (d[r.kind] || 0) + 1;
}
console.log('\n  LENTE DIFENSIVA (resolveDefensiveOutcome, r.11136) — l\'unica che sa già mandare la palla FUORI:');
console.log('    ' + Object.entries(d).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${((n / 4000) * 100).toFixed(1)}%`).join(' · '));
console.log('\nCENSIMENTO. Non è un guardiano: non fallisce, misura.');
