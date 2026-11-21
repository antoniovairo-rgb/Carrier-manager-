# Giro 313 — Pulizia del BACKLOG (sola lettura)

Ramo `sviluppo/giro313-pulizia-backlog`, partito da `poc/marioprada-character-system` (d71dfe5, gioco 7.999.200).
Richiesta del PO: «nel backlog ci sono molte richieste aperte ma credo siano obsolete». Limite settimanale in avviso:
**nessun browser, nessun controllo eseguito**. Ho letto solo file e git: `docs/governo/BACKLOG.md` (sezione «Voci aperte o
parziali», 109 righe contate una per una), `ROADMAP.md`, `DECISIONI.md`, `ROSSI-DICHIARATI.json`, i rapporti
`docs/sviluppo/RAPPORTO-giro*.md`, `src/` con `grep -n`, e `git log --all` su tutti i 546 rami remoti (commit dal 13/11).
**BACKLOG.md non è stato modificato**: lo aggiorna la sessione madre dopo l'OK del PO.

## Esito in breve

| classe | voci | cosa vuol dire |
|---|---|---|
| **A — già fatta** | **5** | il codice o una release la copre: si può chiudere |
| **B — superata** | **1** | un lavoro successivo la rende inutile: si può chiudere |
| **C — ancora valida** | **90** | non ho trovato niente che la copra |
| **D — dubbia, serve il PO** | **13** | la domanda è nella tabella, con tre risposte (la consigliata per prima) |

**L'ipotesi del PO regge solo in parte.** Le voci davvero vecchie sono le dieci «RESIDUO IN STABILITÀ» del 24/09–14/10
(PO-022…PO-250) più PO-153 e PO-167: due sono fatte (A), una è superata (B), sette vanno al PO (D) perché le ha parcheggiate
lui stesso il 20/10 («Solo se emergono», DECISIONI:651), e quella decisione non le rende inutili da sola. **Le altre 97 voci
sono del 10–21/11**: sono state spostate di numero in numero (197 → 198 → 201) ma non sono mai state fatte. Le prove: ROADMAP:90
(«NON fatte nella 197: PO-349, 356, 386, 391, …»), DECISIONI:1915 («198 = blocchi 1+2 … tutto il resto passa alla 199», 63 voci
elencate), e il contenuto delle 7.999.199 e 7.999.200 (ROADMAP:92-93), che elenca altre voci (PO-518…572 e PO-592/596/597).
Sono richieste nuove, non obsolete.

**Attenzione a tre «falsi fatti»** che sembrano chiusi e non lo sono:
- **PO-391** (popolarità a gradini): il giro 235 ha fatto solo la *forma* grafica (`GradiniV235`, src/11:328; RAPPORTO-giro235:149
  «Considero PO-391 fatta per la forma»). La proposta originale G181-12 (commit 215f8c12, `docs/collaudo/GIRO181-IDEE.md`:186-189)
  chiede gradini conquistati con un fatto che sbloccano testi e sponsor, e questo non esiste. Resta **C**.
- **PO-476** (inno): il giro 267 ha prodotto solo anteprime MP3 e una pagina d'ascolto (commit 4bf15c80, 7d51ae35). In
  `assets/audio/music/` non c'è nessun inno (awards, career, ceremony, menu). Resta **C**.
- **PO-554** (nastro della competizione verticale): il giro 285 lo ha solo spezzato davanti al tunnel; è ancora un piano steso
  a terra (`bm.rotation.x=-Math.PI/2`, src/12:2757). Resta **C**.

## Tabella

Legenda prova: `src/NN:riga` = file in `src/`; «D:n» = riga di `docs/governo/DECISIONI.md`; «R:n» = riga di
`docs/governo/ROADMAP.md`; «B:n» = riga di `docs/governo/BACKLOG.md`; «g NNN» = `docs/sviluppo/RAPPORTO-giroNNN.md`.
«Nessuna traccia» = 0 occorrenze dell'ID e del codice G… in `src/`, nei rapporti di giro e nei messaggi di commit di tutti i
rami: **non posso confermare che sia fatta**, quindi C.

