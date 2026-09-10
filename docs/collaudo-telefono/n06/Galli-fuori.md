# Collaudo da telefono — Galli fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 11% su 464 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 24% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 15% su 305 campioni · in volo 33% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 239 · eroe 16 · fermo 3 · portatore 1 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 12.5 / 19.9 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.3 / 18.2 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 54 in 1905 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 17 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 5 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 266 / 970 ms | ≤ 500 ms |
| tagli di camera registrati | 9 | (informativo) |
| minuti per stato dello schermo | {"gioco":56,"palla-morta":13,"ripresa":11,"calcio-inizio":6} | palla morta + fermo ≤ 15 |
| righe di cronaca | 85 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/3 · come le voleva il piano 2/3 | 0 |
| risultato | 2-1 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 11' | av 80.9 · avv. 3.4u · gk 21.9u | 💥 Scotti (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Scotti (GRA) si gira sul limite e lascia partire il destro! → ok |
| 36' | av 79.6 · avv. 5.2u · gk 24u | 💥 Colombo (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → ok |
| 86' | av 56 · avv. 11.3u · gk 49.6u | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! → ok | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-fermo.jpg | 6' | fermo | ⏸️ Palla sul fondo della fascia: rimessa laterale per Scotti (GRA). | 8 |
| f02-min06-occasione-apre.jpg | 6' | occasione-apre |  | 151 |
| f03-min10-tiro.jpg | 10' | tiro | 💥 Scotti (GRA) si gira sul limite e lascia partire il destro! | 728 |
| f04-min11-portiere.jpg | 11' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 239 |
| f05-min12-fermo.jpg | 12' | fermo | 🚩 Calcio d'angolo per Colombo (GRA): palla sulla bandierina. | 747 |
| f06-min17-gioco.jpg | 17' | gioco |  | 970 |
| f07-min20-scena-apre.jpg | 20' | scena-apre |  | 130 |
| f08-min20-scena-esito.jpg | 20' | scena-esito |  | 764 |
| f09-min23-gioco.jpg | 23' | gioco |  | 80 |
| f10-min29-scena-apre.jpg | 29' | scena-apre |  | 115 |
| f11-min29-gol.jpg | 29' | gol | ⚽ Rete spettacolare! | 53 |
| f12-min29-gol.jpg | 29' | gol | ⚽ Galli segna su assist di Colombo! 1-0. | 201 |
| f13-min29-gol+0.5s.jpg | 29' | gol+0.5s | ⚽ Galli segna su assist di Colombo! 1-0. | 749 |
| f14-min29-gol+1s.jpg | 29' | gol+1s | ⚽ Galli segna su assist di Colombo! 1-0. | 311 |
| f15-min29-gioco.jpg | 29' | gioco |  | 607 |
| f16-min29-scena-esito.jpg | 29' | scena-esito |  | 703 |
| f17-min31-occasione-apre.jpg | 31' | occasione-apre |  | 25 |
| f18-min35-tiro.jpg | 35' | tiro | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! | 21 |
| f19-min36-portiere.jpg | 36' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 597 |
| f20-min38-portiere.jpg | 38' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 419 |
| f21-min40-gioco.jpg | 40' | gioco |  | 923 |
| f22-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 19 |
| f23-min48-gol.jpg | 48' | gol | ⚽ Palla al centro e arbitro pronto: si torna a giocare. | 93 |
| f24-min48-gol+0.5s.jpg | 48' | gol+0.5s | ⚽ Palla al centro e arbitro pronto: si torna a giocare. | 47 |
| f25-min48-gol+1s.jpg | 48' | gol+1s | ⚽ Palla al centro e arbitro pronto: si torna a giocare. | 102 |
| f26-min49-occasione-apre.jpg | 49' | occasione-apre |  | 173 |
| f27-min51-gioco.jpg | 51' | gioco |  | 607 |
| f28-min53-tiro.jpg | 53' | tiro | 💥 Conclusione secca di Vallone (POL) dal limite: il pallone parte teso verso la porta! | 796 |
| f29-min61-gol.jpg | 61' | gol | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 880 |
| f30-min61-gol+0.5s.jpg | 61' | gol+0.5s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 111 |
| f31-min61-gol+1s.jpg | 61' | gol+1s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 124 |
| f32-min62-occasione-apre.jpg | 62' | occasione-apre |  | 12 |
| f33-min63-gioco.jpg | 63' | gioco |  | 482 |
| f34-min66-tiro.jpg | 66' | tiro | 💥 Incornata di Pecoraro (GRA) a botta sicura! | 784 |
| f35-min69-gol.jpg | 69' | gol | ⚽ Pecoraro (GRA) segna! Squadra in vantaggio! | 237 |
| f36-min69-gol+0.5s.jpg | 69' | gol+0.5s | ⚽ Pecoraro (GRA) segna! Squadra in vantaggio! | 745 |
| f37-min69-gol+1s.jpg | 69' | gol+1s | ⚽ Pecoraro (GRA) segna! Squadra in vantaggio! | 448 |
| f38-min75-gioco.jpg | 75' | gioco |  | 2 |
| f39-min76-scena-apre.jpg | 76' | scena-apre |  | 3 |
| f40-min76-scena-esito.jpg | 76' | scena-esito |  | 660 |
| f41-min79-occasione-apre.jpg | 79' | occasione-apre |  | 25 |
| f42-min80-gioco.jpg | 80' | gioco |  | 387 |
| f43-min85-tiro.jpg | 85' | tiro | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! | 617 |
| f44-min86-portiere.jpg | 86' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 323 |
| f45-min88-portiere.jpg | 88' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 266 |
