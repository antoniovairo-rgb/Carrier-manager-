# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 31% su 762 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 40% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 37% su 552 campioni · in volo 29% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 299 · fermo 33 · eroe 13 · portatore 4 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 10.3 / 25.6 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.7 / 16.2 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 48 in 1892 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 14 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 8 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 365 / 1782 ms | ≤ 500 ms |
| tagli di camera registrati | 6 | (informativo) |
| minuti per stato dello schermo | {"gioco":59,"palla-morta":10,"fermo":1,"ripresa":13,"calcio-inizio":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 83 | 70-110 |
| risultato | 4-0 | |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min07-occasione-apre.jpg | 7' | occasione-apre |  | 40 |
| f02-min11-tiro.jpg | 11' | tiro | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! | 95 |
| f03-min12-portiere.jpg | 12' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 696 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 972 |
| f05-min14-scena-apre.jpg | 14' | scena-apre |  | 239 |
| f06-min14-gioco.jpg | 14' | gioco |  | 812 |
| f07-min14-scena-esito.jpg | 14' | scena-esito |  | 614 |
| f08-min18-fermo.jpg | 18' | fermo | 🟡 Punizione da posizione defilata: Bruno (GRA) mette in mezzo, la difesa di Bianchi (POL) | 28 |
| f09-min18-occasione-apre.jpg | 18' | occasione-apre |  | 12 |
| f10-min21-tiro.jpg | 21' | tiro | 💥 Incornata di Ferrari (GRA) a botta sicura! | 627 |
| f11-min23-gol.jpg | 23' | gol | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 452 |
| f12-min23-gol+1s.jpg | 23' | gol+1s | ⚽ Ferrari (GRA) segna! Squadra in vantaggio! | 714 |
| f13-min23-scena-apre.jpg | 23' | scena-apre |  | 937 |
| f14-min23-gioco.jpg | 23' | gioco |  | 913 |
| f15-min23-gol.jpg | 23' | gol | ⚽ Conti segna su assist di Pellegrini! 2-0. | 859 |
| f16-min23-scena-esito.jpg | 23' | scena-esito |  | 150 |
| f17-min24-gol+1s.jpg | 24' | gol+1s | ⚽ Conti segna su assist di Pellegrini! 2-0. | 1782 |
| f18-min33-gioco.jpg | 33' | gioco |  | 28 |
| f19-min39-occasione-apre.jpg | 39' | occasione-apre |  | 34 |
| f20-min43-tiro.jpg | 43' | tiro | 💥 Colombo (GRA) da due passi, tutto solo davanti alla porta! | 458 |
| f21-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 192 |
| f22-min44-gioco.jpg | 44' | gioco |  | 415 |
| f23-min49-occasione-apre.jpg | 49' | occasione-apre |  | 63 |
| f24-min52-tiro.jpg | 52' | tiro | 💥 Lombardi (GRA) calcia di prima, senza controllare! | 365 |
| f25-min54-gol.jpg | 54' | gol | ⚽ Lombardi (GRA) segna! Partita in mano: 3-0! | 632 |
| f26-min55-gol+1s.jpg | 55' | gol+1s | ⚽ Lombardi (GRA) segna! Partita in mano: 3-0! | 782 |
| f27-min56-gioco.jpg | 56' | gioco |  | 311 |
| f28-min68-gioco.jpg | 68' | gioco |  | 129 |
| f29-min70-occasione-apre.jpg | 70' | occasione-apre |  | 156 |
| f30-min73-tiro.jpg | 73' | tiro | 💥 Incornata di Bruno (GRA) a botta sicura! | 213 |
| f31-min75-gol.jpg | 75' | gol | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 969 |
| f32-min75-gol+1s.jpg | 75' | gol+1s | ⚽ Bruno (GRA) segna! Partita in mano: 4-0! | 1125 |
| f33-min80-gioco.jpg | 80' | gioco |  | 266 |
| f34-min85-fermo.jpg | 85' | fermo | 🟡 Fallo tattico su Neri (GRA): la ripartenza muore li'. Punizione per Neri (GRA). | 25 |
