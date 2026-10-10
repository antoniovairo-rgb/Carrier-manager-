# Registro delle decisioni

Ogni scelta di progetto importante: data, decisione, motivo, alternative scartate, voce collegata.
Le decisioni del PO non si richiedono e non si contraddicono: per cambiarle serve una nuova decisione del PO.

| Data | Decisione | Chi | Motivo / note | Alternative scartate |
|---|---|---|---|---|
| 29/07/2026 | Le verifiche percettive (foto di gesti, pose, scene) si fanno **con i corpi GLB accesi** | PO | 26 bocciature nate da verifiche con GLB spento | verifiche GLB-off |
| 16/09/2026 | Il motore della partita segue `docs/REAL-MATCH-ENGINE.md` (20 punti del PO) | PO | simulazione vera, highlight che rappresenta ciò che il motore ha deciso | highlight scriptati |
| 16/09/2026 | Ogni release scrive la sua riga di roadmap | PO | nessuna release non dichiarata | — |
| 22/09/2026 | La catena di test si sceglie in base a cosa si è toccato (solo grafica → catena grafica) | PO | il gate completo non trova niente sulle modifiche di soli pixel | gate completo sempre |
| 09/2026 (7.901) | Nella scelta dell'azione **niente percentuali di riuscita**: rischio cieco | PO | le percentuali condizionavano il giocatore | pallini/percentuali colorate |
| — | **Difficoltà unica**: nessun selettore, né ora né in futuro | PO | ribadita nel prompt «carriera fuori dal campo» del 30/09 | selettore facile/normale/difficile |
| — | Restano **partita 2D + highlight 3D** | PO | vincolo fermo nei prompt del 30/09 | partita tutta 3D |
| — | **Niente stile FIFA** | PO | citata nel prompt «governo del progetto» del 30/09 | — |
| — | Non si usano le credenziali Adobe del PO | PO | — | — |
| 30/09/2026 | **Brain unico**: la probabilità della giocata dell'eroe la calcola solo il motore (`probEroe`) | PO (questionario) | «deve essere l'unico cervello / motore del gioco» — fatto in 7.999.82 | succRate + moltiplicatore q |
| 30/09/2026 | Goleade: **realismo da serie A** (eroe forte 0,6–0,9 gol a partita; scarto ≥4 in al massimo 5–6% delle partite; 5+ gol sotto il 3%) | PO (questionario) | — | tetto rigido ai gol |
| 30/09/2026 | Dopo il brain, **prima la grafica degli highlight (#94)** | PO (questionario) | fatto in 7.999.83 | — |
| 30/09/2026 | Cerimonie di squadra **diverse per competizione** (campionato, coppa, internazionale) | PO (questionario) | lavoro sul ramo `wip/cerimonie-differenziate`, sospeso: nel nuovo ordine le cerimonie sono al lotto 8 | stessa cerimonia per tutte |
| 30/09/2026 | Prossimo collaudo Codex: **difesa 3D su 7.999.82** | PO (questionario) | prompt `reports/codex/PROMPT-2026-09-30-collaudo-difesa-3d.md` | banco numeri goleade; entrambi |
| 30/09/2026 | **Codex solo collaudatore**, con direttive scritte dal team; scrive solo in `reports/codex/` e `tests/codex/`, pusha solo su rami `codex/…` | PO | — | Codex che modifica il gioco |
| 30/09/2026 | Dubbi del PO sempre con **questionario a scelta guidata** | PO | prompt governo, A10 | domande in prosa |
| 30/09/2026 | Governo del progetto: backlog unico, roadmap a lotti, un lotto alla volta, definizioni di pronto/fatto | PO | prompt governo, Parte A | — |
| 30/09/2026 | I file di governo stanno in `docs/governo/` (il `ROADMAP.md` alla radice è la roadmap tecnica LMQP e resta) | team | evitare di sovrascrivere un documento esistente | nuovo `ROADMAP.md` alla radice |
| 30/09/2026 | Salvataggi ed errori (Parti B e C, L3) **dopo L1**, come nell'ordine del PO | PO (questionario, PO-160) | — | prima di L1; in parallelo |
| 30/09/2026 | L1 si chiude solo con **tutte le 31 voci** aperte o parziali | PO (questionario, PO-160) | — | chiusura al rapporto Codex difesa 3D; solo note di taccuino |
| 30/09/2026 | Pulizia del progetto come **quota del 20% in ogni lotto**, non lotto dedicato | PO (questionario, PO-072) | — | lotto dedicato al 4° posto; entrambi |
| 30/09/2026 | Cerimonie diverse per competizione **sospese fino a L8** | PO (questionario, PO-150) | lavoro su `wip/cerimonie-differenziate` | chiuderle ora; dentro L3 |
| 01/10/2026 | Cadenza: **fino a 6 release al giorno** (non 2) | PO | «Le release giornaliere devono essere 6 e non 2!» | 2 al giorno (proposta del team) |
| 01/10/2026 | **Un solo file di roadmap**: `docs/governo/ROADMAP.md` (lotti in alto, registro delle release in fondo); archiviati `POC_ROADMAP.md`, `ROADMAP.md` alla radice, `MACRO-PIANO-2026-09.md`, `BACKLOG.md` alla radice | PO (questionario, PO-160) | «troppi file roadmap… faccio confusione» | due file con ruoli; solo archiviare i morti |
| 01/10/2026 | Cadenza: **nessun tetto al numero di release al giorno**; conta non perdere pezzi (ogni voce nel backlog, ogni release nel registro) | PO | «Di release tendenzialmente puoi farne quante ne vuoi, l'importante è non perderti pezzi» — sostituisce il tetto di 6 | tetto 6 al giorno |
| 01/10/2026 | PO-087: **approvate tutte le nuove etichette** delle scene che promettono un gesto non disegnabile (elastico, tunnel, hocus pocus, rabona, tacco, stop di petto); «Roulette sul difensore» resta (ruleta vera dalla 7.999.39) | PO (questionario) | testo coerente con ciò che il 3D sa disegnare | eccezione per il tacco; aspettare le clip |
| 01/10/2026 | PO-154: **Codex completa ora la fase 1** (diagnosi carriere fino a 30 carriere da 10 stagioni, con metriche sugli impulsi); il team resta su L1 | PO (questionario) | la fase 1 è prerequisito della proposta impulsi | dopo L1 e L3; proposta subito sulle 14 carriere |
| 01/10/2026 | PO-016 «schermata fuori standard» (nota su foto del 24/09, schermata non identificata): **chiusa come superata** dalle uniformazioni grafiche successive | PO (questionario) | — | rimandare la foto; censimento delle schermate |
| 01/10/2026 | PO-118 plugin: **chiusa** — Kobiton scartato (a pagamento), Design non serve ora | PO (questionario) | — | Design installato dal PO; lasciare aperta |
| 01/10/2026 | **Questionario di revisione del backlog** (9 giri, 36 voci): chiuse PO-158, 160, 161, 162 (senza tag git), 164, 166, 032, 026 (stretta di mano non serve), 112, 125; da completare PO-159, 163 (`npm run ci` + indicatori), 165 (stato settimanale), 022, 024, 051 (nomi piccoli in scena), 171; da collaudare con Codex PO-021/035 (goleade), 033, 048, 050, 094, 100, 104, 120, 127, 133, 143, 172, 176; PO-030 resta in L1 dopo i difetti; PO-086 anticipata in L1; quota pulizia 20% (PO-072, PO-173) da usare ora in L1; PO-023 in L4; PO-169: figurine già esistenti per le giornaliste; L3, L6, L8 confermati nell'ordine | PO (questionario) | dettaglio voce per voce in BACKLOG.md | — |
| 01/10/2026 | PO-170 ritratti: generati dal PO con API OpenAI a pagamento; i termini d'uso in vigore alla data di generazione vanno verificati prima dello store | PO | non verificabile dalla sessione | — |
| 01/10/2026 | PO-179: goleade con l'eroe nella squadra debole portate sotto le **stesse soglie** del caso eroe forte (scarto 5+ < 9%, 7+ < 2,5%), guardiano su entrambi i lati | PO (questionario) | collaudo Codex 7.999.96 riprodotto: 15,5% di scarti 5+ fuori casa | soglie più severe; lasciare così |
| 01/10/2026 | Angolo: battitore e pallone sulla bandierina, **correzione subito** | PO (questionario) | triage PO-178: pallone a 7–9u dalla bandierina in scelta | dopo i collaudi |
| 01/10/2026 | Rilievo 26-D: **il rigore dell'eroe apre sempre la scena** anche oltre 8; punizioni e cross extra entrano solo sotto 8 scene; tetto assoluto 9 | PO (questionario) | Codex: 10 highlight in 1 partita su 30 | tetto 8 rigido; nessun tetto sui piazzati |
| 01/10/2026 | PO-170 (licenze dei ritratti OpenAI) e PO-144 (camera codice 007) **chiuse** | PO | richiesta diretta del PO | — |
| 02/10/2026 | PO-185 (rilievo Codex 002): negli highlight **difensivi la camera tiene eroe + pallone** — lo sguardo ruota verso il pallone senza mai perdere l'eroe | PO (questionario) | bersaglio camera con pallone fuori quadro: gi33 25/25, gi36 19/20, gi133 11/11 fotogrammi | solo sul gol subito; lasciare così (eroe unico protagonista, 7.482) |
| 02/10/2026 | PO-186: la KCC S.12 ferma agli ottavi **si lascia chiudere al cambio stagione**, nessun intervento sul salvataggio | PO (questionario) | gara W.23 saltata nel salto 21→28 (causa chiusa in 7.999.103) | chiudere come eliminati; simulare i turni |
| 02/10/2026 | PO-185: **prima un banco a scena fissa** (seme), poi il cambio di lato della camera vicino alla nostra porta, da collaudare sul telefono | PO (questionario) | due rimedi misurati dentro il rumore (scena diversa a ogni giro) | subito il cambio di lato; pausa |
| 02/10/2026 | Giornate recuperate (7.999.103): **simulate senza l'eroe** (risultato in classifica, nessuna statistica all'eroe) | PO (questionario) | l'eroe era in Nazionale | contare l'eroe in campo |
| 02/10/2026 | PO-187: le ~10 azioni con etichetta solo da dribbling **dichiarano il gesto finale** (solo testo, es. «Dribbling netto e assist») | PO (questionario) | Codex gi18; censimento 7.999.107: 56 azioni da dribbling, ~10 incoerenti | scena 3D composta dribbling + gesto finale; entrambe |
| 03/10/2026 | PO-190: **prima una misura ampia** del debito dei gol attesi nelle partite vissute (30 partite per braccio: pieno, 50%, 25%, avversari diversi), poi la proposta di taratura | PO (questionario) | 6 partite per braccio: pieno 1,00 GF (motore 0,17), 50% 1,33, spento 2,33 con un 6-0 | rilasciare subito il 50% · lasciare com'è |
| 03/10/2026 | PO-190: **ridurre i gol dell'eroe** (conversione delle scene highlight e piazzati) verso una quota di circa il 50% dei gol di squadra; misura prima/dopo su 25 partite, interruttore rosso e guardiano | PO (questionario) | misura ampia S12 (25 partite vissute per braccio): 2,72 GF, 0,32 GS, 1 partita 6+, quota eroe 78%; il debito del motore non sposta la media (3,04 con 50% e 25%, entro ±0,3) | lasciare così; misurare ancora |
| 03/10/2026 | PO-190 seconda parte: dopo la correzione dei rigori (7.999.121) **alleggerire il debito** del motore, così i compagni tornano a segnare; misura a 25 partite prima/dopo, rosso e guardiano | PO (questionario) | 7.999.121 dal salvataggio S12: squadra 1,38 gol a partita, eroe 1,19, motore 0,19 (quota eroe 86%) | debito più meno gol dell'eroe; fermarsi qui |
| 03/10/2026 | Galà: la busta si apre **dal terzo al primo posto**, il vincitore non compare subito (supera la scelta 7.999.51 «diretto al premio vinto») · Presentazione: **corpi CGTrader** in campo e figurina **piccola come in televisione** | PO (richiesta diretta) | PO-199, PO-200 | — |
| 03/10/2026 | Galà, busta: si svela **un tocco per posizione** (niente scorrimento automatico) e si apre **per tutti i premi** della serata, anche quelli vinti da altri | PO (questionario) | PO-199, 7.999.124 aveva busta automatica a 1,6 s e solo per i premi vinti | automatica 1,6 s; automatica più lenta; busta solo se sul podio; solo i premi vinti |
| 03/10/2026 | Mappa (PO-205): un nodo senza Resa misurata non supera il **75%** | PO (questionario) | 62 nodi su 78 mai guardati sullo schermo | escluso dal calcolo; conta 50 |
| 03/10/2026 | Mappa: si mostrano **entrambe** le medie del gioco, semplice e pesata per tempo di gioco (Partita ×3; Home, Stagione, Sistemi ×2) | PO (questionario) | prima stesura a media semplice | solo pesata; solo semplice |
| 03/10/2026 | Mappa: per il tetto del 70% conta come guardiano **solo** quello che gira in una catena di collaudo | PO (questionario) | — | qualunque con rosso; anche sonde |
| 03/10/2026 | Vista «Allenamento» (codice senza ingresso): **eliminarla**, la crescita resta automatica | PO (questionario) | `src/18-career-app.jsx:9508`, nessun bottone la apre | ripristinarla; lasciarla |
| 03/10/2026 | PO-202: la partita 0-5 è stata giocata su **7.999.122 o successiva** → difetto aperto, da misurare sulla versione attuale | PO (questionario) | — | versione più vecchia |
| 03/10/2026 | PO-190 terza parte: **scene dell'eroe un po' meno decisive** (probabilità di gol per scena −25% circa), misura prima/dopo su 25 partite, rosso e guardiano | PO (questionario) | 7.999.122: quota eroe 67% contro obiettivo 50% | prima il collaudo PO; va bene così |
| 03/10/2026 | Priorità: **prima la release 7.999.126** (catena a macchina libera, fermando il collaudo dell'agente su gi133), poi gi133 | PO (questionario) | catena 15/19 falsata dal carico | prima gi133 |
| 03/10/2026 | Codex alla ripresa: **collaudi 3D sulla 7.999.12x** (difesa, colpi di testa, passaggi); il banco sulla 7.999.105 si archivia | PO (questionario) | memoria 3,44 GB | 30 partite PO-190; ricarica PO-176 |
| 04/10/2026 | PO-202 partite poco tirate (S12: 20 vittorie e 1 pari su 21, subiti 0,29 a partita): **entrambe le leve, a metà** — avversari un po' più pericolosi e squadra dell'eroe un po' meno spinta; misura prima/dopo sulle stesse partite | PO (questionario) | sonda `gol190f` su `save-190-s12-ovr93.json`, 7.999.127 | solo avversari; solo squadra dell'eroe; lasciare così |
| 04/10/2026 | PO-206 «corrono sul posto in fila»: il momento è **schierati a centrocampo** (non nel tunnel né durante l'entrata) | PO (questionario) | sonda `walk206`: sul walkout intero (49 s reali) peso della corsa ≈ 0 sui corpi fermi | — |
| 04/10/2026 | PO-202: **alzare il tetto della forza nel motore da 95 a 99** (i club 95-99 oggi sono identici in campo) | PO (questionario) | `src/14-motore-possesso.jsx:76`, banco del motore | lasciare 95 |
| 04/10/2026 | PO-202 resta parziale: **indagine a fondo, poi correzione** della causa per cui nella partita vissuta gli avversari tirano ~45% meno che nella simulata | PO (questionario) | sonde `gol202`/`gol202p`, 7.999.129 | fermarsi; alzare le leve |
| 04/10/2026 | PO-202: le scene dell'eroe tolgono agli avversari ~40% dei tiri (attribuzione con registrazione e riproduzione): **compensare gli avversari** nella partita vissuta, fino ai tiri della partita equivalente senza scene; scene dell'eroe invariate | PO (questionario) | `docs/governo/misure/2026-10-04-po202-attribuzione.md` | scene che costano meno; entrambe a metà |
| 04/10/2026 | PO-208 figurine: **lo standard è la cornice sottile grigia** (come il riquadro dell'eroe nella home), su tutte le figurine; la carta Korward a colori club esce dallo standard | PO (questionario) | foto PO 22:44, procuratore nel Confronto | carta Korward a colori club ovunque |

## 05/10 — PO-202: «il brain deve decidere tutto durante la partita»
- **Parole del PO:** «PO-202 lo stai risolvendo definitivamente? brain deve decidere tutto durante la partita».
- **Stato dichiarato al PO:** PO-202 è PARZIALE, non risolto in modo definitivo. Nella 7.999.132 l'equilibrio è stato ottenuto anche con correzioni lato partita vissuta (moltiplicatori di finalizzazione `fin202`, ripresa all'avversario `rip202`, recupero dei tick `debito202`, recupero a 93'), che non sono decisioni del motore.
- **Direzione:** la partita vissuta deve diventare il motore che gioca da solo, con l'eroe che entra nelle scene senza fermarlo né togliere tiri agli avversari; le correzioni lato partita vissuta si ritirano quando il motore da solo dà lo stesso equilibrio della simulata. Piano e misure in ROADMAP.

## 05/10 — PO-202: il peso dell'eroe con il brain che decide tutto (questionario)
- **Domanda:** con il brain che decide tutto, la scena dell'eroe la esegue il motore con la sua fisica. Misura (`docs/governo/misure/2026-10-05-po202-brain-da-solo.md`): oggi 0,88 gol dell'eroe e 58% di vittorie; brain puro 0,36 gol e 45%. Quanto deve pesare l'eroe?
- **Risposta PO:** «Talento nel brain» — un solo parametro dentro il motore, uguale in vissuta e simulata, che alza la finalizzazione dell'eroe, tarato su 0,6-0,9 gol a partita (obiettivo PO del 30/09). Le quattro correzioni del 7.999.129-132 si ritirano.

## 05/10 — PO-202, passo successivo alla 7.999.137 (questionario)
- **Domanda:** gli avversari tirano 6,5 volte contro le 9,9 del brain da solo; cause misurate: scene «di origine» (cross/angolo/punizione verso l'eroe) e motore fermo durante la scena. Come procedo?
- **Risposta PO:** «Correggi entrambe» — le scene di origine restano ma l'azione la gioca solo la scena; il motore non perde il tempo della scena.

## 05/10 — PO-210 e PO-203 (questionario)
- **PO-210** «schermata post partita più standard»: **come le schede carriera** (card chiare, titoli di sezione e fisarmoniche della carriera; tabellino della gara in fisarmonica).
- **PO-203** «eroe che affonda nell'erba»: visto nella **festa di fine partita normale** e nella **premiazione / Nazionale**. Il team non lo ha riprodotto (festa del provino, premiazione dopo partita S12): si cercano le varianti (stadio, clip).

## 05/10 — PO-064 (questionario)
- **Domanda PO:** «Ma il PO-064 non è una ripetizione?» — sì, si sovrappone a PO-022; la parte esito/probabilità è chiusa da PO-149 e PO-202.
- **Risposta PO:** «Unisci a PO-022» — PO-064 è DOPPIONE di PO-022; resta una sola voce aperta: la scena 3D dell'eroe la genera il brain, non la scheda scritta (oggi `selectContextualSituations` su SITUATIONS).

## 05/10 — Ottimizzazione del backlog (questionario, richiesta PO «ottimizza tutti i PO, ci sono molte ridondanze»)
- Unioni approvate (la prima voce resta, le altre diventano DOPPIONE con rimando): PO-120 ← PO-100 · PO-033 ← PO-094, PO-104, PO-050, PO-079 · PO-123 ← PO-133, PO-172, PO-185 · PO-068 ← PO-024, PO-070, PO-075 · PO-030 ← PO-031 · PO-155 ← PO-177 · PO-002 ← PO-150 · PO-209 ← PO-211 · PO-190 ← PO-021 · (e PO-022 ← PO-064).

## 05/10 — PO-068 gesti (questionario)
- **Risposta PO:** «1, 2 e 3» — tutte e tre, in quest'ordine: (1) P1-b: `BRAIN_GESTI` anche nelle scene dell'eroe (caduta, cartellino, rovesciata) e colonne `contactAt`/`foot` nella tabella GESTI; (2) clip in prova di PO-075 (Receive Soccerball, Soccer Header, Jog Forward) agganciate al gioco; (3) le 16 varianti dichiarate e mai raggiunte (copertura 30/46 → 46/46). Ogni passo con rosso, guardiano e foto GLB-ON.

## 06/10 — PO-216 (questionario)
- **Come è stata giocata la partita 2-2 con l'Haringey:** «Giocata a mano».
- **Testimone nel gioco:** «Sì, testimone» — al fischio, se tabellone e motore non coincidono, il taccuino annota da solo i due elenchi di gol e le scene.

## 06/10 — Rincorsa dei gesti (questionario, domanda PO «i gesti hanno tutti preparazione e/o rincorsa?»)
- **Passaggio e cross:** «Riuso Strike Forward Jog» — la clip col passo d'appoggio anche per lancio lungo e cross; il passaggio corto resta da fermo.
- **Pallonetto e volée:** «Entrambi» — anche pallonetto e volée prendono la rincorsa del tiro in corsa.

## 06/10 — Clip in prova PO-075 (questionario)
- **Risposta PO:** «Testa + coscia, corsa dopo» — «Soccer Header» (stacco da fermo) per i colpi di testa con l'eroe fermo; controllo di coscia di «Receive Soccerball» (tratto 0,8-1,6 s) quando l'eroe riceve un pallone alto; «Jog Forward» resta in prova finché non si confronta con la corsa attuale.

## 06/10 — Chiudere L1 il prima possibile (questionario)
- **Voci in attesa di Codex (PO-033, 048, 120, 123, 127):** «Collaudo io in headless» — misuro ciò che si misura senza GPU, con guardiani, e dichiaro esplicitamente ciò che richiede telefono o 60 fps.
- **PO-022 e PO-030:** «Restano in L1».
- **PO-068:** entrano in L1 il colpo di testa (la testa non arriva al pallone), le 16 varianti mai raggiunte e P2/P3.

## 06/10 — Volée senza rincorsa (questionario, dal collaudo PO-120)
- **Misura:** con la rincorsa (7.999.143) la volée della scena #6 arriva al contatto girata di 86-91° rispetto alla porta, 14° senza.
- **Risposta PO:** «Togli la rincorsa alla volée» — torna al gesto al volo; il pallonetto tiene la rincorsa. Guardiano sull'angolo al contatto.
- **Rettifica (06/10, stesso giorno):** il dato 86-91° veniva da una pagina riusata dopo altre scene («una pagina stanca non è il gioco»); su pagina nuova, 3 ripetizioni: con rincorsa 5°, 7°, 9°, senza 3°, 20°, 3°. **Risposta PO: «Rimetti la rincorsa»** — la volée tiene la rincorsa (decisione «Entrambi» del 06/10); la sospensione non è stata spedita.

## 06/10 — Accorpamenti in L1 (questionario, domanda PO «nel lotto 1 ci sono PO ripetitivi o accorpabili?»)
- Approvati tutti: PO-209 ← PO-216 (tabellino post partita incoerente) · PO-123 ← PO-033, PO-120 (un unico collaudo degli highlight) · PO-048 ← PO-127 (regia della camera) · PO-022 ← PO-030 (cantiere del brain). L1 passa da 10 a 6 voci.

## 06/10 — PO-123 obiettivo di movimento (questionario)
- **Misura** (sonda hl-credibilita sul tempo di scena): prima dell'azione compagni fermi 34-43%, avversari 29-46%; durante l'esito 52% e 61%; oscillazione di circa 10 punti fra giri.
- **Risposta PO:** «≤30% prima dell'azione» — nelle fasi prima del tiro/passaggio al massimo il 30% fermi (compagni e avversari entro 35 m), misurato su 5 partite; l'esito non si giudica.

## 06/10 — PO-068 le 16 varianti mai raggiunte (questionario)
- **Misura** (censimento `CENSIMENTO_SCENE.json`, base 46 dichiarate / 16 mai raggiunte):
  - 9 sono doppioni di varianti già raggiunte, con la stessa clip e lo stesso profilo: shot_placed, step_over, feint, hocus_pocus, short_pass, long_pass, chip_pass, backheel e tackle/aerial (gli stacchi difensivi escono già come colpo di testa);
  - 5 sono dribbling nascosti dalla regola 7.798 («X e tiro» / «X e assist»): dribble_inside, dribble_outside, double_step, roulette, cross_after_dribble;
  - 2 non hanno nessuna azione in catalogo: cross_rabona e heel.
- **Risposte PO:**
  - «Tolgo i 9 doppioni»;
  - «Doppio gesto»: prima la clip del dribbling nella costruzione, poi il tiro o il cross, con interruttore rosso e guardiano;
  - «Aggiungo 2 azioni»: «Cross di rabona» e «Assist di tacco».

## 06/10 — Collaudi di Codex: zone ferme (indicazione PO)
- **Regola PO:** una funzionalità che Codex sta collaudando non si modifica in parallelo («il cane che si morde la coda»). Si passa a sistemarla solo quando il collaudo è ritenuto chiuso definitivamente.
- **Zone che Codex può collaudare** (ferme su main 7.999.143):
  - PO-209/216, tabellino contro gol del motore (testimone `auto216`);
  - PO-048/127, regia della camera;
  - PO-210, fisarmoniche del post-partita;
  - PO-203, piedi nell'esultanza.
- **Zone in lavorazione** (escluse dal collaudo di Codex):
  - PO-068, gesti degli highlight (`deriveHL`, GESTI, sequenza dell'azione, clip, contatto, rincorsa, testa);
  - PO-123, movimento nelle scene (7.999.144);
  - PO-022/030, scena generata dal brain.
- **Procedura:**
  - il rapporto di Codex indica la versione collaudata;
  - i rilievi su una zona ferma si accumulano senza correzioni finché il collaudo non è chiuso;
  - restano ipotesi finché non sono riprodotti.
- **Correzione (questionario 06/10):** «Cross di rabona» e «Assist di tacco» non si aggiungono. Rabona e tacco sono gesti promessi senza clip (regola PO-086, `src/04-situazioni-zone-piazzati.jsx:143-148`), quindi le azioni sarebbero sospese o mostrerebbero un gesto falso. Risposta PO: «Tolgo le 2 varianti». Restano in coda come clip mancanti.

## 07/10 — PO-022/030: cosa serve per chiudere L1 (questionario)
- **Domanda:** primo passo (opzioni dalla scena per la conclusione in area), primo passo più manovre, oppure Passo 6 completo.
- **Risposta PO:** «Passo 6 completo».
  - Tutte le scene nascono dal motore e le schede diventano modelli di testo.
  - L1 resta aperto fino ad allora.
- **Metodo** (dalla proposta in `tests/character-lab/SCENE_DISEGNABILI.md` §5): a strati, una release per strato, ognuno con misura, interruttore rosso e guardiano.

## 07/10 — Nuove zone ferme per Codex (dopo la chiusura di A-D)
- **E:** PO-176 (cosa cambia dopo il ricaricamento).
- **F:** PO-183 (nessuna partita rigiocata).
- Base: main `22629405` (7.999.145). Il team non tocca salvataggio, ricarica e calendario finché il collaudo non è dichiarato chiuso.
- Prompt: `docs/governo/prompt/codex-2026-10-07-salvataggio.md`.

## 07/10 — Zona ferma G per Codex (dopo la chiusura di E-F)
- **Zona:** PO-153, fase 1 delle carriere, base per PO-154…157 (L6).
- **Base:** main `f7026f4f` (7.999.148).
- **Restituzione a Codex:** era fra i collaudi ereditati dal team il 06/10, mai iniziato e fuori dalle zone su cui lavora il team.
- **Durata:** finché il collaudo non è chiuso, il team non tocca stagioni, offerte, impulsi, Nazionale, difficoltà, economia e Ufficio.
- **Prompt:** `docs/governo/prompt/codex-2026-10-07-carriere-fase1.md`.

## 08/10 — Passo 6, strato 7: le scene difensive dell'eroe (PO-022)
- **Misura che ha portato alla domanda:** 4 partite vere S12 (sonda `difesa-oggi`): 38 azioni dell'eroe risolte, **0 difensive** — ogni scena nasce da un'occasione d'attacco o da un piazzato del motore. Il motore offre però occasioni difensive vere: portatore avversario entro 4 u dall'eroe 5,2 volte a partita (6,7 entro 6 u), quasi tutte pressing alto nella metà campo avversaria (24 partite node, configurazioni S12).
- **Decisione PO:** al massimo **1** scena difensiva a partita, e **si aggiunge** alle scene d'attacco (non ne prende il posto).
- **Conseguenza:** il motore dichiara la prima occasione difensiva vera (portatore avversario entro 4 u dall'eroe) come `occasione_eroe` di tipo `difesa`, una sola volta a partita; la scena si costruisce da quella occasione; l'esito lo racconta il motore (contrasto o avversario che prosegue).

## 08/10 — Passo 6, strato 8: prima i piazzati, poi la chiusura (PO-022)
- **Misura:** nelle partite misurate le scene costruite dal motore coprono 14 occasioni su 18 (`scena-motore-147`); restano dal catalogo rigori e punizioni dell'eroe, il 29% delle sue azioni (11 su 38 in 4 partite vere, sonda `difesa-oggi`).
- **Decisione PO:** **strato 8a** — rigori e punizioni nascono dal motore come le altre scene (rosso e guardiano propri); **strato 8b**, release separata — chiusura totale: catalogo a modelli di testo, controlli di qualità sulle situazioni, firme del 3D e salvataggio a metà partita adeguati, via il ripiego.

## 09/10 — PO-221: quante scene dell'eroe e quanto rendono
- **Misura:** 8 partite vere S12 (due corse, 7.999.153): 5-12 scene dell'eroe a partita (media 9-10); gol dell'eroe 1,0 e 1,75 a partita nelle due corse (campione piccolo); circa 1 scena su 3-4 finisce bene; le giocate più deboli sono finte, uno-due e filtranti fra le linee (intercettati).
- **Decisione PO:** **5-7 scene a partita**; resa: **stessi gol** (obiettivo 0,6-0,9 a partita, fissato il 30/09) ma **più scene utili** — più assist e giocate riuscite, meno intercetti su uno-due e finte.

## 09/10 (sera) — PO-221: come arrivare a 5-7 scene e a più assist (questionario)
- **Misura nuova:** 6 partite vere S12 su 7.999.155, 55 scene: 9,2 a partita (4-12); per partita 2,7 conclusioni, 2,3 «fra le linee», 1,3 punizioni, 0,8 cross, 0,8 difese, 0,5 «spalle», 0,5 rigori. Esiti di 53 azioni scelte a caso dall'autoplay: 30 tiri sbagliati, 11 intercetti, 5 gol (0,83 a partita), 1 assist. Intercetti soprattutto su «Finta e cambio di passo» (4), «Conduci e tira» (3), «Uno-due» (2).
- **Decisione PO (questionario):** meno scene con **più distanza fra le occasioni dal gioco (16' invece di 12') e al massimo 1 punizione diretta a partita** (rigori e scena difensiva invariati); più assist con **entrambe** le leve: ogni scena offensiva offre almeno un'opzione di passaggio/assist, e uno-due e finta vengono intercettati meno quando l'eroe ha buone statistiche di passaggio e dribbling. Gol invariati (0,6-0,9).
- **Avvertenza:** gli esiti misurati vengono da scelte casuali dell'autoplay, non dalle scelte di un giocatore.
- **Misura dopo la prima stesura (7.999.156, 6 partite per braccio):** scene 7,3 a partita (5-10) contro 9,2; gol dell'eroe 0,33 contro 0,50 (campione piccolo, scelte casuali); assist 0,17 in entrambi. Sulle azioni d'assist il passaggio arriva 8 volte su 9, è il **tiro del compagno** a mancare (5 fuori, 1 parato, 1 murato, 1 gol).
- **Decisione PO (secondo questionario):** tiro del compagno **più pulito** dopo il passaggio riuscito; **prima una misura più grande** (12 partite per braccio) e solo se i gol dell'eroe restano sotto 0,6 si alza la resa del tiro; passo fra le occasioni **resta 16'**.
- **Misura con resa ×1,4 (12 partite, 7.999.156):** scene 8,0 (mediana 7,5; 6 partite su 12 in 5-7, contro 1 su 12 senza correzioni); gol dell'eroe 0,75 (in fascia); assist 0,08 come senza correzioni. Il tiro del compagno più pulito non basta: su 34 azioni d'assist il compagno tira fuori 14, murato 8, parato 8, gol 2.
- **Decisione PO (terzo questionario, 10/10):** **rilasciare ora** la 7.999.156 (scene, gol, passaggio offerto, guardiani difesa-220 e scene-221) e trattare gli assist nella release successiva, mettendo il compagno **in posizione da gol** (più vicino alla porta e centrale) dopo il passaggio riuscito.

## 10/10 — Lavoro in parallelo: una sessione collaudatrice e una sviluppatrice (questionario)
- **Richiesta PO:** «da oggi in poi, in particolare da quando scadrà Codex (19/10), lavorare in parallelo con almeno un'altra sessione che faccia da collaudatore e un'altra che effettui gli sviluppi più semplici».
- **Sviluppatrice:** schermate L7 (PO-066 home, PO-217 analisi pre-partita), poi pulizia PO-072, poi cerimonie L8 (PO-137, PO-002). Lavora su un **ramo suo**; io controllo, unisco nel ramo principale e faccio le catene complete prima di ogni promozione su `main` (un solo punto di promozione). Non tocca motore e highlight (L1) né la zona G.
- **Collaudatrice:** regole **come Codex** (sola lettura, commit fisso per giro, rilievi riproducibili, «Non posso confermarlo», consegna a zone); parte subito su zone diverse da quelle di Codex e dal 19/10 eredita la sua coda.
- **Avviate il 10/10:** collaudatrice `session_012geq5vKpCgT9V8cH9Yj2kq` (la prima, `session_016pTaHEL91Hw7ghGsDw2rvw`, non è partita: il clone non accetta un hash abbreviato; ricreata da `main` con checkout del commit fisso) (ramo `collaudo/sessione-collaudatrice`, base `729fc8e1` = 7.999.155, zone Q effetti eventi e S cerimonie 3D, tolte dalla coda Codex); sviluppatrice `session_016iFXUZxfYMv9QqUTMb1Yjx` (ramo `sviluppo/l7-pulizia-l8`, da `main`: L7 PO-066/PO-217, poi PO-072, poi L8 PO-137/PO-002). Rapporti in `docs/collaudi/` e `docs/sviluppo/` sui loro rami.
- **10/10, decisione PO (questionario): Haiku 5.5 su entrambe le sessioni parallele.** Il modello di una sessione avviata non si cambia: le sessioni si ricreano. Collaudatrice ricreata con Haiku 5.5: `session_015L5DVPw5JuJRkzXU22MUE2` (archiviate `session_012geq5vKpCgT9V8cH9Yj2kq` e `session_016pTaHEL91Hw7ghGsDw2rvw`). Sviluppatrice: si ricrea con Haiku dopo che la sessione attuale (`session_016iFXUZxfYMv9QqUTMb1Yjx`) ha pubblicato sul suo ramo il commit di PO-066, oggi solo nel suo container. Da qui le consegne si pubblicano dopo ogni commit.
- **10/10, PO: «Voglio parlare solo con te».** Il PO non interagisce con le sotto-sessioni né con i loro rami: incarichi, controlli, ricreazioni e unioni li fa la sessione principale, che riporta al PO solo esiti e decisioni da prendere (questionario).

## 10/10 sera — questionario: aggancio di prova per gli impulsi, poi gli assist
- **Zona G:** sì al solo **aggancio di prova** per far comparire un impulso preciso del catalogo (collaudo PO-154 delle 221 scelte). Nessun cambio di comportamento: la zona G resta ferma per tutto il resto.
- **Prossimo lavoro sul motore:** gli **assist** di PO-221 (compagno in posizione da gol dopo il passaggio riuscito).
