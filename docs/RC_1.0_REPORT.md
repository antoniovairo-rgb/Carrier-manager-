# Career Player Manager (Elevora) — RELEASE CANDIDATE 1.0 · Report di Hardening

**Versione:** CPM 6.45.0 · **Data:** 2026-07-04 · **SAVE_VERSION:** 8
**Metodo:** audit adversariale multi-agente su 14 dimensioni (workflow `rc-hardening-hunt`, 61 agenti, ogni finding verificato in modo avversariale) + suite dinamica esistente eseguita a tappeto.
**Esito:** 35 bug confermati → **34 risolti**, 1 deferito (residuo a basso rischio). Gate 14/14, fingerprint `00001505`, zero regressioni misurate.

---

## Sintesi esecutiva

| Severità | Trovati | Risolti | Deferiti |
|---|---|---|---|
| 🔴 Critici | 2 | 2 | 0 |
| 🟠 Gravi | 9 | 9 | 0 |
| 🟡 Medi | 11 | 10 | 1 |
| ⚪ Minori | 13 | 13 | 0 |
| **Totale** | **35** | **34** | **1** |

**Evidenza dinamica indipendente (tutta verde):**
- Quality Gate visivo: **14/14** (fingerprint `00001505`, 0 failure)
- Live Match Validator: **trial 16/16 HL PASS**, **career 12/12 HL PASS** — 0 FAIL/WARN, 0 stalli, overlap p90 0, 0 pageerror
- `credit-live-audit`: **1074 esiti risolti dal vivo, 0 anomalie** (nessun gol accreditato alla squadra sbagliata)
- `career-invariants` · `stab-nat-trigger` · `career-sim` (2 stagioni) · **career-sim lungo 8 stagioni**: invarianti tenuti, 0 pageerror
- `audit-copyright`: **0 hit** (nessun riferimento al mondo reale)

---

## 1. Bug CRITICI trovati (2 — tutti risolti)

| # | Area | Descrizione | Scenario di fallimento |
|---|---|---|---|
| C1 | Boot / Save | `storage.listSlots()` dereferenziava `d.player.name` sul sentinella `{_error:true}` quando `localStorage` lancia (site-data bloccati, alcune WebView Android) → `TypeError` → la promise rigetta → `refreshSlots().then(setPhase("home"))` senza `.catch` → **boot bloccato sullo spinner per sempre**. | Utente con cookie/site-data disabilitati apre il gioco → schermata di caricamento infinita. |
| C2 | Live Match / Rigore | `handleRigore` aveva solo il controllo `phase!=="hl_choose"` (stato React asincrono), NON la guardia sincrona `_hlActionFiredRef` che `handleAction` usa. | Doppio-tap rapido sul bottone direzione del rigore → l'esito si risolve **due volte** → `score.home+1` e `goals+1` applicati ×2 → **punteggio/gol corrotti** nel risultato finale e nei totali di carriera. |

## 2. Bug GRAVI trovati (9 — tutti risolti)

| # | Area | Descrizione |
|---|---|---|
| G1 | Live Match / Tastiera | I tasti 1/2/3/0/Enter risolvevano l'array **grezzo** delle azioni, mentre i bottoni a schermo derivano da `filterSitActions` (scarta/riordina) → un tasto numero risolveva un'azione **diversa** da quella etichettata (incl. una testa su palla a terra = violazione coerenza CINE). |
| G2 | Live Match / Tastiera | Sui rigori/punizioni (`isAimSit`) i bottoni sono il minigioco di mira (`handleRigore`), ma la tastiera instradava comunque a `handleAction` → **bypass del minigioco**. |
| G3 | Live Match / Rigore | Variante di C2 osservata su un secondo path (tap-bleed) — chiusa dalla stessa guardia. |
| G4 | Situazioni | «🎭 Guadagna una punizione» (gioco aperto) col testo contenente *punizione* faceva scattare `deriveIntent→"freekick"` → mostrava la **griglia rigore** invece delle sue 3 azioni. |
| G5 | Situazioni | «🔥 Siamo in vantaggio — gestisci» accreditava un **GOAL** per portare palla alla bandierina e un **ASSIST** per un passaggio laterale (gol/esultanza fasulli). Stessa classe del fix 6.43.0. |
| G6 | Carriera | Le partite di **lega simulate** incrementavano `totalGoals/totalAssists` ma **mai** `totalMatches` → conteggio presenze corrotto, milestone presenze bloccate. |
| G7 | Competizioni | Il KO di Coppa Europea **giocato dal vivo** risolveva il pareggio come **eliminazione**, mentre ogni altro KO (sim/coppa/nazionale) va ai rigori (`koShootoutWin`). |
| G8 | UI / Dark mode | Il tab Agente rendeva testo `TH.text/TH.muted` su pannelli `#f8fafc` hardcoded → **invisibile in tema scuro**. |
| G9 | Store / Copyright | 4 nomi club **verbatim reali** (FC Porto/Famalicão/Vizela/Arouca) non in `_CR_BRANDS` → l'audit dava falso 0-hit. |

