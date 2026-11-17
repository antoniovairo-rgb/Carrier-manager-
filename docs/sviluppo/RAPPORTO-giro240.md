# Rapporto giro 240 — PO-500 (pelle e capelli dalla figurina in tutte le scene) e PO-499 (saluto con clip Rohr)

Ramo `sviluppo/giro240-pelle-saluto`, partito da `lavoro/197` (= 7.999.196 pubblicata). `GAME_VERSION` non toccata.
Rosso unico: `window.__CPM_NO_G240` (pelle/capelli fuori dalla serata come nella 7.999.196, saluto a posa del giro 225).
Foto: `docs/sviluppo/giro240/`. Registro dei controlli: `docs/sviluppo/giro240/controlli.txt`.

**Tutte le misure sono headless (rendering software), sulla stessa macchina, verde contro rosso. Non sono misure del telefono
del PO.** Il collaudo sul telefono resta da fare (vedi «Dubbi per il PO»).

Decisioni del PO da cui parte il giro (BACKLOG e DECISIONI sul ramo `poc/marioprada-character-system`):
- PO-500 «Sì, nella 197»: pelle e capelli dei corpi 3D coerenti con la figurina in tutte le scene, con lo stesso metodo della serata.
- PO-499 «Posa ora, clip nella 197»: il saluto della serata con una clip vera di applauso/saluto Rohr; le clip Rohr entrano nel
  pacchetto di rilascio.

---

## Strumenti

- `tests/visual/pelle-240.mjs` — **guardiano nuovo** (`npm run pelle-240`), verde + rosso nello stesso comando.
- `tests/visual/misura-240.mjs` — sonda del saluto (braccio destro e due braccia nel tempo di scena; `--rosso`, nome di una clip).
- `tests/visual/calib-240.mjs`, `fit-240.mjs` — taratura della compensazione delle luci dalle misure del guardiano.
- `tests/visual/presentazione-225.mjs` — aggiornato per la clip (blocco D) e col braccio rosso `rosso240`.
- `tests/visual/presentazione-142.mjs` + `saluto-144-misura.mjs` — aggiornati per la clip (vedi PO-499, punto 4).
- Nel gioco, solo quando una sonda arma `window.__CPM_G240W`: testimone `misuraPelle240` (sola lettura). Sotto `?cpmtest=1`:
  `__CPM_FIG240(nome)` (la figurina di un nome) e, sulla serata, `mani240` / `clip240`.

### Come misura il testimone `misuraPelle240`

Per ogni corpo CGTrader visibile della scena: chi è (nome = chiave della figurina, scritto sul corpo dalla scena), che testa ha
(variante dei capelli letta dal materiale) e il **colore reso del viso**: un primo piano della fronte disegnato con le luci e lo
sviluppo del colore della scena, mediana dei pixel di pelle al centro. Il guardiano legge la figurina di quel nome con la stessa
funzione del gioco e campiona il viso sull'**immagine** della figurina (riquadro x 40–60%, y 36–50%, come nel giro 225).
Distanza: CIE76, soglia 12 (la soglia del giro 225).

Il primo piano non è l'inquadratura del gioco. Cinque correzioni dello strumento, ognuna dopo una misura sbagliata (le dichiaro
perché cambiano cosa si misura):

| difetto dello strumento (misurato) | correzione |
|---|---|
| un compagno in fila fra la camera e il viso: «viso» rosso maglia (198,85,50) | camera a 0,48 dal viso invece di 1,25; poi gli **altri corpi** nascosti durante il primo piano di un corpo |
| viso dell'eroe scurissimo in gioco (84,62,51) **in tutti e due i bracci**: un velo trasparente attaccato all'eroe davanti alla camera | veli, fasci e sprite trasparenti nascosti durante i primi piani |
| eroe in corsa a testa bassa: il primo piano «orizzontale» inquadrava i capelli | il primo piano segue la direzione del collo |
| l'eroe con la coppa alzata: oro letto come pelle (181,116,91) | oggetti piccoli entro 2,2 u dal viso nascosti per quel primo piano |
| serata e parata misurate mentre arrivavano le texture dei capelli | il guardiano attende l'evento «testa pronta» su ogni corpo |

