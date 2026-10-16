# Rapporto giro 40 — PO-261 «Prima apertura vuota» · PO-258 punizione parata (codice 111)

Ramo `sviluppo/apertura-261-giro40`, base `lavoro/171-base` (7.999.170 + giro 22). Nessun cambio di `GAME_VERSION`/`SAVE_VERSION`,
zona G non toccata. Tutto il codice di gioco toccato sta in `src/12-three-match-view.jsx` (ricomposto con
`CPM_FORZA_BUILD=1 node tools/build-src.mjs`, `node tools/check-src.mjs` allineato).
Misure percettive con **GLB acceso**, `__CPM_PRESENT=1`, pagina nuova per partita/scena, headless Chromium 412×915.

## 1. PO-261 — il primo highlight si apre su prato vuoto

### 1.1 Misura sulla base (sonda nuova `tests/visual/apertura-261.mjs`)

Flusso vero (provino, nessuna scena forzata), la cronaca gioca finché il calendario apre la prima scena; il testimone `__CPM_FR73`
(proiezione dell'eroe, camera, pallone a ogni fotogramma) si azzera mentre si è in `playing` (il giro 3D è sospeso sotto il campo 2D,
7.917), quindi parte dal **primo** fotogramma della scena. Sulla base (= braccio rosso `__CPM_NO_APERTURA261`):

