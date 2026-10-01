# Ricollaudo difesa 3D — CPM 7.999.91

Base verificata: main d5d60bedec39b2d2dfbd7ebceccfa206999f36d2, GAME_VERSION=7.999.91; ramo codex/2026-10-01-ricollaudo-difesa-3d. Le 16 scene con azione canonica 0 sono state provate con success e fail, una pagina nuova per caso, GLB/PRESENT/CINE accesi, 412×915.

## Esito e metodo

Casi **32/32 validi**, **32/32** con ActionResolved concorde con l’esito richiesto; 2 tentativi non validi conservati nel grezzo. I codici sono giudizi sui sei PNG selezionati, non difetti confermati in partita naturale. La bozza __CPM_DRAFTNOTE è conservata nel grezzo e non è stata copiata nei codici visivi.

Comandi completi da PowerShell, dalla radice del repository:

```powershell
node --check tests/codex/ricollaudo-difesa-3d.mjs
$env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs
node tests/codex/ricollaudo-difesa-3d-sintesi.mjs
```

La sonda esegue i casi ancora privi di prova valida; per ciascuno forza la scena e l’esito, poi verifica ActionResolved. La prima foto è scattata a 900 ms simulati dall’avvio della scena; quando il frame era ancora nero è stato conservato il tentativo e scelta la ripresa 32 ms dopo. Le 03–05 sono campioni distinti; «04-contatto» è in diversi casi un proxy temporale o d’arco, non la misura di un impatto fisico. Due tentativi invalidi sono rimasti nel grezzo: arresto per RAM e ordine errato delle foto. Il banco è headless: nessuna conclusione su fluidità, FPS o telefono.

## Codici assegnati sui 32 casi

| Codice | Casi | Evidenza |
| --- | ---: | --- |
| 001 apertura senza contesto | 6 | gi138 success/fail, gi36 success/fail, gi45 success/fail: foto 01. |
| 002 eroe o pallone fuori quadro | 8 | gi133 fail, gi138 success/fail, gi168 fail, gi31 fail, gi32 success/fail, gi36 success: foto 04–05. |
| 003 esito bugiardo | 0 | Nessuna contraddizione dimostrata dagli scatti; la traiettoria completa di alcuni gol non è verificata. |
| Altri codici del menu (000, 004–012, 014, 111, 113) | 0 assegnati | Le sei foto non permettono di escludere difetti fra i campioni. |

## Prima (7.999.84) → adesso (7.999.91)

Le celle riportano success / fail. «—» significa nessun codice assegnato, non assenza dimostrata di ogni difetto.

| gi | 7.999.84 success / fail | 7.999.91 success / fail |
| ---: | --- | --- |
| 33 | — / 003 | — / — |
| 133 | 001, 002 / 001, 002, 003 | — / 002 |
| 134 | 001 / 001, 003 | — / — |
| 138 | 001 / 001 | 001, 002 / 001, 002 |
| 168 | 001, 002 / 001, 002 | — / 002 |
| 31 | 001 / 001 | — / 002 |
| 32 | 001 / 001, 002 | 002 / 002 |
| 36 | 001 / 001, 003 | 001, 002 / 001 |
| 44 | 001 / 001, 003 | — / — |
| 45 | 001 / 001, 003 | 001 / 001 |
| 128 | 001 / 001, 002 | — / — |
| 137 | 001 / 001 | — / — |
| 157 | 002 / 002, 003 | — / — |
| 184 | 001 / 001, 002 | — / — |
| 24 | — / — | — / — |
| 2 | — / — | — / — |

## Schede per caso

La distanza eroe–palla è calcolata in pianta con `Math.hypot(last.x-last.hx,last.z-last.hz)` sul testimone della foto 01 (unità del gioco). Il campo `md` misura invece il compagno di movimento più vicino alla palla (`src/12-three-match-view.jsx:3256–3260`) e non viene usato come distanza dell’eroe. In «quadro», «esito» e «gesto» un giudizio parziale resta tale. Le sei foto esatte di ogni riga sono nel JSON di sintesi; qui sono collegate apertura, momento centrale e risultato.

