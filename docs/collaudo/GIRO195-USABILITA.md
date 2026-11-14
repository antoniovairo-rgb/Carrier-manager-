# Giro 195 — Grafica, fruibilità e usabilità di Korward Elite

Ramo `collaudo/giro195-usabilita`, partito da `lavoro/194` (gioco 7.999.193). **Solo analisi**: `src/` e `GAME_VERSION` non sono stati toccati. Contatto: korward.devteam@gmail.com.

**Come leggere le prove.** Ogni affermazione porta una di queste etichette:
- **[visto]** = guardato in una foto di questo giro (cartella `docs/collaudo/giro195/`);
- **[misurato]** = numero uscito da una sonda di questo giro;
- **[letto nel codice]** = riga di `src/` o di un file di configurazione;
- **[ipotesi]** = non provato: va verificato prima di decidere.

**Limite generale, vale per tutto il documento.** Le prove sono fatte con Chromium senza schermo, alla taglia del telefono (375×667 e 390×844, più 360×640 in un caso). **Non è un telefono Android vero**: dito, caratteri di sistema, scheda grafica, barra di sistema e TalkBack non sono stati provati.

**Strumenti di questo giro** (in `tests/visual/`, non entrano in nessuna catena):
`giro195-schermate.mjs` (tasti, vicinanze, testi tagliati, barre fisse, lunghezza, lettori di schermo), `giro195-percorso.mjs` (percorsi a tocchi, con foto), `giro195-prestazioni.mjs` (avvio con processore rallentato e rete lenta), `giro195-accessibilita.mjs` (testo ingrandito simulato, daltonismo, albero per lettori di schermo), `giro195-foglio.mjs` (fogli di foto). In più la sonda già esistente `griglia-mobile.mjs`, rifatta a 375 e 390 px.

---

## (a) Cosa ho visto

### a.1 — Telefono piccolo e leggibilità

**Quello che è già a posto** (lo dico perché evita lavoro inutile):
- Nessuna schermata scorre in orizzontale e nessun elemento esce dallo schermo: 0 su 14 schermate a 375 e 390 px **[misurato]** (`griglia/REPORT.md`, tabelle 1 e 2).
- Nessun testo sotto i 12 px: 0 su 1.779 testi **[misurato]** (tabella 3).
- Contrasto: 0 testi sotto la soglia su 1.817 misurabili **[misurato]** (tabella 4). Restano fuori dal conto i testi su fondo sfumato: vedi sotto.
- Nessun tasto sotto i 44 px nelle 9 schede di carriera, nel menu, nella finestra della partita, in partita e nel dopo partita **[misurato]** (`schermate/misure.json`). Fra 44 e 48 px (48 è la misura consigliata da Android) ce ne sono da 2 a 7 per scheda: tutti alti 45-47 px.
- Nessun tasto senza nome nelle schede di carriera: 0 su 213 **[misurato]**.

**Quello che non va:**

1. **La terza scelta dell'azione non entra nello schermo sui telefoni bassi.** A 375×667 la terza scelta sta fra 631 e 683 px, ma lo schermo finisce a 667: 16 px fuori. A 360×640 sono 28 px fuori. Le scelte stanno in un riquadro che scorre (alto 141 px, contenuto 168 px). A 390×844 entrano tutte e tre **[misurato]** (`percorsi/scelta-375`, `scelta-360`, `scelta-390`, file `diario.json`; foto `fogli/partita-mossa-scelta-dopo.png`). La scelta ha un tempo limite **[letto nel codice]** (`src/15-live-match.jsx` riga 12253, esito «⏱ Troppo tardi»): quindi su questi telefoni bisogna scorrere mentre il tempo passa. Quanto dura il tempo non l'ho misurato.
2. **Il titolo dell'azione è tagliato mentre muovi l'eroe.** A 375 px si legge «NITZSCHE ti punta a ce…»: mancano 136 px di testo **[misurato]** **[visto]** (stessa foto, primo riquadro).
3. **Le sigle dei club nella barra della partita sono tagliate di 4-5 px** a 375 px («FFT», «WOL») **[misurato]**. La voce PO-397 riguarda la stessa barra: è un residuo da controllare lì, non una proposta nuova.
4. **La barra fissa in basso occupa 111 px** su tutte le schede di carriera: 47 px la striscia «Sostieni il progetto / Idee e feedback», 64 px il menu. A 375×667 è il 17% dello schermo; la sola striscia è il 7% **[misurato]**.
5. **Scorrimenti lunghi a 375×667** (schermi da scorrere; fra parentesi a 390×844) **[misurato]**:

