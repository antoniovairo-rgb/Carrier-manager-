# Giro 317 — «trenini» (PO-604)

Ramo: `sviluppo/giro317-trenini` (da `lavoro/201` = 86a7d74). Non tocca `src/` né `GAME_VERSION`.
Decisioni PO del 21/11 22:35 (DECISIONI.md sul poc): «Trenino + treno grande di notte»; rosso nuovo di notte → «Rilasci fermi finché non si ripara».

## Come funziona

| evento | cosa gira | rilascia? | scrive |
|---|---|---|---|
| push su `lavoro/**` (unione di un vagone) | **trenino**: righe della MAPPA toccate dal vagone + 17 sentinelle | sì, se pulito e non bloccato | stato `rilascio-vagone`, tag, ULTIMO-RILASCIO.json (come nel 312) |
| push che tocca un file non coperto | **treno completo** (mappa intera), dichiarato nel riepilogo | sì, se pulito e non bloccato | come sopra |
| schedule `7 1 * * *` (02:07 Roma d'inverno, 03:07 con l'ora legale) | **treno grande**: mappa intera sulla punta di `lavoro/<numero più alto>`, o di main se è già tutto rilasciato | **no** | `docs/governo/BLOCCO-RILASCI.json` sul poc (solo quando cambia l'insieme dei bloccanti) + stato `treno-grande` sul commit giudicato |
| a mano, `tipo=mappa` su `lavoro/**` o main | treno grande | sì (312) | anche il blocco |
| a mano, `tipo=trenino` / `tipo=notte` | come sopra; `rilascio=prova` per non toccare poc/main | solo in prova | blocco su `prova/cd-<corsa>-blocco` |

**Scelta del trenino** (`tools/trenino-317.mjs scegli`): base = tag `v*` più alto, altrimenti la punta di `origin/main` (oggi: nessun tag, main = 7.999.200); vagone = `git diff` dall'antenato comune fra base e punta. Per ogni file:
docs/** e *.md neutri → righe della MAPPA che lo prendono → `CARRIER-MANAGER-AV.html` coperto solo se nel vagone c'è anche `src/` → `tests/visual/package.json`: solo-script = gli script cambiati, altrimenti completo → `ci-runner.mjs`: `mappa-unica` + i guardiani entrati in CATENE/MAPPA → file nominato da uno script npm = quello script → **tutto il resto = non coperto = treno completo**.
La macchina del treno (workflow, ci-treno-308, rilascio-vagone-312, trenino-317 e i loro guardiani) ha una riga nuova nella MAPPA (`rilascio-312`, `trenino-317`): fuori da `src/`, la mirata non la legge.

**Decisione del rilascio** (`decidi` di `tools/rilascio-vagone-312.mjs`, estesa): accetta `tipo: trenino` solo se la scelta **ricalcolata da sé** sul commit provato è un trenino (non un completo), con la stessa base, e ogni guardiano scelto è giudicato; `elenco` a mano non rilascia mai; mappa intera/completo come nel 312. In più legge `BLOCCO-RILASCI.json` e `ROSSI-DICHIARATI.json` dal poc: un bloccante non dichiarato ferma tutto. `CPM_NO_G317=1` = comportamento del 312.

**Blocco**: il treno grande calcola i suoi rossi nuovi + non giudicati (non giudicato = rosso; esito mancante = blocco acceso, mai spento per assenza di dati). Il blocco successivo sostituisce il precedente: chi ora è verde o rosso noto finisce in `sbloccati`. Push senza force sulla punta del poc, fino a 4 tentativi rileggendo il poc. Il blocco arriva su main con l'unione del poc al rilascio successivo.

## Cosa è provato davvero

- `npm run trenino-317` (14 s, niente browser): **verde 50/50**; con `CPM_NO_G317=1` **rosso, 12 controlli falliti** (piano senza trenino, trenino pulito fermo «mappa non intera», blocco ignorato, percorso vero interrotto). Copre: scelta da diff finti (src/16 sceglie la sua riga e le sentinelle e non la riga src/12-13; docs neutri; HTML senza src → completo; lib/harness → completo dichiarato; package.json script/dipendenze; ci-runner; macchina del treno), decisione (10 casi + braccio rosso interno), blocco (acceso, spento, non giudicato, dichiarato dal PO, esito mancante), bersaglio notturno, e **percorso vero su remoto finto**: vagone su src/16 → scegli → decidi rilascia → blocco sul poc → fermo → PO dichiara → rilascia → dichiarazione tolta → fermo → treno grande pulito → prepara → pubblica: main = poc = tag v7.999.201, ULTIMO-RILASCIO dichiara `tipo: trenino`, bersaglio poi = main, base poi = tag.
- `npm run rilascio-312` resta **verde** (42 ✅), `npm run mappa-unica` verde.
- Piano locale sul ramo: trenino del lavoro/201 (312+314+317, 19 file) = **137 guardiani in 7 parti**, parte più lunga ~66 min attesi, somma 464 min; mappa intera = 352 guardiani in 28 parti, somma 1940 min.

## Prove su Actions

- Corsa trenino, `tipo=trenino`, `base=6fb9752` (vagone del 314: src/11 + src/16 + ricomposto + guardiano serata-314, più la macchina del 317), `rilascio=prova`, ramo `prova-cd/giro317-trenino`: corsa 44952979476.
- Corsa notte di prova, `tipo=notte`, `elenco=mappa-unica`, `rilascio=prova`, ramo `prova-cd/giro317-notte`: corsa 44952982008 (bersaglio, blocco su `prova/cd-<corsa>-blocco`, stato `treno-grande-prova`).

**Notte (prova), verificata sul runner:**
- 1ª corsa 44952982008: bersaglio giusto (`lavoro/201` 86a7d74, «ha commit che main non ha»), ma **due difetti trovati**: il job del blocco cercava `tools/trenino-317.mjs` dopo il checkout del poc («Cannot find module»: stato `treno-grande-prova` = error, nessun blocco scritto); e il job di rilascio partiva anche sulla notte quando c'era un elenco (si è fermato da solo: «l'esito è del commit 86a7d74, non di e9e74d3»). Corretti entrambi (strumento copiato fuori prima del checkout; il rilascio guarda il tipo *chiesto*, non quello del piano).
- 2ª corsa 44954078991 (ramo `prova-cd/giro317-notte2`): **piano 55 s → parte 98 s → riepilogo 20 s → blocco 59 s, tutti verdi; rilascio saltato**. Ha scritto `docs/governo/BLOCCO-RILASCI.json` (attivo: false) su un ramo nuovo `prova/cd-44954078991-blocco` partito dalla punta del poc (1b6d5f5), commit «Treno grande: rilasci sbloccati», e lo stato anonimo `treno-grande-prova = success «nessun rosso nuovo, rilasci liberi»` sul commit giudicato 86a7d74. Il poc vero non è stato toccato.
- Non provato su Actions: il blocco **acceso** (un treno grande con un rosso nuovo vero) e il push con riprova sul poc vero — provati solo sul remoto finto del guardiano.

**Trenino (prova), corsa 44952979476** (vagone del 314 + la macchina del 317, base 6fb9752): il piano sul runner ha scelto **137 guardiani in 7 parti (~66 min attesi ciascuna, somma 464 min = 24% dei 1940 min della mappa intera; 7 runner invece di 28)**. È rimasta in coda ~9 minuti perché il treno grande del push su lavoro/201 (20:39) occupava 20 runner; le 7 parti sono partite fra le 21:52 e le 21:56. **Alla chiusura di questo giro (22:01) erano ancora in corsa: la durata reale di parete non posso confermarla.** Attesa: 66 min sul banco, fino a ~110 min se il runner è 1,7 volte più lento (taratura del 303); il bilancio delle parti la chiude comunque prima del timeout. Il risultato (riepilogo-totale, decisione in modo prova che con base data a mano ricalcola sulla base dichiarata) si legge dalla corsa. Anche il rilascio in prova con un trenino vero, se la corsa avrà rossi nuovi, si fermerà: è atteso, i guardiani del 314 sul runner non sono mai stati tutti verdi.
- Un vagone che tocca **solo** src/16 (+ ricomposto) sceglie **123 guardiani, 421 min attesi in somma** (calcolo locale sulle durate misurate): la riga di src/16 è larghissima, quindi su src/16 il trenino costa ~22% della mappa intera, non molto meno.


## Dubbi per il PO

1. **La notte non rilascia.** L'ho scelto per non far uscire versioni alle 2 senza un'unione nuova; un vagone fermato dal blocco esce all'unione successiva dopo lo sblocco (le note raccolgono tutte le unioni dal rilascio precedente). Se vuole che un treno grande pulito rilasci anche di notte, è una riga nel workflow.
2. **Il non giudicato blocca** come il rosso nuovo (regola fissa «non giudicato = rosso»). Sul runner la mappa intera ha già avuto parti cadute e tetti: c'è il rischio che i rilasci restino fermi più spesso del voluto, finché la taratura non è chiusa.
3. **Ora della notte**: il cron di GitHub è solo UTC; con l'ora legale gira alle 03:07 di Roma. E lo `schedule` usa il workflow di **main**: la notte parte davvero solo dopo che questo giro è arrivato su main (col primo rilascio).
4. **Capienza dei runner**: un treno grande occupa 20 posti (il tetto del piano gratuito). Mentre la mappa intera del push su lavoro/201 delle 20:39 era in corsa, le mie due prove sono rimaste in coda: un trenino che arriva durante la notte aspetta il treno grande.
5. **File condivisi**: oggi `tests/visual/lib/**`, `tools/build-src.mjs`, `.github/workflows/` diversi dal treno fanno girare la mappa intera. È la scelta prudente; se diventa frequente, si aggiungono righe alla MAPPA.
6. **In modo prova** la decisione ricalcola il trenino sulla base che il trenino dichiara (per poterlo provare con una base data a mano); in modo auto la base è sempre l'ultimo rilascio e una base diversa ferma.
8. **La riga di src/16 (e di src/11-12-13) è molto larga** (123 guardiani per src/16): il trenino là risparmia ~4/5 dei minuti ma resta un'ora e più di parete. Stringere le righe è lavoro sulla MAPPA, fuori da questo giro.
7. Il treno del push su lavoro/201 (20:39, mappa intera del 312) userà ancora la logica del 312: il trenino vale dalla prima unione che contiene questo giro.
