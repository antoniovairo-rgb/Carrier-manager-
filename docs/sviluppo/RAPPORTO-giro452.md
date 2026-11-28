# Rapporto giro 452 — `prestacco-422` sul runner lento

Base `lavoro/204` (34adcbf; in `src/` identica al commit provato dal treno, 973f7f2). Ramo `sviluppo/giro452-prestacco-lento`.
Treno di riferimento: corsa 46119456382, parte 21 (job 140900835216), letta con gli strumenti GitHub.
`GAME_VERSION`, `docs/governo` e licenze **invariati**. GLB acceso in tutte le misure. Passo 1/60 (le regole di `testa-342`).

## Risposta alla domanda chiave

**È un difetto del gioco, non solo della misura.** Si vede su ogni macchina che, durante un colpo di testa, disegna meno di circa
4 fotogrammi al secondo: il runner e un telefono molto lento. Non è il caso visto dal giro 442 («nessuna clip di testa al contatto»): quello nel
treno non è uscito. Il treno ha bocciato un'altra cosa:

| Scena (treno, braccio verde) | dCont | scClip | peso | esito |
|---|---|---|---|---|
| gi48 a1 TARDI | 0,08 | 0 | 1 | ok |
| gi108 a0 TARDI | **1,85** | −0,05 | 0,98 | NO |
| gi48 a1 PROVA | **1,73** | −0,05 | 0,99 | NO |
| gi53 a1 PROVA | **1,46** | −0,04 | 0,99 | NO |
| gi108 a0 PROVA | **1,64** | −0,04 | 0,99 | NO |
| gi48 a1 · gi53 a1 naturali | 0,11 · 0,15 | 0,01 | 0,98 | ok |

Clip e peso sono giusti, ma il colpo parte **prima** che il pallone arrivi alla testa: 0,05 s di scena prima, col pallone a 1,5-1,9 u.

## 1. Misura (No Blind Fix)

| Condizione sul banco | Scene provocate fuori misura |
|---|---|
| CPU ×4 via CDP | 0 su 5 (7/7 verde) |
| CPU ×6 via CDP | 0 su 5 (7/7 verde) |
| un solo core, CPU ×4, 5 pagine | non giudicato: troppo lento perfino per arrivare alla scena (misura scartata) |
| CPU ×4 + zavorra 60 ms a fotogramma, **codice di prima** (`__CPM_NO_G452`) | **4 su 4 giudicate + 1 non giudicata** (dCont 1,73-2,0, scClip −0,05/−0,06) |

**Perché CDP da solo non basta.** Il rallentamento CDP frena solo il JavaScript della pagina; il disegno (SwiftShader) gira in un altro processo e
non rallenta. Sul banco un fotogramma della scena dura circa 140 ms (dump, mediana). Per un fotogramma lungo come sul runner ho messo una
**zavorra** nella sonda (`CPM_ZAVORRA452`, in `testa-342.mjs`): un'attesa attiva fissa in `requestAnimationFrame` prima del disegno. Il gioco non
ne sa niente. Con 60 ms + CPU ×4: 3,4 fotogrammi al secondo, 0,29 s reali a fotogramma nel volo.

**Causa (testimone `__CPM_TESTA274`, ora con `trR` reale, `trS` di scena, `nf` fotogrammi, `tetto`).** Nelle scene provocate il pallone sta a
6 u dalla testa e fa il volo del giro 274 (32 u/s, D = 0,19 s di scena). Il volo avanza col tempo di scena `aDt`, che sotto il rallentatore
dell'esito (`slow` 0,28 → 1 in 1,6 s, src/12) vale 0,005-0,008 s a fotogramma: il volo dura **circa 27 fotogrammi**. Il tetto del volo era
però di **6 s di tempo reale** (`_Vt.tr += _dtReal708`, massimo 0,3 s a fotogramma):

| Macchina | s reali a fotogramma | volo di 27 fotogrammi | tetto 6 s |
|---|---|---|---|
| banco (anche CPU ×6) | 0,14 | 3,8 s | mai |
| banco + zavorra 60, rosso | 0,29 | si ferma al 21° fotogramma: `trR` 6,04-6,25 s, `trS` 0,129 su 0,19 | **sempre** (`tetto=1`) |
| runner (dedotto dai numeri del treno) | ≈ 0,25-0,3 | come sopra | sì |

Il volo chiuso dal tetto fa partire il colpo «da dove il pallone è» (regola 274): pallone a 1,7-2,0 u, frustata della clip ancora 0,05 s avanti.
La clip è fasata sull'arrivo previsto, quindi `scClip` vale −0,05 e il peso è pieno.

**Telefono.** Lo stesso conto vale per un telefono: un volo di D secondi di scena dura D / (0,05 × slow) fotogrammi. Con il volo d'angolo
misurato nel giro 274 (34,8 u, D 1,09 s) a 10 fps si arriva a circa 5,5-6,5 s reali: il tetto taglia anche lì. Con un volo corto (6 u) serve
un telefono sotto circa 4 fps. **Non posso confermare** quanti telefoni veri ci finiscano: misura fatta solo sul banco.

## 2. Correzione nel gioco (`src/12`, rosso `window.__CPM_NO_G452`)

Il tetto del volo 274 del colpo di testa conta il **tempo di scena** (`_Vt.tr += aDt`). Tutto il resto resta com'era: il volo finisce quando
`f >= D` (scena), e un pallone inchiodato resta impossibile perché `f` cresce a ogni fotogramma come `tr`. Il tetto di 6 s ora vale 6 s di scena,
più del volo più lungo possibile (D 1,09 s). Il testimone annota entrambi gli orologi. `CARRIER-MANAGER-AV.html` ricomposto (`build-src`).

