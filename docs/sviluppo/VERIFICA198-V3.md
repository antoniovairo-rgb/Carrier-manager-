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
| `salti-274` | in corsa | | | |
| `contatto-103` | da eseguire | | | |
| `portiere-265` | da eseguire | | | |
| `validate-situations` | da eseguire | | | |
| `esito-280` (rosso dichiarato) | da eseguire | da eseguire | | |
| `esiti-218` (rosso dichiarato) | da eseguire | da eseguire | | |

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
