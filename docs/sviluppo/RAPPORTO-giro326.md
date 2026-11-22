# Rapporto giro 326 — il deploy del gioco non sta più dietro al treno (PO-624)

Base: `lavoro/201` = 7.999.203 (c0dd9cf). Ramo: `sviluppo/giro326-deploy`. Nessun tocco a `src/` né a `GAME_VERSION`.
Niente push su `lavoro/**`, `prova/**`, `main`, `poc`. Il rilascio automatico resta acceso.

## 1. Cosa è successo (misurato dai log pubblici delle corse)

### (a) Deploy in coda dietro al treno
- Il treno grande (mappa intera) apre **29 parti**. Corsa 45010544455 del 22/11: **picco 20 macchine contemporanee** (il tetto
  dell'account), 1.784 minuti-macchina.
- Nel frattempo il deploy aspetta. Attesa fra la creazione della corsa di «Deploy to GitHub Pages» e la partenza del job:
  45011402025 **3.080 s**, 44947465519 **3.886 s**, 44926879122 **2.543 s**. Quando la macchina c'è, il deploy dura 70-97 s.
- La concorrenza `pages` (`cancel-in-progress: false`) fa il resto: un deploy in attesa blocca quelli dopo di lui
  (45011839594 creato alle 10:19, partito alle 11:06).
- 94 dei 100 deploy più recenti sono partiti da push «Governo: …», cioè documenti che il sito non pubblica.

### (b) Fallimenti del passo «Deploy to GitHub Pages»
Undici deploy falliti fra il 20 e il 22/11. Letti tutti i log (`actions/jobs/<id>/logs`):

| Causa | Corse | Di chi è |
|---|---|---|
| `No artifacts named "github-pages" were found for this workflow run` — **0,3-0,5 s dopo** un caricamento riuscito dell'artefatto | 45041697914, 45011839594, 44965736526, 44952019086, 44947465519, 44881369408, 44881288955, 44872934649, 44809496280 (9) | GitHub: l'artefatto appena caricato non è ancora visibile all'API. Il messaggio stesso dice «re-run the deployment at a later time» |
| `Failed to create deployment (status: 502)` | 45026223795 (1) | GitHub (errore del server) |
| `npm error 404` nell'installazione delle dipendenze | 44783629130 (1) | nostro, del 20/11 (pacchetto non trovato), non legato al passo di pubblicazione; non si ripete dopo |

Nessuno dei dieci fallimenti del passo di pubblicazione dipende dal nostro contenuto: build, verifica `web-237` e guardia dei
materiali interni sono tutti verdi in quelle corse.

## 2. Cosa è cambiato

1. **Tetto di macchine del treno** (`tests/visual/ci-treno-308.mjs` → `paralleli`, `verifica-guardiani.yml` → `max-parallel`).
   Treno grande / mappa / completo: **15** alla volta. Trenino: **4**. Caso peggiore treno grande + trenino + deploy = 20.
   Con 29 parti il tetto 15 fa **due ondate come il tetto 20** (15+14 contro 20+9): il treno grande non si allunga.
2. **Il deploy non parte per i soli documenti** (`deploy-pages.yml`, `paths-ignore`): `docs/governo/**`, `docs/collaudo-po/**`,
   `docs/collaudo-grafico/**`, `**/*.md`. Basta un file fuori da questi percorsi e il deploy parte. Dal 20/11 su main:
   **84 push su 91** non avrebbero lanciato il deploy. Il rilascio automatico lo avvia con `workflow_dispatch`, che il filtro
   non tocca.
3. **Nuovi tentativi del passo di pubblicazione**: attesa di 15 s dopo il caricamento, poi fino a tre tentativi (pause di 45 s e
   120 s); l'ultimo senza `continue-on-error`, quindi se fallisce tutto la corsa è rossa davvero. Riepilogo dei tentativi nel
   sommario della corsa.
4. **Difetto collaterale corretto**: il piano apriva parti **vuote** quando l'obiettivo era corto (85 parti per 22 guardiani nella
   prova qui sotto). Ora mai più parti che guardiani. La mappa intera non cambia (29 parti).
5. Guardiano **`npm run deploy-326`** (statico, ~2 s): filtro (casi finti + tutte le sorgenti del sito lette dalle righe `cp` del
   workflow), tentativi, tetto e coda simulata sul piano vero. Riga nella MAPPA (deploy-pages.yml + deploy-326.mjs) e nella riga
   della macchina del treno.

## 3. Cosa è provato davvero

