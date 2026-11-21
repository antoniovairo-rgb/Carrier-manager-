# Giro 308 — il METODO di rilascio (primo vagone del treno 7.999.200)

Ramo `sviluppo/giro308-metodo`, base `lavoro/200` = `1cbc414b` (7.999.199 pubblicata). Ramo di taratura `prova/308-taratura`
(stesso commit del lavoro + il commit che ha fatto partire la corsa). **Il gioco non è stato toccato**: nessun file di `src/`,
`CARRIER-MANAGER-AV.html` e `GAME_VERSION` invariati. Nessun workflow esistente toccato (deploy-pages, android-build, twa-build,
validate-situations). Decisioni di riferimento: `docs/governo/DECISIONI.md` (ramo `poc/marioprada-character-system`),
20/11 21:05 «Treno + controlli a livelli» e 20/11 23:40 «GitHub Actions: mappa intera, parti da max 120 min, prima una corsa di
taratura, il banco resta giudice finché la taratura non è fatta, avvio su push al ramo di rilascio + a mano».

## 1. Cosa è cambiato

| file | cosa |
|---|---|
| `tests/visual/ci-runner.mjs` | **MAPPA unica** (75 righe → 11, una per gruppo di file, unione senza doppioni, commenti conservati sulla prima voce); la mirata usa `MAPPA.filter` (unione di tutte le righe che toccano un file) al posto di `MAPPA.find` (solo la prima); catena **`sentinelle`**; modalità **`giro <guardiano>`** |
| `tests/visual/mappa-unica-308.mjs` + `npm run mappa-unica` | guardiano statico (< 1 s): verde sul file attuale **e** rosso sulla mappa vecchia (`1cbc414b`) |
| `tools/durate-guardiani-308.mjs` → `docs/governo/DURATE-GUARDIANI.json` | durata di ogni guardiano, fonte per fonte |
| `docs/governo/misure/runner-44830113928.json` | le 82 durate della taratura 198 sul runner, trascritte dal log del job «Riepilogo» (id 136648314328), più quelle del giro 303 |
| `docs/governo/ROSSI-DICHIARATI.json` | rossi dichiarati della 7.999.199 (riga ROADMAP del 21/11) + rossi «solo runner» della taratura 198 |
| `tests/visual/ci-treno-308.mjs` | piano / esegui / riunisci del treno (nato da `ci-parti-303.mjs` del giro 303) |
| `.github/workflows/verifica-guardiani.yml` | il treno su GitHub Actions (nuovo su questo ramo; il file omonimo del giro 303 sta solo sui rami `prova-ci/**`) |
| `CLAUDE.md` | sei righe: «i giri non eseguono più la mappa intera» |

### 1.1 PO-527 — mappa unica (misurato)

Con la mappa vecchia (`node tests/visual/mappa-unica-308.mjs`, braccio rosso):

- 7 gruppi di file con più righe: `src/12|13` ×16 · `src/14` ×9 · `src/15` ×16 · `src/05|09` ×6 · `src/11|17` ×11 · `src/10|16|18` ×10 · `src/00-08` ×3 (75 righe per 11 gruppi);
- `MAPPA.find` prendeva solo la prima riga: **la mirata perdeva 351 guardiani** sommando i file di `src/` (per esempio `src/01`: 37, `src/03`: 30, `src/05`: 34).

Con la mappa nuova: 11 righe, stesso numero di guardiani unici per gruppo (92 · 32 · 96 · 17 · 46 · 1 · 107 · 188 · 11 · 9 · 37, contati
prima e dopo con lo stesso script), 0 persi. **Conseguenza da sapere:** la mirata ora è più lunga dove due espressioni si
sovrappongono (`src/01` prende anche `ritocchi-302`; `src/03` e `src/04` prendono anche la riga `src/0[0-8]`): è l'unione che la
direttiva chiede, non un errore.

## 2. Durate misurate (`docs/governo/DURATE-GUARDIANI.json`)

