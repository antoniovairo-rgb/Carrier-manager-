# Rapporto giro 372 — PO-421 «Giudizi che non si contraddicono» (fiducia 93/100 e «più panchina»)

Ramo `sviluppo/giro372-giudizi`, base `lavoro/201` (8543a9cc = 7.999.215 + giro 364). GAME_VERSION e `docs/governo` non toccati.

## In breve

- **Da dove viene «più panchina».** Il testo esatto è nel riquadro **«L'esame del nuovo mister»** sulla Home (`src/18`, dopo un
  esonero): «Media X nelle 4 gare dell'esame: non abbastanza. … Ti aspetta più panchina.» Il verdetto nasceva **solo dalla media
  voti** (soglia 6,6) e il riquadro **resta sulla Home finché non si preme il tasto**: nel frattempo la fiducia del mister cambia
  ogni settimana. Risultato: «più panchina» accanto alla barra «Fiducia totale». Nella griglia provocata lo stesso verdetto usciva
  con fiducia 72, 86 e 93.
- **La regola di fondo.** Ogni testo aveva la sua soglia: barra 30/50/70/85, esame solo media voti, verifica trimestrale solo forma
  (72/55), convocazione «uomo di fiducia» da 80.
- **Correzione alla sorgente.** Una sola sorgente di soglie, `SOGLIE_FIDUCIA372=[30,50,70,85]` + `gradoFiducia372` (`src/08`). La
  barra (`GRADINI235`, `src/11`) e l'etichetta della scheda Club la usano, e i testi del mister si scelgono dallo stesso gradino.
  Tutto deterministico, nessun campo nuovo nel salvataggio.
- **Prima → dopo** (stessa sonda, bracci rosso/verde): carriere simulate **14 → 0** contraddizioni, griglia provocata **134 → 0**.

## Come ho misurato

