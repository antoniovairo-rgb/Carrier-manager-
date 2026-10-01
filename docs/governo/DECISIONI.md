# Registro delle decisioni

Ogni scelta di progetto importante: data, decisione, motivo, alternative scartate, voce collegata.
Le decisioni del PO non si richiedono e non si contraddicono: per cambiarle serve una nuova decisione del PO.

| Data | Decisione | Chi | Motivo / note | Alternative scartate |
|---|---|---|---|---|
| 29/07/2026 | Le verifiche percettive (foto di gesti, pose, scene) si fanno **con i corpi GLB accesi** | PO | 26 bocciature nate da verifiche con GLB spento | verifiche GLB-off |
| 16/09/2026 | Il motore della partita segue `docs/REAL-MATCH-ENGINE.md` (20 punti del PO) | PO | simulazione vera, highlight che rappresenta ciò che il motore ha deciso | highlight scriptati |
| 16/09/2026 | Ogni release scrive la sua riga di roadmap | PO | nessuna release non dichiarata | — |
| 22/09/2026 | La catena di test si sceglie in base a cosa si è toccato (solo grafica → catena grafica) | PO | il gate completo non trova niente sulle modifiche di soli pixel | gate completo sempre |
| 09/2026 (7.901) | Nella scelta dell'azione **niente percentuali di riuscita**: rischio cieco | PO | le percentuali condizionavano il giocatore | pallini/percentuali colorate |
| — | **Difficoltà unica**: nessun selettore, né ora né in futuro | PO | ribadita nel prompt «carriera fuori dal campo» del 30/09 | selettore facile/normale/difficile |
| — | Restano **partita 2D + highlight 3D** | PO | vincolo fermo nei prompt del 30/09 | partita tutta 3D |
| — | **Niente stile FIFA** | PO | citata nel prompt «governo del progetto» del 30/09 | — |
| — | Non si usano le credenziali Adobe del PO | PO | — | — |
| 30/09/2026 | **Brain unico**: la probabilità della giocata dell'eroe la calcola solo il motore (`probEroe`) | PO (questionario) | «deve essere l'unico cervello / motore del gioco» — fatto in 7.999.82 | succRate + moltiplicatore q |
| 30/09/2026 | Goleade: **realismo da serie A** (eroe forte 0,6–0,9 gol a partita; scarto ≥4 in al massimo 5–6% delle partite; 5+ gol sotto il 3%) | PO (questionario) | — | tetto rigido ai gol |
| 30/09/2026 | Dopo il brain, **prima la grafica degli highlight (#94)** | PO (questionario) | fatto in 7.999.83 | — |
| 30/09/2026 | Cerimonie di squadra **diverse per competizione** (campionato, coppa, internazionale) | PO (questionario) | lavoro sul ramo `wip/cerimonie-differenziate`, sospeso: nel nuovo ordine le cerimonie sono al lotto 8 | stessa cerimonia per tutte |
| 30/09/2026 | Prossimo collaudo Codex: **difesa 3D su 7.999.82** | PO (questionario) | prompt `reports/codex/PROMPT-2026-09-30-collaudo-difesa-3d.md` | banco numeri goleade; entrambi |
| 30/09/2026 | **Codex solo collaudatore**, con direttive scritte dal team; scrive solo in `reports/codex/` e `tests/codex/`, pusha solo su rami `codex/…` | PO | — | Codex che modifica il gioco |
| 30/09/2026 | Dubbi del PO sempre con **questionario a scelta guidata** | PO | prompt governo, A10 | domande in prosa |
| 30/09/2026 | Governo del progetto: backlog unico, roadmap a lotti, un lotto alla volta, definizioni di pronto/fatto | PO | prompt governo, Parte A | — |
| 30/09/2026 | I file di governo stanno in `docs/governo/` (il `ROADMAP.md` alla radice è la roadmap tecnica LMQP e resta) | team | evitare di sovrascrivere un documento esistente | nuovo `ROADMAP.md` alla radice |
| 30/09/2026 | Salvataggi ed errori (Parti B e C, L3) **dopo L1**, come nell'ordine del PO | PO (questionario, PO-160) | — | prima di L1; in parallelo |
| 30/09/2026 | L1 si chiude solo con **tutte le 31 voci** aperte o parziali | PO (questionario, PO-160) | — | chiusura al rapporto Codex difesa 3D; solo note di taccuino |
| 30/09/2026 | Pulizia del progetto come **quota del 20% in ogni lotto**, non lotto dedicato | PO (questionario, PO-072) | — | lotto dedicato al 4° posto; entrambi |
| 30/09/2026 | Cerimonie diverse per competizione **sospese fino a L8** | PO (questionario, PO-150) | lavoro su `wip/cerimonie-differenziate` | chiuderle ora; dentro L3 |
| 01/10/2026 | Cadenza: **fino a 6 release al giorno** (non 2) | PO | «Le release giornaliere devono essere 6 e non 2!» | 2 al giorno (proposta del team) |
| 01/10/2026 | **Un solo file di roadmap**: `docs/governo/ROADMAP.md` (lotti in alto, registro delle release in fondo); archiviati `POC_ROADMAP.md`, `ROADMAP.md` alla radice, `MACRO-PIANO-2026-09.md`, `BACKLOG.md` alla radice | PO (questionario, PO-160) | «troppi file roadmap… faccio confusione» | due file con ruoli; solo archiviare i morti |
| 01/10/2026 | Cadenza: **nessun tetto al numero di release al giorno**; conta non perdere pezzi (ogni voce nel backlog, ogni release nel registro) | PO | «Di release tendenzialmente puoi farne quante ne vuoi, l'importante è non perderti pezzi» — sostituisce il tetto di 6 | tetto 6 al giorno |
