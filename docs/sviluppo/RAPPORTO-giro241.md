# RAPPORTO giro 241 — PO-506 «eroe sempre in quadro» + gi55 «Stacco sul palo lontano»

Ramo `sviluppo/giro241-camera-eroe`, partito da `lavoro/197` (9a5d8a6). Versione di riferimento 7.999.197 (`GAME_VERSION` non toccata).
Rosso unico del giro: `window.__CPM_NO_G241`. Guardiano nuovo: `npm run camera-241`.

Tutti i numeri di questo rapporto vengono da strumenti eseguiti in questa sessione (headless, GLB acceso, viewport 412×915); dove un
numero non l'ho potuto misurare lo dico.

## 1. Che cosa ho misurato prima di correggere

**Strumento.** `tests/visual/misura-241.mjs` + `lib/camera-241.mjs`: provoca un'azione non difensiva dell'eroe con esito fallito e
legge il testimone `window.__CPM_G241W` (un campione per fotogramma, tempo di scena, stacco nero). Il catalogo conta **483 azioni**
(tiro 278, passaggio 161, cross 39, dribbling 5). A 25-38 s l'una, tutte e 483 su due bracci sono circa 7 ore: **non le ho misurate
tutte** (vedi dubbio 6). Ho misurato una azione ogni dodici del catalogo (41 azioni: tiro 24, passaggio 15, cross 2) nei due bracci,
più le azioni nominate dalla consegna (gi30, gi6, gi55) a parte.

**Dove finisce la scena.** Sotto forzatura la scena non avanza da sola (`handleContinue` esce alla prima riga), quindi resta in
`hl_result` anche oltre il punto in cui il gioco la chiuderebbe. Ho aggiunto un segno di sola prova (`__CPM_FINE241`) nel punto in cui
il gioco vero chiude la scena (finestra d'esito + attesa della scena, 7.461): si giudica fino a lì. Il banco del giro 226 osservava
5-7 s fissi, quindi comprendeva fotogrammi che il giocatore non vede.

**La scoperta del giro: le camere sono due.** Dal giro 96a il fotogramma **disegnato** viene corretto all'ultimo (blocco «QUADRO
DELL'EROE», `src/12`): ruota la camera sul posto e allarga l'ottica per tenere dentro l'eroe (piedi e testa, rampa fra 0,76 e 0,90
del semiquadro) e, sull'esito, il pallone (in quel caso l'eroe può arrivare a 0,93). Il testimone del giro 226 (`__CPM_G226W`) sta
**prima** di quella correzione: le «13 esecuzioni su 116 oltre il 15%» erano misurate sulla camera della **regia**, non sul quadro a
schermo. Misurando tutte e due:

| Prima della correzione (`__CPM_NO_G241`), 41 azioni fallite | valore |
|---|---|
| azioni con l'eroe in quadro in meno del 95% dei fotogrammi — camera della regia | **14 su 41** (5 sotto l'85%; minimo 76,8%) |
| fotogrammi con l'eroe fuori dal quadro della regia | 200 su 4.078 (4,9%) |
| azioni con l'eroe intero (piedi e testa) fuori dal fotogramma **disegnato** in più del 5% dei fotogrammi | 0 su 20 misurate con questa voce separata (vedi nota) |
| fotogrammi disegnati con l'eroe **sul bordo** (piedi o testa oltre 0,80 del semiquadro) | 10,8% in media; 15 azioni su 41 oltre il 15% |
| eroe e pallone insieme nel fotogramma disegnato | 96,9% in media |

Nota: la voce «eroe intero nel fotogramma disegnato» l'ho separata dalla voce «sul bordo» a banco già partito; nel braccio rosso è
misurata separatamente su 20 delle 41 azioni (tutte al 100%), nelle altre 21 le due voci sono sommate. Nel guardiano le due voci
sono sempre separate (§6).

Quindi, a schermo, **l'eroe non sparisce**: quando la regia lo perde resta schiacciato sul bordo del quadro, piccolo, mentre la scena
inquadra il pallone perso e l'avversario. È quello che si vede nelle foto del giro 226 (`docs/sviluppo/giro226/dopo-gi30k0-fail.jpg`,
da 1,05 s a 3,50 s) e nel foglio «prima» di questo giro (§7).

