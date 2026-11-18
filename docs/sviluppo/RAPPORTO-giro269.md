# Rapporto giro 269 — controlli rossi della zona Home, Club, grafica, difficoltà (lotto 7.999.197)

Ramo `sviluppo/giro269-club-home-grafica`, partito da `lavoro/197` (9ad0bd6). Decisione PO 18/11 08:20: «Riparali tutti, in
parallelo». `GAME_VERSION` non toccato. **Nessun file di `src/` toccato** (quindi niente build, check-src né mappa mirata: la mappa
di `ci-runner.mjs` si applica ai file `src` toccati, e qui sono zero).

Misure con `CPM_CHROME=/opt/pw-browsers/chromium`, uno alla volta. La 7.999.196 pubblicata = commit `3076a1b7` su `main`
(in un worktree a parte, stessi `node_modules`). Registri delle corse nella cartella di lavoro della sessione (non nel repo).

## Tabella

| controllo | prima su 196 | prima su 197 | dopo | dove nasce il rosso | cosa ho fatto |
|---|---|---|---|---|---|
| `ritratto-171-72` | **rosso** (verde home: ritratto assente) | **rosso** (idem) | **verde 2/2**, rosso (volti negati) visto 2/2 | prima della 196: rosso anche su 7.999.186 (`341bf752`) e 190 (`6e995b91`); era verde al giro 72 (7.999.173-174, foto `docs/sviluppo/foto-giro72/`). Causa: V2 tappa 2, «testata compatta» (decisione PO 02/11): il ritratto è uscito dalla testata | controllo adeguato alla decisione |
| `grafica-v2` | **verde** | **rosso** in 4 formati: «club: anelli fiducia/popolarità mancanti» | **verde 3/3** (2 corse dopo la modifica + 1 finale), rosso dei token visto 3/3, rosso nuovo `CPM_ROSSO269` visto 2/2 (4 formati su 4) | nella 197, giro 235 (PO-458/PO-391: gradini al posto degli anelli) | controllo adeguato alla decisione |
| `difficolta-156` | **rosso** 11/20 celle | **rosso** 9/20 celle (rosso `--rosso` visto: 5/20) | **rosso, non toccato** | nato nella 7.999.191, giro 158 (PO-360) — vedi sotto | serve una scelta del PO (dubbio 1) |
| `test:logic` | — | — | verde 51/51 | | |
| `save-compat` | — | — | verde 12/12 | | |

## 1. ritratto-171-72 (ritratto dell'eroe assente in Home)

**Misura.** Su 197 e su 196 la Home non ha nessuna immagine di volto (`img dei volti 0`); creazione e Carriera › Profilo sono
buone. Stesso esito sulla 7.999.186 e 190. Al giro 72 il ritratto stava nella testata (31×45 px, foto del giro 72).

