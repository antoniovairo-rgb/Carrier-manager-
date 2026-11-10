#!/usr/bin/env python3
"""Giro 149 (PO-351) — prepara i file audio CC0 del gioco, in modo riproducibile.

  python3 -I tools/audio-149/prepara-audio.py [--cache DIR]

1. scarica ogni sorgente di tools/audio-149/sorgenti.json nella cache (se non c'e' gia') e ne VERIFICA lo sha256:
   un hash diverso ferma tutto (il file alla fonte e' cambiato: la licenza va riletta);
2. taglia/filtra ogni uscita dell'elenco USCITE qui sotto;
3. normalizza: suoni SOSTENUTI (>= 1 s: folla, fischietto, jingle, musica) a -18 LUFS integrati con picco <= -1,5 dBFS;
   suoni d'IMPATTO (< 1 s, dove i LUFS integrati non sono definiti: il gating EBU R128 lavora su blocchi da 400 ms)
   a picco -3 dBFS;
4. codifica Ogg/Opus (prima scelta) + MP3 (riserva, per i browser che non decodificano Opus);
5. scrive assets/audio/LICENZE.json: per ogni file la sorgente, l'autore, la licenza letta, l'hash della sorgente,
   il taglio, le misure (durata, LUFS, picco, RMS) e il guadagno di riproduzione `g` usato dal gioco.
Requisiti: ffmpeg con libopus e libmp3lame, numpy. Nessun servizio esterno oltre al download delle sorgenti.
"""
import hashlib, json, os, subprocess, sys, urllib.request, zipfile
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = json.load(open(os.path.join(ROOT, 'tools/audio-149/sorgenti.json'), encoding='utf8'))['sorgenti']
OUT = os.path.join(ROOT, 'assets/audio')
CACHE = sys.argv[sys.argv.index('--cache') + 1] if '--cache' in sys.argv else os.path.join(ROOT, 'tools/audio-149/.cache')
SR = 48000

