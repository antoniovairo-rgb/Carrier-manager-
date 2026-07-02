# STADI DINAMICI E UNICI — Design proposto (v1.0, pre-implementazione)
**CPM 5.86.0 · 2026-07-02 · stato: PROPOSTA in attesa di approvazione PO**

---

## 1. AUDIT DELL'ARCHITETTURA ATTUALE

La direttiva chiede un sistema modulare/parametrico senza centinaia di modelli. L'audit rivela che **il ~40% del sistema esiste già**, costruito negli sprint CROWD 2.0 e 3D:

| Già esistente | Dove | Stato |
|---|---|---|
| `buildStadium(scene,home,away,stadCfg)` parametrico | r.5618, ~211 righe | 4 taglie da prestigio (XL>88/LG>72/MD>55/SM), 4 `style` (standard/moderno scuro/bowl compatto/tradizionale), colore fari, 2 anelli inclinati, tetto, torri |
| Nome stadio **stabile per club** | `getStadiumName` r.2634 | hash del club su pool per prestigio + mappa override `CLUB_STADIUMS` |
| Stile per club | `getStadiumStyle` + `CLUB_STADIUM_STYLE` r.2630 | mappa override già pronta (oggi quasi vuota) |
| Palette ambientale per lega+club | `getStadiumPalette` r.5500 | cielo/nebbia/fari per lega, variazione hash per club |
| Pubblico parametrico | `CROWD_CFG` r.5183 + `computeCrowdContext` (puro/seedato) | fill per contesto, capienze, cadenze — **unica fonte** card+3D |
| Distribuzione settori charter §5 | dentro `buildStadium` | Curva Sud solo casa · Nord ospiti · Est spicchio · Ovest VIP — **già le regole richieste** |
| Identità club negli spalti | 3DV-TIFO | bandiere/striscioni/sciarpe tinti coi colori sociali, gated dal contesto |
| Perf budget | CROWD 2.0 §10 | redraw adattivo, instanced front-rows ≤8 draw call, LOD in-texture, dispose a fine match (5.75.0) |

**Cosa NON esiste** (il restante 60%): un oggetto di configurazione completo per stadio; i template architettonici nazionali; capienza esplicita e realistica (oggi implicita nel prestigio); anelli variabili (fissi a 2); curve distinte dalle tribune; pista d'atletica; tunnel/panchine/area tecnica; maxischermi multipli; LED bordocampo parametrici; insegna col nome; evoluzione nella carriera; seggiolini colorati per club (oggi grigio unico nei posti vuoti… in realtà CROWD 2.0 già tinge i sedili vuoti col colore club — parziale ✓).

**Vincoli confermati dagli sprint passati:** niente asset 3D pesanti (decisione PO 5.47.8: procedurale per il peso mobile/Play Store); il gate è cieco sul rendering dello stadio (golden esclude tutto tranne target eroe/camera/conteggi) → ogni slice va collaudata dal vivo con screenshot-test dedicati; niente audio nel gioco → «eco/volume del tifo» si traducono in proxy visivi (densità burst, ola, coreografie) finché non nasce un sistema audio.

---

## 2. ARCHITETTURA PROPOSTA — 3 strati, tutto data-driven

```
CLUBS[id] (+override opzionale club.stadium{...})
        │
        ▼
STADIUM_TEMPLATES ──► stadiumConfigFor(club, evo) ──► buildStadium(scene, cfg)
   (10 preset dati)      (resolver PURO e SEEDATO)        (ASSEMBLATORE modulare)
                                   │
                                   ├──► computeCrowdContext (capienza/fill — già esistente)
                                   └──► MatchdayCard / cronaca / UI (nome, capienza, "sold out")
```

### 2a. `STADIUM_TEMPLATES` — la libreria (puro dato, ~10 entry)
Ogni template è un oggetto di default architettonici. Proposta iniziale:

