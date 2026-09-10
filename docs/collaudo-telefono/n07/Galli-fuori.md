# Collaudo da telefono — Galli fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 44% su 654 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 36% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 49% su 569 campioni · in volo 27% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 209 · fermo 29 · eroe 27 · portatore 24 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 3.8 / 18.1 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 0.7 / 14.5 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 37 in 1826 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 11 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 7 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 230 / 1247 ms | ≤ 500 ms |
| tagli di camera registrati | 26 | (informativo) |
| minuti per stato dello schermo | {"gioco":59,"palla-morta":14,"fermo":1,"ripresa":7,"calcio-inizio":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 75 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/2 · come le voleva il piano 2/2 | 0 |
| risultato | 1-1 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 24' | av 69 · avv. 3.1u · gk 29.4u | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → FALSA | 💥 Colombo (GRA) prova a sorprendere il portiere da lontanissimo! → ok |
| 89' | av 81.1 · avv. 4.2u · gk 22.3u | 💥 Colombo (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min18-gioco.jpg | 18' | gioco |  | 112 · x 62.31 · ph playing · sc 0-0 · hud 0-0 |
| f02-min19-occasione-apre.jpg | 19' | occasione-apre |  | 191 · x 61.23 · ph playing · sc 0-0 · hud 0-0 |
| f03-min23-tiro.jpg | 23' | tiro | 💥 Colombo (GRA) prova a sorprendere il portiere da lontanissimo! | 1076 · x 70.35 · ph playing · sc 0-0 · hud 0-0 |
| f04-min24-portiere.jpg | 24' | portiere | 🧤 Toti (POL) ci arriva in tuffo e la devia in angolo: che parata! | 387 · x 83.74 · ph playing · sc 0-0 · hud 0-0 |
| f05-min25-fermo.jpg | 25' | fermo | 🚩 Calcio d'angolo per Galli (GRA): palla sulla bandierina. | 822 · x 92.06 · ph playing · sc 0-0 · hud 0-0 |
| f06-min26-scena-apre.jpg | 26' | scena-apre |  | 730 · x 84.41 · ph hl_intro · sc 0-0 · hud 0-0 |
| f07-min26-portiere.jpg | 26' | portiere | 🧤 C'è arrivato! Il portiere legge la traiettoria e la toglie alto sinistra. | 1174 · x 89 · ph hl_result · sc 0-0 · hud 0-0 |
| f08-min26-gioco.jpg | 26' | gioco |  | 195 · x 92.25 · ph hl_result · sc 0-0 · hud 0-0 |
| f09-min26-scena-esito.jpg | 26' | scena-esito |  | 179 · x 89.01 · ph playing · sc 0-0 · hud 0-0 |
| f10-min34-gioco.jpg | 34' | gioco |  | 220 · x 22.62 · ph playing · sc 0-0 · hud 0-0 |
| f11-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 78 · x 35.76 · ph playing · sc 0-0 · hud 0-0 |
| f12-min46-gioco.jpg | 46' | gioco |  | 9 · x 46.25 · ph playing · sc 0-0 · hud 0-0 |
| f13-min50-occasione-apre.jpg | 50' | occasione-apre |  | 32 · x 57.91 · ph playing · sc 0-0 · hud 0-0 |
| f14-min53-tiro.jpg | 53' | tiro | 💥 Conclusione secca di Vallone (POL) dal limite: il pallone parte teso verso la porta! | 66 · x 27.15 · ph playing · sc 0-0 · hud 0-0 |
| f15-min58-gioco.jpg | 58' | gioco |  | 489 · x 20.82 · ph playing · sc 0-1 · hud 0-1 |
| f16-min59-scena-apre.jpg | 59' | scena-apre |  | 1155 · x 23.96 · ph hl_intro · sc 0-1 · hud 0-1 |
| f17-min59-scena-esito.jpg | 59' | scena-esito |  | 91 · x 36.79 · ph playing · sc 0-1 · hud 0-1 |
| f18-min61-gol.jpg | 61' | gol | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 77 · x 24.26 · ph playing · sc 0-1 · hud 0-1 |
| f19-min61-gol+0.5s.jpg | 61' | gol+0.5s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 280 · x 40.99 · ph playing · sc 0-1 · hud 0-1 |
| f20-min61-gol+1s.jpg | 61' | gol+1s | ✊ Gol subito, e Galli e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 5 · x 40.99 · ph playing · sc 0-1 · hud 0-1 |
| f21-min62-occasione-apre.jpg | 62' | occasione-apre |  | 120 · x 50 · ph playing · sc 0-1 · hud 0-1 |
| f22-min66-gioco.jpg | 66' | gioco |  | 979 · x 83.13 · ph playing · sc 0-1 · hud 0-1 |
| f23-min66-tiro.jpg | 66' | tiro | 💥 Incornata di Pecoraro (GRA) a botta sicura! | 1064 · x 83.62 · ph playing · sc 0-1 · hud 0-1 |
| f24-min69-gol.jpg | 69' | gol | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 788 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f25-min69-gol+0.5s.jpg | 69' | gol+0.5s | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 30 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f26-min69-gol+1s.jpg | 69' | gol+1s | ⚽ Pecoraro (GRA) segna! Pareggio ristabilito! | 769 · x 100.6 · ph playing · sc 1-1 · hud 1-1 |
| f27-min69-scena-apre.jpg | 69' | scena-apre |  | 918 · x 100.6 · ph hl_intro · sc 1-1 · hud 1-1 |
| f28-min69-portiere.jpg | 69' | portiere | 🧤 Il portiere avversario è in serata di grazia. | 153 · x 95 · ph hl_result · sc 1-1 · hud 1-1 |
| f29-min69-scena-esito.jpg | 69' | scena-esito |  | 230 · x 89.02 · ph playing · sc 1-1 · hud 1-1 |
| f30-min71-gioco.jpg | 71' | gioco |  | 672 · x 75.3 · ph playing · sc 1-1 · hud 1-1 |
| f31-min81-fermo.jpg | 81' | fermo | 🟡 Fallo tattico su Luca (POL): la ripartenza muore li'. Punizione per Leone (POL). | 34 · x 76.58 · ph playing · sc 1-1 · hud 1-1 |
| f32-min81-scena-apre.jpg | 81' | scena-apre |  | 12 · x 65 · ph hl_intro · sc 1-1 · hud 1-1 |
| f33-min81-gioco.jpg | 81' | gioco |  | 576 · x 65 · ph hl_intro · sc 1-1 · hud 1-1 |
| f34-min81-scena-esito.jpg | 81' | scena-esito |  | 1247 · x 98.45 · ph playing · sc 1-1 · hud 1-1 |
| f35-min84-occasione-apre.jpg | 84' | occasione-apre |  | 14 · x 63.7 · ph playing · sc 1-1 · hud 1-1 |
| f36-min87-gioco.jpg | 87' | gioco |  | 1000 · x 63.25 · ph playing · sc 1-1 · hud 1-1 |
| f37-min88-tiro.jpg | 88' | tiro | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! | 1098 · x 81.41 · ph playing · sc 1-1 · hud 1-1 |
