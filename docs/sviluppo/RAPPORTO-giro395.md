# Rapporto del giro 395 — attese fisse prima di leggere il salvataggio (PO-532)

Base: `lavoro/201` a `872aba4`. Ramo di consegna: `sviluppo/giro395-attese`. Giro di **controlli**: il gioco non è toccato
(nessun file di `src/`, nessun `CARRIER-MANAGER-AV.html`, `GAME_VERSION` invariata, `docs/governo` non toccato).

Voce PO-532 (dubbio 2 del giro 273): alcuni controlli leggono il salvataggio `cpm-v3` dopo un'attesa fissa invece di aspettare
l'evento. Regola 4 di `docs/governo/PROCESSO.md` («Controlli instabili»): si attende un evento, mai un tempo fisso.

## 1. Censimento

Strumento: il rilevatore `censisciAttese395` in `tests/visual/lib/attese-395.mjs`, che si può lanciare con
`CPM_CENSIMENTO=1 npm run attese-395`. Conta come attesa fissa prima di una lettura del salvataggio:

- una riga che legge `localStorage.getItem('cpm-v3')`, oppure che chiama un aiutante del file che lo legge;
- un `sleep(N)` o un `waitForTimeout(N)`, con N scritto in cifre, sulla stessa riga prima della lettura o nelle due righe di
  codice precedenti;
- l'attesa non è il passo di un ciclo d'attesa, e fra attesa e lettura non c'è un `waitForFunction`, un ciclo o un
  `attendiSalvataggio395`.

I commenti si tolgono prima di cercare. È un'euristica a righe (vedi dubbio 4).

**Base `872aba4`: 66 attese in 33 file di `tests/visual`.** Ventidue di quei file sono guardiani che stanno in una catena o
nella MAPPA. Gli altri sono sonde o test fuori dal treno. Qui sotto i file che contano per PO-532: i controlli di carriera che
leggono il salvataggio dopo un'azione di carriera. La colonna «aspettava» dice che cosa l'attesa fissa sperava di trovare.

