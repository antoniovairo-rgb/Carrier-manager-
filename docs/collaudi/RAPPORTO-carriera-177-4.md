# RAPPORTO — Collaudo carriera n.4 «centrocampista» (giocata da attaccante) · CPM 7.999.177

Ramo `collaudo/7.999.177-carriera-4` · telefono 412×915 (touch, mobile) · GLB spento · Chromium headless.
Dati grezzi: `docs/collaudi/dati-carriera-177-4/` · foto: `docs/collaudi/foto-carriera-177-4/` (42 immagini).

## 1. Riassunto

| | |
|---|---|
| Giocatore | **Luca Brandi**, Spagna, **ATTACCANTE** (il ruolo è fisso: vedi §2) |
| Carriera | **16 stagioni complete** (S1 Primavera → S16) + ritiro all'inizio della S17, a **33 anni** |
| Club | Cesenate Primavera (S1) · Cesenate Lega B (S2–S5; S6 a metà stagione in prestito al Rennese, Ligue Nationale) · Brenvar Lega A (S7–S8) · Istanbul (S9) · Manchester Rovers (S10–S12) · Valdenau (S13–S15) · Lisboa in prestito (S16, da W12) |
| Presenze · gol · assist | **602 · 319 · 119** (coincide con la schermata «Fine carriera») |
| Nazionale | 33 presenze · 30 gol (primo esordio **S8 W28**, a 24 anni) |
| Trofei (6) | Coppa Nazionale S9 (Istanbul) · Premier Division S10 · Coppa Nazionale S13 (Valdenau) · Korward Champions Cup S15 e Deutsche Liga S15 (Valdenau) · Korward Champions Cup S16 (Lisboa, prestito) |
| Premi | Giovane dell'Anno S3, S4, S7 · Squadra dell'anno S7, S8, S11, S12, S14, S15 · Capocannoniere S12 · MVP della stagione S15 |
| OVR | 62 (S1 W1) → **massimo 90** (S13 W36, S14) → 89 al ritiro |
| Legacy | «Leggenda Assoluta» 1000/1000 · patrimonio 99,8 M€ · Accademia Brandi: 12 ragazzi usciti |
| Età al ritiro | **33** (il gioco offre il ritiro volontario dai 32 anni; non esiste un ritiro forzato che abbia visto) |

Per stagione (dalla storia del salvataggio):

| S | Età | Club · lega | Pres. | Gol | Ass. | OVR |
|---|---|---|---|---|---|---|
| 1 | 17 | Cesenate Primavera · Primavera 2 | 34 | 1 | 4 | 64 |
| 2 | 18 | Cesenate · Lega B | 35 | 4 | 4 | 68 |
| 3 | 19 | Cesenate · Lega B | 35 | 6 | 4 | 70 |
| 4 | 20 | Cesenate · Lega B | 35 | 8 | 6 | 73 |
| 5 | 21 | Cesenate · Lega B | **0** | 0 | 0 | 77 |
| 6 | 22 | Cesenate→Rennese (prestito) · Ligue Nationale | 39 | 19 | 5 | 80 |
| 7 | 23 | Brenvar · Lega A | 38 | 17 | 9 | 82 |
| 8 | 24 | Brenvar · Lega A | 42 | 25 | 9 | 84 |
| 9 | 25 | Istanbul · Liga Anatolica | 45 | 24 | 15 | 86 |
| 10 | 26 | Manchester Rovers · Premier Division | 45 | 34 | 10 | 87 |
| 11 | 27 | Manchester Rovers | 44 | 30 | 11 | 88 |
| 12 | 28 | Manchester Rovers | 42 | 32 | 7 | 89 |
| 13 | 29 | Manchester R.→Valdenau · Deutsche Liga | 39 | 22 | 6 | 90 |
| 14 | 30 | Valdenau | 42 | 31 | 5 | 90 |
| 15 | 31 | Valdenau | 40 | 33 | 7 | 89 |
| 16 | 32 | Valdenau→Lisboa (prestito) · Liga Lusitana | 47 | 33 | 17 | 89 |

