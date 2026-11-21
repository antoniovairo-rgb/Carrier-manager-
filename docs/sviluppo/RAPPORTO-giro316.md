# Rapporto giro 316 — PO-602: il brano della serata di presentazione

**Ramo:** `sviluppo/giro316-musica-serata`, partito da `lavoro/201` (86a7d74). `GAME_VERSION` non è stata toccata: la alza il rilascio automatico.

## Che cosa ha scelto il PO
Il candidato **C — «The Storm Chasers»** di Eldritch Grim, dalla pagina d'ascolto del giro 315. Suona solo nella **serata di presentazione**. La **fine stagione** continua a suonare «The World Is Ours» (`music.cerimonia`), finché il PO non decide altro.

## Sorgente (verificata oggi, 21/11/2026)
- Pagina: https://opengameart.org/content/storm-chasers. Campo «License(s)»: **CC0**. «Copyright/Attribution Notice»: «Not required. Use it in your game and stuff for free.» Autore: Eldritch Grim. Ho letto tutto nell'HTML della pagina scaricata oggi.
- File: `https://opengameart.org/sites/default/files/the_storm_chasers.wav`, riscaricato oggi.
  **sha256 `76b19d2dab0d21e302534d28d3000ac9121225f78449e0b21708cd8f64e71714`: coincide** con quello del giro 315. Durata 84,846 s, 44,1 kHz, stereo.

## Che cosa è cambiato
| File | Modifica |
|---|---|
| `tools/audio-149/sorgenti.json` | nuova sorgente `oga-storm-chasers` (pagina, file, autore, licenza letta, data, sha256) |
| `tools/audio-149/prepara-audio.py` | nuova uscita `music.presentazione` → `music/ceremony/cacciatori-di-tempeste`. Brano intero, nessun taglio, pipeline dei giri 149/161/172, eseguita con `--solo` |
| `assets/audio/music/ceremony/cacciatori-di-tempeste.{ogg,mp3}` | Opus 96k (941 KB) e MP3 128k |
| `assets/audio/LICENZE.json` | voce generata dallo script: sorgente, autore, licenza, sha256, misure |
| `src/09` | evento `music.presentazione` in `F149`. `CER161.presentazione` passa da `_cerMk316` → `music.presentazione`, mentre `finestagione` resta `music.cerimonia`. Testimone `__CPM_AUDIO161().brano`. Rosso `window.__CPM_NO_G316`: la serata torna al brano della 7.999.200 e il file nuovo non viene scaricato |
| `src/17` (`CREDITI238`) | voce di cortesia «The Storm Chasers» — Eldritch Grim. «The World Is Ours» ora dice «Musica di fine stagione». Col rosso torna la voce di prima |
| `tests/visual/musica-316.mjs` + `npm run musica-316` | guardiano nuovo (sotto) |
| `tests/visual/ci-runner.mjs` | `musica-316` nella riga della MAPPA che esisteva già per `src/05-|src/09-` |
| `tests/visual/audio-161.mjs` | il controllo 7 contava 2 avvii di `music.cerimonia` (finestagione + presentazione). Ora conta `cerimonia + presentazione = 2`. La soglia non è stata abbassata: il controllo del brano giusto per ogni cerimonia è passato a `musica-316` |

`node tools/build-src.mjs` e poi `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** (7.951.300 byte).

## Misure del file
- Registro, misurato dallo script prima della codifica: 84,84 s · **−18,0 LUFS** · picco −9,3 dBFS.
- Sul file `.ogg` (ffmpeg ebur128): **−18,0 LUFS**, picco vero **−8,3 dBTP**.
- Sul file `.mp3`: picco vero **−9,2 dBTP**.
- Il tetto di −1,5 dBTP è rispettato con largo margine. Il brano ha molta dinamica: a −18 LUFS non arriva mai al tetto.

## Dissolvenza all'uscita
Non ho scritto codice nuovo per la dissolvenza: il brano usa la stessa `musicStart('cer:…')` e la stessa `musicStop(true)` del giro 161. All'ingresso sale con costante 0,5 s; all'uscita dalla scena sfuma come oggi. Il guardiano misura che all'uscita la musica risulti spenta.

## Guardiano `npm run musica-316`
- **Statico:**
  1. registro con evento, CC0, pagina, autore, data, sha256 dell'originale, −18 ±0,5 LUFS e picco ≤ −1,5;
  2. i due file esistono, con lo sha256 e il peso registrati;
  3. voce nei crediti.
- **Browser** (sito `dist-web`, audio vero, niente `?cpmtest`):
  4. il brano nuovo e quello di fine stagione sono decodificati;
  5. con `ceremony('presentazione')` il brano è `music.presentazione`, con `ceremony('finestagione')` è `music.cerimonia`, e all'uscita la musica è spenta.
- **Esito:** verde ✓ 1-5. Col rosso `__CPM_NO_G316` cadono il 4 (`music.presentazione:0/1`) e il 5 (la serata chiede `music.cerimonia`). Uscita 0.

## Controlli
I controlli sono partiti in sottofondo **dentro questo turno**. Gli esiti sono nella sezione «Esiti dei controlli», aggiunta quando sono arrivati.

## Dubbi per il PO
1. **Durata della scena.** Il brano dura 84,8 s. Non ho misurato quanto dura la serata nel gioco vero. Se la serata finisce prima, il brano sfuma all'uscita. Se dura di più, dopo 84,8 s resta il silenzio, come già succedeva col brano di 48 s: non ho aggiunto un loop, perché l'autore non dichiara il brano «loopable».
2. **Peso.** Il brano aggiunge circa 2,3 MB (ogg + mp3) agli asset del sito: il peso totale dell'audio passa a 8,03 MB. Il brano viene scaricato solo dopo il primo gesto, insieme agli altri.
3. **Picco basso.** Il picco vero è −8,3 dBTP: il brano «respira» più del vecchio, quindi i punti forti suonano meno compressi. Se all'orecchio sembra più debole del vecchio, la causa è questa, non un errore di livello: i LUFS integrati sono gli stessi (−18).
4. **Fine stagione.** Tiene «The World Is Ours», come chiesto. Il passaggio è pronto: è una riga in `CER161`.