**«Eroe enorme in primo piano» (gi30, dubbio 12 del giro 226).** È lo stesso difetto. Quando il soggetto della regia passa al pallone
la camera gli va dietro in linea retta e sfila a 4-7 u dall'eroe; la correzione del fotogramma ruota sull'eroe che in quel momento è
vicinissimo. Misurato su gi30 fallito col rosso: altezza apparente dell'eroe fino a **0,34** del quadro dentro la scena e fino a
0,36 nei secondi dopo la chiusura (camera a 3,9 u dall'eroe); la taglia normale della regia è 0,12-0,19. Su gi6 «Stacco di testa»,
sulla camera della regia (misura fatta prima di spostare il testimone sul fotogramma disegnato), 1,6 volte il quadro. Nel banco del giro 226 l'eroe enorme compariva a 4,2 s perché la scena forzata
restava aperta oltre la sua chiusura (3,5 s): nel gioco vero a quel punto la scena è già finita. **Non posso confermare** se sul
telefono si vede anche dopo la chiusura della scena: nel gioco vero lì c'è lo stacco verso il gioco fluido, che da questo banco non
passa.

## 2. La causa

1. Sulle azioni fallite il pallone si allontana (tiro parato o fuori, passaggio intercettato, dribbling perso): la regia passa il
   soggetto al pallone (7.237/7.520/7.522) e spegne le reti che tengono l'eroe.
2. Il telefono in verticale ha un quadro largo 21-24 gradi: eroe e pallone a 15-40 u di distanza stanno insieme solo se l'asse
   eroe→pallone corre in **profondità**. Nelle azioni misurate la regia li guardava di lato (è il motivo del tempo passato sul bordo).
3. Il bersaglio della camera segue il pallone in linea retta: se l'eroe sta sulla strada, la camera gli passa addosso.

## 3. Che cosa ho cambiato

Tutto sotto `window.__CPM_NO_G241`, solo in `hl_result`, solo su azioni **non difensive** con esito **fallito**, mai in cerimonie,
rigori (lotteria e scena di sola visione del compagno, giri 249/257: `P.shootout`), replay, ingressi/uscite dalla panchina.

`src/12-three-match-view.jsx`:

- **Soggetto.** Su un'azione fallita dell'eroe il soggetto della regia resta l'eroe per tutta la scena (una riga nella macchina a
  stati del 7.520; l'esenzione difensiva del 7.482 resta com'è).
- **Eroe e pallone insieme** (posizione, prima del lerp di posizione). Dopo il gesto (arco o post-arco partito), a pallone oltre
  2,5 u dall'eroe (peso pieno a 6 u), la camera va **dietro l'eroe** sulla retta pallone→eroe: 14 u, 6,5 d'altezza (taglia ~0,13,
  quella decisa dal PO col 7.713). Ci arriva lungo un arco attorno all'eroe, e solo di quanto serve: la tolleranza dall'asse è
  calcolata dal triangolo camera-eroe-pallone (pallone a 5 u: 47 gradi, quasi nessuna rotazione; a 25 u: 18 gradi).
- **Mai attraverso l'eroe** (anche nella costruzione, prima del gesto): se il tratto camera→bersaglio passa a meno di 9 u dall'eroe,
  il bersaglio diventa un punto di passaggio a 10,8 u sul fianco.
- **Sguardo** (prima dell'arbitro d'inerzia, regola 7.521): a metà fra il busto dell'eroe e il pallone, con l'eroe mai oltre 0,55
  del semiquadro.
- **Rete finale** (dopo i lerp, solo `camLook`): per tutta la scena fallita, se nella vista resa il busto dell'eroe supera 0,66 del
  semiquadro (0,62 in verticale) lo sguardo ruota di quanto basta. Bersaglio e rete spingono dalla stessa parte (lezione 7.507).
- Testimone di sola prova `__CPM_G241W` (acceso da `__CPM_REC241` sotto `cpmtest`): misura sulla camera della regia e sul fotogramma
  disegnato. Nessuna allocazione per fotogramma fuori dal collaudo. Nessun sorteggio nuovo.

