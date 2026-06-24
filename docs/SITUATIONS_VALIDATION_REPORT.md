# CPM — Report Validazione Automatica Situations (motore 3D)

_GAME_VERSION 4.71.1_

## Sommario
| Metrica | Valore |
|---|---|
| Situations nel database | 176 |
| Combinazioni situation×azione testate | 528 |
| ✅ Pulite (0 problemi) | 517 (97.9%) |
| 🟡 Solo warning | 11 (2.1%) |
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
| ball | 0 | 0 |
| sync | 0 | 0 |
| camera | 0 | 0 |
| posthl | 0 | 0 |
| hero | 0 | 0 |
| coerenza | 0 | 11 |

## Guardie di consistenza modello↔sorgente
✅ Tutte le 16 guardie superate — il modello rispecchia il motore reale.

## Raccomandazioni azionabili
1. Nessuna raccomandazione critica — catalogo coerente.

## Problemi più frequenti
- **11×** [warn] (coerenza) cross da posizione centrale (…)

## Classifica — 50 situations peggiori (per Realism Score)
| # | Realism | Situation | Azione | type/variant | Problemi |
|---|---|---|---|---|---|
| 1 | 97 | 🎯 Tiro ad incrociare sul palo | ↗️ Cross basso sul secondo | cross/cross_far_post | 🟡cross da posizione centrale (non laterale) |
| 2 | 97 | 🦶 Tiro col mancino a sorpresa | ↗️ Cross col mancino | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 3 | 97 | ⚡ Cross di prima senza guardar | ⚡ Cross cieco di prima | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 4 | 97 | ⚡ Cross di prima senza guardar | 🎯 Cross a rientrare guard | cross/cross_cutback | 🟡cross da posizione centrale (non laterale) |
| 5 | 97 | 🌀 Elastico in area! | ↗️ Cross dopo dribbling | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 6 | 97 | 🦵 Step-over e via! | 🌀 Step-over e cross | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 7 | 97 | 💨 Finta di corpo e scatto! | 🌀 Finta di corpo e cross | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 8 | 97 | ⚡ Scatto puro — nessuno ti seg | ↗️ Cross al volo in corsa | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 9 | 97 | 🌀 Cambio di direzione a 180°! | 🎯 Giro e cross | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 10 | 97 | 🛑 Uscita difensiva su cross b | 🛑 Blocco deciso il cross | cross/cross_near_post | 🟡cross da posizione centrale (non laterale) |
| 11 | 97 | 🎯 Cucchiaio a giro sul palo l | ↗️ Cross sul secondo palo | cross/cross_far_post | 🟡cross da posizione centrale (non laterale) |
| 12 | 100 | ⚡ Solo davanti al portiere! | 🦵 Tiro angolato | shot/shot_one_on_one | — |
| 13 | 100 | ⚡ Solo davanti al portiere! | 🎯 Piazzato basso | shot/shot_one_on_one | — |
| 14 | 100 | ⚡ Solo davanti al portiere! | 🤸 Pallonetto | shot/shot_chip | — |
| 15 | 100 | 🤸 Rovesciata spettacolare! | 🤸 Rovesciata! | shot/shot_volley | — |
| 16 | 100 | 🤸 Rovesciata spettacolare! | ✈️ Stacco di testa | header/header_near_post | — |
| 17 | 100 | 🤸 Rovesciata spettacolare! | 🦵 Tiro di prima | shot/shot_first_time | — |
| 18 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🦵 Spingila dentro! | shot/shot_first_time | — |
| 19 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🎯 Precisione | shot/shot_first_time | — |
| 20 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🦶 Deviazione di prima | shot/shot_first_time | — |
| 21 | 100 | 🌀 Dribbling completato in are | 🦵 Tiro a giro | shot/shot_curled | — |
| 22 | 100 | 🌀 Dribbling completato in are | 🌀 Dribbling portiere | dribble/dribble_feint | — |
| 23 | 100 | 🌀 Dribbling completato in are | 🎯 Assist retropassaggio | pass/- | — |
| 24 | 100 | 🎯 Deviazione ravvicinata! | 🦵 Deviazione istintiva | shot/shot_first_time | — |
| 25 | 100 | 🎯 Deviazione ravvicinata! | 🦶 Deviazione di piede | shot/shot_first_time | — |
| 26 | 100 | 🎯 Deviazione ravvicinata! | 🌀 Prima intenzione | shot/shot_first_time | — |
| 27 | 100 | 🔴 RIGORE! Sul dischetto. | 💥 Angolato rasoterra | penalty/- | — |
| 28 | 100 | 🔴 RIGORE! Sul dischetto. | 🎯 Cucchiaio | penalty/penalty_panenka | — |
| 29 | 100 | 🔴 RIGORE! Sul dischetto. | ⚡ Centro-alto | penalty/- | — |
| 30 | 100 | 🏳️ Corner! Attacca il secondo | ✈️ Stacco di testa | header/header_far_post | — |
| 31 | 100 | 🏳️ Corner! Attacca il secondo | 🦵 Tiro al volo | shot/shot_volley | — |
| 32 | 100 | 🏳️ Corner! Attacca il secondo | 🤝 Sponda per compagno | pass/- | — |
| 33 | 100 | ✈️ Cross in area! Attacca il p | ✈️ Colpo di testa | header/header_near_post | — |
| 34 | 100 | ✈️ Cross in area! Attacca il p | 🦵 Tiro di prima | shot/shot_first_time | — |
| 35 | 100 | ✈️ Cross in area! Attacca il p | 🤸 Tacco | shot/shot_power | — |
| 36 | 100 | 💥 Tiro dal limite! | 💥 Tiro di potenza | shot/shot_power | — |
| 37 | 100 | 💥 Tiro dal limite! | 🎯 Piazzato angolato | shot/shot_curled | — |
| 38 | 100 | 💥 Tiro dal limite! | 🏃 Avanza in area | shot/shot_power | — |
| 39 | 100 | ⚽ Tiro al volo dal limite! | ⚽ Volée potente | shot/shot_volley | — |
| 40 | 100 | ⚽ Tiro al volo dal limite! | 🎯 Mezza volée | shot/shot_volley | — |
| 41 | 100 | ⚽ Tiro al volo dal limite! | 🦵 Controllo e tiro | shot/shot_power | — |
| 42 | 100 | 🎯 Pallonetto su portiere in u | 🎯 Pallonetto preciso | shot/shot_chip | — |
| 43 | 100 | 🎯 Pallonetto su portiere in u | 💥 Tiro di potenza | shot/shot_one_on_one | — |
| 44 | 100 | 🎯 Pallonetto su portiere in u | 🌀 Dribbling portiere | dribble/dribble_feint | — |
| 45 | 100 | 💥 Conclusione di collo pieno! | 💥 Collo pieno! | shot/shot_power | — |
| 46 | 100 | 💥 Conclusione di collo pieno! | 🎯 Interno precisione | shot/shot_power | — |
| 47 | 100 | 💥 Conclusione di collo pieno! | 🌀 Finta e tiro | dribble/dribble_feint | — |
| 48 | 100 | 🦵 Tiro con l'esterno del pied | 🦵 Esterno a giro | shot/shot_curled | — |
| 49 | 100 | 🦵 Tiro con l'esterno del pied | 🎯 Rientra e tira | shot/shot_power | — |
| 50 | 100 | 🦵 Tiro con l'esterno del pied | 🤸 Colpo d'esterno | shot/shot_power | — |

## Non coperto qui (richiede harness browser+WebGL)
- Screenshot/replay reali dei frame
- Raycast camera-dentro-mesh a livello di pixel
- Clipping pallone↔giocatori per-frame (qui validato solo a livello di traiettoria/bounds)
- "Ice skating" reale (velocità piedi vs traslazione) — qui approssimato da velocità di traslazione

_Per abilitarli: aggiungere puppeteer + esecuzione headless con SwiftShader e hook su `sr.current`/THREE meshes._
