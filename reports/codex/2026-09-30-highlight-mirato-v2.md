# Collaudo mirato degli highlight — 7.999.61

**Campione mirato acquisito e revisionato. Non è il collaudo integrale di tutti gli highlight né delle partite naturali.**
Piano: 32 combinazioni. Acquisite senza errore: 32. Tentativi con errore: 3. Note presenti: 32.

## Codici osservati nel campione

| Codice | Casi | Fino a tre casi da riprodurre (gi:azione:esito) |
|---|---:|---|
| 001 | 8 | 31:0:fail, 6:0:success, 6:0:fail |
| 002 | 3 | 31:0:fail, 6:0:fail, 44:0:fail |
| 003 | 3 | 30:0:success, 30:0:fail, 123:0:success |

Casi con almeno un codice manuale: 11 su 32. La stessa combinazione può avere più codici. Le bozze automatiche sono riportate integralmente sotto ogni caso, ma non sommate come difetti confermati.

Legenda: 001 apertura/allestimento della scena; 002 eroe fuori posizione o fuori quadro; 003 incoerenza fra azione ed esito narrato. I codici non elencati non sono stati attribuiti: questo non dimostra la loro assenza in tutti gli istanti.

Le segnalazioni sono ipotesi di difetto finché il team non le riproduce con un proprio guardiano, come richiesto da AGENTS.md. I codici descrivono quanto visto nei casi forzati; non sono una misura di frequenza nelle partite naturali.

Base rilevata: 54cfac82849970f898f645d4cc8138ccf39aa210; ramo codex/2026-09-30-collaudo-highlight; Node v24.17.0. Fonte: [stato repository](highlight-mirato/repo-state.json), comando: node tests/codex/highlight-mirato-repo.mjs.

Fonte dei conteggi: [checkpoint](../../tests/codex/highlight-mirato.json). Comando completo di riepilogo:
```powershell
node tests/codex/highlight-mirato-report-v2.mjs
```

Acquisizione, dalla radice:
```powershell
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:CPM_BATCH='1'
node tests/codex/highlight-mirato-v2.mjs
node tests/codex/highlight-mirato-sheet.mjs
node tests/codex/highlight-mirato-audit.mjs
```

Per proseguire i casi mancanti, chiudendo Chrome fra un caso e il successivo: `node tests/codex/highlight-mirato-lotti.mjs`. Per ripetere un singolo caso, impostare `$env:CPM_CASES="30:0:success"` e avviare lo script v2; azzerare poi CPM_CASES prima di riprendere i lotti.

## Metodo e limiti

Azione 0 significa indice canonico del catalogo SITUATIONS passato a __CPM_RESOLVE, non necessariamente primo pulsante visibile (esempio: gi92). Il test non sostituisce un collaudo dei clic reali e della composizione dinamica del menu. Nome partita Mirato+gi+esito: il nome concorre al seed secondo openMatch; il valore numerico non è stato rilevato. Le varianti success/fail hanno nomi diversi, quindi il confronto non isola il solo effetto dell’esito. Partita di provino predisposta da openMatch, come indica il banner PROVINO nelle prove; non è una partita naturale di campionato. Pagina nuova per caso; viewport 412×915, deviceScaleFactor 1, GLB/PRESENT/CINE accesi; service worker bloccati. Chrome headless tramite harness SwiftShader. La scena viene forzata una sola volta per pagina. Il campo clockSetup del checkpoint distingue la pausa prima della navigazione dalle prime controprove; durante il caricamento il tempo è avanzato esplicitamente, poi la scena è acquisita a passi simulati di 100 ms. Le clip devono risultare caricate prima della scelta. Nei tentativi con preSceneGC=true viene richiesta la raccolta della memoria temporanea dopo il caricamento e prima della scena. Nei tentativi con openingFlushed=true viene forzato il calcolo del layout della tela, poi avanzato il clock di 32 ms prima dello scatto iniziale; le precedenti aperture nere non sono state sostituite. Le controprove con captureTag=apertura usano nomi separati e conservano anche gli scatti neri intermedi in openingAttempts; prima di riprovare lo scatto avanzano il clock simulato, senza attribuire quei tempi alle prestazioni del gioco. Nei tentativi che contengono header33 è stato acceso il testimone di sola lettura della distanza pallone-testa (src/12-three-match-view.jsx:10105–10109). Il runner chiude il contesto sotto 1,5 GB liberi e non considera riuscito il tentativo interrotto. Nessuna misura di FPS, fluidità, durata reale del gesto o prestazioni mobile è valida con questo metodo. Il contatto è il primo campione con il testimone di avvio traiettoria (src/12-three-match-view.jsx:10118–10121): non certifica il contatto anatomico. Apertura e scelta possono riprendere la stessa fase; il difetto non va attribuito al gioco senza una prova indipendente.

## Qualità delle prove

Fonte: [audit](highlight-mirato/audit-v2.json), comando completo: node tests/codex/highlight-mirato-audit.mjs. Immagini degli ultimi tentativi per combinazione: 192; aperture nere non valutabili: 0; file mancanti: 0; cambi del testimone durante lo scatto: 0. Acquisizioni riuscite, incluse le controprove: 40; immagini di fase conservate: 240; ulteriori scatti iniziali conservati: 0; aperture nere nel giro originale: 8. La misura del nero usa il rettangolo x 20–389, y 160–549 e soglia RGB <8 per almeno il 98% dei pixel; le aperture segnalate sono state anche viste nelle immagini.

## Note e prove

