# Rapporto sviluppatrice — giro 12 · PO-229, lato del portiere sul tiro al palo

Ramo `sviluppo/portiere-lato-229`, partito da `poc/marioprada-character-system` a `7e4fcb0` (7.999.164).
Zona G non toccata. Nessun bump di `GAME_VERSION` (si assegna all'integrazione). Righe citate: sorgente **dopo** la modifica.

## 1. Difetto di partenza

Catena mirata del 13/10 (7.999.163), macchina carica: `gk-miss-229` rosso 2 prove su 2 su «alvolo gi6 post: gk_block dalla
parte opposta al pallone». Ipotesi consegnata (da verificare): a basso fps il lato si sceglie su una stima vecchia.

## 2. Misura (prima di toccare)

Strumento: `gk-miss-229` con due aggiunte di sola sonda — `CPM_LENTO=<k>` (CPU della pagina rallentata k volte via CDP
`Emulation.setCPUThrottlingRate`, ripetibile, senza secondo processo) e `CPM_DUMP` numerato per corsa, con `fps` reali
(`__CPM_FPS708`) e l'armamento `__CPM_GK229ARM` salvati accanto ai fotogrammi del testimone `__CPM_GK229`.

| corsa | gi6 «Tiro al volo», palo | rossi «lato opposto» |
|---|---|---|
| CPU normale, 3 prove | | **2 su 3** |
| CPU ×6, 3 prove (fps reali ~8-12) | | 0 su 3 |
| CPU normale, 8 prove | | 0 su 8 |

**L'ipotesi del basso fps non regge.** Il passo di scena è tappato: `src/12-three-match-view.jsx:3310`
(`_rdt=Math.min(_raw708,0.05)`), quindi il testimone vede ~0,031-0,036 s di scena fra due fotogrammi dell'arco sia a CPU normale
sia a CPU ×6 (11-15 fotogrammi d'arco in tutte le corse). Il rosso dipende dalla **geometria del tiro**, che cambia da una corsa
all'altra perché il bersaglio dell'arco non è seedato (z del bersaglio misurata da −2,88 a +2,52 sulla stessa scena).
Non posso confermare perché nella catena carica il rosso sia uscito 2 su 2 e da solo 0 su 10: con 2 rossi su 14 corse nelle mie
misure, la frequenza è compatibile anche col caso.

**Meccanismo misurato.** Sul palo l'arco muore **davanti** al portiere (fine arco x 42-46, portiere a x ~47,1) e il pallone passa il
suo piano nel post-arco `hit_post` (`src/12:4252-4254`): due lerp esponenziali, x verso la linea 48,6 a 6,5/s, z verso il palo del
**segno del bersaglio** (±3,66; traversa: z del bersaglio entro ±3,2) a 4/s. Il riflesso v2 (`gk_block`) estrapolava la velocità
**dell'arco** fino al piano: quando il bersaglio sta appena oltre lo zero e l'arco gli arriva dall'altro lato (gi6 parte da z −3,75),
l'arco dice «+» e il palo porta il pallone a «−». Nella corsa rossa il riflesso andava da z 0,83 a 3,83 (tetto +3).

Il punto di passaggio sul post-arco ha una forma chiusa: `z = pz − (pz − z_bersaglio) · r^(4/6,5)`, con `r` = distanza dalla linea al
piano del portiere / distanza dalla linea alla fine dell'arco. Verificata sui passaggi misurati: **2,03 / 2,05 · 2,33 / 2,34 ·
−3,31 / −3,22** (calcolato / misurato).

## 3. Correzione (`src/12-three-match-view.jsx`)

- **:5472-5478** — all'armamento del riflesso/tuffo su tiro sbagliato: se l'esito è `post` e l'arco muore prima del piano del
  portiere, il punto di passaggio `_zp229` è quello calcolato sul post-arco (formula sopra), memorizzato in `oppMesh._zpost229`.
  Il lato del gesto (`oppDiveDir`), la scelta riflesso/tuffo (soglia 1,2u) e la distesa all'80% leggono quel punto.
- **:7451** — nel rimirare per fotogramma del riflesso v2: finché l'arco è vivo e muore prima del piano, **non** si estrapola la sua
  velocità (punterebbe dall'altra parte); dopo l'arco si torna a estrapolare la velocità vera del pallone.
- **:5418-5420** — gancio di sola sonda (`_CPM_TEST`), `window.__CPM_GK229GEO={tz,gz,dx}`: forza bersaglio z, z del portiere e un
  arco che muore `dx` prima del suo piano, solo su tiro/testa con esito palo. Inerte nel gioco.
- Interruttore rosso nuovo: **`window.__CPM_NO_GK229L`** (spegne i due punti sopra, comportamento 7.999.164).

Fuori ambito, non toccato: tiri `wide/out` (il post-arco `deflect` prende già il verso del tuffo, `oppDiveDir`, e nessuna misura
lo ha mostrato sbagliato), gesti del portiere sulle parate, la durata dei gesti.

## 4. Guardiano esteso (`tests/visual/gk-miss-229.mjs`)

Braccio nuovo **«palo-geo»** (2 corse, default): gi6 palo con geometria forzata (bersaglio z −0,3, portiere z 0,5, arco che muore
2,5u prima del suo piano) e **CPU ×4** (`CPM_LENTO_GEO`, fps reali misurati 7-14). Un verso «non giudicabile» su questa scena è
rosso (il braccio deve guardare). `CPM_GEO=0` lo spegne, `CPM_ROSSO=L` arma `__CPM_NO_GK229L`.

| braccio palo-geo | esito |
|---|---|
| col gioco (2 corse separate + 2 corse dentro le due passate complete in parallelo) | **verde 6/6**: tuffo verso il pallone, z 0,5 → −0,77, passaggio a z −1,0 |
| `CPM_ROSSO=L` | **rosso 2/2**: `gk_block` da z 0,5 a 3,5, pallone a z −1,1 |

Guardiano completo, due passate **in parallelo** (macchina carica, come nella catena mirata): braccio palo-geo e gi6 verdi in
entrambe; la prima passata verde, la seconda rossa per il difetto qui sotto.

## 5. Difetto trovato, non corretto (preesistente, fuori ambito)

«girata P6S post: tuffo su un pallone largo (passa a 6,5u, esce a 5,6-6,6u dal centro)». Compare **con e senza** la correzione
(5 corse per braccio in parallelo: 1 su 5 in entrambi) e non passa dal ramo toccato (lì l'arco finisce **oltre** il portiere).
Dai dati dell'armamento: sulla girata con esito palo il **bersaglio dell'arco sta a z 6,0-8,8**, fuori dai pali (3,66), quindi il
post-arco `hit_post` porta il pallone sulla linea a z 5-6: il «palo» è preso da fuori, e il portiere si tuffa (tetto 4,5u) su un
pallone che non è nello specchio. È un difetto del bersaglio dell'arco del palo sulla girata (scena costruita da
`scenaDalMotoreSpalle`), non del portiere. Proposta per il prossimo giro: misurare dove si fissa il bersaglio del palo per le scene
del motore e, sull'esito palo, tenerlo entro i pali come già fa il clamp ±3,3 delle conclusioni in porta (`src/12:5288`).
Effetto sul guardiano: rosso possibile 1 corsa su ~5 sulla girata palo; `ci-runner` riprova un rosso una volta.

## 6. Verifiche

- `CPM_FORZA_BUILD=1 node tools/build-src.mjs` → `node tools/check-src.mjs`: identico byte per byte.
- Catena mirata: 48/49, vedi sezione 7.

## 7. Catena mirata (`cd tests/visual && node ci-runner.mjs mirata`)

Eseguita sul ramo, build del commit `30465a1`, base `origin/main`: il confronto include anche i file della 7.999.164 non ancora su
`main` (src/05, 07, 12, 14, 15, 18), quindi **49 passi**. Esito: **❌ 48/49 verdi**.

- Verdi, fra gli altri: `gk-miss-229` (407 s, col braccio palo-geo), `gk-dive-sync`, `goal-postarc`, `buildup-sync`, `po229-gi38`,
  `esiti-218`, `cross-218`, `scene-221`, `validate-situations` (gate), `partita-vera`, `career-critical`, `save-compat`, `test:logic`.
- **Rosso: `nomi-219`**, 2 prove su 2 (8.492 s in tutto): «verde: vicini 89% su 18 nominati (servono >=90% su >=12)»; il suo
  braccio rosso separa (71% contro 89%). Misura quanti compagni nominati dal testo della manovra stanno entro 25u dall'eroe
  all'apertura della scena, su 8 partite vere. La mia modifica tocca solo il gesto del portiere su un tiro sbagliato con esito palo
  e un gancio di sonda inerte fuori da `?cpmtest=1`: non vedo un percorso dal diff a questa misura, ma **non posso confermarlo**
  senza una corsa di `nomi-219` sulla base 7.999.164 (2 ore e 20 minuti a corsa: non fatta in questo giro). Da verificare
  all'integrazione; lo scarto è di un punto sulla soglia (16 vicini su 18 = 89%, ne servono 17).

Il registro della corsa è in `docs/governo/STABILITA.json` (scritto da `ci-runner`).
