# Roadmap POC Character System — Korward Elite

**Ramo di lavoro corrente:** checkout `poc/marioprada-character-system-local`; backup verificato su `origin/poc/marioprada-character-system` (baseline `4c81b8e`).
**Produzione / GitHub Pages:** `main` → `/(root)`, invariata.
**Ultimo aggiornamento:** 23 settembre 2026, 11:47 (Europe/Rome, orologio del container, letto con `date`)
**Stato complessivo stimato:** 68% — presa, dribbling, passaggio e tiro misurati nel banco (contatto, un gesto per azione, orientamento, T-pose); kit a chiazze corretto. Telefono, figurine e giudizio visivo del PO aperti. Non e' un quality gate finale.
**Fase corrente:** 4/7 — highlight guidati dal motore unico («brain», direttiva PO 23/09): blocco B del MACRO-PIANO, da B0.

## Avanzamento 22 settembre 2026, 20:48

- **Verificato:** il sorgente principale è stato ripristinato dalla versione Git valida dopo una perdita di formattazione locale; gli asset CGTrader e le clip approvate sono ancora presenti. La build locale è stata rigenerata e il match si apre con il roster CGTrader a corpi interi.
- **Verificato:** è stata ricostruita la selezione delle clip approvate e la modalità di anteprima `cgtrader-highlight-optimized`. Il test locale del portiere ha mostrato che una selezione successiva dell'highlight sostituiva la fixture iniziale; il percorso deterministico è stato corretto nel sorgente e la build è stata rigenerata.
- **Modifica in attesa di verifica visiva:** la presa alta dirige la traiettoria verso la quota delle mani e, nell'ultimo tratto, verso le ossa delle due mani del portiere CGTrader. La connessione del browser di collaudo è scaduta prima di poter confermare visivamente il risultato finale.
- **Aperto:** qualità del gesto completo (busto e braccia), sincronismo palla, transizioni e prestazioni mobile. Le precedenti misure su telefono di 11–16 FPS restano un FAIL; nessuna build validata è stata pubblicata sul link ufficiale.
- **Prossimo criterio di chiusura:** ripetere il test deterministico del portiere, controllare fotogrammi di presa e recupero, poi dribbling/passaggio/tiro e infine misurare FPS e fluidità su telefono. `main` e la GitHub Pages ufficiale non sono stati modificati.

## Avanzamento 22 settembre 2026, 21:08

- **Verificato nel browser locale:** il match CGTrader si avvia e mostra il roster a corpi interi, senza errore JavaScript visibile. Durante l'highlight il contatore riportava 22 FPS; è una misura locale istantanea, non un benchmark mobile.
- **FAIL del percorso di collaudo:** con `cpmForce=keeper`, il primo highlight giocabile era ancora «Tentativo di filtrante», quindi una scelta successiva prevale sulla fixture iniziale. La correzione precedente non è sufficiente. La presa alta resta modificata nel codice ma non è ancora verificata visivamente.
- **Prossimo criterio di chiusura:** individuare il punto che sostituisce la fixture, far aprire davvero «Chiama il portiere», osservare presa e recupero della palla, poi riprendere i gate delle altre animazioni e della performance mobile. Nessuna pubblicazione sul link ufficiale.

## Avanzamento 22 settembre 2026, 21:43

- **Verificato:** la fixture `cpmForce=keeper` aveva sette situazioni candidate e la prima era «Muro in area». La situazione iniziale era corretta, ma veniva sostituita all'apertura dell'highlight. Ora la fixture è fissata in quel punto, solo con `cpmtest=1`; la sonda temporanea è stata rimossa.
- **Verificato nel browser locale:** il primo highlight ha mostrato «Muro in area» con l'azione «Chiama il portiere» selezionabile; il click ha avviato il gesto senza errore visibile. La build `dist` è stata rigenerata con esito positivo.
- **Non ancora verificato:** il fotogramma decisivo della presa e il possesso della palla dopo la presa. L'azione è passata rapidamente al flusso della partita, perciò la singola immagine catturata non dimostra il sincronismo completo né la coordinazione delle braccia.
- **Prossimo criterio di chiusura:** catturare la sequenza della presa in più fotogrammi, verificare contatto mani-palla e recupero; poi testare dribbling, passaggi e tiri e infine le prestazioni su telefono. Nessuna build ufficiale pubblicata.

## Avanzamento 22 settembre 2026, 23:05 — presa in carico Claude Code

**Fase corrente:** 4/7 · **Stato complessivo stimato: 60%** (abbassato da 65% non per una regressione nuova,
ma perche' e' emerso un debito strutturale che prima non era censito — vedi il punto 1).

### 1. ⚠️ RISCHIO STRUTTURALE — `src/` e il file di gioco NON raccontano la stessa cosa

**Fatto osservato, misurato:** in questo ramo `node tools/check-src.mjs` dichiara **DIFFERISCONO**. La prima
divergenza e' alla **riga 231, offset 76055**: il file di gioco dice «Ritratti statici del modello Regular,
generati offline», i frammenti dicono «Libreria avatar DiceBear (stile adventurer)». Ricomposto da `src/`
= **6.249.773 byte**, sul disco = **6.325.391 byte**; confrontati a blocchi di 200 caratteri, **506 blocchi
differiscono**.

**Conseguenza operativa, e non e' un dettaglio:** tutto il lavoro POC vive **solo in
`CARRIER-MANAGER-AV.html`**, non nei frammenti. Quindi in questo ramo **`node tools/build-src.mjs` e' un
comando DISTRUTTIVO**: ricostruisce il file dai frammenti e **cancella il lavoro POC**.

**Come l'ho verificato — dichiarato perche' e' un mio errore, non una prova pianificata:** ho lanciato
`node tools/build-src.mjs --dry-run` dando per scontato che quel flag esistesse. Non esiste: il comando ha
ignorato l'argomento e **ha ricostruito il file di gioco**. Ripristinato subito da git e verificato al byte
(`git hash-object` = `92191541499eb0c160dcdc984b7270451912bb5d`, identico a `HEAD:CARRIER-MANAGER-AV.html`,
6.325.391 byte, albero pulito). **Nessun danno permanente**, ma la trappola e' reale e ora e' scritta.

**Regola per chiunque lavori qui:** in questo ramo non si lancia `build-src.mjs`. La fonte di verita' e' il
file di gioco. Riallineare `src/` al file di gioco e' un lavoro a se' (506 blocchi), da decidere
separatamente: non va infilato dentro il ripristino del roster ottimizzato.

### 2. Stato del roster ottimizzato — confermato quanto dichiarato nella consegna

Occorrenze reali (`grep -o`, non conteggio di righe: la copia di recupero e' compattata e una riga sola puo'
contenere decine di occorrenze), file di gioco attuale contro copia di recupero:

| simbolo | attuale | recupero |
| --- | ---: | ---: |
| `cgtrader-highlight-optimized` | **2** | **11** |
| `__CPM_CGTRADER_CINEMA_ROSTER` | **0** | 1 |
| `__CPM_CGTRADER_RENDER_BUDGET` | **0** | 1 |
| `LOD0` | **0** | 1 |
| `LOD1` | 4 | 4 |
| `LOD2` | 3 | 3 |
| `CastPortrait` | **0** | 3 |
| `CAST_SHEETS` | **0** | 2 |
| `gk-high-catch` | **3** | 1 |

**Lettura:** il parametro e' riconosciuto (2 occorrenze) ma **l'implementazione e' in gran parte assente** —
niente roster cinematografico, niente budget renderer, niente LOD0. E' esattamente il sintomo descritto
(«parametro riconosciuto, ottimizzazione non applicata, corpi pieni a 1-2 FPS»): **confermato dai simboli**,
non ancora dalla misura FPS, che devo ancora rifare io.

**Non verificato da me finora:** gli 1-2 FPS e i «corpi pieni» sono **ripresi dalla consegna**, non ancora
misurati in questa sessione. Prossimo passo: misurarli, per avere il rosso di partenza prima del rimedio.

### 3. Prossimo lavoro e criterio di chiusura

Misurare il rosso di partenza sulla situazione 33 con `cgtrader-highlight-optimized` (corpi resi, FPS,
presenza dei tre LOD), poi ricostruire **nel file di gioco** roster cinematografico, LOD0/1/2, Hero LOD0,
contesto attivo e budget renderer, prelevando dalla copia di recupero **solo le parti necessarie**.
**Chiude quando:** corpi resi nell'highlight scendono al contesto attivo, i tre LOD risultano caricati,
`__CPM_CGTRADER_CINEMA_ROSTER` e `__CPM_CGTRADER_RENDER_BUDGET` rispondono, gli FPS locali risalgono
rispetto al rosso misurato, **e la partita normale non cambia** (verifica appaiata senza il parametro).

---

## Avanzamento 22 settembre 2026, 23:25 — LA STRATEGIA DI MERGE, MISURATA

Nota del PO: «occhio che su molti aspetti sei tu molto avanti, bisogna fare un merge davvero intelligente».
Misurato invece che stimato, ed e' vero — ma il quadro e' **molto piu' favorevole** di quanto sembri.

### Quanto sono distanti i due rami (fatti osservati)

| | valore |
| --- | --- |
| versione del gioco nel POC | **7.949.0** |
| versione su `main` | **7.979.0** |
| base comune | `8dc3aaf`, **17/09 20:37** — cinque giorni |
| commit di `main` non nel POC | **56** |
| commit del POC non in `main` | **166** |

### DOVE hanno lavorato i due rami — ed e' qui che il merge diventa facile

| ramo | dove ha scritto |
| --- | --- |
| `main` (30 versioni) | **solo in `src/`**: 2.374 righe su 12 frammenti |
| POC (166 commit) | **`CARRIER-MANAGER-AV.html`: +402 / −180**, piu' asset, strumenti, documenti |
| **file di `src/` toccati dal POC** | **ZERO** |

**I due rami non si sovrappongono quasi per niente.** Il POC non ha mai toccato un frammento; `main` non ha
mai toccato `tests/character-lab/` ne' gli asset CGTrader.

### Dove cadono i 42 blocchi di codice POC

| destinazione | blocchi | e `main`, nello stesso periodo |
| --- | ---: | --- |
| `ThreeMatchView` → `src/12-three-match-view.jsx` | **35** | **+1 / −1 riga**: praticamente intatto |
| testa/tema, avatar, `renderHeroPhoto` → `00-head` + `01-bootstrap` | 5 | `01-bootstrap` +181 / −9 |
| `deriveHL`, `LiveMatch` → `src/15-live-match.jsx` | 2 | +400 / −196 |
| `PresentationStage3D`, `ParataBus3D`, `IntroCinematic` → `src/16-scene-3d-cerimonie.jsx` | 3 | +202 / −160 |

**Trentacinque blocchi su quarantadue stanno in un file che `main` non ha praticamente toccato.**

### Prova a secco del merge `origin/main` → POC (eseguita e ANNULLATA)

`git merge --no-commit --no-ff origin/main` poi `git merge --abort`. Risultato: **2 soli file in conflitto**
— `CARRIER-MANAGER-AV.html` (il build **generato**, quindi un conflitto che non va risolto a mano ma
**rigenerato**) e `index.html` (34 righe su `main` contro 17 nel POC). **Tutto il resto dei 222 commit si
fonde da solo.** Il ramo e' tornato a `f965e12`, albero pulito.

### Strategia proposta (NON eseguita: serve il via libera del PO)

1. **`src/` di `main` e' la fonte di verita'**: e' coerente col build, e' coperta da otto rituali ed e'
   trenta versioni avanti. Il POC non l'ha mai toccata, quindi non c'e' niente da perdere.
2. **Portare `origin/main` DENTRO il POC** (non il contrario). Questo **non viola** il vincolo: `main` resta
   intatto, si scrive solo sul ramo POC.
3. **Risolvere i due conflitti nel modo giusto**: `CARRIER-MANAGER-AV.html` **non si fonde**, si **rigenera**
   da `src/`; `index.html` si sceglie consapevolmente (34 righe contro 17, da leggere prima).
4. **Trasferire i 42 blocchi nei frammenti**: 35 in `12-three-match-view.jsx`, il resto negli altri tre.
5. **Da quel momento il lavoro POC si scrive in `src/`**, mai piu' nel file generato — cosi' il delta non
   ricresce e `build-src.mjs` smette di essere un comando distruttivo.

**Perche' NON il contrario**: portare `main` dentro il POC lato-HTML significherebbe rifare a mano trenta
versioni di lavoro (contrasto, figurine, fisarmoniche, A17/A18/A19, sala stampa, determinismo, fine partita
unica) dentro un file non tracciabile. Sarebbe la strada piu' costosa e piu' fragile.

**Costo stimato del punto 4:** 402 righe aggiunte da ricollocare, il 83% in un solo frammento. **Non e' un
oceano, ed e' verificabile**: dopo il trasferimento `check-src` deve dire IDENTICO e la review
`cgtrader-highlight-optimized` deve comportarsi come prima.

**Decisione che serve dal PO:** via libera al punto 2 (merge `main` → POC). Finche' non arriva, continuo a
lavorare **senza** toccare `src/` e senza lanciare `build-src.mjs`.

---

## Avanzamento 23 settembre 2026, 00:05 — IL METRO ERA CIECO, E ORA IL DIFETTO HA UN NUMERO

### Il merge intelligente e' fatto (due passi, entrambi verificati)

Il ramo POC ha ora **base 7.979.0** (contrasto 0 su sedici schermate, figurine, A17/A18/A19, sala stampa,
fine partita unica) **e** tutto il lavoro CGTrader, con **`src/` come fonte di verita'**.
Conflitti del merge: **2**, entrambi risolti consapevolmente. Blocchi trasferiti nei frammenti: **40 su 42
puliti, zero ambigui**. `check-src` → **IDENTICO BYTE PER BYTE**. **Zero regressioni 3D**: quattordici
simboli chiave con conteggio identico a prima del merge.

I 2 blocchi non automatici cadevano dove i rami si toccano davvero (avatar/ritratti). Del piu' grosso ho
preso **solo il dato** — `bodyType`/`hairStyle` sui dieci avatar, 0 occorrenze su main quindi aggiunta pura,
ed e' cio' che serve al CGTrader per ereditare i tratti — e **rifiutato** la sostituzione di `AvatarSVG`:
verificato che su main `AvatarSVG` e DiceBear sono ancora vivi, e il handoff chiede di **rifare**
l'integrazione dei ritratti secondo il contratto, non di copiarla.

### ⚠️ CORREZIONE DI ROTTA: gli «1-2 FPS» non misurano il roster

Misura appaiata, stessa scena (situazione 33), stesso banco:

| | triangoli renderizzati | fotogrammi al secondo |
| --- | ---: | ---: |
| con `cgtrader-highlight-optimized` | **813.559** | 1,3 – 1,9 |
| **senza alcun parametro** (niente CGTrader in scena) | **1.103.244** | **1,2** |

**La partita normale rende PEGGIO della review CGTrader**, pur avendo il 26% di triangoli in piu'. Quindi
gli «1-2 FPS» citati come prova che l'ottimizzazione non funziona **sono dominati dal banco**: Chromium
headless su GPU software rende 1-2 FPS qualunque cosa ci sia in scena. **Ricostruire il roster per far
salire quel numero sarebbe lavorare su un metro cieco** — ed e' la stessa lezione gia' pagata su `main`
con D7, dove alleggerire le mesh **non** diede fotogrammi sul telefono.

### Ma il difetto e' REALE, e ora ha un numero che regge

Il corpo CGTrader verificato ha **34.995 triangoli**. In scena: **813.559 ÷ 34.995 = 23,2**.
**Sono ventitre corpi pieni**, esattamente la diagnosi «corpi pieni» della consegna — solo che a dimostrarla
sono **i triangoli**, non gli FPS. E i tre testimoni lo confermano per via strutturale:

| testimone | esito |
| --- | --- |
| `__CPM_CGTRADER_HIGHLIGHT_OPTIMIZED` | `true` — il parametro **e'** riconosciuto |
| `__CPM_CGTRADER_CINEMA_ROSTER` | **assente** |
| `__CPM_CGTRADER_RENDER_BUDGET` | **assente** |
| `__CPM_CGTRADER_LOD_AUDIT()` | **`null`** |

### Il criterio di chiusura, corretto

**Non piu'** «gli FPS risalgono in headless». **Invece:**
1. `__CPM_CGTRADER_CINEMA_ROSTER` e `__CPM_CGTRADER_RENDER_BUDGET` rispondono;
2. `__CPM_CGTRADER_LOD_AUDIT()` riporta il trio LOD0/1/2 con **Hero e contesto attivo in LOD0** e gli altri
   diciotto in LOD1/2;
3. **i triangoli renderizzati scendono nettamente sotto gli 813.559 misurati** (bersaglio indicativo: il
   contesto attivo e' cinque corpi, cioe' ~175.000 triangoli di LOD0 piu' il costo ridotto degli altri);
4. **la partita normale non cambia**: prova appaiata senza il parametro, triangoli invariati a ~1.103.244;
5. gli **FPS** restano fuori dal gate locale: il loro gate e' **il telefono**, e li' resta **FAIL aperto**
   (11-16 FPS dichiarati dall'utente, mai smentiti).

**Sonda nuova:** `tests/character-lab/roster-ottimizzato-rosso.mjs` (con `CPM_BASE=1` misura il lato senza
parametro). Scrive `roster-rosso.json` e `roster-base.json`.

---

## Avanzamento 23 settembre 2026, 00:45 — IL ROSTER CINEMATOGRAFICO E' RICOSTRUITO E MISURATO

Ricostruito **in `src/12-three-match-view.jsx`** (non nel file generato) prelevando dalla copia di recupero
**solo** il meccanismo necessario. Rosso appaiato: `window.__CPM_NO_CINEMA` riaccende tutti i corpi.

**Cosa fa:** durante l'highlight resta visibile l'eroe, il portiere piu' vicino al pallone, i tre giocatori
piu' vicini e chiunque stia eseguendo un gesto (spegnere un attore a meta' gesto si vedrebbe). Gli altri
restano attori della simulazione ma **non vengono disegnati**: si spegne il DISEGNO, non il gioco — nessuna
posizione, nessun evento, nessun dato di partita e' toccato. Attivo **solo** nelle due review opt-in.

### Misure, contro il rosso di partenza

| criterio di chiusura | esito |
| --- | --- |
| `__CPM_CGTRADER_CINEMA_ROSTER` risponde | ✅ era `undefined`, ora **object** |
| `__CPM_CGTRADER_RENDER_BUDGET` risponde | ✅ era `undefined`, ora **function** |
| triangoli giu' dal rosso | ✅ **813.559 → 183.649, −77,6 %** (5,25 corpi contro 23,2) |
| **la partita normale non cambia** | ✅ **1.103.244 → 1.103.244**, identico, e il roster non si attiva mai |
| errori di pagina | ✅ **zero** |
| `__CPM_CGTRADER_LOD_AUDIT()` riporta il trio | ❌ **ancora `null`**: il trio LOD0/1/2 non e' caricato |
| FPS | ⏸ fuori dal gate locale per decisione misurata; il loro gate e' **il telefono**, dove resta **FAIL aperto** |

**Tre criteri su cinque superati**, uno aperto (il trio LOD) e uno che e' mobile per definizione.

### Due difetti miei in questo passo, dichiarati perche' sono la parte che insegna

Entrambi di **scope**, entrambi nello stesso rilascio.
1. Il testimone del budget leggeva `_cgtraderHighlightOptimized`, che e' dichiarato con `const` ottomila
   righe piu' sotto: zona morta temporale. **Trovato prima di costruire**, con un controllo sulle posizioni.
2. Il blocco del roster faceva lo stesso errore, e quello **non** l'avevo controllato. **Trovato dalla
   misura**: «_cgtraderHighlightOptimized is not defined» a ogni fotogramma, 3D mai montato,
   **TRIANGOLI 0 e 60 FPS** — cioe' una pagina vuota che sembrava velocissima. E' il promemoria piu' utile
   di tutta la serata: **un numero di prestazione che migliora di colpo va sempre sospettato**, e senza il
   metro dei triangoli quel 60 avrebbe potuto essere scambiato per un successo.
Entrambe le condizioni ora si leggono dal testimone che il gioco pubblica gia' su `window`.

### Prossimo lavoro e criterio

Caricare il trio **LOD0/1/2** e promuovere l'Hero e il contesto attivo a LOD0, il resto a LOD1/2, cosi' che
`__CPM_CGTRADER_LOD_AUDIT()` smetta di rispondere `null`. **Chiude quando** l'audit riporta i tre livelli
con Hero in LOD0, **i triangoli scendono ancora** rispetto ai 183.649 di adesso, e la partita normale resta
a 1.103.244.

---

## Avanzamento 23 settembre 2026, 01:30 — IL TRIO LOD E' CARICATO E ASSEGNATO, MA LE MESH NON SI MONTANO

**Lavoro aperto, non chiuso.** Tre difetti trovati e corretti in catena, un quarto **trovato e NON risolto**.

### Corretti (ognuno misurato, non dedotto)

1. **Il trio non veniva caricato**: gli asset lod0/lod1/lod2 erano richiesti solo da
   `cgtrader-mixed-lod-benchmark`; a `cgtrader-highlight-optimized` arrivava il solo lod0. Esteso.
2. **Il ramo che costruisce le varianti li ignorava**: la guardia interna era ancora
   `_cgtraderMixedLodBenchmark && …`, quindi i tre pacchetti passati venivano scartati e
   `__CPM_CGTRADER_LOD_AUDIT` **non veniva nemmeno definito** — rispondeva `null` non perche' contasse
   zero, ma perche' **non esisteva**. Ora la condizione guarda gli **argomenti**: una funzione deve reagire
   a cio' che riceve, non a una variabile di modalita' (che li' non sarebbe neppure in scope).
3. **I pacchetti non erano etichettati**: senza `entry._cgLod=['lod0','lod1','lod2'][index]` le varianti
   nascevano sotto la chiave `null` e nessuna poteva essere attivata per nome. Pezzo ripreso dalla copia
   di recupero.

**Risultato di questi tre:** `LOD_AUDIT` risponde, **23 avatar con 23 varianti**,
**`active: {lod0:1, lod1:0, lod2:22}`**, **`heroLod:"lod0"`** — l'eroe a piena risoluzione, gli altri
ventidue in LOD2, esattamente la politica richiesta.

### ❌ Il difetto che resta, e il numero che NON va creduto

**I corpi non sono renderizzati.** Misurato: `boundsHeight` **0,021** contro `skeletonHeight` **1,837**, e
`stats.swaps: 0`. Sono **scheletri senza mesh**: le varianti nascono `visible=false` e nessuna viene mai
accesa.

**Quindi i 30.546 triangoli NON sono un successo**: sono una scena vuota. Il rosso era 813.559 e il
bersaglio ragionevole e' intorno ai 60-70.000 (un LOD0 da ~35.000 piu' quattro LOD2), **non trentamila**.

> **Regola che questa serata ha ribadito tre volte**: un numero di prestazione che migliora di colpo va
> sospettato prima di essere festeggiato. Prima 60 FPS con TRIANGOLI 0 (3D mai montato), poi 30.546
> triangoli per scheletri senza corpo. Senza un secondo metro — le altezze del bounding box — **entrambi
> sarebbero passati per vittorie**.

### Stato dei criteri di chiusura

| criterio | esito |
| --- | --- |
| `CINEMA_ROSTER` e `RENDER_BUDGET` rispondono | ✅ |
| `LOD_AUDIT` riporta il trio con Hero in LOD0 | ✅ `{lod0:1, lod1:0, lod2:22}`, `heroLod:"lod0"` |
| triangoli giu' dal rosso **con i corpi visibili** | ❌ **i corpi non si vedono**: il numero non vale |
| la partita normale non cambia | ⏸ da ri-misurare dopo il rimedio |
| FPS | ⏸ gate telefono, **FAIL aperto** |

### Prossimo lavoro

Capire perche' `_activateCgtraderLod` non accende mai una variante (`swaps: 0`) e perche' la variante
corrispondente al `_cgLod` iniziale resta invisibile. **Chiude quando** `boundsHeight` torna coerente con
`skeletonHeight` (~1,8), i triangoli si assestano intorno ai 60-70.000 **con i corpi visibili**, e la
partita normale resta a 1.103.244.

---

## Avanzamento 22 settembre 2026, 23:40 — IL METRO ERA ROTTO: I CORPI SI VEDEVANO, L'EROE NO

> **Nota sulle date.** L'orologio del container segna **22/09 23:35 Europe/Rome**; le tre voci precedenti
> sono datate «23 settembre 00:05 / 00:45 / 01:30», cioe' in avanti rispetto all'orologio. Non posso
> confermare quale fosse l'ora reale di quelle voci: le lascio come sono e da qui uso l'orologio.

**Fase:** 4/7 · **Stato complessivo stimato: 60%** (invariato: si chiude un difetto di rendering, nessun gate
di animazione/palla/transizioni/telefono e' superato).

### 1. La diagnosi precedente era sbagliata — e lo dice un metro nuovo
La voce delle 01:30 diceva «scheletri senza mesh» sulla base di `boundsHeight` **0,021** contro
`skeletonHeight` **1,837**. Quel metro **non misura cio' che si vede**: in three **r128**
`Box3.setFromObject` (1) attraversa anche i figli con `visible=false` e (2) sulle SkinnedMesh legge la
geometria in bind-pose, non lo scheletro animato. Prova: **dopo** il rimedio qui sotto, con l'eroe LOD0
effettivamente disegnato, `boundsHeight` e' ancora **0,021**.

**Sonda nuova** `tests/character-lab/corpi-disegnati.mjs`: non tocca il gioco, aggancia
`THREE.Object3D.prototype.onBeforeRender` (chiamato dal renderer per ogni oggetto disegnato nel passaggio
principale) e per un fotogramma conta SkinnedMesh disegnate, triangoli e altezza dalle ossa visibili, per
avatar. `CPM_BASE=1` = partita normale, `CPM_ROSSO=1` = rosso appaiato.

### 2. Il difetto vero, misurato
Prima del rimedio (`corpi-disegnati-prima.json`): **5 corpi disegnati, 75 ossa, 1,82-1,84 m** — i corpi
c'erano. Ma **tutti e cinque a 4.190 triangoli**, cioe' **LOD2, eroe compreso**, mentre l'audit dichiarava
`heroLod:"lod0"`.
Triangoli per asset, letti dai GLB: **LOD0 34.995 · LOD1 12.244 · LOD2 4.190** (7 mesh ciascuno).

**Causa:** `pkg._variants=packages`. `_variants` serve alle varianti d'**aspetto** dei pacchetti Hyper
Casual; col trio riceveva i **tre LOD**, e `_cloneHyperVisual` ne pescava uno **a sorteggio per hash del
seed**. L'etichetta `_cgLod` diceva «lod0», la mesh clonata poteva essere qualsiasi livello. Lo stesso
difetto e' presente nella copia di recupero (`pkg._variants=packages` anche li'): non e' nato col merge.

**Rimedio** (`src/12-three-match-view.jsx`, una riga + commento): con il trio, `_variants` non si assegna;
i livelli si scelgono solo per nome. Rosso appaiato **`__CPM_NO_LODPICK`**.

### 3. Misure (situazione 33, Chromium headless 412×915)

| misura | prima | **dopo** | rosso `__CPM_NO_LODPICK` |
| --- | ---: | ---: | ---: |
| corpi disegnati (onBeforeRender) | 5 | **5** | 7 (*) |
| triangoli dell'eroe | 4.190 (LOD2) | **34.995 (LOD0)** | 4.190 |
| triangoli skin disegnati | 20.950 | **51.755** (= 34.995 + 4×4.190) | 29.330 |
| triangoli passaggio principale | 23.785 | **54.588** | 37.231 |
| `__CPM_TRI907` (sonda storica `roster-ottimizzato-rosso`) | 30.546 | **61.351** | — |
| altezza dalle ossa | 1,82-1,84 m | **1,82-1,84 m** | 1,82-1,84 m |
| **partita normale** (`CPM_BASE=1`, `__CPM_TRI907`) | 1.103.244 | **1.103.244** | — |
| errori di pagina | 0 | **0** | 0 |

(*) Nel rosso compaiono due radici in piu' con 7 mesh a 4.190 triangoli e **zero ossa visibili**: **non
spiegato**. Non tocca il verde (5 corpi, tutti con 75 ossa), ma resta da capire.

**FPS:** 4,3 nella sonda storica — **non e' una misura**: il banco e' a GPU software. Gate FPS = telefono,
**FAIL aperto** (11-16 FPS dichiarati dal PO).

### 4. Criteri di chiusura del §5
| criterio | esito |
| --- | --- |
| corpi visibili con altezza coerente | ✅ 5 corpi, 1,82-1,84 m dalle ossa (il `boundsHeight` ~1,8 era un criterio sbagliato: il metro e' cieco) |
| triangoli 60-70.000 con i corpi visibili | ✅ 61.351 (`__CPM_TRI907`) · 54.588 nel solo passaggio principale |
| eroe davvero in LOD0 | ✅ 34.995 triangoli disegnati |
| partita normale invariata | ✅ 1.103.244 |
| FPS | ⏸ gate telefono, **FAIL aperto** |

**Non verificato:** l'Android del PO; il cambio di LOD in corsa (`swaps` resta 0 perche' `_updateCgtraderLod`
gira solo con `_cgtraderMixedLodBenchmark`: nella review ottimizzata il LOD e' fisso all'avvio — da
decidere se serve); le due radici in piu' del rosso.

### 5. Prossimo lavoro
Presa alta del portiere (`gk-high-catch`) con `keeper-catch-sequence-review.mjs`: apertura, contatto,
recupero + dati palla/attori/transizione. `boundsHeight` nell'audit andrebbe sostituito con l'altezza dalle
ossa o tolto, perche' induce in errore: e' un intervento a parte, non fatto qui.

---

## Avanzamento 22 settembre 2026, 23:53 — Controllo periodico

- **Fase corrente:** 4/7, 60% complessivo stimato.
- **Attivita dall'ultimo aggiornamento:** nessun nuovo commit sul branch remoto dopo 9c6b9de9; il roster CGTrader resta a cinque corpi visibili, con l'eroe LOD0 verificato nella misura precedente.
- **Verifica ed esito:** il fetch conferma il branch remoto invariato. I dati di rendering restano quelli documentati nel checkpoint precedente; non e stata ripetuta una prova animata o mobile in questo intervallo.
- **Lavoro successivo e criterio di chiusura:** catturare la sequenza completa gk-high-catch e provare contatto mani-palla e possesso; poi dribbling, tiro, transizioni e misure su telefono. Quality gate finali ancora aperti; nessuna build validata pubblicata sul link ufficiale.

---
## Avanzamento 23 settembre 2026, 00:08 — Controllo periodico

- **Fase corrente:** 4/7, 60% complessivo stimato; nessun quality gate finale nuovo superato.
- **Attivita dall'ultimo aggiornamento:** nessuna modifica di sviluppo pubblicata dopo il commit documentale d692aabb.
- **Verifica ed esito:** il fetch del branch remoto non rileva nuovi commit; resta valida la misura precedente del roster a cinque corpi con Hero realmente in LOD0. Nessun nuovo test di animazione, contatto palla, transizioni o telefono in questo intervallo.
- **Lavoro successivo e criterio di chiusura:** catturare e giudicare la presa alta completa del portiere, inclusi contatto mani-palla e possesso; proseguire con dribbling, tiro e transizioni. Il gate prestazioni si chiude solo con misura mobile reale. La Pages ufficiale non ospita ancora una build POC validata.

---
## Avanzamento 23 settembre 2026, 00:23 — Controllo periodico

- **Fase corrente:** 4/7, 60% complessivo stimato; quality gate finali ancora aperti.
- **Attivita dall'ultimo aggiornamento:** nessun nuovo commit di sviluppo pubblicato sul branch POC dopo il precedente checkpoint bb7e0c2a.
- **Verifica ed esito:** il fetch remoto e' invariato. Restano documentati cinque corpi visibili con Hero LOD0 e partita normale invariata nella misura precedente; nessuna nuova prova di presa, dribbling, tiro, transizioni o FPS mobile.
- **Lavoro successivo e criterio di chiusura:** verificare in sequenza presa alta, contatto e possesso della palla; poi gesto di dribbling/tiro e transizioni. Il collaudo ufficiale resta subordinato alla pubblicazione della build validata sul link Pages indicato e alla misura su telefono.

---
## Avanzamento 23 settembre 2026, 00:25 — PRESA ALTA DEL PORTIERE: IL GESTO ORA ESISTE, LA CAMERA NON LO MOSTRA

**Fase:** 4/7 · **Stato stimato: 62%** · gate presa: **contatto e possesso superati in misura, inquadratura FAIL**.

### Il difetto, misurato prima di toccare (sit. 33 «Muro in area» → «Chiama il portiere»)
La sonda `keeper-catch-sequence-review.mjs` leggeva `__CPM_CGTRADER_CONTACT_AUDIT`, che esiste solo nel benchmark
misto: nella review ottimizzata registrava `null`. Aggiunto il testimone di sola osservazione
**`__CPM_CGTRADER_KEEPER_AUDIT`** (portiere di casa: mani, palla, distanza, gesto, tempo di clip, apertura braccia,
slot di reazione). Prima misura: **clip `catch` mai montata (0 campioni)**, distanza palla-mani minima **0,72 m**,
poi palla a terra a **0,22 m** con le mani a 1,2 m.
**Causa:** all'armo dell'arco `gkClaim` lo slot unico `oppActType` e' gia' occupato da **`opp_stumble`**
(l'attaccante che inciampa), quindi `if(!oppActType)` non arma mai la presa. Secondo difetto: finito l'arco un
altro scrittore riporta la palla a terra.

### Il gesto, misurato sull'asset
Nuova sonda `presa-clip-profilo.mjs`: `gk-high-catch` dura **3,333 s**; mani unite sopra la testa a
**t = 1,00-1,17 s**, picco **1,067 s**; poi il corpo scende e si rialza.

### Rimedio (solo review ottimizzata, rosso appaiato `__CPM_NO_PRESA`)
1. Canale dedicato `sr.current._presaRev`, armato insieme a `gkClaim`: il selettore dei gesti GLB monta `catch`
   sul portiere della presa senza rubare lo slot all'attaccante.
2. **Una sola esecuzione per scena**: la prima stesura ripartiva a ogni fine clip (campioni 15/23/31 — codice 000);
   corretto e ri-misurato.
3. Sincronia: la clip parte avanti di quanto manca all'arrivo; se manca piu' di 1,067 s rallenta (tetto 0,6x).
   Misurato: all'armo mancano 1,21 s → scala 0,882.
4. Possesso: dopo il contatto la palla segue il punto medio delle mani fino al cambio di scena.

### Misure
| misura | prima / rosso | **dopo** |
| --- | ---: | ---: |
| campioni con clip `gk-high-catch` | 0 | **15** (una esecuzione, poi rilascio a peso 0) |
| tempo di clip al contatto | — | **1,079 s** (finestra di presa 1,00-1,17) |
| distanza palla-mani minima | 0,694 m | **0** |
| palla a fine scena | 0,22 m (a terra) | **1,16 m, in mano** |
| apertura braccia max | 0,52 | **0,70** (atterraggio, t≈1,9 s; limite anti T-pose del dribbling 0,65 — vedi sotto) |
| partita normale (`__CPM_TRI907`) | 1.103.244 | **1.103.244** |
| review (`__CPM_TRI907`) | 61.351 | **61.351** |
| errori di pagina | 0 | **0** |

### Cosa NON e' superato (prova visiva: `keeper-catch-review/presa-*.png`)
- ❌ **Al contatto il portiere e' FUORI INQUADRATURA**: la camera resta sull'eroe difensore (regola 7.482:
  sugli highlight difensivi il soggetto e' chi interviene). Il portiere si vede solo nel recupero, palla al petto.
  Serve una regola di regia per «Chiama il portiere»: prossimo lavoro.
- ⚠️ Apertura braccia 0,70 m per un campione, durante la discesa: non e' una T-pose alla vista del recupero, ma
  supera la soglia presa in prestito dal dribbling. Da giudicare sul fotogramma, non chiuso.
- ⚠️ Il testo d'esito dice «Para in tuffo — miracoloso!» mentre il gesto e' una presa alta. Il testo viene dalla
  simulazione (source of truth, non si tocca); `gk-dive` non e' approvata. Incoerenza dichiarata, decisione del PO.
- ⚠️ L'HUD scrive «corpi pieni» anche nella review ottimizzata (le misure dicono 5 corpi): etichetta da verificare.
- ⚠️ Il partita normale ha lo stesso difetto di slot (`opp_stumble` occupa `oppActType`)? **Non misurato**: il
  rimedio e' limitato alla review.

---

## Avanzamento 23 settembre 2026, 00:28 — PRESA ALTA: ORA SI VEDE

**Fase:** 4/7 · **Stato stimato: 64%**.

**Causa della presa fuori quadro, misurata:** la prima passata di regia scriveva i bersagli DOPO il lerp della
posizione camera (r. ~8456), e `tP*` si ricalcola da capo a ogni fotogramma: cambiava solo lo sguardo. Portiere
nel quadro solo dal contatto, altezza apparente 0,06-0,09.
**Rimedio (solo review, rosso `__CPM_NO_PRESACAM`):** posizione scritta PRIMA del lerp, sguardo prima dell'arbitro
d'inerzia (regola 7.521); al primo fotogramma della presa uno **stacco netto**, poi inseguimento normale. Camera di
tre quarti dal lato del volo, 11 m, quota 3,6 m.

| misura (sit. 33, `keeper-catch-sequence-review.mjs`) | rosso `__CPM_NO_PRESACAM` | **verde** |
| --- | ---: | ---: |
| portiere nel quadro al contatto | **no** | **si** |
| altezza apparente al contatto | 0,084 | **0,177** |
| quota campioni col portiere nel quadro dopo l'armo | 0,71 | **1,00** |
| tempo di clip al contatto (finestra 1,00-1,17) | 1,064 | **1,076** |
| distanza palla-mani minima | 0 | **0** |
| partita normale `__CPM_TRI907` | — | **1.103.244** |

Prova visiva: `keeper-catch-review/presa-contatto.png` — braccia alzate, palla fra le mani sopra la testa.

**Aperto, dichiarato:**
- la palla in volo entra nel quadro solo all'ultimo tratto (in verticale il campo orizzontale e' ~±11°);
- nell'apertura il portiere sta sul bordo: le reti di legalita' tirano ancora lo sguardo verso l'eroe;
- a 11 m il portiere e' LOD2 (4.190 tri): da vicino la superficie e' povera. Promuoverlo a LOD1 costerebbe ~+8.000
  triangoli (bersaglio ~69.000): decisione da prendere col tuo occhio, non fatta;
- apertura braccia max 0,69 durante la discesa (soglia presa dal dribbling 0,65): alla vista non e' una T-pose;
- testo d'esito «Para in tuffo» contro gesto di presa alta (vedi voce 00:25);
- **telefono: non misurato.**

---

## Avanzamento 23 settembre 2026, 00:36 — IL KIT A CHIAZZE: MATERIALI ESPORTATI IN BLEND (collaudo PO sul telefono)

**Segnalazione PO (screenshot Android, scena «Chiama il portiere»):** «I giocatori non si vedono bene, il kit non si
e' disegnato bene». Maglie e pelle a chiazze, bianco e color pelle sopra il rosa/azzurro.

**Misura (sonda nuova `kit-lod-provino.mjs`, corpo isolato fuori dal gioco, `kit-lod-provino/`):**
- LOD0 illuminato: rumore a quadratini su maglia, pantaloncini e pelle anche con la maglia a colore pieno;
  LOD2: braccia sopra le maniche.
- Nascondendo la maglia sotto non c'e' nessun corpo; indici sani (0 normali nulle, 0 triangoli duplicati).
- **Con materiale opaco lo stesso corpo e' pulito** (`lod0-completo-basic.png`).
- **Causa:** nel GLB tutti e 6 i materiali dei 3 LOD sono `alphaMode: BLEND`, `doubleSided: true`. In r128 = trasparente
  senza scrittura di profondita': facce posteriori sopra le anteriori, braccia sopra le maniche.
- L'alfa delle 5 texture e' binario (sotto 255 == sotto 128) ed e' un ritaglio.

**Rimedio (solo review CGTrader, rosso `__CPM_NO_ALPHAFIX`):** al caricamento BLEND→MASK (opaco, depthWrite,
alphaTest 0,5). Testimone `__CPM_CGTRADER_ALPHAFIX` (materiali convertiti).
**Prova:** `kit-lod-provino/lod0-completo-mask.png`, `lod2-completo-mask.png` puliti; nel gioco
`kit-lod-provino/gioco-dopo-alphafix.png` contro `telefono-PO-prima.jpg` (stessa scena).
**Non regressione:** partita normale 1.103.244; `renderer.info` review 56.443, identico al prima.

**Aperto:**
- rimedio DEFINITIVO = riesportare l'asset con alphaMode MASK/OPAQUE dal sorgente Blender (decisione tua);
- LOD2: due lembi dei pantaloncini bucano l'orlo della maglia (decimazione, geometria);
- piccola macchia color pelle sul colletto (LOD0 e LOD2);
- corpo in piu' intermittente con 0 ossa visibili nel conteggio dei corpi disegnati: non spiegato;
- **non verificato sul tuo telefono.**

### Scoperto sul dribbling (lavoro in corso, non ancora corretto)
`gesto-eroe-review.mjs` (nuova, `CPM_INTENT=dribble|pass|shot`) su «Dribbling netto»: l'eroe suona `pass`, non `dribble`,
e `__CPM_G000` conta **5 montaggi** nella scena. `_cgtraderDribbleApproach` e l'aggancio palla-piede accettano solo gli
stati `ready-cgtrader-review/ajax/mixed-lod`: la review ottimizzata dichiara `ready-lineup`, quindi **l'approccio del
dribbling non gira mai li'**. Lo stato `ready-cgtrader-highlight-optimized` citato in una voce precedente non esiste nel
sorgente.

---

## Avanzamento 23 settembre 2026, 00:53 — Controllo periodico

- **Fase corrente:** 4/7, 64% complessivo stimato; gate finali non ancora superati.
- **Attivita dall'ultimo aggiornamento:** nessun nuovo commit sul branch POC dopo 9ef9753a. La presa alta con camera dedicata e il rimedio al kit a chiazze restano gli ultimi interventi registrati.
- **Verifica ed esito:** fetch remoto invariato. La roadmap precedente riporta misure locali di presa e rendering; nessuna nuova misura su telefono. Il difetto di assegnazione della clip sul Dribbling netto resta aperto.
- **Lavoro successivo e criterio di chiusura:** correggere il gesto di dribbling e verificare in sequenza contatto piede-palla, tiro e transizioni; ripetere il test mobile reale. Nessuna build POC validata e pubblicata sul link ufficiale.

---
## Avanzamento 23 settembre 2026, 00:55 — DRIBBLING, PASSAGGIO, TIRO: MISURATI GESTO PER GESTO

> **Correzione di date (mia).** Le voci 00:28, 00:36 e 00:55 erano state datate 00:55, 01:35 e 02:20: ore stimate e non lette
> dall'orologio — lo stesso errore che avevo segnalato nelle voci precedenti. Corrette sugli orari dei commit.

**Fase:** 4/7 · **Stato stimato: 68%**. Sonda `gesto-eroe-review.mjs` (situazione scelta con `deriveIntent`, registratore a
ogni fotogramma in pagina, montaggi VERI dell'eroe col testimone `__CPM_CGTRADER_MOUNTS`, corpi disegnati con
`__CPM_CGTRADER_ACTORS_AUDIT`). Evidenze in `gesto-review/<caso>/` (apertura, contatto, uscita + report).

### Difetti trovati e corretti (solo review ottimizzata)
1. **L'approccio del dribbling non girava mai** (rosso `__CPM_NO_DRIBREV`): `_cgtraderDribbleApproach` e l'aggancio
   palla-piede accettavano solo gli stati `ready-cgtrader-review/ajax/mixed-lod`; la review ottimizzata dichiara
   `ready-lineup`. Lo stato `ready-cgtrader-highlight-optimized` citato nelle voci del 22/09 **non esiste nel sorgente**.
2. **Il tiro non toccava la palla** (rosso `__CPM_NO_KICKREV`): l'aggancio all'osso del piede e il caricamento a 0,375 s
   descritti il 22/09 **non erano nel sorgente**; nella copia di recupero stavano dietro lo stesso stato mai dichiarato,
   quindi erano codice morto anche li'. Recuperati solo quei due pezzi, attivati sul flag reale.

### Misure
| gesto (azione) | montaggi veri eroe | contatto piede-palla (clip) | angolo dalla porta | eroe nel quadro | T-pose | rosso |
| --- | --- | --- | ---: | ---: | ---: | --- |
| dribbling («Dribbling netto») | `dribble` → `pass` | tocchi sx u=0,278 / dx u=0,372 su `foot-bone`, 0,21-0,25 m | 21,7° | 100% | 0 | approccio mai montato |
| passaggio («Filtrante per compagno») | `pass` | 0,226 m (clip 0,159, dx) | 3,6° | 97% | 0 | — |
| tiro a terra («Scatto e tiro») | `kick` | **0,228 m a clip 0,361** (contatto asset 0,375) | 3,9° | 38% (*) | 0 | 0,268 m a clip **0,107**: la palla partiva prima del piede |
| tiro di prima su palla alta | `kick` (regola PO 7.672) | **0,244 m a clip 0,362** | 13,2° | 97% | 0 | **0,739 m**: mai toccata |

Riferimento: raggio della palla in scena 0,22 m (quota a terra), quindi 0,21-0,25 m dal centro = contatto.
(*) l'eroe esce dal quadro DOPO il gesto, quando la regia segue la palla in porta (soggetto-palla): durante il gesto e' in quadro.
Partita normale `__CPM_TRI907`: **1.103.244** invariata.

### Correzioni di strumento, a verbale
- **`__CPM_G000` conta i TENTATIVI, non i montaggi**: sta prima della guardia 7.396, quindi con le clip CGTrader corte
  (0,417 s) registra rimontaggi che la guardia poi annulla (5 contro 2 veri). Non l'ho toccato (e' un guardiano del gioco
  principale); per il POC vale `__CPM_CGTRADER_MOUNTS`.
- Nella partita normale (CH38) la stessa scena di dribbling conta 1.

### Aperto
- **Taglia dell'eroe 0,07-0,12** nei gesti (la regia principale, tarata da te a 0,18, rende mediana 0,14): a questa
  taglia il gesto si legge poco. La camera dedicata «41°/0,22» descritta il 22/09 non esiste nel sorgente. Decisione tua.
- Un difensore esegue `tackle` sul tiro (reazione del reparto 7.519): calcio plausibile, lasciato.
- Transizioni fra gesti: misurati rilascio a peso 0 e un gesto per azione; il giudizio del crossfade resta visivo, sul telefono.

---

## Avanzamento 23 settembre 2026, 00:58 — FIGURINE: STATO REALE E DECISIONI CHE SPETTANO AL PO

**Fatti (ricerca in `src/`, nessuna modifica):**
- Dopo il merge di `main` il ramo ha gia' `Figurina` 5:7 (`01-bootstrap-tema-avatar.jsx:345`, `FIG` a :318) usata in ~25 punti
  (eroe, compagni, avversario, arbitro, mister, giornalista, procuratore). `AvatarSVG` non e' piu' montato da nessuna parte.
- I volti passano da `voltoUrl(tipo, chiave)` (:322) che cerca in `window.__CPM_VOLTI`: **quel manifesto non viene mai
  popolato**, quindi oggi nessuna figurina mostra un volto. I 40 ritratti di `assets/portraits/` non sono referenziati.
- La chiave e' uno slug del **nome**; l'eroe usa tre chiavi diverse (`player.name`, `"eroe-"+avatarId`, `"avatar-"+avatarId`);
  il mister in una scena riceve il nome del **club** (15-live-match.jsx:10738); il giornalista dell'intervista riceve il nome
  della **testata** (18-career-app.jsx:6027).
- ID stabili esistono solo per i giornalisti (`j_ferretti`...). Rosa, compagni (rinominati da `syncTeammateNames`), rivale,
  mister e procuratore non hanno id. `SAVE_VERSION` 9, migrazione `migratePlayer` (17-menu-creazione-pannelli.jsx:1859).

**Piano proposto (non eseguito):** registro `player.volti` salvato in carriera (migrazione additiva, niente bump se il campo e'
facoltativo): alla prima comparsa di un'identita' le si assegna uno dei 40 slot della sua categoria scegliendo il meno usato e
mai uno gia' presente nella stessa rosa/scena; da li' il volto non cambia piu'. `voltoUrl` riceve lo slot (quadrante del foglio
2x2 via background-position). Correzione delle tre chiavi sbagliate sopra. Guardiani: `save-compat`, `career-critical`,
foto delle schermate a 412x915.