### Voci di stabilità e residui (24/09 – 14/10)

| voce | titolo breve | classe | prova | proposta |
|---|---|---|---|---|
| PO-167 | Salvataggi persistenti (Parte B) | **A** | persistenza chiesta al browser dalla 7.999.173 (src/08:1028-1034, `__CPM_PERSIST167`); copia di riserva degli slot prima di sovrascrivere (src/08:863-878); ripristino dalla copia (src/19:957, 1028); avviso di salvataggio fallito (src/18:932, 950, 971). La frase nella fonte («persist() non compare nel codice») non è più vera | chiudere; IndexedDB non fatta (era «eventuale») |
| PO-153 | Diagnosi misurata dei sistemi di carriera (Codex) | **B** | fase 1-bis consegnata (giro 49, citata nella voce); la misura dei sistemi di carriera è stata rifatta e applicata dai giri 309 (carriere da bandiera, sola misura), 310 (sei correzioni, guardiano `bilancio-310`) e 311, nella 7.999.200 (R:93) | chiudere |
| PO-022 | Un solo motore per simulata, 3D e cronaca | **D** | parcheggiata dal PO il 20/10 (D:651); dalla 7.999.200 le giornate simulate usano il motore e non lo stampo (g310 riga A, `__CPM_NO_G310A`); le scene si pescano ancora dal catalogo scritto (nota PO-093 nella voce) | **Domanda:** chiudere il residuo ora che la simulata usa il motore? — (1) Sì, chiudere; si riapre se un collaudo lo trova (consigliata) · (2) No, resta aperta fino alle scene generate solo dal motore · (3) Trasformarla in una voce nuova e misurabile |
| PO-068 | Completare i gesti P1-b, P2, P3 | **D** | parcheggiata il 20/10 (D:651); la tabella `GESTI` esiste (CLAUDE.md, 7.534); le clip mancanti oggi hanno voci proprie (PO-505 doppio passo, PO-525 sterzata) | **Domanda:** chiudere l'ombrello e tenere solo le voci delle clip? — (1) Sì, restano PO-505 e PO-525 (consigliata) · (2) No, resta aperta · (3) Rifare un censimento dei gesti prima di decidere |
| PO-220 | Chiusure difensive poco precise | **D** | parcheggiata il 20/10 (D:651); giro 31 consegnato (5,1 → 1,8 u); dopo: `difesa-252`, `intercetto-291` verdi nella 7.999.198 (R:91); il difetto vicino ha ora una voce propria (PO-587) | **Domanda:** chiudere e lasciare PO-587 come voce attiva sulla difesa? — (1) Sì (consigliata) · (2) No, resta aperta · (3) Fonderla dentro PO-587 |
| PO-224 | Pop-up dentro «Vivi la Settimana» al posto dei riquadri | **D** | parcheggiata il 20/10 (D:651); 7.999.161 parziale; il collaudo 160 ha visto 1 finestra su 6 e chiedeva un nuovo collaudo, che non ho trovato; la Home è stata ripulita dopo (giro 298, PO-558/559/571/572) | **Domanda:** serve ancora? — (1) Ricollaudarla in una carriera intera e chiudere se va (consigliata) · (2) Chiudere subito · (3) Lasciarla aperta |
| PO-228 | Statistiche realistiche (passaggi, cross, dribbling) | **D** | parcheggiata il 20/10 (D:651); ritaratura dei passaggi pronta nel giro 32 e mai adottata; il bilanciamento di oggi passa da giri 309-311 e da PO-599 (gol del motore) | **Domanda:** chiudere e tenere solo PO-599? — (1) Sì, PO-599 copre la taratura del motore (consigliata) · (2) No, rimisurare anche passaggi/cross/dribbling · (3) Fonderla in PO-599 |
| PO-229 | Rifinitura degli highlight dell'eroe | **D** | ombrello parcheggiato il 20/10 (D:651); le segnalazioni del PO dopo il 20/10 arrivano come voci specifiche (PO-585, PO-587, PO-591…) | **Domanda:** chiudere gli ombrelli PO-229 e PO-248? — (1) Sì, valgono le voci specifiche (consigliata) · (2) No · (3) Tenere solo PO-248 come obiettivo generale |
| PO-248 | Fluidità e credibilità degli highlight «a tutto tondo» | **D** | come PO-229 (D:651); comprende PO-229, PO-218, PO-242, PO-022/068/123 per sua stessa descrizione | stessa domanda di PO-229 |
| PO-250 | Punizione crossata raccontata «Filtrante perfetto» | **A** | giro 41: la frase della chance si sceglie per famiglia e col seme (src/05:310-321 `_CHANCE_TX241`; src/15:10434-10440, rosso `__CPM_NO_CHANCE241`): il pallone messo in area usa le frasi «aerea» | chiudere |

