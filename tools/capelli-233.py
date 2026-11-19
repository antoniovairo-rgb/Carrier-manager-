#!/usr/bin/env python3
"""[giro 233 PO-453] Capelli in formato leggero: converte le quattro texture della testa CGTrader
(assets/hair-colors/source-textures/HEAD_hair_*.png, 2048x2048 RGBA, 2,4-2,6 MB l'una) in WebP qualita' 90
con l'alfa SENZA perdita (il ritaglio dei capelli e' binario: deve restare identico) in assets/hair-colors/webp/.
Stesso contenuto, stessa licenza del pacchetto CGTrader (docs/governo/CREDITI-fonti.md): non e' un asset nuovo.
Verifica: alfa identico pixel per pixel, differenza media di colore sui pixel visibili sotto 2/255. Esce 1 se non regge.
Uso: python3 tools/capelli-233.py"""
import io, os, sys
import numpy as np
from PIL import Image
SRC, DST = 'assets/hair-colors/source-textures', 'assets/hair-colors/webp'
os.makedirs(DST, exist_ok=True); ko = 0; tp = tw = 0
for k in ['brown', 'black', 'blond', 'auburn']:
    p = f'{SRC}/HEAD_hair_{k}.png'; im = Image.open(p).convert('RGBA'); b = io.BytesIO()
    im.save(b, 'WEBP', quality=90, method=6, alpha_quality=100, exact=True)
    w = Image.open(io.BytesIO(b.getvalue())).convert('RGBA'); a = np.asarray(im).astype(int); c = np.asarray(w).astype(int)
    da = int(np.abs(a[..., 3] - c[..., 3]).max()); dc = float(np.abs(a[..., :3] - c[..., :3])[a[..., 3] > 127].mean())
    open(f'{DST}/HEAD_hair_{k}.webp', 'wb').write(b.getvalue()); tp += os.path.getsize(p); tw += len(b.getvalue())
    ok = da == 0 and dc < 2 and w.size == im.size; ko += 0 if ok else 1
    print(f"{'ok ' if ok else 'KO '}{k}: {os.path.getsize(p)} -> {len(b.getvalue())} byte · {w.size[0]}x{w.size[1]} · alfa diff max {da} · colore diff media {dc:.2f}/255")
print(f'totale {tp/1048576:.2f} MB -> {tw/1048576:.2f} MB'); sys.exit(1 if ko else 0)
