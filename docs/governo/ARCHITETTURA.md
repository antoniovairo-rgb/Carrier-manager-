# Architettura in una pagina (stato al 30/09/2026, CPM 7.999.83)

## Cosa gira
Un solo file, `CARRIER-MANAGER-AV.html` (**6,5 MB, ~55.500 righe**), con un unico blocco
`<script type="text/babel">` in scope globale: React 18.2 (UMD), Three.js r128, Babel standalone che
compila il JSX nel browser all'avvio. GitHub Pages serve `main`.

## Da dove nasce
Dal 09/2026 si lavora sui **19 frammenti di `src/`**. Sono tagli dello stesso script, non moduli:
`tools/build-src.mjs` li concatena nell'ordine e toglie le intestazioni; `tools/check-src.mjs` prova che il
ricomposto sia **identico byte per byte** al file versionato (passo della CI).

| Frammento | Righe | Peso | Contenuto |
|---|---:|---:|---|
| 01 bootstrap-tema-avatar | 876 | 68 KB | avvio, token grafici (TH/FS/RAD), `_CPM_TEST`, avatar |
| 02 club-leghe-albo | 609 | 46 KB | club, leghe, record |
| 03 eventi-narrativi | 1.452 | 140 KB | eventi settimanali, impulsi, VITA, momenti di carriera |
| 04 situazioni-zone-piazzati | 818 | 117 KB | SITUATIONS (highlight), zone |
| 05 cronaca-stadi-formazioni | 552 | 60 KB | cronaca BG_MATCH |
| 06 archetipi-agenti-sponsor | 858 | 59 KB | archetipi, `succRate` storico, `adaptiveDifficulty`, obiettivi |
| **07 versione-save-interviste** | 1.681 | **867 KB** | `GAME_VERSION`, `SAVE_VERSION`, interviste — **il peso è quasi tutto commento-changelog** |
| 08 panchina-derby-meteo-cori | 689 | 60 KB | `storage` (salvataggi), staff privato |
| 09 audio-scout-anagrafiche | 1.499 | 132 KB | audio, scout, nomi |
| 10 folla-stadi-ritiro | 920 | 83 KB | pubblico, stadi |
| 11 ui-kit-highlight | 2.399 | 208 KB | componenti UI, timeline highlight |
| **12 three-match-view** | 10.701 | **1.288 KB** | tutto il 3D: campo, corpi GLB, camera, gesti, cerimonie in campo |
| 13 prepartita-formazioni | 1.531 | 126 KB | D-pad, prepartita, `MatchErrorBoundary` |
| 14 motore-possesso | 1.341 | 143 KB | motore di partita v2 («brain»), `probEroe` |
| **15 live-match** | 11.343 | **1.291 KB** | partita: stati, highlight, HUD, esiti |
| 16 scene-3d-cerimonie | 3.152 | 304 KB | scene 3D fuori dal campo |
| 17 menu-creazione-pannelli | 2.618 | 220 KB | menu, creazione, pannelli |
| **18 career-app** | 11.466 | **1.136 KB** | carriera: settimana, nazionale, mercato, economia |
| 19 app-root | 1.023 | 99 KB | router, import/export, `RootErrorBoundary` |

Build per lo store: `tools/build-dist.mjs` → `dist/index.html` precompilato e senza CDN (Capacitor → AAB,
salvataggi su `@capacitor/preferences`). `tools/validate-dist.mjs` lo avvia bloccando la rete.

## Test
399 script in `tests/visual/` (sonde e guardiani Playwright). Rete di sicurezza:
- **CI** (`validate-situations.yml`): check-src · test:logic · typing-shortcuts · validate-situations (gate 14 categorie) · save-compat · replay · career-critical (11 guardiani carriera).
- **`npm run ci`** locale: design-system · impulsi-contesto · test:logic · typing-shortcuts · validate-situations · save-compat · replay · partita-vera · jumbotron-anchor.
- **Scoperti oggi**: nuova carriera dall'inizio fino alla prima partita (parziale: `career-sim` fa 2 stagioni), import di un salvataggio da file, navigazione completa dei tab, layout sulle 5 larghezze (griglia-mobile c'è ma non è in CI e non misura il prepartita), build store avviata (`validate-dist` non è in CI).

## Punti fragili
1. **Scope globale unico**: ogni nome è visibile ovunque; un refuso in un frammento rompe tutto l'avvio (Babel).
2. **Tre file giganti** (12, 15, 18: 3,7 MB su 6,5) dove convivono logica, render e strumentazione di test.
3. **Babel nel browser** in dev/Pages: 1–2 s di avvio in più; solo la build store è precompilata.
4. **Commenti-changelog**: la storia di ogni release vive nel codice (07 pesa 867 KB per 1.681 righe).
5. **616 interruttori rossi `__CPM_NO_*`** mai rimossi: ogni ramo vecchio resta nel codice.
6. **167 `Math.random()`** non seedati: vincolo permanente per determinismo e replay.
7. **Strumentazione di test nel codice di produzione** (`window.__CPM_*` sotto `?cpmtest=1`).

## Debito tecnico (primo registro — tipo «debito tecnico» nel backlog)
| ID | Debito | Misura | Proposta |
|---|---|---|---|
| DT-01 | Commenti-changelog nel codice | 07 = 867 KB; commenti lunghi ovunque | spostarli in `docs/RELEASE_HISTORY.md`, lasciare 1 riga |
| DT-02 | Interruttori rossi mai ritirati | 616 | ritirare quelli dei lotti chiusi da > 2 settimane con guardiano stabile |
| DT-03 | Rotazioni delle ossa scritte a numero | 203 assegnazioni `rotation.x/y/z=<numero>` in 12 | tabella di pose unica (come `_POSE77` in coordinate mondo) |
| DT-04 | Due modi di muovere le braccia (clip GLB e rotazioni procedurali) | — | un solo canale: clip + correzione in coordinate mondo |
| DT-05 | Gesti riconosciuti da regex sui testi | `deriveIntent` legge `sit.text`; 4 test regex su label | campo strutturato `intent` sulle situazioni |
| DT-06 | File giganti 12/15/18 | 10–11 mila righe ciascuno | tagli ulteriori di `src/` (nessun cambio di comportamento, prova byte per byte) |
| DT-07 | Random non seedato | 167 | seedare dove tocca stato o replay |
| DT-08 | Strumentazione di test in produzione | centinaia di `window.__CPM_*` | raccoglierla dietro un unico oggetto test, esclusa dalla build store |
| DT-09 | Sonde usa-e-getta nel repo | 399 script in tests/visual | archiviare quelle non collegate a un npm script |

**Quota proposta: 20% di ogni lotto** dedicata al debito (una voce DT per lotto).