**Causa.** V2 tappa 2 (decisione PO 02/11 «Testata compatta»; `RAPPORTO-v2-tappa2.md`, tabella «prima nella testata → ora»: «ritratto
che apre la figurina completa → la figurina piccola della card dell'eroe è ora un pulsante che apre la stessa figurina completa»).
La figurina piccola (`FiguraV2`, src/11) mostra OVR e ruolo, non il volto; il volto è nella figurina completa. Il gioco fa quello che
la decisione dice: è il **controllo** rimasto alla testata di prima.

**Correzione del controllo.** In Home tocca `[data-cpm="figurina-testata"]`, aspetta `[data-cpm="figurina-completa"]` e giudica lì
il volto con la stessa misura (caricato, ≥ 24 px, dentro lo schermo). Se il pulsante o la figurina completa mancano è rosso
(«non apribile dalla Home»). Rosso di strumento invariato (richieste dei volti negate → ritratto assente nelle tre schermate).
Dopo: Home 262×249 px, `volto-0009.webp` caricato; verde 2 volte di fila, rosso visto entrambe le volte.

## 2. grafica-v2 (Club: anelli fiducia/popolarità mancanti)

**Misura.** 196 verde, 197 rosso in tel/tabv/tabo/pc. Il codice di src/18 disegna gli anelli (`club-anelli-v2`) solo sotto
`__CPM_NO_G235`; altrimenti `gradini235-club` con due `GradiniV235` (fiducia, popolarità).

**Causa.** Giro 235 (in `lavoro/197`), voci PO-458 (14/11, «fiducia e popolarità con la stessa forma») e PO-391 (13/11, «popolarità e
fiducia a gradini, non a barra»). Il controllo pretendeva ancora gli anelli.

**Correzione del controllo.** Il Club pretende esattamente i due gradini `fiducia,popolarita` (nessuna soglia cambiata). Nuovo
braccio `CPM_ROSSO269=1` (gioco con `__CPM_NO_G235`, cioè gli anelli): passa solo se la misura dei gradini cade in **ogni** formato;
aggiunto allo script npm dopo il rosso dei token. Decisione citata in `DECISIONI.md` (18/11, giro 269).

## 3. difficolta-156 (curva fuori bersaglio)

**Misura (40 carriere × 2 stagioni, eroe neutro).**

| build | celle dentro | note |
|---|---|---|
| 7.999.186 `341bf752` | 20/20 | |
| 7.999.190 `6e995b91` | 20/20 | |
| `b612935c` (lavoro/191 prima dell'unione del giro 158) | 20/20 | |
| `3e832460` (unione `sviluppo/giro158-simulate`) | 10/20 | **qui nasce** |
| 7.999.191 `30e67ca9` | 7/20 | |
| 7.999.193 `2bd80d9e` | 10/20 | |
| 7.999.196 `3076a1b7` | 11/20 | |
| lavoro/197 | 9/20 | rosso `--rosso`: 5/20, visto |
| lavoro/197 con `__CPM_NO_G158` (tutto il giro 158 spento) | **20/20** | attribuzione |
| lavoro/197 con il solo `__CPM_NO_G158O` (occasione spenta, voto dal motore acceso) | 16/20 | fuori: voto/minuti/titolarità in gavetta, voto in declino |

(I passaggi con `__CPM_NO_G158*` usano una copia temporanea della sonda con i flag dall'ambiente, cancellata; il controllo nel repo
non è cambiato.) Su lavoro/197: gavetta voto 6,29 (bersaglio 6,0), minuti 63 (55), titolare 56% (45); affermazione voto 6,76 (6,4), gol
0,39 (0,30), vittorie 55% (45), titolare 88% (75); elite gol 0,58 (0,50); declino voto 6,67 (6,3), vittorie 54% (45), titolare 70% (60).

**Causa.** Le due metà del giro 158, entrambe decisioni PO 11/11 su PO-360 («C, pagella del motore» per il voto delle simulate;
occasione simulata dell'eroe come giocata da gol, squadra simulata più forte): voti, gol e vittorie delle partite simulate salgono, e
con voti più alti il mister fa giocare di più. Il controllo misura proprio carriere **simulate**: i bersagli A di PO-156 sono stati
fissati prima di PO-360. Il gioco fa quello che PO-360 ha deciso; il controllo dice quello che PO-156 ha deciso. Cambiare i bersagli
vorrebbe dire spostare soglie; cambiare il gioco vorrebbe dire disfare PO-360. **Non ho deciso: dubbio 1.**

## Controlli eseguiti

`ritratto-171-72` (verde 2/2 + rosso), `grafica-v2` (verde 3/3 + due rossi), `difficolta-156` (verde rosso, `--rosso` visto),
`test:logic` 51/51, `save-compat` 12/12. Nessuna foto di altri giri in `docs/` rigenerata (stato git pulito dopo le corse).

## Dubbi per il PO

1. **difficolta-156 contro PO-360.** Il rosso nasce dal giro 158 (7.999.191) e sparisce del tutto spegnendolo. Possibili strade (non
   scelte): (a) bersagli A di PO-156 rifissati per le carriere simulate dopo PO-360 (vuol dire cambiare i bersagli: decisione del PO,
   non della sessione); (b) il controllo misura la curva su un altro percorso (carriere giocate) che oggi non esiste e costa molto;
   (c) correggere il gioco perché le simulate tornino nella curva, cioè rivedere in parte PO-360 («C, pagella del motore» e
   l'occasione da gol). Fino alla scelta il controllo resta rosso nella mappa di src/18.
2. **Ritratto in Home.** Ho seguito la tabella della V2 tappa 2: in Home il volto si vede solo toccando la figurina (la figurina
   piccola mostra OVR e ruolo). Se il PO voleva il volto visibile in Home senza tocco, è un difetto del gioco (non di questo controllo)
   e va chiesto un giro.
3. Il controllo `ritratto-171-72` in Home misura ora la figurina completa (262×249 px), non più una miniatura: il «≥ 24 px» resta
   la stessa soglia, ma su un oggetto diverso. Lo dichiaro perché cambia cosa si guarda, non quanto.
4. Il rosso del ritratto risale almeno alla 7.999.186; non ho misurato release per release fra 174 e 186 (la causa si legge nel codice
   e nel rapporto della V2 tappa 2, lotto 179).
