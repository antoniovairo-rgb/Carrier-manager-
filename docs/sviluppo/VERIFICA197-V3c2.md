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
| testata-209 | rosso, uscita 1 (952s) | rosso, uscita 1 (953s) | rosso, uscita 1 (732s) | dichiarato (rosso anche sulla 196) | `  · rosso: il difetto non si vede («null»)` |
| spazio-296 | verde (488s) | — | — | verde | `  tel opzioni: 1 distanze oltre 10 (16.8 div«Crea il tuo calciatore»)` |
| partita-rigiocata-194 | verde (315s) | — | — | verde | `✅ partita-rigiocata-194 verde (e il rosso si vede)` |
| tabellone-214 | verde (499s) | — | — | verde | `✅ tabellone-214 verde (e il rosso si vede)` |
| ripartenza-235 | verde (254s) | — | — | verde | `✅ ripartenza-235 verde: gol ambientale → centro senza schieramento; piazzato dell'eroe → schieramento; il rosso (regola larga) si vede` |
| squalifica-222 | verde (52s) | verde (54s, corsa superflua: falso allarme del filtro) | verde (128s, superflua) | verde | `✅ VERDE squalifica-222 (braccio verde)` |

## Sintesi

15 controlli eseguiti sul build `a81ebb10`: **14 verdi alla 1ª corsa**, **1 dichiarato** (testata-209: rosso 2 su 2 e rosso anche sulla 196, con un dubbio sul modo di fallire, vedi sotto). **Nessun rosso NATO nella 197**, nessun instabile, nessuno oltre tetto. Già dichiarati da prima e non rieseguiti (fuori elenco): difficolta-156, finale-202, voto-79, giornale-244.

## Note e dubbi
- agente-198 ha rigenerato 6 foto in `docs/sviluppo/giro198/`: rimesse con `git checkout --`, non committate.
- testata-209, 1ª corsa (952 s): entrambi i bracci senza lettura — «tabellino [] · edicola «null» · scena dell'intervista n.d.» sia nel verde sia nel rosso; il controllo non ha letto nulla (equivale a «non giudicato» = rosso). Nessun messaggio d'errore nel registro (7 righe).
- testata-209, 2ª corsa (953 s): identica alla 1ª (tabellino [] in entrambi i bracci). Sulla 196 (732 s) rosso anche lì → classificato DICHIARATO secondo PO-516. **Dubbio da segnalare, non deciso:** il modo di fallire è diverso. Sulla 196 il tabellino viene letto («FC Laguna | — | FC Sicania») e i due bracci si fermano dopo, su `locator.click: Timeout 10000ms` in attesa di «Torna alla dashboard» (testata-209.mjs:78). Sulla 197 il tabellino non viene nemmeno letto (`[]`) e ogni braccio dura ~475 s senza alcun errore stampato. Il controllo è rosso su entrambe le versioni, ma sulla 197 si ferma prima: non posso confermare che sia lo stesso difetto.
- squalifica-222: il mio filtro automatico su «non giudicat» ha scattato per errore. Il testo è la descrizione di nove controlli **superati** («✓ … entro 10 s (altrimenti non giudicato)»): 42 ✓, 0 ✗/❌, uscita 0, riga finale «✅ VERDE squalifica-222 (braccio verde)». Classificato **verde alla 1ª**. Per colpa del filtro sono state fatte due corse in più (2ª sulla 197, 54 s, identica e verde; una sulla 196, 128 s, verde): le dichiaro, non cambiano la classificazione. Osservazione senza giudizio: la 197 stampa «(braccio verde)» nella riga finale e 42 ✓ contro i 33 della 196.
- Tempo totale del blocco: dalle 20:03 a circa 22:30 (ora del contenitore), sotto il tetto di 4 ore.
- Nessun file di `src/` o `tests/` modificato; `build-src` («byte identici») e `check-src` verdi all'inizio; albero di lavoro pulito a fine blocco.
- spazio-296, grafica-v2, partita-v2: l'ultima riga stampata è la misura del braccio rosso (atteso), non il verdetto; uscita 0. Verdetto di spazio-296 alla riga 49: «spazio-296 VERDE: 44 schermate misurate, distanze fra riquadri-carta 6-10 px, nessuna sovrapposizione».
