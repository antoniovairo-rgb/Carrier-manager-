# Prompt per Codex — Salvataggio: cosa cambia davvero al ricaricamento (PO-176)

Nel collaudo carriere hai visto 56 ricaricamenti su 56 con dati diversi (soprattutto `playedMd.s`, `playedMd.md.*`, `cup.club`) e hai scritto «perdita visibile al giocatore: non verificato». Ora serve separare la **rigenerazione prevista** dalla **perdita vera**.

Contesto dal codice (da verificare, non da prendere per buono): `player.playedMd = {s:<stagione>, md:[numeri di giornata giocate]}` (`src/18-career-app.jsx`, righe ~178 e ~616-623).

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION`).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-salvataggio-ricarica`. Non toccare `src/`, `tools/`, altri test, `main`.

## Cosa fare
1. Con il tuo harness, porta 6 carriere (semi 0, 1, 8, 13, 17, 35) a: stagione 1 settimana 10, stagione 2 settimana 1, stagione 3 settimana 20, e subito dopo una partita di coppa.
2. In ognuno dei 4 punti: salva lo stato completo (`localStorage` `cpm-v3` e `__CPM_CAREER.snapshot()`), **ricarica la pagina**, premi Continua, rileggi lo stato.
3. Per ogni campo diverso, classifica:
   - **A — uguale nel significato** (stesso contenuto, ordine o forma diversi);
   - **B — rigenerato** (ricalcolato dal gioco da altri dati salvati, identico nell'effetto);
   - **C — perso o cambiato** (il giocatore vede qualcosa di diverso).
4. Per ogni campo in C, mostra **dove si vede**: foto prima/dopo della schermata interessata (Home, Calendario, Classifica, Coppe, Profilo) con la differenza indicata.
5. Controlla in particolare: le giornate già giocate tornano «da giocare»? La coppa mostra il club giusto? Si può giocare due volte la stessa giornata?

## Rapporto
`reports/codex/2026-10-01-salvataggio-ricarica.md`: tabella campo → classe (A/B/C) → prova; elenco dei C con foto e comando di riproduzione. Grezzo in `tests/codex/salvataggio-ricarica.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Nessuna patch al gioco. Niente credenziali di terzi.
