# Rapporto giro 146 — spalle, braccia e mani dei calciatori 3D (PO-348)

Ramo `sviluppo/giro146-spalle` (da `lavoro/189`). Richiesta del PO (10/11): «occhio alla gestione delle spalle, braccia e mani dei
calciatori 3D. Devono avere le spalle larghe e proporzionate al corpo in tutte le scene e negli highlights!». Nessun campo nuovo nel
salvataggio, `GAME_VERSION` non toccato.

## 1. Come si misura (GLB acceso)

Sonda `tests/visual/spalle-146-misura.mjs` (`__misura146`, iniettata nella pagina): prende un corpo 3D **vivo** nella scena e legge i
**vertici skinnati** (la posa che si vede) e le ossa, nel mondo. I rapporti non hanno unità, quindi a 360x800 e a 1440x900 danno lo stesso
numero (verificato: le due corse coincidono entro il rumore di campionamento).

| grandezza | definizione |
|---|---|
| H | statura: cima dei vertici testa/collo − fondo dei vertici piede |
| Sj | spalle alle **articolazioni**: distanza fra le teste degli omeri (`upperarm_l/r`) |
| Aj | anche alle articolazioni (`thigh_l/r`); il bacino è rigido, quindi Aj non cambia con la posa |
| Sv, Av | larghezze **visibili** (vertici di clavicola/omero vicino alla spalla, vertici di bacino/coscia alla quota delle anche) |
| omero, avambraccio, mano | lunghezze d'osso; mano = distanza massima dei vertici di mano/dita dal polso |

Le scene: `tests/visual/spalle-146-scene.mjs` (highlight dell'eroe gi18/gi3 in scelta e nel gesto, premiazione all'alzata del
trofeo, intro, serata di presentazione), più il «provino» `__provino146`: la scena vera resa da una camera vicina al corpo, perché nelle
foto a schermo intero i giocatori sono troppo piccoli per giudicare le spalle.

## 2. La misura PRIMA

Corpo di tutte le scene di default: CGTrader (la panchina usa lo stesso pacchetto, LOD2). Eroe, mediane per scena:

| scena | Sj/Aj eroe | Sj/H eroe | minimo Sj/Aj fra tutti i corpi | mano/H |
|---|---|---|---|---|
| highlight (scelta + gesto) | 2,38 | 0,241 | 2,21 | 0,067-0,104 |
| intro | 2,41 | 0,247 | 2,37 | 0,074-0,100 |
| **presentazione** | **2,00** | **0,201** | **1,96** | 0,080-0,090 |
| **premiazione (alzata)** | **1,25 – 2,12** | **0,127** | **1,25** | 0,072-0,090 |

Lo **stesso eroe** passava da 2,41 (intro) a 1,25 (alzata): massima/minima **1,92**.

Cause misurate:
1. **Presentazione:** la postura del gioco (`_corrPostura23`, 23/09: attacco del braccio +15%) vive solo in partita, intro e parata;
   la serata di presentazione non la chiama → spalle del 17% più strette.
2. **Alzata del trofeo:** la clip `mx-victory` porta le clavicole quasi in verticale (e la postura ci aggiunge 0,45 rad): le teste degli
   omeri finiscono accanto al collo, **spalle a metà** (foto `prima-*-premiazione-provino0.png`: le braccia nascono accanto alla testa).
3. **Panchina:** il mixer dei corpi in panchina girava senza alcuna postura.

Misure a riposo (posa di legame, `riposo`: tutti i pacchetti × corporatura 0,90/1,00/1,08) per i corpi di riserva: **«regular»** Sj/Aj
2,12, «slim» uguale, **mano** regular 0,119·H, slim **0,081**, stocky **0,163**; CH38 2,10. La corporatura (`cgCorporatura` e le
scale `x/z` delle cerimonie) è una scala **non uniforme** sul corpo intero: in posa a T l'omero cambia del ±8% con la corporatura,
con le braccia lungo il corpo no.

## 3. La correzione: una regola sola (`_spalle146`, src/12)