### Voci del 10–21/11

| voce | titolo breve | classe | prova | proposta |
|---|---|---|---|---|
| PO-349 | Regola (H) ritira una giornata al caricamento | C | nessuna traccia; non fatta nella 197 (R:90); il giro 310 ha toccato lo stampo all'arrivo, non il caricamento (g310 riga A) | tenere |
| PO-356 | Primavera troppo limitante | C | parziale nel giro 191 (Indice Primavera, avanti veloce); non fatta nella 197 (R:90) | tenere |
| PO-376 | Pochi highlight che partono dalle fasce | C | nessuna misura trovata | tenere (è una misura) |
| PO-377 | Due marcatori diversi per lo stesso gol | C | nessuna traccia | tenere |
| PO-381 | Piano del mister come sfida con premio | C | nessuna traccia (G181-08 assente in src) | tenere |
| PO-382 | «Le tue leggende» | C | nessuna traccia (G181-15) | tenere |
| PO-383 | «Bentornato» e cartolina di fine stagione | C | nessuna traccia (G181-18/19) | tenere |
| PO-386 | Niente schede vuote in Primavera | C | nessuna traccia (G181-05); non fatta nella 197 (R:90) | tenere |
| PO-387 | «Festeggia con la squadra» mostra una festa | C | nessuna traccia (G181-07) | tenere |
| PO-388 | Galà con la sorpresa vera | C | nessuna traccia (G181-03) | tenere |
| PO-389 | Scelte dell'azione distinguibili a parole | C | il giro 197 ha solo alzato le righe «c'è posto per i testi più lunghi di PO-389» (g197:38; src/15:12875): testi non cambiati | tenere |
| PO-390 | Nuove sfide a metà carriera | C | nessuna traccia (G181-14) | tenere |
| PO-391 | Popolarità e fiducia a gradini | C | solo la forma grafica (src/11:328, g235:149); i gradini conquistati con fatti e gli sblocchi (G181-12, `GIRO181-IDEE.md`:186-189 in 215f8c12) non esistono | tenere; annotare «forma fatta nel giro 235» |
| PO-392 | Studio dell'avversario che paga | C | nessuna traccia (G181-11) | tenere |
| PO-394 | Lotta per non retrocedere come storia | C | nessuna traccia (G181-17) | tenere |
| PO-395 | Il filo del paese | C | nessuna traccia (G181-16) | tenere |
| PO-398 | Residuo raro di `riproduci-175` (1 su 45) | **D** | non riprodotto (D:1486); `riproduci-175` e `riproduci-187` verdi nelle verifiche della 194 (R:87) e della 196 (R:89); non compare in `ROSSI-DICHIARATI.json` | **Domanda:** chiudere come non riprodotto? — (1) Sì, si riapre se il treno lo vede rosso (consigliata) · (2) No, cercarlo con 100 ripetizioni · (3) Declassarla a nota in `PROCESSO.md` |
| PO-399 | Rigore dell'eroe calciato due volte | **A** | giro 191 (commit f5302bc2, b4ad6ae8, guardiano `rigore-191`); il resto è passato a PO-450, **FATTO 16/11** (B:529, giro 204, `piazzato-204`) | chiudere |
| PO-413 | Mai una partita da una sola azione (almeno 4 tocchi) | C | nessuna traccia (G189-01); il codice ha solo il tetto di 7 scene (src/15:1952), non un minimo | tenere |
| PO-414 | «Alla prossima occasione»: saltare i minuti senza pallone | **D** | nessuna traccia (G189-02); esistono però «Gioca solo i momenti salienti» in ogni partita (PO-494, D:1673) e «Vai al prossimo momento» (PO-384, R:85) | **Domanda:** serve ancora un tasto dentro la partita? — (1) Sì, tasto in partita oltre alla modalità salienti (consigliata: è la richiesta del PO e la modalità si sceglie solo prima del fischio) · (2) No, basta la modalità salienti · (3) Rivederla dopo aver giocato la 7.999.200 |
| PO-415 | Il filtrante buono vale anche se il compagno sbaglia | C | nessuna traccia (G189-03) | tenere |
| PO-416 | Gerarchia dei piazzati in scheda Club | C | nessuna traccia (G189-04) | tenere |
| PO-417 | Nomi senza equivoci (cognomi, «TESTA addosso», stadi) | C | nessuna traccia (G189-05); non fatta nella 197 (R:90) | tenere |
| PO-419 | Statura e peso coerenti, piede scelto alla creazione | C | il piede si calcola ancora dal nome alla creazione (src/17:440), nessuna scelta | tenere |
| PO-420 | Alla 1ª giornata niente posizione, c'è il pronostico | C | il codice stesso la rimanda: «la 1ª giornata e' di PO-420 (199)» (src/18:8192) | tenere |
| PO-421 | Giudizi che non si contraddicono | C | g235:149 «PO-421 … resta aperta» | tenere |
| PO-422 | La Primavera saluta | C | nessuna traccia (G189-10) | tenere |
| PO-423 | Galà visto dalla platea | C | nessuna traccia (G189-11); dipende da PO-388 | tenere |
| PO-424 | Valore di mercato credibile in Primavera | C | nessuna traccia (G189-12) | tenere |
| PO-425 | Apertura di stagione in due velocità | C | nessuna traccia (G189-13) | tenere |
| PO-426 | Amichevole del ritiro giocabile in breve | C | nessuna traccia (G189-14) | tenere |
| PO-427 | I numeri da bar | C | nessuna traccia (G189-15) | tenere |
| PO-429 | Partita su PC con colonna destra | C | nessuna traccia (G189-17); i giri 284/289/300 hanno compattato Home, pre-partita e Offerte da PC, non la partita | tenere |
| PO-433 | Rinnovo da bandiera | C | nessuna traccia (G193-02) | tenere |
| PO-434 | Capitano per merito | C | nessuna traccia (G193-04); il giro 302 ha solo il capitano di riserva più anziano (src/18:253, PO-590) | tenere |
| PO-435 | Traguardi fino a 500 gol | C | nessuna traccia (G193-05) | tenere |
| PO-436 | Fatti unici e settimane da trentenne | C | nessuna traccia (G193-06); non fatta nella 197 (R:90) | tenere |
| PO-437 | Compagni con un'età | C | nessuna traccia (G193-07) | tenere |
| PO-438 | L'ultimo contratto, tre strade | C | nessuna traccia (G193-08) | tenere |
| PO-439 | «La tua stagione fisica» dai 30 anni | C | nessuna traccia (G193-09) | tenere |
| PO-440 | Mondiale come cammino (riapre PO-155) | C | nessuna traccia (G193-10) | tenere |
| PO-441 | Traguardi in Nazionale | C | nessuna traccia (G193-11) | tenere |
| PO-442 | L'almanacco | C | nessuna traccia (G193-12) | tenere |
| PO-443 | L'ultima stagione e l'ultima partita | C | nessuna traccia (G193-13) | tenere |
| PO-444 | Verdetto della carriera nella pagina finale | C | nessuna traccia (G193-14) | tenere |
| PO-445 | «Un anno dopo» | C | nessuna traccia (G193-15) | tenere |
| PO-447 | «Dieci anni di te» | C | nessuna traccia (G193-17) | tenere |
| PO-454 | Meno finestre prima del calcio d'inizio | C | nessuna traccia (G195-14 assente in src, mentre G195-05/06/08/09/11/12/13/15 ci sono) | tenere |
| PO-462 | Intervista tagliata su PC 1366×768 | C | nessuna traccia | tenere |
| PO-463 | «Sempreverde» mai assegnata al ritiro | C | la sfida c'è (src/17:1403-1404), nessuna valutazione al ritiro trovata | tenere |
| PO-466 | Svincolato: «fermati un anno» | C | nessuna traccia | tenere |
| PO-467 | Provini: promesse delle offerte e titoli dopo il provino | C | il giro 201 ha fatto solo le parti (a)-(b) (PO-418, B:521) | tenere |
| PO-476 | Inno a centrocampo | C | solo anteprime e pagina d'ascolto (giro 267, 4bf15c80, 7d51ae35); nessun inno in `assets/audio/music/` | tenere |
| PO-505 | Doppio passo «fatto da noi» | C | solo ricerca (giro 242, a5769bb8); nessuna clip nuova | tenere |
| PO-515 | `difficolta-156` rosso | C | ancora rosso dichiarato nella 7.999.200 (`ROSSI-DICHIARATI.json`, chiave `banco`) | tenere |
| PO-516 | Rossi già della 196 → riparare | **D** | la lista di PO-516 (R:90) è più lunga di quella dichiarata oggi: `ROSSI-DICHIARATI.json` 7.999.200 elenca 10 guardiani + `sim-motore`; `finale-202`, `voto-79`, `giornale-244`, `schede-259/260`… non ci sono più, ma **non posso confermare** che siano verdi (la verifica della 199 non li nomina) | **Domanda:** come si tiene la lista dei rossi? — (1) Chiudere PO-516: vale solo `ROSSI-DICHIARATI.json`, una voce per ogni rosso che si ripara (consigliata) · (2) Tenerla aperta finché ogni guardiano della lista del 19/11 è stato rigiocato · (3) Far rigiocare al treno la lista del 19/11 e poi decidere |
| PO-517 | Verifica di rilascio troppo lunga | **A** | giro 308: modalità `giro` (guardiano + 17 sentinelle, ~50 min) e treno su GitHub Actions per la mappa intera (g308 §3-4; CLAUDE.md, «TRENO + CONTROLLI A LIVELLI»); nella 7.999.200 (R:93) | chiudere |
| PO-521 | Festa giudicata con partite vinte giocando | C | nessuna traccia | tenere |
| PO-522 | Evento che copre «Vai al rinnovo →» | C | nessuna traccia | tenere |
| PO-523 | Dopo-partita: salto nei lotti, partita intera al rilascio | C | nessuna traccia | tenere |
| PO-524 | Partita sul banco sempre più lenta | C | nessuna misura trovata | tenere |
| PO-525 | Sterzata «fatta da noi» | C | nessuna clip nuova | tenere |
| PO-526 | Scatto del braccio sinistro nella serata | C | nessuna traccia | tenere |
| PO-527 | Mappa del ci-runner: unione di tutte le righe | **A** | giro 308 (commit 5ad59c90): 75 righe → 11, `MAPPA.filter` al posto di `MAPPA.find` (g308:14, §1.1); nella 7.999.200 | chiudere |
| PO-528 | Leve per i controlli lunghi | **D** | il giro 308 ha solo **proposto** le leve («nessuna modifica fatta», g308 §5) e misurato che 9 su 10 vanno già a velocità 4; il treno fa girare i lunghi in parallelo su Actions | **Domanda:** servono ancora le leve ora che c'è il treno? — (1) Sì, solo «voci separate per seme» nel treno (consigliata: non tocca guardiani né soglie, g308 §5) · (2) Sì, tutte e quattro come deciso il 18/11 · (3) No, chiudere: il treno basta |
| PO-529 | Chromium del banco si collega a mtalk.google.com | C | le opzioni di lancio non spengono i collegamenti di fondo (`tests/visual/lib/harness.mjs`:121) | tenere |
| PO-531 | Camera che salta 120 ms dopo la richiesta del nero | C | nessuna misura trovata | tenere |
| PO-532 | Controlli con attesa fissa prima di leggere il salvataggio | C | nessun censimento trovato nei rapporti 293-311 | tenere |
| PO-533 | Parata: tifosi dipinti invece delle sagome | C | nella parata (src/16:2072 e seguenti) nessun uso di `buildFolla129`, che c'è solo nella serata (src/16:1217, 1637) | tenere |
| PO-537 | `parata-100` instabile | C | nessuna riparazione trovata; nel giro 295 «NON completato» (g295:138) | tenere |
| PO-538 | `pelle-240` instabile | C | nessuna riparazione trovata; dichiarato nella 7.999.198 (R:91) | tenere |
| PO-540 | Dubbi del giro 280 (bisezione sulla 197) | **D** | indagine a ritroso su una versione superata da 198, 199, 200; `schede-259/260` non sono più fra i rossi dichiarati di oggi | **Domanda:** fare ancora la bisezione sulla 197? — (1) No, chiudere; si riapre se `schede-*` tornano rossi nel treno (consigliata) · (2) Sì, farla · (3) Tenere solo il punto (3) sui controlli che leggono lo schermo ogni 400 ms |
| PO-541 | Dubbi del giro 282 (margine di lettura dell'esito) | **D** | la correzione del gioco c'è (giro 282, `esito-282`, D:1855); i punti aperti sono ricerche sulla 197 | **Domanda:** fare ancora le corse incrociate sulla 197? — (1) No, chiudere (consigliata) · (2) Sì · (3) Tenere solo il punto (4) (scena fino a 1,2 s più lunga su macchine lente) come misura |
| PO-554 | Nastro della competizione come pannello verticale | C | ancora piano a terra, solo spezzato davanti al tunnel (src/12:2757-2759, giro 285) | tenere |
| PO-555 | Card «Prossima»: cammino completo | C | nessuna traccia | tenere |
| PO-557 | Staff personale troppo facile da comprare | C | nessuna traccia | tenere |
| PO-561 | I movimenti contano davvero sulla riuscita | C | nessuna traccia | tenere |
| PO-569 | Albo e marcatori storici per campionato | C | nessuna traccia | tenere |
| PO-570 | Marcatori della stagione e storico per campionato | C | nessuna traccia | tenere |
| PO-573 | Salvataggio più nuovo rifiutato | C | il salvataggio con versione diversa viene ancora ritimbrato (src/17:2829) | tenere |
| PO-574 | Opzione «riduci scossa e lampi» | C | nessuna opzione; `prefers-reduced-motion` letto solo in punti singoli (src/15:11804, src/16:216, 355) | tenere |
| PO-575 | Guardiano del testo ingrandito | C | nessuna traccia | tenere |
| PO-576 | Limitatore sul master audio | C | nessuna traccia | tenere |
| PO-577 | Sonorità della partita in LUFS | C | nessuna traccia | tenere |
| PO-578 | Cursori del volume non lineari | C | nessuna traccia | tenere |
| PO-579 | Misura della compressione dei GLB | C | nessuna traccia | tenere |
| PO-580 | Risoluzione adattiva in partita | C | nessuna traccia | tenere |
| PO-581 | Scena di src/16:2112 con nitidezza 2 | C | la riga ha ancora `Math.min(2,…)` (src/16:2112), le altre scene 1,6 (src/16:367, 1582, 2574) | tenere |
| PO-582 | La scossa della camera arriva sullo schermo? | C | nessuna misura trovata | tenere |
| PO-585 | Nota KE: pallone tornato indietro (codice 012) | C | registrata il 20/11 (commit 1708afe7), nessun lavoro dopo | tenere |
| PO-586 | «Equilibrio che dura da anni» | C | nessuna traccia | tenere |
| PO-587 | Difensori che scivolano prima del tiro | C | il giro 301 l'ha guardata senza misurarla né toccarla (g301 §7) | tenere |
| PO-591 | Uscita dal tunnel: sagome appiccicate | C | registrata il 20/11 (commit 53633c42), nessun lavoro dopo | tenere |
| PO-593 | Tabellone delle curve troppo grande | C | decisione «negli angoli» (D:1943), nessun lavoro dopo | tenere |
| PO-594 | Dubbi 298/301 decisi: testata «G. 25/34 · Sett. 28» e altro | C | decisa il 20/11 (commit 3207ec89), nessun lavoro dopo | tenere |
| PO-595 | Titolo delle Formazioni centrato | C | registrata il 21/11 (commit e9ce085a), nessun lavoro dopo | tenere |
| PO-598 | Stato fisico per ogni giocatore della rosa | C | registrata il 21/11 (commit 06fc61a2); «in un vagone dopo» | tenere |
| PO-599 | Tarare i gol del motore | C | `sim-motore` ancora rosso dichiarato (2,29 contro 2,3, R:93) | tenere |
| PO-600 | Rilascio automatico dei vagoni | C (in corsa) | giro 312 sul ramo `sviluppo/giro312-rilascio-automatico` (55acb903 … 1190e122), **non ancora unito** in `poc` né in `lavoro/200` | tenere; chiudere all'unione del 312 |

## Domande per il PO (13 voci D in 12 domande: PO-229 e PO-248 insieme)

1. PO-022 — chiudere il residuo «un solo motore» ora che la simulata usa il motore? → (1) Sì (consigliata) · (2) No · (3) Voce nuova misurabile
2. PO-068 — chiudere l'ombrello dei gesti e tenere PO-505/525? → (1) Sì (consigliata) · (2) No · (3) Censimento prima
3. PO-220 — chiudere e tenere PO-587 sulla difesa? → (1) Sì (consigliata) · (2) No · (3) Fondere in PO-587
4. PO-224 — pop-up della settimana: ricollaudare e chiudere? → (1) Ricollaudo (consigliata) · (2) Chiudere subito · (3) Lasciare aperta
5. PO-228 — chiudere le statistiche e tenere PO-599? → (1) Sì (consigliata) · (2) Rimisurare passaggi/cross/dribbling · (3) Fondere in PO-599
6. PO-229 + PO-248 — chiudere gli ombrelli degli highlight? → (1) Sì (consigliata) · (2) No · (3) Tenere solo PO-248
7. PO-398 — chiudere il residuo raro di `riproduci-175`? → (1) Sì (consigliata) · (2) Cercarlo con 100 ripetizioni · (3) Nota in PROCESSO
8. PO-414 — un tasto «alla prossima occasione» dentro la partita serve ancora? → (1) Sì (consigliata) · (2) Basta la modalità salienti · (3) Dopo aver giocato la 200
9. PO-516 — far valere solo `ROSSI-DICHIARATI.json`? → (1) Sì, chiudere PO-516 (consigliata) · (2) Rigiocare prima la lista del 19/11 · (3) Farla rigiocare al treno
10. PO-528 — leve per i controlli lunghi col treno attivo? → (1) Solo voci separate per seme (consigliata) · (2) Tutte e quattro · (3) Chiudere
11. PO-540 — bisezione sulla 197? → (1) No, chiudere (consigliata) · (2) Sì · (3) Solo il punto (3)
12. PO-541 — corse incrociate sulla 197? → (1) No, chiudere (consigliata) · (2) Sì · (3) Solo il punto (4)

## Cosa ho visto e non ho toccato

- La riga «Per lotto» dell'intestazione della sezione aperta (B:19) mescola lotti e numeri di release («7.999.200 | 31 ·
  7.999.201 | 7 …», con barre verticali che spezzano le colonne di 36 righe). Va riscritta quando la madre aggiorna il BACKLOG.
- Nelle righe da PO-349 in poi la colonna «Lotto» contiene un numero di release (7.999.197 / 7.999.201) e alcune righe hanno
  colonne in meno (es. PO-349, PO-356): il confronto per colonne con uno script si rompe.
- Se il PO accetta le proposte: 6 voci si chiudono subito (A + B) e fino a 13 dopo le sue risposte, quindi da 109 a 90-103 aperte.
  Le 90 voci C restano: sono quasi tutte idee e segnalazioni del 13–21/11 mai lavorate.

Nessun controllo eseguito (limite settimanale in avviso), nessun file di `src/` toccato, `GAME_VERSION` invariato.
