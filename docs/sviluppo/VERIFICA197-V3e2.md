# Verifica di rilascio 7.999.197 — blocco V3e2

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), detached; ramo del rapporto `sviluppo/verifica197-v3e2`.
- Riferimento 196 pubblicata: `origin/main` `3076a1b7` (worktree separato, usato solo per i rossi 2 su 2).
- Preparazione: `npm i` in tests/visual · `node tools/build-src.mjs` (byte identici) · `node tools/check-src.mjs` (allineato a HEAD).
- Modo: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `npm run -s <nome>`, tetto `timeout 2400`; `free -m` e `df -h` registrati prima di ogni corsa; foto rigenerate in docs/ rimesse con `git checkout --`.
- Nessun file di `src/` o `tests/` modificato. Nessuna correzione.

## Esiti

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| tabellino-lati | verde (12 s) | — | — | verde | `✅ PASS tabellino-lati` |
| stat-279 | verde (41 s) | — | — | verde | `✅ STAT-279 OK` |
| lessico-218 | verde (2 s) | — | — | verde | `✅ lessico-218 verde (0 su 138 azioni-tiro col lessico di passaggio) e il rosso si vede (138 su 138)` |
| tabellino-228 | verde (388 s) | — | — | verde | `✅ tabellino-228 verde (e il rosso si vede)` |
| intervista-231 | rosso (1873 s) | rosso (1875 s) | rosso (1921 s) — stessi 6 difetti | dichiarato (rosso anche sulla 196) | `· rosso: la partita non e' arrivata al fischio {"fine":"playing",… 53' …}` |
| schede-234 | verde (761 s) | — | — | verde | `✅ VERDE — schede con almeno 3 opzioni, lessico «indicazioni», effetti distinti sul motore, prova del rosso riconosciuta` |
| catalogo-022 | verde (482 s) | — | — | verde | `✅ catalogo-022 verde` |
| schede-246 | rosso (704 s) | rosso (697 s) | rosso (704 s) — **solo 1 difetto su 2** (braccio rosso); il braccio verde sulla 196 è sano | **rosso anche sulla 196, MA il difetto «verde: nessuna scheda comparsa, guardiano cieco» è NATO nella 197** (vedi nota) | `· rosso: il cronometro non corre con la scheda aperta, il difetto non si vede` |
| schede-259 | rosso (1097 s) | rosso (1101 s) | rosso (1146 s; 1ª partenza interrotta dal riavvio, rifatta) | dichiarato (rosso anche sulla 196) | `❌ ROSSO — C verde: partite non finite o errori` |
| schede-260 | rosso (2010 s) | **non completata** (interrotta dal riavvio del container alle 00:2x) | non eseguita | **incompleto** — 1 rosso su 1 valida | `· rosso: la scheda non compare mai fuori dal gioco, il difetto non si vede` |
| tecnica-045 | non eseguita | — | — | **non eseguita (tetto del blocco)** | — |
| esiti-60 | non eseguita | — | — | **non eseguita (tetto del blocco)** | — |

## Note e casi da decidere (dal registro delle corse)

