# Verifica della 7.999.198 — parte V2b

- **Partenza:** `prova/198-finale` (`0f0b13d8` = `lavoro/198` + giri 293–296, 298, 299, 300, 301, 302).
- **Base di confronto (solo per i rossi):** `lavoro/198` (`b3b75b9d`).
- **Ramo:** `sviluppo/verifica198-v2b`.
- **Modo:** un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti per controllo. Nessuna correzione: solo esiti.
- **Stato:** in corso.

| # | controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|---|
| 1 | coerenza-235 | VERDE (uscita 0, 180 s) | — | — | verde + due bracci rossi (`__CPM_NO_G235`, `__CPM_NO_G260`) bocciati come atteso |
| 2 | rassegna-200 | **ROSSO** (uscita 1, 605 s) — verde 11/14 | **ROSSO** identico (uscita 1, 608 s) — verde 11/14 | **non nasce dall'unione** (stesso rosso sulla base) | cade solo il braccio B «partita intera a velocità 2»: la partita non finisce entro il tetto di 420 s dell'aiutante `gioca166` (risultato 2-1 al tetto, sia su finale sia sulla base), quindi schede e puntini restano non giudicati = rosso. Bracci A (soli highlight), C (Simula) e il rosso `__CPM_NO_G200` passano in entrambi. Foto di `docs/sviluppo/giro200/` rigenerate dal controllo e rimesse con `git restore`. |
| 3 | riserva-103 | VERDE (uscita 0, 677 s) | — | — | casi A e B: verde 3/3 scene giudicate, rosso visto 3/3 in entrambi |
| 4 | esiti-96 | VERDE (uscita 0, 787 s) | — | — | verde su D1, D2, D3, B15, D6, D7, D12, D15, D14; col rosso `__CPM_NO_G96B_*` cadono tutti e nove come atteso |
| 5 | cori-291 | VERDE (uscita 0, 1 s) | — | — | 20 cori distinti, 0 ripetuti; il rosso fa ricadere i ripetuti (2 distinti, 70 ripetizioni) |
