#!/usr/bin/env node
/* [giro 103] GUARDIANO «la parata del tiro del compagno avviene sul portiere» (highlight-95 D3 verde nei rigiochi finali del giro 103:
   HOWARD s12/7 «Uno-due», «para il portiere su HOWARD» col pallone a 6,0-6,9 dal portiere; 5,8-6,1 in tutte le corse precedenti, con e
   senza le altre correzioni: scena sul filo della soglia 6). In src/12 il pallone convergeva sul portiere in x a 3,2/s ma in z a 2,2/s e la
   respinta partiva a u 0,72 dovunque fosse. Ora z come x e respinta al contatto (entro 2,5) o a fine volo. Rosso __CPM_NO_G103D.
   Gioca highlight-95 (solo braccio verde, s12, seme 7, passaggi) col gioco corretto e con __CPM_NO_G103D.
     verde: 0 difetti, almeno 2 parate giudicate;   rosso: almeno un D3 «pallone mai al portiere».
   Misurato: verde HOWARD 2,6 · rosso 6,2.   Uso: node contatto-103.mjs [CPM_ARMI=verde,rosso] [CPM_G138PARATA=0]
   [giro 138 PO-319] PARATE PROVOCATE: con la sola partita naturale (s12, seme 7) le parate giudicate erano 2 per braccio, cioe' il
   pavimento — margine zero, e alla verifica 182 il rosso «non si vedeva» al primo giro. Ora highlight-95 gira con CPM_G138PARATA=1:
   la sonda avvolge giocaScena del motore e ogni passaggio arrivato diventa un tiro del compagno PARATO (il resto lo fa il gioco).
   Soglie invariate (verde 0 difetti e almeno 2 parate giudicate; rosso almeno un D3); in piu' il rosso deve aver giudicato almeno 2
   parate, altrimenti e' «non giudicato» (= rosso). Braccio e motivo per ultimi. */
import { spawnSync } from 'node:child_process';
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const R = {};
for (const arm of ARMI) {
  const env = { ...process.env, CPM_ARMI: 'verde', CPM_SALVA: 's12', CPM_SEMI: process.env.CPM_CT_SEMI || '7', CPM_POL: 'pass', CPM_NO_SENZA: '1', CPM_PAR: process.env.CPM_CT_PAR || '1', CPM_MISURA: '1' };
  delete env.CPM_FLAG; delete env.CPM_CPU;
  /* [giro 145 PO-319] GANCIO DI PROVA DEL GIOCO __CPM_G145GEO (solo ?cpmtest=1, src/12): nelle parate del compagno il portiere sta di
     lato al pallone per tutto il volo e si tuffa sul posto — la geometria in cui D3 di __CPM_NO_G103D si vede. Acceso in ENTRAMBI i
     bracci (stessa geometria, cambia solo il rimedio). CPM_G145GEO=0 lo spegne, CPM_G145GEO=<n> cambia lo scarto (default 20). */
  const geo = process.env.CPM_G145GEO === '0' ? [] : ['__CPM_G145GEO'];
  env.CPM_FLAG = (arm === 'rosso' ? ['__CPM_NO_G103D'] : []).concat(geo).join(',');
  if (geo.length && process.env.CPM_G145GEO && +process.env.CPM_G145GEO > 1) env.CPM_G145GEO_N = process.env.CPM_G145GEO;
  if (process.env.CPM_G138PARATA !== '0') env.CPM_G138PARATA = '1'; else delete env.CPM_G138PARATA;
  env.CPM_D3DIAG = '1'; env.CPM_D3SOGLIA = '0';/* [giro 138] la distanza minima pallone-portiere di OGNI parata giudicata: il margine dalla soglia 6 si vede */
  const r = spawnSync(process.execPath, ['highlight-95.mjs'], { env, encoding: 'utf8', cwd: new URL('.', import.meta.url).pathname, maxBuffer: 1 << 26 });
  const out = r.stdout || ''; const m = out.match(/parate giudicate (\d+).*difetti (\d+)/); const d3 = (out.match(/^\s+· D3 .*portiere entro/gm) || []);
  const g138 = (out.match(/\[g138\][^\n]*|\[g145\][^\n]*/g) || []).map(x => x.replace(/^\[g1(38|45)\]\s*/, ''));
  const gb = (out.match(/^D3DIAG .*minGB=([\d.]+)/gm) || []).map(x => +x.match(/minGB=([\d.]+)/)[1]).sort((a, b) => a - b);
  R[arm] = { giud: m ? +m[1] : 0, dif: m ? +m[2] : -1, d3: d3.length, uscita: r.status, g138, gb };
  console.log(`${arm.toUpperCase()} parate giudicate ${R[arm].giud} · difetti ${R[arm].dif} · D3 «pallone mai al portiere» ${R[arm].d3}${g138.length ? ' · ' + g138.join(' ; ') : ''} · distanza minima pallone-portiere per parata [${gb.join(', ')}] (difetto > 6)`); d3.slice(0, 4).forEach(x => console.log('  ' + x.trim().slice(0, 200)));
}
const g = [];
if (R.verde) { if (R.verde.giud < 2) g.push(`verde cieco: ${R.verde.giud} parate giudicate`); if (R.verde.dif !== 0) g.push(`verde: ${R.verde.dif} difetti`); }
if (R.rosso && R.rosso.giud < 2) g.push(`rosso non giudicato: ${R.rosso.giud} parate giudicate`);
else if (R.rosso && R.rosso.d3 < 1) g.push('rosso: il difetto non si vede');
const braccio = ARMI.join('+'), parz = !(R.verde && R.rosso);
if (g.length || parz) { console.log('✗ contatto-103 ROSSO'); g.forEach(x => console.log('  · ' + x)); console.log(`BRACCIO ${braccio} · MOTIVO ${g.length ? g.join(' · ') : 'corsa parziale: non vale come verdetto'}`); process.exit(1); }
console.log(`✓ contatto-103 VERDE (e il rosso si vede: ${R.rosso.d3} D3 su ${R.rosso.giud} parate; verde ${R.verde.giud} parate, 0 difetti)`);
console.log(`BRACCIO ${braccio} · MOTIVO nessuno`);
