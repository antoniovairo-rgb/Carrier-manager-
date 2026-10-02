# PO-190 — goleade in carriera avanzata, checkpoint

Base: `origin/main` 8cef5317, `GAME_VERSION="7.999.112"`. **Non ci sono ancora tre carriere naturali misurate** sulla nuova base. I 2,51–3,39 GB liberi osservati durante la preparazione erano sotto la soglia di 3,5 GB per avviare Chromium. I valori del PO (stagione 12, 2,90 GF/partita, 48 gol dell'eroe) sono il motivo del collaudo, non un risultato di questa sonda.

Ho preparato `tests/codex/goleade-carriera-avanzata.mjs` per creare tre attaccanti dal percorso UI senza iniettare salvataggi o attributi iniziali, superare i provini e conservare a ogni passo salvataggio, stagione, settimana, stato del contratto, classifica e cronologia delle partite. Il comando di avvio è:

```powershell
$env:CPM_SEEDS='0,1,2'; node tests/codex/goleade-carriera-avanzata.mjs
```

Il percorso UI dopo le offerte e le stagioni ≥6 è **non verificato** sulla 7.999.112. La prima sonda registra il percorso simulato e conserva il salvataggio all'inizio della stagione avanzata. `tests/codex/goleade-live-avanzata.mjs` è il braccio separato di partita vissuta: ricarica quel salvataggio, chiama `__CPM_CAREER.playMatch()`, usa `__CPM_AUTOPLAY(true,{seed,policy:'seeded'})` e legge `__CPM_EV()` per la fonte di ogni gol. È preparato ma **non eseguito**.

Il calendario di campionato, generato da `generateSeasonCalendar` in `src/09-audio-scout-anagrafiche.jsx`, espone `isHome`; dopo la gara `calendar.result` contiene `homeScore` e `awayScore` (`src/18-career-app.jsx`). La sonda usa questi campi per GF/GA del club, distinguendo casa e trasferta. La correttezza della classificazione sui dati effettivi resta **non verificata**. Gol per fonte, quota dell'eroe, partite con 6+ gol e scarti ≥5 non hanno ancora valori misurati. Eventuali riferimenti al calcio reale richiederanno una fonte verificata nel rapporto finale.

```powershell
node tests/codex/goleade-live-avanzata.mjs
```
