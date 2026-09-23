/* [23/09 POC] MATERIALI DEI GLB: validatore e correttore, senza Blender.
   Perche': l'export dei pacchetti CGTrader scrive `alphaMode: BLEND` su tutti i materiali (misurato: 6/6 su LOD0/1/2).
   GLTFLoader li traduce in materiali trasparenti senza scrittura di profondita' e, con `doubleSided`, le facce del kit
   si ordinano male: e' il «kit a chiazze» visto sul telefono. La review lo tappa a runtime (BLEND->MASK, rosso
   `__CPM_NO_ALPHAFIX`); questo strumento lo corregge ALLA SORGENTE, nel file, cosi' un asset nuovo non ripete il difetto.

   Uso:
     node tools/glb-materiali.mjs verifica <file.glb>...          esce 1 se un materiale e' in BLEND
     node tools/glb-materiali.mjs correggi <in.glb> <out.glb>     BLEND -> MASK (alphaCutoff 0,5, come il runtime)
   Il correttore tocca SOLO il blocco JSON del GLB (i dati binari restano byte per byte) e rifiuta di sovrascrivere l'input. */
import fs from 'node:fs';

const leggi = f => {
  const b = fs.readFileSync(f);
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error(`${f}: non e' un GLB`);
  const n = b.readUInt32LE(12);
  if (b.readUInt32LE(16) !== 0x4e4f534a) throw new Error(`${f}: il primo blocco non e' JSON`);
  return { b, n, json: JSON.parse(b.subarray(20, 20 + n).toString('utf8')) };
};
const stato = json => (json.materials || []).map(m => ({ nome: m.name || '(senza nome)', alpha: m.alphaMode || 'OPAQUE', due: !!m.doubleSided }));

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'verifica') {
  let rossi = 0;
  for (const f of args) {
    const s = stato(leggi(f).json), blend = s.filter(m => m.alpha === 'BLEND');
    rossi += blend.length;
    console.log(`${blend.length ? '✗' : '✓'} ${f} · ${s.map(m => `${m.nome}:${m.alpha}`).join(' ')}`);
  }
  if (!args.length) { console.error('nessun file'); process.exit(2); }
  process.exit(rossi ? 1 : 0);
} else if (cmd === 'correggi') {
  const [src, dst] = args;
  if (!src || !dst) { console.error('uso: correggi <in.glb> <out.glb>'); process.exit(2); }
  if (fs.existsSync(dst) && fs.realpathSync(dst) === fs.realpathSync(src)) { console.error('rifiuto: output uguale all\'input'); process.exit(2); }
  const { b, n, json } = leggi(src);
  let k = 0;
  for (const m of json.materials || []) if (m.alphaMode === 'BLEND') { m.alphaMode = 'MASK'; m.alphaCutoff = 0.5; k++; }
  let testo = Buffer.from(JSON.stringify(json), 'utf8');
  const pad = (4 - (testo.length % 4)) % 4;
  testo = Buffer.concat([testo, Buffer.alloc(pad, 0x20)]);
  const resto = b.subarray(20 + n);
  const out = Buffer.alloc(12 + 8 + testo.length + resto.length);
  out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
  out.writeUInt32LE(testo.length, 12); out.writeUInt32LE(0x4e4f534a, 16);
  testo.copy(out, 20); resto.copy(out, 20 + testo.length);
  fs.writeFileSync(dst, out);
  console.log(`${dst} · ${k} materiali BLEND -> MASK · binario invariato (${resto.length} byte)`);
} else {
  console.error('comandi: verifica | correggi'); process.exit(2);
}
