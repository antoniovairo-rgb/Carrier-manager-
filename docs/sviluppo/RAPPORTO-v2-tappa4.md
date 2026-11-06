# Grafica V2 «Notte da stadio» — tappa 4: UNIFICAZIONE

Ramo `sviluppo/v2-tappa4` (da `lavoro/179`, 76b04b4a: 7.999.178 pubblicata + tappe V2 1, 2, 2b, 3).
**Decisione PO 03/11 «La grafica deve essere unica, meno manutenzione»**: alla fine di questa tappa il gioco ha **un solo aspetto**.

File di gioco toccati: `src/01` (tema), `src/07` (costante morta), `src/11`, `src/13`, `src/15`, `src/16`, `src/17`, `src/18`, `src/19`.
**Non toccati**: `GAME_VERSION`, `SAVE_VERSION`, `docs/governo/*` (come nella tappa 3: versione e riga di roadmap le scrive la sessione
che promuove su `main`). Nessuna logica del motore cambiata (vedi §3 per l'unico ritocco a `src/15` lato motore: solo il NOME di un interruttore).

## 1. Cosa è cambiato

### Un tema solo (`src/01`)

| prima (tappa 3) | dopo |
|---|---|
| `let TH` chiaro + `TH_LIGHT_ORIG` + `TH_LIGHT` + `TH_DARK` + `V2` + `TH_V2` + `temaAttivo(scuro)` + `v2On()` + `thPastel(chiaro,scuro)` | **`TINTE`** (la tavolozza delle tavole, era `V2`) e **`TH`** che ne deriva: gli unici token |
| `CareerApp` e `App` facevano `Object.assign(TH, temaAttivo(...))` **a ogni render** | `TH` è definito una volta al caricamento; nessuno lo riassegna |
| interruttore rosso `__CPM_NO_V2` (riportava la grafica della 178) | **tolto** |

I valori di `TH` sono **esattamente** quelli che `TH_V2` produceva (calcolati eseguendo le vecchie definizioni, non riscritti a mano): le 40 voci
che la V2 sovrascriveva restano scritte come prima (`TINTE.*`), le 26 varianti semantiche scure (Sprint D/G1.7, oro da festa) sono
scritte per esteso. Spariscono solo le chiavi `v2`, `dk` e la nota-stringa `faintDk_nota`, che nessuno legge più. I nomi neutri: `V2` →
`TINTE`, `IV_TONE_V2` → `IV_TONE_TINTA`.
Scelta prudente dichiarata: **non** ho rinominato i mattoni `TitoloV2/TaccheV2/TagV2/AnelloV2`, le funzioni `fsTV/corniceV2`, né gli
attributi `data-cpm="*-v2"`: non sono token, e gli attributi sono gli agganci di decine di sonde (rinominarli = refactoring non richiesto).

### Nessun ramo V1 sopravvive (codemod su AST)

I rami `TH.v2 ? nuovo : vecchio`, `_v2t3 ? … : …`, `v2On() ? … : …`, `TH.dk ? … : …`, `!TH.v2 && …`, `if (TH.v2) {…}` e le chiamate
`thPastel(chiaro, scuro)` sono stati collassati sul ramo nuovo **con un codemod sull'AST di Babel** (posizioni dei nodi, sostituzione
del solo testo: la formattazione del resto resta identica; parentesi aggiunte solo dove servono, p.es. corpo di freccia che restituisce
un oggetto). Poi le rinomine `V2.` → `TINTE.` e `TH_DARK` → `TH` **per scope** (in `src/14` esiste una variabile locale `V2` del motore:
non toccata).

| | numero |
|---|---:|
| rami collassati (ternari, `&&`, `if`, `thPastel`) | **197** (src/15 123 · src/18 54 · src/16 8 · src/17 4 · src/01 3 · src/19 3 · src/11 2) |
| riferimenti rinominati `V2.`→`TINTE.`, `TH_DARK`→`TH` | **178** |
| markup V1 eliminato per intero | testata «vecchia» della carriera (`!TH.v2`, ~50 righe), card del club V1, tasto Opzioni nella barra, maniglia/titoli V1 dell'highlight, VS e nomi V1 dell'ingresso, colori V1 del tabellone/post partita/festa/creazione |
| righe dei frammenti | **+240 / −367** |

Il codemod ha lasciato una sola dichiarazione da togliere a mano (`const _v2t3=v2On();` in `src/15`): l'ha **trovata il guardiano nuovo**
`tema-unico` al primo giro (§4) prima che arrivasse a una partita — senza, `LiveMatch` sarebbe caduta con `v2On is not defined`.

