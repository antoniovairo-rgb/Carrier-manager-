# Rapporto giro 13 — CL194: rimettere in pari la classifica dei salvataggi già colpiti

Ramo `sviluppo/classifica-194-migrazione`, partito da `poc/marioprada-character-system` (7.999.165).
Decisione PO 14/10 (`docs/governo/DECISIONI.md`, «14/10 mattina — questionario», punto 3): «Sì, ripara i salvataggi».
Eccezione alla zona G concessa solo per questo difetto. Niente bump di `GAME_VERSION` né di `SAVE_VERSION`.

## 1. Il difetto, in breve

- La partita di campionato giocata **dal vivo** passava a `updateStandings` il NOME dell'avversario («FC Altoadige Primavera»)
  invece dell'id. Il punto è `src/18-career-app.jsx:3694`; il nome nasce da `src/15-*.jsx:9551` (`opponent:opponent?.name||opponent?.n`).
- In `src/09-audio-scout-anagrafiche.jsx:1401` (`updateStandings`) l'avversario si cerca per id o per `n`. Nei salvataggi Primavera
  le righe hanno `n` senza il suffisso («FC Altoadige»), quindi non lo si trova:
  - l'avversario **non riceve il risultato speculare**;
  - entra negli accoppiamenti casuali al posto suo. Con 18 squadre restano 17 «altre», quindi una squadra gioca il turno di
    riposo contro nessuno (`byeTeam`, `src/09:1443`): una partita **fantasma**, con gol fatti e subiti senza contropartita.
- La correzione 7.999.162 vale solo per le partite future. Per i salvataggi già colpiti serviva una riparazione.

## 2. Misura (prima di correggere)

| Salvataggio | Squadre | Giornate giocate (di cui simulate) | GF / GS | V / P | Pareggi | Partite per squadra |
|---|---|---|---|---|---|---|
| `fixtures/save-195-primavera-w39.json` (salvataggio del PO) | 18 | 34 (3) | 792 / 789 (**+3**) | 229 / 225 (**+4**) | 158 | 34 tutte |
| `fixtures/save-194-primavera-w38.json` (il 195 riportato alla W38) | 18 | 33 (3) | 790 / 787 (**+3**) | 228 / 224 (**+4**) | 158 | eroe e `sdt` 33, le altre 16 a **34** (incoerente col calendario) |
| `fixtures/save-194-cl194-dal-vivo.json` (**nuovo**: 194 + 34ª giornata giocata dal vivo con `__CPM_NO_CL194`) | 18 | 34 (3) | 793 / 789 (**+4**) | 229 / 225 (+4) | 158 | 34 tutte |
| `fixtures/save-190-s12-ovr93.json` (pro, S12) | 18 | 26 (2) | 647 / 647 | 183 / 183 | 102 | 26 tutte (in pari) |

Il salvataggio «dal vivo» è stato costruito con `CPM_RED=1 CPM_DUMP=… node classifica-194.mjs` (opzione `CPM_DUMP` aggiunta al guardiano).
Ecco cosa è successo nella giornata giocata col difetto (eroe 3-1 in trasferta contro `sdt`):

- l'eroe ha avuto il suo risultato corretto;
- `sdt` invece del risultato speculare (36-57) ha avuto una sconfitta 0-1 contro nessuno (35-55);
- lo sbilancio GF−GS della lega è passato da 3 a 4.

È lo stesso effetto che `classifica-194` misura in rosso.

### Quali righe sono sbagliate, e cosa si può ricostruire

- **Ricostruibile esattamente:** la riga dell'eroe e il risultato speculare di ogni suo avversario. Sono le giornate del
  calendario (`player.calendar[].result`, dal punto di vista dell'eroe: `homeScore` sono i gol dell'eroe, come li somma `updateStandings`).
  Su 195 e 194 la riga dell'eroe in classifica coincide con la somma delle sue giornate: i punti dell'eroe sono giusti, come già misurato.
- **NON ricostruibile (lo dichiaro):** quali giornate siano state colpite e quale squadra abbia preso la partita fantasma in ciascuna.
  La classifica conserva solo i totali, e le partite fra le altre squadre non sono salvate da nessuna parte (né `matchHistory`, né `log`).
- **Prova che la storia non si può ripercorrere.** Ho rifatto la stagione del 195 con `updateStandings` e i semi del gioco
  (`standingsSeed(club, stagione, settimana)`, gli stessi di tutti i percorsi). Ho provato 3 ordini iniziali (lega ricalcolata,
  calendario, classifica salvata) × 2 ipotesi (nessuna giornata colpita / tutte le 31 giornate dal vivo colpite). Risultato:
  **17 righe su 18 diverse dal salvato in tutti e 6 i casi**. Sbilancio prodotto (GF−GS / V−P / parità dei pareggi):
  0/0/0 nelle ipotesi «nessuna», +3/+1/dispari, +13/+11/dispari e −8/+1/dispari nelle ipotesi «tutte». Nessun caso riproduce +3/+4/pari.
  - Il salvataggio pro 190 invece si ripercorre esattamente (0 righe diverse).