**Decisioni tue, prima di scrivere codice:**
1. **Provenienza e licenza dei 40 ritratti**: la roadmap dice «creati», non da dove ne con quale licenza. L'handoff chiede di
   verificarla prima di pubblicarli. Non posso confermarla.
2. **Chiave dell'identita'**: assegnazione persistente per nome visibile + registro salvato (piano sopra), oppure introdurre id
   veri per compagni/rivale/mister/procuratore (piu' pulito, tocca generazione rosa e migrazione in piu' punti).
3. **Ordine**: le figurine sono lavoro 2D separato dai gate 3D; il gate che chiude la missione resta il telefono.

---

## Avanzamento 23 settembre 2026, 01:04 — VISION TEST DA GIOCATORE (partita reale, review CGTrader)

**Metodo:** sonda nuova `vision-player.mjs` — provino reale dall'inizio al fischio finale, niente situazioni forzate, teatro di
presentazione acceso (`__CPM_PRESENT=1`, `__CPM_REALWAIT`), 412x915. Tre highlight, 25 schermate in `vision-player/`
(scelta, esito a 0,8/2/3,5 s, dopo «Continua», gioco fluido ogni ~20 s). **Zero errori di pagina.**
Limite dichiarato: la scelta e' passata dall'hook del gioco (`__CPM_RESOLVE`), non da un tocco sul pulsante — il tocco del
dito non e' provato. Chromium headless, non il telefono.

**Cosa vede un giocatore — funziona:**
- Gioco fluido = lavagna tattica 2D leggibile (numeri, cronaca, statistiche); il 3D entra solo negli highlight.
- Tiro (hl1 «Esterno a giro»): eroe rosa con la palla al piede, calcio, traiettoria verso la porta, GOL e 1-1 sul maxischermo.
  Kit uniformi dopo la correzione BLEND→MASK, nessuna T-pose, nessun corpo gigante o sparito nel quadro.
- Passaggio/tiro (hl2): palla al piede nel fotogramma del calcio.

**Cosa disturba un giocatore — difetti visti, cause NON verificate salvo dove detto:**
1. **Figurina vuota:** nella finestra dopo il gol («✊ TU») il ritratto e' un rettangolo bianco (08-gioco.png).
   Causa gia' misurata: `window.__CPM_VOLTI` mai popolato (voce 00:58).
2. **Tabellino incoerente:** risultato **2-1 VITTORIA**, ma nel «Tabellino della gara» la riga Gol riporta **2 — 2**
   (24-fischio-finale.png). Il tabellino eroe dice anche 16 tiri. Area motore/UI di `main`, fuori dal POC: da misurare.
3. **Scelta e gesto non combaciano:** scelto «Doppio passo esplosivo», l'eroe esegue un calcio (`kick`), esito «Tiro centrale —
   parata facile» (15/17). Da capire se e' la catena dribbling→tiro voluta o una clip sbagliata.
4. **Eroe piccolo nei gesti:** taglia 0,06-0,11 (misura del testimone), gia' a verbale.
5. **HUD di collaudo visibile:** «11 fps · corpi pieni» sotto il tabellone: rumore per un giocatore, e «corpi pieni» e' falso
   (ne disegna 5).
6. Al gol due pillole «GOL!» sovrapposte (06-hl1-esito-3_5s.png); al 63' la testata della lavagna mostra le squadre invertite
   («Polisportiva 1-2 Selezione», 21-gioco.png): da verificare se e' il cambio di campo voluto.

---

## Avanzamento 23 settembre 2026, 01:23 — Controllo periodico

- **Fase corrente:** 4/7, 68% complessivo stimato; nessun quality gate finale dichiarabile chiuso.
- **Attivita dall'ultimo aggiornamento:** nessun nuovo commit sul branch POC dopo 1a52da87; restano gli esiti della review di dribbling, passaggio, tiro e del provino partita con 25 schermate.
- **Verifica ed esito:** fetch remoto invariato. I difetti visivi registrati nel provino (figurina vuota, riga gol incoerente nel tabellino, scelta/gesto non sempre allineati, Hero piccolo) restano aperti; nessuna nuova prova su telefono o sul link Pages ufficiale.
- **Lavoro successivo e criterio di chiusura:** correggere e rieseguire il provino per le incoerenze riproducibili; verificare animazioni, palla e transizioni nella sequenza reale; misurare FPS e qualita sul dispositivo mobile prima del collaudo ufficiale.

---
## Avanzamento 23 settembre 2026, 01:38 — Controllo periodico

- **Fase corrente:** 4/7, 68% complessivo stimato; quality gate finali ancora aperti.
- **Attivita dall'ultimo aggiornamento:** nessun nuovo commit di sviluppo sul branch POC dopo il checkpoint 633bda8b.
- **Verifica ed esito:** fetch remoto invariato. Rimangono documentati i test locali dei gesti e il vision test da 25 schermate; nessuna nuova prova del contatto, delle transizioni o delle prestazioni sul telefono. Figurina vuota, tabellino incoerente e scelta/gesto non sempre coerenti restano aperti.
- **Lavoro successivo e criterio di chiusura:** risolvere i difetti riprodotti nel vision test, ripetere il percorso completo e validare i quattro gate (animazione, palla, transizioni, mobile) prima della build sul link ufficiale.

---
## Avanzamento 23 settembre 2026, 01:48 — DECISIONI DEL PO (wizard)

| tema | decisione del PO | cosa faccio |
| --- | --- | --- |
| collaudo telefono | **Preview Netlify del solo ramo POC** (link pubblico separato, `main` e Pages intatti) | build del POC → deploy di anteprima → protocollo di prova per il PO |
| 40 ritratti | «**li ha creati ChatGPT**» | li collego. Diritti d'uso: dipendono dai termini OpenAI in vigore quando sono stati generati — **non posso confermarli da qui**, a verbale prima di un rilascio store |
| chiave dei volti | **ID veri** per compagni, rivale, mister, procuratore | id stabili nella generazione + migrazione additiva; guardiani `save-compat` e `career-critical` |
| taglia eroe negli highlight CGTrader | **0,18** come la regia | misura con il testimone attori prima/dopo |
| materiali in BLEND | «**valuta tu la soluzione piu' scalabile**» | correzione alla sorgente negli script di esportazione (`tools/build_cgtrader_*.py`: ritaglio invece di trasparenza) + controllo che boccia GLB con materiali BLEND + la conversione al caricamento resta come rete. Blender non e' nel container: la riesportazione la lancia il PO |
| portiere nella presa | **LOD1** (+~8.000 triangoli, bersaglio ~69.000) | promozione solo per il portiere della presa, rimisura triangoli |
| tabellino 2-1 contro «Gol 2—2» | **correggere sul ramo POC** (main intatto) | misura della causa, rimedio con rosso appaiato |
| «Doppio passo» che diventa calcio | **e' voluto** (dribbling e poi tiro) | nessuna modifica |

Senza bisogno di decisione: HUD di collaudo «fps · corpi pieni» nascosto al giocatore, doppia pillola «GOL!», verifica squadre
invertite al 63'.

---

## Avanzamento 23 settembre 2026, 08:26 — PREVIEW NETLIFY DEL POC ONLINE (decisione PO)

- **Link di collaudo:** https://korward-poc-cgtrader.netlify.app/CARRIER-MANAGER-AV.html?hyperCharacter=cgtrader-highlight-optimized
  (Netlify reindirizza a `/carrier-manager-av` conservando i parametri). Progetto `korward-poc-cgtrader`, deploy `6ab36f01d1d016f0f71a3031`.
  `main` e la GitHub Pages ufficiale **non toccati**.
- **Cosa e' pubblicato:** solo i 100 file che il gioco usa davvero (121 MB contro i 315 di `assets/`): riferimenti statici + richieste
  di rete registrate in due partite (review e normale) + capelli dinamici + ritratti. Servita in locale da sola: 0 file mancanti,
  0 errori in review e in partita normale.
- **Verifica del pubblicato:** 98/100 file identici byte per byte; i 2 HTML differiscono solo per lo script di servizio che Netlify
  inietta in fondo alla pagina e per il link riscritto della pagina d'ingresso. Il codice di gioco e' identico.
- **Ostacoli risolti, a verbale:** (1) la rete dell'ambiente bloccava Netlify → il PO ha aggiunto i domini; (2) lo strumento di
  caricamento del connettore rispondeva 403 anche su un file minuscolo, mentre la stessa richiesta fatta con curl passa: caricamento
  fatto con curl. (3) Il browser di prova non raggiunge siti esterni attraverso il proxy dell'ambiente: la verifica del sito
  pubblicato e' per confronto dei file, non per partita giocata sul sito.
- **Non verificato:** la partita giocata sul sito pubblicato (la fa il PO sul telefono), l'effetto visivo dello script Netlify.

---

## Avanzamento 23 settembre 2026, 09:00 — PULIZIE DAL VISION TEST: «GOL!» MOLTIPLICATI, ETICHETTA FPS, CAMBIO CAMPO

1. **«GOL!» sovrapposti — difetto vero, anche della partita normale (quindi anche di `main`).** Testimone nuovo `__CPM_FG_LOG`
   (acceso solo da sonda con `__CPM_FG_REC`): lo stato della pillola cambia UNA volta per gol, ma nel DOM le pillole si accumulano
   **1 → 10 → 14 → 22** in tre gol: copie con la **stessa chiave React** fra i ~29 fratelli condizionali del contenitore del campo.
   Nessun `cloneNode` nel sorgente, nessun errore React in console: la causa esatta dentro la riconciliazione di React non e'
   isolata. Rimedio: la pillola ha un **contenitore suo**, sempre montato, a tutto campo e senza eventi (`data-cpm="fg-slot"`).
   Misura: **1 pillola per gol e 0 dopo** (rosso `__CPM_NO_FGSLOT`: 1 → 10 → 14 → 22).
   Nota di metodo: il primo conteggio (9 pillole) sommava gli span interni delle emoji; il metro giusto conta i contenitori con
   animazione `floatUp`.
2. **Etichetta FPS:** il contatore l'ha voluto il PO (D7) ed e' lo strumento del collaudo telefono, quindi resta. Nella review
   CGTrader diceva «corpi pieni», falso: ora «CGTrader · N corpi» con i corpi davvero disegnati (rosso `__CPM_NO_HUDCG`).
3. **Squadre invertite al 63':** regola del PO 7.893 («dal 46' la barra si specchia, le squadre cambiano campo»); punteggio coerente
   con i nomi. Nessuna modifica. La lavagna 2D invece NON si specchia: incoerenza fra le due viste, a verbale per il PO.

**Guardiani:** `design-system` verde. `hud-voci` **rosso anche PRIMA di queste modifiche** (stesso esito sulla versione accantonata):
difetto preesistente, non introdotto qui. Il test ha anche un percorso assoluto `/workspace/carrier-manager-/…` scritto a mano che
esiste solo in un altro ambiente (usato un collegamento temporaneo, repository non toccato).
**Non verificato:** il telefono.

## Avanzamento 23 settembre 2026, 10:04 — TABELLINO: DUE GOL CHE IL TABELLONE NON VEDEVA (decisione PO: «correggere sul POC»)

