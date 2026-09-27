# Scheda 4 — scivolamento del piede nella corsa

**Base verificata:** `GAME_VERSION="7.999.34"`, commit `76b708a0`. Comando riproducibile dalla radice: `node tests/codex/measure-sliding.mjs` con `CPM_CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe`. Browser a 412×915, una pagina nuova per scena, GLB/Mixamo attesi prima del gesto. Dati integrali in `2026-09-27-scivolamento-corsa-data.json`, log in `.log`. Il testimone `__CPM_TIRO34` ha mostrato `kick` in tutti i 10 casi (`firstKick >= 0`); nessun errore di scena è stato registrato. I numeri sotto vengono dal comando indicato, non da una stima visiva.

| gi | Frame testimone | Frame al primo `kick` | Campioni validi prima del `kick` | `sl` mediano (u/s) | FPS reali misurati con `requestAnimationFrame` |
|---:|---:|---:|---:|---:|---:|
| 0 | 299 | 34 | 33 | 2,93 | 5,03 |
| 2 | 523 | 6 | 5 | 4,61 | 8,49 |
| 12 | 417 | 22 | 21 | 2,75 | 8,20 |
| 3 | 465 | 7 | 6 | 4,34 | 8,89 |
| 4 | 452 | 22 | 21 | 2,95 | 8,39 |
| 8 | 457 | 21 | 20 | 2,52 | 8,57 |
| 11 | 441 | 22 | 21 | 2,67 | 8,17 |
| 20 | 93 | 36 | 35 | 3,27 | 7,14 |
| 21 | 481 | 39 | 38 | 2,50 | 8,65 |
| 22 | 530 | 22 | 21 | 2,82 | 9,09 |

| Velocità eroe `v` (u/s) | Campioni | Mediana `sl` (u/s) |
|---|---:|---:|
| 0–3 | 39 | 3,42 |
| 3–6 | 51 | 2,99 |
| 6–9 | 127 | 2,63 |
| 9+ | 4 | 1,83 |

Totale **221** campioni validi. FPS per scena da **5,03** a **9,09**, mediana delle dieci scene **8,44**. I dati per fascia sono mediane dei frame, non medie delle dieci mediane di scena. Il gruppo 9+ ha solo **4** frame: non consente una conclusione attendibile su quella velocità. Gi2 e gi3 hanno rispettivamente **5** e **6** frame prima del calcio: anche le loro mediane individuali sono fragili.

**Attendibilità:** `sl` in `src/12-three-match-view.jsx:10053-10060` è lo spostamento orizzontale del piede vicino al terreno fra due frame diviso per `aDt`; il valore esiste soltanto se lo stesso piede è sotto 0,12 u in due frame consecutivi. A 5–9 FPS un frame dura circa 0,11–0,20 s reali e può saltare parte dell'appoggio, alterando quale piede viene selezionato e la mediana. I valori non nulli intorno a 2–3 u/s sono un **segnale da approfondire**, ma a questi FPS il test headless non dimostra quanto scivoli il piede su un telefono fluido. Prestazioni e percezione su dispositivo mobile: **non verificato**. Riprodurre la misura su hardware mobile o con browser a frame rate stabile e confrontare le stesse fasce con almeno 20 campioni ciascuna prima di chiudere il quality gate.
