# PO-224 · finestre della home in primo piano — collaudo giro 8 su 7.999.160

**Base:** `main` 7.999.160 (commit 10288c7a). **Build:** `CARRIER-MANAGER-AV.html` allineato ai frammenti di `src/`.
**Sola lettura:** nessuna modifica al gioco. Nessuna correzione proposta.

## Esito in una riga

Con la misura finale, **una sola finestra PO-224 è comparsa** in una stagione: «La tua storia». A 412 px è in primo piano, chiudibile col puntatore e senza residui sulla home. A 360 px, nella stessa posizione di sequenza, è **coperta da un altro livello** (l'intervista settimanale). Le altre finestre richieste («Il mondo fuori», «Il conto delle parole», patto, spogliatoio, procuratore) **non sono comparse** in questa misura: su di esse non posso confermare nulla.

## 1. Metodo e limiti del percorso di test

- **Sonda:** `docs/collaudi/sonde/po224-finestre-160.mjs`. Salvataggio `tests/visual/fixtures/save-190-s12-ovr93.json`, GLB spento.
- **Percorso di test, non produzione:** la build è caricata con `?cpmtest=1` più `window.__CPM_POP224=1`, come fa `tests/visual/popup-224.mjs`. Il motivo: `__CPM_CAREER` (il gancio che fa avanzare la settimana) è registrato solo sotto `_CPM_TEST` (`src/18-career-app.jsx:1290-1291`), e senza `__CPM_POP224` le finestre PO-224 sono spente (`src/18-career-app.jsx:1924`).
- **Avanzamento:** `__CPM_CAREER.step()` a ogni passo, come `career-sim-test.mjs`. Il passo restituisce `seasonEnd` alla fine di stagione (`src/18-career-app.jsx:1334`), e il pulsante reale «🆕 Inizia Stagione N →» (`src/16-scene-3d-cerimonie.jsx:3158`) non compariva nella sonda (`visibile=false`); non ho stabilito perché. Per uscire ho usato il gancio di collaudo `startNewSeason()` (`src/18-career-app.jsx:1328`). **Questo aggira il pulsante reale.**
- **Una sola stagione per run:** 46 passi a larghezza. Due stagioni hanno superato il tempo di una chiamata (circa 8 s a passo in headless).
- **Chiusura:** col puntatore, sul pulsante di scelta (l'ultimo senza «›»). Il «›» è l'intestazione della fisarmonica, non una chiusura: nella prima versione della sonda l'avevo scambiato per la chiusura, e l'ho corretto.

## 2. Risultati

| Larghezza | Finestre osservate | Tipo | In primo piano | Dentro lo schermo | Chiusura col puntatore | Residui sulla home |
|---|---|---|---|---|---|---|
| 412 px | 1 | «La tua storia» (passo 4 della sequenza) | sì | sì | sì, con «Continua la storia →» | 0 |
| 360 px | 1 | «La tua storia» (stesso passo) | **no**: coperta da «INTERVISTA Zona Mista SETTIMANALE» | sì | **no**: pulsante coperto | 0 |

### «La tua storia» a 412 px (`docs/collaudi/PO224-dati-160/po224-412.json`)

- **Fisarmonica:** la finestra parte **aperta** (230 caratteri di testo).
- **Tocco sull'intestazione «›»:** il corpo si chiude (15 caratteri) e **il pulsante di scelta «Continua la storia →» esce dal DOM** (0 pulsanti di scelta). La finestra resta visibile, con la sola intestazione.
- **Riapertura col tocco sull'intestazione:** il corpo torna (230 caratteri) e il pulsante riappare.
- **Chiusura:** «Continua la storia →» col puntatore → finestra chiusa, nessun residuo di pari titolo fuori dalla finestra.
- Codice della card: `src/18-career-app.jsx:7495-7496` (momento «La tua storia» dentro `_pop224`).

### «La tua storia» a 360 px (`docs/collaudi/PO224-dati-160/po224-360.json`)

- La finestra è sotto **«INTERVISTA Zona Mista SETTIMANALE»** (un `DIV` di un altro sistema, non PO-224): la foto `la-tua-storia-360.png` la mostra in primo piano, con anche il toast «Nuova stagione iniziata!».
- Il tocco sull'intestazione non ha cambiato il testo (230 → 230). Il pulsante di scelta è coperto. Non ho verificato dove arrivi il tocco; la copertura è la spiegazione più probabile, ma non l'ho dimostrata.
- **Non posso confermare** perché, con stessa partita e stesso passo, a 412 px l'intervista non copra la finestra e a 360 px sì. Non ho misurato la causa.

## 3. Foto (`docs/collaudi/PO224-160-foto/`)

- `la-tua-storia-412.png`: la card «La tua storia» al centro, con intestazione a fisarmonica, corpo e «Continua la storia →», sopra la home oscurata. Nella home dietro il velo si intravede la card «Avvia Stagione».
- `la-tua-storia-360.png`: l'intervista settimanale in primo piano; la finestra «La tua storia» non si vede.

## 4. Cosa non è stato misurato (e perché)

- **«Il mondo fuori», «Il conto delle parole», spogliatoio, procuratore**: nessuna comparsa in questa misura. Il codice le gestisce con `_pop224` (`src/18-career-app.jsx:7863`, «Il mondo fuori»), ma non ho misurato il loro comportamento. **Non posso confermarlo.**
- **Patto col mister:** la finestra forzata con `coachPact` attivo (come `popup-224.mjs`) **non è comparsa** nel run finale, a entrambe le larghezze. In un run precedente, non conservato, la stessa finestra compariva coperta dalla celebrazione «CAMPIONI!» (un `DIV`). Non posso dire perché nel run finale non compaia.
- **Impulsi in secondo piano sulla home:** misurati solo per il titolo di «La tua storia» (0 residui fuori dalla finestra a entrambe le larghezze). Per le altre finestre la misura non è stata fatta.
- **Percorso reale:** non ho cliccato «Inizia Stagione» né il pulsante «Vivi la Settimana» (il gancio di collaudo sostituisce i passi della settimana). Il blocco della partita al bordo di stagione resta **da verificare col pulsante reale**.

## 5. Riproduzione

```bash
cd /home/user/Carrier-manager-
WIDTH=412 SEASONS=1 CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node docs/collaudi/sonde/po224-finestre-160.mjs
WIDTH=360 SEASONS=1 CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node docs/collaudi/sonde/po224-finestre-160.mjs
```

Dati: `docs/collaudi/PO224-dati-160/po224-{412,360}.json` e i log `log-{412,360}.txt`.

---

**Stato: NON CHIUSO.** Motivo: in una stagione è comparsa una sola finestra (una delle sei richieste). A 360 px è coperta da un altro livello; il tocco sull'intestazione chiude la scelta e il patto forzato non compare. Le altre finestre non sono state osservate, e la fine stagione è stata superata con un gancio di collaudo e non col pulsante reale.

_Collaudo eseguito dalla sessione collaudatrice (sola lettura sul gioco)._

**NON CHIUSO** — in una stagione è comparsa una sola finestra su sei; a 360 px è coperta da un altro livello; il patto forzato non compare; la fine stagione è stata superata con un gancio di collaudo, non col pulsante reale.
