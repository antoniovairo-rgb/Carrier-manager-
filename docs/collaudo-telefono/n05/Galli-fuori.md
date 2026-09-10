# Collaudo da telefono — Galli fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 19% su 644 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 34% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 26% su 444 campioni · in volo 33% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 312 · portatore 15 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 11.6 / 24.9 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.4 / 16.8 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 53 in 1891 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 16 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 3 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 395 / 1257 ms | ≤ 500 ms |
| tagli di camera registrati | 29 | (informativo) |
| minuti per stato dello schermo | {"gioco":57,"palla-morta":12,"ripresa":11,"calcio-inizio":6} | palla morta + fermo ≤ 15 |
| righe di cronaca | 75 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/3 · come le voleva il piano 1/3 | 0 |
| risultato | 2-1 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 11' | av 80.9 · avv. 3.3u · gk 22u | 💥 Scotti (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Scotti (GRA) si gira sul limite e lascia partire il destro! → ok |
| 28' | av 64.7 · avv. 3.1u · gk 37.5u | 💥 Ferrari (GRA) non ci pensa due volte: bordata da fuori! → ok | 💥 Ferrari (GRA) non ci pensa due volte: bordata da fuori! → ok |
| 84' | av 56 · avv. 6.4u · gk 42.2u | 💥 Santoro (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Santoro (POL) prova a sorprendere il portiere da lontanissimo! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-fermo.jpg | 6' | fermo | ⏸️ Palla sul fondo della fascia: rimessa laterale per Scotti (GRA). | 16 |
| f02-min06-occasione-apre.jpg | 6' | occasione-apre |  | 77 |
| f03-min10-tiro.jpg | 10' | tiro | 💥 Scotti (GRA) si gira sul limite e lascia partire il destro! | 398 |
| f04-min11-portiere.jpg | 11' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 847 |
| f05-min12-fermo.jpg | 12' | fermo | 🚩 Calcio d'angolo per Colombo (GRA): palla sulla bandierina. | 369 |
| f06-min17-gioco.jpg | 17' | gioco |  | 863 |
| f07-min20-scena-apre.jpg | 20' | scena-apre |  | 80 |
| f08-min20-gol.jpg | 20' | gol | ⚽ Galli segna su assist di Scotti! 1-0. | 693 |
| f09-min20-gol+0.5s.jpg | 20' | gol+0.5s | ⚽ Galli segna su assist di Scotti! 1-0. | 137 |
| f10-min20-gol+1s.jpg | 20' | gol+1s | ⚽ Galli segna su assist di Scotti! 1-0. | 866 |
| f11-min20-scena-esito.jpg | 20' | scena-esito |  | 107 |
| f12-min21-occasione-apre.jpg | 21' | occasione-apre |  | 19 |
| f13-min23-gioco.jpg | 23' | gioco |  | 665 |
| f14-min27-tiro.jpg | 27' | tiro | 💥 Ferrari (GRA) non ci pensa due volte: bordata da fuori! | 134 |
| f15-min28-portiere.jpg | 28' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 813 |
| f16-min29-fermo.jpg | 29' | fermo | 🚩 Calcio d'angolo per Scotti (GRA): palla sulla bandierina. | 395 |
| f17-min30-scena-apre.jpg | 30' | scena-apre |  | 1000 |
| f18-min30-gioco.jpg | 30' | gioco |  | 384 |
| f19-min30-scena-esito.jpg | 30' | scena-esito |  | 644 |
| f20-min33-gioco.jpg | 33' | gioco |  | 115 |
| f21-min39-occasione-apre.jpg | 39' | occasione-apre |  | 58 |
| f22-min45-fermo.jpg | 45' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 266 |
| f23-min45-gioco.jpg | 45' | gioco |  | 604 |
| f24-min49-occasione-apre.jpg | 49' | occasione-apre |  | 9 |
| f25-min53-tiro.jpg | 53' | tiro | 💥 Conclusione secca di Vallone (POL) dal limite: il pallone parte teso verso la porta! | 794 |
| f26-min57-gioco.jpg | 57' | gioco |  | 285 |
| f27-min61-gol.jpg | 61' | gol | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 967 |
| f28-min61-gol+0.5s.jpg | 61' | gol+0.5s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 170 |
| f29-min61-gol+1s.jpg | 61' | gol+1s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 128 |
| f30-min62-occasione-apre.jpg | 62' | occasione-apre |  | 48 |
| f31-min66-tiro.jpg | 66' | tiro | 💥 Incornata di Pecoraro (GRA) a botta sicura! | 545 |
| f32-min69-gol.jpg | 69' | gol | ⚽ Pecoraro (GRA) segna! Squadra in vantaggio! | 855 |
| f33-min69-gioco.jpg | 69' | gioco |  | 1003 |
| f34-min69-gol+0.5s.jpg | 69' | gol+0.5s | ⚽ Pecoraro (GRA) segna! Squadra in vantaggio! | 251 |
| f35-min69-gol+1s.jpg | 69' | gol+1s | ⚽ Pecoraro (GRA) segna! Squadra in vantaggio! | 995 |
| f36-min76-scena-apre.jpg | 76' | scena-apre |  | 68 |
| f37-min76-gioco.jpg | 76' | gioco |  | 453 |
| f38-min76-scena-esito.jpg | 76' | scena-esito |  | 647 |
| f39-min77-occasione-apre.jpg | 77' | occasione-apre |  | 1257 |
| f40-min83-tiro.jpg | 83' | tiro | 💥 Santoro (POL) prova a sorprendere il portiere da lontanissimo! | 700 |
| f41-min84-portiere.jpg | 84' | portiere | 🧤 Fontana (GRA) ci arriva in tuffo e la devia in angolo: che parata! | 202 |
| f42-min85-fermo.jpg | 85' | fermo | 🚩 Calcio d'angolo per Marchetti (POL): palla sulla bandierina. | 822 |
| f43-min86-gioco.jpg | 86' | gioco |  | 17 |
