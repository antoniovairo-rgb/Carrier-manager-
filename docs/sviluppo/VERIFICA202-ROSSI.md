# Verifica 202 — i quattro rossi nuovi del treno della 202

Treno: corsa 44992349900 su `lavoro/201` = `2d692835` (punta). Confronto: `2d8f2d5d` (201 pubblicata, `git worktree`).
Banco: sessione cloud 4 cpu, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, comandi npm dei guardiani.
Ramo: `sviluppo/verifica202-rossi`. Non toccati: `src/`, `GAME_VERSION`.

## Tabella

| guardiano | CI 202 (motivo) | banco punta 2d692835 | banco 201 2d8f2d5d | conclusione |
|---|---|---|---|---|
| `walkout-fermi-197` | rosso: verde somma **8** contro rosso 21 (soglia `v.somma <= r.somma/3` = 7) | verde (somma 6, picco 2) | verde (somma 6, picco 2) | **INSTABILE / solo-runner**: il braccio verde sta a ridosso della soglia (6 sul banco, 8 in CI: un campione in più a 19,5 s). Nessun legame con 316/318 |
| `svincolato-264` | rosso 9 controlli: gare iniettate in W10 invece di W9, «0→2» presenze | rosso 1 · verde 1 (+1 rosso col rosso del 316 spento) | verde 1 | **INSTABILE, difetto della sonda** (corsa di tempi): **corretto sul ramo** |
| `rigori-296` | rosso solo in parte C: `ripartenza-piazzato-27` caso compagno, braccio rosso «il difetto non si vede (fuori 0)» | parte C rosso, stesso messaggio | parte C rosso, stesso messaggio | **NON è una regressione** (rosso uguale sulla 201); il braccio rosso del caso compagno non mostra il difetto: instabile, verde nei treni 200/201 |
| `diagonali-210` | rosso: «K ArrowUp+ArrowLeft a 0 ms: 1 passi … mosse 3→2» | rosso 3 su 3 (14 · 14 · 13 tasti a vuoto, anche da solo) | rosso 2 su 2 (14 tasti a vuoto) | **NON è una regressione** (rosso uguale sulla 201); dipende dalla velocità della macchina |

Cosa NON e' stato giudicato: `rigori-296` parti A e B sul banco (la mia corsa intera e' stata interrotta dal mio tetto di 900 s
in parte B, su entrambe le basi — non vale); in CI A e B erano verdi. Le due ripetizioni chieste sono complete solo per
`walkout-fermi-197` (1+1 sul banco, + CI), `svincolato-264` e `diagonali-210`; per `rigori-296` parte C una corsa per base.

## Per ciascuno

### walkout-fermi-197 — instabile (soglia sfiorata)
Banco: punta e 201 identiche al decimale (`somma 6, picco 2, serie 20:2 20.5:2 21:2`; rosso `somma 21`). CI: `somma 8`,
`serie 19.5:2 20:2 20.5:2 21:2` — il runner più lento campiona un istante in più (19,5 s) in cui due corpi corrono da fermi.
La soglia `v.somma <= r.somma/3` vale 7: il verde sta a 6 contro 7, cioè dentro il rumore di campionamento. La diff 201→punta
non tocca l'ingresso in campo (solo audio della serata, due testi, crediti). Da riparare il campionamento (es. campioni a
tempo di scena fisso), **non** la soglia; non fatto qui.

### svincolato-264 — corsa di tempi nella sonda, corretta
Misura: la ricerca della settimana libera fa `patch({week:w})` e legge `thisWeekMd()` dopo **220 ms fissi**. Sotto carico la
lettura resta indietro di una settimana: a w=9 legge ancora la gara della W8 (salta la W9 libera), a w=10 legge la W9 (null) e
sceglie W10, che ha già la sua giornata di lega → la gara iniettata si somma a quella di lega (`lived simulated simulated`,
presenze 0→2) e falliscono 9 controlli. Prova che non dipende dal 316: con `__CPM_NO_G316` armato la punta resta rossa (W10),
senza il rosso la punta passa verde (W9) alla seconda corsa. Una sonda (`thisWeekMd` per W3..12) dà W9 libera e W10 di lega
**identiche** su punta e 201.
Correzione (`tests/visual/svincolato-264.mjs`, solo la sonda): si aspetta con `waitForFunction` che
`__CPM_CAREER.snapshot().week === w` (l'harness si registra a ogni render, quindi `snapshot` e `thisWeekMd` vengono dallo stesso
oggetto) e poi 120 ms. Nessuna soglia cambiata. Dopo la correzione, sulla punta e **sotto carico** (tre corse insieme + altre
due pagine): verde 2 su 2 (W9), rosso `CPM_ROSSO=1` rosso (3 controlli: lo svincolato riceve il voto 6,6 / 6,8 / 6,2 in
euro_group / euro / cup).

### rigori-296 — rosso uguale sulle due basi (parte C)
`CPM_PARTI=C`: punta e 201 escono entrambe con `C · compagno rosso: il difetto non si vede (fuori 0)` — è il braccio rosso di
`ripartenza-piazzato-27` (caso compagno) che non mostra il difetto, non il verde. Stessa causa in CI. Non legato a 316/318
(la 201 è rossa uguale). Instabile: verde nei treni 200 e 201. Da riparare il braccio rosso (provocare il caso), non fatto qui.

### diagonali-210 — rosso uguale sulle due basi
Sul banco rosso su entrambe le basi, anche con una sola corsa sulla macchina: i tasti della coppia «a 0 ms» arrivano alla
pagina spesso a ~400 ms l'uno dall'altro (`tasti visti dalla pagina`), e l'eroe fa due passi dritti invece di uno diagonale.
Il braccio rosso si vede (`non giudicati 0`). È un guardiano che dipende dalla velocità della macchina (in CI 200/201 verde,
in 202 un solo tasto a vuoto); la diff 201→punta non tocca né l'input né il pad. Da riparare l'invio dei tasti (stesso
fotogramma), non fatto qui.

## Conclusione
Nessuno dei quattro è una regressione dei vagoni 316 o 318: nessun guardiano legge il brano o i testi cambiati, e dove la punta
è rossa la 201 è rossa uguale sul banco (rigori-296 C, diagonali-210) oppure la causa è nella sonda (svincolato-264, corretta
qui) o nel campionamento (walkout-fermi-197). Restano da riparare: campionamento di `walkout-fermi-197`, braccio rosso
«compagno» di `ripartenza-piazzato-27`, invio dei tasti di `diagonali-210` (regola PO 13/10: instabile due volte → si ripara).
