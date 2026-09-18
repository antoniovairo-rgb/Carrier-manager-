/* Offline Mixamo -> rebuilt Auto-Rig Pro bake. Run: node retarget.cjs [rebuilt.glb|V22.html]
 * Keeps original geometry, skin joint order and inverse bind matrices intact.
 * No browser/runtime retarget dependency. three is used only for math/mixer.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const crypto = require('crypto');
const THREE = require('three');
const ROOT = path.resolve(__dirname, '../..');
const V22 = process.argv[2] || path.join(__dirname, 'assets/rebuilt.glb');
const OUT = path.join(__dirname, 'assets');
function parse(b) {
  assert.equal(b.readUInt32LE(0), 0x46546c67);
  let json, bin;
  for (let p = 12; p < b.length;) {
    const len = b.readUInt32LE(p), type = b.readUInt32LE(p + 4);
    if (type === 0x4e4f534a) json = JSON.parse(b.subarray(p + 8, p + 8 + len).toString());
    if (type === 0x004e4942) bin = b.subarray(p + 8, p + 8 + len);
    p += 8 + len;
  }
  return { json, bin, bytes: b };
}
function accessor(g, id) {
  const a = g.json.accessors[id], v = g.json.bufferViews[a.bufferView];
  assert.equal(a.componentType, 5126, 'Bake expects floating point animation/IBM data');
  const width = { SCALAR: 1, VEC3: 3, VEC4: 4, MAT4: 16 }[a.type];
  assert(width && !a.sparse);
  const out = [];
  for (let i = 0; i < a.count; i++) for (let k = 0; k < width; k++) {
    out.push(g.bin.readFloatLE((v.byteOffset || 0) + (a.byteOffset || 0) + i * (v.byteStride || width * 4) + k * 4));
  }
  return out;
}
function integerAccessor(g, id) {
  const a = g.json.accessors[id], v = g.json.bufferViews[a.bufferView];
  const width = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  assert(width && !a.sparse);
  const read = a.componentType === 5121 ? 'readUInt8' : a.componentType === 5123 ? 'readUInt16LE' : null;
  const bytes = a.componentType === 5121 ? 1 : a.componentType === 5123 ? 2 : 0;
  assert(read, 'Skin joints must be unsigned integer data');
  const out = [];
  for (let i = 0; i < a.count; i++) for (let k = 0; k < width; k++) out.push(g.bin[read]((v.byteOffset || 0) + (a.byteOffset || 0) + i * (v.byteStride || width * bytes) + k * bytes));
  return out;
}
function graph(json) {
  const nodes = json.nodes.map(n => {
    const o = new THREE.Object3D(); o.name = n.name || '';
    if (n.matrix) new THREE.Matrix4().fromArray(n.matrix).decompose(o.position, o.quaternion, o.scale);
    else { if (n.translation) o.position.fromArray(n.translation); if (n.rotation) o.quaternion.fromArray(n.rotation); if (n.scale) o.scale.fromArray(n.scale); }
    return o;
  });
  const root = new THREE.Object3D();
  json.nodes.forEach((n, i) => (n.children || []).forEach(c => nodes[i].add(nodes[c])));
  nodes.filter(n => !n.parent).forEach(n => root.add(n));
  root.updateMatrixWorld(true);
  return { root, nodes };
}
const semantic = name => name.replace(/^mixamorig\d*:?/, '');
const fixed = {
  Hips: 'root.x_00', Spine: 'spine_01.x_013', Spine1: 'spine_02.x_014', Spine2: 'spine_03.x_015', Neck: 'neck.x_016', Head: 'head.x_017',
  LeftShoulder: 'shoulder.l_039', LeftArm: 'arm_stretch.l_040', LeftForeArm: 'forearm_stretch.l_041', LeftHand: 'hand.l_042',
  RightShoulder: 'shoulder.r_018', RightArm: 'arm_stretch.r_019', RightForeArm: 'forearm_stretch.r_020', RightHand: 'hand.r_021',
  LeftUpLeg: 'thigh_stretch.l_01', LeftLeg: 'leg_stretch.l_02', LeftFoot: 'foot.l_03', LeftToeBase: 'toes_01.l_04',
  RightUpLeg: 'thigh_stretch.r_07', RightLeg: 'leg_stretch.r_08', RightFoot: 'foot.r_09', RightToeBase: 'toes_01.r_010'
};
const inputBytes = fs.readFileSync(V22);
const embedded = inputBytes.readUInt32LE(0) === 0x46546c67 ? inputBytes : (inputBytes.toString('utf8').match(/[A-Za-z0-9+/]{1000,}={0,2}/g) || []).map(x => Buffer.from(x, 'base64')).find(b => b.readUInt32LE(0) === 0x46546c67);
assert(embedded, 'Embedded GLB missing');
const target = parse(embedded), tg = graph(target.json), body = parse(fs.readFileSync(path.join(ROOT, 'assets/footballer.glb'))), bg = graph(body.json);
const sourceBind = new Map(), duplicateBindErrors = [];
// IBM is inverse(jointWorld) * meshWorld. Recover bind world, independent of a possibly posed node hierarchy.
body.json.skins.forEach((skin, si) => {
  const meshIndex = body.json.nodes.findIndex(n => n.skin === si), meshWorld = bg.nodes[meshIndex].matrixWorld;
  const matrices = accessor(body, skin.inverseBindMatrices);
  skin.joints.forEach((joint, k) => {
    const m = new THREE.Matrix4().fromArray(matrices, k * 16).invert().premultiply(meshWorld);
    const key = semantic(body.json.nodes[joint].name), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    m.decompose(p, q, s);
    if (sourceBind.has(key)) duplicateBindErrors.push(sourceBind.get(key).q.angleTo(q));
    else sourceBind.set(key, { p, q, s });
  });
});
const targetBind = tg.nodes.map(o => ({ p: o.getWorldPosition(new THREE.Vector3()), q: o.getWorldQuaternion(new THREE.Quaternion()), localP: o.position.clone(), localQ: o.quaternion.clone(), localS: o.scale.clone() }));
const targetIBM = accessor(target, target.json.skins[0].inverseBindMatrices);
let targetBindMatrixMaxError = 0;
target.json.skins[0].joints.forEach((i, k) => {
  const expected = new THREE.Matrix4().fromArray(targetIBM, k * 16).invert();
  expected.elements.forEach((v, c) => targetBindMatrixMaxError = Math.max(targetBindMatrixMaxError, Math.abs(v - tg.nodes[i].matrixWorld.elements[c])));
});
assert(targetBindMatrixMaxError < 0.002, 'Target rest hierarchy differs from inverse bind matrices');
for (const side of ['Left', 'Right']) for (const finger of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) for (let k = 1; k <= 3; k++) {
  const prefix = `c_${finger.toLowerCase()}${k}.${side === 'Left' ? 'l' : 'r'}_`;
  const n = target.json.nodes.find(n => n.name.startsWith(prefix)); assert(n, prefix); fixed[`${side}Hand${finger}${k}`] = n.name;
}
const map = Object.entries(fixed).map(([source, targetName]) => ({ source, target: targetName, index: target.json.nodes.findIndex(n => n.name === targetName) }));
assert.equal(map.length, 52); assert(map.every(m => m.index >= 0 && sourceBind.has(m.source)));
// A bind-space delta alone preserves the target A-pose difference while the
// source moves out of T-pose, pushing the target hands through the torso.
// Calibrate the geometric primary segment direction into the source bind pose.
// Shortest arc changes swing only: no hand-tuned Euler offsets or mirror/scale.
const successors = { Hips: 'Spine', Spine: 'Spine1', Spine1: 'Spine2', Spine2: 'Neck', Neck: 'Head' };
for (const side of ['Left', 'Right']) {
  for (const [a, b] of [['Shoulder', 'Arm'], ['Arm', 'ForeArm'], ['ForeArm', 'Hand'], ['Hand', 'HandMiddle1'], ['UpLeg', 'Leg'], ['Leg', 'Foot'], ['Foot', 'ToeBase']]) successors[side + a] = side + b;
  for (const f of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) for (let k = 1; k <= 2; k++) successors[`${side}Hand${f}${k}`] = `${side}Hand${f}${k + 1}`;
}
const calibration = new Map(), calibrationReport = [];
map.forEach(m => {
  let from = m.source, to = successors[from], terminal = false;
  if (!to) {
    // No physical endpoint in the target export: use the immediately preceding
    // anatomical segment direction, retaining target roll by shortest-arc swing.
    terminal = true; to = from;
    if (from === 'Head') from = 'Neck';
    else if (from.endsWith('ToeBase')) from = from.replace('ToeBase', 'Foot');
    else from = from.replace(/3$/, '2');
  }
  const a = map.find(x => x.source === from), b = map.find(x => x.source === to); assert(a && b);
  const td = targetBind[b.index].p.clone().sub(targetBind[a.index].p).normalize();
  const sd = sourceBind.get(to).p.clone().sub(sourceBind.get(from).p).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(td, sd).normalize();
  const residual = td.clone().applyQuaternion(q).angleTo(sd);
  assert(residual < 1e-6); assert(new THREE.Matrix4().makeRotationFromQuaternion(q).determinant() > 0.999999);
  calibration.set(m.source, q);
  calibrationReport.push({ bone: m.target, source: m.source, anatomicalSegment: [from, to], terminalProxy: terminal, targetBindDirection: td.toArray(), sourceBindDirection: sd.toArray(), shortestArcDegrees: THREE.MathUtils.radToDeg(new THREE.Quaternion().angleTo(q)), alignmentResidualDegrees: THREE.MathUtils.radToDeg(residual), quaternion: q.toArray() });
});
const hip = map.find(m => m.source === 'Hips'), scale = targetBind[hip.index].p.y / sourceBind.get('Hips').p.y;
assert(scale > 1 && Number.isFinite(scale));
// glTF animated nodes must use TRS, not matrices; conversion is rest-equivalent.
target.json.skins[0].joints.forEach(i => {
  const n = target.json.nodes[i], b = targetBind[i]; delete n.matrix;
  n.translation = b.localP.toArray(); n.rotation = b.localQ.toArray(); n.scale = b.localS.toArray();
});
target.json.animations = [];
let binParts = [target.bin], binLength = target.bin.length;
function addAccessor(values, width) {
  const padding = (4 - binLength % 4) % 4; if (padding) { binParts.push(Buffer.alloc(padding)); binLength += padding; }
  const bytes = Buffer.alloc(values.length * 4); values.forEach((v, i) => { assert(Number.isFinite(v)); bytes.writeFloatLE(v, i * 4); });
  const view = target.json.bufferViews.length; target.json.bufferViews.push({ buffer: 0, byteOffset: binLength, byteLength: bytes.length }); binParts.push(bytes); binLength += bytes.length;
  const a = { bufferView: view, componentType: 5126, count: values.length / width, type: width === 1 ? 'SCALAR' : width === 3 ? 'VEC3' : 'VEC4' };
  if (width === 1) { a.min = [Math.min(...values)]; a.max = [Math.max(...values)]; }
  target.json.accessors.push(a); return target.json.accessors.length - 1;
}
const report = { source: V22, sourceGLBSha256: crypto.createHash('sha256').update(embedded).digest('hex'), method: 'Offline calibrated global bind-space delta: inverse(targetAnimatedParentWorld) * sourceAnimatedWorld * inverse(sourceBindWorld) * shortestArc(targetPrimaryDirection,sourcePrimaryDirection) * targetBindWorld', calibrationReason: 'Visual failure of v1: A-pose target plus T-pose source delta placed hands through torso. Geometric swing calibration aligns anatomical primary directions; shortest arc preserves roll, uses positive-determinant rotations only. Terminal bones use preceding anatomical segment proxy.', calibration: calibrationReport, sourceRest: 'Recovered from footballer.glb inverseBindMatrices and mesh world transforms', targetBindMatrixMaxError, sourceDuplicateBindAngleMax: Math.max(...duplicateBindErrors), rootHeightScale: scale, rootMotion: 'XZ fixed at target bind; Y source offset from IBM bind scaled by hips height ratio; no arbitrary floor offset', mappedBones: map, retainedRestTwistBones: target.json.nodes.filter(n => /twist/.test(n.name)).map(n => n.name), clips: [] };
const primitive = target.json.meshes[0].primitives[0], skin = target.json.skins[0];
const bindPositions = accessor(target, primitive.attributes.POSITION), jointIndices = integerAccessor(target, primitive.attributes.JOINTS_0), jointWeights = accessor(target, primitive.attributes.WEIGHTS_0);
const meshNode = target.json.nodes.findIndex(n => n.mesh === 0 && n.skin === 0), inverseBindMatrices = accessor(target, skin.inverseBindMatrices);
assert(meshNode >= 0 && bindPositions.length / 3 === jointWeights.length / 4 && jointWeights.length === jointIndices.length);
function currentSkinnedMinimumY() {
  const meshWorld = tg.nodes[meshNode].matrixWorld;
  const input = new THREE.Vector3(), output = new THREE.Vector3(), sum = new THREE.Vector3();
  let minimum = Infinity;
  for (let vertex = 0; vertex < bindPositions.length / 3; vertex++) {
    input.fromArray(bindPositions, vertex * 3).applyMatrix4(meshWorld); sum.set(0, 0, 0);
    for (let influence = 0; influence < 4; influence++) {
      const offset = vertex * 4 + influence, weight = jointWeights[offset];
      if (!weight) continue;
      const jointNode = skin.joints[jointIndices[offset]];
      output.copy(input).applyMatrix4(new THREE.Matrix4().fromArray(inverseBindMatrices, jointIndices[offset] * 16));
      output.applyMatrix4(tg.nodes[jointNode].matrixWorld);
      sum.addScaledVector(output, weight);
    }
    minimum = Math.min(minimum, sum.y);
  }
  return minimum;
}
// The core clips are available now. Optional football moves are included only
// when a licensed source GLB has been added to assets/: the same calibrated
// bake, grounding and visual gates apply and an absent move is never faked.
const CORE_CLIPS = ['idle', 'jog', 'jog-back', 'strafe-left', 'strafe-right', 'receive', 'kick', 'penalty', 'header', 'volley', 'tackle', 'throwin'];
const OPTIONAL_CLIPS = [
  // Outfield match play and transitions.
  'dribble', 'celebrate', 'pass', 'cross', 'running', 'running-to-turn',
  'change-direction', 'run-look-back', 'walk', 'jogging', 'look-over-shoulder', 'opening',
  'crouch-to-stand', 'missed-chance', 'capoeira-celebration',
  // Defensive actions (one-shot contact motions and recovery).
  'slide-tackle', 'standing-tackle', 'shoulder-challenge', 'marking-shuffle',
  'intercept', 'shot-block', 'recovery-run',
  // Bench and technical-area behaviour.
  'sit-idle', 'sit-talking', 'sit-pointing', 'sit-clap', 'sit-to-stand',
  'coach-point', 'coach-yell', 'coach-talk', 'coach-clap',
  // Goalkeeper-only actions, catalogued separately by the match integration.
  'gk-high-catch', 'gk-low-catch', 'gk-dive-left', 'gk-dive-right',
  'gk-parry-left', 'gk-parry-right', 'gk-rush-out', 'gk-get-up',
  'gk-goal-kick', 'gk-throw', 'gk-ready'
];
const HERO_CLIPS = [...CORE_CLIPS, ...OPTIONAL_CLIPS.filter(name => fs.existsSync(path.join(ROOT, `assets/anim-${name}.glb`)))];
for (const name of HERO_CLIPS) {
  const src = parse(fs.readFileSync(path.join(ROOT, `assets/anim-${name}.glb`))), sg = graph(src.json), animation = src.json.animations[0];
  const tracks = animation.channels.map(c => {
    const sampler = animation.samplers[c.sampler], times = accessor(src, sampler.input), values = accessor(src, sampler.output), prop = c.target.path;
    assert(!sampler.interpolation || sampler.interpolation === 'LINEAR', 'Unexpected source interpolation');
    assert(prop === 'rotation' || (prop === 'translation' && semantic(src.json.nodes[c.target.node].name) === 'Hips'));
    const Track = prop === 'rotation' ? THREE.QuaternionKeyframeTrack : THREE.VectorKeyframeTrack;
    return new Track(`${sg.nodes[c.target.node].uuid}.${prop === 'rotation' ? 'quaternion' : 'position'}`, times, values);
  });
  const clip = new THREE.AnimationClip(name, -1, tracks), mixer = new THREE.AnimationMixer(sg.root), action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play();
  const sourceIndices = new Map(src.json.nodes.map((n, i) => [semantic(n.name), i]));
  const mappedChannels = animation.channels.filter(c => c.target.path === 'rotation').map(c => semantic(src.json.nodes[c.target.node].name));
  const requiredMotionBones=['Hips','Spine','Spine1','Spine2','Neck','Head','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','RightUpLeg','RightLeg','RightFoot','RightToeBase'];
  const missingRotationChannels=map.filter(m=>!mappedChannels.includes(m.source)).map(m=>m.source);
  assert(mappedChannels.every(n => fixed[n]), `Unmapped source channels in ${name}`);
  assert(requiredMotionBones.every(n=>mappedChannels.includes(n)), `Missing a required body channel in ${name}: ${requiredMotionBones.filter(n=>!mappedChannels.includes(n)).join(', ')}`);
  const steps = Math.ceil(clip.duration * 60), times = Array.from({ length: steps + 1 }, (_, i) => clip.duration * i / steps);
  const rotations = new Map(map.map(m => [m.index, []])), positions = [], ungroundedMinima = []; let maxStep = 0, maxNormError = 0, maxPrimaryAlignment = 0;
  const ordered = [...map].sort((a, b) => a.index - b.index); // target glTF nodes are topologically ordered
  let previousTime = 0;
  times.forEach((time, frame) => {
    mixer.update(time - previousTime); previousTime = time; sg.root.updateMatrixWorld(true);
    tg.nodes.forEach((o, i) => { o.position.copy(targetBind[i].localP); o.quaternion.copy(targetBind[i].localQ); o.scale.copy(targetBind[i].localS); });
    tg.root.updateMatrixWorld(true);
    ordered.forEach(m => {
      const sourceNode = sg.nodes[sourceIndices.get(m.source)], node = tg.nodes[m.index];
      const wanted = sourceNode.getWorldQuaternion(new THREE.Quaternion()).multiply(sourceBind.get(m.source).q.clone().invert()).multiply(calibration.get(m.source)).multiply(targetBind[m.index].q);
      const local = node.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(wanted).normalize();
      const values = rotations.get(m.index), prev = frame ? new THREE.Quaternion().fromArray(values, values.length - 4) : null;
      if (prev && prev.dot(local) < 0) local.set(-local.x, -local.y, -local.z, -local.w);
      if (prev) maxStep = Math.max(maxStep, prev.angleTo(local)); maxNormError = Math.max(maxNormError, Math.abs(local.length() - 1));
      node.quaternion.copy(local); values.push(...local.toArray()); node.updateMatrixWorld(true);
    });
    // Physical endpoint directions, not a rest-formula tautology: compare the
    // evaluated source and target hierarchies after all local rotations are set.
    Object.entries(successors).forEach(([from, to]) => {
      const a = map.find(m => m.source === from), b = map.find(m => m.source === to);
      const td = tg.nodes[b.index].getWorldPosition(new THREE.Vector3()).sub(tg.nodes[a.index].getWorldPosition(new THREE.Vector3())).normalize();
      const sd = sg.nodes[sourceIndices.get(to)].getWorldPosition(new THREE.Vector3()).sub(sg.nodes[sourceIndices.get(from)].getWorldPosition(new THREE.Vector3())).normalize();
      maxPrimaryAlignment = Math.max(maxPrimaryAlignment, td.angleTo(sd));
    });
    const sourceHip = sg.nodes[sourceIndices.get('Hips')].getWorldPosition(new THREE.Vector3());
    const wantedHip = targetBind[hip.index].p.clone(); wantedHip.y += (sourceHip.y - sourceBind.get('Hips').p.y) * scale;
    tg.nodes[hip.index].parent.worldToLocal(wantedHip); positions.push(...wantedHip.toArray());
    tg.nodes[hip.index].position.copy(wantedHip); tg.root.updateMatrixWorld(true);
    ungroundedMinima.push(currentSkinnedMinimumY());
  });
  // Preserve animation authored in the source and lift only frames whose actual
  // deformed shoe vertices would enter the pitch. This is an offline skin-based
  // correction, not a scene/camera/root-position workaround; airborne frames
  // remain airborne.
  const groundingLift = ungroundedMinima.map(y => Math.max(0, -y));
  groundingLift.forEach((lift, frame) => { positions[frame * 3 + 1] += lift; });
  const seam = () => {
    const angles = map.map(m => { const v = rotations.get(m.index); return { bone: m.target, angle: new THREE.Quaternion().fromArray(v).angleTo(new THREE.Quaternion().fromArray(v, v.length - 4)) }; });
    const worst = angles.sort((a, b) => b.angle - a.angle)[0];
    return { worstBone: worst.bone, angleDegrees: THREE.MathUtils.radToDeg(worst.angle), rootDistanceModelUnits: new THREE.Vector3().fromArray(positions).distanceTo(new THREE.Vector3().fromArray(positions, positions.length - 3)) };
  };
  const rawLoopSeam = seam(), cyclic = ['idle', 'jog', 'jog-back', 'strafe-left', 'strafe-right'].includes(name);
  // Remove the source's small cyclic endpoint drift offline. Smoothstep has zero
  // derivative at both ends, so it does not add endpoint velocity discontinuities.
  // This guarantees C0 closure only; visual foot contact and velocity still need QA.
  if (cyclic) {
    map.forEach(m => {
      const values = rotations.get(m.index), first = new THREE.Quaternion().fromArray(values), last = new THREE.Quaternion().fromArray(values, values.length - 4);
      const correction = last.clone().invert().multiply(first).normalize();
      times.forEach((time, frame) => {
        const u = time / clip.duration, weight = u * u * (3 - 2 * u);
        const q = new THREE.Quaternion().fromArray(values, frame * 4).multiply(new THREE.Quaternion().slerp(correction, weight)).normalize();
        q.toArray(values, frame * 4);
      });
    });
    const drift = positions[positions.length - 2] - positions[1];
    times.forEach((time, frame) => { const u = time / clip.duration; positions[frame * 3 + 1] -= drift * u * u * (3 - 2 * u); });
  }
  // The cyclic seam correction can change the root height after the first
  // grounding pass. Re-evaluate the fully baked pose, then make the final
  // skin-based lift. This also verifies the actual GLB data we write.
  const finalUngroundedMinima = [];
  times.forEach((_, frame) => {
    tg.nodes.forEach((node, index) => {
      node.position.copy(targetBind[index].localP); node.quaternion.copy(targetBind[index].localQ); node.scale.copy(targetBind[index].localS);
    });
    map.forEach(m => tg.nodes[m.index].quaternion.fromArray(rotations.get(m.index), frame * 4));
    tg.nodes[hip.index].position.fromArray(positions, frame * 3);
    tg.root.updateMatrixWorld(true); finalUngroundedMinima.push(currentSkinnedMinimumY());
  });
  const finalGroundingLift = finalUngroundedMinima.map(y => Math.max(0, -y));
  finalGroundingLift.forEach((lift, frame) => { positions[frame * 3 + 1] += lift; });
  const bakedLoopSeam = seam();
  if (cyclic) { assert(bakedLoopSeam.angleDegrees < 0.01); assert(bakedLoopSeam.rootDistanceModelUnits < 1e-6); }
  const baked = { name, samplers: [], channels: [] }, input = addAccessor(times, 1);
  function channel(node, prop, values, width) { baked.channels.push({ sampler: baked.samplers.length, target: { node, path: prop } }); baked.samplers.push({ input, output: addAccessor(values, width), interpolation: 'LINEAR' }); }
  map.forEach(m => channel(m.index, 'rotation', rotations.get(m.index), 4)); channel(hip.index, 'translation', positions, 3); target.json.animations.push(baked);
  assert(maxNormError < 1e-6); assert(maxStep < Math.PI, 'Discontinuous rotation samples');
  assert(maxPrimaryAlignment < 0.005, 'Animated anatomical segment alignment failed');
  const groundedMinima = finalUngroundedMinima.map((y, frame) => y + finalGroundingLift[frame]);
  assert(Math.min(...groundedMinima) > -1e-5, 'Offline skin-based grounding failed');
  report.clips.push({ name, duration: clip.duration, frames: times.length, channels: baked.channels.length, coverage: `${mappedChannels.length}/52 animated rotation channels + Hips translation`, missingRotationChannels, finite: true, maxQuaternionNormError: maxNormError, maxPrimarySegmentAlignmentDegreesBeforeLoopCorrection: THREE.MathUtils.radToDeg(maxPrimaryAlignment), maxFrameStepDegreesBeforeLoopCorrection: THREE.MathUtils.radToDeg(maxStep), grounding: { method: 'Per-frame deformed vertex minimum Y lift, applied only when below pitch', minimumBeforeLift: Math.min(...ungroundedMinima), maximumLift: Math.max(...groundingLift) + Math.max(...finalGroundingLift), minimumAfterLift: Math.min(...groundedMinima) }, cyclic, loopCorrection: cyclic ? 'Smoothstep-distributed endpoint quaternion and vertical drift removal; C0 only, no foot IK' : 'None: one-shot action', rawLoopSeam, bakedLoopSeam, loopSeamPass: cyclic ? bakedLoopSeam.angleDegrees < 0.01 && bakedLoopSeam.rootDistanceModelUnits < 1e-6 : null });
  mixer.stopAllAction(); mixer.uncacheRoot(sg.root);
}
target.json.buffers[0].byteLength = binLength;
target.json.asset.generator = `${target.json.asset.generator} + Korward offline bind-space clip bake`;
let jsonBytes = Buffer.from(JSON.stringify(target.json)); if (jsonBytes.length % 4) jsonBytes = Buffer.concat([jsonBytes, Buffer.alloc(4 - jsonBytes.length % 4, 0x20)]);
let bin = Buffer.concat(binParts); if (bin.length % 4) bin = Buffer.concat([bin, Buffer.alloc(4 - bin.length % 4)]);
const header = Buffer.alloc(12), jc = Buffer.alloc(8), bc = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + jsonBytes.length + 8 + bin.length, 8); jc.writeUInt32LE(jsonBytes.length); jc.writeUInt32LE(0x4e4f534a, 4); bc.writeUInt32LE(bin.length); bc.writeUInt32LE(0x004e4942, 4);
const output = Buffer.concat([header, jc, jsonBytes, bc, bin]);
// Regression: all original binary payload bytes remain identical, including mesh/IBM/texture.
assert(output.subarray(28 + jsonBytes.length, 28 + jsonBytes.length + target.bin.length).equals(target.bin));
report.originalBinaryPreserved = true; report.outputBytes = output.length; report.outputSha256 = crypto.createHash('sha256').update(output).digest('hex');
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'animated.glb'), output); fs.writeFileSync(path.join(OUT, 'retarget-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ output: path.join(OUT, 'animated.glb'), ...report, mappedBones: report.mappedBones.length }, null, 2));
