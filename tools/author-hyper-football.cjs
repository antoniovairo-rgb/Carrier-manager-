/* Re-author the single-surface Hyper Casual GLB into garment material slots.
   The source model keeps its rig and animations; only static mesh partitions
   and the head proportions are changed. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'assets');
const variants = [
  ['hyper-casual-korward-football.glb', 'hyper-casual-korward-football-authored.glb'],
  ['hyper-casual-korward-football-brown.glb', 'hyper-casual-korward-football-authored-brown.glb'],
  ['hyper-casual-korward-football-black.glb', 'hyper-casual-korward-football-authored-black.glb'],
  ['hyper-casual-korward-football-red.glb', 'hyper-casual-korward-football-authored-red.glb']
];
const align4 = n => (n + 3) & ~3;

function readGlb(file) {
  const raw = fs.readFileSync(file);
  if (raw.readUInt32LE(0) !== 0x46546c67) throw new Error(`Not a GLB: ${file}`);
  const jsonLength = raw.readUInt32LE(12);
  const json = JSON.parse(raw.subarray(20, 20 + jsonLength).toString('utf8').trim());
  const binHeader = 20 + jsonLength;
  const binLength = raw.readUInt32LE(binHeader);
  return { json, bin: Buffer.from(raw.subarray(binHeader + 8, binHeader + 8 + binLength)) };
}

function writeGlb(file, json, bin) {
  json.buffers[0].byteLength = bin.length;
  const jsonBody = Buffer.from(JSON.stringify(json));
  const jsonLength = align4(jsonBody.length);
  const binLength = align4(bin.length);
  const out = Buffer.alloc(12 + 8 + jsonLength + 8 + binLength, 0x20);
  out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
  out.writeUInt32LE(jsonLength, 12); out.writeUInt32LE(0x4e4f534a, 16); jsonBody.copy(out, 20);
  const binHeader = 20 + jsonLength;
  out.writeUInt32LE(binLength, binHeader); out.writeUInt32LE(0x004e4942, binHeader + 4); bin.copy(out, binHeader + 8);
  fs.writeFileSync(file, out);
}

function author(sourceName, outputName) {
  const { json, bin: sourceBin } = readGlb(path.join(assets, sourceName));
  let bin = sourceBin;
  const mesh = json.meshes[0];
  const original = mesh.primitives[0];
  const position = json.accessors[original.attributes.POSITION];
  const positionView = json.bufferViews[position.bufferView];
  const positionOffset = (positionView.byteOffset || 0) + (position.byteOffset || 0);
  const positionStride = positionView.byteStride || 12;
  const indices = json.accessors[original.indices];
  const indexView = json.bufferViews[indices.bufferView];
  if (indices.componentType !== 5125) throw new Error('Expected uint32 index accessor');
  const indexOffset = (indexView.byteOffset || 0) + (indices.byteOffset || 0);
  const indexStride = 4;
  const data = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  const at = i => {
    const offset = positionOffset + i * positionStride;
    return [data.getFloat32(offset, true), data.getFloat32(offset + 4, true), data.getFloat32(offset + 8, true)];
  };
  const setPosition = (i, x, y, z) => {
    const offset = positionOffset + i * positionStride;
    data.setFloat32(offset, x, true); data.setFloat32(offset + 4, y, true); data.setFloat32(offset + 8, z, true);
  };
  /* The source was already reduced once. Scale the head around its geometric
     centre, equally on all axes: scaling from the world origin flattened it
     into an oval in the match camera. */
  const head = [];
  let headCenter = [0, 0, 0];
  for (let i = 0; i < position.count; i++) {
    const point = at(i);
    if (point[1] > 142) { head.push(i); headCenter = headCenter.map((sum, axis) => sum + point[axis]); }
  }
  headCenter = headCenter.map(value => value / head.length);
  const headSet = new Set(head);
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < position.count; i++) {
    let [x, y, z] = at(i);
    if (headSet.has(i)) {
      const scale = 0.72;
      x = headCenter[0] + (x - headCenter[0]) * scale;
      y = headCenter[1] + (y - headCenter[1]) * scale;
      z = headCenter[2] + (z - headCenter[2]) * scale;
      setPosition(i, x, y, z);
    }
    min = min.map((value, axis) => Math.min(value, [x, y, z][axis]));
    max = max.map((value, axis) => Math.max(value, [x, y, z][axis]));
  }
  position.min = min; position.max = max;
  const parts = [[], [], [], [], []]; // skin+head, shirt, shorts, socks, boots
  const shirtTriangles = [];
  for (let i = 0; i < indices.count; i += 3) {
    const tri = [
      data.getUint32(indexOffset + i * indexStride, true),
      data.getUint32(indexOffset + (i + 1) * indexStride, true),
      data.getUint32(indexOffset + (i + 2) * indexStride, true)
    ];
    const points = tri.map(at);
    const y = points.reduce((sum, point) => sum + point[1], 0) / 3;
    const x = Math.abs(points.reduce((sum, point) => sum + point[0], 0) / 3);
    let part = 0;
    if (y >= 142) part = 0; // face and hair remain baked in the source texture
    else if (y >= 78) part = x > 38 ? 0 : 1; // arms stay skin, torso becomes shirt
    else if (y >= 50) part = x > 42 ? 0 : 2;
    else if (y >= 23) part = x > 40 ? 0 : 3;
    else part = 4;
    if (part === 1) shirtTriangles.push({ tri, x: points.reduce((sum, point) => sum + point[0], 0) / 3, y });
    else parts[part].push(...tri);
  }
  json.materials[original.material].name = 'HyperFaceAndHair';
  const material = (name, color) => ({ name, pbrMetallicRoughness: { baseColorFactor: color, metallicFactor: 0, roughnessFactor: 0.82 } });
  const materialIds = [
    original.material,
    json.materials.push(material('HyperShirt', [0.48, 0.04, 0.10, 1])) - 1,
    json.materials.push(material('HyperShirtAccent', [0.94, 0.94, 0.94, 1])) - 1,
    json.materials.push(material('HyperShorts', [0.04, 0.07, 0.15, 1])) - 1,
    json.materials.push(material('HyperSocks', [0.48, 0.04, 0.10, 1])) - 1,
    json.materials.push(material('HyperBoots', [0.025, 0.03, 0.045, 1])) - 1
  ];
  const appendIndices = (part, materialId) => {
    const offset = align4(bin.length);
    if (offset > bin.length) bin = Buffer.concat([bin, Buffer.alloc(offset - bin.length)]);
    const indexBuffer = Buffer.alloc(part.length * 4);
    part.forEach((value, i) => indexBuffer.writeUInt32LE(value, i * 4));
    bin = Buffer.concat([bin, indexBuffer]);
    const view = json.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: indexBuffer.length, target: 34963 }) - 1;
    const accessor = json.accessors.push({ bufferView: view, componentType: 5125, count: part.length, type: 'SCALAR' }) - 1;
    return { attributes: original.attributes, indices: accessor, material: materialId, mode: 4 };
  };
  const primitives = [
    appendIndices(parts[0], materialIds[0]),
    appendIndices(parts[2], materialIds[3]),
    appendIndices(parts[3], materialIds[4]),
    appendIndices(parts[4], materialIds[5])
  ];
  mesh.name = 'HyperFootballerAuthored';
  mesh.primitives = primitives;
  /* Every shirt pattern lives as real skinned geometry in the GLB. At runtime
     only the club's node is made visible; no screen-space or bind-position
     shader is involved. */
  const meshIndex = json.meshes.indexOf(mesh);
  const sourceNodeIndex = json.nodes.findIndex(node => node.mesh === meshIndex);
  if (sourceNodeIndex < 0) throw new Error('Could not find the skinned mesh node');
  const parentNodes = json.nodes.filter(node => Array.isArray(node.children) && node.children.includes(sourceNodeIndex));
  const sceneNodes = json.scenes.filter(scene => Array.isArray(scene.nodes) && scene.nodes.includes(sourceNodeIndex));
  const patternTests = {
    solid: () => false,
    stripes: ({ x }) => Math.floor((x + 48) / 13) % 2 !== 0,
    stripesw: ({ x }) => Math.floor((x + 48) / 25) % 2 !== 0,
    hoops: ({ y }) => Math.floor((y - 74) / 16) % 2 !== 0,
    halves: ({ x }) => x > 0,
    sash: ({ x, y }) => { const d = x + 0.46 * (y - 104); return d > 0 && d < 15; },
    sleeves: ({ x }) => Math.abs(x) > 27,
    vband: ({ x }) => Math.abs(x) < 11,
    band: ({ y }) => y > 98 && y < 117
  };
  Object.entries(patternTests).forEach(([pattern, isAccent]) => {
    const base = [], accent = [];
    shirtTriangles.forEach(entry => (isAccent(entry) ? accent : base).push(...entry.tri));
    const shirtPrimitives = [appendIndices(base, materialIds[1])];
    if (accent.length) shirtPrimitives.push(appendIndices(accent, materialIds[2]));
    const shirtMesh = json.meshes.push({ name: `HyperShirtPattern-${pattern}`, primitives: shirtPrimitives }) - 1;
    const shirtNode = { ...json.nodes[sourceNodeIndex], name: `HyperShirtPattern-${pattern}`, mesh: shirtMesh };
    delete shirtNode.children;
    const shirtNodeIndex = json.nodes.push(shirtNode) - 1;
    parentNodes.forEach(node => node.children.push(shirtNodeIndex));
    sceneNodes.forEach(scene => scene.nodes.push(shirtNodeIndex));
  });
  writeGlb(path.join(assets, outputName), json, bin);
  console.log(`${outputName}: ${parts.map(part => part.length / 3).join('/')} base triangles, ${shirtTriangles.length} shirt triangles`);
}

variants.forEach(([source, output]) => author(source, output));
