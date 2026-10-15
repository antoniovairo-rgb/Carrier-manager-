# PROPOSTA L6 — impulsi, Nazionale, difficoltà, economia, archetipi

**Data:** 15/10/2026 · **Giro:** 38 · **Ramo:** `analisi/proposta-l6-giro38` (base `collaudo/carriere-l6`, `a60c1bb`)
**Versione del gioco letta:** `GAME_VERSION` 7.999.169 (`src/07-versione-save-interviste.jsx:35`), `SAVE_VERSION` 9 (`:469`)
**Decisione che la richiede:** PO 15/10 notte (L6) «Proposta e questionario».
**Natura:** solo documento. Nessuna modifica a `src/`, a `CARRIER-MANAGER-AV.html` o ai test.

**Fonti lette:** `docs/collaudi/RAPPORTO-carriere-l6.md` (fase 1) e i suoi dati grezzi `docs/collaudi/dati-carriere-l6/`
(30 file `carriera-NN.json` + `riepilogo.json`); righe PO-098, PO-153…157, PO-190 (e i doppioni PO-021, PO-177) di
`docs/governo/BACKLOG.md` nella versione di `origin/poc/marioprada-character-system`; `docs/governo/DECISIONI.md`;
il banco `tests/visual/collaudo-l6/career-run.mjs`; il codice in `src/` (citato `file:riga`).

**Come leggere i numeri.** Ogni numero porta la fonte. I numeri che **non** vengono dal rapporto li ho ricalcolati io
dai dati grezzi con uno script di sola lettura (indicato «ricalcolo dai JSON»). Le stime di costo in giri sono una
**mia valutazione**, non una misura. «Non posso confermarlo» = il dato non c'è; accanto c'è come misurarlo.

**Zona G** (`DECISIONI.md:167`): «stagioni, offerte, impulsi, Nazionale, difficoltà, economia e Ufficio» — ferma salvo
eccezione del PO (ultima conferma: `DECISIONI.md:397`). Ogni intervento qui sotto dichiara se la tocca.

---

## 0. Prima di decidere: tre numeri della fase 1 sono figli del banco, non del gioco

Rileggendo i dati grezzi accanto al codice, tre dei quattro numeri-guida citati nella decisione PO non descrivono il
gioco ma il modo in cui il banco lo ha guidato. Lo scrivo per primo perché cambia le proposte su PO-155, PO-156 e PO-157.

### 0.1 Dalla 4ª stagione l'eroe è svincolato in tutte le 30 carriere

- **Banco:** il salvataggio sintetico dà `contract:{duration:3, wage:6000, expiresAtSeason:5}`
  (`tests/visual/collaudo-l6/career-run.mjs:31`).
- **Gioco:** al cambio stagione la durata scala di uno (`src/18-career-app.jsx:5010`) e
  `contractExpired = newContract.duration<=0` (`:5011`). Da svincolato l'economia settimanale non accredita nulla
  (`weeklyEconomyFields` ritorna `{}`, `:1520`) e nelle partite simulate l'eroe non è schierato: 0 gol, 0 assist
  (`:3249`).
- **Dati (ricalcolo dai JSON):** durata del contratto 0 in **210 stagioni su 300** (S4→S10 di tutte le 30 carriere).
  Gol dell'eroe per stagione: S1 **8,87** · S2 **9,23** · S3 **9,90** · da S4 a S10 **0,00**. Partite senza voto
  dell'eroe: 1-8 per coorte in S1-S3, **970-990** per coorte da S4 in poi. Cambi di club: **0**. Offerte di
  trasferimento registrate: **0**.
- **Conseguenze sui numeri della fase 1:**
  - «Saldo fermo in 210 stagioni su 270» (rapporto §6): sono **esattamente** le 210 stagioni da svincolato. Il saldo
    cresce di 210 600 nella prima stagione = 6 000 × 39 settimane × 0,9 (commissione dell'agente del 10%,
    `:1522`); poi si ferma perché lo stipendio non c'è più. **Non è (ancora) un difetto dell'economia.**
  - «Gol dell'eroe da 8,25 a 0,24 a stagione» (rapporto §4): la fascia d'età coincide con l'indice di stagione
    (età di partenza 17-22). Il calo è il contratto scaduto, **non una curva di difficoltà**.
- **Non posso confermarlo:** se nel gioco giocato da un utente la scadenza arrivi senza una proposta di rinnovo. Il
  banco chiama `C.dismiss()` a ogni passo (`career-run.mjs`, ciclo principale): una proposta di rinnovo, se apparsa,
  è stata chiusa senza risposta. Le schermate osservate in 300 stagioni sono solo due, `dashboard` (19 042 passi) e
  `seasonAwards` (300) (ricalcolo dai JSON, campo `screens`). **Misura:** rifare 10 carriere con il banco che
  accetta il rinnovo quando viene offerto, e contare a parte le carriere in cui l'offerta non arriva mai.

