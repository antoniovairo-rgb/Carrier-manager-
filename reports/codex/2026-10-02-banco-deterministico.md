# Banco deterministico e carriere — CPM 7.999.105

**Inventario aggiornato al 4 ottobre.** `node tests/codex/banco-difesa-mancanti.mjs` confronta il grezzo compresso con l'intero piano: 16 scene × 2 esiti × 2 rappresentazioni = 64 casi base, più 16 ripetizioni sulle scene 33, 133, 45 e 24. Risultato: **80 attesi, 15 validi con sei foto, 65 mancanti** (29 GLB, 36 procedurali). Il primo mancante nell'ordine del piano è `gi33-fail-procedurale-r0`; `gi32-fail-glb-r0` resta mancante. Le percentuali del banco non vanno inferite dai soli 64 casi base. La memoria libera misurata con `node -p "(require('os').freemem()/1073741824).toFixed(3)"` è 3,214 GiB, sotto la soglia di 3,5 GiB: nessun nuovo caso 3D è stato avviato in questa ripresa.

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

### Caso GLB aggiunto il 3 ottobre: gi32 success

Comando: `$env:CPM_SCENES='32'; $env:CPM_MODE='1'; $env:CPM_OUTCOME='success'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs`. Esito **valido**: `ActionResolved` registra gi32, «Anticipo di posizione», `ok:true`; risoluzione dopo 45 fotogrammi di `hl_choose`, 6 PNG. Con corpi GLB accesi, `__CPM_FRAME480` conta 111 letture, eroe fuori quadro 10/111 e pallone fuori 53/111 (prime 12: 12/12). La foto `reports/codex/banco-difesa-3d/gi32-success-glb-r0-01-apertura.png` mostra l'eroe ma non il pallone; nelle foto 04 e 06 appare già il messaggio di esito «Entrata pulita!» e nella 06 il pallone è visibile. Le foto campionate non mostrano l'istante dell'anticipo: il gesto al contatto resta **non verificato**. I numeri di fuori quadro sono del testimone; una segnalazione 001/002 al giocatore resta ipotesi da verificare con ripresa continua. Il caso gi32 fail GLB resta aperto.


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

## Aggiornamento 03/10: verifica del conteggio dei fotogrammi

Una revisione della sonda ha trovato un errore nella modalità predefinita: `settleMode` veniva registrato come `fixed-45-frames`, ma alle due chiamate `page.evaluate` arrivava `undefined`. In quel caso la condizione effettiva era l'assestamento del pallone, non il conteggio di 45 fotogrammi. Il nuovo tentativo `gi138-fail-procedurale-r0` lo ha dimostrato: `resolve.chooseFrames=15`. Il tentativo è stato **riclassificato non valido per il banco a 45 fotogrammi** nel grezzo. La sonda passa ora esplicitamente `fixed-45-frames` e considera valido un caso solo se `chooseFrames>=45`; `node --check tests/codex/banco-difesa-3d.mjs` è riuscito. I casi precedenti con `chooseFrames=45` restano distinguibili nel grezzo; non si inferisce il conteggio dai soli nomi della modalità.

Comandi eseguiti dalla radice del repository:

```powershell
$env:CPM_SCENES='138'; $env:CPM_OUTCOME='fail'; $env:CPM_MODE='0'; $env:CPM_REPEAT='1'; $env:CPM_NO_SHOTS='1'; node tests/codex/banco-difesa-3d.mjs
$env:CPM_SCENES='138'; $env:CPM_OUTCOME='fail'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_NO_SHOTS='1'; node tests/codex/banco-difesa-3d.mjs
$env:CPM_SCENES='168'; $env:CPM_OUTCOME='success'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_NO_SHOTS='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs
$env:CPM_SCENES='168,31'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_NO_SHOTS='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs
```

| Tentativo numerico nuovo | Validità | Fotogrammi in `hl_choose` | Letture `FRAME480` | Eroe fuori | Pallone fuori |
| --- | --- | ---: | ---: | ---: | ---: |
| gi138 fail procedurale | scartato: sonda risolta troppo presto | 15 | 31 | 0 | non registrato |
| gi138 fail GLB | scartato: scena passata a `hl_result` prima dell'assestamento | non verificato | non verificato | non verificato | non verificato |
| gi168 success GLB | valido, `ActionResolved.ok=true` | 45 | 30 | 0 | non registrato |
| gi168 fail GLB | valido, `ActionResolved.ok=false` | 45 | 30 | 0 | 14 |
| gi31 success GLB | scartato prima della pagina: memoria libera 2,87 GiB | non verificato | non verificato | non verificato | non verificato |

