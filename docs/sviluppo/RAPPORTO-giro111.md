# RAPPORTO — giro 111 · PO-305 (D2 non più cieco) e PO-311 (regole sui controlli instabili)

Ramo `sviluppo/giro111-controlli` (da `lavoro/182` = `main` = 7.999.181). Decisione PO 07/11 «Prosegui». Solo strumenti di
controllo (`tests/visual`) e documenti: **`src/`, il gioco e `GAME_VERSION` non toccati**; `build-src` / `check-src` allineati
(«IDENTICO BYTE PER BYTE»). Sessione figlia: nessuna decisione di prodotto; le scelte prudenti sono in fondo. Prima di ogni
controllo ho registrato `free -m` e `df -h` (colonna «macchina» nelle tabelle: sempre ~13,5 GB liberi, 29 GB di disco: **la macchina
non era in sofferenza** in nessuna esecuzione). Tetto di 4 ore: il lavoro è stato **ridotto per tempo**, dichiaro sotto cosa manca.

## PO-305 — carriera3-94 D2

**Causa (strumento).** D2 aspettava che il fallo in area capitasse da solo in una partita di prova: dipende dal ritmo della
macchina e dal seme, e quando non capitava dichiarava «cieco». Misurato qui sul codice di partenza: giro con le tre partite (7, 13,
21) **tutte cieche**, 774 s, uscita 1. Una volta invece il rigore è capitato (k7, rigore al 75') e D2 ha dato **rosso**
(«1 doppi su 1», battuta dell'eroe al 78'): vedi «Da annotare per il gioco».

**Correzione (solo sonda).** La sonda **scrive nel motore, tramite il gancio di collaudo esistente `__CPM_MOTORE_OBJ`, lo stesso stato
che scrive `fermoSet("pen")`** (rigore per la squadra dell'eroe, eroe battitore), a gioco fluido dal minuto di motore 8; se l'eroe lo
sbaglia ne provoca un altro 9 minuti dopo (max 4); l'osservazione si chiude 7 minuti dopo il gol in scena. Subito dopo il gol offre al
motore un **secondo** rigore dell'eroe (è lo stato che produceva il difetto del giro 94): con la guardia dei 4 minuti
(`piazzatoGiocato`) il motore lo lascia al portiere, senza (rosso `__CPM_NO_C3D2`) ne esce una seconda scena. Il giudizio «ricalciato»
ora conta la battuta dell'eroe **o** una seconda scena di rigore entro 3 minuti. Se non riesce a provocare e vedere un gol di rigore in
scena: `D2: NON GIUDICATO (rosso, mai verde)`, uscita ≠ 0, e il braccio rosso con prove solo cieche esce 3 («ROSSO NON DIMOSTRATO»).
Nessun ramo nel gioco.

**Prova.**

| Esecuzione | Esito | Durata | Dettaglio |
|---|---|---|---|
| 5 giri consecutivi, braccio verde (`CPM_SOLO=D2`) | **5/5 verde, D2 giudicato in ognuno** | 116 · 123 · 111 · 112 · 111 s | «0 doppi su 1» (giro 1: «su 2») |
| Braccio rosso (`CPM_ROSSO=D2`, seme 7) | **rosso, D2 lo vede** | ~120 s | «1 doppi su 2», uscita 1 («FALLITO (rosso D2: atteso)») |

(Le due prove verdi/rosse a seme singolo di messa a punto, prima della correzione finale, non sono contate.)

## PO-311 — regole e censimento

**1) Regole.** Scritte in `docs/governo/PROCESSO.md`, sezione nuova «Controlli instabili» (otto regole: braccio e motivo per ultimi ·
area di tocco effettiva (rettangolo ∪ `::after`, come `EXTRA108`) · tempo di scena e non di parete · si attende un evento, mai un tempo
fisso · ripetizione dichiarata · mai abbassare soglie · «non giudicato» = rosso e ciò che il gioco non produce si provoca dalla sonda ·
censire prima di riparare) e un rimando di una riga in `CLAUDE.md`.

**2) Censimento** (un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`). Esecuzioni sul codice di
partenza, durate e motivi dei rossi:

| Controllo | Esecuzioni | Esiti | Durata | Motivo dei rossi |
|---|---|---|---|---|
| portiere-252 | 5 | **0 verdi, 5 rossi** | 431–440 s | (a) **verde KO su gi9** in 3 giri su 5 (1, 2, 4): «verso l'opposto» su un riflesso `gk_block`, con la reazione giusta; (b) **rosso mai visto** in 4 giri su 5 (0 KO; in totale 1 KO su ~33 portieri rossi, gi1 nel giro 2) |
| riserva-103 | 1 (la 2ª interrotta) | rc=124 (tetto 900 s) | 985 s | gi17 «esito mai rivelato in 160 s» in **entrambi** i bracci (160 s di parete a scena, due volte); «rosso troppo veloce: si rallenta a CPU x8» (dipende dalla velocità della macchina); la catena + caso B supera i 15 min |
| contatto-103 | 5 | **5 verdi** | 409–411 s | nessuno; rosso visto 5/5; «parate giudicate 2» ogni volta (è il pavimento: margine zero) |
| carriera3-94 D2 | 1 (+1 naturale del mattino, + giro 105) | rosso/cieco | 774 s (3 partite cieche); 279 s (rigore naturale, «1 doppi su 1») | cieco (nessun rigore dell'eroe) · una volta rosso reale |

**Cause individuate.**
- *portiere-252 (a) — strumento.* `verso` confrontava la z **di fine scena** del portiere con il lato del pallone: a parata fatta il
  portiere si riposiziona (cammina via) e quella z misurava il ritorno, non la reazione. Nei tre giri la reazione era giusta
  (+0,3…+0,9 u verso il pallone) e la z finale 1,1–1,3 u dall'altra parte. Non dipende dalla velocità della macchina: dipende dal
  campione scelto.
- *portiere-252 (b) — strumento (definizione del braccio rosso).* Con `__CPM_NO_GK252`+`__CPM_NO_PARATA258` il difetto vecchio
  compare solo se arco e piano del portiere divergono su lati opposti: serve un tiro angolato, e il bersaglio dei tiri è `Math.random`
  del gioco, quindi ogni giro ha angoli diversi. Misurato: 1 KO su ~33 portieri rossi; con **seme fisso** (provato) i pallone-z
  sono riproducibili (−1,59/−1,58, −3,67/−3,67, 4,53/4,52 su due giri) ma su tre serie di semi (4 scene l'una) i KO rossi sono **0**.
  Il braccio rosso così com'è è quasi cieco: non si ripara con una soglia (vietato) né in questo giro.
- *riserva-103 — strumento.* Attese a **tempo di parete** (160 s per scena che non rivela, due bracci, più i raddoppi di CPU
  1→2→4→8→16 e il caso B in un processo figlio): dipende dalla velocità della macchina e dura 16–20+ minuti.
- *contatto-103 — nessuna instabilità.* 5/5. Nota: «parate giudicate 2» è esattamente il pavimento (`< 2` = cieco): se una parata in
  meno viene giudicata il guardiano diventa «cieco». Non successo in 5 giri.
- *carriera3-94 D2 — strumento* (vedi sopra).

**3) Riparazioni** (solo ciò che la causa nello strumento consente).

| Controllo | Riparazione | Dimostrazione |
|---|---|---|
| carriera3-94 D2 | rigore provocato dalla sonda (sopra) | **5/5 verde** + rosso visto |
| portiere-252 (a) | `verso` giudicato sulla **reazione** (posizione 0,4 s di scena dopo il piano) e non sulla z finale; soglie 0,6 e 0,3 **invariate**; ricalcolo sui log dei 5 giri: i 3 KO verdi di gi9 spariscono, il KO rosso vero (gi1: +2,5 u dal lato opposto) resta KO. In più: **seme fisso** opzionale della sonda (`CPM_SEME252`, default 1; 0 = come prima) e **braccio e motivo per ultimi** | 3 nuove esecuzioni del solo braccio verde: **3/3 verdi, 0 KO su 7 giudicati** (222 · 218 · 220 s) |
| riserva-103 | l'attesa dell'esito è un **evento** (esito rivelato · finestra d'esito chiusa · 20 s di **scena**, `CPM_G103_SCENAMAX`) invece di 160 s di parete; il motivo del «mai rivelato» è stampato | 1 esecuzione completa del ramo principale: **verde 2/3 scene giudicate, 0 a conclusione in corsa · rosso 2/3 giudicate, 2 a conclusione in corsa** (il difetto si vede); la scena gi17 non rivela mai l'esito (nota per il gioco sotto); il caso B è stato tagliato dal mio tetto di 900 s |

**Non fatto / non dimostrato (dichiarato).**
- **portiere-252 resta ROSSO nel completo** per il motivo (b): il braccio rosso non vede il difetto. Non è un verde: esce 1 con
  «rosso NON VISTO» in coda. La riparazione vera è ridisegnare il braccio rosso (un flag che riproduca il vecchio comportamento
  su un tiro angolato fissato), non toccare soglie. Il verde, invece, ora è stabile (3/3 solo-verde).
- **Le altre 5 esecuzioni**: fatte 5 (D2), 3 (portiere-252 solo verde), 1 parziale (riserva-103), 0 (contatto-103: non serviva).
  Il censimento di riserva-103 ha 1 sola esecuzione (985 s, tetto) e quello di D2 vecchio 1+1: **non sono 5**. Motivo: il tetto di 4 ore;
  riserva-103 costa 16–20 minuti a giro e D2 vecchio 13 minuti.

## Da annotare per il gioco (non corretto, come da istruzioni)
1. **D2 naturale, k7**: con rigore nato dal motore (75'), `scena_gol` al 77' e **poi `battuta*`+`tiro*` di rigore dell'eroe al 78'**
   (`__CPM_PEN94`). Può essere un difetto vero (la guardia dei 4 minuti `noPiaz94` si basa sul minuto del motore, la scena sul
   `clockRef`: possibile sfasamento) o l'effetto della registrazione; non l'ho potuto riprodurre con il rigore provocato (0 doppi).
   **Non posso confermare quale dei due.** Va indagato con una sonda dedicata.
2. **riserva-103, scena gi17**: l'esito non viene mai rivelato nemmeno dopo 20 s di scena (in entrambi i bracci, 3 giri). Può essere una
   scena che chiude in altro modo; non indagato.
3. **portiere-252**: il bersaglio dei tiri è `Math.random` non seedato nel gioco (già noto dal 7.514); è la ragione per cui il
   guardiano oscilla.

## Rigioco finale
In sequenza, uno alla volta, tetto 900 s per passo:

| Passo | Esito | Durata |
|---|---|---|
| carriera3-94 D2 (solo D2: l'unica prova toccata; D1–D9 non rigiocate) | **verde**, D2 giudicato | 112 s |
| portiere-252 (braccio verde, 3 giri) · riserva-103 (ramo principale) | vedi sopra | — |
| `npm run test:logic` | **verde** | 2 s |
| `npm run save-compat` | **verde** | 8 s |
| `npm run career-critical` | **verde** | 524 s |
| `npm run collaudo-108` | **NON CONCLUSO**: tagliato dal tetto (900 s) durante il braccio verde (schermate/partita); le righe «mancanti» stampate (`carriera-opzioni`, `momento-esordio`, `coppa-nazioni`, `provini-intro`) non le ho confrontate con la base: **non posso confermare** | >900 s |
| `npm run pc-tablet-292` | **concluso senza errori** (uscita 0; il braccio rosso stampa le sue violazioni attese) | 652 s |
| `npm run validate-situations` | **✅ PASS**, fingerprint 00001505, 0 failure | 566 s |
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | allineati («IDENTICO BYTE PER BYTE») | — |

Poiché il giro non tocca `src/` né il gioco, `collaudo-108` e `validate-situations` giudicano un file identico alla base: il
loro valore è di confermare che i controlli stessi non abbiano rotto l'harness comune (`lib/scena-252.mjs` è importato da altri sette
guardiani, ma il seme è opzionale e spento per loro).

## Scelte prudenti
- Provocare il rigore **scrivendo nello stato del motore** dalla sonda (e non con un ramo nel gioco né con il solo seme): è la
  sola via che non dipende dal ritmo della macchina; il gancio `__CPM_MOTORE_OBJ` esisteva già.
- Il seme fisso del portiere è **opzionale** e non altera gli altri sette guardiani che usano `lib/scena-252.mjs`.
- Nessuna soglia modificata in nessun guardiano.
- Commit senza `Co-Authored-By`; `STABILITA.json` **non toccato** (le sue statistiche alimentano la pagina di governo: la tabella sta qui).
