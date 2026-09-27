# Schede di compito per Codex (da incollare una per volta)

Regole comuni: leggi prima `AGENTS.md`. Scrivi solo in `reports/codex/`. Nessuna modifica al gioco.

## Scheda 0 — Prova di fattibilità (da fare per prima, ~15 min)
**Obiettivo:** capire cosa l'ambiente sa fare davvero.
**Comandi:** `cd tests/visual && npm install`, `node ../../tools/build-src.mjs`, `npm run test:logic`, poi `timeout 900 npm run validate-situations`.
**Esito:** per ogni comando: riuscito sì/no, durata, errore esatto. Dichiara: versione di Node, se c'è un Chromium, se WebGL funziona senza GPU (il gate lo richiede), durata massima di un compito, accesso a internet sì/no.
**Fatto quando:** `reports/codex/<data>-fattibilita.md` esiste con queste risposte.

## Scheda 1 — Giudizio visivo dell'interfaccia (UI a più larghezze)
**Obiettivo:** trovare testi tagliati, pulsanti fuori schermo, contrasti illeggibili, elementi fuori standard.
**Comandi:** `node griglia-mobile.mjs` (produce scatti in `docs/collaudo-grafico/g0/<larghezza>/`: **non committarli**, copiali in `reports/codex/ui/`).
**Criteri:** (1) nessun testo tagliato o sovrapposto; (2) nessun elemento oltre il bordo destro; (3) testo leggibile sul fondo; (4) riquadri coerenti fra loro (stessi raggi, stesse ombre, stesso stile di titolo). Per ogni scatto: ok / anomalia, con la zona.
**Esito:** tabella schermata × larghezza con le anomalie e il loro criterio.
**Fatto quando:** tutte le schermate delle 5 larghezze sono giudicate.

## Scheda 2 — Revisione indipendente di una release
**Obiettivo:** leggere il diff di una release come un revisore che non l'ha scritta e segnalare possibili regressioni.
**Comandi:** `git log --oneline -5`, `git diff <release precedente>..<release> -- src/` (il gioco sta in `src/*.jsx`, il file HTML è generato).
**Criteri:** per ogni modifica: cosa cambia, quali altri punti del codice la leggono (cerca i nomi con `grep -n`), quale caso limite potrebbe rompersi, quale guardiano esistente la copre. Non proporre riscritture: solo rischi concreti con la riga.
**Esito:** elenco dei rischi con gravità e riga, più «nessun rischio trovato» per le parti controllate.
**Fatto quando:** ogni file toccato dal diff ha almeno una riga di giudizio.
