# Verifica di rilascio 7.999.197 — blocco V2a

Base: `lavoro/197` a `30a456b3` (detached, nessun commit successivo). Ramo del rapporto: `sviluppo/verifica197-v2a`.
Confronto (regola PO-516): 7.999.196 pubblicata, `origin/main` `3076a1b7`.
Modo: `npm i`, `node tools/build-src.mjs` (byte identici), `node tools/check-src.mjs` (allineato a HEAD), `mkdir -p tests/visual/out`;
ogni controllo una volta, uno alla volta, `CPM_CI_PAR=0 CPM_CHROME=/opt/pw-browsers/chromium npm run -s <nome>` in `tests/visual`,
tetto `timeout 2400`; memoria e disco letti prima di ognuno.

## Come ho ricavato l'elenco

- «Prima riga di MAPPA» = la prima voce di `MAPPA` (`tests/visual/ci-runner.mjs`) la cui espressione corrisponde al file, cioè la
  voce che `MAPPA.find` sceglie nella mirata: src/11 → `/src\/1[17]-/` (38 guardiani) · src/16 → `/src\/18-|src\/16-|src\/10-/`
  (92) · src/07 e src/01 → `/src\/0[0-8]-/` (33, la stessa voce) · src/03 → `/src\/03-/` (11).
- Tolti i guardiani già eseguiti, dalle sezioni dei controlli dei rapporti, ciascun giro per i file indicati nella consegna:
  giro 257 (src/11): rigorista-257, patto-238, rigorista-249, patto-227, momento-165, sigle-203, test:logic, save-compat, gol-eroe-154 ·
  giro 261 (src/16): serata-261, presentazione-142, spalle-146, presentazione-225, pelle-240, tpose-196, gigante-212, test:logic,
  save-compat, cerimonie-192 · giro 260 (src/16, 07, 01, 03): coerenza-235, store-236, primavera-260, podio-260, nomi-190, nomi-211,
  sigle-203, home-199, griglia-mobile, test:logic, save-compat.
- Tolti i guardiani della prima riga di src/12 e src/13 (stessa voce), di src/18 e di src/15, e l'elenco del lotto della consegna.
- Doppioni tolti tenendo la prima comparsa, nell'ordine src/11, 16, 07, 01, 03.

**Dubbi sulla lettura (non decisi, li scrivo):**
1. La prima riga di src/16 è **la stessa** di src/18 (`/src\/18-|src\/16-|src\/10-/`). Togliendo «i guardiani della riga src/18»
   come chiede la consegna, src/16 non porta **nessun** controllo in questo elenco. Se l'intenzione era togliere solo la riga
   propria di src/18 lasciando src/16, l'elenco cambia: va rifatto dalla madre.
2. src/01 e src/07 hanno la stessa prima riga (`/src\/0[0-8]-/`): src/01 non aggiunge nulla.
3. Ho applicato i «già eseguiti» **per file** come scritto (257 solo per src/11, ecc.). Per questo `griglia-mobile`, eseguito dal
   giro 260 (src/16·07·01·03) ma non dal 257, resta nell'elenco perché sta nella riga di src/11. Applicandoli a tutto l'elenco
   l'elenco scende a 12 (senza `griglia-mobile`) e la numerazione delle posizioni 5-13 si sposta di uno.

## Elenco completo numerato (13)

| # | controllo | riga di |
|---|---|---|
| 1 | nomi-248 | src/11 |
| 2 | spogliatoio-182 | src/11 |
| 3 | stili-098-migrazione | src/11 |
| 4 | badge-255 | src/11 |
| 5 | griglia-mobile | src/11 |
| 6 | migrazione-194 | src/11 |
| 7 | convocazione-235 | src/11 |
| 8 | brusio-238 | src/11 |
| 9 | crediti-254 | src/11 |
| 10 | nomi-251 | src/07 (e src/01) |
| 11 | tema-unico | src/07 (e src/01) |
| 12 | stili-098 | src/07 (e src/01) |
| 13 | impulsi-contesto | src/03 |

**La mia parte (V2a, posizioni dispari):** 1 nomi-248 · 3 stili-098-migrazione · 5 griglia-mobile · 7 convocazione-235 ·
9 crediti-254 · 11 tema-unico · 13 impulsi-contesto. Le pari (2, 4, 6, 8, 10, 12) sono dell'altra sessione.

## Esiti

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| 1 nomi-248 (verde + rosso `CPM_ROSSO248`) | ✅ verde, 53 s | — (non serviva) | — | verde | `nomi-248 [ROSSO __CPM_NO_G248]: 20 ok, 0 ko` (braccio verde: `nomi-248 [verde]: 20 ok, 0 ko`; nel rosso ogni ✓ `[rosso]` è il difetto visto) |
| 3 stili-098-migrazione | ✅ verde, 2 s | — | — | verde | `✅ stili-098-migrazione verde (8 archetipi → 4 stili + tratto Enfant, idempotente, nessun campo perso; il rosso lascia l'archetipo)` |
| 5 griglia-mobile | ✅ verde, 199 s | — | — | verde | `ESITO griglia-mobile: uscita 0 · MOTIVO misura completa: 14 schermate x 5 larghezze` |
| 7 convocazione-235 | ✅ verde, 20 s | — | — | verde | `✅ VERDE — convocazione al kit standard (360/412), prova del rosso riconosciuta` |
| 9 crediti-254 | ✅ verde, 5 s | — | — | verde | `✅ VERDE — pulsante del kit, nessuna «Fonte da completare», ogni voce di CREDITI-fonti.md presente` |
| 11 tema-unico (verde + `CPM_PROVA_ROSSO`) | ✅ verde, 16 s | — | — | verde | `ROSSO ATTESO OK: col tema di prova armato cade P (fondo non notte)` (braccio verde: `tema-unico VERDE: …`) |
| 13 impulsi-contesto | ✅ verde, 0 s | — | — | verde | `✅ IMPULSI NEL CONTESTO GIUSTO (nessuna offerta da professionista a un ragazzo della Primavera · le regole condivise reggono ai tre profili)` |

Tutte le uscite con codice 0, tutte al primo tentativo: nessuna riprova e nessuna corsa sulla 196 necessaria.
Nessun rosso dichiarato, nessun rosso nato nella 197 nella mia parte.

## Note

- `griglia-mobile` ha riscritto le foto di `docs/collaudo-grafico/g0/`: rimesse con `git checkout --`, non committate.
- `crediti-254`, `stili-098-migrazione`, `convocazione-235`, `impulsi-contesto` non hanno un secondo comando rosso nello script
  npm: il loro braccio rosso, dove c'è, è dentro la sonda (convocazione-235 e stili-098-migrazione lo stampano; crediti-254 e
  impulsi-contesto non stampano una prova del rosso). Lo scrivo senza giudicarlo.
- Memoria e disco prima di ogni controllo: ~14,6 GB liberi, disco al 28%.
- Nessun file di `src/` o `tests/` modificato; `GAME_VERSION` non toccata.
