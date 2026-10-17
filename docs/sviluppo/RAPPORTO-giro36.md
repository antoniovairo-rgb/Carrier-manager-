# Rapporto giro 36 — PO-262: `match-sequence` rosso, determinismo della cronaca

Ramo `sviluppo/determinismo-262-giro36`, base `lavoro/170` (7.999.170). `GAME_VERSION` e `SAVE_VERSION` **non**
cambiate. Zona G non toccata. Toccati: `src/06-archetipi-agenti-sponsor.jsx` (`getStartPos`),
`src/15-live-match.jsx` (tre chiamate + il generatore `_spRnd262`), `CARRIER-MANAGER-AV.html` ricomposto
(`check-src`: identico byte per byte ai frammenti), sonda nuova `tests/visual/sonda-divergenza-262.mjs`.

Interruttore rosso: **`window.__CPM_NO_SP262`** — rimette il sorteggio con `Math.random` della 7.999.170.

## In breve

La causa è il **punto di partenza dell'eroe nelle scene a movimento bloccato** (punizioni, rigori: `lockMovement`).
`getStartPos` lo sorteggiava nella `startZone` con `rng()`, cioè `Math.random`. Quel punto diventa la foto di fine
scena che `riprendi` consegna al motore del possesso (SEME-a, 7.999.161): il motore prende un'altra strada e la
cronaca cambia. Il sorteggio è vecchio; è diventato visibile **con l'unione `527e92bf`
(`sviluppo/statistiche-difesa-228`, dentro la 7.999.169)**, che ha cambiato il motore e messo una punizione come
seconda scena della partita del guardiano. Ora il punto si sorteggia da un generatore seedato su
(seme di partita, indice della scena). `match-sequence` verde 3 corse su 3, 100% su tutti i confronti.

## 1. Il punto di divergenza (misurato sulla 170)

Riprodotto il rosso col guardiano intero (corsa del 15/10 sera, 11'50"):

| confronto | esito |
|---|---|
| 1x contro 1x | ❌ prefisso identico 5/74, prima differenza alla posizione 5 |
| 2x contro 2x | ✅ 83/83 |
| 1x contro 2x | ❌ 6/74, prima differenza alla posizione 6 |

Riga divergente: `9|✋ Scotti (GRA) legge il passaggio…` contro `9|🟡 Neri (GRA) stende Santoro…`.

Per scendere alla causa ho usato una sonda corta (6 giri identici a 1x fino al 10'-14', ~40 s a giro) e tre
testimoni di sola lettura, **poi tolti dal codice**:

1. **Sorteggi `_rndM` al minuto, con la riga chiamante.** Al 9' il giro divergente consuma 4 sorteggi, gli
   altri 5: manca l'estrazione del nome `hN` (la riga ha un protagonista tenuto invece che estratto). Quindi non
   è un generatore della cronaca a essere rotto: è diverso lo stato da cui la riga viene scelta.
2. **Impronta per minuto di 22 ref del `LiveMatch`** (motore, Match State, pallone, bersaglio, eroe, momentum,
   possesso, trama, protagonista, punteggio, turno…). Primo valore diverso: **`pPosRef` al 7'**
   (80,4/52,4 contro 82,4/52,4); il motore (`motoreRef`) diverge al 9', e con lui pallone, turno e portatore.
3. **Ogni scrittura di `pPos` con fase e scena.** All'apertura della scena n°1 (la punizione, `hl_intro` al 6')
   l'eroe parte in **82,4/48,4 · 80,4/52,4 · 82,4/52,4 · 82,4/52,4 · 80,4/49,4 · 82,4/52,4** nei sei giri.

Chi scrive quel punto: `getStartPos(sit)` (src/06, r.133), chiamato da `LiveMatch` in due punti del flusso vero
per le scene `lockMovement` — l'apertura della scena (`preSp41Ref`, 7.999.41b, r. ~4835) e la messa in scena
(r. ~3541) — e come ripiego per le scene libere con `__CPM_NO621` acceso. `rng` è `Math.floor(Math.random()…)`.

## 2. La release che l'ha introdotto

