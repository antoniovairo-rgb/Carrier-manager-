# Rapporto di collaudo 3D — CPM 7.999.169

Ramo `collaudo/release-7.999.169-3d` · commit di partenza `674ac86` (merge «CPM 7.999.169 pubblicata») · data 15/10/2026.
Collaudo **solo di misura**: nessun file del gioco (`src/`, `CARRIER-MANAGER-AV.html`) è stato toccato.

## 1. Come ho misurato (e i limiti, detti subito)

- **11 partite vere complete**, tutte giocate fino al fischio (90'/91'), dal salvataggio `tests/visual/fixtures/save-190-s12-ovr93.json`, **GLB acceso** (`window.__CPM_GLB=true`, `__CPM_GLB_READY=true` in tutte, nessun `__CPM_GLB_FAIL`), **un nome diverso per partita** (il seme nasce da avversario+stagione+settimana+nome), percorso utente vero: «Vedi le formazioni» → «Ingresso in campo» → partita. Chromium headless 412×915, software-GL (swiftshader), velocità partita 2×, pilota automatico (`__CPM_AUTOPLAY`, policy seeded).
- Strumento: `tests/visual/collaudo-169-3d.mjs` (nuovo, solo lettura). Dati grezzi per partita in `docs/collaudi/dati-169-3d/p0..p10.json`. Zero `pageerror` in 11 partite.
- Guardiani esistenti rieseguiti sul build: `bambini-236.mjs` (club), `prima-partita-237.mjs`, `fps-249.mjs`, `gk-dive-sync-test.mjs` (uscite in `dati-169-3d/*.txt`).
- **Limiti che pesano sui giudizi:**
  1. Headless software-GL non è il telefono: il tempo-scena scorre molto più lento del reale (CLAUDE.md, 7.480/7.483). Per questo i numeri adimensionali (rapporti, quote di fotogrammi) sono più affidabili dei tempi.
  2. Gira con `?cpmtest=1` (serve ai testimoni): il freeze di lettura 5.47.12 e altre presentazioni sono spente in cpmtest. L'ingresso è invece vero (`__CPM_WALKTEST74`).
  3. Il pilota automatico **non risponde** ai modali del mister: ciò che dipende da questo è segnalato come tale (R03).
  4. In `playing` il campo mostra la mappa 2D tattica, non il 3D: la posizione del pallone 3D (`__CPM_OWN`) vale solo dentro gli highlight (`hl_*`).
  5. Le foto sono 1–2 fotogrammi per highlight: **non provano il movimento**. Dove il giudizio è di movimento (sincronismo, tuffo) lo dico.

### Le partite

| # | Nome | Finale (nostra–loro) | Gol da ledger | Highlight | Tempo reale | pageerror | Scritte tecniche |
|---|---|---|---|---|---|---|---|
| p0 | Aldo Brenta | 1–3 | 4 | 6 | 177 s | 0 | 0 |
| p1 | Cesare Dolfi | 4–0 | 4 | 8 | 194 s | 0 | 0 |
| p2 | Ettore Fanti | 2–0 | 2 | 9 | 201 s | 0 | 0 |
| p3 | Gino Lardi | 3–0 | ledger incompleto* | 12 | 200 s | 0 | 0 |
| p4 | Ivo Mansi | 2–0 | 2 | 8 | 185 s | 0 | 0 |
| p5 | Nando Orsi | 1–1 | 2 | 10 | 184 s | 0 | 0 |
| p6 | Piero Quaglia | 1–2 | 3 | 8 | 191 s | 0 | 0 |
| p7 | Rocco Sala | 3–1 | 4 | 7 | 188 s | 0 | 0 |
| p8 | Tullio Vanni | 3–0 | 3 | 11 | 202 s | 0 | 0 |
| p9 | Ugo Zanetti | 0–2 | 2 | 8 | 183 s | 0 | 0 |
| p10 | Dario Bellini | 1–2 | 3 | 5 | 181 s | 0 | 0 |

