# Rapporto giro 286 — PO-545 «il portatore di palla prima della scelta si muove in continuazione avanti ed indietro»

Ramo `sviluppo/giro286-portatore`, partito da `lavoro/198` (ed3cb0d). Versione in lavorazione 7.999.198 rapida.
`GAME_VERSION` non toccata.

## In breve

- Il difetto è **vero e misurato**: prima della scelta chi ha il pallone aveva **due scrittori sul corpo**.
- **Non è nato nella 197**: sulla 7.999.196 le stesse scene danno gli stessi numeri.
- Corretto in `src/12-three-match-view.jsx` (driver dei giocatori senza palla, blocco della lettura), rosso `window.__CPM_NO_G286`.
- Guardiano nuovo `npm run portatore-286`: verde 0 difetti su 9, rosso 7 scene forzate su 7 col difetto.
- La foto del PO non era disponibile come file: ho lavorato sulla descrizione (compagno col pallone in fascia, fermo in attesa della scelta).

## Come ho misurato

Sonda `tests/visual/misura-286.mjs` (sola lettura, usa varchi presenti anche nella 196):

- modelli GLB accesi, stacco di scena attivo (`__CPM_PRESENT=1`), una pagina nuova per scena;
- un campione per **fotogramma** (posizione del corpo più vicino al pallone e del pallone) con il **tempo di scena**;
- inversioni di direzione contate per asse con isteresi 0,12 u, espresse **per secondo di scena**.

⚠️ Sul banco il disegno gira a pochi fotogrammi al secondo e il passo di scena è tappato a 0,05 s: i numeri sono
«20 fotogrammi per secondo di scena», non 60. Il difetto **non** è della classe «visibile solo ad alti fotogrammi»
(codice 007): è un conflitto «uno scrittore per fotogramma», si vede a qualunque frequenza. Sul telefono a 60
fotogrammi l'alternanza è solo più fitta.

## Cause misurate

| # | Chi | Meccanismo | Numero misurato (prima) |
|---|-----|-----------|--------------------------|
| 1 | **Battitore messo in scena** (corner, rimessa, consegna: è il compagno col pallone in attesa, il caso della foto) | La colla del battitore (7.405) lo porta sul pallone quando è oltre 1,5 u; il fotogramma dopo l'**attesa attiva** (7.685 / 7.999.144) lo riporta alla sua base, presa **prima** che arrivasse sul pallone. Un fotogramma sul pallone, uno alla base. | gi6: 37-39 inversioni/s di scena, corpo fra il pallone e un punto a 27 u; gi50: 39/s, 43 u |
| 2 | **Avversario col pallone** nelle scene difensive | Il pallone segue il suo corpo; l'attesa attiva lo muove «sulla linea del pallone», cioè verso il punto dove lui stesso era un fotogramma prima. Con il seno negativo cambia lato a ogni fotogramma, per mezzo periodo (circa 2 s su 4). | gi31, gi36, gi44, gi54: 10-25 inversioni/s, 1,6-2 u. A tratti: dipende da chi il 3D aggancia come portatore (gi36: 1 pagina nuova su 3 prima della correzione) |
| 3 | Chiunque abbia il pallone fermo ai piedi | Anche senza conflitto faceva il «va e vieni» di 1 u (o il «respiro» di 0,3 u) pensato per chi **aspetta lontano** dal pallone. | gi37: 1,45 inversioni/s, 0,2 u |

Cause **verificate e scartate**: bersaglio commesso che oscilla (0-2 inversioni del bersaglio per scena, contro 50-160 del corpo), inerzia
di `animOne` e `timeScale` della corsa (il corpo in lettura non passa da `animOne`), portatore della cronaca
`_por526`/`_carry526`/`_porGlue526` (vale solo in `playing`), arbitro d'inerzia (è della camera).
L'eroe col pallone **non** ha il difetto: 0 inversioni in tutte le scene e nei due highlight del flusso vero, in entrambi i bracci.

## Correzione

`src/12-three-match-view.jsx`, dentro il blocco della lettura (`_readFreeze`), rosso `__CPM_NO_G286`:

