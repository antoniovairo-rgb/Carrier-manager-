# Collaudo camera 007 — non misurabile in modo sufficiente su questo PC

Base verificata: `main` al commit `ccabb486d7bc957edc8d7a39ef45d2c51bb80d32`, `GAME_VERSION="7.999.96"`; ramo `codex/2026-10-01-collaudo-camera-007`. Il programma prevedeva 10 scene × 2 esiti × 3 ripetizioni = 60 casi e una partita naturale. Sono stati eseguiti **13 tentativi** su 7 combinazioni scena/esito/ripetizione; **1 solo** ha raggiunto la soglia di **50 FPS medi**. Il collaudo nel suo complesso è **non verificato**. Non assegno un esito «riprodotto» o «non riprodotto» al codice 007.

## Ambiente e comandi

Chrome usa la GPU `ANGLE (Intel(R) UHD Graphics 620, Direct3D11)` in tutti i tentativi; 412×915, `__CPM_GLB=true`, `__CPM_PRESENT=1`, `__CPM_CINE=1`, pagina/contesto nuovo per caso, nessun `SwiftShader`. I tentativi sono nel grezzo `tests/codex/collaudo-camera-007.json.gz` con FPS rAF e `__CPM_FPS708` distinti. Comandi completi da PowerShell, dalla radice del repository:

```powershell
$env:CPM_BATCH='1'; $env:CPM_CASES='171:success:1'; $env:CPM_DSF='2'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; Remove-Item Env:CPM_HEADED -ErrorAction SilentlyContinue; node tests/codex/collaudo-camera-007.mjs
$env:CPM_BATCH='1'; $env:CPM_CASES='171:success:2'; $env:CPM_HEADED='1'; $env:CPM_DSF='2'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/collaudo-camera-007.mjs
$env:CPM_BATCH='1'; $env:CPM_CASES='171:fail:1'; $env:CPM_HEADED='1'; $env:CPM_DSF='1'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/collaudo-camera-007.mjs
```

La sonda registra `__CPM_CAMSTEP93`, FPS medio da `requestAnimationFrame`, renderer, `__CPM_FPS708`, bozza automatica e `ActionResolved`. I 13 tentativi hanno `ActionResolved` concorde con l'esito richiesto, ma solo la riga con FPS ≥50 è ammessa al giudizio. La scala pixel 1 conserva il viewport richiesto ma riduce la risoluzione fisica rispetto alla scala 2; è dichiarata per ogni caso.

| Scena/esito/rip. | Chrome | Scala pixel | FPS rAF medio | Valido ≥50 | Passi registrati >2,5 u | 007 fuori stacco |
| --- | --- | ---: | ---: | --- | ---: | --- |
| 171/success/1 | headless D3D11 | 2 | 46,20 | no | 1 | non verificato |
| 126/success/1 | headless D3D11 | 2 | 43,08 | no | 1 | non verificato |
| 171/success/2 | visibile D3D11 | 2 | 49,12 | no | 1 | non verificato |
| 171/success/3 | visibile D3D11 | 2 | 48,76 | no | 1 | non verificato |
| 2/success/1 | visibile D3D11 | 2 | 48,29 | no | 1 | non verificato |
| 171/fail/1 | visibile D3D11 | 1 | **52,64** | **sì** | 2 | **0** |
| 171/success/1 | visibile D3D11 | 1 | 38,86 | no | 1 | non verificato |
| 171/success/1 | visibile D3D11 | 1 | 39,79 | no | 1 | non verificato |
| 171/success/1 | headless D3D11 | 1 | 42,54 | no | 1 | non verificato |
| 171/success/2 | visibile D3D11 | 1 | 46,65 | no | 1 | non verificato |
| 171/success/3 | visibile D3D11 | 1 | 39,48 | no | 1 | non verificato |
| 171/fail/2 | visibile D3D11 | 1 | 37,50 | no | 2 | non verificato |
| 126/success/1 | visibile D3D11 | 1 | 42,62 | no | 1 | non verificato |

Nel solo caso valido, `171/fail/1`, i due record oltre 2,5 u hanno `cut:true`: passo **53,51 u** con fotogramma reale di **300 ms** a 1.357 ms dalla scena, e **6,40 u** con **89 ms** a 1.515 ms. Non c'è un salto valido fuori stacco in quel caso; la bozza non emette 007. I numeri non sono stati confrontati con un video perché non esiste un candidato fuori stacco da illustrare. Per la domanda «numeri 007 identici fra 171 e 126» la risposta è **non verificato**, dato che 126 non ha raggiunto 50 FPS.

I restanti 53 casi del piano e la partita naturale con almeno tre highlight non sono stati eseguiti: la macchina è scesa a **1,95–2,48 GiB** liberi durante i lotti e la sonda si è fermata per proteggere il PC. Ho provato la configurazione visibile e headless con scala 2 e 1; il successo isolato non rende attendibile l'intero campione. Una nuova esecuzione su GPU più veloce può ripartire dallo script senza modificare il gioco.

Nessuna conclusione sul telefono o sulla correttezza della camera. Nessuna patch al gioco, pull request, merge o deploy.
