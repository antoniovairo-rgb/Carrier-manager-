# Giro 3 · Punto 1 — «Esiti diversi con lo stesso seme»

Base: worktree `/tmp/cpm` su origin/main 7.999.158, sorgente ricomposta. Solo lettura sul gioco (nessun file del gioco modificato).
Browser: `CPM_CHROME=/opt/pw-browsers/chromium`. Ogni giro = pagina nuova (contesto nuovo), salvataggio `tests/visual/fixtures/save-190-s12-ovr93.json`, nome dal salvataggio, velocità `cpm-match-speed=1`, `cpmtest=1`, GLB off.
Autoplay: `__CPM_AUTOPLAY(true,{seed:2021,policy:'seeded',tickMs:150})` avviato in fase `playing`.
Script: `docs/rilascio/giro3-probe-esiti.mjs` (un giro per chiamata), `giro3-confronta.mjs` (confronto coppie), `giro3-primo-scarto.mjs` (primo punto di scarto nel registro eventi).

## Tabella dei giri (autoplay seeded, seme 2021)

| Coppia | Giro | Punteggio (`__CPM_SCORE`) | Highlight (numHL) | Calendario HL (minuti, `__CPM_HLTIMES`) | Scene `ActionResolved` | Gol nel registro | Durata reale |
|---|---|---|---|---|---|---|---|
| A | A1 | 1-0 | 8 | 11,30,42,29,34,61,77,86 | 7 | 85' (cronaca) | 190 s |
| A | A2 | 2-0 | 7 | 11,30,32,42,61,77,86 | 4 | 39', 68' (cronaca) | 175 s |
| B | B1 | 1-0 | 7 | 11,30,14,42,61,77,86 | 7 | 88' (cronaca) | 191 s |
| B | B2 | 1-0 | 7 | 11,30,14,42,61,77,86 | 7 | 88' (cronaca) | 191 s |
| C | C1 | 0-1 | 8 | 11,30,42,29,61,77,86,59 | 7 | 50' (cronaca) | 193 s |
| C | C2 | 0-0 | 8 | 11,30,15,42,26,61,77,86 | 7 | nessuno | 194 s |
| controllo | R1 | 0-0 | 8 | 11,30,15,42,28,61,77,86 | 7 | nessuno | 190 s |
| controllo | R2 | 4-0 | 8 | 11,30,42,33,61,49,77,86 | 7 | 25',34',69',86' | 195 s |

Fine partita: fase `ceremony` in tutti i giri (fischio finale al 90'). Errori di pagina: nessuno (`GIRO3:errori []`).
Il tabellone coincide sempre col registro dei gol (es. A2 2-0 = due gol, C1 0-1 = un gol subito).

Controllo R (R1/R2): stesso autoplay, ma `Math.random` sostituito in pagina da un PRNG seminato (seme 777, via `addInitScript`; flag `GIRO3_RANDSEED`, default assente = nessuna sostituzione). Scopo: separare le sorgenti `Math.random` dalle sorgenti a tempo reale. Vedi limiti.

## Confronto delle coppie

| Coppia | (a) punteggio | Calendario HL | Fasi (minuto di transizione) | (b) scene (`ActionResolved`) |
|---|---|---|---|---|
| A1 vs A2 | **DIVERSO** (1-0 vs 2-0) | DIVERSO (8 vs 7 HL) | DIVERSE | prime 2 uguali; dalla scena 2 DIVERSE (`progression/miss` vs `freekick/miss`) |
| B1 vs B2 | UGUALE (1-0) | UGUALE | DIVERSE di 1 minuto a 58' (`hl_result→playing` a 58' vs 58'/59') | **UGUALI** (7/7, stesse etichette, stessi esiti) |
| C1 vs C2 | **DIVERSO** (0-1 vs 0-0) | DIVERSO (ordine HL 29/59 vs 15/26) | DIVERSE | prime 2 uguali; dalla scena 2 DIVERSE (`progression/miss` vs `freekick/miss`) |
| R1 vs R2 (Math.random seminato) | **DIVERSO** (0-0 vs 4-0) | DIVERSO | DIVERSE | prime 2 uguali; dalla scena 2 DIVERSE (`freekick/miss` vs `shot/goal`) |

Riepilogo misurato:
- (a) Il punteggio finale differisce in 2 coppie su 3 (A, C) e anche nel controllo R. Nella coppia B è uguale.
- (b) La sequenza delle scene differisce in 3 coppie su 3 (A, C, R), sempre dalla scena di indice 2, dopo due scene uguali. La coppia B ha sequenze identiche.
- Anche il calendario degli highlight (`__CPM_HLTIMES`) e il numero di highlight variano nelle coppie A, C e R. Il calendario cambia perché si inseriscono highlight reattivi (vedi sotto), quindi è una conseguenza, non la causa.
- Le fasi differiscono anche in B (solo di 1 minuto di gioco, tempi reali): la pacing in tempo reale esiste, ma nella coppia B non ha cambiato l'esito.

## Primo punto di divergenza (registro eventi `__CPM_EV`, ts rimosso)

`giro3-primo-scarto.mjs` confronta le voci del registro.
- A1 vs A2: prime 26 voci identiche. La voce 26 (indice 0-based) è `recita` al minuto 9, `kind:motore, arc:shot`, con `ex` 72.7 in A1 e 72.6 in A2 (`out-giro3/A1.log`, `A2.log`). Il primo scarto è in una coordinata continua, non in un esito.
- C1 vs C2: prime 26 voci identiche. Al minuto 8 C2 ha una voce `turn causa motore-rimessa` assente in C1; al minuto 9 `ex` 72.6 (C1) vs 73.6 (C2), `ey` 1 vs 20.5.
- R1 vs R2: prime 27 voci identiche; al minuto 8 R2 ha la voce `motore-rimessa`, poi `ex` 73.6/`ey` 20.5 come C2.

