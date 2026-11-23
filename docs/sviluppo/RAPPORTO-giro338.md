# Rapporto del giro 338 — PO-603: il rilascio automatico senza il ramo `poc`

Base: `lavoro/201` @ `d681977` · ramo di consegna: `sviluppo/giro338-via-poc` · GAME_VERSION non toccata.

Decisione PO 23/11 08:00: «elimina il ramo poc, non serve a nulla. Crea solo rumore» → «Giro subito, poi cancello».
Misurato prima di iniziare: `origin/main` e `origin/poc/marioprada-character-system` puntano allo stesso commit (`ddf0b7d`).
Esiste anche un ramo `poc/marioprada-character-system-local` (`5d5feb1`): nessuno strumento lo nomina, non l'ho toccato.

## 1. Censimento dei riferimenti (prima → dopo)

Ricerca: `grep -E "\bpoc\b|marioprada"` su tutto il repository (esclusi binari, `node_modules`, `out/`). La maggior parte delle
corrispondenze sono l'acronimo «POC» (proof of concept: `docs/POC-*.md`, `tests/character-lab/*POC*`, `tools/pubblica-netlify-poc.py`,
recensioni dei ritratti) o **note storiche** su dove stava una foto del PO («(ramo poc/…)» in `tifosi-171`, `spalti-109`,
`partita2d-141/151`, `scena-motore-147`). Non sono operative e le ho lasciate com'erano.

Riferimenti **operativi** (righe che nominano il ramo):

| File | prima | dopo | cosa resta |
|---|---:|---:|---|
| `tools/rilascio-vagone-312.mjs` | 30 | 9 | tutte marcate «338»: il nome del ramo (una costante), il ripiego, il braccio rosso |
| `.github/workflows/verifica-guardiani.yml` | 16 | 0 | — |
| `tools/trenino-317.mjs` | 3 | 0 | — |
| `CLAUDE.md` | 6 | 1 | il nome del guardiano `via-poc-338` |
| `docs/governo/RILASCIO-AUTO.json` | 1 | 1 | **non toccato**: vive su main, vedi sotto |
| `tests/visual/rilascio-312.mjs` | 16 | 0 | remoto finto senza il ramo |
| `tests/visual/trenino-317.mjs` | 16 | 0 | remoto finto senza il ramo |
| `tools/custode-notte-330.mjs`, `tools/governo-html.mjs`, `tests/visual/ci-treno-308.mjs`, `tests/visual/ci-runner.mjs`, altri workflow, `docs/governo/PROCESSO.md` | 0 | 0 | — |

Fuori dal mio ambito (documenti di governo che vivono su main, li aggiorna la madre). Misurato: `origin/main` non è antenato di
`lavoro/201` (ha i suoi commit di governo) e una mia modifica a `RILASCIO-AUTO.json` andava in conflitto con main (il guardiano
rilascio-312 è diventato rosso proprio lì); al rilascio vincerebbe comunque main, quindi l'ho tolta:
- `docs/governo/RILASCIO-AUTO.json`, campo `_`: «Lo legge … dal ramo poc/marioprada-character-system» → «da main». Solo testo: lo
  strumento legge `attivo`, non il commento.
- `docs/governo/CODA-SESSIONI.md` r.9: «Ramo principale del team: `poc/marioprada-character-system`» → da cambiare in `main`.
- `docs/governo/ROSSI-DICHIARATI.json`, campo `fonte`: cita la ROADMAP «(ramo poc/…)». È una nota storica, non viene letta da nessuno strumento.
- Attività programmate dell'account: le ho lette (`list_triggers`, sola lettura). **Nessuna nomina il ramo**. Chi spinge «poc e poc:main
  insieme» è la procedura della sessione madre: quella va cambiata a mano (vedi §3).

## 2. Il percorso nuovo del rilascio

`tools/rilascio-vagone-312.mjs`:
- **decidi**: legge l'interruttore `docs/governo/RILASCIO-AUTO.json`, `ROSSI-DICHIARATI.json` e `BLOCCO-RILASCI.json` **da `origin/main`**;
  le unioni «Unione sviluppo/… in lavoro/…» si contano da main; la versione precedente è quella di main.
