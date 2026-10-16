# Rapporto giro 39 — PO-171 «Via CH38 ovunque (cerimonie, ritratto dei menu, download), corpi caricati in anticipo»

Ramo `sviluppo/via-ch38-171-giro39`, base `lavoro/170` (7.999.170). GAME_VERSION e SAVE_VERSION invariati. Zona G non toccata.

## In breve

- Il CH38 vero (`footballer.glb` + 11 clip `anim-*.glb`) veniva **scaricato a ogni avvio** da un pre-caricamento del 6.95.0
  che **nessuna scena usa più**. Spento: **−12 file e −4,08 MB a ogni avvio** (39,59 MB di `.glb` contro 43,59 MB).
- Cerimonie: tutte quelle che hanno dei corpi usano **già** i corpi CGTrader per impostazione predefinita. Il corpo «regular» vi
  compare solo nei rami di ripiego (file CGTrader mancante o interruttore rosso). Nessuna sostituzione da fare, misurato.
- Ritratto dei menu: oggi è una **figurina 2D** (`voltoUrl` → `assets/portraits/ai`). Il codice del ritratto 3D CH38 è morto:
  nessun percorso lo chiama. Nessuna sostituzione da fare.
- Pacchetto store (`tools/build-dist.mjs`): il CH38 vero non entra più nella dist, **−10,99 MB** (11.523.372 byte).
- **Non sostituito**: il corpo «regular» (`korward-regular-*`, chiamato «corpo CH38» nel codice della partita, 23 file, 8,43 MB).
  La partita lo monta ancora sotto i corpi CGTrader. Spiegazione sotto.

## 1. Censimento (prima di toccare)

Misurato con `tests/visual/via-ch38-171.mjs`: GLB acceso, contesto nuovo a ogni percorso (cache fredda), service worker
bloccato, ogni richiesta `.glb` registrata.

| Percorso | `.glb` richiesti | CH38 vero (footballer/anim-) | corpo «regular» | totale `.glb` |
|---|---|---|---|---|
| home (12 s di menu) | 40 | 12 file · 4,08 MB | 22 file · 8,35 MB | 43,59 MB |
| carriera (plancia, 12 s) | 40 | 12 · 4,08 MB | 22 · 8,35 MB | 43,59 MB |
| presentazione (serata, corpi CGTrader 7) | 40 | 12 · 4,08 MB | 22 · 8,35 MB | 43,59 MB |
| partita (fino a corpi pronti) | 41 | 12 · 4,08 MB | 23 · 8,43 MB (+ `regular-anim-walk` a freddo) | 43,67 MB |

(La prima stesura della sonda contava le due famiglie insieme: 34 file / 12,43 MB in home.)

Dove nasce ogni richiesta e dove il gioco mostra i corpi (codice):

| Luogo | File:riga | Cosa carica / mostra | Stato |
|---|---|---|---|
| Pre-caricamento 6.95.0 al boot | `src/11-ui-kit-highlight.jsx:1460-1473` | `footballer.glb` + 11 `anim-*.glb` | **nessun consumatore** → spento |
| Pre-caricamento PO-237/PO-241 al boot | `src/11-ui-kit-highlight.jsx:1475-1510` | corpo «regular» + slim/stocky + 19 clip + corpi CGTrader | serve la partita → resta |
| Partita: corpi dei 22 | `src/12-three-match-view.jsx:982, 1042` | corpo «regular» + clip, sotto i corpi CGTrader | resta (vedi §4) |
| Partita: scambio corpo «pieni/leggeri» | `src/12-three-match-view.jsx:1711` | `footballer.glb`/`footballer-lite.glb` | solo gancio di prova `__CPM_SETBODY907`, nessuna UI |
| Premiazione in campo | `src/12` (corpi della partita) | corpi CGTrader | già CGTrader (foto) |
| Intro / video | `src/19-app-root.jsx:386` | `cgtrader-review-lod1-kit-adapter.glb` | già CGTrader; «regular» solo con `__CPM_NO_CGINTRO` |
| Presentazione squadra | `src/16-scene-3d-cerimonie.jsx:1110` | CGTrader lod1 | già CGTrader; «regular» solo con `__CPM_NO_PRES200` |
| Pullman / festa | `src/16-scene-3d-cerimonie.jsx:1653` | CGTrader lod1 | già CGTrader; «regular» solo con `__CPM_NO_PULLMAN23` o file mancante |
| Galà | `src/16-scene-3d-cerimonie.jsx:2049, 2063` | presentatori Rocketbox (`actor-presenter*.glb`, non CH38); eroe CGTrader lod0 solo col varco `__CPM_GALA_EROE51` | niente CH38 |
| Intervista 3D | `src/16-scene-3d-cerimonie.jsx:442` | corpo «regular» per l'eroe | montata solo con `__CPM_NO963`: di default l'intervista è 2D (`InterviewScena2D`) |
| Ritratto dei menu | `src/01-bootstrap-tema-avatar.jsx:672-740` | `renderHeroPhoto` (corpo «regular»), `AvatarPhoto` (`avatar-<id>.png`, render CH38) | **nessun chiamante**: i menu mostrano `Figurina` (ritratti AI) |

