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

ESITO_ACTIONS

## Dubbi per il PO

1. **La notte non rilascia.** L'ho scelto per non far uscire versioni alle 2 senza un'unione nuova; un vagone fermato dal blocco esce all'unione successiva dopo lo sblocco (le note raccolgono tutte le unioni dal rilascio precedente). Se vuole che un treno grande pulito rilasci anche di notte, è una riga nel workflow.
2. **Il non giudicato blocca** come il rosso nuovo (regola fissa «non giudicato = rosso»). Sul runner la mappa intera ha già avuto parti cadute e tetti: c'è il rischio che i rilasci restino fermi più spesso del voluto, finché la taratura non è chiusa.
3. **Ora della notte**: il cron di GitHub è solo UTC; con l'ora legale gira alle 03:07 di Roma. E lo `schedule` usa il workflow di **main**: la notte parte davvero solo dopo che questo giro è arrivato su main (col primo rilascio).
4. **Capienza dei runner**: un treno grande occupa 20 posti (il tetto del piano gratuito). Mentre la mappa intera del push su lavoro/201 delle 20:39 era in corsa, le mie due prove sono rimaste in coda: un trenino che arriva durante la notte aspetta il treno grande.
5. **File condivisi**: oggi `tests/visual/lib/**`, `tools/build-src.mjs`, `.github/workflows/` diversi dal treno fanno girare la mappa intera. È la scelta prudente; se diventa frequente, si aggiungono righe alla MAPPA.
6. **In modo prova** la decisione ricalcola il trenino sulla base che il trenino dichiara (per poterlo provare con una base data a mano); in modo auto la base è sempre l'ultimo rilascio e una base diversa ferma.
7. Il treno del push su lavoro/201 (20:39, mappa intera del 312) userà ancora la logica del 312: il trenino vale dalla prima unione che contiene questo giro.
