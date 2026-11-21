# Giro 312 — rilascio automatico dei vagoni (PO-600, stile DevOps)

Ramo `sviluppo/giro312-rilascio-automatico`, base `lavoro/200` = `de4ab61` (7.999.200 pubblicata, poc = main = `ce63d1d`).
Decisioni di riferimento: `docs/governo/DECISIONI.md` sul poc, 21/11 15:00 e **17:25**. **Il gioco non è stato toccato** (nessun
file di `src/`, `CARRIER-MANAGER-AV.html` e `GAME_VERSION` invariati). **L'interruttore è SPENTO**: nessun rilascio automatico
può partire sui rami veri finché il PO non lo accende (vedi §3).

## 1. Cosa è cambiato

| file | cosa |
|---|---|
| `tools/rilascio-vagone-312.mjs` | la logica: `decidi` (legge esito del treno, interruttore, punta del ramo, unioni) · `prepara` (versione + nota, build-src, check-src IDENTICO, commit, unione nel poc, tag) · `pubblica` (un push atomico) |
| `.github/workflows/verifica-guardiani.yml` | job finale **«Rilascio del vagone»** dopo il Riepilogo + due input dell'avvio a mano (`rilascio` = auto/prova/no, `rosso_finto`) |
| `tests/visual/ci-treno-308.mjs` | `esito-treno.json` porta `mappa_intera` (un elenco dato a mano non rilascia mai) |
| `tests/visual/rilascio-312.mjs` + `npm run rilascio-312` | guardiano del meccanismo (senza browser, ~25 s) |
| `docs/governo/RILASCIO-AUTO.json` | l'interruttore, **`"attivo": false`** |
| `CLAUDE.md` | una voce nel protocollo: come funziona il rilascio e cosa cambia per i giri |

Nessun altro workflow toccato (deploy-pages, validate-situations, android, twa invariati).

## 2. Come funziona

Il treno gira come prima (push su `lavoro/**`/`prova/**`, o a mano). In coda al Riepilogo parte **Rilascio del vagone**:

1. **Decisione** (`decidi`, esce sempre 0). Si rilascia **solo se tutte** queste condizioni valgono; ognuna che manca diventa un
   «motivo» scritto nell'esito:
   - interruttore acceso: `docs/governo/RILASCIO-AUTO.json` **letto dal ramo poc** con `"attivo": true`, e variabile di repository
     `CPM_RILASCIO_AUTO` diversa da `spento`;
   - ramo `lavoro/**` (in modo auto);
   - esito del treno arrivato, dello **stesso commit**, con **tutte le parti** arrivate e la **mappa intera**;
   - **nessun rosso nuovo e nessun non giudicato** (tetto, non partito, parte mancante = rosso); ogni guardiano in classe
     verde / rosso noto / rosso noto del runner (`ROSSI-DICHIARATI.json`);
   - commit provato **ancora in punta** al ramo;
   - almeno un'unione «Unione sviluppo/… in lavoro/…» fra il poc e il commit provato (sennò non c'è un vagone).
2. **Versione**: +1 sull'ultima cifra della più alta fra GAME_VERSION del lavoro, del poc e dei tag `v*` (7.999.200 → 7.999.201).
   **Nota**: `[7.999.201] vagone rilasciato in automatico dal treno (giro 312, PO-600, corsa N): <titoli delle unioni, separati da ·>.
   Rossi dichiarati: quelli della 7.999.200.` — una riga, mai `*/`.
3. **Prepara** (in locale sul runner): sostituisce la riga `const GAME_VERSION=` in `src/07` → `node tools/build-src.mjs` →
   `node tools/check-src.mjs` deve dire IDENTICO (e il gioco ricomposto deve portare la versione nuova) → `ROSSI-DICHIARATI.versione`
   → commit sul lavoro → unione `--no-ff` nel poc: conflitti **solo** in `docs/governo/` → versione del poc; qualunque altro conflitto
   → FERMO → `ROSSI-DICHIARATI.versione` riscritto anche dopo l'unione → `docs/governo/ULTIMO-RILASCIO.json` → main deve essere
   antenato del nuovo poc (fast-forward), sennò FERMO → tag annotato `v7.999.201`.