- al primo fotogramma della **prima** scena la camera è ancora **alla nascita in tribuna `(0,26,46)`** in 4 partite su 4
  (prima immagine con l'eroe fuori quadro **4/4**); nelle seconde scene la camera parte invece da dove l'aveva lasciata la scena prima.
- Lo snap di scena 7.471 trattiene la camera 120 ms aspettando lo stacco nero: quel fotogramma trattenuto è il primo coi ventidue
  riaccesi, cioè quello pesante della prima scena (headless 2,6–2,9 s di render).

⚠️ **Una misura che ho dovuto ritirare, e lo dichiaro.** La prima stesura della sonda dava al rosso l'**87,7%** del tempo con l'eroe
fuori quadro nei primi 3 s. Era attribuzione sbagliata: il testimone scrive il fotogramma *prima* del `render` e proietta con la
matrice del disegno *precedente*; il blocco di ~3 s cade **prima** che l'immagine in tribuna arrivi a schermo, e quell'immagine resta
visibile ~18 ms. Con l'abbinamento corretto (riga j = immagine j−1, a schermo da t_j a t_j+1) il tempo a schermo con l'eroe fuori nella
prima scena è piccolo in headless (17–195 ms nei casi misurati). Il difetto «prima immagine sbagliata» resta vero e deterministico; la
sua **durata** sul telefono dipende da quanto pesa il primo render della scena lì: **non posso confermarla** senza il dispositivo.

### 1.2 Cause trovate (tre, tutte sullo snap di scena)

1. **Snap trattenuto dopo il campo 2D.** In `playing` il giro 3D è sospeso (7.917) e il fotogramma che la camera ha in memoria non è
   mai stato a schermo: non c'è nessun salto da nascondere, ma lo snap 7.471 aspettava comunque 120 ms con la camera ferma.
   **Correzione:** la sospensione si annota (`sr._sosp261`); alla ripresa lo snap è immediato, lo stacco nero si chiede comunque
   (copre i riallineamenti del pallone dei primi 300 ms) ma sopra un'immagine già giusta.
2. **La guardia-pallone sul fotogramma dello snap.** Lo snap del pallone (`_ballSnap`) viene armato nello stesso fotogramma dello snap
   di camera (r. ~7000) ma si esegue solo al fotogramma **dopo** (r. ~3633): la guardia «pallone nel quadro» (7.226/7.305) girava lo
   sguardo verso il pallone ancora fermo sulla cronaca (fino a 46 u dall'eroe). Testimone nuovo `__CPM_SNAP261` (scarto dello sguardo dal
   bersaglio dello snap a fine fotogramma): **15–27 u** misurati. **Correzione:** la guardia-pallone salta il solo fotogramma dello snap.
3. **Lo snap non era un taglio per l'arbitro d'inerzia (7.521) né per il freno 671**: entrambi riconoscono il taglio solo da soglie di
   distanza/angolo o dai flag `_cutSnap/_sceneCut`, che lo snap azzera nel suo stesso blocco. **Correzione:** un flag di fotogramma
   `_snapF261` fa ripartire l'arbitro dal bersaglio dello snap e libera il freno su quel fotogramma.

Tutte e tre sotto un solo interruttore rosso **`window.__CPM_NO_APERTURA261`**.

### 1.3 Dopo (guardiano `apertura-261`, 4 partite × 2 scene, GLB acceso, `__CPM_PRESENT=1`, `__CPM_DTREAL`)

| | base (rosso `__CPM_NO_APERTURA261`) | dopo |
|---|---|---|
| prima immagine della prima scena con l'eroe fuori quadro | **4/4** | **0/4** |
| scarto dello sguardo dal bersaglio dello snap (max) | fino a 24–27 u (regime senza teatro) | **0 u** su 9 snap |
| aperture vuote (eroe fuori ≥ metà del tempo a schermo), prime scene | 1/4 (20,9%) | 0/3 giudicabili (0%) |

Foto prima/dopo: `docs/sviluppo/foto-giro40/apertura-{prima,dopo}-*.jpg` (a = al primo campione in `hl_intro`, b = +800 ms). ⚠️ Con la
presentazione attiva la scheda d'intro (velo 42–74%) copre l'apertura e la foto «a» è nera in entrambi i bracci (primo render in
corso): le foto non mostrano la differenza, la mostrano i numeri qui sopra.

### 1.4 Gli altri due rilievi del collaudo 169, misurati e non toccati

- **R02 «eroe piccolo» (mediana 0,059).** Non è una regressione: è la regia decisa dal PO. Il blend `camHL` vale 0,55 in `hl_intro`
  e 0,70 in scelta (7.729, collaudo PO «riduci lo zoom in»), la taglia della partita normale è 0,12 (7.713, «zoom in minore»; CLAUDE.md
  parla ancora di 0,18, valore della sola review CGTrader). Misurato (testimone `__CPM_F6LOG`): distanza camera-eroe 27–39 u in
  intro/scelta, bersaglio pre-taglia 43–59 u. Cambiarla è una decisione PO, non un difetto: **non toccata**.
- **R04 «salti del pallone non coperti».** Le riassegnazioni al primo fotogramma dopo il campo 2D ora sono marcate `nascosto` nel varco
  `__CPM_BJ478` (il prima non era a schermo) e non contano come scoperte in `ball-jump-census`/`banco-highlight-248`. Sul flusso vero
  (4 partite × 2 scene) restano scoperti voli d'arco 6–10 u (velocità × intervallo, trappola 7.360), qualche `inseguitore` 6,5–10 u e
  `avvicinamento` 8–13 u in `hl_intro`: **non attribuiti in questo giro**, restano aperti.
- **Regime del collaudo.** Il collaudo 169 girava senza `__CPM_PRESENT` (teatro spento, 7.345): in quel regime anche le **seconde**
  scene escono vuote (1/4, 22%), segno che una parte di R01 era il banco. Il guardiano gira col teatro attivo.

## 2. PO-258 — punizione «Bordata potente» parata, codice 111

### 2.1 Misura (sonda del giro 27, `docs/sviluppo/dati-giro27/sonda-punizione-258.mjs`, 4 parate fk_power, GLB acceso)

Col criterio di `gk-miss-229` (offline) il residuo del giro 27 si riproduce: 3 parate su 4 col portiere «disteso 0,55–0,81 s prima del
passaggio». **Ma la traiettoria fotogramma per fotogramma dice un'altra cosa:** il pallone attraversa il piano del portiere (uscito a
x 41) mentre lui ci arriva in tempo (z −2,51 contro pallone a −2,36), e **prosegue 2–4 u dietro di lui** (fine arco x 42,9–44,9) prima
di tornare indietro con la respinta 7.514. Il giudice di `gk-miss-229` prende come «passaggio» il ritorno a terra della respinta
(minimo di distanza sul rimbalzo): quel «disteso troppo presto» è un artefatto della misura, non del gioco.

**Causa:** il morsetto 7.231 («una parata esiste solo nello specchio») porta il bersaglio della parata ad almeno `AWAY_GOAL_X-4` = 42,
anche col portiere fuori dai pali. Il tuffo segue il progresso dell'arco (7.465, distesa piena a fine arco): il pallone gli passa
attraverso all'~84% dell'arco, a distesa incompleta, e la respinta parte da dietro la sua schiena — a occhio, portiere in ritardo.

