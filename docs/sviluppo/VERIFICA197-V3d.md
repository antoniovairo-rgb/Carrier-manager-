# Verifica di rilascio 7.999.197 — blocco V3d

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), detached; `build-src` = byte identici, `check-src` = allineato a HEAD.
- Riferimento 196 pubblicata: `origin/main` = `3076a1b7` (worktree `../w196`).
- Modalità: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `npm run -s <nome>` in `tests/visual`, tetto 2400 s; riprova una volta se rosso/non giudicato.
- Nessun file di `src/` o `tests/` modificato; foto rigenerate in `docs/` rimesse con `git checkout --`.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| coreografie-244 | verde (2201 s) | — | — | verde (braccio rosso caduto come atteso) | ✅ coreografie-244: col rosso torna la coreografia di oggi (un disegno solo per curva e stagione, ferma) |
| presentazione-225 | verde (1331 s) | — | — | verde | ✅ presentazione-225 verde (e il rosso si vede) |
| classifica-194 | rosso (500 s) | rosso (498 s) | rosso anche sulla 196 (481 s, stesso messaggio) | dichiarato | ❌ classifica-194: la giornata 34 non risulta giocata (settimana 38, playMatch true, fase playing) |
| sigle-203 | verde (618 s) | — | — | verde | prova del rosso: il difetto si vede (VERDE 8 ok · 0 ko) |
| tocco-213 | verde (253 s) | — | — | verde | ✓ tocco-213 VERDE |
| salienti-229 | verde (176 s) | — | — | verde | ROSSO: CADE (come deve): tasto assente fuori dal campionato senza posta, partita KO non apribile a soli salienti |
| schermate-97 | rosso (65 s) | rosso | verde sulla 196 (253 s) = NATO nella 197 | **NATO nella 197** | ✗ D14 +150 ms: fase hl_intro, luminosita' 115.9, neri 0% · schermate-97 ROSSO |
| web-237 | verde (52 s) | — | — | verde | [web-237] braccio ROSSO … PROVA DEL ROSSO RIUSCITA (verde: menu in 462 ms) |
| formazioni-262 | verde (47 s) | — | — | verde | ✅ formazioni-262 verde (e il rosso si vede) |
| pulsanti-263 | verde (133 s) | — | — | verde | ✓ pulsanti-263 VERDE |
| serata-261 | verde (412 s) | — | — | verde | ✅ serata-261 verde (e il rosso __CPM_NO_G261 cade su A, B e C) |
| camera-241 | verde (767 s) | — | — | verde | ✅ camera-241 VERDE (verde col verde, rosso col rosso) · 766 s |
| rigorista-257 | verde (285 s) | — | — | verde | ✅ rigorista-257 verde (e il rosso si vede) |

## Esito del blocco

- **11 verdi** al primo giro, nessun instabile, nessun oltre tetto.
- **1 dichiarato:** `classifica-194` — rosso 2 su 2 sulla 197 e rosso anche sulla 196 (`❌ la giornata 34 non risulta giocata (settimana 38, playMatch true, fase playing)`), stesso messaggio sui tre giri.
- **1 NATO nella 197 (blocca l'uscita secondo PO-516):** `schermate-97`, controllo **D14** (cerimonia).
  - 197: `tel D14 cerimonia + 150 ms · fase hl_intro · luminosita' 115.9` → `✗ D14 +150 ms: fase hl_intro` (2 su 2, identico).
  - 196: `tel D14 cerimonia + 150 ms · fase ceremony · luminosita' 102.7` → `schermate-97 VERDE: D1 2 · D16 44 · D17 4 · D14 4 misure`.
  - Il file del controllo (`tests/visual/schermate-97*.mjs`) è identico fra `3076a1b7` e `a81ebb10` (`git diff --stat` vuoto): la differenza viene dal gioco, non dal guardiano. Le misure a +500/+1000/+2000 ms sulla 197 sono già in `ceremony` con luminosità ~100: a +150 ms la cerimonia non è ancora partita (è ancora `hl_intro`). Lettura misurata, non indagata: cosa nella 197 ritardi l'ingresso in `ceremony` non l'ho cercato (fuori ambito: solo eseguire e classificare).
- `coreografie-244`: il braccio rosso cade come richiesto («col rosso torna la coreografia di oggi»).

## Note e dubbi

- Durate lunghe: `coreografie-244` 2201 s (vicino al tetto di 2400 s), `presentazione-225` 1331 s.
- La copia della 196 (`../w196`) usa i `node_modules` della 197 via collegamento simbolico; le `devDependencies` non sono state confrontate riga per riga (dubbio dichiarato, effetto atteso nullo).
- Nessun file in `docs/` rigenerato risultava modificato dopo i controlli (`git status` pulito, ripristino `git checkout -- docs/` eseguito dopo ciascuno).
