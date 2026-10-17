# Rapporto giro 45 — L1: PO-022 (un solo motore) e PO-068 (gesti)

Ramo `sviluppo/motore-gesti-022-giro45`, da `lavoro/171-base` 5eb5500 (7.999.171). `GAME_VERSION` e `SAVE_VERSION`
**non** cambiate. Zona G non toccata. Motore del possesso (`src/14`) non toccato. Nessun identificativo di modello nei file.

Condizioni delle misure: headless `/opt/pw-browsers/chromium`, `?cpmtest=1`. Le misure percettive dei gesti sono **GLB acceso**
e su **una pagina nuova per scena**: sulla stessa pagina quattro varianti del passaggio e del cross risultavano «senza clip»,
su pagina nuova la clip c'è (lezione 7.483, rimisurata qui: `pass_ground` su pagina nuova monta `shortPass:pass` per 18
fotogrammi).

| commit | voce | cosa | interruttore rosso | guardiano |
|---|---|---|---|---|
| 57dd6bb | PO-022 + PO-068 | la tecnica nominata dall'opzione vince anche su cross e dribbling | `__CPM_NO_TEC045` | `tecnica-045` (nuovo) |
| 57dd6bb | PO-068 | censimento GLB acceso delle firme dei gesti | — (sonda) | `gesti-firme-045` (nuovo, non guardiano) |

---

## 1. PO-022 — chi decide che cosa

### 1.1 La correzione: la tecnica dell'opzione non la sceglie più un secondo decisore

**Misura prima.** In `src/15-live-match.jsx` (blocco delle props del 3D, r.10405-10425) la variante che arriva al 3D nasce da
`deriveHL` (l'etichetta dell'opzione scelta), poi **`decideExecution`** — un decisore separato, seminato su testo+etichetta+
indice — la sostituiva con la sua esecuzione. Per il tiro il 7.222 aveva già stabilito «la tecnica la sceglie il giocatore,
il motore decide quanto bene riesce»; per **cross e dribbling no**. Testimone nuovo `__CPM_TEC045` (variante dell'etichetta →
variante passata al 3D), sonda `tecnica-045` sulle 45 opzioni cross/dribbling del catalogo, GLB spento:

| braccio | opzioni con tecnica nominata | cambiate dal decisore |
|---|---|---|
| rosso `__CPM_NO_TEC045` (comportamento di prima) | 24 | **21 (87,5%)** |
| verde | 21 | **0** |

Esempi dal rosso: «Cross a rientrare» → `cross_low_driven`; «Cross basso sul secondo palo» → `cross_cutback`; «Dribbling e
cross» → `cross_near_post`. Il motore non ha nemmeno la voce `double_step`: un dribbling «doppio passo» usciva come
finta/rientro/sterzata.

**Intervento** (`src/15-live-match.jsx` r.10405-10418): se l'etichetta NOMINA la tecnica (`deriveHL` non è caduta sul ripiego:
`cross_near_post` per il cross, `dribble_feint` per il dribbling, salvo che l'etichetta li nomini davvero) la variante resta
quella; `decideExecution` decide solo la qualità. Senza tecnica nominata, come prima. Tiro, rigore, punizione, testa e
passaggio invariati (già così).

**Dopo, GLB acceso** (`gesti-firme-045`, famiglia cross, pagina nuova per scena):

| variante | verde: clip dell'eroe | rosso: clip dell'eroe |
|---|---|---|
| `cross_cutback` («Cross a rientrare») | `pass` (passaggio arretrato, come dice GESTI) | `mx-strike-foward-jog~m` (rincorsa del cross) |
| `cross_far_post` («Cross basso sul secondo palo») | `mx-strike-foward-jog~m` | `pass` (diventato cutback) |
| near / low / after_dribble | rincorsa del cross | rincorsa del cross |

Guardiano `tecnica-045` verde e rosso visibile; aggiunto a `package.json`, alla mappa `src/15` di `ci-runner.mjs` e alla
catena `completa`.

⚠️ **Effetto di gioco da segnalare.** La variante decide la traiettoria del cross e la regia (es. FAR_POST). Il risultato
dell'azione non cambia (lo decide il motore, `giocaScena`/`probEroe`), ma la scena sì: da oggi il cross che il giocatore ha
scelto è quello che vede. La qualità (`_hlQuality`) resta del decisore.

### 1.2 Una misura che ha fatto ritirare una correzione

