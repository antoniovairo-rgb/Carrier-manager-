# HOOKS_API.md — Contratto di osservabilità `window.__CPM_*` (Fase 3)

> Documenta il **contratto implicito** tra il gioco (`CARRIER-MANAGER-AV.html`) e la LMQP (`tests/visual/`).
> È il punto di accoppiamento principale (vedi `DEPENDENCY_MAP.md` §7): renderlo esplicito riduce il debito
> A4 senza modificare il comportamento. **Principio LMQP "Observable System"**: il motore non è una black-box.
> Stato 5.39.0. NB: cambiare una firma qui = breaking change per il gate → trattare come API pubblica.

## Quando sono attivi
La maggior parte dei probe è esposta solo con **`?cpmtest=1`** (test mode) o nel flusso match; i motori puri
sono esposti sempre. Il gate apre il gioco con `?cpmtest=1` (vedi `lib/harness.mjs#openMatch`).

## Probe di stato (sola lettura)
| Hook | Firma → ritorno | Scopo | Consumatori LMQP |
|---|---|---|---|
| `__CPM_STATE()` | → `{ok,phase,clock,camera,heroTarget,ballTarget,players[],hero,ball,counts}` | stato completo scena; `players[].x/y` derivati da **mesh.position** (visivi) in coord di gioco | initial-state, final-state, determinism, post-highlight, motion, sampleMotion/BallPath/Replay |
| `__CPM_PROBE()` | → `{ok,camera,hero,ball,phase,clock}` con `onScreen`/`ndc`/`world` | proiezione camera + visibilità on-screen | post-highlight, replay (ballOn/heroOn) |
| `__CPM_FOOTBALL_STATE()` | → stato football (possesso/forma/superiorità) | osservatore Football State | metriche F0 (cpmtest) |
| `__CPM_TIMELINE()` | → `MATCH_TL.slice()` (ring buffer eventi) | sequenza eventi (MatchStart/HighlightForced/ActionResolved/HighlightTimeline/HighlightAdvance) | check `timeline` (backbone narrativo) |
| `__CPM_SITS` | array SITUATIONS | catalogo situazioni | — |
| `__CPM_MOVES` / `__CPM_OUTCOME` / `__CPM_RESULT_DUR` / `__CPM_SIT_COUNT` | valori correnti | mosse residue / esito / durata risultato / n. situations | final-state, post-highlight |

## Controllo (azioni di test — mutano stato)
| Hook | Firma | Scopo | Note |
|---|---|---|---|
| `__CPM_LOAD_ALL()` | → total | carica tutte le SITUATIONS + reset timeline | apertura gate |
| `__CPM_FORCE_SIT(gi, choose)` | → bool | forza la situation `gi` (choose=true → framing interattivo) | base di ogni sampler |
| `__CPM_RESOLVE(k)` | → bool | risolve l'azione `k` (instrada in `handleAction`) | reseed + ActionResolved + HighlightTimeline |
| `__CPM_RESEED(seed)` | — | reseed del PRNG deterministico | determinismo/golden |
| `__CPM_FROZEN` (flag) | bool | congela il render-loop (dt=0) per screenshot deterministici | freeze/unfreeze |
| `__CPM_TIMELINE_RESET()` | — | svuota il ring buffer eventi | passate isolate |
| `__CPM_MIGRATE(player)` | → `{player, changed}` | **migration save pura** (`migratePlayer`) | save-compat |

## Motori puri esposti su `window` (per i test browser)
`deriveIntent` · `buildHLTimeline` · `validateHLTimeline` · `resolveTimeline` · `decideExecution` · `intentLabel`.
> NB: i test **node** non usano `window` — caricano gli stessi motori dal sorgente via `lib/{situations,decision,cine,bgmatch}.mjs` (estrazione, zero duplicazione). Le due strade restano coerenti perché entrambe partono dal sorgente.

## Invarianti del contratto (da non rompere)
1. `__CPM_STATE().players[].x/y` = posizioni **mesh** in coord di gioco (0–100) — i check di movimento (motion) dipendono da questo.
2. `__CPM_RESOLVE(0)` deve passare per `handleAction` (emette `ActionResolved` + `HighlightTimeline`) — il check `timeline` lo assume.
3. `__CPM_FORCE_SIT` + `__CPM_FROZEN` devono produrre uno stato **deterministico** (reseed) — i check `determinism`/`golden` lo assumono.
4. I payload di `cpmEmit` NON devono contenere una chiave `type` (sovrascriverebbe il tipo evento — bug già corretto in B1: usare `htType` ecc.).

## Perché questo doc (Fase 3)
Formalizza l'unico accoppiamento gioco↔QA che era **implicito**, trasformandolo in **API pubblica documentata**. Riduce il rischio che un refactor del gioco rompa il gate silenziosamente (chi tocca questi punti ora sa che è un contratto). Zero modifiche al comportamento.
