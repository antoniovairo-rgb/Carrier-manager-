# Rapporto giro 251 — nomi definitivi di tutti i club (PO-512)

Versione di riferimento: 7.999.197 (GAME_VERSION non toccata) · ramo `sviluppo/giro251-nomi-tutti` (da `lavoro/197`, che contiene già il
giro 248). Proposta di partenza copiata nel ramo: `docs/sviluppo/PROPOSTA-giro250.md`.
Fonte unica dei nomi: le scelte definitive del PO (pagina «Nomi dei club 197», conferma 17/11 14:33 Roma), che prevalgono sulla proposta
del 250 e sui 16 nomi del giro 248. Decisione PO sul copyright del 17/11 14:50 («Tengo i miei nomi, rischio mio»).

## Cosa è cambiato

**98 club nella lista del PO + `alm2`** (doppione Almería, decisione della madre). Di questi, **64 cambiano nome** (63 del PO + `alm2`);
35 hanno il nome X uguale a quello di oggi e restano com'erano (sigla di oggi). I club fuori dalla lista restano come sono.

### Tabella unica dei nomi (una correzione futura = una riga)

`src/02-club-leghe-albo.jsx`, `CLUB_NOMI_251`: `id → [nome, sigla]`, 99 righe (le 98 del PO, comprese quelle con nome uguale a oggi, + `alm2`).
- `CLUBS` è avvolto da `_nomi251([...])`: per ogni id della tabella sostituisce nome e sigla; le righe `mkT(...)` restano i nomi di prima e
  servono solo alla migrazione (`_NOMI_OGGI_251`). Le Primavera ereditano il nome (es. «FC Zebre Primavera»).
- Record e albo che citano un club che cambia leggono la tabella con `_nc251(id, nome di oggi)`: `LEAGUE_RECORDS` (cel, napoli, bay, bvb,
  psg, por, nor) e l'albo europeo 2020 (bay).
- Rosso **`window.__CPM_NO_G251`** = nomi, sigle, stadi e migrazione di oggi (lavoro/197 col giro 248). `__CPM_NO_G248` continua a
  riportare tutto al giro 6 (accende anche il rosso 251).

### Elenco dei club che cambiano

