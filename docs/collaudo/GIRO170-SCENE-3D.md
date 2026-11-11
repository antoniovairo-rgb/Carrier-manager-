# Giro 170 — Tutte le scene 3D: inventario, foto, difetti, piano (PO-367)

**Solo misura e proposte.** Nessuna modifica a `src/`, `GAME_VERSION` non toccata. Base: ramo `lavoro/191` (commit `b58d70e`). Ramo di lavoro: `collaudo/giro170-scene-3d`.
Le scelte restano al PO: qui ci sono i fatti, le proposte e i rischi.

Legenda delle etichette usate in tutto il documento:
**[MISURATO]** = numero o foto prodotti in questo giro · **[LETTO]** = letto nel codice, con file e riga · **[STIMA]** = valutazione mia, non verificata · **[NON CONFERMATO]** = non ho potuto verificarlo.

---

## 1. Tabella per il PO

| # | Scena | Quando la vedi | Cosa migliorare (in una riga) | Impatto per chi gioca | Costo |
|---|---|---|---|---|---|
| 1 | **Azioni salienti** (tiro, cross, testa, rigore, punizione, passaggio, dribbling, difesa) | 2-6 volte a partita | Sul telefono il tuo calciatore è piccolo (5-10% dell'altezza dello schermo) e metà schermo è prato vuoto o coperto dal pannello delle scelte | **Alto** | 2 giri |
| 2 | **Esultanza dopo il gol** | a ogni tuo gol in azione | L'eroe esulta di spalle e un avversario gli passa davanti e lo copre | **Alto** | 1 giro |
| 3 | **Intro** (il filmato iniziale) | una volta, è la prima impressione | Sul telefono l'eroe esce dall'inquadratura proprio mentre esulta; bandiere grigie, tifo a quadratini | **Alto** (prima impressione) | 1 giro |
| 4 | **Ingresso in campo** | ogni partita (si può saltare) | Bella l'uscita dal tunnel; poi campi lunghissimi con 22 figurine minuscole | Medio-alto | 1 giro |
| 5 | **Premiazione con la coppa** | solo quando vinci un trofeo | Cartello tagliato sul telefono, un'inquadratura sbagliata su PC, la coppa alzata sembra un piatto, eroe piccolo | Medio (rara ma è il momento più bello) | 1-2 giri |
| 6 | **Colori diversi fra le scene** | sempre | Lo stesso club ha colori diversi in partita, presentazione, parata: tre «sviluppi» del colore diversi | Medio | 1 giro |
| 7 | **Galà dei premi** | una volta a stagione | Camera sempre ferma, palco piccolo in mezzo a tanto buio | Medio | 1 giro |
| 8 | **Serata di presentazione** | una volta a stagione | I primi due momenti: giocatori minuscoli e una tettoia scura in primo piano; dal terzo in poi è buona | Medio-basso | 1 giro |
| 9 | **Parata sul pullman** | solo con scudetto o coppa europea | È la scena più povera: pullman «bruciato» giallo piatto, piedi dentro il tetto, folla quasi invisibile sul telefono | Medio-basso (rarissima) | 1-2 giri |
| 10 | **Partite di notte** | circa una partita su tre **[STIMA]** | Di notte il campo è luminoso quanto di giorno: la notte non si sente | Da decidere (tocca una scelta recente del PO) | 1 giro |
| 11 | **Festa di fine partita** | dopo una grande vittoria | Già buona (primo piano dell'eroe). Solo il primo istante parte su un altro giocatore | Basso | con la 5 |
| 12 | **Subentro dalla panchina** | quando parti dalla panchina | Buona (camera vicina). La panchina 3D «in attesa» invece non si vede mai: è sotto il campo 2D | Basso | pulizia |

Ordine consigliato e piano in giri: capitolo 6. Cose da non toccare: capitolo 7.

---

## 2. Metodo e limiti (da leggere prima dei numeri)

- **Sonde nuove** (solo `tests/visual/`, nessun file di gioco): `giro170-lib.mjs`, `giro170-partita.mjs`, `giro170-fuori.mjs`, `giro170-fogli.mjs`. Riusano i ganci di collaudo esistenti (`__CPM_FORCE_SIT`, `__CPM_RESOLVE`, `__CPM_FORCE_OUTCOME`, `__CPM_FORCE_CEREMONY` + `__CPM_CERT_SET` + `__CPM_CER_HOLD`, `__CPM_BENCH_MIN` + `__CPM_FORCE_BENCH`, `__CPM_CAREER.apriPresentazione/apriGala/playMatch`, evento `cpm-replay-intro`, componente `__CPM_PARATA198_C`).
- **Corpi veri accesi** (`__CPM_GLB=true`) e teatro attivo (`__CPM_PRESENT=1`), come da direttiva PO del 29/07. Partita sul **percorso vero**: salvataggio `fixtures/save-190-s12-ovr93.json` → partita di campionato → ingresso in campo. Una pagina nuova per gruppo di scene (lezione 7.483).
- **Formati**: telefono 375×812 e PC 1440×900, scala 2. Foto in `docs/collaudo/giro170/` (228 foto + 17 fogli-provini in `fogli/`), salvate in JPEG per non appesantire il repository (48 MB invece di 287).
- **Un browser alla volta**, `free -m` e `df -h` prima di ogni lancio.
- **Contatore universale** (`CONTA170` in `giro170-lib.mjs`): avvolge `THREE.WebGLRenderer` prima che il gioco lo usi, così ogni scena dichiara draw call, triangoli, pixelRatio, ombre, luci, e il tempo di calcolo speso nei callback di `requestAnimationFrame`.

**Limiti dichiarati**

1. **Gli fps misurati qui NON sono gli fps del telefono.** Il browser di collaudo disegna in software (SwiftShader): 1-12 fps. Valgono solo per confrontare le scene fra loro. Sono indipendenti dal dispositivo: draw call, triangoli, pixelRatio, numero di luci. Il «tempo di calcolo per fotogramma» è la parte CPU misurata **su questo server**: un telefono medio è più lento **[STIMA: 2-4 volte]**.
2. In headless il tempo di scena scorre più lento del reale (tetto `dt` 0,05, 12:3755 **[LETTO]**): le foto «gesto» su PC (≈1 fps) possono cadere prima o dopo l'istante del gesto. I **tempi** non sono giudicati in questo giro.
3. **Fluidità, scatti, piedi che scivolano: NON CONFERMATO.** Servono video o il telefono; dalle foto non si vedono.
4. **Serie dei rigori: non fotografata** (serve una partita di coppa pareggiata; gancio `__CPM_SO_FORCE`, 15:3130). Resta da fare.
5. **Azioni salienti**: fotografata 1 situazione per famiglia (9 famiglie + tiro fallito) su 191. Le conclusioni sull'inquadratura sono coerenti col censimento esistente (`hero-framing`: mediana 0,140 dopo il 7.509), ma il campione fotografico è piccolo.
6. Le scritte «GOOOOL!» / «ASSIST!» visibili all'apertura di alcune scene (`azione-header-tel-1-scelta`, `azione-dribble-tel-1-scelta`) sono con ogni probabilità un **artefatto della sonda** (scene forzate una dietro l'altra a 6 secondi): **non giudicato**.

---

## 3. Inventario delle scene 3D

Renderer three.js trovati in tutto `src/`: **6** **[LETTO]** — `src/12:549` (partita), `src/16:365` (intervista), `src/16:1178` (presentazione), `src/16:1609` (parata), `src/16:2027` (galà), `src/19:274` (intro), `src/01:719` (visore giocatore). `src/10`, `src/17`, `src/18` non usano three.js; `src/13` solo per la texture delle maglie.

### 3.1 Scene dentro la partita (un solo renderer, `src/12`)

| Scena | Dove nasce | Quando / quanto spesso | Modelli e animazioni | Guardiani |
|---|---|---|---|---|
| **Ingresso in campo** | fase `walkout`; 12:6697-6760 (tunnel, camminata), camera 12:9916-9965 | ogni partita di carriera non di provino: **1 a partita**, ~16 s, saltabile **[LETTO]** → ~38 a stagione più coppe **[STIMA]** | 22 corpi CGTrader + bambini + arbitro; tunnel `_tun46` (11:1728) | `ingresso-245/276/277/285`, `ingresso-camminata-245`, `walkout-fermi-197`, `ingresso-59` |
| **Gioco fluido** | fase `playing` | tutta la partita, **ma il giocatore vede il Campo 2D**: il 3D è sospeso (15:11246, 12:3735-3740) **[LETTO]**; sul telefono **[MISURATO]** (foto `gioco-tel-*`) | — | `partita2d-151`, `gol-eroe-154` |
| **Azioni salienti** | fasi `hl_intro/hl_choose/hl_move/hl_result`; regia 12:10249-11470, quadro eroe 12:12495 | **2-6 a partita** più i seguiti (15:1803-1818) **[LETTO]** → ordine di 150-250 a stagione **[STIMA]** | eroe + portiere + i 3 più vicini al pallone (12:11603-11625); clip dalla tabella `GESTI` (12:3352) | `hero-framing`, `framing-guard`, `hero-in-frame`, `apertura-261`, `scena3d-96`, `portiere-252`, `spalle-146`, `rigore-*`, `punizione-62`, `angolo-117` |
| **Esultanza** | 12:9098-9182; piano da `buildCelebPlan` (15:2690) | a ogni gol/assist dell'eroe in azione; quante a partita **non confermabile dal codice** | clip `lift` + `cgtrader-clip-po/po2` | `esultanza-152`, `esultanza-braccia`, `celebration`, `celebration-visible`, `setpiece-celebration` |
| **Panchina / subentro** | 15:2275-2287; camera 12:10359-10383 | solo se parti dalla panchina o vieni sostituito: **non confermabile dal codice** | corpi panchina `korward-regular-player.glb` | `panchina-127/293/riga/glb` |
| **Premiazione** | fase `ceremony`; 12:9191-9420, camera per beat 12:10384-10392 | solo vincendo un trofeo (finale o campionato): poche volte a carriera | squadra intera + mister `actor-presenter.glb`; coppa procedurale 12:3032-3042 | `premiazione-132`, `premiazione-palco-191`, `palco-corpi-191`, `foto-premiazione-47`, `ceremony-shot` |
| **Festa di fine partita** | stessa fase, versione leggera (15:2451-2497) | vittoria importante o prestazione super (15:2474-2478) | come sopra, senza coppa | `festa-3d`, `festa-942`, `festa-57/79` |
| **Serie dei rigori** | fase `shootout`; 12:9763-9769 | solo eliminazione diretta finita pari | rigorista + portiere | `rigori-58`, `rigori-190` — **non fotografata** |

Impianto comune **[LETTO]**: pixelRatio tetto 2 su PC e 1,5 su telefono (12:555); ombre vere solo su PC (mappa 2048), sul telefono mappa 512 e i giocatori hanno un disco finto sotto i piedi (12:1273-1285); tone mapping ACES + uscita sRGB; nessun post-processing; nessun tetto agli fps; replay disattivato per direttiva PO (12:9886).

### 3.2 Scene fuori partita (renderer propri)

| Scena | Dove nasce | Montata oggi? | Quando / quanto spesso | Modelli | Guardiani |
|---|---|---|---|---|---|
| **Intro** | `src/19:221`, renderer :274 | **Sì** | dopo la creazione del giocatore, **una volta per dispositivo**; «Rivedi l'intro» da Home e Profilo; ~20 s, saltabile | eroe + portiere CGTrader; stadio procedurale proprio | `intro-118`, `flussi-115`, `spalle-146` |
| **Serata di presentazione** | `src/16:1168` | **Sì** (con targhetta 2D sopra) | settimana 1 di ogni stagione, **al massimo 1 a stagione**, saltabile (18:1034) | fino a 7 corpi CGTrader + `buildStadium` | `presentazione-200`, `presentazione-142`, `spalle-146`, `wave-arm-geometry`, `wave-pose-sweep` |
| **Galà dei premi** | `src/16:2021` | **Sì** (presentatori 3D, nessun eroe sul palco) | fine stagione, **1 a stagione** | `actor-presenter.glb` + `actor-presenter-f.glb`, trofeo procedurale | `gala-3d`, `busta-199`, `scene-fuori-137`, `piccoli-85` |
| **Parata sul pullman** | `src/16:1588` (da `ParataCompleta198`) | **Sì** | fine stagione **solo** con scudetto o coppa europea (16:2827) | 8 corpi CGTrader, pullman e città procedurali | `parata-198`, `parata`, `parata-shot`, `scene-fuori-137` |
| **Intervista 3D** | `src/16:360` | **No**: solo col rosso `__CPM_NO963`; il giocatore vede la sala 2D | — | — | `intervista` (pretende 0 canvas) |
| **Visore giocatore 3D** | `src/01:702` | **No**: nessun chiamante, codice morto | — | — | nessuno |

Nessuna delle scene fuori partita ha ombre vere, né uscita sRGB (**[LETTO]** e **[MISURATO]**, vedi 4).

---

## 4. Misure

Metodo: `window.__misura170(ms)` (in `giro170-lib.mjs`) conta per 2-4 secondi; i valori di draw call e triangoli sono quelli dell'ultimo fotogramma disegnato (`renderer.info.render`). Dati grezzi: `giro170/misure-partita.json`, `giro170/misure-fuori.json`. Le righe «ingresso tel» e «gioco tel» vengono dal registro della corsa (il file era stato azzerato per un mio errore di sonda, poi corretto).

| Scena | Formato | Draw call | Triangoli | pixelRatio | Ombre | Luci | Sviluppo colore | Calcolo per fotogramma (server) | fps headless |
|---|---|---|---|---|---|---|---|---|---|
| Ingresso in campo | tel | **496** | **313.203** | 1,5 | sì | 14 | ACES + sRGB | n.d. | 1,9 |
| Ingresso in campo | PC | **520** | **313.453** | 2 | sì | 14 | ACES + sRGB | 28,6 ms | 0,7 |
| Azione (scelta) | tel | 172 | 81.991 | 1,5 | sì | 14 | ACES + sRGB | 19,1 ms | 3,5 |
| Azione (scelta) | PC | 312 | 83.824 | 2 | sì | 14 | ACES + sRGB | 20,0 ms | 0,9 |
| Esultanza | tel | 173 | 82.399 | 1,5 | sì | 14 | ACES + sRGB | 15,7 ms | 3,7 |
| Esultanza | PC | 222 | 82.921 | 2 | sì | 14 | ACES + sRGB | 13,3 ms | 1,2 |
| Subentro | tel | 140 | 130.111 | 1,5 | sì | 14 | ACES + sRGB | 17,4 ms | 3,5 |
| Premiazione (alzata) | tel | 231 | 129.184 | 1,5 | sì | 14 | ACES + sRGB | n.d. | 2,9 |
| Premiazione (alzata) | PC | 370 | 163.820 | 2 | sì | 14 | ACES + sRGB | 30,0 ms | 0,8 |
| Festa | tel | 185 | 103.118 | 1,5 | sì | 14 | ACES + sRGB | n.d. | 3,3 |
| Intro | tel | 62 | 25.494 | 1,6 | no | 5 | ACES, **senza sRGB** | 3,9 ms | 10,8 |
| Presentazione | tel | 101 | 101.128 | 1,6 | no | 11 | **nessuno** | 5,0 ms | 3,6 |
| Galà | tel | 40 | 19.212 | 1,6 | no | 6 | ACES, **senza sRGB** | 1,1 ms | 11,8 |
| Parata | tel | 117 | 100.126 | **2** | no | 7 | **nessuno** | 6,9 ms | 5,1 |
| Parata | PC | 159 | 101.484 | **2** (2880×1800) | no | 7 | **nessuno** | 8,8 ms | 3,3 |

Cosa dicono i numeri **[MISURATO]**:

- **L'ingresso in campo è la scena più pesante del gioco**: quasi 4 volte i triangoli e 3 volte le draw call di un'azione saliente. Se sul telefono c'è una scena che rallenta, è questa la prima candidata **[STIMA: non misurato sul dispositivo]**.
- In partita ci sono **14 luci** in scena e **749 oggetti con scheletro** presenti (non tutti disegnati).
- La parte CPU di un fotogramma di partita vale **13-30 ms su questo server**. Per 60 fps servono meno di 16,7 ms in tutto: su un telefono la sola parte CPU lascia poco margine **[STIMA]**.
- La parata è l'unica scena con pixelRatio fino a 2 (le altre fuori partita hanno il tetto a 1,6): su un telefono a densità 3 disegna più pixel di tutte le altre (16:1609 **[LETTO]**).
- **Tre sviluppi del colore diversi**: partita (ACES + sRGB), intro e galà (ACES senza sRGB), presentazione e parata (nessuno). È la causa misurata del difetto 6.

**Altezza dell'eroe nel quadro** (testimone del gioco `__CPM_FRAME480`, frazione dell'altezza dell'immagine) **[MISURATO]**: telefono, valore corrente nelle azioni 0,07-0,10 (minimo 0,047); PC 0,048-0,06 (minimo 0,044). Riferimento del repo: un piano americano televisivo sta a 0,35-0,60.

**Luminosità giorno/notte** **[MISURATO]** (luminanza media della fascia di gioco, stessa scena, stesso fotogramma):

| Foto | Giorno | Notte |
|---|---|---|
| tiro, scelta | 0,424 | 0,442 |
| difesa, esito | 0,384 | 0,439 |
| cross, gesto | 0,379 | 0,408 |

Di notte la fascia di gioco è **uguale o più luminosa** che di giorno.

---

## 5. Difetti e proposte, scena per scena

Priorità = impatto per chi gioca diviso costo. Costo in giri. «Rischio» = quali correzioni recenti si possono disfare.

### D1 — Azioni salienti: eroe piccolo, metà schermo vuota (telefono) — PRIORITÀ 1

- **Cosa si vede** **[MISURATO]**: `fogli/tel-tiro-esultanza.jpg`, `fogli/tel-piazzati-testa-cross.jpg`, `fogli/tel-pass-dribbling-difesa.jpg`. In verticale il terzo alto è tribuna, i giocatori stanno in una fascia centrale stretta, e sotto c'è il pannello delle scelte (≈40% dello schermo in `hl_choose`) oppure prato vuoto (`azione-penalty-tel-3-esito`, `azione-pass-tel-2-gesto`). Altezza eroe 0,07-0,10. Nella prima foto di prova l'eroe era per metà sotto il pannello.
- **Controprova**: quando la camera è vicina la scena è molto più bella — `subentro-tel-3`, `azione-cross-tel-3-esito`, `festa-tel-2-meta`.
- **Causa probabile**: la taglia chiesta è 0,18 (12:10510 **[LETTO]**) e il percorso reale ne rende ~0,75 (CLAUDE.md, 7.509); la mira non tiene conto che in verticale la parte bassa è occupata dal pannello **[STIMA]**.
- **Proposta**: (a) in verticale spostare la **mira** così che l'eroe cada nel terzo libero sopra il pannello, senza cambiare la distanza; (b) stringere **solo nella finestra del gesto** (`hl_result`, 1-2 secondi), poi riaprire; (c) abbassare l'orizzonte per togliere tribuna dal quadro.
- **Rischio alto**: la taglia 0,24 è già stata **bocciata dal PO sul telefono** («zoom troppo stretto», 7.509) e stringere senza sistemare la mira ha già **raddoppiato il fuori quadro** (7,8% → 19,3%, 7.482). Guardiani da tenere verdi: `framing-guard`, `hero-in-frame`, `hero-framing`. Si decide con provini a taglia (`framing-choices`), mai con un moltiplicatore.
- **Costo**: 2 giri (uno di provini per la scelta del PO, uno di realizzazione).

### D2 — Esultanza: eroe di spalle e coperto — PRIORITÀ 2

- **Cosa si vede** **[MISURATO, 2 corse su 2, giorno e notte]**: `esultanza-tel-3.jpg`, `esultanza-night-tel-3.jpg`. L'eroe esulta verso la curva, quindi di spalle; un difensore avversario in primo piano gli copre mezza figura; le targhette «1 CARR», «77 VAIRO», «4 MARSHALL» si accavallano. Metà schermo è prato. Su PC (`esultanza-pc-*`) l'eroe è piccolo sullo sfondo.
- **Causa probabile** **[STIMA, il ramo di camera dell'esultanza non è stato letto riga per riga]**: la camera resta dietro la corsa dell'eroe (blocco 12:9098-9182) e gli avversari restano disegnati e fermi nell'area.
- **Proposta**: stacco su una camera **frontale** (fra l'eroe e la curva, bassa); avversari nascosti o allontanati dal cono camera-eroe; targhette spente durante l'esultanza.
- **Rischio**: giro 152 (braccia al cielo solo a eroe fermo, 12:9145-9158), 7.373 (col gol del compagno esulta il marcatore), regola degli stacchi neri 7.471. Guardiani: `esultanza-152`, `celebration-visible`.
- **Costo**: 1 giro.

### D3 — Intro: eroe fuori quadro sul telefono — PRIORITÀ 3

- **Cosa si vede** **[MISURATO]**: `intro-tel-6-esulta.jpg` (dell'eroe si vede un braccio al bordo sinistro), `intro-tel-7-chiusura.jpg` (nessun giocatore, solo il cartellone). Su PC l'eroe c'è (`intro-pc-6`, `-7`). In più: bandiere grigie senza colore, tifo a quadratini, apertura con il 60% dello schermo occupato da una superficie blu vuota (`intro-tel-1-apertura`).
- **Causa** **[LETTO + calcolato]**: da 11,4 s la camera sta a (eroe.x+3,4 · eroe.z+6,4) e guarda 5 unità **oltre** l'eroe (19:597). L'eroe finisce a 11,4° dall'asse; in verticale il semi-campo orizzontale è 12,1° (ottica 50°, formato 375×812). Sta sul bordo per costruzione. Il tifo è `PointsMaterial` (19:323-338).
- **Proposta**: in verticale mirare all'eroe (non oltre) e allargare l'ottica come già fa il galà (16:2033-2039); dare un colore di club alle bandiere; alzare l'orizzonte nell'apertura.
- **Rischio**: giro 115 (sette correzioni, 19:222-232), giro 118 (portiere che non vola, 19:532-537), 7.53.3 (camera-gol). Guardiani: `intro-118`, `flussi-115`, `spalle-146`.
- **Costo**: 1 giro. Vale più del suo costo perché è la prima cosa che vede un giocatore nuovo.

### D4 — Ingresso in campo: campi troppo lunghi — PRIORITÀ 4

- **Cosa si vede** **[MISURATO]**: `fogli/tel-ingresso-1.jpg`, `fogli/tel-ingresso-2.jpg`. Le foto 02-04 (uscita dal tunnel, corpi grandi, maglie leggibili) sono le migliori di tutto il gioco. Dalla 05 alla 09 i 22 sono figurine in un angolo di un grande prato vuoto. La fila finale (10-17) è ordinata ma lontana, e resta quasi identica per ~5 secondi di scena.
- **Causa** **[LETTO]**: orbita a 360° lunga 12 s dopo il tunnel (12:9916-9965).
- **Proposta**: tenere più a lungo il taglio ravvicinato all'uscita; sostituire parte dell'orbita con una carrellata bassa lungo la fila; chiudere con un primo piano dell'eroe.
- **Rischio**: PO-245 (passo ≤ 2,3, non si corre), PO-285 (durata ~16 s con stacchi), PO-276 (sguardo sulla colonna), PO-236 (tutti disegnati). Guardiani `ingresso-*`.
- **Costo**: 1 giro. Attenzione al peso: è la scena più cara (capitolo 4); un primo piano costa meno triangoli di un campo lungo solo se i lontani scendono di dettaglio **[STIMA]**.

### D5 — Premiazione — PRIORITÀ 5

- **Cosa si vede** **[MISURATO]**:
  - `premiazione-tel-1-present.jpg`: il cartello riempie lo schermo ed è tagliato («CAMPIONI PREMI…»).
  - `premiazione-pc-2-captain.jpg`: su PC la camera è a ridosso del cartello e del palco, i giocatori non si vedono.
  - `premiazione-tel-4-lift.jpg`: la coppa alzata si legge come un **disco dorato**; l'eroe guarda in basso; i compagni dietro sono tutti nella stessa posa a braccia larghe e il palco ne copre le gambe; il terzo basso dello schermo è il fianco del palco.
- **Causa**: camera per beat a 12:10384-10392 non adattata al formato **[STIMA]**; la coppa è un cilindro semplice con due manici (12:3035-3042 **[LETTO]**): vista dal basso mostra la bocca tonda.
- **Proposta**: inquadrature per formato (verticale e largo); coppa con profilo a calice più alto e stretto; compagni con pose sfalsate; primo piano sull'alzata.
- **Rischio**: 7.5.1 (coppa proporzionata, era enorme), giro 191 (posa sul palco, «vola sopra il palco»), giro 146b (alzata senza spalle alle orecchie), 7.426/7.429. Guardiani: `premiazione-132`, `premiazione-palco-191`, `palco-corpi-191`, `spalle-146`.
- **Costo**: 1-2 giri.

### D6 — Colore non coerente fra le scene — PRIORITÀ 6

- **Cosa si vede** **[MISURATO]**: prato verde scuro in partita, verde lime molto saturo in presentazione (`presentazione-tel-b2-b.jpg`), giallo del pullman senza ombreggiatura in parata (`parata-tel-3-alta.jpg`).
- **Causa** **[MISURATO sui renderer + LETTO]**: tabella del capitolo 4. In `src/19:278` il commento promette «ACES + uscita sRGB» ma il codice imposta solo il tone mapping.
- **Proposta**: una sola funzione di «sviluppo» condivisa dalle cinque scene vive.
- **Rischio**: cambia l'aspetto di **tutte** le scene fuori partita in un colpo: vanno rifotografate presentazione (giri 142/144), galà e parata (PO-137), intro (luci del 23/09). Va fatto con foto prima/dopo a ora congelata (invariante 7.539).
- **Costo**: 1 giro.

### D7 — Galà dei premi — PRIORITÀ 7

- **Cosa si vede** **[MISURATO]**: `fogli/tel-intro-gala.jpg`, `fogli/pc-intro-gala-parata.jpg`. Sei foto quasi identiche: la camera non si muove mai; i presentatori sono piccoli (≈9% dell'altezza **[STIMA a occhio]**); la metà alta è buio con coni di luce. Su PC il palco è ancora più piccolo in mezzo al nero.
- **Causa** **[LETTO]**: un'unica camera (16:2033-2039); i beat cambiano solo la busta (16:2358-2364).
- **Proposta**: uno stacco per svelamento (primo piano della busta, poi del trofeo), platea in penombra per riempire.
- **Rischio**: PO-137 (ottica e flash), 7.999.52 (niente eroe sul palco), 7.328 (presentatori fuori dal podio), PO-199/201. Guardiani: `gala-3d`, `busta-199`, `scene-fuori-137`.
- **Costo**: 1 giro. È la scena più leggera del gioco (40 draw call): c'è margine.

### D8 — Serata di presentazione, primi due momenti — PRIORITÀ 8

- **Cosa si vede** **[MISURATO]**: `presentazione-tel-b0-a.jpg`, `-b1-a.jpg`: giocatori minuscoli nel cerchio di centrocampo e una tettoia grigio scuro che occupa il 20% basso. Dal terzo momento in poi (`-b2-b`, `-b4-b`, `-b7-b`) è una delle scene meglio riuscite: corpo grande, saluto leggibile, tribuna piena.
- **Causa** **[LETTO]**: panoramica orbitale al beat 0 e «la fila» al beat 1 (16:1506-1507).
- **Proposta**: abbassare e avvicinare le prime due camere; togliere la tettoia dal primo piano.
- **Rischio alto per quantità di correzioni recenti**: giro 142/142b (postura, aspetti), giro 144 (saluto, camera del chiamato 16:1508), giro 146/146b (spalle, 16:1367-1368). Proposta di toccare **solo** le due camere dei beat 0 e 1. Guardiani: `presentazione-142`, `presentazione-200`, `spalle-146`, `wave-arm-geometry`.
- **Costo**: 1 giro (mezzo se abbinato al D7).

### D9 — Parata sul pullman — PRIORITÀ 9

- **Cosa si vede** **[MISURATO]**: `parata-tel-3-alta.jpg`: metà schermo è il muso del pullman in tinte piatte; il giallo è «bruciato» (nessuna ombreggiatura); le gambe dell'eroe al centro sono tagliate a metà stinco dal tetto; la folla è una striscia sottile ai bordi; il cielo è un fondo piatto con quadratini. Su PC (`parata-pc-*`) la composizione regge meglio perché il formato è largo.
- **Causa**: nessun tone mapping e quattro luci che si sommano (0,42 + 0,7 + 0,9 + 1,05; 16:1621-1625 **[LETTO]**); tre camere pensate in orizzontale (16:1913-1924); quota dei piedi sul tetto **[NON CONFERMATO: visto in foto, non misurato sulle ossa]**.
- **Altri rilievi [LETTO]**: unico renderer senza `try/catch` e senza rispetto di «riduci animazioni» (16:1607-1609); pixelRatio fino a 2; una texture clonata per palazzo (16:1649).
- **Rischio**: 7.469 (verso di marcia), 7.474 (scritta non tagliata), 7.996 (coppa per i manici), PO-137 (folla più alta), 7.429 («scatola di scarpe»). Guardiani: `parata-198`, `parata`, `scene-fuori-137`.
- **Costo**: 1-2 giri. Priorità bassa solo perché si vede rarissimamente.

### D10 — La notte non si sente — DECISIONE PO

- **Cosa si vede** **[MISURATO]**: `fogli/tel-notte.jpg` accanto a `fogli/tel-tiro-esultanza.jpg`: stesse scene, stessa luce. Tabella del capitolo 4.
- **Causa** **[LETTO in CLAUDE.md]**: la 7.539 ha alzato la luce di notte (+25/+40%) per la nota «colori slavati».
- **Proposta, senza scurire il campo**: l'atmosfera si dà con ciò che sta **attorno** — aloni dei fari, cielo, quattro ombre incrociate sotto i giocatori (i fari), vignettatura leggera. Nelle inquadrature strette il cielo non entra, quindi oggi nulla dice «notte».
- **Rischio**: disfare la 7.539. Va misurato con i tre numeri (saturazione, luminosità, contrasto) a ora congelata, `npm run colori`.
- **Costo**: 1 giro, solo se il PO lo vuole.

### Rilievi minori

- **D11 — Targhette dei nomi accavallate** nelle azioni in area (`azione-shot-tel-1-scelta`, `esultanza-tel-3`) **[MISURATO]**. Esiste già la correzione D10 del giro 96a: si tratta di rifinirla. Va con D1/D2.
- **D12 — Festa**: buona. Il primo fotogramma parte su un altro giocatore col mister tagliato al bordo (`festa-tel-1-inizio`) **[MISURATO]**. Va con D5.
- **D13 — Panchina 3D «in attesa» e «riscaldamento»**: in fase `playing` sono sotto il Campo 2D e **non si vedono** (`panchina-tel-1-attesa`, `subentro-tel-0-panchina-attesa`) **[MISURATO]**. Si vede solo il subentro, che è buono. Codice vivo ma invisibile: candidato a pulizia oppure a un breve stacco 3D. Decisione PO.
- **D14 — Codice 3D morto** **[LETTO]**: `Player3DViewer` (01:702, nessun chiamante) e `InterviewStage3D` (16:360, solo col rosso `__CPM_NO963`). Toglierli alleggerisce il file; l'intervista 3D però è il braccio rosso del guardiano `intervista`.
- **D15 — Memoria grafica** **[LETTO, effetto NON CONFERMATO]**: nessuna scena fuori partita chiama `forceContextLoss()` alla chiusura (lo fanno solo 01:835 e 12:12676); presentazione (16:1559), parata (16:1991) e intro (19:608) fanno `dispose` di geometrie condivise in cache senza prima togliere i cloni. Ipotesi: dopo più cerimonie nella stessa sessione i contesti si accumulano. Da misurare con una sonda dedicata prima di toccare.
- **D16 — Commenti non allineati al codice** **[LETTO]**: 12:11594 («attivo solo nelle review») e 12:1197 («pieni») non corrispondono più al comportamento.
- **Su PC** **[MISURATO]**: il riquadro 3D occupa circa due terzi della larghezza (953×755 punti su 1440×900); a destra c'è la colonna dei pannelli. Nei campi lunghi (passaggio, cross, costruzione) l'eroe è a 0,048-0,06 dell'altezza: stesso difetto del D1.

---

## 6. Piano proposto per la 192 (5 giri + 1 facoltativo)

| Giro | Contenuto | Difetti | Perché in questo ordine |
|---|---|---|---|
| **1** | Regia verticale delle azioni salienti: provini a taglia per la scelta del PO, mira sopra il pannello, stretta solo sul gesto | D1, D11 | È ciò che si vede più spesso (2-6 volte a partita) |
| **2** | Esultanza frontale e senza coperture | D2 | Il momento di premio più frequente; costo basso |
| **3** | Intro sul telefono + un solo sviluppo del colore per le scene fuori partita | D3, D6 | Prima impressione; il colore si sistema una volta per tutte, con foto prima/dopo |
| **4** | Ingresso in campo: più tunnel, meno orbita; misura degli fps **sul telefono** della scena più pesante | D4 | Ogni partita; è anche la scena più cara |
| **5** | Premiazione e festa: inquadrature per formato, coppa leggibile, pose sfalsate | D5, D12 | Rara, ma è il punto d'arrivo della carriera |
| **6** (facoltativo) | Galà e primi due momenti della presentazione | D7, D8 | Una volta a stagione ciascuna |

Fuori piano, a decisione del PO: **D9 parata** (rarissima), **D10 notte** (tocca la 7.539), **D13/D14 pulizie**, **D15 memoria grafica** (prima una sonda).

Ogni giro: foto prima/dopo con le sonde di questo giro (stesso formato, stessa scena), i guardiani elencati nel difetto, e il collaudo del PO sul telefono per tutto ciò che riguarda l'inquadratura (le soglie headless hanno già sbagliato una volta, 7.509).

---

## 7. Cose che sconsiglio di toccare

1. **`_spalle146` e la catena `_corrPostura23`** (12:216-241, 12:339-370): proporzioni e postura sono coerenti in tutte le scene fotografate; nessuna delle proposte lo richiede.
2. **Riaccendere il 3D durante il gioco fluido** (`__CPM_NO917`): è una scelta di prodotto recente e costa CPU continua.
3. **Stringere la camera con un moltiplicatore globale**: già bocciato due volte (7.482, 7.509). Si lavora sulla mira e sulla finestra del gesto.
4. **Ombre vere dei giocatori sul telefono**: 22 corpi con scheletro nella mappa ombre; il disco finto è una scelta di prestazioni (12:1273-1285).
5. **Asset 3D pesanti** (stadi, pubblici): vincolo di peso mobile/Play Store già deciso.
6. **Scurire il campo di notte**: riporterebbe la nota «colori slavati» (7.539). Atmosfera sì, luce del campo no.
7. **Velocità del passo all'ingresso** (PO-245) e durata (PO-285): si cambia la camera, non il passo.
8. **Riflesso del portiere a bruciapelo** (giro 148, 12:6177-6186) e **braccia al cielo solo da fermo** (giro 152): nessuna proposta li richiede; l'esultanza frontale (D2) deve lasciarli intatti.
9. **La folla a sagome del giro 147** (`buildFolla129`, upload delle texture alla nascita): in tutte le foto è la parte più solida dello stadio.
10. **La sala stampa 2D dell'intervista**: è una scelta deliberata (zero WebGL, zero volti).

---

## 8. Cosa non ho potuto fare o confermare

- Fps veri sul telefono: **non misurati** (rendering software in questa sessione).
- Fluidità, scatti, piedi che scivolano, compenetrazioni in movimento: **non confermabili** da foto.
- Serie dei rigori: **non fotografata**.
- Una sola situazione per famiglia di azione (10 su 191).
- Frequenze «a stagione»: dove il codice non le fissa sono stime, marcate come tali.
- Quota dei piedi sul tetto del pullman: vista in foto, **non misurata**.
- Ramo di camera dell'esultanza: causa indicata come stima, non letta riga per riga.
- Nella cartella di lavoro restano i PNG originali e 4 foto di una prima prova sul provino (`ingresso-tel-1-inizio`, `-2-cammino`, `-3-meta`, `-4-schierati`): **non sono nel commit**. Una cancellazione automatica è stata bloccata dal sistema di sicurezza della sessione e non l'ho aggirata.

---

## 9. Come rifare le foto

Da `tests/visual`, un comando alla volta:

```bash
export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
CPM_FMT=tel node giro170-partita.mjs          # anche CPM_FMT=pc · CPM_TOD=night · CPM_SOLO=ingresso,gioco,azioni,cerimonia,festa,panchina
CPM_FMT=tel node giro170-fuori.mjs            # CPM_SOLO=intro,presentazione,gala,parata,subentro
node giro170-fogli.mjs 'azione-shot|esultanza-tel' 6 236 tel-tiro-esultanza   # foglio-provini (legge i PNG appena scattati)
```

Le sonde scattano in PNG; la conversione in JPEG (qualità 68) è stata fatta a parte per il commit.

Contatto pubblico del progetto: korward.devteam@gmail.com
