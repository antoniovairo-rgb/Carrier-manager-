# Giro 355 — «La tua storia»: la rivalità legata agli anni veri (PO-586)

**Base:** `lavoro/201` (= 7.999.209) · **Ramo:** `sviluppo/giro355-storia-anni` · **Voce:** PO-586
**Foto PO citata nel compito:** `docs/collaudo-po/198-storia-equilibrio-anni.png` — ⚠️ **non presente nel repo** sulla base
(in `docs/collaudo-po` ci sono solo `198-formazioni-senza-indietro.png` e `198-ingresso-senza-audio.png`), e **PO-586 non
compare in `docs/governo/BACKLOG.md`** (grep su «586»: nessuna riga). Ho lavorato sulle parole del PO riportate nel compito;
non ho toccato il BACKLOG (file di governo, un altro giro lavora in parallelo).
GAME_VERSION non toccata (rilascio automatico).

## Il difetto

Capitolo del rivale di «La tua storia» (`storyChapter`, src/18, ramo `rivw1`): con i gol di carriera vicini usciva
«In carriera siete lì, testa a testa (8 a 11): **un equilibrio che dura da anni**» anche nella **prima stagione da
professionista**, quando il rivale è nato da pochi mesi (`generateRival` lo crea al salto con `seasons:1`).

## Censimento (src/18 `storyChapter`, tutti i capitoli + le rivalità)

| Testo | Presuppone | Prima | Dopo |
|---|---|---|---|
| «un equilibrio che dura da anni» | ≥3 stagioni insieme | sempre | ≥3: invariato · 2ª: «dura dalla scorsa stagione» · 1ª: «la vostra storia da professionisti è appena cominciata, e già non c'è un padrone» |
| titolo «Gli eterni rivali» | ≥3 stagioni | sempre | ≥3: invariato · altrimenti «Rivali a viso aperto» (già affrontati) / «Il primo incrocio» |
| titolo «La sfida di sempre» | ≥3 stagioni | sempre | ≥3: invariato · altrimenti «La sfida nella sfida» |
| titolo «Di nuovo faccia a faccia» | incontro precedente | sempre | se già affrontati · altrimenti «Faccia a faccia» |
| titolo «Ancora voi due» | incontro precedente | sempre | se già affrontati · altrimenti «Voi due, per la prima volta» |
| «Il calendario **rimette** di fronte…» | incontro precedente | sempre | altrimenti «…mette per la prima volta di fronte…» |
| «…**torna** sulla tua strada…» | incontro precedente | sempre | altrimenti «…si mette per la prima volta sulla tua strada…» |
| «…incroci **di nuovo**…» | incontro precedente | sempre | altrimenti «…incroci per la prima volta…» |
| «…con lui il conto riparte **sempre** da zero» | incontro precedente | sempre | altrimenti «…al primo incrocio diretto i numeri valgono zero» |

Già giusti, nessuna modifica: «vi inseguite da N stagioni» (già condizionato a `rival.seasons>=3` col numero vero);
«Fuori dal campo ormai vi sentite» / «Col tempo tra voi è nato il rispetto» (la relazione cambia solo al rollover,
quindi da 2ª stagione); l'andata («All'andata…», letta dal tabellino); le chiusure; «Il ritorno da ex», «La bandiera»,
i tributi e il gol 100 (tutti letti da storico/presenze veri).

**Anni veri** (ramo del rivale, src/18): `anni = min(rival.seasons, season − proSeason + 1)` — la stessa base di
`primiAnni352`; senza `proSeason` (salvataggi precedenti al 7.435) vale `rival.seasons`. **Già affrontati** =
`anni ≥ 2` oppure una gara di questa stagione contro il club del rivale prima di questa settimana. Nessun campo nuovo nel
salvataggio (tutto derivato), nessun sorteggio nuovo: le liste hanno la stessa lunghezza, quindi la scelta seedata dei
testi resta la stessa a parità di eroe.

## Misura (carriere sintetiche, funzione vera)

