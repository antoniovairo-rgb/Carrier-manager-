# Verifica di rilascio 7.999.197 — blocco V3c2

Build verificato: `a81ebb10` (lavoro/197, build finale del lotto). Riferimento 196: `3076a1b7` (origin/main, 7.999.196 pubblicata).
Modo: `npm run -s <nome>` in `tests/visual`, uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 2400 s (3600 s sulla 196 se oltre tetto 2 su 2). Prima di ogni corsa: `build-src` + `check-src` verdi una volta all'inizio; `free -m`/`df -h` registrati per ogni corsa. «Non giudicato» nel testo = rosso. Foto rigenerate in `docs/` rimesse con `git checkout --`.
Regola PO-516: rosso anche sulla 196 = DICHIARATO; verde sulla 196 = NATO nella 197 (blocca l'uscita). Nessuna correzione eseguita.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| rosa-228 | verde (61s) | — | — | verde | `✓ rosa-228 VERDE` |
| agente-198 | verde (79s) | — | — | verde | `✅ VERDE — agente-198 (A «Da fare ora» in cima · B la fermata porta all'Agente), rossi bocciati` |
| neutro-287 | verde (35s) | — | — | verde | `✅ neutro-287 verde (creazione senza stile, eroe senza archetipo, statistiche senza bonus, stileMotore neutro, Carriera senza «Stile di gioco» né «Finalizzatore»; 18 casi di migrazione → neutro con stilePrima287,` |
| ritratto-171-72 | verde (56s) | — | — | verde | `✅ ritratto-171-72 verde (ritratto dell'eroe caricato in tre schermate, zero CH38) e il rosso si vede` |
| mister-215 | verde (28s) | — | — | verde | `✅ mister-215 verde (e il rosso si vede)` |
| coppa-prestito-245 | verde (24s) | — | — | verde | `✅ coppa-prestito-245 verde (resta in coppa col doppio impegno, il turno si gioca) e il rosso si vede` |
| infortunio-263 | verde (77s) | — | — | verde | `✅ VERDE infortunio-263` |
| grafica-v2 | verde (117s) | — | — | verde | `ROSSO 269 OK: con __CPM_NO_G235 (anelli) cade la misura dei gradini del Club in ogni formato` |
| partita-v2 | verde (464s) | — | — | verde | `ROSSO ATTESO OK: col tema di prova a basso contrasto cade PAL su ogni schermata e CON in ogni formato` |
| testata-209 | rosso, uscita 1 (952s) | in corsa | — | in corsa | `` |
| spazio-296 | — | — | — | da eseguire | `` |
| partita-rigiocata-194 | — | — | — | da eseguire | `` |
| tabellone-214 | — | — | — | da eseguire | `` |
| ripartenza-235 | — | — | — | da eseguire | `` |
| squalifica-222 | — | — | — | da eseguire | `` |

## Note e dubbi
- agente-198 ha rigenerato 6 foto in `docs/sviluppo/giro198/`: rimesse con `git checkout --`, non committate.
- testata-209, 1ª corsa (952 s): entrambi i bracci senza lettura — «tabellino [] · edicola «null» · scena dell'intervista n.d.» sia nel verde sia nel rosso; il controllo non ha letto nulla (equivale a «non giudicato» = rosso). Nessun messaggio d'errore nel registro (7 righe).
