# -*- coding: utf-8 -*-
# Generatore di docs/governo/MAPPA_GIOCO.md — dati raccolti con grep sul codice e sui documenti di governo.
import math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # [7.999.173] percorsi relativi al repo (erano assoluti su /home/user/cm-poc)
OUT = os.environ.get("MAPPA_OUT", os.path.join(ROOT, "docs/governo/MAPPA_GIOCO.md"))

PESI = [("F", "Funzione", 25), ("S", "Stabilità", 20), ("T", "Test", 15), ("C", "Coerenza", 15), ("R", "Resa", 15), ("So", "Solidità tecnica", 10)]
NPC = "Non posso confermarlo"
BUILD, DATA = "7.999.173", "18/10/2026"   # [PO-205] stesura del giro 68 (in src/07 GAME_VERSION legge ancora 7.999.172: la 173 è il lotto in corso)
PREV_BUILD = "7.999.126"
# valori Team della stesura 7.999.126 (03/10), letti dall'albero di quella MAPPA_GIOCO.md: servono per la regola «NN% → MM%»
PREV_NODI = {'1.1': 66, '1.2': 70, '1.3': 67, '1.4': 59, '1.5': 57, '2.1': 69, '2.2': 65, '2.3': 65, '2.4': 75, '2.5': 64, '2.6': 71, '3.1': 64, '3.2': 50, '3.3': 64, '3.4': 61, '3.5': 64, '3.6': 69, '3.7': 54, '3.8': 26, '4.1': 75, '4.2': 74, '4.3': 66, '4.4': 69, '4.5': 66, '5.1': 50, '5.2': 67, '5.3': 70, '5.4': 70, '5.5': 58, '5.6': 60, '5.7': 50, '5.8': 64, '5.9': 65, '5.10': 52, '5.11': 68, '5.12': 65, '6.1': 65, '6.2': 59, '6.3': 61, '7.1': 59, '7.2': 62, '7.3': 64, '7.4': 49, '8.1': 63, '8.2': 70, '8.3': 67, '8.4': 60, '8.5': 58, '9.1': 57, '9.2': 62, '9.3': 50, '10.1': 64, '10.2': 60, '10.3': 61, '11.1': 68, '11.2': 46, '11.3': 57, '11.4': 61, '11.5': 59, '11.6': 64, '11.7': 61, '12.1': 65, '12.2': 68, '12.3': 64, '12.4': 55, '13.1': 58, '13.2': 71, '13.3': 50, '13.4': 66, '13.5': 63, '13.6': 56, '13.7': 73, '13.8': 56, '13.9': 42, '13.10': 35, '13.11': 62, '13.12': 54, '13.13': 72}
PREV_RAMI = {1: 67, 2: 68, 3: 59, 4: 71, 5: 61, 6: 63, 7: 57, 8: 63, 9: 56, 10: 62, 11: 59, 12: 64, 13: 59}
PREV_GIOCO, PREV_ALT = 62, 62
TOLTI = {"3.8": "Allenamento (vista orfana) — vista e `TrainPanel` eliminati nella 7.999.127 per decisione PO del 03/10 (`src/17-menu-creazione-pannelli.jsx:1967`)"}
def var(old, new):
    return f"{new}%" if old is None or old == new else f"{old}% → {new}%"

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
N("1.1", "Caricamento e ripresa automatica", "`App` fase `loading` + auto-ripresa (`src/19-app-root.jsx:765-811`)", "apertura dell'app; con carriera attiva (`cpm-active`) si rientra dritti in carriera", 3,
  (80, "riprende carriera (19:781-784), provini (19:786-808) e link `?review=` (19:776); fallback «Stato non riconosciuto» (19:973)"),
  (75, "PO-176 chiusa (collaudo Codex 07/10 su 7.999.145); PO-167 PARZIALE (copia di riserva degli slot, 7.999.170); ricorrenze chiuse: PO-037 (7.999.11 e 7.999.12), PO-115 (7.999.55)"),
  (25, "auto-ripresa DISATTIVATA sotto `?cpmtest=1`: nessun guardiano la esercita; `backup-167` (completa) copre la copia di riserva, non la ripresa; `dist-web-partita-test.mjs` fuori dalle catene"),
  (80, "ripresa sullo stesso tab (`cpm-active-tab`) coerente con la direttiva 7.149"),
  (None, NPC + " (nessuna navigazione eseguita)"),
  (60, "ogni lettura in try/catch; rischio R-04 «partita in corso persa» (RISCHI.md)"),
  [CAP_NOG], "media", "un guardiano che ricarichi la pagina SENZA `cpmtest` (carriera, provini, partita in corso) e lo metta in una catena",
  ["PO-167", "PO-176"], ["Guardiano dell'auto-ripresa reale (oggi spenta sotto `cpmtest=1`)"])
N("1.2", "Menu principale e slot di salvataggio", "`HomeScreen` (`src/17-menu-creazione-pannelli.jsx:216`), `HomeNavBar` (`src/19-app-root.jsx`), `PwaInstallBanner` (17:27), badge di versione (src/19)", "fase `home`, quando non c'è una carriera da riprendere", 3,
  (85, "tre slot, nuova/carica/elimina/importa; pulsante «Crediti» del kit (17:353); badge d'avvio «v x.y.z» (PO-255)"),
  (60, "PO-255 DA VERIFICARE DAL PO (badge d'avvio, 7.999.170); PO-269 APERTO (a 360 px il badge si sovrappone al contenuto)"),
  (60, "`badge-255`, `toast-256`, `crediti-254` in completa, verdi nella notte 7.999.171 (STABILITA.json 17/10 04:07); `griglia-mobile` (catena grafica) misura `home` senza soglia; `chip-269` solo nella catena mirata"),
  (75, "schermata uniformata al kit (commento G9 in griglia-mobile.mjs); esito attuale " + NPC),
  (None, NPC),
  (70, "componente compatto, nessuna logica di gioco"),
  [CAP_PO("PO-255, PO-269")], "alta", "chiudere PO-255/PO-269 (badge) con collaudo PO a 360 px", ["PO-255", "PO-269"])
N("1.3", "Impostazioni", "`SettingsScreen` (`src/19-app-root.jsx:601`), `AudioSettings` (19:633)", "rotella dal menu (19:885) o «Opzioni» in carriera (18:6164)", 2,
  (80, "grafica, audio, esporta, rivedi intro, uscita al menu (18:6164-6236)"),
  (85, "PO-044 «Rivedi l'intro non funziona» chiusa in 7.999.12; nessuna voce aperta"),
  (30, "solo il censimento `griglia-mobile` (schermata `impostazioni`)"),
  (60, "nel menu del giocatore stanno «Strumenti di collaudo», appunti e misura del motore (18:6172-6231): strumentazione di test in produzione (DT-08)"),
  (None, NPC),
  (65, "strumenti di collaudo condizionati da `devToolsOn()`, ma il codice è nella build"),
  [CAP_NOG], "media", "togliere o nascondere dalla build store gli strumenti di collaudo; guardiano dei due ingressi", ["PO-072"], ["Strumenti di collaudo visibili nelle Impostazioni del giocatore (DT-08)"])
N("1.4", "Importa ed esporta salvataggio", "`importSave` (`src/19-app-root.jsx:828`), `exportSave` (`src/18-career-app.jsx:680`)", "menu: «Importa»; carriera: Impostazioni → «Esporta salvataggio»", 1,
  (70, "export su file e import con avviso se il salvataggio è di una versione più nuova (19:814)"),
  (80, "nessuna voce aperta"),
  (0, "ARCHITETTURA.md «Scoperti oggi: … import di un salvataggio da file»; RISCHI R-05"),
  (70, "export in fondo alle impostazioni come chiesto dal PO (commento 6.84.0, 18:6231)"),
  (None, NPC),
  (60, "un salvataggio più nuovo viene comunque caricato con un avviso (19:814)"),
  [CAP_NOG], "media", "guardiano import→export→import con confronto byte per byte", ["PO-167"], ["Guardiano di import/export del salvataggio"])
N("1.5", "Revisione azioni e prova situazioni (solo sviluppo)", "`ReviewWizard` (`src/19-app-root.jsx:50`), `SitTest` (19:181)", "`?dev=1` → «Revisione azioni» nel menu (19:965); `?sit=N`", 0,
  (75, "wizard muto (19:954), escluso dalla build store (`__CPM_STORE_BUILD`, 19:957)"),
  (None, NPC), (30, "usato dal collaudo, nessun guardiano proprio"), (60, "strumento di sviluppo dentro il file di gioco (DT-08)"), (None, NPC), (50, "dipende dagli hook `window.__CPM_*`"),
  [CAP_NOG], "bassa", "fuori dal conto (peso 0): resta nella mappa per completezza", [])
N("1.6", "Crediti", "`Crediti238` (`src/17-menu-creazione-pannelli.jsx:184`), pulsante `crediti254-pulsante` (17:353)", "menu principale → «Crediti»", 1,
  (80, "16 voci con fonte (PO-254); le due voci DiceBear nel formato delle altre (riga Licenza e fonte, giro 68, PO-267)"),
  (55, "PO-254 DA VERIFICARE DAL PO; PO-267 PARZIALE; PO-268 APERTO nel BACKLOG ma il codice toglie già numero d'ordine e data (17:154, rosso `__CPM_NO_CRED268`); `crediti-238` rosso sul giro completa 7.999.170 (STABILITA.json 16/10 04:43), sostituito da `crediti-254`"),
  (70, "`crediti-254` in completa (rossi `__CPM_NO_CRED267`, `__CPM_NO_CRED267B` del giro 68), verde nella notte 7.999.171; verde sul giro 68 riferito dalla sessione, non rieseguito in questa stesura"),
  (75, "Modal del kit (`cpm=\"crediti238\"`)"),
  (70, "MISURA (giro 68): foto prima/dopo a 412 e 360 px (`docs/sviluppo/foto/giro68/crediti-*.jpg`) + guardiano verde; il PO non ha ancora confermato"),
  (70, "componente piccolo, testi in tabella (17:144-182)"),
  [CAP_PO("PO-254, PO-267, PO-268")], "alta", "conferma PO dei Crediti; allineare PO-268 nel BACKLOG al codice", ["PO-254", "PO-267", "PO-268"])
N("1.7", "Copia di riserva dello slot", "finestra `riserva-167` (`src/19-app-root.jsx:958`), `storage` (`src/08-panchina-derby-meteo-cori.jsx:585`)", "al caricamento, quando lo slot non si legge e una copia di riserva esiste", 1,
  (70, "PO-167 PARZIALE: copia di riserva degli slot e avviso «Copia di riserva trovata» (7.999.170)"),
  (65, "PO-167 PARZIALE; `backup-167` corretto nel 7.999.171 (ROADMAP.md:66)"),
  (65, "`backup-167` in completa, verde nella notte 7.999.171"),
  (75, "Modal del kit, non chiudibile per sbaglio (`dismissable={false}`)"),
  (None, NPC),
  (60, "dipende da `storage` (R-02: errore di scrittura senza avviso, 08:626)"),
  [CAP_PO("PO-167")], "alta", "completare PO-167 (persistenza del browser, copia esportabile) e collaudo con slot corrotto", ["PO-167"])

