# WEEKLY LIFE DESIGN — «Vediamo cosa succede questa settimana»
**Charter di game design v1.0 · Career Player Manager (Korward Elite)**
*Game Director / Lead Game Designer — documento di sola progettazione, zero codice.*

---

## 0. Diagnosi del gioco attuale

Cosa c'è già (e va SFRUTTATO, non duplicato):

| Sistema esistente | Stato | Giudizio |
|---|---|---|
| `storyChapter` (capitoli derivati: dubita, rivale in casa, ex, finale, volata, tributi, azzurra, fascia, gol 100, eterni rivali) | vivo | **Il gioiello.** È già un motore narrativo derivato — ma è mono-canale (una card) e non ha un'orchestrazione |
| `transferSaga` (trattativa a 3 episodi) | vivo | Ottimo pattern «una storia in più settimane» — replicabile su altri domini |
| `WEEKLY_EVENTS` / `WEEKLY_IMPULSES` / bivi | vivo | Pool ricchi ma **piatti**: pescano a caso (con cond), non da uno stato del mondo |
| `worldMemory` | vivo | Sottosfruttato: ricorda tornei/record, NON promesse/conflitti/gratitudine |
| `coachTrust`, `teamChemistry`, `squadRole`, staff rel | vivi | Numeri senza **volti**: manca la relazione con persone specifiche |
| Rivale NPC, giornalisti, compagni archetipo | vivi | Personaggi che esistono ma non **agiscono** quasi mai |
| Nazionale (convocazioni, tornei, natHistory) | vivo | Funziona ma è amministrativa: manca la POLITICA della Nazionale |
| Pledge/obiettivi/presidente | vivi | Buona base del sistema «promesse» |
| Vita privata | **assente** | Grande spazio bianco |
| Sponsor | **assente** | Grande spazio bianco |
| Psicologia | implicita (morale/forma) | Mai raccontata come stato interiore |

**Il problema di fondo:** la settimana è una *pipeline di risoluzione* (eventi→partita→avanza), non un *episodio*. I sistemi non si parlano: il capitolo non sa dell'impulso, l'impulso non sa del mercato. Serve un **direttore d'orchestra**, non altri strumenti.

---

## 1. IL SISTEMA PORTANTE

### S1 · Il Regista della Settimana (Week Director)
- **Obiettivo:** trasformare ogni «Avanza» in un episodio con un tema, un ritmo e mai rumore.
- **Descrizione:** un meta-sistema che NON crea contenuto ma **sceglie e ordina** quello dei sistemi sottostanti. Ogni sistema (spogliatoio, media, mercato, nazionale, vita privata, sponsor, mister…) propone candidati con un punteggio di *pertinenza* (quanto nasce dai fatti recenti) e *fame narrativa* (da quanto quel canale tace). Il Regista compone la settimana con un **budget d'attenzione**: 1 beat maggiore + massimo 2 minori. Mai tre pop-up; mai una settimana muta per più di 2 settimane di fila.
- **Come funziona:** curva di tensione stagionale (W1 raduno alto → W5-15 crociera → W19 mercato → W30+ crescendo → W38 apice). Nelle settimane di crociera il Regista *cerca* materiale (lì vive la vita privata, lo spogliatoio, gli sponsor); nelle settimane calde lascia spazio al calcio.
- **Attivazione:** ogni avanzamento, su tutti i path (vivi/gioca/simula/avanza) — lezione STAB: mai logica mono-path.
- **Variabili:** fase carriera, fama, forma, calendario (big match? finale? derby?), «debito narrativo» per canale, memoria del mondo.
- **Conseguenze immediate:** settimane leggibili, dosate, tematiche.
- **Conseguenze future:** ogni sistema nuovo si aggancia al Regista senza affollare la UI.
- **Collegamenti:** TUTTI. È la spina dorsale; `storyChapter` diventa il suo canale «capitolo».
- **Engagement:** l'attesa («cosa mi tocca questa settimana?») nasce dal dosaggio, non dalla quantità.
- **Rischi di bilanciamento:** budget troppo stretto = gioco muto; troppo largo = spam. Tuning: 1 maggiore/settimana, hard-cap 3 interazioni.
- **Priorità: ALTA** · **Complessità: 3/5**