`src/15-live-match.jsx`:

- `esitoPalo241(kind, label)`: su «Stacco sul palo lontano» l'esito `post` diventa `wide` (§5), nel punto unico dell'esito
  (chokepoint M1: 3D, riquadro e cronaca leggono `_outKind`).
- Segno di sola prova `__CPM_FINE241` in `handleContinue` (fine vera della scena sotto forzatura).

Le scelte di regia del 7.482 (highlight difensivi) e del 7.505/7.713 (taglia) non sono toccate; la correzione del fotogramma del
giro 96a non è toccata. A pallone vicino all'eroe (prima del gesto, conduzione) la regia è quella di prima.

Tre cose provate e scartate durante il giro, con la misura:
- posizione scritta prima dell'arbitro d'inerzia (dopo il lerp di posizione): cambiava solo lo sguardo, la camera tagliava ancora per
  l'eroe a 4,3 u;
- bersaglio dell'arco a raggio fisso: inseguendolo la camera stringeva l'orbita fino a 4,9 u (ora il bersaglio sta sulla tangente);
- passata accesa anche sul pallone in arrivo (cross verso l'eroe): girare dietro a un pallone che arriva lo buttava fuori (gi6).

## 4. Misure prima / dopo

**Banco, 41 azioni fallite (una ogni dodici del catalogo), stesse azioni nei due bracci**, «dopo» misurato sul build finale
(`tests/visual/out/camera-241/rosso-0di12.json` e `verde-finale-0di12.json`, non versionati):

| | prima (`__CPM_NO_G241`) | dopo |
|---|---|---|
| azioni con eroe in quadro (regia) sotto il 95% | 14 su 41 | **0 su 41** |
| di cui sotto l'85% | 5 | 0 |
| fotogrammi con l'eroe fuori dal quadro della regia | 200 / 4.078 (4,9%) | 0 / 4.100 |
| azioni con l'eroe intero fuori dal fotogramma disegnato in più del 5% dei fotogrammi | 0 (su 20, vedi nota al §1) | 0 su 41 |
| fotogrammi disegnati con l'eroe sul bordo (media) | 10,8% | 2,3% |
| azioni con l'eroe sul bordo in più del 15% dei fotogrammi | 15 | 1 (gi12 «Esterno a giro», 16%) |
| eroe e pallone insieme nel fotogramma disegnato (media) | 96,9% | 98,7% |
| pallone fuori dal fotogramma disegnato (media) | 3,1% | 1,3% |
| altezza apparente massima dell'eroe dentro la scena | 0,197 | 0,194 |

Per famiglia (regia sotto il 95%): tiro 10/24 → 0/24 · passaggio 3/15 → 0/15 · cross 1/2 → 0/2. Il dribbling puro (5 azioni nel
catalogo) non cade nella fetta del banco: è misurato dal guardiano (gi30, gi120, gi150 ×2, §6).

Una prima passata del braccio «dopo», su una stesura intermedia (senza «mai attraverso l'eroe» e con la rete finale accesa solo a
passata piena), aveva dato 1 azione su 41 sotto il 95% (gi48, 92,7%), 11 fotogrammi fuori su 4.171 e 3,8% sul bordo.

**gi30 «Dribbling centrale e conduci» fallito** (l'azione del dubbio 12): regia 48,8-50,6% nel guardiano (88,9-89,0% in due misure del banco) → 100% in tutte le misure fatte dopo la correzione (9);
eroe sul bordo 57-59% → 0-5% (16-19% nelle due corse con le foto, più lente); eroe e pallone insieme 55-58% → 83-100%; altezza
apparente massima 0,337-0,34 → 0,14-0,16.

**gi6 «Stacco di testa» fallito**: regia 70,6-80,5% → 100% (7 misure su 7 con la stesura finale; con le stesure intermedie restava a
88-93% in 5 misure su 9, ed è il motivo delle ultime due correzioni).

## 5. gi55 «Stacco sul palo lontano», esito palo

**Misura** (`tests/visual/misura-241-gi55.mjs`, 8 esecuzioni su pagina nuova, esito palo chiesto, prima della correzione):

- il colpo di testa parte da (34,7 · −16,3), quota 2,1: quasi dalla linea di fondo, e taglia tutto lo specchio;
- il bersaglio di partenza cade **sempre** dalla parte del palo lontano (z fra +6,1 e +8,6 su 8 esecuzioni): il lato non è
  sorteggiato, è sorteggiata solo la distanza;
- la scelta del palo del giro 223 prende già il palo libero quando c'è: **7 esecuzioni su 8** (palo +3,66 libero, pallone a 1,4-1,9 u
  dal portiere);
- **1 su 8**: il portiere sta più avanti (45,9 · −1,7 invece di 47,4 · −4,9) e **nessuno** dei due pali è libero (margini 1,07 e
  2,25 u contro i 2,6 richiesti): il pallone gli passa a **0,60 u** dal centro (dentro il corpo).

**Risposta alla domanda della madre**: un bersaglio seminato **non** fa evitare il portiere. Il difetto non dipende dal bersaglio di
partenza (che cade sempre dallo stesso lato) ma da dove sta il portiere quando parte il colpo di testa, e in quel caso nessun palo lo
evita. Ho quindi applicato l'alternativa decisa: **su quella scena l'esito «palo» si mostra come «fuori»** (stesso premio, stessa
chiave d'esito `miss`, stessa riga a tabellino: nessuna regola cambia). Il tiro fuori cerca già da solo un bersaglio lontano dal
portiere (giro 223).

**Dopo** (6 esecuzioni con esito palo chiesto): 6 su 6 mostrano «fuori», il pallone esce oltre il secondo palo a z fra +8,4 e +9,95 e
passa a 9,8-11,5 u dal portiere (6,5 u contando ogni quota). Nel guardiano: 3 su 3.

## 6. Guardiano `camera-241`

`npm run camera-241` (da `tests/visual`). Stesso strumento del banco. Durata misurata: 924 s (15 minuti e mezzo).

- **Campione dichiarato**: 4 azioni per famiglia prese a passo regolare dal catalogo + 8 testimoni (le peggiori del banco «prima»:
  gi109, gi89, gi16, gi61, gi182, gi142, gi30, gi6) = 22 azioni, tutte con esito fallito; gi55 azione 0 con esito palo × 3 su pagina
  nuova. La consegna chiedeva «tutte le azioni fallite»: tutte e 483 non stanno in un guardiano (dubbio 6).
- **Pretese per azione**: eroe in quadro in almeno il 95% dei fotogrammi (a) nella camera della regia e (b) sul fotogramma disegnato
  (piedi e testa dentro); (c) eroe mai oltre 0,35 del quadro in altezza. Stampa senza giudicare: eroe sul bordo, eroe e pallone
  insieme. gi55: in scena l'esito non è «palo» e il pallone non passa a meno di 0,7 u dal centro del portiere a quota ≤ 2 u.
- «Non giudicata» = rosso. Ripetizione dichiarata: un'azione rossa nel verde si rifà una volta su pagina nuova (verde alla
  ripetizione = «instabile», contata e stampata).
- **Braccio rosso** (`__CPM_NO_G241`, gli 8 testimoni + gi55 × 2): eroe fuori dal quadro della regia in almeno 3 testimoni, e gi55
  con l'esito «palo» in scena. Senza ripetizioni.

Esito sul build committato (`tests/visual/out/controlli-241/camera-241.log`):

- **Verde: 22/22**, instabili 0, rosse 0; eroe sul bordo 3,4% in media, eroe e pallone insieme 97,3%; gi55 3/3.
- **Rosso: 5 testimoni su 8** sotto il 95% (gi109 77,6% · gi89 70,0% · gi61 73,5% · gi30 48,8% · gi6 75,0%), eroe sul bordo 21,3% in
  media; gi55 «palo» in scena 2/2.
- Due corse precedenti dello stesso guardiano, a correzione non ancora completa, erano **rosse** (21/22: gi6 a 89,7% e 90,6% anche
  alla ripetizione): il guardiano ha trovato un difetto vero, corretto con le ultime due modifiche.

Limite dichiarato del braccio rosso su gi55: il pallone dentro il portiere compare 1 volta su 8, quindi il rosso giudica la
**condizione** del difetto (l'esito resta «palo») e non il sintomo.

Nelle catene `completa` e `carriera` di `ci-runner.mjs` compare una volta sola per catena, e una volta in ognuna delle voci di mappa
di `src/12` e nella prima di `src/15` (`node --check` pulito).

## 7. Foto prima / dopo

Cartella `docs/sviluppo/giro241/`. Ogni foglio è una sequenza della stessa azione fallita, col tempo di scena dal clic scritto su ogni
fotogramma (lo scatto è lento: il passo reale è 0,5-1 s, non regolare). «Prima» = `__CPM_NO_G241`.

| azione | prima | dopo |
|---|---|---|
| gi30 «Dribbling centrale e conduci» | `prima-gi30k0-fallito.jpg` | `dopo-gi30k0-fallito.jpg` |
| gi109 «Stop e tiro preciso» | `prima-gi109k0-fallito.jpg` | `dopo-gi109k0-fallito.jpg` |
| gi6 «Stacco di testa» | `prima-gi6k0-fallito.jpg` | `dopo-gi6k0-fallito.jpg` |

Che cosa si vede, guardandole (non è una misura):

- **gi30 prima**: a 0,58 s e 1,73 s il quadro è sull'avversario che ha preso il pallone (del protagonista si legge il cartellino in
  alto); a 2,78 s l'eroe è grande al centro del quadro, senza pallone; a 3,83 s ancora lui al centro, senza pallone.
  **gi30 dopo**: a 0,52 s l'eroe è sul bordo sinistro, tagliato; da 1,49 s a 3,54 s l'eroe sta in basso a sinistra e l'avversario col
  pallone in alto a destra, nello stesso quadro, a taglia normale.
- **gi109 prima**: a 1,63 s l'eroe è sul bordo sinistro, tagliato; da 3,58 s è al centro con gli avversari attorno, la porta non si
  vede. **gi109 dopo**: a 1,67 s l'eroe è ancora sul bordo sinistro, tagliato (**qui non c'è miglioramento**); da 2,63 s l'eroe sta
  in basso a sinistra con la porta, il portiere e il pallone in alto.