| gi | Esito richiesto → ActionResolved | eroe–palla (u) | 01 apertura | 03–05 quadro | 06 esito | Gesto | Codici | Foto |
| ---: | --- | ---: | --- | --- | --- | --- | --- | --- |
| 33 | success → save | 3.04 | eroe, attaccante e pallone visibili | eroe e pallone restano leggibili | 0–0; salvataggio dichiarato | blocco col corpo parziale | — | [01](ricollaudo-difesa-3d/gi33-a0-success-v91-01-apertura.png) [04](ricollaudo-difesa-3d/gi33-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi33-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi33-a0-success-v91-06-esito.png) |
| 33 | fail → goal_against | 2.92 | eroe, attaccante e pallone visibili | palla e difensore leggibili; 0–0 in 03–05 | 0–1 in 06; arrivo in rete non verificato | blocco fallito parziale | — | [01](ricollaudo-difesa-3d/gi33-a0-fail-v91-r2-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi33-a0-fail-v91-r2-04-contatto.png) [05](ricollaudo-difesa-3d/gi33-a0-fail-v91-r2-05-volo.png) [06](ricollaudo-difesa-3d/gi33-a0-fail-v91-r2-06-esito.png) |
| 133 | success → save | 3.67 | eroe, portatore e palla sopra la scheda | eroe e pallone visibili in 04–05 | 0–0; salvataggio dichiarato | sprint visibile; contatto non isolato | — | [01](ricollaudo-difesa-3d/gi133-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi133-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi133-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi133-a0-success-v91-06-esito.png) |
| 133 | fail → goal_against | 3.88 | eroe, portatore e palla sopra la scheda | palla fuori quadro in 04–05; eroe visibile | 0–1 in 06; traiettoria finale non verificata | sprint visibile; contatto non isolato | 002 | [01](ricollaudo-difesa-3d/gi133-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi133-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi133-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi133-a0-fail-v91-06-esito.png) |
| 134 | success → save | 3.29 | protagonisti visibili | protagonisti visibili; contatto aereo non isolato | 0–0; salvataggio dichiarato | stacco parziale | — | [01](ricollaudo-difesa-3d/gi134-a0-success-v91-01-apertura.png) [04](ricollaudo-difesa-3d/gi134-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi134-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi134-a0-success-v91-06-esito.png) |
| 134 | fail → goal_against | 3.55 | protagonisti visibili | palla a terra in 04–05; traiettoria aerea non chiarita | 0–1 in 06; nesso col gesto non verificato | contatto non misurato: proxy temporale | — | [01](ricollaudo-difesa-3d/gi134-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi134-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi134-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi134-a0-fail-v91-06-esito.png) |
| 138 | success → save | 5.64 | pallone e portatore assenti; eroe vicino alla scheda | pallone assente in 04–05 | 0–0; salvataggio dichiarato senza intervento visibile | allineamento non verificato | 001, 002 | [01](ricollaudo-difesa-3d/gi138-a0-success-v91-01-apertura.png) [04](ricollaudo-difesa-3d/gi138-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi138-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi138-a0-success-v91-06-esito.png) |
| 138 | fail → through | 5.58 | pallone e portatore assenti; eroe vicino alla scheda | palla esce in basso a sinistra in 05 | 0–0; superamento dichiarato | allineamento parziale | 001, 002 | [01](ricollaudo-difesa-3d/gi138-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi138-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi138-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi138-a0-fail-v91-06-esito.png) |
| 168 | success → recovery | 3.21 | eroe, avversario e palla visibili | palla al margine sinistro in 04–05 | 0–0; recupero dichiarato | tackle parziale | — | [01](ricollaudo-difesa-3d/gi168-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi168-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi168-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi168-a0-success-v91-06-esito.png) |
| 168 | fail → foul | 3.23 | eroe, avversario e palla visibili | palla esce a sinistra in 05; eroe a terra | 0–0; fallo e ammonizione dichiarati | scivolata visibile | 002 | [01](ricollaudo-difesa-3d/gi168-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi168-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi168-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi168-a0-fail-v91-06-esito.png) |
| 31 | success → recovery | 4.89 | portatore e difensori sopra la scheda | palla al margine destro in 05 | 0–0; recupero dichiarato | scivolata parziale | — | [01](ricollaudo-difesa-3d/gi31-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi31-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi31-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi31-a0-success-v91-06-esito.png) |
| 31 | fail → foul | 4.51 | portatore e difensori sopra la scheda | palla esce a sinistra in 05; eroe a terra | 0–0; fallo dichiarato | scivolata visibile | 002 | [01](ricollaudo-difesa-3d/gi31-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi31-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi31-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi31-a0-fail-v91-06-esito.png) |
| 32 | success → recovery | 15.34 | palla al margine sinistro; eroe al centro | eroe parzialmente tagliato a sinistra in 05 | 0–0; recupero dichiarato | anticipo parziale | 002 | [01](ricollaudo-difesa-3d/gi32-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi32-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi32-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi32-a0-success-v91-06-esito.png) |
| 32 | fail → through | 15.29 | palla al margine sinistro; eroe al centro | eroe tagliato a destra e palla assente in 05 | 0–0; passaggio filtrante riuscito dichiarato | anticipo fallito non isolato | 002 | [01](ricollaudo-difesa-3d/gi32-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi32-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi32-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi32-a0-fail-v91-06-esito.png) |
| 36 | success → save | 4.23 | attaccante tagliato a destra; palla non riconoscibile | palla assente in 04–05; eroe nel quadro | 0–0; salvataggio dichiarato | colpo di testa non isolato | 001, 002 | [01](ricollaudo-difesa-3d/gi36-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi36-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi36-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi36-a0-success-v91-06-esito.png) |
| 36 | fail → goal_against | 4.46 | attaccante tagliato a destra; palla non riconoscibile | palla presso testa dell’eroe in 05 | 0–1 in 06; arrivo in rete non verificato | stacco parziale | 001 | [01](ricollaudo-difesa-3d/gi36-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi36-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi36-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi36-a0-fail-v91-06-esito.png) |
| 44 | success → save | 4.57 | attaccante, difensori e palla leggibili | eroe e traiettoria in quadro | 0–0; salvataggio dichiarato | stacco parziale | — | [01](ricollaudo-difesa-3d/gi44-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi44-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi44-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi44-a0-success-v91-06-esito.png) |
| 44 | fail → goal_against | 4.74 | attaccante, difensori e palla leggibili | eroe e palla in quadro in 05 | 0–1 in 06; rete non mostrata | stacco parziale | — | [01](ricollaudo-difesa-3d/gi44-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi44-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi44-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi44-a0-fail-v91-06-esito.png) |
| 45 | success → save | 3.70 | attaccante tagliato a sinistra; palla non distinguibile | eroe e palla in quadro in 04–05 | 0–0; blocco dichiarato | corpo sulla traiettoria parziale | 001 | [01](ricollaudo-difesa-3d/gi45-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi45-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi45-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi45-a0-success-v91-06-esito.png) |
| 45 | fail → goal_against | 3.69 | attaccante tagliato a sinistra; palla non distinguibile | eroe e palla in quadro in 04–05 | 0–1 e palla presso la rete in 06 | corpo sulla traiettoria parziale | 001 | [01](ricollaudo-difesa-3d/gi45-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi45-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi45-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi45-a0-fail-v91-06-esito.png) |
| 128 | success → recovery | 3.74 | eroe, attaccante e palla visibili | palla e protagonisti in quadro in 04 | 0–0; recupero dichiarato | chiusura parziale | — | [01](ricollaudo-difesa-3d/gi128-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi128-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi128-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi128-a0-success-v91-06-esito.png) |
| 128 | fail → through | 3.73 | eroe, attaccante e palla visibili | palla e protagonisti in quadro in 04 | 0–0; superamento dichiarato | chiusura parziale | — | [01](ricollaudo-difesa-3d/gi128-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi128-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi128-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi128-a0-fail-v91-06-esito.png) |
| 137 | success → recovery | 3.65 | eroe, portatore e palla visibili | contrasto e palla nel quadro in 04–05 | 0–0; recupero dichiarato | tackle parziale | — | [01](ricollaudo-difesa-3d/gi137-a0-success-v91-01-apertura.png) [04](ricollaudo-difesa-3d/gi137-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi137-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi137-a0-success-v91-06-esito.png) |
| 137 | fail → foul | 4.07 | eroe, portatore e palla visibili | contrasto nel quadro | 0–0; fallo dichiarato | tackle parziale | — | [01](ricollaudo-difesa-3d/gi137-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi137-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi137-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi137-a0-fail-v91-06-esito.png) |
| 157 | success → save | 3.55 | eroe, portatore e palla visibili | eroe e palla nel quadro in 03–05 | 0–0; salvataggio dichiarato | tuffo non isolato dai sei scatti | — | [01](ricollaudo-difesa-3d/gi157-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi157-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi157-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi157-a0-success-v91-06-esito.png) |
| 157 | fail → goal_against | 3.62 | eroe, portatore e palla visibili | eroe e palla in quadro in 05 | 0–1 in 06; rete non mostrata | tuffo non isolato dai sei scatti | — | [01](ricollaudo-difesa-3d/gi157-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi157-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi157-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi157-a0-fail-v91-06-esito.png) |
| 184 | success → recovery | 1.87 | eroe e portatore visibili durante la mossa | palla al piede dell’eroe in 04 | 0–0; intercetto dichiarato | intercetto parziale | — | [01](ricollaudo-difesa-3d/gi184-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi184-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi184-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi184-a0-success-v91-06-esito.png) |
| 184 | fail → through | 1.87 | eroe e portatore visibili durante la mossa | eroe in quadro; palla finale non leggibile | 0–0; passaggio riuscito dichiarato | intercetto fallito non isolato | — | [01](ricollaudo-difesa-3d/gi184-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi184-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi184-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi184-a0-fail-v91-06-esito.png) |
| 24 | success → assist | 0.00 | eroe, difensore e palla visibili | sviluppo verso porta in quadro | 1–0 in 06; assist dichiarato | passaggio parziale | — | [01](ricollaudo-difesa-3d/gi24-a0-success-v91-01-apertura.png) [04](ricollaudo-difesa-3d/gi24-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi24-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi24-a0-success-v91-06-esito.png) |
| 24 | fail → intercept | 0.00 | eroe, difensore e palla visibili | sviluppo nel quadro | 0–0; conclusione murata dichiarata | passaggio parziale | — | [01](ricollaudo-difesa-3d/gi24-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi24-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi24-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi24-a0-fail-v91-06-esito.png) |
| 2 | success → goal | 0.00 | eroe e palla vicino alla porta | palla verso la porta in 05 | 1–0 e palla in porta in 06 | tiro visibile | — | [01](ricollaudo-difesa-3d/gi2-a0-success-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi2-a0-success-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi2-a0-success-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi2-a0-success-v91-06-esito.png) |
| 2 | fail → miss_easy | 0.00 | eroe e palla vicino alla porta | palla sulla destra della porta in 05 | 0–0; parata dichiarata, tocco del portiere non isolato | tiro visibile | — | [01](ricollaudo-difesa-3d/gi2-a0-fail-v91-01-apertura-retry1.png) [04](ricollaudo-difesa-3d/gi2-a0-fail-v91-04-contatto.png) [05](ricollaudo-difesa-3d/gi2-a0-fail-v91-05-volo.png) [06](ricollaudo-difesa-3d/gi2-a0-fail-v91-06-esito.png) |

