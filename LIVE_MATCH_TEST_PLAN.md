# LIVE MATCH — TEST PLAN

> **Documento di pianificazione QA. Nessun codice/test ancora scritto: attende approvazione.**
> Piano di test per le milestone di `LIVE_MATCH_IMPLEMENTATION_PLAN.md`, mappato sulle Golden
> Rules (Cap. 12) e sulla realtà del **quality gate** esistente (`tests/visual`, 12 check).
>
> **Vincolo QA fondamentale (dalla `docs/LIVE_MATCH_ENGINE_ANALYSIS.md` §E.3):** il gate valida
> **stato/coerenza/golden su frame congelati**, gira **GLB-OFF**, e **non** valida movimento,
> traiettorie, camera, overlay dinamici, chaining, Freeze, cerimonia. Quelle aree sono
> **«gate-cieche»** → richiedono **collaudo dal vivo** (spesso screenshot Playwright).
> Il TEST_PLAN distingue sempre **[GATE]** (automatizzabile) da **[LIVE]** (dal vivo).

---

## 0. Livelli di test

| Livello | Strumento | Cosa copre | Bloccante? |
|---------|-----------|-----------|------------|
| **L0 Transpile** | il gate carica il gioco | Babel transpila (se il gate parte, ok) | Sì |
| **L1 Gate 12/12** | `npm run validate-situations` | stato, orientation, visual, movements, golden, final-state, determinism, post-highlight, data-coherence, timeline, motion, ball-motion | **Sì** |
| **L2 Quick-gate** | `npm run quick-gate` | subset ~26 situations per loop di sviluppo | No (dev) |
| **L3 Assertion (M3)** | `?cpmassert=1` + check `timeline` | coerenza overlay↔3D, cronaca↔outKey, Freeze | **Sì (post-M3)** |
| **L4 Live** | Playwright ad-hoc / manuale + screenshot | movimento, camera, overlay, chaining, memoria, feel | Sì (firma umana) |
| **L5 Regressione carriera** | manuale/script | save-compat, avanzamento, stagione | Sì |

Comando gate (sessioni cloud):
```bash
cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run validate-situations
```
Atteso: `✅ PASS`, 12/12, fingerprint `00001505` stabile.

---

## 1. Test per area (mappa Golden Rules → verifica)

### 1.1 Gameplay
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| GP-01 | Ogni azione disponibile è selezionabile; scelte ≥2 dopo `filterSitActions` | GR-014 | GATE (movements) | menu azioni valido su tutte le 179 sit. |
| GP-02 | Il motore non forza l'esito: esiste sempre P(fallimento)>0 e P(successo)>0 | GR-016/017 | GATE (timeline) | `rate` clamp [0.05, 0.84] |
| GP-03 | Lettura > riflessi: nessun timer «di riflessi»; il freeze dà tempo | GR-006/007/008 | LIVE | il timer di lettura non penalizza la riflessione |
| GP-04 | Freeze: off-ball fermi durante `hl_choose` | GR-009…012 | **L3 (M3)** + LIVE | asserzione `Freeze` ok; dal vivo nessun off-ball si muove in lettura |
| GP-05 | Eroe sempre coinvolto (mai spettatore) | GR-004, Cap.10.2 | GATE (initial-state) | l'eroe riceve hl_move/hl_choose in ogni HL |

### 1.2 IA
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| AI-01 | Off-ball reagisce **dopo** la scelta (non durante il Freeze) | GR-024/025, Cap.4.9 | LIVE + L3 | movimento off-ball parte all'uscita da hl_choose |
| AI-02 | Marcatura goal-side, pressing, F10 linea di passaggio, F11 press&cover, F13 GK entro CAP | Cap.4.5 | GATE (initial-state/orientation: bound GK) + LIVE | GK home x≤25, away x≥75; home<away |
| AI-03 | (M2-opz `cpmadapt`) bias marcatura sul lato più cercato **non** degrada leggibilità | Cap.4.12 | LIVE (flag ON) | dal vivo: shift percepibile ma non caotico; OFF durante il gate |
| AI-04 | Nessun movimento casuale non seedato | GR-027, determinismo | GATE (determinism) | due run identici → stesse posizioni logiche |

