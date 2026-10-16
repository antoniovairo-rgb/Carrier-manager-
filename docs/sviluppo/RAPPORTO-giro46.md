# Rapporto giro 46 — PO-071 fase 3: nuove tipologie di stadio, pubblico/cartelloni/luci, ingresso in campo

Ramo `sviluppo/stadi-071-giro46`, partito da `lavoro/171-base` (5eb5500, gioco 7.999.170 + giro 22). `GAME_VERSION` e
`SAVE_VERSION` **non** cambiate (istruzione del giro). Zona G ferma: nessun dato salvato, nessuna regola di carriera/economia/
partita, nessun campo nuovo nel salvataggio. Nessun push su `main`, `poc/*`, `lavoro/*`; nessun force push.

Fonti lette: `docs/governo/BACKLOG.md` riga PO-071 («fase 3: nessuna release», «la grafica degli stadi deve essere migliorata il
più possibile»), `docs/governo/ROADMAP.md` righe 7.999.69/70/71, sonde `galleria-stadi`, `stadi-70`, `pali-69`.

File toccati: `src/10-folla-stadi-ritiro.jsx` (dati: template e assegnazione), `src/11-ui-kit-highlight.jsx` (`buildStadium` e
`makeCrowdTex`), `src/12-three-match-view.jsx` (hook di collaudo, partenza delle file, camera dell'ingresso, varco nei cartelloni).
`CARRIER-MANAGER-AV.html` ricomposto con `CPM_FORZA_BUILD=1 node tools/build-src.mjs`, `node tools/check-src.mjs` → identico byte
per byte.

---

## 1. Galleria «prima»

`npm run galleria-stadi` sulla base pulita (worktree di `lavoro/171-base`, stesso script del ramo), 13 impianti di oggi × giorno e
notte (`__CPM_TOD` congelato, invariante 7.539), viste `tv · aereo · tunnel · curva` (+ `porta · prato · alto` nei PNG grezzi).
Le due viste nuove della galleria servono a questo giro: **aereo** (l'architettura intera) e **tunnel** (la bocca dell'ingresso).
Con `CPM_VISTE=…` si fotografano solo alcune viste.

Cosa mostra il «prima» rilevante per il giro: le 10 tipologie di oggi differiscono per numero di anelli, coperture, angoli e torri,
ma **tutte hanno gradinate in cemento su quattro lati**; il campo di provincia è la versione bassa dello stesso disegno; **nessun
impianto ha un tunnel**: le squadre partono da (x −24/−16, z −36) e la vista `tunnel` mostra in quel punto un cartellone
(«SCARPE DA GARA»).

## 2. Le quattro nuove tipologie (procedurali, nessun asset)

| tipologia | per chi (deterministico, `stadiumKind46`) | architettura |
|---|---|---|
| **borgo** | metà dei campi Primavera; un club su tre con capienza < 13.000 e prestigio < 70 | una sola tribuna coperta (pensilina); gli altri tre lati sono **terrapieni d'erba** con la gente in piedi (texture del pubblico su fondo d'erba, niente sedili), fianco esterno del terrapieno che scende verso la campagna; torri a traliccio più basse (×0,78); fondale «paese» |
| **catino** | un club medio su sei (14.000-38.000) | anello unico ripido e continuo, angoli chiusi a gradinata, nessuna copertura, **coronamento in cemento con filetto nel colore del club** che lega le quattro sommità passando sugli angoli |
| **mattoni** | un club medio su sei nelle leghe di tradizione (Premier, Championship, Lega A/B, Oranje, Belga) | muri in **mattoni** (due toni per club), due anelli, coperture, nessuna recinzione, **frontone** nel colore del club con cornice chiara sul colmo della tribuna principale, quattro torri d'angolo |
| **arena** | un club su tre con capienza ≥ 48.000 e prestigio ≥ 80 | tre anelli (due su telefono, cap esistente), copertura completa che diventa **anello senza interruzioni** (falde d'angolo) e **corona LED** nel colore del club; cartelloni LED |

Assegnazione: funzione pura di `hashStr(club.id|stadio)` (bit diversi da quelli già usati), lega, capienza e prestigio — la stessa
capienza del profilo piazza, quindi **la tipologia cambia l'architettura, mai l'affluenza**. Si applica dopo le regole esistenti
(«un 32k+ non pesca il template basso», «un <12k non ha 3 anelli»), Nazionale esclusa. Override dati `club.stadium` intatto.
Sui 288 club (prima squadra + Primavera): **borgo 16 · catino 34 · mattoni 11 · arena 8**, 0 incoerenti, 0 non deterministici
fra due letture e due caricamenti.

## 3. Grafica correlata (scelta del PO)

- **Pubblico**: nel borgo i settori-terrapieno disegnano il pubblico su erba (via gradini e sedili vuoti); altrove invariato.
- **Cartelloni**: nel borgo le tavole di `buildStadium` sono «sponsor di paese» dipinti (crema, colore del club, verde, ruggine),
  mai LED; l'arena li ha LED (era già la regola `modernity>0,55`). ⚠️ La fila di cartelloni sponsor davanti (quella di `src/12`,
  «BANCA MERIDIA» ecc.) è la stessa per tutte le tipologie: non l'ho differenziata.
