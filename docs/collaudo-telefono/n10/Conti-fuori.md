# Collaudo da telefono — Conti fuori · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 42% su 763 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 41% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 47% su 630 campioni · in volo 19% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 267 · eroe 51 · portatore 13 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 5.3 / 20.7 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 1.6 / 24.5 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 39 in 1870 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 11 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 5 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 559 / 1302 ms | ≤ 500 ms |
| tagli di camera registrati | 9 | (informativo) |
| minuti per stato dello schermo | {} | palla morta + fermo ≤ 15 |
| righe di cronaca | 63 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/0 · come le voleva il piano 0/0 | 0 |
| risultato | 4-1 | |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min13-scena-apre.jpg | 13' | scena-apre |  | 155 · x 63.74 · ph hl_intro · sc 0-0 · hud 0-0 |
| f02-min13-gioco.jpg | 13' | gioco |  | 1244 · x 60.47 · ph hl_result · sc 0-0 · hud 0-0 |
| f03-min13-scena-esito.jpg | 13' | scena-esito |  | 775 · x 56.71 · ph playing · sc 0-0 · hud 0-0 |
| f04-min18-occasione-apre.jpg | 18' | occasione-apre |  | 91 · x 58.87 · ph playing · sc 0-0 · hud 0-0 |
| f05-min22-tiro.jpg | 22' | tiro | 💥 Colombo (GRA) si gira e lascia partire il destro dal vertice! | 1199 · x 68.72 · ph playing · sc 0-0 · hud 0-0 |
| f06-min24-gol.jpg | 24' | gol | ⚽ RETE! Colombo (GRA) non sbaglia su assist di Ferrari (GRA)! | 388 · x 75.59 · ph playing · sc 1-0 · hud 1-0 |
| f07-min24-gol+0.5s.jpg | 24' | gol+0.5s | ⚽ RETE! Colombo (GRA) non sbaglia su assist di Ferrari (GRA)! | 904 · x 100.6 · ph playing · sc 1-0 · hud 1-0 |
| f08-min24-gol+1s.jpg | 24' | gol+1s | ⚽ RETE! Colombo (GRA) non sbaglia su assist di Ferrari (GRA)! | 396 · x 100.6 · ph playing · sc 1-0 · hud 1-0 |
| f09-min24-scena-apre.jpg | 24' | scena-apre |  | 623 · x 100 · ph hl_intro · sc 1-0 · hud 1-0 |
| f10-min24-gioco.jpg | 24' | gioco |  | 13 · x 100 · ph hl_intro · sc 1-0 · hud 1-0 |
| f11-min24-scena-esito.jpg | 24' | scena-esito |  | 765 · x 89.02 · ph playing · sc 1-0 · hud 1-0 |
| f12-min30-gioco.jpg | 30' | gioco |  | 249 · x 42.85 · ph playing · sc 1-0 · hud 1-0 |
| f13-min31-occasione-apre.jpg | 31' | occasione-apre |  | 446 · x 43.12 · ph playing · sc 1-0 · hud 1-0 |
| f14-min36-tiro.jpg | 36' | tiro | 💥 Conclusione secca di Vallone (POL) dal limite! | 707 · x 28.69 · ph playing · sc 1-0 · hud 1-0 |
| f15-min37-gol.jpg | 37' | gol | 😞 Vallone (POL) segna su assist di Marchetti (POL): gol degli avversari. | 1158 · x 36.11 · ph playing · sc 1-1 · hud 1-1 |
| f16-min37-gol+0.5s.jpg | 37' | gol+0.5s | 😞 Vallone (POL) segna su assist di Marchetti (POL): gol degli avversari. | 424 · x 45.96 · ph playing · sc 1-1 · hud 1-1 |
| f17-min37-gol+1s.jpg | 37' | gol+1s | 😞 Vallone (POL) segna su assist di Marchetti (POL): gol degli avversari. | 1181 · x 45.96 · ph playing · sc 1-1 · hud 1-1 |
| f18-min39-gol.jpg | 39' | gol | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 784 · x 51.13 · ph playing · sc 1-1 · hud 1-1 |
| f19-min40-gol+0.5s.jpg | 40' | gol+0.5s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 1302 · x 51.13 · ph playing · sc 1-1 · hud 1-1 |
| f20-min40-gol+1s.jpg | 40' | gol+1s | ✊ Gol subito, e Conti e' il primo ad andare a prendere il pallone in rete: lo porta a cent | 684 · x 51 · ph playing · sc 1-1 · hud 1-1 |
| f21-min41-occasione-apre.jpg | 41' | occasione-apre |  | 58 · x 49.77 · ph playing · sc 1-1 · hud 1-1 |
| f22-min42-gioco.jpg | 42' | gioco |  | 464 · x 48.76 · ph playing · sc 1-1 · hud 1-1 |
| f23-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 559 · x 49.48 · ph playing · sc 1-1 · hud 1-1 |
| f24-min52-tiro.jpg | 52' | tiro | 💥 Conti non ci pensa due volte: tiro da lontano! | 1232 · x 57.38 · ph playing · sc 1-1 · hud 1-1 |
| f25-min53-gioco.jpg | 53' | gioco |  | 1182 · x 97.21 · ph playing · sc 1-1 · hud 2-1 |
| f26-min54-gol.jpg | 54' | gol | ⚽ RETE! Conti non sbaglia su assist di Scotti (GRA)! | 100 · x 100.6 · ph playing · sc 2-1 · hud 2-1 |
| f27-min54-gol+0.5s.jpg | 54' | gol+0.5s | ⚽ RETE! Conti non sbaglia su assist di Scotti (GRA)! | 629 · x 100.6 · ph playing · sc 2-1 · hud 2-1 |
| f28-min54-gol+1s.jpg | 54' | gol+1s | ⚽ RETE! Conti non sbaglia su assist di Scotti (GRA)! | 169 · x 100.25 · ph playing · sc 2-1 · hud 2-1 |
| f29-min55-scena-apre.jpg | 55' | scena-apre |  | 760 · x 100 · ph hl_intro · sc 2-1 · hud 2-1 |
| f30-min55-gol.jpg | 55' | gol | ⚽ Rete spettacolare! | 747 · x 99.15 · ph hl_result · sc 2-1 · hud 3-1 |
| f31-min55-gol.jpg | 55' | gol | ⚽ Conti segna! 3-1. | 899 · x 99.15 · ph hl_result · sc 2-1 · hud 3-1 |
| f32-min55-gol+0.5s.jpg | 55' | gol+0.5s | ⚽ Conti segna! 3-1. | 38 · x 100.6 · ph hl_result · sc 2-1 · hud 3-1 |
| f33-min55-gol+1s.jpg | 55' | gol+1s | ⚽ Conti segna! 3-1. | 706 · x 100.6 · ph hl_result · sc 2-1 · hud 3-1 |
| f34-min55-gioco.jpg | 55' | gioco |  | 957 · x 99.15 · ph hl_result · sc 2-1 · hud 3-1 |
| f35-min55-scena-esito.jpg | 55' | scena-esito |  | 134 · x 99.15 · ph playing · sc 2-1 · hud 3-1 |
| f36-min67-gioco.jpg | 67' | gioco |  | 22 · x 35.23 · ph playing · sc 3-1 · hud 3-1 |
| f37-min70-tiro.jpg | 70' | tiro | 💥 Marchetti (POL) si gira e lascia partire il destro dal vertice! | 131 · x 22.08 · ph playing · sc 3-1 · hud 3-1 |
| f38-min70-occasione-apre.jpg | 70' | occasione-apre |  | 131 · x 19.62 · ph playing · sc 3-1 · hud 3-1 |
| f39-min71-portiere.jpg | 71' | portiere | 🧤 Fontana (GRA) ci arriva in tuffo e devia in angolo: che parata! | 169 · x 19.97 · ph playing · sc 3-1 · hud 3-1 |
| f40-min78-tiro.jpg | 78' | tiro | 💥 Neri (GRA) non ci pensa due volte: tiro da lontano! | 753 · x 11.29 · ph playing · sc 3-1 · hud 3-1 |
| f41-min78-gioco.jpg | 78' | gioco |  | 160 · x 55.06 · ph playing · sc 3-1 · hud 3-1 |
| f42-min81-gol.jpg | 81' | gol | ⚽ RETE! Neri (GRA) non sbaglia su assist di Vallone (POL)! | 131 · x 100.6 · ph playing · sc 4-1 · hud 4-1 |
| f43-min81-gol+0.5s.jpg | 81' | gol+0.5s | ⚽ RETE! Neri (GRA) non sbaglia su assist di Vallone (POL)! | 647 · x 100.6 · ph playing · sc 4-1 · hud 4-1 |
| f44-min81-gol+1s.jpg | 81' | gol+1s | ⚽ RETE! Neri (GRA) non sbaglia su assist di Vallone (POL)! | 223 · x 100.6 · ph playing · sc 4-1 · hud 4-1 |
