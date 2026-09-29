# Zero presenze dopo il rinnovo dall'interfaccia — stato parziale

Versione verificata: `GAME_VERSION="7.999.53"`, commit `54e6047ed67042c25970af2ab050b3422404c914`, ramo `codex/2026-09-29-carriere-53`.

Comando eseguito dalla radice del repository: `$env:CPM_SEEDS='0,3,30,33'; $env:CPM_TIME_LIMIT_MS='14400000'; $env:CPM_OUTPUT='career-followup-results.json'; node tests/codex/career-followup.mjs`. Dati grezzi: `tests/codex/career-followup-results.json`. La corsa è stata interrotta su richiesta del PO per il carico sul PC: 2.294.129 ms di durata registrata; semi 0 e 3 completati (8 stagioni e 639 passi ciascuno), seme 30 fermo dopo 4 stagioni e 326 passi, seme 33 non iniziato.

| Seme | Stagione a zero presenze | Scadenza contratto | Durata contratto | Ruolo | Fiducia mister | Infortunio | Schermata di fine stagione |
|---|---:|---:|---:|---|---:|---|---|
| 0 | 8 | 8 | 0 | riserva | 57 | nessuno nel salvataggio | `seasonAwards` |
| 3 | 3 | 3 | 0 | riserva | 42,7 | nessuno nel salvataggio | `seasonAwards` |
| 3 | 4 | 3 | 0 | primavera | 24,7 | nessuno nel salvataggio | `seasonAwards` |
| 3 | 5 | 3 | 0 | primavera | 6,7 | nessuno nel salvataggio | `seasonAwards` |
| 3 | 6 | 3 | 0 | riserva | 60 | nessuno nel salvataggio | `seasonAwards` |

Il clic di rinnovo dall'interfaccia è riuscito 4 volte nel seme 0 e 1 volta nel seme 3. Nel seme 3 il club ha rifiutato 2 proposte; 13 clic sono stati bloccati dall'interfaccia o dal test e non equivalgono a un rifiuto del club. Nel seme 0 altri 3 clic risultano bloccati e 4 non avevano il pulsante disponibile. **Esito verificato:** l'accettazione dei rinnovi riusciti non elimina tutte le stagioni a zero presenze. **Non verificato:** cosa accadrebbe se anche i clic bloccati venissero completati; la causa tecnica dei clic bloccati; il comportamento completo dei semi 30 e 33. Lo stato `running` del seme 30 nel JSON indica soltanto che l'esecuzione è stata interrotta.

Segnalazione (gravità media, da riprodurre dal team): nel seme 3 il calendario delle stagioni 3–6 prosegue senza presenze mentre il contratto risulta scaduto dalla stagione 3. La coincidenza tra contratto e zero presenze è misurata, ma il nesso causale è un'ipotesi. Riproduzione: eseguire il comando sopra e ispezionare `careers[1].zeroSeasons` e `careers[1].renewals` nel JSON. La verifica dei clic bloccati richiede un collaudo separato dell'interfaccia.
