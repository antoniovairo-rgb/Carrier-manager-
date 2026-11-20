# Rapporto giro 303 — PROVA di metodo: i guardiani su GitHub Actions (PO-592)

Ramo `prova-ci/giro303-actions`, partito da `prova/198-finale`. Gioco non toccato (`src/`, `CARRIER-MANAGER-AV.html`,
`GAME_VERSION`), workflow esistenti non toccati, `main` e `poc` non toccati. Nessun segreto, nessun runner a pagamento.

File nuovi: `.github/workflows/verifica-guardiani.yml`, `tests/visual/ci-parti-303.mjs`, `tests/visual/ci-parti-303.json`, questo rapporto.

## In breve

- **Gira.** I guardiani di `tests/visual` (Node + Chromium di Playwright, GLB acceso, WebGL software) girano sui runner
  standard `ubuntu-latest`: **tre corse, 19 esecuzioni di guardiano, 19 verdi**, nessuna modifica ai guardiani.
- **I tempi sul runner ballano.** Lo stesso guardiano è passato da 955 a 1616 s fra due corse (§2, corsa n. 3):
  le parti vanno tagliate con margine.
- **Stessi verdetti del banco**, e per `portiere-295` anche gli stessi numeri braccio per braccio (tabella al §3).
- **Si divide in parti parallele.** La matrice la genera uno script dal file di configurazione; sei job sono partiti
  nello stesso secondo su sei macchine diverse.
- **Costo misurato: zero.** L'API di GitHub dichiara `billable … total_ms: 0` per tutte e tre le corse (§5).
- **Non provato:** la mappa intera (non richiesta), un guardiano davvero rosso sul runner, l'avvio a mano
  (`workflow_dispatch`), la stabilità su molte corse. Vedi §6 e i dubbi al §8.

## 1. Cosa ho fatto

**Workflow `verifica-guardiani.yml`** — parte solo su push ai rami `prova-ci/**` (non per i soli `docs/**`) e con
`workflow_dispatch`; `permissions: contents: read`; nessun segreto; `concurrency` per ramo; `runs-on: ubuntu-latest`
dappertutto; tetto 60 minuti per job dei guardiani (5 per piano e riepilogo). Tre job:

1. **Piano** — `node ci-parti-303.mjs piano` legge `ci-parti-303.json` e scrive la matrice.
2. **Guardiani** (matrice, `fail-fast: false`) — `npm install` in `tests/visual` (come il workflow esistente
   `validate-situations.yml`: il progetto non ha `package-lock.json`), `npx playwright install --with-deps chromium`
   nel runner, `CPM_CHROME` = il Chromium appena installato, `CPM_CI_PAR=0`, `VISION_PROVIDER=none`; poi
   `node ci-parti-303.mjs esegui "<guardiani della parte>"`. Carica come artifact `tests/visual/out/`
   (log completo di ogni guardiano + `riepilogo.json`), conservato 7 giorni.
3. **Riepilogo** — riunisce i riepiloghi delle parti in una tabella sola: nel log, nel riepilogo della corsa e come artifact.

**Script `ci-parti-303.mjs`** — tre comandi: `piano` (taglio in N parti bilanciate per durata), `esegui` (gioca una
parte, misura, esce ≠ 0 se un guardiano è rosso), `riunisci`. Legge le catene e la MAPPA da `ci-runner.mjs` senza
eseguirlo; le durate da `docs/governo/STABILITA.json`, corrette da `durate_note` della configurazione.
A differenza di `ci-runner.mjs` **non riprova i rossi** e **non scrive `STABILITA.json`**.

**Come ho letto gli esiti** — con gli strumenti GitHub della sessione (elenco corse e job, consumo, artifact):
funzionano. `gh run list/view` non l'ho usato (in questa sessione `gh` è ammesso solo per la ricerca).
La coda del log di un job non basta a trovare la tabella: il modo affidabile è l'artifact `riepilogo-totale`.

## 2. Le tre corse

