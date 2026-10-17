# Rapporto giro 55 — PO-278 «Pallone troppo grosso e non ben definito graficamente»

Ramo `sviluppo/pallone-278-giro55`, base `lavoro/172-base` (7.999.171). Solo grafica del pallone 3D: posizione
logica del pallone, archi, quota di riposo 0,22 e motore **non toccati**; GAME_VERSION e SAVE_VERSION invariati
(come gli altri giri di sviluppo: il numero lo dà il rilascio che li unisce). Zona G non toccata.

Richiesta PO (testuale): «Pallone troppo grosso e non ben definito graficamente», con foto dal telefono
dell'ingresso in campo (`docs/governo/foto/po278-pallone-ingresso.jpg` sul ramo `poc/marioprada-character-system`);
precisazione: «il pallone in tutte le partite» (anche in gioco e negli highlight).

## 1. Misura (prima di correggere)

**Foto del PO.** Nell'ingresso il pallone è ai piedi dell'arbitro, al centro del cerchio: una macchia bianca
larga circa quanto le gambe dell'arbitro, con un disco chiaro/ambra sotto. Misura a occhio sulla foto (non
strumentale): diametro della macchia ≈ 0,4 dell'altezza dell'arbitro.

**Codice** (`src/12-three-match-view.jsx`):

| Elemento | Prima | Effetto |
|---|---|---|
| Geometria | sfera r 0,20, 24×16 segmenti | — |
| Scala di base `_bBase534` | 1,10 in gioco/ingresso → 0,53 in scena stretta | diametro reso 0,44u in ingresso |
| Pavimento in pixel (7.862/7.899) | max(8, min(11, 0,25 × uomo)) | in camera larga riporta il pallone a ¼ d'uomo o più |
| Alone `ballHalo` | sfera bianca r 0,29 **fissa**, `depthTest:false`, opacità 0,05–0,28 | bordo sfocato, alone più largo del pallone in scena |
| Ombra `_bShadow534` | piano 1,05u con anello ambra, scala ≥ 0,55 | disco 2,4–4,5 volte il pallone |
| Texture | canvas 256×256 con gradiente radiale, stirato sulla mappa sferica 2:1, senza anisotropia | disegno impastato |

**Sonda** (`tests/visual/pallone-278.mjs`, 412×915, GLB accesi). Grandezza: rapporto fra diametro del pallone a
schermo (lungo il vettore destro della camera, senza scorcio) e altezza a schermo di un uomo di 1,75u in piedi sul
punto del pallone, dal gancio test-only `__CPM_PALL278`. Calcio vero: 22 cm su 180 = **0,12**.

| Fase | Prima (rosso `__CPM_NO_PALL278`) | Dopo |
|---|---|---|
| Ingresso, pallone nel quadro (uomo 32 px) | 9,3 px · **0,29** · alone 0,47 | 6 px · **0,19** |
| Ingresso, geometria (2r/1,75u) | **0,25** | **0,14** |
| Partita, highlight del flusso (uomo 34–47 px) | 8,9 px · **0,26** · alone 0,48 | 7,9 px · **0,17** · alone 0,13–0,42 |
| Highlight forzato gi0 (uomo 67 px) | 11,5 px · 0,17 · alone 0,53–0,62 | 9,4 px · **0,14** · alone 0,05–0,16 |
| Highlight forzato gi40 (uomo 63 px) | 11,8 px · 0,18–0,19 · alone 0,40–0,58 | 9,6 px · **0,15** · alone 0,12–0,16 |

