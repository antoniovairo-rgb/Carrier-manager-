# -*- coding: utf-8 -*-
# Generatore di docs/governo/MAPPA_GIOCO.md — dati raccolti con grep sul codice e sui documenti di governo.
import math

PESI = [("F", "Funzione", 25), ("S", "Stabilità", 20), ("T", "Test", 15), ("C", "Coerenza", 15), ("R", "Resa", 15), ("So", "Solidità tecnica", 10)]
NPC = "Non posso confermarlo"

RAMI = []
def ramo(num, nome, nota=""):
    RAMI.append({"num": num, "nome": nome, "nota": nota, "nodi": []})

def N(nid, nome, ident, come, peso, F, S, T, C, R, So, caps, aff, manca, voci, aprire=None):
    RAMI[-1]["nodi"].append(dict(id=nid, nome=nome, ident=ident, come=come, peso=peso,
        crit={"F": F, "S": S, "T": T, "C": C, "R": R, "So": So}, caps=caps, aff=aff, manca=manca, voci=voci, aprire=aprire or []))

CAP_NOG = (70, "nessun guardiano in una catena di `ci-runner.mjs`")
CAP_PO = lambda v: (80, "segnalazione PO aperta: " + v)
CAP_BLOC = lambda v: (50, "difetto bloccante aperto: " + v)

# ───────────────────────── 1 AVVIO E ACCESSO
ramo(1, "Avvio e accesso")
N("1.1", "Caricamento e ripresa automatica", "`App` fase `loading` + auto-ripresa (`src/19-app-root.jsx:760-806`)", "apertura dell'app; con carriera attiva (`cpm-active`) si rientra dritti in carriera", 3,
  (80, "riprende carriera (19:776-779), provini (19:781-803) e link `?review=` (19:771); fallback «Stato non riconosciuto» (19:956)"),
  (75, "nessuna voce aperta; ricorrenze chiuse: PO-037 «si riavvia in background» (7.999.11 e 7.999.12), PO-115 avanzamento perso (7.999.55)"),
  (20, "auto-ripresa DISATTIVATA sotto `?cpmtest=1` (19:766): nessun guardiano la esercita; `dist-web-partita-test.mjs` fuori dalle catene"),
  (80, "ripresa sullo stesso tab (`cpm-active-tab`, 18:122) coerente con la direttiva 7.149"),
  (None, NPC + " (nessuna navigazione eseguita)"),
  (60, "ogni lettura in try/catch; rischio R-04 «partita in corso persa» (RISCHI.md)"),
  [CAP_NOG], "media", "un guardiano che ricarichi la pagina SENZA `cpmtest` (carriera, provini, partita in corso) e lo metta in una catena",
  ["PO-167", "PO-176"], ["Guardiano dell'auto-ripresa reale (oggi spenta sotto `cpmtest=1`)"])
N("1.2", "Menu principale e slot di salvataggio", "`HomeScreen` (`src/17-menu-creazione-pannelli.jsx:116`), `HomeNavBar` (19:712), `PwaInstallBanner` (17:27)", "fase `home` (19:947), quando non c'è una carriera da riprendere", 3,
  (85, "tre slot, nuova/carica/elimina/importa (19:947); barra in basso (19:938)"),
  (85, "nessuna voce aperta in BACKLOG.md; rilievo chiuso «il testo è sovrapposto!» (`slot-card-layout-test.mjs`)"),
  (30, "`griglia-mobile` (catena grafica) misura la schermata `home` ma è un censimento senza soglia (griglia-mobile.mjs:164); `slot-card-layout-test.mjs` fuori catena"),
  (75, "commento G9 in griglia-mobile.mjs: «la schermata iniziale e' rimasta completamente fuori standard» (22/09), poi uniformata; esito attuale " + NPC),
  (None, NPC),
  (70, "componente di 140 righe, nessuna logica di gioco"),
  [CAP_NOG], "media", "guardiano del menu (slot pieni/vuoti, nessun testo sovrapposto) in catena grafica", [], ["Guardiano del menu principale con slot pieni e vuoti"])
N("1.3", "Impostazioni", "`SettingsScreen` (`src/19-app-root.jsx:601`), `AudioSettings` (19:633)", "rotella dal menu (19:877) o «Opzioni» in carriera (18:6033)", 2,
  (80, "grafica, audio, esporta, rivedi intro, uscita al menu (18:6033-6105)"),
  (85, "PO-044 «Rivedi l'intro non funziona» chiusa in 7.999.12; nessuna voce aperta"),
  (30, "solo il censimento `griglia-mobile` (schermata `impostazioni`)"),
  (60, "nel menu del giocatore stanno «Strumenti di collaudo», appunti e misura del motore (18:6041-6100): strumentazione di test in produzione (DT-08)"),
  (None, NPC),
  (65, "strumenti di collaudo condizionati da `devToolsOn()`, ma il codice è nella build"),
  [CAP_NOG], "media", "togliere o nascondere dalla build store gli strumenti di collaudo; guardiano dei due ingressi", ["PO-072"], ["Strumenti di collaudo visibili nelle Impostazioni del giocatore (DT-08)"])
N("1.4", "Importa ed esporta salvataggio", "`importSave` (`src/19-app-root.jsx:820`), `exportSave` (`src/18-career-app.jsx:621`)", "menu: «Importa»; carriera: Impostazioni → «Esporta salvataggio»", 1,
  (70, "export su file e import con avviso se il salvataggio è di una versione più nuova (19:809)"),
  (80, "nessuna voce aperta"),
  (0, "ARCHITETTURA.md «Scoperti oggi: … import di un salvataggio da file»; RISCHI R-05"),
  (70, "export in fondo alle impostazioni come chiesto dal PO (commento 6.84.0, 18:6100)"),
  (None, NPC),
  (60, "un salvataggio più nuovo viene comunque caricato con un avviso (19:809)"),
  [CAP_NOG], "media", "guardiano import→export→import con confronto byte per byte", ["PO-167"], ["Guardiano di import/export del salvataggio"])
N("1.5", "Revisione azioni e prova situazioni (solo sviluppo)", "`ReviewWizard` (`src/19-app-root.jsx:50`), `SitTest` (19:181)", "`?dev=1` → «Revisione azioni» nel menu (19:948); `?sit=N`", 0,
  (75, "wizard muto (19:944), escluso dalla build store (`__CPM_STORE_BUILD`, 19:947)"),
  (None, NPC), (30, "usato dal collaudo, nessun guardiano proprio"), (60, "strumento di sviluppo dentro il file di gioco (DT-08)"), (None, NPC), (50, "dipende dagli hook `window.__CPM_*`"),
  [CAP_NOG], "bassa", "fuori dal conto (peso 0): resta nella mappa per completezza", [])

# ───────────────────────── 2 PERCORSO INIZIALE
ramo(2, "Percorso iniziale (creazione, provini, Primavera, passaggio pro)")
N("2.1", "Creazione del giocatore", "`CreateScreen` (`src/17-menu-creazione-pannelli.jsx:272`)", "menu → slot vuoto → «Nuova carriera» (`startNew`, 19:817)", 3,
  (80, "nome, nazione, ruolo, volto; bonus eredità della Nuova partita+ (19:951)"),
  (80, "nessuna voce aperta"),
  (30, "solo il censimento `griglia-mobile` (schermata `creazione`); `grep CreateScreen tests/visual` = 0 file"),
  (75, "nella griglia mobile come le altre schermate del menu"),
  (None, NPC), (70, "componente compatto"),
  [CAP_NOG], "media", "guardiano «nuova carriera dall'inizio alla prima partita» (lacuna dichiarata in ARCHITETTURA.md)", [], ["Guardiano nuova carriera: creazione → provini → offerte → prima partita"])
N("2.2", "Filmato introduttivo", "`IntroCinematic` (`src/19-app-root.jsx:221`)", "dopo la creazione, la prima volta (`setPhase(\"cinematic\")`, 19:856); «Rivedi l'intro» (19:719)", 1,
  (80, "una volta per dispositivo (`cpm-intro-seen`, 19:952) e ripetibile"),
  (85, "PO-044 chiusa in 7.999.12"),
  (0, "nessun test lo cita"), (75, "evento unico `cpm-replay-intro` da menu e profilo (19:730-732)"), (None, NPC), (70, "isolato"),
  [CAP_NOG], "bassa", "uno scatto di controllo in catena grafica", [])
N("2.3", "Provini (tre partite)", "`TrialFlow` (`src/17-menu-creazione-pannelli.jsx:469`), fasi `pre`/`match`/`post`", "dopo il filmato (19:952) o in ripresa (19:799-803)", 2,
  (80, "tre provini con la «Selezione Granata» (17:471), ripresa da `cpm-trial-prog` (7.330)"),
  (70, "bug grave chiuso 7.332 «mi ha sovrascritto una carriera» (19:793); mai un quarto risultato (7.331, 17:498)"),
  (30, "`tripath-chokepoint-test.mjs` (fuori catena); la ripresa è spenta sotto `cpmtest` (19:780)"),
  (70, "stessa `LiveMatch` della carriera con `context=\"trial\"`"),
  (None, NPC), (65, "persistenza su chiave separata dallo slot"),
  [CAP_NOG], "media", "guardiano dei tre provini con ripresa a metà", [], ["Guardiano dei provini con ripresa a metà"])
N("2.4", "Offerte di fine provini", "`OffersScreen` (`src/17-menu-creazione-pannelli.jsx:405`)", "fine del terzo provino (`onTrials`, 19:857)", 2,
  (85, "lega e bandiera su ogni offerta (7.999.114, PO-196)"),
  (85, "PO-196 chiusa nello storico"),
  (75, "`calendario-offerte-195` in catena grafica, rosso `__CPM_NO_LEGA196`, verde su 7.999.126 (STABILITA.json)"),
  (80, "etichette di lega coerenti con la Stagione"),
  (None, NPC + " (correzione 7.999.114 non ricollaudata dal PO)"), (70, "logica breve"),
  [], "alta", "collaudo PO della 7.999.114 sul telefono", ["PO-196"])
