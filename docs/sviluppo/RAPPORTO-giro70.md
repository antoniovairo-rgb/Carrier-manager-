# Rapporto sviluppo — giro 70 · PO-281 «Acquisti ed investimenti più concreti e impattanti» (con PO-157)

- **Ramo:** `sviluppo/acquisti-281-giro70`, partito da `lavoro/173` (`878844d`).
- **Decisione PO applicata:** «Pacchetto consigliato» (le opzioni in grassetto del rapporto del giro 59, `origin/analisi/acquisti-281-giro59:docs/sviluppo/RAPPORTO-giro59.md` §4).
- **GAME_VERSION non toccata. SAVE_VERSION non toccata:** l'unica migrazione è additiva (marcatore `prep281`).
- **File toccati:** `src/03-eventi-narrativi.jsx`, `src/08-panchina-derby-meteo-cori.jsx`, `src/15-live-match.jsx`, `src/17-menu-creazione-pannelli.jsx`, `src/18-career-app.jsx` (+ `CARRIER-MANAGER-AV.html` ricomposto, `check-src` identico byte per byte); `tests/visual/acquisti-281.mjs` (guardiano nuovo), `tests/visual/sonde-281/acquisti-281-2stagioni.mjs` (sonda prima/dopo), `tests/visual/package.json`, `tests/visual/ci-runner.mjs` (MAPPA + catena carriera).
- **Fuori ambito:** accademia (non nel pacchetto), spese d'impulso una tantum (opzione A «ricordare» non nel pacchetto), il morale come risorsa scarsa (nota trasversale del giro 59: decisione a parte).

---

## 1. Cosa cambia, voce per voce

Ogni voce ha il suo interruttore rosso: acceso, il gioco torna esattamente al comportamento di prima su quella voce.

