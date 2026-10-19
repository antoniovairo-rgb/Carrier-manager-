# Rapporto del giro 65 — PO-155 «Svincolato, poi finestre + CT» (7.999.173)

**Ramo:** `sviluppo/nazionale-155-giro65`, partito da `lavoro/172` (7.999.172, `46cdcdc`).
**Decisione che lo richiede:** `docs/governo/DECISIONI.md:432` (16/10 notte, punto 3): «Svincolato, poi finestre + CT» — qualificazioni del torneo invariate. Eccezione zona G concessa dal PO per PO-155.
**Fonte del difetto:** `docs/collaudi/RAPPORTO-carriere-l6-bis.md` §8 sul ramo `collaudo/carriere-l6-bis-giro49` (giro 49).
**GAME_VERSION:** non cambiata (come da istruzioni).

## 1. Cosa diceva la misura del giro 49

- Il cancello della convocazione non guardava il contratto: `!isInU18&&!_callupBusyWk&&!player.injured` (allora `src/18-career-app.jsx:4194`, oggi dentro `_tryNatCallup`).
- Il cancello girava solo dentro `doAdvanceWeek`: **2,02 valutazioni per stagione pro** (606 in 300 stagioni), quasi tutte nelle settimane 28, 35 e 19, raramente la 9 (rapporto L6-bis §8).
- La convocazione era un tiro di dado (`callP` 0,03–0,55) a ogni valutazione.

## 2. Cosa cambia (solo `src/18-career-app.jsx`)

