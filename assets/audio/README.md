# assets/audio/

Cartella predisposta per i **file audio reali** (royalty-free) che in futuro
sostituiranno le sorgenti procedurali del comparto audio (`AudioMgr`).

~~Oggi è VUOTA di proposito~~ — **superato dal giro 149** (vedi la sezione in fondo): i suoni sono file CC0, la sintesi Web Audio
resta come ripiego. Vedi `docs/AUDIO_LAYER.md` per l'architettura completa.

## Struttura prevista

```
music/
  menu/      # loop rilassanti dei menu (home/hub)
  career/    # tema della carriera
  awards/    # cerimonie/premi
sfx/
  ui/        # click, hover, popup, conferma, errore, chiusura, tab
  ball/      # calcio, passaggio, cross, testa, stop, contrasto, rete, palo
  crowd/     # boato, ohh, applausi, cori, fischi
  referee/   # fischietto (inizio, fallo, intervallo, finale)
  career/    # firma, convocazione, trofeo, record, livello
  notifications/
```

## Come aggiungere un file reale (senza toccare il codice del sistema)

1. Metti il file (es. `sfx/ball/kick01.ogg`) in questa cartella.
2. Nel catalogo `SFX` di `AudioMgr` (in `CARRIER-MANAGER-AV.html`) cambia la
   voce da `()=>synth(...)` a un descrittore `{url:'assets/audio/sfx/ball/kick01.ogg'}`.
3. L'associazione all'evento resta invariata; `sw.js` va aggiornato per
   cachare i nuovi asset (offline/PWA).

## Boato del GOL con un campione REALE (7.70.0, drop-in a 1 riga)

Il boato del gol (`crowdRoar`) **preferisce un campione reale** se presente.
Passi (nessun'altra modifica al codice):

1. Metti un file royalty-free (Pixabay/Freesound CC0/Kenney) in
   `sfx/crowd/` — es. `goal-roar.ogg` (un boato di stadio di ~3s).
2. In `CARRIER-MANAGER-AV.html`, nel blocco `AudioMgr`, togli il commento alla
   riga del registro `URL_SFX`:
   ```js
   const URL_SFX={ 'crowd.roar':'assets/audio/sfx/crowd/goal-roar.ogg' };
   ```
3. Aggiungi l'URL alla precache di `sw.js` (offline/PWA).

Al primo gesto (`unlock`) il file viene scaricato e decodificato; da lì il gol
suona il **campione reale** invece del synth (fallback automatico al synth se
il file manca o non si decodifica). Registrare l'asset e la sua licenza in un
manifest.

Sorgenti consigliate con licenza compatibile: Pixabay, Freesound (CC0),
OpenGameArt, Kenney. Registrare ogni asset e la sua licenza in un manifest.

## Giro 149 (PO-351) — audio CC0 del gioco

Dal giro 149 la cartella contiene **51 file reali da fonti CC0** (Ogg/Opus + MP3 di riserva, 3,24 MB) per pallone, arbitro, folla,
interfaccia, carriera, cerimonie e musica. La struttura qui sopra è quella usata (`sfx/ball`, `sfx/referee`, `sfx/crowd`, `sfx/ui`,
`sfx/notifications`, `sfx/career`, `music/menu`, `music/career`, `music/awards`).

- **Registro delle licenze, file per file:** `LICENZE.json` (sorgente, pagina, autore, licenza letta, data, sha256, taglio, misure, `g`).
  Lo genera `tools/audio-149/prepara-audio.py` dalle sorgenti di `tools/audio-149/sorgenti.json`: **non si modifica a mano**.
- **Fonti:** *The Designer's Choice* di Nicholas A. Judy (archive.org, CC0: fischietti, applausi e boato, impatti), Kenney
  (*Interface Sounds*, *85 Short Music Jingles*, CC0), cynicmusic (*Victory Fanfare Short*, CC0), Trex0n — Cal McEachern
  (*Beach Sports Theme (Loop)*, CC0), TinyWorlds (*Happy Adventure (Loop)*, CC0). Tutte su OpenGameArt salvo Designer's Choice.
- **Livelli:** sostenuti −18 LUFS integrati (picco ≤ −1,5 dBFS), impatti picco −3 dBFS; il volume in gioco lo dà `g`.
- **Aggiungere/cambiare un file:** nuova sorgente in `sorgenti.json` (con hash e licenza letta alla fonte), nuova riga in `USCITE`
  dello script, poi eseguirlo e aggiornare la tabella `F149` di `src/09` e la lista `AUDIO149` di `sw.js` — il guardiano
  `npm run audio-149` fallisce finché codice, `sw.js` e registro non coincidono.
- **Fuori dal giro 149:** `sfx/crowd/brusio-folla-korward.wav` (nostro, giro 20). Il boato di terzi con licenza propria (non CC0) è
  uscito dal repo nel giro 161b (decisione PO 11/11 «Togliere il file»): col rosso `__CPM_NO_G149` il boato del gol è sintetizzato.
