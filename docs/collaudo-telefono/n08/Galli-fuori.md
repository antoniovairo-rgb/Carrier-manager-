# Collaudo da telefono — Galli fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 41% su 594 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 32% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 49% su 499 campioni · in volo 26% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 147 · fermo 52 · eroe 41 · portatore 16 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 5.8 / 18 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 1.2 / 23.3 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 43 in 1840 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 12 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 6 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 318 / 1354 ms | ≤ 500 ms |
| tagli di camera registrati | 12 | (informativo) |
| minuti per stato dello schermo | {"gioco":58,"palla-morta":12,"fermo":3,"ripresa":10,"calcio-inizio":2} | palla morta + fermo ≤ 15 |
| righe di cronaca | 78 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/2 · come le voleva il piano 1/2 | 0 |
| risultato | 1-1 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 24' | av 69.2 · avv. 2.9u · gk 29.2u | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → FALSA | 💥 Colombo (GRA) prova a sorprendere il portiere da lontanissimo! → ok |
| 87' | av 59.2 · avv. 5.7u · gk 37.9u | 💥 Spada (POL) non ci pensa due volte: bordata da fuori! → ok | 💥 Spada (POL) non ci pensa due volte: bordata da fuori! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min18-gioco.jpg | 18' | gioco |  | 193 · x 62.32 · ph playing · sc 0-0 · hud 0-0 |
| f02-min19-occasione-apre.jpg | 19' | occasione-apre |  | 65 · x 48.25 · ph playing · sc 0-0 · hud 0-0 |
| f03-min23-tiro.jpg | 23' | tiro | 💥 Colombo (GRA) prova a sorprendere il portiere da lontanissimo! | 1059 · x 70.35 · ph playing · sc 0-0 · hud 0-0 |
| f04-min24-portiere.jpg | 24' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 286 · x 83.81 · ph playing · sc 0-0 · hud 0-0 |
| f05-min25-fermo.jpg | 25' | fermo | 🚩 Calcio d'angolo per Galli (GRA): palla sulla bandierina. | 629 · x 83.44 · ph playing · sc 0-0 · hud 0-0 |
| f06-min26-scena-apre.jpg | 26' | scena-apre |  | 919 · x 91.84 · ph hl_intro · sc 0-0 · hud 0-0 |
| f07-min26-portiere.jpg | 26' | portiere | 🧤 C'è arrivato! Il portiere legge la traiettoria e la toglie alto sinistra. | 994 · x 89 · ph hl_result · sc 0-0 · hud 0-0 |
| f08-min26-gioco.jpg | 26' | gioco |  | 318 · x 93.56 · ph hl_result · sc 0-0 · hud 0-0 |
| f09-min26-scena-esito.jpg | 26' | scena-esito |  | 107 · x 89.01 · ph playing · sc 0-0 · hud 0-0 |
| f10-min35-gioco.jpg | 35' | gioco |  | 18 · x 14.56 · ph playing · sc 0-0 · hud 0-0 |
| f11-min43-fermo.jpg | 43' | fermo | ⏸️ Palla sul fondo della fascia: rimessa laterale per De Santis (POL). | 111 · x 35.91 · ph playing · sc 0-0 · hud 0-0 |
| f12-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 130 · x 23.04 · ph playing · sc 0-0 · hud 0-0 |
| f13-min46-gioco.jpg | 46' | gioco |  | 129 · x 27.95 · ph playing · sc 0-0 · hud 0-0 |
| f14-min49-occasione-apre.jpg | 49' | occasione-apre |  | 11 · x 58.15 · ph playing · sc 0-0 · hud 0-0 |
| f15-min53-tiro.jpg | 53' | tiro | 💥 Conclusione secca di Vallone (POL) dal limite: il pallone parte teso verso la porta! | 204 · x 27.45 · ph playing · sc 0-0 · hud 0-0 |
| f16-min58-gioco.jpg | 58' | gioco |  | 338 · x 13.58 · ph playing · sc 0-1 · hud 0-1 |
| f17-min59-scena-apre.jpg | 59' | scena-apre |  | 412 · x 21.79 · ph hl_intro · sc 0-1 · hud 0-1 |
| f18-min59-scena-esito.jpg | 59' | scena-esito |  | 755 · x 37.18 · ph playing · sc 0-1 · hud 0-1 |
| f19-min60-gol.jpg | 60' | gol | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 1354 · x 27.36 · ph playing · sc 0-1 · hud 0-1 |
| f20-min61-gol+0.5s.jpg | 61' | gol+0.5s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 130 · x 37.09 · ph playing · sc 0-1 · hud 0-1 |
| f21-min61-gol+1s.jpg | 61' | gol+1s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 115 · x 37.09 · ph playing · sc 0-1 · hud 0-1 |
| f22-min61-occasione-apre.jpg | 61' | occasione-apre |  | 161 · x 37.09 · ph playing · sc 0-1 · hud 0-1 |
| f23-min63-tiro.jpg | 63' | tiro | 💥 Spada (GRA) calcia di prima, senza controllare! | 610 · x 69.7 · ph playing · sc 0-1 · hud 0-1 |
| f24-min66-gol.jpg | 66' | gol | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 393 · x 97.03 · ph playing · sc 1-1 · hud 1-1 |
| f25-min66-gol+0.5s.jpg | 66' | gol+0.5s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 913 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f26-min66-gioco.jpg | 66' | gioco |  | 989 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f27-min66-gol+1s.jpg | 66' | gol+1s | ⚽ Spada (GRA) segna! Pareggio ristabilito! | 375 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f28-min68-scena-apre.jpg | 68' | scena-apre |  | 1155 · x 91.86 · ph hl_intro · sc 1-1 · hud 1-1 |
| f29-min68-portiere.jpg | 68' | portiere | 🧤 Il portiere avversario è in serata di grazia. | 162 · x 77.26 · ph hl_result · sc 1-1 · hud 1-1 |
| f30-min68-scena-esito.jpg | 68' | scena-esito |  | 129 · x 89 · ph playing · sc 1-1 · hud 1-1 |
| f31-min70-gioco.jpg | 70' | gioco |  | 33 · x 74.08 · ph playing · sc 1-1 · hud 1-1 |
| f32-min77-scena-apre.jpg | 77' | scena-apre |  | 32 · x 58.24 · ph hl_intro · sc 1-1 · hud 1-1 |
| f33-min77-fermo.jpg | 77' | fermo | 🚩 Oltre la linea di un soffio: fuorigioco. | 1148 · x 59.72 · ph hl_result · sc 1-1 · hud 1-1 |
| f34-min77-gioco.jpg | 77' | gioco |  | 1068 · x 60.35 · ph hl_result · sc 1-1 · hud 1-1 |
| f35-min77-scena-esito.jpg | 77' | scena-esito |  | 1184 · x 60.01 · ph playing · sc 1-1 · hud 1-1 |
| f36-min83-fermo.jpg | 83' | fermo | ⏸️ Palla sul fondo della fascia: rimessa laterale per De Santis (POL). | 15 · x 58.87 · ph playing · sc 1-1 · hud 1-1 |
| f37-min83-occasione-apre.jpg | 83' | occasione-apre |  | 98 · x 48.76 · ph playing · sc 1-1 · hud 1-1 |
| f38-min86-tiro.jpg | 86' | tiro | 💥 Spada (POL) non ci pensa due volte: bordata da fuori! | 187 · x 40.45 · ph playing · sc 1-1 · hud 1-1 |
| f39-min87-gioco.jpg | 87' | gioco |  | 1069 · x 19.36 · ph playing · sc 1-1 · hud 1-1 |
| f40-min87-portiere.jpg | 87' | portiere | 🧤 Fontana (GRA) ci arriva in tuffo e la devia in angolo: che parata! | 544 · x 18.37 · ph playing · sc 1-1 · hud 1-1 |
| f41-min88-fermo.jpg | 88' | fermo | 🚩 Calcio d'angolo per Vallone (POL): palla sulla bandierina. | 610 · x 9.02 · ph playing · sc 1-1 · hud 1-1 |