### 0.2 «Nessuna schermata di convocazione» è strutturale al banco

- La schermata `nationalCallup` si apre **solo** da `startMatch`, cioè quando l'utente sceglie di giocare la gara
  della Nazionale (`src/18-career-app.jsx:995-998`). Il banco simula sempre (`__CPM_SIM_NAT=1`,
  `career-run.mjs`; ramo simulato `src/18-career-app.jsx:1337-1340` e `:4436-4442`).
- Quindi «0 schermate in 300 stagioni» è atteso: **non dimostra** che la convocazione manchi. Le presenze ci sono:
  20 carriere su 30 hanno almeno una presenza (ricalcolo dai JSON).
- **Un dato nuovo invece c'è:** delle 73 stagioni in cui le presenze in Nazionale crescono, **65 sono stagioni da
  svincolato** (135 presenze da svincolato). Il cancello della convocazione non guarda il contratto
  (`src/18-career-app.jsx:4164`: `!isInU18 && !_callupBusyWk && !player.injured`). È un difetto di realismo
  verificato sui dati: un giocatore senza squadra e senza partite (`continuity`=0, `:4199`) viene chiamato.

### 0.3 L'effetto degli archetipi nella fase 1 non è leggibile, e il registro `ledger` non è l'economia

- Il banco usa 12 «archetipi» (`career-run.mjs:16`), ma quattro (`dominatore`, `contropiede`, `pressing`,
  `fantasioso`) sono **personalità dei club avversari** (`NPC_PERSONAS`, `src/06-archetipi-agenti-sponsor.jsx:828-833`),
  non archetipi del giocatore (`ARCHETYPES`, `:817-826`, otto voci). **8 carriere su 30** hanno un archetipo che il
  gioco non conosce. In più le otto statistiche partono tutte uguali all'OVR (`career-run.mjs:30`): il bonus
  d'archetipo della creazione (`baseStats`, `src/05-cronaca-stadi-formazioni.jsx:556`) non è mai applicato.
  Si somma al confondente già dichiarato dal rapporto (§1.2). **La tabella per archetipo non va usata.**
- `ledger` è il **registro della parola data** (promesse, patti, sponsor, esonero, gratitudine:
  `src/18-career-app.jsx:1852` e 11 chiamate a `ledgerPush`), non il conto dell'Ufficio. Il suo vuoto dice che il
  banco non ha preso impegni, non che l'Ufficio sia senza effetto.

**Conclusione del §0:** i numeri di PO-154 (impulsi) reggono; quelli di PO-155, PO-156 e PO-157 vanno rimisurati
prima di tarare. Per questo la prima voce dell'ordine dei lavori (§7) è un **banco corretto**, che non tocca il gioco.

---

## 1. PO-154 — Impulsi ed eventi: contesto, conseguenze nel tempo, memoria e catene

**Zona G: sì** (impulsi). Oggi è concessa solo la presentazione (`DECISIONI.md:206`) e l'aggancio di prova (`:201`).

### 1.1 Cosa dicono i numeri

| Misura | Valore | Fonte |
|---|---|---|
| Voci nel catalogo `WEEKLY_IMPULSES` | **106** | rapporto §2; `src/03-eventi-narrativi.jsx:332-794` |
| Voci senza `cond` | **40** su 106 (38%) | rapporto §2; ricalcolo sul sorgente |
| Voci `once:true` | 25 | ricalcolo sul sorgente |
| Scelte in totale | **221** | ricalcolo sul sorgente |
| Scelte con una conseguenza **nel tempo** | **3** su 221 (`flag:"investment"`, `:393`, `:715`, `:775`) → unico effetto differito `investmentPending`, pagato al cambio stagione (`src/18-career-app.jsx:3914`, `:5326`) | ricalcolo sul sorgente |
| Tutte le altre scelte | effetto **immediato** su morale/fatica/forma/popolarità/fiducia/valore/banca/chimica (`src/18-career-app.jsx:3906-3917`) | sorgente |
| Eventi osservati | 3 760 in 300 stagioni (12,5 a stagione); il 47% da voci senza condizione | rapporto §2 |
| Unici per carriera | 90,3 su 106 | rapporto §2 |
| Ripetizioni | 1 052 (28%, limite inferiore) | rapporto §2 |
| «Memoria» esistente | solo anti-ripetizione: ultimi 40 id (`recentImpulses`) e contatore a vita (`impulseSeen`) (`src/18-career-app.jsx:4085`) | sorgente |
| Scelta dell'impulso | `pick` / `Math.random` non seedato (`src/18-career-app.jsx:4083`) | sorgente |

