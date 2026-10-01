# Prompt per Codex — Terzo collaudo difesa 3D su CPM 7.999.91

Ripeti il collaudo «difesa 3D» (rapporto `reports/codex/2026-09-30-collaudo-difesa-3d.md`, base 7.999.84) sull'ultimo `main` e dimmi cosa è ancora vero. Dopo la 7.999.84 il team ha rilasciato: 7.999.85 (tabellone del gol subito), 7.999.86 (eroe sopra la scheda), 7.999.88 (portatore e pallone sopra la scheda), 7.999.89 (gi133: pallone 3D fuori quadro), 7.999.90 (gol subito: attaccante e pallone fermi prima del tiro).

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION` nel rapporto).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-ricollaudo-difesa-3d`. Non toccare `src/`, `tools/`, altri test, `main`.

## Casi (stessi della volta scorsa)
Scene 33, 133, 134, 138, 168, 31, 32, 36, 44, 45, 128, 137, 157, 184 e i controlli d'attacco 24 e 2. Azione 0, esiti `success` e `fail` → 32 casi.

## Metodo (come l'ultima volta, più una regola)
- Viewport 412×915, pagina nuova per caso, `__CPM_GLB=true`, `__CPM_PRESENT=1`; `__CPM_FORCE_SIT`, `__CPM_FORCE_OUTCOME`, `__CPM_RESOLVE(0)`; caso valido solo se `ActionResolved` coincide.
- 6 foto per caso (01-apertura … 06-esito).
- **Nuova regola per la foto 01**: i primi ~400 ms della scena sono un taglio al nero voluto. Scatta l'apertura **a 900 ms** dall'avvio della scena; se vuoi, tieni anche quella a 200 ms ma segnala come 001 solo ciò che si vede a 900 ms.
- **Nuova misura per il codice 006 (reparto fermo)**: nei casi `fail` con gol subito, passa `window.__CPM_DTREAL=1` (la scena avanza col tempo reale anche in headless) e riporta per l'esito: posizione del pallone ogni 250 ms prima del tiro e spostamento medio dei giocatori di movimento (`__CPM_STATE().players`) fra il primo e l'ultimo campione.
- Allega `__CPM_DRAFTNOTE` come dato grezzo.

## Rapporto
`reports/codex/2026-10-01-ricollaudo-difesa-3d.md`:
- tabella **7.999.84 → adesso** per ogni scena: codici prima, codici adesso;
- conteggio per codice sui 32 casi;
- le 5 segnalazioni più gravi con comando di riproduzione e foto.
Dati grezzi in `tests/codex/ricollaudo-difesa-3d.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se una foto non basta. Niente conclusioni su FPS o fluidità dall'headless. Le anomalie restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi.