| gi | Azione | Esito richiesto | Esito corrisponde | Immagini | Codici | Gravità | Nota |
|---:|---|---|---|---:|---|---|---|
| 31 | 🛡️ Scivolata netta | fail | true | 6 | 001, 002 | alta | 001/002: i sei fotogrammi non mostrano il contrasto né i protagonisti; l’esito FALLO è sovrapposto al terreno vuoto. Confermato nella controprova con una sola forzatura e modello ready-lineup. Non verificato in partita naturale; causa nel codice non determinata. |
| 6 | ✈️ Stacco di testa | success | true | 6 | 001 | media | 001: in apertura e scelta l’inquadratura mostra la zona laterale del campo e giocatori lontani sul bordo sinistro, ma non il protagonista dello stacco; il protagonista rientra in 03. Gol e passaggio del punteggio da 0–0 a 1–0 sono coerenti. Il contatto anatomico esatto non è verificato in questa acquisizione. La segnalazione automatica di salto della palla resta una bozza, non viene trasformata in 014 senza una prova indipendente. |
| 6 | ✈️ Stacco di testa | fail | true | 6 | 001, 002 | media | 001/002: nella controprova l’apertura è leggibile, ma il protagonista non è visibile nell’area di gioco; in 03 la rincorsa mostra terreno vuoto e il marcatore tagliato sul bordo destro. In 04–06 i giocatori rientrano nel quadro. Parata e punteggio 0–0 sono coerenti. Il testimone testa registra distanza minima 0,040 u con gesto header (header-v2.json; node tests/codex/highlight-mirato-header.mjs); il fotogramma denominato contatto è successivo e non prova una mancata collisione. Riproduzione naturale non verificata. |
| 16 | ↗️ Cross teso | success | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito nei sei scatti. Apertura e scelta mostrano il portatore e il difensore; l’apertura nera originale non si ripete. Cross e occasione ancora viva sono compatibili con 0–0. Il preciso contatto sul cross e l’eventuale tocco del compagno non sono verificati dai singoli istanti. |
| 16 | ↗️ Cross teso | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito nei sei scatti. Apertura e scelta sono leggibili nella controprova. Il risultato «Non trova lo specchio» mantiene 0–0; i singoli fotogrammi non stabiliscono se descriva il cross o una conclusione del destinatario, quindi l’eventuale incoerenza narrativa resta non verificata. Contatto esatto e traiettoria completa non verificati. |
| 25 | 🎯 Filtrante millimetrico | success | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito. Apertura e scelta mostrano il portatore. In 04 l’eroe è tagliato dal bordo inferiore, mentre pallone e destinatario sono inquadrati verso la porta: dopo il passaggio questa scelta di camera non basta a dimostrare un errore di posizione. L’esito descrive una conclusione respinta con palla ancora in gioco e conserva 0–0; il preciso intervento del difensore non è verificato. |
| 25 | 🎯 Filtrante millimetrico | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito nei sei scatti. Apertura e scelta mostrano i protagonisti. Il filtrante termina con testo di fuorigioco e punteggio 0–0 coerente; l’esatta posizione del destinatario rispetto alla linea difensiva nell’istante del passaggio non è verificata, quindi non si certifica la correttezza della chiamata. |
| 30 | 🌀 Dribbling centrale e conduci | success | true | 6 | 003 | media | 003: scegliendo Dribbling centrale e conduci, il risultato mostra Recupero decisivo e Anticipo perfetto, testi difensivi per una scelta offensiva. Incongruenza visibile in 02 e 06, ripetuta nella controprova a singola forzatura; punteggio invariato 0–0. Letto nel codice: questa scelta assegna recovery e il risolutore usa action.rew; i testi associati sono difensivi. La causa è compatibile con il dato, da confermare dal team. Non verificata in partita naturale. |
| 30 | 🌀 Dribbling centrale e conduci | fail | true | 6 | 003 | media | 003: dopo la scelta Dribbling centrale e conduci, l’esito mostra Murato dalla difesa e La difesa mura la conclusione. La scelta è una conduzione e le immagini mostrano un contrasto, non una conclusione: incoerenza testuale visibile in 02 e 06, riprodotta anche con singola forzatura. Punteggio invariato 0–0. Non verificata in partita naturale. |
| 31 | 🛡️ Scivolata netta | success | true | 6 | 001 | media | 001: in apertura e scelta il pannello copre il corpo inferiore del portatore e la zona del pallone; la situazione da leggere prima del contrasto rimane parzialmente nascosta. Nella controprova altri giocatori sono visibili, quindi non si tratta di campo completamente vuoto come nella variante fallita. In 03–04 il contrasto diventa leggibile. Testi di chiusura/anticipo e punteggio 0–0 coerenti. Riproduzione naturale non verificata. |
| 0 | 🦵 Tiro angolato | success | true | 6 | nessuno attribuito | — | Nessun difetto provato negli scatti. Il calcio dell’eroe e il tuffo del portiere sono visibili; testo del gol e passaggio da 0–0 a 1–0 coerenti. L’istante esatto di contatto e la tempestività del portiere non sono certificati dalla sequenza campionata. Nessuna conclusione su fluidità o pattinamento. |
| 0 | 🦵 Tiro angolato | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito. Esito Tiro centrale – parata facile e punteggio 0–0 coerenti. Il portiere è a terra in 04 e in piedi in 05, ma il contatto palla-portiere non è mostrato: tempestività e qualità della parata non verificate, nessun codice 111 assegnato. I sei istanti non certificano la continuità del gesto. |
| 7 | ✈️ Colpo di testa | success | true | 6 | nessuno attribuito | — | Gol e punteggio da 0–0 a 1–0 coerenti. In 04 il pallone è all’altezza delle gambe mentre l’eroe è in elevazione; possibile disallineamento del colpo di testa, IPOTESI da verificare sul contatto effettivo. Il campione fotografa l’avvio dell’arco e non certifica l’istante anatomico: nessun codice definitivo attribuito. In 05 il pallone è davanti alla porta e il portiere in tuffo. |
| 7 | ✈️ Colpo di testa | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito nei sei scatti. L’apertura è leggibile; parata e punteggio 0–0 sono coerenti. Il testimone registra distanza minima pallone-testa 0,060 u con gesto header (header-v2.json; node tests/codex/highlight-mirato-header.mjs). Il portiere è già a terra in 04–05 e torna in piedi in 06: il sincronismo del tuffo non è verificato dalla sola successione di questi istanti e non viene attribuito 111. Il fotogramma denominato contatto è successivo al punto di minima distanza. |
| 17 | ↗️ Cross teso | success | true | 6 | nessuno attribuito | — | Nessun difetto provato negli scatti. Il cross riuscito è seguito dal testo Il compagno non riesce a concludere – palla che balla in area; il punteggio rimane 0–0, coerentemente. Il pallone attraversa la zona della porta e rimane in area; ricezione e interazione precisa del compagno non sono verificate. |
| 17 | ↗️ Cross teso | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito. Punteggio invariato 0–0 e azione fermata dalla difesa compatibili con le immagini. Il testo Conclusione murata dopo Cross teso è ambiguo: non è verificato se descriva una conclusione del ricevente o il cross stesso, perché il passaggio intermedio non è interamente campionato. Non assegnato 003 senza questa prova. |
| 28 | ⚡ Verticale | success | true | 6 | nessuno attribuito | — | Nessun difetto provato. Testo Primo tentativo murato – palla viva e punteggio 0–0 coerenti. Le coordinate registrate mostrano il pallone avanzare verso la porta e ritornare dopo la respinta: non sostengono un codice 012. Il pallone basso dietro il giocatore in 04 non dimostra da solo il contatto scorretto. Fonte supplementare: trace-28-success.json, riprodotta con node tests/codex/highlight-mirato-trace.mjs 28 success. |
| 28 | ⚡ Verticale | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito. Il risultato rimane 0–0. La frase La difesa mura la conclusione dopo la scelta Verticale è ambigua rispetto a un passaggio: gli scatti non mostrano una conclusione del ricevente e non consentono di escludere un passaggio intermedio non campionato. Possibile incoerenza testuale da verificare; nessun codice definitivo 003 assegnato. |
| 44 | ✈️ Stacco di testa deciso | success | true | 6 | 001 | media | 001: anche nella variante riuscita apertura e scelta mostrano terreno centrale e giocatori sui bordi, mentre il protagonista dell’intervento resta sotto il pannello; è visibile in 03. Esito di rinvio riuscito e punteggio invariato 0–0 coerenti. Il pallone passa vicino alla testa nel testimone (minimo 0,262 u; header-v2.json, comando node tests/codex/highlight-mirato-header.mjs): prossimità misurata, sincronismo preciso con la posa non verificato. La bozza considera la direzione della porta avversaria, ma un rinvio difensivo non deve necessariamente puntarla: nessun codice 009 assegnato a quel solo angolo. |
| 44 | ✈️ Stacco di testa deciso | fail | true | 6 | 001, 002 | media | 001: in apertura e scelta i protagonisti restano praticamente fuori dalla zona visibile, sotto il pannello delle azioni. 002: il fotogramma finale mostra terreno e righe, senza eroe né porta; il gol subito non è visibile negli scatti. Il punteggio da 0–0 a 0–1 è coerente con il testo, quindi nessun 003 attribuito. Distanza minima pallone-testa 1,559 u nel testimone (header-v2.json; node tests/codex/highlight-mirato-header.mjs): non prova un contatto, ma è compatibile con il tentativo fallito. L’angolo verso la porta avversaria della bozza non viene usato per assegnare 009 in questa azione difensiva. Riproduzione naturale non verificata. |
| 64 | ✈️ Testa potente angolato | success | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito nei sei scatti. Apertura e scelta mostrano il protagonista; il gol è coerente con il punteggio da 0–0 a 1–0. Nella controprova il testimone registra distanza minima pallone-testa 0,064 u con gesto header (header-v2.json; node tests/codex/highlight-mirato-header.mjs). Il successivo scatto denominato contatto non coincide con la minima distanza e non dimostra un impatto mancato. Sincronismo completo del gesto e del portiere non verificato. |
| 64 | ✈️ Testa potente angolato | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito. Esito di parata/deviazione in corner e punteggio 0–0 coerenti. Distanza minima pallone-testa 0,054 u con gesto header attivo (header-v2.json; node tests/codex/highlight-mirato-header.mjs): il pallone basso in 04 non dimostra un colpo di testa mancato. Il portiere è già a terra in 04 e si rialza in 05: possibile intervento anticipato da rivedere con una ripresa continua; contatto palla-portiere e codice 111 non verificati. |
| 81 | 💥 Botta sopra la barriera | success | true | 6 | 001 | media | 001, allestimento iniziale: la scena annuncia Punizione – muro a 9 metri, ma i difensori visibili sono molto distanziati e non si vede una barriera compatta (01–02). La distanza effettiva dei nove metri non è stata misurata. Gol e punteggio da 0–0 a 1–0 coerenti. Limite del test: la prima opzione visibile è Giro sopra la barriera, mentre il risolutore forzato restituisce Botta sopra la barriera; la corrispondenza con un clic reale sul menu non è verificata e non viene attribuita al gioco come 003. |
| 81 | 💥 Botta sopra la barriera | fail | true | 6 | 001 | media | 001: anche in questa variante il titolo annuncia un muro, mentre i difensori visibili in 01–02 sono distanziati e non formano una barriera compatta. Distanza regolamentare non misurata. Esito di parata e punteggio 0–0 coerenti; il contatto palla-portiere non è verificato. Rimane il limite di corrispondenza fra etichetta del menu e risolutore forzato già descritto nel caso riuscito. |
| 87 | ⚡ Cross cieco di prima | success | true | 6 | nessuno attribuito | — | Nessun difetto provato negli scatti. Il risultato descrive una conclusione respinta con palla ancora giocabile; punteggio invariato 0–0 coerente. La bozza automatica non segnala salti del pallone in questa acquisizione. Gli scatti non certificano che il cross sia davvero di prima né il contatto del ricevente; questi aspetti restano non verificati. |
| 87 | ⚡ Cross cieco di prima | fail | true | 6 | nessuno attribuito | — | Nessun difetto provato negli scatti. Il cross fermato dalla difesa e il punteggio finale 0–0 sono coerenti. Il pallone non è identificabile con sufficiente continuità in tutti gli istanti, quindi contatto del difensore, traiettoria completa e carattere di prima del cross restano non verificati. |
| 92 | 🔄 Roulette di classe | success | true | 6 | nessuno attribuito | — | Nessun difetto provato negli scatti. Conclusione e gol sono visibili; punteggio da 0–0 a 1–0 coerente. La rotazione completa della roulette non è documentata dai sei istanti. In 02 Roulette di classe è la seconda opzione visibile, mentre il test usa l’indice canonico 0 di SITUATIONS: l’indice del comando non va interpretato come posizione del primo pulsante sullo schermo. |
| 92 | 🔄 Roulette di classe | fail | true | 6 | nessuno attribuito | — | Nessun difetto provato negli scatti. Esito di deviazione in corner e punteggio 0–0 coerenti. Il tiro è visibile, ma la rotazione completa della roulette e il contatto con il portiere non sono verificati dai sei istanti. Anche qui l’azione canonica 0 corrisponde a Roulette di classe, seconda opzione del menu visibile. |
| 123 | 🌀 Giratone e conduci | success | true | 6 | 003 | media | 003: dopo Giratone e conduci compaiono Riaggressione immediata e Muro invalicabile, testi difensivi per una scelta offensiva. Il checkpoint restituisce outKey=recovery; la stessa ricompensa è assegnata dall’azione nel catalogo. Osservazione coerente con il problema della scena 30, causa da confermare con il guardiano del team. Punteggio invariato 0–0. La rotazione completa della girata non è verificata dai sei istanti. |
| 123 | 🌀 Giratone e conduci | fail | true | 6 | nessuno attribuito | — | Nessun difetto provato negli scatti. Il testo Murato dalla difesa è compatibile con la conduzione fermata; diversamente dalla frase della scena 30 fallita, qui non viene menzionata esplicitamente una conclusione. Punteggio invariato 0–0. La girata completa e la continuità del controllo del pallone non sono verificate dai sei istanti. |
| 152 | 📋 Schema a tre — dai, ricevi, tira | success | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito. Il risultato descrive un’occasione viva con un compagno libero e mantiene 0–0: non dichiara un gol inesistente. I sei scatti non documentano tutti gli scambi del doppio dai-e-vai né una conclusione finale, quindi l’esecuzione completa dello schema annunciato resta non verificata. La scelta canonica del test non coincide con la prima opzione visibile del menu. |
| 152 | 📋 Schema a tre — dai, ricevi, tira | fail | true | 6 | nessuno attribuito | — | Nessun difetto certo attribuito nei sei scatti. Il risultato «Murato dalla difesa» mantiene 0–0 ed è compatibile con lo schema interrotto. I fotogrammi non documentano tutti gli scambi né il preciso intervento difensivo: sequenza completa non verificata. La scelta canonica del test non coincide con la prima opzione visibile. |

