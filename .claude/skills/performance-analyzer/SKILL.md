---
name: performance-analyzer
description: "Costo del render-loop di Korward Elite col vincolo mobile: da usare quando tocchi ThreeMatchView, animOne, AI off-ball, texture del pubblico o GLB — zero allocazioni per-frame, cadenza e round-robin delle CanvasTexture, LOD e InstancedMesh, cap di pixelRatio, dispose profondo all'unmount, e perche' gli fps headless non provano nulla."
---

# performance-analyzer — quanto costa un frame su un telefono

Solo **costo**: la correttezza la verifica `game-qa`, l'estetica `realism-reviewer`.
Il target non e' questo container ma un Android di fascia media con lo stadio, 22
CH38 skinnati, le particelle meteo e quattro canvas del pubblico.

## Quando si attiva
- Stai per aggiungere codice **dentro il render-loop** di `ThreeMatchView` (`animOne`,
  AI off-ball, archi palla, camera, tifo) o dentro `_mkGestures`/mixer GLB.
- Aggiungi mesh, materiali, `CanvasTexture`, particelle, o una nuova strumentazione
  per-frame (recorder, trappole, probe).
- Sospetto di stutter, crescita dello heap, campo nero alla partita successiva.
- Qualcuno propone di importare asset 3D/audio pesanti (→ vedi «peso APK»).

## Procedura

**1. Zero allocazioni per-frame.** Il PASS off-ball gira ~60 volte al secondo su 22
attori: ogni literal e' pressione GC. Il pattern gia' in casa (`grep -n "_tgPool" `,
~12104) e' un **buffer persistente su `sr.current`**: `_tgB`/`_tgPool` (24 slot),
`_ptPool`, `_hmPB`/`_awPB`, `_mkClaimB` (Set con `.clear()`), matrice riusata
`_cm._frM4`. Regole non negoziabili:
- slot con guardia di crescita `_tgPool[n]||(_tgPool[n]={})`;
- a ogni uso riscrivi **tutti** i campi dello slot (un campo non riscritto e' un
  valore stantio del frame precedente = bug silenzioso, non un problema di perf);
- nessun consumatore trattiene un riferimento oltre il frame (il pool si riusa);
- vietati nel loop: `new THREE.Vector3/Matrix4/Color`, `.map/.filter/.slice`,
  array literal, closure create al volo, template string, `JSON.stringify`.

**2. Strumentazione a memoria costante.** Il testimone `__CPM_WATCH_SNAP` (~10895)
e' un `Float32Array(30000*8)` con **decimazione a dimezzamento**: pieno → tiene un
campione su due, `step*=2`, copre il doppio del tempo a meta' risoluzione. Copia
quel pattern per qualunque nuovo tracciato; mai un array di oggetti che cresce per
tutta la partita. Tutto sotto `window.__CPM_REC`/flag test e mai in store build.

**3. CanvasTexture del pubblico.** Ogni `redraw` = repaint di una canvas 2048×512
(1024 su mobile) **+ upload GPU**. Due difese, entrambe gia' in piedi (~11972):
cadenza adattiva da `CROWD_CFG.anim` (sparse 420 / calmo 170 / idle 110 / burst
33, 50 mobile) e **round-robin**: una sola texture per tick
(`_crowdI % crowdAnims.length`), mai quattro. Sotto `?cpmtest=1` il pubblico resta
statico (`_stepMs=1e9`). Se aggiungi un settore, entra nel round-robin — non gli
dai un timer suo. Un `needsUpdate=true` per frame su una texture grande costa
piu' di tutta l'AI off-ball.

**4. LOD e instancing.** Le prime file sono `InstancedMesh` (busti+teste,
≤`CROWD_CFG.anim.frontRowPerStand`=64 per settore → 8 draw call) e le matrici si
riscrivono **solo** con `_atmoExc>0.02`: a riposo zero `setMatrixAt`. Le particelle
meteo sono gia' dimezzate su mobile (~10074: 400/650/1000 contro 800/1400/2200).
Regola: qualsiasi cosa si ripeta >20 volte va instanziata o scritta in texture.