## Campioni a 250 ms nei fail con gol subito

La posizione è `__CPM_STATE().ball.x/y` così come restituita dal gioco. La sonda ha raccolto campioni ogni 250 ms fino al trigger di contatto; in cinque scene il trigger arriva prima di un secondo campione, quindi lo spostamento medio dei giocatori di movimento è **non verificato**. Il campione non dimostra che il reparto fosse fermo (006).

| gi | Pallone: ms → x,y | Spostamento medio giocatori fra primo e ultimo campione (u) |
| ---: | --- | ---: |
| 33 | 250 → 13.00,50.80 | non verificato |
| 133 | 250 → 7.10,21.50 | non verificato |
| 134 | 250 → 23.10,55.60; 500 → 24.30,57.80; 750 → 25.90,62.90; 1000 → 25.50,62.00; 1250 → 25.10,60.90; 1500 → 24.50,59.60 | 2.20 |
| 36 | 250 → 9.70,38.90; 500 → 9.30,35.00 | 0.62 |
| 44 | 250 → 16.40,66.70; 500 → 16.10,70.80 | 0.59 |
| 45 | 250 → 6.00,60.70 | non verificato |
| 157 | 250 → 16.30,39.40 | non verificato |

## Cinque casi da sottoporre per primi al team

Sono ipotesi visive, ordinate per perdita di contesto dell’azione. Ogni comando rifà **un solo caso** in pagina nuova e richiede RAM libera; il suffisso `-verifica` conserva le foto del tentativo.