### Selettore di tema e salvataggi vecchi (punto 3)

Il selettore chiaro/scuro **non c'era più già dalla 7.947** (la card «Grafica» delle Opzioni era stata tolta); restavano lo stato
`darkMode`/`dark`, le props `darkMode/onTheme` di `SettingsScreen` e la riscrittura di `cpm-dark` all'avvio: **tolti**. La preferenza
`cpm-dark` vive in `localStorage`, **non nel salvataggio**: un salvataggio vecchio non porta nessun campo di tema, quindi **nessuna
migrazione e nessun bump di `SAVE_VERSION`**. Verificato dal guardiano `tema-unico` (passo P): con `cpm-dark=1` rimasto in `localStorage`
la carriera si apre senza errori, sul fondo notte, e le Opzioni non offrono nessuna scelta di tema. `save-compat` 12/12.

### Due difetti di contrasto preesistenti trovati dalla misura (corretti)

La misura su **tutto** `#root` (non solo sui riquadri V2 dei guardiani) ha trovato due testi sotto soglia, **identici sul build di partenza**:

| schermata | testo | prima | dopo | rimedio |
|---|---|---:|---:|---|
| Post partita (tutti i formati) | nomi delle testate nella rassegna («Cronaca di Sport» `#003da5`, «Zona Mista» `#7c3aed`) | 1,76:1 · 2,93:1 | ≥ 5,06:1 | `legCol944(colore, TH.card)`: il colore del giornale è un DATO, alzato finché si legge, tonalità intatta (`src/15`) |
| Partita 2D, PC 1440 (vista pagelle del pannello) | sigla e numeri della squadra nel colore sociale (FC Laguna `#0f0f0f`) | 1,12:1 | 5,95:1 | lo stesso `_sigla970` che la testata del pannello usava già (`src/15`) |

Stesso rimedio, per coerenza, sulla rassegna stampa di `src/13` (stessi colori delle testate su `TH.surface2`), non misurata qui.

## 2. Il nuovo braccio rosso dei guardiani grafici (punto 2)

Con un tema solo non c'è più niente da «spegnere». Il rosso ora **altera i token dal banco di prova**:

- `src/01`: `window.__CPM_TEMA_PROVA = { tinte:{…}, th:{…} }` viene letto **solo** sotto `?cpmtest=1` e mai nella build dello store
  (`__CPM_STORE_BUILD`), e applicato a `TINTE` **prima** che `TH` ne derivi (poi a `TH`).
- `tests/visual/lib/tema-prova.mjs`: `TEMA_ROSSO`, una «notte sbiadita» (fondo, superfici, testo, testo secondario e oro spostati su grigi
  vicini; testo secondario ~1,4:1) e `armaTemaRosso(page)` (`page.addInitScript` prima del caricamento).
- `lib/banco-v2.mjs` e `lib/partita-v2.mjs`: l'opzione `rosso` arma il tema di prova invece di `__CPM_NO_V2`.

| guardiano | rosso prima | rosso ora | soglie |
|---|---|---|---|
| `grafica-v2` | `__CPM_NO_V2`: cadono PAL, NAV, HOME, TEST, SCH | tema di prova: cadono **PAL e CON in ogni formato** (24 righe CON, 8 PAL) | invariate |
| `momenti-v2` | `__CPM_NO_V2`: cade PAL su ogni schermata | tema di prova: cade **PAL su ogni schermata e CON in ogni formato** | invariate |
| `partita-v2` | come sopra | come sopra | invariate |
| `simula-v2` | `__CPM_NO_V2`: il tasto Simula spariva | **nuovo controllo CON** sul tasto Simula acceso (≥ 4,5:1, stessa misura `misura-v2`): verde 12,55:1, rosso **1,95:1** | soglia standard |
| `patrimonio-303` | `__CPM_NO_PATR303` (logica) | invariato: non ha mai spento il tema | invariate |
| `tema-unico` (nuovo) | — | tema di prova armato: cade P (fondo 28,32,41 invece di 13,15,20) | — |

