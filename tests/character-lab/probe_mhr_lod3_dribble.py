import bpy, json, sys, math
from mathutils import Vector
target_path, source, report = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.import_scene.fbx(filepath=target_path)
target = bpy.data.objects.get('body_world')
if target is None:
    raise RuntimeError('MHR armature body_world missing')
MAPPING = {
    'spine_01':'c_spine1', 'spine_02':'c_spine2', 'spine_03':'c_spine3', 'neck_01':'c_neck', 'Head':'c_head',
    'clavicle_l':'l_clavicle', 'upperarm_l':'l_uparm', 'lowerarm_l':'l_lowarm', 'hand_l':'l_wrist',
    'clavicle_r':'r_clavicle', 'upperarm_r':'r_uparm', 'lowerarm_r':'r_lowarm', 'hand_r':'r_wrist',
    'thigh_l':'l_upleg', 'calf_l':'l_lowleg', 'foot_l':'l_foot', 'ball_l':'l_ball',
    'thigh_r':'r_upleg', 'calf_r':'r_lowleg', 'foot_r':'r_foot', 'ball_r':'r_ball',
}
bpy.ops.import_scene.gltf(filepath=source)
source_arm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE' and o != target)
action = source_arm.animation_data.action if source_arm.animation_data else None
if action is None:
    raise RuntimeError('dribble action missing')
missing_source = sorted(name for name in MAPPING if name not in source_arm.pose.bones)
missing_target = sorted(name for name in MAPPING.values() if name not in target.pose.bones)
if missing_source or missing_target:
    raise RuntimeError(json.dumps({'missing_source':missing_source, 'missing_target':missing_target}))
for src, dst in MAPPING.items():
    constraint = target.pose.bones[dst].constraints.new('COPY_ROTATION')
    constraint.target = source_arm
    constraint.subtarget = src
    constraint.owner_space = 'LOCAL'
    constraint.target_space = 'LOCAL'
    constraint.mix_mode = 'REPLACE'
scene = bpy.context.scene
frames = range(0, 42)
tracked = ['l_clavicle','r_clavicle','l_wrist','r_wrist','l_upleg','r_upleg','l_lowleg','r_lowleg','l_foot','r_foot','c_head']
samples = {name: [] for name in tracked}
for frame in frames:
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    for name in tracked:
        samples[name].append(target.matrix_world @ target.pose.bones[name].head)
def finite(name):
    return all(math.isfinite(value) for point in samples[name] for value in point)
def span(name):
    return max((a-b).length for a in samples[name] for b in samples[name])
def reach(a,b):
    return max((a-b).length for a,b in zip(samples[a],samples[b]))
body = bpy.data.objects.get('body_mesh')
points = [body.matrix_world @ Vector(corner) for corner in body.bound_box]
height = max(point.z for point in points) - min(point.z for point in points)
result = {
    'source_action': action.name,
    'target':'MHR lod3.fbx',
    'mapping_count': len(MAPPING),
    'missing_source': missing_source,
    'missing_target': missing_target,
    'finite': {name: finite(name) for name in tracked},
    'height_m': round(height,4),
    'motion_span_m': {name: round(span(name),4) for name in ['l_wrist','r_wrist','l_foot','r_foot']},
    'max_hand_shoulder_reach_m': {'left':round(reach('l_wrist','l_clavicle'),4),'right':round(reach('r_wrist','r_clavicle'),4)},
    'limitations': ['rotation-copy structural probe only','no root translation','no ball attachment','no texture, kit, facial-morph, visual or mobile proof']
}
with open(report, 'w', encoding='utf-8') as handle:
    json.dump(result, handle, indent=2)
print('MHR_LOD3_DRIBBLE_PROBE=' + json.dumps(result))

