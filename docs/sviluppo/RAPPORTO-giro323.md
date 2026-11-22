# RAPPORTO giro 323 — Salto a gennaio per merito in Primavera (PO-356, proposta B)

**Ramo** `sviluppo/giro323-salto-gennaio` · **base** `lavoro/201` (df2a3594, 7.999.202) · `GAME_VERSION` non toccata ·
`SAVE_VERSION` resta 9 (campi opzionali: assenti = comportamento di oggi).

Fonti: decisioni PO del 22/11 (messaggio di avvio del giro) · progetto `docs/progetto/PRIMAVERA-153.md` §3 e §6 (ramo
`progetto/giro153-primavera`) · proposta `docs/sviluppo/PROPOSTA-giro322-primavera.md` (ramo `sviluppo/giro322-primavera-proposte`) ·
misure di questo giro con la sonda `tests/visual/misura-323.mjs` (file `out/misura-323-prima.json` e `out/misura-323-dopo.json`,
non versionati).

## 1. Misura PRIMA (7.999.202)

Sonda `misura-323`: stagione di Primavera intera sugli handler veri (`__CPM_CAREER.step`: settimana vissuta → Simula → Avanza),
club FC Rossoneri Primavera (prestigio 78), attaccante, tre semi (nomi diversi) per profilo; ogni offerta che compare viene
accettata. Nessuna attesa a tempo fisso (si attende il cambio di stato).

| Profilo | Indice Primavera alla W19 | Cambi di club a stagione in corso | Note |
|---|---|---|---|
| OVR 58 | 41 · 42 · 42 | **0/3** | — |
| OVR 66 | 62 · 62 · 61 | **0/3** | 1 «indiscrezione» di mercato alla W19 (FC Brugse), mai diventata offerta nel percorso del banco |
| OVR 74 | 66 · 66 · 66 | **0/3** | — |