348 guardiani (tutti quelli nominati in CATENE e MAPPA con uno script npm). Fonte, in ordine di precedenza (la più recente prima):

| fonte | voci | da dove |
|---|---|---|
| rapporti | 154 | 33 rapporti: RAPPORTO-giro293…307 (tranne 297) e VERIFICA198-B1-V1, D, F1, F2, R1–R7, V2, V2a–d, V3, V3b, V4, letti dai loro rami; estrazione automatica: riga che nomina **un solo** guardiano e porta una durata («123 s», «12 min») |
| runner | 26 | taratura 44830113928 (82 durate) e corse del giro 303 |
| banco | 89 | mediana di `docs/governo/STABILITA.json` (60 giri, per lo più di ottobre) |
| stimata | 79 | nessuna misura: 300 s (una con «+tetto») |

Somma: **125.880 s ≈ 35 ore** di guardiani. Precedenza «più recente prima» perché il banco di ottobre misura versioni vecchie dei
guardiani (esempio: `corpi-073` 1935 s su STABILITA.json, 433 s nei rapporti del 20/11, 484 s sul runner). ⚠️ L'estrazione dai
rapporti è automatica e prende la prima durata della riga: è una buona stima, non una misura certificata. Rigenerare con
`node tools/durate-guardiani-308.mjs` dopo il `git fetch` dei rami dei giri.

**Oltre i 30 minuti** (durata scelta ≥ 1800 s, o runner ≥ 1800 s, o un rapporto che dice «fermato al tetto dei 30 minuti»):

| guardiano | s | fonte | note |
|---|---|---|---|
| gol-eroe-154 | 3600 | rapporti (R1, R6, R7) | tetto dei 30 min in R1 |
| highlight-95 | 3600 | rapporti (V3b) | |
| nomi-219 | 2910 | rapporti (303, F2) | banco 3284 (25 giri); tetto in R2 |
| difesa-220-scena | 2431 | banco (12 giri) | |
| esiti-218 | 2340 | rapporti (V3) | banco 1106 |
| difesa-220 | 2330 | rapporti (R1, R6) | tetto in R1 |
| coreografie-244 | 2295 | rapporti (F2) | runner 1934; tetto in R5 |
| chiusura-99 | 2081 | rapporti | runner 1364; tetto in V2a |
| parata-100 | 2040 | rapporti (295) | |
| assist-298 | 1804 | runner | tetto in V2a |
| riproduci-175 | 1800 | stimata + tetto (V2c) | |
| scena3d-96 | 1403 | rapporti (R5) | runner 1903 |
| tunnel-245 | 1260 | rapporti | runner 1929 |

## 3. PO-517 — sentinelle e modalità `giro`

`CATENE.sentinelle` (17 voci, **≈ 50 min** col file delle durate rigenerato dopo la taratura; 46 min con quello di prima):

| area | sentinelle | s | perché |
|---|---|---|---|
| mappa | `mappa-unica` | <1 | statico: nessun giro rompe la mappa |
| logica e salvataggi | `test:logic` · `save-compat` · `replay` · `migrazione-194` | 3 · 5 · 56 · 89 | logica pura, compatibilità dei salvataggi, determinismo, migrazione |
| grafica e telefono | `design-system` · `tema-unico` · `griglia-mobile` | 1 · 17 · 187 | token, tema unico, griglia a 412 px |
| carriera | `career-critical` | 565 | competizioni, salvataggi monotoni, doppio tocco (la catena carriera del gate) |
| motore e partita | `battito-264` · `partita-vera` | 360 · 665 | un battito solo fra partita intera e solo-highlight; partita vera fino al fischio |
| scena 3D | `render-3d-023` · `tunnel-285` · `gk-dive-sync` | 44 · 273 · 180 | disegno 3D, bordo campo, tuffo del portiere |
| schermate PC/telefono | `home-298` · `schermate-97` · `web-237` | 126 · 141 · 78 | Home, schermate a 360/412 px, pagina web già tradotta |

