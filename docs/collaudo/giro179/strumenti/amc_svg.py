import sys, math, re
def rot(ax, d):
    a=math.radians(d); c,s=math.cos(a),math.sin(a)
    return {'x':[[1,0,0],[0,c,-s],[0,s,c]],'y':[[c,0,s],[0,1,0],[-s,0,c]],'z':[[c,-s,0],[s,c,0],[0,0,1]]}[ax]
def mm(A,B): return [[sum(A[i][k]*B[k][j] for k in range(3)) for j in range(3)] for i in range(3)]
def mv(A,v): return [sum(A[i][k]*v[k] for k in range(3)) for i in range(3)]
def T(A): return [list(r) for r in zip(*A)]
def eul(vals, order):
    R=[[1,0,0],[0,1,0],[0,0,1]]
    for ax,v in zip(order,vals): R=mm(R,rot(ax,v))   # matrice = Rx*Ry*Rz per ordine XYZ (convenzione ASF: applicata in ordine)
    return R
def parse_asf(p):
    t=open(p).read(); bones={}; root_order=None; root_axis=None
    m=re.search(r':root(.*?):bonedata',t,re.S); r=m.group(1)
    root_order=re.search(r'order\s+(.*)',r).group(1).split(); root_axis=re.search(r'axis\s+(\w+)',r).group(1).lower()
    for b in re.findall(r'begin(.*?)end',t.split(':bonedata')[1].split(':hierarchy')[0],re.S):
        name=re.search(r'name\s+(\S+)',b).group(1)
        d=[float(x) for x in re.search(r'direction\s+(\S+)\s+(\S+)\s+(\S+)',b).groups()]
        L=float(re.search(r'length\s+(\S+)',b).group(1))
        ax=re.search(r'axis\s+(\S+)\s+(\S+)\s+(\S+)\s+(\w+)',b); av=[float(x) for x in ax.groups()[:3]]; ao=ax.group(4).lower()
        dof=re.search(r'dof\s+(.*)',b); dof=dof.group(1).split() if dof else []
        C=eul(av,ao); bones[name]=dict(d=d,L=L,C=C,Ci=T(C),dof=[x[1] for x in dof])
    hier={}
    for line in t.split(':hierarchy')[1].split('begin')[1].split('end')[0].strip().splitlines():
        p_,*ch=line.split(); hier[p_]=ch
    return bones,hier,root_order
def parse_amc(p):
    frames=[]; cur=None
    for line in open(p):
        line=line.strip()
        if not line or line[0] in '#:': continue
        if line.isdigit(): cur={}; frames.append(cur); continue
        k,*v=line.split(); cur[k]=[float(x) for x in v]
    return frames
def fk(bones,hier,ro,fr):
    pos={}; R0=[[1,0,0],[0,1,0],[0,0,1]]
    rv=fr['root']; tr=rv[:3]; rr=rv[3:6]
    Rroot=eul([rr[ro.index(a)-3] for a in ['RX','RY','RZ'] if a in ro][:3] if False else [rr[0],rr[1],rr[2]],'xyz')
    pos['root']=tr
    def go(parent,Rp,pp):
        for c in hier.get(parent,[]):
            b=bones[c]; v=fr.get(c,[]); ang={'x':0,'y':0,'z':0}
            for a,val in zip(b['dof'],v): ang[a]=val
            M=eul([ang['x'],ang['y'],ang['z']],'xyz')
            L=mm(mm(b['C'],M),b['Ci']); R=mm(Rp,L)
            p=[pp[i]+x for i,x in enumerate(mv(R,[b['d'][j]*b['L'] for j in range(3)]))]
            pos[c]=p; go(c,R,p)
    go('root',Rroot,tr); return pos
def svg(asf,amc,title,out,n=10,start=0.0,end=1.0):
    bones,hier,ro=parse_asf(asf); fr=parse_amc(amc)
    i0=int(len(fr)*start); i1=int(len(fr)*end)-1
    idx=[i0+round(k*(i1-i0)/(n-1)) for k in range(n)]
    poses=[fk(bones,hier,ro,fr[i]) for i in idx]
    edges=[(p,c) for p,cs in hier.items() for c in cs]
    W=170;H=260; s=7.0
    o=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W*n}" height="{H+40}" style="background:#fff;font-family:sans-serif">',
       f'<text x="8" y="20" font-size="15">{title} — {len(fr)} fotogrammi a 120 fps = {len(fr)/120:.2f} s · vista di lato (asse x) · disegno nostro dai dati CMU</text>']
    for k,(i,P) in enumerate(zip(idx,poses)):
        rx=P['root'][0]; rz=P['root'][2]
        ox=W*k+W/2; oy=40+H-10
        for a,b in edges:
            if a not in P or b not in P: continue
            col='#c0392b' if b.startswith('r') and not b.startswith('root') else ('#2471a3' if b.startswith('l') and not b.startswith('lower') else '#333')
            x1=ox+(P[a][2]-rz)*s; y1=oy-P[a][1]*s; x2=ox+(P[b][2]-rz)*s; y2=oy-P[b][1]*s
            o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{col}" stroke-width="3" stroke-linecap="round"/>')
        o.append(f'<line x1="{W*k+5}" y1="{oy}" x2="{W*k+W-5}" y2="{oy}" stroke="#7a7"/>')
        o.append(f'<text x="{W*k+6}" y="{oy+18-H+8}" font-size="11">t={i/120:.2f}s</text>')
    o.append('</svg>'); open(out,'w').write('\n'.join(o))
if __name__=='__main__':
    svg(*sys.argv[1:5])