Fonte: `tests/codex/banco-difesa-3d.json.gz`, campi `chooseFrames`, `frame` e `actionResolved`. I due casi validi gi168 sono **solo numerici**, senza i sei scatti necessari al giudizio visivo 001/002/003. Un precedente tentativo gi138 con scatti è stato scartato dopo una sola foto d'apertura. Durante le prove GLB la memoria libera è scesa anche a 2,67 GiB; il lotto è stato fermato e non giustifica ulteriori esecuzioni 3D mentre il PC resta sotto la soglia di 3,5 GiB. La serie completa dei 64 casi e la prova di ripetibilità restano aperte.

### gi168 success GLB: sei scatti dopo la correzione

Ripetizione con il terzo comando sopra, senza `CPM_NO_SHOTS`: caso valido, `chooseFrames=45`, `ActionResolved.ok=true`, 110 letture `FRAME480`, eroe fuori 0 e pallone fuori 3. I sei PNG sono in `reports/codex/banco-difesa-3d/gi168-success-glb-r0-*.png`. La foto `03-rincorsa` mostra il corpo dell'eroe in scivolata; nella `05-volo` restano la freccia e l'etichetta «10 VALIDATOR», ma **il suo corpo 3D non è distinguibile**, pur avendo il testimone `fuori=0`. È un candidato 002 da verificare: il testimone sembra seguire la posizione proiettata, non prova che la mesh sia effettivamente visibile. Il pallone è vicino al margine sinistro della foto 05. La foto 06 mostra di nuovo l'eroe e il pallone, con testo «Pallone recuperato» e tabellone 0–0; la traiettoria completa del recupero non è verificabile dai sei scatti. Nessun 003 attribuito. Questa ripetizione sostituisce la sola misura numerica per il giudizio visivo di gi168 success; gli altri casi numerici rimangono tali.

### gi168 fail GLB: sei scatti dopo la correzione

Comando dalla radice: `$env:CPM_SCENES='168'; $env:CPM_OUTCOME='fail'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; Remove-Item Env:CPM_NO_SHOTS -ErrorAction SilentlyContinue; node tests/codex/banco-difesa-3d.mjs`. Caso valido: `chooseFrames=45`, `ActionResolved.ok=false`, 119 letture `FRAME480`, eroe fuori 1, pallone fuori 101. Le sei foto sono in `reports/codex/banco-difesa-3d/gi168-fail-glb-r0-*.png`. Nella `01-apertura` il pallone e il portatore non si vedono; nella `03-rincorsa` sono presso il margine alto destro mentre l'eroe è nella metà bassa. Nelle `04-contatto`, `05-volo` e `06-esito` il pallone non è visibile; in `05-volo` e `06-esito` il corpo dell'eroe è parzialmente tagliato dal bordo destro. Segnalazioni **001 e 002 candidate**, sostenute dalle foto e dal conteggio `bfuori=101/119`, da riprodurre dal team. La scritta finale «Fallo! Sei stato ammonito» concorda con `ActionResolved.ok=false`; il contatto fisico che giustifica il fallo non è verificabile dai sei fotogrammi, perciò nessun 003 attribuito.

### gi134 fail GLB: sei scatti

Comando dalla radice: `$env:CPM_SCENES='134'; $env:CPM_OUTCOME='fail'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; Remove-Item Env:CPM_NO_SHOTS -ErrorAction SilentlyContinue; node tests/codex/banco-difesa-3d.mjs`. Caso valido: `chooseFrames=45`, `ActionResolved.ok=false`, 112 letture `FRAME480`, eroe fuori 0, pallone fuori 35. Le sei foto sono in `reports/codex/banco-difesa-3d/gi134-fail-glb-r0-*.png`. La `01-apertura` annuncia «Lancio lungo in area! Vinci il duello aereo!», ma mostra il cerchio di centrocampo, l'eroe distante dagli altri due corpi visibili e nessun pallone distinguibile: **001 candidato**. La `03-rincorsa` mostra eroe e palla lontani fra loro. Nella `04-contatto` il tabellone è già 0–1 e compare «Gol avversario» mentre la camera mostra ancora il centrocampo; nella `05-volo` la palla è visibile presso il margine destro, ancora nella zona del centrocampo inquadrata. È un **003 candidato per anticipo del tabellone rispetto al percorso visibile della palla**, non la prova che la palla non possa successivamente entrare in porta. L'eroe resta nel quadro nelle foto 03–05; nessun 002 attribuito. Il team deve riprodurre entrambe le anomalie.

