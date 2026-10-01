#!/usr/bin/env python3
"""Applica i verdetti del PO al backlog e tiene l'ordine (aperte in cima, chiuse nello storico).
Uso: python3 tools/backlog-verdetti.py 'PO-158=FATTO — chiusa dal PO 01/10 («chiudi è OK»)' 'PO-159=PARZIALE — PO 01/10: «da completare»' ...
Lo stato che inizia con FATTO sposta la voce nello storico; gli altri la tengono (o la riportano) fra le aperte."""
import re, sys
from collections import Counter
B = 'docs/governo/BACKLOG.md'
s = open(B, encoding='utf-8').read()
ver = dict(a.split('=', 1) for a in sys.argv[1:])
a = s.index('## Voci aperte o parziali'); b = s.index('## Storico — voci chiuse'); c = s.index('## Ricostruzione')
op = s[a:b].split('\n'); cl = s[b:c].split('\n')
rows = [l for l in op + cl if l.startswith('| PO-')]
fatti = set()
for i, l in enumerate(rows):
    k = l.split(' | ')[0][2:]
    if k in ver:
        cc = l.split(' | '); cc[4] = ver[k]; rows[i] = ' | '.join(cc); fatti.add(k)
mancanti = set(ver) - fatti
if mancanti: sys.exit('voci non trovate: ' + ', '.join(sorted(mancanti)))
num = lambda l: int(re.match(r'\| PO-(\d+)', l).group(1))
order = {'L0': 0, 'L1': 1, 'L3': 3, 'L4': 4, 'L5': 5, 'L6': 6, 'L7': 7, 'L8': 8}
chiuse = sorted([l for l in rows if l.split(' | ')[4].strip().startswith('FATTO')], key=num)
aperte = sorted([l for l in rows if not l.split(' | ')[4].strip().startswith('FATTO')], key=lambda l: (order.get(l.split(' | ')[5].strip(), 9), num(l)))
hop = [l for l in op if not l.startswith('| PO-')]; hcl = [l for l in cl if not l.startswith('| PO-')]
sep = '|---|---|---|---|---|---|---|---|---|'
io, ic = hop.index(sep), hcl.index(sep)
cnt = Counter(l.split(' | ')[5].strip() for l in aperte)
summ = ' · '.join(f"{k} {cnt[k]}" for k in sorted(cnt, key=lambda k: order.get(k, 9)))
newop = hop[:io + 1] + aperte + hop[io + 1:]
newop[0] = re.sub(r'\(\d+\)', f'({len(aperte)})', newop[0])
newop = re.sub(r'Per lotto: [^\n]*\.', f'Per lotto: {summ}.', '\n'.join(newop), count=1)
newcl = hcl[:ic + 1] + chiuse + hcl[ic + 1:]
newcl[0] = re.sub(r'\(\d+\)', f'({len(chiuse)})', newcl[0])
s = s[:a] + newop + '\n'.join(newcl) + s[c:]
open(B, 'w', encoding='utf-8').write(s)
print(f'aggiornate {len(fatti)} · aperte {len(aperte)} · chiuse {len(chiuse)} · {summ}')
