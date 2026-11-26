# Giro 384 — PO-524: la partita sul banco rallenta dentro la stessa partita

Base `lavoro/201` (29d758c8). Ramo di consegna `sviluppo/giro384-lentezza`. GAME_VERSION e docs/governo non toccati.

## Esito in una riga

**Trovata e corretta una crescita certa.** Il velo caldo del campo 2D (heat map del 23/09, `Campo2D` in `src/15-live-match.jsx`)
faceva **una sfocatura canvas per ogni cella toccata dal pallone, a ogni fotogramma**. Le celle crescono col tempo di gioco (10 → 58 in
30'), e il fotogramma del banco passava da 17 a 445 ms. Ora c'e' **una sfocatura per fotogramma**: il fotogramma resta a 17-19 ms per
tutta la partita, su PC e telefono.

## 1. Misura (prima) — cosa cresce e cosa no

Sonda `tests/visual/misura-384.mjs`: salvataggio `fixtures/save-194-primavera-w38.json` (come `probe-fischio-270`), partita vera con
autoplay seedato (seme 1941). Si gioca senza salto all'85' e si campiona **a ogni minuto di gioco** (mai a orologio). Per ogni minuto annota:
secondi di parete; fotogramma mediano e p90 (ultimi 120 rAF); CDP `Memory.getDOMCounters` (nodi, documenti, ascoltatori JS);
CDP `Runtime.getHeapUsage`; `__CPM_RINFO769` (geometrie, texture, programmi, chiamate di disegno, triangoli, luci); intervalli
vivi, timeout in attesa e loop rAF per fotogramma (contatori messi dalla sonda sulle funzioni del browser); lunghezza di `__CPM_EV` e
`__CPM_TIMELINE`. Più profili CPU (CDP Profiler) al 8' e al 24'.

PC 1280×900, base 29d758c8 (il braccio rosso del guardiano ripete lo stesso percorso e da' gli stessi numeri):

| minuto | parete | fotogramma med/p90 | geometrie | texture | programmi | nodi DOM | ascoltatori | heap MB | intervalli | rAF/fotogr. |
|---|---|---|---|---|---|---|---|---|---|---|
| 2'  | 3 s   | 17/20 ms   | — | 12 | — | 593 | 332 | 30,7 | 6 | 5 |
| 10' | 36 s  | 65/180 ms  | 778 | 74 | 20 | 968 | 360 | 38,7 | 6 | 4,6 |
| 20' | 92 s  | 264/314 ms | 778 | 74 | 20 | 665 | 332 | 30,3 | 6 | 5 |
| 28' | 198 s | 396/441 ms | 778 | 74 | 20 | 682 | 338 | 30,7 | 6 | 5 |

- **Piatti**: geometrie, texture, programmi, chiamate di disegno (240), triangoli (12.711), luci (14), nodi DOM e ascoltatori
  (oscillano 640-1030 senza tendenza), heap JS (28-44 MB, oscilla col GC), intervalli (6), loop rAF (5), timeout.
  **Nessuna perdita di memoria.**
- **Cresce**: solo il **tempo del fotogramma**, e ogni highlight lo riporta a 17 ms (il campo 2D si rimonta e la sua memoria riparte da zero).
- **Profilo CPU** (6 s al 8' e al 24'): il thread principale e' inattivo al 94% in entrambi (`(program)` 5.851 → 6.443 ms su 6.229 →
  6.490), nessuna funzione JS cresce. Il costo sta quindi nel **raster** del canvas, fuori dal JS.
- **Prova di esclusione**: con il rosso già esistente `__CPM_NO_HEAT23` (velo spento) il fotogramma resta **17/17 ms fino al 55'** e
  si gioca il 55' in 110 s, contro il 28' in 198 s col velo acceso. La causa è il velo, non il motore né il 3D.
- **Chi lo fa crescere**: `src/15-live-match.jsx`, `Campo2D` → funzione `disegna`, blocco «heat map delle azioni» (23/09 POC).
  Imposta `g.filter="blur(...)"` e fa un `fillRect` per ogni cella con `v/max ≥ 0,08`: una sfocatura per cella. Il numero di celle
  sale col tempo di gioco (testimone: 10 al 2', 37 al 20', 58 al 30').

Telefono (412×915, `isMobile`): prima della correzione **non misurato separatamente** (il braccio rosso del guardiano gira su PC). Il
meccanismo è lo stesso, perché il campo 2D è identico. Sul telefono vero il raster lo fa la GPU e il costo per sfocatura è più
basso, ma cresce allo stesso modo con le celle: **non posso confermare** quanto pesasse su un dispositivo reale.

## 2. Correzione (alla sorgente, non cambia il gioco)

`src/15-live-match.jsx`, `Campo2D`/`disegna`, blocco della heat map (unico punto toccato nel gioco):
- le celle si disegnano **senza filtro** su una tela fuori schermo (`M.heatCv`, delle stesse dimensioni del canvas, ricreata solo se cambia
  la misura), con lo stesso trasformato `dpr`;
- la tela si posa sul campo con **un solo** `drawImage` sotto lo stesso `blur(...)` e lo stesso trasformato;
- stesse celle, stessi colori, stesso raggio. Le celle non si sovrappongono, quindi la sfocatura dell'insieme è la somma delle
  sfocature. Unica differenza teorica: dove gli aloni di due celle vicine si sommano, la composizione «source-over» di prima dava al
  più ~0,017 di alfa in meno (alfa massima del velo 0,13). Non l'ho misurata a schermo (vedi dubbio 2).
- rosso `window.__CPM_NO_G384` = una sfocatura per cella, il percorso di prima;
- testimone inerte `window.__CPM_SFOC384` (scrive solo se la sonda lo arma): sfocature nell'ultimo fotogramma, celle, massimo.

`CARRIER-MANAGER-AV.html` è ricomposto con `tools/build-src.mjs` (check-src identico).

## 3. Misura (dopo) — guardiano `npm run lentezza-384`

Soglie scritte prima della misura, nel file del guardiano: S1 fotogramma mediano ultimi 8 / primi 8 minuti ≤ 1,5 · S2 secondi per
minuto (coppie consecutive senza highlight) ≤ 1,5 · S3 sfocature per fotogramma ≤ 1 · copertura: 30', ≥ 16 minuti, ≥ 8 coppie,
≥ 40 celle, altrimenti «non giudicato» = rosso. I bracci girano in fila.

| braccio | 30' raggiunto in | fotogramma inizio→fine | s/minuto inizio→fine | sfocature/fotogramma max | celle |
|---|---|---|---|---|---|
| PC verde       | 62 s  | 17 → 19 ms (×1,12) | 2,15 → 1,49 s (×0,69) | 1  | 59 |
| telefono verde | 60 s  | 17 → 17 ms (×1,00) | 2,12 → 1,43 s (×0,68) | 1  | 58 |
| PC rosso `__CPM_NO_G384` | 231 s | 18 → 428 ms (×23,8) | 2,34 → 14,9 s (×6,4) | 58 | 58 |

Esito: `✅ lentezza-384 VERDE` (verde in PC e telefono, rosso che cade). Il minuto di gioco in fluido torna a ~1,45 s di parete.
I primi minuti costano di più (~2,1 s) per l'avvio della scena 3D, non per una crescita.

Nota: «4 s per minuto nella 190, 6,5 s dopo» (giro 270) misurava l'intervallo fra due minuti con gli highlight dentro. La crescita
dentro la partita era questo velo, entrato il 23/09.

## 4. File toccati

- `src/15-live-match.jsx`: `Campo2D` → `disegna`, solo il blocco heat map (tela fuori schermo + una sfocatura; rosso; testimone).
- `CARRIER-MANAGER-AV.html`: ricomposto.
- `tests/visual/misura-384.mjs` (nuova sonda), `tests/visual/lentezza-384.mjs` (nuovo guardiano).
- `tests/visual/package.json`: script `lentezza-384`.
- `tests/visual/ci-runner.mjs`: `lentezza-384` in testa alla riga `src/15-` della MAPPA (`npm run mappa-unica` verde).

## 5. Rituali eseguiti

- `npm run lentezza-384`: verde (verde + rosso), due volte (a mano e dentro il giro).
- `node ci-runner.mjs giro lentezza-384` (guardiano + 17 sentinelle): `✅ catena giro su 7.999.215: 18/18 verdi` (lentezza-384 531 s, nessun passo instabile).

## 6. Guardiani della zona NON girati (li giudica il treno)

Tutta la riga `src/15-` della MAPPA tranne `lentezza-384` e le sentinelle. In particolare quelli che guardano il **campo 2D**, che
è l'area toccata: `partita2d-297`, `partita2d-141`, `partita2d-151`, `riserva2d-205`, `pallino-278`, `colori-286`, `spazio-270`,
`spazio-296`, `pc-tablet-292`, `partita-v2`, `partita-vera`.

## 7. Dubbi per il PO

1. **Come togliere il costo del velo caldo.**
   - **(consigliata, APPLICATA)** una sola sfocatura per fotogramma su una tela fuori schermo: stesso velo, costo costante.
   - ridisegnare il velo ogni mezzo secondo e riusare l'immagine negli altri fotogrammi: ancora più economico, ma il velo segue il
     pallone in ritardo e ogni mezzo secondo c'è un fotogramma più pesante;
   - spegnere il velo (`__CPM_NO_HEAT23` di default): costo zero, ma si perde la richiesta PO del 23/09.
2. **Il velo a schermo è uguale a prima?** Matematicamente sì, tranne la sovrapposizione degli aloni (≤ ~0,017 di alfa). Non l'ho
   fotografato.
   - **(consigliata, APPLICATA)** accettarlo così: è un velo «appena percettibile» per decisione PO e la differenza sta sotto
     l'1,7% di alfa;
   - aggiungere al guardiano una foto a confronto dei due bracci al 30' (differenza di pixel sul prato);
   - collaudo a occhio del PO sul telefono nella prossima pubblicata.
3. **Dove gira il guardiano nel ciclo.** Dura ~9 minuti (tre bracci in fila) e ragiona su rapporti dentro lo stesso braccio, quindi
   sopporta una contesa di CPU costante, ma non una che cambia a metà braccio.
   - **(consigliata, APPLICATA)** nella riga `src/15-` della MAPPA, fuori dall'elenco `LENTI` (gira nella sequenza, non a coppie):
     margine di soglia 1,5 contro un rosso a ×24;
   - nell'elenco `LENTI` (a coppie, più rapido ma più conteso);
   - solo nel treno grande notturno.
4. **Il telefono vero.** Sul banco il «telefono» è una finestra 412×915 con grafica software. Non posso confermare quanto pesasse il
   velo su un dispositivo reale.
   - **(consigliata, APPLICATA)** nessun lavoro in più: la correzione toglie il meccanismo a qualunque dispositivo;
   - misurare sul telefono del PO il fotogramma al 5' e al 40' di una partita 2D (taccuino);
   - fare un braccio con CPU rallentata (CDP `Emulation.setCPUThrottlingRate`) nel guardiano.
5. **Piccolo residuo non toccato.** Il testimone esistente `__CPM_HEAT23` (23/09) crea un `Float32Array` filtrato a ogni fotogramma
   anche se nessuno lo legge. È un costo piccolo e costante, non cresce, quindi è fuori dall'ambito.
   - **(consigliata, APPLICATA)** lasciarlo;
   - scriverlo solo se la sonda lo arma;
   - toglierlo.