Criteri di stabilità: nessuno sopra i 15 minuti; nessuno fra i rossi dichiarati o i rossi «solo runner»; su STABILITA.json
`career-critical` e `replay` hanno **un** «instabile» ciascuno su 60 e 52 giri, gli altri zero; esclusi gli instabili noti
(`box-fischio-169`, `corpi-073` 2 rossi su 17, `gk-miss-229`). **Tutte le 17 sentinelle sono verdi nella taratura 308.** La prima scelta aveva `accessibilita-234`: rosso sul runner **e sul banco di questa sessione** (rc 1, 100 s) per la stessa ragione — il suo braccio rosso fa `git show ea02adf0^`, che in un clone corto non esiste («non giudicato (git)») — quindi rosso in ogni sessione cloud: sostituito con `schermate-97`. `validate-situations` e `typing-shortcuts` non ci sono perché li
esegue già il workflow `validate-situations.yml` a ogni push.

Uso: `node ci-runner.mjs giro <guardiano-del-giro> [altri]` = guardiani del giro + sentinelle, senza doppioni, un rosso si riprova
una volta sola (come in mirata). Un nome senza script npm esce 2 (provato). `npm run ci:sentinelle` = solo le sentinelle.

## 4. PO-592 — il treno su GitHub Actions

`.github/workflows/verifica-guardiani.yml`:

- **parte** su push ai rami `lavoro/**` e `prova/**` (non `main`, non `sviluppo/**`; un push di soli `docs/**` o `*.md` non fa
  partire niente) e a mano (`workflow_dispatch`, con `elenco` facoltativo e `obiettivo_min`);
- **piano**: `ci-treno-308.mjs piano` prende tutti i guardiani di CATENE+MAPPA (tranne gli script `ci*` che lancerebbero a loro
  volta una catena), li taglia «il più lungo nella parte più leggera» e **aggiunge parti finché nessuna supera l'obiettivo**
  (70 min attesi, così anche un runner 1,7 volte più lento del banco — misurato nel giro 303 — resta sotto 120). Oggi:
  **348 guardiani in 31 parti da ~68 min**;
- **parti**: `ubuntu-latest`, `timeout-minutes: 120`, `continue-on-error: true`, `CPM_CI_PAR=0`, bilancio interno di 110 min:
  un guardiano che sfora il resto del bilancio viene fermato col suo gruppo di processi (per pid, mai per nome) e vale «non
  giudicato»; i successivi si dichiarano «non partiti». Provato sul banco: `griglia-mobile` fermato a 65 s, `test:logic` non
  partito, nessun browser rimasto;
- **la corsa non fallisce**: `esegui` e `riunisci` escono sempre 0, i job hanno `continue-on-error`; l'esito è nel riepilogo della
  corsa, nell'artifact **`riepilogo-totale`** (`riepilogo-totale.json`, `riepilogo-totale.md`, **`esito-treno.json`**) e nel log del
  job «Riepilogo» (riga `RIEPILOGO_JSON`, leggibile anche senza credenziali);
- **classificazione**: rosso **nuovo** · rosso **noto** (`ROSSI-DICHIARATI.json` → `banco`) · rosso **noto del runner** (→
  `solo_runner`) · **non giudicato** (tetto, non partito, parte che non ha consegnato il riepilogo) · più l'elenco dei «dichiarati
  rossi ma verdi qui». Verdetto: «nessun rosso nuovo» oppure «DA GUARDARE»;
- `permissions: contents: read`, nessun segreto, `concurrency` per ramo con `cancel-in-progress`.

## 5. PO-528 — proposta di leve per i 10 guardiani più lenti (nessuna modifica fatta)

Misurato prima di proporre: **nove su dieci giocano già a velocità 4** (`match-speed` 4, `parata-100` e `highlight-95` a 2), quindi
«velocità 2× del banco» non è più una leva per loro. Le leve che restano, in ordine di resa attesa (stime, non misure):

