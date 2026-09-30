# Collaudo mirato degli highlight — 7.999.61

**Materiale preliminare V1: include una scena di riscaldamento forzata. Non è il rapporto definitivo del campione.**
Piano: 32 combinazioni. Acquisite senza errore: 14. Tentativi con errore: 7. Note presenti: 14.

## Codici osservati nel campione

| Codice | Casi | Riferimenti (gi:azione:esito) |
|---|---:|---|
| 003 | 2 | 30:0:success, 30:0:fail |
| 001 | 2 | 31:0:success, 31:0:fail |
| 002 | 1 | 31:0:fail |

I codici descrivono quanto visto nei casi forzati; non sono una misura di frequenza nelle partite naturali.

Fonte dei conteggi: [checkpoint](../../tests/codex/highlight-mirato.json). Comando completo di riepilogo:
```powershell
node tests/codex/highlight-mirato-report.mjs
```

Acquisizione, dalla radice:
```powershell
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:CPM_BATCH='1'
node tests/codex/highlight-mirato.mjs
node tests/codex/highlight-mirato-sheet.mjs
```

## Metodo e limiti

Pagina nuova per caso; viewport 412×915, GLB/PRESENT/CINE accesi; service worker bloccati. Chrome headless tramite harness SwiftShader. Il clock viene fermato dopo il riscaldamento e la scena viene avanzata a passi simulati. Nessuna misura di FPS, fluidità, durata reale del gesto o prestazioni mobile è valida con questo metodo. Il contatto è il primo campione con il testimone di avvio traiettoria: non certifica il contatto anatomico. Apertura e scelta possono riprendere la stessa fase; il difetto non va attribuito al gioco senza una prova indipendente.

## Note e prove

