#!/usr/bin/env node
/* [giro 103] GUARDIANO «la consegna in area non fa saltare il pallone» (scena3d-96 D11 della catena 178, attribuito nella corsa finale 1:
   pc-gi18-riesce, 3,9u in 0,05 s, scrittore esito:cross_goal subito dopo ricevente-pass). Sul passaggio RACCOLTO il pallone e' a terra e
   la consegna partiva dalla quota di un cross: scalino di ~2u in un fotogramma + partenza orizzontale oltre la velocita' da pallone.
   Il percorso (ricevente-pass → esito:cross_goal) esce in circa una scena su tre (posizioni del ricevente non seminate): il guardiano
   gioca gi18 «riesce» su PC e telefono con scena3d-96 a blocchi di CPM_N scene, per braccio, finche' il braccio ha visto il percorso almeno
   CPM_MIN volte (al massimo CPM_GIRI blocchi), e lo dichiara.
     verde: in ogni ingresso nella consegna lo scalino del pallone e' sotto 3u (soglia D11) e scena3d non segna salti;
     rosso __CPM_NO_G103B: almeno un ingresso con lo scalino oltre 3u.
   Uso: node consegna-103.mjs  [CPM_ARMI=verde,rosso] [CPM_N=4] [CPM_MIN=2] [CPM_GIRI=8] */
import { spawnSync } from 'node:child_process';
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const N = +(process.env.CPM_N || 4), MIN = +(process.env.CPM_MIN || 2), GIRI = +(process.env.CPM_GIRI || 8);
const esito = {};
/* [giro 387] regola d'arresto dei blocchi, pura (provata da --autoprova sui numeri veri del treno) */
export function fermaBlocchi(arm, T, min, vecchia = !!process.env.CPM_NO_G387) {
  const difetto = !!(T.oltre || T.soOltre || T.salti);
  if (arm !== 'rosso') return T.cg >= min;
  return vecchia ? difetto : (T.cg >= 1 && difetto);
}
if (process.argv.includes('--autoprova')) {
  /* numeri del treno: notte 26/11 (rosso) e push 26/11 00:28 (verde), stesso commit 8543a9cc */
  const notte = { cg: 0, oltre: 0, soOltre: 0, salti: 4 }, push = { cg: 2, oltre: 2, soOltre: 0, salti: 3 };
  const casi = [[fermaBlocchi('rosso', notte, MIN, false), false, 'nuova regola, notte: continua'], [fermaBlocchi('rosso', notte, MIN, true), true, 'regola di prima, notte: si ferma (e il giudizio dice «non giudicabile»)'],
    [fermaBlocchi('rosso', push, MIN, false), true, 'nuova regola, push: si ferma'], [fermaBlocchi('verde', { cg: 1 }, MIN, false), false, 'verde con 1 ingresso: continua'], [fermaBlocchi('verde', { cg: MIN }, MIN, false), true, 'verde al pavimento: si ferma']];
  let ko = 0; for (const [v, a, n] of casi) { console.log(`${v === a ? 'ok' : 'NO'}  ${n}`); if (v !== a) ko++; }
  process.exit(ko ? 1 : 0);
}
for (const arm of ARMI) {
  const T = { scene: 0, cg: 0, oltre: 0, max: 0, salti: 0 };
  /* [giro 293] RIPETIZIONE DICHIARATA, soglie invariate (scalino 3u, pavimento MIN ingressi). Misurato in questo giro: il percorso esce in 3 scene
     su 24 (non una su tre), quindi con 4 blocchi il verde restava «cieco» (meno di MIN ingressi) circa una corsa su tredici e il rosso poteva
     fermarsi a MIN ingressi senza aver ancora visto lo scalino. Ora: fino a 8 blocchi; il verde si ferma a MIN ingressi come prima; il rosso
     continua finche' il difetto si vede (un ingresso oltre 3u, una sospensione oltre 3u o un salto D11). */
  /* [giro 387] il ciclo del rosso si fermava appena vedeva un salto D11, anche senza aver mai visto il percorso, mentre il giudizio qui sotto
     pretende almeno un ingresso nella consegna: treno grande del 26/11 (corsa 45735203524), «rosso blocco 1: ingressi 0 · salti D11 4» →
     «rosso non giudicabile», sullo stesso commit (8543a9cc) che al push aveva dato «rosso blocco 1: ingressi 2 · oltre 3u 2». Ora il rosso si
     ferma solo quando il giudizio lo puo' giudicare: percorso visto E difetto visto. Soglie e giudizio invariati. CPM_NO_G387=1 = regola di prima. */
  const visto = () => fermaBlocchi(arm, T, MIN);
  for (let g = 0; g < GIRI && !visto(); g++) {
    const env = { ...process.env, CPM_G96_FORMATI: 'pc,tel',/* la sospensione sull'incornata (ricevente-cross) si vede sul telefono */ CPM_G96_LISTA: Array(N).fill('18:riesce').join(','), CPM_G96_PER: String(N) };
    delete env.CPM_FLAG; if (arm === 'rosso') env.CPM_FLAG = '__CPM_NO_G103B';
    const r = spawnSync(process.execPath, ['scena3d-96.mjs'], { env, encoding: 'utf8', cwd: new URL('.', import.meta.url).pathname, maxBuffer: 1 << 26 });
    for (const l of (r.stdout || '').split('\n')) { const m = l.match(/^(?:pc|tel)-gi18-riesce\s.*salti (\d+) consegna (\d+)\/([\d.]+) sospensione (\d+)\/([\d.]+)/); if (!m) continue;
      T.scene++; T.salti += +m[1]; const n = +m[2], mx = +m[3]; T.cg += n; if (n && mx > 3) T.oltre++; T.max = Math.max(T.max, mx);
      const sn = +m[4], smx = +m[5]; T.so = (T.so | 0) + sn; if (sn && smx > 3) T.soOltre = (T.soOltre | 0) + 1; T.soMax = Math.max(T.soMax || 0, smx); }
    for (const l of (r.stdout || '').split('\n')) { const m = l.match(/^((?:pc|tel)-gi18-riesce)\s+✗ D11[^(]*\(([^)]*\))/); if (m) console.log(`    ${arm} ${m[1]} D11: ${m[2].slice(0, 160)}`); }
    console.log(`  ${arm} blocco ${g + 1}: scene ${T.scene} · ingressi nella consegna ${T.cg} · scalino massimo ${T.max} u · oltre 3u ${T.oltre} · sospensione ${T.so | 0} fotogrammi, passo massimo ${T.soMax || 0} u, oltre 3u ${T.soOltre | 0} · salti D11 ${T.salti}`);
  }
  esito[arm] = T;
}
const g = [];
if (esito.verde) { const V = esito.verde; if (V.cg < MIN) g.push(`verde cieco: ${V.cg} ingressi nella consegna (pavimento ${MIN})`); if (V.oltre || V.soOltre || V.salti) g.push(`verde: ${V.oltre} ingressi oltre 3u, ${V.soOltre | 0} sospensioni oltre 3u, ${V.salti} salti D11`); }
if (esito.rosso) { const R = esito.rosso; if (R.cg < 1) g.push('rosso non giudicabile: percorso mai visto'); else if (!R.oltre && !R.soOltre && !R.salti) g.push(`rosso: il difetto non si vede (scalino massimo ${R.max} u su ${R.cg} ingressi, sospensione ${R.soMax || 0} u)`); }
if (g.length) { console.log('✗ consegna-103 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✓ consegna-103 VERDE' + (esito.rosso ? ' (e il rosso si vede)' : ''));
