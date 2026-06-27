# Development Rules

Regole di sviluppo della **Live Match Development Platform**. Sintesi operativa; il riferimento vincolante completo è `MASTER_PROMPT.md` (charter LMQP, Parte 2).

- **No regressioni** — una modifica non è completa se peggiora il comportamento esistente (Zero Regression Policy).
- **Test automatici obbligatori** — ogni modifica significativa validata automaticamente (QA First).
- **Cleanup processi** — nessun processo lasciato aperto; cleanup anche su errore (`try/finally`).
- **Chiusura browser** — riuso delle istanze, browser chiuso a fine esecuzione; niente Chromium orfani.
- **Logging completo** — log strutturati (timestamp, modulo, livello, seed, validator).
- **Failure Package automatici** — ogni FAIL genera un pacchetto riproducibile (vedi `LIVE_MATCH_QA_SPEC.md` cap. 3.7).
- **Replay obbligatorio per ogni FAIL** — ogni FAIL deve essere ricostruibile via replay + seed.

---

## Stato attuale (onestà documentale)

| Regola | Stato nel repo |
|---|---|
| No regressioni | 🟢 enforced — quality gate 9/9 obbligatorio prima di ogni push (`tests/visual`) |
| Test automatici obbligatori | 🟡 gate visivo a frame congelati + suite analitica node; **non copre movimento/replay** |
| Cleanup processi / chiusura browser | 🟡 Playwright chiude il browser a fine run; health-check `ps` eseguito a mano in sessione (Resource Manager automatico da costruire) |
| Logging completo | 🔴 logging strutturato per-modulo non ancora formalizzato |
| Failure Package automatici | 🔴 da costruire (oggi solo screenshot + report aggregato in `out/`) |
| Replay obbligatorio per ogni FAIL | 🔴 da costruire (dipende dal Replay/Timeline Engine) |
