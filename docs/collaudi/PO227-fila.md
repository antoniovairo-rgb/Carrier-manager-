# PO-227 — fila dell'ingresso in campo: chi corre da fermo

Collaudo della collaudatrice, base `main` 7.999.159 (commit 995835f). Sola lettura sul gioco: nessuna modifica a `CARRIER-MANAGER-AV.html` né a `src/`. Nessuna correzione proposta.

Segnalazione del PO: «nelle file da fermo i giocatori ed i bambini continuano a correre da fermo».

## Esito in una riga

**I bambini sì: corrono con la clip di corsa a peso pieno anche quando sono fermi nella fila (22 bambini su 22). I giocatori CH38 no: da fermi usano l'idle (corsa da fermo totale 0,1 s su 89,6 s di fermo).** Il meccanismo dei bambini è una scrittura diretta a peso fisso nel render-loop del walkout, senza nessuna lettura della velocità.

## 1. Il codice (file:riga)

| Corpo | Dove si sceglie la clip | Cosa succede nel walkout |
|---|---|---|
| Giocatori (eroe + 21, CH38/CGTrader) | `CARRIER-MANAGER-AV.html:23111-23112` | Il peso della corsa (`_a._locB`) viene dalla velocità smussata `_a._spS`. Il walkout ha una discesa rapida (τ più corta, `:23112`, PO-197). |
| Giocatori, idle nella fila | `CARRIER-MANAGER-AV.html:23121-23122` | Nel walkout l'idle è congelato sulla finestra calma (PO-206, rosso `__CPM_NO_FILA206`). |
| **Bambini** (22 corpi) | `CARRIER-MANAGER-AV.html:18703` (render-loop, ramo `walkout`) | `if(_av911.run){ _av911.run.weight=1; _av911.run.timeScale=0.5; }` a **ogni fotogramma**, indipendentemente dalla velocità. `idle.weight=0.25` nella stessa riga. |
| Bambini, creazione | `CARRIER-MANAGER-AV.html:14433` | Al montaggio la clip di corsa parte a peso 0 (`run.weight=0`): il peso a 1 lo impone solo il walkout, al fotogramma successivo. |

Il ramo bambini non legge `_spS`, `_locB` né la velocità: non esiste una transizione idle↔corsa per loro nel walkout. Il fix PO-197 (`:23112`) e il fix PO-206 (`:23121`) riguardano solo i giocatori, perché il ramo dei bambini (`_av911`) non passa dal loop `_a`.

Nota di scope: il PO-206 diceva «i giocatori corrono sul posto quando sono in fila»; il collaudo di oggi mostra che i giocatori CH38 erano già a posto, e il difetto residuo è sui bambini.

## 2. Misura (GLB acceso, headless)

Sonda: `docs/collaudi/sonde/po227-fila-sonda.mjs` (sola osservazione: patch di lettura di `THREE.AnimationMixer.prototype.update`, pesi ed effetti non toccati). Dati grezzi: `docs/collaudi/PO227-dati/po227-dati-grezzi.json`. Riepilogo: `docs/collaudi/sonde/po227-riepilogo.mjs`.

- Partita: salvataggio `tests/visual/fixtures/save-194-primavera-w38.json` (lo stesso di `fila-206.mjs` e `walkout-fermi-197.mjs`), walkout forzato con `__CPM_FORCE_WALKOUT`, `?cpmtest=1`, `__CPM_WALKTEST74=1`, `__CPM_GLB=true`.
- Fermo = velocità del mixer < 0,5 u/s (soglia di `fila-206.mjs`). Tempo misurato in **secondi di scena** (somma degli argomenti `dt` di `update`), non in secondi reali.
- Testimone del corpo: `__CPM_HYPER_MASCOTS` = `{avatars:22, legacyVisible:0}` → 22 bambini costruiti dal ramo hyper (`:14417`–`:14440`), nessuno nel vecchio percorso procedurale.
- Due prove indipendenti (27 e 29 scatti, walkout). Stesso risultato in entrambe.

### Risultati per gruppo (seconda prova, 27 scatti)

| Gruppo (firma) | Corpi | Scena fermo | Di cui con clip di corsa a peso >0,3 | Clip viste |
|---|---|---|---|---|
| **Bambini** (scala 0,80, clip `idle`+`jog`) | 22 | 199,4 s | **199,4 s (100%)** | idle, jog |
| Giocatori CH38 (scala ~1,04, clip `mx-*`) | 23 | 89,5 s | **0,1 s (0,1%)** | idle, jog, + gesti |
| Non identificati (scala 1,04, sola clip `jog`) | 2 | 37,8 s | 37,8 s (100%) | jog |

Lettura dei numeri:
- Scena fermo dei bambini: circa 9 s di scena per bambino, in fila ferma.
- Ultimo scatto, tre bambini con velocità 0: `acts: ["idle:0.25", "jog:1.00"]` → la corsa è al peso pieno, l'idle a 0,25. Il contrario di quanto la scena mostra.
- Scatti con almeno un bambino fermo: 22 su 27.
- Giocatori: nel campione «fermo» l'idle domina, la corsa sta a zero (`:23112` + `:23121` funzionano).

**Corpi non identificati:** due corpi con sola clip `jog` e velocità 0 per tutta la fase (37,8 s). Scala 1,04, come i giocatori, ma senza clip di idle né gesti: non riesco a dire da quale percorso vengano (possibile panchina, staff o altro). **Non posso confermarlo** senza un testimone più fine. Vanno tenuti separati dai bambini.

## 3. Foto

Cinque foto in `docs/collaudi/PO227-foto/fila-ferma-1..5.png` (una ogni cinque scatti nel walkout). Inquadratura larga da regia: i corpi sono di pochi pixel, **la foto non permette di leggere la clip a occhio**. Il giudizio si regge sui numeri, non sulle foto.

## 4. Chi corre da fermo, per quanto tempo, e perché

- **Chi:** i 22 bambini dell'ingresso (scena ~9 s per bambino in fila ferma, nella sola osservazione); per la CAUSA dei due corpi non identificati non posso confermare nulla.
- **Per quanto:** per tutto il tratto in cui il bambino è fermo nel walkout (in questa misura, la maggior parte della fase walkout osservata).
- **Causa:** `CARRIER-MANAGER-AV.html:18703` — scrittura a peso fisso `run.weight=1` nel ramo walkout, senza condizione sulla velocità. Confermata dal dato (`jog:1.00` a velocità 0).

## Limiti

- Headless con GLB: il tempo di scena scorre molto più lento del reale (come documentato in CLAUDE.md, sezione CH38). Le durate sono in **secondi di scena**, non reali. Il rapporto fermo/corsa invece è adimensionale e non dipende dal tempo.
- Non ho misurato il telefono né il GLB spento (default previsto dal CLAUDE.md è GLB acceso, quindi la misura è su quello).
- La velocità 0,5 u/s è la soglia del probe `fila-206`; non ho testato soglie diverse.
- Le foto non sono state usate come prova di clip.

## Stato

CHIUSO per la diagnosi (causa e misura riproducibili, dati e sonda in `docs/collaudi/`). Non chiuso sul piano della correzione: nessuna correzione proposta come da istruzione. Restano aperti i due corpi non identificati.

CHIUSO — ma la misura è di secondo livello: il collaudo sul dispositivo del PO resta necessario per confermare la resa visiva (la foto non la risolve).
