# Collaudo difesa 3D — CPM 7.999.84

**Base verificata:** CPM 7.999.84, commit `9eb68f7cd53cd01ba2a058020f750ecdc22a9cd1` di `main`.
**Stato:** 32/32 casi validi; 32 tentativi, 0 casi con ultimo tentativo non valido, 32 revisioni visive, 0 immagini mancanti.

Lettura: viewport 412×915; pagina nuova per ogni caso; corpi GLB, presentazione e cinema attivi. Esito verificato con `window.__CPM_TIMELINE()` → `ActionResolved`. I casi senza corrispondenza restano visibili e non sono contati come validi. Campioni headless: **nessuna conclusione su fluidità, FPS o tempi di risposta**. La presenza in partita naturale è non verificata.
Durante l'acquisizione 6 prime foto di apertura erano interamente nere (misura blackFraction=1): la foto 01 e stata ripetuta prima della revisione. I tentativi neri restano nel dato grezzo e fra le immagini; non dimostrano una schermata nera nel gioco sul telefono.

Comandi di acquisizione: `node tests/codex/collaudo-difesa-3d.mjs`; lotti sequenziali: `node tests/codex/collaudo-difesa-3d-lotti.mjs`; fogli: `node tests/codex/collaudo-difesa-3d-sheet.mjs`; controllo: `node tests/codex/collaudo-difesa-3d-audit.mjs`; rapporto: `node tests/codex/collaudo-difesa-3d-report.mjs`.

Le anomalie fotografiche sono ipotesi finché il team non le riproduce. Il codice 003 riguarda la rappresentazione o il testo visibile, non una discordanza fra esito richiesto e ActionResolved. Le sei foto non provano la continuità del movimento. Dati completi compressi: tests/codex/collaudo-difesa-3d.json.gz. I comandi di riproduzione richiedono il gioco su main al commit indicato, con gli script di questo collaudo in tests/codex/.

## Prima (7.999.69), intermedio (7.999.82) → adesso (7.999.84)

| Scena | 7.999.69 success | 7.999.82 success | Adesso success | 7.999.69 fail | 7.999.82 fail | Adesso fail |
|---:|---|---|---|---|---|---|
| 33 | 001, 003 | 001, 003 | nessuno | 001, 003 | 001, 003 | 003 |
| 133 | 001, 002 | 001, 002, 003 | 001, 002 | 001, 002, 003 | 001, 002, 003 | 001, 002, 003 |
| 134 | 001, 003 | 001, 003 | 001 | 001, 002, 003 | 001, 003 | 001, 003 |
| 138 | 001, 002, 003 | 001, 003 | 001 | 002 | 001 | 001 |
| 168 | 001, 002 | 001, 002 | 001, 002 | 001, 002 | 001, 002 | 001, 002 |

I codici precedenti provengono dai rapporti 7.999.69 e 7.999.82. Il confronto non prova da solo una correzione o una regressione.

## Codici per frequenza

| Codice | Significato ufficiale | Casi | Tre casi peggiori verificati |
|---|---|---:|---|
| 001 | apertura scena | 24 | 133:0:success, 133:0:fail, 134:0:fail |
| 002 | eroe fuori posizione | 9 | 133:0:success, 133:0:fail, 157:0:fail |
| 003 | esito bugiardo | 7 | 33:0:fail, 133:0:fail, 134:0:fail |


## Tutti i casi previsti

