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

  // Restore pristine positions before authoring; never stack reductions.
  const pristine = readGlb(path.join(assets, 'hyper-casual-korward-animated.glb'));
  const originalPositions = pristine.json.accessors[0];
  const originalView = pristine.json.bufferViews[originalPositions.bufferView];
  const originalOffset = (originalView.byteOffset || 0) + (originalPositions.byteOffset || 0);
  for(let i=0;i<position.count;i++) setPosition(i,...[0,1,2].map(k=>pristine.bin.readFloatLE(originalOffset+i*12+k*4)));
  const pristinePoints=Array.from({length:position.count},(_,i)=>at(i));
  // Weld UV seams, then identify disconnected anatomical surfaces by topology.
  const parent=pristinePoints.map((_,i)=>i);
  const find=i=>{while(parent[i]!==i)i=parent[i];return i;};
  const join=(a,b)=>{parent[find(a)]=find(b);};
  const weld=new Map();
  pristinePoints.forEach((p,i)=>{const key=p.map(v=>v.toFixed(3)).join();if(weld.has(key))join(i,weld.get(key));else weld.set(key,i);});
  for(let i=0;i<indices.count;i+=3){const ids=[0,1,2].map(k=>data.getUint32(indexOffset+(i+k)*4,true));join(ids[0],ids[1]);join(ids[0],ids[2]);}
  const groups=new Map();pristinePoints.forEach((_,i)=>{const id=find(i);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(i);});
  const body=[...groups.values()].sort((a,b)=>b.length-a.length)[0];
  const bodySet=new Set(body),headSet=new Set(pristinePoints.map((_,i)=>i).filter(i=>!bodySet.has(i)));
  if(headSet.size!==1005)throw new Error('Unexpected source topology: inspect before authoring');
  // One similarity transform for face, eyes, brows and hair, anchored at neck.
  const headScale=.52, anchor=[0,118.55657196044922,0];
  let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<position.count;i++){
    const point=pristinePoints[i].map((v,k)=>headSet.has(i)?anchor[k]+(v-anchor[k])*headScale:v);
    setPosition(i,...point);point.forEach((v,k)=>{min[k]=Math.min(min[k],v);max[k]=Math.max(max[k],v);});
  }
  // Use the original UV atlas to distinguish skin from cloth, before any scale.
  const {PNG}=require('../tests/visual/node_modules/pngjs');
  const imageView=pristine.json.bufferViews[pristine.json.images[0].bufferView];
  const png=PNG.sync.read(pristine.bin.subarray(imageView.byteOffset,imageView.byteOffset+imageView.byteLength));
  const uvAccessor=json.accessors[original.attributes.TEXCOORD_0],uvView=json.bufferViews[uvAccessor.bufferView];
  const uvOffset=(uvView.byteOffset||0)+(uvAccessor.byteOffset||0);
  const skinAt=(tri)=>{
    const uv=[0,1].map(k=>tri.reduce((v,i)=>v+data.getFloat32(uvOffset+i*8+k*4,true),0)/3);
    const x=Math.max(0,Math.min(png.width-1,Math.round(uv[0]*(png.width-1)))),y=Math.max(0,Math.min(png.height-1,Math.round(uv[1]*(png.height-1))));
    const o=(y*png.width+x)*4,[r,g,b]=png.data.subarray(o,o+3);
    return r>g*1.12 && g>b*1.08 && r>70;
  };
  position.min = min; position.max = max;
  const parts = [[], [], [], [], []]; // skin+head, shirt, shorts, socks, boots
  const shirtTriangles = [];
  for (let i = 0; i < indices.count; i += 3) {
    const tri = [
      data.getUint32(indexOffset + i * indexStride, true),
      data.getUint32(indexOffset + (i + 1) * indexStride, true),
      data.getUint32(indexOffset + (i + 2) * indexStride, true)
    ];
    const points = tri.map(i=>pristinePoints[i]);
    const y = points.reduce((sum, point) => sum + point[1], 0) / 3;
    const x = Math.abs(points.reduce((sum, point) => sum + point[0], 0) / 3);
    let part = 0;
    if (tri.every(i=>headSet.has(i)) || skinAt(tri)) part = 0;
    else if (y >= 60) part = 1;
    else if (y >= 30) part = 2;
    else if (y >= 10) part = 3;
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