| id | Ispirazione | Tratti distintivi |
|----|------------|-------------------|
| `provincia` | piccolo stadio di provincia | 1 anello basso, curve scoperte, recinzione a vista, torri a traliccio |
| `comunale` | stadio comunale | 1-2 anelli, **pista d'atletica**, copertura solo tribuna Ovest |
| `storico_it` | storico italiano | 2 anelli, pista, torri iconiche angolari alte, cemento a vista |
| `moderno_it` | moderno italiano | 2 anelli vicini al campo, copertura totale, LED continui |
| `inglese` | english box | 4 tribune SEPARATE rettangolari, verticali, vicinissime al campo, niente curve angolari |
| `tedesco` | arena tedesca | bowl continuo, curva casa ripidissima e a UN anello gigante (muro giallo-style) |
| `spagnolo` | liga | 3 anelli molto alti, poca copertura, cemento chiaro |
| `francese` | arena polivalente | 2 anelli, copertura totale bianca a membrana, angoli aperti |
| `olandese` | compatto NL | 2 anelli compatti, tetto piatto scuro, angoli chiusi vetrati |
| `sudamericano` | bombonera-style | asimmetrico: 3 tribune alte + 1 bassa, fossato, recinzioni alte |

Il template fissa: `rings, standH, standDist, cornerType (aperto/chiuso/curva), roof (full/partial/west/none), track (bool), towerStyle (angolari/perimetrali/su tetto), fenceType, benchStyle, tunnelPos`.

### 2b. `stadiumConfigFor(club, evo)` — il resolver (puro, seedato, node-testabile)
Deriva la configurazione COMPLETA senza toccare i save:

- **Template**: dalla lega del club (`lg` → mappa lega→template: Lega A/B→storico/moderno_it, Premier→inglese, …) con variazione hash per club (es. in Lega A il 30% dei club "moderno_it").
- **Capienza** (richiesta PO, bande realistiche): dal prestigio — `p<50`: 3-8k · `50-62`: 5-15k · `62-72`: 10-30k · `72-82`: 20-45k · `>82`: 40-80k+, con jitter hash per club (mai due capienze uguali). La capienza alimenta `computeCrowdContext` (che oggi usa capienze implicite) → **affluenza automaticamente coerente**.
- **Identità**: colori seggiolini/tribune/recinzioni dai colori sociali (`c`/`c2` + neutro), nome da `getStadiumName` (già stabile), insegna-wordmark sul tetto (canvas, riuso `_cvWordmark`), mosaico di seggiolini con l'abbreviazione del club nella Curva Sud (trucco texture: costo zero).
- **Dettagli**: n° maxischermi (1 SM → 2 XL), posizione torri dal template, LED bordocampo (moderni sì, provincia no), tunnel/panchine/area tecnica per tutti (dettaglio scala col prestigio).
- **Override data-driven** (scalabilità richiesta): campo opzionale `stadium:{...}` sull'entry CLUBS — chi vuole personalizzare un club scrive SOLO dati, zero codice. È il «file di configurazione» chiesto dalla direttiva, nell'idioma single-file del progetto.
- **Evoluzione** (`evo`): input `{seasonsAtClub, prestigeShift, trophiesRecent, promoted, relegated}` già disponibili nello stato → il resolver applica upgrade deterministici: prestigio +8 → +1 anello o copertura estesa; promozione → +20% capienza e seggiolini nuovi; trofeo → maxischermo XL; retrocessione → niente downgrade strutturale ma fill più basso (realismo). **Zero SAVE bump in v1**: tutto derivato. (Se in futuro vorrai upgrade *scelti* dal club/giocatore, servirà `SAVE_VERSION 9` — fuori scope ora.)

### 2c. `buildStadium(cfg)` — l'assemblatore modulare
Refactor della funzione attuale da "monolite parametrico" a catalogo di **builder componibili** (stessa filosofia dei gesti/kit GLB):

`buildRing(side,tier,cfg)` · `buildCorner(type)` · `buildRoof(type)` · `buildTower(style,pos)` · `buildScreen(size,pos)` · `buildTrack()` · `buildTunnel(pos)` · `buildBenches()` · `buildFence(type)` · `buildSignage(name,colors)`

