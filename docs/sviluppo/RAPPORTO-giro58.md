# Rapporto giro 58 — walkout-fermi-197 · pillola d'esito · pallino 2D (PO-278)

Ramo `sviluppo/seguito-172-giro58`, base `lavoro/172-base` (7.999.171). Toccati: `src/15-live-match.jsx` (pallino 2D,
pillola d'esito) e tre guardiani in `tests/visual`. Motore, 3D, salvataggi: **non toccati**. GAME_VERSION e
SAVE_VERSION invariati (il numero lo dà il rilascio che unisce i giri).

## 1. Guardiano `walkout-fermi-197` (rosso sulla base)

**Causa misurata.** Con la sonda di misura (`__CPM_WALK245` = tempo di scena dell'ingresso, `__CPM_WALKDUR245` = durata)
sulla base: in headless con i corpi GLB il tempo di scena dell'ingresso scorre a **~0,15 s per secondo reale**
(walkT 10,97 → 22,32 s in 69 s reali). Il guardiano campionava **12 s reali**, cioè ~2 s di un ingresso da **38,5 s di
scena**: nessun corpo era ancora arrivato al posto, e la «corsa sul posto» nasce proprio all'arrivo. Esito della
prima stesura sulla base: verde `somma 0`, rosso `somma 0` → rosso per cecità (il braccio rosso non raggiungeva 15).
L'ipotesi del giro 54 è **confermata**.

**Riscrittura.** Campione ogni **0,5 s di tempo di scena** (letto da `__CPM_WALK245`, svuotato a ogni lettura per non
farlo crescere), per **tutto** l'ingresso fino all'uscita dalla fase `walkout`; i due bracci girano in parallelo.
Cecità dichiarata: copertura dell'ingresso < 90%, meno di 20 corpi o meno di 16 campioni = rosso. Soglie invariate
(rosso ≥ 15, verde ≤ rosso/3, picco verde ≤ 2). Funziona per qualunque durata dell'ingresso.

| Ramo | Ingresso (scena) | Campioni | Verde (somma · picco) | Rosso `__CPM_NO_FERMI197` (somma · picco) | Tempo reale | Esito |
|---|---|---|---|---|---|---|
| base 7.999.171 (prima stesura) | 38,5 s | 24 (tempo reale) | 0 · 0 | 0 · 0 | 4 min 42 s | ❌ cieco |
| base 7.999.171 (riscritto) | 38,5 s | 76 | **5 · 1** | **19 · 1** | 7 min 21 s | ✅ |
| `sviluppo/ingresso-277-giro54` (riscritto, worktree a parte, non unito) | 24,0 s | 48 / 47 | **3 · 1** | **20 · 5** | ~5 min 40 s | ✅ |

Il giro 54 è stato provato in una cartella `git worktree` separata (build dai suoi frammenti, `check-src` identico),
poi rimossa: nessun suo commit è entrato in questo ramo.

## 2. Pillola «PALLA PERSA» sopra il tabellone

**Elemento.** È la pillola d'esito `floatGoal` (`src/15-live-match.jsx`, contenitore `data-cpm="fg-slot"`), la stessa
per GOL!/PARATA/PALLA PERSA. Il maiuscolo viene da `textTransform:"uppercase"`; il testo «✂️ Palla persa» da
`_MISS_OVL.intercepted` (`src/05`, famiglia `intercepted`/`dispossessed`/`beaten`).
**Quando compare:** fase `hl_result`, highlight fallito, al momento dell'esito reale nel 3D (`outcomeRevealRef`, ripiego
2600 ms); vive 1,4 s con `floatUp` (sale di 60 px e svanisce).

**Misura (prima).** `top:"7%"` del campo + salita di 60 px: a fine corsa la pillola arriva **sul** fondo del tabellone.
Guardiano `pillola-58` (geometria del rettangolo a riposo e a fine corsa, tabellone `[data-cpm="barra"]` con fondo a 97 px):

| Viewport | Prima (rosso `__CPM_NO_PILLOLA58`) | Dopo |
|---|---|---|
| 412×915 | riposo 157 · fine corsa 97 → **0 px** dal tabellone | riposo 176 · fine 116 → **19 px** |
| 412×740 | riposo 145 · fine corsa 85 → **−12 px** (oltre il bordo; il campo la taglia) | riposo 176 · fine 116 → **19 px** |

Su un campo più basso il 7% è meno di 60 px: la pillola sale oltre il bordo del campo, che la taglia (`overflow:hidden`),
e sembra infilarsi nel tabellone. **Correzione:** `top:"max(7%, 76px)"`. Foto prima: `docs/sviluppo/foto-giro58/pillola-prima-412x915.png`.

## 3. PO-278 — pallino 2D (decisione PO 17/10 «Anche il pallino 2D»)

Lavagna 2D in `playing` (`data-cpm="campo2d"`). Testimone inerte `__CPM_PALL2D` (raggi disegnati) + pixel letti dal
canvas **nello stesso fotogramma** del disegno (un rAF registrato dopo quello del campo). Guardiano `pallino-278`.

| Misura a 412×915 (dpr 1) | Prima (rosso `__CPM_NO_PALL2D`) | Dopo |
|---|---|---|
| Raggio pedina r | 7 px | 7 px |
| Raggio pallino | 3,64 px | 2,38 px |
| **Diametro pallino / diametro pedina** (disegno) | **0,52** | **0,34** |
| Diametro della parte bianca / pedina (pixel) | 6 px · 0,43 | 3 px · 0,21 |
| Disegno | gradiente bianco→ardesia, bordo 0,9 px al 55%, ombra larga quanto lui | bianco pieno, bordo scuro pieno (≥1 px), macchia centrale scura, ombra stretta |

Foto 412×915 prima/dopo e ingrandimenti ×5 dallo stesso fotogramma della misura:
`docs/sviluppo/foto-giro58/pallino-{prima,dopo}-412x915.png`, `pallino-{prima,dopo}-zoom5.png`.
Soglie del guardiano: verde 0,25 ≤ rapporto ≤ 0,40; rosso ≥ 0,50.

## 4. Rituali

Catena `node ci-runner.mjs mirata origin/lavoro/172-base` (nucleo + MAPPA di `src/15`, che include `validate-situations`)
più `griglia-mobile` a parte (non è nella MAPPA di `src/15`), sul commit `5dbebf8` (build identica ai frammenti).

- **Catena mirata: 36/37 verdi** — test:logic · save-compat · design-system · typing-shortcuts · career-critical ·
  validate-situations · partita-vera · pallino-278 · pillola-58 · e gli altri 27 guardiani della MAPPA di `src/15`.
- ⚠️ `spot-266` **instabile** (verde alla seconda prova, gi64 incollato alla bandierina): è il difetto noto PO-266,
  già fuori dalla catena completa per lo stesso motivo.
- ❌ `pressing-143` **rosso, e rosso anche sulla base** `lavoro/172-base` (provato in una cartella a parte: «verde:
  marcatore a 5,73 m, atteso ≤ 3,5»). Questo giro non tocca `src/12`/`src/13`/`src/14`, dove vive il pressing: non è
  una regressione del giro, ma non l'ho indagato.
- `griglia-mobile`: uscita 0 (sul prepartita dichiara «NON misurato: playMatch → nomatch», come già scritto dal
  guardiano stesso). Gli scatti rigenerati in `docs/collaudo-grafico/g0/` e il registro `docs/governo/STABILITA.json`
  **non sono committati** (artefatti del giro, per non creare conflitti con gli altri rami).

## Decisioni per la sessione principale

1. **Taglia del pallino 2D.** (a) 0,30 della pedina; (b) **0,34 — consigliata, applicata**: a dpr 1 resta un pallone
   leggibile (bianco con bordo e macchia), sotto i 0,40 di un uomo visto dall'alto; (c) 0,40: più visibile sui
   telefoni con dpr basso, meno «proporzionato».
2. **Durata di `walkout-fermi-197`** (nella catena `grafica`): ora 6-7 minuti reali, perché l'ingresso va guardato
   tutto e in headless scorre a ~0,15×. (a) **lasciarlo nella catena grafica — consigliata** (è il solo modo di vedere
   gli arrivi); (b) spostarlo nella catena `notte`; (c) aggiungere un acceleratore di scena test-only per l'ingresso
   (tocca `src/12`, quindi catena completa).
3. **Margine del verde sulla base**: verde 5 contro soglia 6,3 (= 19/3). Regge, ma stretto. (a) **lasciare le soglie —
   consigliata** (sul giro 54 il margine è largo: 3 contro 6,7); (b) giudicare anche il picco del rosso (5 sul giro 54,
   1 sulla base: sulla base il rosso è diffuso, non concentrato).

## Non verificato

- Causa del rosso di `pressing-143` (pre-esistente sulla base).

- **Che la pillola segnalata dal giro 54 fosse proprio questa**: non c'è una foto del PO; l'elemento è l'unico con quel
  testo in maiuscolo vicino al tabellone, e la misura mostra che ci arriva contro. Se il segnalatore intendeva il
  maxischermo 3D dello stadio, **non posso confermarlo**.
- Pallino 2D su telefono vero (dpr 2-3): misurato solo a dpr 1 in headless. A dpr maggiore il disegno è più nitido,
  ma non l'ho fotografato.
- `walkout-fermi-197` sul runner della CI: la velocità del tempo di scena lì non è misurata; il tetto reale è 600 s
  per braccio (`CPM_WF_TETTO`), i due bracci in parallelo.
- La pillola in layout largo (non telefono) e in orizzontale: non misurata.
