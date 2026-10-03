/* [7.999.121 PO-190 «goleade»] GUARDIANO: quanti rigori assegna il motore. Prima ogni fallo subito in area era rigore (banco: 0,53 a
   squadra per partita, 4 volte il vero); Premier League 2023/24: 0,29 a partita in totale (The Analyst), cioe' ~0,15 a squadra.
   Verde: rigori a squadra <= 0,22. Rosso (__CPM_NO_RIG190): il difetto si deve vedere (>= 0,35). Usa il banco tabellino-vero. */
import { execFileSync } from 'node:child_process';
const run = (rosso) => { const out = execFileSync('node', ['tabellino-vero.mjs'], { env: { ...process.env, CPM_PARTITE: '60', CPM_ROSSO: rosso || '' }, encoding: 'utf8', maxBuffer: 1 << 24 });
  const m = out.match(/^\s*rigori\s+([\d.]+)/m); if (!m) throw new Error('riga «rigori» assente nel banco'); return +m[1]; };
const verde = run(''), rosso = run('__CPM_NO_RIG190');
console.log(JSON.stringify({ verde, rosso }));
if (!(verde <= 0.22)) { console.error(`❌ rigori-190: ${verde} rigori a squadra per partita (tetto 0,22)`); process.exit(1); }
if (!(rosso >= 0.35)) { console.error(`❌ rigori-190: il rosso non si vede (${rosso})`); process.exit(1); }
console.log('✅ rigori-190 verde (e il rosso si vede)');
