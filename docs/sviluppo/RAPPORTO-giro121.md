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

**Guardiano `angolo-117` ora a tre bracci:** verde · rosso `__CPM_NO_G117A` (casi lontani, porta ≥ 25 u) · rosso `g121`
(`__CPM_NO_G121H`+`__CPM_NO_G121C`, casi in area, angolo > 35°). Il rosso g121 dipende dal tempo di scena (l'attesa deve sopravvivere
al gesto residuo): misurato 2/2 e 1/2 casi girati; il guardiano pretende **almeno un** caso girato e stampa quanti.

**Tre corse consecutive:** (sotto, §2)

## 2. Catena dei controlli (uno alla volta, `free -m` e `df -h` prima di ciascuno)

| controllo | esito |
|---|---|
