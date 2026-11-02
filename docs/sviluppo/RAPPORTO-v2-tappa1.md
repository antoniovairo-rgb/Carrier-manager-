# Grafica V2 «Notte da stadio» — tappa 1 (PO-302)

Ramo `sviluppo/v2-tappa1` (da `lavoro/179`). Riferimento: `docs/design/grafica-v2/` (V2Home, V2HomePC, V2Carriera, V2CarrieraPC).
`GAME_VERSION` non toccato; `src/12`, `src/14`, `src/15` e `docs/governo/*` non toccati.

## 1. Tema

- **`TH_V2`** in `src/01` (subito dopo `TH_DARK`, da cui parte: `dk:true`, quindi tutte le varianti scure gia' tarate restano
  valide). Fondo `#0d0f14`, superfici `#1a1e27` / `#11141b` (incassi) / `#262b37` (tasti secondari), testo `#f4f1ea` e
  `#9aa3b2`, oro `#e8b44a` (eroe, voti, record, premi), verde/giallo/rosso/blu `#4ade80 #fbbf24 #f87171 #60a5fa` per gli stati.
  I bordi sono in esadecimale (non rgba) perche' molte card ci appendono un'alfa.
- **Applicazione**: `temaAttivo()` sostituisce `darkMode?TH_DARK:TH_LIGHT_ORIG` nei due punti dove il gioco applica il tema
  (`src/18` CareerApp, `src/19` App). Il tema chiaro **oggi non ha un comando** (dal 7.947 «il tema e' uno»): scelta prudente,
  nessun comando nuovo; la grafica di prima si riottiene solo con l'interruttore rosso **`__CPM_NO_V2`** (tema chiaro, barra e
  home della 178, identici).
- **Caratteri**: Barlow e Barlow Condensed sono **gia' incorporati inline** in `src/00` (woff2 in base64, OFL, gia' nei crediti).
  Nessun file nuovo: la V2 chiede 800 per i numeri, il gioco ha 600/700 di Barlow Condensed; il browser usa il 700 (nessun
  grassetto sintetico). Costante `FONT_TV` per titoli e numeri grandi.
- **Tasti**: `Btn v="primary"` chiaro (`#f4f1ea` su `#0d0f14`, 17:1), `secondary` `#262b37` (testo 12,8:1). Solo in V2.

## 2. Navigazione

Tutta CSS in `src/19` dietro `v2On()`, classe `cpm-v2nav` sulla barra (`src/18` carriera, `src/19` home fuori carriera).
- **Telefono / tablet verticale (< 900 px)**: riquadro `#1a1e27` a raggio 20 staccato di 12 px dai bordi, scheda attiva a
  **pillola chiara** con il pallino del colore del club (variabile `--cpm-club`). La fascia esterna resta **a tutta larghezza e
  opaca** (giro 97 D1: le card non scorrono visibili ai lati). Strisce Sostieni/Idee come testata del riquadro.
- **PC / tablet orizzontale (>= 900 px)**: barra laterale `#11141b`, voci a pillola alte 46 px in Barlow 15 px, Sostieni/Idee
  in fondo a tutta larghezza (giro 97 D17).
- **Scostamento dalla tavola**: le voci sono **7, non 6** — resta «Opzioni» (le Impostazioni stanno solo li': toglierle avrebbe
  tolto una funzione). Proposta per la tappa 2: spostarle in un ingranaggio nella testata come in V2Home.

## 3. Home carriera

- **Prossima partita** nel colore del club (`data-cpm="prossima-v2"`): righe diagonali, cerchio di centrocampo, stemmi su
  piastrella chiara, nome in carattere TV, **forma V/N/P** (ultime 5, quadratini con la lettera, titolo col risultato),
  posizione in classifica, forza dell'avversario / precedenti / peso della gara, pillola «SETT. N · CASA/TRASFERTA».
- **Comando**: con la partita della settimana il tasto principale vive **dentro il riquadro** (stesso handler `handleContinua`,
  stesso `data-cpm="avanza23"`, stessa etichetta «Vivi la settimana» / «Gioca vs …»); la barra appiccicata sopra non compare
  per non duplicarlo. Senza partita servita, la barra appiccicata resta (ridisegnata chiara).
  **Scostamento**: niente tasto «Simula» separato. Oggi simulare passa dal prompt Gioca/Simula (decisione del mister:
  titolare/panchina/non convocato, squalifica, infortunio); un tasto diretto sulla home avrebbe scavalcato quel passaggio.
  Scelta prudente: un comando solo + «Calendario». Da decidere col PO in tappa 2.
