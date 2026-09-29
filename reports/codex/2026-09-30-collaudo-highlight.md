# Collaudo degli highlight 3D — 7.999.61

**Stato:** parziale — non è un verdetto finale.
**Base verificata:** GAME_VERSION=7.999.61; ramo codex/2026-09-30-collaudo-highlight.
**Copertura forzata:** 0/non verificato combinazioni azione×esito; 0/0 note esaminate visivamente.
**Partite naturali:** 0/6; 0 highlight acquisiti.

Comandi: `git ls-files tools/build-src.mjs`; `node tools/build-src.mjs --check`; `$env:CPM_BATCH="1"; node tests/codex/collaudo-highlight.mjs` (ripetere fino a completamento); `$env:CPM_MODE="natural"; node tests/codex/collaudo-highlight.mjs`; `node tests/codex/collaudo-highlight-report.mjs`.
Dati grezzi e checkpoint: [collaudo-highlight.json](../../tests/codex/collaudo-highlight.json).

## Classifica dei codici

| Codice | Frequenza verificata | Tre scene peggiori |
|---|---:|---|
| — | 0 | Nessuna nota visiva verificata, quindi nessun codice attribuito. |

## Scene forzate

| gi | Azione | Esito | Codici | Fotogrammi | Nota |
|---:|---|---|---|---|---|

## Note nel formato del taccuino

## Partite naturali

| Partita | Seme | Highlight | Fotogrammi | Nota |
|---:|---:|---|---|---|

## Differenze fra scene forzate e naturali

Non verificato: mancano scene naturali o note visive sufficienti.

## Limiti

Condizione prevista, ancora non verificata in questo checkpoint: Chrome headless con GPU software. In tale condizione tempi e fluidità non si giudicano; i fotogrammi consentono di giudicare soltanto pose, posizioni, direzioni e coerenza pallone/esito. Un fotogramma etichettato «contatto» o «volo» senza testimone positivo resta approssimativo e non prova da solo l’istante del gesto.

Errori registrati: 0. Le scene non acquisite o non osservate visivamente restano «non verificato».
