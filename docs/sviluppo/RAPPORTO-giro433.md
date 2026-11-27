# Rapporto giro 433 — PO-687: carnagione «scura» più chiara del ritratto

Ramo: `sviluppo/giro433-carnagione-scura` (base `sviluppo/giro414-attaccatura` + `origin/main` 7.999.218).
GAME_VERSION e `docs/governo` non toccati. Rosso: `window.__CPM_NO_G433`.

## 1. La misura prima di toccare (No Blind Fix)

**Con lo strumento del giro 240 lo scarto non si vede.** `pelle-240` (CIE76 fra il centro del viso 3D e il riquadro x 40-60 % ·
y 36-50 % del ritratto) sui 22 corpi dell'ingresso:

| ora | Connor Quinn (figurina 854a2a) | Oscar Hayes (figurina a46440) | tutti i 22 visi |
|---|---|---|---|
| notte | ΔE 5,3 (reso 123,74,43 · ritratto 133,74,42) | ΔE 2,7 | mediana 3,4 · max 6,1 |
| tramonto | ΔE 6,3 | ΔE 4,5 | — |
| giorno | ΔE 6,0 | ΔE 4,4 | — |

Ampliata con la sonda nuova `misura-433.mjs` (i 22 corpi della fila prendono a turno la pelle di volti dell'indice scelti per
carnagione, con la stessa chiamata del gioco): **168 visi di notte, 84 al tramonto e di giorno, nessuno oltre 12** (scura: mediana
5,1-6,1, massimo 11,9). Sotto la soglia di `pelle-240`, quindi.

**Perché il PO lo vede lo stesso.** Il riquadro del ritratto cade su naso, zigomi e sotto-occhi, i punti più illuminati. Su un viso
scuro il centro illuminato è molto più chiaro del viso intero che su un viso chiaro (misurato su 40 ritratti per carnagione: centro −
viso intero = +5,5 L* sulle scure, +0,9 sulle chiare). Ho aggiunto una seconda grandezza: la **pelle dell'intero viso** (mediana di
L* sui pixel color pelle, nel riquadro x 28-72 % · y 22-55 % del ritratto e nel primo piano del testimone, senza la soglia R>70 che
sui visi scuri scarta proprio le ombre). ΔL* = 3D − ritratto, positivo = 3D più chiaro:

| ora | scura | ambrata | olivastra | chiara | eccesso scura − chiara |
|---|---|---|---|---|---|
| notte (168 visi) | **+6,5** | +7,2 | +4,2 | +1,4 | **+5,1** |
| tramonto (84) | **+6,9** | +7,7 | +5,6 | +2,1 | **+4,8** |
| giorno (84) | **+6,7** | +8,0 | +5,7 | +1,8 | **+4,9** |

Lo scarto c'è, su tutte e tre le ore, ed è di circa 5 L* oltre quello delle chiare. ⚠️ **Non è solo delle scure**: l'ambrata è
uguale o peggio, l'olivastra a metà. È un difetto che cresce col scurirsi della pelle; il compito chiedeva le sole scure e così ho fatto
(dubbio 1).

## 2. La correzione (solo carnagione «scura»)

`src/16`: `_pelle225` riceve un settimo argomento, la carnagione `k` dell'indice dei volti (`fg.k`), passato da tutti i chiamanti del
giro 240 (partita `src/12`, cerimonie, parata, serata). Con `k === 's'`:
- la tinta della pelle si moltiplica per `SCURA433 = [0,80, 0,80, 0,80]` (luce lineare, circa −5,6 L* sul viso);
- lo stesso fattore vale per **tutta la testa**: pixel poco saturi del lato pelle e lato capelli della maschera (dubbio 2).

Lo shader con la correzione si compila **solo per le scure** (chiave di programma con `S`): le altre carnagioni hanno lo stesso
codice e gli stessi uniform di prima, byte per byte. `ESP240` e `RESA240` restano quelli del giro 240 per tutte.

**Il primo tentativo è stato bocciato da `attaccatura-414`** (Connor Quinn, notte, 5,1 punti contro soglia 5): scurendo solo i pixel
di pelle tinta, il cuoio capelluto chiaro dipinto nella texture dei capelli alle tempie (lato capelli della maschera, presente
anche nel giro 414 e visibile in entrambi i bracci dei primi piani di `misura-414`) risaltava sulla fronte più scura (pelle −5 L*, pixel chiari del confine −2).
Esteso il fattore a tutta la testa, il confine di Connor torna a 3,3 % contro 3,3 % dell'interno e il guardiano è verde.

## 3. Dopo (guardiano `pelle-scura-433`, 4 giri = 84 visi per braccio, stessi volti nei due bracci)

| ora | braccio | scura ΔL* viso | chiara ΔL* viso | **eccesso** | scure oltre 12 (pelle-240) | spostamento a / o / c (mediana |ΔL*|) |
|---|---|---|---|---|---|---|
| notte | verde | +0,4 | +1,4 | **−1,0** | 0 (max 11,0) | 0,2 / 0,1 / 0,2 |
| notte | rosso | +6,5 | +1,0 | **5,5** | 0 | — |
| tramonto | verde | +1,4 | +1,3 | **0,1** | 0 (max 11,6) | 0,2 / 0,2 / 0,2 |
| tramonto | rosso | +6,6 | +1,3 | **5,3** | 0 | — |
| giorno | verde | +0,6 | +2,2 | **−1,6** | 0 (max 11,0) | 0,1 / 0,1 / 0,1 |
| giorno | rosso | +6,5 | +2,1 | **4,4** | 0 | — |