| id | lega | nome di oggi (sigla) | nome definitivo (sigla) | scelta |
|---|---|---|---|---|
| `bur` | Championship | FC Clarets (CLA) | **FC Burnley** (BNL) | A |
| `car` | Championship | FC Bluebirds (BLB) | **FC Cardiff** (CDF) | A |
| `milw` | Championship | FC Dockers (DOC) | **FC Bermondsey** (BMD) | A |
| `nor` | Championship | FC Canaries (CAN) | **FC Norwich** (NRW) | A |
| `shu` | Championship | FC Steelers (STE) | **FC Sheffield South** (SHS) | A |
| `sto` | Championship | FC Potters (POT) | **FC Stoke** (SKE) | A |
| `swn` | Championship | FC Swans (SWA) | **FC Swansea** (SWS) | A |
| `wba` | Championship | FC Albion (ALB) | **FC West Bromwich** (WBR) | A |
| `aug` | Deutsche Liga | FC Augsburg (AUG) | **FC Augusta** (AGS) | A |
| `bay` | Deutsche Liga | FC Isar (ISR) | **FC Munchen** (MUC) | X · sigla proposta dal 251 |
| `ber` | Deutsche Liga | FC Berlin Nord (BNO) | **FC Berlin Köpenick** (BKP) | A |
| `boc` | Deutsche Liga | FC Ruhrpott (RUH) | **FC Bochum** (BCH) | A |
| `bvb` | Deutsche Liga | FC Goldwald (GLW) | **FC Westfalen** (WSF) | A |
| `dsc` | Deutsche Liga | FC Lilien (LLN) | **FC Darmstadt** (DMT) | A |
| `kol` | Deutsche Liga | FC Domstadt (DMS) | **FC Koln** (KLN) | X · sigla proposta dal 251 |
| `kaa` | Deutsche Liga 2 | FC Kaiserslautern (FCK) | **FC Lautern** (LTN) | A |
| `mag` | Deutsche Liga 2 | FC Magdeburg (MGB) | **FC Börde** (BRD) | A |
| `nub` | Deutsche Liga 2 | FC Nürnberg (FCN) | **FC Norimberga** (NRB) | A |
| `s04` | Deutsche Liga 2 | FC Gelsenkirchen (FGK) | **FC Emscher 04** (EMS) | X · sigla proposta dal 251 |
| `sar` | Deutsche Liga 2 | FC Saarbrücken (FCS) | **FC Saarland** (SRL) | A |
| `stp` | Deutsche Liga 2 | FC Sankt Hafen (SAN) | **FC Hamburg Hafen** (HHF) | A |
| `inter` | Lega A | FC Milano Brera (MBR) | **FC Nerazzurri** (NRZ) | X · sigla proposta dal 251 |
| `juve` | Lega A | Torino Athletic (TAT) | **FC Zebre** (ZBR) | X · sigla proposta dal 251 |
| `lazio` | Lega A | FC Flaminio (FLM) | **FC Biancocelesti** (BNC) | X · sigla proposta dal 251 |
| `milan` | Lega A | FC Milano Sempione (MSE) | **FC Rossoneri** (RSN) | X · sigla proposta dal 251 |
| `napoli` | Lega A | FC Napoli Fuorigrotta (NFG) | **FC Partenope** (PRT) | X · sigla proposta dal 251 |
| `sam` | Lega A | FC Genova Ponente (GPO) | **FC Sampierdarena** (SPD) | B |
| `tor` | Lega A | FC Torino Santa Rita (TSR) | **FC Granata** (GRT) | X · sigla proposta dal 251 |
| `cat` | Lega B | FC Calabro (CLB) | **FC Catanzarese** (CTN) | A |
| `sal` | Lega B | FC Salernum (SAL) | **FC Salernum 1919** (SLR) | X · sigla proposta dal 251 |
| `bas` | Liga Anatolica | FC Bosforo (BOS) | **FC Istanbul Ovest** (IOV) | A |
| `bes` | Liga Anatolica | FC Kartal (KAR) | **FC Boğaziçi** (BGZ) | A |
| `krc` | Liga Belga | FC Westflandria (WFL) | **FC Brugse** (BGS) | A |
| `std` | Liga Belga | FC Vallonia (VLA) | **FC Liegi** (LGI) | A |
| `stu2` | Liga Belga | FC Truiden (TRU) | **FC Sint-Truiden** (SNT) | A |
| `usj` | Liga Belga | FC Union (UNI) | **FC Bruxelles Sud** (BXS) | A |
| `alm` | Liga Ibérica | FC Indálico (IND) | **FC Almería** (FAL) | A |
| `cel` | Liga Ibérica | FC Vigués (VGS) | **FC Ría de Vigo** (RDV) | B |
| `cor2` | Liga Ibérica 2 | FC Califal (CAL) | **FC Cordobés** (CDB) | A |
| `lev` | Liga Ibérica 2 | FC Granota (GRN) | **FC València Nord** (VNR) | A |
| `ovi` | Liga Ibérica 2 | FC Carbayón (CAR) | **FC Ovetense** (OVT) | A |
| `aroca` | Liga Lusitana | FC Aroalta (ARO) | **FC Arouquense** (ARQ) | A |
| `bav` | Liga Lusitana | FC Panteras (PAN) | **FC Foz do Douro** (FDD) | A |
| `bra` | Liga Lusitana | FC Minhoto (MIN) | **FC Bracarense** (BRC) | A |
| `fama` | Liga Lusitana | FC Famalar (FAM) | **FC Famalicense** (FMC) | A |
| `por` | Liga Lusitana | FC Portomar (POR) | **FC Portuense** (PTN) | A |
| `rioave` | Liga Lusitana | FC Rio Verde (RIO) | **FC Vila do Conde** (VDC) | A |
| `vize` | Liga Lusitana | FC Vizalta (VIZ) | **FC Vizelense** (VZL) | A |
| `emm` | Liga Oranje | FC Emmen (EMM) | **FC Drenthe** (DRT) | A |
| `exc` | Liga Oranje | FC Oostzijde (OOS) | **FC Rotterdam Kralingen** (RKL) | A |
| `gron` | Liga Oranje | FC Groningen (GRO) | **FC Groninger** (GNR) | A |
| `spa` | Liga Oranje | FC Havenstad (HVN) | **FC Rotterdam Spangen** (RSP) | A |
| `twe` | Liga Oranje | FC Twente (TWE) | **FC Enschede** (ENS) | A |
| `utr` | Liga Oranje | FC Utrecht (UTR) | **FC Oudegracht** (ODG) | A |
| `volen` | Liga Oranje | FC Volendam (VOL) | **FC Waterland** (WTL) | A |
| `len` | Ligue Nationale | FC Artois (ART) | **FC Lensois** (LSO) | A |
| `mtp` | Ligue Nationale | FC Montpel (MON) | **FC Montpellier** (MPL) | A |
| `psg` | Ligue Nationale | FC Parigi Ovest (PGO) | **FC Paris Île-de-France** (PIF) | X · sigla proposta dal 251 |
| `rei` | Ligue Nationale | FC Remense (REM) | **FC Reims** (RMS) | A |
| `ann` | Ligue Nationale 2 | FC Annecy (ANN) | **FC Annecien** (ANC) | A |
| `que` | Ligue Nationale 2 | FC Rouen (ROU) | **FC Normandia** (NMD) | A |
| `val2` | Ligue Nationale 2 | FC Valencien (VCN) | **FC Valenciennes** (VNS) | A |
| `cry` | Premier Division | FC Selhurst (SEL) | **FC Croydon** (CYD) | A |
| `alm2` | Liga Ibérica 2 | FC Almeriense (ALE) | **FC Murciano** (MRC) | proposta 251 (dubbio) |

