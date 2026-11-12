"""[giro 180b, PO-367] Riadatta le clip Anderson Rohr (FBX, scheletro UE5 «Manny», 60 fps) sullo scheletro CGTrader
(UE4 Mannequin, 75 ossa) e scrive un GLB di SOLE animazioni (nessuna mesh), come `assets/cgtrader-clip-mixamo.glb`.

Questo script NON contiene dati del pacchetto: legge gli FBX da un percorso passato in argomento (fuori dal repo).
Licenza del pacchetto (12/11/2026): uso gratuito anche commerciale; vietato ridistribuire/rivendere il pacchetto
«as a standalone product». Gli FBX e gli zip non entrano MAI nel repository ne' in dist/.

Metodo (stesso impianto di tools/retarget_cgtrader_clip.py, adattato a una sorgente con armatura e posa di riposo vera):
  1. rotazione mondiale del bersaglio = (variazione della sorgente dal SUO riposo) @ riposo del bersaglio -> porta torsione
     di testa, polsi, dita (la sorgente UE5 importata ha un riposo affidabile, a differenza dei nodi Mixamo);
  2. correzione di SWING: l'asse dell'osso bersaglio che a riposo punta al figlio viene allineato al segmento della
     sorgente (spine_01->spine_03, spine_03->spine_05, ...: 5 vertebre e 2 colli della sorgente -> 3 e 1 del bersaglio);
  3. il bacino trasla come quello della sorgente, in scala con l'altezza dell'anca (la rincorsa resta: NON portata sul posto).
  4. ricampionamento 60 -> 30 fps (un fotogramma sorgente su due).
Cancello anatomico (non circolare): posizione di mani, piedi e testa rispetto al bacino, bersaglio contro sorgente in scala;
mediana <= 10 gradi, massimo <= 30 gradi, altrimenti la clip e' RIFIUTATA.

Uso (Blender 5 come modulo Python `bpy`, pip install bpy, Python 3.13):
  python -I tools/rohr-180/riadatta_rohr.py -- <cgtrader-lod.glb> <uscita.glb> <file.fbx> <nome-clip> [<file.fbx> <nome-clip>]...
Stampa una riga CANCELLO e una riga MISURA (scivolamento piedi, compenetrazione col suolo) per clip.
"""
import sys, math, statistics, json
import bpy
from mathutils import Matrix, Vector, Quaternion

# sorgente UE5 -> bersaglio CGTrader (UE4)
MAPPA = {'pelvis': 'pelvis', 'spine_01': 'spine_01', 'spine_03': 'spine_02', 'spine_05': 'spine_03',
         'neck_01': 'neck_01', 'head': 'head'}
for lato in ('l', 'r'):
    for o in ('clavicle', 'upperarm', 'lowerarm', 'hand', 'thigh', 'calf', 'foot', 'ball'):
        MAPPA[f'{o}_{lato}'] = f'{o}_{lato}'
    for d in ('index', 'middle', 'pinky', 'ring'):
        for k in ('metacarpal', '01', '02', '03'):
            MAPPA[f'{d}_{k}_{lato}'] = f'{d}_{k}_{lato}'
    for k in ('01', '02', '03'):
        MAPPA[f'thumb_{k}_{lato}'] = f'thumb_{k}_{lato}'
FIGLIO_T = {'pelvis': 'spine_01', 'spine_01': 'spine_02', 'spine_02': 'spine_03', 'spine_03': 'neck_01', 'neck_01': 'head'}
for lato in ('l', 'r'):
    FIGLIO_T.update({f'clavicle_{lato}': f'upperarm_{lato}', f'upperarm_{lato}': f'lowerarm_{lato}',
                     f'lowerarm_{lato}': f'hand_{lato}', f'hand_{lato}': f'middle_01_{lato}',
                     f'thigh_{lato}': f'calf_{lato}', f'calf_{lato}': f'foot_{lato}', f'foot_{lato}': f'ball_{lato}'})
INV = {v: k for k, v in MAPPA.items()}
SWING = {b for b in FIGLIO_T if b != 'pelvis'}
SOGLIA_MED, SOGLIA_MAX = 10.0, 30.0


