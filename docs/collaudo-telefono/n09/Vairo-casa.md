# Collaudo da telefono — Vairo casa · seme 4242

Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e' un Android vero: GPU, tocco e prestazioni reali restano fuori.

| misura | valore | banda |
|---|---|---|
| pallone reso ai piedi del padrone logico (≤3u) | 35% su 1173 campioni | ≥ 60% verde · < 40% rosso |
| campioni con un padrone dichiarato dalla simulazione | 63% del gioco vivo | (informativo: l'etichetta non deve sparire per alzare il numero sopra) |
| …di cui a palla A TERRA (arco spento) | 39% su 843 campioni · in volo 38% del tempo | ≥ 75% a terra |
| chi scrive il pallone quando e' a terra e lontano dal padrone | nessuno 379 · fermo 118 · portatore 14 · eroe 1 | (diagnostica S1) |
| distanza reso↔padrone, mediana / p90 | 7.5 / 21.9 u | mediana ≤ 3u |
| scarto pallone reso↔logico, mediana / p90 | 1.2 / 14.9 u | p90 ≤ 8u |
| salti del pallone (> 8u in ≤ 110 ms) | 53 in 1871 campioni | 0 fuori dagli stacchi |
| fotogrammi al secondo senza sonda (primi 8 s) | 13 | ≥ 30 |
| fotogrammi al secondo con la sonda (media partita) | 8 (screencast acceso) | (informativo) |
| eta' del fotogramma salvato, mediana / max | 669 / 1087 ms | ≤ 500 ms |
| tagli di camera registrati | 7 | (informativo) |
| minuti per stato dello schermo | {"gioco":61,"palla-morta":17,"ripresa":3,"calcio-inizio":2,"fermo":4} | palla morta + fermo ≤ 15 |
| righe di cronaca | 89 | 70-110 |
| frasi del tiro di piano smentite dal campo (zona, avversario <4u) | emesse 0/4 · come le voleva il piano 1/4 | 0 |
| risultato | 1-0 | |

## Le parole del tiro e il campo (7.856)

| minuto | geometria al tiro | frase del piano | frase emessa |
|---|---|---|---|
| 12' | av 81.6 · avv. 3.8u · gk 15.4u | 💥 Colombo (GRA) da due passi, tutto solo davanti alla porta! → FALSA | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! → ok |
| 28' | av 57.3 · avv. 4.7u · gk 40.9u | 💥 Luca (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Luca (POL) non ci pensa due volte: bordata da fuori! → ok |
| 58' | av 56 · avv. 12.6u · gk 62.4u | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! → ok |
| 78' | av 55.1 · avv. 5.5u · gk 44.8u | 💥 Santis (POL) prova a sorprendere il portiere da lontanissimo! → ok | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! → ok |

## Fotogrammi

| # | minuto | evento | riga | eta' del fotogramma (ms) |
|---|---|---|---|---|
| f01-min06-occasione-apre.jpg | 6' | occasione-apre |  | 59 · x 48.79 · ph playing · sc 0-0 · hud 0-0 |
| f02-min11-tiro.jpg | 11' | tiro | 💥 Colombo (GRA) si gira sul limite e lascia partire il destro! | 886 · x 81.2 · ph playing · sc 0-0 · hud 0-0 |
| f03-min12-portiere.jpg | 12' | portiere | 🧤 Presa sicura di Toti (POL): blocca a terra e fa ripartire i suoi. | 193 · x 81.59 · ph playing · sc 0-0 · hud 0-0 |
| f04-min14-portiere.jpg | 14' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Toti (POL). | 902 · x 89.29 · ph playing · sc 0-0 · hud 0-0 |
| f05-min18-gioco.jpg | 18' | gioco |  | 103 · x 78.59 · ph playing · sc 0-0 · hud 0-0 |
| f06-min24-occasione-apre.jpg | 24' | occasione-apre |  | 123 · x 41.92 · ph playing · sc 0-0 · hud 0-0 |
| f07-min27-tiro.jpg | 27' | tiro | 💥 Luca (POL) non ci pensa due volte: bordata da fuori! | 475 · x 41.78 · ph playing · sc 0-0 · hud 0-0 |
| f08-min28-portiere.jpg | 28' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 935 · x 20.77 · ph playing · sc 0-0 · hud 0-0 |
| f09-min29-gioco.jpg | 29' | gioco |  | 1087 · x 9.63 · ph playing · sc 0-0 · hud 0-0 |
| f10-min30-portiere.jpg | 30' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 389 · x 10.75 · ph playing · sc 0-0 · hud 0-0 |
| f11-min31-scena-apre.jpg | 31' | scena-apre |  | 1087 · x 17.55 · ph hl_intro · sc 0-0 · hud 0-0 |
| f12-min31-gioco.jpg | 31' | gioco |  | 835 · x 71.74 · ph hl_result · sc 0-0 · hud 0-0 |
| f13-min31-tiro.jpg | 31' | tiro | 💥 Secondo tempo dell'azione: conclusione secca, gol! | 830 · x 99.15 · ph hl_result · sc 0-0 · hud 1-0 |
| f14-min31-gol.jpg | 31' | gol | ⚽ Vairo segna su assist di Bruno! 1-0. | 983 · x 99.15 · ph hl_result · sc 0-0 · hud 1-0 |
| f15-min31-gol+0.5s.jpg | 31' | gol+0.5s | ⚽ Vairo segna su assist di Bruno! 1-0. | 34 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f16-min31-gol+1s.jpg | 31' | gol+1s | ⚽ Vairo segna su assist di Bruno! 1-0. | 723 · x 100.6 · ph hl_result · sc 0-0 · hud 1-0 |
| f17-min31-scena-esito.jpg | 31' | scena-esito |  | 129 · x 99.15 · ph playing · sc 0-0 · hud 1-0 |
| f18-min38-gioco.jpg | 38' | gioco |  | 243 · x 16.56 · ph playing · sc 1-0 · hud 1-0 |
| f19-min41-tiro.jpg | 41' | tiro | 💥 La ripartenza si chiude col tiro di Lombardi (GRA): Toti (POL) devia in tuffo! | 53 · x 32.78 · ph playing · sc 1-0 · hud 1-0 |
| f20-min41-scena-apre.jpg | 41' | scena-apre |  | 113 · x 80.32 · ph hl_intro · sc 1-0 · hud 1-0 |
| f21-min41-fermo.jpg | 41' | fermo | 🚩 Oltre la linea di un soffio: fuorigioco. | 1085 · x 70.12 · ph hl_result · sc 1-0 · hud 1-0 |
| f22-min41-scena-esito.jpg | 41' | scena-esito |  | 713 · x 67.22 · ph playing · sc 1-0 · hud 1-0 |
| f23-min42-gioco.jpg | 42' | gioco |  | 964 · x 47.04 · ph playing · sc 1-0 · hud 1-0 |
| f24-min44-fermo.jpg | 44' | fermo | ⏸️ Duplice fischio: squadre negli spogliatoi. | 241 · x 43 · ph playing · sc 1-0 · hud 1-0 |
| f25-min51-occasione-apre.jpg | 51' | occasione-apre |  | 19 · x 58.75 · ph playing · sc 1-0 · hud 1-0 |
| f26-min54-gioco.jpg | 54' | gioco |  | 682 · x 44.01 · ph playing · sc 1-0 · hud 1-0 |
| f27-min57-tiro.jpg | 57' | tiro | 💥 Vallone (POL) prova a sorprendere il portiere da lontanissimo! | 738 · x 38.69 · ph playing · sc 1-0 · hud 1-0 |
| f28-min58-portiere.jpg | 58' | portiere | 🧤 Fontana (GRA) ci arriva in tuffo e la devia in angolo: che parata! | 95 · x 18.48 · ph playing · sc 1-0 · hud 1-0 |
| f29-min60-fermo.jpg | 60' | fermo | 🚩 Calcio d'angolo per Vallone (POL): palla sulla bandierina. | 669 · x 9.92 · ph playing · sc 1-0 · hud 1-0 |
| f30-min61-tiro.jpg | 61' | tiro | 💥 Traversone dalla bandierina: mischia in area! | 458 · x 3.88 · ph playing · sc 1-0 · hud 1-0 |
| f31-min66-gioco.jpg | 66' | gioco |  | 955 · x 21.4 · ph playing · sc 1-0 · hud 1-0 |
| f32-min72-occasione-apre.jpg | 72' | occasione-apre |  | 185 · x 41.73 · ph playing · sc 1-0 · hud 1-0 |
| f33-min77-gioco.jpg | 77' | gioco |  | 901 · x 43.62 · ph playing · sc 1-0 · hud 1-0 |
| f34-min78-tiro.jpg | 78' | tiro | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! | 980 · x 43.62 · ph playing · sc 1-0 · hud 1-0 |
| f35-min78-portiere.jpg | 78' | portiere | 🧤 Presa sicura di Fontana (GRA): blocca a terra e fa ripartire i suoi. | 231 · x 20.71 · ph playing · sc 1-0 · hud 1-0 |
| f36-min80-portiere.jpg | 80' | portiere | 🧤 Pallone sul fondo: rinvio dal fondo per Fontana (GRA). | 1057 · x 10.78 · ph playing · sc 1-0 · hud 1-0 |
| f37-min84-fermo.jpg | 84' | fermo | 🟡 Fallo tattico su Bruno (GRA): la ripartenza muore li'. Punizione per Lombardi (GRA). | 201 · x 22.63 · ph playing · sc 1-0 · hud 1-0 |
