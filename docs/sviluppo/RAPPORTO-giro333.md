# Giro 333 — il treno grande di notte: perché non è mai partito, rete di riserva, esito nella pagina di governo (PO-630, PO-631)

Ramo: `sviluppo/giro333-treno-notte` (da `lavoro/201` = d681977, vagone della 7.999.207 in viaggio). Non tocca `src/` né
`GAME_VERSION`. Nessun push su `lavoro/**`, `prova/**`, `main`, `poc`. Nessuna corsa avviata su Actions (nessuna credenziale).

## 1. PO-630 — la causa: cosa è verificato e cosa no

Tutte le prove vengono dall'API **pubblica** di GitHub (senza credenziali), lette il 23/11 in questa sessione, e dalla storia git.

### Verificato
| # | Fatto | Fonte |
|---|---|---|
| V1 | In tutto il repository non esiste **nessuna** corsa con evento `schedule` (`total_count: 0`). `verifica-guardiani.yml` ha 26 corse: 17 `push`, 9 `workflow_dispatch`. `treno-notte-330.yml`: 0 corse. | `GET /actions/runs?event=schedule`, `GET /actions/workflows/<file>/runs` |
| V2 | **Il cron NON era su `main` «dal 21/11».** Il commit del giro 317 col cron (`e9e74d3`) è stato scritto il 21/11 alle 21:42 UTC, ma è entrato su `main` solo con il push del **22/11 alle 15:36 UTC** (testa `22bfd34`). Tutti i push su `main` prima di quell'ora (ultimi: 22/11 00:08, 00:15, 06:08 … 10:13) avevano `verifica-guardiani.yml` **senza** `cron`. | Eventi `PushEvent` di `main` (`GET /repos/.../events`) + `git show <testa>:.github/workflows/verifica-guardiani.yml` su ogni testa |
| V3 | Quindi la **notte del 22/11 (01:07 UTC)** il cron non esisteva sul ramo di default: nessuna corsa era possibile. GitHub: «This event will only trigger a workflow run if the workflow file exists on the default branch» e «Scheduled workflows run on the latest commit on the default branch». | docs.github.com, *Events that trigger workflows* → `schedule` |
| V4 | Il push del 22/11 15:36 che ha portato il cron su `main` l'ha fatto **`github-actions[bot]`**, cioè il rilascio automatico del vagone col `GITHUB_TOKEN` (commit `22bfd34` «7.999.203: unione di lavoro/201 (rilascio automatico del vagone)»). | Evento `PushEvent` (actor) + autore del commit |
| V5 | La **notte del 23/11 (01:07 UTC)** il cron c'era: la testa di `main` era `3e0a052` (push delle 22/11 23:22, actor l'account del PO `antoniovairo-rgb`), con `cron: '7 1 * * *'` in `verifica-guardiani.yml`. **Non è partita nessuna corsa** — nemmeno una annullata. | V1 + V2 |
| V6 | Il custode del giro 330 (`treno-notte-330.yml`, cron 01:07) è stato registrato da GitHub il **23/11 alle 05:49 UTC** (push su `main` delle 05:48, `4805552`, actor l'account del PO): **dopo** la notte del 23. Stanotte (24/11) è la sua prima notte. | `GET /actions/workflows` (`created_at`) + eventi di `main` |
| V7 | Tutti i workflow sono `active` (nessuno disabilitato). Il repo è pubblico, con push ogni giorno: la regola «disabilitato dopo 60 giorni senza attività» non si applica. | `GET /actions/workflows`, `GET /repos/...` (`pushed_at`) |
| V8 | La **concorrenza** `treno-guardiani` **non** è la causa: una corsa scalzata dal posto in attesa resta nell'elenco come `cancelled`. Non c'è nessuna corsa `schedule`, quindi GitHub non l'ha mai creata. Per lo stesso motivo non sono la causa le condizioni `if:` dei job né i `paths-ignore` (agiscono su una corsa che esiste; i filtri di percorso non valgono per `schedule`). La sintassi `'7 1 * * *'` è valida. | V1 + lettura del workflow |

### Ipotesi (NON confermate — non posso confermarle da qui)
- **H1 — il cron arrivato col `GITHUB_TOKEN`.** GitHub scrive: «events triggered by the `GITHUB_TOKEN` will not create a new
  workflow run» (eccezioni: `workflow_dispatch`, `repository_dispatch`, alcune `pull_request`). Non c'è una frase ufficiale che
  dica che anche la *registrazione* di un cron spinto col `GITHUB_TOKEN` viene saltata. Contro H1: alle 23:12 del 22/11 l'account del
  PO ha spinto su `main` un commit (`bd0e471`) che modificava `verifica-guardiani.yml` (non la riga del cron). **Non posso
  confermarlo.**
- **H2 — corsa persa per carico.** GitHub scrive: «The `schedule` event can be delayed during periods of high loads … If the load
  is sufficiently high enough, some queued jobs may be dropped». Le 01:07 non sono l'inizio dell'ora, ma GitHub non garantisce
  nulla. Su una sola notte utile (23/11) H1 e H2 non si separano. **Non posso confermarlo.**

### L'esperimento di stanotte separa le ipotesi
Il custode su `main` (versione del giro 330) è arrivato con un push dell'account del **PO**, non del bot. Se stanotte alle 01:07 UTC parte una
corsa `schedule` di `treno-notte-330.yml`, H1 si rafforza (il cron spinto col bot non si registra; quello spinto da sessione sì).
Se non parte nemmeno questa, H1 si indebolisce e lo schedule va trattato come inaffidabile in sé (dubbio 1 sotto).

## 2. Cosa ho cambiato

La via suggerita nel compito — un workflow schedulato leggero che avvia il treno con `workflow_dispatch` usando il
`GITHUB_TOKEN` del job con `actions: write` — **esiste già**: è il custode del giro 330 (GitHub conferma: «`workflow_dispatch` and
`repository_dispatch` events always create workflow runs», anche se avviati col `GITHUB_TOKEN`). Il giro 333 lo rende robusto a
un orario perso e gli fa lasciare una traccia.

1. **Due orari** in `.github/workflows/treno-notte-330.yml`: `7 1 * * *` (01:07 UTC, come prima) e `43 2 * * *` (02:43 UTC, rete di
   riserva), entrambi lontani dal minuto 0 e dal 30. Il secondo custode non fa doppioni: se stanotte il treno grande c'è già,
   `decidi()` risponde «fatto»; se il primo è ancora sveglio, aspetta nel gruppo `custode-notte` (niente annulli).
2. **Notte che finisce alle 05:47 UTC per tutti** (`tools/notte-333.mjs` → `scadenza()`; 05:47 = 01:07 + 280 min). Il custode di
   riserva delle 02:43 non veglia fino alle 07:23, e la scadenza ora si guarda **prima** di accodare: un custode partito a notte
   finita non avvia nulla. Avviato a mano (`workflow_dispatch`) vale solo la scadenza relativa di 280 min, come prima.
3. **PO-631 — esito della notte.** La veglia scrive `partito` / `non_partito` (col perché e la corsa) in un file; il passo nuovo
   «Esito della notte sul poc» (solo per le corse del cron, anche se la veglia cade) lo registra in
   **`docs/governo/TRENO-NOTTE.json` sul poc**, push senza force con 4 tentativi (stesso schema del blocco dei rilasci). Un
   `partito` non si sovrascrive, lo stesso esito nella stessa notte non fa commit. Permesso aggiunto: `contents: write`.
4. **Pagina di governo** (`tools/governo-html.mjs`): una pillola in testata e una riga nello «Stato settimanale»:
   «treno grande di stanotte (AAAA-MM-GG): partito — corsa N» · «non partito — non accodato entro le 05:47 UTC — <perché>» ·
   **«non partito — nessun esito scritto dal custode (il cron non è scattato?)»** quando dopo le 06:02 UTC il record della notte
   manca (il caso di questi giorni: il custode non scrive se non parte) · «custode al lavoro» prima della scadenza.
5. **Guardiano `npm run notte-333`** (≈ 12 s, nessun browser; la rete è un GitHub finto su 127.0.0.1) con sette sezioni: workflow
   (due orari, nessuno a :00/:30, permessi, passo dell'esito senza force) · scadenza assoluta · registro · stato per la pagina ·
   pagina vera generata in un file temporaneo · **custode vero** contro il GitHub finto (notte normale = un avvio ed esito
   `partito`; a notte finita = zero avvii ed esito `non_partito`) · riga della MAPPA. Rosso `CPM_NO_G333=1` = giro 330 (workflow,
   custode e mappa letti dalla base `d681977`, funzioni nuove spente): **19 controlli rossi**, uscita 1. Verde: uscita 0.
6. **MAPPA** (`tests/visual/ci-runner.mjs`): la riga della macchina del treno copre ora anche `tools/notte-333.mjs`,
   `tools/governo-html.mjs` (prima nessuna riga: toccarlo faceva partire il treno completo) e `tests/visual/notte-333.mjs`, e
   gioca `notte-333`. Script npm `notte-333`.

### Verifiche fatte in questa sessione
- `notte-333` verde; con `CPM_NO_G333=1` rosso (19 su 26).
- `rilascio-312`, `trenino-317`, `deploy-326`, `treno-330`, `mappa-unica`: verdi. (Nota: `rilascio-312` e `trenino-317` erano rossi
  **anche senza le mie modifiche** finché in questa copia mancavano i rami remoti `origin/poc/...` e `origin/lavoro/200`: è il
  clone superficiale della sessione, non il codice. Recuperati i due rami con `git fetch`, verdi.)
- `node ci-runner.mjs giro notte-333`: esito in fondo a questo rapporto.
- Workflow letto con un parser YAML: due `cron`, permessi `contents: write` + `actions: write`.

## 3. Come verificare stanotte (24/11) e domani

Stanotte gira il custode **del giro 330** (quello su `main` adesso). Le modifiche di questo giro arrivano su `main` solo col
rilascio del vagone.
1. Dopo le 01:07 UTC (02:07 a Roma): `https://api.github.com/repos/antoniovairo-rgb/Carrier-manager-/actions/workflows/treno-notte-330.yml/runs`
   — atteso una corsa con `"event": "schedule"`. Il ritardo può essere di qualche decina di minuti.
2. Poco dopo, nelle corse di `verifica-guardiani.yml`: una corsa `workflow_dispatch` con `triggering_actor` `github-actions[bot]`
   (il treno grande `tipo=notte`), che a fine corsa aggiorna lo stato `treno-grande` sul commit giudicato e, se cambia l'insieme,
   `docs/governo/BLOCCO-RILASCI.json` sul poc.
3. Se al punto 1 non c'è nulla entro le 03:00 UTC: H1 indebolita, si sceglie fra i dubbi 1-3.
4. Dalla prima notte con questo giro su `main`: `docs/governo/TRENO-NOTTE.json` sul poc ha la notte e l'esito; la pagina di governo
   rigenerata (`node tools/governo-html.mjs` su una copia del poc) mostra la pillola. Se manca il record, la pagina dice
   «non partito — nessun esito scritto dal custode».

## 4. Dubbi per il PO

**Dubbio 1 — come portare questo giro su `main`** (conta per H1).
1. **(consigliata)** Lasciarlo viaggiare nel vagone come tutti, **ma** se stanotte il custode del giro 330 parte e quello della
   notte dopo il rilascio automatico no, è la prova di H1: da allora ogni modifica a un workflow con `schedule` va portata su `main`
   con un push di sessione, non dal bot. Costo zero, decide la misura.
2. Promuovere subito su `main` questo solo workflow con un push di sessione (fuori dal treno), per avere stanotte già le due fasce
   orarie. Più veloce, ma salta il rituale del vagone e mescola l'esperimento di stanotte.
3. Escludere dal rilascio automatico i vagoni che toccano `.github/workflows/*` con `schedule` (il bot si ferma e lo dichiara;
   la promozione la fa una sessione). Una regola in più nel rilascio, utile solo se H1 si conferma.

**Dubbio 2 — se nemmeno il custode parte di notte (schedule inaffidabile in sé).**
1. **(consigliata)** Tenere i due orari e la pillola «non partito» nella pagina di governo; quando la vede, il PO avvia il treno
   grande a mano (Actions → «Treno grande di notte — custode della coda» → Run workflow). Nessuna credenziale nuova.
2. Agganciare la notte a un evento che non sia `schedule`: per esempio il primo trenino dopo le 22:00 UTC avvia il custode con
   `workflow_dispatch` (che col `GITHUB_TOKEN` crea sempre una corsa). Funziona solo nelle notti in cui c'è stato un push la sera.
3. Un cron esterno (servizio che chiama l'API `dispatches`): affidabile, ma richiede un token personale del PO salvato come
   segreto del repository — escluso dalle regole di questo giro, solo se il PO lo decide.

**Dubbio 3 — un commit sul poc ogni notte.** Il registro della notte scrive un commit sul poc per ogni notte nuova (il blocco dei
rilasci invece scrive solo quando cambia). Serve perché la pagina sappia che *stanotte* c'è stato un esito.
1. **(consigliata)** Tenerlo: un commit piccolo per notte, solo `docs/governo/TRENO-NOTTE.json`, non fa partire nulla.
2. Scrivere solo i «non partito»: meno commit, ma un «partito» non si distinguerebbe da un custode mai partito.
3. Niente file: la pagina legge le corse dall'API pubblica quando viene aperta (dipende dalla rete di chi la apre).

## 5. Esito del giro
(compilato a fine giro)
