# Ricollaudo difesa 3D — checkpoint, non concluso

Base del caso registrato: commit `d5d60bedec39b2d2dfbd7ebceccfa206999f36d2`, `GAME_VERSION="7.999.91"`. Ramo: `codex/2026-10-01-ricollaudo-difesa-3d`. Il piano comprende 16 scene × 2 esiti, cioè 32 casi. Questo documento **non è il rapporto finale**.

## Stato misurato

| Casi pianificati | Casi validi | Tentativi non validi | Casi ancora senza prova valida |
| ---: | ---: | ---: | ---: |
| 32 | 1 | 1 | 31 |

Fonte: `tests/codex/ricollaudo-difesa-3d.json`; riproduzione: `$env:CPM_BATCH='1'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`. Il primo caso valido era già nel checkpoint prima di questa ripresa. Non è stato ripetuto.

| Scena | Azione | Esito richiesto | Esito osservato | Prova |
| --- | --- | --- | --- | --- |
| 33 «Muro in area» | «Blocca con il corpo» | success | `ActionResolved.ok=true`, chiave `save`; caso valido | Sei PNG `reports/codex/ricollaudo-difesa-3d/gi33-a0-success-v91-01-apertura.png` … `06-esito.png`. |
| 33 «Muro in area» | «Blocca con il corpo» | fail | Non osservato: tentativo non valido | Zero foto. Durante `openMatch` il guardiano ha chiuso il browser quando la RAM libera è scesa a 1,4349 GiB; errore esatto `page.waitForFunction: Target page, context or browser has been closed`. Durata 20.912 ms. |

Nella foto `01-apertura` il pallone e i giocatori coinvolti sono nel quadro. La foto `04-contatto` mostra un giocatore in maglia rossa vicino al pallone e uno in maglia a righe distante; da un solo fotogramma non posso confermare che il blocco col corpo sia stato animato correttamente. La foto `06-esito` mostra 0–0 e il testo «Salvataggio decisivo! Blocca con il corpo»; il registro conferma l'esito success. L'attribuzione visiva del salvataggio all'eroe è **non verificata**. Nessun codice del taccuino assegnato su questa sola prova.

La macchina aveva 2,41 GiB liberi prima del secondo caso; durante il caricamento è scesa sotto il limite di sicurezza di 1,5 GiB, poi è risalita a 2,63 GiB dopo la chiusura. Queste letture provengono da `Get-CimInstance Win32_OperatingSystem` e dal campo `stopFreeGB` del grezzo. Il limite è del banco di collaudo su questo PC; non dimostra un problema del gioco. Non sono state misurate prestazioni o fluidità.

## Per la ripresa

Conservare il checkpoint e continuare dai casi senza una prova `valid=true`, con pagina nuova per ciascuno: il tentativo interrotto su gi33/fail va ripetuto. La sonda ora verifica **3,5 GiB liberi prima di avviare Chromium**; la verifica senza browser con memoria inferiore ha stampato «Lotto non avviato» e lasciato il contatore `runs` a 2 prima e dopo. Comandi: `node --check tests/codex/ricollaudo-difesa-3d.mjs` e `$env:CPM_BATCH='1'; node tests/codex/ricollaudo-difesa-3d.mjs`. Il browser headless usa SwiftShader; occorre più RAM libera prima di tentare altri casi. Restano da produrre la tabella di confronto con 7.999.84, i conteggi dei codici sui 32 casi e le cinque segnalazioni più gravi. Fino ad allora tutti questi risultati sono **non verificati**.
