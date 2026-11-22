# Rapporto giro 325 — un gol, un marcatore (PO-377)

Ramo `sviluppo/giro325-marcatore`, partito da `lavoro/201` (= 7.999.203). `GAME_VERSION` non toccata.

## La voce

Dal collaudo del giro 173 (telefono): la riga di cronaca dice «GOL! Jung (WRK) … su assist di Vogt», il badge del
gioco e l'avviso del gol dicono Riedel. Due marcatori per lo stesso gol.

## Misura prima di correggere

Strumento: `tests/visual/marcatore-325.mjs`, su partite vere (nomi diversi = partite diverse, autoplay a seme fisso),
col testimone nuovo `window.__CPM_M325` che registra **alla sorgente**, per ogni gol ambientale: la riga risolta, il
testo dato a badge / momenti chiave / avviso, e marcatore e assist decisi dal motore. Accanto: libro mastro
(`__CPM_EV`, percorsi dei gol) e avviso apparso a schermo (`__CPM_GOL173`).

Base (= 7.999.203, braccio rosso `__CPM_NO_G325`), 8 partite a soli highlight:

| | gol | col marcatore del motore | discordanze |
|---|---|---|---|
| gol ambientali (percorso `cronaca` del libro mastro) | 8 | 8 | **7 su 8** |
| gol dell'eroe in scena (percorso `highlight`) | 7 | — | solo contati (vedi sotto) |
| percorsi `microsim` e `setpiece` | 0 | — | non comparsi in queste 8 partite |

Esempi misurati sulla base:

- 77' «GOL! Pecoraro (GRA) la mette dentro su assist di Colombo (GRA)!» → badge e avviso: **Ferrari**.
- 17' «Gol subito: Marchetti (POL) batte il nostro portiere su assist di Santoro (POL).» → badge e avviso:
  **Santoro** (l'uomo dell'assist firmava il gol).
- 24' «Rete di Marchetti (POL): la difesa non ha chiuso in tempo.» → badge e avviso: **Rossi**.

## Dove i nomi si separavano

`src/15-live-match.jsx`, gestore del battito di `playing`:

1. Il narratore del motore (`narra870`) scrive la riga del gol con i nomi **già dentro il testo**: marcatore `e.chi`,
   assist `e.assist` (decisi dal motore del possesso).
2. Lo stesso battito, poche righe dopo, sceglieva un **secondo** nome (`_evName170`) per badge (`setFloatGoal`),
   momenti chiave (`pushMatchEvent`) e avviso del gol (`golPend173Ref`): l'ultima battuta di un piano (7.814/7.835,
   che può essere chi ha fatto il passaggio) oppure un sorteggio dalla rosa (7.170). Nessuno dei due leggeva `e.chi`.

## Correzione

Una sola fonte: se la riga del gol viene dal motore e porta il marcatore (`ev._motore870.kind==='gol'` +
`ev._az551.da`), quel nome (`_chi325`, con le maiuscole della rosa) è il marcatore per badge, momenti chiave e avviso.
Il sorteggio dalla rosa **si consuma lo stesso** (stesse chiamate a `_rndM`, nessun `Math.random` nuovo): cambia solo
chi firma. Dove il motore non dà un marcatore resta il comportamento di prima. Rosso: `window.__CPM_NO_G325`.

## Dopo

| braccio | partite al fischio | gol ambientali | discordanze | risultati |
|---|---|---|---|---|
| verde | 8/8 | 8 (8 dal motore, 6 con assist) | **0** | 3-1 · 0-1 · 2-1 · 2-0 · 1-1 · 2-0 · 0-0 · 1-0 |
| rosso `__CPM_NO_G325` | 8/8 | 8 | **7** | identici al verde |

I risultati delle 8 partite sono identici nei due bracci: la correzione non sposta la partita.

Guardiano: `npm run marcatore-325` (due bracci nello stesso giro; «non giudicato» = rosso; copertura minima 6 gol di cui
3 dal motore), nella riga `src/15` della MAPPA di `ci-runner.mjs`.

