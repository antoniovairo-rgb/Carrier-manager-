# Rapporto giro 79 — collaudi 7.999.175 (3D e carriera)

- **Ramo:** `sviluppo/collaudo175-giro79`, da `origin/main` 6ba91d4e. `GAME_VERSION` non toccata, niente merge su `main`.
- **Fonti:** `docs/collaudi/RAPPORTO-7.999.175-3d.md` (ramo `collaudo/7.999.175-3d`), `docs/collaudi/RAPPORTO-7.999.175-carriera.md` (ramo `collaudo/7.999.175-carriera`, riga F2), decisioni della sessione principale.
- **Build:** `node tools/build-src.mjs` e `node tools/check-src.mjs` verdi («IDENTICO BYTE PER BYTE»), 6 747 886 byte.

## Sintesi

| # | Rilievo | Esito | Interruttore rosso | Guardiano |
|---|---|---|---|---|
| 1 | Scheda «Rigore per loro» dopo il rigore A FAVORE dell'eroe (media) | **corretto** | `__CPM_NO_RIG79` | `rigore-79.mjs` (nuovo) |
| 2 | PO-284 apertura dell'angolo: corpi-073 cieco e seme 3 instabile (media) | **guardiano non più cieco**; causa trovata, **correzione ritirata** (punto aperto) | — | `corpi-073.mjs` (284f) |
| 3a | Intestazione del 2° tempo invertita rispetto al tabellone 3D (bassa) | **non è un difetto di codice**: specchio voluto dal 46' (scelta di prodotto aperta) | — | — |
| 3b | Due voti per la stessa partita: pagella 8,1 contro «Cronaca di Sport … (voto 7.5)» (bassa) | **corretto** | `__CPM_NO_VOTO79` | `voto-79.mjs` (B) |
| 3c | Minuti dei gol sfasati in «Momenti chiave»; rigore segnato `miss` in timeline (bassa) | **punto aperto** (causa probabile, non provata) | — | — |
| 4 | «✨ Enfant prodige (N anni)» per età ≤ 19 senza il tratto | **corretto** | `__CPM_NO_ENFANT79` | `voto-79.mjs` (A) |
| F2 | Ufficio a 360 px: «Livello» e «3/3» vanno a capo (collaudo carriera, bassa) | **corretto** | `__CPM_NO_LIV79` | `livello-79.mjs` (nuovo) |

## 1. «Rigore per loro» dopo il rigore dell'eroe

**Causa (letta e misurata).** Il tabellino del motore conta il rigore sul lato di **chi commette il fallo**:
`src/14-motore-possesso.jsx:722` (prima della patch; ora +5 righe) emette `fermoSet("pen", l, …, {chi: chi(m.p), …})` con `m` = il difensore più vicino della squadra avversaria a `l`; il contatore `case 'rigore': A.rigori++` (r. 338) usa `A = S.tab[e.chi.team]`. Quindi `away.rigori` sono i rigori **concessi** dagli avversari, cioè quelli a favore della squadra dell'eroe (nel live `home` = squadra dell'eroe, `latiTabellino10`, `src/15-live-match.jsx:146`). Il live li leggeva come «rigori per loro» (`src/15-live-match.jsx:6188`, `_t.away.rigori` → `rigContro` → `INT259` fatto `rigore_contro`, `src/14-motore-possesso.jsx:106`).

