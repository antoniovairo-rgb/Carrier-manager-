# Rapporto giro 163 — Primavera F (Indice) + 3 (avanti veloce)

**PO-356 · progetto `docs/progetto/PRIMAVERA-153.md` (ramo `progetto/giro153-primavera`) · versione di destinazione 7.999.191**
Ramo `sviluppo/giro163-primavera-f3`, base `lavoro/190` (4f9363a). `GAME_VERSION` **non toccata** (7.999.190 nel file).
`SAVE_VERSION` resta 9: **nessun campo nuovo nel salvataggio** (la barra è calcolata al volo, il tasto vive solo in memoria).
Commit: `015dc61` (F + 3), `e9a15cb` (correzione saga di mercato misurata dal guardiano). Build: `check-src` identico byte per byte.

Ordine approvato dal PO: F → 3 → 4a → 1 → 2 → 4c → 4b. Questo giro fa **solo F e 3**.

---

## F — Indice Primavera

**Cosa c'è.** `indicePrimavera(p)` in `src/08` (in fondo): funzione **pura**, nessuna scrittura, valore 0-100 con i pesi
del progetto §3 — 35% voto medio ultime 5 di Primavera (5,0→0 · 8,0→100) · 25% (gol + assist·0,6)/partita ultime 10, tetto
per ruolo (attacco 0,7 · centrocampo 0,45 · difesa 0,2) · 15% forma (30→0 · 95→100) · 15% fiducia del mister · 10% OVR
contro la prima squadra (`ovr − (prestigio club madre − 20)`, −10→0 · +10→100). Si giudica dalla **6ª partita di lega della
stagione**; coppa, Nazionale, squalifiche, non convocazioni, infortuni e altre stagioni non contano. Fuori dalla Primavera vale `null`.

