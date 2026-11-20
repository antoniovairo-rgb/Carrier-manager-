# Verifica della 7.999.198 — parte R2 (residui)

- Ramo verificato: `prova/198-finale` (`0f0b13d8`) · base di confronto per i rossi: `lavoro/198` (`b3b75b9d`)
- Ramo di lavoro: `sviluppo/verifica198-r2` · data: 20/11/2026
- Modo: un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti a controllo, nessuna correzione.
- Macchina a inizio giro: 15,4 GB di memoria libera, 59 GB di disco liberi.

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| momento-194 | VERDE (uscita 0, 104 s) | — | — | bracci A/B/C verdi, tutti i rossi bocciati |
| nomi-190 | VERDE (uscita 0, 22 s) | — | — | 23 ok · 0 ko |
| nomi-211 | VERDE (uscita 0, 190 s) | — | — | 22 ok · 0 ko · viste giudicate 4 su 4 |