| # | Correzione | Dove | Interruttore rosso |
|---|---|---|---|
| 1 | **Svincolato:** il cancello di `_tryNatCallup` pretende anche `!player.contractExpired` | `_tryNatCallup`, `_sv155` | `__CPM_NO_SV155` |
| 2 | **Finestre:** le finestre internazionali sono le **soste del calendario del club** (settimane senza giornata di campionato fra la prima e l'ultima; con 16 avversari: 9 · 19 · 28 · 35, da `_CAL_BREAKS` in `src/09`). Si decide **all'arrivo** nella sosta da qualunque percorso (Avanza, Simula, partita giocata), con un `useEffect` sulla settimana; l'amichevole si gioca nella sosta stessa. Il vecchio controllo in `doAdvanceWeek` resta solo nel rosso | `natFinestre155`, effect `_fin155Ref`, chiamata in `doAdvanceWeek` | `__CPM_NO_FIN155` |
| 3 | **CT, decisione:** nella finestra niente dado: convocato chi supera la soglia della nazionale con idoneità ≥ 0 (≥ 2 per il debutto), dentro il tetto stagionale già esistente (7.783). Il numero seedato si consuma lo stesso, quindi l'avversario resta quello di prima | `_tryNatCallup`, `_roll155` | `__CPM_NO_FIN155` |
| 4 | **CT, convocati e scelte:** la lista esce anche quando non ci sei, col perché (log + notifica, solo se OVR ≥ soglia − 3); se convocato, la voce di calendario porta `ctRole` (titolare se primo nella lista del CT, altrimenti «a disposizione») e `ctRel` | `_tryNatCallup` | `__CPM_NO_FIN155` |
| 5 | **CT, rapporto:** `ctRapporto155(p)` 0–100, **derivato** da presenze e dalle ultime sei gare in `natHistory` (voti, gol, assist); pesa ±5 sull'idoneità nella finestra; il tab Nazionale lo mostra sotto la lista del CT insieme alla prossima finestra (o «da svincolato il CT non ti chiama») | `ctRapporto155`, tab Nazionale `data-cpm="ct155"` | `__CPM_NO_FIN155` (nasconde la riga) |

**Fuori ambito, invariato:** qualificazioni e fasi finali di Europeo/Mondiale, Coppa delle Nazioni (`nationsCupQueue`: con la coda attiva la finestra non decide), schermata di convocazione e partita live della Nazionale, tetto stagionale 7.783, soglie `NAT_CALL_LEVEL`. **Salvataggio:** nessun campo obbligatorio nuovo, nessun bump SAVE: finestre e rapporto sono derivati; `finestra/ctRole/ctRel` sono campi facoltativi aggiunti solo alle voci di calendario nuove.

## 3. Misure prima / dopo

Guardiano nuovo `npm run nazionale-155` (`tests/visual/nazionale-155.mjs`): una stagione intera (S5, nessun torneo per nazionali) sugli handler veri `__CPM_CAREER.step`, Nazionale simulata (`__CPM_SIM_NAT=1`), testimone `__CPM_CALLUP`. Profilo: Italia, OVR 88, 12 presenze. Profilo B: stesso, svincolato.

| Misura | Prima (rosso) | Dopo (verde) |
|---|---|---|
| A: valutazioni del cancello in stagione | 8 (sett. 2, 7, 14, 17, 19, 24, 28, 35), dado | 4, tutte nelle soste 9 · 19 · 28 · 35 |
| A: finestre decise dal CT | 0 su 4 | **4 su 4** |
| A: valutazioni passate → presenze | 6 passate → **1** presenza (sett. 9) | 4 passate → **4** presenze, tutte «titolare» |
| A: amichevoli fuori dalle soste | 0 (solo la 9) | 0 |
| B svincolato: presenze (rosso `CPM_ROSSO=sv`) | **4** (convocato in tutte le soste) | **0** (4 valutazioni, 0 passate) |
| Errori di pagina | 0 | 0 |

Rossi: `CPM_ROSSO=fin` → FALLITO 2 controlli (finestre 0, presenze 1); `CPM_ROSSO=sv` → FALLITO 1 controllo (svincolato 4 presenze). Verde: 6/6.

**Nota onesta sul «prima» del banco:** sul percorso `step()` del guardiano il vecchio cancello è stato valutato 8 volte, non le ~2 del giro 49: il giro 49 misurava un altro banco (rinnovi, offerte, 300 stagioni). Non posso confermare quale dei due percorsi rappresenti meglio il giocatore vero; il dato comune è che il dado trasformava 6 valutazioni passate in 1 presenza.

## 4. Regressione

Sulla build del commit di correzione (versione dichiarata 7.999.172, GAME_VERSION non toccata):

- `node ci-runner.mjs mirata origin/lavoro/172` (nucleo + guardiani della MAPPA per `src/18`, compreso il nuovo `nazionale-155`): **46/46 verdi**, nessun passo instabile. Dentro: `test:logic`, `save-compat`, `career-critical` (743 s), `design-system`, `typing-shortcuts`, `svincolato-264`, `rinnovo-270`, `simulata-272`, `calendario-247`, `riquadro-euro-105`, `euro-attesa-181` e gli altri della MAPPA.
- Guardiani carriera: `career-invariants` ✅ · `stab-nat-trigger` ✅ · `career-sim` ✅ (2 stagioni) · `tripath-chokepoint` ✅.
- Transpile del file generato con `@babel/standalone` ✅; `tools/check-src.mjs` ✅ (identico byte per byte ai frammenti).
- Non eseguiti (fuori dalla catena scelta per una modifica di sola carriera): gate visivo 14/14, `partita-vera`, `replay`. `docs/governo/STABILITA.json` è stato aggiornato dal runner ma **non** è nel commit (lo decide la sessione principale), come la riga di `docs/governo/ROADMAP.md`.

## 5. Non verificato

- **Partita di club giocata dal vivo** fino all'arrivo nella sosta: l'effect sulla settimana copre ogni percorso per costruzione, ma la prova è solo sul percorso `step()` (simulato).
- **Il ruolo del CT non cambia la partita:** `ctRole` è informativo (log, notifica, voce di calendario); la partita della Nazionale, live o simulata, schiera l'eroe come prima. Non è stata toccata la schermata `nationalCallup`.
- **Sosta occupata** da un'altra gara (coppa/europa) o in fase finale di Europeo/Mondiale: la finestra salta senza messaggio. Non misurato quante soste vengano perse così in una carriera lunga.
- **Ricaricamento nella settimana di sosta:** al montaggio l'effect non decide (per non ripetere la lista); se si ricarica una partita salvata proprio sulla sosta prima che il CT abbia deciso, quella finestra è persa. Non misurato.
- **Taratura:** con 4 finestre e la decisione per merito, un titolare forte gioca tutte e 4 le amichevoli (più i tornei); un comprimario sopra soglia ne gioca 2 per il tetto 7.783. Non confrontato con una carriera da 10 stagioni (banco L6).
- **U18:** invariato (niente Nazionale maggiore); la domanda del giro 49 «sfortuna o taratura» resta aperta.

## 6. Decisioni per la sessione principale

**D1 — Il ruolo del CT deve pesare in campo?**
- A) Resta informativo (stato attuale): zero rischio sulla partita.
- B) «A disposizione» → nell'amichevole simulata l'eroe entra a gara in corso (meno minuti, voto pesato); live invariata.
- C) Come B anche in live (ingresso dalla panchina): tocca `LiveMatch`, catena completa.
**Consigliata: A ora, B nel prossimo giro** (solo percorso simulato, guardiano già pronto da estendere).

**D2 — Soste occupate da coppe:**
- A) La finestra salta (stato attuale).
- B) L'amichevole va alla prima settimana libera successiva entro 2 settimane.
**Consigliata: A** finché un banco non misura quante soste si perdono.
