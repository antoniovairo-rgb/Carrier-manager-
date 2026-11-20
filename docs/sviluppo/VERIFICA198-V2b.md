# Verifica della 7.999.198 — parte V2b

- **Partenza:** `prova/198-finale` (`0f0b13d8` = `lavoro/198` + giri 293–296, 298, 299, 300, 301, 302).
- **Base di confronto (solo per i rossi):** `lavoro/198` (`b3b75b9d`).
- **Ramo:** `sviluppo/verifica198-v2b`.
- **Modo:** un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti per controllo. Nessuna correzione: solo esiti.
- **Stato:** in corso.

| # | controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|---|
| 1 | coerenza-235 | VERDE (uscita 0, 180 s) | — | — | verde + due bracci rossi (`__CPM_NO_G235`, `__CPM_NO_G260`) bocciati come atteso |