| gi | Azione | Esito richiesto | Esito corrisponde | Immagini | Nota |
|---:|---|---|---|---:|---|
| 6 | ✈️ Stacco di testa | success | true | 6 | Esito goal coerente con punteggio superiore e tabellone finale 1–0. Nel fotogramma 04 l'eroe è in aria e il pallone appare all'altezza delle gambe; il campione registra y=1,1077. Possibile disallineamento del colpo di testa, IPOTESI da riprodurre: il testimone coincide con avvio traiettoria, non certifica contatto anatomico. 01 e 02 riprendono il corner e lo stesso menu: apertura distinta non documentata. Nessun codice definitivo assegnato. |
| 6 | ✈️ Stacco di testa | fail | true | 6 | Punteggi finali coerenti: 0–0. Nei fotogrammi 04 e 05 il pallone passa dalla zona delle gambe a una traiettoria alta mentre il giocatore salta: possibile disallineamento del colpo di testa, IPOTESI. La deviazione in corner dichiarata dal testo non è catturata; non verificata. Bozza 007 non validata come tremolio: il clock è simulato. Apertura e scelta sono la stessa vista. |
| 16 | ↗️ Cross teso | fail | true | 6 | Nessun difetto provato negli scatti. L esito Non trova lo specchio è compatibile con il punteggio 0–0. 04 mostra il pallone già lontano dall eroe: il contatto reale non è certificato. Apertura e scelta hanno la stessa inquadratura; nessuna conclusione sulla camera in movimento. |
| 16 | ↗️ Cross teso | success | true | 6 | Nessun difetto certo. Il cross riuscito non equivale a gol: il testo dichiara primo tentativo murato e palla viva, con punteggio coerente 0–0. Nel fotogramma 05 la palla non è riconoscibile; la continuità della traiettoria e il contatto reale non sono verificati. Apertura e scelta stessa vista. |
| 25 | 🎯 Filtrante millimetrico | success | true | 6 | Nessun difetto provato. Punteggio 0–0 coerente con la conclusione respinta dichiarata dal testo dopo il filtrante. Il pallone è visibile davanti alla porta e poi torna nella zona laterale. Il contatto del ricevente e la respinta non sono documentati in modo sufficiente per valutarne il sincronismo. Apertura e scelta stessa vista. |
| 25 | 🎯 Filtrante millimetrico | fail | true | 6 | Nessun difetto provato. Esito fuorigioco e punteggio 0–0 coerenti. Gli scatti non consentono di stabilire se la posizione del ricevente fosse effettivamente irregolare al momento del passaggio: esattezza del fuorigioco non verificata. Apertura e scelta riprendono la stessa fase. |
| 30 | 🌀 Dribbling centrale e conduci | success | true | 6 | 003: dopo la scelta offensiva Dribbling centrale e conduci, il risultato mostra Intercetto perfetto e Anticipo perfetto. Incoerenza testuale visibile, confermata nel singolo caso forzato; il checkpoint riporta def=false, tipo off, outKey=recovery. Non verificata in partita naturale. Punteggio invariato 0–1, nessuna conclusione su fluidità o pattinamento. Letto nel codice: l azione assegna recovery; il risolutore usa action.rew anche fuori dalla forzatura e i testi recovery sono difensivi. Causa compatibile con il dato, da confermare dal team. |
| 30 | 🌀 Dribbling centrale e conduci | fail | true | 6 | 003: dopo Dribbling centrale e conduci il risultato recita Murato dalla difesa e La difesa mura la conclusione. La scelta non era un tiro e la sequenza mostra un contrasto in conduzione: incoerenza testuale visibile nel caso forzato. Il checkpoint riporta intercept. Punteggio invariato 0–0. Non verificato nel flusso naturale. |
| 31 | 🛡️ Scivolata netta | success | true | 6 | 001: apertura e scelta mostrano un inquadratura del campo che non comprende i protagonisti del contrasto; diventano visibili in 03. Osservazione limitata al caso forzato con clock controllato. In 05 la scivolata è visibile; testo finale di recupero coerente con la scelta difensiva. La bozza 001 sulla distanza dai nostri NON è prova autonoma: il portatore previsto è avversario. |
| 31 | 🛡️ Scivolata netta | fail | true | 6 | 001/002: apertura e scelta mostrano soltanto il campo; 03, 05 e 06 non inquadrano i protagonisti. In 04 si vede solo un giocatore al margine destro. Il fallo è dichiarato mentre il gesto non è visibile. Verificato nelle immagini del caso forzato, non in partita naturale; causa non verificata. La bozza sulla distanza della palla dai nostri non viene usata come prova, trattandosi di difesa. |
| 0 | 🦵 Tiro angolato | success | true | 6 | Nessun difetto provato negli scatti. Calcio e tuffo del portiere sono visibili; esito goal e punteggi finali 1–0 coerenti. Contatto anatomico esatto e sincronismo del tuffo non certificati dai sei istanti. Angolo di 34 gradi della bozza non basta a provare una direzione sbagliata. |
| 0 | 🦵 Tiro angolato | fail | true | 6 | Nessun difetto certo attribuito. Punteggio finale 0–0 coerente con mancato gol; il testo dichiara parata facile. Gli istanti salvati non mostrano chiaramente il contatto palla-portiere, quindi la qualità e il sincronismo della parata restano non verificati. La bozza 007 non è validata come difetto di movimento. |
| 7 | ✈️ Colpo di testa | fail | true | 6 | Punteggio finale 0–0 e conclusione fallita coerenti. Nel fotogramma 04 il pallone appare basso rispetto al giocatore in elevazione: possibile disallineamento del colpo di testa, IPOTESI, contatto anatomico esatto non verificato. La bozza 007 non viene confermata come difetto di movimento. |
| 17 | ↗️ Cross teso | success | true | 6 | Nessun difetto certo negli scatti. Il testo dichiara un cross pericoloso senza conclusione del compagno; il punteggio rimane 1–0, già presente prima della scelta. Il pallone attraversa il campo ma la ricezione esatta non è certificata. Apertura e scelta stessa vista. |

### gi 6, azione 0, success

