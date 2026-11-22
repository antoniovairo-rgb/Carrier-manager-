# Rapporto giro 314 — PO-601 «nella serata di presentazione non ci devono essere tifosi ospiti»

Ramo `sviluppo/giro314-serata-tifosi`, partito da `lavoro/200` (7.999.200). `GAME_VERSION` non toccata.

## La segnalazione

Foto del PO: `docs/sviluppo/giro314/segnalazione-po.webp` (copiata da `poc/marioprada-character-system`).
«Serata di presentazione · Stagione 2»: tribuna di sinistra coi tifosi rosso/salmone, tribuna di destra coi tifosi verdi del club.

## Causa (misurata prima di correggere)

La serata (`src/16-scene-3d-cerimonie.jsx`) costruisce lo stadio con lo stesso costruttore della partita, `buildStadium(scene, homeHex, awayHex, cfg)` (`src/11`), ma:

1. come `awayHex` passava **il secondo colore del club** (`club.c2`, quello dei pantaloncini): non c'è un avversario, ma il costruttore tratta quel colore come «colore ospite»;
2. non dichiarava il pubblico, quindi valeva il ripiego del costruttore: riempimento casa 0,9 e **riempimento ospiti 0,5**.

Risultato: la Curva Nord (per costruzione «solo ospiti») e lo spicchio ospiti della Tribuna Est uscivano col secondo colore del club e mezzi vuoti. I tifosi salmone della foto non sono i colori di un'altra squadra: sono il secondo colore del club dell'eroe, messo nel settore ospiti.

## Correzione

- `src/11` `buildStadium`: nuova voce `stadCfg.soloCasa314`. Se presente: il colore ospite diventa il colore di casa, il riempimento ospiti diventa quello di casa, nessuna sagoma è marcata «ospite» (né in Curva Nord né nello spicchio Est).
- `src/16` serata: passa `soloCasa314` (spento da `window.__CPM_NO_G314` = comportamento della 7.999.200). Vale anche per il ripiego a folla dipinta (`t225.rifai` eredita la stessa configurazione).
- **La partita non passa la voce**: resta identica. `buildStadium` è chiamato solo da partita (`src/12`) e serata (`src/16`); parata, galà e le altre cerimonie non lo usano.

## Misure prima/dopo (guardiano `npm run serata-314`, GLB acceso, notte, club verde `#16a34a` con secondo colore salmone `#f87171`)

Il guardiano legge la folla a sagome che la scena ha davvero costruito (mesh `folla129`, un'istanza per tifoso) e conta per settore e per colore della maglia.

| Misura | Prima (`__CPM_NO_G314`) | Dopo | Soglia |
|---|---|---|---|
| Sagome totali | 7.297 | 7.946 | ≥ 3.000 per giudicare |
| Tifosi «ospiti» | 1.504 (20,6%) — Nord 1.293, Est 183 | **0** | verde = 0 · rosso ≥ 10% |
| Curva Nord, maglie col secondo colore | 89,5% | 2,0% | verde ≤ 5% · rosso ≥ 30% |
| Curva Nord, maglie col colore del club | 1,6% | 90,2% | verde ≥ 35% |
| Riempimento Nord / Sud (occupati su posti) | 0,728 / 0,958 = 0,76 | 0,941 / 0,958 = 0,98 | verde ≥ 0,90 |

Note sulla misura:
- il 2,0% di «secondo colore» che resta è lo stesso valore della Curva Sud in entrambi i bracci (1,9-2,0%): sono vestiti qualunque di tinta vicina, non maglie di squadra;
- nel braccio rosso 28 «ospiti» risultano in «ovest» e 24 sagome della Nord non sono ospiti: è l'attribuzione del settore per posizione (angoli), non un terzo settore ospiti;
- le soglie sono state fissate dopo questa misura.

Foto a `deviceScaleFactor` 2: `docs/sviluppo/giro314/prima-serata-notte.png` e `dopo-serata-notte.png`. La camera è in punti diversi del suo giro nei due scatti (la scena è in movimento): non è un effetto della correzione.

## Controlli

- `node tools/build-src.mjs` + `node tools/check-src.mjs`: eseguiti dopo la modifica a `src/`.
- `npm run mappa-unica`: verde (il guardiano è nella riga esistente `src/18 | src/16 | src/10`, quella di `serata-261`).
- `node ci-runner.mjs giro serata-314 serata-261 pelle-240`: **20/20 verdi** su 7.999.200 (`serata-314` 29 s · `serata-261` 442 s · `pelle-240` 325 s · 17 sentinelle), nessun passo instabile, nessuna riprova. Registrato in `docs/governo/STABILITA.json`. Nota: `career-critical` è fra le sentinelle e quindi l'ha eseguito il runner; non è stato lanciato a parte. `highlight-95` e `ingresso-206` non eseguiti.

## Dubbi per il PO

1. **Riga della mappa.** La correzione tocca anche `src/11` (`buildStadium`), ma il guardiano è stato messo in una riga sola (quella della serata, `src/16`), come chiesto. Una modifica futura al solo `src/11` non lo richiama nei giri; lo gira comunque il treno sulla mappa intera.
2. **Colori della squadra in campo.** La fila dei giocatori continua a portare i pantaloncini del secondo colore (salmone nell'esempio): è la divisa, non è stata toccata.
3. **Altre cerimonie.** Nessun'altra cerimonia di club usa questo stadio (parata e galà hanno scene proprie; la cerimonia della coppa avviene dentro la partita, dove gli ospiti ci sono davvero). Non c'è quindi nulla da allineare oggi; se in futuro una festa di fine stagione userà `buildStadium`, basterà passare la stessa voce.
4. **Folla dipinta (ripiego del telefono, giro 192/225).** Passa dallo stesso punto e quindi prende la stessa regola, ma **non è stata misurata**: il guardiano giudica la folla a sagome (se la scena cade sul ripiego, il guardiano dichiara «non giudicato» = rosso).
5. **Verifica sul telefono del PO** non fatta: le misure sono sul banco (headless).