**Correzione** (`src/12`, subito dopo il morsetto 7.231): sulla parata, col portiere davanti al bersaglio, l'arco termina sul suo piano
(mani a +0,45 u), stessa direzione, durata scalata sulla corda (velocità invariata). Testimone `__CPM_PARATA258`. Rosso
**`window.__CPM_NO_PARATA258`**. Vale per tiro/punizione/rigore/testa con esito parata.

### 2.2 Dopo (guardiano nuovo `parata-258`)

| | rosso `__CPM_NO_PARATA258` | dopo |
|---|---|---|
| pallone oltre il piano del portiere durante l'arco | +2,27 / +2,44 / +4,92 / +4,47 u (4/4 «dietro») | +0,39 / −0,77 / +0,04 / +0,33 u |
| distanza pallone-portiere a fine arco | 0,26–3,02 u | 0,04–0,43 u |
| distesa a fine arco | 98–100% | 96–100% (una scena `gk_block`) |

Foto prima/dopo con camera di sola sonda sul portiere: `docs/sviluppo/foto-giro40/parata-{prima,dopo}-fk0-{arrivo,fine-arco}.jpg`
(prima: pallone sulla linea accanto al palo, dietro il portiere; dopo: pallone all'altezza delle sue mani).
⚠️ Il tempo della PO 43' è sul dispositivo: «portiere fuori tempo» è la lettura percettiva di questo passaggio attraverso il corpo,
**non posso confermare** che fosse l'unica causa nel caso del taccuino (S.13 W.21) senza rigiocarlo sul telefono.

## 3. Guardiani

Gate `validate-situations`: **✅ 14/14 PASS**, fingerprint 00001505, 0 failure (793 s).

| guardiano | esito |
|---|---|
| test:logic · test:vision · typing-shortcuts · save-compat · design-system | ✅ |
| career-critical | ✅ (782 s) |
| replay | ✅ 8 highlight completi e coerenti |
| **apertura-261** (nuovo) | ✅ verde in catena: prima immagine 0/4, scarto max 0 u · rosso 4/4 a parte |
| **parata-258** (nuovo) | ✅ verde in catena 4/4 · rosso 4/4 a parte |
| gk-dive-sync | ✅ |
| gk-miss-229 | ✅ 12/12 giudicati, partenza del corpo mediana −0,44 s dal passaggio |
| goal-postarc | ✅ classi A/B/C 0 |
| glb-pronti-232 | ✅ verde, rosso visibile (2/4 non pronte) |
| attesa-241 | ✅ mediana 11,5 s, vecchia scritta 0/2 |
| hero-in-frame | ✅ |
| analisi-217 · ingresso-camminata-245 | ✅ |
| framing-guard | ❌ **preesistente**: mediana 0,094 < soglia 0,11 sul ramo **e identica sulla base** (0,094); fuori quadro ramo 2,5% contro base 3,3%. La soglia 0,11 viene dalla taglia 0,18; la partita normale e' a 0,12 dal 7.713 (decisione PO): va riallineata la soglia o ridecisa la taglia, non toccata qui |
| seme-a | ❌ **preesistente** (sotto) |
GUARDIANI_RIGHE

**seme-a ROSSO, ma preesistente.** Sul ramo: rosso 2 prove su 2 («giro 2: sorteggi del motore diversi dal 18'», punteggio 1-0 contro
2-1). Rieseguito sulla base esatta `origin/lavoro/171-base` (worktree separato): giro 0 finisce **0-1**, giro 1 finisce **1-0** con lo
stesso salvataggio e lo stesso seme — la base non e' deterministica gia' prima di questo giro (il terzo giro della base e' stato
interrotto dalla ripresa del container; i due giri finiti bastano a dire che diverge). Entrambe le corse sotto CPU condivisa con altre
sonde. Non attribuito: fuori ambito di questo giro, da riprendere.

## 4. Cosa resta

- Durata reale della «prima immagine in tribuna» sul telefono (dipende dal primo render della scena): da collaudare sul dispositivo.
- R04: salti `avvicinamento` (8–13 u in `hl_intro`) e `inseguitore` (6,5–10 u) scoperti, non attribuiti.
- R02: la taglia della lettura è decisione PO (0,55/0,70 · 0,12); se il PO la vuole più stretta va ridecisa, non corretta.
- `gk-miss-229` giudica male le parate con respinta (prende il rimbalzo come passaggio): non usato per giudicare le parate, `parata-258`
  ha un criterio proprio. Correggerlo è fuori ambito.
- Il cartellino «Fallito · Punizione — Bordata potente / PARATA!» del riquadro resta com'è (testo, non toccato).
