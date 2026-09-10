# Collaudo da telefono — Galli fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 34% su 426 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 23% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 45% su 291 campioni · in volo 28% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 145 · portatore 15 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 5.5 / 25.8 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.3 / 12.2 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 43 in 1873 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 16 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 6 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 231 / 1013 ms | ≤ 500 ms |
| tagli di camera registrati | 12 | (informativo) |
| minuti per stato dello schermo | {"gioco":57,"palla-morta":12,"ripresa":12,"calcio-inizio":3,"fermo":1} | palla morta + fermo ≤ 15 |
| righe di cronaca | 79 | 70-110 |
| risultato | 1-2 | |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-fermo.jpg | 6' | fermo | ⏸️ Palla sul fondo della fascia: rimessa laterale per Scotti (GRA). | 20 |
| f02-min06-occasione-apre.jpg | 6' | occasione-apre |  | 116 |
| f03-min11-tiro.jpg | 11' | tiro | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! | 604 |
| f04-min12-portiere.jpg | 12' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 175 |
| f05-min13-fermo.jpg | 13' | fermo | 🚩 Calcio d'angolo per Colombo (GRA): palla sulla bandierina. | 693 |
| f06-min17-gioco.jpg | 17' | gioco |  | 204 |
| f07-min28-scena-apre.jpg | 28' | scena-apre |  | 76 |
| f08-min28-gioco.jpg | 28' | gioco |  | 231 |
| f09-min28-scena-esito.jpg | 28' | scena-esito |  | 559 |
| f10-min30-occasione-apre.jpg | 30' | occasione-apre |  | 125 |
| f11-min36-tiro.jpg | 36' | tiro | 💥 Colombo (GRA) non ci pensa due volte: bordata da fuori! | 484 |
| f12-min37-gioco.jpg | 37' | gioco |  | 272 |
| f13-min37-portiere.jpg | 37' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 135 |
| f14-min39-portiere.jpg | 39' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 85 |
| f15-min39-scena-apre.jpg | 39' | scena-apre |  | 6 |
| f16-min39-scena-esito.jpg | 39' | scena-esito |  | 1013 |
| f17-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 7 |
| f18-min45-gioco.jpg | 45' | gioco |  | 40 |
| f19-min50-occasione-apre.jpg | 50' | occasione-apre |  | 204 |
| f20-min50-fermo.jpg | 50' | fermo | 🟡 Fallo tattico di Spada (POL)! Cartellino meritato ma Neri (GRA) guadagna metà campo. | 135 |
| f21-min53-tiro.jpg | 53' | tiro | 💥 Conclusione secca di Vallone (POL) dal limite: il pallone parte teso verso la porta! | 910 |
| f22-min56-gioco.jpg | 56' | gioco |  | 916 |
| f23-min60-scena-apre.jpg | 60' | scena-apre |  | 616 |
| f24-min60-scena-esito.jpg | 60' | scena-esito |  | 906 |
| f25-min62-occasione-apre.jpg | 62' | occasione-apre |  | 83 |
| f26-min64-gioco.jpg | 64' | gioco |  | 482 |
| f27-min65-tiro.jpg | 65' | tiro | 💥 Incornata di Pecoraro (GRA) a botta sicura! | 278 |
| f28-min68-gol.jpg | 68' | gol | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 887 |
| f29-min68-gol+0.5s.jpg | 68' | gol+0.5s | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 394 |
| f30-min68-gol+1s.jpg | 68' | gol+1s | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 133 |
| f31-min76-gioco.jpg | 76' | gioco |  | 76 |
| f32-min81-fermo.jpg | 81' | fermo | 🟡 Fallo tattico su Luca (POL): la ripartenza muore li'. Punizione per Vallone (POL). | 266 |
| f33-min83-scena-apre.jpg | 83' | scena-apre |  | 262 |
| f34-min83-scena-esito.jpg | 83' | scena-esito |  | 268 |
| f35-min84-gioco.jpg | 84' | gioco |  | 10 |
| f36-min85-gol.jpg | 85' | gol | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 269 |
| f37-min85-gol+0.5s.jpg | 85' | gol+0.5s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 195 |
| f38-min85-gol+1s.jpg | 85' | gol+1s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 272 |
| f39-min85-occasione-apre.jpg | 85' | occasione-apre |  | 138 |