Il primo scarto nasce quindi da una coordinata di tiro (`ex`/`ey`) un po' diversa al minuto 8-9, prima di qualsiasi esito diverso. La coordinata deriva dalla posizione del pallone (`ballTargetRef`), non da un tiro già risolto.

## Sorgenti candidate (IPOTESI, non misurate come causa)

Il percorso del punteggio: `scoreRef` (`__CPM_SCORE`, `CARRIER-MANAGER-AV.html:29218`); la coordinata del tiro viene da `_end546` (`:33930`), che prende `ballTargetRef` (`:33930`), a sua volta limitato dalla posizione reale del pallone `ballPosRef` scritta da `_stM870.palla` (`:30962`).

Verifiche di Math.random nel percorso (lettura via grep, `:27000-34500`):
1. `:33489-33523` — nel ramo `ev.poss` della cronaca, `setMatchPlayers` sposta i 22 con `Math.random()` (jitter ±1, ±3 unità). IPOTESI: sposta le posizioni logiche (`matchPlayers`) che alimentano la scelta di passaggi e tiri. Il CLAUDE.md già dichiara che `matchPlayers` ha Math.random e non va usato come base del replay.
2. `:30172-30173` — direzione del tuffo del portiere sui rigori (`gkDiveRef`), con `Math.random()*100`. IPOTESI: influisce sull'esito del rigore (il ramo `handleRigore` riceve `res.gkDir` a `:35890`). Non misurato: un rigore compare solo in R2 (scena 3, `penalty/ok/goal`), e lì non ho isolato il ruolo del tuffo.
3. `:28124` (`benchWarmupAt`), `:29772` (`derby` nei cori), `:27355-27564` (sfondo visivo): NON nel percorso del punteggio (scelte di presentazione). Esclusi.

Sorgenti a tempo reale (non Math.random), IPOTESI da verificare:
4. `:32635` e `:33390` — il timer della libreria d'azione confronta `Date.now()-t0>9000` (`libAzRef666`): un ritardo di frame può troncare una sequenza.
5. `:32883` — scadenza della recita (`spRef.t0=Date.now()`, rif. 7.602/7.629): conta il tempo reale fra i passi.
6. `:30969`, `:30529-30530` — finestra della ripartenza `ripT0Ref` (Date.now): decide il ramo breve/lungo.
7. `:29683` — `setBallLock811` con `Date.now()+ms`.
8. Non verificato: i `requestAnimationFrame`/`dt` del render-loop in `ThreeMatchView` e se il loro stato rientra in `ballPosRef`. Non ho avuto il tempo di seguire la catena.

Controllo di conferma: con `Math.random` seminato (R1/R2) le partite restano diverse (0-0 vs 4-0). Quindi `Math.random` non è l'unica sorgente. Il PRNG condiviso con il render può però essere consumato a ritmi diversi dal frame-rate: il controllo non separa le due ipotesi.

## Cosa NON è confermato
- La causa non è dimostrata. I candidati 1-8 sono ipotesi; nessuna è stata isolata con una prova del rosso.
- Il controllo R non isola `Math.random`: lo stream seminato è condiviso con il rendering, quindi il suo consumo dipende dal frame-rate.
- Non ho provato le coppie senza autoplay: senza autoplay la partita si ferma in `hl_choose` ad attendere l'azione del giocatore, quindi non produce un esito da confrontare. Non eseguita per questa ragione.
- Le frequenze si basano su 8 partite (6 + 2 di controllo). Con n così piccolo non si stima una percentuale affidabile: il dato è «2 coppie su 3 con punteggio diverso, 3 su 3 con scene diverse».
- Ring buffer: `__CPM_TIMELINE` 27/500 e `__CPM_EV` 262-295/400 — nessun troncamento. A2 ha 15/500 voci di timeline ma 4 scene risolte: il numero di scene risolte non coincide con il numero di highlight dichiarati (7); non ho verificato il perché.
- Osservazione (non sul punto 1): il commento in CLAUDE.md dice `MATCH_TICK_MS` 900 ms, il codice a `CARRIER-MANAGER-AV.html:27196` dà 1700 ms salvo `__CPM_NO564`. Non verificato a fondo: misurato solo il fatto che il codice contiene 1700.

## File
- `docs/rilascio/giro3-esiti-{A1,A2,B1,B2,C1,C2,R1,R2}.log` — log dei giri (righe `GIRO3:*`).
- Hook usati (definizioni): `CARRIER-MANAGER-AV.html:12854` (`__CPM_TIMELINE`), `:12872` (`__CPM_EV`), `:29208` (`__CPM_PHASE`), `:29218` (`__CPM_SCORE`), `:29252` (`__CPM_AUTOPLAY`, LCG seminato `_as` su seme 2021), `:29200` (`__CPM_NUMHL`), `:29216` (`__CPM_HLTIMES`).
- Numero di highlight deciso al calcio d'inizio: `:28035-28066` (`tassoOccasioni28`, nessun Math.random nelle funzioni `:27999-28012`, verificato con grep). Calendario seminato: `:28074-28096` (`hashStr` + `seededRng`). Inserimento reattivo: `:31099-31106` (`addT=ck+2`, `setNumHL(prev+1)`).
- `_rndM` (generatore seminato del tick): `:31153-31158`, seminato salvo `__CPM_NO489`/`__CPM_RNDM959`. Conferma il CLAUDE.md per la cronaca.
