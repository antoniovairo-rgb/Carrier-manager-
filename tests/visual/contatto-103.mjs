#!/usr/bin/env node
/* [giro 103] GUARDIANO «la parata del tiro del compagno avviene sul portiere» (highlight-95 D3 verde nei rigiochi finali del giro 103:
   HOWARD s12/7 «Uno-due», «para il portiere su HOWARD» col pallone a 6,0-6,9 dal portiere; 5,8-6,1 in tutte le corse precedenti, con e
   senza le altre correzioni: scena sul filo della soglia 6). In src/12 il pallone convergeva sul portiere in x a 3,2/s ma in z a 2,2/s e la
   respinta partiva a u 0,72 dovunque fosse. Ora z come x e respinta al contatto (entro 2,5) o a fine volo. Rosso __CPM_NO_G103D.
   Gioca highlight-95 (solo braccio verde, s12, seme 7, passaggi) col gioco corretto e con __CPM_NO_G103D.
     verde: 0 difetti, almeno 2 parate giudicate;   rosso: almeno un D3 «pallone mai al portiere».
   Misurato: verde HOWARD 2,6 · rosso 6,2.   Uso: node contatto-103.mjs [CPM_ARMI=verde,rosso] */
import { spawnSync } from 'node:child_process';
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const R = {};
for (const arm of ARMI) {
  const env = { ...process.env, CPM_ARMI: 'verde', CPM_SALVA: 's12', CPM_SEMI: '7', CPM_POL: 'pass', CPM_NO_SENZA: '1', CPM_PAR: '1', CPM_MISURA: '1' };
  delete env.CPM_FLAG; delete env.CPM_CPU; if (arm === 'rosso') env.CPM_FLAG = '__CPM_NO_G103D';
  const r = spawnSync(process.execPath, ['highlight-95.mjs'], { env, encoding: 'utf8', cwd: new URL('.', import.meta.url).pathname, maxBuffer: 1 << 26 });
  const out = r.stdout || ''; const m = out.match(/parate giudicate (\d+).*difetti (\d+)/); const d3 = (out.match(/^\s+· D3 .*portiere entro/gm) || []);
  R[arm] = { giud: m ? +m[1] : 0, dif: m ? +m[2] : -1, d3: d3.length };
  console.log(`${arm.toUpperCase()} parate giudicate ${R[arm].giud} · difetti ${R[arm].dif} · D3 «pallone mai al portiere» ${R[arm].d3}`); d3.slice(0, 4).forEach(x => console.log('  ' + x.trim().slice(0, 200)));
}
const g = [];
if (R.verde) { if (R.verde.giud < 2) g.push(`verde cieco: ${R.verde.giud} parate giudicate`); if (R.verde.dif !== 0) g.push(`verde: ${R.verde.dif} difetti`); }
if (R.rosso && R.rosso.d3 < 1) g.push('rosso: il difetto non si vede');
if (g.length) { console.log('✗ contatto-103 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✓ contatto-103 VERDE' + (R.rosso ? ' (e il rosso si vede)' : ''));
