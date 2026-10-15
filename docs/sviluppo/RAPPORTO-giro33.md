# Rapporto sviluppo — giro 33 · zona G, PO-222 e PO-223

- **Ramo:** `sviluppo/zona-g-222-223-giro33`, partito da `lavoro/170` (7.999.170, `8fd95fe`).
- **Decisione PO (15/10):** eccezione al congelamento della zona G «Sì, solo questi due» — PO-222 e PO-223. Nient'altro della zona G è stato corretto; i difetti trovati per strada sono **annotati** al §4.
- **Misura di partenza:** `docs/collaudi/RAPPORTO-zona-g-misura.md` sul ramo `collaudo/zona-g-misura` (letta per intero).
- **Versioni:** `GAME_VERSION` (7.999.170) e `SAVE_VERSION` (9) **invariati**, come da consegna.
- **Metodo:** handler veri esposti da `window.__CPM_CAREER` (`?cpmtest=1`), stato letto da `localStorage['cpm-v3']` (cioè ciò che il giocatore ritrova ricaricando), una pagina nuova per braccio. «Prima» = stesso guardiano con l'interruttore rosso acceso, che ripristina il codice di prima.
- Righe: sorgente **dopo** la modifica.

---

## Sintesi

| Voce | Prima (misurato) | Dopo (misurato) | Interruttore rosso | Guardiano |
|---|---|---|---|---|
| **PO-222** squalificato su «Simula» | presenza +1, 1 gol, voto 6,3 | presenza +0, gol 0, voce `squalificato` senza voto | `__CPM_NO_SQ222` | `squalifica-222` verde / rosso (9 controlli falliti) |
| PO-222 non convocato (mister) su «Simula» | presenza +1, 1 gol, voto 6,3 | presenza +0, voce `nonConvocato` senza voto | `__CPM_NO_SQ222` | idem |
| PO-222 infortunato in **Coppa** su «Simula» | presenza +1, voce con voto 5,0 | presenza +0, voce `injured` senza voto | `__CPM_NO_SQ222` | idem |
| **PO-223** resa dell'investimento | +55.000€ fissi per ogni scelta (netto +15.000 / +27.000 / +35.000) | puntata × esito seedato; la cripto può perdere tutto; l'avviso dice la cifra | `__CPM_NO_INV223` | `investimento-223` verde / rosso (13 controlli falliti) |

---

## PO-222 — chi non scende in campo non fa presenza

### Cosa ho trovato oltre la misura del collaudo

1. **Il bottone vero «Simula» azzera la squalifica prima di simulare** (`src/18-career-app.jsx:6708` e `:6744`, `setPlayer(…isSuspended:false)` poi `simulateAndAdvance()`). Dentro l'updater di `simulateAndAdvance` lo stato è quindi già «non squalificato»: una correzione scritta solo sull'updater (`p.isSuspended`) **non avrebbe funzionato sul percorso del giocatore**. La squalifica si legge dalla chiusura del render, prima del `setPlayer` (`src/18:3176`).
2. **Il titolo di PO-222 in backlog è «non convocato»**: la decisione del mister `not_called` (fiducia < 12, `src/08-panchina-derby-meteo-cori.jsx:209`). Il «Gioca» la blocca (`src/18:1052`), il prompt etichetta il bottone «Simula partita (non convocato)», ma il Simula accreditava presenza, gol e voto. Misurato, stesso difetto → stessa correzione.
3. **Coppa simulata da infortunato**: il ramo coppa di `simulateAndAdvance` accreditava la presenza (`matches +1`) e scriveva una voce con voto (`_ratC61` dal risultato di squadra) anche con `isInjured`. Il ramo lega lo trattava già bene (voce `injured`, nessuna presenza). Misurato (gara di Coppa iniettata in una settimana libera), stesso difetto → stessa correzione.
4. **Strumento del collaudo — la squalifica spariva al caricamento.** La migrazione (`src/17-menu-creazione-pannelli.jsx:2535`) azzera `isSuspended` sui salvataggi senza `yellAccum`. Il salvataggio sintetico del collaudo non lo aveva: alla mia prima corsa il braccio «squalificato» era identico al sano. I guardiani ora mettono `yellAccum`/`seasonCards` e **verificano che la squalifica sia viva prima della partita** (controllo «misura non cieca»).
5. **Strumento del collaudo — la «settimana non avanzata» (1 esecuzione su 4).** `step()` risponde «simulated» anche quando `simulateAndAdvance` esce subito su `openingGate()` (un'interazione d'apertura ancora pendente). È lo strumento, non il gioco. Il guardiano ripete finché la settimana avanza davvero e controlla l'avanzamento di ogni braccio.

