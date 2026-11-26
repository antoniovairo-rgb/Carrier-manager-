# Rapporto giro 404 — fluidità in partita sui telefoni lenti (PO-580, PO-581)

Ramo: `sviluppo/giro404-fluidita` (base `lavoro/201`, ccbed19). GAME_VERSION e `docs/governo` non toccati.

⚠️ Le righe di PO-580 e PO-581 **non ci sono** in `docs/governo/BACKLOG.md` di questa base, e nemmeno
`docs/sviluppo/giro297/VALUTAZIONE-SKILL-GAMEDEV.md`: ho lavorato sul testo delle due voci come mi è stato dato nel compito.

## 1. Cosa ho misurato prima di correggere

Banco: telefono emulato 412×915 (isMobile, tocco, dpr 2 → pixelRatio di partenza 1,5), corpi 3D accesi, notte, partita vera
dal prompt della carriera (sonda `tests/visual/fluidita-404.mjs`).

1. **In gioco fluido il ciclo 3D è fermo.** Il contatore delle chiamate del controllo (`__CPM_ADA404.n`) resta fermo per tutto
   `playing` (misurato: 55 per 100 s di fila) e cresce solo nelle fasi `hl_*`. È coerente con la nota di CLAUDE.md «in gioco
   fluido il campo è 2D». Quindi la misura del fotogramma si fa **solo negli highlight**: la sonda forza scene a ciclo (8 scene,
   una ogni 5 s) e conta gli intervalli fra due `requestAnimationFrame` solo quando la fase è `hl_*`.
   La prima stesura della sonda misurava in `playing` e non vedeva niente: 17-18 intervalli in 25 s, testimone fermo.
2. **Il banco headless è un telefono lento anche senza freno.** Negli highlight, CPU non rallentata: 7-13 fps coi corpi accesi
   (fotogramma mediano 166,7 ms), ~11 fps anche coi corpi spenti. Il banco quindi **non ha un telefono fluido**: vedi §3 per come
   ho giudicato «senza rallentamento non cambia niente».

## 2. La correzione (alla sorgente)

| File | Punto | Cosa cambia |
|---|---|---|
| `src/12-three-match-view.jsx` | subito dopo `renderer.setPixelRatio(...)` della partita (r. ~621) | nuovo stato `_a404` + funzione `_adatta404(now,raw)` |
| `src/12-three-match-view.jsx` | ciclo di disegno, accanto all'EMA `__CPM_FPS708` (r. ~4450) | una chiamata `_adatta404(now,_raw708)` a fotogramma |
| `src/16-scene-3d-cerimonie.jsx` | `ParataBus3D` (r. ~2112) | costruttore WebGL in `try/catch` (ritorno pulito senza WebGL) e tetto di nitidezza 1,6 (era 2), come le altre scene |
| `CARRIER-MANAGER-AV.html` | ricomposto con `tools/build-src.mjs` (check-src identico) | — |
| `tests/visual/fluidita-404.mjs` | nuovo guardiano | — |
| `tests/visual/package.json` | script `fluidita-404` | — |
| `tests/visual/ci-runner.mjs` | `fluidita-404` nelle righe della MAPPA che esistono già (`src/12-|src/13-` e `src/16-`) e in `LENTI` | — |

**Regola (solo telefono, `!isDesktop`):**
- media mobile del tempo vero del fotogramma (α 0,1);
- **lento** se la media supera 1/24 s, **fluido** se scende sotto 1/45 s (fra le due soglie non si conta niente: isteresi);
- 1,5 s di lento di fila → pixelRatio −0,25; 4 s di fluido di fila → +0,25; almeno 2 s fra due passi;
- **pavimento dichiarato 1,0** (un pixel di disegno per pixel CSS), mai sotto; tetto = il pixelRatio di partenza (1,5 sul telefono);
- se torna lento entro 10 s da una risalita, l'attesa per la risalita successiva raddoppia (fino a 60 s): niente altalena;
- il passo è `renderer.setPixelRatio`, che ridimensiona la tela (stessa dimensione CSS): nessuna allocazione per fotogramma.
- Sotto `?cpmtest=1` è spenta come ogni regola di presentazione (il gate e i golden non cambiano); la arma `__CPM_ADATTA404`.
- Testimone `window.__CPM_ADA404` (`base`, `pr`, `pav`, `ft`, passi `giu`/`su`). Rosso `window.__CPM_NO_G404` = pixelRatio fisso
  come prima (e, nella parata, tetto 2 come prima).
- Solo collaudo: `__CPM_FT404` dichiara al controllo un tempo del fotogramma (le durate restano in tempo vero), letto solo sotto `?cpmtest=1`.

Invarianti rispettati: «il tocco passa prima del disegno 3D» (giro 219) — il controllo non tocca la cessione dei fotogrammi né il
rilascio rimandato, e un passo di risoluzione non avviene mai dentro un clic; «il banco e il sito girano la pagina già tradotta»
(giro 237) — la sonda usa `startServer` del banco, nessun Babel nel browser.

## 3. Misure prima/dopo (guardiano `npm run fluidita-404`)

Freno CDP `Emulation.setCPUThrottlingRate` 4, assestamento 10 s, finestra 40 s di pagina (intervalli solo in `hl_*`).

