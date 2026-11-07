# Processo — come lavoriamo (PO + team Claude Code + Codex)

Nato dal prompt PO «Governo del progetto» del 30/09 (voci PO-GOV-*). I file di governo stanno tutti in
`docs/governo/`: `BACKLOG.md`, `ROADMAP.md` (unico file di roadmap: lotti + registro delle release),
`DECISIONI.md`, `RISCHI.md`, `ARCHITETTURA.md` e questo. I vecchi file roadmap sono in `docs/archivio/`.

## Ogni risposta al PO comincia con
`Lotto in corso: … · Voci toccate: PO-… · Richieste nuove registrate: PO-…`

## Smistamento (triage) — entro la risposta successiva

Tipi ammessi nella colonna «Tipo» del backlog: bloccante · difetto · miglioramento · nuova funzione · debito tecnico · processo · ricerca · conflitto. Un'incertezza («da verificare», «da decidere») va nello **Stato**, non nel tipo. `node tools/governo-html.mjs` avvisa delle voci fuori categoria e la scheda «Stato settimanale» le conta (PO-159, 01/10). Ogni risposta al PO apre con «Richieste nuove registrate: PO-…»: è la prova che lo smistamento è avvenuto nel turno.
| Classe | Cosa succede |
|---|---|
| **Bloccante** (dati persi, gioco bloccato, carriera che non prosegue, errore evidente in produzione) | release correttiva dedicata, subito |
| **Difetto non bloccante** | entra nel lotto della roadmap a cui appartiene |
| **Miglioramento / nuova funzione** | voce «in attesa PO» finché il PO non ne decide la priorità |
| **In conflitto** con decisioni prese o lavoro in corso | lo diciamo subito, con alternative, in un questionario |

Una segnalazione non apre mai da sola una release.

## Definizione di «pronto» (si può iniziare)
Obiettivo chiaro · criteri di accettazione scritti e misurabili · dipendenze risolte · domande al PO chiuse
(questionario registrato in `DECISIONI.md`) · stima con ipotesi.

## Definizione di «fatto» (si può chiudere)
1. Criteri di accettazione soddisfatti **e misurati** (numero prima/dopo nella nota).
2. Guardiano nuovo o aggiornato: **rosso** con l'interruttore `__CPM_NO_*`, **verde** con la modifica.
3. Suite completa verde (`npm run ci`, che dal 01/10 comprende `career-critical`), non solo i guardiani del lotto.

**Suite unica (PO-163, 01/10).** Da `tests/visual`: `npm run ci` (completa: test:vision, test:logic, typing-shortcuts, validate-situations, save-compat, replay, career-critical, partita-vera, design-system) · `npm run ci:carriera` · `npm run ci:grafica` · `npm run ci:guardiani` (i guardiani di release e i 19 ex orfani). L'esecutore è `tests/visual/ci-runner.mjs`: esegue tutti i passi anche dopo un rosso (`CPM_CI_STOP=1` per fermarsi), registra ogni giro in `docs/governo/STABILITA.json` (ultimi 60) e la pagina di governo ne mostra gli indicatori (scheda «Stabilità»: ultimo esito, verdi su giri, durata media, cosa copre). La scheda «Stato settimanale» (PO-165) si calcola da BACKLOG, ROADMAP, DECISIONI, RISCHI e STABILITA: nessun dato scritto a mano. La vecchia catena resta come `npm run ci:vecchia`.
4. `save-compat` verde; campi nuovi additivi.
5. Prestazioni non peggiorate oltre le soglie qui sotto.
6. Build web e build store generate e avviate (`build-dist` + `validate-dist`).
7. Nota di rilascio per il PO scritta.
8. Voce del backlog chiusa con release e guardiani.

### Soglie di prestazione proposte (da approvare)
L'headless non misura gli FPS del telefono (renderer software): si misurano grandezze relative, e il
giudice finale resta il telefono del PO.
- Peso di `CARRIER-MANAGER-AV.html`: **+2% massimo per lotto** (oggi 6,5 MB).
- Tempo di avvio headless (dal caricamento alla Home): **+10% massimo** rispetto alla release precedente.
- Heap JS in partita dopo 60 s: **+10% massimo**.
- FPS: nessuna soglia headless; controllo sul telefono del PO a fine lotto.

