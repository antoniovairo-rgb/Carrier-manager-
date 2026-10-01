# Prompt per Codex — Riprova dei 6 rilievi della revisione 7.999.26–27 (PO-172)

Il 27/09 la tua revisione del codice (ramo `codex/2026-09-27-revisione`, ec2d2a66) ha segnalato 6 rischi, nessuno riprodotto. Il PO chiede di riprovarli sulla build attuale, cercando questa volta una **riproduzione** (passi, seed, scena) per ognuno o la prova che non è più possibile.

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION`, deve essere ≥ 7.999.96).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-rilievi-26-27`. Non toccare `src/`, `tools/`, altri test, `main`.

## I sei rilievi
- **26-A** il crossatore dichiarato dal motore è diverso dal corpo che anima il cross.
- **26-B** `_ORIG26` (variabile globale, `src/11-ui-kit-highlight.jsx` attorno alla riga 1562) può sopravvivere al cambio di partita senza ricaricare la pagina.
- **26-C** nello stesso minuto la scheda dell'highlight può aprirsi con i dati di un'altra occasione.
- **26-D** scena extra senza il tetto di 8 highlight (dalla 7.999.28 il cross consuma il bersaglio; i piazzati restavano fuori dal tetto).
- **27-A** la punizione dal limite diventa scena prima del sorteggio tiro/cross del motore.
- **27-B** catalogo di rigori/punizioni esaurito → scheda non coerente.

## Per ognuno
1. Rileggi il codice attuale: il punto segnalato esiste ancora? (file:riga)
2. Prova a riprodurlo nel gioco con `?cpmtest=1`: partite in autoplay (`__CPM_AUTOPLAY(true)`), nomi diversi per seed diversi, e per 26-B due partite di fila **sulla stessa pagina** senza ricaricare. Usa il registro `window.__CPM_EV` e `__CPM_TIMELINE()` per confrontare ciò che il motore dichiara con ciò che la scena mostra.
3. Per 26-D conta gli highlight per partita su almeno 30 partite: ne esiste una con più di 8?
4. Per 27-B indica quante punizioni/rigori servono per esaurire il catalogo e se in una partita vera ci si arriva.

## Rapporto
`reports/codex/2026-10-01-rilievi-26-27.md`: una riga per rilievo con **riprodotto (con passi) / non riprodotto (con il numero di tentativi) / non più presente nel codice (file:riga)**. Grezzo in `tests/codex/rilievi-26-27.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Le anomalie restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi.
