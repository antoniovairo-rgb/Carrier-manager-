# Rapporto giro 17 — L1: PO-022, PO-068, PO-123/PO-143

Ramo `sviluppo/scene-gesti-022`, creato da `poc/marioprada-character-system` 8c88f61 (7.999.165).
`GAME_VERSION` **non** cambiata (richiesta del giro). Zona G (carriera/classifica) non toccata. Motore del
possesso (`src/14`) non toccato: tutte le correzioni stanno nei generatori di scena (`src/04`), nel live
(`src/15`) e nel 3D (`src/12`). Nessun identificativo di modello nei file.

Tre consegne, una per voce, ognuna con interruttore rosso e guardiano:

| commit | voce | interruttore rosso | guardiano |
|---|---|---|---|
| 3ec1a2d | PO-022 strato 8b | `__CPM_NO_SEG022` | `catalogo-022` |
| fc20ecb | PO-068 | `__CPM_NO_REG068` | `gesti-motore-068` |
| 684178b + 07d938d | PO-123 / PO-143 | `__CPM_NO_PRESS143` + `__CPM_NO_MARCA143` | `pressing-143` |

Condizioni comuni delle misure di flusso: salvataggio `fixtures/save-190-s12-ovr93.json`, `playMatch()`,
autoplay seminato, `?cpmtest=1`, **una pagina nuova per partita**, headless `/opt/pw-browsers/chromium`. Per
avere partite davvero diverse il seme cambia anche `player.name` (il seme di partita nasce dal nome: con il solo
seme dell'autoplay le partite erano identiche — misurato, semi 11 e 23 → stessa sequenza di scene).

---

## 1. PO-022 — Passo 6, strato 8b: cosa viene ancora dal catalogo scritto

### Misura prima
Testimone inerte nuovo `fonte022` nel registro eventi (`cpmEv`), sulle due porte d'ingresso delle scene
dell'eroe: la selezione lazy (`src/15-live-match.jsx:4793`) e il ramo «secondo tempo» di `handleContinue`
(`src/15-live-match.jsx:9436`). Per ogni scena: motore o catalogo, e perché.

| corsa | partite | scene | dal motore | dal catalogo |
|---|---|---|---|---|
| autoplay `seeded` (esiti del gioco) | 8 | 55 | **55 (100%)** | 0 |
| esiti riusciti forzati, politica `pass` | 4 | 27 | 26 (96,3%) | **1: secondo tempo** («Mischia in area!», `CHAIN_SITS`) |

Quindi le scene d'apertura (conclusione, spalle, fascia, fra le linee, cross, angolo, difesa, punizione,
rigore) nascono già tutte dal motore. L'unica scena dell'eroe ancora scritta è il **secondo tempo** della stessa
azione (`CHAIN_SITS` in `src/13-prepartita-formazioni.jsx:1452`: dopo il dribbling, mischia, sponda, rimbalzo,
stacco sull'angolo). Il tipo di occasione «costruzione» non si è mai presentato (il motore apre occasioni solo
oltre la trequarti, come già misurato l'08/10).

### Intervento
`scenaSecondoTempo` (`src/04-situazioni-zone-piazzati.jsx:1106`, registro `P6_SEGUITO` r.1079), agganciata nel
ramo catena (`src/15-live-match.jsx:9436`): il **tipo** di seguito resta quello scelto dal motore
(`risolviEroe.seguito`), titolo, introduzione e opzioni si costruiscono dal cast vero (difensore, portiere,
compagno) e dalle statistiche, con scelta seminata (nessun sorteggio in più). Geometria (zone, `startZone` su
cui si assesta il pallone, regola 7.57), intento, stato del pallone e segnali cinematici restano quelli della
catena: le etichette sono già disegnate dal 3D e nessuna parola riapre una catena.

### Dopo
- Prova diretta sulle 5 catene: **5/5 generate** (stessa geometria/intento/pallone, opzioni disegnabili, nomi
  del cast, niente assist senza compagno); col rosso **0/5**.
- Flusso: seme 41 (politica `pass`, esiti riusciti) → «Palla vagante in area!» con fonte **motore**; nel braccio
  rosso lo stesso secondo tempo esce dalla catena scritta (15/16 dal motore).
- Guardiano `catalogo-022` verde e rosso visibile. `scena-motore-147` aveva percorsi assoluti verso
  `/home/user/cm-poc` (inesistente in questa sessione): ora relativi.

### Cosa resta e perché
- **La posizione del secondo tempo non è un fatto del motore**: durante la scena il motore è fermo (decisione
  PO 05/10, «l'azione la gioca solo la scena»), quindi dove si gioca il seguito è conseguenza della scena. Portarla
  al motore vuol dire far ripartire il motore dentro la scena: è una decisione PO, non un ritocco.
- **Chiusura totale dello strato 8b** (catalogo ridotto a modelli di testo, `validate-situations` e firme
  golden adeguati, via il ripiego): **non fatta**. Il gate forza le 191 schede del catalogo e le firme golden sono
  calcolate su quelle: togliere il ripiego senza un gate nuovo sulle scene generate toglie la rete di sicurezza
  della CI. Il salvataggio a metà partita non l'ho misurato: non posso confermarne lo stato.
- Il ripiego sul catalogo resta nel codice ma, nelle partite misurate, non scatta mai.

---

## 2. PO-068 — Varianti dei gesti

### Misura prima
Il censimento storico (`gesti-copertura-96`, sul catalogo) dà **35/35 varianti raggiunte**, 9 azioni non
disegnabili (velo, stop di petto, comandi 📣). Ma in partita le opzioni dell'eroe nascono ormai dai registri del
motore (`P6_*`), non dal catalogo. Sonda nuova `gesti-motore-068`: 8.100 scene generate (ogni tipo × pressioni
× compagni liberi sì/no × 60 semi, più i cinque secondi tempi), per ogni opzione famiglia/variante da `deriveHL`.

- Varianti di GESTI (senza le righe base): **26**. Raggiunte dal catalogo: 26. Raggiunte dal motore: **18**.
- Mai raggiunte dal motore: `cross/cross_cutback`, `header/header_diving`, `dribble/dribble_outside`,
  `dribble/double_step`, `dribble/roulette`, `pass/pass_lofted`, `tackle/press`, `tackle/call`.

### Intervento
Opzioni nuove nei registri (`src/04-situazioni-zone-piazzati.jsx`, interruttore `_r068` r.869), con etichette
già disegnate dal catalogo: «Roulette e tiro» (conclusione), «Cross a rientrare», «Sterzata esterna e cross»,
«Doppio passo e cross» (fascia), «Lancio smarcante per X» (fra le linee, solo con compagno libero), «Stacco in
corsa potente» (cross/angolo).

### Dopo
**24/26** (cutback ← «Cross a rientrare», header_diving ← «Stacco in corsa potente», dribble_outside / double_step
/ roulette come preparazione del doppio gesto, pass_lofted ← «Lancio smarcante»), nessuna opzione non
disegnabile. Rosso: **18**. Base del guardiano in `gesti-motore-068-base.json`.

### Cosa resta e perché
- `tackle/press` e `tackle/call`: **clip nulla** in GESTI (`src/12-three-match-view.jsx:2932`), dichiarate.
- Rabona, tacco, «doppio passo» con pedalate vere: nessuna clip (decisione PO 06/10), restano tolte. Il doppio passo
  si vede come cambio di direzione, come già dichiarato in `hlPreDribble`.
- La verifica di questo giro è **strutturale** (`deriveHL` e tabella GESTI), GLB spento: le clip sono le stesse
  già montate per le etichette del catalogo (guardiani `doppio-gesto-148`, `gesti-scena-p1b`), ma una prova
  fotografica GLB acceso delle scene generate con queste opzioni non l'ho fatta.
- I lotti P2/P3 del 26/09 (protezione col corpo, reazioni dei compagni al gol, barriera dell'eroe, infortunio in
  scena) non sono stati toccati.

---

## 3. PO-123 / PO-143 — Compagni che si smarcano, difensori che pressano, note #64/#126

### Misura prima (sonda `hl-credibilita`, 5 partite, tempo di scena)
- Prima dell'azione fermi: compagni **13,3%**, avversari **13,0%** (obiettivo PO ≤30% tenuto; 7.999.144 diceva
  10,2 e 9,0).
- Smarcamento: fotogrammi senza un compagno libero **0%**, distanza mediana dal marcatore 6,7 m.
- Pressing: portatore senza avversari entro 5 m nel **62,7%** dei fotogrammi (65% in intro e scelta; era 65% al
  7.999.10).

### Causa trovata
Il motore consegna con l'occasione `press` = `pressioneSu(eroe)` (`src/14-motore-possesso.jsx:258`), cioè la
**distanza** dell'avversario più vicino; i generatori la leggevano come **intensità** (≥1,5 «alta», <1 «1 contro 1
senza pressione»), e il motore chiamava «spalle alla porta, il marcatore ti è addosso» l'occasione con l'avversario
a 3 u o più (`src/14-motore-possesso.jsx:639`). Sonda nuova `pressing-143-flusso` (4 partite, teatro acceso):
scene dichiarate «pressione alta» col difensore vero a 6–12 m, e `press` che cresce con la distanza misurata in
scena (press 4,5 → 12 m; 1,1 → 2,3–4,5 m).

