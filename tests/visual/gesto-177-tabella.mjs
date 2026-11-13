#!/usr/bin/env node
/* [giro 177 PO-367] TABELLA prima/dopo dai file grezzi del banco 170b (gesti-170b.mjs → out/giro170b/raw/*.json), con le definizioni del
   giro 177 (lib/gesto-177.mjs). Nessun browser. Strumento, non guardiano.
   Uso: node gesto-177-tabella.mjs <cartella-prima> <cartella-dopo> [--md]   → mediana (minimo…massimo) per gesto e per grandezza
        node gesto-177-tabella.mjs <cartella> --righe                       → una riga per esecuzione */
import fs from 'node:fs';
import path from 'node:path';
import { misura177, riassunto177, fmt } from './lib/gesto-177.mjs';
const leggi = dir => { const per = {}; for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) { const R = JSON.parse(fs.readFileSync(path.join(dir, f))); const a = R.errore ? { errore: R.errore } : misura177(R); (per[R.g] = per[R.g] || []).push({ file: f, ...a }); } return per; };
const A = leggi(process.argv[2]);
if (process.argv.includes('--righe')) { for (const [g, L] of Object.entries(A)) for (const x of L) console.log(g, JSON.stringify(x)); process.exit(0); }
const B = process.argv[3] && !process.argv[3].startsWith('--') ? leggi(process.argv[3]) : null;
const G = [['dtPiccoF', 'Picco del piede − partenza del pallone (fotogrammi)'], ['dtPiccoMs', '…in millisecondi'], ['dtAvantiF', 'Picco della SPINTA in avanti − partenza del pallone (fotogrammi)'], ['vAvantiMs', 'Velocita\' della spinta in avanti (m/s)'], ['dContattoCm', 'Punta − punto di battuta alla partenza (cm)'], ['dPiantaCm', '…in pianta (cm)'], ['dMinCm', 'Distanza minima punta-pallone in ±0,10 s (cm, definizione 170b)'], ['appoggioQuotaCm', 'Piede d\'appoggio: quota della punta (cm)'], ['appoggioScorreCmF', 'Piede d\'appoggio: scorrimento (cm per fotogramma)'], ['palloneFermoCm', 'Pallone spostato prima della partenza (cm)'], ['giroMaxGradiF', 'Giro massimo del busto, fino a +20 f (gradi per fotogramma)'], ['giroDopoGradiF', 'Giro massimo del busto dopo (rilascio/esultanza)'], ['saltoBacinoMaxCmF', 'Spostamento massimo del bacino (cm per fotogramma)'], ['vPiedeMs', 'Velocita\' del piede al picco (m/s)'], ['vPallaMs', 'Velocita\' del pallone (m/s)']];
for (const g of Object.keys(A)) { const ra = riassunto177(A[g]), rb = B && B[g] ? riassunto177(B[g]) : null;
  console.log(`\n### ${g} — prima: ${ra.valide}/${ra.esecuzioni} valide, clip ${ra.clip.join(', ')}` + (rb ? ` · dopo: ${rb.valide}/${rb.esecuzioni} valide, clip ${rb.clip.join(', ')}` : ''));
  console.log(rb ? '| Grandezza | Prima | Dopo |\n|---|---|---|' : '| Grandezza | Misura |\n|---|---|');
  for (const [k, et] of G) console.log(`| ${et} | ${fmt(ra[k])} |` + (rb ? ` ${fmt(rb[k])} |` : '')); }
