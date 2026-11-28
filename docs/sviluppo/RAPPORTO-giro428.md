# Rapporto giro 428 — PO-691: spalle e corporatura dell'eroe nel video intro

**Voce PO (27/11, urgente):** «nel video intro l'eroe non ha le spalle larghe e la corporatura uniforme, correggi subito è il biglietto da visita!»

Ramo: `sviluppo/giro428-intro-spalle` (da `main`). GAME_VERSION e `docs/governo` non toccati. Audio e comandi dell'intro non toccati (giro 427).

## 1. Misura (prima della correzione)

Sonda e guardiano: `tests/visual/intro-spalle-428.mjs` (corpi accesi `__CPM_GLB=true`, video intro vero aperto con `cpm-replay-intro`,
un campione ogni ~350 ms di orologio reale dall'aggancio del corpo alla chiusura: 42-58 campioni, **tutte e 7 le battute** coperte).
Misura con `__misura146` (la stessa del giro 146) più i segmenti del corpo rapportati alle anche (`Aj`, bacino rigido).

Due ambienti, perché il difetto stava lì:
- **sito**: la pagina normale;
- **app**: come l'app Android (TWA) e la build store, che **non scrivono** `__CPM_INTRO_CG23` né `__CPM_INTRO_GLB` (src/19).
  Il braccio tiene vuoti quei due flag. ⚠️ `__CPM_STORE_BUILD=true` non si può usare nella sonda: spegne anche il banco (`_CPM_TEST`)
  e quindi il testimone dell'intro (la prima corsa è rimasta «non giudicata» proprio per questo).

| Eroe dell'intro, codice di partenza | Sj/Aj min · mediana · max | scala x/y, z/y | regola 146 passata |
|---|---|---|---|
| sito 390×844 | 2,339 · 2,405 · 2,443 | 1,00 · 1,00 | sì |
| **app 390×844** | **1,880 · 1,967 · 2,006** | 1,00 · 1,00 | **no** (`__CPM_N146` 0) |
| sito 1920×1080 | 2,338 · 2,402 · 2,443 | 1,00 · 1,00 | sì |
| **app 1920×1080** | **1,821 · 1,967 · 2,006** | 1,00 · 1,00 | **no** |

Riferimento: fascia della regola unica `[2,34 · 2,62]` (giro 146); lo stesso eroe in partita ha mediana ~2,36-2,44 e scala x/y = z/y = girth
del suo avatar (0,97 per `avatarId` 0, formula `_heroAppr` in src/12).

**Cause misurate:**
1. In src/19 la postura del gioco (`_corrPostura23` → `_spalle146`) girava solo se `window.__CPM_INTRO_CG23`, un flag che esiste per i
   testimoni e che la build store / l'app non scrivono. Nell'app quindi **nessuna regola delle spalle**: spalle ~18% più strette della fascia
   (Sj/Aj 1,97 contro 2,40), in tutte le battute, su telefono e PC. Il PO gioca dall'app: è esattamente ciò che ha visto.
2. **Corporatura**: l'eroe dell'intro era scalato in modo uniforme a 1,82 senza il girth dell'eroe; in partita e nelle cerimonie passa da
   `cgCorporatura` col girth dell'avatar. I segmenti fra loro erano già coerenti (omero, avambraccio, coscia, gamba, busto / anche: spread
   max/min 1,000-1,014 su tutto il video): non c'erano parti con proporzioni diverse, c'era un corpo diverso da quello della partita.

**Corpi della scena e regola 146:** eroe e portiere. Nel sito passavano entrambi dalla regola; nell'app nessuno dei due.
I procedurali di riserva (`mkFig`) restano nascosti finché il corpo arriva (giro 233) e non hanno ossa: non sono interessati.

## 2. Correzione (alla fonte, nessuna regola nuova)

`src/19-app-root.jsx`, ramo del corpo CGTrader dell'intro:
- `_cg428=true` quando il corpo è agganciato → `_corrPostura23` (che chiude con `_spalle146`) gira **in ogni build**, non più dietro al testimone;
- l'eroe prende il girth del **suo** avatar con la stessa formula di `_heroAppr` (src/12) e la stessa `cgCorporatura` di partita e cerimonie;
  `IntroCinematic` riceve `avatarId` dal giocatore (primo avvio e riascolto dal menu).
- Rosso `window.__CPM_NO_G428` = intro di prima.

