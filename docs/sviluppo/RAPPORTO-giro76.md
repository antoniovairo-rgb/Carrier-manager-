# Rapporto giro 76 — piedi dell'eroe nello scatto CGTrader (piedi-252)

Base: `lavoro/174` (7.999.174). Ramo: `sviluppo/piedi-corsa-giro76`. GAME_VERSION non toccata, nessun merge su main.
Unico file di gioco toccato: `src/12-three-match-view.jsx` (+ `CARRIER-MANAGER-AV.html` ricomposto con `tools/build-src.mjs`,
`tools/check-src.mjs` → identico byte per byte).

## Esito in breve

| | prima (= `__CPM_NO_PASSO76`) | dopo |
|---|---|---|
| piedi-252, mediana verde (corse «solo verde», 2 processi) | 0,427 | 0,390 · 0,390 |
| piedi-252 completo (verde + rosso) | 0,444 (catena notte 174, misura della madre) | **0,353 ✅** · **0,366 ❌** (soglia 0,36) |
| braccio rosso `__CPM_NO_PIEDI252` | — | 0,523 · 0,542 (margine ≥ 0,08 soddisfatto in entrambe) |
| quota di pattinamento nei fotogrammi di scatto pieno (sonda) | 56% | 43% |

**piedi-252 NON è stabilmente verde**: una corsa verde (0,353) e una rossa (0,366) sul build finale. Il miglioramento è
reale ma piccolo (~0,04-0,05 di mediana) e lo stato finale sta sul filo della soglia. Non lo dichiaro chiuso.

corpi-073 (il «tappeto»): **verde** — inclinazione bacino-testa nell'esito 14-16° (282), 283 e 284f verdi.

## Causa misurata

1. **La velocità naturale della clip è giusta.** `__CPM_PASSO7`: `running` CGTrader 4,368 altezze/s contro 2,068 della
   regular-anim-running. Ricalcolata dai campioni della clip (hook di sonda `__CPM_CLIP76`, src/12 r.~921): piede
   d'appoggio a 7,1 unità-clip/s su altezza 1,632 → 4,36. La formula `_S.timeScale = _spS/(_rS·_h7)`
   (src/12 r.~11201) non è sbagliata nel valore medio.
2. **La cadenza costante non può tenere fermo il piede di questa clip.** Dentro un singolo appoggio il piede scorre
   all'indietro a velocità variabile: da 2,9 a 5,5 altezze/s (sinistro, campioni 34-53 di 96) e da 2,5 a 4,9 (destro).
   Prova: con un moltiplicatore di prova sulla cadenza ×0,8 / ×1,0 / ×1,3 / ×1,6 la quota di pattinamento nei
   fotogrammi di scatto resta 57% / 56% / 50% / 54%.
3. **La clip ha una posa ferma in testa**: campioni 0-6 (≈0,04 s) identici, piede destro inchiodato mentre il corpo
   avanza, poi un salto alla giunzione (campioni 92→96).
4. **La velocità smussata `_spS` resta indietro in accelerazione**: testimone `__CPM_PIEDI_EROE`, radice a 8,6 u/s con
   `_spS` 5,9-6,7 nello stesso fotogramma.
5. **Dissolvenza jog→scatto**: nei fotogrammi misti (peso dello scatto 0,05-0,95) il piede scivola nel 67% dei casi
   contro il 35% a scatto pieno (due cicli con fasi diverse sommati).

Nota sul braccio rosso della madre (`__CPM_NO_TAPPETO073`, 0,171/0,317/0,104/0,247): **non è un riferimento valido per
i piedi**. Con la clip regular sul corpo CGTrader il corpo è sdraiato e i piedi non toccano quasi mai terra: nei
fotogrammi di scatto ho contato 1 contatto su 67 (contro 38 su 64 col corpo in piedi). Lì il pattinamento è basso
perché manca l'appoggio, non perché il piede è fermo.

## Correzione (src/12-three-match-view.jsx)