def riadatta(T, src_path, nome):
    prima = set(bpy.data.objects.keys())
    bpy.ops.import_scene.fbx(filepath=src_path)
    nuovi = [bpy.data.objects[k] for k in bpy.data.objects.keys() if k not in prima]
    A = [o for o in nuovi if o.type == 'ARMATURE'][0]
    manca = [k for k in MAPPA if k not in A.pose.bones]
    if manca:
        raise SystemExit(f'sorgente senza ossa {manca}')
    act_s = A.animation_data.action
    f0, f1 = int(round(act_s.frame_range[0])), int(round(act_s.frame_range[1]))
    fps_s = bpy.context.scene.render.fps / bpy.context.scene.render.fps_base
    sc, vl = bpy.context.scene, bpy.context.view_layer
    Aw = A.matrix_world
    S_rest = {k: (Aw @ A.data.bones[k].matrix_local) for k in MAPPA}
    T.animation_data_create(); T.animation_data.action = None
    for pb in T.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    vl.update()
    Tw = T.matrix_world
    T_rest = {b: (Tw @ T.pose.bones[b].matrix).copy() for b in MAPPA.values()}
    asse = {}
    for b, c in FIGLIO_T.items():
        dr = (Tw @ T.pose.bones[c].matrix).translation - T_rest[b].translation
        if dr.length > 1e-6:
            asse[b] = (T_rest[b].to_quaternion().inverted() @ dr.normalized()).normalized()
    def yaw(v_da, v_a):
        v_da = Vector((v_da.x, v_da.y, 0)); v_a = Vector((v_a.x, v_a.y, 0))
        return v_da.normalized().rotation_difference(v_a.normalized()) if v_da.length > 1e-6 and v_a.length > 1e-6 else Quaternion()
    latoT = T_rest['thigh_r'].translation - T_rest['thigh_l'].translation
    q_rest = yaw(S_rest['thigh_r'].translation - S_rest['thigh_l'].translation, latoT)   # riposo sorgente -> riposo bersaglio
    def mondo(f):
        sc.frame_set(f); vl.update()
        return {k: Aw @ A.pose.bones[k].matrix for k in MAPPA}
    # MISURATO 12/11: il fotogramma 1 di ogni FBX del pacchetto e' una POSA DI RIFERIMENTO (braccia aperte), con la mano che
    # salta di 13-118 cm al fotogramma 2, contro ~1 cm fra i fotogrammi seguenti. Si riconosce dal RAPPORTO (primo salto oltre
    # 8 volte il secondo e oltre 5 cm) e si esclude da clip e direzione.
    h1, h2, h3 = (mondo(f0 + i)['hand_l'].translation.copy() for i in range(3))
    posa_rif = (h2 - h1).length > max(0.05, 8 * (h3 - h2).length)
    if posa_rif:
        f0 += 1
    S0 = mondo(f0)
    imb = yaw(S0['thigh_r'].translation - S0['thigh_l'].translation, latoT)              # fotogramma 0 -> direzione del bersaglio
    # suolo e scala dal RIPOSO della sorgente (in piedi), non dal primo fotogramma: un'esultanza puo' cominciare in salto
    terra_S = min(S_rest['foot_l'].translation.z, S_rest['foot_r'].translation.z)
    terra_T = min(T_rest['foot_l'].translation.z, T_rest['foot_r'].translation.z)
    scala = (T_rest['pelvis'].translation.z - terra_T) / max(1e-6, S_rest['pelvis'].translation.z - terra_S)
    Tp = T_rest['pelvis'].translation
    Qr = q_rest.to_matrix().to_4x4(); Im = imb.to_matrix().to_4x4()
    Sr = {k: (Qr @ m).to_quaternion() for k, m in S_rest.items()}
    act = bpy.data.actions.new(nome)
    T.animation_data.action = act
    genitore = {}
    for b in MAPPA.values():
        p = T.data.bones[b].parent
        while p is not None and p.name not in MAPPA.values():
            p = p.parent
        genitore[b] = p.name if p is not None else None
    def prof(b):
        n, d = T.data.bones[b], 0
        while n.parent: n, d = n.parent, d + 1
        return d
    ordine = sorted(MAPPA.keys(), key=lambda s: prof(MAPPA[s]))
    errori, traccia, peggio = [], [], [0.0, '', 0, 0.0]
    per_osso, spalla = {}, []
    mt = [9.0, 9.0]
    passi = list(range(f0, f1 + 1, 2))
    for k, f in enumerate(passi):
        Sw = {n: Im @ m for n, m in mondo(f).items()}
        nuovo = {}
        for s in ordine:
            b = MAPPA[s]; pb = T.pose.bones[b]
            # 1. variazione dal riposo della sorgente (riportato alla direzione del bersaglio), applicata al riposo del bersaglio
            g = genitore[b]
            if g is None:   # bacino: variazione mondiale dal riposo
                R = (Sw[s].to_quaternion() @ Sr[s].inverted()) @ T_rest[b].to_quaternion()
            else:
                # [v2 12/11] variazione RELATIVA AL GENITORE: in coordinate mondo le dita non seguivano la mano del bersaglio
                # (misurato sui provini: dita piegate all'indietro). R = R_gen_T · R_gen_S⁻¹ · R_S · Sr⁻¹ · Sr_gen · T_rest_gen⁻¹ · T_rest
                gs = INV[g]
                R = nuovo[g] @ Sw[gs].to_quaternion().inverted() @ Sw[s].to_quaternion() @ Sr[s].inverted() @ Sr[gs] \
                    @ T_rest[g].to_quaternion().inverted() @ T_rest[b].to_quaternion()
            # 2. swing sul segmento
            if b in SWING and b in asse:
                c = INV.get(FIGLIO_T[b])
                d = Sw[c].translation - Sw[s].translation
                if d.length > 1e-6:
                    R = (R @ asse[b]).rotation_difference(d.normalized()) @ R
            nuovo[b] = R
            vl.update()
            cur = Tw @ pb.matrix
            pos = cur.translation.copy()
            if s == 'pelvis':
                sp = Sw['pelvis'].translation; s0 = Im @ S0['pelvis'].translation
                pos = Vector((Tp.x + (sp.x - s0.x) * scala, Tp.y + (sp.y - s0.y) * scala, terra_T + (sp.z - terra_S) * scala))
            pb.matrix = Tw.inverted() @ Matrix.LocRotScale(pos, R, cur.to_scale())
            vl.update()
            pb.keyframe_insert('rotation_quaternion', frame=k)
            if s == 'pelvis':
                pb.keyframe_insert('location', frame=k)
        vl.update()
        P = lambda n: (Tw @ T.pose.bones[n].matrix).translation.copy()
        for s in ('hand_l', 'hand_r', 'foot_l', 'foot_r', 'head'):
            tb = P(s) - P('pelvis'); sb = (Sw[INV[s]].translation - Sw['pelvis'].translation) * scala
            if tb.length > 1e-6 and sb.length > 1e-6:
                e = math.degrees(tb.angle(sb)); errori.append(e); per_osso.setdefault(s, []).append(e)
                if e > peggio[0]: peggio[:] = [e, s, k, round(tb.length, 3)]
        # diagnostica (NON cancello): mano rispetto alla SPALLA — separa l'errore d'angolo da quello di proporzioni (braccio sorgente
        # 0,278+0,273 m contro 0,199+0,240 del bersaglio: vicino al bacino la sola differenza di lunghezze sposta la direzione)
        for lato in ('l', 'r'):
            tb = P(f'hand_{lato}') - P(f'upperarm_{lato}'); sb = Sw[f'hand_{lato}'].translation - Sw[f'upperarm_{lato}'].translation
            if tb.length > 1e-6 and sb.length > 1e-6:
                spalla.append(math.degrees(tb.angle(sb)))
        for lato in ('l', 'r'):   # distanza mano-testa (osso hand -> osso head): bersaglio contro sorgente in scala
            mt[0] = min(mt[0], (P(f'hand_{lato}') - P('head')).length)
            mt[1] = min(mt[1], (Sw[f'hand_{lato}'].translation - Sw['head'].translation).length * scala)
        traccia.append({n: P(n) for n in ('pelvis', 'foot_l', 'foot_r', 'ball_l', 'ball_r', 'hand_l', 'hand_r', 'head')})
    for o in nuovi:
        bpy.data.objects.remove(o, do_unlink=True)
    med, mx = statistics.median(errori), max(errori)
    mis = misure(traccia, {n: T_rest[n].translation.z for n in ('foot_l', 'foot_r', 'ball_l', 'ball_r')}, terra_T, 30.0)
    print(f'CANCELLO {nome}: fotogrammi 30fps {len(passi)} · durata {(f1 - f0) / fps_s:.3f}s · estremita\': mediana {med:.2f}°, massimo {mx:.2f}° · scala anca {scala:.3f}')
    print('MISURA ' + json.dumps({'clip': nome, 'fps_sorgente': fps_s, 'posa_riferimento_esclusa': posa_rif, 'fotogrammi': len(passi), 'durata': round((f1 - f0) / fps_s, 3),
                                  'cancello_med': round(med, 2), 'cancello_max': round(mx, 2),
                                  'peggio': {'osso': peggio[1], 'fotogramma': peggio[2], 'dist_bacino_m': peggio[3]},
                                  'mano_testa_min_cm': round(mt[0] * 100, 1), 'mano_testa_min_sorgente_cm': round(mt[1] * 100, 1),
                                  'mano_da_spalla_max': round(max(spalla), 2) if spalla else None,
                                  'mediana_per_osso': {o: round(statistics.median(v), 1) for o, v in per_osso.items()}, **mis}))
    if med > SOGLIA_MED or mx > SOGLIA_MAX:
        raise SystemExit(f'RIFIUTATA {nome}: cancello anatomico non superato (soglie {SOGLIA_MED}/{SOGLIA_MAX})')
    return act