Durante le corse con le foto la pagina è più lenta e l'eroe sul bordo sale (dopo: 0-19% secondo l'azione; senza foto 0-5% su gi30
e gi6, 13% su gi109): vedi dubbio 4.

## 8. Controlli

Eseguiti uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), con `free -m` e `df -h` prima di ognuno (memoria
libera 13,5-15,1 GB, disponibile 15,2-15,5 GB; disco libero 28-29 GB), `mkdir -p tests/visual/out`, tutti sul build committato (`node tools/check-src.mjs`:
«allineato al file in git»). Log in `tests/visual/out/controlli-241/` (non versionati).

| Controllo | Esito | Durata | Riga finale del log |
|---|---|---|---|
| `camera-241` (nuovo) | ✅ verde | 15 min | «VERDE: 22/22 … gi55: 3/3 · ROSSO: … 5/8 testimoni … «palo» 2/2 · camera-241 VERDE (verde col verde, rosso col rosso)» |
| `dribbling-226` | ✅ verde | 15 min | «VERDE: 22/22 esecuzioni senza violazioni · instabili 0 · ROSSO: finta nel vuoto vista in 7/12» |
| `portiere-223` | ❌ **rosso** | 5 min | «ROSSO — 1 difetti: secondo-palo gi86 post: tuffo su un pallone largo (passa a 6,42 u, esce a 7,1 u dal centro)» |
| `scena3d-96` | ✅ verde | 24 min | «scene giudicate 31/31 · rossi per punto {} · errori di pagina 0 · scena3d-96 VERDE» |
| `esiti-96` | ✅ verde | 14 min | «VERDE OK: D1, D2, D3, B15, D6, D7, D12, D15, D14 · ROSSO ATTESO OK · esiti-96 PASS» |
| `gk-miss-229` | ✅ verde | 5 min | «VERDE — sui tiri sbagliati il portiere si muove verso il pallone prima che lo superi, e guarda uscire quelli lontani» |
| `test:logic` | ✅ verde | 3 s | «tests 51 · pass 51 · fail 0» |
| `save-compat` | ✅ verde | 9 s | «SAVE-COMPAT 12 pass · 0 fail · PASS» |
| `camera-252` (dalla mappa di `src/12`, in più) | ✅ verde | 4 min | «camera-252 VERDE (e il rosso vede il salto)» |
| `hero-in-frame` (dalla mappa di `src/12`, in più) | ✅ verde | 6 min | «nessuna scena difensiva nasconde il protagonista per quasi tutta la conclusione» |