Somme di controllo: gol 319, assist 119, presenze 602 → i totali della carriera tornano con la somma delle stagioni.

## 2. Come è stata giocata (e i limiti — da leggere)

- **Ruolo.** Il ruolo dell'avatar è fisso (attaccante, scelto alla creazione); non esiste un modo di giocare da centrocampista. Ho quindi giocato da «regista»: nelle scene ho scelto sempre il passaggio quando c'era (Servi X libero / Uno-due / Filtrante / Lancio smarcante / Sponda / Cross) e ho registrato anche le scene difensive. Il gioco **permette** passaggi e scene difensive da attaccante (il ruolo cambia solo i tipi di scena proposti: tiro, colpo di testa, punizione, ripiegamento, recupero), ma non cambia la posizione né le statistiche di ruolo.
- **Partite dal vivo.** 245 partite uniche registrate in `partite-live.jsonl` (provini, carriera, Nazionale/Europeo/Mondiale, coppe; di queste 141 col dettaglio degli highlight nel formato nuovo, 47 nel formato vecchio S1–S6, 57 senza dettaglio — comprese le 23 della sessione assist), e queste 23 partite giocate **apposta per gli assist** dalla S17 W1 (`assist-probe2.jsonl`: scelta del passaggio manuale, esito letto a schermo). Le altre settimane sono state simulate («Simula e avanza»). Alla fine di ogni stagione: salvataggio + ricarica pagina + confronto stato (`reload.jsonl`), poi cerimonia/fine stagione.
- **Impulsi, interviste, offerte, Ufficio, Agente.** Impulsi e interviste sono stati risolti ruotando le risposte (diplomatico/ambizioso/umile/no comment) per tutte le 16 stagioni; le offerte e i prestiti sono stati accettati a rotazione (da qui i cambi di club frequenti: sono scelte del collaudatore, non difetti). Ufficio e Agente visitati a S3, S6, S13 (foto) e a S17; rinnovi negoziati a S3, S6, S13.
- **Ritiro.** Ho ritirato Luca Brandi a S17 W1 (carta «Fine di un'era» → «Ritirati con onore» → lettera d'addio → fine carriera). Dopo, **dallo stesso salvataggio pre-ritiro (S17 W1)** ho giocato altre 23 partite solo per misurare gli assist: non contano nei totali di carriera qui sopra (che sono quelli del salvataggio ritirato, `salvataggio-ritirato.json`).
- **Strumento.** L'esito di una scena si legge dal bus eventi `__CPM_TIMELINE` (`ActionResolved`: label, ok, key). ⚠️ Una prima versione della sonda (`assist-probe.jsonl`, S16 W1–W15) leggeva l'ultimo evento a 900 ms e, in alcuni casi, prendeva quello della scena precedente: **quel file non è affidabile per la colonna «esito»** (le conclusioni sugli assist usano solo `assist-probe2.jsonl` e le righe con tl del partite-live, controllando che l'etichetta dell'evento coincida con la scelta). Il file `partite-live.jsonl` contiene due formati (S1–S6 «pick/esito», S7+ «tl»); i conteggi seguenti usano solo il secondo.
- Il gioco mostra l'ordine delle squadre nell'intestazione 3D invertito dopo l'intervallo (es. «FC Ruhrpott 1–0 FC Valdenau» a 42' → «FC Valdenau 0–1 FC Ruhrpott» a 53', stesso risultato): è coerente con il cambio campo, lo annoto solo come osservazione, non come difetto.

## 3. ASSIST — conteggi e prove

### 3.1 Quanti passaggi riescono

**Campione A — scelte casuali (autoplay seedato), S7–S16, 141 partite col dettaglio degli highlight.** Scene `hlType=pass` con evento a bordo: 181. Esito: **154 intercettati (85%)**, 22 assist (12%), 5 «chance» (3%). Togliendo le scene che il motore etichetta «pass» ma che non sono passaggi («Finta e cambio di passo» 37 scene → 32 intercettate, 4 assist; «Proteggi palla e scarica» 11 scene → **11 intercettate su 11**, vedi D3) restano 133 passaggi veri: **111 intercettati (83%), 18 assist (14%), 4 chance (3%)**. Per tipo: Uno-due 51 → 5 assist · Servi X libero 30 → 4 · Filtrante 28 → 4 (+3 chance) · Lancio smarcante 20 → 4 · Sponda 4 → 1.

