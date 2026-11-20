# Verifica della 7.999.198 — parte V2c

- Ramo provato: `prova/198-finale` (`0f0b13d8` = `lavoro/198` + giri 293–296, 298, 299, 300, 301, 302).
- Base di confronto per i rossi: `lavoro/198` (`b3b75b9d`), in una copia di lavoro separata.
- Ramo di lavoro: `sviluppo/verifica198-v2c`. Nessuna correzione al gioco: solo esecuzione e rapporto.
- Modo: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 30 minuti per controllo.
- Tutti e 16 i nomi chiesti esistono in `tests/visual/package.json`.

| # | controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|---|
| 1 | accessibilita-234 | **verde** (103 s) con la storia git completa; rosso (113 s) nel clone con la storia tagliata | rosso identico nel clone tagliato (111 s) | nessuno: non nasce dall'unione | L'unico motivo del rosso era «sulla base prima del giro 234 (ea02adf0^): non giudicato (git)» — `fatal: invalid object name 'ea02adf0^'`: il clone della sessione era a storia tagliata. Braccio verde e braccio rosso `__CPM_NO_G234` (24 motivi) erano già a posto. Dopo `git fetch --deepen` (nessuna modifica al codice) il commit c'è e il controllo è verde: «bocciata (5 motivi)». È lo stesso rosso visto dal giro 298. |
<!-- fine tabella -->

## Verdetto

In corso.
