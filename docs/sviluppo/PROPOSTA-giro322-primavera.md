# PROPOSTA giro 322 — L'anno di Primavera meno limitante (PO-356)

**Giro 322 (coda) · solo proposta: nessuna modifica a `src/`, a `GAME_VERSION` o ai guardiani · base `lavoro/201` = 7.999.202 (`SAVE_VERSION` 9)**

> PO, 10/11: «L'anno della primavera è troppo limitante, non vorrei che i player si annoino alla prima stagione. Hai qualche idea?»

## 0. In breve

- **Questa domanda ha già un progetto approvato.** Il 10/11 il PO ha scelto «tutte e 4 le idee» (DECISIONI.md, 10/11 22:30)
  e il giro 153 le ha progettate in `docs/progetto/PRIMAVERA-153.md` (ramo `progetto/giro153-primavera`). Il 11/11 il PO ha
  risposto anche alle domande di dettaglio (D1-D14, DECISIONI.md 11/11 ~07:00 e 07:50).
- **Di quel progetto, nel codice di oggi c'è solo una parte:** l'Indice Primavera (F) e il tasto «Vai al prossimo momento
  importante» (3), entrati nella 191 col giro 163. Chiamate in prima squadra, salto a gennaio, obiettivi e tornei giovanili
  **non ci sono** (verificato con `grep` su `src/`, §1.5).
- **Consiglio:** realizzare per primo il **salto a gennaio per merito** (proposta B), perché è la leva più grande sulla noia
  (taglia a metà la Primavera per chi gioca bene) ed è quella che riusa più codice che esiste già e che il PO ha appena fatto
  riparare (PO-597, 7.999.200). Subito dopo l'**esordio in prima squadra come evento** (proposta A).

---

## 1. Com'è oggi l'anno di Primavera

### 1.1 Fonti e limiti di questo capitolo

In questo giro **non ho fatto misure nel browser** (limite settimanale in avviso). I numeri vengono da tre fonti, e ognuno
porta la sua:
- **[153]** = misure del giro 153 su 7.999.189 (sonda `primavera-misura-153.mjs`, partite **simulate**, riquadri chiusi senza
  scegliere, un campione per profilo OVR 58/66/74) — `docs/progetto/PRIMAVERA-153.md` §1;
- **[163]** = misure del giro 163 (guardiano `salta-163`) — `docs/sviluppo/RAPPORTO-giro163.md`;
- **[codice]** = letto oggi su 7.999.202, con file e riga.

Fra la 189 e la 202 il codice della Primavera è cambiato (giri 163, 165, 185, 194, 198, 199, 260…): **non posso confermare**
che i numeri di [153] valgano identici oggi. La struttura (giornate, settimane, soste) è verificata nel codice.

### 1.2 Struttura della stagione

| Grandezza | Valore | Fonte |
|---|---|---|
| Ingresso | 3 provini → offerte dalle Primavera → firma | richiesta PO-356 |
| Squadre per girone (Primavera 1 / Primavera 2) | 18 / 18 | [153] |
| Giornate di campionato | **34** | [153] |
| Settimane | **39** (1-38 + la 39 senza partita, poi la schermata di fine Primavera) | [153]; [codice] `src/18` r.4999 `if(isInU18&&weekVal>38)` |
| Settimane senza partita | 9 · 19 · 28 · 35 + la 39 | [153] |
| Altre competizioni | **nessuna**: niente Coppa, niente Nazionale, niente tornei per le nazionali | [153] |
| Riquadro della settimana | 38 settimane su 39 (30 impulsi con scelta, 7 eventi, 1 spogliatoio) | [153], profilo OVR 66 |
| Passaggio in prima squadra | **solo a fine stagione**: `ProTransitionScreen` (`src/16` r.26) con le offerte di `generateProContracts` (`src/06` r.769) | [codice] |
| Cancello del primo contratto | in pratica **OVR ≥ 64** (il `perf` con 34 presenze supera già la soglia 3,5) | [153] §1.5 |
| «Resta in Primavera» | possibile finché `u18Seasons < 2` | [153] §1.5 |