| Prova | Esito |
|---|---|
| `deploy-326` verde | ✅ 0 controlli falliti |
| `CPM_NO_G326=1 deploy-326` (workflow della base c0dd9cf) | ✅ rosso, 12 controlli falliti, uscita 1 |
| `mappa-unica`, `trenino-317`, `rilascio-312` | ✅ verdi (con i rami `origin/main` e `origin/poc/…` scaricati: senza, sono rossi identici anche sulla base) |
| `CPM_NO_G317=1 trenino-317` | ✅ rosso |
| **Tetto su Actions** — braccio «dopo» (corsa 45045906647, 40 parti, ramo `prova-cd/giro326-dopo`) | ✅ **15 job attivi, 25 in coda nella corsa**: `max-parallel` letto dal piano funziona |
| **Attesa di una macchina** — job minimo (`sonda-326.yml`, rami `prova-cd/giro326-sonda-*`) lanciato a macchine già occupate dal treno di prova | prima (corsa 45045615715, base, 20 macchine occupate): **46 s** · dopo: **1 s** e **2 s** (due campioni) |

⚠️ **Limite della misura «prima»**: le parti della prova duravano pochi minuti, quindi una macchina si liberava presto (46 s). Con le
parti vere del treno (70+ minuti) l'attesa senza tetto è quella misurata il 22/11: **2.543-3.886 s**. La simulazione del guardiano
sul piano vero dice 6.820 s nel caso peggiore (deploy arrivato a treno appena partito). Il «dopo» invece non dipende dalla durata
delle parti: con 5 posti liberi la macchina c'è subito.

⚠️ **Non provato su Actions: i nuovi tentativi del deploy.** Provarli vorrebbe dire pubblicare il sito da un ramo finto. È provata solo
la struttura (guardiano) e la semantica è quella documentata di GitHub (`continue-on-error` → `outcome` = `failure`). Il primo
deploy vero su main dopo l'unione è il collaudo: il sommario della corsa riporta l'esito di ogni tentativo.

Entrambe le corse di prova sono state annullate da me appena presa la misura. Rami di prova lasciati su GitHub per tracciabilità:
`prova-cd/giro326-prima`, `prova-cd/giro326-dopo`, `prova-cd/giro326-sonda-prima`, `-sonda-dopo`, `-sonda-dopo2` (si possono
cancellare).

## 4. «Validate Situations» a ogni push su main

- Parte solo se il push tocca `CARRIER-MANAGER-AV.html` o `tests/**` (quindi a ogni rilascio, non sui push di governo).
- Costo misurato: **2 macchine** per corsa (`validate` 19-25 min + `Critical Career Suite` 6-7,5 min) ≈ **30 minuti-macchina**.
  Il 22/11 (7.999.202) ha aspettato in coda **878 s** come il deploy e il job `validate` è stato annullato a **25,1 min**: il tetto
  `timeout-minutes: 25`. Sulle ultime 98 corse su main: 77 verdi, 18 annullate, 3 rosse.
- Serve ancora? Sul main arriva **solo** ciò che il treno ha già giudicato: il rilascio automatico pretende il trenino/treno verde,
  e `validate-situations`, `career-critical`, `test:logic`, `save-compat`, `replay`, `typing-shortcuts` stanno già nella MAPPA e
  nelle sentinelle. Su main quindi rigioca controlli che lo stesso commit ha già passato, e quando sfora i 25 minuti produce un
  «annullato» che non dice niente.
- **Non l'ho toccato**, come chiesto.

## Dubbi per il PO

1. **«Validate Situations» su main**: tre strade, in ordine di semplicità. (a) toglierlo dal push su `main` e lasciarlo su
   `workflow_dispatch` (zero costo, il giudice resta il treno); (b) tenerlo ma con `needs` sul deploy o dopo di lui, così non gli
   ruba la macchina; (c) tenerlo com'è ma alzare `timeout-minutes` a 35, perché 18 corse su 98 finiscono «annullate» (almeno due, 45026552815 e 44904490541, a 25,1 min = il tetto; le altre non le ho verificate una per una: possono essere annullate dalla concorrenza).
   Consiglio (a), oppure (c) se vuole una seconda rete sul commit pubblicato.
2. **Due trenini insieme** su due rami `lavoro/*` diversi più il treno grande: 15+4+4 = 23 > 20. Oggi non succede (si lavora su un
   `lavoro/<n>` alla volta). Se capiterà, il tetto del trenino va abbassato a 3 o va messa una concorrenza unica per tutti i trenini.
3. **Pubblicazione a mano durante un treno** (il caso del 22/11): col tetto resta sempre almeno un posto per il deploy; non ho fatto
   annullare il treno dal rilascio, perché il treno in corsa può giudicare un vagone diverso da quello pubblicato.
4. La riga della roadmap: questo giro non è un rilascio (nessuna `GAME_VERSION`); la scriverà il rilascio che lo unisce.
