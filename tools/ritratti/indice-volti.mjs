/* [23/09 POC] INDICE LEGGERO DEI VOLTI per il gioco. Il manifest completo (505 KB) porta controlli, lotti e fogli che al
   gioco non servono; il gioco scarica solo questo indice (una volta) e poi le singole immagini quando una figurina appare.
   Campi per volto: n (numero dell'id ai-NNNN), f (file), e (eta'), k (carnagione: c/o/a/s — usata SOLO per avvicinare il volto
   dell'eroe al suo aspetto 3D, mai mostrata), h (colore capelli: prima parola). Gruppi: g = giocatori, s = staff.
   Uso: node tools/ritratti/indice-volti.mjs  → assets/portraits/ai/indice.json */
import fs from 'node:fs';
const M = Object.values(JSON.parse(fs.readFileSync('assets/portraits/ai/manifest.json', 'utf8')));
const K = { chiara: 'c', olivastra: 'o', ambrata: 'a', scura: 's' };
const riga = x => ({ n: +x.id.replace(/\D/g, ''), f: x.file.replace('assets/portraits/ai/', ''), e: x.eta, k: K[x.carnagione] || '?', h: String(x.capelli || '').split(' ')[0] });
const out = { v: 1, base: 'assets/portraits/ai/', g: M.filter(x => x.categoria === 'giocatore').map(riga).sort((a, b) => a.n - b.n), s: M.filter(x => x.categoria === 'staff').map(riga).sort((a, b) => a.n - b.n) };
const manc = [...out.g, ...out.s].filter(r => !fs.existsSync(out.base + r.f));
if (manc.length) { console.error('file mancanti', manc.length); process.exit(1); }
fs.writeFileSync('assets/portraits/ai/indice.json', JSON.stringify(out));
console.log(`indice: giocatori ${out.g.length} · staff ${out.s.length} · ${fs.statSync('assets/portraits/ai/indice.json').size} byte`);
