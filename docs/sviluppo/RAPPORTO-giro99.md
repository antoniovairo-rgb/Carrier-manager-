# Rapporto giro 99 — chiusura della 178

Ramo `sviluppo/giro99-chiusura` (da `lavoro/178`, 55879106: 7.999.178 con i giri 90-98 uniti). `GAME_VERSION` e `docs/governo/*`
non toccati.

## D9 MEDIA — «GOOOOL!» poco leggibile (collaudo grafico PO-299)
- **Misura prima** (`chiusura-99` parte D9, braccio rosso `__CPM_NO_G99D9`; 6 gol veri dell'eroe, telefono 412x915, colore del club
  vero più cinque colori forzati col testimone di sola prova `__CPM_G99COL`: bianco, giallo, rosso, blu, verde). Contrasto WCAG
  della lettera contro ciò che le sta dietro (alone/contorno, «locale») e contro il quadro 3D sotto («quadro»); si giudica il
  minimo dei due: **mediana 1,28**, 5 gol su 6 sotto 3 (club 1,04 · rosso 1,28 · blu 1,02 · verde 1,24 · giallo 2,19; solo la
  maglia bianca 3,27).
- **Causa:** `goalCinema` (src/15) scriveva col colore del club, in corsivo, con l'alone dello STESSO colore (30 e 60 px): la
  lettera si confondeva col proprio alone e con cartelloni/maglie del club.
- **Correzione** (src/15): bianco pieno, contorno scuro 2 px (`paint-order: stroke fill`), ombra nera, niente corsivo, pillola scura
  (`rgba(6,10,20,0.72)`, raggio `RAD.md`) dietro la scritta; il colore del club resta solo come filetto sotto la pillola. La
  scritta era già centrata nel riquadro 3D (`inset:0`, flex centrato): invariato. Vale anche per «ASSIST!».
- **Misura dopo:** **mediana 5,29**, minimo 4,62 (giallo), nessun gol sotto 3. Il «quadro» è conservativo: confronta la lettera col
  campo SENZA la pillola.

## Ricevente dell'assist nel 3D (aperto dal giro 98, D1)
- **Misura prima** (`chiusura-99` parte RIC, partite vere dal salvataggio S12, pilota «assist», `__CPM_PRESENT=1`, 4 semi; braccio
  rosso `__CPM_NO_G99RIC`): compagno servito nel 3D = ricevente nominato dal cast **6/12 (50%)**.
- **Causa misurata** (diagnosi di sola prova `__CPM_G99DIAG` nel testimone B4): in tutti e sei i casi mancati il nominato stava
  **dietro la palla** (8-15 u) o lontano (18-40 u) al momento del passaggio, sul suo slot di formazione; il ramo del passaggio
  (src/12) lo scartava (vincolo «mai all'indietro» 7.475 / 40 u) e sceglieva per geometria.
- **Correzione** (src/12): nelle scene d'attacco il ricevente del cast ha un **punto di ricezione credibile davanti all'eroe**
  (12 u avanti e 9 verso il centro; oltre x 80, 6 avanti e 14 di lato), preso allo snap d'apertura (stacco nero: nessun
  teletrasporto visibile) e poi tenuto col moto normale (`animOne`, stesso canale del portatore difensivo del giro 31); il ramo del
  passaggio serve il nominato portato lì anche oltre i 40 u, sempre solo se è davanti alla palla.
- **Misura dopo:** **12/12 (100%)** sugli stessi 4 semi.
- ⚠️ **Lezione di misura:** senza `__CPM_PRESENT` (sotto `cpmtest` lo snap di presentazione è spento) la correzione non si vede
  (1234: 0/3) perché il nominato deve correre 30-40 u nei pochi istanti di scelta del pilota automatico. La sonda gira nel regime
  del giocatore. `assist-nome-98` misura senza `__CPM_PRESENT`: il suo «3D ricevente = cast» resta nel regime di prova.

## Guardiano
`tests/visual/chiusura-99.mjs` (parti D9 e RIC, verde + rosso nello stesso giro; esce ≠0 se un rosso non si vede o la passata è
cieca). In `ci-runner.mjs`: catene carriera e completa, MAPPA `src/12-|13-` e `src/15-`, tra i LENTI; in `package.json`.
Durata: D9 ~5 min per braccio, RIC ~9 min per braccio con 2 semi.

## Guardiani non eseguiti dopo 96b e 98
(in compilazione)

## Punti aperti
(in compilazione)