**Sulla home** (solo Primavera): card «Corsa alla prima squadra» sopra la «Prossima», barra a **5 tacche, mai il numero**
(`data-cpm="ip163"`). Prima della 6ª partita: tacche spente e «Ti giudicano dalla 6ª partita · Partite di Primavera giocate: k su 6».
Etichette delle tacche: «Ti stanno guardando» · «Sei nei loro appunti» · «Si parla di te» · «Sei a un passo» · «La prima squadra
ti aspetta» (la prima e l'ultima sono del progetto, **le tre centrali le ho scritte io**: da confermare dal PO).

**Rosso:** `__CPM_NO_IP153` (barra assente). **Guardiano:** `npm run indice-163`.

| Braccio | Esito |
|---|---|
| verde (build e9a15cb) | 23/23, uscita 0 |
| rosso `__CPM_NO_IP153` | 3 rossi (barra assente a 412 e 1280, barra sotto le 6 partite), uscita 1 |

Cosa giudica: null fuori dalla Primavera · non pronto a 5 partite, pronto a 6 · estremi 0 e 100 · monotona sul voto (6,0 → 34,
7,6 → 53) · filtri (coppa/Nazionale/squalifica/altra stagione) · deterministica · pura (salvataggio identico) · a 412×915 e
1280×800: barra presente, tacca = funzione, etichetta giusta, il numero non compare, nessuno scorrimento orizzontale, nessun
errore · professionista: niente card. In più `test:logic` ha 8 test nuovi sulla funzione estratta dal sorgente
(`test/logic/indice-primavera-163.test.mjs`), compreso il valore atteso ricalcolato dai pesi.

⚠️ I pesi **non sono tarati**: sono la proposta del progetto. La taratura con la sonda (§12 del progetto) non è in questo giro.

---

## 3 — «Vai al prossimo momento importante»

**Cosa fa.** Tasto nella stessa card, **solo in Primavera** (decisione PO D6). Primo tocco: **pannello di conferma** che dice
cosa farà e mostra la prossima partita chiave secondo la classifica di oggi («Con la classifica di oggi: 2 partite simulate,
poi 🔴 Derby … contro FC Valmora Primavera (sett. 3)»), con «Vai» e «Annulla». Nessuna partita si simula senza quel «Vai».

Durante la corsa: un passo per render (~0,3 s), **sempre su un percorso vero** come il tasto principale — `liveCurrentWeek`,
poi prompt della partita e `simulateAndAdvance` dallo **stesso prompt** (stessa decisione del mister, stesso «non convocato»
di PO-222), oppure `doAdvanceWeek`. Non è un quarto percorso: `tripath-chokepoint` verde senza modifiche. Tasto «Ferma».
Alla fine un riepilogo: dove si è fermato e perché, settimane, partite V/N/P, gol, assist, le scelte fatte da solo.

**Si ferma su** (decisione PO D5: «solo sui momenti importanti — partite chiave, chiamate, mercato»):
- **partita chiave** = la regola del riquadro «Prossima» della home: derby · scontro al vertice (entrambe fra le prime 3) ·
  sfida a una delle prime 3; più ogni gara non di campionato. Le posizioni contano solo con almeno un punto in classifica.
  Funzione pura `partitaChiave163` in `src/08`. Alla fermata **resta aperto il prompt Gioca/Simula** e la gara non è giocata;
- **mercato**: offerta, trattativa, primo incontro col procuratore, impulsi di mercato; saga di mercato e controllo del
  procuratore **una volta per settimana** (vedi correzione sotto);
- **chiamate**: convocazione e tornei della Nazionale;
- **fine stagione** (settimana 39), **infortunio nuovo**, **cambio schermata**, **nessun progresso** (14 passi fermi);
- finestre che il tasto non sa chiudere da solo: **intervista settimanale** (4% delle settimane in Primavera), momenti di
  carriera, traguardi, impulsi «primo pro»/«addio».

**Impulsi di routine** (tutti gli altri, compresi spogliatoio ed eventi): non fermano. Gli eventi senza scelta si chiudono
(l'effetto è già applicato dal gioco); per quelli con scelta la scelta si estrae **seedata** come §3 del progetto
(`hashStr("ps153|scelta|"+nome+"|"+stagione+"|"+settimana+"|"+impulso)`, mai `Math.random`) fra le scelte che il conto
permette, con lo stesso gestore del bottone (`handleImpulseChoice`); il riepilogo le elenca.

**Rosso:** `__CPM_NO_SALTA153` (tasto assente). **Guardiano:** `npm run salta-163`.

| Braccio | Esito |
|---|---|
| verde (build e9a15cb) | 19/19, uscita 0 |
| rosso `__CPM_NO_SALTA153` | 2 rossi (tasto assente), uscita 1 |

Cosa giudica: il primo tocco **chiede** e non cambia nulla; «Annulla» non cambia nulla · stagione intera col solo tasto: ogni
gara simulata dal tasto era **non chiave** nell'istante (testimone `__CPM_SALTA153_SIM`, 0 chiave su 28) · ogni fermata
«partita chiave» lascia il prompt aperto con la gara non giocata (6/6) · fine stagione a W39 con **34 gare di lega, una per
settimana, calendario 34/34, classifica a 18** e nessun errore · un'offerta durante la corsa la ferma (mercato) · saga già
consegnata: nessuna fermata; saga con card: una fermata nella sua settimana e non riferma subito · «Ferma» · da professionista
il tasto non c'è.

**Tocchi per finire la Primavera** (misura dichiarata, non giudicata; obiettivo del progetto: da 39 a ≤ 12):

| Giro del guardiano | Tocchi | Corse del tasto | Fermate |
|---|---|---|---|
| 1 | 17 | 6 | 5 partite chiave, 1 fine stagione |
| 2 (prima della correzione) | 90 | 31 | 7 chiave, 22 mercato, 1 intervista |
| 3 | 35 | 12 | 7 chiave, 2 intervista, 2 mercato, 1 fine stagione |
| 4 (build definitivo) | 29 | 10 | 6 chiave, 2 intervista, 1 mercato, 1 fine stagione |

I tocchi contano: tasto + «Vai» per ogni corsa, più la scelta (Simula) a ogni partita chiave e la chiusura di ogni finestra.
Il conto varia fra giri perché mercato, interviste e impulsi del gioco usano `Math.random` (non toccato in questo giro).
**L'obiettivo «≤ 12» non è raggiunto** con questa regola: le partite chiave sono 5-7 a stagione e ognuna costa 3 tocchi.
Non ho cambiato la regola: è una scelta del PO (vedi domande).

### Due difetti trovati dal guardiano e corretti (misura → correzione → rimisura)
1. **Gli impulsi «esordio» fermavano la corsa 6 volte in 23 settimane** (wi_es_bar, autografo, muretto, busta, prof, canzone):
   nel catalogo hanno `mile:true`, ma sono la famiglia di routine della prima stagione. Contro la decisione D5 → non fermano
   più (si scelgono da soli). Dopo: 0 fermate «momento importante».
2. **La saga di mercato fermava la corsa 76 volte di fila** (giro 2): una saga già consegnata (`delivered:true`) o di un'altra
   stagione resta in `player.transferSaga` **senza** card sulla home, e il tasto la leggeva come mercato aperto. Ora valgono
   le condizioni della card della home, e gli stati che restano nel salvataggio (saga, procuratore) fermano **una volta per
   settimana**. Il guardiano provoca i due casi dalla sonda (il gioco li produce solo a volte, il mercato è casuale).

---

## Catena (build `e9a15cb`, un controllo alla volta, `CPM_CI_PAR=0`, memoria e disco letti prima di ognuno)

Memoria libera fra 14.161 e 14.472 MB, disco libero 29 GB in tutti i passi.

| Controllo | Esito |
|---|---|
| test:logic | 51/51 |
| tripath-chokepoint | PASS (3 percorsi, tutti i chokepoint) |
| save-compat | 12/12 |
| career-invariants | verde |
| stab-nat-trigger | verde |
| career-sim | verde (2 stagioni) |
| career-critical (11 passi, uno alla volta) | 11/11 verdi: recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera |
| design-system | SISTEMA GRAFICO OK |
| griglia-mobile | uscita 0, misura completa 14 schermate × 5 larghezze (214 s) |
| indice-163 | verde 23/23 · rosso 3 rossi (uscita 1) |
| salta-163 | verde 19/19 · rosso 2 rossi (uscita 1) |

Nota onesta: una prima corsa di griglia-mobile sul build definitivo l'ho fermata io con un tetto di 200 s (uscita 124, **non
giudicata**); l'ho rifatta intera: verde. La stessa catena era già stata verde anche sul build precedente (015dc61).
Gli scatti di griglia-mobile in `docs/collaudo-grafico/g0/` sono stati riportati com'erano (non fanno parte del giro).

I due guardiani sono registrati in `package.json` e in `ci-runner.mjs` (catena `carriera` e MAPPA di `src/18` e `src/0[0-8]`).

## Foto (`docs/sviluppo/foto-giro163/`, scala 2)
- telefono 412×915: `home-telefono.png` (barra a 4 tacche + tasto sopra la «Prossima»), `corsa-telefono.png`,
  `conferma-telefono.png` (pannello con la proiezione), `corsa-telefono-in-corsa.png`, `riepilogo-telefono.png`;
- PC 1280×800: `home-pc.png`, `tasto-pc.png`, `conferma-pc.png`, `riepilogo-pc.png` («Fermato da te»).
  (`*-schermo.png` = schermo intero.)

## Fuori ambito (non fatto)
Taratura dei pesi dell'IP con la sonda · idee 4a, 1, 2, 4c, 4b · riga di roadmap e bump di versione (li fa la sessione di
rilascio della 191) · il `Math.random` del mercato Primavera (§1.4 del progetto, idea 2).

## Domande per il PO (nessuna decisa qui)
1. **Partite chiave**: ho usato la regola già sulla home (derby, vertice, sfida alle prime 3). Con questa una stagione costa
   ~29-35 tocchi, non ≤ 12. Restringerla (es. solo derby e scontri al vertice) o lasciarla?
2. **Intervista settimanale** (4% delle settimane in Primavera): oggi ferma la corsa. Rispondere da soli come per gli impulsi?
3. **Saga di mercato**: ferma una volta per settimana finché la sua card resta sulla home. Va bene, o una volta sola per saga?
4. **Scelta automatica degli impulsi**: estrazione seedata fra le scelte possibili. Il progetto proponeva «col tono
   dell'archetipo», che oggi non esiste come regola: va definito?
5. **Impulsi «esordio»** (`mile:true`): ora si scelgono da soli. Devono invece fermare?
6. Le tre etichette centrali della barra.
