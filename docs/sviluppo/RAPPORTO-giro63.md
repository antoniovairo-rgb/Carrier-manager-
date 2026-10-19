# Rapporto giro 63 — prestazioni del render 3D e pulizia (PO-023 · PO-180 · PO-171 · PO-072)

Ramo `sviluppo/prestazioni-pulizia-giro63`, base `lavoro/172` (7.999.172). GAME_VERSION e SAVE_VERSION invariati.
Zona G non toccata. **Nessun cambio di comportamento del gioco**: il codice traspilato senza commenti è identico alla base,
tolto il solo codice morto dichiarato (prova sotto, `npm run pulizia-072`).

## In breve

| Voce | Cosa ho fatto | Guardiano | Esito |
|---|---|---|---|
| PO-023 | criteri misurabili del render 3D (caricamento, fps, memoria, versione Three) con pavimenti headless | `render-3d-023` (nuovo) | verde · rosso `CPM_ROSSO023=1` esce 1 |
| PO-180 | `witness-frameskip` **riscritto** (non ritirato) e rientrato in `ci:guardiani` | `witness-frameskip` | verde 3/3 · rosso statico `CPM_ROSSO180=1` esce 1 |
| PO-171 | tolto il ritratto 3D CH38 dei menu, morto dal 7.973 (`renderHeroPhoto`, `AvatarPhoto` e 6 dichiarazioni di supporto, `src/01`) | `pulizia-072` | codice identico tolti i morti · 0 riferimenti vivi |
| PO-072 | **una** voce DT: DT-01 su `src/07` — 433 righe di soli commenti-changelog spostate in archivio | `pulizia-072` (nuovo) | codice identico · rosso `CPM_ROSSO072=1` esce 1 |

## 1. PO-023 — criteri misurabili del render 3D

`tests/visual/render-3d-023.mjs` (`npm run render-3d-023`): pagina nuova, provino vero (`playing` col clock vero), GLB acceso
(i corpi CGTrader della partita). Misura e giudica:

| Criterio | Come si misura | Misura giro 63 (headless, 2 corse verdi) | Soglia (pavimento headless) |
|---|---|---|---|
| caricamento home | ms dalla navigazione al primo figlio di `#root` | 12.049 ms · 2ª corsa 9.870 ms | ≤ 60.000 ms |
| corpi pronti | ms da «Inizia il provino» a `__CPM_CORPI232().pronti` | 19.759 ms · 17.481 ms (`ready-lineup`, 23 corpi) | ≤ 60.000 ms |
| fps medi in `playing` | rAF della pagina per 6 s | 7,9 fps (51 fotogrammi) · 16,4 fps (104) | ≥ 4 |
| fotogramma p95 | idem | 233 ms · 267 ms | ≤ 600 ms |
| 1% peggiore | idem | 0,4 fps (un fotogramma da ~2,5 s) · 3 fps | dichiarato, non giudicato |
| heap JS | `performance.memory` a corpi pronti e per 20 s | 364 → 379 MB · 386 → 395 MB | ≤ 700 MB |
| crescita heap | ultimo − primo campione in 20 s | +14,7 MB (0,73 MB/s) · +9,9 MB (0,49 MB/s) | ≤ 100 MB |
| renderer | `__CPM_RINFO769` | texture 1816→1836 · geometrie 1101 · 153 draw call · 89.449 triangoli | dichiarato |
| versione Three | `THREE.REVISION` | `128` | `=== '128'` |

Braccio rosso (`CPM_ROSSO023=1`, **iniettato dalla sonda**: un divoratore di CPU da 300 ms nel rAF e una fuga di 4 MB ogni
250 ms): fps 3,0 · heap 865 → 1.010 MB (+145 MB) → **esce 1** («fps medi 3 < 4», «heap 1009,9 MB > 700»).

Le soglie sono **pavimenti**: prendono un render-loop rotto, una fuga di memoria o un caricamento piantato. Non dicono nulla
del telefono (Chromium headless rende in software, senza GPU). Il numero del telefono resta quello del taccuino del PO
(`__CPM_FPS907`/`__CPM_FPS708`). Inserito in `ci:guardiani` e nella MAPPA di `src/12|13`.

⚠️ Il rosso non è un interruttore `__CPM_NO_*` del gioco: non c'è una correzione da spegnere, il guardiano è nuovo. Il braccio
rosso prova solo che le soglie scattano.

**Non verificato:** stabilità delle soglie su un runner CI (due corse verdi e una rossa, tutte in questa sessione). Fra le due
corse verdi gli fps medi sono raddoppiati (7,9 → 16,4): è la varianza dell'headless, ed è il motivo per cui la soglia è 4. Il «1% peggiore» a 0,4 fps è un fotogramma lungo isolato: non ho misurato da dove
nasce (ipotesi non verificata: compilazione di uno shader).

### Decisione per la sessione principale (PO-023)

