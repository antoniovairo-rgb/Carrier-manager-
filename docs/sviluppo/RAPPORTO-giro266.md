# Rapporto giro 266 — `gigante-212`: la festa a fine partita viene giudicata sempre

Ramo `sviluppo/giro266-festa-giudicata`, partito da `lavoro/197` (che contiene il giro 261). Versione del gioco invariata
(7.999.197): **il gioco non è stato toccato**, ho cambiato solo la sonda `tests/visual/gigante-212.mjs`. Tutte le misure sono del
banco di prova (sessione cloud, Chromium headless, GLB acceso), nessuna è del telefono.

## Il difetto (dal giro 261)

Lo scenario `festa-vera-tel` gioca la partita del provino fino al fischio e misura i corpi della festa che ne nasce. La festa nasce
solo da una partita **vinta** (`src/15`, `_goEndOrCeremony`: `_vinta && (_imp23 || _super23)`; le statistiche dell'eroe sono già
iniettate dalla sonda con `__CPM_FESTA942_FORCE`, il risultato no). Il risultato della partita non è riproducibile: quando è persa la
fase va a `ended`, la scena ha 0 fotogrammi e il guardiano dice «non giudicata» = rosso. Difetto dello strumento, non del gioco.

## Cosa ho cambiato (solo la sonda)

In `festaVera()`, dentro il giro d'attesa del fischio (uno ogni 600 ms): se la squadra dell'eroe non è avanti di almeno 3 nel
tabellone logico, la sonda chiama **`__CPM_SALTA297(minuto attuale, avversario+3, avversario)`**. È un gancio di collaudo **già
esistente** (giro 92, PO-297), montato solo quando l'indirizzo ha `?cpmtest=1` (blocco `useEffect` di `src/15` intorno alla riga
3452): per i giocatori non esiste. Il minuto resta quello vero, il fischio resta quello vero della partita: la sonda porta il
punteggio come già portava le statistiche. Margine 3 perché fra due giri l'avversario non segna tre gol.

Il registro della sonda ora stampa al fischio: tabellone, quante volte la vittoria è stata provocata, e cosa ha deciso la festa
(`__CPM_FESTA942`). Prima diceva solo la fase.

Tre interruttori **di sola misura** (nessuno entra nella catena):
- `CPM_NO_VITTORIA266=1` — la sonda di prima (misura del «prima»);
- `CPM_PERDI266=1` — la sonda provoca la **sconfitta**: è il caso del giro 261 a comando, la scena deve uscire «non giudicata»;
- `CPM_PERDI266=1 CPM_PERDI266_FINO=80` — sconfitta provocata fino all'80', poi la correzione: la sonda deve recuperare una partita persa.

Nessun gancio nuovo nel gioco, quindi **nessun rosso `__CPM_NO_G266`**: il braccio che riporta il difetto è `CPM_PERDI266=1`
(lato sonda). Soglie invariate (`CPM_MINF` 8, stature, quota, near).

## Misure

Scena sola (`CPM_SCENARI=festa-vera-tel`), una corsa alla volta.

| Braccio | Corse | Giudicate | Tabelloni al fischio | Esito |
|---|---|---|---|---|
| prima (`CPM_NO_VITTORIA266=1`) | 5 | **5 su 5** | 1-0 · 2-0 · 2-0 · 2-0 · 2-1 | verdi |
| sconfitta provocata (`CPM_PERDI266=1`) | 1 | **0 su 1** | 2-5 → fase `ended` | rosso «NON GIUDICATA (0 fotogrammi)» — il rosso del giro 261 |
| dopo (vittoria provocata) | 5 | **5 su 5** | 4-0 · 6-0 · 6-0 · 3-0 · 5-1 | verdi (98–132 fotogrammi, statura 1,54–1,89 m) |
| sconfitta fino all'80', poi vittoria provocata | 1 | **1 su 1** | 7-4 | verde (128 fotogrammi) |

