# PO-190 — goleade in carriera avanzata, checkpoint

Base: `origin/main` 8cef5317, `GAME_VERSION="7.999.112"`. **Non ci sono ancora tre carriere naturali misurate** sulla nuova base. I 2,51–3,39 GB liberi osservati durante la preparazione erano sotto la soglia di 3,5 GB per avviare Chromium. I valori del PO (stagione 12, 2,90 GF/partita, 48 gol dell'eroe) sono il motivo del collaudo, non un risultato di questa sonda.

Ho preparato `tests/codex/goleade-carriera-avanzata.mjs` per creare tre attaccanti dal percorso UI senza iniettare salvataggi o attributi iniziali, superare i provini e conservare a ogni passo salvataggio, stagione, settimana, stato del contratto, classifica e cronologia delle partite. Il comando di avvio è:

```powershell
$env:CPM_SEEDS='0,1,2'; node tests/codex/goleade-carriera-avanzata.mjs
```

Il percorso UI dopo le offerte e le stagioni ≥6 è **non verificato** sulla 7.999.112. La prima sonda registra il percorso simulato e conserva il salvataggio all'inizio della stagione avanzata. `tests/codex/goleade-live-avanzata.mjs` è il braccio separato di partita vissuta: ricarica quel salvataggio, chiama `__CPM_CAREER.playMatch()`, usa `__CPM_AUTOPLAY(true,{seed,policy:'seeded'})` e legge `__CPM_EV()` per la fonte di ogni gol. È preparato ma **non eseguito**.

### Tentativo del 3 ottobre

Comando: `$env:CPM_SEEDS='0'; node tests/codex/goleade-carriera-avanzata.mjs`. La RAM libera era 4,54 GB prima del lancio; durante i provini del seme 0 la guardia ha misurato **3,38 GB**, sotto la soglia di 3,5 GB, e il banco si è fermato. Grezzo: `tests/codex/goleade-carriera-avanzata.json`. Sono registrati **0 provini completati e 0 passi di carriera**; nessun risultato calcistico è derivabile da questo tentativo. La pausa è ora classificata separatamente da un errore del gioco, e la scrittura del checkpoint riprova un file temporaneamente occupato (`EBUSY`). Il percorso UI dalla creazione al primo provino resta **non verificato**; la creazione naturale produce `position:"Attaccante"` nel codice (`src/17-menu-creazione-pannelli.jsx:291`), ma la carriera creata in questo tentativo non ha ancora un salvataggio misurabile.

Il calendario di campionato, generato da `generateSeasonCalendar` in `src/09-audio-scout-anagrafiche.jsx`, espone `isHome`; dopo la gara `calendar.result` contiene `homeScore` e `awayScore` (`src/18-career-app.jsx`). La sonda usa questi campi per GF/GA del club, distinguendo casa e trasferta. La correttezza della classificazione sui dati effettivi resta **non verificata**. Gol per fonte, quota dell'eroe, partite con 6+ gol e scarti ≥5 non hanno ancora valori misurati. Eventuali riferimenti al calcio reale richiederanno una fonte verificata nel rapporto finale.

### Secondo tentativo del 3 ottobre, renderer software

Per ridurre il carico della sonda numerica, il browser è stato avviato con `--use-gl=angle --use-angle=swiftshader`, come il banco carriere esistente, al posto di D3D11. Comando: `node --check tests/codex/goleade-carriera-avanzata.mjs; $env:CPM_SEEDS='0'; node tests/codex/goleade-carriera-avanzata.mjs`. Prima del lancio `node -e "console.log((require('os').freemem()/2**30).toFixed(2))"` indicava 4,75 GB. Durante i provini la guardia ha registrato **3,42 GB** e ha fermato il processo. Il checkpoint ha ancora **0 provini e 0 passi** completati (`tests/codex/goleade-carriera-avanzata.json`). Questa configurazione non ha risolto il limite di memoria; i risultati calcistici restano non verificati. Non è stato ridotto il campione richiesto.

### Terzo tentativo del 3 ottobre, JSX precompilato e renderer software

Il comando `node tests/codex/goleade-precompile.mjs` ha generato in `tests/codex/` un HTML temporaneo di 5.132.332 byte dal sorgente di 6.973.981 byte, rimuovendo Babel a runtime; il gioco tracciato non è stato modificato. Comandi: `$env:CPM_PRECOMPILED='1'; $env:CPM_SEEDS='0'; node tests/codex/goleade-carriera-avanzata.mjs`. La memoria prima dell'avvio era 4,81 GB e, durante un controllo, 3,90 GB. Il processo non ha però completato il primo provino entro il limite di 180 s della sonda: `Provino 1 non concluso`. I dati grezzi hanno ancora **0 provini e 0 passi di carriera**. Questo è un limite del tentativo, non una misura di un difetto del gioco: la fase al timeout non veniva ancora registrata. Il prossimo tentativo usa la combinazione precompilata + D3D11 già adottata nel precedente banco numerico, registra l'ultima fase e applica la guardia RAM anche durante il provino.

## Campione simulato completato il 3 ottobre

Comandi dalla radice: `node tests/codex/goleade-precompile.mjs`; poi, per ogni seme 0, 1 e 2, `$env:CPM_PRECOMPILED='1'; $env:CPM_SEEDS='<seme>'; node tests/codex/goleade-carriera-avanzata.mjs`. La prima carriera è stata ripresa dal checkpoint dopo la correzione del percorso UI `proTransition`: la sonda preme `Enter` sull'offerta selezionata, come il giocatore, e impedisce più di cinque passi con stagione/settimana immutate. Le tre carriere sono nate dall'interfaccia con ruolo predefinito **Attaccante** e sono arrivate a S7/W1: **18 stagioni concluse, 612 gare di campionato simulate**, zero errori JS raccolti. Il renderer D3D11 e l'HTML con JSX precompilato hanno mantenuto la RAM sopra 3,5 GB nei controlli effettuati. Il file grezzo è `tests/codex/goleade-carriera-avanzata.json`.

Le colonne GF/GA e le goleade sono lette dal calendario della squadra dell'eroe; gol e presenze dell'eroe dal suo snapshot. La quota gol dell'eroe è calcolata dai soli record `matchHistory` simulati di campionato, non dai gol complessivi dello snapshot. Comando della sintesi: `node -e "const d=require('./tests/codex/goleade-carriera-avanzata.json');for(const c of d.careers){for(const s of c.seasons){let l=s.league;console.log(c.seed,s.season,s.ovr,s.matches,s.goals,l.games,l.gf,l.ga,l.gfPerGame,l.gaPerGame,l.gamesSixPlus.length,l.marginsFivePlus.length,l.heroGoalShareSimulated)}}"`.

| Seme | Stagione | OVR | Presenze eroe | Gol eroe | Gare lega | GF | GA | GF/gara | GA/gara | Gare 6+ GF | Scarti 5+ | Quota gol eroe in lega |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 66 | 34 | 8 | 34 | 49 | 36 | 1,44 | 1,06 | 0 | 1 | 16,3% |
| 0 | 2 | 68 | 35 | 12 | 34 | 64 | 30 | 1,88 | 0,88 | 0 | 0 | 18,8% |
| 0 | 3 | 70 | 35 | 8 | 34 | 52 | 47 | 1,53 | 1,38 | 1 | 0 | 15,4% |
| 0 | 4 | 72 | 38 | 10 | 34 | 42 | 36 | 1,24 | 1,06 | 0 | 0 | 19,0% |
| 0 | 5 | 74 | 0 | 0 | 34 | 38 | 45 | 1,12 | 1,32 | 0 | 0 | 0,0% |
| 0 | 6 | 76 | 0 | 0 | 34 | 58 | 32 | 1,71 | 0,94 | 0 | 0 | 0,0% |
| 1 | 1 | 67 | 34 | 8 | 34 | 45 | 44 | 1,32 | 1,29 | 0 | 0 | 17,8% |
| 1 | 2 | 69 | 36 | 12 | 34 | 55 | 42 | 1,62 | 1,24 | 0 | 0 | 20,0% |
| 1 | 3 | 70 | 36 | 13 | 34 | 56 | 40 | 1,65 | 1,18 | 0 | 0 | 23,2% |
| 1 | 4 | 73 | 0 | 0 | 34 | 51 | 41 | 1,50 | 1,21 | 0 | 0 | 0,0% |
| 1 | 5 | 75 | 0 | 0 | 34 | 52 | 42 | 1,53 | 1,24 | 0 | 0 | 0,0% |
| 1 | 6 | 76 | 0 | 0 | 34 | 45 | 43 | 1,32 | 1,26 | 0 | 0 | 0,0% |
| 2 | 1 | 67 | 34 | 12 | 34 | 51 | 34 | 1,50 | 1,00 | 0 | 0 | 23,5% |
| 2 | 2 | 68 | 35 | 11 | 34 | 56 | 45 | 1,65 | 1,32 | 0 | 1 | 19,6% |
| 2 | 3 | 70 | 37 | 14 | 34 | 53 | 34 | 1,56 | 1,00 | 0 | 1 | 26,4% |
| 2 | 4 | 72 | 38 | 14 | 34 | 47 | 29 | 1,38 | 0,85 | 0 | 0 | 25,5% |
| 2 | 5 | 74 | 0 | 0 | 34 | 54 | 44 | 1,59 | 1,29 | 0 | 0 | 0,0% |
| 2 | 6 | 76 | 0 | 0 | 34 | 44 | 38 | 1,29 | 1,12 | 0 | 0 | 0,0% |

Nel campione: **1/612** partite con almeno 6 GF e **3/612** con scarto almeno 5. Comando: `node -e "const d=require('./tests/codex/goleade-carriera-avanzata.json'),s=d.careers.flatMap(c=>c.seasons);console.log({gare:s.reduce((n,x)=>n+x.league.games,0),sei:s.reduce((n,x)=>n+x.league.gamesSixPlus.length,0),scarti:s.reduce((n,x)=>n+x.league.marginsFivePlus.length,0)})"`. Questi valori descrivono solo gli accoppiamenti incontrati da tre eroi OVR 64–76; **non confutano** il caso PO-190 con eroe OVR 93 in S12.

**Limite decisivo del percorso:** la sonda ha simulato le settimane senza accettare dall'interfaccia i rinnovi contrattuali. Nel salvataggio di inizio S6, i tre eroi risultano `contractExpired:true`, durata 0, scadenza rispettivamente S5/S4/S5. In S5–S6 (e nel seme 1 già in S4) hanno zero presenze pur con 34 gare di lega per la squadra. Il gioco prevede lo stato di svincolato: questi zeri non sono attribuibili a un difetto del gioco. La prova di goleade con eroe avanzato e attivo richiede un braccio che gestisca rinnovi/offerte via UI; le partite vissute e la fonte dei gol restano **non verificate**.

### Braccio vissuto e rinnovi: stato del 3 ottobre

Comando del braccio vissuto: `$env:CPM_PRECOMPILED='1'; $env:CPM_SEEDS='0'; node tests/codex/goleade-live-avanzata.mjs`. Il grezzo `tests/codex/goleade-live-avanzata.json` conserva anche i tentativi invalidi. Nel salvataggio S6/W1 del seme 0 la sonda ha chiuso dall'interfaccia le schermate sovrapposte (benvenuto e colloquio con l'agente), quindi ha cliccato `Negozia rinnovo`; **non era visibile «Accetta l'offerta del club»** e il contratto è rimasto scaduto. La prima apertura di partita era pendente: `C.step()` ha restituito `opening-resolved`. Dopo, `C.playMatch()` ha restituito `true`, ma il gancio `__CPM_AUTOPLAY` non è comparso entro 60 s e la pagina è rimasta nel dashboard (foto `reports/codex/goleade-live-errore-seed0.png`). Nel codice, `src/18-career-app.jsx:986` impedisce `startMatch` a uno svincolato, mentre il gancio di test `playMatch` a `:1310` restituisce `true` dopo la chiamata senza verificare se il guardiano l'ha fermata. **Questo è un limite verificato del gancio di collaudo**; non conto la partita come vissuta né come difetto della simulazione.

