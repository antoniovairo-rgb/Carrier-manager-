// [giro 203 · PO-464] Ricompressione SENZA perdere movimenti di assets/cgtrader-clip-rohr.glb (stesso file, stessa licenza).
// Cosa cambia: SOLO la rappresentazione delle uscite di ROTAZIONE delle animazioni, da float32 a int16 normalizzato
// (glTF 2.0 core, «animation.sampler.output» di rotazione ammette SHORT normalized; three r128 GLTFLoader lo legge, r.3053).
// Cosa NON cambia: clip, nomi, chiavi (stessi istanti, stesso numero: 30 fps), interpolazione, traslazioni (float32), nodi,
// scheletro (75 ossa), skin e inverseBindMatrices. Precisione: 1/32767 per componente ≈ 0,0035° per osso nel caso peggiore.
// Uso: node tools/rohr-180/quantizza-203.mjs <entrata.glb> <uscita.glb>
import fs from 'node:fs';
const [IN, OUT] = process.argv.slice(2);
if (!IN || !OUT) { console.error('uso: quantizza-203.mjs <entrata.glb> <uscita.glb>'); process.exit(2); }
const b = fs.readFileSync(IN); const nj = b.readUInt32LE(12); const j = JSON.parse(b.slice(20, 20 + nj).toString());
const bin = b.slice(28 + nj, 28 + nj + b.readUInt32LE(20 + nj));
const K = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const rotOut = new Set(); for (const a of j.animations) for (const c of a.channels) if (c.target.path === 'rotation') rotOut.add(a.samplers[c.sampler].output);
const parti = []; let off = 0; const bvNuove = [];
j.accessors.forEach((acc, i) => {
  const v = j.bufferViews[acc.bufferView]; if (acc.componentType !== 5126 || v.byteStride) throw new Error('accessor ' + i + ' non float32 compatto');
  const o = (v.byteOffset || 0) + (acc.byteOffset || 0); const n = acc.count * K[acc.type];
  const f = new Float32Array(bin.buffer.slice(bin.byteOffset + o, bin.byteOffset + o + n * 4));
  let dati;
  if (rotOut.has(i)) { const q = new Int16Array(n); for (let k = 0; k < n; k++) q[k] = Math.max(-32767, Math.min(32767, Math.round(f[k] * 32767)));
    dati = Buffer.from(q.buffer); acc.componentType = 5122; acc.normalized = true; delete acc.min; delete acc.max; }
  else dati = Buffer.from(f.buffer);
  const pad = (4 - (off % 4)) % 4; if (pad) { parti.push(Buffer.alloc(pad)); off += pad; }
  bvNuove.push({ buffer: 0, byteOffset: off, byteLength: dati.length }); parti.push(dati); off += dati.length;
  acc.bufferView = i; delete acc.byteOffset;
});
j.bufferViews = bvNuove;
const binN = Buffer.concat([...parti, Buffer.alloc((4 - (off % 4)) % 4)]); j.buffers = [{ byteLength: binN.length }];
let js = Buffer.from(JSON.stringify(j)); js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
const tot = 12 + 8 + js.length + 8 + binN.length; const h = Buffer.alloc(12); h.writeUInt32LE(0x46546c67, 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(tot, 8);
const cj = Buffer.alloc(8); cj.writeUInt32LE(js.length, 0); cj.writeUInt32LE(0x4e4f534a, 4);
const cb = Buffer.alloc(8); cb.writeUInt32LE(binN.length, 0); cb.writeUInt32LE(0x004e4942, 4);
fs.writeFileSync(OUT, Buffer.concat([h, cj, js, cb, binN]));
console.log(`${IN}: ${b.length} B -> ${OUT}: ${tot} B · ${rotOut.size} uscite di rotazione in int16 normalizzato`);
