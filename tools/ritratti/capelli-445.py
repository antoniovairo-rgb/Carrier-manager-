# [giro 445] COLORE DEI CAPELLI MISURATO SULLA FIGURINA (come la barba del giro 440: tools/ritratti/barba-440.py).
# Per ogni giocatore: colore mediano (sRGB) dei pixel di CAPELLI nelle zone della testa — sommita' (az +-25, el 38..58) e lati sopra le
# orecchie (|az| 52..78, el 12..38) — con la stessa mappa azimut/elevazione -> pixel della sonda tests/visual/misura-440.mjs (MAPPA_FIG440).
# Un pixel e' «capelli» se non e' fondale (L* < 90 o croma > 8) e se sta a piu' di 14 CIE76 dalla pelle misurata sul ritratto (campo p del
# giro 225, guance sotto gli occhi se manca): cosi' la pelle che si vede fra i capelli radi (stempiati) non sporca la misura.
# Meno di 40 pixel di capelli → nessun valore (il gioco usa la tinta della classe). Uscita: tools/ritratti/capelli-445.json {n: hex}
# → indice.json campo hc (tools/ritratti/indice-volti.mjs). CPM_PROVA=dir: sovrappone i pixel scelti su alcune figurine.
import json, math, os, sys
import numpy as np
from PIL import Image
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KX, Y0, KY = 0.23, 0.375, 0.0058
M = json.load(open(os.path.join(REPO, 'assets/portraits/ai/manifest.json')))
P225 = json.load(open(os.path.join(REPO, 'tools/ritratti/pelle-225.json')))
def px(az, el): return 256 + KX * math.sin(math.radians(az)) * math.cos(math.radians(el)) * 512, (Y0 - KY * el) * 512
def lab(rgb):
    c = rgb / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    X = (c[..., 0] * 0.4124 + c[..., 1] * 0.3576 + c[..., 2] * 0.1805) / 0.95047; Y = c[..., 0] * 0.2126 + c[..., 1] * 0.7152 + c[..., 2] * 0.0722; Z = (c[..., 0] * 0.0193 + c[..., 1] * 0.1192 + c[..., 2] * 0.9505) / 1.08883
    f = lambda t: np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    return np.stack([116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))], -1)
PUNTI = []
for el2 in range(24, 117):
    for az2 in range(-160, 161):
        az, el = az2 / 2, el2 / 2
        if (abs(az) <= 25 and 38 <= el <= 58) or (52 <= abs(az) <= 78 and 12 <= el <= 38): PUNTI.append(px(az, el))
PUNTI = np.array(PUNTI)
out, prova = {}, os.environ.get('CPM_PROVA')
for x in M:
    if x['categoria'] != 'giocatore': continue
    n = int(''.join(c for c in x['id'] if c.isdigit()))
    im = np.asarray(Image.open(os.path.join(REPO, x['file'])).convert('RGB').resize((512, 512)), dtype=float)
    xs, ys = np.clip(np.round(PUNTI[:, 0]).astype(int), 0, 511), np.clip(np.round(PUNTI[:, 1]).astype(int), 0, 511)
    v = im[ys, xs]; L = lab(v)
    pelle = P225.get(str(n)); pl = lab(np.array([int(pelle[i:i + 2], 16) for i in (0, 2, 4)], dtype=float)) if pelle else None
    cro = np.hypot(L[:, 1], L[:, 2]); ok = (L[:, 0] < 90) | (cro > 8)
    if pl is not None: ok &= np.linalg.norm(L - pl, axis=1) > 14
    if ok.sum() < 40: continue
    med = np.median(v[ok], 0); out[n] = '%02x%02x%02x' % tuple(int(round(c)) for c in med)
    if prova and n in (822, 826, 1, 2, 3, 40, 41, 42):
        os.makedirs(prova, exist_ok=True); o = Image.fromarray(im.astype(np.uint8)); px_ = o.load()
        for i in np.where(ok)[0]: px_[int(xs[i]), int(ys[i])] = (255, 0, 255)
        o.save(os.path.join(prova, f'{n}.png'))
json.dump(out, open(os.path.join(REPO, 'tools/ritratti/capelli-445.json'), 'w'), separators=(',', ':'))
print(len(out), 'figurine con il colore dei capelli')