- **intervista-231**: identico nelle tre corse (1ª, 2ª, 196): in tutti e quattro i bracci (verde, rosso `__CPM_NO_IV231`, nazionale verde, nazionale rosso `__CPM_NO_IV243`) la partita resta in `playing` (fermata fra il 51' e l'85') e non arriva al fischio, quindi nessuna intervista viene giudicata. È un rosso dello strumento/percorso già presente sulla 196, non della funzione intervista in sé (nessuno dei bracci arriva al punto da giudicare). Da valutare (non deciso qui): se la sonda sfora un suo tempo interno su questa macchina. Durata ~31 min per corsa, sotto il tetto di 40.
- **schede-246, prima partenza (22:07) NON VALE**: la mia catena di esecuzione ha raggiunto il suo tetto di 2 ore e ha chiuso il browser a metà (`browser.newPage: Target page, context or browser has been closed`), senza esito. Non contata né come 1ª né come 2ª: rifatta da capo.
- **schede-246** — ⚠️ caso da decidere dal PO: rosso su entrambe le versioni, ma NON con la stessa firma.
  - 197 (1ª e 2ª identiche): braccio VERDE `fine true · schede a schermo 0 · arrivate al motore 0 [] · timer armati/scaduti 0/0` → «verde: nessuna scheda comparsa, guardiano cieco»; braccio ROSSO uguale → «rosso: il cronometro non corre con la scheda aperta, il difetto non si vede».
  - 196: braccio VERDE `schede a schermo 2 · arrivate al motore 2 ["eroe_stanco@55a","sotto_finale@70a"] · aperte ["55-55","70-70"]` → sano; fallisce SOLO il braccio rosso (stessa riga della 197).
  - Quindi: il rosso del braccio rosso è DICHIARATO (c'era sulla 196); la scomparsa delle schede nel braccio verde è NATA nella 197 (2 su 2 sulla 197, 0 su 1 sulla 196). Per la regola PO-516 questo secondo difetto bloccherebbe l'uscita; non decido io.
- **schede-259 sulla 196, prima partenza (23:23) NON VALE**: il container è stato riavviato a metà corsa (uptime 0 alle 23:27); rifatta da capo.
- **schede-259**: rosso «C verde: partite non finite o errori» su tutte e tre le corse valide. 197: 3/4 partite finite in entrambi i bracci (p3 ferma sullo 0-2). 196: 1/4 finite e in più «riga di riepilogo mancante». Classificato dichiarato. ⚠️ Osservazione, non conclusione: sulla 197 nel braccio verde p0 e p1 FINISCONO con **0 schede** (2 corse su 2), mentre sulla 196 ogni partita verde tranne p3 ha avuto almeno una scheda. È lo stesso sintomo del braccio verde di schede-246 (schede che non compaiono), ma qui il controllo non lo giudica come difetto separato: lo segnalo perché il PO lo valuti insieme a schede-246.
- **schede-260**: 1ª corsa (23:46, 2010 s, sotto il tetto) rossa con due difetti: «verde Prova Neri 3: partita non finita» (la partita «Prova Neri 3» resta `fine false` con 0 schede in ENTRAMBI i bracci) e «rosso: la scheda non compare mai fuori dal gioco, il difetto non si vede» (braccio rosso cieco). La 2ª corsa (partita alle 00:20) è stata uccisa dal secondo riavvio del container (uptime 0 alle 00:38): non vale. Sulla 196 non eseguita. **Classificazione impossibile**: manca la riprova e il confronto con la 196.
- **Tetto del blocco**: inizio ~19:50, fermato alle 00:39 (~4 h 50 min, oltre le «circa 4 ore»). Il tempo in più è andato in due riavvii del container (corse perse: schede-259 sulla 196, rifatta; schede-260 2ª) e in un'interruzione della mia catena di esecuzione (schede-246, rifatta). **Restano da fare in un altro blocco**: schede-260 (2ª e, se rossa, sulla 196), tecnica-045, esiti-60.

## Riepilogo

- Verdi (6): tabellino-lati, stat-279, lessico-218, tabellino-228, schede-234, catalogo-022.
- Dichiarati, rossi anche sulla 196 (3): intervista-231, schede-246, schede-259.
- ⚠️ **Da decidere dal PO**: schede-246 è rosso anche sulla 196, ma sulla 197 c'è un difetto in più, NATO nella 197: nel braccio verde le schede non compaiono (0 su 2 corse; sulla 196 ne compaiono 2). Lo stesso sintomo si vede, senza essere giudicato, nel braccio verde di schede-259 (p0/p1 finite con 0 schede sulla 197).
- Incompleti/non eseguiti (3): schede-260 (1 rosso su 1 valida), tecnica-045, esiti-60.
- Nessun file di `src/` o `tests/` modificato; nessuna foto in docs/ rigenerata è rimasta modificata (`git status` pulito dopo ogni corsa).
