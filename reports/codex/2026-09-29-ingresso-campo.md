# Prestazioni dell’ingresso in campo — 7.999.53

Cinque partite sintetiche con ingresso forzato dal varco di prova, viewport 412×915 e deviceScaleFactor 2. Il renderer letto in **ciascuna** partita è `ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00003EA0) Direct3D11 vs_5_0 ps_5_0, D3D11)`. I tempi sono intervalli di `requestAnimationFrame` durante `walkout`; i cinque intervalli peggiori sono indicati in secondi dal primo frame dell’ingresso. Il fischio è approssimato dal cambio di fase a `playing` rilevato dalla sonda.

## Comandi completi
- `$env:GIT_CONFIG_COUNT='1'; $env:GIT_CONFIG_KEY_0='safe.directory'; $env:GIT_CONFIG_VALUE_0='C:/Users/a.vairo/Documents/ChatGPT/Analisi gioco codex/korward-career-53'; $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; Remove-Item Env:CPM_MATCH_LIMIT -ErrorAction SilentlyContinue; node tests/codex/match-scenes-53.mjs entry`
- `$env:GIT_CONFIG_COUNT='1'; $env:GIT_CONFIG_KEY_0='safe.directory'; $env:GIT_CONFIG_VALUE_0='C:/Users/a.vairo/Documents/ChatGPT/Analisi gioco codex/korward-career-53'; $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_MATCH_START='3'; $env:CPM_MATCH_LIMIT='1'; $env:CPM_OUTPUT='entry-53-europeo-1.json'; node tests/codex/match-scenes-53.mjs entry`
- `$env:GIT_CONFIG_COUNT='1'; $env:GIT_CONFIG_KEY_0='safe.directory'; $env:GIT_CONFIG_VALUE_0='C:/Users/a.vairo/Documents/ChatGPT/Analisi gioco codex/korward-career-53'; $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_MATCH_START='4'; $env:CPM_MATCH_LIMIT='1'; $env:CPM_OUTPUT='entry-53-europeo-2.json'; node tests/codex/match-scenes-53.mjs entry`

Dati grezzi: `tests/codex/entry-53-primi-tre.json`, `tests/codex/entry-53-europeo-1.json`, `tests/codex/entry-53-europeo-2.json`. Script: `tests/codex/match-scenes-53.mjs`. Il processo iniziale è stato interrotto dopo tre partite valide quando la RAM libera è scesa a 0,64 GB; le due europee sono state eseguite in processi separati.

| Partita | Tipo | Ambiente | Frame | Durata s | Mediana ms | p95 ms | >50 ms | Cinque intervalli peggiori |
|---|---|---|---:|---:|---:|---:|---:|---|
| campionato-1 | league | Intel UHD 620 · D3D11 | 617 | 12,6 | 16,7 | 16,8 | 3 | 1,7 s: 1683,3 ms; 3,1 s: 450,2 ms; 2,4 s: 150,0 ms; 3,2 s: 49,9 ms; 1,7 s: 33,4 ms |
| campionato-2 | league | Intel UHD 620 · D3D11 | 624 | 11,0 | 16,7 | 16,8 | 1 | 0,6 s: 566,6 ms; 0,6 s: 33,4 ms; 1,5 s: 33,4 ms; 0,6 s: 33,3 ms; 0,9 s: 33,3 ms |
| campionato-3 | league | Intel UHD 620 · D3D11 | 593 | 10,7 | 16,7 | 19,0 | 7 | 10,2 s: 149,9 ms; 0,2 s: 113,0 ms; 0,1 s: 103,8 ms; 10,0 s: 100,8 ms; 9,9 s: 50,3 ms |
| europeo-1 | euro_group | Intel UHD 620 · D3D11 | 618 | 12,3 | 16,7 | 16,8 | 3 | 1,5 s: 1499,9 ms; 2,8 s: 300,0 ms; 2,3 s: 183,3 ms; 1,6 s: 33,4 ms; 2,4 s: 33,4 ms |
| europeo-2 | euro_group | Intel UHD 620 · D3D11 | 622 | 12,1 | 16,7 | 16,8 | 3 | 1,4 s: 1400,1 ms; 2,6 s: 266,7 ms; 2,1 s: 133,4 ms; 2,6 s: 33,3 ms; 1,4 s: 33,2 ms |

Totale: 5 partite, 17 intervalli oltre 50 ms. Le mediane di circa 16,7 ms indicano una cadenza vicina a 60 FPS fuori dagli stalli; la mediana da sola nasconde blocchi fino a 1683,3 ms.

Limiti: il salvataggio delle partite è sintetico e l’ingresso viene riattivato con `__CPM_FORCE_WALKOUT` dopo l’avvio della partita. Non posso confermare che gli stessi blocchi si presentino nel primo ingresso naturale né su telefono. La sonda associa i peggiori intervalli al tempo nella fase, ma non identifica da sola l’operazione interna responsabile.