**Riuso spinto (ottimizzazione richiesta):** geometrie condivise in un cache-modulo (un solo `BoxGeometry` per gradinata riusato con scale diverse; `InstancedMesh` per seggiolini-file frontali già esistente; materiali per-colore in cache con dispose a fine match già a posto). Le texture folla restano il sistema CROWD 2.0 invariato. **Budget**: nessun nuovo asset scaricato, +0 richieste rete, target ≤+15 draw call vs oggi anche su template XL, mobile con cap (anelli ≤2, screens ≤1, niente track-detail).

---

## 3. MAPPATURA PARAMETRI RICHIESTI → CAMPI

Tutti i 21 parametri della direttiva trovano posto: nome✓ capienza✓ categoria (=tier da lega+prestigio)✓ modernità (0-1, guida materiali/LED/schermi)✓ anelli (1-3)✓ altezza✓ distanza dal campo✓ tipologia curve (cornerType)✓ copertura (roof)✓ colore seggiolini✓ tribune✓ recinzioni✓ posizione tabellone (⚠️ VINCOLO: il tabellone DEFINISCE la Curva Sud nel charter pubblico — resta sul lato Sud, configurabile in altezza/dimensione, non di lato)✓ n° maxischermi✓ torri faro✓ LED bordocampo✓ tunnel✓ panchine✓ area tecnica✓ reti (fenceType+tipologia reti porta)✓ pista d'atletica (solo template comunale/storico)✓.

## 4. ATMOSFERA (senza audio)
`atmosphere:{tifoIntensity, flags, banners, dominantColor, chantFreq}` per club (hash+prestigio+template): guida densità bandiere/striscioni (sistema 3DV-TIFO esistente), frequenza cori testuali (`chantFor`), cadenze burst della folla, ola threshold. **Trasferta**: in trasferta i settori casa/ospiti si INVERTONO logicamente (tu sei l'ospite: Curva Nord tua, stadio dominato dai colori avversari) — oggi il gioco renderizza sempre "casa"; questa è la singola modifica a più alto impatto percepito dell'intero progetto.

## 5. PIANO DI ROLLOUT (3 slice gate-ate, ~1 sprint l'una)
- **S1 — Fondamenta (zero cambi visivi):** `STADIUM_TEMPLATES` + `stadiumConfigFor` (puro, esposto per i test) + refactor assemblatore con output IDENTICO all'attuale (template "legacy") + test node su determinismo/bande capienza + capienza vera in `computeCrowdContext` e MatchdayCard. Gate 14/14 invariato per costruzione.
- **S2 — Identità e template:** i 10 template attivi, mappa lega→template, seggiolini/insegna/mosaico coi colori club, maxischermi/torri/pista/tunnel. Test screenshot per template (`stadium-visual-test.mjs`, non-gate) + collaudo dal vivo PO.
- **S3 — Trasferta ed evoluzione:** inversione casa/trasferta, atmosfera per club, upgrade evolutivi deterministici + notizie diario («il club amplia lo stadio: +8.000 posti»).

## 6. RISCHI
| Rischio | Mitigazione |
|---|---|
| Regressione visiva silenziosa (gate cieco sul rendering) | S1 a output identico; screenshot-test per template; collaudo PO per slice |
| Perf mobile su template XL/3 anelli | cap mobile, riuso geometrie, budget draw-call misurato con perf-monitor |
| Trasferta invertita rompe assunzioni "home attacca +x" | l'inversione è SOLO estetica (settori/colori), l'orientamento di gioco resta |
| Tabellone spostabile romperebbe il charter Curva Sud | vincolo: resta lato Sud (configurabile in tutto il resto) |

## 7. DECISIONI CHIESTE AL PO
1. **Approvazione impianto** a 3 slice (S1 può partire subito).
2. **Pista d'atletica**: solo template `comunale`/`storico_it` (proposta) o anche altrove?
3. **Trasferta invertita** (S3): confermi che è l'effetto che vuoi per «capire subito dove stai giocando»?
4. Upgrade stadio **automatici** (derivati, zero save) bastano per ora, o vuoi in futuro upgrade *scelti* (richiederà SAVE v9)?
