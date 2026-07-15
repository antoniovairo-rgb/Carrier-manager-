# assets/audio/sfx/crowd/ — audio folla (campioni REALI)

Contiene i campioni **reali** forniti dal PO (scaricati da fonti royalty-free) e collegati
automaticamente dal gioco (`AudioMgr`, registro `URL_SFX`):

| File | Uso nel gioco | Note |
|---|---|---|
| `mixkit-stadium-joy-shouting-crowd-3022.wav` | **Boato del GOL** (`crowd.roar`) | clip ~15s → il gioco ne suona i **primi ~4.2s** con fade (l'esplosione iniziale) |
| `freesound_community-football-crowd-3-69245.mp3` | **Brusio di folla** durante il gioco (`crowd.bed`, in loop) | registrato quieto → il gioco lo **amplifica** (`_bedGain`) e lo modula sul momentum |

## Sostituire o aggiungere

- **Cambiare il boato**: sostituisci il file di `crowd.roar` (o aggiungi `goal-roar.ogg/mp3`,
  che ha priorità) — vedi il registro `URL_SFX` in `CARRIER-MANAGER-AV.html`.
- **Cambiare il brusio**: sostituisci il file di `crowd.bed`.
- Il **service worker** cachea i file al 1° caricamento → offline ok. `build-dist` copia `assets/`.

## Note

- I due file sono **WAV/MP3 non compressi/grandi** (2.7MB / 785KB). Per il rilascio store si possono
  ri-comprimere in **OGG** (~10× più piccoli) senza toccare il codice (basta rinominare l'estensione
  nel registro). Registrare **fonte + licenza** di ogni file (Mixkit/Freesound: royalty-free / CC — verificare).
- Se un file manca o non si decodifica, il gioco ricade automaticamente sul **synth** (0 crash).
