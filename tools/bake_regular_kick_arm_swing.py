"""Bake a coordinated upper-body pass into the shipped Regular kick clip.

The source kick leaves both upper arms close to the bind T-pose.  This tool
edits the animation asset itself, preserving the game renderer and match
engine.  It is intentionally scoped to the audited `kick` clip.
"""
import bpy
import os
import sys
from math import pi, sin
from mathutils import Quaternion

args = sys.argv[sys.argv.index("--") + 1:]
source, destination = args

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(source))
rig = next(obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE")
action = rig.animation_data.action
start, end = (int(round(value)) for value in action.frame_range)

for frame in range(start, end + 1):
    bpy.context.scene.frame_set(frame)
    progress = (frame - start) / max(1, end - start)
    # In local Z, opposite signed values lower both mirrored arms.  The small
    # counter-swing peaks through the strike to balance pelvis rotation.
    swing = 0.18 * sin(progress * pi)
    for name, bias in (("upperarm_l", -0.54 + swing), ("upperarm_r", 0.54 - swing)):
        bone = rig.pose.bones[name]
        bone.rotation_mode = "QUATERNION"
        bone.rotation_quaternion = Quaternion((0, 0, 1), bias) @ bone.rotation_quaternion
        bone.keyframe_insert(data_path="rotation_quaternion", frame=frame)
    # A slight elbow flex prevents a rigid straight-line silhouette while
    # keeping hands clear of the ball path.
    for name, bias in (("lowerarm_l", 0.13), ("lowerarm_r", -0.13)):
        bone = rig.pose.bones[name]
        bone.rotation_mode = "QUATERNION"
        bone.rotation_quaternion = Quaternion((0, 0, 1), bias) @ bone.rotation_quaternion
        bone.keyframe_insert(data_path="rotation_quaternion", frame=frame)

bpy.context.scene.frame_set(start)
bpy.ops.object.select_all(action="DESELECT")
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(
    filepath=os.path.abspath(destination), export_format="GLB", use_selection=True,
    export_animations=True, export_animation_mode="ACTIONS", export_skins=True,
    export_materials="NONE", export_def_bones=True,
)
