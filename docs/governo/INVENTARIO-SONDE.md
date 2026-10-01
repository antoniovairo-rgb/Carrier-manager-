# Inventario delle sonde di `tests/visual` (PO-072)

Generato da `node tools/inventario-sonde.mjs` il 2026-10-01. Una sonda è **viva** se la richiama uno script di `tests/visual/package.json`, un workflow, `lib/`, `checks/`, `tools/` o un'altra sonda viva. Le altre si spostano in `tests/visual/archivio/` con `--archivia` (restano nella storia e leggibili; per rieseguirne una si riporta su con `git mv`).

Totale 274 · vive 264 · da archiviare 0 · guardiani orfani 0 · recenti 10

## Da archiviare

| File | Ultima modifica |
|---|---|


## Guardiani orfani (nessuno script li lancia: da collegare a uno script o da archiviare, decisione caso per caso)

| File | Ultima modifica |
|---|---|


## Sonde recenti non richiamate (meno di 3 giorni: restano finché il lavoro che le ha prodotte è aperto)

| File | Ultima modifica |
|---|---|
| `_aereo90.mjs` | 2026-10-01 |
| `_apri84.mjs` | 2026-09-30 |
| `_apri84b.mjs` | 2026-09-30 |
| `_camera93.mjs` | 2026-10-01 |
| `_daievai92.mjs` | 2026-10-01 |
| `_fondo89.mjs` | 2026-10-01 |
| `_hl94.mjs` | 2026-10-01 |
| `_reparto90.mjs` | 2026-10-01 |
| `_ruba87.mjs` | 2026-10-01 |
| `facing-tiro-sonda.mjs` | 2026-09-29 |

## Vive

