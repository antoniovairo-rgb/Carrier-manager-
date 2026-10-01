# Prompt per Codex — Nuovo collaudo degli highlight (PO-133)

Il tuo collaudo highlight di fine settembre era arrivato parziale (il team ha corretto solo la chiamata `waitForFunction` dell'harness, release 7.999.69). Da allora sono uscite molte correzioni sulle scene (7.999.79–7.999.96). Il PO chiede di rifarlo da capo sulla build attuale, con una scheda uguale per ogni scena.

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION`, deve essere ≥ 7.999.96).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-ricollaudo-highlight`. Non toccare `src/`, `tools/`, altri test, `main`.
- `?cpmtest=1`, `window.__CPM_PRESENT=1`, CH38 acceso. Pagina nuova per ogni scena (una pagina che ripete molte scene falsa i valori assoluti). Su GPU se puoi; se lavori in headless dichiaralo e misura con `window.__CPM_DTREAL=1`.

## Campione
30 scene: **2, 3, 14, 18, 24, 25, 27, 33, 38, 44, 50, 55, 61, 64, 74, 79, 90, 93, 96, 100, 112, 126, 133, 134, 138, 140, 152, 161, 168, 176**. Azione 0, esiti `success` e `fail` (proprietà `window.__CPM_FORCE_OUTCOME`), 1 ripetizione → 60 casi.
Le scene d'attacco passano da `hl_move`: clicca il pulsante «Scegli…» per arrivare a `hl_choose`.

## Scheda per caso (stessi campi per tutti)
1. **Apertura**: a chi è il pallone nel primo fotogramma utile (distanza pallone–piede più vicino, chi è).
2. **Coerenza esito**: l'esito dichiarato (`__CPM_STATE().act`) corrisponde a dove finisce il pallone? (in rete / fuori / al portiere / all'avversario)
3. **Salti**: passi del pallone oltre 2u in 50 ms fuori da uno stacco nero (`__CPM_CUTLIVE()`).
4. **Compagni e avversari**: quanti dei 21 non-eroe restano fermi (spostamento < 0,5u) per tutta la conclusione.
5. **Eroe in quadro**: quota di fotogrammi della conclusione con l'eroe fuori dal quadro.
6. Un **voto di credibilità 1-5** con una frase che lo motiva, dichiarato come **giudizio** e tenuto separato dai numeri.
7. 4 foto: apertura, scelta, conclusione, esito.

## Rapporto
`reports/codex/2026-10-01-ricollaudo-highlight.md`: tabella 60 righe con i campi 1-6, poi l'elenco delle 10 scene peggiori con il motivo. Grezzo in `tests/codex/ricollaudo-highlight.json.gz`. Se il tempo non basta, consegna le scene finite e scrivi in testa quali mancano.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Le anomalie restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi.