**Mercato a stagione in corso.** Esiste, ma come tiro di dado non seedato: `Math.random()<offerProb` con `offerProb`
0,12-0,52 nella finestra (`src/18` r.5289-5290, in `doAdvanceWeek`), mentre il secondo blocco (r.1592) esce subito per
chi non è professionista (r.1571 `if((player.proStatus||"u18")!=="pro")return;`). Non dipende dal rendimento in Primavera
e porta solo a club esterni [153 §1.4, codice riletto oggi]. Che il passaggio a metà stagione succeda davvero lo prova il
salvataggio del PO del 21/11 (PO-597: settimane 1-18 in Primavera, poi FC Augusta).

### 1.3 Quanto dura a giocarla

⚠️ **Stima derivata, non misurata sul telefono** [153 §1.3]: ≈ 3,1 min a partita a 1x (tick 1700 ms/minuto + highlight),
pre-partita e dopo-partita **non misurati**.

| Modo | Durata stimata della prima stagione |
|---|---|
| tutte le 34 dal vivo a 1x | ≈ 1 h 55 – 2 h (+ pre/dopo-partita) |
| tutte dal vivo a 2x | ≈ 1 h 15 |
| tutte simulate | ≈ 10-15 min (quasi tutto tempo dei riquadri) |
| col tasto «Vai al prossimo momento importante» | **29 tocchi** nell'ultimo giro misurato (10 corse, fermate: 6 partite chiave, 2 interviste, 1 mercato, 1 fine stagione) — obiettivo del progetto era ≤ 12, **non raggiunto** [163] |

Il gioco non registra quanti giocatori scelgano dal vivo o simulato: **non posso confermare** quale riga sia la più comune.

### 1.4 Il vero problema (lettura, non misura)

Le misure dicono che la stagione è **un binario solo**: 34 partite dello stesso tipo, nessuna competizione parallela, e un
traguardo (la prima squadra) che arriva comunque a fine anno e che dipende quasi solo dall'OVR, che cresce di circa +5 per
tutti i profili misurati [153 §1.5]. Giocare bene non cambia **quando** arrivi in prima squadra: è questo che rende l'anno
«limitante», più della sua lunghezza.

### 1.5 Cosa è già stato fatto (191 e dopo)

| Pezzo | Stato | Dove |
|---|---|---|
| **F — Indice Primavera** (barra «Corsa alla prima squadra», 5 tacche, dalla 6ª partita) | FATTO, 191 (giro 163) | `src/08` r.1056 `indicePrimavera`; card in `src/18` r.8295 |
| **3 — Avanti veloce** «Vai al prossimo momento importante» (solo Primavera; esteso ai professionisti nel giro 165) | FATTO, 191 | `src/18` r.8295-8360; `partitaChiave163` in `src/08` |
| 1 — Chiamate in prima squadra / esordio | **NON FATTO** (0 occorrenze di `prima_squadra`, `__CPM_NO_CONV153`) | — |
| 2 — Salto a gennaio per merito | **NON FATTO** (0 occorrenze di `__CPM_NO_SALTO153`; resta il tiro casuale di r.5289) | — |
| 4a — Obiettivi Primavera | **NON FATTO** (0 occorrenze di `__CPM_NO_OBJ153`) | — |
| 4b/4c — torneo europeo giovanile, Under 19 | **NON FATTO** (0 occorrenze di `youth_euro`, «Coppa Europea Giovani», `__CPM_NO_U19153`) | — |
| PO-386 niente schede vuote in Primavera · PO-422 la Primavera saluta · PO-424 valore di mercato credibile · PO-467 promesse delle offerte dei provini | tutte **DA FARE** (BACKLOG sul poc, destinazione 203) | BACKLOG.md |

