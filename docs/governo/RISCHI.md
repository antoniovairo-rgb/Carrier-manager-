# Registro dei rischi

Probabilità e impatto: A alta · M media · B bassa. Si aggiorna a ogni stato settimanale.

| ID | Rischio | Prob. | Impatto | Stato oggi (misurato nel codice) | Contromisura |
|---|---|---|---|---|---|
| R-01 | **Perdita di carriere sul web** (il browser svuota `localStorage`) | M | A | salvataggi in `localStorage` (`cpm-v3`, `cpm-v3-s2`, `cpm-v3-s3`); `navigator.storage.persist()` assente; nessuna copia precedente dello slot | Parte B: richiesta di persistenza, copia precedente, backup a fine stagione |
| R-02 | **Salvataggio che fallisce in silenzio** (memoria piena) | B | A | `storage.save` cattura l'errore e restituisce `false` senza avvisare (`src/08-panchina-derby-meteo-cori.jsx:597`) | Parte B: controllo di `estimate()` e avviso al giocatore |
| R-03 | Slot corrotto | B | A | il caricamento lo riconosce (`_corrupted`) ma non esiste una copia da cui ripristinare | Parte B: copia precedente, ripristino automatico |
| R-04 | Partita in corso persa (`cpm-match-resume`, `cpm-pending-mr`) | M | M | chiavi separate dallo slot; il pulsante di recupero dell'errore globale le azzera | Parte B: includerle nel backup e nei test |
| R-05 | **Regressioni su funzioni stabili** | A | M | ~80 release in una settimana; la CI non copre nuova carriera completa, import da file, navigazione dei tab, build store | release di lotto, suite unica, colmare le lacune (ARCHITETTURA) |
| R-06 | **Errori sul telefono invisibili al team** | A | M | esistono due confini d'errore React ma nessun `window.onerror` né `unhandledrejection`; il confine globale scrive solo in console | Parte C: raccolta errori nel taccuino |
| R-07 | Calo di prestazioni sul telefono | M | A | l'headless non misura gli FPS veri | soglie relative (PROCESSO) + collaudo PO a fine lotto |
| R-08 | Asset con licenza incerta (corpi CGTrader, clip Mixamo, suoni) | M | A | `audit-copyright` controlla nomi e marchi, non le licenze degli asset | inventario licenze degli asset prima dello store |
| R-09 | Scadenza dell'abbonamento Codex | M | M | Codex fa i collaudi massivi | le schede di collaudo sono script nel repo (`tests/codex/`) rieseguibili da noi |
| R-10 | Crescita del file unico | A | M | 6,5 MB, 3 frammenti oltre 1 MB | DT-01, DT-02, DT-06 |
| R-11 | Richieste del PO perse fra un prompt e l'altro | A | M | fino a oggi il registro era sparso fra task, roadmap e note | `BACKLOG.md` + riconciliazione a fine lotto |
| R-12 | Container della sessione ripreso a lavoro non spinto | M | M | successo con catene in sottofondo (16/09) | commit/push frequenti; lavoro sospeso su rami `wip/…` |
