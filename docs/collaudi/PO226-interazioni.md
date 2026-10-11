# PO-226 — censimento delle interazioni in partita

Collaudo della collaudatrice, base `main` 7.999.159 (commit 995835f). Sola lettura sul gioco: nessuna modifica a `CARRIER-MANAGER-AV.html` né a `src/`. Nessuna proposta di correzione.

Il PO: «diamo un senso a queste interazioni, magari riducendole ma rendendole collegate e decise dal motore». Le interazioni in esame: ordini del mister, grida del mister, sostituzione, scelte da panchinaro, schede INTX669.

## Esito in breve

- **Schede INTX669 e scelte su scheda**: misurate su 15 partite di carriera normali (c-p0..c-p14) più 3 su cui la panchina non è confermata (vedi §3). In media **4,1 schede a partita** (range 4–5), **1–2 scelte a partita**. Tutte le scelte misurate sono **scattate per timer** (23 su 23): la partita applica l'opzione neutra, quindi il dato dice *quante* scelte compaiono, non come un giocatore sceglie.
- **Ordini e grida del mister**: **non osservati** in partita con il metodo usato (0 rilevazioni su 18 partite). Il riquadro del mister non è montato con il default del gioco (vedi §4). Il dato non prova che gli ordini non escano: prova solo che il mio metodo non li ha visti.
- **Sostituzione**: 1 su 15 partite normali (min 78, partita c-p8). Dipende dalla stanchezza: la soglia d'uscita scende solo se la stanchezza è ≥ 60 (`CARRIER-MANAGER-AV.html:28111`); nei salvataggi usati la stanchezza era 34, quindi nella maggior parte delle partite la sostituzione non scatta.
- **Panchina**: il percorso «eroe in panchina» **non è confermato**. Il testimone di fine partita dice `bench:false` in b-p0, b-p1, b-p2.

## 1. Dal codice: dove nasce ogni interazione