**Perché così poco, letto nel codice (non solo misurato).** In Primavera l'unico mercato è il tiro `Math.random()<offerProb` di
`doAdvanceWeek` (`src/18`, prima di questo giro r.5289-5290), con `offerProb` = 0,12 nella finestra (0,12 + spinta del procuratore
+ «superamento del club», che per un Primavera del club madre vale 0 perché l'OVR non supera il prestigio della squadra giovanile).
Ma `doAdvanceWeek` chiude **solo le settimane senza partita**: nella stagione misurata sono la 9, la **19**, la 28 e la 35 (le altre
34 le chiude la Simula, che il mercato non lo guarda; il blocco del mercato «all'arrivo» in settimana, r.1571, esce per chi non è
professionista). Quindi oggi c'è **un tiro solo, alla W19, al 12%, uguale per tutti gli OVR** e solo per chi chiude quella
settimana con Avanza. È l'asimmetria fra percorsi già trovata dal giro 153.

## 2. Cosa è cambiato

| Dove | Cosa |
|---|---|
| `src/08` (accanto a `indicePrimavera`) | `saltoGennaio323(p,w)` **funzione pura**: valuta UNA volta la settimana 19 (la 22 solo con un esordio, vedi §5); seme `hashStr("ps153|salto|"+nome+"|"+nazione+"|"+stagione+"|"+settimana)` come prescrive PRIMAVERA-153 §3; probabilità = logistica sull'Indice (`SALTO323` = soglia minima 60, metà a 66,4, pendenza 2,0, tetto 0,92). Esiti: **promozione** nel club madre (Indice alto **e** almeno un esordio, mostrata per prima, l'esterna in coda) oppure **offerta esterna** definitiva da un club senior (Indice alto anche senza esordio). Niente prestito. `offertaSalto323` costruisce l'offerta con lo stesso seme (club, stipendio, durata), senza `pick/rng`. Rosso `window.__CPM_NO_G323`. |
| `src/18` `applySaltoGennaio323` | chokepoint chiamato dai **tre percorsi** settimana (`simulateAndAdvance`, `onMatchEnd`, `doAdvanceWeek`) subito dopo `applyNatTournamentTrigger(player)`; registra la decisione in `p.salto323` (idempotente: una valutazione per finestra) e la notifica. |
| `src/18` `doAdvanceWeek` | il tiro `Math.random()<offerProb` **non si fa più per la Primavera** (resta identico per i professionisti). |
| `src/18` effetto dell'offerta | l'offerta di gennaio **vive nel salvataggio** (`salto323.aperta`) finché il giocatore non decide, fino alla W23; rispetta «Ci penso» (offerta 201). Vedi §4: prima stesura con un `setTimeout`, misurata sbagliata. |
| `src/18` `acceptTransfer` | se l'offerta è di gennaio: riga di diario **«Promosso a gennaio»**; Primavera **contata a parte** (`primavera323` {presenze, gol, assist}, riga di storia giovanile `youthHalf323` col club «… Primavera» che `proCareerOf` scorpora, `u18Goals/u18Assists/u18Matches` aggiornati, contatori della stagione a zero col club senior); `salto323.accettato`. Il resto (lega, calendario e classifica da `legaDopoTrasferimento212`, coppe, obiettivi) è il percorso di sempre. |
| `src/18` `declineTransferOffer` | rifiutata la prima offerta di gennaio, si apre quella in coda (l'esterna dopo la promozione). |
| `tests/visual` | guardiano `salto-323.mjs` (+ script npm, nelle righe MAPPA `src/18-` e `src/0[0-8]-` di `ci-runner.mjs`), sonda `misura-323.mjs`, `tripath-chokepoint-test` con `applySaltoGennaio323` fra i chokepoint obbligatori. |

**Premi Primavera a chi esce (D8):** nessuna modifica necessaria, verificata: i premi si assegnano nel blocco
`isInU18&&weekVal>38`, e chi è salito è professionista. Il guardiano lo misura arrivando a fine stagione (schermata
`seasonAwards`, 0 premi Primavera della stagione).

## 3. Misura DOPO (stessi profili, stessi semi)

| Profilo | Indice W19 | P del salto | `u` del seme | Esito | Settimana |
|---|---|---|---|---|---|
| OVR 58 | 42 · 41 · 41 | 0 · 0 · 0 | 0,312 · 0,602 · 0,789 | **0/3** | — |
| OVR 66 | 62 · 62 · 62 | 0,10 · 0,10 · 0,10 | idem | **0/3** | — |
| OVR 74 | 75 · 69 · 67 | 0,92 · 0,79 · 0,57 | idem | **2/3** (FC Darmstadt, FC Konya, esterne) | W20 (l'offerta si apre all'arrivo nella 20, dopo la chiusura della 19) |

Bersagli indicativi del progetto: OVR 74 ~45% · 66 ~10% · 58 ~0%. **Le probabilità calcolate dalla regola** sui valori medi
misurati sono 0% · 10% · 45-92%: 58 e 66 sono sul bersaglio; per 74 il valore dipende molto dall'Indice della singola
stagione (vedi dubbio 1). Tre semi per profilo non bastano a stimare una frequenza: i numeri «2/3» e «0/3» sono esiti, non
percentuali. Con la regola nuova nessun profilo usa più `Math.random` per il mercato.

## 4. Un difetto trovato misurando (e corretto nello stesso giro)

La prima stesura apriva l'offerta con `setTimeout(()=>setTransferOffer(...))`, come fa il resto del mercato. La sonda l'ha
vista comparire **alla W28 invece che alla W20** su OVR 74 «Sonda Aldo» (decisione giusta alla W19, offerta persa e ricomparsa
più tardi). Corretto tenendo l'offerta nel salvataggio (`salto323.aperta`) e aprendola con un effetto finché non si decide;
il guardiano ora prova anche che **dopo un ricarico** l'offerta è ancora aperta. Ri-misurato: offerta alla W20.

## 5. Come si comporta la condizione «almeno un esordio» finché il giro A non c'è

La regola legge `p.ps153.presenze` (stagione corrente), il blocco del progetto per le chiamate in prima squadra. Oggi quel campo
**non esiste in nessun salvataggio**, quindi `esordi = 0` sempre: la **promozione nel club madre non esce mai** e la **seconda
occasione alla W22 non scatta mai**; esce solo l'offerta esterna. Il guardiano prova i due rami con un `ps153` scritto dal banco
(promozione per prima e club madre senior, esterna in coda; W22 valutata solo con l'esordio). Quando il giro A scriverà
`ps153.presenze`, i due rami si accendono senza altro codice.

## 6. Controlli

| Controllo | Esito |
|---|---|
| `npm run salto-323` (verde) | ✅ 22/22 |
| `CPM_ROSSO323=1 npm run salto-323` (rosso `__CPM_NO_G323` = 7.999.202) | ❌ atteso, esce 1 (7 ko: regola assente, il vecchio dado col `Math.random()=0` apre la saga, nessuna offerta di gennaio) |
| `node tripath-chokepoint-test.mjs` | ✅ (con `applySaltoGennaio323` fra i chokepoint) |
| `career-invariants` | ✅ |
| `career-sim-test` | ✅ 2 stagioni |
| `save-compat` | ✅ 12/0 |
| `salta-163` | ✅ 19 verdi |
| `node tools/build-src.mjs` + `check-src.mjs` | ✅ IDENTICO |
| `node ci-runner.mjs giro salto-323` | vedi §8 |

## 7. Dubbi per il PO

1. **L'Indice separa poco 66 da 74.** Alla W19 un OVR 66 sta a 61-62 e un OVR 74 a 66-75 (stesso profilo, giri diversi: le partite
   simulate non sono identiche fra un giro e l'altro). Per centrare 10% a 66 e ~45% a 74 la curva deve essere ripida (pendenza 2):
   pochi punti di Indice cambiano molto la probabilità, e un OVR 74 con una buona stagione arriva al tetto 0,92. Due strade:
   (a) tenere così (il merito della stagione pesa molto, che è lo spirito della proposta); (b) addolcire la curva (metà a 69,
   pendenza 3 → circa 9% a 62, 34% a 67, 88% a 75: quasi uguale a 62, più morbida sopra). Serve una sonda con più semi per scegliere sui numeri: **non posso
   confermare** la frequenza vera con tre semi.
2. **I tre semi condividono la stessa `u` su tutti i profili** (il seme dipende da nome, nazione, stagione e settimana, non dall'OVR):
   con gli stessi nomi, i tre profili vedono gli stessi tre «dadi». È corretto per la regola (stesso giocatore, stessa scelta), ma
   rende la sonda meno informativa: per tarare servono più nomi.
3. **Il tiro casuale è tolto per tutta la Primavera, anche nella finestra estiva W1-5** (nel percorso misurato non scattava mai,
   perché quelle settimane le chiude la Simula). La decisione «SOSTITUITO» l'ho letta così; se il PO vuole ancora un mercato estivo
   per i Primavera, va deciso a parte.
4. **«Resto in Primavera»** (morale −2, fiducia +4, offerta di giugno garantita con Indice ≥ 75, progetto §6.2) **non è fatto**:
   le decisioni del 22/11 non lo nominano. Oggi rifiutare l'offerta di gennaio usa la reazione al rifiuto di sempre (`refuseEcho`).
5. **Contatori della stagione a zero dopo il salto.** Ho scelto di far ripartire gol/presenze della stagione col club senior (la
   Primavera va in una riga di storia giovanile e in `primavera323`), così la riga da professionista di fine stagione e i totali
   da professionista non contano i gol giovanili. È diverso dal trasferimento fra professionisti (7.293, la stagione continua);
   il travaso `seasonCarry` resta e il cruscotto «con la maglia precedente» li mostra ancora.
6. **Offerta scaduta**: se il giocatore non decide entro la W23 (per esempio con «Ci penso» lasciato scadere), l'offerta non si
   riapre più. È la chiusura della finestra invernale; da confermare.