Lettura: le ripetizioni **non** sono un guasto del selettore. Con ~125 impulsi a carriera e ~90 voci idonee, il
selettore esaurisce quasi tutto il catalogo prima di ripetere (`impulseFreshBucket`); ripetere è aritmetico.
Il vuoto vero è un altro: **nessuna scelta ricorda di essere stata fatta**, tranne tre investimenti.

**Non posso confermarlo:** l'effetto visibile di ogni impulso sul gioco (coppie biforcate non eseguite, rapporto §2)
e la frequenza in una carriera giocata a mano (il banco simula; 12,5 a stagione non è detto che sia il valore vero).
**Misura:** coppie gemelle sullo stesso salvataggio che differiscono per una sola scelta, 4 stagioni dopo.

### 1.2 Il problema per il giocatore

Le scelte della settimana non lasciano traccia: dopo pochi giorni nessuno le ricorda, e il 38% degli impulsi può
capitare a chiunque, in qualunque momento della carriera.

### 1.3 Opzioni

| | Intervento | Costo (stima) | Rischio salvataggi | Guardiano proposto |
|---|---|---|---|---|
| **A** | **Memoria delle scelte + catene corte.** Un campo `impMem` (id impulso → scelta, stagione, settimana) scritto nel punto unico in cui si applica la scelta (`:3906`). Una ventina di impulsi «seguito» con `cond` che legge `impMem` (es. documentario accettato → due mesi dopo la puntata esce e divide lo spogliatoio). Conseguenze differite generalizzate da `flag` a una coda `pendingFx` {settimana, effetto, testo}, consumata dal chokepoint settimanale comune ai tre percorsi (vedi `tripath-chokepoint-test.mjs`). | 3-4 giri | Basso: campi nuovi opzionali con migrazione additiva (schema `src/17-menu-creazione-pannelli.jsx:2436`), **nessun bump** di `SAVE_VERSION` | `impulsi-memoria` (nuovo): una scelta fatta in S1 cambia almeno un impulso entro S2 nelle coppie gemelle; rosso `__CPM_NO154`; + `tripath-chokepoint-test` |
| **B** | **Solo contesto.** Dare una `cond` alle 40 voci senza condizione (fase di carriera, ruolo, risultati recenti), senza memoria. | 1-2 giri | Nullo (catalogo, nessun campo) | `impulsi-contesto`: 0 voci senza `cond` salvo una lista dichiarata di «universali»; misura della quota senza condizione sul banco |
| **C** | **A + B + seme.** Come A, con la scelta dell'impulso seedata (stagione+settimana+nome) per rendere riproducibili le catene. | 4-5 giri | Basso come A | come A + `career-sim-test` con due giri identici sullo stesso seme |

### 1.4 Raccomandazione

**A, con B dentro il primo giro.** Il PO ha chiesto «memoria e catene» (`BACKLOG`, PO-154: «Nessun impulso ha
memoria»), e A è l'unica opzione che lo dà; B da sola alza il contesto ma lascia le scelte senza seguito. Il seme (C)
lo rimanderei: cambia la sequenza degli impulsi per tutti i salvataggi esistenti, e non serve per avere le catene.

### 1.5 Domanda per il questionario

**PO-154 — Cosa devono fare le scelte della settimana?**
1. **Ricordarsi e tornare: memoria delle scelte e una ventina di seguiti nelle settimane dopo, più contesto per i 40 impulsi «universali» (consigliata)**
2. Solo contesto: ogni impulso compare solo nella fase di carriera giusta, senza seguiti
3. Memoria, seguiti e sequenza riproducibile (stesso salvataggio, stessi impulsi), accettando che i salvataggi in corso vedano impulsi diversi da prima
4. Lasciare il sistema com'è e lavorare solo sulla presentazione

---

## 2. PO-155 — Nazionale per finestre internazionali, qualificazioni, CT e convocati

**Zona G: sì** (Nazionale).

### 2.1 Cosa dicono i numeri

