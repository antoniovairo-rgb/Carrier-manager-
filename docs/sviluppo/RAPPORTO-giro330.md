# Giro 330 — treno robusto: parti dal log, notte che non salta, margine 10%, carriera di giorno (PO-624 resto, PO-626)

Ramo: `sviluppo/giro330-treno-robusto` (da `lavoro/201` = 55a500d5, 7.999.205). Non tocca `src/` né `GAME_VERSION` (il rilascio
automatico è acceso). Nessun push su `lavoro/**`, `prova/**`, `main`, `poc`. Nessuna corsa avviata su Actions.

## 1. PO-624 — i risultati delle parti non si perdono più

### Il caso vero (verificato dalle API di GitHub in questa sessione)
Treno 45050383306 (22/11, `lavoro/201`, 8 parti). Job «parte 03 di 8 (21 guardiani, ~57 min)», id 137294199295: passo dei
guardiani **success** (17:38:34 → 18:27:44), passo «Uscita come artifact» **failure**. Dal log del job:

```
18:27:50 Attempt 1 of 5 failed with error: Request timeout: /twirp/.../ArtifactService/CreateArtifact. Retrying request in 3000 ms...
...
18:28:40 ##[error]Failed to CreateArtifact: Failed to make request after 5 attempts: Request timeout
```

I cinque tentativi interni di `upload-artifact` stanno tutti in **50 secondi**. Le altre 7 parti hanno caricato in 1-2 s.
Il Riepilogo ha visto 7 parti su 8, i 21 guardiani come «parte mancante» = non giudicati, e il rilascio si è fermato.
Ho verificato anche che il job di una parte si chiama esattamente come `matrix.nome` e che il suo log è leggibile via API.

### Cosa ho fatto: due difese indipendenti
1. **Secondo caricamento dopo 90 s** (`verifica-guardiani.yml`): il primo caricamento ha `continue-on-error`, il secondo parte
   solo se il primo è fallito, con `overwrite: true` (se il primo ha lasciato un artifact a metà). Uguale per `riepilogo-totale`
   (attesa 60 s), da cui dipendono blocco e rilascio. Motivo: i tentativi interni durano meno di un minuto; un guasto passeggero
   più lungo li esaurisce tutti.
2. **Ricostruzione dal log** (`tests/visual/ci-treno-308.mjs`). A fine parte `esegui` stampa nel log il suo `riepilogo.json`, in
   righe `CPM_PARTE330 i/n <base64>` più una riga `CPM_PARTE330_FINE <sha256> n`. Il Riepilogo, per ogni parte della matrice
   senza artifact, legge il log del job (`actions/runs/<corsa>/jobs` → `actions/jobs/<id>/logs`, col `GITHUB_TOKEN` del job:
   ho aggiunto `actions: read` al solo job Riepilogo). La parte vale solo se l'impronta torna, il nome della parte coincide e i
   guardiani sono gli stessi della matrice, nello stesso ordine. Il riepilogo lo dichiara: riga «parti ricostruite dal LOG» e
   «(dal log)» accanto a ogni guardiano; `esito-treno.json` porta `parti_dal_log` e `log_non_letti`.
   Una parte che non ha finito (job ucciso, tetto del job) non ha la riga FINE: resta **non giudicata**, cioè rossa.

**Perché entrambe.** Il secondo tentativo è la strada più semplice e copre il guasto breve, ma va sullo stesso servizio che si è
guastato. Il log invece passa da un servizio diverso e copre anche il caso in cui sia il *download* del Riepilogo a fallire
(tutte le parti mancanti → tutte ricostruite). Il rilascio non è cambiato: conta `parti_arrivate`, e una parte ricostruita conta
come arrivata.

**Non provato su Actions.** Il guardiano prova il percorso con `esegui` vero e un log finto con lo stesso formato di quello
letto oggi (ora davanti a ogni riga). Che `overwrite: true` sia accettato dalla versione di `upload-artifact@v4` che GitHub
risolve oggi non l'ho verificato su una corsa: se non lo fosse, il passo darebbe un avviso e la seconda difesa resta.

## 2. PO-626 — decisioni del PO del 22/11