Già deciso dal PO per il resto del progetto (non lo richiedo): chiamate di frequenza **media** (D1); nella settimana della
chiamata la Primavera **si simula senza l'eroe** (D2); presenze in prima squadra **contano nei totali da professionista**
(D3); salto a gennaio verso **club madre ed esterni** (D4); una presenza in prima squadra **sblocca il primo contratto da
OVR 62** (D13); chi esce a gennaio **non vince** i premi Primavera (D8); torneo «Coppa Europea Giovani» per le Primavera dei
club con prestigio ≥ 71 (D9/D10); convocazioni Under 19 anche dopo il salto, niente Europeo Under 19 (D11/D12); SAVE resta 9
(D14).

---

## 2. Quattro proposte

Le stime di lavoro sono in **giri** (un giro = una sessione di sviluppo con il suo guardiano e la catena completa, perché è
tutta area carriera). Sono stime, non misure: vengono dal §11 di PRIMAVERA-153 corrette con quello che è successo dopo
(PO-597 ha già sistemato i risultati delle giornate passate, che il progetto metteva nel lavoro del salto).

### Proposta A — L'esordio in prima squadra come evento (chiamate per merito)

**Cosa cambia per il giocatore.** Dalla settimana 8, se l'Indice Primavera è alto, il mister della prima squadra lo
convoca per la giornata di Lega di quella settimana: panchina, e spesso l'ingresso nel finale **giocato dal vivo**.
L'esordio diventa un capitolo del diario («🌟 Esordio in prima squadra»), il primo gol tra i grandi un secondo. Nella
settimana della chiamata la partita di Primavera si simula senza di lui (D2). È la seconda strada che mancava: lo stesso
anno, ma con un traguardo raggiungibile **dentro** la stagione.

**Cosa tocca nel codice.**
- `src/18` — un chokepoint unico chiamato dai tre percorsi settimana (`liveCurrentWeek` / `simulateAndAdvance` /
  `doAdvanceWeek`), come gli altri chokepoint coperti da `tripath-chokepoint`; il riquadro della chiamata; l'arresto
  dell'avanti veloce sulla chiamata.
- `src/15` — `LiveMatch` col subentro che esiste già (`benchStart`/`entryMinute`) e un `matchContext` di prima squadra.
- `src/09` — calendario della prima squadra dallo stesso seme di `legaDopoTrasferimento212`, così la giornata dell'esordio
  è la stessa che si ritrova se poi si sale a gennaio.
- `src/06` — `generateProContracts`: la presenza in prima squadra alza `perf` e sblocca il contratto da OVR 62 (D13).
- **Il lavoro più grosso:** censire i filtri «gara di lega» (`!h.cup&&!h.euro&&!h.national`, `!m.type`…), che sono decine,
  e decidere voce per voce dove la presenza in prima squadra conta [153 §10].

**Rischio salvataggi.** Basso se si segue il progetto: un blocco opzionale (`p.ps153`), assente = comportamento di oggi,
nessun bump (D14). Da verificare con `save-compat` l'apertura con una versione vecchia (voci di calendario con `type` nuovo).
**Rischio carriera/bilanciamento: alto.** Una voce di calendario in più per settimana tocca `career-invariants` e mezza
`career-critical` (`stale-matchday`, `playedmd-registry`, `double-tap`…). Bilanciamento: la frequenza «media» (D1) va tarata
con la sonda; i bersagli del progetto (OVR 74 ~85%, OVR 66 ~40%, OVR 58 ≤ 10% di prima chiamata entro la settimana 20)
sono **obiettivi, non misure**.

**Stima: 3-4 giri** (censimento dei filtri · chiamata ed esordio · effetti, conteggi e guardiano `prima-squadra`).

### Proposta B — Salto a gennaio per merito (promozione o prestito)

