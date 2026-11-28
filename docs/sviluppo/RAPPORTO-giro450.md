# Rapporto giro 450 — PO-669: riparazione del guardiano `buildup-sync`

**Base:** main 7.999.219 · **ramo:** `sviluppo/giro450-buildup-sync` · GAME_VERSION e `docs/governo` non toccati.

## In breve

Il «salto del pallone all'ingresso della costruzione» **era un difetto della misura, non del gioco.**
Sotto `?cpmtest=1` lo stacco di scena è spento (`_asIfPlay`, 7.345). Così una scena forzata trova il
pallone ancora in viaggio dalla scena precedente. All'avvio della costruzione la testa della timeline lo
riporta ai piedi dell'eroe in un fotogramma. Col teatro armato (`__CPM_PRESENT=1`, come prescrive CLAUDE.md
per ogni sonda che giudica le aperture di scena) le stesse scene entrano pulite. In partita vera non
succede.

Correzione: nel **guardiano** (`tests/visual/buildup-sync-test.mjs`). Il gioco non cambia.

## 1. Misura sulla base, fotogramma per fotogramma

Sonda nuova `tests/visual/misura-450.mjs`. Segue lo stesso percorso di buildup-sync (force → resolve).
Intorno al primo fotogramma con la costruzione accesa (tl 0→1) registra i due fotogrammi del recorder
(fase, chiave di scena, pallone, eroe, beat) e le voci del varco `__CPM_BJ478` (scrittore, `_bjPrev477`,
stacco vivo). Soglia del varco abbassata a 3 u (`__CPM_BJMIN=3`).

| scena | salto d'ingresso | in | scrittore (BJ478) | fotogramma prima | stacco vivo |
|---|---|---|---|---|---|
| gi91/az0 | 26,3 u | 39 ms | `buildup-volo+testa` | `inseguitore` (1,7 u/fotogramma) | no |
| gi92/az0 | 22,8 u | 56 ms | `buildup-volo+testa` | `inseguitore` (1,15 u/fotogramma) | sì |
| gi84/az0 (corsa del guardiano) | 24,5 u | 28 ms | — | — | — |
| le altre 7 (az0/az1 di 83, 84, 91, 92) | 0,1-0,9 u | — | — | — | — |

Cosa dicono i fotogrammi (gi91/az0):

```
f-3 hl_choose  pallone 36.46, 7.04   eroe 45.06,-19.72   ← il pallone sta ancora dove l'ha lasciato la scena prima
f-2 hl_choose  pallone 36.79, 6.11   eroe 45.06,-19.72   ← l'inseguitore lo avvicina a ~1 u per fotogramma
f-1 hl_result  pallone 37.36, 4.51   eroe 45.06,-19.72
f0  hl_result  pallone 45.05,-20.67  eroe 45.05,-19.72   tl=1 tk=carry ← la testa della costruzione lo mette ai piedi
```

Il difetto colpisce **sempre l'az0**, cioè la prima risoluzione dopo una scena diversa. L'az1 rigioca la
stessa scena e trova il pallone già lì. Per questo «le scene cambiano da una corsa all'altra»: dipende da
dove la scena precedente ha lasciato il pallone. Sulla base, in tre corse, le scene rosse sono state
gi84/91/92, gi79/83/84 e gi40/83/91.

## 2. Gioco o misura? I numeri

| percorso | ingressi > 3 u | massimo |
|---|---|---|
| banco senza teatro (la misura di prima) | 3 su ~10 az0 a corsa | 43,1 u |
| banco col teatro (`__CPM_PRESENT=1`), scene 40/83/84/91/92 | **0 su 10** | 1,0 u |
| partita vera, senza teatro (`misura-450-vere.mjs`) | **0 su 4** | 1,0 u |

Verifica contro gli invarianti di CLAUDE.md:

- **«velocità × intervallo»**: escluso. Il salto avviene in un fotogramma da 21-56 ms, e 24 u non sono un
  passo di passaggio (20-25 u/s danno meno di 1,5 u in quel tempo).
- **«stacchi neri»**: non è la spiegazione principale. gi91 salta con lo stacco spento (`mask=false`). Il
  punto è che sul banco lo **snap di scena** (`_doSnap = _hlSnap && _asIfPlay`) non parte affatto. In
  partita parte, e la scena si apre col pallone già sul suo punto.
- **«un padrone per fotogramma»**: nel fotogramma del salto scrivono due firme, `buildup-volo+testa`. È la
  coppia già dichiarata come residuo nel 7.515. Qui non c'è conflitto di padroni: la testa scrive per
  ultima e decide. Il salto viene dal punto di partenza sbagliato (la scena precedente), non dalla coppia.

**Verdetto: difetto della misura.** È la stessa trappola descritta nelle note del giro 265 e del 7.345
(«una scena forzata trova i corpi in viaggio dalla scena precedente: una sonda che giudica una posizione
la provoca o arma `__CPM_PRESENT=1`»).

