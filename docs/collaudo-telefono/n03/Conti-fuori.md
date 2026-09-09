# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 20% su 633 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 33% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 26% su 400 campioni · in volo 39% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 267 · portatore 16 · fermo 6 · eroe 6 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 9.6 / 23.3 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.5 / 14.4 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 47 in 1892 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 13 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 2 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 300 / 1109 ms | ≤ 500 ms |
| tagli di camera registrati | 6 | (informativo) |
| minuti per stato dello schermo | {"gioco":62,"palla-morta":8,"fermo":1,"ripresa":14,"calcio-inizio":2} | palla morta + fermo ≤ 15 |
| righe di cronaca | 83 | 70-110 |
| risultato | 4-0 | |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min07-occasione-apre.jpg | 7' | occasione-apre |  | 125 |
| f02-min11-tiro.jpg | 11' | tiro | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! | 797 |
| f03-min12-portiere.jpg | 12' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 240 |
| f04-min14-portiere.jpg | 14' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 988 |
| f05-min14-scena-apre.jpg | 14' | scena-apre |  | 300 |
| f06-min14-gioco.jpg | 14' | gioco |  | 1036 |
| f07-min14-scena-esito.jpg | 14' | scena-esito |  | 378 |
| f08-min18-fermo.jpg | 18' | fermo | 🟡 Punizione da posizione defilata: Bruno (GRA) mette in mezzo, la difesa di Bianchi (POL) | 90 |
| f09-min18-occasione-apre.jpg | 18' | occasione-apre |  | 63 |
| f10-min21-tiro.jpg | 21' | tiro | 💥 Incornata di Ferrari (GRA) a botta sicura! | 259 |
| f11-min23-gol.jpg | 23' | gol | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 34 |
| f12-min23-gol+1s.jpg | 23' | gol+1s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 236 |
| f13-min23-scena-apre.jpg | 23' | scena-apre |  | 384 |
| f14-min23-gioco.jpg | 23' | gioco |  | 614 |
| f15-min23-gol.jpg | 23' | gol | ⚽ Conti segna su assist di Pellegrini! 2-0. | 159 |
| f16-min23-scena-esito.jpg | 23' | scena-esito |  | 600 |
| f17-min23-gol+1s.jpg | 23' | gol+1s | ⚽ Conti segna su assist di Pellegrini! 2-0. | 17 |
| f18-min33-gioco.jpg | 33' | gioco |  | 1060 |
| f19-min39-occasione-apre.jpg | 39' | occasione-apre |  | 123 |
| f20-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 752 |
| f21-min45-gioco.jpg | 45' | gioco |  | 371 |
| f22-min49-occasione-apre.jpg | 49' | occasione-apre |  | 116 |
| f23-min52-tiro.jpg | 52' | tiro | 💥 Lombardi (GRA) calcia di prima, senza controllare! | 45 |
| f24-min55-gol.jpg | 55' | gol | ⚽ Lombardi (GRA) segna! Partita in mano: 3-0! | 473 |
| f25-min55-gol+1s.jpg | 55' | gol+1s | ⚽ Lombardi (GRA) segna! Partita in mano: 3-0! | 626 |
| f26-min57-gioco.jpg | 57' | gioco |  | 458 |
| f27-min60-occasione-apre.jpg | 60' | occasione-apre |  | 1109 |
| f28-min66-tiro.jpg | 66' | tiro | 💥 Ferrari (GRA) a tu per tu col portiere, calcia di prima! | 114 |
| f29-min67-portiere.jpg | 67' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 743 |
| f30-min68-gioco.jpg | 68' | gioco |  | 8 |
| f31-min68-fermo.jpg | 68' | fermo | 🚩 Calcio d'angolo per Conti (GRA): palla sulla bandierina. | 230 |
| f32-min70-occasione-apre.jpg | 70' | occasione-apre |  | 116 |
| f33-min73-tiro.jpg | 73' | tiro | 💥 Incornata di Bruno (GRA) a botta sicura! | 527 |
| f34-min75-gol.jpg | 75' | gol | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 14 |
| f35-min75-gol+1s.jpg | 75' | gol+1s | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 57 |
| f36-min80-gioco.jpg | 80' | gioco |  | 306 |
| f37-min84-occasione-apre.jpg | 84' | occasione-apre |  | 740 |