| # | Voce | Prima (misura giro 59) | Ora | Dove | Rosso |
|---|---|---|---|---|---|
| 1 | **Personal trainer** | ×1,10/1,15/1,20 generico, +5,3 punti sparsi in 2 stagioni | **Piano**: il giocatore sceglie l'attributo (Ufficio → Staff privato, nove bottoni «generale / velocità … posizionamento»). Col piano il moltiplicatore generico lascia il posto a +1 sull'attributo scelto con quota settimanale 0,08/0,12/0,16, scalata dallo stesso rendimento decrescente dell'allenamento; deciso da un hash nome+stagione+settimana (nessun `Math.random`). Senza piano («generale») resta il moltiplicatore di prima. | `src/08` `trainerPiano281`/`trainerQuota281`; chiamata in `weeklyGrowthFields` (`src/18`, chokepoint dei tre path) | `__CPM_NO_TRAINER281` |
| 2 | **Nutrizionista + fisioterapista → Preparatore atletico** | fisio: 0 effetti misurabili; nutri: −0,9 di fatica media | Una figura sola (chiave storica `perkNutrition`, 🏃): recupero settimanale di prima (+2/+3/+4), **gare ravvicinate** (≥2 partite nella stessa settimana di calendario) −3/−4/−5 di fatica sulla partita, **rientro dagli infortuni −1/−1/−2 settimane** (mai sotto 1), rischio infortuni del vecchio fisioterapista (−8/−16/−24%). Costo = quello del vecchio nutrizionista (min 500€, 4% dello stipendio): chi migra non paga di più, chi aveva anche il fisioterapista paga meno. | `src/08` `prepFatica281`/`prepRientro281`/`prepInfLv281`; `src/18` `simInjuryRoll`, infortunio dal vivo, `_fatS79`/`_fatC79`/`postFatigue` | `__CPM_NO_PREP281` |
| 2b | **Migrazione salvataggi** | — | Una volta sola (`prep281`): chi aveva nutrizionista o fisioterapista acceso ritrova il Preparatore acceso al livello più alto dei due; il livello ricordato passa anche da spento; `perkFisio` si spegne. | `src/17` migrazione di `CareerApp` | (non gira col rosso PREP) |
| 3 | **Mental coach** | +0,5·lv di morale (già al tetto: 16→49 settimane a 99) | **Niente morale.** Nelle partite pesanti (peso ≥7, coppa ed eliminazione diretta: stesso criterio di `_imp23`) la parte **negativa** di pubblico e morale nel tasso dal vivo pesa 25/40/55% in meno, con la sua riga nel feedback («🧠 Il mental coach ti tiene lucido»). Nei **bivi di tensione** le conseguenze negative (morale/forma/popolarità/fiducia/chimica giù, fatica su) si riducono del 25/40/55%; il conto no. | `src/08` `mentalPressione281`/`mentalTensione281`; `src/15` `handleAction`; `src/18` `handleImpulseChoice` | `__CPM_NO_MENTAL281` |
| 4 | **Investimenti** (F3 Ufficio + impulso PO-223) | due chiusure separate (letterale del rollover + `investSeason24`), registro solo per F3, nessuna notizia | **Una chiusura** (`chiudiInvestimenti281`, `src/18`) per entrambi, con le formule di sempre (gli importi restano quelli giudicati da `investimento-223`/`meta-conto-265`); **un registro** `investHist24` con `fonte` («impulso»/«ufficio»); **notizia di stampa** per esito (diario, tipo `stampa`); **rischio leggibile prima della scelta** da una tabella calcolata dalle stesse costanti dell'esito: sulla scelta d'impulso («⚖️ Rischio medio: 35% di probabilità di perdere, fino a −45% · fino a +45%») e sotto il bottone dell'Ufficio (tre righe, una per profilo). | `src/08` `rischioF3_281`/`rischioTesto281`; `src/18` `rischio223_281`, `stampaInv281`, `chiudiInvestimenti281`, due render delle scelte, Ufficio | `__CPM_NO_INV281` |
| 5 | **Beni** (casa/auto/barca/fondazione) | popolarità/fiducia una volta all'acquisto | Circa **una settimana su sei** (hash deterministico) un bene posseduto fa parlare **stampa, tifosi, compagni o mister**; il tono dipende dallo **stile** del bene e dall'**ultima partita** (es. barca dopo una sconfitta: «In barca mentre la squadra perde», popolarità −2, fiducia −1; fondazione dopo una sconfitta: lo spogliatoio ti segue all'evento, chimica +2). Notizia nel diario e le ultime tre nell'Ufficio. Campo nuovo `stampa281` (mai sovrascritto dai rami settimana). | `src/08` `BENI_REAZ281`/`beniReazione281`; `src/18` `weeklyStaffRel` (chokepoint dei tre path, `tripath-chokepoint` verde) | `__CPM_NO_BENI281` |
| 6 | **Difetto `vita_auto` / `vita_casa`** | non uscivano mai (leggevano `p.bank`) e, uscendo, scrivevano `bank`/`chem` | La condizione legge `bankBalance`; l'applicazione scrive `bankBalance` e `teamChemistry` (solo se l'evento li muove). | `src/03` cond; `src/18` i due siti `extras` (via `vitaConto281`) | `__CPM_NO_VITA281` |

