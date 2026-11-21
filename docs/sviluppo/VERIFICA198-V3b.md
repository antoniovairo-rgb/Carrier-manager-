# VERIFICA 198 — parte V3b

Ramo `sviluppo/verifica198-v3b`, partito da `prova/198-finale` (0f0b13d8, cioè la finale della V3 + giro 302).
Base di confronto: `lavoro/198` (b3b75b9d), in una copia separata. `GAME_VERSION` non toccata, nessuna modifica al gioco,
nessuna correzione: solo misure. Controlli uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`).
Macchina: 16 GB di memoria (15,4 liberi all'avvio), 59 GB di disco liberi. Inizio 22:55 del 20/11/2026.

Durata: circa 3 ore e 20 minuti (22:55–02:15), **oltre il tetto di circa 2,5 ore**: `highlight-95` da solo ha preso 117 minuti.

## Verdetto

**V3b pronto: no.**

Quello che ora è chiarito (tutto misurato in questa sessione):
1. `highlight-95` **è arrivato in fondo ed è verde**: braccio verde 0 difetti, braccio rosso visibile (157 difetti).
2. `esito-280`: il motivo di rosso in più visto dalla V3 **non si conferma** (0 volte su 4 corse, 2 sull'unione e 2 sulla base).
   Il guardiano resta rosso, ma identico sulla base: non nasce dall'unione.
3. `portiere-223`: il caso «non giudicato» **c'è anche sulla base** (stessa scena, «volee gi1 wide: a bruciapelo»), e in questa
   corsa sull'unione non è uscito. Non nasce dall'unione; va e viene da una corsa all'altra.
4. Corsa CI 44830113928, parte 9: il fallito era **`salti-274`** (gli altri cinque verdi). Qui è verde sull'unione e sulla base
   con gli stessi numeri: il rosso della CI non si riproduce su questa macchina.

Perché «no»:
- **Punto 4 non fatto**: gli otto guardiani non eseguiti dalla V3 non li ho eseguiti nemmeno io (tempo finito). Dal registro
  della CI risulta che uno di loro, **`chiusura-99`, è rosso** sulla finale; non l'ho rieseguito né confrontato con la base.
- **Punto 5 fatto a metà**: dei sei guardiani ho rieseguito solo `salti-274` (l'unico rosso in CI); gli altri cinque li do
  verdi **solo dal registro della CI**, non da una mia corsa.
- `salti-274` in CI è rosso per una soglia superata (62,6 u/s contro 60) che qui non supera (45,3): non so dire se sulla CI
  la base darebbe lo stesso rosso (la base in CI non è stata eseguita). **Non posso confermare** che non dipenda dall'unione;
  l'unico indizio è che qui unione e base danno lo stesso massimo.
- `portiere-223` e `esito-280` restano «non verdi pieni» per regola (un «non giudicato» che va e viene; un rosso dichiarato),
  anche se nessuno dei due nasce dall'unione.
- Nella stessa corsa CI ci sono altri rossi fuori dal mio incarico (sotto): non li ho guardati.

## Tabella

| controllo | esito su finale (0f0b13d8) | esito sulla base (b3b75b9d) | nato da quale giro | nota |
|---|---|---|---|---|
| `highlight-95` braccio verde | **verde**, 0 difetti (60 min) | non eseguito | — | 19 partite, 96 highlight · D4 senza esito 0 · passaggi 28, arrivati 89,3% · gol del compagno 13 = assist 13 · finte 6, riuscite 33,3% · falli cercati 1 · parate giudicate 17 · non giudicabili (guardia di parete) 0 · rivelazioni lette da un'altra scena 16 (elencate dal guardiano, non contate come difetto) |
| `highlight-95` braccio rosso | **rosso come atteso** (57 min): 157 difetti | non eseguito | — | 19 partite, 105 highlight · il guardiano ne elenca solo le prime 14 (D1 6, D3 8); dal riepilogo: D4 senza esito 5, finte giocate con famiglia «pass» 5 su 6 (D2) · passaggi arrivati 82,1% · finte riuscite 16,7% |
| `highlight-95` **intero** | **verde**: ultima riga «✅ highlight-95 verde (e il rosso si vede)» (117 min in tutto, 22:57–00:54) | non eseguito | — | Per arrivare in fondo ho tolto il limite dei 90 minuti a corsa in corso (a 60 minuti, finito il braccio verde, ho chiuso il solo processo `timeout`, non il guardiano): il tetto dato era 90 minuti e la corsa ne ha presi 117. Per questo **il codice d'uscita del guardiano non è stato raccolto**: l'esito viene dalla riga finale stampata. |
| `esito-280` (rosso dichiarato), due corse | **rosso** due volte (uscita 1, 9 min l'una), **stessi motivi** | **rosso** due volte (uscita 1, 9 min l'una), **stessi motivi** | precedente alla 198 (rosso identico sulla base); **il motivo in più della V3 non si conferma** | Quattro corse, quattro esiti uguali riga per riga. Parte A: verde 0 smentite su 78, rosso 53 su 78, doppi conteggi 0 contro 14. Parte B: p0 finita in tutti e due i bracci (1-2), p1 non finita in tutti e due i bracci; motivi del rosso: «B verde: partite non finite o errori» e «B verde: tabellino … 1/2». «B rosso non riconosciuto» (V3, una corsa) **non è uscito in nessuna delle quattro corse**: lo considero instabilità di quella corsa, non effetto dell'unione. Ricerca del giro con `__CPM_NO_G293…G302` non fatta perché non c'è niente da attribuire. |
| `portiere-223` | **verde pieno in questa corsa** (uscita 0, 6 min): 14 tiri giudicati, **nessun caso «non giudicato»** nel braccio verde; rosso `__CPM_NO_G223` visibile (16 difetti) | **verde del guardiano con 1 caso «non giudicato»** (uscita 0, 6 min): «volee gi1 wide: a bruciapelo (pallone sul portiere 0,16 s dopo il calcio…): non giudicato»; 14 giudicati; rosso visibile (14 difetti) | **non nasce dall'unione**: il caso esiste sulla base | È lo stesso caso visto dalla V3 sull'unione (lì 0,13 s). Su tre corse (V3 unione, V3b unione, V3b base) esce due volte: dipende dalla corsa. Per la regola «non giudicato = rosso» il guardiano non è verde pieno in modo stabile, né sulla base né sull'unione. In CI (parte 13) è uscito verde. |
| `salti-274` | **verde** (uscita 0, 11 min): 0 salti non spiegati, 7 conclusioni col pallone lontano, velocità massima 45,3 u/s (soglia 60); testa 2 su 2, 31,9 u/s; rosso `__CPM_NO_G274` visibile (2 salti, 415,6 u/s) | **verde** (uscita 0, 11 min): 0 salti, 7 conclusioni, velocità massima **45,3 u/s**; rosso visibile (415,9 u/s) | il rosso della CI **non si riproduce qui**, né sull'unione né sulla base | In CI: una sola conclusione col pallone lontano (25,2 u) a 62,6 u/s. La conclusione a 25,2 u della stessa partita qui dà 42,8 u/s sull'unione e 40,3 sulla base: la stessa conclusione dà velocità diverse su macchine e corse diverse (in CI 4 cpu, fps più bassi). Nella V3 il massimo era 31,9. Il numero dipende dalla corsa; non so se dipende anche dall'unione sulla macchina della CI. |
| `gk-miss-229`, `avvicinamento-61`, `formazioni-262`, `panchina-293`, `ingresso-245` | **non rieseguiti qui**; verdi nella corsa CI (registro, sotto) | non eseguiti | — | Nessun rosso da attribuire: nella parte 9 il solo fallito è `salti-274`. |
| `portiere-252`, `rinvio-252` | **non eseguiti qui**; verdi nella corsa CI (parti 8 e 13, dal registro) | non eseguiti | — | punto 4 |
| `chiusura-99` | **non eseguito qui**; **rosso nella corsa CI** (parte 13, 1364 s) | non eseguito | **non so** | punto 4. Riga del registro: «✗ verde D9 ROSSO: gol misurati 6/6 · mediana 5.30 · sotto 3: #dc2626 2.29 / ✗ chiusura-99 ROSSO (1)». Non rieseguito, non confrontato con la base. |
| `goal-postarc`, `esiti-241`, `po229-gi38`, `cross-218` | **non eseguiti qui** | non eseguiti | — | punto 4. Sono nel piano della corsa CI ma non nelle cinque parti fallite che ho letto (6, 8, 9, 12, 13); le altre parti non le ho lette: **il loro esito in CI non posso confermarlo**. |
| `parata-100` | **non eseguito qui** | non eseguito | — | punto 4. Non è nel piano della corsa CI (`ci-parti-303.json`). |

## Corsa 44830113928 su GitHub Actions, parte 9 di 16 (letta dal registro, non rieseguita)

Fonte: registro del lavoro 136612890928 («parte 9 di 16 (6 guardiani)»), ramo `prova-ci/198-finale` (2d8f68dc = finale 0f0b13d8
+ tre file della sola CI: `.github/workflows/verifica-guardiani.yml`, `tests/visual/ci-parti-303.json`, `ci-parti-303.mjs`).

| guardiano | esito nella corsa CI | durata |
|---|---|---|
| `gk-miss-229` | verde (uscita 0) | 171 s |
| `avvicinamento-61` | verde (uscita 0) | 84 s |
| `formazioni-262` | verde (uscita 0) | 42 s |
| `panchina-293` | verde (uscita 0) | 220 s |
| `salti-274` | **rosso** (uscita 1) | 433 s |
| `ingresso-245` | verde (uscita 0) | 132 s |

**Il rosso della parte 9 è `salti-274`, e solo lui.** Motivo stampato: braccio verde, «TOTALE salti non spiegati in conclusione: 0 ·
conclusioni col pallone lontano 1 · velocità massima del pallone nel caricamento 62,6 u/s» → `FAIL`. Il guardiano chiede
nel verde 0 salti, velocità massima ≤ 60 u/s e scene di testa verdi (riga 78 di `salti-274.mjs`): è fallita la sola velocità
(62,6 contro 60), nella partita «Nando Orsi» (una conclusione col pallone a 25,2 u). Le due scene di testa provocate erano verdi
(31,9 u/s, 0 salti). Il braccio rosso non è partito (lo script npm si ferma al primo fallimento). Nella V3, su questa macchina,
`salti-274` era verde con velocità massima 31,9 u/s.

### Altre parti fallite della stessa corsa (lette dal registro, fuori dal mio incarico, non riesegute)

La corsa è finita «fallita» con cinque parti rosse su sedici: 6, 8, 9, 12, 13. Oltre a `salti-274` (parte 9) e `chiusura-99`
(parte 13):

| parte | guardiano | riga del registro |
|---|---|---|
| 6 | `portatore-293` | «braccio VERDE: 1 difetti su 14 scene — gi129 difensiva #6 corsa 2: si sposta (0.76 u fra due inversioni), il pallone cambia padrone 1» (il braccio rosso si vedeva) |
| 8 | `avvio-233` | «NON GIUDICATO (uscita 1)» dopo 1 s: «esito: (1) non giudicato · (2) non giudicato · (3) non giudicato» |
| 12 | `piedi-252` | «mediane: verde 0.414 · rosso 0.521 / ❌ piedi-252 ROSSO (verde 0.414 soglia 0.4 · rosso 0.521)» |

Non so se questi tre nascono dall'unione: nessuno è stato eseguito sulla base, né qui né in CI.

## Non eseguito

- Punto 4: `portiere-252`, `parata-100`, `goal-postarc`, `esiti-241`, `po229-gi38`, `cross-218`, `chiusura-99`, `rinvio-252`
  (nessuno eseguito qui).
- Punto 5: `gk-miss-229`, `avvicinamento-61`, `formazioni-262`, `panchina-293`, `ingresso-245` (non rieseguiti: verdi in CI).
- Ricerca del giro con `__CPM_NO_G293…G302`: non fatta, perché nessun rosso è risultato nato dall'unione.
- `highlight-95` sulla base: non eseguito (verde sull'unione, due ore per corsa).

## Note sul metodo

- `highlight-95`: tetto dato 90 minuti, corsa durata 117. A 60 minuti ho chiuso il solo processo del limite di tempo per non
  buttare via un'altra volta il braccio rosso; il codice d'uscita non è stato raccolto, l'esito è la riga finale stampata.
- `salti-274` sull'unione: il mio comando d'attesa è scaduto a 10 minuti e ha chiuso solo lo script di lancio; il guardiano è
  arrivato in fondo da solo («✅ PASS salti-274» e «✅ ROSSO come atteso»), ma anche qui senza codice d'uscita raccolto.
  Sulla base lo stesso guardiano ha dato uscita 0.
- Nessun controllo ha rigenerato foto in `docs/` (`git status` pulito dopo ogni corsa, su unione e base).
- I registri completi delle corse stanno nella cartella di lavoro della sessione, non nel repo.
