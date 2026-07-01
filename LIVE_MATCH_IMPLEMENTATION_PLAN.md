# LIVE MATCH — IMPLEMENTATION PLAN

> ## ✅ STATO DI AVANZAMENTO (aggiornato)
> Roadmap **approvata e avviata**. Milestone P0/P1 **completate e in produzione** (`main`):
>
> | Milestone | Versione | Stato | Note |
> |-----------|----------|-------|------|
> | **M1 · Unified Outcome Model** | 5.52.0 | ✅ **PROD** | Esito granulare unico (outKind) → overlay+cronaca+3D coerenti. Gate 12/12, fingerprint 00001505. |
> | **M3 · Coherence Assertion Layer** | 5.53.0 | ✅ **PROD** | `CoherenceCheck` nel gate (overlay-family ⟺ arc-family). Negative test superato (rottura M1 → timeline FAIL). |
> | **M2 · Match Memory** | 5.54.0 | ✅ **PROD** | Continuità narrativa (riscatto/doppietta/2° assist/portiere in serata). Effimera, no save bump. |
> | Polish P1 · chip/GK · P2 · ball-carry | — | ⏳ backlog | Gate-ciechi, da collaudare dal vivo. |
>
> M2-`cpmadapt` (IA off-ball adattiva) resta **OFF** (flag), da collaudare dal vivo prima di attivarlo.
> Il dettaglio operativo sotto resta la specifica di riferimento delle milestone.

---

> **Documento di pianificazione.** Le milestone P0/P1 sono state implementate (vedi stato sopra).
> Roadmap operativa derivata da `LIVE_MATCH_ARCHITECTURE_REVIEW.md`. Ogni milestone è
> **completabile e validabile indipendentemente**, con obiettivo, file/simboli coinvolti,
> dipendenze, rischio, rollback, feature flag, test di regressione e criteri di completamento.
>
> Vincoli di progetto (CLAUDE.md): **file unico** `CARRIER-MANAGER-AV.html`; **gate 12/12 verde
> prima di ogni push** (fingerprint atteso `00001505`); **bump `GAME_VERSION` a ogni push**;
> save-compat con migration se si tocca lo stato salvato; annuncio «Pushato su GitHub — CPM x.y.z».

---

## Principi di sequenziamento

1. **M1 + M3 in coppia** (coerenza a monte + sua verifica). **M2** indipendente, a seguire.
2. Preferire modifiche su **funzioni pure** (gate-verificabili) rispetto al render-loop
   (gate-cieco). Ordine: M1 (puro) → M3 (osservativo) → M2 (additivo) → Polish (render-loop).
3. **Ogni milestone dietro feature flag** dove tocca resa/comportamento, così il rollback è
   «flag off» e il confronto A/B è immediato dal vivo.
4. **Nessun `SAVE_VERSION` bump previsto** in M1/M2/M3 (tutti effimeri). Se un polish futuro lo
   richiedesse, seguire il pattern di migration in `useEffect` di `CareerApp`.

---

## Milestone M1 — Unified Outcome Model  ·  Priorità P0  ·  Rischio BASSO

### Obiettivo
Un **solo oggetto esito** prodotto alla risoluzione dell'highlight e consumato da 3D, overlay,
cronaca, HUD, timeline. Elimina la divergenza overlay↔3D↔cronaca (W1) alla radice. Chiude
GR-048/049…052/065 e Cap. 6.8/6.11.

### File / simboli coinvolti (tutti in `CARRIER-MANAGER-AV.html`)
- `handleAction` (~2435–2447, risoluzione) — costruisce `resolution`.
- `decideExecution` (~5747–5803) — espone l'esito **granulare** già calcolato.
- `hlOverlay` (~2494) — accetta `resolution`, sceglie sotto-categoria da `granular`.
- `OUTCOME_TX` / cronaca (~9350–9499) — idem.
- `fireConclusion` + catene post-arco (`in_net/hit_post/deflect/save`, in `ThreeMatchView`) —
  input unificato da `resolution.granular` (comportamento invariato, sorgente unica).
- `cpmEmit('ActionResolved'|'HighlightTimeline', …)` — includere `granular` nel payload.

### Approccio (contratto, non codice)
```
resolution = {
  outKey,            // 12-valori (stato salvato, invariato)
  granular,          // ~30-valori da decideExecution (post/saved/wide/blocked/…)
  ok, heroFirst, actionLabel, hlType, hlVariant, quality, seed
}
overlayFamily(resolution)  DEVE ⟺  arcFamily(resolution)   // nuova invariante (M3 la verifica)
```
- **Nessun** cambio alle probabilità né a `succRate` → gli esiti restano identici; cambia solo
  **quale testo/animazione** si sceglie *coerentemente*.
- Mapping `granular → overlay sub-pool` e `granular → arc chain` centralizzato in **una tabella
  unica** (single source of truth), così i due lati non possono più divergere.

### Dipendenze
Nessuna. È il fondamento di M3. Non dipende da M2.