## 3. Bug MEDI trovati (11 — 10 risolti, 1 deferito)

- **M1 (deferito):** colpo di testa al palo lontano / tiro a giro che segnano mirano la z dell'arco fuori dai pali, poi `in_net` la reincastra → **kink laterale** visibile. *Deferito*: il clamp corretto vive dentro l'`arcBlock` gate-checked (`data-coherence`) → rischio; mitigato alzando il clamp `in_net` a ±3.35 (vedi minori).
- **M2:** partite euro (girone/KO) contate in `totalMatches` sul path auto-sim ma non su «Simula». ✅
- **M3:** `simulateAndAdvance` non evolveva forma/fatica (congelate), a differenza di `doAdvanceWeek`. ✅
- **M4:** tabellone KO europeo (tab Coppe) ometteva i **Quarti** → un quarto giocato non appariva. ✅
- **M5:** label TV prepartita Coppa Nazionale: la **Finale** era etichettata «Semifinale» (mappa turni sfasata). ✅
- **M6:** il taglio stipendio da retrocessione (−25%) colpiva il contratto del **club madre** in base alla retrocessione del club di **prestito**. ✅
- **M7:** `acceptTransfer` non azzerava `matchHistory` → dopo un trasferimento invernale la dashboard mostrava le gare del vecchio club. ✅
- **M8:** testo messaggio allenatore (Allenamento) su `#f8fafc` → invisibile in dark mode. ✅
- **M9:** nota cooldown mercato: `"Estate S."+season+1` (concatenazione) stampava «S.31» invece di «S.4». ✅
- **M10:** «Migliore in campo» in trasferta pescava dalla rosa **avversaria** (un avversario premiato dopo una vittoria dell'eroe). ✅
- **M11:** la voce di diario «legame» usava `prepend + slice(0,80)` invece di `append + slice(-80)` → ordine cronologico invertito + sfratto delle voci recenti. ✅

## 4. Bug MINORI trovati (13 — tutti risolti)

Rigore senza `outKey` (niente ripartenza dal centro sul gol) · navigazione con frecce pubblicizzata ma non implementata · `in_net` clampato a ±3 (i gol non riempiono gli angoli) → ±3.35 · soft-collision spingeva chi riceve/corre a vuoto · `_rcvT` non resettato all'uscita da `hl_result` · azione «di testa» morta in `CHAIN_SITS.mischia` (palla a terra) · label di fase euro senza caso «quarti» (×2) · seconda occorrenza del bug di concatenazione stagione · path AI-press perdeva `playerCtx` (memoriaTag/descrittori) · `console.log` opponent-tactic non gated (finiva nell'AAB) · spam `[CPM-AI] No API key` su web ad ogni highlight · `clipboard.writeText` senza `.catch` (unhandled rejection).

## 5. Problemi di GAMEPLAY

Nessun freeze/soft-lock riprodotto nel Live Match (live-smoke + validator: clock sempre avanzante, code HL processate, 0 stalli su 28 partite reali). I difetti di *input* (doppio-tap rigore C2/G3, tastiera G1/G2) erano i più impattanti sul gameplay e sono chiusi. La conversione G+A e il feel restano da collaudo dal vivo (gate-ciechi).

## 6. Problemi di IA (off-ball)

Due difetti di coerenza visiva risolti: la soft-collision sballottava i giocatori in fase di **ricezione** (M-minor) e lo stato `_rcvT` sopravviveva tra highlight. Nessun giocatore immobile / inseguimento infinito riprodotto (overlap p90 = 0 sul validator). **Backlog:** raffinamento off-ball secondo-palo e home-position per ruolo (voci 1–2).

## 7. Problemi di SIMULAZIONE (motore / 179 situazioni)

