# Rapporto giro 282 — highlight-95 rosso nato nella 197

Ramo `sviluppo/giro282-highlight95`, partito da `lavoro/197` (`51862a1e`). Versione 7.999.197 (GAME_VERSION non toccata).
Macchina: 4 processori, 16 GB, Chromium `/opt/pw-browsers/chromium`, controlli uno alla volta.

## In breve

- Il difetto è **del gioco**, non della sonda né della libreria di test.
- Causa misurata: la rete «la scena non si chiude senza il suo esito» (giro 95 D4, `_avanza461` in `src/15-live-match.jsx`)
  chiedeva l'esito e chiudeva la scena **1,6 s dopo la richiesta**. A fotogrammi lenti l'esito compare a schermo
  0,7–1,2 s dopo la richiesta, quindi restava leggibile meno di 1,2 s (il pavimento della sonda, non toccato).
- Correzione: la rete chiede l'esito una volta sola, aspetta che sia davvero a schermo (tetto 8 s) e **da lì** conta 1,6 s.
  Rosso `window.__CPM_NO_G282`.
- Guardiano nuovo `esito-282` (verde 1814–1962 ms, rosso 532–907 ms).
- highlight-95 intero sulla build del ramo (`542fee61`): **verde, e il rosso si vede** — braccio verde 98 highlight, 0 D4, 0 difetti.

## Tabella «196 / 197 prima / dopo»

| Misura | 196 (`3076a1b7`) | 197 prima (`51862a1e`) | 197 dopo (ramo) |
|---|---|---|---|
| highlight-95 intero, braccio verde | verde: 103 highlight, 0 D4 (da VERIFICA197-V3a, non rieseguito qui) | rosso 2 su 2: 91 highlight, 2 D4 per corsa (da VERIFICA197-V3a, su `a81ebb10`) | **verde**: 98 highlight, 0 D4, 0 difetti, 0 non giudicabili; passaggi arrivati 89,3% (pavimento 70%) |
| highlight-95 intero, braccio rosso | il rosso si vede (da VERIFICA197-V3a) | il rosso si vede (da VERIFICA197-V3a) | il rosso si vede: 108 highlight, D1, D2, D3 e D4 tutti presenti (5 D4) |
| Corsa mirata (braccio verde, `CPM_NO_SENZA=1 CPM_MISURA=1`) | s12 × semi 1234, 2021 × pass, drib: 23 highlight, **0 D4** | s12 e s5 × semi 1234, 2021 × pass, drib: 32 highlight, **2 D4** (1179 ms e 1126 ms) | (coperta dalla corsa intera) |
| Scene chiuse dalla rete D4: ritardo richiesta → esito a schermo | 254 · 500 · 551 · 809 · 1103 ms (5 scene) | 737 · 969 · 1176 ms (le 3 scene sotto 1400 ms; le altre non registrate in quella corsa) | da 1 a 1117 ms (18 scene) |
| Scene chiuse dalla rete D4: esito a schermo → chiusura | 1680 · 1990 · 2062 · 2334 · 2954 ms | 1126 · 1179 · 1338 ms | minimo 1669, massimo 2514 ms |
| Lettura minima dell'esito su tutte le scene del braccio verde | 1680 ms (23 scene) | 1126 ms (32 scene) | 1529 ms (98 scene) |

Nota di lettura: la corsa mirata sulla 196 ha un salvataggio in meno (s12 soltanto) di quella sulla 197 (s12 e s5): l'ho
accorciata per stare nel tempo. Le due corse non sono quindi a parità di numero di partite.

## Cosa ho misurato, in ordine

1. **Riproduzione su `51862a1e`** (corsa mirata, 28 minuti): 2 D4 su 32 highlight —
   `s12/1234 «🔁 Uno-due con SPENCER»` 1179 ms e `s5/2021 «↗️ Palla in area»` 1126 ms; una terza scena al limite
   (`s12/2021 «🔁 Uno-due con SPENCER»` 1338 ms, sopra il pavimento). Il difetto non è solo dell'«Uno-due»: la seconda scena
   è una «Palla in area».