N("2.5", "Stagioni Primavera (Under 18)", "`CareerApp` con `proStatus:\"u18\"` (`src/18-career-app.jsx:10119` riquadro di stato)", "firma con un club giovanile dalle offerte (`onChoose`, 19:858)", 3,
  (70, "stessa carriera dei pro con regole proprie (gol Primavera fuori dalle classifiche pro, `primavera-awards-test.mjs`)"),
  (55, "PO-194 GRAVE «partita già giocata» in Primavera 2, S.1 (chiusa 7.999.113); PO-192 conferenza «quasi un derby» in Primavera; impulsi «troppo presto» (`impulsi-contesto-test.mjs`)"),
  (60, "`conferenza-192` (rosso `__CPM_NO_DERBY192`) e `partita-rigiocata-194` in catena carriera, verdi su 7.999.122; `primavera-awards-test`, `impulsi-contesto-test` fuori catena"),
  (70, "PO-192: domande da professionisti finite in Primavera"),
  (None, NPC), (60, "molte regole `proStatus===\"u18\"` sparse in 18"),
  [], "media", "collaudo Codex di una stagione Primavera intera con scheda (eventi, conferenze, classifica)", ["PO-192", "PO-194", "PO-153"])
N("2.6", "Passaggio a professionista", "schermata `proTransition` → `ProTransitionScreen` (`src/16-scene-3d-cerimonie.jsx:26`); `onProChoose` (`src/18-career-app.jsx:5294`)", "fine stagione Under 18 (`setScreen(\"proTransition\")`)", 2,
  (80, "rivale e sponsor nascono all'accettazione dell'offerta (7.999.120)"),
  (65, "PO-176 PARZIALE: «differenze playedMd e cup.club da ricollaudare con Codex»"),
  (70, "`pro-rivale-176` in catena carriera, rosso `__CPM_NO_PRO176`, verde su 7.999.122"),
  (75, "stesso flusso offerta/firma della carriera"),
  (None, NPC), (60, "migrazione al caricamento che crea campi (prima della 7.999.120)"),
  [CAP_PO("PO-176")], "alta", "ricollaudo Codex di PO-176 sulla build corrente", ["PO-176"])

# ───────────────────────── 3 HOME E CICLO SETTIMANALE
ramo(3, "Home e ciclo settimanale")
N("3.1", "Home (cruscotto)", "linguetta `dashboard` (`src/18-career-app.jsx:7167-8575`)", "barra in basso «Home» (18:6025), tasto M", 3,
  (80, "circa 45 riquadri condizionati (`tab===\"dashboard\"` ripetuto 54 volte in 18)"),
  (55, "PO-066 PARZIALE «riquadri fuori standard»; correzioni recenti 7.999.105 (riquadro Europeo «vs ?») e 7.999.110 (titolo in fondo, contrasto 1,11)"),
  (70, "`titolo-110`, `riquadro-euro-105` in catena carriera; `home-riquadri`, `numeri-home` nella catena guardiani (ultimo giro 7.999.98, 01/10)"),
  (60, "PO-066: «Profilo e Nazionale da portare alla card neutra»"),
  (60, "PO-066 «da completare»; 7.999.110 contrasto 1,11 → 5,93"),
  (50, "riquadri scritti come blocchi inline nel file da 11.587 righe (DT-06)"),
  [CAP_PO("PO-066")], "media", "chiudere PO-066 e rieseguire la catena guardiani sulla build corrente", ["PO-066"])
N("3.2", "Pulsante principale e avanzamento della settimana", "`handleContinua` (18:1253), `doAdvanceWeek` (18:4195), conferma `showAdvanceConfirm` (18:6655)", "pulsante fisso in cima alla Home (18:7165), tasto A", 3,
  (75, "vivi / gioca / avanza in un solo pulsante; conferma prima di saltare"),
  (20, "PO-183 BLOCCANTE IN CORSO; nota 7.445 «9ª RICORRENZA … partita già giocata» (`src/07-versione-save-interviste.jsx:114`); PO-194 GRAVE (7.999.113); PO-181 settimana ferma (7.999.104); 7.999.103 e 7.999.107 correttive"),
  (85, "`career-critical` (11 guardiani, rossi `__CPM_NO_P0_1…6`) e `partita-rigiocata-194`, `recupero-103`, `euro-attesa-181`, `rinvio-coppe-107` in catena carriera, verdi su 7.999.122"),
  (65, "tre strade che avanzano la settimana (doAdvanceWeek / onMatchEnd / simulateAndAdvance: `tripath-chokepoint-test.mjs`)"),
  (None, NPC), (40, "65 occorrenze di `Math.random` in `src/18` (grep), DT-07"),
  [CAP_BLOC("PO-183")], "alta", "chiudere PO-183 con collaudo; una sola funzione di avanzamento", ["PO-183", "PO-176", "PO-153"])
N("3.3", "Vivi la settimana ed eventi settimanali", "`liveCurrentWeek` (18:3911), finestra `weekLiveModal` (18:6165), avviso `weekEvent` (18:6121), `WEEKLY_EVENTS` (`src/03-eventi-narrativi.jsx:26`)", "pulsante principale nelle settimane senza partita", 3,
  (75, "evento, riabilitazione, spogliatoio, impulso, rivale (18:3929-4565)"),
  (70, "lamentele ripetute chiuse: «in una stagione mai capitato un evento» (`vita-flow-test`), «ripetitivo» (`vita-variety-test`)"),
  (40, "`vita-flow-test`, `vita-variety-test`, `impulsi-contesto-test` fuori catena"),
  (65, "PO-154: «46 impulsi su 112 non hanno condizioni… Nessun impulso ha memoria»"),
  (None, NPC), (55, "testi e pesi in tabelle da 1.459 righe"),
  [CAP_NOG, CAP_PO("PO-154")], "media", "fase 1 Codex (PO-153) e proposta PO-154; guardiano in catena", ["PO-154", "PO-153"])
N("3.4", "Momenti di carriera", "`careerMomentModal` (18:6285), `CAREER_MOMENTS` (`src/03-eventi-narrativi.jsx:972`)", "dopo partite o settimane speciali (18:1244)", 2,
  (70, "finestra in coda alle altre (precedenza unica, rosso `__CPM_NO_CODA23`, 18:6028)"),
  (75, "nessuna voce aperta sul nodo; coda delle finestre corretta il 24/09"),
  (30, "hook `forceMoment` (18:1369), nessun guardiano in catena"),
  (65, "PO-154: niente memoria né catene"),
  (None, NPC), (55, "trigger probabilistici non seedati"),
  [CAP_NOG], "bassa", "guardiano della coda delle finestre in catena; misura Codex delle frequenze", ["PO-154"])
N("3.5", "Il mister: verifica mensile e dialoghi", "`monthlyReviewModal` (18:6504), `coachModal` (18:6462)", "ogni mese (18:3945); dialogo proattivo (18:4755)", 2,
  (70, "scelte di risposta con effetti"),
  (75, "chiusa la lamentela «conversazioni molto ripetitive» (`coach-review-variety-test`)"),
  (40, "`coach-review-variety-test`, `coach-face-test` fuori catena"),
  (70, "Modal standard dal 7.993"), (None, NPC), (55, "logica inline nel componente"),
  [CAP_NOG], "media", "guardiano in catena e collaudo dei testi", [])
N("3.6", "Interazioni d'apertura stagione", "`openingWiz` (18:6890), `openingPending` (18:883: ritiro, presidente, mercato, stampa, maglia, presentazione, addio, sorteggi)", "settimana 1 di ogni stagione (`openingGate`, 18:901)", 2,
  (80, "otto passi in fila in un solo assistente"),
  (75, "nessuna voce aperta"),
  (40, "`home-opening-test` (fuori catena): «le interazioni d'apertura vivono solo nel wizard»"),
  (75, "direttiva PO: niente riquadri pre-stagionali in Home"), (None, NPC), (60, "gestori condivisi card⟷wizard (18:904)"),
  [CAP_NOG], "media", "rimettere `home-opening-test` in una catena", [])
N("3.7", "Tutorial", "`TutorialOverlay` (`src/17-menu-creazione-pannelli.jsx:1733`), `TUTORIAL_STEPS` (17:1725)", "primo ingresso in Home (`!player.tutorialDone`, 18:6109)", 1,
  (60, "quattro passi (`tutStep` 0-3, 18:129), salta/avanti"),
  (80, "nessuna voce in BACKLOG.md"),
  (0, "i guardiani impostano `tutorialDone:true` per saltarlo"),
  (None, NPC), (None, NPC), (70, "componente piccolo"),
  [CAP_NOG], "bassa", "collaudo Codex con scheda del primo avvio; uno scatto in catena grafica", [], ["Tutorial: nessuna verifica (né guardiano né collaudo)"])
N("3.8", "Allenamento (vista orfana)", "linguetta `training` (18:9508) con `TrainPanel` (`src/17-menu-creazione-pannelli.jsx:1779`)", "NON raggiungibile: nessun `setTab(\"training\")`, assente dalla barra (18:6025) e da `_initTab` (18:122)", 1,
  (30, "allenamento automatico «by-design» (18:3060); la vista esiste ma non si apre"),
  (None, NPC), (0, "nessuno"),
  (30, "vista orfana; PO-125 «poco da allenarsi» corretta solo nei testi (7.999.64)"),
  (None, NPC), (50, "codice morto di ~25 righe"),
  [CAP_NOG], "media", "decisione PO: ripristinare o togliere", ["PO-125"], ["Vista Allenamento orfana: ripristinare o eliminare"])

# ───────────────────────── 4 STAGIONE
ramo(4, "Stagione")
N("4.1", "Classifica", "linguetta `standings` (18:8833-9084)", "barra «Stagione» (apre sulla classifica, 18:631)", 3,
  (85, "classifiche di tutte le leghe, capocannonieri, risultati dagli altri campionati"),
  (60, "PO-182 BLOCCANTE chiusa in 7.999.102; PO-175 gol fatti ≠ subiti (7.999.94); `classifica-94` precedente"),
  (85, "`classifica-102` (rosso `__CPM_NO_CLASSIFICA102`) in catena carriera; `career-invariants` (standings) in `career-critical`, verdi su 7.999.122"),
  (80, "una sola fonte per la classifica dopo la 7.999.102"),
  (None, NPC), (60, "riconciliazione al caricamento (07:85)"),
  [], "alta", "un collaudo Codex di 30 carriere (fase 1) senza anomalie di classifica", ["PO-153"])
N("4.2", "Calendario", "linguetta `calendar` (18:8586)", "Stagione → «Calendario»", 3,
  (85, "griglia con sigla, sede e punteggio (7.999.114)"),
  (60, "PO-193 «SETTIMANA 39 DI 38» (7.999.113), PO-195 (7.999.114), 7.999.106 avversario pescato a caso, PO-089 amichevole durante l'Europeo"),
  (80, "`calendario-offerte-195` (grafica), `avversario-106` (carriera) con rossi, verdi; `calendario-nazionale` nella catena guardiani"),
  (80, "stesse sigle della classifica"), (None, NPC), (60, "calendario persistente generato una volta per stagione"),
  [], "alta", "collaudo PO della griglia sul telefono", [])