**`portiere-223` è rosso, e lo era già prima di questo giro.** Sul mio build: rosso, rosso, verde in tre corse del braccio verde (le
due rosse con lo stesso difetto: gi86 «Stacco sul secondo palo», esito palo, il portiere si tuffa su un pallone che gli passa a
6,4 u). Sul ramo di partenza `lavoro/197` (9a5d8a6, copia separata, nessuna mia modifica): **rosso 2 su 2** — una volta «prima gi62
wide: tuffo su un pallone largo (5,56 u)», una volta lo stesso identico difetto di gi86 (6,55 u, esce a 7,2 u). La mia correzione non
tocca il portiere né il bersaglio dei tiri (solo camera, e l'esito di una sola azione di gi55). Non l'ho riparato: è fuori dalla
consegna (dubbio 7). Non dichiaro verde questo controllo.

Nessuna foto di altri giri è stata rigenerata in `docs/` (`git status` pulito dopo i controlli).

`camera-252` (la taglia che si spegne in dissolvenza al cambio di soggetto) e `hero-in-frame` (regia degli highlight difensivi, 7.482)
non erano nella consegna: li ho aggiunti perché sono i due guardiani più vicini a ciò che ho toccato.

Non eseguiti, e lo dichiaro: il gate `validate-situations`, le catene `completa`/`carriera`/`mirata` (la mirata per `src/12` +
`src/15` conta 108 passi), `highlight-95`, `ingresso-206`, `career-critical` (regola PO-504 A: li esegue la verifica di rilascio).
Vedi dubbio 8.

## 9. Dubbi per il PO

1. **Il numero del giro 226 («13 esecuzioni su 116») era misurato sulla camera della regia, non sullo schermo.** A schermo l'eroe
   non spariva: restava sul bordo del quadro, piccolo, mentre la scena inquadrava il pallone perso (correzione del fotogramma del
   giro 96a). Ho corretto la regia (da 14 a 1 azione su 41 sotto il 95%) e questo si vede a schermo come meno tempo sul bordo (10,8%
   → 3,8% dei fotogrammi) e nessun eroe ingrandito. Va guardato sul telefono se è questo che il PO intendeva con «esce dal quadro».
2. **La regia ora è diversa fra azione fallita e azione riuscita.** Sulle fallite, dopo il gesto, la camera va dietro l'eroe; sulle
   riuscite resta quella di prima. Due conseguenze: (a) nelle scene **riuscite** gli stessi difetti (eroe sul bordo, camera che gli
   passa vicino) con ogni probabilità ci sono ancora — non li ho misurati, la consegna era sulle fallite; (b) chi gioca molto potrebbe
   imparare a leggere l'esito dal movimento di camera prima del riquadro. Estendere la passata alle riuscite è un altro giro (lì il
   viaggio del pallone verso la porta o il compagno «è la storia», 7.522).
