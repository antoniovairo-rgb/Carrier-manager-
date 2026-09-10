# Collaudo da telefono — Galli fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 33% su 938 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 51% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 40% su 743 campioni · in volo 33% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 354 · fermo 78 · portatore 11 · eroe 6 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 7.6 / 26.2 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.8 / 17.6 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 53 in 1830 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 12 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 5 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 210 / 1315 ms | ≤ 500 ms |
| tagli di camera registrati | 27 | (informativo) |
| minuti per stato dello schermo | {"gioco":58,"palla-morta":11,"ripresa":11,"calcio-inizio":5} | palla morta + fermo ≤ 15 |
| righe di cronaca | 79 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/2 · come le voleva il piano 1/2 | 0 |
| risultato | 2-1 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 18' | av 56 · avv. 8.6u · gk 41.9u | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! → ok |
| 38' | av 78.1 · avv. 2.5u · gk 19u | 💥 Ferrari (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Conclusione secca di Ferrari (GRA) dal vertice dell'area! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min11-occasione-apre.jpg | 11' | occasione-apre |  | 56 · x 42 · ph playing · sc 0-0 · hud 0-0 |
| f02-min17-tiro.jpg | 17' | tiro | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! | 789 · x 43.59 · ph playing · sc 0-0 · hud 0-0 |
| f03-min18-gioco.jpg | 18' | gioco |  | 476 · x 20.87 · ph playing · sc 0-0 · hud 0-0 |
| f04-min18-portiere.jpg | 18' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 94 · x 20.6 · ph playing · sc 0-0 · hud 0-0 |
| f05-min20-portiere.jpg | 20' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 941 · x 21.08 · ph playing · sc 0-0 · hud 0-0 |
| f06-min24-scena-apre.jpg | 24' | scena-apre |  | 601 · x 22.46 · ph hl_intro · sc 0-0 · hud 0-0 |
| f07-min24-gioco.jpg | 24' | gioco |  | 210 · x 88.7 · ph hl_result · sc 0-0 · hud 0-0 |
| f08-min24-scena-esito.jpg | 24' | scena-esito |  | 171 · x 88.84 · ph playing · sc 0-0 · hud 0-0 |
| f09-min30-tiro.jpg | 30' | tiro | 💥 La ripartenza si chiude col tiro di Neri (GRA): Toti (POL) devia in tuffo! | 24 · x 57.8 · ph playing · sc 0-0 · hud 0-0 |
| f10-min31-occasione-apre.jpg | 31' | occasione-apre |  | 687 · x 74.32 · ph playing · sc 0-0 · hud 0-0 |
| f11-min36-gioco.jpg | 36' | gioco |  | 328 · x 81.52 · ph playing · sc 0-0 · hud 0-0 |
| f12-min37-tiro.jpg | 37' | tiro | 💥 Conclusione secca di Ferrari (GRA) dal vertice dell'area! | 56 · x 77.72 · ph playing · sc 0-0 · hud 0-0 |
| f13-min38-portiere.jpg | 38' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 577 · x 86.88 · ph playing · sc 0-0 · hud 0-0 |
| f14-min39-portiere.jpg | 39' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 41 · x 94 · ph playing · sc 0-0 · hud 0-0 |
| f15-min40-scena-apre.jpg | 40' | scena-apre |  | 289 · x 93.14 · ph hl_intro · sc 0-0 · hud 0-0 |
| f16-min40-scena-esito.jpg | 40' | scena-esito |  | 191 · x 57.71 · ph playing · sc 0-0 · hud 0-0 |
| f17-min44-gioco.jpg | 44' | gioco |  | 203 · x 34.64 · ph playing · sc 0-0 · hud 0-0 |
| f18-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 231 · x 37.85 · ph playing · sc 0-0 · hud 0-0 |
| f19-min48-gol.jpg | 48' | gol | ⚽ Palla al centro e arbitro pronto: si torna a giocare. | 200 · x 50 · ph playing · sc 0-0 · hud 0-0 |
| f20-min48-gol+0.5s.jpg | 48' | gol+0.5s | ⚽ Palla al centro e arbitro pronto: si torna a giocare. | 33 · x 50.67 · ph playing · sc 0-0 · hud 0-0 |
| f21-min48-gol+1s.jpg | 48' | gol+1s | ⚽ Palla al centro e arbitro pronto: si torna a giocare. | 262 · x 50.01 · ph playing · sc 0-0 · hud 0-0 |
| f22-min49-occasione-apre.jpg | 49' | occasione-apre |  | 111 · x 58.42 · ph playing · sc 0-0 · hud 0-0 |
| f23-min54-tiro.jpg | 54' | tiro | 💥 Conclusione secca di Vallone (POL) dal limite: il pallone parte teso verso la porta! | 785 · x 27.19 · ph playing · sc 0-0 · hud 0-0 |
| f24-min55-gioco.jpg | 55' | gioco |  | 455 · x 2.71 · ph playing · sc 0-0 · hud 0-0 |
| f25-min60-scena-apre.jpg | 60' | scena-apre |  | 1143 · x 24.84 · ph hl_intro · sc 0-1 · hud 0-1 |
| f26-min60-gioco.jpg | 60' | gioco |  | 371 · x 88.96 · ph hl_result · sc 0-1 · hud 0-1 |
| f27-min60-scena-esito.jpg | 60' | scena-esito |  | 94 · x 88.99 · ph playing · sc 0-1 · hud 0-1 |
| f28-min62-occasione-apre.jpg | 62' | occasione-apre |  | 142 · x 54.31 · ph playing · sc 0-1 · hud 0-1 |
| f29-min65-tiro.jpg | 65' | tiro | 💥 Incornata di Pecoraro (GRA) a botta sicura! | 1275 · x 82.98 · ph playing · sc 0-1 · hud 0-1 |
| f30-min68-gol.jpg | 68' | gol | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 15 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f31-min68-gol+0.5s.jpg | 68' | gol+0.5s | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 532 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f32-min68-gol+1s.jpg | 68' | gol+1s | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 35 · x 90.8 · ph playing · sc 1-1 · hud 1-1 |
| f33-min72-gioco.jpg | 72' | gioco |  | 819 · x 66.21 · ph playing · sc 1-1 · hud 1-1 |
| f34-min75-scena-apre.jpg | 75' | scena-apre |  | 143 · x 64 · ph hl_intro · sc 1-1 · hud 1-1 |
| f35-min75-gol.jpg | 75' | gol | ⚽ Pecoraro segna su assist di Galli! 2-1. | 795 · x 99.15 · ph hl_result · sc 1-1 · hud 2-1 |
| f36-min75-gol+0.5s.jpg | 75' | gol+0.5s | ⚽ Pecoraro segna su assist di Galli! 2-1. | 1315 · x 99.15 · ph hl_result · sc 1-1 · hud 2-1 |
| f37-min75-gioco.jpg | 75' | gioco |  | 44 · x 100.6 · ph hl_result · sc 1-1 · hud 2-1 |
| f38-min75-gol+1s.jpg | 75' | gol+1s | ⚽ Pecoraro segna su assist di Galli! 2-1. | 705 · x 100.6 · ph hl_result · sc 1-1 · hud 2-1 |
| f39-min75-scena-esito.jpg | 75' | scena-esito |  | 195 · x 99.15 · ph playing · sc 1-1 · hud 2-1 |
| f40-min85-gioco.jpg | 85' | gioco |  | 167 · x 24.09 · ph playing · sc 2-1 · hud 2-1 |
| f41-min87-occasione-apre.jpg | 87' | occasione-apre |  | 105 · x 10.09 · ph playing · sc 2-1 · hud 2-1 |
