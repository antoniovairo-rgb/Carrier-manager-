import json,glob,math,sys
out={}
for a in ['base','dopo','s100','reg']:
  R=[json.loads(l) for f in sorted(glob.glob(f'docs/sviluppo/dati-giro67/vivo/{a}-*.jsonl')) for l in open(f) if l.strip()]
  R=[r for r in R if not r.get('err') and r.get('score')]
  n=len(R)
  if not n: continue
  gS=sum(r['score']['home'] for r in R); gA=sum(r['score']['away'] for r in R)
  gE=sum((r['golEroe'] if r.get('golEroe') is not None else r['eroe']['gol']) for r in R)
  gP=sum(r['eroe']['gol'] for r in R if r.get('eroe')); tE=sum(r['eroe']['tiri'] for r in R if r.get('eroe')); aE=sum(r['eroe'].get('assist',0) for r in R if r.get('eroe'))
  vo=[r['eroe']['voto'] for r in R if r.get('eroe') and r['eroe'].get('voto') is not None]
  q=gE/gS if gS else None; se=math.sqrt(q*(1-q)/gS) if gS else None
  V=sum(1 for r in R if r['score']['home']>r['score']['away']);N=sum(1 for r in R if r['score']['home']==r['score']['away'])
  big=sum(1 for r in R if r['score']['home']>=5)
  out[a]=dict(n=n,golSquadra=gS,golEroe=gE,golEroePagella=gP,quota=round(q,3),ic95=[round(max(0,q-1.96*se),3),round(min(1,q+1.96*se),3)],gf=round(gS/n,2),gs=round(gA/n,2),golEroeGara=round(gE/n,2),tiriEroe=round(tE/n,2),assistEroe=(round(aE/n,2) if a!='base' else None),voto=round(sum(vo)/len(vo),2),V=V,N=N,P=n-V-N,cinquePiu=big,sec=round(sum(r['sec'] for r in R)/n))
  print(a,out[a])
json.dump(out,open(sys.argv[1],'w'),indent=1)
