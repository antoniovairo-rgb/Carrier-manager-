"""Render a texture-faithful Ajax-kit review from the purchased CGTrader source.

Review only: uses the original shirt mesh and its existing texture.  The red
centre band is a Blender material mask derived from object-space X, so no
new panels, hair, body geometry or runtime artifact is introduced.
"""
import bpy
from pathlib import Path
from mathutils import Vector

PROJECT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT / 'assets' / 'source' / 'cgtrader-soccer-player' / 'CHARACTER.glb'
OUTPUT = PROJECT / 'tests' / 'character-lab' / 'cgtrader-ajax-material-review.png'

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))

# CHARACTER.glb contains one player mesh and an unrelated source cube.
player = bpy.data.objects.get('mesh_rep_0_ori_repair_quad.002')
source_cube = bpy.data.objects.get('Cube')
if player is None:
    raise RuntimeError('CGTrader player mesh not found')
if source_cube:
    source_cube.hide_render = True
for obj in list(bpy.context.scene.objects):
    if obj.type in {'CAMERA', 'LIGHT'}:
        bpy.data.objects.remove(obj, do_unlink=True)

shirt_slot = next((slot for slot in player.material_slots if slot.material and any(
    node.type == 'TEX_IMAGE' and node.image and node.image.name == 'tshirt'
    for node in slot.material.node_tree.nodes)), None)
if shirt_slot is None:
    raise RuntimeError('CGTrader shirt material not found')

# The source UV atlas interleaves front islands.  A painted rectangle produced
# two patches, so this is deliberately a material-only visual proof instead.
shirt = shirt_slot.material.copy()
shirt.name = 'CGTrader_Ajax_Material_Review'
shirt_slot.material = shirt
nodes, links = shirt.node_tree.nodes, shirt.node_tree.links
bsdf = next(node for node in nodes if node.type == 'BSDF_PRINCIPLED')
texture = next(node for node in nodes if node.type == 'TEX_IMAGE')
for link in list(bsdf.inputs['Base Color'].links):
    links.remove(link)
coords = nodes.new('ShaderNodeTexCoord')
separate = nodes.new('ShaderNodeSeparateXYZ')
greater = nodes.new('ShaderNodeMath')
less = nodes.new('ShaderNodeMath')
mask = nodes.new('ShaderNodeMath')
mix = nodes.new('ShaderNodeMixRGB')
greater.operation, less.operation, mask.operation = 'GREATER_THAN', 'LESS_THAN', 'MULTIPLY'
greater.inputs[1].default_value = .385
less.inputs[1].default_value = .615
mix.inputs[2].default_value = (.38, .002, .006, 1.0)
links.new(coords.outputs['Generated'], separate.inputs[0])
links.new(separate.outputs['X'], greater.inputs[0])
links.new(separate.outputs['X'], less.inputs[0])
links.new(greater.outputs[0], mask.inputs[0])
links.new(less.outputs[0], mask.inputs[1])
links.new(mask.outputs[0], mix.inputs[0])
links.new(texture.outputs['Color'], mix.inputs[1])
links.new(mix.outputs['Color'], bsdf.inputs['Base Color'])

def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

bpy.ops.object.camera_add(location=(0, -5.1, 1.55))
camera = bpy.context.object
camera.data.lens = 60
look_at(camera, (0, 0, 1.15))
bpy.context.scene.camera = camera
for location, energy, size in [((2.5, -3.5, 3.8), 1050, 2.2), ((-2, -2, 2.4), 650, 2.5), ((0, 1.2, 3), 500, 2)]:
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size = energy, 'DISK', size
    look_at(light, (0, 0, 1.2))

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x, scene.render.resolution_y = 600, 750
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (.025, .035, .055)
scene.render.filepath = str(OUTPUT)
bpy.ops.render.render(write_still=True)
print('KORWARD_AJAX_MATERIAL_REVIEW=' + str(OUTPUT))