# ───────────────────────── 2 PERCORSO INIZIALE
ramo(2, "Percorso iniziale (creazione, provini, Primavera, passaggio pro)")
N("2.1", "Creazione del giocatore", "`CreateScreen` (`src/17-menu-creazione-pannelli.jsx:396`)", "menu → slot vuoto → «Nuova carriera» (`startNew`, 19:822)", 3,
  (80, "nome, nazione, ruolo, volto; bonus eredità della Nuova partita+ (19:968)"),
  (80, "nessuna voce aperta"),
  (30, "solo il censimento `griglia-mobile` (schermata `creazione`); `grep CreateScreen tests/visual` = 0 file"),
  (75, "nella griglia mobile come le altre schermate del menu"),
  (None, NPC), (70, "componente compatto"),
  [CAP_NOG], "media", "guardiano «nuova carriera dall'inizio alla prima partita» (lacuna dichiarata in ARCHITETTURA.md)", [], ["Guardiano nuova carriera: creazione → provini → offerte → prima partita"])
N("2.2", "Filmato introduttivo", "`IntroCinematic` (`src/19-app-root.jsx:221`)", "dopo la creazione, la prima volta (`setPhase(\"cinematic\")`, 19:864); «Rivedi l'intro» (19:719)", 1,
  (80, "una volta per dispositivo (`cpm-intro-seen`, 19:969) e ripetibile"),
  (85, "PO-044 chiusa in 7.999.12"),
  (0, "nessun test lo cita"), (75, "evento unico `cpm-replay-intro` da menu e profilo (19:730-732)"), (None, NPC), (70, "isolato"),
  [CAP_NOG], "bassa", "uno scatto di controllo in catena grafica", [])
N("2.3", "Provini (tre partite)", "`TrialFlow` (`src/17-menu-creazione-pannelli.jsx:593`), fasi `pre`/`match`/`post`", "dopo il filmato (19:969) o in ripresa (19:804-808)", 2,
  (80, "tre provini con la «Selezione Granata» (17:595), ripresa da `cpm-trial-prog` (7.330)"),
  (70, "bug grave chiuso 7.332 «mi ha sovrascritto una carriera» (19:798); mai un quarto risultato (7.331, 17:600)"),
  (30, "`tripath-chokepoint-test.mjs` (fuori catena); la ripresa è spenta sotto `cpmtest` (19:785)"),
  (70, "stessa `LiveMatch` della carriera con `context=\"trial\"`"),
  (None, NPC), (65, "persistenza su chiave separata dallo slot"),
  [CAP_NOG], "media", "guardiano dei tre provini con ripresa a metà", [], ["Guardiano dei provini con ripresa a metà"])
N("2.4", "Offerte di fine provini", "`OffersScreen` (`src/17-menu-creazione-pannelli.jsx:529`)", "fine del terzo provino (`onTrials`, 19:865)", 2,
  (85, "lega e bandiera su ogni offerta (7.999.114, PO-196)"),
  (85, "PO-196 chiusa nello storico"),
  (75, "`calendario-offerte-195` in catena grafica, rosso `__CPM_NO_LEGA196`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10)"),
  (80, "etichette di lega coerenti con la Stagione"),
  (None, NPC + " (correzione 7.999.114 non ricollaudata dal PO)"), (70, "logica breve"),
  [], "alta", "collaudo PO della 7.999.114 sul telefono", ["PO-196"])
N("2.5", "Stagioni Primavera (Under 18)", "`CareerApp` con `proStatus:\"u18\"` (`src/18-career-app.jsx:10313` riquadro di stato)", "firma con un club giovanile dalle offerte (`onChoose`, 19:866)", 3,
  (70, "stessa carriera dei pro con regole proprie (gol Primavera fuori dalle classifiche pro, `primavera-awards-test.mjs`)"),
  (55, "PO-194 GRAVE «partita già giocata» in Primavera 2, S.1 (chiusa 7.999.113); PO-192 conferenza «quasi un derby» in Primavera; impulsi «troppo presto» (`impulsi-contesto-test.mjs`)"),
  (60, "`conferenza-192` (rosso `__CPM_NO_DERBY192`) e `partita-rigiocata-194` in catena carriera, verdi nella notte 7.999.171 (17/10, 89/89); `primavera-awards-test`, `impulsi-contesto-test` fuori catena"),
  (70, "PO-192: domande da professionisti finite in Primavera"),
  (None, NPC), (60, "molte regole `proStatus===\"u18\"` sparse in 18"),
  [], "media", "collaudo Codex di una stagione Primavera intera con scheda (eventi, conferenze, classifica)", ["PO-192", "PO-194", "PO-153"])
N("2.6", "Passaggio a professionista", "schermata `proTransition` → `ProTransitionScreen` (`src/16-scene-3d-cerimonie.jsx:26`); `onProChoose` (`src/18-career-app.jsx:5420`)", "fine stagione Under 18 (`setScreen(\"proTransition\")`)", 2,
  (80, "rivale e sponsor nascono all'accettazione dell'offerta (7.999.120)"),
  (80, "PO-176 FATTO: collaudo Codex chiuso il 07/10 su 7.999.145 (BACKLOG.md, storico)"),
  (70, "`pro-rivale-176` in catena carriera, rosso `__CPM_NO_PRO176`, verde nella notte 7.999.171 (17/10, 89/89)"),
  (75, "stesso flusso offerta/firma della carriera"),
  (None, NPC), (60, "migrazione al caricamento che crea campi (prima della 7.999.120)"),
  [], "alta", "collaudo PO di un passaggio a professionista sul telefono", ["PO-176"])

# ───────────────────────── 3 HOME E CICLO SETTIMANALE
ramo(3, "Home e ciclo settimanale")
N("3.1", "Home (cruscotto)", "linguetta `dashboard` (`src/18-career-app.jsx`, `tab===\"dashboard\"`)", "barra in basso «Home», tasto M", 3,
  (80, "circa 45 riquadri condizionati in fisarmoniche"),
  (60, "PO-066 DA VERIFICARE DAL PO (riquadri nel kit, 7.999.170; titoli ripetuti tolti nel giro 68); PO-224 PARZIALE (finestre in secondo piano, vedi 3.9)"),
  (75, "`home-066` in catena grafica (rossi `__CPM_NO_HOME066` e, dal giro 68, `__CPM_NO_DUP068` per il controllo D1 «titolo ripetuto»); `titolo-110`, `riquadro-euro-105` in carriera, verdi nella notte 7.999.171; nessun giro della catena grafica registrato con `home-066` (ultimo grafica: 7.999.146)"),
  (70, "riquadri portati alla card neutra (PO-066, 7.999.170)"),
  (75, "MISURA VERA (giro 68): foto prima/dopo della Home pro e Under 18 a 412 e 360 px (`docs/sviluppo/foto/giro68/home-*.jpg`) + `home-066` verde, 112 riquadri, 0 fuori standard a 412 e 360 (riferito dalla sessione del giro 68); manca la conferma del PO"),
  (50, "riquadri scritti come blocchi inline nel file più grande del gioco (DT-06)"),
  [CAP_PO("PO-066")], "alta", "conferma PO di PO-066 sul telefono; un giro registrato della catena grafica con `home-066`", ["PO-066", "PO-224"])
N("3.2", "Pulsante principale e avanzamento della settimana", "`handleContinua` (18:1322), `doAdvanceWeek` (18:4328), conferma `showAdvanceConfirm`", "pulsante fisso in cima alla Home, tasto A", 3,
  (75, "vivi / gioca / avanza in un solo pulsante; conferma prima di saltare"),
  (55, "nessun bloccante aperto: PO-183 FATTO (collaudo Codex chiuso il 07/10 su 7.999.145, 12/12 interruzioni); restano la storia delle ricorrenze (nota 7.445 «9ª RICORRENZA», `src/07-versione-save-interviste.jsx:126`; PO-194, PO-181) e PO-222/PO-263 (zona G) sul ramo «Simula»"),
  (85, "`career-critical` (11 guardiani, rossi `__CPM_NO_P0_1…6`), `partita-rigiocata-194`, `recupero-103`, `euro-attesa-181`, `rinvio-coppe-107` in catena carriera, verdi nella notte 7.999.171 (17/10, 89/89)"),
  (65, "tre strade che avanzano la settimana (doAdvanceWeek / onMatchEnd / simulateAndAdvance: `tripath-chokepoint-test.mjs`)"),
  (None, NPC), (40, "`Math.random` non seedati in `src/18` (DT-07)"),
  [], "alta", "una sola funzione di avanzamento; collaudo Codex di una stagione intera senza ricorrenze", ["PO-183", "PO-153"])
N("3.3", "Vivi la settimana ed eventi settimanali", "`liveCurrentWeek` (18:4044), finestra `weekLiveModal` (18:6296), avviso `weekEvent` (18:6252), `WEEKLY_EVENTS` (`src/03-eventi-narrativi.jsx:26`)", "pulsante principale nelle settimane senza partita", 3,
  (75, "evento, riabilitazione, spogliatoio, impulso, rivale (18:4062-4698)"),
  (70, "lamentele ripetute chiuse: «in una stagione mai capitato un evento» (`vita-flow-test`), «ripetitivo» (`vita-variety-test`)"),
  (40, "`vita-flow-test`, `vita-variety-test`, `impulsi-contesto-test` fuori catena"),
  (65, "PO-154: «46 impulsi su 112 non hanno condizioni… Nessun impulso ha memoria»"),
  (None, NPC), (55, "testi e pesi in tabelle da 1.459 righe"),
  [CAP_NOG, CAP_PO("PO-154")], "media", "fase 1 Codex (PO-153) e proposta PO-154; guardiano in catena", ["PO-154", "PO-153"])
N("3.4", "Momenti di carriera", "`careerMomentModal` (18:6416), `CAREER_MOMENTS` (`src/03-eventi-narrativi.jsx:972`)", "dopo partite o settimane speciali (18:1313)", 2,
  (70, "finestra in coda alle altre (precedenza unica, rosso `__CPM_NO_CODA23`, 18:6159)"),
  (75, "nessuna voce aperta sul nodo; coda delle finestre corretta il 24/09"),
  (30, "hook `forceMoment` (18:1448), nessun guardiano in catena"),
  (65, "PO-154: niente memoria né catene"),
  (None, NPC), (55, "trigger probabilistici non seedati"),
  [CAP_NOG], "bassa", "guardiano della coda delle finestre in catena; misura Codex delle frequenze", ["PO-154"])
N("3.5", "Il mister: verifica mensile e dialoghi", "`monthlyReviewModal` (18:6636), `coachModal` (18:6594)", "ogni mese (18:4078); dialogo proattivo (18:4888)", 2,
  (70, "scelte di risposta con effetti"),
  (75, "chiusa la lamentela «conversazioni molto ripetitive» (`coach-review-variety-test`)"),
  (40, "`coach-review-variety-test`, `coach-face-test` fuori catena"),
  (70, "Modal standard dal 7.993"), (None, NPC), (55, "logica inline nel componente"),
  [CAP_NOG], "media", "guardiano in catena e collaudo dei testi", [])
