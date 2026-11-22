# Verifica 202 bis — due rossi nuovi e tre non giudicati del treno 45010544455

Treno: corsa 45010544455 su `lavoro/201` = `482a4cc0` (punta). Confronto: `2d692835` (primo treno della 202, verde su questi cinque).
Banco: sessione cloud, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, comandi npm dei guardiani, `git worktree` per ogni commit.
Le due basi hanno girato **in parallelo** (carico voluto: e' cosi' che i difetti di tempo si sono riprodotti in locale).
Ramo: `sviluppo/verifica202b-rossi` (da `lavoro/201`). Non toccati: `src/`, `GAME_VERSION`, `docs/governo`.

## L'ipotesi del nome di ripiego: scartata (misurata)

Fra `2d692835` e `482a4cc0` il giro 320 cambia in `src/` solo: il nome di ripiego dell'intro (`EROE_INTRO_320`), il suggerimento
del campo Nome, la didascalia dell'intro e la coppia «giovanni pisano» in `_CR_FULLNAMES`.
- **Le cinque sonde fissano tutte il nome dell'eroe** («Collaudo Zona G», «Attesa32», «Sim Trainer», «Collaudo Settimana»): il
  nome di ripiego non entra mai nel loro seme di partita.
- `_CR_FULLNAMES` e' letto anche da `generateTeamRoster` (una coppia vietata cambia cognome). Misurato con una sonda che genera tutte
  le rose (CLUBS + U18, stagioni 1-12: **3.240 rose**) sui due commit: **identiche**; «Giovanni Pisano» non compariva in nessuna rosa.
- `src/12` (dove vive il testimone di `attesa-difesa`) non e' cambiato fra i due commit.

Conclusione: **nessuno dei cinque e' una regressione del gioco**.

## Tabella

