# Giro 181 — Migliorie e idee nuove per Korward Elite

Versione provata: **7.999.191** (ramo `lavoro/191`, commit `ec86cf7`). Solo analisi e proposte: nessuna modifica a `src/`, `assets/`, `tests/`. Niente catene di controlli.
Richiesta del PO: «fai girare una nuova sessione con suggerimenti di migliorie e nuove idee per il gioco».

**Come leggere le fonti.** Ogni affermazione porta una di queste etichette:

- **[visto]** = l'ho visto giocando in questa sessione (Chromium headless, telefono 375×812 e PC 1366×768); la foto citata è in `docs/collaudo/giro181/`.
- **[misurato]** = numero preso in questa sessione o da un rapporto di misura citato per nome.
- **[codice]** = riga del sorgente.
- **[stima]** = mia valutazione, non misurata.

Dove non ho potuto verificare scrivo «Non posso confermarlo».

---

## 0. Per il PO: le 10 proposte migliori

Ordinate per rapporto impatto/costo (prima quelle che danno tanto e costano poco). I costi sono **stime** in giri.

| # | Proposta | Cosa cambia per chi gioca | Impatto | Costo | Rischio | Tocca decisioni PO? |
|---|---|---|---|---|---|---|
| 1 | **G181-01** Ripulire i testi che «rompono l'incanto» | Spariscono parole tecniche («wizard»), frasi senza nomi, consigli tagliati coi puntini, avvisi fuori posto | medio | 1 | basso | no (attua PO-249) |
| 2 | **G181-02** La frase del mister non è più sempre la stessa | Ogni convocazione dice qualcosa della tua settimana vera | medio | 1 | basso | no (stessa linea di PO-291) |
| 3 | **G181-06** Nomi reali nei salvataggi vecchi | Nessun nome di calciatore vero può comparire, nemmeno in una carriera iniziata mesi fa | alto (per lo store) | 1 | basso | no (attua la regola del 12/10) |
| 4 | **G181-08** Il piano del mister diventa una sfida di partita | Anche la partita «senza posta» ha un piccolo obiettivo tuo, con premio | alto | 2 | medio | sì: tetto di 2-3 interazioni col mister (PO-226/234/259) |
| 5 | **G181-15** «Le tue leggende»: albo delle carriere finite | Un motivo per ricominciare: battere i propri record di famiglia | alto | 2 | basso | collegata a PO-358 |
| 6 | **G181-19** Cartolina da condividere | A fine stagione un'immagine pronta da mandare agli amici: pubblicità gratuita | alto | 2 | basso | no |
| 7 | **G181-18** «Bentornato»: riassunto alla ripresa | Chi torna dopo giorni capisce subito dov'era e cosa c'è in ballo | medio | 1-2 | basso | no |
| 8 | **G181-13** Soldi con uno scopo a fine carriera | I milioni accumulati servono a qualcosa che si vede | alto | 3-4 | medio | sì: PO-157/281 chiuse «per il momento» il 20/10 |
| 9 | **G181-20** Album delle giocate e delle figurine | Una collezione da completare in anni di gioco | alto | 3 | basso | no |
| 10 | **G181-10** Un rivale che resta all'altezza | Il duello della stagione torna a essere un duello | alto | 2-3 | medio | sì: curva di difficoltà PO-156 (chiusa 20/10) |

### Se ne facessi solo 3

1. **G181-08 — Il piano del mister come sfida di partita.** È la risposta più economica alla noia che il PO teme: il giro 164 ha misurato che per un club di metà classifica 20-30 partite di campionato su 34 hanno la stessa posta. Il materiale c'è già (i consigli prima della gara).
2. **G181-15 — «Le tue leggende».** Oggi una carriera finita lascia solo un bonus alla successiva. Un albo permanente dà senso al ricominciare, che è il vero «lungo periodo» di un gioco gratuito.
3. **G181-01 + G181-02 + G181-06 insieme (3 giri).** Sono le tre pulizie che un giocatore nuovo, arrivato da Google Play, noterebbe nei primi venti minuti.

---

## 1. Com'è il gioco oggi, visto da un giocatore

### 1.1 Cosa ho giocato

