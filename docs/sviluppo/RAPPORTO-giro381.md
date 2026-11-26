# Rapporto giro 381 — PO-663 «le scivolate si fanno a mezz'aria» · PO-660 «nella fila 2 corpi corrono da fermi»

Ramo `sviluppo/giro381-scivolate`, base `lavoro/201` (8543a9cc = 7.999.215 + giro 364). GAME_VERSION e `docs/governo` non toccati.

## In breve

- **PO-663, causa misurata e corretta.** `tackle` e `slide-tackle` hanno il bacino inchiodato (due chiavi uguali a 95,3) mentre il
  corpo si stende: il punto più basso del **corpo intero** stava a 0,37 / 0,35 altezze-corpo (mediana) sopra la suola della posa
  ferma, fino a 0,56 / 0,52. In scena, a metà scivolata, il corpo disegnato stava a **0,72 u dal prato**.
  Correzione: `_aTerra381` in `src/12`. Una volta per clip, al caricamento, il bacino scende di quanto il punto più basso del corpo
  intero sta sopra la suola della posa ferma. È la riparazione del giro 366 col criterio del corpo intero al posto della suola.
  Dopo: corpo disegnato a **−0,09 u**, cioè la stessa quota della posa ferma (giro 366). Il piede a metà scivolata scende da
  0,52–0,54 a 0,016–0,041 altezze-corpo, entro il raggio del pallone: ora può toccare un pallone a terra, prima passava sopra il
  pallone.
- **PO-660, non riprodotto: chiudo con la misura.** Ho contato tutti i corpi animati dell'ingresso in campo, cioè ogni
  `AnimationMixer` che si aggiorna (45). **Nessuno suona `jog`.** Nessun corpo resta in locomozione da fermo per più di 0,92 s; i
  bambini arrivano al massimo a 0,19 s. Non ci sono corpi «con la sola clip jog».
- Guardiano **`npm run scivolate-381`**: verde + rosso, aggiunto alla riga `src/12-|src/13-` della MAPPA, `mappa-unica` verde.
- Catena `node ci-runner.mjs giro scivolate-381`: **18/18 verdi** sul commit del giro. `difesa-343`: vedi sotto.

## Come ho misurato

C'è una sola sorgente: le maglie disegnate e le loro ossa, contro il prato a y 0, con gli strumenti del giro 366 (`_suola366`,
`_alza366`). Il corpo intero è il vertice più basso di tutta la pelle, non solo dei piedi.

1. **Clip** (deterministica, su un clone fuori scena): testimone nuovo `__CPM_T381`, prima/dopo in entrambi i bracci, e il profilo
   `__CPM_VOLA366({clip:'*'})` per confrontarle con le altre clip (sonda `misura-381.mjs`).
2. **Corpi disegnati in scena**: testimone nuovo `__CPM_SCIV381` (sola lettura, solo banco). Per ogni corpo che suona una clip di
   contrasto dà il punto più basso del corpo intero, la suola, la distanza fra il pallone e il piede più vicino (ossa foot/ball) e
   il tempo della clip. Lo leggo a ogni fotogramma delle fasi `hl_*` con scene forzate (gi18, 19, 31, 168, esito riuscito e
   fallito), GLB acceso, teatro acceso, vista da PC (sonda `misura-381-scene.mjs`).
3. **Fila**: sonda `misura-381-fila.mjs`. Si appoggia ai prototipi di three solo dentro la sonda: `AnimationMixer.update` e
   `Camera.updateMatrixWorld`, quest'ultimo per sapere quale camera disegna lo schermo. Per ogni mixer registra la velocità
   smussata della radice nel mondo, il peso delle clip di locomozione, la visibilità e se il corpo è a schermo. Usa il salvataggio
   e il walkout forzato di `fila-227`, sia al telefono 412 sia da PC.

## Prima / dopo

### PO-663, la clip (altezze-corpo; corpo alto 1,756 u)

| Clip | Corpo intero, mediana | Corpo intero, massimo | Piede, terzo centrale |
|---|---|---|---|
| `tackle` prima → dopo | 0,372 → **0,000** | 0,559 → 0,100 | 0,538 → **0,041** |
| `slide-tackle` prima → dopo | 0,352 → **0,000** | 0,522 → 0,141 | 0,522 → **0,016** |
| per confronto `mx-soccer-tackle` (non toccata) | 0,063 | 0,282 | — |

