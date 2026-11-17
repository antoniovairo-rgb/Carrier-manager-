"""[giro 242, solo prova] Esegue tools/retarget_cgtrader_clip.py SENZA modificarlo: le sorgenti «*.cmu» (asf|amc|da|a) diventano
nodi vuoti animati creati direttamente nella scena, al posto dell'import da file. Uso come lo strumento originale."""
import sys, os, types, bpy as _bpy
QUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, QUI)
import cmu_lib as C
STRUMENTO = sys.argv[sys.argv.index('--strumento') + 1]
def crea_nodi(spec):
    asf, amc, da, a = spec[:-4].split('|')
    ossa, ger, ordr = C.leggi_asf(asf); fot = C.leggi_amc(amc)[int(da):int(a)][::4]
    k = 0.0254 / 0.45; sc = _bpy.context.scene
    obj = {n: _bpy.data.objects.new(n, None) for n in C.NODI}
    for o in obj.values(): sc.collection.objects.link(o)
    for i, f in enumerate(fot):
        P = C.posizioni(ossa, ger, ordr, f)
        for n, b in C.NODI.items():
            p = P[b] * k; obj[n].location = (p[0], -p[2], p[1]); obj[n].keyframe_insert('location', frame=i + 1)
class _IS:
    def __getattr__(s, n): return getattr(_bpy.ops.import_scene, n)
    def gltf(s, filepath, **kw):
        if filepath.endswith('.cmu'): return crea_nodi(filepath)
        return _bpy.ops.import_scene.gltf(filepath=filepath, **kw)
class _OPS:
    import_scene = _IS()
    def __getattr__(s, n): return getattr(_bpy.ops, n)
finto = types.ModuleType('bpy'); finto.__dict__.update({k: getattr(_bpy, k) for k in dir(_bpy) if not k.startswith('__')}); finto.ops = _OPS()
sys.modules['bpy'] = finto
argv = sys.argv; i = argv.index('--strumento'); sys.argv = argv[:i] + argv[i + 2:]
src = open(STRUMENTO).read()
exec(compile(src, STRUMENTO, 'exec'), {'__name__': '__main__'})
