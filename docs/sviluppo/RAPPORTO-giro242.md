# Rapporto giro 242 — PO-505 (clip dribbling) e PO-476 (inno): ricerca e proposta

Ramo `sviluppo/giro242-proposte-asset`, partito da `lavoro/197` (`cd3a2f5`). `GAME_VERSION` non toccata (resta 7.999.197).
**Nessun cambio a `src/`** e al file di gioco (`node tools/check-src.mjs`: «allineato al file in git»). Nessun asset nuovo in
`assets/`, in `dist/` o nel pacchetto. La proposta per il PO è `docs/proposte/PROPOSTE-giro242.md`.

## 1. Che cosa ho fatto

1. Letti: BACKLOG/DECISIONI (ramo `poc/marioprada-character-system`: PO-505, PO-476 «proposta prima»), rapporti giro 226 (dubbio 1:
   tutte le varianti suonano `change`), 184 e 180 (strada di riadattamento, cancello, licenze Rohr), 206 (inno senza musica, scena da
   7,05 s), `CREDITI-fonti.md`, `CLIP_REGISTRY.md`, `assets/audio/LICENZE.json` (normalizzazione −18 LUFS). Nei documenti di idee dei
   giri 181/189/195 non ci sono proposte del PO su inno o clip di dribbling.
2. Ricerca fonti (sezione A e B della proposta). Escluse per regola le fonti che chiedono account o email (Rokoko, Xsens, Sketchfab,
   Mixamo) e quelle che vietano l'uso commerciale (Bandai Namco, SFU).
3. Scaricato **solo** nella cartella di prova della sessione (fuori dal repo): 7 file CMU (ASF/AMC) e 5 brani OpenGameArt.
4. Clip: conversione CMU → giunti, riadattamento allo scheletro CGTrader con `tools/retarget_cgtrader_clip.py` **non modificato**
   (involucro `tools/proposte-242/riadatta_cmu.py` + `cmu_lib.py`, Blender 5.3 `bpy` da PyPI), cancello anatomico dello strumento.
   GLB risultante solo nella cartella di prova.
5. Provini: sonda nuova `tests/visual/proposte-242-foto.mjs` (pagina vuota, three r128, corpo LOD1 del gioco, 8 fotogrammi + scia del
   bacino + misure). Foto in `docs/proposte/giro242/`.
6. Inno: durata, codec, loudness integrata e a breve termine (ffmpeg `ebur128`), tagli di prova normalizzati a −18 LUFS in Opus/MP3
   per stimare il peso nel formato del gioco (cartella di prova).

## 2. Misure

Clip (dalla sonda, `docs/proposte/giro242/misure.json`; cancello dallo strumento di riadattamento):

| Clip | Durata | Percorso bacino | Svolta | Sotto suolo | Passo piede max per fotogramma | Cancello |
|---|---|---|---|---|---|---|
| change-direction (oggi) | 1,75 s | 0 m (sul posto) | — | 1 cm | 21,1 cm | — |
| dribble (oggi) | 1,375 s | 0 m (sul posto) | — | 6,8 cm | 13,4 cm | — |
| rohr-dribble-03 (nel repo) | 3,367 s | 2,94 m | 37° | 1 cm | 19,9 cm | 6,12° / 28,94° (giro 184) |
| cmu 102_19 finta dx → sx | 1,90 s | 4,84 m | 50° | 0 cm | 35,2 cm | 5,64° / 28,14° |
| cmu 102_13 cambio passo | 1,27 s | 4,41 m | 9° | 0 cm | 33,9 cm | 5,73° / 27,46° |
| cmu 16_37 sterza sx | 1,53 s | 3,55 m | 30° | 0 cm | 19,6 cm | 4,54° / 25,67° |
| cmu 16_39 sterza dx | 1,23 s | 3,35 m | 35° | 0 cm | 22,1 cm | 4,76° / 27,01° |
| cmu 102_18 finta sx → dx | — | — | — | — | — | **31,04° max: rifiutata** |

