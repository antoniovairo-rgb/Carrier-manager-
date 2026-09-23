"""[23/09 POC] Riadatta una clip Mixamo (anim-*.glb, gerarchia di nodi animati) sullo scheletro CGTrader (Unreal) e la aggiunge
al GLB CGTrader, con un CANCELLO ANATOMICO misurato: niente export se i segmenti del corpo non seguono la sorgente.

Perche': le 31 clip CGTrader arrivano da Mixamo sul rig autoriggato, ma tuffo e respinta del portiere non c'erano. Il 20/09 una
copia delle rotazioni locali era fallita (fino a 179,6 gradi di scarto): le pose di riposo sono diverse (T contro A) e gli assi delle
ossa pure. Qui, per ogni osso mappato e fotogramma:
  1. rotazione mondiale = (variazione della sorgente dal suo riposo) @ riposo del bersaglio   -> porta con se' la torsione;
  2. correzione di SWING: l'asse Y dell'osso bersaglio viene allineato alla direzione del segmento della sorgente -> la
     differenza T/A non conta;
  3. il bacino trasla come l'anca della sorgente, in scala con l'altezza dell'anca.
Cancello: angolo fra segmento bersaglio e segmento sorgente (braccia, avambracci, cosce, gambe, busto) -> mediana e massimo.

Uso: python tools/retarget_cgtrader_clip.py <cgtrader.glb> <anim-sorgente.glb> <nome-clip> <uscita.glb> [<altra-sorgente.glb> <nome>]...
Richiede il modulo `bpy` (Blender 5 come pacchetto Python). Dopo l'export: `node tools/glb-materiali.mjs verifica/correggi`.
"""
import sys, math, statistics
import bpy
from mathutils import Matrix, Vector, Quaternion

MAPPA = {'Hips': 'pelvis', 'Spine': 'spine_01', 'Spine1': 'spine_02', 'Spine2': 'spine_03', 'Neck': 'neck_01', 'Head': 'head',
         'LeftShoulder': 'clavicle_l', 'LeftArm': 'upperarm_l', 'LeftForeArm': 'lowerarm_l', 'LeftHand': 'hand_l',
         'RightShoulder': 'clavicle_r', 'RightArm': 'upperarm_r', 'RightForeArm': 'lowerarm_r', 'RightHand': 'hand_r',
         'LeftUpLeg': 'thigh_l', 'LeftLeg': 'calf_l', 'LeftFoot': 'foot_l', 'LeftToeBase': 'ball_l',
         'RightUpLeg': 'thigh_r', 'RightLeg': 'calf_r', 'RightFoot': 'foot_r', 'RightToeBase': 'ball_r'}
FIGLIO = {'Hips': 'Spine', 'Spine': 'Spine1', 'Spine1': 'Spine2', 'Spine2': 'Neck', 'Neck': 'Head', 'Head': 'HeadTop_End',
          'LeftShoulder': 'LeftArm', 'LeftArm': 'LeftForeArm', 'LeftForeArm': 'LeftHand', 'LeftHand': 'LeftHandMiddle1',
          'RightShoulder': 'RightArm', 'RightArm': 'RightForeArm', 'RightForeArm': 'RightHand', 'RightHand': 'RightHandMiddle1',
          'LeftUpLeg': 'LeftLeg', 'LeftLeg': 'LeftFoot', 'LeftFoot': 'LeftToeBase', 'LeftToeBase': 'LeftToe_End',
          'RightUpLeg': 'RightLeg', 'RightLeg': 'RightFoot', 'RightFoot': 'RightToeBase', 'RightToeBase': 'RightToe_End'}
