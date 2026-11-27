#!/usr/bin/env python3
"""[giro 429 — PO-692 «la musica che si sente nel pannello iniziale non e' molto bella» → «Proponimi 3 brani»]
Prepara i TRE CANDIDATI per la musica del menu (non sostituiscono il brano in gioco: il PO li ascolta prima).

  python3 -I tools/audio-429/prepara-429.py [--cache DIR]

1. scarica ogni sorgente (OpenGameArt, licenza CC0 letta sulla pagina il 2026-11-27) e ne VERIFICA lo sha256;
2. ritaglia un LOOP di 45-90 s:
   - A «Determined Pursuit»: il brano dell'autore si ripete IDENTICO con periodo 54 s (correlazione 1,000 misurata da 36 s in poi):
     il loop e' il tratto [36, 90) s, senza dissolvenze (il campione dopo la fine e' il primo del loop);
   - B «Virtual Rush»: nessuna ripetizione esatta; tratto di 32 battute che parte a 16 s, periodo cercato per correlazione della forma
     d'onda attorno a 63,8 s, poi la coda (2 s) si FONDE nella testa a potenza costante (metodo del giro 172): giunto senza salto;
   - C «Fever Stadium»: loop d'autore intero («This music is loopable»), 85,8 s, nessun taglio;
3. normalizza a -19 LUFS integrati (taratura di spiaggia-loop, giro 149), picco <= -1,5 dBFS;
4. codifica Ogg/Opus 96k + MP3 128k (come la musica del giro 149) in assets/audio/music/menu/ e copia l'mp3 in docs/collaudo-po/;
5. scrive le tre righe nel registro assets/audio/LICENZE.json, sezione «altri» (file che il giro 149 non produce: non entrano nella
   tabella F149 ne' nella precarica di sw.js, si scaricano solo se il PO accende l'interruttore di prova).
"""
import hashlib, json, os, shutil, subprocess, sys, urllib.request
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
OUT = os.path.join(ROOT, 'assets/audio')
CACHE = sys.argv[sys.argv.index('--cache') + 1] if '--cache' in sys.argv else os.path.join(ROOT, 'tools/audio-429/.cache')
SR = 48000
LETTA = '2026-11-27'
BRANI = {
  'A': {'nome': 'music/menu/429-a-orchestra', 'titolo': 'Determined Pursuit (Epic Orchestra Loop)', 'autore': 'Emma_MA',
        'pagina': 'https://opengameart.org/content/determined-pursuit-epic-orchestra-loop',
        'file': 'https://opengameart.org/sites/default/files/determined_pursuit_loop.wav',
        'sha256': 'e4f3be098b50213b56a60aefe60fffae79cd9f7c9008088f93c187ef1bbc856b',
        'licenza': "CC0 (campo License(s) della pagina OpenGameArt). Copyright/Attribution Notice dell'autore: «This track is in the public domain as of January 2017. No attribution necessary.»",
        'taglio': ('esatto', 36.0, 54.0)},
  'B': {'nome': 'music/menu/429-b-elettronica', 'titolo': 'Virtual Rush (loop)', 'autore': 'Vitalezzz',
        'pagina': 'https://opengameart.org/content/virtual-rush',
        'file': 'https://opengameart.org/sites/default/files/virtual_rush_loop_0.flac',
        'sha256': 'dd30243c6aebc7a18f243c7c55694a0a6624456b6669a542a27a8a6c4eea0548',
        'licenza': "CC0 (campo License(s) della pagina OpenGameArt). Copyright/Attribution Notice: «Vitalezzz - Virtual Rush» (non richiesto dal CC0, lo diamo comunque)",
        'taglio': ('fuso', 16.0, 63.79, 2.0)},
  'C': {'nome': 'music/menu/429-c-stadio', 'titolo': 'Fever Stadium (bpm165)', 'autore': 'MintoDog',
        'pagina': 'https://opengameart.org/content/fever-stadium',
        'file': 'https://opengameart.org/sites/default/files/fever_stadium_bpm165_0.ogg',
        'sha256': '65c892eba361402e1519c01e5082781931879d247c39a80e45af044303766a6a',
        'licenza': "CC0 (campo License(s) della pagina OpenGameArt). Descrizione dell'autore: «This music is loopable.»",
        'taglio': ('intero',)},
}


def sh(*a, **k):
    r = subprocess.run(a, capture_output=True, **k)
    if r.returncode: raise SystemExit(f"comando fallito: {' '.join(a[:6])}…\n{r.stderr.decode()[-400:]}")
    return r


def sorgente(L, s):
    os.makedirs(CACHE, exist_ok=True); p = os.path.join(CACHE, L + '.' + s['file'].rsplit('.', 1)[-1])
    if not os.path.exists(p):
        open(p, 'wb').write(urllib.request.urlopen(urllib.request.Request(s['file'], headers={'User-Agent': 'cpm-audio-prep/1.0'}), timeout=120).read())
    h = hashlib.sha256(open(p, 'rb').read()).hexdigest()
    if h != s['sha256']: raise SystemExit(f"HASH DIVERSO per {L}: {h} — la sorgente e' cambiata, rileggere la licenza")
    return p


