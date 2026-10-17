# Rapporto giro 43 — PO-143 (#64/#126, colpo di testa) e PO-266 (nominato lontano)

Ramo `sviluppo/cross-143-nomi-266-giro43`, base `lavoro/171-base` (7.999.171). `GAME_VERSION` e `SAVE_VERSION` invariati.
Zona G non toccata. File di gioco toccati: `src/12-three-match-view.jsx`, `src/15-live-match.jsx` (+ ricomposizione).
Porto anche sul ramo la forma del giro 34 di `nomi-219` (stampa per seme, `CPM_N219_BASE`) e `nomi-219-ricampiona.mjs`.

## 1. PO-143 — #64 / #126 «azione confusionaria con colpo di testa», «una sorta di colpo di testa»

### Misura prima
Sonda nuova `tests/visual/sonda-testa-126.mjs` (GLB acceso, pagina nuova per scena, esito forzato), con due testimoni
solo-sonda: `__CPM_WS38` (chi scrive il pallone, esistente) e `__CPM_BU43` (nuovo: beat della costruzione, pallone x/quota,
eroe, per fotogramma).

- Il tempismo testa-pallone **non** è il difetto oggi: `testa-motore-143` misura 0,17-0,31 u al lancio (il 2,98 u del giro 17
  non si riproduce più). Quella sonda resta rossa, ma per un motivo diverso: il suo braccio rosso (`__CPM_NO_TESTA146`) non
  separa più (0,17-0,83 u). Non l'ho toccata.
- **#64 e #126 (scene di testa del catalogo, pattern `HEADER_ATTACK`, nessuna origine del motore):** il pallone nasce sull'eroe,
  va al crossatore, poi la costruzione a tre del 7.775.1 lo manda a un terzo uomo **alle spalle** e ritorno prima del cross
  (beat `scarico`/`rientro`): su #126 59,2 → 46,8 (**12 u indietro**), su #64 77,3 → 73,8. Avanti e indietro tre volte prima
  di arrivare in testa: è l'«azione confusionaria» e il «pallone che arretra».
- **#126 azione 1 «Stacco difensivo deciso» (esito recupero):** resa come colpo di testa al primo palo, cioè un'incornata verso
  la porta da centrocampo: arco 57,6 → 92-94, poi post-arco `in_net`, pallone a 99,2. Un gol disegnato su un esito senza gol.
  Cause in `src/12`: (a) il bersaglio della variante `header_near_post` è la porta; (b) il ramo d'esito manda in rete
  **ogni** colpo di testa riuscito, qualunque sia il premio; (c) i due clamp «nello specchio» riportano in porta ogni colpo
  di testa riuscito o parato, e annullavano anche il bersaglio-compagno dello smistamento `header_flick` (7.786): misurato
  su #126 azione 0, bersaglio 65-70 → arco a 90.

### Correzioni (solo consumo nel 3D: timeline pura, firma del backbone e `deriveHL` invariati)
1. `src/12`, dopo `resolveTimeline`: nelle scene di testa `HEADER_ATTACK` non difensive si tolgono `scarico` e `rientro`; il
   cross parte da dove il crossatore ha finito la corsa. Rosso **`__CPM_NO_TESTA43`**.
2. `src/12`, arco della testa: con premio `recovery`/`possession` il bersaglio è il compagno (stesso cercatore dello
   smistamento); il ramo d'esito per il recupero di testa riuscito non va in rete (palla al compagno); i due clamp nello specchio
   non valgono per smistamento e recupero. Rosso **`__CPM_NO_TESTA43B`**.

### Misura dopo (guardiano `testa-143`, GLB acceso)
| scena | verde | rosso |
|---|---|---|
| #126/1 «Stacco difensivo» riuscito | nessuno scarico · nessun post-arco · pallone a x 66,9 (sul compagno) | scarico · `in_net` · x 99,2 |
| #64/0 «Testa potente angolato» riuscito | nessuno scarico · `in_net` (è un gol) | scarico · `in_net` |
| #126/0 smistamento riuscito | nessuno scarico · `assist_recv` → compagno | scarico · `assist_recv>assist_shot>in_net` |

Arretramento massimo in fila durante l'highlight: verde 0,5-1,6 u, rosso 1,5-4,7 u (informativo: dipende da quale mesh fa
da crossatore). Guardiano: VERDE nessun scarico/rientro e recupero non in rete e sotto x 80; ROSSO (`__CPM_NO_TESTA43` +
`__CPM_NO_TESTA43B`) scarico presente e recupero in rete o oltre x 90.

### Cosa resta (dichiarato)
- Su #126 il pallone nasce ancora sull'eroe e il «cross» arriva da un compagno spesso **più avanti** di lui (fino a ~10 u
  all'indietro): la scena del catalogo non ha un'origine. Il rimedio pieno è quello già usato per le scene del motore (7.999.26,
  un solo volo dal piede del crossatore) e tocca l'apertura della scena, quindi le firme golden: non fatto in questo giro.
- «Stacco difensivo» fallito: il post-arco resta `deflect` con esito `saved` (lessico del tiro su un recupero). Non toccato.
- Non verificato sul telefono: il giudizio finale sulle due note è del PO.

## 2. PO-266 — la cronaca nomina un giocatore lontano dall'azione

