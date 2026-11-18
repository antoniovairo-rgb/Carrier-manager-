# Verifica di rilascio 7.999.197 — blocco V2b

Base: `lavoro/197` a `30a456b3` (checkout staccato, nessun commit successivo). Ramo del rapporto: `sviluppo/verifica197-v2b`.
Confronto: 7.999.196 pubblicata = `origin/main` `3076a1b7` (non è servita: nessun rosso).
Preparazione: `npm i` in `tests/visual`; `node tools/build-src.mjs` → byte identici; `node tools/check-src.mjs` → allineato a HEAD;
`mkdir -p tests/visual/out`. Ogni controllo una volta, uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`,
`timeout 2400`), `free -m` e `df -h` in testa a ogni uscita. Uscite complete in `docs/sviluppo/verifica197-v2b/<controllo>-1a.txt`.

## Come ho ricavato l'elenco

Per ogni file ho preso la **prima** riga di `MAPPA` (`tests/visual/ci-runner.mjs`) che corrisponde al nome vero del file (come fa
`MAPPA.find` nella catena mirata), valutando la costante, non a occhio:

| file | riga di MAPPA (indice 0) | regex |
|---|---|---|
| `src/11-ui-kit-highlight.jsx` | 36 | `src/1[17]-` |
| `src/16-scene-3d-cerimonie.jsx` | 41 | `src/18-\|src/16-\|src/10-` |
| `src/07-versione-save-interviste.jsx` | 65 | `src/0[0-8]-` |
| `src/01-bootstrap-tema-avatar.jsx` | 65 | `src/0[0-8]-` (stessa riga di src/07) |
| `src/03-eventi-narrativi.jsx` | 63 | `src/03-` |

Tolti: (a) i guardiani della prima riga di src/12 e src/13 (riga 0), di src/15 (riga 3) e di src/18 (riga 41);
(b) i controlli eseguiti dai giri 257, 260 e 261 secondo le sezioni dei controlli dei loro rapporti (257: rigorista-257, patto-238,
rigorista-249, patto-227, momento-165, sigle-203, test:logic, save-compat, gol-eroe-154 · 260: coerenza-235, store-236,
primavera-260, podio-260, nomi-190, nomi-211, sigle-203, home-199, griglia-mobile, test:logic, save-compat · 261: serata-261,
presentazione-142, spalle-146, presentazione-225, pelle-240, tpose-196, gigante-212, test:logic, save-compat, cerimonie-192);
(c) highlight-95, ingresso-206, career-critical e i guardiani dei giri del lotto elencati nella consegna. Doppioni tolti.

⚠️ **Scelta da segnalare (non decisa da me, applicata alla lettera):** la prima riga di src/16 è **la stessa** riga di src/18
(`src/18-|src/16-|src/10-`, indice 41). Togliendo «i guardiani della riga src/18», come chiede la consegna, **nessun guardiano di
src/16 resta in questo blocco**: tutti i 96 nomi di quella riga sono considerati coperti dal blocco che esegue src/18. Se la madre
intendeva altro (ad esempio togliere solo i guardiani di src/18 che non sono anche di src/16), l'elenco sotto cambia e va rifatto
insieme a V2a.

### Elenco completo numerato (ordine di comparsa: src/11, 16, 07, 01, 03)

1. nomi-248 · 2. spogliatoio-182 · 3. stili-098-migrazione · 4. badge-255 · 5. migrazione-194 · 6. convocazione-235 ·
7. brusio-238 · 8. crediti-254 · 9. nomi-251 · 10. tema-unico · 11. stili-098 · 12. impulsi-contesto

(1–8 vengono da src/11; src/16 non aggiunge nulla, vedi sopra; 9–11 da src/07/01; 12 da src/03.)

**La mia parte (posizioni pari):** 2 spogliatoio-182 · 4 badge-255 · 6 convocazione-235 · 8 crediti-254 · 10 tema-unico ·
12 impulsi-contesto. Le dispari (1, 3, 5, 7, 9, 11) spettano a V2a.

## Esiti

| # | controllo | esito 1ª | esito 2ª | sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|---|
| 2 | spogliatoio-182 | verde (23 s) | — | — | verde | `spogliatoio-182: VERDE (15 ok · 0 ko)` |
| 4 | badge-255 | verde (47 s) | — | — | verde | `✅ badge-255 verde (solo «v 7.999.196», svanisce) e il rosso si vede (PROD/TEST · KE)` |
| 6 | convocazione-235 | verde (20 s) | — | — | verde | `✅ VERDE — convocazione al kit standard (360/412), prova del rosso riconosciuta` |
| 8 | crediti-254 | verde (7 s) | — | — | verde | `✅ VERDE — pulsante del kit, nessuna «Fonte da completare», ogni voce di CREDITI-fonti.md presente` |
| 10 | tema-unico | verde (19 s) | — | — | verde | `ROSSO ATTESO OK: col tema di prova armato cade P (fondo non notte)` (prima passata: `tema-unico VERDE: nessun tema alternativo…`) |
| 12 | impulsi-contesto | verde (<1 s) | — | — | verde | `✅ IMPULSI NEL CONTESTO GIUSTO (nessuna offerta da professionista a un ragazzo della Primavera · le regole condivise reggono ai tre profili)` |

Nessun rosso, nessun «non giudicato», nessun oltre tetto: non è servita né una seconda corsa né la copia della 196.

## Note e dubbi

1. `badge-255` mostra «v 7.999.196» sul commit `30a456b3`: il `GAME_VERSION` di `lavoro/197` a quel commit vale ancora 7.999.196.
   Non l'ho toccato (consegna); lo segnalo perché la versione si alza al rilascio.
2. `badge-255` ha riscritto 4 foto in `docs/sviluppo/foto-giro26/`: rimesse con `git checkout --`, non committate.
3. Il blocco è durato pochi minuti perché la lettura alla lettera della consegna toglie tutta la riga di src/16 (vedi sopra).