\* p3 è stata giocata con la prima versione dello strumento (ledger troncato, niente misura dell'inquadratura): conta per fine partita, ripartenze e fps, non per l'inquadratura.

## 2. Tabella di gravità

| ID | Gravità | Rilievo | Evidenza |
|---|---|---|---|
| R01 | **ALTA** | Il **primo highlight** della partita si apre su prato vuoto: l'eroe è fuori dal quadro in 5 partite su 10 misurate | foto `R01-*`, numeri §3.1 |
| R02 | **MEDIA** | L'eroe è **piccolo** nel quadro negli highlight (altezza apparente mediana 0,059; 95% sotto 0,08) e fuori quadro nel 26,8% dei fotogrammi di apertura | foto `R02-*`, §3.2 |
| R03 | **MEDIA** | Il **modale del mister** resta sopra l'highlight e perfino sopra la **cerimonia finale** («Salta premiazione») | foto `R03-*`, §3.3 |
| R04 | **MEDIA** | **Pallone**: 7 riassegnazioni secche non coperte da stacco nero (7–30 u) in 11 partite; 26 episodi di pallone a >8 u da ogni calciatore in apertura di scena (da confermare) | foto `R04-*`, §3.4 |
| R05 | **MEDIA** | **PO-237 non chiuso**: la prima partita resta più scattosa della seconda (p50 133 vs 83 ms; 39 vs 8 fotogrammi >250 ms), blocco unico fino a 12,4 s | §3.6, `dati-169-3d/prima237.txt` |
| R06 | BASSA | Gol in recupero (90'/91'/92') senza ripartenza dal centro: coerente col fischio, ma da guardare | §3.5 |

Nessun rilievo **bloccante**.

## 3. Esito per punto del compito

### 3.1 Highlight dell'eroe — inquadratura (R01, ALTA)

Testimone `__CPM_FRAME480` (proiezione piedi→testa dell'eroe, azzerato a `hl_intro` e letto a `hl_result`), 65 highlight in 10 partite:

| Partita | Fotogrammi con l'eroe fuori quadro nel **primo** highlight |
|---|---|
| p0 (5') | 10 / 11 |
| p1 (4') | 1 / 7 |
| p2 (3') | 2 / 10 |
| p4 (3') | **12 / 12** |
| p5 (3') | **12 / 12** |
| p6 (2') | 0 / 11 |
| p7 (4') | 1 / 11 |
| p8 (5') | **12 / 12** |
| p9 (4') | **14 / 15** |
| p10 (4') | 3 / 11 |

In 5 partite su 10 il primo highlight ha l'eroe praticamente sempre fuori dal quadro durante l'apertura. Le foto mostrano la causa visiva: prato vuoto (`R01-primo-highlight-prato-vuoto-p5.jpg`: nessun calciatore in quadro), solo un avversario (`R01-…-p4`, `-p8`), l'eroe all'angolo (`R01-…-p0`); un secondo dopo l'eroe c'è (`R01-stesso-highlight-1s-dopo-p4.jpg`). Corrisponde alla famiglia delle note PO 001/002 (apertura di scena).
**Causa nel codice: Non posso confermarla.** Lo strumento di misura è in `src/12-three-match-view.jsx:10847` (`__CPM_FRAME480`); non ho isolato quale passata di camera sposti la mira. Non posso nemmeno escludere che il tempo-scena lento dell'headless amplifichi il difetto: in 5 partite su 10 su GPU reale potrebbe essere meno visibile. **Serve il dispositivo.**

Sincronismo pallone-corpo ed esito narrato contro esito 3D: **Non posso confermarlo** con questo banco — le foto sono 2 fotogrammi per highlight e il sincronismo è una grandezza di movimento. Dato di contorno: 6 gol su 30 nascono da highlight (`src:'highlight'`), tutti seguiti da +1 sul tabellone e dalla ripartenza.

### 3.2 Eroe piccolo (R02, MEDIA)

Sugli stessi 65 highlight (827 fotogrammi): altezza apparente dell'eroe nell'ultimo fotogramma prima dell'esito, **mediana 0,059**, min 0,031, max 0,099; **nessun** highlight ≥ 0,15; 95% sotto 0,08. Eroe fuori quadro in **222/827 = 26,8%** dei fotogrammi; **20 highlight su 65** hanno ≥ 50% dei fotogrammi fuori. Il pallone è fuori quadro in 204/827 (24,7%).
Confronto: CLAUDE.md (7.509) dichiara per il percorso reale «mediana 0,140, figurine 1%, fuori quadro 6,3%». Il mio valore è ~2,4× più basso: **non posso dire se sia regressione o differenza di strumento** (il censimento forza le scene, io misuro partite vere in cui la camera può non essere arrivata a regime in headless). Va confrontato con `npm run framing-guard` sul 169 e col telefono. Foto: `R02-eroe-piccolo-p0-min21.jpg`, `R02-eroe-piccolo-p4-min17.jpg`.

### 3.3 Modale del mister (R03, MEDIA)

Le foto mostrano il riquadro «IL MISTER» (3 scelte) sopra l'highlight dimmato: `R03-modale-mister-su-highlight-p6-min60.jpg` («Testa di potenza» nascosta), `R03-modale-mister-su-highlight-p4-min73.jpg`, e soprattutto `R03-modale-mister-sulla-cerimonia-p8.jpg`: al fischio (cerimonia «CAMPIONI!!», pulsante «Salta premiazione») è ancora aperto il modale «Due gol di vantaggio al **84'**…», cioè un ordine scaduto da 6 minuti. Testimone DOM (`IL MISTER` nel testo di pagina), p8–p10: modale presente in 158 campioni, di cui 16 dentro `hl_intro`/`hl_result` e 2 in `ceremony` (p8 e p10).
**Caveat onesto:** il pilota automatico non risponde al modale, quindi in autoplay resta aperto più a lungo di quanto farebbe un giocatore. Resta però non confermato che il gioco lo chiuda da solo al passaggio a `ceremony`: il testo dell'ordine è in `src/15-live-match.jsx:170` (`avanti_2`) e la chiusura di fine partita in `src/15-live-match.jsx:1908` (`_goEndOrCeremony`); **non ho verificato** se azzeri il modale. **Non posso confermare la causa nel codice.**

### 3.4 Pallone (R04, MEDIA)

- **Pallone oltre il palo/fuori dal rettangolo: nessun caso.** 0 campioni su 524 campioni di highlight (`__CPM_OWN`, x,y fuori da [−1,101]).
- **Salti** (`__CPM_BJ478`, riassegnazioni secche ≥ 6 u): 110 in 11 partite, 76 coperte da stacco nero (regia TV voluta), **34 scoperte**. 27 sono voli d'arco (max 20,2 u, in sequenza decrescente tipo convergenza); **7 non-arco**: p1 scena 10,3 u · p3 avvicinamento 7,4 · p4 avvicinamento 10,1 · p6 avvicinamento 12,2 e scena 13,0 · p9 avvicinamento 11,8 e **scena 30,1 u (sk 6)**. Foto dello stato al momento: `R04-stato-al-salto-p6-*.jpg` (una foto non mostra un salto: lo dichiaro). Attenzione alla trappola 7.360/7.478: fra due campioni il dato può essere velocità × intervallo; qui il varco attribuisce la riassegnazione, quindi i 7 casi sono reali ma **non so quanto si vedano a 60 fps**.
- **«Palla di nessuno»** (a >8 u da ogni calciatore, eroe compreso, in `hl_intro/move/choose`): **26 episodi in 9 partite**, ≤ 2,3 s reali l'uno, fino a **55,6 u** (p4, palla al vertice (97,98), cioè una bandierina). **Non lo posso confermare come difetto**: ho congelato la scena (dt=0) in 6 casi (soglia 15 u, `R04-intro-scena-congelata-p9-min4.jpg`, `R04-palla-fuori-quadro-scena-congelata-p10-min20.jpg`, `…-p10-min92.jpg`): in 2 la scheda d'intro scurisce la scena e la palla non si vede; in `p10-min20` («Testa piazzata all'angolo») l'eroe sta fermo senza palla in quadro — plausibile per un cross in arrivo. Inoltre in un fotogramma (p10, m22) la palla appare ai piedi dell'eroe mentre `__CPM_OWN` dà d=16,8 u: con GLB acceso **il testimone può sovrastimare** (mesh procedurali che guidano la logica vs modelli GLB visibili). Quindi il numero 26 è un limite superiore.

### 3.5 Ripartenza dal centro dopo un gol — PO-207 (OK)

Testimone `__CPM_KO207`: **21 gol su 21** con la partita ancora in corso hanno avuto la ripartenza a **(50,50)** dalla squadra che ha subito (`fine:'kickoff'`, `scena:false`), in 10 partite. I 3 gol senza ripartenza sono tutti **dopo il 90'** quando la partita finisce: p2 gol al 90' e 91' (finale 91'), p8 gol al 92' (`minVero` 93, `causa:'clock'`). Le foto `R06-ripartenza-dopo-5s-*` sono a +5 s reali (≈ +6 minuti di gioco): **non fotografano il calcio d'inizio**, quindi la conferma è numerica, non visiva. Il tabellone coincide col ledger in tutte le partite (le mie «discrepanze» iniziali erano il buco di campionamento dei miei screenshot, verificato).
Osservazione (R06, BASSA): p2 resta 0–0 fino al 90' e poi segna due gol in due minuti (90' cronaca, 91' set-piece). Non posso dire se sia un difetto del motore o caso.

### 3.6 Ingresso in campo con i bambini — PO-236 (OK)

`bambini-236.mjs` (contesto club): **1199/1199** bambini con il loro calciatore disegnato per la squadra di casa e **1199/1199** per gli ospiti (11 per squadra in ogni campione); prova del rosso riconosciuta (88/968 e 264/968). Foto di partita vera: `R05-ingresso-bambini-p4-9.jpg` (bambini accanto ai calciatori di **entrambe** le squadre, bianco-nera e rossa), `R05-ingresso-linee-p4-6.jpg`, `R05-ingresso-bambini-guardiano-236.jpg`. Nei primi secondi la camera inquadra emblema e prato senza calciatori (`R05-ingresso-primi-secondi-p0.jpg`): non lo giudico difetto (volo di camera d'apertura). **Non testati** i contesti Nazionale e Coppa (solo club).

### 3.7 Fluidità prima contro seconda partita — PO-237 (R05, MEDIA)

`prima-partita-237.mjs`, stessa pagina, GLB acceso, finestra 45 s (software-GL: conta il **rapporto**):

| | 1ª partita | 2ª partita |
|---|---|---|
| fotogrammi in 45 s | 142 | 288 |
| p50 / p95 | 133 / 500 ms | 83 / 200 ms |
| fotogrammi >100 / >250 ms | 88 / **39** | 75 / **8** |
| blocchi lunghi (somma · max) | 19,8 s · **12,5 s** | 16,5 s · 10,7 s |
| shader (compile/link) | 9,1 s | 7,8 s |
| texture | 2,5 s | 2,8 s |
| parsing GLB in partita | 0 ms | 0 ms |

Il guardiano è **verde** perché giudica solo parsing GLB e texture (che ora sono pari: 0 ms e 2543 vs 2758 ms) — e questo è un miglioramento reale (era l'obiettivo del 7.999.162). Ma la prima partita resta ~1,6× più lenta nel p50 e ~5× nei fotogrammi >250 ms. Il blocco dominante è la **compilazione degli shader in entrambe le partite** (9,0 s e 7,2 s a ~2 s dall'avvio): il renderer nasce a ogni partita (`src/12-three-match-view.jsx:401`) e il `renderer.compile` è in `src/12-three-match-view.jsx:1153`. **Su telefono il costo può essere molto diverso: Non posso confermarlo.** In 11 partite il primo highlight arriva quando il blocco è già passato (HL1 a ~65 s di pagina), quindi non spiega R01.

### 3.8 Scritte tecniche — PO-249 (OK)

In 11 partite, a ogni ciclo di polling (~350 ms), scansione del testo di pagina per `\d+ fps`, `__CPM*`, `undefined`, `NaN`, `[object …]`, `debug` e dell'elemento `data-cpm="fps907"`: **0 occorrenze** in tutte le fasi (`matchday`, `formations`, `walkout`, `playing`, `hl_*`, `ceremony`). `fps-249.mjs` verde (nessuna scritta; misura `__CPM_FPS907` viva; il rosso la fa ricomparire: «3 fps», «5 fps», «9 fps»). Foto `R07-hud-senza-fps-*`.
Nota: il testo inglese «THE OPPONENTS CELEBRATE.» sul 2D (`R06-gol-subito-2-1-p0.jpg`) **non è un difetto**: viene dalla tabella cori per lingua della lega (`src/08-panchina-derby-meteo-cori.jsx:531`, Premier Division = inglese).

### 3.9 Portiere (tuffo, lato, tempo)

- **GLB spento (procedurale), `gk-dive-sync-test.mjs`: PASS.** 6 tuffi misurati su 17 scene; distesa completata prima dell'arrivo della palla di −0,04…−0,10 s (mediano −0,05 s, tolleranza 250 ms).
- **GLB acceso, in partita: Non posso confermarlo.** Nelle foto esaminate dei tiri (raffiche p6/p7 e coppie di fotogrammi degli highlight) il portiere non era in quadro (la camera sta sull'eroe, la porta è lontana), e il testimone `__CPM_DIVE465` nelle partite ha dato 14–40 campioni per partita con `ext` ≤ 0,21 in 6 scene su 9 (nessun tuffo disteso campionato) — troppo poco per un giudizio di sincronia o di lato. Serve una sonda dedicata GLB-ON con camera sul portiere.

## 4. Cosa NON ho potuto confermare (riepilogo)

1. Sincronismo pallone-corpo dell'eroe e coerenza esito narrato↔3D (movimento, 2 fotogrammi per highlight).
2. Tuffo/lato/tempo del portiere con GLB acceso.
3. Se R01/R02 si riproducono su GPU reale (headless software-GL, tempo-scena lento).
4. Se «palla di nessuno» è un difetto o un'apertura di scena con palla in arrivo/non inquadrata (strumento sovrastima con GLB).
5. Se il modale del mister scaduto sopra la cerimonia (R03) nasce anche con un giocatore reale.
6. Ripartenza e bambini per Nazionale/Coppa; ripartenza vista a occhio (la conferma è numerica).

## 5. File

- Rapporto: `docs/collaudi/RAPPORTO-release-7.999.169-3d.md`
- Foto (JPEG selezionate, nome = rilievo): `docs/collaudi/foto-169-3d/`
- Dati: `docs/collaudi/dati-169-3d/` (`p0..p10.json`, `bambini.txt`, `prima237.txt`, `fps249.txt`, `gkdive.txt`)
- Strumento: `tests/visual/collaudo-169-3d.mjs` (`CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers CPM_IDX=<0..11> node collaudo-169-3d.mjs`; una partita alla volta: tre pagine GLB in parallelo saturano la CPU e falsano tutto, misurato load 13 su 4 core).
