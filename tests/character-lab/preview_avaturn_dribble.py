"""Visual-only local dribble probe: Korward regular animation -> Avaturn sample.

Run: blender -b --python preview_avaturn_dribble.py -- animated-source.glb avaturn-sample.glb output-dir
No game asset is changed or exported.
"""
import bpy
import json
import sys
from pathlib import Path
from mathutils import Vector

animated_path, avatar_path, output_dir = sys.argv[sys.argv.index("--") + 1 :]
output_dir = Path(output_dir).resolve()
output_dir.mkdir(parents=True, exist_ok=True)

MAPPING = {
    "pelvis": "Hips", "spine_01": "Spine", "spine_02": "Spine1", "spine_03": "Spine2",
    "neck_01": "Neck", "Head": "Head",
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
animated_armature = next(obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE")
animated_objects = set(bpy.context.scene.objects)
source_action = animated_armature.animation_data.action if animated_armature.animation_data else None
if source_action is None:
    raise RuntimeError("Korward dribble action missing")

bpy.ops.import_scene.gltf(filepath=avatar_path)
avatar_armature = next(obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE" and obj != animated_armature)
avatar_objects = [obj for obj in bpy.context.scene.objects if obj not in animated_objects]
avatar_meshes = [obj for obj in avatar_objects if obj.type == "MESH"]
for obj in list(animated_objects):
    if obj != animated_armature:
        bpy.data.objects.remove(obj, do_unlink=True)

missing_animated = sorted(name for name in MAPPING if name not in animated_armature.pose.bones)
missing_avatar = sorted(name for name in MAPPING.values() if name not in avatar_armature.pose.bones)
if missing_animated or missing_avatar:
    raise RuntimeError(json.dumps({"missing_animated": missing_animated, "missing_avatar": missing_avatar}))

for source_name, target_name in MAPPING.items():
    if source_name == "pelvis":
        continue
    bone = avatar_armature.pose.bones[target_name]
    constraint = bone.constraints.new("COPY_ROTATION")
    constraint.name = "KORWARD_AVATURN_LOCAL_DRIBBLE_PROBE"
    constraint.target = animated_armature
    constraint.subtarget = source_name
    constraint.owner_space = "LOCAL"
    constraint.target_space = "LOCAL"
    constraint.mix_mode = "REPLACE"

points = [obj.matrix_world @ Vector(corner) for obj in avatar_meshes for corner in obj.bound_box]
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
    captures.append({"frame": frame, "file": str(output)})

report = {
    "purpose": "visual-only Korward regular rig to Avaturn sample; no game export",
    "source_action": source_action.name,
    "source_range": list(source_action.frame_range),
    "mapping_count": len(MAPPING),
    "applied_rotation_constraints": len(MAPPING) - 1,
    "missing_animated": missing_animated,
    "missing_avatar": missing_avatar,
    "root_translation": "disabled for first arm/leg pose review",
    "captures": captures,
}
(output_dir / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print("KORWARD_AVATURN_DRIBBLE_PROBE=" + json.dumps({"action": source_action.name, "mapping_count": len(MAPPING), "frames": frames, "output": str(output_dir)}))