### Interventi
1. `_p6Pressione` (`src/04-situazioni-zone-piazzati.jsx:1139`), all'ingresso unico dei generatori: distanza →
   intensità (0 da 6 u in su, 1,5 a 3 u, 3 a contatto); «spalle» solo col marcatore entro 1,2 u. Il motore e i
   suoi eventi non cambiano. Rosso `__CPM_NO_PRESS143`.
2. Il marcatore nominato dal motore (`cast.difensore`) va dal lato della porta alla distanza dichiarata (tra
   1,2 e 5 u), prima dell'azione, **solo nel 3D**: prop `marca143` passata da `src/15-live-match.jsx` (accanto
   a `hlOffBall`), bersaglio calcolato in `src/12-three-match-view.jsx:6605-6611` anche attraverso lo scambio
   `_sw219`, e niente congelamento di lettura per lui. Rosso `__CPM_NO_MARCA143`.
   - **Prima stesura scartata (684178b → 07d938d)**: scrivevo la posizione del marcatore in `matchPlayers`. La
     catena mirata ha trovato `tabellino-228` rosso due volte (nel braccio verde la prova k4 non ricreava più il
     gol al fischio); sulla base 8c88f61 è verde, e sul ramo torna verde spegnendo **solo**
     `__CPM_NO_MARCA143`. Causa: il motore legge `matchPlayers`, quindi quella scrittura entrava nella
     simulazione e cambiava la partita. Ora la logica non cambia: `tabellino-228` verde, con la stessa partita k4
     del braccio senza marcatore (1-1).

