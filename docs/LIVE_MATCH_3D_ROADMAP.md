# Live Match — Audit Tecnico & Roadmap verso il 3D
_Elevora · documento di analisi (nessuna modifica al gameplay)_ · v1 — 2026

> Scopo: consolidare il Live Match 2D, separare simulazione da rendering e
> preparare un'evoluzione 3D moderna mobile-first, **senza regressioni**.

---

## FASE 1 — Audit del Live Match 2D

### Architettura reale rilevata
Il match NON è un sistema unico: nel file convivono **tre implementazioni**.

| Componente | Righe (circa) | Tecnologia | Stato |
|---|---|---|---|
| `simulateMatch` (4734) | ~370 | logica pura, 0 grafica | **VIVO** — sim istantanea / partite AI |
| `PitchCanvas` (5106) | ~1.390 | **Canvas 2D** | **VIVO** — renderer del Live Match |
| `LiveMatch` (7214) | ~2.840 | React + Canvas2D | **VIVO** — motore interattivo (produzione) |
| `FootballMatch` (10053) | ~296 | **Three.js** WebGL | **MORTO** — mai montato (0 usi JSX) |
| `FootballMatch2D` (10350) | ~692 | **Phaser** | nascosto: solo se `localStorage["cpm-renderer"]==="phaser"` |
| `Player3DViewer` (259) | — | Three.js | VIVO — avatar 3D in create/profilo |

Librerie caricate da CDN: React, **Three.js r128**, **Phaser 3.80**, Babel.
→ Phaser (~1 MB) è scaricato da tutti ma usato da quasi nessuno; Three.js nel
match esiste solo come codice morto. **Costo payload non giustificato.**

### Modello di coerenza simulazione ↔ eventi
Il punteggio del Live Match emerge da **due fonti stocastiche interne a `LiveMatch`**:
1. **Eventi di sfondo** `BG_MATCH` (~30%/tick): `ef:"team_goal"|"opp_goal"` che
   incrementano `score` in modo casuale e pesato.
2. **Highlights** interattivi (`SITUATIONS`): l'esito delle scelte del giocatore.

`LiveMatch` **non chiama mai `simulateMatch`**: sono due motori distinti.
→ Conseguenza: la stessa partita "giocata" e "simulata" usa matematiche diverse
e può divergere (coerenza play-vs-sim non garantita).

### Bug / fragilità individuati (con riferimento)
- **B-LM1 — Indici roster incoerenti.** `homeRoster[Math.floor(random*10)]` (7901)
  vs `homeRoster.length-1` (7987) vs `awayRoster[...*11]` (7915): indicizzazione
  mista, rischio `undefined` se la rosa non ha la lunghezza attesa. (cosmetico→crash potenziale)
- **B-LM2 — Marcatore non attribuito.** I gol da `BG_MATCH` scelgono un nome a
  caso dalla rosa: nessun legame con chi è in campo / con le stat individuali.
- **B-LM3 — Stat ↔ risultato debolmente correlati.** `mxStats` (tiri/falli/corner)
  e `possession` derivano da `ev.ms`/drift indipendenti dal punteggio: possibile
  "gol senza tiri" o tabellino slegato dal risultato.
- **B-LM4 — Highlight saltati per mismatch contesto.** (7867-7869) se `sit.ctx`
  ≠ contesto punteggio reale, l'highlight viene **scartato** (`hlIdx++`): in
  partite con punteggio ballerino si rischiano pochissimi momenti interattivi.
- **B-LM5 — Nessun cap di realismo sul punteggio.** Goal casuali da BG non hanno
  tetto: scorelines occasionalmente irrealistiche.
- **B-LM6 — Cartellini/espulsioni solo lato avversario.** `opp_red` esiste; non
  c'è un sistema simmetrico/credibile di gialli-rossi del giocatore in-match.
- **B-LM7 — Timer e setTimeout multipli** (cori, tattiche, reazioni mister):
  tracciati in `chantTimersRef` ma la superficie di race-condition è ampia
  (molti `setState` annidati dentro `setClock`/`setScore`).

### Punti di forza da preservare
- Atmosfera (meteo, cori, camera, luci notturne) **già convincente** → intoccabile.
- `MatchErrorBoundary` protegge il match da crash.
- `PitchCanvas` ha **un'interfaccia a props già pulita** (posizioni, palla,
  colori, fase): è di fatto un confine di rendering riusabile.

### Codice morto / duplicato (quantificato)
- `FootballMatch` (Three.js): ~296 righe **morte**.
- `FootballMatch2D` (Phaser): ~692 righe + lib ~1 MB, dietro flag nascosto =
  **secondo motore di simulazione duplicato**.
- Totale recuperabile: **~990 righe + Phaser dalla CDN**.

---

## FASE 2 — Separazione Simulation Layer / Visualization Layer

### Stato attuale
- **Rendering**: già parzialmente isolato (props di `PitchCanvas`).
- **Simulazione**: **NON separata** — vive dentro il componente React `LiveMatch`
  (stato in `useState/useRef`, punteggio mutato dentro `setInterval`/`setClock`).
  Non esiste un oggetto "stato partita" che un renderer possa consumare.

### Obiettivo architetturale
```
            ┌────────────────────────┐
            │     MATCH ENGINE        │  (puro, 0 grafica, deterministico)
            │  tick() → MatchState    │  eventi · stat · tattiche · forma · RNG seedato
            └───────────┬────────────┘
        ┌───────────────┼───────────────┬─────────────┐
        ▼               ▼               ▼             ▼
   Live 2D          Live 3D          Replay      Quick-Sim
 (PitchCanvas)     (Pitch3D)     (stesso stream)  (no render)
```
- Un solo `MatchState` per frame: `{clock, score, ball{x,y}, players[]{x,y,team,role},
  phase, momentum, possession, events[]}`.