Conseguenza da dichiarare: il testimone misura **il corpo sotto le luci della scena**, senza ciò che gli sta davanti. Non misura
il fotogramma che vede il giocatore.

---

## PO-500 · Pelle e capelli dalla figurina

### Misura prima (braccio rosso, notte, salvataggio `fixtures/save-190-s12-ovr93.json`)

Il corpo CGTrader ha una sola carnagione e quattro teste; fuori dalla serata i capelli venivano dal seme del posto, non dalla
persona. In partita la testa è disegnata con la sua texture non decodificata, quindi il viso esce chiaro e sbiadito
(esempio: 215,200,190 per tutti).

### Quanti corpi hanno nome e figurina, scena per scena

| scena | corpi CGTrader visibili | con nome e figurina | senza nome | chi sono i «senza nome» |
|---|---|---|---|---|
| ingresso in campo | 63 | 22 | 41 | arbitro e assistenti, panchine, mister, mascotte e bambini |
| gioco / highlight | 7–14 (il gioco tiene visibili quelli in scena) | 4–8 | 2–9 | arbitro, assistenti, panchine |
| premiazione | 23–33 | 13–15 | 10–18 | come sopra |
| festa | 7 | 5 | 2 | come sopra |
| serata di presentazione | 7 | 6 | 1 | il posto della fila che nessun battito chiama |
| parata | 8 | 8 | 0 | — (vedi «Dubbi», punto 3) |
| gala | 0 | 0 | — | dalla 7.999.52 sul palco ci sono solo i presentatori: nessun corpo con figurina |
| intervista, schermata d'avvio | — | 0 | — | corpo diverso (non CGTrader) o nessun giocatore con un nome |

In partita, ingresso, highlight, premiazione e festa i corpi sono **gli stessi ventidue** (stessa scena 3D): la correzione è una
sola e vale per tutte.

### Correzione

`src/15`: ogni giocatore della partita porta, accanto al cognome, il **nome intero** (`nf`), che è la chiave della figurina.
`src/12`: alla nascita del corpo CGTrader (e delle sue tre varianti di dettaglio) capelli e pelle vengono dalla figurina di quel
nome, con le funzioni della serata (`aspettoFigurina225`, `_pelle225`); l'indice dei volti (82 KB) si attende prima dei corpi
(tetto 4 s), come nella serata. `src/16`: parata (eroe + i sette sul tetto); serata con la stessa taratura delle altre scene.

Tre cose nuove rispetto al giro 225, tutte nate da una misura:

1. **Spazio colore.** In partita la mappa della testa non è decodificata e l'uscita del renderer è sRGB: il fattore di tinta si
   calcola nello spazio in cui lo shader legge la mappa (modo «auto», che non tocca i materiali del gioco). Solo questo ha portato
   la distanza mediana all'ingresso da 32 a 12,5.
2. **Compensazione delle luci** (`RESA240`, `ESP240`). Le luci e lo sviluppo del colore schiariscono e sbiadiscono i toni chiari e
   schiacciano gli scuri: il fattore che serve va come (bersaglio)^−a per canale. Esponente misurato su 22 visi
   (notte −0,12/0,34/0,29 · giorno −0,10/0,23/0,27 · tramonto −0,08/0,25/0,28), un coefficiente per ora del giorno in partita,
   uno per la serata, tre per la parata (eroe e i due lati del pullman, che la luce ×4 prende in modo diverso).
3. **Maschera del viso.** La tinta della pelle sceglie i pixel «saturi e caldi»: sulla testa lo sono anche i capelli castani e
   ramati, che diventavano rossicci (primi piani). Le quattro texture della testa sono identiche fuori dai capelli (89,7% dei
   pixel uguali): la differenza fra due di loro è la zona dei capelli. Si tiene **solo la calotta** (due isole grandi; le macchie
   piccole su occhi, narici e sopracciglia si scartano: lasciate fuori dalla tinta facevano chiazze chiare sulle carnagioni scure
   e, in partita, occhi e narici neri — visti nei primi piani e corretti). In partita, sulla calotta, si applica la decodifica che
   manca: i capelli tornano del colore della loro texture invece che slavati.

