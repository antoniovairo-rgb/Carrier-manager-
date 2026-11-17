"""[giro 242, solo prova] Libreria: CMU ASF/AMC -> posizioni dei giunti con i nomi Mixamo (usata da riadatta_cmu.py).
Il riadattatore del progetto (tools/retarget_cgtrader_clip.py) usa della sorgente SOLO le posizioni dei giunti (terna del
bacino da anche/colonna, riallineamento di ogni segmento), quindi bastano le posizioni.
Uso: tramite riadatta_cmu.py (sorgente «<asf>|<amc>|<da>|<a>.cmu»). Richiede bpy.
"""
import sys, math
import numpy as np
import bpy


def rot(ax, deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    if ax == 'x': return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if ax == 'y': return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def euler(x, y, z):  # convenzione ASF/AMC (ordine XYZ): R = Rz @ Ry @ Rx
    return rot('z', z) @ rot('y', y) @ rot('x', x)


def leggi_asf(p):
    righe = [l.strip() for l in open(p, encoding='latin-1')]
    ossa, gerarchia, sez, cur = {}, {}, None, None
    radice_ordine = None
    for l in righe:
        if l.startswith(':'):
            sez = l.split()[0]; continue
        if sez == ':root':
            if l.startswith('order'): radice_ordine = l.split()[1:]
        if sez == ':bonedata':
            t = l.split()
            if not t: continue
            if t[0] == 'begin': cur = {'dof': []}
            elif t[0] == 'end': ossa[cur['name']] = cur; cur = None
            elif cur is not None:
                if t[0] == 'name': cur['name'] = t[1]
                elif t[0] == 'direction': cur['dir'] = np.array([float(v) for v in t[1:4]])
                elif t[0] == 'length': cur['len'] = float(t[1])
                elif t[0] == 'axis': cur['axis'] = [float(v) for v in t[1:4]]
                elif t[0] == 'dof': cur['dof'] = t[1:]
        if sez == ':hierarchy':
            t = l.split()
            if t and t[0] not in ('begin', 'end'): gerarchia[t[0]] = t[1:]
    return ossa, gerarchia, radice_ordine


def leggi_amc(p):
    fot, cur = [], None
    for l in open(p, encoding='latin-1'):
        l = l.strip()
        if not l or l.startswith('#') or l.startswith(':'): continue
        t = l.split()
        if len(t) == 1 and t[0].isdigit():
            cur = {}; fot.append(cur); continue
        cur[t[0]] = [float(v) for v in t[1:]]
    return fot


def posizioni(ossa, ger, ord_r, f):
    r = f['root']; val = dict(zip(ord_r, r))
    R0 = euler(val.get('RX', 0), val.get('RY', 0), val.get('RZ', 0))
    pos = {'root': (np.array([val.get('TX', 0), val.get('TY', 0), val.get('TZ', 0)]), R0)}
    fine = {'root': pos['root'][0]}
    def visita(padre):
        for b in ger.get(padre, []):
            o = ossa[b]; C = euler(*o['axis']); v = dict(zip(o['dof'], f.get(b, [])))
            M = euler(v.get('rx', 0), v.get('ry', 0), v.get('rz', 0))
            Rp = pos[padre][1]; R = Rp @ C @ M @ C.T
            inizio = fine[padre]
            fine[b] = inizio + R @ (o['dir'] * o['len'])
            pos[b] = (inizio, R)
            visita(b)
    visita('root')
    return fine


# nome Mixamo -> punto CMU (fine dell'osso CMU indicato)
NODI = {'Hips': 'root', 'LeftUpLeg': 'lhipjoint', 'LeftLeg': 'lfemur', 'LeftFoot': 'ltibia', 'LeftToeBase': 'lfoot', 'LeftToe_End': 'ltoes',
        'RightUpLeg': 'rhipjoint', 'RightLeg': 'rfemur', 'RightFoot': 'rtibia', 'RightToeBase': 'rfoot', 'RightToe_End': 'rtoes',
        'Spine': 'lowerback', 'Spine1': 'upperback', 'Spine2': 'thorax', 'Neck': 'lowerneck', 'Head': 'upperneck', 'HeadTop_End': 'head',
        'LeftShoulder': 'thorax', 'LeftArm': 'lclavicle', 'LeftForeArm': 'lhumerus', 'LeftHand': 'lradius', 'LeftHandMiddle1': 'lhand',
        'RightShoulder': 'thorax', 'RightArm': 'rclavicle', 'RightForeArm': 'rhumerus', 'RightHand': 'rradius', 'RightHandMiddle1': 'rhand'}


def main():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    asf, amc, out = a[0], a[1], a[2]
    fps = int(a[3]) if len(a) > 3 else 30
    ossa, ger, ord_r = leggi_asf(asf)
    fot = leggi_amc(amc)
    da = int(a[4]) if len(a) > 4 else 0; al = int(a[5]) if len(a) > 5 else len(fot)
    fot = fot[da:al][::max(1, round(120 / fps))]
    k = 0.0254 * (1.0 / 0.45)  # unita' CMU: lunghezze in pollici * 0,45 -> metri
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.fps = fps; sc.frame_start = 1; sc.frame_end = len(fot)
    obj = {}
    for n in NODI:
        e = bpy.data.objects.new(n, None); sc.collection.objects.link(e); obj[n] = e
    for i, f in enumerate(fot):
        P = posizioni(ossa, ger, ord_r, f)
        for n, b in NODI.items():
            p = P[b] * k
            obj[n].location = (p[0], -p[2], p[1])  # Y su (CMU) -> Z su (Blender)
            obj[n].keyframe_insert('location', frame=i + 1)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_animations=True, export_yup=True,
                              export_animation_mode='SCENE')
    print(f'NODI {out}: fotogrammi {len(fot)} a {fps} fps = {len(fot) / fps:.2f} s')