3. **L'eroe resta a volte sul bordo durante il giro di camera** (in media 3-4% dei fotogrammi, fino al 13-19% su singole azioni come
   gi109). Succede perché la correzione del fotogramma del 96a, per far entrare anche il pallone, accetta l'eroe fino a 0,93 del
   semiquadro. Alternativa, da decidere: sulle azioni fallite tenere l'eroe entro 0,80 e lasciare fuori il pallone per quel mezzo
   secondo (eroe più comodo, pallone meno visibile). Ho lasciato la scelta del 96a.
4. **Su un telefono lento il giro di camera dura di più.** I passi della camera sono per fotogramma (lezione 7.708): nelle corse con
   le foto, dove la pagina è più lenta, l'eroe sul bordo sale fino al 19%. Qui non posso misurare il telefono.
5. **gi55: l'esito «palo» diventa «fuori» sempre, su quell'azione.** Anche nelle 7 volte su 8 in cui un palo libero c'era. La
   decisione sul tipo d'esito si prende prima che la scena 3D conosca dove sta il portiere, quindi non si può scegliere caso per
   caso senza far tornare un'informazione dal 3D all'esito. Chi fa quel colpo di testa non vedrà più «palo». Va bene così?
   Conseguenza per i collaudi: su quell'azione `__CPM_FORCE_KIND='post'` ora produce `wide`.