[KE 7.999.61] SIT #6 [header]: «🏳️ Corner! Attacca il secondo palo.» · AZIONE «✈️ Stacco di testa» → success

NOTA: Esito goal coerente con punteggio superiore e tabellone finale 1–0. Nel fotogramma 04 l'eroe è in aria e il pallone appare all'altezza delle gambe; il campione registra y=1,1077. Possibile disallineamento del colpo di testa, IPOTESI da riprodurre: il testimone coincide con avvio traiettoria, non certifica contatto anatomico. 01 e 02 riprendono il corner e lo stesso menu: apertura distinta non documentata. Nessun codice definitivo assegnato.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi6-a0-success-01-apertura.png)
- [02-scelta](highlight-mirato/gi6-a0-success-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi6-a0-success-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi6-a0-success-04-contatto.png)
- [05-volo](highlight-mirato/gi6-a0-success-05-volo.png)
- [06-esito](highlight-mirato/gi6-a0-success-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 17° (eroe a x 38.8, z -5.5)

Cosa non va secondo me:

### gi 6, azione 0, fail

[KE 7.999.61] SIT #6 [header]: «🏳️ Corner! Attacca il secondo palo.» · AZIONE «✈️ Stacco di testa» → fail

NOTA: Punteggi finali coerenti: 0–0. Nei fotogrammi 04 e 05 il pallone passa dalla zona delle gambe a una traiettoria alta mentre il giocatore salta: possibile disallineamento del colpo di testa, IPOTESI. La deviazione in corner dichiarata dal testo non è catturata; non verificata. Bozza 007 non validata come tremolio: il clock è simulato. Apertura e scelta sono la stessa vista.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi6-a0-fail-01-apertura.png)
- [02-scelta](highlight-mirato/gi6-a0-fail-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi6-a0-fail-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi6-a0-fail-04-contatto.png)
- [05-volo](highlight-mirato/gi6-a0-fail-05-volo.png)
- [06-esito](highlight-mirato/gi6-a0-fail-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 2.5 unità fra due fotogrammi a scena in corso (159 u/s) — a 0.9s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 17° (eroe a x 38.8, z -5.5)

Cosa non va secondo me:

### gi 16, azione 0, fail

[KE 7.999.61] SIT #16 [cross]: «⚡ Cross dalla fascia sinistra!» · AZIONE «↗️ Cross teso» → fail

NOTA: Nessun difetto provato negli scatti. L esito Non trova lo specchio è compatibile con il punteggio 0–0. 04 mostra il pallone già lontano dall eroe: il contatto reale non è certificato. Apertura e scelta hanno la stessa inquadratura; nessuna conclusione sulla camera in movimento.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi16-a0-fail-01-apertura.png)
- [02-scelta](highlight-mirato/gi16-a0-fail-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi16-a0-fail-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi16-a0-fail-04-contatto.png)
- [05-volo](highlight-mirato/gi16-a0-fail-05-volo.png)
- [06-esito](highlight-mirato/gi16-a0-fail-06-esito.png)

Bozza automatica, non verdetto: assente

### gi 16, azione 0, success

[KE 7.999.61] SIT #16 [cross]: «⚡ Cross dalla fascia sinistra!» · AZIONE «↗️ Cross teso» → success

NOTA: Nessun difetto certo. Il cross riuscito non equivale a gol: il testo dichiara primo tentativo murato e palla viva, con punteggio coerente 0–0. Nel fotogramma 05 la palla non è riconoscibile; la continuità della traiettoria e il contatto reale non sono verificati. Apertura e scelta stessa vista.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi16-a0-success-01-apertura.png)
- [02-scelta](highlight-mirato/gi16-a0-success-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi16-a0-success-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi16-a0-success-04-contatto.png)
- [05-volo](highlight-mirato/gi16-a0-success-05-volo.png)
- [06-esito](highlight-mirato/gi16-a0-success-06-esito.png)

Bozza automatica, non verdetto: assente

### gi 25, azione 0, success

