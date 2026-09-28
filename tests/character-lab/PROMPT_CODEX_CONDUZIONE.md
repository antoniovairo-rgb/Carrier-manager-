# Scheda per Codex — piede in conduzione (confronto a bracci) e profilo dell'apertura

Base: `main` con `GAME_VERSION="7.999.44"` o successiva (verifica nel file prima di partire). Da incollare in Codex così com'è.

---

Sei il tester esterno di CARRIER-MANAGER. Regole invariate: **non modifichi il gioco** (`src/`, `CARRIER-MANAGER-AV.html`, `tests/visual/`), scrivi **solo** in `reports/codex/` e `tests/codex/`. Nessun commit, nessuna pull request, nessuna credenziale, nessun deploy. Ogni numero viene da un comando che riporti per intero; ciò che non misuri lo scrivi «non verificato». Stesse condizioni di validità del tuo rapporto `2026-09-28-fluidita-3d.md`: Chrome con GPU D3D11, 412×915, deviceScaleFactor 2, scena valida solo con FPS mediano ≥45.

## Perché

Il tuo rapporto (grazie: è la prima misura del piede a 60 FPS) dice che lo scivolamento peggiore in conduzione è a **3-6 u/s (mediana 4,15)** e non a 9+ (1,94). Nel nostro provino a passo fisso, a velocità **costante**, le stesse velocità scivolano 0,5-0,9. Ipotesi nostra, da confermare o smentire: il piede scivola nelle **accelerazioni e frenate**, perché la cadenza delle gambe segue una velocità smussata (`src/12-three-match-view.jsx`, cerca `__CPM_SPS44`) che resta indietro rispetto al corpo. Seconda ipotesi: il piano chiede all'eroe 11 u/s in conduzione, oltre gli 8,47 che le gambe sanno disegnare (cerca `__CPM_COND44`).

Il 7.999.44 **non cambia il gioco**: aggiunge due bracci spenti che accendi tu con `addInitScript`, prima del `goto`.

## Compito 1 — confronto a quattro bracci

Bracci: **A** nessun flag · **B** `window.__CPM_COND44=1` · **C** `window.__CPM_SPS44=1` · **D** entrambi.
Scene: le 15 di conduzione lunga del tuo rapporto (0, 16, 17, 42, 46, 50, 82, 83, 84, 87, 91, 96, 100, 102, 148) + gi38. Azione 0, esito `success`, `__CPM_CINE=1`, `__CPM_TIRO34_REC=1`. **Ogni braccio in pagina nuova** per scena, bracci alternati (A B C D A B C D…), **3 ripetizioni**.

Per ogni braccio, sui fotogrammi di conduzione dell'eroe (stesso criterio del tuo rapporto):
1. `sl` per fascia di velocità `v` (0-3, 3-6, 6-9, 9+): mediana, p95, campioni.
2. Lo stesso `sl` diviso in **accelerazione** (`v` che sale di oltre 0,5 u/s rispetto al fotogramma prima), **frenata** e **velocità stabile**. È il numero che decide fra le due ipotesi.
3. Scarto fra velocità del corpo e passo delle gambe: `v − rts × v0` (campi del testimone), mediana per fascia.
4. Campo nuovo `lag` (ritardo dell'eroe dal suo bersaglio, u): mediana e massimo per scena. Se all'avvio della conduzione supera 6 u l'eroe scatta a 13 u/s per recuperare (da noi misurato su gi38: 11,6 u).
5. Durata della conduzione e della scena (`hl_result`): il braccio B allunga i tratti di conduzione fino al 29%.

⚠️ I campi `rw`/`iw` del testimone risultano NaN da noi: non usarli.

Verdetto per braccio: quale riduce `sl` nella fascia 3-6 e nella 6-9 senza peggiorare le altre, con la differenza fra le ripetizioni accanto (se la differenza fra bracci è dentro la dispersione fra ripetizioni, scrivi «non separabile»).

## Compito 2 — profilo dell'apertura sulla build precompilata

Il tuo profilo attribuisce 955 ms di tempo proprio a `_dec918`, che formatta un numero e viene chiamata due volte per disegno (`src/15-live-match.jsx:860` e `:1168`): con il gioco compilato nel browser le posizioni del profilo non sono affidabili. Rifallo sulla build **precompilata**, dove i nomi e le righe corrispondono:
- `node tools/build-dist.mjs` produce `dist/index.html`; servilo in locale come fa `tools/validate-dist.mjs`.
- Stessa sonda d'apertura della volta scorsa (partita naturale, corpi pronti, 15 s d'attesa, 5 aperture), **senza** profiler per i numeri, **con** profiler per le funzioni.
- Riporta per la prima apertura le 10 funzioni per tempo proprio **dentro il solo long task più lungo** (non nella finestra di 4 s), con nome e riga di `dist/index.html`.

Se la build precompilata non si apre in modalità test (`?cpmtest=1`), scrivilo e usa la partita naturale.

## Compito 3 — gi87 in partita naturale (salto di 39 u)

Il salto di gi87 è candidato a una consegna del portatore tardiva, ma in scena forzata. Gioca 5 partite naturali (nomi diversi in `openMatch`, `__CPM_WS38_REC=1`) e cerca spostamenti del pallone oltre `85 u/s × dt + 0,5 u` mentre il portatore è l'eroe, con lo scrittore prima e dopo. Riporta minuto, scena e scrittore; se non ne trovi, scrivi quante scene hai osservato.

## Consegna

- Script in `tests/codex/conduzione-bracci.mjs`, `tests/codex/apertura-dist.mjs`, `tests/codex/salti-naturali.mjs`.
- Rapporto `reports/codex/2026-09-29-conduzione-bracci.md` + dati `.json`. Nel rapporto metti le tabelle **intere**: il PO ci porta il testo a mano, i file restano sul tuo PC.