**Cosa cambia per il giocatore.** All'apertura della finestra invernale (settimana 19, seconda occasione alla 22 se nel
frattempo ha esordito) chi ha giocato bene riceve, in modo **deterministico e legato al rendimento**: la promozione nella
prima squadra del proprio club, oppure l'offerta di un club senior, oppure — variante nuova rispetto al 153 — un **prestito
di sei mesi** a un club di serie inferiore per giocare titolare. Chi accetta chiude la Primavera a metà e vive la seconda
metà da professionista; chi rifiuta resta e la corsa continua. Per chi gioca male non cambia nulla rispetto a oggi.

**Cosa tocca nel codice.**
- `src/18` r.5289-5290 — il tiro `Math.random()<offerProb` per la Primavera diventa un chokepoint seedato sui tre percorsi
  (oggi r.1571 esclude la Primavera da uno dei due blocchi: è l'asimmetria trovata dal 153).
- `src/18` `acceptTransfer` (già porta un giocatore di Primavera tra i professionisti a stagione in corso) + premi Primavera
  a fine stagione (r.4999-5020: chi è uscito non vince, D8).
- `src/09` r.1913 `legaDopoTrasferimento212` — già corretta in 7.999.200 (PO-597) con i risultati veri delle giornate
  passate: va solo letta, ed eventualmente estesa con la giornata dell'esordio se c'è anche A.
- `src/06` — numeri del primo contratto (`generateProContracts`) e, per la variante prestito, la macchina del prestito che
  esiste già per i professionisti (`p.loan`, non verificata qui sul ramo Primavera).

**Rischio salvataggi.** Basso: un campo opzionale (es. `ps153.salto`), nessun bump. Il cambio di club a stagione in corso
**succede già oggi** (salvataggio del PO, PO-597), quindi non è uno stato nuovo per i salvataggi.
**Rischio carriera/bilanciamento: medio-alto.** Il cambio di lega a metà stagione è il punto storicamente fragile (classe
STAB, `career-sim-test` andrebbe esteso con un profilo Primavera). Bilanciamento: chi sale a gennaio ha mezza stagione da
professionista in più → valore, popolarità e contratto crescono prima; la soglia va scelta dal PO (questionario D2). I
bersagli del progetto (OVR 74 ~45% di salto, OVR 66 ~10%, OVR 58 ~0%) sono **da tarare**, non misurati.

**Stima: 2-3 giri** (chokepoint seedato e uscite · interfaccia, premi, guardiano `salto-gennaio` · variante prestito se scelta).

### Proposta C — Primavera a capitoli (avanti veloce per blocchi)

**Cosa cambia per il giocatore.** La stagione si divide in **4 capitoli** (le soste delle settimane 9 · 19 · 28 · 35 sono
già i confini naturali). A inizio capitolo il giocatore sceglie **quali partite giocare dal vivo** (proposte: derby, scontri
al vertice, eventuale chiamata in prima squadra) e il resto passa da solo fino al **riepilogo di capitolo** (classifica,
Indice Primavera, giudizio del mister). Corregge il punto misurato debole del tasto attuale: 29 tocchi contro un obiettivo
di 12, perché ogni partita chiave costa 3 tocchi e interviste e mercato fermano la corsa [163].

**Cosa tocca nel codice.**
- `src/18` — la card «Corsa alla prima squadra» (r.8295-8360) e il ciclo del tasto (`_saltaAvvia163`, `_saltaPrev163`):
  scelta delle partite a inizio capitolo, riepilogo a fine capitolo, risposta automatica (seedata, come gli impulsi) per
  l'intervista settimanale se il PO lo vuole.
- `src/08` `partitaChiave163` — solo lettura, già pura.
- Nessun nuovo percorso settimana: il tasto gira già sui tre percorsi veri, `tripath-chokepoint` verde senza modifiche [163].

**Rischio salvataggi.** Molto basso: le partite scelte si possono tenere in un campo opzionale o ricalcolare; nessun bump.
**Rischio carriera/bilanciamento: medio-basso.** Il rischio è quello già coperto da `salta-163` e `double-tap`; non cambia
il bilanciamento (le partite simulate sono quelle di oggi). **Da solo non risolve la noia**: accorcia il tempo, non aggiunge
strade. Per questo lo consiglio come accompagnamento, non come risposta.

**Stima: 1-2 giri.**

### Proposta D — Una stagione con la posta in gioco: obiettivi, saluto e (poi) tornei giovanili

**Cosa cambia per il giocatore.** Sulla home 3 obiettivi di Primavera con premio visibile (capocannoniere, posto in
classifica, Indice Primavera), il saluto di fine Primavera già chiesto dal PO (PO-422: giudizio del mister, destino di
rivale, mentore e amico, foto di squadra) e niente schede vuote (PO-386). In un secondo tempo i due «secondi binari» già
decisi: Under 19 nelle soste e «Coppa Europea Giovani».

**Cosa tocca nel codice.**
- Obiettivi: `src/18` (home, fine stagione r.4999-5020, regola del capocannoniere oggi «≥ 8 gol e rapporto ≥ 0,55»).
- Saluto: `src/16` `ProTransitionScreen` (cerimonie chiuse il 20/10, riapertura decisa dal PO per PO-422).
- Under 19 / torneo: `src/18` (finestre Nazionale, oggi `!isInU18`), `src/09` calendario, nomi inventati con
  `audit-copyright` a 0.

**Rischio salvataggi.** Basso per obiettivi e saluto (sola lettura o campi opzionali). Alto per i tornei (nuovi tipi di
calendario, contatori separati dalla Nazionale senior, `stab-nat-trigger`).
**Bilanciamento.** Obiettivi e saluto: neutri. Tornei: più partite → più crescita e popolarità in Primavera, da tarare.

**Stima: 1-2 giri** per obiettivi + PO-386 + PO-422; **altri 4-5 giri** per Under 19 e torneo europeo [153 §11].

### Tabella di confronto

| | A Esordio | B Salto a gennaio | C Capitoli | D Obiettivi/tornei |
|---|---|---|---|---|
| Cosa risolve | una strada in più **dentro** l'anno | l'anno finisce prima **per merito** | il tempo e i tocchi | la posta in gioco |
| File | src/18, 15, 09, 06 | src/18, 09, 06 | src/18 (08 in lettura) | src/18, 16 (+09 per i tornei) |
| Rischio salvataggi | basso | basso | molto basso | basso / alto per i tornei |
| Rischio carriera | **alto** | medio-alto | medio-basso | basso / alto per i tornei |
| Stima | 3-4 giri | 2-3 giri | 1-2 giri | 1-2 (+4-5) giri |
| Già deciso dal PO | sì (D1, D2, D3, D13) | sì (D4, D8) | in parte (D5, D6) | in parte (D7, D9-D12, PO-422) |

---

## 3. Cosa consiglio e perché

**Ordine consigliato: B → A → C, con D (obiettivi + PO-386 + PO-422) quando c'è un giro libero; tornei giovanili per ultimi.**

1. **B per primo.** È l'unica proposta che fa dipendere **quando** arrivi in prima squadra da **come giochi**, che è il cuore
   del problema (§1.4). Costa meno di A perché riusa tre pezzi che esistono già e funzionano: `acceptTransfer` (secondo il 153 §6 porta già un
   giocatore di Primavera tra i professionisti a stagione in corso), `legaDopoTrasferimento212` (appena corretta con i
   risultati veri, PO-597) e l'Indice Primavera (la misura del merito). E toglie un `Math.random` non seedato dal mercato
   della Primavera, che è anche il motivo per cui i tocchi dell'avanti veloce variano fra un giro e l'altro [163].
2. **A subito dopo.** Dà l'evento più emozionante (l'esordio) ma è il lavoro più rischioso (il censimento dei filtri «lega»):
   farlo dopo B significa che il calendario della prima squadra e il passaggio a metà stagione sono già misurati e
   sorvegliati. A e B insieme fanno il percorso del progetto 153: barra che sale → chiamata → esordio → promozione a gennaio.