N("3.6", "Interazioni d'apertura stagione", "`openingWiz` (18:7026), `openingPending` (18:946: ritiro, presidente, mercato, stampa, maglia, presentazione, addio, sorteggi)", "settimana 1 di ogni stagione (`openingGate`, 18:964)", 2,
  (80, "otto passi in fila in un solo assistente"),
  (75, "nessuna voce aperta"),
  (40, "`home-opening-test` (fuori catena): «le interazioni d'apertura vivono solo nel wizard»"),
  (75, "direttiva PO: niente riquadri pre-stagionali in Home"), (None, NPC), (60, "gestori condivisi card⟷wizard (18:967)"),
  [CAP_NOG], "media", "rimettere `home-opening-test` in una catena", [])
N("3.7", "Tutorial", "`TutorialOverlay` (`src/17-menu-creazione-pannelli.jsx:1922`), `TUTORIAL_STEPS` (17:1914)", "primo ingresso in Home (`!player.tutorialDone`, 18:6240)", 1,
  (60, "quattro passi (`tutStep` 0-3, 18:172), salta/avanti"),
  (80, "nessuna voce in BACKLOG.md"),
  (0, "i guardiani impostano `tutorialDone:true` per saltarlo"),
  (None, NPC), (None, NPC), (70, "componente piccolo"),
  [CAP_NOG], "bassa", "collaudo Codex con scheda del primo avvio; uno scatto in catena grafica", [], ["Tutorial: nessuna verifica (né guardiano né collaudo)"])
N("3.9", "Finestre in primo piano della Home", "`pop224` → `Modal` standard `finestra230` (`src/18-career-app.jsx:1991`)", "Home, quando arrivano risposte, storie, impulsi o notizie", 2,
  (70, "PO-224 PARZIALE: le finestre aspettano anche l'intervista settimanale (7.999.161)"),
  (55, "PO-224 PARZIALE; PO-230 DA VERIFICARE DAL PO (finestre in primo piano nel Modal standard, 7.999.163)"),
  (70, "`popup-224`, `finestra-230`, `toast-256` in completa, verdi nella notte 7.999.171"),
  (75, "Modal standard (decisione PO «tutte le finestre in primo piano con grafica standard», PO-230)"),
  (None, NPC),
  (55, "finestra costruita intorno alle `Card` esistenti (18:1991), interruttore `__CPM_NO_MOD230`"),
  [CAP_PO("PO-224, PO-230")], "alta", "chiudere PO-224 e conferma PO di PO-230", ["PO-224", "PO-230"])

# ───────────────────────── 4 STAGIONE
ramo(4, "Stagione")
N("4.1", "Classifica", "linguetta `standings` (18:9048-9299)", "barra «Stagione» (apre sulla classifica, 18:690)", 3,
  (85, "classifiche di tutte le leghe, capocannonieri, risultati dagli altri campionati"),
  (60, "PO-182 BLOCCANTE chiusa in 7.999.102; PO-175 gol fatti ≠ subiti (7.999.94); `classifica-94` precedente"),
  (85, "`classifica-102` (rosso `__CPM_NO_CLASSIFICA102`) in catena carriera; `career-invariants` (standings) in `career-critical`, verdi nella notte 7.999.171 (17/10, 89/89)"),
  (80, "una sola fonte per la classifica dopo la 7.999.102"),
  (None, NPC), (60, "riconciliazione al caricamento (07:97)"),
  [], "alta", "un collaudo Codex di 30 carriere (fase 1) senza anomalie di classifica", ["PO-153"])
N("4.2", "Calendario", "linguetta `calendar` (`src/18-career-app.jsx`)", "Stagione → «Calendario»", 3,
  (85, "griglia con sigla, sede e punteggio (7.999.114); riga della Nazionale in «Prossime partite» (PO-233)"),
  (55, "PO-233 DA VERIFICARE DAL PO («1489 giornata», 7.999.165); storico: PO-193, PO-195, 7.999.106, PO-089"),
  (80, "`giornata-233` in completa, `avversario-106` in carriera, verdi nella notte 7.999.171; `calendario-offerte-195` (grafica) " + "verde sull'ultimo giro grafica registrato (7.999.146, 07/10)"),
  (80, "stesse sigle della classifica"), (None, NPC), (60, "calendario persistente generato una volta per stagione"),
  [CAP_PO("PO-233")], "alta", "conferma PO di PO-233 sul telefono", ["PO-233"])
N("4.3", "Coppe (nazionale, europee, tornei)", "linguetta `coppe` (18:11498)", "Stagione → «Coppe»", 2,
  (75, "tabellone, gironi, capocannonieri, albo"),
  (45, "7.999.107 rete di sicurezza per le coppe ferme; PO-186 KCC ferma agli ottavi; 7.686 «trofeo alzato a metà torneo» (18:6031); 7.999.105"),
  (85, "`coppa-intera`, `coppa-nazioni`, `cup-final-replay`, `recovery-competition` in `career-critical`; `rinvio-coppe-107` in catena carriera"),
  (70, "nomi delle coppe «Korward» (18:6028)"), (None, NPC), (55, "stato coppe sparso fra `cup`, `euro`, `euroMondiale`"),
  [], "alta", "fase 1 Codex con controllo delle coppe arrivate in fondo", ["PO-153"])
N("4.4", "Sorteggi dei gironi europei", "`euroGroupModal` (18:7147) e passo «sorteggi» (18:961)", "settimana 1 con coppa europea a gironi", 1,
  (75, "rivelazione progressiva (`drawRevealN`)"),
  (75, "nessuna voce aperta"),
  (50, "`career-invariants` controlla `euroGroupTable` (dati), non la finestra"),
  (75, "Modal standard"), (None, NPC), (60, "—"),
  [], "media", "uno scatto della finestra in catena grafica", [])
N("4.5", "Ritiro pre-campionato", "overlay `ritiroEvent` (18:5959), `ritiroPlan` (`src/10-folla-stadi-ritiro.jsx:435`)", "assistente d'apertura, dalla seconda stagione da pro (18:950)", 1,
  (75, "sei tempi con un'unica scelta (7.337)"),
  (80, "nessuna voce aperta"),
  (30, "nessun guardiano dedicato; `home-opening-test` lo cita"),
  (75, "stesso schema a tempi della serata di presentazione"), (None, NPC), (60, "motori puri (18:5957)"),
  [CAP_NOG], "media", "guardiano del racconto e della scelta", [])

# ───────────────────────── 5 PARTITA
ramo(5, "Partita")
N("5.1", "Scelta Gioca / Simula", "`showMatchPrompt` (18:6684)", "pulsante principale nella settimana con partita, tasto P", 3,
  (80, "Gioca, Simula, «Non ora», squalifica → simulata (18:6684-6782)"),
  (60, "PO-183 e PO-194 FATTI (collaudo Codex chiuso il 07/10); doppio tocco (`double-tap`, P0_4); ricorrenze storiche −10"),
  (85, "`double-tap` in `career-critical`, `partita-rigiocata-194` (rosso `__CPM_NO_CONF194`) in catena carriera, `typing-shortcuts` in completa, verdi nella notte 7.999.171"),
  (75, "Modal del kit"), (None, NPC), (55, "stato in più ref (`showMatchPromptRef`)"),
  [], "alta", "collaudo PO sul telefono del ciclo Gioca/Simula", ["PO-183"])
N("5.2", "Conferenza pre-partita e discorso del mister", "`interviewModal` con `matchCtx:\"prematch\"` (18:1122), `misterDiscorsoModal` (18:6447)", "prima di una partita importante, prima del calcio d'inizio", 2,
  (75, "ordine conferenza → discorso → partita (7.999.113)"),
  (55, "PO-194 GRAVE e PO-192 corretti in 7.999.113 (nelle ultime 15 release)"),
  (75, "`partita-rigiocata-194` e `conferenza-192` con rossi in catena carriera, verdi nella notte 7.999.171 (17/10, 89/89)"),
  (70, "domande filtrate per derby e professionisti"), (None, NPC), (55, "sequenza a timeout (18:521-528)"),
  [], "alta", "collaudo PO di una gara di cartello", ["PO-192", "PO-194"])
N("5.3", "Giorno partita e rapporto dell'osservatore", "`LiveMatch` fase `matchday` (`src/15-live-match.jsx`), `MatchdayCard` (`src/13-prepartita-formazioni.jsx:570`), `ScoutReportScreen` (13:69)", "«Gioca» → `startMatch`", 2,
  (80, "scheda della gara, meteo, posta in palio, osservatore; analisi pre-partita nel kit (PO-217)"),
  (70, "PO-217 DA VERIFICARE DAL PO (analisi pre-partita nel kit, 7.999.170)"),
  (65, "`analisi-217` in catena grafica (nessun giro grafica registrato con lui: ultimo 7.999.146); verde a 412×915 e 360×780 nel giro 68 senza modifiche al codice (riferito); `griglia-mobile` (censimento)"),
  (75, "stesso kit"),
  (75, "MISURA VERA (giro 68): foto `docs/sviluppo/foto/giro68/analisi-pro-412.jpg` e `analisi-pro-360.jpg` + `analisi-217` verde; manca la conferma del PO"),
  (60, "—"),
  [CAP_PO("PO-217")], "alta", "conferma PO di PO-217; un giro registrato della catena grafica", ["PO-217"])
N("5.4", "Formazioni", "`FormationView` (`src/13-prepartita-formazioni.jsx:925`), fase `formations` (15:10350)", "dal giorno partita (Invio o pulsante, 15:9879)", 2,
  (80, "due campetti con le formazioni"),
  (80, "PO-204 FATTO (7.999.126: campetti a tutta altezza); nessuna voce aperta sul nodo"),
  (75, "`formazioni-204` in catena grafica, rosso `__CPM_NO_FORMAZ204`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10)"),
  (75, "—"), (60, "PO-204 «campetti schiacciati con spazio vuoto sotto», chiusa nel BACKLOG; nessuna foto dopo la correzione"), (60, "—"),
  [], "alta", "foto di controllo sul telefono dopo la 7.999.126", ["PO-204"])
N("5.5", "Ingresso in campo (3D)", "fase `walkout` (`src/15-live-match.jsx`), sera di presentazione, attesa", "dalle formazioni", 2,
  (75, "fila, statistiche pre-partita su vetro, sfilata, bambini; ingresso a passo di camminata (7.999.170)"),
  (60, "PO-206 FATTO (7.999.128, la fila non corre più sul posto); PO-245 DA VERIFICARE DAL PO (ospiti che attraversano il campo); storico PO-188, PO-197, PO-080"),
  (65, "`walkout-fermi-197`, `fila-206`, `pre-188` in grafica (" + "verde sull'ultimo giro grafica registrato (7.999.146, 07/10)" + "); `fila-227`, `bambini-236`, `prima-partita-237` in completa, verdi nella notte 7.999.171; `ingresso-camminata-245` solo nella mirata"),
  (70, "—"), (50, "PO-245 dalle foto del PO; nessuna foto dopo la 7.999.170"), (45, "vive in `src/12` e `src/15`"),
  [CAP_PO("PO-245")], "alta", "conferma PO di PO-245; `ingresso-camminata-245` in una catena fissa", ["PO-245", "PO-206", "PO-188", "PO-197"])
