# Prompt per Codex — Collaudo numerico: goleade e credibilità del risultato (PO-021, PO-035)

Il PO ha visto più volte risultati assurdi (7-0, 10-0) e chiede che risultati, tiri, possesso e falli siano coerenti con la forza delle squadre. Il team ha un guardiano (`npm run goleade`, 200 partite 95 contro 50, motore senza grafica) che è verde. Serve un collaudo **indipendente**, con più accoppiamenti e sul percorso vero della carriera, per sapere se la coda di goleade è chiusa davvero.

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION`, deve essere ≥ 7.999.96).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-goleade-credibilita`. Non toccare `src/`, `tools/`, `prototipo/`, altri test, `main`.

## Parte A — motore senza grafica (veloce)
Usa lo stesso motore del guardiano (`prototipo/partita-vera/motore-v2.js` + `partita.js`, `creaPartita({... v2:true, seed, casa:{forza}, ospite:{forza}, eroeLato:'home'})`, `P.tuttaSubito()`), come in `tests/visual/goleade-test.mjs`.
- Accoppiamenti di forza: 50-50, 60-50, 70-50, 80-50, 95-50, 95-80, 50-95 (l'eroe nella squadra debole).
- **100 partite per accoppiamento**, seed diversi e annotati.
- Per ogni accoppiamento: gol medi per lato, distribuzione dei risultati (tabella dei 10 più frequenti), quota di partite con 7+ gol di una squadra, quota con scarto ≥ 5, tiri, tiri in porta, possesso, falli se il motore li espone (altrimenti «non esposto»).

## Parte B — partita vera nel gioco (lenta, poche)
Con `?cpmtest=1`, gioca **20 partite di carriera** in autoplay (`__CPM_AUTOPLAY(true)`), avversari diversi (passa `name` diverso a ogni partita: il seed nasce da avversario+stagione+settimana+nome). Per ognuna: risultato da `__CPM_SCORE`, forza delle due squadre se leggibile, gol per percorso dal registro `window.__CPM_EV` (`microsim` / `cronaca` / `highlight` / `setpiece`).

## Domande
1. Esiste ancora una coda di goleade (7+ gol o scarto ≥ 5) e in quali accoppiamenti? Riporta i seed per riprodurla.
2. Il favorito vince con una frequenza credibile? (indica le percentuali V/N/P per accoppiamento; non dare giudizi senza numeri)
3. Nella parte B, quale percorso produce i gol in eccesso, se ce ne sono?
4. Partite 50-50: quante finiscono 0-0, quante con 5+ gol totali?

## Rapporto
`reports/codex/2026-10-01-goleade-credibilita.md`: una tabella per accoppiamento, la lista dei seed anomali, verdetto **coda presente / assente / non misurabile**. Grezzo in `tests/codex/goleade-credibilita.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Nessun giudizio di «credibile» senza il numero accanto. Le anomalie restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi.
