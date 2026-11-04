#!/usr/bin/env node
/* [giro 103] GUARDIANO «a fotogrammi lentissimi l'esito non arriva prima del 3D» (highlight-95 D3, corse finali del giro 103: ROTH s5/2021
   «Uno-due» minimo portiere-pallone 47,0 e 33,6 con la catena carica). Riprodotto in modo deterministico rallentando la CPU di Chromium
   (CDP, CPM_CPU=6): dopo 2,6 s di parete il renderer non ha ancora cominciato la conclusione, la riserva legge «non occupata» come
   «finita» e rivela l'esito col pallone ai piedi dell'eroe. Correzione in src/15 (rosso __CPM_NO_G103A): la riserva aspetta anche i suoi
   2,6 s di scena e, sulle scene col tiro del compagno, che la conclusione sia almeno cominciata; la chiusura idem.
   Gioca highlight-95 (solo braccio verde, salvataggio s5, seme 2021, passaggi) due volte: col gioco corretto e con __CPM_NO_G103A.
     verde: 0 difetti e almeno 2 parate giudicate;   rosso: almeno un D3 sulle parate.
   Uso: node lento-103.mjs  [CPM_CPU=6] [CPM_ARMI=verde,rosso] */
import { spawnSync } from 'node:child_process';
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const R = {};
for (const arm of ARMI) {
  const env = { ...process.env, CPM_CPU: process.env.CPM_CPU || '6', CPM_ARMI: 'verde', CPM_SALVA: 's5', CPM_SEMI: '2021', CPM_POL: 'pass', CPM_NO_SENZA: '1', CPM_PAR: '1', CPM_MISURA: '1' };
  delete env.CPM_FLAG; if (arm === 'rosso') env.CPM_FLAG = '__CPM_NO_G103A';
  const r = spawnSync(process.execPath, ['highlight-95.mjs'], { env, encoding: 'utf8', cwd: new URL('.', import.meta.url).pathname, maxBuffer: 1 << 26 });
  const out = r.stdout || ''; const m = out.match(/parate giudicate (\d+).*difetti (\d+)/); const d3 = (out.match(/^\s+· D3 .*portiere entro/gm) || []);
  R[arm] = { giud: m ? +m[1] : 0, dif: m ? +m[2] : -1, d3: d3.length, righe: d3 };
  console.log(`${arm.toUpperCase()} parate giudicate ${R[arm].giud} · difetti ${R[arm].dif} · D3 «pallone mai al portiere» ${R[arm].d3}`); d3.slice(0, 4).forEach(x => console.log('  ' + x.trim().slice(0, 200)));
}
const g = [];
if (R.verde) { if (R.verde.giud < 2) g.push(`verde cieco: ${R.verde.giud} parate giudicate`); if (R.verde.dif !== 0) g.push(`verde: ${R.verde.dif} difetti`); }
if (R.rosso && R.rosso.d3 < 1) g.push('rosso: il difetto non si vede');
if (g.length) { console.log('✗ lento-103 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✓ lento-103 VERDE' + (R.rosso ? ' (e il rosso si vede)' : ''));
