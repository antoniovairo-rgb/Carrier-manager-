# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 30% su 826 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 44% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 34% su 574 campioni · in volo 38% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 267 · eroe 54 · portatore 37 · fermo 23 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 7.5 / 20.9 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 1.1 / 20.3 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 52 in 1868 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 11 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 6 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 526 / 1616 ms | ≤ 500 ms |
| tagli di camera registrati | 7 | (informativo) |
| minuti per stato dello schermo | {"gioco":56,"palla-morta":8,"ripresa":15,"calcio-inizio":8} | palla morta + fermo ≤ 15 |
| righe di cronaca | 86 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/2 · come le voleva il piano 1/2 | 0 |
| risultato | 4-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 13' | av 68.9 · avv. 10.1u · gk 43.7u | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → FALSA | 💥 Colombo (GRA) prova a sorprendere il portiere da lontanissimo! → ok |
| 39' | av 61.7 · avv. 1.5u · gk 36.7u | 💥 Scotti (GRA) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Scotti (GRA) non ci pensa due volte: bordata da fuori! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 86 · x 56.32 · ph playing · sc 0-0 · hud 0-0 |
| f02-min12-tiro.jpg | 12' | tiro | 💥 Colombo (GRA) prova a sorprendere il portiere da lontanissimo! | 873 · x 68.04 · ph playing · sc 0-0 · hud 0-0 |
| f03-min13-portiere.jpg | 13' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 92 · x 84.44 · ph playing · sc 0-0 · hud 0-0 |
| f04-min14-fermo.jpg | 14' | fermo | 🚩 Calcio d'angolo per Conti (GRA): palla sulla bandierina. | 166 · x 92.18 · ph playing · sc 0-0 · hud 0-0 |
| f05-min15-scena-apre.jpg | 15' | scena-apre |  | 526 · x 84.63 · ph hl_intro · sc 0-0 · hud 0-0 |
| f06-min15-gioco.jpg | 15' | gioco |  | 1168 · x 90.02 · ph hl_result · sc 0-0 · hud 0-0 |
| f07-min15-tiro.jpg | 15' | tiro | 💥 Secondo tempo dell'azione: conclusione secca, gol! | 692 · x 99.15 · ph hl_result · sc 0-0 · hud 1-0 |
| f08-min15-gol.jpg | 15' | gol | ⚽ Conti segna! 1-0. | 845 · x 99.15 · ph hl_result · sc 0-0 · hud 1-0 |
| f09-min15-gol+0.5s.jpg | 15' | gol+0.5s | ⚽ Conti segna! 1-0. | 43 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f10-min15-gol+1s.jpg | 15' | gol+1s | ⚽ Conti segna! 1-0. | 787 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f11-min15-gioco.jpg | 15' | gioco |  | 768 · x 99.15 · ph hl_result · sc 0-0 · hud 1-0 |
| f12-min15-scena-esito.jpg | 15' | scena-esito |  | 146 · x 99.15 · ph playing · sc 0-0 · hud 1-0 |
| f13-min17-tiro.jpg | 17' | tiro | 💥 Traversone dalla bandierina: mischia in area! | 973 · x 92.21 · ph playing · sc 1-0 · hud 1-0 |
| f14-min18-occasione-apre.jpg | 18' | occasione-apre |  | 106 · x 77.3 · ph playing · sc 1-0 · hud 1-0 |
| f15-min22-tiro.jpg | 22' | tiro | 💥 Incornata di Ferrari (GRA) a botta sicura! | 545 · x 82.17 · ph playing · sc 1-0 · hud 1-0 |
| f16-min24-gol.jpg | 24' | gol | ⚽ Ferrari (GRA) segna! Raddoppio: due gol di margine! | 1616 · x 98.34 · ph playing · sc 1-0 · hud 2-0 |
| f17-min25-gol+0.5s.jpg | 25' | gol+0.5s | ⚽ Ferrari (GRA) segna! Raddoppio: due gol di margine! | 307 · x 100.6 · ph playing · sc 2-0 · hud 2-0 |
| f18-min25-gol+1s.jpg | 25' | gol+1s | ⚽ Ferrari (GRA) segna! Raddoppio: due gol di margine! | 976 · x 100.6 · ph playing · sc 2-0 · hud 2-0 |
| f19-min27-gioco.jpg | 27' | gioco |  | 762 · x 81.41 · ph playing · sc 2-0 · hud 2-0 |
| f20-min32-scena-apre.jpg | 32' | scena-apre |  | 168 · x 58.35 · ph hl_intro · sc 2-0 · hud 2-0 |
| f21-min32-gioco.jpg | 32' | gioco |  | 935 · x 98.22 · ph hl_result · sc 2-0 · hud 2-0 |
| f22-min32-scena-esito.jpg | 32' | scena-esito |  | 51 · x 98.42 · ph playing · sc 2-0 · hud 2-0 |
| f23-min34-occasione-apre.jpg | 34' | occasione-apre |  | 121 · x 74.46 · ph playing · sc 2-0 · hud 2-0 |
| f24-min38-tiro.jpg | 38' | tiro | 💥 Scotti (GRA) non ci pensa due volte: bordata da fuori! | 322 · x 61.74 · ph playing · sc 2-0 · hud 2-0 |
| f25-min39-portiere.jpg | 39' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 843 · x 80.74 · ph playing · sc 2-0 · hud 2-0 |
| f26-min41-portiere.jpg | 41' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 425 · x 89.92 · ph playing · sc 2-0 · hud 2-0 |
| f27-min43-gioco.jpg | 43' | gioco |  | 40 · x 87.98 · ph playing · sc 2-0 · hud 2-0 |
| f28-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 904 · x 87.8 · ph playing · sc 2-0 · hud 2-0 |
| f29-min49-occasione-apre.jpg | 49' | occasione-apre |  | 51 · x 58.72 · ph playing · sc 2-0 · hud 2-0 |
| f30-min51-tiro.jpg | 51' | tiro | 💥 Lombardi (GRA) calcia di prima, senza controllare! | 944 · x 72.37 · ph playing · sc 2-0 · hud 2-0 |
| f31-min54-gol.jpg | 54' | gol | ⚽ Lombardi (GRA) segna! Partita in mano: 3-0! | 1083 · x 97.48 · ph playing · sc 3-0 · hud 3-0 |
| f32-min54-gol+0.5s.jpg | 54' | gol+0.5s | ⚽ Lombardi (GRA) segna! Partita in mano: 3-0! | 397 · x 100.6 · ph playing · sc 3-0 · hud 3-0 |
| f33-min54-gol+1s.jpg | 54' | gol+1s | ⚽ Lombardi (GRA) segna! Partita in mano: 3-0! | 33 · x 86.44 · ph playing · sc 3-0 · hud 3-0 |
| f34-min55-gioco.jpg | 55' | gioco |  | 999 · x 76.26 · ph playing · sc 3-0 · hud 3-0 |
| f35-min64-fermo.jpg | 64' | fermo | 🟡 Fischia l'arbitro: fallo, punizione per De Santis (POL). | 262 · x 56.51 · ph playing · sc 3-0 · hud 3-0 |
| f36-min65-occasione-apre.jpg | 65' | occasione-apre |  | 28 · x 52.47 · ph playing · sc 3-0 · hud 3-0 |
| f37-min67-gioco.jpg | 67' | gioco |  | 1213 · x 59.15 · ph playing · sc 3-0 · hud 3-0 |
| f38-min73-tiro.jpg | 73' | tiro | 💥 Incornata di Bruno (GRA) a botta sicura! | 107 · x 81.24 · ph playing · sc 3-0 · hud 3-0 |
| f39-min76-gol.jpg | 76' | gol | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 1204 · x 98.49 · ph playing · sc 4-0 · hud 4-0 |
| f40-min76-gol+0.5s.jpg | 76' | gol+0.5s | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 387 · x 100.6 · ph playing · sc 4-0 · hud 4-0 |
| f41-min76-gol+1s.jpg | 76' | gol+1s | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 1122 · x 100.6 · ph playing · sc 4-0 · hud 4-0 |
| f42-min78-gioco.jpg | 78' | gioco |  | 649 · x 87.09 · ph playing · sc 4-0 · hud 4-0 |
| f43-min87-fermo.jpg | 87' | fermo | 🟡 Fischia l'arbitro: fallo, punizione per Spada (POL). | 398 · x 65.47 · ph playing · sc 4-0 · hud 4-0 |