| Misura | Valore | Fonte |
|---|---|---|
| Schermate di convocazione | 0 in 300 stagioni — **atteso col banco** (§0.2) | rapporto §3; `src/18-career-app.jsx:995-998` |
| Carriere con almeno una presenza | 20 su 30 | ricalcolo dai JSON |
| Prima presenza: età / OVR | età 18-32 · OVR 77-88 (20 casi) | ricalcolo dai JSON |
| Presenze massime in una carriera | 20 | rapporto §3 |
| Presenze guadagnate da svincolato | **65 stagioni su 73** con presenze nuove; 135 presenze | ricalcolo dai JSON (§0.2) |
| Come nasce la chiamata | **tiro di dado settimanale** seedato: `callP = clamp(0,10/0,16 + elig·0,012, 0,03, 0,55)` e `if(_cuR()<callP)` | `src/18-career-app.jsx:4213-4219` |
| Tetto di finestre a stagione | 2-8, dipende dall'idoneità | `:4211` |
| Avversario | estratto fra 10 nazionali, amichevole alla prima settimana libera | `:4220-4228` |
| CT e lista dei convocati | esistono una lista CT (`ctListView`, soglia `NAT_CALL_LEVEL`, `:4193`) e un evento «il CT era in tribuna» (`:2626`); NPC con presenze da un'altra formula (commento `:4170-4174`) | sorgente |

Il commento dello stesso codice lo dice: le presenze dei compagni del CT e quelle dell'eroe «nascono da due formule
che non si sono mai parlate» (`:4170-4174`). Le qualificazioni esistono solo dentro `euroMondiale` (fase
`qualificazioni`, `:4230`); le amichevoli non sono legate a finestre di calendario.

**Non posso confermarlo:** la convocazione nel percorso giocato a mano (schermata, debutto, memoria
`national_debut`, `:3528`). **Misura:** 5 carriere col banco che **gioca** la gara della Nazionale invece di simularla
(senza `__CPM_SIM_NAT`), contando schermate, presenze ed età al debutto.

### 2.2 Il problema per il giocatore

La Nazionale arriva come un sorteggio settimanale, anche a un giocatore senza squadra, e non c'è un calendario di
finestre, qualificazioni o un CT che spieghi perché si è dentro o fuori.

### 2.3 Opzioni

| | Intervento | Costo (stima) | Rischio salvataggi | Guardiano proposto |
|---|---|---|---|---|
| **A** | **Correzione minima.** Il cancello esclude lo svincolato e chi non gioca da N settimane (`:4164`). Nessun'altra modifica. | 1 giro | Nullo | estensione di `stab-nat-trigger-test`: 0 presenze da svincolato; rosso `__CPM_NO155A` |
| **B** | **Finestre fisse.** 4-5 finestre internazionali per stagione a settimane dichiarate (come la pausa vera), 2 gare ciascuna; qualificazioni del torneo dentro le finestre; a ogni finestra **una lista del CT** (23 nomi, eroe dentro o fuori) costruita dalla stessa formula per eroe e NPC, con il motivo in chiaro («forma», «minuti», «concorrenza»). Sostituisce il dado settimanale. | 4-6 giri | Medio: il calendario cambia forma (amichevoli già in calendario `matchday 1470+W` vanno conservate o convertite); serve migrazione al caricamento, probabile bump a `SAVE_VERSION` 10 | `nazionale-finestre` (nuovo): finestre alle settimane dichiarate in 10 stagioni, CT ed eroe sulla stessa scala, presenze di un titolare fisso 50-90 in 10 stagioni (tarato sul commento PO di `:4180-4186`); + `career-invariants`, `save-compat` |
| **C** | **B senza qualificazioni proprie.** Finestre e lista CT, ma le qualificazioni restano quelle attuali di `euroMondiale`. | 3-4 giri | Medio (come B, meno calendario toccato) | come B |

### 2.4 Raccomandazione

**A subito (è un difetto verificato e piccolo), poi C.** C dà ciò che il giocatore vede — quando si gioca, chi
decide, perché — senza riscrivere le qualificazioni del torneo, che hanno già una loro storia di correzioni (es.
`:4230`). B si può fare dopo, se il PO vuole anche il girone di qualificazione giocato.

### 2.5 Domanda per il questionario

**PO-155 — Come deve funzionare la Nazionale?**
1. **Prima la correzione dello svincolato, poi finestre fisse con la lista del CT a ogni finestra; le qualificazioni restano quelle del torneo (consigliata)**
2. Finestre fisse, lista del CT e anche il girone di qualificazione giocato nelle finestre
3. Solo la correzione dello svincolato, il resto com'è
4. Prima misurare il percorso giocato a mano (5 carriere), poi decidere

---

## 3. PO-156 — Difficoltà unica tarata sulla carriera intera

**Zona G: sì** (difficoltà). Vincolo fermo: **difficoltà unica, nessun selettore, né ora né in futuro**
(`DECISIONI.md:13`).

