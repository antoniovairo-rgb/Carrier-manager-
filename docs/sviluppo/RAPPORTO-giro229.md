# Rapporto giro 229 — PO-494 (momenti salienti in ogni partita) e PO-495 (pausa: timer e barra dal tempo rimasto)

Ramo `sviluppo/giro229-salienti-sempre`, partito da `lavoro/196`. `GAME_VERSION` non toccata (nel file resta `7.999.195`; la
consegna chiama il giro «versione 7.999.196», la porterà la sessione di rilascio). La riga di roadmap la scrive il rilascio.

---

## Parte A — PO-494: «Gioca solo i momenti salienti» in ogni partita da titolare

### A.1 Misura prima (codice di partenza)

Sonda nuova `tests/visual/misura-229.mjs` (non guardiano). Per ogni competizione gioca la **stessa** partita due volte (stesso
salvataggio sintetico, stessa settimana, stesso pilota automatico seedato 7300, stesso seme del flusso di prova `rng()` 4242):
intera e a soli salienti, poi chiude il dopo-partita e confronta **campo per campo** il salvataggio (`localStorage cpm-v3`).
Sul codice di partenza il tasto non c'era fuori dal campionato senza posta, quindi la modalità si accendeva dal gancio di sonda
`__CPM_SOLO166` (testimone `__CPM_LM166`: `attiva:true`, velo visto in tutti i casi).

| caso | tasto (prima) | risultato intera = soli | rigori | libro mastro | schermata finale | intervista | durata reale intera → soli |
|---|---|---|---|---|---|---|---|
| coppa nazionale (ottavi) | assente | 0-1 = 0-1 | no | 285 = 285 voci | uguale | uguale | 184 s → 43 s |
| Europa girone | assente | 1-2 = 1-2 | no | 284 = 284 | uguale | uguale | 198 s → 65 s |
| Europa ottavi (eliminazione) | assente | 1-2 = 1-2 (eliminati in entrambe) | no | 284 = 284 | uguale | uguale | 200 s → 65 s |
| Europa ottavi, pareggio → rigori | assente | 1-1 = 1-1, passati ai quarti in entrambe | sì / sì | 14 = 14 | uguale | uguale | 59 s → 50 s |
| amichevole della Nazionale | assente | 1-0 = 1-0 | no | 280 = 280 | uguale | uguale | 192 s → 48 s |
| finale europea, pareggio → rigori (misurata dopo la correzione, col tasto) | presente | 1-1 = 1-1, **vinta**: cerimonia 24,4 s / 24,0 s, trofeo UCL in entrambe | sì / sì | 14 = 14 | uguale | uguale | 76 s → 66 s |
| finale di coppa, pareggio → rigori (dopo la correzione, col tasto) | presente | 1-1 = 1-1, persa in entrambe (nessuna cerimonia) | sì / sì | 22 = 22 | uguale | uguale | 56 s → 44 s |

Il pareggio a eliminazione diretta si ottiene col gancio di collaudo già esistente `__CPM_SO_FORCE` (lo stesso dei giri 58/191),
chiamato alla prima scena, allo stesso minuto nei due modi: la partita si chiude 1-1 al 90' e va ai rigori.

**Come si risolvono supplementari e rigori a soli salienti:** come nella partita intera. Il gioco non ha supplementari: un pareggio
a eliminazione diretta va direttamente alla serie dei rigori (`_startShootout`, src/15). La modalità a soli salienti cambia solo il
passo del gioco fluido (`_lotto166` fa battere lo stesso `_batt166` a lotti, solo in fase `playing`); la serie dei rigori è una fase
a sé (`shootout`) con la stessa sequenza seedata (`_koSeed`), e la cerimonia è la stessa.

**Differenze trovate nello stato salvato** (tutte le partite): `fatigue` (es. 21 contro 18), `morale` (68/69, solo coppa), il
giornalista dell'intervista (`scelte201.m.intervista.paper/journalistId`, `journalists.0`), una notizia «Radio mercato» in più nel
`log` (+ `transferSaga`) e, nei rigori passati, l'avversario sorteggiato per il turno successivo (`calendar.34`). Sono tutte
estrazioni **senza seme** del livello carriera: `rng(6,12)` per la fatica (src/18 r.~4004-4206), `Math.random()` per l'offerta di
mercato (src/18 r.~1477), sorteggio del turno e del giornalista. **Controllo**: la stessa Europa-ottavi giocata **intera contro
intera** (`CPM_M229_CONTROLLO=1`) differisce sugli stessi campi (fatica 19/22, giornalista), con libro mastro, risultato e schermata
finale uguali. Quindi **non sono differenze della modalità** e non le ho toccate.

Calendario/tabellone (`calendar[].played/result`, `euro.phase/koRound/koResults/eliminated/champion`, `cup`), pagella e
statistiche (`matchHistory`, gol/assist/presenze), trofei e salvataggio risultano identici. La prima misura della coppa era
sbagliata **per colpa della sonda** (avversario `b07` fuori dal campionato: il gioco lo sorteggia con `pick()` e le due partite
erano contro squadre diverse); corretta usando un club della lega.

