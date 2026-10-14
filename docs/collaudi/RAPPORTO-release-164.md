# Collaudo approfondito della release 7.999.164 (ramo `main`)

Collaudatrice, 14/10/2026, su decisione PO del 14/10 («Collaudo approfondito dopo ogni release!»).
Oggetto: `main` a `5942069` (`GAME_VERSION` 7.999.164). Il gioco non è stato toccato: su questo ramo ci sono solo sonde, dati e foto.

## Tabella riassuntiva

| # | Voce | Gravità | Riproducibile | Nuova o già in BACKLOG |
|---|---|---|---|---|
| N1 | Un tiro fallito di «🏃 Conduci palla al piede e tira» ha un riquadro che si contraddice: il titolo dice «Grande parata del portiere» o «Non trova lo specchio», la riga sotto dice «Il difensore lo chiude: palla persa». In quelle parate il portiere non fa il gesto | **alta** | **sì**, per costruzione (codice letto) e osservato 4 volte su 4 | **nuova**, caso non coperto di PO-218 (sottoinsieme del 17/10) |
| N2 | Nessuna intervista post partita dopo le gare della **Nazionale** (0 su 5: 4 di Coppa delle Nazioni, 1 amichevole), mentre la decisione PO-231 è «sempre, dopo ogni partita» | **media** | **sì** (5 su 5, e nel codice il ramo Nazionale esce prima dell'intervista) | **nuova**, ambito mancante di PO-231 (in BACKLOG risulta FATTO) |
| N3 | Il giornale del dopo partita di Coppa delle Nazioni titola «COPPA DELLE NAZIONI · **FASE A ELIMINAZIONE**» su partite del **girone** (giornata 1 contro la Francia, giornata 3 contro l'Olanda) e porta «Stag. 13 · **G. 5**», cioè la giornata di campionato | bassa | sì (2 gare di girone su 2 con giornale; la 2ª ha avuto la festa per la doppietta, non il giornale) | nuova |
| N4 | Un avviso «💪 +3 ⚡+14 ⭐+12» si posa sopra la terza risposta dell'intervista e ne copre il testo | bassa | sì (2 volte su 2 aperture fotografate: conferenza stampa e intervista post partita) | nuova, famiglia PO-230 (finestre in primo piano) |
| N5 | Dopo il **prestito** a metà stagione (FC Merseyside → AC Dorvelli, settimana 5) la Coppa nazionale sparisce dal calendario e risulta `eliminated: true` al turno 1, senza averla mai giocata | media | non verificato (osservato 1 volta, non so se sia voluto) | nuova, **da verificare** |
| N6 | Due parate in cui il pallone, per un solo campione da 80 ms, sta oltre la linea di porta fra i pali (x 99,15–99,16; la linea è a 98,6) | media | **non confermato** (manca la quota: può essere un pallone deviato **sopra la traversa**; la foto non lo mostra) | collegata a PO-229 |
| N7 | 6 scene su 67 hanno **zero corpi inquadrati** al primo fotogramma, con i corpi dichiarati pronti; l'unica fotografata si apre su uno **stacco nero** | bassa | non confermato (lo stacco nero è regia voluta, regola 7.471) | collegata a PO-232 |
| N8 | Fluidità: in **ogni** partita c'è almeno un compito lungo da **4,3 a 7,9 s** e 4–19 fotogrammi oltre 1 s. La prima partita **non** è sistematicamente peggiore della seconda. «Caricamento giocatori…» compare in tutte le partite, non solo nella prima | media (da misurare sul telefono) | sì in headless (19 partite su 19) | nuova come misura; nessuna voce PO dedicata trovata |
| K1 | Statistiche: passaggi 346–437 a partita (due squadre insieme), cross 25–52 | — | sì | **già in BACKLOG** (PO-228: ritaratura verso circa 814 e circa 25 non ancora pubblicata, come dice la voce) |

Senza difetti nelle cose misurate (dettaglio sotto): tabellone e tabellino del motore uguali in **19 partite su 19**; classifica coerente in ogni settimana; nessuna giornata assurda; esito di riquadro e fatti del motore concordi in tutte le scene registrate, salvo il caso N1; nei giri con gli interruttori del telefono **9 gol su 9 col pallone in rete in 3D**; intervista post partita in **13 partite di club su 13**; fila d'ingresso senza bambini che corrono da fermi; nessuna T-pose e nessuna testa mancante.

## Come ho giocato

- Sonda `tests/visual/collaudo-164-partite.mjs` (libreria `tests/visual/lib/collaudo164.mjs`): **una sola pagina e una carriera continua**, dal salvataggio `fixtures/save-190-s12-ovr93.json` (FC Merseyside, stagione 12, settimana 38). Schermo 412×915, **GLB acceso** (corpi CGTrader), velocità 2×. La sonda clicca i pulsanti visibili come un giocatore («Vivi la Settimana», «⚽ Gioca vs …», «Vedi le formazioni», «Ingresso in campo», «Avvia Stagione», «Parti per il ritiro», «Che la stagione cominci →», «Salta il galà»…) e chiude le finestre con un loro pulsante, mai con `dismiss`. Nelle finestre sceglie l'azione che fa andare avanti la storia, quindi **accetta anche le offerte**: così l'eroe è finito in prestito all'AC Dorvelli, che resta una scelta da giocatore.
- **Unica parte non cliccata a mano:** in campo le scelte dell'eroe le fa il pilota seedato del gioco (`__CPM_AUTOPLAY`, politica «seeded»). Le schede del mister in partita le chiude la sonda col primo pulsante («Seguo l'ordine»).
- **Leve di collaudo dichiarate** (solo nel giro A):
  - **panchina**: prima della 3ª partita la sonda abbassa fiducia, forma e fatica (`patch`), e la decisione la prende il gioco. Al primo tentativo il gioco l'ha lasciato fuori dai convocati («Non convocato»); alla settimana dopo l'eroe è partito dalla panchina. Dopo quella partita la sonda rimette i valori originali;
  - **Nazionale**: prima della 5ª partita la sonda apre una Coppa delle Nazioni con la stessa forma che usa il gioco; il «Continua» del gioco l'ha instradata da solo.
  - L'amichevole della Nazionale del giro D, invece, è arrivata **da sola** (settimana 9, contro il Portogallo).
- **Interruttori del telefono.** Sotto `?cpmtest=1` la scena d'esito si chiude prima che l'arco del pallone finisca (note 7.460/7.461 in CLAUDE.md). Il giro A girava **senza** `__CPM_CINE` e `__CPM_REALWAIT`, quindi le sue misure 3D **non sono giudicabili** e non le uso (sotto spiego come me ne sono accorta). I giri B, C e D e la sonda `collaudo-164-gol3d.mjs` girano **con** i due interruttori accesi, e il pallone viene registrato dentro la pagina ogni 80 ms.

| Giro | Partenza | Partite | Contenuto |
|---|---|---|---|
| A | S12 settimana 38 | 8 | campionato (S12 g.34; S13 g.1, g.3 **dalla panchina**, g.4) · **Coppa delle Nazioni** ×4 (Francia, Portogallo, Olanda, finale con la Germania) · fine stagione, galà e apertura della S13 |
| B | S12 settimana 38 | 7 | campionato S12 g.34 e S13 g.1–5 · **Coppa europea**, girone (FC Brabantia, settimana 5) · offerta accettata: **prestito all'AC Dorvelli** |
| C | salvataggio di fine giro B (S13 settimana 5, AC Dorvelli) | 3 | Lega A g.6–8 col nuovo club |
| D | salvataggio di fine giro C (S13 settimana 9) | 1 | **amichevole della Nazionale** arrivata da sola (Spagna–Portogallo) |
| gol3d | S12 settimana 38, una pagina per seme | 2 | campionato, misura fitta di pallone e portiere |

In tutto: **19 partite di carriera complete**, più 2 della sonda gol3d. Campionato, partita dalla panchina, coppa europea, Coppa delle Nazioni e amichevole. **Coppa nazionale non giocata**: nella S13 del Merseyside cadeva alla settimana 9, ma nel giro B l'eroe è passato in prestito alla settimana 5 e nel calendario dell'AC Dorvelli la coppa non c'è (vedi N5).

Dati grezzi in `docs/collaudi/release-164/dati/<giro>/` (`partite.jsonl`, `settimane.jsonl`, `finestre.jsonl`, `interviste.jsonl`, salvataggi di fine giro) e `dati/gol3d.json`. Lettura: `node tests/visual/collaudo-164-analisi.mjs docs/collaudi/release-164/dati/b`. Foto in `docs/collaudi/release-164/` (prefisso = giro).

## Difetti nuovi

### N1 — «Conduci palla al piede e tira»: il riquadro si contraddice e il portiere non para (alta)

- **Cosa si vede.** Riquadro d'esito: titolo «✕ **Grande parata del portiere** · 🏃 Conduci palla al pi…», e subito sotto «😖 **Il difensore lo chiude: palla persa.**». Il motore registra `tiro:saved`, `parata`. Foto: `N1-conduci-e-tira-parata-contraddizione.jpg` (gol3d, seme 11, scena 7, 63', FC Merseyside–FC Tyneside, foto a +1,2 s e +2,4 s dall'esito).
- **Misura.** Nei giri con gli interruttori del telefono ci sono 4 tiri falliti con quell'etichetta (giro B partita 7, giro C partita 1, gol3d seme 11 scena 7, più giro A partita 2 senza interruttori). Nelle **3 parate su 3** il portiere non fa nessun gesto (`__CPM_GK229`: nessun `gk_dive`/`gk_block`), contro 10 parate su 10 col gesto per tutte le altre giocate.
- **Causa letta nel codice** (`src/15-live-match.jsx:8972`): `_cond70` scatta su ogni etichetta che contiene «conduc» quando l'azione fallisce, e sceglie la frase da `_COND70` («Il difensore lo chiude…», «Prova la conduzione ma viene fermato», «Il dribbling non riesce…»), anche se l'azione è un **tiro**. Il 3D legge la frase dell'esito (`hlOutText`, decisione PO «il gesto segue il testo», r. 10356), il che spiegherebbe il portiere fermo. Questo legame col portiere è una mia deduzione, non l'ho misurato separatamente.
- **Voce PO:** PO-218 «esiti bugiardi» (nel sottoinsieme del 17/10). I guardiani esistenti (lessico-218, esiti-218, cross-218) confrontano la **famiglia** del riquadro col motore, e quella torna: la contraddizione sta nella **riga di testo** sotto il titolo.

### N2 — Nessuna intervista post partita dopo la Nazionale (media)

- **Misura.** Dopo le partite di **club**: intervista post partita **13 volte su 13** osservate (`[data-cpm=intervista231]`, contesto win/draw/loss). Dopo le partite della **Nazionale**: **0 su 5** (giro A partite 5–8, Coppa delle Nazioni; giro D, amichevole). Nel giro D è comparsa un'intervista, ma è la **settimanale** (`data-ctx="weekly"`, «Sogni di vincere un trofeo importante con AC Dorvelli?», foto `d-p1-intervista.jpg`).
- **Codice** (`src/18-career-app.jsx`): il ramo `result.context==="national"||"nationsCup"` (r. 3484) chiude con `return` (r. 3562) prima del blocco intervista PO-231 (r. 3789–3795).
- **Voce PO:** PO-231 «Sempre, dopo ogni partita» (DECISIONI 12/10). In BACKLOG risulta FATTO; il guardiano `intervista-231` gioca solo partite di club.

### N3 — Giornale di Coppa delle Nazioni: «fase a eliminazione» nel girone (bassa)

Foto `a-p5-fine.jpg` (giornata 1, Spagna–Francia 1-1) e `a-p7-fine.jpg` (giornata 3, Spagna–Olanda 0-2): testata «COPPA DELLE NAZIONI · FASE A ELIMINAZIONE» e «Stag. 13 · G. 5». La 4ª gara è stata la finale (Spagna–Germania 2-0, «TRIONFO! Coppa delle Nazioni», `a-p8-fine.jpg`). Nel tabellone pre-partita il ramo `nationsCup` scrive «Fase a gironi · Giornata N/3» (`src/15-live-match.jsx:9980`). Da quale funzione nasca la testata del giornale non l'ho trovato: lo dichiaro.

### N4 — L'avviso dei punti copre una risposta dell'intervista (bassa)

Foto `a-finestra-10-intervista231.jpg` (intervista post partita, S12 settimana 38, 1-0 a Tyneside) e `a-finestra-4-intervista231.jpg` (conferenza stampa): l'avviso «💪 +3 ⚡+14 ⭐+12» (toast in basso) copre la riga «Quando un compagno… mi ha aiutato» della terza risposta. Voce collegata: PO-230 (finestre in primo piano).

### N5 — Dopo il prestito la coppa nazionale sparisce (media, da verificare)

Giro B, settimana 5 della S13: l'offerta è stata accettata e la home dice «AC Dorvelli · Lega A · Arrivi in prestito» (`b-bloccato-13-5-dashboard.jpg`). Nel salvataggio (`dati/b/salvataggio-fine-b.json`) il calendario ha 34 gare, tutte di campionato (dopo l'8ª giornata si passa dalla settimana 8 alla 10), e `cup = {active:false, round:1, eliminated:true}`. Prima del prestito il calendario del Merseyside aveva la coppa alla settimana 9 (sonda d'esplorazione, stessa stagione). Che un prestito escluda dalla coppa può essere voluto; che la coppa risulti «eliminata al turno 1» senza averla giocata non lo so dire. Lo segnalo per la verifica del PO.

### N6 — Parate col pallone oltre la linea per un campione (non confermato)

Con gli interruttori del telefono, 11 parate: 10 col gesto del portiere (fa eccezione la N1). In 2 (gol3d seme 12, scena 7 «Controllo e tiro fermo», 67'; giro B partita 3, «Testa di potenza») **un solo campione** su 150–196 ha il pallone a x 99,15–99,16 con |y−50| ≤ 4,93, cioè dietro la linea di porta fra i pali. La quota non l'ho registrata: un pallone deviato sopra la traversa dà lo stesso numero. Le foto a +1,2 s e +2,4 s (`N6-parata-pallone-oltre-linea-s12-scena7.jpg`) non mostrano il pallone. **Non confermato**: serve una misura con la quota. Voce: PO-229.

### N7 — Primo fotogramma senza corpi inquadrati (non confermato)

Testimone `__CPM_GLB232W`, giri B, C e D: 67 primi fotogrammi di scena, **0 con un corpo non CGTrader, 0 in T-pose, 0 senza testa, 0 procedurali**. In 6 nessun corpo è inquadrato, con `pronti:true`. L'unico fotografato (`c-p1-scena2-apertura.jpg`, 44', FC Torvelle–AC Dorvelli) è uno **stacco nero** a schermo intero: regia voluta, quindi non lo considero un difetto. Gli altri 5 non hanno foto. Voce: PO-232.

### N8 — Fluidità e messaggi d'attesa (media, da confermare sul telefono)

Headless, rendering software: i valori assoluti **non** sono quelli del telefono, vale il confronto fra partite della stessa pagina.

| Giro | Partita 1: fotogrammi > 1 s · somma dei compiti lunghi · compito più lungo | Partita 2 | Partite successive (compito più lungo) |
|---|---|---|---|
| A | 13 · 24,2 s · 7,05 s | 4 · 16,9 s · 5,17 s | 4,7–7,9 s |
| B | 11 · 23,6 s · 6,10 s | **18** · 16,7 s · 4,83 s | 4,5–4,9 s |
| C | 9 · 20,8 s · 6,69 s | 5 · 17,5 s · 5,11 s | 5,32 s |

- **Prima contro seconda:** la prima partita ha più ms di compiti lunghi (+20–40%), ma nel giro B la seconda ha più fotogrammi oltre 1 s: **nessuna penalità sistematica** della prima partita.
- **In ogni partita** c'è un compito lungo da 4,3 a 7,9 s. **Quando** cada (caricamento o gioco) **non l'ho misurato**: la sonda ha tenuto solo i totali.
- **Messaggi d'attesa:** «Si accendono i riflettori · Le squadre sono nel tunnel…» all'inizio dell'ingresso (`a-p2-ingresso-3s.jpg`) e «Caricamento giocatori…» letto in 17–18 campionamenti per partita, **in tutte le partite**, non solo nella prima. La durata esatta non l'ho misurata.

## Già in BACKLOG, verificato in questa release

- **PO-228 (statistiche):** passaggi (due squadre insieme) 346–437, cross 25–52, tiri 15–35 in 19 partite. Corrisponde a «ritaratura … non ancora pubblicata» della voce: nessun difetto nuovo. Possesso sempre 100% in somma; tiri in porta mai più dei tiri; gol mai più dei tiri in porta.
- **PO-209/PO-216 (tabellino):** tabellone (`__CPM_SCORE`) e tabellino del motore uguali in **19 partite su 19**; nessuna nota automatica `auto216`. L'intervista mostra il club con cui si è giocato (giro A, `MER 1–0 FC Tyneside`).
- **PO-218 (esiti):** tolta la N1, nelle 100 scene registrate dei giri A–C (più 7 del giro D) la famiglia del riquadro e i fatti del motore sono concordi. Un rigore per giro non viene scritto dal testimone `__CPM_RES218`: non giudicato.
- **PO-226 (interazioni):** da 1 a 3 schede del mister per partita (mai più di 3), aperte da fatti del motore (eroe_stanco, pari_75, misura_85, avanti_2, panca_pari, sotto_70), e la scelta arriva al motore (`__CPM_INT226.scelte`).
- **PO-227 (fila d'ingresso):** in tutte le 19 partite, 0 letture di bambini fermi in corsa (`__CPM_FILA227`, circa 4.100 letture da fermi a partita). **Bambini di entrambe le squadre:** 22 corpi CGTrader visibili, 11 di casa e 11 ospiti (`__CPM_HYPER_MASCOT_LIST`). Nelle foto dell'ingresso i giocatori sono troppo piccoli per riconoscere a occhio le coppie bambino-calciatore: **non verificato visivamente**.
- **PO-229 (portiere):** nei giri col telefono, gesto del portiere in 10 parate su 11 (l'11ª è la N1). Per la N6 vedi sopra.
- **PO-232 (corpi pronti):** vedi N7, nessuna T-pose e nessuna testa mancante.
- **PO-230 (finestre):** le finestre della settimana e del pre-partita hanno lo stesso aspetto (fondo bianco, raggio 20 px, pulsanti in fondo). Lo strumento del collaudo 161 le dà «fuori cornice» solo perché il bordo misura 0,89 px invece di 1 px: è probabilmente l'animazione d'ingresso, quindi **non lo conto come difetto**. Le schede del mister in partita sono scure (TH_DARK), coerenti fra loro. Il wizard d'apertura stagione (ritiro, `a-finestra-14`, `a-finestra-20`) è a schermo pieno e scuro, con card da 12 px: non è un Modal, ma non so se debba esserlo. Lo segnalo come domanda per il PO, non come difetto. Nessuna finestra esce dallo schermo né ha testo tagliato (scanOverlays: `fuori:false` e `trunc` vuoto ovunque).

## Flusso carriera (S12 settimana 38 → S13 settimana 10)

- **Classifica**, controllata a ogni settimana nuova (giri A, B, C, D) e sui salvataggi di fine giro: somma dei gol fatti = somma dei gol subiti **sempre** (810/810, 834/834, 18/18, 46/46, 95/95, 174/174…); partite giocate uguali per tutte le 18 squadre; nei salvataggi B e C, giocate = vinte+pari+perse, punti = 3·vinte+pari, differenza reti = gf−ga per ogni squadra; vinte totali = perse totali.
- **Calendario:** 34 giornate di lega da 1 a 34 senza doppioni, in ogni settimana. Testi «Giornata N» assurdi a schermo: nessuno. Le settimane con due gare (5, 7, 10, 12, 14, 16 della S13 del Merseyside) sono campionato più Coppa europea, cioè doppio impegno voluto. La Coppa delle Nazioni e l'amichevole non spostano il calendario del club.
- **Fine stagione S12:** premiazione (campioni di Premier Division), galà «Chiara Loreti apre la prima busta», bilancio e S13; poi settimana d'apertura e wizard (ritiro a Prato del Re, risposta al mister) e serata di presentazione «Che la stagione cominci →». Tutto percorso coi clic.
- **Correzione di uno strumento:** la colonna «vinte/pari/perse» della mia sonda per settimana leggeva campi inesistenti (il gioco usa `wins/draws/losses`), quindi in `settimane.jsonl` quella colonna **non vale**. Il controllo giusto è quello sui salvataggi qui sopra.

## Cosa non ho potuto verificare

- **Pallone all'apertura della scena:** le foto d'apertura sono coperte dal cartello introduttivo (`b-p1-scena1-apertura.jpg`…), e il dato `heldBy` della sonda era fermo e identico su partite diverse (7 / 43,8): uno strumento rotto, quindi non lo uso.
- **Coppa nazionale:** non giocata (vedi sopra e N5).
- **Esiti dei rigori:** il testimone non li scrive, quindi non sono giudicati.
- **Quando cadono i compiti lunghi** (N8), e la **quota** del pallone nelle parate (N6).
- **Il telefono:** tutto è misurato in headless. N8 e N6 vanno confermati sul dispositivo.

## Correzioni del mio metodo durante il collaudo (perché i numeri sopra reggono)

1. Il primo giro misurava il 3D **senza** gli interruttori del telefono: 3 gol su 3 «mai in rete». Rifatta la misura con `__CPM_CINE`/`__CPM_REALWAIT` e il pallone registrato in pagina ogni 80 ms, i gol in rete sono stati 3 su 3 (gol3d) e 9 su 9 (giri B, C, D). Era il banco, non il gioco. Il registro di quel braccio senza interruttori resta in `dati/gol3d-banco-senza-interruttori.log`.
2. Sui rigori il testimone d'esito non scrive: nel giro A la scena ereditava l'esito della precedente (foto: rigore registrato come «Contrasto pulito»). L'analisi le marca «non registrato», e dal giro B la sonda legge solo righe **nuove**.
3. La prima leva della panchina lasciava la fiducia a 11/100 e l'eroe non veniva più convocato: corretta, i valori originali vengono rimessi dopo la partita.

## File

- Sonde: `tests/visual/collaudo-164-partite.mjs`, `tests/visual/collaudo-164-gol3d.mjs`, `tests/visual/collaudo-164-analisi.mjs`, `tests/visual/lib/collaudo164.mjs`
- Dati e foto: `docs/collaudi/release-164/`