**Dichiarato**: NAV/HOME/TEST/SCH di `grafica-v2` giudicano la **struttura** (barra, riquadri, testata, schede). Col markup unico non esiste
più un'altra struttura in cui farli cadere: il loro rosso non è più ottenibile senza reintrodurre markup V1, ed è esattamente ciò che la
decisione PO vieta. Restano verdi e restano bloccanti.
`barra-360-72`: il suo rosso accendeva **anche** `__CPM_NO_V2` per tornare alla barra della 178 a 7 voci (a 6 voci il difetto non si
riproduce: nota del giro della tappa 2). Tolto `__CPM_NO_V2`, il rosso resta il solo `__CPM_NO_BARRA72`: esito in §4.

## 3. `__CPM_NO_V2` del MOTORE: separato, non tolto

In `src/15` lo stesso nome `__CPM_NO_V2` era **anche** il rosso del *motore unico* (7.999.2: il gol lo decide il motore, non il microsim) —
due righe (`V2L` e `_v2h`). Il nome condiviso voleva dire che **ogni rosso dei guardiani grafici spegneva anche il motore**. Togliere il
controllo avrebbe cambiato la catena del motore e rotto il rosso di `motore-unico-test.mjs`; scelta prudente: **rinominato**
`__CPM_NO_MOTORE2` (comportamento del gioco identico: l'interruttore è spento nel gioco vero), e aggiornato `motore-unico-test.mjs`.

## 4. Misure

### Contrasto minimo e scorrimento (strumento `foto-v2-tappa4.mjs`: misura su TUTTO `#root`, soglia 4,5:1 e 3:1 sui testi grandi)

| schermata | 360 prima → dopo | 820 prima → dopo | 1440 prima → dopo | testi sotto soglia | scorrimento orizzontale |
|---|---|---|---|---|---|
| Home | 4,47 → 4,47 | 4,47 → 4,47 | 4,47 → 4,47 | 0 → 0 | 0 px ovunque |
| Carriera | 4,94 → 4,94 | 4,94 → 4,94 | 4,94 → 4,94 | 0 → 0 | 0 px |
| Ufficio | 5,74 → 5,74 | 5,74 → 5,74 | 5,74 → 5,74 | 0 → 0 | 0 px |
| Partita 2D | 5,95 → 5,95 | 5,95 → 5,95 | **1,12 → 5,95** | 12 → 0 (PC) | 0 px |
| Highlight (scelta) | 6,56 → 6,56 | 6,56 → 6,56 | 4,87 → 4,87 | 0 → 0 | 0 px |
| Post partita | **1,76 → 5,06** | **1,76 → 5,06** | **1,76 → 5,06** | 2 → 0 | 0 px |

Il 4,47 della Home è un testo **grande** (la misura lo classifica sopra la sua soglia di 3:1: zero testi sotto soglia); i testi normali
della home misurati da `grafica-v2` stanno a ≥ 4,99:1. Le altre schermate sono **identiche** prima e dopo: era atteso, perché il tema V2
era già quello attivo e questa tappa toglie rami che nel gioco vero non venivano mai eseguiti.

### Peso

| | prima | dopo | differenza |
|---|---:|---:|---:|
| `CARRIER-MANAGER-AV.html` | 6.975.712 B | 6.955.869 B | **−19.843 B (−0,28%)** |
| frammenti `src/*.jsx` | 6.740.047 B | 6.720.233 B | −19.814 B |
| `design-system` (colori dal tema / esadecimali a mano) | 3.143 / 3.269 | 3.040 / 3.111 | −158 esadecimali scritti a mano |

## 5. Guardiani (Chromium headless, `CPM_CHROME=/opt/pw-browsers/chromium`; un controllo alla volta, `free -m` e `df -h` registrati prima di ogni passo in `tests/visual/out/t4/catena.log`)

Tutti sul **build finale** (6.955.869 B), in sequenza (nessun passo in parallelo), log in `tests/visual/out/t4/` (non versionati).

| guardiano | verde | rosso (nuovo metodo dove grafico) | tempo |
|---|---|---|---:|
| `grafica-v2` | ✅ 4 formati, contrasto minimo **4,99:1** | ✅ tema di prova: cadono PAL e CON in ogni formato (24 righe CON, 8 PAL) | 118 + 120 s |
| `simula-v2` | ✅ (+ CON del tasto Simula 12,55:1) | ✅ CON 1,95:1 sul tasto Simula | 102 s |
| `momenti-v2` | ✅ 4 formati × 5 schermate, **4,83:1** | ✅ PAL su ogni schermata + CON in ogni formato | 231 + 230 s |
| `partita-v2` | ✅ 3 formati × 4 schermate, **4,87:1** | ✅ PAL su ogni schermata + CON in ogni formato | 294 + 296 s |
| `patrimonio-303` | ✅ | ✅ `__CPM_NO_PATR303` (invariato) | 205 s |
| `intro-292` | ✅ 6/6 scene in `hl_choose` | ✅ `__CPM_NO_INTRO292` (invariato) | 106 s |
| `pc-tablet-292` | ✅ VERDE | ✅ la 177 fa cadere larghezza, tocco, tasti, striscia | 781 s |
| `tema-unico` (nuovo) | ✅ S 0 residui · P carriera aperta con `cpm-dark=1`, fondo 13,15,20, Opzioni senza scelta di tema · B tema di prova ignorato senza `cpmtest` | ✅ cade P (fondo 28,32,41) | 53 s |
| `griglia-mobile` | ✅ contrasto sotto soglia **0/1771** a 360-430 px (come tappa 3); overflow 0 | — | 215 s |
| `design-system` | ✅ | — | 1 s |
| `career-critical` | ✅ PASS | — | 662 s |
| `test:logic` | ✅ 43/43 | — | 3 s |
| `save-compat` | ✅ 12/12 | — | 11 s |
| `barra-360-72` | ✅ spazio minimo 25,8 px a 360 (soglia 15 invariata) | ✅ col **criterio nuovo** del solo rosso (§2): con `__CPM_NO_BARRA72` 25,8 → 20,6 px. Primo giro della catena **rosso**, come previsto: «il difetto di prima non si vede» (viveva solo sulla barra a 7 voci dietro `__CPM_NO_V2`) | 62 s |
| `motore-unico` (1 partita per braccio, per l'interruttore rinominato) | ✅ PASS | ✅ con `__CPM_NO_MOTORE2` i gol tornano dal microsim | 183 + 177 s |

`griglia-mobile` riscrive le foto versionate di `docs/collaudo-grafico/g0/`: ripristinate dopo il giro (come nella tappa 3). Dichiara
«NON misurato: prepartita: playMatch → nomatch» con uscita 0: stesso totale di testi misurati della tappa 3 (1771), quindi la copertura
non è cambiata; non posso confermare da qui da quando il prepartita non sia raggiunto.

**Non lanciati**: gate 14/14 (`validate-situations`), `partita-vera`, `replay`, catena `completa`/`notte` intera via `ci-runner`, guardiani
del motore oltre a `motore-unico` (il motore non è stato toccato: solo il nome di un interruttore). Per la promozione su `main` resta da
scegliere la catena: secondo la direttiva PO 22/09 questa tappa tocca grafica, ma tocca anche `src/15` (partita) → nel dubbio, la completa.

## 6. Foto (`docs/sviluppo/foto-v2-tappa4/`)

`prima-*` (build 76b04b4a) e `dopo-*` per Home, Carriera, Ufficio, Partita 2D, Highlight in scelta, Post partita a **360** (1×) e **1440**
(scala 0,5), PNG a 128 colori. Strumento: `npm run foto-v2-tappa4` (`CPM_FOTO_PREF`, `CPM_FORMATI`, `CPM_SCHERMI`, `CPM_TEMA_ROSSO=1` per
vedere il tema di prova). Le coppie coincidono salvo il post partita (testate leggibili) — le pagelle PC non sono nella vista fotografata.

## 7. Non fatto / da segnalare

- **Preesistente, non toccato** (layout, non tema): a **360 px** il nome del club nella testata compatta va a capo **dentro la parola**
  («FC SALERN / UM», foto `prima-home-f360` e `dopo-home-f360` identiche). Da sistemare in una tappa di layout.
- **Testate nel colore del giornale** anche in altri due punti non misurati qui (`src/18` finestra dell'intervista, `src/17` elenco dei
  giornalisti): stesso difetto potenziale, stesso rimedio (`legCol944`), non applicato per restare nell'ambito.
- Sonde storiche con un'opzione «tema scuro» ormai senza senso: `home-066` e `analisi-217` (`CPM_TEMA=scuro` usa `TH_DARK`/`TH_LIGHT_ORIG`,
  che non esistono più: l'opzione non fa più nulla, i loro percorsi di default sono invariati), `foto-v2-tappa3` (`CPM_FOTO_ROSSO`).
  `tavolozza.mjs` aggiornato a leggere `TINTE`+`TH`.
- `GAME_VERSION`, riga di `docs/governo/ROADMAP.md`, promozione su `main`: alla sessione che promuove.
- `CLAUDE.md`: una riga d'invariante («un tema solo»; il rosso grafico si fa alterando i token dal banco).
