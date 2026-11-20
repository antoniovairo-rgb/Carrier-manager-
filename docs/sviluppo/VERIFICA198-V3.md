# VERIFICA 198 — parte V3 (unione dei giri 295 e 301 in src/12)

Ramo `sviluppo/verifica198-v3`, partito da `prova/198-finale` (9ec24c4f = `prova/198-blocco2` + giro 301).
Base di confronto: `lavoro/198` (b3b75b9), in una copia separata. `GAME_VERSION` non toccata, nessuna modifica al gioco.
Macchina: 16 GB di memoria (15,4 liberi all'avvio), 59 GB di disco liberi. Controlli uno alla volta (`CPM_CI_PAR=0`),
`CPM_CHROME=/opt/pw-browsers/chromium`. Tutti gli esiti qui sotto vengono da corse fatte in questa sessione (20/11/2026);
dove un controllo non è stato eseguito è scritto.

**Documento in corso: le righe «in corsa» / «da eseguire» si chiudono a mano a mano.**

## Verdetto

V3 pronto: **non ancora deciso** (controlli in corsa).

## 1. Unione dei giri 295 e 301

| controllo | esito su finale (9ec24c4f) | esito sulla base (lavoro/198) | nato da quale giro | nota |
|---|---|---|---|---|
| `esito-rete-301` | **verde** (uscita 0, 22 min) | non esiste sulla base | 301 | A: 32 non-gol, 0 in rete, barriera 0 interventi, 0 non giudicati · B provocato verde 0 su 8 (barriera 8 su 8) · gol 6 su 6 · rosso `__CPM_NO_G301` 7 su 8 (sul ramo del giro 301 era 8 su 8; soglia del guardiano 6) |
| `portiere-295` | **verde** (uscita 0, 12 min) | non esiste sulla base | 295 | 4 bracci verdi 0 difetti (16 · 8 · 8 · 8 giudicate, 0 non giudicate) · rosso `__CPM_NO_G295` rivisto 16/16 · 8/8 · 8/8 · 7/8 |
| `gk-dive-sync` | **verde** (uscita 0, 3 min) | non eseguito | — | 8 tuffi, anticipo mediano −0,10 s, peggiore −0,15 s (tolleranza 0,25 s) |
| `salti-274` | **verde** (uscita 0, 12 min) | non eseguito | — | verde: 0 salti non spiegati, velocità massima 31,9 u/s · rosso `__CPM_NO_G274` rivisto (2 salti su 2 scene di testa, 415,8 u/s) |
| `contatto-103` | **verde** (uscita 0, 14 min) | non eseguito | — | verde: 4 parate giudicate, 0 difetti · rosso rivisto: 3 «pallone mai al portiere» su 4 |
| `portiere-265` | **verde** (uscita 0, 5 min) | non eseguito | — | verde 0 difetti su 7 casi · rosso `__CPM_NO_G265` 3 rientri provocati su 3. Il guardiano stampa per ogni caso «massimo dal bersaglio del suo ciclo … (non giudicato)»: è una misura che il guardiano dichiara di non giudicare per costruzione (giro 265), non un caso saltato |
| `validate-situations` | **verde** 14/14 (uscita 0, 15 min) | non eseguito | — | 191 scene, impronta 00001505, 0 fallimenti; avvisi non bloccanti: initial-state 3 · visual 1 · movements 23 · motion 1 · bg-coherence 1 · live-smoke 1 |
| `esito-280` (rosso dichiarato) | **rosso** (uscita 1, 9 min) | **rosso** (uscita 1, 9 min) | precedente alla 198 (rosso già sulla base) | Parte A identica sulle due versioni: verde 0 smentite su 78, rosso 53 su 78, doppi conteggi 0 contro 14. Parte B, motivi comuni: «partite non finite» (p1 non finita su tutte e due) e «tabellino 1 su 2». **Sull'unione un motivo in più**: «B rosso non riconosciuto», perché la partita p0 del braccio rosso non è finita (sulla base è finita, 1 su 1). Una corsa sola per parte: non so dire se è instabilità o effetto dell'unione (seconda corsa non fatta, vedi «Non eseguito») |
| `esiti-218` (rosso dichiarato) | **rosso** (uscita 1, 39 min) | in corsa | | Sull'unione: verde 17 scene, **0 contraddizioni**; rosso 20 scene, 7 contraddizioni (il rosso si vede). Unico motivo del rosso: «partite non arrivate al fischio: verde 1234 fermo in playing» |

## 2. Guardiani della MAPPA di src/12 che leggono esito, pallone in `hl_result`, portiere

Da compilare.

## 3. `highlight-95`

Da eseguire.

## Cose trovate fuori dai controlli

1. **La MAPPA di `ci-runner.mjs` ha tre righe per `src/12` (righe 26, 27, 28) e la mirata legge solo la prima**
   (`MAPPA.find`, riga 105). `portiere-295` sta solo nella riga 27 e `esito-rete-301` solo nella riga 28: sull'unione
   **la mirata non esegue nessuno dei due guardiani nuovi**. È lo stesso difetto già annotato dal giro 293 per `portatore-286`.
   Non l'ho corretto (la riga 26 è una riga sola lunghissima: una modifica lì va in conflitto con chiunque la tocchi in parallelo);
   la correzione è aggiungere i due nomi alla riga 26.
