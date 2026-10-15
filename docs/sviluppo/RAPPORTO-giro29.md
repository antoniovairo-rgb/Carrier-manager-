# RAPPORTO — giro 29 · PO-167 (parziale) «Anticipa solo il backup»

Ramo `sviluppo/backup-167` · build di partenza 7.999.169 · **GAME_VERSION non toccato** · **SAVE_VERSION non toccato**.

## Cosa è stato fatto

### 1. Copia di riserva automatica degli slot (`src/08-panchina-derby-meteo-cori.jsx`, oggetto `storage`)
- Dentro `scrivi()` di `storage.save`, **prima** di sovrascrivere lo slot si legge il contenuto attuale: se è una
  versione buona (JSON leggibile con `player.name`) e diverso da quello nuovo, viene copiato in `<chiave>-riserva`
  (`cpm-v3-riserva`, `cpm-v3-s2-riserva`, `cpm-v3-s3-riserva`). Se la copia fallisce, il salvataggio prosegue e la
  riserva precedente resta com'era.
- La copia vive **dentro la stessa coda per chiave del 7.448.0**: ordine delle scritture e scarto delle scritture
  superate restano invariati.
- Nuovi metodi: `listRiserve()` (slot con principale corrotto o vuoto **e** riserva buona), `ripristina(slot)`
  (passa dalla stessa coda e supera le scritture in attesa), `msgFallito(slot, vecchio)`.
- `storage.del` (eliminazione voluta, già confermata dal giocatore) cancella anche la riserva: altrimenti la Home
  riproporrebbe la carriera appena eliminata.
- Formato del salvataggio immutato: nessun campo nuovo, quindi nessun bump di `SAVE_VERSION`.

### 2. Finestra di ripristino (`src/19-app-root.jsx`)
- `refreshSlots` legge anche `listRiserve()`. In Home, se uno slot è corrotto o vuoto e ha una riserva buona, si apre
  il `Modal` standard (→ `ModalPannello`, `data-cpm="riserva-167"`) con nome, club, stagione e settimana della
  carriera in riserva. Pulsanti «Non ora» (rimanda per questa sessione) e «Ripristina».

### 3. Avviso quando il salvataggio fallisce (`src/18-career-app.jsx`)
- Autosave, salvataggio del galà e salvataggio manuale mostrano `storage.msgFallito(...)`:
  - con una riserva buona: **«Salvataggio non riuscito: la tua carriera è al sicuro nella copia di riserva»** (testo del PO);
  - senza riserva (per esempio il primissimo salvataggio di una carriera che fallisce): «Salvataggio non riuscito:
    libera un po' di spazio sul dispositivo e riprova.» — la frase del PO sarebbe falsa in quel caso, quindi non la dico.
- Il flush di `pagehide` resta silenzioso (la pagina sta uscendo), come prima.

### 4. Interruttore rosso `__CPM_NO_BACKUP167`
Nessuna copia, nessuna proposta di ripristino, `del` non tocca la riserva, tornano i vecchi avvisi.

### 5. Guardiano `tests/visual/backup-167.mjs` (`npm run backup-167`)
Registrato nella catena **completa** di `ci-runner.mjs` e nella **MAPPA** (voci `src/0[0-8]-` e `src/18-…`).
`src/19-` non ha una voce in MAPPA: continua a ricadere sull'intera catena completa, che ora contiene backup-167
(non ho aggiunto una voce per non restringere la copertura di chi tocca src/19).

### 6. Ritocco a `save-monotonic-test.mjs` (protezione esistente, dichiarato)
Il suo bridge finto applica il ritardo pilotato alla **prima** `set` chiamata dopo l'armo. Con la riserva ogni
salvataggio fa due `set` (prima `cpm-v3-riserva`, poi `cpm-v3`), e il ritardo sarebbe finito sulla riserva invece
che sulla chiave della gara. Ora il ritardo colpisce solo `cpm-v3`; la riserva viene scritta subito. La semantica
del guardiano (gara sulla chiave principale) è la stessa; verde e rosso misurati sotto.

## Misure (sessione cloud, 15/10)

| Prova | Esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` | 21 frammenti ricomposti |
| `node tools/check-src.mjs` | IDENTICO BYTE PER BYTE (7.211.694 byte) |
| `backup-167` verde | 13/13 controlli, exit 0 |
| `backup-167` rosso (`CPM_ROSSO=1`) | 5 controlli rossi (riserva assente, nessuna finestra, vecchio avviso, nessun dato in riserva), exit 1 |
| `save-compat` | 12 pass · 0 fail |
| `career-critical` | exit 0; `save-monotonic` verde e il suo rosso `__CPM_NO_P0_2` riprodotto (disco 1111) |
| `test:logic` | exit 0 |
| `popup-224` | verde, e il rosso si vede |

Dettaglio verde di backup-167: salvataggio normale → slot 2222, riserva 1000 · slot corrotto (JSON troncato) →
finestra proposta, dice «Riserva Test · Stagione 4» → «Ripristina» → slot leggibile e uguale alla riserva, la
carriera si apre · quota simulata (`QuotaExceededError` su ogni chiave `cpm-v3*`) → avviso del PO, nessun testo
tecnico · durante il guasto slot 2222 / riserva 1000 intatti · tolto il guasto → slot 4444 / riserva 2222.

Catena non eseguita in questo giro: gate `validate-situations`, `replay`, `partita-vera` e il resto della «completa».
Non ho toccato motore né partita; la catena eseguita è quella chiesta dal briefing.

## Limiti dichiarati
- **La riserva è la versione PRECEDENTE (N-1), non l'ultima.** È la lettura letterale della decisione («prima di
  sovrascrivere tiene l'ultima versione buona»). Poiché l'autosave scatta a ogni cambio di `player` (debounce 600 ms),
  un ripristino perde al più l'ultimo salvataggio; spesso nulla, perché il flush d'uscita risalva lo stesso stato
  (misurato nel guardiano: riserva = 2222 = ultimo stato). Se il PO preferisce una riserva identica all'ultimo stato,
  è una modifica di una riga, con un compromesso: uno stato sbagliato ma leggibile finirebbe anche in riserva.
- **Spazio occupato:** ogni slot ora occupa circa il doppio nel `localStorage`. La dimensione di un salvataggio reale a
  fine carriera e la quota esatta di ogni browser: **Non posso confermarle** (non misurate in questo giro). Il rischio
  che la riserva stessa avvicini la quota va misurato con un salvataggio vero lungo (proposta per il giro successivo).
- **Se il browser svuota tutto il `localStorage`, si perde anche la riserva**: vive nello stesso posto. R-01 resta
  aperto per la parte `navigator.storage.persist()` / backup esterno (resto di PO-167, dopo L1).
- Ramo nativo (`window.storage` = @capacitor/preferences): stesso codice (`get`/`set`/`delete`), provato solo dal bridge
  finto di `save-monotonic`; su dispositivo **Non posso confermarlo**.
- Non ho aggiornato `docs/governo/ROADMAP.md`, `RISCHI.md` né `BACKLOG.md`: niente bump di versione in questo giro e il
  briefing non lo chiedeva. Da fare alla promozione: R-02 diventa «mitigato» (avviso presente), R-01 «parziale».