**Differenze del codice (non della partita) trovate leggendo:**
1. `soloHL` arrivava alla partita solo se `matchContext==="career"`: in coppa/Europa/Nazionale la modalità chiesta non sarebbe
   mai arrivata a `LiveMatch` (il gancio di sonda passava sopra questo cancello).
2. `startNationsCupMatch` e `startEuroMondialeMatch` (lobby dei tornei della Nazionale) non fissavano la modalità: tolto il cancello
   del punto 1, avrebbero ereditato `soloHL166Ref` dell'ultima partita giocata (una gara di campionato a soli salienti avrebbe reso
   «a soli salienti» anche la gara della Nazionale aperta dopo dalla lobby). Anche la ripresa dopo il background di queste gare
   non rientrava nella modalità salvata (`s166`).

### A.2 Correzione (src/18)

- `salienti229(md)`: da titolare il tasto c'è in ogni partita della carriera da professionista; condizioni del prompt invariate
  (titolare, niente infortunio/squalifica, Simula non scelto). Rosso `__CPM_NO_G229` = la regola `senzaPosta166`.
  `posta165` **non cambia** (governa ancora il tasto facoltativo del giro 165).
- Nota sotto il tasto riscritta: «Giochi solo le tue azioni, il resto della partita scorre veloce. Il risultato lo decide la stessa
  partita.» (nel rosso resta quella vecchia).
- `soloHL` arriva a `LiveMatch` in ogni contesto.
- `_modo229`: chi apre una gara della Nazionale fuori da `startMatch` dice da sé la modalità (ripresa → `s166`; lobby → la scelta
  appena fatta, poi azzerata).
- Tasto «Gioca solo i momenti salienti» anche nelle lobby di Coppa delle Nazioni (`data-cpm="solo-229-nc"`) ed Europeo/Mondiale
  (`data-cpm="solo-229-em"`), non con infortunio. Vedi dubbio 2.
- Gancio di solo collaudo `__CPM_CD229` (letto solo sotto `?cpmtest=1`): forza la decisione del mister nel prompt (panchina).

### A.3 Guardiano `salienti-229` (nuovo, catene `completa` e `carriera` una volta ciascuna, fra i lenti)

Verde (build finale): statico 3/3 · tasto presente da titolare in campionato **con** posta (peso 5), coppa, Europa girone,
Europa eliminazione, Nazionale, con la nota nuova · assente da panchina (campionato, Europa KO) e da squalificato (coppa, Europa
girone) · ottavo europeo aperto **col tasto**, pareggio → rigori in entrambe, risultato, libro mastro (10 voci), schermata finale
(1741 car.), calendario, stato europeo (`quarti`, koRound 1), storico e presenze identici alla partita intera; 0 errori di pagina.
Rosso `__CPM_NO_G229`: cadono i 5 «tasto presente», panchina/squalifica restano senza tasto, l'ottavo non si apre a soli salienti.

---

## Parte B — PO-495: pausa durante la scelta

### B.1 Misura prima (codice di partenza)

Sonda nuova `tests/visual/misura-pausa-229.mjs`: scena forzata in `hl_choose` (marcatore lontano, 16 s), ~5 s di scelta, pausa
col tasto P, 3 s, ripresa. Timer misurato avvolgendo `setTimeout` (quello che produce `ActionTimeout`, come barra-221), barra
letta dal **progresso** dell'animazione (`getComputedTiming().progress`: con l'`animation-delay` negativo del giro 210
`endTime − currentTime` non è il tempo rimasto — prima lettura sbagliata, corretta).

Risultato: alla ripresa **timer 16.000 ms e barra 15.833 ms: ripartono entrambi interi** (scarto fra loro 19-53 ms). Il dubbio 1
del giro 221 diceva che la barra riprendeva da dove era: misurato, non è così — anche la barra ripartiva piena, perché la chiave
del giro 210 cambia alla ripresa e azzera l'inizio della scelta.

Trovato misurando: **in headless l'orologio delle animazioni CSS va più lento del tempo reale** (testimone `__CPM_P229`: 9,4 s di
`Date.now()` del gioco contro 4,9 s di avanzamento della barra). Il timer usa il tempo vero; la barra, rimontata alla pausa/ripresa,
si riallinea al tempo vero. Per questo il guardiano giudica la barra **alla ripresa**.

### B.2 Correzione (src/15)

- Alla pausa si annota quanto della scelta è passato; alla ripresa della **stessa** scena l'inizio della scelta si sposta indietro
  di quel tanto: la barra riparte dal rimasto, e il timer dell'anticipo si riarma con `durata − tempo già passato` (minimo 300 ms).
- Trovato sulla strada (primo rosso di barra-221 dopo la prima stesura): `openMatch` lascia la partita già in `hl_choose` della
  scena 0 e la sonda riforza la scena 0 — la chiave non cambiava, quindi l'inizio della scelta restava quello vecchio. È il
  **dubbio 2 del giro 221** («la barra parte già avanti nella prima prova della pagina»), ora misurato: col timer che riprende dal
  rimasto, il timer veniva accorciato (14.683 ms). Correzione: la chiave della scelta, le chiavi delle due barre e la durata
  (`_durEsit221`) prendono un numero d'**istanza della scena** che cambia quando cambia l'elenco delle scene (scena riaperta).
  Dopo: timer 15.997 ms, barra 16.000 ms.