| guardiano | s | cosa fa (dal suo commento) | leva più promettente | stima |
|---|---|---|---|---|
| gol-eroe-154 | ~3600 | partite vere da due salvataggi, registro gol del motore | **spezzare per salvataggio/seme in voci diverse della matrice** (stesso codice, `SEMI`/salvataggio da ambiente): il treno le mette in parti diverse | parete ÷2 |
| highlight-95 | ~3600 | partite vere da S1/S5/S12, politica «re», `SEMI` 1,2 | idem per seme + **velocità 4** (oggi 2) se le scene giudicate restano le stesse (da misurare) | parete ÷2–3 |
| nomi-219 | ~2910 | 18 semi, 3 partite alla volta | gruppi di semi come voci separate (6+6+6) | parete ÷3 |
| difesa-220-scena | ~2431 | partite S12, una scena difensiva ogni N min, K=1,2,3 | una voce per K | ÷3 |
| esiti-218 | ~2340 | 3 semi, almeno 12 scene | **fermarsi a campione raggiunto** (12 scene giudicate) invece di finire le tre partite — da decidere dal PO perché cambia il campione | −30/50% |
| difesa-220 | ~2330 | 4 semi, braccio verde + rosso | verde e rosso come due voci separate (oggi in fila nello stesso processo) | parete ÷2 |
| coreografie-244 | ~2295 | **trenta partite di fila** nello stesso contesto, verde + rosso | braccio rosso su un sottoinsieme (dove la regola si vede già) — decisione PO; oppure verde/rosso in due voci | −40% |
| chiusura-99 | ~2081 | gol veri forzati × 6 colori × 3 foto | riuso della pagina fra colori (cambio colore col testimone senza ricaricare) | −30% |
| parata-100 | ~2040 | pagina nuova per partita, velocità 2 | velocità 4 (da misurare: è la finestra della parata che si giudica) | −40% |
| assist-298 | ~1804 | partite S12, politica «assist» | semi in voci separate | ÷2–3 |

La leva «voci separate» non tocca il guardiano né le soglie: basta che il treno conosca una voce `nome@seme` → per questo serve
una piccola estensione di `ci-treno-308.mjs` (non fatta: fuori ambito, e va prima vista dal PO).

## 6. La corsa di taratura

