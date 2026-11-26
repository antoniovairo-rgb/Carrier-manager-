# Giro 383 — Curva di difficoltà delle partite simulate (PO-515)

Ramo `sviluppo/giro383-difficolta`, base `lavoro/201` (punta `29d758c8` = 7.999.215 + giri 364, 367, 368, 369, 370, 371, 382).
`GAME_VERSION` e `docs/governo` non toccati. Rosso del giro: `window.__CPM_NO_G383`.

## In breve

- La curva PO-156 era fuori su **11 celle su 20** (9/20 dentro). Le cause sono tre parti di PO-360 e una decisione del PO del 21/11.
- **8 delle 11 celle si recuperano senza disfare PO-360.** La curva nuova sta a **17/20 con 20 semi** e a **16/20 con i 10 semi del guardiano**.
- **Le 3 celle del VOTO (gavetta, affermazione, declino) sono un conflitto vero.** Il voto simulato è la pagella del motore (PO-360,
  «C», 11/11) e c'è il «+0,3» sotto OVR 72 (decisione PO del 21/11, giro 310): con queste due decisioni il voto sta 0,3-0,7 sopra i
  bersagli di PO-156, che sono stati fissati prima. Bersagli e tolleranze non li ho toccati, quindi **difficolta-156 resta ROSSO
  DICHIARATO**. Ora però dice in chiaro quali celle sono del conflitto e quali no.

## 1. Misura di partenza (base 29d758c8, 40 carriere × 2 stagioni, eroe neutro)

| fase | voto | gol | vitt | min | tit |
|---|---|---|---|---|---|
| bersaglio ± toll. | 6,0/6,4/6,9/6,3 ±0,2 | 0,15/0,30/0,50/0,25 ±0,08 | 35/45/55/45 ±8 | 55/75/85/65 ±8 | 45/75/95/60 ±10 |
| gavetta | **6,69** | 0,156 | 40,2 | **68,1** | **65,6** |
| affermazione | **6,79** | **0,383** | **54,1** | 81,7 | **86,8** |
| élite | 7,04 | **0,603** | 57,5 | 88,7 | 97,8 |
| declino | **6,74** | 0,329 | **53,7** | 72,1 | **71,7** |

9/20 dentro. Rosso `--rosso` (`__CPM_NO_156`): 5/20, visto.

**Cosa ha chiesto PO-360:** le simulate erano troppo severe (voti 5,1-6,3, squadra da −1 a −13 dalla vetta in Primavera). Le decisioni
prese sono tre: voto = pagella del motore (giro 158), occasione dell'eroe giocata come una giocata da gol (giro 158, squadra più forte),
e poi «+0,3» al voto sotto OVR 72 (giro 310).

### Attribuzione (copia della sonda con gli interruttori dall'ambiente, nello scratchpad; la sonda del repo è cambiata solo come al §3)

| interruttori spenti | celle dentro | fuori |
|---|---|---|
| nessuno (base) | 9/20 | voto ×3, min/tit gavetta, tit affermazione e declino, gol affermazione ed élite, vitt affermazione e declino |
| `__CPM_NO_G158` (tutto il giro 158) | 19/20 | solo voto gavetta 6,27 (è il +0,3 del giro 310) |
| `__CPM_NO_G310F` | 10/20 | |
| `__CPM_NO_G158O` (solo l'occasione) | 13/20 | voto ×3, min/tit gavetta, tit affermazione e declino |
| `__CPM_NO_G158` + `__CPM_NO_G310F` | **20/20** | — |

**Le catene, misurate:**
1. Voto più alto (pagella + 0,3) → il mister lo legge (`calcCoachDecision`: `(media degli ultimi 3 voti − 5) × 7,5` sul punteggio) → più titolarità e più minuti.
2. Occasione nel motore → l'eroe sposta già il risultato, ma il bonus di forza del giro 69 (`_fz156`, nato perché nel motore l'eroe
   non contava) resta → **doppio conteggio**: più vittorie in affermazione e in declino.
3. Più gol della squadra → il tetto «gol dell'eroe ≤ gol della squadra» di `_pSimStats` morde meno → più gol dell'eroe in élite.

## 2. Cosa cambia nel gioco (rosso `__CPM_NO_G383` = tutto come prima)

| file | funzione | modifica |
|---|---|---|
| `src/08-panchina-derby-meteo-cori.jsx` | `calcCoachDecision` | la media degli ultimi 3 voti letta dal mister esclude le partite `simulated` (come la Home: «le simulate non entrano nella media»). Senza partite giocate vale il ripiego di sempre, 6,0 |
| `src/10-folla-stadi-ritiro.jsx` | `simulateMatch` (blocco giro 69) | soglia del bonus di forza dell'eroe da OVR 70 a **74**, solo con l'occasione del giro 158 accesa (con `__CPM_NO_G158`/`__CPM_NO_G158O` resta 70) |
| `src/10-folla-stadi-ritiro.jsx` | `_pSimStats` | pendenza dei gol sopra OVR 76 (giro 78) da 0,05 a **0,03**, solo quando il risultato ha la pagella del motore (`sim.base158`) |
| `CARRIER-MANAGER-AV.html` | — | ricomposto con `tools/build-src.mjs` |
| `tests/visual/difficolta-156.mjs` | — | braccio `--rosso383` (`__CPM_NO_G383`: passa se minuti o titolarità escono) e riga «conflitto dichiarato»; **bersagli, tolleranze e criterio del verde invariati** |
| `tests/visual/package.json` | script `difficolta-156` | aggiunto `&& node difficolta-156.mjs --rosso383` |

