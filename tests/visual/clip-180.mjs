// [giro 180b, PO-367] Guardiano clip-180: assets/cgtrader-clip-rohr.glb (clip Anderson Rohr riadattate, NON collegate ai gesti).
// Giudica: (1) il file si carica — struttura GLB valida E parse vero col GLTFLoader di three r128 (quello del gioco);
// (2) scheletro: 75 ossa con gli STESSI nomi, nello stesso ordine, dello skin di cgtrader-review-lod1-kit-adapter.glb;
// (3) solo animazioni (nessuna mesh/materiale/immagine: il corpo resta quello CGTrader); (4) elenco clip atteso, durata
// attesa (+-1 fotogramma) e 30 fps esatti (n chiavi - 1 = durata x 30), ogni canale su un osso dello skin.
// Prova del rosso: CPM_CLIP180=assets/cgtrader-clip-po.glb node clip-180.mjs  (file con altre clip -> rosso).
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const REPO = path.resolve(QUI, '../..');
const FILE = process.env.CPM_CLIP180 || 'assets/cgtrader-clip-rohr.glb';
const ATTESE = { 'rohr-side-foot-kick': 4.5, 'rohr-power-kick': 4.4333, 'rohr-goal-celebration-01': 3.4667,
  'rohr-goal-celebration-02': 3.5, 'rohr-goal-celebration-03': 3.1667, 'rohr-defending-01': 6.2333,
  'rohr-clapping-hands-up': 14.1, 'rohr-fist-up-cheering': 21.7667, 'rohr-pointing-up-cheering': 12.9333 };
const PESO_MAX = 2.5e6;   // dichiarato nel rapporto 180b: ~2,0 MB
const err = []; const ok = m => console.log('  ✓ ' + m); const ko = m => { err.push(m); console.log('  ✗ ' + m); };
function leggi(f) {
  const b = fs.readFileSync(path.join(REPO, f));
  if (b.readUInt32LE(0) !== 0x46546c67 || b.readUInt32LE(4) !== 2 || b.readUInt32LE(8) !== b.length) throw new Error(`${f}: intestazione GLB non valida`);
  const nj = b.readUInt32LE(12); const j = JSON.parse(b.slice(20, 20 + nj).toString());
  const ob = 20 + nj; const nb = b.readUInt32LE(ob);
  if (b.readUInt32LE(ob + 4) !== 0x004e4942) throw new Error(`${f}: blocco BIN mancante`);
  return { b, j, nb, bin: b.slice(ob + 8, ob + 8 + nb) };
}
console.log(`clip-180 · ${FILE}`);
let G;
try { G = leggi(FILE); ok(`GLB valido (${(G.b.length / 1e6).toFixed(2)} MB)`); } catch (e) { ko(e.message); }
if (G) {
  const { j, nb } = G;
  G.b.length <= PESO_MAX ? ok(`peso ${(G.b.length / 1e6).toFixed(2)} MB <= ${PESO_MAX / 1e6} MB`) : ko(`peso ${G.b.length} > ${PESO_MAX}`);
  (j.buffers?.[0]?.byteLength ?? 0) <= nb ? ok('buffer dentro il blocco BIN') : ko('buffer oltre il blocco BIN');
  const fuori = (j.bufferViews || []).filter(v => (v.byteOffset || 0) + v.byteLength > nb).length;
  fuori === 0 ? ok('bufferView tutte nei limiti') : ko(`${fuori} bufferView fuori dai limiti`);
  const corpo = leggi('assets/cgtrader-review-lod1-kit-adapter.glb').j;
  const nomiC = corpo.skins[0].joints.map(i => corpo.nodes[i].name);
  const nomi = (j.skins?.[0]?.joints || []).map(i => j.nodes[i].name);
  (j.skins?.length === 1 && nomi.length === 75 && nomi.join() === nomiC.join()) ? ok('scheletro: 75 ossa, nomi e ordine identici al corpo CGTrader')
    : ko(`scheletro: ${nomi.length} ossa, diverso dal corpo (${nomiC.length})`);
  const extra = ['meshes', 'materials', 'images', 'textures'].filter(k => (j[k] || []).length);
  extra.length === 0 ? ok('solo animazioni (nessuna mesh/materiale/immagine)') : ko(`contiene ${extra.join(', ')}`);
  const giunti = new Set(j.skins?.[0]?.joints || []);
  const anim = j.animations || [];
  const nomiA = anim.map(a => a.name).sort(); const att = Object.keys(ATTESE).sort();
  nomiA.join() === att.join() ? ok(`clip: ${anim.length} attese`) : ko(`clip ${nomiA.join(',')} ≠ attese ${att.join(',')}`);
  for (const a of anim) {
    const ins = a.channels.map(c => j.accessors[a.samplers[c.sampler].input]);
    const dur = Math.max(...ins.map(x => x.max[0])); const att = ATTESE[a.name];
    const fpsOk = ins.every(x => x.min[0] === 0 && (x.count === 1 || Math.abs((x.count - 1) - x.max[0] * 30) < 0.01));
    const ossaOk = a.channels.every(c => giunti.has(c.target.node));
    if (att !== undefined && Math.abs(dur - att) <= 1 / 30 + 1e-4 && fpsOk && ossaOk) ok(`${a.name}: ${dur.toFixed(3)} s · 30 fps · ${a.channels.length} canali sullo skin`);
    else ko(`${a.name}: durata ${dur.toFixed(3)} (attesa ${att}) · 30fps ${fpsOk} · canali sullo skin ${ossaOk}`);
  }
  // parse VERO con il GLTFLoader di three r128
  try {
    const req = createRequire(path.join(QUI, 'package.json'));
    globalThis.THREE = req('three'); globalThis.self = globalThis;
    new Function(fs.readFileSync(path.join(QUI, 'node_modules/three/examples/js/loaders/GLTFLoader.js'), 'utf8'))();
    const ab = G.b.buffer.slice(G.b.byteOffset, G.b.byteOffset + G.b.length);
    const gl = await new Promise((res, rej) => new THREE.GLTFLoader().parse(ab, '', res, rej));
    const mix = new THREE.AnimationMixer(gl.scene); let legati = 0;
    for (const c of gl.animations) { const az = mix.clipAction(c); az.play(); mix.update(c.duration / 2); legati += az._propertyBindings.filter(p => p.binding.node).length; az.stop(); }
    gl.animations.length === anim.length && legati > 0 ? ok(`GLTFLoader r128: ${gl.animations.length} clip caricate, ${legati} tracce legate a ossa`)
      : ko(`GLTFLoader r128: ${gl.animations.length} clip, ${legati} tracce legate`);
  } catch (e) { ko('GLTFLoader r128: ' + e.message); }
}
console.log(err.length ? `ROSSO clip-180: ${err.length} controlli falliti` : 'VERDE clip-180');
process.exit(err.length ? 1 : 0);