[KE 7.999.61] SIT #25 [pass]: «🎯 Filtrante per il centravanti!» · AZIONE «🎯 Filtrante millimetrico» → success

NOTA: Nessun difetto provato. Punteggio 0–0 coerente con la conclusione respinta dichiarata dal testo dopo il filtrante. Il pallone è visibile davanti alla porta e poi torna nella zona laterale. Il contatto del ricevente e la respinta non sono documentati in modo sufficiente per valutarne il sincronismo. Apertura e scelta stessa vista.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi25-a0-success-01-apertura.png)
- [02-scelta](highlight-mirato/gi25-a0-success-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi25-a0-success-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi25-a0-success-04-contatto.png)
- [05-volo](highlight-mirato/gi25-a0-success-05-volo.png)
- [06-esito](highlight-mirato/gi25-a0-success-06-esito.png)

Bozza automatica, non verdetto: assente

### gi 25, azione 0, fail

[KE 7.999.61] SIT #25 [pass]: «🎯 Filtrante per il centravanti!» · AZIONE «🎯 Filtrante millimetrico» → fail

NOTA: Nessun difetto provato. Esito fuorigioco e punteggio 0–0 coerenti. Gli scatti non consentono di stabilire se la posizione del ricevente fosse effettivamente irregolare al momento del passaggio: esattezza del fuorigioco non verificata. Apertura e scelta riprendono la stessa fase.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi25-a0-fail-01-apertura.png)
- [02-scelta](highlight-mirato/gi25-a0-fail-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi25-a0-fail-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi25-a0-fail-04-contatto.png)
- [05-volo](highlight-mirato/gi25-a0-fail-05-volo.png)
- [06-esito](highlight-mirato/gi25-a0-fail-06-esito.png)

Bozza automatica, non verdetto: assente

### gi 30, azione 0, success

[KE 7.999.61] SIT #30 [dribble]: «🌀 Sfida 1v1 a centrocampo!» · AZIONE «🌀 Dribbling centrale e conduci» → success

NOTA: 003: dopo la scelta offensiva Dribbling centrale e conduci, il risultato mostra Intercetto perfetto e Anticipo perfetto. Incoerenza testuale visibile, confermata nel singolo caso forzato; il checkpoint riporta def=false, tipo off, outKey=recovery. Non verificata in partita naturale. Punteggio invariato 0–1, nessuna conclusione su fluidità o pattinamento. Letto nel codice: l azione assegna recovery; il risolutore usa action.rew anche fuori dalla forzatura e i testi recovery sono difensivi. Causa compatibile con il dato, da confermare dal team.
Codici: 003. Riferimenti: src/04-situazioni-zone-piazzati.jsx:222; src/15-live-match.jsx:8511; src/05-cronaca-stadi-formazioni.jsx:321; src/05-cronaca-stadi-formazioni.jsx:335.

- [01-apertura](highlight-mirato/gi30-a0-success-01-apertura.png)
- [02-scelta](highlight-mirato/gi30-a0-success-02-scelta.png)
- [04-contatto](highlight-mirato/gi30-a0-success-04-contatto.png)
- [03-rincorsa](highlight-mirato/gi30-a0-success-03-rincorsa.png)
- [05-volo](highlight-mirato/gi30-a0-success-05-volo.png)
- [06-esito](highlight-mirato/gi30-a0-success-06-esito.png)

Bozza automatica, non verdetto: assente

### gi 30, azione 0, fail

[KE 7.999.61] SIT #30 [dribble]: «🌀 Sfida 1v1 a centrocampo!» · AZIONE «🌀 Dribbling centrale e conduci» → fail

