# Rapporto collaudo carriere L6 — fase 1 (PO-153) e goleade eroe (PO-190)

**Data:** 15/10/2026 · **Ramo:** `collaudo/carriere-l6` · **Gioco:** GAME_VERSION 7.999.169 (letta da `CARRIER-MANAGER-AV.html` a runtime)
**Browser:** Chromium 1194 via `CPM_CHROME=/opt/pw-browsers/chromium` (headless, swiftshader). Non è il fallback Chrome dell'harness.
**Modalità:** sola misura. Nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`. Nessuna proposta di correzione alla zona G.
**Dati grezzi:** `docs/collaudi/dati-carriere-l6/` — un JSON per carriera (`carriera-00…29.json`), `riepilogo.json` (aggregazione), `goleade-po190-save190-sim.json` (PO-190).
**Script:** `tests/visual/collaudo-l6/` — `career-run.mjs`, `goleade-run.mjs`, `riepilogo.mjs`, `probe.mjs`, `probe-opening.mjs`.

---

## 0. Come leggere questo rapporto

- **Difetto verificato**: ha una prova riproducibile (numero dai dati grezzi, riga di sorgente o sonda).
- **Impressione / da verificare**: un dato che non so ancora spiegare, o che sta solo in un'interpretazione. Non lo tratto come fatto.
- **Non posso confermarlo**: affermazioni che i dati raccolti non permettono di fare.

---

## 1. Campione

| Voce | Valore |
|---|---|
| Carriere | **30** (tutte completate, 10 stagioni ciascuna) |
| Stagioni simulate | **300** |
| Fine carriera | `ok` su 30/30 |
| Errori JavaScript (`pageerror`) | **0** su 30 carriere |
| Partite registrate | 10 988 |

**Limiti del disegno (da leggere prima dei numeri):**

1. **Nessuna carriera creata dalla creazione normale.** Tutte partono da un salvataggio sintetico iniettato (`cpm-v3`, `phase:'career'`, club e OVR scelti). Il percorso di creazione naturale **non è stato eseguito**: non posso confermare nulla sul suo comportamento.
2. **Confondenti non separabili.** Nel disegno, `archetipo = ARCH[k%12]`, `ruolo = ROLES[k%4]`, `livello = TIERS[k%3]`. Poiché 3 e 4 dividono 12, archetipo, ruolo e livello di club sono **determinati dallo stesso indice**: si combinano in soli 12 gruppi, ognuno di 2–3 carriere. Ogni confronto per archetipo o per ruolo è quindi anche un confronto per livello di partenza. **Non posso separare l'effetto dell'archetipo da quello del club.**
3. **Nazionale simulata.** Ogni run gira con `window.__CPM_SIM_NAT=1` (le partite della Nazionale si simulano col bottone «Simula»). Il percorso con la Nazionale giocata dall'utente non è coperto.
4. **Percorso sim, non partita live.** Le partite misurate sono quelle simulate dal gioco (`simulateMatch`). Non ho giocato partite live: tiri e xG non sono misurati (vedi §5).
5. **Ruolo.** Il ruolo è assegnato nel salvataggio sintetico. Non ho verificato che il gioco cambi davvero il ruolo in campo: non posso confermarlo.

---

## 2. Impulsi ed eventi (PO-154)

| Misura | Valore | Fonte |
|---|---|---|
| Eventi impulso osservati | **3 760** in 300 stagioni (media 12,5 per stagione) | `impEvents` |
| Impulsi unici per carriera | media **90,3** (su un catalogo di **106** voci) | `riepilogo.json` |
| Ripetizioni (stesso id nella stessa carriera) | **1 052** su 3 760 (≈28%) | `riepilogo.json` |
| Eventi con id senza condizione (`cond`) | **1 763** su 3 760 (≈47%) | catalogo `WEEKLY_IMPULSES` |
| Voci del catalogo senza condizione | **40** su 106 | catalogo |

**Note di metodo:**
- Un evento è registrato quando cambia l'ultimo id di `recentImpulses`. Due impulsi identici consecutivi possono quindi non essere contati: le ripetizioni sono **un limite inferiore**.
- Le conseguenze visibili (morale, fiducia, popolarità) per impulso **non sono misurate**: non ho fatto coppie biforcate (punto 4 del collaudo Codex). Non posso confermare l'effetto degli impulsi sul gioco.

**Difetto verificato (catalogo):** 40 impulsi su 106 non hanno condizione. Quando un impulso senza condizione è scelto, la sua comparsa non dipende dallo stato del giocatore. Ciò conferma la premessa di PO-154 («46 impulsi su 112 non hanno condizioni»), con i numeri di questa versione.

---

## 3. Nazionale (PO-155)

| Misura | Valore |
|---|---|
| Stagioni con schermata di convocazione (`nationalCallup`) | **0** su 300 |
| Stagioni con presenze in Nazionale (campo `nationalCaps` cumulato) | **109** su 300 |
| Presenze cumulate massime in una carriera | **20** |

**Difetto verificato:** in 300 stagioni la schermata di convocazione non è mai comparsa, eppure le presenze si accumulano. Con `__CPM_SIM_NAT=1` il percorso delle partite simulate può aggirare la convocazione: **non posso confermare** che nel gioco giocato dall'utente le convocazioni non avvengano. Quello che è verificato è che nel percorso misurato la convocazione non passa dalla schermata.

Non ho misurato età e OVR alla prima convocazione (nessuna convocazione registrata).

---

## 4. Difficoltà per fascia d'età e livello (PO-156)

Medie per stagione (fonte `riepilogo.json`):

| Fascia d'età | Stagioni | OVR medio | Gol eroe | Assist | Voto medio | Trofei (campo `trophies`) |
|---|---|---|---|---|---|---|
| Gavetta 17–20 | 40 | 74 | 8,25 | 4,4 | 5,96 | 0,10 |
| Affermazione 21–25 | 131 | 80 | 3,69 | 2,12 | 5,82 | 0,44 |
| Élite 26–30 | 110 | 84 | 0,24 | 0,22 | 5,69 | 1,01 |
| Declino 31+ | 19 | 83 | 0 | 0 | 5,77 | 1,21 |

| Livello di partenza | Carriere | OVR medio | Gol eroe/stagione | Posizione media in classifica | Voto medio |
|---|---|---|---|---|---|
| Debole (club prestigio 48) | 10 | 75 | 1,98 | 14,0 | 5,62 |
| Media (prestigio 60) | 10 | 81 | 1,86 | 16,4 | 5,53 |
| Forte (prestigio 95) | 10 | 87 | 4,56 | 4,1 | 6,22 |

(«Carriere» = 100 stagioni per livello.)

**Note:**
- **Titolare %**: **non misurato**. Il campo `minutesPlayed` è assente nelle partite simulate. Il dato «titolari» della tabella è in realtà il numero di partite della stagione (≈36).
- **«Dominanti» e quando**: non misurato. Non ho definito la soglia.
- **Trofei**: il campo `trophies` è letto come conteggio, ma non ho verificato se è cumulativo. Non posso confermarlo.
- **Impressione (non verificato):** il dislivello tra livelli è netto e in linea con il club di partenza. Il confondente di §1.2 rende impossibile attribuire la differenza al club piuttosto che all'archetipo.

---

## 5. PO-190 — goleade dell'eroe

### 5.1 Carriere (300 stagioni, 10 988 partite, percorso sim)

| Misura | Valore |
|---|---|
| Gol eroe per partita | **0,08** |
| Gol squadra per partita | **1,00** |
| Gol subiti per partita | **1,26** |
| Quota gol eroe / gol squadra | **7,7%** |
| Risultati con 5+ gol per la squadra | **60** su 10 988 |
| Risultati con 7+ gol | **0** |
| Scarti di 5+ gol | 137 |

Su queste carriere la quota dell'eroe è bassa per costruzione: l'eroe parte da OVR 60–76, non da 93. **Non confrontabile con l'obiettivo PO del 50%**, che riguarda l'eroe forte.

### 5.2 Salvataggio 190 (20 partite, percorso sim)

File: `docs/collaudi/dati-carriere-l6/goleade-po190-save190-sim.json`.

| Misura | Valore |
|---|---|
| Partite | 20 |
| Gol eroe per partita | **0,6** |
| Gol squadra | **29** (1,45 per partita) |
| Quota gol eroe / gol squadra | **41,4%** (obiettivo PO ≈50%) |
| Gol subiti | 15 |
| Risultati con 5+ gol per la squadra | **0** |
| Tiri e xG | **non misurati** (vedi sotto) |

**Il campione è piccolo (20 partite).** La quota del 41% non dimostra né la conferma né la smentita dell'obiettivo del 50%.

### 5.3 Cosa non posso confermare su PO-190

- **Tiri e xG**: il percorso sim (`simulateMatch`) restituisce solo punteggi, gol, assist, voto. Non c'è dato di tiro. I «15 tiri e xG 3,42» di PO-190 vengono dalla partita live, che non ho eseguito. **Non posso confermarli né smentirli.**
- **Partite live**: il gioco ha una partita live (`LiveMatch`). Il collaudo non l'ha giocata.
- **Il guardiano `goleade` esistente** (`tests/visual/goleade-test.mjs`) misura il motore del prototipo (`prototipo/partita-vera/`), non il motore del gioco. Il suo verde non dice nulla sul gioco. **Impressione (da verificare):** il PO-190 potrebbe nascere dal motore del gioco e non dal prototipo.
- **Foto**: non ne ho scattate.

### 5.4 Coerenza `homeScore` / `awayScore` (verificato)

Su 1 105 partite (campione precedente) il gol dell'eroe (`goals`) non supera mai `homeScore` in trasferta né in casa; supera `awayScore` 36 volte. Quindi **`homeScore` è il gol della squadra dell'eroe, in casa e in trasferta; `awayScore` è l'avversario**. È il mapping usato in questo rapporto. Non ho verificato come la UI etichetti le due colonne: non posso confermarlo.

---

## 6. Economia e Ufficio (PO-157)

| Misura | Valore |
|---|---|
| Saldo bancario, variazione per stagione | **+210 600 ogni stagione nelle prime tre** (1→2→3) |
| Stagioni con variazione zero | **210 su 270** (≈78%) |
| Voci nel registro `ledger` | **0** in tutte le 30 carriere |

**Difetto verificato (saldo):** il saldo cresce nelle prime tre stagioni e poi resta fermo nella stragrande maggioranza delle carriere (es. carriera 00: 210 600 → 415 800 → 626 400 → 626 400). **Non posso confermare la causa**: non ho verificato se sia un tetto, la fine di un'entrata o un effetto del percorso sim.

**Non misurato (economia):** entrate e uscite per voce, investimenti, staff, accademia, sponsor. Il registro `ledger` è vuoto perché nessuna carriera ha fatto investimenti: l'effetto dell'Ufficio **non è stato testato** (PO-157 chiede proprio questo). Non posso confermare che le voci dell'Ufficio non abbiano effetto.

**Gemelli economici** (punto 5 del collaudo Codex): non eseguiti.

---

## 7. Anomalie di dati: da verificare, non ancora classificate

Questi numeri sono reali nei dati grezzi, ma **non so ancora spiegarli**. Non li tratto come difetti.

| Anomalia | Conteggio | Stato |
|---|---|---|
| Stagioni in cui due partite cadono nella stessa settimana | **268** su 300 stagioni-settimana | Il riepilogo non salva il campo che distingue la competizione (coppa/Europeo): non posso classificarle. Dalle righe grezze di due partite per stagione emerge un flag `euro` su alcune righe: **non posso confermare** se sia la causa. |
| Esito `won` diverso da `homeScore > awayScore` | 128 su 10 988 | Non classificato (stesso motivo). |
| Esito `drew` diverso da `homeScore === awayScore` | 123 su 10 988 | Non classificato. Possibile causa: rigori nelle coppe. |
| Classifica di campionato diversa dalla somma delle partite | **265** su 300 stagioni | Probabile: la classifica conta solo il campionato, mentre `matchHistory` include le coppe. **Non confermato.** |

**Nota su PO-190 (fuori di PO-190):** nel primo run del salvataggio 190 il ciclo si fermava su `opening-resolved` (1 174 passi su 1 501). Ho verificato la causa (§8, difetto 1): è nell'harness, non nel gioco.

---

## 8. Difetti verificati

### Difetto 1 — il wizard d'apertura non si chiude per la voce «addio» (harness, non gioco)

- **Prova:** `probe-opening.mjs` sul salvataggio 190. A S18W1 `openingPending()` restituisce `["addio"]` e `resolveOpening()` non la rimuove: 25+ passi consecutivi `opening-resolved`, poi blocco.
- **Sorgente:** `CARRIER-MANAGER-AV.html:45799` aggiunge `addio` quando `age ≥ 34` e `retireAskedSeason < stagione`. `resolveOpening` (`:46279`) non imposta `retireAskedSeason`.
- **Impatto sul campione A:** **nessuno.** Nessuna delle 30 carriere ha raggiunto i 34 anni (età massima 33).
- **Impatto sul run PO-190:** blocca il run. Risolto nel runner con un'iniezione dichiarata (`retireAskedSeason = stagione`) a ogni voce `addio`.
- **Non posso confermare** che la UI reale chiuda correttamente la voce «addio» dopo il ritiro: il collaudo non ha percorso quella strada.

### Difetto 2 — (vedi §6) saldo fermo dopo la terza stagione

Verificato sui dati, causa non nota (vedi §6).

### Impressioni (non verificate)

- Il dislivello tra livelli di club (OVR, posizione, gol eroe) è netto. Non è separabile dall'archetipo (§1.2).
- La quota di gol dell'eroe nel salvataggio 190 (41%) è vicina all'obiettivo PO, ma il campione è di 20 partite.

---

## 9. Confronto con il rapporto del 01/10 (7.999.86)

Ho cercato il rapporto del 01/10 (7.999.86) con grep su `docs/`: `docs/governo/` lo cita (ROADMAP, BACKLOG) ma non ho trovato il file del rapporto con i numeri di partenza. **Non posso confermare** cosa sia cambiato rispetto a quel rapporto.

La correzione «fine prestito `parentClub`» citata nel rapporto non è stata testata direttamente: nessuna carriera ha fatto un prestito. Non posso confermare che sia risolta.

---

## 10. Fuori perimetro

Una sola riga, come richiesto: le partite sim non mostrano tiri, quindi il dato xG non esiste nel percorso misurato.

---

## 11. Chiusura

**Zona G (fase 1 PO-153): NON CHIUSO.**

Motivi, in una riga ciascuno:
- Il campione è di 30 carriere, ma tutte da salvataggi sintetici; la creazione naturale non è stata testata.
- Archetipo, ruolo e livello di club sono confusi nel disegno: l'effetto degli archetipi non è separabile.
- Economia e Ufficio non sono stati testati (registro `ledger` vuoto): PO-157 resta aperto.
- Nazionale: la convocazione non è mai comparsa nella schermata misurata, con la Nazionale simulata.
- Le anomalie in §7 (settimane doppie, `won`/`drew`, classifica) non sono ancora classificate.
- PO-190: tiri e xG non misurati; 20 partite sim non bastano a chiudere l'obiettivo del 50%.

---

## 12. Cosa resta da fare (diagnosi, non correzioni)

1. Ripetere il disegno senza confondenti: archetipo, ruolo e livello indipendenti.
2. Aggiungere al riepilogo il campo che distingue la competizione, per classificare le settimane doppie e gli esiti `won`/`drew`.
3. Eseguire il percorso di creazione naturale su almeno 10 carriere.
4. Giocare alcune partite live per misurare tiri e xG (PO-190).
5. Eseguire investimenti e staff per testare l'Ufficio (PO-157).
6. Verificare nel gioco reale la chiusura della voce «addio» dopo il ritiro.
