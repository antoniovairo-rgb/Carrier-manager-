import bpy, sys, os
src, dst = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
assign = {
    'mesh_rep_0_ori_repair_quad': 'HyperLegLeft',
    'mesh_rep_0_ori_repair_quad.001': 'HyperLegRight',
    'mesh_rep_0_ori_repair_quad.002': 'HyperShirt',
    'mesh_rep_0_ori_repair_quad.005': 'HyperShorts',
}
for obj_name, material_name in assign.items():
    obj=bpy.data.objects.get(obj_name)
    if obj is None or not obj.material_slots or obj.material_slots[0].material is None:
        raise RuntimeError('missing mesh or material: '+obj_name)
    obj.material_slots[0].material.name=material_name
# [23/09 POC] MATERIALI: niente BLEND nel GLB. Con alphaMode BLEND + doubleSided il kit si ordina male ("a chiazze").
# Blender < 4.2 usa blend_method, >= 4.2 surface_render_method: si impostano entrambi se esistono.
# Il giudice resta il file esportato: `node tools/glb-materiali.mjs verifica <out.glb>` (esce 1 su BLEND);
# se serve, `node tools/glb-materiali.mjs correggi <in.glb> <out.glb>`.
for _mat in bpy.data.materials:
    if hasattr(_mat, "blend_method"):
        _mat.blend_method = "CLIP"
    if hasattr(_mat, "surface_render_method"):
        _mat.surface_render_method = "DITHERED"
bpy.ops.object.select_all(action='SELECT')
os.makedirs(os.path.dirname(dst),exist_ok=True)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animations=True, export_yup=True)
print('KIT_ADAPTER_EXPORTED='+dst)