| Cosa | Come | Esito |
|---|---|---|
| Creazione del calciatore | da zero, telefono | foto `03-crea-tel.png` |
| 3 provini dal vivo | 1 a 1×, 2 a 2× | 0 gol, 3 assist, voto medio 6,7; 2 offerte di Primavera 2 (`16`, `17`) |
| Primavera, settimane 1-8 | 6 partite simulate, 1 dal vivo | 2V 3N 2P, 2 gol, 11° posto |
| Partita di campionato dal vivo | Primavera, 7ª giornata, 2× | 1–1, voto 6,4, intervista dopo (`32`-`40`) |
| Stagione 12 (salvataggio di prova `save-190-s12-ovr93`) | ultima giornata, chiusura, galà, parata, bilancio | foto `43`-`53` |
| Carriera pro stagione 5 (`save-c177-s5w20`) | home, finestre, avvio di una partita, su PC | foto `60`-`64` |

Limiti dichiarati: le azioni le ha scelte un pilota semplice (a rotazione, senza ragionare), quindi **non posso dire nulla sulla difficoltà vera**; i tempi sono presi in headless, non su un telefono; non ho giocato la Nazionale, le coppe europee, il mercato completo né il ritiro.

### 1.2 Cosa diverte

- **Il primo quarto d'ora ha carattere.** Figurina, intro, tre provini con gli osservatori in tribuna, poi la scelta fra due club veri di Primavera 2 [visto, `03`, `06`, `17`].
- **I testi della Primavera sono la cosa migliore del gioco.** Il bar del paese che incornicia la convocazione «tra la squadra dell'82 e la foto del sindaco», il professore che ti tiene il posto, il bambino che chiede l'autografo al compagno [visto, settimane 3, 4, 7; foto `31`]. Fanno sorridere e danno un'identità che un gioco di carriera qualsiasi non ha.
- **La preparazione della gara dice qualcosa di utile.** «Il mister · come vincerla: palle filtranti — si abbassano tardi in transizione» [visto, `32`]. È una promessa di gioco intelligente (vedi G181-08: oggi non viene mantenuta fino in fondo).
- **Il bilancio di fine stagione è ricco e gratificante.** Titolo della stagione («L'anno del dominatore»), film della stagione, partita dell'anno, record battuti [visto, `53`].
- **La carriera pro a metà percorso è viva.** Alla stagione 5 la home propone un patto col mister (3 giocate decisive in 6 gare), uno sponsor, una scelta sul procuratore, un allenamento extra [visto, `60`].
- **«Vai al prossimo momento importante» spiega prima cosa farà**: «3 partite simulate, poi sfida alla capolista (sett. 12)» [visto, `41`]. È chiaro e onesto.
- **La grafica è coerente** fra telefono e PC [visto, `43`, `64`].

### 1.3 Cosa annoia

- **La settimana simulata è sempre la stessa sequenza di 4 tocchi**: Vivi la settimana → una scheda di testo → Gioca → Simula [misurato, 6 settimane su 6]. In 2 settimane su 6 la scheda aveva un solo tasto («Capito»): nessuna scelta.
- **La frase del mister alla convocazione è identica**: «Sei tra i migliori della rosa — il mister non può lasciarti fuori. Titolare.» 6 volte su 6 [misurato, foto `24`].
- **Le azioni si ripetono dentro la stessa partita.** Nel primo provino 3 scene su 9 erano «fra le linee / uno-due» e ci sono stati 2 rigori (75' e 86') [misurato]. Il giro 164 aveva già misurato il 28-49% di scene già viste nella stessa stagione.
- **L'assist non paga.** In 5 «uno-due» su 5 il compagno si è fatto parare il tiro [misurato, su 4 partite]. Campione piccolo: non posso confermare che sia la norma.
- **In cima alla carriera non c'è più niente da inseguire** [visto sul salvataggio di stagione 12, `43`, `44`]: OVR 93 a 28 anni, +18 punti sulla seconda, 49 gol; fiducia, morale e popolarità a 100/100; attributi che crescono di +1 ogni 44-146 settimane; €92,3 mln in banca con tutto già comprato (4 beni su 4, staff 3/3). L'offerta di mercato che chiude una «saga» in 3 episodi è peggiore su tutte e quattro le voci: stipendio 33,3→24,3 mln, durata 2→1, ruolo titolare→rotazione, prestigio 96→90. Non so se questo salvataggio venga da una carriera giocata o costruita per i test.
- **Il rivale non è un rivale**: 15 gol contro 42, OVR 82 contro 93 [visto, `48`, `53`].
- **Il galà toglie la sorpresa da solo**: in testa c'è scritto «Stasera 4 premi · 4 sono per te», poi servono 16 tocchi per aprire le buste [visto, `48`-`51`]. Il podio dell'MVP è identico a quello del capocannoniere, con gli stessi «24».

### 1.4 Dove ci si perde

- **Scelte che sembrano uguali.** «Cerca l'angolo · TECNICA 65» e «Conclusione precisa · TECNICA 65» nella stessa scena [visto]: non si capisce cosa cambi.
- **Il consiglio è tagliato proprio dove serve**: «Nessun taglio in profondità:…» coi puntini [visto, `08`].
- **Schede vuote o fuori tempo in Primavera.** «Ufficio» è una riga sola per tutta la prima stagione [visto, `29`]. In «Agente», alla settimana 7 del primo anno, c'è già l'allarme «⚠️ Contratto in scadenza e stipendio sotto il mercato» e il procuratore dice «i numeri non stanno arrivando» dopo 2 gol in 6 partite [visto, `28`].
- **Una scelta settimanale vera è nascosta**: il «compito della settimana» del procuratore (4 opzioni con effetto dichiarato) sta in fondo alla scheda Agente e nessuno te lo ricorda [visto, `28`].
- **Troppe finestre in fila alla ripresa**: nella carriera pro di stagione 5 ho dovuto chiudere 4 finestre prima di poter premere «Vivi la settimana» [visto, `60`].
- **Il tutorial sono 6 pagine di solo testo**, e una dice che la barra porta a «Opzioni» mentre la barra mostra «Ufficio» [visto].
- **«Festeggia con la squadra»**: toccato, il riquadro sparisce e sullo schermo non succede altro [visto, `45`; codice `src/18-career-app.jsx` r.7775: aggiorna solo lo stato]. Non posso confermare se parta un suono.

### 1.5 Cosa manca rispetto a ciò che un appassionato si aspetta

Resto sul piano delle meccaniche di genere.

| Attesa tipica in un gioco di carriera di un calciatore | Oggi |
|---|---|
| Scegliere il ruolo in campo | Solo attaccante [codice `src/17-menu-creazione-pannelli.jsx` r.437, r.449] |
| Un rivale che cresce con te | C'è, ma resta indietro (15 gol contro 42) [visto] |
| Soldi che comprano qualcosa fino alla fine | Tutto comprato alla stagione 12 [visto] |
| Una bacheca che sopravvive alla carriera | Bonus alla carriera successiva e «eredità familiare» [codice `src/17` r.1350-1351]; un albo delle carriere finite non c'è (0 occorrenze cercate) |
| Condividere un traguardo | Assente: `navigator.share` 0 occorrenze in `src/` [codice] |
| Collezioni da completare | Traguardi e record sì; un album no. Non posso confermare quanti traguardi siano raggiungibili a fine carriera |
| Opzioni di lettura (testo grande, meno animazioni) | Le Opzioni hanno solo audio, vibrazione e privacy [visto, `02`] |
| Lingue | Solo italiano; l'interruttore IT/EN esiste ma senza traduzioni (sintesi della mappa di gioco) |
| Promemoria per tornare | Nessuna notifica (0 occorrenze) [codice] |

---

## 2. Le proposte (22)

Ogni scheda: problema od occasione con prova · proposta · impatto · costo stimato in giri · rischio · decisioni PO toccate · voce di BACKLOG collegata.
Non ripropongo ciò che il PO ha già scartato: selettore di difficoltà, archetipi e stili, vista Allenamento, percentuali di riuscita, slot settimanali da assegnare (P5), doppio tema, partita tutta in 3D, musica fuori dalle cerimonie, pubblicità.

### A. Migliorie rapide (ciò che c'è ma rende poco)

**G181-01 — Ripulire i testi che rompono l'incanto**
- *Problema [visto]:* «riprendi il **wizard** col tasto Avanza» (2 volte nell'apertura di stagione, `21`); cronaca «fallo di **un giocatore su un giocatore**» (`12`); consiglio tagliato «Nessun taglio in profondità:…» (`08`); faccina 😄 accanto a «−3 ⭐−4»; «Contratto **trascorso**» in Agente; il tutorial cita «Opzioni» nella barra; alla settimana 5 di Primavera la scheda dice «**Il ragazzo della Primavera** ti chiede di restare…» a un giocatore che è lui stesso della Primavera.
- *Proposta:* un giro di sola correzione di questi sette punti, più una ricerca delle parole tecniche a vista («wizard», «dashboard» compare nel tutorial e nel tasto «Torna alla dashboard»).
- *Impatto:* medio. *Costo:* 1. *Rischio:* basso.
- *Decisioni PO:* nessuna contraria; attua «nei panni del player» (PO-249, 14/10). *BACKLOG:* PO-249, PO-250 (lessico).

**G181-02 — La convocazione racconta la tua settimana**
- *Problema [misurato]:* stessa frase del mister 6 volte su 6 (`24`).
- *Proposta:* 3-4 varianti per ogni stato (titolare, rotazione, panchina) scelte dai fatti: ultimo voto, serie di gol, avversario, fatica. Senza sorteggio non seminato (regola del determinismo).
- *Impatto:* medio. *Costo:* 1. *Rischio:* basso.
- *Decisioni PO:* nessuna contraria. *BACKLOG:* stessa richiesta di PO-291 («genera varianti non ripetitive»), applicata a un altro testo.

**G181-03 — Il galà con la sorpresa vera**
- *Problema [visto]:* «4 premi · 4 sono per te» prima delle buste; 16 tocchi; podio MVP uguale al capocannoniere (`48`-`51`).
- *Proposta:* (a) in testa solo «Stasera 4 premi», senza dire quanti sono tuoi; (b) quando il premio è tuo, una busta sola con un tocco (il podio resta leggibile sotto); (c) l'MVP mostra il voto medio, non i gol.
- *Impatto:* medio. *Costo:* 1. *Rischio:* basso.
- *Decisioni PO:* cerimonie chiuse «per il momento» il 20/10 (PO-002/137): riapre un tema chiuso. *BACKLOG:* PO-002, PO-137.

**G181-04 — Scelte dell'azione distinguibili a parole**
- *Problema [visto]:* due scelte con la stessa etichetta «TECNICA · 65».
- *Proposta:* una parola di carattere per scelta («sicura», «coraggiosa», «di classe»), mai un numero di probabilità. In alternativa, più economica: impedire che due scelte della stessa scena mostrino lo stesso attributo.
- *Impatto:* medio. *Costo:* 1-2. *Rischio:* medio (191 scene da etichettare o da controllare).
- *Decisioni PO:* **tocca** «niente percentuali, rischio cieco» (09/2026, 7.901). La parola non è una percentuale, ma dice qualcosa del rischio: va deciso dal PO.
- *BACKLOG:* PO-250.

**G181-05 — Niente schede vuote o fuori tempo in Primavera**
- *Problema [visto]:* Ufficio vuoto per 38 settimane (`29`); allarme contratto e «i numeri non arrivano» alla settimana 7 (`28`); compito dell'agente nascosto.
- *Proposta:* (a) in Primavera l'Ufficio mostra un'anteprima di ciò che si sbloccherà e il primo borsellino (il saldo esiste già: il salvataggio di prova di fine Primavera ha €7.423); (b) l'allarme contratto parte solo nelle ultime 10 settimane; (c) il compito dell'agente compare come riga in «La tua settimana».
- *Impatto:* medio. *Costo:* 1. *Rischio:* basso.
- *Decisioni PO:* (c) va pesata con PO-224 (impulsi come finestre). *BACKLOG:* PO-356 (Primavera), PO-338.

**G181-06 — Nomi reali nei salvataggi vecchi**
- *Problema [visto, `48`, `53`]:* nel galà e nel bilancio della stagione 12 compare «Bukayo Saka · FC Hammers» come rivale. Il nome viene dal salvataggio (`player.rival.name` in `tests/visual/fixtures/save-190-s12-ovr93.json`); nel sorgente i rivali sono già stati rinominati [codice `src/07-versione-save-interviste.jsx` r.35].
- *Proposta:* una migrazione additiva che rinomina il rivale se il nome è nella lista di controllo; estendere `audit-copyright` ai salvataggi di prova.
- *Impatto:* alto per l'uscita sullo store (un tester con una carriera vecchia può fotografarlo). *Costo:* 1. *Rischio:* basso.
- *Decisioni PO:* attua «nomi inventati» (12/10). SAVE_VERSION resta 9. *BACKLOG:* PO-322.

**G181-07 — «Festeggia con la squadra» deve far vedere una festa**
- *Problema [visto, codice r.7775]:* il tocco chiude il riquadro e basta.
- *Proposta:* collegarlo alla festa del titolo che già esiste, oppure rinominare il tasto in ciò che fa davvero.
- *Impatto:* basso-medio. *Costo:* 1. *Rischio:* basso. Prima va verificato che non sia già voluto così.
- *Decisioni PO:* cerimonie chiuse il 20/10. *BACKLOG:* PO-137.

### B. Nuove meccaniche

**G181-08 — Il piano del mister come sfida di partita**
- *Occasione:* prima della gara il mister dà già due consigli concreti (`32`). Oggi nessuno verifica se li segui. Il giro 164 ha misurato 20-30 partite di campionato su 34 con posta bassa.
- *Proposta:* il consiglio diventa un piccolo obiettivo della gara («2 filtranti riusciti», «un tiro a giro in porta»). A fine partita una riga: «Hai seguito il piano» con un premio leggero di fiducia. Nessuna finestra nuova: vive nella schermata che c'è già e nel riepilogo.
- *Impatto:* alto. *Costo:* 2. *Rischio:* medio (le scene offerte devono permettere l'obiettivo, altrimenti è frustrante).
- *Decisioni PO:* **tocca** il tetto di 2-3 interazioni col mister e «indicazioni, non ordini» (PO-226/234/259). Non aggiunge interazioni in partita, ma è una richiesta del mister in più.
- *BACKLOG:* PO-364 (partite senza posta).

**G181-09 — Altri ruoli: centrocampista e difensore**
- *Occasione [codice]:* il ruolo è fisso su attaccante. Una seconda carriera oggi è la stessa partita con un altro nome. Il collaudo PO-301 parla di un «centrocampista giocato da attaccante».
- *Proposta:* due ruoli in più (portiere escluso), con una quota diversa di scene (più passaggi e recuperi), voto pesato sul ruolo, obiettivi adatti. A tappe: prima il centrocampista.
- *Impatto:* alto (rigiocabilità). *Costo:* 6-10 (stima larga). *Rischio:* alto: bilanciamento dei voti e dei gol, numero di scene difensive credibili (PO-220 è ancora un residuo aperto).
- *Decisioni PO:* non ho trovato una decisione scritta sul ruolo unico. Non posso confermare che sia una scelta definitiva.
- *BACKLOG:* PO-220, PO-068.

**G181-10 — Un rivale che resta all'altezza**
- *Problema [visto]:* 15 gol contro 42; «Siete diventati amici» e il duello è finito.
- *Proposta:* il rivale è un ruolo, non una persona: quando lo stacchi nettamente per due stagioni, la storia lo chiude (amicizia, ritiro, addio) e ne presenta uno nuovo, più giovane, che punta ai tuoi record. Gli scontri diretti hanno posta dichiarata.
- *Impatto:* alto nel lungo periodo. *Costo:* 2-3. *Rischio:* medio (non deve sembrare una difficoltà truccata).
- *Decisioni PO:* **tocca** la curva per fasi di carriera (PO-156, chiusa il 20/10). *BACKLOG:* PO-156, PO-359.

**G181-11 — Lo studio dell'avversario che paga**
- *Occasione [visto]:* esiste il tasto «Analisi dell'avversario». Nel primo provino ho calciato 2 rigori senza alcuna informazione sul portiere. Non ho aperto l'analisi: non posso confermare cosa mostri oggi.
- *Proposta:* l'analisi dà un'abitudine del portiere e una del marcatore («sui rigori parte presto a destra»). In partita, la scelta coerente con l'informazione ha un esito migliore. Chi salta l'analisi gioca come oggi.
- *Impatto:* medio. *Costo:* 2. *Rischio:* medio.
- *Decisioni PO:* compatibile con «rischio cieco»: l'informazione è a parole e facoltativa. Da confermare col PO.
- *BACKLOG:* nessuna voce trovata.

### C. Profondità della carriera (anni e stagioni)

**G181-12 — Popolarità e fiducia a gradini, non a barra**
- *Problema [visto]:* popolarità 99/100 a 21 anni (stagione 5, in rotazione, OVR 74) e 100 alla stagione 12; fiducia e morale a 100. Una barra piena non è più un obiettivo.
- *Proposta:* la popolarità sale di gradino (quartiere → città → nazione → continente → icona). Ogni gradino si conquista con un fatto (una convocazione, un trofeo, un record) e sblocca testi e sponsor propri.
- *Impatto:* medio-alto. *Costo:* 2-3. *Rischio:* medio (la popolarità entra in sponsor e mercato: va rimisurata).
- *Decisioni PO:* nessuna contraria trovata. *BACKLOG:* PO-153 (diagnosi dei sistemi di carriera).

**G181-13 — Soldi con uno scopo a fine carriera**
- *Problema [visto, `44`]:* €92,3 mln, 4 beni su 4, staff al massimo, accademia «0 ragazzi usciti». Stipendio 33 mln l'anno contro 215 mila a settimana di spese.
- *Proposta:* progetti lunghi e visibili. Esempi: rifare il campo del paese d'origine (lo stesso bar della settimana 3); l'accademia che fa uscire un ragazzo con nome e volto che poi incontri da avversario; una quota del tuo primo club. Ogni progetto dura stagioni e torna nei testi e nel punteggio di eredità.
- *Impatto:* alto nel lungo periodo. *Costo:* 3-4. *Rischio:* medio.
- *Decisioni PO:* **tocca** economia e Ufficio, chiusi «per il momento» il 20/10 (PO-157, PO-281). Rispetta «acquisti più concreti ed impattanti» (PO-281) e «rendilo credibile o elimina» (PO-289).
- *BACKLOG:* PO-157, PO-281, PO-359 («Il tuo allievo»).

**G181-14 — Nuove sfide a metà carriera**
- *Occasione [codice `src/17` r.1362]:* le Sfide (scalata, 50 gol, OVR 90 prima dei 26 anni, bandiera, 20 presenze in Nazionale) si scelgono solo alla creazione, dentro una riga richiudibile.
- *Proposta:* a ogni sfida chiusa o fallita, e comunque ogni 4 stagioni, il gioco ne propone una nuova adatta all'età (per il veterano: «100 gol dopo i 30 anni», «una stagione intera senza cartellini»). Sono un obiettivo scelto, non un livello di difficoltà.
- *Impatto:* medio-alto. *Costo:* 2. *Rischio:* basso.
- *Decisioni PO:* nessuna contraria; non è un selettore di difficoltà perché non cambia il motore. *BACKLOG:* PO-156.

**G181-15 — «Le tue leggende»: l'albo delle carriere finite**
- *Problema [codice]:* una carriera conclusa lascia solo un bonus alla creazione successiva (`src/17` r.1350-1351). Nessun archivio permanente.
- *Proposta:* nel menu una pagina con le carriere chiuse (figurina, club, gol, trofei, punteggio di eredità). Nella carriera successiva i record di famiglia diventano traguardi («batti i 431 gol di tuo padre»). Chiave di archivio separata dagli slot, nessun cambio al salvataggio di carriera.
- *Impatto:* alto (è il motivo per ricominciare). *Costo:* 2. *Rischio:* basso. La mappa di gioco segnala che «Nuova partita+» non ha test: conviene aggiungere un guardiano nello stesso giro.
- *Decisioni PO:* nessuna contraria. *BACKLOG:* PO-358 (punteggio di eredità).

**G181-16 — Il filo del paese per tutta la carriera**
- *Occasione [visto]:* i testi d'esordio (bar, professore, bambino) sono i più riusciti, ma finiscono con la Primavera.
- *Proposta:* 8-10 richiami distribuiti negli anni: il bar aggiunge la foto del primo trofeo; il professore scrive dopo la Nazionale; il bambino dell'autografo, cresciuto, debutta contro di te. Una volta per carriera ciascuno.
- *Impatto:* medio-alto (affetto, non meccanica). *Costo:* 2. *Rischio:* basso.
- *Decisioni PO:* impulsi con memoria chiusi «per il momento» (PO-154, 20/10). *BACKLOG:* PO-154.

**G181-17 — La lotta per non retrocedere come storia**
- *Problema [misurato, giro 164]:* club basso = 1-4 partite con posta su 38-40 (3-10%). Promozioni e retrocessioni esistono [codice `src/18-career-app.jsx` r.5361].
- *Proposta:* per i club di bassa classifica le ultime 8 giornate diventano una mini-serie (quota salvezza, scontri diretti dichiarati, spogliatoio teso), con il tasto «prossimo momento» che si ferma lì.
- *Impatto:* medio. *Costo:* 2. *Rischio:* basso.
- *Decisioni PO:* coerente con la scelta «B e C insieme» di PO-364; il giro 164 chiedeva già di allargare la regola di posta per i club bassi. *BACKLOG:* PO-364.

### D. Coinvolgimento e ritorno del giocatore

**G181-18 — «Bentornato»**
- *Problema [visto]:* il menu mostra solo nome, club, stagione e settimana (`42`); alla ripresa ho trovato 4 finestre in coda (`60`).
- *Proposta:* se l'ultima sessione è di oltre un giorno fa, una schermata sola: dov'eri rimasto, cosa c'è in ballo (classifica, patto col mister, mercato), prossima gara. Poi le finestre in coda, una alla volta come oggi.
- *Impatto:* medio. *Costo:* 1-2. *Rischio:* basso.
- *Decisioni PO:* nessuna contraria; va nel formato standard delle finestre (PO-230). *BACKLOG:* PO-224.

**G181-19 — La cartolina da condividere**
- *Occasione [codice]:* `navigator.share` non è usato. Il bilancio di stagione ha già titolo, numeri e figurina (`53`).
- *Proposta:* tasto «Condividi» a fine stagione, dopo un record e a fine carriera: genera un'immagine con figurina, club inventato, numeri e marchio Korward Elite. Nessun dato raccolto, nessun server.
- *Impatto:* alto per un gioco gratuito senza pubblicità: è l'unico canale di diffusione. *Costo:* 2. *Rischio:* basso (da provare su telefono vero dentro l'app Android).
- *Decisioni PO:* nessuna contraria; i nomi restano inventati. *BACKLOG:* PO-322.

**G181-20 — Album delle giocate e delle figurine**
- *Occasione [misurato, giro 164]:* in una stagione si vedono 98-144 scene diverse su 191. Il componente delle figurine esiste già [codice `src/17` r.457].
- *Proposta:* un album in «Carriera»: una casella per ogni scena riuscita (gol di testa, punizione a giro, rovesciata…), per ogni stadio in cui hai segnato, per ogni maglia indossata. Mostra quante mancano.
- *Impatto:* alto nel lungo periodo; dà valore anche alla ripetizione (rivedere una scena serve a completarla). *Costo:* 3. *Rischio:* basso; campo additivo nel salvataggio.
- *Decisioni PO:* nessuna contraria. *BACKLOG:* PO-068 (i gesti promessi senza clip non vanno messi nell'album finché non esistono).

**G181-21 — La sfida del giorno**
- *Occasione:* la partita è deterministica dal seme (invariante 7.489). Si può costruire uno scenario uguale per tutti partendo dalla data, senza server.
- *Proposta:* dal menu, una situazione al giorno da 2 minuti («sotto 0-1 al 70', tre azioni per ribaltarla»), fuori dalla carriera, con la serie di giorni consecutivi salvata sul dispositivo.
- *Impatto:* medio-alto (un motivo quotidiano per aprire il gioco). *Costo:* 3-4. *Rischio:* medio: senza server non c'è classifica; la qualità delle scene deve reggere la regola «azioni dell'eroe perfette» (20/10).
- *Decisioni PO:* nessuna contraria trovata. *BACKLOG:* nessuna voce.

### E. Presentazione, accessibilità e Google Play

**G181-22 — Opzioni di lettura e primo impatto per lo store**
- *Problema [visto, `02`]:* le Opzioni hanno solo audio, vibrazione e privacy. La scelta dell'azione ha un tempo limite: una scena è fallita per «⏱ Troppo tardi» [visto]. Il tutorial sono 6 pagine di testo dopo circa 8-10 minuti di provini [misurato a 2×: circa 2 minuti e mezzo a partita].
- *Proposta, in tre parti separabili:*
  1. **Testo grande** e **riduci animazioni** come interruttori (il codice rispetta già la preferenza di sistema in 9 punti, manca il comando a mano). Costo 1.
  2. **Più tempo per scegliere**, come aiuto di lettura. Costo 1. **Tocca** «nessun selettore di difficoltà, né ora né in futuro»: lo propongo come accessibilità, decide il PO.
  3. **Tutorial a comparsa**: un suggerimento la prima volta che si apre una scheda, al posto delle 6 pagine. Costo 2. Riapre in parte PO-321 (intro e provini rifatti in 17 punti).
- *Impatto:* medio (alto per chi legge con fatica). *Rischio:* basso per 1, medio per 2 e 3.
- *BACKLOG:* PO-337 (testo minimo 12 px), PO-321.

Note su presentazione e store che **non** diventano proposte nuove, perché già decise o in programma:
- Eroe piccolo nelle azioni 3D e metà schermo vuota sul telefono [visto, `09`]: è il difetto D1 del giro 170, con piano già scritto. Confermo l'osservazione.
- Gesti non sincronizzati: giro 170b, prova pilota sul rigore già proposta.
- Salvataggi a rischio se il telefono libera memoria: PO-167 parte B. Suggerisco solo di anticiparla prima dell'uscita, perché con l'app Android un salvataggio perso diventa una recensione negativa [stima].
- Lingua inglese: il volume dei testi è molto grande. Non posso stimare il costo senza un conteggio; lo segnalo come scelta di mercato, non come proposta.
- Notifiche di richiamo: richiedono un server. Non le propongo.

---

## 3. Quadro d'insieme

| Codice | Gruppo | Impatto | Costo (giri, stima) | Rischio | Riapre un tema chiuso dal PO |
|---|---|---|---|---|---|
| G181-01 Testi | rapida | medio | 1 | basso | no |
| G181-02 Convocazione | rapida | medio | 1 | basso | no |
| G181-03 Galà | rapida | medio | 1 | basso | sì (cerimonie) |
| G181-04 Scelte distinguibili | rapida | medio | 1-2 | medio | sì (rischio cieco) |
| G181-05 Schede in Primavera | rapida | medio | 1 | basso | no |
| G181-06 Nomi nei salvataggi | rapida | alto (store) | 1 | basso | no |
| G181-07 Festeggia | rapida | basso-medio | 1 | basso | sì (cerimonie) |
| G181-08 Piano del mister | meccanica | alto | 2 | medio | sì (interazioni col mister) |
| G181-09 Altri ruoli | meccanica | alto | 6-10 | alto | non trovato |
| G181-10 Rivale | meccanica | alto | 2-3 | medio | sì (curva di difficoltà) |
| G181-11 Studio dell'avversario | meccanica | medio | 2 | medio | da confermare |
| G181-12 Popolarità a gradini | carriera | medio-alto | 2-3 | medio | no |
| G181-13 Soldi con uno scopo | carriera | alto | 3-4 | medio | sì (economia) |
| G181-14 Sfide a metà carriera | carriera | medio-alto | 2 | basso | no |
| G181-15 Le tue leggende | carriera | alto | 2 | basso | no |
| G181-16 Filo del paese | carriera | medio-alto | 2 | basso | sì (impulsi con memoria) |
| G181-17 Lotta salvezza | carriera | medio | 2 | basso | no |
| G181-18 Bentornato | ritorno | medio | 1-2 | basso | no |
| G181-19 Cartolina | ritorno | alto | 2 | basso | no |
| G181-20 Album | ritorno | alto | 3 | basso | no |
| G181-21 Sfida del giorno | ritorno | medio-alto | 3-4 | medio | no |
| G181-22 Opzioni e primo impatto | accessibilità, store | medio | 1+1+2 | basso-medio | sì in parte (tempo di scelta, tutorial) |

Totale stimato se si facesse tutto: 41-52 giri. Le sette migliorie rapide insieme: 7-8 giri.

## 4. Cosa non ho verificato

- Nessuna prova su telefono vero: tempi, fluidità e audio sono presi in headless.
- Non ho ascoltato l'audio.
- Difficoltà e bilanciamento: il pilota sceglieva a rotazione. Gli 0 gol in 5 partite dal vivo non dicono nulla sul gioco in mano a una persona.
- Non ho giocato Nazionale, coppe europee, mercato estivo, infortuni, ritiro e fine carriera: per questi mi appoggio a mappa di gioco, BACKLOG e rapporti dei giri 153, 156, 157, 163, 164, 170, 170b.
- Il salvataggio di stagione 12 può non rappresentare una carriera tipica.
- I costi in giri sono stime mie, non preventivi.

## 5. Fonti

- Gioco: build da `node tools/build-src.mjs` (file identico al versionato), 49 foto in `docs/collaudo/giro181/` (`-tel` = telefono 375 px, `-pc` = PC 1366 px).
- Salvataggi di prova: `tests/visual/fixtures/save-190-s12-ovr93.json`, `save-c177-s5w20.json`.
- Governo: `docs/governo/BACKLOG.md` (ultima voce PO-366), `DECISIONI.md`, `ROADMAP.md`, `MAPPA_GIOCO.md`, `ARCHITETTURA.md`, `RISCHI.md`, `USCITA-STORE-184.md`.
- Misure: `GIRO164-STAGIONE-PRO.md`, `GIRO170-SCENE-3D.md`, `GIRO170B-GESTI.md` (rami `collaudo/…`), `PRIMAVERA-153.md` (ramo `progetto/giro153-primavera`), `docs/sviluppo/RAPPORTO-giro163.md`, `docs/collaudo/GIRO156-MISURA-SIMULATE.md`, `GIRO157-SIMULATE-SQUADRA.md`.