«Alone» = quota di pixel attorno al pallone più chiari del prato ma non bianchi (pallone): 0 = bordo netto.
⚠️ È una misura rumorosa (dipende da cosa c'è dietro il pallone: gambe, ombra ambra): nel rosso gi0 è uscita una
volta a 0,01 con il pallone coperto. Il giudizio stabile è il rapporto; l'alone serve a non far tornare l'alone largo.
Sotto i 7 px e col pallone fuori dal quadro l'alone è **dichiarato non giudicato**.

⚠️ In `playing` il campo è la lavagna 2D (7.917, decisione PO 15/09) e il 3D è sospeso: il pallone 3D «della
partita» si vede negli highlight e nelle loro aperture, ed è lì che si misura. Il pallino della lavagna 2D
(raggio 0,52 del gettone) **non è stato toccato**: se il PO intendeva anche quello, va detto — non posso
confermarlo dalla nota.

## 2. Correzioni (interruttore rosso `window.__CPM_NO_PALL278`)

1. **Taglia**: `_bBase534` 0,62 in gioco/ingresso (diametro 0,25u, rapporto 0,14 — un filo sopra il vero 0,12
   per la lettura dal telefono) → 0,53 in scena stretta (0,21u, rapporto 0,12).
2. **Pavimento in pixel**: 0,16 dell'uomo alla stessa profondità, fra 4 e 9 px (era 0,25, fra 8 e 11). In camera
   larga (uomo 16 px) col minimo a 6 px il rapporto tornava a 0,38: misurato, quindi minimo a 4.
3. **Alone**: resta (fa vedere il pallone dietro i corpi) ma aderisce: raggio 1,12 volte quello reso, opacità ≤ 0,045.
4. **Ombra ambra**: a terra 1,9 volte il diametro reso (si allarga in volo come prima): resta il segno che dice dove
   ricade (7.529/7.537), non un disco che ingrossa il pallone.
5. **Texture**: disegnata per pixel sulla sfera (512×256): sei pannelli con cuciture nette scure + accento teal sugli
   otto vertici, colori pieni senza gradiente, anisotropia fino a 8, sfera 32×24. Il design moderno 5.47.17 resta
   («niente pentagoni retro» era una richiesta PO di allora). Versione arancione alta visibilità per neve/nebbia/tempesta
   invariata nel concetto (base arancione, cuciture scure).
6. **Il pallone posa sul prato**: la quota di riposo 0,22 è un letterale in una ventina di formule (nota 7.794), quindi
   la posizione logica non si tocca; si abbassa solo il **disegno** nel fotogramma (`onBeforeRender`/`onAfterRender`
   sulla `matrixWorld`) della differenza fra 0,22 e il raggio reso, a sfumare fino a quota 0,5.

## 3. Guardiano `pallone-278`

`npm run pallone-278` (in `package.json`, nella catena `grafica` e nella MAPPA `src/12-|src/13-` di `ci-runner.mjs`).
VERDE: rapporto in [0,08; 0,19] (in camera larga, uomo sotto 30 px, fino a 0,27 per il pavimento di leggibilità) e
alone ≤ 0,45 in ingresso, partita e due highlight. ROSSO: col pallone di prima almeno una soglia deve cadere.
Esito: `✅ pallone-278 verde … e il rosso si vede (4 soglie cadute)`. Ingresso in headless: il tempo di scena è
lento e la camera spesso resta sul tunnel; allora vale la geometria (dichiarato). `CPM_ING_MS` allunga l'attesa.

## 4. Foto prima/dopo (412×915, GLB accesi)

`docs/sviluppo/foto-giro55/`: `po278-ingresso-prima-dopo.png` (stessa scena della foto PO: arbitro col pallone al
centro), `po278-partita-prima-dopo.png`, `po278-highlight-prima-dopo.png` e i rispettivi `*-zoom-prima-dopo.png`
(ritaglio ×6 attorno al pallone). ⚠️ Il prima viene da un'altra esecuzione della sonda (stesso seed): la camera
dell'ingresso e della partita non è identica fra i due fotogrammi.

## 5. Guardiani rilanciati

Sul build finale di questo ramo (CARRIER-MANAGER-AV.html ricomposto, `check-src` identico), tutti exit 0:

| Guardiano | Esito | Tempo |
|---|---|---|
| `pallone-278` | verde; rosso visto (4 soglie cadute) | ~9 min |
| `test:logic` · `design-system` · `save-compat` | verdi | 5 s · 0 s · 17 s |
| `griglia-mobile` | verde (scatti rigenerati in `docs/collaudo-grafico` NON committati) | 217 s |
| `career-critical` | verde | 761 s |
| `validate-situations` (gate) | ✅ PASS 14/14, fingerprint `00001505` | 831 s |
| `piedi-252` (contatto piede-palla) | verde | 407 s |
| `contatto-53` | verde | 90 s |
| `scene-open-ball` | verde | 62 s |
| `gesture-window` | verde | 70 s |
| `gk-dive-sync` | verde | 211 s |
| `goal-postarc` (arco della conclusione) | verde | 227 s |
| `ball-attended` | verde | 164 s |
| `rete-252` (pallone in rete) | verde | 500 s |
| `aereo-252` (cross aereo) | verde | 330 s |

Non rilanciata la catena completa né il resto della MAPPA `src/12-` (38 voci): spetta al rilascio che unisce il ramo.

## 6. Cosa resta fuori

- Il pallino della lavagna 2D in `playing`.
- `taglia-pallone.mjs` (sonda del 7.899, senza soglie) non è stata riscritta: misura col gancio `__CPM_TAGLIA862`,
  che resta.
- La resa sul telefono va collaudata dal PO: l'headless rende a 8–25 fps e senza GPU.
