# Giro 249 — seguito di PO-496: «Senza premio tira un compagno» + riparazioni del giro 238 (versione 7.999.197)

Ramo `sviluppo/giro249-rigorista`, partito da `origin/lavoro/197` (1e99853). `GAME_VERSION` non toccata.
Rosso del giro: `window.__CPM_NO_G249` (A, C e D tornano come nel giro 238).
Guardiani nuovi: `rigorista-249` (A) e `offerta-249` (C, D), nelle catene `completa` e `carriera` di `ci-runner.mjs` (una volta
ciascuno) e nella mappa mirata (rigorista-249 per src/14, 15, 18; offerta-249 per src/18). Guardiano riparato: `gol-eroe-154` (B).
Strumento di misura (non guardiano): `tests/visual/sonda-rigorista-249.mjs`.

---

## A — decisione PO 17/11 «Senza premio tira un compagno»

### Misura prima (sonda-rigorista-249 sul build della 197, prima di toccare src/)

Motore vero (`brainLive`, richiesta dei piazzati accesa come nel live), 20 partite, stessi semi nei due casi. «Rigori dell'eroe» =
battute dell'eroe + occasioni di scena da rigore offerte all'eroe (nel live diventano la sua scena interattiva; se la scena non si
apre il rigore passa a un compagno per il giro 154, ed è per questo che nel motore le battute sono tutte dei compagni).

| Build 7.999.197 | rigori della squadra | dell'eroe senza premio | dell'eroe con premio |
|---|---|---|---|
| K del gioco (0,25) | 4 | **4/4** | 4/4 |
| K = 1 (ogni fallo in area è rigore) | 13 | **13/13** | 13/13 |

Il premio non cambiava nulla: l'eroe ha sempre ruolo «AT» + 6 e vinceva sempre la scelta del battitore.

### Correzione

