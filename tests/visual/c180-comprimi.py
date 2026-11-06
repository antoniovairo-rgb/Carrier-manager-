# [collaudo 180] riduce le foto del censimento a 128 colori (senza retinatura): ~4 volte piu' leggere, leggibili.
# Le misure del censimento si fanno sullo screenshot originale prima del salvataggio: comprimere non cambia nessun numero.
# Uso: python3 -I c180-comprimi.py <cartella> [eta_minima_secondi]  — salta i file gia' ridotti e quelli scritti da meno di N secondi.
import sys, os, time
from PIL import Image
d = sys.argv[1]; eta = float(sys.argv[2]) if len(sys.argv) > 2 else 20
n = 0; prima = dopo = 0
for f in sorted(os.listdir(d)):
    p = os.path.join(d, f)
    if not f.endswith('.png') or time.time() - os.path.getmtime(p) < eta: continue
    im = Image.open(p)
    if im.mode == 'P': continue
    s0 = os.path.getsize(p); im.convert('RGB').quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(p, optimize=True)
    n += 1; prima += s0; dopo += os.path.getsize(p)
print(f'{n} foto ridotte: {prima//1024} KB -> {dopo//1024} KB')
