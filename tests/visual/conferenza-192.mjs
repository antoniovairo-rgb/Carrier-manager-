#!/usr/bin/env node
/* [7.999.113 guardiano — collaudo PO-192 «è una partita Primavera, ma quale bolgia?»]
   La conferenza pre-partita pescava a caso fra tutte le domande prematch: «quasi un derby… sara' una bolgia» usciva senza derby e
   nelle giovanili. Il guardiano legge dal SORGENTE le domande (INTERVIEW_QS) e il filtro vero di src/18 e lo applica a quattro casi.
   VERDE → la domanda del derby e' nel mazzo SOLO con derby e professionista. ROSSO (__CPM_NO_DERBY192) → e' nel mazzo in tutti e quattro. */
import fs from 'fs';
const S7 = fs.readFileSync(new URL('../../src/07-versione-save-interviste.jsx', import.meta.url), 'utf8');
const S18 = fs.readFileSync(new URL('../../src/18-career-app.jsx', import.meta.url), 'utf8');
const a = S7.indexOf('const INTERVIEW_QS=['), b = S7.indexOf('\n];', a);
const corpo = S7.slice(a + 'const INTERVIEW_QS='.length, b + 3).replace(/;$/, '');
const nomi = [...new Set([...corpo.matchAll(/cond:([A-Za-z_$][\w$]*)/g)].map(x => x[1]))];/* le condizioni nominate stanno in altri file: qui basta che esistano */
const QS = new Function(...nomi, 'return ' + corpo)(...nomi.map(() => () => false));
const m = S18.match(/const _no192=([^;]+);\s*const _pool=INTERVIEW_QS\.filter\((q=>.+?)\);\n/);
if (!m) { console.log('❌ conferenza-192: filtro non trovato in src/18'); process.exit(1); }
const pool = (rosso, player, derby) => { const window = rosso ? { __CPM_NO_DERBY192: 1 } : {};
  const _no192 = new Function('window', 'return ' + m[1])(window);
  return QS.filter(new Function('_no192', 'player', 'derby', 'return ' + m[2])(_no192, player, derby)); };
const DERBY = q => /quasi un derby/.test(q.q);
const casi = [['Primavera, nessun derby', { proStatus: 'u18', isU18: true }, null], ['Primavera, derby', { proStatus: 'u18', isU18: true }, { name: 'D' }],
  ['pro, nessun derby', { proStatus: 'pro' }, null], ['pro, derby', { proStatus: 'pro' }, { name: 'D' }]];
let ok = true;
for (const [nome, pl, d] of casi) { const v = pool(false, pl, d), r = pool(true, pl, d); const vd = v.some(DERBY), rd = r.some(DERBY), atteso = nome === 'pro, derby';
  console.log(`${nome}: verde ${v.length} domande, derby ${vd ? 'sì' : 'no'} · rosso ${r.length}, derby ${rd ? 'sì' : 'no'}`);
  if (vd !== atteso || !rd || v.length < 7) ok = false; }
console.log(ok ? '✅ conferenza-192 verde (e il rosso si vede)' : '❌ conferenza-192 ROSSO'); process.exit(ok ? 0 : 1);
