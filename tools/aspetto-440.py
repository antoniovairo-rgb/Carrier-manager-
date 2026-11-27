# [giro 440 · PO-686 bis] MAPPE DI DENSITA' DELLA BARBA e trama dei capelli lunghi, disegnate da zero (nessun pixel di terzi).
# Perche' un file nuovo: le maschere del giro 432 (tools/aspetto-432.py) erano binarie e messe su punti di riferimento sbagliati di 6-7 gradi
# (bocca a -32 invece di -39): i baffi finivano sotto il naso e il pizzetto copriva il labbro inferiore. Restano come sono: sono il ROSSO
# (window.__CPM_NO_G440 = resa del 432).
# Punti di riferimento MISURATI sulla texture della testa srotolata in azimut/elevazione (sonda del giro 440, rete radiale del giro 432):
#   occhi -5..0 · narici -22..-28 · base del naso -29 · labbro superiore -33..-38 · rima della bocca -39 (angoli a +-17, -40)
#   labbro inferiore -39..-44,5 · mento -46..-58 · sotto il mento da -58 · basette a +-85..90 fino a +4.
# Campo delle mappe (come «campo_barba» della tabella): azimut -100..100 (sinistra→destra), elevazione 15..-75 (alto→basso), 0,5 gradi/px.
# Ogni pixel = DENSITA' 0..1 dei peli (non una maschera): la trama dei peli la disegna il gioco (src/12 _texBarba440) con questa densita'.
# Regola fissa: le labbra (ellisse 0,-39, 17x5,8 gradi) hanno densita' 0 in OGNI forma.
# Uso (dalla radice del repo): python3 tools/aspetto-440.py
import os, math
import numpy as np
from PIL import Image
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'assets/aspetto'); os.makedirs(OUT, exist_ok=True)
W, H = 400, 180
AZ = -100 + (np.arange(W) + 0.5) * 0.5
EL = 15 - (np.arange(H) + 0.5) * 0.5
A, E = np.meshgrid(AZ, EL); AA = np.abs(A)
def ss(e0, e1, x):  # smoothstep da e0 (0) a e1 (1), anche decrescente
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def interp(xs, ys, x): return np.interp(x, xs, ys)
# labbra: densita' 0 dentro, 1,2 gradi di sfumatura fuori
LAB = np.sqrt((A / 17.0) ** 2 + ((E + 39.0) / 5.8) ** 2)
BOCCA = ss(1.0, 1.0 + 1.2 / 5.8, LAB)
# contorno della barba piena: bordo alto delle guance (sale dagli angoli della bocca alle basette) e bordo basso sul collo
TOP = interp([0, 16, 22, 32, 45, 60, 74, 84, 92], [-36, -36, -33, -28, -22, -16, -9, 0, 4], AA)
BOT = interp([0, 30, 55, 72, 84, 92], [-71, -69, -63, -54, -40, -30], AA)
def corpo(fade_top, fade_bot, lato=92):
    d = ss(TOP + 2.0, TOP - fade_top, E) * ss(BOT - 1.5, BOT + fade_bot, E) * ss(lato + 2, lato - 4, AA)
    folta = 0.55 + 0.45 * ss(-20, -50, E)  # piu' folta sul mento e sulla mascella, stoppia sulle guance alte
    return d * folta
def baffi(alto=-28.8, basso=-33.3, largo=20.0, dens=0.9):
    bas = basso - 2.2 * ss(9, largo, AA)  # agli angoli scendono un poco lungo la bocca
    alt = alto - 1.6 * ss(6, largo, AA)   # e si assottigliano: punte, non un rettangolo
    d = ss(alt + 1.0, alt - 1.5, E) * ss(bas - 0.6, bas + 0.8, E) * ss(largo + 1.0, largo - 5.0, AA)
    return d * dens * (0.85 + 0.15 * ss(14, 4, AA))
def mosca(dens=0.85):  # sotto il labbro inferiore, stretta, a goccia
    w = interp([-51, -49.5, -46, -44.5], [0, 3.0, 5.5, 0], E)
    return dens * ss(w + 0.8, w - 1.2, AA) * ss(-44.2, -45.4, E) * ss(-51.5, -49.5, E)
def mento(dens=0.9):  # pizzetto: mento arrotondato che segue la curva del mento (centro -53, 16x7,5 gradi)
    r = np.sqrt((A / 15.0) ** 2 + ((E + 51.0) / 6.0) ** 2)
    return dens * ss(1.0 + 2.2 / 6.0, 1.0 - 1.8 / 6.0, r) * ss(-45.2, -47.0, E)
def salva(nome, d):
    d = np.clip(d * BOCCA, 0, 1); Image.fromarray((d * 255).round().astype(np.uint8), 'L').save(os.path.join(OUT, nome), optimize=True)
    print(nome, os.path.getsize(os.path.join(OUT, nome)), 'labbra max', float((d * (LAB < 1)).max()))
piena = np.maximum(corpo(10.0, 6.0), baffi(dens=0.92))
salva('barba440-piena.png', piena)
corta = np.maximum(corpo(10.0, 8.0) * 0.62, baffi(dens=0.6))
salva('barba440-corta.png', corta)
stoppia = np.maximum(corpo(12.0, 10.0) * 0.34, baffi(dens=0.34))
salva('barba440-stoppia.png', stoppia)
salva('barba440-pizzetto.png', np.maximum(mosca(0.6), mento(0.6)))
salva('barba440-baffi.png', baffi(dens=0.72))
cerchio = np.maximum.reduce([mosca(), mento(), baffi(dens=0.85),
    0.6 * ss(21.0, 18.5, AA) * ss(15.0, 17.0, AA) * ss(-32, -35, E) * ss(-50, -46, E)])  # baffi + pizzetto uniti ai lati della bocca
salva('barba440-baffi-pizzetto.png', cerchio)
# CAPELLI LISCI (lunghi raccolti): piastrella 128x128 di ciocche pettinate (verticali nella piastrella), alfa piena
rng = np.random.default_rng(440)
T = np.zeros((128, 128), np.float32)
for _ in range(520):
    x0 = rng.uniform(0, 128); y0 = rng.uniform(0, 128); L = rng.uniform(20, 60); v = rng.uniform(0.55, 1.0); cur = rng.uniform(-0.08, 0.08)
    for s in np.linspace(0, L, int(L * 2)):
        x = (x0 + cur * s) % 128; y = (y0 + s) % 128; T[int(y), int(x)] = max(T[int(y), int(x)], v)
from PIL import ImageFilter
im = Image.fromarray((np.clip(0.42 + 0.58 * T, 0, 1) * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(0.45))
Image.merge('LA', (im, Image.new('L', (128, 128), 255))).save(os.path.join(OUT, 'trama440-lisci.png'), optimize=True)
print('trama440-lisci.png', os.path.getsize(os.path.join(OUT, 'trama440-lisci.png')))