- **prepara**: commit della versione sul lavoro → checkout di main → `merge --no-ff` del lavoro **direttamente in main** (conflitti solo in
  `docs/governo/**` → versione di main; qualunque altro conflitto → fermo) → `ULTIMO-RILASCIO.json` → tag annotato sul commit nuovo.
  Il controllo «main è antenato del commit nuovo» resta: senza appoggio è vero per costruzione.
- **pubblica**: **un solo `git push --atomic`** di tre riferimenti: lavoro, main, tag. Mai force. Se lavoro o main si sono mossi, il server
  rifiuta tutto.
- Modo prova: rami `prova/cd-<corsa>-{lavoro,main}` (il terzo ramo non c'è più), tag `prova-v…`, niente deploy.
- Nel decisione.json il campo è ora `commit_main` (prima `commit_poc`); il workflow scrive lo stato `rilascio-vagone` su quel commit.

`verifica-guardiani.yml`, job «Blocco dei rilasci»: `RAMO_BLOCCO: main` al posto di `POC`. Il treno grande fa fetch di main, commit di
`BLOCCO-RILASCI.json`, push senza force su main (riprova fino a 4 volte rileggendo main). Un push di soli `docs/governo/**` su main non
fa partire il deploy (`paths-ignore`, giro 326) e il treno non parte su main (si attiva su `lavoro/**` e `prova/**`).

**Lettura di ripiego dichiarata («ripiego 338», da togliere).** Se main **non ha** uno dei tre file di governo, `decidi` lo legge dal
vecchio ramo, **solo se esiste ancora** (fetch tollerante: un ramo cancellato non è un errore), e lo scrive nelle note della decisione.
Perché serve: il treno grande notturno parte da `schedule`/dal custode e usa il workflow di **main**. Finché il primo rilascio senza poc
non ha portato su main il workflow nuovo, una notte può ancora scrivere il blocco sul vecchio ramo. Oggi `BLOCCO-RILASCI.json` non c'è
né su main né su poc, quindi il ripiego **non cambia niente subito**. Funzione pura `leggiConRipiego338`, provata dal guardiano rilascio-312.

**Braccio rosso `CPM_NO_G338=1`** = il percorso di prima (base sul vecchio ramo, main in fast-forward, push di quattro riferimenti), tutto
in righe marcate «338».

## 3. Guardiani e misure

| Guardiano | verde | rosso `CPM_NO_G338=1` |
|---|---|---|
| `npm run rilascio-312` (remoto finto **senza** ramo poc) | ✅ VERDE: main = unione --no-ff (main precedente + lavoro) = tag; sul remoto nessun ramo nuovo; conflitto in docs/governo risolto con main; ripiego provato a 4 casi | ❌ uscita 1 (il percorso col poc non trova il ramo) |
| `npm run trenino-317` (remoto finto **senza** ramo poc, blocco su main) | ✅ VERDE: D1-D9, D7 rilascio = unione del lavoro in main, nessun ramo nuovo | ❌ uscita 1 |
| `npm run via-poc-338` (statico, nuovo) | ✅ VERDE: 0 riferimenti non dichiarati, 10 dichiarati «338»; 7 controlli sul percorso | ❌ ROSSO (file della base `d681977`) |

`via-poc-338` è nella riga della MAPPA della macchina del treno (`ci-runner.mjs`, stessa riga di rilascio-312/trenino-317/deploy-326/treno-330).

Giro `node ci-runner.mjs giro via-poc-338 rilascio-312 trenino-317 deploy-326 treno-330`: **esito nella sezione 6** (scritta a fine corsa).
⚠️ Una prima corsa è caduta in 0 s su 15 sentinelle per `Cannot find package 'playwright'` (`node_modules` non installati nella sessione):
non vale, ho tolto la sua riga da `STABILITA.json`, fatto `npm install` e rifatto il giro da capo.

## 4. Cosa deve fare la madre per cancellare `poc` in sicurezza

1. Unire prima il giro 333, poi questo. Conflitti attesi (misurati con un'unione di prova): **`tests/visual/ci-runner.mjs` riga 68**
   (stessa riga della MAPPA: tenere **tutte e due** le aggiunte — `notte-333|governo-html` nel gruppo tools e `via-poc-338` nei test e
   nell'elenco dei guardiani). `package.json` non dovrebbe più andare in conflitto (ho spostato la riga accanto a `trenino-317`).
2. Smettere di spingere `poc` e `poc:main` insieme: da ora si spinge **solo main** (cambiare la propria procedura e `CODA-SESSIONI.md` r.9).
3. Aspettare il **primo rilascio automatico riuscito senza poc**: stato `rilascio-vagone` verde, tag `v…` su main, `ULTIMO-RILASCIO.json`
   su main, e nel `decisione.json` dell'artifact `esito-rilascio` `dest` **senza** la chiave `poc`.
4. Controllare che il vecchio ramo non sia avanzato dopo quel rilascio (`git ls-remote origin refs/heads/poc/marioprada-character-system`)
   e che su di lui non ci sia un `BLOCCO-RILASCI.json` diverso da quello di main: se c'è, copiarlo su main **prima** di cancellare.
5. Cancellare il ramo remoto (`git push origin --delete poc/marioprada-character-system`). Dopo la cancellazione il rilascio continua a
   funzionare: il ripiego è tollerante, provato nel guardiano con «appoggio cancellato → niente».
6. Giro piccolo di pulizia: togliere `refAppoggio338`/`leggiConRipiego338` e il braccio rosso, e portare `via-poc-338` a «zero righe
   dichiarate».

## 5. Dubbi per il PO

**D1. Il ripiego sul vecchio ramo: quando lo togliamo?**
1. **(consigliata)** Nel giro di pulizia subito dopo la cancellazione del ramo: finché il ramo esiste serve a non perdere un blocco scritto
   di notte dal workflow vecchio.
2. Subito, in questo giro: meno codice, ma una notte prima del primo rilascio potrebbe scrivere il blocco dove nessuno lo legge più.
3. Mai: resta come rete di sicurezza (inerte, perché il ramo non esisterà).

**D2. Il ramo `poc/marioprada-character-system-local` (`5d5feb1`, diverso da main) che si fa?**
1. **(consigliata)** Lasciarlo finché qualcuno non controlla cosa contiene: nessuno strumento lo usa, non disturba il rilascio.
2. Cancellarlo insieme a `poc` dopo averlo confrontato con main.
3. Rinominarlo in `archivio/…` per toglierlo dalla vista.

**D3. Il blocco del treno grande scrive su main: va bene un commit di governo diretto su main?**
1. **(consigliata)** Sì: scrive solo quando cambia l'insieme dei bloccanti, non fa partire il deploy (paths-ignore) né il treno.
2. Scriverlo invece su un ramo dedicato `governo/blocco` (un ramo in più, che è proprio ciò che il PO vuole evitare).
3. Non scriverlo in un file ma solo come stato del commit (`treno-grande`): servirebbe riscrivere la decisione del rilascio.

## 6. Esito del giro

`node ci-runner.mjs giro via-poc-338 rilascio-312 trenino-317 deploy-326 treno-330` (GAME_VERSION 7.999.206, non toccata):

- **Corsa 1:** non valida. 15 sentinelle cadute in 0 s per `node_modules` mancanti. Riga tolta da `STABILITA.json`, `npm install`.
- **Corsa 2:** 21/22. L'unico rosso era **rilascio-312, ed era un rosso vero**: il montaggio della prova univa il ramo in `main`, e la mia
  modifica a `docs/governo/RILASCIO-AUTO.json` andava in conflitto con il file su main. Ho corretto due cose: il file di governo non lo
  tocco più (§1), e il lavoro finto parte dall'antenato comune fra HEAD e main (`git merge-base`), come faceva prima con `lavoro/200`.
  Il conflitto in docs/governo **del rilascio** resta provato: B2 «risolto con la versione di main».
- **Corsa 3, rifatta da capo sul build finale (`170270d`): ✅ 22/22 verdi.** via-poc-338 0 s · rilascio-312 13 s · trenino-317 17 s ·
  deploy-326 0 s · treno-330 1 s · mappa-unica · le 17 sentinelle (partita-vera 716 s, career-critical 383 s, battito-264 437 s …).
- I bracci rossi li ho provati a mano, fuori dal runner: `CPM_NO_G338=1` → rilascio-312 uscita 1, trenino-317 uscita 1, via-poc-338 uscita 1.

Le schermate che lascia `griglia-mobile` in `docs/collaudo-grafico/g0/` sono output del controllo: non le ho messe nel commit.
