import bpy
import sys
from pathlib import Path
from mathutils import Vector
PROJECT=Path(r'C:\Users\a.vairo\Documents\ChatGPT\Analisi gioco codex\korward-poc')
args=sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
lod=args[0] if args else 'lod1'
if lod not in {'lod1','lod2','lod1r60','review-lod1','review-lod2'}:
    raise ValueError('Expected lod1, lod1r60, lod2, review-lod1 or review-lod2')
LOG=PROJECT/'tests'/'character-lab'/f'cgtrader-{lod}-render.log'
def note(s):
    print(s, flush=True)
    with LOG.open('a', encoding='utf-8') as f: f.write(s+'\n')
LOG.write_text('',encoding='utf-8')
note('begin')
OUT=PROJECT/'tests'/'character-lab'/f'cgtrader-{lod}-review.png'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
asset_name = ('cgtrader-player-lod1-r60-review.glb' if lod == 'lod1r60' else (f'cgtrader-{lod}.glb' if lod.startswith('review-') else f'cgtrader-player-{lod}.glb'))
bpy.ops.import_scene.gltf(filepath=str(PROJECT/'assets'/asset_name))
note('imported')
note('cleared')
def aim(o,t): o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-7.0,1.15));cam=bpy.context.object;cam.data.lens=50;aim(cam,(0,0,0.92));bpy.context.scene.camera=cam
for loc,energy,size in [((2.5,-3,3.4),900,2.8),((-2.4,-2,2.2),450,2.2),((0,1.8,2.5),500,2.0)]:
    bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=energy;l.data.size=size;aim(l,(0,0,1.1))
note('camera-lights')
sc=bpy.context.scene;sc.render.engine='BLENDER_WORKBENCH';sc.display.shading.light='STUDIO';sc.display.shading.color_type='MATERIAL';sc.render.resolution_x=480;sc.render.resolution_y=600;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG';sc.render.filepath=str(OUT);sc.world.color=(.018,.022,.03)
note('before-render')
bpy.ops.render.render(write_still=True)
note('after-render '+str(OUT))
