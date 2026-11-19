# Rapporto giro 289 — schermate da PC (PO-548)

Versione di riferimento 7.999.198 (rapida), decisioni PO del 19/11 «Censimento PC di tutte» e «Riquadro compatto».
Partenza `lavoro/198` (f194bf8), ramo `sviluppo/giro289-pc`. Solo grafica da PC (larghezze ≥ 1024 px): nessun cambio di funzione,
nessun cambio al telefono (misurato, vedi sotto), `GAME_VERSION` non toccata.

## In breve

- **Censimento** di 18 schermate × 2 larghezze (1366×768, 1920×1080), con 6 misure dal DOM e una foto per ognuna:
  `docs/sviluppo/giro289/CENSIMENTO-PC.md` (foto in `giro289/foto/`, foto «prima» in `giro289/foto-prima/`).
- **Offerte ricevute corretta** secondo «Riquadro compatto», più **una regola comune da PC** applicata alle altre schermate peggiori
  (Coppe vuota, Calendario, Classifica, Profilo, Nazionale, Agente, Fine stagione).
- **Guardiano nuovo** `npm run pc-289`: verde 120/120 controlli; braccio rosso (`__CPM_NO_G289`) che vede il difetto su tutte e 8 le
  schermate corrette; telefono 360 e 412 identico (impronta dei rettangoli) su tutte e 8, con la sua prova del rosso.

## PO-548 — Offerte ricevute: cosa ho misurato

