# Collaudo da telefono — Vairo casa · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 33% su 857 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 45% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 39% su 629 campioni · in volo 33% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 325 · fermo 22 · portatore 19 · eroe 16 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 6.9 / 20.8 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.5 / 13.1 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 49 in 1904 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 14 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 2 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 336 / 1005 ms | ≤ 500 ms |
| tagli di camera registrati | 6 | (informativo) |
| minuti per stato dello schermo | {"gioco":69,"palla-morta":13,"ripresa":3,"calcio-inizio":2} | palla morta + fermo ≤ 15 |
| righe di cronaca | 84 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/4 · come le voleva il piano 1/4 | 0 |
| risultato | 1-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 11' | av 80.7 · avv. 5u · gk 22.6u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok |
| 24' | av 56 · avv. 19.5u · gk 62.4u | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok |
| 72' | av 56 · avv. 14.3u · gk 44.7u | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! → ok | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! → ok |
| 83' | av 77.2 · avv. 22.2u · gk 31u | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → ok | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 52 |
| f02-min10-tiro.jpg | 10' | tiro | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! | 610 |
| f03-min11-portiere.jpg | 11' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 103 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 1005 |
| f05-min17-gioco.jpg | 17' | gioco |  | 138 |
| f06-min17-occasione-apre.jpg | 17' | occasione-apre |  | 173 |
| f07-min23-tiro.jpg | 23' | tiro | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! | 76 |
| f08-min24-portiere.jpg | 24' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 594 |
| f09-min26-portiere.jpg | 26' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 336 |
| f10-min27-scena-apre.jpg | 27' | scena-apre |  | 318 |
| f11-min27-gioco.jpg | 27' | gioco |  | 22 |
| f12-min27-scena-esito.jpg | 27' | scena-esito |  | 519 |
| f13-min34-gioco.jpg | 34' | gioco |  | 132 |
| f14-min40-occasione-apre.jpg | 40' | occasione-apre |  | 20 |
| f15-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 405 |
| f16-min45-gioco.jpg | 45' | gioco |  | 744 |
| f17-min51-scena-apre.jpg | 51' | scena-apre |  | 1 |
| f18-min51-gioco.jpg | 51' | gioco |  | 239 |
| f19-min51-gol.jpg | 51' | gol | ⚽ Bruno segna su assist di Vairo! 1-0. | 891 |
| f20-min51-gol+0.5s.jpg | 51' | gol+0.5s | ⚽ Bruno segna su assist di Vairo! 1-0. | 296 |
| f21-min51-gol+1s.jpg | 51' | gol+1s | ⚽ Bruno segna su assist di Vairo! 1-0. | 965 |
| f22-min51-scena-esito.jpg | 51' | scena-esito |  | 695 |
| f23-min59-gioco.jpg | 59' | gioco |  | 695 |
| f24-min65-occasione-apre.jpg | 65' | occasione-apre |  | 55 |
| f25-min71-gioco.jpg | 71' | gioco |  | 594 |
| f26-min71-tiro.jpg | 71' | tiro | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! | 710 |
| f27-min72-portiere.jpg | 72' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 104 |
| f28-min74-portiere.jpg | 74' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 969 |
| f29-min76-occasione-apre.jpg | 76' | occasione-apre |  | 252 |
| f30-min82-tiro.jpg | 82' | tiro | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! | 619 |
| f31-min82-gioco.jpg | 82' | gioco |  | 692 |
| f32-min83-portiere.jpg | 83' | portiere | 🧤 Toti (POL) respinge coi pugni, poi la difesa spazza in angolo. | 192 |
| f33-min84-fermo.jpg | 84' | fermo | 🚩 Calcio d'angolo per Scotti (GRA): palla sulla bandierina. | 869 |
