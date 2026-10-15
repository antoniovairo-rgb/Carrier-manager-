# assets/audio/sfx/crowd/ — audio folla (campioni REALI)

Contiene i campioni collegati automaticamente dal gioco (`AudioMgr`, registro `URL_SFX`):

| File | Uso nel gioco | Note |
|---|---|---|
| `mixkit-stadium-joy-shouting-crowd-3022.wav` | **Boato del GOL** (`crowd.roar`) | clip ~15s → il gioco ne suona i **primi ~4.2s** con fade (l'esplosione iniziale) |
| `brusio-folla-korward.wav` | **Brusio di folla** durante il gioco (`crowd.bed`, in loop) | **generato da noi** (giro 20, PO-238): `node tools/gen-crowd-bed.mjs` lo riscrive identico byte per byte. Il gioco lo modula sul momentum (`_bedGain`) |

### Il brusio: come e' fatto (giro 20)

Decisione PO del 14/10 «Sostituiscilo»: il vecchio brusio (un mp3 caricato il 15/07, fonte e licenza non
verificabili) e' uscito dal repo, dal gioco e dai Crediti. Il nuovo non contiene campioni di terzi:

1. **corpo** — rumore a spettro modellato costruito in frequenza (forma rosa, passa-alto 220 Hz, rigonfiamento
   attorno a 950 Hz, passa-basso 2,8 kHz = distanza) e riportato nel tempo con una FFT inversa;
2. **chiacchiericcio** — ~2600 grani vocali sintetici (fondamentale 95-270 Hz, formanti di vocali a/e/o/u/i),
   sovrapposti: non si capisce nessuna parola, resta il brusio umano;
3. **ondate** — una dozzina di «ooh» lontani piu' forti;
4. **respiro** — modulazione lenta del livello con un numero intero di cicli nel loop.

Tutto e' circolare (FFT inversa e grani scritti modulo la lunghezza): il loop non ha giunto.
WAV PCM 16 bit mono 22050 Hz, 23,78 s, 1 MB. Seme fisso → file riproducibile.

| Misura (`node tools/misura-brusio.mjs <file>`) | vecchio mp3 | nuovo wav |
|---|---|---|
| durata del loop | 39,29 s (stereo 24 kHz) | 23,78 s (mono 22050 Hz) |
| picco · RMS | -17,3 · -35,3 dBFS | -5,7 · -20,0 dBFS |
| loudness integrato (EBU R128, stereo) | -34,1 LUFS | -16,9 LUFS |
| silenzio in testa | 43,8 ms (ritardo dell'encoder mp3) | 0 ms |
| livello nei 20 ms del giunto, rispetto alla mediana | -46,8 dB (un buco a ogni giro) | +1,0 dB |
| centroide spettrale | 914 Hz | 820 Hz |

`_bedGain` e' stato moltiplicato per 0,138 (= 10^(-17,2/20)) perche' in partita suoni alto come prima.
Rosso per il confronto: `window.__CPM_NO_BRUSIO238 = 1` prima del caricamento → il file non si carica e
suona il synth di riserva. Guardiano: `tests/visual/brusio-238.mjs`.

## Sostituire o aggiungere

- **Cambiare il boato**: sostituisci il file di `crowd.roar` (o aggiungi `goal-roar.ogg/mp3`,
  che ha priorità) — vedi il registro `URL_SFX` in `CARRIER-MANAGER-AV.html`.
- **Cambiare il brusio**: ritocca `tools/gen-crowd-bed.mjs` e rigeneralo, oppure sostituisci il file di `crowd.bed`
  (solo con fonte e licenza verificate, scritte in `docs/governo/CREDITI-fonti.md`).
- Il **service worker** cachea i file al 1° caricamento → offline ok. `build-dist` copia `assets/`.

## Note

- I due file sono **WAV non compressi** (2.7MB / 1MB). Per il rilascio store si possono
  ri-comprimere in **OGG** (~10× più piccoli) senza toccare il codice (basta rinominare l'estensione
  nel registro). Registrare **fonte + licenza** di ogni file in `docs/governo/CREDITI-fonti.md`.
  ⚠️ Il brusio NON va ricompresso in mp3: l'encoder aggiunge silenzio in testa e il loop torna a bucarsi.
- Se un file manca o non si decodifica, il gioco ricade automaticamente sul **synth** (0 crash).