## Controlli

Tutti sul ricomposto di questo ramo, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`.

| controllo | esito |
|---|---|
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | ricomposto dai 21 frammenti; differisce da HEAD solo per la modifica del giro |
| `node ci-runner.mjs giro marcatore-325` | **18/18 verdi** (marcatore-325 789 s · mappa-unica · test:logic · save-compat · replay 78 s · migrazione-194 · design-system · tema-unico · griglia-mobile · career-critical · battito-264 · partita-vera 628 s · render-3d-023 · tunnel-285 · gk-dive-sync · home-298 · schermate-97 · web-237) |
| `npm run match-sequence` | verde («le tre velocità raccontano la stessa partita») |
| `npm run bg-name-role` | verde (35/35 nomi coerenti con la zona) |
| `npm run event-ledger` (default, tetto 240 s) | **ROSSO: «cieco», 0/3 partite arrivate al fischio**; i gol del libro mastro coincidono col tabellone in tutte e tre (0/0 · 3/3 · 2/2) |
| `CPM_PARTITE=1 CPM_TETTO=540000 node event-ledger-test.mjs` | verde (1/1 al fischio, gol 2 contro tabellone 2) |

Nota su `event-ledger`: il rosso è «partita non arrivata al fischio entro 240 s», lo stesso tempo di banco che ha fermato
le mie partite intere a 300 s. Con 540 s la partita arriva al fischio e la misura è verde. **Non ho rigirato
`event-ledger` sulla base 7.999.203**, quindi non posso confermare con una misura che fosse rosso anche prima: lo
segnalo come rosso da verificare, non come verde.

`career-critical` è stato eseguito dal runner come sentinella del giro (non l'ho lanciato a parte). Le foto di
`docs/collaudo-grafico/` rigenerate dalle sentinelle sono state rimesse com'erano; `docs/governo/STABILITA.json`
porta la riga del giro scritta dal runner.

## Limiti dichiarati

- Le partite del guardiano sono giocate **a soli highlight** (il modo della segnalazione, quello con l'avviso): stesso
  battito e stesso gestore dei gol della partita intera. Le due partite intere provate non sono arrivate al fischio
  entro 300 s sul banco (misurato 2 su 2), quindi di default non ci sono; `CPM_INTERE=1 CPM_TETTO=600000` ne gioca una
  su quattro. Sulla partita intera ho una sola misura (base, 1 gol, 0 discordanze): non basta per un numero.
- I percorsi `microsim` e `setpiece` del libro mastro non sono comparsi in 16 partite: lì non ho misura.
- I gol dell'eroe in scena (`highlight`, 7) sono solo contati: marcatore e assist escono da un unico punto
  (`_mar820`/`_da820`) e il badge dice solo «GOL!» o «ASSIST!» senza nome; non li ho messi a confronto voce per voce.
- La foto del collaudo (`docs/collaudo-po/…` sul ramo poc) non l'ho aperta: il difetto è stato riprodotto dalle partite.

## Dubbi per il PO

1. L'**assist** oggi lo nomina solo la riga di cronaca: badge, momenti chiave e avviso mostrano il solo marcatore.
   Non c'è quindi un secondo assistman che possa discordare; se si vuole l'assist anche nell'avviso, è una voce nuova.
2. Vuole un giro dedicato alla partita intera sul banco (perché non arriva al fischio in 300 s) così il guardiano può
   coprire anche quella?
3. `event-ledger` col tetto di 240 s non arriva al fischio su questo banco (0/3): alzare il tetto è cambiare una soglia
   di un guardiano, quindi non l'ho toccato. Decide lei se va riparato (tetto o velocità della partita nella sonda).
4. Sui gol dell'eroe in scena vuole lo stesso confronto voce per voce (riga «X segna su assist di Y» contro pagella e
   momenti chiave)?
