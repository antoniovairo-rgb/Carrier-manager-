"""Read-only GLB audit. Usage: python rig-audit.py original.glb V22.html [output.json]."""
import argparse, base64, hashlib, io, json, re, struct
from pathlib import Path
import numpy as np
from PIL import Image

def audit(path):
    raw = Path(path).read_bytes()
    if Path(path).suffix.lower() == '.html':
        raw = base64.b64decode(re.search(rb'const EMBEDDED\s*=\s*"([^"]+)"', raw)[1])
    assert raw[:4] == b'glTF'
    jl = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20+jl]); binary = raw[28+jl:]
    def accessor(i):
        a=doc['accessors'][i]; v=doc['bufferViews'][a['bufferView']]
        dtype={5120:'i1',5121:'u1',5122:'<i2',5123:'<u2',5125:'<u4',5126:'<f4'}[a['componentType']]
        n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        dt=np.dtype(dtype)
        arr=np.ndarray((a['count'],n),dtype=dt,buffer=binary,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',n*dt.itemsize),dt.itemsize)).copy()
        if a.get('normalized') and dt.kind in 'ui':
            arr=arr.astype(float)/np.iinfo(dt).max
            if dt.kind=='i': arr=np.maximum(arr,-1)
        return arr
    nodes=doc['nodes']; parents={c:i for i,n in enumerate(nodes) for c in n.get('children',[])}
    def local(n):
        if 'matrix' in n: return np.array(n['matrix']).reshape(4,4).T
        x,y,z,w=n.get('rotation',[0,0,0,1]); m=np.eye(4)
        m[:3,:3]=np.array([[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w],[2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w],[2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y]])@np.diag(n.get('scale',[1,1,1]))
        m[:3,3]=n.get('translation',[0,0,0]); return m
    worlds={}
    def world(i):
        if i not in worlds: worlds[i]=(world(parents[i]) if i in parents else np.eye(4))@local(nodes[i])
        return worlds[i]
    def bounds(a): return {'min':a.min(axis=0).tolist(),'max':a.max(axis=0).tolist(),'size':np.ptp(a,axis=0).tolist()}
    results=[]
    for ni,node in enumerate(nodes):
        if 'skin' not in node or 'mesh' not in node: continue
        skin=doc['skins'][node['skin']]; js=skin['joints']; ibm=accessor(skin['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
        jw=np.stack([world(j) for j in js]); products=jw@ibm
        for primitive in doc['meshes'][node['mesh']]['primitives']:
            attrs=primitive['attributes']; p=accessor(attrs['POSITION']); w=accessor(attrs['WEIGHTS_0']); j=accessor(attrs['JOINTS_0']).astype(int)
            ph=np.c_[p,np.ones(len(p))]
            skinned=np.einsum('vjab,vb,vj->va', products[j],ph,w)[:,:3]
            source=(world(ni)@ph.T).T[:,:3]
            names=[nodes[i].get('name','') for i in js]
            groups={'torso':r'^(root|spine)', 'head':r'^(head|neck)',
                    'leftHand':r'^(hand|c_).*\.l_', 'rightHand':r'^(hand|c_).*\.r_',
                    'leftFoot':r'^(foot|toes).*\.l_', 'rightFoot':r'^(foot|toes).*\.r_'}
            anatomical={}
            for label,pattern in groups.items():
                indices=[k for k,name in enumerate(names) if re.search(pattern,name)]
                influence=np.where(np.isin(j,indices),w,0).sum(axis=1)
                selected=influence>=0.5
                anatomical[label]={'joints':[names[k] for k in indices],'dominantVertexCount':int(selected.sum()),
                    'totalInfluence':float(influence.sum()),
                    'weightedCenter':np.average(skinned,axis=0,weights=influence).tolist() if influence.sum() else None,
                    'dominantBounds':bounds(skinned[selected]) if selected.any() else None,
                    'sourceDominantBounds':bounds(source[selected]) if selected.any() else None}
            height=np.ptp(skinned[:,1]); center=lambda label: anatomical[label]['weightedCenter']
            anatomicalChecks={
                'allRequiredGroupsHaveDominantVertices':all(g['dominantVertexCount']>0 for g in anatomical.values()),
                'headAboveTorsoAboveFeet':bool(center('head')[1]>center('torso')[1]>max(center('leftFoot')[1],center('rightFoot')[1])),
                'handsOnOppositeSides':bool(center('leftHand')[0]*center('rightHand')[0]<0),
                'feetOnOppositeSides':bool(center('leftFoot')[0]*center('rightFoot')[0]<0),
                'footMinimumHeightDifferenceFraction':float(abs(anatomical['leftFoot']['dominantBounds']['min'][1]-anatomical['rightFoot']['dominantBounds']['min'][1])/height),
                'finiteSkinnedPositions':bool(np.isfinite(skinned).all()),
                'limitation':'Heuristics from authored skin weights; these detect gross collapse/order errors, not visual quality, topology correctness or animation deformation.'}
            results.append({'meshNode':ni,'vertexCount':len(p),'triangles':len(accessor(primitive['indices']))//3,'jointCount':len(js),'jointNames':[nodes[i].get('name') for i in js],
                'maxBindIdentityError':float(np.max(np.abs(products-np.eye(4)))), 'maxBindRelativeToMeshError':float(np.max(np.abs(products-world(ni)))),
                'weightSumMaxError':float(np.max(np.abs(w.sum(axis=1)-1))),'zeroWeightVertices':int(np.sum(w.sum(axis=1)==0)),'negativeWeights':int(np.sum(w<0)), 'outOfRangeJoints':int(np.sum(j>=len(js))),
                'localPositionBounds':bounds(p),'unskinnedWorldBounds':bounds(source),'skinnedWorldBounds':bounds(skinned),'maxSkinDisplacement':float(np.linalg.norm(skinned-source,axis=1).max()),
                'anatomicalGroups':anatomical,'anatomicalHeuristics':anatomicalChecks,
                'jointPositionBounds':bounds(jw[:,:3,3]),'jointNodesWithoutTRSOrMatrix':sum(not any(k in nodes[i] for k in ['translation','rotation','scale','matrix']) for i in js),
                'nodes':[{'index':i,'name':n.get('name'),'parent':parents.get(i),'translation':n.get('translation'),'rotation':n.get('rotation'),'scale':n.get('scale')} for i,n in enumerate(nodes)]})
    images=[]
    for image in doc.get('images',[]):
        info={'name':image.get('name'),'mimeType':image.get('mimeType')}
        if 'bufferView' in image:
            v=doc['bufferViews'][image['bufferView']]; data=binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
            with Image.open(io.BytesIO(data)) as im:
                info.update({'width':im.width,'height':im.height,'mode':im.mode,'encodedBytes':len(data),'estimatedRGBABytes':im.width*im.height*4,
                    'alphaExtrema':list(im.getchannel('A').getextrema()) if 'A' in im.getbands() else None})
        else: info['uri']=image.get('uri')
        images.append(info)
    materials=[{'name':m.get('name'),'alphaMode':m.get('alphaMode','OPAQUE'),'doubleSided':m.get('doubleSided',False),'pbr':m.get('pbrMetallicRoughness',{}),'normalTexture':m.get('normalTexture'),'emissiveTexture':m.get('emissiveTexture')} for m in doc.get('materials',[])]
    return {'source':str(path),'sha256':hashlib.sha256(raw).hexdigest(),'animations':len(doc.get('animations',[])),'meshCount':len(doc.get('meshes',[])),'skinCount':len(doc.get('skins',[])),'materialCount':len(materials),'materials':materials,'textureCount':len(doc.get('textures',[])),'images':images,'primitives':results}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('original',type=Path,help='Original GLB')
    parser.add_argument('rebuilt',type=Path,help='Rebuilt GLB or V22 HTML with const EMBEDDED')
    parser.add_argument('output',type=Path,nargs='?',default=Path(__file__).with_suffix('.json'))
    args=parser.parse_args()
    result=[audit(p) for p in [args.original,args.rebuilt]]
    output=args.output
    output.write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps([{k:v for k,v in r.items() if k!='primitives'}|{'primitives':[{k:v for k,v in p.items() if k not in ['nodes','jointNames']} for p in r['primitives']]} for r in result],indent=2))
