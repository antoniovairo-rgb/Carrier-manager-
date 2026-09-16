# Korward Elite — Macro piano delle attività (dal 14/09/2026)

> Redatto dal PO-delegato la sera del 14/09 su richiesta del PO. Numeri, non impressioni: ogni riga ha un metro
> misurabile, un rosso appaiato e uno stato dichiarato. Il piano si aggiorna a verbale (`docs/FASE3-SCAMBIO.md`)
> a ogni spedizione o revoca.

## Avanzamento (una riga per spedizione, la più recente in alto)

- **16/09 02:40** — **7.911.0 in produzione** (main in ff da `2cd7133`; career-critical 02:14 e `ci` 02:38 verdi sul build esatto `e95ce67`, `arbitro-esiste` 6, tutti i guardiani verdi). **C11 — i ventidue bambini dell'ingresso in campo sono corpi CH38** (richiesta del PO): stessa fabbrica dei giocatori e della panchina, divisa avversaria di sempre, **testa +18 %** (un adulto rimpicciolito non è un bambino) e clip di camminata invece dello scivolamento. Misurato, sei metri su sei: **22 corpi su 22** · 22 attivi in cerimonia · **piedi tutti a quota 0** · **per mano al proprio calciatore, 0,72u su tutte e ventidue le coppie** · 0 errori di pagina. Costo **2 chiamate di disegno a bambino invece di 7** grazie al corpo unito della 7.910 — 44 invece di 154, ed è il motivo per cui questo passo veniva dopo D12. Rosso `__CPM_NO911`. **Due strumenti che restano al progetto**: la **cerimonia d'ingresso ora è raggiungibile da una sonda** (`__CPM_FORCE_WALKOUT`, gemello di quello della premiazione) — non lo era mai stata, e la walkout è uno dei tre momenti in cui il 3D resterà acceso — e i bambini si costruiscono **prima** della panchina, perché erano pronti 2,2 s dopo che la partita poteva già iniziare. **Non verificato**: l'Android del PO; la foto non mostra le coppie perché la cerimonia forzata non rischiera le squadre nel tunnel (per questo la mano nella mano è misurata, non guardata).
- **16/09 01:35** — **7.910.0 in produzione** (main in ff da `66c0b95`; career-critical 01:10 e `ci` 01:34 verdi sul build esatto `a649366`, `arbitro-esiste` 9, tutti i guardiani verdi; build, sorgenti e assets identici fra `a649366` e la testa spedita). **D12 — meno chiamate di disegno, non meno triangoli**: il corpo CH38 arriva **unito** (una mesh in due primitive invece di sette, uno skin da 65 ossa invece di sette, stessi 48.140 triangoli, 3,20 MB contro 3,09) e il kit si tinge da un **attributo per vertice** invece che dal nome della mesh. Misurato appaiato allo stesso minuto e con la stessa camera: **chiamate di disegno per fotogramma 124 → 93 (−25,0 %)** con ~6 corpi in quadro — con i ventitré il risparmio sarebbe ~115 chiamate — triangoli invariati, **kit, pelle e capelli con le stesse tinte** del braccio di controllo, 0 errori di pagina. Rosso `__CPM_NO910` = corpo a sette mesh e tintura per nome. **Difetto intercettato prima di spedire**: lo shader compilato contro `vMapUv` (three r152+) invece di `vUv` (r128, quello che il gioco monta) faceva **sparire i ventidue dal campo senza alcun errore di pagina** — l'hanno visto le foto, non il conteggio, e il primo −30,5 % misurato era in buona parte l'effetto dei corpi non disegnati. **Non verificato**: i fotogrammi veri (il banco gira a 2 fps in software e su questo mente: stasera ha dato +95 % dove il telefono del PO dava −5 %) e il numero sul dorso della maglia (nelle foto i giocatori sono ripresi di fronte).
- **15/09 22:30** — **7.909.0 in produzione** (main in ff da `ac1d5ab`; sonda della revoca 21:55 **7 metri su 7**, career-critical 22:04 e `ci` 22:28 verdi sul build esatto `c73123f`, `arbitro-esiste` 7, tutti i guardiani verdi; build e sorgenti identici fra `c73123f` e la testa spedita). **D7 revocata**: il campo torna al **corpo pieno** (triangoli in scena 557.786 → **1.317.656**), via l'interruttore dal menu di pausa (verde: assente), il **contatore dei fotogrammi resta** perché i prossimi metri si misurano ancora dal telefono; rosso `__CPM_NO909` = comportamento 7.907. Motivo, dai numeri del PO: pieni **31-32 fps** (picco 38) contro leggeri **29-30** (picco 34). Il corpo alleggerito resta in panchina (C8). Non verificato: l'Android del PO sulla 7.909.
- **15/09 21:40 — la sonda `costo-corpo` misura, e in parte CORREGGE la spiegazione di un'ora fa.** Con i due corpi, stessa partita al banco: **chiamate di disegno per fotogramma 153 → 145 (−4,8 %) mentre i triangoli scendono del 57,6 %** (1.318.842 → 559.283). Questo conferma la parte importante: **togliere triangoli non toglie lavoro per fotogramma** — le chiamate di disegno restano (7 mesh × 23 corpi ≈ 150). Ma la sonda dice anche che **al banco i fotogrammi raddoppiano** (5,6 → 10,9), cioè **il banco e il telefono del PO danno risposte opposte**: al banco il Chromium disegna in software e lì i triangoli pesano; sul telefono c'è una GPU vera e il collo di bottiglia non è nei triangoli ma nella **CPU** (≈150 chiamate di disegno per fotogramma, 23 scheletri animati, il loop del gioco). **Il metro che vale è il telefono del PO**, quindi la revoca di D7 resta; va corretta la frase «il costo è per corpo e non per triangolo», che è vera sul telefono e falsa al banco. Rimedio vero e misurabile (D12): **unire le 7 mesh di ogni corpo** (≈150 → ≈25 chiamate di disegno per fotogramma) e ridurre i corpi in quadro. Limite dichiarato della sonda: l'etichetta del contatore in pagina dice «leggeri» in tutti e due i bracci perché legge la preferenza e non l'URL forzato; i triangoli misurati dimostrano che i due bracci erano davvero diversi.
- **15/09 21:35 — MISURA APPAIATA SUL TELEFONO DEL PO: D7 NON BATTE LA MISURA, VA REVOCATA.** Stessa partita, stesso telefono, i due bracci del suo interruttore: **corpi pieni media 31-32 fps, picco 38** · **corpi leggeri media 29-30 fps, picco 34**. I corpi alleggeriti (−58 % di triangoli in scena, 1.317.654 → 559.834) **non danno un solo fotogramma in più: ne danno semmai qualcuno in meno**, in entrambe le statistiche. Per la regola del PO («revoca a verbale se non batte la misura») la 7.907 va revocata come predefinito del campo: **si torna al corpo pieno**. Il fatto tecnico che lo spiega era già nell'inventario di §1-quater: i due GLB hanno **le stesse 7 mesh, gli stessi 7 skin, gli stessi 73 nodi e gli stessi 2 materiali** — cambia solo il numero di triangoli. **Il costo di un corpo è per corpo (chiamate di disegno, ossa, materiali), non per triangolo**: ecco perché tagliarne il 58 % non sposta nulla. Conferma al banco in corso con la sonda `costo-corpo` (chiamate di disegno per fotogramma). Conseguenza strategica: l'unica leva vera sulle prestazioni è **ridurre i corpi in quadro** — cioè esattamente la svolta 2D del PO (3D solo in highlight, ingresso, fischio finale).
- **15/09 21:30 — PRIMA MISURA DI FOTOGRAMMI SUL TELEFONO DEL PO** (non più solo banco): con i **corpi pieni** (48.140 triangoli per uomo, ventitré in campo) l'Android del PO fa **media 31-32 fps, massimo 38**. È il primo numero vero di prestazione da quando esiste il 3D: la soglia C5 («≥ 30 fps sul telefono del PO») è **superata già col corpo pieno**, di poco. Manca il numero appaiato dei **corpi leggeri** (14.622 triangoli, −58 % di triangoli in scena): finché non arriva, il guadagno della 7.907 resta **non verificato sul telefono**. Conseguenza per la svolta 2D: se ventitré corpi pieni danno 31 fps, negli highlight — dove in quadro ce ne sono 4-8 — il **corpo pieno è ampiamente sostenibile** (D11).
- **15/09 21:12** — **7.908.0 in produzione** (main a97b492, ff da a704e3b; career-critical 20:45 e ci 21:10 verdi sul build esatto c7a358e, `arbitro-esiste` 7 interruzioni, tutti i guardiani verdi; build e sorgenti identici fra c7a358e e a97b492, i commit successivi toccano solo `docs/` e una sonda fuori dal ci). **Il contatore dei fotogrammi è leggibile**: era bianco al 38 % di opacità, 11 px, senza fondo (misurato col DOM, non a occhio) → ambra 13 px, grassetto, cifre tabulari, su fondo scuro con bordo, e dice anche quale corpo è in uso. Serve alla misura che deve fare il PO sul telefono: corpi leggeri contro corpi pieni, stessa partita, due numeri. Non verificato sull'Android del PO.
- **15/09 20:22** — **7.907.0 in produzione** (main a81a8b5, ff da e42d71a; career-critical 19:59 e ci 20:22 verdi sul build esatto). **D7**: i 22 in campo, i portieri e l'arbitro passano al corpo CH38 alleggerito (14.622 triangoli contro 48.140, lo stesso file della panchina C8) — triangoli disegnati in scena 1.317.654 → **559.834** (−58 %); contatore dei fotogrammi a schermo e interruttore TEMPORANEO «Corpi: leggeri / pieni» nel menu di pausa (scambio a caldo in 2,2 s, i 23 corpi restano), perche' i fotogrammi veri li misura il PO sul suo telefono. Le due varianti leggere sono indistinguibili da vicino; il primo piano del corpo pieno NON e' riuscito (due tentativi), quindi il confronto col pieno non e' verificato.
- **15/09 19:48** — **7.905.0 in produzione** (main e42d71a, ff da f4f82d2; career-critical 19:02 e ci 19:48 verdi sul build esatto 69a6ac5; il primo ci era rosso sulla banda «arbitro-esiste» a 5, ripetuto come da protocollo dei rossi stocastici: 8). **C8** panchinari, mister e vice con il corpo CH38 alleggerito e i piedi a terra: corpi in panchina 0/16 → 16/16, piedi dal pavimento 0,77 → 0,12u, bacino dalla seduta 0,53 → 0,13u, triangoli +19,5 %. **C3 v4** dai collaudi del PO: barra della pressione di nuovo visibile (il timer dell'esitazione 4/6/9 s era invisibile), cursore solo nel passo di movimento (40 → 44 px) con l'overlay vestito come la scheda, riga di aiuto, filo del possesso specchiato con gli stemmi dal 46', transizione 0,6 s ed etichetta «cambio campo». Non verificato sull’Android del PO.
- **15/09 14:30** — **7.903.0 + C3 in produzione** (main ed0ecd2, ff da 6324c4b; career-critical 14:03 e ci 14:27 verdi sul build esatto, dopo il riavvio del container delle 13:50). C3 HUD della partita dalle tavole del PO (rosso `__CPM_NO901`): barra 98 → 60 px, righe delle scelte 40 → 52 px senza percentuali, con 7 opzioni 53 → 44 % con lista che scorre, esito con un solo «Continua»; testo sopra il campo 12-17 %. 7.903 l'arbitro esiste (decisione PO, rosso `__CPM_NO903`): falli 0,18/0,05 → 0,22/0,08; banco 48 partite interruzioni 6,8 → 7,8, tiri 5,2 → 4,9 (costo dichiarato); banda ci «arbitro-esiste» da 4-6 (moneta: 7.900 11/4/3, C3 6/4/4) a 7. Scheda n° 20 in corsa. Non verificato sull’Android del PO.
- **15/09 08:40** — **7.900.0 in produzione** (main 5553514, ff da 018e96b; career-critical e ci verdi sul build esatto 65cc427). A4 v1: il fallo pesa meno (0,26/0,14 → 0,18 sotto pressione / 0,05), al limite e in area si sorteggia DOPO il tiro, la conduzione con la strada libera punta la porta. Banco 48 partite: tiri 4,1 → 5,2 (dall’area 1,3 → 1,8), catene ≥ 3 passaggi → tiro 0,6 → 1,0, interruzioni 8,6 → 6,8. v2-v5 scartate al banco (tetto ~5 tiri: 7-8 attacchi nel terzo finale a partita, un tocco al minuto); per 8 tiri serve una decisione del PO sul tempo del mondo. Scheda n° 19 (09:44, GLB accesi): media 7,25 = n° 18; ai piedi 64/59/62/61 %, coppia rosso/verde Vairo 70/64 e Moretti 58/62 (nessuna regressione al telefono). Lezione: un secondo Chromium in parallelo dimezza «ai piedi» (64 → 29 %), da oggi una sola sonda nel browser alla volta. Non verificato sull’Android del PO.
- **15/09 07:25** — **7.899.0 in produzione** (main 018e96b, ff da 96f9903; career-critical e ci verdi sul build esatto). Dalle due foto del PO: pallone «troppo grande» → il pavimento (7.862, 11 px fissi) guarda l’uomo alla stessa profondità (un quarto, 8-11 px): rapporto pallone/uomo 0,52 → 0,35; panchina «invasiva» → riprodotta a 412×700 da sostituito (sovrapposizione al racconto 100 % → 0 %), riquadro 30 px → riga 16 px, il sottopancia sale col tasto «Salta». Scheda n° 18 in corsa. Non verificato sull’Android del PO.
- **15/09 05:40** — **7.898.0 in produzione** (main 96f9903, ff da 0a1746c; career-critical e ci verdi sul build esatto). A2 v3: il minuto del motore ha tre fasi (dt=1/3: una decide, due muovono la fisica); il pallone reso segue portatore o logico, l’eroe non ruba il pallone altrui. Banco: padrone dichiarato 58,6 → 66,2 %, salti > 5u per chiamata 342 → 0. Telefono Moretti rosso → verde: ai piedi 53 → 58 %, distanza dal padrone 2,8 → 2,4u, scarto 1,2 → 1,0u, salti 66 → 55; diagnosi padrone «altro» 3,6 → 1,7u. Costo dichiarato: code p90 più lunghe, padrone-eroe 2,5 → 5,2u, niente parabola dell’arco di cronaca in gioco ambientale. Scheda n° 17 (GLB accesi) in corsa.
**Regola (direttiva PO 15/09):** ogni rilascio in produzione porta la scheda da telefono successiva (4 partite, scala 9) e aggiorna la sezione «Voti del player da cellulare» qui sotto: voti delle 12 aree, differenza dalla scheda precedente, istogramma. **I voti si danno sempre con i GLB accesi** (direttiva PO 15/09: la sonda `collaudo-telefono` forza `__CPM_GLB=true`; una scheda a GLB spenti non vale come voto). Registro: `docs/voti/voti-telefono.json`, generatore `node tools/voti-piano.mjs`.

| quando (UTC) | cosa | cantiere → stato | numeri |
|---|---|---|---|
| 15/09 03:30 | **main = 0a1746c**: 7.897 in produzione (rituali verdi su c1d8303, build identico) | A3 → passo 1 fatto | telefono Moretti, coppia rosso/verde: ai piedi del padrone 50 → 53 %, scarto reso↔logico 2,7 → 1,7u, salti 74 → 64; padrone-eroe 3,9 → 2,5u |
| 15/09 00:40 | **main = 9188df9**: 7.895 v2 in produzione (rituali verdi su 3beb674: guardiano tabellone, career-critical, ci; build identico) | C7 → fatto | primo cielo sopra il bordo alto del tabellone: rosso 1 px in 9/9 impianti → 12-28 px (0,9-1,9u); provino piccolo 22 px, tabellone 151 → 68 px di larghezza (costo dichiarato) |
| 14/09 22:05 | **main = f6a65d6**: 7.894 in produzione (rituali verdi su 6519780, build identico; f6a65d6 solo docs) | A1 → fatto | banco: azioni ≥ 3 passaggi 0,25 → 0,88/partita; tiri 2,88 → 3,13; passaggi 21 → 24,5 (rosso `__CPM_NO894`) |
| 14/09 20:10 | **main = 5504b6e**: 7.892 + 7.893 in produzione (rituali verdi su 7940f26, build identico) | C1 → fatto | riga di telecronaca sopra la metà del campo 67,4 % → 0 %; blocco scelte 36,7 % → 21,5 %; barra specchiata dal 46' (casa x 13 → 297); frecce via |
| 14/09 19:40 | main = e62db88: 7.891 v2 | B1 → fatto | piazzato di cartone 32,8u → 0; passo conduzione ≤ 8u |
| 14/09 18:20 | main = f8cb0b3: 7.889 + 7.890 + overhaul grafico G0-G4.1 | A/B1/C1 → fatto | corpi in campo 0,3 → 45; regie di gioco vivo 5 → 0; contrasto 917 → 62 |

<!-- VOTI-INIZIO -->
## Voti del player da cellulare (scheda n° 20, build 7.903.0 + C3, 15/09 14:59)

Soglia di collaudo: **media ≥ 9, nessuna area < 7** (direttiva PO 14/09: il PO collauda solo con media >= 9 su 12 aree e nessuna area < 7). Media **7,25** (n° 19, 7.900.0: 7,25 → **±0**); area minima **7**. Fonte: tests/visual/collaudo-telefono (4 partite: Vairo casa / Galli fuori / Moretti casa / Conti fuori, GLB accesi, senza foto, una sola sonda nel browser) + sonda hud-c3 (915 e 700) + due collaudi del PO sull'Android (16:42 e 16:48) — verbale FASE3-SCAMBIO 15/09 15:10.

| # | area | n° 19 | **n° 20** | Δ | istogramma (voto) | crescita / decrescita |
|---|---|---|---|---|---|---|
| 1 | Realismo | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 2 | Credibilita' da attaccante | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 3 | Causalita' | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 4 | Varieta' | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 5 | Ritmo | 8 | **8** | ±0 | `████████░░` 8 | · |
| 6 | Azioni extra-eroe | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 7 | Highlight dell'eroe | 8 | **8** | ±0 | `████████░░` 8 | · |
| 8 | Telecronaca | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 9 | Interazioni | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 10 | Coerenza fra i sistemi | 8 | **8** | ±0 | `████████░░` 8 | · |
| 11 | Immersione | 7 | **7** | ±0 | `███████░░░` 7 | · |
| 12 | Carriera | 7 | **7** | ±0 | `███████░░░` 7 | · |

Storico delle medie: n° 12 (7.880.0) **6,92** · n° 13 (7.881.0) **7,08** · n° 14 (7.884.0) **7,25** · n° 15 (7.886.0) **7,17** · n° 16 (7.895.0) **7,08** · n° 17 (7.898.0) **7,08** · n° 18 (7.899.0) **7,25** · n° 19 (7.900.0) **7,25** · n° 20 (7.903.0 + C3) **7,25**.

<!-- VOTI-FINE -->

## 0. Dove siamo (misurato, 14/09 sera)

| cosa | numero | fonte |
|---|---|---|
| produzione (`main`) | **7.911.0** (7.889 → 7.907 in produzione: C8 panchina, C3 v4 HUD, D7 corpi leggeri; 7.896 revocata) | verbale 20:22 |
| gioco vivo con un padrone dichiarato (telefono, 4 partite) | **37 %** | sonda telefono 14/09 |
| tiri del motore a partita (4 partite) | **1,75** (0/2/2/3), 1 dall'area | area 2, misura B |
| azioni ≥ 3 passaggi poi tiro (banco) | 0,25 (7.893) → **0,88**/partita (7.894, in produzione) | banco `stati-motore` |
| eventi del motore a partita | **92** (un tick per minuto) | banco |
| teletrasporti dei ventidue all'apertura delle scene | 50 → **0** (7.890); piazzato 32,8u → **0** (7.891) | `salti-scena`, `chi-588` |
| telecronaca sopra la metà del campo | 67 % → **0 %** (7.892) | `copertura` |
| metro grafico (5 larghezze) | contrasto 917 → 62 (chiaro) / 1000 → 61 (scuro), testo < 10 px 463 → 29, overflow 0 | griglia G0→G6 |
| fps con i GLB in campo | banco Chromium 11 → **2**; **Android del PO (21:30, corpi pieni): media 31-32, massimo 38** — corpi leggeri non ancora misurati dal PO | c889 + telefono del PO |
| scheda da telefono (ultima) | media **7,08** (scheda n° 16, 7.895, 15/09, GLB accesi; n° 15: 7,17); area minima 6 (Realismo, Immersione); soglia di collaudo **≥ 9** (PO 14/09) | sezione voti, #81 |


## 1. La svolta del 15/09 — «partita 2D credibile, statistiche da partita vera»

Decisione del PO (15/09 sera, testuale): «sto pensando seriamente di rinunciare alla visualizzazione partita in 3D,
ma tra un highlights ed un altro dell'eroe, mostrare solo la partita 2d, mostrare in sovraimpressione le statistiche
della partita… Le indicazioni della panchina / mister tolte o annegate nella telecronaca stessa quindi concentrandoci
solo sulla perfezione degli highlights eroe» — e poi: **«la partita deve essere credibile anche se semplicemente
simulata in 2D, le statistiche devono essere al pari di una partita vera!»**

Le quattro scelte del PO (wizard, 15/09 20:40):

| domanda | scelta del PO |
|---|---|
| cosa si vede fra un highlight e l'altro | **campo dall'alto con i pallini** (i 22 + il pallone, mossi dal motore) |
| il mister | **annegato nella telecronaca** (una voce sola, nessun riquadro) |
| quando entra il 3D | **highlight dell'eroe, ingresso in campo, fischio finale** |
| cosa si legge in sovrimpressione | **statistiche + pagelle dei calciatori**, con gol, ammonizioni, espulsioni, assist |

**Perché questo cambia la priorità del motore.** In 3D una statistica sbagliata si nasconde dietro l'inquadratura;
su un campo 2D con il tabellino a fianco, ogni numero è in vetrina. Misura di apertura del cantiere, banco
`tests/visual/tabellino-vero.mjs`, 30 partite (60 tabellini, per squadra e a partita):

| voce | oggi | partita vera | rapporto |
|---|---|---|---|
| tiri | **1,8** | 12,8 | 0,14× |
| tiri in porta | **1,1** | 4,3 | 0,26× |
| expected goal | **0,15** | 1,3 | 0,12× |
| passaggi | **12,3** | 450 | 0,03× |
| cross | **0,7** | 15 | 0,05× |
| corner | **0,5** | 4,9 | 0,10× |
| falli commessi | **3,0** | 13 | 0,23× |
| rimesse laterali | **0,7** | 22 | 0,03× |
| parate | **1,1** | 3,2 | 0,35× |
| spazzate | **0,2** | 17 | 0,01× |
| intercetti | **0,3** | 8,5 | 0,03× |
| contrasti vinti | **0,6** | 16,5 | 0,04× |
| ammonizioni · espulsioni · fuorigioco · assist | **0 · 0 · 0 · 0** | 2,4 · 0,11 · 1,7 · 1,0 | **non esistono nel motore** |
| possesso | 50 % | 50 % | 1,00× |

(riferimenti di campionato arrotondati, di memoria, da ancorare a una fonte se il PO la vuole; il gol al banco è 0
perché al banco lo decreta la carriera, non il motore.)

**Seconda misura (20:58, stesso banco): accelerare il tempo da solo non basta — i tetti sono due.**
Il motore accetta già `ctx.dec` su ogni sotto-tick, quindi la frequenza si misura senza toccare `src/14`:

| | 1 decisione/min (oggi) | 11 decisioni/min | 11 decisioni + **volo ×4** | 22 dec. + volo ×4 | vero |
|---|---|---|---|---|---|
| pallone **in volo** quando si chiama il motore | 33,3 % | **74,9 %** | 53,8 % | 69,2 % | — |
| chiamate che producono un evento | 89,9 % | 31,4 % | **55,3 %** | 34,9 % | — |
| tiri | 1,8 | 3,5 | **7,3** | 9,2 | 12,8 |
| tiri in porta | 1,1 | 2,2 | **4,2** | 5,3 | 4,3 |
| falli | 3,0 | 12,5 | **16,4** | 19,4 | 13 |
| rimesse laterali | 0,6 | 2,2 | **4,7** | 7,1 | 22 |
| passaggi | 12,2 | 46,1 | **78,4** | 100 | 450 |
| voci in banda (su 24) | **2** | 5 | **5** | 5 | 24 |

Due tetti, non uno: (a) **la durata del volo** — a 11 decisioni il pallone è in aria in 3 chiamate su 4 e il motore
non può decidere; col volo quattro volte più rapido torna in tenuta e i tiri in porta centrano il vero (4,2 contro
4,3); oltre il quadruplo i tiri non crescono più (7,30 → 7,28 a ×8). (b) **la catena dei passaggi** — oltre le 11
decisioni i passaggi si fermano a ~110 per squadra (22 e 33 decisioni danno 100 e 110 contro 450): per il pareggio
servirebbe quasi un passaggio per decisione, quindi va aperto il gioco corto, non solo il cronometro.

**La diagnosi di partenza era aritmetica**: il motore fa **una decisione al minuto**, cioè ~92 eventi a partita;
una partita vera ne ha **~1.100** (≈ 11 al minuto solo di passaggi). Nessuna regolazione di probabilità colma un
fattore 12: **serve il tempo del mondo (A9)**. Da qui l'ordine di questo cantiere: prima la frequenza, poi le voci
che non esistono, poi la vetrina che le mostra.

## 1-bis. Vincolo di architettura: **UN SOLO MOTORE DEGLI EVENTI** (direttiva PO 15/09 21:05)

Testuale: «il motore degli eventi deve essere unico, mi raccomando e devi guidare anche gli highlights dell'eroe».

**Oggi non è così, e si misura.** In partita convivono due sorgenti di verità:

| | oggi | deve diventare |
|---|---|---|
| chi decide la partita | il motore del possesso (`src/14`) | **il motore** |
| chi decide gli highlight dell'eroe | il **catalogo delle situazioni**: 191 schede scritte a mano (`src/04`), scelte da `selectContextualSituations` in **6 punti** di `src/15` con punteggio, minuto, momentum, meteo | **il motore**: l'highlight nasce da un evento del motore (il tiro, il cross, il contrasto che stava per accadere) e il catalogo resta solo come **vestito narrativo** di quell'evento |
| chi muove il pallone in scena | **33 scritture dirette** di `ballPosRef` / `ballTargetRef` in `src/15`, fuori dal motore | il motore: 0 scritture dirette |
| chi muove i 22 in scena | il loop della scena (il motore non ha un `tickScena`) | il motore, anche durante la scena |
| cosa torna nel tabellino dopo la scena | niente: `conta.scena` è **0** nella diagnosi del guardiano, e le statistiche non vedono l'highlight | tutto: il tiro dell'highlight è un tiro del tabellino, il gol è un gol, il passaggio decisivo è un assist |

**Perché non è un dettaglio.** Se l'highlight lo genera un catalogo, l'eroe può segnare mentre il tabellino dice
che la squadra ha tirato zero volte: le statistiche in sovrimpressione (F2) e le pagelle (F3) mentirebbero proprio
nel momento che conta. **Un solo motore** è la condizione perché il tabellino sia onesto.

**Metro del vincolo** (guardiano nuovo, D9): highlight nati da un evento del motore **0/N → N/N** (ogni scena porta
l'id dell'evento che l'ha generata) · scritture del pallone fuori dal motore **33 → 0** · uomini mossi dal motore
durante la scena **0 % → 100 %** · eventi di tabellino prodotti dentro la scena **0 → tutti** (`conta.scena` > 0) ·
continuità: salto del pallone alla chiusura della scena **0u**.

## 1-ter. Reingegnerizzazione degli highlight: **12 archetipi guidati dal motore, non 185 schede**

Richiesta del PO (15/09 21:10): «la qualità e credibilità degli highlights eroe deve essere altissima, valuta tu la
reingegnerizzazione, riduzione situations, ecc». Questa è la mia proposta, con la misura che la giustifica.

**Il catalogo di oggi, misurato** (`src/04`): **185 schede** scritte a mano (191 con le catene), 185 testi distinti,
**3,10 opzioni a scheda** (una ne ha **21**), concentrate nel terzo offensivo (trequarti/bordo/area 118 su 185, 64 %).
Ogni scheda porta la propria geometria (due rettangoli di zona), le proprie opzioni e il proprio esito: sono **185
verità che possono contraddire il motore**, ed è per questo che la scena può segnare mentre il tabellino dice zero tiri.

**Perché la riduzione non è un risparmio ma la condizione della qualità.** «Altissima» significa, per ogni scena:
pallone ai piedi, nessun corpo a T, nessun teletrasporto, inquadratura che tiene l'eroe nel riquadro, durata giusta,
esito che rientra nel tabellino. Sono ~8 misure a scena: su 185 scene fanno **1.480 numeri da tenere verdi** a ogni
rilascio — non è governabile, e infatti il banco misura ancora «pallone ai piedi 64 %». Su **12 archetipi** fanno
**96 numeri**: quella sì è una soglia che si può portare a 9.

**La proposta.**
1. **Il motore causa, l'archetipo mette in scena, il catalogo veste.** L'highlight nasce da un evento del motore
   (tiro, cross, contrasto, occasione dell'eroe); l'archetipo dice come si inquadra e quali sono le tre scelte; le
   185 schede di oggi diventano **testo** (riga di telecronaca + etichette delle opzioni), scelto col contesto che
   già esiste (minuto, punteggio, momentum, avversario, meteo). **Nessun testo viene buttato: perde solo il potere
   di causare l'azione.**
2. **I 12 archetipi**, presi dalle zone misurate e dagli eventi che il motore già produce: tiro dall'area · tiro dal
   limite · uno contro uno col portiere · colpo di testa su cross · cross dalla fascia · dribbling in area ·
   filtrante per il compagno · tap-in o ribattuta · punizione dal limite · rigore · contropiede in campo aperto ·
   recupero alto senza palla.
3. **Tre opzioni, mai di più** (media di oggi 3,10, massimo 21): la scheda del PO regge tre righe da 52 px.
4. **I testi si potano per qualità, non per numero**: ogni testo deve combaciare con il gesto del suo archetipo;
   i doppioni e quelli che promettono un gesto che il motore non sa fare si tagliano. Stima: 185 → **60-80 testi**,
   con la varietà che torna dal contesto e non dal numero di schede.

**Metro della qualità «altissima»** (per ciascuno dei 12 archetipi, banco + foto): pallone ai piedi **64 % → ≥ 90 %**
· corpi a T **0** · teletrasporti all'apertura e alla chiusura **0** · eroe dentro il riquadro **100 %** dei
fotogrammi · durata **8-15 s** · opzioni **3** · l'evento della scena **rientra nel tabellino** (`conta.scena` > 0) ·
0 errori di pagina. Soglia: **12/12 archetipi verdi** prima di dichiarare chiuso il cantiere B.

**Costo dichiarato**: la varietà percepita nel primo periodo può scendere (meno testi in circolo); si recupera con il
contesto e aggiungendo testi, che ora costano una riga e non una scena nuova.

## 1-quater. La libreria dei corpi: **CH38 si tiene, mancano i GESTI** (valutazione, 15/09 21:20)

Domanda del PO: «il GLB CH38 è la strada giusta? Vuoi trovare ed installare una nuova libreria che si confà al
motore?». Inventario misurato di `assets/`:

| | misurato |
|---|---|
| corpo | `footballer.glb` **48.140 triangoli** (3,09 MB) · `footballer-lite.glb` **14.622** (1,90 MB) · 7 mesh, 73 nodi, 2 materiali, 4 texture |
| gesti | **16 clip** a disco su scheletro Mixamo a 66 nodi: idle, jog, jog-back, strafe L/R, kick, header, volley, receive, tackle, throwin, penalty + portiere (idle, catch, dive, block) |
| gesti davvero caricati dal renderer | **15 su 16** — `anim-gk-idle.glb` (0,12 MB) sta a disco e **non viene mai caricata** (stessa svista delle tre locomozioni, sanata dalla 7.518) |

**Il corpo non è il problema; il repertorio sì.** I difetti che le sonde continuano a misurare non sono di
geometria ma di gesto: «pallone ai piedi 64 %», corpi a T, posa seduta della panchina costruita a mano sulle ossa.
Per i 12 archetipi di §1-ter mancano **8 clip**: sprint (c'è solo il jog), cross, passaggio corto, finta/cambio di
direzione, **esultanza** e delusione (l'highlight dell'eroe finisce con un gol: oggi non c'è un gesto per
festeggiarlo), caduta su fallo subito, rincorsa della punizione.

**La svolta 2D ribalta il vincolo dei triangoli.** Con il 3D acceso solo in highlight, ingresso e fischio finale,
in quadro ci sono 4-8 attori, non 23: **8 corpi pieni = 385.000 triangoli, meno dei 559.834 di oggi** con i corpi
leggeri e i ventitré in campo. Quindi negli highlight si può **tornare al corpo pieno** (e il leggero resta per
ingresso in campo e fischio finale, dove i corpi sono tanti).

**Raccomandazione: non cambiare libreria adesso.** Si aggiungono le 8 clip mancanti, retargetate sullo **stesso
scheletro** — costo basso e, soprattutto, **nessuna regressione su ciò che è già verde** (piedi a terra 0,12u,
panchina 16/16, triangoli −58 %, kit e texture calibrati). Cambiare libreria oggi significherebbe rifare il
retarget di 16 clip, la posa seduta, i materiali delle maglie e tutte le calibrazioni misurate.

**Quando cambiarla, invece**: se dopo le 8 clip il banco dei 12 archetipi resta sotto le soglie (pallone ai piedi
< 90 %, gesti che leggono come generici), allora si valuta un pacchetto mocap calcistico dedicato — con audit di
licenza, che la pipeline già prevede. Questa è una decisione da prendere **su una misura**, non prima.

## 2. Obiettivo e metro finale

- **Metro di uscita**: scheda da telefono su 4 partite (Vairo casa, Galli fuori, Moretti casa, Conti fuori) con
  **media ≥ 9 su 12 aree, nessuna area < 7**, zero bugie P0/P1; il PO collauda solo oltre questa soglia.
- **Nuovo metro del tabellino** (aggiunto il 15/09): ogni voce mostrata a schermo deve stare **fra la metà e il
  doppio** del valore di una partita vera, e nessuna voce mostrata può essere **strutturalmente zero**.
- **Regole invariabili**: misura → rimedio → ri-misura con rosso appaiato; una misura alla volta; una sola sonda nel
  browser alla volta; revoca a verbale se non batte la misura; nessuna regressione su un metro spedito; dichiarare
  sempre ciò che non è verificato (Chromium 412×915 ≠ Android del PO); `main` solo fast-forward con career-critical +
  ci verdi sul build esatto; mai il game engine dalla squadra grafica.

## 3. I cantieri

### F · PARTITA 2D CREDIBILE — il nuovo cantiere di testa
| # | attività | metro (rosso → verde atteso) | stato |
|---|---|---|---|
| F0 | **banco del tabellino** `tabellino-vero.mjs`: 24 voci per squadra contro la partita vera, ripetibile | esiste e gira in < 30 s su 30 partite | **fatto** (15/09 20:50) |
| F1 | **campo dall'alto con i pallini** fra un highlight e l'altro: 22 pallini + pallone dalle posizioni del motore, maglie dei due club, numero/nome dell'eroe evidenziato | i pallini seguono il motore: scarto reso↔logico ≤ 0,5u · nessun pallino fuori dal campo · 60 fps al banco · niente 3D fra gli highlight (triangoli in scena → 0 fuori dagli highlight) | da scrivere |
| F2 | **statistiche in sovrimpressione**: possesso, tiri, tiri in porta, corner, falli, expected goal, passaggi, parate — lette dal motore, non inventate | ogni voce mostrata entro metà/doppio del vero (banco F0) · nessuna voce a zero strutturale · il totale a fine partita coincide con la somma degli eventi | da scrivere, **dipende da A9 + A8 + A10** |
| F3 | **pagelle dei calciatori** con gol, ammonizioni, espulsioni, assist: voto da azioni misurate (tiri, passaggi riusciti, contrasti, gol, errori), non da sorteggio | 22 pagelle a fine partita · voto nell'intervallo 4-9 · ogni evento della pagella ha un evento del motore che lo giustifica (traccia 1:1) | da scrivere, **dipende da A10** |
| F4 | **mister annegato nella telecronaca**: via il riquadro della panchina, la sua voce entra nel flusso della cronaca come una riga fra le altre | riquadri del mister a schermo 1 → 0 · righe del mister nella cronaca ≥ 1 ogni 15' · sovrapposizione al campo 0 % | da scrivere |
| F5 | **3D solo in highlight dell'eroe, ingresso in campo e fischio finale**: accensione e spegnimento della scena 3D, con il costo di caricamento pagato una volta | 3D acceso solo nei tre momenti · passaggio 2D→3D ≤ 0,6 s · fps del 2D ≥ 50 al banco · **fps veri dal telefono del PO** | da scrivere |
| F7 | **le interazioni dell'eroe, armonizzate** (decisione PO 15/09): una scelta esiste **solo dentro un highlight dell'eroe** — fuori dagli highlight il campo 2D scorre e non c'e' nessun cursore; la scelta apre con 1,5 s di 3D muto (vedi la situazione), poi le opzioni con una barra del tempo **visibile** e, se scade, parte l'opzione piu' ovvia (non la peggiore); **l'esito rientra nel tabellino e nelle pagelle** (il tuo passaggio e' un passaggio, il tuo tiro fa xG, il gol del compagno sul tuo passaggio e' un assist tuo); gli altri 21 continuano a giocare durante la scena (B3) | interazioni a partita 6-10, **100 % dentro un highlight** · cursori fuori dagli highlight 1 → 0 · scelte scadute per timer ≤ 10 % · eventi di tabellino generati dalla scelta tracciati 1:1 · il mondo non si ferma: uomini in movimento in scena ≥ 60 % | **da progettare** (alternativa scartata: togliere del tutto le interazioni — il gioco diventerebbe un tabellino animato e l'area «Interazioni» della scheda sparirebbe) |
| F6 | scheda del PO dedicata: 4 partite con la partita 2D, voti delle 12 aree | media ≥ voti attuali, nessuna regressione | dopo F1-F5 |

### A · MOTORE — «è calcio» (source of truth)
| # | attività | metro (rosso → verde atteso) | stato |
|---|---|---|---|
| A9 | **il tempo del mondo — ora il prerequisito n° 1**: (a) il motore decide ~11 volte al minuto con le grandezze per decisione scalate a dt (passo di conduzione, falli, palla persa, snap); (b) **il volo del pallone quattro volte più rapido** (oggi un passaggio resta in aria mezzo minuto: a 11 decisioni il motore trova la palla in volo nel 74,9 % delle chiamate); (c) il gioco corto per aprire il secondo tetto dei passaggi | banco 20:58, misurato a copie di `src/14` fuori dal ramo: chiamate con un evento 31,4 → **55,3 %** · tiri 3,5 → **7,3** · tiri in porta 2,2 → **4,2** (vero 4,3) · falli 12,5 → **16,4** (vero 13) · passaggi 46 → **78** (vero 450, tetto a ~110) · voci in banda 2 → 5 su 24 · da tenere: salti > 5u per chiamata 0, corsa per uomo e minuto ±20 %, invarianti a zero | **v1 scartata** (tiri 6,9 ma area 0,7, interruzioni 21, 16 teletrasporti); **v2 progettata sui numeri del 15/09 20:58**, da scrivere |
| A8 | **l'arbitro esiste**: falli 3 → 13, rimesse laterali 0,7 → 22, corner 0,5 → 4,9, rinvii dal fondo 0,4 → 7 | banco F0: le quattro voci entro metà/doppio del vero · banda ci «arbitro-esiste» stabile ≥ 6 | 7.903 (0,22/0,08) in produzione tiene la banda; il passo vero apre dopo A9 |
| A10 | **le voci che non esistono**: ammonizioni, espulsioni, fuorigioco, assist — eventi veri del motore, non decorazioni della UI | ammonizioni 0 → 2,4 · espulsioni 0 → 0,11 · fuorigioco 0 → 1,7 · assist 0 → 1,0 (per squadra, banco F0) · ogni cartellino nasce da un fallo esistente | **nuovo**, da progettare |
| A11 | **expected goal onesti**: xG derivato da zona, pressione e piede, sommato per squadra | xG per squadra 0,15 → 1,0-1,6 · xG della squadra che segna > xG dell'altra nel 60 % delle partite | **nuovo**, dopo A9 |
| A5 | cross e ricezioni (#38): il cross atterra su qualcuno | cross ricevuti ≥ 60 %, mediana ≤ 2u; cross per squadra 0,7 → ≥ 8 | aperto |
| A6 | portiere e gesti (codici 000/111, #46, #49) | doppio gesto 0; portiere in tempo ≥ 90 % delle parate; parate 1,1 → 3,2 | aperto |
| A7 | azioni: strumento nel live (sonda `azioni`) e soglia | azioni (≥ 3 passaggi → area) ≥ 6/partita | strumento da scrivere |
| A1-A4 | primo tocco, cadenza a tre fasi, padrone del pallone, la squadra tira | vedi avanzamento | **in produzione** (7.894 · 7.898 · 7.897 · 7.900) |

### B · HIGHLIGHT DELL'EROE — «l'unico 3D, quindi perfetto» e **guidato dal motore unico** (§1-bis)
| # | attività | metro | stato |
|---|---|---|---|
| **B0** | **l'highlight nasce dal motore**: il motore dichiara «qui sta per succedere qualcosa dell'eroe» (tiro, cross, contrasto, occasione) e la scena 3D veste quell'evento; le 191 schede del catalogo diventano il testo di un evento del motore, non la sua causa | scene nate da un evento del motore 0/N → **N/N** (id dell'evento nella scena) · call-site del catalogo che generano una scena da soli **6 → 0** | **nuovo, il primo passo di B** |
| B2 | l'esito torna nel motore: chiusura continua (`riprendi` completo) | salti alla chiusura 0; pallone continuo fra 3D e 2D | da fare |
| B3 | `tickScena`: il motore muove i ventidue anche in scena (via il loop del pressing 2025) | scritture non-motore in scena 8-12 → 0; corpi in movimento in scena ≥ 60 % | da progettare |
| B4 | attori della scena dai ruoli del motore (portatore, difensore, portiere) | distanza attore-ruolo mediana ≤ 3u | da fare |
| B5 | muro/rigore/corner fotografati e valutati | scheda: area «scene» ≥ 8 | da fare |
| B7 | **12 archetipi al posto delle 185 schede** (§1-ter): geometria, opzioni ed esito dall'archetipo + motore; le schede diventano testo | archetipi verdi 0/12 → **12/12** sulle 8 misure di §1-ter · opzioni per scena ≤ 3 (oggi max 21) · testi potati 185 → 60-80, nessuno che prometta un gesto che il motore non sa fare | **nuovo, dopo B0** |
| B6 | **regia dell'highlight** (nuovo, con F5): ingresso, inquadratura, uscita — il 3D si vede per 8-15 s e deve essere impeccabile | ogni highlight: 0 teletrasporti · 0 corpi a T · pallone ai piedi ≥ 75 % · foto da 412×915 | dopo F5 |
| B1 | scena senza teletrasporto (7.890, 7.891) | apertura 50 → 0; piazzato 32,8u → 0 | **fatto** |

### C · GRAFICA & UX — «wow, professionale» (la review di TUTTE le schermate resta, direttiva PO 15/09)
La review non si ferma per la svolta 2D: **ogni schermata del gioco viene fotografata a 412×915 e 412×700, misurata
con la griglia (contrasto, testo < 10 px, overflow, pieni per vista, gerarchia) e corretta**. Il gioco ha 19
schermate; C4 le percorre una per una, una alla volta, con misura appaiata prima/dopo e foto nel verbale.

| # | attività | metro | stato |
|---|---|---|---|
| C4 | **review grafica schermata per schermata** — le 19 viste: `dashboard`, `match`, `postmatch`, `training`, `calendar`, `standings`, `club`, `clubPresentation`, `profile`, `press`, `agente`, `coppe`, `nazionale`, `nationalCallup`, `seasonAwards`, `seasonEnd`, `careerEnd`, `proTransition`, `menu/creazione` | per ogni schermata: contrasto ≥ 4,5 · testo < 10 px = 0 · overflow orizzontale = 0 · pieni ≤ 1 per vista · gerarchia dichiarata; nessuna regressione sulle schermate già passate | **cantiere aperto, una schermata alla volta** |
| C4.1 | tema scuro fotografato su tutte le 19 | contrasto scuro ≥ 4,5 su 19/19 | da fare |
| C4.2 | griglia automatica nel `ci` per le 19 viste (regressione grafica) | 19 viste misurate a ogni ci, +≤ 4 min | da fare |
| C9 | **insegna LED del nome stadio sospesa nel cielo** (PO 15/09: «il led con il nome dello stadio vola») — ancorarla al bordo alto della tribuna, misurata stadio per stadio come C7 | cielo fra insegna e tribuna: rosso → 0 px in 9/9 impianti | da fare |
| C11 | **[IN PRODUZIONE 16/09 02:40]** 22/22 corpi CH38 · piedi a quota 0 · per mano a 0,72u su tutte le coppie · 0 errori · 2 chiamate di disegno a bambino invece di 7 · nuovo gancio `__CPM_FORCE_WALKOUT` che rende misurabile la cerimonia. **i bambini dell'ingresso in campo con il corpo CH38** (PO 15/09 21:45) — oggi le **22 mascotte** (una per calciatore, in divisa avversaria, tenute per mano nella walkout) sono figure procedurali `mkFig(kit,1.04)`; la fabbrica per sostituirle **esiste già**, è la stessa di C8 (`_mkA(proc,kit,appr,_srcScene)`), servirebbe un terzo elenco `mascotGlbAvatars` accanto a `glbAvatars` e `benchGlbAvatars` | corpi CH38 fra i bambini 0/22 → **22/22** · piedi a terra ≤ 0,15u · mano nella mano agganciata all'osso (come la posa seduta della panchina) · **proporzioni da bambino**, non adulto in miniatura (testa +12-15 %, foto ravvicinata) · **costo dichiarato: +154 chiamate di disegno nella walkout** (22 × 7 mesh) su ~153 di oggi → **da fare dopo D12**, altrimenti si raddoppia il carico proprio dove sta il collo di bottiglia · fps della walkout misurati dal PO | **fattibile, in coda a D12** |
| C10 | **vestizione della partita 2D** (con F1-F3): campo, pallini, pannello statistiche, pagelle — un solo linguaggio grafico con il resto del gioco | griglia verde sulla nuova vista · coerenza dei colori con le maglie dei due club · nessun testo < 10 px | con F1-F3 |
| C5 | performance mobile: misura sull'Android del PO | fps ≥ 30 sul telefono del PO (da lui misurato) | **misura appaiata fatta (21:35)**: pieni **31-32** (picco 38) · leggeri **29-30** (picco 34). Soglia superata col pieno; **l'alleggerimento non dà fotogrammi** → D7 revocata, si torna al corpo pieno. Prossima leva: meno corpi in quadro (F5) e meno mesh/ossa per corpo (D12) |
| C6 | report finale in 16 sezioni della direttiva | consegnato | da scrivere |
| C1-C3, C7, C8 | fondamenta G0-G3, HUD della partita (C3 v4), tabelloni, panchina GLB | vedi avanzamento | **in produzione** |

### D · COLLAUDO, STRUMENTI, SKILL
| # | attività | metro | stato |
|---|---|---|---|
| D1 | scheda da telefono con scala 9, 4 partite, a ogni rilascio | media, area minima | ricorrente |
| D2 | sonda `azioni` + `padrone` nel live (per A3/A7) | esiste, ripetibile (due corse identiche) | da scrivere |
| D3 | smoke dei flussi mancanti nel `ci`: import, creazione carriera, navigazione tab, responsive | 4 smoke verdi; `ci` +≤ 6 min | da fare |
| D4 | subagent `regressione-pre-release` in `.claude/agents/` | usato a ogni release | da fare |
| D5 | skill custom: `build-frammenti`, `misura-appaiata`, `rituale-produzione`, poi `motore-possesso`, `sonda-telefono`, `griglia-mobile`, `verbale` | esistono e sono vere | da fare |
| D6 | `CLAUDE.md` e `ARCHITECTURE_MAP.md` allineati a `src/`, motore, rituale, rami | 5 patch proposte | da confermare |
| D7 | librerie migliori: corpo CH38 alleggerito per i 22, i portieri, l'arbitro | triangoli in scena 1.317.654 → 559.834 (−58 %) ma **fotogrammi sul telefono del PO 31-32 → 29-30** | **REVOCATA a verbale il 15/09 21:35**: non batte la misura. Il campo torna al corpo pieno; l'interruttore `[D7 TEMP]` va tolto. Resta valido l'uso del corpo leggero **in panchina** (C8), dove il metro era sui triangoli (+19,5 % invece di +68,6 %) e non sui fotogrammi |
| D8 | **guardiano del tabellino nel `ci`** (nuovo): le 24 voci di F0 non possono peggiorare | banda per voce, rosso se una voce esce dal metà/doppio | dopo A9 |
| D12 | **[7.910 sul ramo, misurata]** il corpo arriva unito e il kit si tinge dall'attributo: chiamate di disegno per fotogramma **124 → 93 (−25,0 %)** con ~6 corpi in quadro (con i ventitré il risparmio sarebbe ~115 chiamate), triangoli invariati, kit/pelle/capelli con le stesse tinte del braccio di controllo, 0 errori di pagina. Difetto trovato e corretto **prima** di spedire: lo shader compilato contro `vMapUv` (three r152+) invece di `vUv` (r128, quello che il gioco monta) faceva **sparire i ventidue dal campo senza alcun errore di pagina** — l'hanno visto le foto, non il conteggio. Fotogrammi veri: **misura del PO**. **Non ancora verificato**: il numero sul dorso della maglia (i giocatori nelle foto sono ripresi di fronte) | **meno chiamate di disegno, non meno triangoli** (misura 21:40): 7 mesh × 23 corpi ≈ **153 chiamate di disegno per fotogramma**, e tagliare il 57,6 % dei triangoli le lascia a 145. Sul telefono il collo è la CPU, non la GPU. Leva: unire le mesh di ogni corpo, ridurre le ossa dei corpi lontani, **ridurre i corpi in quadro** (F5). **Ispezionato il GLB (21:58): le 7 mesh usano SOLO 2 MATERIALI** — `Ch38_body` (calzoncini, maglia, calzettoni, corpo, scarpe: 37.652 triangoli) e `Ch38_hair` (ciglia, capelli: 10.488) — quindi sono unibili in **2 mesh**, cioè **46 chiamate di disegno invece di 161**. Ostacolo dichiarato: i 7 skin hanno liste di ossa diverse (7 · 30 · 10 · 61 · 8 · 6 · 6), quindi l'unione va fatta **offline** rimappando gli indici su uno skin unico, non a caldo | chiamate di disegno per fotogramma **153 → ≤ 50** · mesh per corpo 7 → 2 · **fps sul telefono del PO 31-32 → ≥ 45** (misura del PO, appaiata) · nessuna regressione su piedi a terra, kit e animazioni | **nuovo, al posto di D7 — la strada è misurata** |
| D10 | **8 gesti mancanti** (§1-quater): sprint, cross, passaggio corto, finta, esultanza, delusione, caduta su fallo, rincorsa punizione — retarget sullo stesso scheletro; più `anim-gk-idle` che sta a disco e non è caricata | clip caricate 15 → 24 · i 12 archetipi coperti da un gesto proprio 4/12 → 12/12 · nessuna regressione su piedi a terra (0,12u) e triangoli | **nuovo, prima di valutare una libreria diversa** |
| D11 | **corpo pieno negli highlight** (§1-quater): con 4-8 attori in quadro il pieno costa meno dei 23 leggeri di oggi | triangoli in un highlight ≤ 559.834 (oggi in campo) · corpo pieno negli highlight, leggero in ingresso e fischio finale · fps del PO | **rafforzato dalla misura del 21:30**: 23 corpi pieni danno già 31-32 fps sul telefono, quindi 4-8 corpi pieni in un highlight hanno margine largo |
| D9 | **guardiano del motore unico** (nuovo, §1-bis): nessuna seconda sorgente di verità | scritture del pallone fuori dal motore 33 → 0 · scene senza id di evento del motore 0 · `conta.scena` > 0 a fine partita | con B0 |

### E · PRODUZIONE E RILASCIO
| # | attività | metro | stato |
|---|---|---|---|
| E1 | `main` in fast-forward con rituali verdi sul build esatto | mai force; verbale per ogni allineamento | attivo |
| E2 | pipeline Android (dist → validate → audit copyright → AAB) verificata su una release | AAB prodotto e installato dal PO | da verificare |

## 4. Sequenza (stime oneste, misurate a ogni passo)

| quando | motore (A) | partita 2D (F) | grafica (C) | highlight (B) / strumenti (D) |
|---|---|---|---|---|
| **15/09 sera** | F0 misurato: il motore è a 1/10 del tabellino vero | F0 fatto | C4 review schermata per schermata: apertura | D7 in attesa dei due fps dal PO |
| **16/09** | **A9 v2 — il tempo del mondo** (eventi 92 → ≥ 600) | F1 campo dall'alto con i pallini (dietro rosso) | C4: `dashboard`, `postmatch` | D2 sonda azioni |
| **17/09** | **A8 l'arbitro esiste** (rimesse, corner, rinvii) | F1 misurata e spedita | C4: `training`, `calendar`, `standings` | B2 chiusura continua |
| **18/09** | **A10 cartellini, fuorigioco, assist** | F2 statistiche in sovrimpressione | C4: `club`, `profile`, `press` | D8 guardiano del tabellino |
| **19/09** | **A11 expected goal onesti** | F3 pagelle con gol/cartellini/assist | C4: `agente`, `coppe`, `nazionale` | B3 tickScena |
| **20/09** | A5 cross, A6 portiere | F4 mister nella telecronaca · F5 3D solo nei tre momenti · F7 interazioni solo negli highlight | C10 vestizione della partita 2D | B6 regia dell'highlight |
| **21-22/09** | A7 azioni ≥ 6 | F6 scheda del PO sulla partita 2D | C4.1 tema scuro, C4.2 griglia nel ci | D3 smoke, D4 subagent |
| **23-26/09** | consolidamento: tabellino entro metà/doppio su 24 voci su 24 | | C9 insegna LED, C6 report | E2 pipeline Android |

Ordine dentro ogni giorno: **prima il motore** (senza numeri veri la vetrina mente), poi la partita 2D che li mostra,
poi la grafica delle schermate; ogni spedizione porta i suoi rituali. F e C toccano lo stesso file
(`15-live-match`): si lavora una cosa alla volta, mai due cantieri sullo stesso file in parallelo.

## 5. Rischi dichiarati
- **A9 è il collo di bottiglia di tutto il cantiere F**: se il tempo del mondo non regge (v1 scartata per
  teletrasporti e interruzioni), le statistiche in sovrimpressione resteranno false e F2/F3 vanno rimandate, non
  truccate. **Non si inventano numeri nella UI: si mostra solo ciò che il motore produce davvero.**
- **Il 3D non si butta, si spegne**: F5 lo accende in tre momenti. Se il 2D non convince il PO, il 3D continuo è
  ancora lì dietro l'interruttore e si torna indietro senza perdere nulla.
- **fps dei 22 GLB sull'Android del PO**: mai misurati; i due numeri (corpi leggeri / pieni) sono attesi da lui.
- **ci stocastico** (guardiani sensibili ai fps del banco): un rosso si ripete prima di essere creduto; una sola
  sonda nel browser alla volta (lezione del 15/09: un secondo Chromium dimezza «ai piedi», 64 → 29 %).
- **Chromium ≠ telefono**: ogni numero grafico e di resa è del banco finché il PO non fotografa.
- **subagenti**: limite di spesa (429) già incontrato; la delega è per compiti misurabili, il resto in prima persona.
