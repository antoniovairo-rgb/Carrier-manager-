/* [7.999.129 PO-202 guardiano] «Partite troppo sbilanciate, non sono tirate». Decisione PO 04/10: entrambe le leve, a meta'.
   Nella partita vissuta (cfg.fin202) i tiri degli avversari valgono il 30% in piu' e quelli dei compagni dell'eroe il 15% in meno;
   la simulazione rapida non lo usa. Motore in node, 60 partite S12-like (forza 95-95, eroe OVR 93), stessi semi.
   VERDE: gol subiti almeno +12% e gol fatti dei compagni non in crescita rispetto al motore senza leva.
   ROSSO (__CPM_NO_FIN202 → cfg.fin202 assente): i due bracci coincidono. Uso: node finale-202.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length)
  .replace("forza:{home:+o.forzaH||65,away:+o.forzaA||65},", "forza:{home:+o.forzaH||65,away:+o.forzaA||65},fin202:o.fin202||null,");
if (!code.includes('fin202:o.fin202')) { console.error('❌ finale-202: ancora della simulazione non trovata'); process.exit(1); }
const sim = Function('decideExecution', 'window', code + '\nreturn simulaPartitaMotore;')(undefined, {});
const LEVA = { home: 0.85, away: 1.3 };
const braccio = (fin) => { let gf = 0, ga = 0; const N = 60; for (let s = 1; s <= N; s++) { const r = sim({ seed: s * 131, forzaH: 96, forzaA: 98, ovr: 93, stadio: s % 2 ? 'home' : 'away', fin202: fin }); gf += r.home; ga += r.away; } return { gf: +(gf / N).toFixed(3), ga: +(ga / N).toFixed(3) }; };
const senza = braccio(null), con = braccio(LEVA);
console.log(JSON.stringify({ senza, con }));
const ok = con.ga >= senza.ga * 1.12 && con.gf <= senza.gf;
console.log(ok ? '✅ finale-202 verde (la leva sposta i gol subiti e non gonfia i fatti)' : '❌ finale-202 ROSSO'); process.exit(ok ? 0 : 1);