**5. pixelRatio e resize.** Partita: `min(dpr, 2)` desktop / `1.5` mobile (~9562);
scene secondarie 1.0–1.6. Non alzarli. **`renderer.setSize` solo su resize reale** —
chiamarlo ogni frame rialloca il drawing buffer (era la causa degli scatti
dell'intro, 7.37.0).

**6. Dispose PROFONDO all'unmount** (~13534, e nelle scene Gala/Intervista/Intro):
- `scene.traverse` → `geometry.dispose()` **solo se `!o.isSkinnedMesh`**: le
  geometrie GLB sono **CONDIVISE** via `_glbCache`, disporle rende vuote le
  partite successive;
- per le scene che clonano avatar GLB, **rimuovi i root dalla scena PRIMA del
  traverse-dispose**, non dopo;
- ogni proprieta' `isTexture` del materiale va disposta, poi `material.dispose()`;
- `renderer.forceContextLoss()` **prima** di `renderer.dispose()` (dispose da solo
  non rilascia il contesto WebGL → si accumulano e la partita dopo e' nera).

**7. Cosa NON conta come prova.** Il `perf-monitor` (LMQP-8) e' **warn-only**:
Chromium headless rende via software, senza GPU → baseline ~10-12 fps, soglie
`fpsMin 8 / p95 250ms / heap 600MB / load 15s`. Un fps headless non dice nulla
sulla fluidita' sul device: serve solo a beccare regressioni grossolane (loop rotto,
hang) e soprattutto la **pendenza dello heap a scena statica** (leak detection, soglia
3 MB/s) — quella si', e' un segnale vero di allocazioni per-frame o mancato dispose.
Il giudizio sulla fluidita' e' del PO sul telefono.

**8. Peso APK.** Stadio e pubblico sono procedurali **per scelta del PO**: niente
import di modelli/texture di stadio, niente audio non compresso. I GLB (`assets/`,
footballer ~3,2 MB + clip) hanno prefetch al boot e cache condivisa `_glbCache` — un
url si scarica una volta sola e i **fallimenti non si cachano**. Prima di aggiungere
un asset: quanto pesa nell'AAB, e si puo' generare a runtime?

## Comandi

```bash
cd /home/user/Carrier-manager-/tests/visual
# perf + leak dell'ultimo gate (nessun run nuovo)
python3 -c "import json;d=json.load(open('out/validate/run-summary.json'));print(json.dumps(d['performance'],indent=1,ensure_ascii=False))"
# cronometro per fase del gate (se il run e' recente)
python3 -c "import json;print(json.load(open('out/validate/report.json'))['meta'].get('timings'))"
# gate completo (~10 min) — rimisura perf+leak
CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run validate-situations
# partite vere (GLB, presentazione): LMV_CTX=career|trial
CPM_CHROME=... PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node live-validator.mjs
```

```bash
# lint di allocazione sul solo diff, prima di pushare
cd /home/user/Carrier-manager-
git diff -U0 -- CARRIER-MANAGER-AV.html | grep -nE '^\+.*(new THREE\.(Vector3|Vector2|Matrix4|Color|Quaternion)|\.map\(|\.filter\(|\.slice\(|needsUpdate *= *true)'
grep -n "_tgPool\|_mkClaimB\|_crowdI\|frontRowPerStand" CARRIER-MANAGER-AV.html | head
# in pagina: window.__CPM_CROWD_TICK (cresce con la cadenza, non con gli fps) · __CPM_CROWD_ERR
```

## Criteri di uscita
- Il diff nel render-loop non alloca: il lint sopra non trova nulla, oppure ogni hit
  e' giustificato (fuori dal loop / una tantum al mount).
- Nuovi buffer: persistenti su `sr.current`, campi tutti riscritti, `Set.clear()`.
- Nuove texture/mesh: cadenza dichiarata, round-robin se sono >1, dispose all'unmount.
- `run-summary.json` → `performance.leak.slopeMBs` non peggiora e non compare un
  nuovo warning di heap.
- Gate 14/14 con fingerprint `00001505` (il costo non deve cambiare il gioco).
- Detto esplicitamente cosa resta da collaudare **sul device**, perche' il gate non
  misura la fluidita'.

## Errori gia' commessi
- **Riscrivere il pool a meta'.** Prima versione del pooling: uno slot riusato con
  un campo non riassegnato → valore del frame prima. Da qui la regola «tutti i campi».
- **Assert sbagliato negli script di edit**: `count()` contava una riga sola mentre il
  pattern compariva due volte sulla stessa riga → replace parziale. Usa l'Edit tool
  (dettaglio in `patch-only`).
- **`renderer.setSize` per frame** nell'intro: micro-stutter scambiato per «clip
  lente». Era la riallocazione del buffer.
- **Disporre geometrie GLB condivise**: partite/scene successive vuote. I root vanno
  staccati dalla scena prima del traverse.
- **`dispose()` senza `forceContextLoss()`**: contesti WebGL accumulati, campo nero.
- **Ottimizzare la griglia spaziale off-ball**: con N=22 il quadratico non e' il collo
  di bottiglia — il costo era il GC. Misura prima di refactorare (No Blind Fix).
- **Credere agli fps del gate**: 10,6 fps in headless e' il normale software rendering,
  non una regressione. Guarda invece heap slope e frame p95.
- **Snap e freeze spenti sotto `?cpmtest=1`** (7.345.0): se misuri il costo della
  presentazione, accendi `window.__CPM_PRESENT=1`, altrimenti stai cronometrando una
  scena che il giocatore non vede mai.
