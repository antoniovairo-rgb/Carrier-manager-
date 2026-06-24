# CPM — Report Validazione Automatica Situations (motore 3D)

_Generato: 2026-06-24T11:16:26.760Z · GAME_VERSION 4.64.0_

## Sommario
| Metrica | Valore |
|---|---|
| Situations nel database | 176 |
| Combinazioni situation×azione testate | 528 |
| ✅ Pulite (0 problemi) | 510 (96.6%) |
| 🟡 Solo warning | 18 (3.4%) |
| 🔴 Con FAIL | 0 (0.0%) |

### Realism Score medio (0-100)
| Sottosistema | Score |
|---|---|
| animazione | 100 |
| fisica_palla | 100 |
| sincronizzazione | 100 |
| regia | 100 |
| post_hl | 100 |
| realismo | 100 |

## Anomalie per categoria
| Categoria | fail | warn |
|---|---|---|
| ball | 0 | 8 |
| sync | 0 | 8 |
| camera | 0 | 0 |
| posthl | 0 | 4 |
| hero | 0 | 0 |

## Guardie di consistenza modello↔sorgente
✅ Tutte le 12 guardie superate — il modello rispecchia il motore reale.

## Raccomandazioni azionabili
1. **4 azioni "goal" da dribbling/costruzione mostrano solo l'esultanza (fist), non la palla in rete.** L'outcome dispatch (hl_result) per `type==="dribble"/"build"` non conosce `act.rew`. Proposta: passare il reward all'esito così un dribbling-gol instradi un post-HL "in_net" (porta vuota) invece del solo pugno.
2. **4 pallonetti** con arco < 6m: poco riconoscibili come "cucchiaio". Verificare che la label mappi a `shot_chip` (ballArcH=8.5).
3. **2 cross "secondo palo"** con target Z sullo stesso lato di partenza: rivedere il segno di `_side` per quelle situations.

## Problemi più frequenti
- **6×** [warn] (ball) velocità di picco non plausibile (…)
- **4×** [warn] (sync) pallonetto con arco basso (…) — poco riconoscibile
- **4×** [warn] (posthl) azione "goal" ma post-HL successo non è una rete (…)
- **2×** [warn] (sync) "pallonetto/cucchiaio" ma variante non chip (…)
- **2×** [warn] (sync) far post dichiarato ma target Z sullo stesso lato di partenza
- **2×** [warn] (ball) la palla non avanza verso la porta avversaria (…)

