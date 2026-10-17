# Rapporto giro 56 — PO-279 «statistiche d'inizio partita»

Ramo `sviluppo/statistiche-279-giro56`, da `lavoro/172-base` (7.999.171). La versione non cambia sul ramo (la mette la sessione di rilascio all'unione, come nei giri precedenti).

## La richiesta

Sulla foto della partita 2D al minuto 0 (`docs/governo/foto/po279-punto-forte.jpg`, ramo `poc/marioprada-character-system`) col riquadro «Il punto forte di Vairo · Posizionamento 93»:

> «Cambia statistiche ad ogni partita altrimenti è ripetitivo e devono essere più interessanti, ad esempio 10 gol, 4 assist, 100 presenze, gioca con la sua ex squadra dove ha collezionato 20 gol in 50 presenze ecc ecc»

## Dove nasce il riquadro

`src/15-live-match.jsx`, `schedeAttesa241` (giro 20, PO-241): le schede che coprono l'attesa dei corpi. A cronometro fermo l'ordine era sempre lo stesso — nome/età/valutazione, **punto forte** (la statistica più alta, che cambia di rado), piede, numeri di stagione, portieri, centravanti — e la rotazione (`att241`, ogni 3,2 s) ripartiva da zero a ogni partita.

## Misura prima (rosso `__CPM_NO_STAT279`, 20 partite di carriera vere)

Guardiano `stat-279`: gli handler veri di `__CPM_CAREER` giocano 20 partite di lega; prima di ognuna si legge il salvataggio e si chiedono al gioco le schede del riquadro.

| | prima (rosso) | dopo (verde) |
|---|---|---|
| frasi di testa distinte | **2/20** | **19/20** |
| testa uguale a una delle ultime 3 partite | **18** | **0** |
| «Il punto forte» nel riquadro | 20/20, **stessa frase 20 volte** | 0/20 (resta solo come ripiego) |
| fatti forti in testa (ex squadra, traguardi) | 0 | 7 |
| numeri non coerenti col salvataggio | — | **0** |

Le 2 frasi di testa del rosso sono «Marco Vairo · 24 anni · valutazione 78/83»: la valutazione cambia una volta in 20 partite.

## Cosa cambia

**Catalogo `fatti279`** — solo dati del salvataggio, e ogni fatto porta i suoi numeri in `n`:

| tipo | da dove | esempio misurato |
|---|---|---|
| `ex` ex squadra | `history` con quel club, escluso l'attuale | «Contro la sua ex squadra · 20 gol e 9 assist in 50 presenze con la maglia del FC Goldwald» |
| `trag_gol` traguardo gol (≤3) | `totalGoals` | «A 2 gol dai 100 in carriera · Vairo è a quota 98» |
| `trag_pres` presenza tonda | `totalMatches` | «Può essere la presenza numero 100 · in carriera per Vairo: finora 99» |
| `trag_ass` traguardo assist (≤2) | `totalAssists` | «A 1 assist dai 50 in carriera · Vairo ne ha serviti 49» |
| `trag_stag` doppia cifra in stagione (≤2) | `goals`, `matches` | «A 2 gol dai 10 in stagione · …» |
| `striscia` / `digiuno` | `matchHistory` | «Senza gol nelle ultime 4 partite · l'ultimo contro FC Leipzig» |
| `andata` / `avversario` | `matchHistory` con quell'avversario | «All'andata contro FC Friburgo · voto 5,5» |
| `nazionale` | `nationalCaps`, `nationalGoals` | solo nelle gare di Nazionale |
| `club` | `history` col club attuale + stagione | «Con la maglia del FC Werkstadt · 17 gol in 41 presenze, 2ª stagione» |
| `carriera`, `stagione`, `voto`, `ultima` | totali e `matchHistory` | «In carriera · 97 gol e 48 assist in 102 presenze» · «L'ultima volta, contro FC Augsburg · voto 6» |

Il punto forte compare **solo se il catalogo è vuoto** (provino o primo giorno: misurato in `attesa-241`, dove il giocatore del provino non ha storia e il riquadro mostra ancora «Il punto forte di 2 · Tiro 69»).

**Scelta `scegli279`, senza memoria nuova** (la carriera si legge, non si scrive): si ricostruiscono dal salvataggio i tre stati prima delle ultime tre partite (si tolgono le righe finali di `matchHistory`, si sottraggono i loro gol/assist/presenze) e si scartano i testi già disponibili allora. Fra i freschi vince il fatto più forte (ex 100 · traguardi 88-95 · striscia 75 · andata con gol 70); altrimenti uno dei primi tre col seme della partita (`hashStr(nome|avversario|stagione|settimana|presenze)`). Nessun `Math.random`. Le altre schede seguono, prima le fresche.

## Limiti dichiarati

- `matchHistory` è **stagionale** (si azzera al cambio stagione): striscia, andata, voto e confronto con l'avversario parlano solo della stagione in corso, e lo dicono nel testo. Per lo stesso motivo **non c'è «prima volta contro…» né «prima volta in quello stadio»**: il salvataggio non lo può provare.
- Il «record contro l'avversario» è quindi stagionale («Vairo contro X in stagione»), non di carriera. Non posso confermare un dato di carriera per avversario: non è salvato.
- Lo stato «indietro» è ricostruito: coppe ed europee giocate dal vivo non sempre entrano in `matchHistory`, quindi può essere approssimato. Tocca solo il filtro di freschezza, mai i numeri mostrati.
- Le voci di `history` sono per stagione e attribuite al club di fine stagione (stessa sorgente della riga «Il ritorno da ex» della prepartita, 7.313).

## Guardiano e interruttore

- Rosso: `window.__CPM_NO_STAT279` → schede del giro 20.
- `npm run stat-279` (`tests/visual/stat-279.mjs --guardiano`), nella MAPPA di `ci-runner.mjs` sotto `src/15-`. Giudica: teste distinte ≥ 0,7 · 0 teste ripetute nelle ultime 3 · **0 numeri incoerenti** (ogni numero di ogni fatto ricalcolato nel guardiano con codice indipendente dal salvataggio; ogni numero del testo deve stare fra quelli) · almeno un fatto forte in testa · «punto forte» mai in testa · 0 pageerror. Rosso: FAIL (varietà 2/20, 18 ripetute, nessun fatto forte).
- `tests/visual/stat-279-foto.mjs`: strumento di collaudo (non guardiano) per la foto del riquadro in una partita di carriera vera (GLB acceso, `.glb` rallentati per far comparire l'attesa).

## Foto

- `docs/sviluppo/foto-giro56/dopo-ex-squadra.png` — partita 2D al minuto 0 contro la ex squadra: «Contro la sua ex squadra · 20 gol e 9 assist in 50 presenze con la maglia del FC Goldwald».
- `docs/sviluppo/foto-giro56/prima-rosso.png` — stessa partita col rosso: «Marco Vairo · 24 anni · valutazione 83».

## Verifiche eseguite sul ramo

Catena scelta: la modifica tocca solo il testo del riquadro d'attesa (nessun motore, nessuna carriera scritta).

- `check-src`: identico byte per byte.
- `stat-279` verde (sopra) e rosso FAIL come atteso.
- `test:logic` 43/43 · `save-compat` 12/0 · `typing-shortcuts` PASS · `design-system` OK · `attesa-241` verde (vecchia scritta 0/2).
- `career-critical`: vedi sotto.
