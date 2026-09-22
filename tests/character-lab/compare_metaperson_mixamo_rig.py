"""Compare the official MetaPerson sample skeleton with the local Mixamo source.

Run: blender -b --python compare_metaperson_mixamo_rig.py -- source.glb target.fbx report.json
"""

import bpy
import json
import re
import sys
from pathlib import Path


source, target, output = sys.argv[sys.argv.index("--") + 1 :]


def armature_bones():
    return [bone.name for obj in bpy.context.scene.objects if obj.type == "ARMATURE" for bone in obj.data.bones]


def semantic(name):
    return re.sub(r"^mixamorig\d*:", "", name)


bpy.ops.import_scene.gltf(filepath=source)
source_names = armature_bones()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=target)
target_names = armature_bones()

source_semantic = set(map(semantic, source_names))
target_semantic = set(target_names)
core = {
    "Hips", "Spine", "Spine1", "Spine2", "Neck", "Head",
    "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
    "RightShoulder", "RightArm", "RightForeArm", "RightHand",
    "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase",
    "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase",
}
report = {
    "source_bones": len(source_semantic),
    "target_bones": len(target_semantic),
    "shared": sorted(source_semantic & target_semantic),
    "source_missing_in_target": sorted(source_semantic - target_semantic),
    "target_extra": sorted(target_semantic - source_semantic),
    "core_required": sorted(core),
    "core_missing_in_target": sorted(core - target_semantic),
}
Path(output).write_text(json.dumps(report, indent=2), encoding="utf-8")
print("KORWARD_METAPERSON_MIXAMO_COMPAT=" + json.dumps({
    "source_bones": report["source_bones"],
    "target_bones": report["target_bones"],
    "shared": len(report["shared"]),
    "core_missing_in_target": report["core_missing_in_target"],
    "output": output,
}))
