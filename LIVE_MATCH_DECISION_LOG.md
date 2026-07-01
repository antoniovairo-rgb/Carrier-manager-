# LIVE MATCH — DECISION LOG

> **Registro delle decisioni architetturali. Nessun codice scritto: attende approvazione.**
> Ogni decisione: **problema · alternative considerate · soluzione scelta · motivazione ·
> impatto.** Il log è la memoria del «perché»: qualunque futura evoluzione deve rileggerlo prima
> di riaprire una decisione.
>
> Filtro applicato a ogni voce: **Regola Zero** («migliora realmente l'esperienza dell'Eroe?») +
> **identità non negoziabile** + **«non un motore più grande/più complicato»**.

---

## DL-001 · Evolvere, non riscrivere il motore
- **Problema:** il manifesto chiede «la versione definitiva del motore». Tentazione di riscrivere.
- **Alternative:** (A) riscrittura da zero con architettura a moduli; (B) refactor pesante del
  render-loop; (C) evoluzione additiva su un impianto sano.
- **Scelta:** **C**.
- **Motivazione:** la pipeline `Intent→Decision→Simulation→Animation` è già corretta e
  disaccoppiata; il determinismo seedato e il gate sono asset preziosi. Riscrivere violerebbe
  «non voglio un motore più grande» e introdurrebbe regressioni su codice validato. Il gap reale
  è **coerenza + continuità**, non funzionalità.
- **Impatto:** tutte le milestone sono additive; nessuna rimozione di sistemi.

## DL-002 · REJECT — Fisica reale e collisioni (Cap. 6.5 / 7.11)
- **Problema:** il manifesto chiede «coerenza fisica» e «collisioni credibili» (peso, urto,
  inerzia, contatto).
- **Alternative:** (A) sistema di collisione capsule/raycast + risposta d'urto + Magnus per gli
  archi; (B) migliorie cosmetiche localizzate mantenendo i «contatti scriptati».
- **Scelta:** **B** (REJECT della fisica reale).
- **Motivazione:** un motore fisico reale su file HTML singolo (React+Three r128, Babel-in-browser,
  target mobile) ha costo/rischio/perf altissimi e trascina il gioco verso il **simulatore
  tradizionale** (esplicitamente vietato). Regola Zero: non migliora l'esperienza dell'Eroe, che
  è **decisionale** (lettura), non di controllo fisico. La repulsione anti-ammucchiate attuale è
  sufficiente per la leggibilità.
- **Impatto:** si affrontano solo incoerenze **localizzate** (P1 chip/GK, P2 ball-carry, C-04
  curva) senza motore fisico.

## DL-003 · REJECT — Modulo dinamico 22-uomini, GK giocabile, fuorigioco, difesa a zona (Cap. 8.4)
- **Problema:** il manifesto suggerisce moduli che si trasformano in tempo reale e una tattica
  collettiva completa.
- **Alternative:** (A) simulazione tattica continua dei 22; (B) drift-preset per-highlight (attuale).
- **Scelta:** **B** (REJECT della simulazione continua).
- **Motivazione:** il Live Match è **HL-based** per identità (Cap. 1.3: «non è una simulazione
  continua»). Simulare i 22 in modulo dinamico cambia genere e moltiplica la superficie di bug
  gate-cieca. Il GK proprio giocabile e il ruolo difensivo completo violano l'identità (l'Eroe è
  un **attaccante**, il giocatore controlla **solo** l'Eroe). I drift-preset già danno l'illusione
  di forma fluida per-highlight.
- **Impatto:** copertura tattica resta a livello di highlight (già ~80–95% offensivo/difensivo).

## DL-004 · REJECT — Quality Assurance Engine runtime auto-correttivo (Cap. 11.2 / 11.12)
- **Problema:** il manifesto chiede che il motore, a runtime, validi ogni highlight e lo
  **corregga/rigeneri automaticamente** prima di mostrarlo.
- **Alternative:** (A) validatore runtime bloccante con fallback/rigenerazione; (B) coerenza **a
  monte** (un solo esito) + asserzioni **dev-only** offline nel gate.
- **Scelta:** **B**.
- **Motivazione:** un fallback runtime è un **anti-pattern** per questo progetto: stutter
  percepibile, complessità/bug enormi, e rischio di **mascherare** i difetti invece di risolverli.
  Contraddice «non voglio un motore più complicato». La coerenza si ottiene **prevenendo alla
  fonte** (M1: se l'esito è unico non c'è niente da correggere) e **rilevando in test** (M3:
  asserzioni passive → FAIL del gate). Questo è Cap. 11 **tradotto nell'idioma offline reale** del
  progetto (Playwright + timeline bus), che già esiste ed è efficace.
- **Impatto:** M1 (prevenzione) + M3 (rilevazione) sostituiscono il «QA Engine» runtime.

