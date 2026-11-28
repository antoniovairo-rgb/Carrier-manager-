# Rapporto giro 453 — PO-694 «nomi della Championship troppo vicini alla realtà» (copyright, prima dello store)

**Base:** `main` 7.999.219 · **Ramo:** `sviluppo/giro453-nomi-championship` · GAME_VERSION e `docs/governo` non toccati.
**Voce:** PO-694. Il PO scrive: «Controlla i nomi delle squadre di championship, alcuni sono troppo vicini alla realtà».
⚠️ La foto `docs/collaudo-po/220-championship-nomi.jpg` **non c'è** su questa base: non l'ho vista. Ho lavorato sulla descrizione
della madre e sui dati del gioco.

## 1. Misura: tutte le leghe (252 club)

I dati vengono dal gioco stesso: `CLUBS` valutato in node da `src/02`, quindi con le tabelle 248, 251 e le sigle effettive.
Prima del giro, **251 nomi su 252 hanno la forma «FC» + parola**. Questo è voluto: il PO ha scelto città o zona il 17/11
(PO-511/512, «Città o zona», decisione delle 14:50 «Tengo i miei nomi, rischio mio»). La sigla, per la regola strutturale del
7.298, è una sottosequenza del nome. Per questo una città vera dà quasi sempre la sigla televisiva della squadra vera.

Ho classificato il rischio in quattro classi. Le classi A e B le ho riconosciute a memoria: i nomi dei club e dei soprannomi veri
sono noti, ma **in questa sessione non li ho verificati su una fonte esterna uno per uno**.

| Classe | Cosa rimanda al club vero | Club | Azione |
|---|---|---|---|
| **A** | il nome vero o quasi: «Aston», «Sociedad», «Munchen» o «Koln» senza dieresi, «Antwerp», «Farense», «Kasimpasa», «Pau», «Monaco», «04», «1919», «Manzanares» con sigla ATM | 14 | rinominati |
| **B** | un soprannome, uno stadio o un quartiere storico veri: Hornets, Hammers, Goodison, Foxshire, Craven, Griffin, Stamford, Submarino, Pucela, Sarrià, Leonessa, Queensway, Bermondsey, Teesside | 14 | rinominati |
| **C** | una città vera con la sigla vera, nella Championship segnalata dal PO | 12 | rinominati (tutta la Championship) |
| **D** | una città vera da sola, con sigla derivata e colori del club vero: FC Hannover, FC Lisboa, FC Genk, FC Manchester, FC Merseyside… | ~200 | **non toccati**: scelta del PO del 17/11, vedi dubbio 2 |
| colori + stemma | i colori `c`/`c2` sono quelli dei club veri in quasi tutte le righe; lo stemma è procedurale (forma seedata e pattern del kit), mai un logo | 252 | non toccati, vedi dubbio 3 |

**Derby con il nome vero** (`DERBIES`, src/08): «El Clásico», «Der Klassiker», «Le Classique», «De Klassieker» e «Derbi Madrileño».
Gli altri derby erano già inventati (giro 159).
**Stadi:** «Aston Park» (avl), «Stadio Salernum» (sal), «München Arena» (bay) seguivano i nomi tolti. Resta «Riverside Park» (che):
è una parola generica, ma ricorda il «Riverside Stadium» di un altro club, vedi dubbio 4.
**Albo e record:** sette citazioni letterali (FC Stamford ×4, FC Foxshire, FC Submarino, AT Manzanares, FC Hammers, FC Sarrià) ora
passano dal nome finale (`_nc251`).
**Testi della cronaca:** nessun nome di questi club è scritto nei testi. Sono tutti segnaposto che leggono `CLUBS`
(grep su `src/03`, `src/05`, `src/14` e `src/15`).

## 2. Correzione