- `simulateMatch` diventa "engine senza rendering" → **play e sim coincidono**.
- Refactoring **graduale e sicuro**: estrarre prima il tick-engine come modulo
  puro; `LiveMatch` lo consuma mantenendo identico comportamento (parità 1:1
  verificata) prima di introdurre il 3D.

---

## FASE 3 — Analisi comparativa tecnologie 3D

| Criterio | **Three.js** | **Babylon.js** | **PlayCanvas** | PixiJS (2.5D) |
|---|---|---|---|---|
| Perf desktop | ottima | ottima | ottima | ottima |
| Perf mobile | ottima (con cura) | ottima | **eccellente** | eccellente |
| WebGPU | in maturazione | **maturo/integrato** | in crescita | sperim. |
| Illuminazione | manuale, flessibile | PBR integrato | buona | n/a (2D) |
| Animazioni/skeletal | AnimationMixer (buono) | **completo** | completo | n/a |
| GLTF/GLB | **eccellente** | **eccellente** | buono | n/a |
| TypeScript | @types (solido) | **nativo** | buono | buono |
| Ecosistema/community | **il più grande** | grande | medio | grande (2D) |
| Documentazione | ottima | **ottima + playground** | buona (editor cloud) | ottima |
| Integrazione nel progetto | **già presente** (r128 + avatar + POC morto) | da aggiungere | editor cloud ≠ single-file | leggera |
| Batterie incluse | poche (monti tu) | molte (GUI, fisica, inspector) | engine+editor | solo 2D |
| Curva | media | media-alta | media | bassa |
| Single-file/no-build | **ok da CDN** | ok da CDN (più pesante) | attrito (editor) | ok |

**Scartati**: Unity/Unreal WebGL (troppo pesanti per mobile-first browser);
PlayCanvas (workflow editor-cloud in conflitto col single-file locale).

---

## FASE 4 — Visione grafica

Riferimenti: **Football Manager** (profondità) + **Top Eleven** (immediatezza)
+ UI mobile premium. **Niente fotorealismo.**

Per il Live Match 3D futuro: stadio 3D, pubblico animato (instancing/sprite),
luce giorno/notte, meteo dinamico, **camera televisiva** a bordocampo che segue
la palla, replay automatici, esultanze, animazioni credibili, caricamenti rapidi.

Priorità assolute, in ordine: **1) fluidità · 2) leggibilità · 3) performance · 4) immersione.**

---

## FASE 5 — Roadmap (adattata alle evidenze)

**Tecnologia consigliata: Three.js** (con upgrade r128 → ultima).
Motivazioni: già integrato (avatar 3D vivo + POC `FootballMatch` da rianimare),
ecosistema/community massimi, GLTF eccellente, adozione incrementale nel
single-file via CDN senza build, controllo fine su performance mobile.
**Alternativa forte: Babylon.js** se vogliamo TS nativo + WebGPU integrato +
tooling, accettando una dipendenza più pesante e un refactor maggiore.
Rischi: gestione manuale (Three) di LOD/instancing per il pubblico; budget
performance su smartphone medi; tentazione di alzare troppo la qualità.

| Milestone | Obiettivo | Esito |
|---|---|---|
| **M1** | Consolidamento 2D: fix bug FASE 1, **rimozione codice morto** (`FootballMatch`), decisione su Phaser, upgrade Three.js | base affidabile, payload più leggero |
| **M2** | **Estrazione Match Engine** puro da `LiveMatch`; `simulateMatch` unificato; parità 1:1 verificata | sim/render separati |
| **M3** | **PoC 3D** Three.js: campo + 22 player + palla guidati dal `MatchState`, camera TV, UI mobile | nuova *vista*, 0 modifiche logiche |
| **M4** | Stadio + giocatori (refactor del POC morto come vista 3D ufficiale) | scena credibile |
| **M5** | Animazioni GLTF (corsa/idle/tiro) + instancing pubblico + LOD | immersione |
| **M6** | **Replay** dallo stream di eventi (deterministico) | replay/highlights |
| **M7** | Beta: toggle 2D/3D, budget perf, save-safe | release |

---

## FASE 6 — Proof of Concept (solo progettazione)

**Idea chiave**: `PitchCanvas` espone già un contratto di props pulito
(posizioni giocatori, palla, colori, fase). Il PoC 3D è un **componente
drop-in `Pitch3D` con lo STESSO contratto di props**, montato dietro lo stesso
schema di flag già esistente (`localStorage["cpm-renderer"]`, valore `"3d"`).

- Scena Three.js: piano-campo, **22 capsule** colorate per squadra (instancing),
  **palla** sfera, **camera prospettica TV** a bordocampo che insegue la palla.
- Consuma `allPlayers / ballX / ballY / matchPhase` **già calcolati da LiveMatch**.
- Canvas portrait mobile; overlay con i **pulsanti azione esistenti** invariati.
- **Vincolo**: nessuna modifica a `LiveMatch`/motore — solo nuova vista.

> Sequenza sicura: prima M1–M2 (engine estratto), poi PoC come consumatore puro.
> Se si vuole un PoC immediato, è possibile agganciarsi alle prop già esistenti
> senza toccare la logica, perché le posizioni sono già nello stato del componente.

---

## Regole rispettate
Nessuna regressione · save intatti · nessun cambio gameplay · mobile-first ·
performance-first · ogni decisione documentata · analisi prima dell'implementazione.