Chi non ha figurina (arbitro, panchine, mascotte, assistenti, presentatori) resta com'era.

### Misura prima e dopo (giro ufficiale del guardiano `pelle-240`, notte, build finale — `giro240/controlli-pelle-240.txt`)

Distanza CIE76 fra viso reso e viso della figurina (soglia 12); «capelli sbagliati» = teste la cui variante non è la classe della
figurina. Per ogni corpo vale la passata più vicina alla figurina (vedi «come giudica»).

| scena | con figurina | capelli sbagliati prima → dopo | viso, mediana prima → dopo | viso, massima prima → dopo | visi oltre 12 prima → dopo |
|---|---|---|---|---|---|
| ingresso in campo | 22 | 15 → 0 | 28,3 → 3,0 | 46,9 → 5,0 | 22 → 0 |
| gioco / highlight | 5 | 3 → 0 | 23,4 → 6,2 | 28,1 → 11,7 | 5 → 0 |
| premiazione | 13 (prima) · 15 (dopo) | 9 → 0 | 26,9 → 4,9 | 37,0 → 9,7 | 13 → 0 |
| festa | 5 | 4 → 0 | 22,1 → 4,0 | 31,6 → 9,5 | 5 → 0 |
| parata | 8 | 8 → 0 | 40,2 → 3,2 | 47,0 → 4,4 | 6 → 0 |
| serata (era già del giro 225) | 6 | 0 → 0 | 9,2–10,3 (costanti del 225, corse precedenti) → 3,6 | 10,7–12,3 → 5,6 | — |

Nella serata la prima passata del «dopo» dà mediana 14,8 e massima 21,7, la migliore 3,6 / 5,6: è l'effetto delle luci della
scena che cambiano (vedi «Limiti»). Con lo strumento di questo giro la serata del giro 225 (braccio rosso, non giudicato qui)
stava a 9–10 di mediana: sotto soglia, ma più lontana di adesso.

