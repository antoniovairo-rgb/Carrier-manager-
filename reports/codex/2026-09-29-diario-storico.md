# Diario e Storico allenatori — 7.999.53

La carriera simulata è stata misurata per 8 stagioni nei semi 0 e 3. La navigazione UI è stata verificata separatamente con un salvataggio sintetico di otto stagioni e quattro allenatori distinti; non è una partita naturale.

## Comandi completi
- `$env:CPM_SEEDS='0,3,30,33'; $env:CPM_TIME_LIMIT_MS='14400000'; $env:CPM_OUTPUT='career-followup-results.json'; node tests/codex/career-followup.mjs`
- `$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; node tests/codex/diario-53.mjs`

Fonti: `tests/codex/career-followup-results.json` (`careers[].seasonStats`), `tests/codex/diario-53-results.json`.

| Seme | Fine stagione | Voci nel Diario | Stagioni distinte con voci | Stagioni presenti |
|---:|---:|---:|---:|---|
| 0 | 1 | 0 | 0 | nessuna |
| 0 | 2 | 2 | 1 | 2 |
| 0 | 3 | 6 | 2 | 2, 3 |
| 0 | 4 | 9 | 3 | 2, 3, 4 |
| 0 | 5 | 13 | 4 | 2, 3, 4, 5 |
| 0 | 6 | 16 | 5 | 2, 3, 4, 5, 6 |
| 0 | 7 | 20 | 6 | 2, 3, 4, 5, 6, 7 |
| 0 | 8 | 23 | 7 | 2, 3, 4, 5, 6, 7, 8 |
| 3 | 1 | 0 | 0 | nessuna |
| 3 | 2 | 1 | 1 | 2 |
| 3 | 3 | 4 | 2 | 2, 3 |
| 3 | 4 | 7 | 3 | 2, 3, 4 |
| 3 | 5 | 10 | 4 | 2, 3, 4, 5 |
| 3 | 6 | 13 | 5 | 2, 3, 4, 5, 6 |
| 3 | 7 | 17 | 6 | 2, 3, 4, 5, 6, 7 |
| 3 | 8 | 20 | 7 | 2, 3, 4, 5, 6, 7, 8 |

Nella prova UI sintetica, le frecce hanno mostrato 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1 all'indietro e 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 in avanti. Il titolo dello Storico allenatori indica 4 e i quattro nomi compaiono una volta ciascuno: Mister Alfa, Beta, Gamma e Delta. Errori di pagina/esecuzione: 0.

Limiti: la carriera reale osservata non conserva nel JSON una schermata del Diario o `coachHistory` a fine stagione; non posso confermare che la stessa UI mostri senza anomalie tutti i dati di quelle due carriere. La prova sintetica dimostra il comportamento del componente con voci e allenatori preparati, non la correttezza della generazione degli allenatori lungo otto stagioni.
