# VERIFICA DI RILASCIO 7.999.197 — blocco V1a

Base eseguita: `lavoro/197` a **30a456b3** (detached, nessun commit successivo). Confronto: 7.999.196 pubblicata, `origin/main` **3076a1b7**.
Ramo del rapporto: `sviluppo/verifica197-v1a`. Nessun file di `src/` o `tests/` modificato. Solo esecuzione e classificazione, nessuna correzione.

Modo: `node tools/build-src.mjs` («byte identici a prima») + `node tools/check-src.mjs` (allineato a HEAD); ogni controllo con
`npm run -s <nome>` in `tests/visual`, uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto `timeout 2400`;
`free -m` e `df -h` registrati prima di ogni corsa; rosso o «non giudicato» → una riprova; rosso 2 su 2 → una corsa su worktree della 196.

## Come ho ricavato l'elenco

- In `tests/visual/ci-runner.mjs` la **prima** riga di `MAPPA` che `MAPPA.find` trova per `src/12-three-match-view.jsx` e per
  `src/13-prepartita-formazioni.jsx` è **la stessa riga** (indice 0, regex `/src\/12-|src\/13-/`, 76 guardiani, nessun doppione).
- **Parte src/12:** i guardiani elencati al §5 di `docs/sviluppo/RAPPORTO-giro265.md` («Non ho eseguito gli altri 64»), nell'ordine della riga,
  meno le esclusioni del blocco. ⚠️ Il §5 dichiara «64» ma l'elenco scritto contiene **63** nomi (contati uno per uno; tutti presenti nella riga).
  Il 64° non nominato non l'ho potuto ricavare: ho usato i 63 nomi scritti.
- **Parte src/13:** i guardiani della stessa riga non eseguiti dal giro 262 (eseguiti lì: `formazioni-262`, `rigorista-257`, `sigle-203`, `ingresso-245`,
  `nomi-182` + nucleo), meno le esclusioni e meno quelli già nella parte src/12. Restano 8 nomi, che il giro 265 aveva invece eseguito.
- Esclusi come da consegna: `highlight-95`, `ingresso-206`, `career-critical` e i guardiani dei giri del lotto (fra quelli della riga:
  `formazioni-262`, `coreografie-244`, `lotteria-191`, `parata-100`, `spazio-296`, `portiere-223`, `validate-situations`, `giornale-244`,
  `portiere-252`, `esiti-241`, `stadi-071`).
- **Scelta da segnalare (dubbio 1):** applicando alla lettera la regola, entrano anche guardiani che un giro aveva già eseguito sullo
  stesso lotto: `rigorista-257`, `nomi-182`, `ingresso-245` (eseguiti dal 262, non dal 265) e gli 8 della parte src/13 (eseguiti dal 265,
  non dal 262). Li ho tenuti, perché la consegna li descrive così; la madre può toglierli dal conteggio se «già eseguito da un giro» vale per entrambi.

Elenco completo numerato (65), divisione uno ogni 3: **la mia parte è 1, 4, 7, …, 64 (22 controlli)**.