**Testi visibili al giocatore** (coerenti con l'effetto, verificati dal guardiano sui valori e, per il rischio d'impulso, sul DOM): le righe dello Staff privato (`STAFF24.fx`, `src/08`), la riga del trainer col piano («Piano su tiro: +1 circa ogni 6 settimane (meno quando l'attributo è già alto)»), la riga «🧠» nel feedback dell'azione dal vivo, le righe di rischio, le notizie del diario.

---

## 2. Misure

### 2.1 Guardiano `acquisti-281` (nuovo, in `package.json` e nella MAPPA di `ci-runner.mjs`: src/03, src/0[0-8], src/18 e catena carriera)

Sei controlli sulle funzioni vere della pagina; `npm run acquisti-281` gira il verde e poi **un rosso alla volta**, pretendendo che cada il suo controllo e nessun altro. Esito misurato (build di questo ramo):

| Controllo | Verde (misura) | Rosso acceso (misura) |
|---|---|---|
| T1 trainer, 76 settimane di sola crescita del trainer lv3, piano su tiro | tiro **72 → 82**, altri attributi invariati | 72 → 72 (cade ✅) |
| T2 preparatore | migrazione: fisioterapista lv2 → Preparatore lv2, fisio spento, 3 righe di staff; settimane medie d'infortunio su 300 infortuni a fatica 90: **2,81 → 1,70**; fatica partita in gara ravvicinata 50 → **45** (gara singola: 50) | 4 righe di staff, nessuna migrazione, 2,81/2,81, 50 (cade ✅) |
| T3 mental | morale settimanale con mental lv3 = senza (70 = 70); somma delle conseguenze negative dei 30 esiti negativi dei bivi di tensione **−124 → −55**; pressione dal vivo −0,030 → **−0,0135** in partita pesante, −0,030 in partita normale | morale 71 contro 70, −124/−124, −0,030 (cade ✅) |
| T4 investimenti | chiusura su un caso con due impulsi + un F3: saldo **identico** alla somma delle formule PO-223 + F3 (1.122.932€), registro con fonti `impulso, impulso, ufficio`, **3 notizie**; riga di rischio presente sulla scelta d'impulso vera (`wi_ristorante_socio`) | nessuna fonte, 0 notizie, nessuna riga di rischio (cade ✅) |
| T5 beni, 76 settimane coi quattro beni | **12 reazioni** | 0 (cade ✅) |
| T6 vita | cond vere con 5M€ in `bankBalance`; l'evento toglie davvero 45.000€ dal conto | cond false, scrive `bank` (cade ✅) |

### 2.2 Due stagioni sugli handler veri, stessi semi (`sonde-281/acquisti-281-2stagioni.mjs`)

Metodo del giro 59 (carriera pro S2 W1, FC Werkstadt, 5M€ sul conto, `Math.random` seedato, `__CPM_CAREER.step()`/`startNewSeason()`), con due differenze: ogni braccio gira **due volte coi stessi semi** — «prima» con i sei rossi accesi, «dopo» spenti — e i bivi della settimana **si scelgono** (prima opzione, gestore vero `__CPM_CAREER.scegli`, varco di collaudo nuovo) invece di essere scartati. Medie su 3 semi.

| Braccio | Fase | Morale | Sett. al tetto | Fatica | OVR | Σ attributi | **Tiro** | Infortuni | Fiducia | Voto | Notizie `stampa281` | vita_auto/casa usciti | Conto finale |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | prima | 96,23 | 25,0 | 38,07 | 77,33 | 595,3 | 74,3 | 0 | 57,5 | 5,95 | 0 | 0 / 0 | 5.377.269 |
| base | dopo | 96,33 | 26,3 | 40,03 | 76,67 | 588,7 | 73,7 | 0,33 | 46,6 | 5,91 | 0,33 | **1 / 0** | 5.359.533 |
| trainer3 (piano: tiro) | prima | 96,13 | 23,7 | 37,83 | 78,33 | 600,7 | 74,7 | 0 | 51,0 | 5,94 | 0 | 0 / 0 | 5.213.362 |
| trainer3 (piano: tiro) | dopo | 95,90 | 19,0 | 38,13 | **79,00** | 601,0 | **82,7** | 0,33 | 51,4 | 5,94 | 1,33 | 0,67 / 0 | 5.293.969 |
| prep3 (nutri3+fisio3) | prima | 95,83 | 20,3 | 39,93 | 76,67 | 591,7 | 74,0 | 0 | 52,8 | 5,94 | 0 | 0 / 0 | 5.161.464 |
| prep3 (nutri3+fisio3) | dopo | 95,70 | 15,3 | 39,87 | 76,67 | 589,7 | 74,3 | 0 | 42,4 | 5,94 | 1,67 | 0,33 / 0,67 | 5.405.837 ¹ |
| mental3 | prima | **97,90** | **58,7** | 40,60 | 77,00 | 594,3 | 73,3 | 0,33 | 55,2 | 5,93 | 0 | 0 / 0 | 5.292.747 |
| mental3 | dopo | **96,07** | **21,3** | 39,53 | 77,33 | 592,7 | 73,7 | 0,33 | 58,8 | 5,94 | 0,67 | 1 / 0,33 | 5.301.986 |
| patrimonio (4 beni + 1M€ in F3 bilanciato) | prima | 97,10 | 39,3 | 39,23 | 77,33 | 593,0 | 74,3 | 0,67 | 61,6 | 5,91 | 0 | 0 / 0 | 6.477.389 |
| patrimonio | dopo | 97,33 | 49,3 | 39,10 | 77,00 | 591,7 | 74,3 | 0,33 | 38,4 | 5,91 | **9,67** | 0,67 / 0,67 | 6.279.703 |

¹ Misurato con il costo del Preparatore al 5% (prima stesura); il costo definitivo è 4% (vedi §1), quindi il risparmio reale è più alto. **Il braccio non è stato rigirato** dopo la correzione del costo.

**Bracci con un solo rosso** (per separare gli effetti):
- *patrimonio, solo `BENI` acceso in «prima»* (3 semi): fiducia **45,5 → 42,8 (−2,7)**, notizie 2,0 → 9,3 (nel «prima» ci sono già le notizie degli investimenti). L'effetto atteso dal codice è circa −3 (≈12 reazioni, metà sui beni vistosi, un terzo dopo una sconfitta).
- *base, solo `VITA` acceso in «prima»* (**6 semi**): `vita_auto` esce in 4 carriere su 6 e `vita_casa` in 2 su 6 (prima: 0 su 6); conto medio 5.404.677 → 5.323.633 (−81.043€); fiducia 57,7 → 52,6 nel rumore (scarto fra semi 34,6–77,2).
- La resa F3 del braccio patrimonio è **identica al centesimo** fra prima e dopo (+22.503€ su 1M€ bilanciato, tutti e sei i semi): la chiusura unica non cambia gli importi.

**Come leggere la tabella (onestà sul rumore):**
- Ciò che ha un meccanismo deterministico si legge bene: **tiro +8,0** col piano del trainer (OVR +0,67), **settimane di morale al tetto 58,7 → 21,3** col mental coach senza bonus (morale medio 97,9 → 96,1), **notizie 0 → 9,7** coi beni, eventi di vita **0 → usciti**, resa F3 identica.
- **Fiducia del mister e popolarità non sono leggibili** in questa sonda: oltre alla divergenza fra bracci già dichiarata dal giro 59, ho misurato che **la sonda non è deterministica fra due esecuzioni**: stesso build, stesso seme, stessa configurazione (base/dopo, seme 0) ha dato fiducia **37,4** in un giro e **53,4** in un altro. La causa probabile sono le attese a tempo fra `step`, `scegli` e i pop-up aperti con `setTimeout`, ma **non posso confermarlo**. Lo scarto di −23 sulla fiducia nel braccio patrimonio con tutti i rossi **non** viene dai beni (col solo rosso BENI: −2,7).
- **Preparatore atletico:** in questa carriera di lega **0 infortuni in entrambe le fasi** e la fatica media resta ~40: le gare ravvicinate sono rare (nessuna coppa europea). L'effetto sul rientro è misurato solo dal guardiano (2,81 → 1,70 settimane su 300 infortuni), non sulla carriera.
- **Voto medio** 5,91–5,95 in tutti i bracci: la partita simulata non legge morale né pressione, quindi il mental coach in due stagioni simulate agisce solo sui bivi di tensione.

---

## 3. Catena eseguita

Build del commit `ed4ddcb` (sorgente identico a quello pubblicato; i commit successivi toccano solo documenti).

- **Prima dei guardiani:** `test:logic` 43/43 · `career-invariants` ✅ · `stab-nat-trigger` ✅ (dopo aver riportato il costo del Preparatore al 4%: alla prima stesura al 5% il guardiano STAB-ECO era **rosso**, «costi staff (19%) errati (got 32000)» — ho corretto il costo, non il guardiano) · `career-sim` ✅ 2 stagioni · `tripath-chokepoint` ✅ · `check-src` identico.
- **Catena `mirata` contro `origin/lavoro/173`** (nucleo + guardiani della MAPPA per src/03, 08, 15, 17, 18): **87/89 verdi**, registrata in `docs/governo/STABILITA.json`. Giro **composto**: il container si è riavviato al passo 24 (tutti verdi); i 65 mancanti sono stati rifatti sullo stesso build con `CPM_CI_FATTI` (regola del 14/10).
  - Comprende `test:logic`, `save-compat`, `design-system`, `typing-shortcuts`, `career-critical` (740 s), `investimento-223`, `meta-conto-265`, `acquisti-281`, `griglia-mobile`, `validate-situations` e i guardiani del motore di src/15.
  - ❌ `tempo-138` — rosso 2 volte su 2: «rosso: il difetto non si vede» (braccio rosso cieco). **Identico sulla base `lavoro/173`** (`npm run tempo-138` in una copia di `origin/lavoro/173`: stesso messaggio). Preesistente, non di questo giro.
  - ❌ `pressing-143` — rosso: «verde: marcatore a 4.08 m (atteso <= 3,5)». **Identico sulla base `lavoro/173`** (stesso valore 4,08 m). Preesistente.
  - ⚠️ `difesa-220-giro31` — instabile: verde alla seconda prova.
- La modifica in src/15 è neutra per costruzione quando il mental coach è spento (`mentalPressione281` moltiplica per 1): nessun guardiano del motore attiva il mental coach.
- **Resa:** la foto `griglia-mobile` dell'Ufficio a 360 px mostra lo Staff privato con i bottoni del piano e la riga del Preparatore atletico, senza scroll orizzontale (foto rigenerata dal guardiano, non committata).

---

## 4. Decisioni per la sessione principale (consigliata in **grassetto**)

1. **Peso del piano del trainer.** Lv3 dà +8 punti sull'attributo scelto in due stagioni (da 74 a 82, OVR +0,7) al costo di ~150.000€. Opzioni: **A. tenere le quote 0,08/0,12/0,16** (impatto netto, coerente con «concreti e impattanti»); B. dimezzarle (≈ +4); C. lasciare anche il moltiplicatore generico insieme al piano (più forte ancora, sconsigliata).
2. **Mental coach nella partita simulata.** Oggi la simulata non ha pressione, quindi chi simula vede il mental coach solo nei bivi di tensione. Opzioni: **A. lasciare così** e dichiararlo nella riga dello staff (già dice «partite pesanti» e «bivi di tensione», vero su entrambi i percorsi tranne la pressione in simulata); B. introdurre una pressione nelle simulate pesanti (malus nuovo per tutti, il mental coach lo attenua: cambia il bilanciamento di ogni carriera, va misurato a parte); C. aggiungere «(dal vivo)» al testo della pressione.
3. **`vita_casa` / `vita_auto` e i beni dell'Ufficio.** L'evento fa spendere 180.000€ / 45.000€ ma non aggiunge «Casa»/«Auto» ai beni (che costano 250.000€ / 150.000€). Opzioni: **A. lasciare separati** (sono «la prima casa» e «l'auto dei sogni», un momento di vita, non il bene di lusso); B. comprarli dall'evento li rende «tuoi» nell'Ufficio (allora i prezzi vanno riallineati); C. togliere i due eventi.

---

## 5. Non verificato

- **Resa sullo schermo** di righe di rischio dell'Ufficio, notizie nel diario e reazioni dei beni nell'Ufficio: non fotografate (la foto di `griglia-mobile` mostra solo lo Staff privato, su un eroe senza beni né investimenti). La riga di rischio d'impulso è verificata come testo presente nel DOM. Il piano del trainer si sceglie anche a trainer spento (scelta preparata in anticipo): da confermare col PO.
- **I due rossi della catena** (`tempo-138`, `pressing-143`) sono preesistenti sulla base: non li ho indagati.
- **Pressione dal vivo del mental coach:** verificata come funzione (−0,030 → −0,0135); **non** ho giocato partite dal vivo a bracci, quindi l'effetto sui gol/esiti non è misurato.
- **Infortuni nati fuori dalle due funzioni toccate** (eventi settimanali, ricaduta da rientro forzato): il preparatore non ne accorcia il rientro. Non ho censito se esistono altri punti in cui nasce un infortunio oltre a `simInjuryRoll`, l'infortunio dal vivo e la ricaduta (`src/18` ~707).
- **Gare ravvicinate nelle simulate europee** (`_fatE`, `src/18` ~3256/3287): lì la gara simulata recupera già 14 punti e non l'ho toccata.
- **Popolarità e fiducia** nella sonda delle due stagioni: nel rumore (sonda non deterministica fra esecuzioni, vedi §2.2).
- **U18:** tutto lo staff privato e i beni restano dietro `proStatus!=="u18"`; non misurato.

## 6. Come rifare le misure

```bash
cd tests/visual
export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
npm run acquisti-281                                                     # verde + sei rossi, ~90 s
CPM_SEEDS=3 CPM_PAR=3 CPM_ARMS=base,trainer3 node sonde-281/acquisti-281-2stagioni.mjs     # ~3 min
CPM_SEEDS=3 CPM_PAR=3 CPM_ARMS=prep3,mental3,patrimonio node sonde-281/acquisti-281-2stagioni.mjs
CPM_ROSSI=BENI CPM_ARMS=patrimonio node sonde-281/acquisti-281-2stagioni.mjs   # un solo rosso in «prima»
```
