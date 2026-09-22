"""Read-only inventory for official MetaPerson rendering-sample FBX files.

Run with Blender:
  blender -b --python inspect_metaperson_public_sample.py -- <input.fbx> <report.json>

The script only imports a sample into Blender's transient scene and writes an
audit report. It does not export, alter, or integrate the sample asset.
"""

import bpy
import json
import sys
from pathlib import Path


args = sys.argv[sys.argv.index("--") + 1 :]
source = Path(args[0])
output = Path(args[1])

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=str(source))


def triangles(obj):
    obj.data.calc_loop_triangles()
    return len(obj.data.loop_triangles)


meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
report = {
    "source": str(source),
    "mesh_count": len(meshes),
    "triangles": sum(triangles(obj) for obj in meshes),
    "vertices": sum(len(obj.data.vertices) for obj in meshes),
    "armatures": [
        {
            "name": obj.name,
            "bone_count": len(obj.data.bones),
            "bone_names": [bone.name for bone in obj.data.bones],
        }
        for obj in armatures
    ],
    "meshes": [
        {
            "name": obj.name,
            "triangles": triangles(obj),
            "vertices": len(obj.data.vertices),
            "materials": [slot.material.name if slot.material else None for slot in obj.material_slots],
            "shape_key_count": len(obj.data.shape_keys.key_blocks) if obj.data.shape_keys else 0,
        }
        for obj in meshes
    ],
    "image_sizes": sorted(
        [{"name": image.name, "size": list(image.size)} for image in bpy.data.images],
        key=lambda image: image["name"],
    ),
}
output.write_text(json.dumps(report, indent=2), encoding="utf-8")
print("KORWARD_METAPERSON_SAMPLE_AUDIT=" + json.dumps({
    "triangles": report["triangles"],
    "vertices": report["vertices"],
    "mesh_count": report["mesh_count"],
    "bone_count": report["armatures"][0]["bone_count"] if report["armatures"] else 0,
    "output": str(output),
}))