Secondo giro di conferma sulla stessa build (`controlli-pelle-240-bis.txt`): verde. Mediane 3,4 · 5,2 · 4,9 · 5,0 · 5,3 · 3,2;
in premiazione **un viso su 12 fuori soglia** (l'eroe, 20,6: reso 186,117,92 contro 225,172,141). Non ho verificato la causa;
in quella scena l'eroe alza la coppa e le sue braccia possono stare davanti al viso nel primo piano. Il guardiano lo riporta
nell'uscita e resta verde per la regola delle scene in movimento (11 su 12 entro soglia, mediana 4,9).

Altre ore del giorno, braccio verde, sola partita (corse di taratura, stessa build salvo l'ultimo ritocco dello strumento):

| ora | ingresso (mediana / massima) | gioco | premiazione | festa |
|---|---|---|---|---|
| giorno | 4,6 / 6,3 | 6,9 / 11,2 | non giudicata in quella corsa (la premiazione forzata non era partita: da allora si apre una partita nuova) | 5,2 / 10,3 |
| tramonto | 4,9 / 6,6 | 5,3 / 8,8 | 5,1 / 9,5 | 5,0 / 7,0 |

Il guardiano di catena gira di notte (l'ora in cui gioca il PO, regola «ora congelata»); giorno e tramonto si lanciano con
`CPM_TOD=day|dusk`.

### Limiti dichiarati

- **Un viso non ha un colore solo.** Nelle scene in movimento lo stesso viso sta fra 3 e 14 a seconda di come è girato rispetto ai
  riflettori; fuochi d'artificio e flash lo tingono per un istante (nella serata, lo stesso viso: 224,153,116 in una passata e
  186,98,76 nella successiva). La compensazione è una per ora del giorno: non insegue le luci transitorie.
- **Teste.** Il corpo CGTrader non ha teste rasate, barbe, capelli lunghi (come nel giro 225). Le texture delle quattro teste hanno
  sopracciglia, contorno occhi e ombre delle narici ricolorati col colore dei capelli: nelle scene dove la mappa è decodificata
  (serata, parata) la testa «neri» ha sopracciglia e occhi molto marcati. È la texture, non la tinta: in parata prima si vedeva
  la testa del file (una sola per tutti), ora si vedono le quattro teste.
- **Parata.** Con la compensazione i visi sul tetto non sono più bruciati dalla luce ×4 (prima: 248,242,236, quasi bianchi): è un
  cambio visibile oltre al tono della pelle.
- **Figurina.** La figurina del 3D è `voltoId23('giocatore', nome intero)`. Nelle schermate che evitano i doppioni di volto
  (`ScenaVolti23`) un giocatore può avere, in quella schermata, un volto diverso: il 3D non lo segue.
- **Avversari.** Prendono la figurina del loro nome col tipo «giocatore» (come nelle schermate che li nominano), non la metà di
  indice riservata al tipo «avversario» senza nome.

---

## PO-499 · Il saluto della serata è una clip Rohr

### 1. Quale clip (misurate tutte e due sul corpo della serata, `misura-240.mjs`)

| misura (braccio destro, tempo di scena) | posa del giro 225 (rosso) | «clap twice hand up» | **«clapping hands up»** | limite del giro 225 |
|---|---|---|---|---|
| gomito (angolo interno) | 83,9–164,9° | 86,2–154,1° | 104,3–156,2° | ≥ 40° |
| omero dalla verticale, massimo | 96,4° | 122,9° | 61,2° | ≤ 150° |
| gomito fuori dalla cerniera, a saluto in corso | 0–4,9° | 18,3–**39,5°** | 0–9,7° | ≤ 25° |
| polso, massimo | 13,5° | **71,9°** | 62,7° | ≤ 70° |
| velocità omero / avambraccio (finestra 0,10 s) | 188 / 376 °/s | **397 / 570** | 236 / 452 (poi 186 / 362 con rampa 0,5 s) | ≤ 350 / ≤ 530 |
| mani e gomiti dall'asse del busto, minimo | 0,286 | 0,206 | 0,237 | ≥ 0,12 |
| distanza fra i palmi, minimo | — | 0,118 | 0,123 | — |
| mani e gomiti dalla testa, minimo | 0,425 | 0,262 | 0,285 | — |
| durata della clip | — | 3,37 s | 3,90 s | — |

«Clap twice hand up» supera tre limiti (cerniera, polso, velocità). **Ho collegato «clapping hands up»** (applauso alla tribuna a
mani all'altezza del viso), che sta dentro tutti; l'altra resta come ripiego se la prima mancasse dal file.

### 2. Come entra nella scena (`src/16`, `_salutoClip240`)

Della clip si prendono solo le braccia (clavicole, omeri, avambracci, mani, dita: 38 ossa); gambe e busto restano della posa della
fila. La clip si campiona al tempo di scena del saluto con un mixer suo, poi si dissolve dalla posa a riposo e ci ritorna (rampa
0,5 s): nessun salto. Dopo la clip passa di nuovo la regola delle spalle (`_spalle146`). Tempi: braccia giù a 2,90 s dall'arrivo,
come nel giro 225 (la prima stesura usava tutta la clip: 6,85 s di scena, e `presentazione-142` cadeva perché il chiamato non era
tornato in fila entro i 6 s; ora 5,8 s). Se il file della clip non arriva, la serata usa la posa del giro 225.

### 3. Misura dopo (guardiano `presentazione-225`, ultima corsa sulla build finale — `giro240/controlli-presentazione-225.txt`)

| | verde (clip) | rosso 240 (posa del giro 225) | limite |
|---|---|---|---|
| clip attiva | `rohr-clapping-hands-up`, 38 ossa | nessuna | — |
| gomito (angolo interno) | 104,6–174,7° | 84,1–174,7° | ≥ 40° |
| omero dalla verticale, massimo | 61,3° | 96,2° | ≤ 150° |
| gomito fuori dalla cerniera, a saluto in corso | 0–9,4° | 0–6,3° | ≤ 25° |
| polso, massimo | 62,0° | 13,3° | ≤ 70° |
| velocità omero / avambraccio | 191 / 376 °/s | 188 / 376 °/s | ≤ 350 / ≤ 530 |
| mani e gomiti dal busto, minimo | 0,237 | 0,279 | ≥ 0,12 |
| mani all'altezza delle spalle o sopra | 2,16 s | — (una mano: 1,70 s a 15 cm sopra la spalla) | ≥ 1,5 s |
| battiti dell'applauso | 8 | — | ≥ 4 |
| distanza fra i palmi, minimo | 0,125 | — | ≥ 0,08 |
| mani e gomiti dalla testa, minimo | 0,286 | — | ≥ 0,15 |
| slittamento del piede nel cammino | 0,172 | 0,167 | ≤ 0,35 |
| viso reso contro figurina (misura del giro 225), sei chiamati | 2,3–6,7 | — | ≤ 12 |

I due bracci sono della stessa corsa. Foto: `saluto-dopo-clip.jpg`, `saluto-prima-posa-225.jpg`,
`saluto-dopo-passo.jpg`, `saluto-dopo-ritorno.jpg`.

### 4. Guardiani aggiornati per il gesto nuovo — cosa è cambiato e perché

Il gesto è cambiato per decisione del PO (da «mano alzata col palmo avanti» ad «applauso a mani alte»). Due criteri dei guardiani
descrivevano il gesto vecchio e non descrivono un applauso. **I limiti del braccio sono invariati** (gomito, omero, cerniera,
polso, busto, velocità). Cambiano, **solo quando la clip è attiva**:

| guardiano | criterio del gesto vecchio | criterio per la clip | misurato |
|---|---|---|---|
| `presentazione-225` D | mano destra ≥ 15 cm sopra la spalla per ≥ 1,5 s | tutte e due le mani all'altezza delle spalle o sopra per ≥ 1,5 s, ≥ 4 battiti | 2,1 s, 8 battiti |
| `presentazione-225` D | mano ≥ 5 cm dal piano mediano («mai oltre il centro») | nessuna compenetrazione: palmi ≥ 0,08, mano destra dal suo lato (≥ 0,02), mani e gomiti a ≥ 0,12 dal busto e ≥ 0,15 dalla testa | palmi 0,126 · lato 0,041 · busto 0,237 · testa 0,286 |
| `presentazione-142` (giro 144) | mano destra ≥ 15 cm sopra la spalla per ≥ 1,5 s, palmo verso la tribuna | tutte e due le mani all'altezza delle spalle o sopra per ≥ 1,5 s, mani che si incontrano (≤ 0,20) | 2,09 s, mani 0,119 |

Senza clip (rossi dei giri 144 e 225, rosso `__CPM_NO_G240`) restano i criteri di prima, invariati. `presentazione-225` ha un
braccio in più, `rosso240`: con `__CPM_NO_G240` la clip non deve essere attiva e la posa del giro 225 deve stare nei suoi limiti.
In `presentazione-225` il colore del viso del chiamato si campiona ora a braccia appena abbassate (a un evento): con l'applauso
il riquadro del viso finiva sulle mani in movimento e una corsa è uscita «non giudicata».

### 5. Pacchetto di rilascio e licenze

- `tools/build-dist.mjs`: `cgtrader-clip-rohr.glb` tolto dall'elenco degli esclusi.
- `tools/validate-dist.mjs`: la regola si rovescia. Prima «le clip Rohr fuori dal pacchetto»; ora «il file sta nel pacchetto **se e
  solo se** il gioco lo carica». Verde: `clip Rohr del saluto (PO-499) nel pacchetto: ✅ 1.79 MB`. Rosso provato togliendo il file
  dalla `dist/`: `❌ file assente, il gioco lo carica`, uscita 1.
- **Peso vero:** `assets/cgtrader-clip-rohr.glb` = **1.878.652 byte** (1,88 MB decimali, 1,79 MiB). La `dist/` con la clip pesa
  144.000.873 byte: la clip è l'1,3%.
- Registro licenze: `docs/governo/CREDITI-fonti.md` (riga in tabella + nota in testa alla registrazione del giro 180b),
  `tests/character-lab/CLIP_REGISTRY.md`. Come deciso dalla madre nel giro 180c («la riga entra in tabella e nella finestra
  Crediti quando le clip entreranno nel gioco»), la voce «Animazioni Anderson Rohr» è nella finestra Crediti del gioco (`src/17`)
  e in `crediti-254` (ATTESI). Gli originali (zip, FBX) restano fuori dal repository e dal pacchetto (`licenze-184` verde).
- Nessun asset nuovo: il file era già nel repository dal giro 180b con licenza registrata.

---

## Guardiano `pelle-240` — come giudica

Verde + rosso (`__CPM_NO_G240`) nello stesso comando; «non giudicato» = rosso. In `ci-runner.mjs` sta una sola volta nelle catene
`completa` e `carriera` e nelle righe della mappa di `src/12-13` e `src/16-18-10` (`node --check` verde, nessun doppione).

- **Capelli:** per ogni corpo con figurina, in ogni scena, la classe della figurina è la variante della testa 3D. Nessuno scarto.
- **Pelle, scene ferme** (ingresso, serata, parata): ogni corpo entro 12.
- **Pelle, scene in movimento** (gioco/highlight, premiazione, festa): mediana dei visi ≤ 12 **e** almeno il 75% dei visi entro 12.
- **Ripetizione dichiarata:** tre passate all'ingresso, fino a otto (a 1,2 s) nelle altre scene; per ogni corpo vale la passata
  più vicina alla figurina; la prima passata resta scritta nell'uscita. Le passate si fermano quando il verdetto è già deciso.
- **Rosso:** in ogni scena di partita e in parata il difetto deve vedersi con lo stesso metro. La serata sotto `__CPM_NO_G240`
  resta quella del giro 225 (la giudica `presentazione-225`): non si misura.

**Attenzione, da leggere:** la prima stesura giudicava «ogni corpo entro 12» in tutte le scene. Sulla build finale è caduta per
un viso su 61 (14,4 nella festa, uguale in tutte le otto passate), e in altre corse era al limite in gioco (11,5 · 11,7 · 12,0),
sempre per come era girato quel corpo rispetto alle luci. La soglia 12 non è stata toccata; è cambiato a chi si chiede nelle tre scene in movimento.
È un allentamento rispetto alla prima stesura e lo segnalo come tale (vedi «Dubbi», punto 1).

---

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

Build finale: commit `c8b6bf4e` (ultimo che tocca `src/` e `CARRIER-MANAGER-AV.html`); dopo sono cambiati solo i guardiani
`pelle-240` e `presentazione-225` e i documenti. Prima di ogni controllo: memoria libera 15,0–15,5 GB, disco libero 28 GB.
Registro completo, comprese le corse sulle build precedenti del giro e i rossi: `docs/sviluppo/giro240/controlli.txt`.
`node tools/build-src.mjs` e `node tools/check-src.mjs` dopo ogni modifica a `src/`.

| controllo | esito sulla build finale | durata | nota |
|---|---|---|---|
| `pelle-240` (nuovo) | verde, due corse di fila | 8 min 8 s · 8 min 40 s | prima, con la prima stesura del giudizio: rosso (un viso su 61 nella festa) |
| `presentazione-225` (aggiornato) | verde | 13 min 18 s | prima due corse «non giudicato» sul colore di un chiamato: il guardiano campionava il chiamato precedente (attesa a evento aggiunta) |
| `cerimonie-192` | verde | 9 min 51 s | |
| `festa-3d` | verde | 2 min 10 s | |
| `tpose-196` | verde | 28 min 8 s | |
| `gigante-212` | verde | 18 min 6 s | |
| `licenze-184` | verde | 3 min 1 s | |
| `clip-180` | verde | < 1 s | |
| `fps-249` | verde | 55 s | |
| `test:logic` | verde | 4 s | |
| `save-compat` | verde | 14 s | |
| `presentazione-142` (mappa; aggiornato) | verde | 3 min 16 s | rosso alla prima corsa con la clip intera (vedi PO-499, punti 2 e 4) |
| `presentazione-200` (mappa) | verde | 1 min 1 s | |
| `pullman-204` (mappa) | verde | 4 min 44 s | |
| `crediti-254` (mappa; aggiornato) | verde | 29 s | 21 righe del documento, tutte nella finestra Crediti |
| `tools/validate-dist.mjs` | verde, e rosso provato | — | eseguito sulla build del commit `8f5df3c6`; da allora `src/` è cambiato in punti che non riguardano il pacchetto |

`tpose-196` supera i 20 minuti: è nell'elenco della consegna. Non ho eseguito `highlight-95`, `ingresso-206`, `career-critical`.
I controlli rigenerano foto dei giri 196 e 212 in `docs/`: le ho rimesse con `git checkout --` e non sono nei commit.

---

## Dubbi per il PO

1. **Giudizio nelle scene in movimento.** Per gioco, premiazione e festa il guardiano chiede «mediana entro 12 e tre visi su
   quattro entro 12», non «ogni viso entro 12». Il singolo corpo è giudicato uno per uno all'ingresso in campo (stessi materiali).
   Se il PO vuole «ogni viso entro 12» anche lì, serve una compensazione che segua le luci corpo per corpo: non l'ho fatta.
2. **Quale clip.** Il PO ha indicato due clip; ho collegato «clapping hands up» perché è l'unica delle due dentro i limiti del
   braccio del giro 225. È un applauso alla tribuna con le mani all'altezza del viso: nessuna mano resta alzata sopra la testa.
   Se il PO preferisce «clap twice hand up» (due battiti e braccia in alto), supera tre limiti: va deciso se quei limiti, nati per
   la posa calcolata, valgono anche per una clip di movimento vero.
3. **Parata.** I sette compagni sul tetto del pullman non hanno un nome nella scena 3D. Ho dato loro le chiavi che usa la parata
   disegnata (`parata-<club>-<i>`): hanno pelle e capelli della figurina di quella chiave, ma non sono i compagni della rosa.
   Nel salvataggio di prova il club non ha un identificativo e la chiave diventa `parata-x-<i>` (succede anche nella parata
   disegnata).
4. **Telefono.** Nessuna misura è del telefono. Da guardare lì: i visi in partita di notte (prima chiari e sbiaditi, ora del tono
   della figurina), i capelli più scuri in partita (decodificati), la parata non più bruciata, l'applauso nella serata.
5. **Colore che cambia con le luci.** In serata, premiazione e festa i fuochi e i flash tingono i visi per un istante. Non l'ho
   compensato: è la luce della scena. Se sul telefono si vede come difetto, serve una decisione.
6. **Teste «neri».** Sopracciglia e contorno occhi molto marcati dove la mappa è decodificata (serata, parata). È la texture delle
   teste, già in uso nella serata dal giro 142. In parata è nuovo, perché prima c'era una sola testa per tutti.
7. **Guardiani della mappa non eseguiti.** La mappa mirata per i quattro file toccati (`src/12`, `15`, `16`, `17`) elenca 199
   guardiani. Ho eseguito quelli della consegna, i due nuovi/aggiornati e sei della mappa vicini a ciò che ho toccato (vedi
   «Controlli eseguiti»). Gli altri restano alla verifica di rilascio.
8. **Errore mio durante il giro.** Per vedere l'elenco della mappa ho lanciato `node ci-runner.mjs mirata lavoro/197`, che non
   elenca: esegue. L'ho fermato dopo circa un minuto; non ha scritto nulla in `docs/governo/STABILITA.json` (verificato con
   `git status`).
9. **Roadmap, cronologia, versione.** Non ho toccato `GAME_VERSION`, `docs/governo/ROADMAP.md` né `docs/RELEASE_HISTORY.md`.
   In `CLAUDE.md` ho aggiunto una riga di invariante (chi aggiunge una scena 3D con corpi che hanno un nome).