- Testimone di collaudo `__CPM_P229` (solo `?cpmtest=1`): ogni cambio di chiave con l'inizio della scelta.
- Rosso `__CPM_NO_G229`: chiavi, durata e timer come prima (timer e barra ripartono interi).

### B.3 barra-221, parte C (nuova)

Verde: scelta 7.845 ms prima della pausa · atteso 8.155 ms · **timer riarmato 8.152 ms · barra alla ripresa 7.987 ms** · la barra
si svuota 30 ms dopo lo scatto (soglia già dichiarata 300 ms). Parte A: tutti e sei i livelli entro 3 ms (la prima scena,
«lontano», ora 3 ms; prima del giro 229 era 1.317 ms a pagina riaperta, il dubbio 2). Rosso `__CPM_NO_G229`: timer 16.000 ms
contro rimasto 6.901 → bocciato. Rosso `__CPM_NO_G221` invariato (bocciato su A e B).

---

## Controlli (uno alla volta, build finale salvo dove detto)

| controllo | esito |
|---|---|
| `salienti-229` | ✅ verde + rosso cade |
| `barra-221` (con parte C) | ✅ verde; rossi 221 e 229 cadono |
| `solo-highlight-166` | ✅ verde (casi 3-6 del prompt ora girano col rosso 229, dove vive la regola della posta) + rosso cade. Misura: intera 193,9 s · soli 55,1 s |
| `momento-173` | ❌ punto 2 (rinnovo aperto: «motivo» del tasto e tasto che torna normale) — **rosso identico sul codice di partenza lavoro/196**: preesistente, non toccato. Punti 1, 3 (sotto rosso 229) e 4 verdi |
| `momento-165` | ❌ 2 controlli sul rinnovo — **identici sul codice di partenza**: preesistenti |
| `momento-165b` | ❌ 2 controlli sul rinnovo — **identici sul codice di partenza**: preesistenti |
| `career-critical` | ✅ (prima corsa interrotta dal tetto di 10 minuti dello strumento: non vale, rifatta da capo, verde) |
| `save-compat` | ✅ 12/12 |
| `test:logic` | ✅ 51/51 |

`node tools/check-src.mjs`: IDENTICO BYTE PER BYTE. `ci-runner.mjs`: `node --check` ok, `salienti-229` una volta in `completa` e
una in `carriera`, nessun doppione. Nessuna foto in `docs/` rigenerata.

---

## Dubbi per il PO

1. **Primavera (u18).** Ho tenuto il tasto alle sole partite della carriera da professionista, come il giro 166. La decisione dice
   «in OGNI partita» ed elenca solo competizioni da professionista: va esteso anche alle partite della Primavera?
2. **Tornei della Nazionale.** Ho messo il tasto anche nelle lobby di Coppa delle Nazioni ed Europeo/Mondiale (la consegna dice
   «nazionale, finali»). Non hanno un prompt del mister (in Nazionale sei sempre titolare) e non ho trovato lì un controllo di
   squalifica, quindi il tasto c'è salvo infortunio. Il guardiano `salienti-229` controlla questi tasti **solo nel sorgente**, non
   giocando un torneo della Nazionale a soli salienti: da collaudare. Il pulsante principale della home che avvia quelle gare
   apre sempre la partita intera.
3. **Rinnovo aperto (momento-165/165b/173).** Cinque controlli sul rinnovo sono rossi già su `lavoro/196`: il tasto spento dice
   «chiudi prima la finestra aperta» invece di «Prima rispondi al rinnovo» e la corsa non si ferma sul rinnovo. Non è di questo
   giro e non l'ho toccato; va guardato da chi ha toccato le finestre della home dopo il 173.
4. **Sorgenti senza seme dopo la partita.** Fatica `rng(6,12)`, offerta di mercato `Math.random()`, giornalista e sorteggio del turno
   successivo cambiano da una partita all'altra anche giocando due volte la stessa partita intera. Non è un difetto della modalità;
   se il PO vuole che «stessa partita = stessa carriera» valga alla lettera, è un lavoro a parte sul livello carriera.
5. **Scena riaperta.** Il numero d'istanza cambia quando cambia l'elenco delle scene; nella partita vera l'elenco cambia con le
   catene (CHAIN) e con la coda reattiva, normalmente fuori da `hl_choose`. Se l'elenco cambiasse **durante** una scelta, barra e
   timer ripartirebbero interi (come facevano prima del giro). Non l'ho visto succedere; non l'ho provato sul flusso vero.
6. **Il caso pausa è giudicato su una scena sola** (marcatore lontano, 16 s) e col tasto P della tastiera; il tasto ⏸ a schermo
   chiama lo stesso `setPaused`, ma non l'ho premuto dalla sonda.
