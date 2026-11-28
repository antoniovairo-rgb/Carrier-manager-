# Rapporto giro 451 — pattinamento dei piedi, giro di sola misura (PO-665)

**28/11/2026 · ramo `sviluppo/giro451-pattinamento` · base `main` (7.999.219) · nessun bump di `GAME_VERSION`, `docs/governo` non
toccato · gioco NON corretto.** Toccati: `src/12-three-match-view.jsx` (solo il testimone, acceso solo da una sonda) + build
`CARRIER-MANAGER-AV.html`, `tests/visual/pattinamento-451.mjs` (nuova), `tests/visual/package.json` (script), questo rapporto e
`docs/sviluppo/giro451/rapporto-sonda.txt` (uscita completa della sonda).

Mandato (giro 366, dubbio 4, scelta del PO «Giro di sola misura»): riparare il conteggio per fase di `__CPM_PIEDI` (7.999.7), che
negli highlight dava 0 su 0, misurare il pattinamento sulle scene 3D, proporre al PO cosa correggere per primo.

---

## 1. Il testimone riparato

**Causa misurata:** il blocco del testimone (src/12, ciclo dei corpi GLB) leggeva `matchPhase` dalla chiusura del ciclo, che nasce
una volta al montaggio (deps `[]`): la fase era sempre quella iniziale, quindi `hl` era sempre falso. Lo stesso blocco, nella riga
di dettaglio dell'eroe (giro 22), leggeva già la fase giusta da `propsRef.current` — c'era scritto nel commento.

**Riparazione:** la fase si legge da `propsRef.current.matchPhase`. Rosso `__CPM_NO_G451` = la lettura di prima.

**Prova** (`npm run pattinamento-451 -- testimone`, stessa scena gi0, GLB acceso, notte):

| braccio | corpi-fotogrammi contati | di cui negli highlight |
|---|---|---|
| verde (riparato) | 363 | **363** |
| rosso `__CPM_NO_G451` | 356 | **0** (il «0 su 0» del giro 366) |

I campi storici (`fr`, `cont`, `sk`, `perCorpo`) non cambiano definizione: `piedi-252` e le altre sonde che li leggono restano
confrontabili. Cambia solo `hl`, che prima era sempre vuoto.

**Aggiunto** (registro `v451`, acceso solo da `__CPM_PIEDI451`, sola lettura): conteggi per fase × famiglia (`hlType`, «ingresso»
nel walkout) × classe di corpo (eroe/compagno/avversario/portiere/arbitro) × modo della radice (ferma < 0,3 m/s · passo < 2,5 ·
corsa); e gli **appoggi** = tratti di almeno 3 fotogrammi consecutivi con il piede sotto 6 cm, con lo spostamento del piede in
pianta, quello della radice, la clip di locomozione, il peso e la cadenza della corsa. I fotogrammi con un salto della radice oltre
1,2 m (messa in scena, stacco) sono esclusi e chiudono gli appoggi (1.133 esclusi a CPU normale). Il tempo è quello di **scena**
(`dt` del ciclo, tappato a 0,05 s); la colonna «sc.anim» rifà il conto sull'orologio dell'animazione (`aDt`, rallentatore
compreso): differisce di 1-5 punti, non cambia nessuna conclusione.

## 2. Come ho misurato

`tests/visual/pattinamento-451.mjs`: GLB acceso, **notte** (`__CPM_TOD=night`), banco (`?cpmtest=1`, scene forzate con
`__CPM_PRESENT=1` e `__CPM_CINE=1`), pagina nuova ogni 3 esecuzioni (7.483). Per ogni scena: scena-esca, poi la scena misurata
dall'apertura (lettura compresa) fino a 4 s di scena dopo la scelta, esito successo e fallimento. L'ingresso si misura sul
percorso vero (salvataggio → partita → walkout, come `tunnel-245`), tutto il walkout (15,7 s di scena).