Sonda e guardiano `tests/visual/giudizi-372.mjs`. Legge i testi dalle funzioni **vere** del gioco con un gancio di solo collaudo,
`__CPM_CAREER.giudizi372(o)` (`src/18`, solo `?cpmtest=1`): esame (`sackView` + `esame372`), convocazione (`calcCoachDecision`),
verifica trimestrale (`pickCoachReview`, la fascia dalla forma come nell'handler) con le sue tre risposte, voce della settimana
(`pickCoachWeekMsg`). Il giudice è **indipendente**: riconosce le frasi con espressioni sue, non con le liste del gioco.

| regola | testo | barra che lo smentisce |
|---|---|---|
| T- | sfiducia/panchina («più panchina», «ti ho tolto dai titolari», «un ragazzo della Primavera…», «ti sto valutando», «qualcuno davanti a te») | fiducia ≥ 70 (Fiducioso / Fiducia totale) |
| T+ | fiducia piena («il posto è tuo», «nostro faro», «uomo di fiducia», «ripagare la fiducia») | fiducia < 50 (In crisi / In dubbio) |
| T* | «uomo di fiducia · titolare inamovibile», «nome per primo» | fiducia < 85 (non «Fiducia totale») |
| F- / F+ | «appannamento», «non è il tuo livello» / «forma straordinaria» | forma ≥ 72 / forma < 55 |
| R | risposta «Mi dia una chance da titolare» | scheda: titolare o leader |

Due misure:
- **N, carriere simulate** con gli handler veri (`step()` di `__CPM_CAREER`), giudizi letti ogni settimana. Misura larga: 4
  carriere × 3 stagioni (12 stagioni chiuse, circa 800 settimane per braccio, club diversi, fiducia iniziale 45–80). La «verifica»
  viene calcolata ogni settimana (cosa direbbe il mister se la verifica fosse quel giorno), non solo alle settimane 8/16/24/32.
- **G, griglia provocata**: fiducia {20…93} × forma {40…90} × settimana {8,16,24,32} × stagione {2,3,4}, più l'esame chiuso con
  media 6,0 e 7,2 su otto valori di fiducia. Serve perché l'esame nasce solo dopo un esonero e le carriere simulate lo producono
  di rado (nessuno nelle 12 stagioni).

### Prima (rosso `__CPM_NO_G372`) → dopo (verde)

| misura | prima | dopo |
|---|---|---|
| N carriere: contraddizioni | **14** (T+ verifica 11 · T* convocazione 3) | **0** |
| G griglia: contraddizioni | **134** | **0** |
| — T- verifica (sfiducia con fiducia alta) | 50 | 0 |
| — T* convocazione (soglia 80 contro 85) | 50 | 0 |
| — R risposta «chance da titolare» da titolare | 16 | 0 |
| — T+ verifica («ripagare la fiducia», «nostro faro» con fiducia < 50) | 12 | 0 |
| — T- esame («più panchina» con fiducia ≥ 70) | 3 | 0 |
| — T+ esame («il posto è tuo» con fiducia < 50) | 3 | 0 |
| F-/F+ (forma) | 0 | 0 |

Esempi del prima: «Ti aspetta più panchina» con fiducia 72/86/93; «Ho difeso le tue scelte… ripagare la fiducia» con fiducia 45
e ruolo riserva (11 volte in carriera); «Il mister ha scritto il tuo nome per primo» con fiducia 80–84, dove la barra dice
«Fiducioso».

Le regole sulla forma non hanno trovato niente: le frasi sulla forma usano già le soglie della forma. **Morale e minutaggio**: non
ho trovato testi di giudizio che li citino con una soglia propria (il minutaggio dell'offerta, 70/45, è una stima del club
offerente e non ha una barra accanto). Questi due non li giudico: lo dichiaro invece di contarli come verdi.

## Cosa cambia (file e funzioni toccate)

- `src/08-panchina-derby-meteo-cori.jsx`: nuovi `SOGLIE_FIDUCIA372`, `_g372`, `gradoFiducia372`. In `calcCoachDecision` «Sei il
  suo uomo di fiducia. Titolare inamovibile.» esce dal gradino 4 (≥ 85), non più da 80. In `fraseConvocazione190` lo stesso per
  «nome per primo sulla lavagna». La **decisione** del mister (titolare/panchina/non convocato) non cambia.
- `src/11-ui-kit-highlight.jsx`: `GRADINI235.fiducia.s` = `SOGLIE_FIDUCIA372` (stessi valori, ora una sorgente sola).
- `src/17-menu-creazione-pannelli.jsx`: `SFIDUCIA372`, `FIDUCIA_PIENA372`, `rigaAmmessa372`. `pickCoachReview` sceglie la
  battuta solo fra quelle ammesse dal gradino: le battute restano tutte nel mazzo, cambia quando possono uscire. La risposta «Mi dia
  una chance da titolare» ha una `cond` e non esce a chi è titolare o leader.
- `src/18-career-app.jsx`: `esame372` (dentro `CareerApp`, accanto a `sackView`). Restituisce testo, effetto sulla fiducia,
  diario, registro e tasto del riquadro dell'esame: quattro verdetti (sotto). `_ctLabel` della scheda Club passa da
  `GRADINI235`/`gradoFiducia372` (stesso testo di prima). Gancio di collaudo `__CPM_CAREER.giudizi372`. `data-esame372` sul
  riquadro.
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src`, `check-src` identico ai frammenti).
- `tests/visual/giudizi-372.mjs` (nuovo), `package.json` (`npm run giudizi-372`, gira verde e rosso), `ci-runner.mjs` (riga
  esistente `src/18-|src/10-` della MAPPA; `npm run mappa-unica` verde).

**I quattro verdetti dell'esame** (media come prima, soglia 6,6 invariata, più il gradino della barra **di quel momento**):

| media | fiducia | testo | effetto al tasto |
|---|---|---|---|
| ≥ 6,6 | ≥ 50 | «superato… Il posto è tuo» (come prima) | +10 |
| ≥ 6,6 | < 50 | «il campo ti dà ragione… la fiducia del mister (N/100) è da costruire: il posto non è ancora tuo» | +6 |
| < 6,6 | < 70 | «non abbastanza… Ti aspetta più panchina» (come prima) | −4 |
| < 6,6 | ≥ 70 | «sotto le attese… la fiducia del mister regge (N/100): il posto te lo giochi partita per partita» | −2 |

Fuori ambito, non toccato: decisione del mister, `calcSquadRole`, interviste, impulsi, tab Agente (lì `trustLabel` con soglie
70/50/30 è definito ma non viene mostrato), fiducia dei giornalisti (`j.trust`, è un altro numero).

## Guardiani

- `npm run giudizi-372` (verde + rosso, ~1,5 min a braccio con le impostazioni di base 3 carriere × 2 stagioni): **verde**; il
  rosso cade come deve: «più panchina» con fiducia ≥ 70 e sfiducia nella verifica con fiducia alta.
- `node ci-runner.mjs giro giudizi-372` (guardiano + 17 sentinelle): esito nella sezione «Esito del giro» qui sotto.
- `npm run mappa-unica`: verde.

**Guardiani della zona NON girati** (li giudica il treno): gli altri della riga `src/18-|src/10-` (tra cui `rinnovo-354`,
`home-335`, `club-337`, `coerenza-235`, `mister-215`, `interviste-211`, `agente-198`, `difficolta-156`, `neutro-287`), quelli di
`src/1[17]-` e `src/0[0-8]-`, `career-invariants`, `career-critical`, `save-compat`, `test:logic`. Rischio: `difficolta-156` e
`neutro-287` misurano la **decisione** del mister, che non ho toccato (cambia solo la frase); `coerenza-235` guarda i gradini, che
hanno gli stessi valori.

## Dubbi per il PO (la consigliata è la prima, ed è quella applicata)

1. **Esame mancato con fiducia alta: cosa deve dire il riquadro?**
   - **A (applicata):** verdetto «a metà». Il testo cita la media e la fiducia vera («il posto te lo giochi partita per partita»),
     effetto −2. La media resta la prova dell'esame, la barra resta la verità sulla fiducia.
   - B: chiudere l'esame da solo alla quarta gara, applicare subito l'effetto e togliere il riquadro (niente testo che invecchia
     mentre la fiducia cambia). Cambia il flusso della Home.
   - C: il verdetto lo decide la sola fiducia (≥ 70 superato, < 70 no) e la media diventa un dettaglio. Rende l'esame meno
     leggibile: «media 5,9: superato».
2. **Il mister ti fa partire dalla panchina con «Fiducia totale».** La decisione resta quella di prima (turnover, età, sorteggio
   seedato della curva PO-156) e la frase è neutra («scelta tattica»): per il giudice non è una contraddizione.
   - **A (applicata):** non toccare la decisione: la curva titolare/panchina ha guardiani suoi (PO-156/287).
   - B: con fiducia ≥ 85 la panchina solo per stanchezza (> 78) o squalifica. Cambia la curva di titolarità e va rimisurata con
     `difficolta-156`/`neutro-287`.
   - C: una frase dedicata («il mister ti stima, ma oggi fa ruotare la squadra») quando la fiducia è ≥ 85.
3. **Ruolo «in rotazione» accanto a «Fiducia totale».** `calcSquadRole` pretende anche OVR 78+ e media 6,8 per «titolare»: con
   fiducia 93 e OVR 72 la scheda dice «in rotazione». È un fatto di gerarchia, non un giudizio, e non l'ho contato.
   - **A (applicata):** lasciarlo com'è e dirlo qui.
   - B: accanto al ruolo, una riga «cosa manca per titolare» (OVR/media), come il «Prossimo gradino» del leader.
   - C: far pesare la fiducia anche nel ruolo (fiducia ≥ 85 = almeno rotazione garantita). Tocca la carriera.

## Esito del giro

(compilato a fine corsa)
