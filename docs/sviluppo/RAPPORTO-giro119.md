# Rapporto giro 119 — PO-323 (angolo, eroe girato e lontano) e il D3 aperto di highlight-95

Ramo `sviluppo/giro119-angolo`, base `lavoro/184`. `GAME_VERSION` non toccata (7.999.184 nel codice).
Portati dal giro 117 con `git cherry-pick`: `9903a18c` (rimedio src/04 + guardiano `angolo-117`, rosso `__CPM_NO_G117A`),
`60145252` (testimone `__CPM_GKMIN117`), la sola parte `tests/` di `f446cd4e` (`CPM_D3DIAG` in highlight-95). Non portato
`dd42d996` (PO-324, già su lavoro/184). Unico conflitto: `tests/visual/package.json` (le due righe `tabellone-117` e
`angolo-117` tenute entrambe). `node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte a ogni commit.

## 1. La causa del D3 — STABILITA

`D3 s1/2021 «⚽ Volée di collo potente»: «Grande parata del portiere» ma il pallone non arriva mai al portiere entro 1,5 s
dall'esito (minimo 6,8)`.

**Riproduzione.** La partita s1/2021 «pass» da sola (nessun altro lavoro sulla macchina) esce 3-1 con una sola volée, segnata:
3 corse su 3 senza D3. Con il carico della sonda vera (`CPM_SALVA=s1`, 3 semi × 2 politiche, `CPM_PAR=3`: la stessa prima
ondata di tre partite della corsa completa) il D3 è comparso **2 volte su 3** (minimo 6,8 e 6,9), poi non più (la partita
dipende dall'orologio a parete). Diagnosi `CPM_D3DIAG` delle due corse col D3, coincidenti:

| | eroe | portiere | pallone |
|---|---|---|---|
| ingresso in scena | (87,6; 47,8) | **(91,1; 48,4)** | (97; 97,5) = bandierina |
| esito rivelato | (90,0-90,3; 47,8) | (91,1-91,2; 50,9) | (97-97,5; 55,5-55,8) quota 0,9 |

Coordinate logiche (x 3D = x − 50). Tre fatti misurati:

1. **Il portiere è uscito** a 1-3,5 u dall'eroe fin dall'apertura della scena. Lo mette lì il brain della scena
   (`chiedi.scenaMuovi`, src/15 ~4184), che nelle scene offensive del flusso vero muove i ventidue; nelle scene forzate quel passo
   non gira e il portiere resta sulla linea (94,9): è il motivo per cui le scene forzate del giro 117 davano 0,2-2,4.
2. **Il pallone, all'armo della conclusione, è ancora sulla bandierina** (testimone nuovo `__CPM_SV119`: `sx 47, sz ±32,3` in
   3D su tutti gli angoli). Col GLB acceso il volo al piede (274) lo porta al piede prima del calcio; **col GLB spento — come gira
   highlight-95 — il volo 274 non esiste** (vive nel ramo `glbAvatars`) e l'arco parte dalla bandierina.
3. **Il taglio della parata non scattava.** Il ramo «la parata finisce sul piano del portiere» (giro 40, `__CPM_NO_PARATA258`,
   src/12) vale solo se il pallone parte ad almeno 2 u **prima** del portiere (`_sx258 < _gx258 - 2`). Con l'origine sulla
   bandierina (x 47) o col portiere uscito a meno di 2 u, la condizione è falsa e l'arco «parato» prosegue fino alla porta
   (x ≥ 42, morsetto `AWAY_GOAL_X-4`): il pallone corre lungo la linea e si ferma sul palo a 6,4-7,9 u dal portiere che «para».

Col GLB acceso (telefono) si vede lo stesso difetto in un'altra forma: il pallone vola al piede, ma l'arco tiene il bersaglio in
porta, passa accanto al portiere uscito e dopo l'esito è a ~5 u da lui (rosso del guardiano, sotto).

**Relazione col rimedio del giro 117.** Il rimedio non crea il difetto: sposta l'ancora delle scene d'angolo/cross in area (x
87-93), dove il brain fa uscire il portiere — ed è lì che il taglio 258 non ha il ramo per «portiere vicino» né per «pallone ancora
sulla bandierina». Il ramo mancante è nel codice di prima (src/12, giro 40), non nel rimedio 117: la condizione dipende solo da
dove stanno pallone e portiere all'armo (vale identica per un angolo già in area, che il rimedio 117 non sposta — dedotto
dal codice, non misurato su un angolo in area con portiere uscito). Sul flusso della base (lavoro/184 senza rimedio) non l'ho cercato su più semi/salvataggi: non posso confermare né
escludere che sia comparso sulla base.

**Correzione di una conclusione del giro 117.** Il rapporto 117 scrive che il testimone per fotogramma `__CPM_GKMIN117` «ha dato di
nuovo 6,8». Quel testimone vive dentro `if(glbAvatars){ for(...) }` (src/12 ~11212/11308): con il GLB spento di highlight-95 **non
scrive mai** (verificato: nelle scene forzate GLB spento resta `null`, GLB acceso misura). Il 6,8 veniva solo dall'interrogazione.
In questo caso il numero era comunque vero (pallone fermo sul palo), ma il testimone non lo prova. Lo lascio com'è (solo GLB).

## 2. Il rimedio (src/12, rosso `__CPM_NO_G119P`)

Nel ramo della parata, dopo il taglio 258 (che resta identico quando scatta):
- l'origine del tiro è il **piede dell'eroe** quando all'armo il pallone dista oltre 4 u da lui (la stessa soglia del volo 274);
- se il portiere sta davanti all'origine (anche a meno di 2 u), l'arco **finisce sul piano del portiere**, direzione conservata,
  durata scalata sulla corda; a meno di 2 u la z è stretta sul corpo (± 0,9 u) e la quota dell'arco scalata sulla corda.