Le sigle «sigla da proporre» dei nomi X le ho proposte io (sottosequenza del nome, uniche fra i 252 club, non nella lista delle sigle
ufficiali note dello script del 250 + PSG/KOE/SGE/RBL…, lista **dalla memoria, non da una fonte**): `bay` MUC · `kol` KLN · `s04` EMS ·
`inter` NRZ · `juve` ZBR · `lazio` BNC · `milan` RSN · `napoli` PRT · `tor` GRT · `sal` SLR · `psg` PIF. Per `sal` non ho tenuto SAL
perché è nella lista delle sigle ufficiali note (Salernitana).

### Doppione `alm` / `alm2` (decisione della madre)

`alm` → **FC Almería** (FAL), come scelto dal PO. `alm2` (oggi «FC Almeriense», ALE, Liga Ibérica 2, rosso-bianco) → **FC Murciano**
(MRC): aggettivo di città (Murcia), criterio del 250, nessun altro club del gioco è di Murcia, non confondibile con Almería. Stadio: nessuna
voce in `CLUB_STADIUMS`, resta quello del pool. **Dubbio per il PO** (vedi sotto).

### Stadi

- Restano gli stadi neutri del giro 248 (Stadio Milano Ovest per inter/milan, Stadio di Fuorigrotta, Stadio del Foro, Stadio Santa Rita,
  Estadio de Heliópolis, Estadio de la Ría, Estádio Lisboa Norte).
- `bvb` «Goldwald Stadion» → **«Hörde Stadion»** (proposta del 250 per FC Westfalen).
- `s04` «Gelsenkirchen Arena» → **«Emscher Arena»**: nome X del PO; lo stadio portava «Gelsenkirchen», che il PO ha tolto dal nome del club,
  quindi l'ho cambiato col toponimo che il PO ha scelto (proposta mia, dubbio per il PO).
- Tutti gli altri club cambiati o non hanno voce in `CLUB_STADIUMS` o hanno uno stadio che la proposta del 250 dava «resta» (Lens Stadium,
  Boğaz Park, Croydon Park, Parc Royal, München Arena, Stadio Valcolle, Stadio Ligure, Emilia Stadium, Stadio Toscano, Estádio Azul…).
  Pool (`STADIUM_POOLS`) invariati.
- Rosso: con `__CPM_NO_G251` tornano «Goldwald Stadion» e «Gelsenkirchen Arena».

### Migrazione dei salvataggi (`src/09`)

