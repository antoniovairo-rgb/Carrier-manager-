# Rapporto giro 72 — correzioni dai collaudi 7.999.172 / 7.999.173

Ramo `sviluppo/collaudi-giro72`, base `main` 60c227d (7.999.173). `GAME_VERSION` e `SAVE_VERSION` **invariati**.
Ambiente: Chromium headless (`CPM_CHROME=/opt/pw-browsers/chromium`), 4 core, foto 412×915, GLB acceso dove la voce è percettiva.
Fonti: `docs/collaudi/RAPPORTO-7.999.172-3d.md`, `…172-carriera`, `…173-3d`, `…173-carriera` sui rami `collaudo/7.999.17x-*`.

## In breve

| # | Voce | Tipo | Prima | Dopo | Rosso | Guardiano |
|---|---|---|---|---|---|---|
| 1 | «Ricevi fra le linee», eroe fuori quadro in `hl_result` | **gioco** (`src/12`) | 37,3% (138/370) a pallone non in volo | **0,6%** (3/477) | `__CPM_NO_LINEE72` → 34,7% (144/415) | `linee-61` esteso al totale, soglia ≤15% |
| 2 | PO-277 «corpi non pronti a fine ingresso» | **strumento** | il guardiano chiamava «corpi non pronti» un ingresso mai concluso | ingresso non concluso = CIECO (uscita 2) | prova: `CPM_TMAX=40000` → uscita 2 | `ingresso-277` |
| 3 | `schede-finale` parte B esce 0 senza giudicare | strumento | uscita 0 con 0 schede | uscita 1 con 0 schede | — | `schede-finale` |
| 4 | `pulizia-072` punta a `origin/lavoro/172` (inesistente) | strumento | non girava senza `CPM_BASE`; rosso sul numero di versione | base = genitore del commit di pulizia 19128217 (pre-173), «oggi» = 19128217, riga `GAME_VERSION` normalizzata | `CPM_ROSSO072=1` → uscita 1 | `pulizia-072` |
| 5 | PO-171 ritratto dell'eroe senza il blocco CH38 | verifica | non verificato | **non rotto**: caricato in creazione, home, profilo; 0 richieste CH38 | volti negati → ritratto assente, il guardiano lo vede | `ritratto-171-72` (nuovo) |
| 6a | PO-278 pallone «in partita» 0,193 > 0,19 | **gioco** (`src/12`, percorso di collaudo) | 0,209 (scala 0,884) | 0,160-0,161 | `__CPM_NO_PALL72` → massimo 0,192 su 82 campioni | `pallone-278` + campionamento di 4 s |
| 6b | `premiazione-palco-191` rosso per copertura | strumento | 14 campioni < 20 | 26 campioni, 0 in volo | rosso 5 in volo su 25 | `premiazione-palco-191` |
| 6c | 360 px: CARRIERA e AGENTE quasi attaccate | **gioco** (`src/18`) | spazio minimo 12,6 px | **17,6 px** (tutti 17,6-18,7) | `__CPM_NO_BARRA72` → 12,6 px | `barra-360-72` (nuovo) |

## 1. «Ricevi fra le linee» — mira dell'eroe in `hl_result`

**Misura prima** (`linee-61`, 4 partite vere, GLB acceso, teatro attivo, attesa reale; 8 scene): a pallone non in volo l'eroe
era fuori quadro nel **37,3%** dei fotogrammi (138/370; il collaudo 173 aveva 25,0%). Ripartizione dei fotogrammi fuori:

| tratto del post-arco | soggetto della regia | fuori / totale |
|---|---|---|
| < 0,9 s, respinta (`deflect`) | pallone | 49 / 90 |
| < 0,9 s, rete (`in_net`) | pallone | 34 / 36 |
| < 0,9 s, compagno che finalizza (`assist_recv` + `assist_shot`) | pallone | 33 / 33 |
| 0,9-1,6 s (la camera torna sull'eroe, giro 61) | eroe | 22 / 81 |
| ≥ 1,6 s | eroe | 0 / 68 |

Il giro 61 riportava la storia sull'eroe solo dopo 0,9 s; il guardiano giudicava solo la coda (≥ 1,6 s) e quindi passava.

**Correzione** (`src/12`, bisezione 7.306 della camera): la bisezione che arretra il bersaglio della camera per tenere DENTRO il
pallone ora pretende dentro anche l'eroe quando il soggetto è il pallone, in `hl_result`, a pallone non in volo, eroe entro 40u,
mai sugli highlight difensivi. La regia sul pallone (7.522) non cambia; il tetto d'arretramento (34u, confine dello stadio) neppure.

**Dopo:** 9 scene, a pallone non in volo fuori **0,6%** (3/477), in volo 1,9% (6/311), coda 0/169, soggetto sull'eroe 277/277.
**Rosso** `CPM_ROSSO=__CPM_NO_LINEE72`: 34,7% (144/415) → `✅ ROSSO come atteso`. Altezza apparente mediana dell'eroe in
`hl_result`: 0,085 prima, 0,086 dopo (l'arretramento non ha rimpicciolito l'eroe nel campione).
**Guardiano:** `linee-61 --guardiano` ora giudica anche (c) il totale a pallone non in volo, ≤ 15% con almeno 40 fotogrammi.

⚠️ Le scene cambiano fra due giri (stesso nome/seme, scene diverse): nel giro «dopo» i post-arco erano tutti respinte
(`deflect` 115 fotogrammi), senza `in_net` né `assist_*`. Vedi «Non verificato».

## 2. PO-277 — «a fine ingresso i corpi non sono pronti»

**Misura** (`ingresso-277`, braccio verde da solo, rete lenta 25 s sui corpi): ingresso concluso a **145,9 s** reali (durata di
scena dichiarata 23,96 s), corpi pronti a **24 s**, `corpiAllaFine: true`, attesa dopo l'ingresso **0 s**, velo 0 s.
Il collaudo 172 (due sonde in parallelo su 4 core) non aveva visto la fine dell'ingresso entro il tetto di 320 s: `uscitaS` nullo
→ `corpiAllaFine` nullo → il guardiano scriveva «i corpi non sono pronti (la partita aspetta)». **Nel campione misurato la partita
non aspetta: non è un difetto del gioco.** Correzione dello strumento: ingresso non concluso entro `CPM_TMAX` = **CIECO (uscita 2)**,
con i secondi a cui i corpi erano pronti; in più il verde ora giudica anche l'attesa dopo l'ingresso (> 1 s = rosso).
Prova del ramo cieco: `CPM_BRACCI=verde CPM_TMAX=40000` → uscita 2, «corpi pronti a 20,6 s: NON GIUDICATI».

## 3. `schede-finale` parte B

Zero schede del pari = la parte B non ha giudicato niente → ora `fail` (uscita 1) invece di una riga «dichiarato, non rosso».
Rigiocata col default (4 partite): parte A verde, parte B **4/4 partite finite, 1 scheda del pari (p1 81', rete), 0 senza fatto**,
uscita 0.

## 4. `pulizia-072`

Default prima: `origin/lavoro/172`, ramo inesistente sul remoto. Ora due commit fissati: base `19128217^1` (genitore del commit di
pulizia del giro 63, pre-173), «oggi» `19128217`. La riga `const GAME_VERSION="…"` è normalizzata su entrambi i lati.
`CPM_BASE`/`CPM_OGGI=<ref>|file` restano per pulizie future. Esito: codice traspilato **identico**, 0 riferimenti vivi ai rimossi,
pagina fuori da Babel identica → verde. Rosso `CPM_ROSSO072=1` (SAVE_VERSION 9→8 in memoria) → uscita 1.

Scelta dichiarata: non ho creato un tag (`pre-173`) perché pubblicare un tag è un'azione in più sul remoto; il commit fissato
nel guardiano fa lo stesso lavoro. Se la sessione principale preferisce il tag: una riga.

## 5. PO-171 — ritratto dell'eroe

Sonda nuova `ritratto-171-72` (412×915, GLB acceso, contesto nuovo per schermata). Il ritratto oggi è una figurina del catalogo
volti (`assets/portraits/…`), non più un render CH38.

| schermata | ritratto | richieste CH38 | img rotte | foto |
|---|---|---|---|---|
| creazione | carta grande 144×111 px, caricata (512 px nativi), 11 volti nella pagina | 0 | 0 | `docs/sviluppo/foto-giro72/ritratto-171-72-verde-creazione.png` |
| home carriera | testata 31×45 px, `volto-0009.webp` caricato | 0 | 0 | `…-verde-home.png` |
| profilo (tab Carriera) | testata 31×45 px, caricato | 0 | 0 | `…-verde-carriera.png` |

**Non rotto: nessuna correzione al gioco.** Rosso di strumento (richieste `assets/portraits/` negate): ritratto assente in tutte e
tre → il guardiano lo vede. Nota: nel profilo non c'è un ritratto grande, solo quello della testata (verificato a occhio sulla foto).

## 6. Voci basse

**6a PO-278, pallone «in partita».** Misurato (`pallone-278` verde): rapporto 0,209, scala 0,884 — più del contatto (×1,3 = 0,81):
era il pavimento di taglia del 7.862/7.899. Due cause, tutte e due nel blocco del pavimento:
1. *sotto `__CPM_REC`* (acceso proprio dal guardiano) il testimone riusava il vettore del centro-pallone per proiettare l'eroe un
   fotogramma su cinque, e il pavimento misurava l'«uomo» contro il centro dell'EROE → pavimento a 9 px. Artefatto che cambiava
   il pallone solo in collaudo; ora vettori propri;
2. il pavimento misurava il diametro lungo la **verticale** del mondo, scorciata dalla camera inclinata, mentre una sfera a
   schermo è tonda: ora lo misura lungo il vettore destro della camera, come il guardiano.

Dopo (tre giri verdi con le due correzioni): partita 0,161 · 0,161 · 0,16; due giri verdi, uno rosso per l'alone di hl40 0,64 (vedi «Non verificato»);
campionamento nuovo di 4 s in partita: **massimo 0,161** (mediana 0,125-0,16, 83-86 campioni). Rosso `CPM_EXTRA=__CPM_NO_PALL72`:
massimo **0,192** su 82 campioni → rosso. Margine del rosso **stretto** (0,192 contro 0,19): dichiarato.
Ingresso 0,142, hl0 0,133-0,141, hl40 0,141-0,153 (invariati).

**6b `premiazione-palco-191`.** L'attesa fissa di 9 s raccoglieva tanti campioni quanti fotogrammi: sotto carico 14 < 20. Ora si
attende finché i campioni del sollevamento arrivano a 24 (tetto 40 s). Verde 26 campioni, 0 in volo, 18 sul corpo; rosso 25 campioni,
5 in volo → verde.

**6c Barra in basso a 360 px.** Sonda nuova `barra-360-72` (rettangoli reali del testo, non il box del bottone). Prima: bottoni di
larghezza uguale, spazio fra le etichette 17,9 · 18,7 · 18,5 · **12,6** (Carriera|Agente) · 17,2 · 18,1 px. Correzione (`src/18`):
`flex:"1 1 auto"` — base = contenuto, lo spazio libero si divide in parti uguali → 17,6-18,7 px fra tutte le voci a 360 px,
24,8-26,1 a 412 px; scroll orizzontale 0. Rosso `__CPM_NO_BARRA72` → 12,6 px.
Foto: `docs/sviluppo/foto-giro72/barra-360-72-{verde,rosso}-360.png`.
**Prezzo misurato:** il bottone più stretto (HOME) passa da ~51 a **40,4 px** di larghezza a 360 px (47,8 a 412); l'altezza resta ~46.

## 7. Decisione per la sessione principale (6c)

Spazi uguali e bersagli larghi 44 px non stanno insieme a 360 px: con spazi uguali HOME misura 40,4 px; con `minWidth:44` gli
spazi tornano diseguali (provato: 14,4 px fra Carriera e Agente).
- **A (consigliata, applicata):** spazi uguali, HOME largo 40,4 px e alto ~46 — sopra i 24 px di WCAG 2.2 AA, sotto i 44 consigliati.
  Il guardiano chiede ≥ 40 px.
- **B:** tornare ai bottoni uguali (`__CPM_NO_BARRA72` reso definitivo) e accettare 12,6 px fra Carriera e Agente.
- **C:** etichetta più corta per una voce (es. «Profilo» al posto di «Carriera»): spazi e larghezze migliorano insieme, ma cambia
  un nome che il PO vede ogni giorno.

## 8. Catena eseguita

| Passo | Esito | Durata |
|---|---|---|
| `test:logic` | verde | 5 s |
| `save-compat` | verde | 17 s |
| `design-system` | verde | <1 s |
| `griglia-mobile` | verde | 207 s |
| `career-critical` | verde | 859 s |
| `validate-situations` | **14/14 verde**, fingerprint 00001505, 0 failure | 785 s |
| guardiani MAPPA `src/12` eseguiti | `linee-61` (verde+rosso), `pallone-278` (verde+rosso), `ingresso-277` (verde misura + cieco), `premiazione-palco-191`, `camera-252` (verde: passo massimo 1,5u ai cambi di soggetto; rosso 35,1u), `framing-guard` (verde: mediana 0,097, eroe fuori 2,1%) | |
| guardiani MAPPA `src/18` eseguiti | `barra-360-72`, `ritratto-171-72`, `schede-finale` (non in MAPPA), `chip-269`, `home-066` (112 riquadri, 0 fuori standard), `rinnovo-270` — tutti verdi | |
| `pulizia-072` | verde, rosso uscita 1 | |

Guardiani nuovi aggiunti a `package.json` e alla MAPPA di `ci-runner.mjs` (`src/18`: `barra-360-72`, `ritratto-171-72`;
`src/1[17]`: `ritratto-171-72`; catena `grafica`: `barra-360-72`).

## 9. Non verificato

- **Guardiani MAPPA non eseguiti.** La MAPPA indica ~45 guardiani per `src/12` e ~42 per `src/18`; ho eseguito solo quelli elencati
  al § 8. In particolare **non** ho rigiocato `inquadra-273`, `salti-274`, `avvicinamento-61`, `partita-vera`, `goal-postarc`, `esiti-218`: la correzione 1 cambia il bersaglio della camera in **tutti** gli `hl_result` con
  soggetto-palla a pallone fermo, non solo «fra le linee». Va chiusa con la catena `mirata`/`notte` prima della promozione.
- **Correzione 1 sui casi `in_net` e `assist_*`:** nel giro «dopo» non sono capitati (solo respinte). Il difetto prima era lì per
  67 fotogrammi su 138: non posso confermare il valore dopo su quei due casi.
- **Correzione 1 sul telefono:** headless a pochi fps; l'arretramento è sul bersaglio (prima dei lerp), ma la resa del movimento
  di camera non è giudicabile qui.
- **PO-277 sul dispositivo:** headless non dice la durata reale dell'ingresso né se su rete vera i corpi arrivano prima della fine.
- **PO-278 alone di hl40:** su cinque giri del braccio verde uno ha dato 0,64 (> 0,45), gli altri 0,09-0,24. Non ho isolato la causa.
- `framing-guard` è stato eseguito solo dopo la correzione: non ho il numero «prima» sullo stesso build per confronto.
- **Il rosso di PO-278 (6a) ha margine stretto** (0,192 contro 0,19).
- `schede-finale`: il ramo «0 schede → uscita 1» non è stato esercitato su una corsa vera (nel giro c'era 1 scheda); è una riga.
- Barra a 360 px su telefono reale e con caratteri di sistema diversi: misurato solo in headless coi caratteri incorporati.
