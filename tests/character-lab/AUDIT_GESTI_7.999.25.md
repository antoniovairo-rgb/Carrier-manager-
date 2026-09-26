# Verifica di copertura dei gesti dell'eroe negli highlights 3D — build 7.999.25

Risposta al prompt PO «Catalogo gesti e movimenti dell'eroe guidati dal brain» (26/09).
Metodo: lettura del codice sorgente (`src/*.jsx`) e dei pacchetti GLB (nomi delle clip letti dal JSON dei file), nessuna esecuzione sul telefono.
Riferimenti: `12:` = `src/12-three-match-view.jsx`, `11:` = `src/11-ui-kit-highlight.jsx`, `14:` = `src/14-motore-possesso.jsx`, `15:` = `src/15-live-match.jsx`.
Dove non ho potuto verificare scrivo «Non posso confermarlo».

## 1. Sintesi (10 righe)

1. Delle 57 voci di movimento del catalogo (A–J), circa **11 hanno una clip dedicata** (19%), **16 usano una clip condivisa** con un'altra voce (28%, copertura solo apparente), **10 sono procedurali** (18%) e **18 mancano del tutto** (32%). Due voci (F3, E4) sono miste.
2. Sul corpo di default (CGTrader) sono montate **25 clip**. Nessuna di queste si chiama `celebrate`: **l'esultanza dell'eroe e del compagno che segna non ha nessuna clip** (`lift` e `celebrate` risolvono a `null`). È il difetto più grave emerso.
3. Negli highlight il brain decide **solo tre cose del corpo**: il modo del contrasto, il tiro e il cartellino (12:3178-3184), più il cast (chi riceve, chi difende, quale portiere). Tutto il resto lo decide la scena (`GESTI`) o rami propri.
4. `BRAIN_GESTI` vale **solo nel gioco vivo** (`matchPhase==='playing'`, 12:3185), dove dal 7.917 il 3D è sospeso: la tabella è in pratica **invisibile al giocatore**.
5. `GESTI` ha 2 colonne reali (`clip`, `prof`); `contactAt`, `vRef`, `spin`, `tgtY`, `foot` esistono **solo in un commento** (12:2610).
6. Le varianti con nome (roulette, veronica, step over, tacco, rabona, pallonetto, cutback…) ricadono su **3 clip fisiche** (`pass`, `dribble`, `change-direction`) più `kick`: la differenza si vede solo nel volo del pallone.
7. Il piede preferito **non arriva al 3D**: esiste uno specchio delle clip (`_specchiaClip23`, 12:28-46), ma è scelto a caso per scena, non da `player.foot`.
8. La fluidità ha un solo guardiano (`passo-velocita`: cadenza/velocità). Il testimone del pattinamento `__CPM_PIEDI` esiste ma **nessun test lo legge**.
9. Nei pacchetti del progetto ci sono **almeno 20 clip mai usate** che chiudono gap P1 senza procurare nulla fuori (vedi §5).
10. L'eroe **non può essere portiere** (ruolo fisso «Attaccante», `17:288`): la sezione K non si applica.

## 2. Tabella di copertura A–L

Legenda clip: **D** dedicata · **C** condivisa (quale) · **P** procedurale · **—** assente.
Brain: evento del motore che la decide, oppure «scena» se la decide la scheda (`GESTI`/`deriveHL`), non il brain.

