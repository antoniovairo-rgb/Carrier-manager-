"""Derive geometry LODs from the animated CGTrader review package.

The source GLB is read-only.  Every action and the complete retarget rig are
preserved, so a renderer can swap only between compatible animated variants.
Run with Blender: -- <input.glb> <output.glb> <ratio> <texture_max>.
"""
import bpy
import sys
from pathlib import Path

args = sys.argv[sys.argv.index("--") + 1:]
if len(args) != 4:
    raise SystemExit("usage: <input.glb> <output.glb> <ratio> <texture_max>")
source, output, ratio_s, texture_s = args
ratio, texture_max = float(ratio_s), int(texture_s)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=source)

armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
if len(armatures) != 1:
    raise RuntimeError(f"expected one armature, found {len(armatures)}")
rig = armatures[0]
meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.data and len(obj.data.polygons) and obj.find_armature() == rig]
if not meshes:
    raise RuntimeError("no skinned render meshes found")

for image in bpy.data.images:
    width, height = image.size
    if max(width, height) > texture_max:
        factor = texture_max / max(width, height)
        image.scale(max(1, round(width * factor)), max(1, round(height * factor)))

for obj in meshes:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    dec = obj.modifiers.new("CGTRADER_REVIEW_LOD", "DECIMATE")
    dec.ratio = ratio
    dec.decimate_type = "COLLAPSE"
    while obj.modifiers.find(dec.name) > 0:
        bpy.ops.object.modifier_move_up(modifier=dec.name)
    bpy.ops.object.modifier_apply(modifier=dec.name)

bpy.ops.object.select_all(action="DESELECT")
rig.select_set(True)
for obj in meshes:
    obj.select_set(True)
    obj.hide_set(False)

out = Path(output)
out.parent.mkdir(parents=True, exist_ok=True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(
    filepath=str(out), export_format="GLB", use_selection=True,
    export_animations=True, export_skins=True, export_yup=True,
    export_materials="EXPORT", export_image_format="AUTO",
)
print(f"REVIEW_LOD_EXPORT {out}")
print(f"REVIEW_LOD_RATIO {ratio}")
print(f"REVIEW_LOD_BONES {len(rig.data.bones)}")
print(f"REVIEW_LOD_ACTIONS {len(bpy.data.actions)}")
print(f"REVIEW_LOD_TRIANGLES {sum(len(obj.data.polygons) for obj in meshes)}")