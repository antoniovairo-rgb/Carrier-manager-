# Rapporto giro 277 — schermate-97 (D14) e schede-246, rossi nati nella 197

Ramo `sviluppo/giro277-schermate-schede` da `lavoro/197` a `83ae5e5c`. Decisione PO-516 (18/11 14:10): un rosso nato nella 197 si ripara prima dell'uscita. Versione 7.999.197, `GAME_VERSION` non toccata.

## Esito in breve

- **schermate-97 (D14): riparato. Era la sonda, il gioco è invariato.** Verde 2 volte di fila, rosso riconosciuto (D14 ha ora un suo rosso, provocato dalla sonda).
- **schede-246: NON riparato. Resta rosso.** Ho misurato perché non nasce nessuna scheda e ho escluso otto giri sospetti, ma non ho trovato il commit e non ho corretto il controllo: tempo del giro finito. Dettagli e proposta nei dubbi.
- **Nessun file di `src/` è cambiato**: `CARRIER-MANAGER-AV.html` è identico byte per byte a quello di `lavoro/197` (`node tools/check-src.mjs`: «IDENTICO BYTE PER BYTE», «allineato al file in git»). Non esiste quindi un rosso `__CPM_NO_G277`: non c'è una correzione del gioco da spegnere.
- Il sospetto comune (giro 264, battito in `flushSync`) è **escluso dalla misura** per tutti e due i controlli.

## 196 / 197 prima / dopo

| controllo | 196 (`3076a1b7`) | 197 prima (`83ae5e5c`) | 197 dopo (questo ramo) |
|---|---|---|---|
| schermate-97, verde | verde (rapporto V3d: «fase ceremony · luminosità 102.7») | **rosso** («D14 +150 ms: fase hl_intro», 2 su 2 nel rapporto V3d; qui rimisurato con la sonda di fase: cerimonia comandata in `hl_intro@3'`) | **verde 2 su 2** («D1 2 · D16 44 · D17 4 · D14 4 misure») |
| schermate-97, rosso | riconosciuto (senza D14) | riconosciuto (senza D14) | riconosciuto, **anche D14** («col nero non dichiarato cadono le 4 misure di D14») |
| schede-246, braccio verde | sano (rapporto V3e2; qui NON rimisurato) | **rosso**: «schede a schermo 0 · timer armati/scaduti 0/0», «nessuna scheda comparsa, guardiano cieco» | **rosso, invariato** (controllo non modificato) |
| schede-246, braccio rosso | rosso («il cronometro non corre con la scheda aperta») | rosso (stessa riga; qui 0 schede anche nel braccio rosso) | rosso, invariato |

## schermate-97, controllo D14

### Commit che lo fa nascere

`ef7ca765` — «Unione sviluppo/giro233-avvio-leggero in lavoro/197» (giro 233, PO-453, avvio leggero).

Bisezione sulle 57 unioni di primo livello fra `origin/main` e `lavoro/197` (6 passi), misurando il momento in cui si apre il primo highlight del provino «Grafica Probe»:

| build | cronologia dall'ingresso in `playing` |
|---|---|
| 196 e `92ff298b`, `d3c293f7` (prima del 233) | `playing@0'` fermo ~3,6–4,1 s → `1'` → `2'` → `hl_intro@3'` a **6,6–7,1 s** |
| `ef7ca765` (233) e tutte le successive | `playing@1'` subito → `2'` a ~0,65 s → `hl_intro@3'` a **2,7–3,1 s** |

