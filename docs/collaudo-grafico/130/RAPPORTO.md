# Giro 130 — `collaudo-110` rosso su G180-17 pc: era lo strumento

Ramo `collaudo/giro130-g180` da `lavoro/186` (7.999.186). GAME_VERSION non toccato, `src/` non toccato.
Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium, `free`/`df` prima di ognuno
(liberi sempre ≥ 12,9 GB di RAM e 29 GB di disco).

## 1. La 186 o lo strumento? — misura

`CPM_110_SOLO=17 node collaudo-110.mjs verde`, 3 passate per build (main in un worktree a parte, 7.999.185).
Campioni del banner d'esito su pc (servono ≥ 3):

| build | passata 1 | passata 2 | passata 3 | t360 / t412 |
|---|---|---|---|---|
| lavoro/186 (7.999.186) | **2** (rosso) | 7 | 7 | 8 / 8 sempre |
| main (7.999.185) | 5 | 8 | **3** (al limite) | 8 / 8 sempre |

Il numero oscilla fra 2 e 8 su **entrambe** le build: non è la 186. Sonda `tests/visual/sonda-130-g17.mjs`
(186, pc, 3 giri; osservatore DOM sulla nascita della pillola + fps):

- la pillola d'esito nasce **6.323–6.707 ms** dopo la risoluzione forzata (fps headless su pc: 4–7) e vive
  **1.400 ms** di tempo reale (`setTimeout` in `src/15-live-match.jsx:4783`);
- il ciclo del guardiano era una **finestra fissa** di 40 × (170 ms + evaluate) ≈ 6,9 s che partiva dalla
  risoluzione: prendeva solo la **coda** della pillola (2 campioni quando nasce a 6,7 s, 6 quando nasce a 6,3 s).
- sui telefoni (fps più alti) l'assestamento della palla arriva prima e la pillola cade intera nella finestra → 8.

Causa misurata: **finestra a tempo fisso contro un evento che sul pc arriva al suo bordo**. Le modifiche
della 186 (arco della parata, ancore dei tiri, maglie, angolo/testa) non sono necessarie a spiegarlo: main
dà 3 con la stessa sonda. Non posso escludere che la 186 sposti di qualche decina di ms la nascita della
pillola; con questi campioni la differenza non è separabile dalla varianza del fps headless.

## 2a. Correzione della sonda (non del gioco)

`tests/visual/collaudo-110.mjs`, punto G17: si **attende l'evento** «pillola nata» (`waitForFunction`, tetto 20 s),
poi si campiona finché la pillola esiste (tetto 40 campioni). Soglia di 3 campioni **invariata**; criterio
«scatola fuori dal campo > 0,5 px» invariato.

## Esito

| corsa | uscita | durata | G180-17 verde (t360/t412/pc) | G180-17 rosso | totale |
|---|---|---|---|---|---|
| solo G17, tutto | 0 | — | 8/8/7 campioni, 0 fuori | cade su tutti e tre (pc: 5 su 7 fuori, fino a 47 px) | — |
| completo n.1 | 0 | 336 s | 8/8/7, 0 fuori | t360 6/8 · t412 6/8 · pc 4/7 fuori | ✅ 9 difetti verde, 8 rossi cadono (G33 n/a) |
| completo n.2 | 0 | 329 s | 8/8/7, 0 fuori | t360 6/8 · t412 6/7 · pc 4/7 fuori | ✅ identico |

Ripetizione dichiarata: 2 passate complete, entrambe verdi in ogni punto, rosso che cade in ogni punto.
