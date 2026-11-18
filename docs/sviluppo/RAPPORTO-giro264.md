# Rapporto giro 264 — il battito del motore e l'apertura della scena hanno un ordine solo

Ramo `sviluppo/giro264-battito-scena`, partito da `lavoro/197` (`ba99108`, contiene il giro 259). `GAME_VERSION` non toccata.
Nessun campo nuovo nel salvataggio, `SAVE_VERSION` invariata. Rosso: `window.__CPM_NO_G264` (torna il comportamento di prima).
Registri delle misure: `docs/sviluppo/giro264/*.txt`.

## 1 — Misura prima

Sonda nuova `sonda-264` (`npm run sonda-264`): ripete la `sonda-259b` per N corse (stessa partita «Collaudo Salienti», seme del pilota
7300, intera e soli highlight fermate al 12') e in più registra dentro la pagina **quanti passi e quante estrazioni del flusso `rnd`
(`__CPM_RND14`) ha già consumato il motore nel momento in cui la scena gioca** (`giocaScena`).

| | corse | divergenti (libro mastro) | divergenti (motore all'ingresso in `giocaScena`) |
|---|---|---|---|
| base `lavoro/197`, corse singole di prova | 2 | 2 | 1 misurata su 1 |
| base `lavoro/197`, serie da 20 (`g264-prima.txt`) | 20 | **2** | **2** |

Nelle corse divergenti, sempre lo stesso quadro (identico a quello del 259: «chance» contro «assist» al 5'):

| | passi ricevuti dal motore | estrazioni `rnd` | minuto del motore | esito |
|---|---|---|---|---|
| soli highlight (e intera non divergente) | 95 | 5169 | 4 | passaggio arrivato, gol del compagno |
| intera divergente | **96** | **5228** | **5** | tiro del compagno parato |

**Causa.** La scena si apre dentro il battito del minuto (`setPhase("hl_intro")` nell'aggiornamento del cronometro, `src/15`). Ma
l'intervallo del metronomo vive in un effetto di React che dipende dalla fase: si spegne solo quando React ha reso e ha eseguito la
pulizia dell'effetto, cioè quando il processore ha tempo. Se nel frattempo scade un'altra battuta (77 ms a 1x), il battito parte con
`phaseRef` ancora su `playing`: è un sotto-passo del minuto nuovo, e dal 7.962 il motore lo riceve sempre. Quel passo consuma 59
estrazioni **prima** che la scena giochi; la scena pesca poi dal punto sbagliato del flusso. Nei soli highlight non può succedere:
il lotto fa girare ogni battito dentro `flushSync` e si ferma appena la fase esce da `playing`.
Il conto dei passi per minuto resta 22 nei due casi (quello anticipato non viene ripagato dopo): cambia solo l'**ordine** fra quel
passo e la scena, ed è l'orologio da polso a deciderlo.

## 2 — Correzione (`src/15`, 2 righe di sostanza)

`_batt264`: il **battito del minuto** — l'unico che apre scene, fischia e cambia fase — gira dentro `ReactDOM.flushSync`, come nel
lotto dei soli highlight: fase, cronometro e spegnimento dell'intervallo sono applicati prima che la battuta dopo possa partire. I 21
sotto-passi fra un minuto e l'altro restano com'erano. Il motore (`src/14`) non è toccato; nessun sorteggio aggiunto o tolto.
Col rosso `__CPM_NO_G264` l'intervallo chiama il battito nudo, come prima.

**Due tentativi, tutti e due misurati.**
1. *Ogni* battuta dentro `flushSync` (commit `8f029f6`): 0 divergenze su 20 corse, 2 partite complete identiche (244 voci su 244),
   `solo-highlight-166` verde intero in una corsa. Lasciato per il costo dentro la battuta (vedi tabella): su un telefono un render
   sincrono ogni 77 ms è lavoro in più senza guadagno.
2. Solo il battito del minuto (quello spedito): stessi risultati, costo quasi nullo.

Passo reale del metronomo (`sonda-264v`, stessa partita nei bracci — assist e gol al 5' —, fino al 15', `g264-passo.txt`):

| braccio | intervallo medio fra due battute | mediano | lavoro dentro la battuta |
|---|---|---|---|
| rosso (battito nudo) | 128,1 ms | 94 | 0,23 ms |
| verde (spedito) | 130,9 · 134,8 ms | 99 · 108 | 0,46 · 0,48 ms |
| ogni battuta in `flushSync` (tentativo 1, emulato dalla sonda) | 127,2 ms | 106 | 3,1 ms |

⚠️ Errore mio, corretto con la misura: a metà giro avevo letto un rallentamento (1912 contro 2576 ms di gioco fluido per minuto). Era
un confronto fra partite diverse: nella corsa rossa la scena era uscita «chance» (nessun gol al 5', quindi nessuna pausa di ripresa).
A parità di partita il passo è lo stesso nei tre bracci. I ms di `playing` per minuto non sono una misura del passo.

## 3 — Misura dopo

| | corse | divergenti (libro) | divergenti (motore) | non giudicate |
|---|---|---|---|---|
| `sonda-264`, 20 corse al 12' (`g264-dopo2.txt`) | 20 | **0** | **0** | 0 |
| `battito-264`, braccio verde: 2 coppie con la gara provocata + 1 a tempo reale, al 30' | 3 | 0 | 0 | 0 |
| `solo-highlight-166`, 3 corse intere di fila (2 coppie di partite complete per corsa) | 3 | 0 (244/244 voci, 3-1 · 3-1) | — | 0 |
| (tentativo 1) `sonda-264` 20 corse al 12' + 2 partite complete | 22 | 0 | 0 | 0 |

In tutte le 20 corse la scena del 5' gioca con 95 passi e 5169 estrazioni nei due modi.

## 4 — Statistiche su 20 partite, prima e dopo

Sonda `sonda-264s` (`npm run sonda-264s`): 20 partite **diverse** giocate per intero dal prompt della carriera (nomi «Statistica 1…19»
e «Conteggio 1»: il nome entra nel seme della partita; stessa settimana, stesso pilota seedato). Gol dal tabellone, tiri e possesso
dal tabellino del motore (`M.tabellino()`), più un'impronta del libro mastro.
- **Prima** = partita intera col rosso `__CPM_NO_G264`, velocità 2x (`g264-stat-prima.txt`).
- **Dopo** = la stessa partita senza il rosso. Misurata a soli highlight (`g264-stat-dopo-solo.txt`), perché dopo la correzione i due
  modi sono la stessa partita; verificato anche qui: le prime 6 giocate intere a 2x senza rosso hanno **6 impronte su 6 uguali** a
  quelle a soli highlight (`g264-stat-dopo-intera.txt`).

| su 20 partite | prima | dopo |
|---|---|---|
| gol a partita (casa + ospiti) | 2,40 (1,85 + 0,55) · dev. st. 1,20 | 2,55 (2,00 + 0,55) · dev. st. 1,28 |
| tiri a partita (casa + ospiti) | 19,85 (13,90 + 5,95) · dev. st. 3,18 | 20,05 (14,25 + 5,80) · dev. st. 4,39 |
| possesso della squadra di casa | 41,6 % · dev. st. 4,6 | 41,6 % · dev. st. 4,5 |
| vittorie · pareggi · sconfitte | 15 · 3 · 2 | 13 · 4 · 3 |
| scene giocate a partita | 6,45 | 6,60 |
| partite con libro mastro diverso dai soli highlight | **17 su 20** | 0 su 6 misurate (per costruzione sulle altre) |

Le differenze fra le due colonne stanno dentro la dispersione di 20 partite (gol: +0,15 con deviazione standard 1,2; errore standard
della media ≈ 0,27): la correzione non sposta le medie in modo misurabile. Quello che cambia è **quale** partita esce: prima, 17 volte
su 20 la partita intera a 2x non era quella dei soli highlight (né, per lo stesso motivo, quella di un'altra corsa intera); adesso è una.
Non posso confermare con 20 partite differenze di statistica più piccole di circa mezzo gol a partita: servirebbe un banco più grande.

Due nomi («Statistica 20», «Statistica 21») non hanno aperto la partita in nessuno dei due bracci (bottone non trovato in 10 s, con e
senza rosso): non li ho indagati, li ho sostituiti con «Conteggio 1». Vedi «Dubbi».

## 5 — Guardiano nuovo `battito-264` (`npm run battito-264`)

A tempo reale la gara esce in una corsa su 5-10: un guardiano che aspetta la fortuna sarebbe cieco. La gara si **provoca dalla
sonda**: nelle coppie «provocate» l'intervallo del metronomo (periodo 77 ms) batte due volte di fila senza restituire il controllo al
browser — quello che succede su un processore conteso — rispettando `clearInterval` come farebbe il browser. Giudica, fino al 30':
libro mastro voce per voce e, per ogni scena, estrazioni e minuto del motore all'ingresso in `giocaScena`.
- Verde: 2 coppie provocate + 1 a tempo reale, 0 divergenze; coppia senza scene, non arrivata al 30', con errori di pagina o con la
  provocazione non ingaggiata (meno di 50 battute doppie) = non giudicata = rosso.
- Rosso (`__CPM_NO_G264`): fino a 2 coppie provocate, almeno una divergenza (misurato: la prima, voce 15 al 6').
- Parte statica: un solo `_batt264`, usato dall'intervallo quando il rosso è assente.
Durata 7 min 30 s. Registrato in `ci-runner.mjs`: catena `completa`, mappa di `src/15` (le due righe), lenti; `node --check` ok.
`solo-highlight-166`: la parte statica (caso 1) ora pretende l'intervallo scritto con `_batt264` (più stretta di prima, non più larga).

## 6 — Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

CONTROLLI_DA_INSERIRE

## Dubbi per il PO

DUBBI_DA_INSERIRE