## Cadenza delle release
- **Release di lotto**: nessun tetto giornaliero (decisione PO 01/10, sostituisce il tetto di 6): conta **non perdere pezzi** — ogni release ha la sua riga nel registro e ogni voce toccata è aggiornata nel backlog.
- **Release correttive**: solo per i bloccanti.
- **Vista filtrabile** (richiesta PO 01/10): a ogni release, dopo ROADMAP e BACKLOG, `node tools/governo-html.mjs` rigenera `docs/governo/governo.html` (backlog, lotti, registro con un filtro per colonna) e la pagina si ripubblica allo stesso indirizzo privato claude.ai (https://claude.ai/artifact/P4nNHMqwrSjeN9EoyDnRNa). I file `.md` restano la fonte; la pagina non si modifica a mano.
- **Tag git** `v7.999.x` a ogni release. Ritorno alla precedente: `git checkout main && git reset --hard v7.999.x && git push --force-with-lease origin main`
  (solo su ordine del PO) oppure, più sicuro, `git revert` del merge.
- **Limite di lavoro in parallelo**: un lotto principale più le correzioni bloccanti.
- **Cambio di priorità a metà lotto**: solo su decisione esplicita del PO, con il costo dichiarato
  (cosa resta a metà, cosa va rifatto).

## Nota di rilascio per il PO (formato)
```
CPM 7.999.x — <titolo in italiano semplice>
Cosa vedrai di diverso: <3–5 righe, dove guardarlo nel gioco>
Voci chiuse: PO-… · Guardiani: <npm run …>
```

## Stato settimanale (una pagina, ogni lunedì)
Lotto in corso e avanzamento · voci chiuse · voci aperte per gravità · richieste in attesa di decisione PO
· indicatori di stabilità (errori raccolti dal taccuino, difetti riaperti, difetti trovati da Codex contro
quelli trovati dal PO, guardiani aggiunti) · rischi cambiati · cosa serve dal PO.

## Dubbi che solo il PO può sciogliere
Questionario a scelta guidata: al massimo 4 domande per giro, ognuna con 2–4 opzioni. Per ogni opzione:
effetto, costo, rischio. La consigliata va per prima, con il motivo. Si può sempre rispondere a parole.
Le domande si raggruppano. Mentre si aspetta, si lavora sulle voci indipendenti. Ogni risposta finisce in
`DECISIONI.md` con data, domanda, scelta e voce collegata.

## Riconciliazione
A ogni fine lotto: ogni richiesta PO arrivata nel frattempo deve avere il suo `PO-…` nel backlog.

## Controlli instabili (regole, PO-311, giro 111)
Un controllo che a parità di codice dà verde e rosso non è un controllo: costa catene rifatte e toglie fiducia a quelli stabili.
Regole per scriverli e per ripararli. Valgono per ogni sonda e guardiano in `tests/visual`.
1. **Braccio e motivo per ultimi.** L'ultima riga stampata dice quale braccio (verde / rosso) e **perché** (primi due difetti, o
   «cieco: …», o «non giudicato: …»). La coda del runner è la sola cosa che si legge: se il motivo è sopra, non c'è.
2. **Area di tocco effettiva.** Un tasto si misura col rettangolo unito all'area `::after` trasparente (`.cpm-t40`/`.cpm-t40m`),
   non col solo rettangolo: è ciò che riceve il dito (`EXTRA108` in `c180-lib.mjs`).
3. **Tempo di scena, non di parete.** Ogni durata, intervallo, velocità o precedenza si misura sul tempo di scena che il gioco
   dichiara (`ck`, `__CPM_CB95`, clock del render-loop), mai su `Date.now()`/`performance.now()` né su campioni a intervallo fisso:
   a fotogrammi lenti (`dt` tappato a 0,05, CPU rallentata, runner contesi) 1 s di parete vale meno scena. Il confronto fra due
   campioni porta con sé il tempo, e le coppie troppo distanti si scartano.
4. **Si aspetta un evento o una condizione, mai un tempo fisso.** `waitForFunction` / ciclo con tetto sulla condizione
   (fase `__CPM_PHASE`, registro ri-registrato, salvataggio alla settimana attesa), non `sleep(N)` e poi leggo. Il tetto serve
   a non appendersi, non a decidere: se scade, il controllo dichiara «non giudicato».
5. **Ripetizione dichiarata.** Un controllo che si ripete dice **quante volte** e **che cosa conta come verde** (es. «5 giri
   consecutivi, tutti verdi, D2 giudicato in ognuno»). Il rosso del braccio rosso si dimostra con la stessa regola. Un verde
   «all'ultimo giro» dopo rossi non è verde: è «instabile» e si ripara.
6. **Mai abbassare una soglia per far passare un controllo.** Si cambia ciò che si misura (strumento, evento atteso, tempo di scena)
   o si dichiara il caso «non giudicato»; una soglia si cambia solo con la misura che la giustifica e per volere del PO.
7. **Non giudicato = rosso.** Un controllo che non riesce a mettere in scena ciò che deve giudicare (nessun rigore, nessuna parata,
   nessuna scena) esce rosso con scritto «non giudicato»: un verde che non ha guardato nulla è peggio di un rosso. Ciò che il gioco
   non produce da solo si provoca **dalla sonda** (seme fisso, stato scritto tramite gli agganci di collaudo, situazione forzata),
   mai con un ramo speciale nel gioco.
8. **La causa si cerca prima di ripetere.** Un guardiano instabile si censisce (5 esecuzioni di fila, una alla volta, con durata e
   motivo di ogni rosso e `free -m`/`df -h` prima), si individua se la causa è nello **strumento** (attese a tempo fisso,
   dipendenza dalla velocità della macchina, soglia sul filo) o nel **gioco** (difetto vero, solo annotato dalle sessioni di controllo),
   e si ripara lo strumento seguendo le regole sopra. Lo si dichiara stabile solo dopo altre 5 esecuzioni consecutive.

## Codex
Solo collaudatore. Le direttive le scriviamo noi (`reports/codex/PROMPT-*.md`). Scrive solo in
`reports/codex/` e `tests/codex/`, pusha solo su rami `codex/…`.
