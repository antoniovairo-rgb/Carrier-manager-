# Rapporto di collaudo — Korward Elite 7.999.171 (carriera, non-3D)

**Versione collaudata:** 7.999.171 (`GAME_VERSION` in `CARRIER-MANAGER-AV.html`, commit `39776cd` = `origin/main`)
**Ramo:** `collaudo/release-7.999.171-carriera`
**Ambiente:** Chromium headless (`/opt/pw-browsers/chromium`), GLB spento (`window.__CPM_GLB=false`), scene 3D non giudicate.
**Prove:** cartella `docs/collaudi/foto-release-7.999.171-carriera/` — foto PNG, `dati-sonda.json` (testo visibile per schermata, passi, errori), `sonda-collaudo-carriera.mjs` (riproducibile).

## Cosa è stato fatto e cosa NON è stato fatto

- **Fatto:** 3 settimane di calendario avanzate con gli handler veri della carriera (`__CPM_CAREER.step()`, settimana 1→4 in 8 passi); schede Calendario, Classifica, Profilo; Crediti a 412 px e 360 px; schermata carriera a 360 px; controllo overflow orizzontale.
- **Non fatto:** le partite non sono state giocate a mano (il passo è la simulazione del gioco, non il match in campo). Quindi tabellino e tabellone della partita **giocata** non sono verificati. Non ho aperto il giornale come schermata a sé: ho verificato solo l'intervista «Cronaca di Sport» che compare in carriera. Le finestre di gioco (eventi, offerte, nazionale) a 360 px **non** sono state provate una per una: PO-269 resta solo parzialmente coperto.

## Tabella di gravità

| # | Gravità | Schermata | Osservazione | Prova |
|---|---|---|---|---|
| 1 | **Media** | Crediti (412 e 360) | Il numero d'ordine CGTrader «#17876008» è visibile al giocatore. È la risposta alla domanda PO-268: **sì, ancora presente**. | `11-crediti-412.png`, `11-crediti-360.png`; testo: «Ordine CGTrader #17876008 del 20/09/2026.» |
| 2 | **Media** | Home, carriera, Crediti | La stringa tecnica «v 7.999.171» è visibile al giocatore. Il PO ha già escluso i testi tecnici dal giocatore (PO-249, sugli «fps»). Da decidere se la versione va tolta. | `10-home-412.png`, `01-carriera-inizio-412.png`; testo: «v 7.999.171» |
| 3 | **Bassa** | Crediti a 360 px | Il chip «v 7.999.171» si sovrappone al bordo in basso del riquadro, sopra la riga «DiceBear Micah». | `11-crediti-360.png` (in basso a destra) |
| 4 | **Bassa** | Carriera, dopo la settimana 3 | La riga del risultato dice «Pareggio 1–1 in trasferta vs FC Lilien **(simulata)**»: la parola «simulata» è una nota tecnica visibile al giocatore. | `s03-dopo-passo-3-412.png`; testo in `dati-sonda.json` (chiave `settimana3`) |

## Verifiche superate (con prova)

| Controllo | Esito | Prova |
|---|---|---|
| **Classifica = somma gol** (GF = GS) a ogni passo di simulazione | **Superato**: 21/21, 45/45, 65/65 | `dati-sonda.json` (passi 3, 5, 7) |
| **Classifica interna** (punti = 3V+N, differenza reti = GF−GS, ordinamento) | **Superato** sulle 18 righe della 4ª giornata | `tab_standings` in `dati-sonda.json` |
| **Calendario ↔ classifica** (WRK: 1-1, 3-0, 1-2 → 5 fatti, 3 subiti, 4 punti) | **Superato** | `tab_calendar` e `tab_standings` in `dati-sonda.json` |
| **PO-249 — nessuna scritta «fps» nelle schermate** | **Superato** sulle schermate catturate (home, carriera, calendario, classifica, Crediti). Non ho verificato la partita in 3D. | ricerca `fps` su tutto il testo visibile: 0 occorrenze |
| **PO-267 — nessun «Non posso confermarlo» visibile** | **Superato**: la frase non compare nel testo dei Crediti | ricerca in `crediti412`/`crediti360`: 0 occorrenze |
| **Errori di pagina** | **Superato**: nessun `pageerror`. Solo le note Babel «deoptimised … 500KB» (informative) | `errors` in `dati-sonda.json` |
| **Overflow orizzontale a 360 px** (carriera e Crediti) | **Superato** (`scrollWidth` = `innerWidth`) | `overflow360_carriera` e `overflowCrediti` in `dati-sonda.json` |
| **Crediti a 360 px: riquadro leggibile** | **Superato** nella lettura; scorre internamente (scrollHeight 1497 contro clientHeight 700) | `11-crediti-360.png` |
| **Intervista e scelta di risposta** | **Superato** nella lettura a 360 e 412 px; i tre toni sono leggibili | `05-carriera-360.png`, `20-tab-calendar-412.png` |
| **Nessun «undefined», «NaN», «null» o `[object …]` nel testo visibile** | **Superato** sulle schermate catturate | ricerca sul testo di tutte le schermate: 0 occorrenze |

## Non posso confermarlo

- **Tabellino e tabellone di una partita giocata a mano**: non sono stati giocati match in campo, quindi non posso confermare la coerenza tabellino↔tabellone.
- **Giornale** come schermata separata: non l'ho trovato né aperto; posso confermare solo l'intervista in carriera.
- **Modali di evento, offerte e nazionale a 360 px**: non le ho aperte una per una. Posso confermare solo i Crediti e l'intervista.
- **Schermate 3D**: fuori ambito per richiesta.

## Note di processo (non difetti di gioco)

- In `origin/main` il commit è `39776cd`; il `main` locale era fermo a `729fc8e`, quindi il ramo di collaudo parte da `origin/main`.
- `tests/visual` non ha `package-lock.json`: `npm ci` fallisce; ho usato `npm install`.
- Il gioco si carica con `?cpmtest=1` (necessario per l'harness `__CPM_CAREER`). Questo spegne alcune animazioni di presentazione: il collaudo non le giudica.
