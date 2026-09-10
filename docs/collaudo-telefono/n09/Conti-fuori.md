# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 27% su 955 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 51% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 26% su 653 campioni · in volo 38% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 368 · fermo 62 · eroe 46 · portatore 9 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 8.9 / 26.5 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.9 / 22.4 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 54 in 1867 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 10 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 6 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 405 / 1817 ms | ≤ 500 ms |
| tagli di camera registrati | 10 | (informativo) |
| minuti per stato dello schermo | {"gioco":54,"palla-morta":10,"ripresa":18,"calcio-inizio":4,"fermo":1} | palla morta + fermo ≤ 15 |
| righe di cronaca | 87 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/3 · come le voleva il piano 1/3 | 0 |
| risultato | 4-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 13' | av 68.1 · avv. 7.7u · gk 29.3u | 💥 Scotti (GRA) non ci pensa due volte: bordata da fuori! → ok | 💥 Scotti (GRA) non ci pensa due volte: bordata da fuori! → ok |
| 42' | av 72.1 · avv. 3.3u · gk 29u | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → ok | 💥 Conclusione secca di Colombo (GRA) dal vertice dell'area! → ok |
| 70' | av 78.1 · avv. 2.4u · gk 33.7u | 💥 Pecoraro (GRA) prova a sorprendere il portiere da lontanissimo! → FALSA | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 64 · x 50.51 · ph playing · sc 0-0 · hud 0-0 |
| f02-min12-tiro.jpg | 12' | tiro | 💥 Scotti (GRA) non ci pensa due volte: bordata da fuori! | 1036 · x 58.34 · ph playing · sc 0-0 · hud 0-0 |
| f03-min13-portiere.jpg | 13' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 173 · x 80.96 · ph playing · sc 0-0 · hud 0-0 |
| f04-min14-fermo.jpg | 14' | fermo | 🚩 Calcio d'angolo per Colombo (GRA): palla sulla bandierina. | 1817 · x 90.95 · ph playing · sc 0-0 · hud 0-0 |
| f05-min15-scena-apre.jpg | 15' | scena-apre |  | 254 · x 86.73 · ph hl_intro · sc 0-0 · hud 0-0 |
| f06-min15-gioco.jpg | 15' | gioco |  | 871 · x 93.03 · ph hl_result · sc 0-0 · hud 0-0 |
| f07-min15-gol.jpg | 15' | gol | ⚽ Conti segna! 1-0. | 816 · x 99.15 · ph hl_result · sc 0-0 · hud 1-0 |
| f08-min15-gol+0.5s.jpg | 15' | gol+0.5s | ⚽ Conti segna! 1-0. | 48 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f09-min15-gol+1s.jpg | 15' | gol+1s | ⚽ Conti segna! 1-0. | 716 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f10-min15-scena-esito.jpg | 15' | scena-esito |  | 116 · x 99.15 · ph playing · sc 0-0 · hud 1-0 |
| f11-min17-gioco.jpg | 17' | gioco |  | 757 · x 89.33 · ph playing · sc 1-0 · hud 1-0 |
| f12-min17-tiro.jpg | 17' | tiro | 💥 Traversone dalla bandierina: mischia in area! | 95 · x 89.9 · ph playing · sc 1-0 · hud 1-0 |
| f13-min18-occasione-apre.jpg | 18' | occasione-apre |  | 62 · x 49.57 · ph playing · sc 1-0 · hud 1-0 |
| f14-min22-tiro.jpg | 22' | tiro | 💥 Incornata di Ferrari (GRA) a botta sicura! | 1090 · x 80.68 · ph playing · sc 1-0 · hud 1-0 |
| f15-min25-gol.jpg | 25' | gol | ⚽ Ferrari (GRA) segna! Raddoppio: due gol di margine! | 1242 · x 96.89 · ph playing · sc 2-0 · hud 2-0 |
| f16-min25-gol+0.5s.jpg | 25' | gol+0.5s | ⚽ Ferrari (GRA) segna! Raddoppio: due gol di margine! | 405 · x 100.6 · ph playing · sc 2-0 · hud 2-0 |
| f17-min25-gol+1s.jpg | 25' | gol+1s | ⚽ Ferrari (GRA) segna! Raddoppio: due gol di margine! | 1097 · x 100.6 · ph playing · sc 2-0 · hud 2-0 |
| f18-min28-gioco.jpg | 28' | gioco |  | 914 · x 83.57 · ph playing · sc 2-0 · hud 2-0 |
| f19-min34-scena-apre.jpg | 34' | scena-apre |  | 90 · x 27.9 · ph hl_intro · sc 2-0 · hud 2-0 |
| f20-min34-gioco.jpg | 34' | gioco |  | 151 · x 45.11 · ph hl_result · sc 2-0 · hud 2-0 |
| f21-min34-scena-esito.jpg | 34' | scena-esito |  | 849 · x 45.18 · ph playing · sc 2-0 · hud 2-0 |
| f22-min37-occasione-apre.jpg | 37' | occasione-apre |  | 134 · x 55.63 · ph playing · sc 2-0 · hud 2-0 |
| f23-min41-tiro.jpg | 41' | tiro | 💥 Conclusione secca di Colombo (GRA) dal vertice dell'area! | 781 · x 70.06 · ph playing · sc 2-0 · hud 2-0 |
| f24-min42-portiere.jpg | 42' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 100 · x 83.51 · ph playing · sc 2-0 · hud 2-0 |
| f25-min43-fermo.jpg | 43' | fermo | 🚩 Calcio d'angolo per Scotti (GRA): palla sulla bandierina. | 625 · x 84.99 · ph playing · sc 2-0 · hud 2-0 |
| f26-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 39 · x 96.27 · ph playing · sc 2-0 · hud 2-0 |
| f27-min45-gioco.jpg | 45' | gioco |  | 1087 · x 97.25 · ph playing · sc 2-0 · hud 2-0 |
| f28-min50-occasione-apre.jpg | 50' | occasione-apre |  | 94 · x 52.02 · ph playing · sc 2-0 · hud 2-0 |
| f29-min52-tiro.jpg | 52' | tiro | 💥 Scotti (GRA) calcia di prima, senza controllare! | 622 · x 87.65 · ph playing · sc 2-0 · hud 2-0 |
| f30-min55-gol.jpg | 55' | gol | ⚽ Scotti (GRA) segna! Partita in mano: 3-0! | 309 · x 96.22 · ph playing · sc 3-0 · hud 3-0 |
| f31-min55-gol+0.5s.jpg | 55' | gol+0.5s | ⚽ Scotti (GRA) segna! Partita in mano: 3-0! | 834 · x 100.6 · ph playing · sc 3-0 · hud 3-0 |
| f32-min55-gol+1s.jpg | 55' | gol+1s | ⚽ Scotti (GRA) segna! Partita in mano: 3-0! | 210 · x 100.6 · ph playing · sc 3-0 · hud 3-0 |
| f33-min57-gioco.jpg | 57' | gioco |  | 8 · x 95.19 · ph playing · sc 3-0 · hud 3-0 |
| f34-min61-fermo.jpg | 61' | fermo | 🟡 Punizione dal vertice dell'area: Scotti (GRA) sistema il pallone, la barriera si compon | 636 · x 74.52 · ph playing · sc 3-0 · hud 3-0 |
| f35-min63-occasione-apre.jpg | 63' | occasione-apre |  | 92 · x 58.66 · ph playing · sc 3-0 · hud 3-0 |
| f36-min68-gioco.jpg | 68' | gioco |  | 256 · x 71.66 · ph playing · sc 3-0 · hud 3-0 |
| f37-min70-tiro.jpg | 70' | tiro | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! | 797 · x 74.55 · ph playing · sc 3-0 · hud 3-0 |
| f38-min73-tiro.jpg | 73' | tiro | 💥 Incornata di Bruno (GRA) a botta sicura! | 625 · x 82.73 · ph playing · sc 3-0 · hud 3-0 |
| f39-min76-gol.jpg | 76' | gol | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 169 · x 100.6 · ph playing · sc 4-0 · hud 4-0 |
| f40-min76-gol+0.5s.jpg | 76' | gol+0.5s | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 681 · x 100.6 · ph playing · sc 4-0 · hud 4-0 |
| f41-min76-gol+1s.jpg | 76' | gol+1s | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 1416 · x 100.6 · ph playing · sc 4-0 · hud 4-0 |
| f42-min80-gioco.jpg | 80' | gioco |  | 837 · x 81.15 · ph playing · sc 4-0 · hud 4-0 |
| f43-min85-fermo.jpg | 85' | fermo | 🟡 Fallo tattico su Luca (POL): la ripartenza muore li'. Punizione per Spada (POL). | 196 · x 64 · ph playing · sc 4-0 · hud 4-0 |
| f44-min87-fermo.jpg | 87' | fermo | 🟡 Fallo tattico su Luca (POL): la ripartenza muore li'. Punizione per Colombo (POL). | 87 · x 62.49 · ph playing · sc 4-0 · hud 4-0 |
