# G6 — La griglia mobile raggiunge la partita viva

Build **c044527** (HEAD del ramo `grafica/overhaul-2026-09` al momento della corsa) · sonda `tests/visual/griglia-mobile.mjs` · seme `4242` · larghezza **412 px** (quella del PO, unica misurata: `CPM_LARG=412`) · `CPM_PARTITA=1`.

**Dichiarato:** e' **Chromium headless** alla taglia del telefono, **non un Android vero**. Vedi "Cosa NON e' verificato" in fondo.

## Il problema e la correzione (tocca solo lo strumento, non `src/`)

Nelle corse precedenti (vedi `g26-partita/`) le due schermate di partita non venivano MAI raggiunte, o venivano raggiunte per un pelo:

- **partita-gioco** aspettava `__CPM_MS().min >= 8`. Sotto `__CPM_AUTOPLAY(true,{policy:'seeded'})` quel campo resta **null** per tutta la partita (causa gia' isolata da un'altra squadra, non toccata qui): l'attesa scadeva sempre a 240 s.
- **partita-scelta** aspettava la fase `hl_choose`, ma sotto autoplay quella fase dura **un solo tick** (300 ms, r.1500-1528 di `src/15-live-match.jsx`, letto SOLO in lettura): l'intervallo che ce la fa vedere e' lo stesso che, al giro dopo, la richiude gia' risolta.

Corretto in `tests/visual/griglia-mobile.mjs` (nessun file `src/` toccato):

