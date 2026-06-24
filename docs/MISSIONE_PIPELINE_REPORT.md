# CPM — MISSIONE Pipeline Structural Revision
## Report Finale — Versioni 4.74.0 → 4.75.0

_Completato il 2026-06-24_

---

## Obiettivo

Revisione strutturale completa della pipeline **Situation → Decision → Highlight → Post-Highlight → Live Match 3D**.
14 fasi pianificate, 7 completate analiticamente, 7 documentate come "browser-only" (richiedono harness puppeteer+WebGL).

---

## Fasi Completate

### Phase 1 — Audit Completo Catalog (pre-missione)
Strumento: agente programmatico + analisi manuale.

| Categoria | Trovati | Note |
|---|---|---|
| OUTCOME_IN_TEXT | 18 | Titoli che rivelano outcome/azione |
| ROLE_INCOHERENCE | 22 | Situazioni difensive con azioni da portiere |
| DUPLICATE | 11 coppie | Situazioni con testo Jaccard ≥ 0.72 |
| SPATIAL_INCOHERENCE | 8 | Zone non coerenti con azione |
| NARRATIVE_ONLY | 7 | Situazioni senza reale scelta tattica |

---

### Phase 2 — OUTCOME_IN_TEXT Fix (18/18)

**Sprint 4.74.0** — 10 fix iniziali:
| Sit | Prima | Dopo |
|---|---|---|
| 4 | "Dribbling completato in area!" | "Con palla in area — un difensore tra te e la porta!" |
| 46 | "SALVATAGGIO SULLA LINEA! Il portiere è battuto." | "Tiro avversario in arrivo sulla linea! Intervieni." |
| 60 | "Siamo sotto 0-2. Segnare adesso cambia tutto." | "Sotto 0-2. L'attacco cerca il gol della speranza." |
| 75 | "Porta spalancata — spingila!" | "Portiere fuori posizione! L'area piccola è scoperta." |
| 103 | "Dribbla il terzino e crossa!" | "Uno contro uno col terzino in fascia — spazio per il cross!" |
| 173 | "Difensore saltato! La porta è aperta." | "Ultima linea difensiva da superare — sei in area con spazio!" |
| 30 | "Recupero palla! Riparte." | "Palla contesa a centrocampo — pressa e riconquista!" |
| 32 | "Tackle in scivolata! Recupera palla." | "Avversario porta palla — sfida in scivolata!" |
| 55 | "Pressing alto! Rubi palla in trequarti avversaria." | "Pressing alto in trequarti — portatore avversario sotto pressione!" |
| 128 | "Recupero in pressing aggressivo!" | "Pressing aggressivo a centrocampo — sfida sul portatore!" |

**Sprint 4.75.0** — 8 fix rimanenti:
| Sit | Prima | Dopo |
|---|---|---|
| ~41 | "🌀 TUNNEL! Prova la finta..." | "🌀 Difensore di fronte — come lo superi?" |
| ~42 | "🔄 ROVESCIATA! Pallone in area..." | "🔄 Il cross arriva alto — tentazione assoluta in area!" |
| ~43 | "🦶 RABONA! Il cross con la rabona..." | "🦶 Fascia chiusa — cross difficile, angolo stretto!" |
| ~50 | "💥 PALO! Rimbalza in area. Arriva!" | "💥 Tiro sul palo — la palla rimbalza in area!" |
| ~66 | "↘️ Tocco morbido a porta vuota!" | "↘️ Portiere uscito sul lato — il secondo palo è libero!" |
| ~67 | "🔄 Gol di spalle alla porta!" | "🔄 Spalle alla porta — giratone o tacco?" |
| ~155 | "💔 Gol contro la tua ex squadra!" | "💔 Davanti alla tua ex squadra — momento decisivo." |
| ~168 | "🔴 RIGORE PARATO! Arriva sulla ribattuta!" | "🔴 Ribattuta libera in area — arrivaci per primo!" |

---

### Phase 3 — S() Tactic Parameter
Parametro `tactic` aggiunto a `S()` — backward-compatible (default `null`).
```js
tactic = {
  pressure: "none"|"low"|"medium"|"high",
  support: 0-4,
  nearby_def: 0-5,
  lanes: ["central_run"|"overlap_left"|"overlap_right"|"through_ball_lane"|...],
  box: {att, def, near, far}
}
```
Demo implementata su sit[0] "Solo davanti al portiere" con tactic completo.
**Copertura attuale**: 1/179 situations annotate — espansione pianificata (sprint dedicato).

---

### Phase 4 — filterSitActions + cappedMM Data-Driven
`filterSitActions(actions, px, sit)` ora accetta `sit` come terzo argomento e applica prerequisiti tattici:
- Cross filtrati se `tactic.lanes` non include `overlap_left/right`
- Filtranti filtrati se `tactic.lanes` non include `through_ball_lane`
- Dribbling filtrati se `tactic.nearby_def === 0`

