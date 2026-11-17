# Giro 262 — PO-513: nelle formazioni prima dell'ingresso niente rigorista (versione 7.999.197)

Ramo `sviluppo/giro262-formazioni-capitano`, nato da `origin/lavoro/197` (`eaff436`, contiene il giro 257). `GAME_VERSION` non toccata.
Decisione PO 17/11 20:54 (testuale): «Il rigorista nelle formazioni prima dell'ingresso in campo non deve essere specificato, al più il capitano».

Rosso del giro: `window.__CPM_NO_G262` (le formazioni tornano come nel 257, con la «R»).
Guardiano nuovo: `formazioni-262` (catene `completa` e `carriera`, una volta ciascuna, accanto a `rigorista-257`; mappa mirata src/12-13).
Guardiano aggiornato: `rigorista-257`, parte A2 (giudicava la «R» nelle formazioni).
File di gioco toccato: solo `src/13-prepartita-formazioni.jsx` (una riga, `_R257` in `FormationView`). Nessun campo nuovo nel salvataggio.

---

## 1 · Prima misura: dove si vedono le formazioni prima dell'ingresso

Ricerca nel sorgente (`grep` su `SegnoR257`, `rigorista257`, `rigorist`, `🎯`, `capitan`, `isCaptain`) + misura sul gioco vero
(salvataggio S12 `fixtures/save-190-s12-ovr93.json`, 360×740, partita vera dalla carriera: `matchday` → `formations` → `walkout`).

| Schermata / scena | Mostra nomi di giocatori? | Segno del rigorista OGGI (prima del 262) | Capitano «C» / fascia |
|---|---|---|---|
| Pre-partita (`MatchdayCard`, fase `matchday`, src/13) | no: squadre, stadio, meteo, scheda scout | **no** (0 segni, 0 «rigorista» nel testo) | no |
| Scheda scout (`ScoutReportScreen`, dentro `matchday`) | no nomi della nostra squadra; i 🎯 sono titoli di sezione («Da sfruttare», «Analisi tattica») | **no** | no |
| **Formazioni** (`FormationView`, fase `formations`, src/13, kit nuovo) | sì, i ventidue | **sì: «R» dorata `SegnoR257` sulla maglia del designato** (misurata: «10 SPENCER R») | no |
| Formazioni, kit vecchio (`TeamFormation`, solo con `__CPM_NO_FORMAZ23`) | sì | no | no |
| Ingresso in campo (`walkout`, sovrimpressioni `tv225`/`inno206`, serata di presentazione) | presentazione: 4 compagni + eroe (ruolo e nome) | **no** | no |
| Maxischermo 3D (`_sbDraw`, src/12) | no: sigle, punteggio, minuto | **no** | no |
| Tabellino (`tabellino202`) | non è pre-partita e ha solo numeri di squadra (rapporto 257, dubbio 1) | no | no |

