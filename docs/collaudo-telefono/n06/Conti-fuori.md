# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 27% su 620 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 33% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 34% su 439 campioni · in volo 36% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 234 · fermo 41 · portatore 15 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 7 / 24.6 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.5 / 16.7 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 51 in 1891 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 15 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 7 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 346 / 903 ms | ≤ 500 ms |
| tagli di camera registrati | 31 | (informativo) |
| minuti per stato dello schermo | {"gioco":56,"palla-morta":8,"fermo":1,"ripresa":15,"calcio-inizio":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 99 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/1 · come le voleva il piano 1/1 | 0 |
| risultato | 5-2 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 12' | av 82.9 · avv. 3.3u · gk 24.2u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min07-occasione-apre.jpg | 7' | occasione-apre |  | 109 |
| f02-min11-tiro.jpg | 11' | tiro | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! | 227 |
| f03-min12-portiere.jpg | 12' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 839 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 608 |
| f05-min14-scena-apre.jpg | 14' | scena-apre |  | 840 |
| f06-min14-gioco.jpg | 14' | gioco |  | 89 |
| f07-min14-scena-esito.jpg | 14' | scena-esito |  | 689 |
| f08-min18-fermo.jpg | 18' | fermo | 🟡 Punizione da posizione defilata: Bruno (GRA) mette in mezzo, la difesa di Bianchi (POL) | 58 |
| f09-min18-occasione-apre.jpg | 18' | occasione-apre |  | 11 |
| f10-min21-tiro.jpg | 21' | tiro | 💥 Incornata di Ferrari (GRA) a botta sicura! | 795 |
| f11-min23-gioco.jpg | 23' | gioco |  | 807 |
| f12-min23-gol.jpg | 23' | gol | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 292 |
| f13-min24-gol+0.5s.jpg | 24' | gol+0.5s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 813 |
| f14-min24-gol+1s.jpg | 24' | gol+1s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 534 |
| f15-min24-scena-apre.jpg | 24' | scena-apre |  | 757 |
| f16-min24-scena-esito.jpg | 24' | scena-esito |  | 87 |
| f17-min28-gioco.jpg | 28' | gioco |  | 135 |
| f18-min30-occasione-apre.jpg | 30' | occasione-apre |  | 537 |
| f19-min33-tiro.jpg | 33' | tiro | 💥 Santis (POL) calcia di prima, senza controllare! | 373 |
| f20-min39-gol.jpg | 39' | gol | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 552 |
| f21-min39-gioco.jpg | 39' | gioco |  | 553 |
| f22-min40-gol+0.5s.jpg | 40' | gol+0.5s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 35 |
| f23-min40-gol+1s.jpg | 40' | gol+1s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 7 |
| f24-min42-occasione-apre.jpg | 42' | occasione-apre |  | 13 |
| f25-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 197 |
| f26-min46-tiro.jpg | 46' | tiro | 💥 Incornata di Colombo (POL) a botta sicura! | 609 |
| f27-min51-gioco.jpg | 51' | gioco |  | 532 |
| f28-min55-occasione-apre.jpg | 55' | occasione-apre |  | 6 |
| f29-min58-tiro.jpg | 58' | tiro | 💥 Incornata di Spada (GRA) a botta sicura! | 245 |
| f30-min61-gol.jpg | 61' | gol | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 903 |
| f31-min61-gol+0.5s.jpg | 61' | gol+0.5s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 419 |
| f32-min61-gol+1s.jpg | 61' | gol+1s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 179 |
| f33-min61-scena-apre.jpg | 61' | scena-apre |  | 398 |
| f34-min61-gioco.jpg | 61' | gioco |  | 224 |
| f35-min61-gol.jpg | 61' | gol | ⚽ Conti segna su assist di Pecoraro! 3-2. | 666 |
| f36-min61-gol+0.5s.jpg | 61' | gol+0.5s | ⚽ Conti segna su assist di Pecoraro! 3-2. | 98 |
| f37-min61-gol+1s.jpg | 61' | gol+1s | ⚽ Conti segna su assist di Pecoraro! 3-2. | 824 |
| f38-min61-scena-esito.jpg | 61' | scena-esito |  | 199 |
| f39-min67-occasione-apre.jpg | 67' | occasione-apre |  | 98 |
| f40-min69-gioco.jpg | 69' | gioco |  | 398 |
| f41-min73-tiro.jpg | 73' | tiro | 💥 Incornata di Bruno (GRA) a botta sicura! | 261 |
| f42-min76-gol.jpg | 76' | gol | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 879 |
| f43-min76-gol+0.5s.jpg | 76' | gol+0.5s | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 387 |
| f44-min76-gol+1s.jpg | 76' | gol+1s | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 125 |
| f45-min76-scena-apre.jpg | 76' | scena-apre |  | 346 |
| f46-min76-gioco.jpg | 76' | gioco |  | 305 |
| f47-min76-scena-esito.jpg | 76' | scena-esito |  | 118 |
| f48-min85-scena-apre.jpg | 85' | scena-apre |  | 137 |
| f49-min85-gioco.jpg | 85' | gioco |  | 516 |
| f50-min85-gol.jpg | 85' | gol | ⚽ Conti segna su assist di Ferrari! 5-2. | 212 |
| f51-min85-gol+0.5s.jpg | 85' | gol+0.5s | ⚽ Conti segna su assist di Ferrari! 5-2. | 749 |
| f52-min85-gol+1s.jpg | 85' | gol+1s | ⚽ Conti segna su assist di Ferrari! 5-2. | 210 |
| f53-min85-scena-esito.jpg | 85' | scena-esito |  | 558 |
