"""Visual-only local dribble probe: regular rig animation -> MetaPerson sample.

It never exports the sample or changes game assets. The transfer uses local
rotation constraints only, so a visual failure is evidence against the mapping
rather than an attempt to force a result through hand-tuned offsets.

Run: blender -b --python preview_metaperson_dribble.py -- target.fbx source.glb output-dir
"""

import bpy
import json
import sys
from pathlib import Path
from mathutils import Vector


target_path, source_path, output_dir = sys.argv[sys.argv.index("--") + 1 :]
output_dir = Path(output_dir).resolve()
output_dir.mkdir(parents=True, exist_ok=True)

MAPPING = {
    "Hips": "pelvis", "Spine": "spine_01", "Spine1": "spine_02", "Spine2": "spine_03",
    "Neck": "neck_01", "Head": "Head",
    "LeftShoulder": "clavicle_l", "LeftArm": "upperarm_l", "LeftForeArm": "lowerarm_l", "LeftHand": "hand_l",
    "RightShoulder": "clavicle_r", "RightArm": "upperarm_r", "RightForeArm": "lowerarm_r", "RightHand": "hand_r",
    "LeftUpLeg": "thigh_l", "LeftLeg": "calf_l", "LeftFoot": "foot_l", "LeftToeBase": "ball_l",
    "RightUpLeg": "thigh_r", "RightLeg": "calf_r", "RightFoot": "foot_r", "RightToeBase": "ball_r",
}
for side, suffix in (("Left", "l"), ("Right", "r")):
    for finger in ("Thumb", "Index", "Middle", "Ring", "Pinky"):
        source_finger = finger.lower()
        for index in range(1, 5):
            MAPPING[f"{side}Hand{finger}{index}"] = f"{source_finger}_{index:02d}_{suffix}" if index < 4 else f"{source_finger}_04_leaf_{suffix}"


def find_armature():
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1:
        raise RuntimeError(f"Expected one imported armature, found {len(armatures)}")
    return armatures[0]


bpy.ops.import_scene.fbx(filepath=target_path)
target_armature = find_armature()
target_objects = set(bpy.context.scene.objects)
target_meshes = [obj for obj in target_objects if obj.type == "MESH"]

bpy.ops.import_scene.gltf(filepath=source_path)
armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
source_armature = next(obj for obj in armatures if obj != target_armature)
# Retain only the source armature/action. Source visual meshes would otherwise
# contaminate a render intended to judge the target character.
for obj in list(bpy.context.scene.objects):
    if obj not in target_objects and obj != source_armature:
        bpy.data.objects.remove(obj, do_unlink=True)

missing_target = sorted(target for target in MAPPING if target not in target_armature.pose.bones)
missing_source = sorted(source for source in MAPPING.values() if source not in source_armature.pose.bones)
if missing_target or missing_source:
    raise RuntimeError(json.dumps({"missing_target": missing_target, "missing_source": missing_source}))

for target_name, source_name in MAPPING.items():
    if target_name == "Hips":
        # Source and target use different pelvis rest axes. Root rotation needs
        # calibrated bind-space transfer, not a blind local copy.
        continue
    pose_bone = target_armature.pose.bones[target_name]
    constraint = pose_bone.constraints.new("COPY_ROTATION")
    constraint.name = "KORWARD_LOCAL_DRIBBLE_PROBE"
    constraint.target = source_armature
    constraint.subtarget = source_name
    constraint.owner_space = "LOCAL"
    constraint.target_space = "LOCAL"
    constraint.mix_mode = "REPLACE"

# Keep the hero in place. The action's rotations, including arm counterbalance,
# are the subject of this review; root translation is tested separately with ball.
source_action = source_armature.animation_data.action if source_armature.animation_data else None
if source_action is None:
    raise RuntimeError("Source dribble action missing")

points = [obj.matrix_world @ Vector(corner) for obj in target_meshes for corner in obj.bound_box]
low = Vector(tuple(min(point[index] for point in points) for index in range(3)))
high = Vector(tuple(max(point[index] for point in points) for index in range(3)))
center = (low + high) * 0.5
spans = high - low
vertical_axis = max(range(3), key=lambda index: spans[index])
view_axis = min(range(3), key=lambda index: spans[index])
height = spans[vertical_axis]
camera_position = center.copy()
camera_position[view_axis] = low[view_axis] - height * 2.35
bpy.ops.object.camera_add(location=camera_position)
camera = bpy.context.object
camera.data.lens = 54
target = center.copy()
target[vertical_axis] += height * 0.05
camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
bpy.context.scene.camera = camera

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "TEXTURE"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = "WORLD"
scene.world.color = (0.025, 0.035, 0.06)
scene.render.resolution_x = 512
scene.render.resolution_y = 768
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"

frames = [0, 10, 21, 32, 41]
captures = []
for frame in frames:
    scene.frame_set(frame)
    output = output_dir / f"dribble-{frame:02d}.png"
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)
    left_hand = target_armature.pose.bones["LeftHand"].head.copy()
    right_hand = target_armature.pose.bones["RightHand"].head.copy()
    left_foot = target_armature.pose.bones["LeftFoot"].head.copy()
    right_foot = target_armature.pose.bones["RightFoot"].head.copy()
    captures.append({
        "frame": frame,
        "file": str(output),
        "left_hand": [round(value, 5) for value in left_hand],
        "right_hand": [round(value, 5) for value in right_hand],
        "left_foot": [round(value, 5) for value in left_foot],
        "right_foot": [round(value, 5) for value in right_foot],
    })

report = {
    "purpose": "visual-only local rig probe; no game export",
    "source_action": source_action.name,
    "source_range": list(source_action.frame_range),
    "mapping_count": len(MAPPING),
    "applied_rotation_constraints": len(MAPPING) - 1,
    "missing_target": missing_target,
    "missing_source": missing_source,
    "root_translation": "disabled for this first arm/leg pose review",
    "captures": captures,
}
(output_dir / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print("KORWARD_METAPERSON_DRIBBLE_PROBE=" + json.dumps({
    "action": source_action.name,
    "mapping_count": len(MAPPING),
    "frames": frames,
    "output": str(output_dir),
}))
