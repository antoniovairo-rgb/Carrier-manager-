# Censimento delle scene dell'eroe (automatico)

Generato da `tests/visual/censimento-scene.mjs` sulla build corrente. Situations: **191** · azioni: **573**.

| Verdetto | Azioni |
|---|---|
| fedele | 275 |
| approssimata | 274 |
| non disegnabile | 24 |

Il verdetto viene da un registro di parole-gesto scritto da me (in testa allo script), con giudizio dichiarato per ogni gesto: da validare.

## Varianti di GESTI mai raggiunte da deriveHL (15 su 46)

- `shot/shot_placed`
- `cross/cross_rabona`
- `cross/cross_after_dribble`
- `dribble/dribble_inside`
- `dribble/dribble_outside`
- `dribble/double_step`
- `dribble/step_over`
- `dribble/feint`
- `dribble/roulette`
- `dribble/hocus_pocus`
- `pass/short_pass`
- `pass/long_pass`
- `pass/chip_pass`
- `pass/backheel`
- `tackle/aerial`

## Situations il cui TESTO promette un gesto non disegnabile (11)

| gi | testo | promette |
|---|---|---|
| 26 | 💫 Assist di tacco! Giocata geniale. | tacco |
| 40 | 🌀 Difensore di fronte — come lo superi? | tunnel |
| 42 | 🦶 Fascia chiusa — cross difficile, angolo stretto! | rabona |
| 65 | 🛑 Stop di petto e tiro fulmineo! | petto |
| 92 | 🔄 Roulette sul difensore! | roulette |
| 93 | 🌀 Elastico in area! | elastico |
| 98 | 🌀 Tunnel in area! Passa in mezzo. | tunnel |
| 100 | 🔄 Hocus pocus sulla fascia! | hocus_pocus |
| 110 | 🏃 Fai il velo per il compagno! | velo |
| 115 | 🦶 Tacco al limite! Colpo di classe. | tacco |
| 138 | 📣 Allineati con la difesa — linea alta! | comando |

## Azioni non disegnabili (24)

| gi | ai | situation | azione | famiglia/variante | clip montata | promette | perché |
|---|---|---|---|---|---|---|---|
| 7 | 2 | ✈️ Cross in area! Attacca il pallone. | 🤸 Tacco | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | tacco:n | clip pass: nessun colpo di tacco |
| 21 | 1 | ⚡ Doppio dribbling in velocità! | 🌀 Elastico e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | elastico:n, tiro:f | nessun elastico: finta generica |
| 26 | 0 | 💫 Assist di tacco! Giocata geniale. | 💫 Tacco preciso | pass/heel | pass | tacco:n | clip pass: nessun colpo di tacco |
| 31 | 2 | 🛡️ Avversario porta palla — sfida in sc | 📣 Copri la linea | tackle/base · def press | slide-tackle/tackle | comando:n, pressing:a | nessun gesto di comando: l'eroe corre; defGesto press: locomozione |
| 35 | 2 | ⚡ Contropiede avversario! Torna in difes | 📣 Organizza la difesa | tackle/base · def press | slide-tackle/tackle | comando:n, pressing:a | nessun gesto di comando: l'eroe corre; defGesto press: locomozione |
| 40 | 0 | 🌀 Difensore di fronte — come lo superi? | 🌀 Tunnel perfetto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | tunnel:n | il pallone non passa fra le gambe del difensore |
| 42 | 0 | 🦶 Fascia chiusa — cross difficile, ango | 🦶 Rabona cross | cross/cross_near_post | pass | rabona:n, cross:f | nessuna rabona: cross normale |
| 69 | 0 | 🔄 Spalle alla porta in area — come ti g | 🔄 Tacco in porta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | tacco:n | clip pass: nessun colpo di tacco |
| 76 | 1 | 🏳️ Corner sul primo palo! | 🔄 Tacco verso compagno | pass/heel | pass | tacco:n | clip pass: nessun colpo di tacco |
| 85 | 2 | ↘️ Cross rasoterra al centro! | 🤸 Deviazione acrobatica col tacco | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | tacco:n, acrobatico:a | clip pass: nessun colpo di tacco; «acrobatico» senza rovesciata/sforbiciata nell'etichetta: clip volley, non un gesto acrobatico |
| 92 | 0 | 🔄 Roulette sul difensore! | 🔄 Roulette di classe | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | roulette:n | nessuna giravolta sul pallone: finta generica (change-direction) |
| 93 | 0 | 🌀 Elastico in area! | 🌀 Elastico e tiro netto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | elastico:n, tiro:f | nessun elastico: finta generica |
| 98 | 0 | 🌀 Tunnel in area! Passa in mezzo. | 🌀 Tunnel e tiro netto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | tunnel:n, tiro:f | il pallone non passa fra le gambe del difensore |
| 100 | 0 | 🔄 Hocus pocus sulla fascia! | 🔄 Hocus pocus e cross | cross/cross_near_post | pass | hocus_pocus:n, cross:f | nessun colpo dietro la gamba d'appoggio |
| 110 | 0 | 🏃 Fai il velo per il compagno! | 🏃 Faccio il velo e attacco | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | velo:n | nessun gesto: locomozione |
| 110 | 1 | 🏃 Fai il velo per il compagno! | ↩️ Ricevo dopo il velo | pass/base | pass | velo:n | nessun gesto: locomozione |
| 110 | 2 | 🏃 Fai il velo per il compagno! | ⚡ Scatto oltre il velo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | velo:n, dribbling:a | nessun gesto: locomozione; clip dribble / change-direction (gesto generico) |
| 111 | 2 | ⚡ Assist rasoterra in area piccola! | 🤸 Tacco verso il compagno libero | pass/heel | pass | tacco:n | clip pass: nessun colpo di tacco |
| 115 | 2 | 🦶 Tacco al limite! Colpo di classe. | ↩️ Tacco per il compagno libero | pass/heel | pass | tacco:n | clip pass: nessun colpo di tacco |
| 124 | 1 | 🎯 Lanci lunghi — alzati e controlla! | 🛑 Stop di petto e conserva | build/base | dribble | petto:n, controllo:a, temporeggia:a | ricezione normale, nessun controllo di petto; clip receive (controllo generico); locomozione / dribble lento |
| 129 | 2 | 🤼 Raddoppio difensivo! | 📣 Chiamo il compagno a raddoppiare | tackle/base · def call | slide-tackle/tackle | pressing:a, comando:n, comando:n | locomozione verso il portatore (nessun gesto di pressione); nessun gesto di comando: l'eroe corre; defGesto call: nessuna clip |
| 135 | 2 | 🤝 Copertura del compagno fuori posizion | 📣 Comunico la situazione | tackle/base · def call | slide-tackle/tackle | comando:n, comando:n | nessun gesto di comando: l'eroe corre; defGesto call: nessuna clip |
| 166 | 1 | 🌀 Slalom in area! Tre difensori da supe | ⚡ Scatto tra le gambe | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | tunnel:n, dribbling:a | il pallone non passa fra le gambe del difensore; clip dribble / change-direction (gesto generico) |
| 168 | 2 | 🛡️ Ultimo uomo! Devi fermare l'avversar | 📣 Guida i compagni e copri | tackle/base · def press | slide-tackle/tackle | comando:n, pressing:a | nessun gesto di comando: l'eroe corre; defGesto press: locomozione |

## Tutte le azioni

