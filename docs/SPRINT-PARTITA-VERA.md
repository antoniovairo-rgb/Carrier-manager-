# SPRINT «PARTITA VERA» — piano operativo

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
  A2 il PADRONE del pallone come decisione persistente (elezione fuori da `playing`, niente
     prossimità nei requisiti, «chi ha calciato» resta padrone fino all'handoff).
  A3 cambi di possesso causali restanti: risoluzioni contropiede/piazzati, errore del passaggio
     della trama (palla su erba vuota = palla persa con contendente), righe possesso-avversario
     (il repertorio è 27:2 a favore di casa).
  A4 ricezione/controllo come stato (il passaggio non è un salto in un tick); duello con verdetto.
- **Fase B — Il verso.** La cronaca descrive i fatti del motore (l'interruttore `__CPM_INV579`
  esiste; si accende quando il motore regge il pallone). Repertorio: le 107 righe mute perdono il
  comando; famiglie di gesto (appoggio/verticalizzazione/filtrante oggi = 7% delle righe).
- **Fase C — Tattica e eventi veri.** Moduli/stili sulle decisioni della macchina; falli da
  contrasti, vantaggio, seconde palle ambientali, mischie; cartellini riabilitati sotto collaudo.
- **Fase D — Highlights leggibili.** `hlType` vero anche in lettura; reveal sul clock di scena;
  arbitro unico della regia (le mani non censite entrano nel censimento); ramo catena con stacco.

## I metri d'accettazione (automatici, per ogni release dello sprint)

| metro | oggi | obiettivo |
|---|---|---|
| scritture del turno causali (`__CPM_TURN616`) | **90%** (7.616) | ≥85% stabile |
| pallone senza padrone (scrittori-601: ws 3+0) | 26% | →0 (Fase A2) |
| gol con manovra alle spalle (manovra-615) | 0/5 | tutti i gol ambientali |
| fasce (fasce-600, corridoio centrale) | 63-67% | ≤40% |
| catena schemi (righe/passata) | 3 | apre attorno ai gol |
| interruzioni con ciclo completo causa→battuta→ripresa | non misurato | ≥90% |

Regole invariate: zero regressioni su carriera/salvataggi/classifiche/mercato; rituale 7 passi +
career-critical verdi a ogni release; ogni rimedio col suo rosso e la sua misura prima/dopo;
niente architetture parallele.