| file:riga (attesa → lettura) | attesa | aspettava | esito |
|---|---|---|---|
| `infortunio-263.mjs:100→101` | `sleep(500)` | «Vivi la settimana» (step) scritto nel salvataggio, letto come `prima` | **riparato** |
| `investimento-223.mjs:72→74` | `sleep(900)` | puntata (clic sul tasto dell'impulso) salvata, `s1` | **riparato** |
| `investimento-223.mjs:80→82` | `sleep(250)` | fine stagione dopo l'ultimo step, `s2` | **riparato** |
| `investimento-223.mjs:87→88` | `sleep(1500)` | rollover di `startNewSeason` salvato, `s3` | **riparato** |
| `investimento-223.mjs:109→110` | `sleep(250)` | fine stagione (salvataggio «in volo»), `s2` | **riparato** |
| `investimento-223.mjs:111→112` | `sleep(5000)` | rollover salvato (e l'avviso a 3 s, solo stampato), `s3` | **riparato** |
| `meta-conto-265.mjs:57→59` | `sleep(900)` | puntata di metà conto salvata, `s1` | **riparato** |
| `svincolato-264.mjs:82→84` | `sleep(600)` | gara iniettata con `patch` salvata, `prima` | **riparato** |
| `svincolato-264.mjs:91→92` | `sleep(900)` | settimana simulata salvata, `dopo` | **riparato** |
| `simulata-272.mjs:39→41` | `sleep(1500)`+`sleep(900)` | settimana simulata salvata, poi la dashboard | **riparato** |
| `rinnovo-270.mjs:43→44`, `67→68` | `sleep(800)` | firma del rinnovo salvata | **riparato** |
| `rinnovo-270.mjs:45→46`, `69→70` | `sleep(1500)` | stagione nuova salvata | **riparato** |
| `euro-attesa-181-test.mjs:30→31` | `sleep(700)` | passo di carriera salvato (settimana, fase dell'Europeo) | **riparato** |
| `classifica-194.mjs:41→43` | `sleep(1500)` | giornata 34 salvata (copia viva + `CPM_DUMP`) | **non toccato**: rosso sulla base, vedi dubbio 2 |
| `squalifica-222.mjs` | — | già riparato nel giro 273 (ciclo sull'allineamento) | non toccato |
| `infortunio-263.mjs:115` | `sleep(900)` + ciclo del giro 270 | simulazione salvata | **riparato** (il ciclo resta, con la funzione condivisa) |

Dopo il giro restano **51 attese in 26 file**, tutte fuori dai sette controlli toccati. L'elenco completo lo stampa
`CPM_CENSIMENTO=1 npm run attese-395`. Fra i guardiani del treno: `anteprima-230`, `assist-nome-98`, `avviso3d-209`,
`calendario-nazionale`, `rassegna-200/202/224`, `presentazione-214`, `salienti-229`, `simula-215`, `spogliatoio-182`,
`stat-279`, `testata-209` e `classifica-194`. Gran parte di questi legge il salvataggio dopo un'attesa di **scena** (la
partita o una cerimonia), non dopo un'azione di carriera (dubbio 1).

## 2. La funzione condivisa: `tests/visual/lib/attese-395.mjs`

La funzione aspetta l'evento vero, misurato dalla sonda e senza toccare il gioco.

1. **Salvataggio allineato.** Il giocatore scritto in `cpm-v3` è identico, come JSON intero, a `__CPM_CAREER.snapshot()`.
   `storage.save` (src/08) scrive `d.player` così com'è, quindi le due stringhe coincidono solo quando nessun cambio aspetta
   ancora il suo salvataggio. La funzione confronta l'intero giocatore: il giro 270 confrontava quattro campi, il 273 otto.
2. **Dopo l'azione** (opzione `dopo`). Dopo il conteggio fatto prima dell'azione deve esserci almeno una scrittura di `cpm-v3`.
   Le scritture si contano avvolgendo `Storage.prototype.setItem` nella pagina; il gioco non viene toccato.
3. **Fermo.** Nessuna scrittura da 700 ms. 700 è il debounce dell'autosave di src/18 (600 ms, che il guardiano legge dal
   sorgente) più un margine. Così un cambio che parte un istante dopo l'allineamento non va perso: è il caso della copia delle
   finestre aperte, giro 201/270.
4. **Tetto** di 15 s, solo per non restare appesi. Se scade, la lettura è «non giudicata». La funzione stampa il motivo e
   l'ultimo stato visto. All'uscita stampa per ultima la riga `❌ non giudicato (attese-395)` e forza il codice 1, qualunque
   cosa il controllo abbia stampato prima (regole 1 e 7).

`CPM_T395=1` stampa all'uscita quanto sono durate le attese riuscite. È solo uno strumento di misura: con il flag acceso il
riepilogo esce dopo il verdetto del controllo.

Quando si usa `dopo`: solo se la lettura segue subito un'azione che **cambia** il giocatore. Una misura lo ha mostrato. Nella
prima stesura investimento-223 pretendeva una scrittura dopo l'ultimo passo della stagione, e quel passo («seasonEnd») a volte
non cambia nulla: **2 corse su 3 «non giudicate»**. Lì il passo è già seguito da 250 ms, la copia viva è quella nuova e basta
«allineato e fermo». Allo stesso modo:

- in meta-conto-265, con il tasto spento (saldo basso) non si aspetta nessuna scrittura;
- in euro-attesa-181, un passo `blocked:…` (il braccio rosso) non si aspetta nessuna scrittura.

## 3. Prima / dopo (durata e stabilità)

Banco: sessione cloud, 4 core, una corsa alla volta. Il prima gira sulla base (worktree a `872aba4`), il dopo su questo ramo.
N = 3 corse per controllo, braccio verde. Per investimento-223 il dopo sono le 3 corse dopo la correzione dell'ultimo passo.
Durata in secondi di parete.

| controllo | prima: durate | mediana | verdi | dopo: durate | mediana | verdi |
|---|---|---|---|---|---|---|
| infortunio-263 | 93,8 · 81,0 · 113,4 | 93,8 | 3/3 | 124,6 · 97,8 · 96,2 | 97,8 | 3/3 |
| investimento-223 | 156,1 · 134,5 · 137,0 | 137,0 | 3/3 | 139,5 · 153,5 · 150,6 | 150,6 | 3/3 |
| meta-conto-265 | 27,4 · 25,3 · 26,4 | 26,4 | 3/3 | 28,9 · 28,8 · 28,4 | 28,8 | 3/3 |
| svincolato-264 | 62,6 · 60,0 · 60,9 | 60,9 | 3/3 | 68,3 · 65,7 · 64,3 | 65,7 | 3/3 |
| simulata-272 | 8,0 · 7,9 · 8,1 | 8,0 | 3/3 | 12,0 · 12,3 · 12,0 | 12,0 | 3/3 |
| rinnovo-270 | 30,8 · 30,6 · 30,8 | 30,8 | 3/3 | 32,9 · 33,4 · 32,5 | 32,9 | 3/3 |
| euro-attesa-181 | 8,8 · 9,7 · 9,5 | 9,5 | 3/3 | 12,9 · 16,4 · 12,8 | 12,9 | 3/3 |
| *(riferimento)* squalifica-222 | 54,8 · 52,5 · 57,0 | 54,8 | 3/3 | non toccato | — | — |
| *(fuori ambito)* classifica-194 | 497 · 499,6 · 499 | 499 | **0/3** | non toccato | — | — |

- **Durata.** Ogni controllo toccato dura di più, da +2 a +14 s per corsa (mediana). È il prezzo della quiete di 700 ms per
  ogni lettura: una lettura ora finisce quando il salvataggio è fermo, non quando scade un tempo scelto a mano. Le attese
  riuscite di investimento-223 (`CPM_T395=1`, 33 per corsa) hanno una mediana di 1208–1248 ms e un massimo di 1470–1891 ms. Il
  massimo è sempre sul rollover di `startNewSeason`.
- **Stabilità.** 3/3 verdi prima e dopo per tutti e sette. **Tre corse non dimostrano che il controllo sia diventato più
  stabile.** Il difetto che PO-532 cerca usciva circa 3 volte su 10 (infortunio-263, giro 270), e 3 corse non bastano a
  vederlo. Questo giro dimostra un'altra cosa: nessuna regressione, e la lettura ora dipende dall'evento e non dal tempo.
- **Bracci rossi** (1 corsa per braccio, base e ramo): stesso esito e stesso numero di controlli falliti.
  - infortunio-263 `CPM_ROSSO=1`: 11 falliti
  - investimento-223: 13 falliti
  - meta-conto-265: 7 falliti
  - svincolato-264: 3 falliti
  - simulata-272: rosso
  - rinnovo-270 `CPM_ROSSO=1` e `=b`: rosso
  - `euro-attesa-181:rosso`: «ROSSO come atteso»

  Nessun braccio rosso è finito «non giudicato»: la funzione non ha nascosto né cambiato i rossi veri.

## 4. Guardiano `npm run attese-395` (statico, ~0,2 s)

È nella riga della MAPPA che esisteva già per `src/18-|src/10-`: la stessa di infortunio-263 e squalifica-222, e il guardiano
legge il debounce da src/18. Lo script npm nomina anche la lib e la fotografia, così il trenino (regola f di
`tools/trenino-317.mjs`) li assegna al guardiano. Misurato con `node tools/trenino-317.mjs scegli`: **trenino** di 28
guardiani, nessun file scoperto, nessun treno completo.

- **Verde.** Lo vede così:
  - A: nessuna attesa fissa prima di una lettura del salvataggio nei 7 controlli toccati;
  - B: ognuno importa la lib e chiama `attendiSalvataggio395`;
  - C: la lib forza il codice 1 con «non giudicato» stampato per ultimo, e la quiete supera il debounce letto da src/18;
  - D: il rilevatore non è cieco e sulla fotografia del prima ritrova 15 attese su 15.
- **Rosso** `CPM_NO_G395=1`. A si giudica sull'elenco di prima, cioè su `fixtures/attese-395-prima.json`: le righe dei
  controlli toccati come erano a `872aba4`, solo gli intorni. Esce 1 con 7 difetti e il motivo stampato per ultimo.

Verifica: `node ci-runner.mjs giro attese-395` (il guardiano più le 17 sentinelle). L'esito è nella sezione 7.

## 5. File toccati

- **nuovo** `tests/visual/lib/attese-395.mjs`: `contaSalvataggi395`, `armaSalvataggi395`, `attendiSalvataggio395`,
  `censisciAttese395`, `senzaCommenti395`, `NON_GIUDICATI_395`, `TEMPI_395`.
- **nuovo** `tests/visual/attese-395.mjs`: il guardiano.
- **nuovo** `tests/visual/fixtures/attese-395-prima.json`: la fotografia del prima.
- `tests/visual/package.json`: lo script `attese-395`.
- `tests/visual/ci-runner.mjs`: `'attese-395'` nella riga `src/18-|src/10-` della MAPPA.
- I sette controlli: solo le attese prima delle letture e l'import.
  - `infortunio-263.mjs`: il corpo di `braccio()`.
  - `investimento-223.mjs`: il flusso A e il blocco A2.
  - `meta-conto-265.mjs`: il ciclo dei saldi.
  - `svincolato-264.mjs`: `braccio()`.
  - `simulata-272.mjs`: il flusso dopo il clic su «Simula».
  - `rinnovo-270.mjs`: i due percorsi.
  - `euro-attesa-181-test.mjs`: il ciclo dei passi.
- `docs/sviluppo/RAPPORTO-giro395.md`: questo rapporto.

Fuori ambito e non toccati: il gioco, `docs/governo` (ci-runner aggiorna `STABILITA.json` e il giro l'ha rimesso com'era), le
opzioni di Chromium (giro 394), la velocità dei controlli lunghi (giro 392), il ricevente del passaggio (giro 390).

## 6. Dubbi per il PO

Per ogni dubbio la prima opzione è quella consigliata ed è **già applicata**.

1. **Quanto allargare la riparazione?** Restano 51 attese in 26 file.
   - **a) (applicata)** Solo i controlli di carriera che leggono il salvataggio dopo un'azione di carriera, cioè la classe di
     PO-532 (7 file, 15 attese). Gli altri leggono quasi tutti dopo una partita o una cerimonia, dove l'evento giusto è la
     fase (`__CPM_PHASE`) e non il salvataggio. Mescolare le due cose porterebbe a regole sbagliate.
   - b) Un giro successivo per i 13 guardiani del treno rimasti (anteprima-230, avviso3d-209, rassegna-*, simula-215,
     testata-209, …), con la stessa lib più un'attesa di fase.
   - c) Tutti i 26 file, sonde e test fuori dal treno compresi (`save-monotonic`, `recovery-competition`, …).