⚠️ La foto citata `docs/collaudo-po/197-offerte-pc.png` **non è nel repo** (cercata: c'è solo `197-tunnel-fascia-nera.png`). Ho
riprodotto la schermata con provini da 2 gol e voto medio 6,8, come la frase della foto; i club che escono possono essere diversi da
quelli del PO (le offerte dipendono da nome e risultati dei provini, giro 201). Non posso confermare che sia la stessa identica schermata.

| Punto della nota | Causa misurata | Prima (1366 / 1920) | Dopo |
|---|---|---|---|
| (1) riquadri lunghi fino in fondo, contenuto a metà | la regola «schermata piena» del giro 114 (PO-320) dava `flex:1 0 auto` alla griglia e ai riquadri, con contenuto centrato in verticale | riquadro 890 px per 79 di contenuto (1920) | alti quanto il contenuto |
| (2) riquadri vuoti | stessa causa: è il vuoto sopra e sotto la riga del club | V = 2 | V = 0 |
| (3) due «Scegli» diversi | **non è un difetto del riquadro: è la selezione da tastiera.** `selIdx` parte da 0, il tasto della card selezionata è `primary` (chiaro, maiuscolo «SCEGLI →»), gli altri `secondary` (scuro «Scegli →»). Col mouse sembrava una scelta già fatta. Il bordo rosso è il contorno di selezione; «Consigliata» è il prestigio più alto (giro 49) | P = 1 | P = 0: da PC tutti i «Scegli» hanno lo stesso stile; la selezione da tastiera resta visibile col contorno del riquadro |
| (4) spiegazione su una riga lunghissima | nessuna larghezza massima del testo | 231 / 246 caratteri per riga | 85 al massimo |

Colonna: da PC le offerte stanno in una colonna larga al massimo 736 px (`SP.xxxl × 23`), centrata in orizzontale e in verticale, una
offerta per riga. Foto: `giro289/foto-prima/1366/offerte.jpg` → `giro289/foto/1366/offerte.jpg` (e le stesse a 1920).

## La regola comune da PC (src/19, `@media (min-width:1024px)`, rosso `__CPM_NO_G289`)

1. **Un riquadro è alto quanto il suo contenuto**: da PC la «schermata piena» non allunga più i riquadri delle Offerte e della sezione in
   anteprima (Coppe vuota: 874 px per 220 di contenuto → compatta).
2. **Colonna con larghezza massima e centrata** (`.cpm-pc289`) per le schermate senza barra laterale (oggi: Offerte).
3. **Larghezza di lettura** per il testo corrente: `.cpm-leggi289` (allineato a sinistra) e `.cpm-leggi289c` (centrato), `max-width: 62ch`.
   Messa su 12 testi: spiegazione delle Offerte; righe dell'anteprima di sezione (Coppe); legende di Calendario e Classifica; «Prossimo
   gradino» del Profilo; rapporto col CT (Nazionale); due righe dell'Agente; quattro testi della Fine stagione.

Tutti i valori vengono dai token (`SP`, `FS`, `TH`); nessun colore o raggio nuovo («un tema solo»: `tema-unico` verde).
File toccati: `src/11`, `src/16`, `src/17`, `src/18`, `src/19` (+ `CARRIER-MANAGER-AV.html` ricomposto, `check-src` IDENTICO byte per byte).

## Il guardiano `npm run pc-289`

- **Verde** (8 schermate × 1366 e 1920): V, L, P, A, C = 0 e nessuno scorrimento senza motivo → 80 controlli verdi.
- **Rosso** `__CPM_NO_G289`: su ognuna delle 8 schermate la sonda deve vedere almeno un difetto (sommando le due larghezze), altrimenti
  è cieca su quella schermata → 8 verdi. Esempio Offerte: V 2 · L 1 (231) · P 1 a 1366.
- **Telefono** 360×800 e 412×915: impronta (hash dei rettangoli di tutti gli elementi visibili) identica fra verde e rosso → 16 verdi.
  Prova del rosso del controllo: `CPM_289_PROVA_TEL=1` forza la regola anche al telefono e i 16 controlli cadono tutti (provato).
- «Non giudicato» (schermata che non si apre) = rosso. Totale ultima corsa: **120 ok, 0 KO**.

Due riparazioni dello strumento durante il giro (no blind fix): (a) a una corsa l'impronta del telefono di Fine stagione a 360 era
diversa di 1 px su uno `span` fuori schermo animato: la lettura ora si ripete dopo un nuovo congelamento delle animazioni finché due
letture coincidono (due corse identiche dopo); (b) i primi «riquadri vuoti» a contenuto zero erano strati decorativi (`aria-hidden`,
bagliori assoluti): esclusi, e dichiarato.

## Controlli eseguiti (catena «solo grafica», uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito |
|---|---|
| `pc-289` | ✅ 120/120 |
| `griglia-mobile` | ✅ uscita 0, 14 schermate × 5 larghezze (foto di `docs/collaudo-grafico/g0` rimesse con `git checkout --`) |
| `design-system` | ✅ SISTEMA GRAFICO OK |
| `tema-unico` | ✅ verde + rosso atteso |
| `career-critical` | ✅ PASS |
| `test:logic` | ✅ |
| `save-compat` | ✅ 12 pass · 0 fail |
| `altezza-114` (Offerte, Coppe vuota) | ✅ verde+rosso **dopo** aver dichiarato un'eccezione: vedi Dubbi 1 |
| `provini-201` (Offerte) | ✅ (foto di `docs/sviluppo/giro201` rimesse con `git checkout --`) |
| `spazio-296` (spazi fra riquadri) | ✅ |
| `misura-213` (tocco, sonda) | ✅ uscita 0 (Scegli: riscontro 11 ms) |
| `flussi-115` | ⚠️ uscita 1, **preesistente**: 52 OK · 0 NO · 2 non giudicati, entrambi `G184-11` (campioni della battuta finale di una partita, 360 e 412). Sul build di partenza `lavoro/198` lo stesso identico «non giudicato» (2 campioni, 1,1-1,2 s): non dipende da questo giro, che non tocca la partita né il telefono |

Non eseguiti per mandato: `highlight-95`, `ingresso-206`, `ci-runner mirata`. Il gate 14/14 non è nella catena «solo grafica».

## Schermate NON corrette (per la 198)

| Schermata | Cosa resta (misurato) | Perché non ora |
|---|---|---|
| Ufficio | L 5, righe fino a 158 (1366) / 169 (1920): «Non attivo. Livello 1…», «Un vivaio col tuo nome…», legenda `trainer288-legenda` | una delle righe è del giro 288 in corso; la regola `.cpm-leggi289` basta metterla su quei testi |
| Provini · prima del provino | A: «⚡ Inizia il provino» staccato 250 px dal contenuto a 1920 | contrasta con G184-02 «schermata piena» del giro 115 (vedi Dubbi 5); ritoccato e poi ritirato in questo giro |
| Home fuori carriera | V 1 (840/202 px), L 1 (115), A 1 («NUOVA CARRIERA» a 556-868 px dal contenuto) | giro 284 |
| Home di carriera | L 1 (139) | giro 284 |
| Pre-partita · menu a tendina · scritte «[0]» | non misurati | giri 287, 284, 288 |
| Rassegna dopo partita, HUD di partita, cerimonie 3D | non nel censimento | servono partite intere; fuori dal tetto del giro |
| Tablet | non misurato | la regola parte da 1024 px: vale anche per il tablet orizzontale 1024×768, non per quello verticale |

## Dubbi per il PO

1. **«Riquadro compatto» contro «Sfrutta tutta l'altezza» (PO-320, giro 114).** Da PC, con due offerte compatte, sotto resta spazio
   vuoto: `altezza-114` lo bocciava (23% a 1440×900). Non ho abbassato la soglia: ho dichiarato nel guardiano un'eccezione nominata
   («Offerte, solo PC, decisione PO 19/11»), che stampa la riga e lascia il giudizio a `pc-289`. Al telefono la regola del 114 resta.
   Va bene così, o la «schermata piena» deve valere anche da PC?
2. **Centrato anche in verticale.** Ho letto «tutto centrato» come centrato in orizzontale **e** in verticale (il blocco Offerte sta a
   metà altezza). In alternativa può stare in alto.
3. **Stile unico dei «Scegli»**: ho scelto quello chiaro (`primary`) per tutti; la selezione da tastiera ([1]/[2]/frecce) resta solo
   come contorno del riquadro. In alternativa tutti scuri, o chiaro solo col mouse sopra.
4. **Una offerta per riga** (colonna da 736 px) invece della griglia a due colonne: con tre offerte la griglia lasciava la terza da
   sola. Da confermare.
5. **Provini da PC**: il tasto «Inizia il provino» sta in fondo allo schermo, 250 px sotto il contenuto (a 1920). È la decisione G184-02
   del giro 115; l'avevo avvicinato al contenuto e l'ho ritirato perché `flussi-115` lo boccia. Lo vuoi attaccato al contenuto da PC?
6. **Larghezza di lettura**: con 62ch le righe arrivano a 82-88 caratteri al massimo (la media è più bassa): un po' sopra i 70-80 della
   nota. Si può stringere a ~56ch se il PO preferisce.
7. **Coppe vuota**: il testo ora va a capo a 62ch ma le righe grigie restano larghe quanto la colonna (1322 px a 1920): resta del grigio
   vuoto a destra. Si potrebbe stringere tutto il riquadro.
8. **Tablet orizzontale 1024×768** riceve la stessa regola del PC (soglia 1024 px della nota). Non l'ho fotografato.

## Commit sul ramo

`15211fe` censimento + Offerte + regola + guardiano · `84fa628` rosso su ogni schermata e impronta stabile · `f23543b` eccezione in altezza-114 ·
`7d3523e` ritirato il ritocco dei Provini · ultimo: documenti. Nessuna promozione su `main` (la fa la madre).
