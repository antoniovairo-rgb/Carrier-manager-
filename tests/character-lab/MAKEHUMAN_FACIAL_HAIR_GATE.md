# Gate barbe e baffi MakeHuman — 22 settembre 2026

## Scopo

Verificare due raccolte ufficiali MakeHuman direttamente sul volto del calciatore CGTrader, senza inserire geometrie nel runtime. Una variante puo' essere promossa solo se resta adulta e professionale, mantiene occhi/naso/bocca leggibili, non compenetra il volto e puo' essere pesata al bone `head.x` entro un budget mobile ragionevole.

## Raccolte testate

| Raccolta | Licenza dichiarata dalla fonte | Mesh testate | Viste | Esito |
| --- | --- | ---: | --- | --- |
| Bodyparts 05 | CC0 | 5 | fronte e tre quarti | Rifiutata |
| Bodyparts 06 | CC-BY | 4 | fronte e tre quarti | Rifiutata |

Per entrambi i set la procedura importa l'OBJ originale nel file Blender del CGTrader, allinea il volume con una scala uniforme alla larghezza del volto e lo porta davanti al piano facciale. Il test non esegue reauthoring, retopologia o pesatura: e' una verifica visiva onesta della compatibilita' di partenza.

## Evidenze

- Bodyparts 05: `makehuman-bodyparts05-fit/bodyparts05-front-contact-sheet.png`.
- Bodyparts 06, fronte: `makehuman-bodyparts06-fit/bodyparts06-front-contact-sheet.png`.
- Bodyparts 06, tre quarti: `makehuman-bodyparts06-fit/bodyparts06-three-quarter-contact-sheet.png`.

## Risultato

Nessuna delle nove mesh passa il gate estetico. Nel set CC0 i volumi appaiono come collari, barbe da costume o masse rigide sul collo. Nel set CC-BY i baffi attraversano guance/naso e le due barbe rimangono troppo lunghe o chiuse sotto il mento; la vista a tre quarti conferma che non e' un problema limitato alla camera frontale.

Non viene introdotta alcuna variante barba o baffi nel gioco. Una successiva ricerca deve partire da asset maschili moderni, creati per una testa realistica e gia' separati in micro-barba, pizzetto e baffo corto; l'eventuale fit andrebbe poi pesato a `head.x`, renderizzato in quattro viste e provato durante una clip.
