# Collaudo da telefono — Moretti casa · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 21% su 811 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 43% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 27% su 509 campioni · in volo 36% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 345 · eroe 16 · fermo 9 · portatore 2 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 10.5 / 24.7 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.6 / 14.4 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 49 in 1901 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 16 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 8 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 446 / 1171 ms | ≤ 500 ms |
| tagli di camera registrati | 6 | (informativo) |
| minuti per stato dello schermo | {"gioco":60,"palla-morta":16,"ripresa":7,"calcio-inizio":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 83 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/5 · come le voleva il piano 3/5 | 0 |
| risultato | 1-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 11' | av 81.7 · avv. 3.8u · gk 22.2u | 💥 Scotti (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Scotti (GRA) si gira sul limite e lascia partire il destro! → ok |
| 21' | av 58.3 · avv. 7.4u · gk 41u | 💥 Luca (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Luca (POL) prova a sorprendere il portiere da lontanissimo! → ok |
| 36' | av 81.3 · avv. 0.9u · gk 29.3u | 💥 Ferrari (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Conclusione secca di Ferrari (GRA) dal vertice dell'area! → ok |
| 72' | av 58.9 · avv. 6.6u · gk 41.2u | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! → ok |
| 89' | av 83 · avv. 5.4u · gk 27.8u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 52 |
| f02-min10-tiro.jpg | 10' | tiro | 💥 Scotti (GRA) si gira sul limite e lascia partire il destro! | 642 |
| f03-min11-portiere.jpg | 11' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 1171 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 700 |
| f05-min16-fermo.jpg | 16' | fermo | 🚩 Calcio d'angolo per Santoro (POL): palla sulla bandierina. | 718 |
| f06-min17-gioco.jpg | 17' | gioco |  | 819 |
| f07-min17-occasione-apre.jpg | 17' | occasione-apre |  | 1044 |
| f08-min20-tiro.jpg | 20' | tiro | 💥 Luca (POL) prova a sorprendere il portiere da lontanissimo! | 54 |
| f09-min21-portiere.jpg | 21' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 650 |
| f10-min23-portiere.jpg | 23' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 543 |
| f11-min26-scena-apre.jpg | 26' | scena-apre |  | 156 |
| f12-min26-gioco.jpg | 26' | gioco |  | 1034 |
| f13-min26-scena-esito.jpg | 26' | scena-esito |  | 81 |
| f14-min31-occasione-apre.jpg | 31' | occasione-apre |  | 43 |
| f15-min34-gioco.jpg | 34' | gioco |  | 629 |
| f16-min35-tiro.jpg | 35' | tiro | 💥 Conclusione secca di Ferrari (GRA) dal vertice dell'area! | 46 |
| f17-min36-portiere.jpg | 36' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 666 |
| f18-min38-portiere.jpg | 38' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 417 |
| f19-min38-scena-apre.jpg | 38' | scena-apre |  | 715 |
| f20-min38-scena-esito.jpg | 38' | scena-esito |  | 85 |
| f21-min40-gioco.jpg | 40' | gioco |  | 88 |
| f22-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 17 |
| f23-min49-occasione-apre.jpg | 49' | occasione-apre |  | 102 |
| f24-min51-gioco.jpg | 51' | gioco |  | 449 |
| f25-min52-tiro.jpg | 52' | tiro | 💥 Neri (GRA) calcia di prima, senza controllare! | 307 |
| f26-min55-gol.jpg | 55' | gol | ⚽ Neri (GRA) segna! Squadra in vantaggio! | 599 |
| f27-min55-gol+0.5s.jpg | 55' | gol+0.5s | ⚽ Neri (GRA) segna! Squadra in vantaggio! | 1109 |
| f28-min55-gol+1s.jpg | 55' | gol+1s | ⚽ Neri (GRA) segna! Squadra in vantaggio! | 633 |
| f29-min63-gioco.jpg | 63' | gioco |  | 30 |
| f30-min66-fermo.jpg | 66' | fermo | 🟡 Fischia l'arbitro: fallo, punizione per Rossi (POL). | 37 |
| f31-min66-occasione-apre.jpg | 66' | occasione-apre |  | 134 |
| f32-min71-tiro.jpg | 71' | tiro | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! | 1030 |
| f33-min72-portiere.jpg | 72' | portiere | 🧤 Fontana (GRA) respinge coi pugni, poi la difesa spazza in angolo. | 567 |
| f34-min73-fermo.jpg | 73' | fermo | 🚩 Calcio d'angolo per Marchetti (POL): palla sulla bandierina. | 115 |
| f35-min75-gioco.jpg | 75' | gioco |  | 1107 |
| f36-min82-occasione-apre.jpg | 82' | occasione-apre |  | 210 |
| f37-min86-gioco.jpg | 86' | gioco |  | 387 |
| f38-min88-tiro.jpg | 88' | tiro | 💥 Conclusione secca di Pecoraro (GRA) dal vertice dell'area! | 446 |