La storia di main è stata approfondita (`git fetch --deepen`) e ogni versione misurata con la sonda sullo stesso
tratto (6-8 giri, velocità 1x/2x alternate, fino al 20'), servendo l'HTML di quel commit. Per i commit interni
all'unione della 169 l'HTML è stato ricomposto con `tools/build-src.mjs` in una worktree temporanea (byte identici
al file in git). «Gruppi» = insiemi di giri con la stessa sequenza.

| build | giri | gruppi | esito |
|---|---|---|---|
| 7.999.131 | 6 + 8 | 1 | ✅ |
| 7.999.132 | 8 | 1 | ✅ |
| 7.999.133 | 7 | 2 | ❌ (pos. 11, 15') |
| 7.999.135 | 7 | 1 | ✅ |
| 7.999.137 / 139 / 140 / 150 / 155 / 160 / 161 | 6-7 | 2-6 | ❌ |
| 7.999.162 | 6 | 1 | ✅ |
| 7.999.164 | 6 | 1 | ✅ |
| 7.999.166 | 6 | 1 | ✅ |
| `ae815576` (7.999.167) | 6 | 1 | ✅ |
| `766d7fca` (unione scene-gesti-022) | 6 | 1 | ✅ |
| `5c065d90` (169 in costruzione, giri 17-20) | 6 | 1 | ✅ |
| `0356bb2a` (unione ripartenza-207) | 6 | 1 | ✅ |
| **`527e92bf` (unione statistiche-difesa-228)** | 6 | 4 | ❌ **prima rossa** |
| `bfde32b5` (build 7.999.169) | 6 | 3 | ❌ |
| 7.999.169 (`c17a2f6`) | 6 | 3 | ❌ stesso sintomo della 170 (9': Scotti/Neri) |

**Prova che il colpevole è il sorteggio e non il motore 228.** Controprova con `OVR=1` della sonda: dopo il
caricamento `window.getStartPos` viene sostituita da una versione seedata dall'esterno (stesse regole, generatore
a seme fisso), senza toccare il file:

| build | senza controprova | con `getStartPos` seedato |
|---|---|---|
| `527e92bf` | ❌ 4 gruppi | ✅ 6/6 identici |
| 7.999.170 | ❌ | ✅ 6/6 identici |
| 7.999.140 / 160 / 161 | ❌ | ❌ (altre sorgenti, vedi sotto) |

E il perché dell'unione 228: la ritaratura dei passaggi PO-228 cambia il gioco del motore, e con lui le scene
della partita del guardiano. Prima (`0356bb2a`) le prime scene erano «Tiro da fuori» e «Scivolata netta» (scene
libere, punto di nascita dalla continuità 7.621, deterministico); dopo (`527e92bf`) sono «Proteggi palla»,
**«Punizione a giro»** (movimento bloccato → `getStartPos`) e un rigore. Il motore 228 è deterministico; ha solo
portato la partita su una scena dove il sorteggio esisteva già.

⚠️ **La fascia 7.999.133 → 7.999.161 era rossa per altre ragioni**, che la controprova non chiude: lì il rosso
resta anche con `getStartPos` seedato. Sono state chiuse dal lavoro SEME-a (7.999.161/162: dalla 162 in poi la
sonda è verde fino alla 166). Non le ho attribuite una per una: fuori ambito, e non più presenti sulla 170.
⚠️ La bisezione guarda i primi 20 minuti, dove nasce il rosso segnalato; per le build intermedie **non posso
confermare** l'esito del guardiano a partita intera.

## 3. La correzione

```js
// src/06 — getStartPos accetta un generatore opzionale; senza, resta com'era (rng → Math.random)
function getStartPos(sit,rnd){ … const r=rnd?((a,b)=>Math.floor(rnd()*(b-a+1))+a):rng; … }

// src/15, LiveMatch — un generatore per scena, seedato sulla partita
const _spRnd262=k=>(window.__CPM_NO_SP262)?undefined
  :seededRng(((bgSimSeedRef.current>>>0)^hashStr("sp262|"+k))>>>0);
```

Le tre chiamate del flusso vero (`preSp41`, messa in scena `lockMovement`, ripiego `__CPM_NO621`) passano
`_spRnd262(hlIdx)`. Il sorteggio resta (il PO voleva il punto vario nella zona, non fisso): diventa funzione
della partita e della scena, come la cronaca dal 7.489. **Fuori ambito, invariati:** il percorso del gate
(`__CPM_FORCE_SIT`, r. ~2545, che riceve già la posizione), lo stato iniziale di `pPos` al montaggio (sovrascritto
prima della prima scena), il generatore `seededRng` e il seme di partita `bgSimSeedRef`.

## 4. Corse prima/dopo

Sonda corta (fino al 20'-25', 6 giri, velocità 1x/2x alternate), stessa macchina, i due bracci in parallelo:

| build | gruppi | esito |
|---|---|---|
| 7.999.170 + correzione | 1 (6/6 identici) | ✅ |
| 7.999.170 + correzione + `__CPM_NO_SP262` | 3 | ❌ prima differenza al 10' |

Guardiano intero `match-sequence` (4 partite fino al fischio, 92'):

| corsa | 1x/1x | 2x/2x | 1x/2x | copertura |
|---|---|---|---|---|
| prima (170) | ❌ 5/74 | ✅ 83/83 | ❌ 6/74 | 92', 4/4 |
| dopo, corsa 1 | ✅ 80/80 | ✅ 80/80 | ✅ 80/80 | 92', 4/4 |
| dopo, corsa 2 | ✅ 80/80 | ✅ 80/80 | ✅ 80/80 | 92', 4/4 |
| dopo, corsa 3 | ✅ 80/80 | ✅ 80/80 | ✅ 80/80 | 92', 4/4 |
| prova del rosso (`CPM_BANDIERA=__CPM_NO_SP262`) | ❌ 6/75 | ❌ 6/73 | ❌ 4/75 | — |

Le tre corse verdi sono state fatte **in contemporanea con gli altri guardiani** (carico alto sulla macchina):
la sequenza ha tenuto anche così.

## 5. Guardiani sul build della correzione

| guardiano | esito |
|---|---|
| `match-sequence` | ✅ 3/3 (sopra) |
| `seme-a` | ✅ 3 giri, seme 2311: ingressi del motore, sorteggi per minuto e punteggio identici |
| `replay` | ✅ PASS, 8 highlight |
| `partita-vera` | ✅ bande d'accettazione rispettate |
| `tabellino-228` | ✅ verde, e il rosso si vede |
| `match-speed-change` | ❌ **rosso già sulla 170 senza la correzione** (vedi sotto) |

**`match-speed-change` è rosso anche sulla base.** Verificato sulla 7.999.170 pulita (copia separata, stesso
harness): `bottone 1.5× non trovato · bottone 2× non trovato` e «il cambio di velocità NON ha accelerato la
partita». Causa letta nel codice: il comando velocità oggi è **un solo bottone a ciclo** (r. ~10251 e ~10327,
`MATCH_SPEEDS[(i+1)%n]`), mentre il guardiano cerca bottoni separati con testo esatto `1,5×` / `2×`. È il
guardiano da riallineare all'interfaccia, non la partita: **non l'ho toccato** (fuori ambito del giro); va aperta
una voce a parte. Nota: il guardiano non è nella catena di `ci-runner`, quindi nessuno lo stava rigiocando.

## Strumenti lasciati

- `tests/visual/sonda-divergenza-262.mjs` — N partite identiche fino a un minuto, cronaca + timeline + sorteggi
  `_rndM` per minuto; `ROOTDIR` per misurare un'altra build, `OVR=1` per la controprova su build senza interruttore.
- Il metodo dei testimoni (impronta dei ref per minuto, scritture di `pPos`) è descritto al punto 1; il codice è
  stato tolto prima del commit perché era diagnostico.

## Cosa resta aperto

- `match-speed-change` da riallineare al bottone unico della velocità (rosso preesistente).
- `match-sequence` e `match-speed-change` non sono in nessuna catena di `ci-runner`: proposta da decidere col PO
  se aggiungerli (il rosso di PO-262 è rimasto invisibile per questo).
- Altri `getStartPos` col caso puro restano dove non toccano la partita vera (stato iniziale al montaggio, gate).
