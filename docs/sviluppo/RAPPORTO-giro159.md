# Giro 159: seguiti dei bassi del giro 155 (decisioni PO dell'11/11)

Ramo `sviluppo/giro159-seguiti-bassi`, partito da `lavoro/190` (`4f9363a`, 7.999.190). `GAME_VERSION` non è stato toccato.
Nessun campo nuovo nel salvataggio, nessun bump di `SAVE_VERSION`: le cinque voci si calcolano da campi che esistono già.
Fonte delle decisioni: `docs/governo/DECISIONI.md` del ramo `poc/marioprada-character-system`, sezione «11/11 ~07:00 UTC» e «11/11 07:50 UTC».

**Interruttore rosso unico:** `window.__CPM_NO_G159` spegne le cinque correzioni insieme.
`window.__CPM_NO_G159_<voce>` ne spegne una sola. Le voci sono `L358`, `T359`, `B4`, `D9` e `B11`.

**Guardiano nuovo:** `npm run seguiti-159` (`tests/visual/seguiti-159-test.mjs`). Ha sei prove: cinque sulle funzioni del gioco
chiamate nella pagina, più `B4flusso`, che usa il flusso vero (offerta posata con `setOffer`, accettata con `acceptOffer`, due cambi di
stagione con `startNewSeason`). Tre bracci: A verde, B rosso per voce, C rosso unico. Una prova «non giudicata» conta come rossa.
Controlla anche, leggendo l'HTML, che ogni funzione sia davvero usata nel punto in cui viveva il difetto.
Il risultato completo è in `docs/sviluppo/giro159/seguiti-159.json`.

| Braccio | L358 | T359 | B4 | D9 | B11 | B4flusso |
|---|---|---|---|---|---|---|
| A verde | V | V | V | V | V | V |
| B rosso per voce | R | R | R | R | R | R |
| C rosso unico | R | R | R | R | R | R |

## 1. Le cinque voci: prima, dopo, dove

La colonna «prima» è la misura con l'interruttore acceso, che riproduce la 7.999.190. La colonna «dopo» è il braccio A.

| Voce | File e righe | Prima | Dopo |
|---|---|---|---|
| **PO-358** Legacy Score: 14 punti a trofeo fino a 10 | `src/17-menu-creazione-pannelli.jsx:970` (`LEGACY_PER_TROFEO159=14`), `:985` (`calcLegacyScore`) | 80 a trofeo con tetto 140: 1 trofeo = 80, dal 2° in poi sempre 140. Carriera D18 del giro 140 (6 trofei): **745** | 1 = 14 · 2 = 28 · 5 = 70 · 10 = 140 · 12 = 140. Carriera D18: **689**. La leggenda al tetto su ogni voce fa ancora 1000, la stessa senza trofei 860 |
| **PO-359** derby con luoghi inventati | `src/08-panchina-derby-meteo-cori.jsx:286` (tabella `DERBIES`), `:296-298` (`isDerby`) | «Derby fra Mersey e Manchester» (due luoghi reali) | **«Derby della Brughiera Rossa»**, nella forma degli altri derby inventati del gioco («Derby del Fiume Grigio», «Derby della Città Alta»). `node tools/audit-copyright.mjs`: ✅ nessun riferimento al mondo reale |
| **B4** scadenza dei contratti | `src/06-archetipi-agenti-sponsor.jsx:201-210` (`contrattoFirma159`), trasferimento `src/18-career-app.jsx:6060`, passaggio pro `:5618` | Vedi sotto: il contratto mostrava una scadenza e ne aveva un'altra | Vedi sotto |
| **D9** proposta di rinnovo sulla media di due stagioni | `src/06-archetipi-agenti-sponsor.jsx:211-216` (`golRinnovo159`), `src/18-career-app.jsx:5761` | Stagione 4, settimana 1, 0 gol in corso e 20 nella stagione 3: base **0 gol**, quindi proposta −3% (moltiplicatore 0,97) | Base **10 gol** (media di 20 e 0), moltiplicatore 1,08. Con 10 gol in corso la base è 15 (era 10) |
| **B11** presenze in Primavera a parte | `src/17-menu-creazione-pannelli.jsx:1043-1048` (`presenzeLettera159`), testo della lettera `:1146` | Lettera: «701 presenze» (Primavera compresa) | «640 presenze (Primavera: 61 presenze)». Lo scorporo è `proCareerOf`, lo stesso della biografia del ritiro (7.272) |

### B4 in dettaglio: cosa ho misurato prima di correggere

Al cambio di stagione il gioco scala `contract.duration` di uno e a zero il contratto è scaduto (`src/18-career-app.jsx`, rollover,
`contractExpired=newContract.duration<=0`). Quindi `duration` conta le stagioni che restano compresa quella in corso, e la scadenza vera è
`stagione + duration − 1`. Le due firme scrivevano invece `expiresAtSeason = stagione + anni firmati` con `duration = anni firmati`.
La scadenza mostrata («Scade a fine stagione N», scheda Profilo e Agente) era quindi sempre una stagione più in là di quella vera.

Misura sul flusso vero (`B4flusso`), trasferimento definitivo per «1 stagione» accettato in stagione 2, settimana 20:

| | Dopo la firma | Inizio stagione 3 | Inizio stagione 4 |
|---|---|---|---|
| **Prima** (`__CPM_NO_G159_B4`) | durata 1, «scade a fine stagione 3» | **svincolato** (durata 0) | svincolato |
| **Dopo** | durata 2, «scade a fine stagione 3» | sotto contratto, durata 1, scadenza 3 | svincolato |

