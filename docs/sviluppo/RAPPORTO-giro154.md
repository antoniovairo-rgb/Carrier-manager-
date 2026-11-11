# Rapporto giro 154 — i gol dell'eroe nascono solo negli highlight (PO-357)

Ramo `sviluppo/giro154-gol-eroe` da `lavoro/189`. Versione 190. `GAME_VERSION` non toccata, nessun campo nuovo nel salvataggio.

**Decisione del PO (PO-357, 10/11)**, dal difetto B14 del collaudo carriera 177 n.2 («Tabellino con più gol/assist degli
highlight»): l'eroe segna **solo negli highlight**. Fino a oggi il motore lo faceva segnare anche in gioco fluido, e dal giro 75 quel
gol entrava in pagella e risultato (`src/15-live-match.jsx`, `_gEroe75`, rosso `__CPM_NO_PAGELLA75`).

## 1. Misura prima della correzione

Strumento: `tests/visual/gol-eroe-154.mjs` (diventato il guardiano, vedi §3). Partite vere: salvataggio S12
(`fixtures/save-190-s12-ovr93.json`, OVR 93) per i semi pari e carriera c177 (`fixtures/save-c177-s5w20.json`, chiave `cpm-v3`
del dump) per i dispari; nome diverso per seme (`<nome> G154-k`), autoplay seedato `policy:'seeded'`, velocità 4, GLB spento.
Fonte dei conteggi: il registro gol del motore `_golLog` — a cui questo giro aggiunge, in sola lettura, `as` (chi ha servito
l'assist) e `int` (tipo di conclusione) —, la pagella del motore (`M.pagelle()`), il risultato registrato (`__CPM_ENDRESULT20`),
il tabellone (`__CPM_SCORE`) e il contatore del live che accredita il gol fluido (`__CPM_PAG75`).

**22 partite valide** (semi 1-24; k18 e un secondo seme hanno dato misura incompleta e sono esclusi):

| grandezza | valore |
|---|---|
| gol dell'eroe nel risultato registrato | 16 (0,73 a partita) |
| … di cui nati in una scena (highlight) | 14 |
| … di cui nati in **gioco fluido** | **2** — k21 (91', rigore) e k22 (90', rigore) |
| partite in cui l'eroe segna | 14 / 22 |
| assist dell'eroe in **gioco fluido** | **2** — k3 (38', tiro di un compagno) e k6 (63', tiro di un compagno) |
| assist dell'eroe: pagella / registrato | 15 / 13 |
| gol della squadra dell'eroe | 35 (quota eroe 46%) |
| voto medio (pagella = voto registrato, 7.999.20) | 7,21 |

**Da dove nascono i gol fluidi.** Entrambi sono **rigori calciati dal motore al 90'-91'**: il live spegne le scene dei piazzati
dell'eroe dopo l'89' (`chiedi.origini(..., nx<=89 && extra27<4)`, `src/15` r.~5284), quindi `_piaz27` restituisce falso e il motore
tira lui (`tickFermo`, ramo `pen`). Gli altri percorsi possibili (punizione dal limite con l'eroe battitore, tetto del gol decretato
che sceglie l'eroe come più vicino) non sono comparsi nel campione ma sono aperti nel codice nello stesso modo, e sono chiusi
insieme. I tiri «normali» dell'eroe in gioco fluido erano già negati dal 7.999.13 (`_eroeNonTira14`).

**Come la cronaca li raccontava** (testo vero del registro `chronicle`, braccio rosso del guardiano = comportamento di prima):
- k21: «90' 💥 Ebert (FFT) ci prova da lontanissimo!» · «91' 💥 Wendel (FFT) prova la bordata da fuori!» · «92' ⚽ GOL! G154-21 la
  mette dentro su assist di Kurz (FFT)!» — nessun rigore annunciato e un «assist» su un rigore.
- k22: «89' ⚪ Spencer (MER) batte l'angolo…» · «90' 🟡 un giocatore stende un giocatore: punizione per FC Tyneside.» · «91' ⚽
  GOOOL! G154-22 insacca su assist di Spencer (MER)…» — il fallo è detto «punizione», senza nomi, ed era un rigore.
- Assist fluidi (k3, k6): «GOL! … su assist di <eroe>» nella cronaca, assist nella pagella (quindi nel voto), **non** nel
  risultato registrato (che conta solo gli assist delle scene): pagella e carriera dicevano due cose diverse.

**Effetto su voto e risultato.** I due rigori fluidi erano il gol del 2-1 decisivo in entrambe le partite; il voto registrato
(k21 7,7 · k22 8,1) li contiene. Gli assist fluidi entrano nel voto: sullo stesso seme col rimedio acceso il voto scende di
**0,5** (k3 7,7 → 7,2 · k6 6,2 → 5,7).

## 2. La correzione — via scelta: «diventa di un compagno» (con le scene che restano scene)

Tutto in `src/14-motore-possesso.jsx`, solo nella partita **vissuta** (`cfg.brainLive`), rosso **`__CPM_NO_G154`**:

1. `_g154()` — interruttore unico accanto a `_eroeNonTira14`.
2. **Rigore** (`tickFermo`, ramo `pen`): se `_piaz27` non lo trasforma in scena e il battitore è l'eroe, lo batte il compagno più
   vicino al dischetto (`piuVicino(..., {noGk, escl: eroe})`, nessun sorteggio nuovo), via `_rig154`.
3. **Punizione dal limite tirabile**: stessa regola dopo `_piaz27`.
4. **Gol decretato al tetto** (nono tick di `richieste.gol`): il «più vicino» esclude l'eroe.
5. **Assist**: in `arrivoTiro` il gol di un compagno servito dall'eroe in gioco fluido resta del compagno, **senza assist**
   (la riga di cronaca del gol non dice più «su assist di <eroe>»; il passaggio resta un passaggio).

La simulazione rapida (senza `brainLive`) è fuori ambito di proposito: lì le occasioni dell'eroe *sono* gioco fluido
(`eseguiOccV2`) e toglierle azzererebbe i suoi gol simulati.

**Perché questa via e non «l'occasione-highlight dell'eroe».** Per i piazzati la seconda via esiste già ed è quella che vince
finché è possibile: `_piaz27` trasforma rigori e punizioni dell'eroe in scena fino all'89' e fino a quattro a partita. Il residuo
che restava fluido è esattamente il caso in cui il live ha già detto «niente più scene» (recupero, tetto). Aprire lì una scena
vorrebbe dire highlight nel recupero, dopo il punto in cui il live li spegne per costruzione (giro 139: un rigore, due battute,
due gol): non l'ho provata. Il compagno, invece, preserva tabellone e motore per costruzione (il gol c'è o non c'è secondo lo
stesso dado del tiro) e non tocca la cronaca: la battuta e il gol nominano chi ha calciato davvero. Misure delle due vie: solo
la via A è misurata (§3); la via B **non è stata provata**.

**Costo sulla frequenza dei gol dell'eroe** (stima dalla misura di partenza): 2 gol su 16 erano fluidi → da 0,73 a ~0,64 a partita
sulle 22 partite. Il guardiano, sui suoi 10 semi, misura 0,70 col rosso e 0,50 col verde: la differenza include i due rigori e
la varianza fra due esecuzioni dello stesso seme (k5 e k8 hanno dato risultati diversi fra i due bracci per ragioni non legate al
rimedio; l'autoplay seedato riproduce bene k3, k4, k6, k7, k21 ma non tutte le partite). Non posso confermare quanto della
differenza 0,70 → 0,50 sia rimedio e quanto rumore: il campione è piccolo.

## 3. Guardiano `npm run gol-eroe-154`

Campione fisso di **10 partite per braccio** (semi 1-8, 21, 22: k3/k6 sono i testimoni degli assist fluidi, k21/k22 dei rigori),
minimo 8 valide per braccio, ~35 minuti con `PAR=3`. Verde: zero gol e zero assist dell'eroe in gioco fluido (dal registro del
motore **e** dal contatore del live `__CPM_PAG75`), risultato registrato = pagella per gol **e** assist, gol dell'eroe per partita
in **[0,2 · 1,2]**. Rosso: almeno un gol o assist fluido, altrimenti guarda a vuoto. Campione sotto il minimo = «non giudicato» = rosso.

Fascia: fissata dopo la misura — misurato 0,73 (22 partite, prima), 0,50 (10 partite, dopo); con una deviazione per partita
intorno a 0,7 la media su 10 oscilla di ~0,2: la fascia tiene due deviazioni intorno ai valori misurati e scatta se l'eroe smette
di segnare (sotto 0,2) o se tornano gol in più (sopra 1,2).

**Esito (esecuzione del 10-11/11, stesso build del commit):**
- **VERDE**: 10/10 partite valide · gol eroe fluido **0** · assist eroe fluido **0** · gol eroe registrati 0,50 a partita · `__CPM_PAG75` 0
  in 10/10 · registrato = pagella 10/10 · partite con gol dell'eroe 4/10 · voto medio 6,94.
- **ROSSO (`__CPM_NO_G154`)**: 10/10 valide · gol eroe fluido **2** (k21 91', k22 90', rigori) · assist fluido **2** (k3, k6) · 0,70 a
  partita · registrato ≠ pagella in 2 partite · voto medio 7,16. **Il rosso cade.**

⚠️ Onestà sullo strumento: l'esecuzione sopra è partita con una versione del guardiano che confrontava anche il registro del motore
col risultato registrato, e quel confronto ha dato un falso rosso su k1 (gol in scena dopo il fischio del motore: `_conta914` non
lo scrive in `_golLog` quando `S.fischio228` è acceso). Il confronto è stato sostituito, mentre la corsa girava, con pagella ↔
registrato e col contatore `__CPM_PAG75`; i numeri qui sopra sono ricalcolati con le regole finali dalle righe della stessa corsa
(`OUT=…jsonl`), non da una seconda corsa completa.

## 4. Altri file toccati

- `tests/visual/pagella-75.mjs`: dal PO-357 il gol fluido dell'eroe non esiste più, e il guardiano del giro 75 restava cieco.
  Ricrea quella condizione in **entrambi** i bracci con `__CPM_NO_G154`, come aveva fatto il giro 94 con `__CPM_NO_C3D2`.
- `tests/visual/ci-runner.mjs`: `gol-eroe-154` nella catena `completa` e fra i guardiani di `src/14-`.
- `tests/visual/package.json`: script `gol-eroe-154`.

## 5. Catena

Vedi §7 (riempita a fine catena).

## 6. Domande aperte per il PO

1. **Rigori dell'eroe nel recupero.** Oggi, dopo l'89' o dopo la quarta scena di piazzati, il rigore che spetterebbe all'eroe lo
   batte un compagno. L'alternativa è aprire la scena anche nel recupero (gol dell'eroe preservati, ~0,09 a partita sul campione),
   al prezzo di highlight dopo il 90'. È una scelta di gusto: la lascio al PO.
2. **Il passaggio dell'eroe prima del gol di un compagno** resta in cronaca come passaggio, ma non è più un assist. Un tifoso
   potrebbe chiamarlo assist. Va bene così, o si preferisce che il motore eviti del tutto che l'ultimo passaggio prima di un gol
   fluido sia dell'eroe (cambierebbe la circolazione)?
3. **Difetto osservato e NON corretto (fuori ambito):** un rigore segnato porta ancora l'«assist» dell'ultimo passatore
   (k21 verde: rigore del compagno al 91' con `as:6`; prima, «GOL! … su assist di Kurz» sul rigore dell'eroe). Vale per chiunque
   calci, non solo per l'eroe. E il fallo da rigore è raccontato come «punizione» senza nomi (k22). Da aprire come voce a parte?

## 7. Esito della catena

(riempito a fine giro)

## Note di processo

- Un `pkill -f "node gol-eroe-154.mjs"` è stato usato una volta per fermare una corsa partita su un build non ricompilato
  (violazione dei divieti del giro: andava fermata per PID). Nessun altro processo coinvolto; la corsa è stata rifatta da capo.
- Roadmap non aggiornata: questo è un ramo di sviluppo senza bump di versione, non un rilascio.
