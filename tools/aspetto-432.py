# [giro 432 · PO-686] MASCHERE DELLA BARBA E TRAME DELLE CALOTTE, disegnate da zero (nessun pixel di terzi).
# Le maschere stanno nel CAMPO della tabella assets/aspetto/aspetto-432.json («campo_barba»: azimut -100..100 gradi da sinistra a
# destra, elevazione -75..15 gradi dal basso in alto, attorno al centro della testa). Punti di riferimento MISURATI sulla rete radiale
# della testa (sonda del giro 432, azimut 0 = fronte): punta del naso -21, base del naso -24, bocca -32 (mezza larghezza 14 gradi),
# mento -46..-55, sotto il mento fino a -66, orecchie a +-90.
# Le trame sono piastrelle ripetibili 128x128 in scala di grigi con alfa (il colore lo mette il materiale: capelli della figurina).
# Uso (dalla radice del repo): python3 tools/aspetto-432.py   → assets/aspetto/*.png
import os, random, math
from PIL import Image, ImageDraw, ImageFilter
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'assets/aspetto'); os.makedirs(OUT, exist_ok=True)
W = H = 128; AZ = (-100, 100); EL = (-75, 15)
def px(az, el): return ((az - AZ[0]) / (AZ[1] - AZ[0]) * W, (1 - (el - EL[0]) / (EL[1] - EL[0])) * H)
def poligono(punti):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([px(a, e) for a, e in punti], fill=255); return m
def ellisse(az, el, ra, re):
    m = Image.new('L', (W, H), 0); x0, y0 = px(az - ra, el + re); x1, y1 = px(az + ra, el - re); ImageDraw.Draw(m).ellipse([x0, y0, x1, y1], fill=255); return m
def meno(a, b): return Image.eval(Image.merge('LA', (a, b)).split()[0], lambda v: v) if False else Image.composite(Image.new('L', (W, H), 0), a, b)
def piu(a, b): return Image.eval(Image.blend(a, b, 0.5), lambda v: 255 if v > 0 else 0)
def salva(nome, m, sfuma=1.2):
    m = m.filter(ImageFilter.GaussianBlur(sfuma)); im = Image.new('LA', (W, H), 255); im.putalpha(m); im.save(os.path.join(OUT, nome), optimize=True)
# contorno della barba piena: sotto il mento (-66) fino alle basette (az +-86, el +4), guance in salita
guance = [(-86, -40), (-86, 2), (-78, 0), (-66, -8), (-52, -16), (-38, -24), (-27, -28), (-20, -27), (-14, -24.5), (0, -24), (14, -24.5), (20, -27), (27, -28), (38, -24), (52, -16), (66, -8), (78, 0), (86, 2), (86, -40), (60, -58), (30, -66), (0, -68), (-30, -66), (-60, -58)]
bocca = ellisse(0, -32, 13, 3.2)
piena = meno(poligono(guance), bocca)
salva('barba-piena.png', piena, 1.8)
# corta: stesso contorno, piu' rado (puntini) — l'alfa e' moltiplicata da un rumore fisso
random.seed(432); rado = Image.new('L', (W, H), 0); d = ImageDraw.Draw(rado)
for y in range(H):
    for x in range(W): d.point((x, y), fill=random.randint(85, 125))
corta = Image.composite(rado, Image.new('L', (W, H), 0), meno(poligono(guance), bocca))
salva('barba-corta.png', corta, 1.6)
baffi = meno(poligono([(-17, -29), (-14, -25.5), (-5, -24.3), (0, -24.5), (5, -24.3), (14, -25.5), (17, -29), (10, -27.8), (0, -27.4), (-10, -27.8)]), bocca)
salva('barba-baffi.png', baffi, 0.8)
mento = poligono([(-11, -37.5), (11, -37.5), (11, -45), (7, -51), (0, -53), (-7, -51), (-11, -45)])
salva('barba-pizzetto.png', piu(baffi, mento), 1.0)
# TRAME (piastrelle ripetibili): si disegna ogni forma anche spostata di +-128 per richiudere i bordi
def piastrella(seme, n, forma):
    random.seed(seme); im = Image.new('LA', (W, H), (0, 0)); d = ImageDraw.Draw(im)
    for i in range(n):
        x, y = random.random() * W, random.random() * H
        for dx in (-W, 0, W):
            for dy in (-H, 0, H): forma(d, x + dx, y + dy)
    return im
random.seed(4321); st = Image.new('LA', (W, H), (0, 0)); d = ImageDraw.Draw(st)
for y in range(H):
    for x in range(W): d.point((x, y), fill=(random.randint(150, 230), random.randint(110, 150)))  # stoppia: velo fitto e uniforme (alfa 0,45-0,6: la pelle del fondo traspare)
st.filter(ImageFilter.GaussianBlur(0.5)).save(os.path.join(OUT, 'trama-rasato.png'), optimize=True)
def riccio(d, x, y):
    r = random.uniform(3.0, 5.5); v = random.randint(150, 255)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(int(v * 0.55), 255)); d.arc([x - r, y - r, x + r, y + r], random.randint(0, 360), random.randint(0, 360) + 200, fill=(v, 255), width=2)
base = Image.new('LA', (W, H), (70, 255)); ri = piastrella(4322, 260, riccio); base.alpha_composite(ri) if False else None
base = Image.alpha_composite(base.convert('RGBA'), ri.convert('RGBA')).convert('LA'); base.save(os.path.join(OUT, 'trama-ricci.png'), optimize=True)
def afro(d, x, y):
    r = random.uniform(1.6, 3.0); v = random.randint(140, 255)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(int(v * 0.6), 255)); d.arc([x - r, y - r, x + r, y + r], random.randint(0, 360), random.randint(0, 360) + 220, fill=(v, 255), width=1)
ba = Image.new('LA', (W, H), (60, 255)); af = piastrella(4323, 900, afro)
Image.alpha_composite(ba.convert('RGBA'), af.convert('RGBA')).convert('LA').save(os.path.join(OUT, 'trama-afro.png'), optimize=True)
def pelo(d, x, y):
    a = random.uniform(-0.5, 0.5) + math.pi / 2; l = random.uniform(2, 4); v = random.randint(130, 255)
    d.line([x, y, x + math.cos(a) * l, y + math.sin(a) * l], fill=(v, 255), width=1)
pb = Image.new('LA', (W, H), (90, 250)); pe = piastrella(4324, 1400, pelo)
Image.alpha_composite(pb.convert('RGBA'), pe.convert('RGBA')).convert('LA').save(os.path.join(OUT, 'trama-barba.png'), optimize=True)
for f in sorted(os.listdir(OUT)):
    if f.endswith('.png'): print(f, os.path.getsize(os.path.join(OUT, f)))
