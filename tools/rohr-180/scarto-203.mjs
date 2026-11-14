// [giro 203 · PO-464] Scarto delle POSE fra due file di clip Rohr, campionate col GLTFLoader e l'AnimationMixer di three r128
// (lo stesso caricatore del gioco). Per ogni clip: istanti ogni 1/60 s (le chiavi a 30 fps E i punti a meta' fra due chiavi,
// dove lavora l'interpolazione) da 0 alla durata. Per ogni osso: angolo fra le rotazioni locali (gradi) e distanza fra le
// posizioni nel mondo (mm, catena cinematica vera, quindi con l'effetto della norma non unitaria). Confronta anche elenco clip,
// nomi, durate, numero di chiavi e ossa. Uscita 0 solo se tutto coincide e lo scarto sta sotto le soglie dichiarate.
// Uso: node tools/rohr-180/scarto-203.mjs <prima.glb> <dopo.glb>   (soglie: CPM_SOGLIA_DEG=0.05 CPM_SOGLIA_MM=0.5)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const TV = path.resolve(QUI, '../../tests/visual');
const req = createRequire(path.join(TV, 'package.json')); globalThis.THREE = req('three'); globalThis.self = globalThis;
new Function(fs.readFileSync(path.join(TV, 'node_modules/three/examples/js/loaders/GLTFLoader.js'), 'utf8'))();
const SD = +(process.env.CPM_SOGLIA_DEG || 0.05), SMM = +(process.env.CPM_SOGLIA_MM || 0.5);
const carica = f => { const b = fs.readFileSync(f); const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.length);
  return new Promise((r, e) => new THREE.GLTFLoader().parse(ab, '', r, e)); };
const [A, B] = await Promise.all(process.argv.slice(2, 4).map(carica));
let ko = 0; const no = m => { ko++; console.log('  ✗ ' + m); };
const ossa = g => { const o = []; g.scene.traverse(n => { if (n.isBone || n.type === 'Bone' || n.isObject3D) o.push(n); }); return o; };
const nA = A.animations.map(c => c.name).join(), nB = B.animations.map(c => c.name).join();
console.log(`clip: prima ${A.animations.length} · dopo ${B.animations.length} · nomi e ordine ${nA === nB ? 'identici' : 'DIVERSI'}`); if (nA !== nB) no('nomi diversi');
const oA = ossa(A), oB = ossa(B); const bA = oA.filter(n => n.isBone).length, bB = oB.filter(n => n.isBone).length;
console.log(`ossa: prima ${bA} · dopo ${bB}`); if (bA !== bB || oA.map(n => n.name).join() !== oB.map(n => n.name).join()) no('scheletro diverso');
const mA = new THREE.AnimationMixer(A.scene), mB = new THREE.AnimationMixer(B.scene);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), pa = new THREE.Vector3(), pb = new THREE.Vector3();
let gDeg = 0, gMm = 0, gNorm = 0, campioni = 0; const righe = [];
for (let i = 0; i < A.animations.length; i++) {
  const ca = A.animations[i], cb = B.animations[i];
  const chA = ca.tracks.map(t => t.times.length).join(), chB = cb.tracks.map(t => t.times.length).join();
  const tA = ca.tracks.map(t => Array.from(t.times).join()).join('|'), tB = cb.tracks.map(t => Array.from(t.times).join()).join('|');
  if (Math.abs(ca.duration - cb.duration) > 1e-6 || chA !== chB || tA !== tB || ca.tracks.length !== cb.tracks.length) no(`${ca.name}: durata/chiavi/tracce diverse`);
  const xa = mA.clipAction(ca), xb = mB.clipAction(cb); xa.play(); xb.play();
  let dMax = 0, mmMax = 0;
  for (let t = 0; t <= ca.duration + 1e-9; t += 1 / 60) {
    mA.setTime(t); mB.setTime(t); A.scene.updateMatrixWorld(true); B.scene.updateMatrixWorld(true);
    for (let k = 0; k < oA.length; k++) { const a = oA[k], b = oB[k]; if (!a.isBone) continue;
      gNorm = Math.max(gNorm, Math.abs(b.quaternion.length() - 1));
      qa.copy(a.quaternion).normalize(); qb.copy(b.quaternion).normalize();
      const d = 2 * Math.acos(Math.min(1, Math.abs(qa.dot(qb)))) * 180 / Math.PI;
      a.getWorldPosition(pa); b.getWorldPosition(pb); const mm = pa.distanceTo(pb) * 1000;
      if (d > dMax) dMax = d; if (mm > mmMax) mmMax = mm; campioni++; }
  }
  xa.stop(); xb.stop(); mA.uncacheClip(ca); mB.uncacheClip(cb);
  gDeg = Math.max(gDeg, dMax); gMm = Math.max(gMm, mmMax);
  righe.push(`${ca.name.padEnd(28)} ${ca.duration.toFixed(3)} s · ${ca.tracks[0].times.length} chiavi · max ${dMax.toFixed(4)}° · ${mmMax.toFixed(3)} mm`);
}
righe.forEach(r => console.log('  ' + r));
console.log(`campioni osso×istante: ${campioni} · scarto massimo ${gDeg.toFixed(4)}° (soglia ${SD}) · ${gMm.toFixed(3)} mm (soglia ${SMM}) · norma |q|-1 max ${gNorm.toExponential(2)}`);
if (gDeg > SD) no(`rotazione oltre soglia: ${gDeg}`); if (gMm > SMM) no(`posizione oltre soglia: ${gMm}`);
console.log(ko ? `ROSSO scarto-203: ${ko}` : 'VERDE scarto-203'); process.exit(ko ? 1 : 0);