| Scheda | 375×667 | 390×844 |
|---|---:|---:|
| Home | 4,47 | 3,52 |
| Agente | 3,33 | 2,61 |
| Carriera › Profilo | 3,18 | 2,51 |
| Dopo partita (rassegna) | 3,21 | non misurato |
| Ufficio | 2,80 | 2,16 |
| Stagione › Calendario | 2,32 | 1,74 |
| Stagione › Classifica | 2,00 | 1,58 |
| Club | 1,90 | 1,46 |
| Carriera › Nazionale | 1,67 | 1,32 |
| Stagione › Coppe | 1,44 | 1,14 |

   La lunghezza dipende dal salvataggio usato (`fixtures/save-c177-s5w20.json`, stagione 5, settimana 20). La rassegna lunga è già PO-385.
6. **Coppe: tre testi su fascia sfumata** hanno, nel punto peggiore della sfumatura, un contrasto di 2,4:1 e 2,8:1 contro la soglia 4,5:1 («✅ Ottavi», «Korward Europa Cup», «Stagione 5») **[misurato]**. È il caso peggiore, non la media: la sonda prende il colore più sfavorevole della sfumatura.
7. **Opzioni: i 5 cursori dell'audio sono alti 16 px** (larghi 313) **[misurato]** (`percorsi/menu/misura-3.json`). Gli interruttori accanto hanno già l'area di tocco allargata.
8. **Club, riquadro d'apertura a 375 px:** il nome va su due righe («FC / FRANKFURT») e le righe di testo stanno in una colonna stretta accanto a «79 PRESTIGIO /100» **[visto]** (`fogli/menu-opzioni-profilo-ufficio-club.png`, ultimo riquadro).
9. **In pausa sul telefono si legge «Premi P o tocca per riprendere»** **[visto]** **[letto nel codice]** (`src/15-live-match.jsx` riga 11978). Il tasto P sul telefono non c'è.

### a.2 — Percorsi e numero di tocchi

Contati sulla carriera di prova, telefono 375×667 **[misurato]** con `giro195-percorso.mjs`:

| Cosa vuoi fare | Tocchi | Passi |
|---|---:|---|
| Vivere la settimana (senza partita) | 1 + le scelte | «Vivi la settimana», poi una finestra per ogni fatto della settimana (visti: da 1 a 2) |
| Arrivare al calcio d'inizio | **5-6** | Vivi la settimana → scelta del fatto → «Gioca vs…» → «Gioca la partita» → «Salta e gioca» (5) oppure «Vedi le formazioni» → «Salta l'ingresso» (6) |
| Preparare il rinnovo | 2 + scorrimento | scheda Agente, poi «Prepara rinnovo» che sta **2,46 schermi sotto** |
| Cercare un'offerta (mercato aperto) | 2 + scorrimento | scheda Agente, poi «Fai girare il nome» **1,81 schermi sotto** |
| Vedere la Nazionale | 2 | Carriera → Nazionale |

Dove ci si perde:
- **Agente.** L'avviso «Contratto in scadenza: assegna il compito Prepara rinnovo» è circa 2,4 schermi sotto l'inizio della scheda; il «Compito della settimana» è a 2,9 schermi **[misurato]** **[visto]** (`fogli/agente-nazionale.png`). In cima c'è il messaggio del procuratore, che in questo salvataggio parlava d'altro (uno sponsor).
- **Il contratto sta in tre posti**: Club («Contratto: scade a fine st…»), Carriera › Profilo («Contratto») e Agente («Il tuo contratto») **[misurato]** (elenco dei tasti per scheda, `percorsi/posizioni/diario.json`).
- **Profilo: 20 fisarmoniche in fila**, con nomi che si confondono: «Statistiche» e «Statistiche carriera»; «Record di carriera» e «Record personali»; «Premi personali», «Corsa ai premi», «MVP del mese»; «Milestone» e «Achievement» in inglese **[misurato]**.
- **Home.** I riquadri con una scelta («Il patto col mister») cominciano a 1,74 schermi dall'alto; «Obiettivi della stagione» a 3,8 schermi **[misurato]**. Portare su i riquadri delle scelte è già PO-408: qui aggiungo solo il numero.
- **Prima della partita ci sono tre finestre di fila** (scelta del modo, pre-partita, formazioni), ognuna con il suo tasto per andare avanti **[visto]** (`fogli/percorso-settimana-partita.png`).
- **Convocazione in Nazionale, trattativa di mercato e trattativa di rinnovo non le ho percorse fino in fondo**: ho solo le schede di partenza (vedi d).