**Fuori ambito, dichiarato:** il volo del **calcio** (`_volo274`, `tr<2.4`) ha la stessa forma, ma tetto di 2,4 s; non l'ho misurato né toccato
(dubbio D3).

## 3. Guardiano `prestacco-422`: braccio LENTO (verde + rosso)

`CPM_LENTO452=1`: CPU ×4 via CDP + zavorra 60 ms. Scene: le 3 PROVA + le 2 TARDI (quelle col volo). Soglie **invariate** (quelle di `testa-342`).
- **Verde:** tutte dentro **e** il testimone dice che nel volo il fotogramma è durato in media ≥ 0,25 s reali. Altrimenti è «non giudicato» =
  rosso: la macchina non è stata lenta abbastanza da provare il caso.
- **Rosso** (`CPM_ROSSO=__CPM_NO_G452`): valido se almeno 3 scene su 5 cadono su misura **col volo chiuso dal tetto** (`tetto=1`).
- Script npm: i tre bracci di prima + `CPM_LENTO452=1 node prestacco-422.mjs` + `CPM_LENTO452=1 CPM_ROSSO=__CPM_NO_G452 node prestacco-422.mjs`.

| Braccio lento | Esito |
|---|---|
| verde | **5/5** dentro: dCont 0,07-0,21 · volo 5,7-8,6 s reali / 0,19-0,21 s di scena · `tetto=0` |
| rosso `__CPM_NO_G452` | **5/5** bocciate su misura: dCont 1,73-2,0 · scClip −0,05/−0,06 · `tetto=1` |

**Sonda corretta (`testa-342.mjs`, solo strumento):** col fotogramma lungo la scena comincia a scrivere il testimone tardi, e la regola «30
letture ferme» (27 s di parete fissi) chiudeva la scena prima che partisse (gi108 «testimone vuoto», misurato). Con la zavorra si aspetta
l'evento: fase fuori da `hl_` oppure contatto + 1,6 s di scena, con il tetto della corsa. Senza zavorra il comportamento resta quello di prima.
Nuova sonda `misura-452.mjs` (volo 274 e attesa per scena, `CPM_CASI452`, `CPM_RIP`).

## 4. Visto misurando, fuori ambito

Con la zavorra a **90 ms** (circa 2,5 fps), gi48 a1 PROVA è uscita 2 volte su 3 con il picco dello stacco a −0,22 s e la testa a 22-35 u/s
(dCont 0,06-0,08: il pallone arriva). Dump: nella costruzione dentro `hl_result`, **prima** che il gesto di testa sia montato (`actType` nullo),
il corpo sale di 0,38 u in tre fotogrammi; quando il gesto si monta, il ramo del giro 422 («a terra all'esito») lo rimette a 0 in un fotogramma.
Non ho trovato chi lo alza: il pre-stacco della costruzione è spento sotto la provocazione. Non succede con la zavorra a 60 né senza.
Non l'ho corretto (dubbio D2).

## 5. Esito del giro

`cd tests/visual && node ci-runner.mjs giro prestacco-422 testa-tempismo testa-342` (guardiani + 17 sentinelle): vedi sotto.

**20/20 verdi** sulla 7.999.219 + giro 452 (banco, 28/11), nessun passo instabile:
`prestacco-422` 938 s (cinque bracci: verde · rosso 422 · rosso 442 · lento verde · lento rosso) · `testa-tempismo` 345 s · `testa-342` 491 s ·
17 sentinelle (mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023,
tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97).
`docs/governo/STABILITA.json`, scritto dall'esecutore, è stato rimesso com'era: il giro non tocca `docs/governo`.

## Dubbi per il PO

**D1 — Il tetto del volo 274 del colpo di testa: in tempo di scena o in tempo reale?**
1. **(consigliata, applicata)** Tempo di scena: il volo arriva sempre alla testa, su ogni macchina. Su un telefono molto lento la finestra
   d'esito (tetto di 6 s reali del 7.461) può chiudersi col pallone ancora in volo, ma il colpo storto non si vede più.
2. Tempo reale, ma con tetto più alto (per esempio 12 s): il runner passa, un telefono sotto i 2-3 fps no.
3. Tempo reale come prima, e il guardiano gira il braccio lento solo sul banco: il treno resta rosso sul runner, il difetto resta sui
   telefoni lenti.

**D2 — Lo stacco del corpo prima del gesto a 2,5 fps (§4).**
1. **(consigliata)** Un giro di misura dedicato: testimone su chi scrive `hero.position.y` nella costruzione dentro `hl_result`, poi
   correzione alla fonte.
2. Il ramo 422 «a terra all'esito» parte dalla quota in cui il corpo sta, invece di rimetterlo a 0 in un fotogramma.
3. Lasciarlo: oggi compare solo sotto 3 fps e solo sotto provocazione.

**D3 — Il volo del calcio (`_volo274`, tetto 2,4 s reali).**
1. **(consigliata)** Misurarlo con la stessa zavorra (`misura-452`, sonda del calcio) prima di toccarlo.
2. Portarlo subito al tempo di scena come il colpo di testa.
3. Lasciarlo com'è.

**D4 — Durata del guardiano.** I due bracci lenti aggiungono circa 10-12 minuti a `prestacco-422` (tre bracci ~4,5 min l'uno sul banco).
`docs/governo/DURATE-GUARDIANI.json` non l'ho toccato (regola del giro).
1. **(consigliata)** Aggiornare la stima nel prossimo giro di governo.
2. Spostare i bracci lenti nel solo treno grande notturno.
3. Tenere solo il braccio lento rosso nel trenino.
