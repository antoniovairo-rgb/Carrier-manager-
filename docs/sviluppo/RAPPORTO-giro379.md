# Rapporto giro 379 — residui PO-658 (da PO-190) e PO-659 (da PO-214)

**Base:** `lavoro/201` punta 8543a9cc (7.999.215 + giro 364). **Ramo:** `sviluppo/giro379-residui`.
**Decisione PO 25/11:** prima si verifica se si vede ancora; se non si riproduce si chiude con la misura che lo dimostra.
GAME_VERSION e `docs/governo` non toccati.

## 1. Regole di giudizio (scritte prima della misura, in testa a `tests/visual/residui-379.mjs`)

Banco: salvataggio `fixtures/save-190-s12-ovr93.json` (S12 W38, OVR 93, club di prestigio 96: produce goleade). Ogni gara passa
dalla stessa `simulateAndAdvance` del tasto «Simula» (`__CPM_CAREER.step()`); i tornei della Nazionale si simulano col tasto loro
(`__CPM_SIM_NAT=1`). Percorso: la S13 intera a Merseyside → trasferimento vero a S14 W6 (offerta di `generateTransferOffer` +
`acceptTransfer`) → «Simula» sulla prima gara col club nuovo → il resto della S14 e la S15 intera al club nuovo. Semi diversi
per costruzione: il seme della simulata è club + stagione + settimana (`standingsSeed`), il nome dell'eroe non lo cambia.

**A · PO-658** (ogni gara simulata dell'eroe nello storico, dalla S13):
- A1 gol ≥ 0, assist ≥ 0, gol + assist ≤ gol della squadra dell'eroe;
- A2 chi ha giocato (non infortunato/squalificato/non convocato/svincolato) ha un voto in [4, 10];
- A3 goleada (scarto ≥ 3): vinta → voto ≥ 6,0; persa senza gol né assist dell'eroe → voto ≤ 6,5;
- A4 goleada vinta con doppietta o più → voto ≥ 7,0;
- A5 almeno 8 goleade giudicate, altrimenti NON GIUDICATO (= rosso).

**B · PO-659:** B1 al «Simula» si apre la sala stampa con la presentazione (le risposte dei tre toni) e la settimana non è ancora
avanzata; B2 rispondendo (domanda, rilancio) e chiudendo la prima pagina la gara si simula (storico +1, settimana +1); B3
`presentedClub` = club nuovo e in Home non c'è più il riquadro «Presentazione · <club>».

## 2. PO-658 — si riproduce? **SÌ, raramente, e con una sola causa: l'eroe espulso**

Le prime tre corse sul banco (A1–A4 come scritte) non lo hanno visto; la quarta, dentro `ci-runner giro`, sì:

| Misura | Gare simulate | Goleade (vinte/perse) | Violazioni A1–A4 |
|---|---|---|---|
| codice della base (prima di ogni modifica) | 129 | 23 (22/1) | 0 |
| dopo la correzione B, braccio verde | 129 | 38 (35/3) | 0 |
| dopo la correzione B, dentro `ci-runner giro` | 130 | 34 (30/4) | **1** — coppa S15 W9, 4-0, eroe 1 gol, **voto 5,9** |

Causa misurata con la sonda `tests/visual/misura-379.mjs` (non guardiano): 5.000 simulate dell'eroe del salvataggio S12 contro tutti
gli avversari della lega (semi, settimane, casa/fuori diversi) → **1.272 goleade vinte, 1 con voto < 6 (0,08%)**, e quella ha
l'**eroe espulso** dalla stessa esecuzione del motore: pagella del motore 4,8 (0 tiri, 0 gol, 1 rosso), tabellino registrato
2 assist (estrazione separata, `_pSimStats`), voto finale 5,6, a schermo «3-0 · 2 assist · voto 5,6» **senza la causa**. Il
rosso arriva al giocatore solo 2 s dopo, e solo se fa scattare la squalifica. Espulsioni dell'eroe: 3 su 1.500 simulate.
Istogramma dei voti delle goleade vinte (5.000): 5,5:1 · 6:35 · 6,5:264 · 7:229 · 7,5:308 · 8:294 · 8,5:130 · 9:11.
Il voto della simulata è costruito dalla pagella del motore senza i suoi gol, più i gol e assist registrati (`votoSimEroe`, giro
158): fuori dall'espulsione voto e tabellino contano gli stessi gol. Il difetto d'origine dal vivo (pagella 2 gol, registrato 1,
giro 67 §3) è stato corretto nel giro 75 ed è guardato da `pagella-75`.

**Correzione alla sorgente (`src/10-folla-stadi-ritiro.jsx`):** `_pSimStats` porta l'espulsione dell'eroe decisa dal motore
(`sim.cart310.r`, giro 310) nel tabellino (`esp:true`, nessun sorteggio in più), e `_heroSimLine` la scrive accanto al voto:
«· 2 assist · espulso · voto 5,6». Vale per tutti i toast delle simulate che usano la riga dell'eroe (lega, coppa, Europa, Nazionale,
amichevole). Nessun campo nuovo nel salvataggio (`esp` vive solo nel tabellino del momento, che non si salva). Il voto non cambia:
un espulso sotto il 6 in una goleada vinta è una pagella calcistica, l'incoerenza era non dire perché. Rosso `__CPM_NO_G379A`.

