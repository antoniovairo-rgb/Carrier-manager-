# Rapporto del giro 304 — `tunnel-245`, sostituzione «esce» dentro il nastro della competizione

- Ramo: `sviluppo/giro304-tunnel`, partito da `prova/198-finale` (0f0b13d8).
- Data: 20/11/2026. `GAME_VERSION` non toccata. Nessuna soglia cambiata, nessun controllo esistente modificato.
- File toccati: `src/12-three-match-view.jsx` (correzione + gancio di collaudo), `tests/visual/misura-304.mjs` (sonda e guardiano nuovo),
  `tests/visual/package.json` (script `tunnel-304`), `tests/visual/ci-runner.mjs` (voce `tunnel-304` nella mappa di `src/12`).

## In breve

1. **Il difetto non nasce da un giro.** Nasce dal **punto del campo in cui si trova l'eroe quando esce**. Lo dimostra una prova
   provocata sul codice dell'unione con la sola correzione spenta (`__CPM_NO_G304`): mettendo l'eroe lontano dal varco, l'uscita passa
   dentro gli oggetti di bordo campo in 3 uscite su 4 giudicate, senza toccare nessun interruttore dei giri.
2. **La ricerca «un interruttore alla volta, 6 corse per configurazione» NON è stata eseguita** (vedi «Cosa non è stato fatto»):
   avrebbe richiesto circa 90 minuti da sola. Quindi **non posso confermare né escludere** che uno dei giri 293-302 renda il difetto
   più frequente spostando il punto in cui la partita lascia l'eroe.
3. **Correzione**: nell'uscita per sostituzione la fascia degli oggetti di bordo campo del lato panchine è un vincolo di posizione
   («muro con una porta»). Rosso `window.__CPM_NO_G304`.
4. **Esito**: scenario `sost-comunale` 6 corse verdi su 6 di fila. Corse intere e controlli di contorno: vedi tabella (compilata con ciò
   che è stato davvero eseguito).

## Il meccanismo (misurato)

- L'uscita (giro 255) muove un **bersaglio** lungo una spezzata: dal punto dell'eroe al punto davanti al varco (x −3,9 · z −33,6), poi
  dritto fuori fino a x −3,9 · z −36,2. Il bersaglio la percorre **a tempo** (82% della durata della variante: 3,3-4,3 s).
- L'eroe **insegue** il bersaglio col suo modello di corsa (`animOne`: punta 9,2 u/s, 13 u/s oltre 6 u di ritardo, velocità smorzata).
- Se l'eroe parte lontano, il bersaglio ha già girato l'angolo ed è sceso nel varco quando l'eroe è ancora 3-20 u indietro
  (ritardo massimo misurato dalla sonda: 9,8 · 13,2 · 21,1 u in tre uscite provocate). L'eroe punta dritto al bersaglio e **taglia lo
  spigolo**: passa dentro il nastro della competizione (finisce a x −4,77, z −34,9) e, prima ancora, dentro la striscia LED (z −34,4).
- Lo stesso inseguimento rifatto in node (stesse formule, 30.805 partenze su tutto il campo, 5 varianti): **10,6% delle partenze**
  finisce dentro il nastro. Le zone di partenza che lo producono: la fascia sinistra del campo (x da −50 a −25 circa) e una piccola
  zona a destra vicino alla linea laterale (x +15…+20, z −30…−20). Il modello in node è una ricostruzione mia, non il gioco: serve a
  spiegare, la prova è quella nel browser qui sotto.
- Nel guardiano `tunnel-245` il punto di partenza dell'uscita è quello in cui la partita vera lascia l'eroe dopo l'ingresso forzato:
  cambia da corsa a corsa (misurato in una corsa: x 18,7 · z −12,9 e x 19,6 · z −12,4). Da qui l'instabilità.

### Prova provocata (browser, partita vera, stessa build, gancio `__CPM_DA304` che sceglie il punto di partenza)

| Partenza (x · z), variante | Correzione spenta (`__CPM_NO_G304`) | Correzione accesa |
|---|---|---|
| −40 · −20, var. 0 | **11 fotogrammi su 92** dentro `striscia-led` (primo: x −5,4 · z −34,23 · t 3,85) | interrotta dalla partita dopo 6 fotogrammi: non giudicata |
| 15 · −30, var. 3 | **1 su 104** dentro `nastro-competizione` (x −4,42 · z −34,74 · t 3,85) | 0 su 104 |
| −35 · −10, var. 1 | **4 su 80** dentro `striscia-led` (x −5,45 · z −34,2 · t 3,75) | 0 su 80 |
| −48 · 5, var. 3 | 0 su 104 | non rieseguita con la versione finale |
| −45 · −30 / −45 · −28 | interrotta dalla partita (10 fotogrammi) | interrotta dalla partita (12 fotogrammi) |

Nota onesta: una prima versione della correzione (muro a z −34,15) lasciava ancora 5 fotogrammi dentro la striscia LED sulla partenza
−40 · −20; il muro è stato portato a z −33,85 (la striscia comincia a z −34,34). Con la versione finale quella partenza specifica è
stata interrotta dalla partita e **non è stata rigiudicata dalla sonda**; il guardiano nuovo `tunnel-304` la contiene (vedi tabella).

