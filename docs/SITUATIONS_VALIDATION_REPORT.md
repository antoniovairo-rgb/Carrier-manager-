# CPM — Report Validazione Automatica Situations (motore 3D)

_GAME_VERSION 7.196.0_

## Sommario
| Metrica | Valore |
|---|---|
| Situations nel database | 191 |
| Combinazioni situation×azione testate | 573 |
| ✅ Pulite (0 problemi) | 558 (97.4%) |
| 🟡 Solo warning | 15 (2.6%) |
| 🔴 Con FAIL | 0 (0.0%) |

### Realism Score medio (0-100)
| Sottosistema | Score |
|---|---|
| animazione | 100 |
| fisica_palla | 100 |
| sincronizzazione | 100 |
| regia | 100 |
| post_hl | 100 |
| coerenza | 100 |
| realismo | 100 |

## Anomalie per categoria
| Categoria | fail | warn |
|---|---|---|
| ball | 0 | 2 |
| sync | 0 | 0 |
| camera | 0 | 0 |
| posthl | 0 | 0 |
| hero | 0 | 0 |
| coerenza | 0 | 13 |

## Guardie di consistenza modello↔sorgente
✅ Tutte le 16 guardie superate — il modello rispecchia il motore reale.

## Raccomandazioni azionabili
1. Nessuna raccomandazione critica — catalogo coerente.

## Problemi più frequenti
- **12×** [warn] (coerenza) cross da posizione centrale (…)
- **2×** [warn] (ball) velocità di picco non plausibile (…)
- **1×** [warn] (coerenza) volée su palla non aerea (…)