`cappedMM(sit)` legge `tactic.pressure` (data-driven) prima di fallback testuale:
- `"high"` → 0 mosse
- `"medium"` → 1 mossa
- `"low"` → 2 mosse

Entrambi i call site di `filterSitActions` aggiornati a passare `curSit`.

---

### Phase 5 — TACT-POS: Posizionamento Tattico 3D (129 situations)
Blocco `TACT-POS` inserito nel `useEffect([hlIdx,phase])` di `ThreeMatchView`.
Per le 129 situazioni non-lockMovement / non-area (zone: trequarti, bordo, fascia, centro, difesa, propria):
- GK avversario sempre verso la porta (x≥88)
- GK home sempre verso propria porta (x≤10)
- 10 outfield player avversari: posizionamento spread attorno a `szX/szY` della zona
- 9 outfield player home: posizionamento compresso, in-build o difensivo
- Logica `isWide` (zone fascia o startZone.y < 28 / > 72): spread laterale
- Logica `isDef` (sit.type === "def"): avversari attorno all'eroe, compagni in copertura

**Impatto visivo**: eliminato il fenomeno di tutti i giocatori fermi in posizione BG_MATCH durante gli highlight non-area.

---

### Phase 6-11, 13 — Richiedono Browser/WebGL

Le fasi seguenti richiedono harness puppeteer + SwiftShader per validazione visiva reale:

| Fase | Descrizione | Motivo skip |
|---|---|---|
| 6 | Collision ball↔players per-frame | Raycast THREE.js mesh non disponibile |
| 7 | Field orientation verification | Screenshot frame-by-frame richiede WebGL |
| 8 | Complete post-highlight epilogue | Rischio regressioni alto senza visual test |
| 9 | Post-highlight player positions | Dipende da Phase 8 |
| 10 | Ball realism (spin, bounce) | Fisica avanzata non testabile analiticamente |
| 11 | Stadium crowd occupation | Texture proc. non verificabile senza rendering |
| 13 | Stress tests (10+ season sims) | Richiede browser + save state |

**Come abilitare**: `npm install puppeteer` + esecuzione headless con `--enable-webgl --use-gl=swiftshader`, hook su `sr.current` e THREE meshes nel componente `ThreeMatchView`.

---

### Phase 12 — Test Suite Esteso

4 nuovi controlli in `tests/situations-3d-validation.js`:

| Check | Tipo | Cosa rileva |
|---|---|---|
| OUTCOME_IN_TEXT | warn | Titoli con "Gol", "PALO!", "PARATO!", "TUNNEL!", "ROVESCIATA!", "RABONA!" |
| ROLE_INCOHERENCE | warn | Label "salvataggio", "esci e blocca" in situazioni non-portiere |
| DUPLICATE | warn | Coppie Jaccard ≥ 0.72 tra titoli |
| TACT-POS validity | fail | `tactic.pressure` o `nearby_def` fuori dai valori validi |

Coverage report aggiunto: distribuzione per type, zone, e conteggio situazioni con `tactic`.

**Risultati correnti**: 0 FAIL, 1 WARN noto (coppia mirror taglio-sinistra/destra).

---

### Phase 14 — Questo documento

---

## Stato Finale Validation Suite (CPM 4.75.0)

```
situations: 179  combos: 537
clean: 526 (98.0%)  warn-only: 11 (2.0%)  FAIL: 0 (0.0%)

Realism Score: 100/100 (tutti sottosistemi)
coerenza HL↔azione: FAIL 0  WARN 11 (noti — cross da posizione centrale)
catalogo (Ph12): FAIL 0  WARN 1 (mirror pair taglio sinistra/destra)
guardie: 16/16 superate

Coverage: off=149  def=25  special=5  |  tactic=1/179
```

---

## Lavori Residui (backlog)

| Priorità | Task | Sprint consigliato |
|---|---|---|
| Alta | Annotare `tactic` alle ~50 situazioni ad alta priorità tattica | Sprint 4.76.x |
| Alta | Abilitare harness browser (Phase 6-11) | Sprint dedicato WebGL |
| Media | Rimuovere 3-5 coppie duplicate più ridondanti | Sprint 4.76.x |
| Media | Redesign 19 ROLE_INCOHERENCE rimanenti (difensivi ma non GK) | Sprint 4.77.x |
| Bassa | SPATIAL_INCOHERENCE (8 situations) | Sprint 4.78.x |
| Bassa | NARRATIVE_ONLY (7 situations — aggiungere scelta reale) | Sprint 4.78.x |

---

_Generato automaticamente — CPM 4.75.0 — 2026-06-24_