| condizione | scene per famiglia | esecuzioni | fps reali (mediana) |
|---|---|---|---|
| CPU normale | 6 (×2 esiti) | 61 | 14,6 |
| CPU rallentata ×4 (CDP) | 3 (×2 esiti) | 31 | 7,2 |

Famiglie: tiro (tiro+testa), cross, dribbling, difesa (contrasti+difesa), piazzati (rigore+punizione), ingresso. ⚠️ A CPU ×4 la
famiglia «dribbling» ha preso tre scene di tipo «pass» (la scelta è a passo fisso nel repertorio): non contiene un «dribble» vero.

## 3. Prima di leggere i numeri: quanto è strumento

Ho rifatto la prova di strumento del giro 22 (`__CPM_PIEDI_SINT252`: un clone dell'eroe corre con la clip **perfettamente
sincronizzata** alla radice). Sul corpo di oggi (clip «jog») **il criterio del 7.999.7 non scende sotto il 69%**:

| velocità naturale imposta (u/s per altezza) | 0,9 | 1,081 | 1,3 | 1,5 | **1,804** | 2,2 |
|---|---|---|---|---|---|---|
| criterio 7.999.7 (piede < 6 cm che scorre > 0,5 m/s) | 93% | 91% | 93% | 89% | **69%** | 76% |
| criterio d'appoggio (piede più basso) | 89% | 85% | 89% | 81% | **43%** | 55% |
| velocità mediana del piede d'appoggio (m/s) | 1,79 | 1,47 | 1,21 | 0,87 | **0,41** | 0,56 |

Il giro 22 aveva misurato 4-10% su un altro corpo. Oggi, anche nel caso migliore, il piede «d'appoggio» della clip scorre a 0,41 m/s
e la soglia dei 6 cm non separa l'appoggio dal volo (i piedi della clip stanno sempre entro 6 cm dalla radice: «contatto» 100%).
**Conseguenza: in corsa i valori assoluti di «scivola» (90-98%) non si possono leggere come «difetto»: il pavimento dello
strumento su quella clip è ~69%.** Il riferimento opposto regge: l'arbitro fermo nel walkout misura **2,2%** e 16 cm/s, quindi un
corpo davvero fermo lo strumento lo vede fermo. I numeri più affidabili sono quelli con **la radice ferma** (§4.3) e i
**confronti** fra famiglie e corpi; **non posso confermare** con questo strumento quanto del pattinamento in corsa si veda a occhio.

## 4. Le misure (CPU normale; fra parentesi CPU ×4)

Legenda: *scivola* = quota dei piede-fotogrammi a terra che scorrono oltre 0,5 m/s · *v* = velocità media del piede a terra (cm/s
di scena, un piede piantato vale 0) · *appoggio* = scivolamento del piede durante un appoggio (cm).

### 4.1 Per famiglia

| famiglia | scivola | v cm/s | appoggio mediana | appoggio p90 |
|---|---|---|---|---|
| tiro | 78,3% (83,2%) | 321 (376) | 84,5 (96,8) | 213 (261) |
| cross | 74,6% (81,2%) | 320 (401) | 95,2 (100,6) | 245 (296) |
| dribbling | 71,2% (73,9%) | 322 (393) | 84,9 (81,9) | 230 (242) |
| difesa | 69,4% (72,4%) | 316 (338) | 67,5 (75,8) | 205 (233) |
| piazzati | 40,0% (49,2%) | 172 (252) | 64,7 (81,4) | 234 (275) |
| ingresso | 43,9% (43,8%) | 172 (172) | 66,0 (66,0) | 136 (131) |
| **tutte** | **62,3% (66,4%)** | **270 (316)** | **76,0 (79,0)** | **218 (242)** |

L'ingresso è identico fra le due condizioni (walkout deterministico: due corse a CPU normale hanno dato lo stesso
conteggio, 7.414 piede-fotogrammi ciascuna). Le scene forzate peggiorano di 3-9 punti a CPU ×4: con meno fotogrammi ogni passo di scena è più lungo.