6. **Il guardiano prova 22 azioni fallite su 483**, il banco 41 per braccio. Tutte e 483 su due bracci sono circa 7 ore di macchina:
   non le ho misurate. Se serve la misura intera, va lanciata a parte (`node misura-241.mjs`, con `CPM_FETTA=i/12` a pezzi).
7. **`portiere-223` è rosso sul ramo di partenza** (2 corse su 2) per «tuffo su un pallone largo» su gi86 e gi62, esito palo o
   fuori. Non l'ho toccato. Va riparato in un giro suo (decisione PO 13/10: un guardiano instabile si ripara, non si ripete).
8. **Gate e catene non eseguiti.** La correzione muove la camera in `hl_result` nelle azioni fallite: i controlli del gate che
   campionano la camera sull'esito (`post-highlight`, `final-state`) non li ho lanciati e non posso confermare che siano verdi. La
   firma golden è catturata in lettura (prima dell'esito) e la passata lì non agisce, ma non l'ho verificato con una corsa.
9. **«Eroe enorme dopo la fine della scena» (gi30)**: dentro la scena l'altezza massima scende da 0,34 a 0,14-0,16. Dopo la chiusura
   della scena, nel gioco vero, c'è lo stacco verso il gioco fluido: da questo banco (scene forzate, che non riprendono il gioco)
   non l'ho potuto osservare. Se sul telefono compare ancora, serve una sonda su partita vera.
10. **Sui passaggi falliti non si applica più «il viaggio è la storia» (7.522).** Prima, col pallone in volo, il soggetto passava
    subito al pallone per mostrare chi lo riceve; ora sulle azioni fallite chi intercetta si vede da dietro l'eroe, più lontano.
11. **Nella costruzione delle scene fallite il soggetto è l'eroe** (per esempio il cross che gli arriva): il pallone in arrivo entra
    nel quadro più tardi di prima. È il prezzo di «eroe sempre in quadro».
12. **Tutto il giudizio è headless** (viewport 412×915, GLB acceso, 15-21 fotogrammi al secondo di scena). Fluidità e gradevolezza
    del giro di camera vanno guardate sul telefono; se il giro dà fastidio, le manopole sono la distanza (14 u), l'altezza (6,5) e
    quanto in anticipo punta il bersaglio (1,1 rad).
13. **`GAME_VERSION` non toccata** (regola fissa). In `CLAUDE.md` ho aggiunto un paragrafo (invariante «le camere sono due»),
    perché cambia il modo di misurare il quadro; roadmap e storia delle release non le ho toccate.
14. Nel gioco restano due ganci di sola prova nuovi (`__CPM_REC241`, `__CPM_FINE241`), attivi solo sotto `cpmtest`.
15. **Uno sbaglio mio all'inizio della sessione, senza effetti sul repo.** Per vedere l'elenco dei controlli ho lanciato
    `node ci-runner.mjs mirata lavoro/197`: non stampa soltanto l'elenco, esegue la catena. Le dipendenze dei test non erano ancora
    installate, quindi tutti i passi sono caduti in meno di un secondo e l'esecutore ha scritto un giro in
    `docs/governo/STABILITA.json`: l'ho rimesso com'era con `git checkout --` e non è mai stato committato.
16. Durante le misure ho usato per tre volte più processi del banco insieme (tre fette in parallelo): è uno strumento di misura,
    non un controllo, ma non dava nessun vantaggio di tempo e l'ho smesso. I controlli sono stati eseguiti tutti uno alla volta.