def pcm(path):
    return np.frombuffer(sh('ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-').stdout, np.float32).reshape(-1, 2).copy()


def scrivi_wav(p, x):
    sh('ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', p, input=x.astype(np.float32).tobytes())


def lufs(x):
    tmp = os.path.join(CACHE, '_m.wav'); scrivi_wav(tmp, x)
    e = sh('ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'ebur128=peak=true', '-f', 'null', '-').stderr.decode()
    return float([l for l in e.splitlines() if l.strip().startswith('I:')][-1].split()[1])


def giunto(x):
    """salto al giunto del loop (ultimo → primo campione) contro il 99° percentile dei passi fra campioni vicini del brano"""
    d = np.abs(np.diff(x, axis=0)).max(axis=1)
    return float(np.abs(x[0] - x[-1]).max()), float(np.percentile(d, 99))


def periodo(x, a, P0, cerca=0.02, W=4.0):
    m = x.mean(axis=1); A = int(a * SR); w = m[A:A + int(W * SR)]; best = (-2, P0)
    for P in range(int((P0 - cerca) * SR), int((P0 + cerca) * SR)):
        v = m[A + P:A + P + len(w)]; c = float(np.dot(w, v) / np.sqrt(np.dot(w, w) * np.dot(v, v) + 1e-12))
        if c > best[0]: best = (c, P / SR)
    return best


def main():
    reg_p = os.path.join(OUT, 'LICENZE.json'); reg = json.load(open(reg_p, encoding='utf8'))
    for L, s in BRANI.items():
        x = pcm(sorgente(L, s)); t = s['taglio']; nota = ''
        if t[0] == 'esatto':
            a, P = t[1], t[2]; c, _ = periodo(x, a, P, cerca=0.0005)
            y = x[int(a * SR): int((a + P) * SR)].copy(); nota = f'tratto [{a:g}, {a + P:g}) s: il brano si ripete identico con periodo {P:g} s (correlazione {c:.4f})'
        elif t[0] == 'fuso':
            a, P0, lf_s = t[1], t[2], t[3]; c, P = periodo(x, a, P0)
            n = int(round(P * SR)); lf = int(lf_s * SR); seg = x[int(a * SR): int(a * SR) + n + lf].copy(); q = np.linspace(0, np.pi / 2, lf)[:, None]
            y = np.concatenate([seg[:lf] * np.sin(q) + seg[n:n + lf] * np.cos(q), seg[lf:n]])
            nota = f'tratto da {a:g} s, periodo {P:.4f} s (correlazione {c:.3f}), coda di {lf_s:g} s fusa nella testa a potenza costante'
        else:
            y = x; nota = "brano intero, loop dell'autore"
        L0 = lufs(y); y = y * 10 ** ((-19 - L0) / 20); pk = np.abs(y).max()
        if pk > 10 ** (-1.5 / 20): y = y * (10 ** (-1.5 / 20) / pk)
        base = os.path.join(OUT, s['nome']); os.makedirs(os.path.dirname(base), exist_ok=True)
        tmp = os.path.join(CACHE, '_o.wav'); scrivi_wav(tmp, y)
        sh('ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'libopus', '-b:a', '96k', '-vbr', 'on', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-serial_offset', '429', base + '.ogg')
        sh('ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '128k', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', base + '.mp3')
        os.makedirs(os.path.join(ROOT, 'docs/collaudo-po'), exist_ok=True)
        shutil.copyfile(base + '.mp3', os.path.join(ROOT, f'docs/collaudo-po/429-brano-{L}.mp3'))
        salto, p99 = giunto(y); Lf = lufs(y)
        riga = {'evento': 'music.home (solo prova: interruttore __CPM_MENU429 / cpm-menu429)', 'cc0': True, 'candidato': L, 'titolo': s['titolo'],
                'generatore': 'tools/audio-429/prepara-429.py', 'formati': ['ogg', 'mp3'], 'durata_s': round(len(y) / SR, 3), 'canali': 2,
                'lufs': round(Lf, 1), 'picco_dbfs': round(float(20 * np.log10(np.abs(y).max() + 1e-12)), 1), 'loop': True,
                'giunto': {'salto': round(salto, 5), 'p99_passi': round(p99, 5)},
                'byte': {'ogg': os.path.getsize(base + '.ogg'), 'mp3': os.path.getsize(base + '.mp3')},
                'sorgente': {'pagina': s['pagina'], 'file': s['file'], 'autore': s['autore'], 'licenza': s['licenza'], 'letta': LETTA, 'sha256': s['sha256'], 'taglio': nota}}
        for f in ('ogg', 'mp3'): reg['altri'][s['nome'] + '.' + f] = riga
        print(f"{L} {s['nome']:30s} {riga['durata_s']:6.2f}s LUFS={riga['lufs']} pk={riga['picco_dbfs']} giunto={salto:.4f} (p99 {p99:.4f}) ogg={riga['byte']['ogg']//1024}KB mp3={riga['byte']['mp3']//1024}KB · {nota}")
    json.dump(reg, open(reg_p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