## DL-005 · Unified Outcome Model come spina della coerenza (Cap. 6.11)
- **Problema:** due tassonomie di esito parallele (`outKey` 12 vs `decideExecution.outcome` ~30)
  guidano sistemi diversi → overlay/cronaca/3D possono divergere.
- **Alternative:** (A) patch dei singoli pool overlay per «indovinare» l'esito 3D; (B) un unico
  oggetto `resolution` prodotto una volta e consumato da tutti; (C) fallback runtime (vedi DL-004).
- **Scelta:** **B** (M1).
- **Motivazione:** è l'analogo software del principio «il pallone è il riferimento assoluto»
  (Cap. 6.11): **un solo esito** per tutti i consumatori. Elimina la classe di bug alla radice,
  è funzione **pura** (basso rischio, gate-verificabile), non tocca stato salvato né probabilità.
  (A) è fragile (continua a indovinare); (C) è respinta.
- **Impatto:** nuova invariante `overlayFamily ⟺ arcFamily`, verificata da M3.

## DL-006 · Freeze: deroga consapevole su GR-013 (eroe libero in hl_move/hl_choose)
- **Problema:** GR-013 vuole durante il Freeze «solo micro-animazioni estetiche»; oggi l'eroe è
  **libero** (riposizionamento in hl_move, idle libero in hl_choose).
- **Alternative:** (A) irrigidire il Freeze anche sull'eroe; (B) mantenere l'eroe libero come
  scelta di design e **documentare** la deroga.
- **Scelta:** **B**.
- **Motivazione:** `hl_move` è la fase di **riposizionamento voluta** (DPad) — è gameplay
  dell'Eroe, non una violazione del Freeze «del mondo». Il Freeze del manifesto riguarda il
  **mondo** (off-ball, palla, difensori), che oggi effettivamente si ferma (`_readFreeze`).
  Irrigidire l'eroe ridurrebbe la sua agency (contro Cap. 1.4/2.4). Il vero problema non è
  l'eroe libero, ma che il Freeze **non è validato** (off sotto `_CPM_TEST`) → risolto da M3.
- **Impatto:** M3 porta il Freeze del mondo nel gate; l'eroe resta libero by design.

## DL-007 · Adattamento IA (Cap. 4.12): forma leggera, opzionale, non default
- **Problema:** il manifesto vuole difensori che «iniziano ad aspettarsi» lo schema ripetuto.
- **Alternative:** (A) apprendimento in-match completo; (B) micro-bias deterministico da Match
  Memory dietro flag; (C) niente.
- **Scelta:** **B**, forma leggera con flag `cpmadapt` (`?cpmadapt=0` per spegnere).
- **Motivazione:** l'off-ball è gate-cieco (R-01) e un'adattività mal calibrata degrada la
  leggibilità e fa «rubare la scena» all'IA (contro Cap. 1.8). Implementata come forma leggera,
  bounded e deterministica.
- **Stato (5.58.0):** **implementato e ATTIVATO su richiesta del proprietario.** `matchMem.byFlank`
  traccia la fascia più attaccata dall'Eroe (da `pPosRef.current.y`); il render calcola
  `_adaptShift` (deterministico, **bounded ±4u**, parte dopo ≥3 azioni, cresce con la dominanza
  della fascia); l'off-ball sposta la y dei difensori della squadra che difende (mai GK, sospeso
  sui set-piece). Verificato **direzionale** (la difesa reagisce diversamente a pattern
  destra/sinistra) e **gate 13/13 verde**. La marcatura reale degli attaccanti **modera** lo shift
  opposto → effetto realistico e sottile (Cap. 4.12 «mai in maniera estrema»), non un teletrasporto.
- **Caveat onesto:** la magnitudine/feel non è calibrabile in modo affidabile in headless (la
  misura mesh è rumorosa ±4u in scena dinamica); il **giudizio definitivo sul feel spetta al
  proprietario dal vivo**. Reversibile con `?cpmadapt=0`.
- **Impatto:** additivo, deterministico, nessun bump `SAVE_VERSION`, gate invariato.

## DL-008 · Match Memory effimera, non salvata (no `SAVE_VERSION` bump)
- **Problema:** la continuità narrativa richiede memoria degli eventi di partita.
- **Alternative:** (A) persistere la memoria nello stato `player`; (B) ring in-memory effimero,
  resettato a inizio partita.
- **Scelta:** **B**.
- **Motivazione:** la memoria serve **solo entro la singola partita** (cronaca/overlay/scheduling);
  persisterla imporrebbe un bump `SAVE_VERSION` + migration + rischio save-compat (R-05) senza
  valore aggiunto. Effimera = zero rischio save, zero peso.
- **Impatto:** M2 non tocca il formato di salvataggio; `SAVE_VERSION` resta 7.