- `_DEF251`: nome di oggi (riga `mkT`, quindi anche i nomi del giro 248) → nome definitivo, per i club della tabella il cui nome cambia.
- `CLUB_RENAME_6` porta in un passo solo **nome reale di prima del giro 6, nome del giro 6, nome del giro 248 e nome di oggi** al nome
  definitivo; le identità sono tolte (FC Nerazzurri, FC Partenope, FC Granata erano nomi reali di prima del giro 6 e ora sono le scelte del PO).
- `_STADI_248` include i due stadi cambiati.
- **Idempotenza con i nomi che cominciano con un nome da migrare**: «FC Paris» (nome reale di prima del giro 6) è l'inizio di
  «FC Paris Île-de-France», «FC Salernum» di «FC Salernum 1919». Senza protezione una seconda passata avrebbe dato
  «FC Paris Île-de-France Île-de-France». `_LUNGHI251` li protegge sia nella regex di `_migraNomi248` sia in `_renameClub6`.
  Misurato dal guardiano: storico «FC Parigi Ovest Primavera» → «FC Paris Île-de-France Primavera», «FC Salernum Primavera» →
  «FC Salernum 1919 Primavera», seconda applicazione senza modifiche.
- La sigla salvata accanto al nome (campi `a`/`abbr`/`oppAbbr`/`clubAbbr`) segue il nome, anche con suffisso Primavera/U18/U19.
- Nessun bump di `SAVE_VERSION`; la chiamata in `src/17` è quella del 248 (`_migraNomi248`), invariata.

### Lista del controllo copyright (`_CR_BRANDS`, `src/09`)

- **Tolte** (bloccavano nomi scelti dal PO): «Nerazzurri», «Rossoneri», «Partenope», «FC Paris».
- **Tenute** perché non bloccano le grafie scelte: «Biancoceleste» (il PO ha scelto «Biancocelesti»), «FC München» e «FC Köln» (il PO ha
  scelto «FC Munchen» e «FC Koln», senza dieresi). Tenuti anche i nomi ufficiali interi già in lista («AC Milan», «SSC Napoli», «Juventus»,
  «Bayern», «Chelsea», «Villarreal», «Schalke»…). Non ho aggiunto nomi ufficiali nuovi (es. «Paris Saint-Germain»): sarebbe una decisione.
- **Entrano** i 10 nomi del giro 248 che escono (FC Milano Brera, FC Milano Sempione, FC Napoli Fuorigrotta, FC Flaminio, FC Parigi Ovest,
  FC Torino Santa Rita, FC Genova Ponente, FC Vigués, FC Isar, FC Domstadt); i 16 nomi del giro 6 restano in lista. Gli stadi del 248 restano
  nel gioco e non sono in lista.

### Cori e striscioni (`src/12`, `_TOK_CLASS`)

Classi grammaticali per i token nuovi che non sono nomi propri: plurali BIANCOCELESTI, ZEBRE («N»); -ese/-ense e regioni/fiumi con articolo
EMSCHER, BÖRDE, SAARLAND, CATANZARESE, OVETENSE, AROUQUENSE, BRACARENSE, FAMALICENSE, PORTUENSE, VIZELENSE, BRUGSE, GRONINGER («E»);
CORDOBÉS, LENSOIS, ANNECIEN («M»). Gli altri prendono la classe di default (nome proprio); NERAZZURRI/ROSSONERI («N») e GRANATA («I»)
c'erano già. `cori-291` verde.

### Derby

Invariati: nessun nome di derby (`src/08`) contiene il nome di un club che cambia.

### Commenti e test

- Commenti con esempi aggiornati: `src/11` (scala dei nomi corti: FC Nerazzurri, Manchester Rovers), `src/18` (offerta rifiutata, FC Munchen).
- Lasciati com'erano (misure storiche o citazioni del PO): `src/01:156`, `src/13:1290`, `src/16:1430`, `src/18:7963` («Torino Athletic
  #f5f5f5»), `src/03:307` (FC Calabro), `src/15:13441` e `src/17:1078` (FC Salernum), e il club di prova `tat` «Torino Athletic» in `src/19`
  (dato inventato del banco, id fuori da `CLUBS`).
