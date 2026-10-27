# RAPPORTO collaudo 177 — carriera intera n.2 «molti trasferimenti»

Gioco 7.999.177 · ramo `collaudo/7.999.177-carriera-2` · telefono 412×915 (Chromium headless, GL software, `?cpmtest=1`, velocità 2×) · solo misura: `src/`, `GAME_VERSION`, `docs/governo/` non toccati.
Carriera giocata a più riprese da collaudatori successivi (interrotti dalle pause del PO); questa sessione ha **ripreso dal salvataggio `cp-s18w1`** (inizio stagione 18, AC Dorvelli), ha giocato la stagione 18 e ha chiuso la carriera col ritiro. Le stagioni 1-17 sono state giocate dai collaudatori precedenti: di quelle ho **rianalizzato i dati registrati** (`dati-carriera-177-2/eventi.jsonl`, `registro-settimane.jsonl`, `confronto-salvataggio.jsonl`, `anomalie-auto.jsonl`), non le ho rigiocate.

## 1. Riassunto

| | |
|---|---|
| Eroe | Marco Vairone, Italia, attaccante, piede destro |
| Carriera | **18 stagioni** (1 Primavera + 17 da professionista), ritiro a 34 anni, annunciato a inizio stagione 18 (passo 7 del wizard «L'ultima stagione?») |
| Club | **16 club diversi, 19 ingressi / 18 cambi di maglia**: Ciociaro Primavera → Clermont → Gelsenkirchen → Panteras → Hammers → Stuttgart → Marnesi → Brenvar → Sociedad → Felsineo → Vellamare → Merseyside → Capitale → Dorvelli → Stamford → Valmora → Dorvelli → Stamford → Dorvelli (quasi tutti prestiti di 1 stagione, «con obbligo di riscatto» o secchi) |
| Gol / assist / presenze | **326 / 125 / 701** (la somma dei gol e degli assist stagione per stagione coincide coi totali: 326 e 125) |
| Nazionale | 44 presenze, 26 gol in Nazionale |
| Trofei | 8 (schermata «Fine carriera»); Legacy Score 1000/1000, «Leggenda Assoluta» |
| OVR massimo | **88** (stagione 14, FC Stamford, 30 anni); a fine carriera 84 |
| Miglior stagione | S.8 con 28 gol (FC Sociedad) — coincide col registro |
| Partite giocate dal vivo | 254 registrazioni (205 `live`, 47 `live-ripreso`, 2 Nazionale) su 701 presenze = ben oltre «1 ogni 4»; 1.366 highlight dell'eroe, con scelte a rotazione (prima/seconda/terza/ultima opzione) |
| Salva/ricarica | a ogni inizio stagione (cp-sNw1.json), confronto registrato in `confronto-salvataggio.jsonl` |
| Chiusura | stagione 18: 27 gol, 17 assist, 48 presenze, **Coppa dei Campioni vinta**, 2° in Lega A, Coppa Nazionale vinta (sim.); schermata «Fine carriera» raggiunta e verificata |

### Stagioni

| St. | Età | Club (a fine stagione) | Lega | Gol | Assist | Pres. | OVR | Trofei (cum.) |
|---|---|---|---|---|---|---|---|---|
| 1 | 17 | FC Ciociaro Primavera | Primavera 2 | 6 | 6 | 34 | 64 | 0 |
| 2 | 18 | FC Gelsenkirchen | Deutsche Liga 2 | 5 | 1 | 37 | 67 | 0 |
| 3 | 19 | FC Panteras | Liga Lusitana | 6 | 4 | 35 | 70 | 1 |
| 4 | 20 | FC Hammers | Premier Division | 7 | 5 | 43 | 73 | 1 |
| 5 | 21 | FC Stuttgart | Deutsche Liga | 13 | 6 | 43 | 75 | 1 |
| 6 | 22 | FC Marnesi | Lega A | 15 | 7 | 37 | 78 | 1 |
| 7 | 23 | FC Brenvar | Lega A | 20 | 11 | 46 | 79 | 1 |
| 8 | 24 | FC Sociedad | Liga Ibérica | 28 | 3 | 45 | 80 | 1 |
| 9 | 25 | FC Felsineo | Lega A | 17 | 3 | 38 | 82 | 2 |
| 10 | 26 | FC Vellamare | Lega A | 25 | 10 | 38 | 84 | 4 |
| 11 | 27 | FC Merseyside | Premier Division | 21 | 12 | 44 | 85 | 4 |
| 12 | 28 | FC Capitale | Lega A | 26 | 4 | 38 | 87 | 5 |
| 13 | 29 | AC Dorvelli | Lega A | 27 | 8 | 35 | 87 | 5 |
| 14 | 30 | FC Stamford | Premier Division | 21 | 6 | 33 | 88 | 5 |
| 15 | 31 | FC Valmora | Lega A | 17 | 3 | 35 | 86 | 5 |
| 16 | 32 | AC Dorvelli | Lega A | 27 | 12 | 36 | 86 | 5 |
| 17 | 33 | FC Stamford | Premier Division | 18 | 7 | 36 | 85 | 6 |
| 18 | 34 | AC Dorvelli | Lega A | 27 | 17 | 48 | 84 | 8 |

### Esito del lavoro, in onestà
- **Verificato in questa sessione (stagione 18 + ritiro)**: tutte le schermate di fine stagione e di fine carriera (foto c21-c24), la coerenza dei totali di carriera (326/125/701), il fatto che l'offerta di ritiro compaia e conduca alla cerimonia.
- **Rianalizzato dai dati registrati (stagioni 1-18)**: la coerenza esito-scritto ↔ evento del motore (`ActionResolved`) ↔ punteggio ↔ tabellino sulle 254 partite dal vivo. **Non ho verificato il 3D** (movimento del pallone, gesto, portiere) di queste partite: il registro contiene testi, punteggi e timeline, non filmati. Dove sotto scrivo «3D» è sempre un'ereditarietà dichiarata.
- I difetti marcati *(ereditato)* vengono dalle note dei collaudatori precedenti (`dati-carriera-177-2/note-difetti-in-corso.md`); li ho **ricontrollati sui dati** quando possibile e lo dichiaro nella colonna «Prova».

## 2. Difetti alti e medi

Regola PO applicata: ogni difetto negli highlight vale almeno «medio».

| ID | Gravità | Stagione/sett. | Schermata | Cosa succede | Come riprodurlo | Prova / foto |
|---|---|---|---|---|---|---|
| D1 | **ALTA** *(ereditato, riconfermato sui dati)* | S1-S4, ogni settimana con partita dal vivo | Highlight, pannello scelta → risultato | Toccando un'azione **subito** dopo la comparsa del pannello, il motore non registra la scelta (nessun `ActionResolved`) e il risultato mostrato è di **un'altra azione**: scelta «Anticipa sul primo controllo» → esito «Fallito · Scivolata netta»; scelta «Conclusione potente» → «Fallito · Testa piazzata all'angolo». Con attesa ≥ 0,9 s: 0/151 incongruenze. | In `hl_choose` toccare un bottone entro ~0,5 s dall'apertura del pannello (la sonda `c177-car2-hl-probe.mjs` / `sonda-tocco-bottone.json`). | Nei dati: **177 highlight su 1.366** senza `ActionResolved`, **tutti** in S1-S4 (49/49/51/28), **zero** da S5 a S18 (dove il pilota attende ≥ 2,2 s). Un giocatore vero tocca anche in meno di 1 s. |
| D2 | **MEDIA** *(ereditato, riconfermato)* | S1-S4 | Highlight difensivo, riquadro esito | Quando l'eroe **difende** (Pressing alto, «esce palla al piede: aggredisci!», Ripiegamento) e la scelta non viene registrata (D1), l'esito è il testo generico d'**attacco**: «Fallito · … Troppo lento — il marcatore intercetta» / «Il difensore anticipa e recupera palla» / «Intervento difensivo! Palla persa». | Come D1 su uno qualsiasi degli highlight `type:def`. | **18 casi** nei dati (7/3/4/4 in S1-S4), 0 dopo; es. S1 W6 min 12 «Pressing alto su LONGO» → «Troppo lento — il marcatore intercetta». |
| D3 | **MEDIA** *(ereditato)* | S2 W39 → S3 | Gala di fine stagione vs Bilancio | Rivale Phil Dupont: **10 gol** nel gala S2 («gol in campionato») ma **8 gol** nel bilancio S2/S3. | Chiudere S2, confrontare «Il duello della stagione» (gala) con il rivale nel bilancio. | note collaudatore 1; non ricontrollato da me. |
| D4 | **MEDIA** *(nuovo, dai dati)* | S1-S18, tutte | Highlight di passaggio/cross/assist | Gli highlight in cui l'eroe **sceglie un passaggio** (Servi X libero, Filtrante, Lancio smarcante, Uno-due, Cross, Palla in area) riescono **15 volte su 205 (7,3%)**; 190 sono «intercettati» (16 su 205 «miss»). Per un attaccante con PASSAGGIO 89 e OVR fino a 88 è praticamente impossibile servire un assist dal pannello: i 125 assist di carriera arrivano quasi tutti dalla simulazione. Tasso di successo di tutti gli highlight: **21,3%** (progression 6%, dribble 11%, insertion 10%, shot 21%, recover 53%, rigore 69%); in S4-S6 sotto il 13%. **È il difetto «assist che falliscono» già noto**: riporto solo il numero. | Giocare qualunque partita dal vivo e scegliere sempre l'azione di passaggio. | `eventi.jsonl`: conteggio `ActionResolved` per intento/chiave. |

## 3. Difetti bassi

| ID | Stagione/sett. | Schermata | Cosa succede / prova |
|---|---|---|---|
| B1 *(ereditato)* | S2 W39 | Gala | Trofeo d'Oro: vincitore con 27 gol, 2° con 42 e 3° con 34 (l'etichetta «gol» non spiega l'ordine). |
| B2 *(ereditato)* | S2 W23 | Agente | «Contratto in scadenza e stipendio sotto il mercato» con stipendio 263k > stima di mercato 238k (Gelsenkirchen). |
| B3 *(ereditato)* | S1 W39 | Impulsi | Impulso «TV la sera prima della gara» proposto a stagione chiusa. |
| B4 *(ereditato)* | S2 (Clermont) | Contratto | Offerta «1 stagione» → scade alla fine della stagione successiva («fine st. 3, 1 stagione rimasta»). |
| B5 *(ereditato, confermato dal confronto salvataggio)* | S6, S9, S12, S15, S18 W1 | Salvataggio/Spogliatoio | Dopo un trasferimento a inizio stagione il salvataggio conserva i **compagni (`teammates`) del club precedente** e `cup.club` assente; si correggono solo ricaricando (5 dei 13 cambi di club confrontati dalla S6 in poi — S6 Marnesi, S9 Felsineo, S12 Capitale, S15 Valmora, S18 Dorvelli, cioè una volta ogni tre stagioni; negli altri 8 cambi il salvato è coerente). In sessione i compagni sono giusti: il difetto è nel salvato. |
| B6 *(ereditato)* | S1 W1 | Dashboard | Popolarità +3 dichiarato, +1 effettivo; popolarità 100/100 già a 19 anni (S3). |
| B7 *(ereditato)* | partita, 46' | Tabellone | L'ordine delle squadre nel tabellone si inverte al 46' (cambio campo). |
| B8 *(ereditato)* | S2 W23-W36 | Scheda stagione | Sigla con articolo sbagliato nella riga «Prima parte con il FC Clermont» (lint testi: «articolo prima della sigla»). |
| B9 *(ereditato)* | prima partita dopo ricarica | Partita | Caricamento lento (> 20 s) prima che la fase parta. |
| B10 *(nuovo)* | S18 W39 | Fine stagione (dopo la vittoria della Coppa dei Campioni) | Titolo «CAMPIONI D'EUROPA!» e, sotto, il banner «🎉 IN EUROPA! AC Dorvelli qualificato in Coppa dei Campioni!» (testo da qualificazione, non da vittoria). Foto `c21`. |
| B11 *(nuovo)* | S18 fine carriera | «Fine di un'era» / lettera | «17 stagioni» mentre l'intestazione di gioco era a «St. 18»: conta le sole stagioni da professionista (S1 era Primavera) ma le **701 presenze** e i 326 gol includono anche la Primavera; la lettera dice «da quel giorno sono passate 17 stagioni… 701 presenze e 326 gol». Foto `c22`-`c24`. |
| B12 *(nuovo)* | S18 W39 | Fine stagione | Il bottone «🏁 Il giorno dell'addio →» sta sotto la piega, dopo 7 riquadri a fisarmonica; la schermata non ha altro bottone visibile in prima vista (chi non scorre non trova come proseguire). Foto `c21`. |
| B13 *(nuovo, tecnico)* | S18 W5, 16, 23, 26, 29 | Dati partita | Le partite europee a eliminazione (`euro:true`) entrano in `matchHistory` **senza il campo `season`** (5 su 48 in S18); il filtro «campionato» le esclude comunque (`!h.euro`), quindi nessun effetto visibile osservato, ma l'invariante «goals stagione = somma storico» non torna se non si escludono (mia sonda: 27 vs 24 gol, 17 vs 15 assist, differenza spiegata esattamente dalle 5 partite europee senza `season`: 2+0+0+1+0 gol e 0+1+1+0+0 assist; i gol di Nazionale non entrano nei gol di stagione). |
| B14 *(nuovo)* | 19 partite su 195 con tabellino | Tabellino partita | Il tabellino personale ha **più gol/assist degli highlight** (es. S8 W14: 5 gol, 4 da highlight; S6 W5: 2 gol, 1 da highlight; S14 W14: 4 gol/1 assist, 3 da highlight): gol assegnati all'eroe dalla simulazione di sfondo. Coerente col punteggio, non verificato nel 3D. Nessun caso opposto (highlight non contati). |
| B15 *(nuovo)* | S1-S18 | Highlight difensivo | L'opzione «💪 Contrasto pulito senza fallo» produce «FALLO / Cartellino meritato» (17 volte su 45 scelte dell'opzione, chiave `foul`): il nome promette l'opposto del risultato. Possibile per design (rischio), da decidere. |