3. **C come rifinitura**, perché il tasto di oggi non arriva all'obiettivo dei 12 tocchi; ma da solo accorcia senza dare
   niente di nuovo.

Cosa **non** consiglio: accorciare il girone (meno squadre o giornate) — già scartato nel 153 §5 (cambia leghe, calendario
e la classifica a 18 che i guardiani danno per scontata, e la stagione resterebbe di 38 settimane).

---

## 4. Questionario per il PO

Per ogni domanda la prima opzione è quella che consiglio.

**D1 — Da quale proposta si parte?**
1. **B — Salto a gennaio per merito, poi A (consigliata)**
2. A — Esordio in prima squadra, poi B
3. C — Primavera a capitoli (solo tempo e tocchi)
4. D — Obiettivi, saluto e schede vuote (PO-386, PO-422)

**D2 — Quanto è facile saltare a gennaio?**
1. **Media: promozione con Indice Primavera alto e almeno un esordio; offerta esterna con Indice alto anche senza esordio
   (consigliata)**
2. Prudente: solo con Indice al massimo (5ª tacca) e almeno un esordio
3. Generosa: basta la 4ª tacca dell'Indice
4. Solo voci di mercato a gennaio, il salto vero resta a fine stagione

**D3 — Cosa si può offrire a gennaio?**
1. **Promozione nel club madre e offerte esterne, la promozione mostrata per prima (già deciso il 11/11, D4: lo confermo)**
2. Anche il prestito di sei mesi in una serie inferiore, da titolare
3. Solo la promozione nel club madre
4. Solo club esterni

