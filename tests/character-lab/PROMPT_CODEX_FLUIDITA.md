# Prompt per Codex — fluidità 3D degli highlight (eroe che avanza col pallone)

Base: `main` al commit `9d6b269e`, `GAME_VERSION="7.999.38"`. Da incollare in Codex così com'è.

---

Sei il tester esterno di CARRIER-MANAGER. Regole invariate (`AGENTS.md`): **non modifichi il gioco** (`src/`, `CARRIER-MANAGER-AV.html`, `tests/visual/`), lavori sul ramo nuovo `codex/2026-09-28-fluidita-3d`, scrivi **solo** in `reports/codex/` e `tests/codex/`. Nessuna credenziale, nessun deploy, nessun merge, nessuna pull request. Ogni numero che scrivi deve venire da un comando che riporti per intero; ciò che non misuri lo scrivi «non verificato».

## Il problema del PO

«Movimenti poco fluidi quando l'eroe avanza con la palla.» Riguarda gli highlight 3D (fase `hl_result`), con i corpi GLB accesi (impostazione di default: **non** impostare `window.__CPM_GLB=false`).

## Condizione di validità (prima di tutto)

Il tuo rapporto precedente (scivolamento) aveva un FPS mediano di 8,44: a quella frequenza la fluidità non si può giudicare. Questa volta:

1. Avvia Chrome **con la GPU**: headed (`headless:false`) oppure `--headless=new` con `--use-angle=d3d11` (o `--enable-gpu`), viewport 412×915, `deviceScaleFactor` 2.
2. Misura gli FPS reali con `requestAnimationFrame` in ogni scena.
3. **Una scena con FPS mediano sotto 45 è «non valida»**: la riporti, ma non entra nelle conclusioni. Se nessuna configurazione arriva a 45, fermati e scrivi la configurazione provata e gli FPS ottenuti.

## Come arrivare alle scene

- Pagina `CARRIER-MANAGER-AV.html?cpmtest=1`, aperta come fa `tests/visual/lib/harness.mjs` (`openMatch`).
- `window.__CPM_FORCE_SIT(gi, true)` forza la scena; `window.__CPM_FORCE_OUTCOME='success'` o `'fail'` imposta l'esito; `window.__CPM_RESOLVE(i)` sceglie l'azione `i`.
- Le scene in cui l'eroe **porta palla** non si riconoscono dal censimento, che classifica per azione finale: `tests/character-lab/CENSIMENTO_SCENE.json`, elenco `righe`, campo `fam` (225 tiri, 156 passaggi, solo 3 dribbling e 7 costruzioni), mentre l'eroe conduce anche nella costruzione che precede un tiro. Riconoscile dal testimone: sono le scene con **almeno 1 s di scena** in cui lo scrittore del pallone ha il codice 4 o 14 (vedi sotto). Passa tutte le 191 scene con l'azione 0 ed esito `success`, poi tienine almeno 15. Fra queste devono esserci obbligatoriamente le scene del taccuino PO **#64, #81, #38, #152, #176, #92, #25**, misurate anche se conducono per meno di 1 s.
- Prima di `__CPM_RESOLVE` aspetta che i GLB siano montati (`window.__CPM_MXCLIP>0`, come fa `tests/visual/tiro-caricato-test.mjs`).

## Testimoni disponibili (sola lettura, si accendono prima del `goto` con `addInitScript`)

- `window.__CPM_TIRO34_REC=1` → `window.__CPM_TIRO34.f[]`: a ogni fotogramma di `hl_result` registra il gesto montato (`g`), il tempo della clip (`ct`), la velocità dell'eroe in pianta (`v`), le distanze pallone-piede sinistro/destro (`dL`, `dR`), lo scivolamento del piede d'appoggio (`sl`), l'arco del pallone (`arc`) e altri campi. Leggi il codice in `src/12-three-match-view.jsx` (cerca `__CPM_TIRO34_REC`) per il significato esatto di ogni campo, e citalo con il numero di riga.
- `window.__CPM_WS38_REC=1` → `window.__CPM_WS38[]`: `[t ms, codice, x, z]`, cioè chi ha scritto la posizione del pallone e dove, un campione per fotogramma. Il registro si ferma a 3000 campioni: svuotalo (`window.__CPM_WS38=[]`) all'inizio di ogni scena. Codici in `_WS524` (`src/10`): 3 inseguitore, 4 portatore, 13 buildup-volo, 14 incollato al portatore (etichetta storica «testa»), 2 arco, 1 scena, 10 consegna.
- `window.__CPM_PIEDI_REC=1` → `window.__CPM_PIEDI`: pattinamento dei piedi per corpo.
- `window.__CPM_STATE()`: posizioni di corpi e pallone (dalle mesh).

## Cosa misurare, per ogni scena valida

1. **Pallone attaccato al portatore**: con codice 4 o 14, distribuzione della distanza pallone-piede più vicino (mediana, p95, massimo). Riporta anche i fotogrammi in cui supera 1,5 u.
2. **Salti del pallone**: spostamento per fotogramma superiore a `velocità massima plausibile × dt + 0,5 u`, con il codice dello scrittore **prima e dopo** il salto. Sono le «teleportazioni» del taccuino: #64 21,1 u (inseguitore), #152 29,7 u, #81 37,3 u (scena).
3. **Strappi dell'eroe**: variazione di velocità fra fotogrammi consecutivi (u/s²) e inversioni di direzione oltre 90°. Riporta i fotogrammi oltre il 99° percentile, con il gesto montato in quel momento.
4. **Cambi di gesto**: quante volte al secondo cambia `g` mentre l'eroe porta palla, e se ci sono gesti che durano meno di 0,15 s.
5. **Pattinamento**: `sl` per fascia di velocità (0–3, 3–6, 6–9, 9+ u/s), con il numero di campioni per fascia. Una fascia sotto i 20 campioni non si conclude.
6. **Regolarità dei fotogrammi**: distribuzione dei `dt`, e fotogrammi oltre 50 ms insieme a ciò che succede in quel momento (cambio di gesto, primo montaggio di una clip, cambio di camera).

## Video (per il giudizio a occhio del PO)

Registra con `recordVideo` di Playwright le **5 scene peggiori** secondo le misure 1–4 e **2 scene migliori** per confronto. Nel rapporto metti i tempi (in secondi dal via della scena) dei punti da guardare.

## Consegna

- Script riproducibile in `tests/codex/fluidita-3d.mjs`.
- Rapporto in `reports/codex/2026-09-28-fluidita-3d.md` e dati grezzi in `.json`.
- Tabella per scena: gi, FPS mediano, valida sì/no, i punti 1–6. Poi una classifica dei difetti per frequenza × gravità, con fotogramma, scrittore o gesto coinvolto e riga di codice sospetta. La riga sospetta è un'**ipotesi**, da scrivere come tale.
- Dove ti sembra che un difetto sia del test e non del gioco, dillo esplicitamente.

## Già noto, da non rifare

- Il rapporto `2026-09-27-scivolamento-corsa.md` (a 8 FPS): rifallo solo alle nuove condizioni di validità.
- `cartellino` 1/10 e l'ipotesi sull'azzeramento con `!isResult`: la riproduciamo noi.
- 5 scene con l'eroe tagliato dall'inquadratura: già in coda da noi.