4. **Pubblica**: **un solo `git push --atomic`** di lavoro, poc, main e tag, **senza force**: se un ramo non avanza in
   fast-forward (per esempio è arrivato un commit sul lavoro durante il rilascio) il server rifiuta tutto e nessun ramo cambia.
5. **Deploy**: `gh workflow run deploy-pages.yml --ref main` (il push col GITHUB_TOKEN non fa partire `on:push`; il
   `workflow_dispatch` sì), si cerca la corsa, la si segue con `gh run watch`, poi si scarica `index.html` dal sito finché contiene
   la versione nuova (12 tentativi, 4 minuti).
6. **Esito leggibile** (sempre): stato del commit `rilascio-vagone` (`success` = pubblicata e sito verificato; `failure` = fermo,
   con il primo motivo nella descrizione), sul commit provato se ci si ferma, sul commit del poc se si pubblica; riepilogo della
   corsa; artifact `esito-rilascio` (`decisione.json` + `esito-rilascio.json`).

Permessi del job: `contents: write`, `actions: write`, `statuses: write`, `pages: read` (il resto del treno resta `contents: read`).
Il job ha `continue-on-error`: **la corsa non diventa mai rossa** (niente mail «Run failed»). Concorrenza: un rilascio alla volta
(`rilascio-vagone`, senza annullare).

### Come la sessione madre legge un rilascio (API anonima, nessuna credenziale)

- ultimo tag: `GET https://api.github.com/repos/antoniovairo-rgb/Carrier-manager-/tags` (il primo `v7.999.*`); messaggio del tag annotato
  con `GET …/git/tags/<sha del tag>`;
- `GET https://raw.githubusercontent.com/antoniovairo-rgb/Carrier-manager-/main/docs/governo/ULTIMO-RILASCIO.json` (versione,
  precedente, unioni, nota, rossi del treno, corsa);
- esito anche quando si ferma: `GET …/commits/<ramo lavoro o sha>/status` → contesto `rilascio-vagone`, descrizione = motivo;
- corse: `GET …/actions/workflows/verifica-guardiani.yml/runs?branch=lavoro/201` e i job della corsa
  (`…/actions/runs/<id>/jobs`: il job «Rilascio del vagone» e i suoi passi con la conclusione).

## 3. Come si accende e come si spegne