### a.3 — Coerenza grafica fra schermate

- **Quattro stili diversi per il tasto principale** **[visto]**: crema pieno («Vivi la settimana», «Gioca la partita», «Vedi le formazioni»); bordeaux pieno («Vai al prossimo momento», «Scegli»); verde pieno («Fai girare il nome», scheda Agente); contorno con testo oro («Vediamo», «Ci sto», «Il gruppo prima di tutto»).
- **La stessa grandezza con due forme**: fiducia del mister e popolarità sono barre in Home e cerchi in Club **[visto]** (`schermate/375/dashboard-3.png` e `club-1.png`).
- **Titolo di pagina in posti diversi**: Stagione e Ufficio hanno occhiello e titolo in cima; in Agente il titolo «AGENTE» arriva sotto il riquadro del procuratore; Home, Club e Carriera non hanno titolo **[visto]**.
- **Due barre di menu diverse**: fuori dalla carriera con icona sopra e parola sotto (Home, Rivedi intro, Importa, Opzioni); in carriera solo parole in maiuscolo **[visto]**.
- **Emoji usate come icone**: 139 nelle 14 schermate della griglia; il Calendario da solo ne ha 31, l'Ufficio 17 **[misurato]** (`griglia/REPORT.md`, tabella 9-bis). Su Android le emoji cambiano disegno da marca a marca **[ipotesi]**: non l'ho provato.
- **Tinte di testo diverse per schermata**: 12 in Home, 10 nel Profilo, 3-9 nelle altre **[misurato]** (tabella 6). Colori scritti a mano nel codice: 352 righe in `src/18-career-app.jsx` (185 colori diversi), 281 in `src/15-live-match.jsx` **[letto nel codice]** (conteggio con grep degli esadecimali; non dice quanti sono davvero dipinti).
- **Figurina del profilo grande**: confermo PO-409 **[visto]**; a 375×667 la figurina prende quasi tutto il primo schermo. Non la ripropongo.
- **Numero di versione in testata** («v 7.999.193») su ogni scheda di carriera **[visto]**.
- **Colori dell'app in due file diversi**: `manifest.webmanifest` dice tema `#8e1f33` e fondo `#3d0f1b`; `twa/twa-manifest.json` dice `#0d0f14` per tutti e due. La descrizione nel manifest è in inglese («From prospect to legend — football career browser game») **[letto nel codice]**. Che effetto faccia sul telefono non l'ho visto.

### a.4 — Prestazioni, caricamento, accessibilità, Google Play

**Avvio** della versione che va sul sito e nell'app (`node tools/build-dist.mjs --web`), telefono simulato 375×667 **[misurato]** (`prestazioni/prestazioni.json`):

| Caso | Menu visibile | Entrare in carriera | Blocco più lungo del dito |
|---|---:|---:|---:|
| Senza freni | 0,7 s | 0,2 s | 0,2 s |
| Processore 4 volte più lento | 2,4 s | 1,5 s | 1,0 s |
| Processore 6 volte più lento | 3,4 s | 3,0 s | 1,3 s |
| Processore ×4 e rete a 1,6 Mbit/s con 150 ms di ritardo | **10,5 s** | 0,7 s | 1,0 s |

- Il file del gioco pesa 7,0 MB, 1,76 MB compresso **[misurato]**. Il mio server di prova comprime i testi; che il sito vero faccia lo stesso è **[ipotesi]**: senza compressione, a 1,6 Mbit/s servirebbero circa 35 secondi (calcolo).
- **Entro 4 secondi dal menu partono da sole 61 richieste per 52,6 MB**, senza che il giocatore abbia fatto nulla **[misurato]**. Dentro: 40,6 MB di modelli 3D, fra cui lo stesso corpo in tre livelli di dettaglio (16,8 + 7,1 + 4,2 MB) e 4 immagini dei capelli in PNG da 2,4-2,6 MB l'una. A 1,6 Mbit/s sono circa 4 minuti e mezzo di scaricamento (calcolo, non misurato). Il totale del primo avvio era già noto (63 MB in `docs/governo/USCITA-STORE-184.md`); nuovi sono il momento in cui parte e la composizione.
- Memoria del programma dopo quel caricamento: 112 MB **[misurato]** (solo la parte JavaScript, in Chromium da tavolo).
- Cambio di scheda: da 65 a 670 ms **[misurato]**; il valore oscilla molto fra una corsa e l'altra, lo considero solo indicativo.
- **Fluidità della partita 3D: non misurata.** Senza scheda grafica il numero non vale (lo dice anche `CLAUDE.md`).

