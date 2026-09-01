# AUDIT DELL'ARCHITETTURA DELLA PARTITA — Fase 1 della Missione Definitiva
*(direttiva PO 01/09: «una sola realtà di gioco, una sola catena causale»; questo documento mappa
com'è OGGI, con riferimenti a file:riga; V = verificato sul sorgente, DV = da verificare)*

## 0. La diagnosi in una riga
Oggi la partita ha DUE realtà: il **microsim** decide il punteggio, e il **racconto** (righe di
cronaca + piani) decide cosa si vede — trascinandosi dietro pallone e corpi. La catena del PO
(stato→decisione→movimento→esito) esiste solo a frammenti; in molti punti è ROVESCIATA
(racconto→riposizionamento→gesto).

## 1. Il flusso della partita (fasi)
- `phase`: matchday → playing (cronaca) → scene eroe (hl/hl_choose/hl_result) → ended; rigori/cerimonia a parte. [DV: enumerazione completa]
- Tick logico: interval 300ms in live-match (deployment + cronaca); il renderer gira su rAF con
  dt di scena TAPPATO a 0,05s/fotogramma (12-three r.1849→ zona lerp) → sotto i 20fps il tempo
  di scena rallenta rispetto al reale. [V]
- In cronaca lo schermo mostra SOLO pallone+stadio (decisione PO 7.660); i corpi tornano nelle
  finestre salienti (7.689) e nelle scene eroe. [V]

## 2. Fonti che DECIDONO le azioni (oggi: quattro macchine concorrenti + microsim)
1. **Microsim** (punteggio, autorità intoccabile per regola PO): decide gol/tiri per squadra;
   seedato. Le altre macchine devono CONVERGERE sui suoi esiti. [V storico]
2. **Piano-gol** `_pianoGol649` (14-live ~3585): quando il microsim annuncia un gol, il racconto
   COSTRUISCE a ritroso 3-4 righe con bersagli fissi (x 62/66/64→92-94) e portatore nominato
   (`chi`). Le posizioni dei 22 NON entrano nella scelta: è sceneggiatura. [V]
3. **Piano-occasione** `_pianoOcc695` (14-live ~2885): 3 famiglie (mischia/tiro a giro/tu-per-tu),
   armate da: campo libero + adv≥48 + cooldown 8' + dado<72%. Il «pericolo» NON è misurato dallo
   stato: è un dado su una soglia di avanzata. È il punto che il §10 della missione condanna. [V]
4. **Catena/libreria/counter/ponte** (`_recKind546`: catena·libreria·counter·kickoff·ponte·scena,
   14-live ~3600-3700): righe di cronaca che RICOLLOCANO il pallone (bpos→bex con freno 30u
   7.498) e muovono il possesso. La riga decide, il campo si adegua. [V]
5. **Scene eroe** (situations/factory + `__CPM_FORCE_SIT`/`__CPM_RESOLVE`): catalogo di situazioni
   con azioni; l'esito passa da action/outcome. Motore SEPARATO da quello dei 22. [V]

## 3. Scrittori di POSSESSO e POSIZIONI (oggi: molti, in conflitto storico)
- **Posizioni logiche 22**: deployment ambiente (14-live ~2324, corsie _LN_* + respiro sin/cos +
  pressori 593 + contesa 706 + specchio GK 705); un SECONDO deployment a ~4587 (palle
  ferme/rientri). [V] Le corsie sono coreografia, non decisioni: nessun giocatore «sceglie».
- **Driver portieri**: TRE — logico away (2333, gain 0,35), logico home (2356, gain 0,10),
  renderer F13 (12-three ~4069, uscita in gioco aperto). Più il tuffo che scrive posizione
  (translation _diveToZ) da DUE siti in cronaca (5060 ambientale, 3755 `_ba` save). [V]
- **Pallone**: logico (ballPosRef, mosso dalle righe via bex col freno) e RESO (mesh, con
  elezione del padrone 7.555: fermo>portatore>eroe>inseguitore; glide 55u/s al piazzato 7.670).
  Due palle, convergenza misurata buona dopo i cerotti, ma due scritture. [V]
- **Mesh 22**: builder `_tg` del renderer (12-three ~3900-4260: forma+possesso, richiamo corsie,
  pressing, marcature PASS1b, staging HL, adapt) POI integratore con inerzia — firma dominante
  misurata: ritardo mesh←bersaglio 6,06u (stadio 2: 4,44u — reparto-592, 24.643 campioni). [V]
- **Possesso**: poss% (setPossession drift), possTurnRef (turni), righe con `poss`. [DV: chi è
  l'autorità del turno vs poss%]

## 4. Generatori di HIGHLIGHT
- Scene eroe: factory delle situations (catalogo per pattern: CROSS/SHOT/THROUGH/…),
  buildHLTimeline, fireConclusion (archi + reazioni GK). Attori scelti dal renderer al momento
  (nearest-mate ecc.), non dalla simulazione. [V]
- Salienti extra-eroe: le finestre dei piani (2-3), regia dedicata 689. Nascono dal racconto,
  non da un danger system. [V]

## 5. Generatori di TELECRONACA
- Le stesse macchine di §2 (catena/libreria/piani) producono il TESTO — cioè oggi telecronaca e
  «fatti» sono la STESSA COSA: la telecronaca non racconta, DECIDE. È l'inversione da sanare
  (§13 missione: narratore, non creatore). [V concettuale]
- Sottopancia com661 (7.696) per le finestre salienti. [V]

## 6. FOOTBALL STATE oggi — CENSITO [V 01/09]
- `sr.current.football` ha esattamente TRE riferimenti nel gioco: lo scrittore (12-three r.1826),
  il testimone di collaudo (r.1455) e UN consumatore (r.3908: `_fs.superiority` → moltiplicatore
  del pressing nel builder mesh; `_fs.attackingHome` x2). In 14-live-match: ZERO consumi — dove
  le azioni si decidono, il «cervello» non parla. [V grep]
- Contenuto attuale: t, phase, ball, possessor(held), attackingHome, nearBall{home,away},
  superiority, home/away shapes — 7 campi contro i 16 del Match State della missione (§1):
  mancano minuto/risultato, possesso ufficiale, ruoli/zone, pressione, marcature, linee, spazi,
  modulo, metodologia, atteggiamento, momentum, stato eroe, memoria eventi. [V r.1826-1829]
- FATTO ARCHITETTURALE CHIAVE: oggi il FS è derivato DALLE MESH nel renderer (posizioni rese) —
  cioè la vista osserva sé stessa. La missione lo vuole al tick LOGICO come sorgente. Il rovescio
  è totale, MA il quasi-vuoto di consumatori è una fortuna: la Fase 2 costruisce su tabula rasa,
  senza dover districare dipendenze. [V]
- Il Match State della missione è SPARSO: poss/momentum in live-match, marcature nel builder
  renderer, memoria inesistente. [V]

## 7. Duplicazioni e conflitti NOTI (dai verbali, tutti misurati)
- Due palle (logica/resa) · due deployment · tre driver GK + due siti di tuffo (doppio tuffo
  sulla stessa parata, 7.705) · due orologi (scena tappato vs reale: camera 7.708-revocato,
  clip GLB 7.709) · procedurale vs GLB (7.674: due corpi per lo stesso gesto) · attori delle
  scene scelti dal renderer vs portatore nominato dalle righe (elezione 7.555 come arbitro).
- Il mesh-lag 6,06u è il tetto fisico di ogni rimedio comportamentale (contesa 6u, 7.706).

## 8. Verso la source of truth (bozza, da raffinare in Fase 2)
- Il MATCH STATE unico vive in live-match al tick logico; il renderer diventa PURO ESECUTORE
  (posizioni/bersagli letti, mai decisi); le righe diventano NARRAZIONE di eventi già risolti;
  i piani 649/695 si spengono quando il danger system (§10 missione) sa nominare le vere
  occasioni dalla simulazione dei 22.
- Punteggio: resta al microsim (regola permanente PO); la simulazione dei 22 produce la STORIA
  che vi converge; conflitti eventuali → decisione PO con numeri.

## 9. Censimenti della Fase 1 — CHIUSI QUANTO BASTA PER COSTRUIRE (il documento resta vivo)
- [x] grep-census dei consumatori di Football State — FATTO, vedi §6.
- [ ] enumerazione fasi/phase machine completa.
- [x] autorità del possesso — FATTA: il TURNO ha gia' UN solo scrittore causale, setTurn616 (14-live r.1499: libro mastro cpmEv 'turn', 95-96% causale al guardiano, inviolabile sotto costruzione 7.646) — pietra della Fase 2 gia' posata; poss% e' statistica narrativa (drift clampato 20-80, 7 siti).
- [x] pallone logico — CONTATO: ballTargetRef 27 scrittori, ballPos/setBallPos ~14 siti (14-live). L'elezione del padrone vive nel RENDERER (7.555) — nel nuovo modello sale al tick logico.
- [x] situations: ~191 a catalogo (run-summary total 191); attori scelti dal renderer al momento (nearest-mate), non dalla simulazione — conferma §4.
