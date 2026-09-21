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
bpy.ops.object.select_all(action='SELECT')
os.makedirs(os.path.dirname(dst),exist_ok=True)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animations=True, export_yup=True)
print('KIT_ADAPTER_EXPORTED='+dst)