L'audit statico (vedi 1.3) proponeva due correzioni «piccole»: il 3D che ritrova l'attore della riga di cronaca dal **cognome**
invece che dall'indice del motore, e l'attore sorteggiato quando la riga del motore non ha `chi`. Le ho scritte, poi misurate
sul flusso vero (salvataggio S12, autoplay seme 7, partita intera): su **72 righe di cronaca, 1 sola** ha lanciato un arco nel
3D (`__CPM_ARCREG`). Col motore acceso il pallone lo muovono i sotto-tick e il portatore del motore (`noArc`), non la cronaca:
il percorso che quelle due correzioni toccano è quasi morto, e il loro effetto **non è misurabile**. Le ho ritirate (No Blind
Fix) prima del commit: il codice di quel percorso è come sulla base.

### 1.3 Tabella: percorso → chi decide → evidenza

Fonte: audit statico del sorgente (solo lettura, file:riga sul ramo) più le misure di questo giro dove indicate. Le righe
«statico» non le ho verificate con una sonda: le dichiaro come lettura del codice.

| # | percorso | chi decide | evidenza | stato / interruttore | verdetto |
|---|---|---|---|---|---|
| 1 | gol nel gioco fluido | **motore** | `src/15:5026` microsim solo `if(!_inHL77&&!V2L)` | `__CPM_NO_V2`, `motore-unico` | ok |
| 2 | riuscita sì/no della giocata dell'eroe | **motore** (`giocaScena`/`probEroe`, seminato) | `src/15:8949-8960` | `brain-82` | ok |
| 3 | **variante/tecnica di cross e dribbling** | era `decideExecution`, ora **l'opzione scelta** | `src/15:10417-10418`; misura 21/24 → 0/21 | `__CPM_NO_TEC045`, `tecnica-045` | **corretto in questo giro** |
| 4 | tipo d'errore su cross/dribbling/passaggio/contrasto | `decideExecution`; il motore lo registra | `src/15` blocco «FUSIONE» dopo r.10425 (statico) | nessuno | GRANDE, 6-10 h: estendere `giocaScena` a tutte le famiglie, tocca `decision-baseline`, timeline LMQP-6, `brain-82` |
| 5 | marcatore sull'assist dell'eroe, assist-man sul gol dell'eroe | scelta per hash dalla rosa, non dall'evento `gol` del motore | `src/15:~9129-9130` (statico) | nessuno | MEDIO, 1-2 h + guardiani carriera (`assistLinksRef` va nel salvataggio) |
| 6 | punto d'arrivo di palo/fuori | `Math.random` nel 3D; gol e parata invece dal motore (B3) | `src/12:~4763-4920` (statico) | `__CPM_NO_B3TIRO` | MEDIO, 3-4 h, con `outcome-not-goal` |
| 7 | rimbalzi/respinte non da parata | `Math.random` nel 3D | `src/12:~4143-4523` (statico) | — | PICCOLO ma solo grafico; da fare con `outcome-not-goal`, non fatto |
| 8 | difensore/ricevente della scena | motore se in campo entro `maxD`, altrimenti il più vicino | `src/12:3012-3023` `_castRic23`/`_castDif23` | `__CPM_NO_B4DIF`/`B4RIC` | ripiego voluto |
| 9 | portatore in `playing` | motore (`carrierRef`), poi ri-eletto per vicinanza con isteresi | `src/12` blocco portatore (statico; ordine nel fotogramma non verificato) | `__CPM_NO850` | MEDIO, 2 h; il 7.813 era già stato revocato su questo punto |
| 10 | attore della riga di cronaca nel 3D | cognome, poi vicinanza | `src/12` blocco 7.533/7.556 | `__CPM_NO546`/`NO556` | **misurato quasi morto** (1 arco su 72 righe): correzione ritirata, vedi 1.2 |
| 11 | simulazione rapida: risultato | **motore** (`simulaPartitaMotore`) | `src/10:885-890` | `__CPM_NO_SIMV2` | ok |
| 12 | simulazione rapida: **gol e assist dell'eroe** | `_pSimStats` (probabilità sui gol di squadra), non il tabellino del motore | `src/10:883-905` (letto) | nessuno | GRANDE, 3-5 h: cambia statistiche/economia di carriera, serve catena carriera |
| 13 | partite fra altri club | Poisson | `updateStandings` | — | fuori ambito (zona G) |
| 15 | **ripresa del motore dopo una scena dell'eroe** | **3D**: posizione dell'eroe resa a fine scena (dipende dal tempo di render) | `seme-a`: primo ingresso divergente #486 `chiedi.riprendi` al 17', eroe 83,7 vs 80,7; rosso anche sulla base | nessuno | **misurato** in questo giro (§3.1); MEDIO 2-4 h, bloccante (a) della prontezza |
| 14 | scene dell'eroe: dal motore o dal catalogo | motore (giro 17: 55/55) | `catalogo-022` | `__CPM_NO_SEG022` | rigiocato in questo giro, vedi §3 |