### (a) Il treno grande di notte si rimette in coda da solo
Il cron delle 01:07 UTC esce da `verifica-guardiani.yml` ed entra in un workflow nuovo, `treno-notte-330.yml`, che sta **fuori**
dalla concorrenza `treno-guardiani` (gruppo proprio `custode-notte`). Lancia `tools/custode-notte-330.mjs veglia`, che ogni minuto
legge le corse del treno e:
- se stanotte un treno grande è già partito (o finito, o annullato *dopo* la partenza) → ha finito;
- se il posto in attesa del gruppo è occupato → aspetta (accodarsi ora annullerebbe quella corsa, di solito un trenino);
- altrimenti avvia `verifica-guardiani.yml` con `tipo=notte` (lo stesso percorso del cron di prima: bersaglio, mappa intera,
  blocco, nessun rilascio);
- se il suo treno grande viene annullato prima di partire (scalzato da un push) → torna ad aspettare e si rimette in coda;
- dopo 280 minuti si arrende e lo scrive nel riepilogo, senza far fallire la corsa (politica «nessuna mail Run failed»).

Un treno grande «partito» si riconosce perché almeno un job ha eseguito un passo. Le corse notturne si riconoscono da
`event=schedule` oppure `workflow_dispatch` avviato da `github-actions[bot]` (il custode è l'unico che avvia così il treno).

Macchine: mentre aspetta il custode occupa una macchina. Caso peggiore 15 (treno) + 1 (custode) + 1 (deploy) + 2 (Validate
Situations a mano) = 19 su 20.

Limiti dichiarati:
- **Finestra di corsa.** Fra la lettura delle corse e l'avvio passa meno di un secondo; se in quel momento arriva un push, il suo
  trenino in attesa verrebbe annullato dal treno grande. Non ho trovato un modo per chiudere del tutto questa finestra dentro Actions.
- Il workflow nuovo vale quando arriva sul ramo predefinito (come prima il cron). Fino ad allora gira il cron vecchio di `main`.

### (b) Margine del 10%
`tools/trenino-317.mjs`: completo solo se la parete del trenino è **≥ 1,10 ×** quella della mappa intera (`MARGINE_330 = 0.10`).
Prima bastava che fosse più lenta, anche di un secondo.

### (c) I 4 della catena carriera tornano nei trenini di giorno
`rimbalzo-189`, `scene-190`, `rigori-190`, `debito-190` escono da `SOLO_NOTTE_329` (50 → 46) e tornano nelle righe dove li aveva il
giro 328 (copia `fixtures/ci-runner-giro328-orfani.mjs.txt`): `rimbalzo-189` su src/12-13, src/15, src/00-08; `scene-190` su src/14,
src/11-17, src/18-10; `rigori-190` su src/14; `debito-190` su src/14, src/11-17, src/00-08. `trenino-317` ora pretende 46 solo notturni.

## 3. Misure prima/dopo (stessi 8 vagoni del giro 329)

`node tools/mappa-stretta-328.mjs confronta origin/lavoro/201 <8 unioni>`, durate di `DURATE-GUARDIANI.json`, 15 macchine.
Formato: guardiani · parti · minuti-macchina · parete. «Prima» = giro 329 (dal suo rapporto).

| vagone | src | prima (329) | **dopo (330)** |
|---|---|---|---|
| 323 salto-gennaio | 08 18 | 133 · 7 · 485 · ~100 | 136 · 7 · 486 · ~100 |
| 326 deploy | — | 20 · 1 · 65 · ~65 | uguale |
| 321 salvataggio-giornata | 09 | 35 · 3 · 190 · ~64 | uguale |
| 320 nome-intro | 09 17 19 | 209 · 23 · 1560 · ~133 | 211 · 23 · 1560 · ~133 |
| 318 testi | 11 18 | 137 · 8 · 505 · ~100 | 139 · 8 · 505 · ~100 |
| 316 musica-serata | 09 17 | completo (assets/audio) ~135 | uguale |
| 314 serata-tifosi | 11 16 | 107 · 7 · 480 · ~100 | 109 · 7 · 480 · ~100 |
| 311 ritocchi | 09 10 14 15 18 | **completo** 349 · 29 · 1965 · ~133 | **trenino 218 · 19 · 1326 · ~136** |

- Il margine cambia una sola scelta su 8: il 311 resta trenino. Costa **3 minuti di parete in più** (~136 contro ~133) e fa
  risparmiare **639 minuti-macchina** (1326 contro 1965) e 10 parti.
- I 4 guardiani della carriera aggiungono 2-4 guardiani ai vagoni su src/12-18 senza cambiare la parete.
- Con la sola regola vecchia (`CPM_NO_G330=1`, stessa mappa) il 311 torna completo: la differenza viene dal margine.

## 4. Guardiani (in questa sessione)

| guardiano | verde | rosso |
|---|---|---|
| **`npm run treno-330`** (nuovo, ~1 s, nessuna rete) | ✅ 31 controlli | `CPM_NO_G330=1` → 14 falliti, uscita 1 |
| `npm run trenino-317` | ✅ | `CPM_NO_G317` / `CPM_NO_G328` / `CPM_NO_G329` → uscita 1 |
| `npm run rilascio-312` | ✅ | `CPM_NO_G312=1` → uscita 1 |
| `npm run deploy-326` | ✅ | `CPM_NO_G326=1` → uscita 1 |
| `npm run mappa-unica` | ✅ | braccio interno ✅ |

Cosa prova `treno-330`, sezione per sezione:
- A: gioca `esegui` vero e usa il suo output come log di una parte. Una parte con artifact; una solo dal log (ricostruita e
  dichiarata); una troncata e una con l'impronta alterata (non giudicate); il log di un'altra parte (rifiutato). Controlla poi il
  workflow: due caricamenti, l'attesa, `actions: read` + `GH_TOKEN` nel Riepilogo, job chiamato `matrix.nome`.
- B: simula la concorrenza di GitHub (una in corso, una in attesa, la terza scalza quella in attesa) e usa la `decidi` vera del
  custode. Casi: scalzato da un push → si rimette in coda e il push resta salvo; posto occupato all'avvio → aspetta; nessuna corsa;
  treno già in corsa → nessun doppione; annullato a mano dopo la partenza → non si rilancia. Più cron fuori dal treno e conto delle macchine.
- C: margine con durate sintetiche (5% → trenino, 15% → completo, pari → trenino).
- D/E: i 46 solo notturni, i 4 della carriera nelle righe giuste; un vagone sulla macchina del treno del giro 330 resta trenino.

`treno-330` entra nella riga della MAPPA della macchina del treno, che ora copre anche `treno-notte-330.yml`,
`tools/custode-notte-330.mjs`, `tests/visual/treno-330.mjs` e la copia della mappa 329 (`fixtures/ci-runner-giro329.mjs.txt`,
usata dal braccio rosso).

Catena del giro: `node ci-runner.mjs giro treno-330 rilascio-312 trenino-317 deploy-326` → vedi §6.

## 5. Dubbi per il PO

1. **Il custode, se non riesce ad accodarsi entro 280 minuti, non fa fallire la corsa** (lo scrive solo nel riepilogo). Quella
   notte il blocco dei rilasci non si aggiorna.
   - (consigliata) **A.** Lasciarlo così e aggiungere una riga «treno grande di stanotte: non partito» nella pagina di governo, letta
     dal riepilogo del custode.
   - B. Far fallire la corsa del custode: arriva una mail «Run failed», ma solo in quel caso raro.
   - C. Dopo la scadenza, accendere lo stesso il blocco come «non giudicato» (rilasci fermi fino al treno grande dopo).
2. **La finestra di corsa di meno di un secondo** (§2a): un push che arriva esattamente fra la lettura e l'avvio perde il suo trenino.
   - (consigliata) **A.** Accettarla: in quel caso il vagone riparte al push successivo, e il treno grande giudica comunque la notte.
   - B. Il custode avvia solo fra le 01:00 e le 06:00 e in quell'orario i push su `lavoro/**` aspettano (regola di squadra).
   - C. Il custode, se trova un trenino annullato per colpa sua, lo rilancia con l'API `rerun` (codice in più, con il rischio
     che il rilancio scalzi di nuovo il treno grande).
3. **Una parte ricostruita dal log rilascia come una arrivata.** È lo scopo della correzione, ma è un cambio di fiducia: il riepilogo
   lo dichiara sempre.
   - (consigliata) **A.** Tenerlo così: l'impronta e il controllo dei nomi bastano.
   - B. Ricostruita sì, ma il rilascio automatico si ferma e aspetta un «Run workflow» a mano.
   - C. Ricostruirla solo per il riepilogo, mai per il rilascio (si torna al caso del 22/11, ma con l'esito leggibile).

## 6. Esito della catena

(scritto a catena finita, sotto)
