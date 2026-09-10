# Collaudo da telefono — Vairo casa · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 36% su 892 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 48% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 41% su 718 campioni · in volo 35% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 369 · fermo 31 · portatore 26 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 6 / 28.2 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 1 / 14.6 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 46 in 1859 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 12 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 11 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 191 / 1394 ms | ≤ 500 ms |
| tagli di camera registrati | 25 | (informativo) |
| minuti per stato dello schermo | {"gioco":66,"palla-morta":16,"ripresa":3,"calcio-inizio":2} | palla morta + fermo ≤ 15 |
| righe di cronaca | 80 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/4 · come le voleva il piano 3/4 | 0 |
| risultato | 1-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 13' | av 77.6 · avv. 18.3u · gk 34.9u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok |
| 27' | av 56 · avv. 12.6u · gk 44.7u | 💥 Spada (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Spada (POL) non ci pensa due volte: bordata da fuori! → ok |
| 38' | av 84.1 · avv. 3.5u · gk 18.6u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Pecoraro (GRA) calcia di prima in area, fra le maglie della difesa! → ok |
| 58' | av 82.8 · avv. 6u · gk 16.6u | 💥 Colombo (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 158 · x 68.54 · ph playing · sc 0-0 · hud 0-0 |
| f02-min12-tiro.jpg | 12' | tiro | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! | 98 · x 80.9 · ph playing · sc 0-0 · hud 0-0 |
| f03-min13-portiere.jpg | 13' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 68 · x 88.79 · ph playing · sc 0-0 · hud 0-0 |
| f04-min15-portiere.jpg | 15' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 551 · x 93.4 · ph playing · sc 0-0 · hud 0-0 |
| f05-min18-gioco.jpg | 18' | gioco |  | 387 · x 68.74 · ph playing · sc 0-0 · hud 0-0 |
| f06-min20-occasione-apre.jpg | 20' | occasione-apre |  | 161 · x 46.14 · ph playing · sc 0-0 · hud 0-0 |
| f07-min26-tiro.jpg | 26' | tiro | 💥 Spada (POL) non ci pensa due volte: bordata da fuori! | 774 · x 47.92 · ph playing · sc 0-0 · hud 0-0 |
| f08-min27-portiere.jpg | 27' | portiere | 🧤 Fontana (GRA) ci arriva in tuffo e la devia in angolo: che parata! | 1281 · x 20.84 · ph playing · sc 0-0 · hud 0-0 |
| f09-min28-fermo.jpg | 28' | fermo | 🚩 Calcio d'angolo per Vallone (POL): palla sulla bandierina. | 30 · x 6.78 · ph playing · sc 0-0 · hud 0-0 |
| f10-min30-gioco.jpg | 30' | gioco |  | 792 · x 16.81 · ph playing · sc 0-0 · hud 0-0 |
| f11-min32-scena-apre.jpg | 32' | scena-apre |  | 10 · x 30.53 · ph hl_intro · sc 0-0 · hud 0-0 |
| f12-min32-fermo.jpg | 32' | fermo | 🚩 Respinta in corner — si riparte dalla bandierina. | 1155 · x 36.12 · ph hl_result · sc 0-0 · hud 0-0 |
| f13-min32-gioco.jpg | 32' | gioco |  | 348 · x 98.4 · ph hl_result · sc 0-0 · hud 0-0 |
| f14-min32-gol.jpg | 32' | gol | ⚽ Vairo segna su assist di Neri! 1-0. | 174 · x 99.15 · ph hl_result · sc 0-0 · hud 1-0 |
| f15-min32-gol+0.5s.jpg | 32' | gol+0.5s | ⚽ Vairo segna su assist di Neri! 1-0. | 721 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f16-min32-gol+1s.jpg | 32' | gol+1s | ⚽ Vairo segna su assist di Neri! 1-0. | 191 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f17-min32-scena-esito.jpg | 32' | scena-esito |  | 678 · x 99.15 · ph playing · sc 0-0 · hud 1-0 |
| f18-min33-occasione-apre.jpg | 33' | occasione-apre |  | 1125 · x 78.8 · ph playing · sc 1-0 · hud 1-0 |
| f19-min37-tiro.jpg | 37' | tiro | 💥 Pecoraro (GRA) calcia di prima in area, fra le maglie della difesa! | 58 · x 84.15 · ph playing · sc 1-0 · hud 1-0 |
| f20-min38-portiere.jpg | 38' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 519 · x 89.12 · ph playing · sc 1-0 · hud 1-0 |
| f21-min39-gioco.jpg | 39' | gioco |  | 905 · x 93.06 · ph playing · sc 1-0 · hud 1-0 |
| f22-min39-fermo.jpg | 39' | fermo | 🚩 Calcio d'angolo per Colombo (GRA): palla sulla bandierina. | 988 · x 93.06 · ph playing · sc 1-0 · hud 1-0 |
| f23-min40-scena-apre.jpg | 40' | scena-apre |  | 1394 · x 95.37 · ph hl_intro · sc 1-0 · hud 1-0 |
| f24-min40-scena-esito.jpg | 40' | scena-esito |  | 64 · x 89.02 · ph playing · sc 1-0 · hud 1-0 |
| f25-min44-gioco.jpg | 44' | gioco |  | 183 · x 69.48 · ph playing · sc 1-0 · hud 1-0 |
| f26-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 114 · x 67.04 · ph playing · sc 1-0 · hud 1-0 |
| f27-min53-occasione-apre.jpg | 53' | occasione-apre |  | 164 · x 55.66 · ph playing · sc 1-0 · hud 1-0 |
| f28-min56-gioco.jpg | 56' | gioco |  | 137 · x 75.76 · ph playing · sc 1-0 · hud 1-0 |
| f29-min57-tiro.jpg | 57' | tiro | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! | 481 · x 83.62 · ph playing · sc 1-0 · hud 1-0 |
| f30-min58-portiere.jpg | 58' | portiere | 🧤 Toti (POL) respinge coi pugni, poi la difesa spazza in angolo. | 992 · x 89.34 · ph playing · sc 1-0 · hud 1-0 |
| f31-min59-fermo.jpg | 59' | fermo | 🚩 Calcio d'angolo per Ferrari (GRA): palla sulla bandierina. | 385 · x 92.98 · ph playing · sc 1-0 · hud 1-0 |
| f32-min68-gioco.jpg | 68' | gioco |  | 151 · x 71.31 · ph playing · sc 1-0 · hud 1-0 |
| f33-min79-gioco.jpg | 79' | gioco |  | 51 · x 53.36 · ph playing · sc 1-0 · hud 1-0 |
| f34-min86-fermo.jpg | 86' | fermo | 🟡 Fallo tattico su Leone (POL): la ripartenza muore li'. Punizione per Bianchi (POL). | 52 · x 80.91 · ph playing · sc 1-0 · hud 1-0 |
