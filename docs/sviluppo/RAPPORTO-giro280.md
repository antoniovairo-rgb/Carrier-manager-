# Rapporto giro 280: schede-246, scenario rimesso in piedi

Ramo `sviluppo/giro280-schede`, partito da `lavoro/197` (`e7528fe`). **Nessuna riga di `src/` toccata**: il file di gioco è identico a `lavoro/197`. Toccato solo `tests/visual/schede-246.mjs`.

## In breve

- **schede-246: VERDE 2 volte di fila** sulla versione finale del controllo, e **il braccio rosso cade** (il cronometro corre con la scheda aperta: 3 e 2 minuti, soglia > 1 invariata).
- Strada scelta: quella che non tocca `src/`. Lo scenario si **provoca dalla sonda** (regola PO-311 in PROCESSO.md, «ciò che il gioco non produce si provoca dalla sonda»), dichiarandolo nel controllo e nella riga stampata.
- Nessun gancio nuovo in `src/15`, quindi nessun rosso `__CPM_NO_G280`: non c'è una correzione del gioco da custodire.

## Cosa ho cambiato nel controllo

1. **Salto di scenario.** Dopo 10 minuti di partita vera (in gioco fluido, nessuna scheda a schermo), l'orologio va al **68'** col punteggio **0-1** (eroe = `home`, come scritto in `src/15` r. 7256: «`score.home` è SEMPRE la squadra dell'eroe») tramite `__CPM_SALTA297` (esiste già, solo sotto `?cpmtest=1`; è lo stesso varco di `lib/fischio-270.mjs`). Con scarto −1 dal 70' la regola `sotto_finale` di `INT259.FATTI` (`src/14` r. 114: `c.mn>=70&&c.diff===-1`) fa nascere la scheda. Il salto avviene una sola volta, uguale nei due bracci. `CPM_SALTO=0` torna allo scenario vecchio; `CPM_SALTO_DA`, `CPM_SALTO_A`, `CPM_SALTO_PT` lo spostano.
2. **Il salto fa parte del giudizio.** Se in un braccio il salto non avviene, il controllo è rosso («salto di scenario non avvenuto, non giudicato»).
3. **Minuti a scheda aperta misurati anche alla sorgente.** Il controllo campiona lo schermo ogni 400 ms. Nella seconda corsa, ancora senza questa misura, il braccio rosso ha visto la scheda solo al 71' («aperte 71-72»), mentre il motore l'aveva fatta nascere al 70' e la scelta è arrivata al 72'. Risultato: 1 minuto, il rosso non cadeva. Ora il controllo legge anche `__CPM_S259`: per ogni scelta, minuto della scelta meno minuto in cui è nata la scheda dello stesso fatto. Il valore giudicato è **il maggiore dei due**, in tutti e due i bracci (il verde diventa più severo, non meno). Soglia invariata (> 1).
4. Stampa anche il punteggio finale e il salto (`salto 10'→68' 0-1 · finale 1-1`).

## Tabella 196 / 197 prima / dopo

| controllo | 196 | 197 prima (controllo del giro 44) | dopo (giro 280) |
|---|---|---|---|
| schede-246, braccio verde | sano (dal rapporto V3e2, citato nel RAPPORTO-giro277; qui **non** rimisurato) | **rosso**: «schede a schermo 0 · timer armati/scaduti 0/0» → «nessuna scheda comparsa, guardiano cieco» (RAPPORTO-giro277, partita 0-2) | **verde 2 su 2**: 1 scheda (`sotto_finale` al 70'), arrivata al motore, 0 minuti a scheda aperta (schermo 0 · motore 0), timer 1/1 |
| schede-246, braccio rosso (`__CPM_NO682F`) | rosso dichiarato: «il cronometro non corre con la scheda aperta, il difetto non si vede» | stessa riga, 0 schede (RAPPORTO-giro277) | **cade come deve**: 3 minuti (schermo 1 · motore 3) e 2 minuti (schermo 1 · motore 2) a scheda aperta |

### Le corse di schede-246 in questo giro

| corsa | versione del controllo | verde | rosso | esito |
|---|---|---|---|---|
| a | salto, misura solo dallo schermo | 1 scheda, 70-70, 0 min | 1 scheda, 70-72, 2 min | ✅ |
| b | uguale ad a | 1 scheda, 70-70, 0 min | 1 scheda, 71-72, 1 min | ❌ (rosso non visto: campionamento, vedi punto 3) |
| c | finale (salto + misura alla sorgente) | 0 min (schermo 0 · motore 0) | 3 min (schermo 1 · motore 3) | ✅ |
| d | finale | 0 min (schermo 0 · motore 0) | 2 min (schermo 1 · motore 2) | ✅ |

I due verdi di fila che contano sono **c** e **d**, sulla versione finale. In tutte e quattro le corse la partita è finita 1-1.

## Controlli

| controllo | esito |
|---|---|
| schede-246 | **verde 2 su 2** (c, d), rosso visto in tutte e due |
| test:logic | verde (uscita 0) |
| save-compat | verde («12 pass · 0 fail») |
| schede-234 | verde («✅ VERDE — schede con almeno 3 opzioni … prova del rosso riconosciuta»), corsa intera senza tetto |
| schede-259 | **rosso** («❌ ROSSO — C verde: partite non finite o errori»): p3 «NON FINITA 0-2» in tutti e due i bracci, 3/4 finite; 0 errori di pagina. Controllo non toccato: vedi dubbio 7 |
| schede-260 | **rosso** sul braccio rosso («la scheda non compare mai fuori dal gioco, il difetto non si vede»); braccio verde sano (0 campioni fuori dal gioco, «Prova Greco 8» con `pari_finale@90a`). Controllo non toccato: vedi dubbio 8 |
| spazio-270 | verde (fischio al 90' in tutti e quattro i casi, scheda «81' pari_finale», 7 px verde / 14 px rosso) |
| battito-264, solo-highlight-166 | non eseguiti: `src/15` non è stato toccato |
| build-src / check-src | non serve: nessun file di `src/` toccato |

Non eseguiti, come da regola: highlight-95, ingresso-206, career-critical. `ci-runner.mjs mirata` non usato.

## Dubbi per il PO

1. **Lo scenario ora è provocato, non naturale.** Il controllo non custodisce più «la partita della 172 fa nascere le schede da sola», ma «quando nasce una scheda, il blocco del cronometro la aspetta e la scelta arriva al motore». È lo scopo scritto nel controllo (giro 19), ma è un cambio di cosa si guarda. Va bene così?
2. **Il commit della 197 che ha cambiato la partita (0-2 invece di schede) resta non trovato.** Il giro 277 ha escluso otto giri; io non ho cercato oltre, perché lo scenario provocato non ne dipende più. Se il PO vuole sapere *perché* la stessa partita è cambiata, serve una bisezione a parte (circa 6 partite da 5 minuti).
3. **Il salto toglie dalla misura i minuti 11-67.** Le schede che nascevano a metà partita nella 196 (rapporto del giro 19: «una scheda dal 54' al 76'») non sono più nello scenario. Le schede di metà partita le guardano altri controlli (schede-259), non questo.
4. **Il campionamento ogni 400 ms dello schermo da solo non basta per il braccio rosso** (corsa b). Lo stesso limite potrebbe toccare altri controlli che misurano «minuti a scheda aperta» solo dal DOM. Non li ho guardati.
5. **Il rosso del giro 44 ora si vede.** Era un rosso dichiarato cieco già sulla 196; è venuto «gratis» col nuovo scenario e con la misura alla sorgente. Lo segnalo perché cambia lo stato di un rosso dichiarato.
6. Il mio primo lancio di schede-234 e schede-259 aveva un tetto di 590 s (il tetto di una chiamata): li ha interrotti a metà. Quelle corse **non valgono** e le ho rifatte da capo senza tetto (esiti in tabella).
7. **schede-259 è rosso su questa build** (file di gioco identico a `lavoro/197`): la partita p3 non arriva al fischio entro il tetto di parete di 420 s (`TETTO`, r. 133) e resta 0-2. È il caso già scritto nel RAPPORTO-giro270 (dubbio 3: «`schede-259` (`TETTO=420000`) aspettano la partita intera con lo stesso schema»), che proponeva `lib/fischio-270.mjs`. **Non posso confermare** se sulla 196 fosse verde: non l'ho misurato. Non l'ho riparato (fuori da questo giro). Decide il PO se blocca l'uscita.
8. **schede-260 è rosso sul braccio rosso** sulla stessa build: il difetto «scheda fuori dal gioco» non si vede (in «Prova Neri 3» la partita del rosso non finisce e non nasce nessuna scheda; in «Prova Greco 8» la scheda sta solo in gioco). Il braccio verde è sano. Non trovo nei rapporti l'esito sulla 196 o sulla 197, quindi **non posso dire** se è nato nella 197. Non l'ho toccato né indagato. Decide il PO.
