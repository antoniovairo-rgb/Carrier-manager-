"""Validate that CGTrader LOD GLBs preserve the runtime skin contract."""
import json
import struct
import sys
from pathlib import Path


TYPE_SIZE = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
TYPE_COUNT = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def load(path):
    raw = path.read_bytes()
    if raw[:4] != b"glTF":
        raise ValueError(f"Not a GLB: {path}")
    json_length = struct.unpack_from("<I", raw, 12)[0]
    return json.loads(raw[20:20 + json_length]), raw[28 + json_length:]


def accessor_bytes(doc, binary, index):
    accessor = doc["accessors"][index]
    view = doc["bufferViews"][accessor["bufferView"]]
    component_bytes = TYPE_SIZE[accessor["componentType"]]
    item_bytes = component_bytes * TYPE_COUNT[accessor["type"]]
    stride = view.get("byteStride", item_bytes)
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    return accessor, binary, offset, stride, item_bytes


def check(path):
    doc, binary = load(path)
    if len(doc.get("skins", [])) != 1:
        raise AssertionError(f"{path.name}: expected exactly one skin")
    skin = doc["skins"][0]
    names = [doc["nodes"][joint].get("name", "") for joint in skin["joints"]]
    primitives = [p for mesh in doc.get("meshes", []) for p in mesh.get("primitives", [])]
    for primitive in primitives:
        attrs = primitive.get("attributes", {})
        if not {"POSITION", "JOINTS_0", "WEIGHTS_0"}.issubset(attrs):
            raise AssertionError(f"{path.name}: primitive missing skin attributes")
        positions = doc["accessors"][attrs["POSITION"]]["count"]
        joints = doc["accessors"][attrs["JOINTS_0"]]["count"]
        weights = doc["accessors"][attrs["WEIGHTS_0"]]["count"]
        if positions != joints or positions != weights:
            raise AssertionError(f"{path.name}: vertex/skin accessor counts diverge")
        a, raw, offset, stride, item_bytes = accessor_bytes(doc, binary, attrs["JOINTS_0"])
        if a["componentType"] not in {5121, 5123}:
            raise AssertionError(f"{path.name}: unsupported joint component type")
        max_joint = 0
        fmt = "<" + ("B" if a["componentType"] == 5121 else "H") * 4
        for vertex in range(a["count"]):
            max_joint = max(max_joint, *struct.unpack_from(fmt, raw, offset + vertex * stride))
        if max_joint >= len(names):
            raise AssertionError(f"{path.name}: joint index {max_joint} is outside skin")
    animations = []
    for animation in doc.get("animations", []):
        ranges = []
        for sampler in animation.get("samplers", []):
            accessor = doc["accessors"][sampler["input"]]
            minimum, maximum = accessor.get("min"), accessor.get("max")
            if minimum and maximum:
                ranges.append((float(minimum[0]), float(maximum[0])))
        if ranges:
            start, end = min(item[0] for item in ranges), max(item[1] for item in ranges)
        else:
            start = end = 0.0
        animations.append((animation.get("name", ""), len(animation.get("channels", [])), round(end - start, 6)))
    return {"asset": path.name, "joint_names": names, "primitive_count": len(primitives), "animations": animations}


if __name__ == "__main__":
    reports = [check(Path(argument)) for argument in sys.argv[1:]]
    baseline = reports[0]["joint_names"]
    baseline_animations = reports[0]["animations"]
    for report in reports[1:]:
        if report["joint_names"] != baseline:
            raise AssertionError(f"{report['asset']}: joint order differs from LOD0")
        if report["animations"] != baseline_animations:
            raise AssertionError(f"{report['asset']}: animation inventory differs from LOD0")
    print(json.dumps({"result": "PASS", "assets": [{"asset": r["asset"], "joints": len(r["joint_names"]), "primitives": r["primitive_count"], "animations": len(r["animations"])} for r in reports]}, indent=2))
