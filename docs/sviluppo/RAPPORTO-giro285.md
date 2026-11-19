# Rapporto giro 285 — PO-544 «c'è una fascia nera davanti al tunnel che non dovrebbe esserci»

Ramo `sviluppo/giro285-tunnel`, partito da `lavoro/198` (9e5cfdd). Versione di destinazione 7.999.198 rapida. `GAME_VERSION` non toccata.

## Che cos'è la fascia (misurato, non ipotizzato)

Censimento di tutte le mesh visibili nel varco davanti alla bocca del tunnel (scena presa dal banco di prova, stadio «comunale», notte):
la sola superficie sospesa nel varco è **il nastro scorrevole col nome della competizione** (`_mkCompBanner`, `src/12`, nato con la voce
storica «3DV-7»): un piano orizzontale lungo 100 e largo 0,55, a 0,48 d'altezza e z −34,9, colore di fondo `#030610` con opacità 0,80
(luminanza media misurata 0,11–0,15 su una scala 0–1). Non è un'ombra, né la base del tunnel, né un pannello del giro 255, né una
striscia LED, né un piano della pensilina.

- **L'ipotesi fatta al PO** («uno strato del bordo campo rimasto nel varco del giro 245») è **confermata nella sostanza**: è uno strato
  di bordo campo che il giro 245 non ha tagliato. Il motivo è misurato: il nastro non aveva l'etichetta `userData.ost245` ed è lungo più
  di 40, quindi il testimone del giro 245 lo scartava due volte.