| gi | Azione richiesta e indice | Esito | Verifica | Distanza eroe–pallone foto 01 | Codici | Fotogrammi |
|---:|---|---|---|---:|---|---|
| 33 | 🧱 Blocca con il corpo (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 3.15 u | nessun difetto provato | [01-apertura](collaudo-difesa-3d/gi33-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi33-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi33-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi33-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi33-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi33-a0-success-v2-84-06-esito.png) |
| 33 | 🧱 Blocca con il corpo (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 3.42 u | 003 | [01-apertura](collaudo-difesa-3d/gi33-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi33-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi33-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi33-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi33-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi33-a0-fail-v2-84-06-esito.png) |
| 133 | 🏃 Sprint disperato sulla linea (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 29.75 u | 001, 002 | [01-apertura](collaudo-difesa-3d/gi133-a0-success-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi133-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi133-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi133-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi133-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi133-a0-success-v2-84-06-esito.png) |
| 133 | 🏃 Sprint disperato sulla linea (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 29.84 u | 001, 002, 003 | [01-apertura](collaudo-difesa-3d/gi133-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi133-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi133-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi133-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi133-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi133-a0-fail-v2-84-06-esito.png) |
| 134 | ✈️ Stacco dominante (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 3.18 u | 001 | [01-apertura](collaudo-difesa-3d/gi134-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi134-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi134-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi134-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi134-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi134-a0-success-v2-84-06-esito.png) |
| 134 | ✈️ Stacco dominante (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 3.73 u | 001, 003 | [01-apertura](collaudo-difesa-3d/gi134-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi134-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi134-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi134-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi134-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi134-a0-fail-v2-84-06-esito.png) |
| 138 | 📣 Allineamento difensivo immediato (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 19.48 u | 001 | [01-apertura](collaudo-difesa-3d/gi138-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi138-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi138-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi138-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi138-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi138-a0-success-v2-84-06-esito.png) |
| 138 | 📣 Allineamento difensivo immediato (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 19.48 u | 001 | [01-apertura](collaudo-difesa-3d/gi138-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi138-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi138-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi138-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi138-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi138-a0-fail-v2-84-06-esito.png) |
| 168 | 🛡️ Tackle duro — rischio rosso (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 3.18 u | 001, 002 | [01-apertura](collaudo-difesa-3d/gi168-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi168-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi168-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi168-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi168-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi168-a0-success-v2-84-06-esito.png) |
| 168 | 🛡️ Tackle duro — rischio rosso (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 3.08 u | 001, 002 | [01-apertura](collaudo-difesa-3d/gi168-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi168-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi168-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi168-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi168-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi168-a0-fail-v2-84-06-esito.png) |
| 31 | 🛡️ Scivolata netta (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 4.46 u | 001 | [01-apertura](collaudo-difesa-3d/gi31-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi31-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi31-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi31-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi31-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi31-a0-success-v2-84-06-esito.png) |
| 31 | 🛡️ Scivolata netta (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 4.46 u | 001 | [01-apertura](collaudo-difesa-3d/gi31-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi31-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi31-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi31-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi31-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi31-a0-fail-v2-84-06-esito.png) |
| 32 | ✋ Anticipo di posizione (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 15.73 u | 001 | [01-apertura](collaudo-difesa-3d/gi32-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi32-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi32-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi32-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi32-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi32-a0-success-v2-84-06-esito.png) |
| 32 | ✋ Anticipo di posizione (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 15.65 u | 001, 002 | [01-apertura](collaudo-difesa-3d/gi32-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi32-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi32-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi32-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi32-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi32-a0-fail-v2-84-06-esito.png) |
| 36 | ✈️ Stacco di testa (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 4.44 u | 001 | [01-apertura](collaudo-difesa-3d/gi36-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi36-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi36-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi36-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi36-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi36-a0-success-v2-84-06-esito.png) |
| 36 | ✈️ Stacco di testa (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 4.47 u | 001, 003 | [01-apertura](collaudo-difesa-3d/gi36-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi36-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi36-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi36-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi36-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi36-a0-fail-v2-84-06-esito.png) |
| 44 | ✈️ Stacco di testa deciso (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 4.55 u | 001 | [01-apertura](collaudo-difesa-3d/gi44-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi44-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi44-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi44-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi44-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi44-a0-success-v2-84-06-esito.png) |
| 44 | ✈️ Stacco di testa deciso (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 4.66 u | 001, 003 | [01-apertura](collaudo-difesa-3d/gi44-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi44-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi44-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi44-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi44-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi44-a0-fail-v2-84-06-esito.png) |
| 45 | 🧱 Corpo sulla traiettoria (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 3.69 u | 001 | [01-apertura](collaudo-difesa-3d/gi45-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi45-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi45-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi45-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi45-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi45-a0-success-v2-84-06-esito.png) |
| 45 | 🧱 Corpo sulla traiettoria (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 3.76 u | 001, 003 | [01-apertura](collaudo-difesa-3d/gi45-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi45-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi45-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi45-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi45-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi45-a0-fail-v2-84-06-esito.png) |
| 128 | 🛑 Chiusura immediata (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 5.66 u | 001 | [01-apertura](collaudo-difesa-3d/gi128-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi128-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi128-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi128-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi128-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi128-a0-success-v2-84-06-esito.png) |
| 128 | 🛑 Chiusura immediata (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 5.70 u | 001, 002 | [01-apertura](collaudo-difesa-3d/gi128-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi128-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi128-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi128-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi128-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi128-a0-fail-v2-84-06-esito.png) |
| 137 | ⚡ Tackle in corsa preciso (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 17.52 u | 001 | [01-apertura](collaudo-difesa-3d/gi137-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi137-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi137-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi137-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi137-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi137-a0-success-v2-84-06-esito.png) |
| 137 | ⚡ Tackle in corsa preciso (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 17.57 u | 001 | [01-apertura](collaudo-difesa-3d/gi137-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi137-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi137-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi137-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi137-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi137-a0-fail-v2-84-06-esito.png) |
| 157 | 🤸 Gettati sulla traiettoria (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 3.65 u | 002 | [01-apertura](collaudo-difesa-3d/gi157-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi157-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi157-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi157-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi157-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi157-a0-success-v2-84-06-esito.png) |
| 157 | 🤸 Gettati sulla traiettoria (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 3.92 u | 002, 003 | [01-apertura](collaudo-difesa-3d/gi157-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi157-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi157-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi157-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi157-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi157-a0-fail-v2-84-06-esito.png) |
| 184 | ✋ Intercetta il filtrante (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 12.50 u | 001 | [01-apertura](collaudo-difesa-3d/gi184-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi184-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi184-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi184-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi184-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi184-a0-success-v2-84-06-esito.png) |
| 184 | ✋ Intercetta il filtrante (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 12.50 u | 001, 002 | [01-apertura](collaudo-difesa-3d/gi184-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi184-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi184-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi184-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi184-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi184-a0-fail-v2-84-06-esito.png) |
| 24 | 🎯 Assist filtrante (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 0.00 u | nessun difetto provato | [01-apertura](collaudo-difesa-3d/gi24-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi24-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi24-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi24-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi24-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi24-a0-success-v2-84-06-esito.png) |
| 24 | 🎯 Assist filtrante (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 0.00 u | nessun difetto provato | [01-apertura](collaudo-difesa-3d/gi24-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi24-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi24-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi24-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi24-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi24-a0-fail-v2-84-06-esito.png) |
| 2 | 🦵 Spingila dentro! (indice catalogo 0, risolutore 0, UI 0) | success | valido: success | 0.00 u | nessun difetto provato | [01-apertura](collaudo-difesa-3d/gi2-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi2-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi2-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi2-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi2-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi2-a0-success-v2-84-06-esito.png) |
| 2 | 🦵 Spingila dentro! (indice catalogo 0, risolutore 0, UI 0) | fail | valido: fail | 0.00 u | nessun difetto provato | [01-apertura](collaudo-difesa-3d/gi2-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi2-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi2-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi2-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi2-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi2-a0-fail-v2-84-06-esito.png) |


## Note per scena

### [KE 7.999.84] SIT #33 [tackle]: «🧱 Muro in area! Blocca il tiro.» · AZIONE «🧱 Blocca con il corpo» → success

NOTA: Nessun difetto dimostrato dai sei scatti. Rispetto alla 7.999.82, palla e portatore sono visibili in apertura e il testo finale non parla piu del portiere. Nessun codice assegnato.
01 Apertura: Foto 01: eroe granata e portatore a strisce visibili, palla ai piedi del portatore; distanza eroe-pallone 3,15 u. Il pericolo e leggibile all'apertura. Distanza eroe–pallone dal testimone: 3.15 u.
03–05 Inquadratura: Foto 03-05: eroe e pallone in quadro durante la chiusura; nella foto 05 il portiere azzurro compare presso il margine inferiore.
06 Esito visibile: Foto 06: Salvataggio decisivo e Blocchi la conclusione, senza testo che attribuisca il gesto al portiere; tabellone 0-0. Testo compatibile con l'intervento dell'eroe.
Gesto scelto: Parziale: foto 03-04 mostrano l'eroe che si piega sulla palla; il contatto definitivo non e isolato, ma la chiusura e visibile.
Esito osservato da ActionResolved: success, etichetta «🧱 Blocca con il corpo»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🧱Blocca con il corpoFISICO · 67 / ✋Devia col piedeTECNICA · 55 / 📣Chiama il portiereTECNICA · 55. Alias del pulsante scelto: 🧱 Blocca con il corpo; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi33-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi33-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi33-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi33-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi33-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi33-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #33 [tackle]: «🧱 Muro in area! Blocca il tiro.» · AZIONE «🧱 Blocca con il corpo» → fail

NOTA: La nuova apertura elimina il vecchio 001, ma il punteggio cambia prima che le foto mostrino il gol; 003 resta ipotesi visiva da riprodurre. Codici 003.
01 Apertura: Foto 01: eroe e portatore avversario entrambi visibili, pallone ai piedi dell'avversario; distanza eroe-pallone 3,42 u. L'apertura e leggibile. Distanza eroe–pallone dal testimone: 3.42 u.
03–05 Inquadratura: Foto 03-05: eroe, avversario e pallone in quadro, anche quando la palla passa vicino al difensore.
06 Esito visibile: Foto 03: tabellone gia 0-1 mentre il portatore e ancora sul pallone e nessun tiro o porta compare negli scatti. Foto 06: Retroguardia in bambola e Supera e segna, ma il gol non e visibile nei sei fotogrammi.
Gesto scelto: Parziale: eroe piegato sulla traiettoria nelle foto 03-05; il blocco fallito non e isolato.
Esito osservato da ActionResolved: fail, etichetta «🧱 Blocca con il corpo»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🧱Blocca con il corpoFISICO · 67 / ✋Devia col piedeTECNICA · 55 / 📣Chiama il portiereTECNICA · 55. Alias del pulsante scelto: 🧱 Blocca con il corpo; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi33-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi33-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi33-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi33-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi33-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi33-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #133 [tackle]: «🏃 Recupero sulla linea di fondo!» · AZIONE «🏃 Sprint disperato sulla linea» → success

NOTA: Rispetto alla 7.999.82 il testo finale da portiere e corretto; apertura e inquadratura continuano a non mostrare palla e intervento. Codici 001, 002.
01 Apertura: Foto 01: eroe granata piegato vicino al bordo inferiore, pallone e attaccante assenti; distanza eroe-pallone 29,75 u. Il recupero sulla linea di fondo non e mostrato. Distanza eroe–pallone dal testimone: 29.75 u.
03–05 Inquadratura: Foto 03-05: la palla resta fuori quadro e l'eroe scende verso il bordo inferiore, con corpo tagliato nelle foto 04-05.
06 Esito visibile: Foto 06: Salvataggio decisivo e Blocchi la conclusione, senza frase da portiere. Il tabellone resta 0-0, ma il contatto col pallone non e visibile.
Gesto scelto: Non verificato: la corsa e il contatto dello sprint sulla linea non si vedono nei sei scatti.
Esito osservato da ActionResolved: success, etichetta «🏃 Sprint disperato sulla linea»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🏃Sprint disperato sulla lineaVELOCITÀ · 59 / ✋Intercetto prima del fondoTECNICA · 55 / 📣Chiamo il portiereTECNICA · 55. Alias del pulsante scelto: 🏃 Sprint disperato sulla linea; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 007 — la camera BECCHEGGIA: 2.2 inversioni/s su-giù dell'asse ottico (ampiezza max 1.7°) — ultima passata: sguardo-pre 56% + lerp 44% · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 4.0u, eroe ≥14.5u per 104 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi133-a0-success-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi133-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi133-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi133-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi133-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi133-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #133 [tackle]: «🏃 Recupero sulla linea di fondo!» · AZIONE «🏃 Sprint disperato sulla linea» → fail

NOTA: Persistono apertura e inquadratura cieche; il punteggio anticipa il gol visibile. 003 e un'ipotesi fotografica, non una divergenza da ActionResolved. Codici 001, 002, 003.
01 Apertura: Foto 01: eroe al bordo inferiore, pallone e attaccante assenti; distanza eroe-pallone 29,84 u. Distanza eroe–pallone dal testimone: 29.84 u.
03–05 Inquadratura: Foto 03-05: palla assente e protagonista tagliato in basso; la linea di fondo annunciata non si vede durante l'intervento.
06 Esito visibile: Foto 03: tabellone gia 0-1 con palla e porta fuori quadro. Foto 06: Buco in copertura e Supera e segna, ma il gol non compare nei campioni.
Gesto scelto: Non verificato: il tentativo di sprint e il superamento dell'eroe restano fuori quadro.
Esito osservato da ActionResolved: fail, etichetta «🏃 Sprint disperato sulla linea»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🏃Sprint disperato sulla lineaVELOCITÀ · 59 / ✋Intercetto prima del fondoTECNICA · 55 / 📣Chiamo il portiereTECNICA · 55. Alias del pulsante scelto: 🏃 Sprint disperato sulla linea; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 007 — lo SGUARDO della camera oscilla: 3.1 inversioni/s dell'asse ottico (ampiezza max 2.4°) — ultima passata per fotogramma: lerp 53% + sguardo-pre 47% · 4.4 passate/fotogramma · codice 007 — la camera BECCHEGGIA: 17.5 inversioni/s su-giù dell'asse ottico (ampiezza max 3.8°) — ultima passata: lerp 53% + sguardo-pre 47% · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 5.8u, eroe ≥27.7u per 104 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi133-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi133-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi133-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi133-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi133-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi133-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #134 [header]: «✈️ Sfida aerea su lancio lungo!» · AZIONE «✈️ Stacco dominante» → success

NOTA: L'apertura resta poco chiara per il pallone coperto dal pannello; l'esito testuale da portiere della 7.999.82 risulta corretto in questo campione. Codici 001.
01 Apertura: Foto 01: eroe e compagno granata visibili, pallone al bordo del pannello inferiore e quasi interamente coperto; distanza eroe-pallone 3,18 u. Il pericolo aereo non e ancora leggibile. Distanza eroe–pallone dal testimone: 3.18 u.
03–05 Inquadratura: Foto 03-05: palla in volo, eroe e avversario in quadro; nessun protagonista tagliato in modo evidente.
06 Esito visibile: Foto 06: Salvataggio decisivo e SALVATO! Da difensore!, tabellone 0-0. Il testo descrive l'intervento di un giocatore di movimento e non attribuisce la parata al portiere.
Gesto scelto: Parziale: l'eroe alza il corpo verso la palla nelle foto 03-04, ma i sei scatti non isolano con certezza il contatto di testa.
Esito osservato da ActionResolved: success, etichetta «✈️ Stacco dominante»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✈️Attacca il palloneFISICO · 67 / 💪Contrasto fisico in voloFISICO · 67 / 📣Chiamo il portiereTECNICA · 55. Alias del pulsante scelto: ✈️ Attacca il pallone; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · corpo↔porta al contatto: 109° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -25, z 4.1)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi134-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi134-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi134-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi134-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi134-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi134-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #134 [header]: «✈️ Sfida aerea su lancio lungo!» · AZIONE «✈️ Stacco dominante» → fail

NOTA: Il codice 003 resta una possibile incoerenza del tabellone anticipato; gli scatti non provano il momento esatto del gol fuori quadro. Apertura ancora coperta dal pannello. Codici 001, 003.
01 Apertura: Foto 01: eroe e compagno granata visibili, pallone coperto dalla scheda in basso; distanza eroe-pallone 3,73 u. La sfida aerea non e mostrata all'apertura. Distanza eroe–pallone dal testimone: 3.73 u.
03–05 Inquadratura: Foto 03-05: eroe e avversario in quadro, palla in volo nella foto 03 e poi presso il bordo destro nella 04. Nessuna uscita prolungata dell'eroe provata.
06 Esito visibile: Foto 03: tabellone gia 0-1 mentre la palla e ancora in volo lontano dalla porta visibile. Foto 05-06: Buco in copertura e Gol avversario, ma il tiro in porta non compare negli scatti.
Gesto scelto: Parziale: nelle foto 03-04 il difensore si protende verso la palla; il contatto aereo mancato non e isolato.
Esito osservato da ActionResolved: fail, etichetta «✈️ Stacco dominante»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✈️Attacca il palloneFISICO · 67 / 💪Contrasto fisico in voloFISICO · 67 / 📣Chiamo il portiereTECNICA · 55. Alias del pulsante scelto: ✈️ Attacca il pallone; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 007 — la camera BECCHEGGIA: 4.8 inversioni/s su-giù dell'asse ottico (ampiezza max 1.1°) — ultima passata: lerp 60% + bisezione 27% · corpo↔porta al contatto: 154° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -22.6, z 4.1)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi134-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi134-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi134-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi134-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi134-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi134-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #138 [tackle]: «📣 Allineati con la difesa — linea alta!» · AZIONE «📣 Allineamento difensivo immediato» → success

NOTA: Apertura ancora senza pallone; il precedente testo da portiere non compare in questo esito positivo. Codici 001.
01 Apertura: Foto 01: eroe granata sul bordo inferiore e parzialmente dietro al pannello, pallone e portatore non visibili; distanza eroe-pallone 19,48 u. L'allineamento difensivo non e contestualizzato dalla palla. Distanza eroe–pallone dal testimone: 19.48 u.
03–05 Inquadratura: Foto 03-05: eroe e compagni nel quadro, pallone compare soltanto nella foto 05, lontano dagli uomini ripresi. Non e provata una uscita completa del protagonista.
06 Esito visibile: Foto 06: Salvataggio decisivo e Metti tutti stretti: stringono!, tabellone 0-0; nessun testo da portiere. L'intervento esatto non si vede.
Gesto scelto: Parziale/non verificato: si osserva il riposizionamento dei granata, ma nessuna foto isola un blocco o intercetto.
Esito osservato da ActionResolved: success, etichetta «📣 Allineamento difensivo immediato»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 📣Allineamento difensivo immediatoMENTALITÀ · 67 / 💪Contrasto fisico duroFISICO · 67 / ⚡Pressing immediato sul portatoreVELOCITÀ · 59. Alias del pulsante scelto: 📣 Allineamento difensivo immediato; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 007 — lo SGUARDO della camera oscilla: 3.2 inversioni/s dell'asse ottico (ampiezza max 1.6°) — ultima passata per fotogramma: lerp 84% + sguardo-pre 13% · 3.8 passate/fotogramma  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi138-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi138-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi138-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi138-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi138-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi138-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #138 [tackle]: «📣 Allineati con la difesa — linea alta!» · AZIONE «📣 Allineamento difensivo immediato» → fail

NOTA: Persistono apertura senza palla e portatore; l'esito testuale non contraddice chiaramente gli scatti. Codici 001.
01 Apertura: Foto 01: eroe granata visibile solo presso il bordo inferiore, pallone e avversario fuori quadro; distanza eroe-pallone 19,48 u. Distanza eroe–pallone dal testimone: 19.48 u.
03–05 Inquadratura: Foto 03-05: eroe in quadro, avversario compare solo in basso nella foto 05 e il pallone non e distinguibile.
06 Esito visibile: Foto 06: Saltato secco e Supera la pressione, tabellone 0-0; l'avversario a strisce compare nella fase finale. Esito plausibile, contatto non verificato.
Gesto scelto: Parziale/non verificato: si vede il movimento di posizione dell'eroe, non l'allineamento del reparto completo.
Esito osservato da ActionResolved: fail, etichetta «📣 Allineamento difensivo immediato»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 📣Allineamento difensivo immediatoMENTALITÀ · 67 / 💪Contrasto fisico duroFISICO · 67 / ⚡Pressing immediato sul portatoreVELOCITÀ · 59. Alias del pulsante scelto: 📣 Allineamento difensivo immediato; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi138-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi138-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi138-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi138-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi138-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi138-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #168 [tackle]: «🛡️ Ultimo uomo! Devi fermare l'avversario.» · AZIONE «🛡️ Tackle duro — rischio rosso» → success

NOTA: Persistono pannello sull'apertura e scivolata parzialmente fuori quadro. L'esito finale e leggibile. Codici 001, 002.
01 Apertura: Foto 01: eroe e compagno granata visibili, ma pallone e portatore avversario sono coperti dal pannello; distanza eroe-pallone 3,18 u. L'ultimo uomo da fermare non si vede. Distanza eroe–pallone dal testimone: 3.18 u.
03–05 Inquadratura: Foto 03-05: palla e portatore entrano in quadro, ma il corpo granata in scivolata e tagliato dal bordo sinistro nelle foto 04-05.
06 Esito visibile: Foto 06: Chiusura impeccabile e Pallone recuperato, con difensori e avversario nel quadro; tabellone 0-0, testo compatibile con success.
Gesto scelto: Parziale: scivolata visibile nella foto 03, fase conclusiva tagliata a sinistra nelle foto 04-05.
Esito osservato da ActionResolved: success, etichetta «🛡️ Tackle duro — rischio rosso»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🛡️Tackle duro — rischio rossoFISICO · 67 / ⚡Sprint laterale preventivoVELOCITÀ · 59 / 📣Guida i compagni e copriMENTALITÀ · 67. Alias del pulsante scelto: 🛡️ Tackle duro — rischio rosso; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi168-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi168-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi168-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi168-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi168-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi168-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #168 [tackle]: «🛡️ Ultimo uomo! Devi fermare l'avversario.» · AZIONE «🛡️ Tackle duro — rischio rosso» → fail

NOTA: Apertura ancora coperta dalla scheda e scivolata parzialmente fuori quadro; esito disciplinare plausibile. Codici 001, 002.
01 Apertura: Foto 01: eroe e compagno granata visibili, ma pallone e portatore a strisce finiscono dietro il pannello inferiore; distanza eroe-pallone 3,08 u. Distanza eroe–pallone dal testimone: 3.08 u.
03–05 Inquadratura: Foto 03-05: la scivolata granata e visibile, ma il corpo esce in parte dal bordo inferiore sinistro nelle foto 04-05; palla e avversario restano in quadro.
06 Esito visibile: Foto 06: FALLO e Fallo! Sei stato ammonito; tabellone 0-0. Il testo e compatibile con la scivolata, sebbene il contatto preciso non sia isolato.
Gesto scelto: Si, parziale: scivolata evidente nella foto 03, prosecuzione tagliata nelle foto 04-05.
Esito osservato da ActionResolved: fail, etichetta «🛡️ Tackle duro — rischio rosso»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🛡️Tackle duro — rischio rossoFISICO · 67 / ⚡Sprint laterale preventivoVELOCITÀ · 59 / 📣Guida i compagni e copriMENTALITÀ · 67. Alias del pulsante scelto: 🛡️ Tackle duro — rischio rosso; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi168-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi168-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi168-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi168-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi168-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi168-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #31 [tackle]: «🛡️ Avversario porta palla — sfida in scivolata!» · AZIONE «🛡️ Scivolata netta» → success

NOTA: Apertura con avversario e pallone coperti dalla scheda; azione e recupero leggibili dopo la scelta. Codici 001.
01 Apertura: Foto 01: due granata visibili, ma portatore avversario e palla sono sotto il pannello; distanza eroe-pallone 4,46 u. Il titolo annuncia una sfida in scivolata senza mostrare il portatore. Distanza eroe–pallone dal testimone: 4.46 u.
03–05 Inquadratura: Foto 03-05: palla, portatore a strisce e difensore in scivolata tutti nel quadro; nessun taglio decisivo del protagonista.
06 Esito visibile: Foto 06: Chiusura impeccabile e Anticipo perfetto, con palla presso il granata; tabellone 0-0. Esito compatibile con success.
Gesto scelto: Si: la scivolata e chiaramente visibile nelle foto 04-05.
Esito osservato da ActionResolved: success, etichetta «🛡️ Scivolata netta»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🛡️Scivolata nettaFISICO · 67 / ✋Intercetta di piedeTECNICA · 55 / 📣Copri la lineaVELOCITÀ · 59. Alias del pulsante scelto: 🛡️ Scivolata netta; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 3.9u, eroe ≥3.5u per 81 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi31-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi31-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi31-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi31-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi31-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi31-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #31 [tackle]: «🛡️ Avversario porta palla — sfida in scivolata!» · AZIONE «🛡️ Scivolata netta» → fail

NOTA: Solo l'apertura nasconde il portatore; il fallo finale e visivamente plausibile. Codici 001.
01 Apertura: Foto 01: due granata nel quadro, portatore avversario e palla coperti dal pannello inferiore; distanza eroe-pallone 4,46 u. Distanza eroe–pallone dal testimone: 4.46 u.
03–05 Inquadratura: Foto 03-05: eroe, avversario e palla visibili; la scivolata e il contatto successivo restano nel quadro.
06 Esito visibile: Foto 06: FALLO e Rischio fallo, punizione concessa, con pallone fermo vicino ai giocatori; tabellone 0-0. Esito compatibile con fail.
Gesto scelto: Si: scivolata distesa visibile nella foto 04 e corpo a terra presso l'avversario nella 05.
Esito osservato da ActionResolved: fail, etichetta «🛡️ Scivolata netta»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🛡️Scivolata nettaFISICO · 67 / ✋Intercetta di piedeTECNICA · 55 / 📣Copri la lineaVELOCITÀ · 59. Alias del pulsante scelto: 🛡️ Scivolata netta; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 4.6u, eroe ≥3.5u per 89 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi31-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi31-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi31-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi31-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi31-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi31-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #32 [tackle]: «✋ Anticipa il passaggio filtrante!» · AZIONE «✋ Anticipo di posizione» → success

NOTA: Apertura senza palla e bersaglio; intervento finale plausibile quando la palla entra nel quadro. Codici 001.
01 Apertura: Foto 01: eroe granata all'estremo sinistro, pallone e avversario non visibili; distanza eroe-pallone 15,73 u. Il filtrante da anticipare non e mostrato. Distanza eroe–pallone dal testimone: 15.73 u.
03–05 Inquadratura: Foto 03-04: eroe nel quadro ma pallone assente. Foto 05: pallone e giocatori rientrano nel quadro vicino al centrocampo.
06 Esito visibile: Foto 06: Entrata pulita e Muro invalicabile, eroe vicino alla palla e avversario a strisce; tabellone 0-0. Risultato compatibile con success.
Gesto scelto: Parziale: l'eroe raggiunge la traiettoria tra le foto 04-05, ma il tocco di anticipo non e isolato.
Esito osservato da ActionResolved: success, etichetta «✋ Anticipo di posizione»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✋Anticipo di posizioneTECNICA · 55 / 🏃Sprint di coperturaVELOCITÀ · 59 / 💪Contrasto fisicoFISICO · 67. Alias del pulsante scelto: ✋ Anticipo di posizione; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 007 — la CAMERA trema: 2.6 inversioni di direzione al secondo (passo max 0.83 unità)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi32-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi32-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi32-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi32-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi32-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi32-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #32 [tackle]: «✋ Anticipa il passaggio filtrante!» · AZIONE «✋ Anticipo di posizione» → fail

NOTA: Apertura senza la giocata e camera che taglia l'eroe mentre la palla resta invisibile. Il testo di fail resta non verificato nelle foto. Codici 001, 002.
01 Apertura: Foto 01: eroe granata al bordo sinistro, avversario e pallone fuori quadro; distanza eroe-pallone 15,65 u. Il filtrante annunciato non si vede. Distanza eroe–pallone dal testimone: 15.65 u.
03–05 Inquadratura: Foto 03-05: palla sempre assente; nella foto 05 il corpo dell'eroe e tagliato dal margine destro.
06 Esito visibile: Foto 06: Beffato dall'attaccante e Supera la pressione, tabellone 0-0; l'avversario e il pallone non sono visibili, quindi il superamento non e verificabile fotograficamente, senza contraddizione certa.
Gesto scelto: Non verificato: i sei campioni non mostrano intercetto o pallone vicino all'eroe.
Esito osservato da ActionResolved: fail, etichetta «✋ Anticipo di posizione»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✋Anticipo di posizioneTECNICA · 55 / 🏃Sprint di coperturaVELOCITÀ · 59 / 💪Contrasto fisicoFISICO · 67. Alias del pulsante scelto: ✋ Anticipo di posizione; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi32-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi32-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi32-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi32-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi32-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi32-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #36 [header]: «💪 Duello aereo su corner avversario!» · AZIONE «✈️ Stacco di testa» → success

NOTA: L'apertura non rende visibile il pallone del corner; il successivo gesto aereo e l'esito difensivo sono plausibili. Codici 001.
01 Apertura: Foto 01: due granata visibili, avversario solo al margine destro e pallone non distinguibile; distanza eroe-pallone 4,44 u. Il cross da corner non e mostrato all'apertura. Distanza eroe–pallone dal testimone: 4.44 u.
03–05 Inquadratura: Foto 03-05: eroe interamente in quadro; palla in volo nelle foto 03-04, poi assente nella 05 dopo il rinvio.
06 Esito visibile: Foto 06: Risposta da campione e Muro invalicabile, il tiro non passa!, tabellone 0-0; non compaiono parole da portiere. Il contatto esatto col pallone non e campionato.
Gesto scelto: Parziale: postura del colpo di testa visibile nella foto 05, contatto testa-palla non isolato.
Esito osservato da ActionResolved: success, etichetta «✈️ Stacco di testa»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✈️Attacca il palloneFISICO · 67 / 🤼Contrasto fisicoFISICO · 67 / 📣Guida i compagniTECNICA · 55. Alias del pulsante scelto: ✈️ Attacca il pallone; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · corpo↔porta al contatto: 114° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -41, z -9.5)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi36-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi36-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi36-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi36-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi36-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi36-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #36 [header]: «💪 Duello aereo su corner avversario!» · AZIONE «✈️ Stacco di testa» → fail

NOTA: Apertura senza palla; 003 come ipotesi per punteggio anticipato rispetto al gol visibile, non come discordanza dal motore. Codici 001, 003.
01 Apertura: Foto 01: due granata in quadro, avversario solo al bordo e palla non distinguibile; distanza eroe-pallone 4,47 u. Il cross da corner non e inquadrato. Distanza eroe–pallone dal testimone: 4.47 u.
03–05 Inquadratura: Foto 03-05: eroe e palla in quadro nella fase aerea; la palla resta nel campo visibile fino alla foto 05.
06 Esito visibile: Foto 03: tabellone gia 0-1 quando la palla e ancora in volo lontano dalla porta. Foto 06: Buco in copertura e Non ci arrivi, ma il gol non e mostrato nei campioni.
Gesto scelto: Parziale: eroe orientato verso la palla nelle foto 03-05, contatto di testa mancato non isolato.
Esito osservato da ActionResolved: fail, etichetta «✈️ Stacco di testa»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✈️Attacca il palloneFISICO · 67 / 🤼Contrasto fisicoFISICO · 67 / 📣Guida i compagniTECNICA · 55. Alias del pulsante scelto: ✈️ Attacca il pallone; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · corpo↔porta al contatto: 114° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -41, z -9.5)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi36-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi36-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi36-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi36-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi36-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi36-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #44 [header]: «✈️ Cross avversario in area! Allontana!» · AZIONE «✈️ Stacco di testa deciso» → success

NOTA: Apertura coperta dal pannello; testo del salvataggio corretto in questo campione. Codici 001.
01 Apertura: Foto 01: eroe e compagno granata in quadro; avversario e pallone presso il margine inferiore, parzialmente coperti dalla scheda; distanza eroe-pallone 4,55 u. Il cross non si vede ancora. Distanza eroe–pallone dal testimone: 4.55 u.
03–05 Inquadratura: Foto 03-05: eroe e palla in volo restano in quadro; nessun corpo tagliato in modo decisivo.
06 Esito visibile: Foto 06: Chiusura provvidenziale e SALVATO! Da difensore!, tabellone 0-0. Il testo attribuisce il salvataggio al difensore, non al portiere come nella 7.999.82.
Gesto scelto: Parziale: postura di stacco visibile nelle foto 03-05, ma il contatto testa-palla non e isolato.
Esito osservato da ActionResolved: success, etichetta «✈️ Stacco di testa deciso»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✈️Attacca il palloneFISICO · 67 / 🛡️Chiudi di spallaFISICO · 67 / 📣Chiama il portiereTECNICA · 55. Alias del pulsante scelto: ✈️ Attacca il pallone; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 007 — lo SGUARDO della camera oscilla: 2.0 inversioni/s dell'asse ottico (ampiezza max 1.9°) — ultima passata per fotogramma: sguardo-pre 38% + bisezione 34% · 4.9 passate/fotogramma · corpo↔porta al contatto: 113° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -34, z 13.6)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi44-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi44-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi44-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi44-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi44-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi44-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #44 [header]: «✈️ Cross avversario in area! Allontana!» · AZIONE «✈️ Stacco di testa deciso» → fail

NOTA: Apertura coperta; 003 ipotetico per tabellone anticipato rispetto alla giocata visibile. Non e una discordanza da ActionResolved. Codici 001, 003.
01 Apertura: Foto 01: eroe e compagno granata visibili, pallone e avversario presso il bordo inferiore coperti dalla scheda; distanza eroe-pallone 4,66 u. Distanza eroe–pallone dal testimone: 4.66 u.
03–05 Inquadratura: Foto 03-05: eroe e palla in quadro durante il cross, poi il pallone attraversa il margine sinistro. Il difensore resta visibile.
06 Esito visibile: Foto 03: tabellone gia 0-1 mentre la palla e ancora in aria e nessuna porta e visibile. Foto 06: Col subito e Gol avversario; il gol non compare negli scatti.
Gesto scelto: Parziale: il difensore cerca la palla aerea nelle foto 03-05, ma il colpo di testa mancato non e isolato.
Esito osservato da ActionResolved: fail, etichetta «✈️ Stacco di testa deciso»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✈️Attacca il palloneFISICO · 67 / 🛡️Chiudi di spallaFISICO · 67 / 📣Chiama il portiereTECNICA · 55. Alias del pulsante scelto: ✈️ Attacca il pallone; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 012 — il pallone è tornato INDIETRO di 17.9 unità durante l'azione (dal punto più avanzato, verso la propria metà campo) — massimo arretramento a 4.8s dall'inizio scena · corpo↔porta al contatto: 113° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -34, z 13.6)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi44-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi44-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi44-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi44-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi44-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi44-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #45 [tackle]: «🧱 Tiro avversario in arrivo sulla linea! Intervieni.» · AZIONE «🧱 Corpo sulla traiettoria» → success

NOTA: L'apertura resta parzialmente nascosta dalla scheda, ma il blocco e leggibile e il testo finale non attribuisce l'intervento al portiere. Codici 001.
01 Apertura: Foto 01: eroe granata sulla linea dell'area visibile, portatore e pallone sul margine sinistro parzialmente coperti dal pannello; distanza eroe-pallone 3,69 u. Distanza eroe–pallone dal testimone: 3.69 u.
03–05 Inquadratura: Foto 03-05: eroe e palla in quadro durante il blocco; nella foto 05 compare anche il portiere sullo sfondo.
06 Esito visibile: Foto 06: Serranda abbassata e Blocchi la conclusione, con palla allontanata e tabellone 0-0; risultato compatibile con success.
Gesto scelto: Si: il difensore si getta sulla traiettoria nelle foto 03-04 e la palla prosegue lontano nella 05.
Esito osservato da ActionResolved: success, etichetta «🧱 Corpo sulla traiettoria»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🧱Corpo sulla traiettoriaFISICO · 67 / ✋Devia col piedeTECNICA · 55 / 😱Tentativo disperatoFISICO · 67. Alias del pulsante scelto: 🧱 Corpo sulla traiettoria; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi45-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi45-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi45-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi45-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi45-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi45-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #45 [tackle]: «🧱 Tiro avversario in arrivo sulla linea! Intervieni.» · AZIONE «🧱 Corpo sulla traiettoria» → fail

NOTA: Apertura coperta; possibile 003 per punteggio aggiornato prima del gol visibile. Il punto esatto di attraversamento della linea di porta resta non verificato nei sei scatti. Codici 001, 003.
01 Apertura: Foto 01: eroe vicino alla linea, portatore e palla parzialmente coperti dalla scheda al margine sinistro; distanza eroe-pallone 3,76 u. Distanza eroe–pallone dal testimone: 3.76 u.
03–05 Inquadratura: Foto 03-05: eroe e pallone visibili durante il tentativo di blocco; nella foto 05 compare il portiere sullo sfondo.
06 Esito visibile: Foto 03: tabellone gia 0-1 mentre la palla appare sulla linea laterale dell'area di rigore, non nella porta visibile. Foto 06: Col subito e Supera e segna, con porta e portiere in quadro.
Gesto scelto: Si, parziale: l'eroe si getta sulla traiettoria nelle foto 03-04, ma il tocco conclusivo non e isolato.
Esito osservato da ActionResolved: fail, etichetta «🧱 Corpo sulla traiettoria»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🧱Corpo sulla traiettoriaFISICO · 67 / ✋Devia col piedeTECNICA · 55 / 😱Tentativo disperatoFISICO · 67. Alias del pulsante scelto: 🧱 Corpo sulla traiettoria; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi45-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi45-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi45-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi45-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi45-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi45-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #128 [tackle]: «🛑 Chiusura urgente sull'attaccante!» · AZIONE «🛑 Chiusura immediata» → success

NOTA: Apertura ancora senza portatore e pallone, sebbene la distanza logica sia molto minore della 7.999.82; recupero finale leggibile. Codici 001.
01 Apertura: Foto 01: eroe granata isolato a centrocampo, palla e attaccante fuori quadro nonostante la distanza misurata di 5,66 u. La chiusura urgente non mostra la minaccia. Distanza eroe–pallone dal testimone: 5.66 u.
03–05 Inquadratura: Foto 03-04: eroe in quadro, pallone assente. Foto 05: palla e avversario entrano nel quadro vicino all'eroe.
06 Esito visibile: Foto 06: Contrasto vinto e Intervento pulito, palla nostra; granata e palla visibili, tabellone 0-0. Esito compatibile con success.
Gesto scelto: Parziale: si vede la corsa verso il portatore e la palla riconquistata, ma il contatto non e isolato.
Esito osservato da ActionResolved: success, etichetta «🛑 Chiusura immediata»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🛑Chiusura immediataVELOCITÀ · 59 / 💪Contrasto fisico decisoFISICO · 67 / 📣Posizionamento strategicoPOSIZIONAMENTO · 68. Alias del pulsante scelto: 🛑 Chiusura immediata; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 4.9u, eroe ≥3.6u per 87 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi128-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi128-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi128-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi128-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi128-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi128-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #128 [tackle]: «🛑 Chiusura urgente sull'attaccante!» · AZIONE «🛑 Chiusura immediata» → fail

NOTA: Apertura senza portatore e pallone; nella fase finale l'eroe esce in parte dal quadro. Nessun 003 certo per il testo di fail. Codici 001, 002.
01 Apertura: Foto 01: eroe granata isolato, pallone e attaccante assenti; distanza eroe-pallone 5,70 u. Il pericolo annunciato non entra nell'apertura. Distanza eroe–pallone dal testimone: 5.70 u.
03–05 Inquadratura: Foto 03-04: eroe nel quadro ma palla assente; foto 05: il protagonista granata e tagliato dal bordo destro, il pallone resta non distinguibile.
06 Esito visibile: Foto 06: Superato dall'avversario e Troppo veloce - Ti ha saltato, tabellone 0-0; palla e avversario non visibili, quindi il superamento non e verificabile negli scatti.
Gesto scelto: Non verificato: la chiusura e il superamento non sono catturati dalle sei foto.
Esito osservato da ActionResolved: fail, etichetta «🛑 Chiusura immediata»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🛑Chiusura immediataVELOCITÀ · 59 / 💪Contrasto fisico decisoFISICO · 67 / 📣Posizionamento strategicoPOSIZIONAMENTO · 68. Alias del pulsante scelto: 🛑 Chiusura immediata; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 4.7u, eroe ≥5.7u per 104 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi128-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi128-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi128-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi128-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi128-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi128-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #137 [tackle]: «⚡ Tackle in corsa — è più veloce!» · AZIONE «⚡ Tackle in corsa preciso» → success

NOTA: Apertura distante dalla palla; il recupero diventa leggibile solo nella foto finale. Codici 001.
01 Apertura: Foto 01: eroe granata isolato a sinistra, palla e portatore fuori quadro; distanza eroe-pallone 17,52 u. Il tackle in corsa non ha un avversario visibile all'avvio. Distanza eroe–pallone dal testimone: 17.52 u.
03–05 Inquadratura: Foto 03-04: eroe in quadro, palla assente. Foto 05: avversario entra dal basso, ma palla non distinguibile. Foto 06: palla ai piedi dell'eroe.
06 Esito visibile: Foto 06: Muro invalicabile e Anticipo perfetto, tabellone 0-0, con granata sulla palla; esito compatibile con success.
Gesto scelto: Parziale/non verificato: la foto 05 mostra l'approccio all'avversario, non il contatto del tackle.
Esito osservato da ActionResolved: success, etichetta «⚡ Tackle in corsa preciso»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ⚡Tackle in corsa precisoFISICO · 67 / 🌀Indirizza verso il fallo lateraleTECNICA · 55 / 🏃Sprint puro di rientroVELOCITÀ · 59. Alias del pulsante scelto: ⚡ Tackle in corsa preciso; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi137-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi137-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi137-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi137-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi137-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi137-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #137 [tackle]: «⚡ Tackle in corsa — è più veloce!» · AZIONE «⚡ Tackle in corsa preciso» → fail

NOTA: Apertura senza il portatore, poi l'azione decisiva si svolge fuori quadro. Nessun codice 003: la foto non dimostra che il fallo non sia avvenuto. Codici 001.
01 Apertura: Foto 01: eroe granata isolato a sinistra, avversario e pallone fuori quadro; distanza eroe-pallone 17,57 u. Distanza eroe–pallone dal testimone: 17.57 u.
03–05 Inquadratura: Foto 03-05: eroe visibile ma pallone e portatore assenti. Nella foto 06 resta solo il protagonista.
06 Esito visibile: Foto 06: FALLO! e Rischio fallo, punizione concessa, tabellone 0-0. Il fallo non e visibile nei sei scatti; coerenza visiva non verificata.
Gesto scelto: Non verificato: tackle e contatto con l'avversario non entrano nel quadro.
Esito osservato da ActionResolved: fail, etichetta «⚡ Tackle in corsa preciso»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ⚡Tackle in corsa precisoFISICO · 67 / 🌀Indirizza verso il fallo lateraleTECNICA · 55 / 🏃Sprint puro di rientroVELOCITÀ · 59. Alias del pulsante scelto: ⚡ Tackle in corsa preciso; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi137-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi137-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi137-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi137-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi137-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi137-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #157 [tackle]: «🛡️ Il tiro è in porta — gettati sulla traiettoria!» · AZIONE «🤸 Gettati sulla traiettoria» → success

NOTA: L'azione difensiva e in parte leggibile, mentre la camera taglia il protagonista nel momento piu importante. Il testo attribuito al portiere resta un sospetto 003, non dimostrato dagli scatti. Codici 002.
01 Apertura: Foto 01: eroe granata, portatore avversario e pallone tutti visibili, distanza eroe-pallone 3,65 u. La porta e il tiro annunciato sono fuori quadro. Distanza eroe–pallone dal testimone: 3.65 u.
03–05 Inquadratura: Foto 03-04: eroe e pallone in quadro; foto 05: il protagonista che si getta e tagliato dal bordo inferiore. Il pallone resta visibile.
06 Esito visibile: Foto 06: Porta salvata e Il portiere sulla traiettoria, ma nessuna porta o portiere e visibile. Non verificato chi abbia deviato la palla; il testimone conferma success.
Gesto scelto: Parziale: foto 05 mostra il getto del granata e la palla che si allontana, ma il corpo e tagliato e il contatto non e isolato.
Esito osservato da ActionResolved: success, etichetta «🤸 Gettati sulla traiettoria»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🤸Gettati sulla traiettoriaFISICO · 67 / ✋Devia di piede sul paloTECNICA · 55 / 📣Avvisa il portiereTECNICA · 55. Alias del pulsante scelto: 🤸 Gettati sulla traiettoria; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi157-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi157-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi157-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi157-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi157-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi157-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #157 [tackle]: «🛡️ Il tiro è in porta — gettati sulla traiettoria!» · AZIONE «🤸 Gettati sulla traiettoria» → fail

NOTA: 002 per il corpo tagliato nel gesto; 003 ipotetico per il tabellone anticipato rispetto al tiro mostrato, non per discordanza dell'esito dal testimone. Codici 002, 003.
01 Apertura: Foto 01: eroe e avversario portatore visibili con palla ai piedi; distanza eroe-pallone 3,92 u. La porta del tiro annunciato e fuori quadro. Distanza eroe–pallone dal testimone: 3.92 u.
03–05 Inquadratura: Foto 03-05: il protagonista che si getta e tagliato dal bordo inferiore; palla in quadro mentre si allontana a sinistra.
06 Esito visibile: Foto 03: tabellone gia 0-1 prima che la palla raggiunga una porta visibile. Foto 06: Disastro difensivo e errore decisivo, ma tiro e porta restano fuori quadro; il gol non e mostrato dai sei scatti.
Gesto scelto: Parziale: difensore a terra vicino alla palla nelle foto 03-05, contatto decisivo non isolato.
Esito osservato da ActionResolved: fail, etichetta «🤸 Gettati sulla traiettoria»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🤸Gettati sulla traiettoriaFISICO · 67 / ✋Devia di piede sul paloTECNICA · 55 / 📣Avvisa il portiereTECNICA · 55. Alias del pulsante scelto: 🤸 Gettati sulla traiettoria; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi157-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi157-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi157-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi157-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi157-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi157-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #184 [tackle]: «✋ Lettura della linea di passaggio — intercetta!» · AZIONE «✋ Intercetta il filtrante» → success

NOTA: Il pericolo annunciato e assente all'apertura; l'esito e visivamente leggibile. Codici 001.
01 Apertura: Foto 01: eroe granata vicino al centrocampo, ma portatore e palla assenti; distanza eroe-pallone 12,50 u. Il filtrante da intercettare non entra nella scena iniziale. Distanza eroe–pallone dal testimone: 12.50 u.
03–05 Inquadratura: Foto 03-05: l'avversario compare poi da sinistra, palla ed eroe restano in quadro durante l'intercetto.
06 Esito visibile: Foto 06: Chiusura impeccabile e Intercetti il filtrante, pallone ai piedi del granata, tabellone 0-0; coerente con success.
Gesto scelto: Parziale: nelle foto 04-05 il protagonista va incontro alla palla e la possiede in esito, ma il tocco non e isolato.
Esito osservato da ActionResolved: success, etichetta «✋ Intercetta il filtrante»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✋Intercetta il filtrantePOSIZIONAMENTO · 68 / ⚡Scatta sulla linea di passaggioVELOCITÀ · 59 / 🧠Leggi e taglia il corridoioMENTALITÀ · 67. Alias del pulsante scelto: ✋ Intercetta il filtrante; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 3.5u, eroe ≥5.5u per 87 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi184-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi184-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi184-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi184-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi184-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi184-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #184 [tackle]: «✋ Lettura della linea di passaggio — intercetta!» · AZIONE «✋ Intercetta il filtrante» → fail

NOTA: Pericolo non inquadrato all'avvio e camera che spinge l'eroe sul margine durante il gesto. Codici 001, 002.
01 Apertura: Foto 01: eroe al centrocampo, ma portatore e pallone fuori quadro; distanza eroe-pallone 12,50 u. Il filtrante annunciato non si vede. Distanza eroe–pallone dal testimone: 12.50 u.
03–05 Inquadratura: Foto 03-04: eroe visibile, palla assente; foto 05: protagonista spinto fino al bordo destro, in parte tagliato, mentre l'avversario compare a sinistra. Palla non distinguibile.
06 Esito visibile: Foto 06: Superato dall'avversario e Supera la pressione, tabellone 0-0. Il superamento e possibile ma il contatto decisivo non compare; nessun 003 certo.
Gesto scelto: Non verificato: la lettura/intercetto fallito non si vede compiutamente nei sei scatti.
Esito osservato da ActionResolved: fail, etichetta «✋ Intercetta il filtrante»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: ✋Intercetta il filtrantePOSIZIONAMENTO · 68 / ⚡Scatta sulla linea di passaggioVELOCITÀ · 59 / 🧠Leggi e taglia il corridoioMENTALITÀ · 67. Alias del pulsante scelto: ✋ Intercetta il filtrante; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 3.8u, eroe ≥12.5u per 104 campioni)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi184-a0-fail-v2-84-01-apertura-retry1.png) · [02-scelta](collaudo-difesa-3d/gi184-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi184-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi184-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi184-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi184-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #24 [pass]: «🧠 Ricezione tra le linee!» · AZIONE «🎯 Assist filtrante» → success

NOTA: Nessun difetto dimostrato nei sei scatti; controllo d'attacco leggibile. Nessun codice assegnato.
01 Apertura: Foto 01: eroe granata e avversario visibili, pallone ai piedi dell'eroe; distanza testimone eroe-pallone 0,00 u. Ricezione fra le linee leggibile. Distanza eroe–pallone dal testimone: 0.00 u.
03–05 Inquadratura: Foto 03-05: eroe, avversario e palla restano nel quadro durante la progressione e l'assist.
06 Esito visibile: Foto 06: Assist decisivo e Passaggio da manuale, tabellone 1-0; il destinatario e presso la porta. Il momento esatto del gol non e isolato ma il finale e compatibile con l'assist registrato.
Gesto scelto: Si: preparazione e passaggio in avanti visibili fra le foto 03-05.
Esito osservato da ActionResolved: success, etichetta «🎯 Assist filtrante»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🎯Assist filtrantePASSAGGIO · 50 / ⚡Accelera verso portaVELOCITÀ · 59. Alias del pulsante scelto: 🎯 Assist filtrante; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · SALTO del pallone di 6.4 unità in 16 ms (a x 50.6, a 6.5s dall'inizio scena, scrittore: 16) — 400 u/s, sembra un teletrasporto  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi24-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi24-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi24-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi24-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi24-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi24-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #24 [pass]: «🧠 Ricezione tra le linee!» · AZIONE «🎯 Assist filtrante» → fail

NOTA: Nessun difetto dimostrato negli scatti del controllo d'attacco. Nessun codice assegnato.
01 Apertura: Foto 01: protagonista granata e marcatore visibili, palla ai piedi dell'eroe; distanza testimone eroe-pallone 0,00 u. Distanza eroe–pallone dal testimone: 0.00 u.
03–05 Inquadratura: Foto 03-05: eroe, palla e avversari nel quadro; il passaggio verso il compagno e la successiva intercettazione sono leggibili.
06 Esito visibile: Foto 06: Conclusione murata e Murato dalla difesa, tabellone 0-0. L'avversario e vicino al pallone; risultato compatibile con fail.
Gesto scelto: Si: progressione e passaggio dell'eroe visibili; il contatto esatto dell'intercetto e non verificato nelle sei foto.
Esito osservato da ActionResolved: fail, etichetta «🎯 Assist filtrante»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🎯Assist filtrantePASSAGGIO · 50 / ⚡Accelera verso portaVELOCITÀ · 59. Alias del pulsante scelto: 🎯 Assist filtrante; posizione: 0.
Foto: [01-apertura](collaudo-difesa-3d/gi24-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi24-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi24-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi24-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi24-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi24-a0-fail-v2-84-06-esito.png).

### [KE 7.999.84] SIT #2 [shot]: «⚡ Tap-in! Porta quasi vuota.» · AZIONE «🦵 Spingila dentro!» → success

NOTA: Nessun difetto dimostrato negli scatti del controllo d'attacco. Nessun codice assegnato.
01 Apertura: Foto 01: eroe granata e pallone visibili davanti alla porta quasi vuota; distanza eroe-pallone 0,00 u. Contesto del tap-in chiaro. Distanza eroe–pallone dal testimone: 0.00 u.
03–05 Inquadratura: Foto 03-05: protagonista, pallone e porta restano nel quadro durante la spinta e l'arrivo in rete.
06 Esito visibile: Foto 06: RETE! e Dentro perfetto, nessuno scampo, tabellone 1-0; pallone nella zona della porta. Esito compatibile con success.
Gesto scelto: Si: preparazione, spinta verso la porta e arrivo del pallone leggibili fra le foto 03-05.
Esito osservato da ActionResolved: success, etichetta «🦵 Spingila dentro!»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🦵Spingila dentro!TIRO · 69 / 🎯PrecisioneTECNICA · 55 / ⚡Conclusione di primaFISICO · 67. Alias del pulsante scelto: 🦵 Spingila dentro!; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · corpo↔porta al contatto: 15° (eroe a x 43.4, z -9.7)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi2-a0-success-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi2-a0-success-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi2-a0-success-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi2-a0-success-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi2-a0-success-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi2-a0-success-v2-84-06-esito.png).

### [KE 7.999.84] SIT #2 [shot]: «⚡ Tap-in! Porta quasi vuota.» · AZIONE «🦵 Spingila dentro!» → fail

NOTA: Nessun difetto dimostrato negli scatti del controllo d'attacco; testo del portiere sostenuto dalla sua presenza nel quadro. Nessun codice assegnato.
01 Apertura: Foto 01: eroe granata, palla e portiere visibili davanti alla porta; distanza testimone eroe-pallone 0,00 u. Distanza eroe–pallone dal testimone: 0.00 u.
03–05 Inquadratura: Foto 03-05: eroe, pallone, portiere e porta restano in quadro durante il tiro.
06 Esito visibile: Foto 06: Il portiere dice di no e Tiro debole, para comodo, tabellone 0-0; portiere visibile vicino alla porta. Il momento esatto della presa non e isolato.
Gesto scelto: Si: preparazione e tiro dell'eroe verso la porta leggibili fra le foto 03-05.
Esito osservato da ActionResolved: fail, etichetta «🦵 Spingila dentro!»; corrispondenza sì; acquisizione valida.
Pulsanti azione visibili: 🦵Spingila dentro!TIRO · 69 / 🎯PrecisioneTECNICA · 55 / ⚡Conclusione di primaFISICO · 67. Alias del pulsante scelto: 🦵 Spingila dentro!; posizione: 0.
Bozza automatica (dato grezzo, richiede controllo visivo): Cosa ho visto (bozza automatica): · codice 007 — la CAMERA salta: passo di 5.9 unità fra due fotogrammi a scena in corso (367 u/s) — a 1.2s dall'inizio scena, intervallo 16ms · corpo↔porta al contatto: 17° (eroe a x 43.4, z -9.7)  Cosa non va secondo me:
Foto: [01-apertura](collaudo-difesa-3d/gi2-a0-fail-v2-84-01-apertura.png) · [02-scelta](collaudo-difesa-3d/gi2-a0-fail-v2-84-02-scelta.png) · [03-rincorsa](collaudo-difesa-3d/gi2-a0-fail-v2-84-03-rincorsa.png) · [04-contatto](collaudo-difesa-3d/gi2-a0-fail-v2-84-04-contatto.png) · [05-volo](collaudo-difesa-3d/gi2-a0-fail-v2-84-05-volo.png) · [06-esito](collaudo-difesa-3d/gi2-a0-fail-v2-84-06-esito.png).

## Tentativi non validi conservati

Nessuno.


## Cinque segnalazioni più gravi

- **alta, codici 001, 002, 003, 133:0:fail** — Persistono apertura e inquadratura cieche; il punteggio anticipa il gol visibile. 003 e un'ipotesi fotografica, non una divergenza da ActionResolved. Prove: [foto](collaudo-difesa-3d/gi133-a0-fail-v2-84-01-apertura.png), [foto](collaudo-difesa-3d/gi133-a0-fail-v2-84-03-rincorsa.png), [foto](collaudo-difesa-3d/gi133-a0-fail-v2-84-05-volo.png), [foto](collaudo-difesa-3d/gi133-a0-fail-v2-84-06-esito.png). Da radice del repository: `$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_CASES='133:0:fail'; $env:CPM_CAPTURE_TAG='riproduzione'; node tests/codex/collaudo-difesa-3d.mjs`.
- **alta, codici 001, 002, 133:0:success** — Rispetto alla 7.999.82 il testo finale da portiere e corretto; apertura e inquadratura continuano a non mostrare palla e intervento. Prove: [foto](collaudo-difesa-3d/gi133-a0-success-v2-84-01-apertura.png), [foto](collaudo-difesa-3d/gi133-a0-success-v2-84-04-contatto.png), [foto](collaudo-difesa-3d/gi133-a0-success-v2-84-06-esito.png). Da radice del repository: `$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_CASES='133:0:success'; $env:CPM_CAPTURE_TAG='riproduzione'; node tests/codex/collaudo-difesa-3d.mjs`.
- **alta, codici 002, 003, 157:0:fail** — 002 per il corpo tagliato nel gesto; 003 ipotetico per il tabellone anticipato rispetto al tiro mostrato, non per discordanza dell'esito dal testimone. Prove: [foto](collaudo-difesa-3d/gi157-a0-fail-v2-84-03-rincorsa.png), [foto](collaudo-difesa-3d/gi157-a0-fail-v2-84-05-volo.png), [foto](collaudo-difesa-3d/gi157-a0-fail-v2-84-06-esito.png). Da radice del repository: `$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_CASES='157:0:fail'; $env:CPM_CAPTURE_TAG='riproduzione'; node tests/codex/collaudo-difesa-3d.mjs`.
- **alta, codici 003, 33:0:fail** — La nuova apertura elimina il vecchio 001, ma il punteggio cambia prima che le foto mostrino il gol; 003 resta ipotesi visiva da riprodurre. Prove: [foto](collaudo-difesa-3d/gi33-a0-fail-v2-84-01-apertura.png), [foto](collaudo-difesa-3d/gi33-a0-fail-v2-84-03-rincorsa.png), [foto](collaudo-difesa-3d/gi33-a0-fail-v2-84-06-esito.png). Da radice del repository: `$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_CASES='33:0:fail'; $env:CPM_CAPTURE_TAG='riproduzione'; node tests/codex/collaudo-difesa-3d.mjs`.
- **alta, codici 001, 003, 134:0:fail** — Il codice 003 resta una possibile incoerenza del tabellone anticipato; gli scatti non provano il momento esatto del gol fuori quadro. Apertura ancora coperta dal pannello. Prove: [foto](collaudo-difesa-3d/gi134-a0-fail-v2-84-01-apertura.png), [foto](collaudo-difesa-3d/gi134-a0-fail-v2-84-03-rincorsa.png), [foto](collaudo-difesa-3d/gi134-a0-fail-v2-84-05-volo.png), [foto](collaudo-difesa-3d/gi134-a0-fail-v2-84-06-esito.png). Da radice del repository: `$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_CASES='134:0:fail'; $env:CPM_CAPTURE_TAG='riproduzione'; node tests/codex/collaudo-difesa-3d.mjs`.


## Limiti del campionamento

- Sei foto campionano ciascuna scena: movimento fra le foto, sincronismo esatto e continuità non verificati.
- I codici sono quelli del menu in `src/15-live-match.jsx:10547`; una bozza automatica da sola non basta per trasformare una possibilità in difetto confermato.
- Quando un caso non esiste o l’azione attesa manca, il registro lo conserva con il motivo; non viene sostituito con un’altra scena.
- Il confronto con partite naturali e il collaudo su telefono non fanno parte di questo lotto: non verificati.
