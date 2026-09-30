# Prompt per Codex — Collaudo carriere lunghe (varietà, coerenza, conseguenze, nazionale, difficoltà, economia)

Scheda nuova: una «scheda collaudo carriere» precedente **non esiste** nel repo (`docs/codex/SCHEDE.md` ha
solo le schede 0, 1 e 2). Questa la sostituisce e copre il prompt PO «La carriera fuori dal campo» del 30/09.
Solo misura: nessuna proposta di codice, nessuna modifica al gioco.

## Base
- Ramo `main`, ultimo commit (dichiaralo nel rapporto; alla stesura: CPM 7.999.83).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO su `codex/2026-10-collaudo-carriere`.

## Strumenti già nel gioco (solo con `?cpmtest=1`)
`window.__CPM_CAREER` (`src/18-career-app.jsx:1205`):
- `step()`: vive, simula o fa avanzare una settimana (con `window.__CPM_SIM_NAT=1` simula anche i tornei della nazionale);
- `startNewSeason()`, `patch(obj)`, `get()`, `snapshot()`, `playMatch()`.
Esempi di uso: `tests/visual/career-sim-test.mjs`, `tests/visual/career-nat-sim-test.mjs`.
Harness: `tests/visual/lib/harness.mjs` (`startServer`, `launchBrowser`, `installCdnRoutes`).
Ambiente: `CPM_CHROME` sul Chromium locale; mai `npx playwright install`.

## Campione
- **60 carriere × 10 stagioni** (se il tempo non basta: 30 × 10, dichiaralo).
- Combinazioni, bilanciate: 3 ruoli (attaccante, centrocampista, difensore) × 3 punti di partenza
  (nazione/club di prestigio basso, medio, alto) × 2 stili di scelta negli impulsi (sempre la prima opzione;
  scelta casuale seedata) — più 6 carriere «giocate male» (scelte peggiori, partite perse) come controllo.
- Seed dichiarati; ogni carriera rieseguibile.
- Pagina nuova per ogni carriera.

## Metriche

### 1. Varietà
Per carriera e aggregate: impulsi (`WEEKLY_IMPULSES`), eventi (`WEEKLY_EVENTS`, `WEEKLY_RANDOM_EVENTS`,
`VITA_EVENTS`, `SPOGLIATOIO_MOMENTS`, `CAREER_MOMENTS`) **distinti visti per stagione e in carriera**;
ripetizioni; **stagione della prima ripetizione**; voci **mai uscite** in nessuna carriera; le 10 voci
**più frequenti**; settimane senza nessun contenuto.

### 2. Coerenza (regole automatiche, una per riga del rapporto con conteggio e 3 esempi)
- C1 impulso/evento «da titolare» o «protagonista» a un giocatore con 0 minuti nelle ultime 3 partite o `squadRole` fuori rosa/riserva;
- C2 «crisi / momento difficile» durante una serie di 4+ vittorie, o «momento d'oro» durante 4+ sconfitte;
- C3 riferimenti a gol/assist («il tuo gol…») senza gol/assist nell'ultima partita;
- C4 contenuto da professionista in Primavera o viceversa;
- C5 contenuto da infortunato mentre è sano, o da sano mentre è infortunato;
- C6 riferimenti al capitano a chi non è capitano; alla nazionale a chi non ha presenze;
- C7 club/avversario citato che non esiste nel calendario o nella lega;
- C8 due contenuti contraddittori nella stessa settimana.
Proponi altre regole che trovi dai testi, marcandole come proposte.

### 3. Conseguenze
Per ogni scelta di impulso: variazione di morale, forma, popolarità, fiducia del mister, valore, banca,
chimica, minuti giocati e `squadRole` **dopo 1, 5 e 20 settimane** rispetto a un gemello identico che ha
scelto l'altra opzione (stessa carriera, stesso seed, biforcata). Almeno 20 biforcazioni.

### 4. Nazionale
Età della prima convocazione; presenze per stagione; **settimane del calendario** in cui cadono le
convocazioni (istogramma); avversari e loro livello; tornei (qualificazioni, fasi finali); presenze
dell'eroe contro quelle dei compagni NPC; tutto per nazione e livello della nazionale.
Riferimenti reali **con fonte citata** (per esempio presenze in nazionale per età dei giocatori di vertice);
senza fonte verificabile scrivi «non verificato».

### 5. Difficoltà
Distribuzione per età di OVR, gol, assist, trofei, valore, stipendio, per ruolo, partenza e stile.
Classifica ogni carriera: **dominante** (≥ 3 campionati o OVR ≥ 88 prima dei 26 anni), **fallita**
(OVR < 70 a 25 anni o fuori dal professionismo), **normale** (il resto) — con le soglie esplicite nel
rapporto, così il PO le può discutere.

### 6. Economia e Ufficio
Effetto misurato di: staff privato (4 figure × 3 livelli), accademia, investimenti (3 profili), beni.
Stesso metodo del punto 3: gemello con e senza la voce, differenza su OVR, infortuni, morale, popolarità,
banca a 1, 3 e 10 stagioni.

### 7. Stabilità
Errori JavaScript (`pageerror`, `console.error`) raccolti in ogni carriera; carriere che si bloccano
(settimana che non avanza per 3 `step()` di fila); salvataggi falliti.

## Rapporto
`reports/codex/2026-10-collaudo-carriere.md`: una sezione per metrica, tabelle, i 10 problemi più gravi con
il comando per riprodurli. Dati grezzi compressi in `tests/codex/collaudo-carriere.json.gz`.

## Regole
Italiano. Non inventare: dove non si può misurare, «non verificato». Nessuna conclusione su FPS o
fluidità. Le anomalie restano ipotesi finché il team non le riproduce.
