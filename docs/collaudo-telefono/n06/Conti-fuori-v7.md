# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 24% su 584 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 31% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 35% su 393 campioni · in volo 39% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 206 · fermo 34 · eroe 15 · portatore 2 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 11.3 / 25.4 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.5 / 16.8 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 50 in 1887 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 14 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 7 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 408 / 1072 ms | ≤ 500 ms |
| tagli di camera registrati | 21 | (informativo) |
| minuti per stato dello schermo | {"gioco":56,"palla-morta":8,"fermo":1,"ripresa":15,"calcio-inizio":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 99 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/1 · come le voleva il piano 1/1 | 0 |
| risultato | 5-2 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 12' | av 82.9 · avv. 3.5u · gk 22.5u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min07-occasione-apre.jpg | 7' | occasione-apre |  | 35 · x 59.98 · ph playing · sc 0-0 · hud 0-0 |
| f02-min11-tiro.jpg | 11' | tiro | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! | 856 · x 84.14 · ph playing · sc 0-0 · hud 0-0 |
| f03-min12-portiere.jpg | 12' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 278 · x 89.21 · ph playing · sc 0-0 · hud 0-0 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 1045 · x 90.53 · ph playing · sc 0-0 · hud 0-0 |
| f05-min14-scena-apre.jpg | 14' | scena-apre |  | 408 · x 93.65 · ph hl_intro · sc 0-0 · hud 0-0 |
| f06-min14-gioco.jpg | 14' | gioco |  | 1027 · x 74.62 · ph hl_result · sc 0-0 · hud 0-0 |
| f07-min14-scena-esito.jpg | 14' | scena-esito |  | 136 · x 67.05 · ph playing · sc 0-0 · hud 0-0 |
| f08-min18-fermo.jpg | 18' | fermo | 🟡 Punizione da posizione defilata: Bruno (GRA) mette in mezzo, la difesa di Bianchi (POL) | 44 · x 66.37 · ph playing · sc 0-0 · hud 0-0 |
| f09-min18-occasione-apre.jpg | 18' | occasione-apre |  | 62 · x 74 · ph playing · sc 0-0 · hud 0-0 |
| f10-min21-tiro.jpg | 21' | tiro | 💥 Incornata di Ferrari (GRA) a botta sicura! | 139 · x 81.06 · ph playing · sc 0-0 · hud 0-0 |
| f11-min23-gioco.jpg | 23' | gioco |  | 323 · x 98.25 · ph playing · sc 0-0 · hud 0-0 |
| f12-min23-gol.jpg | 23' | gol | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 442 · x 97.17 · ph playing · sc 0-0 · hud 1-0 |
| f13-min24-gol+0.5s.jpg | 24' | gol+0.5s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 962 · x 100.6 · ph playing · sc 1-0 · hud 1-0 |
| f14-min24-gol+1s.jpg | 24' | gol+1s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 615 · x 92.37 · ph playing · sc 1-0 · hud 1-0 |
| f15-min24-scena-apre.jpg | 24' | scena-apre |  | 840 · x 92.37 · ph hl_intro · sc 1-0 · hud 1-0 |
| f16-min24-scena-esito.jpg | 24' | scena-esito |  | 46 · x 72.8 · ph playing · sc 1-0 · hud 1-0 |
| f17-min28-gioco.jpg | 28' | gioco |  | 109 · x 58.29 · ph playing · sc 1-0 · hud 1-0 |
| f18-min30-occasione-apre.jpg | 30' | occasione-apre |  | 248 · x 15.77 · ph playing · sc 1-0 · hud 1-0 |
| f19-min33-tiro.jpg | 33' | tiro | 💥 Santis (POL) calcia di prima, senza controllare! | 1021 · x 29.67 · ph playing · sc 1-0 · hud 1-0 |
| f20-min39-gol.jpg | 39' | gol | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 746 · x 17.34 · ph playing · sc 1-1 · hud 1-1 |
| f21-min39-gioco.jpg | 39' | gioco |  | 895 · x 17.34 · ph playing · sc 1-1 · hud 1-1 |
| f22-min40-gol+0.5s.jpg | 40' | gol+0.5s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 223 · x 27.54 · ph playing · sc 1-1 · hud 1-1 |
| f23-min40-gol+1s.jpg | 40' | gol+1s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 957 · x 37.73 · ph playing · sc 1-1 · hud 1-1 |
| f24-min42-occasione-apre.jpg | 42' | occasione-apre |  | 50 · x 50 · ph playing · sc 1-1 · hud 1-1 |
| f25-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 338 · x 34.88 · ph playing · sc 1-1 · hud 1-1 |
| f26-min46-tiro.jpg | 46' | tiro | 💥 Incornata di Colombo (POL) a botta sicura! | 580 · x 17.45 · ph playing · sc 1-1 · hud 1-1 |
| f27-min51-gioco.jpg | 51' | gioco |  | 116 · x 7.9 · ph playing · sc 1-2 · hud 1-2 |
| f28-min55-occasione-apre.jpg | 55' | occasione-apre |  | 592 · x 15.73 · ph playing · sc 1-2 · hud 1-2 |
| f29-min58-tiro.jpg | 58' | tiro | 💥 Incornata di Spada (GRA) a botta sicura! | 258 · x 80.48 · ph playing · sc 1-2 · hud 1-2 |
| f30-min61-gol.jpg | 61' | gol | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 678 · x 100.6 · ph playing · sc 2-2 · hud 2-2 |
| f31-min61-gol+0.5s.jpg | 61' | gol+0.5s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 125 · x 100.6 · ph playing · sc 2-2 · hud 2-2 |
| f32-min61-gol+1s.jpg | 61' | gol+1s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 852 · x 100.6 · ph playing · sc 2-2 · hud 2-2 |
| f33-min61-scena-apre.jpg | 61' | scena-apre |  | 1072 · x 100.6 · ph hl_intro · sc 2-2 · hud 2-2 |
| f34-min61-gioco.jpg | 61' | gioco |  | 493 · x 91.14 · ph hl_result · sc 2-2 · hud 2-2 |
| f35-min61-gol.jpg | 61' | gol | ⚽ Conti segna su assist di Pecoraro! 3-2. | 752 · x 99.15 · ph hl_result · sc 2-2 · hud 3-2 |
| f36-min61-gol+0.5s.jpg | 61' | gol+0.5s | ⚽ Conti segna su assist di Pecoraro! 3-2. | 49 · x 100.6 · ph hl_result · sc 2-2 · hud 3-2 |
| f37-min61-gol+1s.jpg | 61' | gol+1s | ⚽ Conti segna su assist di Pecoraro! 3-2. | 782 · x 100.6 · ph hl_result · sc 2-2 · hud 3-2 |
| f38-min61-scena-esito.jpg | 61' | scena-esito |  | 170 · x 99.15 · ph playing · sc 2-2 · hud 3-2 |
| f39-min67-occasione-apre.jpg | 67' | occasione-apre |  | 14 · x 46.07 · ph playing · sc 3-2 · hud 3-2 |
| f40-min69-gioco.jpg | 69' | gioco |  | 21 · x 44.4 · ph playing · sc 3-2 · hud 3-2 |
| f41-min73-tiro.jpg | 73' | tiro | 💥 Incornata di Bruno (GRA) a botta sicura! | 741 · x 80.73 · ph playing · sc 3-2 · hud 3-2 |
| f42-min76-gol.jpg | 76' | gol | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 302 · x 98.34 · ph playing · sc 4-2 · hud 4-2 |
| f43-min76-gol+0.5s.jpg | 76' | gol+0.5s | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 813 · x 100.6 · ph playing · sc 4-2 · hud 4-2 |
| f44-min76-gol+1s.jpg | 76' | gol+1s | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 487 · x 87.31 · ph playing · sc 4-2 · hud 4-2 |
| f45-min76-scena-apre.jpg | 76' | scena-apre |  | 647 · x 87.31 · ph hl_intro · sc 4-2 · hud 4-2 |
| f46-min76-gioco.jpg | 76' | gioco |  | 492 · x 92.71 · ph hl_result · sc 4-2 · hud 4-2 |
| f47-min76-scena-esito.jpg | 76' | scena-esito |  | 605 · x 89.02 · ph playing · sc 4-2 · hud 4-2 |
| f48-min85-scena-apre.jpg | 85' | scena-apre |  | 153 · x 71.78 · ph hl_intro · sc 4-2 · hud 4-2 |
| f49-min85-gioco.jpg | 85' | gioco |  | 387 · x 71.78 · ph hl_intro · sc 4-2 · hud 4-2 |
| f50-min85-tiro.jpg | 85' | tiro | 💥 GOOOOOL! Folla in delirio! | 41 · x 99.15 · ph hl_result · sc 4-2 · hud 5-2 |
| f51-min85-gol.jpg | 85' | gol | ⚽ Conti segna su assist di Ferrari! 5-2. | 188 · x 99.15 · ph hl_result · sc 4-2 · hud 5-2 |
| f52-min85-gol+0.5s.jpg | 85' | gol+0.5s | ⚽ Conti segna su assist di Ferrari! 5-2. | 704 · x 100.6 · ph hl_result · sc 4-2 · hud 5-2 |
| f53-min85-gol+1s.jpg | 85' | gol+1s | ⚽ Conti segna su assist di Ferrari! 5-2. | 226 · x 100.6 · ph hl_result · sc 4-2 · hud 5-2 |
| f54-min85-scena-esito.jpg | 85' | scena-esito |  | 692 · x 99.15 · ph playing · sc 4-2 · hud 5-2 |
