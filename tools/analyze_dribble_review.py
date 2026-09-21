"""Measure and render the existing CGTrader `dribble` clip for an honest gate.

The ball meshes in the renders are frame-local guides only.  They prove neither
runtime ball ownership nor a dribble implementation in the match engine.
"""
import bpy
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path.cwd()
ASSET = ROOT / 'assets' / 'cgtrader-unreal-axis-corrected-retarget-full-ground-pass-review.glb'
EVIDENCE = ROOT / 'tests' / 'character-lab' / 'evidence' / 'cgtrader-dribble-review.json'
OUT = ROOT / 'tests' / 'character-lab' / 'dribble-review'
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ASSET))
rig = next(obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE')
rig.animation_data_create()
scene = bpy.context.scene

def sample(action_name):
    action = bpy.data.actions.get(action_name)
    if action is None:
        raise RuntimeError('Missing action ' + action_name)
    rig.animation_data.action = action
    start, end = (round(v) for v in action.frame_range)
    out, previous = [], None
    for frame in range(start, end + 1):
        scene.frame_set(frame)
        bpy.context.view_layer.update()
        left = rig.matrix_world @ rig.pose.bones['ball_l'].head
        right = rig.matrix_world @ rig.pose.bones['ball_r'].head
        pelvis = rig.matrix_world @ rig.pose.bones['pelvis'].head
        record = {'frame': frame, 'left': list(left), 'right': list(right), 'pelvis': list(pelvis)}
        if previous:
            record['step'] = {
                'left': (left - Vector(previous['left'])).length,
                'right': (right - Vector(previous['right'])).length,
            }
        out.append(record)
        previous = record
    return start, end, out

def contacts(frames):
    candidates = []
    for frame in frames[1:]:
        for side in ('left', 'right'):
            pos = frame[side]
            candidates.append({'frame': frame['frame'], 'foot': side, 'height': round(pos[2], 5), 'step': round(frame['step'][side], 5)})
    # Low, slow foot samples are pose-contact candidates, not impacts.
    return sorted(candidates, key=lambda entry: (entry['height'], entry['step']))[:8]

ds, de, dribble = sample('dribble')
js, je, jog = sample('jog')
report = {
    'asset': str(ASSET.relative_to(ROOT)),
    'dribbleRange': [ds, de],
    'jogRange': [js, je],
    'dribbleContacts': contacts(dribble),
    'jogContacts': contacts(jog),
    'limitation': 'No ball track exists in the GLB. Contact candidates and render guides cannot certify a gameplay dribble or ball synchronization.'
}
EVIDENCE.parent.mkdir(parents=True, exist_ok=True)
EVIDENCE.write_text(json.dumps(report, indent=2), encoding='utf-8')

def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

bpy.ops.object.camera_add(location=(3.1, -5.2, 2.05))
camera = bpy.context.object
camera.data.lens = 55
aim(camera, (0, 0, .9))
scene.camera = camera
for location, energy, size in [((-3,-4,4),1100,4), ((3,-2,2.5),850,3), ((0,3,3.5),700,3)]:
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.object
    light.data.energy = energy
    light.data.shape = 'DISK'
    light.data.size = size
    aim(light, (0, 0, .9))
bpy.ops.mesh.primitive_plane_add(size=20, location=(0,0,-.01))
floor = bpy.context.object
floor_mat = bpy.data.materials.new('DribbleReviewFloor')
floor_mat.diffuse_color = (.055,.09,.065,1)
floor.data.materials.append(floor_mat)
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=.11, location=(0,0,.105))
ball = bpy.context.object
ball.name = 'ReviewBallGuideOnly'
ball_mat = bpy.data.materials.new('DribbleReviewBall')
ball_mat.diffuse_color = (.94,.94,.90,1)
ball.data.materials.append(ball_mat)

scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.render.resolution_x = 640
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (.012,.018,.03)
rig.animation_data.action = bpy.data.actions['dribble']
render_frames = sorted(set([ds, round(ds+(de-ds)*.33), round(ds+(de-ds)*.66), de]))
for frame in render_frames:
    scene.frame_set(frame)
    left = rig.matrix_world @ rig.pose.bones['ball_l'].head
    right = rig.matrix_world @ rig.pose.bones['ball_r'].head
    toe = left if left.z <= right.z else right
    ball.location = (toe.x, toe.y - .11, .105)
    scene.render.filepath = str(OUT / f'dribble-{frame}.png')
    bpy.ops.render.render(write_still=True)
print('KORWARD_DRIBBLE_EVIDENCE=' + str(EVIDENCE))
print('KORWARD_DRIBBLE_RENDERS=' + str(OUT))
