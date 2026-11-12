#!/usr/bin/env python3
"""Giro 172 (PO-369) — misura di un file audio del gioco. Uso: python3 -I tools/audio-172/misura-file.py f1 [f2 ...]  → JSON su stdout.
Per ogni file: durata · picco dBFS · LUFS integrati (ffmpeg ebur128) · quota d'energia <100 Hz e >8 kHz · piattezza spettrale media
100-8000 Hz (1 = rumore bianco, ~0 = suono a righe/voce: il «fruscio» sintetico sta alto, una folla vera bassa) · GIUNTO del loop:
salto di campione fine→inizio (in unita' di fondo scala, e in rapporto al 99° percentile del passo fra campioni vicini) e differenza di livello RMS fra gli ultimi e i primi 50 ms (dB). """
import json, subprocess, sys
import numpy as np
SR = 48000
def pcm(p):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(b, np.float32).copy()
def lufs(p):
    e = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True).stderr.decode()
    v = [l for l in e.splitlines() if l.strip().startswith('I:')]
    try:
        x = float(v[-1].split()[1]); return None if x <= -69 else x
    except Exception: return None
def misura(p):
    x = pcm(p); n = len(x); dur = n / SR
    N = 4096; fr = np.fft.rfftfreq(N, 1 / SR); acc = np.zeros(len(fr)); fl = []
    for j in range(0, max(1, n - N), N // 2):
        s = x[j:j + N]
        if len(s) < N: s = np.pad(s, (0, N - len(s)))
        S = np.abs(np.fft.rfft(s * np.hanning(N))) ** 2; acc += S
        b = S[(fr > 100) & (fr < 8000)] + 1e-20
        if S.sum() > 1e-9: fl.append(np.exp(np.log(b).mean()) / b.mean())
    E = acc.sum() + 1e-20
    w = int(.05 * SR); w = min(w, n // 4) or 1
    r = lambda s: 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-12)
    pk = float(np.abs(x).max()) if n else 0
    return {'file': p, 'durata_s': round(dur, 3), 'picco_dbfs': round(20 * np.log10(pk + 1e-12), 1), 'lufs': lufs(p),
            'sotto100_pct': round(100 * acc[fr < 100].sum() / E, 2), 'sopra8k_pct': round(100 * acc[fr > 8000].sum() / E, 2),
            'piattezza': round(float(np.median(fl)) if fl else 0, 3),
            'giunto_salto': round(float(abs(x[-1] - x[0])) if n else 0, 4),
            # salto al giunto in rapporto al passo tipico fra due campioni vicini (99° percentile di |Δx|): ≫1 = clic, ≤1 = come dentro il file
            'giunto_rapporto': round(float(abs(x[-1] - x[0]) / (np.percentile(np.abs(np.diff(x)), 99) + 1e-9)) if n > 2 else 0, 2), 'giunto_db': round(float(r(x[-w:]) - r(x[:w])), 2) if n else 0}
print(json.dumps([misura(p) for p in sys.argv[1:]], ensure_ascii=False, indent=1))
