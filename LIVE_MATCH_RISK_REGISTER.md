# LIVE MATCH — RISK REGISTER

> **Documento di analisi rischi. Nessun codice scritto: attende approvazione.**
> Rischi della revisione/evoluzione del Live Match (v5.51.0). Per ciascuno: **probabilità**,
> **impatto**, **mitigazione**, **priorità**. Scala P/I: Bassa · Media · Alta.
> Priorità = funzione(Probabilità × Impatto), con override quando l'impatto tocca l'identità o
> il save.

Legenda priorità: 🔴 Critica · 🟠 Alta · 🟡 Media · 🟢 Bassa.

---

## R-01 · Render-loop gate-cieco (rischio trasversale)
- **Descrizione:** movimento off-ball, camera, chaining, kickoff, cerimonia, Freeze e traiettorie
  **non** sono coperti dal quality gate (cattura frame congelati, GLB-OFF). Qualunque modifica lì
  può introdurre regressioni **invisibili** fino al collaudo dal vivo.
- **Probabilità:** Alta · **Impatto:** Alto (qualità percepita, il cuore dell'esperienza Eroe).
- **Mitigazione:** (1) preferire milestone su **funzioni pure** (M1); (2) M3 porta Freeze e
  coerenza overlay↔3D **dentro** il gate (riduce l'area cieca); (3) per M2-adapt/P2 usare flag
  default-OFF + collaudo dal vivo obbligatorio con screenshot before/after; (4) le posizioni
  off-ball restano fuori dalla firma golden → cambiarle richiede firma umana su L4.
- **Priorità:** 🟠 Alta.

## R-02 · Divergenza overlay↔3D persistente (se M1 non fatto)
- **Descrizione:** finché le due tassonomie di esito restano separate, l'overlay può contraddire
  il 3D (es. «PALO!» su una parata) → viola GR-048/065, rompe l'immersione.
- **Probabilità:** Alta (è già presente) · **Impatto:** Alto (coerenza = indicatore #1 di qualità).
- **Mitigazione:** M1 (unico Outcome Model) + M3 (asserzione bloccante). Coerenza **a monte**, non
  fallback runtime.
- **Priorità:** 🔴 Critica (è la violazione già in produzione).

## R-03 · Rigenerazione/fallback runtime (se si implementasse Cap. 11 alla lettera)
- **Descrizione:** un validatore runtime che blocca/rigenera l'highlight introdurrebbe stutter,
  complessità enorme e nuovi bug; potrebbe **mascherare** difetti.
- **Probabilità:** Media (se accettato il manifesto senza critica) · **Impatto:** Alto.
- **Mitigazione:** **REJECT** esplicito (DECISION_LOG DL-004). Sostituito da M1+M3.
- **Priorità:** 🟠 Alta (rischio di scope/architettura da evitare a priori).

## R-04 · Regressione della firma golden
- **Descrizione:** una modifica cambia inavvertitamente `{htx,hty,cam,ch,ca}` → gate rosso o,
  peggio, golden rigenerato «per far passare» mascherando un bug.
- **Probabilità:** Media · **Impatto:** Alto (perdita del baseline di non-regressione).
- **Mitigazione:** M1 è progettato per **non** cambiare la firma (esiti/conteggi invariati); se
  la firma cambia, rigenerare **solo** con motivazione esplicita e review, mai «per far passare».
- **Priorità:** 🟡 Media.

## R-05 · Rottura save-compat
- **Descrizione:** aggiungere stato salvato senza migration → crash al load di save v7.
- **Probabilità:** Bassa (M1/M2/M3 sono **effimeri**, nessun campo salvato) · **Impatto:** Alto.
- **Mitigazione:** vincolo di design «stato effimero, no `SAVE_VERSION` bump»; test SV-01/02/03.
  Se un polish futuro richiede stato salvato → migration nel `useEffect` di `CareerApp` + bump.
- **Priorità:** 🟢 Bassa (con il vincolo rispettato).

## R-06 · Determinismo rotto
- **Descrizione:** introdurre `Math.random()` non seedato in setup/render/memoria → rompe
  `determinism`/`golden`.
- **Probabilità:** Media · **Impatto:** Alto.
- **Mitigazione:** memoria M2 derivata da esiti già deterministici; selezione frasi seedata
  (`hashStr`/seed HL). Test `determinism` a ogni milestone.
- **Priorità:** 🟡 Media.

## R-07 · IA adattiva che degrada la leggibilità (M2-adapt / Cap. 4.12)
- **Descrizione:** un bias di marcatura mal calibrato rende l'azione caotica → l'IA «ruba la
  scena» (viola Cap. 1.8/4.1) e la lettura calcistica peggiora.
- **Probabilità:** Media · **Impatto:** Medio-Alto.
- **Mitigazione:** forma **leggera**, dietro flag `cpmadapt` default-OFF, bounded, collaudo dal
  vivo prima di qualunque default-ON. Se non convince → resta OFF.
- **Priorità:** 🟡 Media.

## R-08 · Freeze irrigidito alla cieca (Cap. 2.3 letterale)
- **Descrizione:** estendere il Freeze «totale» toccando il render-loop **prima** di poterlo
  validare → regressioni invisibili sul pilastro identitario.
- **Probabilità:** Media · **Impatto:** Alto (tocca l'identità).
- **Mitigazione:** **M3 prima**: portare il Freeze nel gate (asserzione), poi eventuali estensioni
  con rete di sicurezza. Non estendere prima di validare.
- **Priorità:** 🟠 Alta.

## R-09 · Scope creep verso il simulatore
- **Descrizione:** accettare fisica reale / modulo dinamico / GK giocabile / fuorigioco →
  esplosione di complessità, perf mobile, e violazione dell'identità («non un simulatore»).
- **Probabilità:** Media (il manifesto lo suggerisce) · **Impatto:** Alto.
- **Mitigazione:** **REJECT** documentati (DECISION_LOG DL-002/003/004). Regola Zero come filtro.
- **Priorità:** 🟠 Alta.

## R-10 · Perf mobile / peso build (Play Store)
- **Descrizione:** nuovi sistemi o asset aumentano load-time/heap → degrado su mobile e sul peso
  dell'AAB.
- **Probabilità:** Bassa (M1/M2/M3 sono logica leggera, zero asset) · **Impatto:** Medio.
- **Mitigazione:** nessun asset nuovo; `cpmAssert` no-op in produzione; perf-monitor del gate
  (warn) + collaudo. Coerente con la scelta «stadio/atmosfera procedurali, niente asset pesanti».
- **Priorità:** 🟢 Bassa.

## R-11 · Container revert (rischio operativo ricorrente)
- **Descrizione:** il working tree può tornare a una versione vecchia → si edita la base sbagliata.
- **Probabilità:** Media · **Impatto:** Medio.
- **Mitigazione:** prima di ogni sessione `grep GAME_VERSION`; se non atteso, ri-sync da origin.
  Il lavoro è salvo su remoto (commit incrementali).
- **Priorità:** 🟡 Media.

## R-12 · Deriva del manifesto vs codice
- **Descrizione:** il manifesto (documento di visione) viene letto come spec rigida →
  implementazioni non allineate all'idioma reale del motore (es. le 11 fasi di Cap. 2.2 come stati).
- **Probabilità:** Media · **Impatto:** Medio.
- **Mitigazione:** ARCHITECTURE_REVIEW §1 traduce ogni capitolo nell'idioma reale; le deroghe
  consapevoli sono nel DECISION_LOG. Il manifesto resta **visione**, non checklist.
- **Priorità:** 🟢 Bassa.

---

## Matrice sintetica

| ID | Rischio | Prob | Impatto | Priorità |
|----|---------|------|---------|----------|
| R-01 | Render-loop gate-cieco | Alta | Alto | 🟠 Alta |
| R-02 | Divergenza overlay↔3D (no M1) | Alta | Alto | 🔴 Critica |
| R-03 | Fallback runtime Cap.11 | Media | Alto | 🟠 Alta |
| R-04 | Regressione firma golden | Media | Alto | 🟡 Media |
| R-05 | Save-compat | Bassa | Alto | 🟢 Bassa |
| R-06 | Determinismo rotto | Media | Alto | 🟡 Media |
| R-07 | IA adattiva degrada leggibilità | Media | Medio-Alto | 🟡 Media |
| R-08 | Freeze irrigidito alla cieca | Media | Alto | 🟠 Alta |
| R-09 | Scope creep simulatore | Media | Alto | 🟠 Alta |
| R-10 | Perf mobile / peso build | Bassa | Medio | 🟢 Bassa |
| R-11 | Container revert | Media | Medio | 🟡 Media |
| R-12 | Deriva manifesto vs codice | Media | Medio | 🟢 Bassa |

**Rischi da abbattere per primi:** R-02 (M1+M3), R-08 (M3 prima), R-01/R-09 (disciplina di scope
+ flag + collaudo dal vivo).
