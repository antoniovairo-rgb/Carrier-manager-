import json,glob,collections,sys
D=sys.argv[1]
def fase(a): return 'gavetta 17-20' if a<=20 else 'affermazione 21-25' if a<=25 else 'elite 26-30' if a<=30 else 'declino 31+'
A=collections.defaultdict(lambda: collections.defaultdict(float))
for f in sorted(glob.glob(D+'/*.json')):
  d=json.load(open(f)); g=f.split('/')[-1].split('-')[0]
  ages={s['season']:s['age'] for s in d['seasons']}
  for s in d['seasons']:
    if s.get('proStatus')!='pro': continue
    F=fase(s['age']); a=A[(g,F)]; b=A[('tutte',F)]
    for x in (a,b):
      x['stag']+=1; x['ovr']+=s['ovr']
    for m in s.get('mh') or []:
      if m.get('ctx') not in (None,'career','league'): pass
      for x in (a,b):
        x['gare']+=1; x['gol']+=m.get('g') or 0; x['ass']+=m.get('a') or 0
        if m.get('r') is not None: x['rN']+=1; x['r']+=m['r']
        x['V']+= 1 if m.get('won') else 0; x['N']+= 1 if m.get('drew') else 0
        x['live']+= 0 if m.get('sim') else 1
  for c in d.get('decisions') or []:
    if c.get('type')!='league' or c.get('exp') or c.get('inj'): continue
    age=ages.get(c['s']); 
    if age is None: continue
    F=fase(age); mins=90 if c['st']=='starter' else (90-(c.get('em') or 90)) if c['st']=='bench' else 0
    for x in (A[(g,F)],A[('tutte',F)]):
      x['dN']+=1; x['min']+=mins; x['tit']+= 1 if c['st']=='starter' else 0
out={}
for k in sorted(A):
  x=A[k]; n=max(x['gare'],1)
  out['|'.join(k)]=dict(stagioni=int(x['stag']),ovr=round(x['ovr']/max(x['stag'],1),1),gare=int(x['gare']),gare_live=int(x['live']),voto=round(x['r']/max(x['rN'],1),2),gol_gara=round(x['gol']/n,3),ass_gara=round(x['ass']/n,3),
    vitt=round(100*x['V']/n,1),pari=round(100*x['N']/n,1),sconf=round(100*(n-x['V']-x['N'])/n,1),min_teorici=round(x['min']/max(x['dN'],1),1),titolare=round(100*x['tit']/max(x['dN'],1),1),gare_decise=int(x['dN']))
  print(k, out['|'.join(k)])
json.dump(out,open(sys.argv[2],'w'),indent=1)
