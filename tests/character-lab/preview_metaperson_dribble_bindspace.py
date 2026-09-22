"""Bind-space visual dribble probe for the official MetaPerson sample.

For each mapped bone, transfer the evaluated source rotation delta from the
source rest matrix to the target rest matrix. It is intentionally local-only:
no model export, root-motion, ball or game integration is performed.

Run: blender -b --python preview_metaperson_dribble_bindspace.py -- target.fbx source.glb output-dir
"""

import bpy
import json
import sys
from pathlib import Path
from mathutils import Matrix, Vector


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
SUCCESSOR = {
    "Hips": "Spine", "Spine": "Spine1", "Spine1": "Spine2", "Spine2": "Neck", "Neck": "Head",
    "LeftShoulder": "LeftArm", "LeftArm": "LeftForeArm", "LeftForeArm": "LeftHand",
    "RightShoulder": "RightArm", "RightArm": "RightForeArm", "RightForeArm": "RightHand",
    "LeftUpLeg": "LeftLeg", "LeftLeg": "LeftFoot", "LeftFoot": "LeftToeBase",
    "RightUpLeg": "RightLeg", "RightLeg": "RightFoot", "RightFoot": "RightToeBase",
}


def only_armature():
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1:
        raise RuntimeError(f"Expected one imported armature, found {len(armatures)}")
    return armatures[0]


bpy.ops.import_scene.fbx(filepath=target_path)
target_armature = only_armature()
target_objects = set(bpy.context.scene.objects)
target_meshes = [obj for obj in target_objects if obj.type == "MESH"]
bpy.ops.import_scene.gltf(filepath=source_path)
source_armature = next(obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE" and obj != target_armature)
for obj in list(bpy.context.scene.objects):
    if obj not in target_objects and obj != source_armature:
        bpy.data.objects.remove(obj, do_unlink=True)

missing_target = sorted(target for target in MAPPING if target not in target_armature.pose.bones)
missing_source = sorted(source for source in MAPPING.values() if source not in source_armature.pose.bones)
if missing_target or missing_source:
    raise RuntimeError(json.dumps({"missing_target": missing_target, "missing_source": missing_source}))
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
camera_position[view_axis] = low[view_axis] - height * 2.4
bpy.ops.object.camera_add(location=camera_position)
camera = bpy.context.object
camera.data.lens = 54
camera_target = center.copy()
camera_target[vertical_axis] += height * 0.05
camera.rotation_euler = (camera_target - camera.location).to_track_quat("-Z", "Y").to_euler()
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


def rest_position(armature, bone_name):
    return armature.pose.bones[bone_name].bone.matrix_local.to_translation()


def calibration_for(target_name, source_name):
    successor = SUCCESSOR.get(target_name)
    if successor:
        target_a, target_b = target_name, successor
        source_a, source_b = source_name, MAPPING[successor]
    else:
        # Terminal joints preserve the previous anatomical segment direction.
        predecessor = next(name for name, child in SUCCESSOR.items() if child == target_name)
        target_a, target_b = predecessor, target_name
        source_a, source_b = MAPPING[predecessor], source_name
    target_direction = (rest_position(target_armature, target_b) - rest_position(target_armature, target_a)).normalized()
    source_direction = (rest_position(source_armature, source_b) - rest_position(source_armature, source_a)).normalized()
    return target_direction.rotation_difference(source_direction)


CALIBRATION = {target: calibration_for(target, source) for target, source in MAPPING.items()}


def apply_bind_space_delta():
    # source_bone.matrix_local and target_bone.matrix_local are absolute rest
    # matrices in their respective armature spaces. The evaluated pose delta is
    # transported into target rest orientation without copying incompatible axes.
    for target_name, source_name in MAPPING.items():
        source_pose = source_armature.pose.bones[source_name]
        target_pose = target_armature.pose.bones[target_name]
        source_rest = source_pose.bone.matrix_local.to_4x4()
        target_rest = target_pose.bone.matrix_local.to_4x4()
        delta_rotation = source_pose.matrix.to_quaternion() @ source_rest.to_quaternion().inverted()
        target_rotation = delta_rotation @ CALIBRATION[target_name] @ target_rest.to_quaternion()
        target_pose.matrix = Matrix.LocRotScale(target_rest.to_translation(), target_rotation, target_rest.to_scale())
    bpy.context.view_layer.update()


frames = [0, 10, 21, 32, 41]
captures = []
for frame in frames:
    scene.frame_set(frame)
    apply_bind_space_delta()
    output = output_dir / f"dribble-{frame:02d}.png"
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)
    captures.append({"frame": frame, "file": str(output)})

report = {
    "purpose": "bind-space visual-only local rig probe; no game export",
    "source_action": source_action.name,
    "source_range": list(source_action.frame_range),
    "mapping_count": len(MAPPING),
    "missing_target": missing_target,
    "missing_source": missing_source,
    "root_translation": "disabled",
    "method": "evaluated source pose rotation * inverse(source rest rotation) * calibrated anatomical swing * target rest rotation",
    "captures": captures,
}
(output_dir / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print("KORWARD_METAPERSON_BINDSPACE_PROBE=" + json.dumps({
    "action": source_action.name,
    "mapping_count": len(MAPPING),
    "frames": frames,
    "output": str(output_dir),
}))