### gi 31, azione 0, fail

[KE 7.999.61] SIT #31 [tackle]: «🛡️ Avversario porta palla — sfida in scivolata!» · AZIONE «🛡️ Scivolata netta» → fail

NOTA: 001/002: i sei fotogrammi non mostrano il contrasto né i protagonisti; l’esito FALLO è sovrapposto al terreno vuoto. Confermato nella controprova con una sola forzatura e modello ready-lineup. Non verificato in partita naturale; causa nel codice non determinata.
Codici: 001, 002. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi31-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi31-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi31-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi31-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi31-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi31-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — lo SGUARDO della camera oscilla: 4.7 inversioni/s dell'asse ottico (ampiezza max 2.4°) — ultima passata per fotogramma: lerp 66% + sguardo-pre 34% · 4.3 passate/fotogramma
· codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 4.3u, eroe ≥15.6u per 104 campioni)

Cosa non va secondo me:

### gi 6, azione 0, success

[KE 7.999.61] SIT #6 [header]: «🏳️ Corner! Attacca il secondo palo.» · AZIONE «✈️ Stacco di testa» → success

NOTA: 001: in apertura e scelta l’inquadratura mostra la zona laterale del campo e giocatori lontani sul bordo sinistro, ma non il protagonista dello stacco; il protagonista rientra in 03. Gol e passaggio del punteggio da 0–0 a 1–0 sono coerenti. Il contatto anatomico esatto non è verificato in questa acquisizione. La segnalazione automatica di salto della palla resta una bozza, non viene trasformata in 014 senza una prova indipendente.
Codici: 001. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi6-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi6-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi6-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi6-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi6-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi6-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· SALTO del pallone di 6.3 unità in 16 ms (a x 50.6, a 5.9s dall'inizio scena, scrittore: 16) — 397 u/s, sembra un teletrasporto
· corpo↔porta al contatto: 17° (eroe a x 38.8, z -5.5)

Cosa non va secondo me:

### gi 6, azione 0, fail

[KE 7.999.61] SIT #6 [header]: «🏳️ Corner! Attacca il secondo palo.» · AZIONE «✈️ Stacco di testa» → fail

NOTA: 001/002: nella controprova l’apertura è leggibile, ma il protagonista non è visibile nell’area di gioco; in 03 la rincorsa mostra terreno vuoto e il marcatore tagliato sul bordo destro. In 04–06 i giocatori rientrano nel quadro. Parata e punteggio 0–0 sono coerenti. Il testimone testa registra distanza minima 0,040 u con gesto header (header-v2.json; node tests/codex/highlight-mirato-header.mjs); il fotogramma denominato contatto è successivo e non prova una mancata collisione. Riproduzione naturale non verificata.
Codici: 001, 002. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi6-a0-fail-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi6-a0-fail-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi6-a0-fail-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi6-a0-fail-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi6-a0-fail-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi6-a0-fail-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 5.7 unità fra due fotogrammi a scena in corso (359 u/s) — a 1.1s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 17° (eroe a x 38.8, z -5.5)

Cosa non va secondo me:

### gi 16, azione 0, success

[KE 7.999.61] SIT #16 [cross]: «⚡ Cross dalla fascia sinistra!» · AZIONE «↗️ Cross teso» → success

NOTA: Nessun difetto certo attribuito nei sei scatti. Apertura e scelta mostrano il portatore e il difensore; l’apertura nera originale non si ripete. Cross e occasione ancora viva sono compatibili con 0–0. Il preciso contatto sul cross e l’eventuale tocco del compagno non sono verificati dai singoli istanti.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi16-a0-success-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi16-a0-success-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi16-a0-success-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi16-a0-success-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi16-a0-success-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi16-a0-success-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 16, azione 0, fail

[KE 7.999.61] SIT #16 [cross]: «⚡ Cross dalla fascia sinistra!» · AZIONE «↗️ Cross teso» → fail

NOTA: Nessun difetto certo attribuito nei sei scatti. Apertura e scelta sono leggibili nella controprova. Il risultato «Non trova lo specchio» mantiene 0–0; i singoli fotogrammi non stabiliscono se descriva il cross o una conclusione del destinatario, quindi l’eventuale incoerenza narrativa resta non verificata. Contatto esatto e traiettoria completa non verificati.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi16-a0-fail-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi16-a0-fail-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi16-a0-fail-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi16-a0-fail-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi16-a0-fail-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi16-a0-fail-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 25, azione 0, success

[KE 7.999.61] SIT #25 [pass]: «🎯 Filtrante per il centravanti!» · AZIONE «🎯 Filtrante millimetrico» → success

NOTA: Nessun difetto certo attribuito. Apertura e scelta mostrano il portatore. In 04 l’eroe è tagliato dal bordo inferiore, mentre pallone e destinatario sono inquadrati verso la porta: dopo il passaggio questa scelta di camera non basta a dimostrare un errore di posizione. L’esito descrive una conclusione respinta con palla ancora in gioco e conserva 0–0; il preciso intervento del difensore non è verificato.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi25-a0-success-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi25-a0-success-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi25-a0-success-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi25-a0-success-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi25-a0-success-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi25-a0-success-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 012 — il pallone è tornato INDIETRO di 13.9 unità durante l'azione (dal punto più avanzato, verso la propria metà campo) — massimo arretramento a 9.2s dall'inizio scena

Cosa non va secondo me:

### gi 25, azione 0, fail

[KE 7.999.61] SIT #25 [pass]: «🎯 Filtrante per il centravanti!» · AZIONE «🎯 Filtrante millimetrico» → fail

NOTA: Nessun difetto certo attribuito nei sei scatti. Apertura e scelta mostrano i protagonisti. Il filtrante termina con testo di fuorigioco e punteggio 0–0 coerente; l’esatta posizione del destinatario rispetto alla linea difensiva nell’istante del passaggio non è verificata, quindi non si certifica la correttezza della chiamata.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi25-a0-fail-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi25-a0-fail-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi25-a0-fail-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi25-a0-fail-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi25-a0-fail-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi25-a0-fail-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 30, azione 0, success

[KE 7.999.61] SIT #30 [dribble]: «🌀 Sfida 1v1 a centrocampo!» · AZIONE «🌀 Dribbling centrale e conduci» → success

NOTA: 003: scegliendo Dribbling centrale e conduci, il risultato mostra Recupero decisivo e Anticipo perfetto, testi difensivi per una scelta offensiva. Incongruenza visibile in 02 e 06, ripetuta nella controprova a singola forzatura; punteggio invariato 0–0. Letto nel codice: questa scelta assegna recovery e il risolutore usa action.rew; i testi associati sono difensivi. La causa è compatibile con il dato, da confermare dal team. Non verificata in partita naturale.
Codici: 003. Riferimenti: src/04-situazioni-zone-piazzati.jsx:222; src/15-live-match.jsx:8511; src/05-cronaca-stadi-formazioni.jsx:321; src/05-cronaca-stadi-formazioni.jsx:335.

- [01-apertura](highlight-mirato/gi30-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi30-a0-success-v2-02-scelta.png)
- [04-contatto](highlight-mirato/gi30-a0-success-v2-04-contatto.png)
- [03-rincorsa](highlight-mirato/gi30-a0-success-v2-03-rincorsa.png)
- [05-volo](highlight-mirato/gi30-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi30-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 30, azione 0, fail

[KE 7.999.61] SIT #30 [dribble]: «🌀 Sfida 1v1 a centrocampo!» · AZIONE «🌀 Dribbling centrale e conduci» → fail

NOTA: 003: dopo la scelta Dribbling centrale e conduci, l’esito mostra Murato dalla difesa e La difesa mura la conclusione. La scelta è una conduzione e le immagini mostrano un contrasto, non una conclusione: incoerenza testuale visibile in 02 e 06, riprodotta anche con singola forzatura. Punteggio invariato 0–0. Non verificata in partita naturale.
Codici: 003. Riferimenti: src/04-situazioni-zone-piazzati.jsx:222; src/15-live-match.jsx:8511.

- [01-apertura](highlight-mirato/gi30-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi30-a0-fail-v2-02-scelta.png)
- [04-contatto](highlight-mirato/gi30-a0-fail-v2-04-contatto.png)
- [03-rincorsa](highlight-mirato/gi30-a0-fail-v2-03-rincorsa.png)
- [05-volo](highlight-mirato/gi30-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi30-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 31, azione 0, success

[KE 7.999.61] SIT #31 [tackle]: «🛡️ Avversario porta palla — sfida in scivolata!» · AZIONE «🛡️ Scivolata netta» → success

NOTA: 001: in apertura e scelta il pannello copre il corpo inferiore del portatore e la zona del pallone; la situazione da leggere prima del contrasto rimane parzialmente nascosta. Nella controprova altri giocatori sono visibili, quindi non si tratta di campo completamente vuoto come nella variante fallita. In 03–04 il contrasto diventa leggibile. Testi di chiusura/anticipo e punteggio 0–0 coerenti. Riproduzione naturale non verificata.
Codici: 001. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi31-a0-success-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi31-a0-success-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi31-a0-success-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi31-a0-success-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi31-a0-success-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi31-a0-success-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 0, azione 0, success

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🦵 Tiro angolato» → success

NOTA: Nessun difetto provato negli scatti. Il calcio dell’eroe e il tuffo del portiere sono visibili; testo del gol e passaggio da 0–0 a 1–0 coerenti. L’istante esatto di contatto e la tempestività del portiere non sono certificati dalla sequenza campionata. Nessuna conclusione su fluidità o pattinamento.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi0-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi0-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi0-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi0-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi0-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi0-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 21° (eroe a x 43.7, z 4.3)

Cosa non va secondo me:

### gi 0, azione 0, fail

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🦵 Tiro angolato» → fail

NOTA: Nessun difetto certo attribuito. Esito Tiro centrale – parata facile e punteggio 0–0 coerenti. Il portiere è a terra in 04 e in piedi in 05, ma il contatto palla-portiere non è mostrato: tempestività e qualità della parata non verificate, nessun codice 111 assegnato. I sei istanti non certificano la continuità del gesto.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi0-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi0-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi0-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi0-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi0-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi0-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 4.0 unità fra due fotogrammi a scena in corso (249 u/s) — a 1.1s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 0° (eroe a x 44, z 4.6)

Cosa non va secondo me:

### gi 7, azione 0, success

[KE 7.999.61] SIT #7 [header]: «✈️ Cross in area! Attacca il pallone.» · AZIONE «✈️ Colpo di testa» → success

NOTA: Gol e punteggio da 0–0 a 1–0 coerenti. In 04 il pallone è all’altezza delle gambe mentre l’eroe è in elevazione; possibile disallineamento del colpo di testa, IPOTESI da verificare sul contatto effettivo. Il campione fotografa l’avvio dell’arco e non certifica l’istante anatomico: nessun codice definitivo attribuito. In 05 il pallone è davanti alla porta e il portiere in tuffo.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi7-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi7-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi7-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi7-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi7-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi7-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 6° (eroe a x 38.7, z -4.2)

Cosa non va secondo me:

### gi 7, azione 0, fail

[KE 7.999.61] SIT #7 [header]: «✈️ Cross in area! Attacca il pallone.» · AZIONE «✈️ Colpo di testa» → fail

NOTA: Nessun difetto certo attribuito nei sei scatti. L’apertura è leggibile; parata e punteggio 0–0 sono coerenti. Il testimone registra distanza minima pallone-testa 0,060 u con gesto header (header-v2.json; node tests/codex/highlight-mirato-header.mjs). Il portiere è già a terra in 04–05 e torna in piedi in 06: il sincronismo del tuffo non è verificato dalla sola successione di questi istanti e non viene attribuito 111. Il fotogramma denominato contatto è successivo al punto di minima distanza.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi7-a0-fail-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi7-a0-fail-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi7-a0-fail-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi7-a0-fail-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi7-a0-fail-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi7-a0-fail-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 5.5 unità fra due fotogrammi a scena in corso (343 u/s) — a 1.2s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 1° (eroe a x 38.8, z -4.2)

Cosa non va secondo me:

### gi 17, azione 0, success

[KE 7.999.61] SIT #17 [cross]: «⚡ Cross dalla fascia destra!» · AZIONE «↗️ Cross teso» → success

NOTA: Nessun difetto provato negli scatti. Il cross riuscito è seguito dal testo Il compagno non riesce a concludere – palla che balla in area; il punteggio rimane 0–0, coerentemente. Il pallone attraversa la zona della porta e rimane in area; ricezione e interazione precisa del compagno non sono verificate.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi17-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi17-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi17-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi17-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi17-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi17-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 17, azione 0, fail

[KE 7.999.61] SIT #17 [cross]: «⚡ Cross dalla fascia destra!» · AZIONE «↗️ Cross teso» → fail

NOTA: Nessun difetto certo attribuito. Punteggio invariato 0–0 e azione fermata dalla difesa compatibili con le immagini. Il testo Conclusione murata dopo Cross teso è ambiguo: non è verificato se descriva una conclusione del ricevente o il cross stesso, perché il passaggio intermedio non è interamente campionato. Non assegnato 003 senza questa prova.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi17-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi17-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi17-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi17-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi17-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi17-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 28, azione 0, success

[KE 7.999.61] SIT #28 [pass]: «🎮 Palla a centrocampo. Costruisci.» · AZIONE «⚡ Verticale» → success

NOTA: Nessun difetto provato. Testo Primo tentativo murato – palla viva e punteggio 0–0 coerenti. Le coordinate registrate mostrano il pallone avanzare verso la porta e ritornare dopo la respinta: non sostengono un codice 012. Il pallone basso dietro il giocatore in 04 non dimostra da solo il contatto scorretto. Fonte supplementare: trace-28-success.json, riprodotta con node tests/codex/highlight-mirato-trace.mjs 28 success.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi28-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi28-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi28-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi28-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi28-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi28-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 28, azione 0, fail

[KE 7.999.61] SIT #28 [pass]: «🎮 Palla a centrocampo. Costruisci.» · AZIONE «⚡ Verticale» → fail

NOTA: Nessun difetto certo attribuito. Il risultato rimane 0–0. La frase La difesa mura la conclusione dopo la scelta Verticale è ambigua rispetto a un passaggio: gli scatti non mostrano una conclusione del ricevente e non consentono di escludere un passaggio intermedio non campionato. Possibile incoerenza testuale da verificare; nessun codice definitivo 003 assegnato.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi28-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi28-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi28-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi28-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi28-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi28-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 44, azione 0, success

[KE 7.999.61] SIT #44 [header]: «✈️ Cross avversario in area! Allontana!» · AZIONE «✈️ Stacco di testa deciso» → success

NOTA: 001: anche nella variante riuscita apertura e scelta mostrano terreno centrale e giocatori sui bordi, mentre il protagonista dell’intervento resta sotto il pannello; è visibile in 03. Esito di rinvio riuscito e punteggio invariato 0–0 coerenti. Il pallone passa vicino alla testa nel testimone (minimo 0,262 u; header-v2.json, comando node tests/codex/highlight-mirato-header.mjs): prossimità misurata, sincronismo preciso con la posa non verificato. La bozza considera la direzione della porta avversaria, ma un rinvio difensivo non deve necessariamente puntarla: nessun codice 009 assegnato a quel solo angolo.
Codici: 001. Riferimenti: src/12-three-match-view.jsx:10105–10109; src/12-three-match-view.jsx:10120.

- [01-apertura](highlight-mirato/gi44-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi44-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi44-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi44-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi44-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi44-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 113° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -34, z 13.6)

Cosa non va secondo me:

### gi 44, azione 0, fail

[KE 7.999.61] SIT #44 [header]: «✈️ Cross avversario in area! Allontana!» · AZIONE «✈️ Stacco di testa deciso» → fail

NOTA: 001: in apertura e scelta i protagonisti restano praticamente fuori dalla zona visibile, sotto il pannello delle azioni. 002: il fotogramma finale mostra terreno e righe, senza eroe né porta; il gol subito non è visibile negli scatti. Il punteggio da 0–0 a 0–1 è coerente con il testo, quindi nessun 003 attribuito. Distanza minima pallone-testa 1,559 u nel testimone (header-v2.json; node tests/codex/highlight-mirato-header.mjs): non prova un contatto, ma è compatibile con il tentativo fallito. L’angolo verso la porta avversaria della bozza non viene usato per assegnare 009 in questa azione difensiva. Riproduzione naturale non verificata.
Codici: 001, 002. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi44-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi44-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi44-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi44-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi44-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi44-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 113° — MISURATO girato: al tiro il corpo non guarda la porta (eroe a x -34, z 13.6)

Cosa non va secondo me:

### gi 64, azione 0, success

[KE 7.999.61] SIT #64 [header]: «✈️ Colpo di testa potente da centro area!» · AZIONE «✈️ Testa potente angolato» → success

NOTA: Nessun difetto certo attribuito nei sei scatti. Apertura e scelta mostrano il protagonista; il gol è coerente con il punteggio da 0–0 a 1–0. Nella controprova il testimone registra distanza minima pallone-testa 0,064 u con gesto header (header-v2.json; node tests/codex/highlight-mirato-header.mjs). Il successivo scatto denominato contatto non coincide con la minima distanza e non dimostra un impatto mancato. Sincronismo completo del gesto e del portiere non verificato.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi64-a0-success-v2-apertura-01-apertura.png)
- [02-scelta](highlight-mirato/gi64-a0-success-v2-apertura-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi64-a0-success-v2-apertura-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi64-a0-success-v2-apertura-04-contatto.png)
- [05-volo](highlight-mirato/gi64-a0-success-v2-apertura-05-volo.png)
- [06-esito](highlight-mirato/gi64-a0-success-v2-apertura-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 5° (eroe a x 39.8, z 6.9)

Cosa non va secondo me:

### gi 64, azione 0, fail

[KE 7.999.61] SIT #64 [header]: «✈️ Colpo di testa potente da centro area!» · AZIONE «✈️ Testa potente angolato» → fail

NOTA: Nessun difetto certo attribuito. Esito di parata/deviazione in corner e punteggio 0–0 coerenti. Distanza minima pallone-testa 0,054 u con gesto header attivo (header-v2.json; node tests/codex/highlight-mirato-header.mjs): il pallone basso in 04 non dimostra un colpo di testa mancato. Il portiere è già a terra in 04 e si rialza in 05: possibile intervento anticipato da rivedere con una ripresa continua; contatto palla-portiere e codice 111 non verificati.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi64-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi64-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi64-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi64-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi64-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi64-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 3.7 unità fra due fotogrammi a scena in corso (234 u/s) — a 1.1s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 0° (eroe a x 39.8, z 6.9)

Cosa non va secondo me:

### gi 81, azione 0, success

[KE 7.999.61] SIT #81 [freekick]: «📐 Punizione — muro a 9 metri!» · AZIONE «💥 Botta sopra la barriera» → success

NOTA: 001, allestimento iniziale: la scena annuncia Punizione – muro a 9 metri, ma i difensori visibili sono molto distanziati e non si vede una barriera compatta (01–02). La distanza effettiva dei nove metri non è stata misurata. Gol e punteggio da 0–0 a 1–0 coerenti. Limite del test: la prima opzione visibile è Giro sopra la barriera, mentre il risolutore forzato restituisce Botta sopra la barriera; la corrispondenza con un clic reale sul menu non è verificata e non viene attribuita al gioco come 003.
Codici: 001. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi81-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi81-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi81-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi81-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi81-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi81-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 3° (eroe a x 19.8, z 0.8)

Cosa non va secondo me:

### gi 81, azione 0, fail

[KE 7.999.61] SIT #81 [freekick]: «📐 Punizione — muro a 9 metri!» · AZIONE «💥 Botta sopra la barriera» → fail

NOTA: 001: anche in questa variante il titolo annuncia un muro, mentre i difensori visibili in 01–02 sono distanziati e non formano una barriera compatta. Distanza regolamentare non misurata. Esito di parata e punteggio 0–0 coerenti; il contatto palla-portiere non è verificato. Rimane il limite di corrispondenza fra etichetta del menu e risolutore forzato già descritto nel caso riuscito.
Codici: 001. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi81-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi81-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi81-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi81-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi81-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi81-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 4° (eroe a x 19.8, z 0.8)

Cosa non va secondo me:

### gi 87, azione 0, success

[KE 7.999.61] SIT #87 [cross]: «⚡ Cross di prima senza guardare!» · AZIONE «⚡ Cross cieco di prima» → success

NOTA: Nessun difetto provato negli scatti. Il risultato descrive una conclusione respinta con palla ancora giocabile; punteggio invariato 0–0 coerente. La bozza automatica non segnala salti del pallone in questa acquisizione. Gli scatti non certificano che il cross sia davvero di prima né il contatto del ricevente; questi aspetti restano non verificati.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi87-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi87-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi87-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi87-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi87-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi87-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 87, azione 0, fail

[KE 7.999.61] SIT #87 [cross]: «⚡ Cross di prima senza guardare!» · AZIONE «⚡ Cross cieco di prima» → fail

NOTA: Nessun difetto provato negli scatti. Il cross fermato dalla difesa e il punteggio finale 0–0 sono coerenti. Il pallone non è identificabile con sufficiente continuità in tutti gli istanti, quindi contatto del difensore, traiettoria completa e carattere di prima del cross restano non verificati.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi87-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi87-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi87-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi87-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi87-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi87-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 92, azione 0, success

[KE 7.999.61] SIT #92 [shot]: «🔄 Roulette sul difensore!» · AZIONE «🔄 Roulette di classe» → success

NOTA: Nessun difetto provato negli scatti. Conclusione e gol sono visibili; punteggio da 0–0 a 1–0 coerente. La rotazione completa della roulette non è documentata dai sei istanti. In 02 Roulette di classe è la seconda opzione visibile, mentre il test usa l’indice canonico 0 di SITUATIONS: l’indice del comando non va interpretato come posizione del primo pulsante sullo schermo.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi92-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi92-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi92-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi92-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi92-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi92-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 4° (eroe a x 27.9, z 1.9)

Cosa non va secondo me:

### gi 92, azione 0, fail

[KE 7.999.61] SIT #92 [shot]: «🔄 Roulette sul difensore!» · AZIONE «🔄 Roulette di classe» → fail

NOTA: Nessun difetto provato negli scatti. Esito di deviazione in corner e punteggio 0–0 coerenti. Il tiro è visibile, ma la rotazione completa della roulette e il contatto con il portiere non sono verificati dai sei istanti. Anche qui l’azione canonica 0 corrisponde a Roulette di classe, seconda opzione del menu visibile.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi92-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi92-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi92-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi92-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi92-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi92-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 5.8 unità fra due fotogrammi a scena in corso (363 u/s) — a 1.1s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 1° (eroe a x 27.7, z 14.1)

Cosa non va secondo me:

### gi 123, azione 0, success

[KE 7.999.61] SIT #123 [build]: «🏃 Ricezione di spalle e giratone!» · AZIONE «🌀 Giratone e conduci» → success

NOTA: 003: dopo Giratone e conduci compaiono Riaggressione immediata e Muro invalicabile, testi difensivi per una scelta offensiva. Il checkpoint restituisce outKey=recovery; la stessa ricompensa è assegnata dall’azione nel catalogo. Osservazione coerente con il problema della scena 30, causa da confermare con il guardiano del team. Punteggio invariato 0–0. La rotazione completa della girata non è verificata dai sei istanti.
Codici: 003. Riferimenti: src/04-situazioni-zone-piazzati.jsx:454; src/15-live-match.jsx:8511; src/05-cronaca-stadi-formazioni.jsx:321; src/05-cronaca-stadi-formazioni.jsx:335.

- [01-apertura](highlight-mirato/gi123-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi123-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi123-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi123-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi123-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi123-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 123, azione 0, fail

[KE 7.999.61] SIT #123 [build]: «🏃 Ricezione di spalle e giratone!» · AZIONE «🌀 Giratone e conduci» → fail

NOTA: Nessun difetto provato negli scatti. Il testo Murato dalla difesa è compatibile con la conduzione fermata; diversamente dalla frase della scena 30 fallita, qui non viene menzionata esplicitamente una conclusione. Punteggio invariato 0–0. La girata completa e la continuità del controllo del pallone non sono verificate dai sei istanti.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi123-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi123-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi123-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi123-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi123-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi123-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 152, azione 0, success

[KE 7.999.61] SIT #152 [pass]: «📋 Schema doppio dai e vai!» · AZIONE «📋 Schema a tre — dai, ricevi, tira» → success

NOTA: Nessun difetto certo attribuito. Il risultato descrive un’occasione viva con un compagno libero e mantiene 0–0: non dichiara un gol inesistente. I sei scatti non documentano tutti gli scambi del doppio dai-e-vai né una conclusione finale, quindi l’esecuzione completa dello schema annunciato resta non verificata. La scelta canonica del test non coincide con la prima opzione visibile del menu.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi152-a0-success-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi152-a0-success-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi152-a0-success-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi152-a0-success-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi152-a0-success-v2-05-volo.png)
- [06-esito](highlight-mirato/gi152-a0-success-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

### gi 152, azione 0, fail

[KE 7.999.61] SIT #152 [pass]: «📋 Schema doppio dai e vai!» · AZIONE «📋 Schema a tre — dai, ricevi, tira» → fail

NOTA: Nessun difetto certo attribuito nei sei scatti. Il risultato «Murato dalla difesa» mantiene 0–0 ed è compatibile con lo schema interrotto. I fotogrammi non documentano tutti gli scambi né il preciso intervento difensivo: sequenza completa non verificata. La scelta canonica del test non coincide con la prima opzione visibile.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi152-a0-fail-v2-01-apertura.png)
- [02-scelta](highlight-mirato/gi152-a0-fail-v2-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi152-a0-fail-v2-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi152-a0-fail-v2-04-contatto.png)
- [05-volo](highlight-mirato/gi152-a0-fail-v2-05-volo.png)
- [06-esito](highlight-mirato/gi152-a0-fail-v2-06-esito.png)

Bozza automatica, non verdetto: nessuna segnalazione automatica

## Confronto con partite naturali

Partite naturali validate con questo protocollo: 0. Il campione concordato riguarda solo scene forzate; la riproduzione naturale delle anomalie e le differenze fra scene forzate e naturali sono non verificate. Non si riutilizzano a tale scopo le acquisizioni precedenti con protocollo diverso.

## Dati e controlli riproducibili

- [Distanza pallone-testa](highlight-mirato/header-v2.json): `node tests/codex/highlight-mirato-header.mjs`.
- [Stato repository e versione](highlight-mirato/repo-state.json): `node tests/codex/highlight-mirato-repo.mjs`.
- [Campioni grezzi compressi](highlight-mirato/samples.json.gz) e [verifica compressione](highlight-mirato/pack.json): `node tests/codex/highlight-mirato-pack.mjs`, da eseguire solo dopo la chiusura del runner.
- [Controlli degli script](highlight-mirato/checks.json): `node tests/codex/highlight-mirato-checks.mjs`.
- Controprove aperture: `node tests/codex/highlight-mirato-counterproof.mjs` con CPM_CHROME configurato come sopra. Le note prima delle controprove sono conservate in [review-before-apertura.json](highlight-mirato/review-before-apertura.json).

## Errori di acquisizione

- 6:0:success: clock.pauseAt: Error: Cannot fast-forward to the past; durata 86231 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 30:0:fail: page.evaluate: Target page, context or browser has been closed; durata 57266 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 31:0:success: page.evaluate: Target page, context or browser has been closed; durata 78422 ms. Fonte: runs[].error / wallMs nel checkpoint.

## Cosa resta non verificato

Confronto con partite naturali, contatto esatto per ogni gesto, stabilità del comportamento sotto tempo reale e tutte le combinazioni non elencate. I valori FPS visibili nelle immagini sono alterati dal clock di prova. Gli errori del runner non sono difetti del gioco. Le aperture nere sono conteggiate separatamente in highlight-mirato/audit-v2.json: non sono aperture valutate positivamente. L’avviso TimeoutNegativeWarning del runner è conservato in highlight-mirato/execution-notes.json; il suo impatto non è verificato. I casi preliminari a doppia forzatura (rapporto senza suffisso v2) non entrano nei conteggi di questo rapporto.
