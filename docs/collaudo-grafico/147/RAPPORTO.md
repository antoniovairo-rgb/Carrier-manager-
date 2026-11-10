# Giro 147 — i due rossi della verifica 189 (`folla`, `portiere-252`)

Ramo `collaudo/giro147-rossi189` da `lavoro/189` (eba3b48, 7.999.189). GAME_VERSION non toccata.
Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium, `free -m`/`df -h` prima di ogni corsa
(memoria libera sempre ≥ 9,9 GB, disco libero ≥ 26 GB). Log grezzi delle diagnosi accanto a questo file.

## Sintesi

| | causa | dove | introdotta dalla 189? | cosa ho fatto |
|---|---|---|---|---|
| A `folla` F2 | numeri di maglia (128x128) e targhette dei nomi (256x48) salgono sulla scheda grafica al **primo disegno**, a ondate, con GLB spento | gioco: src/12 `_mkNumTex` (r.~766) e targhette `_tag51` (r.~12425) | **no**: stesse ondate su e5ecf70a | corretto nel gioco (`initTexture` alla nascita), rosso `__CPM_NO_G147` |
| B `portiere-252` gi1 | caso angolato `gi1@88,86`: x=88 accende `_closeShot203` (riflesso sempre); se il portiere parte a z≈7,5-7,9 il pallone passa a 2,5-3,3u e il riflesso «parte tardi» | regola del gioco src/12 r.~6048 incontrata dalla posizione fissata dalla sonda del 138 | **no**: KO già su lavoro/188 (2/5) | **non corretto** (causa non chiara fra gioco e strumento): solo misure |

## A — `folla`: la texture 128x128

### Corse del guardiano

| # | build | esito | F2 [campionato · verde] | note |
|---|---|---|---|---|
| 1 | eba3b48 | PASSA | 0 | |
| 2 | eba3b48 | PASSA | 0 | |
| 3 | eba3b48 | PASSA | 0 | |
| 4 | e5ecf70a | PASSA | 0 | |
| 5 | e5ecf70a | PASSA | 0 | |
| 6 | e5ecf70a | PASSA | 0 | |
| 7 | eba3b48 + prima ipotesi di strumento (assestamento 1,5 s) | NON PASSA | 1 (128x128) ×2 corse | ipotesi sbagliata, ritirata: vedi sotto |
| 8 | 9e03574 (correzione) | PASSA | 0 | rosso visto 6/6 casi |
| 9 | 9e03574 (correzione) | PASSA | 0 | rosso visto 6/6 casi |

In locale il rosso della catena non si riproduce sulle 6 corse prima della correzione (3+3): il difetto è una **precedenza
di tempi**, non un caricamento sempre presente.

### Diagnosi (sonda `sonde/folla147diag.mjs`: avvolge `texImage2D`/`texSubImage2D`, registra ora, fase, sorgente nuova o già vista, pixel di prova)

- Lo stack di ogni caricamento 128x128 è interamente dentro three (`safeSetTexture2D` ← `upload` ← render): è il **caricamento
  pigro al primo disegno** di una texture mai usata, non un `needsUpdate`.
- Pixel: bianco pieno con contorno `rgba(7,9,16,0.95)` (alfa 242) e angoli trasparenti = **numero di maglia** (`_mkNumTex`,
  `strokeStyle 'rgba(7,9,16,0.95)'`). Non è l'alone dei fari (src/11 r.~1541, gradiente `255,248,225`).
- Ogni sorgente è **nuova** (`nuovo=true`): nessun ridisegno continuo. Il numero è **deterministico** (sempre 4 + 5 da 128x128,
  4 + 7 da 256x48 nelle 4 diagnosi a finestra lunga su eba; l'ondata 1 identica anche nelle 2 diagnosi su e5ecf70a, che erano a
  finestra corta); i **tempi no**.
- Due ondate, misurate dall'avvio della scena forzata (finestra lunga 22 s, `diag-eba-lungo.log`):
  - ondata 1: 4 numeri a **2,4-5,2 s**, poi 1024x24, 64x64, 4 targhette;
  - ondata 2: 5 numeri e 7 targhette (256x48 = targhette dei nomi `_tag51`, 7.999.97) a **11,2-19,3 s**, uno ogni ~0,5 s, mentre i
    giocatori entrano nel quadro o si avvicinano al pallone.
  La finestra di F2 sta fra 4,0-5,7 s e 10,0-11,7 s: un singolo 128x128 nella finestra (il rosso della catena) è la **testa
  dell'ondata 2** che anticipa, o la coda dell'ondata 1 che ritarda, su una macchina lenta.
- Perché solo qui: il preriscaldamento delle texture del 7.999.16 (src/12 r.~1257-1268) gira **solo dentro l'aggancio del CH38**;
  `folla` gira GLB spento, quindi nessuno carica in anticipo numeri e targhette.
- Commit: nessuno della 189. e5ecf70a (prima dell'unione del 145) ha la stessa ondata 1 (`diag-e5.log`, finestra corta: l'ondata 2
  lì non l'ho misurata, ma fra e5ecf70a e eba3b48 il codice di numeri e targhette non cambia — il diff di src/12 è il solo gancio
  `__CPM_G145GEO` a r.~4899-4930). Le targhette esistono
  dal 7.999.97, i numeri dal 5.49.8/7.132; il guardiano `folla` dal giro 129.

### Prima ipotesi ritirata

Ho provato prima a riparare lo strumento (aprire la finestra dopo 1,5 s senza caricamenti). **Ha peggiorato**: 2 corse su 2 NON
PASSA con F2=1 (128x128), perché spostava la finestra più vicina all'ondata 2. È così che l'ondata 2 è venuta fuori. Modifica
ritirata (`git checkout`), `folla-129.mjs` è invariato.

