# Istruzioni per agenti esterni (Codex) — Korward Elite

Sei un **collaudatore e revisore esterno**. Il team principale scrive il codice del gioco; tu produci misure, rapporti, schermate e
segnalazioni. Una tua segnalazione è un'ipotesi finché il team non la riproduce con un proprio guardiano.

## Confini (obbligatori)
- **Non modificare** `CARRIER-MANAGER-AV.html`, `src/**`, `assets/**`, `tools/**`, `sw.js`, `manifest.webmanifest`, `.github/**`.
- Scrivi **solo** in `reports/codex/` (rapporti) e, se serve uno script tuo, in `tests/codex/`.
- Lavora su un ramo tuo (`codex/<data>-<compito>`). Nessun merge, nessun deploy, nessuna pubblicazione.
- Nessuna credenziale: non ti servono chiavi, firme o token. Se un comando ne chiede una, fermati e scrivilo nel rapporto.
- Non ridistribuire i file di `assets/` fuori dal repository (licenze di terzi: corpi e animazioni CGTrader/Mixamo, ritratti).

## Preparazione
```bash
cd tests/visual && npm install          # dipendenze dei test (React/Three/Babel locali)
node ../../tools/build-src.mjs          # ricompone il gioco dai sorgenti (non modificarli)
export CPM_CHROME=$(node -e "console.log(require('playwright').chromium.executablePath())")  # se non c'è un Chromium in /opt/pw-browsers
```
Mai eseguire `npx playwright install` se l'ambiente ha già un Chromium.

## Comandi disponibili (senza segreti)
| Comando (da `tests/visual`) | Cosa misura | Durata indicativa |
|---|---|---|
| `npm run test:logic` | logica pura in Node | < 1 min |
| `npm run save-compat` | compatibilità dei salvataggi | 1-2 min |
| `npm run validate-situations` | gate delle 191 situazioni 3D | 8-12 min |
| `npm run motore-unico` | 4 partite vere: gol, tiri, occasioni dell'eroe | 10-12 min |
| `npm run career-critical` | carriera: settimane, classifiche, tornei | 10-15 min |
| `node griglia-mobile.mjs` | schermate a 360-430 px, testo piccolo, contrasto | 5-8 min |
| `node scene-origine-census.mjs` | scene dell'eroe per origine (fascia, angolo, piazzati) | 10-15 min |

## Formato di ogni esito
Un file `reports/codex/<data>-<compito>.json` e un riassunto `reports/codex/<data>-<compito>.md`:
```json
{ "versione": "GAME_VERSION letto dal file", "compito": "...", "comando": "...", "seme": "...",
  "misure": [{ "nome": "...", "valore": 0, "soglia": "...", "esito": "ok|anomalia" }],
  "segnalazioni": [{ "gravita": "alta|media|bassa", "descrizione": "...", "come_riprodurre": "...", "prove": ["percorso schermata o log"] }] }
```
Scrivi solo fatti misurati. Se non puoi verificare qualcosa, scrivi «Non posso confermarlo».

## Schede di compito
Le schede pronte sono in [docs/codex/SCHEDE.md](docs/codex/SCHEDE.md).