Non cambiano: voto simulato (pagella + 0,3), occasione nel motore, ripiego Poisson, salvataggio (nessun campo nuovo), partita
vissuta (il motore dal vivo non passa da `simulateMatch`). Tutto è deterministico: hash e seme come prima, nessun `Math.random` nuovo.
**Effetto sul gioco vissuto, da dichiarare:** anche per chi gioca dal vivo il mister non conta più il voto delle partite simulate
nella media degli ultimi tre. Prima le contava.

Varianti provate e scartate (40 carriere): bonus di forza tolto del tutto → élite vittorie 35,1% e titolare 83,4%, quindi 13/20.
Soglia 73 + pendenza 0,04 → 16/20 e 15/20 in due corse, élite gol 0,60.

## 3. Prima / dopo

| misura | prima (base) | dopo |
|---|---|---|
| difficolta-156 verde, 10 semi (corsa del giro `ci-runner giro`) | 9/20 | **16/20**: voto ×3 (conflitto) + declino vitt 53,3 (tetto 53) |
| stessa sonda, 20 semi (strumento mio) | — | **17/20**: fuori solo i 3 voti |
| `--rosso` (`__CPM_NO_156`) | 5/20 visto | 5/20 visto ✅ |
| `--rosso383` (`__CPM_NO_G383`) | — | 10/20, escono gavetta min/tit, affermazione tit e declino tit ✅ |

Dopo, con 20 semi: gavetta 6,66 · 0,146 · 39,8 · 61,9 · 55,0 — affermazione 6,72 · 0,379 · 48,9 · 79,5 · 83,2 — élite 7,01 · 0,524
· 62,5 · 87,8 · 96,5 — declino 6,69 · 0,317 · 52,4 · 68,1 · 64,9.

⚠️ **Rumore della sonda.** Due corse identiche a 10 semi danno ±3-4 punti sulle vittorie e ±0,02 sui gol: gol forma e fiducia ritornano
sul mister. Sono ancora vicine al bordo: gol affermazione (0,354-0,40 contro il tetto 0,38), vittorie in declino (51,6-55,6 contro 53),
vittorie élite (60-63,6 contro 63). Ho smesso di tarare: oltre questo si tara sul rumore.

## 4. Controlli

- `node ci-runner.mjs giro difficolta-156`: **17/18**. Le 17 sentinelle sono verdi (mappa-unica, test:logic, save-compat, replay,
  migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical, battito-264,
  partita-vera, gk-dive-sync, schermate-97). difficolta-156 è rosso per il conflitto dichiarato.
- `npm run mappa-unica` verde. Il guardiano sta già nelle righe src/18|src/10, src/16 e src/0[0-8] della MAPPA: nessuna riga nuova.
- Le foto di `docs/collaudo-grafico` rigenerate dalle sentinelle sono state riportate al commit (non sono di questo giro).

**Guardiani della zona NON girati** (li giudica il treno): quelli delle righe src/18|src/10 e src/0[0-8] della MAPPA che leggono il
mister o la simulata, in particolare `simulata-272`, `mister-215`, `pre-188`, `simula-v2`, `partita-rigiocata-194`, `squalifica-222`,
`bilancio-310`, `sim-motore`, `minuti-202`, `stili-098`, `neutro-287`, `salto-323`, `primavera-260`, `career-invariants`,
`stab-nat-trigger-test`, `career-sim-test`.

## 5. Dubbi per il PO (consigliata per prima, GIÀ APPLICATA)

**Il conflitto, in numeri.** Con il voto delle simulate deciso da PO-360 (pagella del motore) e dal «+0,3» del 21/11, il voto medio
per fase è 6,66 / 6,72 / 7,01 / 6,69. PO-156 chiede 6,0 / 6,4 / 6,9 / 6,3 ±0,2. Per rientrare bisognerebbe togliere 0,4-0,6 al voto
simulato in gavetta e in declino, cioè riportarlo a quello che PO-360 ha chiamato «troppo severo». La sola gavetta senza il +0,3 sta a
6,27-6,41: è fuori anche così.

1. **(consigliata, applicata)** Tenere il voto di PO-360 e del 21/11, e riportare nei bersagli tutto il resto (titolarità, minuti,
   vittorie, gol) togliendo i doppi conteggi. Il guardiano resta **rosso dichiarato** sulle 3 celle del voto finché il PO non decide i
   bersagli del voto per le simulate. Questa rispetta le decisioni più recenti (11/11 e 21/11) e tocca il gioco in tre punti piccoli,
   ognuno con il suo interruttore.
2. **Nuovi bersagli di voto** per le carriere simulate, quelli misurati dopo PO-360 (circa 6,6 / 6,7 / 7,0 / 6,7). Il verde arriva solo
   se il PO li fissa: non la sessione.
3. **Togliere le partite simulate dal voto del guardiano**: la curva del voto si giudica sulle carriere giocate. Oggi questo percorso
   non esiste e costa molto (strada b del giro 269).
4. **Rivedere PO-360**: voto simulato compresso verso i bersagli PO-156 (per esempio togliere il +0,3 o scalare la pagella per fase).
   Torna la severità di cui il PO si era lamentato.

Altre domande:
- **Il mister e le simulate.** Con la consigliata il mister ignora il voto delle partite simulate anche nella carriera giocata (come la
  media della Home). Se il PO vuole che un buon voto simulato faccia guadagnare il posto, il prezzo misurato è titolarità in gavetta
  65% contro 45±10.
- **Celle al bordo.** Vittorie in declino e gol in affermazione oscillano attorno al tetto con 10 semi. Si possono portare i semi del
  guardiano a 20 (raddoppia il tempo, ~6 min, nessuna soglia cambiata) oppure lasciare tutto così.
