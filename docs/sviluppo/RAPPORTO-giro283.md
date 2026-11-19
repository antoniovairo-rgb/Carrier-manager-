# Rapporto giro 283 — schermate-97, misura D14 (PO-539)

Base: `lavoro/197` a `ef47b027` (versione 7.999.197, GAME_VERSION non toccata). Ramo: `sviluppo/giro283-schermate`.
Toccati solo `tests/visual/schermate-97.mjs` (riparazione) e `tests/visual/misura-283.mjs` (strumento di misura, non guardiano). `src/` non toccato. Soglie invariate (luminosità 40, neri 50%).

## In breve

- **Era la sonda, non il gioco.** Il gioco dichiara lo stacco nero con **due** segnali, la sonda ne guardava **uno**.
- **Riparata:** 4 corse verdi di fila, braccio rosso riconosciuto (le 4 misure D14 cadono a luminosità 0,0 · neri 100%).
- **Limite onesto:** nelle 4 corse verdi la sonda non ha mai dovuto rifare una foto («0 foto rifatte»). La riparazione è stata quindi
  provata dalla misura e dal ragionamento, non da una corsa in cui la vecchia sonda sarebbe caduta. Il difetto della 197 era una
  corsa fra tempi (2 su 5): 4 verdi non bastano a dimostrare che non torni. Vedi i dubbi.

## Misura (prima di toccare)

`misura-283.mjs` ripete la misura D14 e registra con lo stesso orologio della pagina (`performance.now`) tre cose: quando
`__CPM_CUTLIVE` è vero, quando il div nero dello stacco (`blackCut`, `src/15` r. 12085) è nel DOM, inizio e fine di ogni foto.
4 giri, telefono 412x915 (D14 si misura solo nel formato `tel`):

| giro | `__CPM_CUTLIVE` vero | div nero ancora nel DOM dopo che `__CPM_CUTLIVE` è falso | durata di una foto |
|---|---|---|---|
| 1 | 338 ms | 258 ms | 750–827 ms |
| 2 | 370 ms | 188 ms | 723–821 ms |
| 3 | 329 ms | 197 ms | 711–817 ms |
| 4 | 397 ms | 204 ms | 616–835 ms |

Cosa dice:

1. `__CPM_CUTLIVE` vale per `max(300, dur)` = 340 ms dal timbro (effetto React su `cutFx`, `src/15` r. 5386). Il div invece viene
   tolto da un `setTimeout(dur+80)` più il giro di React: resta nel DOM **188–258 ms dopo** che il timbro dice «finito».
2. La sonda spegne tutte le animazioni (`*{animation:none!important}`, per foto stabili). Quindi il div, che nel gioco vero sfuma con
   `@keyframes blackCut`, sul banco è **nero pieno per tutta la sua vita**. Una foto catturata in quei ~200 ms dà proprio
   «luminosità 0,4 · neri 99%» con «0 foto rifatte», cioè la riga dei due rossi della 197.
3. Una foto (`page.screenshot`) dura 616–835 ms, **più di uno stacco intero** (~550 ms di div). Il vecchio controllo «stacco vivo
   prima della foto / vivo dopo» non vedeva uno stacco nato e morto durante la foto.
4. Nei 4 giri di misura le foto sono uscite tutte chiare: in giro 2 e giro 4 la foto è **partita con il div ancora nel DOM**
   (6439 contro 6563, 6416 contro 6553) e si è salvata solo perché la cattura vera è avvenuta più tardi. È la corsa che a volte si perde.

## Riparazione (solo la sonda)