**⚠️ Regola ritoccata DOPO la misura (dichiarato, decisione del PO al §7):** A3 («goleada vinta → voto ≥ 6,0») ora vale per chi
finisce la partita; l'eroe espulso (testimone `__CPM_CART310` della stessa stagione e settimana) ne è escluso, e in cambio vale
**A6** (la riga dell'eroe espulso dice «espulso»: catena vera motore → tabellino → riga sulla simulata n. 348 della sonda). Soglie
invariate. Limite: se nella stessa settimana ci sono due gare e l'espulsione è nell'altra, la gara viene esclusa per errore
(due gare in una settimana sono rare; non misurato).

## 3. PO-659 — si riproduce? **SÌ** → corretto

**Prima** (codice della base; è anche il braccio rosso `__CPM_NO_G379B`): trasferimento a FC Islington, «Simula» → nessuna sala
stampa (0 risposte a schermo), settimana avanzata e gara nello storico, `presentedClub` ancora `liv` (club vecchio), riquadro
«Presentazione · …» ancora in Home dopo la gara.

**Correzione** (`src/18-career-app.jsx` + ricomposizione di `CARRIER-MANAGER-AV.html`):
- `simDopoPres379Ref` (accanto a `pendingMisterDiscorsoRef`);
- in `simulateAndAdvance`, dopo `openingGate()`: se c'è una gara in settimana e `presentazioneView(player)` è vera, si apre la sala
  stampa della presentazione (la stessa di «Gioca», `presIntervista214`) e la gara resta ferma;
- un `useEffect` subito dopo `simulateAndAdvance`: alla chiusura della sala stampa, se la presentazione è fatta, si simula la gara
  con le chiusure fresche (giocatore, prompt, decisione del mister); chiusa senza rispondere, il riquadro resta e il prossimo «Simula»
  la riapre;
- `__CPM_CAREER.step()` (solo banco): con la presentazione aperta da «Simula» risponde col tono equilibrato e chiude, come il giocatore
  (senza, le carriere simulate del banco girerebbero a vuoto sulla stessa settimana).

Nessun campo nuovo nel salvataggio (`presentedClub` esisteva già). Deterministico: nessun sorteggio nuovo.

**Dopo** (braccio verde): trasferimento a FC Manchester, «Simula» → sala stampa con 3 risposte e settimana ferma; 2 risposte +
«Chiudi» → gara simulata (4-2, voto 8,4), settimana +1, `presentedClub` = `mcy`, riquadro sparito dalla Home.

## 4. File e funzioni toccati

- `src/10-folla-stadi-ritiro.jsx`: `_pSimStats` (campo `esp` del tabellino), `_heroSimLine` («espulso»).
- `src/18-career-app.jsx`: `simDopoPres379Ref` (nuovo ref), `simulateAndAdvance` (inizio), nuovo `useEffect` subito dopo, `__CPM_CAREER.step()` (solo banco).
- `CARRIER-MANAGER-AV.html`: ricomposto con `tools/build-src.mjs`.
- `tests/visual/residui-379.mjs` (guardiano), `tests/visual/misura-379.mjs` (sonda), `tests/visual/package.json` (script `residui-379`),
  `tests/visual/ci-runner.mjs` (riga MAPPA `src/18-|src/10-`).
- `docs/sviluppo/RAPPORTO-giro379.md`.

## 5. Guardiano `npm run residui-379`

Verde + rosso in sequenza (~55 s a braccio), riga MAPPA esistente `src/18-|src/10-` di `ci-runner.mjs`; `npm run mappa-unica` verde.
Esiti (dopo entrambe le correzioni): verde ✅ (A 0 violazioni su 26 goleade · A6 «· 2 assist · espulso · voto 5,6» · B tutto
vero), rosso ✅ (A 39 violazioni: A6 senza «espulso» + difetto provocato · B difetto di prima).
Due ostacoli della SONDA, non del gioco, risolti nella sonda: la festa del titolo S12 rimasta aperta dal salvataggio e una verifica
trimestrale lasciata aperta dalla corsa coprivano la sala stampa (il giocatore le chiude prima di poter premere «Simula»): la sonda
le chiude con `chiudi163` e «Festeggia».
⚠️ L'offerta di trasferimento viene da `generateTransferOffer` (sorteggio non seedato): il club nuovo cambia fra le esecuzioni, quindi
il conto delle goleade varia (fra 17 e 38 nelle esecuzioni fatte); la soglia di copertura (8) non è mai stata vicina.

## 6. Guardiani eseguiti e NON eseguiti

Eseguiti: `residui-379` (verde + rosso), `career-sim-test` (verde: 2 stagioni, 0 pageerror — **prima** della correzione in src/10,
non rigirato dopo), `mappa-unica` (verde), `node ci-runner.mjs giro residui-379` (esito in §8; la prima corsa è stata fermata
a metà dopo il rosso vero di `residui-379` e non vale).
**NON eseguiti** (li giudica il treno): gli altri guardiani della riga `src/18-|src/10-` — in particolare `presentazione-214`
(percorso «Gioca», non toccato), `salta-163`/`momento-165` (la corsa «Salta» ora si ferma sulla presentazione: è un'intervista non
settimanale, e già prima ogni intervista non settimanale la fermava), `pagella-75`, `career-invariants`, `stab-nat-trigger-test`,
`tripath-chokepoint-test`, e i guardiani delle simulate di src/10 (cartellini dei giri 310/311, curva dei gol simulati PO-156).

## 7. Dubbi per il PO (consigliata per prima, già applicata)

**PO-659 — come si comporta «Simula» alla prima gara col club nuovo:**
1. **(applicata)** Si apre la sala stampa della presentazione; chiusa, la gara si simula da sola (un solo tocco su «Simula»).
2. Si apre la sala stampa; chiusa, si torna alla Home e serve un secondo tocco su «Simula».
3. Nessuna sala stampa: la presentazione si fa da sola col tono equilibrato e resta una riga nel diario.

**PO-659 — la corsa «Salta» (salta-163):**
1. **(applicata, nessuna modifica alla corsa)** si ferma sulla presentazione («intervista»), come già su ogni intervista non
   settimanale (lettura del codice, src/18 ~1878); risposto, la gara si simula. Non misurato con `salta-163`: lo giudica il treno.
2. La corsa risponde da sola col tono abituale, come per l'intervista settimanale (giro 194).
3. La corsa salta la presentazione e lascia il riquadro in Home.

**PO-658 — l'eroe espulso in una goleada vinta:**
1. **(applicata)** Il voto resta quello della pagella (sotto il 6) e la riga dell'eroe dice «espulso» accanto al voto; la regola A3
   del guardiano vale per chi finisce la partita.
2. Il tabellino segue la pagella del motore per l'espulso (gol/assist del motore, qui 0): più coerente col motore, ma tocca la
   curva dei gol simulati tarata nei giri 69/78 (PO-156).
3. Il voto dell'espulso non scende sotto il 6 in una goleada vinta (regola A3 intatta, ma non è una pagella calcistica).

**PO-658 — chiusura:** consigliato chiuderla con la misura (fuori dall'espulsione 0 violazioni su 120 goleade in quattro corse e su
1.271 goleade vinte nella sonda) e col guardiano `residui-379`; resta fuori la verifica delle goleade giocate DAL VIVO (oggi tre
semi di `pagella-75`).

## 8. Sentinelle

`node ci-runner.mjs giro residui-379` (dopo entrambe le correzioni, build ricomposto da src/): **18/18 verdi** — residui-379 118 s ·
mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile 186 s · render-3d-023 ·
tunnel-285 · home-298 · web-237 · career-critical 351 s · battito-264 390 s · partita-vera 652 s · gk-dive-sync · schermate-97.
Nessun passo riprovato.
