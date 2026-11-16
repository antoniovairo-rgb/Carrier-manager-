# Rapporto giro 226 — PO-491 «Migliora anche i dribbling, alcuni sono davvero confusionari»

Ramo `sviluppo/giro226-dribbling`, partito da `lavoro/196` (935d7e4). `GAME_VERSION` non toccata (regola fissa): resta `7.999.195`.
Rosso del giro: `window.__CPM_NO_G226`. Guardiano nuovo: `dribbling-226` (catene `completa` e `carriera`, una volta sola).

Tutti i numeri di questo rapporto vengono da esecuzioni fatte in questa sessione, col banco `tests/visual/misura-dribbling-226.mjs`
(GLB acceso, telefono 412×915, headless con GL software). I file grezzi stanno in `tests/visual/out/dribbling-226/` (non versionati);
le classifiche complete sono copiate in `docs/sviluppo/giro226/`.

## 1. Che cosa ho misurato, e come

**Catalogo.** Le azioni dell'eroe che *sono* un dribbling (`deriveHL` → tipo `dribble`) o lo *promettono* prima della giocata
(`hlPreDribble` sull'etichetta): **58 azioni** su 191 situazioni. Per variante mostrata:

| Variante | Azioni | Esempi |
|---|---|---|
| finta / dribbling generico (`dribble_feint`) prima di tiro, assist o cross | 39 | «Dribbling netto e tiro», «Finta e cross» |
| dribbling puro (`dribble`, variante `dribble_feint`) | 5 | gi30 «Dribbling centrale e conduci», gi150 «Dribbling provocatorio» |
| sterzata (`dribble_outside`) | 5 | «Sterzata e assist» |
| rientro (`dribble_inside`) | 4 | «Finta a rientrare e tiro netto» |
| doppio passo (`double_step`) | 4 | «Doppio passo e tiro» |
| roulette | 1 | gi92 «Roulette e tiro» |

Nel catalogo **non esistono** azioni di tunnel, elastico o sombrero: la regola le riconoscerebbe, ma nessuna etichetta le usa.

**Testimone** (`window.__CPM_G226W`, `src/12`, acceso solo da `__CPM_REC226` sotto `?cpmtest=1`, sola lettura): un campione per
fotogramma negli highlight, tutto dalle mesh e col tempo di scena dentro — eroe, dita dei piedi dell'eroe (ossa del corpo disegnato),
pallone e suo scrittore, i due avversari di movimento più vicini, portiere, camera con eroe e pallone in coordinate di quadro, clip
montata (nome, peso, tempo), tratto del copione in corso, stacco nero vivo.

**Protocollo.** Ogni azione si provoca con esito fallito e riuscito (`__CPM_FORCE_OUTCOME`; il *tipo* di fallimento lo sceglie il
gioco). Una pagina nuova per azione, prima il fallito: dopo un gol le squadre tornano a centrocampo e la scena seguente sulla stessa
pagina partiva coi difensori a 14-22u — era lo strumento (misurato su gi71), non il gioco. Si osservano 5 s di scena dopo la scelta
(7 s per il cross dopo dribbling, che ha un copione più lungo).

**Soglie, dichiarate prima di misurare** (`tests/visual/lib/dribbling-226.mjs` → `S`; 1u ≈ 1 m):

| Voce | Soglia | Perché |
|---|---|---|
| pallone «controllato» lontano dal piede | oltre 2,0u in più del 10% dei fotogrammi | in corsa un tocco lungo sta a 1,5-2 m |
| corpi compenetrati | centri sotto 0,5u per più di 0,15 s | un busto è largo ~0,45 m |
| accelerazione dell'eroe | oltre 80 u/s² su finestre ≥ 0,10 s | ~8 volte uno scattista vero |
| inversione di marcia | oltre 120° con entrambe le velocità sopra 5 u/s | «rimbalzo» |
| teletrasporto eroe / pallone / camera | passo isolato oltre 1,0u e 20 u/s · 3,0u e 60 u/s · 2,5u e 60 u/s (camera: fuori dagli stacchi neri) | stesse soglie del banco-248 |
| eroe fuori quadro | oltre il 15% dei fotogrammi | |
| pallone fuori quadro | oltre il 25% dei fotogrammi | |
| cambi di padrone del pallone | oltre 3 nella scena | |
| finta senza gesto | oltre il 40% dei fotogrammi della finta | |
| **finta nel vuoto** | avversario più vicino oltre 3,5u durante la finta (mediana) | voce aggiunta dopo aver guardato le foto: vedi §2 |
| esito incoerente | gol dichiarato senza pallone in rete · fallita con pallone in rete · palla persa col pallone ancora dell'eroe | |

Il **punteggio di confusione** di un'esecuzione è la somma degli sforamenti, ciascuno rapportato alla sua soglia (tetto 3 per voce),
più 3 per un'incoerenza. Serve solo a ordinare la classifica.

**Limiti dichiarati.**
- Headless con GL software: il tempo di scena è tappato a 0,05 s per fotogramma. Fluidità e tempi reali non si giudicano qui: li
  giudica il telefono.
- Il gioco ha sorteggi non seedati nei voli del pallone: la stessa azione dà numeri un po' diversi da una corsa all'altra. Le quote
  di fuori quadro in particolare oscillano (su gi93: 33% in una corsa, 2% in un'altra).
- I cambi di clip «a peso pieno» si contano ma non fanno punteggio: il testimone legge nome e peso della clip corrente, mentre il
  gioco sfuma la precedente a parte (`_gPrev`). Non posso confermare da questo testimone che siano scatti di posa visibili.

## 2. Che cosa vuol dire «confusionario», misurato

La prima passata (116 esecuzioni, `docs/sviluppo/giro226/classifica-prima-prima-stesura.txt`) diceva che il pallone **era** al piede
(massimo 0,95u nei tratti di conduzione) e che l'eroe **non** faceva cambi di direzione impossibili (accelerazione massima 65 u/s²,
zero inversioni). Le voci sopra soglia erano fuori quadro e compenetrazioni. Guardando le sequenze fotografiche ho trovato quello che
quelle voci non dicevano, e l'ho misurato fotogramma per fotogramma:

1. **La finta si gioca nel vuoto, poi l'eroe passa attraverso l'uomo.** gi26 «Doppio passo e tiro», riuscito: durante la finta il
   difensore è a 4,8-5,0u; 0,4 s dopo l'eroe gli passa a 0,8u. gi20 «Dribbling netto e tiro», fallito: finta a 7,3-4,3u, poi tre
   avversari diversi a 0,6-0,8u uno dopo l'altro e il tiro calciato da dentro chi lo mura (0,02-0,08u).
   *Causa*: la finta parte a tempo di copione, ma l'eroe è in ritardo sul copione (il modello di corsa ha un tetto), mentre il
   difensore lo aspetta al suo posto di copione.
2. **«Dribbling vincente» senza nessuno da saltare.** gi30 «Dribbling centrale e conduci», riuscito: l'avversario più vicino resta a
   10,3u per tutta la scena; il pallone viene spinto di lato (fino a 2,05u dal piede) e resta di fianco all'eroe fermo.
   *Causa*: la reazione del difensore prende «il più vicino» ovunque sia; la spinta ha una componente laterale casuale fino a 4,5u; la
   conduzione tiene il pallone a 1,35u nel verso in cui *guarda* il corpo.
3. **Nel dribbling perso il pallone se ne va prima del contrasto.** gi30, fallito: il tocco che porta via il pallone parte al
   fotogramma zero, mentre chi contrasta è ancora a 9,7u e arriva ~0,45 s dopo; il pallone fa 10u di lato da solo e la camera lo
   segue (eroe fuori quadro nel 19-20% del gesto).
4. **Finta da fermo al vento.** Nelle azioni «dribbling e assist / e cross» la finta è inserita a tempo zero con l'eroe fermo: se
   nessun avversario è vicino (gi100, gi19: 4-10u) non c'è duello.

Sequenze fotografiche (un fotogramma ogni 0,35 s di scena, `docs/sviluppo/giro226/`). Le «prima» sono della prima passata, sul
codice senza alcuna correzione; le «dopo» sono rifatte sul build finale.

| Azione | Prima | Dopo | Che cosa guardare |
|---|---|---|---|
| gi26 «Doppio passo e tiro», riuscito | `prima-gi26k2-success.jpg` | `dopo-gi26k2-success.jpg` | prima: eroe solo fino a 1,4 s, poi sovrapposto al difensore al tiro (2,10 s); dopo: difensore davanti da 0,35 s, saltato a 1,05 s |
| gi20 «Dribbling netto e tiro», fallito | `prima-gi20k0-fail.jpg` | `dopo-gi20k0-fail.jpg` | prima: tre corpi ammucchiati a 1,4-1,75 s; dopo: un uomo davanti, poi la scivolata di chi mura |
| gi30 «Dribbling centrale e conduci», riuscito | `prima-gi30k0-success.jpg` | `dopo-gi30k0-success.jpg` | prima: nessun avversario, pallone di fianco; dopo: avversario saltato a 0,35-0,70 s, pallone al piede |
| gi30 «Dribbling centrale e conduci», fallito | `prima-gi30k0-fail.jpg` | `dopo-gi30k0-fail.jpg` | dopo: il pallone parte quando arriva la scivolata |
| gi93 «Cross dopo dribbling», riuscito | `prima-gi93k2-success.jpg` | — | prima: mucchio di 4-5 corpi attorno all'eroe (non rifotografata dopo) |

## 3. Che cosa ho corretto (tutto dietro `window.__CPM_NO_G226`, tutto in `src/12-three-match-view.jsx`)

Nessun asset nuovo, nessuna clip nuova: si muovono solo difensori e pallone; bersaglio logico dell'eroe e camera non cambiano.

1. **Regia del duello nel copione.** Nei tratti di dribbling dell'eroe il difensore del duello si mette rispetto all'eroe *vero*:
   finché la finta non è finita gli sta davanti a 2,3u, poi abbocca dal lato della finta e si sposta di ~3u fuori dalla linea di corsa.
   Esce a chiudere a passo di scatto (fino a 13 u/s). Durante lo stacco nero d'apertura è già al suo posto. Se il copione non ha un
   difensore, o ce l'ha lontano, il duello lo fa l'avversario di movimento più vicino.
2. **La finta da fermo aspetta l'uomo**: il copione resta sull'inizio del tratto finché l'avversario non è a un passo dal suo posto,
   al massimo 0,45 s.
3. **Nessun corpo sulla linea di corsa**: un avversario davanti all'eroe in corsa entro 2,6u e a meno di 1,2u dalla sua linea si
   sposta di lato; da fermo vale un raggio di 0,95u. Esclusi il portiere e chi fa un contrasto vero. Chi mura il tiro scivola a
   1,15u dal tiratore, non dentro di lui.
4. **Dribbling puro riuscito**: il difensore del duello viene messo 2,8u avanti e 1,4u di lato; la spinta del pallone è corta (3u) e
   dal lato opposto all'uomo; il pallone in conduzione sta a 0,85u nel verso della *corsa*.
5. **Dribbling puro perso**: il tocco che porta via il pallone aspetta la scivolata (0,40 s se l'uomo parte da oltre 2,5u).

## 4. Misure prima / dopo

Stesso strumento, stesso protocollo, stessa sessione: PRIMA = braccio rosso (`__CPM_NO_G226`), DOPO = braccio verde.

| Misura | PRIMA (rosso `__CPM_NO_G226`) | DOPO (verde) |
|---|---|---|
| esecuzioni giudicate | 116/116 | 116/116 |
| senza alcun difetto | 31 | 88 |
| punteggio di confusione medio | 1.99 | 0.46 |
| punteggio massimo | 7.85 | 3.82 |
| finta nel vuoto (avversario oltre 3.5u) | 70 | 2 |
| distanza del duello: mediana / p90 / max (u) | 4.45 / 9.58 / 15.78 | 2.06 / 2.51 / 5.76 |
| duello non misurabile (nessun tratto di finta) | 3 | 0 |
| corpi compenetrati oltre 0.15s | 13 | 1 |
| compenetrazione: tempo max (s) / distanza minima mediana (u) | 0.61 / 0.82 | 0.22 / 1.2 |
| pallone staccato dal piede (oltre 2u in >10% dei fotogrammi controllati) | 2 | 0 |
| pallone-piede in controllo: mediana / max (u) | 0.4 / 2.16 | 0.4 / 1.17 |
| accelerazioni oltre 80 u/s² (esecuzioni) | 0 | 0 |
| accelerazione massima eroe: mediana / max (u/s²) | 37 / 64 | 38 / 62 |
| inversioni di marcia oltre 120° | 0 | 0 |
| teletrasporti eroe / pallone in controllo | 0 / 0 | 0 / 0 |
| salti di camera fuori dagli stacchi | 3 | 0 |
| eroe fuori quadro nel tratto di dribbling oltre 15% | 1 | 0 |
| eroe fuori quadro nell'intera scena oltre 15% | 19 | 13 |
| pallone fuori quadro nell'intera scena oltre 25% | 17 | 18 |
| cambi di padrone del pallone oltre 3 | 1 | 0 |
| esito visivo incoerente col testo | 2 | 1 |
| finta senza gesto montato oltre 40% | 0 | 0 |
| clip ripartite a meta' | 0 | 0 |
| cambi di clip a peso pieno (contati, non giudicati) | 44 | 43 |

116 esecuzioni per braccio (58 azioni × fallito/riuscito), tutte giudicate.

**Per variante ed esito** (punteggio di confusione medio):

| Variante · esito | n | PRIMA | DOPO |
|---|---|---|---|
| double_step · fallito | 4 | 3.19 | 0.77 |
| dribble_feint · fallito | 39 | 2.63 | 0.70 |
| dribble_outside · fallito | 5 | 2.48 | 0.28 |
| roulette · fallito | 1 | 1.93 | 0.00 |
| puro dribble_feint · fallito | 5 | 1.87 | 1.86 |
| dribble_inside · fallito | 4 | 1.80 | 0.98 |
| dribble_feint · riuscito | 39 | 1.57 | 0.13 |
| puro dribble_feint · riuscito | 5 | 1.52 | 0.29 |
| dribble_inside · riuscito | 4 | 1.51 | 0.32 |
| dribble_outside · riuscito | 5 | 1.22 | 0.00 |
| double_step · riuscito | 4 | 0.95 | 0.00 |
| roulette · riuscito | 1 | 0.00 | 0.00 |

**Clip suonata nella finta, per variante** (prima = dopo: la correzione non cambia le clip):
finta, rientro, sterzata e doppio passo suonano tutte la clip `change`; il dribbling puro `feint` (o `change`; `trip` quando l'esito è
un fallo); la roulette `ruleta`. Vedi dubbio 1.

Classifiche complete, esecuzione per esecuzione coi difetti: `docs/sviluppo/giro226/classifica-prima.txt` e `classifica-dopo.txt`.

**I più confusi PRIMA** (prime voci della classifica): gi113 «Finta e serve dopo la finta» fallito (finta a 9,3u, compenetrazione
0,33 s, esito incoerente) · gi18 «Dribbling netto e assist» fallito (finta a 13,9u) · gi26 «Doppio passo e tiro» fallito · gi100
«Finta sulla fascia e assist» fallito · gi95 «Finta rapida e scatto e tiro» fallito (finta a 10,6u) · gi22 «Dribbling GK e tiro»
riuscito (compenetrazione 0,42 s) · gi23 «Dribbling difensore e tiro» riuscito (0,35 s) · gi30 «Dribbling centrale e conduci» riuscito
(nessuno entro 9,1u).

**Che cosa resta sopra soglia DOPO** (28 esecuzioni su 116 hanno ancora almeno una voce):
- **eroe o pallone fuori quadro sull'intera scena** (13 e 18 esecuzioni): quasi tutte azioni FALLITE, dopo la perdita del pallone o il
  tiro sbagliato. Nel tratto di dribbling l'eroe è in quadro (0 esecuzioni oltre il 15%). Non l'ho toccato: vedi dubbio 2.
- **finta nel vuoto, 2 esecuzioni**: gi71 «Finta e interno» fallito (5,76u) e gi57 «Dribbling di tecnica e assist» fallito (4,39u).
  In tutte e due l'uomo esce a chiudere ma parte da troppo lontano per arrivare in tempo.
- **esito incoerente, 1**: gi102 «Dribbling netto e cross» fallito — il riquadro dice «parata» ma nei 7 s osservati il cross non
  lascia l'eroe. È il cross, non il dribbling: vedi dubbio 4.
- **compenetrazione, 1**: gi150 «Scatto improvviso provocatorio» riuscito (0,22 s, minimo 0,26u). È il fallo cercato: chi commette
  il fallo entra sull'eroe per costruzione (giro 41) e la guardia dei corpi lo esclude come contrasto vero.


## 5. Guardiano `dribbling-226`

`npm run dribbling-226` (da `tests/visual`). Stesso strumento del banco. Prova 11 azioni (due per variante, una la roulette) con
esito fallito e riuscito = 22 esecuzioni nel braccio verde, e la prima azione di ogni variante (12 esecuzioni) nel braccio rosso.
Sette pretese per esecuzione: pallone al piede, corpi, moto, esito, camera, duello, gesto. «Non giudicata» = rosso.
Ripetizione dichiarata: una esecuzione rossa nel braccio verde si rifà una volta su pagina nuova (verde alla ripetizione = «instabile»,
contato e stampato). Il braccio rosso deve mostrare la finta nel vuoto in almeno 3 esecuzioni, senza ripetizioni.

Esito in questa sessione, sul build committato (`tests/visual/out/dribbling-226/guardiano-2.log`, 1088 s):

- **Braccio verde: 22/22** esecuzioni senza violazioni, 0 instabili, 0 rosse. Distanza del duello fra 1,02u e 2,62u.
- **Braccio rosso (`__CPM_NO_G226`): rosso.** Finta nel vuoto vista in **5 esecuzioni su 12** (4,97u · 5,47u · 5,53u · 6,30u · 8,45u;
  minimo richiesto 3), 9 esecuzioni su 12 con almeno una violazione (3 compenetrazioni da 0,20-0,25 s, eroe fuori quadro nel 20% del
  gesto sul dribbling puro perso).
- Una corsa precedente dello stesso guardiano, a correzione non ancora completa, aveva dato braccio verde 20/22 (i due rossi erano il
  dribbling puro perso: duello «non giudicato» dallo strumento ed eroe fuori quadro nel 20% del gesto). Lo strumento è stato esteso
  al dribbling puro perso e il gioco corretto (correzione 5).

Durata: circa 18 minuti da solo. Nelle catene `completa` e `carriera` di `ci-runner.mjs` compare una volta sola per catena
(`node --check ci-runner.mjs` pulito).

## 6. Controlli

<!-- CONTROLLI -->

## 7. Dubbi per il PO

1. **Le varianti si distinguono poco: finta, rientro, sterzata e doppio passo suonano la stessa clip (`change`).** Solo la roulette ha
   la sua (`ruleta`). Il «doppio passo» non mostra un doppio passo. Non ho aggiunto clip (regola: nessun asset nuovo senza licenza).
   Alternative, da decidere: (a) clip nuove con licenza registrata per doppio passo e sterzata; (b) usare per una variante la clip
   `dribble` già in casa (il rapporto del giro 184 dice che `dribble-03` è rientrata nel pacchetto) — non l'ho provata; (c) lasciare
   una clip sola e differenziare col movimento (lato dello scarto, ampiezza). Finché non c'è una decisione resta così.
2. **Dopo un'azione FALLITA l'eroe esce spesso dal quadro** (13 esecuzioni su 116 oltre il 15% dei fotogrammi dell'intera scena; il
   pallone 18 oltre il 25%). La camera segue il pallone perso o il tiro uscito. Nel tratto di dribbling l'eroe è in quadro. Non l'ho
   toccato perché è regia delle conclusioni (tiro, cross, passaggio), non del dribbling, e cambiarla tocca le scelte del 7.482/7.505.
   Va corretto? Se sì, è un giro a parte con il censimento del quadro.
3. **La finta da fermo ora aspetta l'uomo fino a 0,45 s.** È un'attesa in più prima della finta nelle azioni «dribbling e assist / e
   cross» quando il difensore parte lontano. Sul telefono si deve vedere l'eroe che tiene palla e l'uomo che arriva; se sembra un
   tempo morto, il valore va accorciato.
4. **gi102 «Dribbling netto e cross» fallito**: il riquadro dice «parata» (`saved`) ma nei 7 s di scena osservati il cross non
   lascia l'eroe. Era già così nella prima passata, prima di ogni correzione (gi102 e gi94): è il cross dopo il dribbling, non il
   dribbling. Nel braccio rosso finale le incoerenze sono 2 e sono altre (gi113 e gi18: passaggio «intercettato» col pallone rimasto
   all'eroe), nel verde 1: non posso dire che la differenza sia merito della correzione, la voce oscilla da una corsa all'altra.
   Non l'ho indagato oltre.
5. **gi120 «Dribbling e conduci» fallito**: il testo dice «Il dribbling non riesce: palla agli avversari», il tipo d'esito scelto dal
   gioco è `fouled` e in campo l'eroe inciampa e cade col pallone a un metro. Lo strumento non lo conta come incoerenza (un uomo a
   terra non possiede il pallone), ma testo e scena non raccontano la stessa cosa. È materia di esiti (`esiti-96` / `esiti-241`).
6. **Restano 2 finte nel vuoto su 116** (gi71 e gi57 falliti): l'uomo esce a chiudere ma parte da troppo lontano. Per chiuderle
   servirebbe mettere il marcatore vicino già all'apertura della scena (prima della scelta), cioè toccare lo schieramento d'apertura.
7. **I cambi di clip a peso pieno** (44 prima, 43 dopo, quasi tutti tiro → reazione al tiro sbagliato) sono contati ma non
   giudicati: da questo testimone non posso confermare che siano scatti di posa visibili. Servirebbe un testimone sul peso della
   clip uscente.
8. **Tutto il giudizio è headless.** Tempi e fluidità non sono giudicabili qui; la leggibilità del duello va guardata sul telefono.
9. **Nel catalogo non ci sono tunnel, elastico, sombrero.** La richiesta li nominava come esempi: non esistono azioni con quelle
   etichette, quindi non c'è niente da misurare.
10. **`GAME_VERSION` non toccata** (regola fissa della sessione), anche se il giro è indicato come 7.999.196.
11. **Il guardiano dura circa 18 minuti** (34 esecuzioni col GLB acceso, una pagina per azione). Se è troppo per le catene, si può
    scendere a una azione per variante (`CPM_PER_VARIANTE=1`, circa metà tempo): è una scelta di copertura.