Dopo l'animazione, in **ogni** scena e su **ogni** corpo, Sj viene portato dentro la fascia **[2,34 · 2,62]·Aj**:
- l'attacco del braccio a 1,15 volte la clavicola della clip (lo stesso allargamento della postura di partita; dove `_corrPostura23`
  l'ha già fatto in quel fotogramma non si somma);
- la clavicola ruota verso il fuori consumando **prima la protrazione** (componente in avanti), poi l'altezza;
- se la clavicola non basta a tenere insieme larghezza e quota (braccia alzate) l'attacco si allunga quanto serve, **tetto 1,35**;
- l'omero si **ri-mira verso la mano della clip**: trofeo, saluto ed esultanza restano dove li ha messi l'animazione.

Misurare sulle anche rende la regola indipendente da statura e corporatura. Deterministica, nessun `Math.random`, idempotente come
`_corrPostura23` (se la clip non ha scritto l'osso si riparte dall'ingresso; le uscite di `_corrPostura23` vengono aggiornate a quelle
finali). Chiamata: in fondo a `_corrPostura23` (partita, intro, parata), nella serata di presentazione dopo clip/vita/saluto, in
panchina dopo il mixer. Rosso: `window.__CPM_NO_G146` (comportamento di prima). La fascia bassa viene dagli highlight, il corpo che il PO
aveva già ritoccato due volte (23/09 «spalle piccole», 7.999.21 «spalle spioventi»): gli highlight restano dove erano.

Correzione intermedia scartata (misurata): la sola rotazione delle clavicole abbassava spalle e mani di 0,10 nell'alzata e portava
`posa-sollevamento-191` da 2,1 a 2,0, esattamente sulla soglia. Con allungamento e mira della mano: **2,09**.

## 4. La misura DOPO

| scena | Sj/Aj eroe | Sj/H eroe | minimo Sj/Aj fra tutti i corpi |
|---|---|---|---|
| highlight | 2,41 | 0,244 | 2,35 |
| intro | 2,41 | 0,246 | 2,37 |
| presentazione | 2,35 | 0,236 | 2,34 |
| premiazione (alzata) | 2,34 | 0,239 | 2,34 |

Stesso eroe fra le scene: massima/minima **1,03** (prima 1,92). Mani 0,068-0,105·H, omero 0,105-0,121·H, avambraccio 0,127-0,145·H in
ogni scena (invariati). La larghezza visibile resta legata alla posa (con le braccia alzate il deltoide ruota: Sv/Av 1,37 nell'alzata
contro 1,85-1,89 da fermi), com'è anche nel corpo vero.

## 5. Riferimenti realistici

