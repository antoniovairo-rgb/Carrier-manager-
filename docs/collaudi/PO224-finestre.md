# PO-224 · Finestre della home (patto col mister, «Lo spogliatoio») — collaudo

**Build:** `GAME_VERSION="7.999.158"` (letto con `grep` dal file costruito in `/tmp/cpm158`, da `origin/poc/marioprada-character-system`, commit `8b9a9e5`; `CPM_FORZA_BUILD=1 node tools/build-src.mjs`).
**Sonda:** `docs/collaudi/sonde-158/collaudo-po224.mjs` (da copiare in `tests/visual/` di una build 7.999.158; `WIDTH=360|375|412 SEASONS=2 node collaudo-po224.mjs`; con `SBLOCCO=1` anche la prova di sblocco).
**Dati:** `docs/collaudi/dati-158/po224-{360,375,412}.json`, `po224-375-sblocco.json` (una riga per settimana).
**Foto:** `docs/collaudi/foto/po224-spogliatoio-{360,375,412}.png` (prima finestra della run, una per formato).

## 1. Metodo

- Salvataggio `save-190-s12-ovr93.json` (come `popup-224.mjs`), `__CPM_POP224=1` armato con `addInitScript`, `__CPM_GLB=false`, `?cpmtest=1`.
- Stagione giocata con gli handler veri `__CPM_CAREER.step()` + `dismiss()` (come `career-sim-test.mjs`). **Limite:** `step()` avanza la settimana senza passare dal pulsante «Vivi la Settimana», quindi la prova «il gioco va avanti» è sul percorso degli handler, non sul clic dell'utente.
- Due corse di due stagioni (S12 fine → S13 → inizio S14): **92 settimane** a ogni formato.
- Per ogni settimana: presenza di `[data-cpm=pop224]`, tipo (dal testo), prova di chiusura con il **puntatore** (clic reale) e con **clic JS diretto** sul pulsante (isola l'handler dal rivestimento), altri overlay fissi con z≥1000, raggiungibilità di «Vivi la Settimana» via `elementFromPoint`.
- Celebrazione di titolo («CAMPIONI! … 🎉 Festeggia») chiusa dalla sonda prima di ogni altra azione, come farebbe il giocatore: senza questo passo la celebrazione copre tutto e la misura riguarderebbe la sonda, non il gioco. Non è un difetto.

## 2. Risultati (92 settimane per formato, `pageerror` = 0 in tutte le corse)

| Formato | Finestre | Tipo | Chiusa col **puntatore** | Chiusa col **clic JS** | Settimane con un altro overlay fisso | «Vivi» non cliccabile senza finestra |
|---|---|---|---|---|---|---|
| 360 px | 3 (S13 W2, W14, W17) | spogliatoio ×3 | 0 / 3 | 3 / 3 | 90 / 92 | 35 settimane |
| 375 px | 3 (S13 W2, W14, W25) | spogliatoio ×3 | 0 / 3 | 3 / 3 | 90 / 92 | 35 settimane |
| 412 px | 3 (S13 W2, W14, W17) | spogliatoio ×3 | 0 / 3 | 3 / 3 | 90 / 92 | 35 settimane |

- **Tipi osservati:** solo «Lo spogliatoio». **Non osservate in due stagioni** né la *proposta* né il *verdetto* del patto col mister: nella simulazione naturale non sono comparsi. Non li ho seminati (lo fa `popup-224.mjs` con `patch coachPact`): **non posso confermare** come si comportano in gioco reale.
- **Sovrapposizioni tra finestre di PO-224:** 0 (una sola `[data-cpm=pop224]` per volta, come da `_popTaken224`).
- **Sovrapposizioni con altre finestre:** sì. In 90 settimane su 92 un altro overlay fisso è presente. In particolare il dialogo del procuratore «IL CONFRONTO» (Claudio Venturi, `data-cpm="confronto23"`) copre «Lo spogliatoio»: la foto `po224-spogliatoio-375.png` mostra il dialogo del procuratore sopra la home, e la finestra dello spogliatoio non è visibile. Anche la celebrazione di titolo copre tutto finché non si preme «Festeggia».
- **Chiusura con la scelta:** il clic JS sul pulsante «Il gruppo prima di tutto →» chiude la finestra in 3/3 casi e scrive `bondEv` (l'handler funziona). Il clic col puntatore non la raggiunge in 0/3 perché il dialogo del procuratore è sopra.

## 3. Prova di sblocco (375 px, `SBLOCCO=1`, tre corse)

Si fa avanzare il livello che copre la finestra scegliendo le sue opzioni (fino a 8 passi), poi si prova il clic col puntatore sullo spogliatoio.

| Settimana | Passi sul livello sopra | Cosa lo copriva dopo | Chiusa col puntatore |
|---|---|---|---|
| S13 W2 | «Sto benissimo qui.» → «Chiudi» | niente (il dialogo del procuratore si è chiuso) | **sì** |
| S13 W14 | «💪 Grazie, mister. Non mi fermo qui.» | un altro livello non identificato (`DIV`, non `data-cpm`) | no |
| S13 W17 | «🤝 Dedico tutto ai tifosi…» | un altro livello non identificato | no |

- **Conferma:** il dialogo del procuratore è **in più passi**, e lo spogliatoio resta coperto finché non si chiude. Nel caso W2 la sequenza completa porta alla chiusura con il puntatore.
- **Non confermo** la catena nelle settimane W14 e W17: dopo il primo passo resta un livello che non ho identificato, e non ho proseguito oltre. Il rapporto non attribuisce quel livello a nessun codice.

## 4. Cosa non posso confermare

- Il blocco della partita: `step()` ha avanzato le 92 settimane senza errori e senza stallo, ma **non passa dal pulsante**. Il pulsante «Vivi la Settimana» non è cliccabile col puntatore in 35 settimane, anche senza finestra PO-224 (altri livelli), quindi **non posso attribuire quel blocco alla sola finestra dello spogliatoio**.
- La proposta e il verdetto del patto: non osservati in simulazione naturale.
- L'ordine di comparsa tra finestre: il dialogo del procuratore sta sopra per DOM e non per priorità dichiarata nel codice. Non ho verificato se il gioco lo voglia così.

## 5. Riproduzione

```
# in una build 7.999.158 (tests/visual)
WIDTH=375 SEASONS=2 node collaudo-po224.mjs          # 92 settimane, una corsa
SBLOCCO=1 WIDTH=375 SEASONS=2 node collaudo-po224.mjs  # con la prova di sblocco
```
Tempo: circa 2,5 minuti per corsa a 375 px in headless.

---
_Collaudo eseguito dalla sessione collaudatrice del team CPM (sola lettura sul gioco). Rapporto e sonde su `collaudo/sessione-collaudatrice`._