`src/02` contiene la tabella nuova **`CLUB_NOMI_453`** (id → [nome, sigla]). Funziona così:
- Si applica sopra la tabella del 251 dentro `_nomi251`, quindi vale anche per le Primavera, che ereditano il nome.
- `_nc251` ora restituisce il nome finale.
- Gli **id non cambiano**.
- Il rosso `window.__CPM_NO_G453` riporta nomi, sigle, stadi, derby, migrazione e audit al 7.999.219.

Gli altri file toccati:
- **Nomi corti** (`CLUB_CORTI_296`): Costiera, Forgeham, Tipworth, Donostia., Valliso., Cottonford. Gli altri nuovi nomi hanno già
  10 caratteri o meno. Sono tutti unici e diversi dalla sigla.
- **Stadi** (`src/05`) e **derby** (`src/08`) passano da `_g453(nuovo, prima)`.

### Tabella vecchio → nuovo (40 club)

| id | lega | prima (sigla) | nuovo (sigla) | classe · motivo |
|---|---|---|---|---|
| `che` | Premier Division | FC Stamford (STA) | **FC Kingsreach** (KGR) | B — soprannome / stadio · stadio vero (Stamford Bridge) |
| `avl` | Premier Division | FC Aston (AST) | **FC Heathmoor** (HTM) | A — nome vero o quasi · metà del nome vero (Aston Villa) |
| `whu` | Premier Division | FC Hammers (HAM) | **FC Eastwharf** (EWF) | A — nome vero o quasi · soprannome vero (Hammers) |
| `eve` | Premier Division | FC Goodison (GDS) | **FC Northdock** (NDK) | B — soprannome / stadio · stadio vero (Goodison Park) |
| `lei` | Premier Division | FC Foxshire (FOX) | **FC Soarvale** (SRV) | A — nome vero o quasi · soprannome vero (Foxes) |
| `ful` | Premier Division | FC Craven (CRA) | **FC Millbourne** (MLB) | B — soprannome / stadio · stadio vero (Craven Cottage) |
| `bre` | Premier Division | FC Griffin (GRI) | **FC Bransholt** (BHT) | B — soprannome / stadio · stadio storico vero (Griffin Park) |
| `atm` | Liga Ibérica | AT Manzanares (ATM) | **FC Meseta Sur** (MSU) | A — nome vero o quasi · stadio/fiume storico + sigla vera ATM |
| `vill` | Liga Ibérica | FC Submarino (SUB) | **FC Naranjal** (NRJ) | A — nome vero o quasi · soprannome vero (Submarino Amarillo) |
| `rsoc` | Liga Ibérica | FC Sociedad (SOC) | **FC Donostiarra** (DNS) | A — nome vero o quasi · nome vero (Real Sociedad) |
| `esp` | Liga Ibérica | FC Sarrià (SRR) | **FC Tibidabo** (TBD) | B — soprannome / stadio · stadio storico vero (Sarrià) |
| `bay` | Deutsche Liga | FC Munchen (MUC) | **FC Alpenland** (APL) | A — nome vero o quasi · nome vero senza dieresi (FC Bayern München) |
| `kol` | Deutsche Liga | FC Koln (KLN) | **FC Rheinbogen** (RHB) | A — nome vero o quasi · nome vero senza dieresi (1. FC Köln) |
| `mon` | Ligue Nationale | FC Monaco (MCO) | **FC Rocher** (ROC) | A — nome vero o quasi · nome vero (AS Monaco) |
| `farense` | Liga Lusitana | FC Farense (FAR) | **FC Algarvio** (AGV) | A — nome vero o quasi · nome vero (SC Farense) |
| `ant` | Liga Belga | FC Antwerp (ANT) | **FC Schelde** (SCD) | A — nome vero o quasi · nome vero (Royal Antwerp FC) |
| `kas` | Liga Anatolica | FC Kasimpasa (KAS) | **FC Haliç** (HLC) | A — nome vero o quasi · nome vero (Kasımpaşa) |
| `sal` | Lega B | FC Salernum 1919 (SLR) | **FC Costiera** (CST) | A — nome vero o quasi · anno di fondazione vero (Salernitana 1919) |
| `bres` | Lega B | FC Leonessa (LNS) | **FC Cidneo** (CDN) | A — nome vero o quasi · soprannome vero (Leonessa) |
| `lut` | Championship | FC Luton (LUT) | **FC Dunmere** (DMR) | C — città vera + sigla vera · città vera + sigla vera |
| `mid` | Championship | FC Teesside (TES) | **FC Ironmouth** (IRM) | B — soprannome / stadio · regione del club (Teesside = Middlesbrough) |
| `cov` | Championship | FC Coventry (COV) | **FC Spirewell** (SPW) | C — città vera + sigla vera · città vera + sigla vera |
| `swn` | Championship | FC Swansea (SWS) | **FC Gowerhaven** (GWH) | C — città vera + sigla vera · città vera + sigla vera |
| `shu` | Championship | FC Sheffield South (SHS) | **FC Forgeham** (FGH) | C — città vera + sigla vera · città vera + «South» (lo United gioca a sud) |
| `ips` | Championship | FC Ipswich (IPS) | **FC Orwick** (ORK) | C — città vera + sigla vera · città vera + sigla vera |
| `lee` | Championship | FC Leeds (LEE) | **FC Wharfholm** (WHM) | C — città vera + sigla vera · città vera + sigla vera |
| `bur` | Championship | FC Burnley (BNL) | **FC Pendleby** (PDY) | C — città vera + sigla vera · città vera + sigla vera |
| `nor` | Championship | FC Norwich (NRW) | **FC Broadmere** (BMR) | C — città vera + sigla vera · città vera + sigla vera |
| `wba` | Championship | FC West Bromwich (WBR) | **FC Tipworth** (TPW) | A — nome vero o quasi · città vera + nome vero quasi intero |
| `bri` | Championship | FC Bristol (BRS) | **FC Brigport** (BGP) | C — città vera + sigla vera · città vera + sigla vera |
| `milw` | Championship | FC Bermondsey (BMD) | **FC Riverlane** (RVL) | B — soprannome / stadio · quartiere storico del club |
| `bla` | Championship | FC Blackburn (BBR) | **FC Cottonford** (CTF) | C — città vera + sigla vera · città vera + sigla vera |
| `pre` | Championship | FC Preston (PRE) | **FC Ribblemead** (RBM) | C — città vera + sigla vera · città vera + sigla vera |
| `car` | Championship | FC Cardiff (CDF) | **FC Llanmere** (LMR) | C — città vera + sigla vera · città vera + sigla vera |
| `wat` | Championship | FC Hornets (HOR) | **FC Colnemead** (CNM) | A — nome vero o quasi · soprannome vero (Hornets = Watford) |
| `sto` | Championship | FC Stoke (SKE) | **FC Kilnford** (KLF) | A — nome vero o quasi · città vera + nome vero |
| `qpr` | Championship | FC Queensway (QUE) | **FC Whitlock** (WTK) | B — soprannome / stadio · Queensway ~ Queens Park Rangers |
| `s04` | Deutsche Liga 2 | FC Emscher 04 (EMS) | **FC Emschertal** (EMT) | A — nome vero o quasi · «04» del nome vero (Schalke 04) |
| `pau` | Ligue Nationale 2 | FC Pau (PAU) | **FC Béarnais** (BEA) | A — nome vero o quasi · nome vero (Pau FC) |
| `vld` | Liga Ibérica 2 | FC Pucela (PUC) | **FC Vallisoletano** (VLS) | A — nome vero o quasi · soprannome vero (Pucela) |

