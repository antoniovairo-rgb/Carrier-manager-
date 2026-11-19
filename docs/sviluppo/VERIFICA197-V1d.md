# Verifica di rilascio 7.999.197 — blocco V1d

Solo verifica: nessuna correzione a gioco o sonde.

- **Build 197:** `lavoro/197` al commit `e7528fe8` (eseguito in detached, poi questo ramo nasce lì: solo il rapporto in più).
- **Base 196:** worktree `../w196` su `3076a1b7` («Rilascio 7.999.196»), `node_modules` collegato con symlink a quello della 197.
- **Comando:** `CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 timeout <tetto> npm run -s <nome>` in `tests/visual`; tetto 2400 s (1–10), 3600 s (11–13).
- **Macchina:** sessione cloud, 16 GB RAM, `free -m` e `df -h` registrati in testa a ogni log.
- Regola: rosso / «non giudicato» / oltre tetto → seconda prova; rosso 2/2 → una prova sulla 196.

| # | Controllo | 1ª | 2ª | 196 | Classificazione | Riga di verdetto stampata |
|---|---|---|---|---|---|---|
| 1 | partita-vera | verde (601 s) | — | — | **verde** | `ESITO partita-vera: uscita 0 · BRACCIO verde · MOTIVO tutte le 12 bande giudicate e tenute (partite finite 2/2)` |
| 2 | conduci-242 | verde (82 s) | — | — | **verde** | `✅ conduci-242 verde (riga, riquadro e portiere dicono il tiro) e il rosso si vede` |
| 3 | ingresso-camminata-245 | verde (219 s) | — | — | **verde** | `✅ ingresso-camminata-245 verde (camminata, tutti al posto, clip di camminata) e il rosso si vede` |
| 4 | difesa-252 | verde (223 s) | — | — | **verde** | `✅ difesa-252 VERDE` |
| 5 | apertura-261 | verde (171 s) | — | — | **verde** | `✅ PASS apertura-261 (prima immagine sull'eroe 4/4, scarto max 0u, aperture vuote 0)` |
| 6 | spot-266 | verde (69 s) | — | — | **verde** | `✅ spot-266 verde (e il rosso si vede)` |
| 7 | passaggio-coppa-137 | verde (127 s) | — | — | **verde** | `✅ passaggio-coppa-137 verde (e i tre rossi si vedono)` |
| 8 | portiere-265 | verde (284 s; braccio verde 0 difetti su 7, rosso 3/3) | — | — | **verde** | `✅ portiere-265 VERDE (verde col verde, rosso col rosso): negli highlight il portiere resta sul suo punto, davanti alla linea, fermo al calcio.` |
| 9 | gk-miss-229 | verde (180 s; 12 tiri giudicati, 2 volée «a bruciapelo» non giudicate per regola della sonda) | — | — | **verde** | `✅ VERDE — sui tiri sbagliati il portiere si muove verso il pallone prima che lo superi, e guarda uscire quelli lontani.` |
| 10 | rinvio-252 | verde (209 s) | — | — | **verde** | `✅ rinvio-252 VERDE` |
| 11 | render-3d-023 | rosso (121 s) | rosso (121 s) | rosso (46 s) | **NATO nella 197** (causa diversa dalla 196) | 197: `page.waitForFunction: Timeout 120000ms exceeded. at render-3d-023.mjs:54:12` (attesa di `__T023.home`, mai scritta) · 196: `❌ RENDER 3D — 1 problemi: · heap 1498.6 MB > 700` (home in 8131 ms) |
| 12 | assist-298 | verde (2728 s, dentro il tetto di 3600) | — | — | **verde** | `✅ assist-298 verde (e il rosso si vede)` |
| 13 | parata-100 | verde (2883 s, dentro il tetto di 3600) | — | — | **verde** | `✅ parata-100 verde · il rosso si vede` |

## Riepilogo

- **Verdi 12/13:** partita-vera, conduci-242, ingresso-camminata-245, difesa-252, apertura-261, spot-266, passaggio-coppa-137, portiere-265, gk-miss-229, rinvio-252, assist-298, parata-100 — tutti alla prima prova.
- **Instabili:** nessuno. **Oltre tetto:** nessuno. **Dichiarati:** nessuno.
- **NATO nella 197: 1** — `render-3d-023` (rosso 2/2 sulla 197 con causa diversa da quella della 196).

## Dubbi e note (nessuna correzione fatta)

1. **render-3d-023 — la causa stampata sulla 197 è l'attesa della home, non il gioco.** Una sonda diagnostica usa-e-getta (in scratchpad, non committata) ha caricato la pagina su entrambe le build: sulla **197 `#root` ha già 1 figlio al `DOMContentLoaded`** (`figliAlDCL: 1`), sulla **196 ne ha 0**. La sonda `render-3d-023.mjs` (r. 41-42) segna `__T023.home` solo con un `MutationObserver` su `childList` di `#root` armato al `DOMContentLoaded`: se il figlio c'è già e non cambia, l'osservatore non scatta mai e la riga 54 aspetta 120 s. In entrambe le build, dopo 15 s, la home è a schermo («Korward Elite … Da promessa a leggenda»). Ipotesi (non verificata oltre questo): la 197 monta qualcosa in `#root` prima del `DOMContentLoaded` e la sonda non lo prevede. Cosa c'è in `#root` non l'ho guardato.
2. **render-3d-023 — secondo inciampo possibile dopo la home:** la stessa diagnosi legge «NUOVA …» (maiuscolo) sulla 197 e «Nuova …» sulla 196; la sonda cerca `clickByText(page, 'Nuova carriera')`. Se `clickByText` distingue le maiuscole, anche sistemata l'attesa la sonda potrebbe fermarsi lì. Non posso confermarlo: quel tratto non è mai stato raggiunto.
3. **render-3d-023 sulla 196:** il rosso è il **heap 1498,6 MB > 700** al primo campione (poi 487 → 358 MB, crescita negativa): coincide con il «rosso per heap» annotato per la 196.
4. **portiere-265 non esiste nella 196** (`package.json` del worktree non ha lo script): non è servito, perché sulla 197 è verde alla prima.
5. **gk-miss-229:** due volée (gi88) stampate «a bruciapelo … non giudicato» come scelta della sonda (sotto il tempo di reazione); il verdetto complessivo giudica 12 tiri ed è verde. Non l'ho trattato come «non giudicato» del controllo.
6. **portiere-265:** le righe `✗` del log appartengono al braccio ROSSO (`__CPM_NO_G265`, 3 rientri provocati su 3); il braccio verde ha 0 difetti su 7.
7. **Build:** i log stampano il commit del ramo del rapporto (`aeb976f5`, `36929d8c` …), non `e7528fe8`: questo ramo nasce da `e7528fe8` e aggiunge solo questo file (verificato con `git diff --stat e7528fe8 HEAD`: 1 file, il rapporto).
8. Nessun controllo ha rigenerato file sotto `docs/` fuori da questo rapporto (lo script di commit li avrebbe ripristinati e segnalati).