### Correzione (`src/18-career-app.jsx`, solo dentro `simulateAndAdvance`, righe 3167–3328)

- `_sq222` (squalifica letta dalla chiusura) e `_nc222` (non convocato: prompt aperto **e** decisione del mister `not_called` su questa gara) → `_out222` (`:3176-3181`).
- Rami **lega, coppa, girone ed eliminazione europea**: con `_out222` nessuna presenza (`matches`/`totalMatches`), nessun gol/assist, voce di storico marcata `squalificato` o `nonConvocato` con `rating:null` (stesso schema dello svincolato del 7.419); il toast lo dice («🟥 SQUALIFICATO: l'hai guardata dalla tribuna», «⛔ NON CONVOCATO…»).
- Ramo **coppa**, infortunato: nessuna presenza, voce `injured:true, rating:null`.
- **Nazionale** non toccata: la squalifica di club lì non vale (`src/18:1017`).
- La squalifica viene comunque scontata dal bottone com'era prima (misurato: `isSuspended:false` dopo la partita).
- Non esiste un campo «minuti» nel salvataggio (CLAUDE.md: `minutesPlayed` non implementato): «né minuti» è soddisfatto per costruzione; i voti sono nulli.

### Prima / dopo — `npm run squalifica-222` (settimana di lega W1 · Coppa iniettata in W9)

| Braccio | Percorso | Presenze prima (rosso) | Presenze dopo | Voce di storico dopo |
|---|---|---|---|---|
| sano (controllo) | bottone «Simula» | 0 → 1 | 0 → 1 | voto 6,3, 1 gol |
| **squalificato** | bottone «Simula» vero | **0 → 1** (voto 6,3, 1 gol) | **0 → 0** | `squalificato`, voto nullo, 0 gol |
| squalificato | `step()` del banco | 0 → 1 (voto 6,3, 1 gol) | 0 → 0 | `squalificato`, voto nullo |
| infortunato | `step()` | 0 → 0 | 0 → 0 | `injured`, voto nullo (invariato) |
| svincolato | `step()` | 0 → 0 | 0 → 0 | `svincolato`, voto nullo (invariato) |
| **non convocato** (fiducia 5) | bottone «Simula» | **0 → 1** (voto 6,3, 1 gol) | **0 → 0** | `nonConvocato`, voto nullo |
| sano, Coppa (controllo) | bottone «Simula» | 0 → 1 | 0 → 1 | Coppa, voto 5,0–5,7 |
| **infortunato, Coppa** | `step()` | **0 → 1** (voto 5,0, voce non marcata) | **0 → 0** | Coppa, `injured`, voto nullo |
| **squalificato, Coppa** | bottone «Simula» | **0 → 1** (voto 5,0) | **0 → 0** | Coppa, `squalificato`, voto nullo |

Esito: verde col fix (tutti i controlli); `CPM_ROSSO=1` (→ `__CPM_NO_SQ222`) esce 1 con **9 controlli falliti**.

### Infortunato e svincolato in lega: la voce nello storico rientra nel difetto?

**No.** Misurato: contatori fermi (0 → 0) e voce **marcata** (`injured` / `svincolato`) con `rating:null`, gol e assist a zero. È la registrazione di una gara della propria squadra che si è saltata, introdotta di proposito (7.419 per lo svincolato). L'unico consumatore che conta le voci come partite è `seasonSplitShare` (`src/09-audio-scout-anagrafiche.jsx:1162`), che misura la quota di stagione passata **nel club** (per gli obiettivi di club con cambio squadra a metà anno): lì la gara saltata col proprio club conta giustamente. Non l'ho toccata. La voce dello squalificato e del non convocato segue ora lo stesso schema.

### «Avanza» con lo squalificato

Statico, non misurato dal vivo: con una gara in programma e il giocatore sano, «Avanza» apre il prompt Gioca/Simula (`handleContinua`, `src/18:1288`), non l'auto-simulazione di `doAdvanceWeek`; per lo squalificato l'unico percorso della gara è quindi «Simula», che è quello corretto. L'auto-simulazione di `doAdvanceWeek` (rami a `src/18:~4560`) riguarda l'infortunato, già senza presenza in lega.

---

## PO-223 — la resa dipende da puntata e scelta

### Correzione

- **Catalogo** (`src/03-eventi-narrativi.jsx:393, 715, 775`): ogni scelta d'investimento dichiara il suo profilo — `inv:"prudente"` (immobiliare, «rendita a fine stagione»), `inv:"rischioso"` (cripto, «esito incerto», «tutto o niente»), `inv:"bilanciato"` (ristorante, «rendita se l'attività gira»). Testi e importi delle scelte invariati.
- **Alla scelta** (`src/18:3980`): oltre al vecchio `investmentPending:true`, si registra in `investimenti223[]` **quanto è uscito davvero dal conto** (il saldo è tagliato a zero: con meno di 40.000 sul conto la puntata vera è minore) e il profilo, con stagione e settimana. Due investimenti nella stessa stagione ora hanno due rientri (prima: uno solo per costruzione, flag booleano).
- **Al rollover** (`src/18:5374`): rientra la somma di `puntata × moltiplicatore`; registro e flag azzerati.
- **Esito** (`src/18:133-142`, `INV223`/`invEsito223`): seme = `hashStr("inv223|"+nome+"|"+nazione+"|"+stagione+"|"+settimana+"|"+indice+"|"+puntata)` → `seededRng`. **Nessun `Math.random`**: stessa carriera, stesso esito (verificato: 108/108 ripetizioni identiche); carriere diverse, esiti diversi.

  | Profilo | Esito buono | Esito cattivo |
  |---|---|---|
  | prudente | 100%: ×1,04…1,12 | — (sempre in attivo) |
  | bilanciato | 65%: ×1,10…1,45 | 35%: ×0,55…0,90 |
  | rischioso | 50%: ×2,0…3,0 | 50%: ×0 (persa tutta) |

  **Questi numeri sono una mia scelta di progetto, non una richiesta del PO**: rispettano i testi delle scelte («sicuro» → in attivo; «se l'attività gira» → può perdere in parte; «tutto o niente» → può azzerarsi). Si ritarano cambiando solo `INV223`. Rendimento atteso: prudente ×1,08 · bilanciato ×1,08 · rischioso ×1,25.
- **Avviso** (`src/18:5392-5393`): una riga per investimento con la cifra vera, verde se in attivo, rosso se in perdita; ora **prioritario** — al cambio di stagione la coda delle notifiche supera il tetto di 8 e scarta le più vecchie non prioritarie (`src/18:436`), quindi l'avviso vecchio poteva non arrivare mai.
- **Salvataggi in volo** (flag della versione vecchia senza registro): resta la promessa vecchia, **55.000 una volta** (`invLegacy223`). La scelta era stata fatta con quelle regole. Misurato.
- Registri di solo collaudo (`_CPM_TEST`): `__CPM_NOTIFQ223` (testo accodato da `notify`, `src/18:434`) e `__CPM_TOAST223` (testo messo a schermo, `src/18:427`).

### Prima / dopo sul flusso vero — `npm run investimento-223`

Carriera S2 W36 con 80.000€ → pop-up **vero** dell'impulso (`apriImpulso`) → clic sulla scelta → `step()` fino a fine stagione → `startNewSeason()`.

| Carriera | Scelta | Puntata | Prima (rosso): rientro · netto | Dopo: rientro · netto | Avviso dopo (testo accodato) |
|---|---|---|---|---|---|
| Collaudo Zona G | prudente | 40.000€ | 55.000€ · +15.000€ | 43.257€ · +3.257€ | «📈 Investimento immobiliare: puntati 40.000€, rientrano 43.257€ (+3.257€)» |
| Collaudo Zona G | bilanciato | 28.000€ | 55.000€ · +27.000€ | 22.269€ · −5.731€ | «🍽 Il ristorante fatica: puntati 28.000€, rientrano 22.269€ (−5.731€)» |
| Collaudo Zona G | rischioso | 20.000€ | 55.000€ · +35.000€ | 0€ · −20.000€ | «📉 La cripto è crollata: persi tutti i 20.000€ puntati» |
| Marco Ferri | prudente | 40.000€ | 55.000€ · +15.000€ | 42.589€ · +2.589€ | «📈 Investimento immobiliare: puntati 40.000€, rientrano 42.589€ (+2.589€)» |
| Marco Ferri | bilanciato | 28.000€ | 55.000€ · +27.000€ | 33.212€ · +5.212€ | «🍽 Il ristorante gira: puntati 28.000€, rientrano 33.212€ (+5.212€)» |
| Marco Ferri | rischioso | 20.000€ | 55.000€ · +35.000€ | 44.587€ · +24.587€ | «🚀 La cripto è esplosa: puntati 20.000€, rientrano 44.587€ (+24.587€)» |
| Collaudo Zona G | salvataggio in volo (flag vecchio) | — | 55.000€ | 55.000€ (una volta, flag azzerato) | «📈 L'investimento immobiliare rende: +55.000€ sul conto!» |

Prima, **tutte e tre** le scelte rendevano 55.000€ (il collaudo l'aveva misurato sulla sola cripto; qui misurato su tutte). Il rientro dopo coincide al centesimo con il registro (`rientro = Σ invEsito223`) in 6/6 bracci.

### Tabella puntata × scelta × esito — 12 semi di carriera (stessa funzione del rollover)

| Puntata | Scelta | Rientro min | Rientro medio | Rientro max | In perdita |
|---|---|---|---|---|---|
| 20.000€ | prudente | 20.831€ | 21.635€ | 22.294€ | 0/12 |
| 20.000€ | bilanciato | 11.137€ | 21.987€ | 28.538€ | 4/12 |
| 20.000€ | rischioso | 0€ | 30.832€ | 58.681€ | 5/12 |
| 28.000€ | prudente | 29.143€ | 30.316€ | 31.235€ | 0/12 |
| 28.000€ | bilanciato | 15.588€ | 33.467€ | 40.054€ | 2/12 |
| 28.000€ | rischioso | 0€ | 47.002€ | 82.439€ | 4/12 |
| 40.000€ | prudente | 41.608€ | 43.249€ | 44.642€ | 0/12 |
| 40.000€ | bilanciato | 22.035€ | 42.046€ | 57.308€ | 5/12 |
| 40.000€ | rischioso | 0€ | 51.542€ | 118.024€ | 6/12 |

Semi: Collaudo Zona G, Marco Ferri, Luca Neri, Ana Ruiz, Tom Berg, Ivo Sala, Kenji Mori, Paolo Riva, Elio Costa, Dario Fumo, Nico Pace, Sara Vela (nazione Italia, S2 W12). Le combinazioni puntata×scelta qui sono di tabella (nel catalogo ogni scelta ha la sua puntata fissa: 40.000 / 28.000 / 20.000); servono a mostrare che la resa scala con la puntata.

Esito: verde col fix; `CPM_ROSSO=1` (→ `__CPM_NO_INV223`) esce 1 con **13 controlli falliti** (55.000€ fissi in 6/6 bracci).

### Limiti dichiarati (PO-223)

- **L'avviso è giudicato sul testo accodato, non sulla messa a schermo.** Al cambio di stagione può aprirsi un modale «UN MOMENTO …» (`careerMomentModal`) che trattiene i toast finché il giocatore non risponde (regola PO-256): nell'ultima corsa in 2 bracci su 6 l'avviso non era ancora a schermo dopo 8 s per questo motivo (in una corsa precedente 4 su 6); negli altri è andato a schermo. Chiudere quel modale dalla sonda (clic sulla risposta) o chiamare `dismiss()` in ciclo dopo il rollover **fa crollare il renderer headless** (`Target crashed`, 6 crolli su 8 corse durante lo sviluppo del guardiano, 0 senza quelle azioni). Non so dire se succede anche su un dispositivo: **non posso confermarlo**; va guardato dal vivo.
- I profili sono assegnati dal catalogo: un nuovo evento con `flag:"investment"` senza `inv` cade su «bilanciato».

---

## Guardiani fatti girare (sul build finale, dentro il turno, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Guardiano | Esito | Tempo |
|---|---|---|
| `squalifica-222` (nuovo) | ✅ verde · rosso con `CPM_ROSSO=1`: exit 1, 9 controlli falliti | ~6 min |
| `investimento-223` (nuovo) | ✅ verde · rosso con `CPM_ROSSO=1`: exit 1, 13 controlli falliti | ~7 min |
| `test:logic` | ✅ 43/43 | 5 s |
| `save-compat` | ✅ PASS | 13 s |
| `migrazione-194` | ✅ verde | 98 s |
| `replay` | ✅ PASS | 49 s |
| `classifica-102` | ✅ PASS | 41 s |
| `career-critical` (11 passi, eseguiti uno per uno) | ✅ 11/11: recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera | ~13 min |
| `node tools/check-src.mjs` | ✅ identico byte per byte | — |

Registrazioni: `tests/visual/package.json` (`squalifica-222`, `investimento-223`); `tests/visual/ci-runner.mjs` — catena `carriera`, MAPPA `src/18-|src/16-|src/10-` e nuova voce `src/03-` (prima di `src/0[0-8]-`, che resta per gli altri frammenti).

Non eseguiti in questo giro: gate `validate-situations`, `partita-vera` e le catene di motore/grafica (nessun file di partita o di grafica toccato).

---

## §4 Difetti trovati e NON corretti (zona G ferma — solo annotati)

1. **Il giocatore che non gioca può infortunarsi e stancarsi su «Simula».** Nel ramo lega `simInjuryRoll` e la fatica +6…11 si applicano anche a squalificato, non convocato e svincolato (`src/18`, ramo lega di `simulateAndAdvance`, `_injSim79`/`_fatS79`). Lettura del codice, non misurato.
2. **Svincolato in Europa simulata: voce con voto.** Nei rami girone/eliminazione europea la voce dello svincolato non è marcata e porta `_ratEG61`/`_ratEK61` (voto dal risultato di squadra), a differenza della lega. Presenza e gol sono già a zero. Lettura del codice.
3. **«Investo metà del conto» toglie sempre 40.000€**, non la metà del conto (`src/03:393`): testo e effetto non coincidono. Ora almeno il rientro segue ciò che è uscito davvero.
4. **Strumento:** `__CPM_CAREER.step()` dichiara «simulated» anche quando `openingGate()` blocca la simulazione — è l'anomalia «1 su 4» del collaudo.
5. **Strumento:** `__CPM_CAREER.step()` non replica l'azzeramento della squalifica del bottone vero (la squalifica resta su dopo una simulazione da banco).

---

## Riepilogo per il PO

- **PO-222:** chi non scende in campo non fa più presenza su «Simula». Riguarda lo **squalificato** (riprodotto dal collaudo), il **non convocato** dal mister (il titolo della voce: riprodotto ora) e l'**infortunato in Coppa** (riprodotto ora). La voce di storico resta, marcata e senza voto. Infortunato e svincolato in lega erano già corretti: la loro voce di storico non è un difetto.
- **PO-223:** l'investimento rende `puntata × esito`, deciso dal seme della carriera. Prudente sempre in attivo (+4…+12%), ristorante può perdere (35% dei casi), cripto tutto o niente (metà dei casi si perde tutta la puntata). L'avviso dice la cifra vera. I salvataggi già in volo incassano la vecchia promessa di 55.000€ una volta sola.
- Da decidere dal PO: le percentuali dei tre profili (tabella `INV223`) e se guardare dal vivo il crollo headless del §PO-223.