def misure(tr, zr, terra, fps):
    """Altezze RELATIVE al riposo in piedi di ciascun osso (zr: caviglia foot_*, attacco dita ball_*), cosi' 0 = appoggiato.
    Scivolamento: piede in appoggio (foot o ball entro 4 cm dalla sua altezza da fermo in due campioni di fila) che si sposta in
    pianta, in m/s. Compenetrazione: quanto un osso scende sotto la sua altezza da fermo (cm). Bacino: spostamento in pianta (m)."""
    sciv, app, sotto = [], 0, 0.0
    for lato in ('l', 'r'):
        for i in range(1, len(tr)):
            a, b = tr[i - 1], tr[i]
            za = min(a[f'foot_{lato}'].z - zr[f'foot_{lato}'], a[f'ball_{lato}'].z - zr[f'ball_{lato}'])
            zb = min(b[f'foot_{lato}'].z - zr[f'foot_{lato}'], b[f'ball_{lato}'].z - zr[f'ball_{lato}'])
            if za < 0.04 and zb < 0.04:
                app += 1
                d = (b[f'ball_{lato}'] - a[f'ball_{lato}']); d.z = 0
                sciv.append(d.length * fps)   # m/s in pianta mentre e' in appoggio
    for t in tr:
        sotto = min(sotto, min(t[n].z - zr[n] for n in zr))
    sp = tr[-1]['pelvis'] - tr[0]['pelvis']; sp.z = 0
    massimo = max(((t['pelvis'] - tr[0]['pelvis']).to_2d().length for t in tr), default=0)
    sciv.sort()
    return {'appoggi': app, 'scivolamento_med_ms': round(statistics.median(sciv), 3) if sciv else None,
            'scivolamento_p90_ms': round(sciv[int(0.9 * (len(sciv) - 1))], 3) if sciv else None,
            'sotto_suolo_cm': round(-sotto * 100, 1), 'bacino_fine_m': round(sp.length, 2), 'bacino_max_m': round(massimo, 2),
            'testa_min_m': round(min(t['head'].z for t in tr) - terra, 2)}


