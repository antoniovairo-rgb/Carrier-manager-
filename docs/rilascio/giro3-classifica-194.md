# Giro 3, punto 3 — classifica del salvataggio 194: replay settimana per settimana

Sola lettura sul gioco. Nessun commit. Base: worktree `/tmp/cpm` su `origin/main`, GAME_VERSION 7.999.158 (`/tmp/cpm/CARRIER-MANAGER-AV.html`, riga di `GAME_VERSION`).

## Domanda
Il salvataggio `tests/visual/fixtures/save-194-primavera-w38.json` ha ΣGF 790 ≠ ΣGA 787 su 18 squadre. Ipotesi del giro 2 (non verificata): il ramo «riposo» di `updateStandings` aggiunge gf/ga senza controparte e sposta GF−GA di bG−gG a ogni riposo.

## Conclusione
**SMENTITA** per la forma dell'ipotesi («ogni riposo sposta Δ»): nei 4 riposi reali del replay (S2 W9, W19, W28, W35) Δ non cambia (0 → 0). Il ramo che sbilancia (`09-audio-scout-anagrafiche.jsx:1438`) non viene mai eseguito in 38 settimane di replay.

**NON DETERMINABILE** l'origine del 3 nel salvataggio: la sua storia (S1 W1–W37) non è nel salvataggio e non è riproducibile da W38. Non posso confermarne né escluderne la causa. Il ramo riposo resta sbilanciato per costruzione e potrebbe spiegarlo in uno stato con conteggio dispari (vedi sotto), ma non l'ho potuto provare.

## Misure
- **Il 3 è già nel file**: somma diretta di `player.standings` sul JSON = GF 790, GA 787, Δ 3. Il caricamento non lo crea (in pagina: 790/787, stesso valore).
- **Costante da S1 W38 a W39**: Δ = 3 su tutti i passi della stagione 1 fino al passo di transizione (righe 0–2 del log). La partita del giocatore a W38 coinvolge le 2 squadre non tappate (33 partite ciascuna) ed è bilanciata (ΔGF 2 = ΔGA 2). Quali due squadre siano (club del giocatore incluso) non l'ho verificato.
- **Azzeramento al rollover**: Δ 3 → 0 nel passo `transizione U18→pro` (riga 3, ΔD −3, ΣGF 792→0). Con la classifica nuova Δ resta 0 per tutta S2 (38 settimane). Fine S2 → S3: ΣGF 817→0, Δ 0.
- **Riposi reali (avanzamenti di settimana senza squadre simulate)**: 4 su 39 avanzamenti della stagione 2 — S2 W9→W10, W19→W20, W28→W29, W35→W36 (`giro3-classifica-rows.json`). In tutti Δ invariato.
- **Parità del conteggio**: 35 avanzamenti con squadre simulate: 34 volte 18 squadre (pari), 1 volta 2 (S1 W38). Nessun conteggio dispari → nessun «bye» in 38 settimane.

## Tabella settimana → GF, GA, Δ (stagione 2, da zero)
Valori cumulativi a fine settimana. ΣGF = ΣGA in ogni riga; Δ = 0; variazione Δ = 0 in ogni riga salvo il rollover.

