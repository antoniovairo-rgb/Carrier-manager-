# Rapporto giro 315 — PO-602: candidati per la musica della serata di presentazione

**Ramo:** `sviluppo/giro315-musica-serata` (partito da `lavoro/200`, de4ab61). **Non toccati:** `src/`, `GAME_VERSION`, `assets/`, `LICENZE.json`.
Il brano del gioco resta quello di oggi (`music.cerimonia` = `music/ceremony/il-mondo-e-nostro`): lo cambierà un giro successivo, dopo la scelta del PO.

## Pagina d'ascolto
`docs/sviluppo/giro315/ascolto.html`: è autonoma e ha i cinque mp3 accanto, con percorsi relativi. «A» è il brano attuale, «B…E» sono i candidati.

## Rete
- `opengameart.org`: raggiungibile (HTTP 200). Tutti e quattro i candidati vengono da qui.
- `commons.wikimedia.org` e `upload.wikimedia.org`: rispondono (301). In questo giro non li ho esplorati.
- `freesound.org`: risponde (200). Non ho provato a scaricare: su Freesound i download richiedono un account, e la regola del giro lo vieta. Non l'ho verificato con un tentativo.

## Metodo (lo stesso dei giri 161/172)
1. Ricerca avanzata su OpenGameArt: tipo Music, licenza CC0, parole chiave epic orchestral · cinematic epic · anthem · stadium · heroic · epic trailer.
2. Per ogni pagina ho letto il campo «License(s)» (estratto da `license-name` nell'HTML della pagina, 21/11/2026), l'autore e l'eventuale «Copyright/Attribution Notice».
3. Ho scaricato il file originale e calcolato lo sha256. Ho guardato il volume nel tempo (ebur128 short-term, un punto ogni 6 s) per scartare brani troppo lunghi o vuoti.
4. Normalizzazione `loudnorm` in due passate (I −18, TP −1,5, lineare), 44,1 kHz stereo, mp3 128 kbps (lo stesso bitrate dell'mp3 attuale). Misura finale con `tools/audio-172/misura-file.py`.

## Candidati

Le misure sono quelle dei file della pagina d'ascolto. Su «A» lo stesso strumento misura −18,4 LUFS (`LICENZE.json` registra −18,0).

| | Brano | Autore | Licenza letta (pagina) | Durata | LUFS | Picco | sha256 dell'originale |
|---|---|---|---|---|---|---|---|
| A | The World Is Ours (attuale) | Zane Little Music | CC0 (registro giro 161) | 48,0 s | −18,4 | −0,5 dBFS | a446cbf5… (in `LICENZE.json`) |
| B | [A Legend Will Rise](https://opengameart.org/content/a-legend-will-rise-orchestral) · file `A Legend Will Rise.mp3` | CodeManu | CC0; descrizione: «No attribution required but always appreciated» | 69,6 s | −18,4 | −5,7 dBFS | `6c38472a541777c3ac2826e8623f1424a1d2ccc3757e16cafb270b004e64a65b` |
| C | [The Storm Chasers](https://opengameart.org/content/storm-chasers) · file `the_storm_chasers.wav` | Eldritch Grim | CC0; notice: «Not required. Use it in your game and stuff for free.» | 84,8 s | −18,4 | −7,0 dBFS | `76b19d2dab0d21e302534d28d3000ac9121225f78449e0b21708cd8f64e71714` |
| D | [Epic Endgame](https://opengameart.org/content/epic-endgame-cinematic) · file `ChoirChordsBassMaster.wav` | cynicmusic | CC0; notice: «http://cynicmusic.com http://pixelsphere.org» | 91,2 s | −18,4 | −5,3 dBFS | `3cf6f2cb4eb4c22d86da2a5fc6dbada9d9484f57f42e017f5c9b7e6096796bd6` |
| E | [Inevitable](https://opengameart.org/content/inevitable) · file `inevitable.flac`, taglio 0–105 s con sfumatura di 4 s | vitalezzz | CC0; notice: «Vitalezzz - Inevitable» | 105,0 s (originale 194,8) | −18,3 | −3,5 dBFS | `d7957b82adf273f6bf3dabc16d61d62251b88b33d179838758aa9281333be1a4` |

Che cosa si legge dal volume nel tempo (short-term LUFS, prima della normalizzazione):
- **B** resta fra −8 e −13 per tutto il brano: è uniforme, senza una vera crescita.
- **C** è a −19 fino a 6 s, poi da circa 18 s resta stabile fra −5 e −9: entrata rapida e poi «muro».
- **D** sta fra −11 e −16: la dinamica più contenuta dei quattro.
- **E** sta fra −16 e −19 fino a 30 s, poi sale a −9/−11 dal 36° secondo: un'introduzione lunga, poi la parte piena. Il taglio a 105 s cade su un tratto a −12/−13.

Riserve misurate ma non messe nella pagina (tutte CC0):
- `final-stand` (iamoneabe, 64 s, «loopable», volume piatto a −14).
- `generic-trailer-music` (Emma_MA, 164 s).
- `unsolicited-trailer-music` (Emma_MA, 144 s, elettronica, «easy-to-loop»).
- `arrival-1` (vitalezzz, elettronica, 147 s).

Scartati per descrizione o durata:
- `production-theme-intro-epic-orchestra`: 12 s.
- `fever-stadium`: eurobeat da gara a 165 BPM.
- `the-time-is-upon-us`: symphonic black metal.
- `it-takes-a-hero`: stesso autore e stesso registro «upbeat» del brano attuale.

## Crediti
Tutti e quattro sono CC0, quindi non c'è un'attribuzione obbligatoria. Quando un giro successivo adotterà il brano scelto, conviene comunque aggiungere una voce in `LICENZE.json` (con sorgente, autore, licenza, data di lettura e sha256 di questa tabella) e in `CREDITI238`, come cortesia verso l'autore. Per D l'autore lo chiede con i suoi link, per E con il nome del brano.

## Dubbi per il PO
1. **Non ho ascoltato i brani.** Ho scelto dalle descrizioni degli autori e dalle misure. «Solenne ma moderno, niente fanfara» lo può giudicare solo l'orecchio: per questo i quattro sono volutamente diversi fra loro (orchestrale classico · trailer · corale cupo · elettronico più orchestra).
2. **Durata contro scena:** oggi la serata usa 48 s. B, C e D vanno da 70 a 91 s; E è tagliato a 105 s. Il giro che adotterà il brano deve decidere se tagliarlo alla durata della scena o lasciarlo sfumare. Nessuno dei quattro è dichiarato «loop» dall'autore: per un loop pulito ci sono le riserve `final-stand` e `unsolicited-trailer-music`.
3. **B arriva da un mp3**, perché l'autore ha caricato solo quello: la nostra versione è un mp3 ricodificato. C, D ed E vengono da wav o flac.
4. **La fine stagione** oggi suona lo stesso brano della serata. Se il PO sceglie un brano cupo (D), forse la fine stagione dovrebbe tenere quello attuale. Questa è una decisione del PO, non l'ho presa io.
