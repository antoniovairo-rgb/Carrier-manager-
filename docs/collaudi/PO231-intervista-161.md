# PO-231 — intervista post partita «Sempre, dopo ogni partita» · collaudo 161

**Build:** 7.999.161 (base `poc/marioprada-character-system`, `a42920b`) · ramo `collaudo/sessione-collaudatrice-161`
**Salvataggio:** `tests/visual/fixtures/save-190-s12-ovr93.json` (stagione 12, settimana 38, ultima partita della stagione)
**Sonda:** `tests/visual/collaudo-231-intervista.mjs` · **dati grezzi:** `docs/collaudi/PO231-dati.json` · **foto:** `docs/collaudi/foto/PO231-412-partita1-intervista.png`
**Testimoni:** `window.__CPM_IV231` (interviste chieste dal gioco) e `window.__CPM_IVBLK231` (cosa la blocca)

## Cosa è stato fatto (e le deviazioni)

- Partita avviata col pulsante del gioco «Gioca la partita», poi autoplay seedato (`__CPM_AUTOPLAY`) fino al fischio. `__CPM_CAREER` serve solo per leggere settimana e fase. Le finestre sono state chiuse **cliccando** i pulsanti visibili (`closeTop`); nessun `__CPM_CAREER.dismiss` nel ciclo.
- **Deviazione 1 — `?cpmtest=1`:** serve per leggere lo stato (`__CPM_CAREER`, `src/18-career-app.jsx:1291`). Armati `__CPM_POP224=1` e `__CPM_PRESENT=1` per avvicinarsi alla produzione.
- **Deviazione 2 — velocità:** `cpm-match-speed = 4` (la stessa della sonda `intervista-231` del repo). Tempo di gioco non da giocatore a 1x.
- **Deviazione 3 — GLB OFF:** l'intervista è UI 2D sopra la scena; la direttiva PO chiede GLB-ON per le verifiche percettive. Dichiaro lo scostamento.
- **Bug del driver:** il campo `dopoQuante` era calcolato prima che la lista delle finestre precedenti fosse registrata, quindi nel JSON della run compare `0`. Il valore vero si legge dalla sequenza grezza (sotto). Il driver è corretto nel codice; la correzione è nel commit che accompagna questo rapporto, ma la run non è stata ripetuta.

## Partita 1 — VERIFICATA

Risultato: **MER 2-0 FC Tyneside**, esito `win` (`data-ctx="win"`, foto: «BIG WIN»).

Finestre comparse **dopo il fischio**, in ordine di apparizione (`PO231-dati.json`, `partite[0].finestreDopoFine`):

1. `settimana23` — «SETTIMANA 39» (impulso della settimana: finestra)
2. `toast23` — «💪» (avviso senza pulsanti: **non** una finestra)
3. **`intervista231` — «INTERVISTA» (Sport in Rete, BIG WIN)** ← l'intervista post partita
4. `intervista231` — «IL GIORNALISTA INCALZA» (seconda domanda)
5. `intervista231` — «COM'È ANDATA» (terza domanda, con «Chiudi»)
6. `gala51` — cerimonia premi di fine stagione
7. toast e avvisi (🆕, 🏆, 🎙️, ✅, 📈, 🎯, ⭐) e `pop224` «La tua storia»

**Quante finestre prima dell'intervista:** **una** finestra (`settimana23`), più un avviso senza pulsanti. Il gioco ha chiesto l'intervista una volta: `__CPM_IV231 = 1`, `__CPM_IVBLK231 = null` (nessun blocco).

Foto a 412×915: sopra il pannello la scena di campo con il tabellone «MER 2-0 FC Tyneside»; nel pannello «INTERVISTA · Sport in Rete», il badge «BIG WIN», tre risposte e la scritta «Scegli il tono della risposta: gli effetti li vedrai subito dopo».

**Nota sul conteggio:** l'intervista di questa partita è apparsa dopo la finestra della settimana, cioè la prima cosa che il giocatore vede al rientro. Anche nelle due run del compito 1 (`PO230-finestre-161.md`) l'intervista post partita è comparsa subito dopo la finestra della settimana.

## Partite 2 e 3 — NON VERIFICATE

Dopo il fischio della partita 1 la stagione 12 si chiude (`Chiudi la stagione`, il gala, il bilancio) e il gioco passa alla **stagione 13**. Il driver non è riuscito a giocare la seconda gara: la traccia di fase (`PO231-dati.json`, `traccia`) si ferma a `ceremony → ended` al passo 249 e poi non cambia più per circa 3.900 s, fino al limite di tempo. Nei controlli le uniche finestre visibili erano avvisi senza pulsanti (`gala51` «Chiara Loreti apre la prima busta» per 12 controlli, poi toast). Il driver conosce il pulsante «Vai al bilancio della stagione», ma in queste run non è mai stato cliccato.

**Non posso dire se la causa è nel gioco o nel driver.** Per distinguere serve una run più lunga che registri la schermata ferma (screenshot e pulsanti visibili) e un tempo di attesa maggiore sul bilancio di fine stagione. Anche una volta uscito dal bilancio, la seconda partita della stagione 13 richiede molte settimane di «Vivi la Settimana»: un'altra ora circa di run.

## Esito

| Partita | Intervista compare? | Finestre prima | Foto 412×915 | Note |
|---|---|---|---|---|
| 1 (sett. 38, MER 2-0) | **sì** | 1 (`settimana23`) + 1 avviso | sì | intervista verificata |
| 2 | non verificata | — | — | la run non ha giocato la gara |
| 3 | non verificata | — | — | come sopra |

**STATO: NON CHIUSO — motivo:** verificata 1 partita su 3 richieste. Non è dimostrato che l'intervista compaia «dopo ogni partita»: serve almeno la partita 2 (stagione 13). Il blocco nella chiusura della stagione è un risultato del driver o del gioco, non ancora diagnosticato.

---
_Collaudo eseguito dalla collaudatrice (sola lettura sul gioco). Nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`._
