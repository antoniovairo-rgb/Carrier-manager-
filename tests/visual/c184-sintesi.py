# [collaudo 184] tabella dell'altezza vuota per schermata e formato. Uso: python3 -I c184-sintesi.py <cartella dati di c184-altezza/c184-provini>
import json,glob,os,sys
S=os.path.dirname(sys.argv[1].rstrip('/')) if len(sys.argv)>1 else os.path.dirname(os.path.abspath(__file__))
A={}
for k in ['s360','s412','pc']:
  d=json.load(open(f'{S}/dati/altezza-{k}-fuori+carriera+finestre+partita.json'))
  for sch,a in d['A'].items(): A.setdefault(sch,{})[k]=a
  p=json.load(open(f'{S}/dati/provini-{k}.json'))
  for sch,a in p['A'].items(): A.setdefault('P:'+sch,{})[k]=a
def cell(a):
  if not a: return '—'
  if a.get('scorre'): return 'scorre'
  return f"{a['vuoto']} px · {a['pct']}% ({a['classe']})" if a['classe']!='ok' else f"{a['vuoto']} px · {a['pct']}%"
print('| schermata | 360x800 | 412x915 | 1440x900 | ultimo contenuto (412) |\n|---|---|---|---|---|')
for sch,v in A.items():
  u=(v.get('s412') or v.get('s360') or {}).get('ultimo','')
  print(f"| {sch} | {cell(v.get('s360'))} | {cell(v.get('s412'))} | {cell(v.get('pc'))} | {str(u)[:38]} |")
print()
for sch,v in A.items():
  for k,a in v.items():
    if a.get('ctr'): print('CTR',sch,k,a['ctr'],a['ctrEs'][:3])
    if a.get('tocchi') and k!='pc': print('TOCCO',sch,k,a['tocchi'][:4])
    if a.get('hs'): print('HS',sch,k,a['hs'])