Prima, quindi, il contratto di gennaio durava sei mesi pur dicendo «fine stagione 3».
Ora vale fino a fine della prossima stagione, come ha deciso il PO.

Regola applicata (`contrattoFirma159`):
- **firmato a metà stagione** (trasferimento fuori dalla finestra estiva, cioè dalla settimana 6 in poi): `duration = anni + 1`,
  scadenza = `stagione + anni`;
- **firmato a inizio stagione** (passaggio pro, trasferimento nella finestra estiva W1-5): `duration = anni`,
  scadenza = `stagione + anni − 1`.

Passaggio pro: prima «1 stagione» firmata a inizio della stagione S mostrava scadenza S+1 e scadeva a fine S. Ora mostra S, che è la
formula indicata dal PO (scadenza = stagione + durata − 1). Il passaggio pro è verificato sulla funzione e sull'uso nel codice
(`statico.B4pro`), non sul flusso: il gancio di collaudo non apre `ProTransitionScreen`.

**Una scelta che ho dovuto fare io (reversibile col sotto-codice):** il PO ha deciso «a metà stagione» e «passaggio pro». Il gioco ha due
finestre di mercato, estiva (W1-5) e invernale (W19-23). Ho trattato la finestra estiva come «inizio stagione» (stessa formula del
passaggio pro) e tutto il resto come «metà stagione». Se il PO intende diversamente la finestra estiva, la soglia è `(p.week||1)>5` in
`src/18-career-app.jsx:6060`.

## 2. Cosa NON ho toccato (misurato, senza decisione del PO)

| Cosa | Misura | Perché è fuori |
|---|---|---|
| **Rinnovi** (`_acceptNegoWage` e offerta `isRenewal`) | `rinnovo-270`: firma in stagione 2 → durata 3, «scade a fine stagione 5»; con la regola del rollover il contratto vale stagioni 2, 3 e 4. Stesso scarto di una stagione del B4 | La decisione PO riguarda il contratto firmato a metà stagione e il passaggio pro. Il rinnovo ha una regola sua (PO-270), e la sua scadenza mostrata va decisa a parte → domanda 1 |
| **Prestiti** | Il contratto del prestito passa da `contrattoFirma159` come il trasferimento, ma il ritorno al club madre avviene al cambio stagione, qualunque cosa dica il contratto | Comportamento del prestito invariato. La scadenza mostrata durante un prestito resta quella di prima |
| **Contratto Primavera alla creazione** (`src/17:434`, durata 1 con scadenza 2 in stagione 1) | Stesso scarto, ma in Primavera il contratto non decide l'uscita | Non mostrato come contratto da professionista |
| **Gol nella lettera d'addio** | I gol restano il totale con la Primavera | La decisione B11 riguarda le presenze |
| Variabile `_totM` della lettera | Ora non è più usata | Lasciata per non allargare il diff |

## 3. Catena eseguita

Un controllo alla volta (`CPM_CI_PAR=0`), con `free -m` e `df -h` prima di ognuno (memoria libera sempre ≥ 12,8 GB, disco al 29%).
Tutti sul build `ee49b821`. Log in `/tmp/claude-0/ci159/*.log`.

| Controllo | Esito |
|---|---|
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | ✅ IDENTICO byte per byte, 21 frammenti |
| seguiti-159 | ✅ 6/6 verdi in A; ogni rosso cade sia per voce (B) sia con l'interruttore unico (C) |
| bassi-155 | ✅ 17/17 verdi, ogni rosso cade (L358 e T359 del 155 restano provati: il loro rosso riporta 80 senza tetto e «Ovest Lontano») |
| career-critical (11 passi uno alla volta: recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera) | ✅ tutti |
| career-invariants | ✅ 252 club, 0 pageerror |
| tripath-chokepoint | ✅ |
| stab-nat-trigger | ✅ |
| save-compat | ✅ 12 pass, 0 fail |
| test:logic | ✅ 43 pass, 0 fail |
| audit-copyright | ✅ nessun riferimento al mondo reale |
| rinnovo-270 (aggiunto perché il giro tocca i contratti) | ✅ |

Nel lanciatore ho scritto per errore un passo `audit-copyright-x` che non esiste (rc=1, nessun controllo eseguito). L'audit vero è stato
lanciato subito dopo con `node tools/audit-copyright.mjs`, ed è verde.
Prima della prima corsa del guardiano è servito `npm install` in `tests/visual`, perché mancava il modulo `playwright`.
La prima stesura di `B4flusso` era rossa per colpa dello strumento: con OVR 72 il generatore di offerte propone solo prestiti, e il
rientro dal prestito al cambio stagione nascondeva il contratto firmato. Ora la sonda posa un trasferimento definitivo.

## 4. Domande aperte per il PO

1. **Rinnovi:** un rinnovo firmato in stagione 2 con durata risultante 3 dice «scade a fine stagione 5» ma vale fino a fine stagione 4.
   Va allineato alla stessa regola (scadenza = stagione + durata − 1), oppure il rinnovo deve valere davvero fino alla stagione mostrata?
2. **Finestra estiva (W1-5):** va bene trattarla come «inizio stagione» (un «1 stagione» firmato lì scade a fine della stagione in corso)?

**Sintesi:** cinque voci chiuse secondo le decisioni PO dell'11/11 (Legacy 14 a trofeo, derby «della Brughiera Rossa», B4 contratti,
D9 rinnovo sulla media, B11 Primavera a parte). Il guardiano `seguiti-159` è verde e ogni rosso cade; la catena carriera è verde.
Restano 2 domande per il PO.
