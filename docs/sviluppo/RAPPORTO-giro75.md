# Rapporto giro 75 — Stile unico (Finalizzatore per tutti, via l'Enfant) · pagella = risultato registrato

Ramo `sviluppo/stile-unico-giro75`, base `lavoro/174` (7.999.174, commit `f58fe2b`). GAME_VERSION e SAVE_VERSION **invariati**
(nessun campo tolto, nessun bump). Decisione di riferimento: PO 19/10 sera, «togliamolo, rimane praticamente solo il Finalizzatore,
il player non potrà scegliere» e «togli anche enfant»; PO-190 quota gol come bersaglio **chiusa** dal PO, resta il difetto del giro 67 §3.

Come leggere: **Verificato** = numero dai dati grezzi o riga di sorgente; **Non posso confermarlo** = il dato non c'è.
Dati in `docs/sviluppo/dati-giro75/`.

---

## 1. Stile unico — cosa è stato tolto (Verificato, righe del ramo)

| Dove | Prima (174) | Ora | Rosso `__CPM_NO_STILEUNICO75` |
|---|---|---|---|
| `src/06-archetipi-agenti-sponsor.jsx:870` | — | `stileUnico75()`: vero salvo l'interruttore | — |
| `src/06:871` `haTrattoEnfant` | vero per `tratti.enfant` o archetipo «enfant» | sempre **falso** → `archGrowthMult` (`src/06:87`) dà ×1, la riga Enfant del Profilo (`src/18:10214`) non compare | come 174 |
| `src/17-menu-creazione-pannelli.jsx:411` | stile dalla griglia | `ARCHETYPES[0]` = **Finalizzatore** (bonus di creazione invariato: tiro +8, posiz. +6, fisico +3, vel. −2, pass. −3) | griglia |
| `src/17:414` | Enfant: −2 su ogni statistica | mai | come 174 |
| `src/17:419` | `tratti:{enfant:scelta}` | `tratti:{enfant:false}` | come 174 |
| `src/17:462` | intestazione «🎯 Stile e percorso» | «🗺️ Percorso» | come 174 |
| `src/17:468` (`data-cpm="scelta-stile"`) | griglia dei 4 stili + riquadro «Effetto sugli attributi» + casella «✨ Enfant Prodige» | **non resa** | resa |

Restano (scelta prudente, annotata): `ARCHETYPES` (4 stili) e `stileMotore` — il motore conosce ancora i 4 stili, quindi
`stili-098` resta coerente; `ARCHETYPES_8`, `archDi`, `stileDi`, `archLetturaDi`, `archetipoOrig` per i vecchi salvataggi e le letture
di obiettivi/sim (`_pSimStats` legge `finalizzatore` → `bomber`, come prima). Il riquadro del Profilo «Stile di gioco: Finalizzatore»
(`src/18:10207`) **resta**: mostra lo stile dell'eroe, non una scelta. Il tutorial (`src/17:1930`) e gli obiettivi stagionali non citano
né la scelta dello stile né l'Enfant (verificato con grep). Il testo «✨ Enfant prodige (N anni)» della stampa (`src/09:737`) è un
titolo giornalistico sull'età (≤19), non il tratto: **lasciato**.

Foto a 360 px (stesso punto della schermata, sezione destra): `dati-giro75/creazione-360-prima-174.png` (build vero della 174) e
`dati-giro75/creazione-360-dopo-giro75.png`. `scrollWidth` 360 in entrambe (nessuno scorrimento orizzontale).

## 2. Migrazione dei salvataggi (`migratePlayer`, `src/17:2451-2460`)

