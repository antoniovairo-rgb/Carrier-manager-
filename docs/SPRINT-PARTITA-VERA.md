# SPRINT «PARTITA VERA» — piano operativo

> ⚠️ **SUPERATO (28/08)** — direttiva PO: la missione «partita vera» come simulazione completa
> è dichiarata FALLITA e abbandonata. La strategia attiva è in
> **`ROADMAP-PARTITA-NARRATIVA.md`** (partita narrativa credibile: cronaca → azioni salienti →
> highlights dell'eroe). Questo documento resta come archivio dell'audit e delle misure.

Direttiva PO (26/08, priorità assoluta): la partita deve essere riconoscibile, causale, credibile.
Criterio d'accettazione: *«sto guardando una partita di calcio»* — non «gli eventi esistono», ma
gli eventi formano una partita, collegati causalmente.

## L'audit (5 domini, con riferimenti al sorgente)

Cinque analisi indipendenti (motore/possesso, pallone/traiettorie, cronaca, highlights,
test/realismo) hanno mappato dove la catena causale si rompe. I cinque punti portanti:

1. **Il turno di possesso non aveva un padrone.** Sei siti scrivevano `possTurnRef`, uno solo
   causale; il cuore era una ri-estrazione Bernoulli a orologio che poteva revocare un recupero
   narrato il tick dopo (i flip causali non azzeravano lo spell); lo spell correva anche a palla
   ferma. Le interruzioni e gli esiti di scena conoscevano il proprietario e non lo scrivevano.
   → **Chiuso il primo pezzo col 7.616** (writer unico + cause; misurato 90% causali).
2. **Il pallone non ha un padrone nel 3D.** «In `playing` nessun sistema possiede la palla»
   (nota 7.523, src/12 r.~5361): l'elezione del portatore è confinata a `playing`, in ritardo di
   un frame, e dipende dalla prossimità; l'handoff esiste solo a fine arco; nessuna collisione
   palla↔giocatore in tutto il renderer; il portiere non tocca mai il pallone; nessuna seconda
   palla; nessun avversario nel build-up.
3. **La tabella della cronaca comanda tutto e sa niente.** 223/223 righe muovono pallone e
   schieramento; 107 non affermano alcun fatto; 86% dei `bpos` è centrale (55% y=50 esatto) — la
   centralità nasce nel repertorio; i nomi sono inventati a valle (salvo marcatore e catena); due
   anelli chiusi: testo→turno→fase→ritmo, testo→statistiche→momentum→pesca.
4. **Il piano visibile e il piano che conta sono disgiunti.** Le recite non segnano mai (i gol
   sono monopolio del microsim, src/14 r.~2516); censimento eventi reali: 8 macchine vere, 6
   semi (roll + resa), 7 solo-testo, 3 assenti (vantaggio, controllo imperfetto, fuorigioco);
   i cartellini sono spenti sotto test.
5. **Gli highlights inquadrano un tipo indovinato.** `hlType` è dedotto dalla zona per tutta la
   lettura e cambia al frame dell'esito; il testo d'esito può precedere il tiro (timer reali vs
   clock di scena); in regia scrivono ~15 mani ma il censimento ne conta 9; la taglia di
   produzione (mediana ~0,136) è sotto la soglia di leggibilità dichiarata (0,15).

## Le fasi (nell'ordine di priorità del PO)

- **Fase A — Il motore del possesso causale.**
  A1 ✅ (7.616) turno: writer unico + cause vere + spell sospeso a palla ferma.
  A3 ✅ (7.617) risoluzioni contropiede/piazzati passano il turno (causali 100%).
  ✅ (7.618) la palla vagante ha un raccoglitore · ✅ (7.621) la scena nasce dov'era diretto il gioco.
  A2 il PADRONE del pallone come decisione persistente (elezione fuori da `playing`, niente
     prossimità nei requisiti, «chi ha calciato» resta padrone fino all'handoff).
  A3 cambi di possesso causali restanti: risoluzioni contropiede/piazzati, errore del passaggio
     della trama (palla su erba vuota = palla persa con contendente), righe possesso-avversario
     (il repertorio è 27:2 a favore di casa).
  A4 ricezione/controllo come stato (il passaggio non è un salto in un tick); duello con verdetto.
- **Fase B — Il verso.** La cronaca descrive i fatti del motore (l'interruttore `__CPM_INV579`
  esiste; si accende quando il motore regge il pallone). Repertorio: le 107 righe mute perdono il
  comando; famiglie di gesto (appoggio/verticalizzazione/filtrante oggi = 7% delle righe).
- **Fase C — Tattica e eventi veri.** ✅ (7.628) arbitro ambientale: fischi 2→8-10/90', fallo
  tattico sul contropiede. ✅ (7.629) rigore causale (fallo in area = rigore, pen_for/pen_against,
  esito mai-gol dichiarato) + **scoperta strutturale**: la scadenza 5s del 7.602 su `spRef`
  affamava OGNI recita piazzata (righe ogni 10-20s reali) — radice misurata dello «ZERO schemi,
  punizioni, rigori» del PO; ora la scadenza conta l'inattività per passo (valvola 30s), la palla
  si tiene al punto della cerimonia, e la cerimonia armata ha precedenza sul pendingGoal (garanzia
  d'ordine: spRef mai armabile sopra un pendingGoal). Restano: rimesse/corner nel ritmo (legati ad
  ampiezza), falli 8-10 vs banda 20-30, vantaggio, mischie, cartellini sotto collaudo, rigore-che-
  segna via instradamento microsim (grande, da progettare).
- **Fase D — Highlights leggibili.** `hlType` vero anche in lettura; reveal sul clock di scena;
  arbitro unico della regia (le mani non censite entrano nel censimento); ramo catena con stacco.

## I metri d'accettazione (automatici, per ogni release dello sprint)

| metro | avvio sprint | dopo 7.615-7.622 | obiettivo |
|---|---|---|---|
| scritture del turno causali (`__CPM_TURN616`) | non misurabile | **100%** (orologio 0) | ≥85% stabile |
| pallone senza padrone (scrittori-601: ws 3+0) | 26% | 26% (A2 revocato: il difetto è l'anagrafe) | →0 (A2 redesign) |
| gol con manovra alle spalle | **0/5** | **3/8** (catena aperta in costruzione, recite=registro) | tutti i gol ambientali |
| fasce (corridoio centrale) | 78% | 63-77% (balla; scene-birth clampata nel 7.621) | ≤40% |
| catena schemi (righe/passata) | 0 | 16 (con recita durante pendingGoal) | apre attorno a OGNI gol |
| nascita scena dal gioco (fuori zona, mediana) | 38u (sorteggio) | **26,5u** (clamp = minimo geometrico) | ≈bordo zona |

Revoche misurate del giorno (il verso NON è la leva): inversione intera 7.579 (2ª misura),
metà-muta 7.621, trasporto A2 (43→33%). Prossimi bersagli nominati dai numeri: secondo passo
della catena nel finale (steps0 10/21), anagrafe del possesso (elezione ancorata al logico),
startZone laterali delle scene (80% centrali), cartellini sotto collaudo.

Regole invariate: zero regressioni su carriera/salvataggi/classifiche/mercato; rituale 7 passi +
career-critical verdi a ogni release; ogni rimedio col suo rosso e la sua misura prima/dopo;
niente architetture parallele.


## DECISIONE STRATEGICA (28/08, direttiva PO «fermatevi e valutate») — SI SCEGLIE B, NELLA FORMA INCREMENTALE

Analisi tecnica eseguita da 5 letture indipendenti del codice (workflow, evidenze con file:riga).
Risposte alle domande della direttiva:

1. **Architettura reale**: clock per-minuto attivo solo in `playing`; highlight a calendario
   seedato ma ri-pescati col contesto vivo; gol non-eroe = monopolio di `bgMicroTick` (input:
   prestigio/momentum/possesso/OVR — **zero tattica**); cronaca = pesca pesata + 7 macchine in
   precedenza fissa; palla = lerp 0,65/tick verso un bersaglio scritto da **31 mani** (24 siti
   diretti + 7 mutazioni).
2. **Casualità**: quasi tutta seedata e replay-safe; gli esiti sono in maggioranza derivati dallo
   stato. MA il possesso evolve a lotteria: turno «orologio» (Bernoulli a fine spell) pesato su
   una % di possesso che è un **random-walk ±2** (r.3524) — non una misura del gioco.
3. **Stato della partita**: esiste ed è buono (turno a writer unico con causa, fermo/out/sp/
   counter/pendingGoal/catena).
4. **Possesso vero**: di squadra sì; **il portatore individuale NO** — è una deduzione per-tick, e
   il codice stesso dichiara (r.4127) che la palla ambientale è più veloce di un uomo: la custodia
   è impossibile per costruzione.
5. **Concatenazione causale**: parziale. Il verso portante resta invertito: il microsim decide il
   gol PRIMA, la costruzione lo mette in scena (esito→racconto). Le macchine sono causali, il cuore no.
6. **Ruoli individuali**: NO. I 21 di sfondo non hanno campo `role`; slot per indice; i ruoli del
   roster servono solo a scegliere i cognomi in cronaca. `FORMATION_HOME` è dead code.
7. **Tattiche**: mordono solo la trama (4 pomelli per modulo, veri) e ±4u di linea; **mai il
   punteggio**.
8. **Conseguenze**: parziali (gialli→rosso reali, reazioni al gol) ma i gol non dipendono dal
   gioco che si vede.
9. **Lavoro per A**: 26 release in 2 giorni hanno portato metriche in banda (turno causale 100%,
   arbitro, catena 14-20 righe, gol in area) ma la percezione PO resta «non è calcio»: il difetto
   è il VERSO e l'assenza di portatore/ruoli — non si tara via, si rifonda.
10. **Lavoro per B**: più piccolo del temuto. Il renderer è GIÀ disaccoppiato (0 scritture di
    stato in src/12); il turno è già canalizzato (setTurn616); pendingGoal/counter sono isolati
    (2-3 siti); da sostituire ~59 siti in UN solo file. Le macchine esistenti (arbitro, piazzati,
    catena, ponte) diventano braccia del motore, non si buttano.
11. **Probabilità entro deadline**: B-incrementale > A. A ha dimostrato convergenza asintotica.

### Il piano operativo (B in 3 fasi, rossi e guardiano a ogni tappa)

**F1 — MATCH ENGINE, il possesso diventa azione (3-4 giorni)**
- `engineTick()`: UNICO scrittore di ballTarget (pattern setTurn616, già provato) — i 31 siti
  diventano richieste al motore.
- Stato AZIONE: {lato, **portatore persistente (id)**, ricevente, fase, passi}; passaggio =
  evento portatore→ricevente scelto per **ruolo** (campo `role` sui 21, dal roster che già lo ha);
  velocità palla ≤ uomo salvo lanci dichiarati.
- Il turno cambia SOLO per eventi (contrasto, intercetto, fallo, fuori, parata): il sito
  «orologio» muore; la % di possesso diventa una MISURA (tempo col turno), il random-walk muore.
- **Il microsim resta l'autorità del PUNTEGGIO** (integrità carriera/save intoccata): i suoi gol
  diventano un BUDGET — «al minuto X segna il lato Y» — e il motore COSTRUISCE l'azione che ci
  arriva (pendingGoal si evolve in «azione a esito noto» con portatori e passaggi veri).
  Transizioni/pressing: pressure → distanza d'ingaggio del lato senza palla.
- Tattiche: i 4 pomelli TRAMA_ID entrano nelle decisioni del motore (già pronti).

**Stato F1 al 28/08 (7.641-7.644)**: anagrafe ruoli (`rl`) sui 21 ✅ · portatore persistente
(`carrierRef`, elezione all'arrivo per-tick, sosta di ricezione, coda consegne) ✅ · budget-gol:
fotografia completa (golback644b): 4 gol su 10 senza racconto del lato → 7.644 (righeLato, rete
che aspetta il racconto del SUO lato, costruttore catena condiviso chiamato all'armamento) → 3/10.
I 3 restanti hanno cause nominate: (a) gol sovrapposti a costruzione pendente si applicano diretti
(bypass r.2433) e calpestano la costruzione — LA PROSSIMA VITE (coda dei gol, un'azione alla
volta); (b) gol da highlight: genere a parte, mai dal pendingGoal; (c) cadenza cronaca ~1 riga
ogni 5-8 minuti di gioco: metro da spostare sulla costruzione intera. Buco latente CENSITO, da
misurare prima di toccare: il fischio del 90' non svuota `pendingGoalRef` (r.2132) — costruzione
viva al fischio = gol perso dal tabellone.

**F2 — NARRATIVE, la cronaca campiona il motore (1-2 giorni)**
- Le righe raccontano gli EVENTI importanti del motore (il tetto-racconto dell'arbitro è già
  questo pattern); le 223 righe diventano template con slot; niente riga che comanda il campo:
  il sito ev.bpos→ballTarget muore con F1.

**F3 — HIGHLIGHTS dal motore (1-2 giorni)**
- Gli HL nascono da stati del motore (transizione, rifinitura, piazzato) col calendario come
  fallback di ritmo; il 3D consuma gli stessi eventi (è già solo-lettura).

Non-scope confermato per sempre: VAR, replay, autogol, allenamento.
Build «partita credibile» da collaudo pieno: attesa ~5/09, dentro la deadline.
