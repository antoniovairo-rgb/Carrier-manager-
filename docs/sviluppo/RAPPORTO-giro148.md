# Giro 148 — il portiere a bruciapelo (PO-350)

Ramo `sviluppo/giro148-portiere` da `lavoro/189` (0d4915e9). `GAME_VERSION` non toccata.

## Il difetto (dal giro 147)

Con l'eroe a x ≥ 87 `_closeShot203=(P.playerX||50)>=87` (src/12, r. ~6048) imponeva il riflesso `gk_block` qualunque fosse la
distanza laterale. KO di `portiere-252` su gi1@88,86 («tardi»), intermittente.

## Misura prima (build 0d4915e9, 10 corse di gi1, `sonde/portiere148.mjs` = sonda del 147 + interruttore `CPM_NO148`)

| | gi1 base | gi1@88,86 |
|---|---|---|
| verde, build di partenza | ok 10/10 (sempre tuffo) | **KO 2/10** (corse 2 e 7) |

Firma dei due KO (`base-verde.log`): riflesso, portiere al calcio a z 5,40 e 7,86, pallone al piano a 2,45 e 3,30u, movimento
+0,24 e +0,27 s **dopo** il piano. Gli 8 ok: riflesso col pallone al piano a 0-0,94u.

### Perché la z di partenza varia (domanda aperta del 147, ora misurata)

Ho aggiunto al testimone di prova `__CPM_GKACT` (solo `cpmtest`) la geometria al momento della decisione (`d148`: punto di passaggio
stimato, portiere, pallone, bersaglio). Su 5 corse (`diag-scatto.log`):

| portiere alla decisione | portiere al calcio | passaggio stimato | passaggio vero | esito |
|---|---|---|---|---|
| −0,75 | 1,74 | 1,74 | 1,23 | ok |
| −1,05 | 1,77 | 1,77 | 1,02 | ok |
| −1,51 | 7,49 | 10,45 | 6,08 | KO |
| −2,18 | −0,50 | −0,50 | −0,50 | ok |
| −1,12 | 6,42 | 6,42 | 4,16 | KO |

- Il riflesso **trasla il portiere in 0,19 s fin dal caricamento** (prima del calcio) verso il punto di passaggio stimato, con un
  morsetto di ±9u. La «z di partenza» che il 147 vedeva variare è quella **dopo** questo scatto.
- Su questa scena il tiro parte da x 43,5-43,8, z ≈ 23,4 (eroe quasi sulla linea di fondo, vicino alla fascia), il portiere sta a
  x ≈ 44,2 e il bersaglio a x ≈ 44,3: il pallone corre **quasi parallelo** al piano del portiere. La stima lineare del passaggio
  (frazione 0,57/0,67) è instabilissima: piccoli scarti di x spostano il punto stimato di molte unità (10,45 stimato contro 6,08 vero).
- Quando la stima sbaglia di poco il riflesso arriva addosso (ok); quando sbaglia di molto il portiere finisce fuori dal palo, il
  pallone gli passa a 2,5-3,3u e il «movimento» arriva dopo.

## La correzione (src/12, una riga di logica + testimone)

```js
const _close148=_closeShot203&&!(_gk252&&!window.__CPM_NO_G148&&_dz203>=1.2);
oppActType=(_svK203&&(_dz203<(_gk252?1.2:2.4)||_close148)&&!_tuffoTesto23(P))?"gk_block":"gk_dive";
```

- A bruciapelo il riflesso resta solo se il pallone arriva entro **1,2u** — la stessa soglia del riflesso su ogni altro tiro
  (giro 22 / 7.999.162). Soglia scelta dopo la misura: ok a 0-1,05u, KO da 2,45u in su (147 + baseline).
- Oltre 1,2u è un **tuffo vero**: la distesa è legata al progresso dell'arco (7.465), quindi parte al calcio e il movimento comincia
  prima che il pallone arrivi sul piano.
- Esito, arco, bersaglio: invariati (si cambia solo `oppActType`). Nessun sorteggio nuovo. Vale solo col canale del giro 22 acceso
  (`_gk252`): il braccio rosso storico di `portiere-252` (`__CPM_NO_GK252`) resta identico.
- **Il rigore è escluso** (seconda stesura, dopo `scena3d-96`: vedi Catena).
- Interruttore rosso: `__CPM_NO_G148`.

## Misura dopo

| prova | verde | rosso `__CPM_NO_G148` |
|---|---|---|
| `sonde/portiere148.mjs`, gi1@88,86, 10 corse | **ok 10/10** (7 tuffi, partenza −0,53…−0,68 s dal piano; 3 riflessi a 0u) | **KO 3/10** (riflesso «tardi», dz 1,56-3,0) |
| `portiere-252` ufficiale, `CPM_GI=1`, gi1@88,86, 10 corse | **ok 10/10** | — |
| `portiere-252` completo | ✅ VERDE: verde KO 0/10, rosso KO 2/9 | |

