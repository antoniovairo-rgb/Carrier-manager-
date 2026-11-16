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

Foto prima: `giro226/prima-gi26k2-success.jpg`, `prima-gi20k0-fail.jpg`, `prima-gi30k0-success.jpg`, `prima-gi93k2-success.jpg`.

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

<!-- TABELLA -->

## 5. Guardiano `dribbling-226`

`npm run dribbling-226` (da `tests/visual`). Stesso strumento del banco. Prova 11 azioni (due per variante, una la roulette) con
esito fallito e riuscito = 22 esecuzioni nel braccio verde, e la prima azione di ogni variante (12 esecuzioni) nel braccio rosso.
Sette pretese per esecuzione: pallone al piede, corpi, moto, esito, camera, duello, gesto. «Non giudicata» = rosso.
Ripetizione dichiarata: una esecuzione rossa nel braccio verde si rifà una volta su pagina nuova (verde alla ripetizione = «instabile»,
contato e stampato). Il braccio rosso deve mostrare la finta nel vuoto in almeno 3 esecuzioni, senza ripetizioni.

<!-- GUARDIANO -->

## 6. Controlli

<!-- CONTROLLI -->

## 7. Dubbi per il PO

<!-- DUBBI -->