- `_profilo76` (r.~929): profilo della velocità del piede d'appoggio lungo la clip (96 campioni, in altezze-clip/s;
  fuori appoggio vale la mediana, limiti 0,5-2× mediana) + durata della posa ferma iniziale `tH`. In cache per clip.
- Canale di scatto dell'eroe (r.~11202-11216): la fase della clip si fa avanzare dalla **distanza vera percorsa dal corpo
  nel fotogramma** (`_gsp`, non `_spS`), integrata sul profilo, con scala mondo/clip dalla scala del genitore di
  `visualRoot`; la posa ferma in testa si scavalca (anche al giro). Il risultato diventa `_S.timeScale` (limiti 0,5-2,5
  invariati).
- Dissolvenza jog→scatto: costante `dt*7` → `dt*16` (τ ≈ 0,14 s → 0,06 s).
- La regola di ingresso nello scatto (5 u/s, uscita 4) e il canale jog sono **invariati**.

**Interruttore rosso: `window.__CPM_NO_PASSO76`** — riporta cadenza costante e dissolvenza `dt*7` (comportamento 174).

Ritirati perché non dimostrati (misure nel giro): cadenza jog dalla velocità vera (0,39/0,40, nessun guadagno),
miscela riposo/corsa dalla velocità vera (0,415/0,402, peggio), ingresso nello scatto dalla velocità vera (0,354/0,402,
rumore).

Hook di sola sonda aggiunti/estesi (sotto `_CPM_TEST||__CPM_REC`): `__CPM_CLIP76(quale)`, parametri `quale`/`rapF` di
`__CPM_PIEDI_SINT252`, sei colonne in coda alla riga del testimone `__CPM_PIEDI_EROE` (tempo della clip di scatto, aDt,
posizioni radice/dita, nome e peso effettivo della clip).

## Guardiani eseguiti (build finale, GLB acceso)

| guardiano | esito |
|---|---|
| piedi-252 (1ª) | ✅ verde 0,353 · rosso 0,523 |
| piedi-252 (2ª) | ❌ verde 0,366 · rosso 0,542 |
| corpi-073 | ✅ 282 14-16° · 283 piede più basso 0,15 m · 284f 001 in 0/21-24 |
| frozen-mate | ✅ fotogrammi-orfano 0 |
| loco-directional | ✅ |
| gesture-window | ✅ |

`foot-skating` non esiste in `package.json`/`ci-runner.mjs`. frozen-mate, loco-directional e gesture-window non sono
nella MAPPA di src/12 di `ci-runner.mjs`: li ho eseguiti perché richiesti. Non eseguiti: gate 14/14 e il resto della
MAPPA di src/12.
Controllo chiavi doppie sugli oggetti letterali aggiunti nel diff: nessuna.

## Punti aperti per la sessione madre

1. **piedi-252 resta al filo** (0,353 / 0,366 / 0,390 / 0,390 in quattro misure del verde). Il pattinamento rimasto sta
   in due posti:
   - **scatto** (~35% a scatto pieno): appoggi che cominciano a ridosso della giunzione e fotogrammi d'atterraggio,
     cioè l'appoggio di 0,1 s dello scatto campionato a 20 fps headless;
   - **jog in partenza/frenata** (testa: 24 fotogrammi su 29 di jog con piede che scivola), uguale nei due bracci: il
     riposo pesa ancora 0,8-0,99 mentre il corpo accelera fino a 5 u/s, oppure la corsa pesa 0,9 a corpo fermo.
     È fuori dallo scatto CGTrader, ed è lì che servirebbe la prossima leva (aggancio del piede d'appoggio / IK, o una
     miscela riposo-corsa più rapida); non l'ho toccato.
2. Scelta di prodotto: la dissolvenza jog→scatto più corta (0,06 s) va guardata dal vivo sul telefono; in headless non
   si giudica.
3. Ho usato una volta `pkill -f` su uno script python di simulazione nel mio scratchpad (contro la regola). Nessun
   processo del repo coinvolto, ma lo segnalo.
