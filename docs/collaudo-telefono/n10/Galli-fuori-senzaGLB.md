# Collaudo da telefono — Galli fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 57% su 1075 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 56% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 61% su 903 campioni · in volo 12% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 242 · eroe 67 · portatore 43 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 1.4 / 14.4 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 1.1 / 13.6 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 18 in 1920 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 15 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 10 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 124 / 411 ms | ≤ 500 ms |
| tagli di camera registrati | 4 | (informativo) |
| minuti per stato dello schermo | {"calcio-inizio":3,"gioco":82,"ripresa":2} | palla morta + fermo ≤ 15 |
| righe di cronaca | 70 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/0 · come le voleva il piano 0/0 | 0 |
| risultato | 3-0 | |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min16-gioco.jpg | 16' | gioco |  | 55 · x 49.14 · ph playing · sc 0-0 · hud 0-0 |
| f02-min28-gioco.jpg | 28' | gioco |  | 64 · x 46.96 · ph playing · sc 0-0 · hud 0-0 |
| f03-min29-scena-apre.jpg | 29' | scena-apre |  | 29 · x 58.57 · ph hl_intro · sc 0-0 · hud 0-0 |
| f04-min29-gol.jpg | 29' | gol | ⚽ Rete spettacolare! | 149 · x 98.59 · ph hl_result · sc 0-0 · hud 1-0 |
| f05-min29-gol.jpg | 29' | gol | ⚽ Galli segna su assist di Colombo! 1-0. | 107 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f06-min29-gol+0.5s.jpg | 29' | gol+0.5s | ⚽ Galli segna su assist di Colombo! 1-0. | 274 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f07-min29-gol+1s.jpg | 29' | gol+1s | ⚽ Galli segna su assist di Colombo! 1-0. | 48 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f08-min29-scena-esito.jpg | 29' | scena-esito |  | 60 · x 99.91 · ph playing · sc 0-0 · hud 1-0 |
| f09-min34-gioco.jpg | 34' | gioco |  | 126 · x 64.61 · ph playing · sc 1-0 · hud 1-0 |
| f10-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 149 · x 43.59 · ph playing · sc 1-0 · hud 1-0 |
| f11-min46-gioco.jpg | 46' | gioco |  | 124 · x 50.73 · ph playing · sc 1-0 · hud 1-0 |
| f12-min47-occasione-apre.jpg | 47' | occasione-apre |  | 187 · x 53.05 · ph playing · sc 1-0 · hud 1-0 |
| f13-min58-gioco.jpg | 58' | gioco |  | 153 · x 45.86 · ph playing · sc 1-0 · hud 1-0 |
| f14-min59-tiro.jpg | 59' | tiro | 💥 Galli prova la bordata da fuori! | 97 · x 58.04 · ph playing · sc 1-0 · hud 1-0 |
| f15-min60-gol.jpg | 60' | gol | ⚽ GOOOL! Galli insacca su assist di Neri (GRA) e fa esplodere lo stadio! | 131 · x 100.6 · ph playing · sc 2-0 · hud 2-0 |
| f16-min60-gol+0.5s.jpg | 60' | gol+0.5s | ⚽ GOOOL! Galli insacca su assist di Neri (GRA) e fa esplodere lo stadio! | 97 · x 100.6 · ph playing · sc 2-0 · hud 2-0 |
| f17-min60-gol+1s.jpg | 60' | gol+1s | ⚽ GOOOL! Galli insacca su assist di Neri (GRA) e fa esplodere lo stadio! | 411 · x 100 · ph playing · sc 2-0 · hud 2-0 |
| f18-min61-scena-apre.jpg | 61' | scena-apre |  | 150 · x 100 · ph hl_intro · sc 2-0 · hud 2-0 |
| f19-min61-tiro.jpg | 61' | tiro | 💥 GOOOOOL! Folla in delirio! | 56 · x 99.15 · ph hl_result · sc 2-0 · hud 3-0 |
| f20-min61-gol.jpg | 61' | gol | ⚽ Galli segna su assist di Pecoraro! 3-0. | 133 · x 99.15 · ph hl_result · sc 2-0 · hud 3-0 |
| f21-min61-gol+0.5s.jpg | 61' | gol+0.5s | ⚽ Galli segna su assist di Pecoraro! 3-0. | 116 · x 100.6 · ph hl_result · sc 2-0 · hud 3-0 |
| f22-min61-gol+1s.jpg | 61' | gol+1s | ⚽ Galli segna su assist di Pecoraro! 3-0. | 246 · x 100.6 · ph hl_result · sc 2-0 · hud 3-0 |
| f23-min61-scena-esito.jpg | 61' | scena-esito |  | 257 · x 99.18 · ph playing · sc 2-0 · hud 3-0 |
| f24-min65-gioco.jpg | 65' | gioco |  | 1 · x 46.88 · ph playing · sc 3-0 · hud 3-0 |
| f25-min77-gioco.jpg | 77' | gioco |  | 57 · x 19.47 · ph playing · sc 3-0 · hud 3-0 |
