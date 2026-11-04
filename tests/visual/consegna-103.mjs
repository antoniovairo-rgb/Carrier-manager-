#!/usr/bin/env node
/* [giro 103] GUARDIANO «la consegna in area non fa saltare il pallone» (scena3d-96 D11 della catena 178, attribuito nella corsa finale 1:
   pc-gi18-riesce, 3,9u in 0,05 s, scrittore esito:cross_goal subito dopo ricevente-pass). Sul passaggio RACCOLTO il pallone e' a terra e
   la consegna partiva dalla quota di un cross: scalino di ~2u in un fotogramma + partenza orizzontale oltre la velocita' da pallone.
   Il percorso (ricevente-pass → esito:cross_goal) esce in circa una scena su tre (posizioni del ricevente non seminate): il guardiano
   gioca gi18 «riesce» su PC con scena3d-96 a blocchi di CPM_N scene, per braccio, finche' il braccio ha visto il percorso almeno
   CPM_MIN volte (al massimo CPM_GIRI blocchi), e lo dichiara.
     verde: in ogni ingresso nella consegna lo scalino del pallone e' sotto 3u (soglia D11) e scena3d non segna salti;
     rosso __CPM_NO_G103B: almeno un ingresso con lo scalino oltre 3u.
   Uso: node consegna-103.mjs  [CPM_ARMI=verde,rosso] [CPM_N=4] [CPM_MIN=2] [CPM_GIRI=4] */
import { spawnSync } from 'node:child_process';
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const N = +(process.env.CPM_N || 4), MIN = +(process.env.CPM_MIN || 2), GIRI = +(process.env.CPM_GIRI || 4);
const esito = {};
for (const arm of ARMI) {
  const T = { scene: 0, cg: 0, oltre: 0, max: 0, salti: 0 };
  for (let g = 0; g < GIRI && T.cg < MIN; g++) {
    const env = { ...process.env, CPM_G96_FORMATI: 'pc', CPM_G96_LISTA: Array(N).fill('18:riesce').join(','), CPM_G96_PER: String(N) };
    delete env.CPM_FLAG; if (arm === 'rosso') env.CPM_FLAG = '__CPM_NO_G103B';
    const r = spawnSync(process.execPath, ['scena3d-96.mjs'], { env, encoding: 'utf8', cwd: new URL('.', import.meta.url).pathname, maxBuffer: 1 << 26 });
    for (const l of (r.stdout || '').split('\n')) { const m = l.match(/^pc-gi18-riesce\s.*salti (\d+) consegna (\d+)\/([\d.]+)/); if (!m) continue;
      T.scene++; T.salti += +m[1]; const n = +m[2], mx = +m[3]; T.cg += n; if (n && mx > 3) T.oltre++; T.max = Math.max(T.max, mx); }
    console.log(`  ${arm} blocco ${g + 1}: scene ${T.scene} · ingressi nella consegna ${T.cg} · scalino massimo ${T.max} u · oltre 3u ${T.oltre} · salti D11 ${T.salti}`);
  }
  esito[arm] = T;
}
const g = [];
if (esito.verde) { const V = esito.verde; if (V.cg < MIN) g.push(`verde cieco: ${V.cg} ingressi nella consegna (pavimento ${MIN})`); if (V.oltre || V.salti) g.push(`verde: ${V.oltre} ingressi oltre 3u, ${V.salti} salti D11`); }
if (esito.rosso) { const R = esito.rosso; if (R.cg < 1) g.push('rosso non giudicabile: percorso mai visto'); else if (!R.oltre) g.push(`rosso: il difetto non si vede (scalino massimo ${R.max} u su ${R.cg} ingressi)`); }
if (g.length) { console.log('✗ consegna-103 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✓ consegna-103 VERDE' + (esito.rosso ? ' (e il rosso si vede)' : ''));