### S2 · La Memoria del Mondo 2.0 (Registro di Promesse, Torti e Gratitudine)
- **Obiettivo:** «il gioco si ricorda tutto» — reso meccanica, non slogan.
- **Descrizione:** estensione di `worldMemory` a un **registro relazionale**: ogni promessa (a mister, presidente, tifosi, compagno, CT), ogni torto (litigio, rifiuto di convocazione, esultanza contro l'ex), ogni gratitudine (assist ceduto, difesa pubblica di un compagno) diventa una voce `{chi, cosa, quando, peso, scadenza}`. Le voci **maturano**: una promessa ha una deadline e un giudice; un torto decade lentamente, ma un torto ripetuto raddoppia.
- **Come funziona:** i sistemi consultano il registro prima di generare eventi. Il mister che ti rimprovera *cita* la promessa mancata. La curva che fischia *ricorda* la frase in conferenza di 20 settimane fa. Il CT che ti esclude *ricorda* il no all'amichevole di marzo.
- **Attivazione:** scritture dai sistemi; letture da ogni generatore di eventi.
- **Variabili:** ledger persistente nel save (cap ~60 voci, priorità per peso).
- **Conseguenze:** immediate deboli, future FORTI — è il sistema che rende vere le altre feature.
- **Collegamenti:** pledge (già esiste = prima voce del registro), arcSeen, journalists, natHistory.
- **Engagement:** il momento «se lo ricorda!» è il picco di credibilità di tutta la carriera.
- **Rischi:** rancori eterni = frustrazione → decadimento + gesti riparatori sempre possibili.
- **Priorità: ALTA** · **Complessità: 3/5**

---

## 2. LE PERSONE

### S3 · Lo Spogliatoio Vivo (relazioni con nomi e facce)
- **Obiettivo:** trasformare `teamChemistry` (un numero) in un tessuto di rapporti con compagni SPECIFICI.
- **Descrizione:** 4-5 compagni «attivi» per stagione (dal roster reale: il capitano, il tuo partner d'attacco, il giovane, il veterano, il nuovo acquisto) con una relazione individuale (-100..+100) che evolve dai FATTI: assist reciproci in partita vera, minuti rubati (lui in panca per te), episodi (cena di squadra, scherzo al nuovo, difenderlo dai giornali o no). Ogni relazione ha stati leggibili: estraneo → alleato → amico fraterno / rivale interno → gelo.
- **Come funziona:** eventi derivati: «Marchetti ti ha servito 3 assist nelle ultime 5: vi trovate a memoria» (+intesa, piccolo bonus di conversione quando è in campo — realistico, misurabile); «Il nuovo centravanti non ti passa mai il pallone al limite» (bivio: parlargli / parlarne al mister / farlo parlare al campo). L'amico fraterno un giorno viene VENDUTO: settimana del distacco, poi lo ritrovi da ex (aggancio all'arco «eterni rivali»/«ritorno da ex»).
- **Attivazione:** post-partita (fatti veri dal tabellino/roster) + settimane di crociera via Regista.
- **Variabili:** roster reale (7.8.16, stabile tra stagioni: perfetto), matchHistory, squadRole.
- **Conseguenze:** morale/chimica mirate; in partita micro-bonus SOLO col partner in campo; a mercato, un amico può «chiamarti» nel suo nuovo club (aggancio a transferSaga).
- **Collegamenti:** rivale-in-casa (già esiste = caso speciale), memoria del mondo, saga mercato.
- **Engagement:** i nomi ricorrenti per 7 anni (la rosa è già stabile!) diventano la TUA squadra.
- **Rischi:** bonus in partita da tenere ±2% max; niente tamagotchi (max 1 interazione/settimana).
- **Priorità: ALTA** · **Complessità: 4/5**

### S4 · Il Filo col Mister (patti bidirezionali)
- **Obiettivo:** il rapporto con l'allenatore come NEGOZIATO continuo, non barra di fiducia.
- **Descrizione:** colloqui derivati dai fatti con **patti espliciti a scadenza**: «Ti do 5 partite da titolare: voglio 3 gol» / al contrario TU chiedi («giocami nel derby», «spostami punta centrale»). Il patto entra nel registro (S2) con giudice e deadline; l'esito è AUTOMATICO e citato («Avevi promesso 3 gol: ne hai fatti 5. Da oggi il rigorista sei tu»). I rimproveri citano fatti (voto <6 tre volte di fila), mai a caso.
- **Come funziona:** 2-3 patti a stagione max, proposti dal Regista nei momenti giusti (dopo una panchina, dopo una tripletta, al cambio allenatore). Ricompense concrete: rigorista, fascia in pectore, minuti garantiti, libertà tattica (+1 azione speciale nei match).
- **Attivazione:** trigger da squadRole/forma/eventi; MAI casuale.
- **Variabili:** coachTrust (resta il fondale), coach.style (già esiste → tono dei patti), registro.
- **Conseguenze future:** il cambio allenatore (S8) AZZERA i patti → drama vero.
- **Engagement:** obiettivi personali a breve termine dentro la stagione = motivo per «un'altra settimana».
- **Rischi:** patti impossibili = frustrazione → target sempre derivati dalla tua media reale ±20%.
- **Priorità: ALTA** · **Complessità: 3/5**

### S5 · Il Procuratore con una Faccia
- **Obiettivo:** da menu di servizi a personaggio con agenda.
- **Descrizione:** due filosofie d'agenzia tra cui scegliere presto in carriera: **boutique** (pochi assistiti, ti chiama spesso, chiede pazienza, trova il progetto giusto) vs **global** (porta sponsor e big club, ma sei uno dei tanti: può PROPORTI cessioni che servono a lui). Il procuratore promette (registro S2) e può sbagliare; una volta in carriera può arrivare il «tradimento» (ti usa per alzare un altro assistito) → bivio: cambiare agenzia (costo reale, ponte con sponsor persi) o perdonare.
- **Collegamenti:** transferSaga (il procuratore ne diventa la VOCE), sponsor (S10), rinnovi.
- **Engagement:** il mercato smette di essere meteo e diventa una relazione con una persona.
- **Rischi:** tradimento max 1 volta/carriera, mai prima della S5 (fase «non mi era mai successo»).
- **Priorità: MEDIA** · **Complessità: 3/5**

---

## 3. IL CLUB COME ORGANISMO

### S6 · Il Progetto Club (stato societario vivo)
- **Obiettivo:** il club ha una direzione, e tu sei dentro (o fuori) dal progetto.
- **Descrizione:** ogni club ha uno **stato di progetto** derivato da `clubEvo`/risultati: *ciclo vincente · ricostruzione · linea verde · crisi economica · anno zero (nuovo presidente/investitori)*. Lo stato colora TUTTO: obiettivi del presidente, budget mercato, tolleranza del mister, tono dei media. Il passaggio di stato è un EVENTO di settimana (l'annuncio del nuovo presidente, l'assemblea della crisi) con conseguenze meccaniche: crisi = stipendi a rischio taglio, big in partenza, tu come pezzo pregiato da vendere (aggancio saga mercato «offerta che il club VUOLE accettare»).
- **Come funziona:** macchina a stati per il club del giocatore, transizioni da fatti pluriennali (già c'è la base 7.6.0: fanbase, budget, prestigio con momentum).
- **Conseguenze future:** restare nella crisi e riportare il club su = arco «bandiera» potenziato; andarsene = la curva ricorda (S2).
- **Priorità: ALTA** · **Complessità: 4/5**

### S7 · L'Esonero (e il nuovo mister che non ti conosce)
- **Obiettivo:** l'evento più realistico che oggi manca: il cambio allenatore A STAGIONE IN CORSO.
- **Descrizione:** derivato dalla classifica REALE (5 sconfitte nelle ultime 7 + zona pericolo → esonero probabile, mai casuale). Settimana dell'esonero: spogliatoio scosso (chimica -), il tuo status AZZERATO — il nuovo mister ti mette «sotto esame» per 4 partite (mini-arco con verdetto: riconquista del posto o panchina). I patti (S4) col vecchio mister decadono, e il registro lo ricorda («col nuovo mister riparti da zero»).
- **Attivazione:** solo con condizioni di classifica vere; 0-2 volte a stagione nel mondo, raro per il TUO club.
- **Collegamenti:** S4, S6, squadRole, adaptiveDifficulty (il periodo d'esame è più duro).
- **Engagement:** la sicurezza del posto non è mai per sempre → tensione sana.
- **Rischi:** doppio esonero nello stesso anno = farsesco → cap 1/stagione per il club del giocatore.
- **Priorità: ALTA** · **Complessità: 3/5**

### S8 · Panchina come Gameplay (non come punizione)
- **Obiettivo:** le fasi da riserva (oggi quasi solo subite) diventano un gioco di riconquista.
- **Descrizione:** quando `squadRole` = riserva/rotazione, la settimana cambia natura: alleni «per farti vedere» (eventi di allenamento con l'occhio del mister, S12), entri a partita in corso con OBIETTIVI da subentrato («15 minuti: cambia la partita»), il mister ti dice cosa gli manca (registro). Catena: crisi → critiche → panchina → colloquio → prestito proposto dal procuratore → O riconquisti il posto O riparti altrove. Questa catena esiste già a pezzi — va cucita in un ARCO con stati espliciti.
- **Priorità: MEDIA** · **Complessità: 3/5**

---

## 4. IL MONDO ESTERNO

### S9 · L'Indice di Aspettativa (media che pretendono)
- **Obiettivo:** dare un numero VIVO al rapporto col mondo: non «quanto sei famoso» ma «quanto si aspettano da te».
- **Descrizione:** un'aspettativa stagionale derivata (pledge + prezzo del cartellino + stagione precedente + fama) contro cui corre il tuo rendimento reale. Il GAP genera gli eventi: sopra le attese = copertine, sponsor, «l'allenatore pretende di più», le difese ti RADDOPPIANO (aggancio: `cpmadapt` e adaptiveDifficulty esistono già — qui diventano NARRATI: «ora ti marcano in due, lo vedi in campo»); sotto le attese = il processo del lunedì, la firma critica ti punge (journalists già esistono: dategli RUOLI — l'amico, lo squalo, il saggio).
- **Come funziona:** 3 firme ricorrenti con memoria (S2); pagella settimanale sintetica nel recap; l'aspettativa si RIVEDE a gennaio (mercato) e con gli infortuni (onesta).
- **Engagement:** chiude il ciclo esempio del brief: segno molto → attenzione → aspettative → difese migliori → segnare è più duro. Tutto già mezzo-implementato, mai DETTO al giocatore.
- **Priorità: ALTA** · **Complessità: 3/5**

### S10 · Sponsor & Immagine (il secondo stipendio)
- **Obiettivo:** nuovo dominio realistico con decisioni vere, non rendita passiva.
- **Descrizione:** il **valore d'immagine** deriva da pop+rendimento+condotta. Gli sponsor arrivano a fasce di fama: locale (concessionaria, W1-…) → tecnico (scarpe: ESCLUSIVA, scegli una famiglia e la cambi a costo di penale) → nazionale (spot TV) → globale (testimonial). Ogni contratto ha RICHIESTE con trade-off nella settimana: lo shooting cade nella settimana del big match (bivio: vai → cash+immagine, fatica+1 / rimandi → sponsor si raffredda). Clausole di condotta: polemica coi media = bonus a rischio. La beneficenza è il ramo nobile: costa, non rende cash, ma la curva e la città ricordano (S2, arco bandiera).
- **Variabili:** bankBalance (esiste), popularity, registro.
- **Conseguenze future:** a fine carriera l'immagine costruita determina il POST (documentario, Hall of Fame, ruolo da ambassador).
- **Rischi:** che diventi un menu di soldi → max 1 sponsor attivo per fascia, eventi rari e situati.
- **Priorità: ALTA** · **Complessità: 4/5**

### S11 · La Curva ha un Volto (rapporto coi tifosi)
- **Obiettivo:** dai «coriandoli quando vinci» a una RELAZIONE con la tua gente.
- **Descrizione:** un legame per-club (già embrione in fanLegend): cresce con militanza, gol pesanti, gesti (rispetto all'ex, beneficenza, rinnovo in crisi); crolla con promesse tradite e addii sbagliati. Soglie con manifestazioni FISICHE nel 3D già esistente: il coro col tuo nome (banner testo al walkout), lo striscione dedicato (asset tifo già presente), la standing ovation al cambio. Il lato oscuro: contestazione mirata («7 senza gol: la Sud non canta più per te») che aumenta la pressione (S13) nelle partite in casa — il pubblico come meccanica ambivalente (l'atmosfera→prestazione esiste già dalla 7.7.0: qui diventa PERSONALE).
- **Priorità: MEDIA** · **Complessità: 3/5**

---

## 5. LA NAZIONALE COME CARRIERA PARALLELA

### S12 · La Maglia Numero 9 (la politica del CT)
- **Obiettivo:** la Nazionale smette di essere una lotteria di convocazioni: è una GERARCHIA viva nel tuo ruolo.
- **Descrizione:** il CT ha una **lista del ruolo** visibile: i 3-4 attaccanti nel giro (NPC persistenti con stagioni vere simulate a grana grossa). Ogni finestra: pre-convocazione (sei nei 40), osservatore in tribuna alla tua partita («il CT ti guarda sabato» — la partita cambia peso!), poi la chiamata O la telefonata di esclusione con il PERCHÉ («il mio 9 gioca ogni settimana, tu no»: aggancio a squadRole — realismo puro). Rifiutare una chiamata entra nel registro federale (S2). Il cambio CT rimescola la lista (il nuovo può amarti o ignorarti). L'Under è il ponte per i giovani; il capitano azzurro il tetto per i veterani.
- **Variabili:** natHistory (esiste), nationalCaps, la lista-ruolo nuova (3 NPC), worldMemory.
- **Conseguenze:** il duello col rivale azzurro è il fratello del rivale di club (già esistente!) — stessa meccanica, palcoscenico più alto.
- **Engagement:** un secondo asse di progressione con le sue notti («la partita davanti al CT»).
- **Priorità: ALTA** · **Complessità: 4/5**

---

## 6. L'INTERIORITÀ

### S13 · Il Meteo Interiore (psicologia derivata, mai barra da micromanage)
- **Obiettivo:** far VIVERE pressione, paura, flow — senza aggiungere una risorsa da gestire.
- **Descrizione:** uno stato interiore DERIVATO (mai editabile): *sereno · in fiducia · in flow · sotto pressione · in apnea · spaventato (post-infortunio)*. Nasce da fatti: 3 gol in 2 partite → flow; rigore sbagliato al 90' → il fantasma del dischetto (il prossimo rigore ha un momento dedicato); rientro da infortunio grave → paura del contrasto per 2-3 partite (già esiste il malus rientro: qui viene RACCONTATO e superato con un'azione in partita, non col tempo). Lo stato modula i testi di TUTTI i sistemi e (leggero, ±2-3%) il roll — che è già così: forma/morale nel roll esistono, qui prendono NOME e volto.
- **Come funziona:** badge discreto sul lunedì («Come ti svegli: in fiducia») + il Regista pesca eventi coerenti; lo psicologo dello staff (nuovo membro, fascia club alta) sblocca gestione attiva rara.
- **Rischi:** spirali negative infinite → ogni stato negativo ha SEMPRE un'uscita in campo dichiarata («un gol e te lo togli di dosso»).
- **Priorità: ALTA** · **Complessità: 2/5**

### S14 · Vita Privata con Radici (lenta, rara, vera)
- **Obiettivo:** l'uomo dietro il 9 — poche storie, lunghe, che ancorano la carriera.
- **Descrizione:** archi pluriennali a bassa frequenza (2-4 tocchi/stagione): l'incontro → il fidanzamento → il MATRIMONIO d'estate (evento W1 col mondo che reagisce: compagni invitati = spogliatoio S3) → i figli (notte insonne = -recupero per 2 settimane, poi motivazione stabile: «giochi per qualcuno») → la casa (vicino al centro sportivo = +recupero / in centro = +immagine) → il fratello/amico d'infanzia che ti segue in trasferta → la scelta delle vacanze (Dubai mediatica vs casa dei nonni: immagine vs serenità). Il trasferimento all'estero pesa DIVERSO con famiglia (realismo dei trasferimenti!). Tutto opzionale nel tono, mai soap: 1 arco attivo alla volta, scelto dal Regista nelle settimane di crociera.
- **Conseguenze future:** a fine carriera la lettera d'addio (esiste!) cita la famiglia vera costruita — payoff massimo.
- **Priorità: MEDIA** · **Complessità: 3/5**

---

## 7. L'ALLENAMENTO E LO STAFF

### S15 · La Settimana-Tipo (allenamento come eventi, non menu)
- **Obiettivo:** varietà senza reintrodurre la scelta del focus (rimossa per direttiva PO: resta così).
- **Descrizione:** l'allenamento resta automatico; a diventare eventi sono le ECCEZIONI derivate: il mister ti ferma dopo la seduta («resta per i piazzati» → mini-arco di 3 settimane con verifica in partita: la punizione la batti TU); il preparatore propone il richiamo atletico in pausa nazionali (fatica ora, brillantezza poi); il fisioterapista ti FERMA una seduta (previeni: salti l'allenamento o rischi); il video-analista ti mostra il tuo tallone (dato VERO: es. conversione bassa di testa → esercizio dedicato → bonus micro e misurabile). Ogni evento è raro (1 ogni 2-3 settimane max), sempre motivato da un dato reale.
- **Collegamenti:** perkTrainer/perkNutrition (esistono), infortuni, S13.
- **Priorità: MEDIA** · **Complessità: 2/5**

### S16 · Lo Staff con Nomi (medico, psicologo, DS)
- **Obiettivo:** completare la galleria di persone: il DS che ti ha voluto (e se ne va), il medico che ti rimette in piedi, lo psicologo dei club ricchi.
- **Descrizione:** 3 figure per club con un tratto ciascuna (il DS «padre calcistico» ti difende in società: se cambia club, un giorno TI CHIAMA dal suo nuovo club — aggancio saga mercato). Il medico rende gli infortuni una storia con un volto (il consulto, il dilemma del rientro anticipato — meccanica già esistente, ora con una persona che te lo sconsiglia e il registro che ricorda se non l'hai ascoltato).
- **Priorità: BASSA** · **Complessità: 2/5**

---

## 8. GLI IRRIPETIBILI

### S17 · Catalogo «Non mi era mai successo» (once-in-a-career)
- **Obiettivo:** 12-15 eventi che possono accadere UNA volta in tutta la carriera, con condizioni strette, mai casuali.
- **Esempi (ognuno con condizione derivata):**
  1. **La partita nella neve sospesa** (meteo neve già esiste + big match) → si rigioca a porte chiuse.
  2. **Il rigore regalato** — il compagno a 2 gol dalla tripletta: il rigorista sei tu, glielo lasci? (S3 in un istante).
  3. **La fascia al 89'** — capitano infortunato e vice espulso: la fascia arriva a TE per 5 minuti (anni prima di meritarla stabilmente).
  4. **Il provino del figlio del capitano** — da veterano, in Primavera arriva il figlio del tuo primo capitano (usa la memoria della rosa!).
  5. **Il gol da centrocampo** (dal motore: pallonetto+distanza reale) → notte virale, sponsor.
  6. **La papera che ti regala il titolo** — vinci lo scudetto senza giocare, per un harakiri altrui: festeggiare o rispettare? (bivio d'immagine).
  7. **L'autobiografia** — dopo il 2° Trofeo d'Oro: il ghostwriter, il capitolo scomodo sul vecchio mister (registro!), le vendite.
  8. **Il documentario** (fama massima): una stagione con le telecamere addosso = pressione S13 su, immagine su.
  9. **La maglia scambiata col tuo idolo d'infanzia** — l'ultima partita del veterano NPC più titolato del mondo.
  10. **Il minuto di silenzio** — scompare una leggenda del TUO club: la curva guarda te, il gol quel giorno vale doppio nel ricordo.
  11. **L'esordio del tuo erede** — a fine carriera il club presenta «il nuovo te»: mentore o minacciato? (bivio da veterano).
  12. **Il ritorno del CT che non ti convocava** — ora sei capocannoniere: la telefonata che aspettavi da 3 anni.
- **Regola ferrea:** ogni evento scrive nel diario/Film della stagione e nel registro; mai due irripetibili nella stessa stagione.
- **Priorità: MEDIA** · **Complessità: 2/5 ciascuno** (la forza è nelle condizioni, non nella tecnica)

---

## 9. PROGRESSIONE PER FASE (la stessa settimana, un altro mondo)

| Fase | La settimana profuma di… | Sistemi dominanti |
|---|---|---|
| **Primavera** | zaino, provini, il primo procuratore che ti nota, i genitori in tribuna | S15, S14 (famiglia d'origine), S12 (Under) |
| **Esordio** | la prima maglia (c'è!), il gruppo che ti misura, gli errori che pesano | S3 (integrazione), S13 |
| **Panchinaro** | riconquista, occhi del mister, minuti da subentrato | S8, S4, S15 |
| **Titolare/Promessa** | patti col mister, prima saga di mercato, primi sponsor locali | S4, S10, S9 |
| **Leader** | fascia, spogliatoio da gestire, la lista del CT | S3 (da riceverne a darne), S12 |
| **Top player** | aspettative-mostro, raddoppi di marcatura, il mondo che guarda | S9, S10 (globale), S17 |
| **Pallone d'Oro** | gala (c'è!), documentari, ogni parola è un titolo | S17, S10, S13 |
| **Veterano** | il corpo che parla, i giovani da crescere, l'ultima Nazionale | S13 (paura/gestione), S16, S17 (#11) |
| **Fine carriera** | la lettera (c'è!), la maglia ritirata (c'è!), cosa resta | payoff di TUTTI i registri |

Il Regista (S1) pesa i canali per fase: è QUESTO che fa sentire la crescita, più di ogni singola feature.

---

## 10. ROADMAP CONSIGLIATA (onde di sviluppo)

| Onda | Contenuto | Perché prima |
|---|---|---|
| **1 — Spina dorsale** | S1 Regista · S2 Memoria 2.0 · S13 Meteo interiore | Costano poco, moltiplicano tutto il resto; S13 è quasi solo derivazione+testo |
| **2 — Le persone** | S4 Patti col mister · S3 Spogliatoio vivo · S9 Aspettative/firme | Il cuore emotivo; usa roster stabile e journalists già esistenti |
| **3 — Il mondo** | S7 Esonero · S6 Progetto club · S12 Nazionale politica | Drama sistemico; richiede l'onda 1 per non essere rumore |
| **4 — L'orizzonte** | S10 Sponsor · S14 Vita privata · S5 Procuratore | Nuovi domini; maturano su registri già caldi |
| **5 — Le leggende** | S17 Irripetibili · S8 Panchina-arco · S11 Curva · S15/S16 staff | Rifinitura infinita, contenuto a rubinetto |

**Regole di produzione (vincolanti, dalle lezioni di questo repo):**
1. Ogni feature su TUTTI i path settimanali (mai mono-path — classe STAB).
2. Tutto derivato da fatti reali e seedato — «nulla è casuale».
3. Campi save lazy, niente bump se possibile; probe dedicata per ogni feature (il gate è cieco sulla carriera).
4. Budget d'attenzione del Regista = sacro: meglio una settimana muta che tre pop-up.
5. Ogni sistema scrive nel diario → il Film della stagione e la lettera d'addio sono il payoff naturale di tutto.

---

*Fine charter v1.0 — pronto per essere trasformato in sprint (una feature = uno sprint, pattern «favola» già rodato).*