FIGLIO_T = {'spine_01': 'spine_02', 'spine_02': 'spine_03', 'spine_03': 'neck_01', 'neck_01': 'head',
            'clavicle_l': 'upperarm_l', 'upperarm_l': 'lowerarm_l', 'lowerarm_l': 'hand_l', 'hand_l': 'middle_01_l',
            'clavicle_r': 'upperarm_r', 'upperarm_r': 'lowerarm_r', 'lowerarm_r': 'hand_r', 'hand_r': 'middle_01_r',
            'thigh_l': 'calf_l', 'calf_l': 'foot_l', 'foot_l': 'ball_l', 'thigh_r': 'calf_r', 'calf_r': 'foot_r', 'foot_r': 'ball_r'}
SWING = {'Spine', 'Spine1', 'Spine2', 'Neck', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'RightShoulder', 'RightArm', 'RightForeArm',
         'LeftUpLeg', 'LeftLeg', 'RightUpLeg', 'RightLeg', 'LeftFoot', 'RightFoot'}
CANCELLO = ['LeftArm', 'LeftForeArm', 'RightArm', 'RightForeArm', 'LeftUpLeg', 'LeftLeg', 'RightUpLeg', 'RightLeg', 'Spine1']
SOGLIA_MED, SOGLIA_MAX = 10.0, 30.0