| Interazione | Dove nasce | Cosa la fa comparire | Effetto nel motore (dal codice) |
|---|---|---|---|
| **Ordine del mister** (28', 63', 75', e reazione a gol subito/segnato) | `COACH_ORDERS` `CARRIER-MANAGER-AV.html:25134`; scelta `selectCoachOrder` `:25166`; emissione `:31007`–`:31060` (ordine 1 a ck≥28, ordine 2 a ck≥63, ordine 3 a ck≥75); reazione `:33460` | Soglie di minuto fisse; la scelta dell'ordine dipende da punteggio, momento e stanchezza (`selectCoachOrder`). Il testo varia col seme (`coachSay` `:25155`). | **Sì, diretto**: imposta `tacticBonusRef` (bonus), possesso (`poss`), momentum (`mom`), e il preset di deriva (`drift`) (`:31008`–`:31014`). Non è una scelta del giocatore. |
| **Grida del mister** | `COACH_SHOUTS` `:25191`; `pickCoachShout` `:25220`; chiamata `:31439` | Scelta per minuto, punteggio, momentum, possesso, stile; anti-ripetizione. | Solo narrativo, per quanto letto nel codice: non ho trovato scritture di stato nel percorso della grida. Non verificato. |
| **Scheda INTX669** (testo + conseguenze) | Array `INTX669` `:26879`; trigger `:32532`–`:32601` (finestra minuto 18–88, tetto di schede per partita, scelta pseudo-casuale `_rndM`) | Condizioni sul contesto della partita (`cond`), memoria tra partite (`_rec682`, `:32576`–`:32600`). | **Indiretto**: la scheda scrive i contatori narrativi `marcatura`, `intesa`, `coinv`, `fiducia`, `zona` (`:33152`–`:33159`). Questi contatori sono letti dal motore in `:31956` (probabilità `_pE`), `:30795` (bonus), `:35366` (fiducia → `_fid752`). **Non ho misurato l'effetto sugli esiti.** |
| **Scelta su scheda** (opzioni) | `scegli681` `:29630`; bottoni `:37046`; scena `PopScelta919` `:27723`; timer che applica l'opzione neutra `:29744` | Compare insieme alla scheda, con timer («la partita non aspetta»). | Stessi contatori della scheda, scritti con le `cons` dell'opzione scelta (`:29637`–`:29640`). |
| **Sostituzione** | `subOffAtRef` `:28111`; uscita `:17506` | Stanchezza ≥ 60 → minuto d'uscita fra 56 e 80. Nessuna scelta del giocatore. | Sì: l'eroe esce dal campo e il suo ruolo cambia (`subbedOff`). |
| **Panchina** (eroe «in panchina») | `onBench`; scheda bloccata quando in panchina `:32535` (salvo `__CPM_NO_PANCA64`) | Condizione sullo stato dell'eroe. | Le schede non escono mentre l'eroe è in panchina; il resto del motore cambia per stato. |

**Nota sul quadro «scelte da panchinaro»**: nel codice non ho trovato una scelta distinta per il panchinaro. Ciò che c'è è il blocco delle schede in panchina (`:32535`). **Non posso confermare** l'esistenza di scelte dedicate al panchinaro.

## 2. Misure su partite di carriera normali (c-p0..c-p14, 15 partite)

Metodo: salvataggio `tests/visual/fixtures/save-194-primavera-w38.json` con il nome del giocatore diverso per partita; `__CPM_GLB=false`, `__CPM_PRESENT=1`, `__CPM_CAREER.playMatch()`, poi `__CPM_AUTOPLAY` seedato. Sonda: `docs/collaudi/sonde/po226-interazioni.mjs`. Dati: `docs/collaudi/PO226-dati/c-p*.json`.

- Partite finite: **15 su 15**, nessun errore di pagina.
- Schede per partita (aggregato di 18 partite, incluse le tre b non confermate): **4 in 16 partite, 5 in 2**, media 4,1.
- Minuti delle schede (aggregato di 18 partite): concentrate fra 18' e 31', con due addensamenti a **46'** (11 schede) e **56'** (9). L'addensamento a 46'/56' non l'ho ancora spiegato: è un dato osservato, la causa non l'ho cercata.
- Scelte per partita: 1 in 13 partite, 2 in 5. Tutte **scattate per timer** (23/23). Opzione scelta sempre l'indice 0 (la neutra).
- Scelte per minuto: 22, 28, 29, 29, 30, 45, 56×6, 57×5, 58, 59, 60, 61, 66×2 (aggregato 18 partite). Il picco a 56'–57' coincide con l'addensamento delle schede.
- Schede più frequenti (aggregato 18 partite): `co_inc` 7, `er_sprona` 7, `co_int` 7, `av_pres` 5, `co_voce` 5.
- Punteggi finali (c-p0..c-p14, dal file JSON): c-p0 2-3 · c-p1 3-0 · c-p2 0-3 · c-p3 0-1 · c-p4 1-3 · c-p5 1-1 · c-p6 2-1 · c-p7 0-1 · c-p8 2-0 · c-p9 0-3 · c-p10 2-2 · c-p11 0-2 · c-p12 2-1 · c-p13 0-3 · c-p14 1-1.

## 3. Partite con panchina forzata (b-p0..b-p2): NON CONFERMATE

Ho provato a forzare la panchina con `__CPM_FORCE_BENCH` (hook di collaudo esistente, `CARRIER-MANAGER-AV.html:29230`) subito dopo l'inizio partita. A fine partita il testimone `__CPM_SUBOFF()` dice **`bench:false`** in tutte e tre (b-p0, b-p1, b-p2). Quindi **la panchina non è entrata** in questi tre casi, e le tre partite **non le conto come partite in panchina**. Restano dati di partite normali con schede 4–5 (b-p0: 5 schede).

Il lotto non ha quindi un campione valido di partite in panchina. Per averlo serve un percorso di gioco che porti davvero l'eroe in panchina, oppure un collaudo dove il testimone `bench` sia verificato dall'inizio.

## 4. Ordini e grida: non osservati con questo metodo

- Il metodo: scansione periodica del testo visibile (`innerText`) alla ricerca dei testi di `COACH_ORDERS` (`ctx` e `alt`, come `coachSay` li sceglie) e di `COACH_SHOUTS`. Risultato: **0 rilevazioni** su 18 partite; il testimone del riquadro del mister (`[data-cpm="panchina"]`) è rimasto a **0 nodi** in tutte.
- Causa nel codice: la riga del mister è montata solo se `!_sot695` (`CARRIER-MANAGER-AV.html:37022`). `_sot695` è definito in `:36406` e vale **vero per default** (si spegne solo con `__CPM_NO695`). Con il default il riquadro del mister **non viene montato**, e la voce va altrove (cronaca). Non ho verificato dove va esattamente il testo in quel caso.
- Conclusione: ordini e grida **esistono nel codice** e sono deterministici (soglie 28'/63'/75' e reazioni al gol), ma **non so se e come il giocatore li vede in partita** con il default. Non posso confermarlo.

## 5. Tabella riassuntiva

| Interazione | Quanto compare (misurato) | Minuto | Momento | Opzioni | Cambia il motore? |
|---|---|---|---|---|---|
| Scheda INTX669 | 4–5 per partita (15 normali) | 18–66, addensamenti 46' e 56' | apertura, intervallo, finale | testo variabile per seme | Indiretto: contatori letti in `:31956`, `:30795`, `:35366` (effetto non misurato) |
| Scelta su scheda | 1–2 per partita (15 normali); 23/23 per timer | 22–66 | come la scheda | 2–3 opzioni; scattata sempre l'indice 0 | Stesse scritture della scheda (`:29637`–`:29640`) |
| Ordine del mister | Non osservato (0 rilevazioni) | 28', 63', 75', reazione al gol | fissi | scelta automatica per punteggio/momento | Sì, diretto: bonus, possesso, momentum, deriva (`:31008`–`:31014`) — non misurato |
| Grida del mister | Non osservate (0) | durante il gioco | seleziona per momento | testo variabile | Non verificato (non ho trovato scritture di stato) |
| Sostituzione | 1 su 15 normali (min 78) | 56–80 se stanchezza ≥ 60 | fissa dalla stanchezza | nessuna scelta del giocatore | Sì: l'eroe esce (`subbedOff`) |
| Panchina | Non confermata (0 su 3 forzate) | — | — | — | Schede bloccate in panchina (`:32535`) |

## Limiti dichiarati

- Scelte sempre automatiche (timer, indice 0): il dato **non dice come un giocatore sceglierebbe**. Serve un collaudo con scelte umane (o un percorso che registri la scelta del PO).
- Ordini e grida non osservati: il metodo non li vede con il default. Non dimostra che non escano.
- Panchina non confermata: nessun campione valido.
- Effetti sugli esiti non misurati: per le schede, il motore legge i contatori (riga citata), ma non ho confrontato partite con e senza scheda.
- Campione: 15 partite normali; è sufficiente per le frequenze, ma non per gli effetti.
- Il riscontro della panchina forzata (`bench:false`) è un testimone del gioco (`__CPM_SUBOFF`): se il testimone stesso è sbagliato, il dato non regge. Non l'ho verificato contro il comportamento visivo.

## Stato

NON CHIUSO — il censimento delle schede e delle scelte è completo su 15 partite normali, ma restano aperti tre punti: gli ordini e le grida non sono osservati con il default (metodo da rivedere), il campione in panchina è vuoto (la panchina forzata non è entrata, `bench:false`), e tutte le scelte sono automatiche (il dato non dice come sceglierebbe un giocatore).