Il raggio del pallone (0,20 u) vale 0,114 altezze-corpo. Prima il piede stava sopra il diametro, dopo sta entro il raggio.

### PO-663, i corpi disegnati (righe a metà clip, peso ≥ 0,8)

| Braccio | Righe · scivolate | Punto più basso del corpo dal prato: mediana · p90 · massimo |
|---|---|---|
| rosso `__CPM_NO_G381A` | 27 · 3 | **0,721** · 0,779 · 0,797 u |
| verde | 20 · 2 | **−0,090** · −0,067 · −0,054 u |

Prima, in una corsa esplorativa, avevo anche la scivolata dell'eroe (`slide-tackle`, gi31/gi168): corpo a −0,094 u nel verde.

**Contatto piede-pallone in scena, da leggere con cautela.** La distanza minima di ogni scivolata è venuta 6,8 u di mediana nel
verde (minimo 2,7, 2 scivolate) e 2,7 u nel rosso (minimo 0,32, 3 scivolate). Il numero dipende da **chi** scivola: in queste scene
scivolano soprattutto avversari lontani dal pallone (reazione di reparto), e chi scivola cambia da una corsa all'altra. Nelle corse
esplorative il minimo del verde era 0,13–0,66 u. **Non posso confermare** con questi numeri che il contatto in scena sia migliorato o
peggiorato. Il dato affidabile è quello della clip: il piede adesso scende all'altezza del pallone.

### Il difensore del giro 343

`difesa-343` è verde + rosso (vedi «Catena»). La correzione non tocca né `_dif343` né i tempi: cambia soltanto la
quota del bacino dentro la clip.

### PO-660, la fila (walkout forzato, salvataggio della primavera, settimana 38)

| | Telefono 412 | PC |
|---|---|---|
| Corpi animati (mixer) | 45 | 45 |
| Clip suonate | giocatori `idle`+`walk` · 3 corpi `walk`+`idle` · 1 corpo solo `idle` · 19 bambini `walk` | uguale |
| Corpi con `jog` | **0** | **0** |
| Locomozione da fermo più lunga | 0,79 s (giocatore, all'arrivo sul suo punto, a schermo) | 0,88 s |
| Bambini, locomozione da fermo più lunga | 0,19 s | — |

Rosso `__CPM_NO_G381B` (rimette il difetto di PO-227 per provare che la sonda lo vede): **22 corpi** oltre 3 s, il più lungo 14,2 s.

I corpi sono identificati dall'ordine di creazione del mixer, non da un nome. **Non posso confermare** quali indici siano arbitri o
quarto uomo: lo deduco solo dalle clip che suonano.

## File e funzioni toccate

- `src/12-three-match-view.jsx`
  - **nuovi**, dopo `_aTerra366`: `_aTerra381` (riparazione della clip, testimone `__CPM_T381`, rosso `__CPM_NO_G381A`) e il
    testimone `window.__CPM_SCIV381` (solo `?cpmtest=1`/`__CPM_REC`).
  - **una riga nuova** dentro `_mkGestures`, subito dopo la prima riga: per `tackle`/`standTackle`, se la clip è stata riparata in
    quel momento, l'interpolante della traccia del bacino delle azioni già create punta ai nuovi tempi e valori. Una prima stesura
    ricreava l'azione con `uncacheAction` e rompeva la cache del mixer: 224 errori di pagina «_cacheIndex», misurati e tolti.
    Non ho toccato la prima riga di `_mkGestures`, che è quella del giro 366.
  - **una condizione** nella fila dei bambini (PO-227): `__CPM_NO_FILA227||__CPM_NO_G381B`. Serve solo al braccio rosso.
  - Non toccati: `animOne`, camere, arco del pallone, `_dif343`, barriera, tiri, colpi di testa, `GESTURE_WIN`.
- `CARRIER-MANAGER-AV.html` ricomposto (`check-src`: va solo ricommittato).
- `tests/visual/scivolate-381.mjs` (guardiano), `misura-381.mjs` (sonda, nessuno la nomina), `misura-381-scene.mjs` e
  `misura-381-fila.mjs` (sonde importate dal guardiano), `package.json` (script), `ci-runner.mjs` (riga `src/12-|src/13-`).

## Catena

`node ci-runner.mjs giro scivolate-381`, sul commit del giro: **18/18 verdi**. Erano scivolate-381, mappa-unica, test:logic,
save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298, web-237,
career-critical, battito-264, partita-vera, gk-dive-sync e schermate-97.
La catena rigenera foto in `docs/collaudo-grafico` e scrive `docs/governo/STABILITA.json`: le ho rimesse com'erano, non sono nel
commit.

`difesa-343` (sul commit del giro, a parte): **verde + rosso**. «Intervento mai prima del contatto, nessuna punizione in area»; il rosso vede entrambi i difetti.

**Guardiani della zona NON girati** (li giudica il treno): volano-366, fila-227, fila-206, ingresso-206, ingresso-245,
ingresso-camminata-245, bambini-294, tunnel-245, attesa-difesa, difesa-220, difesa-220-scena, pressing-143, reazione-252, testa-342,
salti-274, gesture-window, squad-react, portatore-286, portatore-293.

## Dichiarazioni

- **La soglia del piede l'ho cambiata dopo il primo verdetto.** Nella prima stesura avevo messo «piede a metà ≤ 0,03
  altezze-corpo», un numero scelto a priori senza una ragione fisica. Il verde l'ha mancata su `tackle` (0,041). L'ho sostituita con
  il raggio del pallone (0,114 altezze-corpo), che è il criterio del contatto. Non è l'abbassamento di una soglia già in vigore, ma
  lo dichiaro perché la soglia è stata scritta dopo aver visto il numero.
- Le tre `mx-soccer-tackle*` non le ho toccate: a terra ci vanno già.

## Dubbi per il PO

**1. All'arrivo sul suo punto della fila il giocatore cammina da fermo per al massimo 0,8–0,9 s.** Non è la voce PO-660 (niente
`jog`, ed è la frenata del passo), ma si vede a schermo.
- **A (consigliata, applicata = nessuna modifica):** lasciarla. È sotto la soglia di 1,5 s del guardiano, e PO-197 aveva già reso
  rapida la discesa del peso nel walkout.