N("4.3", "Coppe (nazionale, europee, tornei)", "linguetta `coppe` (18:11304)", "Stagione → «Coppe»", 2,
  (75, "tabellone, gironi, capocannonieri, albo"),
  (45, "7.999.107 rete di sicurezza per le coppe ferme; PO-186 KCC ferma agli ottavi; 7.686 «trofeo alzato a metà torneo» (18:5900); 7.999.105"),
  (85, "`coppa-intera`, `coppa-nazioni`, `cup-final-replay`, `recovery-competition` in `career-critical`; `rinvio-coppe-107` in catena carriera"),
  (70, "nomi delle coppe «Korward» (18:5897)"), (None, NPC), (55, "stato coppe sparso fra `cup`, `euro`, `euroMondiale`"),
  [], "alta", "fase 1 Codex con controllo delle coppe arrivate in fondo", ["PO-153"])
N("4.4", "Sorteggi dei gironi europei", "`euroGroupModal` (18:7011) e passo «sorteggi» (18:898)", "settimana 1 con coppa europea a gironi", 1,
  (75, "rivelazione progressiva (`drawRevealN`)"),
  (75, "nessuna voce aperta"),
  (50, "`career-invariants` controlla `euroGroupTable` (dati), non la finestra"),
  (75, "Modal standard"), (None, NPC), (60, "—"),
  [], "media", "uno scatto della finestra in catena grafica", [])
N("4.5", "Ritiro pre-campionato", "overlay `ritiroEvent` (18:5828), `ritiroPlan` (`src/10-folla-stadi-ritiro.jsx:409`)", "assistente d'apertura, dalla seconda stagione da pro (18:887)", 1,
  (75, "sei tempi con un'unica scelta (7.337)"),
  (80, "nessuna voce aperta"),
  (30, "nessun guardiano dedicato; `home-opening-test` lo cita"),
  (75, "stesso schema a tempi della serata di presentazione"), (None, NPC), (60, "motori puri (18:5826)"),
  [CAP_NOG], "media", "guardiano del racconto e della scelta", [])

# ───────────────────────── 5 PARTITA
ramo(5, "Partita")
N("5.1", "Scelta Gioca / Simula", "`showMatchPrompt` (18:6552)", "pulsante principale nella settimana con partita (18:525), tasto P", 3,
  (80, "Gioca, Simula, «Non ora», squalifica → simulata (18:6552-6650)"),
  (30, "PO-183 BLOCCANTE «riproponeva di rigiocare l'ultima partita già pareggiata»; PO-194 GRAVE (7.999.113); doppio tocco (`double-tap`, P0_4)"),
  (85, "`double-tap` in `career-critical`, `partita-rigiocata-194` (rosso `__CPM_NO_CONF194`) in catena carriera, `typing-shortcuts` in completa"),
  (75, "Modal del kit"), (None, NPC), (55, "stato in più ref (`showMatchPromptRef`)"),
  [CAP_BLOC("PO-183")], "alta", "chiudere PO-183", ["PO-183"])
N("5.2", "Conferenza pre-partita e discorso del mister", "`interviewModal` con `matchCtx:\"prematch\"` (18:1053), `misterDiscorsoModal` (18:6316)", "prima di una partita importante, prima del calcio d'inizio", 2,
  (75, "ordine conferenza → discorso → partita (7.999.113)"),
  (55, "PO-194 GRAVE e PO-192 corretti in 7.999.113 (nelle ultime 15 release)"),
  (75, "`partita-rigiocata-194` e `conferenza-192` con rossi in catena carriera, verdi su 7.999.122"),
  (70, "domande filtrate per derby e professionisti"), (None, NPC), (55, "sequenza a timeout (18:462-469)"),
  [], "alta", "collaudo PO di una gara di cartello", ["PO-192", "PO-194"])
N("5.3", "Giorno partita e rapporto dell'osservatore", "`LiveMatch` fase `matchday` (`src/15-live-match.jsx:9785`), `MatchdayCard` (`src/13-prepartita-formazioni.jsx:472`), `ScoutReportScreen` (13:69)", "«Gioca» → `startMatch` (18:981)", 2,
  (80, "scheda della gara, meteo, posta in palio, osservatore"),
  (80, "nessuna voce aperta"),
  (40, "`griglia-mobile` misura il «Prepartita» (censimento)"),
  (75, "stesso kit"), (None, NPC), (60, "—"),
  [CAP_NOG], "media", "guardiano in catena", [])
N("5.4", "Formazioni", "`FormationView` (`src/13-prepartita-formazioni.jsx:827`), fase `formations` (15:9813)", "dal giorno partita (Invio o pulsante, 15:9354)", 2,
  (80, "due campetti con le formazioni"),
  (65, "PO-204 in corso (7.999.126 sul ramo)"),
  (75, "`formazioni-204` in catena grafica, rosso `__CPM_NO_FORMAZ204`, verde su 7.999.126"),
  (75, "—"), (60, "PO-204 «campetti schiacciati con spazio vuoto sotto», correzione non ancora collaudata dal PO"), (60, "—"),
  [CAP_PO("PO-204")], "alta", "collaudo PO della 7.999.126", ["PO-204"])
N("5.5", "Ingresso in campo (3D)", "fase `walkout` (`src/15-live-match.jsx:10313`), sera di presentazione (15:10298), attesa (15:10511)", "dalle formazioni", 2,
  (75, "fila, statistiche pre-partita su vetro, sfilata"),
  (40, "PO-206 APERTA «la fila corre sul posto» (possibile ricaduta di PO-197, 7.999.115; il guardiano 197 è rosso sulla misura nel giro 7.999.126); PO-188 seconda segnalazione dopo la 7.937; PO-080 (7.999.16 e 7.999.59)"),
  (55, "`walkout-fermi-197`, `pre-188` in catena grafica con rossi; `walkout-fermi-197` ROSSO sul giro 7.999.126 sulla misura, non sui campioni (verde somma 10, massimo ammesso 5,3: `walkout-fermi-197.mjs:32`)"),
  (70, "—"), (50, "PO-206 e PO-188 dalle foto del PO"), (45, "vive in `src/12` (10.887 righe) e `src/15` (11.410)"),
  [CAP_PO("PO-206")], "alta", "misurare PO-206; capire il rosso del 7.999.126", ["PO-206", "PO-188", "PO-197"])
N("5.6", "Partita 2D", "fase `playing`: `Campo2D` (15:517), `PannelloLive2D` (15:1101), `Pagella918` (15:886), cronaca `BG_MATCH` (`src/05-cronaca-stadi-formazioni.jsx:24`)", "dopo l'ingresso in campo", 3,
  (75, "campo dall'alto, cronaca, statistiche e pagelle dal vivo, scelte"),
  (40, "PO-207 APERTA (non riparte da centrocampo dopo il gol); ricorrenze: PO-189 (7.999.112), PO-122 (7.999.61, 7.999.64), PO-039 (7.999.19, 7.999.22)"),
  (65, "`rimbalzo-189` in catena carriera e grafica (ROSSO sul giro 7.999.126: 4 disegni contro 8 richiesti); `replay` in completa; `match-full-test`, `pannello-fermo-test` fuori catena"),
  (70, "decisione PO: «restano partita 2D + highlight 3D» (DECISIONI.md)"),
  (55, "PO-021 «migliorabile»; PO-207"),
  (45, "`src/15-live-match.jsx` 11.410 righe, 39 occorrenze di `Math.random`"),
  [CAP_PO("PO-207")], "alta", "chiudere PO-207 e PO-021", ["PO-207", "PO-021", "PO-031"])
N("5.7", "Highlight 3D dell'eroe", "fasi `hl_intro`/`hl_choose`/`hl_move`/`hl_result` (15); `ThreeMatchView` (`src/12-three-match-view.jsx:241`, montato 15:10083); `PopScelta919` (15:994); `DPad` (13:28); `SITUATIONS` (`src/04-situazioni-zone-piazzati.jsx:164`)", "durante la partita 2D, quando il motore apre una scena", 3,
  (70, "191 scene; copertura gesti 49%, 30/46 varianti (PO-024); manovre vere assenti (PO-030)"),
  (10, "L1: 22 voci aperte (BACKLOG.md); difetti aperti sul nodo: PO-033, 048, 050, 079, 094, 100, 104, 120, 127, 143, 172, 185"),
  (85, "`validate-situations` (gate a 14 categorie) in completa; circa 18 guardiani della scena con rosso (es. `testa-tempismo`, `tiro-caricato`, `gesti-copertura-96`) nella catena guardiani, ultimo giro sulla 7.999.98"),
  (55, "PO-022/PO-064: «Le scene si pescano ancora da schede scritte»; DT-05 gesti riconosciuti da regex sui testi"),
  (40, "PO-033 «ancora davvero poco credibili»; PO-094 «teletrasporto»; PO-079"),
  (35, "DT-03: 203 rotazioni di ossa scritte a numero in `src/12`; 93 occorrenze di `Math.random` in `src/12`"),
  [CAP_PO("PO-033, PO-079, PO-094…")], "alta", "chiudere le 22 voci L1 (decisione PO 30/09)", ["PO-033", "PO-048", "PO-050", "PO-079", "PO-094", "PO-100", "PO-104", "PO-120", "PO-127", "PO-143", "PO-172", "PO-185", "PO-024", "PO-030", "PO-064", "PO-068", "PO-123", "PO-133"])
N("5.8", "Rigori di fine gara", "fase `shootout` (`src/15-live-match.jsx:10267`)", "pareggio in una gara a eliminazione", 1,
  (70, "serie di rigori"),
  (75, "PO-113 (7.999.58) e PO-130 (7.999.68) chiuse"),
  (40, "`rigori-58` (rosso `__CPM_NO_RIGORI58`) fuori catena"),
  (70, "—"), (None, NPC), (50, "dentro `src/15`"),
  [CAP_NOG], "media", "`rigori-58` in una catena", [])
N("5.9", "Fine gara: riepilogo, pagelle e tabellino", "fase `ended` (`src/15-live-match.jsx:11143`)", "fischio finale", 3,
  (80, "punteggio, tabellino, voti"),
  (60, "PO-034 statistiche sbagliate (7.999.10); PO-043 voto assurdo (7.999.17, .20, .29); PO-049"),
  (45, "`tabellino-lati`, `voto-volume` con rosso fuori catena; `griglia-mobile` misura il post-partita (censimento)"),
  (75, "—"), (None, NPC), (50, "—"),
  [CAP_NOG], "media", "`tabellino-schermo` o `tabellino-lati` in catena", [])