### Riproduzione
Sonda nuova `tests/visual/sonda-nomi-266.mjs` (stessa misura di `nomi-219`, più il testimone solo-sonda `__CPM_W266`: scambio
`_sw219`, posizione allo snap, bandiere di esclusione, traccia per fotogramma delle mesh scambiate). Le scene di una partita
dipendono dai tempi, quindi i semi del giro 34 non si ripetono identici; il caso grosso sì: **seme 147, 71', «Fra le linee,
LANE esce in ritardo!», HAMMOND a 52,7-53,3 u**, riprodotto 3 volte su 4 con quattro partite uguali in parallelo (e 2 volte su
2 prima). Gli altri tre del giro 34 (109/36,4 u, 112/41,4 u, 154/53,4 u) non sono usciti nelle mie corse.

### Causa misurata
Lo scambio `_sw219` fa il suo lavoro: allo snap HAMMOND va a (72,1; 48,7), a 4 u dall'eroe. **Due fotogrammi dopo** è a
(97,0; 2,5), la bandierina. HAMMOND era il **battitore dell'angolo della scena precedente**: lo staging di `src/15` scrive il
punto-palla (`_stagedSpotRef`) e il contrassegno `_taker402` solo per le scene col pallone fuori dai piedi dell'eroe e non li
azzera mai; la colla del battitore in `src/12` (7.405) tiene quindi chi ha `_taker402` sul punto vecchio per tutta la lettura
della scena dopo — in cui il motore aveva nominato proprio lui.

### Correzione
- `src/15`: il punto-palla si azzera a ogni scena e annota l'indice del battitore piazzato per **quella** scena (anche quando
  lo staging rigira e lo trova già sul punto).
- `src/12`: la colla vale solo per quell'indice.
- Rosso **`__CPM_NO_SPOT266`**. Nessuna scrittura nuova in `matchPlayers` (lo stato letto dal motore): il determinismo non cambia.

### Misura dopo
- Seme 147 × 4 partite: HAMMOND al 71' a 4,7-4,9 u; 0 nominati oltre 35 u su 11.
- Guardiano nuovo **`spot-266`** (deterministico, pagina unica): angolo gi6 e poi scena col pallone all'eroe (gi126, gi64);
  compagni entro 3 u da una bandierina in scelta della seconda scena: verde 0 e 0, rosso 1 e 1.
- `nomi-219`: vedi §3.

## 3. Catena (build finale del ramo, una corsa alla volta)

| passo | esito | numeri |
|---|---|---|
| `validate-situations` | ✅ 14/14 | fingerprint 00001505, 0 failure |
| `nomi-219` | ✅ | verde 94% vicini su 49, **0 oltre 35 u**; rosso 71% su 21, 6 oltre 35 u (righe per seme: `dati-giro43-nomi219.txt`) |
| `cross-218` | ✅ | verde e rosso si vedono |
| `buildup-sync` | ✅ | 37 build-up, salto mediano 0,8 u (max 1,3) |
| `bg-name-role` | ✅ | |
| `replay` · `test:logic` · `save-compat` | ✅ | |
| `spot-266` (nuovo) | ✅ ×2 | verde 0/0 incollati, rosso 1/1 |
| `testa-143` (nuovo) | ✅ | tabella §1 |
| `seme-a` | ❌ **preesistente** | primo ingresso divergente #486 al 17' (`chiedi.riprendi`, posizione dell'eroe consegnata dal 3D). Identico sulla base `5eb5500` (worktree pulito, stesso guardiano): giro con 2-1 e «eroe consegnato↔visto» 45,7 u in entrambi. Anche con i miei tre rossi accesi resta rosso. Non toccato. |
| `testa-76` (extra) | ❌ **preesistente** | gi171 quota all'impatto: ramo 0,85, base 0,74 (soglia 1,3) |
| `testa-146` (extra) | ❌ **preesistente** | il braccio rosso `__CPM_NO_TESTA146` non separa più (0,28-0,54 u), uguale sulla base; verde a posto |

**`nomi-219` non reso più severo.** Una regola «zero nominati oltre 35 u nel verde» sul tasso del giro 34 (4 su 194, ~40
nominati a corsa) sarebbe stata rossa in ~56% delle corse (1-(1-0,021)^40). Sul ramo ho 0 su 49 nel guardiano e 0 su 19 nelle
sonde, ma ho riprodotto e corretto **una** delle quattro cause del giro 34 (seme 147); le altre tre (109, 112, 154) non sono
uscite nelle mie corse. Non posso confermare che il tasso nuovo sia zero, quindi forma e soglie restano quelle del giro 34
(rossi falsi stimati ~0,1%). Le righe per seme di questa corsa servono a ricampionare le prossime.

Non eseguite in questo giro: la catena `completa`/`notte` intera (`partita-vera`, `career-critical`, ecc.). Il ramo tocca
src/12 e src/15: per l'unione va fatta girare almeno `node ci-runner.mjs mirata`.

## 4. Guardiani, sonde, interruttori
- Guardiani nuovi: `spot-266` (rapido), `testa-143` (~6 min, GLB): in `package.json`, nella MAPPA di `ci-runner.mjs`
  (src/12 e src/15) e nella catena `completa`; `testa-143` fra i lenti.
- Sonde (non in catena): `sonda-nomi-266.mjs`, `sonda-testa-126.mjs`.
- Rossi: `__CPM_NO_TESTA43`, `__CPM_NO_TESTA43B`, `__CPM_NO_SPOT266`. Testimoni solo-sonda: `__CPM_W266`, `__CPM_BU43`.