### Feature flag
`?cpmunify=0` (default **ON**) per disattivare temporaneamente il routing unificato e tornare al
comportamento legacy in caso di anomalia dal vivo. Rimosso dopo bake-in.

### Rollback
Flag `cpmunify=0` → ripristino comportamento legacy senza revert. Rollback duro: `git revert`
del commit M1 (nessuno stato salvato toccato → reversibile pulito).

### Test di regressione
- **Gate 12/12 verde**, fingerprint `00001505` stabile (M1 non cambia la firma golden: gli esiti
  e i conteggi mesh sono invariati).
- Check `timeline`: nessuna regressione su intent/outcome-key.
- Check `data-coherence`: invariante CINE intatta.
- **Dal vivo (gate-cieco):** 20+ highlight forzando ogni famiglia (goal/post/save/wide/blocked/
  assist/miss_easy) → overlay, cronaca e 3D **concordano** sull'esito.

### Criteri di completamento
- [ ] `resolution` unico costruito in `handleAction` e passato a tutti i consumatori.
- [ ] `hlOverlay`/`OUTCOME_TX` selezionano da `granular` (niente più random dentro `miss`).
- [ ] `overlayFamily ⟺ arcFamily` vero su tutte le famiglie (verificato a mano + da M3).
- [ ] Gate 12/12, fingerprint stabile. Collaudo dal vivo firmato.

---

## Milestone M3 — Coherence Assertion Layer (dev-only)  ·  Priorità P0  ·  Rischio MOLTO BASSO

### Obiettivo
Portare **nel gate** la coerenza overlay↔3D (M1) e il **Freeze** (oggi off sotto `_CPM_TEST`),
tramite asserzioni **passive** (solo log su `__CPM_TIMELINE`). Traduce Cap. 11 nell'idioma
offline del progetto (niente auto-correzione runtime — vedi review §1 Cap. 11).

### File / simboli coinvolti
- Nuovo helper `cpmAssert(name, cond, detail)` — **no-op** se non `?cpmassert=1`; altrimenti
  `cpmEmit('CoherenceCheck', {name, ok:cond, detail})`. Try/catch, zero effetto su stato/render.
- Punti di emissione: risoluzione HL (overlay-family ⟺ arc-family, cronaca ⟺ outKey), e nel
  render-loop il rispetto del Freeze off-ball (solo quando non `_CPM_TEST`).
- `tests/visual/checks/…timeline.mjs` — consuma i record `CoherenceCheck` → **FAIL** se `ok=false`.
- `tests/visual/lib/*` — abilita `?cpmassert=1` nella passata force+resolve del gate.

### Approccio
- Le asserzioni **non modificano nulla**: pattern identico a `_CPM_TEST`/`__CPM_GLB`
  (opt-in/sicuro, solo push su timeline). → **gate-safe by construction**.
- Il Freeze: sotto `?cpmassert=1` **senza** `?cpmtest=1`, il gate esegue una passata dedicata che
  **non** disattiva `_readFreeze` e asserisce che gli off-ball non si muovano durante `hl_choose`.

