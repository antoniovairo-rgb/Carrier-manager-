# Rapporto giro 51 — piccole correzioni PO-268 · PO-269/255 · PO-270 · PO-272

Ramo `sviluppo/piccole-268-giro51`, base `lavoro/172-base` (7.999.171). Decisioni PO del 16/10 in
`docs/governo/DECISIONI.md`. GAME_VERSION e SAVE_VERSION **invariati** (il numero lo assegna la sessione di rilascio;
nei commenti di codice le correzioni sono marcate `[7.999.172 …]` come indicato in DECISIONI per PO-270). Nessun campo
nuovo nel salvataggio.

| Voce | File | Interruttore rosso | Guardiano | Verde | Rosso |
|---|---|---|---|---|---|
| PO-270 rinnovo | `src/18-career-app.jsx` (`_acceptNegoWage`) | `__CPM_NO_RIN270` | `rinnovo-270` | ✅ | ✅ esce 1 |
| PO-268 Crediti | `src/17-menu-creazione-pannelli.jsx` (`CREDITI254`) | `__CPM_NO_CRED268` | `crediti-254` (esteso) | ✅ | ✅ esce 1 |
| PO-269/255 chip | `src/19-app-root.jsx` (badge in `App`) | `__CPM_NO_CHIP269` | `chip-269` | ✅ | ✅ esce 1 |
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

**Non toccato (resta fuori ambito, come chiesto: «non toccare altro della zona G»):** il secondo percorso di rinnovo,
quello via offerta del proprio club (`transferOffer.isRenewal`, r.~5657-5660), scrive anch'esso `duration: tc.duration||2`
con lo stesso schema. Non l'ho misurato: **non posso confermare** se presenti lo stesso difetto (dipende da quando
l'offerta arriva e da quanto vale `tc.duration`). Va deciso dal PO se estendere l'eccezione.

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

**Correzione applicata ora (solo la sovrapposizione):** quando una finestra (`Modal`) è aperta il chip si nasconde
(`visibility:hidden`), usando il registro dei Modal già esistente `_modali256` (lo stesso del toast PO-256). Misura:
Crediti aperti → chip nascosto a 360 e 412 px; rosso `__CPM_NO_CHIP269` → 1.215 px² sul pannello, guardiano esce 1.
Home e carriera **non cambiano** (la sovrapposizione con la barra in basso resta: la decisione è del PO).

**Due opzioni per la scelta finale del PO:**
- **A — toglierlo al giocatore, lasciarlo in Opzioni.** Il chip sparisce da tutte le schermate; la versione si legge in
  Opzioni (che oggi non la mostra: andrebbe aggiunta una riga). Pro: nessuna sovrapposizione possibile, niente testo
  tecnico al giocatore. Contro: per le segnalazioni del PO dal telefono la versione richiede un tocco in più.
- **B — spostarlo dove non copre nulla.** Ad esempio in alto, dentro la testata (accanto all'ora «· 07:45» già presente),
  oppure sopra la barra in basso. Pro: resta visibile all'avvio. Contro: la testata a 360 px è già piena (logo, Salva,
  ora): lo spazio va misurato prima; sopra la barra copre il contenuto che scorre.

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