- **Numeri della stagione**: Partite / Gol / Assist / Voto medio in Barlow Condensed 34 px, voto in oro, linee di tendenza
  conservate. (La tavola mostra «Posto»: la posizione e' gia' nella testata e nel riquadro della partita, «Partite» non e' stato tolto.)
- **Figurina piccola** (cornice oro da OVR 85, argento sotto: il gioco non aveva una regola per l'eroe) con nome, ruolo, eta',
  ruolo in squadra e **anelli Forma (verde) e Morale (blu)** (`data-cpm="eroe-v2"`).
- **Spogliatoio**: etichetta oro con pallino. Le altre card (impulsi, progetto, sponsor…) restano dov'erano col nuovo tema.

## 4. Carriera › Profilo

`data-cpm="carriera-v2"` in cima al profilo: **figurina grande** (larga min(250, 62% dello schermo)) con cornice oro/argento,
OVR, ruolo, nazione, volto (stesso catalogo della testata, ripiego sull'avatar), cognome che si restringe invece di tagliarsi,
**sei attributi** (TIR PAS DRI VEL FIS TEC — mentalita' e posizionamento restano nelle schede di sempre); **totali di carriera**
(presenze, gol, assist, trofei in oro); **gol per stagione** da `player.history` + stagione in corso, record in oro
(«Record: N (St. S)», o il `records.topSeasonGoals` se lo storico e' incompleto). Su PC figurina a sinistra e colonna a destra.

## Misure

| | valore |
|---|---|
| contrasto minimo nei riquadri V2 e nella barra (4 formati, WCAG) | **4,99:1** (home), 6,56:1 (carriera) |
| voci della barra (tocco) | 52 px di altezza; larghezza minima 40,3 px a 412, 45,9 a 360 (barra-360-72) |
| spazio fra i riquadri V2 della home | **7,8 px** a schermo (giro 91: ~8) |
| scorrimento orizzontale | 0 px nei 4 formati |
| `griglia-mobile` (360-430 px, 13 schermate) | contrasto sotto soglia **0** su tutte dopo le correzioni (vedi sotto) |

## Guardiano nuovo: `tests/visual/grafica-v2.mjs` (`npm run grafica-v2`)

Quattro formati (412x915, 820x1180, 1180x820, 1440x900), salvataggio del banco con la partita della settimana servita.
Giudica palette, caratteri, barra (pillola, tocco, D1/D17), home (prossima partita, figurina, anelli, spazi), carriera
(cornice d'oro con OVR 86, 6 attributi, grafico col record in oro), testi tagliati, scorrimento orizzontale e contrasto WCAG.
- **Verde**: 4 formati, contrasto minimo 4,99:1.
- **Rosso** (`CPM_PROVA_ROSSO=1` → `__CPM_NO_V2`): cadono PAL, NAV e HOME in ogni formato (anche CARR). Verificato.
- In `package.json` (verde + rosso) e in `ci-runner.mjs`: catene `carriera`, `completa`, `grafica`; MAPPA per src/01 (voce
  `0[0-8]`), src/11 e 17, src/18, src/19.
- Correzioni dello strumento in corso d'opera (non del gioco): il testo SVG degli stemmi e' escluso dal contrasto (il suo fondo
  e' la forma dello stemma), la conta degli attributi non usa `\b` (testo «84TIR» contiguo).

## Guardiani esistenti (uno alla volta)

| guardiano | esito | note |
|---|---|---|
| `design-system` | **verde** | primo giro rosso: 2 raggi a mano nella figurina piccola → token (difetto vero, corretto) |
| `griglia-mobile` (360-430 px) | **verde**, contrasto sotto soglia 0 su 12 schermate su 13 | primo giro: 29 testi sotto soglia su 4 schermate (difetti veri, corretti); al secondo giro restavano 2 nodi in Nazionale (colore della Nazionale nella riga «tu»), corretti dopo; non rigirato dopo l'ultima correzione e dopo i ritocchi di raggi/barra |
| `spazio-296` | **verde** + rosso | 44 schermate, distanze 6-10 px |
| `schermate-97` | **verde** + rosso | primo giro rosso D16: ultime fisarmoniche sotto la barra V2 (35-39 px) → riserva in fondo 140 px (difetto vero, corretto) |
| `pc-tablet-292` | **verde** + rosso | primo giro rosso su un solo punto della partita a 1366 px («con Tab il fuoco non arriva a una scelta della punizione», src/15 non toccato): al secondo giro verde, da tenere d'occhio come instabile |
| `barra-360-72` | **verde** + rosso | primo giro rosso: a 360 px voci da 32,9 px e etichette a 12,4 px (difetto vero) → sotto i 380 px la barra V2 torna a filo dei bordi: voci >= 45,9 px, etichette a 15,1 px |
| `home-066` | **verde** (120 riquadri, 7 situazioni) | primo giro rosso: raggi 14/18/22 e corpi 16/18/26/30/34 fuori scala (difetti veri → token); la regola F1 «card neutra» non si applica piu' al solo riquadro della prossima partita, che la V2 vuole nel colore del club (guardiano aggiornato e spiegato, soglie invariate) |
| `piccoli-85` | **verde** | |
| `stile-unico-75` | **verde** | |
| `crea-home-295` | **verde** | |
| `crediti-254` | **verde** | nessun font nuovo: crediti invariati |
| `grafica-v2` (nuovo) | **verde** + **rosso** | contrasto minimo 4,99:1, spazi 7,8 px |

Non lanciati (fuori dalla consegna): catena intera, gate 14/14, guardiani di partita.

## Difetti veri trovati e corretti

- `design-system`: 2 raggi scritti a mano nella figurina piccola che hanno gia' un token → `RAD.sm`/`RAD.xs`.
- `griglia-mobile` (e foto): colori chiari scritti a mano, illeggibili sul fondo notte — velo bianco dei salvataggi liberi nel
  menu (1,6:1), pillola del ruolo nella figurina della creazione (1,09:1, `TH.text` dava per scontato un tema chiaro), etichetta
  della fase di carriera (2,35:1, contrasto calcolato sul fondo sbagliato), pareggio nel calendario (1,39:1), colore della
  Nazionale come testo (1,50:1). Tutte dietro `TH.v2`: col rosso la 178 resta identica.

## Foto (`docs/sviluppo/foto-v2-tappa1/`)

`prima-*` (178) e `dopo-*` per telefono, tablet verticale, tablet orizzontale e PC su Home e Carriera › Profilo; menu al
telefono; `dopo-altre-schermate-tel.jpg` = giro sulle schermate non ancora rifatte (Stagione, Calendario, Club, Agente,
Ufficio, Nazionale), scattato **prima** delle correzioni di leggibilita' (si vedono i salvataggi liberi grigi poi corretti).
Lo storico/gol per stagione nelle foto e nel guardiano e' **sintetico** (il banco non ha gol nello storico): serve solo a
disegnare il grafico.

## Punti aperti

1. Voce «Opzioni» nella barra (7 voci invece di 6) e tasto «Simula» assente nel riquadro: scelte prudenti, da decidere.
2. La **testata** (granata, con Forma/Morale/Fatica) e' rimasta quella di prima col nuovo tema: Forma e Morale compaiono due
   volte nella home (testata + anelli). La V2Home ha una testata compatta: e' il primo candidato della tappa 2.
3. Il volto dell'eroe ha fondo bianco: dentro la figurina grande si vede come una foto incorniciata, non scontornata.
4. Barlow Condensed 800 non e' incorporato (si usa il 700): differenza minima, aggiungerlo costa ~45 KB.
5. Gli artefatti di `griglia-mobile` in `docs/collaudo-grafico/g0/` sono stati riportati a com'erano (rigenerati a ogni giro):
   le foto V2 della griglia non sono committate.

## Proposta per la tappa 2

Testata compatta V2 (stemma, club, stagione/giornata, Salva e Opzioni come icone) che toglie i doppioni e la settima voce;
poi Stagione (classifica a blocchi, calendario), Club e Agente/Ufficio dalle tavole V2Stagione/V2Club/V2Agente/V2Ufficio,
con `grafica-v2` esteso a quelle schede.
