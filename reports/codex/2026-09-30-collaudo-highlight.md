# Collaudo degli highlight 3D — 7.999.61

**Stato:** parziale — non è un verdetto finale.
**Base verificata:** GAME_VERSION=7.999.61; ramo codex/2026-09-30-collaudo-highlight.
**Copertura forzata:** 4/1146 combinazioni azione×esito; 4/4 note esaminate visivamente.
**Partite naturali:** 1/6; 8 highlight intercettati, 0 con tutti i sei fotogrammi richiesti. Gli altri non costituiscono una revisione visiva completa.

Comandi: `git ls-files tools/build-src.mjs`; `node tools/build-src.mjs --check`; `$env:CPM_BATCH="1"; node tests/codex/collaudo-highlight.mjs` (ripetere fino a completamento); `$env:CPM_MODE="natural"; node tests/codex/collaudo-highlight.mjs`; `node tests/codex/collaudo-highlight-report.mjs`.
Dati grezzi e checkpoint: [collaudo-highlight.json](../../tests/codex/collaudo-highlight.json).

## Classifica dei codici

| Codice | Frequenza verificata | Tre scene peggiori |
|---|---:|---|
| — | 0 | Nessuna nota visiva verificata, quindi nessun codice attribuito. |

## Scene forzate

| gi | Azione | Esito | Codici | Fotogrammi | Nota |
|---:|---|---|---|---|---|
| 0 | 🦵 Tiro angolato | fail | nessun difetto | [gi000-a0-fail-01-apertura.png](collaudo-highlight/gi000-a0-fail-01-apertura.png) [gi000-a0-fail-02-scelta.png](collaudo-highlight/gi000-a0-fail-02-scelta.png) [gi000-a0-fail-03-rincorsa.png](collaudo-highlight/gi000-a0-fail-03-rincorsa.png) [gi000-a0-fail-04-contatto.png](collaudo-highlight/gi000-a0-fail-04-contatto.png) [gi000-a0-fail-05-volo.png](collaudo-highlight/gi000-a0-fail-05-volo.png) [gi000-a0-fail-06-esito.png](collaudo-highlight/gi000-a0-fail-06-esito.png) | Nessun codice attribuito: 03 è oscurato; 04–06 mostrano la palla lontana dal portiere, ma il contatto della parata non è visibile. Coerenza della dicitura parata facile non verificata. |
| 0 | 🦵 Tiro angolato | success | nessun difetto | [gi000-a0-success-01-apertura.png](collaudo-highlight/gi000-a0-success-01-apertura.png) [gi000-a0-success-02-scelta.png](collaudo-highlight/gi000-a0-success-02-scelta.png) [gi000-a0-success-03-rincorsa.png](collaudo-highlight/gi000-a0-success-03-rincorsa.png) [gi000-a0-success-04-contatto.png](collaudo-highlight/gi000-a0-success-04-contatto.png) [gi000-a0-success-05-volo.png](collaudo-highlight/gi000-a0-success-05-volo.png) [gi000-a0-success-06-esito.png](collaudo-highlight/gi000-a0-success-06-esito.png) | Nessun difetto provato: il tiro parte e il risultato diventa 1–0 (fotogrammi 03–06). La bozza misura 36° corpo-porta, ma le immagini non dimostrano una direzione errata. |
| 0 | 🎯 Piazzato basso | fail | nessun difetto | [gi000-a1-fail-01-apertura.png](collaudo-highlight/gi000-a1-fail-01-apertura.png) [gi000-a1-fail-02-scelta.png](collaudo-highlight/gi000-a1-fail-02-scelta.png) [gi000-a1-fail-03-rincorsa.png](collaudo-highlight/gi000-a1-fail-03-rincorsa.png) [gi000-a1-fail-04-contatto.png](collaudo-highlight/gi000-a1-fail-04-contatto.png) [gi000-a1-fail-05-volo.png](collaudo-highlight/gi000-a1-fail-05-volo.png) [gi000-a1-fail-06-esito.png](collaudo-highlight/gi000-a1-fail-06-esito.png) | Nessun difetto provato: 05 mostra la palla a sinistra della porta e il risultato resta 0–0. Il contatto con il palo non è catturato; dicitura Palo pieno non verificata. |
| 0 | 🎯 Piazzato basso | success | nessun difetto | [gi000-a1-success-01-apertura.png](collaudo-highlight/gi000-a1-success-01-apertura.png) [gi000-a1-success-02-scelta.png](collaudo-highlight/gi000-a1-success-02-scelta.png) [gi000-a1-success-03-rincorsa.png](collaudo-highlight/gi000-a1-success-03-rincorsa.png) [gi000-a1-success-04-contatto.png](collaudo-highlight/gi000-a1-success-04-contatto.png) [gi000-a1-success-05-volo.png](collaudo-highlight/gi000-a1-success-05-volo.png) [gi000-a1-success-06-esito.png](collaudo-highlight/gi000-a1-success-06-esito.png) | Nessun difetto provato: la palla raggiunge la porta e il risultato è 1–0 (fotogrammi 03–06). Contatto e volo esatti non marcati dai testimoni. |