Un nuovo seme 3 è stato avviato con rinnovo via UI prima della scadenza: `$env:CPM_PRECOMPILED='1'; $env:CPM_RENEW_UI='1'; $env:CPM_SEEDS='3'; node tests/codex/goleade-carriera-avanzata.mjs`. Ha completato 2 provini, poi la guardia ha chiuso la pagina durante il terzo quando la memoria è scesa sotto 3,5 GB. Nessuna stagione del seme 3 è stata misurata. Il flusso dei tre provini è conservato in memoria React e **non è riprendibile dal secondo provino dopo la chiusura della pagina**; la sonda ora archivia i provini parziali in `interruptedTrialRuns` e ricomincia quel flusso dall'inizio, senza contarli come carriera conclusa. Le partite vissute su eroe attivo e la fonte dei gol restano non verificate.

## Controllo numerico supplementare: eroe OVR alto

Poiché il braccio di carriera non ha ancora prodotto un eroe attivo OVR 93, ho misurato separatamente il motore senza grafica con `occasioniV2:true` e scelte automatiche: `node tests/codex/goleade-eroe-alto.mjs`. Sono **100 partite per accoppiamento**, semi nel grezzo `tests/codex/goleade-eroe-alto.json`. Questo esercita gli eventi `occasione_eroe` (3,58–4,78 per partita in media), ma **non** include la progressione di carriera, il calendario, il rendering o l'azione scelta dal giocatore; non sostituisce PO-190.