### 4.2 Per corpo (tutte le famiglie)

| corpo | scivola | v cm/s | appoggio mediana | appoggio p90 |
|---|---|---|---|---|
| eroe | 48,9% (50,3%) | 170 (175) | 42,2 (51,0) | 205 (204) |
| compagno | 78,6% (76,1%) | 366 (394) | 75,6 (79,2) | 194 (232) |
| avversario | 65,7% (70,7%) | 291 (344) | 88,3 (90,8) | 234 (263) |
| portiere | 29,9% (37,0%) | 95 (129) | 42,5 (42,5) | 113 (128) |
| arbitro (solo ingresso) | 2,2% (2,2%) | 16 (16) | — | — |

Famiglia × corpo è in `docs/sviluppo/giro451/rapporto-sonda.txt`. I picchi: compagni nel tiro 96%/487 cm/s, compagni nel dribbling
92%/527 cm/s, avversari nel cross 85%/381 cm/s con 114 cm di mediana per appoggio. L'eroe sta sempre sotto i compagni (la sua corsa
ha la cadenza dal giro 22 e lo scatto dal giro 76: gli altri 21 no).

### 4.3 Per modo della radice — il dato più pulito

| radice | scivola | v cm/s | appoggio mediana | quota dei piede-fotogrammi |
|---|---|---|---|---|
| **ferma** (< 0,3 m/s) | 22,6% (25,6%) | 60 (67) | 43,3 (50,6) | 39% |
| passo (< 2,5 m/s) | 80,0% (70,5%) | 231 (225) | 76,1 (68,4) | 34% |
| corsa | 96,0% (97,5%) | 609 (599) | 92,9 (99,8) | 28% |

Con la radice ferma il piede non dovrebbe muoversi affatto (l'arbitro fermo: 2,2%). Invece: eroe fermo 31,8%, compagni fermi 30,1%,
portieri fermi 21,9%, avversari fermi 18,3%. Dividendo gli appoggi a radice ferma per lo stato della corsa (tiro + piazzati, ultima
misura): **118 appoggi con la corsa accesa (peso > 0,5) e cadenza 0,5 → mediana 62 cm**: il corpo è fermo ma la clip di corsa
suona al minimo della cadenza, cioè «corre sul posto». Gli altri 358 appoggi a radice ferma con la corsa spenta danno mediana 34 cm:
vengono da clip di gesto/guardia o laterali (`strL`/`strR`/`back` nelle barriere e nei piazzati) — **non posso confermare** quale
clip, perché il nome del gesto si registra solo sopra peso 0,3.

In **passo** la corsa è accesa (peso > 0,5) in 350 appoggi su 373, con cadenza mediana **0,65**: è la fascia dove velocità e
cadenza si sincronizzano peggio.

### 4.4 Per fase (CPU normale)

| fase | scivola | v cm/s | appoggio mediana |
|---|---|---|---|
| hl_intro | 72,3% | 352 | 20,1 |
| hl_choose | 66,4% | 205 | 75,0 |
| hl_result | 64,1% | 309 | 86,4 |
| walkout | 43,9% | 172 | 66,0 |

⚠️ Sul banco il congelamento di lettura (5.47.12) è spento: in `hl_choose` i corpi si muovono anche se nel gioco vero starebbero
fermi ~0,9 s. Il dato di lettura va preso come «banco», non come gioco.

### 4.5 Dove sta lo scivolamento (somma dei cm sugli appoggi, CPU normale)

Avversari in corsa 35% · compagni in corsa 13% · camminata di avversari e compagni (soprattutto ingresso) 16% · avversari di lato
(`strL`/`strR`) 11% · avversari all'indietro 6% · portieri in corsa 4% · eroe in corsa 2%. **L'eroe vale l'8,2% dei cm di scivolamento
sugli appoggi: gli altri 21 corpi il 91,8%.**

## 5. Proposta al PO: cosa correggere per primo

Nessuna correzione è stata fatta in questo giro. Le cifre sopra sono la base.

**Consigliata — A. «Niente corsa sul posto» (radice ferma).** È il caso che si vede di più (il corpo è fermo e i piedi camminano),
quello dove lo strumento è affidabile (riferimento arbitro 2,2%) e quello col criterio di chiusura più semplice: con la radice
sotto 0,3 m/s la corsa si spegne e resta idle/guardia. Bersaglio: «scivola a radice ferma» da 22,6% verso il riferimento
dell'arbitro, appoggio mediano da 43 cm a pochi cm. Guardiano naturale: questa sonda, riga «ferma».

**B. Cadenza dei 21 non eroi (passo e corsa).** Portare a compagni e avversari quello che il giro 22 ha dato all'eroe (velocità
naturale della clip attiva, cadenza propria, clip di corsa vera sopra 5 u/s). È la parte più grande del totale (91,8% dei cm),
ma **prima serve uno strumento migliore** (§3): una soglia di contatto per piede adattiva (minimo del ciclo + 2 cm) e la prova
sintetica che scenda sotto il 10% sul corpo di oggi. Senza, un miglioramento in corsa non si distingue dal pavimento del 69%.

