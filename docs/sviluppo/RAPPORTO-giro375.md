# Rapporto giro 375 — barriera a 9,15 m sulla linea pallone-porta (PO-637)

Base `lavoro/201` (8543a9cc). Ramo `sviluppo/giro375-barriera`. Decisione PO «Tutte le consigliate» dal giro 343 (dubbio 2).

## Misura prima (sonda `tests/visual/misura-375.mjs`, teatro acceso + GLB acceso, pallone e corpi letti dalle MESH; 1 u = 1 m)
13 scene di punizione: 8 del catalogo (gi13 14 15 51 78 81 150 161) + 5 costruite dal motore da punti di fallo diversi.

| | prima | dopo |
|---|---|---|
| centro della barriera dal pallone | 6,9 – 31,5 m | **9,15 m in 13/13** |
| scarto del centro dalla linea pallone → centro porta | 0,2 – 9,2 m | **0 m in 13/13** |
| corpo più vicino / più lontano | 7,4 / 52,9 m | 9,16 / 9,28 m |

Due cause, misurate separatamente:
1. **Il bersaglio** era calcolato in unità di GIOCO (y vale 0,68 m), con un passo fisso di +9 in x e una spinta del 25 % verso il centro: bersagli fra 8,3 e 11,2 m, fuori linea sulle punizioni laterali.
2. **I corpi non raggiungevano mai il bersaglio**: nelle fasi di lettura (`hl_intro/hl_move/hl_choose`) il congelamento tiene i corpi dove la scena li trova, cioè sulla linea difensiva (gi81: bersagli a 9 m, corpi a 14-30 m, identici a 1,5 · 4 · 8 s). È la stessa ragione per cui `barriera-73` era rosso anche sulla base.

## Correzione (solo `src/12-three-match-view.jsx`, ricomposto `CARRIER-MANAGER-AV.html`)
- **PASS 1, ramo punizione, «MURO compatto»**: centro della barriera a 9,15 m dal pallone verso il centro della porta (48,6 · 0) nel MONDO, i quattro spalla a spalla (1 m) sulla perpendicolare.
- **PASS 2, repulsione**: i quattro della barriera (`mur72`) non vengono spostati dalla bolla degli altri.
- **Ciclo dei corpi, fasi di lettura**: come il battitore (giro 43), i quattro della barriera di questa scena vanno sul loro punto e ci restano fermi (niente attesa attiva).
- **Testimone `__CPM_PUN343`** (sola lettura, solo collaudo): aggiunte le posizioni dei corpi della barriera (`pm`).
Rosso `window.__CPM_NO_G375` = conto e schieramento di prima. Deterministico (nessun sorteggio). Il gate senza `__CPM_PRESENT` non cambia comportamento nelle fasi di lettura; le posizioni off-ball non sono nella firma golden.
Non toccati: traiettoria dei tiri (giro 367), motore (src/14), GAME_VERSION, docs/governo.

## Guardiani
- `npm run barriera-375` (nuovo, riga della MAPPA `src/12-|src/13-`): verde 13/13 a 9,15 ± 0,3 m, scarto ≤ 0,5 m, nessun corpo sotto 9 m; rosso 13/13 fuori. ✅
- `npm run barriera-73`: verde 4 in barriera larga 4,4 u; rosso 2 larga 17,6 u. ✅ Aggiunto alla stessa riga della MAPPA.
- `npm run mappa-unica`: ✅.
- Sentinelle (`node ci-runner.mjs giro barriera-375`): vedi esito in fondo.

## Guardiani della zona NON girati (li giudica il treno)
`difesa-343` (testimone `__CPM_PUN343` esteso, campi in più), `piazzato-204`, `portatore-286` / `portatore-293` (il battitore resta escluso, la barriera è ferma come lui), `ellisse-334` (attesa attiva: i quattro della barriera ora non la fanno), `validate-situations` (gate 14/14), `partita-vera`.

## Dubbi per il PO
**Dubbio 1 — la barriera copre il centro della porta o il palo vicino?**
1. *(consigliata, APPLICATA)* Centro della barriera sulla linea pallone → centro porta, come dice la voce PO-637.
2. Spostarla di mezzo uomo verso il palo vicino (come le barriere vere, il portiere copre l'altro palo).
3. Spostarla del tutto sul palo vicino.

**Dubbio 2 — quanti uomini in barriera?** Oggi sempre 4 (i difensori di linea 1-4), anche da 30 m e defilati.
1. *(consigliata, APPLICATA: nessun cambiamento)* Restano 4: la voce chiede distanza e linea, non il numero.
2. Numero secondo distanza/angolo (2 da lontano o defilata, 4-5 centrale vicino all'area).
3. Numero dal motore (src/14 mette in barriera gli indici 0-3 di ogni squadra, portiere escluso: 3 o 4 a seconda di dove sta il portiere, non verificato): stessa cifra nel 3D e nella simulazione.

**Dubbio 3 — flusso vero.** La sonda misura le scene aperte dal banco con il teatro acceso. Nel flusso vero la scena nasce dalle posizioni del motore (src/14, «muro di quattro a 9,15u» per le punizioni con avanzamento ≥ 62, in unità di gioco, che in metri sono meno di 9,15 se la punizione è laterale); il 3D ora rimette comunque la barriera a 9,15 m all'apertura. **Non posso confermare** con una partita vera che ogni punizione dell'eroe passi da qui.
1. *(consigliata)* Una sonda su partite vere che cerchi le punizioni dell'eroe e misuri la barriera (come `sonda-rigore-139`).
2. Correggere anche il motore (src/14) in metri, per avere lo stesso numero nella simulazione.
3. Lasciare com'è.

## Esito sentinelle
`node ci-runner.mjs giro barriera-375` su 7.999.215 + questo ramo: **18/18 verdi** (barriera-375 + 17 sentinelle).
⚠️ `battito-264` **instabile**: rosso alla prima prova («divergenti 1 su 3 coppie»: la partita intera diverge dai soli highlight), verde alla seconda. È la stessa famiglia di `solo-highlight-166` in `ROSSI-DICHIARATI` (differenza su una riga di cronaca); questo giro cambia solo dove stanno i corpi della barriera nelle fasi di lettura col teatro acceso. **Non posso confermare** che non c'entri senza ripeterlo sulla base: lo segnalo al treno.