1. **partita-gioco** ora legge `__CPM_CLOCK()` (il minuto del ref di `LiveMatch`, sempre popolato — r.1465), con `__CPM_MS().min` come ripiego se `__CPM_CLOCK` non ci fosse. Raggiunto il minuto 8, l'autoplay si spegne (`__CPM_AUTOPLAY(false)`) prima di misurare, cosi' la schermata non cambia sotto la misura; si riaccende subito dopo per portare la partita fino alla scelta.
2. **partita-scelta** ora polla la fase ogni **50 ms** (non piu' a polling di default) e, al primo `hl_choose`, spegne l'autoplay e misura **subito**, senza l'attesa normale di "testo fermo": anche da autoplay spento vive un secondo timer INDIPENDENTE — l'auto-contrasto del difensore (r.7946-7963), 4-9 s secondo la distanza — che chiude comunque la scelta da solo. La larghezza viene ricontrollata al volo: se la fase e' gia' scaduta la sonda si ferma li' e lo dichiara, invece di riportare una schermata sbagliata come se fosse quella giusta.
   Cercato nel sorgente un modo per FERMARE la scelta (`__CPM_HOLD` o simile): **non esiste**. L'unica leva disponibile e' `paused` (tasto P), scartata perche' mette un velo scuro sopra la scena (r.7830, r.8927) — misurerebbe la schermata di PAUSA, non quella della scelta.
   Se `hl_choose` non arriva entro 150 s, la sonda accetta la fase piu' vicina fra `hl_move`/`hl_intro` e lo dichiara nel report — **non e' successo in nessuna delle due corse qui sotto**: `hl_choose` e' stata raggiunta e misurata direttamente in entrambe.

## Risultato delle corse (tentativo 1 su 3 concesso, sono bastati)

| corsa | comando | esito | fase misurata (scelta) |
|---|---|---|---|
| chiaro | `CPM_PARTITA=1 CPM_LARG=412 CPM_FOTO=1 CPM_OUT=.../g6-partita` | **exit 0**, `saltate: []`, `errori: []` | `hl_choose` |
| scuro | `CPM_PARTITA=1 CPM_LARG=412 CPM_FOTO=1 CPM_TEMA=scuro CPM_OUT=.../g6-partita-scuro` | **exit 0**, `saltate: []`, `errori: []` | `hl_choose` |

Entrambe le schermate di partita sono state raggiunte e misurate in **entrambi** i temi, senza salti ne' errori di pagina.

## I numeri (412 px)

### Partita · HUD in gioco (minuto ≥ 8, MAI misurata prima d'ora)

| grandezza | chiaro | scuro |
|---|---:|---:|
| overflow orizzontale | 0 px | 0 px |
| elementi fuori schermo (contenuti) | 0 (0) | 0 (0) |
| testo sotto i 10 px (sotto/totale, minimo) | 2/41 (9,5 px) | 2/39 (9,5 px) |
| contrasto sotto soglia WCAG (sotto/misurati, esclusi gradiente) | 6/18 (23) | 4/18 (21) |
| bottoni pieni di marca | 0 | 0 |

Peggiori esempi di contrasto in **chiaro**: `#babdc1` su `#939598` (1,60:1, la freccia "›" del breadcrumb), `#e9edf1` su `#939598` (2,57:1, "GRA" — l'abbreviazione del cognome nel tabellone). In **scuro** il peggiore resta lo stesso tipo di coppia (badge/etichette su grigio medio), con un caso in meno (4 invece di 6).

### Partita · HUD con la scelta (fase `hl_choose`)

| grandezza | chiaro | scuro | g26 (baseline, chiaro, fase incerta) |
|---|---:|---:|---:|
| overflow orizzontale | 0 px | 0 px | 0 px |
| elementi fuori schermo (contenuti) | 0 (0) | 0 (0) | 0 (0) |
| testo sotto i 10 px (sotto/totale, minimo) | **0/42 (10 px)** | **0/42 (10 px)** | 9/26 (7 px) |
| contrasto sotto soglia WCAG (sotto/misurati, esclusi gradiente) | 10/22 (20) | **0/22 (20)** | 3/6 (20) |
| bottoni pieni di marca | 0 | 0 | 0 |

## Confronto con G26 (`$SCR/g26-partita`, non nel repo)

- **Il minimo di 7 px e' sparito**: G4.1 (i 44 corpi 7-9 px portati a 10 in `15-live-match`) qui non era mai stato verificato IN PARTITA — questa e' la prima misura che lo conferma sulla scena viva: `minFs` passa da **7 a 10**, `nPiccoli` da **9/26 a 0/42** in entrambi i temi.
- **I nodi di testo misurati salgono da 26 a 42**: non e' un peggioramento, e' che la corsa precedente catturava una schermata di `hl_choose` con MENO elementi a video (verosimilmente un momento diverso della stessa fase, o una situazione con meno azioni proposte) — i 26 nodi del g26 sono un sottoinsieme plausibile dei 42 di oggi, non un calo di contenuto.
- **Contrasto**: in **chiaro** il rapporto sotto soglia passa da 3/6 (50%) a 10/22 (45%) — sostanzialmente stabile in proporzione, ma con l'universo misurabile quasi quadruplicato (22 nodi contro 6) i problemi ASSOLUTI restano a due cifre e vanno letti come tali, non liquidati come "meno della meta'". In **scuro** il tema scuro azzera i sotto-soglia sulla scelta (**0/22**): il fondo scuro degli overlay lascia piu' margine ai testi chiari usati li'.
- **partita-gioco non ha un g26 con cui confrontarsi**: la corsa attuale e' la PRIMA misura mai fatta di questa schermata.

## Cosa NON e' verificato

- **Chromium 412×915 headless, non l'Android vero del PO**: restano fuori il rendering dei font di sistema Android, il tocco, la GPU, le prestazioni, la barra di sistema, il ritaglio del notch.
- **Una sola larghezza (412 px)**: le altre quattro taglie della griglia (360/375/390/430) non sono state misurate in partita in questa corsa — solo fuori partita lo sono, nelle corse G0/G5.
- **Una sola partita, un solo seme (4242), autoplay a `tickMs:300`, policy `seeded`**: i numeri sono di UNA gara giocata dal pilota automatico, non una media su piu' partite. Un'altra gara (altro seme, altra sequenza di occasioni) puo' mostrare un'altra combinazione di testi e colori nell'HUD in gioco e nella scelta.
- **La fase misurata per "scelta" e' `hl_choose` in entrambe le corse di questo giro** — ma lo strumento accetta anche `hl_move`/`hl_intro` come ripiego quando `hl_choose` non arriva in tempo: chi rilegge questo report in futuro deve controllare la colonna "fase misurata" di quella corsa, non dare per scontato che sia sempre la scelta vera.
- **Il minuto esatto di gioco al momento dello scatto di "partita-gioco"** non e' registrato dalla sonda (solo la soglia "raggiunto o no" a >= 8): non si sa se era l'8', il 15' o oltre.
- **L'autoplay viene spento e riacceso fra le due schermate**: il generatore pseudo-casuale della policy `seeded` riparte dal seme ad ogni riaccensione, quindi la sequenza di occasioni dopo il minuto 8 non e' identica bit-per-bit a quella di una partita giocata con autoplay sempre acceso — resta comunque deterministica a parita' di seme e di questa stessa sonda.
- **Il timer reale di auto-contrasto (4-9 s) e la finestra di misura**: la sonda si e' fermata "in tempo" in entrambe le corse di questo giro, ma non e' garantito che accada sempre — su una macchina piu' lenta o con un difensore piu' vicino (delay 4 s) la finestra si restringe.

## File allegati

- `chiaro/dati.json`, `chiaro/partita-gioco.png`, `chiaro/partita-scelta.png` — corsa in tema chiaro.
- `scuro/dati.json`, `scuro/partita-gioco.png`, `scuro/partita-scelta.png` — corsa in tema scuro.

I `REPORT.md` e `dati.json` completi delle due corse (tutte le 15 schermate, non solo le due di partita) restano nello scratchpad (`$SCR/g6-partita/` e `$SCR/g6-partita-scuro/`), non nel repository: qui sono copiati solo i due file di dati di partita e i quattro scatti, come richiesto.