- ANSUR II (US Army, 2012), tabelle di sintesi dell'ergonomia NC State, uomini, 50° percentile: statura 69,09 in, larghezza
  bideltoidea 20,04 in, biacromiale 16,34 in, anche 13,54 in → bideltoidea/statura **0,29**, biacromiale/statura **0,236**,
  bideltoidea/anche **1,48**, biacromiale/anche **1,21**. Fonti: [NCSU Anthropometric Summary Data Tables](https://www.ergocenter.ncsu.edu/wp-content/uploads/sites/18/2017/09/Anthropometric-Summary-Data-Tables.pdf),
  [NCSU 01 Anthropometry Summary Tables](https://ergocenter.ncsu.edu/wp-content/uploads/sites/358/2026/02/01-Anthropometry-Summary-Tables.pdf),
  [Gordon et al. 2014, 2012 Anthropometric Survey of U.S. Army Personnel](https://bvbvf1.bib-bvb.de/vufind/PrimoRecord/cdi_dtic_stinet_ADA611869).
  ⚠️ Sono mediane lette dagli estratti delle tabelle (le intestazioni di colonna non erano nell'estratto: ho assunto che la prima terna
  sia «uomini»), non medie; la bideltoidea ANSUR è misurata da seduti. **Non posso confermarle oltre questo.**
- Lunghezze dei segmenti in frazione della statura (Drillis e Contini, 1966, riportate nei testi di biomeccanica, es. Winter):
  **non verificate in questo giro** (la ricerca non ha trovato la tabella). Non le uso come soglia.
- Il confronto con ANSUR è solo indicativo: Sj/Aj si misura fra **centri articolari**, non fra punti di superficie. Sui vertici, il
  corpo CGTrader da fermo sta a Sv/H 0,37-0,39 e Sv/Av 1,72-1,89 contro 0,29 e 1,48 dell'uomo medio: **era già più largo della media** —
  coerente con un calciatore atletico, ma è una mia lettura, non una fonte. Il difetto vero non era la larghezza in assoluto, ma che
  cambiava fra le scene fino a dimezzarsi.

## 6. Guardiano `npm run spalle-146`

Quattro scene (highlight, premiazione, intro, presentazione), GLB acceso, verde e rosso (`__CPM_NO_G146`) stampati per ultimi, il rosso
deve cadere, «non giudicato» = rosso. Soglie fissate dopo la misura: Sj/Aj di ogni corpo in [2,30 · 2,65] · Sj/H in [0,21 · 0,28] ·
eroe fra le scene massima/minima ≤ 1,05 · mano/H [0,06 · 0,12] · omero/H [0,10 · 0,13] · avambraccio/H [0,12 · 0,155].
`CPM_FORMATO=1440x900` per il formato PC. Esiti: 360x800 verde (coerenza 1,031) e rosso cade (1,954); 1440x900 verde e rosso cade.

## 7. Catena (un controllo alla volta, GLB acceso dove serve)

| controllo | esito |
|---|---|
| spalle-146 360x800 · 1440x900 | ✅ · ✅ (rosso cade) |
| premiazione-132 | ✅ (rossi cadono) |
| presentazione-142 | ✅ (rosso cade) |
| posa-sollevamento-191 | ✅ mani 2,09 (rosso 0,34 di clip) |
| premiazione-palco-191 | ✅ |
| intro-118 | ✅ |
| panchina-127 360x800 · 412x915 · 1440x900 | ✅ · ✅ · ✅ |
| scena3d-96 tel · pc · tabv · tabo | ✅ 16/16 · ✅ 9/9 · ✅ · ✅ 3/3 |
| validate-situations | ✅ PASS 14/14 |
| highlight-95 (completo) | ✅ verde 104 highlight · 0 difetti (rosso si vede) |
| test:logic | ✅ 43 pass · 0 fail |
| save-compat | ✅ 12 pass · 0 fail |

## 8. Foto (`docs/sviluppo/giro146/`)

Per ogni scena e formato: schermata intera (`prima|dopo-<formato>-<scena>.jpg`) e primo piano fronte/tre quarti
(`…-provino0/1.jpg`). Scene: `highlight-scelta`, `highlight-gesto`, `premiazione`, `intro`, `presentazione`. Le «dopo» sono rifatte
sulla versione finale della regola. Le misure grezze stanno in `misura-prima.json` / `misura-dopo.json`.

## 9. Fuori ambito e domande aperte per il PO

- **Corpi di riserva** («regular», usato solo se il pacchetto CGTrader non si carica, e CH38): la regola vale anche per «regular»
  (stessi nomi d'osso), non per CH38. Le **mani** del «regular» variano molto fra le tre corporature a riposo (slim 0,081·H, stocky
  0,163·H: lo stocky ha mani doppie dello slim). Non corretto: è un asset di riserva. Va sistemato l'asset o si lascia?
- **Corporatura non uniforme** (`x/z` scalati, `y` no): in posa a T allunga o accorcia le braccia del ±8%. Non toccata: la presentazione
  la usa per distinguere i giocatori (presentazione-142) e cambiarla è una decisione di aspetto.
- **Panchina seduta**: i corpi seduti non hanno mixer per fotogramma, quindi la regola non li tocca (si siedono con la posa della clip).
- La fascia [2,34 · 2,62] è quella degli highlight: se il PO vuole spalle ancora più larghe ovunque, si alza il numero `min` in un
  punto solo (`_SPALLE146`, src/12) e si ri-misura.
- Il guardiano non copre la parata del pullman e la festa (stessa funzione via `_corrPostura23`, misura non fatta in questo giro).