- `nomi-248` aggiornato ai nomi definitivi dei suoi 16 club (verde e rosso `__CPM_NO_G248` come prima).
- `nomi-211`: la scansione cercava una Primavera senza sigla societaria in testa; l'unica era «Torino Athletic Primavera», ora
  «FC Zebre Primavera». Il gioco non produce più il caso, quindi la sonda lo **provoca** con un club di prova inventato (stesso nome di prima,
  dichiarato nell'uscita).
- Dati dei salvataggi di prova portati ai nomi definitivi: `albo-122` (FC Salernum 1919, FC Oudegracht), `calendario-218`
  (FC Paris Île-de-France/PIF, FC Nerazzurri), `convocazione-190` (FC Nerazzurri, FC Granata).
- `ci-runner.mjs`: `nomi-251` nelle catene `completa` e `carriera` e nella MAPPA per `src/0[0-8]` e `src/05|09`, una volta per catena
  (`node --check` ok, nessun doppione per catena). `package.json`: `npm run nomi-251` = verde + rosso.

## Guardiano nuovo: `npm run nomi-251` (verde + rosso `__CPM_NO_G251`)

`tests/visual/nomi-251.mjs`, telefono 360 px, gioco vero (`?cpmtest=1`). Le tabelle del guardiano sono una **copia indipendente** delle scelte
del PO e dei nomi di oggi: il guardiano non legge `CLUB_NOMI_251`, la confronta.

| Parte | Verde (misurato) | Rosso `__CPM_NO_G251` (misurato) |
|---|---|---|
| A · dati | 64/64 club cambiati con nome e sigla definitivi · stadi bvb «Hörde Stadion», s04 «Emscher Arena» · **0** nomi superati in club, Primavera, pool, stadi, record, albo | 64/64 diversi · stadi di oggi · 83 nomi superati |
| B · audit (`_auditCopyright`) | 0 hit | 11 hit |
| C · sigle | 252 club, 0 doppie, 0 non valide (3 caratteri, sottosequenza del nome) | idem (vale in entrambi i bracci) |
| D · migrazione | salvataggio costruito coi nomi di oggi (241 nomi superati prima) → **0** dopo; `save-c177-s5w20` 126 → 0; `save-190-s12-ovr93` 69 → 0; `save-195-primavera-w39` 33 → 0; seconda applicazione senza modifiche su tutti e quattro; nome e sigla definitivi in 71/71 righe (storico + classifica, con Primavera/U19); prefissi protetti | restano 227 / 126 / 81 / 33 nomi superati; 64/64 righe con nome o sigla di oggi |
| E · schermo 360 px | classifica Lega A 7/7, Deutsche Liga 7/7, Championship 8/8 club cambiati con nome o sigla definitivi, 0 di oggi | 7/7, 7/7, 8/8 con nome/sigla di oggi (TAT, MBR, MSE… · ISR, GLW, AUG… · SWA, STE, CLA…) |

Esito: **verde 24 ok · 0 ko** (uscita 0) · **rosso 24 ok · 0 ko** (vede il difetto, uscita 0).

## Foto (360 px) — `docs/sviluppo/giro251/`

`classifica-lega-a-360-prima.png` / `-dopo.png`, `classifica-deutsche-liga-360-prima.png` / `-dopo.png`,
`classifica-championship-360-prima.png` / `-dopo.png`. «Prima» = braccio rosso `__CPM_NO_G251` (nomi di oggi sul codice nuovo).
Come nel 248: a 360 px la classifica mostra le sole sigle.

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima)

Dopo ogni modifica a `src/`: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** (7.723.101 byte).

