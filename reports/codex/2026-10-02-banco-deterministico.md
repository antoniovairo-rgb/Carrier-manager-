# Banco deterministico e carriere — CPM 7.999.105

Base verificata: `b2094979df9c6fdce4bc8c62b836cde43fac8eef`, `GAME_VERSION="7.999.105"`. Ramo `codex/2026-10-02-banco-deterministico`. Solo sonde e rapporti esterni; nessun file del gioco modificato.

## A. Difesa 3D

La sonda `tests/codex/banco-difesa-3d.mjs` applica l'orologio virtuale, il seme per scena e la risoluzione dopo tre letture ferme trascritti da `tests/visual/inquadratura-185.mjs`. Prevede le 16 scene, i due esiti, entrambi i corpi e due prove identiche per gi33, 133, 45 e 24. Registra `__CPM_FRAME480`, `ActionResolved`, sei scatti per il primo giro e ogni tentativo scartato in `tests/codex/banco-difesa-3d.json`.

**Esecuzione parziale.** Il grezzo `tests/codex/banco-difesa-3d.json.gz` contiene 92 tentativi: 7 validi (6 combinazioni scena/esito/rappresentazione), 64 respinti dalla soglia di memoria, 9 senza assestamento entro 25 s virtuali, 8 senza `ActionResolved` concorde, 2 passati a `hl_result` prima della risoluzione e 2 con meno di 5 letture. Conteggio riproducibile dopo decompressione: `node -e "const d=require('./tests/codex/banco-difesa-3d.json');const c={};for(const x of d.cases)c[x.rejected||'valido']=(c[x.rejected||'valido']||0)+1;console.log(c)"`. I 13 PNG della prova gi33 precedente restano scatti di tentativi scartati, senza codici attribuiti.

Con memoria libera sopra 5 GB, il criterio originario dei tre fotogrammi fermi ha prodotto su gi45 29 letture ma `phaseBefore:'hl_result'`, `ActionResolved:null`: **caso scartato**. Il pallone continua a oscillare durante `hl_choose` e si ferma solo dopo il cambio di fase. Il criterio alternativo `CPM_SETTLE_MODE=moved` risolve al primo fotogramma in cui il pallone lascia il punto precedente alla forzatura, mentre la fase è ancora `hl_choose`; convalida `ActionResolved` ed esito. La prova con `CPM_SETTLE_MODE=timed` a 400 ms ha convalidato l'esito ma il pallone era ancora a `50,50` e ha prodotto una sola lettura: scartata. Il guardiano originale `tests/visual/inquadratura-185.mjs` riporta quote di quadro ma non richiede `ActionResolved`; le sue percentuali, da sole, non convalidano l'esito richiesto. Questa è una limitazione verificata del protocollo di prova, non una prova di difetto del gioco.

| Caso valido con `moved` | Letture `n` | Eroe fuori | Pallone fuori | Prime 12: pallone fuori |
| --- | ---: | ---: | ---: | ---: |
| gi45 success procedurale r0 | 5 | 1 | 1 | 1/5 |
| gi45 success GLB r0 | 80 | 0 | 9 | 9/12 |
| gi33 success procedurale r1 | 30 | 1 | 0 | 0/12 |
| gi33 success GLB r0 | 27 | 1 | 1 | 1/12 |
| gi33 success GLB r1 | 24 | 1 | 1 | 1/12 |
| gi33 fail procedurale r0 | 5 | 1 | 1 | 1/5 |
| gi33 fail GLB r0 | 26 | 1 | 11 | 1/12 |

