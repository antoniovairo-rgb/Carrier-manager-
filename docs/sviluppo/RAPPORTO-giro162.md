# Rapporto giro 162 — scena «spalle alla porta» oltre 30 m · strumenti bg-sync e bg-decision ciechi (PO-362)

Ramo `sviluppo/giro162-scena-strumenti` da `lavoro/190` (`4f9363a`, GAME_VERSION 7.999.190 non toccato). Metodo: un controllo
alla volta, `free -m` e `df -h` prima di ognuno (memoria libera sempre sopra 14,5 GB, disco 26%), `CPM_CHROME=/opt/pw-browsers/chromium`.
I controlli lunghi sono partiti in sottofondo dentro il turno e ne ho atteso l'esito in primo piano a blocchi sotto i dieci minuti.
Build: `node tools/build-src.mjs` → `node tools/check-src.mjs` «IDENTICO BYTE PER BYTE».

## Tabella

| controllo | esito | numeri |
|---|---|---|
| distanze-126 verde (24 partite, `CPM_TMAX` 10^9 = nessun tetto) | ✅ VERDE | 24/24 finite · 57 tiri, max 29 m, 0 oltre 30 · 15 dal limite, max 20,9 · 13 teste, max 14 |
| distanze-126 rosso (`CPM_ROSSO=1` → `__CPM_NO_G126`) | ✅ il rosso cade | 24/24 finite · 28 tiri > 30 m · 15 «dal limite» > 22 m |
| rimedio 162 contro `__CPM_NO_G162` (sonda, s1 semi 8 e 7, girata forzata) | ✅ il rosso cade | verde 19,6 / 21,2 m · rosso **30,7** / 23,4 m |
| bg-sync | ⚠️ **giudicante e verde; il rosso NON cade** | verde 31 coppie, mediana 65%, 6% sotto un terzo · rosso `__CPM_NO485` 18 coppie, mediana 65%, 0% |
| bg-decision | ⚠️ **giudicante e verde; il rosso NON cade** | verde 41 righe, accordo 92,7%, varietà 68,3% · rosso `__CPM_NO499` 40 righe, 70,0% (soglia 60) |
| validate-situations | ✅ 14/14 | impronta 00001505, 0 failure |
| partita-vera | ✅ verde | 12 bande su 12, partite finite 2/2 |
| highlight-95 completo (`CPM_D3DIAG=1`) | ✅ verde e il rosso si vede | verde 104 highlight, D4 senza esito 0, difetti 0 · rosso 111 highlight, D4 senza esito 7, D1/D3 visti |
| match-sequence | ✅ verde | fischio finale 4/4 giri, minuto più alto 92, le tre velocità raccontano la stessa partita |
| replay | ✅ PASS | 8 highlight, replay completi e coerenti |
| bg-name-role | ✅ verde | 166/166 nomi coerenti = 100% |
| bg-continuity | ❌ CIECO (0 righe confrontabili, minimo 12) | stessa causa di bg-sync (legge `__CPM_BGSYNC.bp`); cieco anche sulla base 0d4915e (rapporto giro 151); non riparato qui |
| bg-rhythm | ❌ rosso, **preesistente** | ramo: costruzione/sviluppo 1,01× (serve ≥1,3×) · base `lavoro/190` misurata: 1,13×, rossa |
| test:logic · save-compat | ✅ | 43/43 · 12 pass, 0 fail |

## 1. «Spalle alla porta» oltre 30 m: misura, causa, correzione

