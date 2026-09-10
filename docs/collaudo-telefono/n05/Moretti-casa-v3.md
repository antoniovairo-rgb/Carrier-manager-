# Collaudo da telefono — Moretti casa · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 23% su 898 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 47% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 31% su 585 campioni · in volo 36% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 354 · eroe 26 · fermo 14 · portatore 12 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 8.7 / 21.5 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.6 / 18.2 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 63 in 1906 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 17 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 10 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 247 / 982 ms | ≤ 500 ms |
| tagli di camera registrati | 7 | (informativo) |
| minuti per stato dello schermo | {"gioco":60,"palla-morta":14,"fermo":2,"ripresa":7,"calcio-inizio":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 86 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/4 · come le voleva il piano 1/4 | 0 |
| risultato | 3-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 11' | av 82.2 · avv. 5.1u · gk 16.1u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok |
| 21' | av 58.1 · avv. 3.5u · gk 41.9u | 💥 Luca (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Luca (POL) prova a sorprendere il portiere da lontanissimo! → ok |
| 68' | av 74 · avv. 2u · gk 23.5u | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok |
| 82' | av 56 · avv. 10u · gk 43.4u | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 193 |
| f02-min10-tiro.jpg | 10' | tiro | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! | 91 |
| f03-min11-portiere.jpg | 11' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 747 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 477 |
| f05-min17-fermo.jpg | 17' | fermo | 🚩 Calcio d'angolo per Santoro (POL): palla sulla bandierina. | 172 |
| f06-min17-gioco.jpg | 17' | gioco |  | 42 |
| f07-min17-occasione-apre.jpg | 17' | occasione-apre |  | 553 |
| f08-min20-tiro.jpg | 20' | tiro | 💥 Luca (POL) prova a sorprendere il portiere da lontanissimo! | 761 |
| f09-min21-portiere.jpg | 21' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 390 |
| f10-min23-portiere.jpg | 23' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 230 |
| f11-min24-scena-apre.jpg | 24' | scena-apre |  | 247 |
| f12-min24-tiro.jpg | 24' | tiro | 💥 GOOOOOL! Folla in delirio! | 536 |
| f13-min24-gioco.jpg | 24' | gioco |  | 611 |
| f14-min24-gol.jpg | 24' | gol | ⚽ Moretti segna su assist di Scotti! 1-0. | 685 |
| f15-min24-gol+0.5s.jpg | 24' | gol+0.5s | ⚽ Moretti segna su assist di Scotti! 1-0. | 188 |
| f16-min24-gol+1s.jpg | 24' | gol+1s | ⚽ Moretti segna su assist di Scotti! 1-0. | 915 |
| f17-min24-scena-esito.jpg | 24' | scena-esito |  | 87 |
| f18-min32-scena-apre.jpg | 32' | scena-apre |  | 27 |
| f19-min32-gioco.jpg | 32' | gioco |  | 11 |
| f20-min32-gol.jpg | 32' | gol | ⚽ Moretti segna su assist di Neri! 2-0. | 201 |
| f21-min32-gol+0.5s.jpg | 32' | gol+0.5s | ⚽ Moretti segna su assist di Neri! 2-0. | 725 |
| f22-min32-gol+1s.jpg | 32' | gol+1s | ⚽ Moretti segna su assist di Neri! 2-0. | 228 |
| f23-min32-scena-esito.jpg | 32' | scena-esito |  | 690 |
| f24-min38-occasione-apre.jpg | 38' | occasione-apre |  | 50 |
| f25-min40-gioco.jpg | 40' | gioco |  | 691 |
| f26-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 908 |
| f27-min49-occasione-apre.jpg | 49' | occasione-apre |  | 116 |
| f28-min52-gioco.jpg | 52' | gioco |  | 982 |
| f29-min52-tiro.jpg | 52' | tiro | 💥 Neri (GRA) calcia di prima, senza controllare! | 352 |
| f30-min55-gol.jpg | 55' | gol | ⚽ Neri (GRA) segna! Partita in mano: 3-0! | 916 |
| f31-min55-gol+0.5s.jpg | 55' | gol+0.5s | ⚽ Neri (GRA) segna! Partita in mano: 3-0! | 397 |
| f32-min55-gol+1s.jpg | 55' | gol+1s | ⚽ Neri (GRA) segna! Partita in mano: 3-0! | 83 |
| f33-min63-gioco.jpg | 63' | gioco |  | 336 |
| f34-min63-occasione-apre.jpg | 63' | occasione-apre |  | 167 |
| f35-min67-tiro.jpg | 67' | tiro | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! | 267 |
| f36-min68-portiere.jpg | 68' | portiere | 🧤 Toti (POL) respinge coi pugni, poi la difesa spazza in angolo. | 788 |
| f37-min69-fermo.jpg | 69' | fermo | 🚩 Calcio d'angolo per Scotti (GRA): palla sulla bandierina. | 17 |
| f38-min75-gioco.jpg | 75' | gioco |  | 125 |
| f39-min75-occasione-apre.jpg | 75' | occasione-apre |  | 167 |
| f40-min81-tiro.jpg | 81' | tiro | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! | 859 |
| f41-min82-portiere.jpg | 82' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 226 |
| f42-min84-portiere.jpg | 84' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 50 |
| f43-min87-gioco.jpg | 87' | gioco |  | 176 |
