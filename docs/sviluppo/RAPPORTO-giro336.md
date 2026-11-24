# Giro 336 — pre-partita a due strade (PO-608) e classifica di fine partita già aggiornata (PO-609)

Base: `lavoro/201` (d681977). Ramo: `sviluppo/giro336-prepartita-classifica`. `GAME_VERSION` non toccata (rilascio automatico del vagone).
Rosso: `window.__CPM_NO_G336` = comportamento della 7.999.208. Guardiano: `npm run partita-336`.

## 1. PO-608 — «non si capisce che per giocare ‹normalmente› bisogna premere su vedi formazioni!»

**Prima** (`docs/sviluppo/giro336/prima-prepartita-412.png`, foto PO `200-prepartita-tasti.png`): il tasto primario era
«VEDI LE FORMAZIONI»; sotto «Analisi dell'avversario» e «Salta e gioca» affiancati; poi il riquadro «Gioca solo i momenti
salienti» (più alto del tasto primario: 82 px contro 48); in fondo «Torna alla home».

**Dopo** (`docs/sviluppo/giro336/dopo-prepartita-412.png`), in `MatchdayCard` (src/13):
1. **«Gioca la partita»**: tasto primario con la riga «Vedi le formazioni, entri in campo e giochi tutti i 90 minuti.»;
2. **«Gioca solo i momenti salienti»**, subito sotto, con la sua nota (come prima);
3. voci secondarie, più basse, in stile ghost: «Analisi dell'avversario» · **«Salta formazioni e ingresso»** (era «Salta e gioca»:
   stessa azione, partita intera senza i due passi; il nome ora dice cosa salta);
4. «Torna alla home» / «Simula la partita» invariati.

Cosa **non** cambia: i gestori sono gli stessi (`onContinue` = `handleGoToFormations`, `onSolo243`, `onSkip` =
`setPhase("playing")`), quindi i percorsi di `LiveMatch` dopo la scelta sono identici. Nessun campo salvato.

Le sonde che cercavano il tasto con l'ancora `^Vedi le formazioni` (7 sonde + `lib/partita-166.mjs`) ora accettano anche
`Gioca la partita`; le ~25 sonde con la ricerca non ancorata `/Vedi le formazioni/` continuano a trovarlo perché la riga di
spiegazione del tasto contiene quelle parole (scritta così anche perché descrive davvero il percorso).

## 2. PO-609 — «la classifica deve essere già aggiornata, non quella della settimana prima...»

**Causa misurata.** La rassegna di fine partita (src/15, scheda 4, giro 224) leggeva `player.standings`, che viene aggiornata
solo tornando alla carriera (`onMatchEnd` in src/18: `updateStandings(..., {opponentId, seed: standingsSeed(club, stagione,
settimana)})`). Nel braccio rosso del guardiano: 11 righe mostrate su 11 diverse dalla classifica che la Home mostra subito dopo
(es. «1° FC Westfalen 3 pt» contro «1° FC Frankfurt 6 pt» in Home; noi 7° 3 pt contro 6° 4 pt).

**Correzione** (`docs/sviluppo/giro336/prima-classifica-412.png` → `dopo-classifica-412.png`): in campionato la rassegna
calcola la classifica con **la stessa chiamata** di `onMatchEnd` — stesso punto di partenza, stessi punti della partita, stesso
avversario della giornata in calendario, **stesso seme** `standingsSeed(club, stagione, settimana)` — quindi gli altri campi danno
gli stessi risultati che la carriera salverà. È **solo lettura**: nulla viene salvato in quel momento, il salvataggio resta quello di
`onMatchEnd`, quindi nessun doppio conteggio (giro 321/PO-349 non toccato). Nota del riquadro: «Dopo la giornata, con i risultati
degli altri campi · questa partita: +N punti».

Stessa logica per:
- **I tuoi numeri di stagione** («Con questa partita»): gol/assist + quelli di oggi, presenze +1, voto medio con il voto di oggi
  (gli stessi incrementi di `onMatchEnd`); gli obiettivi si misurano su questi numeri e sulla posizione nuova;
- **Prossima partita**: posizione e punti dell'avversario dalla classifica dopo la giornata (`_tvTeamStat` accetta la classifica da usare).

Fuori ambito (invariati): girone europeo (`euroGroupTable`), coppe e nazionale (classifica/tabellone del giro 232), provino.

## 3. Guardiano `partita-336` (verde + rosso, nelle righe MAPPA di src/12-13 e src/15)

