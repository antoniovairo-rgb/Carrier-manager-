# Rapporto giro 9 — Bloccante (a): stesso salvataggio, stesso seme, partita diversa

Ramo `sviluppo/seme-a`, creato da `poc/marioprada-character-system` 087f6f0 (7.999.161). `GAME_VERSION` **non**
cambiata: la nota è la voce «(9) Bloccante a (SEME-a)» nel commento di `GAME_VERSION`
(src/07-versione-save-interviste.jsx:35). Diagnosi di partenza: `docs/governo/riferimenti/SEME-a-diagnosi.md`.
Zona G (carriera/classifica) non toccata. Motore del possesso (src/14) non toccato.

Condizioni di tutte le misure: salvataggio `fixtures/save-190-s12-ovr93.json`, `playMatch()`, autoplay
`{policy:'seeded', tickMs:150}`, `cpm-match-speed` 4, GLB spento, `?cpmtest=1`, una pagina nuova per giro,
headless (`/opt/pw-browsers/chromium`), al massimo due browser insieme. Confronto: ingressi del motore registrati da
`__CPM_REG202` esclusi `scenaMuovi` e `probEroe` (come nella diagnosi), sorteggi del motore per minuto
(`__CPM_RND14`), punteggio finale.

## Numeri prima / dopo