- **Coerenza credito:** `credit-live-audit` ha risolto **tutte** le 179 situazioni × azioni × (successo|fallimento) = 1074 esiti → **0** situazioni che accreditano la squadra sbagliata (dopo i fix G5/6.43.0).
- **Classificazione intento:** 1 situazione mis-classificata come set-piece (G4) corretta con override esplicito; **backlog**: validatore statico che segnali `deriveIntent=penalty/freekick && lockMovement=false` (voce 5).
- **Esiti offensivi di prima classe:** foul/keep-possession abusavano di goal/assist → normalizzati; **backlog:** outcome key dedicati (voci 3–4).

## 8. Problemi GRAFICI (3D)

Ingresso in rete allargato (±3.35) così i gol d'angolo raggiungono il palo; ricezione/soft-collision coerenti. **Deferito (M1):** kink dell'arco sul colpo di testa al palo lontano (dentro l'`arcBlock` gate-checked). Il rendering 3D è gate-cieco → resta da collaudare dal vivo (kit, folla, gesti, telecamere).

## 9. Problemi UI/UX

14 pannelli con `background:"#f8fafc"` hardcoded → **testo invisibile in dark mode** (Agente, Allenamento, Profilo, Impostazioni, Create, MatchdayCard, Press) → tutti migrati a `TH.surface2` theme-aware. Label competizioni coerenti (Quarti/Finale). Testi corretti (stagione prossima finestra). Hint tastiera ripulito.

## 10. Problemi di PERFORMANCE

Il Performance Monitor del gate è warn-only (rendering software headless). Nessun leak nuovo introdotto; il teardown 3D (dispose profondo, BUG-4) è già in essere. **Backlog:** registro centralizzato «match resources» (texture/geometrie/mixer/timer) per teardown a prova di future aggiunte (voci 10–11) e auto-pausa su `visibilitychange=hidden` per fermare il clock BG in background (voce 15). Nessun blocker per il rilascio.

## 11. Problemi ARCHITETTURALI

La causa strutturale ricorrente resta la **frammentazione dei 3 percorsi di avanzamento settimana** (`onMatchEnd`/`simulateAndAdvance`/`doAdvanceWeek`): G6/M2/M3 sono nuove istanze della stessa classe (un campo aggiornato in un ramo e non negli altri). Risolti puntualmente; **backlog forte (voci 6, 12):** estrarre `weeklyAdvanceFields(p)` unico (totalMatches, forma, fatica, economia, staffRel) e un reducer di avanzamento condiviso, così la classe non può ripresentarsi. Consigliato anche un `withOnce(ref, fn)` condiviso per la reentrancy di tutti gli handler (voce 14).

## 12. REGRESSIONI trovate durante l'hardening

- **Regressione introdotta e chiusa in-batch:** un commento JSX (`/* */}`) inserito per il fix M4 chiudeva anticipatamente il corpo di una arrow-function → **la pagina non montava** (`SITUATIONS` undefined, gate «0 Situations», fingerprint corrotto `2f79d989`). **Intercettata** da un load-probe diretto (console/pageerror) prima della promozione, corretta (`/* */}` → `//`), gate ri-verde `00001505`. *Lezione ribadita:* eseguire un load-probe rapido dopo ogni batch, PRIMA del gate completo; e **non** lanciare browser concorrenti mentre il gate cattura (starva la cattura).
- Nessun'altra regressione: fingerprint gate invariato su entrambe le release; golden cambiata **deliberatamente** in **1 sola** voce (gi=150, intento `freekick→dribble`, atteso).

## 13. CORREZIONI effettuate

34 fix distribuiti su **6.44.0** (2 critici + 7 seri + 2 minori) e **6.45.0** (1 grave UI + 10 medi + 11 minori), tutte committate, gate-verdi e **promosse su `main`** (GitHub Pages, deploy `success`). Dettaglio per-fix nei changelog dei commit e nel commento di `GAME_VERSION`.

## 14. Motivazione tecnica (principi applicati)

- **Zero Regression / Determinism First:** ogni fix è additivo o correttivo puntuale; nessun `Math.random()` nudo introdotto; i fix di credito verificati con la stessa curva seedata.
- **Save-safe:** nessun bump `SAVE_VERSION`; i club rinominati mantengono gli **id** (i save restano validi).
- **Gate come contratto:** i fix che toccano la firma golden (1 intento) sono stati rigenerati **deliberatamente** con diff verificato voce-per-voce (solo gi=150). I fix render-loop/post-arco vivono FUORI dall'`arcBlock` gate-checked → fingerprint invariato.
- **Minimo rischio:** il solo fix dentro l'`arcBlock` (M1) è stato **deferito** a favore di una mitigazione gate-safe (±3.35), in linea con «stabilità > eleganza».

## 15. RISCHI RESIDUI

1. **M1 (kink arco palo lontano)** — deferito; da chiudere con collaudo 3D dal vivo o con un clamp verificato contro `data-coherence`. Impatto: puramente estetico, mitigato.
2. **Parti gate-cieche** — dark-mode, flusso prestito/rientro, MVP trasferta, ingresso rete, gesti/kit/folla 3D, cronaca BG live: validate logicamente/staticamente ma **da collaudare dal vivo** (il gate non le copre). Raccomandato un giro di collaudo manuale su dispositivo reale prima della pubblicazione store.
3. **Save già corrotti pre-fix** — un save che aveva già sotto-contato le presenze (G6) o passato per un KO euro eliminato erroneamente (G7) resta com'è (i fix valgono d'ora in avanti; nessuna riconciliazione retroattiva, coerente con la prassi STAB).
4. **AAB store** — va compilato in locale (niente Android SDK in cloud): `npx cap add android && npx cap sync && gradle bundleRelease`. La filiera web/dist/offline/copyright è verde.

