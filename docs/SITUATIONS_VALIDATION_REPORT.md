# CPM — Report Validazione Automatica Situations (motore 3D)

_Generato: 2026-06-24T11:08:16.611Z · GAME_VERSION 4.64.0_

## Sommario
| Metrica | Valore |
|---|---|
| Situations nel database | 176 |
| Combinazioni situation×azione testate | 528 |
| ✅ Pulite (0 problemi) | 432 (81.8%) |
| 🟡 Solo warning | 96 (18.2%) |
| 🔴 Con FAIL | 0 (0.0%) |

### Realism Score medio (0-100)
| Sottosistema | Score |
|---|---|
| animazione | 100 |
| fisica_palla | 100 |
| sincronizzazione | 100 |
| regia | 100 |
| post_hl | 98 |
| realismo | 99 |

## Anomalie per categoria
| Categoria | fail | warn |
|---|---|---|
| ball | 0 | 8 |
| sync | 0 | 8 |
| camera | 0 | 0 |
| posthl | 0 | 82 |
| hero | 0 | 0 |

## Guardie di consistenza modello↔sorgente
✅ Tutte le 10 guardie superate — il modello rispecchia il motore reale.

## Raccomandazioni azionabili
1. **82 azioni "goal" da dribbling/costruzione mostrano solo l'esultanza (fist), non la palla in rete.** L'outcome dispatch (hl_result) per `type==="dribble"/"build"` non conosce `act.rew`. Proposta: passare il reward all'esito così un dribbling-gol instradi un post-HL "in_net" (porta vuota) invece del solo pugno.
2. **4 pallonetti** con arco < 6m: poco riconoscibili come "cucchiaio". Verificare che la label mappi a `shot_chip` (ballArcH=8.5).
3. **2 cross "secondo palo"** con target Z sullo stesso lato di partenza: rivedere il segno di `_side` per quelle situations.

## Problemi più frequenti
- **82×** [warn] (posthl) azione "goal" ma post-HL successo non è una rete (…)
- **6×** [warn] (ball) velocità di picco non plausibile (…)
- **4×** [warn] (sync) pallonetto con arco basso (…) — poco riconoscibile
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
| 15 | 97 | 🌀 Dribbling completato in are | 🌀 Dribbling portiere | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 16 | 97 | 🎯 Pallonetto su portiere in u | 🌀 Dribbling portiere | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 17 | 97 | 💥 Conclusione di collo pieno! | 🌀 Finta e tiro | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 18 | 97 | 🤼 Duello fisico! Liberati. | 🌀 Dribbling netto | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 19 | 97 | 🏃 Contropiede! Campo aperto. | 🌀 Dribbling GK | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 20 | 97 | ⚡ Scatto in profondità! | 🌀 Dribbling difensore | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 21 | 97 | 🧠 Ricezione tra le linee! | ⚡ Accelera verso porta | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 22 | 97 | 🎮 Palla a centrocampo. Costru | 🏃 Avanza palla al piede | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 23 | 97 | ⚡ Recupero palla! Riparte. | 🏃 Lancia il contropiede | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 24 | 97 | ⚡ Recupero palla! Riparte. | 🌀 Avanza palla al piede | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 25 | 97 | 🌀 Sfida 1v1 a centrocampo! | 🌀 Dribbling centrale | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 26 | 97 | 🌀 Sfida 1v1 a centrocampo! | ⚡ Scatto in velocità | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 27 | 97 | 📐 Schema! Inserimento da cent | ⚡ Taglio in profondità | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 28 | 97 | 📐 Schema! Inserimento da cent | 🎯 Taglio sul secondo palo | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 29 | 97 | 🔄 Dai e vai! Schema rapido in | ⚡ Accelera in profondità | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 30 | 97 | 🌀 TUNNEL! Prova la finta di c | 🌀 Tunnel perfetto | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 31 | 97 | 🌀 TUNNEL! Prova la finta di c | ⚡ Finta e scatto | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 32 | 97 | ⚡ Sovrapposizione! Il terzino  | ⚡ Taglio verso l'area | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 33 | 97 | 🚀 Contropiede 2 contro 1! Sup | ⚡ Scatta e tira | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 34 | 97 | 🚀 Contropiede 2 contro 1! Sup | 🌀 Finta e tiro | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 35 | 97 | 🏃 Pressing alto! Rubi palla i | 🏃 Pressing aggressivo | tackle/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 36 | 97 | 🏃 Pressing alto! Rubi palla i | ✋ Intercetta il retropassa | tackle/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 37 | 97 | 🎯 Lancio lungo millimetrico!  | ⚡ Scatto perfetto | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 38 | 97 | 🎯 Lancio lungo millimetrico!  | 🎯 Controlla e tira | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 39 | 97 | ⚡ Sprint sulla fascia! 1 contr | 💥 Tiro cross teso | cross/cross_low_driven | 🟡azione "goal" ma post-HL successo non è una rete (cross_goal) |
| 40 | 97 | 🔙 Siamo sotto 0-2. Segnare ad | 🔥 Prendo in mano la squad | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 41 | 97 | 🔙 Siamo sotto 0-2. Segnare ad | ⚡ Scatto in verticale | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 42 | 97 | 👥 Doppia marcatura! Due difen | 🌀 Dribbling stretto — li  | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 43 | 97 | 👥 Doppia marcatura! Due difen | ⚡ Scatto diagonale istanta | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 44 | 97 | 🎯 Tiro ad incrociare sul palo | 🌀 Finta e interno piede | dribble/dribble_inside | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 45 | 97 | 🦶 Tiro col mancino a sorpresa | 🌀 Finta e mancino | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 46 | 97 | 🌀 Finta di esterno e tiro int | 🌀 Finta e interno | dribble/dribble_inside | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 47 | 97 | 😱 Errore del portiere! Palla  | 🌀 Dribbla il portiere e s | dribble/dribble_feint | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 48 | 97 | ⚡ Rimessa rapida dal portiere! | ⚡ Scatto in profondità sub | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 49 | 97 | ⚡ Rimessa rapida dal portiere! | 🎯 Posizionamento smarcato | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |
| 50 | 97 | ↗️ Schema da rimessa laterale! | ⚡ Scatto sul secondo palo | build/- | 🟡azione "goal" ma post-HL successo non è una rete (hero_fist) |

## Non coperto qui (richiede harness browser+WebGL)
- Screenshot/replay reali dei frame
- Raycast camera-dentro-mesh a livello di pixel
- Clipping pallone↔giocatori per-frame (qui validato solo a livello di traiettoria/bounds)
- "Ice skating" reale (velocità piedi vs traslazione) — qui approssimato da velocità di traslazione

_Per abilitarli: aggiungere puppeteer + esecuzione headless con SwiftShader e hook su `sr.current`/THREE meshes._