### gi31 success GLB: sei scatti

Comando dalla radice: `$env:CPM_SCENES='31'; $env:CPM_OUTCOME='success'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; Remove-Item Env:CPM_NO_SHOTS -ErrorAction SilentlyContinue; node tests/codex/banco-difesa-3d.mjs`. Caso valido: `chooseFrames=45`, `ActionResolved.ok=true`, 101 letture `FRAME480`, eroe fuori 15, pallone fuori 12. I sei scatti sono in `reports/codex/banco-difesa-3d/gi31-success-glb-r0-*.png`. Nella `03-rincorsa` l'eroe è ancora distante dal portatore; nella `05-volo` si vede la scivolata, con la palla alla sua destra; nella `06-esito` il pallone è ancora a destra dell'eroe e il testo dice «Anticipo perfetto». Questi tre fotogrammi non bastano a dimostrare né a escludere il contatto e il possesso: **sincronia del gesto ed esito visivo non verificati**. L'eroe è visibile nelle foto 03–05; i 15 fotogrammi fuori quadro del testimone non sono identificati da questi scatti, quindi nessun 002 attribuito solo sulla base di essi. Nessun nuovo codice assegnato.

### gi31 fail GLB: sei scatti

Comando dalla radice: `$env:CPM_SCENES='31'; $env:CPM_OUTCOME='fail'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; Remove-Item Env:CPM_NO_SHOTS -ErrorAction SilentlyContinue; node tests/codex/banco-difesa-3d.mjs`. Caso valido: `chooseFrames=45`, `ActionResolved.ok=false`, 112 letture `FRAME480`, eroe fuori 0, pallone fuori 27. I sei scatti sono in `reports/codex/banco-difesa-3d/gi31-fail-glb-r0-*.png`. Nelle foto `03-rincorsa` e `05-volo` il pallone è con l'avversario vicino al centro del quadro e l'eroe resta chiaramente distante; nella `04-contatto` appare già «FALLO» e «Punizione concessa» senza un contatto distinguibile. È un **003 candidato**: il testo del fallo non è sostenuto dal gesto visibile nei fotogrammi acquisiti. Il contatto tra due scatti resta possibile e dunque non è una prova definitiva. La scivolata scelta non è visibile nei fotogrammi 03–05; il campionamento a sei foto non permette di affermare che non sia stata animata fra gli scatti. Nessun 002 attribuito perché l'eroe resta in quadro nelle foto decisive.

### gi32 GLB: tentativi scartati

Comando dalla radice: `$env:CPM_SCENES='32'; $env:CPM_MODE='1'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; Remove-Item Env:CPM_NO_SHOTS -ErrorAction SilentlyContinue; node tests/codex/banco-difesa-3d.mjs`. Il success non ha raggiunto l'assestamento richiesto entro 25 secondi virtuali e ha prodotto solo `gi32-success-glb-r0-01-apertura.png`; **caso non valido**. Il fail non ha aperto la pagina: la memoria libera era 2,31 GiB, sotto la guardia di 3,5 GiB. Nessun codice e nessuna misura di inquadratura attribuiti a gi32. Il grezzo compresso conserva entrambi gli scarti; i casi validi della serie precedente non sono stati ripetuti.

### gi32 success procedurale: GLB spento, sei scatti

Comando numerico dalla radice: `$env:CPM_SCENES='32'; $env:CPM_OUTCOME='success'; $env:CPM_MODE='0'; $env:CPM_REPEAT='1'; $env:CPM_NO_SHOTS='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs`. Ripetizione con sei foto: stessi parametri, ma `Remove-Item Env:CPM_NO_SHOTS -ErrorAction SilentlyContinue` prima di `node tests/codex/banco-difesa-3d.mjs`. Entrambi i tentativi sono validi: il secondo ha `chooseFrames=45`, `ActionResolved.ok=true`, 130 letture `FRAME480`, eroe fuori 4, pallone fuori 15. Le foto sono in `reports/codex/banco-difesa-3d/gi32-success-procedurale-r0-*.png`. In `01-apertura` la palla è presso il portatore e l'eroe è in quadro; in `04-contatto` la palla è vicina all'eroe e il testo «Entrata pulita» non è smentito dal singolo scatto. In `05-volo` il corpo dell'eroe è parzialmente tagliato dal bordo sinistro: **002 candidato** corroborato dai 4/130 campioni fuori quadro, ma non è misurata la durata esatta del taglio nella foto. Nessun 001 o 003 attribuito. Il successo procedurale non sana il tentativo GLB scartato: sono rappresentazioni diverse.

