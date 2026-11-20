# VERIFICA 198 — parte V3 (unione dei giri 295 e 301 in src/12)

Ramo `sviluppo/verifica198-v3`, partito da `prova/198-finale` (9ec24c4f = `prova/198-blocco2` + giro 301).
Base di confronto: `lavoro/198` (b3b75b9), in una copia separata. `GAME_VERSION` non toccata, nessuna modifica al gioco.
Macchina: 16 GB di memoria (15,4 liberi all'avvio), 59 GB di disco liberi. Controlli uno alla volta (`CPM_CI_PAR=0`),
`CPM_CHROME=/opt/pw-browsers/chromium`. Tutti gli esiti qui sotto vengono da corse fatte in questa sessione (20/11/2026);
dove un controllo non è stato eseguito è scritto.

Durata: circa 4 ore e 25 minuti (18:20–22:45), **oltre il tetto di circa 3 ore**: `esiti-218` è durato 39 minuti per corsa
(due corse) e `highlight-95` ha usato tutti i suoi 65 minuti senza finire.

## Verdetto

**V3 pronto: no.**

- **L'unione dei giri 295 e 301 in sé non ha mostrato nessun rosso suo**: i sette controlli del punto 1 che dovevano essere verdi lo
  sono, i due rossi dichiarati (`esito-280`, `esiti-218`) sono rossi anche sulla base. Non ho quindi dovuto usare
  `__CPM_NO_G295`/`__CPM_NO_G301` per attribuire un rosso, e non ho corretto niente.
- Il «no» viene da quello che manca o non è pieno, non da un difetto trovato:
  1. `highlight-95` **non è arrivato in fondo**: braccio verde completo e pulito (0 difetti), braccio rosso interrotto dal limite
     di tempo → il guardiano nel suo insieme è «non giudicato», cioè rosso per regola.
  2. `esito-280` sull'unione ha **un motivo di rosso in più** rispetto alla base, visto in una corsa sola e non ricontrollato.
  3. `portiere-223` esce verde ma dichiara **un caso «non giudicato»** nel braccio verde; la base non è misurata.
  4. Otto guardiani del punto 2 **non eseguiti**.
  5. La MAPPA non fa eseguire alla mirata i due guardiani nuovi (vedi «Cose trovate fuori dai controlli»).

## 1. Unione dei giri 295 e 301

| controllo | esito su finale (9ec24c4f) | esito sulla base (lavoro/198) | nato da quale giro | nota |
|---|---|---|---|---|
| `esito-rete-301` | **verde** (uscita 0, 22 min) | non esiste sulla base | 301 | A: 32 non-gol, 0 in rete, barriera 0 interventi, 0 non giudicati · B provocato verde 0 su 8 (barriera 8 su 8) · gol 6 su 6 · rosso `__CPM_NO_G301` 7 su 8 (sul ramo del giro 301 era 8 su 8; soglia del guardiano 6) |
| `portiere-295` | **verde** (uscita 0, 12 min) | non esiste sulla base | 295 | 4 bracci verdi 0 difetti (16 · 8 · 8 · 8 giudicate, 0 non giudicate) · rosso `__CPM_NO_G295` rivisto 16/16 · 8/8 · 8/8 · 7/8 |
| `gk-dive-sync` | **verde** (uscita 0, 3 min) | non eseguito | — | 8 tuffi, anticipo mediano −0,10 s, peggiore −0,15 s (tolleranza 0,25 s) |
| `salti-274` | **verde** (uscita 0, 12 min) | non eseguito | — | verde: 0 salti non spiegati, velocità massima 31,9 u/s · rosso `__CPM_NO_G274` rivisto (2 salti su 2 scene di testa, 415,8 u/s) |
| `contatto-103` | **verde** (uscita 0, 14 min) | non eseguito | — | verde: 4 parate giudicate, 0 difetti · rosso rivisto: 3 «pallone mai al portiere» su 4 |
| `portiere-265` | **verde** (uscita 0, 5 min) | non eseguito | — | verde 0 difetti su 7 casi · rosso `__CPM_NO_G265` 3 rientri provocati su 3. Il guardiano stampa per ogni caso «massimo dal bersaglio del suo ciclo … (non giudicato)»: è una misura che il guardiano dichiara di non giudicare per costruzione (giro 265), non un caso saltato |
| `validate-situations` | **verde** 14/14 (uscita 0, 15 min) | non eseguito | — | 191 scene, impronta 00001505, 0 fallimenti; avvisi non bloccanti: initial-state 3 · visual 1 · movements 23 · motion 1 · bg-coherence 1 · live-smoke 1 |
| `esito-280` (rosso dichiarato) | **rosso** (uscita 1, 9 min) | **rosso** (uscita 1, 9 min) | precedente alla 198 (rosso già sulla base) | Parte A identica sulle due versioni: verde 0 smentite su 78, rosso 53 su 78, doppi conteggi 0 contro 14. Parte B, motivi comuni: «partite non finite» (p1 non finita su tutte e due) e «tabellino 1 su 2». **Sull'unione un motivo in più**: «B rosso non riconosciuto», perché la partita p0 del braccio rosso non è finita (sulla base è finita, 1 su 1). Una corsa sola per parte: non so dire se è instabilità o effetto dell'unione (seconda corsa non fatta, vedi «Non eseguito») |
| `esiti-218` (rosso dichiarato) | **rosso** (uscita 1, 39 min) | **rosso** (uscita 1, 39 min) | precedente alla 198 (rosso identico sulla base) | Stessi numeri sulle due versioni: verde 17 scene, **0 contraddizioni**; rosso 20 scene, 7 contraddizioni (il rosso si vede). Unico motivo del rosso, identico: «partite non arrivate al fischio: verde 1234 fermo in playing» (3 scene, poi ferma). L'unione non aggiunge niente |

## 2. Guardiani della MAPPA di src/12 che leggono esito, pallone in `hl_result`, portiere

Elenco, preso dalle righe di `src/12` della MAPPA di `ci-runner.mjs` (letta, non eseguita) e scelto guardando che cosa legge ogni
sonda (portiere, esito, pallone nella finestra d'esito, canale-rete). Oltre a quelli già nel punto 1 (`esito-rete-301`,
`portiere-295`, `portiere-265`, `gk-dive-sync`, `salti-274`, `contatto-103`, `validate-situations`, `esiti-218`):
`gk-miss-229`, `portiere-223`, `parata-258`, `rete-252`, `portiere-252`, `parata-100`, `goal-postarc`, `esiti-241`, `po229-gi38`,
`cross-218`, `chiusura-99`, `rinvio-252`.

| controllo | esito su finale (9ec24c4f) | esito sulla base (lavoro/198) | nato da quale giro | nota |
|---|---|---|---|---|
| `gk-miss-229` | **verde** (uscita 0, 3 min) | non eseguito | — | 12 tiri sbagliati giudicati, 7 con gesto del portiere, 7 a portata; partenza del corpo mediana −0,49 s dal passaggio sul piano |
| `portiere-223` | **verde del guardiano** (uscita 0, 7 min), **con 1 caso «non giudicato»** | non eseguito | non so (base non misurata) | verde: 14 tiri giudicati; rosso `__CPM_NO_G223` rivisto con 12 difetti. Nel braccio verde il guardiano stampa «volee gi1 wide: a bruciapelo (pallone sul portiere 0,13 s dopo il calcio, sotto il tempo di reazione): non giudicato». Per la regola «non giudicato = rosso» lo segnalo come **non verde pieno**; non so se lo stesso caso esce anche sulla base |
| `parata-258` | **verde** (uscita 0, 1 min) | non eseguito | — | 4 parate su 4 col pallone sulle mani, 0 dietro il portiere |
| `rete-252` | **verde** (uscita 0, 4 min) | non eseguito | — | verde: passo massimo 0,91 u, in rete 4 su 4 · rosso: passo massimo 4,40 u |
| `portiere-252`, `parata-100` (instabile dichiarato), `goal-postarc`, `esiti-241`, `po229-gi38`, `cross-218`, `chiusura-99`, `rinvio-252` | **non eseguiti** | non eseguiti | | tempo finito: vedi «Non eseguito» |

## 3. `highlight-95`

| controllo | esito su finale (9ec24c4f) | esito sulla base (lavoro/198) | nato da quale giro | nota |
|---|---|---|---|---|
| `highlight-95` | **non giudicato (= rosso per regola)**: fermato dal limite di tempo a 65 minuti, durante il braccio rosso | non eseguito | — | vedi sotto |

Dove era quando si è fermato (partito 21:37, fermato 22:42):
- **Braccio verde: completo, 0 difetti.** 19 partite (salvataggi s1, s5, s12 × semi 1234, 2021, 7 × passaggio/dribbling, più la
  «scena senza esito»), 94 highlight · D4 senza esito 0 · 28 passaggi, arrivati 89,3%, gol del compagno 12, assist a tabellone 12 ·
  esiti gol/assist 12, parata/occasione 9, intercettato 3, murato/occasione 4 · finte 4, riuscite 50% · falli cercati 1 ·
  parate giudicate 17 · non giudicabili (guardia di parete) 0 · rivelazioni lette da un'altra scena 15 (il guardiano le elenca, non
  le conta come difetto). Il braccio verde da solo ha preso circa 63 minuti.