Gioca, non legge il sorgente. Carriera da professionista (lib partita-166), telefono **412x915**, seme 7304.
- **P** pre-partita vera: i primi due tasti della pila sono «Gioca la partita» e «Gioca solo i momenti salienti» (≥ 90% della
  larghezza, interi nello schermo); nessun «Vedi le formazioni»/«Salta e gioca»; nessun tasto secondario più alto delle due strade;
  niente scorrimento orizzontale; «Gioca la partita» porta alle formazioni.
- **F** fine partita: ogni riga mostrata (posizione, squadra, punti) = classifica della Home (`__CPM_CAREER.snapshot()` dopo il
  ritorno alla carriera, stesso ordinamento); la tua posizione e i tuoi punti; gol/assist/presenze; nota «Dopo la giornata»;
  posizione e punti del prossimo avversario.

| braccio | pre-partita | fine partita |
|---|---|---|
| verde | strade ✓ · tasti vecchi 0 · secondari più alti 0 · formazioni ✓ | righe diverse 0/10 · tu 6° 4 pt = Home · numeri = Home · avversario 15° 0 pt = Home |
| rosso `__CPM_NO_G336` | bocciato (primo tasto «Vedi le formazioni», salienti più alto) | bocciato (11/11 righe diverse, 7° 3 pt contro 6° 4 pt, «Prima di questa partita») |

Durata: ~1 min per braccio.

## 4. Catena del giro

`node ci-runner.mjs giro partita-336 career-critical salvataggio-321 testi-318 tocco-213 prepartita-287 rassegna-224`
(+ 17 sentinelle). Esito: vedi §6.

## 5. Dubbi per il PO

**D1 — Quanto devono pesare le due strade?** Oggi «Gioca la partita» è il tasto pieno e i salienti il tasto col bordo nel colore del club.
1. *(consigliata)* Così: una strada principale piena e una alternativa ben visibile, stessa larghezza, una sotto l'altra.
2. Due tasti identici affiancati (metà larghezza ciascuno): parità perfetta, ma al telefono le note non ci stanno e il testo va a capo.
3. Una domanda sopra i tasti («Come vuoi giocarla?») con due schede da scegliere e un solo «Calcio d'inizio».
4. Ricordare l'ultima scelta (PO-454): dalla seconda partita un solo tasto «Gioca come l'ultima volta» con «cambia».

**D2 — «Salta formazioni e ingresso»: tenerlo?**
1. *(consigliata)* Tenerlo come voce secondaria col nome nuovo, che dice cosa salta.
2. Toglierlo: le formazioni hanno già il loro «Salta» e l'ingresso pure (un tocco in più).
3. Spostarlo in Opzioni come preferenza «Salta sempre formazioni e ingresso» (si lega a PO-454).

**D3 — Le altre competizioni.** Il giro aggiorna «dopo la giornata» solo il campionato.
1. *(consigliata)* Lasciare così: coppe ed Europa mostrano già il tabellone/girone col risultato di oggi (giro 232).
2. Estendere anche i numeri di stagione dopo coppe/nazionale (va prima misurato cosa `onMatchEnd` conta per ciascuna).
3. Estendere il girone europeo con gli altri risultati del turno (serve la stessa garanzia di seme della lega).

**Nota a margine (non toccata):** nella foto PO c'era l'obiettivo «Finisci nei primi 6» per un club al 17° — è PO-606. Inoltre
l'obiettivo di classifica mostra ✅ quando sei nei primi 6 a metà stagione (`objDone` sulla posizione attuale): comportamento
preesistente, da decidere se mostrare «in linea» invece di ✅ finché la stagione non è finita.

## 6. Esito della catena

Commit provato: `c15a85a`. **23/23 verdi**, nessun instabile:

partita-336 ✅ 118 s · salvataggio-321 ✅ · testi-318 ✅ · prepartita-287 ✅ · career-critical ✅ 346 s · tocco-213 ✅ 272 s · rassegna-224 ✅ 295 s ·
sentinelle (mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023,
tunnel-285, home-298, web-237, battito-264, partita-vera 780 s, gk-dive-sync, schermate-97) ✅.

**Rosso trovato dalla catena e riparato:** al primo giro `prepartita-287` era rosso: il suo braccio rosso (`__CPM_NO_G287`) non vedeva più
il difetto, perché la nuova pila metteva la nota dei salienti sempre dentro il tasto. Ora, con `__CPM_NO_G287`, la nota torna staccata
come prima del giro 287 (il guardiano cade di nuovo su N, S e V). Catena rifatta da capo sul build corretto.

Limite dichiarato: il guardiano confronta la classifica della rassegna con quella salvata appena tornati alla carriera (la sorgente della
Home, invariante `standings` = `player.standings`); misurato su una partita (pareggio 1-1, giornata 2, seme 7304). Non avanza alla
settimana dopo, dove la giornata successiva cambia la classifica di suo.
