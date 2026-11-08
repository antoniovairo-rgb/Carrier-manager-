# Rapporto giro 121 — PO-323 (angolo di testa: eroe girato e lontano), lotto 7.999.185

Ramo `sviluppo/giro121-angolo`, base `lavoro/185` (= main = 7.999.184). `GAME_VERSION` non toccata.
Portato con `git merge --no-ff origin/sviluppo/giro119-angolo` (base del 119 = lavoro/184; lavoro/185 aggiunge solo tre commit di
governo): **nessun conflitto**. Arrivano i rimedi `__CPM_NO_G117A` (src/04, ancora della scena d'angolo/cross in area) e
`__CPM_NO_G119P` (src/12, parata dal piede dell'eroe e taglio sul piano del portiere uscito), i testimoni `__CPM_SV119`,
`__CPM_PARATA119`, `__CPM_GKMIN117`, i guardiani `angolo-117` e `volee-d3-119`, la diagnosi `CPM_D3DIAG` di highlight-95.
`node tools/build-src.mjs` + `node tools/check-src.mjs`: allineato a ogni commit.

## 1. La misura instabile di angolo-117 — riparata, e sotto c'era un difetto vero

**Causa della misura instabile (misurata).** `__CPM_CONT53` annota il primo fotogramma di `hl_result` con l'arco armato e
`ballArcT >= 0`. Ma l'attesa del colpo di testa (`TESTA146`, src/12: «il colpo aspetta il pallone sulla testa», tetto 0,8 s)
rimette a ogni fotogramma `ballArcT = -aDt`, e dopo l'incremento vale **0 esatto**: CONT53 scattava nel **primo fotogramma
d'attesa**, col pallone ancora in convergenza, non al contatto. Il numero dipendeva da quanto durava quell'attesa, cioè dal tempo di
scena (fps). È la stessa famiglia del 7.360/7.502 (misurare il proprio scheduler).

**Testimone nuovo `__CPM_CONT121`** (src/12, sempre acceso e leggero come CONT53, spento da `__CPM_NO_CONT121`): annota il fotogramma
in cui l'arco **parte** (`ballArcT` da ≤ 0 a > 0). In quel fotogramma il moto orizzontale è stato scritto con u = 0, quindi il
pallone è sull'origine dell'arco (`_arcSrcX/Z`, catturata finché T ≤ 0): la distanza eroe↔pallone è quella dell'istante del
contatto. Porta anche angolo corpo↔porta, distanza dalla linea, gesto montato (`act`), bersaglio dell'arco e angolo
corpo↔bersaglio (`at`, solo informativo). `angolo-117` legge CONT121 (CONT53 resta stampato accanto), attende l'uscita da
`hl_result` invece di un tempo fisso, e dichiara «non giudicato» un caso verde senza arco col gesto di testa. **Soglie invariate**
(angolo ≤ 35°, porta ≤ 10,5 u, pallone ≤ 1,0 u).

**Il difetto che la misura vecchia nascondeva (misurato, GLB acceso).** Al contatto vero, sui due casi d'angolo **in area**:
angolo corpo↔porta **136-146°**, gesto **già morto** (`act` nullo); CONT53 sugli stessi casi diceva 0-31°. Traccia per fotogramma
(strumento temporaneo, tolto prima del commit):
- l'attesa TESTA146 comincia col colpo di testa già a 0,63 s su 1,15 di vita (`GESTURE_WIN.header.vita`);
- la distanza testa↔pallone resta in equilibrio a **0,91-1,14 u**, appena sopra la soglia 0,9: è un ritardo d'inseguimento
  (guadagno `aDt*7` → lag ≈ v/7, con la testa che si muove a 5-7 u/s fra stacco e deriva dell'eroe, che arretra di ~2,4 u);
  l'attesa quindi va **sempre al tetto**;
- il gesto si esaurisce prima del contatto, con lui muore la mira latchata (7.517) e il corpo GLB torna sull'orientamento della mesh
  logica (134-139°): **il pallone parte dalla testa di un eroe girato di spalle**. È compatibile con i 159° della nota del PO.

**Rimedi (src/12, nessun sorteggio aggiunto o tolto, motore non toccato):**
1. `__CPM_NO_G121C` (rosso): dentro l'attesa TESTA146 la convergenza sulla testa ha guadagno **14/s** invece di 7/s. Misurato: l'attesa
   finisce in 3-5 fotogrammi (0,03 s di scena) invece che al tetto di 0,8 s.
2. `__CPM_NO_G121H` (rosso): finché l'attesa è aperta, la vita del colpo di testa si ferma 0,15 s prima della fine — il gesto (e la
   mira) arrivano vivi al contatto e si chiudono subito dopo. Con il solo (2) l'angolo al contatto restava variabile (8-37° sullo
   stesso caso: il corpo deriva durante l'attesa lunga), per questo serve anche (1).
3. `__CPM_NO_G121M` (rosso): `_mira20` (giro 20, mira latchata dell'eroe) orientava il corpo verso `(AWAY_GOAL_X, z del bersaglio
   stretto a ±3,3)`, ma `AWAY_GOAL_X` = 46 è la rete interna dei sorgenti 3D, **non la linea di porta (48,6)**. Con lo stacco in area
   (eroe a x ≈ 44, 4,2-4,6 u dalla linea, effetto dell'ancora G117A) quel punto sta 2 u davanti: uno scarto laterale di 2,4 u diventava
   40-50° di rotazione. Misurato: corsa 2 del guardiano rossa, `angolo-area-fail` **38°** (bersaglio z 2,4). Ora la mira usa la linea
   48,6: sugli stessi casi 1-20°. Vale per ogni gesto direzionale dell'eroe con bersaglio verso la porta (GLB acceso; il gate gira GLB
   spento e non lo vede).

**Guardiano `angolo-117` ora a tre bracci:** verde · rosso `__CPM_NO_G117A` (casi lontani, porta ≥ 25 u) · rosso `g121`
(`__CPM_NO_G121H`+`__CPM_NO_G121C`, casi in area, angolo > 35°). Il rosso g121 dipende dal tempo di scena (l'attesa deve sopravvivere
al gesto residuo): misurato 2/2 e 1/2 casi girati; il guardiano pretende **almeno un** caso girato e stampa quanti.

**Corse di angolo-117 sul build finale (tre consecutive, una alla volta, ~12 min ciascuna):**

| corsa | verde (8 casi): angoli al contatto | porta max | pallone max | rosso G117A | rosso g121 |
|---|---|---|---|---|---|
| 1 | 4 · 4 · 15 · 30 · 18 · 26 · 5 · 15 | 6,6 u | 0,58 u | 6/6 ≥ 25 u | 1/2 girati |
| 2 | 3 · 4 · 23 · 29 · 14 · 2 · 4 · 17 | 6,7 u | 0,58 u | 6/6 | 2/2 |
| 3 | 4 · 10 · 25 · 26 · 8 · 4 · 2 · 9 | 6,3 u | 0,58 u | 6/6 | 1/2 |

Prima, sullo stesso guardiano con i soli rimedi 1-2: una corsa verde e una rossa (38°, causa al punto 3) — non contate fra le tre.
Il margine più stretto è 30° su 35° (`angolo-lato-alto-fail`): lo dichiaro, non è stato toccato niente per allargarlo.
Il pallone al contatto è salito da 0,1-0,4 u (CONT53) a 0,4-0,6 u (CONT121): è l'origine vera dell'arco, che CONT53 misurava un
fotogramma dopo e in un altro istante; resta sotto la soglia 1,0.

## 2. Catena dei controlli (uno alla volta, `free -m` e `df -h` prima di ciascuno)

| controllo | esito |
|---|---|
| angolo-117 ×3 (build finale) | ✅ tre consecutive, verde + rosso G117A 6/6 + rosso g121 (tabella al §1) |
| volee-d3-119 | ✅ verde 0,94 · 0,68 · 0,55 u (≤ 1,5), rosso 4,16 · 4,66 u (cross in area 0,65: caso di controllo) · 3 min 49 s |
| highlight-95 completo (`CPM_RIGHE=1`) | ❌ verde 104 highlight, 26 passaggi (88,5% arrivati), 13 gol compagno = 13 assist, **1 difetto: D3** (sotto) · rosso visibile (108 highlight, D1-D4 accesi, D4 senza esito 5) · ~61 min |
| scena3d-96 | ✅ 31/31 scene, 0 errori di pagina |
| partita-vera | ✅ bande d'accettazione tenute (tabellone e gol-del-simulatore «non giudicabili, campione sotto minimo», come dichiara lo strumento) |
| replay | ✅ 8 highlight, completi e coerenti |
| validate-situations | ✅ 14/14, fingerprint 00001505, 0 failure |
| tabellone-117 | ✅ ripresa e percorso normale verdi, rosso visibile |
| intro-118 | ✅ verde |
| test:logic | ✅ 43 pass · 0 fail |
| save-compat | ✅ 12 pass · 0 fail |

## 3. Il D3 nel verde di highlight-95 — NON chiuso, documentato

`D3 s12/7 «💥 Tiro di potenza»: «Conclusione centrale» ma il pallone non arriva mai al portiere entro 1,5 s dall'esito (minimo 6,5)`.
Riga della sonda: `tipo=shot 3D=null g=tiro:saved kind=saved gk-palla=7,6 eroe-dif=18,06 palla-eroe=17,9 minGB=6,5 via=scena+occupata`.

Misurato:
- è un **tiro** (non un angolo né una volée, non un colpo di testa): i rimedi G121H/G121C valgono solo per `header`, G121M solo col
  GLB acceso (highlight-95 gira GLB spento), CONT121 è sola lettura → **i rimedi di questo giro non toccano questa scena** (dedotto dal
  codice, non misurato su un braccio con i rimedi spenti);
- riprodotta da sola (`CPM_SALVA=s12 CPM_SEMI=7 CPM_ARMI=verde`, entrambe le politiche): **stessa scena, stessa forma, minimo 5,2 u**
  (sotto la soglia 6, quindi non conta come difetto in quella corsa). È una scena **al limite** che ricorre, non un caso unico;
- con la sola politica «pass» la scena non esce (è della politica «drib»): la diagnosi `CPM_D3DIAG` (ora stampata anche sotto
  soglia, da 4 u) non l'ha catturata in quella corsa.

Non so ancora dire la causa: non dichiaro né che sia pre-esistente sulla base lavoro/185 né che sia nata da G117A/G119P (non ho
corso la base su questo seme). Indizi: all'esito il pallone sta già a ~18 u dall'eroe e il portiere a 6-7,6 u dal pallone, come se
l'arco «parato» non finisse sul portiere — la famiglia del taglio 258/G119P, ma su un tiro da fuori area dove G119P (origine al
piede quando il pallone è a oltre 4 u dall'eroe) può scattare.

**Prossimo passo per la madre:** `CPM_SALVA=s12 CPM_SEMI=7 CPM_ARMI=verde CPM_POL=drib CPM_D3DIAG=1 node highlight-95.mjs` (≈ 6 min)
sul build di questo ramo e, accanto, con `__CPM_NO_G119P` e sulla base lavoro/185, per sapere se il rimedio 119 lo produce, lo
lascia o lo riduce.

## 4. Il telefono resta il giudice

La nota del PO riportava **159°** corpo↔porta al contatto, al telefono. Qui, in headless GLB acceso, prima dei rimedi si misurano
**136-146°** al contatto vero sui casi d'angolo in area (e 0-31° col testimone vecchio, che scattava un fotogramma d'attesa troppo
presto). Il numero del telefono resta il giudice: headless e telefono hanno tempi di scena diversi, e il difetto trovato qui (l'attesa
del colpo di testa che sopravvive al gesto) dipende proprio dal tempo di scena. Il taccuino porta già `__CPM_CONT53` con **distanza
eroe↔pallone (`db`) e distanza dalla linea di porta (`gx`)** dal giro 117; il testimone nuovo `__CPM_CONT121` (contatto vero, con
gesto montato e angolo corpo↔bersaglio) è sempre acceso ma **non è ancora scritto nella bozza del taccuino**: va aggiunto lì perché
la prossima nota del PO porti il numero all'istante giusto (non fatto in questo giro: tocca src/10, fuori dal lavoro chiesto).

## 5. Cosa resta alla madre

1. Il D3 di `s12/7 «Tiro di potenza»` (§3): diagnosi e decisione.
2. Seconda/terza corsa del solo braccio verde di highlight-95: vedi riga in fondo (una eseguita entro il tetto).
3. Decisione (non mia): tutti i rimedi sono attivi di default. Interruttori: `__CPM_NO_G121H`, `__CPM_NO_G121C`, `__CPM_NO_G121M`
   (giro 121), `__CPM_NO_G119P`, `__CPM_NO_G117A` (giri 119/117), testimone `__CPM_NO_CONT121`.
4. `GAME_VERSION` non toccata (7.999.184 nel codice).
5. Nota di metodo: le tre corse di angolo-117 sono state lanciate in sequenza in un unico processo di sfondo, con attesa in primo piano
   sul file; `free -m` registrato fra una corsa e l'altra (13,5-13,6 GB liberi), `df -h` solo prima della prima.