2. **classifica-194 è rosso 3 su 3 sulla base**, ~500 s a corsa: «la giornata 34 non risulta giocata (settimana 38,
   playMatch true, fase playing)». La partita non arriva a `ended` entro il tetto di 400 s. Non c'entra con le attese: la
   lettura viene dopo.
   - **a) (applicata)** Non l'ho toccato (No Blind Fix): la riga dopo la partita non si raggiunge, quindi una modifica non si
     può misurare. Resta nel censimento.
   - b) Toccarlo lo stesso, perché la modifica è uguale alle altre.
   - c) Passarlo al giro 392 (controlli lunghi) e riaprire qui la lettura dopo il suo verde.
3. **Quiete di 700 ms.** Costa da +2 a +14 s per controllo.
   - **a) (applicata)** 700 ms: il debounce di src/18 più un margine, con il guardiano che fallisce se il debounce supera la
     quiete.
   - b) Nessuna quiete: basta l'allineamento più la scrittura dopo l'azione. Più veloce, ma perde il secondo cambio
     ritardato del giro 270.
   - c) Un segnale «salvato» esposto dal gioco sotto `?cpmtest=1`. È l'evento più pulito, ma tocca il gioco e questo giro non
     poteva farlo.
4. **Fin dove guarda il guardiano?**
   - **a) (applicata)** Solo i 7 controlli toccati, con il censimento del resto stampato a richiesta.
   - b) Tutta la cartella, con un elenco dichiarato dei residui che può solo scendere.
   - c) Tutta la cartella a zero. Oggi sarebbe rosso.

   C'è anche un limite: il rilevatore lavora a righe. Non vede un'attesa lontana più di due righe dalla lettura, né letture
   indirette fra più file.