### 3.1 Cosa dicono i numeri

| Misura | Valore | Fonte |
|---|---|---|
| Gol eroe per fascia d'età (8,25 → 3,69 → 0,24 → 0) | **non utilizzabile**: è il contratto scaduto dalla S4 (§0.1) | rapporto §4; ricalcolo dai JSON |
| Gol eroe in S1-S3 (eroe sotto contratto) | 8,87 · 9,23 · 9,90 a stagione | ricalcolo dai JSON |
| OVR medio per fascia | 74 · 80 · 84 · 83 | rapporto §4 |
| Per livello di club (debole/media/forte) | OVR 75/81/87 · posizione media 14,0 / 16,4 / 4,1 · voto 5,62 / 5,53 / 6,22 | rapporto §4 |
| Voto medio | 5,69-5,96 in tutte le fasce | rapporto §4 |
| Curva di crescita del codice | ×1,0 fino a 26 anni, ×0,75 a 27-28, ×0,55 a 29-30, ×0,25 a 31-33, ×0,06 dopo (`trainAgeMult`) | `src/06-archetipi-agenti-sponsor.jsx:80` |
| Obiettivo gol dell'eroe forte in partita | 0,6-0,9 a partita | `DECISIONI.md` 30/09 |
| Titolare %, «quando si diventa dominanti» | **non misurati** | rapporto §4 |

**Non posso confermarlo:** nessuna delle quattro fasi (gavetta, affermazione, élite, declino) ha oggi un numero
valido sul rendimento, perché dalla S4 l'eroe non gioca. Le uniche curve affidabili sono l'OVR e il livello di club.
Inoltre le carriere sintetiche partono già da professionista (`proStatus:'pro'`, `career-run.mjs:29`): la gavetta U18
non è stata vista. **Misura:** banco corretto (§7, passo 0) con rinnovo, partenza U18 dalla creazione normale per
almeno 10 carriere, e per stagione: minuti/titolarità, gol+assist per partita, voto, posizione, premi.

### 3.2 Il problema per il giocatore

Non sappiamo ancora se la carriera è troppo facile o troppo dura in una fase precisa: il dato che sembrava dirlo è
un artefatto del collaudo.

### 3.3 Opzioni