`storia-355.mjs` chiama `storyChapter` vera (esposta solo sotto `?cpmtest=1` come `__CPM_CAREER.storyChapter`) su
48 rivali × 6 stagioni da professionista × andata/ritorno, metà con gol di carriera alla pari: **576 capitoli del rivale**.
Le carriere sono sintetiche (costruite dalla sonda), non giocate settimana per settimana: dichiarato.

| | violazioni | 1ª stagione | 2ª stagione | «da anni»/«eterni»/«di sempre» in 1ª | «di nuovo»/«ancora» al primo incrocio |
|---|---|---|---|---|---|
| rosso `__CPM_NO_G355` (testi di prima) | **125 / 576** | 82 | 43 | 47 | 35 |
| verde | **0 / 576** | 0 | 0 | 0 | 0 |

Copertura del verde: 96 capitoli in 1ª, 96 in 2ª, 384 dalla 3ª; «testa a testa» 27 / 22 / 59; 0 capitoli nulli o in
errore (la prima stesura della sonda ne aveva 56: presenze e gol finivano sulle soglie dei tributi «50 volte questa
maglia» e del «gol numero 100» — difetto della sonda, corretto tenendo presenze < 50 e gol fuori da quelle finestre).

## Guardiano

`npm run storia-355` (verde + rosso, ~1 min): A nessun «da anni» prima della 3ª stagione, «scorsa stagione» solo in 2ª,
«appena cominciata» solo in 1ª; B nessun «di nuovo/ancora/rimette/torna/riparte sempre» prima del primo incrocio e
nessun «per la prima volta/primo incrocio» dopo; C copertura ≥40 capitoli per stagione, «testa a testa» in ognuna,
nulli o errori = non giudicato = rosso. Rosso `window.__CPM_NO_G355`: deve far cadere A e B. Entrato nella riga della MAPPA
che già esiste per `src/18-|src/10-` (`mappa-unica` verde).

## Catena del giro

`node ci-runner.mjs giro storia-355 career-critical` (+ 17 sentinelle): vedi «Esito» in fondo.

## Dubbi per il PO

**1. L'intervista post-partita «Di fronte c'era il tuo rivale di sempre» (src/07, contesto `f_rivale`).** Stessa
famiglia, ma fuori dall'ambito «La tua storia» e in un file che non ho toccato.
- **(consigliata, applicata)** Lasciarla a un giro a parte con la stessa regola degli anni (`season − proSeason`),
  perché le interviste hanno il loro guardiano e il loro mazzo.
- Allargare ora questo giro alle interviste.
- Lasciarla com'è: «di sempre» in conferenza si legge come enfasi del giornalista.

**2. Cosa conta come «già affrontati».** Ho usato «seconda stagione insieme» oppure «gara di questa stagione contro il
suo club». In 2ª stagione è possibile, raramente (rivale passato a un'altra lega), non averlo mai incontrato davvero.
- **(consigliata, applicata)** Regola semplice sugli anni + gara della stagione: copre il caso della foto e il primo
  incrocio, senza campi nuovi nel salvataggio.
- Contare gli scontri veri con un contatore nuovo nel salvataggio (`rival.incontri`), con migrazione.
- Usare solo gli anni (anche il primo incrocio della 2ª stagione direbbe «di nuovo»).

**3. Da quando «da anni».** Ho messo la soglia a 3 stagioni (2 stagioni = «dalla scorsa stagione», più esatto).
- **(consigliata, applicata)** 3 stagioni.
- 2 stagioni.
- Il numero vero sempre («un equilibrio che dura da 4 stagioni»), senza «da anni».

## Esito

`node ci-runner.mjs giro storia-355 career-critical` sul commit 13311fb (7.999.209 + questo giro): **18/18 verdi**, nessun
passo instabile — storia-355 · mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system ·
tema-unico · griglia-mobile · render-3d-023 · tunnel-285 · home-298 · web-237 · **career-critical** · battito-264 ·
partita-vera · gk-dive-sync · schermate-97. (`career-critical` è anche fra le sentinelle: 18 passi, non 19.)
Fuori ambito e non toccati: src/03, flusso settimana/rinnovo, src/14, src/12/16, GAME_VERSION.
