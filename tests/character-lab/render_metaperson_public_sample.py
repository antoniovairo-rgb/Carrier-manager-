"""Render an official MetaPerson sample FBX for visual evaluation only.

Run: blender -b --python render_metaperson_public_sample.py -- input.fbx output.png
"""

import bpy
import sys
from pathlib import Path
from mathutils import Vector


source, output = sys.argv[sys.argv.index("--") + 1 :]
output = str(Path(output).resolve())
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=source)

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
points = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
low = Vector(tuple(min(point[index] for point in points) for index in range(3)))
high = Vector(tuple(max(point[index] for point in points) for index in range(3)))
center = (low + high) * 0.5
spans = high - low
vertical_axis = max(range(3), key=lambda index: spans[index])
view_axis = min(range(3), key=lambda index: spans[index])
height = spans[vertical_axis]

camera_position = center.copy()
camera_position[view_axis] = low[view_axis] - height * 2.4
bpy.ops.object.camera_add(location=camera_position)
camera = bpy.context.object
camera.data.lens = 54
target = center.copy()
target[vertical_axis] += height * 0.05
camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
bpy.context.scene.camera = camera

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "TEXTURE"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = "WORLD"
scene.display.shading.curvature_ridge_factor = 1.2
scene.display.shading.curvature_valley_factor = 1.0
scene.world.color = (0.025, 0.035, 0.06)
scene.render.resolution_x = 512
scene.render.resolution_y = 768
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = output
bpy.ops.render.render(write_still=True)
print("KORWARD_METAPERSON_RENDER=" + output)