| # | Controllo | Origine | Sessione |
|---|---|---|---|
| 1 | `rigorista-257` | src/12 (§5 giro 265) | **V1a** |
| 2 | `tunnel-245` | src/12 (§5 giro 265) | altra sessione |
| 3 | `salienti-243` | src/12 (§5 giro 265) | altra sessione |
| 4 | `guardalinee-222` | src/12 (§5 giro 265) | **V1a** |
| 5 | `tocco3d-219` | src/12 (§5 giro 265) | altra sessione |
| 6 | `piazzato-204` | src/12 (§5 giro 265) | altra sessione |
| 7 | `pullman-204` | src/12 (§5 giro 265) | **V1a** |
| 8 | `nomi-182` | src/12 (§5 giro 265) | altra sessione |
| 9 | `chiusura-99` | src/12 (§5 giro 265) | altra sessione |
| 10 | `consegna-103` | src/12 (§5 giro 265) | **V1a** |
| 11 | `colla-103` | src/12 (§5 giro 265) | altra sessione |
| 12 | `contatto-103` | src/12 (§5 giro 265) | altra sessione |
| 13 | `carriera3-94` | src/12 (§5 giro 265) | **V1a** |
| 14 | `assist-298` | src/12 (§5 giro 265) | altra sessione |
| 15 | `scena3d-96` | src/12 (§5 giro 265) | altra sessione |
| 16 | `panchina-293` | src/12 (§5 giro 265) | **V1a** |
| 17 | `pc-tablet-292` | src/12 (§5 giro 265) | altra sessione |
| 18 | `ingresso-285` | src/12 (§5 giro 265) | altra sessione |
| 19 | `corpi-073` | src/12 (§5 giro 265) | **V1a** |
| 20 | `ingresso-276` | src/12 (§5 giro 265) | altra sessione |
| 21 | `stadi-064` | src/12 (§5 giro 265) | altra sessione |
| 22 | `render-3d-023` | src/12 (§5 giro 265) | **V1a** |
| 23 | `avvicinamento-61` | src/12 (§5 giro 265) | altra sessione |
| 24 | `linee-61` | src/12 (§5 giro 265) | altra sessione |
| 25 | `pallone-278` | src/12 (§5 giro 265) | **V1a** |
| 26 | `ingresso-277` | src/12 (§5 giro 265) | altra sessione |
| 27 | `inquadra-273` | src/12 (§5 giro 265) | altra sessione |
| 28 | `salti-274` | ❌ rosso (599 s): Ivo Mansi, 2 salti non spiegati in conclusione (arco 13,4u/0,028s · 8,5u/0,029s) | ❌ rosso (595 s): stessi 2 salti (13,4u · 8,5u) | ✅ verde (620 s): «TOTALE salti non spiegati in conclusione: 0» (sonda identica byte per byte) | **verde sulla 196 = NATO nella 197** — vedi dubbio 5 | «❌ FAIL salti-274» («TOTALE salti non spiegati in conclusione: 2») |
| 29 | `memoria-275` | src/12 (§5 giro 265) | altra sessione |
| 30 | `buildup-sync` | src/12 (§5 giro 265) | altra sessione |
| 31 | `po229-gi38` | src/12 (§5 giro 265) | **V1a** |
| 32 | `esiti-218` | src/12 (§5 giro 265) | altra sessione |
| 33 | `cross-218` | src/12 (§5 giro 265) | altra sessione |
| 34 | `scene-221` | ⏱ oltre tetto (2400 s, rc 124): 5 semi su 6 chiusi | ⏱ oltre tetto (2400 s, rc 124): 5 semi su 6 | ✅ verde con tetto 60 min, ma in **2603 s** (anche la 196 supera i 40 min) | **oltre tetto** — vedi dubbio 6 | 197: «seme 5 fine ceremony scene 6 gol eroe 0» (seme 42 non raggiunto) · 196: «✅ scene-221 verde (scene 5.50 a partita; passaggio sempre offerto col compagno libero)» |
| 35 | `fila-227` | src/12 (§5 giro 265) | altra sessione |
| 36 | `bambini-294` | src/12 (§5 giro 265) | altra sessione |
| 37 | `partita-vera` | src/12 (§5 giro 265) | **V1a** |
| 38 | `bambini-236` | src/12 (§5 giro 265) | altra sessione |
| 39 | `pressing-143` | src/12 (§5 giro 265) | altra sessione |
| 40 | `conduci-242` | src/12 (§5 giro 265) | **V1a** |
| 41 | `ingresso-245` | src/12 (§5 giro 265) | altra sessione |
| 42 | `difesa-220-scena` | src/12 (§5 giro 265) | altra sessione |
| 43 | `ingresso-camminata-245` | src/12 (§5 giro 265) | **V1a** |
| 44 | `analisi-217` | src/12 (§5 giro 265) | altra sessione |
| 45 | `piedi-252` | src/12 (§5 giro 265) | altra sessione |
| 46 | `difesa-252` | src/12 (§5 giro 265) | **V1a** |
| 47 | `aereo-252` | src/12 (§5 giro 265) | altra sessione |
| 48 | `difesa-220-giro31` | src/12 (§5 giro 265) | altra sessione |
| 49 | `apertura-261` | src/12 (§5 giro 265) | **V1a** |
| 50 | `camera-252` | src/12 (§5 giro 265) | altra sessione |
| 51 | `reazione-252` | src/12 (§5 giro 265) | altra sessione |
| 52 | `spot-266` | src/12 (§5 giro 265) | **V1a** |
| 53 | `testa-143` | src/12 (§5 giro 265) | altra sessione |
| 54 | `cerimonie` | src/12 (§5 giro 265) | altra sessione |
| 55 | `passaggio-coppa-137` | src/12 (§5 giro 265) | **V1a** |
| 56 | `kit-061` | src/12 (§5 giro 265) | altra sessione |
| 57 | `strisce-corpo` | src/12 (§5 giro 265) | altra sessione |
| 58 | `portiere-265` | src/13 (non eseguito dal giro 262) | **V1a** |
| 59 | `dribbling-226` | src/13 (non eseguito dal giro 262) | altra sessione |
| 60 | `gk-dive-sync` | src/13 (non eseguito dal giro 262) | altra sessione |
| 61 | `gk-miss-229` | src/13 (non eseguito dal giro 262) | **V1a** |
| 62 | `goal-postarc` | src/13 (non eseguito dal giro 262) | altra sessione |
| 63 | `rete-252` | src/13 (non eseguito dal giro 262) | altra sessione |
| 64 | `rinvio-252` | src/13 (non eseguito dal giro 262) | **V1a** |
| 65 | `parata-258` | src/13 (non eseguito dal giro 262) | altra sessione |

