#!/usr/bin/env python3
"""Vagoni che non si pestano i piedi (PO 24/11 11:10).

Prima di mettere piu' vagoni sullo stesso treno: per ogni coppia di rami elenca i file di codice toccati da entrambi
(dall'antenato comune col lavoro corrente). Due vagoni che toccano lo stesso file di gioco (src/*), lo stesso guardiano
o la stessa macchina del treno vanno su treni DIVERSI; i file di governo, i rapporti e le foto non contano.
Uso: python3 tools/vagoni-incrocio.py [--base origin/lavoro/201] origin/sviluppo/giroA origin/sviluppo/giroB ...
Esce 1 se c'e' almeno un incrocio.
"""
import subprocess, sys, itertools, re

NEUTRI = re.compile(r'^(docs/(governo|sviluppo|collaudo-po|collaudo-grafico)/|.*\.md$|CARRIER-MANAGER-AV\.html$)')
# registri che quasi ogni giro tocca con una riga (MAPPA, script npm): si uniscono coi risolutori, contano come avviso
REGISTRI = {'tests/visual/ci-runner.mjs', 'tests/visual/package.json'}

def files(base, ramo):
    mb = subprocess.check_output(['git', 'merge-base', base, ramo], text=True).strip()
    out = subprocess.check_output(['git', 'diff', '--name-only', mb, ramo], text=True).split()
    return {f for f in out if not NEUTRI.match(f)}

def main(a):
    base = 'origin/lavoro/201'
    if a[:1] == ['--base']: base, a = a[1], a[2:]
    F = {r: files(base, r) for r in a}
    incroci = 0
    for x, y in itertools.combinations(a, 2):
        c = sorted(F[x] & F[y])
        duri = [f for f in c if f not in REGISTRI]
        if duri:
            incroci += 1
            print(f'✗ {x} × {y}: {", ".join(duri)}')
        elif c:
            print(f'· {x} × {y}: solo registri ({", ".join(c)}), si uniscono coi risolutori')
    for r in a: print(f'  {r}: {len(F[r])} file di codice')
    print('✅ nessun incrocio: possono viaggiare insieme' if not incroci else f'⚠ {incroci} coppie si pestano i piedi: treni diversi')
    return 1 if incroci else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
