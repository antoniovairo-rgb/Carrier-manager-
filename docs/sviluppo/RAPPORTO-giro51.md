# Rapporto giro 51 — piccole correzioni PO-268 · PO-269/255 · PO-270 · PO-272

Ramo `sviluppo/piccole-268-giro51`, base `lavoro/172-base` (7.999.171). Decisioni PO del 16/10 in
`docs/governo/DECISIONI.md`. GAME_VERSION e SAVE_VERSION **invariati** (il numero lo assegna la sessione di rilascio;
nei commenti di codice le correzioni sono marcate `[7.999.172 …]` come indicato in DECISIONI per PO-270). Nessun campo
nuovo nel salvataggio.

| Voce | File | Interruttore rosso | Guardiano | Verde | Rosso |
|---|---|---|---|---|---|
| PO-270 rinnovo | `src/18-career-app.jsx` (`_acceptNegoWage`) | `__CPM_NO_RIN270` | `rinnovo-270` | ✅ | ✅ esce 1 |
| PO-270b rinnovo via offerta (17/10) | `src/18-career-app.jsx` (`acceptTransfer`, ramo `isRenewal`) | `__CPM_NO_RIN270b` | `rinnovo-270` (esteso) | ✅ | ✅ esce 1 |
| PO-268 Crediti | `src/17-menu-creazione-pannelli.jsx` (`CREDITI254`) | `__CPM_NO_CRED268` | `crediti-254` (esteso) | ✅ | ✅ esce 1 |
| PO-269/255 chip → testata (17/10) | `src/17-…` (`VersioneTestata269`, Home), `src/18-…` (testata carriera), `src/19-…` (chip fisso solo coi rossi) | `__CPM_NO_CHIP269` | `chip-269` (riscritto) | ✅ | ✅ esce 1 |
| PO-272 «(simulata)» | `src/18-career-app.jsx` (riga dashboard + messaggio) | `__CPM_NO_SIM272` | `simulata-272` | ✅ | ✅ esce 1 |

I tre guardiani nuovi sono in `package.json` e nella MAPPA di `ci-runner.mjs` (`src/18-` → rinnovo-270, simulata-272;
`src/19-` → chip-269).

## 1. PO-270 — il rinnovo aggiunge davvero gli anni firmati (zona G, eccezione concessa)

**Causa (dal rapporto `RAPPORTO-carriere-l6-bis.md` §3, ramo `collaudo/carriere-l6-bis-giro49`, verificata nel codice
attuale):** il rinnovo si negozia solo all'ultimo anno (durata ≤ 1, guardia del pulsante nella scheda Agente) o da
svincolato (durata 0). `_acceptNegoWage` scriveva `duration` = anni firmati; il cambio stagione scala la durata di uno
(`duration<=0` ⇒ svincolato). Un rinnovo di 1 anno firmato all'ultimo anno valeva quindi zero stagioni in più.
I numeri di riga citati dal rapporto (5527/5541/5041) non corrispondono più al file attuale: oggi sono
`openNegoModal` r.~5571, `_acceptNegoWage` r.~5599, cambio stagione r.~5097.

**Correzione:** durata = `max(residua, 1) + anni firmati`; `expiresAtSeason` = stagione + quella durata. La stagione in
corso resta coperta e gli anni firmati si sommano.