## Riepilogo

Eseguiti **12 su 22** entro il tetto del blocco (circa 4 ore: dalle 17:05 alle 21:00, ora del contenitore).
- **verde: 8** (`guardalinee-222`, `pullman-204`, `consegna-103`, `carriera3-94`, `panchina-293`, `corpi-073`, `pallone-278`, `po229-gi38`).
- **instabile 1 su 2: 1** (`rigorista-257`: la 1ª corsa «NON GIUDICATO (partita non finita)» in C2).
- **dichiarato: 1** (`render-3d-023`, rosso anche sulla 196, ma con un sintomo diverso: dubbio 3).
- **NATO nella 197: 1**, **`salti-274`**: rosso 2 su 2 sulla 197 (gli stessi 2 salti in conclusione), verde 1 su 1 sulla 196. **Per la regola PO-516 blocca l'uscita.**
- **oltre tetto: 1** (`scene-221`: oltre i 40 min 2 su 2 sulla 197; sulla 196 verde ma in 43 min).
- **non eseguiti: 10** (37 … 64, elencati in tabella), da riassegnare.

## Esiti della parte V1a

| # | Controllo | Esito 1ª | Esito 2ª | Sulla 196 | Classificazione | Ultima riga |
|---|---|---|---|---|---|---|
| 1 | `rigorista-257` | ❌ rosso (422 s): «C2 partita vera senza premio, ponte provocato: NON GIUDICATO (partita non finita)»; le altre 18 righe verdi | ✅ verde (321 s) | — | **instabile 1 su 2** | «✅ rigorista-257 verde (e il rosso si vede)» |
| 4 | `guardalinee-222` | ✅ verde (399 s) | — | — | verde | «✅ difetto riprodotto — col rosso __CPM_NO_G222 6 verdetti rossi (posizione, festa, divisa)» |
| 7 | `pullman-204` | ✅ verde (144 s) | — | — | verde | «✅ pullman-204 verde (e ogni rosso si vede)» |
| 10 | `consegna-103` | ✅ verde (2113 s, vicino al tetto di 2400) | — | — | verde | «✓ consegna-103 VERDE (e il rosso si vede)» |
| 13 | `carriera3-94` | ✅ verde (160 s) | — | — | verde | «VERDE» |
| 16 | `panchina-293` | ✅ verde (228 s) | — | — | verde | «✅ panchina-293 verde (16/16 corpi CGTrader in ingresso e in partita, 0 procedurali, 0 CH38, piedi/bacino in tolleranza, fps >= 0.85 x rosso) e il rosso si vede» |
| 19 | `corpi-073` | ✅ verde (415 s) | — | — | verde | «✅ corpi-073 verde (282,283,284f)» |
| 22 | `render-3d-023` | ❌ non giudicato (121 s): `page.waitForFunction: Timeout 120000ms exceeded` a `render-3d-023.mjs:54` (attesa della home) | ❌ identico (121 s) | ❌ rosso (44 s) ma **per un'altra causa**: arriva alla home in 7303 ms e boccia «heap 1509.7 MB > 700» | **dichiarato** (rosso anche sulla 196) — vedi dubbio 3 | 197: `Node.js v22.23.5` dopo il TimeoutError · 196: «❌ RENDER 3D — 1 problemi: · heap 1509.7 MB > 700» |
| 25 | `pallone-278` | ✅ verde (123 s) | — | — | verde | «✅ pallone-278 verde (rapporto in [0.08;0.19], alone <= 0.45 in ingresso/gioco/highlight) e il rosso si vede (6 soglie cadute)» |
| 28 | `salti-274` | ❌ rosso (599 s): Ivo Mansi, 2 salti non spiegati in conclusione (arco 13,4u/0,028s · 8,5u/0,029s) | ❌ rosso (595 s): stessi 2 salti (13,4u · 8,5u) | *in corsa* | *in attesa della 196* | «❌ FAIL salti-274» («TOTALE salti non spiegati in conclusione: 2») |
| 31 | `po229-gi38` | ✅ verde (32 s) | — | — | verde | «✅ PASS — 1 scene: restituzione, servizio al compagno e conclusione giocati» |
| 34 | `scene-221` | ⏱ oltre tetto (2400 s, rc 124): 5 semi su 6 chiusi | ⏱ oltre tetto (2400 s, rc 124): 5 semi su 6 | *in corsa, tetto 60 min* | *in attesa della 196* | «seme 5 fine ceremony scene 6 gol eroe 0» (ultimo seme 42 non raggiunto) |
| 37 | `partita-vera` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 40 | `conduci-242` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 43 | `ingresso-camminata-245` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 46 | `difesa-252` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 49 | `apertura-261` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 52 | `spot-266` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 55 | `passaggio-coppa-137` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 58 | `portiere-265` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 61 | `gk-miss-229` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |
| 64 | `rinvio-252` | non eseguito | — | — | **non eseguito (tetto del blocco)** | — |

