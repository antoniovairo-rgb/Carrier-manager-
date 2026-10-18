# Rapporto giro 62 — salvataggi ed errori (7.999.173, PO-167 parte B · PO-168 parte C)

Ramo `sviluppo/salvataggi-errori-giro62`, partito da `lavoro/172` (7.999.172, commit 46cdcdc).
`GAME_VERSION` **non** cambiato (resta 7.999.172, come da consegna). Nessun campo nuovo nel salvataggio, `SAVE_VERSION` invariato.

## 1. Misure PRIMA (sonda `tests/visual/misura-168-prima.mjs`, build 7.999.172)

| Domanda | Misura | Fonte |
|---|---|---|
| Quanto spazio ha localStorage? | **5.242.732 caratteri** (poi `QuotaExceededError`), Chromium headless | sonda, riempimento a blocchi + bisezione |
| Quanto pesa un salvataggio lungo? | fixture `save-190-s12-ovr93` (stagione 12, OVR 93) riscritta dal gioco: `cpm-v3` **211.698** car. + `cpm-v3-riserva` **211.701** car. | sonda |
| Memoria persistente? | `navigator.storage.persist` esiste, `persisted()` = **false**; nel codice 0 chiamate (BACKLOG PO-167) | sonda + grep |
| Errore fuori da React (setTimeout, promessa rifiutata) | arriva solo in console (`pageerror`); **0 chiavi di registro** sul disco | sonda |
| Errore di render in una schermata | da lettura del codice: `RootErrorBoundary` (src/19) mostra «Qualcosa è andato storto» con Ricarica/Menu/Backup e scrive **solo in console**; `MatchErrorBoundary` (src/13) mostra l'errore ma non lo registra. Misurato con l'hook `__CPM_CRASH168` sul braccio rosso: schermata di recupero presente, registro vuoto | codice src/19:1017-1040, src/13:1623; guardiano braccio rosso |
| Salvataggio corrotto | con riserva buona: la Home propone il ripristino (giro 29, `backup-167`). **Senza** riserva: «⚠️ Salvataggio 1 — dati corrotti · Il salvataggio non è leggibile. Elimina e ricomincia.» | sonda (testo della Home) |
| localStorage pieno | già coperto dal giro 29: avviso «Salvataggio non riuscito: la tua carriera è al sicuro nella copia di riserva», nessun dato perso (`backup-167`) | guardiano esistente |

### Conto dello spazio → IndexedDB NON serve oggi
Tre slot di 12 stagioni con le loro riserve: 6 × ~212 k = **~1,27 M caratteri = ~24% della quota** misurata.
Il limite reale di localStorage non è stato raggiunto da nessuna misura, quindi, come da consegna, IndexedDB non è stato introdotto.
Non posso confermare quanto cresca un salvataggio oltre la stagione 12 (nessuna fixture più lunga): se una carriera di 20+ stagioni
arrivasse a ~800 k, sei copie toccherebbero la quota. È la soglia da tenere d'occhio (vedi Decisione 2).

## 2. Cosa è cambiato

### PO-168 parte C — registro degli errori (src/08, src/13, src/18, src/19)
- **Gestore globale** (`window` `error` + `unhandledrejection`) installato all'avvio dello script (src/08, accanto a `safeLS`).
  Esclusi: errori di caricamento risorse (img/script senza `error`) e i rifiuti `NotAllowedError`/`AbortError` di `audio.play()`
  (politica del browser, non guasti).
- **Registro** `cpm-errlog` in localStorage, fuori dal salvataggio: ultime **40** voci `{t, v (GAME_VERSION), kind, msg, stack, extra}`;
  un doppione consecutivo incrementa un contatore `n` invece di ripetersi. Scrive via `safeLS`: a quota piena non scrive e non lancia.
- **Error boundary**: `RootErrorBoundary` e `MatchErrorBoundary` registrano l'errore con lo stack dei componenti (`kind` «schermata» / «partita»).
  La schermata di recupero ha un quarto pulsante **«🧾 Esporta registro errori»**.
- **Taccuino** (Impostazioni → card «Appunti di collaudo», visibile con gli strumenti di collaudo accesi): mostra gli ultimi 8 errori,
  **«🧾 Esporta registro»** scarica `korward-log-AAAA-MM-GG.json` con errori + appunti + versione + user agent; 🗑 svuota il registro.
  La card ora compare anche se ci sono solo errori e nessun appunto.
- Hook di prova `window.__CPM_CRASH168 = "<scheda>"` (src/18): lancia un errore di render nella scheda indicata. Spento di default.
- **Rosso** `__CPM_NO_ERR168`: niente gestore, niente registro, niente pulsanti.