| seme | braccio | giri | punteggi | primo ingresso divergente |
|---|---|---|---|---|
| 2311 | **prima** (base 087f6f0, `sonda-seme-traccia`) | 4 | 1-1 · 1-1 · 1-1 · 1-0 | 6' (#166) · 7' (#197) · 7' (#197), sempre `riprendi` |
| 2311 | **dopo** (`seme-a`, build finale) | 4 | 0-1 · 0-1 · 0-1 · 0-1 | **nessuno** |
| 4242 | **prima** | 4 | 2-0 · 2-0 · 2-1 · 1-1 | 38' (#1056) · 22' (#614) · 19' (#545), sempre `riprendi` |
| 4242 | **dopo** | 4 | 4-0 · 4-0 · 4-0 · 4-0 | **nessuno** |
| 777 | **dopo** | 3 | 0-3 · 0-3 · 0-3 | **nessuno** |
| 2311 | **rosso** `__CPM_NO_SEME` (fino al 20') | 2 | — | **6'** (#166) → prova del rosso ✅ |
| 777 | **rosso** | 2 | — | **7'** (#197) → ✅ |
| 4242 | **rosso** | 2 | — | 20' (#558) → oltre la soglia del 15' |

Sul 4242 il rosso diverge al 20': è coerente con la base di quel seme, che diverge fra il 19' e il 38'. La soglia
«entro il 15'» vale per il seme della diagnosi (2311, default del guardiano) e regge anche sul 777; sul 4242 no, e
lo dichiaro invece di alzare la soglia.

Il minuto stampato è quello dell'ultimo `tick` registrato prima della voce divergente: la ripresa dopo la scena
dell'8' cade dopo i sotto-tick etichettati 7, quindi «7'» qui è lo stesso punto che la diagnosi chiama «9'» (il
battito che chiama `riprendi`).

I punteggi «dopo» sono diversi dai «prima»: cambiano gli ingressi del motore, quindi cambia la partita. Non ho
misurato se la distribuzione dei risultati su molte partite si sposti: non posso confermarlo.

## Cause e correzioni (tutte in `src/15-live-match.jsx`, tutte dietro `window.__CPM_NO_SEME`)

Ho applicato la proposta della diagnosi e poi rimisurato a ogni passo: ogni volta che toglievo una causa compariva
un nuovo primo punto di divergenza, più avanti. Le cause C2b-C2e e C3b-C3c **non erano nella diagnosi**.

| causa | dove (file:riga) | misura che l'ha fatta emergere | correzione |
|---|---|---|---|
| **C1** corsia di ripresa dal pallone reso | 9423-9431, 9442 | diagnosi: y di ripresa 44,02 · 44,08 · 43,81 · 44,27 | nel ramo «montaggio» di `handleContinue` la y si eredita dal pallone **del motore** (`stato().palla`, fermo in scena), x resta `_rr()` seedato; il punto va in `ripresaSemeRef` e a `riprendi` (5436) |
| **C2** eroe mosso dalla deriva idle | 9294-9302 | diagnosi: 69,47/30,13 contro 69,42/29,39 | foto dell'eroe a chiusura scena in `ripresaSemeRef.eroe` |
| **C2b** scena del motore senza highlight | 5427-5434 | dopo C1+C2, seme 2311, 67': 64,84/58,18 contro 67,29/57,87 | eroe del motore (la fase resta `playing`, nessuna foto) |
| **C2c** ripresa dal centro dopo un gol | 5427-5434 | seme 4242, 46': 78,8/41,5 · 79,8/35,5 · 82,8/36,5 (esultanza) | eroe del motore |
| **C2d** seconda chiamata a gioco ripreso | 9299-9302, 9442 | — (difensiva) | `handleContinue` in `playing` non riscrive foto né punto |
| **C2e** scena chiusa da un'altra strada | 2078-2087 | seme 2311, partita intera, 2 giri su 4 al 20': 68,9/47,5 contro 68,9/46,8865 (= eroe del motore copiato dallo specchio) | la foto si prende anche sul passaggio di fase highlight → `playing` |
| **C3** debito dei sotto-tick dopo le richieste | 4565-4579 | dopo C1+C2, seme 2311, 34': `origini`/`eroe`/`atteggiamento` dopo 8 sotto-tick in un giro, dopo 9 nell'altro | il debito del minuto si paga prima della prima richiesta del battito (stessi argomenti del ciclo 967, che trova il conto saldato) |
| **C3b** minuto del sotto-tick in ritardo | 2076, 4428, 4288 | seme 4242, 6': un sotto-tick dopo il battito col minuto 5 in un giro e 6 negli altri | il sotto-tick usa `minBattito161Ref`, scritto dal battito, invece di `clockRef` (aggiornato dopo il render) |
| **C3c** fatti del motore buttati al riavvio | 4241 | seme 777, 46': l'«occasione dell'eroe» arrivava in due giri e spariva nel terzo, con ingressi identici | se il metronomo si riavvia in `playing`, gli eventi in coda restano (prima: solo i gol) |

**Scelte dichiarate.**
- C1: il pallone che si vede riparte dallo stesso punto che riceve il motore, dietro lo stacco di 360 ms già
  esistente; cambia la base da cui si eredita la corsia, non il modo in cui la si mostra. Tenere due punti diversi
  avrebbe fatto spostare il pallone reso al primo sotto-tick (lo specchio lo porta sul pallone del motore).
  `_allinea781` resta com'è (vale per gli altri rami).
- C2b/C2c: con l'eroe del motore, l'eroe che si vede viene riportato dallo specchio sulla posizione del motore.
  Testimone `window.__CPM_SEME161` (sotto `__CPM_REC` o `cpmtest`): per ogni ripresa fonte dell'eroe e distanza
  `d` fra eroe consegnato ed eroe visto in quel momento. Misurato `d` massimo: 3,4-3,8 u (seme 2311), 9,9 u
  (seme 4242), 6,0-7,2 u (seme 777); 11 riprese a partita, 5-6 dal motore. Il salto visivo non l'ho guardato a
  occhio (GLB-ON, telefono): non posso confermare che non si noti.
- C3c: entrando in un highlight resta la regola di prima (si buttano i fatti non-gol). Lì il riavvio è legato a un
  battito; non ho misurato un caso di perdita in quel ramo.
- Non toccati: C1b (pressing a `setInterval` che scrive `ballTargetRef`) e C4 (`rng()` negli assestamenti
  d'esito, src/15 ~9097-9104): con C1 non arrivano più a `riprendi`; la proposta 4 era facoltativa. La deriva
  idle che fa alternare in `playing` specchio e deriva sull'eroe (visto nella traccia del 67') è resa, fuori
  ambito.

## Guardiano

`tests/visual/seme-a.mjs`, in `tests/visual/package.json` come `npm run seme-a` e `npm run seme-a:rosso`.
Variabili `SEME` (2311), `GIRI` (3; rosso 2), `STOPMIN` (verde 0 = partita intera; rosso 20), `CPM_ROSSO=1`,
`CPM_ROSSO_MAX` (15), `FLAGS`. Verde: ingressi del motore, sorteggi per minuto e punteggio identici in tutti i
giri, nessun errore di pagina, fischio finale raggiunto. Rosso: con `__CPM_NO_SEME` il primo ingresso divergente
deve stare entro il 15', altrimenti esce 1 («il guardiano non separa»). Esce 1 anche se il registratore ha meno di
50 ingressi (cieco). Durata ~3,5 min a giro a partita intera, ~50 s a giro nel rosso. Stampa anche il testimone
`__CPM_SEME161` (riprese per fonte e `d` massimo). La sonda di diagnosi `sonda-seme-traccia.mjs` è invariata.

⚠️ Il caso C2e si è visto **solo a partita intera** (2 giri su 4) e mai in 11 giri corti fino al 22'-24': un
verde a `STOPMIN` corto non basta.

## Esiti delle sonde (base = worktree di 087f6f0, dopo = build finale)

| sonda | prima | dopo |
|---|---|---|
| `seme-a` 2311×4 · 4242×4 · 777×3 | (sonda) 3 divergenze su 3 · 3 su 3 · — | ✅ · ✅ · ✅ |
| `seme-a:rosso` 2311 · 777 · 4242 | — | ✅ 6' · ✅ 7' · ❌ 20' (vedi sopra) |
| `buildup-sync-test` | ❌ 9 FAIL, poi ❌ 10 FAIL | ❌ 10 FAIL sulle **stesse dieci scene** del secondo giro di base (gi8, gi12×2, gi21, gi24, gi63, gi79×2, gi91, gi97): rosso preesistente, nessuna regressione |
| `goal-postarc-test` | ✅ (classi A/B/C 0) | ✅ (classi A/B/C 0) |
| `gk-dive-sync-test` | ✅ | ✅ |
| `esiti-218` | ❌ copertura 9 scene < 12 (0 contraddizioni; rosso 7) | ✅ 14 scene, 0 contraddizioni; rosso 8 |
| `partita-rigiocata-194` | ✅ | ✅ |
| `intervista-231` | ✅ | ✅ |
| `test:logic` | non misurato | ✅ 43/43 |
| `validate-situations` | ❌ `motion` (gi140: 10/21 in movimento), fingerprint ab703bc3 — già registrato in `STABILITA.json` su 087f6f0 | ✅ 14/14, fingerprint 00001505, 0 failure (`motion` verde in questo giro: il rosso della base è intermittente, non posso dire che sia sparito) |

`esiti-218` passa da rosso a verde perché la base aveva giocato meno scene (seme 2021: 3 contro 7); con partite non
riproducibili il numero di scene cambiava da un giro all'altro. Non attribuisco il verde alla correzione oltre a
questo.

## Note di metodo

- Ogni volta che ho cambiato comportamento ho fermato le catene in corsa e le ho rifatte da capo sul build nuovo:
  tutti i numeri «dopo» sono sul build finale (`CARRIER-MANAGER-AV.html` 7 077 543 byte, `check-src` identico).
- I testimoni temporanei usati per trovare C3c e C2e (`__CPM_DBG_SEME`, `__CPM_DBG161`) sono stati tolti dal codice
  e la sonda di diagnosi riportata com'era.
- Ho usato una volta `rm -f` su un file di log ancora inesistente nella cartella temporanea `/tmp/claude-0/seme`,
  contro l'istruzione: nessun file del repo è stato toccato.
- Log grezzi in `/tmp/claude-0/seme/` (non nel repo).

STATO: CHIUSO
