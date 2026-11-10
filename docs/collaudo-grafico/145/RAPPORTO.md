# Giro 145 — tre strumenti: `contatto-103`, `griglia-mobile`, `partita-vera`

Ramo `collaudo/giro145-strumenti` (da `collaudo/giro138-strumenti`, che contiene il giro 138). Build di gioco **7.999.188**
(`GAME_VERSION` non toccato). Un controllo alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, memoria e disco controllati prima di
ogni corsa (13,5-14,5 GB liberi, 29 GB di disco: mai sotto). Corse oltre i 10 minuti in sottofondo, attese in primo piano sul log.

| strumento | ticket | misura prima | causa | dopo | esito |
|---|---|---|---|---|---|
| `contatto-103` | PO-319 | (giro 138) rosso max 5,5 contro soglia 6, «il difetto non si vede», uscita 1 | geometria naturale delle parate: il portiere è quasi in linea col pallone, il difetto D3 resta sotto 6 | gancio di prova `__CPM_G145GEO` (solo `?cpmtest=1`): 2 corse complete **uscita 0**, rosso 3 e 2 D3 (7,0-8,8) | chiuso |
| `griglia-mobile` | PO-344 | su questo ramo **uscita 0**, prepartita misurata (iniezione del giro 138) | **salvataggio di prova** + catena di bonifica del gioco (sotto) | causa stampata a ogni corsa; 2 corse **uscita 0**; rosso dello strumento **uscita 1** | chiuso (con un'osservazione per il PO) |
| `partita-vera` | PO-344 | uscita 0 con «tabellone non giudicabile … 0 partite» (riprodotto) | **strumento**: legge `__CPM_MS()`, che vale sempre null | tabellone giudicato 0-3 = 0-3 su 2 partite finite, uscita 0; due rossi **uscita 1** | chiuso |

---

## 1 · `contatto-103` (PO-319) — gancio di prova nel gioco

**Decisione della sessione madre** applicata: gancio nel gioco attivo solo sotto `?cpmtest=1`, soglia 6 invariata.

**Il gancio (`src/12-three-match-view.jsx`, ramo `assist_shot` col tiro del compagno parato).** `window.__CPM_G145GEO` (1 = scarto
20 unità, oppure il numero): al primo fotogramma del volo il portiere avversario si mette di lato al pallone, dalla parte del
centro, e ci resta per tutto il volo; il tuffo parte sul posto (`_diveToZ` = posizione attuale); alla respinta la geometria si
libera. Testimone `window.__CPM_G145W {n, scene}`. È la geometria in cui il difetto di `__CPM_NO_G103D` (z che converge a 2,2
invece di 3,2 e respinta a u 0,72 dovunque sia il pallone) si manifesta; col gioco corretto la z converge a 3,2 e la respinta
aspetta il contatto (entro 2,5) o la fine del volo.

**Il gioco fuori da cpmtest è identico.** Le tre aggiunte sono tutte dietro `_CPM_TEST` (`?cpmtest=1`, falso anche nella build
store per `__CPM_STORE_BUILD`): un blocco nuovo, una riga dopo l'armamento del tuffo, un azzeramento alla respinta. Nessun'altra
riga cambia (`git diff` di `src/12`: +11 −2, le due righe tolte sono le stesse con l'aggiunta in coda). `node tools/build-src.mjs`
e `node tools/check-src.mjs`: «IDENTICO BYTE PER BYTE». Prove di non regressione (gancio **spento**, il gate non lo accende):
`validate-situations` **14/14, fingerprint 00001505, 0 failure** (707 s); `highlight-95` completo (default, gancio spento): **uscita 0**, «✅ highlight-95 verde (e il rosso si vede)», ~95 min: verde 104 highlight, 14 parate giudicate, 0 non giudicabili, **difetti 0**; rosso 110 highlight con D1/D3/D4 visibili (7 D4 senza esito).

**Lo strumento (`contatto-103.mjs`, `highlight-95.mjs`).** `contatto-103` accende il gancio in **entrambi** i bracci (stessa
geometria, cambia solo il rimedio); `CPM_G145GEO=0` lo spegne, `CPM_G145GEO=<n>` cambia lo scarto. `highlight-95` passa il numero
(`CPM_G145GEO_N`) e stampa il testimone `[g145]`. Il comportamento di default di `highlight-95` non cambia (il gancio si accende
solo se `CPM_FLAG` lo contiene).

| corsa | verde | rosso | uscita |
|---|---|---|---|
| solo rosso (prova) | — | 4 parate, **2 D3**, distanze [2,1 · 5,1 · **7,1 · 8,8**], gancio su 3 voli | 1 (corsa parziale, come da script) |
| completa 1 | 4 parate, 0 difetti, [1,2 · 2,2 · 3,6 · 4,6] | 4 parate, **3 D3**, [0,1 · **7,0 · 7,5 · 8,5**] | **0** |
| completa 2 | 4 parate, 0 difetti, [0,2 · 2,2 · 3,3 · 5,1] | 4 parate, **2 D3**, [0,5 · 5,0 · **7,3 · 8,8**] | **0** |

Il rosso cade in tre esecuzioni su tre (D3 visibile, sempre sopra 6 di almeno 1,0).

⚠️ **Cosa cambia nel verde, detto chiaro.** Il verdetto resta lo stesso (0 difetti, 4 parate giudicate), ma con la geometria di
prova le distanze del verde salgono: massimo 4,6 e 5,1 contro il ≤3,1 del giro 138 senza gancio. Il margine del verde dalla
soglia 6 è quindi **0,9-1,4**: oggi tiene in due corse su due, ma è più stretto di prima. Non ho abbassato lo scarto per
allargarlo (non l'ho misurato con altri valori). Se il verde dovesse andare rosso su questo margine, la mossa è misurare con
`CPM_G145GEO=<n>` più piccolo, non toccare la soglia.

## 2 · `griglia-mobile` (PO-344) — perché `playMatch` non trova la partita

**Misura prima.** Su questo ramo (che contiene il giro 138) la sonda **esce 0** e la prepartita è misurata (giornata iniettata):
«prepartita misurata … ESITO uscita 0 · misura completa: 14 schermate x 5 larghezze». Il rosso del ticket («NON misurato:
prepartita: playMatch → nomatch», uscita 1) è quello della versione **senza** l'iniezione del giro 138, che **non è ancora su
`main`** (verificato: `collaudo/giro138-strumenti` non è antenato di `origin/main`, e `griglia-mobile.mjs` differisce di 64 righe).

**Causa misurata** (sonda di diagnosi su pagina nuova, salvataggio `lib/banco-g0.mjs`, lettura del salvataggio autoscritto dopo il
caricamento). **È il gioco che fa ciò che le sue regole dicono, su un salvataggio di prova incoerente:**
1. il salvataggio non ha calendario e dichiara **10 gare di lega nelle settimane 1..10 consecutive** (avversari diversi da quelli
   del calendario che il gioco genera), con la classifica a 10 giocate, alla settimana 11;
2. il gioco rigenera il calendario di FC Salernum S.12: c'è la **sosta alla settimana 9**, quindi la giornata 10 cade alla
   settimana 11 (contro FC Parmense);
3. la regola (H) di `_isStaleMd` (7.999.103: «la classifica conta più partite di quelle segnate in calendario ⇒ la giornata ≤ N è
   già contata») ritira le giornate 1..10 con la bonifica 7.418 (`played:true, healed418:true`, senza risultato);
4. `recuperaGiornateMancate` (7.999.103) **risimula** le giornate 1..9 delle settimane passate (healed418 senza risultato e
   nessuna voce di storico con stessa settimana e avversario) e le conta in classifica: **il club passa da 10 a 19 giocate**;
5. la giornata 10 (settimana 11, la corrente) resta «giocata» senza risultato ⇒ `getThisWeekMatchday` → nessuna gara ⇒ `nomatch`.

Misurato: voce della settimana 11 `{"md":10,"opp":"FC Parmense","played":true,"healed":true,"res":false}`, classifica del club
`played 19`, 9 voci `recupero103`. **Controprova** con 9 gare (tolta la settimana 9, classifica a 9): stesso esito, classifica a 18 —
la catena (3)-(4) scatta comunque, perché lo storico non combacia col calendario rigenerato.

**Correzione (solo `tests/visual/griglia-mobile.mjs`; il gioco non è toccato).** L'iniezione del giro 138 resta (è la via per
raggiungere la prepartita con lo stesso `playMatch` del giocatore); ora la sonda **stampa a ogni corsa** la voce della settimana
corrente e la classifica del club letti dal salvataggio autoscritto, e il messaggio finale dice la causa vera (prima diceva «il
calendario di prova non ha gare di campionato», che non era esatto). Nuovo braccio rosso dello strumento
`CPM_G145_SENZA_INIEZIONE=1`.

| corsa | uscita | ultima riga |
|---|---|---|
| prima (script del giro 138) | 0 | ESITO griglia-mobile: uscita 0 · MOTIVO misura completa: 14 schermate x 5 larghezze |
| dopo | 0 | idem, preceduta dalla voce `{"md":10,…,"giocateClassifica":19,"risimulate103":9}` |
| `CPM_G145_SENZA_INIEZIONE=1` | **1** | ESITO griglia-mobile: uscita 1 · MOTIVO non misurato (= rosso): prepartita: playMatch → nomatch |

Prepartita misurata: 0 px di overflow, 0 nodi sotto 11 px, 0/29 sotto soglia di contrasto, a tutte e 5 le larghezze.

**Osservazione per il PO (non corretta, non decisa).** La catena (3)→(4) conta due volte le stesse partite: la regola (H) ritira una
giornata *perché la classifica l'ha già contata*, e subito dopo il recupero 103 la *risimula e la conta di nuovo* (classifica a 19
giocate alla settimana 11 di un girone da 34). Il caso si presenta quando un salvataggio ha classifica non vuota e calendario
assente o rigenerato con uno storico che non combacia; **non posso confermare** se un salvataggio di un giocatore vero possa
arrivarci (i salvataggi normali hanno il calendario dall'inizio della stagione). Proposta: che il recupero 103 escluda le voci
ritirate dalla regola (H) nello stesso caricamento, o che la regola (H) non scatti su un calendario appena rigenerato. Ne
consegue anche che le schermate di classifica che `griglia-mobile` misura mostrano una classifica a 19 giocate: per la misura
grafica non cambia nulla, ma non è la carriera «coerente» che `banco-g0` voleva descrivere.

## 3 · `partita-vera` (PO-344) — tabellone giudicabile

**Misura prima** (script com'era, 2 partite): uscita 0, «non giudicabile (campione sotto minimo) tabellone — gol raccontati 0-3 ·
punteggio finale 0-0 su 0 partite».

**Causa (strumento).** Sonda di diagnosi su una partita con lo stesso autoplay, un campione ogni 20 s: la partita **arriva alla
fine** (`__CPM_PHASE` = `ended` fra 160 e 180 s), `__CPM_SCORE` dà il punteggio (0-1), ma **`__CPM_MS()` vale null in tutti i 16
campioni**. Il guardiano leggeva il punteggio finale solo da lì, quindi `SCORE` restava vuoto a ogni corsa e la banda non è mai
stata giudicata. Perché il Match State non venga scritto in questo flusso **non posso confermarlo** (la scrittura sta dentro il
blocco dell'aggiornamento delle formazioni, r.~4560-4578 di `src/15`; non l'ho seguito oltre).

**Correzione (solo `tests/visual/partita-vera-guardian.mjs`).**
- si **attende l'evento** «partita finita» (`__CPM_PHASE() === 'ended'`) invece di 12 x 20 s fissi; il libro mastro si svuota a
  blocchi di al più 20 s come prima, tetto 30 blocchi;
- il punteggio finale si legge da `__CPM_SCORE` (lo stesso `scoreRef` da cui il Match State prendeva `score.h/a`) e **solo a partita
  finita**; la riga del tabellone dice quante partite sono finite;
- tabellone non giudicabile = **rosso** (uscita 1); esito, braccio e motivo stampati per ultimi;
- prove del rosso dello strumento: `CPM_PV_ROSSO_TAB=1` (si tace un gol del libro mastro) e `CPM_PV_BLOCCHI=3` (partite che non
  arrivano alla fine). Il minimo (tutte le `PARTITE_G` partite) non è stato abbassato.

| corsa | tabellone | uscita | ultima riga |
|---|---|---|---|
| prima | non giudicabile, 0 partite | 0 | ✅ PARTITA-VERA OK |
| dopo | ✅ gol raccontati 0-3 · punteggio finale 0-3 su 2 partite (finite 2/2) | **0** | ESITO partita-vera: uscita 0 · BRACCIO verde · MOTIVO tutte le 12 bande giudicate e tenute |
| `CPM_PV_ROSSO_TAB=1` | ❌ 0-2 contro 0-3 | **1** | … MOTIVO violate: tabellone |
| `CPM_PV_BLOCCHI=3` | ❌ non giudicabile, finite 0/2 | **1** | … MOTIVO non giudicate (= rosso): tabellone |

⚠️ **Ambito.** La regola «non giudicato = rosso» è applicata alla sola banda del tabellone (quella chiesta e l'unica misurata non
giudicabile). Le altre bande col campione sotto minimo restano informative come prima e la riga lo dice («informativa»): nelle
corse verdi di questo giro nessuna lo era; con `CPM_PV_BLOCCHI=3` lo diventa `gol-del-simulatore`. Estenderla alle altre è una
decisione che non ho preso.

## Note di metodo e cosa NON ho verificato

- **Esecuzioni.** griglia-mobile: 1 prima + 1 dopo + 1 rosso (più 3 sonde di diagnosi del calendario). partita-vera: 1 prima + 1
  dopo + 2 rossi (più 1 sonda di diagnosi). contatto-103: 1 solo-rosso + 2 complete. Gate una volta e `highlight-95` completo una volta , sul build col gancio.
- **Durate** (macchina della sessione): griglia-mobile ~4 min; partita-vera ~6,5 min (prima e dopo); contatto-103 ~22-24 min la
  completa; `validate-situations` 707 s.
- **Non eseguito:** la catena completa (`ci-runner`), né gli altri guardiani che usano `highlight-95` o `banco-g0`. partita-vera
  dopo la correzione ha **una** corsa verde (più due rosse), non due.
- Le sonde di diagnosi stanno nella cartella di lavoro non versionata `tests/visual/.tmp145/` e non sono committate.
- Le corse di griglia-mobile hanno scritto in una cartella di lavoro (`CPM_OUT`), non in `docs/collaudo-grafico/g0/`.

## Sintesi

Tre strumenti su tre chiusi con verde + rosso che cade: `contatto-103` col gancio di prova `__CPM_G145GEO` nel gioco (solo
cpmtest; gate 14/14 fingerprint 00001505, `highlight-95` completo uscita 0), `griglia-mobile` con la causa vera del `nomatch` misurata e stampata (salvataggio di
prova + catena (H)→recupero 103 che conta due volte le stesse gare: osservazione per il PO), `partita-vera` col tabellone
finalmente giudicato a partite finite e il non giudicato che esce 1.
