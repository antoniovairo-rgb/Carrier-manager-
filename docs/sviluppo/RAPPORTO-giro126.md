# Giro 126 — PO-328 · «Alcuni highlights sono da distanza troppo importante, in particolare i colpi di testa»

Base: `sviluppo/giro121-angolo` (rimedi dell'angolo 117A/119P/121). Ramo: `sviluppo/giro126-distanze`. `GAME_VERSION` non toccato.
Ramo della parata in src/12 non toccato (giro 123). Nessuna modifica al motore (src/14).

## 1. Cosa diceva la misura del giro 125

Coi rimedi dell'angolo i colpi di testa erano già a posto (mediana 10,7 m, max 14). Restavano i **tiri**: 29 su 75 oltre 30 m, di cui 27
da scene «Ricevi fra le linee: hai spazio!» / «Fra le linee, X esce in ritardo!» (mediana ≈36 m), più scene «Spazio per il tiro dal
limite» / «Palla buona al limite dell'area» fino a 30,9 m.

**Correzione di lettura del giro 125 (punto 4 di quel rapporto).** Il «tiro shot_one_on_one dopo angolo fino a 31 u» **non è un tiro da
calcio d'angolo**: la sonda di analisi classifica l'origine con la regex `/angolo|corner/` su titolo+etichetta, e l'etichetta
«🎯 Piazzato nell'**angolo** basso» la fa scattare. Le scene in questione sono «Palla buona al limite dell'area!» e «Spazio per il tiro
dal limite!» (scenaDalMotoreConclusione, zona limite) e qualche scena di dribbling riuscito. Le azioni di tiro di `P6_CROSS` hanno
l'ancora già in area (x 87-93, rimedio 117A): nel flusso vero le volée da cross stanno a 15-17,5 m. Per questo **non** ho aggiunto
un'ancora più interna per le azioni di tiro dopo angolo: non c'era il difetto da correggere (volee-d3-119 resta il loro guardiano).

## 2. Cause, provate con interruttore

Zona `limite` del motore = avanzamento 70-84 (fino a 28,6 u dalla linea di porta) e include l'area larga (|y−50| > 22); `fra-le-linee` =
trequarti 56-70 con l'eroe portato a x 68. I costruttori della scena (src/04) mettevano l'ancora dove il motore dichiarava l'occasione,
senza limite. Due rimedi nel costruttore (src/04), **nessun sorteggio in più o in meno** (l'ancora si sposta dopo la scelta delle opzioni,
e nessun sorteggio della scena dipende dalla posizione):

| sotto-punto | dove | rimedio | interruttore rosso |
|---|---|---|---|
| fra le linee | `scenaDalMotoreLinee` → `_p6Costruisci(…, ancora)` | **solo se fra le opzioni scelte c'è una conclusione** (`_rew95 === 'goal'`): x → 77 − (77 − x)·0,12 (74,4-76,2), y → 35-65. 22-27 m dal centro della porta. Scene di sola rifinitura (filtrante, uno-due, finta) invariate | `__CPM_NO_G126L` |
| dal limite | `scenaDalMotoreConclusione`, `zona === 'limite'` | x → 81,5 + (x − 70)/7 limitato a 81,5-83,5, y → 39-61. 16-19 m | `__CPM_NO_G126C` |
| entrambi | | | `__CPM_NO_G126` |

Scelte motivate: il tiro da fuori credibile (riferimento del 125, stima di conoscenza calcistica generale, non da fonte verificata)
sta a 18-30 m; ho messo l'ancora a 22-27 m per lasciare margine al movimento dell'eroe prima del contatto. Il titolo «dal limite»
promette il limite dell'area (16,5 m): ancora a 16-19 m, mai dentro l'area piccola né oltre i 22 m del guardiano.
La scena «fra le linee» con un tiro fra le opzioni si sposta **tutta** (è una sola ancora): anche filtrante/uno-due di quella scena
partono 22-27 m invece di 30-38. Le scene di costruzione, dribbling, contrasto, spalle, fascia, cross/angolo e piazzati non cambiano.

Prova della causa (stesso build, braccio rosso `__CPM_NO_G126`, salvataggio s1 × 8 semi): 9 tiri fra le linee oltre 30 m (34,6-39,3 m,
mediana 37,4) e 7 tiri «dal limite» oltre 22 m (fino a 29,9); acceso, sugli stessi 8 semi s1 e sui 24 totali, zero. Il guardiano
separa le due famiglie per titolo, quindi il rosso dice anche quale sotto-punto lo produce.

## 3. Tabella per tipo, prima / dopo (flusso vero, s1/s5/s12 × 8 semi = 24 partite, GLB spento, metri = hypot(gx,z)·1,05)

PRIMA = giro 125 braccio acceso (stessa base senza giro 126). DOPO = giro 126. Colonne: n · mediana · p90 · max (m) · oltre soglia.

| tipo | PRIMA n | med | p90 | max | oltre | DOPO n | med | p90 | max | oltre |
|---|---|---|---|---|---|---|---|---|---|---|
| tiro (soglia 30 m) | 75 | 26,9 | 37,7 | 39,3 | **29** | 63 | 20,9 | 27,4 | 29,0 | **0** |
| — di cui fra le linee (30 m) | 29 | 35,9 | 38,5 | 39,3 | **27** | 29 | 26,8 | 28,3 | 29,0 | **0** |
| — di cui «dal limite» (22 m) | 25 | 24,1 | 29,9 | 30,9 | **18** | 19 | 19,4 | 21,7 | 21,9 | **0** |
| colpo di testa (16,5 m) | 14 | 10,7 | 14,0 | 14,0 | 0 | 10 | 11,1 | 14,0 | 14,0 | 0 |
| punizione | 10 | 22,3 | 24,2 | 24,2 | n/a | 18 | 22,8 | 25,3 | 26,1 | n/a |
| rigore | 2 | 13,6 | 13,6 | 13,6 | n/a | 1 | 11,4 | 11,4 | 11,4 | n/a |
| contrasto | 22 | 41,2 | 54,3 | 62,5 | n/a | 23 | 40,3 | 56,6 | 62,2 | n/a |
| passaggio | 20 | 34,7 | 38,4 | 41,6 | n/a | 28 | 26,7 | 31,9 | 36,0 | n/a |
| dribbling | 12 | 38,2 | 39,3 | 39,3 | n/a | 8 | 27,7 | 36,5 | 36,5 | n/a |
| cross | 2 | 39,5 | 39,5 | 39,5 | n/a | 2 | 39,5 | 39,5 | 39,5 | n/a |

Avvertenze oneste: (1) le partite **divergono** fra i due bracci (scene in posti diversi ⇒ esiti diversi ⇒ resto della partita diverso),
quindi i conteggi per tipo non sono appaiati: punizioni 10→18 e passaggi 20→28 sono variazione del campione, non effetto voluto.
(2) Passaggio e dribbling scendono perché nelle scene «fra le linee» con un tiro fra le opzioni l'ancora sale per tutte le opzioni.
(3) Il «dal limite» massimo (21,9 m) è vicino alla soglia del guardiano (22 m): lo dichiaro, non ho abbassato né alzato nulla.
(4) Colpi di testa: campione piccolo (10), come nel 125; il loro guardiano mirato resta angolo-117.

## 4. Guardiano nuovo `npm run distanze-126` (tests/visual/distanze-126.mjs)

Flusso vero s1/s5/s12 × semi 1-8 (autoplay seedato, come distanze-125). Giudica: nessun tiro > 30 m, nessun tiro con titolo /limite/
> 22 m, nessun colpo di testa > 16,5 m. **Campione minimo dichiarato**: ≥ 40 tiri, ≥ 8 «dal limite», ≥ 6 teste, ≥ 2/3 partite finite;
sotto il minimo = NON GIUDICATO = rosso. Un difetto visto è rosso a qualunque campione. Prova del rosso: `CPM_ROSSO=1` (accende
`__CPM_NO_G126`); `CPM_FLAGS=` per i sotto-punti. Durata misurata: 44 min per i 24 incontri (PAR 3, 4 CPU).

| corsa | esito |
|---|---|
| verde, 24/24 partite | VERDE: 63 tiri max 29,0 m · 19 «dal limite» max 21,9 m · 10 teste max 14,0 m |
| rosso `__CPM_NO_G126`, s1 × 8 | ROSSO: 9 tiri > 30 m · 7 «dal limite» > 22 m · 0 teste |

Dati: `docs/sviluppo/giro126/distanze-126-{verde,rosso}.json` e log.

## 5. Catena dei controlli (in sequenza, un controllo alla volta)

| controllo | esito |
|---|---|
| distanze-126 verde + rosso | ✅ verde · rosso visibile |
| angolo-117 | ✅ verde 8 casi (porta max 6,3 u) · rosso 117A 6/6 · rosso g121 2/2 |
| volee-d3-119 | ✅ verde (0,64/0,63/0,33) · rosso visibile (5,28/5,94) |
