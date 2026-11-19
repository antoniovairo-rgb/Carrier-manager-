# Verifica di rilascio 7.999.197 — blocco V3f

- Build verificato: `lavoro/197` a **2ba9c7cc** (detached, mai spostato). Confronto: 7.999.196 pubblicata = `origin/main` **3076a1b7**.
- Preparazione: `npm i` in `tests/visual` · `node tools/build-src.mjs` (byte identici, 21 frammenti, 67.312 righe) · `node tools/check-src.mjs` (verde: allineato a HEAD).
- Modo: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `npm run -s <nome>` in `tests/visual`, `timeout 2400`; `free -m` e `df -h` registrati prima di ogni corsa.
- Regola PO-516: rosso già sulla 196 = dichiarato; rosso nato nella 197 = blocca.

| Controllo | Esito 1ª | Esito 2ª | Esito sulla 196 | Classificazione | Ultima riga del controllo |
|---|---|---|---|---|---|
| partita2d-297 | verde (rc 0, ~2 min) | — | — | verde | `✅ partita2d-297 VERDE` |
| colori-286 | verde (rc 0, ~16 min) | — | — | verde | `✅ PASS colori-286 (verde, e il rosso si vede)` |
| cori-291 | verde (rc 0, <1 min) | — | — | verde | `CORI-291: ✅ VERDE` |
| rigore-79 | verde (rc 0, <1 min) | — | — | verde | `✅ rigore-79 verde: «rigore per loro» solo sui rigori degli avversari; il rosso __CPM_NO_RIG79 la riapre sui rigori dell'eroe` |
| pagella-75 | rosso (rc 1, ~20 min) | rosso (rc 1, ~20 min) | rosso (rc 1, ~21 min) = **rosso anche sulla 196** | **dichiarato** (PO-516) | `❌ pagella-75: verde: nessuna partita con un gol dell'eroe in gioco fluido (il caso non e' esercitato) · rosso: nessuna divergenza (il guardiano guarda a vuoto)` |
| pallino-278 | verde (rc 0, ~2 min) | — | — | verde | `✅ pallino-278 verde (e il rosso si vede) — foto in out/pallino-278/` |
| pillola-58 | verde (rc 0, ~1 min) | — | — | verde | `✅ pillola-58 verde (e il rosso si vede)` |

## Note
- **pagella-75**: il rosso è «non giudicato» su entrambi i bracci: nelle partite giocate dalla sonda (k4, k12, k13) l'eroe non segna mai in gioco fluido, quindi il caso non viene esercitato e il braccio rosso non trova divergenze. Stesso messaggio sulla 196 (3076a1b7, sonda `pagella-75.mjs` identica byte per byte). Va notato che sulla 196 i punteggi delle stesse partite sono diversi (k4 rosso 0-1 / verde 3-0 contro il 2-1 della 197): il motore è cambiato, ma il verdetto no. Non lo decido io: lo segnalo.
- La prima corsa sulla 196 è stata interrotta dal riavvio del contenitore (00:54 → riavvio 00:58): **non vale**, rifatta da capo alle 00:59.
