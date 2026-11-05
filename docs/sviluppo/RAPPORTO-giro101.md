# Rapporto giro 101 — esiti-218 rosso nella catena notte 178

Ramo `sviluppo/giro101-esiti` (da `lavoro/178`, 4a4ff494). `GAME_VERSION`, `src/` e `docs/governo/*` **non toccati**.

## 1. Che cosa era davvero rosso (misura prima)

La riga della catena (`docs/governo/catena-178-t2.out`, ramo `catena/178-t2`) è la **coda di tre righe** che `ci-runner.mjs`
conserva dell'uscita (`coda: ... .slice(-3)`), non un unico messaggio:

1. `· 2021 «💥 Tiro rasoterra» tiro fuori raccontato come blocked — riquadro «Il difensore si oppone» …` → è l'**ultima
   contraddizione stampata dal braccio ROSSO** (`__CPM_NO_ESITI218` acceso). Lì la contraddizione deve vedersi: è la prova del rosso.
2. `❌ esiti-218`
3. `· verde: 0 contraddizioni su 11 scene` → il **motivo** del rosso: il braccio verde ha **0 contraddizioni** ma solo **11 scene**
   contro il pavimento di copertura di 12.

Quindi **nessun riquadro di chiusura scena mente nel gioco**: il rosso è di copertura. Lo avevano già misurato i rapporti
96b («11 scene contro il minimo di 12, 0 contraddizioni; identico sulla base») e 98 («preesistente»).

Misure di questo giro (guardiano originale, semi 1234 e 2021, `__CPM_REC`, autoplay seedato):

| corsa | build | verde (scene / contraddizioni) | rosso (scene / contraddizioni) | esito |
|---|---|---|---|---|
| sonda solo-verde | base 7.999.177 (78384a4) | 6 + 6 = **12** / 0 | — | sul filo |
| corsa 1 | HEAD 4a4ff494 | 7 + 6 = **13** / 0 | 12 / 3 | ✅ |
| corsa 2 | HEAD 4a4ff494 | 5 + 6 = **11** / 0 | 12 / 4 | ❌ (copertura) |
| catena notte 178 (×3 col ritentativo) | 7.999.178 | **11** / 0 | ≥1 | ❌ |

- **Riproducibile in modo intermittente**: 1 corsa su 2, sempre sul pavimento di scene, mai su una contraddizione del verde.
- **Causa**: a seme fisso il numero di scene dell'eroe che arrivano al motore (`__CPM_RES218`) **non è riproducibile** fra due corse:
  seme 1234 ha dato 7 e poi 5 scene sullo stesso build (l'autoplay gira a tempo reale e la coda reattiva degli highlight dipende dai
  tempi della pagina). Con due partite il totale oscilla fra 11 e 13 e la soglia 12 sta sul filo; già la base 177 dava 12 esatti.
  Non è una regressione dei giri 95–100 nella verità dei riquadri: in tutte le corse il verde ha 0 contraddizioni.
- **Ipotesi del mandato verificata e scartata**: «quale ramo produce il riquadro «Il difensore si oppone» quando il motore dice
  tiro:fuori». Nel braccio verde quel riquadro non compare mai su un tiro fuori; compare solo col rosso acceso, che è il comportamento
  pre-7.999.154 voluto apposta dal guardiano.

## 2. Correzione (guardiano, non gioco)