**Campione B — passaggio scelto di proposito, S17 W1–W23 (23 partite dal vivo, 52 scene).** Valore mostrato sul pulsante: **PASSAGGIO · 87–88** (su 99). Esito: **40 intercettati (77%)**, 9 assist (17%), 1 chance (2%), 2 miss (i due «Palla in area» da calcio d'angolo). Per tipo: Servi 22 → 5 assist · Filtrante 12 → 2 · Uno-due 10 → 1 · Lancio smarcante 2 → 1 · Sponda 2 → 0 · Cross 2 → 0. Nelle **prime 6 partite il passaggio è stato intercettato 12 volte su 12**.

Conclusione di misura: anche con PASSAGGIO 87–88 **circa 8 passaggi su 10 sono intercettati** e meno di 1 su 5 diventa assist; il numero è coerente con la segnalazione del PO («il 90–95% degli assist fallisce»; qui 83–86% di scene fallite, 100% nelle prime 12 di B). Il valore del pulsante (87–88) non dà nessuna garanzia di riuscita leggibile al giocatore (D2).

### 3.2 Chi segna, cosa dice il riquadro, cosa finisce nel tabellino

Per ogni scena che ha dato assist (key `assist`) ho confrontato: compagno **nominato nella scelta** · compagno che segna secondo il riquadro/tabellino · gol sì/no.

| Partita | Scelta | Riquadro esito | Tabellino «Momenti chiave» | Gol compagno | Nome coerente? |
|---|---|---|---|---|---|
| S16 W7 | Uno-due con LINK | «Seifert segna su assist di Brandi! 2-0» | «Assist per Seifert al 66'» | sì | **NO** |
| S16 W9 | Servi ROTH libero | «⚽ Link · 🅰️ Assist: Brandi» | «Assist per Link al 87'» | sì | **NO** |
| S16 W10 | Uno-due con SEIFERT | «Lang segna su assist di Brandi! 1-0» | «Assist per Lang al 20'» | sì | **NO** |
| S17 W7 | Lancio smarcante per KETTNER | — | «Assist per Ebert al 73'» | sì | **NO** |
| S17 W8 | Uno-due con JANKE | «⚽ Janke» | «Assist per Janke al 6'» | sì | sì |
| S17 W9 | Servi KETTNER libero | «⚽ Langer» | «Assist per Langer al 20'» | sì | **NO** |
| S17 W10 | Servi HORN libero | «⚽ Horn» | «Assist per Horn al 77'» | sì | sì |
| S17 W11 | Servi POHL libero | «⚽ Pohl» | «Assist per Pohl al 62'» | sì | sì |
| S17 W15 | Servi THEIS libero | — | «Assist per Klein al 81'» | sì | **NO** |
| S17 W20 | Filtrante per THEIS | «⚽ Theis» | «Assist per Theis al 83'» | sì | sì |
| S17 W21 | Filtrante per POHL | «⚽ Pohl» | «Assist per Pohl al 27'» | sì | sì |
| S17 W23 | Servi THEIS libero | «⚽ Klein» | «Assist per Klein al 23'» | sì | **NO** |

- **Nome non coerente in 7 assist su 12 (58%)** (S16 3/3, S17 4/9); a questi si aggiungono i 5 casi su 6 già registrati dal collaudatore precedente (provino 3 e S3, gare 326/331). Totale 12 su 18.
- **Tabellino ↔ scene:** il numero di assist del tabellino coincide con le scene `assist` in tutte le 23 partite (9 su 9). Il conteggio è giusto; è il **nome** a essere sbagliato.
- **Gol del compagno:** sì in 9 assist su 9 (il punteggio sale subito dopo la scena); nella «chance» (S17 W11, Servi THEIS) nessun gol.
- **3D:** negli intercetti il pallone finisce a un avversario a 0,1–1,9 unità (12 foto su 14 della prima serie: `heldBy: away`), coerente col testo «Passaggio intercettato». Sul successo S17 W15 («Servi THEIS libero», `assist-s17b-ok1.png`) il compagno inquadrato è **POHL** (e JANKE), THEIS non è in scena: il 3D non mostra il ricevente nominato.
- Tutti i passaggi riusciti (key `assist`) hanno scritto `ok: true`; tutti gli intercetti `ok: false`.

Foto: `assist-1…6` (provini, collaudatore precedente) · `assist-s17-1,3,4,5,7,8,11` (intercetti, riquadro «Palla persa» e 3D) · `assist-s17b-ok1…4` (successi).

## 4. Difetti

Gravità: **alta** = rompe una regola o inganna il giocatore · **media** = incoerenza visibile · **bassa** = testo/dettaglio. Per regola PO ogni difetto negli highlight vale almeno «media». «Noto» = elencato dal PO, qui rivisto o confermato con numeri.

| ID | Grav. | Stagione/settimana | Schermata | Cosa succede | Come riprodurlo | Foto |
|---|---|---|---|---|---|---|
| D1 | **alta** | S1 provino 3, S3 gare 326/331, S16 W7/9/10, S17 W7/9/15/23 | Scena d'assist → riquadro esito → «Momenti chiave» | Il compagno scelto nella scena («Servi LINK libero», «Uno-due con SEIFERT»…) **non è quello che segna** e riceve l'assist nel riquadro/tabellino: 12 casi su 18 (§3.2). Sul 3D il ricevente nominato non compare (S17 W15). | Dal vivo: scegliere un passaggio con nome in un highlight; se l'assist riesce, leggere «🅰️ Assist: Brandi» + «⚽ X» e «Assist per Y» a fine partita. | assist-s17b-ok1, ok4 |
| D2 | **alta** | tutte le stagioni | Scene d'assist | I passaggi sono intercettati nell'83–85% dei casi con PASSAGGIO 87–88; 12 su 12 nelle prime 6 partite di S17. Il valore del pulsante non indica la probabilità reale (§3.1). Il giocatore non ha modo di capire/migliorare la riuscita. | Giocare 5–6 partite dal vivo scegliendo sempre i passaggi. | assist-s17-1,3,4,5,7,8 |
| D3 | media | S7–S16 (autoplay), 48 scene su 181 | Scene «Finta e cambio di passo», «Proteggi palla e scarica» | **Finta giocata come passaggio (noto):** sono dribbling/protezione palla ma il motore le classifica `hlType=pass` e le risolve come passaggio («Passaggio intercettato»). «Proteggi palla e scarica» esce 11 volte su 11 intercettata; «Finta e cambio di passo» 32 su 37. | Scegliere «Finta e cambio di passo» in una scena di ricezione/dribbling. | (dati: partite-live.jsonl) |
| D4 | media | S3 gara 331, 62' | Assist dopo parata | Scena «Servi FERRETTI libero» con esito «il portiere ci mette i guantoni — palla viva» (voto 5.5): subito dopo la scena è registrata una seconda volta e il gol di Ursino su respinta diventa assist a Brandi. (collaudatore precedente) | Giocare 331 di S3. | — |
| D5 | **alta** | S5 W1–38 (anche S13 W1, S15 W5) | Home · Agente · Gioca | **Contratto che scade senza rinnovo (noto):** a S5 la home dice «Contratto scaduto — sei svincolato», «Gioca» è rifiutato («Sei svincolato: rinnova…») e «Simula e avanza» passa 38 settimane senza avviso: **S5 chiusa con 0 presenze, 0 gol, 0 assist**. Ripetuto a S13 W1 e S15 W5 (contratto del Valdenau durato 2 stagioni). A S13 l'Agente scrive insieme «Scadenza: fine stagione 13» e «Stagioni rimaste: Contratto scaduto». | Non rinnovare nell'ultima stagione di contratto. | s05-gioca-bloccato, s13-w1-home, s13-agente |
| D6 | **alta** | S7 (OVR 80–82), S8 | Nazionale | **Convocazioni mancanti (noto):** a S6 il log dice «il CT non ti convoca — serve OVR 81»; a S7 Brandi ha OVR 80 → 81 (da W24) → 82, 17 gol, Giovane dell'Anno e **0 presenze in Nazionale** (non ho il log delle soste di S7 per sapere il motivo); esordio solo a S8 W28 (OVR 83). Poi 2 presenze a S8–S9 e 6 a S10 con OVR 84–87 e 24–34 gol a stagione. | Giocare S6–S9 con OVR ≥ 81 e leggere «Sosta di settimana N: il CT non ti convoca» nel log. | s17-nazionale |
| D7 | media | S2 e S5 fine stagione | Fine stagione | «⬇️ RETROCESSIONE» / «La retrocessione è un fallimento collettivo» con il club 16° su 18 in **Lega B** (seconda divisione, nessuna serie sotto): a S3 e S6 il club è ancora in Lega B. (collaudatore precedente) | Chiudere una stagione di Lega B nelle ultime posizioni. | — |
| D8 | media | S13 W1 dopo rinnovo | Home e Agente | Dopo «Contratto rinnovato! 3 anni · €22,2 mln/anno» la home mostra ancora «📢 Sei in lista cessioni · 5 settimane rimanenti · Ritira ✕» e l'Agente «Sei in lista transfer», per un OVR 89 con fiducia 100/100; a W8 il giocatore è poi ceduto al Valdenau. | S13 W1: Negozia rinnovo → +30% → Accetta; tornare in HOME. | s13-rinnovo-ok |
| D9 | bassa | S13 W1 | Negoziazione | La controfferta dice «Stipendio proposto €19,3 mln» ma il contratto firmato è €22,2 mln (bonus procuratore +15% applicato in silenzio; sulle richieste lo stesso bonus è mostrato «→ €22,8 mln con agente»). La proposta iniziale (€17,3 mln) è più bassa dello stipendio in corso (€17,8 mln) per OVR 89. | S13 W1: Negozia rinnovo. | s13-negozia, s13-rinnovo-ok |
| D10 | bassa | S6 W1 | Home · Profilo | «⭐ Titolare affermato» in home e «Riserva» nel Profilo; proposta di rinnovo (€134 mila) più bassa dello stipendio (€138 mila) con OVR 77; «+15% → €154 mila / €177 mila con agente» esce €195 mila. (collaudatore precedente) | S6 W1. | s06-home, s06-carriera, s06-negozia |
| D11 | bassa | S13 W1 | Home | A 29 anni e 12 stagioni di carriera la home propone «🌱 Il ragazzo della Primavera — capitolo 1 di 4» (arco da esordiente); «Derby dell'Ovest Lontano» in Premier Division senza legame geografico. | S13 W1, home. | s13-w1-home |
| D12 | bassa | Nazionale S8–S16 | Cronaca/analisi/titoli post-partita | **«Il Spagna» (noto):** articolo sbagliato davanti a «Spagna» in 31 occorrenze (es. «Il Spagna ha sofferto in fase difensiva», «Solidità premia il Spagna», «il Spagna domina…»). | Giocare una partita della Nazionale e leggere «L'analisi» e «Dalle altre testate». | nat-torneo-1, nat-torneo-8 |
| D13 | bassa | S15 W5 | Home (Coppa Europea) | **«900ª giornata» (noto):** «Coppa Europea · 900ª giornata» al posto della giornata del girone (la partita è «Giornata 1/6»). | Avere in calendario una partita di Korward Champions Cup. | — |
| D14 | bassa | S17 W1 | Carriera › Profilo | «Prossimo gradino — Leader: la fascia si guadagna (età 27+ (ora 33) · 130+ presenze (ora 602) · fiducia del mister 90+ (ora 100))»: **tutte e tre le condizioni sono soddisfatte** ma lo status resta «Titolare». | CARRIERA › Profilo a fine carriera. | s17-carriera |
| D15 | bassa | S5 fine stagione, S9 | Fine stagione | Frasi fuori contesto: a S5 (0 presenze, retrocessione) il mister dice «Sei uno dei giocatori su cui ho sempre potuto contare»; la stessa frase compare a S3, S7, S13. A S9 la scheda dice «Coppa alzata e numeri da protagonista» e il mister «Stagione discreta». | Leggere le schermate di fine stagione S5, S9, S13. | — |
| D16 | bassa | dopo il ritiro | Home (slot) | La scheda dello slot, dopo il ritiro, mostra «FC Lisboa · S.16 W.39/38 · OVR 89 · 07:23» mentre il salvataggio è «FC Valdenau, S17 W1, ritirato»; «Continua →» rimanda alla lettera d'addio invece di dire che la carriera è chiusa. | Ritirarsi e tornare alla Home. | s17-ritiro-1, s17-fine-b1 |
| D17 | bassa | S2–S16, a ogni ricarica | Salvataggio | Dopo la ricarica compaiono campi assenti nello stato vivo: `cup.club` (S2–S5, S8, S11, S12, S14, S15), `playedMd.md.40–47` con valori strani (20, 21, 995, 1489, 1498, 1505) e `cup.active: true → false` (S7, S9, S10, S13). Non ha rotto nulla, ma lo stato ricaricato non è identico a quello vivo. | Salva + ricarica a W39 di ogni stagione e confronta (`reload.jsonl`). | — |
| D18 | bassa | S17 W1 | Fine carriera | «Leggenda Assoluta · Legacy Score 1000/1000» con 6 trofei, 0 titoli con la Nazionale e 0 premi «Pallone d'Oro»: non posso confermare se 1000 sia un tetto raggiunto da qualunque carriera lunga (da verificare con un'altra carriera). | Ritirarsi. | s17-fine-b1 |