| derby (src/08) | prima | nuovo |
|---|---|---|
| rma–bar | El Clásico | El Duelo del Siglo |
| bay–bvb | Der Klassiker | Der Gipfel |
| psg–marse | Le Classique | Le Grand Choc |
| ajax–feye | De Klassieker | De Grote Strijd |
| rma–atm | Derbi Madrileño | Derbi de la Meseta |

| stadio (src/05) | prima | nuovo |
|---|---|---|
| avl | Aston Park | Heathmoor Park |
| sal | Stadio Salernum | Stadio della Costiera |
| bay (e pool) | München Arena | Alpenland Arena |

**Come ho scelto i nomi.** Sono nomi di località inventati che richiamano la zona: fiume, collina, mestiere storico o regione. Per
esempio Orwick per l'Orwell di Ipswich, Kilnford per le fornaci di Stoke, Pendleby per Pendle Hill, Spirewell per le guglie di
Coventry. In questo modo restano «associabili», come chiedeva il PO-511, ma non sono più il nome della città.
**Non posso confermare** che nessun club dilettantistico al mondo porti uno di questi nomi: non ho fatto ricerche esterne.
Nessuno è il nome di un club professionistico che io conosca.

## 3. Salvataggi

Il salvataggio contiene il NOME del club, non solo l'id: `club.n`, `standings[].n/a`, `calendar[].opponentName`,
`matchHistory[].opponent/oppAbbr`, i testi del diario, gli stadi e così via. Non ho alzato SAVE_VERSION. La migrazione è
**additiva** e passa dalla catena che esiste già (`_migraNomi248` in `migratePlayer`):
- `_DEF453` porta sia i nomi del 251 sia quelli delle righe `mkT` al nome nuovo **in un passo solo**;
- `_DEF251` ora punta al nome finale;
- le sigle accanto seguono il nome (`_CLUB_ABBR_248`);
- gli stadi vecchi sono in `_STADI_248`.

