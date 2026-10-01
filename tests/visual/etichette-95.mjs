/* [7.999.95 PO-087, decisione PO 01/10] Guardiano delle etichette: nessun titolo di scena e nessuna azione dell'eroe
   promette un gesto che il 3D non sa disegnare (elastico, tunnel, hocus pocus, rabona, tacco). La ruleta e' ammessa
   (clip vera dalla 7.999.39). Statico: legge src/04. Prova del rosso: CPM_SRC=<file della versione precedente>. */
import fs from 'node:fs';
import path from 'node:path';
const src = process.env.CPM_SRC || path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../src/04-situazioni-zone-piazzati.jsx');
const txt = fs.readFileSync(src, 'utf8');
const VIETATE = /\b(elastico|tunnel|hocus|rabona|tacco)\b|(tra|fra|in mezzo al)le gambe/i;/* anche il tunnel detto a parole («Scatto tra le gambe», #166) */
const titoli = [...txt.matchAll(/S\("([^"]+)"/g)].map(m => m[1]);
const azioni = [...txt.matchAll(/A\("([^"]+)"/g)].map(m => m[1]);
const intro = [...txt.matchAll(/\],(?:false|true),-?\d+,"([^"]*)"/g)].map(m => m[1]);
const trov = [...titoli.map(t => ['titolo', t]), ...azioni.map(t => ['azione', t]), ...intro.map(t => ['intro', t])].filter(([, t]) => VIETATE.test(t));
console.log(`schede ${titoli.length} · azioni ${azioni.length} · testi d'apertura ${intro.length} · promesse senza gesto ${trov.length}`);
trov.slice(0, 30).forEach(([k, t]) => console.log(`  ${k}: ${t}`));
if (titoli.length < 150 || azioni.length < 400) { console.log('CIECO: il file non ha la forma attesa'); process.exit(2); }
if (process.env.CPM_ROSSO95) { const v = trov.length > 0; console.log(v ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
console.log(trov.length === 0 ? 'VERDE' : 'KO'); process.exit(trov.length === 0 ? 0 : 1);