Siccome il gioco non mente, **non c'è una correzione di gioco da fare** e quindi **nessun interruttore `__CPM_NO_G101`**:
un interruttore che «riporta il comportamento attuale» su codice di gioco invariato non spegnerebbe niente (lezione 7.497: un
interruttore per la prova del rosso dev'essere suo). La prova del rosso resta `__CPM_NO_ESITI218`, che vede la contraddizione.

`tests/visual/esiti-218.mjs`:
- **terzo seme 777** (`SEMI = [1234, 2021, 777]`): più copertura, **pavimento 12 invariato** (mai abbassato). Seme scelto dopo una
  sonda solo-verde su 777/3141/4242: 7 + 7 + 7 = 21 scene, 0 contraddizioni.
- **nuovo controllo**: ogni partita (verde e rosso) deve arrivare al fischio (`ended`/`ceremony`), altrimenti la corsa fallisce
  («partite non arrivate al fischio»): prima una partita tagliata dal tetto dei 420 s contava come scene in meno senza dirlo.
- Costo: ~+50% di durata (19 → 29 min in sessione con altri guardiani in parallelo).

## 3. Guardiani (misura dopo)

| guardiano | esito | numeri |
|---|---|---|
| esiti-218 (nuovo) corsa 1 | ✅ | verde 5+6+7 = **18 scene / 0** · rosso 19 scene / **5** contraddizioni |
| esiti-218 (nuovo) corsa 2 | ✅ | verde 5+6+7 = **18 scene / 0** · rosso 7+5+7 = 19 scene / **5** contraddizioni |
| cross-218 | ✅ | riquadro, motore e 3D concordi sul cross sbagliato; il rosso si vede |
| test:logic | ✅ | 43/43 |
| save-compat | ✅ | 12 pass · 0 fail |
| highlight-95 | ✅ | verde 114 highlight · D4 senza esito 0 · difetti 0; rosso: D4 senza esito 9, finte riuscite 11,1% (il rosso si vede). 88 min con altri guardiani in parallelo |
| assist-298 | ✅ | verde 20 scene (18 giudicate) · passaggi 94,4% · difetti 0; rosso 34 difetti |
| esiti-96 | ✅ | VERDE OK D1, D2, D3, B15, D6, D7, D12, D15, D14; rosso atteso: cadono tutti |
| chiusura-99 | ❌ (1 scena) | RIC verde 6/6 (100%), rosso 2/6; D9 rosso visibile (mediana 1,23, 5 sotto 3); **D9 verde: gi0 colore club contrasto 2,8 < 3** (altre 5 scene 5,2–6,2). Corsa precedente (gi0 non pescata): D9 verde 6/6, mediana 5,20, 0 sotto 3 |
| parata-100 | ❌ (1 scena) | da solo: verde 4 parate, **1 difetto**: ROTH s5/2021 regime gioco, portiere-pallone minimo **42,0** (soglia 6); rosso visibile (SEIFERT 24,9). Prima corsa (sotto carico, 3 browser): verde 0 difetti ma rosso cieco (2 parate, 2 non giudicabili per guardia di parete) |
| assist-nome-98 | ✅ | verde A 4 partite (gol eroe 0,50/p, assist 0,75/p), B e C verdi; rosso A/B visibili. 51 min da solo. Due corse precedenti interrotte dal tetto del sottofondo (2 h) e dal riavvio del container, non dal guardiano |

### chiusura-99: riparazione della sonda
Tre corse di fila sono morte con `TypeError: Cannot read properties of null (reading 'style')` (`chiusura-99.mjs:78`, braccio rosso
D9): la scritta «GOOOOL!» marcata `data-g99m` viene smontata fra la seconda e la terza foto. La sonda ora, se l'elemento non c'è più,
**scarta il tentativo** (`continue`, come gli altri casi in cui la forzatura non riesce) invece di morire; se non resta nessuna misura il
braccio è «cieco» e fallisce come prima. Nessuna soglia cambiata. Dopo la riparazione la sonda arriva sempre in fondo (2 corse).

### Due rossi che restano, fuori dal mandato
Il gioco **non è stato toccato** in questo giro (src/ identico), quindi i due rossi qui sotto valgono anche per 4a4ff494:
- **parata-100 verde, ROTH 42,0**: la parata scritta del tiro del compagno senza pallone al portiere, nel regime «gioco». Il giro 100 aveva
  misurato ROTH a 2,8–3,5: il difetto D3 è **intermittente**. Cantiere del giro 100 (src/12, ramo `assist_shot`/`cross_goal`).
- **chiusura-99 D9 verde, gi0 col colore del club**: scritta del gol a contrasto 2,8. Dipende da quale scena la sonda pesca (la stessa
  corsa sul primo colore ha preso gi8 un'altra volta). Cantiere del giro 99 (grafica della scritta).
Non posso confermare se nella catena notte 178 questi due guardiani fossero verdi: il tronco che li contiene non è sui rami
`catena/178-*` (ci sono solo t2 e t3).


`node tools/build-src.mjs`: byte identici (nessun frammento toccato) · `node tools/check-src.mjs`: allineato a HEAD.

## 4. Punti aperti
- **esiti-241 rosso** nel tronco 3 della catena notte 178 (`catena-178-t3.out`: «gi150 Dribbling provocatorio — il fallo c'è!» chance/win_freekick): stesso «122/123» dichiarato da t2 e t3, quindi i rossi della catena sono almeno due. Fuori dal mandato di questo giro, non toccato.
- parata-100 ROTH e chiusura-99 gi0 (sopra).
- La non riproducibilità del **numero** di scene a seme fisso resta (autoplay a tempo reale): il terzo seme la rende innocua per il
  pavimento, non la elimina. Se servisse un conteggio deterministico, il cantiere è l'autoplay (fuori ambito qui).
- Il braccio rosso con tre semi vede 5 contraddizioni invece di 3-4: nessun impatto sulla soglia (≥1).
