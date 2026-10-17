# Collaudo 3D — release 7.999.171 (17/10/2026)

Ramo `collaudo/release-7.999.171-3d`, creato da `origin/main` (`GAME_VERSION` = 7.999.171, verificato col grep). Codice di gioco **non modificato**: aggiunti solo tre script di sola misura in `tests/visual/` (`collaudo-171-3d.mjs`, `collaudo-171-carriera.mjs`, `collaudo-171-provini.mjs`). Foto e dati grezzi in `docs/collaudi/foto-release-7.999.171-3d/` (`m*-dati.json`, `provini-dati.json`, `carriera-dati.json`).

## Come è stato fatto
- `npm ci` non è eseguibile (in `tests/visual` non c'è `package-lock.json`): usato `npm install`. `CPM_CHROME=/opt/pw-browsers/chromium`.
- **GLB ACCESO** ovunque (`__CPM_GLB=true`, confermato a fine partita: `glb:true`), `__CPM_PRESENT=1`, `__CPM_REALWAIT=1`, viewport 412×915. Eccezione dichiarata: `stadi-071-ingresso.mjs` forza GLB spento nel suo codice → le foto stadi (`stadi-*.png`) mostrano le figure procedurali.
- **6 partite complete** (provino, pagina nuova ciascuna, seed diversi, autoplay `seeded`) + **1 partita di carriera** (save fixture, fine stagione, con ingresso e cerimonia) + **2 provini di fila nella stessa pagina** (fluidità 1ª vs 2ª) = **9 partite giocate fino al fischio**.
- Guardiani esistenti rilanciati: `apertura-261`, `esiti-218`, `gk-dive-sync`, `ripartenza-207`, `passaggio-coppa-137`, `ingresso-245` (GLB=1), `stadi-071-ingresso`.
- ⚠️ Limite generale: headless con GL software → 7–10 fps circa. Il **tempo** e la fluidità assoluta non sono giudicabili; reggono i confronti fra bracci e i numeri adimensionali.

## Esito complessivo
Nessun difetto di gravità **alta**. Le 9 partite arrivano tutte al fischio finale, 0 `pageerror` in tutte (l'unico `console.error` è la nota Babel «deoptimised… exceeds 500KB», non un errore di gioco).

## Tabella difetti

| # | Gravità | Area | Cosa | Prova |
|---|---|---|---|---|
| 1 | **media** | Highlight / inquadratura (PO-261) | In «Volée di collo potente» l'eroe è **fuori quadro** (si vedono solo palla e traccia dell'arco) in `hl_choose`: 2 foto su 2 con quella scena. | `m2-hl_choose-3.png`, `m4-hl_choose-2.png` |
| 2 | **media** | Pallone (salti) | `apertura-261`, 4 partite: **2 salti del pallone SCOPERTI** (non mascherati da stacco): `arco:6.5@hl_result` (p1), `arco:6@hl_result` (p2); p0 e p3 a 0. Passa il guardiano (PASS), ma il varco li dichiara. | log `apertura-261` (riga «salti del pallone in scena… SCOPERTI 1») |
| 3 | **media** | Memoria | Heap JS: 220→388 MB nel 1° provino, **507 MB all'inizio del 2°** (rimasto 507→508). Nelle 6 partite a pagina nuova: 243–324 → 393–413 MB. Una perdita **non** è confermabile (dipende dal momento del GC, non forzato), ma su mobile 500 MB sono un rischio. | `provini-dati.json` (h0/h1), `m*-dati.json` (`heap`) |
| 4 | bassa | Ingresso / stadi (PO-071) | Nel walkout ci sono fotogrammi con **campo vuoto** (nessun attore in quadro) e, a fine ingresso, le due file molto **piccole e lontane**. Quote camera: borgo 17,98 · arena 29,25 al 2° scatto. | `stadi-arena-60000-nuovo-1.png`, `stadi-borgo-3000-nuovo-1.png`, `c0-walkout-3.png`, `c0-walkout-4.png`; log `stadi-071-ingresso` |
| 5 | bassa | Highlight: taglia dell'eroe in apertura | Altezza apparente dell'eroe nel 1° fotogramma delle prime scene: **0,056–0,074** (distanza camera→eroe ~28–32 u) e «apertura fuori 1/3, 1/4, 1/4» nei primi fotogrammi di 3 scene su 4 prime scene. Il guardiano passa (soglia: metà del tempo), il dato è il valore reale. Riferimento del repo: censimento 7.505 mediana 0,14; regia TV 0,35–0,60. | log `apertura-261` |
| 6 | bassa | HUD | La pillola «PALLA PERSA» si sovrappone alle cifre del tabellone (2–0) in `hl_result`. | `m2-hl_result-2.png` |
| 7 | bassa | Dati partita | Tabellino finale: «Azioni dalle fasce» **1 contro 23** (partita 0, 1–0 per noi, 53% possesso). Non posso confermare se sia un errore o un esito legittimo della simulazione. | `m0-endedF-1.png` |
| 8 | bassa (strumento) | Registro eventi | Nella partita M4 `candidate`=7 ed `esito`=6: un candidato senza esito nel registro. Non posso confermare se sia un difetto o un highlight non giocato. | `m4-dati.json` → `ev.c` |
| 9 | info (strumento) | `esiti-218` | Il braccio VERDE è passato (12 scene, **0 contraddizioni**); il braccio ROSSO (prova del rosso) ha sforato il mio timeout di 14 min e non è concluso. La prova del rosso di questo guardiano **non è verificata** da me. | `g-esiti-218` (verde 1234/2021: «VERDE scene 12 contraddizioni 0») |

## Cosa ho verificato e com'è andata
- **Fine partita**: 9/9 al 90' (`ck` campionato 90; fischio per `clock` 6/6 nelle sei partite del banco). Il gol al «92'» visto in una partita è coerente con la direttiva PO-202 (3 minuti di recupero, fischio al 93'), che compare nei commenti del codice: **non è un difetto**.
- **Apertura scena (PO-261)**: PASS, «prima immagine sull'eroe 4/4, scarto max 0 u, aperture vuote 0».
- **Esiti (PO-218)**: braccio verde 12 scene, 0 contraddizioni (vedi riga 9).
- **Portiere/parate (PO-258)**: `gk-dive-sync` PASS, 6 tuffi, distesa completa mediana −0,05 s rispetto all'arrivo del pallone (peggiore −0,09 s). Parate dal vivo nelle 6 partite: non le ho analizzate a una a una → **Non posso confermarlo** oltre il guardiano.
- **Ripartenza dopo il gol (PO-228/207)**: `ripartenza-207` verde: 1 ripartenza, palla al centro `kickoff@50,50`, 2 giocatori al campione; i due bracci rossi si vedono (0 ripartenze / ripartenza in volo).
- **Ingresso in campo (PO-071/245)**: `ingresso-245` GLB: stesso tunnel, vmax 1,8–1,9 u/s (rosso 187), tutti al posto. Walkout vero GLB fotografato in carriera (tunnel, mascotte, due squadre con maglie distinte). Stadi: borgo → tunnel «pensilina», arena 60.000 → tunnel «vetro» (il vecchio braccio non ne ha: `tunnel no`).
- **Cerimonie (PO-137/002)**: `passaggio-coppa-137` verde (beat `present>captain>pass>lift>fest`, mani del capitano 2,01 contro 1,3 col rosso, festa a quota 1,05 contro 0 col rosso; i tre rossi si vedono). Cerimonia vera di fine stagione in carriera fotografata (`c0-fine.png`).
- **Kit grafico / pubblico / cartelloni**: nelle foto GLB le due squadre hanno maglie distinte (rosso/rosa contro bianconero), cartelloni sponsor leggibili e coerenti fra le scene, tribune popolate. Il **movimento** del pubblico non è valutabile da frame fissi → **Non posso confermarlo**.
- **Fluidità 1ª vs 2ª partita** (stesso browser, 2 provini): intervallo fra fotogrammi p50 **109 → 90 ms**, p90 323 → 351 ms, p99 853 → 788 ms. La seconda partita non è più lenta della prima nel mio banco (headless, quindi indicativo). Nelle sei partite a pagina nuova p50 100–119 ms, p99 442–1034 ms.
- **Seconda partita di carriera nella stessa pagina**: il tentativo con il save fixture si è fermato sulla cerimonia (non c'era una 2ª partita giocabile) → **non fatta**; sostituita dai due provini di fila.

## Non verificato
Fluidità su dispositivo reale, animazione del pubblico, singole parate nelle partite intere, prova del rosso di `esiti-218`, seconda partita di carriera nello stesso salvataggio.
