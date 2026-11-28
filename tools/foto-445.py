# [giro 445] monta le foto di tests/visual/out/g445/foto (tests/visual/foto-445.mjs) in docs/collaudo-po/445-*.png:
# per giocatore e ora: PRIMA (resa del 440) sopra e DOPO sotto, sia le quattro viste della testa sia figurina | corpo | primo piano.
import os
from PIL import Image
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(REPO, 'tests/visual/out/g445/foto'); O = os.path.join(REPO, 'docs/collaudo-po')
NOMI = ['Keith_Carr', 'Noah_Marshall', 'Jackson_Burke', 'Declan_Russell', 'Gary_Howard']
def pila(a, b, out):
    if not (os.path.exists(a) and os.path.exists(b)): return
    A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB'); o = Image.new('RGB', (max(A.width, B.width), A.height + B.height), (17, 17, 17)); o.paste(A, (0, 0)); o.paste(B, (0, A.height)); o.save(out, optimize=True)
for tod, it in (('night', 'notte'), ('day', 'giorno')):
    for i, n in enumerate(NOMI, 1):
        m = n.lower().replace('_', '-')
        pila(os.path.join(S, f'{tod}-prima-{n}-viste.png'), os.path.join(S, f'{tod}-dopo-{n}-viste.png'), os.path.join(O, f'445-{it}-{i}-{m}-viste.png'))
        pila(os.path.join(S, f'{tod}-prima-{n}.png'), os.path.join(S, f'{tod}-dopo-{n}.png'), os.path.join(O, f'445-{it}-{i}-{m}.png'))
print('ok')
