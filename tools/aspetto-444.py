# [giro 444 · PO-686 ter] BAFFI FOLTI E LARGHI come in figurina, sempre senza coprire il labbro. Disegnati da zero (nessun pixel di terzi).
# Decisione PO 28/11 sulle foto del 440: «baffi troppo piccoli e sottili rispetto alla figurina (Quinn, Russell, Carr)».
# Misura (tests/visual/misura-444.mjs, mezza intensita'): la mappa del 440 (tools/aspetto-440.py, baffi(dens=0,72)) era piena solo fra
# -30,3 e -32,5 gradi al centro (2,2 gradi) e larga 20: nel 3D una riga sottile sopra il labbro; le figurine coprono tutto il filtro, dalla
# base del naso al labbro, e arrivano agli angoli della bocca scendendoci accanto.
# Stessi punti di riferimento del 440 (texture della testa srotolata): base del naso -29 · labbro superiore -33..-38 · rima -39, angoli a
# +-17. Il volo dei peli e la proiezione sul guscio spostano la resa di ~3 gradi in giu' (misurato: mappa -28,8..-33,3 → resa -32..-36):
# la mappa parte da -26,5 perche' la resa parta dalla base del naso.
# Regola fissa del 440: le labbra (ellisse 0,-39, 17x5,8 gradi) hanno densita' 0. Campo e formato come tools/aspetto-440.py.
# Uso (dalla radice del repo): python3 tools/aspetto-444.py
import os
import numpy as np
from PIL import Image
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'assets/aspetto')
W, H = 400, 180
AZ = -100 + (np.arange(W) + 0.5) * 0.5
EL = 15 - (np.arange(H) + 0.5) * 0.5
A, E = np.meshgrid(AZ, EL); AA = np.abs(A)
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
LAB = np.sqrt((A / 17.0) ** 2 + ((E + 39.0) / 5.8) ** 2)
BOCCA = ss(1.0, 1.0 + 1.2 / 5.8, LAB)  # 1,2 gradi di pelle libera attorno alle labbra, come il 440
ALTO = np.interp(AA, [0, 8, 14, 19, 24, 28], [-26.5, -26.0, -26.5, -28.0, -31.0, -34.5])   # bordo alto: dalla base del naso, scende verso le punte
BASSO = np.interp(AA, [0, 8, 12, 15, 18, 22, 28], [-32.4, -32.8, -34.0, -35.5, -37.5, -39.0, -39.5])  # bordo basso: sopra il labbro, poi accanto agli angoli
LARGO = 28.0
def baffi444(dens=0.95):
    d = ss(ALTO + 0.6, ALTO - 0.6, E) * ss(BASSO - 0.4, BASSO + 0.5, E) * ss(LARGO + 1.0, LARGO - 4.0, AA)  # bordi netti come un baffo folto (prima prova 1,0/1,2: Dylan e Gary a 3 gradi)
    return d * dens * (0.88 + 0.12 * ss(16, 4, AA))
d = np.clip(baffi444() * BOCCA, 0, 1)
Image.fromarray((d * 255).round().astype(np.uint8), 'L').save(os.path.join(OUT, 'barba444-baffi.png'), optimize=True)
print('barba444-baffi.png', os.path.getsize(os.path.join(OUT, 'barba444-baffi.png')), 'labbra max', float((d * (LAB < 1)).max()),
      'centro pieno da', float(EL[(d[:, W // 2] > 0.5)].max()), 'a', float(EL[(d[:, W // 2] > 0.5)].min()), 'larghezza a meta\'', float(2 * AZ[(d.max(0) > 0.5)].max()))
