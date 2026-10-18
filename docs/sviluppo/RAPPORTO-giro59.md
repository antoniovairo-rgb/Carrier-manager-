# Rapporto analisi — giro 59 · PO-281 «Acquisti ed investimenti più concreti ed impattanti»

- **Ramo:** `analisi/acquisti-281-giro59`, partito da `lavoro/172` (`46cdcdc`).
- **Natura del lavoro:** SOLA LETTURA E MISURA. Zona G ferma per decisione del PO: **nessuna riga di `src/` né di `CARRIER-MANAGER-AV.html` è stata toccata** (`node tools/check-src.mjs`: identico byte per byte al file in git).
- **Legato a:** PO-157 («dare un effetto reale e visibile a ciò che resta, oppure togliere o accorpare»), PO-223 (giro 33) e PO-265 (giro 37), che hanno corretto gli importi degli investimenti d'impulso.
- **Sonde scritte (nuove, non guardiani):** `tests/visual/sonde-281/patrimonio-281.mjs` (carriera simulata a bracci) e `tests/visual/sonde-281/vita-bank-281.mjs` (raggiungibilità di due eventi di vita). Esito grezzo salvato in `tests/visual/sonde-281/patrimonio-281.esito.txt`.
- Le righe citate sono del sorgente su questo ramo.

---

## 1. Sintesi in cinque righe