Nessun sorteggio aggiunto o tolto; il motore non è toccato (lezione 7.511). Testimoni solo `__CPM_REC`/cpmtest: `__CPM_SV119`
(geometria della parata all'armo, in entrambi i rami) e `__CPM_PARATA119`. Gancio solo `?cpmtest=1`: `__CPM_GKAT119` (bersaglio
del portiere in scena, per costruire la scena forzata col portiere uscito).

## 3. Guardiano `npm run volee-d3-119` (GLB acceso, ~4 min)

Scena d'angolo/cross dal motore (`scenaDalMotoreCross`), volée scelta, esito forzato fallito con chiave `saved`, portiere uscito a
2 u davanti all'eroe, pagina nuova per caso; misura per fotogramma lato pagina il minimo portiere↔pallone nei 1,5 s dopo l'esito
(stessa grandezza del D3 di highlight-95). Soglie fissate dopo la misura:
- verde ≤ 1,5 u: misurato 0,83 · 0,64 · 0,32 (angolo lontano spostato, angolo lontano lato alto, cross in area);
- rosso ≥ 3 u sui due angoli: misurato 4,42 · 5,03 (il cross in area, dove il taglio 258 già scattava, resta 0,35 nel rosso: è il
  caso di controllo).

## 4. Catena dei controlli (uno alla volta, `free -m` e `df -h` prima di ciascuno)

| controllo | esito |
|---|---|
| test:logic | ✅ 43 pass · 0 fail |
| save-compat | ✅ 12 pass · 0 fail |
| volee-d3-119 (nuovo) | ✅ verde 0,83 / 0,64 / 0,32 u, rosso visibile 4,42 / 5,03 u |
| angolo-117 | ❌ **instabile**, vedi sotto (rosso visibile 6/6 in entrambe le corse) |
| highlight-95 completo, corsa 1 | ✅ verde 97 highlight, 15 parate giudicate, **0 difetti**; rosso visibile (D1-D4) · 68 min |
| replay | ✅ 8 highlight |
| validate-situations | ✅ 14/14, fingerprint 00001505, 0 failure |
| tabellone-117 | ✅ ripresa e percorso normale verdi, rosso visibile |
| highlight-95 braccio verde, corsa 2 | ✅ 102 highlight, 18 parate giudicate, **0 difetti** · s1/2021 «pass» uscita **4-2 con 7 highlight** (la forma della partita del D3 nel giro 117) · 34 min |
| highlight-95 braccio verde, corsa 3 | ⏳ non eseguita: tetto delle 4 ore |
| scena3d-96 | ⏳ non eseguito: tetto delle 4 ore |
| partita-vera | ⏳ non eseguito: tetto delle 4 ore |

**Il D3 nel braccio verde e la scena s1/2021.** Nella corsa 1 completa la seconda volée di s1/2021 (la scena del D3) **non è
uscita** (partita 3-1 con 6 highlight, una volée segnata): il verde senza D3 di quella corsa non prova da solo il rimedio su
quella scena. La prova deterministica del rimedio è il guardiano `volee-d3-119` (scena forzata, rosso visibile). Sulla sonda vera
il caso è uscito 2 volte su 3 corse mirate sotto carico **prima** del rimedio; dopo il rimedio, 0 D3 in 1 corsa mirata e 2 corse
complete del verde. Nella corsa 2 s1/2021 è uscita 4-2 con 7 highlight come la partita del D3, ma senza `CPM_RIGHE` la sonda non
stampa le scene: non posso confermare che la volée parata ci fosse. Quindi non dichiaro chiuso dalla sonda vera il D3 di quella
scena; lo dichiaro chiuso sulla scena forzata equivalente (GLB acceso).

**`angolo-117` instabile (regola PROCESSO «Controlli instabili»: si ripara, non si ripete).** Due corse sul build di questo giro,
due rossi diversi, ciascuno su un solo caso e su un colpo di testa **riuscito** (che non entra nel ramo della parata toccato qui):
- corsa 1: `angolo-lato-alto-ok` pallone a 1,1 u al contatto (soglia 1,0); gli altri 7 casi 0,3-0,5;
- corsa 2: `angolo-area-basso-ok` pallone a 2,4 u, angolo 35° (caso in area, che nessun rimedio sposta); `angolo-lato-alto-ok` 0,5.
Ipotesi (non verificata): il testimone `__CPM_CONT53` registra la distanza nel **primo fotogramma con l'arco già partito**
(`ballArcT >= 0`), cioè fino a un passo di scena (0,05 s) dopo il contatto: è la trappola «velocità × intervallo» del 7.360/7.502.
L'arco non conserva la sua origine (non c'è una variabile x/z d'origine), quindi la riparazione chiede un testimone nuovo
(origine registrata all'armo) e una nuova misura: non sta nel tempo di questo giro. Soglia non toccata.

## 5. Cosa resta alla madre

1. Corse 2-3 del braccio verde di highlight-95, `scena3d-96`, `partita-vera`: da eseguire (in sequenza) sul build di questo ramo.
2. Riparare la misura di `angolo-117` (origine dell'arco all'armo) prima di usarlo come cancello.
3. Decisione (non mia): il rimedio è attivo di default. Interruttori: `__CPM_NO_G119P` spegne solo il ramo nuovo della parata;
   `__CPM_NO_G117A` spegne lo spostamento dell'ancora del giro 117.
4. Con GLB spento l'arco della conclusione su angolo parte dalla bandierina (il volo al piede 274 è solo GLB): non è il telefono,
   ma è ciò che vedono tutte le sonde GLB-spento. Non l'ho toccato.
