# RAPPORTO — giro 108 · riparazione dei difetti ALTI e MEDI del collaudo grafico 180

Ramo `sviluppo/giro108-collaudo180`, da `lavoro/180` (efa72a9 = 7.999.179 + giro 106 + giro 107 + collaudo 180).
Fonte: `docs/collaudo-grafico/180/RAPPORTO.md` (G180-01…33). `GAME_VERSION` e `docs/governo/*` **non toccati**, come negli
altri giri: li aggiorna chi integra. Già corretti e non rifatti: G180-05, G180-26 (giro 106), G180-14 (giro 107). Bassi non
toccati (vanno nella 181), salvo quelli che una correzione media ha sistemato da sé (in fondo).

## Come è misurato

Stesse sonde del collaudo 180 (`c180-schermate.mjs`, `c180-partita.mjs`, contrasto sui **pixel** dello screenshot), stessi club
del database (FC Merseyside #dc2626 «rosso», FC Wolverhampton #f59e0b «giallo», FC Tyneside #0f0f0f «scuro»), giocatore
«Massimiliano Bartolomucci», formati 360x800 e 412x915 a tocco, 1440x900 a mouse, più **820x1180** a tocco per G180-15.
Soglie non abbassate: 4,5:1 (3:1 per corpo ≥ 18 px o ≥ 14 px grassetto), tocco ≥ 44 px.

**Prima** = braccio rosso del guardiano (ogni correzione ha il suo interruttore `__CPM_NO_G108_<id>` che rimette la grafica
della 7.999.179 su quel solo difetto). **Dopo** = braccio verde. Entrambi sul build finale (commit di questo rapporto).

Alle sonde c180 ho aggiunto (solo test, nessun effetto sul gioco): `C180_ROSSI` (interruttori), `C180_SOLO` (filtro delle
schermate), il formato `t820`, `C180_TUTTI` (salva tutti i contrasti), e la misura `EXTRA108`: **area di tocco effettiva**
(rettangolo del tasto unito al suo `::after` trasparente, riportato a schermo se c'è uno zoom), punteggio della barra coperto da
un tasto, nomi della barra troncati, conto dei resti V1 granata/rosa, fondi chiari nella sala stampa e i fondi chiari V1 del
passaggio pro. E una correzione alla sonda partita: l'intro dell'highlight forzata durava 300 ms, quindi la foto «hl-intro»
arrivava a scelta già aperta e il velo della presentazione (G180-32) **non era mai stato fotografato**; ora resta aperta 8 s.

## Tabella

| id | gravità | esito | causa | correzione (solo TINTE/TH) | prima (rosso) | dopo (verde) |
|---|---|---|---|---|---|---|
| **G180-02** Galà, busta | alta | **fatto** | card `rgba(255,255,255,0.95)` con testi chiari del tema | card su `TINTE.sup` con filo `TINTE.bordo`; i testi granata dentro la card → `TINTE.oro` | «Chiara Loreti apre la prima busta» **1,04:1**, «Trofeo d'Oro» 2,31:1 (12 rilievi) | nessun testo sotto soglia (360, 412, pc) |
| **G180-03** Passaggio ai professionisti | alta | **fatto** | card e pillole sui fondi chiari V1 (#eff6ff, #fefce8, #dcfce7, #f3e8ff, #fee2e2) | card `TINTE.sup`, offerte su `TH.bgBlue/bgAmber`, pillole sui colori di stato V2 (`bgGreen/txGreen`, `bgPurple/txPurple`…), «Puoi ancora restare» e contorno dell'offerta scelta in `TINTE.oro`, binario `TH.track` | nome **1,04:1**, club 1,09:1 (48 rilievi) | 0 sotto soglia, 0 fondi chiari V1 |
| **G180-04** Nazionale, presenze | alta | **fatto** | numero nel colore della bandiera (#003399) | numero in `TINTE.testo`; la bandiera resta nel bordo e nel bagliore della card | «14» **1,64:1** | 0 sotto soglia |
| **G180-07** Pre-partita, pillola | alta | **fatto** | testo bianco sulla sfumatura della bandiera | pillola su `TINTE.inc` con testo `TINTE.testo`; la bandiera resta come **campione di colore** 18x12 accanto al nome (vale per tutte le leghe e coppe: la pillola non dipende più dalla sfumatura) | «Premier Division» **1,40:1** (360, pc, 820) | 0 sotto soglia |
| **G180-08** Figurina grande / creazione | alta | **fatto** | «KORWARD» bianco fisso sulla cornice d'argento | inchiostro scelto dal contrasto con la cornice (bianco o `TINTE.bg`), filetti dello stesso colore | «KORWARD» **1,55:1** | 0 sotto soglia |
| **G180-15** Barra della partita a 820x1180 | alta | **fatto** | sul tablet (`_hb292`) il tasto «1×» diventava una scatola piena da 44 px con margine −14 e saliva sul punteggio | nella barra V2 anche il tablet usa l'area di tocco allargata del telefono (`::after`, disegno invariato) e la stessa spaziatura | «1×» sopra il punteggio, 24x11 px di sovrapposizione | punteggio libero (foto) |
| G180-01 testata | media | **verificato + esteso** | la testata è del giro 106 e regge su tutte le schede (0 parole spezzate su Home, Stagione, Club, Carriera, Agente, Ufficio × 3 club a 360); spezzava ancora il **nome del club nella scheda Club** (`overflowWrap:"anywhere"`) | a capo solo fra parole, la parola più lunga decide il corpo (≥ 13 lettere 17 px, ≥ 11 20 px, altrimenti 24), come la testata del 106 | «WOLVERHAMP/TON» (s360 giallo) | 0 parole spezzate |
| G180-06 «SETT. 12 · CASA» sul giallo | media | **già corretto dal 106** | `fondoClub106` smorza il giallo | nessuna (nessun braccio rosso qui: lo tiene `home-colori-106`) | — | 0 sotto soglia sulla Home (360 × 3 club, 412 giallo, pc rosso) |
| G180-09 Telefonata del CT | media | **fatto** | colore velato `rgba(…,0.5)` | `TINTE.sec` (oro sui momenti leggendari) | «Rimarrà nella storia» **3,12:1** | 0 sotto soglia |
| G180-10 Sala stampa | media | **fatto** | scena illustrata col fondo chiaro V1 | sala, pannello, tabellino e striscia in basso su `TINTE.sup/inc/bg/tasto`; marchi in `TINTE.testo`/`TINTE.oro`; nome del club reso leggibile sul fondo (`legCol944`); targa col **solo cognome** | «Elite» **3,33:1** su grigio, targa «MASSIMILIANO BAR» | 0 sotto soglia, 0 fondi chiari nella scena, targa «BARTOLOMUCCI» |
| G180-12 fascia Sostieni/Idee | media | **fatto** | testo nel rosa V1; tocco | testo in oro (via G180-21); area di tocco `.cpm-t40` 42 → **44 px** | rosa #ee9aaa; box 180x26 | oro; area effettiva ≥ 44 |
| G180-13 tasti del tabellone | media | **fatto** | area allargata da 42 px (`cpm-t40m`) | 42 → **44 px**, spaziatura fra pausa e velocità 22 → 26 px (le aree non si rubano il dito) | ⏸ 14x33, «1×» 22x19, ⚠️ 22x33 → effettivo **42x42** | effettivo ≥ 44 |
| G180-16 nomi nel tabellone a 360 | media | **fatto** | nome intero troncato a 4 lettere | sotto i 400 px un nome oltre i 7 caratteri diventa la sigla del club (MER, MCH, SUS) | «FC Manchester», «FC Merseyside» troncati | 0 troncati (360, 2 club) |
| G180-18 «Salta il galà» | media | **fatto** | tasto testuale 60x14 | `minHeight:44`, `minWidth:120` | 60x14 | ≥ 44 |
| G180-19 «Licenzia il procuratore» | media | **fatto** | area allargata 42 px | `.cpm-t40` a 44 px (stessa correzione della G180-12) | effettivo 42 | effettivo ≥ 44 |
| G180-21 rosa V1 #ee9aaa | media | **fatto** | `TH.brandText` era il rosa della V1 | il token diventa `TINTE.oro` (79 usi in un punto solo) | 52 rilievi (testi rosa in quasi tutte le schermate) | 0 testi rosa |
| G180-22 granata V1 #8e1f33 | media | **fatto** | `TH.primary` usato come colore di barra, pillola, tasto e riga | barra della stagione nel colore del club (reso visibile sul binario), pillole del galà in oro, tasti dello staff/accademia/trainer in Ufficio in oro, riga dell'eroe nelle pagelle nel colore del club smorzato (`fondoClub106`) col filo d'oro, testata del menu iniziale sulla superficie V2. `TH.primary` come token **non** cambiato (143 usi, tasti primari compresi: fuori ambito) | 16 rilievi (pagelle, Home, galà, menu, Ufficio) | 0 elementi granata sulle schermate misurate |
| G180-28 post-partita, competizione | media | **fatto** | colore della lega come testo (#e11d48) | `legCol944(colore, fondo)` | «Premier Division» **3,81:1** | 0 sotto soglia |
| G180-29 fisarmoniche del post-partita | media | **fatto** | area allargata 42 px | `.cpm-t40` a 44 px | 302x36 → effettivo 302x42 | effettivo ≥ 44 |
| G180-30 «Salta ingresso / premiazione» | media | **fatto** | area allargata 42 px | `.cpm-t40m` a 44 px | 131x36 / 152x36 | effettivo ≥ 44 |
| G180-32 intro dell'highlight | media | **fatto** | testi a opacità 0,3/0,2 sul velo | `TINTE.testo` (misurato: `TINTE.sec` sul prato velato resta 3,6:1, non basta) | «Tocca per iniziare» **1,74:1**, «⚔️ ATTACCO» 2,23:1 | 0 sotto soglia (360, 412, pc, 820) |

Interruttori rossi: `__CPM_NO_G108_01 02 03 04 07 08 09 10 13 15 16 18 21 22 28 32 44` (`44` = area di tocco `.cpm-t40`,
condivisa da 12/19/29; `13` = `.cpm-t40m`, condivisa da 13/30). Helper `_no108(id)` in `src/01`.

## Guardiano nuovo: `npm run collaudo-108`

`tests/visual/collaudo-108.mjs` rigioca le sonde c180 sulle sole schermate toccate e giudica difetto per difetto.
Verde: schermate 360 (3 club), 412 giallo, pc rosso; partita 360 (rosso, giallo), 412 scuro, pc rosso, 820 rosso — **27
schermate, 18/18 controlli verdi**. Rosso (tutti gli interruttori): **ogni difetto torna** (17/17; G180-06 non ha braccio,
vedi sopra). Il guardiano esce ≠ 0 anche se una schermata necessaria non è stata misurata (la misura non vale). Dati in
`tests/visual/out/collaudo-108/` (non versionati), `giudica` rilegge senza rigiocare, `C108_GIRI=partita` rigioca una sonda sola.
Durata: verde ~22 min, rosso ~13 min.

## Regressione (in sequenza, un controllo alla volta, build finale)

| passo | esito |
|---|---|
| collaudo-108 | verde 18/18 · rosso atteso OK |
| home-colori-106 | VERDE 8 club a 360 · rosso A/B/D atteso OK |
| freccia-107 | VERDE · rosso A/B/C atteso |
| grafica-v2 | VERDE 4 formati, contrasto min 4,99:1 · rosso atteso OK |
| momenti-v2 | VERDE 4x5, contrasto min 4,83:1 · rosso atteso OK |
| partita-v2 | VERDE 3x4, contrasto min 4,87:1 · rosso atteso OK |
| tema-unico | VERDE · rosso atteso OK |
| griglia-mobile | uscita 0, **0 difetti su 1740 controlli**; artefatti in `docs/collaudo-grafico/g0` rigenerati e **scartati** (come nel giro 106). «NON misurato: prepartita» era già nel report versionato |
| design-system | SISTEMA GRAFICO OK |
| career-critical | 11/11 passi, uscita 0 |
| test:logic | 43/43 |
| save-compat | 12 pass · 0 fail |
| validate-situations | ✅ PASS, 14/14 categorie, fingerprint 00001505, 0 failure |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: IDENTICO BYTE PER BYTE.

## Scelte prudenti (sessione figlia, nessuna decisione di prodotto)

- **Tocco a 44 px senza cambiare il disegno.** I tasti piccoli hanno già un'area di tocco trasparente (`::after`, giro 97 e
  96b, decisione PO «la grafica non cambia»): l'ho portata da 42 a 44 px invece di ingrandire i tasti. Il collaudo 180 misurava
  solo il rettangolo visibile, per questo li dava a 14–36 px. Le eccezioni con altezza vera sono «Salta il galà» (non aveva
  nessuna area allargata) e il tablet, dove l'area piena del giro 90 copriva il punteggio. La fascia Sostieni/Idee **non** è
  stata alzata a 44 px veri: avrebbe spinto fascia + barra oltre il 14% dell'altezza misurato da `home-colori-106` (C).
- **`TH.brandText` → oro a livello di token**: un punto solo, nessun markup V1. `TH.primary` (granata) resta come token: lo
  usano i tasti primari e 140 altri punti; ho tolto il granata solo dove il collaudo lo nomina.
- **Pillola della competizione**: la bandiera non è più il fondo del testo ma un campione di colore accanto, uguale per tutte
  le leghe e coppe; così non serve provare lega per lega (la sfumatura non tocca più il testo).
- **Sigla nel tabellone** sotto i 400 px oltre 7 caratteri: soglia scelta perché «FC SUSSEX» (9) era ancora troncato a 360.
- **Sala stampa in toni notte**: la moquette e il nome tengono il colore del club; il resto passa alle superfici TINTE.

## Bassi sistemati gratis

- G180-23 in parte: nella striscia bassa della sala stampa (condivisa con presentazione, festa e saga) il nome del club non è più
  in inchiostro ardesia V1 #0f172a ma `TINTE.testo` su `TINTE.sup`. Il resto della G180-23 (colonna della cronaca, tasti «Salta»)
  non è toccato.
- G180-31: non toccato (i numeri delle giocate «1»/«3» restano a 4,27/4,35:1 sul PC: è un basso, va nella 181).

## Limiti dichiarati

- Chromium headless con `isMobile`, non un telefono vero. L'area di tocco effettiva è calcolata dallo stile del `::after`.
- Il momento «telefonata del CT» compare solo se il gioco lo apre all'arrivo nella settimana (nel verde è comparso in tutti i
  5 giri: 360 × 3 club, 412 giallo, pc rosso); il «momento esordio» e la Coppa delle Nazioni restano non raggiungibili dai ganci di collaudo (come nel 180).
- I rigori non sono raggiungibili da una gara di campionato (come nel 180).

Foto `docs/sviluppo/foto-giro108/`: `prima-*` (braccio rosso) e `dopo-*` (verde) per i sei alti — galà, passaggio pro,
Nazionale, pre-partita, figurina, barra a 820 — più sala stampa e intro dell'highlight.
