/* [7.999.130 PO-202 guardiano, decisione PO 04/10 «alzare il tetto a 99»] Il motore tagliava la forza delle squadre a 95: i club fra
   95 e 99 erano identici in campo. Motore in node, 20 semi: VERDE (tetto 99) 96-98 e 98-96 danno partite diverse almeno una volta;
   ROSSO (__CPM_NO_TETTO202, tetto 95) le danno identiche su tutti i semi. Uso: node tetto-202.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const mk = (W) => Function('decideExecution', 'window', code + '\nreturn simulaPartitaMotore;')(undefined, W);
const diverse = (W) => { const sim = mk(W); let d = 0; for (let s = 1; s <= 20; s++) { const a = sim({ seed: s * 131, forzaH: 96, forzaA: 98, ovr: 93 }), b = sim({ seed: s * 131, forzaH: 98, forzaA: 96, ovr: 93 }); if (JSON.stringify(a.tab) !== JSON.stringify(b.tab)) d++; } return d; };
const verde = diverse({}), rosso = diverse({ __CPM_NO_TETTO202: true });
console.log(JSON.stringify({ verde, rosso }));
const ok = verde >= 1 && rosso === 0;
console.log(ok ? '✅ tetto-202 verde (e il rosso si vede)' : '❌ tetto-202 ROSSO'); process.exit(ok ? 0 : 1);
