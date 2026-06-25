# CPM — Framework di validazione automatica delle Situations

Quality gate permanente del motore delle Situations. Gira ogni Situation in modo
**deterministico** (seeded RNG + `__CPM_RESEED(gi)` + `dt=0` freeze) dentro il vero
render WebGL, e verifica correttezza **tattica, logica e visiva** con check modulari.

## Uso

```bash
cd tests/visual
npm run setup                      # una tantum: installa Playwright + Chromium
npm run validate-situations        # esegue tutti i check → report HTML + exit code
npm run validate-situations:update-golden   # rigenera la baseline (dopo modifiche volute)
```

- Report HTML: `tests/visual/out/validate/index.html` (apribile in browser).
- Report JSON: `tests/visual/out/validate/report.json`.
- Screenshot per-situation: `tests/visual/out/validate/shots/` (campione + tutte le fallite/warn).
- **Exit code ≠ 0** se anche un solo check *hard* fallisce → adatto a CI/CD (pre-merge gate).

## Hook nel gioco (solo con `?cpmtest=1`, zero impatto in produzione)

| Hook | Scopo |
|------|-------|
| `Math.random` seedato (mulberry32) | rende crowd/roster/RNG riproducibili |
| `__CPM_RESEED(gi)` | reseed per indice → start-position deterministica |
| `__CPM_FROZEN` (`dt=0`) | congela animazioni/lerp → frame statico |
| `__CPM_LOAD_ALL()` / `__CPM_FORCE_SIT(gi)` | carica il DB e forza una Situation al framing interattivo |
| `__CPM_STATE()` | stato completo scena: giocatori, palla, possessore, camera, target logici |
| `__CPM_PROBE()` | regia: camera + proiezione eroe/palla |

## Architettura (modulare, estendibile)

```
lib/harness.mjs     server + browser + flusso→match + force/freeze + firma di stato
lib/situations.mjs  estrae l'array SITUATIONS dal sorgente (S/A reali, no re-impl.)
checks/*.mjs        un modulo per categoria: { id, title, scope, run(ctx)→{pass,issues,warnings} }
                    (determinism, initial-state, orientation, visual, movements, golden,
                     final-state, post-highlight, data-coherence)
report.mjs          HTML + JSON
validate-situations.mjs   orchestratore (un solo browser) → report → exit code
```

**Aggiungere un check**: crea `checks/mio-check.mjs` che esporta `{id,title,scope,run}` e
importalo nell'array dell'orchestratore. `scope:'situation'` riceve `{sit,state,sig,goldenBase}`;
`scope:'global'` viene invocato una volta.

## Copertura delle 10 categorie richieste

| # | Categoria | Dove | Note |
|---|-----------|------|------|
| 1 | **Determinismo** | `checks/determinism.mjs` + firma di stato | 2 run → firma identica; HARD |
| 2 | **Stato iniziale** | `checks/initial-state.mjs` | in-campo, conteggi, possesso (aggancio palla↔eroe), GK; overlap = warning |
| 3 | **Azione (dati)** | `checks/data-coherence.mjs` | riusa la suite analitica (537 combo: tiri→porta, cross/filtranti coerenti, far/near post, esiti) |
| 4 | **Movimenti** | `checks/movements.mjs` | cap movimenti post-highlight coerente con `tactic.pressure`/lock (deterministico) + moveZone valida; cap live = warning |
| 5 | **Orientamento** | `checks/orientation.mjs` | home→gx100, GK coerenti, niente conclusione verso la propria porta, senso tattico azioni-goal |
| 6 | **Stato finale** | `checks/final-state.mjs` | risolve l'azione (`__CPM_RESOLVE`), valida evento conclusivo + coerenza palla↔esito + assenza stati impossibili (campione isolato) |
| 7 | **Visivo** | `checks/visual.mjs` | camera sopra il prato, giocatori renderizzati, palla a quota valida; inquadratura eroe = warning |
| 8 | **Report** | `report.mjs` | id, firma, screenshot, issue/warning per categoria, motivazioni |
| 9 | **Regression test** | `validate-situations.mjs` | comando unico + golden + exit code CI |
| 10| **Qualità codice** | tutta la struttura | modulare, riusa l'infra esistente, deterministico, CI-ready |

### Note oneste di scope (engine a highlight scriptati)
Le Situations CPM sono **highlight interattivi scriptati**, non una simulazione fisica
continua. Perciò:
- la correttezza di *passaggi/cross/tiri* è validata sui **dati** (categoria 3, suite analitica)
  e sul **setup tattico iniziale**, non frame-by-frame;
- la **validazione movimenti continui** (cat. 4) e lo **stato finale post-risoluzione**
  (cat. 6) sono **estensioni**: richiedono un hook che risolva l'azione e registri una
  timeline. Punti d'aggancio già predisposti (`__CPM_FORCE_SIT` + risoluzione azione).

### Qualità del post-highlight (gameplay) — 4.85→4.87
Refactor del ciclo highlight→post-highlight→Situation successiva, validato dal check `post-highlight`:
- **Durata dinamica** (`postHighlightDuration`): 2000–3000ms per azione/esito, sempre ≥ arco+slow-mo
  (sostituisce il fisso 1s che tagliava la palla). Test: dinamica + entro [1800,4000]ms.
- **Camera morbida**: zoom-out asimmetrico, nessun cambio brusco. Test: salto camera frame-to-frame ≤30.
- **Coerenza animazioni**: la palla non "teletrasporta". Test: salto palla frame-to-frame ≤42.
- **Continuità**: la nuova Situation nasce dalla posizione finale (clamp in startZone), niente teletrasporto.
- **Movimento**: rimosso il twitch casuale; difensori tengono la linea (FORMATION_AWAY). Movers = warning informativo
  (le esultanze gol muovono legittimamente molti giocatori).

### CI/CD (GitHub Actions)
Il workflow `.github/workflows/validate-situations.yml` esegue il gate ad ogni push
(`main`/`staging`/`claude/**`) e PR che toccano il gioco o `tests/`: installa Playwright+Chromium,
lancia `npm run validate-situations`, fallisce la build su qualunque issue hard e carica il report
HTML come artifact (anche in caso di fallimento). `workflow_dispatch` per esecuzione manuale.

### Note su cat. 4 e 6 (engine a highlight scriptati)
- **Cat. 4**: il segnale deterministico è il **cap movimenti** (`cappedMM` ↔ `tactic.pressure`). La
  validazione AI continua del movimento (compagni che supportano, linea difensiva frame-by-frame) non
  è applicabile a un motore a highlight; il cap-live è un warning informativo.
- **Cat. 6**: gira su un **campione** (~23 Situations, una ogni 8) e isolata dalla passata principale,
  perché la risoluzione genera timer asincroni (auto-advance/chaining) che altrimenti inquinerebbero
  il setup deterministico delle altre Situations.

### Hard vs Warning
- **HARD** (fanno fallire il gate): determinismo, conteggi, in-campo, possesso, orientamento,
  camera sotto il prato, glitch di rendering, regressione golden, errori console runtime.
- **WARNING** (informativi, non bloccanti): sovrapposizioni transitorie in azione viva,
  eroe non perfettamente centrato (camera broadcast con look-target stateful sulle fasce).
