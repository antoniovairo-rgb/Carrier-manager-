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

[giro 180c] Opzioni per clip, attaccate al nome con «:» e separate da «,» (es. `rohr-power-kick:a=2.4`):
  da=<s> / a=<s>  taglio della clip, in secondi dall'inizio (dopo l'esclusione della posa di riferimento);
  ciclo=<min>-<max> sceglie la finestra di <min>-<max> secondi in cui l'ultimo fotogramma coincide col primo (posizione E
                  velocita' di mani, gomiti, piedi, ginocchia, testa e bacino), cosi' la clip gira in anello senza salto;
  suolo           alza il bacino, fotogramma per fotogramma, di quanto il vertice piu' basso del corpo scende sotto il suo livello
                  a riposo (corregge ginocchia/corpo che affondano; misurato sui VERTICI deformati, non sulle ossa).
Correzione delle mani (sempre attiva, CPM_IK=0 la spegne): IK del braccio a 2 ossa che porta il polso nel punto della
sorgente RISPETTO ALLA SPALLA, scalato sulle proporzioni del nostro braccio ((omero+avambraccio) nostro / sorgente); il
piano del gomito resta quello del riadattamento, l'orientamento della mano resta quello della sorgente. Il cancello e le sue
soglie NON cambiano: la riga CANCELLO riporta l'esito prima e dopo la correzione.
"""
import sys, math, statistics, json, os
import bpy
import numpy as np
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


def riadatta(T, src_path, nome, opz=None):
    opz = opz or {}
    usa_ik = os.environ.get('CPM_IK', '1') != '0'
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
    # [180c] taglio / ciclo: si decide sulla SORGENTE, prima del riadattamento (indici a 30 fps: f = f0 + 2*i)
    giunzione_src = None
    if 'da' in opz or 'a' in opz:
        f_a = min(f1, f0 + int(round(float(opz.get('a', 1e9)) * fps_s)))
        f0 = f0 + 2 * int(round(float(opz.get('da', 0)) * fps_s / 2)); f1 = f_a
    elif 'ciclo' in opz:
        lo, hi = (float(x) for x in opz['ciclo'].split('-'))
        PUNTI = ('hand_l', 'hand_r', 'lowerarm_l', 'lowerarm_r', 'ball_l', 'ball_r', 'calf_l', 'calf_r', 'head')
        des = []
        for f in range(f0, f1 + 1, 2):
            W = mondo(f); pv = W['pelvis'].translation
            des.append([pv.copy()] + [W[n].translation - pv for n in PUNTI])
        def dist(u, v): return max((a - b).length for a, b in zip(u, v))
        def vel(u, v): return [b - a for a, b in zip(u, v)]
        Lmin, Lmax = int(round(lo * 30)), int(round(hi * 30))
        best = None
        for i in range(0, len(des) - Lmin - 1):
            for L in range(Lmin, min(Lmax, len(des) - 1 - i) + 1):
                j = i + L
                sp = dist(des[i], des[j]); sv = dist(vel(des[j - 1], des[j]), vel(des[i], des[i + 1]))
                sc_ = sp + 2 * sv
                if best is None or sc_ < best[0]:
                    best = (sc_, i, j, sp, sv)
        if best is None:
            raise SystemExit(f'RIFIUTATA {nome}: clip troppo corta per un ciclo di {lo}-{hi} s')
        _, i, j, sp, sv = best
        passo = statistics.median(dist(des[k], des[k + 1]) for k in range(i, j))
        giunzione_src = {'salto_cm': round(sp * 100, 2), 'vel_cm_fot': round(sv * 100, 2), 'passo_mediano_cm': round(passo * 100, 2),
                         'da_s': round(i / 30, 3), 'a_s': round(j / 30, 3)}
        f0, f1 = f0 + 2 * i, f0 + 2 * j
    S0 = mondo(f0)
    imb = yaw(S0['thigh_r'].translation - S0['thigh_l'].translation, latoT)              # fotogramma 0 -> direzione del bersaglio
    # suolo e scala dal RIPOSO della sorgente (in piedi), non dal primo fotogramma: un'esultanza puo' cominciare in salto
    terra_S = min(S_rest['foot_l'].translation.z, S_rest['foot_r'].translation.z)
    terra_T = min(T_rest['foot_l'].translation.z, T_rest['foot_r'].translation.z)
    scala = (T_rest['pelvis'].translation.z - terra_T) / max(1e-6, S_rest['pelvis'].translation.z - terra_S)
    Tp = T_rest['pelvis'].translation
    # [180c] lunghezze del braccio (omero + avambraccio), sorgente e nostro, dal riposo
    Lb_S = {l: (S_rest[f'lowerarm_{l}'].translation - S_rest[f'upperarm_{l}'].translation).length
               + (S_rest[f'hand_{l}'].translation - S_rest[f'lowerarm_{l}'].translation).length for l in ('l', 'r')}
    corpo = [o for o in bpy.context.scene.objects if o.type == 'MESH' and o.find_armature() == T]
    def vmin():
        dg = bpy.context.evaluated_depsgraph_get(); z = 1e9
        for o in corpo:
            oe = o.evaluated_get(dg); me = oe.to_mesh(); n = len(me.vertices)
            co = np.empty(n * 3, dtype=np.float64); me.vertices.foreach_get('co', co); co = co.reshape(n, 3)
            mw = np.array(oe.matrix_world)
            z = min(z, float((co @ mw[2, :3] + mw[2, 3]).min())); oe.to_mesh_clear()
        return z
    usa_suolo = 'suolo' in opz
    if usa_suolo and not corpo:
        raise SystemExit('opzione suolo: nessuna mesh legata allo scheletro bersaglio')
    vmin_rest = vmin() if usa_suolo else None
    ik_stat = {'fotogrammi': 0, 'saltati': 0, 'spost_max_cm': 0.0}
    sollevato = [0.0, 0]
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
    errori_prima, peggio_prima = [], [0.0, '', 0, 0.0]
    fr_err = {}
    per_osso, spalla = {}, []
    mt = [9.0, 9.0]
    passi = list(range(f0, f1 + 1, 2))
    def ik_braccio(lato, Sw, k):
        """[180c] IK a 2 ossa: polso = spalla + (polso - spalla della sorgente) x (braccio nostro / braccio sorgente)."""
        pu, pl, ph = (T.pose.bones[f'{n}_{lato}'] for n in ('upperarm', 'lowerarm', 'hand'))
        W = lambda pb: Tw @ pb.matrix
        A, B, C = W(pu).translation.copy(), W(pl).translation.copy(), W(ph).translation.copy()
        a, b = (B - A).length, (C - B).length
        ds = Sw[f'hand_{lato}'].translation - Sw[f'upperarm_{lato}'].translation
        G = A + ds * ((a + b) / Lb_S[lato])
        if os.environ.get('CPM_IK_RIF') == 'bacino':   # SOLO diagnostica 180c (mai per il file): polso nel punto della sorgente rispetto al BACINO
            G = (Tw @ T.pose.bones['pelvis'].matrix).translation + (Sw[f'hand_{lato}'].translation - Sw['pelvis'].translation) * scala
        d = min(max((G - A).length, abs(a - b) + 1e-4), a + b - 1e-4)
        ik_stat['fotogrammi'] += 1
        if (G - A).length < 1e-6:
            ik_stat['saltati'] += 1; return
        n = (G - A).normalized(); pv = (B - A) - n * (B - A).dot(n)
        if pv.length < 1e-5:   # gomito sulla retta spalla-polso: piano indefinito, si lascia il riadattamento
            ik_stat['saltati'] += 1; return
        pv.normalize()
        cA = max(-1.0, min(1.0, (a * a + d * d - b * b) / (2 * a * d))); sA = math.sqrt(max(0.0, 1 - cA * cA))
        B2, G2 = A + n * (a * cA) + pv * (a * sA), A + n * d
        Rh = W(ph).to_quaternion()
        M = W(pu); q1 = (B - A).rotation_difference(B2 - A)
        pu.matrix = Tw.inverted() @ Matrix.LocRotScale(M.translation, q1 @ M.to_quaternion(), M.to_scale()); vl.update()
        M = W(pl); Bn, Cn = M.translation.copy(), W(ph).translation.copy()
        q2 = (Cn - Bn).rotation_difference(G2 - Bn)
        pl.matrix = Tw.inverted() @ Matrix.LocRotScale(Bn, q2 @ M.to_quaternion(), M.to_scale()); vl.update()
        M = W(ph)
        ph.matrix = Tw.inverted() @ Matrix.LocRotScale(M.translation, Rh, M.to_scale()); vl.update()
        ik_stat['spost_max_cm'] = max(ik_stat['spost_max_cm'], (M.translation - C).length * 100)
        for pb in (pu, pl, ph):
            pb.keyframe_insert('rotation_quaternion', frame=k)
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
        def cancello(lista, pg, po):
            for s in ('hand_l', 'hand_r', 'foot_l', 'foot_r', 'head'):
                tb = P(s) - P('pelvis'); sb = (Sw[INV[s]].translation - Sw['pelvis'].translation) * scala
                if tb.length > 1e-6 and sb.length > 1e-6:
                    e = math.degrees(tb.angle(sb)); lista.append(e)
                    if po is not None: po.setdefault(s, []).append(e)
                    if e > pg[0]: pg[:] = [e, s, k, round(tb.length, 3)]
        cancello(errori_prima, peggio_prima, None)
        if usa_ik:
            for lato in ('l', 'r'):
                ik_braccio(lato, Sw, k)
        if usa_suolo:
            d = vmin_rest - vmin()
            if d > 0:
                pp = T.pose.bones['pelvis']; M = Tw @ pp.matrix
                pp.matrix = Tw.inverted() @ Matrix.LocRotScale(M.translation + Vector((0, 0, d)), M.to_quaternion(), M.to_scale())
                vl.update(); pp.keyframe_insert('location', frame=k)
                sollevato[0] = max(sollevato[0], d); sollevato[1] += 1
        n0 = len(errori); cancello(errori, peggio, per_osso); fr_err[k] = (n0, len(errori))
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
    chiusura = None
    if 'ciclo' in opz:
        # [180c] CHIUSURA dell'anello: la differenza fra l'ultimo fotogramma e il primo si riassorbe sugli ultimi M fotogrammi
        # (rampa liscia, smoothstep): ogni osso q(k) <- slerp(I, q0·qL⁻¹, w(k)) · q(k); il bacino trasla di (p0 - pL)·w(k).
        # A k = L la posa coincide col fotogramma 0. La misura che conta e' il passo massimo DENTRO la rampa contro il passo mediano.
        L = len(passi) - 1; M = min(10, L // 3)
        ossa = [T.pose.bones[b] for b in MAPPA.values()]
        def leggi(k):
            sc.frame_set(k); vl.update()
            return {pb.name: (pb.rotation_quaternion.copy(), pb.location.copy()) for pb in ossa}
        p0, pL = leggi(0), leggi(L)
        corr = {}
        for n, (q0, l0) in p0.items():
            qL, lL = pL[n]
            if q0.dot(qL) < 0: q0 = -q0
            corr[n] = (q0 @ qL.inverted(), l0 - lL)
        rampa = []
        for k in range(L - M + 1, L + 1):
            t = (k - (L - M)) / M; w = t * t * (3 - 2 * t)
            pk = leggi(k); rampa.append(k)
            for pb in ossa:
                q, l = pk[pb.name]; qc, dl = corr[pb.name]
                pb.rotation_quaternion = Quaternion().slerp(qc, w) @ q
                pb.keyframe_insert('rotation_quaternion', frame=k)
                if pb.name == 'pelvis':
                    pb.location = l + dl * w; pb.keyframe_insert('location', frame=k)
        T.animation_data.action = act
        traccia_prima, traccia = traccia, []
        for k in range(L + 1):
            sc.frame_set(k); vl.update()
            traccia.append({n: (Tw @ T.pose.bones[n].matrix).translation.copy() for n in ('pelvis', 'foot_l', 'foot_r', 'ball_l', 'ball_r', 'hand_l', 'hand_r', 'head')})
        chiusura = {'fotogrammi_rampa': M}
        # il cancello si RIMISURA sui fotogrammi della rampa (la chiusura li ha cambiati): sorgente al suo fotogramma, bersaglio al suo
        for k in rampa:
            Sw = {n: Im @ m for n, m in mondo(passi[k]).items()}
            sc.frame_set(k); vl.update()
            P = lambda n: (Tw @ T.pose.bones[n].matrix).translation.copy()
            a0, a1 = fr_err[k]; nuovi_e = []
            for s_ in ('hand_l', 'hand_r', 'foot_l', 'foot_r', 'head'):
                tb = P(s_) - P('pelvis'); sb = (Sw[INV[s_]].translation - Sw['pelvis'].translation) * scala
                if tb.length > 1e-6 and sb.length > 1e-6:
                    e = math.degrees(tb.angle(sb)); nuovi_e.append(e)
                    if e > peggio[0]: peggio[:] = [e, s_ + ' (rampa)', k, round(tb.length, 3)]
            if len(nuovi_e) == a1 - a0:
                errori[a0:a1] = nuovi_e
            chiusura['cancello_rampa_max'] = round(max(chiusura.get('cancello_rampa_max', 0), max(nuovi_e, default=0)), 2)
    for o in nuovi:
        bpy.data.objects.remove(o, do_unlink=True)
    med, mx = statistics.median(errori), max(errori)
    med0, mx0 = statistics.median(errori_prima), max(errori_prima)
    # [180c] giunzione dell'anello misurata sul BERSAGLIO: ultimo fotogramma contro il primo (bacino assoluto + estremita' dal bacino)
    PT = ('hand_l', 'hand_r', 'foot_l', 'foot_r', 'head')
    dT = lambda u, v: max([(u['pelvis'] - v['pelvis']).length] + [((u[n] - u['pelvis']) - (v[n] - v['pelvis'])).length for n in PT])
    giunzione = {'salto_cm': round(dT(traccia[-1], traccia[0]) * 100, 2),
                 'passo_mediano_cm': round(statistics.median(dT(traccia[i], traccia[i + 1]) for i in range(len(traccia) - 1)) * 100, 2)}
    if chiusura:
        chiusura['salto_prima_cm'] = round(dT(traccia_prima[-1], traccia_prima[0]) * 100, 2)
    if chiusura:   # passo massimo dentro la rampa (e sul giro L -> 0) contro il passo mediano fuori rampa
        Lc = len(traccia) - 1; M = chiusura['fotogrammi_rampa']
        chiusura['passo_max_rampa_cm'] = round(max(dT(traccia[i], traccia[i + 1]) for i in range(Lc - M, Lc)) * 100, 2)
        chiusura['passo_max_fuori_cm'] = round(max(dT(traccia[i], traccia[i + 1]) for i in range(0, Lc - M)) * 100, 2)
    mis = misure(traccia, {n: T_rest[n].translation.z for n in ('foot_l', 'foot_r', 'ball_l', 'ball_r')}, terra_T, 30.0)
    print(f'CANCELLO {nome}: fotogrammi 30fps {len(passi)} · durata {(f1 - f0) / fps_s:.3f}s · PRIMA della correzione mani: mediana {med0:.2f}°, massimo {mx0:.2f}° ({peggio_prima[1]}) · DOPO: mediana {med:.2f}°, massimo {mx:.2f}° ({peggio[1]}) · scala anca {scala:.3f}')
    print('MISURA ' + json.dumps({'clip': nome, 'fps_sorgente': fps_s, 'posa_riferimento_esclusa': posa_rif, 'fotogrammi': len(passi), 'durata': round((f1 - f0) / fps_s, 3),
                                  'cancello_med': round(med, 2), 'cancello_max': round(mx, 2),
                                  'cancello_prima_med': round(med0, 2), 'cancello_prima_max': round(mx0, 2), 'peggio_prima': peggio_prima[1],
                                  'ik': ik_stat if usa_ik else None, 'opzioni': opz, 'giunzione': giunzione, 'chiusura': chiusura, 'giunzione_sorgente': giunzione_src,
                                  'suolo_sollevato_max_cm': round(sollevato[0] * 100, 1) if usa_suolo else None, 'suolo_fotogrammi': sollevato[1] if usa_suolo else None,
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
        n, _, o = n.partition(':')
        opz = dict((x.split('=', 1) + [''])[:2] for x in o.split(',') if x)
        try:
            nuove.append(riadatta(T, p, n, opz))
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
