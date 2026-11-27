import json,sys,random
from PIL import Image,ImageDraw,ImageFilter,ImageChops
import struct,os
# [giro 412 · PO-612] PROVA della barba come strato: la maschera nasce dalla geometria della testa CGTrader (mesh col materiale
# Material.002 del LOD1), i triangoli di mento/mascella/labbro superiore si riportano sulle UV e si dipingono sulla texture dei capelli.
# Uso (dalla radice del repo): python3 tools/barba-412.py [cartella d'uscita, default tests/visual/out/g412/barba]
REPO=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(REPO,'tests/visual/out/g412/barba');os.makedirs(OUT,exist_ok=True)
def testa(f):
    b=open(f,'rb').read();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);o0=20+n+8
    def acc(i):
        a=j['accessors'][i];bv=j['bufferViews'][a['bufferView']];k={'SCALAR':1,'VEC2':2,'VEC3':3}[a['type']];o=o0+bv.get('byteOffset',0)+a.get('byteOffset',0)
        if a['componentType']==5126: return [list(struct.unpack_from('<%df'%k,b,o+i2*k*4)) for i2 in range(a['count'])]
        fm,w=('<H',2) if a['componentType']==5123 else ('<I',4)
        return [struct.unpack_from(fm,b,o+i2*w)[0] for i2 in range(a['count'])]
    mi=[i for i,m in enumerate(j['materials']) if m['name']=='Material.002'][0]
    for m in j['meshes']:
        for p in m['primitives']:
            if p.get('material')==mi: return acc(p['attributes']['POSITION']),acc(p['attributes']['TEXCOORD_0']),acc(p['indices'])
P,U,I=testa(os.path.join(REPO,'assets/cgtrader-review-lod1-kit-adapter.glb'))
S=2048
def peso(v,tipo):
    x,y,z=v; ax=abs(x)
    if z< -0.01: return 0
    lips = 1.551<y<1.569 and ax<0.024 and z>0.085
    if tipo=='baffi': return 1 if (1.566<y<1.588 and ax<0.032 and z>0.09) else 0
    if tipo=='pizzetto':
        return 1 if ((1.512<y<1.553 and ax<0.027 and z>0.05) or (1.567<y<1.586 and ax<0.03 and z>0.09)) else 0
    # corta/piena: mascella + mento + baffi, guance fino a 1.595 sui lati
    top = 1.588 if ax<0.03 else (1.60 if ax<0.06 else 1.615)
    if lips: return 0
    if 1.505<y<top and (z>0.0 or ax>0.05) and ax<0.075: return 1
    return 0
def maschera(tipo):
    m=Image.new('L',(S,S),0);g=ImageDraw.Draw(m)
    for t in range(0,len(I),3):
        a,b,c=I[t:t+3]; w=(peso(P[a],tipo)+peso(P[b],tipo)+peso(P[c],tipo))/3
        if w<=0: continue
        pts=[(U[k][0]*S,U[k][1]*S) for k in (a,b,c)]
        g.polygon(pts,fill=int(255*w))
    return m.filter(ImageFilter.GaussianBlur(6))
COL={'black':(20,18,16),'brown':(48,30,16),'blond':(150,115,60),'auburn':(110,45,20)}
ALFA={'corta':0.55,'piena':0.85,'pizzetto':0.8,'baffi':0.75}
def applica(var,tipo,out):
    base=Image.open(os.path.join(REPO,f'assets/hair-colors/webp/HEAD_hair_{var}.webp')).convert('RGBA')
    m=maschera(tipo)
    random.seed(412);rum=Image.effect_noise((S,S),60).convert('L')
    a=ImageChops.multiply(m,rum.point(lambda p:min(255,int(p*1.6)))) if tipo=='corta' else m
    a=a.point(lambda p:int(p*ALFA[tipo]))
    col=Image.new('RGBA',(S,S),COL[var]+(255,))
    rgb=Image.composite(col,base,a); rgb.putalpha(base.getchannel('A'))
    rgb.save(out,'WEBP',quality=88)
    m.save(out.replace('.webp','-maschera.png'))
for var in ['black','brown','blond','auburn']:
  for tipo in ['corta','piena','pizzetto','baffi']:
    applica(var,tipo,os.path.join(OUT,f'barba-{var}-{tipo}.webp'))
print('ok')