### PO-167 parte B — memoria persistente (src/08)
- All'avvio: `navigator.storage.persisted()` → se false, `navigator.storage.persist()`. Esito in `window.__CPM_PERSIST167`.
  Il browser decide da solo (Chrome concede in base all'uso del sito, Safari/Firefox possono rifiutare): **in headless risponde `persistente:false`**,
  la richiesta parte ma non posso confermare l'esito su telefono.
- **Rosso** `__CPM_NO_PERSIST167`.
- Copia di riserva degli slot (giro 29, 7.999.170): **invariata**.

## 3. Guardiano nuovo — `npm run errori-168` (tests/visual/errori-168.mjs)
11 controlli: richiesta di persistenza · errore setTimeout registrato · promessa registrata · rifiuto audio NON registrato · versione+ora ·
registro visibile nel taccuino · esportazione JSON scaricata · schermata di recupero su errore di render · pulsante «Esporta registro errori» ·
errore di render registrato con stack · tetto 40.

| Braccio | Esito |
|---|---|
| verde | **11/11**, uscita 0 |
| rosso (`CPM_ROSSO=1` → `__CPM_NO_ERR168` + `__CPM_NO_PERSIST167`) | **6 rossi**, uscita 1 |

## 4. Misure DOPO

| Domanda | Prima | Dopo |
|---|---|---|
| Errore in setTimeout / promessa rifiutata | 0 voci sul disco | registrati in `cpm-errlog` (`errori-168` verde) |
| Errore di render in una scheda | schermata di recupero, solo console | schermata di recupero + voce «schermata» con stack + «Esporta registro errori» |
| Registro nel taccuino ed esportazione | non esisteva | visibile in Impostazioni → Appunti di collaudo, JSON scaricato |
| Memoria persistente | mai chiesta | chiesta all'avvio (headless: `persistente:false`) |
| Rumore del registro in partita normale | — | **0 voci** in 90 s di provino reale, GLB spento e acceso, 0 `pageerror` (sonda nella sessione, non salvata nel repo) |
| Spazio | 3 slot pieni s12 ≈ 24% della quota | invariato (il registro pesa al massimo 40 voci da ~1,5 k) |

### Catene eseguite sul build di questo ramo
| Passo | Esito |
|---|---|
| test:logic · save-compat · backup-167 · errori-168 · design-system | ✅ tutti verdi |
| career-critical | ✅ (1358 s) |
| validate-situations | ❌❌ alle prime due prove **in parallelo con altri 2-3 browser** (check diversi a ogni prova: final-state + post-highlight, poi post-highlight `gi79 salto palla 47,6 > 42` + ball-motion `gi8 salto all'indietro -17`, cioè i campionatori di velocità × intervallo che CLAUDE.md segnala come sensibili al carico) → **rilanciato da solo: ✅ 14/14, fingerprint 00001505** (739 s). Le modifiche di questo giro non toccano la partita salvo quando scatta un errore. |
| MAPPA src/08 (classifica-102, partita-rigiocata-194, via-ch38-171; backup-167 sopra) | ✅ |
| MAPPA src/19 (badge-255, chip-269, toast-256) | ✅ |
| MAPPA src/18 (37 guardiani: rinnovo-270 … scene-fuori-137) | ✅ 37/37; **investimento-223 instabile** (1 controllo rosso alla prima prova, verde alla seconda; la riga del controllo fallito non è nel log troncato, non posso dire quale fosse) |
| MAPPA src/13 (43 guardiani di partita) e la `completa` associata a src/19 | **non eseguite** (vedi §6) |

## 5. Decisioni per la sessione principale

**Decisione 1 — «backup automatico» oltre la copia di riserva.** La riserva di oggi è la versione *immediatamente precedente*: il gioco salva
a ogni cambio di stato, quindi se un difetto scrive uno stato sbagliato ma leggibile, due salvataggi dopo anche la riserva è sbagliata.
- **A (consigliata)** punto di ripristino **di inizio stagione** per slot (`<chiave>-stagione`), scritto al rollover; +1 copia (~212 k a stagione 12),
  totale ~36% della quota con tre slot pieni. Protegge dagli errori logici, non solo dalla corruzione.
- B: lasciare com'è (riserva a un passo). Zero spazio in più, nessuna protezione dagli stati sbagliati-ma-leggibili.
- C: tre generazioni a rotazione (riserva-1/2/3). Copre pochi salvataggi indietro (= pochi minuti di gioco), costa il doppio di A.

**Decisione 2 — quando passare a IndexedDB.** Oggi no (24% della quota). Proposta: soglia d'allarme quando la somma delle chiavi `cpm-v3*`
supera il 60% della quota misurata (~3,1 M caratteri), con una misura su una carriera lunga (20+ stagioni) prima di decidere.
- **A (consigliata)** misurare una carriera di 20 stagioni (sim) e decidere su quel numero.
- B: migrare subito a IndexedDB (lavoro grande, tocca il percorso di ogni scrittura e la coda del 7.448).

**Decisione 3 — error boundary per scheda.** Oggi un errore di render in una scheda della carriera porta alla schermata di recupero di tutta l'app
(ricarica necessaria). Il contenuto delle schede in `CareerApp` non è un sottoalbero unico (decine di blocchi `tab===…` fratelli), quindi
avvolgerlo richiede di spostare JSX: non fatto in questo giro.
- **A (consigliata)** lasciare il boundary globale (rassicura, offre backup e ora il registro) e intervenire solo se il registro mostra crash ricorrenti.
- B: boundary per scheda (refactoring del blocco delle schede, rischio di regressione sulle sonde di UI).

## 6. Non verificato
- Esito di `navigator.storage.persist()` su telefono / APK (in headless `persistente:false`).
- Download del JSON su Android WebView/Capacitor: il link `download` funziona in Chromium desktop; nella WebView potrebbe servire il plugin Filesystem. Non posso confermarlo.
- Rumore del registro in partite lunghe GLB-ON su telefono: misurato solo in headless (vedi §4).
- La catena `completa` che la MAPPA associa a `src/19-` e i 43 guardiani di partita della voce `src/13-` **non** sono stati eseguiti: le modifiche in src/19 e src/13 sono una chiamata `logErr168` dentro `componentDidCatch` (eseguita solo quando un errore è già avvenuto) e un pulsante nella schermata di crash. Il gate 14/14 è verde. Se la sessione principale vuole la catena `notte` prima di unire, va lanciata.
- La causa del primo rosso di `investimento-223`.
- Dimensione di un salvataggio oltre la stagione 12.
