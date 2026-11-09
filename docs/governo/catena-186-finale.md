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
| 10 | twa-120 | - | - | non ancora eseguito | - |
| 11 | sw-cache-120 | - | - | non ancora eseguito | - |
| 12 | albo-122 | - | - | non ancora eseguito | - |
| 13 | intro-118 | - | - | non ancora eseguito | - |
| 14 | altezza-114 | - | - | non ancora eseguito | - |
| 15 | flussi-115 | - | - | non ancora eseguito | - |
| 16 | collaudo-110 | - | - | non ancora eseguito | - |
| 17 | scorri-113 | - | - | non ancora eseguito | - |
| 18 | moduli-112 | - | - | non ancora eseguito | - |
| 19 | pc-tablet-292 | - | - | non ancora eseguito | - |
| 20 | griglia-mobile | - | - | non ancora eseguito | - |
| 21 | partita-v2 | - | - | non ancora eseguito | - |
| 22 | partita2d-297 | - | - | non ancora eseguito | - |
| 23 | validate-situations | - | - | non ancora eseguito | - |
| 24 | scena3d-96 | - | - | non ancora eseguito | - |
| 25 | partita-vera | - | - | non ancora eseguito | - |
| 26 | highlight-95 | - | - | non ancora eseguito | - |
| 27 | career-critical | - | - | non ancora eseguito | - |
| 28 | build-web | - | - | non ancora eseguito | - |
| 29 | build-dist | - | - | non ancora eseguito | - |
| 30 | audit-copyright | - | - | non ancora eseguito | - |