Il minuto del primo highlight è lo stesso (3'): dal 233 il cronometro non resta più fermo ~3,7 s a 0' all'avvio. La sonda aspettava **2,5 s fissi** dopo `playing` e poi comandava la cerimonia: sulla 196 cadeva nel gioco fluido, sulla 197 cade **dentro l'apertura del primo highlight**, dove la pagina è occupata e la fase `ceremony` arriva dopo 120–980 ms (misurato in pagina, 5 partite). Da qui «+150 ms: fase hl_intro».

### Il giro 264 non c'entra

Con `__CPM_NO_G264` acceso la cronologia è la stessa (cerimonia comandata in `hl_intro@3'`, fase `ceremony` dopo 441–955 ms). Anche con Babel nel browser (`CPM_BABEL_BROWSER=1`, giro 237) la cronologia non cambia.

### Seconda cosa trovata: lo stacco nero di regia

Corretta l'attesa fissa, la misura a +150 ms dava a volte «luminosità 0,4 · neri 99%». Misurato: quando la camera salta alla cerimonia il ciclo 3D chiede da solo uno **stacco nero di 340 ms** (`onCutNeeded`, `src/15`, regola 7.471 «il renderer può chiedere lo stacco»). C'è **anche sulla 196** (cerimonia comandata dal gioco fluido dopo il primo highlight: prima foto 0/99% su tutte e due le versioni). La vecchia sonda sulla 196 non lo incontrava perché comandava la cerimonia a cronometro ancora fermo.

Avevo prima ipotizzato un difetto del gioco (la tela 3D scoperta e non ancora disegnata quando sparisce il campo 2D) e scritto una correzione in `src/15` e `src/12`. **La misura l'ha smentita** (il nero compariva anche con la correzione, e la foto mostra una dissolvenza su tutta l'area, non una tela vuota): l'ho ritirata per intero prima di qualunque commit.

### Correzione (solo `tests/visual/schermate-97.mjs` e la riga dello script in `package.json`)

Secondo PROCESSO.md, regole PO-311:

1. niente attesa fissa: si aspetta che il cronometro batta un minuto in `playing` e lì si comanda la cerimonia (come il fischio vero, che arriva dal gioco fluido);
2. si aspetta l'**evento** fase `ceremony`; le quattro misure (150, 500, 1000, 2000 ms) si contano da quell'evento;
3. la sonda **sa degli stacchi** (regola 7.504): ogni misura aspetta che il gioco dichiari finito lo stacco (`__CPM_CUTLIVE`, lo stesso criterio del ciclo 3D) e si rifà se uno stacco nasce durante la foto;
4. «non giudicato» = rosso: partita non in `playing` al comando, cerimonia mai partita entro 10 s, stacco che non finisce in 8 s o cinque foto di fila dentro uno stacco sono fallimenti;
5. **soglie invariate**: luminosità media ≥ 40, pixel neri ≤ 50%, fase `ceremony`;
6. **rosso di D14** (prima non esisteva: lo script lo saltava con `CPM_SENZA_D14=1`): con `CPM_PROVA_ROSSO=1` la sonda stende sulla pagina un nero che il gioco non dichiara come stacco, e le quattro misure devono cadere tutte per luminosità. Misurato: 4 su 4 a «luminosità 0,0 · neri 100%».

### Misure dopo la correzione

| giro | esito |
|---|---|
| verde 1 | «D14 comando a fase playing minuto 2 · fase ceremony dopo 6 ms» · luminosità 121,5 / 116,5 / 108,9 / 108,2 · neri 0% → VERDE |
| rosso | D1, D16, D17 cadono; D14 cade 4 su 4 → «ROSSO ATTESO OK» |
| verde 2 | «fase ceremony dopo 5 ms» · luminosità 124,6 / 114,0 / 108,1 / 107,8 · neri 0% → VERDE |

Nota di precisione: fra il verde 1 e il verde 2 ho alzato da 3 a 8 s il tetto «stacco che non finisce» (nel verde 1 la prima attesa era durata 3,3 s con la foto compresa, margine troppo stretto). Il rosso è stato eseguito una volta, col tetto a 3 s.

## schede-246

### Che cosa ho misurato

- Sulla 197 (`83ae5e5c`), controllo com'è: braccio verde e braccio rosso finiscono la partita con **0 schede a schermo, 0 al motore, timer armati/scaduti 0/0**.
- La partita del controllo (salvataggio `save-194-primavera-w38`, nome «Guard246 Rossi0», pilota seedato) sulla 197, misurata con i rossi accesi (tabella sotto), va **0-1 al 30' e 0-2 dal 60'** in tutte e due le prove; senza rossi il punteggio non l'ho rilevato. Tutte le schede del sistema vivo (`INT259.FATTI`, `src/14`) chiedono uno scarto di al più un gol (`sotto_finale`: −1 dal 70'; `pari_finale`: 0 dal 75'; rigore, espulsioni e calo: |scarto| ≤ 1). Con −2 dal 60' **per regola non nasce nessuna scheda**. Le regole delle schede non risultano cambiate fra 196 e 197 (nessuna riga di `INT259` nel confronto dei due `src/14`).
- Quindi il braccio verde è cieco perché **la partita dello scenario è cambiata**, non perché le schede siano rotte. È lo stesso caso del giro 67 scritto nel controllo («con lo stile Regista la partita cambia e le schede del finale non nascono»). **Non posso confermare** come andava la stessa partita sulla 196: non l'ho rimisurata.

