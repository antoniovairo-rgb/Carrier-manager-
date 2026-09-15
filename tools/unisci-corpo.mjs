/* [D12] UNISCE LE MESH DEL CORPO CH38 — meno chiamate di disegno, stessi triangoli.
   Misura di partenza (sonda tests/visual/costo-corpo.mjs, 15/09 21:40): 153 chiamate di disegno per fotogramma
   con 23 corpi in campo, perche' ogni corpo e' fatto di 7 mesh skinnate. Le 7 mesh usano pero' soli 2 materiali
   (Ch38_body, Ch38_hair): unite per materiale diventano 2 primitive, cioe' ~46 chiamate invece di ~161.
   L'ostacolo e' che i 7 skin hanno liste di ossa DIVERSE (7 · 30 · 10 · 61 · 8 · 6 · 6): l'unione si fa qui,
   offline, rimappando JOINTS_0 su uno skin unico. Non tocca i triangoli, le texture, le animazioni.
   Uso: node tools/unisci-corpo.mjs assets/footballer.glb assets/footballer-uno.glb */
import { NodeIO } from '@gltf-transform/core';
import path from 'node:path';

const [,, inPath = 'assets/footballer.glb', outPath = 'assets/footballer-uno.glb'] = process.argv;
const io = new NodeIO();
const doc = await io.read(inPath);
const root = doc.getRoot();

/* 1) lo skin unione: tutte le ossa di tutti gli skin, una volta sola, con le loro matrici di bind */
const skins = root.listSkins();
if (!skins.length) { console.error('nessuno skin: niente da unire'); process.exit(1); }
const ossa = []; const indiceDi = new Map();
const bindDi = new Map(); /* osso -> matrice di bind inversa (16 numeri) */
for (const skin of skins) {
  const joints = skin.listJoints();
  const ibm = skin.getInverseBindMatrices();
  const arr = ibm ? ibm.getArray() : null;
  joints.forEach((j, k) => {
    if (!indiceDi.has(j)) { indiceDi.set(j, ossa.length); ossa.push(j); }
    if (arr && !bindDi.has(j)) bindDi.set(j, Array.from(arr.slice(k * 16, k * 16 + 16)));
  });
}
console.log(`ossa unite: ${ossa.length} (da ${skins.map(s => s.listJoints().length).join(' + ')})`);

/* 2) raccoglie le primitive dei nodi skinnati, rimappando JOINTS_0 sullo skin unione */
const nodiSkinnati = root.listNodes().filter((n) => n.getSkin() && n.getMesh());
const perMateriale = new Map(); /* materiale -> [{prim, nodo}] */
for (const nodo of nodiSkinnati) {
  const skin = nodo.getSkin();
  const joints = skin.listJoints();
  const mappa = joints.map((j) => indiceDi.get(j));
  for (const prim of nodo.getMesh().listPrimitives()) {
    const J = prim.getAttribute('JOINTS_0');
    if (J) {
      const a = J.getArray().slice();
      for (let i = 0; i < a.length; i++) a[i] = mappa[a[i]] ?? 0;
      J.setArray(a);
    }
    const mat = prim.getMaterial();
    if (!perMateriale.has(mat)) perMateriale.set(mat, []);
    perMateriale.get(mat).push(prim);
  }
}
console.log(`nodi skinnati: ${nodiSkinnati.length} · materiali distinti: ${perMateriale.size}`);

/* 3) una primitiva per materiale: concatena vertici e indici */
const ATTRS = ['POSITION', 'NORMAL', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0', 'TANGENT', 'COLOR_0'];
const meshUnita = doc.createMesh('Ch38_uno');
let triTot = 0;
for (const [mat, prims] of perMateriale) {
  const nomi = ATTRS.filter((a) => prims.every((p) => p.getAttribute(a)));
  const fuori = ATTRS.filter((a) => prims.some((p) => p.getAttribute(a)) && !nomi.includes(a));
  if (fuori.length) console.log(`  nota: attributi non presenti su tutte le primitive, scartati: ${fuori.join(', ')}`);
  const nuova = doc.createPrimitive().setMaterial(mat);
  let base = 0; const indici = [];
  const buf = {}; for (const a of nomi) buf[a] = [];
  for (const p of prims) {
    const pos = p.getAttribute('POSITION');
    const n = pos.getCount();
    for (const a of nomi) { const acc = p.getAttribute(a); const arr = acc.getArray(); for (let i = 0; i < arr.length; i++) buf[a].push(arr[i]); }
    const idx = p.getIndices();
    if (idx) { const ia = idx.getArray(); for (let i = 0; i < ia.length; i++) indici.push(ia[i] + base); }
    else { for (let i = 0; i < n; i++) indici.push(i + base); }
    base += n;
  }
  for (const a of nomi) {
    const campione = prims[0].getAttribute(a);
    const acc = doc.createAccessor().setType(campione.getType()).setBuffer(root.listBuffers()[0]);
    const Ctor = campione.getArray().constructor;
    acc.setArray(new Ctor(buf[a]));
    if (campione.getNormalized && campione.getNormalized()) acc.setNormalized(true);
    nuova.setAttribute(a, acc);
  }
  const accI = doc.createAccessor().setType('SCALAR').setBuffer(root.listBuffers()[0])
    .setArray(base > 65535 ? new Uint32Array(indici) : new Uint16Array(indici));
  nuova.setIndices(accI);
  meshUnita.addPrimitive(nuova);
  triTot += indici.length / 3;
  console.log(`  materiale ${mat.getName() || '?'}: ${prims.length} primitive → 1 · vertici ${base} · triangoli ${indici.length / 3}`);
}

/* 4) uno skin unico e un solo nodo skinnato; via i vecchi */
const ibmArr = new Float32Array(ossa.length * 16);
ossa.forEach((o, i) => { const m = bindDi.get(o) || [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; ibmArr.set(m, i * 16); });
const accIbm = doc.createAccessor().setType('MAT4').setArray(ibmArr).setBuffer(root.listBuffers()[0]);
const skinUno = doc.createSkin('Ch38_skin_uno').setInverseBindMatrices(accIbm);
for (const o of ossa) skinUno.addJoint(o);
const skel = skins[0].getSkeleton(); if (skel) skinUno.setSkeleton(skel);

const padre = nodiSkinnati[0].getParentNode ? nodiSkinnati[0].getParentNode() : null;
const nodoUno = doc.createNode('Ch38_uno').setMesh(meshUnita).setSkin(skinUno);
if (padre) padre.addChild(nodoUno); else root.listScenes()[0].addChild(nodoUno);
for (const n of nodiSkinnati) { n.setMesh(null); n.setSkin(null); n.dispose(); }
for (const s of skins) s.dispose();
for (const m of root.listMeshes()) if (m !== meshUnita && !m.listParents().some((p) => p.propertyType === 'Node')) m.dispose();

await io.write(outPath, doc);
const dopo = await io.read(outPath);
const r2 = dopo.getRoot();
console.log(`\nscritto ${path.basename(outPath)} · mesh ${r2.listMeshes().length} · primitive ${r2.listMeshes().reduce((s, m) => s + m.listPrimitives().length, 0)} · skin ${r2.listSkins().length} · ossa ${r2.listSkins()[0]?.listJoints().length} · animazioni ${r2.listAnimations().length} · triangoli ${triTot}`);
console.log('atteso: 1 mesh, 2 primitive → per 23 corpi ≈ 46 chiamate di disegno invece di ~161.');