**C. Camminata dell'ingresso.** 44% e 66 cm per appoggio con la camminata deterministica: è la scena più lunga che il PO guarda a
ogni partita e si misura identica a ogni giro (buona per un prima/dopo). Riguarda la sola clip di camminata e la sua velocità.

**D. Riparare prima lo strumento in corsa, poi decidere.** Un giro solo di strumento (contatto adattivo, validazione sintetica su
jog/scatto/camminata) e rifare questa misura. È la scelta più prudente se il PO vuole numeri assoluti anche in corsa prima di
toccare il gioco.

## 6. Dubbi per il PO

1. **Ordine dei lavori:** A (corsa sul posto) → B (cadenza dei 21) → C (camminata d'ingresso), oppure D (strumento) prima di tutto?
   Consiglio A, che non dipende dallo strumento in corsa.
2. **Il riferimento giusto per «fermo»:** prendo l'arbitro fermo (2,2%) come bersaglio di A, o il PO preferisce un numero assoluto
   (per esempio «appoggio mediano sotto 5 cm»)?
3. **Le scivolate:** i contrasti in scivolata scorrono per costruzione; in questa misura sono dentro «difesa». Vanno esclusi dal
   conteggio (per nome della clip) nei giri successivi?

## 7. Uso e limiti

```bash
cd tests/visual
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run pattinamento-451 -- testimone   # verde + rosso
CPM_SCENE=6 npm run pattinamento-451 -- tiro      # tiro|cross|dribbling|difesa|piazzati|ingresso · CPM_CPU=4
npm run pattinamento-451 -- rapporto              # tabelle da out/pattinamento-451/*.json
```

Ogni famiglia sta sotto i 10 minuti per chiamata (CPU normale ~3 min con 6 scene; CPU ×4 ~2,5 min con 3 scene). Limiti dichiarati:
headless con GL software (14,6 e 7,2 fps); sul banco lo stacco di scena e il congelamento di lettura sono spenti; la quota del
contatto in corsa non separa appoggio e volo sul corpo di oggi (§3); la colonna «p/r» (piede/radice) della sonda non ha senso con
la radice ferma (divisione per ~0) e va letta solo in passo e corsa, dove vale 70-130% cioè il piede «a terra» viaggia col corpo.

Controlli eseguiti: `test:logic` 51/51 verde, `check-src` (ricomposto identico ai frammenti). Il gate completo non è stato
eseguito: la modifica al gioco è solo nel testimone, acceso esclusivamente da `__CPM_PIEDI_REC`/`__CPM_PIEDI451`.