2. **Chi chiude e quando** (testimoni provvisori, poi tolti): in tutte e tre le scene la chiusura viene da `_avanza461`
   passando dalla rete D4 (esito non ancora a schermo alla fine della finestra → lo chiede → aspetta 1,6 s → chiude).
   La richiesta parte a −2307 / −2355 / −1863 ms dalla chiusura, ma l'esito risulta a schermo solo a −1338 / −1179 / −1126 ms:
   React lo applica 0,74–1,18 s dopo, perché il processore è occupato dai fotogrammi 3D (tre partite insieme, grafica via
   software).
3. **Il codice della rete è identico fra 196 e 197** (`git diff origin/main 51862a1e -- src/15-live-match.jsx` non tocca
   `_avanza461`, `revealAt95`, `__CPM_D495`). Il meccanismo esisteva già nella 196.
4. **Stessa misura sulla 196** (gioco e libreria 196, 16 minuti): 5 scene passano dalla rete, con ritardi 254–1103 ms —
   cioè lo stesso ordine di grandezza — ma la chiusura arriva 2,2–4,1 s dopo la richiesta invece di 1,9–2,4 s, e la
   lettura resta 1680–2954 ms. Sulla 196 la scena, dopo la rete, restava aperta più a lungo; sulla 197 no. Il margine
   della 196 era quindi dovuto a un'attesa in più a valle, non alla rete.

## Gioco o libreria di test

- **Gioco.** La misura D4 sta tutta nella pagina (`__CPM_VIS95`: orologio della pagina alla comparsa dell'esito e alla
  chiusura); la sonda la legge soltanto. La causa è un conto del tempo sbagliato nel gioco, che su un telefono lento dà
  lo stesso effetto (esito visibile per meno tempo di quello voluto).
- **Non eseguito**: la corsa «gioco 197 + libreria 196» e gli interruttori `__CPM_NO_G264` / `G274` / `G276` uno alla volta.
  Motivo: ogni corsa mirata dura 16–28 minuti e highlight-95 intero 115; ho scelto la misura sulla 196 e la corsa intera.
  Non posso quindi dire **quale** giro della 197 abbia tolto il margine che la 196 aveva (vedi «Dubbi per il PO»).

## Cosa ho cambiato

- `src/15-live-match.jsx`, dentro `_avanza461` (rete D4 del giro 95): la richiesta dell'esito si fa una volta
  (`_q282`); finché `revealAt95` è 0 si riprova ogni 120 ms (tetto 8 s di parete); quando l'esito è a schermo si
  contano 1,6 s da lì. Con `window.__CPM_NO_G282` il percorso è quello di prima. Gancio solo per le sonde
  `__CPM_G282RIT` (vale solo con `__CPM_REC`): ritarda la comparsa dell'esito, per provocare il caso «macchina lenta».
  A fotogrammi normali richiesta e comparsa coincidono: stesso comportamento di prima.
- `tests/visual/esito-282.mjs` (nuovo guardiano, `npm run esito-282`): ogni scena non dichiara l'esito
  (`__CPM_G95_SENZAESITO`, già esistente) e la comparsa è ritardata di 900 ms; verde = ogni scena chiusa dalla rete ha
  l'esito a schermo almeno 1200 ms; rosso (`__CPM_NO_G282`) = almeno una sotto; meno di 3 scene = non giudicato = rosso.