**Difetto trovato e corretto dal guardiano:** `_renameClub6` sceglieva il primo prefisso nell'ordine d'inserimento. Così
«FC Salernum 1919 Primavera» diventava «FC **Costiera 1919** Primavera». Ora vince il prefisso più lungo (`_CHIAVI453`).
Ripassare la migrazione non cambia più nulla, cioè è idempotente.

⚠️ **Osservazione fuori ambito, preesistente:** se in un salvataggio di stagione 5 si inseriscono righe sintetiche di stagione 1
in `matchHistory`, la migrazione ripara il calendario in due passate. Succede anche col rosso, cioè senza il giro 453. Il
guardiano mette le sue righe di prova in un campo neutro e la segnala qui.

## 4. Audit copyright esteso

`src/09` contiene la lista nuova **`_CR_ZONE453`** con 59 voci: le città della Championship, soprannomi, stadi, nomi veri dei
club, «1919», «Emscher 04» e i nomi veri dei derby. Le cerca **per parola intera**, senza accenti né maiuscole, dentro nomi dei
club, stadi, derby, record e albo europeo. La lista dei brand cerca per sottostringa e questi nomi non li vedeva.

| `node tools/audit-copyright.mjs` | risultato |
|---|---|
| verde | **0** riferimenti |
| `CPM_AUDIT_FLAG=__CPM_NO_G453` (nomi di prima) | **71** riferimenti (40 club, stadi, derby, record e albo) |

## 5. Foto prima/dopo

In `docs/collaudo-po/453-classifica-<lega>-{prima,dopo}.png`, 360 px, dal guardiano con `CPM_FOTO453`. Coprono Championship e
Premier (Inghilterra), Liga Ibérica, Deutsche Liga, Lega B, Liga Belga, Liga Lusitana, Liga Anatolica e Ligue Nationale. Manca la
Liga Oranje: nessun club olandese è stato rinominato. A 360 px la classifica mostra le **sigle**: prima WAT/IPS/LEE…, dopo
CNM/ORK/WHM…

## 6. Guardiani