| Voce | Brain | Clip | Guardiano | Priorità |
|---|---|---|---|---|
| A1 camminata→scatto | no | C: `jog` accelerata dalla cadenza (12:9745); `walk`, `running` nel pacchetto ma mai usate | passo-velocita | P1 |
| A2 frenata, ripartenza, cambio direzione | no | P: accelerazione e reazione per giocatore (12:2796-2804) | — | P2 |
| A3 corsa indietro, passo laterale | no | D: `jog-back`, `strafe-left/right` (12:9682) | loco-directional | fatto |
| A4 girarsi, orientamento | no | P: rotazione della radice; mira latchata sul gesto | aim-latch, mira-porta | P2 |
| A5 scanning | no | — (`look-over-shoulder` caricata, mai chiesta) | — | P1 |
| A6 smarcamento | no (7.999.26: sì per l'attacco dell'area sul cross) | P: corsa del ricevente al punto d'arrivo (12:3956) | through-depth, cross-origine | P1 |
| A7 chiamata della palla | no | — (solo posa «chiama il portiere», 12:7334) | — | P1 |
| A8 sovrapposizione, sostegno | no | — | — | P2 |
| B1 stop orientato | scena (`receive`) | D: `receive`, non orientato | — | P2 |
| B2 petto, coscia, suola, aereo | no | — (nel pacchetto: `mx-stall-soccerball` ×4, `mx-kneeing-soccerball` ×2, mai usate) | — | P1 |
| B3 spalle alla porta, protezione, giro | no | — | — | P2 |
| B4 giocata di prima | no | C: `kick` | — | P2 |
| B5 controllo sbagliato | no | — | — | P2 |
| C1 conduzione | scena / `conduzione` | D: `dribble`, palla sull'osso del piede (12:4252) | carry-run-ball, ball-attended | fatto |
| C2 cambio di passo | no | — | — | P3 |
| C3 finte (doppio passo, step over, veronica, elastico, tunnel, sombrero) | scena | C: `dribble` / `change-direction` per tutte | gesto-vocabolario (solo nome→clip) | P2 |
| C4 protezione col corpo | no | — | — | P2 |
| C5 dribbling fallito | contrasto (difensore) | D: caduta trip→a terra→rialzo (solo su fallo) | caduta-eroe | P2 |
| D1 corto, filtrante, lancio, cambio di gioco | scena | C: `pass` per tutti; differenza solo nel volo | through-depth, pass-landing | P2 |
| D2 uno-due | scena | C: `pass` + restituzione (12:3741) | — | P2 |
| D3 tacco, pallonetto, esterno | scena | C: `pass`; esterno assente | — | P3 |
| D4 cross (primo/secondo palo, basso, cutback, rabona) | scena | C: `pass` per tutti; rabona → `change-direction` | shot-apex, battuta | P2 |
| D5 sponda di testa/petto | no | C: `header`; petto assente | — | P3 |
| D6 di prima, sotto pressione | no | — | — | P3 |
| E1 collo, piatto, giro, esterno, punta | tiro (scena) | C: `kick` (+ `kick~m` specchiata a caso) | gesto-vocabolario, shot-apex | P2 |
| E2 pallonetto, 1 contro 1 | tiro | C: `kick` + profilo «campana» | shot-apex | P2 |
| E3 volo, rovesciata, scivolata | tiro | D: `volley`, `mx-scissor-kick` (solo se l'etichetta dice «rovesciata», 12:66) | rovesciata-spalle, aerial-contact | P2 (semirovesciata, scivolata assenti) |
| E4 testa: elevazione, tuffo, torsione | tiro | D: una sola `header` per tutte (seconda `mx-header-soccerball` mai usata) | mira-porta, aerial-contact | P2 |
| E5 di prima / dopo controllo | no | C: `kick` (`mx-strike-foward-jog` mai usata) | — | P2 |
| E6 rincorsa e contatto sincronizzati | no | P: finestra `pre` (0,24-0,32 s) e tabella contatti `_kc23` (12:4262) | gesture-window | P1 |
| F1 rigore | scena | D: `penalty`; panenka = stessa clip; sistemazione del pallone assente (`mx-goalkeeper-placing-ball` mai usata) | shot-apex, setpiece-celebration | P1 (rigori spariti dalle scene: 7.999.27) |
| F2 punizione | scena | C: `kick` per ogni variante | freekick-delivery | P1 |
| F3 angolo, rimessa | battuta | D: `throwin`; angolo = C: `pass` | battuta | P2 |
| F4 barriera / area su piazzati avversari | no | P: salto della barriera solo avversaria; eroe in barriera assente | def-far-gesture | P3 |
| G1 pressione, temporeggiamento | pressione (solo gioco vivo) | — (`press`, `call` = `clip:null`) | def-far-gesture (parziale) | P1 |
| G2 contrasto, scivolata, intercetto | contrasto/intercetto; in scena `_modo23` dal brain | D: `tackle`, `slide-tackle`, 3 varianti Mixamo | intercetto-credibile, filtrante-intercetto | fatto (anticipo assente) |
| G3 duello aereo, spallata | no | C: `header`; spallata assente | squad-react | P3 |
| G4 spazzata, muro | spazzata, murato (gioco vivo) | C: `kick`, `tackle` | squad-react | P3 |
| G5 fallo tattico + cartellino | fallo + `_cart913` | P: braccio dell'arbitro (12:9982); il colpevole non ha gesto | cartellino | P2 |
| G6 recupero su avversario lanciato | no | — (`recovery-run` nel pacchetto, mai usata) | — | P2 |
| H1 fallo subito | esito `fouled` (ramo proprio 12:3223) | D: 3 clip Mixamo riparate (7.999.8) | caduta-eroe | fatto (varianti assenti) |
| H2 inciampo senza fallo | no | — | — | P3 |
| H3 infortunio in scena | no (infortunio solo in carriera) | — | — | P3 |
| H4 contatto senza compenetrazione | n/a | P: separazione 1,7 u (12:6267) | — (non misurata) | P2 |
| I1 esultanze diverse | gol (seme, non brain) | **— sul corpo CGTrader** (`celebrate` non esiste); movimento procedurale (ginocchia, corsa) | celebration, celebration-visible | **P1** |
| I2 rammarico | rammarico (gioco vivo) / esito miss | D: `missed-chance` | — | P2 (manca guardiano) |
| I3 protesta, richiesta di fallo | no | — (`mx-goalkeeper-directing` mai usata) | — | P2 |
| I4 incitamento, applauso, cinque | no | P: applauso solo in sostituzione e cerimonie | — | P3 |
| I5 reazione a gol subito / parata | no | P: disperazione del portiere avversario | — | P3 |
| I6 reazione al cartellino | no | — | cartellino (solo arbitro) | P3 |
| J1 compagno che serve l'eroe | cast (7.999.26: origine del cross) | C: `kick`/`pass` via `_mateFx`; sguardo e chiamata assenti | cross-origine, delivery-origin | P1 |
| J2 compagno che attacca il punto d'arrivo | cast | C: `header` + corsa procedurale | recv-delivery-dest, squad-react | P2 |
| J3 marcatore, raddoppio, portiere che legge | marcatore (7.999.6), `pronto` | D: `gkReady`, tuffi con varianti; raddoppio assente | eroe-dal-gioco, gk-dive-sync | P2 |
| J4 esultanza collettiva, reazione avversari | gol (un solo attore) | — | celebration-visible | P2 |
| J5 arbitro | cartellino | P: braccio, posizione; negli highlight l'arbitro è fuori campo (12:6927) | cartellino | P3 |
| K1 portiere eroe | n/a | l'eroe non può essere portiere | — | n/a |
| L1 raccordo fra clip | — | peso verso il bersaglio a 10/s in entrata, 4,5/s in uscita (12:9909), nessun `crossFadeTo`; durate non misurate | frozen-mate (solo peso residuo) | P2 |
| L2 piedi ancorati | — | nessuna IK; testimone `__CPM_PIEDI` senza test | — | P1 (misura) |
| L3 contatto palla-corpo | — | `_kc23` per clip; colonne `GESTI` assenti | gesture-window | P1 |
| L4 piede preferito | — | no (specchio casuale) | — | P1 |
| L5 anticipazione | — | `pre` 0,24-0,32 s; sguardo assente | gesture-window | P2 |
| L6 coerenza brain→gesto | — | `__CPM_SCENA23` misurato nei provini (32/33, 97%; su CGTrader 16/19, 84%) ma nessun guardiano | — (solo sonde del laboratorio) | P1 |
| L7 FPS telefono | — | Non posso confermarlo sulla build precompilata; ultimo dato 31-32 fps sul telefono PO con i corpi pieni (misura storica) | dist-web-partita (senza FPS) | P1 (misura) |

## 3. I 8 rilievi

1. **Elenco delle clip — PARZIALE.** Sul corpo CGTrader `_clip()` risolve 25 clip; `celebrate` è chiamata ma **non esiste in nessun pacchetto** (smentito che sia caricata). Più le 3 cadute Mixamo, la rovesciata `mx-scissor-kick`, le varianti `_VAR23` (tackle ×3, portiere) e `kick~m` (specchiata). Nessuna clip di corsa/sprint/camminata è usata: lo scatto è `jog` accelerata (confermato, 12:9745). Il pacchetto CGTrader ne contiene altre 8 mai usate (walk, running, jogging, recovery-run, run-look-back, running-to-turn, opening, sit-to-stand) e quello Mixamo altre ~30.
2. **Varianti con nome senza movimento proprio — CONFERMATO.** Mappa `_mkGestures` 12:1286: cross, shortPass, longPass, heel → `pass`; doubleStep → `dribble`; feint, change → `change-direction`; lift → `celebrate` (che non esiste). `GESTI` 12:2643-2653: roulette, hocus_pocus, step_over, backheel, chip_pass, cross_rabona su 3 clip. Il giocatore non vede un tacco né una rabona: vede un passaggio o un cambio di direzione.
3. **Gesti senza clip — CONFERMATO.** `tackle.press` e `tackle.call` hanno `clip:null` (12:2654); il peso del gesto scende a zero e resta la locomozione (12:9904-9909). `lunge` usa `kick`.
4. **Piede preferito — PARZIALE.** Il motore lo usa (`15:8396`, `11:2144`). Nel 3D non c'è nessun collegamento a `player.foot`; lo specchio delle clip esiste (`_specchiaClip23`, 12:28-46) ma sceglie `kick~m` a caso per scena (12:72). Un eroe mancino non calcia di sinistro per scelta del brain.
5. **`lookBack` mai suonato — CONFERMATO.** Compare solo nelle tre mappe (12:1117, 1262, 1286).
6. **`BRAIN_GESTI` — CONFERMATO.** Invariata; mancano caduta, cartellino, rovesciata, scanning, smarcamento, e anche eventi che il motore emette davvero (`dribbling`, `fallo`, `palo`, `fuori`, `palla_persa`, `fuorigioco`, `occasione_eroe`). Caduta (12:3223, 9766), cartellino (12:3184) e rovesciata (12:66) passano da **rami propri**: la regola «chi aggiunge un gesto aggiunge QUI la riga» (12:2615) **non è rispettata**.
7. **Fluidità — misura alternativa.** Oggi: `passo-velocita` (cadenza), `__CPM_PIEDI` (quota di fotogrammi col piede d'appoggio che scivola oltre 0,5 m/s) senza guardiano. Proposta in §5, lotto L1.
8. **Seguiti degli esiti — PARZIALE.** Goal: nessuna clip (vedi rilievo 1). Miss/save: `missed-chance` per 1,4 s. Intercetto/recupero/tackle riuscito: posa procedurale del pugno (12:8073), probabilmente invisibile sotto il corpo GLB (Non posso confermarlo senza provino). Fallo subito: caduta. `goal_against`, `nothing`, `loose`: nessun seguito. Compagni e avversari non reagiscono (tranne il compagno marcatore, che però chiede `lift`, cioè niente).

## 4. Autocritica

- **Considerate «fatte» perché c'era un nome:** tutte le varianti di tiro, passaggio, cross, dribbling e punizione in `GESTI`. Il guardiano `gesto-vocabolario` verifica che il nome risolva a una clip, non che il giocatore veda un movimento diverso. Ho confuso «il vocabolario esiste» con «il gesto si vede».
- **L'esultanza:** i guardiani `celebration` e `celebration-visible` sono verdi, ma misurano il piano di esultanza e la posizione, non la clip montata. Sul corpo CGTrader la clip non c'è mai stata: nessuna misura lo diceva.
- **Il brain negli highlight:** ho scritto più volte «i gesti li decide il brain», ma `BRAIN_GESTI` lavora solo nel gioco vivo, che non si vede in 3D. Negli highlight il brain decide tre cose; il resto è scena o rami propri (caduta, cartellino, rovesciata).
- **La regola della tabella unica:** l'ho scritta io e l'ho violata tre volte (7.999.8, 7.999.9, 7.999.19).
- **Il piede:** lo specchio c'era ed è stato usato per varietà casuale invece che per il piede dell'eroe.

**Voci mancanti dal catalogo che servono:** controllo del pallone al volo sul posto (palleggio / «stall»), sistemazione del pallone sul dischetto (c'è la clip), sguardo del portiere e del difensore verso chi porta il pallone, reazione del compagno che ha fatto l'assist (indicare, correre dall'eroe), tempi morti credibili a inizio scena (idle offensivo `mx-offensive-idle`).

## 5. Piano per priorità (dentro le release normali)

**Strada comune a ogni lotto:** prima le clip già nel progetto (§inventario), poi lo specchio, poi librerie con licenza verificata. Ogni clip passa da `tools/retarget_cgtrader_clip.py`, cancello anatomico, provino `tests/visual/provino-clip.html`, riga in `BRAIN_GESTI`/`GESTI`, guardiano e flag rosso. Registro in `tests/character-lab/CLIP_REGISTRY.md`. Pagina di anteprima per lotto.

**Lotto P1-a — «si vede il gesto giusto» (clip già in casa)**
- I1 esultanza: sostituire `celebrate` inesistente. Candidata da verificare nel provino: `opening` (Non posso confermarlo che sia un'esultanza) o una clip Mixamo; altrimenti procedurale sulle braccia come il cartellino. Guardiano: la clip di esultanza è **montata** sull'eroe dopo il gol. Rosso `__CPM_NO_ESULTA27`.
- A1 scatto: `running` sopra una soglia di velocità, `walk` sotto; cadenza 7.999.7 invariata. Guardiano: passo-velocita esteso ai tre canali.
- A5 scanning: `look-over-shoulder` / `run-look-back` suonate dal brain prima della ricezione (evento `ricezione` in scena).
- B2 controlli: `mx-stall-soccerball` (petto/coscia) e `mx-kneeing-soccerball` sulle ricezioni aeree.
- G1 pressione: una clip per `press` (candidata `mx-transition` o `mx-offensive-idle` a passo corto; Non posso confermarlo senza provino); A7/I3 chiamata e protesta: `mx-goalkeeper-directing`.
- L4 piede: `kick~m`/specchi scelti da `player.foot`, non a caso; poi `pass~m`, `penalty~m`, `volley~m`.

**Lotto P1-b — il brain suona i gesti anche nelle scene**
- Portare `BRAIN_GESTI` negli highlight: gli eventi di scena (ricezione, tiro, cross, caduta, cartellino, rovesciata, esultanza) passano dalla tabella; eliminare i rami propri.
- Colonne `contactAt` e `foot` in `GESTI`, consumate dal lancio del pallone.
- Guardiano di copertura (vedi sotto).

**Lotto P1-c — rigori e punizioni (7.999.27)**, con `mx-goalkeeper-placing-ball` per la sistemazione del pallone e `mx-soccer-penalty-kick` come variante.

**Lotto P2** — varianti distinguibili: cross vs passaggio (clip propria o modifica delle ossa di gamba), finte (specchi e modifiche di `change-direction`), protezione col corpo, recupero in corsa (`recovery-run`), reazioni dei compagni al gol, colpo di testa in tuffo (seconda clip). **Lotto P3** — tacco, rabona, esterno, barriera dell'eroe, infortunio in scena.

**Metrica di copertura da aggiungere ai guardiani** (partendo da `gesto-vocabolario` e `__CPM_GESTI`):
- clip **fisicamente distinte** montate sull'eroe in N scene;
- % di varianti di `GESTI` con clip dedicata (oggi circa 7 su 40);
- % di gesti dell'eroe decisi da una riga della tabella del brain (oggi: solo tiro, contrasto, cartellino);
- % di scene con esultanza/rammarico **montati** dopo gol/errore.

**Fluidità (rilievo 7):** registrazione a passo fisso (tempo di scena avanzato a 1/60 s per fotogramma, non in tempo reale) e lettura di `__CPM_PIEDI` su quella: toglie il limite dell'headless lento. Guardiano `piedi-fermi` con soglia da tarare sulla misura.

**Licenze — da verificare prima di ogni lotto:** i termini d'uso di Mixamo (Adobe) e del pacchetto CGTrader già nel progetto per un'app pubblicata sul Play Store. Non posso confermarlo in questa sessione; lo scrivo nel registro con link ai termini prima di usare clip nuove.