1. **gi138, azione 0, success:** 001 e 002: all’apertura non si vedono portatore e palla; in 04–05 la palla non è in quadro. Prove: [01](ricollaudo-difesa-3d/gi138-a0-success-v91-01-apertura.png), [05](ricollaudo-difesa-3d/gi138-a0-success-v91-05-volo.png), [06](ricollaudo-difesa-3d/gi138-a0-success-v91-06-esito.png). Riproduzione: `$env:CPM_CASES='138:0:success'; $env:CPM_CAPTURE_TAG='verifica'; $env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`.
2. **gi138, azione 0, fail:** 001 e 002: stessa apertura senza contesto; in 05 la palla esce dal basso a sinistra. Prove: [01](ricollaudo-difesa-3d/gi138-a0-fail-v91-01-apertura-retry1.png), [05](ricollaudo-difesa-3d/gi138-a0-fail-v91-05-volo.png), [06](ricollaudo-difesa-3d/gi138-a0-fail-v91-06-esito.png). Riproduzione: `$env:CPM_CASES='138:0:fail'; $env:CPM_CAPTURE_TAG='verifica'; $env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`.
3. **gi36, azione 0, success:** 001 e 002: attaccante tagliato e palla non riconoscibile in 01; palla assente in 04–05 durante lo stacco. Prove: [01](ricollaudo-difesa-3d/gi36-a0-success-v91-01-apertura-retry1.png), [05](ricollaudo-difesa-3d/gi36-a0-success-v91-05-volo.png), [06](ricollaudo-difesa-3d/gi36-a0-success-v91-06-esito.png). Riproduzione: `$env:CPM_CASES='36:0:success'; $env:CPM_CAPTURE_TAG='verifica'; $env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`.
4. **gi36, azione 0, fail:** 001: avvio del duello aereo con attaccante tagliato e palla non riconoscibile; il gol è dichiarato in 06. Prove: [01](ricollaudo-difesa-3d/gi36-a0-fail-v91-01-apertura-retry1.png), [05](ricollaudo-difesa-3d/gi36-a0-fail-v91-05-volo.png), [06](ricollaudo-difesa-3d/gi36-a0-fail-v91-06-esito.png). Riproduzione: `$env:CPM_CASES='36:0:fail'; $env:CPM_CAPTURE_TAG='verifica'; $env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`.
5. **gi45, azione 0, fail:** 001: la palla in arrivo è indistinta e l’attaccante è tagliato nell’apertura; in 06 il gol subito è coerente con la palla presso la rete. Prove: [01](ricollaudo-difesa-3d/gi45-a0-fail-v91-01-apertura-retry1.png), [05](ricollaudo-difesa-3d/gi45-a0-fail-v91-05-volo.png), [06](ricollaudo-difesa-3d/gi45-a0-fail-v91-06-esito.png). Riproduzione: `$env:CPM_CASES='45:0:fail'; $env:CPM_CAPTURE_TAG='verifica'; $env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`.

## Limiti e file di prova

Il giudizio riguarda una sola ripetizione valida per esito sulla 7.999.91. Le scene sono forzate; il comportamento in una partita naturale e su telefono è **non verificato**. Anche dove un testo di gol o salvataggio coincide con ActionResolved, la traiettoria fisica completa può essere non verificata. Le foto nere iniziali e i due tentativi invalidi restano nel grezzo per distinguere un limite del banco da un difetto del gioco. Nessuna patch al gioco è stata prodotta.

- Dati grezzi completi, bozze automatiche e tentativi: `tests/codex/ricollaudo-difesa-3d.json.gz`.
- Indice JSON leggibile con confronti, codici, foto e misure: `reports/codex/2026-10-01-ricollaudo-difesa-3d.json`.
- PNG: `reports/codex/ricollaudo-difesa-3d/`.
