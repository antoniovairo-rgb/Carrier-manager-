#!/usr/bin/env python3
# [giro 225 · PO-489] CARNAGIONE MISURATA di ogni ritratto: mediana dei pixel del riquadro del viso (x 40-60%, y 36-50%: guance e naso,
# sotto gli occhi e sopra la bocca). La classe «k» dell'indice viene dal testo con cui il ritratto e' stato chiesto e non dal ritratto:
# dentro la stessa classe i visi differiscono (deviazione 9-21 livelli per canale). La scena 3D della presentazione colora la pelle del
# corpo con QUESTO colore, cosi' corpo e figurina dicono la stessa cosa.
# Uso: python3 tools/ritratti/pelle-225.py  → tools/ritratti/pelle-225.json ({numero: "rrggbb"}); poi node tools/ritratti/indice-volti.mjs
import json, sys
from PIL import Image
import numpy as np
M = json.load(open('assets/portraits/ai/manifest.json')); M = list(M.values()) if isinstance(M, dict) else M
out = {}
for x in M:
    n = int(''.join(c for c in x['id'] if c.isdigit()))
    im = Image.open(x['file']).convert('RGB'); w, h = im.size
    a = np.asarray(im.crop((int(w * .40), int(h * .36), int(w * .60), int(h * .50)))).reshape(-1, 3).astype(float)
    m = np.median(a, axis=0)
    out[str(n)] = '%02x%02x%02x' % tuple(int(round(v)) for v in m)
json.dump(out, open('tools/ritratti/pelle-225.json', 'w'), separators=(',', ':'), sort_keys=True)
print('carnagioni misurate:', len(out))
