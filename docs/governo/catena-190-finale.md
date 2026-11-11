# Catena 190 finale — verifica 7.999.190

Ramo `catena/190-finale`, base HEAD 4f9363a (lavoro/190). Solo verifica, `CPM_CI_PAR=0`, un controllo alla volta. Un rosso è ripetuto una volta sola; «non giudicato» = rosso.

| n | controllo | uscita | secondi | esito / motivo | free / df prima |
|---|---|---|---|---|---|
| 1 | test:logic | 0 | 2 | VERDE | mem used 515/16086 free 13898 avail 15570 · disk used 10G avail 29G (26%) |
| 2 | save-compat | 0 | 9 | VERDE | mem used 728/16086 free 13684 avail 15357 · disk used 10G avail 29G (26%) |
| 3 | prossima-131 | 0 | 322 | VERDE | mem used 663/16086 free 13392 avail 15422 · disk used 10G avail 29G (26%) |
| 4 | privacy-134 | 0 | 49 | VERDE | mem used 589/16086 free 13455 avail 15496 · disk used 10G avail 29G (26%) |
| 5 | premiazione-132 | 0 | 327 | VERDE | mem used 908/16086 free 13135 avail 15177 · disk used 10G avail 29G (26%) |
| 6 | posa-sollevamento-191 | 0 | 74 | VERDE | mem used 603/16086 free 13440 avail 15482 · disk used 10G avail 29G (26%) |
| 7 | premiazione-palco-191 | 0 | 60 | VERDE | mem used 646/16086 free 13396 avail 15439 · disk used 10G avail 29G (26%) |
| 8 | presentazione-142 | 0 | 159 | VERDE | mem used 775/16086 free 13267 avail 15310 · disk used 10G avail 29G (26%) |
| 9 | rigore-139 | 0 | 440 | VERDE | mem used 800/16086 free 13241 avail 15286 · disk used 10G avail 29G (26%) |
| 10 | partita2d-141 | 0 | 210 | VERDE | mem used 561/16086 free 13486 avail 15524 · disk used 10G avail 29G (26%) |
| 11 | festa-57 | 0 | 450 | VERDE | mem used 653/16086 free 13394 avail 15432 · disk used 10G avail 29G (26%) |
| 12 | portiere-252 | 0 | 741 | VERDE | mem used 632/16086 free 13413 avail 15453 · disk used 10G avail 29G (26%) |
| 13 | contatto-103 | 0 | 687 | VERDE | mem used 639/16086 free 13406 avail 15446 · disk used 10G avail 29G (26%) |
| 14 | riserva-103 | 0 | 621 | VERDE | mem used 594/16086 free 13450 avail 15491 · disk used 10G avail 29G (26%) |
| 15 | panchina-127 | 0 | 879 | VERDE | mem used 581/16086 free 13461 avail 15504 · disk used 10G avail 29G (26%) |
| 16 | folla | 0 | 150 | VERDE | mem used 605/16086 free 13438 avail 15480 · disk used 10G avail 29G (26%) |
| 17 | bambini-124 | 0 | 845 | VERDE | mem used 692/16086 free 13350 avail 15393 · disk used 10G avail 29G (26%) |
| 18 | angolo-117 | 0 | 719 | VERDE | mem used 926/16086 free 13116 avail 15160 · disk used 10G avail 29G (26%) |
| 19 | volee-d3-119 | 0 | 224 | VERDE | mem used 596/16086 free 13445 avail 15489 · disk used 10G avail 29G (26%) |
| 20 | distanze-126 | 124 → 124 | 2400 + 2400 | ROSSO — giro1: verde s5 seme 2 fine ceremony (fine, 405 s) scene 6 contatti 6 ⏎ verde s5 seme 4 fine ended (fine, 433 s) scene 6 contatti 6 ⏎ verde s5 seme 3 fine ended (fine, 495 s) scene 7 contatti 7 ⏎ verde s5 seme 5 fine ended (fine, 651 s) scene 9 contatti 9 ⏎ verde s5 seme 7 fine ended (fine, 388 s) scene 5 contatti 5 ⏎ verde s5 seme 6 fine ceremony (fine, 467 s) scene 7 contatti 7 ‖ giro2:   tiri             n  40 · mediana 20.9 m · p90 27.7 · max 29 · oltre 30 m: 0 ⏎   tiri dal limite  n  11 · mediana 19.2 m · p90 20.5 · max 20.9 · oltre 22 m: 0 ⏎   colpi di testa   n   8 · mediana 11.1 m · p90 14 · max 14 · oltre 16.5 m: 0 ⏎     di cui fra-linee n  19 · mediana 26.8 m · p90 28.9 · max 29 · oltre 30 m: 0 ⏎   partite finite 15/24 · campione minimo: tiri 40, dal limite 8, teste 6 ⏎ NON GIUDICATO (= ROSSO): campione sotto il minimo — partite finite 15/24 | mem used 604/16086 free 13437 avail 15481 · disk used 10G avail 29G (26%) |
| 21 | tabellone-117 | 0 | 305 | VERDE | mem used 704/16086 free 13317 avail 15381 · disk used 10G avail 29G (26%) |
| 22 | tabellino-228 | 0 | 296 | VERDE | mem used 624/16086 free 13395 avail 15461 · disk used 10G avail 29G (26%) |
| 23 | twa-120 | 0 | 37 | VERDE | mem used 594/16086 free 13425 avail 15491 · disk used 10G avail 29G (26%) |
| 24 | sw-cache-120 | 0 | 88 | VERDE | mem used 815/16086 free 13198 avail 15270 · disk used 10G avail 29G (26%) |
| 25 | albo-122 | 0 | 118 | VERDE | mem used 887/16086 free 12985 avail 15198 · disk used 11G avail 29G (27%) |
| 26 | intro-118 | 0 | 109 | VERDE | mem used 938/16086 free 12935 avail 15147 · disk used 11G avail 29G (27%) |
| 27 | altezza-114 | 0 | 396 | VERDE | mem used 628/16086 free 13243 avail 15457 · disk used 11G avail 29G (27%) |
| 28 | flussi-115 | 0 | 802 | VERDE | mem used 852/16086 free 13019 avail 15233 · disk used 11G avail 29G (27%) |
| 29 | collaudo-110 | 0 | 313 | VERDE | mem used 633/16086 free 13237 avail 15452 · disk used 11G avail 29G (27%) |
| 30 | scorri-113 | 0 | 136 | VERDE | mem used 657/16086 free 13213 avail 15428 · disk used 11G avail 29G (27%) |
| 31 | moduli-112 | 0 | 325 | VERDE | mem used 787/16086 free 13083 avail 15298 · disk used 11G avail 29G (27%) |
| 32 | pc-tablet-292 | 0 | 705 | VERDE | mem used 757/16086 free 13113 avail 15328 · disk used 11G avail 29G (27%) |
| 33 | griglia-mobile | 0 | 202 | VERDE | mem used 664/16086 free 13205 avail 15421 · disk used 11G avail 29G (27%) |
| 34 | design-system | 0 | 0 | VERDE | mem used 767/16086 free 13103 avail 15318 · disk used 11G avail 29G (27%) |
| 35 | partita-v2 | 0 | 518 | VERDE | mem used 712/16086 free 13157 avail 15373 · disk used 11G avail 29G (27%) |
| 36 | partita2d-297 | 0 | 167 | VERDE | mem used 629/16086 free 13240 avail 15456 · disk used 11G avail 29G (27%) |
| 37 | spalti-109 | 0 | 343 | VERDE | mem used 627/16086 free 13242 avail 15458 · disk used 11G avail 29G (27%) |
| 38 | validate-situations | 0 | 628 | VERDE | mem used 818/16086 free 13050 avail 15267 · disk used 11G avail 29G (27%) |
| 39 | scena3d-96 | 0 | 1441 | VERDE | mem used 762/16086 free 13096 avail 15323 · disk used 11G avail 29G (27%) |
| 40 | partita-vera | 0 | 377 | VERDE | mem used 620/16086 free 13237 avail 15465 · disk used 11G avail 29G (27%) |