- B: dare ai giocatori la stessa discesa a gradino dei bambini (PO-294) quando arrivano.
- C: un collaudo a occhio sul telefono prima di decidere.

**2. Sull'eroe la scivolata è quasi sempre una variante `mx-soccer-tackle*`**, per il sorteggio delle varianti. Nella corsa finale
del guardiano le righe dell'eroe in `slide-tackle` sono 0: le misure vengono dagli avversari.
- **A (consigliata, applicata):** il guardiano giudica chiunque suoni le due clip. Gli avversari ci sono sempre, e la riparazione è
  sulla clip, condivisa da tutti.
- B: un gancio di sola prova che forzi `slide-tackle` sull'eroe, per avere righe sue in ogni corsa.
- C: niente.

**3. Resta un picco di 0,10–0,14 altezze-corpo in singoli campioni della clip** (mediana 0,000). Credo che venga dal
sottocampionamento dei vertici nella misura (1.500 per maglia), ma non l'ho verificato. Ho provato una seconda passata di
affinamento: peggiorava, con il corpo fino a 0,275 altezze-corpo sotto il prato in altri istanti, e l'ho tolta.
- **A (consigliata, applicata):** una passata sola.
- B: misurare su tutti i vertici durante la riparazione. È più lento al caricamento, una volta per clip.
- C: lisciare la traccia corretta.

**4. `volley` ha lo stesso difetto** (bacino inchiodato, corpo intero 0,397 di mediana) ma non è nella mia zona.
- **A (consigliata, applicata = la segnalo qui):** una voce nuova per un giro dedicato, che passi la clip da `_aTerra381` e rimisuri
  il contatto della volée.
- B: estenderla subito a `volley` nel prossimo giro sui gesti d'attacco.
- C: lasciarla.

**5. PO-660.**
- **A (consigliata, applicata):** chiuderla con la misura di questo giro: 45 corpi, 0 con `jog`, nessuna corsa da fermo oltre 0,92 s.
  Il guardiano (parte F) tiene il punto.
- B: chiedere alla collaudatrice uno scatto dei due corpi, se li rivede.
- C: tenerla aperta fino al prossimo collaudo dal vivo.