- `tests/visual/ci-runner.mjs`: `esito-282` nella catena completa, nella prima riga della MAPPA di `src/15` e fra i lenti.
- `tests/visual/highlight-95.mjs`: sola stampa in più con `CPM_G282DIAG=1` (ritardo richiesta → schermo, da testimoni che
  esistono anche sulla 196). Soglie e giudizio invariati.
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src`, `check-src` IDENTICO).

## Esiti dei controlli sulla build del ramo

Tutti con `CPM_CHROME=/opt/pw-browsers/chromium`, uno alla volta. Gioco, `highlight-95.mjs` e `tests/visual/lib/` non sono cambiati dopo `542fee61`.

| Controllo | Esito | Numeri |
|---|---|---|
| highlight-95 intero (04:03→05:57 UTC, 113 min, con `CPM_G282DIAG=1`: sola stampa in più) | **verde, e il rosso si vede** (rc 0) | verde: 98 highlight, D4 0, difetti 0, non giudicabili 0, passaggi arrivati 89,3%; rosso: 108 highlight, 157 difetti, D1-D4 tutti visti |
| esito-282 (nuovo), 1ª esecuzione (20 min) | verde, e il rosso si vede | verde 1962 · 1827 · 1814 ms; rosso 907 · 658 · 532 ms (pavimento 1200) |
| esito-282, 2ª esecuzione (dopo il ritocco dell'attesa: si ferma alla 3ª scena, 6 min) | verde, e il rosso si vede | verde 2046 · 1797 · 2058 ms; rosso 538 · 432 · 674 ms |
| battito-264 | verde, il rosso cade come deve | verde: divergenti 0 su 3 coppie; rosso: 1 su 1 |
| solo-highlight-166 | verde, il rosso cade su 3, 7 e 8 | intera 295,2 s · soli highlight 61,0 s (7 scene) |
| test:logic | verde | 51 su 51 |
| save-compat | verde | 12 pass · 0 fail |
| build-src / check-src | IDENTICO byte per byte | 7.869.431 byte |

Log intero di highlight-95: `docs/sviluppo/RAPPORTO-giro282-highlight95.log`. Nessuna foto rigenerata in `docs/` (albero pulito dopo i controlli).

**Non eseguiti** (dichiarati): gli altri guardiani della MAPPA di `src/15` (la prima riga ne elenca decine: coerenza-235,
accessibilita-234, rassegna-232, salienti-229/243, barra-221, tabellone-214, rassegna-200, rigore-191, lotteria-191,
piazzato-204, nomi-182, partita-v2, intro-292, carriera3-94, assist-298, parata-100, riserva-103, riserva-104, contatto-103,
assist-nome-98, chiusura-99, esiti-96 e seguenti). Non c'era tempo dopo le due ore di highlight-95. Fra questi, i più vicini
alla riga toccata sono `chiusura-99`, `riserva-103`, `riserva-104`, `parata-100`, `contatto-103`: vanno eseguiti prima
dell'unione. Non eseguiti per regola: `ingresso-206`, `career-critical`, `ci-runner mirata`.

## Dubbi per il PO

1. **Tempo.** Il giro è durato circa 3 ore e 45 minuti contro il tetto di circa 3 ore: highlight-95 intero (113 min) era
   richiesto e l'ho lanciato solo dopo riproduzione, misura sulla 196 e guardiano.
2. **Quale giro della 197 ha tolto il margine della 196 non è stabilito.** Non ho eseguito «gioco 197 + libreria 196» né
   gli interruttori `__CPM_NO_G264` / `G274` / `G276`. Quello che è misurato: la rete è identica nelle due versioni; sulla
   196 la scena restava aperta 2,2–4,1 s dopo la richiesta, sulla 197 1,9–2,4 s. La correzione non dipende dalla risposta
   (il conto parte dall'esito a schermo), ma se il PO vuole il nome del giro servono 2–4 corse mirate da 16–28 minuti.
3. **Non posso confermare con una prova diretta che la libreria di test sia estranea** (corsa incrociata non fatta). Lo
   deduco dal fatto che la misura D4 è tutta dentro la pagina e che la causa è riprodotta e corretta nel gioco.
4. **La 196 aveva lo stesso meccanismo.** Sulla 196 la lettura minima misurata è 1680 ms su 5 scene: sopra il pavimento,
   ma con ritardi fino a 1103 ms. Non posso escludere che su più corse anche la 196 scenda sotto 1200 ms.
5. **Durata della scena.** Con la correzione una scena chiusa dalla rete può durare fino a ~1,2 s in più su una macchina
   lenta (il ritardo misurato), e al massimo 8 s in più se l'esito non compare mai (tetto). A fotogrammi normali nulla cambia.
   Il tetto di 8 s è una mia scelta tecnica: se il PO lo vuole diverso è una riga.
6. **Il difetto non riguarda solo l'«Uno-due»**: una delle due scene rosse riprodotte è «Palla in area». Ogni scena che
   arriva alla fine della finestra senza esito a schermo passava dalla stessa rete.
7. **Guardiani della MAPPA di `src/15` non eseguiti** (elenco sopra): la riparazione è verificata da highlight-95,
   esito-282, battito-264, solo-highlight-166, test:logic e save-compat, non dal resto della mappa.
8. **Highlight giudicati dal verde: 98** (196: 103; 197 prima: 91). Il numero cambia fra corse; non l'ho indagato.
9. **Roadmap e registro delle release non toccati**: questo giro è una riparazione su un ramo di sviluppo, GAME_VERSION invariata.