| Corsa | Commit | Cosa | Esito | Durata della corsa (GitHub) |
|---|---|---|---|---|
| [n. 1](https://github.com/antoniovairo-rgb/Carrier-manager-/actions/runs/44810176790) | `3d9fbea` | i sei guardiani, 6 parti | 6/6 verdi | 18 min 14 s |
| [n. 2](https://github.com/antoniovairo-rgb/Carrier-manager-/actions/runs/44813461313) | `4228244` | catena `nucleo` (7 guardiani) in 3 parti | 7/7 verdi | 11 min 49 s |
| [n. 3](https://github.com/antoniovairo-rgb/Carrier-manager-/actions/runs/44815678175) | `c5216ec` | i sei guardiani, ripetizione della n. 1 | 6/6 verdi | 29 min 18 s |

### Corsa n. 1 — i sei guardiani contro il banco

| Guardiano | Runner GitHub | Banco | Fonte della durata di banco | Runner / banco | Esito runner | Esito banco |
|---|---|---|---|---|---|---|
| `test:logic` | 3 s | 2–3 s | RAPPORTO-giro300/302 | ≈ 1 | verde | verde |
| `save-compat` | 8 s | 1–2 s | RAPPORTO-giro300/302 | più lento (secondi) | verde | verde |
| `home-298` (verde + rosso) | 130 s | 119 s | RAPPORTO-giro302 | 1,09 | verde | verde |
| `battito-264` | 321 s | 406 s (403–420 negli altri giri) | RAPPORTO-giro300, 295, 296 | 0,79 | verde | verde |
| `portiere-295` (verde + rosso) | 948 s | 680 s | RAPPORTO-giro295 | **1,39** | verde | verde |
| `esito-rete-301` (verde + rosso) | 955 s | 1248 s | banco di questo giro, stesso commit | 0,77 | verde | verde |

I rapporti dei giri 29x–302 non riportavano la durata di `esito-rete-301`: l'ho giocato sul banco in questo giro.
I file `VERIFICA198-*.md` citati nel compito **non esistono su questo ramo** (cercati in `docs/`): le durate di banco
vengono solo dai rapporti indicati.

Somma dei quattro guardiani lunghi: 2354 s sul runner contro 2453 s sul banco. In media il runner va come il banco,
ma il singolo guardiano oscilla fra 0,77 e 1,39 volte (e cambia ancora nella corsa n. 3, più sotto).

### Corsa n. 2 — più guardiani nella stessa parte

| Parte | Guardiani | Runner | Banco (ultimo giro in `STABILITA.json`) |
|---|---|---|---|
| 1 | `career-critical` | 565 s | 996 s (21/10, versione precedente del gioco) |
| 2 | `tema-unico`, `typing-shortcuts` | 27 s, 12 s | nessuna durata, 26 s |
| 3 | `web-237`, `test:logic`, `save-compat`, `design-system` | 78 s, 4 s, 10 s, 1 s | nessuna durata, 5 s, 15 s, 1 s |

Sette verdi su sette. Prova che una parte con più guardiani in fila funziona e che `web-237` (che costruisce il sito
e lo serve) gira anche lì.

### Corsa n. 3 — ripetizione dei sei

| Guardiano | Corsa n. 1 | Corsa n. 3 | Banco | n. 3 / n. 1 |
|---|---|---|---|---|
| `test:logic` | 3 s | 2 s | 2–3 s | — |
| `save-compat` | 8 s | 9 s | 1–2 s | — |
| `home-298` | 130 s | 129 s | 119 s | 0,99 |
| `battito-264` | 321 s | 330 s | 406 s | 1,03 |
| `portiere-295` | 948 s | **626 s** | 680 s | 0,66 |
| `esito-rete-301` | 955 s | **1616 s** | 1248 s | 1,69 |

Sei verdi su sei anche qui. Ma **lo stesso guardiano, sullo stesso codice, cambia durata da una corsa all'altra**:
`portiere-295` è sceso di un terzo, `esito-rete-301` è salito del 69% (27 minuti: quasi metà del tetto di 60).
I due guardiani corti e i due medi sono rimasti uguali. Non so dire la causa (ogni job prende una macchina diversa;
non ho misurato altro). In questa corsa un job ha impiegato 303 s per installare Chromium.

## 3. Verdi e rossi uguali al banco?

Sì per tutto ciò che ho confrontato. Il confronto più stretto è `portiere-295`, che ha un braccio verde e uno rosso
con numeri scritti nel RAPPORTO-giro295:

| Braccio | Banco (giro 295) | Runner (corsa n. 1) |
|---|---|---|
| verde, 4 bracci | 0 difetti su 16 / 8 / 8 / 8, 0 non giudicate | 0 difetti su 16 / 8 / 8 / 8, 0 non giudicate |
| rosso 1–3 | 16/16 · 8/8 · 8/8 | 16/16 · 8/8 · 8/8 |
| rosso 4 | 7/8 (gi4 non mostra il difetto: 0,54 u) | 7/8 (gi4 non mostra il difetto: 0,59 u) |

`esito-rete-301`, braccio provocato rosso: «giudicati 8 · IN RETE 6» sul runner e sul banco.

**Limite:** tutti i guardiani erano verdi, quindi **non ho visto un guardiano davvero rosso far fallire un job sul
runner**. Ho visto solo, in locale, che `esegui` esce 1 quando un guardiano fallisce.

## 4. Tempi di preparazione e parallelismo

Per ogni job della matrice, prima del primo guardiano:

| Passo | Misurato |
|---|---|
| Attesa di un runner | 2–3 s (creati 20:19:12, partiti 20:19:14–15) |
| `checkout` | 24–27 s (il repo porta 203 MB di `assets/`) |
| `npm install` | 3–6 s |
| Chromium con `--with-deps` | 15–36 s in tredici job su quindici; **214 s e 303 s** negli altri due |
| Totale prima dei guardiani | da 45 s a circa 5 minuti e mezzo |

**Quanti job insieme:** sei. Nella corsa n. 1 i sei job della matrice sono partiti tutti fra le 20:19:14 e le 20:19:15 UTC,
su sei runner diversi (id da …17321 a …17326). Il numero «3» che il riepilogo automatico stampa come «parti in corsa
insieme» conta solo gli intervalli dei guardiani: i due guardiani da pochi secondi erano già finiti quando il terzo
lungo ha finito l'installazione. Non ho provato più di sei job insieme.

Macchina del runner (letta dal job): 4 CPU (AMD EPYC 9V45), 15,6 GB, Node 22.23.5. Il banco di questa sessione: 4 CPU, 15,7 GB.

## 5. Costi

- **Misurato:** per le corse n. 1 e n. 2 l'API di GitHub (`actions/runs/<id>/timing`, letta con lo strumento della
  sessione) risponde `"billable": {"UBUNTU": {"total_ms": 0, "jobs": 8 …}}` e `{"total_ms": 0, "jobs": 5 …}`.
  Lo stesso per la corsa n. 3: `total_ms: 0` su 8 job.
- **Regola, dalla documentazione** (docs.github.com/en/billing/concepts/product-billing/github-actions, letta il 20/11):
  «The use of standard GitHub-hosted runners is free: In public repositories». I larger runner invece
  «are billed for public repositories»: il workflow non li usa.
- **Non posso confermare** che lo spazio degli artifact sia gratuito per i repo pubblici: quella pagina non lo dice
  in modo esplicito (parla di quote «for private repositories»). Gli artifact di questa prova pesano da 0,8 a 4,9 KB
  l'uno e scadono dopo 7 giorni.
- Non ho visto la pagina di fatturazione dell'account: non ho modo di aprirla. Il «zero» qui sopra è quello dichiarato
  dall'API per corsa.

Limiti del piano gratuito, dalla documentazione (docs.github.com/en/actions/reference/limits): 20 job insieme sui
runner standard, 6 ore per job, 256 job per matrice. Il limite di 20 vale per tutto l'account, quindi anche per
`deploy-pages` e gli altri workflow che girano nello stesso momento.

## 6. Limiti incontrati

1. **Durate ignote per metà della mappa.** Catena `notte`: 233 guardiani, di cui 112 con una durata in
   `STABILITA.json` (somma 41 262 s, circa 11 ore e mezza) e **121 senza**. Lo script dà loro 300 s l'uno: il taglio
   è bilanciato solo sulla parte nota. Mappa intera (tutte le catene + MAPPA): 346 guardiani, 184 senza durata.
2. **Il tetto di 60 minuti è stretto per i guardiani più lunghi.** `nomi-219` da solo vale 2910 s sul banco
   (48 minuti e mezzo), `difesa-220` 2318 s. Con il rapporto peggiore misurato (1,39) `nomi-219` arriverebbe a
   circa 67 minuti: oltre il tetto anche in una parte tutta sua.
3. **Il runner non va sempre come il banco, né come sé stesso:** da 0,57 a 1,39 volte il banco, e fra due corse
   uguali lo stesso guardiano è cambiato fino a 1,69 volte. Campione piccolo: uno o due giri per guardiano.
4. **L'installazione di Chromium è variabile** (15–214 s). Non ho messo una cache: `--with-deps` installa pacchetti
   di sistema che la cache non copre.
5. **Versione di Chromium diversa dal banco.** Il runner installa quella dell'ultimo Playwright compatibile con
   `^1.48.0`; il banco usa la build 1194. La versione è stampata nel log del passo «Chromium» ma non l'ho trascritta.
   Gli esiti confrontati sono uguali lo stesso.
6. **`workflow_dispatch` non provato.** Per quanto ne so GitHub offre l'avvio a mano solo per i workflow presenti
   sul ramo principale: non l'ho verificato, e `main` non andava toccato.
7. **Nessuna riprova dei rossi e nessuna scrittura in `STABILITA.json`** (il workflow ha sola lettura). La regola
   del progetto «un rosso si riprova, verde = instabile» qui non è applicata.
8. **Avviso nei log:** le azioni `@v4` (checkout, setup-node, upload/download-artifact) sono dichiarate per Node 20
   e GitHub le fa girare su Node 24 con un avviso di deprecazione. Oggi funzionano.

## 7. Proposta per il treno serale

Lo script è pronto e **non è stato fatto partire sulla mappa intera**. Per usarlo basta cambiare
`ci-parti-303.json`: `"elenco": []`, `"catena": "notte"`, `"parti": N` (prova a secco:
`CPM_PARTI_CATENA=notte CPM_PARTI_N=20 node ci-parti-303.mjs piano`).

Stime per la catena `notte` (233 guardiani), con i 121 ignoti contati 300 s:

| Parti | Parte più lunga stimata (banco) | Con il rapporto peggiore 1,39 | Sta nel tetto di 60 min? |
|---|---|---|---|
| 12 | 108 min | 150 min | no |
| 20 | 65 min | 90 min | no |
| 40 | 48,5 min (è `nomi-219` da solo) | 67 min | a rischio |

**Proposta concreta, in due passi:**

1. **Una corsa di taratura** della catena `notte` in **20 parti** (il massimo di job insieme del piano gratuito)
   con il tetto alzato a **120 minuti** per job. Durata attesa dall'avvio al riepilogo: **fra 70 e 115 minuti**
   (65 minuti stimati per parte, per 1,0–1,7 volte), più 1–5 minuti di preparazione; contro circa 21 ore e mezza stimate in fila sul banco. Questa corsa dà la durata vera
   sul runner di tutti i 233 guardiani e dice quali sono rossi o instabili lì.
2. Con quelle durate rifare il taglio (lo script le può leggere se si riportano in `durate_note` o in
   `STABILITA.json`) e fissare il numero di parti e il tetto.

La stima 70–115 minuti è debole: poggia su 121 durate ignote e su un rapporto runner/banco misurato su pochi guardiani.
Se il tetto di 60 minuti deve restare, l'alternativa è 40 parti (20 alla volta): la durata totale attesa è simile,
ma `nomi-219` e `difesa-220` rischiano il tetto.

Per farlo partire sul ramo di rilascio va aggiunto quel ramo a `on.push.branches` del workflow (oggi solo `prova-ci/**`).

## 8. Dubbi per il PO

1. **Tetto per job.** Il compito fissava ≤ 60 minuti. Per il treno serale propongo 120: va bene?
2. **Quale catena.** `notte` (233 guardiani) o la mappa intera (346)? La seconda costa uguale (zero) ma ha 184 durate ignote.
3. **Su quali rami deve partire** il treno, e con quale innesco: push sul ramo di rilascio, a mano, o a orario?
   L'avvio a mano e a orario richiedono che il workflow stia su `main`.
4. **Riprova dei rossi.** Sul banco un rosso si riprova fino a due volte. Sul runner la tengo spenta (un rosso è un
   rosso) o la riattivo?
5. **`STABILITA.json`.** Il workflow non lo aggiorna (sola lettura). Va bene che gli indicatori di stabilità restino
   quelli del banco, o le corse di GitHub devono entrarci (servirebbe un permesso di scrittura, che non ho messo)?
6. **Il verdetto di rilascio.** Tre corse verdi non bastano a dire che il runner sostituisce il banco: propongo di
   tenere il banco come giudice finché la corsa di taratura non ha mostrato quali guardiani sono instabili sul runner.
7. **Spazio degli artifact.** Non ho trovato scritto che sia gratuito per i repo pubblici. Oggi sono pochi KB; se un
   giorno si caricano le fotografie dei guardiani conviene controllare la pagina di fatturazione dell'account.
8. **Posta.** Una corsa rossa manda la mail «Run failed» (CLAUDE.md la ricorda per `validate-situations`). Non ho
   visto come si comporta con 20 parti, perché nessuna corsa è stata rossa.