- **src/14 (`fermoSet`, rigore della squadra dell'eroe)**: senza premio `rig` il battitore è il compagno più adatto. Il «rigorista
  designato del club» **non esiste nei dati del gioco** (la rosa porta solo nome e ruolo, nessun attributo, nessun rigorista): quindi
  vale il ripiego indicato dal PO, «miglior tiro/mentalità fra gli attaccanti in campo». Anche tiro e mentalità per singolo
  compagno nel motore non esistono (tutti i compagni hanno gli stessi attributi, la forza della squadra): ho usato un'**attitudine al
  dischetto fissa per giocatore**, ricavata dal nome (stesso compagno partita dopo partita, come un rigorista vero), sulla stessa
  scala 0-4 del vecchio sorteggio, più il +10 del ruolo «AT» e l'esclusione degli espulsi. L'eroe tira solo se nessun compagno può.
  Con il premio resta il +100 del giro 238. Gli avversari scelgono come prima. Il sorteggio del vecchio criterio si consuma comunque:
  stesso flusso di numeri casuali nei due bracci.
- **src/15 (live, modo brain)**: quando il motore fa calciare un rigore a un compagno della squadra dell'eroe (senza premio `rig`),
  si apre la **scena di sola visione del giro 204**: cronometro fermo ~4 s, il 3D rifà il calcio con direzione ed esito del motore,
  sopra «⚽ CALCIO DI RIGORE · <minuto>'», «<nome> sul dischetto…» e poi l'esito. Nessuna scelta per l'eroe, nessun gol in più.
  Testimone `__CPM_RIG249`, evento `cpmEv("rigore249")`.
- Con il premio non cambia niente: tira l'eroe nella sua scena interattiva di oggi.

### Misura dopo (stessa sonda, stessi semi)

| | rigori della squadra | dell'eroe senza premio | battitore senza premio | dell'eroe con premio |
|---|---|---|---|---|
| K del gioco | 4 | **0/4** | Ricci 4 | 4/4 |
| K = 1 | 10 | **0/10** | Ricci 10 | 13/13 |
| rosso `__CPM_NO_G249`, K = 1 | 13 | 13/13 | — | 13/13 |

Con K = 1 senza premio i rigori scendono da 13 a 10: cambiando chi calcia cambia il seguito della partita (stesso sorteggio
consumato, partita diversa dopo il primo rigore). Con il premio i numeri sono identici a prima.

**Le 20 partite sono del motore, non 20 partite vissute nel browser**: 20 partite vere costerebbero più di un'ora e darebbero 2-3
rigori in tutto (4 rigori in 30 partite misurati nel giro 238). La parte «partita vera» è nel guardiano (parte B, sotto).

### Guardiano `rigorista-249` — verde e rosso

| Parte | Verde | Rosso `__CPM_NO_G249` |
|---|---|---|
| A · motore, 20 partite, K=1 | senza premio 0/10 dell'eroe (battitore Ricci 10) · con premio 13/13 | senza premio 13/13 dell'eroe |
| B · partita vera senza premio (S12 «r187d-11» seme 12, K=1) | rigore al 59': scena di sola visione di SPENCER, «GOOOL!» in pagina = esito del motore, in gioco fluido, battitore 3D compagno, pallone in rete (x 48,8); rigori dell'eroe 0 (né battute né scene) | scena del rigore giocata dall'eroe 1, scene del compagno 0 |
| B · partita vera con premio | scena del rigore dell'eroe 1, scene del compagno 0 | — |

Tempo: circa 6 minuti (le tre partite girano insieme mentre gira la parte A).

**Guardie esistenti adattate**: `sonda-rigore-139.mjs` (usata da `rigore-139`, `rigore-191`, `piazzato-204`) giudica la scena del
rigore **dell'eroe**: ora dà all'eroe il premio `rig` nel club del salvataggio (`CPM_SENZA_PREMIO=1` per il salvataggio com'è),
altrimenti quelle guardie avrebbero guardato un rigore del compagno.

---

## B — `gol-eroe-154` riparato (dubbio 10 del 238)

### Misura (prima)

Giro 238: braccio rosso `__CPM_NO_G154` rosso 2 su 2 con «nessun gol/assist dell'eroe in gioco fluido — il guardiano guarda a
vuoto» (già rosso nella completa della 7.999.190). Causa: dal giro 13 l'eroe tira solo nelle sue scene, e i testimoni del rosso
erano i rigori dell'eroe al 90'-91' (k21/k22). Con la decisione A senza premio quei rigori non sono più dell'eroe: il rosso sarebbe
rimasto cieco per costruzione.

### Riparazione (regole «Controlli instabili»: ciò che il gioco non produce si provoca dalla sonda)

In ogni partita, dal 90' del motore a gioco fluido (quando il live ha già spento le scene dei piazzati, giro 139), la sonda chiede al
motore **un** rigore per la squadra dell'eroe con l'eroe battitore (`chiedi.piazzato`, come `sonda-rigore-139` `CPM_PROVOCA`).
- Verde: il giro 154 lo passa a un compagno (`S.conta.g154` cresce) in **ogni** partita provocata.
- Rosso: lo calcia l'eroe fuori scena (`g154` fermo); la soglia di sempre — almeno un gol o assist dell'eroe in gioco fluido — è
  rimasta quella, e ora la si raggiunge.
- Pavimento di copertura delle provocazioni: metà del campione (5 su 10), mai sotto tre (regola 7.495): con l'eroe sostituito o in
  panchina al 90' il motore non accetta l'eroe battitore. Soglie vecchie invariate (NMIN 8 partite valide, fascia 0,2-1,2).
- Correzione del banco durante la stesura: `S.kickoff` resta un oggetto anche dopo la battuta, quindi la prima stesura non provocava
  mai; lo stato vero è `S.poss.stato`.

### Esito

RISULTATO_G154

---

## C — controproposta su un'offerta già chiusa (dubbio 7 del 238)

src/18: l'aggiornamento di «Fai la controproposta» ora restituisce l'offerta com'è se è nulla (chiusa nello stesso fotogramma) o già
rilanciata (secondo tocco): niente crash, niente doppio rilancio.

## D — «Il mister ti cerca» spegne il tasto della corsa (dubbio 8 del 238)

src/18: `_saltaMotivo163` dà «chiudi prima la finestra aperta» mentre la finestra del mister è aperta e non ancora risposta. Cambia
solo il tasto e il suo motivo: le fermate della corsa non leggono il motivo (hanno le loro regole, invariate).

### Guardiano `offerta-249` — verde e rosso (salvataggio S12, ~1 minuto)

| | Verde | Rosso `__CPM_NO_G249` |
|---|---|---|
| C · offerta chiusa + controproposta nello stesso compito JavaScript | nessun crash, registro errori vuoto, nessun pageerror | «Qualcosa è andato storto», registro `Cannot read properties of null (reading 'club')` |
| C · due tocchi di fila sulla controproposta | «Controproposta accettata» (un solo rilancio) | non giudicato (pagina in crash) |
| D · motivo del tasto | prima nullo · con «Il mister ti cerca» «chiudi prima la finestra aperta», tasto spento · chiusa la finestra nullo | con la finestra aperta motivo nullo, tasto acceso |

Ganci di collaudo nuovi (solo `?cpmtest=1`, in `__CPM_CAREER`): `misterCerca249()` apre la finestra del mister (nel gioco esce a
caso, 4% a settimana), `motivo249()` legge il motivo del tasto.

---

## Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** dopo ogni modifica a src/.
`node --check tests/visual/ci-runner.mjs` ok; i due guardiani nuovi una volta in `completa`, una in `carriera`, una per voce di mappa.

CONTROLLI_TABELLA

---

## Dubbi per il PO

1. **Il «rigorista designato del club» non esiste nei dati.** La rosa ha nome e ruolo, nessun attributo; nel motore tutti i compagni
   hanno la stessa forza. Ho usato il ripiego indicato («miglior tiro/mentalità fra gli attaccanti in campo») con un'attitudine al
   dischetto **fissa per giocatore ricavata dal nome**: sempre lo stesso rigorista finché è in campo (nelle 20 partite della sonda:
   Ricci 10 su 10). Se il PO vuole un rigorista visibile (nella Rosa, nel tabellino), va creato il dato.
2. **In Nazionale e nel provino l'eroe non tira più i rigori.** I premi di club lì non valgono (regola del 238), e senza premio tira un
   compagno. È la conseguenza diretta delle due decisioni; non ho aggiunto eccezioni.
3. **Meno scene interattive dell'eroe.** Senza premio i rigori diventano scene di sola visione: il numero di rigori della squadra non
   cambia (stesso fischio, stesso tetto), ma l'eroe non li gioca. È ciò che la decisione chiede; lo segnalo per PO-065 («tornano i
   rigori», «rigore sempre» del 7.999.27), che resta vero solo con il premio.
4. **Percorso non misurato: il «ponte» verso una scena programmata a palla ferma** (src/15, `chiedi.piazzato` con `batt: HERO`)
   chiede al motore un rigore con l'eroe battitore esplicito. Nel modo brain (oggi di serie) le scene nascono dai fatti del motore e
   nella partita del guardiano non è mai successo, ma non ho dimostrato che non possa succedere: se una scheda di rigore finisse in
   uno slot programmato, l'eroe tirerebbe anche senza premio. Non l'ho toccato.
5. **Il nome del compagno nella scena** è quello che porta in campo (nel guardiano «SPENCER», maiuscolo come nel motore). Il corpo 3D
   del battitore è «un compagno» scelto dalla resa della lotteria (giro 204), non necessariamente lo stesso uomo del motore.
6. **gol-eroe-154, cosa misura ora il rosso**: un rigore provocato dalla sonda al 90' con l'eroe battitore. È la stessa classe di
   difetto che il giro 154 chiude (il piazzato fuori scena dell'eroe), ma non copre gli altri due rami del 154 (il gol decretato
   chiuso dall'eroe e l'assist dell'eroe in gioco fluido), che restano giudicati solo se il gioco li produce.
7. **Mappa mirata non eseguita per intero** (vedi tabella): per src/14, 15 e 18 la mappa dà più di 180 passi, fra cui
   `highlight-95`, `validate-situations`, `partita-vera` e altri oltre i 20 minuti. Il resto resta alla verifica di rilascio.