### 1.3 Animazioni
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| AN-01 | Invariante CINE: testa/volée ⟹ palla aerea; set-piece ⟹ palla ferma | GR-035/036 | **GATE (data-coherence, FAIL bloccante)** | 0 violazioni |
| AN-02 | Variante animazione coerente con la scelta (shot/cross/header/…) | GR-037/038 | GATE (visual/golden) + LIVE | `actType`=hlType; `sw=sin(u·π)` si auto-azzera |
| AN-03 | (P1) chip proposto/reso solo con GK non sulla linea | Cap.7.2/7.5 | LIVE + L3 assert | nessun pallonetto su GK fermo |
| AN-04 | (P2) conduzione ball-carry senza «slide» evidente | GR-035, Cap.7.6 | LIVE (screenshot before/after) | foot-slide ridotto |
| AN-05 | No T-pose glide (crossfade `_runB`) | Cap.7.7 | GATE (motion) + LIVE | soglia `alive` motion ok |

### 1.4 Cronaca
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| CR-01 | Cronaca descrive solo l'esito reale (`OUTCOME_TX` ⟺ outKey) | GR-043/046 | **L3 (M3)** | asserzione cronaca↔outKey ok |
| CR-02 | (M2) frasi di continuità sempre veritiere (mai riferimenti a eventi non accaduti) | GR-057…061, Cap.5.6 | L3 + LIVE | «ci riprova» solo se c'è stato un errore reale |
| CR-03 | Nessuna ripetizione ravvicinata (dedup BG ultimi 3 + memoria M2) | GR-045/069 | LIVE | nessuna frase duplicata in finestra breve |

### 1.5 HUD
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| HU-01 | Punteggio/xG/tiri/rating riflettono lo stato reale | GR-064, Cap.6.9 | GATE (final-state) | HUD ⟺ `mStats`/`mxStats` |
| HU-02 | Barra momentum/possesso coerenti con gli eventi | Cap.6.9 | GATE (final-state) + LIVE | valori entro range, coerenti con swing |

### 1.6 Overlay (sovraimpressioni)
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| OV-01 | **«GOL — Nome» solo se l'eroe segna davvero** | GR-049 | GATE (timeline) + L3 | 0 falsi positivi |
| OV-02 | **overlay-family ⟺ arc-family** (M1): niente «PALO!» su una parata | GR-048/052/065, Cap.6.8 | **L3 (M3), FAIL bloccante** | 0 divergenze su tutte le famiglie granulari |
| OV-03 | ASSIST ha overlay dedicato (non «GOOOOL!») | GR-050 | GATE (timeline) | overlay assist ⟺ outKey `assist` |
| OV-04 | miss_easy/foul/goal_against/save/recovery hanno overlay corretto | GR-051/052 | L3 + LIVE | mapping granular→pool corretto |

### 1.7 Telecamere
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| CA-01 | Pallone ed Eroe sempre leggibili (no camera che li nasconde) | GR-054/055 | LIVE (screenshot per hlType) | soggetto in frame |
| CA-02 | Override camera per hlType + result-framing + GK-tracking | Cap.5.3 | LIVE | inquadratura corretta per situazione |
| CA-03 | Nessun clipping/telecamera sotto il campo | Cap.11.9 | LIVE | nessun artefatto |

### 1.8 Salvataggi
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| SV-01 | M1/M2/M3 **non** bumpano `SAVE_VERSION` (stato effimero) | Cap.11.13 | L5 | `SAVE_VERSION`=7 invariato |
| SV-02 | Load save esistente (v7) → nessun campo mancante richiesto | — | L5 | carriera carica invariata |
| SV-03 | Autosave 3 slot integri dopo una partita con M1/M2 attivi | — | L5 | slot `cpm-v3/-s2/-s3` coerenti |