| gi | ai | azione | famiglia/variante | clip | verdetto | promette |
|---|---|---|---|---|---|---|
| 0 | 0 | 🦵 Tiro angolato | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 0 | 1 | 🎯 Piazzato basso | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 0 | 2 | 🤸 Pallonetto | shot/shot_chip | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cucchiaio:f |
| 1 | 0 | 🤸 Rovesciata! | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | rovesciata:f |
| 1 | 1 | ✈️ Stacco di testa | header/header_near_post | header | fedele | testa:f |
| 1 | 2 | 🦵 Tiro di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 2 | 0 | 🦵 Spingila dentro! | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 2 | 1 | 🎯 Precisione | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 2 | 2 | 🦶 Deviazione di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 3 | 0 | 🦵 Tiro a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 3 | 1 | 🌀 Dribbling portiere | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 3 | 2 | 🎯 Assist retropassaggio | pass/base | pass | fedele | passaggio:f |
| 4 | 0 | 🦵 Deviazione istintiva | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 4 | 1 | 🦶 Deviazione di piede | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 4 | 2 | 🌀 Prima intenzione | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 5 | 0 | 💥 Angolato rasoterra | penalty/base | penalty | approssimata |  |
| 5 | 1 | 🎯 Cucchiaio | penalty/penalty_panenka | penalty | fedele | cucchiaio:f |
| 5 | 2 | ⚡ Centro-alto | penalty/base | penalty | approssimata |  |
| 6 | 0 | ✈️ Stacco di testa | header/header_far_post | header | fedele | testa:f |
| 6 | 1 | 🦵 Tiro al volo | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | volee:f, tiro:f |
| 6 | 2 | 🤝 Sponda per compagno | pass/base | pass | fedele | passaggio:f |
| 7 | 0 | ✈️ Colpo di testa | header/header_near_post | header | fedele | testa:f |
| 7 | 1 | 🦵 Tiro di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 7 | 2 | 🤸 Tacco | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | tacco:n |
| 8 | 0 | 💥 Tiro di potenza | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 8 | 1 | 🎯 Piazzato angolato | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 8 | 2 | 🏃 Avanza in area | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 9 | 0 | ⚽ Volée potente | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | volee:f |
| 9 | 1 | 🎯 Mezza volée | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | volee:f |
| 9 | 2 | 🦵 Controllo e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 10 | 0 | 🎯 Pallonetto preciso | shot/shot_chip | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cucchiaio:f |
| 10 | 1 | 💥 Tiro di potenza | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 10 | 2 | 🌀 Dribbling portiere | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 11 | 0 | 💥 Collo pieno! | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 11 | 1 | 🎯 Interno precisione | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 11 | 2 | 🌀 Finta e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 12 | 0 | 🦵 Esterno a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f |
| 12 | 1 | 🎯 Rientra e tira | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 12 | 2 | 🤸 Colpo d'esterno | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f |
| 13 | 0 | 🎯 Punizione a giro | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, punizione:f |
| 13 | 1 | 💥 Tiro rasoterra | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 13 | 2 | ↗️ Palla in area | freekick/freekick_cross_high | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 14 | 0 | ↗️ Cross basso teso | freekick/freekick_cross_low | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cross:f |
| 14 | 1 | ↗️ Cross alto | freekick/freekick_cross_high | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cross:f |
| 14 | 2 | 🌀 Giocata corta | freekick/freekick_short | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 15 | 0 | ↗️ Cross basso teso | freekick/freekick_cross_low | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cross:f |
| 15 | 1 | ↗️ Cross alto | freekick/freekick_cross_high | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cross:f |
| 15 | 2 | 🌀 Giocata corta | freekick/freekick_short | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 16 | 0 | ↗️ Cross teso | cross/cross_low_driven | pass | fedele | cross:f |
| 16 | 1 | ↗️ Cross a rientrare | cross/cross_cutback | pass | fedele | giro:f, cross:f |
| 16 | 2 | 🦵 Tiro a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 17 | 0 | ↗️ Cross teso | cross/cross_low_driven | pass | fedele | cross:f |
| 17 | 1 | ↗️ Cross a rientrare | cross/cross_cutback | pass | fedele | giro:f, cross:f |
| 17 | 2 | 🦵 Tiro a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 18 | 0 | 🌀 Dribbling netto | pass/base | pass | approssimata | dribbling:a |
| 18 | 1 | ⚡ Sterzata fulminea | pass/base | pass | approssimata |  |
| 18 | 2 | 💥 Tiro a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 19 | 0 | 🌀 Dribbling netto | pass/base | pass | approssimata | dribbling:a |
| 19 | 1 | ⚡ Sterzata fulminea | pass/base | pass | approssimata |  |
| 19 | 2 | 💥 Tiro a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 20 | 0 | 🌀 Dribbling netto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 20 | 1 | ⚡ Scatto puro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 20 | 2 | ↩️ Dai e vai | pass/one_two | pass | fedele | passaggio:f |
| 21 | 0 | ⚡ Doppio passo esplosivo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | step_over:a |
| 21 | 1 | 🌀 Elastico e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | elastico:n, tiro:f |
| 21 | 2 | 🎯 Assist a sorpresa | pass/base | pass | fedele | passaggio:f |
| 22 | 0 | ⚡ Sprint e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 22 | 1 | 🎯 Assist filtrante | pass/base | pass | fedele | passaggio:f |
| 22 | 2 | 🌀 Dribbling GK | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 23 | 0 | ⚡ Scatto e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 23 | 1 | 🎯 Filtrante per compagno | pass/base | pass | fedele | passaggio:f |
| 23 | 2 | 🌀 Dribbling difensore | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 24 | 0 | 🎯 Assist filtrante | pass/base | pass | fedele | passaggio:f |
| 24 | 1 | ⚡ Accelera verso porta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 24 | 2 | 💥 Tiro dal limite | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 25 | 0 | 🎯 Filtrante millimetrico | pass/base | pass | fedele | passaggio:f |
| 25 | 1 | ↩️ Dai e vai | pass/one_two | pass | fedele | passaggio:f |
| 25 | 2 | 💥 Tiro dal limite | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 26 | 0 | 💫 Tacco preciso | pass/heel | pass | NON DISEGNABILE | tacco:n |
| 26 | 1 | 🦵 Tiro di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 26 | 2 | 🔄 Doppio passo e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | step_over:a, tiro:f |
| 27 | 0 | 🎯 Triangolo e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f, passaggio:f |
| 27 | 1 | ↩️ Dai e vai | pass/one_two | pass | fedele | passaggio:f |
| 27 | 2 | 💥 Tiro di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 28 | 0 | ⚡ Verticale | pass/base | pass | approssimata |  |
| 28 | 1 | 🔄 Scarico sulla fascia | pass/pass_ground | pass | fedele | passaggio:f |
| 28 | 2 | 🏃 Avanza e servi il taglio | pass/base | pass | approssimata | dribbling:a |
| 29 | 0 | 🏃 Lancia il contropiede | pass/pass_lofted | pass | approssimata |  |
| 29 | 1 | 🎯 Lancio lungo | pass/pass_lofted | pass | fedele | passaggio:f |
| 29 | 2 | 🌀 Riconquista e conserva | build/base | dribble | approssimata | temporeggia:a |
| 30 | 0 | 🌀 Dribbling centrale e conduci | dribble/dribble_feint | change-direction | approssimata | dribbling:a |
| 30 | 1 | ⚡ Scatto e servi il compagno | pass/base | pass | approssimata | dribbling:a |
| 30 | 2 | ↩️ Triangolo | pass/one_two | pass | fedele | passaggio:f |
| 31 | 0 | 🛡️ Scivolata netta | tackle/base · def slide | slide-tackle/tackle | fedele | contrasto:f |
| 31 | 1 | ✋ Intercetta di piede | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 31 | 2 | 📣 Copri la linea | tackle/base · def press | slide-tackle/tackle | NON DISEGNABILE | comando:n, pressing:a |
| 32 | 0 | ✋ Anticipo di posizione | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 32 | 1 | 🏃 Sprint di copertura | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 32 | 2 | 💪 Contrasto fisico | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 33 | 0 | 🧱 Blocca con il corpo | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 33 | 1 | ✋ Devia col piede | tackle/base · def lunge | slide-tackle/tackle | approssimata |  |
| 33 | 2 | 📣 Chiama il portiere | tackle/base · def call | slide-tackle/tackle | approssimata |  |
| 34 | 0 | 🏃 Pressing aggressivo | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a, pressing:a |
| 34 | 1 | ✋ Intercetta il retropassaggio | tackle/base · def lunge | slide-tackle/tackle | fedele | passaggio:f, contrasto:f |
| 34 | 2 | 🌀 Finta e recupera palla | tackle/base · def press | slide-tackle/tackle | approssimata | dribbling:a, contrasto:f, pressing:a |
| 35 | 0 | ⚡ Sprint di rientro | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 35 | 1 | 🛡️ Posizione preventiva | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 35 | 2 | 📣 Organizza la difesa | tackle/base · def press | slide-tackle/tackle | NON DISEGNABILE | comando:n, pressing:a |
| 36 | 0 | ✈️ Stacco di testa | header/header_near_post · def aerial | header | fedele | testa:f |
| 36 | 1 | 🤼 Contrasto fisico | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 36 | 2 | 📣 Guida i compagni | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 37 | 0 | ⚡ Taglio in profondità e rimorchio | pass/base | pass | approssimata |  |
| 37 | 1 | 🎯 Taglio sul secondo palo e sponda | pass/base | pass | fedele | passaggio:f |
| 37 | 2 | ↩️ Dai e vai corto | pass/one_two | pass | fedele | passaggio:f |
| 38 | 0 | ↩️ Dai e vai preciso | pass/one_two | pass | fedele | passaggio:f |
| 38 | 1 | ⚡ Accelera in profondità | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 38 | 2 | 🎯 Tiro di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 39 | 0 | 📐 Sponda per il rimorchio | pass/base | pass | fedele | passaggio:f |
| 39 | 1 | 🦵 Tiro di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 39 | 2 | 🌀 Controllo e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 40 | 0 | 🌀 Tunnel perfetto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | tunnel:n |
| 40 | 1 | ⚡ Finta e scatto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 40 | 2 | 🔙 Retropassaggio sicuro | pass/base | pass | fedele | passaggio:f |
| 41 | 0 | 🔄 Rovesciata spettacolare | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | rovesciata:f |
| 41 | 1 | 🦵 Colpo di testa normale | header/header_near_post | header | fedele | testa:f |
| 41 | 2 | 🔙 Controllo e appoggio | pass/base | pass | approssimata | passaggio:f, controllo:a |
| 42 | 0 | 🦶 Rabona cross | cross/cross_near_post | pass | NON DISEGNABILE | rabona:n, cross:f |
| 42 | 1 | ⚡ Cross normale | cross/cross_near_post | pass | fedele | cross:f |
| 42 | 2 | 🎯 Tiro a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 43 | 0 | 💥 Botta col collo pieno | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 43 | 1 | 🎯 Destro rasoterra | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 43 | 2 | 🔄 Serve in area | pass/base | pass | approssimata |  |
| 44 | 0 | ✈️ Stacco di testa deciso | header/header_near_post · def aerial | header | fedele | testa:f |
| 44 | 1 | 🛡️ Chiudi di spalla | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 44 | 2 | 📣 Chiama il portiere | tackle/base · def call | slide-tackle/tackle | approssimata |  |
| 45 | 0 | 🧱 Corpo sulla traiettoria | tackle/base · def lunge | slide-tackle/tackle | approssimata |  |
| 45 | 1 | ✋ Devia col piede | tackle/base · def lunge | slide-tackle/tackle | approssimata |  |
| 45 | 2 | 😱 Tentativo disperato | tackle/base · def slide | slide-tackle/tackle | approssimata |  |
| 46 | 0 | ↗️ Cross al centro | cross/cross_near_post | pass | fedele | cross:f |
| 46 | 1 | ⚡ Taglio verso l'area | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 46 | 2 | ↩️ Appoggio corto | pass/pass_ground | pass | fedele | passaggio:f |
| 47 | 0 | 🎯 Assist al compagno | pass/base | pass | fedele | passaggio:f |
| 47 | 1 | ⚡ Scatta e tira | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 47 | 2 | 🌀 Finta e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 48 | 0 | 🦵 Spinta di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 48 | 1 | ✈️ Di testa | header/header_near_post | header | fedele | testa:f |
| 48 | 2 | 🌀 Controllo e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 49 | 0 | 🦵 Deviazione al volo | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | volee:f |
| 49 | 1 | ↗️ Sponda per compagno | pass/base | pass | fedele | passaggio:f |
| 49 | 2 | 💥 Tiro potente | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 50 | 0 | 🎯 Triangolo e cross | cross/cross_near_post | pass | fedele | passaggio:f, cross:f |
| 50 | 1 | 💥 Tiro a giro | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 50 | 2 | 🌀 Dribbling e cross | cross/cross_near_post | pass | approssimata | cross:f, dribbling:a |
| 51 | 0 | ↗️ In area per l'incornata del compagno | freekick/freekick_cross_high | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | testa:f |
| 51 | 1 | 💥 Bordata sotto la barriera | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 51 | 2 | 🌀 Giocata corta | freekick/freekick_short | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 52 | 0 | ✈️ Colpo di testa sulla porta | header/header_near_post | header | fedele | testa:f |
| 52 | 1 | 🌀 Scavalco il portiere | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 52 | 2 | 🎯 Pallone al compagno | pass/base | pass | approssimata |  |
| 53 | 0 | 🦵 Prima intenzione! | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 53 | 1 | ✈️ Di testa al volo | header/header_near_post | header | fedele | volee:f, testa:f |
| 53 | 2 | 🤝 Sponda per compagno | pass/base | pass | fedele | passaggio:f |
| 54 | 0 | 🏃 Pressing aggressivo | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a, pressing:a |
| 54 | 1 | ✋ Intercetta il retropassaggio | tackle/base · def lunge | slide-tackle/tackle | fedele | passaggio:f, contrasto:f |
| 54 | 2 | 📣 Copri le linee di passaggio | tackle/base · def press | slide-tackle/tackle | approssimata | passaggio:f, pressing:a |
| 55 | 0 | ✈️ Stacco sul palo lontano | header/header_far_post | header | fedele | testa:f |
| 55 | 1 | 🦵 Mezza rovesciata | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | rovesciata:f |
| 55 | 2 | 🤝 Sponda indietro | pass/base | pass | fedele | passaggio:f |
| 56 | 0 | ⚡ Scatto perfetto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 56 | 1 | 🎯 Controlla e tira | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 56 | 2 | ↩️ Rimanda al mittente | pass/base | pass | approssimata |  |
| 57 | 0 | ⚡ Spunto esplosivo | pass/base | pass | approssimata | dribbling:a |
| 57 | 1 | 🌀 Dribbling di tecnica | pass/base | pass | approssimata | dribbling:a |
| 57 | 2 | 💥 Tiro cross teso | cross/cross_low_driven | pass | fedele | tiro:f, cross:f |
| 58 | 0 | 💥 Angolo basso — potenza | penalty/base | penalty | approssimata |  |
| 58 | 1 | 🌀 Cucchiaio — glaciale | penalty/penalty_panenka | penalty | fedele | cucchiaio:f |
| 58 | 2 | ⚡ Incrociato rasoterra | penalty/base | penalty | approssimata |  |
| 59 | 0 | 🔥 Prendo in mano la squadra | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 59 | 1 | ⚡ Scatto in verticale | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 59 | 2 | 🎯 Lancio smarcante | pass/pass_lofted | pass | fedele | passaggio:f |
| 60 | 0 | 🌀 Li salto e servo il compagno libero | pass/pass_lofted | pass | approssimata |  |
| 60 | 1 | ↩️ Dai e ricevi — smarca il compagno | pass/base | pass | approssimata |  |
| 60 | 2 | ⚡ Scatto diagonale — esci dal raddoppio | build/base | dribble | approssimata | dribbling:a, pressing:a |
| 61 | 0 | 🤝 Sponda corta e tira | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f, passaggio:f |
| 61 | 1 | 🦵 Prima intenzione | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 61 | 2 | ↩️ Retropassaggio al limite | pass/base | pass | fedele | passaggio:f |
| 62 | 0 | 💥 Tiro di prima potente | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 62 | 1 | 🎯 Deviazione controllata | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | controllo:a |
| 62 | 2 | 🤝 Sponda al compagno | pass/base | pass | fedele | passaggio:f |
| 63 | 0 | 🎯 Incrociato sul palo lontano | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 63 | 1 | 🌀 Finta e interno piede | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 63 | 2 | ↗️ Cross basso sul secondo palo | cross/cross_far_post | pass | fedele | cross:f |
| 64 | 0 | ✈️ Testa potente angolato | header/header_near_post | header | fedele | testa:f |
| 64 | 1 | 🎯 Testa preciso al centro | header/header_near_post | header | fedele | testa:f |
| 64 | 2 | 🌀 Colpo di testa smorzato per compagno | header/header_flick | header | fedele | testa:f |
| 65 | 0 | 🛑 Stop e tiro netto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 65 | 1 | 💥 Volée immediata | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | volee:f |
| 65 | 2 | ↩️ Controllo e serve il compagno | pass/base | pass | approssimata | controllo:a |
| 66 | 0 | ↘️ Tocco sotto morbido | pass/base | pass | approssimata |  |
| 66 | 1 | 🦵 Tiro a porta semiaperta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 66 | 2 | 🌀 Dribbling portiere e appoggia | pass/base | pass | approssimata | passaggio:f, dribbling:a |
| 67 | 0 | 🦶 Mancino angolato | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 67 | 1 | 🌀 Finta e mancino | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 67 | 2 | ↗️ Cross col mancino | cross/cross_near_post | pass | fedele | cross:f |
| 68 | 0 | ⚡ Sforbiciata al volo | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | rovesciata:f, volee:f |
| 68 | 1 | 🦵 Tiro di collo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 68 | 2 | 🎯 Controllo e tira | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 69 | 0 | 🔄 Tacco in porta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | tacco:n |
| 69 | 1 | 🔙 Retropassaggio all'accorrente | pass/base | pass | fedele | passaggio:f |
| 69 | 2 | 🌀 Giratone e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 70 | 0 | 🦵 Cucchiaio rasoterra | shot/shot_chip | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cucchiaio:f |
| 70 | 1 | 💥 Tiro diretto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 70 | 2 | 🎯 Pallonetto morbido | shot/shot_chip | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cucchiaio:f |
| 71 | 0 | 🌀 Finta e interno | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 71 | 1 | 🦵 Esterno subito | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f |
| 71 | 2 | ↗️ Scarica per il compagno | pass/base | pass | approssimata |  |
| 72 | 0 | 💥 Potenza sul palo corto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 72 | 1 | 🎯 Piazzato sul palo lontano | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 72 | 2 | ↗️ Cross sul secondo palo | cross/cross_far_post | pass | fedele | cross:f |
| 73 | 0 | 🤸 Acrobazia istintiva in porta | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 73 | 1 | 🦵 Tiro di collo d'istinto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 73 | 2 | 🎯 Controllo e conclude | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 74 | 0 | ⚽ Prima intenzione — dentro! | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 74 | 1 | 🎯 Piazzata angolata | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 74 | 2 | 🦶 Spinta di sicurezza | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 75 | 0 | 🦵 Prima intenzione subito! | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 75 | 1 | 🎯 Tocco preciso per il gol | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 75 | 2 | 🌀 Dribbla il portiere e segna | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 76 | 0 | 🦵 Tiro di prima all'angolino | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 76 | 1 | 🔄 Tacco verso compagno | pass/heel | pass | NON DISEGNABILE | tacco:n |
| 76 | 2 | ✈️ Stacco sul primo palo | header/header_near_post | header | fedele | testa:f |
| 77 | 0 | 🦵 Deviazione rasoterra | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 77 | 1 | 💥 Prima intenzione potente | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 77 | 2 | 🤝 Sponda per il compagno | pass/base | pass | fedele | passaggio:f |
| 78 | 0 | 📐 Curva a rientrare | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f |
| 78 | 1 | 💥 Tiro piatto rasoterra | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 78 | 2 | ↗️ Palla sul secondo palo | freekick/freekick_cross_high | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 79 | 0 | ⚡ Scatto in profondità e ultimo passaggio | pass/base | pass | approssimata | passaggio:f, dribbling:a |
| 79 | 1 | 🎯 Posizionamento smarcato | build/base | dribble | approssimata | pressing:a |
| 79 | 2 | 🔄 Schema combinato rapido | pass/base | pass | approssimata |  |
| 80 | 0 | ✈️ Taglio sul secondo palo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 80 | 1 | 💥 Tiro di prima al volo | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | volee:f, tiro:f |
| 80 | 2 | 🤝 Sponda verso il centro dell'area | pass/base | pass | fedele | passaggio:f |
| 81 | 0 | 💥 Botta sopra la barriera | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 81 | 1 | ↗️ Tocco per il compagno | freekick/freekick_short | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 81 | 2 | 🎯 Tiro a girare sul palo | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 82 | 0 | 🎯 Cross a rientrare | cross/cross_cutback | pass | fedele | giro:f, cross:f |
| 82 | 1 | 💥 Tiro a giro verso il palo lontano | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 82 | 2 | 🌀 Dribbling e cross in area | cross/cross_near_post | pass | approssimata | cross:f, dribbling:a |
| 83 | 0 | ↗️ Cross immediato in area | cross/cross_near_post | pass | fedele | cross:f |
| 83 | 1 | ⚡ Scatto sul secondo palo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 83 | 2 | ↩️ Giocata corta con triangolo | pass/one_two | pass | fedele | passaggio:f |
| 84 | 0 | 🎯 Cross a rientrare perfetto | cross/cross_cutback | pass | fedele | giro:f, cross:f |
| 84 | 1 | 🦵 Tiro a giro forte sul portiere | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 84 | 2 | ↗️ Cross alto sul primo palo | cross/cross_near_post | pass | fedele | cross:f |
| 85 | 0 | ↘️ Rasoterra preciso al compagno | pass/pass_ground | pass | approssimata |  |
| 85 | 1 | 💥 Tiro diretto in porta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 85 | 2 | 🤸 Deviazione acrobatica col tacco | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | tacco:n, acrobatico:a |
| 86 | 0 | ✈️ Stacco sul secondo palo | header/header_far_post | header | fedele | testa:f |
| 86 | 1 | 🦵 Tiro di prima al volo | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | volee:f, tiro:f |
| 86 | 2 | 🤝 Sponda verso il centro | pass/base | pass | fedele | passaggio:f |
| 87 | 0 | ⚡ Cross cieco di prima | cross/cross_near_post | pass | fedele | cross:f |
| 87 | 1 | 🎯 Cross a rientrare guardato | cross/cross_cutback | pass | fedele | giro:f, cross:f |
| 87 | 2 | 🦵 Tiro senza pensarci | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 88 | 0 | ⚽ Volée di collo potente | shot/shot_volley | volley (+ mx-scissor-kick su «rovesciata/sforbiciata») | fedele | volee:f |
| 88 | 1 | ✈️ Colpo di testa al volo | header/header_near_post | header | fedele | volee:f, testa:f |
| 88 | 2 | 🎯 Controllo e tiro fermo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 89 | 0 | 🌀 Esterno a rientrare | pass/base | pass | fedele | giro:f |
| 89 | 1 | 💥 Tiro dall'angolo stretto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 89 | 2 | ↗️ Cross interno normale | cross/cross_near_post | pass | fedele | cross:f |
| 90 | 0 | ✈️ Testa di potenza | header/header_near_post | header | fedele | testa:f, tiro:f |
| 90 | 1 | 🎯 Testa piazzata all'angolo | header/header_near_post | header | fedele | testa:f |
| 90 | 2 | 🌀 Testa smorzata per il compagno | header/header_flick | header | fedele | testa:f |
| 91 | 0 | ↗️ Cross sul primo palo | cross/cross_near_post | pass | fedele | cross:f |
| 91 | 1 | 🦵 Tiro da posizione impossibile | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 91 | 2 | ↘️ Rasoterra rasente il palo | pass/pass_ground | pass | approssimata |  |
| 92 | 0 | 🔄 Roulette di classe | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | roulette:n |
| 92 | 1 | ⚡ Finta e scatto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 92 | 2 | ↩️ Appoggio sicuro al compagno | pass/base | pass | fedele | passaggio:f |
| 93 | 0 | 🌀 Elastico e tiro netto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | elastico:n, tiro:f |
| 93 | 1 | 💥 Tiro diretto senza finte | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 93 | 2 | ↗️ Cross dopo dribbling | cross/cross_near_post | pass | approssimata | cross:f, dribbling:a |
| 94 | 0 | 🦵 Step-over e scatto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | step_over:a, dribbling:a |
| 94 | 1 | 🌀 Step-over e cross | cross/cross_near_post | pass | approssimata | step_over:a, cross:f |
| 94 | 2 | 💥 Finta e tiro immediato | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 95 | 0 | 💨 Finta rapida e scatto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 95 | 1 | 🌀 Finta di corpo e cross | cross/cross_near_post | pass | approssimata | cross:f, dribbling:a |
| 95 | 2 | 🎯 Assist dopo la finta | pass/base | pass | approssimata | passaggio:f, dribbling:a |
| 96 | 0 | ↗️ Cross al centro da fondo | cross/cross_near_post | pass | fedele | cross:f |
| 96 | 1 | 🌀 Scarta il portiere da fondo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 96 | 2 | 🦵 Tiro da angolo impossibile | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 97 | 0 | 🌀 Scarta col dribbling | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 97 | 1 | 💥 Tiro diretto sul portiere | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 97 | 2 | ↗️ Assist al compagno libero | pass/base | pass | fedele | passaggio:f |
| 98 | 0 | 🌀 Tunnel e tiro netto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | tunnel:n, tiro:f |
| 98 | 1 | 🦵 Tiro diretto più sicuro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 98 | 2 | ↩️ Retropassaggio fuori area | pass/base | pass | fedele | passaggio:f |
| 99 | 0 | ⚡ Scatto esplosivo in profondità | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 99 | 1 | 🎯 Controllo e conclude | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 99 | 2 | ↗️ Cross al volo in corsa | cross/cross_near_post | pass | fedele | volee:f, cross:f |
| 100 | 0 | 🔄 Hocus pocus e cross | cross/cross_near_post | pass | NON DISEGNABILE | hocus_pocus:n, cross:f |
| 100 | 1 | ⚡ Finta e scatto sulla fascia | pass/base | pass | approssimata | dribbling:a |
| 100 | 2 | 💥 Tiro a giro sul portiere | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 101 | 0 | 🌀 Virata istantanea e scatto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 101 | 1 | 🎯 Giro e cross | cross/cross_near_post | pass | fedele | cross:f |
| 101 | 2 | 💥 Tiro dopo la virata | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 102 | 0 | 🌀 Dribbling netto e cross | cross/cross_near_post | pass | approssimata | cross:f, dribbling:a |
| 102 | 1 | ⚡ Scatto in velocità | pass/base | pass | approssimata | dribbling:a |
| 102 | 2 | ↗️ Cross immediato senza dribblare | cross/cross_near_post | pass | approssimata | cross:f, dribbling:a |
| 103 | 0 | 🤸 Controllo acrobatico e tira | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | acrobatico:a, tiro:f, controllo:a |
| 103 | 1 | ✈️ Testa al volo | header/header_near_post | header | fedele | volee:f, testa:f |
| 103 | 2 | 🦵 Tiro di prima | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 104 | 0 | 🌀 Dribbling stretto e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 104 | 1 | ⚡ Tiro rapido senza dribblare | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 104 | 2 | ↗️ Serve il compagno libero | pass/base | pass | approssimata |  |
| 105 | 0 | 🔄 Lancio lungo di prima | pass/pass_lofted | pass | fedele | passaggio:f |
| 105 | 1 | ⚡ Avanza e cambia lato | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 105 | 2 | 🎯 Passaggio corto e triangolo | pass/one_two | pass | fedele | passaggio:f |
| 106 | 0 | 🎯 Chip millimetrico | pass/base | pass | fedele | cucchiaio:f |
| 106 | 1 | ⚡ Lancio piatto in profondità | pass/pass_ground | pass | fedele | passaggio:f |
| 106 | 2 | 🌀 Avanza e crea spazio | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 107 | 0 | 🕳️ Filtrante tra i centrali | pass/base | pass | fedele | passaggio:f |
| 107 | 1 | 💥 Tiro dal limite invece | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 107 | 2 | ⚡ Avanza tu stesso | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 108 | 0 | ✈️ Spizzata di testa | header/header_flick | header | fedele | testa:f |
| 108 | 1 | 🎯 Colpo di testa mirato | header/header_flick | header | fedele | testa:f |
| 108 | 2 | 🔙 Retropassaggio per riorganizzare | pass/base | pass | fedele | passaggio:f |
| 109 | 0 | 🎯 Stop e tiro preciso | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 109 | 1 | 💥 Prima intenzione senza stop | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | controllo:a |
| 109 | 2 | ↩️ Controlla e serve | pass/base | pass | approssimata | controllo:a |
| 110 | 0 | 🏃 Faccio il velo e attacco | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | velo:n |
| 110 | 1 | ↩️ Ricevo dopo il velo | pass/base | pass | NON DISEGNABILE | velo:n |
| 110 | 2 | ⚡ Scatto oltre il velo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | velo:n, dribbling:a |
| 111 | 0 | ⚡ Rasoterra preciso per il compagno | pass/pass_ground | pass | approssimata |  |
| 111 | 1 | 🦵 Tiro di prima invece | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 111 | 2 | 🤸 Tacco verso il compagno libero | pass/heel | pass | NON DISEGNABILE | tacco:n |
| 112 | 0 | 🌀 Dribbling centrale e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 112 | 1 | ⚡ Spunto esplosivo verso porta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 112 | 2 | ↩️ Dai e vai in verticale | pass/one_two | pass | fedele | passaggio:f |
| 113 | 0 | 🎯 Assist di prima senza guardare | pass/base | pass | fedele | passaggio:f |
| 113 | 1 | 💥 Tiro a sorpresa senza assist | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f, passaggio:f |
| 113 | 2 | 🌀 Finta e serve dopo la finta | pass/base | pass | approssimata | dribbling:a |
| 114 | 0 | ↩️ Rimorchio e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 114 | 1 | 🎯 Rimorchio e serve il compagno | pass/base | pass | approssimata |  |
| 114 | 2 | ⚡ Rimorchio e scatto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 115 | 0 | 🌀 Tiro a giro sul secondo palo | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 115 | 1 | 🦵 Tiro interno piede classico | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 115 | 2 | ↩️ Tacco per il compagno libero | pass/heel | pass | NON DISEGNABILE | tacco:n |
| 116 | 0 | 💡 Finta e scarta il difensore | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 116 | 1 | ⚡ Taglio improvviso diagonale | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 116 | 2 | 🎯 Schema concordato coi compagni | pass/base | pass | approssimata |  |
| 117 | 0 | 🎯 Taglio diagonale e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 117 | 1 | 🌀 Dribbling dopo il taglio | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 117 | 2 | ↩️ Appoggio per il compagno | pass/base | pass | fedele | passaggio:f |
| 118 | 0 | ⚡ Uno-due e smista subito | pass/one_two | pass | fedele | passaggio:f |
| 118 | 1 | 🔄 Cambia lato rapidamente | pass/base | pass | approssimata |  |
| 118 | 2 | 🏃 Avanza col pallone e conserva | build/base | dribble | approssimata | dribbling:a, temporeggia:a |
| 119 | 0 | 📏 Lancio lungo 50m di prima | pass/pass_lofted | pass | fedele | passaggio:f |
| 119 | 1 | 🔄 Cambio campo 30m | pass/base | pass | approssimata |  |
| 119 | 2 | ↩️ Mantieni il possesso sicuro | pass/base | pass | approssimata |  |
| 120 | 0 | 🎯 Verticale filtrante di prima | pass/base | pass | fedele | passaggio:f |
| 120 | 1 | ⚡ Avanza in profondità e servi | pass/base | pass | approssimata | dribbling:a |
| 120 | 2 | 🌀 Dribbling e conduci | dribble/dribble_feint | change-direction | approssimata | dribbling:a |
| 121 | 0 | 🔥 Triangolo e vai | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | passaggio:f |
| 121 | 1 | ↩️ Dai e vai subito | pass/one_two | pass | fedele | passaggio:f |
| 121 | 2 | ⚡ Scatto in verticale | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 122 | 0 | 🌀 Parabola d'esterno 40m | pass/pass_lofted | pass | fedele | giro:f |
| 122 | 1 | 📏 Lancio lungo di collo | pass/pass_lofted | pass | fedele | passaggio:f |
| 122 | 2 | ↩️ Passaggio sicuro corto | pass/pass_ground | pass | fedele | passaggio:f |
| 123 | 0 | 🌀 Giratone e conduci | build/base | dribble | approssimata | dribbling:a |
| 123 | 1 | ↩️ Dai e ricevi subito | pass/base | pass | approssimata |  |
| 123 | 2 | 💥 Sventagliata improvvisa dopo il giratone | pass/base | pass | fedele | passaggio:f |
| 124 | 0 | ✈️ Colpo di testa e smista | header/header_flick | header | fedele | testa:f |
| 124 | 1 | 🛑 Stop di petto e conserva | build/base | dribble | NON DISEGNABILE | petto:n, controllo:a, temporeggia:a |
| 124 | 2 | ⚡ Controlla al volo e lancia | pass/pass_lofted | pass | approssimata | volee:f, controllo:a |
| 125 | 0 | ⚡ Lancio in profondità immediato | pass/pass_lofted | pass | fedele | passaggio:f |
| 125 | 1 | 🏃 Avanza col pallone di corsa | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 125 | 2 | 🔄 Smista sul lato libero | pass/base | pass | approssimata |  |
| 126 | 0 | ✈️ Stacco e indirizza il compagno | header/header_flick | header | fedele | testa:f |
| 126 | 1 | 💪 Stacco difensivo deciso | header/header_near_post | header | fedele | testa:f |
| 126 | 2 | 🤝 Sponda per il compagno | pass/base | pass | fedele | passaggio:f |
| 127 | 0 | 💪 Contrasto duro sull'avversario | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 127 | 1 | ✋ Intercetta la traiettoria | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 127 | 2 | 🏃 Sprint di copertura | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 128 | 0 | 🛑 Chiusura immediata | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 128 | 1 | 💪 Contrasto fisico deciso | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 128 | 2 | 📣 Posizionamento strategico | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 129 | 0 | 🤼 Raddoppio coordinato col compagno | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a, pressing:a |
| 129 | 1 | 🏃 Sprint di copertura urgente | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 129 | 2 | 📣 Chiamo il compagno a raddoppiare | tackle/base · def call | slide-tackle/tackle | NON DISEGNABILE | pressing:a, comando:n, comando:n |
| 130 | 0 | ✋ Anticipo sulla traiettoria | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 130 | 1 | ⚡ Sprint anticipato | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 130 | 2 | 💪 Contrasto di spalla | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 131 | 0 | 🛡️ Fallo intelligente in zona | tackle/base · def slide | slide-tackle/tackle | approssimata |  |
| 131 | 1 | ⚡ Recupero in velocità invece | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 131 | 2 | 💪 Contrasto pulito senza fallo | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 132 | 0 | 🧱 Blocco col corpo sulla traiettoria | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 132 | 1 | ✋ Devia col piede sul palo | tackle/base · def lunge | slide-tackle/tackle | approssimata |  |
| 132 | 2 | 😱 Tentativo disperato | tackle/base · def slide | slide-tackle/tackle | approssimata |  |
| 133 | 0 | 🏃 Sprint disperato sulla linea | tackle/base · def slide | slide-tackle/tackle | approssimata |  |
| 133 | 1 | ✋ Intercetto prima del fondo | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 133 | 2 | 📣 Chiamo il portiere | tackle/base · def call | slide-tackle/tackle | approssimata |  |
| 134 | 0 | ✈️ Stacco dominante | header/header_near_post · def aerial | header | fedele | testa:f |
| 134 | 1 | 💪 Contrasto fisico in volo | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 134 | 2 | 📣 Chiamo il portiere | tackle/base · def call | slide-tackle/tackle | approssimata |  |
| 135 | 0 | 🤝 Copro la sua posizione | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 135 | 1 | ⚡ Sprint per coprire lo spazio | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 135 | 2 | 📣 Comunico la situazione | tackle/base · def call | slide-tackle/tackle | NON DISEGNABILE | comando:n, comando:n |
| 136 | 0 | 🛑 Blocca il cross con il corpo | cross/cross_near_post · def lunge | pass | fedele | cross:f, contrasto:f |
| 136 | 1 | ✋ Devia in corner | tackle/base · def lunge | slide-tackle/tackle | approssimata |  |
| 136 | 2 | 📣 Chiama il portiere | tackle/base · def call | slide-tackle/tackle | approssimata |  |
| 137 | 0 | ⚡ Tackle in corsa preciso | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 137 | 1 | 🌀 Indirizza verso il fallo laterale | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 137 | 2 | 🏃 Sprint puro di rientro | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 138 | 0 | 📣 Allineamento difensivo immediato | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 138 | 1 | 💪 Contrasto fisico duro | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 138 | 2 | ⚡ Pressing immediato sul portatore | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a, pressing:a |
| 139 | 0 | 🏃 Pressing a zona coordinato | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a, pressing:a |
| 139 | 1 | ✋ Intercetta il passaggio | tackle/base · def lunge | slide-tackle/tackle | fedele | passaggio:f, contrasto:f |
| 139 | 2 | 💪 Contrasto duro sull'avversario | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a |
| 140 | 0 | 🔥 Porta palla nell'angolo | build/base | dribble | approssimata | dribbling:a |
| 140 | 1 | ↩️ Passaggio sicuro laterale | pass/base | pass | fedele | passaggio:f |
| 140 | 2 | 💥 Rilancio offensivo in profondità | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | passaggio:f |
| 141 | 0 | 💥 Tiro dalla distanza! | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 141 | 1 | ⚡ Sprint verso la porta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 141 | 2 | 🎯 Assist preciso | pass/base | pass | fedele | passaggio:f |
| 142 | 0 | 🌧️ Tiro rasoterra sul bagnato | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 142 | 1 | 💪 Usa il fisico — campo pesante | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 142 | 2 | 🎯 Passaggio corto e sicuro | pass/pass_ground | pass | fedele | passaggio:f |
| 143 | 0 | 🔥 Tiro potente — adrenalina pura | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 143 | 1 | 🌀 Dribbling tecnico da campione | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 143 | 2 | 🎯 Assist preciso — vinci il derby | pass/base | pass | fedele | passaggio:f |
| 144 | 0 | 💥 Gol dell'ex — silenzio assoluto | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 144 | 1 | 🎯 Assist gelido e decisivo | pass/base | pass | fedele | passaggio:f |
| 144 | 2 | ⚡ Scatto senza rimpianti | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 145 | 0 | 🌟 Gol dell'anno — ci provo! | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 145 | 1 | 🎯 Assist decisivo per la vittoria | pass/base | pass | fedele | passaggio:f |
| 145 | 2 | ⚡ Gioco sul sicuro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 146 | 0 | 🛡️ Blocca con tutto il fisico | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 146 | 1 | ⚡ Sprint disperato di copertura | tackle/base · def slide | slide-tackle/tackle | approssimata |  |
| 146 | 2 | 🧠 Intelligenza tattica — posizionati | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 147 | 0 | 🎯 Sfrutta lo spazio in più | pass/base | pass | approssimata |  |
| 147 | 1 | ⚡ Scatto senza pressione | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a, pressing:a |
| 147 | 2 | 💥 Tiro con fiducia | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 148 | 0 | 🏃 Scatto in profondità e cross basso | cross/cross_far_post | pass | approssimata | cross:f, dribbling:a |
| 148 | 1 | 🎯 Triangolo col portiere | pass/one_two | pass | fedele | passaggio:f |
| 148 | 2 | 🧠 Costruisci con qualità | pass/base | pass | approssimata |  |
| 149 | 0 | ⚡ Ricevi e scatta in profondità | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 149 | 1 | ↗️ Chiama il lancio in area | pass/pass_lofted | pass | fedele | passaggio:f |
| 149 | 2 | 🎯 Triangola dalla rimessa | pass/one_two | pass | fedele | passaggio:f, rimessa:f |
| 150 | 0 | 🌀 Dribbling provocatorio — il fallo c'è! | pass/base | pass | approssimata | dribbling:a, fallo_cercato:f |
| 150 | 1 | ⚡ Scatto improvviso provocatorio | pass/base | pass | approssimata | dribbling:a, fallo_cercato:f |
| 150 | 2 | 💥 Tiro potente invece | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 151 | 0 | ⚡ Arriva di sprint sulla ribattuta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 151 | 1 | 🦵 Tiro di prima sul rimbalzo | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 151 | 2 | 🤝 Servi il compagno libero | pass/base | pass | approssimata |  |
| 152 | 0 | 📋 Schema a tre — dai, ricevi, tira | pass/base | pass | fedele | tiro:f |
| 152 | 1 | ⚡ Primo triangolo e scatta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | passaggio:f, dribbling:a |
| 152 | 2 | 🎯 Terzo uomo smarcato | pass/base | pass | approssimata | pressing:a |
| 153 | 0 | 💥 Bordata potente | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 153 | 1 | 🎯 Tiro controllato | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 153 | 2 | ↗️ Serve in area per il compagno | pass/base | pass | approssimata |  |
| 154 | 0 | 🌀 Dribbling individuale feroce | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | dribbling:a |
| 154 | 1 | ⚡ Sprint verso la porta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 154 | 2 | 🎯 Serve un compagno smarcato | pass/base | pass | approssimata | pressing:a |
| 155 | 0 | 🧠 Anticipi la giocata avversaria | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 155 | 1 | ⚡ Sprint anticipato | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 155 | 2 | ↩️ Posizionamento preventivo | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 156 | 0 | 🎯 Lancio in profondità perfetto | pass/pass_lofted | pass | fedele | passaggio:f |
| 156 | 1 | ⚡ Avanza di corsa e lancia | pass/pass_lofted | pass | approssimata | dribbling:a |
| 156 | 2 | 💥 Missile a scavalcare la difesa | pass/pass_lofted | pass | approssimata |  |
| 157 | 0 | 🤸 Gettati sulla traiettoria | tackle/base · def lunge | slide-tackle/tackle | approssimata |  |
| 157 | 1 | ✋ Devia di piede sul palo | tackle/base · def lunge | slide-tackle/tackle | approssimata |  |
| 157 | 2 | 📣 Avvisa il portiere | tackle/base · def call | slide-tackle/tackle | approssimata |  |
| 158 | 0 | 🔙 Smarcati per ricevere | pass/base | pass | approssimata | controllo:a, pressing:a |
| 158 | 1 | ⚡ Scatto per dargli una soluzione | pass/base | pass | approssimata | dribbling:a |
| 158 | 2 | 💪 Offri il fisico per la palla lunga | pass/base | pass | approssimata |  |
| 159 | 0 | ⚽ Taglio preciso sul palo lontano | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 159 | 1 | ✈️ Testa in profondità | header/header_far_post | header | fedele | testa:f |
| 159 | 2 | ↩️ Serve il compagno al centro | pass/base | pass | approssimata |  |
| 160 | 0 | ⚡ Tiro immediato prima che esca | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 160 | 1 | 🌀 Scarta il portiere in uscita | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 160 | 2 | ↗️ Passa al compagno a porta vuota | pass/base | pass | approssimata |  |
| 161 | 0 | 📐 Punizione a rientrare | freekick/freekick_direct | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, punizione:f |
| 161 | 1 | ↗️ Cross sul secondo palo | freekick/freekick_cross_high | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cross:f |
| 161 | 2 | 🎯 Palla sul primo palo | freekick/freekick_cross_low | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 162 | 0 | 🎯 Esterno piede preciso | pass/base | pass | fedele | giro:f |
| 162 | 1 | 💥 Tiro d'esterno a sorpresa | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 162 | 2 | 🌀 Finta e interno piede | pass/base | pass | approssimata | dribbling:a |
| 163 | 0 | 💥 Collo pieno potente | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 163 | 1 | 🎯 Tiro controllato | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 163 | 2 | ↗️ Serve in area per il compagno | pass/base | pass | approssimata |  |
| 164 | 0 | 🌀 Rientra e tira col sinistro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 164 | 1 | 🎯 Cross teso verso il secondo palo | cross/cross_far_post | pass | fedele | cross:f |
| 164 | 2 | 💥 Tiro di collo pieno | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 165 | 0 | 🌀 Rientra e tira col destro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 165 | 1 | 🎯 Cross teso verso il secondo palo | cross/cross_far_post | pass | fedele | cross:f |
| 165 | 2 | 💥 Tiro di collo pieno | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 166 | 0 | 🌀 Slalom completato e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, dribbling:a |
| 166 | 1 | ⚡ Scatto tra le gambe | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | NON DISEGNABILE | tunnel:n, dribbling:a |
| 166 | 2 | 🎯 Assist per il compagno smarcato | pass/base | pass | approssimata | passaggio:f, pressing:a |
| 167 | 0 | 🦵 Controbalzo secco al volo | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | volee:f |
| 167 | 1 | 🎯 Controllo e tira | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | tiro:f, controllo:a |
| 167 | 2 | ↩️ Serve il compagno | pass/base | pass | approssimata |  |
| 168 | 0 | 🛡️ Tackle duro — rischio rosso | tackle/base · def slide | slide-tackle/tackle | fedele | contrasto:f |
| 168 | 1 | ⚡ Sprint laterale preventivo | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 168 | 2 | 📣 Guida i compagni e copri | tackle/base · def press | slide-tackle/tackle | NON DISEGNABILE | comando:n, pressing:a |
| 169 | 0 | 💥 Tiro da distanza sul palo lontano | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 169 | 1 | 🎯 Pallonetto morbido — gol dell'anno | shot/shot_chip | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cucchiaio:f |
| 169 | 2 | 🎯 Assist per il compagno in area | pass/base | pass | fedele | passaggio:f |
| 170 | 0 | 🔥 Tiro di rabbia — per i tifosi | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 170 | 1 | 💥 Potenza esplosiva dal limite | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 170 | 2 | 🌟 Assist da campione | pass/base | pass | fedele | passaggio:f |
| 171 | 0 | ✈️ Stacco in corsa potente | header/header_diving | header | fedele | testa:f |
| 171 | 1 | 🎯 Colpo di testa angolato | header/header_near_post | header | fedele | testa:f |
| 171 | 2 | 🦵 Lascia passare e tira di piede | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 172 | 0 | 🦵 Tiro sul palo più lontano | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 172 | 1 | 🎯 Piazzato nell'angolo basso | shot/shot_one_on_one | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 172 | 2 | ⚡ Tiro di prima — istinto | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 173 | 0 | 🎯 Cucchiaio a giro angolato | shot/shot_chip | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | cucchiaio:f, giro:f |
| 173 | 1 | 💥 Tiro di collo pieno invece | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 173 | 2 | ↗️ Cross sul secondo palo | cross/cross_far_post | pass | fedele | cross:f |
| 174 | 0 | 🎯 Verticalizzazione precisa | pass/base | pass | approssimata |  |
| 174 | 1 | ⚡ Avanza e servi in corsa | pass/base | pass | approssimata | dribbling:a |
| 174 | 2 | 🌀 Finta e supera il pressing | dribble/dribble_feint | change-direction | approssimata | dribbling:a, pressing:a |
| 175 | 0 | ⚡ Arriva in tempo sulla ribattuta | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 175 | 1 | 🦵 Tiro immediato sul rimbalzo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 175 | 2 | 🤝 Serve il compagno più vicino | pass/base | pass | approssimata |  |
| 176 | 0 | 🌀 Sterzata d'esterno verso il fondo | pass/base | pass | fedele | giro:f |
| 176 | 1 | ↗️ Cross al volo senza dribblare | cross/cross_near_post | pass | approssimata | volee:f, cross:f, dribbling:a |
| 176 | 2 | 💥 Tiro a giro dall'angolo stretto | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 177 | 0 | 🌀 Sterzata esterna e fuga verso il fondo | pass/base | pass | approssimata |  |
| 177 | 1 | ↗️ Cross immediato di prima | cross/cross_near_post | pass | fedele | cross:f |
| 177 | 2 | 🦵 Tiro verso il palo vicino | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 178 | 0 | ⚡ Sterzata d'esterno e brucia il terzino | pass/base | pass | fedele | giro:f |
| 178 | 1 | 🎯 Cross preciso al secondo palo | cross/cross_far_post | pass | fedele | cross:f |
| 178 | 2 | 🎯 Tiro a giro sul palo lontano | shot/shot_curled | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | giro:f, tiro:f |
| 179 | 0 | ↩️ Dai e vai in verticale | pass/one_two | pass | fedele | passaggio:f |
| 179 | 1 | ⚡ Scatta dopo lo scarico | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata | passaggio:f, dribbling:a |
| 179 | 2 | 🔺 Triangolo stretto e servi | pass/one_two | pass | fedele | passaggio:f |
| 180 | 0 | 🔺 Combinazione stretta e tiro | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | tiro:f |
| 180 | 1 | ↩️ Scarico e ricevi in area | pass/pass_ground | pass | fedele | passaggio:f |
| 180 | 2 | ⚡ Parete e inserimento centrale | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 181 | 0 | ↔️ Lancio diagonale a cambiare fronte | pass/pass_lofted | pass | fedele | passaggio:f |
| 181 | 1 | 🎯 Apri il gioco sull'esterno smarcato | pass/base | pass | approssimata | giro:f, pressing:a |
| 181 | 2 | ⚡ Guida e sposta il pallone di lato | pass/base | pass | approssimata |  |
| 182 | 0 | 🔄 Palla lunga a ribaltare l'azione | pass/base | pass | approssimata |  |
| 182 | 1 | 🎯 Cambio d'ala rasoterra | pass/pass_ground | pass | approssimata |  |
| 182 | 2 | ↗️ Apri largo per la sovrapposizione | pass/base | pass | approssimata |  |
| 183 | 0 | 🧠 Anticipa il pallone sulla punta | tackle/base · def lunge | slide-tackle/tackle | fedele | contrasto:f |
| 183 | 1 | ⚡ Esci in pressione sul portatore | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a, pressing:a |
| 183 | 2 | ↩️ Chiudi la linea e temporeggia | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, temporeggia:a, pressing:a |
| 184 | 0 | ✋ Intercetta il filtrante | tackle/base · def lunge | slide-tackle/tackle | fedele | passaggio:f, contrasto:f |
| 184 | 1 | ⚡ Scatta sulla linea di passaggio | tackle/base · def press | slide-tackle/tackle | approssimata | passaggio:f, dribbling:a, pressing:a |
| 184 | 2 | 🧠 Leggi e taglia il corridoio | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a |
| 185 | 0 | 🔁 Scarico e ricevi sul fondo | pass/pass_ground | pass | fedele | passaggio:f |
| 185 | 1 | ⚡ Parete e sfonda in fascia | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | approssimata |  |
| 185 | 2 | 🎯 Triangolo veloce e cross | cross/cross_near_post | pass | fedele | passaggio:f, cross:f |
| 186 | 0 | 👟 Appoggio di prima e inserimento | shot/shot_first_time | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | passaggio:f |
| 186 | 1 | ↩️ Sponda corta e ricevi in area | pass/base | pass | fedele | passaggio:f |
| 186 | 2 | ⚡ Uno-due e conclusione al volo | shot/shot_power | kick (+ tiro in corsa mx-strike-foward-jog per l'eroe) | fedele | volee:f, tiro:f, passaggio:f |
| 187 | 0 | 🎯 Palla filtrante a scavalcare | pass/pass_lofted | pass | fedele | passaggio:f |
| 187 | 1 | ↔️ Cambio di fronte teso | pass/base | pass | approssimata |  |
| 187 | 2 | ↗️ Guida e servi l'esterno | pass/base | pass | fedele | giro:f |
| 188 | 0 | 🔀 Sposta il pallone sul lato opposto | pass/base | pass | approssimata |  |
| 188 | 1 | 🎯 Diagonale rasoterra a cambiare | pass/pass_ground | pass | approssimata |  |
| 188 | 2 | ⚡ Conduci e allarga per la corsa | pass/base | pass | approssimata | dribbling:a |
| 189 | 0 | 🧠 Anticipa sul primo controllo | tackle/base · def lunge | slide-tackle/tackle | approssimata | controllo:a, contrasto:f |
| 189 | 1 | ⚡ Esci in pressione e ruba il tempo | tackle/base · def press | slide-tackle/tackle | approssimata | pressing:a, pressing:a |
| 189 | 2 | ↩️ Accorcia e chiudi lo specchio | tackle/base · def press | slide-tackle/tackle | approssimata | contrasto:f, pressing:a, pressing:a |
| 190 | 0 | ✋ Intercetta lo scarico centrale | tackle/base · def lunge | slide-tackle/tackle | fedele | passaggio:f, contrasto:f |
| 190 | 1 | 🧠 Leggi il triangolo e rompi il gioco | tackle/base · def press | slide-tackle/tackle | approssimata | passaggio:f, pressing:a |
| 190 | 2 | ⚡ Scatta sul portatore e recupera | tackle/base · def press | slide-tackle/tackle | approssimata | dribbling:a, contrasto:f, pressing:a |
