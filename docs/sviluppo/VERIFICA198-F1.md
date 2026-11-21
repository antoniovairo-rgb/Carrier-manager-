# Verifica finale 7.999.198 — parte F1

- **Ramo provato:** `prova/198-finale` a `6b79812c` (giri 293–296, 298–302 + correzioni 304 tunnel, 305 scatto del pallone, 306 sonda testi-190).
- **Base di confronto per i rossi:** `lavoro/198` a `b3b75b9d`.
- **Ramo di lavoro:** `sviluppo/verifica198-f1`.
- **Banco:** sessione cloud, 16 GB di memoria, 59 GB di disco liberi; `CPM_CHROME=/opt/pw-browsers/chromium`, `CPM_CI_PAR=0`, un controllo alla volta, tetto di 40 minuti per controllo.
- **Regola:** nessuna correzione, solo rapporto. «Non giudicato» vale rosso. Nessuna soglia toccata.

## Tabella

| controllo | esito | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| `tunnel-245` corsa 1 | **verde** (uscita 0, 2043 s) | — | — | braccio verde 20 stadi · 0 guasti; rosso `__CPM_NO_G245` visto 3/3 (bocca fuori centro e corpi dentro oggetti); rosso 255 visto (schieramento 2/2, panca bassa 2/2, sostituzione 1/1) |
| `tunnel-304` (2 corse) | **rosso 2/2** («non giudicato») — corsa 1: uscita 1 in 323 s; corsa 2: uscita 1 in 704 s | non eseguibile: `misura-304.mjs` e lo script `tunnel-304` non esistono su `b3b75b9d` | giro **304** (la sonda nasce col 304; il rosso è della sonda, non un corpo dentro un oggetto) | La sonda pretende almeno 2 uscite «arrivate alla fascia degli oggetti» su 4; le uscite k=1,2,3 a volte si fermano prima (z minima −26…−32) e ne resta 1 sola. Corsa 1: braccio verde `non giudicato: 1 uscite … (minimo 2)`. Corsa 2: braccio verde giudicato e **verde** (2 uscite, 0 con l'eroe dentro un oggetto), ma braccio rosso `__CPM_NO_G304` → `ESITO no=[304] … con l'eroe dentro un oggetto 1` e poi `non giudicato … ROSSO NON VISTO: guardiano cieco`. In nessuna delle 3 passate verdi/tentate l'eroe è finito dentro un oggetto col 304 acceso (pen 0 su 8 uscite); l'unica penetrazione vista (striscia LED, 11 fotogrammi) è col 304 spento. Conclusione misurata: copertura della sonda instabile; il difetto di gioco non è stato osservato. |
| `tunnel-285` | **verde** (uscita 0, 305 s) | — | — | braccio verde 5 stadi (notte) · 0 guasti; rosso `__CPM_NO_G285` visto 5/5, non giudicati 0 |
| `corpi-073` (2 corse) | **verde 2/2** (uscita 0; 447 s e 467 s) | — | — | `✅ corpi-073 verde (282,283,284f)` in entrambe; nessuna riga ✗ / ROSSO / «non giudicato» nei due log. Lo script gira i bracci 282, 283 e 284f; `284f primo scatto del pallone lontano dal punto in 0/6 aperture` è dichiarata dalla sonda «misura, non verdetto» |
| `scatto-305` | **verde** (uscita 0, 119 s) | — | — | `✅ scatto-305 verde (rosso di prova visibile)`: verde 2 aperture, col codice 001 0; rosso `__CPM_NO_G305` 2/2 aperture col codice 001 (primo scatto a 35,8 u e 74,2 u dal punto). Nota: nel braccio verde una delle due aperture stampa `001 in 1/19` campioni; la sonda conta un'apertura «col codice 001» solo da 4 campioni in su e con almeno il 75% dei campioni (riga 13 di `scatto-305.mjs`), quindi 1/19 non conta: è la regola scritta nella sonda, non una soglia toccata qui |
| `ingresso-294` | **verde** (uscita 0, 294 s) | — | — | A verde: 68 provocazioni, pallone fuori dal dischetto 0/132; A rosso 125/125. B verde: tasto audio in ingresso, in partita e in cerimonia; B rosso: tasto assente. C verde su 412×915, 375×667, 1366×768 (Indietro ed Esc tornano, partita identica); C rosso: tasto assente. `i tre rossi si vedono` |
| `portiere-295` | **verde** (uscita 0, 658 s) | — | — | verde: bracci 1–4 con 0 difetti su 16/8/8/8 giudicate, 0 non giudicate; rosso `__CPM_NO_G295`: difetto rivisto in 16/16, 8/8, 8/8, 8/8. Nota: la sonda apre da sé le pagine «2 per volta» (è scritto nella sonda, `CPM_CI_PAR=0` non la cambia) |

## Verdetto

In corso.

---

## Appendice — verifica F1 precedente (build `086cdba9`, già presente su questo ramo)

Il ramo remoto `sviluppo/verifica198-f1` conteneva già questo rapporto, fatto su una `prova/198-finale` più vecchia. Lo conservo qui sotto senza modifiche (titolo abbassato di un livello); non riguarda il build `6b79812c`.

### Verifica di rilascio 7.999.198 — blocco F1 (rapida)

Solo verifica: nessuna correzione a gioco o sonde.

- **Build provata:** ramo `prova/198-finale`, commit `086cdba9` (= `lavoro/198` f4051ca0 + giri 286 e 291, entrambi su `src/12`). Il ramo di questo rapporto (`sviluppo/verifica198-f1`) parte da quel commit e aggiunge solo questo file.
  ⚠️ Nel build `GAME_VERSION` vale ancora `7.999.197` (src/07 e CARRIER-MANAGER-AV.html): il bump a 7.999.198 non c'è ancora.
- **Base di confronto:** `f4051ca0` (worktree `../base198`, `node_modules` collegato).
- **Comando:** in `tests/visual`, `CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 timeout 2400 npm run -s <nome>`, uno alla volta; `free -m` e `df -h` registrati prima di ogni controllo (nei log).
- **Regola:** rosso / «non giudicato» / oltre tetto → seconda prova; rosso 2/2 → prova sulla base.

| # | Controllo | 1ª | 2ª | Base | Classificazione | Riga di verdetto stampata |
|---|---|---|---|---|---|---|
| 1 | partita-vera | ✅ | — | — | **verde** | `ESITO partita-vera: uscita 0 · BRACCIO verde · MOTIVO tutte le 12 bande giudicate e tenute (partite finite 2/2)` (nota: riga info `portatore-stato: campioni 0 · copertura 0%`, solo informativa) |
| 2 | chiusura-99 | ✅ | — | — | **verde** | `✓ chiusura-99 VERDE` (braccio verde: D9 6/6 mediana contrasto 5.75, RIC 5/5 100%; braccio rosso: D9 ROSSO 5 sotto 3, RIC ROSSO 4/5 — come atteso). Durata ~35 min |
| 3 | portiere-265 | ✅ | — | — | **verde** | `✅ portiere-265 VERDE (verde col verde, rosso col rosso): negli highlight il portiere resta sul suo punto, davanti alla linea, fermo al calcio.` (verde 0 difetti su 7 casi; rosso 6 su 7) |
| 4 | ball-owner | ✅ | — | — | **verde** | `✅ baseline F2 misurata su 2481 fotogrammi · 62 movimenti senza padrone da attribuire` (conflitti 145 = 5,8%; coppia inseguitore+addosso assente dall elenco; lanciato senza `CPM_IA_MAX`, come da elenco: è la sola misura di osservazione) |
| 5 | frozen-mate | ✅ | — | — | **verde** | `✅ nessun compagno congelato: il gesto si rilascia sempre` (fotogrammi-orfano 0; GLB montati. Dubbio: il controllo gira solo il braccio verde e non stampa quanti gesti di compagni ha osservato) |
| 6 | aim-latch | ✅ | — | — | **verde** | `✅ il corpo guarda dove calcia (mediana 0 rad)` (13 rilasci, p90 0.11) |
| 7 | difesa-252 | ✅ | — | — | **verde** | `✅ difesa-252 VERDE` (reale: fermi ≥0,8 0/4 · prova 0/3, correzione attiva in 3 · rosso 3/3) |
| 8 | tunnel-285 | ✅ | — | — | **verde** | `VERDE: fra la bocca del tunnel e la linea laterale non c'e' nessuna superficie ferma.` (verde 5 stadi 0 guasti · `ROSSO VISTO` 5/5, non giudicati 0) |
| 9 | zero-288 | ✅ | — | — | **verde** | `zero-288: ✓ (VERDE+ROSSO)` |
| 10 | salienti-246 | ✅ | — | — | **verde** | `VERDE: PASSA` · `ROSSO: CADE (come deve) su ogni percorso` (0 ✗ nel braccio verde; i 38 ✗/«non giudicato» sono tutti nel braccio rosso `__CPM_NO_G246`) |
| 11 | salienti-229 | ✅ | — | — | **verde** | `VERDE: PASSA` · `ROSSO: CADE (come deve): tasto assente fuori dal campionato senza posta, partita KO non apribile a soli salienti` |
| 12 | typing-shortcuts | ✅ | — | — | **verde** | `✅ PASS — chi scrive tiene la tastiera: nessuna scorciatoia gli ruba i tasti` |
| 13 | career-critical | ✅ | — | — | **verde** | `✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale.` (ultimo degli 11 passi incatenati con `&&`, uscita 0; nessun ❌/FAIL nel log) |
| 14 | test:logic | ✅ | — | — | **verde** | `# pass 51` · `# fail 0` (con `CPM_CHROME`, in `tests/visual`) |
| 15 | save-compat | ✅ | — | — | **verde** | `=== SAVE-COMPAT === 12 pass · 0 fail` · `✅ PASS` (con `CPM_CHROME`, in `tests/visual`; nota benigna già nota sul club sintetico) |

#### Esito

**15/15 verdi alla prima prova.** Nessuna seconda prova e nessuna prova sulla base f4051ca0 sono servite, quindi nessun controllo è
classificato instabile, nato coi giri 286-291, già presente o oltre tetto, e gli interruttori `__CPM_NO_G286` / `__CPM_NO_G291` non sono
stati usati. Tutti i controlli sono finiti dentro il tetto di 2400 s (il più lungo, `chiusura-99`, ~35 min).
Nessun controllo ha lasciato foto modificate in `docs/` (`git restore -- docs` eseguito dopo ognuno).

#### Dubbi e note (nessuno blocca)

- `GAME_VERSION` nel build provato è ancora `7.999.197`: il bump a 7.999.198 resta da fare nel rituale di rilascio.
- `partita-vera`: la riga informativa `portatore-stato: campioni 0 · copertura 0%` non è una banda giudicata; la segnalo perché a
  copertura 0 quella riga non dice nulla.
- `frozen-mate`: gira solo il braccio verde (fotogrammi-orfano 0) e non stampa quanti gesti di compagni ha osservato, quindi non posso
  confermare dal solo log che abbia visto gesti da giudicare (ha invece verificato che i GLB fossero montati).
- `ball-owner` è stato lanciato com'è nell'elenco, senza `CPM_IA_MAX`: in quel modo è una misura d'osservazione (conflitti 145, 5,8%)
  e non giudica il tetto della coppia inseguitore/colla.
- `npm ci` non è possibile (manca `package-lock.json`): i `node_modules` di `tests/visual` sono stati installati con `npm install`;
  il `package-lock.json` generato non è stato committato.

I log completi stanno nello scratchpad della sessione (non nel repo).
