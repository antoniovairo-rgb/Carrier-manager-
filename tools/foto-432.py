# [giro 432 · PO-686] monta le foto di tests/visual/out/g432/foto (prodotte da tests/visual/foto-432.mjs) in docs/collaudo-po/432-*.png:
# per giocatore e ora, PRIMA sopra e DOPO sotto; per ora, la fila dell'ingresso prima | dopo.
import os
from PIL import Image, ImageDraw
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(REPO, 'tests/visual/out/g432/foto'); O = os.path.join(REPO, 'docs/collaudo-po')
NOMI = ['Samuelito_Vairo', 'Sebastian_Maxwell', 'Norman_Bailey', 'Trevor_Smith', 'Keith_Thornton', 'Connor_Quinn']
for tod, it in (('night', 'notte'), ('day', 'giorno')):
    for i, n in enumerate(NOMI, 1):
        a, b = os.path.join(S, f'{tod}-prima-{n}.png'), os.path.join(S, f'{tod}-dopo-{n}.png')
        if not (os.path.exists(a) and os.path.exists(b)): continue
        A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB'); o = Image.new('RGB', (A.width, A.height + B.height)); o.paste(A, (0, 0)); o.paste(B, (0, A.height))
        o.save(os.path.join(O, f'432-{it}-{i}-{n.lower().replace("_", "-")}.png'), optimize=True)
    a, b = os.path.join(S, f'{tod}-prima-ingresso.png'), os.path.join(S, f'{tod}-dopo-ingresso.png')
    if os.path.exists(a) and os.path.exists(b):
        A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB'); o = Image.new('RGB', (A.width * 2 + 10, A.height + 40), (17, 17, 17)); o.paste(A, (0, 40)); o.paste(B, (A.width + 10, 40))
        d = ImageDraw.Draw(o); d.text((10, 12), f'ingresso in campo ({it}) - PRIMA', fill=(255, 255, 255)); d.text((A.width + 20, 12), 'DOPO (giro 432)', fill=(255, 255, 255))
        o.save(os.path.join(O, f'432-{it}-ingresso.png'), optimize=True)
print('ok')
