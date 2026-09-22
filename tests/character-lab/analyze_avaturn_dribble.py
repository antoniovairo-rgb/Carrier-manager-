"""Numerical pose probe: Korward regular dribble -> Avaturn sample."""
import bpy
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

animated_path, avatar_path, report_path = sys.argv[sys.argv.index("--") + 1 :]
report_path = Path(report_path).resolve()
MAPPING = {
    "pelvis": "Hips", "spine_01": "Spine", "spine_02": "Spine1", "spine_03": "Spine2", "neck_01": "Neck", "Head": "Head",
    "clavicle_l": "LeftShoulder", "upperarm_l": "LeftArm", "lowerarm_l": "LeftForeArm", "hand_l": "LeftHand",
    "clavicle_r": "RightShoulder", "upperarm_r": "RightArm", "lowerarm_r": "RightForeArm", "hand_r": "RightHand",
    "thigh_l": "LeftUpLeg", "calf_l": "LeftLeg", "foot_l": "LeftFoot", "ball_l": "LeftToeBase",
    "thigh_r": "RightUpLeg", "calf_r": "RightLeg", "foot_r": "RightFoot", "ball_r": "RightToeBase",
}
for side, suffix in (("Left", "l"), ("Right", "r")):
    for finger in ("Thumb", "Index", "Middle", "Ring", "Pinky"):
        for index in range(1, 4):
            MAPPING[f"{finger.lower()}_{index:02d}_{suffix}"] = f"{side}Hand{finger}{index}"

bpy.ops.import_scene.gltf(filepath=animated_path)
animated_armature = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
animated_objects = set(bpy.context.scene.objects)
source_action = animated_armature.animation_data.action
bpy.ops.import_scene.gltf(filepath=avatar_path)
avatar_armature = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE' and o != animated_armature)
for obj in list(animated_objects):
    if obj != animated_armature:
        bpy.data.objects.remove(obj, do_unlink=True)
missing_animated = sorted(n for n in MAPPING if n not in animated_armature.pose.bones)
missing_avatar = sorted(n for n in MAPPING.values() if n not in avatar_armature.pose.bones)
if missing_animated or missing_avatar:
    raise RuntimeError(json.dumps({'missing_animated': missing_animated, 'missing_avatar': missing_avatar}))
for source_name, target_name in MAPPING.items():
    if source_name == 'pelvis':
        continue
    constraint = avatar_armature.pose.bones[target_name].constraints.new('COPY_ROTATION')
    constraint.target = animated_armature
    constraint.subtarget = source_name
    constraint.owner_space = 'LOCAL'
    constraint.target_space = 'LOCAL'
    constraint.mix_mode = 'REPLACE'

scene = bpy.context.scene
frames = list(range(0, 42))
tracked = ['Hips', 'Spine', 'Spine1', 'Spine2', 'LeftShoulder', 'RightShoulder', 'LeftHand', 'RightHand', 'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'LeftFoot', 'RightFoot', 'Head']
samples = {name: [] for name in tracked}
for frame in frames:
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    for name in tracked:
        p = avatar_armature.matrix_world @ avatar_armature.pose.bones[name].head
        samples[name].append(p)

def span(name):
    values = samples[name]
    return max((a-b).length for a in values for b in values)

def finite(name):
    return all(math.isfinite(v) for p in samples[name] for v in p)

def max_reach(hand, shoulder):
    return max((a-b).length for a,b in zip(samples[hand], samples[shoulder]))

report = {
    'purpose': 'numerical local pose probe only; no gameplay ball or runtime export',
    'source_action': source_action.name,
    'frames': [frames[0], frames[-1]],
    'mapping_count': len(MAPPING),
    'missing_animated': missing_animated,
    'missing_avatar': missing_avatar,
    'finite_transforms': {name: finite(name) for name in tracked},
    'motion_span_m': {name: round(span(name), 4) for name in ['LeftHand', 'RightHand', 'LeftFoot', 'RightFoot']},
    'max_hand_shoulder_reach_m': {
        'left': round(max_reach('LeftHand', 'LeftShoulder'), 4),
        'right': round(max_reach('RightHand', 'RightShoulder'), 4),
    },
    'limitations': [
        'Local rotation-copy probe; visual review remains required.',
        'Root translation and ball ownership are intentionally disabled.',
        'The public sample is non-commercial and cannot be adopted.'
    ]
}
report_path.write_text(json.dumps(report, indent=2), encoding='utf-8')
print('KORWARD_AVATURN_DRIBBLE_METRICS=' + json.dumps(report))
