# Rapporto giro 30 — PO-217 analisi pre-partita · PO-066 riquadri della home fuori standard

Ramo `sviluppo/grafica-217-066`, partito da c713d9e (gioco 7.999.169). `GAME_VERSION` **non** cambiata (istruzione del giro).
Giro di **sola grafica**: toccata solo la presentazione (`src/13`, `src/15` una prop, `src/18`). Zona G ferma: nessun dato salvato,
nessuna regola di carriera/economia/partita cambiata, nessun campo nuovo nel salvataggio. Nessun push su `main`, nessun force push.

Fonti lette: `CLAUDE.md` (direttiva PO 22/09 «la catena si sceglie in base a cosa si e' toccato» → catena di sola grafica);
`docs/governo/BACKLOG.md` voci PO-217 e PO-066; la foto `docs/governo/foto/po217-analisi-prepartita.jpg`. PO-066 non cita foto
proprie (rimanda alla roadmap e al rapporto UI di Codex: «Profilo e Nazionale da portare alla card neutra»).

---

## 1. PO-217 — analisi pre-partita

### Prima (misurato, `tests/visual/analisi-217.mjs`, percorso vero: carriera → pre-partita → «Analisi dell'avversario»)

| taglia | vuoto piu' grande | difficolta' | nome avversario | figurina del mister |
|---|---|---|---|---|
| 412x915 | **485 px** fra «Il consiglio del mister» e «Entra in campo» | 20 px | 17 px | no |
| 360x780 | **331 px** stesso punto | 20 px | 17 px | no |

Nota: nella foto del PO il pulsante seguiva il contenuto e il vuoto stava **sotto** il pulsante. Sul ramo c'era gia' un primo
ritocco (`__CPM_NO_PO217`, giro 10) che spingeva il pulsante in fondo: il vuoto si era solo spostato **sopra** il pulsante.
Il «prima» qui sopra e' quello stato.

### Dopo

Stessi dati del report di oggi (`difficulty`, `strengths`, `recommendation`, `memNote`, `h2h`, `weaknesses` alle stesse
condizioni del 7.999.49). Nessun dato nuovo.

1. **Testata**: occhiello «Analisi pre-partita», i due stemmi della partita (il tuo club piccolo, «VS», l'avversario grande),
   il nome dell'avversario in grande (FS.title, FS.h sugli schermi alti), la lega; sotto, la difficolta' come numero display
   (FS.display, FS.displayLg sugli schermi alti) con l'etichetta e la barra in un riquadro `surface2`. La testata **assorbe**
   l'altezza che avanza (contenuto centrato).
2. **Da neutralizzare**: i due punti forti come righe numerate (pastiglia ambra `RAD.sm`), corpo FS.body.
3. **Il consiglio del mister** come voce: figurina del mister (`Figurina tipo="mister"`, il mister di **questa** partita
   via `misterInPartita` — il CT in Nazionale), il suo nome, la frase in un fumetto `surface2` col filetto di marca.
4. **Entra in campo** primario in fondo, in un piede appiccicato (sempre visibile).
5. Altezza: `100dvh` sforava di 28 px (padding in fondo allo scorritore `.cpm-scroll`) e il piede copriva il fondo dell'ultima
   card. Ora l'altezza utile si **misura** (`useLayoutEffect`, hook in testa prima dei `return` condizionali) e sugli schermi
   alti (≥ 820 px utili) stemmi, numeri, figurina e corpo salgono di un passo della scala FS.

**Il giocatore da neutralizzare con la sua figurina: Non esiste nel gioco.** Il report dello scout non nomina un giocatore:
`strengths` sono due frasi di reparto (`prof.solid.strDesc` + una frase del pool per prestigio, `src/09`
`generateLocalScoutReport`). Disegnare una figurina vorrebbe dire scegliere un nome dalla rosa avversaria, cioe' inventare un
dato. Non l'ho fatto; se il PO lo vuole serve una decisione (quale giocatore e con che regola).

Il tuo stemma nella testata: e' il club (o la Nazionale) della partita, gia' nel gioco; oggi non compariva in questa schermata.
Lo dichiaro come scelta di presentazione.

| taglia | V1 vuoto fra blocchi | V2 vuoto dentro una card | difficolta' | nome | figurina mister | pulsante |
|---|---|---|---|---|---|---|
| 412x915 U18 | 28 px | 77 px (testata) | 44 px | 24 px | si' | 827-875, ultimo |
| 360x780 U18 | 28 px | 4 px | 32 px | 20 px | si' | 692-740, ultimo |
| 412x915 pro (consiglio lungo) | 28 px | 54 px | 44 px | 24 px | si' | 827-875 |
| 360x780 pro | 28 px | 4 px | 32 px | 20 px | si' | 692-740 |

I 28 px residui sono il padding in fondo allo scorritore della partita, non della schermata.

### Interruttore rosso e guardiano

- `window.__CPM_NO_PRE217` → torna la schermata di prima (quella `scout23`, compreso il ritocco del giro 10).
- Guardiano `npm run analisi-217` (`tests/visual/analisi-217.mjs`): V1 vuoto fra blocchi ≤ 64 px · V2 vuoto dentro una card
  ≤ 96 px · O1 nessuno sforamento · R1 raggi solo della scala RAD · T1 corpi solo della scala FS · G1 difficolta' ≥ FS.display
  e nome ≥ FS.title · M1 figurina del mister dentro il consiglio · B1 pulsante ultimo e dentro lo schermo.
  - verde: **VERDE** (412 e 360, U18 e pro, chiaro e scuro);
  - rosso (`CPM_ROSSO=1`): **ROSSO** — V1 485/331 px, G1 20/17 px, M1 assente.

Foto (`docs/sviluppo/foto/analisi217/`): `prima-412.png` `prima-360.png` `prima-412-scuro.png` `prima-360-scuro.png` ·
`verde-412.png` `verde-360.png` `verde-412-scuro.png` `verde-360-scuro.png` · `verde-pro-412.png` `verde-pro-360.png` ·
`rosso-412.png` `rosso-360.png`.

---

## 2. PO-066 — riquadri della home

### Censimento (guardiano `tests/visual/home-066.mjs`, stili calcolati sul DOM vero, fisarmoniche aperte)

Sette situazioni: U18 inizio stagione (S1 W1) · pro inizio (S4 W2) · pro meta' (W19, mercato invernale, lista cessioni, finale di
coppa) · pro fine (W36) · pro infortunato (W12, stiramento medio) · pro svincolato (W23, contratto scaduto) · pro W30 con 34 gol.
**112 riquadri** in tutto. Regole: R1 raggio esterno (card = RAD.md) · R2 raggi interni della scala · T1/T2 corpi della scala e
sopra il pavimento · C1 niente fondi scuri/sfumati dentro una card chiara · O1 niente sforamento · F1 fondo del riquadro = fondo
della card (scelta PO 27/09 «Card neutra») · A1 sulla home la fisarmonica e' la Card col «momento» · P1 un riquadro del
procuratore ha la sua figurina. Esclusi dalla misura: l'interno degli stemmi (SVG) e delle figurine, le barre alte ≤ 8 px, la
testata dell'eroe, il pulsante «Vivi la Settimana» (e varianti) e il piede «Sostieni / Idee».

### Ogni riquadro, prima e dopo (412 px, tema chiaro; a 360 px stesso esito)

| riquadro | dove compare | prima | dopo |
|---|---|---|---|
| Prossima partita (campionato / Coppa / Primavera) | tutte | **R1** raggio 16 (RAD.lg) invece di 12 | raggio 12 come le altre card |
| Stagione · settimana (partite, gol, assist) | tutte | nel kit | invariato |
| Fiducia del mister · Popolarita' | tutte | nel kit | invariato |
| La tua storia | pro inizio/meta'/fine/W30 | nel kit | invariato |
| Il progetto del club | pro | nel kit | invariato |
| Offerta di sponsor | pro | nel kit | invariato |
| Il tuo procuratore: boutique o global? | pro | **P1** nessuna figurina (le altre card del procuratore ce l'hanno) | figurina del procuratore + nome, come la card dell'iniziativa |
| Mercato estivo/invernale aperto | pro W2, W23 | **F1** fondo azzurro `bgBlue` | fondo della card, testo secondario `muted`, titolo colorato |
| Sei in lista cessioni | pro W19 | **F1** fondo ambra `bgAmber` | fondo della card, colore nel titolo e nel pulsante «Ritira» |
| Infortunio (stiramento) | pro infortunato | **F1** fondo rosa `bgRed` | fondo della card; pastiglia di gravita' `RAD.pill` invece di `RAD.xl` |
| Contratto scaduto | pro svincolato | **F1** fondo ambra | fondo della card, sottotitolo `text` |
| Obiettivi personali | pro | **A1** cappello maiuscolo della `Fisarmonica` delle schede (raggio 6, card attaccata sotto) | Card col momento, raggio 12, aperta come prima |
| Mercato invernale aperto — fino alla settimana 23 | pro W19 | nel kit | invariato |
| È arrivato uno che gioca nel tuo ruolo | pro | nel kit | invariato |
| Il mondo fuori | pro | nel kit | invariato |
| La corsa al capocannoniere | pro | nel kit | invariato |
| La tua settimana | tutte | nel kit | invariato |
| Duello capocannoniere | pro | nel kit | invariato |
| Vita privata | pro W36, W12 | nel kit | invariato |
| Lo spogliatoio | pro W30 | nel kit | invariato |
| Obiettivi della stagione | tutte | nel kit | invariato |
| Notizie della settimana | pro | nel kit | invariato |
| Voci di mercato | pro | nel kit | invariato |
| Classifica | pro | nel kit | invariato |
| Ultime notizie | tutte | nel kit | invariato |

Totali: **prima 24 riquadri fuori standard su 112** (412 e 360, chiaro) → **dopo 0 su 112** (412 e 360, chiaro e scuro).

Portati nel kit con lo **stesso componente** ma **non visti in nessuna delle sette situazioni** — Non posso confermarlo con una
misura sullo schermo: «Record watch / Record battuto» (la situazione W30 con 34 gol non lo ha acceso: dipende da
`leagueGoalsOf`, che legge lo storico partite), «Movimenti di Lega — Fine S.» (W ≤ 4 dopo una promozione/retrocessione) e il
riquadro della coppa europea in corso. Tutti e tre passano dalla stessa `FisHome66` di «Obiettivi personali»; il «Record
battuto» perde anche il fondo ambra.

### Interruttore rosso e guardiano

- `window.__CPM_NO_HOME066` → tutti i riquadri tornano come prima (fondi tinti, raggio 16, Fisarmonica, niente figurina).
- Guardiano `npm run home-066`: verde **0/112** (412 e 360, chiaro e scuro); rosso (`CPM_ROSSO=1`) **24/112** a 412 chiaro —
  identico al censimento del build di partenza (17/112 in tema scuro: lì due fondi tinti scuri non superano la soglia di
  luminanza di F1).

Foto (`docs/sviluppo/foto/home066/`, JPEG): `<situazione>-prima-<412|360>[-scuro].jpg` e `<situazione>-verde-<412|360>[-scuro].jpg`
per le sette situazioni (56 foto), piu' i censimenti `censimento-*.json`. Le foto «prima» in chiaro sono del build di partenza;
quelle «prima» in scuro sono del braccio rosso sul build nuovo (che ripristina la grafica di prima per costruzione), perche' la
prima stesura della sonda non forzava davvero lo scuro.

---

## 3. Codice toccato

- `src/13-prepartita-formazioni.jsx` — `ScoutReportScreen`: nuovo ramo PO-217 (props nuove `mister`, `mine`; hook di misura
  dell'altezza in testa). Il ramo `scout23` resta intatto come braccio rosso.
- `src/15-live-match.jsx` — una riga: la chiamata a `ScoutReportScreen` passa `mister` (`misterInPartita`) e `mine` (lo stemma
  che non e' l'avversario).
- `src/18-career-app.jsx` — `FisHome66` (componente di **modulo**: definito dentro `CareerApp` azzererebbe lo stato aperto/chiuso a
  ogni render), `_h66`, e le patch ai riquadri della tabella.
- `CARRIER-MANAGER-AV.html` rigenerato: `CPM_FORZA_BUILD=1 node tools/build-src.mjs` → `node tools/check-src.mjs` **IDENTICO
  BYTE PER BYTE** (7.217.287 byte ricomposti da 21 frammenti).
- `tests/visual/analisi-217.mjs`, `tests/visual/home-066.mjs` (nuovi); `package.json` (script `analisi-217`, `home-066`);
  `ci-runner.mjs` (entrambi nella catena `grafica`; `analisi-217` nella mappa di `src/12-13`, `home-066` in quella di `src/18`).

## 4. Catena di sola grafica

| passo | esito |
|---|---|
| `griglia-mobile` (in cartella temporanea, per non riscrivere le foto versionate) | 0 px di overflow e 0 elementi fuori su tutte le schermate e le 5 larghezze · 0 testi sotto 10 px · 0 nodi sotto soglia di contrasto. Dashboard 1668 → 1728 px a 360 (figurina del procuratore e card col momento). «prepartita: playMatch → nomatch» NON misurato: c'era gia' nel REPORT versionato |
| `design-system` | ✅ SISTEMA GRAFICO OK — nessun corpo sotto 11 px, nessun raggio a mano che duplichi un token |
| `career-critical` (11 passi) | ✅ exit 0 |
| `test:logic` | 43/43 |
| `save-compat` | 12 pass · 0 fail |
| `analisi-217` | verde VERDE · rosso ROSSO |
| `home-066` | verde VERDE · rosso ROSSO |

Il quality gate completo e `partita-vera` **non** sono stati eseguiti (catena di sola grafica, direttiva PO 22/09).

## 5. Limiti dichiarati

- **Tema scuro**: dal 7.947 il gioco ha **un solo tema** (chiaro). Le foto «scuro» sono una prova di robustezza dei token
  forzata dalla sonda (`TH_DARK`; per la home uno shim che devia la riassegnazione del tema in `CareerApp`), non una schermata che
  il giocatore puo' vedere. In quel tema forzato la testata dell'eroe resta chiara e i titoli delle card col momento non si
  leggono (inchiostro ereditato dalla pagina): e' cosi' anche per le card che non ho toccato, e non l'ho corretto.
- Chromium headless alla taglia del telefono, non un Android vero.
- Le figurine mostrano il volto del catalogo locale; senza catalogo resta il riquadro bianco voluto dal PO (7.973).
- Rilanciando `home-066` con `CPM_FOTO=1` le foto escono in PNG accanto ai JPEG versionati.
- `BACKLOG.md` e `ROADMAP.md` non aggiornati da me: nessuna versione spedita in questo giro; lo stato delle voci lo decide chi
  integra.