### Correzione (commit 9e03574)

`renderer.initTexture(t)` subito dopo la creazione della CanvasTexture dei numeri e di quella delle targhette. Rosso
`__CPM_NO_G147` = comportamento di prima.

| braccio | finestra | caricamenti 128x128 / 256x48 nella finestra | dove salgono |
|---|---|---|---|
| verde | 22 s | 0 / 0 (F2 = 0) | 11 numeri a −2,0…−1,9 s (costruzione), 22 targhette alla nascita |
| rosso `__CPM_NO_G147` | 22 s | 5 / 7 (F2 = 12) | come prima della correzione |

Più `folla` completo 2/2 PASSA (tabella sopra, corse 8-9). Non ho eseguito gate/catena completa: la modifica tocca src/12 (render)
e prima di un rilascio va la catena del motore.

## B — `portiere-252`: gi1 nel verde

### Corse (solo gi1: `CPM_GI=1`, sonda di eba3b48 su ogni build, `sonde/portiere147.mjs` = stessa sonda + cronologia)

| build | braccio | gi1 base (saved) | gi1@88,86 (saved) |
|---|---|---|---|
| eba3b48 | verde | ok 10/10 | **KO 1/10** (corsa 7) |
| 99be20f = lavoro/188 | verde | ok 5/5 | **KO 2/5** (corse 2, 5) |
| eba3b48 | rosso | ok 2/2 | ok 2/2 |

La bisezione sulle unioni intermedie (d7bfd98, 8b8f202, 2630f4b, e5ecf70a) **non l'ho eseguita**: la base 188 ha già il KO,
quindi non esiste un'unione della 189 che lo introduca. I worktree erano pronti; ho preferito usare il tempo per i campioni.

### Cronologia del tuffo (tempi in s di scena rispetto al passaggio del pallone sul piano del portiere; z in unità)

| caso | portiere z all'inizio → al piano | pallone z al piano | calcio | armo | inizio movimento | dist. min. | esito |
|---|---|---|---|---|---|---|---|
| eba v7 gi1@88,86 | 7,49 → 7,49 | 5,95 | −0,617 | −0,60 | **+0,307** | 0,19 | KO tardi |
| 188 v2 gi1@88,86 | 7,51 → 7,51 | 5,05 | −0,622 | −0,602 | **+0,303** | 0,50 | KO tardi |
| 188 v5 gi1@88,86 | 7,86 → 7,86 | 4,57 | −0,66 | −0,64 | **+0,292** | 0,22 | KO tardi |
| eba v4 gi1@88,86 | 3,02 → 3,02 | 1,97 | −0,738 | −0,718 | +0,214 | 0,14 | ok (dz 1,05) |
| eba v8 gi1@88,86 | −0,50 → −0,50 | −0,50 | −0,846 | −0,826 | +0,100 | 0,06 | ok (dz 0) |
| eba v1 gi1 base | −4,83 → −1,27 | −2,33 | −0,534 | −0,514 | −0,444 | 0,17 | ok (tuffo) |
| eba r1 rosso gi1@88,86 | −0,50 → −0,50 | 4,48 | −0,66 | — | mai | 0,21 | ok (vedi nota) |

Lettura:
- Tutti i KO hanno la stessa firma: gesto `gk_block` (riflesso), portiere che parte a **z 7,5-7,9**, pallone che passa a
  **2,5-3,3u** di lato, movimento che comincia 0,29-0,31 s **dopo** il piano. Quando il portiere parte vicino al pallone
  (dz ≤ 1,05) lo stesso riflesso è giudicato ok.
- Il riflesso è obbligato: con l'eroe fissato a x=88 vale `_closeShot203=(P.playerX||50)>=87` (src/12 r.~6048), che sceglie
  `gk_block` qualunque sia la distanza laterale. Il caso base gi1 (eroe non fissato) sceglie il tuffo e non va mai KO.
- La z di partenza del portiere varia fra le corse (−0,5 / 1,25-3,02 / 7,5-7,9) col seme del bersaglio fisso: la sonda del 111
  fissa il bersaglio, non la posizione del portiere. Da dove venga quella variazione non l'ho misurato.
- Nota sul rosso: in r1 il portiere non si muove mai con il pallone a 4,98u; la sonda non lo giudica KO perché è fuori portata
  (> 4,5u) e «tardi» richiede che il movimento esista. Lo segnalo, non l'ho cambiato.

### Perché non correggo

La causa sta nell'incontro fra una regola del gioco (riflesso obbligato da x ≥ 87, 7.203) e la posizione fissata dalla sonda
del giro 138. Correggere il gioco (tuffo invece del riflesso quando il pallone passa oltre 1,2u) cambia la parata a bruciapelo
per tutte le scene vicine alla porta; correggere lo strumento (togliere o spostare il caso x=88) toglie proprio il caso con cui il
138 aveva dimostrato che il rosso si vede. Non è chiaro quale delle due sia giusta: nessuna correzione, solo le misure.
Da notare anche che il «rosso visto» del 138 su gi1@88,86 potrebbe essere questo stesso meccanismo e non il difetto vecchio:
nelle due corse rosse di oggi gi1@88,86 è ok.

## File

- `src/12-three-match-view.jsx` + `CARRIER-MANAGER-AV.html` (ricomposto con `tools/build-src.mjs`): correzione A.
- `sonde/folla147diag.mjs`, `sonde/portiere147.mjs`: sonde di diagnosi (si lanciano da `tests/visual`; `DIAG_N`, `DIAG_CTX`,
  `DIAG_WIN`, `DIAG_NO147`).
- `diag-eba-lungo.log`, `diag-e5.log`, `diag-fix.log`: caricamenti con ora, fase e pixel.