- **Braccio rosso: appena iniziato.** Una partita letta (s1/1234 dribbling, 4 highlight), poi il limite di tempo ha chiuso il
  browser: tutte le righe successive sono «Target page, context or browser has been closed». Il verdetto stampato in coda
  («rosso: D1/D2/D3/D4 non si vede») è **l'effetto dell'arresto, non una misura**: 4 highlight letti su 19 partite.
- Il limite di 65 minuti l'ho messo io; la corsa intera (verde + rosso) su questa macchina, con un controllo alla volta, richiede
  a occhio circa due ore (stima dal solo braccio verde, non misurata). Il guardiano accetta `CPM_ARMI=rosso` per fare solo il
  braccio mancante: non l'ho lanciato perché ero già un'ora e mezza oltre il tetto.

## Non eseguito

- `highlight-95`, braccio rosso (sopra).
- Seconda corsa di `esito-280` sull'unione, per capire se «B rosso non riconosciuto» (partita p0 del braccio rosso non finita) è
  instabilità o no. Nota: il motivo riguarda una partita che non arriva al fischio, come gli altri motivi già presenti sulla base;
  nel diff dell'unione rispetto alla base c'è anche `src/15` (63 righe, blocco 2), non solo i giri 295/301. **Non so quale sia la causa.**
- `portiere-223` sulla base (per sapere se il caso «non giudicato» c'era già).
- Punto 2, non eseguiti: `portiere-252`, `parata-100`, `goal-postarc`, `esiti-241`, `po229-gi38`, `cross-218`, `chiusura-99`,
  `rinvio-252`.
- Sulla base ho eseguito solo `esito-280` ed `esiti-218` (i due confronti chiesti); gli altri sono verdi sull'unione e non
  avevano bisogno del confronto.
- Nessun controllo ha rigenerato foto in `docs/` (`git status` pulito dopo ogni corsa).

## Cose trovate fuori dai controlli

1. **La MAPPA di `ci-runner.mjs` ha tre righe per `src/12` (righe 26, 27, 28) e la mirata legge solo la prima**
   (`MAPPA.find`, riga 105). `portiere-295` sta solo nella riga 27 e `esito-rete-301` solo nella riga 28: sull'unione
   **la mirata non esegue nessuno dei due guardiani nuovi**. È lo stesso difetto già annotato dal giro 293 per `portatore-286`.
   Non l'ho corretto (la riga 26 è una riga sola lunghissima: una modifica lì va in conflitto con chiunque la tocchi in parallelo);
   la correzione è aggiungere i due nomi alla riga 26.