## Classifica — 50 situations peggiori (per Realism Score)
| # | Realism | Situation | Azione | type/variant | Problemi |
|---|---|---|---|---|---|
| 1 | 93 | ⚡ Solo davanti al portiere! | 🤸 Pallonetto | shot/shot_one_on_one | 🟡"pallonetto/cucchiaio" ma variante non chip (shot_one_on_one); 🟡pallonetto con arco basso (2.6m) — poco riconoscibile |
| 2 | 93 | 🎯 Pallonetto su portiere in u | 🎯 Pallonetto preciso | shot/shot_one_on_one | 🟡"pallonetto/cucchiaio" ma variante non chip (shot_one_on_one); 🟡pallonetto con arco basso (2.6m) — poco riconoscibile |
| 3 | 96 | 🔴 RIGORE! Sul dischetto. | 🎯 Cucchiaio | penalty/- | 🟡pallonetto con arco basso (4.2m) — poco riconoscibile |
| 4 | 96 | 💪 Duello aereo su corner avve | ✈️ Stacco di testa | header/header_near_post | 🟡velocità di picco non plausibile (126 u/s) |
| 5 | 96 | ✈️ Cross avversario in area! A | ✈️ Stacco di testa deciso | header/header_near_post | 🟡velocità di picco non plausibile (123 u/s) |
| 6 | 96 | 🔴 RIGORE! Sul dischetto a 5'  | 🌀 Cucchiaio — glaciale | penalty/- | 🟡pallonetto con arco basso (4.2m) — poco riconoscibile |
| 7 | 96 | 🏳️ Angolo corto — triangola! | 💥 Tiro a giro verso il pa | shot/shot_curled | 🟡far post dichiarato ma target Z sullo stesso lato di partenza |
| 8 | 96 | ⚡ Cross dal fondo — angolo str | ↗️ Cross sul primo palo | cross/cross_near_post | 🟡la palla non avanza verso la porta avversaria (tgtX<=startX) |
| 9 | 96 | 🏃 Dribbling sulla linea di fo | ↗️ Cross al centro da fond | cross/cross_near_post | 🟡la palla non avanza verso la porta avversaria (tgtX<=startX) |
| 10 | 96 | 🎯 Lanci lunghi — alzati e con | ✈️ Colpo di testa e smista | header/header_near_post | 🟡velocità di picco non plausibile (103 u/s) |
| 11 | 96 | ✈️ Sfida aerea su lancio lungo | ✈️ Stacco dominante | header/header_near_post | 🟡velocità di picco non plausibile (119 u/s) |
| 12 | 96 | 🛑 Uscita difensiva su cross b | 🛑 Blocco deciso il cross | cross/cross_near_post | 🟡velocità di picco non plausibile (83 u/s) |
| 13 | 96 | 🎯 Lancio millimetrico in prof | 💥 Tiro lungo dal centroca | shot/shot_power | 🟡velocità di picco non plausibile (79 u/s) |
| 14 | 96 | ⚽ Taglio sul palo lontano — te | ✈️ Testa in profondità | header/header_far_post | 🟡far post dichiarato ma target Z sullo stesso lato di partenza |
| 15 | 97 | 🏃 Pressing alto! Rubi palla i | 🏃 Pressing aggressivo | tackle/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 16 | 97 | 🏃 Pressing alto! Rubi palla i | ✋ Intercetta il retropassa | tackle/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 17 | 97 | ⚡ Sprint sulla fascia! 1 contr | 💥 Tiro cross teso | cross/cross_low_driven | 🟡azione "goal" ma post-HL successo non è una rete (cross_goal) |
| 18 | 97 | 📋 Schema doppio dai e vai! | 📋 Schema a tre — dai, ric | pass/- | 🟡azione "goal" ma post-HL successo non è una rete (assist_shot) |
| 19 | 100 | ⚡ Solo davanti al portiere! | 🦵 Tiro angolato | shot/shot_one_on_one | — |
| 20 | 100 | ⚡ Solo davanti al portiere! | 🎯 Piazzato basso | shot/shot_one_on_one | — |
| 21 | 100 | 🤸 Rovesciata spettacolare! | 🤸 Rovesciata! | shot/shot_volley | — |
| 22 | 100 | 🤸 Rovesciata spettacolare! | ✈️ Stacco di testa | header/header_near_post | — |
| 23 | 100 | 🤸 Rovesciata spettacolare! | 🦵 Tiro di prima | shot/shot_volley | — |
| 24 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🦵 Spingila dentro! | shot/shot_first_time | — |
| 25 | 100 | ⚡ Tap-in! Porta quasi vuota. | 🎯 Precisione | shot/shot_first_time | — |
| 26 | 100 | ⚡ Tap-in! Porta quasi vuota. | ✈️ Di testa | header/header_near_post | — |
| 27 | 100 | 🌀 Dribbling completato in are | 🦵 Tiro a giro | shot/shot_curled | — |
| 28 | 100 | 🌀 Dribbling completato in are | 🌀 Dribbling portiere | dribble/dribble_feint | — |
| 29 | 100 | 🌀 Dribbling completato in are | 🎯 Assist retropassaggio | pass/- | — |
| 30 | 100 | 🎯 Deviazione ravvicinata! | 🦵 Deviazione istintiva | shot/shot_first_time | — |
| 31 | 100 | 🎯 Deviazione ravvicinata! | ✈️ Di testa | header/header_near_post | — |
| 32 | 100 | 🎯 Deviazione ravvicinata! | 🌀 Prima intenzione | shot/shot_volley | — |
| 33 | 100 | 🔴 RIGORE! Sul dischetto. | 💥 Angolato rasoterra | penalty/- | — |
| 34 | 100 | 🔴 RIGORE! Sul dischetto. | ⚡ Centro-alto | penalty/- | — |
| 35 | 100 | 🏳️ Corner! Attacca il secondo | ✈️ Stacco di testa | header/header_far_post | — |
| 36 | 100 | 🏳️ Corner! Attacca il secondo | 🦵 Tiro al volo | shot/shot_volley | — |
| 37 | 100 | 🏳️ Corner! Attacca il secondo | 🤝 Sponda per compagno | pass/- | — |
| 38 | 100 | ✈️ Cross in area! Attacca il p | ✈️ Colpo di testa | header/header_near_post | — |
| 39 | 100 | ✈️ Cross in area! Attacca il p | 🦵 Tiro di prima | shot/shot_volley | — |
| 40 | 100 | ✈️ Cross in area! Attacca il p | 🤸 Tacco | shot/shot_power | — |
| 41 | 100 | 💥 Tiro dal limite! | 💥 Tiro di potenza | shot/shot_power | — |
| 42 | 100 | 💥 Tiro dal limite! | 🎯 Piazzato angolato | shot/shot_curled | — |
| 43 | 100 | 💥 Tiro dal limite! | 🏃 Avanza in area | shot/shot_power | — |
| 44 | 100 | ⚽ Tiro al volo dal limite! | ⚽ Volée potente | shot/shot_volley | — |
| 45 | 100 | ⚽ Tiro al volo dal limite! | 🎯 Mezza volée | shot/shot_volley | — |
| 46 | 100 | ⚽ Tiro al volo dal limite! | 🦵 Controllo e tiro | shot/shot_power | — |
| 47 | 100 | 🎯 Pallonetto su portiere in u | 💥 Tiro di potenza | shot/shot_one_on_one | — |
| 48 | 100 | 🎯 Pallonetto su portiere in u | 🌀 Dribbling portiere | dribble/dribble_feint | — |
| 49 | 100 | 💥 Conclusione di collo pieno! | 💥 Collo pieno! | shot/shot_power | — |
| 50 | 100 | 💥 Conclusione di collo pieno! | 🎯 Interno precisione | shot/shot_power | — |

## Non coperto qui (richiede harness browser+WebGL)
- Screenshot/replay reali dei frame
- Raycast camera-dentro-mesh a livello di pixel
- Clipping pallone↔giocatori per-frame (qui validato solo a livello di traiettoria/bounds)
- "Ice skating" reale (velocità piedi vs traslazione) — qui approssimato da velocità di traslazione

_Per abilitarli: aggiungere puppeteer + esecuzione headless con SwiftShader e hook su `sr.current`/THREE meshes._