Log: `148/base-verde.log`, `148/fix-verde.log`, `148/fix-rosso148.log`.

## Foto prima/dopo (GLB acceso)

`148/foto/griglia-prima-dopo.png` (in alto prima = `__CPM_NO_G148`, in basso dopo; colonne: calcio · massimo avvicinamento ·
+0,3 s). Prese da una seconda camera alta sull'area (`sonde/foto148.mjs`, solo nella pagina della sonda: `__CPM3D`).
Prima: portiere in piedi a z 9,75 (dopo lo scatto pre-calcio), pallone che si ferma a 1,49u da lui. Dopo: portiere in tuffo sulla
linea del pallone. ⚠️ In headless il campionamento è rado (pochi fotogrammi per volo): le foto mostrano la posa, non il tempo.

## Catena (un controllo alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, build del commit di correzione)

| controllo | esito |
|---|---|
| `portiere-252` completo | ✅ VERDE (verde KO 0/10 · rosso KO 2/9) |
| `portiere-252` `CPM_GI=1`, gi1@88,86 ×10 | ok 10/10 |
| `contatto-103` | ✓ VERDE (verde 4 parate, 0 difetti · rosso 2 D3 su 4) — la prima corsa era stata tagliata dal mio timeout a 580 s e non vale; rifatta intera |
| `gk-dive-sync` | ✅ PASS |
| `intro-118` | VERDE |
| `validate-situations` | ✅ PASS 14/14, fingerprint 00001505, 0 failure |
| `portiere-252` `CPM_GI=1`, gi1@88,86 ×3 sulla build col rigore escluso | ok 3/3 (tuffi) |
| `highlight-95` (completo) | verde: 108 highlight, D4 senza esito 0 — braccio rosso: ✅ «verde (e il rosso si vede)» — rosso 110 highlight, D4 senza esito 7 |
| `scena3d-96` (un formato per chiamata) | **trovata una regressione mia e corretta**: tel, corsa tagliata dal mio tetto a 560 s (non vale come corsa intera), ma prima del taglio ✗ `tel-gi58-parata` «D4 tuffo prima del tiro (3 fotogrammi, 0,17u)». Isolata (`CPM_G96_LISTA=58:parata`): ✗ col correttivo, ✓ con `__CPM_NO_G148` → il rigore passava dal riflesso al tuffo. Correzione: il rigore è escluso (`t!=='penalty'`). Dopo: gi58 tel ✓. **Non eseguiti per il tetto delle 4 ore**: `scena3d-96` tel intero e i formati pc, tabv, tabo |
| `partita-vera` | **non eseguito** (tetto delle 4 ore) |
| `test:logic` | ✅ 43 pass, 0 fail |
| `save-compat` | ✅ 12 pass, 0 fail |

## Domande aperte per il PO (non decise)

1. **La posizione fissata (88,86) di `portiere-252` misura una geometria degenere.** Con l'eroe a z ≈ 23 il tiro corre quasi
   lungo il piano del portiere: il «piano» della sonda (primo fotogramma con pallone oltre la x del portiere) e la «distanza
   laterale al piano» sono mal definiti quando la traiettoria è quasi parallela. Non l'ho toccata. Resta da decidere se il caso
   del giro 138 vada spostato verso un vero bruciapelo (centrale) o tenuto com'è.
2. **Il tuffo oltre il palo.** Col correttivo, quando la stima del passaggio è lontana (fino a 9,9), il tuffo va verso quel punto
   — anche fuori dal palo (z 7,9-9,8) — e la distanza minima dal pallone resta 0,04-0,85u nelle 10 corse. Non ho rifatto la stima
   del punto di passaggio (sarebbe un cambio più grande: una rimira in volo come `_blk229`, o la distanza dalla traiettoria invece
   del piano). È la causa a monte; la lascio come cantiere.
3. **Rosso r1 del 147** (portiere fermo col pallone a 4,98u nel braccio `__CPM_NO_GK252`): fuori portata per la sonda (> 4,5u),
   non giudicato. Non toccato.

⚠️ **Le corse della catena prima di `scena3d-96` (portiere-252, contatto-103, gk-dive-sync, intro-118, validate-situations,
highlight-95, test:logic, save-compat) sono sulla prima stesura**, che differiva dalla finale solo sul rigore. Sulla finale ho rifatto
gi58 tel e 3 corse di gi1@88,86. **Da rifare sulla build finale prima di unire**: catena completa, compresi `scena3d-96` nei quattro
formati e `partita-vera`.

4. **Il tuffo del rigore** (gi58): con il tuffo al posto del riflesso il portiere si muove 0,09-0,17u prima del tiro. È il motivo
   dell'esclusione; perché il tuffo del rigore si muova prima del calcio non l'ho misurato.
