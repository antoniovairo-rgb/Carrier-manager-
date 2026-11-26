# Rapporto giro 371 — PO-420 «Il campionato parte da zero»

Ramo `sviluppo/giro371-prima-giornata`, base `lavoro/201` (8543a9cc = 7.999.215 + giro 364). GAME_VERSION e `docs/governo` non toccati.

## In breve

- **Difetto misurato (prima):** alla 1ª giornata, con tutte le squadre a 0 punti, la card «Prossima» della Home mostrava la
  posizione dell'elenco come se fosse una classifica e ne ricavava le etichette. Salvataggio sintetico, Premier Division, settimana 1:
  `FC ISLINGTON 3ª in classifica VS FC MERSEYSIDE 2ª in classifica · Forza 91/99 · alla pari · ⚔️ Scontro al vertice`.
  Nella scheda Stagione › Classifica, in alto a destra, c'era `−0 DALLA VETTA`.
- **Dopo:** `FC ISLINGTON VS FC MERSEYSIDE · Forza 91/99 · alla pari · ⚖️ Pronostico: partita aperta`. Nella Stagione c'è
  `SI PARTE DA ZERO`.
- **Regola, una sola** (`src/08`, accanto a `partitaChiave163`):
  - `classificaViva371(st, idClub, nomeClub)`: le posizioni contano solo se almeno una squadra ha punti **e** la mia squadra ha
    giocato almeno una gara di campionato;
  - `pronostico371(forzaMia, forzaLoro, inCasa)`: differenza di forza (la stessa «Forza N/99» della card) più 3 punti al fattore
    campo. Con +8 o più dico «favoriti», con −8 o meno «sfavoriti», in mezzo «partita aperta». Le soglie ±8 sono quelle che la card
    usa già per «più forte / più debole / alla pari».
  - Funzioni pure: nessun sorteggio, **nessun campo nuovo nel salvataggio**. Rosso `window.__CPM_NO_G371` = le posizioni contano
    sempre (com'era).

## Misura: dove compariva (1ª giornata, tutte a 0 punti)

| Schermata | Prima | Dopo |
|---|---|---|
| Home, card «Prossima» (impaginazione V2): posizione sotto gli stemmi | **sì** («3ª/2ª in classifica») | no |
| Home, card «Prossima»: etichetta di peso (vertice / capolista / zona retrocessione / scontro diretto) | **sì** («⚔️ Scontro al vertice») | pronostico |
| Home, card «Prossima» (impaginazione vecchia, `team()` + «Nª» accanto alla forma) | **sì** (stesso calcolo) | no + pronostico |
| Stagione › Classifica, riga in alto a destra | **sì** («−0 dalla vetta» / «+0 sulla seconda») | «Si parte da zero» |
| Anteprima della partita contro il rivale (src/18, «Voi N° e loro M°») | **sì**, letto dal codice (stesso ordine a 0 punti) | la frase non esce finché la classifica non vale |
| Pre-partita TV (`MatchdayCard`/pannello TV, src/15) | no: già protetto dal 6.79.0 (`tot>0`) | invariato |
| «Posta in gioco» / partita chiave (`posta165`, `partitaChiave163`) | no: già protetti (servono punti in classifica) | invariato |
| Interviste: domande a tema classifica (src/07) | no: escono dopo la gara, quando la classifica ha già la 1ª giornata | invariato |
| Notizie di lega (src/17) | no: escono dalla settimana 3 e con almeno una gara giocata | invariato |
| Riquadro «La stagione» e riga obiettivo (giro 298/337) | no: già protetti (`played>0`) | invariato |

Misurato su quattro club scelti dal gioco (prestigio alto, medio, basso, in tre leghe diverse) più una Primavera e una gara di
Coppa alla settimana 1. Su tutti e quattro i casi di campionato il rosso mostra la posizione e il verde no. La Coppa alla settimana 1
prendeva la posizione dalla classifica di campionato: ora non la mostra.

## File e funzioni toccati

- `src/08-panchina-derby-meteo-cori.jsx`: **nuove** `_g371`, `classificaViva371`, `pronostico371` (+ ganci di sola lettura
  `window.__CPM_VIVA371`, `window.__CPM_PRON371`), prima del commento del giro 165. Nessuna funzione esistente cambiata.
- `src/18-career-app.jsx`, dentro `CareerApp`:
  - card «Prossima» della Home: `_viva371` e `myPos`/`oppPos` a −1 finché la classifica non vale (un solo punto, usato dalle due
    impaginazioni); in tutte e due le catene di `_imp` il pronostico se non c'è un'altra etichetta;
  - anteprima contro il rivale: la frase con le posizioni solo con `classificaViva371`;
  - testata della scheda Stagione: `gap0` dice «Si parte da zero».
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src` + `check-src` identico).
- `tests/visual/prima-giornata-371.mjs` (nuovo), `tests/visual/package.json` (script), `tests/visual/ci-runner.mjs` (guardiano
  nella riga della MAPPA `src/18-|src/10-`, che c'era già; `mappa-unica` verde).

## Guardiano

`npm run prima-giornata-371` (~5 min, telefono 412×915 dpr 2):
A) verde su 4 casi alla 1ª giornata: nessuna posizione, nessuna etichetta, pronostico presente (o derby), Stagione senza
«dalla vetta», pre-partita senza posizioni; B) rosso `__CPM_NO_G371` bocciato su tutti e 4; C) dopo una giornata giocata la
posizione torna e il pronostico sparisce; D) Coppa alla settimana 1 senza posizioni; E) regola pura (9 casi, compreso «gli altri
hanno giocato, io no» → niente posizioni). Un caso che non arriva alla card o non è alla settimana 1 a 0 punti è «non giudicato» =
rosso. Esito: **verde**, rosso bocciato 4/4.

Sentinelle: `node ci-runner.mjs giro prima-giornata-371` — esito in fondo a questo rapporto.

## Guardiani della zona NON girati (li giudica il treno)

La riga della MAPPA `src/18-|src/10-` e quelle di `src/08` (`src/0[0-8]-`), in particolare: `home-199`, `home-335`, `club-337`,
`classifica-259`, `avversario-106`, `etichette-108`, `momento-165`, `momento-165b`, `indice-163`, `career-critical`,
`save-compat`, `test:logic`, `design-system`, `griglia-mobile`. Il pronostico è testo nuovo dentro un `span` che esisteva già
(`data-cpm="peso106"`): `avversario-106` misura proprio quella riga e va guardato con attenzione.

## Foto (dpr 2)

- `docs/sviluppo/giro371/prima-home-1giornata-412.png` (rosso: «Nª in classifica»)
- `docs/sviluppo/giro371/dopo-home-1giornata-412.png`
- `docs/sviluppo/giro371/dopo-stagione-1giornata-412.png`

## Dubbi per il PO (la consigliata è la prima ed è già applicata)

1. **Quando le posizioni tornano.**
   - **A (applicata):** quando la tua squadra ha giocato la sua prima gara di campionato e c'è almeno un punto in classifica.
   - B: dalla 2ª giornata in calendario, anche se la tua gara è stata rinviata.
   - C: dalla 3ª giornata (dopo una sola gara la classifica dice ancora poco).
2. **Le parole del pronostico.**
   - **A (applicata):** «📈 Pronostico: favoriti / ⚖️ partita aperta / 📉 sfavoriti», con 3 punti di forza al fattore campo.
   - B: senza fattore campo: il pronostico coincide sempre con «più forte / alla pari / più debole» che la card scrive già accanto
     alla forza (quindi è una ripetizione).
   - C: una percentuale («Vittoria 45% · Pari 28% · Sconfitta 27%»), da una formula da dichiarare.
   Nota onesta: con A può capitare «Forza 98/99 · più forte» accanto a «Pronostico: partita aperta» (avversario più forte di 8 ma
   tu in casa). È coerente con la regola, ma si legge come una piccola contraddizione.
3. **La tabella della Classifica alla 1ª giornata** mostra ancora i numeri 1…N in ordine d'elenco (non è nel perimetro di PO-420,
   che parla di posizione ed etichette fuori dalla tabella).
   - **A (applicata = lasciata com'è):** la tabella resta, è la classifica; i numeri sono la riga.
   - B: alla 1ª giornata la tabella in ordine alfabetico, senza numeri.
   - C: tutte le righe con «—» al posto della posizione.
4. **Il peso della partita (`calcMatchWeight`)** alla 1ª giornata dà ancora +1 per «prime tre contro prime tre» calcolato
   sull'ordine dell'elenco. Non si vede come etichetta (nel pre-partita vincono derby/ex/rivale), ma entra nel peso. Non l'ho toccato
   perché è motore/carriera e cambierebbe numeri giudicati da altri guardiani.
   - **A (applicata = non toccato):** lasciarlo, dichiarato qui.
   - B: applicare `classificaViva371` anche lì (catena completa).

## Esito delle sentinelle

`node ci-runner.mjs giro prima-giornata-371` sul commit 190422d: **17/18 verdi**. Unico rosso **`home-298`** (sentinella), braccio D:
«a classifica ferma «Si parte da zero» ≠ regola di prima «−0 dalla vetta»». Non è un difetto del gioco: il giro 298 aveva fissato
apposta, a classifica ferma, la riga di prima, scrivendo «la 1ª giornata e' di PO-420». Ho aggiornato quell'attesa (e il commento
in testa al file) a «Si parte da zero». Nessuna soglia abbassata: è la nuova regola di PO-420 al posto della vecchia. Rigiocato da
solo dopo la modifica: `npm run home-298` **uscita 0** (verde, e rosso `__CPM_NO_G298` bocciato con 63 rilievi).
Il treno rigiudica `home-298` insieme al resto.

File toccato in più: `tests/visual/home-298.mjs` (attesa del braccio D a classifica ferma).