### gi32 fail procedurale: correzione della sonda fotografica

Il primo tentativo con sei foto aveva `chooseFrames=45` ma `phaseBefore=hl_result` alla chiamata di risoluzione: **non valido**. Congelare il disegno dopo 45 frame non impediva alla fase di avanzare. La sonda ora scatta le foto 01 e 02 prima del 45° frame e chiama `__CPM_RESOLVE(0)` nello stesso callback che conta il 45°: non c'è una chiamata Playwright fra la soglia e la risoluzione. Il secondo tentativo con lo stesso comando, `$env:CPM_SCENES='32'; $env:CPM_OUTCOME='fail'; $env:CPM_MODE='0'; $env:CPM_REPEAT='1'; $env:CPM_SETTLE_MODE='fixed-45-frames'; Remove-Item Env:CPM_NO_SHOTS -ErrorAction SilentlyContinue; node tests/codex/banco-difesa-3d.mjs`, è valido (`ActionResolved.ok=false`, sei foto, `chooseFrames=45`, 114 letture `FRAME480`; gli altri campi sono nel grezzo). In `03-rincorsa` l'eroe incontra l'avversario, in `04-contatto` compare «Beffato dall'attaccante» e la palla è presso i due corpi; gli scatti 05–06 non contraddicono l'esito. Nessun 001/002/003 attribuito. Il caso resta **procedurale**: il corrispondente GLB è ancora da misurare.

## Ripresa 04/10: banco a 24/80

Comando dalla radice, ripetuto in processi separati per liberare la memoria di Chromium fra i casi:

```powershell
$env:CPM_SETTLE_MODE='fixed-45-frames'; node tests/codex/banco-difesa-3d.mjs
node tests/codex/banco-difesa-mancanti.mjs
```

Il secondo comando restituisce `expected:80`, `valid:24`, `missing:56`, di cui 26 GLB e 30 procedurali. I nuovi casi validi sono sotto; tutti hanno `chooseFrames=45`, `ActionResolved` concorde e sei PNG. Fonte: `tests/codex/banco-difesa-3d.json.gz`, ultimo record valido per ogni ID.

| Caso | Letture `FRAME480` | Eroe fuori | Pallone fuori |
| --- | ---: | ---: | ---: |
| gi33 fail GLB r0 | 104 | 2 | 103 |
| gi33 fail procedurale r0 | 126 | 0 | 101 |
| gi33 fail procedurale r1 | 129 | 0 | 102 |
| gi33 fail GLB r1 | 106 | 0 | 86 |
| gi133 success procedurale r0 | 127 | 4 | 72 |
| gi133 success procedurale r1 | 123 | 0 | 17 |
| gi133 success GLB r1 | 100 | 14 | 44 |
| gi133 fail procedurale r0 | 178 | 3 | 178 |
| gi133 fail procedurale r1 | 153 | 14 | 153 |

Nella foto di apertura `gi33-fail-glb-r0-01-apertura.png` l'eroe è visibile sopra la scheda. La foto `04-contatto` mostra già il tabellone 0–1 e la scena spostata verso l'area; non è il fotogramma effettivo del contatto. La foto `06-esito` mostra il pallone e l'eroe vicino al bordo destro, con l'esito «Supera e segna». Le sei foto non permettono di attribuire con certezza un codice 003, né di distinguere una palla fuori quadro attesa dalla camera da un errore di regia per tutti i 103/104 campioni. I conteggi 001/002/003 sui nove nuovi casi restano **non verificati visivamente**; i PNG consentono la revisione successiva.

Gli scarti per memoria sono conservati nel grezzo e non entrano nei 24 validi. Il browser unico del banco fa scendere temporaneamente la memoria sotto 3,5 GiB dopo uno o due casi; chiudere il processo la riporta sopra soglia. Nessun caso viene forzato sotto la guardia. La serie completa resta aperta.