| File | Richiamata da |
|---|---|
| `aerial-contact-test.mjs` | npm: aerial-contact |
| `agent-lifecycle-test.mjs` | npm: agent-lifecycle |
| `agent-relation-test.mjs` | npm: agent-relation |
| `ai-vision-review.mjs` | npm: ai-vision, ai-vision:strict · lib/checks/tools |
| `aim-latch-test.mjs` | npm: aim-latch |
| `apre-88.mjs` | npm: apre-88, apre-88:rosso |
| `armo-scelte.mjs` | npm: armo-scelte |
| `attendance-sim.mjs` | npm: attendance-sim |
| `attesa-difesa-test.mjs` | npm: attesa-difesa |
| `auto-review.mjs` | npm: auto-review |
| `ball-alive-test.mjs` | npm: ball-alive |
| `ball-attended-test.mjs` | npm: ball-attended |
| `ball-jump-census.mjs` | npm: ball-jump-census |
| `ball-owner-test.mjs` | npm: ball-owner |
| `ball-scene-snap-test.mjs` | npm: ball-scene-snap |
| `bandierina-60.mjs` | npm: bandierina-60 |
| `barriera-73.mjs` | npm: barriera-73 |
| `battuta-test.mjs` | npm: battuta |
| `bg-continuity-test.mjs` | npm: bg-continuity |
| `bg-decision-test.mjs` | npm: bg-decision |
| `bg-name-role-test.mjs` | npm: bg-name-role |
| `bg-rhythm-test.mjs` | npm: bg-rhythm |
| `bg-sync-test.mjs` | npm: bg-sync |
| `brain-82.mjs` | npm: brain-82, brain-82:rosso |
| `buildup-sync-test.mjs` | npm: buildup-sync |
| `caduta-eroe-test.mjs` | npm: caduta-eroe |
| `calendario-nazionale-test.mjs` | npm: calendario-nazionale |
| `camera-544.mjs` | npm: camera-osc |
| `camera-cut-mask-test.mjs` | npm: camera-cut-mask |
| `camera-hands-test.mjs` | npm: camera-hands |
| `camera-step-census-test.mjs` | npm: camera-step-census · sonde: camera-cut-mask-test.mjs |
| `campo-striscia-test.mjs` | npm: campo-striscia |
| `career-invariants.mjs` | npm: career-invariants |
| `career-nat-sim-test.mjs` | npm: career-nat-sim |
| `career-sim-test.mjs` | npm: career-sim |
| `carry-run-ball-test.mjs` | npm: carry-run-ball · sonde: delivery-arrival-test.mjs |
| `cartellino-test.mjs` | npm: cartellino |
| `catene-possesso.mjs` | npm: catene |
| `celebration-test.mjs` | npm: celebration · sonde: celebration-visible-test.mjs, panchina-glb.mjs |
| `celebration-visible-test.mjs` | npm: celebration-visible |
| `censimento-scene.mjs` | sonde: gesti-copertura-96.mjs |
| `ceremony-shot.mjs` | npm: ceremony-shot |
| `cerimonie-test.mjs` | npm: cerimonie |
| `classifica-94.mjs` | npm: classifica-94, classifica-94:rosso |
| `club-evolution-sim.mjs` | npm: club-evolution-sim |
| `coach-face-test.mjs` | npm: coach-face |
| `coach-review-variety-test.mjs` | npm: coach-review-variety |
| `coinvolgimento-reparti.mjs` | npm: coinvolgimento |
| `colori-539.mjs` | npm: colori |
| `completamento.mjs` | npm: completamento |
| `conduci-93.mjs` | npm: conduci-93, conduci-93:rosso |
| `conduzione-70.mjs` | npm: conduzione-70 |
| `conduzione-test.mjs` | npm: conduzione |
| `contatto-53.mjs` | npm: contatto-53 |
| `contrasto-scuro.mjs` | npm: contrasto-scuro |
| `controllo-67.mjs` | npm: controllo-67 |
| `coppa-intera-700.mjs` | npm: coppa-intera |
| `coppa-nazioni-686.mjs` | npm: coppa-nazioni |
| `costo-corpo.mjs` | lib/checks/tools |
| `critica-context-test.mjs` | npm: critica-context |
| `cronaca-censimento-554.mjs` | npm: cronaca-censimento |
| `cross-origine-test.mjs` | npm: cross-origine |
| `cross-validate.mjs` | npm: cross-validate |
| `crowd-context-test.mjs` | npm: crowd-context |
| `ct-54.mjs` | npm: ct-54 |
| `cup-final-replay-test.mjs` | npm: cup-final-replay |
| `d7-corpi.mjs` | npm: d7-corpi |
| `daievai-92.mjs` | npm: daievai-92, daievai-92:rosso |
| `decisioni-50.mjs` | npm: decisioni-50 |
| `def-camera-bounds-test.mjs` | npm: def-camera-bounds |
| `def-far-gesture-test.mjs` | npm: def-far-gesture |
| `def-mass-sweep.mjs` | npm: def-sweep |
| `delivery-arrival-test.mjs` | npm: delivery-arrival |
| `delivery-origin-test.mjs` | npm: delivery-origin |
| `design-system.mjs` | npm: design-system |
| `disappunto-test.mjs` | npm: disappunto |
| `dist-web-partita-test.mjs` | npm: dist-web-partita |
| `double-tap-test.mjs` | npm: double-tap |
| `elim-64.mjs` | npm: elim-64 |
| `engine-mass-sweep.mjs` | npm: engine-sweep |
| `eroe-dal-gioco-test.mjs` | npm: eroe-dal-gioco |
| `esultanza-braccia-test.mjs` | npm: esultanza-braccia |
| `etichette-95.mjs` | npm: etichette-95 |
| `europei-test.mjs` | npm: europei |
| `event-ledger-test.mjs` | npm: event-ledger |
| `fallo-cercato-test.mjs` | npm: fallo-cercato |
| `festa-3d.mjs` | npm: festa-3d |
| `festa-57.mjs` | npm: festa-57 |
| `festa-79.mjs` | npm: festa-79, festa-79:rosso |
| `festa-942.mjs` | npm: festa |
| `filtrante-intercetto-test.mjs` | npm: filtrante-intercetto |
| `finisher-facing-test.mjs` | npm: finisher-facing |
| `fischio-finale.mjs` | sonde: griglia-mobile.mjs |
| `fondate-554.mjs` | npm: fondate |
| `fondo-89.mjs` | npm: fondo-89, fondo-89:rosso |
| `framing-choices-shot.mjs` | npm: framing-choices |
| `freekick-delivery-test.mjs` | npm: freekick-delivery |
| `frozen-mate-test.mjs` | npm: frozen-mate |
| `ga-85.mjs` | npm: ga-85, ga-85:rosso |
| `gala-2d.mjs` | npm: gala |
| `gala-3d.mjs` | npm: gala-3d |
| `galleria-stadi.mjs` | npm: galleria-stadi |
| `gesti-copertura-96.mjs` | npm: gesti-copertura-96, gesti-copertura-96:rosso |
| `gesto-vocabolario-test.mjs` | npm: gesto-vocabolario |
| `gesture-window-test.mjs` | npm: gesture-window |
| `giro-542.mjs` | npm: giro |
| `gk-bg-react-test.mjs` | npm: gk-bg-react |
| `gk-dive-sync-test.mjs` | npm: gk-dive-sync |
| `goal-postarc-test.mjs` | npm: goal-postarc |
| `gol-541.mjs` | npm: gol |
| `gol-interazione-test.mjs` | npm: gol-interazione |
| `goleade-test.mjs` | npm: goleade, goleade:rosso98 |
| `griglia-mobile.mjs` | lib/checks/tools · sonde: completamento.mjs, contrasto-scuro.mjs, provino-schermate.mjs |
| `hero-framing-census.mjs` | npm: hero-framing, framing-guard |
| `hero-in-frame-test.mjs` | npm: hero-in-frame |
| `hl-94.mjs` | npm: hl-94, hl-94:rosso |
| `hl-credibilita-analisi.mjs` | sonde: hl-credibilita.mjs |
| `hl-credibilita.mjs` | sonde: hl-credibilita-analisi.mjs |
| `home-opening-test.mjs` | npm: home-opening |
| `home-riquadri-test.mjs` | npm: home-riquadri |
| `hud-c3.mjs` | npm: hud-c3 |
| `hud-overlap-test.mjs` | npm: hud-voci |
| `impulsi-contesto-test.mjs` | npm: impulsi-contesto |
| `ingresso-59.mjs` | npm: ingresso-59 |
| `intercetto-credibile-test.mjs` | npm: intercetto-credibile |
| `intervista-2d.mjs` | npm: intervista |
| `intorno-556.mjs` | npm: intorno |
| `jumbotron-anchor-test.mjs` | npm: jumbotron-anchor |
| `kit-3d-uv.mjs` | npm: kit-3d-uv |
| `kit-pattern-shot.mjs` | npm: kit-pattern-shot |
| `leggibile-68.mjs` | npm: leggibile-68 |
| `loco-directional-test.mjs` | npm: loco-directional |
| `look-inversion-census.mjs` | npm: look-inversion |
| `maglie-numero-test.mjs` | npm: maglie-numero |
| `match-full-test.mjs` | npm: match-full |
| `match-sequence-test.mjs` | npm: match-sequence |
| `match-speed-change-test.mjs` | npm: match-speed-change |
| `match-speed-test.mjs` | npm: match-speed |
| `memoria-927.mjs` | npm: memoria, memoria:rosso |
| `mira-porta-test.mjs` | npm: mira-porta |
| `mister-77.mjs` | npm: mister-77, mister-77:rosso, mister-77:manichino |
| `motore-unico-test.mjs` | npm: motore-unico |
| `moves-budget-test.mjs` | npm: moves-budget |
| `muro-70.mjs` | npm: muro-70 |
| `nomi-51-test.mjs` | npm: nomi-51, nomi-51:rosso |
| `numeri-home-test.mjs` | npm: numeri-home |
| `occasioni-dinamiche-test.mjs` | npm: occasioni-dinamiche |
| `occasioni-squadra-test.mjs` | npm: occasioni-squadra |
| `outcome-not-goal-test.mjs` | npm: outcome-not-goal |
| `pali-69.mjs` | npm: pali-69 |
| `palla-84.mjs` | npm: palla-84, palla-84:rosso |
| `pallino-sostituito.mjs` | npm: pallino-sostituito |
| `panca-64.mjs` | npm: panca-64 |
| `panchina-glb.mjs` | npm: panchina-glb |
| `panchina-riga.mjs` | npm: panchina-riga |
| `pannello-61.mjs` | npm: pannello-61 |
| `pannello-72.mjs` | npm: pannello-72 |
| `pannello-fermo-test.mjs` | npm: pannello-fermo |
| `parametri-dichiarati.mjs` | npm: parametri |
| `parata-legibility-test.mjs` | npm: parata-legibility |
| `parata-shot.mjs` | npm: parata-shot |
| `parata-test.mjs` | npm: parata |
| `partita-vera-guardian.mjs` | npm: partita-vera |
| `pass-forward-test.mjs` | npm: pass-forward |
| `pass-landing-test.mjs` | npm: pass-landing |
| `pass-mesh-direction-census.mjs` | npm: pass-mesh-direction |
| `pass-sanity-test.mjs` | npm: pass-sanity |
| `passaggio-65.mjs` | npm: passaggio-65 |
| `passo-velocita-test.mjs` | npm: passo-velocita |
| `pending-mr-durable-test.mjs` | npm: pending-mr-durable |
| `piazzati-eroe-test.mjs` | npm: piazzati-eroe |
| `piede-preferito-test.mjs` | npm: piede-preferito |
| `playedmd-registry-test.mjs` | npm: playedmd-registry |
| `playing-mdref-test.mjs` | npm: playing-mdref |
| `portiere-552.mjs` | npm: portiere |
| `possesso-538.mjs` | npm: possesso |
| `postarc-buildup-lag-test.mjs` | npm: postarc-buildup-lag · sonde: postarc-buildup-live-test.mjs |
| `postarc-buildup-live-test.mjs` | npm: postarc-buildup-live |
| `presentazione-2d.mjs` | npm: presentazione |
| `prestito-91.mjs` | npm: prestito-91, prestito-91:rosso |
| `primavera-awards-test.mjs` | npm: primavera-awards |
| `primo-highlight-test.mjs` | npm: primo-highlight |
| `provino-schermate.mjs` | sonde: griglia-mobile.mjs |
| `provino-spalle.mjs` | sonde: spalle-test.mjs |
| `punizione-62.mjs` | npm: punizione-62 |
| `punizione-fuori-62.mjs` | npm: punizione-fuori-62 |
| `quick-gate.mjs` | npm: quick-gate · sonde: hud-c3.mjs |
| `recovery-competition-test.mjs` | npm: recovery-competition |
| `recv-delivery-dest-test.mjs` | npm: recv-delivery-dest |
| `reparto-90.mjs` | npm: reparto-90, reparto-90:rosso |
| `report.mjs` | lib/checks/tools · sonde: ai-vision-review.mjs, run-3d-validation.mjs, run-force-all.mjs … |
| `retire-announce-test.mjs` | npm: retire-announce |
| `revoca-909.mjs` | sonde: d7-corpi.mjs |
| `rigore-69.mjs` | npm: rigore-69 |
| `rigori-58.mjs` | npm: rigori-58 |
| `ripartenza-test.mjs` | npm: ripartenza |
| `ripresa-55.mjs` | npm: ripresa-55 |
| `risolvi-eroe-test.mjs` | npm: risolvi-eroe |
| `rndm-conteggio.mjs` | npm: rndm-conteggio |
| `rovesciata-69.mjs` | npm: rovesciata-69 |
| `rovesciata-spalle-test.mjs` | npm: rovesciata-spalle |
| `ruba-87.mjs` | npm: ruba-87, ruba-87:rosso |
| `ruleta-test.mjs` | npm: ruleta |
| `run-3d-validation.mjs` | npm: test |
| `run-force-all.mjs` | npm: force-all |
| `run-golden.mjs` | npm: selftest |
| `run-replay.mjs` | npm: replay · lib/checks/tools |
| `run-save-compat.mjs` | npm: save-compat |
| `run-stress.mjs` | npm: stress |
| `salva-84.mjs` | npm: salva-84, salva-84:rosso |
| `save-monotonic-test.mjs` | npm: save-monotonic |
| `scene-disegnabili-test.mjs` | npm: scene-disegnabili, scene-disegnabili:rosso |
| `scene-open-ball-test.mjs` | npm: scene-open-ball, scene-open-ball:selftest |
| `scene-open-owner-test.mjs` | npm: scene-open-owner |
| `scene-staging-lag-test.mjs` | npm: scene-staging-lag |
| `setpiece-celebration-test.mjs` | npm: setpiece-celebration |
| `sfondo-ritorno-test.mjs` | npm: sfondo-ritorno |
| `shot-apex-test.mjs` | npm: shot-apex |
| `sim-motore-test.mjs` | npm: sim-motore |
| `slot-card-layout-test.mjs` | npm: slot-card-layout |
| `sotto-86.mjs` | npm: sotto-86, sotto-86:rosso |
| `spalle-test.mjs` | npm: spalle |
| `sparpaglio-542.mjs` | npm: sparpaglio |
| `squad-react-test.mjs` | npm: squad-react |
| `stab-nat-trigger-test.mjs` | npm: stab-nat-trigger |
| `stadi-70.mjs` | npm: stadi-70 |
| `stale-matchday-test.mjs` | npm: stale-matchday |
| `stat-77.mjs` | npm: stat-77 |
| `stati-sub.mjs` | npm: stati-sub |
| `strisce-corpo-test.mjs` | npm: strisce-corpo |
| `tabellino-banda.mjs` | npm: tabellino-banda |
| `tabellino-lati-test.mjs` | npm: tabellino-lati |
| `tabellino-schermo.mjs` | npm: tabellino-schermo |
| `tabellino-vero.mjs` | sonde: tabellino-banda.mjs |
| `tabellone-stadi.mjs` | sonde: panchina-glb.mjs |
| `taccuino-79.mjs` | npm: taccuino-79, taccuino-79:rosso, taccuino-81, taccuino-81:rosso |
| `taccuino-ai.mjs` | npm: taccuino-ai |
| `taccuino-rete-test.mjs` | npm: taccuino-rete |
| `taglia-pallone.mjs` | npm: taglia-pallone |
| `tavolozza.mjs` | npm: tavolozza · sonde: griglia-mobile.mjs |
| `terza-volta.mjs` | npm: terza-volta |
| `testa-76.mjs` | npm: testa-76 |
| `testa-tempismo-test.mjs` | npm: testa-tempismo |
| `testa-vera-63.mjs` | npm: testa-vera-63 |
| `through-depth-test.mjs` | npm: through-depth · sonde: pass-sanity-test.mjs |
| `tiro-caricato-test.mjs` | npm: tiro-caricato |
| `tpose-56.mjs` | npm: tpose-56 |
| `trama-identita-test.mjs` | npm: trama-identita |
| `trama-test.mjs` | npm: trama |
| `tripath-chokepoint-test.mjs` | npm: tripath-chokepoint |
| `typing-shortcuts-test.mjs` | npm: typing-shortcuts |
| `validate-situations.mjs` | npm: validate-situations, validate-situations:update-golden, validate-situations:update-baseline · lib/checks/tools |
| `varieta-scene.mjs` | npm: varieta-scene |
| `vision-compare.mjs` | npm: vision-compare |
| `vision-doctor.mjs` | npm: vision-doctor |
| `vita-flow-test.mjs` | npm: vita-flow |
| `vita-variety-test.mjs` | npm: vita-variety |
| `volee-62.mjs` | npm: volee-62 |
| `volo-75.mjs` | npm: volo-75 |
| `voto-volume-test.mjs` | npm: voto-volume |
| `wave-arm-geometry.mjs` | npm: wave-arm-geometry |
| `wave-pose-sweep.mjs` | npm: wave-pose-sweep |
| `witness-frameskip-test.mjs` | npm: witness-frameskip |
| `woodwork-test.mjs` | npm: woodwork |