| Settimana | ΣGF | ΣGA | Δ | Riposo | Variazione Δ |
|---|---|---|---|---|---|
| S2 W1 | 19 | 19 | 0 | — | 0 |
| W2 | 37 | 37 | 0 | — | 0 |
| W3 | 69 | 69 | 0 | — | 0 |
| W4 | 89 | 89 | 0 | — | 0 |
| W5 | 108 | 108 | 0 | — | 0 |
| W6 | 140 | 140 | 0 | — | 0 |
| W7 | 165 | 165 | 0 | — | 0 |
| W8 | 195 | 195 | 0 | — | 0 |
| W9 | 195 | 195 | 0 | **sì** | 0 |
| W10 | 217 | 217 | 0 | — | 0 |
| W11 | 243 | 243 | 0 | — | 0 |
| W12 | 266 | 266 | 0 | — | 0 |
| W13 | 295 | 295 | 0 | — | 0 |
| W14 | 320 | 320 | 0 | — | 0 |
| W15 | 353 | 353 | 0 | — | 0 |
| W16 | 372 | 372 | 0 | — | 0 |
| W17 | 392 | 392 | 0 | — | 0 |
| W18 | 410 | 410 | 0 | — | 0 |
| W19 | 410 | 410 | 0 | **sì** | 0 |
| W20 | 434 | 434 | 0 | — | 0 |
| W21 | 458 | 458 | 0 | — | 0 |
| W22 | 486 | 486 | 0 | — | 0 |
| W23 | 505 | 505 | 0 | — | 0 |
| W24 | 524 | 524 | 0 | — | 0 |
| W25 | 547 | 547 | 0 | — | 0 |
| W26 | 562 | 562 | 0 | — | 0 |
| W27 | 588 | 588 | 0 | — | 0 |
| W28 | 588 | 588 | 0 | **sì** | 0 |
| W29 | 612 | 612 | 0 | — | 0 |
| W30 | 635 | 635 | 0 | — | 0 |
| W31 | 660 | 660 | 0 | — | 0 |
| W32 | 684 | 684 | 0 | — | 0 |
| W33 | 707 | 707 | 0 | — | 0 |
| W34 | 733 | 733 | 0 | — | 0 |
| W35 | 733 | 733 | 0 | **sì** | 0 |
| W36 | 763 | 763 | 0 | — | 0 |
| W37 | 793 | 793 | 0 | — | 0 |
| W38 | 817 | 817 | 0 | — | 0 |

Stagione 1, dal salvataggio: W38 (inizio) 790 / 787 / Δ 3 → W39 792 / 789 / Δ 3 (variazione 0). Rollover: Δ 3 → 0 (variazione −3).

## File:riga
- Ramo riposo (il solo che sbilancia): `src/09-audio-scout-anagrafiche.jsx:1432` (`if(paired.length%2!==0){`), `:1433` (`byeTeam=paired[paired.length-1]`), `:1437-1438` (bG/gG senza controparte: `byeTeam.gf+=bG;byeTeam.ga+=gG;`).
- Conteggio che decide il riposo: `:1428` (`others` esclude giocatore, avversario e squadre tappate `_capped`, cioè `played>=2*(N-1)`=34).
- Tetto: `:1402` (`_capped`), `:1419` (avversario tappato → `oppT=null`).
- Chiamate: `18-career-app.jsx:3239,3692,4497,4643`; `19-app-root.jsx:975`; `09-audio-scout-anagrafiche.jsx:1477,1512,1552` — tutte con risultato del giocatore non nullo.
- Lettura di `gf/ga` del gioco: `18-career-app.jsx`, `get:` (riga con `standingsN`, somma `t.gf`/`t.ga` di `player.standings`).
- Fine stagione U18: `18-career-app.jsx:4234-4339` (`seasonAwards`), onContinue → `seasonEnd` a `:5779`.
- Inizializzazione classifica: `09-audio-scout-anagrafiche.jsx:1382` (`initStandings`); usata a `18-career-app.jsx:4987,5327`. Quale delle due faccia il reset nel clic «Accetta» non l'ho verificato.

## Metodo e limiti
- Script: `docs/rilascio/giro3-probe-classifica.mjs` (copia in `tests/visual/`; importa `./lib/harness.mjs`, legge `./fixtures/`). Log: `giro3-classifica-run1..4.log` (run4 = replay completo; run1–3 = tentativi con il ciclo corretto in corso d'opera, tenuti per tracciabilità). Righe per passo: `giro3-classifica-rows.json`.
- Percorso: stessi handler del probe (`__CPM_CAREER.step/get/snapshot/startNewSeason`), `?cpmtest=1`, `__CPM_GLB=false`, senza verifica 3D. Il replay non ha usato render 3D.
- Il replay è deterministico (seed `standingsSeed`), ma è una sola esecuzione.
- Il replay di S2 parte da una classifica nuova: la parità di S1 (16 squadre tappate al W38) non è rappresentata. Lo sbilanciamento potrebbe nascere solo con conteggi dispari nella coda di una stagione con più squadre tappate: ipotesi, non misurata.
- Non confermato: qualsiasi evento di S1 W1–W37 che abbia prodotto il Δ 3. Non posso confermarlo.
- Il giro 2 è confermato sul punto «costante a 3 da S1 W38»; sul rollover «azzera» è confermato per S1→S2 (Δ −3 → 0) e S2→S3 (Δ 0).
