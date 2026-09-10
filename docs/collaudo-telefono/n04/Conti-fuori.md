# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 33% su 531 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 29% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 43% su 383 campioni · in volo 39% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 185 · fermo 26 · eroe 6 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 7.6 / 22 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.7 / 15 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 48 in 1855 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 14 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 8 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 429 / 1072 ms | ≤ 500 ms |
| tagli di camera registrati | 21 | (informativo) |
| minuti per stato dello schermo | {"gioco":56,"palla-morta":8,"fermo":1,"ripresa":15,"calcio-inizio":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 98 | 70-110 |
| risultato | 5-2 | |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min07-occasione-apre.jpg | 7' | occasione-apre |  | 127 |
| f02-min11-tiro.jpg | 11' | tiro | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! | 29 |
| f03-min12-portiere.jpg | 12' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 525 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 143 |
| f05-min14-scena-apre.jpg | 14' | scena-apre |  | 405 |
| f06-min14-gioco.jpg | 14' | gioco |  | 429 |
| f07-min14-scena-esito.jpg | 14' | scena-esito |  | 85 |
| f08-min18-fermo.jpg | 18' | fermo | 🟡 Punizione da posizione defilata: Bruno (GRA) mette in mezzo, la difesa di Bianchi (POL) | 174 |
| f09-min18-occasione-apre.jpg | 18' | occasione-apre |  | 34 |
| f10-min21-tiro.jpg | 21' | tiro | 💥 Incornata di Ferrari (GRA) a botta sicura! | 435 |
| f11-min23-gol.jpg | 23' | gol | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 661 |
| f12-min24-gol+0.5s.jpg | 24' | gol+0.5s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 98 |
| f13-min24-gol+1s.jpg | 24' | gol+1s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 848 |
| f14-min24-scena-apre.jpg | 24' | scena-apre |  | 1072 |
| f15-min24-gioco.jpg | 24' | gioco |  | 906 |
| f16-min24-scena-esito.jpg | 24' | scena-esito |  | 563 |
| f17-min30-occasione-apre.jpg | 30' | occasione-apre |  | 270 |
| f18-min33-gioco.jpg | 33' | gioco |  | 884 |
| f19-min33-tiro.jpg | 33' | tiro | 💥 Santis (POL) calcia di prima, senza controllare! | 46 |
| f20-min39-gol.jpg | 39' | gol | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 693 |
| f21-min40-gol+0.5s.jpg | 40' | gol+0.5s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 163 |
| f22-min40-gol+1s.jpg | 40' | gol+1s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 79 |
| f23-min42-occasione-apre.jpg | 42' | occasione-apre |  | 36 |
| f24-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 392 |
| f25-min45-gioco.jpg | 45' | gioco |  | 340 |
| f26-min46-tiro.jpg | 46' | tiro | 💥 Incornata di Colombo (POL) a botta sicura! | 673 |
| f27-min55-occasione-apre.jpg | 55' | occasione-apre |  | 994 |
| f28-min57-gioco.jpg | 57' | gioco |  | 82 |
| f29-min58-tiro.jpg | 58' | tiro | 💥 Incornata di Spada (GRA) a botta sicura! | 685 |
| f30-min61-gol.jpg | 61' | gol | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 265 |
| f31-min61-gol+0.5s.jpg | 61' | gol+0.5s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 784 |
| f32-min61-gol+1s.jpg | 61' | gol+1s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 473 |
| f33-min61-scena-apre.jpg | 61' | scena-apre |  | 622 |
| f34-min61-gol.jpg | 61' | gol | ⚽ Conti segna su assist di Pecoraro! 3-2. | 692 |
| f35-min61-gol+0.5s.jpg | 61' | gol+0.5s | ⚽ Conti segna su assist di Pecoraro! 3-2. | 97 |
| f36-min61-gol+1s.jpg | 61' | gol+1s | ⚽ Conti segna su assist di Pecoraro! 3-2. | 825 |
| f37-min61-scena-esito.jpg | 61' | scena-esito |  | 977 |
| f38-min65-gioco.jpg | 65' | gioco |  | 102 |
| f39-min67-occasione-apre.jpg | 67' | occasione-apre |  | 50 |
| f40-min73-tiro.jpg | 73' | tiro | 💥 Incornata di Bruno (GRA) a botta sicura! | 679 |
| f41-min76-gol.jpg | 76' | gol | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 245 |
| f42-min76-gol+0.5s.jpg | 76' | gol+0.5s | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 759 |
| f43-min76-gol+1s.jpg | 76' | gol+1s | ⚽ Bruno (GRA) segna! Raddoppio: due gol di margine! | 501 |
| f44-min76-scena-apre.jpg | 76' | scena-apre |  | 647 |
| f45-min76-gioco.jpg | 76' | gioco |  | 872 |
| f46-min76-scena-esito.jpg | 76' | scena-esito |  | 397 |
| f47-min85-gioco.jpg | 85' | gioco |  | 78 |
| f48-min85-scena-apre.jpg | 85' | scena-apre |  | 40 |
| f49-min85-scena-esito.jpg | 85' | scena-esito |  | 459 |
| f50-min85-gol.jpg | 85' | gol | ⚽ Ferrari segna su assist di Conti! 5-2. | 609 |
| f51-min85-gol+0.5s.jpg | 85' | gol+0.5s | ⚽ Ferrari segna su assist di Conti! 5-2. | 5 |
| f52-min86-gol+1s.jpg | 86' | gol+1s | ⚽ Ferrari segna su assist di Conti! 5-2. | 606 |