La simulazione e' la fonte di verita' (§20): il motore del possesso decide i gol, il tabellone deve seguirlo. Sonda nuova
`tests/character-lab/tabellino-coerenza.mjs` (partite vere, confronta `__CPM_SCORE` con `tabellino()` del motore e il registro
`__CPM_EV`). Due difetti distinti, entrambi presenti anche nella partita normale (quindi anche su `main`, che NON e' toccato):

1. **Gol del compagno (premio `assist`) mai girato al motore.** Il ponte registrava assist e passaggio ma non il tiro vincente.
   Rimedio: `registra('tiro',lato,{esito:'gol',chi:-1})` quando l'esito e' riuscito (rosso `__CPM_NO_TABASSIST`).
   Misura: verde tabellone 1-2 = motore 1-2 · rosso tabellone 1-2 contro motore **0-2**.
2. **Gol deciso dal motore fra due battiti del minuto, buttato.** Due ipotesi (A: azzeramento del buffer dei sotto-tick al riavvio
   dell'intervallo; B: la scheda interazioni 7.669). Testimone `__CPM_GOLPERSO` (acceso solo da sonda): **A confermata** — un gol
   «away» al 20' era nel buffer quando l'intervallo e' ripartito; la scheda B mostra solo `er_gol` al 18', non c'entra.
   Rimedio: all'azzeramento restano in coda i soli eventi «gol», li narra il battito successivo (rosso `__CPM_NO_GOLPERSO`).
   Misura sulla stessa partita («Giocatore Vero», 1x): verde finale **2-2 = motore 2-2** · rosso **2-1 contro motore 2-2**.
   Controllo su altre 3 partite (2x, 180 s ciascuna, non fino al 90'): 0-2, 1-2, 1-2 tutte uguali al motore, nessun gol doppio.
   **Costo dichiarato:** se il riavvio cade all'inizio di un highlight, il gol compare dopo l'highlight (misurato: ~16 s reali).
   **Effetto dichiarato:** i risultati delle partite possono cambiare rispetto a prima, perche' ora contano gol che il motore gia'
   decideva e il tabellone perdeva.

**Non verificato:** partite intere al 90' in serie, telefono. I guardiani del motore (`match-sequence`, `event-ledger`) non sono
stati rigiocati su questo ramo.

## Avanzamento 23 settembre 2026, 10:15 — TAGLIA DELL'EROE NELLA REVIEW CGTRADER: 0,18 (decisione PO)

**Contesto dal codice:** in produzione la taglia e' **0,12**, scelta dal PO col collaudo del 01/09 (7.713, «zoom in minore»).
La decisione «0,18» vale quindi **solo nella review CGTrader** (`window.__CPM_CGTRADER_HIGHLIGHT_OPTIMIZED`); la partita normale
resta a 0,12 per costruzione. Rosso `__CPM_NO_TAGLIA18`. Il numero e' la taglia CHIESTA, come nel 7.505: il percorso reale ne
rende meno (blend `camHL` e lerp a valle).

**Misura** (`gesto-eroe-review.mjs`, nuovi campi `taglia` e `fuoriQuadroHL`; altezza apparente dell'eroe, frazione del quadro):

| Scena | Verde 0,18 | Rosso 0,12 |
| --- | --- | --- |
| Dribbling, mediana su 3 corse | 0,126 · 0,176 · 0,083 | 0,069 · 0,061 · 0,118 |
| Tiro, fase di scelta | 0,080 | 0,069 |
| Tiro, durante il gesto | 0,082–0,111 | 0,071–0,088 |
| Tiro, dopo il gol (3 corse su 3) | **0,045** | 0,11 |
| Eroe fuori quadro negli highlight | 0–3% | 0% |

**Il tiro dopo il gol va al contrario, e il perche' e' misurato** (testimone nuovo `__CPM_F6LOG`, solo sonda): la regia di base
tiene la camera a **~44 u** dall'eroe e la passata della taglia fa tutto l'avvicinamento (15–17 u). Quando la palla si allontana
oltre 10 u il soggetto passa alla PALLA (regola 7.520) e la passata e' esente per regola 7.505: la camera torna di colpo a 44 u.
Nel verde la palla arriva a 10,1 u dall'eroe, nel rosso si ferma a 9,4: e' un confine sfiorato, non un effetto voluto della
taglia. Lo stesso salto a 44 u esiste anche in produzione ogni volta che il soggetto passa alla palla. **Non corretto qui**: e'
una regola di regia del gioco principale; a verbale per il PO (vedi la foto «dopo il gol» nel banco).
**Nella fase di scelta** la taglia rende poco perche' il blend e' 0,70 (decisione PO 7.729, «riduci lo zoom in»): non toccato.

**Non verificato:** il telefono; la misura headless e' rumorosa (dribbling 0,083–0,176 sullo stesso braccio).

## Avanzamento 23 settembre 2026, 10:18 — PORTIERE IN LOD1 NELLA PRESA (decisione PO)

All'armo della presa (canale `_presaRev`, solo review) il portiere passa da LOD2 a LOD1 **prima** che la clip monti — a gesto
montato lo scambio di scheletro e' bloccato per costruzione. Fuori dagli highlight torna a LOD2. Rosso `__CPM_NO_GKLOD1`.
Sonda `keeper-catch-sequence-review.mjs` (nuovi campi: LOD in presa, promozione, triangoli da `renderer.info`; `CPM_FLAG`):

| | Verde | Rosso |
| --- | --- | --- |
| LOD del portiere nei campioni in presa | **lod1** (16/16) | lod2 |
| Triangoli, mediana · picco | **64.615 · 64.667** | 56.613 · 60.429 |
| Contatto (tempo di clip) · palla-mani · dopo | 1,074 s · 0 · 0 0 0 0 | 1,070 s · 0 · 0 0 0 0 |
| Portiere nel quadro al contatto | si' | si' |

Costo +8.002 triangoli, pari al salto LOD2→LOD1 (12.244−4.190 = 8.054): sotto l'obiettivo 69k. La presa non cambia.
**Non verificato:** il ritorno a LOD2 dopo l'highlight (la sonda si ferma all'uscita da `hl_*`); il telefono.
A verbale (invariato): il testo dell'esito dice «Para in tuffo», il gesto e' una presa alta.

## Avanzamento 23 settembre 2026, 10:21 — MATERIALI CORRETTI ALLA SORGENTE (decisione PO: «la soluzione piu' scalabile»)

Il vincolo della roadmap dice che il modello si corregge nei sorgenti GLB, non a runtime. Blender non c'e' nel container, quindi
la correzione e' fatta **sul file esportato**, dove e' verificabile:

- **Strumento nuovo `tools/glb-materiali.mjs`:** `verifica` (esce 1 se un materiale e' in BLEND) e `correggi` (BLEND→MASK con
  soglia 0,5, la stessa della rete runtime). Tocca solo il blocco JSON del GLB: i dati binari restano **byte per byte** (verificato).
- **Asset corretti:** i 4 GLB CGTrader della review (LOD0/1/2 kit-adapter + LOD0 Ajax) avevano **tutti** i materiali in BLEND
  (6/6; l'Ajax 5/6, la maglia baked era gia' opaca). Ora 0 BLEND.
- **Script Blender** (`build_cgtrader_review_lod.py`, `build_cgtrader_kit_adapter.py`): prima dell'export impostano
  `blend_method=CLIP` / `surface_render_method=DITHERED` se esistono. **Non eseguiti** (niente Blender qui): il giudice resta
  `glb-materiali.mjs verifica` sul file esportato.
- **Rete runtime** (BLEND→MASK al caricamento, rosso `__CPM_NO_ALPHAFIX`): resta come paracadute; con gli asset nuovi corregge 0 materiali.

**Misura** (sonda nuova `materiali-disegnati.mjs`, materiali delle 35 SkinnedMesh disegnate in un fotogramma):

| | Trasparenti | Senza profondita' | In maschera |
| --- | --- | --- | --- |
| Asset corretti, rete runtime SPENTA | **0/35** | 0/35 | 35/35 |
| Asset corretti, rete accesa | 0/35 | 0/35 | 35/35 (rete: 0 correzioni) |
| Asset originali, rete SPENTA (rosso) | 35/35 | 35/35 | 0/35 |

**Non verificato:** il kit sul telefono; l'export da Blender con gli script aggiornati.

## Avanzamento 23 settembre 2026, 10:23 — PREVIEW NETLIFY AGGIORNATA

Stesso sito della preview POC (`https://korward-poc-cgtrader.netlify.app`, deploy `6ab38c41…`, stato `ready`). Dentro: tabellino
coerente col motore, taglia 0,18, portiere LOD1 nella presa, GLB con materiali corretti. **Verifica per confronto di byte:**
i due GLB scaricati sono identici al repo; il file di gioco e' identico salvo lo script HUD che Netlify aggiunge in fondo
(`/.netlify/scripts/hud`, gia' a verbale). L'indirizzo `CARRIER-MANAGER-AV.html` viene reindirizzato da Netlify a
`/carrier-manager-av` (URL «pretty»): stesso contenuto. `main` e GitHub Pages non toccati.
**Non verificato:** il caricamento sul telefono (il Chromium del container non raggiunge siti esterni).

## Avanzamento 23 settembre 2026, 10:47 — DIRETTIVA PO: IL MOTORE UNICO («BRAIN») GUIDA ANCHE GLI HIGHLIGHT

**Parole del PO:** «Il motore deve essere unico e guidare anche gli highlights · il render 3D deve parlare solo con il motore
unico (brain) · monta tutti i gesti e collegali a brain». Coincide con il blocco **B** di `docs/MACRO-PIANO-2026-09.md`
(B0 l'highlight nasce dal motore · B4 attori dai ruoli del motore · B3 il motore muove i 22 in scena · B2 l'esito torna nel
motore): si segue quell'ordine.

**Ricognizione (fatti, con righe nel codice):**
- negli highlight il motore e' **fermo** (`scena`): l'esito lo decidono `succRate` + dado seedato + `decideExecution` in
  `handleAction`; il motore riceve solo il resoconto (`registra`) per il tabellino;
- il 3D **non legge mai il motore**: ~90 prop da React, gran parte da `SITUATIONS`/`deriveHL`/`hlBallSpot`; il render decide
  ancora da solo direzione del tiro, tuffo, ricevente, rimbalzi (`Math.random`, prossimita', cognome);
- gli eventi del motore portano gia' l'indice di chi agisce (`chi/da/a/gk`), ma al 3D arriva un cognome o niente;
- gesti: l'eroe li prende solo dalla scena; i compagni ne ricevono 5 su 17; presa, ricezione, conduzione, rimessa, rinvio,
  spazzata mai collegati; **i portieri CGTrader non hanno tuffo ne' respinta** (il pacchetto ha 31 clip, senza `gk-dive`/`gk-block`).
- **Scoperta che cambia il piano:** dal 7.917 fra un highlight e l'altro il 3D e' **sospeso** (`__CPM_SOSP917`: il PO guarda il
  campo 2D). Il primo passo che avevo scritto — gesti del gioco vivo dal motore — e' quindi **invisibile**; il lavoro vero e' dentro
  la scena.

**Impianto gia' scritto (nessun effetto visibile oggi, rosso `__CPM_NO_BRAINGESTI`):** coda `brainEvRef` in LiveMatch (ogni evento
del motore, appena nasce, con numero d'ordine) passata al 3D come prop `brain`; tabella unica **`BRAIN_GESTI`** evento→ruolo→gesto;
lettore nel ciclo del render che chiede il gesto sul corpo per **indice del motore** (0-20, eroe 21); il vecchio gesto dedotto dalla
cronaca tace quando parla il brain. Testimone `__CPM_BRAIN23`, sonda `brain-gesti.mjs`. Misurato: la coda riceve ~24 eventi per
minuto di gioco; il lettore non gira nel gioco vivo perche' il 3D e' sospeso. Si riusa per la scena (B3/B4).

**Base di B0** (sonda nuova `scene-sorgenti.mjs`, registro `__CPM_EV`, 2 partite a 2x): **4 scene su 8 nascono da un evento del
motore** (`motore-occasione`); le altre 4 da `reattiva` (3) e `si-continua` (1). La partita 0 non e' arrivata al fischio entro il
tetto della sonda (260 s): base parziale, da allargare.

**Prossimo passo:** B0 — ogni scena porta l'id dell'evento del motore che l'ha generata; le sorgenti `reattiva`, `si-continua`,
`catena`, `calendario-tick` passano dal motore (che le propone come evento) invece di aprirsi da sole.

## Avanzamento 23 settembre 2026, 11:09 — B0: LA BASE, CORRETTA

- **Correzione di metodo:** la base «4/8» di prima era sbagliata. `reattiva`, `sotto-63`, `sotto-76` e `secondo-tempo` si scrivono
  nel registro quando la scena viene **messa in calendario** (la catena si scrive anche due volte), non quando si **apre**. Ora la
  sonda `scene-sorgenti.mjs` separa le aperture vere (`motore-occasione`, `calendario-tick`, `catena`, `si-continua`, `calendario`)
  dalle programmazioni.
- **Correzione di sonda:** una partita non arrivava al fischio perche' le scene col movimento bloccato aspettano un comando del
  giocatore; la sonda ora usa il pilota automatico del gioco (`__CPM_AUTOPLAY`). Non e' un blocco del gioco.
- **Base misurata (2 partite intere, 90', 2x, 0 errori):** **5 aperture su 7 nascono da un evento del motore**; le altre **2 sono
  `si-continua`** (dopo un'azione riuscita il gioco pesca da solo una scheda nuova, senza il motore).
- **Prossimo passo:** `si-continua` passa dal motore — torna al gioco e chiede al motore l'occasione dell'eroe, la scena si apre
  sull'evento `occasione_eroe`. Rosso appaiato previsto.

## Avanzamento 23 settembre 2026, 11:21 — B0: OGNI SCENA NASCE DAL MOTORE (8/8)

`si-continua` apriva subito la scena successiva ripescando una scheda dal catalogo, senza il motore. Ora si torna al gioco (ramo
«montaggio») e la scena successiva si apre dalla porta normale, sull'evento `occasione_eroe` del motore. Rosso `__CPM_NO_B0SC`.

| | Aperture dal motore | Sorgenti |
| --- | --- | --- |
| **Verde** (2 partite intere, 90', 0 errori) | **8/8** | motore-occasione 8 |
| Rosso `__CPM_NO_B0SC` (stesso build) | 6/8 | motore-occasione 6 · si-continua 2 |

**Costo dichiarato:** sparisce il passaggio immediato «⚡ SI CONTINUA!» fra due scene; la scena successiva arriva dopo un tratto di
gioco. **Rischio dichiarato:** le due corse non giocano scene identiche (il pilota automatico e i tempi reali cambiano l'ordine);
la misura confronta le SORGENTI, non le scene. Restano nel codice due reti che aprono senza il motore — `calendario-tick` (dopo 14'
senza occasione) e `calendario` (salto manuale) — mai viste in queste 4 partite: da portare nel motore insieme a B2.
**Non verificato:** il telefono; partite oltre le 2 per braccio.

## Avanzamento 23 settembre 2026, 11:47 — B4 (primo passo): IL CAST DELLA SCENA LO DICHIARA IL MOTORE, IL PASSAGGIO VA AL SUO RICEVENTE

- **Il motore dichiara il cast** nell'evento `occasione_eroe`: `ricevente` (compagno di movimento libero col miglior avanzamento
  meno meta' della distanza), `difensore` (avversario di movimento piu' vicino), `portiere` (quello avversario). Solo letture
  deterministiche, **nessun sorteggio in piu'**: la partita resta riproducibile. LiveMatch lo consegna al 3D con la scena (prop `castBrain`).
- **Il passaggio dell'eroe va al ricevente del motore** se e' davanti alla palla (vincolo PO 7.475: mai all'indietro) ed entro 40u;
  altrimenti resta la scelta geometrica, contata. Rosso `__CPM_NO_B4RIC`.
- **Testimone B4** (`__CPM_B4`, solo sonda): per ogni scena, attore usato dal 3D contro attore del cast, per ruolo. Correzione di
  metodo: il ricevente si legge solo nella conclusione (`hl_result`), perche' `passTargetMesh` non si azzera al cambio scena.

| Ricevente (2 partite intere per braccio) | Stesso giocatore del motore | Distanza mediana |
| --- | --- | --- |
| Base prima del rimedio | 0 su 4 | 29,5 u |
| **Verde** | **3 su 5** | **0 u** |
| Rosso `__CPM_NO_B4RIC` | 1 su 2 | 31,2 u |

Portiere: gia' coincidente (5/5, 6/6). **Difensore: non coincide** (0/5 a 15,9u nel verde, 2/5 a 6,9u nel rosso: non toccato, la
differenza e' fra scene diverse). **Campione piccolo**, dichiarato. Le 2 scene verdi non coincidenti passano da altri punti che
scelgono il ricevente (cross, consegne d'emergenza): prossimi da portare sul cast.
**B0 riaperto:** in una corsa e' comparsa un'apertura `catena` (secondo tempo della stessa azione) che non passa dal motore: 8/9.
**Prossimi passi:** difensore dal cast · ricevente negli altri punti · `catena` nel motore.

## Avanzamento 23 settembre 2026, 23/09 12:13 — B4: IL DIFENSORE DAL MOTORE
Quattro punti del 3D (contrasto su dribbling fallito ×2, intercetto, inciampo/giravolta) sceglievano l'avversario piu' vicino.
Ora chiedono `_castDif23`: il difensore del cast se e' entro 14u dal punto dell'azione, altrimenti la scelta di prima (contata).
Rosso `__CPM_NO_B4DIF`. 2 partite intere per braccio, 8/8 scene dal motore in entrambi.
Difensore: verde **4/6, mediana 0 u** · rosso 2/6, mediana 12,9 u · base 0/5, 15,9 u. Campione piccolo, dichiarato.

## Avanzamento 23 settembre 2026, 23/09 12:40 — B0: LA CATENA EREDITA L'EVENTO DEL MOTORE
La catena (secondo tempo della stessa azione: sponda, mischia, seconda palla, dopo-dribbling) si apriva senza il motore. Ora eredita
l'evento del motore che ha aperto l'azione (id = minuto + scena d'origine) e il suo cast; sorgente registrata `catena-motore`.
Ogni apertura dal motore porta ora nel registro il campo `evento`. Rosso `__CPM_NO_B0CAT`. **Scelta di misura dichiarata:** la
catena conta come «nata dal motore» perche' e' la stessa azione; l'esito della prima meta' resta deciso dal dado finche' non arriva B2.
Verifica: 6 partite intere (semi 0-5), **26/26 aperture dal motore**, 0 errori — **nessuna catena comparsa**, anche forzando l'esito
riuscito (il successo porta spesso al gol, e dopo un gol si riparte dal centro). Il ramo catena e' quindi **non misurato**.

---

## Obiettivo vincolante

Creare un solo sistema di personaggi adulti credibili, stilizzati oppure semi-realistici, per partita, intro, highlight e ritratti profilo. Il modello deve essere costruito e corretto nei sorgenti Blender/GLB, non tramite geometrie correttive a runtime.

Il sistema deve ereditare dai dati di gioco kit e pattern del club, ruolo, numero, pelle, capelli, barba e varianti di corporatura. Non modifica Match Engine, telecronaca, eventi, carriera o risultati della simulazione.

## Stato corrente leggibile — 21 settembre 2026, 23:24

| Area | Stato effettivo | Prossimo criterio di chiusura |
| --- | --- | --- |
| Modello | **PASS con vincoli:** Soccer Player Hisenberg/CGTrader è il candidato scelto: adulto, kit completo, licenza acquistata, sorgente Blender e rig riutilizzabile. | Non cercare un’altra base senza una comparazione che superi questi requisiti. |
| LOD locale | **PASS tecnico locale:** 23 avatar, tre LOD animati compatibili ciascuno; Hero sempre LOD0, swap per distanza, promozione a LOD0 pre-gesto e blocco dello swap durante dribbling. | Sequenza tecnica reale, non simulata, con palla e telecamera. |
| Scala roster | **PASS tecnico locale aggiornato:** porta = 2,44 unità; Hero = 1,875 e altri giocatori = 1,76–1,83, misurati sulle ossa del rig. Il precedente uso dell’altezza procedurale (fino a 2,50) li rendeva quasi alti quanto la porta. | Riesame visivo sul telefono: nessuna dichiarazione di pass finché non si confermano proporzioni, kit e animazioni in camera. |
| Kit runtime | **PASS tecnico locale:** corrette le associazioni materiali del GLB: maglia -> `HyperShirt`, pantaloncini -> `HyperShorts`, gambe escluse dalla colorazione del club. Tre asset LOD adattati caricano con HTTP 200, rig e clip invariati. | Riesame visivo del kit su telefono; calzettoni/scarpe richiedono maschere texture sorgente, non soglie geometriche approssimate. |
| Capelli nativi | **PASS tecnico locale:** la sola texture della testa CGTrader viene assegnata dai dati del giocatore; nel roster di controllo: 2 neri, 14 castani, 4 biondi e 3 ramati, tutti HTTP 200. Pelle, occhi e geometria restano quelli sorgente. | Review su telefono; la forma resta il taglio nativo e barba/baffi sono ancora aperti. |
| Dribbling roster LOD | **PASS tecnico locale:** la clip completa registra sinistro 0,226, destro 0,327 e sinistro 0,732; ogni appoggio è dell’Hero in LOD0. La fase passa in `hl_result` mantenendo l’Hero a LOD0 e senza errori browser. | Riesame visivo in camera di busto/braccia, recupero e misura mobile reale. |
| Prestazioni mobile | **FAIL aperto:** le misure utente precedenti sono 11–16 FPS; il benchmark browser locale non sostituisce Android/iOS. | Frame time, FPS, memoria e qualità nei primi piani su telefono. |
| Pubblicazione | **NON ESEGUITA:** nessun commit nuovo è stato pushato, `main` e GitHub Pages restano invariati. | Solo dopo tutti i quality gate e una destinazione preview separata approvata. |
## Controllo stato — 21 settembre 2026, 23:48

- **Verificato ora:** il lavoro resta solo sul ramo locale poc/marioprada-character-system-local; nessun nuovo push e GitHub Pages da main non è stata modificata.
- **Verificato ora:** il roster locale usa la scala delle ossa e i tre LOD con materiali corretti: maglia e pantaloncini ereditano i rispettivi colori club; le gambe non vengono più scambiate per la maglia. Il dribbling registra tutti e tre gli appoggi a LOD0.
- **Verificato ora:** ogni avatar attivo CGTrader riceve la texture nativa della sola testa in base al colore capelli dei dati gioco. Il controllo assegna 23/23 texture, carica tutte e quattro le varianti con HTTP 200 e non rileva errori browser.
- **Aperto:** qualità di animazione, sincronismo palla nella sequenza reale, transizioni e prestazioni mobile 11–16 FPS segnalate su telefono.
## Stato verificato

- Il pacchetto CGTrader acquistato è archiviato localmente in tutti i suoi 19 file originali: Blender, FBX, GLB, OBJ/MTL, componenti separati, texture e rig Normal/Unreal.
- Hyper Casual, CH38 e il precedente pacchetto Standard sono esclusi dal percorso definitivo per evitare selezioni accidentali.
- **Blocco sorgente:** Quaternius non è autorizzato per volto, corpo, kit, ritratti o animazioni del nuovo sistema. Il candidato unico attivo è CGTrader.
- È disponibile un audit iniziale delle clip e del costo renderer. Non costituisce ancora un superamento del collaudo mobile o visivo.
- Il modello attualmente pubblicato sul branch POC **non è approvato come modello definitivo** e non va usato come riferimento di qualità.
- Il corpo adulto CGTrader verificato ha 34.995 triangoli, 68 ossa deformanti e un rig sorgente da 344 ossa. È un baseline Hero valido, ma richiede LOD e misure reali prima dell’uso simultaneo per 22 giocatori.

## Piano e criteri di chiusura

| Fase | Risultato verificabile | Stato |
| --- | --- | --- |
| 0. Asset gate | Ispezione del sorgente acquistato: rig, mesh, materiali, anatomia, volto, kit, compatibilità clip e budget mobile. | completata con vincoli: candidato CGTrader adulto approvato come base; servono capelli, volto, LOD e clip |
| 0B. Selezione modello | Valutare un modello già progettato come calciatore adulto credibile, con volto e kit credibili. | completata: pacchetto CGTrader acquistato e archiviato |
| 1. Modello definitivo | Base adulta proporzionata; volto allegro e leggibile; bocca/naso/occhi; collo e braccia corretti; maglia, pantaloncini e calzettoni completi nel GLB. | in corso: base statica verificata; le clip preesistenti non sono direttamente riutilizzabili sui rig acquistati, servono calibrazione sorgente e varianti capelli/volto e LOD |
| 2. Personalizzazione | Capelli, barbe/sopracciglia, pelle, corporatura e kit home/away/terza/portiere dai dati club; bande e strisce reali del kit. | da avviare |
| 3. Pipeline unica | Stesso modello per Hero, 21 giocatori, portieri, intro, panchina, highlight e ritratto profilo; eliminazione definitiva dei percorsi Hyper Casual e libreria SVG. | da avviare |
| 4. Animazione core | Locomozione, ricezione, controllo, conduzione, passaggi corti/lunghi, tiri, cross e colpi di testa con corpo, braccia e palla coordinati. | audit completato, implementazione da avviare |
| 5. Animazione estesa | Dribbling/finte, tackle, duelli, movimenti senza palla, cadute, falli e piazzati. | da avviare |
| 6. Contesto e polish | Comunicazione, emozioni, panchina, ingresso, fine partita, micro-gesti, varietà ed errori realistici. | da avviare |
| 7. Performance e collaudo | Misura reale Android/iOS: FPS, frame time, draw call, mixer, memoria e stabilità; pubblicazione POC per test mobile. | da avviare |

## Regole di qualità

1. Ogni gesto usa tutto il corpo: orientamento, busto, braccia, piede d'appoggio, caricamento, impatto, follow-through e recupero postura.
2. La palla parte all'impatto e ogni clip entra/esce con transizioni coerenti.
3. Cross, passaggio lungo/corto, tacco, doppio passo, finte e tiri non vengono dichiarati completi se sono soltanto alias di una stessa clip.
4. Ogni kit viene generato da sezioni/materiali previsti dal modello; colori e pattern arrivano dai club e non devono tingere pelle, viso o collo.
5. Nessuna fase è completata senza una verifica visiva documentata e, dove applicabile, un test automatico e una misura sul telefono.

## Quality gate finale

| Area | Esito |
| --- | --- |
| Modello, viso e kit | FAIL — volto tecnico corretto, ma preview Ajax ancora non approvabile e kit da ricostruire |
| Locomozione | FAIL — audit iniziale, nessuna validazione finale |
| Controllo, passaggi, cross, tiri, testa | FAIL — servono clip e sincronismo verificati |
| Dribbling, contrasti, cadute e piazzati | FAIL — copertura incompleta |
| Transizioni e micro-gestualità | FAIL — copertura incompleta |
| Sincronismo con la palla | FAIL — calibrazione da eseguire |
| Varietà | FAIL — da costruire e misurare |
| Performance mobile | FAIL — nessuna misura reale Android/iOS del candidato definitivo |

## Registro avanzamenti

| Data | Avanzamento | Verifica | Esito |
| --- | --- | --- | --- |
| 20/09/2026 | Identificato il pacchetto acquistato da 630 MB come unica sorgente autorizzata. | Contenuto ZIP: sorgenti Blender e libreria separata di capelli, barbe e sopracciglia. | PASS per avvio asset gate |
| 20/09/2026 | Rimossi Standard e CH38 locali per evitare riuso accidentale. | Verifica della cartella temporanea. | PASS |
| 20/09/2026, 12:19 | Roadmap riallineata al pacchetto acquistato e ai quality gate concordati. | Revisione dei vincoli: modello GLB, kit ereditati, animazione corpo-palla e performance mobile. | PASS documentale; asset gate ancora aperto |
| 20/09/2026, 12:37 | Inventariato il pacchetto sorgente acquistato: 20 file Blender e 128 componenti FBX. | Confermati Regular_Male_FullBody, testa separata, busto separato e libreria capelli. | PASS per avvio analisi rig e mesh |
| 20/09/2026, 12:55 | Ispezionata la base corpo adulto in Blender. | 1 armatura, 65 ossa deformanti, 382 ossa di controllo, 13.880 triangoli e 4 materiali. | PASS tecnico preliminare; restano anatomia, volto e kit |
| 20/09/2026, 13:13 | Render neutro della base Blender per valutazione visiva. | Base adulta confermata; T-pose, nessun kit o capelli e materiale tecnico nel sorgente. | PASS come base da modellare; FAIL come asset gia pronto |
| 20/09/2026, 13:55 | Ispezionata la libreria capelli maschile. | 36 mesh modulari: tagli, sopracciglia, barbe e livelli di dettaglio compatibili. | PASS per personalizzazione modulare; combinazioni da definire in Fase 2 |
| 20/09/2026, 14:34 | Generato il primo vertical slice Ajax nel modello Blender. | GLB esportato e renderizzato; volto e capelli leggibili, ma kit con bordi e pantaloncini non idonei. | FAIL visivo sul kit; serve modellazione pulita delle divise |
| 20/09/2026, 15:08 | Sostituiti occhi e sopracciglia tecnici nel GLB con tratti facciali piccoli e vincolati alla testa. | Esportazione GLB completata; eliminato l'effetto occhi grandi e colorati. | PASS tecnico sul volto; FAIL visivo complessivo finché non si approvano espressione e kit |
| 20/09/2026, 15:25 | Rivista la prima costruzione del kit direttamente dalla superficie del corpo. | I bordi esposti e le giunzioni non raggiungono la qualità richiesta. | Tecnica rifiutata; il kit passa a una mesh di abbigliamento dedicata, non a una sovrapposizione di superfici |
| 20/09/2026, 15:49 | Completata la valutazione visiva della sorgente acquistata. | Rig adulto e libreria capelli riutilizzabili; volto e abbigliamento base non raggiungono lo stile professionale richiesto. | Riutilizzare rig e capelli; ricostruire volto e kit come asset dedicati |
| 20/09/2026, 16:09 | Decisione di non promuovere Quaternius a modello finale. | Il costo di modellazione necessaria non è proporzionato al valore di una POC; il pacchetto resta riutilizzabile per rig e capelli. | Ricerca e prova di un candidato nato per calcio cartoon serio |
| 20/09/2026, 16:26 | Avviata la ricerca mirata di candidati sportivi nativi. | Individuati candidati con rig e formati GLB/FBX/Blender dichiarati dai venditori; nessun file e nessuna compatibilità sono ancora verificati. | In attesa di un candidato da scaricare e sottoporre ad asset gate |
| 20/09/2026, 16:42 | Confrontati i primi candidati del mercato. | ThreeDee dichiara Blender, FBX/GLB e 52 blendshape facciali; il pack CGTrader esaminato è esplicitamente un "Soccer Boy" e non rispetta il target adulto. Dichiarazioni dei venditori: file non ancora ispezionati. | ThreeDee resta candidato preliminare; pack CGTrader escluso. Prossimo gate: preview completa e verifica sui file prima di ogni acquisto |
| 20/09/2026, 16:48 | Approfondita la shortlist. | ThreeDee Soccer Player dichiara rig corpo/viso, sorgenti Blender, GLB/FBX e topologia low-poly; i modelli realistici di CGTrader e 3DPassion non rispettano lo stile cartoon serio o il budget mobile. Dichiarazioni dei venditori, non ancora test sui file. | ThreeDee è l'unico candidato consigliabile nella shortlist; resta obbligatoria la verifica del pacchetto scaricato |
| 20/09/2026, 16:55 | Vincolo estetico aggiornato: il modello non deve essere obbligatoriamente cartoon. | Nuovo target: adulto credibile, stilizzato o semi-realistico, con volto gradevole e kit completo. Individuati due candidati realistici con Blender, GLB/FBX e rig dichiarati; il CGTrader da $14,27 ha 17.891 poligoni e file sorgente, mentre Fab dichiara kit professionale e formati equivalenti. | Shortlist riaperta: verificare preview e pacchetto di un candidato realistico prima della selezione |
| 20/09/2026, 17:23 | Selezionato il candidato CGTrader come primo asset gate a basso rischio. | La preview mostra proporzioni adulte e kit completo; scheda dichiarata: rig, Blender, FBX e glTF. Nessun file scaricato o testato ancora. | Attesa del pacchetto acquistato: il gate passa solo dopo ispezione del file reale in Blender e nel browser |
| 20/09/2026, 17:30 | Pacchetto acquistato reso disponibile in Drive e asset gate avviato. | Verificata la presenza di sorgente Blender da 118,4 MB, CHARACTER.glb da 13,6 MB, FBX, testa, arti, maglia, pantaloncini e texture separati. Il download della sorgente richiede la conferma esplicita dell'avviso antivirus di Google. | Scaricare sorgente e GLB, poi misurare rig, mesh, materiali e resa reale |
| 20/09/2026, 17:42 | Scaricati e ispezionati sorgente Blender e GLB acquistati. | Sorgente: 344 ossa, 68 deformanti, 34.995 triangoli e 6 materiali; kit modulare presente. Il GLB venduto importa senza armatura né animazioni; il `.blend` non contiene action o shape key facciali. | PASS CON VINCOLI: riesportare un GLB riggato dalla sorgente, creare LOD e validare kit/volto/animazioni prima dell'integrazione |
| 20/09/2026, 17:47 | Generato e reimportato un GLB runtime dalla sorgente Blender. | `cgtrader-player-runtime-base.glb` conserva le mesh pesate e riduce lo scheletro da 344 controlli a 68 ossa runtime. Nessuna animazione viene dichiarata disponibile. | PASS per la base tecnica; seguono kit club, capelli/volto, LOD e retarget delle clip |
| 20/09/2026, 17:52 | Renderizzata la preview dal GLB reale con le texture del pacchetto. | Verificate proporzioni adulte, kit completo e righe verticali reali sulla maglia. Rimangono una sola testa, nessuna capigliatura modulare e nessuna shape key facciale. | PASS visivo preliminare; chiudere Fase 1A con varianti sorgente, LOD e prima clip retargettata |
| 20/09/2026, 18:16 | Completato l’archivio locale del pacchetto CGTrader acquistato. | Conteggio indipendente: 19/19 file presenti — Blender, FBX, GLB, OBJ/MTL, componenti, texture e rig Normal/Unreal. | PASS archivio; usare il `.blend` come sorgente autorevole e i formati alternativi per verifiche/retarget |
| 20/09/2026, 18:31 | Verificati i due rig FBX alternativi inclusi nel pacchetto. | `NORMAL+RIG`: 60 ossa deformanti; `UNREAL+RIG`: 75 ossa deformanti con gerarchia Unreal convenzionale. Nessuno contiene clip o shape key. | PASS inventario; scegliere lo scheletro solo dopo una prova di retarget con contatti piede/palla |
| 20/09/2026, 19:00 | Esportata e validata la base runtime dal `NORMAL+RIG.fbx`. | GLB con 7 mesh, 60 joint, 35.075 triangoli e 0 clip; preview statica completa e senza geometrie di controllo nel file. Il rig è il candidato di retarget perché i suoi nomi anatomici corrispondono alla mappa offline esistente. | PASS statico; il warning di normalizzazione a 4 influenze richiede ancora un test in movimento prima dell’adozione definitiva |
| 20/09/2026, 19:15 | Eseguita la prima prova di retarget sul rig `NORMAL+RIG`. | L’asset statico passa, ma il gate anatomico del retarget fallisce già su `idle`: disallineamento massimo 179,62°, oltre la soglia 0,29°. Nessuna clip è stata promossa né integrata. | FAIL corretto: non usare Normal per animazione; provare il rig Unreal, la cui gerarchia corrisponde direttamente alle clip esistenti |
| 20/09/2026, 19:45 | Provato il retarget anche sul `UNREAL+RIG`. | Il GLB Unreal è pulito (7 mesh, 75 joint), ma il medesimo gate anatomico fallisce sull’idle a 179,62°. La compatibilità dei nomi non basta: le pose di riferimento hanno un asse opposto. | FAIL controllato: nessun rig viene adottato finché non passa la calibrazione esplicita di spazio/asse e il test dinamico |
| 20/09/2026, 20:03 | Misurata la compatibilità diretta tra le clip esistenti e `UNREAL+RIG`; ispezionato anche `CHARACTER.fbx`. | Copiare le pose locali produce 40–154° di scarto nei segmenti corporei; `CHARACTER.fbx` è una mesh statica senza armatura né action. | FAIL controllato: non riusare meccanicamente le clip; impostare un retarget calibrato da sorgente motion compatibile |
| 20/09/2026, 20:20 | Cercate sorgenti motion locali e verificato il file `Earring.fbx` del pacchetto. | Non esistono FBX/BVH motion utilizzabili nel progetto; `Earring.fbx` è una mesh statica da 50.000 triangoli, senza rig o action. | BLOCCO tecnico ripetibile: serve una sorgente motion con licenza e posa di riferimento documentata; non caricare il modello su servizi esterni senza autorizzazione |
| 20/09/2026, 20:40 | Aperta la sessione Mixamo autorizzata per acquisire motion compatibile. | Mixamo conferma workflow di upload e download motion; il servizio richiede accesso Adobe, non ancora effettuato dall’utente. | In attesa dell’accesso Adobe: dopo il login, caricare `UNREAL+RIG.fbx` autorizzato e scaricare idle/jog per il primo gate |

| 20/09/2026, 21:31 | Accesso Adobe completato e `UNREAL+RIG.fbx` CGTrader caricato/autoriggato in Mixamo. Selezionata e riprodotta l’anteprima `Neutral Idle` sul nuovo personaggio; corpo, kit e braccia restano collegati al rig durante la preview. | Screenshot e stato del viewer Mixamo: personaggio `UNREAL+RIG` attivo, `Neutral Idle` caricato (264 frame). L’esportazione FBX è stata richiesta, ma il downloader dell’in-app browser non espone ancora il file al workspace per l’import Blender. | PASS per compatibilità del workflow Mixamo e preview; acquisire un FBX accessibile localmente, poi misurare scheletro, clip e deformazioni prima di promuovere idle. |
| 20/09/2026, 21:46 | Configurata in Mixamo la clip `Jogging` con opzione `In Place`; mantenuta aperta la sessione del rig CGTrader per la successiva acquisizione. | Il viewer Mixamo indica `Jogging on UNREAL+RIG`, 78 frame, `In Place` selezionato. Il rig originale e le anteprime non mostrano il disallineamento anatomico che aveva bloccato il retarget delle clip locali. Il file FBX non è ancora accessibile nel workspace. | PASS per preview e impostazione locomozione; importare il FBX nel workspace, poi controllare scheletro, deformazioni, loop e costo runtime. |
| 20/09/2026, 22:35 | Rifiutato il test capelli lunghi costruito con primitive: non rispetta il quality gate visivo e non verrà usato. Inviata al venditore CGTrader una richiesta per una libreria hair nativa e compatibile. | Ispezione del pacchetto: una sola capigliatura incorporata nel modello, senza mesh modulari né blendshape. Messaggio inviato a Hisenberg: catalogo/previews, rig comune, LOD/poligoni, texture, varianti facciali, prezzo/licenza e fattibilità di un pack mobile. | FAIL corretto per il prototipo; attendere risposta del venditore oppure progettare una libreria di hair mesh professionale nel Blender sorgente. |
| 20/09/2026, 22:50 | Ricerca autonoma di librerie capelli real-time adattabili al personaggio CGTrader. | Candidato principale: 14 Real-time Hairstyles for man collection 04 (Blender/FBX/OBJ/DAE, 14 file hair, mappe 1K, elementi combinabili). La scheda dichiara 8–17,5k triangoli per stile in due sezioni incoerenti: dato da verificare sui file. Individuata anche una raccolta gratuita da 21 stili esclusivamente per prova tecnica, ma con 915,4k triangoli complessivi e licenza CC BY. | PASS ricerca; nessuna compatibilità o prestazione è promossa finché una hair non è agganciata e pesata alla testa CGTrader nel Blender sorgente, esportata in GLB e misurata. |
| 20/09/2026, 23:01 | Checkpoint di avanzamento: nessuna build o clip aggiuntiva è stata promossa dopo la ricerca hair. | Il rig Mixamo resta pronto con preview Idle, Jogging e Dribble, ma nessun FBX scaricato è disponibile nel workspace per il quality gate. La libreria capelli esterna resta solo candidata, non integrata. | Stato invariato e non pubblicabile: completare acquisizione locale di una clip Mixamo e il test Blender di una hair reale. |
| 20/09/2026, 23:17 | Tentata la ripresa dell’acquisizione Mixamo per portare il dribbling nel workspace. | FAIL operativo: Chrome rifiuta l’automazione perché una UI di estensione è aperta; non è stato caricato, modificato o scaricato alcun file. | Serve chiudere o completare la UI dell’estensione nel Chrome desktop; poi si acquisisce il FBX Dribble e si esegue il primo quality gate corpo-palla. |
| 20/09/2026, 23:34 | Recuperata in Mixamo la clip calcio Dribble — Forward Jog Dribbling Soccer Ball sul rig auto-riggato CGTrader. | Preview verificata su UNREAL+RIG: 53 frame, controlli Side Of Foot, Stride, Arms e Overdrive; impostata esportazione FBX Binary senza skin, 30 fps, nessuna riduzione keyframe. Il browser conferma l’avvio del download, ma nessun FBX compare ancora nella cartella Downloads accessibile al workspace. | PASS preview e configurazione; gate dinamico ancora aperto finché il file FBX non è importabile in Blender e non supera i controlli di scheletro, contatto piede-palla e transizione. |
| 20/09/2026, 23:52 | Verificata la disponibilità locale della clip Dribble dopo il download Mixamo. | Nessun FBX recente risulta né in Downloads né nel workspace; il browser ha avviato il trasferimento ma non lo consegna a una cartella importabile. | FAIL di consegna del file, non della clip; la preview Mixamo resta disponibile e il prossimo passo è estrarre un download accessibile prima dell’import Blender. |
| 21/09/2026, 00:08 | Controllata la conversazione CGTrader per la libreria capelli nativa. | Nessuna risposta nuova del venditore: sono confermati soltanto il messaggio già inviato e l’assenza di allegati. Non è stata acquistata né integrata alcuna libreria esterna. | In attesa di dati verificabili dal venditore; in parallelo resta aperta la prova tecnica della libreria hair esterna selezionata. |
| 21/09/2026, 00:24 | Verificato un percorso alternativo per scaricare il FBX in una cartella locale: Mixamo aperto in Chrome desktop. | FAIL di sessione: Chrome desktop non è autenticato su Mixamo. L’in-app browser conserva il rig e la preview, ma non espone il download al workspace; Chrome può consegnarlo localmente solo dopo login Adobe. | Azione utente necessaria: autenticare Adobe/Mixamo nel Chrome desktop, senza cambiare impostazioni; poi l’FBX Dribble può essere scaricato direttamente e importato in Blender. |
| 21/09/2026, 00:40 | Checkpoint: non è ancora disponibile una sessione Adobe in Chrome desktop. | Nessuna nuova clip, build o hair asset è stata generata; il blocco è circoscritto alla consegna locale dell’FBX e non altera il modello sorgente o il branch. | Stato in attesa dell’accesso Adobe nel Chrome desktop; appena disponibile, l’import e il quality gate Dribble sono il lavoro prioritario. |
| 21/09/2026, 00:56 | Verificato il browser di lavoro dopo il checkpoint. | Non è presente una sessione Chrome Mixamo autenticata né un FBX Dribble locale; la sessione temporanea Mixamo si è chiusa senza modificare file. | Nessun avanzamento tecnico possibile fino all’accesso Adobe desktop o alla consegna manuale dell’FBX; gli altri gate restano fermi per non introdurre soluzioni di animazione non verificate. |
| 21/09/2026, 01:13 | Checkpoint di stato senza nuove acquisizioni. | Il modello CGTrader, la preview Dribble e la ricerca hair restano invariati; non sono disponibili file motion o hair nuovi da sottoporre ai gate. | Il prossimo evento utile è l’accesso Adobe in Chrome desktop o un allegato/risposta del venditore; fino ad allora non è corretto simulare copertura o sincronismo non verificati. |
| 21/09/2026, 01:29 | Checkpoint: in attesa del prerequisito esterno per l’import motion. | Nessuna variazione in repository, build, clip o risposta del venditore. Il blocco e la fase restano invariati. | Continuare immediatamente con l’import del Dribble quando Chrome dispone della sessione Adobe autenticata; nessuna pubblicazione è autorizzata prima dei gate dinamici. |
| 21/09/2026, 01:44 | Checkpoint pianificato: nessun nuovo materiale acquisito. | Nessun FBX locale, nessun nuovo asset capelli e nessuna risposta CGTrader da verificare; la stima resta invariata perché i gate non sono eludibili. | Attesa della sessione Adobe Chrome per proseguire con Dribble; il primo test Blender determinerà se la clip viene acquisita o rifiutata. |
| 21/09/2026, 02:00 | Checkpoint periodico senza nuovi input esterni. | Stato tecnico invariato: l’anteprima Dribble esiste solo nel viewer Mixamo e non esiste un FBX importabile; il modello e il branch non sono stati toccati. | Priorità invariata: autenticazione Adobe nel Chrome desktop per il download; dopo l’import si misura il primo gesto in Blender. |
| 21/09/2026, 02:16 | Completato l’audit baseline di clip, mapping e concatenazioni senza modificare Match Engine o telecronaca. | Inventariati 35 nomi di clip distinti in 70 file GLB e la tabella runtime: molte varianti logiche riusano pass/kick/dribble; il CGTrader resta senza clip promossa. Il report assegna FAIL ai quality gate e priorità P0/P1 con piano per fasi. | PASS documentale della baseline; il prossimo gate resta l’import del Dribble per iniziare Fase 1B con misure su deformazione, contatto e blending. |
| 21/09/2026, 02:36 | Validato il report di audit e corretto il conteggio inventario. | Report presente con tutte e 7 le sezioni richieste; 70 file GLB di animazione corrispondono a 35 nomi di clip distinti, perché due serie sono parallele. Nessun cambio al runtime. | PASS documentale; l’import Mixamo resta il gate che abilita la prima prova dinamica sul rig finale. |
| 21/09/2026, 02:52 | Eseguito l’audit automatico delle animazioni e tentata la baseline prestazionale. | udit:animation PASS: 23/35 clip nel manifest, rig 65 joint; contatti pendenti per 8 gesti critici. udit:animation-performance non parte: manca Chromium Playwright e il download autorizzato è scaduto in rete. | PASS inventario automatico; FAIL misurazione performance finché Chromium non è installato e il Dribble non è importabile localmente. |
| 21/09/2026, 03:12 | Ottenuta la prima baseline renderer con Chrome locale, senza scaricare Playwright. | 23 avatar/mixer/skeleton update, 45 azioni attive, 1.104.160 triangoli, 176,2 draw/frame e 203 MB heap; benchmark 4,7 fps headless (contatore live 1 fps). | FAIL performance: non è un collaudo mobile ma dimostra che servono LOD, consolidamento materiali e throttling prima di 22 CGTrader completi. |
| 21/09/2026, 03:29 | Audit LOD/visibilità completato senza toccare il renderer. | Nessun LOD avatar è presente; i mesh avatar impostano rustumCulled=false in più siti e non esiste throttling mixer/scheletro per distanza. | P0 performance confermato: creare LOD nel .blend CGTrader e definire fasce Hero/vicino/lontano prima dell’uso simultaneo di 22 giocatori. |
| 21/09/2026, 04:05 | Creato LOD1 direttamente dal sorgente Blender CGTrader e riesportato come GLB separato. | Verifica strutturale: 12.243 triangoli contro 34.995 del LOD0 (-65,0%), 7 mesh, 6 materiali/texture, 68 joint deformanti e zero animazioni, quindi scheletro runtime invariato. Render workbench della silhouette a distanza: PASS come LOD lontano; texture e deformazione dinamica non sono ancora validate. | PASS asset LOD1; definire LOD2 e regole di selezione/throttling, poi misurare 22 giocatori e acquisire Dribble Mixamo per il gate corpo-palla. |
| 21/09/2026, 04:24 | Creato LOD2 dal medesimo Blender CGTrader, mantenendo kit, pesi e scheletro runtime. | Verifica strutturale: 4.193 triangoli contro 34.995 del LOD0 (-88,0%), 7 mesh, 6 materiali/texture, 68 joint e zero animazioni. Render workbench della silhouette a distanza: PASS solo per fascia lontana; non sostituisce la validazione di texture, deformazioni e utilizzo con 22 giocatori. | PASS asset LOD2: la catena LOD0/1/2 esiste nel GLB. Chiudere il gate performance solo dopo selezione distanza, throttling e misura reale mobile; la priorità parallela resta l’FBX Dribble Mixamo locale. |
| 21/09/2026, 04:42 | Validato il contratto di skin tra LOD0, LOD1 e LOD2 con un controllo GLB ripetibile. | Tutti e tre i GLB hanno un solo skin, 68 joint nello stesso ordine e 7 primitive con POSITION/JOINTS_0/WEIGHTS_0 coerenti; nessun indice joint esce dal relativo skin. | PASS tecnico per scambio LOD senza rimappatura dello scheletro. Restano FAIL i gate di selezione runtime, deformazione in clip, contatti palla e performance mobile. |
| 21/09/2026, 05:06 | Ottimizzate direttamente nei GLB anche le texture delle fasce LOD, senza toccare il sorgente acquistato. | LOD1: texture 2K→1K, 4,24 MB e 20 MiB RGBA stimati; LOD2: 2K→512, 1,30 MB e 5 MiB RGBA stimati. LOD0 resta 14,57 MB e 80 MiB RGBA stimati. La validazione del contratto skin ripassa su entrambi i nuovi export. | PASS asset e memoria: i LOD non duplicano più texture 2K. Restano da verificare resa su dispositivo, caching texture e comportamento animato con 22 giocatori. |
| 21/09/2026, 05:23 | Rieseguita la ricerca locale della motion acquisita da Mixamo prima di procedere con qualunque retarget. | Sono presenti soltanto gli FBX statici originali del pacchetto CGTrader; non esiste alcun FBX Dribble/Jog/Idle importabile. Nessuna clip è quindi stata falsamente promossa o collegata al modello. | BLOCCO invariato e circoscritto: acquisire un FBX Mixamo in una cartella locale, poi validare deformazione, braccia coordinate, contatto piede-palla e transizioni in Blender. |
| 21/09/2026, 05:41 | Definito il piano di integrazione LOD con budget e criteri misurabili, senza modificare il renderer. | Il piano assegna LOD0 al solo Hero, LOD1 ai vicini, LOD2 ai lontani e impone cache texture, throttling fuori frustum e cross-fade lontano dai frame di contatto. Include soglie di frame time, mixer, skeleton update, draw call e memoria da misurare su dispositivo. | PASS di progettazione tecnica; resta FAIL finché selezione, caching, throttling e benchmark mobile non sono implementati e misurati. |
| 21/09/2026, 06:00 | Eseguito smoke test runtime in sola lettura del GLB CGTrader LOD0 mediante il gancio POC esistente. | Il renderer richiede con HTTP 200 `cgtrader-player-runtime-base.glb`, raggiunge `GLB_READY`, monta 23 avatar/23 mixer/23 skeleton update senza errori browser. Evidenza screenshot e JSON salvati. Il benchmark rileva 1.150.153 triangoli, 654 call e FPS live 1: non è un PASS prestazionale né dimostra qualità di deformazione o contatto. | PASS compatibilità minima di caricamento; FAIL performance. Il prossimo gate dinamico resta il Dribble Mixamo locale, seguito da selezione LOD e benchmark con 22 giocatori. |
| 21/09/2026, 06:22 | Eseguiti smoke test runtime equivalenti dei GLB LOD1 e LOD2, senza cambiare logica partita. | Entrambi caricano via HTTP 200 e raggiungono `GLB_READY` senza errori browser. Triangoli renderer: LOD0 1.150.153, LOD1 992.535 (-13,7%), LOD2 935.500 (-18,7%); draw call restano 654/680/651 e FPS live 1/3/1, quindi il risultato è inconclusivo per frame time e non è mobile. | PASS caricamento LOD; FAIL performance: l’asset riduce triangoli ma non draw call né aggiornamenti di skeleton. Servono selezione per distanza, batching materiali, throttling e misura fisica su dispositivo. |
| 21/09/2026, 06:40 | Misurata la compatibilità nominale delle clip runtime esistenti con il rig CGTrader. | Per idle, jog, pass, kick, dribble e header: 0/65 target animation node corrispondono ai 68 joint CGTrader. Un mixer può risultare attivo, ma non anima una joint omonima del modello acquistato. | FAIL P0 netto: non collegare le clip regolari al CGTrader. Il prossimo file valido deve provenire da Mixamo sul rig CGTrader o da retarget Blender calibrato e superare i gate dinamici. |
| 21/09/2026, 06:58 | Tentata l’acquisizione della clip Dribble in Mixamo tramite Chrome desktop. | Il browser è bloccato da una UI di estensione già aperta e non consente di aprire Mixamo; non è stato caricato né trasmesso alcun file, né scaricata una clip. | Azione richiesta: chiudere o completare la UI dell’estensione in Chrome. Appena sbloccato, si apre Mixamo, si scarica Dribble FBX sul rig CGTrader e parte il gate dinamico. |
| 21/09/2026, 07:14 | Checkpoint dopo il blocco Chrome: nessuna clip o asset è stato alterato per aggirarlo. | Il workspace continua a non contenere FBX Mixamo; il gate motion e tutti i quality gate dinamici restano fermi per evitare un retarget non verificato. | Attesa della sola azione Chrome già indicata; dopo lo sblocco l’import Dribble è il primo lavoro, prima di qualunque integrazione o pubblicazione. |
| 21/09/2026, 07:31 | Checkpoint periodico: stato motion invariato. | Non sono comparsi nuovi FBX, risposte del venditore o build pubblicabili; i GLB LOD e gli audit già verificati restano invariati. | Nessun gate può avanzare correttamente finché Mixamo non consegna una clip locale sul rig CGTrader. |
| 21/09/2026, 07:47 | Checkpoint periodico: nessun nuovo prerequisito disponibile. | Confermato che non è corretto sostituire l’FBX Mixamo con le clip regolari, già misurate incompatibili 0/65 con il rig CGTrader. | Attesa della clip sul rig CGTrader; il prossimo risultato verificabile sarà l’import Blender con controlli di deformazione e contatto. |
| 21/09/2026, 08:03 | Checkpoint periodico: blocco esterno invariato. | Nessun file motion locale né sblocco Chrome rilevabile; non è stata prodotta una build né alterato il modello. | In attesa dell’azione Chrome già richiesta; tutti i gate finali restano aperti. |
| 21/09/2026, 08:17 | Ricevuta risposta dal venditore CGTrader alla richiesta sulla libreria hair. | Non esiste un pack pronto per questo Soccer Player. Il venditore dichiara di poter creare capelli corti/ricci/lunghi/rasati, colori, barbe e sopracciglia, ottimizzati per mobile con LOD e texture; stima iniziale $100–150 per un pack piccolo, preventivo su misura per il resto. È una dichiarazione del venditore, non un asset verificato. | Decisione utente necessaria prima di richiedere preventivo dettagliato o commissionare il pack; nel frattempo nessuna hair esterna viene integrata. |
| 21/09/2026, 08:20 | Risposto al venditore su autorizzazione dell’utente. | Messaggio inviato e visibile nella conversazione: ringraziamento, comunicazione che $100–150 supera il budget per questo modello e conferma che non verrà commissionato un pack personalizzato. | Il percorso custom hair è chiuso per budget; restano aperti asset motion, varianti hair con fonti alternative e quality gate. |
| 21/09/2026, 06:42 | Ricercate alternative open source per le varianti capelli, senza scaricare o integrare asset non verificati. | Individuati tre asset Blender CC0 individuali (capelli lunghi, short dreads e dread ponytail), ma nessun catalogo unico con molte pettinature maschili, qualita professionale e compatibilita gia verificata con il rig CGTrader. Servono fitting, pesi alla testa e controllo visivo in Blender. | PASS di ricerca: esiste una base gratuita per un prototipo a tre stili; FAIL rispetto al requisito di ampia varieta definitiva. Il prossimo criterio e selezionare e validare un primo asset CC0 sul rig, senza riutilizzare Quaternius. |
| 21/09/2026, 09:07 | Scaricati, importati e testati in Blender tre candidati capelli CC0 su una copia di review del modello CGTrader. | Long Flat Hair: 253 triangoli ma fit visivo RIFIUTATO, copre occhi e volto con massa piatta. Short Dreads: 46.139 triangoli senza rig, oltre il corpo Hero. Toon Dread Ponytail: 26.444 triangoli per variante, nessun rig e stile incompatibile. Il fitting Long Flat Hair e stato parentato nel .blend al bone `head.x` per validare il workflow, senza modificare il sorgente acquistato. | PASS del test e RIFIUTO dei tre candidati come produzione. Nessuna libreria open source provata soddisfa insieme qualita, varieta e budget mobile. Consultare `OPEN_SOURCE_HAIR_EVALUATION.md`; il prossimo candidato deve superare screening estetico e budget prima del fitting. |
| 21/09/2026, 09:14 | Completata ricerca estesa di librerie aperte per capelli, con verifica di licenze e dati dichiarati dai fornitori. | Candidata principale: tre raccolte gratuite Vincent Freelance, 21 varianti ciascuna e licenza CC-BY; il costo dichiarato totale e 623,5k–915,4k triangoli per raccolta, quindi non idonee al mobile senza selezione e LOD per singolo taglio. Alternative: MakeHuman Hair 01 (25 asset, CC0 dichiarato) e system assets (10 hair, CC0), ma con fitting MakeHuman richiesto e stile da verificare. Nessuna e plug-and-play con CGTrader. | PASS della ricerca: esiste una fonte con ampia varieta da sottoporre al vero asset gate. Il prossimo test e scaricare una sola raccolta Vincent, isolare tre tagli e misurarli in Blender prima di qualunque integrazione. Vedi `OPEN_SOURCE_HAIR_RESEARCH.md`. |
| 21/09/2026, 09:24 | Eseguito asset gate completo sul pack CC0 MakeHuman Hair 01: scaricati e analizzati 25 OBJ, quindi fit Blender di tre candidati sul modello CGTrader. | Misura diretta: 212.008 triangoli complessivi, mediana 4.432, intervallo 576–91.392. `cortu_short_messy_hair` (1.092), `culturalibre_hair_02` (3.460) e `o4saken_long01` (13.268) sono stati parentati a `head.x` ma tutti RIFIUTATI visivamente per ciocche/frange davanti agli occhi, silhouette non professionale o costo. La contact sheet mostra che il pack e in gran parte femminile, fantasy o stilizzato. | PASS del gate tecnico di import/fitting; FAIL qualitativo per libreria definitiva. Il candidato Vincent resta prioritario ma il download e bloccato da una UI di estensione aperta in Chrome. Consultare `OPEN_SOURCE_HAIR_RESEARCH.md`. |
| 21/09/2026, 07:47 | Riaperto Chrome e avviato il download della raccolta Vincent con 21 acconciature, licenza CC-BY. | Il sito presenta il modulo di accesso Sketchfab prima della consegna del file. Nessun asset e stato ancora scaricato, quindi non esiste alcuna verifica Blender su geometria, texture, peso o fit. | Azione utente necessaria: autenticarsi in Sketchfab nel tab lasciato aperto. Subito dopo scarico la raccolta, isolo tre tagli e applico il gate tecnico/visivo. |
| 21/09/2026, 07:52 | Ricevuto blocco Zscaler sul login Sketchfab richiesto per il download Vincent. | Il blocco e di rete/policy aziendale; non viene aggirato e non sono state inserite credenziali. La raccolta Vincent non puo essere testata finche il dominio di login non viene autorizzato. | Proseguire con fonti open source senza account; se si vorra riaprire questo candidato sara necessario autorizzare il dominio di login Sketchfab tramite IT/Zscaler. |
| 21/09/2026, 08:19 | Verificata la cartella Drive Hair: presenti GLB 29,6 MB, ZIP 29,6 MB, ZIP 17,2 MB e USDZ 15,5 MB della raccolta Vincent. Tentato il download normale dello ZIP, inclusa conferma utente della finestra antivirus Drive. | La consegna viene reindirizzata a `drive.usercontent.google.com` ma Chrome termina in pagina di errore e non salva alcun file locale. Non e stato aggirato il blocco. Il contenuto effettivo della raccolta resta quindi non misurabile in Blender. | Per il test serve rendere disponibile localmente il GLB/ZIP tramite download autorizzato che Chrome riesca a completare o una sincronizzazione Drive locale; appena disponibile, import e review dei singoli 21 tagli. |
| 21/09/2026, 10:32 | Ricevuto ed estratto l archivio Sketchfab Vincent; importati in Blender FBX originale, GLB e glTF. Generata tavola visiva delle mesh capelli. | RIFIUTATO: l FBX originale `21Fles.fbx` contiene 16 mesh capelli nominate, non 21; 915.434 triangoli totali, nessuna armatura e texture separate denominate `Female_hair_01`. La review visiva mostra tagli femminili con frange/chignon/code incompatibili con il calciatore adulto professionale. Non e stato effettuato fitting o integrazione runtime. | Il gate hair resta FAIL: cercare una libreria realmente maschile, con licenza verificabile, tagli separati, silhouette pulite e budget mobile; nessun asset di questo pack puo essere promosso. Vedi `VINCENT_HAIR_ASSET_GATE.md`. |
| 21/09/2026, 10:48 | Completato il gate estetico del pack Vincent: tutte le 16 mesh capelli effettive sono state scalate e rese sulla testa CGTrader, in review statica senza modificare il sorgente o il runtime. | RIFIUTATO come libreria pronta: tutte le varianti falliscono almeno volto/occhi liberi, silhouette maschile professionale o fit senza compenetrazioni. Non esistono pesi/armatura; i tagli vanno da 3.947 a 31.566 triangoli. La dichiarazione Sketchfab “man hairstyles” resta una dichiarazione del venditore, ma il contenuto verificato non soddisfa il requisito Korward. | Gate hair definitivo FAIL per questo pack. Conservare al massimo come riferimento artistico, non come dipendenza. Il prossimo candidato deve essere testato con la stessa tavola CGTrader prima dell integrazione. Vedi `VINCENT_HAIR_ASSET_GATE.md`. |
| 21/09/2026, 11:32 | Ricerca approfondita e gate diretto di quattro fonti MakeHuman: System Assets, Hair 03, Hair 02 e catalogo pubblico individuale. | Scaricati e resi sul volto CGTrader 58 mesh reali: 10 System Assets CC0, 14 Hair 03 CC-BY, 21 Hair 02 CC-BY e 13 asset individuali maschili CC0/CC-BY. Nessun pacchetto intero passa come libreria pronta. Il sottoinsieme WojackOWL 2025 e il primo candidato parziale: `Dreads with Taper Fade` conserva volto e occhi nella review, ma deve essere conformato e pesato nel Blender sorgente; taper/cornrows/short non passano il fit diretto. | PASS ricerca e test reale; FAIL requisito varieta e integrazione. Il prossimo criterio e verificare gli altri asset WojackOWL disponibili, poi conformare e pesare un solo candidato nel `.blend`, con render multivista e misura mobile. Vedi `MAKEHUMAN_HAIR_LIBRARY_GATE.md`. |
| 21/09/2026, 11:48 | Completata la verifica multivista delle ultime due varianti WojackOWL, senza modificare il modello CGTrader. | Testate Afro Hair - Ponytail (7.100 facce) e Afro Ponytail - Slick Down (4.869 facce), oltre a Dreads with Taper Fade (14.872 facce). Le viste fronte/tre-quarti/profilo/posteriore confermano occhi liberi frontalmente, ma calotta/ponytail sono ancora sagomati per MakeHuman e non esistono pesi CGTrader. | Candidati condizionali, non integrati: richiedono conformazione e pesi nel Blender sorgente. FAIL varietà definitiva: l'intera fonte WojackOWL ha otto stili, non una libreria ampia. Vedi `MAKEHUMAN_HAIR_LIBRARY_GATE.md`. |
## Collaudo ufficiale

La build potrà essere dichiarata pronta solo dopo il superamento dei quality gate e sarà pubblicata qui:

<https://antoniovairo-rgb.github.io/Carrier-manager-/CARRIER-MANAGER-AV.html?hyperCharacter=full>

Ad ogni avanzamento significativo questo file viene aggiornato con fase, percentuale complessiva, risultato verificato, verifica effettuata e criterio di chiusura successivo.












| 21/09/2026, 11:52 | Eseguito un vero passaggio di authoring Blender per una libreria capelli compatta: short nativo CGTrader, Dreads Taper e Slick Ponytail. | Le due mesh esterne sono state conformatate, ripulite dalle frange davanti al volto, pesate integralmente a `head.x`, salvate nel `.blend` derivato ed esportate solo come GLB di review. Il controllo da fronte/tre-quarti/profilo/retro RIFIUTA entrambe: i dreads conservano una sporgenza frontale innaturale e la ponytail conserva una calotta tagliata/non anatomica. Dopo ottimizzazione misurano 11.534 e 7.124 triangoli, ma il costo non compensa il difetto visivo. | PASS del workflow model-side; FAIL qualità estetica/varietà. I GLB non sono integrati nel runtime. Prossimo criterio: cercare una fonte con calotta maschile già compatibile e promuovere solo un set visivamente approvato. Vedi `MAKEHUMAN_HAIR_LIBRARY_GATE.md`. |
| 21/09/2026, 11:53 | Effettuato secondo screening mirato nel catalogo MakeHuman, su cinque stili dichiarati maschili o adatti (Maxwell, Grump, 80s male, Cornrows Male, Short Hair B). | Tutti e cinque sono stati scaricati dai riferimenti ufficiali, importati e resi direttamente sul volto CGTrader. Tutti falliscono il primo gate: coprono occhi/volto o mantengono una calotta MakeHuman fuori scala. | FAIL: nessuna nuova promozione. La ricerca continua su sorgenti con topologia/scalp già pensate per personaggi real-time adulti. |

| 21/09/2026, 12:02 | Testata una libreria proprietaria costruita nel Blender derivato, senza asset esterni: crop testurizzato, side-swept e short curl, ciascuno con quattro materiali colore e pesi `head.x`. | Il controllo multivista RIFIUTA le tre prime mesh: la calotta e le ciocche generate proceduralmente non hanno un profilo professionale e non sono paragonabili a capelli artist-authored. Il test dimostra il percorso tecnico (3 geometrie, 4 colori, 4.672–6.848 triangoli), ma non rispetta il gate estetico. | FAIL qualità: nessun GLB o blend di questa prova entra nel runtime. Si prosegue solo con una sorgente artistica che superi la review. |

| 21/09/2026, 12:12 | Validata la prima personalizzazione utile del modello acquistato: quattro varianti colore del taglio nativo (nero, castano, biondo, ramato), create come texture/materiali nel Blender derivato. | Render di review: il recolor selettivo mantiene pelle, occhi e collo e fa seguire barba/sopracciglia al colore dei capelli. Il `.blend` derivato registra quattro materiali e un manifest; non vengono applicati tint o geometrie a runtime. | PASS colore del taglio nativo. Restano da authoring nel modello le varianti di forma barba/baffi e le nuove acconciature. |
| 21/09/2026, 12:22 | Ricerca parallela di librerie senza usare Quaternius, anime o pack femminili. Scaricati due candidati CC0 maschili OpenGameArt (`Side parting` e `Upcomb`) e messi in coda per il medesimo fitting multivista sul volto CGTrader. | Licenza e sorgenti `.blend` verificabili; entrambi sono però asset molto low-poly, progettati per un'altra testa. Il fit non è ancora promosso: l'eseguibile Blender non è al momento disponibile nel workspace per renderizzare il nuovo gate. Individuate anche librerie commerciali di tagli maschili come sole candidate da verificare sui file, senza acquisti o integrazioni. | PASS ricerca e acquisizione sicura; il primo candidato passa solo con render fronte/profilo, pesi `head.x`, volto libero e budget mobile. |
| 21/09/2026, 12:28 | Individuato un candidato commerciale compatto per capelli e peli del volto: `Stylized Male Hair Basemesh Pack` su Fab. | La scheda dichiara sei mesh capelli maschili separate, una barba, un baffo, Blender/FBX/OBJ, UV e 956–2.852 facce per taglio (422 baffo, 762 barba). È più vicino al budget mobile rispetto ai pack hair-card ad alta densità, ma è esplicitamente un basemesh stilizzato da adattare e il prezzo/licenza selezionata, il fit e la qualità visiva restano non verificati. Nessun acquisto né uso in gioco. | Candidato condizionale: valutare solo dopo preview e file reali; deve superare la review su testa CGTrader senza effetto casco, sporgenze o stile caricaturale. |
| 21/09/2026, 12:38 | Eseguito il test preventivo reale dei due candidati CC0 OpenGameArt `Side parting` e `Upcomb` sulla testa CGTrader, con render fronte e profilo. | Entrambi RIFIUTATI: sorgenti da 114/132 vertici e 131/148 facce, costruite per un'altra testa low-poly; al fit corretto diventano una calotta rigida che copre la fronte/occhi e produce profilo a casco. Nessun peso, GLB runtime o modifica al sorgente acquistato. | FAIL candidato gratuito; mantenere solo il colore del taglio nativo già validato e cercare fonti con calotta adulta compatibile. Report: `OPENGAMEART_MICKET_HAIR_GATE.md`. |
| 21/09/2026, 13:07 | Checkpoint dopo il gate OpenGameArt: nessuna nuova hair, clip o build è stata promossa oltre gli esiti documentati. | Fatto verificato: restano valide solo le quattro varianti colore del taglio nativo; i due candidati CC0 sono esclusi. Stato non verificato: una futura libreria commerciale potrebbe offrire forme migliori, ma non è stata acquistata né esaminata sui file. Il blocco motion rimane: nessun FBX Mixamo locale sul rig CGTrader è disponibile per il gate corpo-palla. | Ricerca di una fonte con calotta adulta e continua; chiusura Fase 1A richiede almeno una clip motion importabile e una variante capelli che superi render, pesi e budget mobile. |
| 21/09/2026, 13:31 | Checkpoint di esecuzione: nessuna modifica è stata introdotta per forzare la chiusura dei gate aperti. | Fatto verificato: non esiste ancora un FBX Mixamo locale, quindi dribbling, contatto piede-palla e transizioni non possono essere dichiarati testati. Il candidate commerciale Fab resta una sola scheda da valutare, non un asset. Nessuna build è pronta per il collaudo mobile ufficiale. | Prossimo risultato utile: clip Mixamo importabile sul rig CGTrader oppure un file capelli reale con licenza e geometria ispezionabile; entrambi richiedono render e benchmark prima della promozione. |
| 21/09/2026, 13:44 | Ripresa la sessione Mixamo attiva: selezionata la clip `Dribble — Forward Jog Dribbling Soccer Ball` sul personaggio `UNREAL+RIG` e richiesto il download FBX Binary. | Preview verificata: 53 frame; configurazione di acquisizione: `Without Skin`, 30 fps, Keyframe Reduction `none`. Il browser in-app ha confermato l'avvio del download, ma la ricerca immediata in Downloads, Temp e workspace non trova un FBX consegnato localmente. Non è quindi ancora possibile importare o misurare deformazioni, contatti e transizioni. | PASS configurazione e richiesta download; FAIL consegna locale. Il prossimo criterio è ottenere lo stesso FBX in una cartella accessibile a Blender, poi eseguire il gate dinamico Dribble. |
| 21/09/2026, 13:49 | Aperta e inventariata la cartella Drive condivisa delle clip già scaricate. | Sono presenti molte clip Mixamo precedenti: locomozione, ricezione, tiri, tackle, cadute e portiere, oltre a `Soccer Game Pack (1).zip`. È presente anche `Ch38_nonPBR.fbx`, che resta esplicitamente escluso. Non è presente un file denominato `Dribble`/`Forward Jog Dribbling Soccer Ball` tra i file della cartella. Le clip disponibili sono precedenti e non sono state ancora promosse sul rig CGTrader. | PASS inventario. Per il gate Dribble serve caricare in questa cartella oppure allegare il FBX appena esportato da Mixamo sul personaggio `UNREAL+RIG`; non usare CH38 e non sostituire il test con clip incompatibili. |
| 21/09/2026, 13:55 | Rivalutata la clip Mixamo `Dribble — Forward Jog Dribbling Soccer Ball` richiesta per la prova Hero. | Il nome e la descrizione confermano una conduzione in jogging lineare; dalla preview non emerge una finta, cambio direzione o cambio di ritmo. Non supera quindi il gate "dribbling" richiesto dal progetto e non verrà usata per rappresentarlo. | RIFIUTATA come dribbling. Il prossimo test deve usare una clip con variazione laterale/rotazione e controllo palla verificabile, oppure una sequenza composta di conduzione + cambio direzione, con contatto e transizioni da validare. |
| 21/09/2026, 12:11 | Checkpoint dopo la rivalutazione della clip di conduzione. | Fatto verificato: `Forward Jog Dribbling Soccer Ball` resta rifiutata come dribbling perché è una corsa/conduzione lineare. Non è stato importato alcun FBX né modificato il runtime; qualità corpo-palla, transizioni e performance restano non validate. | Fase 1A al 35% stimato. Il prossimo gate è una clip con azione laterale o rotazione e contatto palla leggibile, acquisita sul rig CGTrader e ispezionata prima dell'integrazione. |
| 21/09/2026, 12:32 | Esaminate le alternative immediate nella ricerca Mixamo `Dribble`. | `Soccer Spin — Soccer 360 Spin` e una clip di 39 frame con rotazione completa; può diventare una variante di pivot/protezione, ma non sostituisce il dribbling base. La ricerca conferma che Mixamo non offre una singola clip che copra conduzione, finta/cambio direzione e uscita in accelerazione con qualita sufficiente. | PASS analisi sorgente; strategia Fase 1A: comporre e validare conduzione breve + svolta + accelerazione con ball sync, senza far passare una corsa lineare per dribbling. |
| 21/09/2026, 12:48 | Ricerca comparativa estesa di modelli adulti riggati esportabili per sostituire o confermare la base acquistata. | Il modello Hisenberg acquistato resta il candidato piu equilibrato verificabile: 17.891 poligoni, rig, T-pose, FBX/GLB/BLEND/OBJ e PBR. Le alternative analizzate risultano troppo pesanti (33.093–49.100 triangoli), prive di dati tecnici critici o non provate sui file. | PASS ricerca modello: non acquistare un sostituto senza un vantaggio provato. Priorita: rendere credibile e mobile il modello base con LOD, review volto e asset derivati. Vedi `MODEL_MARKET_AUDIT_2026-09-21.md`. |
| 21/09/2026, 13:05 | Ispezionate le review render effettive del modello attivo e dei suoi LOD, non solo le schede marketplace. | LOD0 mostra un calciatore adulto con volto, anatomia e kit credibili: PASS condizionato per Hero (il crop volto e sovraesposto). Le review LOD1/LOD2 mostrano artefatti a schegge su volto, spalle e maglia: FAIL P1, non pubblicabili. | Modello scelto: CGTrader LOD0. Prossimo criterio: correggere la generazione LOD senza degradare silhouette o materiali, poi rifare benchmark mobile. Vedi `MODEL_VISUAL_REVIEW.md`. |
| 21/09/2026, 13:21 | Eseguita una rigenerazione non distruttiva LOD1 con normali smooth preservate dopo il collapse decimate. | Il candidato review conserva esattamente 12.243 triangoli e 4.236.088 byte del LOD1 corrente, ma elimina visivamente le faccette nella silhouette. Struttura GLB verificata: 7 mesh, 6 materiali e texture equivalenti al LOD1. Il renderer Workbench non visualizza le texture, quindi non costituisce prova dell'aspetto finale. Il test runtime automatico non parte perche il browser Playwright manca e il download dalla CDN e andato in timeout. | PASS diagnostica: gli artefatti derivano dalle normali post-decimazione, non dal modello LOD0. Il candidato resta review-only; il prossimo gate e smoke runtime appena il browser test e disponibile, prima di sostituire LOD1. |
| 21/09/2026, 13:31 | Verificati gli hash SHA-256 delle tre esportazioni LOD1 review. | `lod1`, `lod1-smooth-review` e `lod1-uv-review` sono byte-identici. Le differenze apparenti di render/FPS non costituiscono una correzione attribuibile; la promozione review e annullata. | Correzione di evidenza registrata. Il prossimo test deve cambiare realmente ratio/topologia e confrontare hash, render e runtime nello stesso scenario. |
| 21/09/2026, 13:45 | Eseguito A/B controllato con un LOD1 realmente diverso: ratio 0,60, hash differente, 20.993 triangoli e 4.548.200 byte. | Lo smoke runtime passa (HTTP 200, GLB_READY, nessun errore) ma registra 1.053.785 triangoli, 680 draw call, 23 skeleton update e 2 FPS nel banco software; non migliora il gate mobile rispetto al LOD1 corrente. La preview di campo non mostra rotture evidenti a distanza di regia, ma non compensa il costo. | FAIL promozione LOD1-r60 per performance. Evidenza: `evidence/cgtrader-runtime-smoke-lod1r60.{json,png}`. Il modello LOD0 resta confermato; ottimizzazione deve ridurre update/mixer e draw call, non solo cambiare triangoli. |
| 21/09/2026, 12:32 | Checkpoint Fase 1A: consolidati gli esiti delle clip e del benchmark LOD senza promuovere asset che non superano i gate. | Fatto verificato: la clip Mixamo lineare è rifiutata come dribbling e il LOD1-r60 non riduce il costo runtime; nessuna build valida è stata pubblicata. Rimane confermato solo il modello CGTrader LOD0 per Hero e le quattro varianti colore del taglio nativo. | Fase 1A al 35% stimato. Prossimo criterio: una sequenza di dribbling composta con contatto palla leggibile, più un test di scheduling mixer/scheletro che riduca misurabilmente gli update fuori camera, prima di un nuovo collaudo mobile. |
| 21/09/2026, 15:39 | Verificato il punto di integrazione del link ufficiale `?hyperCharacter=full`. | Il runtime carica ancora `hyper-casual-korward-football-authored*.glb`: 9.600 triangoli, 60 joint e 31 clip. Il GLB CGTrader approvato non e` referenziato dall'HTML. Le preview "cartoon/occhi/capelli" provengono quindi da questo package, non dal nuovo modello acquistato. | P0 di integrazione: costruire un package CGTrader con rig/clip compatibili e sostituire solo l'URL del package visivo dopo smoke runtime. Nessuna modifica a match engine o telecronaca. |
| 21/09/2026, 15:45 | Confrontati direttamente il rig `UNREAL+RIG.fbx` del modello acquistato e il rig del package Hyper oggi usato dal link ufficiale. | La proporzione coincide (modello UE 1,760 m; Hyper 175,47 cm), con gerarchia anatomica compatibile: `pelvis/spine_01..03/neck/head`, braccia, gambe e piedi. Il rig UE ha 76 ossa, quello Hyper 60: e` possibile costruire un candidato di retarget delle 31 clip esistenti senza modificare match engine o telecronaca, ma le rotazioni e i contatti devono ancora essere verificati con un export di review. | PASS compatibilita preliminare del rig. Prossimo gate: retarget review di idle, corsa, passaggio, tiro e pivot sul rig UE, render dinamico e ispezione piede-palla/transizioni prima di toccare l URL ufficiale. |
| 21/09/2026, 16:00 | Creato e reimportato un package di review del modello acquistato con cinque clip retargettate dal package Hyper (`idle`, `jog`, `pass`, `kick`, `change-direction`). | Il primo metodo in spazio mondo e` stato RIFIUTATO: braccia e catene laterali risultavano errate. Il secondo metodo con correzione degli assi di riposo del rig UE produce jogging, passaggio e cambio direzione con deformazioni integre e braccia collegate al busto. Il render del `kick` mostra invece braccia troppo passive e nessuna palla: non puo` superare il gate gesto/sincronismo. L asset e` review-only e non referenziato dal runtime. | PASS tecnico retarget preliminare; FAIL quality gate del tiro e ball sync. Prossimo: retarget di tutte le clip, authoring delle pose di tiro/passaggio con controbilanciamento braccia e test con palla di riferimento prima di qualsiasi modifica all URL ufficiale. |
| 21/09/2026, 16:07 | Esportato e reimportato il package completo di review sul modello CGTrader: 31 clip con i nomi gia richiesti dal loader Hyper, rig UE da 76 ossa e 60 ossa mappate. | Il file `assets/cgtrader-unreal-axis-corrected-retarget-full-review.glb` misura 17.171.680 byte e l inventario conferma tutte le clip (locomozione, ricezione, passaggio, tiro, dribble, tackle, panchina e portiere). Questo prova la compatibilita tecnica del modello acquistato come sostituto del package Hyper; non prova ancora qualita di ciascun gesto. | PASS package review completo. Il prossimo gate e una tavola dinamica per le clip P0 (kick/pass/header/dribble/change-direction) con palla e verifica di braccia, appoggio e contatto; il runtime ufficiale resta invariato fino al superamento. |
| 21/09/2026, 16:12 | Misurate le traiettorie di piedi/punte nelle clip P0 e resa una review del tiro con palla-target statica. | Nel `kick` il piede destro conserva l appoggio mentre il sinistro attraversa una traiettoria utilizzabile; ai frame 9–10 il toe sinistro raggiunge geometricamente una palla da 22 cm. Il controllo e` solo di fattibilita: la palla non ha ancora velocita al contatto e le braccia restano troppo passive. | PASS fattibilita geometrica del contatto; FAIL sincronia palla e biomeccanica braccia. Prossimo: marker di impatto + uscita palla e overlay di controbilanciamento per tiro e passaggio, poi review dinamica. |
| 21/09/2026, 16:23 | Creato il package completo di review con overlay di controbilanciamento sul tiro sinistro, senza modificare il package in produzione. | Il nuovo GLB mantiene 31 clip e 76 ossa. La review con palla-target mostra ora entrambe le braccia aperte in funzione dell appoggio e del calcio, senza deformare gomiti/polsi. La palla e` ancora una guida statica: nessun impatto/uscita e` collegato al match runtime. | PASS condizionato coordinazione braccia del tiro; FAIL sincronismo palla. Prossimo: definire il marker d impatto e la traiettoria visiva della palla nel layer character, poi validare passaggio e colpo di testa. |
| 21/09/2026, 16:31 | Testato il package CGTrader nel renderer della partita tramite intercettazione locale degli asset Hyper, senza modificare HTML o URL ufficiale. | Il match raggiunge stato `ready`, riceve quattro HTTP 200 per il package sostitutivo, espone tutte le 31 clip e non genera errori browser. Un highlight reale mostra il Hero nella scena mobile 412x915. Questa e` prova di compatibilita loader/render, non un benchmark di telefono e non una pubblicazione. | PASS compatibilita renderer locale. Prossimo: definire asset/materiali kit e adapter ossa UE per la prova ufficiale Hero; chiusura richiede prima ball sync e transizioni P0. |
| 21/09/2026, 16:51 | Creato il derivato CGTrader con contratti materiali fisici `HyperShirt` e `HyperShorts` e testato in un highlight del renderer reale. | Il renderer colora soltanto maglia e pantaloncini, preservando texture di testa, capelli e pelle. Smoke locale PASS: stato ready, 31 clip, richieste asset HTTP 200, nessun errore browser. L highlight mobile conferma la visibilita del Hero nel campo. | PASS kit-colour compatibility. Restano da authoring texture/pattern/crest per una divisa Ajax e da completare ball sync/transizioni; nessuna modifica a URL ufficiale. |
| 21/09/2026, 16:55 | Esteso il lookup del layer visuale per riconoscere il rig UE CGTrader (`hand_l/r`, `upperarm_l/r`, `lowerarm_l/r`) oltre alle ossa Hyper. | Il verificatore statico `verify_cgtrader_hyper_bone_adapter.mjs` passa contro il GLB kit-review: tutte le sei ossa sono presenti e riconosciute dai pattern HTML. Un nuovo smoke browser e` andato in timeout nel runner prima di status, mentre lo smoke/rendere precedente del medesimo package era PASS; non attribuisco il timeout al codice. | PASS verifica contrattuale ossa; smoke browser post-modifica da ripetere in ambiente libero. Prossimo: adapter materiali/ossa completo nel test renderer e poi passaggio+header con palla. |
| 21/09/2026, 12:32 | Testata come alternativa la pipeline offline `retarget-cgtrader-unreal-inverse.cjs` contro il rig UE del modello acquistato, per recuperare un passaggio credibile dalle clip locali. | Il test si arresta sul primo clip (`idle`): `KORWARD_PRIMARY_ALIGNMENT_DEGREES 178,836`, oltre il limite di 0,005°, con assertion `Animated anatomical segment alignment failed`. La pipeline non produce un asset promuovibile e non viene usata per mascherare il passaggio alto/lofty gia rifiutato. | FAIL retarget alternativo: il problema e` di convenzione assi/scheletri della sorgente Mixamo, non di una modifica al match engine. Fase 1A al 36% stimato. Prossimo criterio: comporre una sequenza breve conduzione + pivot/uscita sul package compatibile esistente, con marker d'impatto e traiettoria palla, poi render dinamico di piede, busto e braccia. |
| 21/09/2026, 17:07 | Rifatto il ritratto di review del Hero direttamente dal `CHARACTER.glb` acquistato, con camera ravvicinata e rendering texture-faithful. | Il nuovo render `cgtrader-hero-profile-neutral-review.png` elimina la sovraesposizione che falsava occhi e incarnato: volto adulto leggibile, taglio corto nativo professionale, nessuna geometria capelli esterna o caricaturale. Il render non modifica runtime, match engine o package pubblico. | PASS condizionato estetica Hero. Il modello CGTrader resta la base scelta; la chiusura richiede ancora package pubblico, ball sync, transizioni e benchmark mobile. |
| 21/09/2026, 17:20 | Creato e testato un candidato review-only di passaggio rasoterra sul package CGTrader, senza toccare Match Engine, telecronaca o URL ufficiale. | Il nuovo package conserva le 31 clip attese e usa un `pass` a minore ampiezza con braccia controbilanciate; al frame 6 la punta sinistra e` a 0,10445 m dal centro della palla guida (raggio 0,11 m). Smoke renderer locale PASS: `ready`, 31 clip, HTTP 200, nessun errore. | PASS condizionato gesto+compatibilita loader; FAIL sincronismo palla perche la guida e` statica e non ha traiettoria/evento runtime. Prossimo: marker di impatto e uscita palla nel layer visuale, poi validazione transizione passaggio-ripresa. |
| 21/09/2026, 17:21 | Ispezionate le capacita` facciali del source `BLENDER+RIG.blend` per non falsare la valutazione del Hero. | Le sette mesh skinned hanno zero shape key e il rig non contiene ossa facciali dedicate; il volto statico adulto e` utilizzabile, ma le espressioni facciali richiedono authoring futuro. | PASS evidenza; nessuna deformazione casuale del volto verra` introdotta. |
| 21/09/2026, 17:33 | Ripulito e verificato il package passaggio rasoterra: 31 clip esatte, `pass` sotto il nome runtime, senza la clip alta rifiutata. | La verifica fase legge clip e tabella visuale: contatto 0,250 s contro wind-up palla gia` esistente 0,270 s, errore 0,020 s; contatto geometrico entro il raggio della palla guida. Smoke renderer del package ripassa: `ready`, 31 clip, HTTP 200, errori zero. | PASS condizionato fase gesto-palla; FAIL gate sincronismo completo finche` il package non entra nella build ufficiale e non e` ripreso su telefono. Prossimo: transizione passaggio-ripresa e benchmark dei mixer nel renderer CGTrader. |
| 21/09/2026, 12:32 | Misurata e resa la transizione review `pass` -> `jog` del package CGTrader rasoterra, senza modificare il runtime ufficiale. | Nel raccordo frame finale passaggio / frame iniziale jogging la radice non trasla (0 m); il massimo delta locale e` 41,96 gradi sul polpaccio sinistro e la vista intermedia al 50% mantiene arti e busto in una posa leggibile, senza dislocazioni visibili. E` una verifica offline di blend, non una ripresa nel match o su telefono. | PASS condizionato continuita` anatomica del blend. Restano FAIL il gate transizioni finale e il benchmark mobile finche` non sono verificati nel renderer pubblico con sequenza reale e metriche. Prossimo: test mixer/scheletro e sequenza runtime gesto-palla. |
| 21/09/2026, 17:50 | Introdotto e misurato l'animation scheduling nel solo renderer: Hero e gesti tecnici restano full-rate; avatar lontani/fuori quadro aggiornano il mixer a cadenza ridotta. | A/B workbench 412x915: da 23,0 a 7,8 mixer update/frame, riduzione normalizzata 66,1%; nessun errore browser. Draw call 693 e triangoli 1.103.918 restano invariati, come previsto. Il flag `__CPM_ANIM_LOD=false` ripristina il percorso completo per confronto. | PASS tecnico parziale sul costo mixer/scheletri. FAIL performance mobile finale: servono frame time/FPS sul telefono e continuita` visiva in sequenza runtime. Evidenza: `evidence/animation-scheduler-ab.json`. |
| 21/09/2026, 18:10 | Attivata una review Hero CGTrader esplicita tramite `?hyperCharacter=cgtrader-review`, senza cambiare il percorso pubblico `?hyperCharacter=full`. Durante lo smoke reale e` emerso e corretto un P0 di scala: la Box3 della SkinnedMesh leggeva 0,100 m e produceva un gigante. | La normalizzazione ora misura 75 ossa: altezza scheletro 1,561 m, scala applicata 1,1917 per Hero 1,86 m. Smoke e highlight renderer: asset CGTrader HTTP 200, 31 clip, 681–732 draw call, errori browser zero. Il render mobile mostra una figura a scala campo coerente; la ripresa resta troppo distante per giudicare volto o gesto. | PASS integrazione Hero review e correzione scala. FAIL pubblicazione/quality gate completo: la modalita` e` opt-in locale, `full` continua a usare Hyper; servono close-up gesto+palla, benchmark telefono e push del branch dopo rinnovo GitHub. Commit locale `40d0f52`. |
| 21/09/2026, 18:14 | Audit visivo e metrico della clip `dribble` del package CGTrader, confrontata con `jog`, con palla-guida esplicitamente non runtime. | La clip dura 33 frame contro 17 del jogging; i quattro frame di review mostrano appoggi alternati, gamba che passa davanti alla palla e braccia controbilanciate. Le candidate di contatto includono sinistro f.9/f.26 e destro f.12–13. Non e` la corsa Mixamo lineare gia` rifiutata. | PASS condizionato biomeccanica dribbling. FAIL sincronismo/palla: il GLB non ha una traccia palla e la guida frame-local non dimostra possesso. Prossimo: collegare due marker di tocco alla traiettoria visuale runtime, senza Match Engine. Evidenza `cgtrader-dribble-review.json`. |
| 21/09/2026, 18:16 | Checkpoint dopo audit dribbling CGTrader: nessuna build pubblica promossa. | Verificato il gesto sul package di review: appoggi alternati e braccia coordinate; manca ancora un vincolo runtime tra i frame di tocco e la palla. Il link ufficiale hyperCharacter=full continua a caricare Hyper, mentre il review CGTrader e opt-in. | Fase 1A al 40% stimato: il prossimo criterio e una sequenza runtime dribbling con due marker di tocco e palla visuale, piu controllo di continuita in uscita; sincronismo e performance mobile restano FAIL. |
| 21/09/2026, 12:32 | Individuato durante la prova runtime del dribbling un P0 nel layer visuale CGTrader: le clip esportate direttamente come `AnimationClip` non venivano registrate dal resolver, quindi il renderer non poteva selezionare `dribble` anche se il package la conteneva. Applicata una correzione locale del resolver e aggiunta una sonda di mapping; la coreografia dribbling-pre-pass e` ancora in verifica. | La sonda runtime ora conferma che l'azione `dribble` e` montata nel package (insieme alle altre azioni tecniche); l'attivazione nella fase `hl_move` non e` ancora certificata e non viene considerata un pass. Nessun cambiamento al Match Engine, telecronaca, URL ufficiale o build pubblica. | Fase 1A al 42% stimato. Prossimo criterio: prova browser ripetibile che mostri `dribble` selezionato a velocita` nativa prima del passaggio e palla mantenuta nel possesso visivo; poi smoke completo e ripresa comparativa. |
| 21/09/2026, 12:38 | Chiusa la verifica runtime del dribbling CGTrader e creato il commit locale `6c37747 fix: play CGTrader dribble during approach`. Il layer visuale accetta ora sia GLTF sia `AnimationClip` diretto; nella review, l'intent `dribble` seleziona la clip CGTrader durante `hl_move` alla sua velocita` nativa, mentre la protezione anti-gesto-residuo resta attiva per gli altri highlight. | Probe browser PASS: package `dribble` montato, campioni `hlIntent=dribble`, `gName=dribble`, `__CPM_GST.cur=dribble`, velocita` 1 e palla trattenuta dall'Hero; smoke review PASS senza errori browser. Questa e` una prova renderer opt-in, non sincronismo finale dei due tocchi e non pubblicazione. | Fase 1A al 45% stimato. Prossimo criterio: marker di tocco e traiettoria visuale della palla nei frame di dribbling, poi continuita` dribbling→passaggio con ripresa e benchmark su telefono. Push GitHub in attesa del rinnovo credenziali. |
| 21/09/2026, 19:25 | Audit batch definitivo del source `BLENDER+RIG.blend` acquistato. | Verificati 34.995 triangoli totali, 7 mesh skinned, 68 ossa deformanti su rig da 344 ossa e texture 2K separate per volto, mani, maglia, pantaloncini e gambe. Zero action e zero shape key nel source: le animazioni devono restare esterne/retargettate e le espressioni facciali non possono essere promesse senza authoring dedicato. | PASS base Hero/LOD: anatomia, rig e materiali sono adeguati. FAIL per 22 avatar LOD0: servono LOD e cadenza mixer gia` pianificati. Fase 1A resta al 45%; prossimo gate: marker palla-dribbling validati nel renderer. |
| 21/09/2026, 19:33 | Validati i LOD derivati del modello CGTrader rispetto al runtime base. | `validate_cgtrader_lod.py` PASS: LOD0/LOD1/LOD2 mantengono lo stesso ordine di 68 joint e 7 primitive skinned con attributi POSITION/JOINTS_0/WEIGHTS_0. Budget: LOD0 34.995 triangoli / 14,57 MB; LOD1 12.243 / 4,24 MB; LOD2 4.193 / 1,30 MB. | PASS compatibilita` LOD e riduzione geometrica: Hero puo` restare LOD0, compagni vicini LOD1, lontani LOD2. Non e` ancora un benchmark telefono: FPS/frame time reali restano da misurare. |
| 21/09/2026, 19:38 | Calcolato il budget geometrico della formazione con il piano LOD validato. | 22 LOD0 costerebbero 769.890 triangoli. Configurazione proposta: Hero LOD0 (34.995), 6 giocatori vicini LOD1 (73.458), 15 giocatori lontani LOD2 (62.895): totale 171.348 triangoli, riduzione teorica 77,7%. | PASS piano quantitativo mobile. Criterio successivo: applicare il selettore LOD nel solo renderer e misurare draw call/FPS su telefono; nessuna conclusione sulle performance reali prima di quel test. |
| 21/09/2026, 20:xx | Corretto e testato il sincronismo visivo palla-dribbling della review CGTrader, senza modificare Match Engine, stati partita, bersagli o telecronaca. | La palla segue ora il clock della clip `dribble`, non l’orologio della scena: la sonda Chrome locale PASS conferma clip montata a velocita` nativa e marker ai frame misurati sinistro u=0,270, destro u=0,360, sinistro u=0,790. I lati palla sono rispettivamente -0,24 / +0,24 / -0,24; errori browser zero. La sonda usa un override di sola diagnostica per ispezionare ogni frame anche quando il browser headless rallenta. | PASS condizionato sincronismo renderer del dribbling in review. Restano FAIL il quality gate complessivo, la ripresa sul telefono e la pubblicazione: `?hyperCharacter=full` resta invariato e continua a usare Hyper. Prossimo: verifica visiva in partita e benchmark mobile, poi integrazione LOD del solo renderer. |
| 21/09/2026, 20:03 | Derivati LOD animati direttamente dal package CGTrader review, dopo aver rilevato che i LOD precedenti a 68 joint non erano compatibili con il rig retargettato da 75 joint. | `cgtrader-review-lod1.glb` (12.244 triangoli, 7,07 MB) e `cgtrader-review-lod2.glb` (4.190 triangoli, 4,12 MB) sono esportati dal package animato: entrambi mantengono 75 joint nello stesso ordine, 7 primitive skinned e tutte le 31 clip, inclusi `idle`, `jog`, `dribble`, `pass`, `kick`, `header` e `slide-tackle`. Validatore LOD PASS. | PASS catena asset LOD compatibile con animazioni. Non ancora integrati nel renderer di partita: il prossimo criterio e` un selettore LOD review-only con nessuno scambio durante un gesto tecnico, poi misura draw call/FPS su telefono. |
| 21/09/2026, 20:10 | Consolidato il verdetto di selezione del modello e ripetuta la validazione LOD estesa. | La base scelta e` Soccer Player Hisenberg/CGTrader; package review: 75 joint, 31 clip. LOD animati: LOD1 12.244 triangoli/7,07 MB, LOD2 4.190/4,12 MB. Il validatore ora confronta anche inventario e durata delle 31 clip tra LOD0/1/2: PASS. | PASS selezione e catena asset locale; FAIL quality gate finale e distribuzione fino a test mobile, selettore LOD runtime e autorizzazione esplicita alla pubblicazione degli asset licenziati. |
| 21/09/2026, 20:16 | Pubblicato il branch POC e controllata la review CGTrader su GitHub Pages. | GitHub Pages e` configurato sulla branch `poc/marioprada-character-system` ed e` in stato `built`; HTML pubblico contiene `?hyperCharacter=cgtrader-review` e punta al GLB CGTrader, che risponde HTTP 200 (16.968.392 byte). `main` non e` stato toccato e `?hyperCharacter=full` resta Hyper. | PASS distribuzione statica review. Smoke browser headless NON conclusivo: entro 90s il renderer non ha inizializzato stato/asset, senza errori JS; serve verifica su telefono o browser interattivo prima di dichiarare review pronta. |
| 21/09/2026, 20:xx | Verificata in browser interattivo la review pubblica CGTrader sul solo branch POC. | GitHub Pages apre `?hyperCharacter=cgtrader-review`; la schermata di revisione azioni parte e il renderer mostra la scena. Nel monitor integrato sono comparsi circa 14 FPS con corpi pieni: misura utile come segnale di rischio, ma non equivalente a una prova su telefono reale. `main` e `?hyperCharacter=full` restano invariati. | PASS apertura pubblica POC; FAIL gate performance mobile. Prossimo: misurazione su telefono e selettore LOD review-only senza swap durante i gesti tecnici. |
| 21/09/2026, 20:36 | Implementata e verificata la route POC separata `?hyperCharacter=cgtrader-lod2-benchmark`: sostituisce i 23 avatar di campo con il package CGTrader animato LOD2. | Smoke 412×915 PASS: 23/23 avatar CGTrader, 23 mixer, 31 clip, errore browser zero, GLB LOD2 HTTP 200. Il renderer misura 100.908 triangoli e 282 draw call nello scenario; la review Hero di base resta PASS (1.110.805 triangoli/694 call nel suo scenario). Lo smoke `?hyperCharacter=full` è PASS e continua a richiedere il package Hyper. | PASS compatibilità squadra LOD2 nel solo POC; FAIL gate mobile finale: confronto non è un benchmark su telefono e LOD2 non viene mai usato durante un gesto tecnico da promuovere. |
| 21/09/2026, 20:40 | Ispezionata nel browser interattivo la route LOD2 della squadra CGTrader pubblicata sul branch POC. | Il monitor ha mostrato 30–40 FPS, ma un’inquadratura ravvicinata rivela artefatti geometrici molto evidenti su gambe e maglia. La route viene quindi rinominata `?hyperCharacter=cgtrader-lod2-benchmark` per chiarire che è un banco tecnico e non una preview qualitativa. | FAIL qualità visiva LOD2 a distanza ravvicinata. LOD2 resta candidabile solo fuori camera/lontano; non promuovere squad replacement senza selettore LOD che protegga Hero, primi piani e gesti tecnici. |
| 21/09/2026, 20:50 | Corretto il crash mobile `npcCoachAvOpts is not defined` riportato dal collaudo preview. | Il bundle HTML chiamava la factory dell’allenatore senza includerla, mentre il sorgente la contiene. È stato aggiunto un fallback compatibile nel bundle POC; guard statico e smoke runtime sulla scheda Club con `Mister Bellandi` PASS, senza errori pagina. Il fallback non modifica match engine, eventi, telecronaca o modello 3D. | PASS crash fix POC. Il benchmark LOD2 resta FAIL visivo nei primi piani; le prestazioni mobile 11–16 FPS rilevate dall’utente restano FAIL e guidano il prossimo lavoro sul selettore LOD. |
| 21/09/2026, 21:00 | Creato e testato localmente il benchmark CGTrader a LOD misti sul branch non pubblicato. | La route locale assegna 1 LOD0, 7 LOD1 e 15 LOD2 su 23 avatar, caricando tutti e tre i package con HTTP 200 e 31 clip. Smoke 412×915: 157.516 triangoli, 280 draw call, 23 mixer, errori browser zero. | PASS compatibilità e budget locale. FAIL promozione: l’assegnazione è statica, non segue camera/gesti e non sostituisce il benchmark su telefono; LOD2 resta escluso da primi piani e azioni tecniche. |
| 21/09/2026, 21:08 | Rieseguito il benchmark locale a LOD misti sul ramo non pubblicato. | Smoke mobile-layout 412×915 completato senza errori di processo; la configurazione resta 1 LOD0, 7 LOD1 e 15 LOD2, con 23 avatar, 23 mixer e 31 clip disponibili. Questa è una conferma di compatibilità del banco, non una prova di qualità mobile. | PASS compatibilità locale; FAIL aperti: assegnazione ancora statica, artefatti LOD2 nei primi piani, frame time su telefono e transizioni LOD durante i gesti. Prossimo criterio: progettare e verificare lo swap esclusivamente in idle/locomozione, mai durante dribble/pass/kick/header/tackle/parate. |
| 21/09/2026, 21:16 | Implementato e verificato il selettore LOD dinamico nel solo benchmark locale CGTrader. | Ogni avatar predispone i tre visual compatibili (69 in totale) ma ne rende e anima uno solo; lo smoke verifica 23 avatar, 69 varianti, uno scambio sicuro e il blocco quando è in corso un dribbling. Prima di un gesto tecnico il renderer tenta la promozione a LOD0; durante gesto, fade o transizione locomozione lo scambio è rifiutato. | PASS tecnico locale per il contratto di swap. FAIL finale: serve sequenza tecnica reale su telefono, controllo visivo della camera e frame time/memoria; nessuna route è pubblicata e main resta invariato. |
| 21/09/2026, 21:20 | Corretto e rieseguito il selettore LOD locale dopo un errore di scope rilevato dalla sua stessa evidenza. | La prima esecuzione aveva errori browser `_updateCgtraderLod is not defined`: non è stata considerata valida. La funzione è stata resa disponibile al render loop e il ruolo Hero è ora marcato esplicitamente. Smoke corretto: zero errori browser, 23 avatar/69 varianti, Hero LOD0=1, LOD1=2, LOD2=20, cinque swap distanza e test di lock dribble PASS. | PASS tecnico locale corretto. Non chiude il gate: la promozione LOD0 durante un gesto reale, sincronismo palla, camera e frame time/memoria sul telefono restano da collaudare. Nessuna pubblicazione e main invariato. |
| 21/09/2026, 21:23 | Verificata la promozione preventiva LOD0 per il gesto tecnico nel benchmark locale. | Smoke browser: stato pronto, zero errori; un avatar non-Hero LOD2 viene promosso a LOD0 prima dell’innesco simulato del dribbling e il successivo tentativo di swap viene rifiutato. Il monitor registra technicalPromotions=1, blocked=1; Hero già fisso a LOD0. | PASS tecnico locale per il contratto pre-gesto/lock. FAIL aperto solo a scala reale: occorrono gesto e palla della partita sul telefono, resa dei primi piani e frame time/memoria. |
| 21/09/2026, 21:57 | Misurato il dribbling reale nel roster CGTrader a LOD misti. | Test locale con tre scene forzate: clip attiva `dribble`; marker piede-palla sinistro u=0,27, destro u=0,36, sinistro u=0,79. Ogni marker certifica Hero LOD0; il report registra zero errori browser. Lo smoke LOD precedente conferma 23 avatar, 69 varianti e promozione preventiva/lock tecnico. | PASS tecnico locale per innesco e contatti della palla. Restano aperti la resa visiva di busto/braccia e transizioni, più FPS/frame time/memoria e stabilità sul telefono. Nessun push; main e Pages invariati. |
| 21/09/2026, 22:18 | Reso più severo il probe del dribbling a LOD misti e corretto il verdetto. | Il marker viene azzerato per ogni scena e il test aspetta la clip reale prima del campionamento. Sinistro u=0,27 e destro u=0,36 sono emessi da `dribble` dell’Hero in LOD0; il sinistro u=0,79 resta intermittente quando `hl_move` passa a `hl_choose`. Audit materiali del GLB: solo `HyperShirt` e `HyperShorts` sono nominati per l’eredità del kit; non esistono componenti capelli/calzettoni/scarpe separati. | RITIRATO il pass tecnico precedente: il gate dribbling resta IN CORSO. Serve correggere il terzo tocco e costruire adattatori asset per le parti non mappate; nessun push, main e Pages invariati. |

| 21/09/2026, 22:31 | Corretta la scala del roster CGTrader nella preview locale. | Il calcolo basato sul bounding box del modello animato sottostimava l’altezza e ingrandiva i giocatori. Sostituito con la distanza reale tra le ossa, sia al caricamento sia nei tre LOD. Smoke locale: 23 avatar, 69 varianti, risorse LOD 200 e zero errori browser. Il test dribbling mantiene i primi due contatti (0,27 sinistro; 0,36 destro) a LOD0; il terzo 0,79 resta intermittente. | Scala corretta in locale, ma il quality gate visivo/mobile resta aperto: verificare sul telefono proporzioni, kit, braccia/busto e FPS prima di qualunque pubblicazione. |

| 21/09/2026, 23:08 | Stabilizzato il dribbling CGTrader completo nel roster a LOD misti. | La clip retarget era molto breve (circa 0,42 s): rallentata localmente a 0,45x per rendere leggibili i tre appoggi senza alterare esito o traiettoria. Il nuovo probe osserva il clock reale della clip, non tempi iniettati: sinistro 0,226, destro 0,327, sinistro 0,732; tutti emessi da `dribble` dell’Hero in LOD0. Dopo la scelta, `hl_result` conserva Hero LOD0; zero errori browser. | PASS tecnico locale per il gesto e il sincronismo marker-palla. Restano obbligatori il collaudo visivo delle braccia/busto, le transizioni in camera e performance/memoria mobile; nessuna pubblicazione. |
| 21/09/2026, 23:14 | Riparati i materiali del kit nei tre GLB runtime CGTrader. | L'audit Blender ha rilevato un errore di associazione: la maglia e i pantaloncini avevano nomi assegnati alle mesh delle gambe. Generati LOD0/1/2 con `HyperShirt` sulla maglia, `HyperShorts` sui pantaloncini e materiali neutri su entrambe le gambe; il benchmark richiama i tre nuovi asset, 23 avatar/69 varianti, tutte le clip e zero errori browser. Il probe del dribbling rimane PASS. | PASS tecnico locale per mapping maglia/pantaloncini. Restano aperti pattern, calzettoni, scarpe, capelli/barba e il quality gate visivo/mobile; nessuna pubblicazione. |
| 21/09/2026, 23:24 | Integrate nel renderer locale le quattro texture native della testa CGTrader per capelli nero, castano, biondo e ramato. | La selezione deriva dal colore capelli del giocatore, modifica solo `Material.002` della testa e non tinge pelle, occhi o kit. Smoke 412×915: 23/23 avatar hanno una texture nativa valida; nel roster di controllo risultano 3 neri, 17 castani e 3 biondi. Le tre texture richieste rispondono HTTP 200; errori browser zero. | PASS tecnico locale per il colore capelli. Restano aperti forma delle acconciature, barba/baffi, calzettoni/scarpe, review visiva e performance mobile; nessuna pubblicazione. |
| 21/09/2026, 23:32 | Ispezionata la separabilità reale di calzettoni e scarpe nel GLB CGTrader runtime. | Ogni gamba è una sola SkinnedMesh: 2.961 vertici e 4.724 triangoli, con una sola texture `leg` 2K. Pelle, calzettone e scarpa non hanno materiali né primitive distinte. La separazione tramite altezza o bounding box colorerebbe parti anatomiche errate durante la deformazione. | PASS evidenza tecnica; non viene introdotta una colorazione fittizia. Per kit completi servono maschere UV/texture sorgente authored oppure nuove primitive nel Blender derivato, poi review visiva e benchmark. |
| 21/09/2026, 23:40 | Testata e rifiutata una maschera UV automatica della texture `leg`. | I pixel chiari/scuri non seguono aree anatomiche: sulla mesh sinistra le classi candidate per scarpa, calzettone e resto occupano tutte la stessa estensione verticale (z 0,115–87,915), quindi sono ombre/dettagli UV e non parti del kit. Nessun adattatore né colore runtime viene introdotto. | FAIL sicuro per la maschera automatica: proteggere la pelle e il kit esistente. L’unica strada corretta resta authoring esplicito di maschere UV o primitive separate nel sorgente Blender, seguito da review. |
| 21/09/2026, 23:48 | Allineata la palette dati del roster alle quattro texture capelli native CGTrader. | Il grigio, privo di texture corrispondente, è stato sostituito nella palette locale dal ramato nativo. Smoke 412×915 PASS: 23/23 avatar con texture valida, distribuzione 2 neri / 14 castani / 4 biondi / 3 ramati; tutte e quattro le richieste rispondono HTTP 200; errori browser zero. LOD 1/7/15 resta invariato. | PASS tecnico locale per colore e varietà del taglio nativo. Restano aperti forma delle acconciature, barba/baffi, kit completo, review visiva e performance mobile; nessuna pubblicazione. |
| 21/09/2026, 23:55 | Riesaminate le evidenze visive locali dopo la correzione della scala. | Nel frame 412×915 del benchmark LOD misto, il giocatore CGTrader in campo ha proporzioni normali rispetto al cerchio di centro e agli altri avatar; il render sorgente conferma una silhouette adulta realistica, con kit sportivo completo e volto non caricaturale. Il ritratto ravvicinato resta sovraesposto e non equivale a un gate mobile. | PASS locale sulla regressione “giocatori enormi”. Restano obbligatori close-up nel renderer, kit/pattern, animazioni e FPS reali su telefono prima di qualsiasi promozione. |
| 22/09/2026, 00:20 | Ritarata la scala del roster CGTrader contro la porta reale. | Porta: 2,44 unità. Il precedente bersaglio ereditava la statura del corpo procedurale (Hero 2,28; altri fino a 2,50), quindi i giocatori risultavano quasi alti come la porta. Ora l’Hero usa la statura dichiarata 1,86 (misura ossa 1,875) e gli altri 1,80 (misure ossa 1,76–1,83). Smoke 23 avatar/69 LOD: zero errori browser. | PASS tecnico locale per la scala. Restano obbligatori dribbling, transizioni, review visiva e prestazioni reali su telefono; nessun push e main/Pages invariati. |
| 22/09/2026, 00:35 | Reso affidabile il campionamento del dribbling dopo il fix di scala. | Il precedente test poteva perdere il primo contatto sinistro durante il ritardo di assestamento, generando un falso negativo. Attivazione della scena e reset dei marker ora avvengono nello stesso task browser: sinistro 0,236 → destro 0,321 → sinistro 0,721, tutti `dribble`/Hero LOD0; 12 campioni successivi in `hl_result`, zero errori browser. | PASS tecnico locale di gesto, transizione e sincronismo marker-palla. Rimangono review visiva di braccia/busto e prestazioni reali su telefono; nessun push e main/Pages invariati. |

| 22/09/2026, 00:45 | Collegato il pallone alle ossa reali ball_l e ball_r del rig CGTrader, mantenendo il fallback direzionale soltanto fuori dalle finestre di contatto. | Collaudo locale a fermo immagine sul dribbling: sinistro u=0,261, destro u=0,360, sinistro u=0,731; Hero sempre LOD0, ancoraggio foot-bone, distanze orizzontali palla-piede 0,000 / 0,000 / 0,001 unità, zero errori browser. La miniatura di review non mostra T-pose e colloca il pallone al piede attivo. | PASS tecnico locale per contatto palla-piede. Restano obbligatori review completa di volto/kit/braccia, transizioni reali e frame time/memoria su telefono; nessuna pubblicazione e main/Pages invariati. |

| 22/09/2026, 00:50 | Catturata una preview 412x915 dell'highlight di dribbling sul renderer locale con la camera di gioco. | La route mista LOD si e aperta in stato ready senza errori; l'Hero e LOD0 durante la clip. La camera di gioco conferma proporzioni contenute nel campo, senza il rapporto giocatore-porta errato precedente. Questa immagine e una review locale, non un benchmark mobile: il monitor software mostra 1 FPS. | PASS preview tecnica di scala e gesto; restano aperti qualita completa di kit/volto/braccia, transizioni e performance su telefono. |

| 22/09/2026, 01:00 | Reso permanente il gate delle braccia nel collaudo del dribbling CGTrader. | Tre appoggi congelati: spostamento mano sinistra 0,220, mano destra 0,103; massima distanza mano-busto 0,487, sotto il limite 0,650 contro la T-pose. Il contatto palla-piede resta 0,000 / 0,000 / 0,001; zero errori browser. | PASS locale coordinazione corpo, braccia e palla nel dribbling. Restano review estetica completa di kit/volto, transizioni delle altre azioni e performance reale su telefono. |

| 22/09/2026, 01:10 | Rieseguito il gate delle transizioni LOD dopo l’aggancio palla-piede e reso il probe immune alla corsa tra commit della UI e risoluzione. | Il primo FAIL aveva chiamato resolve prima che hl_choose fosse consolidato e leggeva 12 campioni ancora in scelta. Il probe ora attende hl_choose, riceve resolved=true e osserva 12/12 campioni hl_result; Hero conserva LOD0. La sequenza sinistro-destro-sinistro e gli ancoraggi foot-bone restano validi. | PASS transizione post-dribbling locale. Non è una prova di frame time o memoria su telefono. |

| 22/09/2026, 01:20 | Riesaminato il modello sorgente CGTrader corpo intero insieme alle evidenze runtime. | Il sorgente mostra un calciatore adulto con volto realistico, maglia, pantaloncini e calzettoni completi; la posa a T della scheda e del render statico è bind pose di esportazione. Nel renderer il gate del dribbling misura braccia mobili e compatte, quindi quella posa non viene promossa come gesto. Il contrasto del volto resta da rivedere in condizioni di campo/mobile. | PASS preliminare di idoneità della base acquistata; FAIL ancora aperti: finitura kit per squadre, varianti forma capelli/barba, review volto in campo e performance reale su telefono. |

| 22/09/2026, 01:30 | Verificata una resa Ajax sul modello CGTrader senza aggiungere pannelli, capelli o altra geometria. | Il test riproducibile `tools/render_cgtrader_ajax_material_review.py` usa solo la mesh della maglia e la texture `tshirt` del package acquistato. L’atlas UV della maglia interlaccia le isole frontali: una fascia dipinta diventa due toppe ed e` stata scartata. La review applica quindi una maschera materiale centrale in Blender e il render conferma una maglia bianca con fascia rossa unica, pantaloncini e calzettoni sorgente invariati. | PASS review estetica locale del concetto kit, senza finti overlay. FAIL promozione runtime: il materiale procedurale va convertito in una texture/UV authored che conservi dettagli e retro prima del GLB; restano aperti volto in campo, varianti forma capelli/barba e performance telefono. |
| 22/09/2026, 01:45 | Convertita la review Ajax in un GLB LOD0 animato, ancora isolato dal renderer. | Il builder `tools/build_cgtrader_ajax_kit_review.py` cuoce la fascia nel file UV della maglia CGTrader e genera `cgtrader-review-lod0-ajax-kit-review.glb` (15,26 MB). Ispezione del GLB PASS: 34.995 triangoli, attributi skinned completi e 31 clip, incluso `dribble`; render di reimportazione PASS: la fascia resta una sola su torso e braccia/corpo rimangono quelli animati del package. | PASS artefatto GLB review. FAIL promozione runtime: la variante deve prima superare review di retro, kit completo (calzettoni/scarpe), close-up volto e benchmark telefono; main e Pages restano invariati. || 22/09/2026, 02:05 | Corretto il kit Ajax LOD0 dopo l'audit del retro. | Il primo bake applicava la fascia anche al retro: non e` stato promosso. La maschera ora combina fascia centrale e posizione del tessuto sul fronte; il render conferma fascia rossa unica davanti e schiena bianca. Nuova ispezione: 31 animazioni ancora presenti. `cgtrader-ajax-kit-back-review.png` e` l'evidenza del retro. | PASS review kit superiore fronte/retro, senza geometria aggiunta. Restano FAIL kit basso (calzettoni/scarpe ancora sorgente), volto in campo, varianti forma capelli/barba e benchmark mobile. || 22/09/2026, 02:20 | Aggiunta la route locale isolata `?hyperCharacter=cgtrader-ajax-review` e collaudato il caricamento browser del GLB Ajax. | Smoke Chrome PASS: stato `ready-cgtrader-ajax-review`, 75 ossa misurate, 31 clip e gesture `dribble` disponibili, errori pagina zero. La cattura headless SwiftShader e` nera a 0 FPS: e` evidenza del limite del banco software, non viene usata come review visiva o prestazionale. | PASS tecnico di route/asset; FAIL ancora aperto per camera e prestazioni su telefono reale. Nessuna pubblicazione: main, Pages e URL ufficiale restano invariati. |
| 22/09/2026, 09:30 | Verificata la route Ajax in un browser interattivo locale, completando un provino fino a un highlight 3D. | Il renderer visualizza stadio, campo e corpi 3D; al momento dell'highlight l'overlay indica 12–13 fps nell'In-app Browser desktop. La camera di gioco lascia il calciatore troppo piccolo per giudicare con onesta' volto o fascia Ajax, quindi questa e' evidenza di integrazione visuale, non review estetica ne' benchmark telefono. | PASS locale di rendering interattivo della route; restano FAIL close-up giocatore/kit nel renderer, transizioni complete e prestazioni misurate sul telefono reale. Nessuna pubblicazione: main, Pages e URL ufficiale invariati. |

| 22/09/2026, 10:05 | Esaminate due raccolte ufficiali MakeHuman per barba e baffi sul volto CGTrader. | Bodyparts 05 (CC0, 5 mesh) e Bodyparts 06 (CC-BY, 4 mesh) sono state importate e riallineate con scala uniforme; review fronte e tre quarti. Nessuna delle 9 mesh e' adatta: masse a collare/sotto mento oppure baffi che attraversano guance e naso. Le tavole di review sono archiviate; nessun asset entra nel runtime. | FAIL sicuro per entrambe le librerie facciali: servono asset maschili moderni nati per testa realistica, poi fit/pesi/clip. Main, Pages e URL ufficiale invariati. |

| 22/09/2026, 10:25 | Verificato il nuovo Hair Editor ufficiale MakeHuman come possibile fonte di capigliature moderne. | Le quattro template sono oggetti Blender CURVES Geometry Nodes vincolati alla superficie Human/UVMap. Basic short e hedgehog hanno una silhouette di partenza potenzialmente adulta, ma l'export GLB selezionato di basic short produce 132 byte e alla reimportazione 0 oggetti/0 triangoli: non e' una risorsa runtime. | FAIL come libreria immediata; puo' solo essere riferimento per authoring Blender dedicato. Nessun asset o geometria artificiale entra nella POC; main, Pages e URL ufficiale invariati. |

| 22/09/2026, 10:45 | Valutato Avaturn come alternativa configurabile al modello CGTrader. | Le documentazioni ufficiali dichiarano GLB, rig umanoide, capelli/abiti/accessori e blendshape; e' quindi una candidata teorica per molte varianti. Il configuratore demo richiede login e il FBX pubblico Mixamo dichiarato dalla documentazione restituisce HTTP 403 nel download diretto. Non esiste quindi un file da ispezionare o promuovere in questa POC. | DA VERIFICARE, non candidata approvata: servirebbe un export GLB ottenuto da un account Avaturn e successivi gate di scala, rig, kit, gesti e mobile. Nessuna integrazione/pubblicazione; main, Pages e URL ufficiale invariati. |

| 22/09/2026, 11:05 | Creata una preview ravvicinata texture-faithful del profilo CGTrader. | Il render Workbench evita la sovraesposizione EEVEE e mostra viso adulto, dettagli cutanei, occhi e capelli nativi in primo piano; nessun pannello o geometria aggiunta. L'immagine supera la review statica contro l'effetto cartoon/T-pose, ma non e' una prova di espressioni, kit in campo o dispositivo mobile. | PASS statico per definizione del volto della base CGTrader. Restano una sola forma capelli/volto, review nel renderer di campo e tutti i gate mobile; main, Pages e URL ufficiale invariati. |

| 22/09/2026, 11:20 | Rieseguita una ricerca di mercato mirata a modelli adulti realistici con rig, formati esportabili e varianti realmente dichiarate. | Il modello Hisenberg acquistato resta l’unico candidato locale ispezionato: 17.891 poligoni, rig, Blender/FBX/GLB/OBJ, ma una sola testa e un solo taglio. È emerso un nuovo modello CGTrader da $99,99 che dichiara rig facciale e morph target, ma dichiara anche pacchetti Unreal/texture nell’ordine di 1,2–1,5 GB e non dichiara volti o tagli alternativi; non è stato acquistato né ispezionato. I modelli di calciatori con likeness di atleti reali e il pack “30 haircuts” stilizzato sono esclusi rispettivamente per diritti d’immagine e stile. | PASS ricerca: non esiste ancora un sostituto provato che migliori il modello acquistato senza introdurre costo, licenza, peso mobile o stile incompatibile. La base CGTrader resta selezionata con vincoli; il prossimo candidato configurabile da verificare è Avaturn solo dopo un export GLB reale. |
| 22/09/2026, 11:30 | Verificato direttamente il configuratore pubblico Avaturn `demo.avaturn.dev` in una sessione pulita. | Il configuratore mostra soltanto `Sign In with Google`, `Sign in with email` e `Sign up`: non offre un avatar demo esportabile anonimamente. La documentazione ufficiale conferma che un GLB viene generato/esportato al termine del flusso utente. Nessun accesso, account o esportazione è stato creato o utilizzato. | Evidenza rafforzata: Avaturn resta candidato teorico per capelli, abiti e blendshape, ma non è testabile né promuovibile senza un GLB esportato da un account autorizzato. Il candidato CGTrader già acquistato resta la sola base verificata. |
| 22/09/2026, 11:45 | Individuato e analizzato un candidato realmente orientato alle varianti: GoE Realistic Character Creator per Blender. | La scheda dichiara due basi riggate, oltre 140 shape key per personaggio, randomizzazione di volto/corpo/espressioni, sorgente Blender e helper GLB/FBX. Questo risolve potenzialmente il limite delle fisionomie del CGTrader. Non dichiara pero' tagli capelli multipli nel pacchetto base (solo colori capelli/sopracciglia), non pubblica poligoni/texture, non include un kit da calcio e la licenza commerciale indicata e' $399. Non e' stato acquistato né ispezionato. | Candidato condizionale, non scelta: richiedere o ottenere un sample esportato e sottoporlo a rig, scala, volto, kit, LOD e mobile gate prima di qualsiasi decisione di spesa. |
| 22/09/2026, 11:55 | Completato il preview gate visivo pre-acquisto del GoE Realistic Character Creator sulla sua pagina pubblica. | Il candidato dichiara numerose shape key, ma la preview del maschio mostra pelle molto liscia, occhi grandi e lineamenti bamboliformi. Questo contrasta direttamente con il volto adulto, definito e non caricaturale richiesto per Korward. Non sono stati accettati cookie, creati account, acquistati o scaricati file. | RIFIUTATO prima della spesa: le varianti facciali non compensano uno stile visivo incompatibile. Il CGTrader acquistato resta la sola base estetica approvata; la ricerca continua soltanto per alternative realistiche già verificabili. |
| 22/09/2026, 12:10 | Analizzata la nuova offerta Daz “Game-Ready” e il catalogo Genesis come possibile sorgente realistica modulare. | Daz dichiara FBX/DUF/GLB per una libreria in crescita e Genesis offre morph, abiti e capelli, ma non e' emerso un calciatore maschile già confezionato come GLB/FBX completo e verificabile. I prodotti di capelli e volti sono in larga parte DUF dipendenti dalla piattaforma Genesis, con licenze/add-on separati; non sono una libreria pronta per il rig CGTrader. | RIFIUTATA come base immediata: aggiungerebbe dipendenze e costi senza un vantaggio tecnico già dimostrato. La ricerca prosegue su pacchetti adulti realistici con asset completi, rig e formato web verificabili. |
| 22/09/2026, 12:25 | Ispezionata la separabilita` effettiva delle caratteristiche facciali nel sorgente Blender CGTrader. | La testa usa una sola mesh e una sola texture `HEAD`: pelle, occhi, capelli e sopracciglia condividono il medesimo atlante. Le quattro varianti approvate sostituiscono l'intera texture solo con versioni curate del colore capelli. Non esistono materiale occhi o pelle separati. | PASS evidenza, FAIL nuove varianti automatiche: non verranno applicati tint per occhi/pelle che altererebbero il volto. Il modello mantiene quattro colori del taglio nativo e una sola fisionomia; per identita` diverse serve un'altra testa/model source, non un filtro. |
| 22/09/2026, 12:45 | Individuata e visualmente ispezionata la demo pubblica MetaPerson come alternativa configurabile. | La demo mostra una base maschile adulta con proporzioni del volto più naturali del candidato GoE; la documentazione dichiara basi predefinite senza foto, capelli/abiti/fisionomia modificabili, rig umanoide Mixamo, GLB/glTF/FBX e LOD 1/2. La schermata iniziale mostra `Sign In`: non e' stato effettuato login, non e' stata caricata una foto e non e' stato esportato alcun file. | PASS pre-screening estetico e tecnico documentale; candidato prioritario ma NON approvato. Il prossimo gate richiede un GLB di base esportato legalmente, poi audit di triangoli, materiali, rig, kit, contatti palla e mobile. |
| 22/09/2026, 13:00 | Verificato il requisito di export web MetaPerson attraverso il repository ufficiale Three.js e la documentazione API. | MetaPerson offre basi, capelli, abiti, fisionomie e LOD, ma il percorso ufficiale per ottenere un GLB nell'integrazione Three.js richiede Business Integration, credenziali sviluppatore e piano Pro o superiore. La demo pubblica resta utile solo per valutare lo stile; non produce un asset legalmente disponibile per la POC attuale. | Stato corretto: candidato futuro, non sostituto pronto. Nessun account, credenziale, foto, download o abbonamento viene creato. La base CGTrader resta l'unica realmente testabile nel progetto. || 22/09/2026, 13:15 | Analizzato Human Generator per Blender come possibile sorgente di calciatori realmente variabili. | La documentazione ufficiale dichiara oltre 100 controlli per viso/corpo, librerie di capelli, barba/baffi maschili, abiti, espressioni e rig; il processing include bake texture, generazione LOD ed export. I capelli di authoring sono sistemi a particelle: il prodotto può convertirli in haircards, ma la sua stessa guida segnala qualità variabile e barba in haircard di bassa qualità. Per un gioco commerciale serve la licenza Commercial; nessun acquisto, installazione o export è stato effettuato. | CANDIDATO prioritario da provare, non promosso: può risolvere le varianti vere, ma richiede un sample con capelli convertiti, rig/runtime audit, kit football, dribbling+palla e misura su telefono. La base CGTrader rimane l'unico asset già verificato. |
| 22/09/2026, 13:30 | Completato pre-screening visivo, economico e di licenza di Human Generator. | Il sito ufficiale indica $128 una tantum per la licenza Commercial, necessaria per software e videogiochi; la trial gratuita sblocca un solo uomo `Caucasian 1` con watermark. La tavola ufficiale di esempi di preset mostra più fisionomie maschili adulte e distinte, ma è una dimostrazione di custom content: non prova che tutti quei preset siano inclusi nella trial o che i capelli convertiti rendano bene nel runtime. | PASS convenienza come candidato rispetto ai $359+ delle alternative configurabili, ma nessuna promozione: il prossimo criterio è un trial locale con il singolo uomo, export GLB a 1K e haircards, seguito da audit tecnico e preview. |
| 22/09/2026, 13:45 | Valutata la sorgente gratuita Blender Studio “Free Male Base Mesh”. | È una base maschile realistica da 14,9 MB, CC-BY, pensata come punto di partenza per sculpting. La pagina non dichiara rig runtime, capelli modulari, abiti/kit, LOD, FBX/GLB o animazioni; quindi non può essere provata come calciatore senza un lavoro di authoring sostanziale. | RIFIUTATA come soluzione pronta ma conservata come riferimento di anatomia/topologia libera. Non compete con CGTrader o Human Generator per il POC. |
| 22/09/2026, 14:00 | Verificato il budget LOD dichiarato da Human Generator. | La demo ufficiale mostra un umano non processato da circa 73.488 triangoli; il documento LOD dichiara però tre output finali: circa 25k facce originale, 18k facce a volto ridotto, 5k facce a un quarto. Il primo è sopra il CGTrader corrente, il terzo è candidabile per giocatori distanti; l'operazione è finale e disabilita modifiche successive a volto/capelli/espressioni. | PASS tecnico condizionale: la strategia corretta sarebbe authoring completo -> export Hero L0 e squad LOD 1/2, non ventidue L0. Da verificare con asset reale: triangoli dopo capelli/kit, draw call, retarget e telefono. |
| 22/09/2026, 14:15 | Verificata compatibilità preliminare Human Generator con Blender del progetto. | Il Blender locale è 4.5.14. Il repository pubblico dell’add-on dichiara minimo Blender 3.2 e la release V4 documenta fix per 4.0, ma non dichiara compatibilità certificata con 4.5; inoltre restano issue pubbliche su haircards e su gruppi di vertici delle acconciature custom. | FAIL compatibilità non ancora dimostrata: non acquistare. L'installazione trial isolata è ora il gate indispensabile; deve avviarsi, creare il preset, esportare e convertire haircards senza errori prima di qualsiasi spesa. |
| 22/09/2026, 14:30 | Verificati origine e volume dei due file trial Human Generator. | Gli URL ufficiali rispondono HTTP 200 da downloads.humangenerator3d.com: add-on ZIP 5.059.083 byte, content pack trial ZIP 269.224.756 byte, entrambi modificati il 29/10/2025. Il contenuto trial è quindi circa 269 MB, non un download trascurabile. | PASS integrità/origine pubblica; download completo e installazione restano sospesi in attesa di autorizzazione. Nessun file è stato scritto localmente. |
| 22/09/2026, 14:45 | Completata verifica approfondita di MB-Lab come alternativa gratuita. | MB-Lab offre fisionomie, rig e proxy capelli, ma il repository ufficiale è archiviato dal 21/07/2024. La release hair dichiara shader non applicato e assenza di supporto shape key; le issue riportano errori di finalizzazione/pose e problemi di capelli già con Blender 4.1. L'ambiente Korward usa Blender 4.5.14. | RIFIUTATA senza installazione: il rischio manutenzione e capelli incompatibili è maggiore del vantaggio economico. Human Generator resta l'unica candidata configurabile da testare. |
| 22/09/2026, 15:00 | Verificata la possibilità di isolare il test Human Generator su un Blender già presente. | Nel progetto è disponibile soltanto Blender 4.5.14; non esiste una copia 4.0 già installata su cui eseguire un test meno rappresentativo. La trial dovrà quindi essere installata, se autorizzata, in un profilo/configurazione separata ma sulla stessa versione effettiva del progetto. | PASS criterio di fedeltà: il gate misurerà l'ambiente reale. Installazione ancora non autorizzata e non avviata. |
| 22/09/2026, 15:15 | Preparato il gate riproducibile della trial Human Generator. | Creato `HUMGEN_TRIAL_GATE.md`: definisce configurazione Blender isolata, output separato, input/versioni verificati, criteri Pass/Fail e vieta ogni integrazione o pubblicazione della trial. Il test successivo è ora una sequenza di sette controlli concreti, non una prova generica. | PASS preparazione. Rimane bloccata soltanto l'installazione della trial, che richiede autorizzazione esplicita dell'utente. |
| 22/09/2026, 15:30 | Chiarita la natura della licenza Human Generator. | Il codice dell'add-on è GPL-3.0 pubblico, ma modelli, texture, capelli e abiti sono asset proprietari con licenza separata. La licenza Commercial da $128 consente il loro uso in software/videogiochi solo se non estraibili; la trial watermark non è distribuibile. | PASS chiarezza legale: Human Generator non è una libreria open source di asset. Resta candidata commerciale da validare; per una soluzione libera, nessuna fonte verificata ha superato rig+capelli+volto+mobile. |
| 22/09/2026, 15:45 | Valutata l’autoriazione interna di barba/baffi sulla texture CGTrader. | L'atlante `HEAD` è 2048×2048 e contiene più isole UV ruotate del capo, con capelli, pelle, sopracciglia e volto nello stesso file. Non esiste una regione frontale/materiale separato su cui generare in sicurezza una barba. Un overlay a coordinate fisse rischierebbe subito baffi fuori posto o artefatti, esattamente il difetto estetico da evitare. | RIFIUTATA l'automazione texture: barba/baffi richiedono una texture-head authored e revisionata per ogni variante, oppure una base con moduli nativi. Nessun effetto finto viene aggiunto. |
| 22/09/2026, 16:10 | Verificato il percorso di export di MetaPerson con la documentazione ufficiale aggiornata. | MetaPerson dichiara GLB/glTF/FBX, LOD 1/2, capelli, abiti e fisionomie; l'export richiede però credenziali sviluppatore e piano Pro o superiore. La documentazione ufficiale segnala anche un trial Pro gratuito per gli account, ma nessun account, credenziale, foto o export è stato creato. | Candidato prioritario, ma non testabile finché non esiste un GLB autorizzato. Il prossimo gate reale è un export GLB a LOD 1/2, poi audit di rig, triangoli, texture, kit, dribbling e telefono. |
| 22/09/2026, 16:35 | Ispezionati tre FBX maschili inclusi nel repository ufficiale MetaPerson Rendering Sample, senza account né export dal Creator. | Import Blender 4.5.14 PASS: model1, model3, model5 misurano 59.831/60.193/68.758 triangoli, hanno 73 ossa e 129 shape key complessive. I volti sono adulti e distinti; model5 ha capelli separati (17.249 triangoli) e barba corta nativa. La licenza BSD-3-Clause dichiarata dal repository consente di studiare i campioni, ma gli abiti civili/logati non saranno usati e la verifica di licenza asset resta obbligatoria prima di qualunque integrazione. | PASS pre-screening tecnico/visivo reale, non promozione: budget troppo alto per squadra mobile e restano kit calcio, retarget dribbling, palla, transizioni e telefono. Prossimo: provino locale isolato del solo model5. |
| 22/09/2026, 16:55 | Confrontato il rig reale MetaPerson model5 con il source Mixamo delle clip già disponibili. | Il confronto Blender trova 65 nomi anatomici condivisi su 65; tutte le 22 ossa core per gesto completo (anche braccia, mani, gambe, piedi e dita) sono presenti. MetaPerson aggiunge 8 ossa di dettaglio per collo, occhi e avambracci. | PASS compatibilità nominale completa: il retarget è tecnicamente possibile senza inventare ossa. Resta da provare visualmente la clip dribbling con posa, braccia, piedi e palla; niente è ancora integrato o pubblicato. |
| 22/09/2026, 17:15 | Eseguito il primo provino isolato del dribbling sul rig MetaPerson model5. | Import e mapping di 62 ossa PASS senza eccezioni, ma il copia-rotazione locale produce posa di profilo e collasso grave di busto/gambe in tutti i frame 0/10/21/32/41. La causa verificata è la differenza degli assi/rest pose, non l'assenza di ossa. Nessun file del provino entra nel gioco. | FAIL del trasferimento diretto: non è un dribbling presentabile e non viene usato. Il candidato resta condizionale; prossimo gate è retarget calibrato in bind-space, poi soltanto posa completa, palla, kit e mobile. |
| 22/09/2026, 17:35 | Rieseguito il dribbling MetaPerson con trasferimento calibrato in bind-space, limitato alle 22 ossa core. | I cinque render completano senza eccezioni, ma frame 0/10/21/32/41 mostrano ancora collasso grave di arti e busto: il corpo non mantiene una figura umana leggibile. La compatibilità dei nomi ossei non basta per questo rig/rest hierarchy. | FAIL gate animazione della POC: il campione MetaPerson non puo sostituire la base CGTrader ora e non avanza a palla/kit/LOD/mobile. Servirebbe un retargeter dedicato, con tempo e rischio aggiuntivi; la ricerca di una base già compatibile continua. |
| 22/09/2026, 18:05 | Valutato visivamente il candidato ThreeDee “Customizable Black Man Character”. | La pagina del venditore dichiara $48, Blender/FBX/GLB, rig Auto-Rig Pro, 20+ animazioni, 8 capigliature e 8 barbe/baffi nativi. L’anteprima visiva mostra però una figura marcatamente stilizzata, con proporzioni e resa del volto non coerenti con il requisito di calciatore adulto realistico. Non è stato acquistato né scaricato. | RIFIUTATO al pre-screen estetico: le varianti dichiarate sono interessanti, ma non compensano l’incompatibilità di stile. Restano selezionati soltanto asset che superino prima un provino reale di volto adulto, rig/gesto completo, palla, kit e prestazioni mobile. |
| 22/09/2026, 18:25 | Analizzato il candidato Cubebrush “Free realistic modular characters male b1”. | La pagina mostra un volto adulto realistico e dichiara FBX riggato/animato, 22.390 poligoni, materiali modulari per pelle/occhi/capelli e oltre 125 morph facciali in Unreal; il pacchetto FBX dichiarato pesa 149,98 MB. Il risultato visuale supera il pre-screen estetico. La licenza ufficiale Cubebrush, però, stabilisce che i prodotti gratuiti sono soltanto per uso personale; per un gioco distribuibile serve una licenza Commerciale, non esposta nella pagina senza acquisizione. | RIFIUTATO per l’uso del gioco nella forma gratuita: non scaricare né integrare asset privi di licenza commerciale verificata. È un riferimento tecnico valido, ma non una base promuovibile finché non esiste una licenza commerciale chiara e un file da auditare. |
| 22/09/2026, 18:50 | Chiusi due ulteriori pre-screen di modelli modulari commerciali. | Cubebrush “Realistic Athlete Man G1” ($14) offre Blender/FBX dichiarati, morph facciali e materiali, ma l’anteprima mostra un fisico da bodybuilder incompatibile con la scala del calciatore richiesta e non dichiara varianti di capigliatura. Fab “Male Modular” dichiara 10 personaggi, 52 blendshape e abiti modulari, ma l’offerta include solo un asset package Unreal e parte da €69,16. | RIFIUTATI: il primo per anatomia/silhouette e varietà insufficiente, il secondo per stile, costo e assenza di file WebGL/Blender/FBX nel pacchetto. Non è stato acquistato, scaricato o integrato nulla. |

| 22/09/2026, 19:15 | Ispezionato visivamente e tecnicamente il modello gratuito CGTrader “Realistic Male Character Rigged”. | La pagina espone BLEND/FBX/GLTF, rig Auto-Rig Pro e abiti separati, ma dichiara 171.305 poligoni e 181.842 vertici. L’anteprima mostra inoltre un solo ragazzo con cappuccio e abito urbano; non dichiara teste, tagli capelli o barbe intercambiabili. | RIFIUTATO: la geometria è circa cinque volte il budget già critico della base CGTrader e non risolve le varianti richieste. Nessun download o integrazione eseguiti. |
| 22/09/2026, 19:35 | Individuato Avaturn come prima candidata configurabile con percorso ufficiale esplicito per le clip Mixamo già disponibili. | La documentazione ufficiale dichiara avatar maschili realistici con capelli, abiti e accessori modificabili, GLB esportabile, rig umanoide/ARKit blendshape e una procedura specifica già testata per Mixamo. Le linee guida Avaturn indicano 1K texture e 7k triangoli per l’abbigliamento su Android datati; consentono anche recolor dei capelli. L’integrazione base e gli export sono dichiarati gratuiti; API/web SDK e personalizzazione avanzata sono piani separati. | CANDIDATA prioritaria, non promossa: manca ancora un avatar reale da auditare e un kit calcio compatibile. Il prossimo gate è creare un solo uomo generico senza foto, esportare il GLB e misurare rig, triangoli, materiali, dribbling, palla e mobile prima di qualsiasi integrazione. |
| 22/09/2026, 19:45 | Tentato l’accesso diretto alla pagina pubblica Avaturn per iniziare il provino del solo avatar generico. | Il browser del computer riceve dal filtro aziendale Zscaler il blocco D22: categoria “Online e altri giochi”. Il blocco avviene prima della pagina Avaturn e quindi prima di login, creazione di account o download. | WAIT verificato, non rifiuto tecnico: Avaturn resta candidata perché i requisiti documentali sono forti. Per il file reale occorre un accesso autorizzato fuori dal filtro oppure un GLB esportato dall’utente e allegato/posato nella cartella condivisa. Non verrà aggirato il filtro. |
| 22/09/2026, 20:05 | Completata la verifica documentale di Character Creator 5 (Reallusion) come alternativa professionale configurabile. | Il prodotto dichiara volto/corpo, capelli e barba nativi, rig umanoide, morph ed export FBX; il Game Base dichiara 10k poligoni, riduzione LOD, bake e merge materiali. La trial dura 30 giorni; la pagina ufficiale indica 2,42 GB di download e i requisiti correnti richiedono 30 GB per installazione, fino a 200 GB per cache e GPU con 8 GB VRAM. | CANDIDATA tecnica più completa, non approvata: costo pieno $299 e pipeline diversa dal web GLB. Il provino richiede prima verificare risorse del PC, creare un account Reallusion e installare la trial; poi esportare un solo calciatore generico in FBX per audit in Blender, dribbling+palla e mobile. |
| 22/09/2026, 20:25 | Verificata la fattibilità locale e la disponibilità di kit per il provino Character Creator 5. | Il volume locale C: ha 249,1 GB liberi: supera i 30 GB di installazione e il massimo di 200 GB indicato per la cache. L’ispezione del catalogo Reallusion non ha trovato un kit da calcio maschile realistico pronto per CC5; il candidato deve quindi usare, nel provino, una maglia/short neutri o un kit originale adattato. La VRAM non è leggibile dal contesto attuale, quindi resta da misurare all’avvio della trial. | PASS spazio disco; FAIL kit nativo pronto; IN ATTESA GPU. Il gate resta valido: prima generare un uomo adulto realistico, poi audit con abbigliamento neutro; l’adattamento del kit calcio sarà valutato soltanto se volto, rig, dribbling e peso superano il test. |
| 22/09/2026, 20:40 | Verificata la clausola d’uso delle 3D Models Reallusion prima di avviare la trial CC5. | La FAQ/EULA ufficiale stabilisce che, senza permesso esplicito Reallusion, non si possono trasformare e distribuire le 3D Models in applicazioni di terzi e non si possono usare personaggi o morph per costruire un sistema di generazione di personaggi in giochi o servizi interattivi. Korward richiede proprio asset distribuiti nella web app e personalizzazione del calciatore. | RIFIUTATA per il POC: il risultato tecnico non compenserebbe il rischio di licenza. Nessun account, trial, download o installazione CC5 viene avviato. La ricerca torna a basi con licenza esplicitamente compatibile con il gioco distribuito. |
| 22/09/2026, 21:00 | Trovato il campione FBX ufficiale Avaturn che la loro documentazione indica come già testato con Mixamo. | Il collegamento ufficiale punta a `mesh_for_mixamo_72940d11f8.fbx`; il download locale è stato negato dal filtro Zscaler con HTTP 403 prima che il file arrivasse. Non esiste quindi ancora un asset Avaturn locale da misurare. | WAIT verificato: il candidato Avaturn resta tecnicamente prioritario, ma il prossimo gate dipende dal ricevere quel FBX/GLB tramite un accesso consentito. Nessun filtro è stato aggirato e nessun asset è stato integrato. |
| 22/09/2026, 21:30 | Completato il primo gate reale Rocketbox con `Male_Adult_10`, campione Microsoft con licenza MIT. | Import Blender PASS: 6.732 triangoli, 3.495 vertici, 81 ossa con catene complete di braccia, mani, gambe e piedi. Le anteprime mostrano uomini adulti differenti ma con resa da media/lunga distanza, non da ritratto hero. Il provino bind-space del dribbling su frame 0/10/21/32/41 termina senza errori ma collassa gravemente mesh e arti: non è una posa umana leggibile. | PASS licenza e budget mobile; FAIL gate animazione. Rocketbox non è una soluzione pronta per Korward e non viene integrato. Potrebbe restare soltanto un’ipotesi per folla distante se un retargeter dedicato superasse in futuro il gesto completo; il volto hero e il dribbling richiedono una base diversa. || 22/09/2026, 06:10 | Verificato il percorso ufficiale Rocketbox dopo il FAIL di retarget. | L’importer ufficiale Microsoft classifica i modelli come rig `Generic`, esclude per default i LOD non hi-poly e contiene una procedura speciale per la gerarchia solo quando non si usano animazioni Mixamo. Due issue pubbliche, una del 2022 e una del 2025, riportano mesh distorte o rig incompatibili in Blender anche con animazioni Rocketbox. Questo conferma il fallimento locale: non e` un problema risolvibile cambiando un nome di osso. | RIFIUTATO come base POC WebGL: richiederebbe una pipeline Unity/retarget dedicata e non garantisce il dribbling con palla. Il campione MIT resta solo un riferimento per folla distante; la ricerca prosegue su basi web pronte, con rig verificabile e licenza commerciale/distribuibile. |
| 22/09/2026, 06:25 | Individuato Meta MHR (Momentum Human Rig) come candidata open-source per il solo provino tecnico. | Il repository ufficiale dichiara licenza Apache-2.0, 45 parametri di identita` (20 corpo, 20 testa, 5 mani), 72 espressioni facciali, rig full-body e sette LOD; la release 1.0.1 annota esplicitamente l’aggiunta della licenza agli asset. Non esiste ancora un file MHR locale: il controllo non invasivo dell’URL del pacchetto non ha ottenuto credenziali TLS in questo ambiente. | CANDIDATA tecnica, non modello pronto: prima va verificato il pacchetto reale e la licenza inclusa, poi rig/triangoli, volto, kit calcio, capelli, dribbling+palla e telefono. Nessuna integrazione, push o modifica a main/Pages. |
| 22/09/2026, 06:45 | Estratto e auditato il pacchetto reale MHR 1.0.1. | `assets/LICENSE.txt` e` Apache-2.0. I sette FBX hanno 126 ossa e 118 shape key ciascuno: LOD0 147.274 triangoli, LOD1 36.874, LOD2 21.318, LOD3 9.794, LOD4 4.918, LOD5 1.938, LOD6 1.186. Ma il pacchetto e` un solo corpo senza materiale, capelli, abiti, scarpe o animazioni. | PASS licenza/rig/LOD; RIFIUTATO come calciatore pronto. Puo` essere una base tecnica soltanto se un sistema separato produce kit, volto e capelli all’altezza del gioco, poi supera il gesto con palla. |
| 22/09/2026, 06:55 | Completata la pre-verifica di Character Factory 0.1.2, pipeline Apache-2.0 che usa MHR. | Il sorgente dichiara GLB riggato con corpo, garment, scarpe e capelli separati, 127 ossa, 72 morph e circa 15–50k triangoli. Le limitazioni ufficiali sono sostanziali: release alpha, nessuna barba/baffi, texture solo albedo, artefatti possibili sul kit, un solo layer di abito; una generazione locale richiede 36,4 GB di pesi e GPU NVIDIA consigliata con 12 GB. L'ambiente corrente non ha le dipendenze Python necessarie e non espone la VRAM. | CANDIDATA condizionale, non integrata: e` la prima open-source con struttura adatta, ma richiede una prova reale senza difetti di volto/kit/capelli e tutti i gate dribbling-palla-mobile. Non si installano 36 GB finche` non e` verificata la capacita` hardware o disponibile un export GLB gia` generato. |
| 22/09/2026, 07:20 | Estratto e ispezionato staticamente CharacterEditor 1.0. | Licenza MIT verificata; il pacchetto contiene un editor Unity per uomo/donna. Nel livello maschile sono dichiarati sei tagli (`BackComb`, `Messy`, `MiddleComb`, `Ponytail`, `ShavedSide`, `Short`), barba e baffi separati, colori capelli/barba nero/castano/biondo/grigio e moduli top, shorts, pantaloni, scarpe. La dichiarazione del progetto e` massimo 30k quad con capelli/abiti. Il download non contiene FBX/GLB: i contenuti sono binari Unity e l’export FBX e` una funzione dell’app. | PASS licenza e anagrafica delle varianti, candidata concreta. Restano ignoti finche` non si prova un export: resa del volto adulto, poligoni effettivi, gerarchia/skin, animazione e compatibilita` WebGL. L'eseguibile del release e` privo di firma digitale: non viene avviato automaticamente. |
| 22/09/2026, 07:35 | Chiusa la review visiva pubblica di CharacterEditor. | Il trailer ufficiale dell’autore mostra il maschio in primo piano: volto, occhi, cranio e muscolatura hanno una resa chiaramente da manichino low-poly, non un adulto realistico. Le molte varianti dichiarate (capelli, barba, abiti e colori) sono reali nell’asset, ma non compensano il mismatch estetico. | RIFIUTATO prima dell’esecuzione dell’EXE: non e` necessario avviare un binario non firmato per confermare un difetto gia` visibile. La ricerca resta concentrata su volto adulto credibile, rig esportabile e licenza distribuibile. |
| 22/09/2026, 09:06 | Esaminata la libreria open-source VALID come possibile sostituto o sorgente di varianti. | Il catalogo dichiarato contiene 210 avatar GLB (105 maschili) con licenza MIT. Sono stati scaricati otto ritratti maschili e un GLB campione: le differenze di volto, capelli e carnagione sono reali, ma sono preset completi in abiti casual, non moduli applicabili al giocatore CGTrader. L'audit del campione rileva 58.724 triangoli, 7 mesh/skin da 84 joint, due texture 2K, 0 animazioni e compressione EXT_meshopt_compression che l'importer Blender locale non legge direttamente. | RIFIUTATA per la POC: il volto è più generico della base acquistata, il modello pesa più dell'Hero CGTrader (34.995 triangoli), manca kit calcio/LOD/animazioni e richiederebbe un nuovo retarget completo. L'esplorazione non modifica CGTrader, main o Pages. | Proseguire con candidate modulari compatibili oppure authoring mirato su CGTrader; un nuovo candidato passa solo con silhouette adulta, licenza commerciale chiara, fit/pesi sul rig e budget mobile misurato. |
| 22/09/2026, 09:09 | Pre-screen visivo e tecnico del candidato commerciale Realistic Male [Rigged] di CatBYTE Studio su ArtStation. | La scheda dichiara licenza commerciale, Blender/FBX, componenti separati per occhi, capelli corti, barba, baffi e sopracciglia, più ossa aggiuntive per occhi/mascella/lingua. Le quattro preview pubbliche mostrano un uomo adulto realistico e riggato, ma una sola acconciatura/barba visibile, fisico molto atletico e nessun kit o calzatura da calcio. La geometria dichiarata e' 60.992 triangoli, senza LOD dichiarati; l'asset locale CGTrader e' 34.995 triangoli. | CANDIDATO CONDIZIONALE, non adottato: qualità del volto promettente ma non dimostra varietà di tagli, morph facciali, LOD o compatibilità con il runtime. Non è presente un file sorgente locale, quindi la pagina non prova la disponibilità del download. | Verificare le varianti reali nei file solo se disponibili legalmente; deve superare audit Blender, retarget corpo-palla, kit calcio, LOD e benchmark mobile prima di poter sostituire CGTrader. |
| 22/09/2026, 09:10 | Review visiva diretta del pack Realistic Hair Beard brows mustache p6 di NoEdge su Fab. | La pagina ufficiale mostra una capigliatura maschile a ciocche/hair-card, barba, baffi e sopracciglia con resa adulta più credibile delle fonti CC0 finora testate. Dichiara componenti modulari, colore regolabile, formati Blender/FBX/OBJ/GLTF/GLB e uso con morph facciali. La licenza Standard visualizzata costa €20,20 e il file Maya indicato e' 58,94 MB; la pagina presenta 16 media, ma non documenta in testo il conteggio delle varianti. | CANDIDATO FORTE PER LIBRERIA ESTERNA, non acquistato/importato: la preview e' migliore, ma non dimostra il fit sulla testa CGTrader, i pesi al bone testa, il numero effettivo di tagli e il budget delle hair-card sul telefono. Nessuna sostituzione della base CGTrader, né modifiche a main o Pages. | Se il pack diventa disponibile localmente, eseguire subito inventario, fit su testa CGTrader, render fronte/profilo, test dribbling e misura triangoli/texture; basta un difetto casco, clipping o frame cost eccessivo per escluderlo. |
| 22/09/2026, 09:12 | Precisata la struttura dei pack NoEdge e confrontato il servizio MetaPerson con i vincoli della POC. | p6 e p10 sono due singole silhouette distinte, non un unico catalogo di molti tagli: entrambi includono hair-card, barba/baffi/sopracciglia e colori materiali regolabili. Il produttore dichiara per p6 13.634 poligoni e file Blender/FBX/GLB; le preview confermano p6 con riga laterale e p10 con taglio medio-lungo, entrambi adulti. MetaPerson e' tecnicamente adatto (GLB/FBX, LOD1/LOD2, capelli e blendshape), ma il piano Pro ufficiale costa /mese; l'API per automazione richiede Enterprise. | Strategia pratica aggiornata: CGTrader + al massimo due varianti NoEdge puo' creare una rosa sobria e credibile, ma resta da provarne il fit. MetaPerson non e' una soluzione economica per questa POC. Nessun acquisto, login, integrazione o modifica a main/Pages. | Il primo file NoEdge disponibile deve superare il gate di compatibilità; se fallisce, i due pack sono esclusi senza altri acquisti. Parallelamente prosegue la ricerca di un corpo completo che offra già capelli modulari e LOD dimostrati. |
| 22/09/2026, 09:15 | Riesaminati i candidati capelli locali e il secondo taglio esterno NoEdge. | L'audit dei riferimenti runtime mostra che 	extured-crop, side-swept e short-curl compaiono solo nei builder/report di review e non nel renderer di partita; la tavola multivista conferma effetto casco, quindi la loro quarantena e' corretta. Le preview p6/p10 mostrano due tagli adulti distinguibili; il bundle NoEdge senza numero p e' invece una sola capigliatura spettinata, non una collezione di varianti. Non e' stato trovato alcun file locale del modello CatBYTE, nonostante la pagina commerciale riporti componenti modulari. | PASS prevenzione regressione: nessun capello a casco puo' essere caricato dall'app. La combinazione p6+p10 resta la più piccola scelta esterna con due silhouette credibili; e' ancora un'ipotesi fino al fit. | Attendere un solo asset esterno disponibile per il gate reale. La base CGTrader resta in uso nei test tecnici; nessuna pubblicazione o modifica di produzione. |
| 22/09/2026, 09:16 | Creato il contratto riproducibile per il fit di capelli/barba esterni sulla testa CGTrader. | Il probe sul file acquistato misura head.x a [0, 0,01128, 1,56076] m e la mesh volto part_00000001.005 a 4.544 vertici, con bounds completi salvati in JSON. Il gate ora impone review quattro lati, pesi/parenting testa, prova dribbling, palette colori e misura triangoli/draw call prima del renderer. | PASS preparazione del test: non e' un'approvazione di p6/p10 e non modifica asset di gioco. | Appena un file esterno è disponibile, il gate produrrà un esito verificabile su fit, animazione e budget mobile. |
| 22/09/2026, 09:25 | Review visiva e scheda tecnica del nuovo “Male Soccer Player” di Hisenberg su CGTrader. | La preview pubblica mostra un calciatore adulto in kit completo, con volto e proporzioni leggibili; l’asset dichiara FBX/GLB/BLEND/OBJ, rig, UV/PBR verificati da CGTrader e 16.134 poligoni / 15.865 vertici, circa la meta della base acquistata. La pagina mostra pero` una sola identita` visiva, un solo taglio corto, nessuna barba/baffo modulare, nessun LOD e nessuna clip inclusa dimostrabile. | CANDIDATO DI RISERVA, non acquistato né adottato: il budget e il kit sono migliori, ma non aggiunge la varieta` di volto/capelli richiesta e imporrebbe nuovamente audit rig, dribbling+palla, transizioni e telefono. La base CGTrader acquistata resta preferibile per qualita` del volto e lavoro tecnico gia` svolto. |
| 22/09/2026, 09:35 | Review visiva e tecnica della base Realistic Man Modular G1 Low-poly di NoEdge su Fab. | La scheda dichiara Blender/FBX/GLB, corpo e materiali modulari, rig per Unreal/Unity e oltre 125 morph facciali; la Standard License visualizzata costa 25,52 €. Le preview mostrano un uomo adulto molto muscoloso e maturo, con un solo taglio corto mostrato e senza kit calcio. La scheda non dichiara un conteggio triangoli, LOD, barbe o tagli alternativi compresi. | RIFIUTATO come sostituto diretto: e` una base tecnica ricca, ma non rispetta il tono visivo (calciatore credibile e simpatico) e non prova la varieta` richiesta. Potrebbe essere valutato solo con un file legittimamente disponibile, ma non giustifica un acquisto a questo stadio. CGTrader resta la base migliore gia` disponibile. |
| 22/09/2026, 09:45 | Valutato il pack ArtStation “Realtime game ready men beard hairstyle male hair”. | Le preview mostrano capelli e barba adulti realistici; la scheda dichiara FBX/OBJ, 11k triangoli, texture 4K/2K e hair-card, con tre mappe albedo. Richiede esplicitamente due-sided lighting e cull-backface disattivato. La stessa pagina segnala “This product is not available in your region”; il prezzo di licenza estesa e` USD 54,90. | RIFIUTATO per la POC: un solo modulo da 11k sarebbe gia` oltre il budget Hero preferito prima del corpo, e il doppio lato aumenta il costo di fill-rate su telefono. L’indisponibilita` regionale impedisce comunque un test reale. Nessun acquisto o login. |
| 22/09/2026, 10:00 | Audit diretto dell’archivio allegato “FREE 21 Realtime man Hairstyles collection”. | Licenza `CC-BY-4.0` verificata nel file incluso: uso commerciale consentito con attribuzione. Il GLB contiene 16 mesh capelli separate, ma nessuna armatura; i nomi interni indicano `female_basemesh` e la tavola renderizzata mostra bob, code, frange e capelli lunghi chiaramente femminili. I singoli mesh vanno da 3.947 a 31.566 triangoli (totale scena 915.392); i quattro piu` leggeri non sono tagli maschili credibili. | RIFIUTATO per Korward: licenza buona ma contenuto/fit errati e nessun rig. Non verra` adattato o forzato sulla testa CGTrader. Questo evita capelli femminili, caschi o mesh eccessivi in partita. |
| 22/09/2026, 10:15 | Riesaminata la disponibilita` e la licenza di Realistic Male [Rigged] CatBYTE. | La pagina ufficiale conferma file Blender/FBX/textures, componenti separati (occhi, capelli corti, baffi, barba, sopracciglia e shorts), rig facciale, opzioni variante e Extended Commercial License a USD 12,20. Conferma anche 60.992 triangoli e non dichiara LOD o un kit da calcio. | RIFIUTATO come rosa mobile e non acquistato: la modularita` e` interessante, ma il corpo base e` quasi il doppio del CGTrader e non puo` essere assunto idoneo a 11–16 fps senza una prova. Potrebbe essere riesaminato soltanto come test separato se sara` autorizzato un acquisto, con decimazione, kit e dribbling tutti da rifare. |
| 22/09/2026, 10:30 | Pre-screen della raccolta gratuita Sketchfab “FREE Male Fashion Hair collection 01 lowpoly”. | La licenza e` CC-BY 4.0 e l’autore dichiara 21 tagli, FBX/OBJ/DAE e texture 1K; ma la scheda misura 694.300 triangoli / 467.700 vertici e il viewer ufficiale avvisa che il modello e` troppo pesante per essere renderizzato correttamente. Un commento tecnico riferisce inoltre mesh unica senza UV/texture nel download, in contrasto con la descrizione. | RIFIUTATO prima del download: non e` adatto al budget mobile e non garantisce neppure separazione/importazione affidabile. Nessun asset viene acquisito. |

## 2026-09-22 — verifica librerie capelli gratuite

- **Candidata da testare:** CGTrader *Male Hairstyle Short01 Low Poly Game Ready Model* (Xandra3D): taglio maschile a hair-card, 575 poligoni, texture PBR, UV, FBX/OBJ, licenza Royalty Free. La qualità visiva e l'adattamento alla testa CGTrader restano da verificare sul file reale.
- **Alternativa esclusa dal test prioritario:** *Digital Human Hair 01/04* (3d-souemonks): licenza Royalty Free e tagli maschili, ma circa 22 MB di OBJ ciascuno e conteggio poligoni non dichiarato; non adatti al test mobile prima dell'audit del file.
- **Non disponibile senza abbonamento:** Blendkit *Male Hair Cards*, 5.429 poligoni, visualmente coerente e con licenza Royalty Free, ma accessibile soltanto con Full Plan.

**Prossimo gate:** scaricare tramite account CGTrader il file Short01, importarlo in una copia locale del modello acquistato, controllare dimensioni/posizionamento/materiali e rendere un confronto del profilo.

## 2026-09-22 — tentativo download reale di Male Hairstyle Short01

- **Fatto verificato:** l'account CGTrader dell'utente è autenticato; la pagina ha preparato FBX (`Male_Hair_Short01.fbx`, 64,4 KB), OBJ e `Textures.zip` (7,13 MB).
- **Blocco verificato:** al click del file, Chrome reindirizza a `secure-files.cgtrader.com` ma lo blocca con `ERR_BLOCKED_BY_CLIENT`. Anche il browser isolato di Codex riceve lo stesso blocco. Non è stato adottato alcun aggiramento del filtro.
- **Conseguenza:** l'audit e il fit non possono iniziare finché il file non viene scaricato manualmente e reso disponibile nel workspace/Drive.

## 2026-09-22 — esito dopo login browser

- **Fatto verificato:** l'account CGTrader è autenticato e il link firmato a `Male_Hair_Short01.fbx` è stato rigenerato.
- **Fatto verificato:** il download resta bloccato localmente dal browser su `secure-files.cgtrader.com` con `ERR_BLOCKED_BY_CLIENT`; non è un errore di login e non verrà aggirato.
- **Stato:** il candidato resta valido sulla carta, ma il fit tecnico e visivo richiede che `Male_Hair_Short01.fbx` e `Textures.zip` arrivino manualmente nel workspace o come allegato.

## 2026-09-22 — candidato capelli + barba separati

- **Candidato esaminato:** [Game Hair — Man Real-time Hairstyle, Beard and Eyebrows](https://www.cgtrader.com/3d-models/character/man/game-hair-man-real-time-hairstyle-beard-and-eyebrows), CGTrader, licenza Royalty Free, $25.
- **Fatti verificati:** FBX/OBJ; capelli, barba e sopracciglia sono mesh e texture separate; 12.500 triangoli capelli, 4.200 barba e 2.350 sopracciglia; quattro mappe texture da 4K; la pagina dichiara un LOD1 da 15.516 facce e controllo tecnico CGTrader.
- **Valutazione:** risolve bene la richiesta di barba/baffi e non è cartoon, ma offre una sola acconciatura e le texture 4K sono eccessive per il target mobile. Può diventare candidato solo con riduzione a 1K/512 e audit locale su testa/animazione.
- **Decisione:** non acquistato né adottato. Il candidato gratuito `Male Hairstyle Short01` resta prioritario appena il download non bloccato sarà disponibile.

## 2026-09-22 — controllo LOD sul modello attivo

- **Fatto verificato:** sono state rigenerate le anteprime materiali locali Hero e LOD1 per un confronto controllato; non implicano promozione del LOD.
- **Fatto verificato:** `tools/validate_cgtrader_lod.py` passa su Hero, LOD1 e LOD2: un solo skin, 68 joint runtime, 7 primitive pesate per asset, nessuna animazione incorporata inattesa.
- **Vincolo aperto:** la validazione garantisce rig e pesature, non la qualità percepita né gli FPS mobili. Rimangono obbligatori il review visivo dei LOD, il motion test con clip e il benchmark reale mobile.

## 2026-09-22 — verifica della preview pubblica

- **Fatto verificato:** il link pubblico con `hyperCharacter=cgtrader-squad-review` apre la revisione azioni e carica il flusso partita; il contatore desktop ha oscillato tra 48 e 60 FPS.
- **Limite della prova:** nel browser di verifica il canvas della scena rimane vuoto durante l'azione. Non è evidenza né di corretto rendering né di difetto del modello: questa superficie non sostituisce il dispositivo mobile reale.
- **Conseguenza:** restano obbligatori screenshot/video mobile su scena renderizzata, controllo scala dei giocatori, pose, kit, capelli e sincronismo palla prima di ogni promozione.

## 2026-09-22 — dribbling CGTrader ripetibile su Chrome locale

- **Fatto verificato:** il harness visuale ora individua automaticamente Chrome installato su Windows quando manca Chromium interno di Playwright; il controllo sintattico passa. Commit locale: `22df781`.
- **Fatto verificato:** `cgtrader-dribble-closeup-review.mjs` si completa senza errori sul rig CGTrader. Le sue asserzioni congelano i contatti sinistro, destro, sinistro con Hero LOD0, ancoraggio `foot-bone` e distanza palla-piede entro 25 cm.
- **Misure dell'evidenza:** distanza ai tre contatti `0 m`; spostamento mano sinistra `0,220 m`, mano destra `0,103 m`; estensione massima mano-corpo `0,487 m` (< `0,65 m`): entrambe le braccia partecipano e non formano una T-pose.
- **Perimetro:** è un gate di dribbling Hero in test locale. Non prova ancora transizioni complete, folla/squadra completa o prestazioni su dispositivo mobile.

## 2026-09-22 — scala squadra CGTrader in partita

- **Fatto verificato:** `cgtrader-closeup-review.mjs` inizializza il renderer `ready-cgtrader-mixed-lod-benchmark` senza errori e misura 23 scheletri nella scena.
- **Esito scala:** Hero LOD0 `1,874 m`; altri giocatori LOD1/LOD2 tra `1,772 m` e `1,830 m`. Tutti rientrano nel gate tecnico `1,4–2,6 m`: nessun gigante nella scena di test.
- **Limite:** il dato è la misura dello scheletro nel renderer locale; il collaudo mobile resta necessario per giudicare la percezione dalla camera e la qualità visiva dei LOD.

## 2026-09-22 — fase del passaggio

- **Fatto verificato:** `verify_ground_pass_phase.mjs` passa: contatto a `0,250 s` contro wind-up visivo a `0,270 s`, errore `20 ms`; distanza centro-palla/piede `0,104 m`, entro il raggio della palla.
- **Esito:** PASS condizionato per tempo del gesto e contatto geometrico. Non prova da solo il mixer crossfade o la resa mobile.

## 2026-09-22 — continuità passaggio → corsa

- **Fatto verificato:** la posa finale `pass` e la posa iniziale `jog` hanno radice locale coincidente (`0 m`), ma non sono equivalenti: delta massimo `41,958°` sul polpaccio sinistro; braccio inferiore destro `25,441°`, braccio superiore destro `23,483°`.
- **Esito:** il contatto del passaggio è corretto, ma il gate transizione resta **APERTO**. Uno stacco diretto sarebbe visibile; serve osservare nel renderer un crossfade effettivo e poi ripetere la prova su mobile.

## 2026-09-22 — accesso browser e disponibilità fonti esterne

- **Fatto verificato:** l'accesso nel browser Chrome è disponibile e MetaPerson è stato aperto per il test del generatore.
- **Fatto verificato:** il candidato gratuito CGTrader `Male Hairstyle Short01` non è stato scartato; il suo download firmato raggiunge Chrome ma viene fermato localmente con `ERR_BLOCKED_BY_CLIENT` prima del trasferimento.
- **Conseguenza:** il blocco non dipende dalle credenziali CGTrader. Non viene aggirato e non sono stati modificati asset, ramo `main` o pubblicazione.
- **Prossimo passo:** completare il test/esportazione dal generatore MetaPerson e sottoporre qualunque file ottenuto al gate locale di compatibilità, peso, volto e animazione prima dell'adozione.

## 2026-09-22 — stato effettivo della sessione MetaPerson

- **Correzione verificata:** nella finestra Chrome controllata, MetaPerson mostra ancora il pulsante `Sign In`; non risulta quindi autenticata nel servizio, anche se Chrome è aperto con una sessione utente.
- **Decisione:** non viene creato né scaricato un avatar dalla sessione non autenticata. Il pacchetto CGTrader acquistato resta la base attiva della POC e non è stato scartato.
- **Azione necessaria:** completare manualmente l'accesso nel servizio MetaPerson nella sua pagina; dopo l'accesso posso scegliere un campione adulto maschile e avviare il download, che sarà poi analizzato localmente.

## 2026-09-22 — prima valutazione visiva MetaPerson

- **Fatto verificato:** il campione gratuito dell'editor è stato visualizzato: volto adulto credibile, proporzioni facciali naturali e capelli corti ordinati; non presenta occhi caricaturali né geometrie anomale sulla testa.
- **Limite verificato:** la preview mostra solo un busto con abbigliamento generico a righe. Non dimostra kit calcistico, topologia, rig, LOD, licenza d'uso nel gioco o compatibilità con le clip.
- **Decisione:** MetaPerson resta un candidato esplorativo per il volto, non sostituisce il modello CGTrader. Potrà essere valutato come base solo dopo un export autorizzato e i gate locali su rig, animazione, scala e prestazioni mobile.

## 2026-09-22 — correzione del candidato MetaPerson con audit locale esistente

- **Fatto verificato:** sono gia presenti e analizzati tre campioni maschili ufficiali MetaPerson. Il migliore (`model5`) ha volto adulto, capelli separati da 17.249 triangoli, barba corta nativa e 129 shape key; e quindi nettamente piu flessibile del CGTrader per viso e dettagli.
- **Fatto verificato:** lo stesso `model5` pesa 68.758 triangoli, non ha un kit da calcio, e fallisce due provini locali del dribbling: il trasferimento delle clip deforma busto e gambe fino a renderli non leggibili. Il rig ha 65 nomi anatomici compatibili su 65, ma assi e posa di riposo sono incompatibili con l'attuale retargeter.
- **Decisione corretta:** MetaPerson non e un sostituto pronto per la POC corrente. Il CGTrader resta il modello attivo perche ha gia superato il gate locale del dribbling con palla e braccia coordinate. MetaPerson puo restare una fonte futura per il sistema volti, solo con un retargeter dedicato e nuovi LOD.
- **Conferma tecnica esterna:** la documentazione ufficiale dichiara export GLB/glTF/FBX, LOD 1/2 e texture fino a 1K; queste opzioni non correggono da sole il fallimento di retarget e il kit civile.

## 2026-09-22 — Human Generator trial scaricato e ispezionato

- **Fatto verificato:** la trial ufficiale e presente localmente, senza installazione: add-on `5.059.083` byte e contenuto `269.224.756` byte.
- **Fatto verificato:** il contenuto mostra anteprime di numerosi tagli maschili, barbe e baffi, ma sblocca come geometria effettiva un solo taglio (`Short Side Part`) e un solo outfit maschile. Non e presente un kit da calcio pronto; la pose `football_kick` e solo una preview di posa.
- **Valutazione:** la trial e sufficiente per verificare compatibilita Blender, rig, export, haircards e qualita di un capello, ma non puo dimostrare una libreria di varianti utilizzabile nel gioco.
- **Prossimo gate:** installazione isolata della trial nel Blender locale, creazione del solo maschio disponibile, export e audit tecnico. Nessuna pubblicazione, acquisto o modifica al ramo `main` e prevista.

## 2026-09-22 — preflight statico dell'add-on Human Generator

- **Fatto verificato:** il codice della trial dichiara compatibilita Blender `3.2+`, include l'export FBX e glTF, e fornisce LOD corpo 0/1/2. Il LOD del corpo e irreversibile; il LOD dei vestiti usa decimazione separata.
- **Rischio da misurare:** la dichiarazione minima non certifica Blender `4.5.14`, il rig esportato, i pesi, la qualita delle haircards o la resa con la clip di dribbling. Il preflight non sostituisce l'esecuzione isolata.
- **Criterio di ingresso al test:** prima creare il solo campione trial, poi produrre un GLB/FBX LOD0 e LOD2, controllare triangoli, ossa, materiali, capelli e clip. Solo dopo potra essere confrontato con CGTrader.

## 2026-09-22 — preview Fab Soccer Player Male - Rigged

- **Fatti verificati:** la scheda Fab offre FBX, GLB, OBJ e Blender, rig e kit completo; dichiara topologia pronta per animazione e scala reale. Il prezzo visualizzato e `15,94–21,26 EUR` secondo licenza.
- **Review visiva:** la preview mostra un uomo molto generico, senza capelli o varianti visibili, in T-pose e con kit a strisce blu/rosse che richiama una livrea esistente. La pagina non dichiara poligoni, texture, LOD o numero reale di moduli.
- **Decisione:** non acquistare. Non dimostra un vantaggio sul CGTrader per qualita del volto, personalizzazione o mobile; resta fuori dalla POC finche il venditore non fornisca dati tecnici e varianti verificabili.

## 2026-09-22 — review NoEdge p6 capelli e barba

- **Fatti verificati:** la preview mostra una singola silhouette maschile adulta con riga laterale, barba e baffi. La scheda dichiara materiali con colori radice/punte regolabili, supporto Blender/FBX/GLB e prezzo `20,20 EUR` su Fab.
- **Limite tecnico:** la scheda CGTrader dello stesso p6 dichiara `24.404` poligoni per l'asset. Per aggiungerlo al CGTrader, il solo dettaglio capelli/barba sarebbe vicino al costo di un intero giocatore LOD1 e richiederebbe decimazione e fit non ancora dimostrati.
- **Decisione:** non acquistare p6. E una singola acconciatura credibile, non una libreria, e non porta un vantaggio verificato proporzionato al costo e al budget mobile. La ricerca continua su una base modulare completa o sulla prova Human Generator.

## 2026-09-22 — confronto con Realistic Soccer Player V2 su Fab

- **Fatti verificati:** la scheda [Realistic Soccer Player V2 — Rigged](https://www.fab.com/listings/914995a2-86f0-4a86-b5f1-b084e2e273d0?lang=en) dichiara uomo adulto riggato, FBX/GLB/OBJ/Blender, topologia `17.891 / 17.501`, prezzo `15,94–21,26 EUR` e un file Blender da `118,44 MB`.
- **Review visiva:** la preview mostra un calciatore adulto con capelli corti naturali e kit bianco semplice. Non espone capelli modulari, barbe, morph facciali, LOD verificabili, animazioni comprese o prove sul rig. La qualità del volto e della divisa non dimostra un vantaggio netto sul CGTrader gia acquistato.
- **Decisione:** non acquistare. E piu leggero sulla carta, ma non riduce i rischi rimasti (varianti, compatibilita delle clip, mobile) e richiederebbe un nuovo audit completo. Il CGTrader resta la base attiva; la ricerca continua su fonti che aggiungano varianti reali e verificabili.

## 2026-09-22 — screening MB-Lab come generatore open source

- **Fatti verificati:** MB-Lab e un generatore open source per Blender `4.0+` con parametri volto/corpo e shader capelli; MakeHuman distribuisce gli asset base in CC0. Non sono state installate o eseguite nuove estensioni.
- **Valutazione:** non e una scorciatoia per Korward: richiede costruire da zero kit da calcio, LOD, pesi e compatibilita con le clip. I suoi punti di forza (morph di corpo/volto) non risolvono i rischi oggi prioritari del modello attivo: gesto, kit, mobile e integrazione.
- **Decisione:** non avviare un test MB-Lab. Il suo costo tecnico e superiore al beneficio rispetto al CGTrader, gia riggato e verificato nel dribbling. La ricerca resta aperta per un asset completo o per l'audit Human Generator isolato, se autorizzato.

## 2026-09-22 — Avaturn supera il primo gate strutturale

- **Fatti verificati:** Avaturn dichiara avatar realistici GLB, rig umanoide, capelli ricolorabili e compatibilita Mixamo. Il sito creatore e bloccato da Zscaler, ma un campione pubblico e stato ispezionato solo per audit: `31.181` triangoli, 11 mesh pesate, 55 bone deformanti e due mesh capelli separate.
- **Prova locale:** il rig ha trovato 52/52 ossa nel trasferimento della clip Korward `dribble`, senza trasformazioni non finite. Le mani percorrono `0,6011 m` e `0,4288 m`; i piedi `0,8895 m` e `0,8610 m`. A differenza di MetaPerson, la posa non collassa nel primo test strutturale.
- **Limiti e decisione:** il campione e dichiarato non commerciale e non viene adottato o pubblicato; manca kit da calcio, LOD e review visiva. Avaturn diventa un candidato promettente da provare con un export ufficiale, mentre il CGTrader resta attivo. Gate completo: [AVATURN_PUBLIC_SAMPLE_GATE.md](AVATURN_PUBLIC_SAMPLE_GATE.md).

## 2026-09-22 — Avaturn non proporzionato al budget del progetto

- **Fatto verificato:** la pagina prezzi ufficiale Avaturn presenta il piano Pro a `$800/mese`, che include l'upload di capi personalizzati; la documentazione indica API e Web SDK come funzioni del pacchetto a pagamento.
- **Conseguenza:** l'avatar base puo essere esportabile, ma non esiste evidenza che la nostra divisa da calcio possa entrare nel configuratore gratuito. Il requisito kit renderebbe necessaria una spesa ricorrente sproporzionata, oltre al blocco Zscaler.
- **Decisione:** Avaturn non viene perseguito come modello Korward. Il test rig positivo resta evidenza comparativa, mentre il CGTrader rimane la base economicamente e tecnicamente piu concreta.

## 2026-09-22 — ritratto neutro Hero CGTrader rigenerato

- **Fatto verificato:** e stata generata una preview locale a 640×640 dal GLB CGTrader, con texture sorgente non alterata e inquadratura ravvicinata di capelli, volto, collo e spalle: `cgtrader-hero-profile-neutral-review.png`.
- **Perimetro:** e un artefatto di review, non una modifica del modello, del kit, del runtime o del ramo `main`.
- **Criterio successivo:** la preview consente di giudicare il volto senza l'effetto della camera partita; il verdetto estetico resta separato dai gate tecnici gia superati e dai gate ancora aperti (transizioni e mobile).

## 2026-09-22 — audit statico del taglio Human Generator incluso nella trial

- **Fatto verificato:** l’archivio trial contiene il file Blender effettivo `hair/head/Short Side Part.blend`, oltre alla sua configurazione: i sistemi `hair_short_fade` e `hair_parted_side` hanno rispettivamente 1.000 e 100 ciocche guida, con rendering a percorsi (`PATH`). Non è una sola anteprima.
- **Fatto verificato:** il file apre in Blender 4.5.14 con `--factory-startup --disable-autoexec`; contiene una base `HG_Body` da 50.568 triangoli e due sistemi particellari capelli. È stata generata una preview locale neutra in `humgen-trial-short-side-part-preview.png`.
- **Limite verificato:** questo taglio non è ancora haircards o GLB da runtime; il file non dimostra rig, kit da calcio, esportazione, retarget del dribbling, LOD finale, licenza Commercial o prestazioni mobili. Non è stato installato né attivato l’add-on.
- **Decisione:** Human Generator resta un candidato di qualità per variare adulti, capelli e barba, ma non può sostituire ora il CGTrader. Il CGTrader resta l’unica base che ha già superato il provino locale di dribbling con braccia e palla coordinate.
- **Prossimo gate:** con autorizzazione esplicita all’installazione isolata della trial, creare il solo maschio sbloccato, convertire una capigliatura in haircards, esportare e sottoporla ai gate rig/clip/scala/mobile.
- **Precisazione verificata:** `Short Side Part.blend` non contiene un’armatura né shape key facciali; l’unica mesh `HG_Body` ha due gruppi vertice (`hair_scalp_full`, `hair_fade_mid`) usati come supporto ai due sistemi particellari. È materiale sorgente per l’add-on, non un personaggio esportabile da provare direttamente con le clip.

## 2026-09-22 — provino dribbling del rig Human Generator trial

- **Fatto verificato:** la base `HG_HUMAN.blend` inclusa nel trial contiene un rig `HG_Rig` di 102 ossa, 79 gruppi pesati sul corpo e 24 shape key correttive. Confrontata con la clip Korward `dribble`, tutte le 21 ossa centrali necessarie (spina, collo/testa, braccia/mani e gambe/piedi) trovano una corrispondenza; nessuna manca.
- **Fatto verificato:** nel provino locale a 42 frame, mani, piedi, gambe e testa restano sempre con coordinate finite. Le mani percorrono `0,4495 m` e `0,2956 m`; i piedi `0,8387 m` e `0,8107 m`, su corpo alto `1,8004 m`. Il report riproducibile è `humgen-trial-dribble-probe.json`.
- **Limite essenziale:** è una copia di rotazione locale su rig sorgente: non include traslazione radice, palla, kit, conversione haircards, export GLB, review visiva o benchmark mobile. La base nuda pesa già 73.488 triangoli contando corpo, occhi e denti: serve LOD reale prima di qualunque test squadra.
- **Decisione:** Human Generator supera il primo gate strutturale del rig e resta il candidato alternativo più concreto per volti/capelli/barba. Non sostituisce il CGTrader finché non passa i gate completi e la licenza Commercial.
- **Evidenza locale:** generato `humgen-trial-male-profile-neutral.png`, ritratto neutro della base maschile trial per review del volto. Non è un render del gioco né prova di licenza/integrazione; il giudizio estetico resta aperto.
- **Budget mobile verificato:** il contenuto trial include 127 texture per `126.006.024` byte non compressi, fra cui mappe viso 4K da `9.880.081` e `7.545.471` byte e mappe denti 2K. Il sorgente Human Generator non può quindi entrare nel runtime tal quale; può restare candidato solo se la pipeline isolata dimostrerà bake e LOD con texture ridotte.

### Hisenberg `Soccer Player Male - Rigged` — confronto 22 settembre 2026

La nuova scheda dello stesso autore del modello acquistato dichiara modello maschile adulto riggato in FBX/GLB/OBJ/BLEND, `11.816` poligoni e `11.457` vertici, texture PBR da 19,1 MB e licenza Royalty Free senza AI a `$14,27`. La preview mostra kit a righe blu/rosse; non dichiara tagli, colori capelli, barba, morph, LOD o compatibilità con le clip. È un possibile NPC a minore dettaglio, ma **non è un upgrade da acquistare**: il LOD1 derivato dal CGTrader attivo è già misurato a 12.243 triangoli con rig validato e texture 1K. Senza file da audit, un passaggio di dribbling e una review visiva, introdurrebbe un secondo stile e un secondo rig senza risolvere le varianti richieste.

### `Male Soccer Player Character Fully Rigged UE project files` — rifiutato alla preview

La scheda CGTrader del 2 settembre 2026 dichiara FBX/BLEND/progetto Unreal, rig facciale e licenza Royalty Free a `$40` in offerta. Tuttavia non dichiara triangoli, LOD, texture o varianti. La preview pubblica mostra un volto troppo semplificato rispetto al realismo adulto richiesto e una divisa con simboli e branding chiaramente riconoscibili; non è una base neutra da rivestire. **Rifiutato senza acquisto**: prezzo elevato, costo mobile ignoto, estetica non approvabile e nessuna prova della compatibilità delle clip.
- **Evidenza visiva pronta:** renderizzati cinque frame del provino `dribble` in `humgen-trial-dribble-visual-review/contact-sheet.png`. È una review del solo corpo/rig trial, senza kit, capelli convertiti, traslazione radice o sincronismo palla; non costituisce ancora il gate animazione completo.
- **Export runtime verificato:** il `HG_HUMAN.blend` trial esporta in GLB senza l’add-on: 24.048.528 byte, 4 mesh, 73.488 triangoli, 1 skin da 102 joint, 4 materiali, 7 texture e nessuna animazione incorporata. Il report è `humgen-trial-raw-glb-audit.json`.
- **Gate mobile non superato:** la stessa export conserva una texture 4K e più mappe 2K; le immagini sono 16.723.687 byte codificati ma circa `125.829.120` byte RGBA decodificati. La compatibilità del formato è confermata, l’idoneità mobile no: LOD e riduzione texture restano obbligatori.
- **Confronto diretto verificato:** il GLB CGTrader sorgente misura 34.995 triangoli, 14.309.844 byte e circa 83.886.080 byte RGBA decodificati; l’export Human Generator grezzo misura 73.488 triangoli, 24.048.528 byte e circa 125.829.120 byte RGBA. Prima di kit e capelli, Human Generator è quindi +110% triangoli e +50% memoria texture. Decisione invariata: CGTrader resta base runtime, Human Generator è candidato soltanto come generatore di varianti dopo LOD/bake provati.
- **Correzione della review volto:** la prima preview della base Human Generator era stata renderizzata senza le texture vicine al file `.blend`; è stata sostituita dall’evidenza corretta `humgen-trial-male-profile-textured.png`, generata dopo l’estrazione temporanea delle texture sorgenti. Solo questa seconda anteprima va usata per giudicare volto e pelle.
- **Correzione review dribbling:** la sequenza `humgen-trial-dribble-visual-review/contact-sheet.png` è stata rigenerata con le texture sorgenti correttamente risolte. I render precedenti erano validi per la struttura del rig ma non per la valutazione estetica; per l’aspetto usare la sequenza aggiornata.
- **Decisione consolidata:** creato MODEL_SELECTION_GATE.md, che mette a confronto solo i candidati effettivamente verificati. CGTrader resta la base runtime; Human Generator resta generatore candidato, non adottato, fino a prova LOD/haircards/kit/palla/mobile.


## Aggiornamento 22 settembre 2026 — Character Creator 5 valutato

- **Fase:** ricerca di una base alternativa con varianti reali.
- **Fatto verificato:** Character Creator 5 offre Game Base da circa 10K poligoni, rig, morph viso/corpo, sistema capelli/barba, bake materiali e LOD. Il prezzo ufficiale e' `$299` Standard / `$479` Deluxe; kit da calcio e libreria adatta non sono inclusi nella prova.
- **Decisione:** candidato tecnicamente forte, ma non proporzionato al budget. Nessun acquisto o installazione; CGTrader resta il runtime, Human Generator trial resta il prossimo test pratico, previo consenso all'installazione isolata.
- **Licenza:** la policy Standard dichiara uso in giochi/app degli asset esportabili; per ogni contenuto CC aggiuntivo la licenza specifica va confermata prima dell'acquisto.

## Aggiornamento 22 settembre 2026 — scan di modelli calcistici e varianti

- **Fatti verificati:** il pacchetto con 30 capelli e' stilizzato e pesa 87.784 poligoni; il modello Parker con rig facciale pesa 105.366 triangoli. Entrambi falliscono il gate estetico o mobile prima dell'acquisto.
- **Candidato da file-audit:** African Football Soccer Player Male gratuito dichiara rig e 15 animazioni, ma mancano dati su triangoli, LOD, morph e modularita'. Non e' ancora adottato.
- **Decisione:** non cambiare base e non acquistare. Prosegue l'audit di fonti gratuite e il test Human Generator isolato quando autorizzato; MetaPerson verra' misurato solo quando il browser controllato potra' usare l'accesso.

## Aggiornamento 22 settembre 2026 — audit Vitruvian CC0

- **Fatto verificato:** il candidato open-source Vitruvian ha volto FACS e rig Mixamo, ma la sua combinazione cruda supera 385.500 triangoli e circa 193 MiB di texture decodificate.
- **Decisione:** non adottare: manca il kit da calcio, i componenti sono separati e il budget mobile fallisce prima del retarget. Resta soltanto una fonte di riferimento per un futuro sistema volti.
- **Prossimo criterio:** un candidato potra' sostituire il CGTrader soltanto se porta un adulto credibile con kit neutro, capelli/barba modulari e costo misurato inferiore al budget Hero/LOD.

## Aggiornamento 22 settembre 2026 — MHR / Character Factory chiuso sul PC locale

- **Fatti verificati:** MHR LOD3 pesa 9.794 triangoli e passa il primo probe del rig sul dribbling (21/21 ossa, nessuna coordinata non finita). Il generatore completo richiede pero' GPU NVIDIA/12 GB consigliati e 36,4 GB di pesi.
- **Preflight locale:** Intel UHD Graphics 620, 1 GB; requisito GPU non soddisfatto. Nessun download o installazione pesante viene effettuato.
- **Decisione:** MHR non e' testabile come generatore completo qui e non sostituisce CGTrader. Potra' riaprirsi solo con un export reale prodotto su host NVIDIA; la ricerca continua su asset gia' esportabili.

## Aggiornamento 22 settembre 2026 — African Football Soccer Player Male escluso

- **Fatti verificati:** la scheda CGTrader dichiara un uomo adulto riggato, PBR e 15 animazioni FBX, ma riporta `1.003.976` poligoni, `3.011.928` vertici, due FBX per `875 MB` e texture per `732 MB`.
- **Decisione:** non scaricare né adottare. Il peso supera di circa 29 volte il CGTrader attivo (34.995 triangoli) prima ancora di un audit di rig, kit, LOD e dribbling; fallisce quindi il gate mobile alla fonte.
- **Stato:** CGTrader Hisenberg acquistato resta la base runtime attiva. Human Generator trial resta il solo candidato alternativo con potenziale concreto per volti, capelli e barba, soggetto a LOD, kit, licenza e gate completi.

## Aggiornamento 22 settembre 2026 — accesso MetaPerson in attesa del browser

- **Fatto verificato:** il tentativo di aprire MetaPerson nella sessione Chrome esistente viene rifiutato dal browser: un'interfaccia dell'estensione PDF e' aperta e Chrome blocca l'automazione delle nuove schede.
- **Nessuna inferenza sull'accesso:** non e' stato possibile vedere la pagina MetaPerson ne' verificare la sessione autenticata; non e' stato scaricato alcun file.
- **Azione necessaria:** chiudere o completare la pagina dell'estensione PDF in Chrome. A quel punto posso riaprire MetaPerson, verificare il login e scaricare un solo avatar campione per i gate locali. CGTrader resta invariato come base runtime.

## Aggiornamento 22 settembre 2026 — Football Team Player Pack (Fab) non promosso

- **Fatti verificati:** il pacchetto Fab dichiara 11 calciatori riggati, file Blender/GLB, animazioni e texture base 4K. La sola scena showcase dichiara `372.700` triangoli; la scheda non separa il costo dei singoli giocatori, non documenta LOD, non prova un rig comune e si dichiara generata con AI.
- **Decisione:** non acquistare né adottare sulla sola scheda. La varietà dichiarata è interessante, ma senza costo per personaggio, texture ridotte, prova del volto/kit e test di retarget potrebbe peggiorare prestazioni e coerenza. Non costituisce un miglioramento verificato sul CGTrader attivo.
- **Criterio per riaprire:** accesso a un sample gratuito o documentazione verificabile su triangoli per modello, risoluzione texture, LOD e scheletro. In assenza, il candidato resta fuori dalla POC.

## Aggiornamento 22 settembre 2026 — conversione Hair Generator trial non disponibile senza pipeline dedicata

- **Fatti verificati:** il file `Short Side Part.blend` trial contiene due sistemi particellari `HAIR`: 1.000 guide per `hair_short_fade` e 100 per `hair_parted_side`, con ciocche figlie. Non e' una mesh GLB pronta.
- **Prova isolata:** su una copia temporanea, Blender 4.5.14 ha convertito l'oggetto mantenendo invariati i `25.286` vertici e `25.324` poligoni del solo corpo e rimuovendo entrambi i modifier particellari. La conversione standard non produce una geometria capelli esportabile.
- **Decisione:** non aggiungere questo taglio al runtime e non simulare una libreria. Per una capigliatura Human Generator utilizzabile servono l'add-on/pipeline ufficiale che genera haircard o una nuova authoring controllata, poi gate di qualità, peso, rig e mobile.

## Aggiornamento 22 settembre 2026 — ActorCore escluso dal percorso Korward

- **Fatti verificati:** ActorCore dichiara adulti riggati con volto, capelli e materiali regolabili; gli ActorBUILD sono indicati intorno a `14K–20K` triangoli, ma con texture 4K e senza kit da calcio dedicato. Le loro schede precisano che la geometria non e' modificabile oltre ai materiali.
- **Compatibilita' Blender:** la pagina ufficiale dell'Auto Setup pubblica supporto Blender 2.8; la cronologia AccuRIG segnala inoltre che personaggi A-pose esportati in Blender con motion ActorCore possono incrociare le braccia. E' incompatibile con il requisito prioritario di braccia coordinate nelle clip.
- **Decisione:** non creare account, non installare AccuRIG e non acquistare. Non risolve kit e varianti reali, e introduce un rischio animazione gia' documentato. CGTrader rimane la base runtime; Human Generator trial resta il test alternativo sotto consenso esplicito.

## Aggiornamento 22 settembre 2026 — Male Football Player Rigged (CGTrader) escluso

- **Fatti verificati:** il modello dichiara 14 divise e capelli con texture dedicate, ma costa `$79`, usa texture fino a 4K e dichiara esplicitamente che i formati di scambio non sono riggati. Il rig esiste solo nella scena 3ds Max CAT/V-Ray.
- **Decisione:** non acquistare. FBX/OBJ senza rig rendono necessaria una nuova riggatura e un retarget completo; il modello non offre LOD o varianti modulari dimostrate e fallisce l'obiettivo di una prova rapida e affidabile per Korward.

## Aggiornamento 22 settembre 2026 — shortlist consolidata

- Creata una sintesi verificabile dei candidati, delle esclusioni e del solo test con potenziale concreto: [MODEL_SHORTLIST_DECISION.md](MODEL_SHORTLIST_DECISION.md).
- Decisione invariata: CGTrader Hisenberg è la base runtime attiva; Human Generator trial è l'unico esperimento da completare per capelli/barba/volti, previa installazione isolata autorizzata.

## Aggiornamento 22 settembre 2026 — inventario completo del pacchetto CGTrader

- **Fatti verificati:** fra i file inclusi ci sono componenti separati per testa, mani, gambe, maglia e pantaloncini. `HEAD.glb` e' una sola mesh da `9.083` triangoli, con una sola texture `HEAD`; non contiene teste alternative, morph o tagli separati. `HANDS.glb` contiene solo due mesh mani per `5.076` triangoli.
- **File Earring:** l'FBX aggiuntivo e' un solo mesh da `50.000` triangoli, con mappe base/metallic/normal/roughness 4K; e' un accessorio distinto, non capelli, e supera da solo il budget Hero. Non viene integrato.
- **Decisione:** tutti i componenti utili del pacchetto sono stati controllati. Non esistono varianti nascoste di volto, barba o capelli da promuovere; la base CGTrader resta valida per rig e kit, mentre la varietà richiede un'altra pipeline verificata.

## Aggiornamento 22 settembre 2026 — nessun morph facciale nel pacchetto CGTrader

- **Fatti verificati:** `HEAD.fbx` contiene una sola mesh testa da `9.083` triangoli, senza armatura, gruppi peso o shape key. `NORMAL+RIG.fbx` contiene il rig e sette mesh pesate, ma ogni mesh ha `shape_keys: []`, compresa la testa.
- **Decisione:** non esiste un set di espressioni o volti alternativi nascosto da attivare. Le quattro varianti colore capelli restano texture sullo stesso volto/taglio; per differenziare realmente i giocatori serve una pipeline distinta, non una configurazione del pacchetto.

## Aggiornamento 22 settembre 2026 — licenza e prezzo Human Generator verificati

- **Fatti verificati:** la trial e' personale/portfolio e usa texture 4K con watermark: puo' servire solo al provino tecnico, non al runtime Korward. La licenza commerciale ufficiale costa `$128` una tantum per utente, include tutto il contenuto e dichiara esplicitamente l'uso in software e videogiochi, a condizione che gli utenti finali non possano estrarre e riutilizzare gli asset.
- **Compatibilita':** la pagina ufficiale Superhive dichiara Blender `3.6–5.2`; il Blender locale 4.5.14 rientra quindi nella versione dichiarata.
- **Decisione:** nessun acquisto ora. Se il provino isolato supera i gate tecnici e visivi, Human Generator diventa una proposta di acquisto concreta: costa meno di Character Creator 5 (`$299`) e sarebbe legalmente utilizzabile nel gioco con la licenza commerciale. La trial continua a essere solo una prova.

## Chiarimento licenza Human Generator per GitHub Pages

- **Fatto verificato:** la FAQ ufficiale chiarisce che software, videogiochi e siti con asset Human Generator sono consentiti con licenza commerciale. Indica come caso non consentito il rendere l'estrazione una funzione esplicita per gli utenti, ad esempio un pulsante di download.
- **Applicazione alla POC:** una build pubblicata su GitHub Pages non e' esclusa dalla FAQ per il solo fatto di essere un sito; l'app non deve offrire esportazione o download del modello, delle texture o delle sorgenti Human Generator. La licenza completa va conservata insieme all'acquisto.
- **Decisione:** il vincolo licenza non blocca il provino tecnico o una futura adozione commerciale. Restano da superare i gate qualitativi: kit, LOD, rig/clip, palla, transizioni e mobile.

## Capacita' Human Generator da verificare nel provino isolato

- **Fatti da documentazione ufficiale:** Human Generator offre generazione automatica di haircard, bake texture, esportazione tramite processing, LOD corpo `0/1/2`, decimazione separata dei vestiti, slider faccia/pelle/capelli/barba e rinomina di oggetti, materiali e ossa.
- **Limite dell'evidenza:** la documentazione non fornisce un conteggio garantito dei triangoli o memoria texture per il nostro umano finale. LOD1 abbassa volto e LOD2 l'intero corpo; questi valori devono essere misurati dopo l'installazione isolata e l'export reale.
- **Gate del provino:** generare il solo adulto trial, creare haircard, produrre LOD0/1/2 con bake ridotto, applicare il kit in copia, esportare GLB e rieseguire scala, rig, dribbling/palla, transizioni e benchmark mobile.

## Aggiornamento 22 settembre 2026 — trial Human Generator installata e provata in isolamento

- **Installazione verificata:** Human Generator `4.0.28` e `HG_Trial_Content.hgpack` sono stati installati con successo soltanto nel profilo temporaneo `C:\tmp\korward-humgen-isolated`; l'installazione Blender normale, il repository, `main` e GitHub Pages non sono stati modificati.
- **Preset e modularità effettivi:** il solo preset maschile realmente caricabile dalla trial è `Caucasian 1.json`; le altre voci maschili sono sole anteprime `.trial`. Anche capelli e barba mostrano molte anteprime, ma l'unico taglio con dati effettivi è `Short Side Part.json`; non è presente alcun preset barba/baffi `.json` caricabile.
- **Prova reale del taglio:** `Short Side Part` viene applicato al corpo e crea due sistemi particellari (`hair_short_fade` e `hair_parted_side`). Il rig prodotto ha 102 ossa; corpo, occhi e denti misurano insieme 73.488 triangoli valutati (corpo 50.568, occhi 10.560, denti 12.360), prima di kit e capelli convertiti.
- **Haircards non superato:** la conversione ufficiale dell'add-on fallisce nella trial perché manca `hair/haircards/HairMediumLength_zones.json`. Di conseguenza non sono stati creati haircard esportabili, né LOD/bake/GLB del personaggio pettinato. Non è corretto simulare una libreria capelli con la geometria particellare.
- **Review visiva verificata:** l'anteprima isolata mostra un volto adulto e il taglio corto credibili, ma anche la filigrana `TRIAL` sulla pelle. La trial resta quindi inutilizzabile nel runtime sia per licenza sia per resa visiva.
- **Decisione:** il test dimostra che Blender 4.5.14 e l'add-on funzionano; questa trial non può però superare i gate di varietà, haircard, LOD, kit, export e mobile. CGTrader resta l'unica base runtime. Human Generator commerciale potrà essere rivalutato solo con un provino completo prima di qualsiasi acquisto; nessun asset trial entra nel repository o nella build.
- **Prossimo criterio di chiusura:** proseguire con la base CGTrader e rifiutare ogni sostituto che non dimostri almeno un kit neutro, capelli mesh/haircard esportabili, LOD misurati, dribbling con palla e benchmark mobile.

## Aggiornamento 22 settembre 2026 — ricerca alternativa economica dopo Human Generator

- **AYMultiCharacter Male, $29 starter:** la scheda dichiara un generatore Blender con corpo da 5.304 triangoli, rig Rigify, variazioni viso/corpo e oltre 100 mesh; le versioni superiori costano $68,50 e $99. La pagina di valutazioni riporta però deformazioni inutilizzabili con Mixamo e un rig complesso da retargettare, oltre a risultati maschili talvolta femminei. **Escluso senza acquisto:** il rischio agisce direttamente su braccia, corpo e sincronismo delle clip Korward.
- **Character Generator v3, $79:** dichiara 24 capelli maschili, due barbe, rig facciale e molte varianti, ma la presentazione e le tag indicano un sistema cartoon/stilizzato. Non rispetta il volto adulto credibile richiesto e costa comunque troppo per un provino incerto. **Non acquistare.**
- **Nuovo Soccer Player Hisenberg, $14,27:** file GLB/FBX/BLEND, riggato e verificato dal marketplace, 17.891 poligoni. E' un potenziale NPC economico, ma non dichiara modularità capelli/barba/volto/LOD e userebbe un secondo rig dello stesso autore; non risolve il problema della varietà. **Non acquistare prima di un file-sample o di dettagli tecnici dal venditore.**
- **Fab Football Player:** nonostante il titolo, la scheda dichiara esplicitamente assenza di rig, kit brandizzato e asset generato con AI. **Escluso.**
- **Decisione:** la ricerca prosegue soltanto su candidati gratuiti o a basso costo che rendano verificabili prima dell'acquisto rig, peso, capelli mesh e licenza. CGTrader acquistato resta la base runtime finché nessun candidato supera questi fatti misurati.


## Aggiornamento 22 settembre 2026 — ritratti 2D come corredo leggero degli highlight

- **Decisione di prodotto:** il bersaglio non e' l'estetica da simulatore PES/FIFA. I volti servono soltanto a rendere riconoscibili profilo e momenti di racconto; la credibilita' della POC dipende da gesto completo, palla, camera, transizioni e fps mobile.
- **Implementato sul ramo POC:** primo ritratto editoriale 2D ottimizzato in WebP (`28.660` byte) e componente `HeroHighlightPortrait`. E' usato solo nella scelta dell'eroe e nel festeggiamento post-partita; non introduce canvas, renderer o carico nel live match.
- **Coerenza identita':** il pilota e' associato esclusivamente alla variante avatar `0`; tutte le altre varianti mantengono il loro ritratto locale finche' non avranno un equivalente, evitando di mostrare a un giocatore selezionato un volto diverso.
- **Verifica eseguita:** `npm run build:web` passa; l inventario animazioni resta a `23/35` clip manifest e rig da `65` joint, con le calibrazioni contatto ancora aperte. `validate:web` non parte perche Playwright non trova Chromium e il download va in timeout di rete. Questa modifica non promuove alcun gate di animazione, palla, transizioni o performance: restano aperti.

## Aggiornamento 22 settembre 2026 — registro ritratti Korward, pronto per i dati del gioco

- **Fatti verificati:** sono stati creati e ottimizzati `40` ritratti 2D reali (`10` fogli 2×2), tutti con fondale bianco neutro. Il set attuale comprende `28` calciatori (eroi, compagni e avversari) e `12` figure di contorno (mister, assistenti, agenti, giornalisti e commentatori). Il peso complessivo viene caricato come immagini statiche e non crea contesti WebGL nel live match.
- **Integrazione verificata:** ogni identità testuale risolve in modo deterministico lo stesso ritratto; la UI riceve nome, cognome e ruolo dal gioco. Il catalogo non li inventa né li memorizza. Per le nuove quattro scelte eroe, carnagione, colore/taglio capelli, statura e corporatura passano anche al renderer CGTrader nei contesti che usano `appearanceForAvatar`.
- **Figurina:** il formato editoriale Korward contiene ritratto, nome e ruolo; non mostra carnagione o altri tratti. Lo sfondo del volto resta bianco neutro. La cornice è predisposta per ereditare i colori del club; per ruoli non di squadra usa la palette Korward.
- **Verifica eseguita:** `npm run build:web` passa dopo il ripristino di una precedente corruzione locale nella scena di intervista; `git diff --check` non riporta spaziature errate. Nessuna modifica è stata inviata a `main`, a GitHub Pages o al ramo di produzione.
- **Limite esplicito:** `40` è il catalogo visivo effettivo di questa iterazione, non mille volti unici. L'obiettivo di mille identità va costruito per pacchetti di ritratti originali, evitando duplicati mascherati; nel frattempo il set è già sufficiente a non ripetere volti in una rosa, una partita e la relativa scena narrativa.
- **Prossimo lavoro:** riprendere i quality gate CGTrader: fps mobile, scala/proporzioni, dribbling con palla e braccia coordinate, transizioni e camera highlight.

## Aggiornamento 22 settembre 2026 — highlight CGTrader: roster cinematografico mobile

- **Problema verificato:** la revisione dal percorso `cgtrader-squad-review` non attivava il benchmark CGTrader e mostrava ancora corpi pieni; nell'anteprima sono stati letti `10 fps`. Il benchmark di squadra con LOD misti è stato inoltre provato nella stessa anteprima: la scena completa è rimasta a `4 fps`. Questi valori confermano che il collo di bottiglia non si risolve sostituendo tutti i 22 corpi con il solo LOD.
- **Implementato sul ramo POC:** il vecchio alias `cgtrader-squad-review` ora porta alla nuova review `cgtrader-highlight-optimized`. In questa review l'eroe usa il GLB CGTrader LOD0; per ogni highlight vengono renderizzati e aggiornati soltanto l'eroe, il portiere più vicino e i tre giocatori di movimento più vicini al pallone. Gli altri mantengono posizione e logica partita, ma non eseguono rendering né skinning dell'highlight. Il contatore mostra `corpi cinema 5`.
- **Coerenza del gesto:** non sono state modificate le clip, le finestre di contatto del pallone o il motore della partita. Il dribbling resta ancorato alle ossa piede del rig CGTrader; il portiere utile resta nel roster e conserva la sua clip di intervento.
- **Verifica eseguita:** `npm run build:web` e `npm run audit:animation` passano; l'inventario riporta `23/35` clip del manifest e rig da `65` joint. Anche `npm run audit:animation-performance` termina senza errori. Nessuna modifica è stata inviata a `main`, GitHub Pages o produzione.
- **Gate ancora aperto:** il guadagno fps del roster da cinque corpi non è ancora misurato su telefono: il prossimo test deve rilevare fps, assenza di T-pose, scala in campo, palla-piede e transizione in almeno tiro, dribbling, passaggio e parata. La soglia di chiusura mobile rimane da definire dopo la prima misura reale.

## Aggiornamento 22 settembre 2026 — secondo passaggio performance highlight CGTrader

- **Intervento POC:** oltre al roster cinematografico, la review `cgtrader-highlight-optimized` usa su mobile pixel ratio massimo `1,0` invece di `1,5` e disattiva le ombre WebGL. Le ombre di contatto sotto i calciatori restano quelle leggere già costruite come blob shadow; kit, illuminazione e animazioni non cambiano.
- **Misura predisposta:** `window.__CPM_CGTRADER_RENDER_BUDGET()` espone esclusivamente nella scena i tre dati da verificare sul dispositivo: modalità cinema attiva, pixel ratio effettivo e stato delle ombre. Il roster espone inoltre `window.__CPM_CGTRADER_CINEMA_ROSTER` con il numero di corpi realmente visibili.
- **Verifica statica:** la build completa passa (`6.156 KB` JSX estratti, `4.161 KB` transpilati); `git diff --check`, inventario animazioni e baseline performance terminano senza errori. L'inventario resta `23/35` clip e rig `65` joint; i contatti da calibrare non vengono falsamente promossi.
- **Limite invariato:** nessun valore fps nuovo è stato dichiarato. Il test locale è servito a verificare che la build si carichi, ma il browser integrato non è un equivalente del telefono; il quality gate mobile richiede ancora una misura reale sul dispositivo.

## Aggiornamento 22 settembre 2026 — controllo roster e dribbling CGTrader

- **Correzione POC verificata:** il percorso storico `?hyperCharacter=cgtrader-squad-review` e il percorso esplicito `?hyperCharacter=cgtrader-highlight-optimized` mostrano entrambi `corpi cinema 5` nel contatore. I due percorsi attivano lo stesso roster cinematografico e lo stesso asset CGTrader LOD0; non esiste più un alias che mostri la modalità piena per errore.
- **Dribbling, evidenza ripetibile già raccolta:** il close-up del renderer ha fermato i tre tocchi della clip reale a `u=0,256` sinistra, `u=0,357` destra e `u=0,721` sinistra. In tutti e tre la palla è ancorata all’osso del piede (`foot-bone`), con distanza orizzontale misurata rispettivamente `0`, `0` e `0,001 m`. Le mani percorrono `0,248 m` e `0,111 m`; la massima apertura dal busto è `0,487 m`, sotto il limite anti T-pose di `0,65 m`. L’evidenza è in `tests/character-lab/evidence/cgtrader-dribble-closeup-review/report.json`.
- **Promozione limitata:** dribbling CGTrader passa **condizionatamente** il controllo tecnico palla-piede e corpo coordinato nella scena locale LOD0. Non promuove il gate complessivo: la misura non è telefono reale e non certifica ancora camera, transizione di entrata/uscita o performance.
- **Verifica eseguita ora:** `npm run build:web` passa (`6.156 KB` JSX estratti, `4.161 KB` transpilati); `npm run audit:animation` passa. L’audit continua correttamente a segnalare da calibrare `pass`, `kick`, `penalty`, `header`, `volley`, `dribble`, `tackle` e `slide-tackle` perché il suo manifest copre il rig sorgente a 65 joint e non deve fingere certificazioni del rig CGTrader a 76 ossa.
- **Prossimo criterio di chiusura:** misurare sulla nuova review lo stesso dribbling più una sequenza tiro/parata e una transizione di camera, con FPS reali su telefono e senza comparsa di corpi, T-pose, giocatori sovradimensionati o sganciamento della palla.

## Aggiornamento 22 settembre 2026 — correzione dribbling nella review cinematica

- **Difetto trovato e corretto:** la sincronizzazione palla-piede era già verificata nella review CGTrader LOD mista, ma la whitelist della routine non includeva ancora lo stato `ready-cgtrader-highlight-optimized`. Di conseguenza il dribbling della nuova review cinematica avrebbe usato il gesto senza il suo aggancio osseo. La whitelist ora include anche questa review.
- **Comportamento ottenuto:** nelle finestre autorevoli della clip (`sinistra 0,22–0,32`, `destra 0,32–0,44`, `sinistra 0,72–0,88`) la palla di scena segue il punto reale dell’osso piede; fuori dai tocchi resta nella posizione di conduzione. Il motore di gara, l’esito e la traiettoria non vengono alterati. La sonda di distanza piede-palla e il controllo pausa/ripresa sono ora disponibili anche sulla review cinematica per il collaudo mirato.
- **Verifica eseguita:** il JSX viene transpilato senza errori a `4.161 KB`; l’output `dist/index.html` è stato rigenerato e l’inventario della cartella asset completa `2,92 GB` (`967` file sorgente, `996` file nella dist inclusi i file di packaging). `npm run audit:animation` passa con `23/35` clip sorgente e `65` joint. `git diff --check` non segnala errori.
- **Gate:** il dribbling nel percorso cinematografico è ora pronto per una misura runtime, ma non è ancora certificato su telefono. Restano aperti: tiro/parata, transizione camera, scala, niente T-pose o pop-in, FPS reale.

## Aggiornamento 22 settembre 2026 — posizionamento del corpo nei gesti CGTrader

- **Diagnosi verificata:** il modello CGTrader fornisce rig e posa locale (gambe, braccia, busto). Posizione sul campo, angolo verso porta/palla, distanza dal marcatore e momento in cui parte la traiettoria del pallone dipendono dal direttore degli highlight. Il difetto osservato è quindi principalmente di regia/renderer, non una prova che il modello sia inadatto.
- **Misura sul GLB attivo:** la clip `kick` dell’asset LOD0 della review dura `0,4167 s`. Nel render di controllo del medesimo asset, con bersaglio palla di raggio `0,11 m`, il piede sinistro è a `0,090687 m` dal centro al frame `9`; ai frame `8` e `10` le distanze sono rispettivamente `0,226379 m` e `0,381074 m`. Il fotogramma 9 è quindi il solo contatto geometrico utile; è un dato di authoring, non ancora una misura del pallone runtime.
- **Intervento POC:** nella sola `cgtrader-highlight-optimized` il caricamento del tiro tiene la palla per `0,375 s`, in corrispondenza del frame 9 misurato; nell’ultimo tratto la palla di scena si aggancia al punto dell’osso piede sinistro e poi lascia al normale arco traiettoria/esito. Il root del giocatore, per `kick`, `pass`, `header` e `volley`, converge verso il bersaglio con una correzione raddoppiata ma continua: non viene teletrasportato né ruotato a scatto.
- **Osservabilità:** `window.__CPM_CGTRADER_KICK_TOUCH` espone fase della clip, tipo di aggancio e punto bersaglio durante il collaudo della review. Motore di partita, punteggio e logica dei risultati non sono stati modificati.
- **Verifica eseguita:** JSX transpilato a `4.163 KB`; `dist/index.html` rigenerato con inventario asset completo (`967` file sorgente, `996` nella dist di packaging); audit animazioni passa con `23/35` clip sorgente e `65` joint; `git diff --check` senza errori.
- **Gate ancora aperto:** la nuova sincronizzazione tiro richiede la ripresa runtime e il collaudo su telefono, insieme a portiere, camera e transizioni. Non e' una certificazione di qualità finale.

### 2026-09-22 — Correzione bloccante del renderer della review cinematica
- **Fatto verificato:** il collaudo locale della query `cgtrader-highlight-optimized` mostrava una canvas nera negli highlight. Il log ha individuato un `ReferenceError` del flag della review letto fuori dal suo ambito, dentro il ciclo di rendering. Non era un difetto del modello CGTrader.
- **Correzione applicata localmente:** il flag della review è ora esposto dal bootstrap della scena e le tre letture nel ciclo degli avatar usano quel segnale sicuro. La calibrazione del tiro legge inoltre la query senza dipendere da una variabile locale di un’altra funzione.
- **Verifiche eseguite:** JSX compilato; inventario animazioni passato (23 clip manifest, rig a 65 giunti); asset `cgtrader-review-lod0-kit-adapter.glb` presente nella build locale (16.97 MB); nuova sessione locale senza errori console legati a `localReview=directionFix2`; HUD osservato a 47 fps con `corpi cinema 5`.
- **Ancora aperto:** la canvas nella sessione locale non ha ancora prodotto un’inquadratura utile del gesto. Perciò non è ancora superato il gate visivo: tiro, passaggio, dribbling e portiere devono essere verificati con corpo, palla e porta nella stessa inquadratura.

### 2026-09-22 — Scala corretta e LOD graduato nella review highlight

- **Scala, causa misurata e corretta:** nella review il bounding box delle mesh skinnate restituiva un'altezza utile di `0,1 m`; il renderer trasformava quindi il corpo CGTrader fino a circa `18×` la scala prevista. La nuova misura usa l'altezza effettiva dello scheletro (`1,5607558 m`, `75` ossa) quando il bounding box non è attendibile. Nel runtime il visual del protagonista è passato da circa `18×` a `1,156× / 1,192× / 1,156×`; l'inquadratura di campo locale lo mostra ora con altezza coerente.
- **Overlay corretto:** nel solo percorso di review `cgtrader-highlight-optimized` il livello tattico 2D veniva disegnato sopra il canvas 3D e mascherava la scena. È ora nascosto solo in quel percorso locale, così la verifica vede effettivamente corpi, palla e porta. Il comportamento normale dell'app resta invariato.
- **Scelta LOD verificata:** provare i 22 calciatori in LOD0 ha prodotto `24–29 fps` nel browser integrato; non è accettabile come base mobile. La review ora carica LOD0 per eroe, LOD1 per giocatori inizialmente vicini all'azione e LOD2 per gli altri. Il limite cinematografico di cinque corpi visibili rimane attivo, evitando aggiornamento e skinning di un'intera rosa fuori scena.
- **Misura locale aggiornata:** nella scena ottimizzata il contatore ha riportato prima `30 fps`, poi `37 fps · corpi cinema 5`; il protagonista ha mantenuto scala root `1` e visual `1,156 / 1,192 / 1,156`. È una misura nel browser desktop integrato, non il gate mobile.
- **Verifica eseguita:** build `dist` rigenerata; inventario animazioni passato (`23/35` clip manifest, rig sorgente `65` joint). Restano volutamente aperte le calibrazioni manifest di passaggio, tiro, rigore, testa, volée, dribbling e contrasti.
- **Prossimo criterio di chiusura:** eseguire una scelta reale di dribbling e una di tiro/parata nella review, verificando in fotogramma corpo intero, orientamento verso palla/porta, contatto palla-piede, braccia non in T-pose e transizione camera; poi misurare gli stessi casi su telefono.

### 2026-09-22 — benchmark isolato viewport mobile e budget di rendering

- **Metodo corretto:** una misura iniziale a `9 fps` non era valida perché quattro schede di benchmark WebGL erano vive contemporaneamente e contendevano la GPU. Chiuse le sole schede locali di test, la misura è stata ripetuta con un'unica scena e viewport `393×852`.
- **Intervento POC:** il protagonista resta LOD0; i ventidue altri calciatori della review usano LOD2. Durante l'highlight ne vengono resi cinque (eroe, portiere utile e tre partecipanti), mentre gli altri restano fuori rendering. L'audit runtime conferma `lod0: 1`, `lod1: 0`, `lod2: 22`, `visible: 5`, `total: 23`.
- **Risultato isolato:** il contatore ha misurato `31 fps · corpi cinema 5` nella scena mobile-like isolata. Il renderer ha riportato `383` draw call e `476.736` triangoli; non sono emersi errori console. Una precedente conclusione reale è stata anche osservata a `32 fps`, con palla in volo verso la porta, portiere e calciatori proporzionati nella stessa inquadratura.
- **Interpretazione corretta:** è un smoke test su viewport mobile del browser integrato, non una certificazione su telefono. Il valore consente di proseguire con il collaudo dei gesti; non chiude il quality gate mobile.
- **Prossimo criterio di chiusura:** acquisire una sequenza runtime ravvicinata per tiro e dribbling (presa di contatto, braccia, busto, direzione porta) e ripetere il benchmark sul dispositivo reale senza T-pose, corpi sovradimensionati, pop-in o cadute sotto soglia.

### 2026-09-22 — Review dribbling CGTrader: camera e soggetto in quadro

- **Diagnosi verificata:** il primo provino locale deterministico `?hyperCharacter=cgtrader-highlight-optimized&cpmtest=1&cpmForce=dribble` arrivava effettivamente alla scelta `Dribbling netto`, ma il profilo generale manteneva l'eroe troppo piccolo. La causa non era la clip: dopo la regia per gesto un correttore comune manteneva il protagonista a un riferimento di circa `0,12` dello schermo e applicava anche un dolly-out agli highlight.
- **Intervento POC, solo review:** per il dribbling nella sola route `cgtrader-highlight-optimized` la camera usa un campo visivo di `41°`, il profilo ravvicinato segue il corpo con asse piu' corto e il correttore finale porta il riferimento dell'eroe a `0,22`. Fuori da questa route, e per ogni altro gesto, restano la camera e la taratura storiche.
- **Verifica runtime:** il caso deterministico ha mostrato nel medesimo quadro eroe con palla ai piedi, due difensori e porta/portiere; la console non ha riportato errori. La scena e' quindi utilizzabile per verificare l'orientamento e per avviare la clip corretta. I frame raccolti subito dopo reload hanno riportato `2–3 fps`: sono di warm-up e non sono una misura di performance da usare come benchmark.
- **Esito onesto:** il corpo e' piu' leggibile, ma non ancora abbastanza grande da giudicare a vista il contatto piede-palla e il lavoro delle braccia in un singolo fermo immagine. Il gate visivo del dribbling resta aperto; non viene dichiarato promosso.
- **Verifiche statiche:** build `dist` rigenerata; inventario passato (`23/35` clip del manifest, rig sorgente 65 joint); `git diff --check` senza errori bloccanti. Nessun file e' stato inviato a `main`, GitHub Pages o produzione.
- **Prossimo criterio di chiusura:** acquisire la fase in movimento della clip, non solo la scelta iniziale, con palla agganciata al piede; poi collegare alle loro clip GLB dedicate le varianti che oggi sono alias (cross, corto/lungo, tacco, doppio passo, step-over, finta) e ripetere tiro/parata e mobile reale.


### 2026-09-22 - Inventario completo delle clip e collegamento delle varianti CGTrader

- **Correzione di tracciamento:** la cartella locale contiene gia 35 clip GLB, non 23. Il numero 23 indicava soltanto quelle allora registrate nel manifest; il manifest ora censisce tutte le 35.
- **Fatto verificato sul package CGTrader:** i tre LOD della review incorporano 31 clip retargettate: locomozione, controllo palla, tiro, dribbling, difesa, reazioni e gli stati GK high-catch, ready, goal-kick e throw. Le quattro clip sorgente non ancora dentro quel package sono gk-idle, gk-dive, gk-catch e gk-block: non vengono dichiarate disponibili nella review finche non saranno retargettate e validate.
- **Collegamento applicato, solo POC:** nel renderer CGTrader le varianti che gia condividono una clip ora risolvono davvero in una AnimationAction: cross/passaggio corto/lungo/tacco -> pass; doppio passo -> dribble; finta e cambio -> change-direction; esito negativo -> missed-chance. Prima alcune chiavi esistevano nel vocabolario logico ma non nel set di gesti CGTrader, quindi potevano degradare a locomozione.
- **Limite esplicito:** non esistono file dedicati per cross, tacco, doppio passo, step-over o finta. Sono varianti di regia basate sulle clip gia disponibili, non nuovi gesti falsamente presentati come tali.
- **Verifica svolta:** le 12 clip prima fuori manifest hanno canali di animazione reali; il package CGTrader LOD0 contiene 31 animazioni retargettate a 225 canali ciascuna. Resta da eseguire il provino in movimento per verificare che ogni alias produca corpo intero e braccia coerenti, palla e direzione porta.
- **Prossimo criterio di chiusura:** provare runtime dribbling, cross/passaggio e tiro/parata nella review locale; poi preparare il retarget delle quattro clip GK mancanti e misurare il telefono reale. Nessuna modifica e stata inviata a main, GitHub Pages o produzione.


### 2026-09-22 - Regola di approvazione delle clip CGTrader

- **Vincolo confermato dal prodotto:** la review usa esclusivamente le 31 clip gia retargettate e verificate nel package CGTrader corrente.
- Le quattro GLB sorgente GK (`gk-idle`, `gk-dive`, `gk-catch`, `gk-block`) restano fuori dalla pipeline e dal renderer finche un test dedicato non conferma retarget, corpo intero, palla, transizione e prestazioni.
- Nessun asset precedente, non verificato o rifiutato viene usato come fallback per mascherare un gesto mancante.


### 2026-09-22 - Review dribbling: pose degli attori secondari

- **Difetto visivo osservato:** nel provino CGTrader del dribbling, pur con 32 fps e cinque corpi cinema, alcuni giocatori secondari potevano entrare nel quadro con un gesto tecnico assegnato a un compagno fuori contesto. Il risultato non e idoneo al gate di credibilita.
- **Correzione POC:** durante un dribbling della review, l Hero e il portiere restano gli unici autorizzati a ricevere un gesto tecnico; i tre attori di contesto mantengono locomozione e orientamento verso l azione. Le loro eventuali azioni residue vengono rilasciate con il crossfade esistente.
- **Esclusioni confermate:** nessuna clip non approvata viene reintrodotta; le quattro GK sorgente restano fuori dal renderer.
- **Verifica:** build dist completata; inventario 35/35 passa; il nuovo fermo immagine dinamico deve ancora essere raccolto prima di promuovere il controllo visivo.

### 2026-09-22 - Dribbling con soli asset approvati

- Verifica locale con `cgtrader-highlight-optimized`: usa esclusivamente la clip CGTrader approvata per il dribbling; nessun asset precedente, non verificato o scartato è stato caricato come fallback.
- Riscontro visivo: gli attori secondari non hanno più ricevuto pose tecniche fuori contesto; rimangono in locomozione mentre l'eroe esegue il gesto.
- Campione prestazioni: 34–37 fps con cinque corpi cinema nel momento osservato.
- Il gate non è chiuso: la successiva iterazione deve rendere più leggibili traiettoria, orientamento dei corpi e rapporto dell'azione con la porta, mantenendo questa esclusione rigorosa degli asset.

### 2026-09-22 - Regia dribbling: direzione e scala dei corpi

- Correzione POC locale: durante un dribbling CGTrader l'eroe ruota gradualmente verso la porta. Corpo, palla agganciata al piede e direzione dell'azione usano quindi lo stesso asse; nessun asset diverso viene introdotto.
- Il primo riscontro fotografico ha trovato un difetto reale: un avversario troppo vicino alla camera appariva sproporzionato e copriva la scena. La regia della review ora arretra, si alza e allarga leggermente l'ottica solo per il dribbling in review.
- Riscontro visivo successivo: il giocatore gigante non è più presente; campo e corpi restano leggibili. Prestazioni osservate: 31–33 fps con cinque corpi cinema.
- Verifiche tecniche: build web completata; validazione offline superata con Chrome locale, senza CDN e senza errori console; inventario animazioni 35/35 superato.
- Gate ancora aperto: il click del browser ha risolto la variante `Sterzata fulminea`, quindi non vale come prova finale del gesto `Dribbling netto`. Servono catture deterministiche in apertura, contatto piede-palla e uscita, con corpo, braccia, palla e porta coerenti.

### 2026-09-22 — Dribbling netto: scelta deterministica e quadro corretto

- **Verifica runtime deterministica:** nel provino locale `cgtrader-highlight-optimized` la scelta e' stata effettuata con il comando `1`, che la UI identifica come `Dribbling netto`; l'esito mostrato conferma esplicitamente `Dribbling netto`, non `Sterzata fulminea`.
- **Riscontro visivo:** la ripresa dell'esito contiene porta, portiere, eroe e avversari nella stessa inquadratura. Non compare il giocatore gigante rilevato nel test precedente. L'eroe e la palla restano sullo stesso lato di avanzamento verso la porta.
- **Prestazioni osservate:** `28–29 fps · corpi cinema 5` dopo il warm-up nel browser integrato. E' un dato di review desktop, non il quality gate mobile.
- **Verifica tecnica:** `npm run validate:web` eseguito con Chrome locale: build offline funzionante, nessuna CDN tentata, nessun errore console.
- **Gate ancora aperto:** questo fermo immagine non dimostra da solo il contatto piede-palla in tutti i frame ne' l'intera coordinazione delle braccia. Restano necessari la sequenza animata del dribbling, tiro/parata, transizioni e collaudo su telefono.

### 2026-09-22 — Tiro CGTrader: scenario locale ripetibile

- **Estensione POC locale:** la query di review `cpmForce` accetta ora solo `dribble` e `shot`; entrambe le opzioni selezionano una situazione reale del motore. Non abilita gesti diversi, non usa fallback e non modifica il gioco normale.
- **Verifica runtime:** nella review `cpmForce=shot`, la UI ha proposto il tentativo di tiro; il comando `3` ha eseguito `Conclusione di prima` e l'esito ha confermato `Tiro di prima`, gol `1–0`.
- **Prestazioni osservate:** `27 fps · corpi cinema 5` dopo il warm-up nel browser integrato. Il primo frame a 10 fps e' warm-up e non e' usato come misura.
- **Verifica tecnica:** nuova build locale e validazione offline superate; nessuna CDN e nessun errore console.
- **Esito onesto:** la camera dell'esito e' troppo larga per validare il singolo frame di calcio, il contatto palla-piede e la risposta del portiere. Il gate tiro/parata, transizioni e mobile resta aperto.

### 2026-09-22 — Tiro: protezione delle pose degli attori di contesto

- **Difetto osservato:** il primo frame del test tiro mostrava difensori a terra o con pose tecniche fuori dalla loro relazione con palla e conclusione. Era un problema di assegnazione della regia, non una ragione per usare asset diversi.
- **Correzione POC:** nella sola review CGTrader, sia sul dribbling sia sul tiro, l'eroe e il portiere sono gli unici attori ammessi al gesto tecnico. I tre corpi di contesto ricevono locomozione e rilasciano eventuali residui con il crossfade esistente.
- **Riscontro visivo dopo warm-up:** a `28 fps · corpi cinema 5` la scena mostra corpi in movimento, palla e porta senza il difensore disteso fuori contesto visto nel primo frame. Non e' comparsa una T-pose evidente nel fermo immagine successivo.
- **Verifica tecnica:** build locale e validazione offline superate; nessun errore console, nessuna CDN.
- **Limite esplicito:** la scelta si e' poi risolta automaticamente nella variante acrobatica `Rovesciata`; questo fotogramma non certifica ancora la sequenza completa di `Conclusione di prima`, il contatto, la parata o il timing del portiere.

### 2026-09-22 — Portiere: whitelist esplicita delle clip CGTrader

- **Fatto verificato sul package attivo:** tra le reazioni del portiere e' approvata e presente `gk-high-catch`. `gk-dive` e `gk-block` restano file sorgente non verificati e non fanno parte del package retargettato in uso.
- **Rafforzamento applicato:** il renderer CGTrader ora dichiara esplicitamente `dive:null` e `block:null`; solo `catch` puo' risolvere nella presa alta approvata. Il movimento procedurale del portiere resta disponibile, ma nessuna clip non validata puo' essere selezionata per errore.
- **Verifica tecnica:** build locale e validazione offline superate, senza CDN e senza errori console.
- **Gate ancora aperto:** serve una sequenza runtime di presa alta con palla e portiere nello stesso quadro; tuffi e blocchi restano esclusi fino a retarget e test dedicati.

### 2026-09-22 — Consegna figurine per preparazione merge

- **Verifica stato corrente:** i 40 ritratti statici e il mock-up 5:7 sono presenti, ma `CastPortrait`, `resolveCastPersona`, `appearanceForAvatar` e `HeroHighlightPortrait` non sono piu' nel file di gioco attuale dopo il recupero della sorgente. Sono recuperabili solo dalla copia compattata in `tests/character-lab/recovery/2026-09-22-source-recovery/`; l'integrazione descritta sopra non va considerata attiva finche' non viene ripristinata e ritestata.
- **Handoff:** `tests/character-lab/FIGURINE_MERGE_HANDOFF.md` distingue asset, dati forniti dal gioco, logica recuperabile, limiti e criteri di merge. Nessun push o merge eseguito; `main` e GitHub Pages restano intatti.

### 2026-09-22, 22:12 — Avanzamento highlight CGTrader

- **Fase corrente:** 4/7, animazioni e sincronismo della presa del portiere; completamento complessivo stimato 70%, invariato finche' un gate non supera la verifica.
- **Attivita' dall'ultimo aggiornamento:** creato `tests/character-lab/keeper-catch-sequence-review.mjs` per catturare 12 fotogrammi consecutivi dell'azione approvata «Chiama il portiere», con telemetria della scena e della palla. Il primo avvio di Chrome headless e' stato impedito dal sandbox sui file temporanei; il test e' stato riavviato con permesso dedicato ed e' in esecuzione.
- **Verifica ed esito:** non c'e' ancora un risultato della sequenza, quindi presa, contatto mani-palla e possesso successivo restano **non verificati**. L'ultimo risultato visivo valido e' l'apertura dell'azione senza errore; le precedenti misure utente 11–16 FPS mantengono il gate mobile in **FAIL**.
- **Prossimo criterio di chiusura:** esaminare i 12 frame e i dati dell'arco della palla; correggere solo difetti riprodotti, poi ripetere dribbling, passaggio e tiro con transizioni e misurare sul telefono. Nessuna data finale affidabile prima di questi passaggi, nessuna build pubblicata sulla Pages ufficiale.

### 2026-09-22, 22:38 — Regressione misurata e messa in sicurezza

- **Fase corrente:** 4/7, 65% complessivo stimato. La precedente stima 70% non rifletteva una regressione del file di gioco dopo il recupero.
- **Verificato:** il percorso `cgtrader-highlight-optimized` esiste nel file attuale ma non applica piu' il roster cinematografico a cinque corpi, il caricamento LOD misto, il budget renderer e la telemetria `__CPM_CGTRADER_CINEMA_ROSTER`. La copia `tests/character-lab/recovery/2026-09-22-source-recovery/CARRIER-MANAGER-AV.compacted-before-recovery.html` contiene quelle parti, ma non e' una sorgente da sostituire in blocco.
- **Test locale:** `keeper-catch-sequence-review.mjs` apre deterministicamente la situation 33 «Muro in area», con «Chiama il portiere» disponibile. La review corrente mostra `corpi pieni` e 1–2 FPS nel browser headless: questo banco non puo' ancora validare la sequenza della presa. Non e' una misura sul telefono. I frame catturati sono in `tests/character-lab/keeper-catch-review/` e non provano contatto mani-palla.
- **Lavoro successivo:** ripristinare nel solo ramo POC il roster ottimizzato e il caricamento LOD, ripetere la cattura di presa, poi dribbling/passaggio/tiro e infine benchmark mobile. Quality gate animazione, palla, transizioni e performance restano aperti.
- **Sicurezza branch:** preparare commit e push soltanto verso `poc/marioprada-character-system`; `main` e Pages principale non vanno modificati. Consegna tecnica in `tests/character-lab/CLAUDE_CODE_CONTINUATION.md`.

### 2026-09-22, 22:50 — Backup GitHub verificato

- **Pubblicato e verificato:** `origin/poc/marioprada-character-system` punta al commit `4c81b8e` dopo due push lineari. Il primo checkpoint (`33b654b`) include codice POC, roadmap, handoff, 40 ritratti e sorgente di recupero. Il secondo (`4c81b8e`) conserva i 19 file originali CGTrader acquistati; `BLENDER+RIG.blend` da 118 MB e' gestito da Git LFS. `npm run build:web` e `git diff --cached --check` sono passati prima del push.
- **Produzione:** nessun push verso `main`; il ramo Pages ufficiale rimane separato. La build POC non e' stata pubblicata sul link ufficiale ne' dichiarata valida per il collaudo mobile.
- **Gate e fase:** 4/7, 65% stimato; roster ottimizzato da ripristinare, poi cattura completa della presa, dribbling/passaggio/tiro, transizioni e benchmark telefono. La consegna operativa per Claude Code e' in `tests/character-lab/CLAUDE_CODE_CONTINUATION.md`.