Comando dei casi validi: `$env:CPM_SETTLE_MODE='moved'; $env:CPM_NO_SHOTS='1'; $env:CPM_SCENES='33,45'; node tests/codex/banco-difesa-3d.mjs`. Per i sei scatti GLB di gi45 success, lo stesso comando con `$env:CPM_MODE='1'; $env:CPM_OUTCOME='success'; $env:CPM_REPEAT='1'` e `CPM_NO_SHOTS` rimosso. Le foto `gi45-success-glb-r0-01-apertura.png` e `04-contatto.png` mostrano rispettivamente l'eroe nel quadro e il corpo che intercetta il pallone; il pallone è fuori quadro in 9 delle prime 12 letture numeriche, ma lo scatto 01 lo mostra sul lato sinistro. **Non attribuisco ancora 001/002/003:** manca una valutazione visiva di tutti i casi, e `n=5` è un campione minimo. Il secondo giro GLB gi33 success conferma 1 fotogramma con eroe e pallone fuori, ma cambia la durata campionata (27 contro 24): il nuovo criterio non ha ancora una prova completa di ripetibilità. Restano 58 combinazioni scena/esito/rappresentazione e le ripetizioni richieste. Dopo il lotto la memoria è scesa sotto 3,5 GB; la sonda si è fermata senza aprire altre pagine. Il checkpoint conserva gli scarti e i casi validi.

**Correzione dell'orologio del banco:** nell'override locale di `requestAnimationFrame` la versione usata per i sette casi incrementava il tempo virtuale a ogni *callback*. Più callback nello stesso fotogramma potevano quindi far avanzare l'orologio più di 33,33 ms. La sonda è stata aggiornata per incrementarlo una sola volta per timestamp nativo di fotogramma e marca i nuovi tentativi `clockMode:'one-tick-per-browser-frame'`, senza confonderli con i sette precedenti. La definizione dei contatori `fuori`, `bfuori` e `abfuori` è verificata in `src/12-three-match-view.jsx:10464-10476`.

### Ripresa con orologio per fotogramma

Il checkpoint ora contiene **101 tentativi**, di cui **5 validi con il nuovo orologio**; altri 7 validi appartengono al vecchio orologio e non sono combinati nelle percentuali. Comando usato: `$env:CPM_SCENES='45'; $env:CPM_MODE='1'; $env:CPM_OUTCOME='success'; $env:CPM_SETTLE_MODE='moved'; $env:CPM_NO_SHOTS='1'; node tests/codex/banco-difesa-3d.mjs`; poi lo stesso comando con `CPM_OUTCOME='fail'`. La sonda ha ora una guardia che attende di vedere `hl_choose` prima di considerare conclusa la schermata di scelta; questa ha eliminato uno scarto dovuto alla lettura della fase precedente nel primo fotogramma. L'attesa GLB è salita da 15 a 30 s dopo un tentativo scartato con `__CPM_MXCLIP<=0`.

| gi45 GLB, stesso seme 57345 | Modalità avvio | Letture | Eroe fuori | Pallone fuori | Palla al via (x,y logici) |
| --- | --- | ---: | ---: | ---: | --- |
| success r0 | `moved` | 22 | 0 | 0 | 24,75; 59,14 |
| success r1 | `moved` | 22 | 0 | 0 | 24,77; 59,29 |
| fail r0 | `moved` | 22 | 4 | 12 | 49,47; 53,55 |
| fail r1 | `moved` | 17 | 4 | 4 | 24,73; 59,40 |
| fail r0 | `mounted-500ms` | 25 | 0 | 11 | 49,92; 55,67 |

I due giri success hanno gli stessi conteggi, ma il metodo non è ancora ripetibile sugli esiti fail: la differenza del punto di partenza è circa 25 unità sull'asse x e cambia il conteggio fuori quadro. Aspettare 500 ms virtuali non garantisce che il commit di staging del gioco sia arrivato. Il codice del gioco descrive esplicitamente lo staging come commit React successivo (`src/15-live-match.jsx:1599-1605`, `src/12-three-match-view.jsx:3485-3498`): questa è una possibile spiegazione del rumore del banco, non una causa dimostrata per questi cinque casi. La sonda conserva ogni tentativo e non assegna 001/002/003 da dati non separabili. La modalità sperimentale `target-aligned`, che attende il bersaglio logico aggiornato e la mesh entro 2u, è stata aggiunta ma **non eseguita**: il controllo pre-avvio ha misurato 2,99 GB liberi, sotto 3,5 GB. I 64 casi richiesti restano aperti; la condizione di avvio deve essere verificata prima di estendere il campione.