## 2. Sostituzioni

| Luogo | Cosa cambia | Interruttore rosso | Prova |
|---|---|---|---|
| Download al boot (6.95.0) | il pre-caricamento del CH38 vero non parte più | `__CPM_NO_CH38_PREFETCH` (riparte com'era) | verde 0 file CH38 sui 4 percorsi · rosso 12 file / 4,08 MB in home |
| Corpi caricati in anticipo | `regular-anim-walk` (camminata dell'ingresso) entra nel pre-caricamento PO-237: prima la partita la chiedeva a freddo | — (aggiunta di un file alla lista, 85 KB) | partita: 29 richieste invece di 41, nessuna a freddo per la camminata |
| Pacchetto store | `build-dist` esclude `assets/footballer*.glb` e `assets/anim-*.glb` | `CPM_DIST_CON_CH38=1` | `dist/assets` 341.503.055 byte contro 353.026.427 (−10,99 MB); `validate-dist` verde (offline, zero errori di console) |

Le cerimonie non hanno avuto bisogno di sostituzioni: le ho misurate e fotografate, e mostrano già i corpi CGTrader.
Interruttori `__CPM_NO_CH38_<LUOGO>` per le cerimonie non ne ho aggiunti: non c'è niente da ripristinare. I rossi esistenti
(`__CPM_NO_PRES200`, `__CPM_NO_PULLMAN23`, `__CPM_NO_CGINTRO`, `__CPM_NO963`) riportano già il corpo «regular» in quei luoghi.

## 3. Peso risparmiato

- **A ogni avvio** (home, carriera, presentazione, partita): −12 richieste, **−4,08 MB** di `.glb` (43,59 → 39,59 MB).
  Su rete lenta sono 12 file in meno che si contendono la banda col pre-caricamento dei corpi CGTrader.
- **Pacchetto store**: **−10,99 MB** (`footballer.glb` 3,25 MB, `footballer-uno.glb` 3,35 MB, `footballer-lite.glb` 1,99 MB,
  35 `anim-*.glb` 2,40 MB).

## 4. Luoghi non sostituiti e perché

1. **Il corpo «regular» nella partita (23 file, 8,43 MB, scaricato dal menu in anticipo).** Il codice della partita lo chiama
   «corpo CH38»: è il corpo su cui poggia la prontezza PO-232 (`__CPM_CORPI232`: «Pronto = corpo CH38 agganciato, corpi CGTrader
   montati…»), il ripiego se il pacchetto CGTrader fallisce, e il corpo logico dei 22 sotto i CGTrader. Toglierlo è un lavoro sul
   motore e richiede la catena completa: va fuori dall'ambito di questo giro. Il pre-caricamento dal menu è voluto (PO-237/PO-241,
   «corpi caricati in anticipo»). Il guardiano dichiara questi numeri senza giudicarli.
2. **Ritratto dei menu.** Non si vede da nessuna parte: `AvatarPhoto` e `renderHeroPhoto` non hanno chiamanti, e i menu mostrano
   la `Figurina`. Non ho rifatto i dodici `assets/avatar-<id>.png` (render CH38, non scaricati da nessuna schermata). Cancellare il
   codice morto e i PNG è una pulizia separata (L4), da decidere.
3. **Intervista 3D.** Monta il corpo «regular» per l'eroe, ma si apre solo con l'interruttore rosso `__CPM_NO963`. L'equivalente
   CGTrader richiederebbe di riscrivere l'aggancio di ossa e microfono (nomi delle ossa diversi): non ne vale la pena per una
   scena che di default non c'è.
4. **Galà.** L'eroe in smoking è stato tolto dal PO (7.999.52); restano i presentatori Rocketbox, che non sono CH38.
5. **Panchina e bambini.** Il backlog cita «corpi CH38 per panchina e bambini»: la panchina è procedurale (7.999.78). Nella
   partita non ho trovato richieste di `footballer-lite.glb`: il censimento di rete non le mostra.
6. **Asset rimasti nel repo.** `footballer*.glb` e `anim-*.glb` restano su disco per i varchi di prova (`__CPM_NO_CH38_PREFETCH`,
   `__CPM_SETBODY907`) e per la pagina dei crediti. Non li ho cancellati.

## 5. Guardiani (sul build esatto di questo ramo)

| Guardiano | Esito |
|---|---|
| **`via-ch38-171`** (nuovo) | ✅ verde: 0 CH38 su home/carriera/presentazione/partita, presentazione con 7 corpi CGTrader, 0 errori di pagina · rosso `__CPM_NO_CH38_PREFETCH`: 12 file / 4,08 MB in home |
| `glb-pronti-232` | ✅ verde 4 scene su 4 pronte (0 senza CGTrader, 0 T-pose, 0 senza testa) · rosso 2/4 non pronte |
| `presentazione-200` | ✅ verde cg 7 · rosso schieramento di figurine |
| `premiazione-palco-191` | ✅ verde (e il rosso si vede) |
| `palco-corpi-191` | ✅ verde (rosso 176 campioni dentro il palco) |
| `design-system` | ✅ |
| `test:logic` | ✅ |
| `save-compat` | ✅ 12/12 |
| `griglia-mobile` | ✅ exit 0 (65 scatti; «prepartita non misurato», come prima). Gli scatti riscritti in `docs/collaudo-grafico/g0` sono stati ripristinati: non fanno parte di questo lavoro |
| `career-critical` | ✅ uscita 0, 14 guardiani verdi. Una prima corsa è stata fermata a metà dal tetto di tempo della chiamata e non conta: l'ho rifatta da capo sullo stesso build |
| `validate-dist` | ✅ dist offline funzionante, nessun errore di console |

Il guardiano è in `tests/visual/package.json` (`npm run via-ch38-171`), nella catena `grafica` e nella MAPPA di `ci-runner.mjs`
(voci `src/0[0-8]`, `src/1[17]`, `src/18|16|10`).

## 6. Foto (GLB acceso, 360 e 412 px)

`docs/sviluppo/foto-giro39/prima/` e `docs/sviluppo/foto-giro39/dopo/`: home, carriera, presentazione, premiazione in campo.
Prima e dopo sono uguali, ed è il risultato atteso: i corpi a schermo erano già i CGTrader. È cambiato solo ciò che il gioco
scaricava senza mostrarlo. `dopo/home-rosso-412.png` è il braccio rosso: la schermata è la stessa, cambia solo la rete.

## 7. Cosa resta (proposta per il backlog)

- PO-171 → «PARZIALE, giro 39»: download del CH38 vero chiuso (avvio e pacchetto); cerimonie e ritratto verificati già senza CH38.
  Da decidere: (a) togliere il corpo «regular» dalla partita (lavoro sul motore, catena completa); (b) cancellare il codice morto
  del ritratto 3D, i 12 `avatar-*.png` e gli asset CH38 dal repo.
- La riga della roadmap la scrive chi integra il ramo nella release: questo giro non cambia la versione.