- **Luci**: stesso **numero** di luci di oggi (misurato: 13 in ogni tipologia nuova; «mattoni» coi pali perimetrali ne accendeva
  17 e il guardiano l'ha bocciato → torri d'angolo). Colore: borgo più caldo, arena bianco freddo (mescola sul colore di lega).
- **Ingresso in campo**:
  - **tunnel** in ogni impianto (anche quelli di oggi) a x −22: portale nel colore del club nella base della Tribuna Ovest; nel
    borgo una pensilina verde; se la tribuna è arretrata un tunnel telescopico fino a bordo campo (arena: **vetro** con fascia
    luminosa del club, 9,4u; altri: grigio). Il cartellone davanti alla bocca è tolto (varco).
  - le due file escono **affiancate dalla bocca del tunnel** (x −23,6 / −20,4, z −36 come prima) invece che da due punti distinti.
  - **camera**: i primi 3,2 s guardano la bocca del tunnel della tipologia mentre escono i primi, poi l'orbita (che parte già da
    quel lato del campo) compressa nei secondi restanti, stessi 12 s; quota dell'orbita per tipologia (borgo ×0,70, catino ×0,92,
    arena ×1,14). Misurato (`stadi-071-ingresso`): borgo 17,8→12,9 contro 25,3→18,4 di oggi; arena 28,1→21,0 contro 25,2→18,4.

Interruttore rosso **`window.__CPM_NO_STADI246`**: nessuna nuova tipologia assegnata, niente terrapieni/coronamento/frontone/
corona, niente tunnel né varco, partenze e camera dell'ingresso di oggi.

## 4. Costo (telefono) — misurato in headless, stesso build, rosso contro verde

Guardiano `stadi-071` (vista TV fissa, notte), riferimento = stadi di oggi nello stesso giro:

| | mesh impianto | draw call TV | triangoli TV | luci |
|---|---|---|---|---|
| oggi provincia 3000 / storico 18000 / moderno 30000 / tedesco 50000 | 149 / 227 / 252 / 254 | 338 / 355 / 361 / 364 | 15.054-16.094 | 13 |
| **borgo 3000** | 143 | 341 | 15.120 | 13 |
| **catino 24000** | 177 | 342 | 15.698 | 13 |
| **mattoni 22000** | 219 | 356 | 16.060 | 13 |
| **arena 60000** | 273 | 365 | 16.220 | 13 |

Sonda `stadi-071-fps` (2 giri per braccio su pagina nuova, media; braccio «oggi» = rosso sulla stessa tipologia forzata):

| | fps oggi → nuovo | draw call | triangoli |
|---|---|---|---|
| borgo 3000 | 21,5 → 22,5 | 311,5 → 322,5 | 13.452 → 14.041 |
| catino 24000 | 21,0 → 19,5 | 316 → 322 | 14.231 → 14.621 |
| mattoni 22000 | 20,0 → 21,0 | 321 → 323 | 14.228 → 14.230 |
| arena 60000 | 18,0 → 18,5 | 326 → 328 | 14.254 → 14.362 |

Lettura onesta: draw call +0,6…+3,5%, triangoli ≤ +4,4%, luci invariate; l'fps headless si muove di ±1,5 fra i bracci, cioè entro
il rumore dello strumento (software rendering, nessuna GPU). **Sul telefono non l'ho misurato.**

## 5. Foto prima/dopo — `docs/sviluppo/foto-giro46/`

- `<impianto>-<night|day>.jpg` (13 × 2): ogni impianto di oggi, riga PRIMA (base) e DOPO (ramo), viste tv · aereo · tunnel ·
  curva. Il «dopo» degli impianti di oggi cambia solo per tunnel e varco.
- `NUOVA-<tipologia>-<night|day>.jpg` (5 × 2): la nuova tipologia (DOPO) sopra l'impianto in cui oggi gioca la stessa fascia
  (PRIMA): borgo 3000 ↔ provincia 3000, borgo 9000 ↔ comunale 9000, catino 24000 ↔ storico 18000, mattoni 22000 ↔ inglese 30000,
  arena 60000 ↔ tedesco 50000. ⚠️ Gli abbinamenti sono di fascia, non lo stesso club.
