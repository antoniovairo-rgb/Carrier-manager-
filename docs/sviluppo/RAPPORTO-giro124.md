# Rapporto giro 124b — PO-327 (colore delle maglie dei bambini)

**Regola (decisione PO):** ogni bambino porta la divisa AVVERSARIA del calciatore che accompagna; si corregge SOLO il colore.

## Causa misurata
I bambini non hanno numero e il kit e' tinta unita: `_applyHyperKit` non entrava ne' nel ramo texture della maglia (`_mg18`) ne' in quello dei pantaloncini (`_ms23`), e il colore restava NUDO su un materiale senza mappa. Il renderer ha `outputEncoding` sRGB e legge il colore nudo come lineare, quindi lo ricodifica: schiarito. I giocatori usano la texture sRGB e non sono toccati.
Misura (braccio rosso `__CPM_NO_G124`, coppia rosso contro rosso, 44 materiali): pantaloncini attesi `24,24,38` → mostrati `86,86,108` (errore massimo 72/255). Una maglia tinta unita rossa segue lo stesso meccanismo.
Nota onesta: nella fixture usata la maglia del bambino (kit ospite con motivo) passava gia' dalla texture e risultava esatta anche nel braccio rosso; il difetto riprodotto e misurato qui e' quello dei pantaloncini. La maglia tinta unita nuda non e' stata riprodotta con un numero: e' dedotta dallo stesso ramo di codice.
Rosso contro rosso: il kit dell'ospite risulta quello di riserva (`resolveKitConflict` → ciano `0,188,212`) e i bambini lo portano esattamente.

## Correzione
`src/12-three-match-view.jsx`: `_applyHyperKit` ha un 5° argomento `tex124`; i bambini lo passano (maglia e pantaloncini via texture sRGB come i giocatori); il pantaloncino non scrive piu' «undefined» se non c'e' numero. Interruttore rosso `__CPM_NO_G124`. Test-only: `__CPM_KIT124` (i due kit), `__CPM_FORCE_OPPKIT` in `src/15-live-match.jsx`. `GAME_VERSION` non toccato.
Non coperti (fuori ambito): calzettoni (gia' dalla texture gambe), assistenti.

## Guardiano `npm run bambini-124`
3 coppie (rosso-rosso, chiaro-scuro, eroe in trasferta) × 360x800 e 1440x900. Per ogni bambino: kit = quello della squadra avversaria del suo calciatore; colore mostrato (maglia, pantaloncini) entro 6/255 dal kit. Verde: errore 0 su 44 materiali per ognuno dei 6 giri. Rosso (`__CPM_NO_G124`): errore 72 → il guardiano lo vede (soglia > 30). Non giudicato (< 4 misure) = rosso.

## Rigiochi in sequenza
bambini-124 verde · scena3d-96 verde (31/31) · intro-118 verde · replay PASS · test:logic 43/43 · save-compat 12/12. `build-src`/`check-src` allineati.

## Foto
`docs/sviluppo/foto-giro124/`: `rosso-rosso-NO.png` = prima (rosso, 412x915); `rosso-rosso-360.png`/`-1440.png` = dopo; altre coppie accanto.