Il backlog chiede «FPS medi e minimi» sul telefono. In headless il minimo non è giudicabile.
- (a) **consigliata**: tenere `render-3d-023` come guardiano di regressione grossolana e chiedere al PO una misura sul
  telefono col taccuino (`__CPM_FPS907`) per fissare il criterio vero (es. media ≥ 30, 1% peggiore ≥ 15);
- (b) dichiarare PO-023 chiusa coi soli pavimenti headless;
- (c) aggiungere una misura su dispositivo reale via Capacitor (fuori ambito di questo giro).

## 2. PO-180 — `witness-frameskip` riscritto

Le tre instabilità del backlog avevano tre cause, tutte nella sonda e non nel gioco (lette nel codice,
`src/12-three-match-view.jsx:3490-3545`):

1. **sonda `__CPM_WD_FILL` a volte assente**: nasce *dentro* il blocco del testimone, al primo fotogramma utile del render-loop;
   la sonda la chiedeva 1 s dopo l'apertura. Ora la aspetta (`waitForFunction`, 30 s).
2. **pallone fermo nella finestra di 1,2 s**: la misura (B) era lo spazio percorso dal pallone dopo la risoluzione della
   scena 8, cioè la cinematica d'esito, non il testimone. Ora (B) conta **i campioni scritti dal testimone per fotogramma rAF**
   in 2 s, ad anello vuoto e pieno: un campione per fotogramma = il frame arriva in fondo al blocco (il vecchio `return` con
   `step` 2 ne scriveva uno su due).
3. **un campione fuori ordine**: `__CPM_WD_FILL` dichiara pieno un anello di cui sono scritti poche decine di posti; i posti
   mai scritti (t=0) finivano dentro la traccia. Ora si giudicano solo i posti scritti (t>0), e un solo salto all'indietro è
   ammesso (il passaggio dai campioni di prima del riempimento a quelli nuovi).

Misure: verde **3/3** — (B) 16/16, 17/17, 18/18 a vuoto e 37/37, 36/36, 37/37 a pieno (rapporto 1); (C) 0 fuori ordine,
risoluzione 1 su 1. Rosso statico `CPM_ROSSO180=1` (rimette in memoria il `return` del diradamento e il dimezzamento): esce 1
con i due messaggi della parte (A).

**Non verificato:** un rosso *dal vivo* per (B). Il meccanismo del vecchio difetto (`return` + `step`) non esiste più nel
codice, e reintrodurlo vorrebbe dire toccare `src/12` (motore). (B) e (C) hanno solo la prova verde.

Rientrato in `ci:guardiani` (`tests/visual/ci-runner.mjs`): proposta per il backlog → PO-180 FATTO.

## 3. PO-171 — ritratto dei menu

Il giro 39 aveva misurato che il ritratto 3D CH38 (`renderHeroPhoto`, `AvatarPhoto`) non ha chiamanti. Ricontrollato con
`grep` su `src/`, test e strumenti: l'unico riferimento esterno è `src/12-three-match-view.jsx:396`,
`if(typeof _disposeHeroPhotoRenderer==='function')_disposeHeroPhotoRenderer();`, che con la funzione assente non parte (e
già prima non faceva nulla: il renderer del ritratto non veniva mai creato). Tolte da `src/01-bootstrap-tema-avatar.jsx` le
otto dichiarazioni del blocco (righe 662-739 della base, 7.928 byte): `_heroPhotoCache`, `_heroPhotoAssets`,
`_heroPhotoRenderer`, `_disposeHeroPhotoRenderer`, `_AV_KIT_COLS`, `_ensureHeroPhotoAssets`, `renderHeroPhoto`, `AvatarPhoto`.
`src/12` non l'ho toccato (motore: catena completa per una riga che oggi è un no-op).

**Fuori ambito, da decidere:**
- i 12 `assets/avatar-<id>.png` (render CH38) non hanno più riferimenti nel gioco: li cita solo `tools/avatar-build/shot.mjs`
  che li produce. Non li ho cancellati.
- il corpo «regular» sotto i CGTrader in partita (23 file, 8,43 MB, misurato da `via-ch38-171` su questo ramo): è lavoro sul
  motore (prontezza PO-232, ripiego CGTrader), come già scritto nel giro 39.

  Opzioni: (a) **consigliata**: chiudere PO-171 per menu/cerimonie/download e aprire una voce L1 separata per il corpo
  «regular» in partita, con catena completa; (b) togliere anche i PNG e gli asset `footballer*.glb`/`anim-*.glb` dal repo
  (servono ancora ai varchi di prova `__CPM_NO_CH38_PREFETCH` e `__CPM_SETBODY907` e alla pagina dei crediti — vanno ritirati
  insieme); (c) lasciare tutto com'è.

## 4. PO-072 — una voce DT: DT-01 su `src/07`

Misurato: in `src/07-versione-save-interviste.jsx` le righe 36-468 (fra `const GAME_VERSION` e `const SAVE_VERSION`) sono
**soli commenti** — 433 righe, 798.905 byte, l'85% del frammento — con **0 righe di codice** (contate con un tokenizer di
commenti, non a occhio). Spostate **senza modifiche** in `docs/archivio/note-versione-src07.md`; al loro posto una riga che
punta all'archivio. Puntatore anche in testa a `docs/RELEASE_HISTORY.md`.

