# Verifica 7.999.196 — parte S

Solo controllo: nessuna modifica al gioco né ai guardiani.

- **Commit di partenza:** `fda5aa54` (ramo `verifica/196-s`, da `origin/lavoro/196`)
- **build-src:** «byte identici a prima: nessuna modifica nei frammenti»
- **check-src:** `✓ IDENTICO BYTE PER BYTE — 7658265 byte ricomposti da 21 frammenti` · privacy allineata · HTML allineato a HEAD
- **Ambiente:** `npm install --no-package-lock` in `tests/visual`; comando `CPM_CI_PAR=0 CPM_CHROME=/opt/pw-browsers/chromium npm run -s <nome>`, un controllo alla volta.

| Controllo | Uscita | Durata | Memoria libera prima | Disco prima |
|---|---|---|---|---|
| tocco3d-219 | 0 | 465 s | 15024 MB (avail 15541) | 29G liberi, 27% |
| fps-249 | 0 | 41 s | 14625 MB (avail 15566) | 29G liberi, 27% |
| tpose-196 | 0 | 1349 s | 14499 MB (avail 15443) | 29G liberi, 27% |
| festa-3d | 0 | 124 s | 14592 MB (avail 15541) | 29G liberi, 27% |

## Righe finali verde/rosso

- **tocco3d-219:** `✅ tocco3d-219 — verde 9/9 · rosso bocciato 6/6`
- **fps-249:** `✅ fps-249 verde (nessuna scritta fps al giocatore, misura viva) e il rosso si vede`
- **tpose-196:** `✅ tpose-196 VERDE: 0 T-pose, 0 corpi non CGTrader, 0 procedurali su ingresso e highlight` · `✅ tpose-196 ROSSO ATTESO: con __CPM_NO_G196 i corpi sbagliati si vedono`
- **festa-3d:** `=== FESTA 3D DI FINE PARTITA === [VERDE]` · `✅ PASS — la vittoria si festeggia in 3D coi numeri veri, e «Salta» porta alla card`

## Rossi

Nessuno: tutti e quattro i controlli verdi alla prima corsa, nessuna ripetizione necessaria.

Nota: tpose-196 (1349 s) ha superato i 10 minuti ed è stato eseguito in sottofondo con tetto ampio; l'esito è stato atteso leggendo il registro fino alla riga `EXIT=`, senza interruzioni.