### Ripresa del 3 ottobre: orologio verificato e sei scatti

Il comando `node tests/codex/orologio-300.mjs` ha prodotto `tests/codex/orologio-300.json`: 300 callback, 300 fotogrammi nativi, 300 passi virtuali, 10.000 ms virtuali. Il controllo dell'orologio è valido per questa esecuzione. Prima del lotto `node -e "console.log((require('os').freemem()/2**30).toFixed(2))"` indicava 4,44 GB liberi. È stata allineata anche la guardia interna della sonda alla soglia di 3,5 GB prima di ogni caso 3D; il lotto si è interrotto due volte alla soglia e ha conservato il checkpoint.

Comando del lotto, dalla radice: `$env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs`. I quattro casi qui sotto hanno `ActionResolved` concorde e sei scatti. Il banco fissa l'azione dopo 45 fotogrammi in `hl_choose`.

| gi33 success | Letture | Eroe fuori | Pallone fuori | Posizione logica del pallone alla risoluzione |
| --- | ---: | ---: | ---: | --- |
| Procedurale r0 | 114 | 0 | non registrato dal testimone | 9,73; 52,18 |
| Procedurale r1 | 97 | 0 | 80 | 58,48; 54,44 |
| GLB r0 | 119 | 16 | 99 | 50,20; 55,05 |
| GLB r1 | 101 | 7 | 84 | 51,48; 55,15 |

Le due ripetizioni procedurali partono con il pallone in posizioni molto diverse e la prima non espone `bfuori`; questo **non prova la ripetibilità** del banco né un difetto del gioco. Le due ripetizioni GLB mostrano anch'esse differenze nei conteggi. I PNG e il grezzo sono in `reports/codex/banco-difesa-3d/` e `tests/codex/banco-difesa-3d.json.gz`. Rimangono da acquisire gli altri casi e da valutare visivamente 001/002/003; nessun nuovo codice viene attribuito da questa serie parziale.

## B. Europeo del seme 6

La sonda `tests/codex/banco-europeo-181.mjs` riprende il banco carriere esterno con `__CPM_SIM_NAT=1`, forza il seme 6, registra i passi fra S8/W19 e W25 e conserva un checkpoint a fine stagione. Il primo avvio è stato interrotto dopo sei stagioni per liberare memoria; la seconda esecuzione dalla stagione 1 è arrivata oltre W24 senza blocco. Dal suo checkpoint S8/W1 sono state poi eseguite due prove appaiate con lo stesso salvataggio: una normale e una con `CPM_RED181=1`. La sonda non azzera il torneo quando compare `blocked:`: in tal caso avrebbe salvato il blocco come esito.

| Braccio appaiato | Flag letto in pagina | Passi del banco | Prima fase `group` | Stato a W24 | `blocked:euroMondiale` |
| --- | --- | ---: | --- | --- | --- |
| Normale | `false` | 56 | S8/W21 | `done` | 0 |
| Rosso `__CPM_NO181=1` | `true` | 56 | S8/W21 | `done` | 0 |

Comandi, dalla radice del repository (PowerShell):

```powershell
$env:CPM_RED181='0'; $env:CPM_RESUME181='tests/codex/banco-europeo-181-checkpoint-s8.json'; $env:CPM_TIME_LIMIT_MS='900000'; $env:CPM_OUTPUT='banco-europeo-181-verde-appaiato.json'; node tests/codex/banco-europeo-181.mjs
$env:CPM_RED181='1'; $env:CPM_RESUME181='tests/codex/banco-europeo-181-checkpoint-s8.json'; $env:CPM_TIME_LIMIT_MS='900000'; $env:CPM_OUTPUT='banco-europeo-181-rosso.json'; node tests/codex/banco-europeo-181.mjs
```