Dopo la migrazione del giro 67 (8 archetipi → 4 stili, invariata) gira quella del giro 75, additiva:
- archetipo ≠ `finalizzatore` **o** `tratti.enfant` acceso → `archetype = ARCHETYPES[0]` (Finalizzatore), `tratti.enfant = false`;
- lo stile (o l'archetipo) di prima va in **`stilePrima75`** (scritto una volta sola); se c'era l'Enfant, **`enfantPrima75: true`**;
- un vecchio archetipo degli 8 resta anche in `archetipoOrig` (già scritto dal giro 67; il giro 75 lo scrive solo se manca);
- **statistiche intatte** (l'Enfant già guadagnato resta), nessun campo tolto, nessun bump di SAVE_VERSION;
- seconda passata: archetipo già `finalizzatore` e Enfant spento → nessun effetto.
- Un vecchio Bomber/Centravanti diventava già Finalizzatore col giro 67: per lui `stilePrima75` non viene scritto (lo stile non
  cambia), l'origine resta in `archetipoOrig`.

## 3. PO-190 — pagella 2 gol, risultato registrato 1 (giro 67 §3)

**Riprodotto sulla 174** (`dati-giro75/base174-k4-k12-k13.jsonl`): k4 · k12 · k13 pagella 2, registrato 1.

**Causa (Verificato, registro `_golLog` del motore, `src/14:335`):** in tutte e tre l'eroe segna **un gol in gioco fluido**
(k4 min 15, k12 min 8 — `scena:false`, `chi:21` = `M.HERO`) più uno da highlight. Il motore lo conta nella pagella dell'eroe
(`src/14:367`, `P.gol++`); il live lo narra (`narra870`, `src/15:3017`) come gol della squadra (`ef:"team_goal"`) e il gestore
`team_goal` (`src/15:7154`) aggiornava solo il tabellone: `mStats.goals` — che diventa `result.goals` (`src/15:9856`) e va in carriera —
contava solo il gol dell'highlight (`src/15:9349`). Dati della sonda: `dati-giro75/sonda-pagella-golLog.txt`.

**Correzione (rosso `__CPM_NO_PAGELLA75`):**
- `src/15:3050` — `narra870` marca `_eroe75` quando il gol narrato è nostro e il marcatore del motore è l'eroe (`e.chi.eroe`);
- `src/15:7148-7153` — sul `team_goal` marcato, `mStats.goals +1` (e `rb +5`, come il gol da highlight) e il marcatore del badge è
  il cognome dell'eroe; testimone `__CPM_PAG75` (solo `__CPM_REC`);
- `src/15:2031` — al fischio, i gol del motore ancora in coda escono già dal tabellino (7.999.161, PO-228): ora escono anche dalla
  **pagella** del marcatore (e l'assist da quella di chi l'ha servito). Altrimenti un gol dell'eroe tolto al 96' restava in pagella.
  **Non verificato da una partita** (nessuna delle tre lo esercita); è la stessa regola applicata alla seconda metà della coppia.

**Misura (stesse 3 partite, stesso build, sonda derivata da quota-190-vivo):**

| Partita | Verde: pagella · registrato | Rosso: pagella · registrato | Punteggio (uguale nei bracci) |
|---|---|---|---|
| k4 | 2 · **2** | 2 · 1 | 2-1 |
| k12 | 2 · **2** | 2 · 1 | 2-0 |
| k13 | 2 · **2** | 2 · 1 | 2-1 |

Effetto sulla quota del giro 67 (braccio «dopo»): contando il registrato corretto diventa quella della pagella (52,3%, 23/44, dal
rapporto del giro 67): **Non rimisurato** su 25 partite — il bersaglio è chiuso dal PO.

## 4. Guardiani

- **`npm run stile-unico-75`** (nuovo, pagina vera a 360 px, ~30 s): verde = creazione senza griglia/casella/testo «Stile di gioco»
  ed «Enfant»; calciatore creato Finalizzatore, senza Enfant, crescita ×1, statistiche nella banda del Finalizzatore base; **16 casi**
  di migrazione (8 archetipi + 4 stili + 4 stili con l'Enfant acceso) → Finalizzatore, `stilePrima75`/`archetipoOrig`/`enfantPrima75`
  giusti, statistiche intatte, nessun campo perso, seconda migrazione senza effetto. Rosso: la creazione della 174 torna (griglia +
  casella; Regista+Enfant rispettati), **48 violazioni** delle regole del verde.
- **`npm run pagella-75`** (nuovo, ~14 min con PAR=2): rigioca k4/k12/k13 nei due bracci; verde = pagella == registrato in tutte e tre
  e almeno un gol dell'eroe in gioco fluido esercitato; rosso = almeno una diverge.
- **`stili-098-migrazione`**: ora gira con `__CPM_NO_STILEUNICO75` in entrambi i bracci (prova lo strato del giro 67, che resta sotto).
- `stili-098` (motore, 4 stili): invariato e coerente (il motore conosce ancora i 4 stili).
- Catena: `stile-unico-75` e `pagella-75` aggiunti a **completa** (quindi a **notte**) e alla MAPPA di `ci-runner.mjs`
  (`stile-unico-75`: src/0[0-8], src/1[17], src/18|16|10 · `pagella-75`: src/14, src/15).
- Chiavi oggetto doppie nei tre frammenti toccati (06, 15, 17): **0** (controllo con un plugin Babel su ogni `ObjectExpression`;
  0 anche sulla base 174).

## 5. Rituali (catena mirata dei file toccati rispetto a `lavoro/174`, 71 passi)

`node ci-runner.mjs mirata lavoro/174` sul commit `9d20c36` (build identico a quello consegnato: dopo, solo documenti):
**70/71 verdi** (registro: `dati-giro75/ci-mirata-71passi.txt`, voce del registro di stabilità in `dati-giro75/stabilita-giro-mirata.json`).
Fra i 71: test:logic · save-compat · design-system · typing-shortcuts · **career-critical** (742 s) · **stili-098** · stili-098-migrazione ·
**stile-unico-75** · **pagella-75** (815 s) · **griglia-mobile** (171 s, comprende la Creazione a 360 px) · validate-situations · partita-vera ·
i guardiani di src/06, src/15, src/17 della MAPPA.
- Due **instabili** (verdi alla seconda prova, regola del runner): `pallino-278` (primo rosso: uscita di Node senza messaggio leggibile
  nel registro) e `tempo-138` («rosso: il difetto non si vede», cioè il braccio rosso del guardiano). Non indagati in questo giro.
- **Un rosso vero: `difficolta-156`.** Nella catena 19/20 (declino · gol 0,363 contro 0,25 ±0,08); rifatto da solo **18/20**
  (affermazione · gol 0,411 contro 0,30; declino · gol 0,392 contro 0,25). **Causa verificata:** stesso build, stesso guardiano con
  `__CPM_NO_STILEUNICO75` → **20/20** (`dati-giro75/difficolta-156-verde-{stileunico,no75}.{txt,json}`). Il banco del giro 69 costruisce
  carriere Finalizzatore · Regista · Incursore; il salvataggio passa da `migratePlayer` e con lo stile unico **tutte e 24 diventano
  Finalizzatore** (le etichette «regista»/«incursore» nella tabella sono quelle del banco, non dello stile giocato). Il Finalizzatore
  segna di più (lo diceva già il giro 69: affermazione 0,497, declino 0,355 per lui solo): la curva A era tarata sulla media di tre stili.
  Tutte le altre 18 celle restano dentro. **Non ho ritarato**: la curva è una decisione PO (PO-156) — vedi punti aperti.

Altri controlli: chiavi doppie 0 (§4); `node tools/check-src.mjs` identico byte per byte; foto 360 px senza scorrimento orizzontale.
Il runner e i guardiani fotografici hanno riscritto `docs/governo/STABILITA.json` (tronca il registro a 60 giri: 67 → 60) e le foto di
`docs/collaudo-grafico/g0` e `docs/sviluppo/foto-giro26`: **ripristinati**, non fanno parte della consegna (decide la sessione madre).

## 6. Punti aperti

1. **PO-156 con lo stile unico (decisione per la sessione madre/PO).** Gol a gara fuori bersaglio in affermazione (0,41) e declino
   (0,36-0,39) perché ora gioca solo il Finalizzatore. Opzioni: (a) **consigliata, prudente** — ritarare la leva 4 del giro 69 (gol per
   minuti/OVR, `src/10:957`) sul solo Finalizzatore, dietro il rosso `__CPM_NO_156`, e far misurare al banco un solo stile; (b) tenere
   la curva e alzare i bersagli gol di affermazione/declino (decisione di prodotto); (c) lasciare così e accettare il guardiano rosso.
   Finché non si sceglie, `difficolta-156` resta rosso nelle catene che lo contengono.
2. `difficolta-156` e `stili-098` sono scritti per 3/4 stili: il secondo resta corretto (misura il motore, che conosce gli stili), il
   primo dopo la decisione al punto 1 va semplificato a un solo stile.
3. Riga del Profilo «Stile di gioco: Finalizzatore» (`src/18:10207`): lasciata (non è una scelta). Se il PO la vuole via, è una riga.
4. Intestazione «🗺️ Percorso» seguita dal riquadro «📋 Percorso carriera»: la parola si ripete (vedi foto). Scelta mia, da rivedere in grafica.
5. Il ritocco del fischio (gol in coda tolti anche dalla pagella, `src/15:2031`) non è esercitato dalle tre partite: verificato solo per
   lettura del codice.
6. La quota PO-190 col registrato corretto non è rimisurata (bersaglio chiuso dal PO).
7. Instabili `pallino-278` e `tempo-138` (§5): non legati ai file toccati per quanto ho potuto vedere — **Non posso confermarlo** senza indagine.
