# Collaudo approfondito della release 7.999.165 (ramo `main`)

Collaudatrice, 14/10/2026, su decisione PO del 14/10 («Collaudo approfondito dopo ogni release!»).
Oggetto: `main` a `f8e0b4b` (`GAME_VERSION` 7.999.165). Il gioco non è stato toccato: su questo ramo (`collaudo/release-165`) ci sono solo sonde, dati e foto.
La 7.999.164 la copre la collega sul ramo `collaudo/release-164`: qui mi concentro su ciò che la 165 cambia (PO-233) e sui punti del mandato. Dove ritrovo un difetto già scritto dalla collega lo dico e non lo ripeto per esteso.

## Tabella riassuntiva

| # | Voce | Gravità | Riproducibile | Nuova o già nota |
|---|---|---|---|---|
| V1 | **PO-233 verificata**: nel Calendario la riga della Nazionale dice «Amichevole Internazionale · sett. 9», non più «1479ª giornata». Nessun codice interno (≥ 990) stampato in home, Calendario, Coppe, Classifica in 17 settimane di carriera vera e su 2 salvataggi veri | — (verde) | sì | PO-233 |
| N1 | **Ripartenza dopo il gol (PO-207)**: il motore passa dal centro, ma sullo schermo dura **0,15–0,31 s a 1×** e **0–0,12 s a 2×**; durante il «calcio d'inizio» solo **11–13 giocatori di movimento su 20** stanno nella propria metà; in 2 gol su 12 il pallone **torna al centro una seconda volta** 0,7–1,4 s dopo, quando il gioco era già ripartito | **media** | **sì** (12 gol misurati decisione per decisione) | **conferma il sospetto PO-207** (in BACKLOG risulta FATTO col guardiano `ripartenza-207`, che guarda solo il motore) |
| N2 | **Scheda del mister senza risposta**: resta aperta sopra il campo per **22 minuti di gioco** (dal 54' al 76'), viene risolta da sola solo quando arriva la scheda successiva; l'ultima (78') resta aperta **fino al fischio** e la sua scelta non arriva al motore. In un'altra partita la scheda del 72' era ancora aperta **dopo la sostituzione dell'eroe al 78'** | **media** | **sì** (2 partite su 2 senza clic) | **nuova**, famiglia PO-226 / PO-234 |
| N3 | **Ingresso in campo: la squadra ospite parte dalla linea laterale OPPOSTA** (z +36, mentre la squadra di casa parte da z −36) e attraversa tutto il campo coi suoi bambini, con punte di **≈ 28 unità al secondo** (la squadra di casa ≈ 2,8): 60 unità in 3–5 s | **media** | **sì** (Nazionale e campionato, 2 su 2) | **nuova misura per PO-236** (vedi sotto: i bambini ci sono per entrambe le squadre) |
| N4 | **Giornale del dopo partita: «G. N» è la settimana, non la giornata.** AC Dorvelli–FC Felsineo è la **9ª giornata** (settimana 10) e il giornale scrive «Stag. 13 · **G. 10**»; idem 10ª giornata → «G. 11». Nella Champions la testata scrive «G. 5» accanto a «Fase a gironi · Giornata 1/6» | bassa | sì (ogni partita dopo una settimana senza campionato; per costruzione: `src/15-live-match.jsx:11423` stampa `player.week`) | **nuova**, stessa famiglia di PO-233 (numero di giornata sbagliato) |
| N5 | **Amichevole della Nazionale raccontata come «NAZIONALE · FASE A ELIMINAZIONE»** nel giornale di fine partita | bassa | sì (1 amichevole su 1; per costruzione quando c'è un Europeo/Mondiale già chiuso nel salvataggio) | **nuova** (la collega 164 l'ha vista sulla Coppa delle Nazioni, N3 del suo rapporto: questo è il caso amichevole) |
| N6 | **Griglia «Stagione 13 — Calendario»: settimane già giocate mostrano «⚽ partita in programma»**. Dopo il prestito all'AC Dorvelli le settimane 1–5 (giocate e con risultato nel calendario) hanno il ⚽, la legenda dice «⚽ partita in programma». La griglia legge solo `matchHistory` (le partite giocate dall'eroe) | bassa | sì sul salvataggio di partenza del giro B (per costruzione: `src/18-career-app.jsx:8815-8817`) | **nuova** |
| N7 | **Calendario, riga della Nazionale**: l'etichetta «🏳️ Nazionale» è troncata in «Nazional…» a 412 px e lo stemma del Portogallo è uno scudo grigio (nella home e nella finestra della settimana è blu) | bassa | sì (foto) | nuova, cosmetica |
| N8 | **Fluidità (PO-237)**: la prima partita dopo l'avvio ha il **24–30% in più** di compiti lunghi della seconda; in **ogni** partita il **61–75%** del tempo dei compiti lunghi cade nell'**ingresso in campo** (compito più lungo 4,8–8,7 s), mentre in gioco fluido sono 0,3–3,4 s a partita | media (da misurare sul telefono) | sì in headless (16 partite su 16) | PO-237 (misura nuova: **dove** cadono) |
| N9 | **«Caricamento giocatori…» (PO-241)**: compare **in ogni partita**, una volta, per **7,4–8,2 s** (il tetto della 232 è 8 s), quasi sempre appena prima della prima scena | media | sì in headless (16 su 16) | PO-241 / PO-232 |
| N10 | Club **«FC Kadıköy»** (id `fenk`, colori giallo-blu, Liga Anatolica) nel girone di Champions: il 12/10 lo **stadio** «Kadıköy Stadyumu» è stato rinominato come evocativo, il **club** con lo stesso nome no | da decidere | sì (`src/02-club-leghe-albo.jsx:179`) | **nuova**, domanda per il PO (copyright) |
| K1 | «🏃 Conduci palla al piede e tira» parata: riquadro «Tentativo respinto / Il portiere dice di no / Grande parata», ma il portiere non fa nessun gesto (`__CPM_GK229` vuoto) | alta | sì (3 parate su 3 qui) | **già trovata dalla collega 164** (N1 del suo rapporto) |
| K2 | Nessuna intervista dopo la partita della Nazionale (0 su 1 qui); dopo le partite di club 15 su 15 | media | sì | **già trovata dalla collega 164** (N2) |
| K3 | Scheda del mister con 2 opzioni («Seguo l'ordine / Faccio di testa mia») e testo «ordine» | — | sì | già in BACKLOG, **PO-234 APERTO** (atteso, la 165 non lo tocca) |
| K4 | Schermata «Convocazione Nazionale» fuori standard (fondo sfumato rosa-nero, pulsante verde «Gioca la Partita», metà schermo vuota); per giocare servono due «Gioca» di fila (finestra della settimana → questa schermata) | — | sì (foto `conv-2000ms.jpg`) | già in BACKLOG, **PO-235 APERTO** (atteso) |
| K5 | Scritta «2 fps · CGTrader · 5 corpi» sopra le scene | — | sì | già in BACKLOG, **PO-239** (entra nella 166) |

**Senza difetti nelle cose misurate:** tabellone = tabellino del motore in **16 partite su 16**; classifica con gol fatti = gol subiti in **ogni** settimana (17 controlli nei tre giri), giornate di lega 1–34 senza doppioni; intervista post partita dopo **15 partite di club su 15** (campionato, Champions, Coppa Nazionale, panchina); nessun corpo non CGTrader, nessuna T-pose, nessuna testa mancante al primo fotogramma delle scene; fila d'ingresso senza bambini che corrono da fermi (0 letture su ~4.100 a partita); nessun errore di pagina.

## Come ho giocato

- **Sonda principale** `tests/visual/collaudo-165-partite.mjs` (copiata dalla sonda della collega 164, `collaudo-164-partite.mjs`, con libreria `lib/collaudo165.mjs` = `lib/collaudo164.mjs`). Una pagina, carriera continua, **GLB acceso**, 412×915, velocità 2×. Clicca i pulsanti visibili come un giocatore e chiude le finestre con un loro pulsante; in campo le scelte dell'eroe le fa il pilota seedato del gioco (`__CPM_AUTOPLAY`), le schede del mister le chiude la sonda col primo pulsante dopo 1,2 s. Aggiunte mie: pallone 3D, pallone logico e motore campionati in pagina ogni 100 ms per 10 s dopo ogni gol; bambini per squadra nell'ingresso; il Calendario aperto a ogni settimana nuova; i compiti lunghi con la fase in cui cadono; la durata dei messaggi d'attesa; il rifiuto delle offerte di trasferimento (per restare al Merseyside e giocare la coppa).
- **Leve dichiarate:** panchina (prima della 5ª partita del giro A e della 3ª del giro B si abbassano fiducia/forma/fatica e il gioco decide; poi si rimettono i valori originali). Nessuna leva per la Nazionale: l'amichevole è **arrivata da sola** nella carriera della collega 164 (suo salvataggio di fine giro C, copiato in `dati/partenza-giroB-da-164c.json`).
- ⚠️ **Effetto collaterale della leva «rifiuta offerte»:** nel giro A, alla settimana 38, la sonda ha cliccato «😐 Resto al metodo classico» (una scelta della settimana con la parola «trasferimento» nel testo, non un'offerta). Lo dichiaro: ha cambiato una scelta narrativa, non ho visto effetti sulle misure. Un primo avvio del giro A è stato buttato via perché la stessa leva cliccava «Non ora» in giro (34 volte): rifatto da capo.

| Giro | Partenza | Partite | Contenuto |
|---|---|---|---|
| B (da solo sulla macchina) | S13 sett. 9, AC Dorvelli (in prestito) | 3 | **amichevole Spagna–Portogallo** · Lega A 9ª · Lega A 10ª **dalla panchina** |
| A (con altre sonde in parallelo) | `fixtures/save-190-s12-ovr93.json`, S12 sett. 38, FC Merseyside | 11 | Premier 34ª (ultima S12), fine stagione, S13 1ª–8ª (la 4ª **dalla panchina**), **Champions** girone ×2 |
| C (da solo) | salvataggio di fine giro A, S13 sett. 9 | 2 | **Coppa Nazionale** ottavi (FC Haringey, 1-0) · Premier 9ª |

In tutto **16 partite di carriera complete**: campionato, panchina (2), Champions (2), Coppa Nazionale (1), Nazionale (1). Più, per PO-207 e le schede, 9 partite col pilota automatico e GLB spento (sonda `collaudo-165-ripartenza-tick.mjs`) e 3 ingressi in campo misurati fitti (`collaudo-165-ingresso.mjs`). La fluidità la giudico solo sui giri B e C, che giravano da soli; il giro A girava insieme alle altre sonde.

Dati in `docs/collaudi/release-165/dati/` (`<giro>/partite.jsonl`, `settimane.jsonl`, `finestre.jsonl`, `interviste.jsonl`, salvataggi di fine giro; `ripartenza-tick-*.json`, `ingresso*.json`, `calendario.json`). Foto in `docs/collaudi/release-165/` (prefisso = giro).

## Ciò che la 7.999.165 cambia: PO-233

- **Flusso vero.** Sul salvataggio in cui l'amichevole è arrivata da sola (voce di calendario `matchday 1479`, `type national`), la scheda Calendario mostra «▶ vs Portogallo · in casa 🏳️ Nazionale / **Amichevole Internazionale · sett. 9**» (foto `cal-partenza-giroB-da-164c-calendario.jpg`). Nessuna «NNNª giornata» con numero ≥ 990, né «G. NNNN», né «Giornata NNNN» in home, Calendario, Coppe e Classifica (sonda `collaudo-165-calendario.mjs`, 2 salvataggi veri).
- **In carriera.** A ogni settimana nuova del giro A (S12 sett. 38 → S13 sett. 9) la sonda ha aperto il Calendario: la coppa compare come «Coppa Nazionale · Ottavi di Finale · sett. 9», la Champions come «KCC · Fase Gruppi · sett. N», mai con un numero di giornata. 0 codici interni in 12 aperture (giri A e C; alla settimana 39 del giro A il Calendario non si è aperto).
- **Correzione di uno strumento:** la sonda cercava «Prossime partite» e non lo trovava perché il titolo è in maiuscolo nel testo della pagina; corretto (ricerca senza maiuscole) dopo il giro B, quindi nei registri del giro B il Calendario risulta «non aperto» e il controllo di quel giro l'ho rifatto con `collaudo-165-calendario.mjs`. Anche il clic sulla barra «Stagione» non è andato a segno: la sonda è passata dal ripiego `goTab('calendar')`, dichiarato nel registro.
- Restano due difetti **fuori** dal perimetro di PO-233 ma della stessa famiglia: **N4** (il giornale scrive la settimana come giornata) e **N6** (la griglia mostra «in programma» settimane già giocate).

## Difetti nuovi

### N1 — La ripartenza dopo il gol dura un battito di ciglia (media) · sospetto PO-207

- **Cosa vede il giocatore.** In `playing` si vede il campo 2D (`Campo2D`, `src/15-live-match.jsx:539`; il 3D è fermo). Il campo disegna il pallone del motore (`motore.stato().palla`) e lo insegue, riagganciandolo di colpo oltre 22 unità di distanza. Foto `ripT-x1-p1-gol1-0ms.jpg` / `-150ms` / `-300ms`: subito dopo il «GOL», i giocatori sono ancora sparsi nella metà d'attacco, a 600 ms si è già aperta la scena successiva.
- **Misura** (`tests/visual/collaudo-165-ripartenza-tick.mjs`: avvolge `tick` del motore e registra lo stato a **ogni decisione**, con l'ora reale; GLB spento, salvataggio S12, 9 partite):

  | Velocità | Gol misurati | Decisioni in «rete» | Decisioni in «kickoff» | Durata reale del kickoff | Giocatori di movimento nella propria metà durante il kickoff | Secondo ritorno al centro |
  |---|---|---|---|---|---|---|
  | 1× | 4 | 2 | 3–9 | **152–308 ms** (un caso 7,5 s: si è aperta una scena) | 11–13 su 20 | 1 su 4, **1,39 s** dopo |
  | 2× | 8 | — (letto dal tabellone, che arriva dopo) | 1–7 | **0–121 ms** (5 decisioni in 1 ms in un caso) | 12–14 su 20 | 1 su 8, **0,72 s** dopo |

- **Lettura.** Il motore fa quello che il guardiano `ripartenza-207` controlla (passa da «kickoff» a (50,50)), ma la ripresa dura 2–9 decisioni su 11 al minuto: con il minuto di 1,7 s a 1× è un terzo di secondo, a 2× quasi niente. Le squadre non fanno in tempo a schierarsi (un terzo dei giocatori è ancora nella metà sbagliata). Il «secondo ritorno al centro» è coerente con la richiesta `riprendi({centro:true})` del 7.999.126, che scatta al primo battito dopo l'aumento del punteggio anche quando il motore ha già fatto la sua ripresa (`src/15-live-match.jsx:5476-5480`): **è una mia deduzione dal codice**, la misura mostra solo il doppio kickoff.
- **Non verificato:** la ripresa dopo un gol nato **dentro una scena** dell'eroe: nelle 9 partite col pilota automatico nessun gol è nato in scena, e nelle 16 di carriera il campionamento ogni 100 ms è troppo rado per una fase di 150 ms (`dati/<giro>/partite.jsonl`, campo `ripartenze`: kickoff visto in 22 gol su 44, gli altri non giudicabili).

### N2 — La scheda del mister senza risposta resta aperta per decine di minuti (media)

- **Misura** (stessa sonda con `CPM_SCHEDE=1`, la sonda **non** risponde, 1×): scheda «ha il fiato corto al 55'» a schermo dal **54' al 76'** (23 letture, una per minuto); al 78' la sostituisce «Pari al 78'», e solo allora la prima risulta scelta in automatico (`__CPM_INT226.scelte`: `auto:true`, `min:55`). La scheda del 78' resta aperta **fino al fischio** e non compare fra le scelte arrivate al motore (`cand: 2`, scelte 1).
- **Seconda partita** (sonda `collaudo-165-ripartenza.mjs`, senza clic): la scheda del 55' era ancora a schermo al 71'; quella del 72' era ancora a schermo all'**81'**, con la scritta «SOSTITUITO AL 78' · Segui il finale dalla panchina» sopra (foto `rip-x1-p1-gol2-sequenza.jpg`, `rip-x1-p1-gol2-2000ms.jpg`).
- La scheda è una finestra a tutto schermo (`data-cpm="pop919"`, `position:fixed; inset:0`): mentre è aperta copre il campo 2D.
- ⚠️ Nelle foto la scheda dice «**K** ha il fiato corto»: «K» è la lettera che **la mia sonda** aggiunge al nome dell'eroe per avere partite diverse. Non è un difetto del gioco.
- Voci collegate: PO-226 (la scelta deve arrivare al motore), PO-234.

### N3 — Ingresso in campo: la squadra ospite arriva di corsa dalla parte opposta del campo (media) · PO-236

- **Bambini: ci sono per entrambe le squadre.** Nella Nazionale (Spagna–Portogallo) e in campionato: **11 bambini di casa e 11 ospiti** visibili (anche risalendo tutti i genitori dell'oggetto 3D, e dentro la scena), ciascuno a **0,72 unità** dal suo calciatore, cioè per mano (`dati/ingresso.json`, `__CPM_HYPER_MASCOT_LIST`). Nelle 16 partite di carriera: 11+11 sempre.
- **Ma la squadra ospite parte da un altro posto.** Misura fitta ogni 150 ms (`dati/ingresso-fitto.json`, Nazionale; `dati/ingresso-fitto-club.json`, campionato): i calciatori di casa partono da (x −24, z **−36**) e camminano 8–10 unità; quelli ospiti partono **tutti** da (x −16, z **+36**), la linea laterale opposta, e attraversano il campo fino a z −28. Esempio, primo ospite: z 12,1 → 1,0 in 0,4 s (**≈ 28 u/s**), contro −32,9 → −31,8 del primo di casa (≈ 2,8 u/s). I bambini ospiti fanno la stessa corsa, attaccati al calciatore.
- **Cosa si vede.** La camera dell'ingresso guarda la tribuna e il cerchio di centrocampo; i giocatori si vedono piccoli, già schierati, e a questa grandezza **non riesco a distinguere a occhio i bambini** né nelle mie foto (`ing-sequenza.jpg`, `ing-10-zoom.jpg`) né in quella del PO. Che l'impressione «manca la squadra avversaria» nasca da questa corsa dal lato opposto è un'**ipotesi**, non l'ho verificata sul telefono.

### N4 — Il giornale del dopo partita scrive la settimana al posto della giornata (bassa)

- Foto `N-giornale-G-settimana.jpg`: «Sport in Rete · Stag. 13 · **G. 10**» su AC Dorvelli–FC Felsineo, che nel calendario è la **9ª giornata** (settimana 10); «Zona Mista · Stag. 13 · **G. 5**» sopra «Korward Champions Cup · Fase a gironi · Giornata 1/6».
- Misura: giro B, 2 partite di lega dopo la settimana della Nazionale, entrambe con «G.» = giornata + 1. Nel giro A settimana e giornata coincidono (S13 sett. 1–8 = giornate 1–8), quindi il difetto non si vede finché non c'è una settimana senza campionato.
- Codice: `src/15-live-match.jsx:11423` stampa `Stag. {player.season} · G. {player.week}`. Lo stesso schema in `src/13-prepartita-formazioni.jsx:230` («Stagione N · Giornata {player.week}», rassegna stampa): quella schermata non l'ho vista in gioco.

### N5 — Amichevole della Nazionale «fase a eliminazione» (bassa)

- Foto `b-p1-fine.jpg`: «NAZIONALE · **FASE A ELIMINAZIONE** · FISCHIO FINALE», Spagna–Portogallo 3-2, amichevole.
- Codice (`src/15-live-match.jsx:9963-9971`): per ogni partita della Nazionale, se nel salvataggio c'è un `euroMondiale` si usa la sua fase; qui è l'Europeo della S12 già chiuso (`phase:"done"`, `koPhase:null`), quindi cade su «Fase a eliminazione». La collega 164 ha visto lo stesso titolo sulla Coppa delle Nazioni.

### N6 — La griglia del calendario chiama «in programma» settimane già giocate (bassa)

- Salvataggio di partenza del giro B (AC Dorvelli dopo il prestito, settimana 9): la griglia mostra «1 BRI · c ⚽ … 5 ALC · c ⚽» e poi «6 TRV · t P 0-1 · 7 VEL · c V 1-0 · 8 CAL · t P 1-2». Nel calendario le settimane 1–5 sono `played:true` con risultato (2-0, 0-2, 2-0, 1-0, 2-0). La legenda sotto dice «⚽ partita in programma».
- Codice (`src/18-career-app.jsx:8815-8817`): la casella cerca il risultato solo in `player.matchHistory` (3 voci dopo il prestito); se non lo trova e c'è una voce di calendario mette il ⚽. Succede anche a ogni partita simulata o saltata dall'eroe, per costruzione: **quest'ultimo caso non l'ho visto a schermo**.

### N7 — Riga della Nazionale nel Calendario (cosmetica)

Foto `cal-partenza-giroB-da-164c-calendario.jpg`: «🏳️ Nazional…» troncato a 412 px; scudo «POR» grigio (in home `b-finestra-1-finestracorpo.jpg` è blu).

### N8 — Fluidità: la prima partita pesa di più, e pesa nell'ingresso (media) · PO-237

Headless, rendering software: i valori assoluti non sono quelli del telefono, vale il confronto fra partite della stessa pagina. Giri B e C da soli sulla macchina.

| Giro · partita | Compiti lunghi, somma | di cui nell'ingresso | Compito più lungo (fase) | Fotogrammi > 1 s |
|---|---|---|---|---|
| B1 Nazionale (**prima**) | **33,4 s** | 24,5 s (73%) | 8,7 s (ingresso) | 11 |
| B2 Lega A | 25,8 s | 17,6 s (68%) | 7,4 s (ingresso) | 24 |
| B3 Lega A, panchina | 19,2 s | 14,3 s (74%) | 6,1 s (ingresso) | 34 |
| C1 Coppa Nazionale (**prima**) | **25,8 s** | 15,9 s (62%) | 7,3 s (ingresso) | 10 |
| C2 Premier | 20,8 s | 12,3 s (59%) | 5,2 s (ingresso) | 3 |

- Prima contro seconda: **+30%** (B) e **+24%** (C) di tempo nei compiti lunghi, e l'eccesso sta nell'ingresso. In gioco fluido (`playing`) i compiti lunghi sono 0,8–1,7 s per partita; nell'apertura delle scene (`hl_intro`) 2,9–5,5 s.
- Nel giro A (con altre sonde in parallelo) la prima partita è a 59,5 s contro 20,0 della seconda: lo riporto ma non lo uso, il carico non è confrontabile.
- I fotogrammi > 1 s **non** seguono la stessa regola (B3 ne ha più di B1): non li uso per dire «più scattosa».

### N9 — «Caricamento giocatori…» in ogni partita (media) · PO-241 / PO-232

In tutte le 16 partite la scritta compare **una volta**, per **7,4–8,2 s** (lettura della sonda ogni ~0,5 s), nella fase `playing` subito prima della prima scena (una volta nell'ingresso, B3). Il tetto di attesa di PO-232 è 8 s: in headless l'attesa arriva quasi sempre al tetto. Se lo stesso accada sul telefono **non posso confermarlo**. Il messaggio d'apertura dell'ingresso è «Si accendono i riflettori · Le squadre sono nel tunnel…» (`b-p1-ingresso-9s.jpg`).

### N10 — «FC Kadıköy» (domanda per il PO)

`src/02-club-leghe-albo.jsx:179`: `mkT("fenk","FC Kadıköy","FKD",80,"#f59e0b","#1d4ed8","🇹🇷","Liga Anatolica")`, anche come club del record di lega (r. 402). Il 12/10 lo stadio «Kadıköy Stadyumu» è stato rinominato fra gli evocativi; il club con lo stesso nome di quartiere e colori giallo-blu è rimasto. Non giudico se sia un problema: lo segnalo perché la decisione del 12/10 era «rinomina tutti gli evocativi». Non ho eseguito `tools/audit-copyright.mjs`.

## Punti del mandato verificati senza difetti nuovi

- **Esiti delle scene dell'eroe** (88 scene nei giri A–C, 86 con l'esito registrato dal testimone): la famiglia del riquadro e i fatti del motore concordano, salvo K1 («Conduci palla al piede e tira»). Gol dell'eroe: pallone in rete in 3D in **10 scene di gol su 10** (con `__CPM_CINE`/`__CPM_REALWAIT`); portiere col gesto in **13 parate su 16**: le 3 senza gesto sono tutte K1.
- **Pallone all'apertura:** in 4 scene aperte subito dopo una scena di gol il pallone 3D è ancora **in rete** per 3–44 campioni (fino a ~0,3 s di scena, `g164.campioniInRete`). La foto d'apertura (`a-p2-scena2-apertura.jpg`) è coperta dal cartello nero introduttivo: non so se il giocatore lo veda. **Non confermato.**
- **Corpi pronti (PO-232):** 0 corpi non CGTrader, 0 T-pose, 0 teste mancanti al primo fotogramma, su tutte le scene con il testimone.
- **Tabellino contro tabellone:** 16 su 16 uguali. Nel tabellino della Nazionale le parate tornano coi tiri in porta (Spagna 4 = 6 in porta del Portogallo − 2 gol; Portogallo 6 = 9 − 3).
- **Interazioni in partita (PO-226):** 1–3 schede a partita, mai più di 3, nate dai fatti (`eroe_stanco`, `eroe_marcato`, `avanti_2`, `pari_75`, `misura_85`, `sotto_70`, `panca_pari`); risposte della sonda arrivate al motore. Il caso senza risposta è N2.
- **Intervista post partita:** 15 su 15 dopo le partite di club (Premier, Lega A, Champions, Coppa Nazionale, partite dalla panchina). Dopo la Nazionale no (K2).
- **Finestre (PO-230):** finestra della settimana, intervista e conferenza stampa con raggio 20 px e pulsanti in fondo; schede del mister scure (`TH_DARK`) uguali fra loro. Nessuna finestra esce dallo schermo, nessun testo tagliato, nessuno scorrimento orizzontale. Come la collega 164, vedo il bordo della finestra della settimana a 0,89 px invece di 1 px (probabilmente l'animazione d'ingresso): non lo conto.
- **Panchina:** 2 partite partite dalla panchina («Gioca · parti dalla panchina»); scheda «panca_pari» al 46', ingresso al 71' arrivato al motore.
- **Carriera:** classifica con somma gol fatti = somma gol subiti in tutte le 17 settimane controllate (810/810 … 184/184 nel giro A, 174/174 … 227/227 nel giro B); partite giocate uguali per tutte le squadre; fine stagione S12 (premiazione, galà, apertura S13) percorsa coi clic; offerte rifiutate senza blocchi; la Coppa Nazionale del Merseyside giocata alla settimana 9 (nel giro della collega era sparita col prestito: qui, senza prestito, c'è).

## Cosa non ho potuto verificare

- **Il telefono.** Tutto è in headless: N1 (quanto si percepisce la ripresa), N3 (cosa si vede dell'ingresso), N8 e N9 vanno confermati sul dispositivo.
- **Ripartenza dopo un gol nato in scena** (N1, ultimo punto).
- **Che il pallone in rete all'apertura sia visibile** (coperto dal cartello).
- **La rassegna stampa** (`src/13-prepartita-formazioni.jsx:230`) non l'ho vista in gioco.
- **La Coppa delle Nazioni** non l'ho giocata (la collega 164 sì).

## File

- Sonde: `tests/visual/collaudo-165-partite.mjs` (da `collaudo-164-partite.mjs`), `tests/visual/lib/collaudo165.mjs` (= `lib/collaudo164.mjs`), `tests/visual/collaudo-165-ripartenza-tick.mjs` (ripartenza decisione per decisione e schede senza risposta), `tests/visual/collaudo-165-ripartenza.mjs` (prima versione, campionamento a fotogramma: troppo rada, la tengo per le foto delle schede), `tests/visual/collaudo-165-ingresso.mjs` (bambini e posizioni dell'ingresso), `tests/visual/collaudo-165-calendario.mjs` (PO-233 sui salvataggi veri).
- Uso tipico (dalla cartella `tests/visual`, con `CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`):
  `CPM_TAG=a CPM_NPARTITE=11 CPM_BENCH_AT=5 CPM_NAT_AT=99 CPM_RIFIUTA=1 node collaudo-165-partite.mjs` ·
  `CPM_SPEED=1 CPM_PARTITE=3 CPM_CHIUDI=1 node collaudo-165-ripartenza-tick.mjs` ·
  `CPM_SCHEDE=1 CPM_SPEED=1 CPM_PARTITE=1 CPM_TABELLONE=1 node collaudo-165-ripartenza-tick.mjs` ·
  `CPM_WMAX=30000 CPM_PFX=ingresso-fitto CPM_NOFOTO=1 CPM_PASSO=150 node collaudo-165-ingresso.mjs` ·
  `node collaudo-165-calendario.mjs <salvataggio.json>`
- Dati e foto: `docs/collaudi/release-165/`.
