"""Texture-faithful close profile review for the purchased CGTrader player."""
import bpy
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/source/cgtrader-soccer-player/CHARACTER.glb'
OUT=ROOT/'tests/character-lab/cgtrader-hero-profile-card-review.png'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=str(SOURCE))
for o in list(bpy.context.scene.objects):
 if o.type in {'CAMERA','LIGHT'}: bpy.data.objects.remove(o,do_unlink=True)
def aim(o,t):o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-.86,1.64));cam=bpy.context.object;cam.data.lens=85;aim(cam,(0,0,1.62));bpy.context.scene.camera=cam
s=bpy.context.scene;s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.studiolight_rotate_z=2.45;s.display.shading.studiolight_background_alpha=1;s.display.shading.studiolight_background_blur=.6;s.display.shading.color_type='TEXTURE';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='WORLD';s.display.shading.cavity_ridge_factor=.65;s.display.shading.cavity_valley_factor=.35;s.world.color=(.018,.024,.040);s.render.resolution_x=640;s.render.resolution_y=640;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.filepath=str(OUT);bpy.ops.render.render(write_still=True);print(OUT)