N("5.6", "Partita 2D", "fase `playing`: `Campo2D` (15:558), `PannelloLive2D`, `Pagella918`, cronaca `BG_MATCH` (`src/05-cronaca-stadi-formazioni.jsx:24`), schede del mister", "dopo l'ingresso in campo", 3,
  (75, "campo dall'alto, cronaca, statistiche e pagelle dal vivo, schede del mister con 3 opzioni (PO-234)"),
  (30, "aperte sul nodo: PO-207 PARZIALE (ripartenza dopo il gol), PO-266 APERTO (riaperto 16/10: cronaca che nomina un giocatore lontano), PO-226, PO-234, PO-246 PARZIALI (schede del mister), PO-259 DA VERIFICARE; ricorrenze: PO-189, PO-122, PO-039"),
  (75, "`ripartenza-207`, `rimbalzo-189` in carriera; `schede-234/246/259/260`, `nomi-219`, `ripartenza-235`, `spot-266` in completa; notte 7.999.171 verde (89/89), ma senza `rimbalzo-189` e `spot-266`, allora fuori catena (ROADMAP.md:66); `ripartenza-207` ROSSO nella notte 7.999.166 (14/10)"),
  (70, "decisione PO: «restano partita 2D + highlight 3D» (DECISIONI.md)"),
  (55, "PO-207, PO-259 dalle segnalazioni del PO"),
  (45, "`src/15-live-match.jsx` oltre 11.000 righe, `Math.random` non seedati"),
  [CAP_PO("PO-207, PO-266, PO-226, PO-234, PO-246")], "alta", "chiudere PO-207 e PO-266; decisione PO sulle schede (PO-259)", ["PO-207", "PO-266", "PO-226", "PO-234", "PO-246", "PO-259", "PO-021", "PO-031"])
N("5.7", "Highlight 3D dell'eroe", "fasi `hl_intro`/`hl_choose`/`hl_move`/`hl_result` (15); `ThreeMatchView` (`src/12-three-match-view.jsx:258`); `PopScelta919`; `DPad` (13:28); `SITUATIONS` (`src/04-situazioni-zone-piazzati.jsx:164`)", "durante la partita 2D, quando il motore apre una scena", 3,
  (70, "191 scene; gesti e clip per evento ancora parziali (PO-068); scene dal moto solo in parte (PO-022)"),
  (10, "aperte sul nodo (BACKLOG.md): PO-068, PO-123, PO-143, PO-218, PO-220, PO-229, PO-240, PO-261 PARZIALI; PO-248, PO-250, PO-252, PO-258, PO-260, PO-271 APERTI; PO-242, PO-257 DA VERIFICARE; 17 voci del 03/10 chiuse come DOPPIONE (05-06/10) e confluite in PO-123/PO-068/PO-022, non risolte"),
  (85, "`validate-situations` (14 categorie) e circa 25 guardiani di scena in completa (`esiti-218`, `cross-218`, `lessico-218`, `gk-miss-229`, `apertura-261`, `parata-258`, `difesa-220*`, `piedi/rete/portiere/aereo/camera/reazione-252`, `esiti-241`, `tecnica-045`…), notte 7.999.171 verde; `difesa-252`, `rinvio-252`, `testa-143` erano fuori catena nella 171 (PO-271) e rientrati al giro 50"),
  (55, "PO-022: «scene generate dal moto» solo in parte; DT-05 gesti riconosciuti da regex sui testi"),
  (40, "PO-248 «puntiamo alla fluidità, credibilità degli highlight»; PO-261 primo highlight con eroe fuori in 1 partita su 7 (collaudo 3D 170)"),
  (35, "DT-03: rotazioni di ossa scritte a numero in `src/12`; `Math.random` non seedati in `src/12`"),
  [CAP_PO("PO-123, PO-248, PO-252…")], "alta", "banco unico degli highlight (PO-248) e chiusura delle voci L1", ["PO-123", "PO-068", "PO-143", "PO-218", "PO-220", "PO-229", "PO-240", "PO-242", "PO-248", "PO-250", "PO-252", "PO-257", "PO-258", "PO-260", "PO-261", "PO-271", "PO-033", "PO-048", "PO-094", "PO-120", "PO-185"])
N("5.8", "Rigori di fine gara", "fase `shootout` (`src/15-live-match.jsx:10817`)", "pareggio in una gara a eliminazione", 1,
  (70, "serie di rigori"),
  (75, "PO-113 (7.999.58) e PO-130 (7.999.68) chiuse"),
  (40, "`rigori-58` (rosso `__CPM_NO_RIGORI58`) fuori catena"),
  (70, "—"), (None, NPC), (50, "dentro `src/15`"),
  [CAP_NOG], "media", "`rigori-58` in una catena", [])
N("5.9", "Fine gara: riepilogo, pagelle e tabellino", "fase `ended` (`src/15-live-match.jsx`)", "fischio finale", 3,
  (80, "punteggio, tabellino, voti"),
  (45, "PO-209 DA VERIFICARE DAL PO (intestazione del tabellino, 7.999.164); PO-228 APERTO (statistiche poco realistiche: 811,3 passaggi su 40 partite); storico PO-034, PO-043, PO-049"),
  (75, "`tabellino-228`, `statistiche-228`, `passaggi-228`, `testata-209` in completa; `tabellino-216`, `possesso-209` in carriera; notte 7.999.171 verde"),
  (75, "—"), (None, NPC), (50, "—"),
  [CAP_PO("PO-209, PO-228")], "alta", "chiudere PO-228 (statistiche) e conferma PO di PO-209", ["PO-209", "PO-228"])
N("5.10", "Festa di fine partita", "`FestaFine942` (`src/15-live-match.jsx`)", "vittoria meritata, al fischio", 2,
  (75, "festa leggera con tabellone e coro"),
  (55, "PO-203 FATTO (7.999.140, collaudo Codex chiuso 07/10: 0 sotto il prato); PO-048 FATTO (non riprodotta, chiusa dal PO 12/10); ricorrenze storiche PO-135 (×3), PO-117, PO-121"),
  (40, "`festa-942`, `festa-3d`, `festa-57`, `festa-79`, `mister-77` con rosso, tutti fuori catena"),
  (70, "—"), (None, NPC + " (i difetti fotografati dal PO sono chiusi, nessuna foto dopo la correzione)"), (45, "corpi 3D in `src/12`"),
  [CAP_NOG], "media", "un guardiano della festa in catena", ["PO-203", "PO-048"])
N("5.11", "Rassegna stampa post-partita", "schermata `postmatch` → `PostMatchPress` (`src/13-prepartita-formazioni.jsx:313`); `press` → `PressScreen` (13:419)", "chiusura della fine gara", 2,
  (80, "giornale con punteggio, statistiche, titoli"),
  (65, "PO-244 DA VERIFICARE DAL PO («FASE A ELIMINAZIONE» su gare di girone e amichevoli, collaudo mirato 15/10)"),
  (30, "`giornale-244` solo nella catena mirata; nessun guardiano in una catena fissa"),
  (75, "—"), (None, NPC), (60, "—"),
  [CAP_NOG, CAP_PO("PO-244")], "media", "`giornale-244` in una catena fissa; conferma PO", ["PO-244"])
N("5.12", "Simula: la partita dell'eroe senza giocarla", "«Simula» → `simulateAndAdvance` → `simulaPartitaMotore` (`src/14-motore-possesso.jsx`)", "scelta Gioca/Simula", 2,
  (80, "risultato, voto e statistiche dal motore (brain unico, PO-202 FATTO 7.999.137-138)"),
  (40, "PO-190 DA COLLAUDARE (quota gol dell'eroe 41,4% su 20 partite); PO-222 APERTO (un non convocato riceve una presenza); PO-263 PARZIALE (squalificato/non convocato si infortunano)"),
  (85, "`partita-vera` (completa); `rigori-190`, `debito-190`, `brain-202`, `squalifica-222`, `infortunio-263` con rossi in catena carriera, verdi nella notte 7.999.171"),
  (75, "decisione «brain unico» (30/09)"), (50, "PO-190 «da confermare sul telefono»"), (60, "funzione pura con seme"),
  [CAP_PO("PO-190, PO-222, PO-263")], "alta", "chiudere PO-222/PO-263 (zona G) e collaudo PO-190", ["PO-190", "PO-222", "PO-263", "PO-202", "PO-021"])

# ───────────────────────── 6 CLUB
ramo(6, "Club")
N("6.1", "Scheda Club", "linguetta `club` (18:9343): stadio, sponsor, piazzamenti, allenatore, staff, rosa, bacheca, spogliatoio", "barra «Club» (18:6156), tasto S", 3,
  (80, "otto sezioni a fisarmonica (18:9416-9676)"),
  (75, "PO-110 «12 allenatori che non tornano» (7.999.53) chiusa"),
  (30, "solo il censimento `griglia-mobile` (schermata `club`)"),
  (70, "fisarmoniche del kit"), (None, NPC), (55, "blocchi inline in 18"),
  [CAP_NOG], "media", "guardiano dei dati del club (rosa, staff, bacheca)", [])
N("6.2", "Presentazione al nuovo club", "schermata `clubPresentation` (18:6011) → `ClubPresentationScreen` (`src/16-scene-3d-cerimonie.jsx:3186`)", "dopo un trasferimento (`setScreen(\"clubPresentation\")`, 2 punti in 18)", 1,
  (75, "scena di benvenuto"),
  (80, "nessuna voce aperta"),
  (0, "nessun test la cita"),
  (60, "esistono due «presentazioni» diverse (questa e la serata 3D di 11.1)"), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "collaudo Codex con scheda dopo un trasferimento", [], ["Presentazione al nuovo club: nessuna verifica"])