| Braccio | pixelRatio inizio → fine | passi giù/su | intervalli | fotogramma mediano | p90 |
|---|---|---|---|---|---|
| lento (CPU ×4, adattiva) | 1,5 → **1,0** | 2 / 0 | 255 | **150,0 ms** | 183,4 |
| lento-rosso (CPU ×4, `__CPM_NO_G404`) | 1,5 → 1,5 | 0 / 0 | 183 | 216,7 ms | 266,7 |
| fluido (tempo dichiarato 1/60) | 1,5 → 1,5 | 0 / 0 | 253 | 166,6 ms* | 183,4 |
| ritorno (0,1 s per 12 s, poi 1/60) | 1,5 → 1,0 → **1,5** | 2 / 2 | — | — | — |
| libero (CPU ×1, adattiva) — solo misura | 1,5 → 1,0 | 2 / 0 | 375 | 100,0 ms | 133,3 |
| libero-rosso (CPU ×1) — solo misura | 1,5 → 1,5 | 0 / 0 | 240 | 166,7 ms | 200,0 |

\* il braccio «fluido» gira sul banco vero (lento): il numero del fotogramma non è quello di un telefono fluido, si giudica solo
che il pixelRatio non si muova.

- Con CPU ×4: fotogramma mediano **−31%** (150 contro 216,7 ms), p90 −31%.
- Sul banco senza freno (che è comunque a ~6 fps): −40% (100 contro 166,7 ms). Dichiarato, non giudicato.
- Serie del braccio «ritorno» tornato fluido: 1 ×7 campioni · 1,25 ×3 · 1,5 da lì in poi (nessuna altalena).

**Prova del rosso** (`CPM_ROSSO=1`, i bracci adattivi col rosso acceso): ✅ boccia su V1 (pixelRatio fermo 1,5), V2 (233,3 contro
216,7 ms: nessun miglioramento) e V5 (non scende, non risale).

Criteri del verde (soglie dichiarate qui, non si abbassano): V1 lento scende e mai sotto il pavimento · V2 mediano lento ≤ 90% del
rosso · V3 fluido nessun passo · V4 il rosso non si muove · V5 ritorno arriva al pavimento e risale alla partenza · nessun errore di
pagina · un braccio con meno di 30 intervalli o senza testimone = non giudicato = rosso.

## 4. Catena del giro

`node ci-runner.mjs giro fluidita-404` (guardiano + 17 sentinelle): esito in §6. `docs/governo/STABILITA.json`, che il runner
scrive, è stato riportato com'era prima del commit (regola del giro: non toccare `docs/governo`).

## 5. Dubbi per il PO (la consigliata è la prima, ed è GIÀ APPLICATA)

**D1 — Pavimento della risoluzione.**
1. **1,0 (applicata)**: un pixel di disegno per pixel CSS; sul telefono il campo resta nitido come una pagina web, guadagno di
   fotogramma misurato −31% con CPU ×4.
2. 0,75: guadagno più alto sui telefoni molto lenti, ma i numeri di maglia e i nomi in 3D diventano sgranati.
3. Pavimento per dispositivo (0,75 se `deviceMemory` ≤ 2, altrimenti 1,0): più fine, ma un ramo in più da collaudare per telefono.

**D2 — Come giudicare «senza rallentamento non cambia niente» sul banco.** Il banco headless negli highlight sta a 7-13 fps anche
senza freno, cioè È un telefono lento: senza freno la regola scende (giustamente) anche lì.
1. **Tempo del fotogramma dichiarato dalla sonda (`__CPM_FT404`, solo `?cpmtest=1`) (applicata)**: prova la regola e l'isteresi
   con un telefono a 60 fps che il banco non ha; la misura vera del miglioramento resta quella col freno CDP.
2. Collaudo sul telefono vero del PO con il testimone `__CPM_ADA404` nella nota del taccuino (passi giù/su e pixelRatio): l'unico
   giudice reale di «fluido»; da aggiungere al contesto della bozza-nota se il PO lo vuole.
3. Giudicare il braccio senza freno sul banco: impossibile senza abbassare la soglia di «lento» sotto i 7 fps del banco — scartata.

**D3 — Dove vale la regola.**
1. **Solo partita (`ThreeMatchView`) sul telefono (applicata)**: è dove il PO ha misurato i fotogrammi lenti (`__CPM_FPS708`).
2. Anche le cerimonie di src/16 (premiazione, festa, parata): durano pochi secondi, la regola ha bisogno di 1,5 s per il primo
   passo; guadagno piccolo, rischio di un cambio di nitidezza a vista.
3. Anche su PC: escluso, sul PC il fotogramma non è il collo di bottiglia misurato.

**D4 — Soglie lento/fluido (24/45 fps).** 1. **24/45 (applicata)**, banda larga contro l'altalena · 2. 30/50, più aggressiva ·
3. una sola soglia con solo l'attesa come isteresi.

## 6. Esito della catena

`node ci-runner.mjs giro fluidita-404` su 7.999.216: **18/18 verdi** — mappa-unica 0 s · test:logic 3 s · save-compat 1 s ·
replay 49 s · migrazione-194 27 s · design-system 1 s · tema-unico 15 s · griglia-mobile 191 s · render-3d-023 37 s ·
tunnel-285 190 s · home-298 120 s · web-237 52 s · **fluidita-404 246 s** · career-critical 319 s · battito-264 397 s ·
partita-vera 673 s · gk-dive-sync 184 s · schermate-97 120 s. Nessun passo rilanciato.
Prova del rosso eseguita a parte (`CPM_ROSSO=1 npm run fluidita-404`): ✅ rosso atteso (§3).