Grezzo: `tests/codex/banco-europeo-181-appaiato.json.gz`, percorso completo dalla stagione 1 in `tests/codex/banco-europeo-181-verde-full.json.gz`, checkpoint `tests/codex/banco-europeo-181-checkpoint-s8.json`. Il braccio rosso **non riproduce** il blocco atteso. In `src/18-career-app.jsx:3351` la simulazione della seconda qualificazione può passare direttamente a `phase:"group"` nella stessa W21; il guardiano di attesa a `:702` riguarda invece `phase:"qualificazioni"` con `qualDone=true`. Questa è una spiegazione coerente col codice e col tracciato, ma il percorso naturale senza `__CPM_SIM_NAT` è **non verificato**. Anche l'aspettativa «group alla W24» non è soddisfatta nel banco sintetico: a W24 il torneo è già `done`.

## C. Contratti del vecchio grezzo

Fonte: `tests/codex/carriere-fase1-sintetiche-a.json` sul ramo `codex/2026-10-01-carriere-fase1`, versione 7.999.94. Riproduzione offline: impostare `CPM_OLD_CAREERS` al percorso del grezzo e lanciare `node tests/codex/banco-contratti.mjs`; risultati in `tests/codex/banco-contratti-vecchi.json.gz`.

| Misura | Risultato verificato |
| --- | ---: |
| Osservazioni `contract` | 198 |
| Coppie distinte seme/stagione/settimana | 198 |
| Seme 3 | 41 (S6/W1, S10/W1–39, S11/W1) |
| Seme 15 | 157 (S6–9/W1–39, S10/W1) |

Per coppia seme/scadenza, le righe si raccolgono in tre gruppi: seme 3 con scadenza S5 (1 osservazione a S6/W1), seme 3 con scadenza S9 (40 osservazioni da S10/W1 a S11/W1), seme 15 con scadenza S5 (157 osservazioni da S6/W1 a S10/W1). Sono **gruppi del dato registrato**, non una prova che esistano esattamente tre oggetti contratto.

Tutte le osservazioni provengono dal ramo del vecchio banco che controllava `s.proStatus==='pro'` e `expiresAtSeason<s.season`. **Non sono 198 contratti diversi.** Le settimane distinte mostrano che la carriera avanzava anche mentre un contratto risultava scaduto. Il vecchio registratore deduplicava per seme/stagione/settimana/tipo: non permette di contare quante volte lo *stesso passo* sia stato ripetuto. La presenza di un'offerta pendente non era registrata per ogni settimana, quindi il campo è `null` nel grezzo nuovo e resta **non verificato**; non viene trasformato arbitrariamente in sì o no. Il ricontrollo di C sulla 7.999.105 è ancora da eseguire.

I rilievi sul gioco restano ipotesi finché il team non li riproduce con un proprio guardiano.

### Ripresa del 3 ottobre: scena 133 con corpi GLB

Comandi eseguiti dalla radice del repository, con memoria libera rispettivamente 4,62 e 4,72 GiB prima dei lotti:

```powershell
$env:CPM_SCENES='33'; $env:CPM_MODE='1'; $env:CPM_OUTCOME='fail'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs
$env:CPM_SCENES='133'; $env:CPM_MODE='1'; $env:CPM_OUTCOME='success'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs
$env:CPM_SCENES='133'; $env:CPM_MODE='1'; $env:CPM_OUTCOME='fail'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs
```

| Tentativo | Validità | Letture `FRAME480` | Eroe fuori | Pallone fuori | Sei foto |
| --- | --- | ---: | ---: | ---: | --- |
| gi33 fail GLB r0 | scartato: `hl_result` dopo 1 frame di scelta, prima dei 45 richiesti | non verificato | non verificato | non verificato | no, solo apertura |
| gi133 success GLB r0 | valido, `ActionResolved.ok=true` | 118 | 2 | 75 | sì |
| gi133 fail GLB r0 | valido, `ActionResolved.ok=false` | 105 | 14 | 98 | sì |