**Misura** (`tests/visual/sonda-spalle-162.mjs`, strumento nuovo, non guardiano). Flusso vero, salvataggi s1/s5/s12 × semi 1-8
(24 partite, tutte finite), autoplay `mano`: sulla scena «spalle alla porta» sceglie a rotazione girata / tiro di potenza /
protezione; per ogni scena annota l'occasione del motore (`__CPM_P6`: l'ANCORA), la posizione logica dell'eroe in `hl_choose`
(`__CPM_PPOS`: l'AVVIO) e il contatto `__CPM_CONT121` (posizione 3D dell'eroe e bersaglio dell'arco). Sulla base (senza rimedio)
7 scene spalle in 24 partite:

| partita | ancora x,y (m) | avvio x | contatto | m al contatto |
|---|---|---|---|---|
| s1 seme 8 hl 2 | 71 · 53,6 (30,5) | 69,0 | pass | 30,7 |
| s1 seme 8 hl 5 | 71 · 51,6 (30,5) | 69,0 | pass | 30,7 |
| s1 seme 4 hl 6 | 72,9 · 54 (28,6) | 70,9 | pass | 29,1 |
| s1 seme 7 hl 4 | 76,5 · 35,5 (26,3) | 78,5 | dribble | 23,8 |
| s1 seme 3 hl 4 | 94 · 18,5 (20,8) | 92,0 | shot | 21,5 |
| s12 seme 6 hl 5 | 85 · 53,4 (15,9) | 83,0 | shot | 16,0 |
| s1 seme 5 hl 4 | 90,9 · 47,7 (9,7) | 88,9 | pass | 10,5 |

(i metri dell'ancora sono una stima: 100−x e y−50 scalati 1,05 e 0,6; i metri al contatto sono quelli di distanze-126.)

**Da dove nasce la distanza.** Dall'ANCORA. L'eroe parte nella zona di partenza della scena (x−2…x+2 attorno all'ancora) e calcia da
lì: scarto fra ancora e contatto ≤0,8 m in 6 casi su 7 (2,5 m nel settimo, avvio a x+2). L'arco non c'entra: la distanza giudicata è
quella dell'eroe al contatto, e il bersaglio dell'arco (tx 12-45) varia senza cambiarla. Cinque scene su sette nascono nella zona
«limite» del motore (x 70-84), tre di queste a 28,6-30,5 m.

**Causa.** `_p6Pressione` (`src/04`) trasforma in «spalle» la conclusione al limite quando il marcatore è entro 1,2 u. L'ancora del
limite del giro 126 (`__CPM_NO_G126C`: x 81,5-83,5, y 39-61) vive solo in `scenaDalMotoreConclusione`: la stessa occasione, diventata
«spalle», resta dove il motore la vede e offre girata e tiro di potenza da lì.

**Correzione** (`src/04`, `scenaDalMotoreSpalle`, rosso `__CPM_NO_G162`). Solo per la scena spalle al limite e solo se fra le opzioni
scelte c'è una conclusione, l'ancora passa per lo strato già esistente di `_p6Costruisci` (lo stesso del giro 126 per «fra le linee»)
con la stessa mappa della conclusione al limite. Nessun sorteggio in più (lo strato agisce dopo la scelta delle opzioni). Le scene in
area e quelle di sola rifinitura (scarico, sponda, fallo cercato) restano dove le mette il motore.

**Prova.** Sonda con la girata forzata (`CPM_SPALLE='Girata secca'`), s1 semi 8 e 7:
- rimedio acceso: avvio 79,6 → **19,6 m**; avvio 80,4 → 21,2 m;
- `__CPM_NO_G162`: avvio 69,0 → **30,7 m** (oltre 30); avvio 78,5 → 23,4 m.

distanze-126 verde intero e rosso che cade: vedi tabella. Nel verde le scene spalle viste sono 5 (4 scarichi a 10,5-22,6 m, un tiro di
potenza a 18,3 m).

⚠️ Limite dichiarato: la scena spalle è rara (7 su 24 partite sulla base, 5 nel verde di distanze-126), quindi il guardiano la vede
poco; la prova del rimedio sta nella sonda mirata.

## 2. bg-sync: perché era cieco, cosa ho riparato, perché il rosso non cade

**Cecità misurata** (diagnosi `CPM_MOTORE=1`): a motore del possesso acceso 74 righe su 74 arrivano **senza bersaglio** (`bp` null),
quindi 0 coppie. Causa nel codice: dal 7.870 la riga di cronaca descrive il pallone e non lo comanda (`_bt498=null` sotto `MOTORE870`,
`src/15`), e il pavimento sorvegliato (`_pausa485`, `_bgProb`) vive solo nel ramo della cronaca pescata, che sotto il motore non gira
(lì il ritmo lo tiene il narratore, `cool` in `narra870`, che `__CPM_NO485` non tocca).

**Riparazione dello strumento** (soglie invariate: mediana ≥50, coppie scarse ≤15%):
- regime: `__CPM_NO870` acceso in entrambi i bracci (la cronaca pescata che comanda il pallone, dove vive ciò che il guardiano giudica);
- attesa: ogni partita fino al **fischio** (evento) su pagina nuova e nome diverso, con l'autoplay seedato; si gioca un'altra partita
  finché le coppie giudicabili non arrivano al minimo dichiarato **12** (nuovo: prima bastava 1 coppia); sotto il minimo = CIECO (uscita 2);
- stampa i motivi di scarto (senza bersaglio / bersaglio addosso / gol / oltre 6 s).

**Esito.** Verde giudicante: 1 partita, 31 coppie, mediana 65%, 2/31 = 6% sotto un terzo → ✅. Rosso `__CPM_NO485`: 18 coppie, mediana
65%, 0/18 sotto un terzo → **resta verde: prova del rosso fallita.**

**Perché il rosso non cade (misurato).** Il giudizio «sotto un terzo» fu tarato (7.485) sul vecchio passo del pallone, lerp 0,25 per
tick: una riga a un tick di distanza mostrava il 25% del tragitto. Dal 7.511 il passo è **0,65 per tick**, quindi anche senza pavimento
una riga a un tick ne mostra il 65% (lo si legge nei campioni: «65% in 880 ms»). Ho provato il regime d'origine (`CPM_LERP25=1` →
`__CPM_NO511`, solo diagnosi): lì il rosso cade (59% sotto un terzo), **ma cade anche il verde** (75% sotto un terzo, mediana 25%):
le righe forzate venute dopo il 7.485 (`_forza541`, `_forzaOut818`, `_forzaCt839`, `_forzaSp845`, `_annScena653`, `_forzaLib666`)
escono a un tick scavalcando il pavimento. Quindi oggi l'invariante «la riga non smentisce il movimento» lo tiene il passo del 7.511,
non il pavimento del 7.485, e `__CPM_NO485` non ha più un effetto misurabile su ciò che il guardiano giudica. Far cadere il rosso
richiederebbe cambiare il criterio o la soglia: non l'ho fatto (vietato abbassare soglie; cambiare il criterio è una decisione da prendere
fuori da questo giro).

## 3. bg-decision: perché era cieco, cosa ho riparato, perché il rosso non cade

**Cecità misurata** (diagnosi `CPM_MOTORE=1`, 3 partite intere): 229 righe, **228 marcate `rec`** (righe del narratore del motore,
227 con `mk`), escluse per progetto → 0 righe utili. Il peso di famiglia sorvegliato (`_dec499` sul sorteggio pesato di `BG_MATCH`)
vive solo nel ramo della cronaca pescata; `__CPM_NO499` non tocca il narratore.

**Riparazione dello strumento** (soglie invariate: accordo esatto ≥60%, varietà ≥55%, minimo 15 righe):
- regime: `__CPM_NO870` acceso in entrambi i bracci;
- attesa: ogni partita fino al **fischio**, con uscita solo per stallo (fase e minuto fermi 240 s), invece del tetto di 240 s; il registro
  (anello da 400 voci) si raccoglie a mano a mano per timestamp;
- campione: nelle partite del provino (fischio al 50') circa 3/4 delle righe sono recite; con 3 partite le righe utili erano 10 su 15.
  Col solo minimo (15 righe) il rosso è atterrato a **60,0% esatti** contro la soglia 60 (verde 100%, 16 righe): con 15 righe la
  granularità è 6,7 punti e lo strumento non separa. Il bersaglio di raccolta è ora **40 righe utili** (si giocano altre partite intere,
  tetto 30); il minimo per giudicare resta 15;
- stampa i motivi di scarto (senza dec / senza pd / con esito / recite / righe del narratore).

**Esito.** Verde: 14 partite, 41 righe utili, accordo esatto 38/41 = **92,7%**, largo 100%, varietà 68,3% → ✅. Rosso `__CPM_NO499`:
13 partite, 40 righe, accordo esatto 28/40 = **70,0%**, varietà 55,0% → **resta sopra la soglia 60: prova del rosso fallita.**

**Lettura.** Il peso di famiglia agisce: 22,7 punti fra i bracci sullo stesso campione. Ma senza di lui l'accordo è già al 70%, sopra la
soglia scelta nel 7.499 (allora 69,0% contro 51,6%): i meccanismi venuti dopo (peso di zona 2D del 7.525, righe lontane escluse del 7.577)
allineano già da soli la riga alla famiglia decisa. Un campione per braccio non basta per ritarare la soglia (deviazione binomiale ~7
punti sul rosso); non l'ho toccata.

## 4. Catena completa della partita

Eseguita sul build del ramo (rimedio 162 acceso), un controllo alla volta, nell'ordine: validate-situations, partita-vera,
highlight-95, match-sequence, replay, bg-name-role, bg-continuity, bg-rhythm, test:logic, save-compat (esiti in tabella).

- **bg-continuity** è cieco per la stessa ragione misurata su bg-sync: giudica il bersaglio dichiarato dalla riga (`bp`), che sotto il
  motore del possesso è nullo per costruzione (74/74 righe senza bersaglio). Il giro 151 lo aveva già misurato cieco sulla base
  `0d4915e`. Non era nell'ambito di questo giro: non l'ho riparato.
- **bg-rhythm** è rosso sul ramo (1,01×) **e sulla base** `lavoro/190` (1,13×, misurata in un worktree a parte, rimosso a fine misura).
  Preesistente; il rimedio 162 tocca solo la costruzione della scena spalle e non la cronaca. Causa non misurata in questo giro.

## 5. File toccati

- `src/04-situazioni-zone-piazzati.jsx` + `CARRIER-MANAGER-AV.html` (build): ancora della scena spalle al limite, rosso `__CPM_NO_G162`.
- `tests/visual/sonda-spalle-162.mjs` (nuovo, strumento): misura ancora/avvio/contatto della scena spalle.
- `tests/visual/bg-sync-test.mjs`, `tests/visual/bg-decision-test.mjs`: strumenti riparati (regime, attesa, campione, scarti).
- `docs/sviluppo/RAPPORTO-giro162.md` (questo).

## Domande aperte (al PO, nessuna decisione presa qui)

1. **bg-sync**: il pavimento del 7.485 non ha più effetto misurabile (lo sostituisce il passo 0,65 del 7.511) e sotto il motore del
   possesso non gira proprio. Tenere il guardiano sul ramo `__CPM_NO870`, cambiarne il criterio, o ritirarlo?
2. **bg-decision**: il peso del 7.499 agisce (92,7% contro 70,0%) ma il rosso non scende sotto 60. Ritarare la soglia con più misure
   ripetute, o ritirare la prova del rosso?
3. **bg-continuity** (cieco) e **bg-rhythm** (rosso sulla base): stessa famiglia, da riparare o ritirare in un giro dedicato?
4. **A motore acceso** (la partita vera) né il ritmo della cronaca né l'accordo riga↔famiglia hanno oggi un guardiano: il narratore
   `narra870` non è sorvegliato da bg-sync né da bg-decision.

## Note di processo

- Roadmap non aggiornata: ramo di sviluppo senza bump di versione, non un rilascio.
- Una prima corsa di bg-decision è stata chiusa dal `timeout` esterno della chiamata alla settima partita (browser chiuso); la settima
  partita era «chiusa su stallo dopo 262 s». Rifatta da capo: nelle corse complete successive nessuno stallo.
