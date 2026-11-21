# Verifica della 7.999.198 — parte R6

Base: `prova/198-finale` (0f0b13d8). Ramo: `sviluppo/verifica198-r6`. Banco: sessione cloud, un controllo alla volta
(`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), 16 GB di memoria, 59 GB liberi su disco all'avvio.
Nessuna correzione: solo misura e rapporto.

## Tabella

| # | Controllo | Origine | Esito sul banco (0f0b13d8) | Durata | Numeri letti dal registro | Nasce dall'unione? |
|---|---|---|---|---|---|---|
| 1 | fila-227 | parte 13 rossa su Actions (corsa 44830113928) | **VERDE** (uscita 0, rosso visibile) | 384 s | verde: 7040 campioni, fermi in corsa 0 (quota 0) · rosso `__CPM_NO_FILA227`: fermi in corsa 2660 (quota 1) | non applicabile (verde sul banco) |
| 2 | rinvio-252 | parte 13 rossa su Actions | **VERDE** (uscita 0) | 222 s | verde: v max 26,1 u/s (soglia 32) · rosso `__CPM_NO_RINVIO252`: v max 42,7 u/s, 1 scena oltre 40 (gi36 42,7; gi35 38,7). Braccio rosso debole come da storia PO-271: una sola scena supera la soglia | non applicabile (verde sul banco) |
| 3 | chiusura-99 | parte 13 rossa su Actions (unico dei quattro rosso lì: verde D9, gi42 `#dc2626` contrasto 2,29 < 3; commit 2d8f68dc su `prova-ci/198-finale`) | **VERDE** alla prima corsa (uscita 0) | 2081 s | verde D9: 6/6 gol, mediana 5,08, sotto 3: 0 (gi42 `#dc2626` 5,00) · verde RIC 5/5 · rosso D9 (`__CPM_NO_G99D9`): mediana 1,40, 5 sotto 3 · rosso RIC (`__CPM_NO_G99RIC`): 4/5 | non applicabile (verde sul banco); divergenza banco/Actions sulla scena gi42 → vedi seconda corsa |
| 4 | inquadra-273 | parte 13 rossa su Actions (lì verde: 8,3%) | **VERDE** (uscita 0) | 661 s | scene aeree 2: eroe fuori 0/57 fotogrammi (0,0%, tetto 20%) · altre scene 0/229 · h mediana aeree 0,056. Lo script `--guardiano` esegue il solo braccio verde | non applicabile (verde sul banco) |
| 5 | difesa-220 | «non concluso» nella R1 (tetto 30 min) | **VERDE** (uscita 0), concluso dentro il tetto di 60 min | 3277 s | enumerazione: verde 0 «press» su 1800 azioni, rosso 1122 su 1800 · verde: 4 scene, 0 «press», gesti slide 2 + lunge 2, distanza minima 6,3/1,9/5,9/2,2 u · rosso `__CPM_NO_GESTO220`: 2 «press» su 4 scene. Nota: nel braccio verde il seme 1234 chiude in fase `playing` (gli altri in `ceremony`); lo script non lo giudica | non applicabile (verde sul banco) |
| 6 | gol-eroe-154 | «non concluso» nella R1 (tetto 30 min) | **NON CONCLUSO** anche col tetto di 60 min → per regola vale **ROSSO (non giudicato)** | interrotto a ~3600 s | 17 partite misurate su 20 (10 casi × verde/rosso, due per volta, 340-480 s a partita): k1…k8 completi nei due bracci, k21 solo verde; mancano k21 rosso, k22 verde, k22 rosso. Lo script è stato chiuso mentre giocava k22 verde («browser has been closed»), quindi non ha stampato il suo giudizio | **non accertato**: nessuna riesecuzione su `lavoro/198` (vedi limiti) |

## Verdetto

**Cinque controlli su sei sono VERDI sul banco su `prova/198-finale` (0f0b13d8); uno, `gol-eroe-154`, resta NON CONCLUSO anche a 60 minuti e per regola conta come rosso (non giudicato).** Nessun rosso misurato nasce in modo accertato dall'unione: non c'è stato alcun rosso «di merito» da ribaltare su `lavoro/198` (b3b75b9d), quindi nessun giro `__CPM_NO_G293…G302` è stato messo alla prova.

### Parte a) — parte 13 della corsa 44830113928

Dal registro di GitHub Actions (job «parte 13 di 16», id 136612891181, commit 2d8f68dc su `prova-ci/198-finale`, macchina 4 cpu · 15,6 GB) risulta che dei quattro controlli assegnati **solo `chiusura-99` era rosso lì**; `fila-227` (401 s), `rinvio-252` (260 s) e `inquadra-273` (477 s, 8,3%) erano verdi anche su Actions. La parte è fallita per `chiusura-99` (gli altri due controlli della parte, `portiere-223` e `tunnel-245`, lì risultano verdi: sono seguiti da altri e qui non li ho eseguiti).

- **chiusura-99**: su Actions il rosso era nel braccio **verde D9** (contrasto del nome del marcatore): scena gi42, colore `#dc2626`, «locale 21 · quadro 2,29», sotto la soglia 3; gli altri cinque gol fra 4,31 e 5,59. Sul banco la stessa scena misura «locale 21 · quadro 5,00» e il controllo è verde (mediana 5,08, zero sotto 3). Stessa scena, stesso colore, misura «quadro» diversa fra le due macchine (2,29 contro 5,00): il controllo è da considerare **instabile fra banco e Actions**. La causa non è accertata: non posso confermare se dipenda dalla macchina di Actions o dal commit `prova-ci/198-finale` (2d8f68dc, che non ho confrontato con 0f0b13d8).
- **rinvio-252**: verde. Il braccio rosso è debole come da storia (PO-271): una sola scena supera i 40 u/s (gi36 42,7; gi35 resta a 38,7). Numeri identici a quelli della corsa su Actions. Riportato com'è.
- **fila-227**, **inquadra-273**: verdi, senza note.

### Parte b) — «non conclusi» della R1

- **difesa-220**: si conclude **verde** in 3277 s (54,6 min): col tetto di 30 minuti non poteva finire (otto partite, 5-10 minuti l'una). Margine sul tetto di 60 minuti: circa 5 minuti.
- **gol-eroe-154**: non si conclude nemmeno in 60 minuti (20 partite a due per volta; stima a ritmo misurato: circa 70 minuti). Nelle 17 partite stampate non vedo violazioni delle regole del braccio verde che ho potuto leggere dal registro (registrato = pagella in tutte; nelle partite con rigore provocato all'eroe il contatore `g154` sale nel verde e resta fermo nel rosso; «eroe fluido gol» 0 nel verde e 1 in quattro partite del rosso: k1, k4, k5, k6). **Questo non è un giudizio**: il giudizio lo dà lo script alla fine e non è stato emesso; mancano proprio k21 rosso e k22, che lo script dichiara casi-testimone del rosso.

### Limiti dichiarati

1. **Tetto di tempo superato.** Il lavoro è durato circa 3 ore e 15 minuti contro il tetto di circa 2,5 ore: i due controlli della parte b) hanno consumato da soli quasi due ore (54,6 + 60 minuti).
2. **Seconda corsa di `chiusura-99` non eseguita.** La regola «instabili: due corse» la chiedeva (verde sul banco, rosso su Actions); una corsa dura circa 35 minuti e non c'era più tempo. Resta da fare.
3. **`gol-eroe-154` non rieseguito su `lavoro/198`.** Il suo rosso è un «non concluso» per tempo, non una misura fallita: una riesecuzione sulla base avrebbe richiesto almeno altri 60-70 minuti. Non posso quindi dire se la lentezza nasca dall'unione.
4. **Riga `FINE` assente** nel registro di `gol-eroe-154`: l'interruzione coincide col tetto di 3600 s (avvio 02:16, chiusura del browser 03:16:10) ma l'uscita del comando non è stata registrata.
5. I registri completi delle corse stanno nella cartella temporanea della sessione e non sono nel repository; i numeri della tabella sono trascritti da lì.

### Cosa serve per chiudere

- `gol-eroe-154` con tetto di almeno 90 minuti (oppure in due metà con la variabile `K` dello script, es. `K=1,2,3,4,5` e `K=6,7,8,21,22`).
- Seconda corsa di `chiusura-99` sul banco e confronto della scena gi42 sul commit usato da Actions.

Nessun file di gioco toccato, nessuna foto in `docs/` rigenerata dai controlli (albero pulito dopo ogni corsa), `GAME_VERSION` invariata.
