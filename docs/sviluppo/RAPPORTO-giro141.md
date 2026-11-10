# Rapporto giro 141 — partita 2D: cartelloni per settore e densità del pubblico (PO-341, PO-342)

Ramo `sviluppo/giro141-partita2d` da `lavoro/188` (7.999.188). `GAME_VERSION` non toccata, nessun campo nuovo nel salvataggio.

## Segnalazione
Foto PO 187 (SIC rosa – PAR arancio, Primavera 2, pioggia, 14'): cartelloni rosa e arancio alternati su tutti i lati, pubblico come
trama fitta e uniforme. Decisioni PO del 10/11: **PO-341** cartelloni per settore (casa su tribuna e curva di casa, ospite nel suo
spicchio, come nel 3D); **PO-342** densità dei tifosi 2D realistica come nel 3D.

## Cause misurate (braccio rosso `__CPM_NO_G141` = 7.999.188, guardiano `npm run partita2d-141`)
- **Cartelloni**: la palette ripeteva `[casa, notte casa, secondo casa, notte, casa, OSPITI]` girando tutto il perimetro, quindi
  un pannello ospiti ogni sei finiva su **ogni** lato. I pannelli col colore del padrone del loro settore erano il **62–81%**
  (Primavera PC 32/52, telefono 39/52; stadio grande 19–21 su 26).
- **Densità**: la tribuna 2D era piena all'**~88% in ogni partita** (un posto vuoto su otto, `h<12`), a prescindere
  dall'affluenza. Primavera SIC–PAR (affluenza 400 su 3.000, fill 0,134): curva di casa disegnata all'**86–89%** contro il 18%
  del 3D, tribune al **56–95%** contro il 12%. Il settore ospiti era uno spicchio nell'angolo: nessuna curva ospiti come nel 3D.

## Correzione
1. **Una fonte sola per i settori** — `settoriFolla141(crowd, sideW, endW)` in `src/10-folla-stadi-ritiro.jsx`: la regola del
   7.187.0 (curva compatta, posti spostati tolti alle tribune, spicchio ospiti, finale divisa a metà) che `buildStadium` calcolava
   in linea. Ora la leggono **sia il 3D sia il 2D**. Prova di non-regressione del 3D: il guardiano `folla` (giro 129) stampa le
   stesse 22 righe di riempimento per settore sulla base e sul ramo (`diff` vuoto).
2. **Mappa dei settori 2D come nel 3D** (`_settore141`/`_padrone141` in `src/15-live-match.jsx`): curva di casa dietro la porta
   che attacca la squadra in basso (in alto al telefono, a destra al PC), curva ospiti dietro l'altra, Tribuna Est (destra / in basso)
   con lo spicchio ospiti accanto alla curva ospiti, Tribuna Ovest di casa. `_ospRect297` ora restituisce la curva ospiti, così
   anche il lampo del gol e i guardiani 109/297 seguono il nuovo settore.
3. **Cartelloni**: ogni pannello prende la palette del padrone del suo settore (`cartC` / `cartO` in `_spalti109`), con contatori
   separati.
4. **Spalti**: il Campo2D riceve `folla={crowdCtx}` (lo stesso `computeCrowdContext` della MatchdayCard e dello stadio 3D). Per
   settore: file vicine al campo più piene (rampa a media nulla), blocchi pieni/vuoti a bassa frequenza, corridoi sempre liberi,
   media tarata per bisezione sui posti veri. I posti vuoti si vedono come **sedili** (formula del 3D). Tutto con `hashStr` e un
   hash intero di posizione: nessun `Math.random`. Niente posti sotto i cartelloni (prima venivano disegnati e coperti).
5. Disegno sempre nella tela di servizio, una volta: nessun ridisegno per fotogramma aggiunto.

## Misure dopo (verde)
| | cartelloni col colore del padrone | curva casa disegnata / attesa | curva ospiti disegnata / attesa |
|---|---|---|---|
| grande (MER–CRA, 46.150/68.500) telefono | 23/23 | 88% / 88% | 72% / 71% |
| grande PC | 23/23 | 87% / 88% | 72% / 71% |
| Primavera (SIC–PAR, 400/3.000) telefono | 52/52 | 19% / 18% | 10% / 12% |
| Primavera PC | 52/52 | 18% / 18% | 10% / 12% |

In casa e in trasferta i numeri sono uguali per costruzione (cambia la maglia dei pallini, non il padrone dello stadio).
Partita vera dal salvataggio Primavera: il Campo2D riceve il contesto folla (fill 0,099, 300 spettatori su 3.000).

**Prestazioni** (headless, senza GPU): tratto per fotogramma mediana **0,3 ms**, p90 **0,4 ms** in entrambi i bracci; lo sfondo
(una volta per partita o ridimensionamento) costa 2–36 ms nel verde contro 2–13 ms nel rosso, misura rumorosa in headless.

## Guardiano `npm run partita2d-141`
Campo2D vero, due stadi × casa/trasferta × due formati (360×800 tocco, 1440×900) + partita vera.
C: pannelli col colore del padrone ≥ 95% (almeno 8 giudicati). O: |quota tifosi/(tifosi+sedili) − riempimento del settore| ≤ 0,06
per ogni gruppo con almeno 150 pixel; le due curve devono essere giudicate (soglia fissata dopo la misura: verde entro 2 punti).
Rosso `__CPM_NO_G141`: cade sui cartelloni 8/8 e sulla densità 8/8. Verde e rosso stampati per ultimi.

## Catena (un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)
partita2d-141 ✅ · partita2d-297 ✅ (rosso A/B/C cade) · spalti-109 ✅ 21/21 (rosso 21/21) · partita-v2 ✅ (rosso atteso) ·
griglia-mobile esce 0 · design-system ✅ · career-critical ✅ (11 sotto-guardiani, 0 rossi) · test:logic 43/43 · save-compat 12/12.

Da sapere:
- **spalti-109** al primo giro è caduto su T2 (settore ospiti 52–54% < 55%): i sedili vuoti del settore ospiti avevano la tinta
  del club di casa, come nel 3D, e il classificatore li contava come casa — cioè di nuovo «colori mischiati». Ora il sedile prende
  la tinta del padrone del settore.
- **partita2d-297** criterio A («tinta di casa ≥ 4% dei pixel della tribuna») era tarato su una tribuna sempre piena all'88%; con
  l'affluenza vera della Primavera la tinta grezza è 1,5–1,7%. La soglia **non** è stata abbassata: la misura ora è a parità di
  affluenza (tinta × 0,88 / quota di posti occupati disegnata, dal testimone `__CPM_G141`), e stampa anche il valore grezzo. Senza
  testimone (rosso) resta la misura grezza. **Da confermare dal PO** (domanda 4).
- Il guardiano `folla` (3D, non in catena) è rosso su F2 «caricamenti di texture» **anche sulla base `lavoro/188`** (stessi
  128×128 / 256×48 sullo stadio di campionato): preesistente, non causato da questo giro.
- Questo giro non scrive la riga di roadmap: è un ramo di sviluppo senza versione (`GAME_VERSION` invariata per mandato).

## Domande aperte per il PO
1. **Quale porta ha la curva ospiti nel 2D?** Ho seguito il primo tempo del 3D: la curva di casa sta dietro la porta che la
   squadra dell'eroe attacca, la curva ospiti dietro l'altra. Nel 3D lo stadio ruota all'intervallo (7.732); il 2D non scambia
   le curve al secondo tempo. Va scambiato?
2. **Sedili vuoti nella tinta del settore** (2D) invece della tinta di casa ovunque (3D): scelta fatta per non rimescolare i
   colori nel settore ospiti. Va bene la differenza col 3D?
3. **Tribune laterali al telefono**: la striscia fra cartelloni e bordo è più stretta di un posto, quindi lì ci sono solo i
   cartelloni (prima c'erano spezzoni di puntini coperti a metà). Lo spicchio ospiti della Tribuna Est si vede solo come
   cartelloni ospiti. Serve allargarla?
4. **Criterio A di partita2d-297 a parità di affluenza**: confermi che la tinta si giudica così ora che lo stadio può essere vuoto?
5. **Primavera quasi vuota** (10–13% dei posti, 300–400 spettatori su 3.000, come la MatchdayCard): è il realismo voluto?

## Foto
`docs/sviluppo/foto-giro141/`: `prima-*` (braccio rosso) e `dopo-*`, per `t360`/`pc` × `grande`/`primavera` × `casa`/`trasferta`,
più `prima-partita-t360.png` / `dopo-partita-t360.png` dalla partita vera.
