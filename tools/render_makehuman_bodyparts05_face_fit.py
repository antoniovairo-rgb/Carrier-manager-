"""Visual-only fit gate for CC0 MakeHuman Bodyparts 05 on the CGTrader face."""
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
PLAYER = ROOT / "assets/source/cgtrader-soccer-player/BLENDER+RIG.blend"
ASSETS = Path(r"C:\Users\a.vairo\AppData\Local\Temp\makehuman-bodyparts05-cc0\clothes")
OUT = ROOT / "tests/character-lab/makehuman-bodyparts05-fit"
VIEWS = {"front": Vector((0.0, -3.1, 1.56)), "three_quarter": Vector((-2.2, -2.2, 1.56))}

def bounds(obj):
    ps = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return Vector((min(p.x for p in ps), min(p.y for p in ps), min(p.z for p in ps))), Vector((max(p.x for p in ps), max(p.y for p in ps), max(p.z for p in ps)))

def look_at(camera, target):
    camera.rotation_euler = (target-camera.location).to_track_quat('-Z','Y').to_euler()

def import_mesh(path):
    before=set(bpy.data.objects)
    bpy.ops.wm.obj_import(filepath=str(path))
    meshes=[o for o in set(bpy.data.objects)-before if o.type=='MESH']
    if len(meshes)!=1: raise RuntimeError(f'{path}: expected 1 mesh, got {len(meshes)}')
    return meshes[0]

OUT.mkdir(parents=True, exist_ok=True)
for directory in sorted(p for p in ASSETS.iterdir() if p.is_dir()):
    obj_path=next(directory.glob('*.obj'))
    bpy.ops.wm.open_mainfile(filepath=str(PLAYER))
    asset=import_mesh(obj_path); asset.name='MakeHumanBodyparts05_'+directory.name
    head=bpy.data.objects['part_00000001.005']
    hmin,hmax=bounds(head); amin,amax=bounds(asset)
    width=max(amax.x-amin.x, 1e-6); factor=(hmax.x-hmin.x)*0.82/width
    asset.scale=tuple(v*factor for v in asset.scale); bpy.context.view_layer.update(); amin,amax=bounds(asset)
    hheight=hmax.z-hmin.z
    # Front of this source face is -Y. Align asset's upper edge at moustache level;
    # this deliberately gives full beards a strict direct-fit test instead of reshaping them.
    asset.location += Vector(((hmin.x+hmax.x-amin.x-amax.x)*0.5, hmin.y-amin.y-0.012, hmin.z+hheight*0.77-amax.z))
    bpy.context.view_layer.update()
    mat=bpy.data.materials.new(directory.name+'_review_dark'); mat.diffuse_color=(0.028,0.010,0.004,1); mat.use_nodes=True
    bsdf=mat.node_tree.nodes.get('Principled BSDF'); bsdf.inputs['Base Color'].default_value=(0.028,0.010,0.004,1); bsdf.inputs['Roughness'].default_value=.72
    asset.data.materials.clear(); asset.data.materials.append(mat)
    for o in bpy.context.scene.objects:
        if o.type=='MESH' and o.name.startswith('cs_'): o.hide_render=True
        if o.type=='CAMERA': bpy.data.objects.remove(o,do_unlink=True)
    camera_data=bpy.data.cameras.new('review_camera'); camera=bpy.data.objects.new('review_camera',camera_data); bpy.context.collection.objects.link(camera); camera_data.type='ORTHO'; camera_data.ortho_scale=.9
    scene=bpy.context.scene; scene.world=bpy.data.worlds.new('ReviewWorld'); scene.world.color=(.055,.055,.07); scene.render.engine='BLENDER_WORKBENCH'; scene.display.shading.light='STUDIO'; scene.display.shading.studio_light='rim.sl'; scene.display.shading.color_type='MATERIAL'; scene.display.shading.show_shadows=True; scene.display.shading.show_cavity=True; scene.render.resolution_x=640;scene.render.resolution_y=640;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.camera=camera
    for view,loc in VIEWS.items():
        camera.location=loc;look_at(camera,Vector((0,0,1.53)));scene.render.filepath=str(OUT/f'{directory.name}-{view}.png');bpy.ops.render.render(write_still=True)

