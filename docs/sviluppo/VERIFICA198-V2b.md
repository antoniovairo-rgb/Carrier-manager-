# Verifica della 7.999.198 — parte V2b

- **Partenza:** `prova/198-finale` (`0f0b13d8` = `lavoro/198` + giri 293–296, 298, 299, 300, 301, 302).
- **Base di confronto (solo per i rossi):** `lavoro/198` (`b3b75b9d`).
- **Ramo:** `sviluppo/verifica198-v2b`.
- **Modo:** un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti per controllo. Nessuna correzione: solo esiti.
- **Stato:** concluso — 16 controlli su 16 eseguiti e lasciati finire (nessuno fermato al tetto dei 30 minuti), tutti presenti in `tests/visual/package.json`. Durata complessiva circa 1 h 55 min.

| # | controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|---|
| 1 | coerenza-235 | VERDE (uscita 0, 180 s) | — | — | verde + due bracci rossi (`__CPM_NO_G235`, `__CPM_NO_G260`) bocciati come atteso |
| 2 | rassegna-200 | **ROSSO** (uscita 1, 605 s) — verde 11/14 | **ROSSO** identico (uscita 1, 608 s) — verde 11/14 | **non nasce dall'unione** (stesso rosso sulla base) | cade solo il braccio B «partita intera a velocità 2»: la partita non finisce entro il tetto di 420 s dell'aiutante `gioca166` (risultato 2-1 al tetto, sia su finale sia sulla base), quindi schede e puntini restano non giudicati = rosso. Bracci A (soli highlight), C (Simula) e il rosso `__CPM_NO_G200` passano in entrambi. Foto di `docs/sviluppo/giro200/` rigenerate dal controllo e rimesse con `git restore`. |
| 3 | riserva-103 | VERDE (uscita 0, 677 s) | — | — | casi A e B: verde 3/3 scene giudicate, rosso visto 3/3 in entrambi |
| 4 | esiti-96 | VERDE (uscita 0, 787 s) | — | — | verde su D1, D2, D3, B15, D6, D7, D12, D15, D14; col rosso `__CPM_NO_G96B_*` cadono tutti e nove come atteso |
| 5 | cori-291 | VERDE (uscita 0, 1 s) | — | — | 20 cori distinti, 0 ripetuti; il rosso fa ricadere i ripetuti (2 distinti, 70 ripetizioni) |
| 6 | pillola-58 | VERDE (uscita 0, 59 s) | — | — | a 915 e 740 px la pillola sta 19 px sopra la barra; nel rosso la distanza scende a 0 e −12 |
| 7 | partita-vera | VERDE (uscita 0, 665 s) | — | — | 12 bande giudicate e tenute su 2 partite finite 2/2 (tabellone 3-2 raccontato = finale). Riga solo informativa: «portatore-stato: campioni 0», non è una banda |
| 8 | validate-situations | VERDE (uscita 0, 886 s) | — | — | gate 14/14 su 191 situazioni, fingerprint 00001505, 0 failure; avvisi non bloccanti: initial-state 4, visual 1, movements 23, motion 1, bg-coherence 1 |
| 9 | tetto-202 | VERDE (uscita 0, 7 s) | — | — | verde 20, e il rosso si vede |
| 10 | catalogo-022 | VERDE (uscita 0, 489 s) | — | — | 8 scene su 8 nate dal motore (100%); prova diretta sulle catene del secondo tempo passata |
| 11 | attesa-241 | VERDE (uscita 0, 62 s) | — | — | modo `--guardiano`: attese dei corpi 8164 e 7894 ms (mediana 8164), vecchia scritta tecnica 0/2, riquadri con contenuto; il comando di `package.json` non stampa un braccio rosso |
| 12 | tecnica-045 | VERDE (uscita 0, 122 s) | — | — | 45 opzioni, 0 tecniche cambiate dal motore; nel rosso ne cambiano 20 |
| 13 | rigorista-249 | VERDE (uscita 0, 379 s) | — | — | A (motore, 20 partite): senza premio rigori dell'eroe 0/10, con premio 13/13; B (partita): senza premio il rigore lo batte il compagno, con premio l'eroe; rosso `__CPM_NO_G249` visto in A e B |
| 14 | patto-238 | VERDE (uscita 0, 829 s) | — | — | bracci A (motore), B (partita vera: eroe battitore 12/12 punizioni provocate) e C (profilo, bio, chimica 60→61, cambio club) verdi; rosso `__CPM_NO_G238` visto in tutti e tre |
| 15 | anteprima-230 | VERDE (uscita 0, 155 s) | — | — | verde 3/3 (bilancio mostrato = classifica, striscia forma assente); rosso `__CPM_NO_G230` + `__CPM_NO_G239` bocciato |
| 16 | momento-173 | VERDE (uscita 0, 95 s) | — | — | 20 verdi, 0 rossi nelle quattro sezioni; il comando di `package.json` esegue il solo braccio «verde atteso» |

## Riepilogo

- **Verdi: 15** — coerenza-235, riserva-103, esiti-96, cori-291, pillola-58, partita-vera, validate-situations, tetto-202, catalogo-022, attesa-241, tecnica-045, rigorista-249, patto-238, anteprima-230, momento-173.
- **Rossi: 1** — rassegna-200, rosso identico su `prova/198-finale` e su `lavoro/198`: **non nasce dall'unione**, quindi nessun giro 293–302 è chiamato in causa e gli interruttori `__CPM_NO_G293…G302` non sono stati provati.
- **Nomi assenti in `package.json`:** nessuno.
- **Controlli fermati al tetto:** nessuno.

### Il rosso di rassegna-200, in dettaglio

- Cade il solo braccio **B «partita intera a velocità 2»**: l'aiutante `gioca166` (`tests/visual/lib/partita-166.mjs`, tetto predefinito 420.000 ms) esce col tetto raggiunto e la partita non risulta finita (risultato 2-1 a quel punto). Di conseguenza le tre righe del braccio (partita finita · schede · puntino/Salta) sono «non giudicate» = rosso: verde 11/14.
- Stesso identico esito sulla base (`b3b75b9d`): 11/14, stesso braccio, stesso risultato 2-1, stessi 420 s.
- Bracci A (soli highlight, 4 schede entro il tetto di 1,3 schermi), C (Simula) e il rosso `__CPM_NO_G200` passano su entrambi i rami.
- **Non verificato:** se la partita intera a velocità 2 finirebbe con un tetto più lungo o su una macchina più veloce (le soglie non sono state toccate). Una corsa per ramo, con esito identico: non è stata fatta una seconda corsa sullo stesso ramo.

### Note di metodo

- I rapporti `RAPPORTO-giro293…302.md` non sono stati letti: l'unico rosso c'è anche sulla base.
- Foto rigenerate da rassegna-200 in `docs/sviluppo/giro200/` rimesse con `git restore` (su finale e sulla copia della base). Nessun altro file del repo modificato dai controlli.
- Nessuna correzione al gioco né ai controlli; `GAME_VERSION` non toccata (il gate legge 7.999.198).

## Verdetto

**V2b pronto: sì, per quanto riguarda l'unione** — nessuno dei 16 controlli diventa rosso a causa dei giri 293–302. **Resta aperto un rosso che c'era già sulla base** (rassegna-200, braccio B): non blocca l'unione ma va deciso dal PO se accettarlo o ripararlo prima del rilascio.