### Dipendenze
**M1** (per asserire overlay↔3D serve l'esito unificato). Il ramo Freeze è indipendente da M1.

### Feature flag
`?cpmassert=1` (default **OFF** in produzione, come `_CPM_TEST`). Nessun impatto utente.

### Rollback
Le asserzioni sono passive: disabilitarle = non passare il flag. Rollback duro: `git revert`.
Non possono causare regressioni di gioco (non toccano stato/render).

### Test di regressione
- Gate 12/12 verde con il nuovo sotto-check attivo.
- Introdurre **volontariamente** un'incoerenza (in un branch usa-e-getta) → il gate deve
  **fallire** (prova che l'asserzione ha denti). Poi scartare il branch.

### Criteri di completamento
- [ ] `cpmAssert` implementato, no-op in produzione, verificato con page-load normale (0 overhead).
- [ ] Check `timeline` fallisce su incoerenza overlay↔3D e su Freeze violato.
- [ ] Gate 12/12 verde in condizioni normali; fingerprint stabile.

---

## Milestone M2 — Match Memory  ·  Priorità P1  ·  Rischio BASSO

### Obiettivo
Dare al match una **memoria narrativa** (Cap. 1.7/5.6/9.7/9.14, GR-057…063): la cronaca e gli
overlay possono riferirsi a ciò che è già successo; l'Event Engine evita ripetizioni oltre il
dedup BG. Realizza «la partita è una storia».

### File / simboli coinvolti
- `LiveMatch` (~8262–10316) — nuovo stato **effimero** `matchMemory` (ref o state locale, **non
  salvato**), aggiornato in `handleAction`/`handleContinue` e nel BG tick.
- `OUTCOME_TX` / `hlOverlay` — nuove frasi di continuità gate su `matchMemory`.
- `selectContextualSituations` (~scheduling) — bias anti-ripetizione leggero da `matchMemory`.
- (Opzionale, dietro flag) off-ball AI in `ThreeMatchView` — micro-shift marcatura sul lato più
  cercato.

### Struttura dati (effimera, non in `player`, nessun `SAVE_VERSION` bump)
```
matchMemory = {
  lastOutcomes: [outKey…],   // ring, max ~8
  goals, misses, saves,      // contatori
  byFlank: {L, C, R},        // dove si è attaccato
  mostSoughtMate,            // compagno più servito
  gkHot,                     // portiere avversario in serata (saves≥soglia)
  lastHeroMiss               // clock dell'ultimo errore (per «ci riprova»)
}
```

### Determinismo
Aggiornamento **puramente derivato** da esiti già deterministici; selezione frasi seedata
(`seed HL + stato memoria`). Nessun `Math.random()` non seedato. → `determinism` del gate
intatto.

### Dipendenze
Indipendente da M1/M3 (ma beneficia di M1: se l'esito è unificato, la memoria è più precisa).
Consigliato **dopo** M1.

### Feature flag
`?cpmmem=0` (default **ON**) per la parte cronaca/overlay. La parte **IA off-ball adattiva** è
dietro flag separato `?cpmadapt=1` (default **OFF**, gate-cieco → collaudo dal vivo obbligatorio
prima di attivarla di default).

### Rollback
`cpmmem=0` → cronaca torna context-free (comportamento attuale). `cpmadapt` resta OFF finché non
validato dal vivo. Rollback duro: `git revert` (nessuno stato salvato → pulito).

### Test di regressione
- **Gate 12/12 verde**, fingerprint stabile (la memoria non è nella firma golden; la parte
  adattiva off-ball resta OFF durante il gate).
- `determinism`: due run identici → stesse frasi di continuità.
- Save-compat: caricare un save esistente → **nessun campo nuovo richiesto** (memoria effimera).
- **Dal vivo:** partita completa → la cronaca richiama eventi passati in modo coerente; nessuna
  frase «ci riprova» senza un errore reale precedente.

### Criteri di completamento
- [ ] `matchMemory` popolato e resettato a inizio partita/intervallo.
- [ ] ≥1 famiglia di frasi di continuità attiva e **sempre veritiera** (mai riferimenti a
      eventi non accaduti — verificabile da M3).
- [ ] Nessun bump `SAVE_VERSION`; save vecchi caricano invariati.
- [ ] Gate 12/12 verde; `?cpmadapt` OFF di default.

---

## Polish P1 — Coerenza chip/GK (C-05)  ·  Priorità P2  ·  Rischio BASSO

- **Obiettivo:** il pallonetto (`shot_chip`) non deve essere proposto/reso quando il GK è sulla
  linea (incoerenza Cap. 7.2/7.5). Gate del chip sullo stato GK reale.
- **File:** `deriveHL` (selezione variante) / `filterSitActions` / `fireConclusion`.
- **Flag:** `?cpmchip=0` per legacy.
- **Test:** dal vivo (gate-cieco), + eventuale asserzione M3 «chip ⟹ GK non sulla linea».
- **Rollback:** flag / `git revert`.

## Polish P2 — Locomozione ball-carry  ·  Priorità P3  ·  Rischio MEDIO (gate-cieco)

- **Obiettivo:** ridurre la sensazione di «slide» nella conduzione (Cap. 7.6). Tuning
  `animOne`/timeScale, **niente** nuovo sistema.
- **Rischio:** tocca il render-loop **non validato dal gate** → solo dal vivo, dietro flag,
  con screenshot Playwright before/after.
- **Rollback:** flag / `git revert`.

---

## Riepilogo milestone

| ID | Nome | Prio | Rischio | Flag (default) | Save bump | Gate-verificabile |
|----|------|------|---------|----------------|-----------|-------------------|
| M1 | Unified Outcome Model | P0 | Basso | `cpmunify` (ON) | No | Sì (puro) + dal vivo |
| M3 | Coherence Assertion Layer | P0 | Molto basso | `cpmassert` (OFF prod) | No | Sì (estende gate) |
| M2 | Match Memory | P1 | Basso | `cpmmem` (ON) / `cpmadapt` (OFF) | No | Parziale + dal vivo |
| P1 | Chip/GK coherence | P2 | Basso | `cpmchip` (ON) | No | Dal vivo + assert |
| P2 | Ball-carry locomotion | P3 | Medio | `cpmcarry` (ON) | No | Solo dal vivo |

## Definition of Done (globale, per ogni milestone)
1. Gate **12/12 verde**, fingerprint `00001505` (o golden rigenerato+committato se la firma
   cambia legittimamente, con motivazione).
2. Collaudo **dal vivo** firmato per ogni parte gate-cieca (screenshot allegati dove utile).
3. `GAME_VERSION` bumpato con commento `[x.y.z]` sintetico.
4. Nessuna regressione su: nuova carriera, load save esistente, avanzamento 5+ settimane,
   partita completa fino a `ended`, inizio nuova stagione.
5. Push sul branch di lavoro; promozione a `main` **solo su autorizzazione esplicita**.