---

## 2. PO-068 — censimento dei gesti

### 2.1 Strumenti
- `gesti-motore-068` (strutturale, GLB spento): **24/26** varianti raggiunte dalle scene del motore; mai: `tackle/press`,
  `tackle/call` (clip nulla in GESTI). Invariato rispetto al giro 17.
- `gesto-vocabolario`: verde; la famiglia tiro ha 4 firme distinte di tabella (`kick|tesa · kick|— · kick|campana · volley|tesa`).
- **`gesti-firme-045` (nuovo, GLB acceso, pagina nuova per scena)**: per ogni variante di GESTI forza una scheda del catalogo
  che la produce, risolve con esito riuscito e legge per **fotogramma** la clip vera dell'eroe (`__CPM_P1B2`), poi il contatto
  e il piede in `CONTATTO_CLIP` (hook inerte `__CPM_GESTI_CLIP045`, nome clip aggiunto al testimone `__CPM_GST`).

### 2.2 Cosa manca (misurato, GLB acceso)

**Varianti con lo stesso corpo** (si distinguono solo dal volo del pallone, che il 3D disegna con profilo e ramo propri):
- tiro: `shot_chip` = `shot_curled` = `shot_first_time` = `shot_one_on_one` = `shot_power` → tutti `mx-strike-foward-jog~m`
  (la rincorsa del 7.999.34). Il colpo «di prima» ha la rincorsa come il tiro di potenza: la posa «senza caricamento»
  (`src/12` r.~8000) è procedurale e sotto il personaggio non si vede. La volée acrobatica monta `mx-scissor-kick`.
- testa: `header/base` = `header_diving` = `header_far_post` → tutte la clip `header`.
- cross: near / low_driven / after_dribble / far_post → rincorsa del cross; solo `cross_cutback` ora si distingue (§1.1).
- passaggio: `pass_ground` e `one_two` → `shortPass:pass`; `pass_lofted` → rincorsa; `pass/base` → `pass`.
- dribbling: inside/outside/double_step → tutte `change-direction` (decisione PO 06/10: niente clip di doppio passo).

**Gesti senza contatto/piede.** Tutte le clip che calciano viste in scena hanno la riga in `CONTATTO_CLIP` (rincorsa u 0,38
sx, scissor u 0,29 dx, pass u 0,96 sx, kick). Le colonne `contactAt`/`foot` per **variante** non esistono in GESTI: il
contatto vive per **clip**, quindi varianti con la stessa clip hanno per costruzione lo stesso istante e lo stesso piede.

**Nessuna clip montata nelle scene forzate:** `penalty/base`, `penalty_panenka`, `freekick/base` (già dichiarato nel
commento di `CONTATTO_CLIP`: le scene forzate non montano il gesto del piazzato), `tackle/press`, `tackle/call` (clip nulla
per scelta: locomozione).

### 2.3 Cosa ho completato e cosa no
- **Fatto:** la variante che il giocatore sceglie arriva davvero al corpo (§1.1) — il primo passo per avere varianti
  distinguibili è che la variante scelta non venga sostituita.