N("5.10", "Festa di fine partita", "`FestaFine942` (`src/15-live-match.jsx:934`, montata 15:10233)", "vittoria meritata, al fischio", 2,
  (75, "festa leggera con tabellone e coro"),
  (25, "PO-203 APERTA (eroe affonda nell'erba); PO-048 APERTA (palo in primo piano); ricorrenze: PO-135 (7.999.75, .77, .80), PO-117, PO-121"),
  (40, "`festa-942`, `festa-3d`, `festa-57`, `festa-79`, `mister-77` con rosso, tutti fuori catena"),
  (70, "—"), (45, "PO-203 e PO-048 dalle foto del PO"), (45, "corpi 3D in `src/12`"),
  [CAP_NOG, CAP_PO("PO-203, PO-048")], "media", "chiudere PO-203/PO-048 e un guardiano della festa in catena", ["PO-203", "PO-048"])
N("5.11", "Rassegna stampa post-partita", "schermata `postmatch` (18:6004) → `PostMatchPress` (`src/13-prepartita-formazioni.jsx:218`); `press` (18:6000) → `PressScreen` (13:321)", "chiusura della fine gara", 2,
  (80, "giornale con punteggio, statistiche, titoli"),
  (80, "PO-129 (7.999.67) chiusa"),
  (30, "nessun guardiano dedicato"),
  (75, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "media", "guardiano in catena grafica", [])
N("5.12", "Simula: la partita dell'eroe senza giocarla", "«Simula» → `simulateAndAdvance` (18:3083) → `simulaPartitaMotore` (`src/14-motore-possesso.jsx:1342`)", "scelta Gioca/Simula", 2,
  (80, "risultato, voto e statistiche dal motore"),
  (40, "goleade: PO-035, PO-090, PO-140, PO-179 chiuse; PO-190 PARZIALE; PO-202 APERTA"),
  (80, "`partita-vera` (completa); `rigori-190`, `debito-190` con rossi in catena carriera; `goleade` nella catena guardiani"),
  (75, "decisione «brain unico» (30/09)"), (50, "PO-190 «da confermare sul telefono»; PO-202"), (60, "funzione pura con seme"),
  [CAP_PO("PO-202")], "alta", "misura PO-202 e chiusura PO-190", ["PO-190", "PO-202", "PO-021"])

# ───────────────────────── 6 CLUB
ramo(6, "Club")
N("6.1", "Scheda Club", "linguetta `club` (18:9128): stadio, sponsor, piazzamenti, allenatore, staff, rosa, bacheca, spogliatoio", "barra «Club» (18:6025), tasto S", 3,
  (80, "otto sezioni a fisarmonica (18:9201-9461)"),
  (75, "PO-110 «12 allenatori che non tornano» (7.999.53) chiusa"),
  (30, "solo il censimento `griglia-mobile` (schermata `club`)"),
  (70, "fisarmoniche del kit"), (None, NPC), (55, "blocchi inline in 18"),
  [CAP_NOG], "media", "guardiano dei dati del club (rosa, staff, bacheca)", [])
N("6.2", "Presentazione al nuovo club", "schermata `clubPresentation` (18:5880) → `ClubPresentationScreen` (`src/16-scene-3d-cerimonie.jsx:3170`)", "dopo un trasferimento (`setScreen(\"clubPresentation\")`, 2 punti in 18)", 1,
  (75, "scena di benvenuto"),
  (80, "nessuna voce aperta"),
  (0, "nessun test la cita"),
  (60, "esistono due «presentazioni» diverse (questa e la serata 3D di 11.1)"), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "collaudo Codex con scheda dopo un trasferimento", [], ["Presentazione al nuovo club: nessuna verifica"])
N("6.3", "Numero di maglia", "`jerseyPickModal` (18:6123)", "assistente d'apertura, passo «maglia» (18:891)", 1,
  (75, "scelta del numero libero"),
  (80, "nessuna voce aperta"),
  (0, "`maglie-numero-test` riguarda i numeri nel 3D, non la scelta"),
  (75, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "media", "guardiano della scelta", [])

# ───────────────────────── 7 CARRIERA
ramo(7, "Carriera")
N("7.1", "Profilo", "linguetta `profile` (18:9534): statistiche, biografia, record, trofei, allenatori, rivale, stampa, stile, premi, contratto, attributi, timeline…", "barra «Carriera» (apre sul Profilo, 18:631), tasto R", 3,
  (80, "circa 25 sezioni a fisarmonica (18:9563-10379)"),
  (65, "PO-066 PARZIALE (Profilo da portare alla card neutra); PO-110 diario solo ultima stagione (7.999.53)"),
  (30, "solo il censimento `griglia-mobile` (`carriera-profilo`)"),
  (55, "PO-066; densità: 25 sezioni in una pagina"), (55, "PO-066 «da completare»"), (50, "blocchi inline in 18"),
  [CAP_NOG, CAP_PO("PO-066")], "media", "chiudere PO-066; guardiano dei numeri di carriera", ["PO-066"])
N("7.2", "Diario sfogliabile", "`DiarioSfoglia` (`src/18-career-app.jsx:85`, montato 18:10113)", "Profilo → «Diario di Carriera»", 1,
  (75, "diario fino a 80 voci"), (80, "nessuna voce aperta"), (0, "nessuno"), (75, "—"), (None, NPC), (65, "—"),
  [CAP_NOG], "bassa", "uno scatto in catena grafica", [])
N("7.3", "Traguardi (milestone e achievement)", "`MilestoneCelebrationModal` (`src/17-menu-creazione-pannelli.jsx:1761`, montata 18:6107), `CAREER_MILESTONES` (17:1257)", "al raggiungimento di un traguardo", 1,
  (75, "finestra di festa + elenco nel Profilo"), (80, "nessuna voce aperta"),
  (20, "`run-save-compat` controlla solo la compatibilità dei dati"), (70, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "guardiano dello scatto dei traguardi", [])
N("7.4", "Stile di gioco (archetipi)", "Profilo → «Stile di gioco» (18:9902); `ARCHETYPES` (`src/06-archetipi-agenti-sponsor.jsx`)", "Profilo", 2,
  (50, "PO-098: «Ridurre gli archetipi e dare a ciascuno un modo di giocare riconoscibile»; `__CPM_NO_STILI` non c'è"),
  (80, "nessun difetto aperto"), (0, "nessuno"), (50, "otto stili che non cambiano il gioco (PO-098)"), (None, NPC), (60, "—"),
  [CAP_NOG, CAP_PO("PO-098")], "media", "proposta PO-098 dopo la fase 1 Codex", ["PO-098", "PO-153"])

# ───────────────────────── 8 AGENTE E UFFICIO
ramo(8, "Agente e Ufficio")
N("8.1", "Agente (procuratore, mercato, contratto, cessione, prestito)", "linguetta `agente` (18:10409)", "barra «Agente» (18:6025), tasto G", 3,
  (80, "procuratore, finestra di mercato, contratto, cessione, prestito, compito, parere (18:10594-10922)"),
  (60, "PO-174 BLOCCANTE prestito chiusa (7.999.91); scheda rinominata tre volte (PO-015, PO-053); PO-181 «198 osservazioni di contratto oltre la scadenza»"),
  (40, "`agent-lifecycle-test`, `agent-relation-test`, `prestito-91` (rosso) fuori catena"),
  (70, "divisione Agente/Ufficio scelta dal PO (7.999.14)"), (None, NPC), (50, "blocco di 500 righe inline"),
  [CAP_NOG], "media", "guardiani dell'agente in una catena", ["PO-153"])
N("8.2", "Primo incontro col procuratore", "`agentIntro` (18:7715)", "riquadro in Home quando arriva il suggerimento (18:7795-7805)", 1,
  (80, "conoscenza, ambizione, firma"), (80, "PO-003 chiusa (7.983, 7.993)"),
  (40, "`agent-relation-test` fuori catena"), (75, "uniformato al Modal standard"), (None, NPC), (60, "—"),
  [CAP_NOG], "media", "guardiano in catena", [])
N("8.3", "Offerta di trasferimento e rifiuto", "`transferOffer` (18:6668), `refuseEvent` (18:6750); `generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:655`)", "a sorpresa durante la stagione (18:1182, 18:4499)", 2,
  (80, "situazione del club offerente prima di accettare (PO-005)"),
  (70, "PO-108 crescita delle offerte non applicata (7.999.50)"),
  (40, "`decisioni-50` (rossi `__CPM_NO_CRESC49`, `__CPM_NO_SCALATA50`) fuori catena"),
  (75, "—"), (None, NPC), (55, "probabilità non seedate (`Math.random()<offerProb`, 18:1182)"),
  [CAP_NOG], "media", "`decisioni-50` in catena", [])
N("8.4", "Trattativa del contratto", "`negoModal` (18:6775)", "rinnovo o offerta: «Tratta»", 2,
  (75, "proposta, controproposta, rifiuto"), (80, "nessuna voce aperta"), (0, "nessun test cita `negoModal`"), (70, "—"), (None, NPC), (55, "—"),
  [CAP_NOG], "bassa", "guardiano della trattativa; collaudo Codex", [], ["Trattativa del contratto: nessuna verifica"])
N("8.5", "Ufficio (patrimonio, staff privato, investimenti)", "linguetta `ufficio` (18:10409, `_uff13`: sezioni 18:10453-10482)", "barra «Ufficio» (18:6025), tasto U", 2,
  (60, "PO-157: «dare un effetto reale e visibile a ciò che resta, oppure togliere o accorpare»"),
  (80, "nessun difetto aperto"), (30, "solo il censimento `griglia-mobile` (`ufficio`)"),
  (55, "PO-157"), (None, NPC), (55, "—"),
  [CAP_NOG, CAP_PO("PO-157")], "media", "proposta PO-157 dopo la fase 1 Codex", ["PO-157", "PO-014"])

# ───────────────────────── 9 NAZIONALE
ramo(9, "Nazionale")
N("9.1", "Scheda Nazionale", "linguetta `nazionale` (18:10936)", "Carriera → «Nazionale» (18:7161)", 2,
  (65, "PO-155: «La convocazione è un tiro di dado settimanale… sistema rattoppato»"),
  (50, "PO-177 APERTA (10 stagioni, OVR 96, presenze sempre 0); PO-089, PO-114 chiuse"),
  (60, "`calendario-nazionale`, `career-nat-sim` nella catena guardiani (ultimo giro 7.999.98)"),
  (55, "PO-066: Nazionale da portare alla card neutra"), (None, NPC), (50, "—"),
  [CAP_PO("PO-177")], "media", "fase 1 Codex e proposta PO-155", ["PO-155", "PO-177", "PO-066"])
N("9.2", "Convocazione e partita in Nazionale", "schermata `nationalCallup` (18:6010) → `NationalCallupScreen` (`src/17-menu-creazione-pannelli.jsx:658`); `startNationalMatch` (18:5348)", "settimane della Nazionale (`setScreen(\"nationalCallup\")`)", 2,
  (70, "convocazione, CT della nazione"),
  (60, "PO-114 «il mister non cambia in nazionale» (7.999.55); PO-177 aperta"),
  (50, "`career-nat-sim` (catena guardiani); `ct-54` (rosso) fuori catena"),
  (70, "—"), (None, NPC), (55, "—"),
  [CAP_PO("PO-177")], "media", "`ct-54` in catena; proposta PO-155", ["PO-155", "PO-177"])
N("9.3", "Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale)", "`nationsCupModal` (18:7049), `euroMondiale` (riquadro 18:8314)", "settimana 20/24 secondo il ciclo (stab-nat-trigger)", 2,
  (70, "qualificazioni, gironi, eliminazione"),
  (20, "PO-183 BLOCCANTE (qualificazione Europeo vs Belgio rigiocata); 7.999.103 «sette giornate sparite durante l'Europeo»; PO-181 (7.999.104); 7.999.105; PO-090"),
  (80, "`coppa-nazioni` in `career-critical`; `euro-attesa-181`, `riquadro-euro-105`, `recupero-103` in catena carriera"),
  (65, "—"), (None, NPC), (50, "—"),
  [CAP_BLOC("PO-183")], "alta", "chiudere PO-183; fase 1 Codex", ["PO-183", "PO-155"])

# ───────────────────────── 10 MEDIA E RELAZIONI
ramo(10, "Media e relazioni")
N("10.1", "Intervista post-partita (3D)", "`interviewModal` (18:6351), `InterviewStage3D` (`src/16-scene-3d-cerimonie.jsx:323`), `InterviewScena2D` (16:230), `TavoloStampa24` (16:879)", "dopo la partita, in coda alle altre finestre (18:3766)", 2,
  (80, "domanda, rilancio per tono (PO-040), esito"),
  (65, "chiuse PO-008 (×2 release), PO-020, PO-040, PO-129, PO-138"),
  (40, "`giornaliste-169`, `intervista-2d` fuori catena; `conferenza-192` (catena carriera) copre solo le domande pre-partita"),
  (70, "foglio in basso quando c'è la scena (18:6351)"), (None, NPC), (50, "scena 3D in `src/16` (3.242 righe)"),
  [CAP_NOG], "media", "guardiano dell'intervista in catena", [])
N("10.2", "Esito dell'intervista", "`interviewFeedback` (18:6538)", "dopo l'ultima risposta", 1,
  (75, "effetti della risposta"), (80, "nessuna voce aperta"), (0, "nessuno"), (70, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "guardiano", [])
N("10.3", "Relazioni: spogliatoio, rivale, stampa", "Club → «Lo spogliatoio» (18:9461), Profilo → «Rivale» (18:9722), «La Stampa» (18:9814); eventi di spogliatoio (18:4014) e del rivale (18:4565)", "schede Club e Profilo; eventi settimanali", 2,
  (70, "compagni, rivale, giornalisti con memoria parziale"),
  (80, "nessuna voce aperta"),
  (20, "`critica-context-test` fuori catena"),
  (65, "PO-154: nessuna memoria negli impulsi"), (None, NPC), (55, "—"),
  [CAP_NOG], "bassa", "fase 1 Codex con metriche sulle relazioni", ["PO-154"])

# ───────────────────────── 11 CERIMONIE E SCENE 3D
ramo(11, "Cerimonie e scene 3D")
N("11.1", "Serata di presentazione della squadra", "`presEvent` (18:5802), `PresentationStage3D` (`src/16-scene-3d-cerimonie.jsx:1019`), `PresentazioneScena2D` (16:963)", "assistente d'apertura, passo «presentazione» (18:894)", 2,
  (80, "corpi CGTrader e figurina piccola «da televisione» (7.999.124)"),
  (70, "PO-200 chiusa in 7.999.124"),
  (70, "`presentazione-200` in catena grafica, rosso `__CPM_NO_PRES200`, verde su 7.999.126"),
  (70, "—"), (60, "PO-137 «tutte le scene 3D fuori dalla partita a qualità professionale» aperta"), (45, "PO-171: corpi CH38 ancora in cerimonie"),
  [CAP_PO("PO-137")], "alta", "collaudo PO di PO-200; PO-137", ["PO-137", "PO-171"])
N("11.2", "Premiazione di squadra in campo", "fase `ceremony` (`src/15-live-match.jsx:10241`), decisione `_titleStakes` (`src/18-career-app.jsx:5893`)", "fischio finale della gara che assegna il titolo", 2,
  (65, "PO-002 PARZIALE: «Il passaggio della coppa non è confermato»; PO-150 SOSPESO (cerimonie uguali per tutte le competizioni)"),
  (20, "PO-191 corretta in quattro release (7.999.116-119); 7.686 «trofeo a metà torneo»; `cerimonie` rosso dal 24/09 (PO-137); sul giro 7.999.126 `premiazione-palco-191` e `coppa-mani-191` ROSSI (11 e 2 campioni)"),
  (55, "quattro guardiani 191 con rosso in catena grafica, due ROSSI sull'ultimo giro; `cerimonie-test` rosso fuori catena"),
  (45, "decisione PO 30/09 «cerimonie diverse per competizione» non ancora applicata (sospesa a L8)"),
  (45, "PO-191 «eroe che vola», «coppa non in mano»; PO-137"),
  (40, "camera e corpi in `src/12`"),
  [CAP_PO("PO-002, PO-137, PO-150")], "alta", "chiudere PO-002/150/137 in L8; ripetere la catena grafica su macchina scarica", ["PO-002", "PO-137", "PO-150", "PO-071"])
N("11.3", "Festa del titolo (finestra)", "`titleCeleb` (18:6867): «COPPA VINTA!», «TRIONFO EUROPEO!»", "dopo un titolo (18:346)", 1,
  (75, "festa a schermo"), (75, "nessuna voce aperta"), (0, "nessuno"), (60, "terzo modo di festeggiare oltre a cerimonia in campo e parata"), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "decidere col PO se resta accanto alle cerimonie 3D", [])
N("11.4", "Galà dei premi", "schermata `seasonAwards` (18:5775) → `SeasonAwardsScreen` (`src/16-scene-3d-cerimonie.jsx:2193`) → `GalaStage3D` (16:1844), `GalaScena2D` (16:1827)", "fine stagione, prima della chiusura (18:5781)", 2,
  (85, "busta dal 3° al 1° a tocchi, per tutti i premi (7.999.125)"),
  (45, "decisione cambiata tre volte: PO-109 (7.999.51-52), PO-199 (7.999.124 e 7.999.125); PO-001"),
  (65, "`busta-199` (rossi `__CPM_NO_BUSTA199`, `__CPM_NO_TUTTI201`) in catena grafica, verde su 7.999.126"),
  (50, "`gala-3d.mjs` verifica ancora «Apri la busta porta DIRETTO al premio vinto», comportamento superato dalla decisione PO 03/10"),
  (60, "PO-137 aperta"), (45, "`src/16` 3.242 righe"),
  [CAP_PO("PO-137")], "alta", "aggiornare o ritirare `gala-3d`; collaudo PO 7.999.125", ["PO-137", "PO-199"], ["Guardiano `gala-3d` obsoleto (verifica la busta diretta, superata il 03/10)"])
N("11.5", "Podio della stagione", "`Podio23` (`src/16-scene-3d-cerimonie.jsx:2221`) dentro il galà", "galà dei premi", 1,
  (75, "podio con figurine"), (75, "PO-006, PO-007 chiuse"), (0, "nessun guardiano dedicato"), (70, "—"), (None, NPC), (55, "—"),
  [CAP_NOG], "bassa", "scatto in catena grafica", [])
N("11.6", "Parata del pullman", "`ParataCompleta198` (`src/16-scene-3d-cerimonie.jsx:1408`), `ParataBus3D` (16:1415), montata in `SeasonEndScreen` (16:2641)", "fine stagione da campione (`parata-test`)", 1,
  (75, "squadra CGTrader sul tetto (7.999.123)"),
  (55, "PO-009 (7.982) e PO-198 (7.999.123): rifatta due volte"),
  (70, "`parata-198` (rosso `__CPM_NO_PARATA198`) in catena grafica, verde su 7.999.126"),
  (70, "—"), (55, "PO-137 aperta"), (45, "—"),
  [CAP_PO("PO-137")], "alta", "collaudo PO della 7.999.123", ["PO-137"])
N("11.7", "Stadi 3D", "`buildStadium` (`src/11-ui-kit-highlight.jsx:693`), `makeCrowdTex` (11:372), folla (`src/10`)", "in ogni scena 3D", 2,
  (70, "PO-071: fase 3 (nuove tipologie) senza release"),
  (75, "nessun difetto aperto; PO-127 «tribune da dietro» è della regia"),
  (40, "`stadi-70`, `pali-69` con rossi e `galleria-stadi` fuori catena"),
  (70, "—"), (50, "PO-071 «la grafica degli stadi deve essere migliorata il più possibile»"), (45, "—"),
  [CAP_NOG, CAP_PO("PO-071")], "media", "fase 3 di PO-071; `stadi-70` in catena", ["PO-071"])

# ───────────────────────── 12 FINE STAGIONE E CARRIERA
ramo(12, "Fine stagione e fine carriera")
N("12.1", "Fine stagione", "schermata `seasonEnd` (18:5874) → `SeasonEndScreen` (`src/16-scene-3d-cerimonie.jsx:2634`); `doStartNewSeason` (18:4801)", "dopo il galà (18:5781)", 3,
  (80, "bilancio, parata se campione, nuova stagione o ritiro"),
  (55, "PO-174 BLOCCANTE fine prestito (7.999.91); PO-193 «settimana 39 di 38» (7.999.113); PO-186"),
  (55, "`career-invariants` (cambio stagione) in `career-critical`; `career-sim-test`, `prestito-91`, `retire-announce-test` fuori catena"),
  (75, "—"), (None, NPC), (50, "—"),
  [], "media", "`career-sim-test` (N stagioni) in catena", ["PO-153"])
N("12.2", "Annuncio del ritiro e stagione d'addio", "passo «addio» dell'assistente (18:897), conferma (18:10180), `doRetire` (18:4790)", "dai 34 anni a inizio stagione; dal Profilo", 1,
  (75, "annuncio, stagione d'addio, ritiro"), (80, "nessuna voce aperta"),
  (40, "`retire-announce-test` fuori catena"), (75, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "media", "`retire-announce-test` in catena", [])
N("12.3", "Fine carriera", "schermata `careerEnd` (18:5793) → `CareerEndScreen` (`src/17-menu-creazione-pannelli.jsx:790`), `calcLegacyScore` (17:727)", "ritiro; un salvataggio ritirato apre sempre questa pagina (18:5795)", 2,
  (75, "pagina celebrativa con punteggio di eredità"),
  (75, "nessuna voce aperta"),
  (20, "nessun guardiano del flusso (`slot-card-layout-test` cita solo lo stato)"),
  (75, "—"), (None, NPC), (60, "ricostruisce i dati dal salvataggio (7.258)"),
  [CAP_NOG], "bassa", "collaudo Codex con scheda di una carriera fino al ritiro", [], ["Fine carriera: nessun guardiano del flusso fino al ritiro"])
N("12.4", "Nuova partita+ (eredità)", "`onNewGamePlusCB` (`src/19-app-root.jsx:955`) → `CreateScreen` con `legacyBonus` (19:951)", "dalla pagina di fine carriera", 1,
  (65, "bonus passato alla creazione"), (80, "nessuna voce in BACKLOG.md"), (0, "nessuno"), (None, NPC), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "collaudo Codex", [])

# ───────────────────────── 13 SISTEMI TRASVERSALI
ramo(13, "Sistemi trasversali")
N("13.1", "Motore della partita (brain)", "`src/14-motore-possesso.jsx`: `simulaPartitaMotore` (14:1342), `probEroe` (14:1316)", "ogni partita, simulata o vissuta", 3,
  (65, "PO-022/PO-064 parziali (la scena non nasce ancora dal motore); PO-030 manovre assenti; PO-031 metriche"),
  (30, "PO-021 e PO-190 PARZIALI; PO-202 APERTA; goleade ricorrenti (PO-035, PO-090, PO-140, PO-179)"),
  (85, "`partita-vera` e `test:logic` (`motore-possesso.test.mjs`) in completa; `rigori-190`, `debito-190` in carriera; `goleade`, `motore-unico`, `brain-82` nei guardiani"),
  (60, "«brain unico» fatto per `probEroe` (7.999.82), non per il render (PO-064)"),
  (50, "PO-202 «troppo sbilanciate le partite, non sono tirate»"),
  (65, "1.356 righe, 1 riga con `Math.random`; seme deterministico (`sim-motore-test`: «stesso seme ⇒ stessa partita»)"),
  [CAP_PO("PO-202")], "alta", "chiudere PO-021/022/064/190/202", ["PO-021", "PO-022", "PO-030", "PO-031", "PO-064", "PO-190", "PO-202"])
N("13.2", "Simulazione delle altre partite e classifiche", "`simulateMatch` (`src/10-folla-stadi-ritiro.jsx:866`), `updateStandings` (`src/09-audio-scout-anagrafiche.jsx:1391`)", "ogni avanzamento di settimana", 3,
  (80, "risultati di tutte le leghe"),
  (55, "PO-175 (7.999.94), PO-182 BLOCCANTE (7.999.102) chiuse"),
  (85, "`career-invariants`, `classifica-102` in catena; `sim-motore-test` (rosso `__CPM_NO_SIMV2`)"),
  (75, "`simulateMatch(...,{motore:true})` = motore unico (`sim-motore-test`)"), (None, NPC), (55, "—"),
  [], "alta", "fase 1 Codex senza anomalie", ["PO-153"])
N("13.3", "Salvataggi e migrazioni", "`storage` (`src/08-panchina-derby-meteo-cori.jsx:576`), `SAVE_VERSION=9` (`src/07-versione-save-interviste.jsx:457`), `migratePlayer` (`src/17-menu-creazione-pannelli.jsx:1885`)", "salvataggio automatico a ogni cambio (3 slot `cpm-v3*`)", 3,
  (70, "PO-167: niente `navigator.storage.persist()`, nessun backup né copia dello slot"),
  (25, "PO-183 BLOCCANTE IN CORSO; PO-176 PARZIALE; rischi R-01…R-04"),
  (85, "`save-compat`, `save-monotonic` (P0_2), `pending-mr-durable`, `playedmd-registry` in catena"),
  (70, "—"), (None, NPC),
  (40, "R-02: `storage.save` cattura l'errore e restituisce `false` senza avviso (08:597)"),
  [CAP_BLOC("PO-183")], "alta", "L3 (PO-167, PO-168) e chiusura PO-183/PO-176", ["PO-183", "PO-176", "PO-167"])
N("13.4", "Calendario e competizioni (generazione)", "`generateSeasonCalendar` (`src/09-audio-scout-anagrafiche.jsx:999`), innesco dei tornei (`stab-nat-trigger-test.mjs`)", "inizio stagione", 2,
  (80, "campionato, coppe, finestre della Nazionale"),
  (40, "PO-089, PO-181 (7.999.104), 7.999.103, 7.999.106, 7.999.107: cinque correttive in 30 release"),
  (85, "`career-invariants`, `recupero-103`, `avversario-106`, `rinvio-coppe-107` in catena carriera"),
  (70, "—"), (None, NPC), (50, "—"),
  [], "alta", "fase 1 Codex con 30 carriere", ["PO-153", "PO-183"])
N("13.5", "Mercato e contratti", "`generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:655`), `generateProContracts` (06:724)", "offerte in stagione e a fine Under 18", 2,
  (75, "offerte, rinnovi, prestiti"),
  (65, "PO-181 «198 osservazioni di contratto oltre la scadenza»; PO-108 (7.999.50)"),
  (40, "`decisioni-50` fuori catena"), (70, "—"), (None, NPC), (55, "—"),
  [CAP_NOG], "media", "guardiano del contratto scaduto in catena", ["PO-153", "PO-157"])
N("13.6", "Crescita del giocatore e difficoltà", "allenamento automatico (18:3060), crescita a fine gara (18:3726), `adaptiveDifficulty` (`src/06-archetipi-agenti-sponsor.jsx:60`)", "ogni settimana e partita", 2,
  (65, "PO-156 difficoltà unica tarata sulla carriera: in attesa"),
  (65, "PO-177 «OVR fino a 96»"),
  (30, "`career-sim-test` fuori catena"),
  (55, "`adaptiveDifficulty` accanto alla decisione «difficoltà unica»; vista Allenamento orfana (3.8)"), (None, NPC), (55, "—"),
  [CAP_NOG], "media", "proposta PO-156 dopo la fase 1", ["PO-156", "PO-177"])
N("13.7", "Generazione club, rose e nomi", "`CLUBS` (`src/02-club-leghe-albo.jsx:24`), `generateTeamRoster` (`src/09-audio-scout-anagrafiche.jsx:963`), `NAME_BY_NAT` (09:900)", "inizio partita e stagione", 2,
  (80, "nove leghe, rose deterministiche"),
  (80, "PO-184 nomi sopra i corpi (7.999.102) chiusa"),
  (60, "`nomi-51` (rossi) nella catena guardiani; `audit-copyright` non in CI"),
  (75, "—"), (None, NPC), (60, "—"),
  [], "media", "`audit-copyright` in CI prima dello store", [])
N("13.8", "Audio", "`AudioMgr` (`src/09-audio-scout-anagrafiche.jsx:38`), `AudioSettings` (`src/19-app-root.jsx:633`)", "sempre; regolazioni nelle Impostazioni", 1,
  (70, "musica, effetti, pubblico, arbitro"), (80, "nessuna voce aperta"), (0, "`grep AudioMgr tests/visual` = 0 file"), (None, NPC), (None, NPC), (55, "—"),
  [CAP_NOG], "bassa", "collaudo sul telefono; guardiano dei volumi", [], ["Audio: nessun guardiano né collaudo registrato"])
N("13.9", "Prestazioni", "misura in Impostazioni (18:6053, limite 300 ms), `lib/perf-monitor.mjs` (gate)", "—", 2,
  (50, "PO-023: FPS e caricamento sul telefono non misurati"),
  (None, NPC), (30, "R-07: «l'headless non misura gli FPS veri»"), (None, NPC), (None, NPC),
  (40, "file unico 6,5 MB, Babel nel browser (ARCHITETTURA.md)"),
  [CAP_NOG, CAP_PO("PO-023")], "bassa", "PO-023: misura sul telefono a fine lotto", ["PO-023"])
N("13.10", "Gestione degli errori", "`RootErrorBoundary` (`src/19-app-root.jsx:1001`), `MatchErrorBoundary` (`src/13-prepartita-formazioni.jsx:1525`)", "—", 2,
  (40, "PO-168: nessun `window.onerror` né `unhandledrejection` (0 occorrenze, verificato)"),
  (None, NPC), (0, "nessuno"), (60, "R-06"), (None, NPC), (40, "errori sul telefono invisibili (R-06)"),
  [CAP_NOG, CAP_PO("PO-168")], "media", "L3 Parte C (PO-168)", ["PO-168"])
N("13.11", "Build web e store", "`tools/build-dist.mjs`, `tools/validate-dist.mjs`, `capacitor.config.json`, `tools/audit-copyright.mjs`", "—", 2,
  (70, "build precompilata senza CDN; il sito serve la build (7.999.11)"),
  (75, "nessuna voce aperta"),
  (30, "`validate-dist` non in CI (ARCHITETTURA.md); `dist-web-partita-test` fuori catena"),
  (70, "—"), (None, NPC), (55, "R-08 licenze degli asset non verificate"),
  [CAP_NOG], "media", "`validate-dist` e `audit-copyright` in CI; inventario licenze", [], ["`validate-dist` e `audit-copyright` nella CI"])
N("13.12", "Corpi, clip e gesti 3D", "corpi CGTrader e clip (src/12); copertura gesti", "in highlight e cerimonie", 2,
  (55, "PO-024: copertura gesti 49%, 30/46 varianti; PO-070, PO-075 parziali"),
  (55, "PO-201 in corso (7.999.126); PO-171 parziale"),
  (70, "`gesti-copertura-96` (guardiani), `guanti-201` (grafica, rosso `__CPM_NO_GUANTI_PO201`, verde su 7.999.126)"),
  (50, "PO-171 «Via CH38 ovunque» parziale; DT-04 due modi di muovere le braccia"),
  (50, "PO-061 kit «migliorabile»"), (40, "DT-03 203 rotazioni a numero"),
  [CAP_PO("PO-061, PO-201")], "alta", "chiudere PO-068/070/075/171", ["PO-024", "PO-061", "PO-068", "PO-070", "PO-075", "PO-171", "PO-201"])
N("13.13", "Kit grafico e tema", "`Card`, `Btn`, `Modal`, `Tabs`, `Fisarmonica` (`src/11-ui-kit-highlight.jsx:42-348`), token `TH`/`FS`/`RAD` (src/01)", "ogni schermata", 2,
  (80, "kit unico, tema chiaro/scuro"),
  (70, "PO-066 parziale; PO-188 seconda segnalazione"),
  (75, "`design-system` in completa e grafica (verde 7.999.126); `griglia-mobile` (censimento)"),
  (70, "PO-066"), (65, "PO-188, PO-066"), (60, "—"),
  [CAP_PO("PO-066")], "alta", "chiudere PO-066", ["PO-066", "PO-188"])

# ───────────────────────── CALCOLO
def media(n):
    num = den = 0
    for k, _, w in PESI:
        v = n["crit"][k][0]
        if v is not None:
            num += v * w; den += w
    raw = num / den if den else 0
    cop = den
    # [decisione PO 03/10, questionario] un nodo senza Resa misurata non supera il 75%
    if n["crit"]["R"][0] is None and not any(c[0] == 75 and "Resa" in c[1] for c in n["caps"]):
        n["caps"] = list(n["caps"]) + [(75, "Resa non misurata sullo schermo (decisione PO 03/10)")]
    capv = min([c[0] for c in n["caps"]] or [100])
    fin = min(raw, capv)
    return raw, fin, capv, cop

for r in RAMI:
    for n in r["nodi"]:
        n["raw"], n["team"], n["capv"], n["cop"] = media(n)
        n["team"] = int(round(n["team"]))
    nodi = [n for n in r["nodi"] if n["peso"] > 0]
    W = sum(n["peso"] for n in nodi)
    r["team"] = int(round(sum(n["team"] * n["peso"] for n in nodi) / W))
    af = {"alta": 0, "media": 0, "bassa": 0}
    for n in nodi: af[n["aff"]] += n["peso"]
    r["aff"] = max(af, key=lambda k: af[k]); r["affq"] = {k: round(100 * v / W) for k, v in af.items()}

GIOCO = int(round(sum(r["team"] for r in RAMI) / len(RAMI)))
# [decisione PO 03/10] si mostrano entrambe: media semplice e media pesata per tempo di gioco
PR = {1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 2}
ALT = int(round(sum(r["team"] * PR[r["num"]] for r in RAMI) / sum(PR.values())))
tutti = [n for r in RAMI for n in r["nodi"]]
pesati = [n for n in tutti if n["peso"] > 0]
afg = {"alta": 0, "media": 0, "bassa": 0}
for n in pesati: afg[n["aff"]] += 1

import re as _re1
_bl1 = open("/home/user/cm-poc/docs/governo/BACKLOG.md", encoding="utf-8").read().split("## Storico")[0]
_AP1 = set(_re1.findall(r"^\| (PO-\d+) \|", _bl1, _re1.M))
for n in tutti:
    if n["peso"] > 0 and n["team"] < 80 and not n["aprire"] and not any(v in _AP1 for v in n["voci"]):
        n["aprire"] = ["Consolidamento di «" + n["nome"] + "»: " + n["manca"]]
# ───────────────────────── SCRITTURA
L = []
P = L.append
P("# MAPPA DEL GIOCO — build 7.999.126 — 03/10/2026")
P("")
P(f"Consolidamento complessivo: **{GIOCO}% (Team {GIOCO}%)** media semplice dei rami · **{ALT}%** pesata per tempo di gioco (Partita ×3; Home, Stagione, Sistemi ×2) — entrambe per decisione PO del 03/10 (affidabilità: {afg['alta']} nodi alta · {afg['media']} media · {afg['bassa']} bassa su {len(pesati)} nodi nel conto; nessun valore PO ancora)")
P("")
P("> **Limiti di questa stesura (PO-205, prima versione).** Albero generato **dal codice** (`grep` su `src/*.jsx`: stati `screen`/`setScreen`, fasi `phase` di `App`, `LiveMatch` e `TrialFlow`, linguette `tab`, finestre `…Modal` e overlay di `CareerApp`, componenti di scena 3D) e dai documenti di governo (`BACKLOG.md`, `ROADMAP.md`, `DECISIONI.md`, `RISCHI.md`, `ARCHITETTURA.md`, `STABILITA.json`). **La verifica navigando il gioco NON è stata fatta** (macchina occupata dai collaudi, nessun browser): per questo il criterio **Resa** ha un punteggio solo dove esiste una misura o una segnalazione del PO, altrove è «Non posso confermarlo». La versione 7.999.126 è la release in corso (guanti dei portieri, formazioni). I numeri di riga valgono per questa build.")
P("")
P("## Legenda e griglia")
P("")
P("**Sei criteri, punteggio 0-100 ciascuno, ognuno con una riga di prova.**")
P("")
P("| Criterio | Peso | Come si dà il punteggio |")
P("|---|---:|---|")
P("| Funzione | 25% | 90+ completa e raggiungibile, tutto ciò che il PO ha chiesto c'è · 70-89 completa con lacune note · 50-69 parziale · <50 incompleta o non raggiungibile (letto nel codice) |")
P("| Stabilità | 20% | parte da 100: −15 per ogni difetto aperto/parziale/da collaudare sul nodo, −25 per un bloccante aperto, −10 per ogni correzione ripetuta (stesso difetto riaperto o corretto in più release) nel registro recente (7.999.98 → 7.999.126) o per un rosso sull'ultimo giro di `STABILITA.json`. Le voci chiuse da tempo pesano meno (giudizio dichiarato) |")
P("| Test | 15% | 0 nessuno · 20-30 solo sonde o censimenti senza soglia (`griglia-mobile`) o test fuori catena senza rosso · 40-50 guardiani con interruttore rosso `__CPM_NO_*` ma **fuori** dalle catene · 55-75 guardiano con rosso **dentro** una catena di `tests/visual/ci-runner.mjs` (completa, carriera, grafica, guardiani) · 80-90 più guardiani in catena che coprono il flusso principale, ultimo giro verde · −10 se l'ultimo giro è rosso |")
P("| Coerenza | 15% | rispetto delle decisioni PO (`DECISIONI.md`), stesso kit delle altre schermate, niente codice morto o guardiani che verificano un comportamento superato |")
P("| Resa | 15% | solo da misure o segnalazioni del PO (foto, collaudi). Senza prove: «Non posso confermarlo», criterio **senza punteggio** |")
P("| Solidità tecnica | 10% | dimensione e intreccio del codice, `Math.random()` non seedati, gestione degli errori, strumentazione di test in produzione (`ARCHITETTURA.md`, DT-01…09) |")
P("")
P("**Calcolo.** Schermata (nodo) = media pesata dei criteri **che hanno un punteggio** (i pesi dei criteri senza punteggio non entrano: la colonna «prova» dice quanta parte del peso è coperta). Poi si applicano i **tetti**: difetto bloccante aperto → massimo 50% · nessun guardiano in una catena di `ci-runner.mjs` → massimo 70% · segnalazione di collaudo PO aperta sul nodo → massimo 80%. Ramo = media dei nodi pesata per **importanza** (3 = cuore del ciclo di gioco, 2 = frequente, 1 = raro o accessorio, 0 = solo sviluppo, fuori dal conto). Gioco = **media semplice** dei 13 rami.")
P("")
P("**Affidabilità** — alta: il nodo è coperto da un guardiano in catena o da una misura registrata · media: punteggi letti nel codice e nei documenti · bassa: prevale il giudizio (nessun guardiano, nessuna segnalazione, criteri senza punteggio).")
P("")
P("**Valori.** `Team` = la nostra stima. `PO: __%` = spazio per il valore del PO (con nota). **Valore valido = PO se presente, altrimenti Team.** Rami e gioco si scrivono `NN% (Team MM%)`: oggi nessun valore PO esiste, quindi NN = MM.")
P("")
P("**Interpretazione dichiarata dei tetti.** «Nessun guardiano» = nessun guardiano che giri in una catena di `ci-runner.mjs`: un guardiano col rosso che nessuno lancia non protegge (PO-178: 8 su 19 erano rossi senza che nessuno se ne accorgesse). «Segnalazione PO aperta» = voce aperta o parziale in `BACKLOG.md` nata da una richiesta o una foto del PO che riguarda il nodo.")
P("")
P("**Correzioni proposte alla griglia (in attesa del PO, non applicate):**")
P("1. *Resa senza prova.* Escludere il criterio (come oggi) gonfia i nodi mai guardati: proposta di contarla 50 oppure di porre un tetto 75% ai nodi con Resa non verificata. Oggi 51 nodi su 66 hanno la Resa senza punteggio.")
P("2. *Peso dei rami nel valore del gioco.* La media semplice dà a «Club» (3 nodi) lo stesso peso di «Partita» (12 nodi, dove il giocatore passa la maggior parte del tempo). Proposta: pesare i rami per tempo di gioco (Partita ×3, Home e ciclo ×2, Stagione ×2, Sistemi ×2, gli altri ×1). Con quei pesi il gioco varrebbe " + "{ALT}" + "%.")
P("3. *Stabilità.* Oggi è una formula applicata a mano sulle voci del backlog: andrebbe calcolata da uno script su `BACKLOG.md` + `STABILITA.json` per nodo (serve una colonna «nodo» nel backlog).")
P("")
P("**Regole di aggiornamento.**")
P("- La mappa si aggiorna **a ogni fine lotto** (e a ogni release che chiude una voce collegata, se il PO lo chiede).")
P("- Il team cambia **solo i valori Team**; i valori **PO non si toccano mai** (li scrive solo il PO).")
P("- Ogni variazione si mostra come `NN% → MM%` accanto al nodo, al ramo e al gioco, per una sola stesura (poi resta il valore nuovo).")
P("- Se il valore PO è **più basso di Team di 15 punti o più**, il team scrive un'analisi dello scarto nella scheda del nodo e apre una voce in `BACKLOG.md`.")
P("- I numeri di riga si rigenerano con `grep` a ogni aggiornamento; un nodo nuovo nel codice (nuovo `setScreen`, nuova finestra) entra nell'albero alla stesura successiva.")
P("")

# Albero
P("## Albero")
P("")
P("```")
P(f"Korward Elite 7.999.126 — {GIOCO}% (Team {GIOCO}%)")
for i, r in enumerate(RAMI):
    lastr = i == len(RAMI) - 1
    pr = "└── " if lastr else "├── "
    P(f"{pr}{r['num']} {r['nome']} — {r['team']}% (Team {r['team']}%) [{r['aff']}]")
    for j, n in enumerate(r["nodi"]):
        lastn = j == len(r["nodi"]) - 1
        ind = "    " if lastr else "│   "
        pn = "└── " if lastn else "├── "
        extra = " (peso 0, fuori dal conto)" if n["peso"] == 0 else ""
        P(f"{ind}{pn}{n['id']} {n['nome']} — Team {n['team']}% [{n['aff']}] · PO: __%{extra}")
P("```")
P("")
P("| Ramo | Valore | Nodi | Pesi dei nodi (importanza) | Affidabilità (quota del peso) |")
P("|---|---:|---:|---|---|")
for r in RAMI:
    pes = ", ".join(f"{n['id']}×{n['peso']}" for n in r["nodi"])
    q = r["affq"]
    P(f"| {r['num']} {r['nome']} | {r['team']}% (Team {r['team']}%) | {len(r['nodi'])} | {pes} | alta {q['alta']}% · media {q['media']}% · bassa {q['bassa']}% |")
P("")

# Schede
import re as _re0
_bl0 = open("/home/user/cm-poc/docs/governo/BACKLOG.md", encoding="utf-8").read().split("## Storico")[0]
_AP0 = set(_re0.findall(r"^\| (PO-\d+) \|", _bl0, _re0.M))
def _fmt0(v): return v if v in _AP0 else v + " (chiusa)"
P("## Schede dei nodi")
P("")
for r in RAMI:
    P(f"### Ramo {r['num']} — {r['nome']} — {r['team']}% (Team {r['team']}%)")
    P("")
    for n in r["nodi"]:
        P(f"#### {n['id']} {n['nome']} — Team {n['team']}% [{n['aff']}] · PO: __%")
        P("")
        P(f"- **Nel codice:** {n['ident']}")
        P(f"- **Come ci si arriva:** {n['come']}")
        P(f"- **Importanza nel ramo:** {n['peso']}")
        P("")
        P("| Criterio | Punti | Prova |")
        P("|---|---:|---|")
        for k, nome, w in PESI:
            v, prova = n["crit"][k]
            P(f"| {nome} ({w}%) | {'—' if v is None else v} | {prova} |")
        caps = "; ".join(f"max {c[0]}% ({c[1]})" for c in n["caps"]) or "nessuno"
        P(f"| **Media pesata** | {n['raw']:.0f} | peso coperto da prove: {n['cop']}% |")
        P(f"| **Tetto** | {n['capv'] if n['caps'] else '—'} | {caps} |")
        P(f"| **Team** | **{n['team']}** | PO: __% · nota: |")
        P("")
        P(f"**Cosa manca per arrivare al 90%:** {n['manca']}.")
        P("")
        P(f"**Voci del backlog collegate:** {', '.join(_fmt0(v) for v in n['voci']) if n['voci'] else 'nessuna'}." + (f" Voce da aprire: {'; '.join(n['aprire'])}." if n['aprire'] else ""))
        P("")

# Elenchi
ord_ = sorted(pesati, key=lambda n: (n["team"], -n["peso"]))
P("## Elenchi")
P("")
P("### 1. I 10 nodi più deboli")
P("")
P("| # | Nodo | Team | Cosa manca |")
P("|---:|---|---:|---|")
for i, n in enumerate(ord_[:10], 1):
    P(f"| {i} | {n['id']} {n['nome']} | {n['team']}% | {n['manca']} |")
P("")
P("### 2. I 10 nodi più solidi")
P("")
P("| # | Nodo | Team | Punti per criterio (F·S·T·C·R·So) e prova del Test |")
P("|---:|---|---:|---|")
for i, n in enumerate(sorted(pesati, key=lambda n: (-n["team"], -n["peso"]))[:10], 1):
    pts = " · ".join(f"{k} {'—' if n['crit'][k][0] is None else n['crit'][k][0]}" for k, _, _ in PESI)
    capt = f" — tetto {n['capv']}%" if n["caps"] else ""
    P(f"| {i} | {n['id']} {n['nome']} | {n['team']}% | {pts}{capt}. Test: {n['crit']['T'][1]} |")
P("")
P("### 3. Nodi a bassa affidabilità e come misurarli")
P("")
P("| Nodo | Team | Cosa servirebbe per misurarlo |")
P("|---|---:|---|")
for n in tutti:
    if n["aff"] == "bassa":
        P(f"| {n['id']} {n['nome']} | {n['team']}% | {n['manca']} |")
P("")
P("### 4. Scarti PO/Team")
P("")
P("Nessun valore PO ancora.")
P("")

# Collegamenti
P("## Collegamenti")
P("")
P("Ogni nodo sotto l'80% e le voci di `BACKLOG.md` che lo riguardano. «(chiusa)» = voce dello storico, citata perché è la storia del nodo; dove nessuna voce aperta copre il nodo, il rimando va a «Voci da aprire».")
P("")
P("| Nodo | Team | Voci PO collegate |")
P("|---|---:|---|")
import re as _re
_bl = open("/home/user/cm-poc/docs/governo/BACKLOG.md", encoding="utf-8").read().split("## Storico")[0]
APERTE = set(_re.findall(r"^\| (PO-\d+) \|", _bl, _re.M))
def _fmt(v): return v if v in APERTE else v + " (chiusa)"
aprire = []
for n in tutti:
    if n["peso"] > 0 and n["team"] < 80:
        vv = ", ".join(_fmt(v) for v in n["voci"]) if n["voci"] else ""
        if n["aprire"]: vv = (vv + " · " if vv else "") + "voce da aprire n. {AP" + n["id"] + "}"
        P(f"| {n['id']} {n['nome']} | {n['team']}% | {vv} |")
    for a in n["aprire"]:
        aprire.append((n["id"], a))
P("")
P("### Voci da aprire (in attesa del PO)")
P("")
P("Non scritte in `BACKLOG.md`: le apre il PO o le autorizza.")
P("")
_apn = {}
for i, (nid, a) in enumerate(aprire, 1):
    P(f"{i}. **{a}** — nodo {nid}.")
    _apn.setdefault(nid, []).append(str(i))
extra = [
 ("trasversale", "Catena `guardiani` non rieseguita dalla 7.999.98 (01/10): 28 release senza giro (STABILITA.json)"),
 ("trasversale", "Giro grafico 7.999.126: `rimbalzo-189`, `premiazione-palco-191`, `coppa-mani-191` rossi per campioni insufficienti (4 disegni su 8 richiesti, 11 campioni su 20, 2 su 10: `const ok` dei tre guardiani) — da ripetere su macchina scarica e rendere i guardiani robusti al carico; `walkout-fermi-197` rosso invece sulla misura (verde: somma 10 contro un massimo di 5,3 = un terzo del rosso 16), coerente con PO-206"),
 ("trasversale", "Componenti definiti e mai montati: `AIDecisionOverlay` (src/13:425), `Player3DViewer` (src/01:732), `AISettingsCard` (src/17:589)"),
 ("trasversale", "BACKLOG.md: PO-201 e PO-204 risultano «DA FARE» ma la 7.999.126 li consegna (ROADMAP.md)"),
]
for j, (nid, a) in enumerate(extra, len(aprire) + 1):
    P(f"{j}. **{a}** — {nid}.")
P("")

# Autocritica
P("## Autocritica")
P("")
P("**Rami che sembravano «a posto» e che la griglia mostra non esserlo.**")
P("- *Stagione e ciclo settimanale.* `career-critical` e la catena carriera sono verdi su ogni giro recente, ma la stabilità è bassa: la «partita già giocata» è alla nona ricorrenza documentata (07:114) più PO-194 e PO-183 ancora in corso. Verde dei guardiani ≠ stabile: i guardiani coprono i casi già visti.")
P("- *Cerimonie.* Molte release recenti (7.999.116-125) le hanno «chiuse», ma ogni chiusura è una correzione di un rilievo del PO sulla stessa scena; due guardiani su quattro della premiazione sono rossi sull'ultimo giro (per pochi campioni: la correzione non è smentita, ma nemmeno confermata) e `gala-3d` verifica un comportamento ormai superato.")
P("- *Percorso iniziale.* Funziona e nessuno lo segnala, ma creazione, provini e auto-ripresa non hanno un guardiano in catena e la ripresa è spenta proprio sotto `cpmtest=1`: è «a posto» perché nessuno lo guarda.")
P("- *Club, Carriera, Agente/Ufficio.* Le schede sono misurate solo dal censimento `griglia-mobile`, che non può diventare rosso: i valori di Test sono bassi e il tetto 70% vale quasi ovunque.")
P("")
P("**Dove la stima dipende solo dal giudizio e potrebbe essere ottimista.**")
P("- *Funzione* delle linguette (Club, Profilo, Agente, Ufficio, Nazionale): letta dal codice, non navigata. Una sezione può esistere nel codice ed essere vuota o rotta a schermo.")
P("- *Resa esclusa* dove manca una prova: 51 nodi su 66 la hanno senza punteggio e la loro media si calcola sugli altri criteri. Se la Resa reale fosse bassa i valori scenderebbero (vedi correzione 1).")
P("- *Stabilità «nessuna voce aperta» = 75-85*: l'assenza di segnalazioni su nodi rari (Tutorial, Nuova partita+, Fine carriera, Trattativa) può voler dire solo che il PO non ci è ancora arrivato.")
P("- *Solidità*: giudizio sul file unico, non una metrica per nodo.")
P("- *Pesi d'importanza*: scelti dal team; con pesi diversi i rami cambiano di qualche punto.")
P("")

txt = "\n".join(L) + "\n"
for nid, nums in _apn.items():
    txt = txt.replace("{AP" + nid + "}", ", ".join(nums))
# valore alternativo con pesi per tempo di gioco
txt = txt.replace("{ALT}", str(ALT))
nRnull = sum(1 for n in tutti if n["crit"]["R"][0] is None)
txt = txt.replace("51 nodi su 66", f"{nRnull} nodi su {len(tutti)}")
open("/home/user/cm-poc/docs/governo/MAPPA_GIOCO.md", "w", encoding="utf-8").write(txt)

print("GIOCO", GIOCO, "ALT", ALT, "nodi", len(tutti), "pesati", len(pesati), "aff", afg, "Rnull", nRnull)
for r in RAMI: print(r["num"], r["nome"], r["team"], r["aff"])
print("deboli", [(n["id"], n["team"]) for n in ord_[:10]])
print("solidi", [(n["id"], n["team"]) for n in sorted(pesati, key=lambda n: (-n["team"], -n["peso"]))[:10]])
print("bassa", [n["id"] for n in tutti if n["aff"] == "bassa"])
