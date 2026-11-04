# Grafica V2 «Notte da stadio» — tappa 3 (PO-302 · PO-303 · pc-tablet-292 punto 5)

Ramo `sviluppo/v2-tappa3` (da `lavoro/179`, d7bb7a90). Riferimento: `docs/design/grafica-v2/` (V2Partita2D/PC, V2Highlight/PC,
V2PostPartita/PC, V2Ingresso, V2Festa, V2Creazione, V2UfficioPC). File di gioco toccati: `src/15` (partita), `src/17` (creazione,
migrazione), `src/18` (Ufficio, economia). **Non toccati**: `src/12`, `src/14` (logica dell'azione), `GAME_VERSION`, `SAVE_VERSION`,
`docs/governo/*` (la riga di roadmap la scrive la sessione che promuove).

⚠️ **Non posso confermarlo**: le sezioni 01/11–03/11 di `docs/governo/DECISIONI.md` sulla V2 e PO-302/PO-303 di `BACKLOG.md`
citate nel compito **non ci sono su questo ramo** (grep «V2», «grafica unica», «303»: zero righe). Ho lavorato sul testo del compito
(regola «grafica unica», decisione PO «Sì, dalla 179 in poi») e su `docs/design/grafica-v2/LEGGIMI.md`.

**Regola PO 03/11 «grafica unica»**: nessun ramo o markup V1 accanto al V2. Ogni schermata è lo **stesso markup** di prima; la V2
cambia colori, caratteri e raggi, letti da `_v2t3 = v2On()` (src/15) o da `TH.v2` (src/17). Con `__CPM_NO_V2` torna il tema di
prima, non il disegno di prima: è il rosso dei guardiani e resta transitorio (tappa 4).

## 1. Schermate

| | cosa cambia (V2) | dati / comportamento |
|---|---|---|
| **Tabellone** (`data-cpm="barra"`, 2D e 3D, tutti i formati) | fondo `#0d0f14`; **blocchi delle squadre nel colore del club** con righe diagonali leggere, nome in carattere TV maiuscolo, inchiostro scelto per contrasto (`inkSu945`); **risultato su piastrella chiara** `#f4f1ea` (`risultato-v2`); **minuto in oro** (`minuto-v2`); tasto velocità su `#262b37`; etichetta della competizione `#9aa3b2`; taccuino ⚠️ `#9aa3b2` (era 3,55:1) | stesso markup 7.901: `data-cpm`, `data-specchio`, filo del possesso, cambio campo al 46' invariati |
| **Partita 2D** | striscia delle statistiche e linguette su superficie V2 `rgba(26,30,39,0.86)` (il campo resta dietro, come chiesto dal PO al 7.922), bordo V2; minuto della cronaca in oro, carattere TV | testi, posizione del banner, voci (telecronaca/panchina/curva) invariati |
| **Highlight — «La tua giocata»** (telefono e tablet) | occhiello **«La tua giocata» in oro** al posto della maniglia (+4 px); titolo in **carattere TV maiuscolo** 20 px; **barra del tempo in oro** su `#262b37` (4 px); scelte su `#1a1e27` raggio 14, bordo `rgba(255,255,255,0.08)`, nome 15 px, attributo in carattere TV maiuscolo `#9aa3b2` | **logica dell'azione non toccata** (righe, armamento, handler, durata della pressione identici) |
| **Highlight — PC** (colonna) | colonna su `#0d0f14`, scelte e piazzati su `#1a1e27`, 25 etichette `rgba(255,255,255,0.3–0.5)` → `#9aa3b2` (3 erano sotto soglia: numeri 4,38:1, «⚽ GOL» 3,19:1) | — |
| **Esito** | tasto **Continua chiaro** `#f4f1ea` in carattere TV maiuscolo (telefono e PC); **voto in oro** | finestra d'esito, guardie anti-tocco invariate |
| **Post partita** | testata del risultato su `#0d0f14` a righe diagonali; **risultato 64 px in carattere TV** `#f4f1ea` (non più verde/rosso); nomi squadra TV maiuscolo; «Migliore in campo» con cornice e titolo in oro; tasto finale **chiaro** 54 px in carattere TV | testo del tasto invariato («Torna alla dashboard»), giornale, tabellini, connessioni invariati |
| **Ingresso in campo** | nomi delle squadre in carattere TV maiuscolo `#f4f1ea`; **VS su piastrella chiara**; «Salta ingresso» su fondo notte | trasparenza della card (PO-188) invariata |
| **Festa / premiazione** (fascia nel post partita) | fondo notte con **cornice in oro**, «CAMPIONI!» in carattere TV 32 px, nome del trofeo in oro maiuscolo spaziato | coriandoli e cerimonia 3D invariati |
| **Creazione** | titolo `TitoloV2` («Nuova carriera · chi sei» / «Crea il tuo calciatore»); tasto «Inizia i provini» chiaro 54 px in carattere TV; bordo del riquadro blu dal tema (era `#bfdbfe` chiaro) | campi, ordine, testi invariati |

## 2. PO-303 — storico del patrimonio

- **Campo nuovo** `player.patrimonio303 = [{s, w, v}]` (stagione, settimana, patrimonio). Un **«mese» = 4 settimane di gioco**:
  il punto si registra a fine settimana 4, 8, 12… nel **chokepoint unico dell'economia** `weeklyEconomyFields` (lo stesso dei tre
  path della settimana, guardiano tri-path), col patrimonio **già aggiornato** della settimana. Idempotente (un punto per
  stagione+settimana), tetto 36 punti.