- **Non fatto, con stima:**
  - clip distinte per tiro di prima / piazzato / a giro: servono clip (procurarle è PO-070). Togliere la rincorsa al solo
    tiro di prima (`_tiro34Arma`, `src/12` r.~2902) è tecnicamente 1 h, ma riporterebbe il «kick da fermo» che il PO ha
    bocciato nel 7.999.34 («il tiro non viene caricato»), cioè il rosso di `tiro-caricato`: **decisione PO**, non fatta.
  - varianti della testa: c'è già `mx-header-stand` (`_gHead145`) usata per altro; assegnarla a una variante è 1 h + misura
    del contatto testa-pallone (il difetto #64/#126 del giro 17 è ancora aperto).
  - colonne `contactAt`/`foot` per variante in GESTI: inutili finché le varianti condividono la clip; vanno con le clip nuove.
  - P2/P3 (protezione col corpo, reazioni al gol dei compagni, barriera dell'eroe, infortunio in scena): non toccati.
  - `tackle/press`/`call`: clip nulla per decisione (gi146); restano.

---

## 3. Rituali

Build `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs` (allineato a HEAD). Catena **`mirata`**
(`node ci-runner.mjs mirata`: file toccati `src/12`, `src/15` → 48 passi) sul build esatto 57dd6bb.

**Interruzione:** la prima corsa (00:13) è stata uccisa dal **riavvio del container** alle ~01:40, dopo 17 passi. Ho rifatto
solo i mancanti sullo stesso build (regola PO 14/10, `CPM_CI_FATTI` dell'esecutore, che lo registra come giro composto).

**Stato alla consegna (05:31 UTC): 43 passi giudicati su 48, 5 non finiti.** Arrivati dopo: `ingresso-camminata-245` ✅, `tabellino-228` ✅. Dopo la prima stesura sono arrivati
`giornale-244` ✅ e `difesa-220-scena` ⚠️ instabile (rosso alla prima prova nel braccio rosso, verde alla seconda; 3.334 s).
- **38 verdi**, fra cui `validate-situations` 14/14, `partita-vera`, `career-critical`, `catalogo-022`, `esiti-218`,
  `cross-218` (i due più vicini alla modifica sui cross), `scene-221`, `goal-postarc`, `gk-dive-sync`, `tecnica-045`.
  `pressing-143` **instabile** (rosso alla prima prova nel braccio rosso, verde alla seconda).
- **1 rosso: `difesa-252`**, identico sulla base (§3.1), non attribuibile.
- **Non finiti:** `intervista-231`, `interazioni-226`, `schede-234`, `schede-246`, `schede-259`.
  **Non posso dichiararli verdi.** Per il rilascio vanno fatti girare prima della promozione; la catena per il ramo resta
  **incompleta** e `STABILITA.json` non è stato scritto (l'esecutore scrive a fine catena).

**Guardiani richiesti fuori dalla mappa, sullo stesso build:**

| guardiano | esito |
|---|---|
| `gesti-motore-068` | ✅ verde 24/26; rosso visibile 18 < 24 |
| `gesto-vocabolario` | ✅ verde |
| `replay` | ✅ PASS, 8 highlight |
| `scena-motore-147` | ✅ verde (14 scene generate, rosso 0) |
| `catalogo-022` | ✅ verde (nella catena) |
| `validate-situations` | ✅ 14/14 (nella catena, 740 s) |
| `partita-vera` | ✅ verde (nella catena) |
| `tecnica-045` (nuovo) | ✅ verde e rosso visibile (anche nella catena) |
| **`seme-a`** | ❌ **rosso — anche sulla base 5eb5500**, vedi sotto |

### 3.1 Due rossi non attribuibili al ramo (misurati sulla base)

Worktree della base `lavoro/171-base` 5eb5500, stessi `node_modules`, stesso browser:

- **`difesa-252`**: sul ramo rosso due volte (verde 0/4, **rosso 0/4**: il braccio rosso non riproduce più il difetto); sulla
  base **identico** (verde 0/4 · rosso 0/4). Il guardiano tocca solo scene difensive (tackle), che questo giro non modifica.
  È il guardiano a non vedere più il suo rosso: va riparato da chi lo possiede (giro 22).
- **`seme-a` — bloccante (a) della prontezza, da segnalare al PO.** Tre giri della stessa partita (S12, autoplay seminato):

  | build | giro 0 | giro 1 | giro 2 | primo ingresso divergente |
  |---|---|---|---|---|
  | ramo 57dd6bb | 0-1 | 0-1 | 2-1 | #486 al 17' |
  | base 5eb5500 | 2-2 | 2-1 | 0-1 | #486 al 17' (giri 1 e 2) |

  Stesso punto di rottura in entrambi: `chiedi.riprendi` alla fine di una scena, con la **posizione dell'eroe vista nel 3D**
  diversa fra i giri (83,7 contro 80,7) — il motore riparte da dove la scena ha lasciato l'eroe, e quella posizione dipende dal
  tempo di render (headless). È un difetto PO-022 vero e proprio (il 3D che decide un ingresso del motore), **pre-esistente**,
  non introdotto da questo giro. Stima: 2-4 h (consegnare al motore la posizione logica di fine scena invece di quella resa,
  oppure quantizzarla), da fare con `seme-a`, `ripresa-202`, `partita-rigiocata-194`. Non fatto: fuori dalla consegna.

Nessun bump di versione, nessuna promozione su `main`, nessuna riga di roadmap: ramo di sviluppo, come chiesto.