## Dubbi

1. Vedi «Scelta da segnalare» sopra (guardiani già eseguiti da uno dei due giri).
2. Il §5 del giro 265 dice 64 nomi, ne scrive 63.
3. `render-3d-023`: rosso su entrambe le versioni, ma il sintomo è diverso. Sulla 196 la sonda arriva alla home (il suo testimone
   `window.__T023.home`, un `MutationObserver` sui figli di `#root` armato a `DOMContentLoaded`, scatta a 7,3 s) e boccia sulla memoria.
   Sulla 197 quel testimone non scatta mai in 120 s, 2 corse su 2, quindi la sonda non giudica niente, neanche la memoria. Non ho
   indagato (consegna: niente correzioni). Una causa possibile, **non verificata**, è che sulla 197 la home si monti prima, o in modo
   diverso, e l'osservatore non veda la mutazione. Per la regola PO-516 lo classifico «dichiarato», ma un rosso «non giudicato» sulla
   197 non dimostra che il difetto della 196 (heap) ci sia ancora. Lo decide la madre.
4. `partita-vera`: una prima corsa (partita alle 20:06) è stata **interrotta** da me dopo pochi secondi, insieme al gruppo in sottofondo
   che stava per toccare il suo limite di 2 ore. Non vale: la rifaccio da capo.
5. `salti-274` «NATO nella 197» si basa su **una sola** corsa sulla 196 (come da consegna). Sulla 197 il difetto è identico nelle due corse
   (stesso giocatore Ivo Mansi, stessi salti 13,4u e 8,5u, a T0/0,45 e T0/0,43), quindi non sembra rumore. Sulla 196 la sonda dà 0 salti
   non spiegati su 6 conclusioni col pallone lontano. Non ho cercato la causa.
6. `scene-221`: con la regola «oltre tetto anche alla riprova» la 196 si rifà con 60 min, ed è verde in 2603 s. Anche la 196 quindi
   **non** starebbe nel tetto di 40 min: la durata è una proprietà della sonda (6 partite intere), non una regressione della 197. Le due
   corse sulla 197 si sono fermate allo stesso punto (seme 5 chiuso, seme 42 non iniziato), con esiti per seme simili alla 196 (scene 7/6/3/7/6
   contro 5/6/3/7/7). Che la 197 sia verde non è dimostrato: andrebbe rifatta con tetto 60 min. Decide la madre.
7. **Tetto del blocco.** Ho dato la precedenza alle verifiche sulla 196 dei rossi già trovati, e il tetto di circa 4 ore è arrivato con 10
   controlli non eseguiti (#37-#64). La loro durata stimata è alta (`partita-vera` gioca partite intere). Non li ho avviati per restare nel
   tetto; vanno riassegnati.
8. Nessuna foto rigenerata in `docs/` durante i controlli (controllato dopo ogni corsa); `docs/governo/STABILITA.json` non toccato
   (i controlli sono girati con `npm run`, non con `ci-runner.mjs`). Worktree della 196 in `../w196` (3076a1b7), fuori dal repo.