Riepilogo: **alti 4** (D1, D2, D5, D6) · **medi 4** (D3, D4, D7, D8) · **bassi 10**.

Non rivisti in questa carriera (noti): «doppio gol dopo il rigore» (nessun rigore doppio in 23 partite S17 e 245 totali: il tabellino e «Momenti chiave» tornano su tutte quelle controllate a campione: S17 W9, W12, W17, W22).

## 5. Altre osservazioni (non difetti)

- Un'intera stagione può sembrare ferma se il giocatore chiude la schermata di un'intervista con «Chiudi» o resta su «Festeggia»: sono modali che richiedono un tocco; nessun blocco del gioco, ma il collaudo automatico si è fermato due volte lì.
- Trasferimenti e prestiti accettati a rotazione hanno prodotto molti cambi di club (S6, S7, S9, S10, S13, S16, S17): il gioco regge (contratto, ricarica). I prestiti con ritorno al club madre fanno ricomparire il giocatore in Lega B a S7 dopo S6 in Ligue Nationale: coerente con «Prima parte con il FC Cesenate: 17 partite» e «Rientra S.18».
- Ufficio e Agente (S3, S6, S13): staff, accademia, beni, compiti settimanali e voci di mercato leggibili, senza scroll orizzontale a 412×915.
- Mondiale S16 e Coppa delle Nazioni S14 giocati dal vivo; risultati della Nazionale in `partite-live.jsonl` (chiavi `NAT:`).

## 6. Come rifare la misura

```
cd tests/visual && npm install --no-package-lock   # niente npm ci: manca il package-lock
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  RIPRENDI=1 node c177-car4-server.mjs      # banco su porta 7177, salvataggio S17 W1
```
Comandi JS via `curl localhost:7177 --data-binary '<codice>'`; la sonda degli assist è `st.inMatch` (codice in `tests/visual/c177-car4-probe-assist.mjs.txt`, pilota settimane in `c177-car4-drv-live.mjs.txt`; risultati in `assist-probe2.jsonl`).