def main():
    a = sys.argv[sys.argv.index('--') + 1:]
    tgt, out, resto = a[0], a[1], a[2:]
    coppie = [(resto[i], resto[i + 1]) for i in range(0, len(resto), 2)]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=tgt)
    T = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]
    base = list(bpy.data.actions)
    import os
    nuove = []
    for p, n in coppie:
        try:
            nuove.append(riadatta(T, p, n))
        except SystemExit as e:   # CPM_SALTA_RIFIUTATE=1: in lotto una clip rifiutata si scarta e si prosegue (come lo script Mixamo)
            if not os.environ.get('CPM_SALTA_RIFIUTATE'):
                raise
            print(f'SCARTATA {n}: {e}')
            for k in [k for k in bpy.data.actions.keys() if k == n]:
                bpy.data.actions.remove(bpy.data.actions[k])
            for o in [o for o in bpy.context.scene.objects if o.type == 'ARMATURE' and o != T]:
                bpy.data.objects.remove(o, do_unlink=True)
    for ac in base:
        bpy.data.actions.remove(ac)
    for o in [o for o in bpy.context.scene.objects if o.type != 'ARMATURE']:
        bpy.data.objects.remove(o, do_unlink=True)
    T.animation_data.action = None
    for tr in list(T.animation_data.nla_tracks):
        T.animation_data.nla_tracks.remove(tr)
    for ac in nuove:
        tr = T.animation_data.nla_tracks.new(); tr.name = ac.name
        tr.strips.new(ac.name, 0, ac)
    bpy.context.scene.render.fps = 30; bpy.context.scene.render.fps_base = 1.0
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS',
                              export_skins=True, export_yup=True, export_optimize_animation_size=True,
                              export_optimize_animation_keep_anim_armature=False)
    print(f'ESPORTATO {out} · clip {len(nuove)}')


main()