- **Quante giornate sono state colpite: non posso confermarlo.** Lo sbilancio piccolo (+3) **non** prova che le giornate colpite
  fossero poche. In ogni giornata colpita la vittoria dell'eroe (in media +1,5 di differenza reti) e la partita fantasma (di solito una
  sconfitta: il prestigio Primavera 20-65 sta sotto il 65 di riferimento della formula del riposo) si compensano in parte. Le ipotesi
  provate danno valori fra −8 e +13. Inoltre, con le righe salvate senza «Primavera», nel codice prima della 7.999.162 **ogni** partita
  di campionato Primavera giocata dal vivo era colpita; non sono riuscita a stabilire da quale versione le righe abbiano questi nomi
  (clone superficiale: 80 commit).
- **Una giornata colpita può lasciare la lega in pari per caso.** Nel rosso di `classifica-194` di questo giro la vittoria 3-1
  dell'eroe e una partita fantasma persa 0-2 si sono annullate: GF−GS 0 → 0, anche se `sdt` non ha il risultato speculare.
  Un salvataggio così non si distingue dai dati, e la riparazione non lo tocca (rischio dichiarato al §6).

## 3. Correzione

**`src/09-audio-scout-anagrafiche.jsx:1502` — `riparaClassifica194(p)`** (funzione pura, accanto a `rebuildStandingsFromCalendar` `:1485`).
Interviene solo se valgono **tutte** queste condizioni:

1. c'è almeno una giornata di campionato giocata **dal vivo** (senza `simulated`), perché il difetto nasce solo lì;
2. le squadre della classifica sono esattamente quelle del calendario (eroe + avversari, `leagueClubsFromCalendar`);
3. la riga dell'eroe coincide con la somma delle sue giornate (partite, V/N/P, GF, GS, punti). È la firma del difetto: punti
   dell'eroe giusti, lega sbilanciata. Questa condizione esclude anche i calendari con convenzioni diverse;
4. la lega è sbilanciata: ΣGF ≠ ΣGS, oppure ΣV ≠ ΣP, oppure numero di pareggi dispari.

In quel caso la classifica si rifà dalle giornate giocate, come il 7.999.102 per i pro:

- gli **id** degli avversari, quindi ognuno riceve il risultato speculare;
- le **anagrafiche delle righe salvate** (nome, prestigio, Primavera; `CLUBS` darebbe nome e prestigio della prima squadra);
- i semi del gioco. Le gare fra le altre squadre si **risimulano** (dichiarato nel log del giocatore).

Il risultato si accetta solo se torna in pari **e** lascia identica la riga dell'eroe; altrimenti la funzione ritorna `null` e non
cambia nulla. È **idempotente**: una lega in pari non soddisfa la condizione 4.

**`src/17-menu-creazione-pannelli.jsx:1853` — dentro `migratePlayer`** (chiamata dalla `useEffect` di migrazione di CareerApp,
`src/18-career-app.jsx:277`), subito dopo la riconciliazione STAB-12/102 e il riallineamento del calendario U18:

- applica la riparazione;
- aggiunge una riga al log del giocatore («📋 Classifica riallineata: … i tuoi punti non cambiano, le partite fra le altre squadre
  sono state risimulate»);
- scrive il testimone `window.__CPM_MIG194`.

Il resto della zona G non è toccato. Nessun nuovo campo nel salvataggio.

**Interruttore rosso:** `window.__CPM_NO_MIG194` spegne la riparazione.

## 4. Prima / dopo (misurato)

| Salvataggio | Prima GF/GS · V/P | Dopo GF/GS · V/P | Eroe | Partite per squadra | Ricarica |
|---|---|---|---|---|---|
| 195 (PO) | 792/789 · 229/225 | **804/804 · 235/235** | identico (34g 87pt, 1°) | 34 tutte | classifica identica, nessun nuovo intervento |
| 194-dal-vivo | 793/789 · 229/225 | **806/806 · 235/235** | identico (34g 90pt, 1°) | 34 tutte | identica |
| 194 (W38) | 790/787 · 228/224 | **780/780 · 227/227** | identico (33g 87pt, 1°) | **33 tutte** (prima 16 squadre a 34) | — |
| 190 (pro, in pari) | non toccato: classifica identica al caricamento con `__CPM_NO_MIG194` | | | | |

**Costo, da sapere prima di promuovere.** Le gare fra le altre squadre sono risimulate, quindi la classifica delle **altre**
squadre cambia molto:

- sul 195 cambiano posizione 16 squadre su 17;
- scarto di punti mediano 8, massimo 25. Per esempio `bres` passa da 2ª con 55 punti a 18ª con 30, e `sdt` da 18ª a 6ª.

Nei tre salvataggi l'eroe resta 1° con gli stessi punti. In un salvataggio con l'eroe a metà classifica la sua **posizione** può
cambiare, anche se i punti restano gli stessi. Una riparazione che rimettesse in pari senza risimulare non è possibile senza
inventare quali squadre abbiano preso le partite fantasma (§2).

## 5. Guardiano e verifiche

**`tests/visual/migrazione-194.mjs`** (`npm run migrazione-194`, rosso `npm run migrazione-194:rosso`).

- **Verde:** su 195 e 194-dal-vivo, dopo il caricamento:
  - GF = GS, V = P, pareggi pari;
  - ogni squadra con le giornate del calendario;
  - riga dell'eroe identica;
  - testimone presente.
  Ricaricando il salvataggio migrato la classifica è identica e il testimone non scatta. Sul 190 (in pari) la classifica è identica
  a quella del caricamento con la riparazione spenta: le altre migrazioni, come il recupero 103 delle giornate mancanti del 190,
  agiscono uguali nei due bracci.
- **Rosso** (`__CPM_NO_MIG194`): lo sbilancio di 195 e 194-dal-vivo resta e il testimone non scatta. Il guardiano esce 0 solo se lo vede.

Il guardiano è aggiunto alla mappa della catena `mirata` (`ci-runner.mjs`) per `src/09` e `src/17`, insieme a `classifica-194`
e `classifica-102`.

| Verifica | Esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs` | ✓ identico byte per byte (21 frammenti) |
| `migrazione-194` | ✅ verde |
| `migrazione-194:rosso` | ✅ rosso come atteso |
| `career-invariants` | ✅ tutti gli invarianti tengono |
| `save-compat` | ✅ 12 pass · 0 fail |
| `classifica-102` / `classifica-102:rosso` | ✅ PASS / ✅ rosso come atteso |
| `classifica-194` / `classifica-194:rosso` | ✅ verde (sdt 52-48 = ricostruita, GF−GS 0→0) / ✅ rosso come atteso |
| `node ci-runner.mjs mirata` | vedi §7 |

## 6. Rischi

1. **Classifica delle altre squadre rimescolata** (§4). È il prezzo di rimettere in pari senza inventare. Se il PO preferisse
   lasciare intatte le altre righe, l'unica alternativa onesta è non riparare (spegnere con `__CPM_NO_MIG194` o togliere la chiamata).
2. **Fine stagione:** il 195 è alla W39. La chiusura della stagione leggerà la classifica riparata (posizioni, premi delle altre
   squadre). L'eroe resta 1° in tutti i salvataggi misurati; non l'ho verificato su un salvataggio con l'eroe in zona promozione o
   retrocessione.
3. **Difetto non visibile:** un salvataggio colpito che per caso è in pari (§2) non viene riparato.
4. **Solo stagione corrente:** le stagioni passate (storico, posizioni finali già archiviate) non si toccano. Lì la classifica non
   esiste più.
5. **Altre cause di sbilancio:** se lo sbilancio nasce da un'altra causa ma le quattro condizioni valgono, la riparazione interviene
   comunque. Le condizioni 1-3 restringono il campo, ma non distinguono la causa.
6. Nuovo fixture `save-194-cl194-dal-vivo.json` (160 KB), derivato dal salvataggio del PO già nel repo.

## 7. Catena `mirata`

`node ci-runner.mjs mirata` sul ramo, build 7.999.165 + questo lavoro (file toccati rispetto a `main`: src/07, src/09, src/17, src/18):
**✅ catena mirata su 7.999.165: 31/31 verdi.** Il giro è registrato in `docs/governo/STABILITA.json`.

- Passi del nucleo e mappati, tutti verdi. Fra questi: `migrazione-194` (86 s), `classifica-194` (265 s), `classifica-102`,
  `partita-rigiocata-194` (538 s), `career-critical` (744 s), `save-compat`, `test:logic`, `design-system`, `typing-shortcuts`,
  `recupero-103`, `pro-rivale-176`, `anteprima-212`, `testata-209`, `intervista-231`, `cross-218`, `lessico-218`, `finestra-230`.
- ⚠️ **`nomi-219` instabile:** verde alla seconda prova, 8554 s in totale. Il primo rosso: «vicini 88% su 24 nominati (servono
  ≥90%)». È un guardiano del motore di partita sul salvataggio pro 190: la riparazione non tocca quel salvataggio (lega in pari,
  provato da `migrazione-194`). Era già segnato instabile in `STABILITA.json` (3 prove in un giro precedente). Va riparato a
  parte, non ripetuto (decisione PO 13/10).
