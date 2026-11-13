# Rapporto giro 159b — scadenza dei rinnovi e finestra estiva (PO-338, base 7.999.191)

Ramo: `sviluppo/giro159-seguiti-bassi`, sopra il giro 159 (`3835d19`). `GAME_VERSION` non è stato toccato.

Decisioni PO dell'11/11 sera, che rispondono alle due domande del rapporto 159:
1. **Rinnovi: «Stessa regola».** Scadenza = stagione + durata − 1. Esempio del PO: firma in stagione 2, durata 3 → mostra «fine stagione 4» e vale fino a fine stagione 4.
2. **Finestra estiva W1-5: «Sì, inizio stagione».** Un «1 stagione» firmato in W1-5 scade a fine della stagione in corso.

**In sintesi:** la durata dei rinnovi non cambia (resta la regola PO-270). Cambia solo la scadenza scritta, che ora è la stagione in cui il
contratto finisce davvero. La finestra estiva era già trattata come «inizio stagione» dal giro 159: qui viene solo provata, e ha un rosso.
Guardiano nuovo `npm run seguiti-159b`: **4/4 verdi** in A, **4/4 rosse** con `__CPM_NO_G159B`. Catena carriera completa verde.

## 1. Cosa ho misurato prima di correggere

Il braccio rosso (`__CPM_NO_G159B`) riproduce la 7.999.191 su questi punti. Ogni prova firma e poi cambia stagione con `startNewSeason`
finché il contratto scade. Così si legge l'ultima stagione davvero coperta.

| Prova | Firma | Scritta dopo la firma | Ultima stagione coperta | Passi (stagione: durata/scadenza) |
|---|---|---|---|---|
| Rinnovo negoziato (`_acceptNegoWage`), S2, residua 1, 2 anni firmati | durata 3 | **«fine stagione 5»** | **4** | S3: 2/5 · S4: 1/5 · S5: 0/5 svincolato |
| Offerta `isRenewal` di 2 anni, S2, residua 1 | durata 3 | **5** | **4** | S3: 2/5 · S4: 1/5 · S5: 0/5 svincolato |
| Trasferimento «1 stagione», S2, **W3** (rosso = la 7.999.190) | durata 1 | **3** | **2** | S3: 0/3 svincolato |

Prima, quindi, la scadenza scritta era sempre una stagione più in là di quella vera. È lo stesso scarto del B4 del giro 159.

## 2. Cosa ho cambiato

| File e riga | Cosa |
|---|---|
| `src/06-archetipi-agenti-sponsor.jsx:211-218` | Commento della decisione. `_g159b()` legge `window.__CPM_NO_G159B`. `scadenzaRinnovo159b(stagione, durata)` restituisce `stagione + durata − 1`, oppure `stagione + durata` col rosso |
| `src/18-career-app.jsx:5790` (`_acceptNegoWage`) | `expiresAtSeason: scadenzaRinnovo159b(p.season, _durRin270(p))`. Prima era `(p.season\|\|1) + _durRin270(p)` |
| `src/18-career-app.jsx:5853` (offerta `isRenewal`) | Stessa cosa con `_durRin270b(p)` |
| `src/18-career-app.jsx:1288` (firme dei «career moments») | Stessa cosa con la durata nuova `(p.contract?.duration\|\|1) + (ef.contractYears\|\|0)` → vedi domanda 1 |
| `src/18-career-app.jsx:6060` (trasferimento) | Il ramo verde è invariato: `contrattoFirma159(stagione, anni, settimana > 5)`. Il rosso, solo in W1-5, riscrive il contratto come la 7.999.190: durata = anni, scadenza = stagione + anni |
| `CARRIER-MANAGER-AV.html` | Ricomposto con `node tools/build-src.mjs`. `check-src`: **IDENTICO BYTE PER BYTE**, 7.189.577 byte, 21 frammenti |
| `tests/visual/seguiti-159b-test.mjs` (nuovo) + `package.json` (`"seguiti-159b"`) | Guardiano, vedi sezione 3 |
| `tests/visual/seguiti-159-test.mjs:20` | Solo l'ancora del controllo statico `B4tr`: la chiamata a `contrattoFirma159` ora sta nel ramo verde (`:contrattoFirma159(…))` invece di `...contrattoFirma159(…)`). Le prove e le soglie non cambiano |