### Sospetti esclusi (una partita ciascuno, braccio giocatore)

| rossi accesi | schede | punteggio |
|---|---|---|
| nessuno (197, controllo com'è) | 0 | non rilevato (il controllo non stampa il punteggio) |
| `__CPM_NO_G238`, `__CPM_NO_G249`, `__CPM_NO_G257` (rigorista e piazzati, le sole tre unioni che toccano `src/14`) | 0 | 0-1 al 30', 0-2 al 60', finale 0-2 |
| `__CPM_NO_G264`, `__CPM_NO_G253`, `__CPM_NO_G246`, `__CPM_NO_G243`, `__CPM_NO_G233` | 0 | 0-1 al 30', 0-2 al 60', finale **1-3** |

### Commit che lo fa nascere

**Non trovato.** Una partita del controllo dura ~5 minuti; la bisezione sulle 57 unioni ne chiede 6 e non è entrata nel tetto del giro. Due tentativi li ho persi per un errore mio nella sonda di confronto (una riga di stampa a fine partita).

### Stato

`schede-246` resta **rosso** sulla 197, in tutti e due i bracci. Il braccio rosso cieco già sulla 196 non è venuto gratis: resta un rosso dichiarato per la 198.

## Controlli

| controllo | esito |
|---|---|
| schermate-97 | verde 2 su 2, rosso riconosciuto (vedi sopra) |
| schede-246 | **rosso** (non riparato) |
| test:logic · save-compat · spazio-270 · battito-264 · solo-highlight-166 | vedi «Controlli finali» in fondo |
| guardiani della MAPPA | nessuno: nessun file di `src/` toccato |
| `node --check` su `schermate-97.mjs` | passa; `ci-runner.mjs` non toccato |

Non eseguiti, come da regola: highlight-95, ingresso-206, career-critical.

## Dubbi per il PO

1. **schede-246 blocca ancora l'uscita della 197 secondo PO-516.** Il difetto nato nella 197 è «guardiano cieco», non «schede rotte»: la partita dello scenario finisce 0-2 e con due gol di scarto il gioco, per regola, non propone schede. Serve la scelta del PO: (a) aspettare un altro giro che trovi il commit e rimetta in piedi lo scenario; oppure (b) uscire con questo rosso dichiarato. Non ho deciso.
2. **Come riparare lo scenario di schede-246.** Due strade, tutte e due nelle regole PO-311 («ciò che il gioco non produce si provoca dalla sonda»): cercare un altro nome/seme del pilota in cui lo scarto resta entro un gol, oppure aggiungere un gancio di sola prova che fissa il punteggio. La seconda tocca `src/15`. Non ho scelto.
3. **Lo stacco nero di 340 ms all'ingresso in cerimonia è voluto?** Lo chiede il ciclo 3D per regola 7.471 quando la camera salta. D14 era nato da una foto del collaudo con lo schermo nero al fischio finale (rapporto giro 97: «non riprodotto, punto aperto»). Sul banco una foto dentro lo stacco è nera al 99%. Se quel nero è proprio il difetto della foto, D14 va riaperto come difetto del gioco e la sonda non deve più scusare lo stacco. Ora la sonda lo tratta come regia voluta (regola 7.504).
4. **La cerimonia comandata dentro un highlight può non partire.** In una delle misure comandate in `hl_intro` la fase è finita in `hl_choose` e non in `ceremony` (visto una volta). È un gancio di sola prova (`__CPM_FORCE_CEREMONY`) e nel gioco vero il fischio arriva dal gioco fluido: non l'ho indagato.
5. **Col rosso `__CPM_NO_G264` (insieme a 253/246/243/233) la stessa partita finisce 1-3 invece di 0-2.** Una sola partita per braccio: non posso dire quale dei cinque rossi la cambi, né se sia atteso.
6. **Il rosso di schermate-97 ora gioca anche la partita di D14** (lo script non passa più `CPM_SENZA_D14=1`): circa un minuto in più.
7. Il secondo verde di schermate-97 è stato eseguito dopo l'ultimo ritocco (tetto dello stacco 3 → 8 s); il rosso no. La logica del rosso non dipende da quel tetto, ma non l'ho rieseguito.