## Note nel formato del taccuino

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🦵 Tiro angolato» → success
NOTA: Cosa ho visto (bozza automatica): · corpo↔porta al contatto: 36° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x 43.4, z 4.1)  Cosa non va secondo me:  Nessun difetto provato: il tiro parte e il risultato diventa 1–0 (fotogrammi 03–06). La bozza misura 36° corpo-porta, ma le immagini non dimostrano una direzione errata.

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🦵 Tiro angolato» → fail
NOTA: Cosa ho visto (bozza automatica): · corpo↔porta al contatto: 5° (eroe a x 44, z 4.6)  Cosa non va secondo me:  Nessun codice attribuito: 03 è oscurato; 04–06 mostrano la palla lontana dal portiere, ma il contatto della parata non è visibile. Coerenza della dicitura parata facile non verificata.

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🎯 Piazzato basso» → success
NOTA: Cosa ho visto (bozza automatica): · corpo↔porta al contatto: 7° (eroe a x 43.4, z 3.4)  Cosa non va secondo me:  Nessun difetto provato: la palla raggiunge la porta e il risultato è 1–0 (fotogrammi 03–06). Contatto e volo esatti non marcati dai testimoni.

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🎯 Piazzato basso» → fail
NOTA: Cosa ho visto (bozza automatica): · codice 012 — il pallone è tornato INDIETRO di 12.2 unità durante l'azione (dal punto più avanzato, verso la propria metà campo) — massimo arretramento a 31.5s dall'inizio scena; passo peggiore 1.1u in 322ms a 23.6s, scrittore: 16 · corpo↔porta al contatto: 37° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x 43.3, z 4.1)  Cosa non va secondo me:  Nessun difetto provato: 05 mostra la palla a sinistra della porta e il risultato resta 0–0. Il contatto con il palo non è catturato; dicitura Palo pieno non verificata.

## Partite naturali

