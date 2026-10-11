/* PO-221 (7.999.158) — aggregatore dei JSONL grezzi. Uso: node po221-aggregato158.mjs file1.jsonl [file2 ...] > out.json */
import fs from 'node:fs';
const rows = process.argv.slice(2).flatMap(f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)));
const med = a => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const dist = a => a.reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), {});
const n = rows.length;
const scene = rows.map(r => (r.cast || []).length);
const sceneNoRig = rows.map(r => (r.cast || []).filter(c => c.tipo !== 'rigore').length);
const gol = rows.map(r => (r.res || []).filter(x => x.ok && x.key === 'goal').length);
const assist = rows.map(r => (r.res || []).filter(x => x.ok && x.key === 'assist').length);
const pz = rows.map(r => (r.cast || []).filter(c => c.tipo === 'punizione').length);
const sopra7 = rows.filter((r, i) => sceneNoRig[i] > 7);
const sopra7conRigore = sopra7.filter(r => (r.cast || []).some(c => c.tipo === 'rigore')).length;
const nonFine = rows.filter(r => r.fine !== 'ceremony' && r.fine !== 'ended').map(r => r.k);
const errori = rows.filter(r => r.err).map(r => ({ k: r.k, err: r.err }));
const pzSopra1 = rows.filter((r, i) => pz[i] > 1).map(r => r.k);
const sopra8 = scene.filter(s => s > 8).length;
const out = {
  partite: n, errori, nonArrivateAlFischio: nonFine,
  scene: { media: avg(scene), mediana: med(scene), min: Math.min(...scene), max: Math.max(...scene), distribuzione: dist(scene) },
  sceneSenzaRigori: { media: avg(sceneNoRig), mediana: med(sceneNoRig), distribuzione: dist(sceneNoRig), partiteSopra7: sopra7.length, di_cui_con_rigore: sopra7conRigore, kSopra7: sopra7.map(r => r.k) },
  gol: { media: avg(gol), distribuzione: dist(gol) },
  assist: { media: avg(assist), distribuzione: dist(assist) },
  punizioni: { media: avg(pz), mediana: med(pz), distribuzione: dist(pz), partiteOltre1: pzSopra1.length, kOltre1: pzSopra1 },
  partiteSopra8Scene: sopra8,
};
console.log(JSON.stringify(out, null, 2));