| | Intervento | Costo (stima) | Rischio salvataggi | Guardiano proposto |
|---|---|---|---|---|
| **A** | **Prima i bersagli, poi la taratura.** Il PO fissa 4-5 numeri per fase (es. titolare a 19 anni, gol a partita da élite, età del picco, quanto dura il declino); il banco corretto li misura; si tara un solo parametro alla volta (crescita, titolarità, resa della sim). | 1 giro di bersagli + 2-3 di taratura | Nullo per i bersagli; basso per la taratura (parametri, nessun campo) | `curva-carriera` (nuovo): le 4 fasi dentro le bande del PO su 30 carriere; rosso con la curva attuale |
| **B** | **Tarare subito la crescita** (`trainAgeMult`) guardando solo l'OVR. | 1 giro | Nullo | `career-sim-test` esteso all'OVR per età |
| **C** | **Difficoltà adattiva** (avversari più forti man mano che l'eroe cresce). | 3-4 giri | Basso | come A |

### 3.4 Raccomandazione

**A.** Tarare senza bersagli e su dati sbagliati è il rischio maggiore di questa voce; B ottimizza l'unico numero
che non era stato contestato. C la sconsiglio: rischia di somigliare a un selettore nascosto, che il PO ha escluso.

### 3.5 Domanda per il questionario

**PO-156 — Da dove partiamo con la difficoltà?**
1. **Il PO fissa 4-5 numeri bersaglio per fase, il banco corretto li misura, poi si tara un parametro alla volta (consigliata)**
2. Tarare subito la crescita dell'OVR con l'età, il resto dopo
3. Avversari che si rafforzano con l'eroe (difficoltà adattiva)
4. Aspettare le altre voci di L6 e tarare per ultima

---

## 4. PO-157 — Economia e Ufficio con effetto reale; mondo vivo e pressione del club

**Zona G: sì** (economia, Ufficio; la pressione del club tocca anche stagioni e offerte).

### 4.1 Cosa dicono i numeri

| Misura | Valore | Fonte |
|---|---|---|
| Saldo fermo 210 stagioni su 270 | **= stagioni da svincolato** (§0.1) | rapporto §6; ricalcolo dai JSON |
| Saldo massimo raggiunto | 626 400 € (stipendio sintetico 6 000/settimana) | ricalcolo dai JSON |
| Investimenti, staff, accademia, beni usati | **0** in tutte le carriere (staff `perkTrainer` sempre falso; nessun acquisto) | ricalcolo dai JSON |
| Cosa offre l'Ufficio (codice) | staff a 3 livelli: trainer +10/15/20% allenamento, nutrizionista +2/3/4 recupero, fisioterapista −8/16/24% infortuni, mental coach +0,5/1/1,5 morale (`STAFF24`, `src/08-panchina-derby-meteo-cori.jsx:43-47`); investimenti con rendimento seedato a fine stagione (`INVEST24`, `:69-74`); beni con effetto su popolarità/fiducia/morale e sull'eredità (`BENI24`, `:81-90`); accademia (`academy24`); tab `ufficio` (`src/18-career-app.jsx:10415`, `:10562`) | sorgente |
| Pressione del club | esiste uno stato societario derivato da `clubEvo` (`src/18-career-app.jsx:2169-2182`, aggiornato a fine stagione `:5143`) | sorgente |
| Effetti misurati | **nessuno**: l'Ufficio non è mai stato usato dal banco | rapporto §6 |

**Non posso confermarlo:** che le voci dell'Ufficio cambino davvero il gioco (allenamento, infortuni, morale), né di
quanto. Il codice dichiara gli effetti, la misura manca. **Misura:** «gemelli economici» — stesso salvataggio, un
braccio con lo staff al livello 3 e uno senza, 4 stagioni, confronto su OVR, infortuni, morale e saldo; stessa cosa
per un investimento rischioso e per i beni.

### 4.2 Il problema per il giocatore

I soldi si accumulano senza che spenderli si senta in campo, e il club non chiede mai conto di niente.

### 4.3 Opzioni

| | Intervento | Costo (stima) | Rischio salvataggi | Guardiano proposto |
|---|---|---|---|---|
| **A** | **Misura e potatura.** Gemelli economici su ogni voce dell'Ufficio; ciò che sposta meno di una soglia fissata dal PO si **toglie o si accorpa** (come chiede la voce: «dare un effetto reale e visibile a ciò che resta, oppure togliere o accorpare»); per ciò che resta, l'effetto si mostra nella schermata (es. «−16% infortuni: 1 infortunio evitato questa stagione»). | 1 giro di misura + 2 di intervento | Basso: togliere una voce richiede di neutralizzare i campi nei salvataggi (migrazione additiva, nessun bump) | `ufficio-effetti` (nuovo): ogni voce rimasta sposta il suo numero oltre la soglia nei gemelli; rosso con l'interruttore della voce (`__CPM_NO_STAFF24`, `__CPM_NO_INVEST24`, `__CPM_NO_BENI24` già esistono) |
| **B** | **A + pressione del club.** Il presidente fissa obiettivi (esistono già gli obiettivi di stagione, `src/06-archetipi-agenti-sponsor.jsx:790-812`) e lo stato `clubEvo` produce conseguenze leggibili: rinnovo più o meno generoso, minuti, cessione proposta. | 4-6 giri | Medio: tocca rinnovi e offerte (stessa area del §0.1) | come A + `career-invariants`, `career-sim-test`, `save-compat` |
| **C** | **Mondo vivo** (altri giocatori che si trasferiscono, allenatori esonerati in altri club, notizie). | 4+ giri | Basso-medio | da definire dopo A |

### 4.4 Raccomandazione

**A, e il rinnovo del contratto dentro la misura.** Prima di aggiungere pressione (B) bisogna sapere se il percorso
del rinnovo funziona: il §0.1 mostra 30 carriere su 30 rimaste svincolate per sette stagioni nel percorso misurato,
e 0 offerte in 300 stagioni. Se il gioco vero si comporta così, quello è il primo difetto dell'economia, prima
dell'Ufficio. B e C vengono dopo, con i numeri di A.

### 4.5 Domanda per il questionario

**PO-157 — Cosa facciamo con l'Ufficio?**
1. **Prima misurare ogni voce (staff, investimenti, beni, accademia) e il rinnovo; poi togliere ciò che non si sente e mostrare l'effetto di ciò che resta (consigliata)**
2. Misura e potatura, e subito dopo la pressione del presidente sugli obiettivi
3. Tenere tutte le voci e rafforzarne gli effetti senza togliere nulla
4. Prima il «mondo vivo» (trasferimenti e notizie degli altri club), l'Ufficio dopo

---

## 5. PO-098 — Archetipi: da 8 a 4 stili che cambiano il gioco; Enfant diventa tratto di crescita

**Zona G: in parte.** La crescita (`trainAgeMult`, crescita giovanile) è carriera → zona G. Gli effetti in partita
toccano il motore → **L1**, non zona G, ma regola `docs/REAL-MATCH-ENGINE.md` e catena completa.

### 5.1 Cosa dicono i numeri

| Misura | Valore | Fonte |
|---|---|---|
| Archetipi del giocatore | **8** (`bomber`, `fantasista`, `velocista`, `trequartista`, `leader`, `centravanti`, `enfant`, `tuttocampista`) | `src/06-archetipi-agenti-sponsor.jsx:817-826` |
| Dove agisce l'archetipo oggi | statistiche iniziali (`bonus`, `baseStats`); crescita: 60% delle crescite sulle stat «favorite» (`src/18-career-app.jsx:5019-5021`); bonus di riuscita `ARCHETYPE_STAT_BONUS` (`src/06-archetipi-agenti-sponsor.jsx:26-35`, usato da `succRate`, `:44`); obiettivi di stagione (`:797-812`); gol/assist delle partite simulate (`_pSimStats`, `src/10-folla-stadi-ritiro.jsx:908-909`) | sorgente |
| Enfant | crescita ×1,35 fino a 22 anni (`archGrowthMult`, `src/06-archetipi-agenti-sponsor.jsx:83`) | sorgente |
| Archetipo nel motore della partita | **assente**: la parola `archetype` non compare in `src/14-motore-possesso.jsx`; la probabilità dell'eroe la decide solo `probEroe` (`:1480`) per decisione PO «brain unico» (`DECISIONI.md` 30/09). `succRate` con il bonus d'archetipo resta come ripiego (`src/15-live-match.jsx:9773`, `:11133`, `:11361`) | sorgente |
| Effetto misurato in carriera | **non leggibile** (§0.3: 8 carriere con archetipo inesistente, statistiche piatte, confondente con ruolo e club) | ricalcolo; rapporto §1.2 |
| `__CPM_NO_STILI` | non esiste nel sorgente | BACKLOG, riga PO-098 |

Lettura: con il «brain unico», in partita vera l'archetipo **probabilmente non cambia nulla** oltre alle statistiche
che ha spostato alla creazione. **Non posso confermarlo** senza misura. **Misura:** 12 partite vere per braccio sullo
stesso salvataggio cambiando solo l'archetipo (bomber contro trequartista), contando tipi di scene offerte, tiri,
assist, gol.

### 5.2 Il problema per il giocatore

Scegliere l'archetipo cambia qualche numero di partenza, ma in campo il bomber e il trequartista giocano allo stesso
modo.

### 5.3 Opzioni

| | Intervento | Costo (stima) | Rischio salvataggi | Guardiano proposto |
|---|---|---|---|---|
| **A** | **4 stili nel motore + Enfant come tratto.** Quattro stili (proposta di lavoro, da far scegliere al PO: *Finalizzatore* ← bomber/centravanti · *Regista* ← fantasista/trequartista · *Incursore* ← velocista · *Trascinatore* ← leader/tuttocampista) che `probEroe` e la scelta delle scene leggono (quali occasioni arrivano all'eroe, quale opzione ha più resa). Enfant diventa un tratto `crescitaPrecoce` indipendente dallo stile, sceglibile in creazione. | 5-7 giri (motore + creazione + migrazione) | **Alto**: ogni salvataggio ha `archetype` fra gli 8 id → **mappatura obbligatoria** vecchio→nuovo al caricamento, **bump a `SAVE_VERSION` 10**; l'Enfant esistente va convertito in stile + tratto | `stili-gioco` (nuovo): la distribuzione delle scene e degli esiti differisce fra stili oltre una soglia su 12 partite per braccio; rosso `__CPM_NO_STILI`; + `save-compat` con i salvataggi di tutti e 8 gli archetipi; catena completa (motore) |
| **B** | **4 stili solo in carriera** (statistiche, crescita, obiettivi), motore intatto. | 2-3 giri | Alto come A (stessa migrazione) | `save-compat` + `career-sim-test` |
| **C** | **Prima la misura**: 12 partite per braccio sul motore di oggi, per sapere se l'archetipo pesa già; poi A o B. | 1 giro | Nullo | — (sonda) |

### 5.4 Raccomandazione

**C, poi A.** La voce del PO dice «stili che cambiano il gioco»: B non lo fa. Ma A tocca il motore, che è L1 e
ha regole proprie (`docs/REAL-MATCH-ENGINE.md`), e ha il rischio sui salvataggi più alto di tutta L6. Un giro di
misura prima evita di costruire su un'ipotesi. Lo farei **dopo** la chiusura di L1, per non toccare il motore
mentre L1 è aperto.

### 5.5 Domanda per il questionario

**PO-098 — Come arriviamo ai 4 stili?**
1. **Prima una misura (l'archetipo pesa già in partita?), poi 4 stili letti dal motore ed Enfant come tratto di crescita, dopo la chiusura di L1 (consigliata)**
2. Subito 4 stili letti dal motore, anche con L1 ancora aperto
3. 4 stili solo in carriera (statistiche, crescita, obiettivi), motore invariato
4. Tenere gli 8 archetipi e trasformare solo l'Enfant in tratto

E, se la risposta è 1 o 2: **quali sono i 4 stili?**
1. **Finalizzatore · Regista · Incursore · Trascinatore (consigliata, proposta di lavoro)**
2. Bomber · Fantasista · Velocista · Leader (i nomi di oggi)
3. Li propone il PO

---

## 6. Nota su PO-190 (goleade dell'eroe)

Non è fra le cinque voci della proposta, ma è L6 e la fase 1 la tocca. Il calo dei gol con l'età nelle carriere
(§0.1) **non riguarda** PO-190: lì il dato utile resta il salvataggio S12, 41,4% di quota su 20 partite simulate
(rapporto §5.2), campione piccolo; tiri e xG non sono misurabili sul percorso simulato (rapporto §5.3). Nessuna
proposta nuova: resta il collaudo sulle partite vere già deciso.

---

## 7. Ordine consigliato dei lavori L6

| # | Lavoro | Zona G | Costo (stima) | Perché qui |
|---|---|---|---|---|
| 0 | **Banco corretto (fase 1-bis)**: rinnovo accettato quando offerto (e conteggio delle carriere senza offerta); solo gli 8 archetipi veri, con le statistiche della creazione; archetipo/ruolo/club indipendenti; 10 carriere dalla creazione normale (U18); 5 carriere con la Nazionale giocata; gemelli economici per l'Ufficio; minuti e titolarità per stagione | **no** (solo test) | 2 giri | Tre numeri della fase 1 sono artefatti (§0): senza questo, PO-155/156/157 si tarano su dati sbagliati |
| 1 | **PO-155 A** — niente Nazionale da svincolato | sì (eccezione minima) | 1 giro | Difetto verificato sui dati, piccolo, con rosso e guardiano |
| 2 | **PO-154 A+B** — memoria, seguiti, contesto | sì | 3-4 giri | I suoi numeri reggono già; è ciò che il giocatore sente ogni settimana |
| 3 | **PO-157 A** — misura dell'Ufficio e del rinnovo, potatura, effetti mostrati | sì | 3 giri | Dipende dal passo 0; se il rinnovo è rotto, è il primo difetto da chiudere |
| 4 | **PO-155 C** — finestre e lista del CT | sì | 3-4 giri | Dopo la memoria degli impulsi (il CT può leggerla: «ha rifiutato la convocazione») |
| 5 | **PO-098 C → A** — misura, poi 4 stili | in parte (crescita); il resto è L1 | 1 + 5-7 giri | Dopo la chiusura di L1; rischio salvataggi più alto, bump `SAVE_VERSION` |
| 6 | **PO-156 A** — bersagli del PO e taratura | sì | 1 + 2-3 giri | Per ultima: si tara la carriera intera quando gli altri sistemi hanno smesso di cambiare |

Ogni passo dal 1 in poi richiede **un'eccezione del PO alla zona G**, come quelle già concesse (`DECISIONI.md:280`,
`:305`, `:372`): misura prima, correzione con interruttore rosso e guardiano, catena **carriera** completa
(`career-invariants`, `stab-nat-trigger-test`, `career-sim-test`, `tripath-chokepoint-test`, `save-compat`); il
passo 5 anche la catena **completa** perché tocca il motore.

### Domanda d'apertura per il questionario

**L6 — Da dove si comincia?**
1. **Dal banco corretto (2 giri, nessuna modifica al gioco), poi la Nazionale da svincolato, poi gli impulsi (consigliata)**
2. Subito dagli impulsi (i loro numeri reggono), il banco corretto in parallelo
3. Dal banco corretto e basta: il resto si decide coi numeri nuovi
4. Dalla Nazionale completa (finestre e CT)

---

## 8. Cosa questa proposta non dice

- Non dice che economia, Nazionale e difficoltà vanno bene: dice che i numeri della fase 1 non bastano a dirlo.
- Non dice che il rinnovo del contratto sia rotto nel gioco: dice che nel percorso misurato nessuna delle 30 carriere
  ha rinnovato, e che il banco chiudeva le schermate senza rispondere.
- Le stime di costo in giri sono mie e vanno rifatte dopo il passo 0.
