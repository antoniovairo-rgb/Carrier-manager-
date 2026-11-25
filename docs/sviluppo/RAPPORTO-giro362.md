# Giro 362 — «La tua storia»: sempre il numero vero di stagioni

**Base:** `lavoro/201` (contiene il giro 355, PO-586) · **Ramo:** `sviluppo/giro362-storia-numero`
**Decisione PO (25/11 09:10, dubbio 3 del giro 355):** «Sempre il numero». I testi della «Tua storia» e delle rivalità
non dicono mai «da anni», «da sempre» o simili: dicono il numero vero di stagioni.
GAME_VERSION non toccata (rilascio automatico). Nessun campo nuovo nel salvataggio, nessun sorteggio nuovo (le liste
dei testi hanno la stessa lunghezza: la scelta seedata resta la stessa).

## Cosa cambia (solo src/18, capitolo del rivale di `storyChapter`, ramo `rivw1`)

Il numero è `_anni355` del giro 355: il minore fra le stagioni da professionista (`season − proSeason + 1`) e le
stagioni del rivale (`rival.seasons`).

| Testo (giro 355) | Ora |
|---|---|
| dalla 3ª stagione: «…testa a testa (8 a 11): un equilibrio che dura **da anni**.» | «…un equilibrio che dura **da N stagioni**.» |
| 2ª stagione: «…dura dalla scorsa stagione.» | invariato |
| 1ª stagione: «…la vostra storia da professionisti è appena cominciata, e già non c'è un padrone.» | «…testa a testa (8 a 11): fra voi due non c'è un padrone.» (nessuna frase sugli anni) |
| titolo dalla 3ª: «Gli eterni rivali» | «Rivali da N stagioni» |
| titolo dalla 3ª: «La sfida di sempre» | «N stagioni di sfide» |
| «vi inseguite da `rival.seasons` stagioni» (condizione `rival.seasons ≥ 3`) | stesso testo, ma col numero `_anni355` (e condizione `_anni355 ≥ 3`): su un salvataggio vecchio senza `proSeason` coincide; dove il rivale ha più stagioni dell'eroe da pro, ora dice le stagioni vissute insieme |

N è sempre ≥ 3 in queste frasi, quindi il plurale «stagioni» è sempre giusto (la funzione gestisce comunque il singolare).

## Guardiano

`npm run storia-362` (verde + rosso, ~1 min). Stessa sonda del 355 (funzione vera `storyChapter`, 48 rivali × 6 stagioni
× andata/ritorno = 576 capitoli; carriere **sintetiche**, dichiarato), con un rivale su tre che ha 2 stagioni in più
di quelle da pro, così il «numero vero» non coincide per costruzione con `rival.seasons`.
- **A** nessuna formula vaga: «da anni», «da sempre», «di sempre», «eterni», «di una vita», «da tempo», «da tanti anni», «per anni»;
- **B** ogni «N stagioni» detto vale esattamente le stagioni vere ed è ≥ 3 col plurale giusto; «dalla scorsa stagione» solo
  in 2ª; in 1ª nessuna frase sugli anni;
- **C** copertura: ≥ 40 capitoli per stagione, «testa a testa» in ognuna, ≥ 20 numeri giudicati; nulli o errori = rosso.

Rosso `window.__CPM_NO_G362` = testi del 355.

| | capitoli | formule vaghe | anni in 1ª | numeri sbagliati | numeri giudicati |
|---|---|---|---|---|---|
| verde | 576 (96 / 96 / 384) | **0** | **0** | **0** | 297 |
| rosso `__CPM_NO_G362` | 576 | 166 | 24 | 46 | — |

`storia-355` resta verde col suo rosso (`__CPM_NO_G355` riporta ancora i testi di prima del 355). Il guardiano è entrato
nella riga della MAPPA che già esiste per `src/18-|src/10-` (`mappa-unica` verde).

## Catena del giro

`node ci-runner.mjs giro storia-362 storia-355 career-critical` (+ 17 sentinelle): vedi «Esito».

## Dubbi per il PO

**1. «Fuori dal campo **ormai** vi sentite» e «**Col tempo** tra voi è nato il rispetto»** (stesso capitolo, escono solo
dalla 2ª stagione perché la relazione cambia al rollover). Non dicono «da anni», ma sono formule temporali vaghe.
- **(consigliata, non applicata)** Lasciarle: non affermano una durata, raccontano un cambiamento che c'è stato davvero.
- Riscriverle col numero («In N stagioni tra voi è nato il rispetto»).

**2. Fuori ambito, stessa famiglia, non toccati:** l'attestato d'addio «il rivale di una vita» (diario, src/18, evento
`addioRivale` dell'ultima stagione, non nella «Tua storia») e l'intervista «il tuo rivale di sempre» (src/07, giro a parte).
- **(consigliata)** Applicare la stessa regola nei rispettivi giri.

## Esito

`node ci-runner.mjs giro storia-362 storia-355 career-critical` su 7.999.210 (build ricomposta da src, `check-src`
IDENTICO): **19/19 verdi** (storia-362, storia-355, mappa-unica, career-critical + 17 sentinelle, tra cui test:logic,
save-compat, migrazione-194, design-system, griglia-mobile, web-237, partita-vera), nessun passo instabile.