### 1.9 Performance
| ID | Test | GR | Livello | Atteso |
|----|------|----|---------|--------|
| PF-01 | `cpmAssert` no-op in produzione: 0 overhead senza `?cpmassert=1` | GR-075, Cap.11.16 | LIVE (perf-monitor) | load-time/heap invariati |
| PF-02 | M1 (funzione pura) non impatta frame-timing | GR-075 | GATE (perf, warn-only) + LIVE | nessun calo FPS |
| PF-03 | M2 memoria in-memory (ring piccolo) trascurabile | GR-078 | LIVE | heap stabile |

### 1.10 Regressione (non-negoziabile, ogni milestone)
| ID | Test | Livello | Atteso |
|----|------|---------|--------|
| RG-01 | Gate **12/12 verde**, fingerprint `00001505` | L1 | PASS |
| RG-02 | Nuova carriera → calendario + standings generati | L5 | ok |
| RG-03 | Avanzamento 5+ settimane senza crash | L5 | ok |
| RG-04 | Partita completa giocata fino a `ended` | L4/L5 | ok |
| RG-05 | Inizio nuova stagione → promozioni/retrocessioni + spot europei | L5 | ok |
| RG-06 | Coppa / Euro-Mondiale giocabili invariati | L5 | ok |

---

## 2. Test specifici per milestone

### M1 — Unified Outcome Model
- **[GATE]** RG-01 (fingerprint stabile: M1 non cambia la firma golden).
- **[GATE]** timeline: intent/outcome-key invariati.
- **[LIVE]** matrice esiti granulari: per ognuno di `{goal, post, saved, wide, blocked, corner,
  assist, miss_easy, intercept, goal_against, foul, recovery}` forzare un HL e verificare che
  **overlay + cronaca + 3D concordino**. Tabella di firma richiesta (12 righe, tutte ✓).
- **[L3, dopo M3]** OV-02 diventa asserzione bloccante.

### M3 — Coherence Assertion Layer
- **[GATE]** con `?cpmassert=1` attivo nella passata force+resolve: 12/12 verde.
- **[GATE, negativo]** introdurre un'incoerenza deliberata in un branch usa-e-getta → il check
  `timeline` deve **FALLIRE** (prova che l'asserzione morde). Poi scartare il branch.
- **[LIVE]** PF-01: senza flag, 0 overhead.
- **[GATE]** Freeze: passata dedicata `?cpmassert=1` senza `?cpmtest=1` → asserzione Freeze ok.

### M2 — Match Memory
- **[GATE]** determinism: due run → stesse frasi di continuità.
- **[L3]** CR-02: nessuna frase di continuità falsa.
- **[LIVE]** partita completa: la narrazione «ricorda» (secondo assist, GK in serata, ci riprova)
  in modo coerente; `?cpmadapt` OFF durante il gate.
- **[L5]** SV-01/02: nessun bump save, load invariato.

### Polish P1 / P2
- **[LIVE]** AN-03 (chip/GK) e AN-04 (ball-carry) con screenshot before/after.
- **[L3]** P1: asserzione «chip ⟹ GK non sulla linea».

---

## 3. Gate di rilascio (checklist finale per ogni push)
- [ ] L1 Gate **12/12 verde**, fingerprint atteso (o golden rigenerato+committato con motivazione).
- [ ] L3 asserzioni verdi (post-M3).
- [ ] L4 collaudo dal vivo firmato per le parti gate-cieche (screenshot allegati).
- [ ] L5 regressione carriera (RG-02…06) ok.
- [ ] `GAME_VERSION` bumpato; changelog `[x.y.z]`.
- [ ] Nessun bump `SAVE_VERSION` non intenzionale.

> **Nota QA Director:** la copertura automatica **non** sostituisce il collaudo dal vivo per le
> aree gate-cieche. Ogni milestone che tocca render-loop/overlay/camera/memoria richiede una
> firma umana su L4, come da §E.3 dell'analisi motore.
