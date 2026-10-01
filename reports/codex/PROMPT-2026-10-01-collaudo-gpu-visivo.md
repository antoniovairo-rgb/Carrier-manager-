# Prompt per Codex — Collaudo visivo su GPU: corpo verso la porta, apertura #74, festa e palo (PO-100, PO-120, PO-127, PO-048)

Tre difetti segnati dal PO sul telefono che in headless (8-25 fps, senza GPU) non si riproducono. Serve un Chrome vero con GPU a 60 fps, come il tuo collaudo «fluidità 3D» del 28/09, con il CH38 acceso (impostazione predefinita, non passare `?glb=0`).

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION`, deve essere ≥ 7.999.96).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-collaudo-gpu-visivo`. Non toccare `src/`, `tools/`, altri test, `main`.
- `?cpmtest=1` e, per vedere le aperture di scena come le vede il giocatore, `window.__CPM_PRESENT=1` prima del caricamento. Forza le scene con `__CPM_FORCE_SIT(gi,false)`, l'esito con la proprietà `window.__CPM_FORCE_OUTCOME='success'|'fail'`, risolvi con `__CPM_RESOLVE(i)`. Fase da `__CPM_PHASE()`. Pagina nuova per ogni caso.

## Caso 1 — il corpo al tiro non guarda la porta (PO-100, PO-120)
Scene **3, 112, 154, 167** (gi = indice del catalogo, ordine delle righe `S("` in `src/04-situazioni-zone-piazzati.jsx`). Azione di tiro, esiti `success` e `fail`, 3 ripetizioni → 24 casi.
- Per ogni fotogramma dalla rincorsa al contatto: angolo fra la direzione in cui guarda il corpo dell'eroe (rotazione della mesh) e la direzione eroe → centro porta avversaria (x=+48,6 in coordinate di mondo). Se non trovi un testimone già pronto, ricava la rotazione dalla mesh dell'eroe nella scena Three.js e dichiara come l'hai fatto.
- Riporta: angolo al contatto, angolo massimo negli ultimi 300 ms prima del contatto, e 3 foto (−300 ms, −100 ms, contatto).
- Soglia di lettura: oltre 60° al contatto il corpo «non guarda la porta».

## Caso 2 — apertura della #74: tribune viste da dietro (PO-127)
Scena **74**, 10 aperture (pagina nuova). Registra a 60 fps i primi 1,5 s dalla comparsa della scena: posizione della camera, punto guardato, e se è attivo uno stacco nero (`window.__CPM_CUTLIVE()`).
- Domanda: esiste almeno un fotogramma **non coperto dal nero** in cui la camera sta dentro o dietro una tribuna (si vedono gradoni dal retro o l'esterno dello stadio)? Allega i fotogrammi.

## Caso 3 — festa del gol: il palo davanti all'eroe (PO-048)
Scene di tiro con esito `success`: **3, 24, 50, 55, 90, 112** — 2 ripetizioni. Fotografa la festa ogni 250 ms per 3 s dopo il gol.
- Domanda: in quanti fotogrammi un palo o la traversa copre una parte dell'eroe? Quanta (stima in % della sagoma, dichiarata come stima)?

## Rapporto
`reports/codex/2026-10-01-collaudo-gpu-visivo.md`: tre sezioni, una per caso, con tabella, foto e verdetto **riprodotto / non riprodotto / non misurabile**; FPS medio di ogni caso (se sotto 50 il caso vale come «non misurabile»). Grezzo in `tests/codex/collaudo-gpu-visivo.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Le anomalie restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi.