- `INGRESSO-borgo-3000-night.jpg`, `INGRESSO-arena-60000-night.jpg`: l'ingresso vero (salvataggio → partita → walkout), 4 istanti,
  oggi contro nuovo: nel nuovo si vede l'uscita dal tunnel (borgo: sotto la pensilina coi bambini; arena: le squadre nel tubo di vetro).

⚠️ Tutte le foto sono **GLB spento** (corpi procedurali). Per l'architettura dello stadio non cambia nulla; le foto
dell'ingresso andrebbero rifatte col CH38 (direttiva PO 29/07) se si vuole giudicare la scena coi corpi veri.
⚠️ Le viste `tv/alto/curva` degli impianti «dopo» sono state scattate prima di un ritocco di 0,08u alla bocca del tunnel (portata
davanti allo striscione della competizione, che la tappava); le viste `tunnel/aereo` sono sul build finale.
⚠️ Visibili nella vista `tunnel` dei dintorni della bocca alcuni blocchi bassi colorati a bordo campo: ci sono anche nel «prima»,
non li ho introdotti né identificati.

## 6. Guardiani e rituali (build finale 96ca2c2)

Tutti sul build del codice finale (commit 96ca2c2; i commit successivi sono solo documenti), browser `CPM_CHROME=/opt/pw-browsers/chromium`.

| controllo | esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs` | identico byte per byte |
| `node tools/audit-copyright.mjs` | ✅ 0 riferimenti al mondo reale (nessun nome nuovo introdotto) |
| **`stadi-071`** (nuovo) | ✅ verde e rosso visibile (numeri in §4) |
| `stadi-70`, `pali-69` | ✅ verdi, rossi visibili |
| `fps-249` | ✅ |
| `ingresso-camminata-245` rifatto da solo sul build finale | ✅ (e di nuovo ✅ in catena) |
| `galleria-stadi` (collaudo) | 18 impianti × 2 ore, 0 errori di pagina, 0 `__CPM_STADFAIL` |
| ingresso: `fila-227`, `bambini-236`, `ingresso-245`, `ingresso-camminata-245` | ✅ tutti e quattro (anche fuori catena, prima dell'apertura sul tunnel; `fila-227`, `ingresso-245` di nuovo verdi in catena) |
| catena `node ci-runner.mjs mirata origin/lavoro/171-base` (nucleo + guardiani di src/10, 11, 12: **66 passi**) | **65/66 verdi** (giro composto in tre tronconi per due riavvii del container; registrato in `docs/governo/STABILITA.json`). Rosso: `difesa-252` (vedi sotto, identico sulla base). Instabile: `difesa-220-scena` (rosso alla prima prova, verde alla seconda; anche sulla base lo storico mostra un giro da 3185 s, cioè rilanciato). Fra i verdi: `validate-situations` (gate 14/14), `career-critical`, `test:logic`, `save-compat`, `design-system`, `typing-shortcuts`, `griglia-mobile`, `partita-vera`, `stadi-071`, e i quattro dell'ingresso |

**`difesa-252` rosso — non è di questo giro.** In catena è rosso tre volte con lo stesso quadro: braccio verde perfetto (fermo
0,03-0,07, 0/4 sopra 0,8) ma braccio ROSSO che non mostra il difetto (0/4, soglia «almeno 2»). Fatto girare sulla **base pulita**
(`lavoro/171-base`, worktree) nelle stesse condizioni: **identico** (verde 0,03-0,07 · rosso 0,49-0,53 · `❌ difesa-252 ROSSO`).
Il guardiano tocca l'eroe negli interventi difensivi, non lo stadio: è il suo braccio rosso a non reggere la soglia 0,8 sotto
carico (la catena gira i passi lenti a due a due). Da riparare nel guardiano (giro 22, PO-252), non qui.

**Riavvii del container.** Durante la catena il container è ripartito due volte (uptime 0, processi morti): ripresa come «giro
composto» (`CPM_CI_FATTI` dai log dei giri interrotti, stesso build), i passi già verdi non rigiocati.

## 7. Cosa NON è fatto / da decidere

- Nessuna etichetta della tipologia nell'interfaccia (MatchdayCard ecc.): oggi nessuna schermata mostra il template.
- La fila di cartelloni sponsor davanti (src/12) è uguale per tutte le tipologie.
- Riga di roadmap e stato PO-071 in `BACKLOG.md`: non toccati da questo giro (li scrive la sessione che unisce il ramo); proposta:
  «PO-071 fase 3 — quattro tipologie (borgo/catino/mattoni/arena) deterministiche per club, tunnel d'ingresso e camera per
  tipologia; guardiano `stadi-071` (rosso `__CPM_NO_STADI246`)».
- Collaudo sul telefono (fps vero, leggibilità della corona LED e dei terrapieni di notte).
