"""Render one frame from a shipped Regular animation clip for audit only."""
import bpy
import os
import sys
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
clip_name, frame, output = args[0], int(args[1]), args[2]
arm_test = args[3:]  # Optional: axis and radians, for non-shipping pose inspection.
repo = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
base_path = os.path.join(repo, "assets", "korward-regular-player.glb")
clip_path = os.path.join(repo, "assets", "korward-regular-anims", f"regular-anim-{clip_name}.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=base_path)
base_armature = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")

bpy.ops.import_scene.gltf(filepath=clip_path)
clip_armatures = [o for o in bpy.context.scene.objects if o.type == "ARMATURE" and o != base_armature]
if not clip_armatures or not clip_armatures[-1].animation_data or not clip_armatures[-1].animation_data.action:
    raise RuntimeError(f"No animation action found in {clip_path}")
source_armature = clip_armatures[-1]
# Blender 4 actions use slots, which make a simple action copy a misleading
# preview.  Transfer the evaluated local pose for this frame bone-by-bone.
scene = bpy.context.scene
scene.frame_set(frame)
for source_bone in source_armature.pose.bones:
    target_bone = base_armature.pose.bones.get(source_bone.name)
    if target_bone:
        target_bone.matrix_basis = source_bone.matrix_basis.copy()
if arm_test:
    from mathutils import Quaternion
    axis = {"x": (1, 0, 0), "y": (0, 1, 0), "z": (0, 0, 1)}[arm_test[0]]
    angle_l = float(arm_test[1])
    angle_r = float(arm_test[2]) if len(arm_test) > 2 else angle_l
    for bone_name, angle in (("upperarm_l", angle_l), ("upperarm_r", angle_r)):
        bone = base_armature.pose.bones[bone_name]
        bone.rotation_mode = "QUATERNION"
        bone.rotation_quaternion = Quaternion(axis, angle) @ bone.rotation_quaternion
scene.view_layers[0].update()
for obj in clip_armatures:
    bpy.data.objects.remove(obj, do_unlink=True)

scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 640
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = os.path.abspath(output)
scene.world = bpy.data.worlds.new("AuditWorld")
scene.world.color = (0.055, 0.07, 0.10)

bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
floor = bpy.context.object
floor.data.materials.append(bpy.data.materials.new("AuditFloor"))
floor.data.materials[0].diffuse_color = (0.04, 0.20, 0.10, 1)

for location, energy, size in [((3, -4, 6), 1200, 4), ((-4, -1, 3), 700, 3)]:
    bpy.ops.object.light_add(type="AREA", location=location)
    bpy.context.object.data.energy = energy
    bpy.context.object.data.shape = "DISK"
    bpy.context.object.data.size = size

bpy.ops.object.camera_add(location=(4.5, -7.5, 3.2))
camera = bpy.context.object
scene.camera = camera
camera.rotation_euler = (Vector((0, 0, 1.25)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.lens = 52
bpy.ops.render.render(write_still=True)
