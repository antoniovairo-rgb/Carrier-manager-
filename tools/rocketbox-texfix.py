#!/usr/bin/env python3
# [7.142.0 task #108] POST-PROCESSOR GLB per gli avatar MICROSOFT ROCKETBOX (licenza MIT).
# FBX2glTF non legge le texture TGA del repo ("Couldn't open file") e scrive placeholder 1x1:
# questo script riscrive il chunk JSON del GLB EMBEDDANDO le texture reali come PNG data-URI
# (color 1024px, opacity/capelli 512px + alphaMode BLEND + doubleSided), azzera metallic e
# (di default) TOGLIE le normal map -> variante "lean" ~4MB adatta al peso store.
# Uso:  python3 tools/rocketbox-texfix.py <in.glb> <dir-texture-tga> <out.glb>   [NORMALS=1 per tenerle]
# Filiera completa (verificata in sessione, docs/EXTRA-FIELD-MODELS.md):
#   git clone --filter=blob:none --sparse https://github.com/microsoft/Microsoft-Rocketbox
#   git sparse-checkout set "Assets/Avatars/Adults/<Nome>"
#   node_modules/fbx2gltf/bin/Linux/FBX2glTF --binary --input <Nome>.fbx --output raw
#   python3 tools/rocketbox-texfix.py raw.glb <.../Textures> assets/actor-<ruolo>.glb
import struct, json, base64, io, os, sys
from PIL import Image
GLB,TEXDIR,OUT=sys.argv[1],sys.argv[2],sys.argv[3]
NORMALS=os.environ.get('NORMALS','0')=='1'
with open(GLB,'rb') as f: d=f.read()
jlen=struct.unpack('<I', d[12:16])[0]
j=json.loads(d[20:20+jlen]); rest=d[20+jlen:]
mats=j.get('materials',[]); tex=j.get('textures',[])
PFX=(mats[0].get('name','x_x').split('_')[0]) if mats else 'x'
def png_uri(fn,maxs=1024):
    im=Image.open(os.path.join(TEXDIR,fn))
    if max(im.size)>maxs: im.thumbnail((maxs,maxs))
    buf=io.BytesIO(); im.save(buf,'PNG',optimize=True)
    return 'data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()
for m in mats:
    nm=m.get('name',''); stem=nm.replace(PFX+'_','')
    pbr=m.get('pbrMetallicRoughness',{})
    bt=pbr.get('baseColorTexture')
    if bt is not None:
        fn=f'{PFX}_{stem}_color.tga'
        if os.path.exists(os.path.join(TEXDIR,fn)):
            j['images'][tex[bt['index']]['source']]={'name':fn,'uri':png_uri(fn, 512 if stem=='opacity' else 1024)}
    if 'normalTexture' in m and not NORMALS: del m['normalTexture']
    elif 'normalTexture' in m and stem!='opacity':
        fn=f'{PFX}_{stem}_normal.tga'
        if os.path.exists(os.path.join(TEXDIR,fn)):
            j['images'][tex[m['normalTexture']['index']]['source']]={'name':fn,'uri':png_uri(fn)}
    if stem=='opacity': m['alphaMode']='BLEND'; m['doubleSided']=True
    pbr['metallicFactor']=0.0; pbr['roughnessFactor']=0.85
nj=json.dumps(j,separators=(',',':')).encode()
pad=(4-len(nj)%4)%4; nj+=b' '*pad
out=b'glTF'+struct.pack('<II',2,12+8+len(nj)+len(rest))+struct.pack('<I',len(nj))+b'JSON'+nj+rest
open(OUT,'wb').write(out)
print(os.path.basename(OUT), len(out)//1024,'KB')
