# Rapporto giro 419 — PO-682 «avevo scelto calcio potente ma ha fatto un colpo di testa»

Ramo: `sviluppo/giro419-testa-potenza` (base `main`, 49769fa). `GAME_VERSION` e `docs/governo` non toccati. GLB acceso in ogni misura.

## La nota del PO

Taccuino 7.999.216 · S.2 W.23 · 19' · `hl_result` · contro FC Hamburg Hafen (0-0) · scena [insertion] «🚩 Calcio d'angolo di
GÜNTHER: attacca il pallone!» · azione «✈️ Testa di potenza» → miss. Codice 003 (esito bugiardo). Bozza automatica: corpo↔porta al
contatto 72°, eroe a x 37,6 z -8,3, porta a 11 u.

## (a) Il testo: il tasto diceva davvero «Conclusione potente»

L'azione nei dati è «✈️ Testa di potenza» (src/04 r.404, 1038, 1148), ma **non è il testo che il PO ha letto**. Il tasto mostra
`intentLabelDedup(a.label)` (src/15 r.12835, 12857, 13085), che passa da `intentLabel` (src/11): la regola delle teste cerca
«colpo di testa | stacco di testa | **di testa** | incornata | stacco | spizzata». «Testa **di** potenza» non contiene «di testa»,
quindi la regola non scatta e vince la successiva, `/potenza|potente/` → **«💥 Conclusione potente»**. Il PO ha scelto
«Conclusione potente» e ha visto un colpo di testa: l'esito bugiardo era l'etichetta.

**Elenco misurato** (guardiano `testa-419`, parte T: catalogo `SITUATIONS` + `CHAIN_SITS` + scene del motore d'angolo, di cross e di
seguito su 40 semi = 1.428 azioni, 557-559 distinte, tipo del gesto da `deriveHL`):

| | azioni di testa mostrate con le parole di un tiro di piede | colpi di testa verso la porta senza «di testa» |
|---|---|---|
| **prima** (rosso `__CPM_NO_G419`) | **6** | **23** |
| **dopo** | **0** | **0** |