## 3. Correzione (alla fonte, cioè nello strumento)

`tests/visual/buildup-sync-test.mjs`:

- arma `window.__CPM_PRESENT = 1`, salvo con `window.__CPM_NO_G450`;
- **GLB acceso** di default, come vuole la regola del giro. `CPM_GLB=0` rimette il percorso storico;
- il rosso: `CPM_NO_G450=1` mette `window.__CPM_NO_G450 = 1`, il teatro resta spento e il guardiano deve
  tornare a vedere il salto;
- braccio e GLB stampati per ultimi (regole di PROCESSO.md sui controlli instabili).

Soglie invariate: `SALTO_MAX` 3,0 u e `RAPP_MIN` 0,25.

## 4. Esiti

| corsa | braccio | esito | salto max | rapporto min |
|---|---|---|---|---|
| 1 | verde, GLB acceso | ✅ 37 build-up | 1,4 u | 0,46 |
| 2 | verde | ✅ | 1,3 u | 0,46 |
| 3 | verde | ✅ | 1,3 u | 0,46 |
| 4 | verde | ✅ | 1,4 u | 0,45 |
| 5 | verde | ✅ | 1,3 u | 0,57 |
| rosso | `CPM_NO_G450=1` | ❌ uscita 2 (gi79 43,1 u · gi83 28,4 u · gi84 24,3 u) | 43,1 u | — |
| base (prima) | GLB spento, senza teatro | ❌ 3 (gi84 24,5 · gi91 25,8 · gi92 23,1) | 25,8 u | 0,60 |

`node ci-runner.mjs giro buildup-sync`: **18/18 verdi** (sezione 6).

Nota: il guardiano osserva 37 build-up e non 46. Le scene 150/174/181 non si lasciano forzare dopo la 141
(il ciclo esce su `!ok`): succedeva già sulla base, uguale. Non è toccato qui.

## 5. Dubbi per il PO

**D1 — Dove si ripara?**
1. **(consigliata, applicata)** Nel guardiano: teatro armato, come prescrive la regola delle aperture di
   scena. Il gioco è sano sul percorso del giocatore (0 su 4 in partita vera, 0 su 10 col teatro).
2. Nel gioco: quando la costruzione parte col pallone a più di 4 u dal primo beat, il pallone vola
   (invariante «il pallone lontano vola, non scivola», giro 274) invece di comparire. Però correggerebbe
   uno stato che esiste solo sul banco, e allungherebbe la costruzione.
3. Nel guardiano, senza teatro: escludere dal giudizio il fotogramma d'ingresso dell'az0. È una soglia
   travestita e lascerebbe cieco l'ingresso, che è il salto più visto dal PO (7.395). Sconsigliata.

**D2 — `buildup-sync` esce da `ROSSI-DICHIARATI.json`?**
1. **(consigliata)** Sì: 5 corse verdi su 5, rosso visibile. Non ho toccato il file: la decisione e la
   modifica spettano al PO o al governo.
2. Dopo una notte di treno grande verde sulla punta che contiene questo ramo.
3. Lasciarlo dichiarato finché il giro 364 non chiude il cantiere della costruzione larga.

**D3 — GLB acceso nel guardiano?**
1. **(consigliata, applicata)** Sì, di default. Stessa durata (~2 min 50 s), stessi build-up osservati
   (37). Il rapporto minimo eroe/palla scende da 0,57 a 0,45-0,57, comunque sopra la soglia di 0,25.
2. GLB spento come prima (è un guardiano di logica: i corpi GLB non cambiano il pallone).
3. Due bracci, uno per tipo, raddoppiando il tempo.

**D4 — Le tre scene che non si lasciano forzare (150/174/181)?**
1. **(consigliata)** Un giro a parte per capire perché `__CPM_FORCE_SIT` rifiuta dopo la 141 (la
   copertura dichiarata è 23 scene, quella vera 20).
2. Toglierle dall'elenco dichiarandolo.
3. Lasciare com'è.

## 6. `ci-runner.mjs giro buildup-sync`

**18/18 verdi sulla 7.999.219**, nessun passo instabile: buildup-sync (167 s) + le 17 sentinelle
(mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico ·
griglia-mobile · render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 ·
partita-vera · gk-dive-sync · schermate-97). Il record che il runner scrive in
`docs/governo/STABILITA.json` non è nel commit (regola del giro: `docs/governo` non si tocca).

## File

- `tests/visual/buildup-sync-test.mjs`: teatro armato, GLB acceso, rosso `__CPM_NO_G450`.
- `tests/visual/misura-450.mjs`: sonda del fotogramma d'ingresso (banco, `CPM_PRESENT=1` opzionale).
- `tests/visual/misura-450-vere.mjs`: sonda del fotogramma d'ingresso in partita vera.
- `docs/sviluppo/RAPPORTO-giro450.md`: questo rapporto.
