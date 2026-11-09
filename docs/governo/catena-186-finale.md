# Catena 186-finale — verifica sul build 7.999.186 (HEAD 4399b92, check-src allineato)

Sessione di sola verifica. Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium.

| # | controllo | uscita | durata (s) | braccio / motivo (righe finali) | free / df |
|---|---|---|---|---|---|
| 1 | logic | 0 | 3 | # todo 0 # duration_ms 3037.406304  | free=14963/16086MB df=29G libero |
| 2 | save-compat | 0 | 12 | === SAVE-COMPAT === 12 pass · 0 fail ✅ PASS  | free=14977/16086MB df=29G libero |
| 3 | replay | 0 | 48 | replay scritti → tests/visual/out/validate/replay · 8 highlight ✅ PASS — replay completi e coerenti  | free=14630/16086MB df=29G libero |
| 4 | bambini-124 | 0 | 903 | ROSSO (__CPM_NO_G124) rosso-rosso: {"n":44,"errMax":72,"es":[{"i":0,"casa":true,"n":"HyperShirt","exp":[0,188,212],"got":[0,188,212]},{"i":0,"casa":true,"n":"HyperShorts","exp":[24,24,38],"got":[86,86,108]}]} ✅ bambini-124 verde (e il rosso si vede)  | free=14587/16086MB df=29G libero |
| 5 | angolo-117 | 0 | 859 | ROSSO (__CPM_NO_G121H+C+M): 2 casi in area · girati (>35°) 2 ✅ angolo-117 verde (e il rosso si vede)  | free=13156/16086MB df=29G libero |
| 6 | volee-d3-119 | 0 | 320 | VERDE ["angolo-lontano-48-50:0.68","angolo-lontano-70-80:0.62","cross-area-90-54:0.39"] · ROSSO ["angolo-lontano-48-50:6.98","angolo-lontano-70-80:9.18","cross-area-90-54:0.34"] ✅ volee-d3-119 verde (e il rosso si vede)  | free=11380/16086MB df=29G libero |
| 7 | distanze-126 | 0 | 2595 |   partite finite 24/24 · campione minimo: tiri 40, dal limite 8, teste 6 VERDE: nessun tiro > 30 m, nessun «dal limite» > 22 m, nessuna testa > 16.5 m  | free=14521/16086MB df=29G libero |
| 8 | tabellone-117 | 0 | 319 | {"percorso":"ripresa","rosso":false,"err":null,"prima":{"score":{"home":1,"away":0},"motore":{"home":1,"away":0},"log":1,"ev":["home"],"t216":null,"r117":null,"min":11},"snap":{"clock":11,"score":{"home":1,"away":0},"g117":true},"rientro":{"score":{"home":1,"a | free=14418/16086MB df=29G libero |
| 9 | tabellino-228 | 0 | 310 | k4 rosso: tabellino 0-4 (mio-loro), tabellone 3-0, motore 4-0, golLog [{"min":52,"tick":1211,"lato":"home","scena":true,"chi":9},{"min":52,"tick":1211,"lato":"home","scena":true,"chi":21},{"min":65,"tick":1489,"lato":"home","scena":true,"chi":21},{"min":93,"ti | free=14515/16086MB df=29G libero |
| 10 | twa-120 | 0 | 43 |  twa-120 ✅ VERDE — 12/12 controlli · nessun motivo  | free=14501/16086MB df=29G libero |
| 11 | sw-cache-120 | 0 | 93 |  sw-cache-120 [rosso] ✅ — atteso: seconda apertura senza rete che NON monta (comportamento di prima)  | free=14410/16086MB df=29G libero |
| 12 | albo-122 | 0 | 149 | ✅ rosso: con __CPM_NO_G122 il guardiano boccia l'albo di prima BRACCIO verde+rosso · MOTIVO verde: 0 difetti · rosso: 6 (es. t360 · riepilogo assente (albo di prima))  | free=14074/16086MB df=29G libero |
| 13 | intro-118 | 0 | 115 | intro-118 VERDE BRACCIO: verde  | free=14240/16086MB df=29G libero |
| 14 | altezza-114 | 0 | 463 |  PASS altezza-114 (vuoto <= 12% o pagina che scorre, tocco >= 44) — bracci verde+rosso  | free=14287/16086MB df=29G libero |
| 15 | flussi-115 | 0 | 829 | flussi-115 · 51 controlli · 1 OK · 50 NO · 0 non giudicati braccio ROSSO: atteso rosso — cade su tutti i 17 punti (50 controlli rossi)  | free=14174/16086MB df=29G libero |
| 16 | collaudo-110 | 1 | 344 | ❌ collaudo-110 NON OK braccio: verde+rosso · motivo: almeno un difetto non torna (vedi sopra)  — ROSSO in entrambe le passate (1ª 352s, 2ª 344s): braccio VERDE, G180-17 pc: «banner d'esito: 2 campioni, 0 con la scatola fuori dal campo» (campioni insufficienti, verde 2/3); resto verde. Identico nelle due passate | free=14295/16086MB df=29G libero |
| 17 | scorri-113 | 0 | 171 | ✅ rosso: con __CPM_NO_G113 resta in basso (il guardiano lo vede) BRACCIO verde+rosso · MOTIVO verde: 0 difetti · rosso: 18 (es. t360 menù Stagione→Home: 590)  | free=14276/16086MB df=29G libero |
| 18 | moduli-112 | 0 | 378 | [rosso] tel ata(4-2-3-1) vs fio(3-5-2) a capo 2 · rosa ["4-3-3","4-3-3"] · anteprima ["4-3-3","4-3-3"] · campo {"casa":"4-3-3","ospite":"4-3-3"} · motore {"casa":"4-3-3","ospite":"4-3-3"} · preset undefined / undefined · fuori posto 0 · trama null ✅ m | free=14196/16086MB df=29G libero |
| 19 | pc-tablet-292 | 0 | 790 |   ✅ il rosso (la 177) fa cadere larghezza, tocco, tasti e striscia nel campo PC-TABLET-292: ✅ VERDE  | free=14246/16086MB df=29G libero |
| 20 | griglia-mobile | 0 | 217 | → docs/collaudo-grafico/g0/REPORT.md · docs/collaudo-grafico/g0/dati.json · 65 scatti NON misurato: prepartita: playMatch → nomatch  — uscita 0; riga finale del log: «NON misurato: prepartita: playMatch → nomatch» (dichiarato dal gioco, non un rosso) | free=14280/16086MB df=29G libero |
| 21 | partita-v2 | 0 | 563 |   ✗ CON pc:post: FISCHIO FINALE 1.70:1 (11px) / FC Altoadige Primavera 2.55:1 (15px) / 0–1 2.55:1 (64px) ROSSO ATTESO OK: col tema di prova a basso contrasto cade PAL su ogni schermata e CON in ogni formato  | free=14243/16086MB df=29G libero |
| 22 | partita2d-297 | 0 | 189 |  ✅ partita2d-297 VERDE  | free=14274/16086MB df=29G libero |
| 23 | validate-situations | 0 | 664 |  ✅ PASS  | free=14266/16086MB df=29G libero |
| 24 | scena3d-96 | 0 | 1668 | scene giudicate 31/31 · rossi per punto {} · errori di pagina 0 ✓ scena3d-96 VERDE  | free=14249/16086MB df=29G libero |
| 25 | partita-vera | 0 | 507 | ✅ PARTITA-VERA OK — le bande d'accettazione tengono.   — riga 21 del log: «non giudicabile (campione sotto minimo) tabellone — gol raccontati 0-3 · punteggio finale 0-0 su 0 partite» (un solo criterio non giudicato, nessun rosso) | free=14268/16086MB df=29G libero |
| 26 | highlight-95 | 0 | 4035 |   · D1 s1/1234 «🔁 Uno-due con LUZI»: passaggio arrivato ma chiave intercept ok=false ✅ highlight-95 verde (e il rosso si vede)  — braccio verde: 0 difetti (D3DIAG riga 39 con minGB=4.9, sotto la soglia di difetto 6, vedi sotto); rosso: 7 D4, il rosso si vede. RIGA D3DIAG INTERA in fondo al rapporto | free=14263/16086MB df=29G libero |
| 27 | career-critical | 0 | 685 | ✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale.   | free=14256/16086MB df=29G libero |
| 28 | build-web | - | - | non ancora eseguito | - |
| 29 | build-dist | - | - | non ancora eseguito | - |
| 30 | audit-copyright | - | - | non ancora eseguito | - |
