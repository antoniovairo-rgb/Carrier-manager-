# Rapporto di collaudo — zona G (carriera ed economia) · SOLO MISURA

- **Ramo:** `collaudo/zona-g-misura` · **Gioco:** CPM 7.999.169 · **Data:** 15/10/2026
- **Decisione PO (15/10):** «Solo misura, niente correzioni». Nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`.
- **Voci di backlog:** PO-222 e PO-223 (`docs/governo/BACKLOG.md`, righe 77–78).
- **Sonda:** `docs/collaudi/probe-zona-g-misura.mjs` (riproducibile: `node probe-zona-g-misura.mjs po222|po223`, con `CPM_CHROME=/opt/pw-browsers/chromium`).
- **Metodo:** gli handler veri esposti da `window.__CPM_CAREER` (test-only, `?cpmtest=1`). Lo stato si legge da `localStorage['cpm-v3']` (autosave), cioè quello che il giocatore ritrova ricaricando. Ogni braccio parte da una pagina nuova.
- **Riferimenti al codice:** numeri di riga di `CARRIER-MANAGER-AV.html` alla data del collaudo; si verificano con `grep -n`.

---

## Sintesi

| Voce | Ipotesi Codex | Verdetto | Gravità |
|---|---|---|---|
| **PO-222** | eroe «non convocato» riceve una presenza quando la gara è simulata | **Riprodotto in parte**: la presenza nei contatori compare per il **squalificato** (percorso *Simula*); per **infortunato** e **svincolato** i contatori restano fermi, ma nello **storico partite** compare una voce | **Media** (squalificato) · **bassa** (voce di storico) |
| **PO-223** | l'investimento pendente aggiunge €55.000 alla stagione successiva | **Non riprodotto** come doppio accredito né come accredito nella stagione sbagliata. **Riprodotto**: l'importo è fisso (€55.000) e slegato dalla puntata e dalla scelta, con un avviso che lo presenta come rendita | **Alta** (economia) |

---

## PO-222 — eroe non convocato e presenze

### Riproduzione (passo per passo)

1. Carriera pro, stagione 2, settimana **1**. La settimana scelta è la prima di lega con una partita (`FC Lilien`, lega), uguale per tutti i bracci. La scansione usa `patch({week, weekLived:false})` e `thisWeekMd()`.
2. Si applica lo stato del braccio (infortunio: `injured:true, injuryWeeks:4`; squalifica: `isSuspended:true`; svincolo: `contractExpired:true`).
3. Si esegue il percorso:
   - **Simula:** `step()` (= «Vivi la settimana», poi «Simula» → `simulateAndAdvance`).
   - **Gioca:** `playMatch(true)` (= pulsante «Gioca» → `startMatch`).
   - **Avanza:** clic sul pulsante principale del cruscotto.
4. Si legge lo stato persistito prima e dopo: `matches`, `totalMatches`, `matchHistory`, `injuryWeeks`, `week`.

### Numeri (esecuzione finale, un braccio per condizione)

| Braccio | Percorso | `matches` | `totalMatches` | voci `matchHistory` | voce aggiunta | esito |
|---|---|---|---|---|---|---|
| sano (controllo) | Simula | 0 → **1** | 0 → **1** | 0 → 1 | `rating` 6,3 | presenza regolare |
| **infortunato** | Simula | 0 → 0 | 0 → 0 | 0 → **1** | `injured:true`, `rating:null`, notifica «Infort. (saltata)» | voce di storico, **nessuna presenza nei contatori** |
| infortunato | Gioca | 0 → 0 | 0 → 0 | 0 → 0 | nessuna | bloccato: «Sei infortunato!» |
| infortunato | Avanza | non misurato | non misurato | non misurato | — | pulsante principale non disponibile in quello stato (vedi limiti) |
| **svincolato** | Simula | 0 → 0 | 0 → 0 | 0 → **1** | `svincolato:true`, `rating:null` | voce di storico, **nessuna presenza nei contatori** |
| **squalificato** | Simula | 0 → **1** | 0 → **1** | 0 → **1** | `rating` 6,3 | **presenza nei contatori** (3 esecuzioni su 3; vedi nota) |

**Nota di stabilità sul squalificato.** In 4 esecuzioni la settimana è avanzata e la presenza è stata accreditata in 3 (r1, r2, r3 in `out-po222-squalif-r*.json`). Nella quarta esecuzione (`out-po222-run5.json`) la settimana non è avanzata e non c'è stata presenza. Il numero di conferma non cambia, ma l'anomalia dello strumento va dichiarata. Il voto del controllo sano varia tra esecuzioni (6,3 e 6,9): i voti non sono usati come misura.

### Dove e perché (codice)

- **Presenza nei contatori, ramo lega di «Simula»** — `CARRIER-MANAGER-AV.html:48159`: `matches:(p.matches||0)+(p.contractExpired?0:1)` e `totalMatches` allo stesso modo. Il solo controllo è sullo svincolo; **nel ramo lega di `simulateAndAdvance` (righe 48014–48200) non compare nessun riferimento a `isSuspended`** (verificato con `awk`). Un eroe squalificato è quindi contato come presente.
- **Infortunato, Simula** — `CARRIER-MANAGER-AV.html:48145–48147`: il ramo `if(isInjured)` scrive la voce `injHistory` con `injured:true` e `rating:null`, **senza** incrementare `matches` (corretto per il contatore, ma la partita entra nello storico).
- **Infortunato, Gioca** — `CARRIER-MANAGER-AV.html:45889`: `if(player.injured){notify("Sei infortunato!")…return;}` in `startMatch`. Comportamento corretto, misurato.
- **Infortunato, Avanza (non misurato dal vivo)** — `CARRIER-MANAGER-AV.html:49420–49422`: il ramo `if(p.injured)` di `doAdvanceWeek` aggiunge solo la voce di storico (`injHist`) senza `matches`. È una lettura statica; non è verificata con il gioco in esecuzione.
- **Pulsante «Simula» della partita** — `CARRIER-MANAGER-AV.html:51528`: prima di `simulateAndAdvance()` azzera `isSuspended` (`if(player.isSuspended)setPlayer(…isSuspended:false)`). La sonda chiama `step()` e **non replica questo azzeramento**. Il verdetto sul contatore resta lo stesso, perché la presenza c'è anche senza l'azzeramento. Resta da verificare, in una sonda dedicata, cosa succede alla squalifica dopo il Simula.

### Verdetto PO-222

- **Presenza nei contatori per l'eroe squalificato (Simula): RIPRODOTTA** (3/3 esecuzioni valide). Causa nel codice: `CARRIER-MANAGER-AV.html:48159`, nessun controllo di squalifica nel ramo lega.
- **Presenza nei contatori per l'eroe infortunato o svincolato (Simula): NON RIPRODOTTA** (0 → 0 in tutte le esecuzioni).
- **Voce nello storico partite per infortunato e svincolato (Simula): RIPRODOTTA.** La voce è marcata (`injured` / `svincolato`) e ha `rating:null`. Il conteggio `seasonSplitShare` (riga ~9257) usa lo storico come partite; l'effetto preciso va verificato separatamente.
- **Gioca: NON RIPRODOTTA** (bloccato).
- **Avanza, infortunato: NON MISURATO dal vivo.** Solo lettura statica: nessuna presenza nei contatori, voce di storico.

**Gravità: media** per il squalificato (la presenza contraddice il testo del gioco, «questa partita la guardi dalla tribuna», riga 45890, e tocca presenze e record). **Bassa** per la voce di storico.

---

## PO-223 — investimento pendente e avviso «+55.000€»

### Riproduzione (passo per passo)

1. Carriera pro, stagione 2, settimana 36, saldo **€80.000** nel braccio con flag e nel controllo.
2. Stato «dopo la scelta»: nel braccio con flag `investmentPending:true`. Il flag è quello che la scelta scrive (`CARRIER-MANAGER-AV.html:48815`); la deduzione del saldo (`ef.bank`) è già applicata nel valore di partenza, coerentemente con la scelta «Ci punto una fetta» (−20.000, riga 2425).
3. Si chiude la stagione con `step()` fino a `seasonEnd`.
4. Rollover con l'handler vero `startNewSeason()`.
5. Si osservano il saldo, il flag e il testo visibile della pagina per 25 s (le notifiche sono una **coda con drenaggio temporizzato**, `CARRIER-MANAGER-AV.html:45291`, e l'avviso è in ritardo di circa 3 s più il tempo della coda).

### Numeri (esecuzione finale, `out-po223-run7.json`)

| Braccio | Saldo fine S2 | Flag a fine S2 | Saldo dopo rollover (S3) | Differenza | Flag dopo | Avviso visto |
|---|---|---|---|---|---|---|
| **con flag** (scelta −20.000) | 101.600 | sì | **156.600** | **+55.000** | no (azzerato) | «📈 L'investimento immobiliare rende: +55.000€ sul conto!» |
| controllo senza flag | 101.600 | no | 101.600 | 0 | no | nessuno |

L'accredito avviene **una sola volta**, all'inizio della stagione successiva (S2 → S3). Il controllo mostra che la differenza dipende dal flag e non da altro.

### Dove (codice)

- **Scelte che impostano il flag** — `CARRIER-MANAGER-AV.html:2103` (`wi_investimento`, −40.000, «rendita a fine stagione»), `:2425` (`wi_cripto`, −20.000, «esito incerto a fine stagione»), `:2485` (`wi_ristorante_socio`, −28.000, «rendita se l'attività gira»). Tutte e tre usano `flag:"investment"`.
- **Impostazione del flag** — `:48815`: `…(choice.flag==="investment"?{investmentPending:true}:{})`.
- **Accredito fisso al rollover** — `:50209`, dentro l'aggiornamento di stato di inizio stagione: `...(p.investmentPending?{bankBalance:Math.round((p.bankBalance||0)+55000),investmentPending:false}:{})`. L'importo è **costante** (55000), non dipende dalla puntata né dalla scelta.
- **Avviso** — `:50227`: `if(player.investmentPending)setTimeout(()=>notify("📈 L'investimento immobiliare rende: +55.000€ sul conto!"…),3000)`. Il testo è fisso: non mostra un importo calcolato.
- **Sistema separato, non coinvolto nei bracci misurati** — l'investimento di stagione «Patrimonio F3» (`invest24`, `:7489–7493`) accredita capitale più resa nello stesso passaggio di stagione. Usa un campo diverso e non interagisce con `investmentPending` nelle misure.

### Verdetto PO-223

- **Doppio accredito: NON RIPRODOTTO.** Un solo accredito di 55.000, il flag viene azzerato nello stesso passaggio, il controllo non riceve nulla.
- **Accredito nella stagione sbagliata: NON RIPRODOTTO come errore.** L'accredito avviene all'inizio della stagione successiva, come dice la nota «rendita a fine stagione».
- **Importo fisso, slegato dalla puntata e dalla scelta: RIPRODOTTO.** Misurato con la puntata di −20.000: il ritorno è +55.000 (netto +35.000). Per codice, le altre due scelte (−40.000 → netto +15.000; −28.000 → netto +27.000) ricevono lo stesso importo, perché usano lo stesso flag e lo stesso accredito. Questo dato è di codice, non misurato.
- **Una scelta «esito incerto» dà un ritorno certo: RIPRODOTTO per codice.** La nota di `wi_cripto` promette un esito incerto, ma il codice non ha nessun esito incerto.
- **Due investimenti nella stessa stagione danno un solo ritorno: PER CODICE, NON MISURATO.** Il flag è un booleano: la seconda scelta lo rimette a `true`, e al rollover ne scatta uno solo. Le due deduzioni dal saldo restano. `wi_investimento` è `once:true`, ma `wi_cripto` e `wi_ristorante_socio` non lo sono.

**Gravità: alta (economia).** Un ritorno garantito di 55.000, indipendente dalla puntata e dalla scelta, rende la scelta «rischiosa» economicamente dominante. Non è un doppio accredito, ma è una promessa non coerente con il testo della scelta. La correzione è esclusa dalla decisione del PO («solo misura»).

---

## Limiti dichiarati

1. **Avanza con infortunato non misurato dal vivo.** Nello stato «settimana vissuta + infortunato + partita in programma» il pulsante principale non compare (`nessun pulsante principale trovato`). Il verdetto su quel percorso è statico.
2. **Squalificato non stabile al 100%** (3 su 4 esecuzioni con presenza). Il verdetto sul contatore poggia su 3 esecuzioni concordi.
3. **Il pulsante «Simula» vero azzera la squalifica** (riga 51528). La sonda non lo replica: il verdetto sul contatore non cambia, ma l'effetto sulla squalifica (che viene tolta) è da verificare.
4. **Lo stato «dopo la scelta» è costruito con `patch`**, non seguendo l'evento settimanale `wi_investimento`, che è casuale. Il flag e la deduzione sono gli stessi che scrive la scelta (righe 2103/48814/48815).
5. **Non è stata verificata nessuna correzione**: il ramo è di sola misura.

## Riepilogo per il PO

- **PO-222:** la presenza nei contatori c'è per il **squalificato** nel percorso *Simula* (riga 48159, nessun controllo di squalifica). Per l'infortunato e lo svincolato c'è una **voce di storico**, non una presenza nei contatori. Gioca blocca correttamente l'infortunato.
- **PO-223:** nessun doppio accredito e nessun accredito nella stagione sbagliata. Il problema è l'**importo fisso di 55.000** (righe 50209, 50227), indipendente da puntata e scelta, con l'avviso che lo presenta come rendita.