Le scure si spostano di −5,5/−5,6 L* (mediana per volto, verde − rosso); ambrata, olivastra e chiara di 0,0-0,2 (rumore fra due
pagine: la fila respira; il codice per loro è identico).

**Guardiano** `npm run pelle-scura-433` (GLB acceso, ora congelata, default notte, `CPM_TOD` per le altre), verde + rosso nello stesso
comando: eccesso scura − chiara ≤ 2,5 L*; nessuna scura oltre 12 di `pelle-240` (non si scurisce oltre il ritratto); ambrata, olivastra,
chiara ferme (|ΔL*| mediana ≤ 1,0) e scure spostate di almeno 3; nel rosso l'eccesso > 2,5; meno di N visi per classe = non giudicato
= rosso. 4 giri e non 3: con 2-3 giri l'eccesso «prima» oscillava fra 2,5 e 3,3 (il rosso sul filo), con 4 sta a 4,4-5,5.
Messo nelle righe MAPPA dove c'era già `pelle-240` per i file toccati (src/12-13 e src/16). `npm run mappa-unica` verde.

**Altri guardiani** (sul codice finale salvo dove detto):
- `pelle-240` ✅ (ingresso: mediana 3,9, massimo 9,7; rosso visibile)
- `attaccatura-414` ✅ (notte max 2,8 · giorno 2,6; rosso visibile)
- `presentazione-225` ✅ (la serata passa da `_pelle225` col nuovo argomento)
- `aspetto-412` ✅ — eseguito sulla prima stesura della correzione; la stesura finale cambia solo lo shader della testa, non stature,
  suole o corpi (non rieseguito)
- `test:logic` 51/51 · `check-src` coerente col build

## 4. Foto (notte, ingresso in campo, GLB acceso)

`docs/collaudo-po/433-prima-night-1..4.png` (`__CPM_NO_G433`) e `433-dopo-night-1..4.png`: 1 Connor Quinn e 2 Oscar Hayes (scura),
3 Sebastian Maxwell (ambrata), 4 Norman Bailey (chiara) — ritratto | corpo in partita | primo piano.
Onestamente: nelle foto le scure sono visibilmente più scure, ma Oscar Hayes resta più chiaro del ritratto a occhio. Il modello 3D
ha un viso uniforme e poco contrastato; il ritratto ha ombre profonde su guance e barba. La correzione allinea la pelle dell'intero
viso alla stessa distanza che hanno le chiare (+1-2 L*), non oltre.

## 5. Dubbi per il PO

**1. L'ambrata ha lo stesso scarto delle scure (+6,9…+8,0 L* sul viso intero, contro +1,3…+2,2 delle chiare).**
- **(consigliata, applicata)** Correzione sulle sole «scura», come chiesto; l'ambrata resta com'era e resta misurata dal guardiano.
- Estendere la correzione all'ambrata con un fattore suo e all'olivastra (fattori da misurare con la stessa sonda: non misurati in questo giro).
- Sostituire il fattore per classe con uno continuo sulla luminosità della figurina (più scura → più correzione): uno solo, per tutti.

**2. Sulle scure anche i capelli scendono del 20 % in luce lineare** (necessario per non far tornare la fascia chiara del giro 414:
la texture dei capelli dipinge alle tempie un cuoio capelluto chiaro). Tocca il tema del giro 432 (barba e capelli).
- **(consigliata, applicata)** Tenerlo: per Connor e Oscar (capelli scuri nel ritratto) i capelli 3D si avvicinano al ritratto.
- Scurire solo i pixel color pelle del lato capelli (cuoio capelluto), lasciando i capelli: più preciso ma da misurare col giro 432.
- Lasciare i capelli com'erano e accettare `attaccatura-414` a 5,1 su Connor (vietato abbassare la soglia: non percorribile senza PO).

**3. La grandezza di `pelle-240` è cieca a questo difetto** (centro illuminato del viso).
- **(consigliata, applicata)** Lasciarla com'è e affiancarle `pelle-scura-433` (viso intero): soglie del 240 invariate.
- Cambiare il riferimento della figurina `p` nell'indice dei volti con la mediana del viso intero (tocca `assets/portraits/ai/indice.json`,
  e con lui la taratura `ESP240`/`RESA240` di tutte le carnagioni).
- Portare la grandezza «viso intero» dentro `pelle-240` come braccio in più (un guardiano solo, più lento).

**4. Residuo visivo.** Anche a pelle allineata, il viso 3D resta piatto rispetto al ritratto (ombre). Se a occhio il PO lo trova ancora
chiaro, la prossima leva è il contrasto del materiale della testa (non la tinta), da misurare con la stessa sonda.

## File

- `src/16-scene-3d-cerimonie.jsx`: `SCURA433`, `_g433`, settimo argomento di `_pelle225`, chiamanti del giro 240.
- `src/12-three-match-view.jsx`: `_pelleFig240` passa `fg.k`.
- `CARRIER-MANAGER-AV.html`: ricomposto (`tools/build-src.mjs`).
- `tests/visual/misura-433.mjs` (sonda), `pelle-scura-433.mjs` (guardiano), `foto-433.mjs` (foto), `package.json`, `ci-runner.mjs` (MAPPA).