| Partita | Seme | Highlight | Fotogrammi | Nota |
|---:|---:|---|---|---|
| 1 | 5100 | gi 90 — ✈️ Testa su cross dalla trequarti! | [naturale-0-h1-01-apertura.png](collaudo-highlight/naturale-0-h1-01-apertura.png) [naturale-0-h1-03-rincorsa.png](collaudo-highlight/naturale-0-h1-03-rincorsa.png) [naturale-0-h1-04-contatto.png](collaudo-highlight/naturale-0-h1-04-contatto.png) [naturale-0-h1-05-volo.png](collaudo-highlight/naturale-0-h1-05-volo.png) [naturale-0-h1-06-esito.png](collaudo-highlight/naturale-0-h1-06-esito.png) | da esaminare visivamente |
| 1 | 5100 | gi 80 — 📐 Angolo sul secondo palo! | [naturale-0-h2-01-apertura.png](collaudo-highlight/naturale-0-h2-01-apertura.png) [naturale-0-h2-03-rincorsa.png](collaudo-highlight/naturale-0-h2-03-rincorsa.png) [naturale-0-h2-04-contatto.png](collaudo-highlight/naturale-0-h2-04-contatto.png) [naturale-0-h2-05-volo.png](collaudo-highlight/naturale-0-h2-05-volo.png) | da esaminare visivamente |
| 1 | 5100 | gi 169 — 😱 Il portiere è fuori dai pali! Tira da lontano. | [naturale-0-h3-01-apertura.png](collaudo-highlight/naturale-0-h3-01-apertura.png) [naturale-0-h3-03-rincorsa.png](collaudo-highlight/naturale-0-h3-03-rincorsa.png) [naturale-0-h3-04-contatto.png](collaudo-highlight/naturale-0-h3-04-contatto.png) [naturale-0-h3-05-volo.png](collaudo-highlight/naturale-0-h3-05-volo.png) | da esaminare visivamente |
| 1 | 5100 | gi 7 — ✈️ Cross in area! Attacca il pallone. | [naturale-0-h4-01-apertura.png](collaudo-highlight/naturale-0-h4-01-apertura.png) [naturale-0-h4-03-rincorsa.png](collaudo-highlight/naturale-0-h4-03-rincorsa.png) [naturale-0-h4-04-contatto.png](collaudo-highlight/naturale-0-h4-04-contatto.png) [naturale-0-h4-05-volo.png](collaudo-highlight/naturale-0-h4-05-volo.png) [naturale-0-h4-06-esito.png](collaudo-highlight/naturale-0-h4-06-esito.png) | da esaminare visivamente |
| 1 | 5100 | gi 126 — 🧠 Gioco aereo a centrocampo! | [naturale-0-h5-01-apertura.png](collaudo-highlight/naturale-0-h5-01-apertura.png) [naturale-0-h5-03-rincorsa.png](collaudo-highlight/naturale-0-h5-03-rincorsa.png) [naturale-0-h5-04-contatto.png](collaudo-highlight/naturale-0-h5-04-contatto.png) [naturale-0-h5-05-volo.png](collaudo-highlight/naturale-0-h5-05-volo.png) [naturale-0-h5-06-esito.png](collaudo-highlight/naturale-0-h5-06-esito.png) | da esaminare visivamente |
| 1 | 5100 | gi 64 — ✈️ Colpo di testa potente da centro area! | [naturale-0-h6-01-apertura.png](collaudo-highlight/naturale-0-h6-01-apertura.png) [naturale-0-h6-03-rincorsa.png](collaudo-highlight/naturale-0-h6-03-rincorsa.png) [naturale-0-h6-04-contatto.png](collaudo-highlight/naturale-0-h6-04-contatto.png) [naturale-0-h6-05-volo.png](collaudo-highlight/naturale-0-h6-05-volo.png) [naturale-0-h6-06-esito.png](collaudo-highlight/naturale-0-h6-06-esito.png) | da esaminare visivamente |
| 1 | 5100 | gi 88 — ⚽ Volée su cross alzato! | [naturale-0-h7-01-apertura.png](collaudo-highlight/naturale-0-h7-01-apertura.png) [naturale-0-h7-03-rincorsa.png](collaudo-highlight/naturale-0-h7-03-rincorsa.png) [naturale-0-h7-04-contatto.png](collaudo-highlight/naturale-0-h7-04-contatto.png) [naturale-0-h7-05-volo.png](collaudo-highlight/naturale-0-h7-05-volo.png) [naturale-0-h7-06-esito.png](collaudo-highlight/naturale-0-h7-06-esito.png) | da esaminare visivamente |
| 1 | 5100 | gi 152 — 📋 Schema doppio dai e vai! | [naturale-0-h8-01-apertura.png](collaudo-highlight/naturale-0-h8-01-apertura.png) [naturale-0-h8-03-rincorsa.png](collaudo-highlight/naturale-0-h8-03-rincorsa.png) [naturale-0-h8-04-contatto.png](collaudo-highlight/naturale-0-h8-04-contatto.png) [naturale-0-h8-05-volo.png](collaudo-highlight/naturale-0-h8-05-volo.png) [naturale-0-h8-06-esito.png](collaudo-highlight/naturale-0-h8-06-esito.png) | da esaminare visivamente |

## Differenze fra scene forzate e naturali

Non verificato: mancano sei fotogrammi per ogni highlight naturale o note visive sufficienti.

## Limiti

Condizione prevista, ancora non verificata in questo checkpoint: Chrome headless con GPU software. In tale condizione tempi e fluidità non si giudicano; i fotogrammi consentono di giudicare soltanto pose, posizioni, direzioni e coerenza pallone/esito. Un fotogramma etichettato «contatto» o «volo» senza testimone positivo resta approssimativo e non prova da solo l’istante del gesto. Durante le prime due fotografie forzate il clock del browser viene fermato per evitare il tackle automatico dopo 9–16 secondi: lo 0 FPS visualizzato in queste due immagini è un artefatto del test.

Errori registrati: 3. Le scene non acquisite o non osservate visivamente restano «non verificato».
