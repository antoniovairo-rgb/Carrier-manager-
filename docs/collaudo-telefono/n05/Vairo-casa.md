# Collaudo da telefono — Vairo casa · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 36% su 867 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 45% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 45% su 644 campioni · in volo 36% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 293 · fermo 36 · portatore 16 · eroe 12 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 6.1 / 17.7 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.7 / 13.3 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 39 in 1908 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 15 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 8 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 173 / 1018 ms | ≤ 500 ms |
| tagli di camera registrati | 21 | (informativo) |
| minuti per stato dello schermo | {"gioco":67,"palla-morta":15,"ripresa":3,"calcio-inizio":2} | palla morta + fermo ≤ 15 |
| righe di cronaca | 85 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/5 · come le voleva il piano 2/5 | 0 |
| risultato | 0-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 11' | av 80.7 · avv. 5u · gk 22.6u | 💥 Pecoraro (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok |
| 24' | av 56 · avv. 19.5u · gk 62.4u | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok |
| 56' | av 83.1 · avv. 4.6u · gk 14.5u | 💥 Scotti (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Conclusione secca di Scotti (GRA) dal vertice dell'area! → ok |
| 70' | av 62.4 · avv. 4.9u · gk 35.1u | 💥 Vallone (POL) non ci pensa due volte: bordata da fuori! → ok | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! → ok |
| 79' | av 74.3 · avv. 4.1u · gk 23.9u | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 120 |
| f02-min10-tiro.jpg | 10' | tiro | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! | 1018 |
| f03-min11-portiere.jpg | 11' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 467 |
| f04-min13-portiere.jpg | 13' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 70 |
| f05-min17-gioco.jpg | 17' | gioco |  | 13 |
| f06-min17-occasione-apre.jpg | 17' | occasione-apre |  | 64 |
| f07-min23-tiro.jpg | 23' | tiro | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! | 674 |
| f08-min24-portiere.jpg | 24' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 121 |
| f09-min26-portiere.jpg | 26' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 931 |
| f10-min27-scena-apre.jpg | 27' | scena-apre |  | 875 |
| f11-min27-gioco.jpg | 27' | gioco |  | 692 |
| f12-min27-scena-esito.jpg | 27' | scena-esito |  | 652 |
| f13-min34-gioco.jpg | 34' | gioco |  | 84 |
| f14-min41-tiro.jpg | 41' | tiro | 💥 La ripartenza si chiude col tiro di Scotti (GRA): Toti (POL) devia in tuffo! | 73 |
| f15-min41-scena-apre.jpg | 41' | scena-apre |  | 628 |
| f16-min41-gioco.jpg | 41' | gioco |  | 629 |
| f17-min41-scena-esito.jpg | 41' | scena-esito |  | 173 |
| f18-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 87 |
| f19-min51-gioco.jpg | 51' | gioco |  | 47 |
| f20-min51-occasione-apre.jpg | 51' | occasione-apre |  | 84 |
| f21-min55-tiro.jpg | 55' | tiro | 💥 Conclusione secca di Scotti (GRA) dal vertice dell'area! | 539 |
| f22-min56-portiere.jpg | 56' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 157 |
| f23-min57-fermo.jpg | 57' | fermo | 🚩 Calcio d'angolo per Colombo (GRA): palla sulla bandierina. | 812 |
| f24-min59-tiro.jpg | 59' | tiro | 💥 Traversone dalla bandierina: mischia in area! | 712 |
| f25-min62-gioco.jpg | 62' | gioco |  | 6 |
| f26-min65-occasione-apre.jpg | 65' | occasione-apre |  | 165 |
| f27-min69-tiro.jpg | 69' | tiro | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! | 748 |
| f28-min71-portiere.jpg | 71' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 256 |
| f29-min72-portiere.jpg | 72' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 76 |
| f30-min74-gioco.jpg | 74' | gioco |  | 154 |
| f31-min74-occasione-apre.jpg | 74' | occasione-apre |  | 596 |
| f32-min78-tiro.jpg | 78' | tiro | 💥 Pecoraro (GRA) si gira sul limite e lascia partire il destro! | 453 |
| f33-min80-portiere.jpg | 80' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 17 |
| f34-min81-portiere.jpg | 81' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 892 |
| f35-min86-gioco.jpg | 86' | gioco |  | 7 |