### Dopo
- Guardiano `pressing-143` (prove deterministiche): lettura 0,5/2/4/8 u → alta/alta/media/bassa, «spalle» solo
  a 0,5 u (rosso: media/alta/alta/alta); scena forzata con marcatore a 2 u: difensore più vicino a **2,21 m**
  (rosso **4,86 m**) con la versione finale solo 3D (2,53 contro 5,93 m con la prima stesura).
- Flusso (4 partite, lettura 2,5 s), scene in cui il motore dice marcatore entro 3 u, difensore vero più vicino:

  | braccio | scene | mediana | entro 4 m | oltre 6 m |
  |---|---|---|---|---|
  | verde, escluse cross/angolo | 13 | 4,0 m | 7 | 2 |
  | rosso, escluse cross/angolo | 12 | 4,1 m | 5 | 3 |
  | verde, cross/angolo | 7 | 9,2 m | 1 | 6 |
  | rosso, cross/angolo | 5 | 7,4 m | 0 | 3 |

  (Misura fatta con la prima stesura, quella che scriveva in `matchPlayers`.) Lo dichiaro: **nel flusso
  l'effetto del marcatore non è dimostrato** su questo campione (4,0 contro 4,1 m),
  perché fuori dai cross il difensore stava già a circa 4 m. La correzione che cambia davvero la scena è la
  lettura della pressione: prima le scene «pressione alta» erano proprio quelle col difensore lontano.
- **Effetto di gioco da segnalare al PO**: `tactic.pressure` alimenta anche `decideExecution` e le probabilità
  (`src/15-live-match.jsx` r.~8857, ~8954, ~10276). Prima quasi tutte le scene generate erano «alta»; ora alta
  solo col marcatore entro 3 u. Le scene diventano in media più facili. Non ho misurato quanto cambiano gol e
  assist dell'eroe: non posso confermarlo.

### Cosa resta e perché
- **Cross e angoli**: il difensore resta a 7–9 m in entrambi i bracci. In una corsa diagnostica il punto logico
  del marcatore era giusto ma nessuna mesh lo raggiungeva quando lo scambio `_sw219` fa due scambi: causa non
  chiusa.
