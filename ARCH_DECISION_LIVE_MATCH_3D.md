# ARCH_DECISION_LIVE_MATCH_3D.md
## Decisione architetturale del refactor Live Match 3D (blocco 1.0)

> **Tipo:** Architecture Decision Record (ADR) — **vincolante**.
> **Mandato:** il Product Owner ha delegato al Technical Director la scelta architetturale ("decidi tu sull'architettura").
> **Stato:** DECISO. Fase di sola analisi — **nessun codice modificato, niente implementazione**.
> **Riferimenti:** `EVAL_LIVE_MATCH_3D.md` v2.0 (criterio di qualità), `PLAY_STORE_READINESS.md` (roadmap), Studio asset 3D (sessione precedente: ambiente→modello stilizzato→no mocap).

---

## 1. Sintesi delle decisioni (TL;DR)

| # | Tema | Decisione |
|---|---|---|
| **D-1** | Sistema personaggi | **Adottare il modello GLB skinnato** (stilizzato, non fotorealistico, **niente mocap**) come fondamento delle animazioni. I mesh procedurali attuali hanno un soffitto sotto il target. |
| **D-2** | Audio | **Dentro** il blocco 1.0, ma **minimale** (boato gol · coro/ambiente · fischio · calcio palla). Telecronaca completa **fuori** (futuro). |
| **D-3** | Replay | **Dentro**, ma **solo gol** (instant replay + slow-mo). Multi-angolo **opzionale**. |
| **D-4** | Strategia di refactor | **Refactor in-place + estrazione mirata** del solo layer personaggi/animazioni. **NIENTE big-bang split** del render-loop. |
| **D-5** | Sequenza | **1.0a Camera/Regia → 1.0b Personaggi+Palla → 1.0c Audio+Replay.** Si parte dall'area a massimo ROI e minimo rischio. |
| **D-6** | Performance | **LOD + skeleton sharing** (SkeletonUtils già caricato). Budget mobile misurato su device reale, non negoziabile. |

> **Punto di veto per il PO:** l'unica decisione "pesante" è **D-1** (cambio del sistema personaggi). È un investimento su asset + un rischio reale. Le altre sono a basso impatto. Se il PO vuole vetare qualcosa, è qui che deve guardare (§4.1).

---

## 2. Contesto

Il target del blocco 1.0 (EVAL v2.0) è "qualità percepita da videogioco calcistico moderno": **D2 ≥ 4,4 · D3 ≥ 4,5 · AI Vision ≥ 85/85 · niente voti 1–2**. L'audit ha stabilito che:
- i giocatori sono **mesh procedurali Three.js**; lo scaffolding **GLB skinnato è dormiente** (`loadGLB`/`colorCharGLB`, GLTFLoader + SkeletonUtils già caricati);
- il render-loop di `ThreeMatchView` è un **monolite ~1.960 righe** (animazioni eroe, locomozione `animOne`, off-ball AI);
- **audio e replay in-game non esistono**;
- tutto è **gate-blind alla resa** → la validazione è EVAL v2.0 + occhio del PO + AI Vision.

La domanda architetturale è: *si raggiunge il target migliorando i procedurali, o serve un cambio di fondamenta?*

---

## 3. Le decisioni, argomentate

### D-1 — Sistema personaggi: **GLB skinnato stilizzato** (no mocap)

**Decisione:** la base delle animazioni passa dai mesh procedurali a **personaggi GLB rigged/skinnati**, in stile **stilizzato** (coerente con lo Studio asset: non fotorealismo, non mocap completo), con un **set curato di clip** (idle, run, sprint, shot, pass, cross, header, tackle, dribble, celebrate, GK dive) **blendate** sul rig.

**Perché (root cause):** il limite a "rigido/basilare" non è un bug del tuning, è **strutturale**. Un cilindro/box procedurale non ha articolazioni: niente peso, niente follow-through, niente sincronia fine col pallone. Nessuna quantità di tweak sui procedurali porta D2 a 4,4 o l'AI Vision a 85. È la classica situazione "No Blind Fix": si cambia la fondamenta, non si lucida il sintomo.

**Coerenza con lo Studio asset (sessione precedente):** quello studio raccomandava *ambiente HDRI/PBR prima, modello stilizzato poi, mocap rimandato*. **D-1 lo rispetta:** modello **stilizzato** + clip curate (non mocap). L'ambiente PBR resta lavoro D5.3 (illuminazione), parallelo.