# chiave di gioco, file d'uscita, sorgente, (membro dello zip), tagli [(inizio, durata)], filtro ffmpeg, guadagno g, stereo
I = 'highpass=f=45'
USCITE = [
  # --- pallone: guanto da boxe = cuoio su cuoio, filtrato verso il «pop» di un pallone calciato
  ('ball.kick', 'sfx/ball/calcio-1', 'tdc-fight-glove', None, [(7.982, .30)], I+',lowpass=f=4200,bass=g=6:f=110', .80),
  ('ball.kick', 'sfx/ball/calcio-2', 'tdc-fight-glove', None, [(0.162, .30)], I+',lowpass=f=4200,bass=g=6:f=110', .80),
  ('ball.kick', 'sfx/ball/calcio-3', 'tdc-fight-glove', None, [(23.844, .30)], I+',lowpass=f=4200,bass=g=6:f=110', .80),
  ('ball.kick', 'sfx/ball/calcio-4', 'tdc-fight-glove', None, [(46.105, .30)], I+',lowpass=f=4200,bass=g=6:f=110', .80),
  ('ball.pass', 'sfx/ball/passaggio-1', 'tdc-fight-glove', None, [(28.145, .25)], I+',lowpass=f=3000,bass=g=3:f=120', .45),
  ('ball.pass', 'sfx/ball/passaggio-2', 'tdc-fight-glove', None, [(28.737, .25)], I+',lowpass=f=3000,bass=g=3:f=120', .45),
  ('ball.pass', 'sfx/ball/passaggio-3', 'tdc-fight-glove', None, [(39.980, .25)], I+',lowpass=f=3000,bass=g=3:f=120', .45),
  ('ball.header', 'sfx/ball/testa-1', 'tdc-fight-glove', None, [(48.217, .28)], I+',lowpass=f=1800,bass=g=4:f=140', .65),
  ('ball.header', 'sfx/ball/testa-2', 'tdc-fight-glove', None, [(1.212, .28)], I+',lowpass=f=1800,bass=g=4:f=140', .65),
  ('ball.post', 'sfx/ball/palo-1', 'tdc-metal-railing1', None, [(0, 1.5)], I, .55),
  ('ball.post', 'sfx/ball/palo-2', 'tdc-metal-railing2', None, [(0, 1.6)], I, .55),
  ('ball.net', 'sfx/ball/rete-1', 'tdc-cloth-swish', None, [(5.322, .40)], 'highpass=f=300,lowpass=f=7000', .45),
  ('ball.bounce', 'sfx/ball/contrasto-1', 'tdc-fight-bodyfall', None, [(0, 1.0)], I+',lowpass=f=5000', .55),
  ('ball.bounce', 'sfx/ball/contrasto-2', 'tdc-sports-bounce', None, [(0, .31)], I+',lowpass=f=2400,bass=g=4:f=120', .35),
  ('gk.save', 'sfx/ball/parata-1', 'tdc-cloth-slap', None, [(0, .50)], I+',lowpass=f=6000', .70),
  ('gk.save', 'sfx/ball/parata-2', 'tdc-fight-smacks', None, [(0.013, .30)], I+',lowpass=f=3200,bass=g=4:f=150', .60),
  # --- arbitro: fischietto a pallina (pea) e Fox 40
  ('ref.whistle', 'sfx/referee/fischio-1', 'tdc-whistles-pea', None, [(2.80, .95)], 'highpass=f=500', .55),
  ('ref.whistle', 'sfx/referee/fischio-2', 'tdc-whistles-pea', None, [(9.66, 1.15)], 'highpass=f=500', .55),
  ('ref.whistle2', 'sfx/referee/fischio-doppio', 'tdc-whistles-fox40', None, [(7.80, .80)], 'highpass=f=500', .55),
  ('ref.whistle_final', 'sfx/referee/fischio-finale', 'tdc-whistles-pea', None, [(2.80, .95), (9.66, 1.15), (26.85, 2.65)], 'highpass=f=500', .60),
  # --- folla
  ('crowd.roar', 'sfx/crowd/boato-1', 'tdc-crowds-applause', None, [(4.6, 4.6)], I, .95),
  ('crowd.roar', 'sfx/crowd/boato-2', 'tdc-crowds-applause', None, [(74.6, 4.6)], I, .95),
  ('crowd.applause', 'sfx/crowd/applausi-1', 'tdc-crowds-applause', None, [(20.0, 3.0)], I, .60),
  ('crowd.applause', 'sfx/crowd/applausi-2', 'tdc-crowds-applause', None, [(100.5, 3.0)], I, .60),
  ('crowd.cheer', 'sfx/crowd/esulta-1', 'tdc-crowds-applause', None, [(34.0, 2.2)], I, .70),
  ('crowd.boo', 'sfx/crowd/fischi-1', 'tdc-whistles-crowd', None, [(1.15, 1.55)], 'highpass=f=400', .30),
  # --- interfaccia (Kenney Interface Sounds)
  ('ui.click', 'sfx/ui/click-1', 'kenney-interface', 'Audio/click_001.ogg', None, '', .35),
  ('ui.click', 'sfx/ui/click-2', 'kenney-interface', 'Audio/select_001.ogg', None, '', .35),
  ('ui.click', 'sfx/ui/click-3', 'kenney-interface', 'Audio/select_002.ogg', None, '', .35),
  ('ui.nav', 'sfx/ui/nav-1', 'kenney-interface', 'Audio/open_001.ogg', None, '', .35),
  ('ui.back', 'sfx/ui/indietro-1', 'kenney-interface', 'Audio/back_001.ogg', None, '', .35),
  ('ui.confirm', 'sfx/ui/conferma-1', 'kenney-interface', 'Audio/confirmation_001.ogg', None, '', .40),
  ('ui.error', 'sfx/ui/errore-1', 'kenney-interface', 'Audio/error_004.ogg', None, '', .40),
  ('ui.popup', 'sfx/ui/popup-1', 'kenney-interface', 'Audio/maximize_006.ogg', None, '', .35),
  ('ui.close', 'sfx/ui/chiudi-1', 'kenney-interface', 'Audio/close_001.ogg', None, '', .35),
  ('notify.pos', 'sfx/notifications/positiva-1', 'kenney-interface', 'Audio/confirmation_002.ogg', None, '', .40),
  ('notify.neg', 'sfx/notifications/negativa-1', 'kenney-interface', 'Audio/error_006.ogg', None, '', .40),
  ('notify.info', 'sfx/notifications/info-1', 'kenney-interface', 'Audio/question_001.ogg', None, '', .35),
  ('week.advance', 'sfx/ui/settimana-1', 'kenney-interface', 'Audio/switch_002.ogg', None, '', .35),
  ('gala.envelope', 'sfx/career/busta-1', 'kenney-interface', 'Audio/scroll_002.ogg', None, '', .40),
  # --- carriera (Kenney 85 Short Music Jingles: profilo melodico misurato, «sale» per gli eventi positivi)
  ('career.contract', 'sfx/career/contratto-1', 'kenney-jingles', 'OGG/jingles_STEEL/jingles_STEEL02.ogg', None, '', .45),
  ('career.renew', 'sfx/career/rinnovo-1', 'kenney-jingles', 'OGG/jingles_STEEL/jingles_STEEL10.ogg', None, '', .45),
  ('career.record', 'sfx/career/record-1', 'kenney-jingles', 'OGG/jingles_STEEL/jingles_STEEL15.ogg', None, '', .45),
  ('career.callup', 'sfx/career/convocazione-1', 'kenney-jingles', 'OGG/jingles_SAX/jingles_SAX02.ogg', None, '', .45),
  ('career.milestone', 'sfx/career/traguardo-1', 'kenney-jingles', 'OGG/jingles_SAX/jingles_SAX10.ogg', None, '', .45),
  ('career.levelup', 'sfx/career/livello-1', 'kenney-jingles', 'OGG/jingles_SAX/jingles_SAX16.ogg', None, '', .45),
  ('season.relegation', 'sfx/career/retrocessione-1', 'kenney-jingles', 'OGG/jingles_STEEL/jingles_STEEL12.ogg', None, '', .45),
  ('gala.reveal', 'sfx/career/rivelazione-1', 'kenney-jingles', 'OGG/jingles_STEEL/jingles_STEEL04.ogg', None, '', .45),
  ('career.trophy', 'music/awards/fanfara-1', 'oga-victory-fanfare', None, [(0, 11.84)], '', .45),
  # --- musica (loop)
  ('music.home', 'music/menu/spiaggia-loop', 'oga-beach-sports', None, None, '', .55),
  ('music.career', 'music/career/avventura-loop', 'oga-happy-adventure', None, None, '', .55),
]
STEREO = lambda key: key.startswith('music.') or key == 'career.trophy'
SOSTENUTO = lambda key, dur: dur >= 1.0 or key.startswith(('music.', 'crowd.', 'ref.', 'career.', 'season.', 'gala.'))