**Onestà sul «prima»:** in questa sessione le cinque partite non provocate sono state **tutte vinte**, quindi non ho riprodotto
spontaneamente il rosso del giro 261 (che su cinque corse ne aveva perse tre). I margini erano stretti (1-0, 2-1) e i tabelloni
diversi fra corsa e corsa: il risultato continua a non essere riproducibile. La dipendenza della scena dal risultato l'ho mostrata
provocando la sconfitta (riga 2); che la correzione la tolga lo mostrano le righe 3 e 4. In tutte le corse «dopo» la vittoria è
stata provocata **una volta sola**, al primo giro (da 0-0 a 3-0); il resto dei gol è della partita.

## Controlli

Uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, memoria e disco controllati prima (≈13–14 GB liberi, 29 GB di disco).

| Controllo | Esito | Durata | Note |
|---|---|---|---|
| `gigante-212` corsa 1 | **verde** + rosso visto | 16 min 16 s | 12/12 scene giudicate; festa-vera 6-0, 105 fotogrammi; rosso: 3 corpi fino a 27,08 m |
| `gigante-212` corsa 2 | **verde** + rosso visto | 17 min 34 s | festa-vera 5-0; rosso: 3 corpi fino a 27,14 m |
| `gigante-212` corsa 3 | **verde** + rosso visto | 17 min 21 s | festa-vera 3-0; rosso: 3 corpi fino a 27,14 m |
| `test:logic` | **verde** | 2 s | 51 pass, 0 fail |
| `save-compat` | **verde** | 9 s | 12 pass, 0 fail |
| `serata-261` | **verde**, e il rosso `__CPM_NO_G261` cade su A, B e C | 6 min 3 s | |
| `tpose-196` | **verde**, e il rosso atteso `__CPM_NO_G196` si vede | 32 min 4 s | 0 T-pose, 0 corpi non CGTrader, 0 procedurali; supera i 20 minuti ma è nella consegna |

Mappa mirata (`ci-runner.mjs`, regola PO-504 A): la mappa va da file di `src/` a guardiani; non ho toccato `src/`, quindi non
aggiunge nulla. Non ho eseguito altro. `build-src`/`check-src`: non necessari (nessun `src/` toccato); `check-src` all'avvio dava
il file allineato a HEAD.

`gigante-212` e `tpose-196` rigenerano foto di altri giri in `docs/sviluppo/`: le ho rimesse con `git checkout --` e non sono nel commit.

## Incrocio col giro 264

Il giro 264 (in corso) rende la partita deterministica rispetto al tempo reale. La correzione di questo giro ci passa sopra senza
conflitti di file (tocca solo la sonda), ma c'è un punto da sapere: la sonda interviene a **tempo reale** (giro d'attesa di 600 ms),
quindi il minuto in cui il tabellone passa a 3-0 dipende dall'orologio della sonda. Nelle undici corse «dopo» è sempre successo al
primo giro, a partita appena partita, ma non l'ho misurato in minuti. Se il giro 264 rende riproducibile la partita, questa sonda la
rende di nuovo dipendente dal momento dell'intervento — per il giudizio della festa non conta (la vittoria è garantita comunque).

## Dubbi per il PO

1. **La partita della festa non è più «naturale».** Con la vittoria provocata la scena misura la festa nata dal fischio vero di una
   partita il cui punteggio è stato portato dalla sonda (come già le statistiche). Il gioco decide la festa con le sue regole sul
   punteggio che trova; ciò che non viene più provato da questo scenario è che una partita vinta **giocando** produca la festa. Se
   serve anche quella prova, va in un controllo a parte, che accetti «persa → nessuna festa» come esito legittimo.
2. **Nota automatica PO-216.** Al fischio il gioco annota in `cpm-bugnotes` quando tabellone e tabellino del motore non coincidono;
   portando il punteggio dalla sonda i due divergono, quindi è probabile che nella pagina di prova venga scritta quella nota. Resta nel
   `localStorage` del contesto di prova, che la sonda chiude. **Non l'ho misurato.**
3. **Il «prima» non ha riprodotto il rosso** (5 vinte su 5, sopra). Il rosso l'ho provocato con `CPM_PERDI266`; non posso
   confermare con quale frequenza la partita di prova si perda oggi su questa build.
4. **Le tre corse intere sono durate 16–18 minuti** ciascuna, dentro la regola dei 20 minuti; la prova del rosso (secondo comando)
   è inclusa in quel tempo.