Inno: vedi tabella B della proposta (durate 12,0 / 63,7 / 69,6 / 191,7 s; loudness integrata −12,1 / −13,6 / −10,1 / −15,3 LUFS).

## 3. Errori dello strumento trovati e corretti per strada (misura prima di concludere)

- **Prima passata: tutte le clip CMU rifiutate dal cancello (mediane 20-27°).** Causa misurata: il glTF di nodi che producevo,
  reimportato in Blender, crea le azioni ma **non le assegna** ai nodi (posizioni identiche dal fotogramma 1 al 58, intervallo
  riscalato 0,8-46,4 da 30 a 24 fps): la sorgente era ferma. Rimedio: i nodi si creano direttamente nella scena del riadattatore.
  Dopo: mediane 4,5-5,7°. Non era la clip, era lo strumento.
- **Primi provini: percorsi di 9,5 m e «passi» di 4,9 m in un fotogramma.** Causa: il mixer in ripetizione riavvolgeva la clip
  all'ultimo campione (t = durata). Rimedio: riproduzione singola, campioni sotto la durata. Misure risultanti plausibili.
- **Inquadratura** fissa che perdeva il corpo a fine clip → camera che segue il bacino di lato.

## 4. Controlli

Nessun file `src/` toccato: la mappa mirata di `ci-runner.mjs` non indica guardiani per questo giro e non ho eseguito catene (regola
PO-504 A). Eseguito solo `node tools/check-src.mjs` (allineato). La sonda dei provini non è un guardiano (non giudica, fotografa e
misura): nessun rosso `__CPM_NO_G242`, perché nessuna correzione del gioco.

## Dubbi per il PO

1. **Doppio passo: nessuna clip con licenza libera trovata.** Strade possibili (nessuna presa): (a) far fotografare Rohr Dribble 01/02
   dallo zip del pack 05 che il PO ha già (contenuto ignoto, cancello già sopra soglia al giro 180); (b) clip fatta da noi a
   fotogrammi chiave; (c) doppio passo procedurale sulle gambe. Quale?
2. **Licenza CMU**: non è CC0. Permette uso commerciale senza attribuzione ma vieta di «rivendere i dati, anche convertiti». Il GLB
   convertito nel repo pubblico è lo stesso tipo di rischio già accettato per CGTrader/Mixamo/Rohr: va bene?
3. **Le clip CMU sono di basket**: in 102_19 le mani salgono come per ricevere un pallone; in 16_37/39 la testa resta piegata
   indietro. Usarle richiederebbe ritocchi (braccia/testa) e togliere lo spostamento del bacino (quelle del gioco sono sul posto).
   Vale la pena, o si preferisce la strada (b)/(c) anche per la sterzata?
4. **Crediti**: se entra una clip CMU, la riga nei Crediti è facoltativa (la licenza non chiede attribuzione) ma il guardiano
   `crediti-254` pretende in gioco ogni riga della tabella di `CREDITI-fonti.md`: aggiungerla anche in gioco?
5. **Inno: non ho potuto ascoltare i brani.** Le descrizioni sono dell'autore + misure di volume. Il PO li ascolta dalle pagine
   OpenGameArt. Non posso confermare che nessuno somigli a un inno reale di competizione (rischio d'immagine): va giudicato a orecchio.
6. **Durata dell'inno**: la scena dura 7,05 s. Il #1 (9 s di musica) ci sta quasi intero; #2/#3 andrebbero tagliati su un tratto
   scelto dal PO. Si allunga la scena o si taglia il brano?
7. **Anteprime audio**: le ho lasciate fuori dal repo (pagine OpenGameArt sufficienti per ascoltare). Se il PO le vuole sul telefono,
   si possono mettere in `docs/proposte/giro242/` (CC0, peso 0,1-0,5 MB l'una).
8. **Peso**: +17-46 KB per clip (prima della quantizzazione del giro 203), +108-474 KB per l'inno in Opus (più la copia MP3).
