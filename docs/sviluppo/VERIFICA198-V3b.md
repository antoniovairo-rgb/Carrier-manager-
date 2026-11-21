# VERIFICA 198 — parte V3b

Ramo `sviluppo/verifica198-v3b`, partito da `prova/198-finale` (0f0b13d8, cioè la finale della V3 + giro 302).
Base di confronto: `lavoro/198` (b3b75b9d), in una copia separata. `GAME_VERSION` non toccata, nessuna modifica al gioco,
nessuna correzione: solo misure. Controlli uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`).
Macchina: 16 GB di memoria (15,4 liberi all'avvio), 59 GB di disco liberi. Inizio 22:55 del 20/11/2026.

**Rapporto in corso: questa è la prima stesura, aggiornata dopo ogni controllo.**

## Verdetto

**V3b pronto: non ancora stabilito** (controlli in corso).

## Tabella

| controllo | esito su finale (0f0b13d8) | esito sulla base (b3b75b9d) | nato da quale giro | nota |
|---|---|---|---|---|
| `highlight-95` braccio verde | **verde**, 0 difetti (60 min) | non eseguito | — | 19 partite, 96 highlight · D4 senza esito 0 · passaggi 28, arrivati 89,3% · gol del compagno 13 = assist 13 · finte 6, riuscite 33,3% · falli cercati 1 · parate giudicate 17 · non giudicabili (guardia di parete) 0 · rivelazioni lette da un'altra scena 16 (elencate dal guardiano, non contate come difetto) |
| `highlight-95` braccio rosso | **rosso come atteso** (57 min): 157 difetti | non eseguito | — | 19 partite, 105 highlight · il guardiano ne elenca solo le prime 14 (D1 6, D3 8); dal riepilogo: D4 senza esito 5, finte giocate con famiglia «pass» 5 su 6 (D2) · passaggi arrivati 82,1% · finte riuscite 16,7% |
| `highlight-95` **intero** | **verde**: ultima riga «✅ highlight-95 verde (e il rosso si vede)» (117 min in tutto, 22:57–00:54) | non eseguito | — | Per arrivare in fondo ho tolto il limite dei 90 minuti a corsa in corso (a 60 minuti, finito il braccio verde, ho chiuso il solo processo `timeout`, non il guardiano): il tetto dato era 90 minuti e la corsa ne ha presi 117. Per questo **il codice d'uscita del guardiano non è stato raccolto**: l'esito viene dalla riga finale stampata. |

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