| guardiano | treno 45010544455 | banco 482a4cc0 (sonda originale) | banco 2d692835 (sonda originale) | sonda corretta su 482a4cc0 | conclusione |
|---|---|---|---|---|---|
| `squalifica-222` | rosso: «coppa iniettata in **W10**», bracci `sano-coppa`/`squalificato-coppa` mai allineati (non giudicati) | verde 2/2 (W9) | verde 1 · **rosso 1, stesso messaggio del treno (W10)** | verde 2/2 (W9) · rosso `CPM_ROSSO=1` cade (9 controlli) | **(b)+(c) INSTABILE, difetto della sonda — corretta** |
| `attesa-difesa` | rosso: «nessun corpo in attesa quando non deve (0 · **20**)» | verde 1 · **rosso 1, stesso messaggio del treno (0 · 20; avversari 30 su 573)** | rosso 1 (attacco: 12 campioni < 20) · verde 1 | verde 2/2 (sbagliati 0 · 0) · rosso `CPM_RED=1` cade (4 controlli, come l'originale) | **(c) INSTABILE, difetto della sonda — corretta** |
| `meta-conto-265` | non giudicato: «bilancio della parte esaurito prima della partenza» (0 s) | verde 2/2 · 26 s, 25 s | verde 2/2 · 25 s, 26 s | — | **(d) solo-runner / tetto della parte** |
| `trainer-288` | non giudicato, stesso motivo | verde 2/2 (col rosso `CPM_PROVA_ROSSO=1`) · 10 s, 11 s | verde 2/2 · 11 s, 11 s | — | **(d) solo-runner / tetto della parte** |
| `simulata-272` | non giudicato, stesso motivo | verde 2/2 · 8 s, 8 s | verde 2/2 · 8 s, 9 s | — | **(d) solo-runner / tetto della parte** |

Nota sui giri: il primo giro di 482a4cc0 e' nella cartella principale; il secondo giro con le sonde **originali** e' su un worktree
pulito di 482a4cc0 (`nuovoorig`), perche' il secondo giro partito nella cartella principale si e' sovrapposto alla correzione e non
vale come giro originale.

## Per ciascuno

### squalifica-222 — scansione delle settimane a 250 ms fissi (corretta)
Misura: la sonda cerca la prima settimana senza partita (`WE`, dove inietta la coppa) facendo `patch({week:w})` e leggendo
`thisWeekMd()` **250 ms dopo**. Se la pagina non ha ancora applicato la settimana, la lettura e' quella della settimana precedente:
`WE` esce 10 invece di 9, la coppa viene iniettata sopra una partita di lega, «Simula» gioca la lega (`cup:false` nello storico) e la
settimana non avanza (resta la coppa) → bracci coppa «non giudicati». Prova del meccanismo (sonda di scansione, stessa pagina nuova
per ogni modo): letta **sull'evento** `WE=9`; letta **a 0 ms** `WE=11` (ogni lettura indietro di 1-2 settimane: `2:lega@1 3:lega@2 …`);
a 250 ms in locale scarico `WE=9`, sul runner e sul banco carico `WE=10`. E' la stessa classe corretta in `svincolato-264` nella
verifica 202.

Correzione (solo `tests/visual/squalifica-222.mjs`): (1) nella scansione si legge `thisWeekMd()` nella stessa valutazione di
`snapshot()` e solo quando `snapshot().week === w` (tetto 10 s, oltre: rosso «scansione cieca»); (2) dopo l'iniezione della coppa si
attende che la partita della settimana sia la coppa iniettata (tetto 10 s); se non lo e', il braccio esce rosso («non giudicato»)
invece di giocare la lega. Nessuna soglia toccata.

### attesa-difesa — finestra di 9 s fissi contro una dissolvenza in fotogrammi (corretta)
Misura: il testimone `__CPM_ATTESA32` (src/12 `_attesa32`) conta i corpi in posa d'attesa; la posa sfuma con passo `aDt*3` con `aDt`
tappato, quindi la coda della scena precedente dura un numero di **fotogrammi** (~2-3), non di secondi. La sonda azzerava il
testimone all'avvio della scena e misurava per **9 s fissi**, ammettendo la coda fino al 3% dei campioni: con pochi fotogrammi
(runner lento, banco carico) la coda — ~10 avversari x 2 fotogrammi = **20 campioni** — supera il 3% (treno: 0 · 20; banco
482a4cc0: 20 sbagliati, 30 avversari su 573). Il secondo modo di fallire (banco 2d692835: 12 campioni d'attacco contro 20) viene
dalla stessa finestra fissa capitata mentre i corpi correvano (`idle.weight` basso).

Correzione (solo `tests/visual/attesa-difesa-test.mjs`): (1) la coda si **esclude** invece di tollerarla — il testimone si riazzera
dopo 0,5 s **e** almeno 12 fotogrammi di scena (campioni >= 12 x 22 corpi), quando la dissolvenza e' finita; (2) si osserva almeno
9 s come prima e poi fino a quando la squadra che deve aspettare arriva alla soglia, tetto 40 s. Soglie invariate (20 campioni,
coda <= 3%). Il rosso `__CPM_NO_ATTESA32` resta rosso con lo stesso esito dell'originale (testimone nullo, 4 controlli).

### meta-conto-265 · trainer-288 · simulata-272 — non partiti nel treno
Nella parte 02 del treno `highlight-95` ha impiegato **6.016 s** contro i 3.600 s stimati in `docs/governo/DURATE-GUARDIANI.json`
(massimo sul runner registrato finora 4.940 s); la parte e' durata 10:04→11:54 contro ~69 min attesi e il bilancio era esaurito
prima che i tre partissero (`ci-treno-308.mjs`: «bilancio della parte esaurito prima della partenza», 0 s). Sul banco durano 8-28 s
(tetti del runner registrati: 29 s, 13 s, 9 s) e sono verdi 4/4 su entrambi i commit. Proposta (non fatta qui, e' governo): portare la
durata di `highlight-95` in `DURATE-GUARDIANI.json` al valore misurato (~6.000 s), cosi' il taglio in parti gli da' una parte sua e i
guardiani brevi non finiscono dietro di lui. `highlight-95` non e' stato eseguito (vietato in questa verifica).

## Conclusione
- `squalifica-222`, `attesa-difesa`: **controlli instabili per attese a tempo fisso**, riprodotti in locale con lo stesso messaggio
  del treno anche sul commit verde `2d692835`; sonde corrette sul ramo, verde 2/2 e rosso che cade.
- `meta-conto-265`, `trainer-288`, `simulata-272`: **solo runner**, non partiti per il bilancio della parte consumato da `highlight-95`.
- Nessuna regressione del gioco dal giro 320.
