import bpy, json, sys, math
from mathutils import Vector
source, report = sys.argv[sys.argv.index('--')+1:]
target = bpy.data.objects.get('HG_Rig')
if target is None: raise RuntimeError('HG_Rig missing')
MAPPING = {
 'spine_01':'spine','spine_02':'spine.001','spine_03':'spine.002','neck_01':'neck','Head':'head',
 'clavicle_l':'shoulder.L','upperarm_l':'upper_arm.L','lowerarm_l':'forearm.L','hand_l':'hand.L',
 'clavicle_r':'shoulder.R','upperarm_r':'upper_arm.R','lowerarm_r':'forearm.R','hand_r':'hand.R',
 'thigh_l':'thigh.L','calf_l':'shin.L','foot_l':'foot.L','ball_l':'toe.L',
 'thigh_r':'thigh.R','calf_r':'shin.R','foot_r':'foot.R','ball_r':'toe.R',
}
bpy.ops.import_scene.gltf(filepath=source)
source_arm = next(o for o in bpy.context.scene.objects if o.type=='ARMATURE' and o != target)
action = source_arm.animation_data.action if source_arm.animation_data else None
if action is None: raise RuntimeError('dribble action missing')
missing_src=sorted(x for x in MAPPING if x not in source_arm.pose.bones)
missing_dst=sorted(x for x in MAPPING.values() if x not in target.pose.bones)
if missing_src or missing_dst: raise RuntimeError(json.dumps({'missing_source':missing_src,'missing_target':missing_dst}))
for src,dst in MAPPING.items():
 c=target.pose.bones[dst].constraints.new('COPY_ROTATION'); c.target=source_arm; c.subtarget=src; c.owner_space='LOCAL'; c.target_space='LOCAL'; c.mix_mode='REPLACE'
scene=bpy.context.scene
frames=range(0,42)
tracked=['shoulder.L','shoulder.R','hand.L','hand.R','thigh.L','thigh.R','shin.L','shin.R','foot.L','foot.R','head']
samples={n:[] for n in tracked}
for f in frames:
 scene.frame_set(f); bpy.context.view_layer.update()
 for n in tracked: samples[n].append(target.matrix_world @ target.pose.bones[n].head)
def finite(name): return all(math.isfinite(v) for p in samples[name] for v in p)
def span(name): return max((a-b).length for a in samples[name] for b in samples[name])
def reach(a,b): return max((x-y).length for x,y in zip(samples[a],samples[b]))
body=bpy.data.objects['HG_Body']
pts=[body.matrix_world @ Vector(c) for c in body.bound_box]
height=max(p.z for p in pts)-min(p.z for p in pts)
out={'source_action':action.name,'mapping_count':len(MAPPING),'missing_source':missing_src,'missing_target':missing_dst,'finite':{n:finite(n) for n in tracked},'height_m':round(height,4),'motion_span_m':{n:round(span(n),4) for n in ['hand.L','hand.R','foot.L','foot.R']},'max_hand_shoulder_reach_m':{'left':round(reach('hand.L','shoulder.L'),4),'right':round(reach('hand.R','shoulder.R'),4)},'limitations':['rotation-copy probe only','no root translation','no ball attachment','visual review and export gate still pending']}
open(report,'w',encoding='utf-8').write(json.dumps(out,indent=2))
print('HUMGEN_DRIBBLE_PROBE='+json.dumps(out))