| | prima | dopo |
|---|---|---|
| `src/07-versione-save-interviste.jsx` | 941.346 byte · 1.756 righe | 142.603 byte · 1.324 righe |
| `CARRIER-MANAGER-AV.html` | 7.444.190 byte | 6.637.859 byte (−806 KB, insieme a PO-171) |

Il commento lungo sulla riga di `GAME_VERSION` (17,8 KB) è rimasto: quella riga la riscrive chi fa il bump, e
`tools/governo-html.mjs` la legge con una regex.

Chi legge `src/07` come testo: `conferenza-192` (ancora `const INTERVIEW_QS=[`, verde), `tools/governo-html.mjs`
(regex su `GAME_VERSION`). Il modello analitico `tests/situations-3d-validation.js` si ancora al testo, non ai numeri di riga.

### Il guardiano della pulizia: `pulizia-072`

`tests/visual/pulizia-072.mjs` traspila con Babel (`comments:false, compact:true`) il blocco del gioco di oggi e quello della
base (`CPM_BASE`, default `origin/lavoro/172`), toglie dalla base le dichiarazioni elencate in `RIMOSSE`, e pretende:
codice **identico**, nessun riferimento vivo ai rimossi (ammessi `typeof X` e `if(typeof X…)`), pagina fuori dal blocco Babel
identica. Verde: codice di 3.535 KB identico, 0 riferimenti vivi, 15 s. Rosso `CPM_ROSSO072=1` (una sola istruzione cambiata
in memoria, `SAVE_VERSION=9` → `8`): esce 1 e stampa il punto della differenza.

⚠️ È un guardiano **di rilascio di pulizia**, non di catena: confronta con una base fissa, e qualunque modifica vera al gioco
lo fa uscire 1. Per questo non l'ho messo in nessuna catena di `ci-runner.mjs`: si lancia con `CPM_BASE=<base>` sui rami di pulizia.

**Restano da fare in PO-072** (una per giro): DT-01 sugli altri frammenti (12, 15, 18 hanno la stessa forma), DT-02 flag rossi
(misurato: 859 nomi `__CPM_NO*` in `src/`, **397 non citati da nessun test o strumento**, 42 fuori dai frammenti del
motore/carriera 12-15/18; molti vivono solo dentro i commenti-changelog — ricontarli dopo DT-01), DT-09 sonde.

## 5. Guardiani rilanciati su questo ramo

Parti di `src/` toccate: `src/01` e `src/07` → MAPPA `src/0[0-8]`: `classifica-102`, `partita-rigiocata-194`, `save-compat`,
`backup-167`, `via-ch38-171`. In più `conferenza-192` (legge `src/07`).

| Guardiano | Esito |
|---|---|
| `test:logic` | ✅ 43/43 |
| `save-compat` | ✅ 12/12 |
| `design-system` | ✅ |
| `conferenza-192` | ✅ verde (e il rosso si vede) |
| `classifica-102` | ✅ |
| `partita-rigiocata-194` | ✅ verde (e il rosso si vede) |
| `backup-167` | ✅ |
| `via-ch38-171` | ✅ verde (e il rosso si vede) · 0 CH38 sui 4 percorsi |
| `pulizia-072` | ✅ · rosso esce 1 |
| `witness-frameskip` | ✅ 3/3 · rosso statico esce 1 |
| `render-3d-023` | ✅ · rosso esce 1 |
| `validate-situations` | ✅ 14/14, fingerprint `00001505`, 0 failure (2ª corsa, da sola). La 1ª corsa, lanciata mentre giravano in parallelo altri guardiani col browser, ha dato ❌ `motion` («nessuno reagisce al portatore in 7/16 scene», 44% > 34%): codice traspilato identico alla base (`pulizia-072`), quindi la leggo come carico; non l'ho provato oltre |
| `griglia-mobile` | ✅ exit 0, 65 scatti («prepartita non misurato», come nel giro 39). Scatti riscritti in `docs/collaudo-grafico/g0` ripristinati |
| `career-critical` | ✅ 11 passi incatenati, tutti verdi (ultimo: coppa-intera PASS) |

## 6. Altri file toccati

- `tests/visual/lib/harness.mjs`: `clickByText` ora è esportata (una parola, `export`), per `render-3d-023`. Nessun chiamante cambia.
- `tests/visual/package.json`: script `render-3d-023` e `pulizia-072`.
- `tests/visual/ci-runner.mjs`: `witness-frameskip` e `render-3d-023` in `ci:guardiani`; `render-3d-023` nella MAPPA di `src/12|13`.
- Backlog, roadmap e `ARCHITETTURA.md` non aggiornati: le righe le scrive chi integra il ramo. Proposte: PO-180 → FATTO;
  PO-023 → PARZIALE (guardiano headless, manca il criterio sul telefono); PO-171 → vedi opzioni §3; PO-072 → PARZIALE
  (DT-01 su `src/07` fatto).
