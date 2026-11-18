# Verifica di rilascio 7.999.197 — blocco V3c1

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto) — `build-src` byte identici, `check-src` allineato a HEAD.
- Riferimento 196 pubblicata: `origin/main 3076a1b7`.
- Modo: ogni controllo una volta, uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), `npm run -s <nome>` in `tests/visual`, tetto 2400 s; `free -m` e `df -h` registrati prima di ogni corsa; foto in `docs/` rimesse con `git checkout --`.
- Nessun file di `src/` o `tests/` modificato. Regola PO-516 applicata.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| solo-highlight-166 | verde (855 s) | — | — | verde | `ROSSO: CADE (come deve) su 3, 7 e 8` (prima: `VERDE: PASSA`) |
| battito-264 | verde (388 s) | — | — | verde | `ROSSO: CADE (come deve): la partita intera diverge dai soli highlight` (prima: `VERDE: PASSA`) |
| spazio-270 | verde (585 s) | — | — | verde | `✅ spazio-270 verde: riga della scelta a SP.box dal riquadro dopo (tel, pc) e col rosso torna oltre 10 px` |
| portiere-223 | verde (389 s) | — | — | verde | `❌ ROSSO (atteso: __CPM_NO_G223) — 11 difetti` = braccio rosso che cade come deve; verdetto del verde: `✅ VERDE — sui tiri sbagliati il pallone non attraversa il portiere…` (rc 0) |
| portiere-252 | verde (758 s) | — | — | verde | `BRACCIO verde+rosso · MOTIVO nessuno` (prima: `✅ portiere-252 VERDE (seme 1; rosso visto: 2 KO …)`) |
| esiti-241 | verde (342 s) | — | — | verde | `BRACCIO verde+rosso+rosso G102 · MOTIVO nessuno` (prima: `✅ esiti-241 verde (riquadro, motore e 3D concordi su chance e fallo cercato) e il rosso si vede`) |
| validate-situations | verde (839 s) | — | — | verde | `✅ PASS` — 14/14, fingerprint `00001505`, 0 failure; `final-state OK` (24 situations, 0/24 al limite), `post-highlight OK` (6 situations, 0 coppie scartate) |
| gigante-212 | verde (1043 s) | — | — | verde | `✅ difetto riprodotto — col rosso __CPM_NO_G212 tornano 3 corpi sopra 2.05 m` (verde: `✅ PASS — 12 scene giudicate, nessun corpo fuori misura…`) |
| parata-100 | oltre tetto (rc 124 a 2400 s; il processo figlio ha poi stampato `✅ parata-100 verde · il rosso si vede` a 22:10:46, 2 s dopo il taglio) | oltre tetto (rc 124 a 2400 s; poi `✅ parata-100 verde · il rosso si vede` a 22:51:03, 3 s dopo il taglio) | verde in 1852 s (tetto 60 min) | oltre tetto | `✅ parata-100 verde · il rosso si vede` (su tutte e tre le corse, ma sulla 197 oltre il tetto di 40 min) |

## Sintesi

- **8 verdi su 9** al primo tentativo: solo-highlight-166, battito-264, spazio-270, portiere-223, portiere-252, esiti-241, validate-situations (14/14, `post-highlight` e `final-state` OK, fingerprint 00001505), gigante-212.
- **parata-100: «oltre tetto»** sulla 197 (2 su 2), verde sulla 196 in 1852 s. Nessun rosso nato nella 197 nel mio elenco; nessun rosso dichiarato toccato.

## Dubbi e scelte da decidere (non decisi da me)

1. **parata-100 oltre tetto per 2-3 s, ma con verdetto verde.** Il comando `timeout` ha ucciso `npm` a 2400 s (rc 124) e il processo `node` figlio, sopravvissuto, ha stampato `✅ parata-100 verde · il rosso si vede` 2-3 s dopo. Formalmente è «oltre tetto» (classificato così); nel merito il controllo è arrivato al verde con il braccio rosso che cade. Da decidere se questo conta come verde.
2. **Perché la 197 è più lenta (misurato, non interpretato oltre):** in entrambe le corse sulla 197 il braccio verde ha stampato `verde copertura insufficiente: secondo giro 1` e ha fatto un secondo giro; sulla 196 quella riga non compare (0 occorrenze) e la corsa è durata 1852 s. Il conteggio finale del verde è simile (197: `parate 9 · cross_goal 4` e `parate 9 · cross_goal 2`; 196: `parate 7 · cross_goal 4`, 0 difetti in tutti). Con una corsa per lato non posso dire se il secondo giro sia un effetto della 197 o una variabilità delle scene raccolte: **non posso confermarlo**.
3. **GAME_VERSION nel build verificato `a81ebb10` vale ancora `7.999.196`** (il gate stampa `gameVersion 7.999.196`); come da istruzioni non l'ho toccato. Lo segnalo perché il build finale del lotto 197 non porta ancora il numero 197.
4. Nota tecnica: sulla copia della 196 (`../w196`, worktree detached su `3076a1b7`) `node_modules` di `tests/visual` è un collegamento a quello della 197; le `devDependencies` sono identiche fra i due commit (il diff di `package.json` tocca solo script).

Foto rigenerate: solo `gigante-212` ha riscritto 16 immagini e 2 json in `docs/sviluppo/giro212/`; rimesse con `git checkout --` e mai committate (il mio filtro di ripristino escludeva per errore `docs/sviluppo/`, me ne sono accorto alla fine e le ho ripristinate a mano). Le altre corse non hanno toccato `docs/`. Nessun file di `src/` o `tests/` modificato.