Fonte numerica: `tests/codex/banco-difesa-3d.json.gz`, ultime tre righe di `cases`. La quota `bfuori` è dunque 75/118 nel successo e 98/105 nel fallimento; è una misura del testimone, non una deduzione dalle sei foto. Nella foto `gi133-success-glb-r0-01-apertura.png` l'eroe si vede sopra la scheda, ma il pallone non si distingue. Nelle foto `gi133-success-glb-r0-04-contatto.png` e `gi133-fail-glb-r0-04-contatto.png` il pallone non è distinguibile e la camera mostra molto prato senza la linea di fondo annunciata dal titolo. La foto `gi133-fail-glb-r0-06-esito.png` mostra l'eroe parzialmente coperto dalla scheda; il testo «Supera e segna» concorda con `ActionResolved.ok=false` e con il tabellone 0–1, mentre il percorso visivo del pallone verso la rete non è verificato. La riproduzione del codice 002 sul pallone è una **segnalazione da verificare dal team**; 001 e 003 non vengono attribuiti da questo campione. Restano aperti gli altri casi e la prova di ripetibilità.

Lotto successivo: `$env:CPM_SCENES='134,138'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs`. Gi134 success GLB r0 è valido (`ActionResolved.ok=true`), con 98 letture, eroe fuori 0, pallone fuori 2 e sei foto. Nello scatto `gi134-success-glb-r0-04-contatto.png` il pallone è vicino al bordo destro e non appare vicino alla testa dell'eroe; `06-esito.png` mostra un pallone presso un altro giocatore, mentre il testo è «SALVATO! Che intervento!». Il fotogramma isolato non prova quale giocatore abbia effettuato il salvataggio: il codice 003 resta **non verificato**. Il caso fail della stessa scena è stato scartato **prima di aprire la pagina** perché la memoria libera era 2,77 GiB, inferiore alla guardia di 3,5 GiB; gi138 non è stato avviato. Il checkpoint conserva il caso valido e lo scarto. Nessun altro lotto 3D è stato avviato dopo questa guardia.

## Ripresa serale 02/10: orologio e 45 fotogrammi

È pronta una nuova serie distinta dai tentativi precedenti: `tests/codex/orologio-300.mjs` conta 300 callback `requestAnimationFrame`, i passi nativi e quelli virtuali; `tests/codex/banco-difesa-3d.mjs` con `CPM_NO_SHOTS=1` usa ora `settleMode: fixed-45-frames`, risolvendo solo in `hl_choose` dopo 45 fotogrammi osservati in quella fase. Ogni tentativo nuovo registra `chooseFrames`, l'eventuale fase cambiata, l'esito `ActionResolved`, i conteggi `FRAME480` e GLB sì/no. I vecchi tentativi restano nel grezzo con il loro `settleMode` e **non entrano nel verdetto della nuova serie**.

Comandi preparati dalla radice del repository:

```powershell
node tests/codex/orologio-300.mjs
$env:CPM_NO_SHOTS='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs
```

Al controllo prima dell'avvio erano liberi 2,61 GB (`node -e "console.log((require('os').freemem()/1073741824).toFixed(2))"`): sotto la soglia di 3,5 GB richiesta. **Orologio a 300 frame, 64 casi e foto non verificati**; Chromium non è stato avviato. La verifica di ripetibilità e il conteggio dei tentativi scartati saranno fatti sui soli dati nuovi.

Alle 20:33 UTC lo stesso comando `node tests/codex/orologio-300.mjs` ha ricontrollato la memoria immediatamente prima di Chromium: 3,38 GB. Si è fermato senza aprire il browser; il grezzo del tentativo è `tests/codex/orologio-300.json`. Il precedente controllo a 3,51 GB non costituisce autorizzazione ad avviare Chromium quando la RAM è tornata sotto soglia.

Anche il ramo con scatti della sonda è stato allineato alla risoluzione dopo 45 fotogrammi in `hl_choose`. Ora richiede sei foto per considerare valido un caso, compresi i giri ripetuti. Questa modifica è stata controllata solo sintatticamente; il comportamento in Chromium è **non verificato** finché la memoria non consente la prova.
