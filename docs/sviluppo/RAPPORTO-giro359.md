# Giro 359 — il treno grande di notte non dipende più solo dal cron (PO-630 riaperta il 25/11)

Ramo: `sviluppo/giro359-notte` (da `lavoro/201` = db4da95). Non tocca `src/` né `GAME_VERSION`. Nessun push su `lavoro/**`, `main`,
`prova/**`. Nessuna corsa avviata su Actions. Nessuna credenziale né segreto aggiunti.

## 1. Misura (API pubblica di GitHub, letta il 25/11 alle 06:07 UTC, e storia git)

| # | Fatto misurato | Fonte |
|---|---|---|
| M1 | In tutto il repository esiste **una sola** corsa con evento `schedule`: `treno-notte-330.yml`, corsa 45378348483, creata il **24/11 alle 10:49:03 UTC** sul commit `f1dcc9c`. Non corrisponde a nessuno dei due orari (01:07, 02:43). | `GET /actions/runs?event=schedule`, `GET /actions/workflows/treno-notte-330.yml/runs` |
| M2 | Notte del 24/11, ore 01:07: il custode (un solo cron, `7 1 * * *`) era su `main` dal 23/11 05:48 (push dell'account del PO). **Nessuna corsa.** | M1 + `git show 486e821:.github/workflows/treno-notte-330.yml` (testa di `main` alle 01:07) |
| M3 | Il secondo orario `43 2 * * *` è arrivato su `main` solo il **24/11 alle 03:54** col push del rilascio automatico (`209b74e`, autore `github-actions[bot]`): la notte del 24 alle 02:43 non c'era ancora. | Eventi `PushEvent` di `main` + `git show 209b74e:…` (2 righe `cron:`) |
| M4 | Notte del 25/11, ore 01:07 e 02:43: entrambi gli orari su `main` (testa `d3f0f27` poi `1a38492`). **Nessuna corsa** di nessun workflow fra le 01:30 e le 05:00 UTC. | `GET /actions/runs?created=2026-11-24..2026-11-25` |
| M5 | Tutti i workflow sono `active`. Il repository riceve push ogni giorno. | `GET /actions/workflows`, eventi del repo |
| M6 | In ogni notte dal 20 al 25/11 è finita **almeno una** corsa di «Treno — …» o «Deploy to GitHub Pages» avviata da un push del PO fra le 20:30 e le 05:47 UTC (es. 23/11 22:47, 24/11 23:03, 25/11 01:30). | `GET /actions/workflows/<file>/runs`, campo `updated_at` |
| M7 | Le teste di `main` agli orari del cron della notte del 25 avevano `[skip ci]` nel messaggio; ma anche la corsa delle 10:49 del 24 era su un commit con `[skip ci]` (`f1dcc9c`), quindi `[skip ci]` non basta a spiegare il buco. | `git log` |

Bilancio: **finestre utili 4** (24/11 01:07 · 25/11 01:07 · 25/11 02:43 · 23/11 01:07 del vecchio cron del giro 317), **corse alle ore attese 0**,
una corsa a un orario che non è nel file.

## 2. Cosa dice GitHub (fonti)

Lette il 25/11 da docs.github.com. ⚠️ La pagina «Events that trigger workflows» è lunga: il testo della sezione `schedule` e `workflow_run`
qui sotto è stato estratto dalla pagina ma non ho potuto rileggerlo parola per parola; da verificare sulla pagina prima di citarlo altrove.
- *Events that trigger workflows* → `schedule` (https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows):
  «The `schedule` event can be delayed during periods of high loads of GitHub Actions workflow runs.» · «If the load is sufficiently
  high enough, some queued jobs may be dropped.» · «Scheduled workflows run on the latest commit on the default branch.» · «This event
  will only trigger a workflow run if the workflow file exists on the default branch.»
- *Disabling and enabling a workflow* (https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/disabling-and-enabling-a-workflow):
  «In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days.» —
  **non si applica** (M5).
- *GITHUB_TOKEN* → «When GITHUB_TOKEN triggers workflow runs» (https://docs.github.com/en/actions/concepts/security/github_token):
  «events triggered by the `GITHUB_TOKEN` will not create a new workflow run» con l'eccezione «`workflow_dispatch` and
  `repository_dispatch` events always create workflow runs.»
- `workflow_run` (stessa pagina degli eventi): «This event will only trigger a workflow run if the workflow file exists on the default
  branch.» · «You can't use `workflow_run` to chain together more than three levels of workflows.»

### Causa: non posso confermarla
- **Ritardo/perdita sotto carico** (documentato): compatibile con M2/M4, e la corsa delle 10:49 potrebbe essere un orario della notte
  arrivato con 8-9 ore di ritardo. Non posso confermarlo: GitHub non dice quale orario ha generato quella corsa.
- **Cron spinto dal bot (H1 del giro 333)**: indebolita. Il custode del 24/11 01:07 era stato spinto dall'account del PO (M2) e non è
  partito lo stesso; il secondo orario, spinto dal bot (M3), è stato registrato (una corsa schedule dopo quel push esiste).
- **Regola dei 60 giorni**: esclusa (M5). **File non sul ramo predefinito**: escluso per le finestre contate (M2, M3, M4).
- **`[skip ci]`**: non documentato per `schedule`; M7 lo indebolisce.

Conclusione operativa: su questo repository lo schedule va trattato come **inaffidabile in sé**, qualunque sia la causa.

## 3. La soluzione applicata: la sveglia (seconda rete che non dipende dal cron)

1. **`.github/workflows/treno-notte-330.yml`** si avvia anche con `workflow_run` (`types: [completed]`) di «Treno — trenino a ogni
   unione, treno grande di notte» e «Deploy to GitHub Pages» — gli eventi che ci sono ogni sera (M6). Un job nuovo, **`sveglia`**,
   gira solo su quell'evento; il **`custode`** non gira su quell'evento. La concorrenza è passata dal workflow ai **job**
   (`sveglia-notte` per la sveglia, `custode-notte` per il custode, come prima): una sveglia che dorme non tiene in coda il custode.
2. **`tools/sveglia-359.mjs`** decide (funzione pura `sveglia()`):
   - di giorno (prima delle 20:30 UTC) → niente (corsa di pochi secondi);
   - la sera (20:30 → 01:07) → **dorme fino alle 01:09** (dopo il cron, così se il cron scatta non fa doppioni) e ricontrolla;
   - nella notte (01:07 → 05:47) senza custode vivo di stanotte → **avvia il custode** con `workflow_dispatch` e `notte=true`
     (col `GITHUB_TOKEN` crea sempre una corsa, §2);
   - notte coperta (record «partito», custode del cron o di una sveglia vivo, un'altra sveglia che già dorme) → niente.
     Un custode annullato non copre la notte; la corsa fuori orario delle 10:49 non copre la notte dopo.
3. Il custode avviato con `notte=true` si comporta come quello del cron: fine alle 05:47 UTC (`CPM_ENTRO_SVEGLIA359`) ed esito scritto
   su `main` in `docs/governo/TRENO-NOTTE.json`. **Non cambia come si accoda**: resta l'unico a entrare nel gruppo `treno-guardiani`
   e solo quando il posto in attesa è libero (giro 330) → non annulla mai un trenino; il deploy non sta in quel gruppo (giro 326).
4. **Macchine** (giro 326): la sveglia occupa una macchina mentre dorme, mai insieme al custode che avvia (esce subito dopo l'avvio);
   caso peggiore alle 01:07-01:09 se il cron scatta: treno 15 + deploy 1 + Validate Situations a mano 2 + custode 1 + sveglia 1 = 20.
   Un job oltre il tetto aspetta in coda, non fallisce.
5. Il cron (01:07 e 02:43) **resta**: le due reti si sommano e non si raddoppiano.

## 4. La pagina di governo dice la verità

`tools/notte-333.mjs` → `statoNotte()` (letto da `tools/governo-html.mjs`, pillola in testata + riga «Treno grande di stanotte»):
- **partito** — corsa N (avviato entro le 02:43 UTC);
- **partito in ritardo** — alle hh:mm UTC, dopo le 02:43 (record scritto dopo l'orario di riserva);
- **in ritardo** — nessun treno grande alle 02:43, custode e sveglia al lavoro fino alle 05:47;
- **in attesa** prima delle 02:43; **non partito** dopo le 06:02 senza record o con record «non partito» (come il giro 333).

## 5. Guardiano

`npm run notte-359` (≈ 10 s, nessun browser, GitHub finto su 127.0.0.1), cinque sezioni: A workflow (nomi VERI dei due workflow
osservati, concorrenza del job sveglia solo `sveglia-notte`, timeout 300 min fra 279 e 360, custode con fine 05:47 ed esito, niente
segreti) · B decisione (11 casi) · C pagina (partito / partito in ritardo / in ritardo / in attesa / non partito) · D **sveglia vera**
con orologio finto (22:00 → dorme ~5,8 s veri → alle 01:09 un solo avvio con `notte=true`; se il cron scatta nel sonno 0 avvii; di
giorno 0 avvii) · E riga della MAPPA. Verde: uscita 0. Rosso `CPM_NO_G359=1` (sveglia spenta, workflow e mappa letti da db4da95):
**19 controlli rossi**, uscita 1. Riga della MAPPA: quella della macchina del treno, che ora copre `tools/sveglia-359.mjs` e
`tests/visual/notte-359.mjs` e gioca `notte-359`.

### Guardiani rigirati su questo ramo (25/11)
notte-333 ✅ · treno-330 ✅ · trenino-317 ✅ · rilascio-312 ✅ · deploy-326 ✅ · treno-tempo-358 ✅ (163 s) · mappa-unica ✅ ·
via-poc-338 ✅ · notte-359 ✅ / rosso ✅.
Nota: `rilascio-312` era rosso (4 controlli, «Could not read 234aa9f…») **anche col ramo base senza le mie modifiche**: è il clone
superficiale della sessione. Dopo `git fetch --unshallow` + tag: verde.
**Non eseguito:** `node ci-runner.mjs giro notte-359` (guardiano + 17 sentinelle, ~50 min). Il giro non tocca `src/` né il gioco; le
sentinelle le gioca il trenino del vagone (la riga della macchina del treno + le 17 sentinelle).

## 6. Come verificarlo dopo il rilascio
Il trigger `workflow_run` vale solo quando il file è su `main` (§2). Dalla prima sera dopo il rilascio:
1. dopo la fine di un treno o di un deploy dopo le 20:30 UTC, in `treno-notte-330.yml` compare una corsa `workflow_run` col job
   «Sveglia della notte» in corso (dorme);
2. alle 01:09 UTC il riepilogo dice «custode avviato» oppure «già coperta: custode N (schedule…)»;
3. poco dopo una corsa `workflow_dispatch` del custode (attore `github-actions[bot]`), poi il treno grande `tipo=notte`;
4. `docs/governo/TRENO-NOTTE.json` su `main` ha la notte; la pagina dice partito / partito in ritardo.
Effetto collaterale dichiarato: ogni fine di treno o deploy crea una corsa breve di `treno-notte-330.yml` (di giorno esce in pochi
secondi con «niente da fare»): ~10-20 righe al giorno nell'elenco di Actions, nessun rosso.
⚠️ Non confermato dalla documentazione: se `workflow_run` scatta anche quando la corsa a monte è stata avviata col `GITHUB_TOKEN`
(es. il deploy avviato dal rilascio automatico). Non serve: bastano le corse avviate dai push del PO (M6).

## 7. Dubbi per il PO

**Dubbio 1 — le notti senza nessun push la sera (es. un giorno senza lavoro).** Applicata la 1.
1. **(consigliata, applicata)** Sveglia sulle fini dei treni/deploy + i due cron: nelle 5 notti misurate la sveglia avrebbe avuto il suo
   evento ogni volta. Se in una notte non c'è nessun evento e il cron manca, la pagina dice «non partito» e il PO avvia a mano
   (Actions → «Treno grande di notte — custode della coda» → Run workflow, con `notte` spuntato).
2. Aggiungere anche `push` su `main` come sveglia: ma i commit di governo portano `[skip ci]` (niente corse), quindi aggiunge poco.
3. Un cron esterno che chiama l'API `dispatches`: affidabile, ma serve un token personale salvato come segreto — escluso dalle regole
   di questo giro, solo su decisione del PO.

**Dubbio 2 — la soglia di «in ritardo».** Applicata la 1.
1. **(consigliata, applicata)** 02:43 UTC, l'orario di riserva: oltre quell'ora il primo tentativo è certamente mancato.
2. 01:37 (mezz'ora dopo il primo orario): più severa, ma segnerebbe «in ritardo» anche un treno grande che aspetta legittimamente un
   trenino in corsa (regola del giro 330).
3. Nessuna soglia: solo partito / non partito, come il giro 333.

**Dubbio 3 — la sveglia della sera occupa una macchina per ore.** Applicata la 1.
1. **(consigliata, applicata)** Dorme su una macchina (repository pubblico: minuti gratuiti sulle macchine standard) — una sola alla
   volta (gruppo `sveglia-notte`), mai nel gruppo del treno.
2. Armare la sveglia solo dopo le 23:00 UTC: meno ore di sonno, ma la sera del 23/11 l'ultimo evento prima della notte era alle 22:47 (poi nulla fino alle 03:56).
3. Nessun sonno: la sveglia agisce solo su eventi fra 01:07 e 05:47 (misurato: nella notte del 22/11 non ce n'era nessuno, ultimo evento alle 00:18).

## 8. Per la roadmap (da scrivere al rilascio, su `main`)
PO-630: «in corsa» → al rilascio del vagone «fatto (seconda rete), da confermare alla prima notte su main» — riga del registro con:
sveglia `workflow_run` + pagina «in ritardo», guardiano notte-359 (verde, rosso 19).
