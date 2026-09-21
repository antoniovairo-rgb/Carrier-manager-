"""Build a local, animated LOD0 CGTrader Ajax-kit review artifact.

The red band is baked from a material mask onto the original shirt UV.  No new
mesh, panel, hair or body part is authored.  This is review-only and is not
referenced by the game renderer.
"""
import bpy
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT / 'assets' / 'cgtrader-review-lod0-kit-adapter.glb'
TEXTURE = PROJECT / 'assets' / 'cgtrader-ajax-shirt-review.png'
OUTPUT = PROJECT / 'assets' / 'cgtrader-review-lod0-ajax-kit-review.glb'

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
shirt_obj = bpy.data.objects.get('mesh_rep_0_ori_repair_quad.002')
if shirt_obj is None:
    raise RuntimeError('CGTrader shirt mesh missing')
shirt = bpy.data.materials.get('HyperShirt')
if shirt is None:
    raise RuntimeError('CGTrader HyperShirt material missing')
shirt = shirt.copy()
shirt.name = 'CGTrader_Ajax_Baked_Shirt_Review'
shirt_obj.material_slots[0].material = shirt
nodes, links = shirt.node_tree.nodes, shirt.node_tree.links
bsdf = next(node for node in nodes if node.type == 'BSDF_PRINCIPLED')
source_texture = next(node for node in nodes if node.type == 'TEX_IMAGE')
for link in list(bsdf.inputs['Base Color'].links):
    links.remove(link)
coords = nodes.new('ShaderNodeTexCoord')
separate = nodes.new('ShaderNodeSeparateXYZ')
greater = nodes.new('ShaderNodeMath')
less = nodes.new('ShaderNodeMath')
mask = nodes.new('ShaderNodeMath')
geometry = nodes.new('ShaderNodeNewGeometry')
normal = nodes.new('ShaderNodeSeparateXYZ')
front = nodes.new('ShaderNodeMath')
final_mask = nodes.new('ShaderNodeMath')
mix = nodes.new('ShaderNodeMixRGB')
greater.operation, less.operation, mask.operation = 'GREATER_THAN', 'LESS_THAN', 'MULTIPLY'
front.operation, final_mask.operation = 'LESS_THAN', 'MULTIPLY'
front.inputs[1].default_value = 0.0
greater.inputs[1].default_value = .385
less.inputs[1].default_value = .615
mix.inputs[2].default_value = (.38, .002, .006, 1.0)
links.new(coords.outputs['Generated'], separate.inputs[0])
links.new(separate.outputs['X'], greater.inputs[0])
links.new(separate.outputs['X'], less.inputs[0])
links.new(greater.outputs[0], mask.inputs[0])
links.new(less.outputs[0], mask.inputs[1])
links.new(geometry.outputs['Position'], normal.inputs[0])
links.new(normal.outputs['Y'], front.inputs[0])
links.new(mask.outputs[0], final_mask.inputs[0])
links.new(front.outputs[0], final_mask.inputs[1])
links.new(final_mask.outputs[0], mix.inputs[0])
links.new(source_texture.outputs['Color'], mix.inputs[1])

output = next(node for node in nodes if node.type == 'OUTPUT_MATERIAL')
emission = nodes.new('ShaderNodeEmission')
links.new(mix.outputs['Color'], emission.inputs['Color'])
links.new(emission.outputs['Emission'], output.inputs['Surface'])
baked = bpy.data.images.new('cgtrader-ajax-shirt-review', 1024, 1024, alpha=True)
bake_node = nodes.new('ShaderNodeTexImage')
bake_node.image = baked
nodes.active = bake_node
bpy.ops.object.select_all(action='DESELECT')
shirt_obj.select_set(True)
bpy.context.view_layer.objects.active = shirt_obj
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 1
scene.render.bake.margin = 8
bpy.ops.object.bake(type='EMIT', margin=8, use_clear=True)
baked.filepath_raw = str(TEXTURE)
baked.file_format = 'PNG'
baked.save()
# Replace preview nodes with a normal image-textured PBR material that GLB exports.
for node in list(nodes):
    nodes.remove(node)
out = nodes.new('ShaderNodeOutputMaterial')
base = nodes.new('ShaderNodeBsdfPrincipled')
base.inputs['Roughness'].default_value = .48
image = nodes.new('ShaderNodeTexImage')
image.image = baked
links.new(image.outputs['Color'], base.inputs['Base Color'])
links.new(base.outputs['BSDF'], out.inputs['Surface'])
for obj in bpy.context.scene.objects:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUTPUT), export_format='GLB', use_selection=True,
                          export_animations=True, export_animation_mode='ACTIONS', export_apply=True,
                          export_yup=True)
print('KORWARD_AJAX_TEXTURE=' + str(TEXTURE))
print('KORWARD_AJAX_LOD0_REVIEW=' + str(OUTPUT))