# PO-222 — Titolarità e presenze nelle carriere (SOLO MISURA)

**Build:** `origin/main` 7.999.158 (commit `1a819fb`), ricomposto con `CPM_FORZA_BUILD=1 node tools/build-src.mjs`.
**Dati grezzi:** `po222-dati.json` · **Sonda:** `po222-probe.mjs` (da eseguire in `tests/visual/`, con `CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node po222-probe.mjs`).
**Esito sonda:** 36 giornate simulate, 0 errori di pagina, 0 `error:` dagli handler.

## 1. Cosa è stato misurato

| Carriera | Club (Lega A, da `__CPM_CLUBS`) | Stato di partenza | Giornate simulate |
|---|---|---|---|
| 1 | AC Rossoneri | ruolo `riserva`, fiducia 18, forma 62 | 12 |
| 2 | FC Viola | ruolo `rotazione`, fiducia 55, forma 72 | 12 |
| 3 | FC Sardo | ruolo `titolare`, fiducia 85, forma 80 | 12 |

- Le carriere partono tutte da stagione 2, settimana 1, con club diversi, e si muovono nel tempo sugli handler veri (`__CPM_CAREER.step` → `liveCurrentWeek` / `simulateAndAdvance` / `doAdvanceWeek`).
- Per ogni giornata: decisione dallo stato **pre-partita**, presenze `matches` prima e dopo.
- Totale: **36 partite** (≥30 richieste).

## 2. Risultati

**Presenze accreditate: 36 su 36** (`delta = +1` in ogni giornata).

| Carriera | Titolare | Panchina | Non convocato | Presenze accreditate |
|---|---|---|---|---|
| 1 · AC Rossoneri | 0 | 3 | **9** | 12/12 |
| 2 · FC Viola | 7 | 5 | 0 | 12/12 |
| 3 · FC Sardo | 12 | 0 | 0 | 12/12 |
| **Totale** | **19 (52,8%)** | **8 (22,2%)** | **9 (25,0%)** | **36/36** |

Presenze per tipo di decisione: titolare 19/19 · panchina 8/8 · **non convocato 9/9** accreditate.

**Quota reale di titolarità: 52,8%** (19/36), calcolata sulla decisione del motore. Vale solo per queste tre carriere e per 12 giornate ciascuna.

**Minuti giocati: non disponibili** sul percorso di simulazione. Il campo `minutesPlayed` viene scritto solo dalla partita dal vivo (`CARRIER-MANAGER-AV.html:36138`). Nelle 36 partite simulate non è mai presente.

**Campo `matchStatus`: `null` prima e dopo la simulazione in tutte le 36 giornate.** Il gioco scrive `matchStatus` solo quando il giocatore conferma la partita dal prompt (`CARRIER-MANAGER-AV.html:44970`). Sul percorso simulato non viene mai scritto.

## 3. Come è stata letta la decisione: NON dall'interfaccia

⚠️ La richiesta chiedeva la decisione «letta dall'interfaccia». **Non è stata letta dal DOM.** La sonda chiama `calcCoachDecision(snapshot, calcMatchWeight(...))` sullo stato pre-partita, cioè le stesse funzioni che il gioco usa per il prompt (`CARRIER-MANAGER-AV.html:7455` e `:7500`). Il valore è il risultato della funzione, non il testo mostrato a schermo. Non ho aperto il prompt partita. Non posso confermare che il testo a schermo coincida in ogni caso (la funzione è deterministica nel campo `status`; `entryMinute` usa `Math.random`, ma non entra nel conteggio).

Anche la simulazione non è stata fatta con il click dell'utente: la sonda chiama la stessa funzione che l'handler usa (`CARRIER-MANAGER-AV.html:45293` → `simulateAndAdvance`). Il bottone visibile, «⚡ Simula partita (non convocato)», chiama la stessa funzione (`:50558`): l'equivalenza è verificata sul codice, non sul click.

## 4. Quanti «non convocato» accreditano la presenza

**9 su 9 casi di «non convocato» accreditano la presenza** (`matches +1`) sul percorso simulato. Tutti e 9 i casi vengono dalla carriera 1 (fiducia 18).

Il caso è reale anche per l'utente: il bottone «⚡ Simula partita (non convocato)» (`CARRIER-MANAGER-AV.html:50558–50559`) è mostrato proprio quando il mister non convoca e chiama `simulateAndAdvance()`.

**Non ho misurato il percorso «Gioca la partita» con un non convocato**, cioè dal vivo. Dal codice: lo stato `not_called` esce subito con notifica e nessuna gara (`CARRIER-MANAGER-AV.html:44970–44974`). Questo è lettura di codice, non misura.

Il confronto con «5/5 su profili sintetici» (Codex, giro 4) **non posso confermarlo**: non ho consultato quei rapporti in questa sessione.

## 5. Punto del codice che accredita la presenza (causa ipotizzata)

- `simulateAndAdvance` è definita a `CARRIER-MANAGER-AV.html:47061`.
- Il ramo di lega accredita la presenza a `:47206`: `matches:(p.matches||0)+(p.contractExpired?0:1)`. L'unica condizione è lo svincolo (`contractExpired`), non la decisione.
- Nel corpo di `simulateAndAdvance` (righe 47061–47215) **non compaiono** `calcCoachDecision`, `matchStatus` o `coachDecision`. Le uniche chiamate a `calcCoachDecision` sono a `:44267`, `:44270` e `:44970`, tutte nel percorso del prompt partita.

**Ipotesi (non verificata a fondo):** il percorso di simulazione è stato scritto come «la partita si gioca fuori dal campo» e non ha mai ricevuto il controllo della convocazione. La presenza viene quindi accreditata a prescindere dalla decisione. Per confermarla servirebbe: (a) misurare il percorso dal vivo con un non convocato; (b) capire se `matches` alimenta classifica, statistiche o soglie di contratto.

## 6. Limiti dichiarati

- **Tre carriere, una stagione ciascuna** (stagione 2, settimane 1–13, 12 giornate giocate per carriera). Non è un campione statistico della popolazione.
- **Salvataggi costruiti a mano** nel formato di `career-sim-test.mjs` (oggetto `cpm-v3` con club reale della Lega A), non generati dalla schermata di creazione. Non sono quindi carriere partite da zero.
- **Non è stata misurata** la partita dal vivo, né il prompt partita come schermata. La decisione è letta dallo stato, non dal DOM.
- **Non è stato misurato** `totalMatches`: la sonda legge solo `matches`.
- `delta` è la differenza di `matches` prima/dopo **una** chiamata a `step()` che restituisce `simulated`. Nessuna altra scrittura sullo stesso passo è stata isolata.

## 7. Come riprodurre

```bash
cd tests/visual && npm install
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node po222-probe.mjs > po222-dati.json
```

Su `origin/main` 7.999.158. Il numero di giornate per carriera si regola con `PO222_PER_SAVE` (default 12).
