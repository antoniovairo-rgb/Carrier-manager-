# Rapporto sviluppatrice — giro 18 · PO-207 (ripartenza dopo un gol in scena) e `nomi-219` instabile

Ramo `sviluppo/ripartenza-207`, partito da `origin/lavoro/166` a `3e46b00` (7.999.166).
Zona G non toccata. Nessun bump di `GAME_VERSION`. Le righe citate sono del sorgente **dopo** la modifica.

## 1. PO-207 — regressione misurata

### 1.1 Riproduzione

Sonda `tests/visual/sonda-ko207-g18.mjs` (nuova, solo collaudo): stessa partita del guardiano (S12, autoplay seme 2071, nome +
lettera del tentativo), avvolge `tick` e `chiedi.riprendi` del motore e registra ogni passo con il suo millisecondo.

Braccio verde della 7.999.166, tentativo A: gol al 38' **dentro la scena** (`__CPM_KO207 {min:38, lato:"away", scena:true}`).

| passo motore | stato | pallone | ms |
|---|---|---|---|
| `riprendi({centro:true, lato:"away"})` | | | 147802 |
| 932-935 | kickoff | 50,50 | 147802-147803 |
| 936-939 | tenuta/volo | 50,50 → 50,48 | 147803-147804 |
| 940 | tenuta | **30,16** | 147804 |
| 941 | tenuta | 30,16 | 147879 |

Nove passi del motore **nello stesso millisecondo**: il battito del minuto (1) + **8 passi di recupero del debito MIN202**
(testimone `__CPM_DEB202` 36 → 28). Gli specchi (`_specchi898`) leggono il motore solo dopo: il calcio d'inizio (4 passi) si
consuma senza che il 2D/3D lo veda mai, e il pallone ricompare a [30,16]. Coincide coi numeri della sessione principale
([29,1], [67,19], [90,33]: sono i passi successivi della stessa sequenza).

### 1.2 Isolamento: il seme non rompe la ripartenza

Col seme spento (`__CPM_NO_SEME`) la partita **è un'altra**: il primo gol cade al 22' fuori scena. Quattro partite in più col
seme spento (tentativi B, C, D, E):

| tentativo | gol | debito MIN202 al gol | kickoff visibile? |
|---|---|---|---|
| B | 42', fuori scena | 4 | no (consumato nello stesso ms) |
| C | 21', fuori scena | 28 | no (1 passo di kickoff, palla a [30,21] nello stesso ms) |
| D | 40', fuori scena | 14 | no |
| E | 53', fuori scena | 0 | **sì** (passi a ~77 ms l'uno) |

Il difetto c'è **anche col seme spento**, ogni volta che al battito del gol resta un debito da recuperare. Il guardiano era verde
lì solo perché nel ramo «fuori scena» il testimone `dopo` si scriveva subito dopo la `riprendi`, **prima** del recupero
(`src/15-live-match.jsx:5489`). Nel ramo «in scena» quel testimone non c'era, e la sonda leggeva il pallone a campione ogni 300 ms:
cioè vedeva la verità. **Quale parte del seme rompe la ripartenza: nessuna.** SEME-a (C1-C3c) cambia i sorteggi e quindi la partita;
col seme acceso il primo gol del seme 2071 cade in una scena, e il difetto preesistente diventa visibile alla sonda. Non ho provato
C2/C3/C3b/C3c una per una perché il registro passo-passo mostra che nessun passo del burst viene da loro: tutti e nove portano
`min:39, dec:true` (battito + MIN202) e il contatore del ciclo 967/C3 (`__CPM_REC967`) resta fermo a 21.

### 1.3 Correzione (`src/15-live-match.jsx`)

- **r. 5550** — il recupero del debito MIN202 si ferma quando il motore è in `rete` o `kickoff` (solo prima del 96', dove
  SALDO149 salda tutto come prima). Il debito resta e si paga ai battiti seguenti: dipende da uno stato del motore, quindi è
  deterministico. Rosso **`__CPM_NO_KO18`**.
- **r. 5488 e 5551** — testimone `__CPM_KO207[i].fine` / `pallaFine`: lo stato del motore **a battito chiuso**, dopo tutti i passi
  del battito, in tutti e due i rami (in scena e fuori).

Dopo la correzione, stessa partita (tentativo A): stessi passi 932-940 con gli stessi stati e posizioni (la sequenza del motore non
cambia, cambia solo *quando* si paga il debito), ma a 77 ms l'uno: il calcio d'inizio dura ~300 ms reali a velocità 4 ed è visibile.

### 1.4 `seme-a` era rosso anche sulla base — corretto

Prima corsa di `seme-a` con la correzione: **rosso** (divergenze al 72' e al 92' su `chiedi.ordine226`). Controprova sul braccio
base (`FLAGS=__CPM_NO_KO18`, cioè il codice della 7.999.166 su questo percorso): **rosso uguale**, 2560/2563/2559 ingressi,
primo ingresso divergente #2498 al 92' su `chiedi.ordine226 ["home",0.45]`.

Causa: PO-226 (7.999.163). Sotto autoplay il cronometro non si ferma sulla scheda d'interazione (`src/15-live-match.jsx:4255-4256`)
e la scelta automatica la prende un timer di **35 s reali** (`:3102`): l'ordine del mister arriva al motore in un minuto deciso
dall'orologio da polso. `seme-a` non sta in nessuna catena di `ci-runner.mjs`; l'ultima verifica registrata è sulla 7.999.162, prima
di PO-226.

Correzione (**r. 4627-4635** e **r. 3102**): **solo sotto autoplay** la stessa attesa si converte in minuti di gioco
(`ceil(ms / MATCH_TICK_MS)`: 35 000 → 21 minuti; `__CPM_SCMS681=1500` di `interazioni-226` → 1 minuto) e la scelta si prende al
battito, con lo stesso indice del timer; il timer sotto autoplay non sceglie più. Gioco vero invariato: senza autoplay la partita è
ferma sulla scheda e sceglie il giocatore. Rosso **`__CPM_NO_ORD18`** (= comportamento della base, misurato sopra).

### 1.5 Guardiani

| guardiano | esito |
|---|---|
| `ripartenza-207` (riscritto: giudica `fine`/`pallaFine`, terzo braccio `__CPM_NO_KO18`) | ✅ verde 1/1 al centro (`kickoff@50,50/scena`); rosso `__CPM_NO_KO207` 0 ripartenze; rosso `__CPM_NO_KO18` `tenuta@30,16/scena` |
| `seme-a` (3 giri, seme 2311) | ✅ verde: ingressi, sorteggi per minuto e punteggio identici (1-1). I totali stampati (2556/2559/2559) sono grezzi: comprendono `scenaMuovi`/`probEroe`, esclusi dal confronto per progetto (`seme-a.mjs:19`) |
| `seme-a:rosso` (`__CPM_NO_SEME`) | ✅ diverge al 7' (entro il 15') |

`ripartenza-207` entra nella catena `mirata` per `src/15-` (`tests/visual/ci-runner.mjs:28`): la regressione è passata per le
catene mirate perché il guardiano stava solo nella catena carriera.

**Aperto:** `seme-a` resta fuori da ogni catena (≈10 minuti a corsa). Proposta al PO: metterlo nella `notte`.
