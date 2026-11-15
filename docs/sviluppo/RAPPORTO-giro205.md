# Rapporto giro 205 — PO-465 (la partita in 2D: rigori, cerimonie, rassegna e ritorno alla carriera)

Ramo `sviluppo/giro205-2d-riserva`, partito da `lavoro/195` (7.999.194, contiene il giro 196 / PO-449: oltre il tetto
`__CPM_CAP196` o a caricamento 3D fallito la partita passa al campo 2D). `GAME_VERSION` non toccata (regola fissa).
Rosso unico: `window.__CPM_NO_G205`. Guardiano nuovo: `npm run riserva2d-205`.

## 1. Come si forza la 2D (strumento)

Sonda nuova `tests/visual/misura-205.mjs`. Salvataggio da professionista con la **finale di Coppa** in calendario (round 4),
partita giocata dal percorso vero (`__CPM_CAREER.playMatch`), pilota seedato fino al gioco, poi pareggio forzato al 90' con
`__CPM_SO_FORCE` (stesso varco di `lotteria-191`) → lotteria → premiazione se vinta → rassegna → «Avanti» fino al tasto di
sempre → carriera. In più, su pagine nuove, le tre cerimonie forzate con `__CPM_FORCE_CEREMONY`: coppa, campionato, festa leggera.

**2D forzata in modo deterministico**: `__CPM_T196ON=1`, `__CPM_CAP196=1` **e** caricamento CGTrader fallito simulato
(`assets/cgtrader-*.glb` abortiti, service worker bloccato). Misurato: col solo tetto a 1 ms, sul server locale il pacchetto
arrivava prima del primo controllo e sul PC la partita **restava in 3D** (`d2=false`); con il service worker attivo il blocco
non prendeva (le sue richieste sfuggono a `page.route`). Con le due cose insieme: `__CPM_PRONTI196` → `fallito`, 2D in tutti i giri.

## 2. Misura prima (build di `lavoro/195`)

Uscite: `giro205/tel-prima.txt`, `giro205/pc-prima.txt`; foto `giro205/prima-*.png` (375×667 e 1366×768).

| Momento | Si vede | Si blocca | Manca |
|---|---|---|---|
| Lotteria (finale) | il **campo dall'alto della partita, congelato** (ventidue pallini fermi); sul telefono la testata «CALCI DI RIGORE» si sovrappone al pannello statistiche (`prima-telefono-b-rigori1.png`) | no: la serie finisce in 59,5 s (5-4, 14 tiri), passa alla premiazione | **nessun rigore si vede**: né porta, né portiere, né pallone; solo il tabellino ✓ ✗ in testata |
| Premiazione dopo la serie | lo stesso campo congelato; sul PC con il pannello **pagelle aperto** e «TITOLO VINTO!» sopra la barra statistiche (`prima-pc-c-cerimonia1.png`) | no: finisce da sola in 17,6 s | **nessuna coppa né festa**: la scena 3D è nascosta sotto il campo 2D |
| Cerimonie forzate (coppa, campionato, festa) | campo congelato + scritte | no: 17,5 / 23,4 / 9,4 s, poi rassegna | come sopra |
| Rassegna (giri 200/202) | 4 schede, tabellino in scheda 1, «VITTORIA AI RIGORI — CAMPIONE!» | no | — |
| Ritorno alla carriera | carriera con «COPPA VINTA! · Festeggia», matchHistory 0→1, Coppa `champion:true`, voce `FINALE 1-1 won:true penalties:true` | no | — |
| Errori di pagina/console | 0 (tolta la nota di Babel sui 500 KB, sempre presente) | | |

Conclusione della misura: **nessun blocco, nessuna schermata vuota, esiti giusti**; il difetto è di **presentazione** — in 2D
lotteria e premiazione mostravano una partita congelata invece di rigori e premiazione.

## 3. Correzione (src/15, rosso `__CPM_NO_G205`)

Componente nuovo `Riserva2D205` (prima di `Campo2D`). Solo quando la partita è in 2D (`modo2D196`) e solo nelle fasi
`shootout` e `ceremony`, al posto del campo congelato:

- **Lotteria**: la porta vista dal dischetto (traversa, pali, rete, linea di porta), portiere col colore della squadra che para,
  pallone sul dischetto e nome del rigorista. Il tiro segue **gli esiti già decisi** dal motore della serie (`soFx`: direzione,
  alto/basso, fuori, parato/gol): parato → il portiere va dove va il pallone; gol → dalla parte sbagliata; fuori → il pallone
  esce oltre il palo o sopra la traversa. Nessuna decisione nuova. Lo stacco nero fra un rigore e l'altro (giro 191) e il
  tabellino restano quelli di prima, sopra.
- **Premiazione / festa**: quadro con coppa (🏆, o 🎉 per la festa leggera), nome della squadra, punteggio, coriandoli, «Il
  capitano alza la coppa sotto la curva». La testata «PREMIAZIONE · TITOLO VINTO!» e il tasto «Salta» restano quelli di prima.
- In entrambe una riga piccola: «Versione 2D · la scena 3D non era pronta» (il ripiego dichiarato).
- Il 3D resta sospeso sotto, come nella partita 2D (`__CPM_SOSP917`).