- **Accendere** (lo fa il PO): sul ramo **poc** mettere `"attivo": true` in `docs/governo/RILASCIO-AUTO.json` (il file arriva sul
  poc con l'unione di questo giro; se si vuole accendere prima, basta crearlo lì). Dal treno successivo i vagoni puliti escono da soli.
- **Spegnere**: `"attivo": false` sul poc, **oppure senza commit** la variabile di repository `CPM_RILASCIO_AUTO=spento`
  (Settings → Secrets and variables → Actions → Variables): ferma sempre, anche col file acceso.
- **Avvio a mano**: «Run workflow» sul treno, ramo `lavoro/…`, `elenco` vuoto, `rilascio = auto` (segue l'interruttore);
  `rilascio = no` per correre il treno senza rilasciare; `rilascio = prova` per la prova sui rami finti.

## 4. Cosa è stato provato davvero

### 4.1 In locale — guardiano `npm run rilascio-312` (remoto finto: clone `--shared`, rami lavoro/poc/main veri come basi)

**Verde col verde: 41 controlli, 0 falliti.** Decisione su 15 esiti finti (rilascia con soli rossi dichiarati; si ferma con rosso
nuovo, non giudicato, parte mancante, esito mancante, mappa non intera, interruttore spento nel file / mancante / variabile `spento`,
ramo mosso, esito di altro commit, ramo non `lavoro/**`, nessuna unione, rosso finto in prova). Percorso vero sul remoto finto:
B1 rosso nuovo → fermo, remoto intatto · B2 soli rossi dichiarati → 7.999.201 pubblicata: main = poc = tag annotato, lavoro +1
commit, poc = unione `--no-ff`, main in fast-forward, gioco con `GAME_VERSION="7.999.201"`, **check-src IDENTICO sul main
pubblicato**, `ULTIMO-RILASCIO.json`, conflitto vero su `ROSSI-DICHIARATI.json` risolto col poc e versione riscritta ·
B3 secondo vagone = 7.999.202, ma un commit arrivato sul lavoro durante il rilascio → **push atomico rifiutato, nessun ramo né tag
cambiato**.

**Rosso col rosso**: `CPM_NO_G312=1` (la decisione ignora rossi nuovi e non giudicati) → 4 controlli rossi (rosso nuovo, non
giudicato, rosso finto, B1 che rilascerebbe), uscita 1.

### 4.2 Su GitHub Actions (modo prova)

_(vedi §4.3, scritto con le corse vere)_

## 5. Dubbi per il PO

1. **Push dei file di workflow col GITHUB_TOKEN.** GitHub rifiuta (ne sono quasi certo, non l'ho potuto provare su main) un push
   fatto col GITHUB_TOKEN che *modifica file in `.github/workflows/`* su un ramo: il token non può avere il permesso `workflows`.
   Il primo vagone che contiene questo giro cambia `verifica-guardiani.yml` rispetto a main, quindi **il suo rilascio automatico
   probabilmente verrebbe rifiutato** (push atomico: nessun ramo cambia, stato `failure`). Proposta: unire e pubblicare a mano
   questo giro come si è fatto finora; dai vagoni successivi (che di solito non toccano i workflow) il rilascio automatico funziona.
   Un vagone che tocca i workflow si fermerà sempre al push: per quei casi o si rilascia a mano, o si dà al workflow un token con
   permesso `workflows` (un PAT/App del PO, segreto di repository) — **non l'ho fatto**, è una scelta sua.
2. **Protezioni dei rami.** Non vedo dalla sessione se `main` o il poc hanno regole che vietano i push del bot: se ci sono, il push
   atomico si ferma e lo stato lo dice. Va controllato una volta in Settings → Rules.
3. **Il deploy si avvia con `workflow_dispatch`.** È l'eccezione documentata di GitHub (il GITHUB_TOKEN non fa partire `on:push` ma
   fa partire `workflow_dispatch`), ma sul repository vero non l'ho provata: la modalità prova salta il deploy, come chiesto. Il
   primo rilascio vero è la prima prova del deploy; se il deploy non parte, lo stato del commit dice `deploy=non_avviato` e il
   sito resta alla versione precedente (main però è già avanti: basta un «Run workflow» manuale su «Deploy to GitHub Pages»).
4. **Il treno salta i push di soli documenti** (`paths-ignore: docs/**, **/*.md`): un vagone fatto solo di documenti non fa
   partire il treno e quindi non esce. Mi sembra giusto (non cambia il gioco), ma la versione non sale.
5. **Una sola unione basta.** Se in `lavoro/**` arrivano commit diretti senza titolo «Unione sviluppo/…», il rilascio si ferma
   («non c'è un vagone»). Se ci sono sia unioni sia commit diretti, escono tutti ma la nota cita solo le unioni.
6. **ROADMAP.** Il workflow non scrive la riga di roadmap (direttiva del 16/09): lascia `ULTIMO-RILASCIO.json`, il tag e lo stato,
   e la sessione madre scrive la riga quando vede il rilascio. Se preferisce che la scriva il workflow, si aggiunge.
7. **Durata del treno pieno e coda.** Il treno di `lavoro/200` partito alle 16:44 conta 28 parti (19 insieme + 9 in coda): con i
   runner gratuiti ogni corsa del treno occupa tutti i posti, e due treni insieme si mettono in fila. Un rilascio automatico arriva
   quindi qualche ora dopo l'unione, non subito.
8. **Rami di prova lasciati sul remoto**: `prova-cd/lavoro-312`, `prova-cd/lavoro-312b` (le mie unioni finte, fatte con autore
   «prova» e senza riga di sessione: dati di prova) e quelli creati dalla prova `prova/cd-<corsa>-{lavoro,poc,main}` + tag
   `prova-v7.999.201-<corsa>`. Si possono cancellare quando vuole; non li ho cancellati per lasciarle la prova da guardare.
