// Riepilogo dei tabellini dal vivo (jsonl della sonda passaggi-228-vivo-misura): medie per partita, due squadre insieme.
// Uso: node riepilogo.mjs file1.jsonl [file2.jsonl ...]
import fs from 'node:fs';
const R = process.argv.slice(2).flatMap(f => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l))).filter(r => r.tab && (r.fine === 'ceremony' || r.fine === 'ended'));
const V = { passaggi: t => t.home.passaggi + t.away.passaggi, passOk: t => 100 * (t.home.passOk + t.away.passOk) / (t.home.passaggi + t.away.passaggi), tiri: t => t.home.tiri + t.away.tiri, inPorta: t => t.home.inPorta + t.away.inPorta, gol: t => t.home.gol + t.away.gol, xg: t => (+t.home.xg || 0) + (+t.away.xg || 0), cross: t => t.home.cross + t.away.cross, dribbling: t => (t.home.dribbling | 0) + (t.away.dribbling | 0), possCasa: t => t.home.possesso, contrasti: t => t.home.contrasti + t.away.contrasti, falli: t => t.home.falli + t.away.falli, corner: t => t.home.corner + t.away.corner };
const out = { n: R.length };
for (const [k, f] of Object.entries(V)) { const x = R.map(r => f(r.tab)); const m = x.reduce((a, b) => a + b, 0) / x.length; const sd = Math.sqrt(x.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, x.length - 1)); out[k] = { m: +m.toFixed(2), sd: +sd.toFixed(2) }; }
console.log(JSON.stringify(out));
