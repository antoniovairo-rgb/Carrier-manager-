---
name: realism-reviewer
description: "Credibilita' calcistica in campo di Korward Elite: da usare quando un'azione del live match «non sembra calcio» — falso gol, pallone che torna indietro, passaggio che vola in porta, portiere che si tuffa su tutto, giocatori che scivolano a gambe ferme, ammucchiate, foot-slide — e per gli invarianti CINE e l'Unified Outcome Model."
---

# realism-reviewer — l'azione deve sembrare calcio

Solo **credibilita' percepita in campo**. Quale suite lanciare in generale lo dice `game-qa`;
il costo di un frame lo giudica `performance-analyzer`.

## Quando si attiva

Un appunto del PO o un tuo dubbio su una SCENA: geometria della traiettoria, gesto sbagliato,
esito che non combacia con cio' che si vede, movimento dei 22, portiere, catene.
**Non** e' questa la skill per bug di carriera, testi, UI o performance.

## I tre principi che si difendono

1. **Pipeline `Intent → Decision → Simulation → Animation`.** La cinematica e' CONSEGUENZA
   della decisione, mai pre-autorata: `deriveIntent(sit,act)` (intento bakato in `S()`, text-free
   a runtime) → `decideExecution(intent,ctx)` (esito + qualita' `q∈[0,1]`, seedato) → l'arco 3D
   legge `hlQuality`/`hlOutcomeKind`. Se stai per scrivere un'animazione «per questa situation»,
   ti sei gia' allontanato dal progetto: parametrizza sulla qualita' decisa.
2. **Invarianti CINE** (`hlBallState`): testa e volee' SOLO con palla `aerial`; set-piece con
   palla ferma (`set_ground`); `feet` = palla al piede. Violarli e' FAIL bloccante del check
   `data-coherence`.
3. **Unified Outcome Model.** L'esito granulare (palo/parata/murato/fuori/corner/fallo) si decide
   **una volta sola** in `handleAction` e finisce in `outcome.outKind`; 3D, overlay e cronaca
   leggono quello. Invariante: **overlay-family ⟺ arc-family** (il check `timeline` lo verifica).
   Non ricalcolare mai l'esito lato render con un seed diverso.

## Procedura

1. **Riproduci la scena esatta.** Recupera `gi` (indice situation) e azione; poi
   `__CPM_FORCE_SIT(gi,true)` + `__CPM_RESOLVE(k)` (+ `__CPM_FORCE_OUTCOME` per vedere i casi rari).
2. **Misura prima di diagnosticare.** Scegli lo strumento dal catalogo qui sotto. Un giudizio a
   occhio su uno screenshot headless non e' una misura.
3. **Riaccendi la presentazione vera**: `window.__CPM_PRESENT=1`. Snap di scena e freeze di lettura
   sono SPENTI sotto `?cpmtest=1` — senza il flag stai giudicando una scena che il giocatore non
   vede mai (e' cosi' che nel 7.345 si stava per «correggere» un difetto inesistente).
4. **GLB-ON per ogni giudizio percettivo.** Sotto CH38 le pose procedurali CINE-VAR sono invisibili:
   parlano solo le clip. Il gate gira GLB OFF → non ti dice nulla sulla resa.
5. Correggi la **causa**, non il sintomo; rimisura con lo stesso strumento e riporta prima→dopo.

## Catalogo difetti → strumento

| Sintomo | Causa tipica | Come si misura |
|---|---|---|
| Falso gol (la palla entra ma il gol non c'e', o entra su un'occasione) | `hlOutcomeKind` non propagato al 3D; reward GOAL non convertito a `chance` | `node action-sweep.mjs` · `chain-coherence-test.mjs` |
| Reverse-boomerang (la palla torna indietro a fine azione) | assestamento post-arco non ancorato all'esito / alla `startZone` della catena | `live-validator.mjs` (replay `fail_*.json`) · `__CPM_ARC` |
| Passaggio che vola in porta | bersaglio del passaggio fra i pali (cap `GOAL_LINE_X−5.2`) | `assist-delivery-test.mjs` · `action-sweep.mjs` |
| Portiere che si tuffa su tutto | manca il ramo riflesso ravvicinato (`gk_block`) | `gk-reflex-test.mjs` (hook `__CPM_GKACT`) |
| Giocatori che scivolano a gambe ferme | lerp posizionale che bypassa `animOne` | `realism-analyzer.mjs` (stopStart, jerkP90, turnP90) |
| Ammucchiate / linea schiacciata sul bordo | mancano corsie di competenza; sway per-giocatore invece che per reparto | `shape-analyzer.mjs` (pinned, minGap, spread, slope) |
| «Squadra a sciame attorno al pallone» | quasi sempre ARTEFATTO: raggruppa per posizione palla | `distribution-analyzer.mjs` |
| Foot-slide (cadenza che non segue la velocita') | `run.timeScale` che satura | `footslide-test.mjs` (GLB ON, hook `__CPM_STRIDE`) |
| Difesa che non chiude la linea di passaggio | F10 non deliberato | `passlane-test.mjs` (contro modello nullo) |
| Esito/gesto/tempi scollegati | durata clip > finestra `actType` | misura `loadGLB(...).animations[0].duration` vs `_T` |

## Comandi

```bash
cd /home/user/Carrier-manager-/tests/visual
export CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers

node action-sweep.mjs                    # setaccio 191 situations (flag e fette: `game-qa`)
LMV_CTX=career LMV_MATCHES=3 node live-validator.mjs   # partite vere (o LMV_CTX=trial)
node realism-analyzer.mjs                # RA_UPDATE=1 rigenera realism-baseline.json
node shape-analyzer.mjs                  # SH_UPDATE=1 · 3 partite, non una
node distribution-analyzer.mjs           # DA_UPDATE=1
node footslide-test.mjs && node gk-reflex-test.mjs && node passlane-test.mjs
node chain-coherence-test.mjs && node defensive-outcome-test.mjs && node defensive-live-test.mjs
npm run engine-sweep && npm run def-sweep    # motori puri: determinismo + monotonie
npm run aerial-contact && npm run shot-apex && npm run woodwork
VS_GLB=1 node vision-contact-sheets.mjs  # fogli-provini percettivi, GLB-ON
node glb-gesture-smoke.mjs
# gate 14/14 prima del push: comando in `game-qa`
```

## Criteri di uscita

- Il difetto e' **misurato prima e dopo**, con numeri nel commento di `GAME_VERSION`.
- Gate **14/14 · fingerprint `00001505` · 0 failure** (se hai toccato le situations e la firma
  cambia legittimamente: `npm run validate-situations:update-golden`, e dichiaralo).
- `live-validator` senza FAIL nuovi rispetto a `live-baseline.<ctx>.json`; baseline dei tre
  analyzer aggiornata solo se il cambiamento e' voluto e spiegato.
- Determinismo intatto: nessun `Math.random()` nudo introdotto (usa `hashStr` + aritmetica).
- Verifica percettiva finale **GLB-ON con `__CPM_PRESENT=1`**.

## Errori gia' commessi (non ripeterli)

- **Snap e freeze spenti sotto `?cpmtest=1`**: senza `__CPM_PRESENT=1` ogni probe misura attori
  ancora in viaggio. Tre appunti «il compagno arriva dopo» erano questo (34,6u → 4,4u reali).
- **Lo stacco di scena non e' un teletrasporto**: grazia 750 ms sulla chiave di scena, anche
  all'inizio scena. Senza, meta' degli highlight risultava FAIL.
- **Il teletrasporto si misura in VELOCITA' (>85 u/s)**, non in distanza cruda: a fps bassi un tiro
  vero copre metri fra due frame.
- **Il piano della porta e' `GOAL_LINE_X=48.6`**, non `AWAY_GOAL_X=46` (ancora logica): 2,7u di
  errore = falsi gol nello strumento.
- **Il gol si giudica sulla penetrazione MASSIMA**, non su dove la palla si ferma (dopo entra si
  assesta nella bocca).
- **L'assist finisce sui piedi del compagno**; dribbling/corsa/uno-due con reward GOAL sono
  convertiti a `chance` dal 7.8.10: palla corta li' e' il progetto.
- **Il corner arretra sempre in x** e **la rincorsa non e' una palla ferma**: conta l'inversione
  solo dopo un progresso reale, azzera il percorso quando l'arco si arma.
- **In scena difensiva il verso e' invertito** e l'arco e' un segnaposto: tolleranza d'immobilita'
  molto piu' larga, destinatario preteso solo su giocata riuscita.
- **Una media cancella due sottogruppi opposti**: separa gli ingaggiati dal blocco di zona prima di
  concludere (il «cpmadapt rotto» del 7.46.1 era questo).
- **Un campione singolo non fa una regressione**: `shape-analyzer` gira su 3 partite; `pinned`
  oscilla 0,20-0,30 sullo stesso build.
- **In headless GLB-ON i tempi non sono giudicabili a occhio** (scena a 1/10-1/30 del reale):
  misura le durate delle clip contro la finestra `actType`.
- Igiene dell'edit (grep di `GAME_VERSION` prima, mai scrivere mentre gira il gate): `patch-only`.
