/* Baseline audit only: validates source assets without starting the game or modifying simulation. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'animation-manifest.json'), 'utf8'));
const assetDir = path.join(root, 'assets', 'korward-regular-anims');

function readGltfJson(file) {
  const bin = fs.readFileSync(file);
  if (bin.toString('utf8', 0, 4) !== 'glTF') throw new Error('not a GLB');
  const jsonLength = bin.readUInt32LE(12);
  const jsonType = bin.readUInt32LE(16);
  if (jsonType !== 0x4e4f534a) throw new Error('missing JSON chunk');
  return JSON.parse(bin.toString('utf8', 20, 20 + jsonLength));
}

const rows = [];
for (const [name, spec] of Object.entries(manifest.clips)) {
  const file = path.join(assetDir, spec.file);
  if (!fs.existsSync(file)) throw new Error(`missing clip: ${spec.file}`);
  const gltf = readGltfJson(file);
  const channels = (gltf.animations || []).reduce((n, animation) => n + (animation.channels || []).length, 0);
  const joints = (gltf.skins || []).reduce((n, skin) => Math.max(n, (skin.joints || []).length), 0);
  if (joints !== manifest.rig.expectedJointCount) throw new Error(`${spec.file}: ${joints} joints, expected ${manifest.rig.expectedJointCount}`);
  if (!channels) throw new Error(`${spec.file}: no animation channels`);
  rows.push({ name, joints, channels, contactAt: spec.contactAt });
}

const allFiles = fs.readdirSync(assetDir).filter(name => name.endsWith('.glb'));
const uncalibrated = rows.filter(row => row.contactAt === null && ['ball-contact', 'defence'].includes(manifest.clips[row.name].role));
console.log(`ANIMATION INVENTORY PASS: ${rows.length}/${allFiles.length} manifest clips, ${manifest.rig.expectedJointCount}-joint rig`);
console.log(`CONTACT CALIBRATION PENDING: ${uncalibrated.map(row => row.name).join(', ')}`);
console.log(`ALIASES (not dedicated gestures): ${Object.entries(manifest.knownAliases).map(([gesture, alias]) => `${gesture}->${alias}`).join(', ')}`);