Nessuna clip in pausa riscritta dopo la regola (il «lift» congelato all'apice è del mixer, prima di `_corrPostura23`): la regola del giro 261
non è toccata.

## 3. Dopo

| Eroe dell'intro, corretto | Sj/Aj min · mediana · max | scala x/y, z/y | segmenti / Aj spread max | regola 146 |
|---|---|---|---|---|
| sito 390×844 | 2,341 · 2,399 · 2,437 | 0,97 · 0,97 | 1,021 | sì |
| app 390×844 | 2,339 · 2,400 · 2,438 | 0,97 · 0,97 | 1,026 | sì |
| sito 1920×1080 | 2,342 · 2,399 · 2,438 | 0,97 · 0,97 | 1,024 | sì |
| app 1920×1080 | 2,341 · 2,398 · 2,437 | 0,97 · 0,97 | 1,026 | sì |
| rosso `__CPM_NO_G428` app (telefono / PC) | 1,824-2,006 / 1,858-2,006 | 1,00 | — | no → **cade** |

Lo spread dei segmenti sale da 1,00 a ~1,02 perché il girth è una scala solo su x/z: un osso inclinato misura un po' di più o di meno a seconda
della direzione. È la stessa cosa che succede in partita.

## 4. Guardiano

`npm run intro-spalle-428` (riga MAPPA esistente di src/19 in `ci-runner.mjs`, accanto a `scene-178`). Giudica in OGNI campione lungo tutto
il video, su telefono e PC, sito e app: Sj/Aj dentro la fascia della regola con la sua tolleranza (0,002·Aj, quella a cui `_spalle146` si ferma:
[2,338 · 2,622]), girth dell'eroe uguale a quello in partita (±0,01), segmenti/anche con spread ≤ 1,03, regola passata (`__CPM_N146`),
portiere prima del tuffo, nessun errore di pagina. Copertura minima 20 campioni eroe e 5 battute, altrimenti «non giudicato» = rosso.
Rosso `__CPM_NO_G428` (app) deve cadere. CPM_FOTO=prima|dopo per le foto.

Foto: `docs/collaudo-po/428-{prima,dopo}-{telefono,pc}-battuta{1,4,5}.png` (battuta 1 corsa col nome, 4 gol, 5 esultanza) e i primi piani
`428-{prima,dopo}-{telefono,pc}-primopiano-{fronte,tre-quarti}.png`, affiancati in `428-confronto-{telefono,pc}-fronte.png`.

## 5. Esito del giro

`cd tests/visual && node ci-runner.mjs giro intro-spalle-428 spalle-146 primo-avvio-401` sul build 7.999.217 (GAME_VERSION non toccata):
**20/20 verdi**, nessuna ripetizione: intro-spalle-428 (200 s, verde sito+app su 390×844 e 1920×1080, rosso `__CPM_NO_G428` caduto su
entrambi i formati) · spalle-146 (410 s, verde e rossi 146/146b caduti: l'intro resta coerente con partita, presentazione e panchina) ·
primo-avvio-401 (56 s) · le 17 sentinelle (mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico,
griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97).
Le foto e `STABILITA.json` rigenerati dalle sentinelle sono stati riportati com'erano (fuori consegna).

Primo piano dell'eroe in battuta 1 (`__provino146`, braccio app): Sj/Aj **1,96 → 2,40** al telefono, **2,00 → 2,41** al PC. Nel confronto
`428-confronto-telefono-fronte.png` / `428-confronto-pc-fronte.png` si vede: prima spalle strette e testa in avanti, dopo spalle larghe
e busto dritto.

## 6. Dubbi per il PO

**D1. Portiere durante il tuffo.** Nel tuffo (battute 3-6, corpo steso) la regola delle spalle non tiene la fascia sul portiere: Sj/Aj fino a
1,05-1,24, **anche nel sito prima di questo giro** (17/56 campioni). È un limite della regola 146 sui corpi distesi, non dell'intro.
- **(a, consigliata e applicata)** il guardiano giudica il portiere prima del tuffo e il tuffo resta fuori ambito, dichiarato; un giro dedicato
  misura la regola sui corpi distesi (parate anche in partita) prima di toccarla.
- (b) escludere dalla regola le pose distese (bacino quasi orizzontale): modifica alla regola unica, va misurata su tutte le scene.
- (c) accettarlo come visivamente irrilevante (il tuffo dura meno di un secondo ed è lontano dalla camera).

**D2. Statura dell'eroe nell'intro.** Ho portato nell'intro il **girth** dell'eroe, non la **statura** (resta 1,82, quella su cui sono tarate
camera e regia dell'intro, giri 178/292/331).
- **(a, consigliata e applicata)** solo girth: le proporzioni sono quelle della partita, la regia non cambia.
- (b) anche la statura di `_heroAppr` (1,86-2,02 × 0,9): stesso corpo al centimetro, ma va ri-misurata la regia (`scene-178`, `intro-292`).
- (c) una corporatura «da copertina» fissa per l'intro (girth 1,02-1,05), indipendente dall'avatar.

**D3. Il flag dei testimoni che decide il comportamento.** Il difetto nasce da un flag di testimone (`__CPM_INTRO_CG23`) usato come permesso.
- **(a, consigliata e applicata)** l'intro usa una variabile sua (`_cg428`); il flag resta solo per i testimoni.
- (b) un giro di censimento: cercare in src/ altri `if(window.__CPM_*)` scritti sotto `!__CPM_STORE_BUILD` e letti come permesso.
- (c) far scrivere il flag anche nella build store (meno pulito: mescola testimone e comportamento).

**D4. Sonda «app».** La sonda riproduce l'app tenendo vuoti i due flag che la build store non scrive, non con `__CPM_STORE_BUILD` vero (che spegne
il banco).
- **(a, consigliata e applicata)** così, dichiarato nel guardiano.
- (b) un collaudo sulla `dist/` vera (build store) con un testimone che non dipende da `_CPM_TEST`.
- (c) collaudo a occhio del PO sull'app installata dopo il prossimo rilascio.