**D4 — Il tiro di dado del mercato in Primavera (oggi casuale, non legato al rendimento) che fine fa?**
1. **Sostituito dalla regola del salto (seedata, legata all'Indice) (consigliata)**
2. Resta accanto alla nuova regola come «sorpresa» rara
3. Tolto del tutto in Primavera: a gennaio decide solo il merito

**D5 — Nell'avanti veloce, l'intervista settimanale (oggi ferma la corsa) come si comporta?**
1. **Risponde da sola con una risposta seedata, elencata nel riepilogo, come gli impulsi (consigliata)**
2. Continua a fermare la corsa
3. In Primavera l'intervista settimanale non c'è

**D6 — La Primavera a capitoli (proposta C) la vuoi?**
1. **Sì, dopo A e B, coi 4 capitoli tra le soste (consigliata)**
2. Sì, subito, prima di A e B
3. No: basta il tasto di oggi
4. Sì, ma anche per i professionisti

**D7 — In che rilasci?**
1. **B in un rilascio da solo, A nel successivo, C e D quando c'è spazio (consigliata)**
2. A e B insieme in un rilascio unico
3. Tutto dopo la pubblicazione sullo store
4. Solo B, il resto si rivaluta dopo aver giocato

**D8 — Chi sale a gennaio cosa porta con sé della Primavera?**
1. **Presenze e gol di Primavera contati a parte, nessun premio Primavera (come deciso in D8 e B11) e una riga nel diario
   «Promosso a gennaio» (consigliata)**
2. Come 1, ma se è capocannoniere al momento del salto riceve un riconoscimento a fine stagione
3. Come 1, senza riga nel diario

---

## 5. Cosa NON ho fatto in questo giro

- Nessuna misura nel browser: tutti i numeri sono di [153]/[163] o letti nel codice, con la fonte accanto.
- Non ho verificato il ramo prestito (`p.loan`) per un giocatore di Primavera, né il percorso dal vivo (`onMatchEnd`) del
  mercato invernale: entrambi sono da misurare nel primo giro di B.
- Nessuna modifica a `src/`, `GAME_VERSION`, guardiani, roadmap o backlog.