N("6.3", "Numero di maglia", "`jerseyPickModal` (18:6254)", "assistente d'apertura, passo «maglia» (18:954)", 1,
  (75, "scelta del numero libero"),
  (80, "nessuna voce aperta"),
  (0, "`maglie-numero-test` riguarda i numeri nel 3D, non la scelta"),
  (75, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "media", "guardiano della scelta", [])

# ───────────────────────── 7 CARRIERA
ramo(7, "Carriera")
N("7.1", "Profilo", "linguetta `profile` (18:9725): statistiche, biografia, record, trofei, allenatori, rivale, stampa, stile, premi, contratto, attributi, timeline…", "barra «Carriera» (apre sul Profilo, 18:690), tasto R", 3,
  (80, "circa 25 sezioni a fisarmonica (18:9754-10573)"),
  (65, "PO-066 PARZIALE (Profilo da portare alla card neutra); PO-110 diario solo ultima stagione (7.999.53)"),
  (30, "solo il censimento `griglia-mobile` (`carriera-profilo`)"),
  (55, "PO-066; densità: 25 sezioni in una pagina"), (55, "PO-066 «da completare»"), (50, "blocchi inline in 18"),
  [CAP_NOG, CAP_PO("PO-066")], "media", "chiudere PO-066; guardiano dei numeri di carriera", ["PO-066"])
N("7.2", "Diario sfogliabile", "`DiarioSfoglia` (`src/18-career-app.jsx:85`, montato 18:10307)", "Profilo → «Diario di Carriera»", 1,
  (75, "diario fino a 80 voci"), (80, "nessuna voce aperta"), (0, "nessuno"), (75, "—"), (None, NPC), (65, "—"),
  [CAP_NOG], "bassa", "uno scatto in catena grafica", [])
N("7.3", "Traguardi (milestone e achievement)", "`MilestoneCelebrationModal` (`src/17-menu-creazione-pannelli.jsx:1950`, montata 18:6238), `CAREER_MILESTONES` (17:1446)", "al raggiungimento di un traguardo", 1,
  (75, "finestra di festa + elenco nel Profilo"), (80, "nessuna voce aperta"),
  (20, "`run-save-compat` controlla solo la compatibilità dei dati"), (70, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "guardiano dello scatto dei traguardi", [])
N("7.4", "Stile di gioco (archetipi)", "Profilo → «Stile di gioco» (18:10096); `ARCHETYPES` (`src/06-archetipi-agenti-sponsor.jsx`)", "Profilo", 2,
  (50, "PO-098: «Ridurre gli archetipi e dare a ciascuno un modo di giocare riconoscibile»; `__CPM_NO_STILI` non c'è"),
  (80, "nessun difetto aperto"), (0, "nessuno"), (50, "otto stili che non cambiano il gioco (PO-098)"), (None, NPC), (60, "—"),
  [CAP_NOG, CAP_PO("PO-098")], "media", "proposta PO-098 dopo la fase 1 Codex", ["PO-098", "PO-153"])

# ───────────────────────── 8 AGENTE E UFFICIO
ramo(8, "Agente e Ufficio")
N("8.1", "Agente (procuratore, mercato, contratto, cessione, prestito)", "linguetta `agente` (18:10603)", "barra «Agente» (18:6156), tasto G", 3,
  (80, "procuratore, finestra di mercato, contratto, cessione, prestito, compito, parere (18:10788-11116)"),
  (60, "PO-174 BLOCCANTE prestito chiusa (7.999.91); scheda rinominata tre volte (PO-015, PO-053); PO-181 «198 osservazioni di contratto oltre la scadenza»"),
  (40, "`agent-lifecycle-test`, `agent-relation-test`, `prestito-91` (rosso) fuori catena"),
  (70, "divisione Agente/Ufficio scelta dal PO (7.999.14)"), (None, NPC), (50, "blocco di 500 righe inline"),
  [CAP_NOG], "media", "guardiani dell'agente in una catena", ["PO-153"])
N("8.2", "Primo incontro col procuratore", "`agentIntro` (18:7884), finestre «Il primo incontro» (18:7908) e «Il confronto» (18:7830)", "riquadro in Home quando arriva il suggerimento", 1,
  (80, "conoscenza, ambizione, firma"), (70, "PO-253 DA VERIFICARE DAL PO (cornice del procuratore nel kit, 7.999.170); PO-003 chiusa"),
  (65, "`procuratore-253` in completa, verde nella notte 7.999.171; `agent-relation-test` fuori catena"), (75, "Modal standard"), (None, NPC), (60, "—"),
  [CAP_PO("PO-253")], "alta", "conferma PO di PO-253", ["PO-253"])
N("8.3", "Offerta di trasferimento e rifiuto", "`transferOffer` (18:6800), `refuseEvent` (18:6885); `generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:656`)", "a sorpresa durante la stagione (18:1251, 18:4632)", 2,
  (80, "situazione del club offerente prima di accettare (PO-005)"),
  (70, "PO-108 crescita delle offerte non applicata (7.999.50)"),
  (40, "`decisioni-50` (rossi `__CPM_NO_CRESC49`, `__CPM_NO_SCALATA50`) fuori catena"),
  (75, "—"), (None, NPC), (55, "probabilità non seedate (`Math.random()<offerProb`, 18:1251)"),
  [CAP_NOG], "media", "`decisioni-50` in catena", [])
N("8.4", "Trattativa del contratto", "`negoModal` (18:6910)", "rinnovo o offerta: «Tratta»", 2,
  (70, "proposta, controproposta, rifiuto; PO-270: il rinnovo di 1 anno firmato nell'ultimo anno non aggiunge stagioni"),
  (65, "PO-270 APERTO (eccezione zona G concessa dal PO il 16/10)"),
  (0, "nessun guardiano in una catena fissa; `rinnovo-270` solo nella catena mirata"), (70, "—"), (None, NPC), (55, "—"),
  [CAP_NOG, CAP_PO("PO-270")], "bassa", "chiudere PO-270; guardiano della trattativa in catena; collaudo Codex", ["PO-270"], ["Trattativa del contratto: nessun guardiano in catena fissa"])
N("8.5", "Ufficio (patrimonio, staff privato, investimenti)", "linguetta `ufficio` (18:10603, `_uff13`: sezioni 18:10647-10676)", "barra «Ufficio», tasto U", 2,
  (60, "PO-157: «dare un effetto reale e visibile a ciò che resta, oppure togliere o accorpare»"),
  (55, "PO-223 APERTO (investimento pendente aggiunge €55.000 alla stagione successiva); PO-265 PARZIALE («metà del conto» toglieva sempre 40.000€)"),
  (65, "`investimento-223`, `meta-conto-265` in catena carriera, verdi nella notte 7.999.171; `griglia-mobile` (`ufficio`)"),
  (55, "PO-157"), (None, NPC), (55, "—"),
  [CAP_PO("PO-157, PO-223, PO-265")], "media", "chiudere PO-223/PO-265; proposta PO-157", ["PO-157", "PO-223", "PO-265", "PO-014"])

# ───────────────────────── 9 NAZIONALE
ramo(9, "Nazionale")
N("9.1", "Scheda Nazionale", "linguetta `nazionale` (18:11130)", "Carriera → «Nazionale» (18:7300)", 2,
  (65, "PO-155: «La convocazione è un tiro di dado settimanale… sistema rattoppato»"),
  (50, "PO-177 APERTA (10 stagioni, OVR 96, presenze sempre 0); PO-089, PO-114 chiuse"),
  (60, "`calendario-nazionale`, `career-nat-sim` nella catena guardiani (ultimo giro 7.999.98)"),
  (55, "PO-066: Nazionale da portare alla card neutra"), (None, NPC), (50, "—"),
  [CAP_PO("PO-155")], "media", "fase 1 Codex e proposta PO-155", ["PO-155", "PO-177", "PO-066"])
N("9.2", "Convocazione e partita in Nazionale", "schermata `nationalCallup` → `NationalCallupScreen` (`src/17-menu-creazione-pannelli.jsx`); `startNationalMatch`", "settimane della Nazionale (`setScreen(\"nationalCallup\")`)", 2,
  (70, "convocazione nel kit standard (PO-235), CT della nazione, intervista dopo la gara (PO-243)"),
  (55, "PO-235 e PO-243 DA VERIFICARE DAL PO; PO-155 IN ATTESA (PO-177 confluita, DOPPIONE)"),
  (65, "`convocazione-235`, `intervista-231` in completa, verdi nella notte 7.999.171; `career-nat-sim` (catena guardiani); `ct-54` fuori catena"),
  (70, "—"), (None, NPC), (55, "—"),
  [CAP_PO("PO-155, PO-235, PO-243")], "media", "conferma PO di PO-235/PO-243; proposta PO-155", ["PO-155", "PO-235", "PO-243", "PO-177"])
N("9.3", "Tornei per nazionali (Coppa delle Nazioni, Europeo, Mondiale)", "`nationsCupModal` (18:7185), `euroMondiale`", "settimana 20/24 secondo il ciclo (stab-nat-trigger)", 2,
  (70, "qualificazioni, gironi, eliminazione"),
  (50, "PO-183 FATTO (collaudo Codex 07/10); storia di correttive (7.999.103, 7.999.104, 7.999.105, PO-090) −10; PO-155 IN ATTESA (difetto di codice confermato)"),
  (80, "`coppa-nazioni` in `career-critical`; `euro-attesa-181`, `riquadro-euro-105`, `recupero-103` in catena carriera, verdi nella notte 7.999.171"),
  (65, "—"), (None, NPC), (50, "—"),
  [CAP_PO("PO-155")], "alta", "correggere PO-155; fase 1 Codex", ["PO-155", "PO-183"])

# ───────────────────────── 10 MEDIA E RELAZIONI
ramo(10, "Media e relazioni")
N("10.1", "Intervista post-partita (3D)", "`interviewModal` (18:6483), `InterviewStage3D` (`src/16-scene-3d-cerimonie.jsx:323`), `InterviewScena2D` (16:230), `TavoloStampa24` (16:879)", "dopo la partita, in coda alle altre finestre (18:3517)", 2,
  (80, "domanda, rilancio per tono (PO-040), esito; anche dopo le gare della Nazionale (PO-243)"),
  (60, "PO-243 DA VERIFICARE DAL PO; chiuse PO-008 (×2 release), PO-020, PO-040, PO-129, PO-138"),
  (65, "`intervista-231` in completa, `conferenza-192` in carriera, verdi nella notte 7.999.171; `giornaliste-169`, `intervista-2d` fuori catena"),
  (70, "foglio in basso quando c'è la scena (18:6483)"), (None, NPC), (50, "scena 3D in `src/16`"),
  [CAP_PO("PO-243")], "media", "conferma PO di PO-243", ["PO-243"])
N("10.2", "Esito dell'intervista", "`interviewFeedback` (18:6670)", "dopo l'ultima risposta", 1,
  (75, "effetti della risposta"), (80, "nessuna voce aperta"), (0, "nessuno"), (70, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "guardiano", [])
N("10.3", "Relazioni: spogliatoio, rivale, stampa", "Club → «Lo spogliatoio» (18:9676), Profilo → «Rivale» (18:9916), «La Stampa» (18:10008); eventi di spogliatoio (18:4147) e del rivale (18:4698)", "schede Club e Profilo; eventi settimanali", 2,
  (70, "compagni, rivale, giornalisti con memoria parziale"),
  (80, "nessuna voce aperta"),
  (20, "`critica-context-test` fuori catena"),
  (65, "PO-154: nessuna memoria negli impulsi"), (None, NPC), (55, "—"),
  [CAP_NOG], "bassa", "fase 1 Codex con metriche sulle relazioni", ["PO-154"])

# ───────────────────────── 11 CERIMONIE E SCENE 3D
ramo(11, "Cerimonie e scene 3D")
N("11.1", "Serata di presentazione della squadra", "`presEvent` (18:5933), `PresentationStage3D` (`src/16-scene-3d-cerimonie.jsx:1019`), `PresentazioneScena2D` (16:963)", "assistente d'apertura, passo «presentazione» (18:957)", 2,
  (80, "corpi CGTrader e figurina piccola «da televisione» (7.999.124)"),
  (70, "PO-200 chiusa in 7.999.124"),
  (70, "`presentazione-200` in catena grafica, rosso `__CPM_NO_PRES200`, verde sull'ultimo giro grafica registrato (7.999.146, 07/10)"),
  (70, "—"), (60, "PO-137 «tutte le scene 3D fuori dalla partita a qualità professionale» aperta"), (45, "PO-171: corpi CH38 ancora in cerimonie"),
  [CAP_PO("PO-137")], "alta", "collaudo PO di PO-200; PO-137", ["PO-137", "PO-171"])
N("11.2", "Premiazione di squadra in campo", "fase `ceremony` (`src/15-live-match.jsx:10790`), decisione `_titleStakes` (`src/18-career-app.jsx:6024`)", "fischio finale della gara che assegna il titolo", 2,
  (65, "PO-002 PARZIALE: «Il passaggio della coppa non è confermato»; PO-150 confluita in PO-002 (DOPPIONE, decisione PO 05/10)"),
  (35, "PO-191 corretta in quattro release (7.999.116-119); 7.686 «trofeo a metà torneo»; `cerimonie` rosso dal 24/09 (PO-137); i rossi del giro 7.999.126 (`premiazione-palco-191`, `coppa-mani-191`, campioni insufficienti) non ci sono più sull'ultimo giro grafica registrato (7.999.146, 07/10)"),
  (65, "quattro guardiani 191, `passaggio-coppa-137`, `cerimonie`, `scene-fuori-137` in catena grafica; i quattro 191 verdi sull'ultimo giro grafica registrato (7.999.146); gli altri tre non hanno ancora un giro grafica registrato"),
  (45, "decisione PO 30/09 «cerimonie diverse per competizione» non ancora applicata (sospesa a L8)"),
  (45, "PO-191 «eroe che vola», «coppa non in mano»; PO-137"),
  (40, "camera e corpi in `src/12`"),
  [CAP_PO("PO-002, PO-137")], "alta", "chiudere PO-002/137 in L8; un giro registrato della catena grafica completa", ["PO-002", "PO-137", "PO-150", "PO-071"])
N("11.3", "Festa del titolo (finestra)", "`titleCeleb` (18:7002): «COPPA VINTA!», «TRIONFO EUROPEO!»", "dopo un titolo", 1,
  (75, "festa a schermo, pulsante «Festeggia» in oro da festa (PO-251)"), (65, "PO-251 DA VERIFICARE DAL PO (7.999.170)"), (0, "`festa-oro-251` solo nella catena mirata"), (60, "terzo modo di festeggiare oltre a cerimonia in campo e parata"), (None, NPC), (60, "—"),
  [CAP_NOG, CAP_PO("PO-251")], "bassa", "decidere col PO se resta accanto alle cerimonie 3D; `festa-oro-251` in una catena fissa", ["PO-251"])
N("11.4", "Galà dei premi", "schermata `seasonAwards` (18:5906) → `SeasonAwardsScreen` (`src/16-scene-3d-cerimonie.jsx:2209`) → `GalaStage3D` (16:1848), `GalaScena2D` (16:1831)", "fine stagione, prima della chiusura (18:5912)", 2,
  (85, "busta dal 3° al 1° a tocchi, per tutti i premi (7.999.125)"),
  (45, "decisione cambiata tre volte: PO-109 (7.999.51-52), PO-199 (7.999.124 e 7.999.125); PO-001"),
  (65, "`busta-199` (rossi `__CPM_NO_BUSTA199`, `__CPM_NO_TUTTI201`) in catena grafica, verde sull'ultimo giro grafica registrato (7.999.146, 07/10)"),
  (50, "`gala-3d.mjs` verifica ancora «Apri la busta porta DIRETTO al premio vinto», comportamento superato dalla decisione PO 03/10"),
  (60, "PO-137 aperta"), (45, "`src/16` 3.242 righe"),
  [CAP_PO("PO-137")], "alta", "aggiornare o ritirare `gala-3d`; collaudo PO 7.999.125", ["PO-137", "PO-199"], ["Guardiano `gala-3d` obsoleto (verifica la busta diretta, superata il 03/10)"])
N("11.5", "Podio della stagione", "`Podio23` (`src/16-scene-3d-cerimonie.jsx:2237`) dentro il galà", "galà dei premi", 1,
  (75, "podio con figurine"), (75, "PO-006, PO-007 chiuse"), (0, "nessun guardiano dedicato"), (70, "—"), (None, NPC), (55, "—"),
  [CAP_NOG], "bassa", "scatto in catena grafica", [])
N("11.6", "Parata del pullman", "`ParataCompleta198` (`src/16-scene-3d-cerimonie.jsx:1408`), `ParataBus3D` (16:1415), montata in `SeasonEndScreen` (16:2657)", "fine stagione da campione (`parata-test`)", 1,
  (75, "squadra CGTrader sul tetto (7.999.123)"),
  (55, "PO-009 (7.982) e PO-198 (7.999.123): rifatta due volte"),
  (70, "`parata-198` (rosso `__CPM_NO_PARATA198`) in catena grafica, verde sull'ultimo giro grafica registrato (7.999.146, 07/10)"),
  (70, "—"), (55, "PO-137 aperta"), (45, "—"),
  [CAP_PO("PO-137")], "alta", "collaudo PO della 7.999.123", ["PO-137"])
N("11.7", "Stadi 3D", "`buildStadium` (`src/11-ui-kit-highlight.jsx:747`), `makeCrowdTex` (11:425), folla (`src/10`)", "in ogni scena 3D", 2,
  (70, "PO-071: fase 3 (nuove tipologie) senza release"),
  (75, "nessun difetto aperto; PO-127 «tribune da dietro» è della regia"),
  (40, "`stadi-70`, `pali-69` con rossi e `galleria-stadi` fuori catena"),
  (70, "—"), (50, "PO-071 «la grafica degli stadi deve essere migliorata il più possibile»"), (45, "—"),
  [CAP_NOG, CAP_PO("PO-071")], "media", "fase 3 di PO-071; `stadi-70` in catena", ["PO-071"])

# ───────────────────────── 12 FINE STAGIONE E CARRIERA
ramo(12, "Fine stagione e fine carriera")
N("12.1", "Fine stagione", "schermata `seasonEnd` (18:6005) → `SeasonEndScreen` (`src/16-scene-3d-cerimonie.jsx:2650`); `doStartNewSeason` (18:4934)", "dopo il galà (18:5912)", 3,
  (80, "bilancio, parata se campione, nuova stagione o ritiro"),
  (55, "PO-174 BLOCCANTE fine prestito (7.999.91); PO-193 «settimana 39 di 38» (7.999.113); PO-186"),
  (55, "`career-invariants` (cambio stagione) in `career-critical`; `career-sim-test`, `prestito-91`, `retire-announce-test` fuori catena"),
  (75, "—"), (None, NPC), (50, "—"),
  [], "media", "`career-sim-test` (N stagioni) in catena", ["PO-153"])
N("12.2", "Annuncio del ritiro e stagione d'addio", "passo «addio» dell'assistente (18:960), conferma (18:10374), `doRetire` (18:4923)", "dai 34 anni a inizio stagione; dal Profilo", 1,
  (75, "annuncio, stagione d'addio, ritiro"), (80, "nessuna voce aperta"),
  (40, "`retire-announce-test` fuori catena"), (75, "—"), (None, NPC), (60, "—"),
  [CAP_NOG], "media", "`retire-announce-test` in catena", [])
N("12.3", "Fine carriera", "schermata `careerEnd` (18:5924) → `CareerEndScreen` (`src/17-menu-creazione-pannelli.jsx:979`), `calcLegacyScore` (17:916)", "ritiro; un salvataggio ritirato apre sempre questa pagina (18:5926)", 2,
  (75, "pagina celebrativa con punteggio di eredità"),
  (75, "nessuna voce aperta"),
  (20, "nessun guardiano del flusso (`slot-card-layout-test` cita solo lo stato)"),
  (75, "—"), (None, NPC), (60, "ricostruisce i dati dal salvataggio (7.258)"),
  [CAP_NOG], "bassa", "collaudo Codex con scheda di una carriera fino al ritiro", [], ["Fine carriera: nessun guardiano del flusso fino al ritiro"])
N("12.4", "Nuova partita+ (eredità)", "`onNewGamePlusCB` (`src/19-app-root.jsx:972`) → `CreateScreen` con `legacyBonus` (19:968)", "dalla pagina di fine carriera", 1,
  (65, "bonus passato alla creazione"), (80, "nessuna voce in BACKLOG.md"), (0, "nessuno"), (None, NPC), (None, NPC), (60, "—"),
  [CAP_NOG], "bassa", "collaudo Codex", [])

# ───────────────────────── 13 SISTEMI TRASVERSALI
ramo(13, "Sistemi trasversali")
N("13.1", "Motore della partita (brain)", "`src/14-motore-possesso.jsx`: `simulaPartitaMotore`, `probEroe`", "ogni partita, simulata o vissuta", 3,
  (70, "PO-202 FATTO (7.999.137-138: il brain decide tutto); PO-022 PARZIALE (scene generate dal moto, 7.999.169)"),
  (35, "PO-262 APERTO (`match-sequence` ROSSO: determinismo); PO-228 APERTO (statistiche); PO-190 DA COLLAUDARE; PO-022 PARZIALE; goleade ricorrenti nello storico"),
  (85, "`partita-vera`, `test:logic`, `passaggi-228`, `statistiche-228` in completa; `rigori-190`, `debito-190`, `brain-202`, `possesso-209`, `tempo-138` in carriera; notte 7.999.171 verde; `match-sequence` non è in nessuna catena"),
  (60, "«brain unico» fatto per `probEroe` e per la scena (PO-202), non ancora per i gesti (PO-022)"),
  (50, "PO-228: «811,3 passaggi su 40 partite» (foto po228-statistiche-86min.jpg)"),
  (60, "seme deterministico per partita, ma PO-262: la stessa partita giocata 4 volte non è identica"),
  [CAP_PO("PO-262, PO-228, PO-022")], "alta", "chiudere PO-262 (determinismo) e PO-228; `match-sequence` in catena", ["PO-022", "PO-190", "PO-228", "PO-262", "PO-202", "PO-021", "PO-030", "PO-031", "PO-064"])
N("13.2", "Simulazione delle altre partite e classifiche", "`simulateMatch` (`src/10-folla-stadi-ritiro.jsx`), `updateStandings` (`src/09-audio-scout-anagrafiche.jsx`)", "ogni avanzamento di settimana", 3,
  (80, "risultati di tutte le leghe"),
  (50, "PO-264 PARZIALE (Europa simulata: lo svincolato riceve una voce di storico); storico PO-175, PO-182 chiuse"),
  (85, "`career-invariants`, `classifica-102`, `svincolato-264` in catena, verdi nella notte 7.999.171; `sim-motore-test` (rosso `__CPM_NO_SIMV2`)"),
  (75, "`simulateMatch(...,{motore:true})` = motore unico"), (None, NPC), (55, "—"),
  [CAP_PO("PO-264")], "alta", "chiudere PO-264; fase 1 Codex senza anomalie", ["PO-153", "PO-264"])
N("13.3", "Salvataggi e migrazioni", "`storage` (`src/08-panchina-derby-meteo-cori.jsx:585`), `SAVE_VERSION` (`src/07-versione-save-interviste.jsx`), `migratePlayer` (`src/17-menu-creazione-pannelli.jsx`)", "salvataggio automatico a ogni cambio (3 slot `cpm-v3*`)", 3,
  (75, "copia di riserva degli slot e avviso (PO-167 PARZIALE, 7.999.170); manca ancora la persistenza garantita del browser"),
  (55, "PO-183 e PO-176 FATTI (collaudo Codex 07/10); PO-167 PARZIALE; rischi R-01…R-04"),
  (85, "`save-compat`, `save-monotonic` (P0_2), `pending-mr-durable`, `playedmd-registry`, `migrazione-194`, `backup-167` in catena, verdi nella notte 7.999.171"),
  (70, "—"), (None, NPC),
  (40, "R-02: `storage.save` cattura l'errore e restituisce `false` senza avviso (08:626)"),
  [CAP_PO("PO-167")], "alta", "L3 (PO-167, PO-168)", ["PO-167", "PO-183", "PO-176"])
N("13.4", "Calendario e competizioni (generazione)", "`generateSeasonCalendar` (`src/09-audio-scout-anagrafiche.jsx`), innesco dei tornei (`stab-nat-trigger-test.mjs`)", "inizio stagione", 2,
  (80, "campionato, coppe, finestre della Nazionale"),
  (50, "nessuna voce aperta sul nodo; PO-183 FATTO; cinque correttive in 30 release fino alla 7.999.107 (PO-089, PO-181, 7.999.103, .106, .107)"),
  (85, "`career-invariants`, `recupero-103`, `avversario-106`, `rinvio-coppe-107` in catena carriera, verdi nella notte 7.999.171"),
  (70, "—"), (None, NPC), (50, "—"),
  [], "alta", "fase 1 Codex con 30 carriere", ["PO-153", "PO-183"])
N("13.5", "Mercato e contratti", "`generateTransferOffer` (`src/06-archetipi-agenti-sponsor.jsx:656`), `generateProContracts` (06:725)", "offerte in stagione e a fine Under 18", 2,
  (75, "offerte, rinnovi, prestiti"),
  (65, "PO-181 «198 osservazioni di contratto oltre la scadenza»; PO-108 (7.999.50)"),
  (40, "`decisioni-50` fuori catena"), (70, "—"), (None, NPC), (55, "—"),
  [CAP_NOG], "media", "guardiano del contratto scaduto in catena", ["PO-153", "PO-157"])
N("13.6", "Crescita del giocatore e difficoltà", "allenamento automatico (18:3154), crescita a fine gara (18:3879), `adaptiveDifficulty` (`src/06-archetipi-agenti-sponsor.jsx:60`)", "ogni settimana e partita", 2,
  (65, "PO-156 difficoltà unica tarata sulla carriera: in attesa"),
  (65, "PO-177 «OVR fino a 96»"),
  (30, "`career-sim-test` fuori catena"),
  (55, "`adaptiveDifficulty` accanto alla decisione «difficoltà unica»; vista Allenamento orfana (3.8)"), (None, NPC), (55, "—"),
  [CAP_NOG], "media", "proposta PO-156 dopo la fase 1", ["PO-156", "PO-177"])
N("13.7", "Generazione club, rose e nomi", "`CLUBS` (`src/02-club-leghe-albo.jsx:24`), `generateTeamRoster` (`src/09-audio-scout-anagrafiche.jsx:982`), `NAME_BY_NAT` (09:909)", "inizio partita e stagione", 2,
  (80, "nove leghe, rose deterministiche"),
  (80, "PO-184 nomi sopra i corpi (7.999.102) chiusa"),
  (60, "`nomi-51` (rossi) nella catena guardiani; `audit-copyright` non in CI"),
  (75, "—"), (None, NPC), (60, "—"),
  [], "media", "`audit-copyright` in CI prima dello store", [])
N("13.8", "Audio", "`AudioMgr` (`src/09-audio-scout-anagrafiche.jsx:38`), `AudioSettings` (`src/19-app-root.jsx:633`)", "sempre; regolazioni nelle Impostazioni", 1,
  (70, "musica, effetti, pubblico, arbitro"), (80, "nessuna voce aperta"), (0, "`grep AudioMgr tests/visual` = 0 file"), (None, NPC), (None, NPC), (55, "—"),
  [CAP_NOG], "bassa", "collaudo sul telefono; guardiano dei volumi", [], ["Audio: nessun guardiano né collaudo registrato"])
N("13.9", "Prestazioni", "misura in Impostazioni (18:6184, limite 300 ms), `lib/perf-monitor.mjs` (gate)", "—", 2,
  (50, "PO-023: FPS e caricamento sul telefono non misurati"),
  (None, NPC), (30, "R-07: «l'headless non misura gli FPS veri»"), (None, NPC), (None, NPC),
  (40, "file unico 6,5 MB, Babel nel browser (ARCHITETTURA.md)"),
  [CAP_NOG, CAP_PO("PO-023")], "bassa", "PO-023: misura sul telefono a fine lotto", ["PO-023"])
N("13.10", "Gestione degli errori", "`RootErrorBoundary` (`src/19-app-root.jsx:1018`), `MatchErrorBoundary` (`src/13-prepartita-formazioni.jsx:1623`)", "—", 2,
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
  (60, "guanti dei portieri (PO-201 FATTO, 7.999.126); gesti per evento ancora parziali (PO-068)"),
  (55, "PO-068, PO-061, PO-171 PARZIALI (PO-024, PO-070, PO-075 confluite in PO-068)"),
  (75, "`kit-061`, `via-ch38-171`, `guanti-201` in catena grafica; `gesti-copertura-96` (guardiani); `piedi-252` e altri gesti in completa"),
  (50, "PO-171 «Via CH38 ovunque» parziale; DT-04 due modi di muovere le braccia"),
  (50, "PO-061 kit «migliorabile»"), (40, "DT-03 rotazioni a numero"),
  [CAP_PO("PO-061, PO-068, PO-171")], "alta", "chiudere PO-068/PO-061/PO-171", ["PO-068", "PO-061", "PO-171", "PO-201", "PO-024", "PO-070", "PO-075"])
N("13.13", "Kit grafico e tema", "`Card`, `Btn`, `Modal`, `Tabs`, `Fisarmonica` (`src/11-ui-kit-highlight.jsx`), token `TH`/`FS`/`RAD` (src/01)", "ogni schermata", 2,
  (80, "kit unico, tema chiaro/scuro; finestre in primo piano nel Modal standard"),
  (60, "PO-066, PO-230, PO-256 DA VERIFICARE DAL PO"),
  (80, "`design-system` in completa e grafica, `finestra-230`, `toast-256`, `popup-224` in completa, verdi nella notte 7.999.171; `griglia-mobile` (censimento)"),
  (70, "PO-066"), (70, "giro 68: Home a 412 e 360 senza titoli ripetuti (foto, vedi 3.1)"), (60, "—"),
  [CAP_PO("PO-066, PO-230, PO-256")], "alta", "conferma PO di PO-066/PO-230/PO-256", ["PO-066", "PO-230", "PO-256", "PO-188"])

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
_bl1 = open(os.path.join(ROOT, "docs/governo/BACKLOG.md"), encoding="utf-8").read().split("## Storico")[0]
_AP1 = set(_re1.findall(r"^\| (PO-\d+) \|", _bl1, _re1.M))
for n in tutti:
    if n["peso"] > 0 and n["team"] < 80 and not n["aprire"] and not any(v in _AP1 for v in n["voci"]):
        n["aprire"] = ["Consolidamento di «" + n["nome"] + "»: " + n["manca"]]
# ───────────────────────── SCRITTURA
L = []
P = L.append
P(f"# MAPPA DEL GIOCO — build {BUILD} — {DATA}")
P("")
P(f"Consolidamento complessivo: **{var(PREV_GIOCO, GIOCO)} (Team {GIOCO}%)** media semplice dei rami · **{var(PREV_ALT, ALT)}** pesata per tempo di gioco (Partita ×3; Home, Stagione, Sistemi ×2) — entrambe per decisione PO del 03/10 (affidabilità: {afg['alta']} nodi alta · {afg['media']} media · {afg['bassa']} bassa su {len(pesati)} nodi nel conto; nessun valore PO ancora)")
P("")
P("> **Limiti di questa stesura (PO-205, seconda versione, build " + BUILD + ").** Aggiornamento della stesura " + PREV_BUILD + " (03/10) fatto **senza navigare il gioco**: nessun browser aperto per questa stesura. Le sole misure di Resa nuove sono quelle del giro 68, **riferite dalla sessione che le ha prese e non rieseguite qui**: Home (3.1) con `home-066` verde, 112 riquadri, 0 fuori standard a 412 e 360 px, controllo D1 «titolo ripetuto» col rosso `__CPM_NO_DUP068`; analisi pre-partita (5.3) con `analisi-217` verde a 412×915 e 360×780; Crediti (1.6) con `crediti-254` e il rosso `__CPM_NO_CRED267B`; le foto esistono in `docs/sviluppo/foto/giro68/` (verificato l'elenco dei file, non il contenuto). Stati delle voci letti da `BACKLOG.md` (sezione aperte/storico) e confrontati con `BACKLOG.md` della 7.999.126 (commit ef17137); guardiani letti dalle catene fisse di `tests/visual/ci-runner.mjs` (completa, carriera, grafica, guardiani — i guardiani presenti solo nella catena `mirata`, cioè nella MAPPA file→guardiani, **non** contano per il tetto del 70%); esiti dall'ultimo giro per catena in `STABILITA.json` (notte 7.999.171 del 17/10 89/89 verde; grafica registrata solo fino alla 7.999.146 del 07/10: `home-066`, `analisi-217`, `kit-061`, `stadi-071`, `cerimonie` non hanno un giro grafica registrato). Numeri di riga rimappati con `git diff ef17137 -- src` (righe intatte esatte; 8 riferimenti caduti in righe riscritte ricontrollati a mano con `grep`); dove il riferimento non era più verificabile il numero è stato tolto. Nodi nuovi dal codice: 1.6 Crediti, 1.7 Copia di riserva, 3.9 Finestre in primo piano; nodo tolto: 3.8 Allenamento. Il resto della prima stesura vale ancora: Resa «Non posso confermarlo» dove non c'è una misura o una foto del PO.")
P("")
P("> **Prima stesura (" + PREV_BUILD + ").** Albero generato **dal codice** (`grep` su `src/*.jsx`: stati `screen`/`setScreen`, fasi `phase` di `App`, `LiveMatch` e `TrialFlow`, linguette `tab`, finestre `…Modal` e overlay di `CareerApp`, componenti di scena 3D) e dai documenti di governo (`BACKLOG.md`, `ROADMAP.md`, `DECISIONI.md`, `RISCHI.md`, `ARCHITETTURA.md`, `STABILITA.json`). **La verifica navigando il gioco NON è stata fatta** (macchina occupata dai collaudi, nessun browser): per questo il criterio **Resa** ha un punteggio solo dove esiste una misura o una segnalazione del PO, altrove è «Non posso confermarlo». La versione 7.999.126 è la release in corso (guanti dei portieri, formazioni). I numeri di riga di quella stesura valevano per quella build.")
P("")
P("## Legenda e griglia")
P("")
P("**Sei criteri, punteggio 0-100 ciascuno, ognuno con una riga di prova.**")
P("")
P("| Criterio | Peso | Come si dà il punteggio |")
P("|---|---:|---|")
P("| Funzione | 25% | 90+ completa e raggiungibile, tutto ciò che il PO ha chiesto c'è · 70-89 completa con lacune note · 50-69 parziale · <50 incompleta o non raggiungibile (letto nel codice) |")
P("| Stabilità | 20% | parte da 100: −15 per ogni difetto aperto/parziale/da collaudare sul nodo, −25 per un bloccante aperto, −10 per ogni correzione ripetuta (stesso difetto riaperto o corretto in più release) nel registro recente (7.999.126 → 7.999.173) o per un rosso sull'ultimo giro di `STABILITA.json`. Le voci chiuse da tempo pesano meno (giudizio dichiarato) |")
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
P("**Decisioni del PO sulla griglia (questionario del 03/10, `DECISIONI.md` righe 53-55), applicate dallo script:**")
P("1. *Resa senza prova.* Il criterio resta fuori dalla media, ma **un nodo senza Resa misurata non supera il 75%** (alternative scartate dal PO: solo esclusione; contarla 50). Oggi 51 nodi su 66 hanno la Resa senza punteggio.")
P("2. *Peso dei rami.* Si mostrano **entrambe** le medie del gioco: semplice e pesata per tempo di gioco (Partita ×3; Home, Stagione, Sistemi ×2; gli altri ×1). Con quei pesi il gioco vale " + "{ALT}" + "%.")
P("3. *Tetto del 70%.* Conta come guardiano **solo** quello che gira in una catena di collaudo (alternative scartate: qualunque guardiano col rosso; anche le sonde). Interpretazione di questa stesura: catene fisse di `ci-runner.mjs`, non la `mirata`.")
P("4. *Stabilità (proposta ancora aperta).* Oggi è una formula applicata a mano sulle voci del backlog: andrebbe calcolata da uno script su `BACKLOG.md` + `STABILITA.json` per nodo (serve una colonna «nodo» nel backlog).")
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
P(f"Korward Elite {BUILD} — {var(PREV_GIOCO, GIOCO)} (Team {GIOCO}%)")
for i, r in enumerate(RAMI):
    lastr = i == len(RAMI) - 1
    pr = "└── " if lastr else "├── "
    P(f"{pr}{r['num']} {r['nome']} — {var(PREV_RAMI.get(r['num']), r['team'])} (Team {r['team']}%) [{r['aff']}]")
    for j, n in enumerate(r["nodi"]):
        lastn = j == len(r["nodi"]) - 1
        ind = "    " if lastr else "│   "
        pn = "└── " if lastn else "├── "
        extra = " (peso 0, fuori dal conto)" if n["peso"] == 0 else ""
        nuovo = " (nodo nuovo)" if n['id'] not in PREV_NODI else ""
        P(f"{ind}{pn}{n['id']} {n['nome']} — Team {var(PREV_NODI.get(n['id']), n['team'])} [{n['aff']}] · PO: __%{extra}{nuovo}")
P("```")
P("")
P("| Ramo | Valore | Nodi | Pesi dei nodi (importanza) | Affidabilità (quota del peso) |")
P("|---|---:|---:|---|---|")
for r in RAMI:
    pes = ", ".join(f"{n['id']}×{n['peso']}" for n in r["nodi"])
    q = r["affq"]
    P(f"| {r['num']} {r['nome']} | {var(PREV_RAMI.get(r['num']), r['team'])} (Team {r['team']}%) | {len(r['nodi'])} | {pes} | alta {q['alta']}% · media {q['media']}% · bassa {q['bassa']}% |")
P("")

# Variazioni rispetto alla stesura precedente
P("## Variazioni rispetto alla stesura " + PREV_BUILD)
P("")
P(f"Gioco: media semplice {var(PREV_GIOCO, GIOCO)} · pesata {var(PREV_ALT, ALT)}. Nodi nel conto: {len(PREV_NODI) - 1} → {len(pesati)}.")
P("")
P("| Nodo | Prima | Ora | Perché (prova di Stabilità, il criterio che si è mosso di più) |")
P("|---|---:|---:|---|")
_ch = []
for n in tutti:
    o = PREV_NODI.get(n["id"])
    if o is None or o != n["team"]:
        _ch.append((n["team"] - (o if o is not None else n["team"]), n, o))
for d, n, o in sorted(_ch, key=lambda x: (x[2] is None, -abs(x[0]))):
    why = n["crit"]["S"][1] if o is not None else "nodo nuovo nel codice: " + n["ident"]
    P(f"| {n['id']} {n['nome']} | {'—' if o is None else str(o) + '%'} | {n['team']}% | {why} |")
for nid, why in TOLTI.items():
    P(f"| {nid} (tolto) | {PREV_NODI[nid]}% | — | {why} |")
P("")
P("Nota: anche i nodi senza variazione hanno le prove riscritte dove serviva (guardiani verdi nella notte 7.999.171, numeri di riga rimappati), con lo stesso punteggio.")
P("")

# Schede
import re as _re0
_bl0 = open(os.path.join(ROOT, "docs/governo/BACKLOG.md"), encoding="utf-8").read().split("## Storico")[0]
_AP0 = set(_re0.findall(r"^\| (PO-\d+) \|", _bl0, _re0.M))
def _fmt0(v): return v if v in _AP0 else v + " (chiusa)"
P("## Schede dei nodi")
P("")
for r in RAMI:
    P(f"### Ramo {r['num']} — {r['nome']} — {var(PREV_RAMI.get(r['num']), r['team'])} (Team {r['team']}%)")
    P("")
    for n in r["nodi"]:
        P(f"#### {n['id']} {n['nome']} — Team {var(PREV_NODI.get(n['id']), n['team'])} [{n['aff']}] · PO: __%" + ("" if n['id'] in PREV_NODI else " (nodo nuovo)"))
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
_bl = open(os.path.join(ROOT, "docs/governo/BACKLOG.md"), encoding="utf-8").read().split("## Storico")[0]
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
 ("trasversale", "Catena `guardiani` senza alcun giro in `STABILITA.json` (68 giri registrati: completa, carriera, notte, mirata, grafica); catena `grafica` registrata l'ultima volta sulla 7.999.146 (07/10): `home-066`, `analisi-217`, `kit-061`, `stadi-071`, `cerimonie`, `scene-fuori-137`, `passaggio-coppa-137` non hanno mai un giro registrato"),
 ("trasversale", "BACKLOG.md: PO-268 risulta APERTO ma il codice toglie già numero d'ordine e data dai Crediti (`src/17-menu-creazione-pannelli.jsx:154`, rosso `__CPM_NO_CRED268`)"),
 ("trasversale", "PO-262: `match-sequence` (determinismo) ROSSO e fuori da ogni catena"),
 ("trasversale", "(storico, 7.999.126) Giro grafico 7.999.126: `rimbalzo-189`, `premiazione-palco-191`, `coppa-mani-191` rossi per campioni insufficienti (4 disegni su 8 richiesti, 11 campioni su 20, 2 su 10: `const ok` dei tre guardiani) — da ripetere su macchina scarica e rendere i guardiani robusti al carico; `walkout-fermi-197` rosso invece sulla misura (verde: somma 10 contro un massimo di 5,3 = un terzo del rosso 16), coerente con PO-206"),
 ("trasversale", "Componenti definiti e mai montati: `AIDecisionOverlay` (src/13:523), `Player3DViewer` (src/01:740), `AISettingsCard` (src/17:713)"),
 ("trasversale", "(storico, risolto) BACKLOG.md: PO-201 e PO-204 risultavano «DA FARE»; oggi sono FATTO nello storico"),
]
for j, (nid, a) in enumerate(extra, len(aprire) + 1):
    P(f"{j}. **{a}** — {nid}.")
P("")

# Autocritica
P("## Autocritica")
P("")
P("**Rami che sembravano «a posto» e che la griglia mostra non esserlo.**")
P("- *Stagione e ciclo settimanale (aggiornato " + BUILD + ").* Il salto del ramo 3 e dei nodi 5.1, 9.3, 13.3 viene quasi tutto dalla chiusura di PO-183 (bloccante) e PO-176 col collaudo Codex del 07/10: cadono tre tetti del 50%. Ma la «partita già giocata» resta alla nona ricorrenza documentata (07:126): verde dei guardiani ≠ stabile, i guardiani coprono i casi già visti.")
P("- *Highlight (5.7).* Fermo al 50%: 17 voci del 03/10 sono uscite dal BACKLOG come DOPPIONE (05-06/10), non come risolte, e ne sono entrate 16 nuove (PO-218…PO-271). Il numero di voci chiuse non misura il nodo.")
P("- *Resa del giro 68.* Home (3.1), analisi pre-partita (5.3) e Crediti (1.6) hanno ora una Resa con foto e guardiano, ma è una misura del team: nessuno dei tre è confermato dal PO (voci DA VERIFICARE), quindi il tetto dell'80% resta.")
P("- *Cerimonie.* Molte release recenti (7.999.116-125) le hanno «chiuse», ma ogni chiusura è una correzione di un rilievo del PO sulla stessa scena; due guardiani su quattro della premiazione sono rossi sull'ultimo giro (per pochi campioni: la correzione non è smentita, ma nemmeno confermata) e `gala-3d` verifica un comportamento ormai superato.")
P("- *Percorso iniziale.* Funziona e nessuno lo segnala, ma creazione, provini e auto-ripresa non hanno un guardiano in catena e la ripresa è spenta proprio sotto `cpmtest=1`: è «a posto» perché nessuno lo guarda.")
P("- *Club, Carriera, Agente/Ufficio.* Le schede sono misurate solo dal censimento `griglia-mobile`, che non può diventare rosso: i valori di Test sono bassi e il tetto 70% vale quasi ovunque.")
P("")
P("**Dove la stima dipende solo dal giudizio e potrebbe essere ottimista.**")
P("- *Funzione* delle linguette (Club, Profilo, Agente, Ufficio, Nazionale): letta dal codice, non navigata. Una sezione può esistere nel codice ed essere vuota o rotta a schermo.")
P("- *Resa esclusa* dove manca una prova (con tetto 75%): 51 nodi su 66 la hanno senza punteggio e la loro media si calcola sugli altri criteri. Se la Resa reale fosse bassa i valori scenderebbero (vedi correzione 1).")
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
open(OUT, "w", encoding="utf-8").write(txt)

print("GIOCO", GIOCO, "ALT", ALT, "nodi", len(tutti), "pesati", len(pesati), "aff", afg, "Rnull", nRnull)
for r in RAMI: print(r["num"], r["nome"], r["team"], r["aff"])
print("deboli", [(n["id"], n["team"]) for n in ord_[:10]])
print("solidi", [(n["id"], n["team"]) for n in sorted(pesati, key=lambda n: (-n["team"], -n["peso"]))[:10]])
print("bassa", [n["id"] for n in tutti if n["aff"] == "bassa"])