Corsa **[44882036931](https://github.com/antoniovairo-rgb/Carrier-manager-/actions/runs/44882036931)**, ramo `prova/308-taratura`
(commit `f6f443b`, mappa intera), 21/11 07:49 → 10:43 UTC. Esito della corsa: **success** (33 job su 33 verdi come job: nessuna
mail «Run failed»), mentre i guardiani rossi stanno nel riepilogo. Letta dal log del job «Riepilogo» (riga `RIEPILOGO_JSON` e
tabella; trascritta in `docs/governo/misure/runner-44882036931.json`); gli artifact non li ho scaricati.

| misura | valore |
|---|---|
| guardiani / parti | 349 in 31 parti (tutte arrivate) |
| verdi | **318 / 349** |
| a parete (primo inizio → ultima fine) | **10.311 s ≈ 2 h 52 min** (corsa intera 2 h 54 min) |
| somma delle durate | 110.692 s ≈ 30,7 h (stima del piano 35 h: il runner è stato in media più veloce delle stime) |
| parti insieme | **20 al massimo** (le altre 11 in coda: limite di job contemporanei misurato) |
| durata di una parte | min 36 · mediana 58 · max 110 min (una sola al bilancio: parte 08) |
| costo | non misurato in questo giro (il giro 303 ha misurato `billable` 0 sullo stesso tipo di runner) |

**Rossi, per classe** (classe calcolata dal treno contro `ROSSI-DICHIARATI.json`):

- **noti** (2): `store-236` (versione TWA 7.999.197), `difficolta-156` — come sul banco.
- **noti del runner** (2): `portatore-293`, `avvio-233` (caduto in 1 s anche nella 198) — come nella taratura 198.
- **non giudicato** (1): `scena-motore-147`, fermato al bilancio dei 110 min nella parte 08 (che conteneva anche `assist-nome-98`,
  2964 s). È un rosso dichiarato sul banco.
- **dichiarati rossi ma verdi sul runner** (10): `coreografie-244`, `nomi-219` (sul banco oltre il tetto dei 30 min, qui entro
  il bilancio), `prima-partita-237`, `rassegna-200`, `box-fischio-169`, `interazioni-226`, `tpose-196`; e dei «solo runner» della
  198 `piedi-252`, `salti-274`, `chiusura-99` stavolta verdi.
- **«nuovi» (26)** — nuovi rispetto all'elenco dichiarato, **non** necessariamente regressioni: la verifica della 199 ha
  eseguito i guardiani della mappa dei file toccati, non tutti i 349, quindi per molti di questi non esiste un verdetto di banco
  sulla 7.999.199 con cui confrontare. Per tipo:
  - **difetti del mio strumento, già corretti in questo giro** (2): `mappa-unica` (braccio rosso via `git show 1cbc414b`, clone
    corto → ora legge `tests/visual/fixtures/ci-runner-1cbc414b.mjs.txt`) e `accessibilita-234` (`git show ea02adf0^`, rosso anche
    sul banco di questa sessione → il workflow ora fa `fetch-depth: 0` sulle parti);
  - **cadute dello strumento, non verdetti sul gioco** (3): `occasioni-dinamiche` e `scena-motore-147` (eccezione di Node),
    `finale-202` («ancora della simulazione non trovata», 0 s: la sonda cerca un testo nel sorgente che non c'è più);
  - **guardiani di carriera/schermate di catene vecchie** (`guardiani`, `grafica`), mai nella mappa dei giri 293–307:
    `l7-schermate` (dashboard tagliata a 375/412), `numeri-home` (cifre a 32 px dove ne ammette 24), `home-riquadri`,
    `calendario-nazionale`, `busta-199`, `giornale-244`, `schede-260`, `accessibilita-234`, `pagella-75`, `possesso-209`,
    `assist-nome-98` («Chiudi la stagione» non raggiunto) — diversi toccano schermate cambiate dalla 198 (Home ripulita PO-558/559/571,
    angoli PO-563/564): **probabili guardiani da aggiornare dopo un cambio voluto**, da confermare sul banco;
  - **partita/motore** (`attesa-difesa`, `cross-origine`, `filtrante-intercetto`, `ruleta`, `movimento-147`, `scatto-305`,
    `guanti-201`, `panchina-293`, `parata-100`, `riproduci-175`, `difesa-220-giro31`, `difesa-220-scena`): da rifare sul banco
    uno alla volta prima di chiamarli difetti — `scatto-305` e `panchina-293` sono dei giri 305/293 e sul banco della 199 erano verdi.

**Runner ↔ banco.** Sui guardiani con un verdetto di banco noto le differenze sono le stesse della 198 (`portatore-293`,
`avvio-233` rossi solo sul runner) più 10 dichiarati rossi che qui sono verdi; due rossi nuovi sono strumento puro (clone corto).
Le durate del runner, dove c'erano entrambe, sono dello stesso ordine del banco (giro 303: rapporto 0,66–1,69). **Il banco resta
il giudice**: i 26 «nuovi» vanno rieseguiti sul banco (non l'ho fatto: oltre il tetto del giro e il limite settimanale), e solo
dopo si scrive `ROSSI-DICHIARATI.json` per la 7.999.200.

Il file delle durate è stato rigenerato includendo questa corsa (181 voci ora da runner, 6 ancora stimate): il piano scende a
**28 parti** a parità di obiettivo.

## 7. Come si usa il treno serale

```bash
# un giro (sul banco, dentro il turno, un controllo alla volta)
cd tests/visual && CPM_CI_PAR=0 CPM_CHROME=/opt/pw-browsers/chromium node ci-runner.mjs giro <guardiano-del-giro>

# il treno: si uniscono i giri pronti nel ramo di rilascio e si spinge
git checkout lavoro/<N> && git merge --no-ff sviluppo/giroXXX-... && git push origin lavoro/<N>   # parte da solo
# oppure a mano (anche un elenco): Actions → «Treno — mappa intera dei guardiani» → Run workflow (vedi Dubbio 1)

# l'esito senza credenziali: nomi e stato dei job + log del job «Riepilogo» (riga RIEPILOGO_JSON)
curl -s https://api.github.com/repos/antoniovairo-rgb/Carrier-manager-/actions/runs/<id>/jobs?per_page=60

# dopo il rilascio: aggiornare docs/governo/ROSSI-DICHIARATI.json e rigenerare le durate
node tools/durate-guardiani-308.mjs
```

Un guardiano nuovo entra nella riga della MAPPA che esiste già per i suoi file (`npm run mappa-unica` lo pretende).

## 8. Dubbi per il PO

1. **Avvio a mano.** Il workflow ha `workflow_dispatch`, ma per quanto so il pulsante «Run workflow» (e la chiamata API) vuole il
   file sul ramo predefinito `main`. Non posso confermarlo da qui; non ho toccato `main` (non autorizzato in questo giro). La
   decisione del 23:40 dice «workflow da portare su main»: va fatto dalla madre insieme al rilascio.
2. **Venti job alla volta (misurato).** Nella taratura 20 parti in corsa e 11 in coda: i 31 pezzi da ~68 min vanno in due ondate.
   Alternativa: obiettivo 100 min → ~21 parti, quasi un'ondata sola, ma un runner lento (×1,7 nel giro 303) porterebbe qualche
   parte al bilancio di 110 min con guardiani «non partiti». Ho scelto la prudenza (70); si cambia con `obiettivo_min` o
   `CPM_TRENO_OBIETTIVO_S`.
3. **Un ramo nuovo creato su un commit già spinto non fa partire il treno (osservato):** la creazione di `prova/308-taratura` sullo
   stesso commit del ramo di sviluppo non ha prodotto nessuna corsa; il push successivo, con un file di `tests/` cambiato, sì.
   Per un ramo di rilascio appena creato serve un commit che tocchi qualcosa fuori da `docs/`, oppure l'avvio a mano.
4. **`cancel-in-progress`:** un secondo push sullo stesso ramo `lavoro/**` annulla il treno in corsa (la stessa scelta del giro
   303). Non so se una corsa annullata manda la mail: non posso confermarlo. Se il PO preferisce che il treno finisca sempre,
   basta `cancel-in-progress: false`.
5. **79 durate sono stimate** (300 s): il piano le tratta come medie. Dopo la taratura le loro durate vere sono nel log del job
   «Riepilogo»: vanno trascritte in `docs/governo/misure/` e il file delle durate rigenerato (non l'ho fatto per i guardiani della
   taratura 308 oltre a quanto scritto al §6).
6. **Il brief cita `tpose-196` fra le cinque parti fallite della 198:** nel log della corsa 44830113928 `tpose-196` è **verde**
   (1256 s, parte 6); la parte 6 è rossa per `portatore-293`. Ho tenuto `tpose-196` nei rossi del banco (riga ROADMAP del 21/11) e
   annotato che sul runner era verde.
7. **`validate-situations` gira due volte** (workflow del gate e treno): il treno lo tiene perché è nella catena `completa`. Si può
   togliere dal treno se il PO preferisce risparmiare ~15 min di una parte.
8. **La mirata si allunga** dove due espressioni della MAPPA si sovrappongono (§1.1): è l'unione voluta, ma un rilascio delle 08/16
   su `src/03` o `src/04` ora gioca anche la riga `src/0[0-8]`.
9. **Riga di ROADMAP:** non scritta, perché questo vagone non è un rilascio (resta su `sviluppo/giro308-metodo`); la scrive la
   madre quando il treno 7.999.200 parte.
10. **Ramo `prova/308-taratura`:** l'ho lasciato (contiene solo i commit di questo giro). Ogni push su di lui fa ripartire il treno:
    se non serve più, va cancellato dalla madre.