**Accessibilità** **[misurato]** (`accessibilita/accessibilita.json`), salvo dove indicato:
- **Zoom bloccato**: la pagina dichiara `maximum-scale=1.0, user-scalable=no` **[letto nel codice]** (`src/00-head.html` riga 28). Chi vede poco non può allargare con due dita.
- **Testo più grande, simulato** (ogni carattere ×1,3 e ×1,6 con uno script: **non** è l'impostazione «dimensione carattere» di Android). A ×1,3 l'impaginazione tiene su 7 schede su 7, con due eccezioni: nella **Classifica la colonna dei punti («PT») esce dal riquadro** **[visto]** (`accessibilita/zoom1.3-standings.png`) e le etichette «Classifica / Calendario» si tagliano di 5-8 px. A ×1,6 si tagliano anche le due strisce in basso («Sostieni il pr…») e le sigle dei club nell'Agente. Se e quanto l'app Android ingrandisca davvero i testi con l'impostazione di sistema è **[ipotesi]**.
- **Daltonismo** (vista simulata da Chromium): la forma recente «V V V N V» ha le lettere, «CASA/FUORI» è scritto, le zone della classifica hanno il numero di posizione: si capisce tutto anche senza colori **[visto]** (`fogli/daltonismo-e-testo-grande.png`). Unico punto: in classifica i numeri di vittorie e sconfitte, verdi e rossi, diventano dello stesso colore; restano però nella colonna giusta.
- **Lettori di schermo**: tutti i tasti sono veri tasti con un nome (0 senza nome su 213 nelle schede). Mancano però: i **titoli** (0 o 1 per scheda), il segnale di **finestra aperta** (0 nella finestra della settimana e in quella della partita), gli **annunci** dei cambiamenti (0), il segnale di **voce di menu attiva** (nel codice: 1 `aria-pressed`, nessun `aria-current` o `aria-selected`) **[letto nel codice]**. Nelle **Opzioni 12 comandi non hanno nome** (5 cursori e 7 interruttori). Con TalkBack vero non ho provato.
- **Riduci animazioni**: rispettato. Con la preferenza attiva le animazioni in corso passano da 1-11 per scheda a 0.
- **Lingua della pagina**: `it`, corretto.

**Google Play** — solo quello che ho potuto leggere nel repo **[letto nel codice]**:
- La via scelta è l'app che apre il sito (TWA): pacchetto `com.korward.elite`, solo verticale, Android 7 o più recente, tasto Indietro gestito in pagina (`src/00-head.html` righe 47-60).
- L'area sicura (tacca, barra di sistema) è prevista nel codice (`viewport-fit=cover` e 19 usi di `safe-area-inset`). Come si comporta sui telefoni con Android 15 e schermo a tutto bordo non l'ho verificato.
- Chiave di firma, scheda dello store, sicurezza dei dati, classificazione per età e prova con 12 tester sono compiti del PO già elencati in `USCITA-STORE-184.md`: non li ripeto.
- **Le regole attuali di Google Play non le ho controllate alla fonte in questo giro.**

---

## (b) Proposte

Costo in giri di sviluppo. «Conflitti» = voci di `BACKLOG.md` e decisioni di `DECISIONI.md` sul ramo `origin/poc/marioprada-character-system`.

**G195-01 — Le tre scelte dell'azione sempre tutte in vista**
- *Cosa cambia per chi gioca:* sui telefoni bassi (alti 640-667 px) le tre scelte si vedono insieme, senza scorrere mentre il tempo corre.
- *Valore:* alto. È il cuore della partita e il tempo è limitato.
- *Costo:* 1. *Rischio:* medio: bisogna togliere altezza alla scena 3D o al testo sopra le scelte, e serve un guardiano a 360×640 e 375×667.
- *Conflitti:* stessa zona di PO-389 (scelte distinguibili a parole) e della regola «schermata piena» (PO-320): da fare insieme a PO-389. Non tocca il «rischio cieco». Diversa da G181-22, che chiede più tempo: qui il tempo resta com'è.

**G195-02 — Il titolo dell'azione su due righe**
- *Cosa cambia:* mentre muovi l'eroe leggi tutta la frase («Nitzsche ti punta a centrocampo: fermalo!») e non «…a ce…».
- *Valore:* medio. *Costo:* meno di 1, nello stesso giro della 01. *Rischio:* basso (due righe tolgono circa 20 px al riquadro delle frecce).
- *Conflitti:* nessuno trovato. Le sigle tagliate di 4-5 px vanno riviste dentro PO-397.

**G195-03 — Primo avvio leggero sulla rete del telefono**
- *Cosa cambia:* il menu compare subito anche con poca rete, e il gioco non scarica 52 MB di nascosto appena aperto. I modelli 3D si scaricano quando servono, con un avanzamento visibile, e solo nel livello di dettaglio adatto al telefono; le immagini dei capelli in un formato più leggero.
- *Valore:* alto per lo store: chi apre il gioco con i dati mobili consuma traffico senza saperlo, e la prima partita può partire prima che i modelli siano arrivati.
- *Costo:* 2. *Rischio:* medio-alto.
- *Conflitti:* PO-449 («mai T-pose né corpi di riserva», barra di caricamento, giro 196): le due cose vanno progettate insieme, perché rinviare lo scaricamento senza l'attesa visibile peggiorerebbe proprio PO-449. **[ipotesi]** da verificare prima: se i tre livelli di dettaglio servono tutti nella stessa scena (vicino e lontano), non si possono togliere e resta solo da ordinarli.

**G195-04 — Togliere il blocco dello zoom**
- *Cosa cambia:* chi vede poco allarga con due dita le schede di testo.
- *Valore:* medio (alto per pochi). *Costo:* meno di 1. *Rischio:* medio: in partita un doppio tocco o due dita sulle frecce potrebbero ingrandire per sbaglio; si può lasciare il blocco solo in partita.
- *Conflitti:* nessuna decisione trovata sullo zoom. Si affianca a PO-393 (testo grande come interruttore), non lo sostituisce.

**G195-05 — Classifica e schede pronte per il testo grande**
- *Cosa cambia:* con i caratteri più grandi la colonna dei punti resta visibile e le etichette delle schede non si tagliano.
- *Valore:* medio; è la condizione perché PO-393 funzioni. *Costo:* meno di 1, dentro PO-393. *Rischio:* basso.
- *Conflitti:* è un'aggiunta a PO-393 (giro 196), non una voce separata.

**G195-06 — Il minimo per i lettori di schermo**
- *Cosa cambia:* chi usa TalkBack sente il titolo della scheda, capisce quando si apre una finestra e quale voce del menu è attiva; nelle Opzioni ogni cursore e interruttore dice cos'è.
- *Valore:* basso-medio per numero di giocatori. *Costo:* 1-2. *Rischio:* basso (attributi invisibili); va provato con TalkBack vero.
- *Conflitti:* nessuna decisione trovata.

**G195-07 — Cursori dell'audio più facili da prendere**
- *Cosa cambia:* il cursore si afferra al primo colpo (oggi è alto 16 px; area di tocco da portare a 44).
- *Valore:* basso-medio. *Costo:* meno di 1. *Rischio:* basso.
- *Conflitti:* stessa parte di PO-370 (pannello audio in partita): se usa gli stessi cursori, si sistemano una volta sola **[ipotesi]**.

**G195-08 — Agente: in cima «da fare ora»**
- *Cosa cambia:* aprendo l'Agente vedi subito le cose con una scadenza (contratto in scadenza, compito della settimana, mercato aperto) con il loro tasto; il resto sotto. Il rinnovo passa da «2 tocchi e 2,5 schermi di scorrimento» a 2 tocchi.
- *Valore:* medio-alto. *Costo:* 1. *Rischio:* basso (si riordina, non si cambia nessuna regola).
- *Conflitti:* stessa logica di PO-408 (scelte in cima alla Home) e PO-446 (il tasto che blocca ti porta al rinnovo): PO-446 ti porta lì, questa fa in modo che lì la cosa sia in alto. Da fare nello stesso giro. PO-433 (rinnovo da bandiera) aggiungerà contenuto alla stessa scheda.

**G195-09 — Profilo in pochi gruppi, e il contratto in un posto solo**
- *Cosa cambia:* al posto di 20 fisarmoniche in fila, 4 o 5 gruppi con nomi che non si confondono (per esempio: Numeri, Premi, Storia, Contratto e attributi); parole italiane al posto di «Milestone» e «Achievement»; il contratto si legge per intero nell'Agente, altrove c'è una riga che ci porta.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* basso; chi è abituato deve ritrovare le voci.
- *Conflitti:* PO-409 (figurina del profilo) è nella stessa scheda: stesso giro. PO-010 (fisarmoniche) è chiusa e resta valida. PO-380 per le parole inglesi. PO-427 (numeri da bar) e PO-442 (almanacco) aggiungeranno voci: meglio raggruppare prima.

**G195-10 — La striscia «Sostieni / Idee» solo dove serve**
- *Cosa cambia:* 47 px in più di contenuto (7% dello schermo a 375×667) su tutte le schede, se la striscia resta solo in Home o passa in Opzioni/Ufficio.
- *Valore:* medio. *Costo:* 1. *Rischio:* basso per il gioco; meno clic sulla donazione.
- *Conflitti:* il PO ha deciso di **tenere** il bottone donazione (07/11) e il 21/09 ha chiesto di ridurlo in altezza. Qui non si toglie: si sposta. È una scelta del PO.

**G195-11 — Una regola sola per il tasto principale**
- *Cosa cambia:* in ogni vista c'è un solo tasto «forte» e ha sempre lo stesso aspetto; si capisce a colpo d'occhio dove toccare.
- *Valore:* medio. *Costo:* 1-2 (solo grafica). *Rischio:* basso.
- *Conflitti:* PO-411 vuole «Vai al prossimo momento» pieno nel colore del club, come «Vivi la partita»: la regola va scritta partendo da quella decisione. Decisione «un tema solo» (03/11): rispettata, si usano i colori che ci sono.

**G195-12 — Stessa testata e stessi titoli in ogni scheda**
- *Cosa cambia:* ogni scheda comincia allo stesso modo (occhiello e titolo in cima), e il menu fuori e dentro la carriera ha lo stesso disegno.
- *Valore:* basso-medio. *Costo:* 1. *Rischio:* basso; allunga di una riga Home, Club e Carriera.
- *Conflitti:* decisione 02/11 «testata compatta»: il titolo va aggiunto senza ingrossarla. Si lega alla G195-06 (i titoli servono anche ai lettori di schermo).

**G195-13 — La stessa grandezza ha sempre la stessa forma**
- *Cosa cambia:* fiducia del mister e popolarità si leggono allo stesso modo in Home e in Club.
- *Valore:* basso-medio. *Costo:* meno di 1. *Rischio:* basso.
- *Conflitti:* **PO-391** (popolarità e fiducia a gradini, non a barra) cambierà proprio queste due: va fatta dentro PO-391, non prima.

**G195-14 — Meno finestre prima del calcio d'inizio**
- *Cosa cambia:* dalla seconda partita il gioco ricorda come hai scelto l'ultima volta («Gioca la partita» o «solo i momenti salienti») e ti offre un tasto solo, con «cambia» accanto: da 5-6 tocchi a 3-4.
- *Valore:* medio (è il gesto più ripetuto del gioco). *Costo:* 1. *Rischio:* medio.
- *Conflitti:* la finestra con premio e rischio è una decisione (PO-259) e il pre-partita con l'analisi dell'avversario pure (PO-217); PO-400 ha rimesso «Gioca» nel riquadro; PO-392 (lo studio dell'avversario che paga) userà il pre-partita. Va deciso dal PO che cosa si può saltare.

**G195-15 — Rifiniture a 375 px**
- *Cosa cambia:* sei piccoli punti: riquadro d'apertura del Club meno stretto; «tocca per riprendere» senza «Premi P» sul telefono; i tre testi delle Coppe leggibili sulla fascia sfumata; numero di versione fuori dalla testata (per esempio in Opzioni); stessi colori dell'app nei due file di configurazione; descrizione in italiano nel manifest.
- *Valore:* basso-medio (primo impatto per lo store). *Costo:* 1. *Rischio:* basso.
- *Conflitti:* nessuno trovato. Diversi dai sei punti di PO-430.

---

## (c) Le prime dieci, e «se ne facessi solo tre»

| # | Proposta | Valore | Costo | Rischio |
|---:|---|---|---:|---|
| 1 | G195-01 Tre scelte sempre in vista | alto | 1 | medio |
| 2 | G195-03 Primo avvio leggero | alto (store) | 2 | medio-alto |
| 3 | G195-08 Agente: «da fare ora» | medio-alto | 1 | basso |
| 4 | G195-02 Titolo dell'azione intero | medio | <1 | basso |
| 5 | G195-14 Meno finestre prima della partita | medio | 1 | medio |
| 6 | G195-09 Profilo in pochi gruppi | medio | 1-2 | basso |
| 7 | G195-10 Striscia «Sostieni» solo dove serve | medio | 1 | basso |
| 8 | G195-11 Un solo tasto principale | medio | 1-2 | basso |
| 9 | G195-04 + 05 Zoom libero e classifica pronta al testo grande | medio | 1 | medio |
| 10 | G195-15 Rifiniture a 375 px | basso-medio | 1 | basso |

**Se ne facessi solo tre:** G195-01, G195-03, G195-08.
- La **01** perché è l'unico difetto misurato che tocca il gioco vero e proprio su telefoni piccoli.
- La **03** perché riguarda il primo minuto di chi scarica il gioco dallo store; però va progettata insieme a PO-449.
- La **08** perché costa poco e toglie lo scorrimento dal percorso del rinnovo, che già due voci del BACKLOG (PO-432, PO-446) segnalano come punto dove ci si perde.

L'ordine è una mia valutazione: decide il PO.

---

## (d) Cosa non ho verificato

1. **Nessun telefono vero.** Dito, caratteri di Android, scheda grafica, batteria, calore, barra di sistema, tacca, Android 15 a tutto bordo.
2. **Fluidità della partita 3D** e tempo d'ingresso in partita: la sonda non è arrivata al calcio d'inizio nella versione compilata entro il tempo dato; l'ho tolto dalla misura.
3. **TalkBack vero.** Ho letto solo l'albero che Chromium espone.
4. **Testo grande di Android.** La mia è una simulazione con uno script; non so se l'app ingrandisca davvero i testi con l'impostazione di sistema.
5. **Compressione del sito vero** e tempi su rete reale: misurati solo su un server locale con rete rallentata. I 4 minuti e mezzo per i 52 MB sono un calcolo.
6. **Se i tre livelli di dettaglio del corpo servano tutti**: non ho letto il codice che li sceglie.
7. **Regole attuali di Google Play** (livello minimo, accessibilità, pagamenti): non controllate alla fonte in questo giro. Vale quanto scritto in `USCITA-STORE-184.md`.
8. **Percorsi non percorsi fino in fondo:** convocazione in Nazionale, trattativa di mercato, trattativa di rinnovo, apertura e fine stagione, cerimonie, creazione del giocatore e provini (questi ultimi solo con la griglia, ferma alla prima schermata).
9. **PC e tablet:** non guardati in questo giro. Tutto il tempo è andato al telefono.
10. **Durata del tempo di scelta** e quante volte, in una partita vera, la terza scelta resta fuori: misurata una scena per taglia.
11. **Una sola carriera di prova** (stagione 5, settimana 20, più quella interna della griglia): le lunghezze cambiano con il salvataggio. Primavera, fine carriera e inizio stagione non misurati.
12. **Rumore delle misure:** i tempi di avvio sono una corsa per caso (due per il caso senza freni: 651 e 680 ms). Non sono medie.
13. **Emoji sui telefoni di marche diverse** e colori dell'app nella barra di sistema: solo letti nei file.
14. **Stato del giro 194:** PO-397, PO-405, PO-410 e PO-411 nel BACKLOG risultano «da fare 194», ma `lavoro/194` è già unito: non ho controllato una per una se sono davvero dentro il gioco che ho misurato.

---

### Dove sono le prove

- `docs/collaudo/giro195/griglia/` — rapporto e foto della griglia a 375 e 390 px.
- `docs/collaudo/giro195/schermate/` — foto delle 9 schede a pezzi di schermo e `misure.json`.
- `docs/collaudo/giro195/percorsi/` — foto e diario dei percorsi (`settimana`, `scelta-360/375/390`, `posizioni`, `menu`).
- `docs/collaudo/giro195/prestazioni/prestazioni.json` — tempi e pesi di avvio.
- `docs/collaudo/giro195/accessibilita/` — foto con vista simulata e testo ingrandito, `accessibilita.json`.
- `docs/collaudo/giro195/fogli/` — cinque fogli che affiancano le foto citate sopra.