## 16. SUGGERIMENTI per versioni future (SOLO backlog — nessuna implementazione)

1. Varietà off-ball secondo-palo per la squadra di casa (oggi differenziata solo in trasferta).
2. HL offensivo con `ballX<50` (contropiede dalla propria metà): il blocco casa si dispone come se difendesse.
3. Outcome key di prima classe «punizione guadagnata» → opportunità da set-piece.
4. Famiglia di outcome «gestione risultato / mantieni possesso» (recovery + effetto clock) senza abusare di goal/assist.
5. Validatore nel gate: segnala situazioni con `deriveIntent∈{penalty,freekick}` mentre `lockMovement=false`.
6. **`weeklyAdvanceFields(p)` unico** (totalMatches, forma, fatica, economia, staffRel) applicato dai 3 path.
7. `euroGroupTable`: modellare i risultati intra-girone come una tabella conservata (oggi W/D/L da hash indipendenti).
8. Mostrare esplicitamente l'esito ai rigori nel tabellone/notifiche del KO europeo (come fa la Coppa Nazionale).
9. Affordance «Riprova» su uno slot con errore di storage transitorio (niente reload forzato).
10. Il componente 3D morto `FootballMatch` (mai renderizzato) ha un teardown incompleto: rimuoverlo o completarlo se mai riattivato.
11. Registro centralizzato «match resources» per un teardown 3D a prova di future aggiunte.
12. Reducer di avanzamento-settimana condiviso (unifica i merge euro/KO/infortunio/economia).
13. Gate unico `DEBUG` per i blocchi `console.log/table` dev-only.
14. Helper di reentrancy condiviso `withOnce(ref, fn)` per tutti gli handler mutanti.
15. Auto-pausa del Live Match su `visibilitychange==='hidden'`.

---

## Definizione di «DONE» — valutazione

| Criterio | Stato |
|---|---|
| Nessun bug critico | ✅ (2/2 risolti) |
| Nessun bug grave | ✅ (9/9 risolti) |
| Nessuna regressione | ✅ (1 introdotta in-batch, intercettata e chiusa; fingerprint invariato) |
| Live Match stabile/fluido | ✅ misurato (28 partite reali, 0 stalli/teleport/pageerror); *feel* da collaudo dal vivo |
| Carriera coerente su molte stagioni | ✅ (8 stagioni simulate, invarianti tenuti) |
| Interfaccia rifinita/coerente | ✅ dark-mode + label + testi corretti; *resa* da collaudo dal vivo |
| Codice più pulito | ✅ (debug gated, dead-hint rimosso, `.catch`, backlog di consolidamento tracciato) |
| Performance stabili | ✅ nessun leak nuovo; ottimizzazioni di lungo periodo a backlog |
| Qualità percepita da prodotto commerciale | 🟡 sostanzialmente sì lato logica/robustezza; **richiesto un giro di collaudo manuale dal vivo** sulle parti gate-cieche prima della pubblicazione |

**Verdetto:** la build **6.45.0** è una **Release Candidate solida** — nessun bug critico o grave aperto, zero regressioni misurate, suite dinamica interamente verde. Prima della pubblicazione store restano consigliati: (a) un giro di **collaudo manuale dal vivo** sulle aree gate-cieche (§15.2), (b) la chiusura del residuo estetico M1, (c) la compilazione dell'AAB in locale.
