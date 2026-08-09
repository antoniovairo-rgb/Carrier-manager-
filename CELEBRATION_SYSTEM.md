# Celebration System — analisi e progetto d'integrazione

> STEP 1–2 della direttiva PO «esultanze dopo i gol». Questo documento dice **cosa c'è già**,
> **cosa manca davvero** e **dove si innesta** il sistema. Il codice sta tutto in
> `CARRIER-MANAGER-AV.html` (file unico), come ogni altra cosa.

## 1. Le due scoperte che decidono il progetto

### 1.1 Un'esultanza esiste già — ma è INVISIBILE nel renderer di default

`ThreeMatchView` ha `celebT` (render-loop): al gol di casa parte un salto verticale
dell'eroe più uno **swing delle braccia** (`hero._aL.rotation.z` / `_aR.rotation.z`).

Il punto è che dal 5.46 i 22 giocatori sono **modelli GLB CH38 di default**, e in quella
modalità il mesh procedurale è *nascosto*:

```js
// animOne, ~10912
if(mesh._glbDriven)return; // in GLB il procedurale è nascosto → si aggiorna SOLO la posizione
```

Conseguenza misurabile: delle due componenti dell'esultanza attuale, **la posizione (il salto)
si vede, la rotazione delle braccia no**. Con CH38 attivo — cioè per il PO, sempre —
l'esultanza è un saltello muto senza braccia. Non è che «manchi il sistema»: è che il sistema
parla una lingua che il renderer di default non rende. È esattamente la classe di difetto
documentata in `CLAUDE.md` (direttiva PO 2026-07-29, le 26 bocciature «non si vede il gesto
tecnico finale» nate da verifiche GLB-OFF).

**Regola che ne discende: ogni celebrazione deve essere espressa in POSIZIONE, ORIENTAMENTO e
CLIP GLB. Le pose procedurali non contano.**

### 1.2 Non esiste NESSUNA clip di esultanza fra gli asset

Inventario reale di `assets/` (clip per giocatori di movimento):

| clip | uso attuale | riusabile come |
|---|---|---|
| `anim-throwin.glb` | gesto `lift` — **già usato per l'alzata del trofeo** (`_cerLift`) | **braccia alzate** ✅ |
| `anim-jog.glb` / `jog-back` / `strafe-l/r` | locomozione | **corsa** (verso pubblico / compagni) ✅ |
| `anim-idle.glb` | fermo | contenuta ✅ |
| `anim-kick` / `penalty` / `header` / `tackle` / `volley` / `receive` | gesti tecnici | ❌ non sono esultanze |
| `anim-gk-*` | portiere | ❌ |

Non ci sono: scivolata sulle ginocchia, pugni al cielo, braccia larghe, indicare il pubblico,
capriole. **Non vanno inventati.** Il vocabolario delle esultanze si costruisce con ciò che
esiste — clip `lift`, locomozione, e trasformazioni del CORPO INTERO (posizione, salto,
rotazione), che sotto CH38 si vedono perché il GLB segue la posizione del mesh guida.

La tabella delle esultanze dichiara per ogni voce **quale clip richiede**: quando arriveranno
nuove clip basta aggiungere righe, senza toccare né selezione né esecuzione.

## 2. Cosa c'è già e va RIUSATO (niente sistema parallelo)

| Serve | Esiste già | Dove |
|---|---|---|
| **GOAL_CONFIRMED** | `fireGoalCeleb` — idempotente (`g.fired`), sparato all'**ingresso in rete** (`onGoalInNet` dal renderer), con fallback 5200ms | `LiveMatch` ~15648 |
| contesto del gol | `scoreRef` (punteggio logico), `clockRef` (minuto), `mw` (importanza), `isMatchHome` | `LiveMatch` |
| marcatore | `goalCelebRef.current.{assist,scorerName}` — distingue già gol dell'eroe da assist | ~17437 |
| reazione pubblico | `setWaveEvent` → `goalBurstT`, coriandoli, `shakePow`, `crowdOhT` | ~12163 |
| audio | `AudioMgr.event({type:'GoalHero'\|'GoalTeam'})` — **passa dal mixer globale**, rispetta le impostazioni | ~15651 |
| esultanza eroe | `celebT` (salto + braccia procedurali) | ~13058 |
| coreografia di gruppo | **cerimonia** (`ceremony`, `cerT`, giro di campo, `_cerLift`) — già muove 11 giocatori con beat temporizzati | ~13081 |
| movimento senza teletrasporti | `animOne` — modello a velocità con inerzia, sterzata limitata, punta per giocatore (7.198) | ~10806 |
| stacco di regia | `setCutFx` | ~17675 |
| ritorno alla partita | ripartenza dal centro dopo il gol (Sprint C 4.90.0) + `handleContinue` | ~17647 |

**Il sistema non va creato da zero: va reso visibile, contestuale e vario.**

## 3. Architettura d'innesto

Sette pezzi separati, come chiesto — i primi due **puri e testabili in node**:

```
fireGoalCeleb (GOAL_CONFIRMED, già esistente)
   │
   ├─ goalContext(...)        ← PURO: classifica il gol            [nuovo]
   ├─ pickCelebration(...)    ← PURO: sceglie l'esultanza          [nuovo]
   │
   ├─ celebPlan (prop) ──────→ ThreeMatchView
   │                             ├─ SCORER_CELEBRATION  (esecuzione)
   │                             ├─ TEAM_REACTION       (compagni scaglionati per distanza)
   │                             └─ CAMERA              (enfasi per tier)
   ├─ AUDIO   → AudioMgr.event (invariato: nessun bypass del mixer)
   └─ RETURN_TO_MATCH → ripartenza dal centro (invariata)
```

### 3.1 `goalContext` — puro
Ingressi: marcatore (`hero`/`mate`/`own`), minuto, punteggio **prima** e **dopo**, importanza
partita, tipo di gol (azione/rigore/punizione), posizione sul campo.
Uscita: `{by, tier, tags[]}` con `tier ∈ {NORMAL, LEAD, EQUALIZER, LATE, DECISIVE, MATCH_WINNER}`.

La classificazione guarda il **peso sul risultato**, non il minuto da solo — 1-1 all'88' che
diventa 2-1 è `MATCH_WINNER`; 3-0 al 20' che diventa 4-0 è `NORMAL`.

### 3.2 `pickCelebration` — puro
Sceglie fra le voci del vocabolario **compatibili** con: tier, chi ha segnato, clip disponibili,
spazio fisico (distanza da porta/pali/linee), distanza dai compagni. Deterministica (seed da
`hashStr`), con **anti-ripetizione** sulle ultime scelte della partita.

### 3.3 Esecuzione
Macchina a stati nel render-loop, alimentata da `celebPlan`, che rispetta le regole di moto
esistenti: si muove con `animOne` (quindi niente teletrasporti, niente inversioni istantanee),
parte **solo dopo** la conferma del gol, e non interrompe il follow-through del tiro.

## 4. Vincoli non negoziabili

- **Mai** avviare una celebrazione se il gol non è confermato (`fireGoalCeleb` è l'unica porta).
- **Mai** bypassare il mixer audio.
- Il gate 14/14 deve restare verde con fingerprint invariato: il gate forza le situation e non
  entra nella cerimonia, ma la firma golden legge camera e conteggi → l'esecuzione non deve
  toccare lo stato in `hl_choose`.
- Nessun asset nuovo, nessun caricamento per gol: si riusano le clip già montate.