- **Migrazione additiva** in `migratePlayer`: un salvataggio senza il campo parte con la **serie vuota** — nessun mese passato
  inventato. `SAVE_VERSION` **non** cambiato (resta 9): il campo è facoltativo per tutto il codice che lo legge (scelta prudente,
  da confermare). `run-save-compat.mjs`: `patrimonio303` aggiunto ai campi obbligatori del backfill.
- **Grafico nell'Ufficio** (V2UfficioPC): sotto il patrimonio, **barre degli ultimi 12 mesi registrati** (l'ultima verde
  `#4ade80`, le altre `#3a4152`), «▲/▼ € … nell'ultimo mese» e gli estremi «St. N · sett. W». Con meno di due punti c'è una frase
  («Lo storico del patrimonio parte da qui: un punto ogni 4 settimane di gioco»), niente barre finte.

## 3. pc-tablet-292 punto 5 (instabile due volte)

**Misura prima.** Sonda sulla sequenza esatta del guardiano (gi7 → rigore gi5 col tasto 2 → punizione gi13 col Tab), PC 1366:
**1 su 6** la punizione forzata «in scelta» usciva dall'intro in `hl_move`, senza i tasti `data-sp292` → «con Tab il fuoco non arriva».
In un'altra serie il «2» sul rigore non sceglieva (stessa classe). **Causa**: con `__CPM_FORCE_INTRO` (percorso delle sonde) partivano
**due timer da 2,5 s** sulla stessa intro — quello della forzatura verso `hl_choose` e l'avanzamento automatico dell'intro
(`startHL`), che sui piazzati porta a `hl_move`. Quando scadevano nello stesso giro (pagina occupata) vinceva l'ultimo.
**Correzione**: la forzatura consegna la destinazione all'**unico** timer dell'intro (`forceDst292Ref`); il gioco vero non passa da
lì. **Ri-misura**: 8 su 8 in `hl_choose` col fuoco. Rosso `__CPM_NO_INTRO292` = i due timer di prima.
**Guardiano permanente `intro-292`** (deterministico: la pagina resta occupata da 2,3 a 2,9 s dopo la forzatura, così la
coincidenza dei timer avviene sempre): **verde 6/6** (rigore e punizione) · **rosso 6/6 in `hl_move`**.
Il guardiano `pc-tablet-292` ora stampa anche la diagnosi del punto 5 (fase, tasti, pausa, sequenza del Tab) quando cade. Nessuna soglia toccata.

## Misure (Chromium headless, GLB spento)

### Contrasto e tocco (guardiano nuovo `partita-v2`, 360×780 · 820×1180 · 1440×900)

| schermata | testi misurati | contrasto minimo WCAG | note |
|---|---:|---:|---|
| ingresso in campo | 40 | **4,93:1** | |
| partita 2D (tabellone + striscia) | 23 | **7,35:1** | prima del ritocco 4,10:1: il trattino del risultato su piastrella chiara (24 px, passava la soglia 3:1 dei testi grandi); scurito per stare sopra 4,5 |
| highlight in scelta (telefono/tablet) | 10 | **6,56:1** | scelte alte 52 px (≥ 44) |
| highlight in scelta (PC, colonna) | 21 | **4,87:1** | era 3,19:1 su «⚽ GOL»/«🎯 ASSIST», 4,38:1 sui numeri delle scelte |
| post partita | 11 | **7,54:1** | tasto finale 54 px |
| Ufficio, storico del patrimonio (`patrimonio-303`, 412 e 1440) | — | **6,56:1** | |