**Misura (`rinnovo-270`, handler veri, scheda Agente → «Negozia rinnovo» → «Accetta l'offerta del club» → `startNewSeason`):**

| Caso (stagione 2, durata 1) | Verde: dopo la firma → stagione 3 | Rosso `__CPM_NO_RIN270` |
|---|---|---|
| proposta 1 anno | durata 2 → **1, non svincolato** | durata 1 → **0, svincolato** |
| proposta 2 anni | durata 3 → **2** | durata 2 → 1 |

### 1-bis. PO-270b — il secondo percorso (decisione PO 17/10: eccezione zona G estesa solo a questo)

Il rinnovo via offerta del proprio club (`acceptTransfer`, ramo `transferOffer.isRenewal`) scriveva `duration: tc.duration||2`
con lo stesso schema.

**Raggiungibilità (misura statica):** `grep isRenewal src/*.jsx` trova solo **consumatori** (r.~5636, 5657, 6861, 8385, 11108
di src/18 e r.843 di src/10); nessun punto del gioco crea un'offerta con `isRenewal`, e `git log -S "isRenewal:"` sui sorgenti è
vuoto. Oggi quindi il giocatore **non arriva** a questo ramo: lo si raggiunge solo col gancio di collaudo `setOffer`. Non posso
confermare che non ci sia mai arrivato in passato per altre vie.

**Misura (prima della correzione, handler veri: `setOffer` + `acceptOffer`, salvataggio in stagione 2 con durata 1):**

| Offerta (`tc.duration`) | Prima: dopo la firma → stagione 3 | Dopo la correzione |
|---|---|---|
| 1 anno | durata 1 → **0, svincolato** | durata 2 → **1, non svincolato** |
| 2 anni | durata 2 → 1 | durata 3 → 2 |
| assente (ripiego 2) | durata 2 → 1 | durata 3 → 2 |

Stesso difetto di PO-270 → stessa regola: durata = `max(residua,1) + anni firmati`, `expiresAtSeason` coerente.
Rosso `__CPM_NO_RIN270b` (`CPM_ROSSO=b node rinnovo-270.mjs`): torna lo schema vecchio, il guardiano esce 1; il rosso della prima
parte (`CPM_ROSSO=1`) resta indipendente ed esce 1. Nient'altro della zona G toccato (stipendio, bonus agente, morale, log invariati).

## 2. PO-268 — Crediti senza numero d'ordine e data

La voce «Giocatori 3D «Soccer Player - Rigged» (CGTrader)» diceva «Ordine CGTrader #17876008 del 20/09/2026.»; ora dice
«Acquistati su CGTrader.». Restano modello, autore (Hisenberg), licenza e CGTrader come fonte. Il documento interno
`docs/governo/CREDITI-fonti.md` non è stato toccato. `crediti-254` ora pretende «CGTrader» e rifiuta «17876008»,
«20/09/2026», «Ordine CGTrader»; col rosso `CPM_ROSSO=__CPM_NO_CRED268` esce 1 a 360 e 412 px.

## 3. PO-255 / PO-269 — il chip «v 7.999.x»

**Dove compare (misura `chip-269`, ~1 s dal caricamento):** il chip è un elemento fisso del contenitore radice (`App`,
in basso a destra, `z-index` 9999, 91×15 px), quindi è sopra **ogni** schermata finché svanisce (animazione di 9 s).

| Schermata | 360×800 | 412×915 |
|---|---|---|
| Home | copre «📂 Importa» e «⚙️ Opzioni» della barra in basso | copre «⚙️ Opzioni» |
| Carriera (dashboard) | copre «Ufficio» e «Opzioni» della barra | copre «La tua settimana ›», «Ufficio», «Opzioni» |
| Crediti aperti | **tutto il chip (1.215 px²) sta dentro il pannello**, sul bordo destro e sul testo | idem, 1.215 px² |

Non ho misurato se il chip riappare a ogni cambio di schermata o solo al caricamento della pagina (la sonda dedicata non
ha concluso nel tempo disponibile): **non posso confermarlo**. Il chip ha `pointer-events:none`, quindi non intercetta
i tocchi: il difetto è visivo.

**Prima correzione (16/10, resta):** con una finestra (`Modal`) aperta il chip si nasconde (registro `_modali256`).

**Decisione PO 17/10 — «Spostarlo nella testata».** Misura dello spazio prima della patch (sonda sul build 7.999.171, carriera
da salvataggio sintetico, Home pulita):

| | 360×800 | 412×915 |
|---|---|---|
| Carriera: fine marchio «Korward Elite» → inizio «Salva · ora» | 117 → 245 px = **128 px liberi** | 119 → 294 px = **175 px liberi** |
| Home: testata (logo centrato 67 px, da y 45) | angolo destro libero sopra il logo | idem |

Il testo «v 7.999.171» in monospace a `FS.caption` misura 88×14 px.

**Correzione:** nuovo componente `VersioneTestata269` (src/17) montato **nella testata della Home** (in alto a destra, top 9 /
right 12) e **nella testata della carriera, accanto a «Salva · ora»** (src/18). Colore: bianco 85% sulla Home, `ink` del club
(lo stesso inchiostro del marchio, scelto per contrasto) in carriera. Restano: svanisce come prima (`cpmBadgeFade` 9 s, decisione
PO-255) e si nasconde con una finestra aperta. Il chip fisso in basso a destra in `App` (src/19) ora esiste **solo coi rossi**
(`__CPM_NO_CHIP269` → il chip di prima; `__CPM_NO_BADGE255` → PROD/TEST · KE, quindi badge-255 non cambia).
Conseguenza dichiarata: nelle fasi senza quella testata (creazione, provini, offerte, partita) la versione non compare più;
era comunque un chip a scomparsa dopo 9 s dall'avvio.

**Misura dopo (`chip-269` riscritto):** sovrapposizione = somma delle intersezioni del chip con ogni elemento di contenuto visibile
(testo, pulsanti, link, campi, svg/img, pannello Crediti) che non sia suo antenato/discendente. Verde pretende anche che su Home e
carriera il chip sia **visibile** e **dentro la testata** (nasconderlo non basta).

| Schermata | 360 verde | 412 verde | 360 rosso | 412 rosso |
|---|---|---|---|---|
| Home | visibile, in testata, **0 px²** | visibile, in testata, **0 px²** | 2.455 px² (Importa, Opzioni) | 2.606 px² (Opzioni) |
| Crediti aperti | nascosto, **0 px²** | nascosto, **0 px²** | 4.406 px² (pannello 1.215) | 4.636 px² (pannello 1.215) |
| Carriera | visibile, in testata (x 147-235, «Salva» da 243), **0 px²** | visibile, in testata, **0 px²** | 1.831 px² (Ufficio, Opzioni) | 2.060 px² (settimana, Ufficio, Opzioni) |

Nota di metodo: nel rosso i px² sommano anche elementi annidati (pulsante + sua etichetta), quindi sono un indice, non un'area
netta; il verde a 0 non ne è toccato. Foto in `tests/visual/out/chip-269/` (home/crediti/carriera, verde e rosso).
La MAPPA di `ci-runner.mjs` ora collega `chip-269` anche a src/17 e src/18 (e `badge-255` a src/17).

## 4. PO-272 — niente «(simulata)» nel testo della carriera

Due punti mostravano la nota: la riga del risultato in dashboard (`… vs X (simulata)`, r.~7496) e il messaggio a comparsa
dopo «Simula e avanza la settimana» (`… in casa vs X (simulata) · 1 assist · voto 7,0`, r.~3339). Tolti entrambi;
il dato `simulated` nel salvataggio resta (lo usano altre parti).

**Misura (`simulata-272`, bottone vero «Simula e avanza la settimana», osservatore del testo armato prima del caricamento):**
verde → messaggio «Vittoria 3–0 in casa vs FC Ravelmund · 1 assist · voto 7,0», riga «Vittoria 3–0 vs FC Ravelmund»,
zero «simulata»; rosso `__CPM_NO_SIM272` → la parola torna in entrambi, guardiano esce 1.

**Fuori ambito, segnalato:** lo storico della Nazionale scrive ancora «· simulata» accanto a competizione e settimana
(r.~11441, `m.sim`), e un messaggio di misura dei tempi «⏱️ Partita simulata: … ms» (r.~6186) che non ho verificato se
sia raggiungibile dal giocatore. Il guardiano non li vede perché il suo salvataggio non ha partite in Nazionale.

## 5. Verifiche

Vedi la tabella della catena in coda (sezione 6). Le parti toccate sono carriera (src/18), pannelli (src/17) e radice
(src/19): la MAPPA collega src/19 alla catena completa, che resta alla sessione di rilascio.

## 6. Catena eseguita (build di questo ramo, dentro il turno)

Nucleo fisso + guardiani delle parti toccate (src/17, src/18, src/19). Non eseguiti qui: `validate-situations`, `replay`,
`partita-vera` e il resto della catena completa a cui la MAPPA collega src/19 — nessuna modifica tocca motore o partita;
restano alla sessione di rilascio.

| Passo | Esito | Tempo |
|---|---|---|
| test:logic | verde | 4 s |
| save-compat | verde | 11 s |
| design-system | verde | 1 s |
| typing-shortcuts | verde | 19 s |
| badge-255 | verde | 81 s |
| toast-256 | verde | 76 s |
| chip-269 (nuovo) | verde; rosso `CPM_ROSSO=1` esce 1 | 45 s |
| crediti-254 (esteso) | verde; rosso `CPM_ROSSO=__CPM_NO_CRED268` esce 1 | 24 s |
| rinnovo-270 (nuovo) | verde; rosso `CPM_ROSSO=1` esce 1 | 32 s |
| simulata-272 (nuovo) | verde; rosso `CPM_ROSSO=1` esce 1 | 17 s |
| career-critical | verde, zero ❌ | 738 s |

## 7. Seconda passata (decisioni PO 17/10) — catena sul build con chip in testata + PO-270b

| Passo | Esito | Tempo |
|---|---|---|
| rinnovo-270 prima della correzione 270b | **rosso** sul secondo percorso (misura del difetto, tabella §1-bis) | — |
| rinnovo-270 (esteso) | verde; `CPM_ROSSO=1` esce 1; `CPM_ROSSO=b` esce 1 | ~60 s |
| chip-269 (riscritto) | verde; `CPM_ROSSO=1` esce 1 | ~45 s |
| test:logic | verde | 4 s |
| save-compat | verde | 16 s |
| design-system | verde | 0 s |
| typing-shortcuts | verde | 28 s |
| crediti-254 | verde | 29 s |
| simulata-272 | verde | 20 s |
| badge-255 | verde (il badge in testata dice «v 7.999.171» e svanisce; rosso PROD/TEST · KE) | 89 s |
| toast-256 | verde | 79 s |
| griglia-mobile | eseguita, zero testo sotto soglia (Home 0/18, Dashboard 0/106: il badge è entrato nella misura) | 208 s |
| career-critical | verde, zero ❌ | 759 s |

`griglia-mobile`, `badge-255` e `toast-256` riscrivono foto e report tracciati (`docs/collaudo-grafico/g0/`,
`docs/sviluppo/foto-giro26/`): li ho riportati allo stato di git per non mischiare questi artefatti al giro.
Non eseguiti qui (restano alla sessione di rilascio, come al §6): `validate-situations`, `replay`, `partita-vera` e il resto
della catena completa collegata a src/19. Nessuna modifica tocca motore o partita.
