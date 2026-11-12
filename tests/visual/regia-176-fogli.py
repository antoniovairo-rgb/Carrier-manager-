#!/usr/bin/env python3
"""[giro 176 · PO-367 D1] Fogli dei provini: per ogni famiglia una striscia «rosso (prima) | p | m | g» al momento del gesto,
e una striscia «prima | dopo» della scelta (mira sopra il pannello). Legge i PNG di lavoro di regia-176-provini.mjs e scrive
JPEG (qualita' 72) in docs/sviluppo/giro176/provini/. Uso: python3 regia-176-fogli.py <cartella PNG> <formato> [cartella uscita]"""
import os, sys, json
from PIL import Image, ImageDraw, ImageFont

src, fmt = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'sviluppo', 'giro176', 'provini')
os.makedirs(out, exist_ok=True)
mis = {}
try:
    for m in json.load(open(os.path.join(src, f'misure-{fmt}.json'))):
        mis[(m['nome'], m['br'])] = m
except Exception:
    pass
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
except Exception:
    font = ImageFont.load_default()
ETI = {'rosso': 'PRIMA (regia di oggi)', 'p': 'PROVINO P', 'm': 'PROVINO M (predefinito)', 'g': 'PROVINO G'}
fam = sorted({f.split('-')[1] for f in os.listdir(src) if f.startswith(fmt + '-') and f.endswith('.png')})
W = 420 if fmt.startswith('tel') else 720


def striscia(nomi, momento, nome_out):
    imgs = []
    for br in nomi:
        p = os.path.join(src, f'{fmt}-{f}-{br}-{momento}.png')
        if not os.path.exists(p):
            return
        im = Image.open(p).convert('RGB')
        im = im.resize((W, int(im.height * W / im.width)))
        d = ImageDraw.Draw(im)
        m = mis.get((f, br)) or {}
        h = m.get('eroeGesto' if momento.endswith('gesto') else 'eroeScelta')
        txt = ETI[br] + (f' · eroe {h}%' if h is not None else '')
        d.rectangle([0, 0, W, 40], fill=(0, 0, 0))
        d.text((10, 6), txt, fill=(255, 214, 90), font=font)
        imgs.append(im)
    H = max(i.height for i in imgs)
    sheet = Image.new('RGB', (len(imgs) * (W + 8) + 8, H + 16), (17, 17, 17))
    for k, im in enumerate(imgs):
        sheet.paste(im, (8 + k * (W + 8), 8))
    sheet.save(os.path.join(out, nome_out), quality=72)
    print('foglio', nome_out)


for f in fam:
    striscia(['rosso', 'p', 'm', 'g'], '2-gesto', f'{fmt}-{f}-gesto-provini.jpg')
    striscia(['rosso', 'm'], '1-scelta', f'{fmt}-{f}-scelta-prima-dopo.jpg')