| Forza casa–trasferta | Gare | GF casa medi | GA casa medi | Gol eroe medi | Occasioni eroe medie | Gare casa 6+ GF | Gare con scarto 5+ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 93–80 | 100 | 1,50 | 0,92 | 0,47 | 3,58 | 0 | 1 |
| 93–50 | 100 | 2,43 | 0,54 | 0,49 | 3,77 | 1 | 4 |
| 80–93 | 100 | 1,30 | 1,90 | 0,39 | 4,78 | 0 | 1 |

Unico 6+ della squadra di casa: seme **191172**, risultato **6–2** nel 93–50. Nessun 7+ in queste 300 gare. Comando di sintesi: `node -e "const d=require('./tests/codex/goleade-eroe-alto.json');for(const p of ['93-80','93-50','80-93']){let r=d.rows.filter(x=>x.pair===p),a=k=>r.reduce((n,x)=>n+x[k],0)/r.length;console.log(p,r.length,a('home'),a('away'),a('heroGoals'),a('heroOpportunities'),r.filter(x=>x.home>=6).map(x=>x.seed),r.filter(x=>Math.abs(x.home-x.away)>=5).length)}"`. Le 4 goleade viste dal PO nella sua S12 e i 48 gol dell'eroe restano **non verificati** nel percorso reale di carriera.

```powershell
node tests/codex/goleade-live-avanzata.mjs
```