## Classifica — 50 situations peggiori (per Realism Score)
| # | Realism | Situation | Azione | type/variant | Problemi |
|---|---|---|---|---|---|
| 1 | 96 | 🔴 RIGORE! Sul dischetto. | 🎯 Cucchiaio | penalty/penalty_panenka | 🟡velocità di picco non plausibile (88 u/s) |
| 2 | 96 | 🔴 RIGORE! Sul dischetto a 5'  | 🌀 Cucchiaio — glaciale | penalty/penalty_panenka | 🟡velocità di picco non plausibile (76 u/s) |
| 3 | 97 | 🎯 Tiro ad incrociare sul palo | ↗️ Cross basso sul secondo | cross/cross_far_post | 🟡cross da posizione centrale (non laterale) |
| 4 | 97 | 🦶 Tiro col mancino a sorpresa | ↗️ Cross col mancino | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 5 | 97 | ⚡ Cross di prima senza guardar | ⚡ Cross cieco di prima | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 6 | 97 | ⚡ Cross di prima senza guardar | 🎯 Cross a rientrare guard | cross/cross_cutback | 🟡cross da posizione centrale (non laterale) |
| 7 | 97 | 🌀 Elastico in area! | ↗️ Cross dopo dribbling | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 8 | 97 | 🦵 Step-over e via! | 🌀 Step-over e cross | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 9 | 97 | 💨 Finta di corpo e scatto! | 🌀 Finta di corpo e cross | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 10 | 97 | ⚡ Scatto puro — nessuno ti seg | ↗️ Cross al volo in corsa | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 11 | 97 | 🌀 Cambio di direzione a 180°! | 🎯 Giro e cross | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 12 | 97 | 🛑 Cross basso in area — inter | 🛑 Blocca il cross con il  | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 13 | 97 | 🏃 Rimessa dal portiere — vert | 🏃 Scatto in profondità e  | cross/cross_far_post | 🟡cross da posizione centrale (non laterale) |
| 14 | 97 | 🎯 Cucchiaio a giro sul palo l | ↗️ Cross sul secondo palo | cross/cross_far_post | 🟡cross da posizione centrale (non laterale) |
| 15 | 97 | 👟 Muro di prima e scatto — da | ⚡ Uno-due e conclusione al | shot/shot_power | 🟡volée su palla non aerea (feet) |
| 16 | 100 | ⚡ Solo davanti al portiere! | 🦵 Tiro angolato | shot/shot_one_on_one | — |
| 17 | 100 | ⚡ Solo davanti al portiere! | 🎯 Piazzato basso | shot/shot_one_on_one | — |
| 18 | 100 | ⚡ Solo davanti al portiere! | 🤸 Pallonetto | shot/shot_chip | — |
| 19 | 100 | 🤸 Rovesciata spettacolare! | 🤸 Rovesciata! | shot/shot_volley | — |
| 20 | 100 | 🤸 Rovesciata spettacolare! | ✈️ Stacco di testa | header/header_near_post | — |
| 21 | 100 | 🤸 Rovesciata spettacolare! | 🦵 Tiro di prima | shot/shot_first_time | — |
| 22 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🦵 Spingila dentro! | shot/shot_first_time | — |
| 23 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🎯 Precisione | shot/shot_first_time | — |
| 24 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🦶 Deviazione di prima | shot/shot_first_time | — |
| 25 | 100 | 🌀 Con palla in area — un dife | 🦵 Tiro a giro | shot/shot_curled | — |
| 26 | 100 | 🌀 Con palla in area — un dife | 🌀 Dribbling portiere | dribble/dribble_feint | — |
| 27 | 100 | 🌀 Con palla in area — un dife | 🎯 Assist retropassaggio | pass/- | — |
| 28 | 100 | 🎯 Deviazione ravvicinata! | 🦵 Deviazione istintiva | shot/shot_first_time | — |
| 29 | 100 | 🎯 Deviazione ravvicinata! | 🦶 Deviazione di piede | shot/shot_first_time | — |
| 30 | 100 | 🎯 Deviazione ravvicinata! | 🌀 Prima intenzione | shot/shot_first_time | — |
| 31 | 100 | 🔴 RIGORE! Sul dischetto. | 💥 Angolato rasoterra | penalty/- | — |
| 32 | 100 | 🔴 RIGORE! Sul dischetto. | ⚡ Centro-alto | penalty/- | — |
| 33 | 100 | 🏳️ Corner! Attacca il secondo | ✈️ Stacco di testa | header/header_far_post | — |
| 34 | 100 | 🏳️ Corner! Attacca il secondo | 🦵 Tiro al volo | shot/shot_volley | — |
| 35 | 100 | 🏳️ Corner! Attacca il secondo | 🤝 Sponda per compagno | pass/- | — |
| 36 | 100 | ✈️ Cross in area! Attacca il p | ✈️ Colpo di testa | header/header_near_post | — |
| 37 | 100 | ✈️ Cross in area! Attacca il p | 🦵 Tiro di prima | shot/shot_first_time | — |
| 38 | 100 | ✈️ Cross in area! Attacca il p | 🤸 Tacco | shot/shot_power | — |
| 39 | 100 | 💥 Tiro dal limite! | 💥 Tiro di potenza | shot/shot_power | — |
| 40 | 100 | 💥 Tiro dal limite! | 🎯 Piazzato angolato | shot/shot_curled | — |
| 41 | 100 | 💥 Tiro dal limite! | 🏃 Avanza in area | shot/shot_power | — |
| 42 | 100 | ⚽ Tiro al volo dal limite! | ⚽ Volée potente | shot/shot_volley | — |
| 43 | 100 | ⚽ Tiro al volo dal limite! | 🎯 Mezza volée | shot/shot_volley | — |
| 44 | 100 | ⚽ Tiro al volo dal limite! | 🦵 Controllo e tiro | shot/shot_power | — |
| 45 | 100 | 🎯 Pallonetto su portiere in u | 🎯 Pallonetto preciso | shot/shot_chip | — |
| 46 | 100 | 🎯 Pallonetto su portiere in u | 💥 Tiro di potenza | shot/shot_one_on_one | — |
| 47 | 100 | 🎯 Pallonetto su portiere in u | 🌀 Dribbling portiere | dribble/dribble_feint | — |
| 48 | 100 | 💥 Conclusione di collo pieno! | 💥 Collo pieno! | shot/shot_power | — |
| 49 | 100 | 💥 Conclusione di collo pieno! | 🎯 Interno precisione | shot/shot_power | — |
| 50 | 100 | 💥 Conclusione di collo pieno! | 🌀 Finta e tiro | dribble/dribble_feint | — |

## Analisi Catalogo (Phase 12)
| Check | Fail | Warn |
|---|---|---|
| catalogo | 0 | 1 |

### Dettaglio issues catalogo
- [warn] sit[164] ⚡ Taglio dal lato destro verso il centro — DUPLICATE (sim=0.75) con sit[165] "⚡ Taglio dal lato sinistro verso il cent"

## Coverage Catalogo
| Tipo | Count |
|---|---|
| off | 156 |
| def | 30 |
| special | 5 |

| Zona | Sits |
|---|---|
| trequarti | 88 |
| bordo | 87 |
| area | 69 |
| centro | 41 |
| difesa | 29 |
| propria | 14 |
| fascia | 4 |

_Situations con campo `tactic`: **191** / 191_

## Non coperto qui (richiede harness browser+WebGL)
- Screenshot/replay reali dei frame
- Raycast camera-dentro-mesh a livello di pixel
- Clipping pallone↔giocatori per-frame (qui validato solo a livello di traiettoria/bounds)
- "Ice skating" reale (velocità piedi vs traslazione) — qui approssimato da velocità di traslazione

_Per abilitarli: aggiungere puppeteer + esecuzione headless con SwiftShader e hook su `sr.current`/THREE meshes._
