# Rapporto di collaudo 3D — CPM 7.999.174

- **Build:** `main` f6a73df (GAME_VERSION 7.999.174), ramo `collaudo/7.999.174-3d`. GLB acceso, 412×915, Chromium headless (`CPM_CHROME=/opt/pw-browsers/chromium`). Nessun file di prodotto modificato.
- **Foto:** `docs/collaudi/foto-7.999.174-3d/` (fogli `foglio-*.jpg` = riassunto; singoli fotogrammi accanto). Sonde: `foto-174.mjs`, `partite-174.mjs` (in quella cartella).
- **Verdetto:** nessun difetto di gravità alta. Le tre note del taccuino (PO-282/283/284) risultano corrette sulle scene provate; un margine stretto su `piedi-252` (media) e alcune osservazioni minori (bassa).

## Tabella dei rilievi

| # | Gravità | Rilievo | Prova |
|---|---|---|---|
| 1 | **Media** | Il pattinamento dei piedi nello scatto dell'eroe (giro 76) ha un margine quasi nullo: `piedi-252` braccio verde, mediana **0,395** contro soglia **0,40** (alzata da 0,36 con la decisione del 19/10 21:15). Scene: tiro 0,488 (40/82 fotogrammi), testa 0,395, cross 0,383, passaggio 0,241. Il commit del giro 76 dichiarava 0,353/0,366; il verde del giro 22 era 0,298. Braccio rosso 0,506 (margine rosso−verde 0,11 ≥ 0,08: il guardiano vede il difetto). | `npm run piedi-252` eseguito in questa sessione, uscita 0 («✅ piedi-252 VERDE»); log nel rapporto, numeri sopra. Non posso confermare se a occhio sul telefono il pattinamento si veda. |
| 2 | Bassa | PO-284: nell'apertura dell'angolo (284f, seme 11) il codice 001 compare in **6/18** campioni (33%), battitore dichiarato (1). Il guardiano passa perché pretende ≥75%; semi 3 e 29: 0/22 e 0/23. Il backlog riporta «0 aperture con 001 su 3». | `node corpi-073.mjs` (uscita 0, «verde 282,283,284f»); riga `284f seme 11 campioni 18 · 001 in 6/18`. Non verificato se sia un transitorio dei primi fotogrammi. |
| 3 | Bassa | Nelle 5 foto dell'apertura dell'angolo (scena forzata col gancio `__CPM_MP_PLACE073`) il pallone non si vede e il battitore sta tagliato sul bordo sinistro del quadro. | `284-apertura-angolo-1..5.jpg`, `foglio-s284.jpg`. Condizione artificiale (gancio test-only): nel flusso vero NON verificato. |
| 4 | Bassa | Giro 72 «fra le linee»: una scena su sei ha l'eroe fuori quadro a pallone fermo/post-arco 10/40 fotogrammi (25%): partita 2, 3' «Ricevi fra le linee: hai spazio!» (esito non letto, `undefined`). Il guardiano nel complesso è verde (4,2% ≤ 15%; coda 0/100; soggetto sull'eroe 172/172). | `node linee-61.mjs --guardiano` su partite 1,2,3 (uscita 0, «✅ PASS»). Una scena sola: non basta per parlare di regressione. |
| 5 | Bassa | Stessa partita (nome+seme autoplay identici) rigiocata due volte dà esiti diversi: prima corsa p1 gol 0-1 al 9', 1-1 al 64', 2-1 al 73'; seconda corsa p1 1-0 al 28', 1-1 al 48', 1-2 al 73'. Prima corsa fatta con un'altra sonda in parallelo (CPU contesa), la seconda da sola. | Nomi dei file foto della prima corsa (`gol-9-home0away1`…) visti a schermo e foto della seconda (`partita-p1-05-gol-28-home1away0.jpg`…). Causa NON indagata: può essere la scelta dell'autoplay legata al tempo reale (`__CPM_REALWAIT`), non il motore. |
| 6 | Bassa | Nel 2° tempo l'intestazione del punteggio inverte l'ordine delle squadre («Polisportiva … 2 – 1 Selezione Granata» dal ~48'). I numeri sono coerenti con tabellone 3D e risultato finale. | `foglio-m1.jpg` (20' contro 55'/80'), ritaglio al volo. Non so se sia voluto (cambio di campo): non confermabile dal codice letto. |
| 7 | Bassa (nota) | Console: «[BABEL] … deoptimised the styling of /Inline Babel script as it exceeds the max of 500KB» in tutte e tre le partite. Nessun `pageerror`. | `docs/collaudi/foto-7.999.174-3d/dati-partite.json`, campo `errs`. |

## Cosa ho provato e cosa è risultato

| Voce | Esito | Prova |
|---|---|---|
| **PO-282** recupero «Anticipa sul primo controllo» | ✅ eroe in piedi in tutto l'esito | `foglio-s282a.jpg`; inclinazione bacino 4,7°–12,9° in 12 fotogrammi (clip `kick~m`); guardiano: 3 semi, max 16°, quota >45° = 0% |
| **PO-282** «Fra le linee / Tiro da fuori» (compreso lo scatto) | ✅ in piedi | `foglio-s282b.jpg`; inclinazione max 16,1° su 30 fotogrammi (clip `mx-strike-foward-jog`); guardiano 16°, 0% |
| **PO-283** angolo «Stacco in corsa potente» | ✅ colpo di testa, poi disappunto coi piedi a terra, nessun calcio | `foglio-283s.jpg`, `foglio-283z.jpg` (ingrandimento): clip `header` 2,1–3,4 s di scena, poi `mx-disappunto` 3,6–5,2 s, busto che si piega fino a 21° con mani alla testa. Guardiano: punta del piede più bassa 0,15/0,17/0,15 m (soglia 0,25; rosso 0,54) |
| **PO-284** apertura dell'angolo | ✅ con riserve (righe 2-3) | guardiano 284f: battitore dichiarato in 3 semi su 3; 001 0/22, 6/18, 0/23 |
| **Giro 76** piedi nello scatto | ⚠️ riga 1 | `piedi-252` |
| **Giro 76** passaggio corsetta→scatto non brusco | **Non verificato** | vedi sotto |
| **Giro 72** eroe in quadro «fra le linee» | ✅ | `linee-61`: fuori quadro in volo 13/210 (6,2%), a pallone non in volo 13/306 (4,2%) |
| **Giro 72** pallone in partita | ✅ a vista | pallone visibile e di taglia normale nelle foto di `partita-*` (`foglio-m1..m3`); misura numerica `pallone-278` non eseguita |
| **3 partite intere** (autoplay seed 1571/1642/1713) | ✅ tutte e tre arrivano al 90', fischio finale e schermata risultato | fasi per partita: p1 6 highlight (1-2), p2 6 (2-0), p3 7 (2-3); gol, banner di gol/«CAPOLAVORO», pannello del mister, cronaca 2D, pagella finale: `foglio-m1/m2/m3.jpg`. Durata 247/250/257 s reali. 0 `pageerror` |

## Metodo e correzione di una mia svista
La prima serie di foto del recupero (282a) mostrava «Raddoppio coordinato» al posto di «Anticipa…»: l'autoplay del gioco aveva scelto per primo. Rifatte con `__CPM_FORCE_INTRO=1` e attesa di `hl_choose` prima di forzare l'azione; il testo dell'esito è stato letto dal DOM («Anticipa sul primo controllo»). Le foto in cartella sono solo della serie corretta. Le foto in headless costano ~0,6 s l'una: i gesti si scelgono per tempo di scena (`__CPM_SCENET`) e gesto montato (`__CPM_GST`), non a orologio.

## Non verificato
- **Corsetta→scatto non brusco (giro 76)** e il pattinamento a occhio: serve il movimento a ~60 fps, l'headless gira a pochi fps; nessun guardiano numerico della brusquerie eseguito. Giudizio al telefono del PO.
- **Apertura dell'angolo nel flusso vero** (`corpi-073 284v`, partite complete con angoli del motore): non eseguito (lento, gli angoli escono di rado).
- **PO-282 su più semi per «Fra le linee»:** solo il seme 3; per il recupero 3 semi (guardiano) + 1 (foto).
- **Esiti per highlight delle tre partite:** non tabulati (a partita finita lo stato `__CPM_TIMELINE` non è più leggibile dalla mia sonda: `fin` vuoto); esiti letti dalle foto soltanto. Le partite sono giocate dall'autoplay, non da una persona.
- **Colpi di scena rari:** rigori, espulsioni, infortuni non incontrati nelle 3 partite.
- **Misura numerica del pallone (`pallone-278`)** e dei gesti dei compagni: non rilanciate.
- **Determinismo (riga 5):** causa non indagata.
- Dispositivo reale, fps e peso: non misurabili qui.

## Scelte per la sessione principale
**Riga 1 (piedi-252, margine nullo):**
- **A (consigliata):** lasciare la 174 com'è, dichiarare nel backlog la soglia 0,40 come provvisoria e far giudicare il pattinamento al PO sul telefono (il guardiano resta, il rosso è visibile 0,11 sopra il verde).
- B: nuovo giro sulla corsa dello scatto per portare la mediana verso 0,30 (costo: un giro e una catena).
- C: riportare la soglia a 0,36 — oggi sarebbe rosso (0,395): non consigliata senza B.