| Controllo | Esito | Note |
|---|---|---|
| `nomi-251` verde / rosso | ✅ 24/0 · ✅ 24/0 | tabella sopra |
| `nomi-248` verde / rosso | ✅ 20/0 · ✅ 20/0 | aggiornato ai nomi definitivi |
| `node tools/audit-copyright.mjs` (radice) | ✅ **0 hit**, uscita 0 | prova del rosso `CPM_AUDIT_FLAG=__CPM_NO_G251`: **11 hit**, uscita 2 |
| `nomi-190` | ✅ 23/0 | |
| `cronaca-nomi-190` | ✅ VERDE | due partite al 92', 125 righe, 0 segnaposto |
| `nomi-211` | ❌ 21/1 → ✅ 22/0 | rosso «0 nomi su 0» nella scansione (caso non più prodotto dal gioco): sonda corretta, vedi sopra |
| `test:logic` | ✅ | |
| `save-compat` | ✅ 12 pass · 0 fail | |
| `sigle-203` | ✅ verde 360/375/390 18/0 · ✅ 1366 8/0 · ✅ rosso atteso | **cambia rispetto alla base**: il 248 lo aveva rosso (FC Lyon 0,7 px fuori a 360) anche su `lavoro/197`. Non ho toccato la barra; non so dire se è il cambio di nomi o la variabilità della misura |
| `voto-79` | ❌ «cieco» (uscita 2) | identico alla base («B rosso senza render dopo l'interruttore»): non cambia |
| MAPPA (nomi, dati, migrazione, cori, stadi): `interviste-211` · `indice-163` · `salta-163` · `momento-165` · `momento-165b` · `piccoli-85` · `carriera3-94` · `migrazione-194` · `classifica-102` · `classifica-194` · `lessico-218` · `brusio-238` · `nomi-182` · `cori-291` · `stadi-071` · `calendario-218` | ✅ tutti | `momento-165`, `momento-165b`, `carriera3-94`, `nomi-182` alla prima prova si erano fermati al mio tetto di 190/140 s (non giudicati): rilanciati con tetto pieno, verdi |
| `convocazione-190` · `nomi-salvati-190` | ✅ 13/0 · ✅ 19/0 | |
| `albo-122` | ❌ → ✅ verde + rosso | atteso «FC Salernum ×4»: dato del test portato a «FC Salernum 1919» |
| `coreografie-244` | ✅ verde (12 coreografie distinte su 30 partite) · ⚠️ **rosso non giudicato** | il braccio rosso è caduto con «Target.createTarget: Failed to open a new tab» e il passo ha superato il tetto di 40 minuti. Da rifare nella verifica di rilascio |

Nessuna foto di altri giri rigenerata in `docs/` (`git status` pulito dopo i controlli).
**Non eseguiti**: dei 175 passi della MAPPA mirata (i file toccati sono `src/02`, `05`, `09`, `11`, `12`, `18`; per `11` e `18` solo
commenti, per `12` solo `_TOK_CLASS`) ne ho eseguiti 21. Gli altri 154, quasi tutti scene 3D e partita (fra cui `highlight-95`,
`validate-situations`, `partita-vera`, `career-critical`, `nomi-219` ~50 minuti), li lascio alla verifica di rilascio. Non eseguiti neanche
i test con nomi di oggi come dati che non sono nella mia lista (es. `stat-279` con «FC Goldwald», `retire-announce-test` e molte sonde
in `tests/visual/archivio/` con «FC Salernum»): dopo la migrazione un salvataggio con «FC Salernum» mostra «FC Salernum 1919», quindi un
test che confronta il nome esatto può diventare rosso.

## Copyright — scelta del PO

Decisione del PO (questionario 17/11 14:50, «Tengo i miei nomi, rischio mio»): i nomi scritti dal PO sono applicati esattamente, anche quando
sono soprannomi veri o vicini ai nomi ufficiali. L'audit è a 0 hit **perché** la lista del controllo è stata adattata alla scelta (sopra),
non perché questi nomi siano lontani dai club reali. Nomi tenuti per scelta del PO:

- **soprannomi o colori dei club reali**: FC Nerazzurri, FC Rossoneri, FC Partenope, FC Biancocelesti, FC Granata, FC Zebre, FC Hammers,
  FC Hornets, FC Foxshire, FC Submarino, FC Scaligero, FC Brianzolo, FC Leonessa, FC Pucela, FC Maño (classe 4 della proposta del 250);
- **città del club in grafia vicina al nome ufficiale**: FC Munchen, FC Koln, FC Paris Île-de-France, Manchester Rovers;
- **nome dello stadio o parte del nome ufficiale**: FC Stamford, FC Goodison, FC Craven, FC Griffin, FC Aston, FC Sociedad, FC Vicente,
  FC Clara, FC Werkstadt, FC Wolfstadt, FC Queensway;
- **anno di fondazione accanto al toponimo**: FC Salernum 1919, FC Emscher 04;
- dalle proposte A/B del 250, i nomi che coincidono col nome comune del club reale: FC Burnley, FC Cardiff, FC Norwich, FC Stoke,
  FC Swansea, FC West Bromwich, FC Darmstadt, FC Bochum, FC Reims, FC Montpellier, FC Valenciennes, FC Almería, FC Sint-Truiden, FC Firenze,
  e quelli a una lettera dal nome ufficiale (FC Portuense, FC Famalicense, FC Vizelense, FC Arouquense, FC Brugse, FC Groninger, FC Annecien).

**Prima del test chiuso su Google Play serve un parere legale su questi nomi.** Non lo valuto io: non sono un legale e non ho consultato
registri dei marchi.

## Dubbi per il PO

1. **`alm2` «FC Murciano» (MRC)** è una mia proposta (criterio del 250: aggettivo di città, non confondibile con Almería). Murcia ha un club
   reale (Real Murcia): il nome resta associabile a quel club e non all'Almería, che è lo scopo, ma la scelta è del PO.
2. **Sigle proposte da me** per gli 11 nomi X senza sigla (MUC, KLN, EMS, NRZ, ZBR, BNC, RSN, PRT, GRT, SLR, PIF): la lista delle sigle
   ufficiali con cui le ho confrontate è dalla memoria, **non posso confermare** che nessuna coincida con un'abbreviazione ufficiale.
3. **Stadio di `s04` «Emscher Arena»**: proposta mia (lo stadio portava «Gelsenkirchen», che il PO ha tolto dal nome). `bvb` «Hörde Stadion»
   viene dalla proposta del 250.
4. **`_CR_BRANDS`**: tenute «Biancoceleste», «FC München», «FC Köln» perché non bloccano le grafie scelte; non ho aggiunto nomi ufficiali
   nuovi (es. «Paris Saint-Germain», «Inter Milan»). Se il PO vuole quei blocchi, è una riga ciascuno.
5. **Note «da verificare» del 250** (dalla memoria, non verificate): zone degli stadi di Juventus (Vallette/Lucento), Leicester (Aylestone),
   Bochum (Grumme), Leverkusen (Opladen/Wiesdorf), Boavista (Ramalde), Brescia (Mompiano), Swansea (Landore), Burnley (Calder). Nessuna di
   queste è stata applicata dalle scelte del PO tranne dove il PO ha scelto la A (es. `bvb` FC Westfalen, `bav` FC Foz do Douro): restano
   da verificare.
6. **Somiglianze di città** (volute, stile già nel gioco): FC Istanbul Ovest ↔ FC Istanbul, FC Berlin Köpenick ↔ FC Berlin, FC Rotterdam
   Kralingen/Spangen ↔ FC Rotterdam, FC Hamburg Hafen ↔ FC Hamburg. Nessun doppione di nome o sigla.
7. **La migrazione riscrive anche i testi liberi** salvati (diario, notizie, premi): una frase con «FC Milano Brera» diventa «FC Nerazzurri».
   È ciò che serve per 0 nomi superati, ma tocca anche frasi «storiche».
8. **Nomi con il numero** («FC Salernum 1919», «FC Emscher 04»): `nomi-190`/`nomi-211`/`sigle-203` verdi; a 360 px la classifica mostra
   comunque la sola sigla (come per tutti i club, vedi rapporto del 248).
9. **`sigle-203` è passato da rosso (base) a verde** senza che io abbia toccato la barra: non so dire se dipende dai nomi nuovi o dalla
   variabilità della misura. **`voto-79`** resta «cieco» come sulla base: non corretto (fuori ambito).
10. **`coreografie-244`, braccio rosso non giudicato** (errore del browser «Failed to open a new tab» dopo 30 partite del verde): da
    rifare nella verifica di rilascio.
11. **Controlli della MAPPA non eseguiti**: 154 su 175 (vedi sopra), da eseguire nella verifica di rilascio. Fra questi i test con nomi
    di oggi come dati (es. «FC Salernum» in molte sonde) che possono diventare rossi per il nome migrato.
12. **Riga di roadmap**: questo giro non tocca `GAME_VERSION` e non promuove su `main`; la riga in `docs/governo/ROADMAP.md` la scrive chi
    fa il rilascio.