Controlli senza difetto, per completezza: ogni `goal` ha aumentato di 1 il punteggio (129/129, nessun doppio gol né gol mancante nel punteggio dopo l'highlight, nemmeno dopo i rigori dell'eroe: 18 rigori riusciti su 26); ogni `assist` ha aumentato di 1 il punteggio (22/22) e nessuna partita ha meno assist nel tabellino che negli highlight. Nessun `undefined`/`NaN`/`[object` né «Il Italia»/«900ª giornata» nel testo registrato; nessun pageerror nella stagione 18.

## 4. Difetti già noti da altre carriere rivisti qui

- **Assist che falliscono**: rivisto, vedi D4 (15/205).
- **Convocazioni mancanti in Nazionale**: 44 presenze in 17 stagioni professionistiche (0 presenze fino alla S5, poi 1, 3, 9, … 44 alla S18); non ho approfondito.
- **Contratto che scade senza rinnovo / doppio gol dopo il rigore / «Il Italia» / «900ª giornata» / finta come passaggio**: non rivisti nei dati registrati. (Nota: nei dati di carriera l'etichetta «Finta e cambio di passo» (intento dribble) ha prodotto 6 volte la chiave `assist` — la finta contata come passaggio — es. S9 W10 e W18; riporto il fatto, senza altro.)

## 5. Fotografie (`foto-carriera-177-2/`, 25 file)
c00-c20: creazione, provini/offerte, presentazioni club, Ufficio, Agente, galà e bilancio S2, accademia (collaudatori precedenti) · c21 fine stagione 18 con il bottone dell'addio · c22 «Fine di un'era» · c23 lettera d'addio · c24 statistiche di fine carriera.

## 6. Limiti
- Il 3D (gesto, pallone, portiere, regia) delle 254 partite non è stato rianalizzato qui; solo testo, punteggio, timeline, tabellino.
- Il pilota ha aspettato ≥ 2,2 s prima di toccare le scelte da S5 in poi: questo spiega l'assenza di D1/D2 in quelle stagioni ma anche che, dopo, non ho testato il tocco rapido.
- Il passo 7 del wizard di S18 («Annuncio il ritiro») è stato preso dal pilota come prima opzione: la carriera si è quindi conclusa alla stagione 18 per scelta del pilota, non perché il gioco l'abbia imposto (a 34 anni il bottone di ritiro «Ritirati» compare dai 35).
