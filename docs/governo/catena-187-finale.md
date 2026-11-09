# Catena 187-finale — verifica sul build 7.999.187 (HEAD c27e506, check-src allineato)

Sessione di sola verifica. Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium. Prima dei controlli è servito `npm install` in tests/visual (node_modules assente nel contenitore).

| # | controllo | uscita | durata (s) | braccio / motivo (righe finali) | free / df |
|---|---|---|---|---|---|
| 1 | logic | 0 | 2 | # todo 0 # duration_ms 2658.04304  | free=15529/16086MB df=29G libero |
| 2 | save-compat | 0 | 12 | === SAVE-COMPAT === 12 pass · 0 fail ✅ PASS  | free=15417/16086MB df=29G libero |
| 3 | panchina-127-m360 | 0 | 302 | braccio: verde+rosso · formati 360x800 ✅ panchina-127 verde (e il rosso si vede)  | free=15457/16086MB df=29G libero |
| 4 | panchina-127-tel | 0 | 321 | braccio: verde+rosso · formati 412x915 ✅ panchina-127 verde (e il rosso si vede)  | free=15546/16086MB df=29G libero |
| 5 | panchina-127-pc | 0 | 472 | braccio: verde+rosso · formati 1440x900 ✅ panchina-127 verde (e il rosso si vede)  | free=15555/16086MB df=29G libero |
| 6 | folla | 0 | 162 |   ✓ F5 manopola di densita': 'oggi' 6391 tifosi contro 'vera' 19067 FOLLA: verde PASSA · rosso visto  | free=15554/16086MB df=29G libero |
| 7 | bambini-124 | 0 | 879 | ROSSO (__CPM_NO_G124) rosso-rosso: {"n":44,"errMax":72,"es":[{"i":0,"casa":true,"n":"HyperShirt","exp":[0,188,212],"got":[0,188,212]},{"i":0,"casa":true,"n":"HyperShorts","exp":[24,24,38],"got":[86,86,108]}]} ✅ bambini-124 verde (e il rosso si vede)  | free=15530/16086MB df=29G libero |

## Esito

_Parziale: verifica in corso._