1. Esistono **quattro famiglie** di spesa: staff privato a livelli (F1), accademia (F2), investimento di stagione (F3, più i tre investimenti d'impulso PO-223), beni e stile di vita (F4); più **20 spese d'impulso** nei bivi settimanali e **2 eventi di vita** con un costo.
2. **Sulla partita non arriva quasi niente.** In due stagioni simulate il voto medio è **5,98 – 6,01 in tutti i bracci** (base 5,98). L'unico effetto misurabile sul giocatore è il **personal trainer**: +5,3 punti di attributi totali e +0,7 OVR in due stagioni, al costo di ~152.000€.
3. **Fisioterapista e mental coach non fanno nulla di misurabile** su questa carriera: il fisioterapista riduce una probabilità di infortunio che nel braccio base vale già **0 infortuni in 2 stagioni**; il mental coach alza un morale che il base tiene già a **95,3 di media** (16 settimane su 79 al tetto). Il braccio fisio3 è **identico al base in ogni numero** tranne il conto.
4. **Nel mondo si vedono solo testo e due numeri** (popolarità, fiducia del mister): una riga di diario/notifica all'acquisto, la riga dell'accademia a fine stagione, il riquadro «eredità» a fine carriera. Stampa, tifosi, compagni e cronaca **non leggono** mai beni, staff o accademia (grep: `beni24`, `academy24`, `perkFisio`, `perkMental` compaiono solo in `src/08` e nell'ufficio/eredità di `src/17`-`src/18`).
5. **Difetto trovato (non corretto, zona G):** gli eventi «L'auto dei sogni» e «La prima casa» (`src/03-eventi-narrativi.jsx:899-900`) **non possono mai uscire** — leggono e scrivono `p.bank`, mentre il conto è `bankBalance`. Misurato: con 5 milioni sul conto la condizione è **falsa**; è vera solo inventando il campo `bank`.

---

## 2. Inventario (tabella)

Legenda effetti: **S** statistiche · **Fo** forma · **Fa** fatica · **I** infortuni · **M** morale · **P** popolarità · **T** fiducia del mister · **C** conto · **Ch** chimica di squadra · **Pa** partita · **Tx** solo testo · **E** eredità di fine carriera.

### 2.1 Patrimonio F1–F4 (tab **Ufficio**, fisarmoniche «Patrimonio» / «Staff privato» / «Acquisti e investimenti», `src/18-career-app.jsx:10646-10748`)

| Voce | Costo (codice) | Effetti nel codice (file:riga) |
|---|---|---|
| 🏋️ **Personal trainer** lv 1/2/3 | `max(700, 5% stipendio)` ×1 / ×1,8 / ×2,8 **a settimana** (`src/08:43,47-49`) | **S**: moltiplicatore crescita allenamento ×1,10/1,15/1,20 (`src/18:1733`). **C**: costo settimanale (`src/18:1588-1590`). A fondi finiti si spegne da solo con avviso (`src/18:1591`, `:4790`). |
| 🥗 **Nutrizionista** lv 1/2/3 | `max(500, 4%)` ×1/1,8/2,8 a sett. (`src/08:44`) | **Fa**: recupero settimanale 6+2/3/4 (`src/18:4760`, anche settimana senza gara su «Simula» `:3204`). Relazione col preparatore +1 a settimana se acceso (`src/18:3165`). La fatica entra nella **decisione del mister** (peso 0,20, `src/08:187-198`) e, sopra 65, nel tasso di riuscita dal vivo (`src/15-live-match.jsx:9021`). |
| 🩺 **Fisioterapista** lv 1/2/3 | `max(500, 3%)` ×1/1,8/2,8 (`src/08:45`) | **I**: probabilità d'infortunio ×(1−0,08·lv) sia in partita simulata (`src/18:1692`) sia dal vivo (`src/18:3745`). Nient'altro. |
| 🧠 **Mental coach** lv 1/2/3 | `max(400, 3%)` ×1/1,8/2,8 (`src/08:46`) | **M**: +0,5·lv a settimana (`src/18:1750`). Il morale entra nel tasso di riuscita **dal vivo** (max ±2,5 punti percentuali, `src/15:9031`). Nient'altro. |
| 🏫 **Accademia col tuo nome** | fondazione `max(150.000€, 8 stipendi)` una tantum + `max(400, 2%)` a settimana (`src/08:55`); pausa possibile (`src/18:10700`) | A fine stagione esce un ragazzo deterministico (`src/08:57-60`): **P** +2 (+4 se voto ≥70) e riga di diario (`src/08:61-64`). **E**: 3 punti per ragazzo, max 30 (`src/08:89`). Nessun ragazzo diventa un giocatore del mondo (non entra in rose, cronaca o mercato: grep di `academy24` solo in `src/08`, `src/17:1123-1131`, `src/18`). |
| 💼 **Investimento di stagione** (F3) | un quarto del saldo, arrotondato a 10.000€, minimo 10.000€ (`src/18:10745`) | **C**: a fine stagione capitale + resa deterministica (nome+stagione+profilo, `src/08:69-75`): prudente +2…+5%, bilanciato −4…+10%, rischioso −20…+30%. Ritiro anticipato −1% (`src/18:10733`). **Tx**: riga di diario. Conta nel patrimonio netto per l'eredità (`src/08:87`). |
| 🏡 **Casa in città** | 250.000€ una tantum (`src/08:82`) | all'acquisto **P** +1, **T** +2, testo tifosi/mister (`src/18:10717-10718`); **M** +0,5 a settimana (`src/08:86`, `src/18:1750`). |
| 🏎️ **Auto sportiva** | 150.000€ | all'acquisto **P** +3, **T** −2, testo. Nient'altro. |
| ⛵ **Barca** | 700.000€ | all'acquisto **P** +4, **T** −3, testo; **M** +0,5 a settimana. |
| 🤝 **Fondazione benefica** | 300.000€ | all'acquisto **P** +6, **T** +2, testo; **E** +10 (`src/08:89`). |
| (tutti i beni) | — | **E**: metà del valore entra nel patrimonio netto (`src/08:87`), che vale +6/+12/+20 punti d'eredità sopra 1/5/20 milioni (`src/08:90`). Peso massimo del patrimonio sull'eredità: +60 (`src/17:924`). |
| 💼 **Procuratore** (contesto, non patrimonio) | 10% dello stipendio a settimana, 8% se «boutique» (`src/18:1586`) | fuori ambito di questa analisi: è un servizio di mercato, non un acquisto. |

### 2.2 Investimenti d'impulso (pop-up settimanale; registro `investimenti223`, `src/18:125-150`, `:4001`, `:5395`)

| Scelta | Costo | Effetti |
|---|---|---|
| 📈 «Investo metà del conto» (`wi_investimento`, `src/03:392-393`) | metà del saldo, min. puntata 5.000€ (PO-265) | **M** +3 subito; **C** a fine stagione ×1,04…1,12 (sempre in attivo). |
| 🍽 «Investo e ci metto la faccia» (`wi_ristorante_socio`, `src/03:774-775`) | 28.000€ | **P** +6 subito; **C** 65%: ×1,10…1,45 · 35%: ×0,55…0,90. |
| 🚀 «Ci punto una fetta» (`wi_cripto`, `src/03:714-715`) | 20.000€ | **M** +2 subito; **C** 50%: ×2…3 · 50%: perso tutto. |

### 2.3 Spese d'impulso one-shot (bivi settimanali, `src/03-eventi-narrativi.jsx`; applicate da `handleImpulseChoice`, `src/18:4000-4003`)

Tutte **una tantum**, nessun seguito: tolgono la cifra e spostano subito morale/popolarità/forma/fatica/chimica.

| Evento (riga) | Scelta | Costo | Effetto immediato |
|---|---|---|---|
| `wi_asta_maglia` (:340) | scarpini autografati | 5.000€ | P +9, M +5 |
| `wi_ospedale` (:373) | dono in silenzio | 10.000€ | M +4 |
| `wi_beneficenza` (:397) | «Lo pago io» | 25.000€ | P +12, M +8 |
| `wi_personal_chef` (:413) | «Lo assumo» | 15.000€ | Fa −10, Fo +3 (una volta: **non** è il nutrizionista dello staff) |
| `wi_es_bar` (:445) | caffè per tutti | 1.500€ | P +5, M +3 |
| `wi_es_muretto` (:453) | pallone nuovo | 1.000€ | P +5, M +4 |
| `wi_pro_store` (:468) | due maglie | 3.000€ | M +7 |
| `wi_pro_regola` (:472) | cornetti | 500€ | Ch +7, M +3 |
| `wi_orologio` (:508) | orologio | 30.000€ | Ch +7, M +4 |
| `wi_scuola_calcio` (:684) | «Ci metto faccia e soldi» | 30.000€ | P +9, M +6 (**non** crea l'Accademia F2) |
| `wi_genitori_tribuna` (:696) | tribuna d'onore | 6.000€ | M +9 |
| `wi_bimbo_sogno` (:720) | maglia e video | 2.000€ | M +4 |
| `wi_orologi_squadra` (:727 / :728) | orologi / cena | 22.000€ / 4.000€ | Ch +10, M +3 / Ch +4 |
| `wi_casa_citta` (:739) | «Compro — è casa mia» | 45.000€ | M +6, P +4 (**non** aggiunge la Casa dei beni F4, che costa 250.000€) |
| `wi_compagno_prestito` (:755) | aiuto il compagno | 15.000€ | Ch +9, M +4 |
| `wi_massaggiatore_addio` (:791) | festa d'addio | 8.000€ | Ch +8, M +5 |

La chimica (`teamChemistry`) ha un solo consumatore passivo: ±2 su forma/morale a settimana (`src/18:4801-4802`).

### 2.4 Eventi di vita con costo (`VITA_EVENTS`, `src/03:899-900`) — **irraggiungibili**

| Evento | Cond | Effetto dichiarato | Stato misurato |
|---|---|---|---|
| 🚗 `vita_auto` «L'auto dei sogni» | `(p.bank||0)>=80000` | bank −45.000, M +10 | **mai** — cond falsa con 5M in `bankBalance` |
| 🏠 `vita_casa` «La prima casa» | `(p.bank||0)>=250000` | bank −180.000, M +12 | **mai** — idem |

Anche l'applicazione scrive su `bank` (`src/18:4101`, `:4659`: `bank:Math.max(0,(p.bank||0)+(ef.bank||0))`) e `chem` invece di `bankBalance`/`teamChemistry`: se l'evento uscisse, il conto non si muoverebbe.

---

## 3. Misura — due stagioni, con e senza, stesso seme

**Metodo** (`sonde-281/patrimonio-281.mjs`): carriera pro S2 W1 (FC Werkstadt, prestigio 74, OVR 70, stipendio 6.000€, **5.000.000€ sul conto** perché nessun braccio vada in sospensione a fondi finiti). `Math.random` sostituito prima del caricamento da un generatore seedato (3 semi); due stagioni intere con gli handler veri `__CPM_CAREER.step()` / `startNewSeason()` (la nazionale si simula con `__CPM_SIM_NAT`). Un braccio per voce, attivato dal salvataggio iniziale. Numeri = **media sui 3 semi**; morale/fatica/forma = media per settimana; voto = media delle partite registrate (~70 per braccio).

| Braccio | Morale | Settimane al tetto (≥99) | Fatica | Forma | Infortuni | OVR fin. | Σ attributi | Popolarità | Fiducia mister | Voto | Costo sul conto vs base |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **base** | 95,3 | 16,3 | 40,9 | 70,6 | 0 | 77,0 | 590,7 | 55,3 | 43,5 | 5,98 | — |
| trainer lv3 | 95,4 | 17,7 | 41,6 | 71,2 | 0,33 | **77,7** | **596,0** | 53,7 | 47,9 | 5,99 | −151.600€ |
| nutrizionista lv3 | 94,9 | 14,3 | **40,1** | 72,3 | 0 | 76,3 | 588,0 | 63,7 | 49,7 | 5,99 | −105.600€ |
| fisioterapista lv3 | 95,3 | 16,3 | 40,9 | 70,6 | 0 | 77,0 | 590,7 | 55,3 | 43,5 | 5,98 | −108.300€ |
| mental coach lv3 | **97,4** | **49,3** | 40,9 | 70,6 | 0 | 77,0 | 590,7 | 55,3 | 43,5 | 5,98 | −86.600€ |
| tutto lo staff lv1 | 96,8 | 32,0 | **36,2** | 71,4 | 1 | 77,7 | 596,0 | 41,3 | 48,9 | 6,01 | −161.300€ |
| accademia (già fondata) | 95,2 | 17,3 | 41,3 | 70,8 | 0,33 | 77,3 | 591,0 | **62,3** | 44,3 | 6,00 | −30.900€ (+ fondazione 150.000€ non contata) |
| quattro beni | 96,4 | 23,0 | 40,9 | 70,5 | 0 | 77,0 | 590,7 | **65,7** | 42,1 | 5,98 | 0 (acquisto 1.400.000€ non contato) |
| base, morale iniziale 40 | 92,8 | 16,0 | 41,0 | 70,6 | 0 | 76,7 | 590,3 | 54,0 | 43,5 | 5,99 | — |
| mental lv3, morale iniziale 40 | 95,1 | 48,7 | 40,9 | 70,6 | 0 | 77,0 | 590,7 | 55,3 | 43,5 | 5,98 | −86.600€ |

**Come leggere i numeri (onestà sul rumore):** i bracci che **non cambiano la sequenza degli estratti casuali** (fisio, mental, beni) sono confrontabili esattamente col base, seme per seme: lì ogni differenza è l'effetto vero. I bracci che cambiano un valore usato da altri sorteggi (trainer, nutrizionista, staff1, accademia) **divergono** dal base dopo qualche settimana: le differenze di popolarità (±10) e fiducia (±6) in quei bracci sono **dentro il rumore di divergenza** e non le attribuisco all'acquisto. Con 3 semi non posso separarle meglio.

**Per voce:**

| Voce | Effetto reale misurato | Verdetto |
|---|---|---|
| Personal trainer | +5,3 attributi, +0,7 OVR in 2 stagioni (coerente col ×1,20 su una crescita di ~+20 punti) | **misurabile ma piccolo**; nessun effetto sul voto |
| Nutrizionista | fatica media −0,9 (lv3); con tutto lo staff lv1 −4,8 | **misurabile, invisibile**: la fatica media (~41) resta sotto le soglie che pesano (65 dal vivo, 78-80 nella decisione del mister) |
| Fisioterapista | **nessuno**: braccio identico al base (0 infortuni in 6 stagioni-braccio) | **non fa nulla di misurabile** in carriera normale; agisce solo su una probabilità che già vale quasi zero |
| Mental coach | morale +2,0 di media; settimane al tetto da 16 a 49; partendo da 40 il base risale comunque a 92,8 | **non fa nulla di misurabile sul campo**: il morale è già al tetto e la partita simulata non lo legge (voto identico al centesimo) |
| Accademia | 2 ragazzi in 2 stagioni, popolarità +7 (attesa da codice +4…+8) | **solo numero e testo**: i ragazzi non esistono nel mondo |
| Casa/auto/barca/fondazione | popolarità +10 (di cui +14 all'acquisto, poi riassorbita), fiducia −1,4, morale +1 | **solo testo e due numeri** una volta; casa e barca aggiungono morale che è già al tetto |
| Investimento di stagione (F3) | resa su 12 nomi (stagione 2): prudente **+3,1…+5,0%**; bilanciato **−3,9…+9,6%**; rischioso **−19,7…+29,9%** | **solo conto**; il rischio c'è ma è deciso dal nome, non da scelte o eventi |
| Investimenti d'impulso | misurati nei giri 33/37 (`investimento-223`, `meta-conto-265`) | **solo conto** + morale/popolarità una tantum |
| Spese d'impulso one-shot | effetto immediato da codice, nessun seguito | **solo numeri una tantum + testo** |
| `vita_auto` / `vita_casa` | **irraggiungibili** (`vita-bank-281.mjs`) | **difetto** |

**Il denominatore comune:** il conto. Il braccio base, senza spendere nulla, **chiude due stagioni con +417.600€** (5.000.000 → 5.417.600); lo staff completo al massimo costa ~450.000€ in due stagioni. Il giocatore accumula più di quanto il patrimonio gli faccia comprare di utile — e quello che compra non cambia la partita.

---

## 4. Proposte (per voce: 2-3 opzioni, la consigliata in **grassetto**; stime in giornate-sessione di lavoro, ciascuna col suo guardiano e la prova del rosso)

> Decide la sessione principale col PO. Le stime includono sonda/guardiano; sono **mie stime**, non misure.

### 4.1 Staff privato

| Voce | Opzione A — effetto in campo | Opzione B — rischio/scelta | Opzione C — togliere/accorpare |
|---|---|---|---|
| Personal trainer | **A. La crescita va nell'attributo che il giocatore sceglie («piano del trainer»), e la mostra la scheda post-allenamento con la quota del trainer. ~1 giornata** | B. Lv3 aumenta anche il rischio di sovraccarico (fatica +2 a seduta): spingere costa. ~0,5 g | C. Lasciare com'è (unico con effetto misurabile) |
| Nutrizionista | A. **Accorpare con il fisioterapista in un «Preparatore atletico»** che sposta *entrambe* le soglie che pesano: fatica dal vivo (65) e decisione del mister (78). ~1 g | B. Nutrizionista legato alle gare ravvicinate (coppa/europa nella stessa settimana): recupero extra solo lì, e lo dice. ~1 g | C. Togliere e lasciare il chef dell'impulso |
| Fisioterapista | A. **Accorpare nel «Preparatore atletico»** (sopra) e dargli il **rientro più rapido** (settimane d'infortunio −1/−2) — l'infortunio quando c'è è l'unico momento in cui il giocatore lo sente. ~1 g (insieme ad A del nutrizionista) | B. Effetto sul malus di rientro (`returnPenaltyWeeks`) invece che sulla probabilità. ~0,5 g | C. Togliere: misurato nullo |
| Mental coach | A. Spostarlo sulle **partite pesanti**: in derby/finali/rigori annulla il malus di pressione (un bonus visibile nell'HL con «🧠» nel testo dell'esito). ~1,5 g | B. **Togliere il bonus al morale (già al tetto) e dargli la riduzione delle conseguenze negative dei bivi «tensione» (stampa, polemiche): scelta vera tra spendere e subire. ~1 g** | C. Togliere: misurato nullo |

Nota trasversale (da misura): **il morale medio è 95 senza alcun aiuto** — qualunque acquisto che dia «+morale» resterà invisibile finché il morale non torna una risorsa scarsa. Questo è fuori dalla zona patrimonio e va deciso a parte.

### 4.2 Accademia

| Opzione | Contenuto | Stima |
|---|---|---|
| **A. I ragazzi esistono** | il ragazzo uscito con voto ≥70 diventa un nome nel mondo: compare nella rosa di un club della lega (o nella tua, U18), la cronaca lo può citare, la stampa scrive «cresciuto nell'Accademia X». | **~2 giornate** |
| B. Rischio | qualità dei ragazzi legata a quanto investi (gestione base / potenziata), con una stagione «vuota» possibile. | ~1 g |
| C. Accorpare | fondere con la Fondazione benefica (stesso effetto: popolarità + eredità). | ~0,5 g |

### 4.3 Investimenti (F3 + impulso)

| Opzione | Contenuto | Stima |
|---|---|---|
| **A. Un solo sistema** | accorpare F3 e i tre impulsi PO-223: gli impulsi diventano **proposte** che aprono un investimento F3 col loro profilo; un solo registro, una sola chiusura a fine stagione, una sola riga di diario. | **~1,5 giornate** |
| B. Rischio leggibile | l'esito non dipende solo dal nome: il ristorante rende di più se la tua popolarità sale, la cripto ha una notizia a metà stagione che permette di ritirarsi (scelta vera). | ~1,5 g |
| C. Visibilità | la chiusura dell'investimento diventa una notizia/stampa («il ristorante del n.10 fa il pieno» / «cripto: il crollo»), coi tifosi che reagiscono. | ~1 g |

### 4.4 Beni e stile di vita

| Opzione | Contenuto | Stima |
|---|---|---|
| **A. Reazioni nel tempo, non una volta** | i beni vistosi rendono più probabili i bivi di «tensione» (stampa, paparazzi) dopo una sconfitta, e i sobri attutiscono i fischi dopo una brutta partita: una **scelta di stile** con conseguenze ricorrenti. | **~2 giornate** |
| B. Effetto concreto | casa in città: −fatica nelle settimane di casa; auto sportiva: piccolo rischio di multa/ritardo all'allenamento (−fiducia). | ~1 g |
| C. Accorpare | eliminare il doppione con `wi_casa_citta` (45.000€) e farlo diventare l'occasione di comprare la Casa F4. | ~0,5 g |

### 4.5 Spese d'impulso one-shot

| Opzione | Contenuto | Stima |
|---|---|---|
| **A. Ricordare** | le spese «di squadra» (orologi, cena, cornetti, festa) lasciano una memoria che i compagni citano più avanti (canale `worldMemory` già esistente per gli eventi di vita). | **~1 giornata** |
| B. Lasciare | sono piccole e coerenti col loro tono. | 0 |

### 4.6 Difetto `vita_auto` / `vita_casa`

| Opzione | Contenuto | Stima |
|---|---|---|
| **A. Correggere** | cond e applicazione su `bankBalance`/`teamChemistry`, e collegare l'auto/la casa ai beni F4 (comprarle dall'evento le rende «tue» nell'Ufficio). Serve eccezione PO alla zona G. | **~0,5 giornate** |
| B. Togliere i due eventi | | ~0,1 g |

---

## 5. Non verificato

- **Effetto sulla partita DAL VIVO.** La misura usa la partita simulata (`step()`); il morale e la fatica entrano nel tasso di riuscita solo dal vivo (`src/15:9021,9031`). Dal codice: il mental coach può valere al massimo +2,5 punti percentuali su un'azione, ma col morale già a 95 il margine reale è ≤0,3 punti. **Non posso confermarlo** con una misura: non ho giocato partite dal vivo a bracci.
- **Popolarità e fiducia nei bracci divergenti** (trainer, nutrizionista, staff1, accademia): le differenze rispetto al base sono dentro il rumore di divergenza con 3 semi. Non le attribuisco agli acquisti.
- **Fisioterapista su una carriera a fatica alta** (molte gare ravvicinate, Europa): la misura copre solo una carriera di lega con fatica media 41. Su una carriera a fatica >68 il fisioterapista riduce davvero gli infortuni del 24% relativo (lv3); quanto valga in assoluto **non è misurato**.
- **Effetto della popolarità sugli sponsor e della fiducia sulla titolarità** a valle degli acquisti: esistono le letture (`src/06:100`, `src/08:187-215`), ma non ho misurato quanti euro o quante presenze in più valgano i +14 di popolarità dei beni.
- **U18:** tutto il patrimonio è dietro `proStatus!=="u18"` (`src/18:10645`); non misurato.
- Le **stime di lavoro** al §4 sono mie, non misure.

---

## 6. Come rifare la misura

```bash
cd tests/visual && npm install
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  CPM_SEEDS=3 CPM_PAR=3 node sonde-281/patrimonio-281.mjs        # ~8 min, scrive out/patrimonio-281.json
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node sonde-281/vita-bank-281.mjs                                # ~30 s
```
⚠️ Con `CPM_PAR=5` il caricamento parallelo della pagina da 7 MB è andato in timeout (prima corsa persa): 3 è il valore provato.