def sh(*a, **k):
    r = subprocess.run(a, capture_output=True, **k)
    if r.returncode: raise SystemExit('comando fallito: ' + ' '.join(a[:6]) + '\n' + r.stderr.decode()[-800:])
    return r


def sorgente(sid):
    s = SRC[sid]; os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, sid + '.' + s['file'].rsplit('.', 1)[-1].split('?')[0])
    if not os.path.exists(p):
        req = urllib.request.Request(s['file'], headers={'User-Agent': 'cpm-audio-prep/1.0'})
        open(p, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    h = hashlib.sha256(open(p, 'rb').read()).hexdigest()
    if h != s['sha256']: raise SystemExit(f'HASH DIVERSO per {sid}: {h} (atteso {s["sha256"]}) — la sorgente e\' cambiata, rileggere la licenza')
    return p


def pcm(path, ch):
    b = sh('ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-').stdout
    return np.frombuffer(b, dtype=np.float32).reshape(-1, ch).copy()


def lufs(x, ch):
    tmp = os.path.join(CACHE, '_m.wav'); scrivi_wav(tmp, x, ch)
    e = sh('ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'ebur128=peak=true', '-f', 'null', '-').stderr.decode()
    v = [l for l in e.splitlines() if l.strip().startswith('I:')]
    return float(v[-1].split()[1]) if v and v[-1].split()[1] not in ('-inf', '-70.0') else None


def scrivi_wav(p, x, ch):
    sh('ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', p, input=x.astype(np.float32).tobytes())


def main():
    registro = {'_nota': 'Registro delle licenze dei file audio del gioco (giro 149, PO-351). Generato da tools/audio-149/prepara-audio.py: non modificare a mano.',
                'normalizzazione': 'sostenuti (>=1 s, folla/fischietto/jingle/musica): -18 LUFS integrati, picco <= -1,5 dBFS · impatti (<1 s): picco -3 dBFS',
                'file': {},
                # file audio che il giro 149 NON ha prodotto ma che stanno nel repo: anche loro hanno la loro riga (il guardiano lo pretende)
                'altri': {
                  'sfx/crowd/brusio-folla-korward.wav': {'evento': 'crowd.bed', 'licenza': 'nessuna di terzi: generato da noi (tools/gen-crowd-bed.mjs, giro 20, seme fisso)', 'cc0': True, 'nota': 'brusio in loop della partita, invariato dal giro 149'},
                  'sfx/crowd/mixkit-stadium-joy-shouting-crowd-3022.wav': {'evento': 'crowd.roar (solo col rosso __CPM_NO_G149)', 'licenza': 'Mixkit Sound Effects Free License (licenza propria Mixkit/Envato, NON CC0)', 'cc0': False, 'pagina': 'https://mixkit.co/license/', 'nota': 'boato del gol dal 7.72.1; col giro 149 non si scarica piu\' e il gol usa i boati CC0. Rimozione dal repo: decisione del PO (domanda aperta nel rapporto del giro 149).'}}}
    zips = {}
    for key, nome, sid, membro, tagli, filtro, g in USCITE:
        ch = 2 if STEREO(key) else 1
        src = sorgente(sid)
        if membro:
            z = zips.setdefault(sid, zipfile.ZipFile(src))
            tmp = os.path.join(CACHE, '_z.' + membro.rsplit('.', 1)[-1]); open(tmp, 'wb').write(z.read(membro)); src = tmp
        x = pcm(src, ch)
        if key.startswith('music.'):  # loop: via il silenzio di testa del codificatore mp3 della sorgente (29,7 ms misurati) = giunto senza buco
            lead = int(np.argmax(np.abs(x).max(axis=1) > 1e-4))
            if 0 < lead < int(.08 * SR): x = x[lead:].copy()
        if tagli:
            parti = []
            for (a, d) in tagli:
                p = x[int(a * SR): int((a + d) * SR)].copy()
                n = len(p); fi = min(int(.004 * SR), n // 4); fo = min(int((.06 if d < 1 else .35) * SR), n // 2)
                p[:fi] *= np.linspace(0, 1, fi)[:, None]; p[n - fo:] *= np.linspace(1, 0, fo)[:, None]
                parti.append(p); parti.append(np.zeros((int(.20 * SR), ch), np.float32))
            x = np.concatenate(parti[:-1])
        if filtro:
            tmp = os.path.join(CACHE, '_f.wav'); scrivi_wav(tmp, x, ch)
            x = np.frombuffer(sh('ffmpeg', '-v', 'error', '-i', tmp, '-af', filtro, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-').stdout, dtype=np.float32).reshape(-1, ch).copy()
        dur = len(x) / SR
        if SOSTENUTO(key, dur):
            L = lufs(x, ch); gain = 10 ** ((-18 - L) / 20) if L is not None else 1
            x = x * gain
            pk = np.abs(x).max()
            if pk > 10 ** (-1.5 / 20): x = x * (10 ** (-1.5 / 20) / pk)
        else:
            x = x * (10 ** (-3 / 20) / max(np.abs(x).max(), 1e-9))
        base = os.path.join(OUT, nome); os.makedirs(os.path.dirname(base), exist_ok=True)
        tmp = os.path.join(CACHE, '_o.wav'); scrivi_wav(tmp, x, ch)
        br = ('96k' if ch == 2 else '48k')
        sh('ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'libopus', '-b:a', br, '-vbr', 'on', '-map_metadata', '-1', base + '.ogg')
        sh('ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', ('128k' if ch == 2 else '64k'), '-map_metadata', '-1', base + '.mp3')
        rms = float(np.sqrt((x ** 2).mean())); pk = float(np.abs(x).max())
        L = lufs(x, ch) if dur >= 0.4 else None
        s = SRC[sid]
        registro['file'][nome] = {
            'evento': key, 'g': g, 'formati': ['ogg', 'mp3'], 'durata_s': round(dur, 3), 'canali': ch,
            'lufs': None if L is None else round(L, 1), 'picco_dbfs': round(20 * np.log10(pk + 1e-12), 1), 'rms_dbfs': round(20 * np.log10(rms + 1e-12), 1),
            'loop': key.startswith('music.'),
            'byte': {'ogg': os.path.getsize(base + '.ogg'), 'mp3': os.path.getsize(base + '.mp3')},
            'sorgente': {'id': sid, 'pagina': s['pagina'], 'file': s['file'], 'membro': membro, 'tagli': tagli, 'filtro': filtro,
                         'autore': s['autore'], 'licenza': s['licenza'], 'letta': s['letta'], 'sha256': s['sha256']}}
        print(f"{nome:36s} {key:18s} {dur:6.2f}s  LUFS={registro['file'][nome]['lufs']}  pk={registro['file'][nome]['picco_dbfs']}  ogg={os.path.getsize(base + '.ogg')//1024}KB")
    json.dump(registro, open(os.path.join(OUT, 'LICENZE.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    tot = sum(v['byte']['ogg'] + v['byte']['mp3'] for v in registro['file'].values())
    print(f"{len(registro['file'])} file · peso totale ogg+mp3 = {tot/1048576:.2f} MB")


if __name__ == '__main__':
    main()