- Lo stacco dichiarato è ora `__CPM_CUTLIVE()` **oppure** il div `blackCut` del gioco presente nel DOM.
- Prima di ogni foto si aspetta che siano spenti **tutti e due** (tetto 8 s invariato: oltre è fallimento).
- Un registro in pagina (MutationObserver sull'aggiunta del div + lettura dei due segnali a ogni fotogramma e ogni 5 ms) annota
  l'ultimo istante in cui uno stacco dichiarato era vivo. Se cade nella finestra della foto (margine 30 ms) la foto si rifà.
  Più di 4 foto rifatte resta un fallimento, come prima.
- **Non scusa un nero non dichiarato:** il velo della sonda nel braccio rosso (`data-sonda="nero-277"`) non è il div `blackCut` e
  non accende `__CPM_CUTLIVE`, quindi resta giudicato. Verificato: rosso riconosciuto, 4 misure su 4 cadute.

## Prima / dopo

| | prima (197, sonda del 277) | dopo (197, sonda del 283) |
|---|---|---|
| schermate-97 verde | **rosso 2 su 5** («✗ D14 +150 ms: fase ceremony, luminosita' 0.4, neri 99%», «0 foto rifatte»; dato del giro, non rimisurato da me) | **verde 4 su 4 di fila** (D1 2 · D16 44 · D17 4 · D14 4 misure; luminosità 108,1–123,7, neri 0%) |
| schermate-97 rosso (`CPM_PROVA_ROSSO=1`) | riconosciuto | riconosciuto: cadono D1, D16, D17 e le 4 misure D14 (luminosità 0,0 · neri 100%) |
| segnali di stacco letti | 1 (`__CPM_CUTLIVE`) | 2 (`__CPM_CUTLIVE` + div `blackCut`), più registro durante la foto |
| stacco nato e finito durante una foto | non visto | visto (foto rifatta) |

Altri controlli (in `tests/visual`, `CPM_CHROME=/opt/pw-browsers/chromium`, uno alla volta):

| controllo | esito |
|---|---|
| `npm run test:logic` | 51 pass · 0 fail |
| `npm run save-compat` | 12 pass · 0 fail |
| foto in `docs/` rigenerate | nessuna (`git status` pulito dopo le corse) |

Non eseguiti, come da consegna: highlight-95, ingresso-206, career-critical, `ci-runner.mjs mirata`. CPM_FORMATI=tel non serve a parte:
D14 si misura già solo nel formato telefono.

## Dubbi per il PO

1. **(dubbio 3 del 277, ancora aperto) Lo stacco nero di 340 ms all'ingresso in cerimonia è voluto?** Lo chiede il ciclo 3D
   (`onCutNeeded`, regola 7.471) quando la camera salta alla cerimonia; c'è anche sulla 196. D14 nasce da una foto del collaudo con
   lo schermo nero al fischio finale. Se quel nero è il difetto della foto, D14 va riaperto come difetto del gioco e la sonda non deve
   più scusare lo stacco. Oggi la sonda lo tratta come regia voluta (regola 7.504). Decide il PO.
2. **Nel gioco vero lo stacco sfuma, sul banco è nero pieno.** Il div vive ~550 ms; con le animazioni accese è nero pieno solo fra il
   18% e il 52% (`@keyframes blackCut`). La sonda spegne le animazioni, quindi sul banco il nero è più lungo di quanto vede il
   giocatore. Non cambia la riparazione, ma vale se si vuole usare D14 per giudicare quanto pesa quel nero.
3. **Il div resta nel DOM 188–258 ms dopo il timbro `__CPM_CUTLIVE`.** Altre sonde che si fidano solo di `__CPM_CUTLIVE` (per
   esempio i check dei salti di camera, regola 7.504) hanno la stessa finestra scoperta. Non le ho toccate (fuori ambito).
4. **La riparazione non è stata vista lavorare.** In 4 verdi le foto rifatte sono state 0: l'attesa dei due segnali prima della foto è
   bastata ogni volta. La regola «un instabile visto due volte si ripara» è applicata con misura e ragionamento; la conferma vera
   arriverà dalle prossime corse della catena (un rosso D14 con «0 foto rifatte» sarebbe un caso nuovo, non questo).
5. `misura-283.mjs` resta nel repo come strumento (non è in `package.json` né in `ci-runner`). Se il PO preferisce non tenerlo, si toglie.