Primo giro del guardiano **rosso su un difetto vero**: il tasto ⚠️ del taccuino nel tabellone a 3,55:1 (360 px) → `#9aa3b2`.
Nessuno scorrimento orizzontale in nessuna schermata misurata.

### Guardiani (Chromium headless; `CPM_CHROME=/opt/pw-browsers/chromium`)

**Nuovi** (in `package.json`, nelle catene `completa`, `carriera`, `grafica` di `ci-runner.mjs` e nella MAPPA per `src/15`, `src/17`, `src/18`):

| guardiano | verde | rosso |
|---|---|---|
| `partita-v2` | ✅ 3 formati × 4 schermate (ingresso, 2D, highlight, post), minimo **4,87:1** (colonna PC dell'highlight) | ✅ `__CPM_NO_V2`: cade PAL su ogni schermata in ogni formato |
| `patrimonio-303` | ✅ registro (punto a fine sett. 8 col patrimonio aggiornato 520.000; niente punto in sett. 9; niente doppione; tetto 36), migrazione (serie vuota, idempotente), Ufficio 6 barre con l'ultima verde e «▲ €180 mila nell'ultimo mese», serie vuota con la frase | ✅ `__CPM_NO_PATR303`: cadono registro e grafico |
| `intro-292` | ✅ 6/6 scene (rigore gi5, punizione gi13) in `hl_choose` col fuoco del Tab sui piazzati | ✅ `__CPM_NO_INTRO292`: 6/6 in `hl_move` |

**Esistenti** (stesso build, salvo dove detto)

| guardiano | esito | tempo |
|---|---|---|
| `highlight-95` | ⚠️ **verde con 2 difetti, rosso ✅**: D3 s12/7 «Uno-due con HOWARD — para il portiere» col pallone che non arriva al portiere (minimo 6,1) e D2 s5/1234 «Finta… Intercettato». **A/B sulla build di base d7bb7a90**, stessa scena s12/7: **D3 c'è anche lì** (minimo 7,0; sulla mia 6,5 e 7,2) → **preesistente**, nella logica dell'azione (giro 100) che questa tappa non tocca. D2 non si riproduce né sulla mia né sulla base (0 finte nella partita ridotta: la partita non è identica fra due corse) | ~50 min |
| `assist-298` | ✅ verde + rosso | 1925 s |
| `assist-nome-98` | ✅ verde + rosso (A+B) | 3148 s |
| `parata-100` | ✅ **verde** 4 parate, 0 difetti (due corse) · ⚠️ **rosso non visibile** («il difetto non si vede, 2 parate») in tutte e due le corse; **identico sulla base d7bb7a90** → fragilità preesistente del braccio rosso (il ramo `cross_goal` nel regime di prova compare una volta sola) | 959–1071 s |
| `chiusura-99` | ✅ verde (D9 6/6, mediana 4,87; RIC 6/6) + ✅ rosso (D9 mediana 1,26; RIC 2/6) a macchina libera. Sotto carico (due corsie in parallelo) il braccio rosso D9 andava in eccezione (`[data-g99m]` nullo): **stessa eccezione sulla base** | 2 passate |
| `scena3d-96` | ⚠️ rosso 2 punti nella corsa lunga (pc-gi64 D11 un salto del pallone 3,8u/0,05 s; pc-walkout D13 logo 0,88 dritto). A/B solo PC gi64+ingresso: **mia ✅ verde, base ✗ D13 0,86** → instabile da prima, non della tappa 3 (src/12 non toccato) | 2027 s |
| `esiti-96` | ✅ PASS | 841 s |
| `pc-tablet-292` | ✅ VERDE (telefono identico con e senza interruttori) | 991 s |
| `grafica-v2` | ✅ verde 4 formati, 4,99:1 + rosso | 299 s |
| `momenti-v2` | ✅ verde 4 formati × 5, 4,83:1 + rosso | 595 s |
| `simula-v2` | ✅ verde + rosso | 131 s |
| `griglia-mobile` | ✅ contrasto sotto soglia **0/1771** a 360-430 px (artefatti `g0` ripristinati). Nota: «bottoni pieni di marca» Creazione 1→0 (il tasto ora è chiaro), Ufficio 0→1 (il chip «generale» del piano del trainer, già granata quando è scelto: non toccato) | 228 s |
| `design-system` | ✅ | |
| `career-critical` | ✅ PASS | 842 s |
| `save-compat` | ✅ PASS (con `patrimonio303` fra i campi obbligatori) | 20 s |
| `test:logic` | ✅ 43/43 | 7 s |

Dopo l'ultimo ritocco (colore del trattino) rigirati sul build finale: `partita-v2` ✅ verde 3×4 (4,87:1) + ✅ rosso (507 s), `design-system` ✅, `test:logic` ✅, `save-compat` ✅. Gli altri guardiani sopra girano sul build precedente, che differisce solo per quel colore.

**Non lanciati**: gate 14/14 (`validate-situations`), `partita-vera`, catena `completa` intera via `ci-runner`, i guardiani della
Nazionale/feste non toccati (`nazionale-155`, `festa-oro-251`, `crea-home-295`).

## Foto (`docs/sviluppo/foto-v2-tappa3/`, PNG ridotti)

`tavola-*` (le tavole renderizzate; i cicli dei dati di esempio non si espandono fuori dalla tela), `prima-*` e `dopo-*` per
telefono 412 e PC 1440: ingresso, partita 2D, highlight in scelta, post partita, creazione; `dopo-ufficio-*` (6 mesi sintetici).
`prima-post-*` e `prima-creazione-*` sono col **tema di prima** (`__CPM_NO_V2`, stesso markup), le altre `prima-*` dalla build
d7bb7a90. Strumento: `tests/visual/foto-v2-tappa3.mjs` (`CPM_FOTO_PREF`, `CPM_FOTO_ROSSO`, `CPM_FORMATI`, `CPM_SCHERMI`).

## Deviazioni dalle tavole (dichiarate)

1. **Barre di probabilità sulle scelte** (V2Highlight: «Buona/Media/Difficile» con percentuale): **non messe**. Il codice porta due
   direttive PO contrarie: «Niente «%» nella scheda» (7.902/7.905) e «pallini probabilità RIMOSSI su direttiva PO» (5.93.0).
   Restano l'attributo e il suo valore («TECNICA · 67»). Da decidere col PO.
2. **Altezza delle scelte**: 52 px (tavola ≥ 72). La scheda ha il tetto 44vh con tre righe intere a 412×700 (hud-c3); a 72 px la
   terza riga scorrerebbe. Tasti comunque ≥ 44 px.
3. **Velocità**: un tasto solo che ruota 1× → 1,5× → 2× (decisione PO 7.494 «il pulsante della velocità deve essere unico»), non i
   tre segmenti 1×/2×/4× della tavola; le velocità restano quelle del gioco.
4. **Tabellone**: a tutta larghezza con i nomi (non la pillola compatta «VAL 1–0 RUH 63'» della tavola), perché la barra 7.901 è
   la stessa per 2D e 3D e porta pausa, velocità, competizione e cambio campo; i colori a strisce sono quelli della tavola.
5. **Post partita**: niente marcatori sotto il risultato né «Pagelle» come tasto a parte (le pagelle vivono nella partita); il tasto
   finale tiene il testo «Torna alla dashboard».
6. **Creazione**: nessun «passo N di 4» né figurina grande della tavola: la creazione è una pagina sola nel gioco.
7. **Mese del patrimonio** = 4 settimane di gioco (il gioco non ha un calendario mensile; l'MVP del Mese usa blocchi di 6 settimane).

## Non fatto in questa tappa (per la tappa 4)

- **Righe delle coppe**, **galà dei premi** (cerimonia 3D a buste), **torneo della Nazionale** (V2Nazionale): solo il tema V2 già
  attivo dalla tappa 1, non ridisegnati sulle tavole.
- Togliere `__CPM_NO_V2` e i valori V1 che porta (tappa 4).
- Barre di probabilità e passo «N di 4» della creazione: servono decisioni PO (vedi deviazioni).
- `GAME_VERSION` e la riga di `docs/governo/ROADMAP.md`: alla sessione che promuove su `main`.
- **Da verificare, non mio**: nella foto `dopo-post-tel` il risultato si legge «0 – 1» con «VITTORIA»; l'ordine dei numeri
  (`isMatchHome?score.home:score.away`) è quello di prima, non toccato. Non posso confermare se sia un difetto o la lettura «squadra
  dell'eroe a sinistra» con l'eroe ospite: da guardare sul salvataggio save-194.
- **Preesistenti trovati dai guardiani** (A/B sulla base d7bb7a90): highlight-95 D3 s12/7 (HOWARD), braccio rosso di parata-100,
  scena3d-96 D13 all'ingresso su PC, eccezione del rosso D9 di chiusura-99 sotto carico.