Nessun asset nuovo: CSS ed emoji; le animazioni `trophyRise`, `trophyGlow`, `confettiFall` esistevano già.

## 4. Dopo

Uscita `giro205/dopo.txt`, foto `giro205/dopo-*.png`. Stessi tempi e stessi esiti di prima (serie 5-4 in 59,5 s, premiazione
17,6 s, cerimonie 17,6 / 23,3-23,6 / 9,4-9,8 s, rassegna, carriera, Coppa vinta), **0 errori**; durante la serie e la cerimonia
il campo congelato non compare più (`v2d=false`), compaiono la porta (`so2d=true`) e il quadro (`cer2d=true`).

## 5. Guardiano `riserva2d-205`

Verde (telefono 375×667 e PC 1366×768): 2D attiva prima dei rigori; durante la serie la porta in ≥90% dei campioni e il campo
congelato in 0%; la serie finisce entro 120 s; ogni tiro mostrato ha **un solo** esito; i gol mostrati per lato = `hs-as` del
motore; vinta ⟺ hs>as; vinta in finale → premiazione in 2D (quadro e nota ≥90%, campo congelato 0%) che finisce da sola entro
30 s; rassegna con l'esito ai rigori; 4 passi fino al tasto di sempre, matchHistory +1, voce di Coppa coerente (`won`, rigori,
1-1, `champion`); più le cerimonie forzate (coppa, campionato, festa sul telefono; campionato sul PC); 0 errori di pagina e di
console. Rosso (`__CPM_NO_G205`, telefono): deve essere bocciato. «Non giudicato» = rosso.

Esiti: **verde 36/36** (`giro205/guardiano-verde.txt`) · **rosso bocciato** (porta 0%, campo congelato 100%,
`giro205/guardiano-rosso.txt`).

Registrato in `package.json` e in `ci-runner.mjs` (catene completa e carriera, mappa di `src/15`, lenti; `node --check` ok,
nessun doppione nelle catene).

## 6. Controlli (uno alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno)

Tutti sul build finale del ramo (commit con la correzione), uno dopo l'altro.

| controllo | esito |
|---|---|
| riserva2d-205 | **verde 36/36** (telefono e PC), **rosso visto** (`__CPM_NO_G205`: porta 0%, campo congelato 100%) |
| tpose-196 | verde 4/4 scenari (0 T-pose, 0 corpi non CGTrader, 0 procedurali), rosso visto (116 fotogrammi sbagliati) |
| lotteria-191 | verde telefono e PC (6 cambi, stacco 6/6, sguardo 6/6, portiere 6/6), i tre rossi B·C·D si vedono |
| rigore-191 | verde, rosso visto |
| cerimonie-192 | verde A·B·C·D, ogni rosso si vede |
| cerimonie | PASS |
| rassegna-200 | verde 14/14, rosso bocciato |
| rassegna-202 | verde 9/9, rosso bocciato |
| partita2d-297 | verde, rossi A·B·C cadono |
| career-critical | verde (11 passi, 0 ❌) |
| test:logic | 51/51 |
| save-compat | 12 pass · 0 fail |

Le sonde degli altri giri riscrivono le proprie foto in `docs/sviluppo/giro196` e `giro200`: riportate come erano (questo giro non
cambia quelle schermate).

## Dubbi per il PO (non decisi)

1. **Aspetto della lotteria e della premiazione in 2D**: è una mia proposta (porta dal dischetto; quadro con coppa e coriandoli).
   Non ho fatto scegliere fra alternative: se il PO preferisce un'altra resa, va detto.
2. **La riga «Versione 2D · la scena 3D non era pronta»**: dichiara il ripiego, come chiede il compito; non so se il PO la vuole
   visibile al giocatore o solo nel taccuino.
3. **Parata col pullman (Fine Stagione)**: è una scena 3D di **carriera**, non della partita, e la modalità 2D vale per la sola
   partita. Non l'ho provata con il 3D non pronto: resta fuori da questo giro.
4. **La festa di fine gara del 7.942 (`FestaFine942`)** e il «🎉 Festeggia» della carriera sono schermate 2D già oggi; le ho viste
   comparire (foto `*-e-carriera.png`) ma non le ho giudicate una per una.
5. **Tabellino a 0 gol su un 1-1**: nella rassegna di queste partite il tabellino della gara dice 0 gol per parte mentre il
   punteggio è 1-1. È un artefatto del varco di prova `__CPM_SO_FORCE`, che scrive 1-1 sul tabellone senza gol del motore; non
   l'ho trattato come difetto del gioco. Una lotteria nata da una partita vera non l'ho riprodotta in questo giro.
6. **Serie persa ai rigori**: il seme usato vince (5-4). La parte «persa → niente premiazione, eliminato» è nel guardiano, ma con
   questo seme non viene esercitata; non ho cercato un seme perdente.
7. **Il resto della partita in 2D** (highlight dell'eroe sul campo dall'alto) è quello del giro 196, non ritoccato qui.
8. Il giro non ha numero di versione e non è promosso su `main`: `GAME_VERSION` è fuori dal mio perimetro.
