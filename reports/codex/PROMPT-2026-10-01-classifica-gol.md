# Prompt per Codex — Classifica: gol fatti e gol subiti che non tornano (PO-175)

Nel tuo collaudo carriere (rapporto `reports/codex/2026-10-collaudo-carriere.md`, ramo `codex/2026-10-collaudo-carriere`) hai visto in tre carriere che nella stessa lega la somma dei gol fatti è diversa dalla somma dei gol subiti (semi 17, 35, 4), e il seme 17 si riproduce identico. Ora serve trovare **dove nasce** lo scarto, senza toccare il gioco.

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION`). Se il difetto non si riproduce più, dillo e fermati lì.
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-classifica-gol`. Non toccare `src/`, `tools/`, altri test, `main`.

## Cosa fare
1. Riproduci il seme 17 con il tuo `tests/codex/career-matrix.mjs` (stesse impostazioni del rapporto) fino alla prima settimana con scarto (stagione 3, settimana 2 nel rapporto).
2. Per **ogni settimana** dalla stagione 2 settimana 1 fino alla prima settimana con scarto più 3, salva: classifica completa della lega dell'eroe (squadra, giocate, V/N/P, GF, GA), calendario e risultati della giornata, club dell'eroe, eventuali trasferimenti o prestiti.
3. Trova la **prima giornata** in cui la somma GF ≠ somma GA e rispondi:
   - quali squadre hanno GF/GA che non corrispondono ai risultati della giornata;
   - la partita dell'eroe è coinvolta? è contata due volte, una volta sola, o con un punteggio diverso da quello del tabellino?
   - la squadra lasciata dall'eroe (trasferimento a S2/W5 nel rapporto) o quella nuova compare con dati di un'altra lega?
   - lo scarto cresce ogni settimana di quanto? (uguale ai gol di una sola partita?)
4. Ripeti lo stesso sui semi 35 e 4 solo fino alla prima settimana con scarto, per vedere se il meccanismo è lo stesso.

## Rapporto
`reports/codex/2026-10-01-classifica-gol.md`: prima settimana con scarto per seme; tabella delle squadre coinvolte (prima/dopo); partita/e responsabili; ipotesi di meccanismo **etichettata come ipotesi**; comando di riproduzione. Grezzo in `tests/codex/classifica-gol.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Nessuna patch al gioco. Niente credenziali di terzi.