## DL-009 · Modularità «dentro il file», mai file JS separati
- **Problema:** il manifesto chiede «più modulare / più semplice da mantenere»; la tentazione è
  spezzare il file.
- **Alternative:** (A) estrarre moduli in file JS separati; (B) modularità **logica** dentro
  `CARRIER-MANAGER-AV.html` (sezioni nominali, funzioni pure isolate, single-source tables).
- **Scelta:** **B**.
- **Motivazione:** CLAUDE.md impone il **file unico** (dev workflow, gate, build-dist dipendono da
  questo). La manutenibilità si ottiene con confini logici chiari (i cores `deriveIntent`/
  `deriveHL`/`decideExecution` sono già isolabili) e con l'unificazione (M1 rimuove duplicazione
  di logica d'esito), non con la frammentazione fisica.
- **Impatto:** nessun refactor strutturale del file; M1 riduce la duplicazione «buona/cattiva».

## DL-010 · Deferral motivati (non ora, non mai «gratis»)
- **Problema:** alcune richieste del manifesto hanno valore ma non urgenza/priorità.
- **Scelta:** **deferire** con motivazione, non implementare in questa fase:
  - `deriveIntent` text-free — mechanical, ~56 override, **valore-Eroe nullo** (Regola Zero).
  - Personalità NPC (Cap. 4.10) / identità di carriera (Cap. 10.6/10.11) — nuovo stato/tuning,
    **fuori perimetro Live Match** (meta-carriera).
  - Esultanze contestuali (Cap. 10.9) / replay selettivo (Cap. 5.11) — nice-to-have, non gap di
    coerenza, gate-ciechi.
  - Audio/voce (Cap. 5.9) — gioco **silenzioso per scelta** store; il manifesto va emendato
    («audio» = feedback testuale/visivo).
- **Impatto:** backlog tracciato; nessuna di queste blocca M1/M2/M3.

## DL-011 · Esito difensivo VARIO e realistico (fine effetto «ping-pong»)
- **Problema:** quasi ogni intervento difensivo produceva come default un rinvio lungo di 70-80m verso la
  porta avversaria (spazzata larga+alta), esito unico e irrealistico che rompeva la credibilità degli HL.
- **Alternative:** (A) simulazione fisica del rinvio (peso/orientamento/contatto) — respinta da DL-002;
  (B) motore d'esito difensivo pesato e deterministico che sceglie tra molti esiti realistici, ognuno con
  un descrittore di traiettoria mappato su posizioni vive; (C) semplice riduzione della distanza del rinvio
  esistente (una sola traiettoria, più corta).
- **Scelta:** **B** (`resolveDefensiveOutcome`, 5.65.0).
- **Motivazione:** (C) non dà varietà (il difetto vero è la MONOTONIA, non solo la distanza); (A) viola
  «niente motore fisico» e l'identità decisionale. (B) è l'analogo difensivo del Decision Engine (DL-005):
  **un solo esito** deciso a monte (M1: seed stabile → coerenza 3D/overlay/cronaca), consumato dal render.
  Funzione **pura/deterministica/node-testabile** → basso rischio, gate-safe. La spazzata lunga resta ma
  **eccezionale** (gated su pressione/compostezza, sempre larga sulla fascia, capata a x≤68) — mai verso la
  porta avversaria. Rispetta la Regola Zero senza «motore più grande»: additiva, un solo file, nessun bump
  `SAVE_VERSION`.
- **Impatto:** invariante di fatto «HL difensivo ⟹ palla MAI in rete avversaria / MAI parata sulla propria
  porta» (post-arco difensivo isolato); `hlDef` esteso a ogni intervento difensivo, non solo `type:"def"`.
  Traiettoria gate-cieca → validata da 2 test dedicati (distribuzione + dal vivo). Fingerprint gate invariato.

---

## Indice decisioni

| ID | Decisione | Tipo |
|----|-----------|------|
| DL-001 | Evolvere, non riscrivere | Direzione |
| DL-002 | REJECT fisica/collisioni reali | Scope-out |
| DL-003 | REJECT modulo dinamico / GK giocabile / fuorigioco / zona | Scope-out (identità) |
| DL-004 | REJECT QA Engine runtime auto-correttivo | Scope-out (anti-pattern) |
| DL-005 | Unified Outcome Model (M1) | Architettura |
| DL-006 | Freeze: deroga consapevole GR-013 | Design |
| DL-007 | Adattamento IA leggero, opzionale, non default | Design (flag) |
| DL-008 | Match Memory effimera, no save bump | Architettura |
| DL-009 | Modularità dentro il file, no file JS separati | Vincolo |
| DL-010 | Deferral motivati | Backlog |
| DL-011 | Esito difensivo vario (fine «ping-pong») | Architettura |

> Ogni riapertura di una decisione REJECT/Defer richiede una nuova voce DL con motivazione che
> superi la Regola Zero e i vincoli di identità/complessità.