## La correzione

`src/12-three-match-view.jsx`, ramo dell'uscita per sostituzione, subito dopo `animOne(hero, …)`:

- sotto z −33,85 l'eroe scende **solo dentro il varco** (|x| ≤ 4,27 = 4,77 del varco più stretto − 0,35 del corpo − 0,15 di margine);
- se arriva alla linea fuori dal varco resta sulla linea e scorre verso la porta (il bersaglio lo tira in x), poi scende;
- dentro il varco non ne esce di lato;
- nessun salto di posizione: si corregge solo il passo del fotogramma. Tempi, bersaglio, gesti e varianti dell'uscita **invariati**;
- spento con `__CPM_NO_G304` (rosso del giro), `__CPM_NO_G255` e `__CPM_NO_G245` (i loro bracci rossi vogliono l'attraversamento).

Scartate, con misura sul modello in node: (a) bersaglio che aspetta l'eroe al punto davanti al varco → l'eroe arriva in corsa e lo
oltrepassa di slancio: partenze dentro il nastro dal 10,6% al 24-27%; (b) bersaglio che non si allontana più di 1,5-3 u dall'eroe →
ancora 0-27% secondo i parametri e uscita più lunga in media di 1,7-3,4 s. Nessuna delle due è stata provata nel browser.

Gancio di collaudo aggiunto (solo `?cpmtest=1`): `window.__CPM_DA304=[x,z]` mette l'eroe in quel punto prima di un'uscita forzata.

## Tabella prima / dopo

| Misura | Prima (unione, 0f0b13d8) | Dopo (questo ramo) |
|---|---|---|
| `tunnel-245`, solo `sost-comunale` | rosso 2 corse su 4 (dal rapporto V1, non rieseguito qui) | **verde 6 su 6 di fila** («esce» 0/207 · 0/212 · 0/204 · 0/204 · 0/202 · 0/212) |
| Uscite provocate da lontano | 3 su 4 giudicate dentro un oggetto | 0 su 2 giudicate (sonda); guardiano `tunnel-304`: vedi sotto |
| `tunnel-245` corsa intera 1 | rossa (rapporto V1) | DA_COMPILARE_INTERA1 |
| `tunnel-245` corsa intera 2 | — | DA_COMPILARE_INTERA2 |
| `tunnel-304` (nuovo: verde + rosso) | — | DA_COMPILARE_T304 |
| `tunnel-285` | verde (rapporto V1) | DA_COMPILARE_T285 |
| `test:logic` | — | DA_COMPILARE_LOGIC |
| `save-compat` | — | DA_COMPILARE_SAVE |
| `tools/check-src.mjs` | identico | identico (il file generato corrisponde ai frammenti) |

## Cosa non è stato fatto

DA_COMPILARE_NONFATTO

## Dubbi per il PO

1. **Quale giro, allora?** La consegna diceva «nasce da uno dei giri». La misura dice che il difetto esiste anche senza toccare i
   giri (prova provocata) e dipende dal punto di partenza. Resta possibile che un giro abbia spostato il punto in cui la partita
   lascia l'eroe durante il controllo, rendendolo più frequente: non l'ho misurato. Con la correzione il punto di partenza non conta
   più. Va bene chiuderla così, o serve comunque la ricerca un interruttore alla volta (circa 90 minuti)?
2. **L'eroe che scorre lungo la linea.** Quando arriva alla fascia fuori dal varco, l'eroe ora corre lungo la linea fino alla porta
   invece di attraversare nastro e striscia LED. Non ho una foto di come appare (la prova è fatta coi corpi 3D spenti, come il
   guardiano). Va guardato sul telefono.
3. **Difetto vicino, non toccato: l'eroe che sparisce in campo.** Il tempo dell'uscita è fisso (4,0-5,2 s). Se l'eroe parte lontano
   non fa in tempo ad arrivare in panchina e a tempo scaduto viene nascosto dov'è. Sul modello in node sparisce fino a 40 u dalla
   panchina; nel browser ho misurato ritardi fino a 21 u a fine camminata. È fuori dall'ambito di questo giro (cambierebbe la durata
   della coreografia): lo segnalo soltanto.
4. **La partita interrompe le uscite forzate.** In 5 uscite provocate su 16 la partita ha interrotto la camminata dopo 6-12
   fotogrammi. `tunnel-245` lo gestisce riprovando fino a 5 volte; `tunnel-304` pretende almeno 2 uscite arrivate alla fascia,
   altrimenti dichiara «non giudicato» ed esce rosso. Potrebbe quindi dare rosso per mancanza di giudizio: se capita, è da irrobustire.
5. **Stessa geometria nell'ingresso per sostituzione.** L'ingresso parte da x −3,9 · z −34,4 (dentro il varco) e il guardiano lo dà
   pulito (0/168 in 6 corse): non l'ho toccato.