- **#64 / #126 (colpo di testa non sincronizzato) — difetto misurato, aperto.** Sonda nuova `testa-motore-143`
  (GLB acceso, una pagina nuova per scena): sulle scene di cross e angolo **generate** la clip del colpo di testa
  gira durante il caricamento col pallone a ~3 u (testa visibile a **2,98 u** al lancio), poi la correzione
  7.999.144 porta il pallone sulla testa (serie `__CPM_TESTA146` 3,7 → 0,86 u) quando la clip è già finita (il
  gesto passa a `lift`). Il secondo tempo (sponda) è a posto (0,47 u); sulle schede del catalogo `testa-146` resta
  verde (0,51 e 0,78 u). La sonda è **rossa col gioco** ed è fuori dalle catene: è la misura del difetto, non un
  guardiano. Rimedio da decidere: far partire la convergenza già nel caricamento, oppure tenere la clip ferma al
  contatto finché il pallone non arriva.
- Più campioni sui passaggi e residuo #53 (angolo corpo-porta): non toccati in questo giro.

---

## Catena `mirata`

Catena `mirata` sul ramo: 49 passi (il confronto con `main` include anche `src/07` e `src/18`, già diversi sul ramo
di partenza; la mappa dell'esecutore ora porta anche `catalogo-022`, `gesti-motore-068`, `pressing-143`).

**Primo giro (`node ci-runner.mjs mirata`, build 684178b):** fermato dal tetto di 2 ore delle attività in
sottofondo della sessione dopo 42 passi, tutti verdi. Rifatti i 7 mancanti (decisione PO 14/10 «rifai solo le
mancanti»): 6 verdi, **`tabellino-228` rosso due volte**. Causa trovata e corretta (07d938d, vedi PO-123 sopra).
Quel giro non vale per la versione finale e non è registrato in `STABILITA.json` (l'esecutore scrive solo a fine
catena).

**Giro valido, build finale 07d938d:** stessi 49 passi rifatti tutti sul build esatto, in quattro lotti (due alla
volta, come l'esecutore fa coi passi lenti; ogni lotto sotto il tetto delle 2 ore; il lotto A1 interrotto dal tetto
dopo 9 passi è proseguito con i suoi 3 mancanti nel lotto A3). Stessa regola dell'esecutore: un rosso si riprova
una volta.

- **46 verdi al primo giro**, fra cui `validate-situations` alla riprova (vedi sotto), `partita-vera`,
  `career-critical`, `scena-motore-147`, `catalogo-022`, `gesti-motore-068`, `pressing-143`, `esiti-218`,
  `scene-221` (6,83 scene a partita, gol dell'eroe 0,50 a partita, informativo).
- **3 instabili** (rossi al primo giro, verdi alla riprova):
  - `validate-situations`: controllo `motion` (vitalità dei giocatori, 1 issue) con 2,3 fps sotto carico; il gate
    forza le schede del catalogo, dove le modifiche di questo giro al 3D sono inerti (`marca143` nullo). Riprova 14/14.
  - `buildup-sync`: `gi4` salto del pallone di 22,2 u in un fotogramma da 207 ms; scheda del catalogo; riprova
    massimo 2,8 u.
  - `tabellino-228`: nel braccio rosso la prova k4 non ha ricreato il caso (partita 0-0, nessun gol del motore nei
    3.300 sotto-tick). È lo stesso modo di fallire della prima stesura del marcatore; con la versione finale l'ho
    visto 1 volta su 3 esecuzioni, sulla base 8c88f61 0 su 1. **Non posso escludere** che la correlazione col ramo
    resti (le modifiche alla pressione cambiano la difficoltà delle scene e quindi la partita k4, che già non è
    riproducibile al gol): da guardare nella catena `notte`.
- Rossi veri: **nessuno**.
- `STABILITA.json` non aggiornato: la catena valida è stata eseguita a lotti con lo stesso elenco di passi, non
  dall'esecutore (che sarebbe stato fermato di nuovo dal tetto delle 2 ore).

---

## Note di metodo

- Le pagine stanche: ogni partita e ogni scena forzata su pagina nuova (contesto nuovo), mai scene in serie.
- Tempo di scena: le sonde di movimento usano `__CPM_SCENET`; la sonda della pressione misura posizioni, non
  velocità. L'autoplay a 700 ms fotografava il marcatore ancora in corsa: la sonda di flusso usa 2,5 s di lettura.
- GLB acceso solo per la sonda dei colpi di testa (percettiva). Le prove di pressione e varianti sono GLB spento:
  sono misure di posizione e di risoluzione dei gesti, non di resa.
- `BACKLOG.md` e `ROADMAP.md` non aggiornati: nessuna versione rilasciata in questo giro (niente bump di
  `GAME_VERSION`, niente promozione su `main`). Le righe vanno scritte da chi rilascia.