**Correzione.** `INT259.rigLoro(t)` (src/14, accanto a `INT259.recente`) restituisce `home.rigori` (rigori concessi dalla squadra dell'eroe = rigori per loro). Il live usa quella funzione. Con `__CPM_NO_RIG79` torna `away.rigori`. Allineato anche il banco di `schede-259.mjs` (B), che faceva la stessa lettura.

**Regressione rispetto alla 174?** No. La stessa riga è a `src/15-live-match.jsx:6187` del commit f6a73df2 (ROADMAP 7.999.174). Esiste dal giro 28 (f16c7fed, PO-259, 15/10).

**Misure (`rigore-79.mjs`).**
- (A) node, banco del motore, 24 configurazioni S12 × 8 semi (~30 s):
  - **verde**: 60 rigori della squadra dell'eroe (52 battuti dall'eroe) → **0** schede «rigore per loro»; 13 rigori degli avversari a partita aperta (|diff| ≤ 1, entro l'84') → **13** schede.
  - **rosso**: gli stessi 60 → **37** schede (es. seme 7, rigore nostro all'11' → scheda al 12'); i 13 rigori avversari → **0** schede.
- (B) browser, opzionale (`CPM_BROWSER=1`), partita k12 del salvataggio `save-190-s12-ovr93` (rigore dell'eroe all'8'):
  - **verde**: rigori a favore 1, concessi 0, schede `[]`.
  - **rosso**: schede `["rigore_contro@8"]`.
- Il braccio (A) esce con 2 (cieco) se il banco ha meno di 2 rigori per lato.

## 2. PO-284 apertura dell'angolo (`corpi-073.mjs`)

**Tre corse intere** (`node corpi-073.mjs`, una dopo l'altra, macchina con carico 2,8-4,4 su 4 core, nessun altro collaudo in esecuzione):

| Corsa | 282 inclinazione max | 283 piede più basso | 284f seme 3 | 284f seme 11 | 284f seme 29 | Uscita |
|---|---|---|---|---|---|---|
| 1 | 14-16° | 0,15 m | 0/23 · 0/22 | 0/20 · 0/23 | 0/22 · 0/24 | 0 |
| 2 | 14-17° | 0,15 m | **12/21** · 0/22 | 0/21 · 0/22 | 0/24 · 0/20 | 0 |
| 3 | 14-16° | 0,15 m | 0/20 · 0/23 | 0/19 · 0/21 | 0/21 · 0/21 | 0 |

Il seme 29 ha campioni in tutte le corse (20-24 per apertura): lo «0 campioni» del collaudo era il carico. Il seme 3 oscilla ancora, in 1 apertura su 6.

**Causa (misurata, non nel battitore).** Ho registrato le aperture del seme 3 (8 per corsa) con `__CPM_SNAP42` (dove lo stacco di scena mette il pallone), `__CPM_RSNP401` (ri-tagli) e `ballTarget`. Nell'apertura cattiva (001 in 16/22):
- entrambi gli scatti del pallone cadono a (16,14; 0,36) di mondo, cioè (66,1; 50,5) logico: il pallone di gioco;
- nessuno scatto lo porta alla bandierina (97; 97,5) e non c'è nessun ri-taglio;
- il pallone scivola da (68,53) a (83,76) per tutta la finestra 0,75-2,4 s, mentre il battitore è sulla bandierina.

Nelle aperture buone l'ultimo scatto è sulla bandierina (47; 32,3 di mondo). Il meccanismo:
- `__CPM_FORCE_SIT` mette in coda staging, `hlIdx` e fase;
- il punto-palla della scena lo scrive solo l'effetto «Ball attachment» (`src/15-live-match.jsx` ~r. 8710, `setBallPos(_sp)`), un commit **dopo** il taglio;
- lo scatto del renderer al cambio di chiave (`src/12-three-match-view.jsx:3782-3787`) legge `P.ballX/ballY` del commit del taglio;
- il ri-taglio del 7.456 scatta solo quando cambia `stageStamp` (`src/12-three-match-view.jsx:6872`, `6922`), e qui non cambia.

Quando fra la forzatura e il commit passa un fotogramma, il pallone resta sul punto vecchio. Il battitore dello staging (giro 73, `__CPM_NO_BATT073`) non c'entra: era al suo posto (battitore 1/8/9, compagno a 0,0-1,0 u dalla bandierina in tutte le aperture buone).

**Correzioni provate e ritirate (misura alla mano):**
1. Punto-palla scritto in `ballPos` dentro `stageSitPositions`, nello stesso lotto di `stageStamp`. Primo scatto ancora lontano in **2/8** aperture: nessun guadagno, ritirata.
2. Nell'effetto «Ball attachment», se il pallone va spostato di oltre 3 u a scena aperta, `setStageStamp` (ri-taglio 7.456, una volta per scena). Primo scatto sul punto in **8/8** e **8/8**. Ma la prova alla pari (seme 3, 8 aperture per braccio, stessa macchina) ha mostrato due cose:
   - il ri-taglio scattava in **8/8** aperture verdi, non solo nella corsa sfortunata;
   - compariva uno **sfarfallio** del compagno più vicino (0,0 ↔ 28-39 u da un campione all'altro): 10/20 in 1 apertura verde su 8 e 4 aperture su 14 nelle corse verdi del giorno, contro 0 su 8 nel braccio rosso e 0 su 26 nelle corse prima della modifica.

   Un difetto nuovo per toglierne uno raro: **ritirata**. Nessuna modifica al gioco resta per il punto 2.

**Guardiano non più cieco (284f), soglie invariate.**
- Ogni seme deve dare almeno `CPM_APERTURE073` = 2 aperture **misurate** (≥ 4 campioni nella finestra). Un'apertura senza campioni si rifà su una pagina nuova, fino a `CPM_TENTATIVI073` = 5 tentativi.
- La cecità si valuta **per seme**: prima bastavano 2 aperture in totale.
- Il codice 001 resta «≥ 75% dei campioni con nessuno entro 3,5 u», e basta un'apertura così per il rosso.
- Il primo scatto del pallone è stampato e salvato in `out/corpi-073.json` (`dSnap`) come **misura, non verdetto**: come verdetto renderebbe il guardiano rosso a intermittenza per il difetto qui sopra, che resta aperto.

## 3. Rilievi bassi

**3a — intestazione del 2° tempo.** Non è un errore di numeri. Dal 46' la barra superiore si specchia di proposito: `_swap893` (`src/15-live-match.jsx:10342`, rosso esistente `__CPM_NO893`), con l'etichetta «cambio campo» (r. ~10525, 7.905 «nota PO: non ho notato l'inversione degli stemmi»). Il tabellone 3D resta casa–trasferta.

Il testo estratto dal collaudo segue l'ordine del DOM, non quello a schermo. Esempio k12, 47': il DOM dà «TYN FC Tyneside 2–0 … MER», a schermo si vede «MER 2–0 TYN». Nessuna modifica: vedi punti aperti.

**3b — due voti.** Causa:
- il pannello di fine gara costruiva le testate («DALLE ALTRE TESTATE», `generateLocalPressAnalysis`) con `_ratP` = formula dei bonus delle scene (`src/15-live-match.jsx:11950` prima della patch);
- la PAGELLA usa il voto del motore (r. ~11915, `__CPM_NO_NUMERI23`);
- il 7.999.20 aveva unificato il voto **registrato** (r. 9857-9861), non questo giornale.

Ora `_ratP` prende il voto della pagella del motore, quando c'è. Il testimone `window.__CPM_VOTO79` registra il voto usato.

Misura `voto-79.mjs` (B), partita k12 a fine gara:
- **verde**: pagella 7,8 · testata «(voto 7.8)» · testimone 7,8 · motore 7,8;
- **rosso** (`__CPM_NO_VOTO79` acceso a partita finita + nuovo render): testata «(voto 7.5)», testimone 7,5, pagella 7,8.

Il voto di k12 è 7,8 qui e 8,1 nel collaudo: con la mia corsa non posso confermare che sia la stessa partita al decimo (autoplay a tempo reale).

**3c — minuti e rigore `miss`.** Lasciato aperto. Dati k12 (`dati-migk12.json` del collaudo):
- registro del motore: gol dell'eroe a m8 `scena:false` e a m18 `scena:true`;
- timeline: la scena del rigore al 9' è `ok:false key miss outKind saved`;
- punteggio 1-0 già all'`hl_intro` del 19'.

Causa **probabile, non provata** (Non posso confermarlo senza una corsa strumentata): il rigore dell'eroe sarebbe risolto **due volte**. `_piaz27` (`src/14-motore-possesso.jsx:1133-1136`) apre la scena e aspetta il live fino a 40 tick (`f._o27<40`). Scaduta l'attesa, il motore batte da sé (r. ~1144, `tira(T,{intent:"penalty"})`), e il gol fluido dell'8' finirebbe in punteggio e pagella mentre la scena del 9' si gioca e viene parata.

Lo sfasamento 10'/19' contro 8'/18' sarebbe il ritardo con cui il live narra il gol del motore in coda (dopo l'highlight) e quello della scena. Rischio non basso (motore + scena): nessuna modifica.

## 4. Enfant prodige

Confermato:
- `src/09-audio-scout-anagrafiche.jsx:737` (prima della patch) scriveva `✨ Enfant prodige (N anni)` per `age<=19`, senza guardare il tratto;
- dalla 175 `haTrattoEnfant` (src/06:871) è sempre falso con lo stile unico.

Ora la memoria esce solo se `haTrattoEnfant` è vero. Rosso `__CPM_NO_ENFANT79`. Misura `voto-79.mjs` (A), funzione vera in pagina, 17/18/19/24 anni:
- **verde**: `[null, null, null, null]`;
- **rosso**: «Enfant prodige» a 17, 18 e 19 anni, `null` a 24.

## F2 (collaudo carriera) — «Livello 3/3» a capo a 360 px

Causa: nella riga dello staff (`src/18-career-app.jsx:10780-10781`) il nome, i tre puntini e lo `<span>` «Livello N/3» erano tre elementi flessibili di una riga che non va a capo. A 360 px lo `<span>` si stringeva e spezzava il testo al suo interno.

Ora puntini + «Livello N/3» stanno in un blocco unico (`data-cpm="staff24-blocco"`), «Livello N/3» non si spezza (`nowrap`) e la riga può andare a capo: se manca posto, il blocco scende intero sotto il nome. Rosso `__CPM_NO_LIV79`.

Misura `livello-79.mjs` (salvataggio save-190, preparatore al livello 3, Ufficio), righe di testo per etichetta:
- **verde**: 1/1/1 a 360 e a 412 px, scroll orizzontale 0;
- **rosso**: «Preparatore atletico» su **2** righe a 360 px.

Foto: `tests/visual/out/livello-79-verde-360.png` (non committata).

## Guardiani e catene

- **Nuovi** (in `package.json`, nella catena `completa` e quindi in `notte`, e nella MAPPA):
  - `rigore-79`: src/14, src/15;
  - `voto-79`: src/05|09, src/15, fra i LENTI;
  - `livello-79`: src/18|16|10, e nella catena `grafica`.
- **Toccati:**
  - `corpi-073.mjs`: 284f per seme con riprova, misura del primo scatto;
  - `schede-259.mjs`: banco (B) con `INT259.rigLoro`.
- **Chiavi oggetto doppie:** controllo con l'AST di Babel su src/09, src/14, src/15, src/18 e sui .mjs toccati. Zero doppioni nuovi. Uno preesistente, fuori dal mio diff: `setOffer` due volte nel gancio di prova `__CPM_CAREER` (`src/18-career-app.jsx:1431` e `:1493`, stessa implementazione).
- **Catena mirata** (`node ci-runner.mjs mirata`, 107 passi per src/09, 14, 15, 18): esito sotto.

## Esito della catena mirata

`node ci-runner.mjs mirata` (107 passi) è stata **fermata dal limite di 2 ore** del comando in sottofondo, dopo 25 passi. Non l'ho rilanciata tale e quale: il registro `STABILITA.json` non è stato scritto.

- **Verdi nella mirata (25):** test:logic, save-compat, design-system, typing-shortcuts, lessico-218, migrazione-194, classifica-194, classifica-102, brusio-238, esiti-241, **rigore-79**, stili-098, pagella-75, passaggi-228, tabellino-216, possesso-209, brain-202, statistiche-228, schede-260, esiti-60, **corpi-073** (logica nuova), ripartenza-235, pallino-278, pillola-58, tabellino-lati.
- **Rosso:** `tempo-138`, «rosso: il difetto non si vede» (braccio rosso cieco, `pagato 220 · residuo 0`). **Preesistente:** rosso identico su `main` 6ba91d4e nel worktree di confronto (`pagato 176 · residuo 0`, uscita 1). Le mie modifiche non toccano il recupero. Non è in nessuna catena dal 09/10 (ultimo verde in `STABILITA.json`: 7.999.155).
- **Gruppo mirato dopo lo stop**, sul commit del ramo, uno alla volta: **livello-79** (78 s), **voto-79** (317 s), career-critical (776 s), barra-360-72 (72 s), schede-259 (709 s), schede-234 (567 s), interazioni-226 (1125 s), schede-246 (546 s). **8/8 verdi.**
- **Fuori dalla mirata e non rieseguiti** (circa 74 passi della MAPPA di src/14, 15, 09, 18): fra gli altri partita-vera, validate-situations, tabellino-228, intervista-231, giornale-244, esiti-218, scene-221, i guardiani carriera di src/18. Vanno coperti dalla catena `notte` prima della promozione.

## Punti aperti (per il PO o per un giro dedicato)

1. **PO-284, pallone dell'angolo che nasce sul punto di gioco** (~1 apertura su 8 del seme 3, forzata). La causa è misurata (sopra). Servono una correzione nel renderer o nel commit della forzatura che non generi lo sfarfallio, e una misura sul flusso vero (284v) per sapere se il caso capita anche lì: non l'ho misurato.
2. **3a, barra specchiata nel 2° tempo contro tabellone 3D casa–trasferta:** scelta di prodotto. Tenere lo specchio (7.893/7.905, chiesto dal PO) o allineare barra e tabellone.
3. **3c, rigore dell'eroe risolto due volte** (gol fluido del motore all'8' + scena parata al 9', k12): causa probabile da provare con una corsa strumentata (`_piaz27`, attesa di 40 tick); i minuti sfasati sono probabilmente il ritardo di narrazione.
4. **3b, voto di k12:** 7,8 nella mia corsa contro 8,1 nel collaudo. Non posso confermare se dipenda dal tempo reale dell'autoplay.
5. **`tempo-138` rosso anche su main** (braccio rosso cieco): da riparare (direttiva PO 13/10: un guardiano instabile si ripara).
6. **Catena mirata incompleta** (fermata a 2 h): prima della promozione serve la `notte` sul commit di questo ramo.
7. **Doppione `setOffer`** nel gancio `__CPM_CAREER` (src/18:1431 e 1493): innocuo (stessa funzione), da pulire in un giro di manutenzione.