Capitano: il gioco conosce **solo** se il capitano è l'eroe (`player.isCaptain`); dei compagni non sa chi porti la fascia. In nessuna
delle schermate qui sopra oggi compare una «C» (misurato: 0 segni/parole «capitano» in `matchday`, `formations`, `walkout`; nel
salvataggio di prova l'eroe non è capitano).

## 2 · Correzione

`src/13` `FormationView`: `_R257` (l'unico punto che decide la «R» nelle formazioni) restituisce falso salvo `__CPM_NO_G262`.
Restano **invariati**:
- la **«R» nella Rosa** (src/18, `rigorista257`) — misurata dopo il fix: «R» su Sam Hall = atteso, in entrambi i bracci;
- **chi tira i rigori in partita**: il live calcola ancora `rig257` e lo passa al motore (`rig257Motore`); `rigorista-257` C2 sul
  build del giro: dischetto `pen:9` = designato SPENCER, scena del compagno «31' SPENCER goal», eroe 0 battute.

Il capitano non l'ho aggiunto: oggi non c'è nessuna «C» da far restare (vedi dubbio 1).

Foto prima/dopo a 360 px (2×) in `docs/sviluppo/foto-giro262/`: `prima-*` = braccio rosso `__CPM_NO_G262`, `dopo-*` = gioco del giro,
per `matchday`, `formations`, `walkout`, `rosa`. Unica differenza visibile: la «R» sopra SPENCER in `prima-formations-360.png`.

## 3 · Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, build definitivo)

Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE**. `node --check` su `ci-runner.mjs`,
`formazioni-262.mjs`, `rigorista-257.mjs`; nessun doppione nelle catene toccate. Nessuna foto di altri giri rigenerata in docs/.

| Controllo | Esito | Numeri |
|---|---|---|
| `formazioni-262` (nuovo, ~3 min) | ✅ verde, rosso visto | verde: «R» 0 e testo «rigorista» 0 in `matchday`, `formations`, `walkout` · rosso `__CPM_NO_G262`: «R» su «10 SPENCER» (designato Carter Spencer) · Rosa: «R» su Sam Hall = atteso in verde **e** in rosso (24 righe) · errori di pagina 0/0 · capitano dichiarato (non giudicato): 0 ovunque |
| `rigorista-257` (A2 aggiornato) | ✅ tutte le 19 righe | A2: formazioni del gioco «R» 0 · con `__CPM_NO_G262` «R» su SPENCER · rosso 257 (+NO_G262) 0. A1, A3, B1-B3, C1-C2 invariati (C2: rigore al compagno designato) |
| `sigle-203` | ✅ (seconda corsa intera, exit 0) | verde 18/0 e 8/0 · rosso 203 visto (13 ok · 5 ko) · rosso 254 visto (7 ok · 1 ko). Vedi dubbio 3 |
| `test:logic` | ✅ | 51 pass · 0 fail |
| `save-compat` | ✅ | 12 pass · 0 fail |
| `design-system` · `tema-unico` · `typing-shortcuts` (nucleo) | ✅ | tema-unico: rosso atteso visto |
| `ingresso-245` (mappa src/13, passa dalle formazioni all'ingresso) | ✅ | verde e rosso come atteso (175 s) |
| `nomi-182` (mappa src/13) | ✅ exit 0 | verde 28/0 · rosso 26/2 atteso (511 s) |

Non eseguiti (verifica di rilascio): `career-critical` (escluso dalla regola PO-504 A) e il resto della mappa mirata di src/13
(74 guardiani in tutto, fra cui `validate-situations`, `partita-vera`, `tunnel-245`, `ingresso-276/277/285`, `coreografie-244`,
`tocco3d-219`, `scena3d-96`, `panchina-293`, `pallone-278`). Vedi dubbio 2.

---

## Dubbi per il PO

1. **«Al più il capitano»**: l'ho letto come *permesso*, non come richiesta, e oggi nelle formazioni **nessuna «C»** compare (misurato).
   Non ho aggiunto la fascia. Il gioco la saprebbe mettere solo sull'eroe quando è capitano (`player.isCaptain`): il capitano dei
   compagni non esiste nei dati (né in Rosa né in partita). Se il PO la vuole sull'eroe-capitano, è un giro a parte.
2. **Mappa mirata di src/13**: conta 74 guardiani (molti oltre 20 minuti); il cambio è una riga che toglie uno `<span>` in
   `FormationView`. Ho eseguito quelli che passano davvero dalla schermata delle formazioni e sono brevi (`ingresso-245`, `nomi-182`)
   più il nucleo leggero; gli altri (3D, ingresso, motore) li lascio alla verifica di rilascio. Il rapporto 257 ha fatto lo stesso.
3. **`sigle-203` instabile alla prima corsa**: il quarto braccio (`CPM_ROSSO254`) ha stampato «prova del rosso CIECA: nessun taglio
   visto» ed è rimasto appeso fino al tetto dei 10 minuti. Da solo è passato (rosso visto, 1 minuto); rieseguita la catena intera,
   verde con tutti i rossi visti. Non tocca nulla del giro (misura la barra della partita), ma è un caso «instabile»: segnalo.
4. **Kit vecchio delle formazioni** (`__CPM_NO_FORMAZ23`): non ha mai avuto la «R», quindi non c'era nulla da togliere.
5. **La «R» nelle formazioni con `__CPM_NO_G262`** resta l'unico modo di vedere a schermo il designato in partita: il guardiano
   `rigorista-257` A2 lo usa per provare che la designazione delle formazioni è ancora la stessa della Rosa e del motore.