5. **Letture senza nessuna attesa.** Esempio: in squalifica-222 il `prima` si legge subito dopo una `patch`, senza aspettare
   il salvataggio. Non è un'attesa fissa e il rilevatore non la conta, ma è la stessa fragilità.
   - **a) (applicata)** Fuori da questo giro, dichiarata qui.
   - b) Estendere il rilevatore alle letture che seguono un'azione (`patch`/`step`/clic) senza attesa.
   - c) Rendere obbligatoria `attendiSalvataggio395` prima di ogni lettura di `cpm-v3` nei guardiani di carriera.
6. **Una riga in `CLAUDE.md`.** Se la regola «un controllo che legge il salvataggio passa da `attendiSalvataggio395`» vada
   scritta fra gli invarianti.
   - **a) (applicata)** Non scritta: altri giri in parallelo toccano `CLAUDE.md` e la regola è già nella lib e nel guardiano.
   - b) Una riga in `CLAUDE.md` alla promozione.
   - c) Una riga in `docs/governo/PROCESSO.md`, regola 4, scritta dalla sessione di governo.

## 7. Esito della verifica

`node ci-runner.mjs giro attese-395` sul ramo (build 7.999.215): **18/18 verdi**, nessun passo ripetuto. Sono il guardiano più
le 17 sentinelle, con le durate di parete in secondi:

- attese-395 0
- mappa-unica 0
- test:logic 3
- save-compat 1
- replay 52
- migrazione-194 26
- design-system 1
- tema-unico 14
- griglia-mobile 186
- render-3d-023 36
- tunnel-285 194
- home-298 120
- web-237 54
- career-critical 360
- battito-264 378
- partita-vera 658
- gk-dive-sync 176
- schermate-97 120

Dopo la corsa ho rimesso com'erano i file che la catena riscrive: `docs/governo/STABILITA.json` e le foto di
`docs/collaudo-grafico/g0`. Il giro non li consegna. I sette controlli toccati e i loro bracci rossi li giudica il trenino del
treno (consegna rapida, decisione PO 26/11). Le misure di questo giro sono nella sezione 3.