- **Da quale giro nasce**: il nastro esiste da molto prima (c'è identico nella 7.999.196). Nella 196 però davanti aveva la striscia LED
  continua e il cartellone; il giro 245 (nella 197) ha aperto il varco in quegli strati e il nastro è rimasto da solo, sospeso a mezz'aria,
  con le due file che lo attraversano. Il difetto **visibile** nasce quindi col giro 245. Non è servita la bisezione.
- **Dove e quando compare**: in tutti gli stadi misurati (comunale, inglese, borgo, arena e lo stadio del provino, cioè quattro stili di
  bocca) e a tutte le ore (notte, giorno, tramonto): il nastro è costruito senza condizioni.

## Correzione

`src/12-three-match-view.jsx`, dentro `_mkCompBanner`: sul lato panchine il nastro è ora in **due tratti** che si fermano a x −4,77 e
+4,77 (lo stesso varco della striscia LED, il più stretto). Stesso materiale e stesse coordinate della scritta (lo scorrimento è
identico); il lato opposto resta intero. I tratti sono etichettati `ost245='nastro-competizione'`, così anche `tunnel-245` li misura
contro i corpi. Rosso `window.__CPM_NO_G285` = nastro intero. Varco del 245 e schieramento del 255 non toccati. Il ciclo 3D non è toccato
(solo la costruzione della scena).

## Tabella «196 / 197 prima / dopo» (notte, guardiano `tunnel-285`)

| Misura | 7.999.196 | 197 prima (`__CPM_NO_G285`) | dopo |
|---|---|---|---|
| Bocca del tunnel | x −22 | x 0 | x 0 |
| Nastro della competizione nel varco | presente (x −50..50), dietro striscia LED e cartellone | presente (x −50..50), scoperto | assente (tratti fino a ±4,77) |
| Superfici ferme nel varco — comunale | 7 (4 scure) | 1 (scura, luminanza 0,145) | 0 |
| Superfici ferme nel varco — borgo | 9 (6 scure) | 1 (scura) | 0 |
| Superfici ferme nel varco — inglese / arena / provino | non misurato | 1 / 1 / 1 (scure; provino luminanza 0,107) | 0 / 0 / 0 |
| Varco coperto visto dall'alto — comunale | 42,9% (242/564 celle) | 24,5% (138/564) | 0% (0/564) |
| Varco coperto visto dall'alto — borgo | 42,9% | 20,0% (94/470) | 0% (0/470) |
| Varco coperto — inglese / arena / provino | non misurato | 26,3% / 22,7% / 22,7% | 0% / 0% / 0% |
| Giorno (comunale, provino) | non misurato | 1 superficie scura ciascuno | 0 ciascuno |
| Tramonto (comunale, provino) | non misurato | 1 superficie scura ciascuno | non misurato |

Note sulla tabella:
- La 196 è misurata con lo stesso guardiano (`CPM_ROOT` = copia della 196, `CPM_SENZA_TESTIMONE=1` perché non ha il tempo di scena): è
  una misura, non un verdetto. Le 7 superfici del «comunale» sono panca bassa, pensilina, tre tratti di striscia LED, un cartellone e il
  nastro: è lo stato che PO-510 ha poi corretto.
- La quota coperta «prima» oscilla fra 128 e 141 celle sullo stesso stadio fra un giro e l'altro: una cella conta solo se la stessa mesh
  la copre in tutti e tre i momenti, e un corpo che passa sopra il nastro la toglie. È un limite inferiore.
- «197 prima» è il build corretto con l'interruttore rosso, non la 197 pubblicata: il nastro intero è lo stesso codice della 197.

## Guardiano nuovo: `npm run tunnel-285`

`tests/visual/tunnel-285.mjs`, verde e rosso nello stesso comando. Cinque ingressi veri di notte a ora congelata: comunale (tunnel
telescopico), inglese (portale in cemento), borgo (pensilina), arena (vetro) e il percorso della foto del PO (nuova carriera → provino).
Due misure indipendenti nel varco (x bocca ± 4,7, dalla cornice della bocca alla linea laterale, da 5 cm a 2,6 d'altezza), in tre
momenti della scena (1 · 3 · 8 s di tempo di scena): censimento delle mesh e griglia di raggi dall'alto. Conta solo ciò che è fermo in
tutti e tre i momenti. Non dipende dalle etichette del gioco (la scena si prende dal banco), quindi vede anche uno strato non etichettato.
«Non giudicato» = rosso (ingresso non visto, scena non catturata, meno di tre momenti, controllo di vista sui tratti di striscia LED
accanto alla bocca, meno di 200 raggi).

- Verde: 5/5 stadi, 0 superfici, 0 celle.
- Rosso (`__CPM_NO_G285`): fascia scura vista in 5/5 stadi, 20–26% del varco.

Aggiunto alla MAPPA di `ci-runner.mjs` per `src/12`/`src/13`. **Non** aggiunto alle catene `completa`/`carriera` (vedi dubbi).

Due correzioni fatte al guardiano durante la taratura, dichiarate:
1. Il varco comincia 5 cm davanti alla **cornice** della bocca: dove il tunnel non è telescopico (inglese, borgo) i pilastri del portale
   sporgono di 0,25–0,35 oltre z −35,9 e venivano contati come «superfici nel varco». Sono la bocca stessa.
2. Terzo momento di misura: nel provino, a 1 e a 3 s, le teste dei primi due corpi in coda alla bocca stavano ferme e venivano contate.

## Foto (corpi 3D accesi) — `docs/sviluppo/giro285/`

`prima-*` (rosso), `dopo-*`, `v196-*`, per provino, comunale e borgo: `-camera` (camera del gioco a 2,4 s di scena), `-alto`, `-fianco`
(camere fisse di prova, a file già uscite). Il confronto più chiaro è `prima-provino-night-glb-fianco.jpg` contro
`dopo-provino-night-glb-fianco.jpg`. Foto del PO: `docs/collaudo-po/197-tunnel-fascia-nera.png`.

## Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito |
|---|---|
| `tunnel-285` verde | verde 5/5 |
| `tunnel-285` rosso | rosso visto 5/5 |
| `tunnel-245` verde (20 scenari, in cinque blocchi) | verde 20/20 |
| `tunnel-245` rosso `__CPM_NO_G245` | rosso visto 3/3 |
| `tunnel-245` rosso 255 | rosso visto |
| `ingresso-camminata-245` | verde, rosso visto |
| `serata-261` | verde, rosso visto su A, B e C |
| `pelle-240` | **instabile**: 1° giro rosso (serata di presentazione, un viso a 12,2 contro soglia 12), 2° giro verde con rosso visto (serata massima 7,4). Ripetizione dichiarata: una, verde = il comando intero verde |
| `test:logic` | 51/51 |
| `save-compat` | 12/12 |
| `build-src` + `check-src` | file di gioco ricomposto dai frammenti |
| `tocco3d-219` | non eseguito: il ciclo 3D non è toccato |

Un blocco di `tunnel-245` (scenari lunghi) è stato interrotto dal tetto di 10 minuti della chiamata: non contato, rifatto da capo in due
blocchi più piccoli, entrambi verdi.

### Guardiani della MAPPA di `src/12` NON eseguiti

La riga della MAPPA per `src/12` elenca 76 controlli. Nel tetto di tre ore sono stati eseguiti solo quelli chiesti dal mandato
(`tunnel-245`, `ingresso-camminata-245`) più il nuovo. **Non eseguiti**: portiere-265, rigorista-257, formazioni-262, coreografie-244,
salienti-243, guardalinee-222, dribbling-226, tocco3d-219, lotteria-191, piazzato-204, pullman-204, nomi-182, chiusura-99, parata-100,
consegna-103, colla-103, contatto-103, carriera3-94, assist-298, scena3d-96, spazio-296, panchina-293, pc-tablet-292, ingresso-285,
corpi-073, ingresso-276, stadi-064, render-3d-023, avvicinamento-61, linee-61, pallone-278, ingresso-277, inquadra-273, salti-274,
memoria-275, buildup-sync, po229-gi38, gk-dive-sync, gk-miss-229, portiere-223, goal-postarc, esiti-218, cross-218, scene-221, fila-227,
bambini-294, validate-situations, partita-vera, bambini-236, pressing-143, conduci-242, ingresso-245, giornale-244, difesa-220-scena,
analisi-217, piedi-252, rete-252, difesa-252, rinvio-252, portiere-252, aereo-252, difesa-220-giro31, apertura-261, parata-258,
esiti-241, camera-252, reazione-252, spot-266, testa-143, stadi-071, cerimonie, passaggio-coppa-137, kit-061, strisce-corpo (e, per
divieto del mandato, highlight-95, ingresso-206, career-critical). Vanno eseguiti dalla verifica della 198.

## Dubbi per il PO

1. **Il nastro dall'altro lato e ai fianchi resta.** Ho tolto solo il tratto davanti alla bocca (9,54 di larghezza). Il nastro è un
   piano orizzontale scuro sospeso a 0,48 lungo tutto il bordo campo: accanto al varco ora finisce con un taglio netto, visibile nelle
   foto dall'alto. Se va tolto del tutto, o trasformato in un pannello verticale, è una scelta di aspetto che non ho preso.
2. **Catene.** `tunnel-285` è nella MAPPA ma non nelle catene `completa`/`carriera` (dura circa 7 minuti per braccio). Decidere se
   aggiungerlo accanto a `tunnel-245`.
3. **`pelle-240` è instabile sulla serata di presentazione**, indipendentemente da questo giro: la distanza massima dei visi nella serata è uscita 12,2 (rosso) · 9,4 · 7,4 sul build di questo giro e 11,4 sulla base `lavoro/198` senza la mia modifica (soglia 12). La serata è una scena di `src/16` che non usa il nastro toccato qui. Il controllo è passato alla ripetizione, ma il margine sulla base è 0,6: va riparato il controllo o la scena, non ripetuto.
4. **Guardiani della MAPPA non eseguiti** (elenco sopra): il tetto di tempo non li conteneva.
5. **Provino sul banco.** Per portare il provino all'ingresso in campo il guardiano arma il gancio `__CPM_PREP246` (sul banco il provino
   salta la pre-partita). Lo stadio del provino misurato è un tunnel telescopico come nella foto del PO; non ho verificato che sia
   esattamente lo stesso stadio della foto (nomi delle squadre non confrontati).
6. **Il testimone del giro 245 resta cieco agli oggetti lunghi più di 40 o non etichettati**: non l'ho modificato; `tunnel-285` copre
   quel buco con una misura indipendente.
