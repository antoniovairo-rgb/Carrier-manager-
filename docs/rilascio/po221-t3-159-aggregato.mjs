/* PO-221 T3 (7.999.159) — aggregatore. Uso: node po221-t3-159-aggregato.mjs po221-t3-159-w0.jsonl po221-t3-159-w1.jsonl > out.json
   Definizioni come po221-aggregato158.mjs: scene = cast (__CPM_CAST219); gol/assist eroe = res ok&&key; punizioni = tipo «punizione»;
   gol squadra = eventi goal side «home»; gol subiti = side «away» (convenzione verificata: CARRIER-MANAGER-AV.html 28922, 33479, 33481, 35665). */
import fs from 'node:fs';
const all = process.argv.slice(2).flatMap(f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)));
const rows = all.filter(r => r.final !== false);
const crash = all.filter(r => r.crash).length;
const med = a => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const avg = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3) : null;
const dist = a => a.reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), {});
const scene = rows.map(r => (r.cast || []).length);
const sceneNoRig = rows.map(r => (r.cast || []).filter(c => c.tipo !== 'rigore').length);
const rig = rows.map(r => (r.cast || []).filter(c => c.tipo === 'rigore').length);
const gol = rows.map(r => (r.res || []).filter(x => x.ok && x.key === 'goal').length);
const assist = rows.map(r => (r.res || []).filter(x => x.ok && x.key === 'assist').length);
const pz = rows.map(r => (r.cast || []).filter(c => c.tipo === 'punizione').length);
const golSq = rows.map(r => (r.goal || []).filter(g => g.side === 'home').length);
const golSub = rows.map(r => (r.goal || []).filter(g => g.side === 'away').length);
const tab = rows.map(r => r.score ? [r.score.home, r.score.away] : null);
const incoerenti = rows.filter((r, i) => tab[i] && (tab[i][0] !== golSq[i] || tab[i][1] !== golSub[i])).map(r => r.k);
const sopra7 = sceneNoRig.filter(s => s > 7).length;
const fuori = rows.filter(r => r.fine !== 'ceremony' && r.fine !== 'ended').map(r => r.k);
const out = {
  partite: rows.length, righeGrezze: all.length, crash, nonArrivateAlFischio: fuori, errori: rows.filter(r => r.err).map(r => r.k),
  scene: { media: avg(scene), mediana: med(scene), min: Math.min(...scene), max: Math.max(...scene), distribuzione: dist(scene), sopra8: scene.filter(s => s > 8).length },
  sceneSenzaRigori: { media: avg(sceneNoRig), mediana: med(sceneNoRig), distribuzione: dist(sceneNoRig), partiteSopra7: sopra7 },
  rigori: { totale: rig.reduce((a, b) => a + b, 0), partiteConRigore: rig.filter(x => x > 0).length },
  golEroe: { media: avg(gol), mediana: med(gol), distribuzione: dist(gol) },
  assistEroe: { media: avg(assist), distribuzione: dist(assist) },
  punizioni: { media: avg(pz), mediana: med(pz), distribuzione: dist(pz), partiteOltre1: pz.filter(x => x > 1).length },
  golSquadra: { media: avg(golSq) },
  golSubiti: { media: avg(golSub) },
  tabelloneVsEventi: { partiteIncoerenti: incoerenti.length, kIncoerenti: incoerenti },
  fingerprint: rows.map(r => `${r.k}:${r.score ? r.score.home + '-' + r.score.away : '?'}`).join(' '),
};
console.log(JSON.stringify(out, null, 2));
