# Rapporto giro 264 — il battito del motore e l'apertura della scena hanno un ordine solo

Ramo `sviluppo/giro264-battito-scena`, partito da `lavoro/197` (`ba99108`, contiene il giro 259). `GAME_VERSION` non toccata.
Nessun campo nuovo nel salvataggio, `SAVE_VERSION` invariata. Rosso: `window.__CPM_NO_G264` (torna il comportamento di prima).
Registri delle misure: `docs/sviluppo/giro264/*.txt`.

## 1 — Misura prima

Sonda nuova `sonda-264` (`npm run sonda-264`): ripete la `sonda-259b` per N corse (stessa partita «Collaudo Salienti», seme del pilota
7300, intera e soli highlight fermate al 12') e in più registra dentro la pagina **quanti passi e quante estrazioni del flusso `rnd`
(`__CPM_RND14`) ha già consumato il motore nel momento in cui la scena gioca** (`giocaScena`).

| | corse | divergenti (libro mastro) | divergenti (motore all'ingresso in `giocaScena`) |
|---|---|---|---|
| base `lavoro/197`, corse singole di prova | 2 | 2 | 1 misurata su 1 |
| base `lavoro/197`, serie da 20 (`g264-prima.txt`) | 20 | **2** | **2** |

Nelle corse divergenti, sempre lo stesso quadro (identico a quello del 259: «chance» contro «assist» al 5'):

| | passi ricevuti dal motore | estrazioni `rnd` | minuto del motore | esito |
|---|---|---|---|---|
| soli highlight (e intera non divergente) | 95 | 5169 | 4 | passaggio arrivato, gol del compagno |
| intera divergente | **96** | **5228** | **5** | tiro del compagno parato |

**Causa.** La scena si apre dentro il battito del minuto (`setPhase("hl_intro")` nell'aggiornamento del cronometro, `src/15`). Ma
l'intervallo del metronomo vive in un effetto di React che dipende dalla fase: si spegne solo quando React ha reso e ha eseguito la
pulizia dell'effetto, cioè quando il processore ha tempo. Se nel frattempo scade un'altra battuta (77 ms a 1x), il battito parte con
`phaseRef` ancora su `playing`: è un sotto-passo del minuto nuovo, e dal 7.962 il motore lo riceve sempre. Quel passo consuma 59
estrazioni **prima** che la scena giochi; la scena pesca poi dal punto sbagliato del flusso. Nei soli highlight non può succedere:
il lotto fa girare ogni battito dentro `flushSync` e si ferma appena la fase esce da `playing`.
Il conto dei passi per minuto resta 22 nei due casi (quello anticipato non viene ripagato dopo): cambia solo l'**ordine** fra quel
passo e la scena, ed è l'orologio da polso a deciderlo.

## 2 — Correzione (`src/15`, 2 righe di sostanza)

`_batt264`: il **battito del minuto** — l'unico che apre scene, fischia e cambia fase — gira dentro `ReactDOM.flushSync`, come nel
lotto dei soli highlight: fase, cronometro e spegnimento dell'intervallo sono applicati prima che la battuta dopo possa partire. I 21
sotto-passi fra un minuto e l'altro restano com'erano. Il motore (`src/14`) non è toccato; nessun sorteggio aggiunto o tolto.
Col rosso `__CPM_NO_G264` l'intervallo chiama il battito nudo, come prima.

**Due tentativi, tutti e due misurati.**
1. *Ogni* battuta dentro `flushSync` (commit `8f029f6`): 0 divergenze su 20 corse, 2 partite complete identiche (244 voci su 244),
   `solo-highlight-166` verde intero in una corsa. Lasciato per il costo dentro la battuta (vedi tabella): su un telefono un render
   sincrono ogni 77 ms è lavoro in più senza guadagno.
2. Solo il battito del minuto (quello spedito): stessi risultati, costo quasi nullo.

Passo reale del metronomo (`sonda-264v`, stessa partita nei bracci — assist e gol al 5' —, fino al 15', `g264-passo.txt`):

| braccio | intervallo medio fra due battute | mediano | lavoro dentro la battuta |
|---|---|---|---|
| rosso (battito nudo) | 128,1 ms | 94 | 0,23 ms |
| verde (spedito) | 130,9 · 134,8 ms | 99 · 108 | 0,46 · 0,48 ms |
| ogni battuta in `flushSync` (tentativo 1, emulato dalla sonda) | 127,2 ms | 106 | 3,1 ms |

⚠️ Errore mio, corretto con la misura: a metà giro avevo letto un rallentamento (1912 contro 2576 ms di gioco fluido per minuto). Era
un confronto fra partite diverse: nella corsa rossa la scena era uscita «chance» (nessun gol al 5', quindi nessuna pausa di ripresa).
A parità di partita il passo è lo stesso nei tre bracci. I ms di `playing` per minuto non sono una misura del passo.

## 3 — Misura dopo

| | corse | divergenti (libro) | divergenti (motore) | non giudicate |
|---|---|---|---|---|
| `sonda-264`, 20 corse al 12' (`g264-dopo2.txt`) | 20 | **0** | **0** | 0 |
| `battito-264`, braccio verde: 2 coppie con la gara provocata + 1 a tempo reale, al 30' | 3 | 0 | 0 | 0 |
| `solo-highlight-166`, 3 corse intere di fila (2 coppie di partite complete per corsa) | 3 | 0 (244/244 voci, 3-1 · 3-1) | — | 0 |
| (tentativo 1) `sonda-264` 20 corse al 12' + 2 partite complete | 22 | 0 | 0 | 0 |

In tutte le 20 corse la scena del 5' gioca con 95 passi e 5169 estrazioni nei due modi.

## 4 — Statistiche su 20 partite, prima e dopo

Sonda `sonda-264s` (`npm run sonda-264s`): 20 partite **diverse** giocate per intero dal prompt della carriera (nomi «Statistica 1…19»
e «Conteggio 1»: il nome entra nel seme della partita; stessa settimana, stesso pilota seedato). Gol dal tabellone, tiri e possesso
dal tabellino del motore (`M.tabellino()`), più un'impronta del libro mastro.
- **Prima** = partita intera col rosso `__CPM_NO_G264`, velocità 2x (`g264-stat-prima.txt`).
- **Dopo** = la stessa partita senza il rosso. Misurata a soli highlight (`g264-stat-dopo-solo.txt`), perché dopo la correzione i due
  modi sono la stessa partita; verificato anche qui: le prime 6 giocate intere a 2x senza rosso hanno **6 impronte su 6 uguali** a
  quelle a soli highlight (`g264-stat-dopo-intera.txt`).

| su 20 partite | prima | dopo |
|---|---|---|
| gol a partita (casa + ospiti) | 2,40 (1,85 + 0,55) · dev. st. 1,20 | 2,55 (2,00 + 0,55) · dev. st. 1,28 |
| tiri a partita (casa + ospiti) | 19,85 (13,90 + 5,95) · dev. st. 3,18 | 20,05 (14,25 + 5,80) · dev. st. 4,39 |
| possesso della squadra di casa | 41,6 % · dev. st. 4,6 | 41,6 % · dev. st. 4,5 |
| vittorie · pareggi · sconfitte | 15 · 3 · 2 | 13 · 4 · 3 |
| scene giocate a partita | 6,45 | 6,60 |
| partite con libro mastro diverso dai soli highlight | **17 su 20** | 0 su 6 misurate (per costruzione sulle altre) |

Le differenze fra le due colonne stanno dentro la dispersione di 20 partite (gol: +0,15 con deviazione standard 1,2; errore standard
della media ≈ 0,27): la correzione non sposta le medie in modo misurabile. Quello che cambia è **quale** partita esce: prima, 17 volte
su 20 la partita intera a 2x non era quella dei soli highlight (né, per lo stesso motivo, quella di un'altra corsa intera); adesso è una.
Non posso confermare con 20 partite differenze di statistica più piccole di circa mezzo gol a partita: servirebbe un banco più grande.

Due nomi («Statistica 20», «Statistica 21») non hanno aperto la partita in nessuno dei due bracci (bottone non trovato in 10 s, con e
senza rosso): non li ho indagati, li ho sostituiti con «Conteggio 1». Vedi «Dubbi».

## 5 — Guardiano nuovo `battito-264` (`npm run battito-264`)

A tempo reale la gara esce in una corsa su 5-10: un guardiano che aspetta la fortuna sarebbe cieco. La gara si **provoca dalla
sonda**: nelle coppie «provocate» l'intervallo del metronomo (periodo 77 ms) batte due volte di fila senza restituire il controllo al
browser — quello che succede su un processore conteso — rispettando `clearInterval` come farebbe il browser. Giudica, fino al 30':
libro mastro voce per voce e, per ogni scena, estrazioni e minuto del motore all'ingresso in `giocaScena`.
- Verde: 2 coppie provocate + 1 a tempo reale, 0 divergenze; coppia senza scene, non arrivata al 30', con errori di pagina o con la
  provocazione non ingaggiata (meno di 50 battute doppie) = non giudicata = rosso.
- Rosso (`__CPM_NO_G264`): fino a 2 coppie provocate, almeno una divergenza (misurato: la prima, voce 15 al 6').
- Parte statica: un solo `_batt264`, usato dall'intervallo quando il rosso è assente.
Durata 7 min 30 s. Registrato in `ci-runner.mjs`: catena `completa`, mappa di `src/15` (la prima riga, quella che la mirata legge, e le due con `solo-highlight-166`), lenti; `node --check` ok.
`solo-highlight-166`: la parte statica (caso 1) ora pretende l'intervallo scritto con `_batt264` (più stretta di prima, non più larga).

## 6 — Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

**Guardiani della consegna** (tutti sul build finale, `cf91892` per il file di gioco):

| controllo | esito |
|---|---|
| `battito-264` (nuovo) | ✅ verde 0 divergenti su 3 coppie (2 provocate, 300+ battute doppie ciascuna) · rosso `__CPM_NO_G264` cade alla prima coppia (voce 15, 6') · 7 min 28 s |
| `solo-highlight-166` × 3 di fila | ✅ ✅ ✅ verde intero, tutti i casi (10: 244/244 voci, 3-1 = 3-1 · 11 · 12 · 12b con la sorpresa chiesta in entrambe e uguale · 13) · rosso `__CPM_NO_G166` cade su 3, 7, 8 ogni volta · ~15 min l'una |
| `salienti-229` | ✅ verde · rosso cade |
| `salienti-246` | ✅ verde · rosso cade su ogni percorso (17 min 30 s) |
| `gol-eroe-154` | ✅ verde 10/10 partite valide, gol e assist dell'eroe in gioco fluido 0, 0,80 gol registrati a partita (fascia 0,2–1,2) · rosso `__CPM_NO_G154` 7 gol fluidi (67 min in sequenza) |
| `momento-165` | ✅ 33 verdi, 0 rossi |
| `rigorista-257` | ✅ verde e il rosso si vede |
| `patto-238` | ✅ verde e il rosso si vede |
| `test:logic` | ✅ 51 su 51 |
| `save-compat` | ✅ 12 pass · 0 fail |

`node tools/build-src.mjs` + `node tools/check-src.mjs` dopo ogni modifica a `src/` (allineato); `node --check` su `ci-runner.mjs`.
`highlight-95`, `ingresso-206`, `career-critical` non eseguiti (verifica di rilascio).

**Mappa mirata di `src/15`** (la riga che la mirata legge davvero è la prima delle righe `src/15` di `ci-runner.mjs`: 71 guardiani; più il
nucleo). In sequenza, tetto di 20 minuti a guardiano. Eseguiti 34 su 73 (i 71 della riga meno `salienti-229`, già nella consegna, più `design-system`, `tema-unico`, `typing-shortcuts` del nucleo) in tre blocchi (circa cinque ore di banco); gli altri sono elencati come **non eseguiti**.

| | quanti | quali |
|---|---|---|
| ✅ verdi | 24 | design-system · tema-unico · typing-shortcuts · coerenza-235 · accessibilita-234 · rassegna-232 · salienti-243 · barra-221 · rigore-191 · partita-vera · minuti-202 · ripresa-202 · recupero-202 · tetto-202 · tempo-138 · ripartenza-207 · piazzato-204 · pressing-143 · conduci-242 · attesa-241 · intro-292 · fps-249 · nomi-182 · carriera3-94 |
| ❌ rossi (tutti preesistenti, tabella sotto) | 6 | tabellone-214 · rassegna-200 · partita-v2 · finale-202 · ripartenza-235 · lotteria-191 |
| ⏱ oltre il tetto di 20 minuti (non giudicati) | 4 | interazioni-226 · scene-221 · assist-298 · parata-100 |
| non eseguiti | 39 | highlight-95 · riserva-103 · riserva-104 · contatto-103 · assist-nome-98 · chiusura-99 · esiti-96 · partita2d-297 · colori-286 · pc-tablet-292 · cori-291 · ingresso-285 · rigore-79 · voto-79 · corpi-073 · pagella-75 · pallino-278 · pillola-58 · esito-280 · tabellino-lati · stat-279 · ingresso-277 · esiti-218 · lessico-218 · cross-218 · tabellino-228 · intervista-231 · validate-situations · schede-234 · catalogo-022 · giornale-244 · schede-246 · schede-259 · difesa-220-giro31 · esiti-241 · spot-266 · schede-260 · tecnica-045 · esiti-60 |

Dei non eseguiti: `highlight-95` è escluso dalla consegna; `validate-situations` non l'ho eseguito (è il gate: CLAUDE.md lo dà a circa 25 minuti, oltre il tetto; verifica di rilascio);
gli altri 37 non sono stati eseguiti **per tempo**, non per scelta di merito. Ordine di esecuzione: prima i guardiani che esercitano il
cronometro e la ripresa della partita vera (`partita-vera`, i `-202`, `tempo-138`, le ripartenze), poi il resto nell'ordine della riga.

I rossi incontrati sono stati tutti ripetuti sul file di gioco della base (`origin/lavoro/197`, messo al posto di quello del giro e poi
ripristinato) o ricondotti a un file che il giro non tocca:

| rosso nella mappa | sul giro 264 | sulla base `lavoro/197` | conclusione |
|---|---|---|---|
| `tabellone-214` | braccio verde D (rigori in trasferta: ordine delle squadre nel tabellone) e rosso E | rosso anche lì (verdi A, B, D e rosso E) | preesistente |
| `rassegna-200` | «partita intera non finita» entro 420 s (telefono a densità 2, velocità 2) | — misurato con `sonda-264t`: la stessa partita dura **560 s col rosso `__CPM_NO_G264` e 556 s senza** | preesistente: è il banco che non regge 420 s, non il giro |
| `partita-v2` | «FORMA …:post: manca il tasto finale» (3 formati) | identico | preesistente |
| `finale-202` | statico, 0 s: «ancora della simulazione non trovata» in `src/14` | `src/14` non è toccato dal giro | preesistente |
| `ripartenza-235` | parte delegata `ripartenza-piazzato-27`: «rigore verde: nessuna battuta dopo il gol: misura cieca» | identico | preesistente |
| `lotteria-191` | verde PC: «sguardo ≤ 15° 5/6, non giudicati 1» (ripetuto una volta: 4/6, non giudicati 2) | identico (5/6, non giudicati 1) | preesistente |
| `interazioni-226` · `scene-221` · `assist-298` · `parata-100` | fermati dal tetto dei 20 minuti | — | non giudicati (oltre 20 minuti: verifica di rilascio) |

Foto rigenerate dai guardiani in `docs/` rimesse con `git checkout --` e non committate.

## Dubbi per il PO

1. **Scelta fra i due tentativi.** Ho spedito il secondo (flushSync sul solo battito del minuto). Regge su un presupposto che ho
   controllato leggendo il codice ma che nessun guardiano protegge: **solo il battito del minuto cambia fase**. Se un giorno un
   sotto-passo aprisse una scena o fischiasse, la gara tornerebbe; `battito-264` la vedrebbe (provoca la doppia battuta su tutte le
   battute), ma solo se quel sotto-passo capita entro il 30' della partita di prova. Il primo tentativo (tutte le battute in flushSync)
   non ha questo presupposto e costa 3,1 ms a battuta sul banco invece di 0,46. Il costo su un telefono vero non l'ho misurato: non
   posso confermare quale dei due convenga lì.
2. **Altre precedenze a tempo reale non toccate.** La correzione chiude la gara fra il battito e l'apertura della scena. Restano
   legati all'orologio da polso, per come sono scritti: quanti sotto-passi dell'intervallo arrivano prima che React esegua gli
   aggiornatori in coda (`setMatchPlayers`, che scrive `matchPlayersRef` dentro l'aggiornatore) e il pagamento dei passi mancanti al
   battito (cicli 161/967/175, che già lo compensano). Su 20 corse al 12', 3 coppie al 30', 3 + 2 partite complete a 1x e 6 a 2x non
   hanno prodotto divergenze; non è una prova che non ne esistano altre più rare.
3. **Le tre velocità.** Per lo stesso motivo prima del giro la partita a 2x era quasi sempre un'altra partita rispetto ai soli
   highlight (17 su 20). Dopo, 6 partite a 2x su 6 coincidono coi soli highlight. Non ho misurato 1,5x né eseguito `match-sequence` /
   `match-speed` (non sono nella consegna né nella riga della mappa).
4. **I salvataggi e la «stessa partita».** Nessun campo salvato cambia. Cambia però l'esito che una data partita intera produce:
   prima era uno dei tanti possibili secondo il carico del dispositivo, ora è quello dei soli highlight. Le medie su 20 partite non
   si spostano in modo misurabile (sezione 4), ma con 20 partite non si vedono differenze sotto il mezzo gol a partita.
5. **Rossi preesistenti nella mappa di `src/15`** (tabella della sezione 6): `tabellone-214`, `rassegna-200`, `partita-v2`,
   `finale-202`, `ripartenza-235`, `lotteria-191` sono rossi anche sulla base; `interazioni-226`, `scene-221`, `assist-298`, `parata-100`
   superano i 20 minuti in sequenza su questo banco. **37 guardiani della riga non sono stati eseguiti per tempo** (elenco in sezione 6): se la
   verifica di rilascio non li copre, vanno eseguiti prima di unire. La mirata di chiunque tocchi
   `src/15` li vedrà rossi finché qualcuno non li ripara. In particolare `rassegna-200` ha un tetto di 420 s che la sua partita
   (telefono, densità 2, velocità 2) oggi supera di oltre due minuti sul banco, e `ripartenza-piazzato-27` chiede all'eroe un rigore
   che dal giro 257 l'eroe senza premio non tira più (ipotesi mia sul motivo: non l'ho misurata).
6. **Il banco è più lento del nominale.** L'intervallo reale fra due battute è 95–135 ms contro i 77 nominali (in tutti i bracci,
   anche col rosso): la partita intera di «Collaudo Salienti» dura ~300 s contro i ~195 dei rapporti del giro 166. Non dipende dal
   giro 264 (stesso passo coi tre bracci); non so dire da quando né perché.
7. **`ci-runner.mjs`: le righe di `src/15` nella mappa sono 13**, e la mirata legge solo la prima (`MAPPA.find`). Ho aggiunto
   `battito-264` alla prima e alle due che contengono `solo-highlight-166`; `solo-highlight-166` stesso **non è nella prima riga**,
   quindi oggi la mirata di `src/15` non lo esegue. Non ho riordinato le righe (fuori consegna).
8. **Due nomi di prova che non aprono la partita** («Statistica 20», «Statistica 21»: bottone non trovato in 10 s, con e senza il
   rosso). Non indagato; può essere un limite della sonda o del salvataggio sintetico con quei nomi.
9. **Durante il lavoro** ho lanciato per errore `node ci-runner.mjs mirata lavoro/197` credendo che elencasse soltanto: esegue. L'ho
   fermato dopo meno di due minuti; non ha lasciato file modificati (controllato con `git status`). Per fermare i processi di Chrome
   rimasti dopo uno stop ho usato due volte `pkill -x chrome` (nome esatto, non `-f`).
10. **Roadmap**: non aggiornata (giro di sviluppo, nessuna versione spedita): la riga la scrive chi unisce e rilascia.