def riadatta(T, src_path, nome):
    prima = set(bpy.data.objects.keys())
    azioni_prima = set(bpy.data.actions.keys())
    if src_path.lower().endswith('.fbx'):
        bpy.ops.import_scene.fbx(filepath=src_path)
    else:
        bpy.ops.import_scene.gltf(filepath=src_path)
    nuovi = [bpy.data.objects[k] for k in bpy.data.objects.keys() if k not in prima]
    E = {o.name.split(':')[-1]: o for o in nuovi if o.type == 'EMPTY'}
    if not E:
        # [23/09] sorgente FBX Mixamo: un'ARMATURA (ossa `mixamorigN:Hips`) invece dei nodi vuoti del GLB. Ogni osso diventa un
        # «nodo» con matrix_world letta dal vivo, cosi' il resto del riadattamento non cambia.
        arm = [o for o in nuovi if o.type == 'ARMATURE']
        if arm:
            A = arm[0]
            class _Nodo:
                def __init__(s, pb): s.pb = pb
                @property
                def matrix_world(s): return A.matrix_world @ s.pb.matrix
            E = {pb.name.split(':')[-1]: _Nodo(pb) for pb in A.pose.bones}
    manca = [k for k in MAPPA if k not in E]
    if manca:
        raise SystemExit(f'sorgente senza nodi {manca}')
    src_act = [bpy.data.actions[k] for k in bpy.data.actions.keys() if k not in azioni_prima][0]
    f0, f1 = int(src_act.frame_range[0]), int(src_act.frame_range[1])
    vl = bpy.context.view_layer
    # [v2] il «riposo» dei nodi Mixamo NON e' la posa in piedi (misurato: tuffo sdraiato a t=0). Niente riposo della sorgente:
    # il bacino prende una TERNA costruita sui segmenti (su = anca->colonna, lato = anca sx->anca dx), ogni altro osso eredita
    # il genitore e riallinea la propria direzione al segmento della sorgente.
    T.animation_data_create()
    T.animation_data.action = None
    for pb in T.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    vl.update()
    Tw = T.matrix_world
    T_rest = {b: (Tw @ T.pose.bones[b].matrix).copy() for b in MAPPA.values()}
    # MISURATO: dopo l'import l'asse Y delle ossa Unreal NON punta al figlio (90 gradi di scarto su braccia e gambe). L'asse da
    # riallineare e' quello che, a riposo, punta davvero verso l'osso figlio, espresso nel riferimento locale dell'osso.
    asse = {}
    for b, c in FIGLIO_T.items():
        dr = (Tw @ T.pose.bones[c].matrix).translation - T_rest[b].translation
        if dr.length > 1e-6:
            asse[b] = (T_rest[b].to_quaternion().inverted() @ dr.normalized()).normalized()
    def terna(su, lato):
        z = su.normalized(); x = (lato - z * lato.dot(z)).normalized(); y = z.cross(x)
        return Matrix((x, y, z)).transposed().to_quaternion()
    Tp = T_rest['pelvis'].translation
    terna_T = terna(T_rest['spine_01'].translation - Tp, T_rest['thigh_r'].translation - T_rest['thigh_l'].translation)
    def terna_S(Sw):
        return terna(Sw['Spine'].translation - Sw['Hips'].translation, Sw['RightUpLeg'].translation - Sw['LeftUpLeg'].translation)
    bpy.context.scene.frame_set(f0); vl.update()
    S0 = {k: E[k].matrix_world.copy() for k in E}
    # direzione: all'istante iniziale il bersaglio guarda dove guarda a riposo (solo imbardata)
    lato0 = (S0['RightUpLeg'].translation - S0['LeftUpLeg'].translation); lato0.z = 0
    latoT = (T_rest['thigh_r'].translation - T_rest['thigh_l'].translation); latoT.z = 0
    imb = lato0.normalized().rotation_difference(latoT.normalized()) if lato0.length > 1e-6 and latoT.length > 1e-6 else Quaternion()
    terra_S = min(S0['LeftFoot'].translation.z, S0['RightFoot'].translation.z)
    terra_T = min(T_rest['foot_l'].translation.z, T_rest['foot_r'].translation.z)
    alt_S = S0['Hips'].translation.z - terra_S
    alt_T = T_rest['pelvis'].translation.z - terra_T
    scala = alt_T / alt_S if alt_S > 1e-6 else 1.0
    act = bpy.data.actions.new(nome)
    T.animation_data.action = act
    genitore = {}
    for s, b in MAPPA.items():
        p = T.data.bones[b].parent
        while p is not None and p.name not in MAPPA.values():
            p = p.parent
        genitore[b] = p.name if p is not None else None
    def prof(b):
        n, d = T.data.bones[b], 0
        while n.parent: n, d = n.parent, d + 1
        return d
    ordine = sorted(MAPPA.keys(), key=lambda s: prof(MAPPA[s]))
    errori, piedi = [], []
    for f in range(f0, f1 + 1):
        bpy.context.scene.frame_set(f)
        Sw = {k: imb.to_matrix().to_4x4() @ E[k].matrix_world for k in E}
        nuovo = {}
        for s in ordine:
            b = MAPPA[s]; pb = T.pose.bones[b]
            if s == 'Hips':
                R = terna_S(Sw) @ terna_T.inverted() @ T_rest[b].to_quaternion()
            else:
                g = genitore[b]
                R = (nuovo[g] @ T_rest[g].to_quaternion().inverted()) @ T_rest[b].to_quaternion() if g else T_rest[b].to_quaternion()
                figlio = FIGLIO.get(s)
                if figlio in Sw and b in asse:
                    d = Sw[figlio].translation - Sw[s].translation
                    if d.length > 1e-6:
                        R = (R @ asse[b]).rotation_difference(d.normalized()) @ R
            nuovo[b] = R
            vl.update()
            cur = Tw @ pb.matrix
            pos = cur.translation.copy()
            if s == 'Hips':
                sp = Sw['Hips'].translation; s0 = imb.to_matrix() @ S0['Hips'].translation
                pos = Vector((Tp.x + (sp.x - s0.x) * scala, Tp.y + (sp.y - s0.y) * scala, terra_T + (sp.z - terra_S) * scala))
            pb.matrix = Tw.inverted() @ Matrix.LocRotScale(pos, R, cur.to_scale())
            vl.update()
            pb.keyframe_insert('rotation_quaternion', frame=f)
            if s == 'Hips':
                pb.keyframe_insert('location', frame=f)
        vl.update()
        # CANCELLO NON CIRCOLARE: posizione di mani, piedi e testa rispetto al bacino, bersaglio contro sorgente in scala
        for s in ('LeftHand', 'RightHand', 'LeftFoot', 'RightFoot', 'Head'):
            tb = (Tw @ T.pose.bones[MAPPA[s]].matrix).translation - (Tw @ T.pose.bones['pelvis'].matrix).translation
            sb = (Sw[s].translation - Sw['Hips'].translation) * scala
            if tb.length > 1e-6 and sb.length > 1e-6:
                errori.append(math.degrees(tb.angle(sb)))
        piedi.append(min((Tw @ T.pose.bones['foot_l'].matrix).translation.z, (Tw @ T.pose.bones['foot_r'].matrix).translation.z) - terra_T)
    for o in nuovi:
        bpy.data.objects.remove(o, do_unlink=True)
    med, mx = statistics.median(errori), max(errori)
    print(f'CANCELLO {nome}: fotogrammi {f1 - f0 + 1} · estremita\' rispetto al bacino: mediana {med:.2f} gradi, massimo {mx:.2f} · piedi da terra a t0 {piedi[0]:.3f} m · scala anca {scala:.3f}')
    if med > SOGLIA_MED or mx > SOGLIA_MAX:
        raise SystemExit(f'RIFIUTATA {nome}: cancello anatomico non superato (soglie {SOGLIA_MED}/{SOGLIA_MAX})')
    return act


