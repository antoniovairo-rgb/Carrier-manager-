# [giro 444 · PO-686 ter] monta le foto di tests/visual/out/g444/foto (tests/visual/foto-444.mjs) in docs/collaudo-po/444-*.png:
# per giocatore e ora PRIMA (giro 440) sopra e DOPO (giro 444) sotto; per ora la fila dell'ingresso prima | dopo. Formato del 440.
import os
from PIL import Image, ImageDraw
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(REPO, 'tests/visual/out/g444/foto'); O = os.path.join(REPO, 'docs/collaudo-po')
NOMI = ['Connor_Quinn', 'Declan_Russell', 'Keith_Carr', 'Samuelito_Vairo', 'Sebastian_Maxwell', 'Norman_Bailey', 'Noah_Marshall', 'Aaron_Lane']
def due(a, b, out):
    if not (os.path.exists(a) and os.path.exists(b)): return
    A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB'); o = Image.new('RGB', (A.width, A.height + B.height)); o.paste(A, (0, 0)); o.paste(B, (0, A.height)); o.save(out, optimize=True)
for tod, it in (('night', 'notte'), ('day', 'giorno')):
    for i, n in enumerate(NOMI, 1):
        nn = n.lower().replace('_', '-')
        due(os.path.join(S, f'{tod}-prima-{n}.png'), os.path.join(S, f'{tod}-dopo-{n}.png'), os.path.join(O, f'444-{it}-{i}-{nn}.png'))
        due(os.path.join(S, f'{tod}-prima-{n}-dietro.png'), os.path.join(S, f'{tod}-dopo-{n}-dietro.png'), os.path.join(O, f'444-{it}-{i}-{nn}-dietro.png'))
    a, b = os.path.join(S, f'{tod}-prima-ingresso.png'), os.path.join(S, f'{tod}-dopo-ingresso.png')
    if os.path.exists(a) and os.path.exists(b):
        A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB'); o = Image.new('RGB', (A.width * 2 + 10, A.height + 40), (17, 17, 17)); o.paste(A, (0, 40)); o.paste(B, (A.width + 10, 40))
        d = ImageDraw.Draw(o); d.text((10, 12), f'ingresso in campo ({it}) - PRIMA (giro 440)', fill=(255, 255, 255)); d.text((A.width + 20, 12), 'DOPO (giro 444)', fill=(255, 255, 255))
        o.save(os.path.join(O, f'444-{it}-ingresso.png'), optimize=True)
print('ok')