**Cosa NON è:** non è "rifare tutto in fotorealistico". Stilizzato = pochi modelli ben fatti, palette pulita, animazioni leggibili. È il punto di equilibrio qualità/peso/rischio.

### D-2 — Audio: **dentro, minimale**

**Decisione:** il blocco 1.0 include un **layer audio essenziale**: boato/ambiente folla (con dinamica sul momentum, riusa la logica già esistente), **fischio arbitro**, **suono del calcio alla palla**, **picco sul gol**. **Esclusi:** telecronaca parlata, cori per-squadra licenziati, librerie audio costose.

**Perché:** la Sezione C (Coinvolgimento) e D5.4 **non possono** raggiungere ≥4,2 in silenzio — l'audio è il moltiplicatore emotivo n.1 a basso costo. Ma la telecronaca è un progetto a sé → fuori. **Vincolo legale:** usare SFX con **licenza commerciale** (per lo store) — dipendenza da tracciare.

### D-3 — Replay: **dentro, solo gol**

**Decisione:** **instant replay del gol + slow-motion** dentro 1.0 (riusa l'infrastruttura `lib/replay.mjs`/`replay-trace` che già registra l'arco dell'azione). **Multi-angolo opzionale** (nice-to-have). Replay di azioni non-gol: fuori.

**Perché:** il replay sul gol è un **ritorno emotivo sproporzionato** (C4 "voglia di replay", C5 "sembra una TV") per uno sforzo contenuto, perché parte dell'infrastruttura di registrazione esiste già. Estenderlo a ogni azione moltiplicherebbe il costo senza pari ritorno.

### D-4 — Strategia di refactor: **in-place + estrazione mirata**

**Decisione:** **non** si fa il big-bang split del render-loop monolitico. Si rifattorizza **in-place**, estraendo **solo** il **layer personaggi/animazioni** in un modulo dedicato (`CharacterRig`/animation controller) — confine naturale imposto da D-1. L'off-ball AI, la camera e la conclusione restano dove sono finché non c'è una ragione *funzionale* per spostarli.

**Perché:** lo split architetturale completo è **gate-blind, alto rischio, zero valore percepito diretto** (è manutenibilità). Mescolarlo col cambio personaggi raddoppierebbe i rischi su un'unica grande modifica. "Una cosa alla volta": il confine di modulo emerge **dove la feature lo richiede** (i personaggi), non per estetica del codice.

### D-5 — Sequenza: **camera → personaggi/palla → audio/replay**

**Decisione e ordine vincolante:**

| Sub-blocco | Contenuto (dimensioni EVAL) | Rischio | ROI | Perché in questa posizione |
|---|---|---|---|---|
| **1.0a — Camera & Regia** | D3 (framing/tracking/zoom/regia contestuale/drammatizzazione) + D6.4/D6.5 (transizioni/fluidità) | **Basso** (logica, no asset) | **Altissimo** | Salto di "qualità da TV" rapido e a basso rischio. Nobilita anche i personaggi attuali **mentre** si prepara D-1. Difficoltà media → miglior rapporto qualità/sforzo. |
| **1.0b — Personaggi & Palla** | D-1 (GLB skinnato) + D2 (hero/locomozione) + D1 (interazione palla/fisica) | **Alto** | **Alto** | È il cuore "modern game feel" e la parte più grande/rischiosa. Si affronta quando la camera già regge la scena. |
| **1.0c — Audio & Replay** | D5.4 (audio) + D6.1-3 (replay gol/slow-mo) + D5.1/D5.2 (sync reazioni/folla) | **Medio** | **Alto (emotivo)** | Layer emozionale finale: massimizza la Sezione C una volta che immagine e movimento sono solidi. |

**Perché camera per prima:** è l'unica leva ad **alto ROI / basso rischio / no asset**. Dà al PO un miglioramento percepito **subito**, compra tempo per preparare gli asset GLB (1.0b), e una buona regia **migliora la valutazione di tutto il resto** (la camera è "la lente" — EVAL §5).

### D-6 — Performance: **LOD + skeleton sharing**, budget mobile

**Decisione:** i personaggi skinnati su **22 attori** su Android entry-level sono un rischio reale (costo skinning, draw call, GC). Vincoli architetturali:
- **LOD:** dettaglio/skinning pieno solo su **eroe + giocatori vicini alla palla**; modelli semplificati per i lontani.
- **Skeleton sharing** via `SkeletonUtils` (già caricato) per non duplicare scheletri.
- **Budget non negoziabile:** ≥30 fps stabili nel match su device entry-level reale; nessuna crescita monotona della heap su 5-10 partite. Misurato col perf-monitor **su device vero**, non headless.
- Se 1.0b sfora il budget → si riduce il LOD/numero di skinnati prima di sacrificare la qualità dell'eroe.

---

## 4. Rischi e mitigazioni

| Rischio | Gravità | Mitigazione |
|---|---|---|
| **GLB skinnato troppo pesante su entry-level** | 🟠 Alta | LOD + skeleton sharing + budget misurato; fallback a meno skinnati |
| **Licenza animazioni/asset non commerciale** | 🟠 Alta | Selezionare SOLO asset/clip con licenza commerciale esplicita (store) — checklist legale prima di integrare |
| **Regressione gate-blind** sul cambio personaggi | 🟡 Media | Gate 12/12 + 3 baseline ad ogni step; EVAL v2.0 ricompilata; step ≤300 righe; collaudo live PO |
| **Scope creep** (audio/replay che gonfiano) | 🟡 Media | Confini netti di §3 (audio minimale, replay solo gol) |
| **AI Vision 85 non raggiunto** anche con GLB | 🟡 Media | È un indicatore con rumore (EVAL §11): il gate vero è il PO; 85 come obiettivo, non legge |
| **Licenza SFX audio** | 🟡 Media | Solo audio royalty-free/commerciale; tracciato come dipendenza |

### 4.1 — Dove il PO può vetare
L'unica decisione che cambia sostanzialmente costo/rischio è **D-1 (GLB skinnato)**. Le alternative se il PO non vuole investire sugli asset:
- **A. Restare procedurali e abbassare il target** D2 a ~3,8–4,0 (qualità "buona" ma non "moderna"). Onesto: non si arriva a "videogioco moderno".
- **B. Procedurali + molto lavoro di regia/illuminazione** per mascherare il limite delle animazioni. Mitiga ma non risolve.
- **C. (scelta TD) GLB skinnato stilizzato** → unica via realistica al target EVAL.

Scelgo **C** perché è l'unica coerente con l'obiettivo dichiarato ("non funzionante, ma convincente"). Se il PO preferisce A/B, **abbassiamo i target EVAL di conseguenza** — ma va deciso consapevolmente.

---

## 5. Validazione (per ogni sub-blocco)

1. **EVAL_LIVE_MATCH_3D.md v2.0** ricompilata sul campione → milestone M1/M2/M3.
2. **Gate 12/12 + 3 baseline** verdi (lo stato non regredisce).
3. **AI Vision** come trend (non bloccante).
4. **Collaudo dal vivo del PO** = giudizio finale di "Accettabile".
5. **Perf-monitor su device reale** per 1.0b (budget §D-6).

---

## 6. Conseguenze sulle altre roadmap

- **PLAY_STORE_READINESS.md:** il blocco 1.0 resta P0 #1; ora ha un'architettura definita e tre sub-blocchi sequenziati. La voce performance (Fase 2) si integra nel budget D-6.
- **Studio asset 3D:** D-1 attiva la "Fase 2 — modello stilizzato" di quello studio; l'ambiente HDRI/PBR (Fase 1 di quello studio) confluisce in D5.3 (illuminazione), lavorabile in 1.0a/1.0c.
- **Refactor architetturale completo (Master Plan Fase 3):** **rinviato**. Si estrae solo il layer personaggi (D-4), non il resto.

---

## 7. Prossimo passo (quando si esce dalla sola analisi)

1. **PO prende atto / eventuale veto su D-1** (§4.1).
2. **PO compila la baseline EVAL v2.0** sullo stato attuale (fotografia di partenza).
3. Si parte da **1.0a (Camera & Regia)** — basso rischio, alto ROI, nessun asset — mentre in parallelo si **seleziona il modello GLB stilizzato + clip con licenza commerciale** per 1.0b.
4. Ogni step ≤300 righe, EVAL + gate ad ogni checkpoint.

> **In una riga:** fondamenta nuove dove servono (personaggi skinnati stilizzati), regia per prima perché rende subito, audio e replay per chiudere l'emozione — senza riscrivere il motore intero e senza inseguire il fotorealismo.