NOTA: 003: dopo Dribbling centrale e conduci il risultato recita Murato dalla difesa e La difesa mura la conclusione. La scelta non era un tiro e la sequenza mostra un contrasto in conduzione: incoerenza testuale visibile nel caso forzato. Il checkpoint riporta intercept. Punteggio invariato 0–0. Non verificato nel flusso naturale.
Codici: 003. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi30-a0-fail-01-apertura.png)
- [02-scelta](highlight-mirato/gi30-a0-fail-02-scelta.png)
- [04-contatto](highlight-mirato/gi30-a0-fail-04-contatto.png)
- [03-rincorsa](highlight-mirato/gi30-a0-fail-03-rincorsa.png)
- [05-volo](highlight-mirato/gi30-a0-fail-05-volo.png)
- [06-esito](highlight-mirato/gi30-a0-fail-06-esito.png)

Bozza automatica, non verdetto: assente

### gi 31, azione 0, success

[KE 7.999.61] SIT #31 [tackle]: «🛡️ Avversario porta palla — sfida in scivolata!» · AZIONE «🛡️ Scivolata netta» → success

NOTA: 001: apertura e scelta mostrano un inquadratura del campo che non comprende i protagonisti del contrasto; diventano visibili in 03. Osservazione limitata al caso forzato con clock controllato. In 05 la scivolata è visibile; testo finale di recupero coerente con la scelta difensiva. La bozza 001 sulla distanza dai nostri NON è prova autonoma: il portatore previsto è avversario.
Codici: 001. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi31-a0-success-01-apertura.png)
- [02-scelta](highlight-mirato/gi31-a0-success-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi31-a0-success-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi31-a0-success-04-contatto.png)
- [05-volo](highlight-mirato/gi31-a0-success-05-volo.png)
- [06-esito](highlight-mirato/gi31-a0-success-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 4.6u, eroe ≥3.5u per 89 campioni)

Cosa non va secondo me:

### gi 31, azione 0, fail

[KE 7.999.61] SIT #31 [tackle]: «🛡️ Avversario porta palla — sfida in scivolata!» · AZIONE «🛡️ Scivolata netta» → fail

NOTA: 001/002: apertura e scelta mostrano soltanto il campo; 03, 05 e 06 non inquadrano i protagonisti. In 04 si vede solo un giocatore al margine destro. Il fallo è dichiarato mentre il gesto non è visibile. Verificato nelle immagini del caso forzato, non in partita naturale; causa non verificata. La bozza sulla distanza della palla dai nostri non viene usata come prova, trattandosi di difesa.
Codici: 001, 002. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi31-a0-fail-01-apertura.png)
- [02-scelta](highlight-mirato/gi31-a0-fail-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi31-a0-fail-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi31-a0-fail-04-contatto.png)
- [05-volo](highlight-mirato/gi31-a0-fail-05-volo.png)
- [06-esito](highlight-mirato/gi31-a0-fail-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino 3.7u, eroe ≥18.4u per 80 campioni)

Cosa non va secondo me:

### gi 0, azione 0, success

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🦵 Tiro angolato» → success

