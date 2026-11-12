import sys,math,importlib.util
spec=importlib.util.spec_from_file_location('a',sys.argv[1]);a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
asf,amc,title,out=sys.argv[2:6]
bones,hier,ro=a.parse_asf(asf); fr=a.parse_amc(amc)
P=[a.fk(bones,hier,ro,f) for f in fr]
best=(0,0,'')
for side in ('rfoot','lfoot'):
  for i in range(1,len(P)):
    v=math.dist(P[i][side],P[i-1][side])*120
    if v>best[0]: best=(v,i,side)
v,i,side=best; n=len(fr)
s=max(0,i-108)/n; e=min(n,i+72)/n
a.svg(asf,amc,f"{title} · piede che calcia: {'destro' if side=='rfoot' else 'sinistro'} (picco a t={i/120:.2f}s)",out,10,s,e)
print(out,side,round(i/120,2),n)