def main():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    tgt, out, coppie = a[0], None, []
    rest = a[1:]
    out = rest[-1]; rest = rest[:-1]
    for i in range(0, len(rest), 2):
        coppie.append((rest[i], rest[i + 1]))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=tgt)
    T = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]
    base = list(bpy.data.actions)
    n_prima = len(base)
    import os
    nuove, rifiutate = [], []
    for p, n in coppie:
        try:
            nuove.append(riadatta(T, p, n))
        except SystemExit as e:
            # [23/09] in lotto (CPM_SALTA_RIFIUTATE) una clip che non passa il cancello si scarta e si prosegue
            if not os.environ.get('CPM_SALTA_RIFIUTATE'):
                raise
            print(f'SCARTATA {n}: {e}'); rifiutate.append(n)
            for k in [k for k in bpy.data.actions.keys() if k == n]:
                bpy.data.actions.remove(bpy.data.actions[k])
            for o in [o for o in bpy.context.scene.objects if o.type == 'ARMATURE' and o != T]:
                bpy.data.objects.remove(o, do_unlink=True)
    # ogni azione deve arrivare nell'export: una traccia NLA per azione
    T.animation_data.action = None
    for ac in base + nuove:
        if not any(st.action == ac for tr in T.animation_data.nla_tracks for st in tr.strips):
            tr = T.animation_data.nla_tracks.new(); tr.name = ac.name
            try: tr.strips.new(ac.name, int(ac.frame_range[0]), ac)
            except Exception as e: print('NLA', ac.name, e)
    import os
    if os.environ.get('CPM_SOLO_NUOVE'):
        # [23/09] file di SOLE clip nuove: niente mesh, solo lo scheletro e le azioni riadattate (condiviso dai tre LOD, i binari
        # delle tracce si legano per nome d'osso)
        for o in [o for o in bpy.context.scene.objects if o.type != 'ARMATURE']:
            bpy.data.objects.remove(o, do_unlink=True)
        for tr in list(T.animation_data.nla_tracks):
            if tr.strips and tr.strips[0].action not in nuove:
                T.animation_data.nla_tracks.remove(tr)
    if os.environ.get('CPM_FPS'):
        bpy.context.scene.render.fps = int(os.environ['CPM_FPS']); bpy.context.scene.render.fps_base = 1.0
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS',
                              export_skins=True, export_yup=True, export_materials='EXPORT', export_image_format='AUTO',
                              **({'export_optimize_animation_size': True, 'export_optimize_animation_keep_anim_armature': False} if os.environ.get('CPM_SOLO_NUOVE') else {}))
    print(f'ESPORTATO {out} · azioni {n_prima} + {len(nuove)}')


main()