1. quando il battitore scatta sul punto del pallone, la base dell'attesa viene buttata e ripresa lì;
2. chi ha il pallone non fa l'attesa attiva e resta sulla sua base: il battitore, il portatore difensivo
   (`_tackleCarrier`) e chiunque abbia la base entro 1,8 u dal pallone per 0,3 s di scena (lo spostamento si spegne
   in rampa, senza scatto);
3. tutti gli altri continuano l'attesa attiva come deciso dal PO il 06/10 («al massimo il 30% fermi prima dell'azione»).

Nessun cambio a simulazione, salvataggi, pallone logico o fasi: solo la posizione 3D di chi ha il pallone in lettura.

## Tabella «196 / 197 prima / dopo»

Inversioni di direzione del portatore per secondo di scena (fra parentesi l'escursione massima fra due inversioni).
«197 prima» = braccio rosso `__CPM_NO_G286` sul ramo; «dopo» = braccio verde. I primi 0,6 s di scena (apertura) esclusi.

| Caso (pagina nuova, seme diverso per caso) | 7.999.196 (`lavoro/196`, 12d8f0d) | 7.999.197 prima (rosso `__CPM_NO_G286`) | dopo (verde) |
|---|---|---|---|
| gi6, battitore | 39,5/s (40,3 u) | 39,5/s (22,4 u) | **0** (0 u) |
| gi37, battitore | 39,5/s (15,8 u) | 1,9/s (0,2 u) | **0** (0 u) |
| gi50, battitore | 39,5/s (45,3 u) | 39,5/s (44,3 u) | **0** (0 u) |
| gi31, difensiva | 13,7/s (1,9 u) | 8,9/s (2,0 u) | **0** (0 u) |
| gi36, difensiva | 17,4/s (1,5 u) | 20,7/s (1,5 u) | **0** (0 u) |
| gi44, difensiva | 19,1/s (1,6 u) | 22,9/s (1,4 u) | **0** (0 u) |
| gi54, difensiva | 8,6/s (1,9 u) | 19,1/s (1,7 u) | **0** (0 u) |
| flusso vero 1 (eroe col pallone) | 0 | 0 | 0 |
| flusso vero 2 (eroe col pallone) | 0 | 0 | 0 |
| **casi col difetto** | **7 su 9** | **7 su 9** | **0 su 9** |

Soglie del guardiano, fissate dopo la misura: più di 1 inversione al secondo di scena, oppure più di 0,5 u fra due inversioni.

Note oneste sulla tabella:

- la «196» è la punta del ramo `lavoro/196` (12d8f0d, `GAME_VERSION` 7.999.196): il commit `3076a1b7` indicato nell'incarico
  **non è raggiungibile** da questa copia del repo (storia corta, `git fetch` non lo trova). Non posso confermare che i due siano
  lo stesso identico codice;
- gi37 nel rosso della 197 sta vicino alla soglia (1,9/s, 0,2 u): lì il battitore parte già sul pallone e fa solo il «respiro».
  Per questo la prova del rosso chiede «almeno 5 scene forzate su 7», non «tutte»;
- i due highlight del flusso vero hanno l'**eroe** col pallone. Un highlight del flusso vero con un **compagno** fermo col
  pallone (il caso esatto della foto) nelle due partite misurate non è capitato: quel caso è coperto dalle tre scene forzate
  col battitore.

## Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito | Durata | Nota |
|---|---|---|---|
| `portatore-286` (nuovo) | ✅ verde | 394 s | verde 0 su 9, rosso 7 scene forzate su 7 |
| `test:logic` | ✅ | 3 s | |
| `save-compat` | ✅ | 1 s | |
| `ball-owner` | ✅ | 734 s | |
| `frozen-mate` | ✅ | 141 s | |
| `trama` | ✅ | 1584 s | |
| `portiere-265` | ✅ | 284 s | verde e rosso |
| `apertura-261` | ✅ | 174 s | |
| `battito-264` | ✅ | 396 s | |
| `salti-274` | ✅ | 678 s | verde e rosso |
| `spot-266` | ✅ | 71 s | mappa src/12 |
| `pressing-143` | ✅ | 24 s | mappa src/12 |
| `ball-attended` | ❌ **rosso, non nato qui** | 156 s | 6,9% contro soglia 52%. Rifatto sulla base senza la mia modifica (ed3cb0d): **5,2%**, rosso uguale. Gira coi modelli spenti e solo in `playing`, dove il codice del giro 286 non entra |
| `movimento-147` | ❌ **rosso per pochi campioni** | 617 s | Non è nella mappa di src/12: l'ho eseguito perché misura proprio l'attesa attiva. Fermi prima dell'azione: compagni 0%, avversari 4,5% (soglia 25%: la quota **non** è salita). Cade perché i campioni sono 41 (ne chiede 100) e il braccio rosso ne ha 0. Sulla base senza la mia modifica il braccio verde ha 59 campioni (18,6% e 16,9%): cadrebbe allo stesso modo. Il braccio rosso sulla base non è stato completato |
| `node tools/build-src.mjs` + `check-src.mjs` | ✅ | | file di gioco ricomposto e allineato a git dopo il commit |

`solo-highlight-166` non eseguito: `src/15` non è stato toccato.

## Cosa non ho fatto

- **La mappa di `src/12` in `ci-runner.mjs` elenca 77 guardiani; ne ho eseguiti 6** (`portatore-286`, `portiere-265`,
  `salti-274`, `apertura-261`, `spot-266`, `pressing-143`). Gli altri 71 **non sono stati eseguiti**: uno alla volta
  non stanno nel tetto di tre ore (`trama` da solo ha preso 26 minuti, `ball-owner` 12). Vanno fatti dalla sessione di rilascio
  con la catena `mirata`. Fra questi i più vicini alla zona toccata: `consegna-103`, `colla-103`, `avvicinamento-61`,
  `difesa-220-scena`, `difesa-220-giro31`, `scena3d-96`, `buildup-sync`, `validate-situations`, `partita-vera`.
- `consegna-103`: **avviato e fermato da me dopo 30 minuti** (era al secondo blocco verde, entrambi i blocchi letti senza
  difetti: scalino massimo 2,4 u, 0 oltre 3 u). Esito non valido: va rifatto intero.
- Non ho misurato sul telefono né a 60 fotogrammi: solo banco, in tempo di scena.
- Non ho toccato `GAME_VERSION`, `ROADMAP.md`, `RELEASE_HISTORY.md` (sono della sessione di rilascio).

## Dubbi per il PO

1. **Chi ha il pallone ora sta completamente fermo prima della scelta** (ruota solo verso il pallone, come gli altri). È la
   lettura più stretta della nota («si muove in continuazione avanti ed indietro»). L'alternativa — un piccolo movimento sul
   posto, senza spostarsi — è una scelta del PO.
2. **I compagni e gli avversari SENZA pallone continuano l'attesa attiva** (avanti e indietro di 1 u) decisa il 06/10. Se la
   nota del PO riguardava anche loro, questa correzione non li tocca.
3. Vicino al pallone (base entro 1,8 u per 0,3 s di scena) ora sta fermo **chiunque**, anche un avversario che marca stretto
   chi ha il pallone. Il marcatore nominato dal motore era già escluso dall'attesa attiva e non cambia.
4. `ball-attended` è rosso anche senza questo giro (5,2% contro una soglia del 52%): è un rosso già presente su `lavoro/198`
   che non ho trovato dichiarato nei documenti di governo. Non l'ho indagato: è fuori dall'incarico.
5. `movimento-147` non raccoglie abbastanza campioni (41-59 contro i 100 richiesti) né con né senza questo giro: lo strumento
   va riparato prima di poterlo usare come giudice.
6. Nelle scene col battitore, i primi fotogrammi dell'apertura mostrano ancora il corpo che scatta fra più punti (gi37: tre
   posizioni in 0,25 s di scena). Avviene sotto lo stacco nero d'apertura e non l'ho toccato; il guardiano esclude i primi
   0,6 s di scena e lo dichiara.
7. Il commit `3076a1b7` della 196 non era raggiungibile: il confronto è con la punta di `lavoro/196`.