Il giro 159 ha già cambiato `_contratto49` («Scade a fine stagione N (è l'ultima stagione)»), la cella «Scadenza» dell'Agente e la
migration: leggono tutti `expiresAtSeason − stagione`. Quindi un rinnovo all'ultimo anno ora dice «è l'ultima stagione» nell'anno in cui
lo è davvero. Prima lo diceva un anno dopo, quando il contratto era già scaduto.

## 3. Guardiano `seguiti-159b`

Il giudizio è lo stesso per tutte le prove di flusso: **l'ultima stagione sotto contratto è quella scritta nella scadenza**. Inoltre le
schede Agente, Dashboard e Profilo dicono tutte quella stagione: la sonda legge «scade a fine stagione N» e «Scadenza · Fine stagione N»,
e due numeri diversi danno «non giudicato». Quattro prove:
- `logica`: (2,3)→4, (2,2)→3, (5,1)→5.
- `rinNego`: il percorso UI di rinnovo-270 («Negozia rinnovo» → «Accetta l'offerta del club»). In più c'è l'esempio del PO: durata 3 → scadenza 4.
- `rinOff`: offerta `isRenewal` di 2 anni, posata con `setOffer` e accettata con `acceptOffer`.
- `estiva`: trasferimento definitivo «1 stagione» in S2 W3. L'attesa è scadenza 2 e durata 1.

C'è anche un controllo statico: i tre punti di rinnovo usano la funzione, la chiamata della finestra estiva c'è, e le due scritture
vecchie non ci sono più. Un «non giudicato» conta come rosso.

| Braccio | logica | rinNego | rinOff | estiva |
|---|---|---|---|---|
| A verde | V (4, 3, 5) | V: scritta 4 · ultima 4 · S3 2/4 · S4 1/4 · S5 svincolato | V: identico | V: scritta 2 · ultima 2 · S3 svincolato |
| B rosso `__CPM_NO_G159B` | R (5, 4, 6) | R: scritta 5 · ultima 4 | R: scritta 5 · ultima 4 | R: scritta 3 · ultima 2 |

Il risultato completo è in `docs/sviluppo/giro159/seguiti-159b.json`.

La prima corsa del guardiano era rossa nel braccio A per colpa dello strumento. I dati di contratto erano già giusti, ma la sonda cercava
«Scade a fine stagione» (maiuscola) nella sola scheda Agente. Lì la scritta è la cella «Scadenza · Fine stagione N», mentre la riga breve
in minuscolo sta in Dashboard. Ho allargato la lettura alle tre schede e alle due forme, e ho aggiunto la regola che tutte devono
concordare. Il giudizio non è cambiato.

Le foto prima/dopo non le ho fatte: la scritta che si vede è letta e confrontata dalla sonda in entrambi i bracci (colonna «scritta» qui
sopra).

## 4. rinnovo-270 resta coerente: nessuna attesa cambiata

`rinnovo-270` controlla solo `duration` (dopo la firma = 1 + anni firmati, nella stagione dopo = anni firmati, mai svincolato). Non
legge `expiresAtSeason`. La decisione PO tocca solo la scadenza, quindi **nessuna riga del guardiano va cambiata**. Misura sul build nuovo:

| Caso | Dopo la firma | Stagione 3 |
|---|---|---|
| Rinnovo A (1 anno) | durata 2, scadenza **3** (era 4) | durata 1, scadenza 3 |
| Rinnovo C (2 anni) | durata 3, scadenza **4** (era 5) | durata 2, scadenza 4 |
| Offerta isRenewal 1 / 2 / assente | 2/3 · 3/4 · 3/4 | 1/3 · 2/4 · 2/4 |

Il verde è ✅. `CPM_ROSSO=1` (`__CPM_NO_RIN270`) è ❌ come deve. `CPM_ROSSO=b` (`__CPM_NO_RIN270b`) è ❌ come deve.

## 5. Catena eseguita (carriera completa)

Un controllo alla volta (`CPM_CI_PAR=0`), con `free -m` e `df -h` prima di ognuno: memoria libera sempre ≥ 13,3 GB, disco al 26%.
Tutto sul build di questo commit. Log in `/tmp/claude-0/ci159b/`.

| Controllo | Esito |
|---|---|
| build-src + check-src | ✅ IDENTICO byte per byte |
| seguiti-159b | ✅ A 4/4 V · B 4/4 R |
| seguiti-159 | ✅ 6/6 V, rossi per voce e unico tutti R |
| rinnovo-270 · rosso 1 · rosso b | ✅ · ❌ atteso · ❌ atteso |
| bassi-155 | ✅ 17/17 |
| career-critical, 11 passi uno alla volta (recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera) | ✅ tutti |
| career-invariants | ✅ 252 club, 0 pageerror |
| tripath-chokepoint · stab-nat-trigger | ✅ · ✅ |
| save-compat | ✅ 12 pass, 0 fail |
| test:logic | ✅ 43 pass, 0 fail |
| audit-copyright | ✅ nessun riferimento al mondo reale |

La partita-vera non l'ho eseguita: il giro non tocca né partita né motore. Prima della prima corsa è servito `npm install` in
`tests/visual`, perché mancava il modulo `playwright`.

## 6. Domande aperte per la sessione madre

1. **Firme dei «career moments» (`src/18:1288`).** Il PO ha nominato `_acceptNegoWage` e l'offerta `isRenewal`. Esiste però un terzo punto
   che rinnova: un momento di carriera con `wageMult` o `contractYears`. Scriveva anch'esso stagione + durata, e lo faceva anche quando
   cambiava solo lo stipendio. In quel caso spostava di una stagione in avanti la scadenza di un contratto già corretto dal B4. L'ho
   allineato alla stessa regola, sotto lo stesso rosso `__CPM_NO_G159B`. Va confermato che rientra nella decisione «stessa regola». Se no,
   basta riportare quella riga a `(p.season||1)+(p.contract?.duration||1)+(ef.contractYears||0)`. Il guardiano lo prova solo in modo
   statico: oggi non c'è un gancio di collaudo per forzare un career moment con firma.
2. **Rosso della finestra estiva.** Il giro 159 aveva già messo la finestra estiva come «inizio stagione». Il PO l'ha confermato, quindi
   non c'era un difetto da correggere, ma solo un comportamento da provare. Per dare un rosso alla prova, `__CPM_NO_G159B` riporta in W1-5
   la scrittura della 7.999.190 (scadenza = stagione + anni). Va bene così, o si preferisce che il caso estivo resti provato solo dal
   rosso `__CPM_NO_G159_B4` del giro 159? Quel rosso fa cadere anche questa prova.
3. **Saves già esistenti.** Un rinnovo firmato prima di questo giro porta nel salvataggio una scadenza di una stagione in più. Non ho
   aggiunto una migration che la corregga. Servirebbe ricalcolarla come stagione + durata − 1, ma un contratto in prestito ha una
   scadenza sua, e la migration non sa distinguere i due casi senza altri dati. Va deciso se correggerla e come.