NOTA: Nessun difetto provato negli scatti. Calcio e tuffo del portiere sono visibili; esito goal e punteggi finali 1–0 coerenti. Contatto anatomico esatto e sincronismo del tuffo non certificati dai sei istanti. Angolo di 34 gradi della bozza non basta a provare una direzione sbagliata.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi0-a0-success-01-apertura.png)
- [02-scelta](highlight-mirato/gi0-a0-success-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi0-a0-success-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi0-a0-success-04-contatto.png)
- [05-volo](highlight-mirato/gi0-a0-success-05-volo.png)
- [06-esito](highlight-mirato/gi0-a0-success-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· corpo↔porta al contatto: 34° (eroe a x 43.6, z 4.3)

Cosa non va secondo me:

### gi 0, azione 0, fail

[KE 7.999.61] SIT #0 [shot]: «⚡ Solo davanti al portiere!» · AZIONE «🦵 Tiro angolato» → fail

NOTA: Nessun difetto certo attribuito. Punteggio finale 0–0 coerente con mancato gol; il testo dichiara parata facile. Gli istanti salvati non mostrano chiaramente il contatto palla-portiere, quindi la qualità e il sincronismo della parata restano non verificati. La bozza 007 non è validata come difetto di movimento.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi0-a0-fail-01-apertura.png)
- [02-scelta](highlight-mirato/gi0-a0-fail-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi0-a0-fail-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi0-a0-fail-04-contatto.png)
- [05-volo](highlight-mirato/gi0-a0-fail-05-volo.png)
- [06-esito](highlight-mirato/gi0-a0-fail-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 4.0 unità fra due fotogrammi a scena in corso (249 u/s) — a 0.9s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 1° (eroe a x 44.1, z 4.7)

Cosa non va secondo me:

### gi 7, azione 0, fail

[KE 7.999.61] SIT #7 [header]: «✈️ Cross in area! Attacca il pallone.» · AZIONE «✈️ Colpo di testa» → fail

NOTA: Punteggio finale 0–0 e conclusione fallita coerenti. Nel fotogramma 04 il pallone appare basso rispetto al giocatore in elevazione: possibile disallineamento del colpo di testa, IPOTESI, contatto anatomico esatto non verificato. La bozza 007 non viene confermata come difetto di movimento.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi7-a0-fail-01-apertura.png)
- [02-scelta](highlight-mirato/gi7-a0-fail-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi7-a0-fail-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi7-a0-fail-04-contatto.png)
- [05-volo](highlight-mirato/gi7-a0-fail-05-volo.png)
- [06-esito](highlight-mirato/gi7-a0-fail-06-esito.png)

Bozza automatica, non verdetto: Cosa ho visto (bozza automatica):
· codice 007 — la CAMERA salta: passo di 4.5 unità fra due fotogrammi a scena in corso (282 u/s) — a 0.9s dall'inizio scena, intervallo 16ms
· corpo↔porta al contatto: 9° (eroe a x 38.8, z -4.2)

Cosa non va secondo me:

### gi 17, azione 0, success

[KE 7.999.61] SIT #17 [cross]: «⚡ Cross dalla fascia destra!» · AZIONE «↗️ Cross teso» → success

NOTA: Nessun difetto certo negli scatti. Il testo dichiara un cross pericoloso senza conclusione del compagno; il punteggio rimane 1–0, già presente prima della scelta. Il pallone attraversa il campo ma la ricezione esatta non è certificata. Apertura e scelta stessa vista.
Codici: nessuno attribuito. Riferimenti: solo immagini.

- [01-apertura](highlight-mirato/gi17-a0-success-01-apertura.png)
- [02-scelta](highlight-mirato/gi17-a0-success-02-scelta.png)
- [03-rincorsa](highlight-mirato/gi17-a0-success-03-rincorsa.png)
- [04-contatto](highlight-mirato/gi17-a0-success-04-contatto.png)
- [05-volo](highlight-mirato/gi17-a0-success-05-volo.png)
- [06-esito](highlight-mirato/gi17-a0-success-06-esito.png)

Bozza automatica, non verdetto: assente

## Errori di acquisizione

- 6:0:success: page.waitForFunction: Timeout 60000ms exceeded.; durata 134164 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 6:0:fail: clock.pauseAt: Error: Cannot fast-forward to the past; durata 74869 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 16:0:success: clock.pauseAt: Error: Cannot fast-forward to the past; durata 87879 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 16:0:fail: page.waitForFunction: Target page, context or browser has been closed; durata 49126 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 16:0:success: page.waitForFunction: Timeout 60000ms exceeded.; durata 129223 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 0:0:fail: page.goto: Target page, context or browser has been closed; durata 20844 ms. Fonte: runs[].error / wallMs nel checkpoint.
- 7:0:success: page.waitForFunction: Timeout 120000ms exceeded.; durata 198170 ms. Fonte: runs[].error / wallMs nel checkpoint.

## Cosa resta non verificato

Confronto con partite naturali, contatto esatto per ogni gesto, stabilità del comportamento sotto tempo reale e tutte le combinazioni non elencate. I valori FPS visibili nelle immagini sono alterati dal clock di prova. Gli errori del runner non sono difetti del gioco.