I sei di prima: «Testa di potenza» → Conclusione potente (catalogo e motore d'angolo) · «Testa potente angolato» → Conclusione potente ·
«Testa piazzata all'angolo» → Conclusione precisa (catalogo e motore) · «Testa al volo» → Conclusione di prima. I 23 erano «Attacca il
pallone» (colpi di testa verso la porta resi senza dire «testa»). Censimento statico sul sorgente (545 etichette, 29 aeree): stessi casi,
più 5 passaggi o interventi di testa («smorzato per compagno», «e smista», «indirizza il compagno», «incornata del compagno»,
«stacco difensivo») che diventavano anch'essi «Attacca il pallone».

**Correzione** (`intentLabel`, src/11, solo l'etichetta mostrata: `act.label`, `deriveHL`, gate e golden invariati): un'azione aerea
(«testa», «incornat», «stacco», «spizzat») dice sempre «di testa», con lo stile:

| stile nel testo | etichetta mostrata |
|---|---|
| sponda, passaggio, compagno, smista, difensivo | il testo originale (resta un passaggio/intervento) |
| profondità | ✈️ Colpo di testa in profondità |
| in corsa, tuffo, piombo (gesto `header_diving`) | ✈️ Colpo di testa in corsa |
| potenza, potente, dominante, deciso | ✈️ Colpo di testa potente |
| piazzato, angolato, mirato, preciso, angolo | 🎯 Colpo di testa piazzato |
| al volo | ✈️ Colpo di testa al volo |
| primo palo / secondo palo | ✈️ Colpo di testa sul primo / secondo palo |
| altro | ✈️ Colpo di testa |

**Anche dopo la scelta.** Le foto hanno mostrato un secondo posto: il riquadro «LA GIOCATA» (e le schede «in corso»/esito, 6 punti in
src/15) legge l'etichetta dei dati, non quella del tasto, quindi dopo «Colpo di testa potente» si rileggeva «Testa di potenza». Ora
quei riquadri passano da `giocataMostrata419` (src/11): per un colpo di testa dicono lo stesso nome del tasto; le altre azioni restano
come prima (fuori ambito: vedi dubbio 5). Misurato: riquadri diversi dal tasto, prima 24, dopo 0.

«In corsa» sta prima di «potente» per un motivo misurato: nella stessa scena del motore «Stacco in corsa potente» e «Testa di potenza»
diventavano due «Colpo di testa potente», e lo scarto dei doppioni riportava la seconda al testo di prima.

## (b) Il corpo al contatto: il banco non misurava la scena del PO

`angolo-117` (giro 117/121) già giudica l'angolo al contatto sui colpi di testa d'angolo, con soglia 35°, ed era verde. Sulla stessa
famiglia, con «Testa di potenza», la misura sul banco forzato dava **19-34°**, con l'eroe che correva sempre sul primo palo (x 44).
Il PO invece stacca **da dove sta** (x 37,6, a 11 u dalla porta).

**Causa della differenza:** nel gioco vero la scena d'angolo/cross del motore porta un'**origine** (`_ORIG26`, src/15 r.6022): il pallone
parte dalla bandierina (o dal crossatore) e vola con un solo segmento `orig26` (src/12 r.7267) sul **corpo dell'eroe dove sta**. Il banco
forzato non arma `_ORIG26`, quindi misurava un'altra scena. La sonda nuova `misura-419.mjs` la arma come fa src/15 (stessa forma).

**Misura sul percorso vero** (8 casi: 5 angoli, 3 cross, due lati, riusciti e falliti, pagina nuova per caso, testimone `__CPM_CONT121` =
fotogramma in cui parte l'arco del colpo; tra parentesi `__CPM_CONT53`, che è quello che scrive la bozza del taccuino):

| caso | eroe al contatto | porta | prima | dopo |
|---|---|---|---|---|
| angolo-dx-fail | x 42 z 4,8 | 6,6 u | **43°** (74°) | 0° |
| angolo-dx-ok | x 42 z 7,5 | 6,6 u | **63°** (95°) | 0° |
| angolo-sx-fail | x 41 z -7,5 | 7,6 u | 8° (8°) | 0° |
| angolo-sx-ok | x 42 z -6,1 | 6,6 u | **84°** (84°) | 0° |
| angolo-lontano-fail | x 39 z 10,2 | 9,6 u | **55°** (90°) | 0° |
| cross-dx-fail | x 38 z 6,1 | 10,6 u | **80°** (80°) | 0° |
| cross-sx-ok | x 38 z -2 | 10,6 u | **47°** (47°) | 0° |
| cross-sx-fail | x 36 z -4,8 | 12,6 u | **45°** (45°) | 0° |

Prima 7 su 8 oltre 35°: il difetto del PO (72°) è riprodotto. Il giro 415 (PO-679, ramo `sviluppo/giro415-finalizzatore`, non ancora
su main) ha misurato lo stesso fenomeno sul **compagno** che conclude il cross; la sua misura non era riusabile qui (soggetto diverso:
l'eroe, non `crossRcvMesh`), ho riusato il suo metodo e il testimone del giro 121.

**Perché il corpo era girato:** durante il volo dalla bandierina l'eroe va incontro al pallone e il corpo GLB guarda dove corre (ramo
`_gsp` del ciclo dei corpi, src/12), cioè verso il pallone che arriva; la mira del gesto (7.517/7.636) gira a `dt*7` solo dal montaggio
della clip, a contatto quasi fatto.

**Correzione** (src/12, ciclo dei corpi GLB, prima del ramo della mira 7.517): `_tst419`. Nella scena di testa dell'eroe (`hl_result`,
`hlType` header, non `header_flick` = sponda, non scena difensiva), quando il pallone è entro 14 u dal corpo, il corpo si gira verso la
porta con `dt*9` (smorzato, niente scatti) e resta così per tutto il gesto. Il ramo «guarda dove corri» e la mira 7.517 non lo
riscrivono in quei fotogrammi; la locomozione direzionale 7.518 sceglie da sola corsa laterale o all'indietro.
Rosso: `window.__CPM_NO_G419` (spegne sia il testo sia il corpo).

Fuori ambito: il punto di stacco (l'eroe non corre più sul primo palo sul percorso vero: è il disegno del giro 7.999.64, «il volo segue
l'eroe vivo»), la clip del colpo di testa, l'arco del pallone, il modello procedurale (il gate gira GLB spento: il testimone legge il
corpo GLB).

## Guardiano

`npm run testa-419` (`tests/visual/testa-419.mjs`), nella riga della MAPPA `src/12-|src/13-` (il corpo è in src/12; il testo è in
src/11, che sta nella riga `src/01-|src/1[178]-`: vedi dubbio 3). Soglie scritte prima di applicare la correzione al corpo.

- **T verde:** 0 azioni di testa con parole di un tiro di piede, 0 colpi di testa verso la porta senza «di testa», almeno 10 azioni di
  testa nell'elenco (altrimenti non giudicato = rosso). **T rosso:** «Testa di potenza» deve tornare «Conclusione potente».
- **C verde:** tutti gli 8 casi con contatto di testa e origine armata, angolo ≤ 35° (la soglia del testimone della bozza). **C rosso:**
  almeno 5 casi su 8 oltre 35°. Un caso senza contatto o senza origine = non giudicato = rosso.

Esiti: vedi «Rituali».

## Foto (GLB acceso, scena ferma nel fotogramma in cui parte il colpo di testa)

`tests/visual/foto-419.mjs`. «Prima» = braccio rosso (comportamento misurato).

- `docs/collaudo-po/419-prima-angolo-dx-ok.png` · `419-dopo-angolo-dx-ok.png` — angolo dalla destra.
- `docs/collaudo-po/419-prima-cross-dx-fail.png` · `419-dopo-cross-dx-fail.png` — cross.

## File toccati

- `src/11-ui-kit-highlight.jsx`: `intentLabel`, regola delle azioni di testa (in testa alla funzione); `giocataMostrata419` nuova.
- `src/15-live-match.jsx`: i 6 riquadri dopo la scelta («La giocata», in corso, esito) leggono `giocataMostrata419(chosenAct.label)`.
- `src/12-three-match-view.jsx`: ciclo dei corpi GLB, blocco `_tst419` prima del ramo della mira 7.517.
- `CARRIER-MANAGER-AV.html`: ricomposto (`build-src` + `check-src`).
- `tests/visual/misura-419.mjs` (sonda, percorso vero con `_ORIG26`), `testa-419.mjs` (guardiano), `foto-419.mjs` (foto),
  `package.json` (script `testa-419`), `ci-runner.mjs` (riga MAPPA `src/12-|src/13-`).
- `docs/collaudo-po/419-*.png`, questo rapporto.

## Dubbi per il PO

**1. Che cosa dice il tasto di un colpo di testa.**
- **(A) CONSIGLIATA, GIÀ APPLICATA:** «Colpo di testa» più lo stile (potente, piazzato, in corsa, al volo, sul primo/secondo palo); le
  sponde e gli interventi di testa tengono il loro testo.
- (B) Mostrare il testo originale dei dati («Testa di potenza») senza riscriverlo: meno codice, ma «Testa di potenza» resta ambiguo per
  chi legge in fretta, ed è proprio ciò che il PO ha scritto.
- (C) Tornare alla regola di prima per tutti («✈️ Attacca il pallone», l'intento senza esecuzione, Fase 3 del motore): non mente sul
  piede, ma non dice nemmeno «testa», e il PO chiede che sia inequivocabile.

**2. Dove guarda il corpo quando il colpo di testa parte.**
- **(A) CONSIGLIATA, GIÀ APPLICATA:** verso il centro della porta, dagli ultimi 14 u del volo del pallone; la clip e l'arco fanno il resto.
- (B) Verso il bersaglio dell'arco (primo palo, secondo palo): più preciso sul singolo colpo, ma il bersaglio esiste solo quando l'arco
  si arma, cioè al contatto, e si torna al giro troppo tardi.
- (C) Corpo a metà fra pallone e porta (realistico per chi stacca su un angolo, testa che gira sul pallone): richiede di separare testa e
  busto sulla clip, un giro a parte.

**3. Il guardiano sta in una sola riga della MAPPA.**
- **(A) CONSIGLIATA, GIÀ APPLICATA:** riga `src/12-|src/13-` (corpo, parte lunga). Chi tocca solo `intentLabel` in src/11 non lo fa
  girare nel trenino; lo gira il treno grande.
- (B) Spostarlo nella riga `src/01-|src/1[178]-` (testo): allora è il corpo a restare scoperto per chi tocca solo src/12.
- (C) Dividerlo in due guardiani (testo ~1 minuto, corpo ~4 minuti), uno per riga: più copertura, una voce in più da mantenere.

**4. Il testimone della bozza (`__CPM_CONT53`) legge un fotogramma diverso dal contatto vero** (sul percorso vero 74-95° dove il contatto
ne misura 43-63°). Non corretto qui (è lo strumento del taccuino).
- (A) CONSIGLIATA: aprire una voce perché la bozza legga `__CPM_CONT121` (fotogramma in cui parte l'arco), come già fa `angolo-117`.
- (B) Lasciarlo: col corpo girato alla fonte entrambi i testimoni scendono a 0° (misurato).
- (C) Stampare entrambi i numeri nella bozza.

**5. I riquadri dopo la scelta mostrano l'etichetta dei dati per tutte le azioni che non sono di testa** (es. tasto «💥 Conclusione
potente», riquadro «Tiro di potenza»). Non è un'etichetta che mente sul gesto, ma è un nome diverso da quello cliccato.
- (A) CONSIGLIATA, GIÀ APPLICATA: allineare solo i colpi di testa (la voce del PO), lasciando il resto com'è.
- (B) Allineare tutti i riquadri al nome del tasto (`intentLabelDedup`): coerenza completa, ma cambia testi su tutte le scene e va
  ricontrollato con `esiti-96` e le sonde che leggono `esito-titolo`.
- (C) Fare il contrario: il tasto mostra il testo dei dati e si toglie la riscrittura della Fase 3.

## Rituali

- `npm run testa-419` da solo: **verde** — T 0 bugie / 0 senza «di testa» / 0 riquadri diversi dal tasto; C 8/8 giudicati, massimo 0°.
  **Rosso visibile** (`__CPM_NO_G419`): T 6 azioni di testa con parole da tiro di piede («Testa di potenza» → «💥 Conclusione
  potente»), 23 senza «di testa», 24 riquadri diversi; C 6/8 oltre 35°, massimo 86°.
- `node ci-runner.mjs giro testa-419` (testa-419 + 17 sentinelle) sul build 7.999.217 + modifiche: **18/18 verdi** — testa-419 (428 s) ·
  mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile · render-3d-023 ·
  tunnel-285 · home-298 · web-237 · career-critical · battito-264 · partita-vera (655 s) · gk-dive-sync · schermate-97.
- `build-src` + `check-src`: ricomposto, privacy invariata. Il resto della MAPPA lo giudica il treno.
