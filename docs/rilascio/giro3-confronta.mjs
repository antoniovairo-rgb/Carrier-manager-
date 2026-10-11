// Confronto dei log del giro 3: legge out-giro3/*.log, estrae le righe GIRO3:* e confronta le coppie.
import fs from 'node:fs';
const dir = process.argv[2] || 'out-giro3';
const L = (f) => Object.fromEntries(fs.readFileSync(`${dir}/${f}.log`, 'utf8').split('\n').filter(x => x.startsWith('GIRO3:')).map(x => { const i = x.indexOf(' '); return [x.slice(6, i), x.slice(i + 1)]; }));
const sc = (x) => x.score;
const js = (v) => JSON.parse(v.slice(v.indexOf('[')));
const scene = (x) => js(x.timeline).filter(e => e.type === 'ActionResolved');
const sceneKey = (x) => scene(x).map(e => `${e.gi}:${e.intent}:${e.label}:${e.ok}:${e.key}`);
const nScene = (x) => scene(x).length;
const ev = (x) => js(x.ev);
const golEv = (x) => ev(x).filter(e => /gol|goal/i.test(e.ev) || /gol|goal/i.test(e.k || ''));
const fasiSeq = (x) => JSON.parse(x.fasi).map(f => f.fase).join('>');
const runs = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(r => [r, L(r)]);
const info = (r) => {
  const x = r;
  const hl = JSON.parse(x.hl);
  const tl = scene(x);
  const e = ev(x);
  const evTipi = {}; e.forEach(z => { evTipi[z.ev] = (evTipi[z.ev] || 0) + 1; });
  return { score: sc(x), numHL: hl.numHL, hlTimes: hl.hlTimes.join(','), scene: tl.length, sceneKey: sceneKey(x), evN: e.length, evTipi, fasi: fasiSeq(x), ring: x.ring, durata: x.score.match(/durata_reale_s=(\d+)/)?.[1] };
};
const I = Object.fromEntries(runs.map(([r, x]) => [r, info(x)]));
for (const r in I) console.log(r, JSON.stringify({ score: I[r].score, numHL: I[r].numHL, hlTimes: I[r].hlTimes, scene: I[r].scene, evN: I[r].evN, ring: I[r].ring, durata: I[r].durata }));
const pairs = [['A1', 'A2'], ['B1', 'B2'], ['C1', 'C2']];
for (const [p, q] of pairs) {
  const a = I[p], b = I[q];
  const eqScore = a.score.replace(/\s+fine.*/, '') === b.score.replace(/\s+fine.*/, '');
  const eqHL = a.hlTimes === b.hlTimes;
  const eqFasi = a.fasi === b.fasi;
  let firstDiff = -1; const ka = a.sceneKey, kb = b.sceneKey;
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) if (ka[i] !== kb[i]) { firstDiff = i; break; }
  console.log(`${p} vs ${q}: punteggio ${eqScore ? 'UGUALE' : 'DIVERSO'} (${a.score}/${b.score}) · highlight-minuti ${eqHL ? 'UGUALI' : 'DIVERSI'} (numHL ${a.numHL}/${b.numHL}) · fasi ${eqFasi ? 'UGUALI' : 'DIVERSE'} · scene ${a.scene}/${b.scene} · sequenza esiti ${firstDiff < 0 ? 'UGUALE' : 'DIVERSA dalla scena ' + firstDiff}`);
  if (firstDiff >= 0) { console.log('   ' + p + ' @' + firstDiff + ': ' + (ka[firstDiff] || '-')); console.log('   ' + q + ' @' + firstDiff + ': ' + (kb[firstDiff] || '-')); }
}
console.log('ev per tipo:'); for (const r in I) console.log(r, JSON.stringify(I[r].evTipi));
