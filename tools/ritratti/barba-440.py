# [giro 440 · PO-686 bis] COLORE DELLA BARBA MISURATO SULLA FIGURINA (come la pelle del giro 225: tools/ritratti/pelle-225.py).
# Per ogni giocatore con barba: colore medio (sRGB) del NUCLEO della barba sul ritratto 512x512 — mento (az +-7, el -56..-50) o baffi
# (az +-8, el -34,5..-31) — e della pelle di riferimento (guance sotto gli occhi, az 26..38, el -14..-8), con la stessa mappa
# azimut/elevazione → pixel della sonda tests/visual/misura-440.mjs (MAPPA_FIG440). Il gioco ricava il colore dei peli dalla miscela:
# nucleo = copertura x peli + (1 - copertura) x pelle (src/12 _peliDa440).
# Uscita: tools/ritratti/barba-440.json {n: [nucleo hex, pelle hex]} → indice.json campi bn/bp (tools/ritratti/indice-volti.mjs).
import json, math, os
import numpy as np
from PIL import Image
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KX, Y0, KY = 0.23, 0.375, 0.0058
M = json.load(open(os.path.join(REPO, 'assets/portraits/ai/manifest.json')))
def px(az, el): return 256 + KX * math.sin(math.radians(az)) * math.cos(math.radians(el)) * 512, (Y0 - KY * el) * 512
def zona(im, f, tutti=False):
    v = []
    for el2 in range(-140, 21):
        el = el2 / 2
        for az2 in range(-80, 81):
            az = az2 / 2
            if f(az, el): x, y = px(az, el); v.append(im[int(round(y)), int(round(x))])
    return np.array(v) if tutti else np.array(v).mean(0)
out = {}
for x in M:
    if x['categoria'] != 'giocatore' or x.get('barba') in (None, '', 'rasato'): continue
    n = int(''.join(c for c in x['id'] if c.isdigit()))
    im = np.asarray(Image.open(os.path.join(REPO, x['file'])).convert('RGB').resize((512, 512)), dtype=float)
    baffi = x['barba'] == 'baffi sottili'
    # [giro 444] baffi: zona larga (3-18 gradi di lato, -35..-25: dal naso al labbro, anche i baffi a matita) e media del 40% PIU' SCURO
    # (i peli), non della zona intera. La zona del 440 (az +-8, el -34,5..-31) cadeva fra filtro e labbro: colore rosato (Dylan Gray, Gary
    # Howard, Keith Carr nelle foto del 440). Il gioco usa per questi baffi la copertura 0,85 (tabella, «copertura444»).
    if baffi:
        v = zona(im, lambda a, e: 3 <= abs(a) <= 18 and -35 <= e <= -25, tutti=True); L = v @ np.array([0.2126, 0.7152, 0.0722])
        nuc = v[L <= np.quantile(L, 0.4)].mean(0)
    else:
        nuc = zona(im, lambda a, e: abs(a) <= 7 and -56 <= e <= -50)
    pel = zona(im, lambda a, e: 26 <= abs(a) <= 38 and -14 <= e <= -8)
    out[n] = ['%02x%02x%02x' % tuple(int(round(c)) for c in nuc), '%02x%02x%02x' % tuple(int(round(c)) for c in pel)]
json.dump(out, open(os.path.join(REPO, 'tools/ritratti/barba-440.json'), 'w'), separators=(',', ':'))
print(len(out), 'figurine con barba')
