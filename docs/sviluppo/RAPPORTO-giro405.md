# Rapporto giro 405 — PO-582: la scossa della camera arriva sullo schermo?

Ramo: `sviluppo/giro405-scossa` (base `lavoro/201`, ccbed19). GAME_VERSION e `docs/governo` non toccati.

## Risposta

**No, prima non arrivava.** Sulla camera disegnata arrivava fra l'1% e il 13% della scossa chiesta (mediana 5%).
Dopo la correzione ne arriva il 100-108%, e la camera di regia non la vede più (0-8%).

## Dove si perdeva (misurato, non supposto)

La scossa (`shakePow`: gol 0,55 · palo/traversa 0,38 · pallone in rete 0,15-0,20 · rigore segnato 0,5) veniva sommata
al **bersaglio di posizione** `tPx/tPz` (src/12, «Sprint 3D-11A»). Di lì passava:
1. dalle passate di regia che vengono dopo (eroe e pallone insieme 241, mai attraverso l'eroe, ecc.), che fondono `tP`
   verso un loro punto e così ne tolgono una parte;
2. dal **lerp di posizione** `kp ≈ dt·2` (passa-basso con costante di tempo di circa 0,5 s).

L'arbitro d'inerzia 7.521 (`_iner521`) **non c'entra**: filtra lo sguardo (`tL*`), e sulla posizione non arriva mai
(il lerp di posizione sta prima dell'arbitro, come dice CLAUDE.md). La causa è il lerp di posizione.
C'era poi un secondo difetto: `Math.sin(now*24)` con `now` in **millisecondi** (`performance.now()`), cioè 24 rad/ms.
Non era la scossa di 3,8 Hz che il commento descrive, ma rumore a frequenza di fotogramma, e il passa-basso lo
spegneva quasi del tutto.

## Strumento

Testimone `window.__CPM_SCOSSA405 = []` (solo collaudo), in src/12 **subito prima del disegno**, cioè dopo il
«QUADRO DELL'EROE», con `camera.updateMatrixWorld(true)`. Per fotogramma registra la scossa chiesta (ox, oz, potenza),
la posizione della camera **disegnata** (cx, cz) e di **regia** (gx, gz) e, a titolo informativo, la proiezione di un
punto fermo vista dalle due camere e dalla regia spostata della scossa chiesta.

Guardiano `npm run scossa-405`. Usa 5 scene forzate, ognuna su una pagina e un browser nuovi, con i corpi GLB accesi e
`__CPM_PRESENT=1`: gol gi8 (tiro da fuori) · gol gi86 (testa) · rigore gi5 · palo gi8 · palo gi3.

**Resa** = guadagno in fase del passa-alto (seconda differenza) della posizione della camera sulla scossa chiesta. Una
traslazione della camera sposta l'immagine di o/profondità, cioè dello stesso fattore per la scossa chiesta e per quella
resa: è quindi la resa sullo schermo.

Soglia dichiarata **prima** della misura (`docs/sviluppo/giro405-soglia.md`, con l'ora): **≥ 0,50 sulla camera
disegnata, in ogni scena**. Il rosso (`window.__CPM_NO_G405`) deve stare sotto 0,50 in almeno una scena. Una scena senza
scossa, o senza fondo, è NON GIUDICATA, cioè rossa.

⚠️ **Lo strumento dichiarato per primo è stato riparato. La soglia no.** Il primo strumento misurava l'energia del
passa-alto di un punto fermo proiettato sullo schermo, meno il fondo in quadratura. Non misurava: nel verde, dove la
scossa è sommata per costruzione, dava 0,00 su 3 scene su 5 (punto fuori quadro, proiezione non lineare, fondo più mosso
della scossa). Resta stampato come informativo.

## Misure (headless, dt = 0,050, stesso build)

| scena | rosso: camera disegnata | rosso: regia | verde: camera disegnata | verde: regia | ampiezza chiesta max |
|---|---|---|---|---|---|
| gi5 rigore segnato | 0,05 | 0,05 | **1,00** | 0,00 | 0,53 u |
| gi8 gol da fuori | 0,04 | 0,04 | **1,01** | 0,01 | 0,22 u |
| gi86 gol di testa | 0,05 | 0,05 | **1,00** | 0,00 | 0,40 u |
| gi8 palo | 0,01 | 0,01 | **1,01** | 0,01 | 0,30 u |
| gi3 palo potenza | 0,13 | 0,13 | **1,08** | 0,08 | 0,37 u |

⚠️ In headless il lerp vale `kp = 0,05·2 = 0,10` a fotogramma (`dt` col tetto a 0,05). Sul telefono a 60 fps vale
`kp ≈ 0,033`: la scossa di prima lì era smorzata **ancora di più**. Questo numero l'ho dedotto dalla formula, non l'ho
misurato sul dispositivo. Il verde invece non dipende dagli fps: la scossa si somma direttamente.

## Correzione (alla sorgente)

Blocco «SCOSSA DEL FOTOGRAMMA» in src/12, subito prima di `renderer.render`. La scossa si somma alla posizione della
camera **disegnata** dopo ogni passata (arbitro d'inerzia, lerp, quadro dell'eroe) e si toglie subito dopo il disegno.
Così nessun lerp la smorza, la regia e il codice 007 non la vedono, e la firma golden della camera (letta fra un
fotogramma e l'altro) resta quella della regia. Ampiezza (0,7 × potenza) e decadimento (×(1−6dt) a fotogramma) sono
quelli di prima; le frequenze passano a 24 e 18 rad **al secondo** (`now/1000`). Col rosso `__CPM_NO_G405` torna
esattamente la riga di prima.

## File e funzioni toccati

- `src/12-three-match-view.jsx` (render-loop di `ThreeMatchView`): riga della scossa (ora solo sotto il rosso) +
  blocco «SCOSSA DEL FOTOGRAMMA» + testimone `__CPM_SCOSSA405` prima del disegno + ripristino della posizione dopo
  `renderer.render`. Codice 007 (`_iner521`, `_bias580`, lerp dello sguardo) non toccato.
- `CARRIER-MANAGER-AV.html`: ricomposto con `tools/build-src.mjs`.
- `tests/visual/scossa-405.mjs` (nuovo), `tests/visual/package.json` (script `scossa-405`).
- `tests/visual/ci-runner.mjs`: `scossa-405` nella riga della MAPPA che esisteva già, `/src\/12-|src\/13-/`.
- `docs/sviluppo/giro405-soglia.md` (soglia dichiarata prima), questo rapporto.

## Dubbi per il PO (la consigliata è la prima, ed è GIÀ APPLICATA)

1. **Frequenza della scossa** — prima il codice usava 24 rad/ms, cioè rumore a frequenza di fotogramma.
   - **A (applicata):** 24 e 18 rad/s, un'oscillazione di circa 3-4 Hz che si spegne in circa 0,4 s, come descrive il
     commento originale.
   - B: tenere il rumore per fotogramma. Ora che arriva intero sarebbe un ronzio di ±0,4 u a ogni fotogramma, cioè
     frenetico a 60 fps.
   - C: rumore liscio (somma di due seni a frequenze non multiple) a 6-8 Hz, più «nervoso» di A.
2. **Ampiezza** — ora che arriva intera, la scossa del gol (0,55 × 0,7 ≈ 0,39 u a circa 14 u di distanza) sposta
   l'immagine di circa l'1,5% del quadro.
   - **A (applicata):** tenere le potenze di prima (0,55 gol · 0,38 legno · 0,15-0,20 in rete).
   - B: dimezzarle se sul telefono risultasse troppo forte.
   - C: renderle proporzionali al peso del momento (gol decisivo, finale).
3. **Contrasti** — la voce del backlog cita «gol, pali, contrasti», ma nel codice **non esiste una scossa sui
   contrasti** (`shakePow` si arma solo su gol, legno, pallone in rete e rigore segnato).
   - **A (applicata):** non aggiungerla in questo giro: il compito era misurare e correggere, non aggiungere effetti.
   - B: aggiungere una scossa leggera (0,10-0,15) al contatto dei tackle duri.
   - C: usare, invece della scossa, un breve zoom in avanti sul contrasto.
4. **Collaudo sul dispositivo** — l'headless prova che lo spostamento arriva intero sul fotogramma disegnato. Se si veda
   «bene» lo giudica il telefono. Proposta: una nota KE su un gol e su un palo.

## Catena

`node ci-runner.mjs giro scossa-405` (guardiano + 17 sentinelle) su build 7.999.216: **18/18 verdi** (scossa-405 116 s · mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile · render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 · partita-vera 642 s · gk-dive-sync · schermate-97). Nessun passo ripetuto.

⚠️ Il gate 14/14 (`validate-situations`, firma golden della camera) non fa parte del giro: lo gira il treno. La correzione non tocca la posizione della regia letta fra un fotogramma e l'altro, ma va confermato lì.
