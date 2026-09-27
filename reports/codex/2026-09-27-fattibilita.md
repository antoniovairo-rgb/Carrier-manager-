# Scheda 0 — Prova di fattibilità

**Base verificata:** `origin/main` `25b5851e6d79dae5bd295849091eae27f3496cd8`, `GAME_VERSION="7.999.27"`. **Ramo di collaudo:** `codex/2026-09-27-fattibilita`. Nessun file del gioco modificato.

**Esito:** Node e Chromium sono disponibili; un contesto WebGL 2 funziona con SwiftShader (software). La suite logica passa **43/43** quando usa dipendenze già presenti in un altro checkout. `validate-situations` ha eseguito la parte 3D e registrato misure, ma non ha prodotto il verdetto finale: la visione AI è andata ripetutamente in `timeout Ollama` e la prova è stata interrotta dopo aver superato 900 secondi. **Non posso confermare** che il gate completo passi.

| Comando della scheda / controllo sostitutivo | Eseguito | Riuscito | Durata misurata | Errore esatto dall'output |
|---|---|---|---:|---|
| `cd tests/visual && npm install` | No | No | 0 s | Nessun output: comando non eseguito. |
| `node ../../tools/build-src.mjs` | No | No | 0 s | Nessun output: comando non eseguito. |
| `node ../../tools/build-src.mjs --check` | Sì | Sì | 0,601 s | Nessuno. Output: `build-src --check: CARRIER-MANAGER-AV.html è già allineato ai 21 frammenti.` |
| `npm run test:logic` | Sì | No | 10,365 s | `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'playwright' imported from C:\Users\a.vairo\Documents\ChatGPT\Analisi gioco codex\korward-codex-fattibilita\tests\visual\lib\harness.mjs` |
| `node --import ../codex/isolated-visual.mjs --test 'test/logic/*.test.mjs'` | Sì | Sì | 21,476 s | Nessuno: `tests 43`, `pass 43`, `fail 0`. |
| `timeout 900 npm run validate-situations` | No | No | 0 s | Nessun output: comando non eseguito. |
| `node tests/codex/run-validate.mjs` | Sì | No: interrotto prima del verdetto | **almeno 1.503 s** fra creazione del log e ultimo output | `[vision:error] highlight BLOCKED {"id":"gi0","kind":"timeout","msg":"timeout Ollama"}`; ripetuto per `gi1`. |
| `node --import ./tests/codex/isolated-visual.mjs ./tests/codex/webgl-probe.mjs` | Sì | Sì | 11,464 s | Nessuno. |

I due comandi di preparazione non eseguiti avrebbero scritto fuori dalle cartelle consentite da `AGENTS.md`: `npm install` in `tests/visual/node_modules` (e forse nel lockfile); `build-src.mjs` in `CARRIER-MANAGER-AV.html`. Il controllo `--check` è previsto dallo stesso builder e non scrive. Il runner originale `validate-situations` scrive in `tests/visual/out`, quindi l'ho eseguito con uno script in `tests/codex/` che reindirizza le sole scritture di output a `reports/codex/` e riusa in lettura le dipendenze di un altro checkout. Non è il comando letterale della scheda: la differenza è dichiarata nella tabella. Non ho eseguito `npx playwright install`.

Il [log della prova 3D](2026-09-27-fattibilita-gate.txt) registra `match pronto · 191 Situations · gameVersion 7.999.27`, i progressi fino a `160/191`, poi `final-state: campione 24 Situations risolte`, `timeline: 85 eventi · 24 risolti · 24 coerenti`, `bg-coherence: 223 voci ... · 0 issue`, `live-smoke: clock 1'→4' · numHL 2→3 · fase playing · 0 pageerror`. La presenza di `final-state` indica che la passata iniziale delle situazioni è terminata; non sostituisce il verdetto finale del gate. Misura prestazionale nel log: `perf: 5.7fps (avg 176.07ms · p95 216.7ms) · heap 149MB · load 25562ms · leak-slope 2.33MB/s · canvas 1`. La Scheda 0 non dichiara una soglia fps, quindi non classifico il valore come pass/fail.

| Ambiente | Misura |
|---|---|
| Node | `v24.17.0` |
| Chromium usato | `C:\Users\a.vairo\AppData\Local\ms-playwright\chromium-1228\chrome-win64\chrome.exe` (esistenza e avvio verificati) |
| Altro browser presente | `C:\Program Files\Google\Chrome\Application\chrome.exe`; `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (esistenza verificata, avvio non provato) |
| WebGL senza GPU hardware | Sì per la prova del contesto: `WebGL 2.0 (OpenGL ES 3.0 Chromium)` e renderer non mascherato `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`. Il gate 3D ha prodotto anche screenshot e misure su questo browser, ma non un esito complessivo. |
| Durata massima di un compito nell'ambiente | **Non posso confermarlo.** Il limite richiesto era 900 s; l'esecuzione osservata ha superato tale durata e l'ho interrotta manualmente. Il log va dalle 07:21:27 alle 07:46:30 UTC (almeno 25 min 03 s); non dispongo di un tempo finale preciso del processo. |
| Accesso a Internet | **Sì per GitHub:** `git fetch origin main` è riuscito nell'esecuzione autorizzata. Accesso generale ad altri domini: **Non posso confermarlo.** Il primo tentativo nella sandbox ristretta ha restituito `fatal: unable to access 'https://github.com/antoniovairo-rgb/Carrier-manager-.git/': schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS (0x8009030e) - Nessuna credenziale disponibile nel pacchetto di sicurezza`; non c'è stata una richiesta interattiva di credenziali né è stato inserito un segreto. |

**Limiti del risultato:** i timeout Ollama sono un fatto osservato, non una prova che il gioco fallisca. L'origine del tempo elevato e il limite massimo effettivo dell'ambiente non sono confermati. La misura WebGL software è positiva; la qualità visiva e il passaggio del gate completo restano da verificare. Una segnalazione di questo revisore resta un'ipotesi finché il team non la riproduce con un proprio guardiano, come prescrive `AGENTS.md`.