- **`nomi-453`** (nuovo, `npm run nomi-453` = verde + rosso `CPM_ROSSO453=1`). Le quattro parti:
  - A: 40 nomi e sigle, sigla diversa da quella di prima, nomi corti, stadi e derby;
  - B: audit a 0 (rosso: più di 0 dalla lista 453);
  - C: migrazione di un salvataggio coi nomi di prima, anche Primavera/U19, idempotente e senza righe perse;
  - D: nove classifiche a schermo.

  Misurato: **verde 31 ok / 0 ko · rosso 32 ok / 0 ko**. Il guardiano entra nelle righe MAPPA `src/0[0-8]-` e `src/05-|src/09-`
  e nell'elenco `carriera` (`ci-runner.mjs`); `mappa-unica` è verde. Una riga MAPPA dedicata al copyright non esiste: l'audit
  sta dentro il guardiano.
- **`nomi-251` / `nomi-248`** giudicano il loro livello: armano `__CPM_NO_G453` e ignorano le voci «-453» dell'audit. Misurato:
  nomi-251 verde 24/0 e rosso 24/0, nomi-248 verde 20/0 e rosso 20/0.
- **`albo-122`** accetta il nome migrato del club di prova («FC Costiera»). Non è una soglia: è il nome atteso.
- Le altre sonde che citano i nomi di prima li usano come **dati propri**, non letti da `CLUBS`: scelte-201, terza-volta,
  coreografie-244/252, interviste-211, piccoli-85, box-fischio-169, finta-257, ripartenza-piazzato-27, spalti-109.
  Restano come sono.

### Rituali
GIRO_PLACEHOLDER

## 7. Dubbi per il PO

**Dubbio 1: quanto spingersi coi nomi di fantasia.**
- **A (consigliata, applicata):** fantasia per tutta la Championship e, in tutte le leghe, per le classi A e B (nome vero,
  soprannome, stadio, anno). Le città semplici restano come le ha scelte il PO il 17/11.
- **B:** fantasia anche per tutta la Premier. FC Manchester, Merseyside, Islington, Haringey e Tyneside sono le zone dei club
  veri, e la Premier è la lega più esposta. Costo: circa 60 sonde citano «FC Merseyside» come dato.
- **C:** fantasia per tutti i 252 club. È la soluzione più sicura, ma va contro PO-511 («devono essere associabili») e tocca
  centinaia di sonde.
- **D:** solo la Championship, tornando indietro sugli altri 22.

**Dubbio 2: classe D (città vera da sola, circa 200 club).** Il PO l'ha decisa il 17/11 «a rischio mio».
- **A (consigliata):** tenerla e chiedere un parere legale prima dello store.
- **B:** cambiare solo la SIGLA, cioè nome di città con una sigla non derivabile dal nome. Va contro la regola strutturale del
  7.298 e l'audit la boccerebbe.
- **C:** passare a fantasia lega per lega, cominciando da Inghilterra e Spagna.

**Dubbio 3: i colori.** Quasi tutti i club hanno i colori sociali veri. Insieme a città e sigla rendono il club riconoscibile;
lo stemma invece è procedurale.
- **A (consigliata):** lasciarli. Il gioco è più credibile e un colore da solo non è un marchio.
- **B:** spostare la tinta di qualche grado solo sui 40 rinominati.
- **C:** ricolorare le classi A e B.

**Dubbio 4: nomi residui sul confine.**
- «Riverside Park» (stadio di che): ricorda il Riverside Stadium.
- «CF Madrid»: richiama la forma di «Real Madrid CF».
- «FC Istanbul Ovest», «FC Kadıköy», «FC Boğaziçi»: quartieri dei club veri.
- I cinque nomi italiani da colori, ammessi dal PO il 17/11: «FC Zebre», «FC Nerazzurri», «FC Rossoneri», «FC Biancocelesti»,
  «FC Granata».

Le opzioni:
- **A (consigliata):** decidere riga per riga sulla pagina dei nomi, come al 251.
- **B:** passarli tutti a fantasia ora.
- **C:** lasciarli.
