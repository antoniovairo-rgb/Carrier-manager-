# Proposta giro 250 — revisione di tutti i nomi dei club (PO-512)

Versione di riferimento: 7.999.197 · ramo `sviluppo/giro250-nomi-tutti` (da `lavoro/197`).
**Solo proposta: `src/` non è stato toccato.** La scelta è del PO; un giro successivo applica i nomi scelti.

Richiesta del PO (17/11, dopo PO-511): «ci sono altri nomi assurdi di squadre?» → «Sì, revisione di tutti i
252», «Passarli a città o zona» (anche i soprannomi veri e i nomi di stadio), «Nella 197».

## Criterio (lo stesso del giro 247)

- Prefisso + città, zona, quartiere o aggettivo di città, come `FC Bergamo`, `FC Madrid Este`, `FC Coruñés`.
- **A** = più riconoscibile (di solito con la città) · **B** = zona o quartiere, più distante dal club reale.
- Squadre della stessa città distinte per quartiere o zona.
- Esclusi: nomi ufficiali (anche come sottostringa), soprannomi noti, voci di `_CR_BRANDS`, nomi di stadi reali
  (es. niente Westfalenstadion, Anoeta, Bessa, Mosson, Bollaert, Sclessin, Bentegodi, Arechi, Carrow, Turf Moor,
  Vicarage, Millerntor, Tartiere, Euroborg, Galgenwaard).
- Sigla: tre lettere, sottosequenza del nome mostrato (regola SIGLA dell'audit, `src/09` «LE SIGLE»), diversa
  da quella di ogni altro club (compresi i 16 del 247 col nome A già deciso) e dalle abbreviazioni ufficiali
  che conosco (INT, MIL, CHE, STK, QPR, BVB, B04…; elenco nello script, **dalla memoria, non da una fonte**).
- I 16 club del giro 247 sono già decisi (li applica il giro 248): compaiono in tabella solo come «deciso al
  247», col nome A, per controllare le collisioni.

## Classi

1. per città/zona/aggettivo di città riconoscibile → resta, nessuna proposta;
2. inventato o non associabile;
3. oscuro (nome antico o regionale che pochi collegano);
4. soprannome vero o nome di stadio o parte del nome ufficiale;
5. fuorviante (fa pensare a un altro club o a un'altra città);
- **1\*** (classe in più, segnalata e non decisa): il nome è già per città, **ma coincide col nome ufficiale
  del club reale**, anche come sottostringa (`FC Twente`, `FC Utrecht`, `1. FC Nürnberg` contiene
  `FC Nürnberg`…). Il precedente è il giro 6, che ha rinominato `FC Köln` per lo stesso motivo. I nomi ufficiali
  li ho **dalla memoria e non li ho verificati su una fonte**: per questo restano una classe a parte con
  proposte non in grassetto. Se il PO li considera fuori ambito («sono già città») si saltano senza toccare nulla.

### Conteggio (252 club)

| Classe | Club |
|---|---|
| deciso al 247 | 16 |
| 1 — resta | 154 |
| 2 — inventato | 14 |
| 3 — oscuro | 11 |
| 4 — soprannome / stadio / parte del nome | 30 |
| 5 — fuorviante | 14 |
| 1\* — coincide col nome ufficiale | 13 |
| **Da decidere (2-5)** | **69** (+13 della 1\*) |

Le U18 (`Primavera 1` = Lega A, `Primavera 2` = Lega B) **ereditano** il nome con « Primavera» in coda
(`src/02:295-301`): non hanno nomi propri, cambiano col club madre. Lo script controlla anche il nome con
« Primavera» contro `_CR_BRANDS`.

## Tabella per lega

La colonna **Q** numera le righe da decidere dentro ogni lega a gruppi di 4 (1.1-1.4, 2.1-2.4…), per i
questionari della madre. Le righe di classe 1 restano in tabella per completezza (si vede che sono state
guardate tutte).

### Lega A

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| 1.1 | `juve` | Juventus (Torino) | Torino Athletic (TAT) | 5 | **FC Torino Vallette** (TVL) | **FC Vallette** (VLT) | Stadio Valcolle (resta) |
| | `inter` | — | FC Valmora (VAL) | deciso al 247 | **FC Milano Brera** (MBR) | — | vedi giro 247 |
| | `milan` | — | AC Dorvelli (ACR) | deciso al 247 | **FC Milano Sempione** (MSE) | — | vedi giro 247 |
| | `napoli` | — | FC Vellamare (VEL) | deciso al 247 | **FC Napoli Fuorigrotta** (NFG) | — | vedi giro 247 |
| | `roma` | | FC Capitale (CAP) | 1 | resta | | |
| | `lazio` | — | FC Alcavera (ALC) | deciso al 247 | **FC Flaminio** (FLM) | — | vedi giro 247 |
| | `ata` | | FC Bergamo (BRG) | 1 | resta | | |
| | `fio` | — | FC Brenvar (BRN) | deciso al 247 | **FC Firenze** (FRZ) | — | vedi giro 247 |
| | `tor` | — | FC Torvelle (TRV) | deciso al 247 | **FC Torino Santa Rita** (TSR) | — | vedi giro 247 |
| 1.2 | `bol` | Bologna | FC Felsineo (FEL) | 3 | **FC Bolognese** (BLG) | **FC Due Torri** (DTR) | Stadio Felsineo → A: Stadio Bolognese · B: Stadio delle Due Torri |
| | `udi` | | FC Friulano (FRI) | 1 | resta | | |
| | `sas` | — | FC Caldoran (CAL) | deciso al 247 | **FC Sassolese** (SSL) | — | vedi giro 247 |
| | `cag` | | FC Sardo (SAR) | 1 | resta | | |
| | `sam` | — | FC Marnesi (MAR) | deciso al 247 | **FC Genova Ponente** (GPO) | — | vedi giro 247 |
| | `gen` | | FC Genova (GEN) | 1 | resta | | |
| 1.3 | `ver` | Hellas Verona («gli Scaligeri») | FC Scaligero (SCA) | 4 | **FC Veronese** (VRN) | **FC Adige** (ADG) | Stadio Scaligero → Stadio Veronese (+ pool: «Stadio Scaligero Sud» → «Stadio Veronese Sud») |
| 1.4 | `mon2` | Monza («i Brianzoli») | FC Brianzolo (BRI) | 4 | **FC Monzese** (MZS) | **FC Lambro** (LMB) | Brianza Stadium (resta: zona) |
| | `lec` | | FC Salento (SLN) | 1 | resta | | |

### Premier Division

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `mcy` | | FC Manchester (MCH) | 1 | resta | | |
| | `liv` | | FC Merseyside (MER) | 1 | resta | | |
| | `ars` | | FC Islington (ISL) | 1 | resta | | |
| 1.1 | `che` | Chelsea (Stamford Bridge) | FC Stamford (STA) | 4 | **FC Kensington** (KSN) | **FC King's Road** (KGR) | Riverside Park (resta) |
| 1.2 | `mun` | Manchester United | Manchester Rovers (MCR) | 5 | **FC Manchester West** (MWE) | **FC Stretford** (SFD) | Northwich Stadium (resta; vedi nota) |
| | `tot` | | FC Haringey (HAR) | 1 | resta | | |
| | `new` | | FC Tyneside (TYN) | 1 | resta | | |
| 1.3 | `avl` | Aston Villa | FC Aston (AST) | 4 | **FC Birmingham North** (BHN) | **FC Witton** (WTN) | Aston Park → A: Birmingham North Park · B: Witton Stadium |
| 1.4 | `whu` | West Ham («Hammers») | FC Hammers (HAM) | 4 | **FC East London** (ELO) | **FC Stratford** (SRF) | East Stadium (resta) |
| | `bha` | | FC Sussex (SUS) | 1 | resta | | |
| 2.1 | `eve` | Everton (Goodison Park) | FC Goodison (GDS) | 4 | **FC Walton** (WLT) | **FC Kirkdale** (KRK) | Merseyside Park (resta) |
| 2.2 | `lei` | Leicester («Foxes») | FC Foxshire (FOX) | 4 | **FC Leicester** (LCS) | **FC Aylestone** (AYL) | Midlands Stadium (resta) |
| | `wol` | | FC Wolverhampton (WLV) | 1 | resta | | |
| 2.3 | `cry` | Crystal Palace (Selhurst Park) | FC Selhurst (SEL) | 4 | **FC Croydon** (CYD) | **FC South Norwood** (SNW) | Croydon Park (resta) |
| 2.4 | `ful` | Fulham (Craven Cottage) | FC Craven (CRA) | 4 | **FC Hammersmith** (HMS) | **FC Bishops Park** (BPK) | nessuna voce in CLUB_STADIUMS |
| 3.1 | `bre` | Brentford (Griffin Park) | FC Griffin (GRI) | 4 | **FC Hounslow** (HNS) | **FC Kew** (KEW) | nessuna voce in CLUB_STADIUMS |
| | `nfo` | | FC Nottingham (NOT) | 1 | resta | | |
| | `bou` | | FC Dorset (DOR) | 1 | resta | | |

### Liga Ibérica

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `rma` | | CF Madrid (CFM) | 1 | resta | | |
| | `bar` | | FC Catalunya (CAT) | 1 | resta | | |
| | `atm` | | AT Manzanares (ATM) | 1 | resta | | |
| | `sev` | | FC Hispalense (HIS) | 1 | resta | | |
| 1.1 | `vill` | Villarreal («Submarino Amarillo») | FC Submarino (SUB) | 4 | **FC Plana Baixa** (PBX) | **FC Millars** (MLR) | Estadio Amarillo (resta) |
| 1.2 | `rsoc` | Real Sociedad | FC Sociedad (SOC) | 4 | **FC Donostiarra** (DNT) | **FC Gipuzkoa** (GPZ) | Estadio Donostiarra (resta con A; con B → Estadio de Gipuzkoa) |
| | `bet` | — | FC Ventrana (VER) | deciso al 247 | **FC Heliópolis** (HEL) | — | vedi giro 247 |
| | `val` | | FC Valenciano (VLN) | 1 | resta | | |
| | `osa` | | FC Navarro (NAV) | 1 | resta | | |
| | `cel` | — | FC Oriolan (ORI) | deciso al 247 | **FC Vigués** (VGS) | — | vedi giro 247 |
| | `ath` | | FC Bilbao (BIL) | 1 | resta | | |
| | `ray` | | FC Madrid Este (MAD) | 1 | resta | | |
| | `gir` | | FC Gironí (GIR) | 1 | resta | | |
| | `mall` | | FC Balear (BAL) | 1 | resta | | |
| | `get` | — | FC Dalvora (DAL) | deciso al 247 | **FC Getafense** (GTF) | — | vedi giro 247 |
| | `las` | | FC Canario (CNR) | 1 | resta | | |
| 1.3 | `alm` | Almería (vedi doppione con alm2) | FC Indálico (IND) | 3 | **FC Almería** (FAL) | **FC Cabo de Gata** (CDG) | nessuna voce in CLUB_STADIUMS |
| | `esp` | — | FC Pelvanni (PEL) | deciso al 247 | **FC Sarrià** (SRR) | — | vedi giro 247 |

### Deutsche Liga

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `bay` | — | FC Valdenau (VLD) | deciso al 247 | **FC Isar** (ISR) | — | vedi giro 247 |
| 1.1 | `bvb` | Borussia Dortmund | FC Goldwald (GLW) | 2 | **FC Westfalen** (WSF) | **FC Hörde** (HRD) | Goldwald Stadion → Hörde Stadion |
| | `rbl` | | FC Leipzig (FLZ) | 1 | resta | | |
| 1.2 | `b04` | Bayer Leverkusen | FC Werkstadt (WRK) | 2 | **FC Opladen** (OPL) | **FC Wiesdorf** (WSD) | Werkstadt Arena → A: Opladen Arena · B: Wiesdorf Arena |
| | `bsc` | | FC Berlin (FBL) | 1 | resta | | |
| | `fra` | | FC Frankfurt (FFT) | 1 | resta | | |
| | `fre` | | FC Friburgo (FRB) | 1 | resta | | |
| 1.3 | `wob` | Wolfsburg | FC Wolfstadt (WOL) | 2 | **FC Aller** (ALR) | **FC Fallersleben** (FLL) | nessuna voce in CLUB_STADIUMS |
| | `mgb` | | FC Niederrhein (NIE) | 1 | resta | | |
| | `stu` | | FC Stuttgart (STG) | 1 | resta | | |
| 1.4 | `aug` | FC Augsburg 1907 | FC Augsburg (AUG) | 1* | FC Augusta (AGS) | FC Lech (LCH) | — |
| | `mai` | | FC Mainz (MAI) | 1 | resta | | |
| | `hof` | | FC Kraichgau (KRA) | 1 | resta | | |
| | `kol` | — | FC Ravelmund (RVM) | deciso al 247 | **FC Domstadt** (DMS) | — | vedi giro 247 |
| | `wer` | | FC Weser (WSR) | 1 | resta | | |
| 2.1 | `dsc` | Darmstadt («Die Lilien») | FC Lilien (LLN) | 4 | **FC Darmstadt** (DMT) | **FC Bessungen** (BSG) | nessuna voce in CLUB_STADIUMS |
| 2.2 | `boc` | Bochum (il «Ruhrpott» è anche Dortmund e Gelsenkirchen) | FC Ruhrpott (RUH) | 5 | **FC Bochum** (BCH) | **FC Grumme** (GRM) | nessuna voce in CLUB_STADIUMS |
| 2.3 | `ber` | Union Berlin (Köpenick, a sud-est: «Nord» porta fuori strada) | FC Berlin Nord (BNO) | 5 | **FC Berlin Köpenick** (BKP) | **FC Köpenick** (KPN) | nessuna voce in CLUB_STADIUMS |

### Ligue Nationale

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `psg` | — | FC Lumeranza (LUM) | deciso al 247 | **FC Parigi Ovest** (PGO) | — | vedi giro 247 |
| | `marse` | | FC Marseille (MSL) | 1 | resta | | |
| | `mon` | | FC Monaco (MCO) | 1 | resta | | |
| | `lyon` | | FC Lyon (LYO) | 1 | resta | | |
| | `nice` | | FC Nizza (NIZ) | 1 | resta | | |
| | `lille` | | FC Lillese (LIL) | 1 | resta | | |
| | `ren` | | FC Rennese (REN) | 1 | resta | | |
| 1.1 | `len` | Lens | FC Artois (ART) | 3 | **FC Lensois** (LSO) | **FC Gohelle** (GHL) | Lens Stadium (resta) |
| | `str` | | FC Strasburgo (STR) | 1 | resta | | |
| | `nan` | | FC Nantese (NAN) | 1 | resta | | |
| 1.2 | `mtp` | Montpellier (nome troncato) | FC Montpel (MON) | 2 | **FC Montpellier** (MPL) | **FC Hérault** (HRT) | nessuna voce in CLUB_STADIUMS |
| 1.3 | `rei` | Reims | FC Remense (REM) | 3 | **FC Reims** (RMS) | **FC Marne** (MRN) | nessuna voce in CLUB_STADIUMS |
| | `tou` | | FC Tolosa (TOL) | 1 | resta | | |
| | `lor` | | FC Morbihan (MRB) | 1 | resta | | |
| | `bre2` | | FC Brest (BRT) | 1 | resta | | |
| | `cle` | | FC Clermont (CLE) | 1 | resta | | |
| | `hac` | | FC Le Havre (HAV) | 1 | resta | | |
| | `metz` | | FC Mosella (MOS) | 1 | resta | | |

### Liga Lusitana

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `ben` | | FC Lisboa (FLS) | 1 | resta | | |
| 1.1 | `por` | FC Porto | FC Portomar (POR) | 2 | **FC Portuense** (PTN) | **FC Campanhã** (CPH) | Estádio Azul (resta) |
| | `spo` | — | FC Rendalto (RDL) | deciso al 247 | **FC Lisboa Norte** (LNO) | — | vedi giro 247 |
| 1.2 | `bra` | Braga (il Minho è anche Guimarães) | FC Minhoto (MIN) | 5 | **FC Bracarense** (BRC) | **FC Dume** (DUM) | nessuna voce in CLUB_STADIUMS |
| | `vsc` | | FC Vimaranense (VIM) | 1 | resta | | |
| 1.3 | `rioave` | Rio Ave (Vila do Conde) | FC Rio Verde (RIO) | 2 | **FC Vila do Conde** (VDC) | **FC Vilacondense** (VCE) | nessuna voce in CLUB_STADIUMS |
| 1.4 | `bav` | Boavista («As Panteras», Porto) | FC Panteras (PAN) | 4 | **FC Foz do Douro** (FDD) | **FC Ramalde** (RML) | nessuna voce in CLUB_STADIUMS |
| | `estoril` | | FC Estoril (EST) | 1 | resta | | |
| 2.1 | `gviz` | Gil Vicente (Barcelos) | FC Vicente (VIC) | 4 | **FC Barcelos** (BCL) | **FC Cávado** (CVD) | nessuna voce in CLUB_STADIUMS |
| 2.2 | `fama` | Famalicão | FC Famalar (FAM) | 2 | **FC Famalicense** (FMC) | **FC Vale do Ave** (VDA) | nessuna voce in CLUB_STADIUMS |
| | `morei` | | FC Moreira (MRA) | 1 | resta | | |
| 2.3 | `vize` | Vizela | FC Vizalta (VIZ) | 2 | **FC Vizelense** (VZL) | **FC Caldas de Vizela** (CDV) | nessuna voce in CLUB_STADIUMS |
| | `chav` | | FC Chaves (CHA) | 1 | resta | | |
| 2.4 | `aroca` | Arouca | FC Aroalta (ARO) | 2 | **FC Arouquense** (ARQ) | **FC Serra da Freita** (SDF) | nessuna voce in CLUB_STADIUMS |
| | `casa` | | FC Lisboa Ovest (LIS) | 1 | resta | | |
| 3.1 | `scar` | Santa Clara (Ponta Delgada, Azzorre) | FC Clara (CLR) | 4 | **FC Ponta Delgada** (PDG) | **FC Açoriano** (ACO) | nessuna voce in CLUB_STADIUMS |
| | `aves` | | FC Aves (AVS) | 1 | resta | | |
| | `farense` | | FC Farense (FAR) | 1 | resta | | |

### Liga Oranje

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `ajax` | | FC Amsterdam (AMS) | 1 | resta | | |
| | `psv` | | FC Brabantia (BRB) | 1 | resta | | |
| | `feye` | | FC Rotterdam (RTD) | 1 | resta | | |
| | `az` | | FC Alkmaar (ALK) | 1 | resta | | |
| 1.1 | `utr` | FC Utrecht | FC Utrecht (UTR) | 1* | FC Oudegracht (ODG) | FC Zuilen (ZUL) | — |
| 1.2 | `twe` | FC Twente | FC Twente (TWE) | 1* | FC Enschede (ENS) | FC Enschede Zuid (EZD) | — |
| | `vita` | | FC Arnhem (ARN) | 1 | resta | | |
| 1.3 | `gron` | FC Groningen | FC Groningen (GRO) | 1* | FC Groninger (GNR) | FC Hunze (HNZ) | — |
| | `heer` | | FC Heerenveen (HEE) | 1 | resta | | |
| | `wil` | | FC Tilburg (TIL) | 1 | resta | | |
| | `nec` | | FC Nijmegen (NIJ) | 1 | resta | | |
| | `her` | | FC Almelo (ALM) | 1 | resta | | |
| | `gor` | | FC Deventer (DEV) | 1 | resta | | |
| 1.4 | `spa` | Sparta Rotterdam | FC Havenstad (HVN) | 2 | **FC Rotterdam Spangen** (RSP) | **FC Spangen** (SPG) | nessuna voce in CLUB_STADIUMS |
| 2.1 | `exc` | Excelsior Rotterdam | FC Oostzijde (OOS) | 2 | **FC Rotterdam Kralingen** (RKL) | **FC Kralingen** (KLG) | nessuna voce in CLUB_STADIUMS |
| | `cam` | | FC Leeuwarden (LWR) | 1 | resta | | |
| 2.2 | `volen` | FC Volendam | FC Volendam (VOL) | 1* | FC Waterland (WTL) | FC Edam (EDM) | — |
| 2.3 | `emm` | FC Emmen | FC Emmen (EMM) | 1* | FC Drenthe (DRT) | FC Emmerhout (EMH) | — |

### Liga Belga

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `club` | | FC Fiandria (FIA) | 1 | resta | | |
| | `and` | | FC Bruxella (BRX) | 1 | resta | | |
| | `genk` | | FC Genk (GNK) | 1 | resta | | |
| | `gent` | | FC Gent (GNT) | 1 | resta | | |
| 1.1 | `std` | Standard Liège | FC Vallonia (VLA) | 3 | **FC Liegi** (LGI) | **FC Ourthe** (OUR) | Stade des Ardennes (resta) |
| 1.2 | `usj` | Union Saint-Gilloise (Bruxelles) | FC Union (UNI) | 4 | **FC Bruxelles Sud** (BXS) | **FC Saint-Gilles** (SGL) | nessuna voce in CLUB_STADIUMS |
| | `ant` | | FC Antwerp (ANT) | 1 | resta | | |
| 1.3 | `krc` | Cercle Brugge (la «Westflandria» contiene la «Fiandria» del Club Brugge) | FC Westflandria (WFL) | 5 | **FC Brugse** (BGS) | **FC Sint-Andries** (SAD) | nessuna voce in CLUB_STADIUMS |
| | `ohl` | | FC Leuven (LEU) | 1 | resta | | |
| | `cha` | | FC Charleroi (CHR) | 1 | resta | | |
| | `mec` | | FC Mechelen (MEC) | 1 | resta | | |
| | `kor` | | FC Kortrijk (KOR) | 1 | resta | | |
| 1.4 | `stu2` | Sint-Truiden (nome troncato) | FC Truiden (TRU) | 2 | **FC Sint-Truiden** (SNT) | **FC Haspengouw** (HSP) | nessuna voce in CLUB_STADIUMS |
| | `wes` | | FC Westerlo (WES) | 1 | resta | | |
| | `ser` | | FC Seraing (SER) | 1 | resta | | |
| | `zul` | | FC Waregem (WAR) | 1 | resta | | |
| | `bch` | | FC Anversa Sud (ANV) | 1 | resta | | |
| | `eup` | | FC Eupen (EUP) | 1 | resta | | |

### Liga Anatolica

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `gal` | | FC Istanbul (IST) | 1 | resta | | |
| | `fenk` | | FC Kadıköy (FKD) | 1 | resta | | |
| 1.1 | `bes` | Beşiktaş («Kara Kartal») | FC Kartal (KAR) | 4 | **FC Boğaziçi** (BGZ) | **FC Ortaköy** (ORT) | Boğaz Park (resta: coerente con A) |
| | `tra` | | FC Trabzon (TRA) | 1 | resta | | |
| 1.2 | `bas` | İstanbul Başakşehir (il Bosforo è di Beşiktaş) | FC Bosforo (BOS) | 5 | **FC Istanbul Ovest** (IOV) | **FC İkitelli** (IKT) | nessuna voce in CLUB_STADIUMS |
| | `ada` | | FC Adana (ADA) | 1 | resta | | |
| | `siv` | | FC Sivas (SIV) | 1 | resta | | |
| | `kas` | | FC Kasimpasa (KAS) | 1 | resta | | |
| | `ank` | | FC Ankara (ANK) | 1 | resta | | |
| | `ant2` | | FC Antalya (ANA) | 1 | resta | | |
| | `kon` | | FC Konya (KON) | 1 | resta | | |
| | `kay` | | FC Kayseri (KAY) | 1 | resta | | |
| | `hat` | | FC Hatay (HAT) | 1 | resta | | |
| | `riz` | | FC Rize (RIZ) | 1 | resta | | |
| | `ala` | | FC Alanya (ALA) | 1 | resta | | |
| | `kag` | | FC Fatih (FAT) | 1 | resta | | |
| | `pen` | | FC Pendik (PEN) | 1 | resta | | |
| | `sam2` | | FC Samsun (SAM) | 1 | resta | | |

### Lega B

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `par` | | FC Parmense (PAR) | 1 | resta | | |
| | `cre` | | FC Cremona (CRE) | 1 | resta | | |
| | `mod` | | FC Modenese (MOD) | 1 | resta | | |
| 1.1 | `pal` | Palermo | FC Sicania (SIC) | 3 | **FC Palermitano** (PLR) | **FC Conca d'Oro** (CDO) | nessuna voce in CLUB_STADIUMS |
| 1.2 | `cat` | Catanzaro («Calabro» vale anche per Cosenza e Reggio) | FC Calabro (CLB) | 5 | **FC Catanzarese** (CTN) | **FC Tre Colli** (TCL) | nessuna voce in CLUB_STADIUMS |
| | `spe` | | FC Spezzino (SPE) | 1 | resta | | |
| 1.3 | `bar2` | Bari («Pugliese» vale anche per Lecce, Foggia, Taranto) | FC Pugliese (PUG) | 5 | **FC Barese** (BSE) | **FC Terra di Bari** (TDB) | nessuna voce in CLUB_STADIUMS |
| 1.4 | `ven` | Venezia | FC Laguna (LAG) | 3 | **FC Veneziano** (VNZ) | **FC Sant'Elena** (SEN) | nessuna voce in CLUB_STADIUMS |
| | `pis` | | FC Pisano (PIS) | 1 | resta | | |
| 2.1 | `fro` | Frosinone | FC Ciociaro (CIO) | 3 | **FC Frusinate** (FRS) | **FC Valle del Sacco** (VDS) | nessuna voce in CLUB_STADIUMS |
| | `ces` | | FC Cesenate (CES) | 1 | resta | | |
| | `samp` | | FC Empolese (EMP) | 1 | resta | | |
| 2.2 | `sal` | Salernitana | FC Salernum (SAL) | 3 | **FC Salerno** (SLE) | **FC Irno** (IRN) | Stadio Salernum → A: Stadio di Salerno · B: Stadio dell'Irno |
| 2.3 | `cit` | Cittadella («Cittadino» = abitante di una città) | FC Cittadino (CIT) | 5 | **FC Cittadellese** (CTD) | **FC Alta Padovana** (APD) | nessuna voce in CLUB_STADIUMS |
| | `sdt` | | FC Altoadige (ALT) | 1 | resta | | |
| 2.4 | `cos` | Cosenza | FC Bruzio (BRU) | 3 | **FC Cosentino** (CSN) | **FC Busento** (BSN) | nessuna voce in CLUB_STADIUMS |
| 3.1 | `bres` | Brescia («Leonessa d'Italia») | FC Leonessa (LNS) | 4 | **FC Bresciano** (BCN) | **FC Mompiano** (MMP) | nessuna voce in CLUB_STADIUMS |
| 3.2 | `lec2` | Lecco (il Lario è anche il lago del Como) | FC Lariano (LAR) | 5 | **FC Lecchese** (LCC) | **FC Resegone** (RSG) | nessuna voce in CLUB_STADIUMS |

### Championship

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `lut` | | FC Luton (LUT) | 1 | resta | | |
| | `mid` | | FC Teesside (TES) | 1 | resta | | |
| | `cov` | | FC Coventry (COV) | 1 | resta | | |
| 1.1 | `swn` | Swansea («Swans») | FC Swans (SWA) | 4 | **FC Swansea** (SWS) | **FC Landore** (LDR) | nessuna voce in CLUB_STADIUMS |
| 1.2 | `shu` | Sheffield United (gli «Steelers» sono una squadra di hockey di Sheffield) | FC Steelers (STE) | 5 | **FC Sheffield South** (SHS) | **FC Sharrow** (SRW) | nessuna voce in CLUB_STADIUMS |
| | `ips` | | FC Ipswich (IPS) | 1 | resta | | |
| | `lee` | | FC Leeds (LEE) | 1 | resta | | |
| 1.3 | `bur` | Burnley («Clarets») | FC Clarets (CLA) | 4 | **FC Burnley** (BNL) | **FC Calder** (CLD) | Lancashire Stadium (resta) |
| 1.4 | `nor` | Norwich («Canaries») | FC Canaries (CAN) | 4 | **FC Norwich** (NRW) | **FC Norfolk** (NFK) | nessuna voce in CLUB_STADIUMS |
| 2.1 | `wba` | West Bromwich Albion («Albion» è anche il Brighton) | FC Albion (ALB) | 5 | **FC West Bromwich** (WBR) | **FC Sandwell** (SDW) | nessuna voce in CLUB_STADIUMS |
| | `bri` | | FC Bristol (BRS) | 1 | resta | | |
| 2.2 | `milw` | Millwall («Dockers») | FC Dockers (DOC) | 4 | **FC Bermondsey** (BMD) | **FC Rotherhithe** (RTH) | nessuna voce in CLUB_STADIUMS |
| | `bla` | | FC Blackburn (BBR) | 1 | resta | | |
| | `pre` | | FC Preston (PRE) | 1 | resta | | |
| 2.3 | `car` | Cardiff («Bluebirds») | FC Bluebirds (BLB) | 4 | **FC Cardiff** (CDF) | **FC Leckwith** (LCK) | nessuna voce in CLUB_STADIUMS |
| 2.4 | `wat` | Watford («Hornets») | FC Hornets (HOR) | 4 | **FC Watford** (WFD) | **FC Hertfordshire** (HFS) | nessuna voce in CLUB_STADIUMS |
| 3.1 | `sto` | Stoke («Potters») | FC Potters (POT) | 4 | **FC Stoke** (SKE) | **FC Staffordshire** (SFS) | nessuna voce in CLUB_STADIUMS |
| 3.2 | `qpr` | Queens Park Rangers (Queensway è a Bayswater) | FC Queensway (QUE) | 2 | **FC Shepherd's Bush** (SBU) | **FC White City** (WCY) | nessuna voce in CLUB_STADIUMS |

### Deutsche Liga 2

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `hbu` | | FC Hamburg (HMB) | 1 | resta | | |
| | `han` | | FC Hannover (HAN) | 1 | resta | | |
| 1.1 | `nub` | 1. FC Nürnberg | FC Nürnberg (FCN) | 1* | FC Norimberga (NRB) | FC Pegnitz (PGN) | — |
| | `kar` | | FC Karlsruhe (KRL) | 1 | resta | | |
| | `kil` | | FC Kiel (KIE) | 1 | resta | | |
| 1.2 | `kaa` | 1. FC Kaiserslautern | FC Kaiserslautern (FCK) | 1* | FC Lautern (LTN) | FC Pfalz (PFZ) | — |
| | `duf` | | FC Düsseldorf (FDF) | 1 | resta | | |
| | `fur` | | FC Fürth (FUR) | 1 | resta | | |
| 1.3 | `s04` | FC Gelsenkirchen-Schalke 04 | FC Gelsenkirchen (FGK) | 1* | FC Emscher (EMS) | FC Buer (BUE) | — |
| 1.4 | `mag` | 1. FC Magdeburg | FC Magdeburg (MGB) | 1* | FC Börde (BRD) | FC Elbaue (ELB) | — |
| | `pad` | | FC Paderborn (PAD) | 1 | resta | | |
| | `ros` | | FC Rostock (ROS) | 1 | resta | | |
| | `brn` | | FC Braunschweig (BRA) | 1 | resta | | |
| 2.1 | `sar` | 1. FC Saarbrücken | FC Saarbrücken (FCS) | 1* | FC Saarland (SRL) | FC Saar (SAA) | — |
| | `dre` | | FC Dresden (DRE) | 1 | resta | | |
| 2.2 | `stp` | St. Pauli (Amburgo) | FC Sankt Hafen (SAN) | 2 | **FC Hamburg Hafen** (HHF) | **FC Reeperbahn** (RPB) | nessuna voce in CLUB_STADIUMS |
| | `osn` | | FC Osnabrück (OSN) | 1 | resta | | |
| | `arm` | | FC Bielefeld (BIE) | 1 | resta | | |

### Ligue Nationale 2

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `gre` | | FC Grenoble (GRE) | 1 | resta | | |
| | `nic2` | | FC Niort (NIO) | 1 | resta | | |
| 1.1 | `val2` | Valenciennes («Valencien» ricorda Valencia) | FC Valencien (VCN) | 5 | **FC Valenciennes** (VNS) | **FC Escaut** (ESC) | nessuna voce in CLUB_STADIUMS |
| | `pau` | | FC Pau (PAU) | 1 | resta | | |
| | `cae` | | FC Caen (CAE) | 1 | resta | | |
| | `lav` | | FC Laval (LAV) | 1 | resta | | |
| 1.2 | `ann` | FC Annecy | FC Annecy (ANN) | 1* | FC Annecien (ANC) | FC Haute-Savoie (HSV) | — |
| | `tro` | | FC Troyes (TRO) | 1 | resta | | |
| | `ami` | | FC Amiens (AMI) | 1 | resta | | |
| | `dun` | | FC Dunkerque (DUN) | 1 | resta | | |
| | `gui` | | FC Guingamp (GUI) | 1 | resta | | |
| | `rod` | | FC Rodez (ROD) | 1 | resta | | |
| | `aja2` | | FC Ajaccio (AJA) | 1 | resta | | |
| | `bas2` | | FC Bastia (BAS) | 1 | resta | | |
| | `soch` | | FC Doubs (FCD) | 1 | resta | | |
| | `aux` | | FC Auxerre (AUX) | 1 | resta | | |
| 1.3 | `que` | FC Rouen 1899 | FC Rouen (ROU) | 1* | FC Normandia (NMD) | FC Seine-Maritime (SMT) | — |
| | `con2` | | FC Concarneau (CON) | 1 | resta | | |

### Liga Ibérica 2

| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |
|---|---|---|---|---|---|---|---|
| | `dep` | | FC Coruñés (COR) | 1 | resta | | |
| | `real2` | | FC Cántabro (CNT) | 1 | resta | | |
| 1.1 | `lev` | Levante («Granota») | FC Granota (GRN) | 4 | **FC València Nord** (VNR) | **FC Orriols** (ORR) | nessuna voce in CLUB_STADIUMS |
| | `tene` | | FC Tinerfeño (TIN) | 1 | resta | | |
| 1.2 | `vld` | Valladolid («Pucela») | FC Pucela (PUC) | 4 | **FC Vallisoletano** (VLS) | **FC Pisuerga** (PSR) | nessuna voce in CLUB_STADIUMS |
| | `hue` | | FC Oscense (OSC) | 1 | resta | | |
| | `bur2` | | FC Burgalés (BUR) | 1 | resta | | |
| 1.3 | `zgz` | Real Zaragoza («maños») | FC Maño (MAO) | 4 | **FC Zaragozano** (ZRG) | **FC Ebro** (EBR) | nessuna voce in CLUB_STADIUMS |
| | `mir` | | FC Mirandés (MIR) | 1 | resta | | |
| | `alb` | | FC Manchego (MNC) | 1 | resta | | |
| | `elx` | | FC Ilicitano (ILI) | 1 | resta | | |
| | `mal` | | FC Malacitano (MAL) | 1 | resta | | |
| | `snd` | | FC Gijonés (GIJ) | 1 | resta | | |
| 1.4 | `ovi` | Real Oviedo («carbayones») | FC Carbayón (CAR) | 4 | **FC Ovetense** (OVT) | **FC Naranco** (NRC) | nessuna voce in CLUB_STADIUMS |
| | `cad` | | FC Gaditano (GAD) | 1 | resta | | |
| | `alm2` | | FC Almeriense (ALE) | 1 | resta | | |
| 2.1 | `cor2` | Córdoba («ciudad califal») | FC Califal (CAL) | 3 | **FC Cordobés** (CDB) | **FC Sierra Morena** (SMR) | nessuna voce in CLUB_STADIUMS |
| | `fer` | | FC Ferrolano (FER) | 1 | resta | | |

## Note sulle scelte (fatti di dominio pubblico, **non verificati su una fonte in questo giro**)

- `juve`: «Torino Athletic» è fuorviante perché il Torino è l'altro club (`tor` → `FC Torino Santa Rita`). Lo
  stadio della Juventus è nella zona delle Vallette — **da verificare** (potrebbe essere indicata come Lucento).
- `ver`: «Scaligeri» è il soprannome dell'Hellas Verona. `mon2`: «Brianzoli» è usato per il Monza, ma è anche
  l'aggettivo della zona: tenerlo è difendibile, lo segnalo e basta.
- `mun`: Old Trafford è nel distretto di Trafford/Stretford; «Rovers» ricorda Blackburn/Bristol Rovers.
  `Northwich Stadium` (stadio del club nel gioco) usa il nome di una città reale del Cheshire: lo lascio, ma lo
  segnalo.
- `che`: Chelsea è un quartiere del borough di Kensington and Chelsea; King's Road è la via del quartiere.
  `ful`: Fulham è nel borough di Hammersmith and Fulham, Bishops Park è il parco accanto allo stadio.
  `bre`: Brentford è nel borough di Hounslow. `whu`: lo stadio attuale è a Stratford. `eve`: Goodison è nel
  quartiere di Walton (non si può usare «Liverpool»: è in `_CR_BRANDS`). `avl`: Villa Park è a Witton/Aston, a
  nord di Birmingham; «FC Birmingham» da solo farebbe pensare al Birmingham City. `cry`: Selhurst è a South
  Norwood, borough di Croydon. `lei`: Aylestone è la zona dello stadio — **da verificare**.
- `vill`: «Villarreal» è in `_CR_BRANDS` e «Vila-real» gli è troppo vicino: resta solo la comarca (Plana Baixa)
  o il fiume (Millars) — **riconoscibilità bassa**, lo dico apertamente. `rsoc`: «donostiarra» è l'aggettivo di
  San Sebastián, usato dai giornali spagnoli.
- `alm` / `alm2`: **due club del gioco evocano l'Almería** (stessi colori rosso-bianchi: `FC Indálico` in Liga
  Ibérica e `FC Almeriense` in Liga Ibérica 2). È un doppione d'identità che il cambio di nome non risolve: la
  decisione (quale club reale doveva essere `alm2`, se uno dei due) è del PO. Per ora propongo solo `alm`.
- `bvb`: «Dortmund» è in `_CR_BRANDS`; Westfalen è la regione (ma ricorda il Westfalenstadion: vedi rischi),
  Hörde un quartiere. `b04`: «Leverkusen» è in `_CR_BRANDS`; Opladen e Wiesdorf sono quartieri della città —
  quale sia quello dello stadio è **da verificare**. `wob`: «Wolfsburg» è in `_CR_BRANDS`; l'Aller è il fiume,
  Fallersleben un quartiere. Nota onesta: «Wolfstadt» (città del lupo) per qualcuno è già associabile.
- `ber`: l'Union Berlin è di Köpenick, a sud-est; «Berlin Nord» porta fuori strada. `boc`: il «Ruhrpott» è
  anche Dortmund e Gelsenkirchen; Grumme come quartiere dello stadio è **da verificare**.
- `stp`: «St. Pauli» è insieme quartiere e nome del club, quindi l'ho evitato; Reeperbahn è la via famosa del
  quartiere.
- `por` / `bav`: «FC Porto» è il nome ufficiale, quindi nessuna proposta contiene «FC Porto» (anche
  `FC Porto Boavista` lo conterrebbe). Campanhã è la freguesia dello stadio del Porto; Ramalde come zona dello
  stadio del Boavista è **da verificare**. `bra`: il Minho è anche di Guimarães (`vsc` = `FC Vimaranense`).
- `fama`/`vize`/`aroca`: `FC Famalicão`, `FC Vizela`, `FC Arouca` sono i nomi ufficiali: propongo l'aggettivo
  della città. `FC Vale do Ave` (B di `fama`) può ricordare il Rio Ave o l'Aves: se il PO lo trova confondibile
  vale la A.
- `spa`/`exc`: Sparta gioca a Spangen, Excelsior a Kralingen (Rotterdam). «Feijenoord» (il quartiere) l'ho
  evitato perché è a una lettera da «Feyenoord».
- `usj`: «Forest» (comune di Bruxelles vicino allo stadio) l'ho evitato perché ricorda il Nottingham Forest.
  `krc`: il Cercle Brugge è di Bruges come il Club Brugge (`club` = `FC Fiandria`); «Bruges»/«Brugge» sono in
  `_CR_BRANDS`, «Brugse» (aggettivo olandese) no — è comunque molto vicino.
- `bes`/`bas`: Beşiktaş è sul Bosforo («Boğaziçi» in turco, coerente con lo stadio di oggi `Boğaz Park`);
  Başakşehir è a ovest, lontano dal Bosforo. `FC Bosforo` oggi è il Başakşehir: è il caso fuorviante.
- Lega B: `cat` è il Catanzaro (giallorossi), «città dei tre colli» è il suo epiteto; `cos` il Cosenza (Busento
  è il fiume); `cit` il Cittadella; `lec2` il Lecco (il Lario è anche il lago di Como); `bres` il Brescia
  (Mompiano come zona dello stadio è **da verificare**). «Salernitano» l'ho scartato perché è il nome
  ufficiale (Salernitana) al maschile.
- `shu`: gli «Sheffield Steelers» sono una squadra di hockey reale; «Sheffield FC» è un club reale (il più
  antico), quindi niente `FC Sheffield` da solo. `wba`: «Albion» è anche il Brighton & Hove Albion.
  `qpr`: Queensway è a Bayswater, lo stadio del QPR è a Shepherd's Bush/White City. `bur`: il Calder come fiume
  di Burnley è **da verificare** (B debole). `swn`: Landore come zona dello stadio è **da verificare**.
- `val2`: «Valencien» ricorda Valencia (`val` = `FC Valenciano`). `lev`: «València Nord» fa coppia con
  `FC Valenciano` come Madrid Este con CF Madrid.
- 1\*: `FC Augusta` è il nome italiano di Augsburg (ma è anche una città siciliana e una americana); `FC Lautern`
  è come chiamano Kaiserslautern; `FC Oudegracht` (canale del centro di Utrecht) è **poco riconoscibile**:
  «Domstad», l'epiteto di Utrecht, l'ho evitato perché il 247 ha già deciso `FC Domstadt` per Colonia.

### Casi al limite lasciati in classe 1 (da guardare se il PO vuole essere più severo)

`FC Capitale` (Roma: epiteto della città), `FC Hispalense` (Siviglia: aggettivo antico ma usato dalla stampa
spagnola, il 247 lo ha tenuto), `FC Friulano` e `FC Sardo` (regioni), `AT Manzanares` (fiume di Madrid),
`FC Brabantia` (regione: «Eindhoven» è in `_CR_BRANDS`), `FC Niederrhein` (regione del Gladbach), `FC Fiandria`
(Club Brugge: regione; `FC Vallonia` invece l'ho messa in classe 3), `FC Istanbul` (Galatasaray: nome generico della
città, mentre Kadıköy e i nuovi nomi di Beşiktaş/Başakşehir sono quartieri), `FC Kasimpasa` e `FC Fatih`
(quartiere che è anche parte del nome ufficiale), `FC Manchester` (City: con `mun` → `FC Manchester West`
diventerebbe la squadra «generica» della città), `FC Berlin` (Hertha, idem con `ber`), `FC Manchego` (anche un
formaggio a denominazione protetta), `FC Antwerp` (nome inglese della città), `FC Ajaccio`, `FC Bastia`,
`FC Seraing` (esistono o sono esistiti club reali con nomi che li contengono — **da verificare**).

## Controlli fatti sulla proposta (script, nessun browser)

`python3 tools/sonde/proposta-nomi-250.py` legge `src/02`, `src/05`, `src/09` di `lavoro/197` e controlla i
**164 nomi proposti** (A e B di 69 + 13 club) e i **10 stadi nuovi**:

- **`_CR_BRANDS` (102 voci, confronto per sottostringa come l'audit, anche col suffisso « Primavera»): 0
  corrispondenze.**
- **Sigle**: tutte di tre lettere, sottosequenze del nome (stessa normalizzazione dell'audit), nessuna uguale a
  quella di un altro club (dopo il 247), nessuna doppia fra le proposte, nessuna nell'elenco delle sigle
  ufficiali note.
- **Nomi**: nessun doppione con gli altri club né fra le proposte, nessuno uguale a uno stadio del gioco; per la
  1\* nessuna proposta contiene il nome ufficiale (il controllo ha bocciato `FC Magdeburgo`, `FC Rouennais`,
  `FC Volendammer`, `FC Gelsenkirchener`, sostituiti).
- **Stadi nuovi**: nessuno già esistente, nessuno tocca `_CR_BRANDS`.
- **Prova del rosso**: copia dello script con `FC Anfield Walton` e la sigla `CAP` su `eve` → tre righe ROSSO
  (brand, sigla non sottosequenza, sigla di un altro club).
- Somiglianze di città stampate dallo script (volute, stesso stile già nel gioco): `FC Istanbul Ovest` ↔
  `FC Istanbul`, `FC Berlin Köpenick` ↔ `FC Berlin`, `FC Rotterdam Spangen`/`Kralingen` ↔ `FC Rotterdam`,
  `FC Torino Vallette` ↔ `FC Torino Santa Rita`, `FC Manchester West` ↔ `FC Manchester`, `FC Hamburg Hafen` ↔
  `FC Hamburg`. Ogni riga ha una B senza la città.
- **Non controllato**: la resa sullo schermo dei nomi lunghi (`FC Rotterdam Kralingen` 22 caratteri,
  `FC Berlin Köpenick`, `FC Birmingham North`, `FC Caldas de Vizela`): lo diranno `nomi-190`/`sigle-203`
  nel giro che applica.

## Rischi copyright

**Non sono un legale e non ho consultato registri dei marchi**: è una valutazione di buon senso, non un
parere. Prima della pubblicazione sugli store la decisione resta del PO (eventualmente con un consulto).

- **Toponimi puri** (città, quartieri, fiumi, regioni, aggettivi di città): sono la maggioranza delle proposte.
  Un nome di luogo in sé non è di un club; il rischio viene dall'**insieme** dei segni (nome + colori sociali
  già nel gioco + sigla + stadio) che rende riconoscibile il club reale — che è quello che il PO chiede.
- **Nomi con la città del club**, che coincidono col nome comune del club reale: `FC Leicester`, `FC Swansea`,
  `FC Burnley`, `FC Norwich`, `FC Cardiff`, `FC Watford`, `FC Stoke`, `FC West Bromwich`, `FC Darmstadt`,
  `FC Bochum`, `FC Reims`, `FC Montpellier`, `FC Valenciennes`, `FC Almería`, `FC Salerno`, `FC Sint-Truiden`.
  Seguono lo stile già nel gioco (`FC Leeds`, `FC Luton`, `FC Coventry`), ma sono le più vicine al club vero:
  per questo ogni riga ha una B.
- **Luoghi legati allo stadio o alla storia del club** (più esposti): `FC Westfalen` (ricorda il
  Westfalenstadion), `FC Stretford` (la «Stretford End» è la curva dello United), `FC King's Road`,
  `FC Campanhã`, `FC Foz do Douro`, `FC Saint-Gilles`, `FC Köpenick`, `FC Reeperbahn` (via famosissima: potrebbe
  avere marchi registrati da terzi — **non posso confermarlo né escluderlo**), `FC Boğaziçi` (è anche il nome di
  un'università), `FC Lautern`, `FC Edam` (anche il formaggio, nome generico).
- **Aggettivi a una lettera dal nome ufficiale**: `FC Famalicense`, `FC Vizelense`, `FC Arouquense`,
  `FC Portuense`, `FC Brugse`, `FC Groninger`, `FC Annecien` — evitano la sottostringa ma restano vicini.
- Fuori dall'ambito del giro, ma lo segnalo perché l'ho visto passando: i derby `El Clásico`, `Der Klassiker`,
  `Le Classique`, `De Klassieker` (`src/08:283-290`) sono i nomi reali di quelle sfide; «Derbi Madrileño»
  pure. Non li ho valutati.
- Sigle: nessuna coincide con le abbreviazioni ufficiali che conosco, ma non ho una lista ufficiale.

## Per il giro che applicherà: punti del codice

(numeri di riga di `lavoro/197`, da riverificare con `grep -n`; elenco prodotto con `grep -rnF` sui nomi di oggi)

1. **`src/02-club-leghe-albo.jsx`** — le righe `mkT(...)` dei club scelti: nome e sigla.
2. **Record e albo in `src/02`**: `LEAGUE_RECORDS` 346 (FC Stamford), 362 (FC Goldwald), 378 (FC Portomar),
   410 (FC Laguna), 417 (FC Canaries), 418 (FC Foxshire); albo europeo 450, 457, 461 (FC Stamford), 456
   (FC Submarino), 461 (FC Hammers).
3. **Stadi, `src/05`**: `CLUB_STADIUMS` — `bol` «Stadio Felsineo», `ver` «Stadio Scaligero», `avl` «Aston
   Park», `bvb` «Goldwald Stadion», `b04` «Werkstadt Arena», `sal` «Stadio Salernum», `rsoc` solo se si sceglie
   la B; `STADIUM_POOLS` — «Stadio Felsineo» (pool 76) e «Stadio Scaligero Sud» (pool 63). Il commento di
   `src/05:493` cita «FC Brianzolo».
4. **Derby, `src/08:271-290`**: i nomi dei derby non contengono i nomi dei club; il commento di `src/08:295`
   cita «Manchester Rovers» (solo commento, ma va tenuto vero: «il nome ora viene dalle città nei loro nomi»).
5. **Cori, `src/12:~2818`** (`_TOK_CLASS`/esempi «FC Scaligero → SCALIGERO»): i nomi nuovi prendono la classe
   di default; ricontrollare i cori che costruiscono «FIGLI DI …» dal nome.
6. **`CLUB_RENAME_6` / `_renameClub6`, `src/09:1131-1133`**: allargare la mappa con nome di oggi → nome nuovo
   (e per i 16 del 247 la catena già prevista dal 248). Nessun nome nuovo deve essere chiave della mappa.
   ⚠️ `_renameClub6` fa `startsWith(o+" ")`: **`FC Union`** è prefisso di nomi più lunghi solo se nel gioco
   esiste «FC Union …» — oggi no, ma va verificato; e **`FC Clara`**, **`FC Albion`**, **`FC Aston`** sono corti:
   controllare che nessun altro nome salvato inizi con loro seguito da spazio.
7. **Migration dei salvataggi, `src/17:2668`** (blocco «giro 6»): `player.club.n`, `standings[].n`,
   `calendar[].opponentName`, `matchHistory[].opponent`, più `player.history[].club` (usato da `_flagClub`,
   `src/17:1078`) e `player.rival` (citato a `src/17:2830`). Verificare che la sigla salvata
   (`player.club.a`) segua il nome (`src/17:2718`: la classifica salvata è uno snapshot).
8. **`_CR_BRANDS`, `src/09:1115`**: il commento di `src/09:1119` dice che «Porto» non si può bloccare perché
   sottostringa di «FC Portomar»: se `por` cambia, si può aggiungere **«FC Porto»** (e valutare `FC Twente`,
   `FC Utrecht`… se il PO decide la 1\*). I nomi nuovi non vanno in lista.
9. **`Torino Athletic` fuori da `src/02`**: `src/19:88`, `src/19:186` (club di prova `tat`), `src/19:1216`;
   commenti `src/01:156`, `src/11:211`, `src/13:1290`, `src/16:1430`, `src/18:7960`. Altri commenti: `src/03:307`
   (FC Calabro), `src/11:1748` (FC Sociedad), `src/15:11330` (FC Leonessa), `src/17:2718` (FC Hornets).
10. **Test e fixture con i nomi di oggi** (aggiornare dove il test legge i dati veri del gioco; dove il nome è
    un dato inventato dentro la sonda può restare): `sigle-203.mjs` (FC Wolfstadt), `classifica-94.mjs`,
    `nomi-182.mjs` (FC Kaiserslautern), `albo-122.mjs` (FC Utrecht), `retire-announce-test.mjs`,
    `momento-194.mjs`, `leggibile-68.mjs`, `scelte-201.mjs`, `terza-volta.mjs`, `stat-279*.mjs`, e la lunga lista
    di sonde che usano `FC Werkstadt` come club dell'eroe (`trainer-288`, `meta-conto-265`, `career-sim-test`,
    `stagione-154`, `investimento-223`, `analisi-217`, `po224-home-census`, `svincolato-264`, `simulata-272`,
    `agent-lifecycle-test`…); `lib/banco-g0.mjs`; fixture `save-190-s12-ovr93.json`, `save-c177-s5w20.json`,
    `save-c177-s1w15.json`, `save-194-*.json`, `save-195-primavera-w39.json` (utili come **prova della
    migration**: devono uscirne senza nomi vecchi); `tests/codex/carriere-fase1-*.json`. L'elenco completo per
    nome si rigenera con `grep -rnF "<nome>" src tests tools`.

## Per il giro che applicherà: controlli da eseguire

Dopo `node tools/build-src.mjs` e `node tools/check-src.mjs` (IDENTICO BYTE PER BYTE), uno alla volta
(`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m` e `df -h` prima), dalla cartella `tests/visual`:

- `python3 tools/sonde/proposta-nomi-250.py` (dalla radice) rigirato sui nomi scelti, con le scelte del PO al
  posto delle coppie A/B — deve restare VERDE;
- `npm run nomi-190` · `npm run cronaca-nomi-190` · `npm run sigle-203`;
- `node tools/audit-copyright.mjs` (dalla radice) — **0 hit**; prova del rosso: reinserire a mano un nome
  bloccato e vedere uscita ≠0;
- `npm run test:logic` · `npm run save-compat`;
- la MAPPA mirata di `ci-runner.mjs` per i file `src` toccati (`node ci-runner.mjs mirata lavoro/197` per
  vederli);
- una sonda della migration su almeno `fixtures/save-190-s12-ovr93.json` (Premier: Hammers, Stamford, Swans…) e
  `fixtures/save-195-primavera-w39.json` (Lega B con « Primavera»): nomi vecchi → 0, seconda applicazione senza
  modifiche (come `probe-rename6.mjs` del giro 6);
- i guardiani che leggono i record/albo/cori se ce ne sono nella mappa (`classifica-94`, `albo-122`).

## Dubbi per la madre (non decisi)

- Se la classe 1\* (nomi ufficiali già per città) rientra nella richiesta del PO.
- Il doppione `alm`/`alm2` (due Almería).
- Se i casi al limite della classe 1 vanno anche loro in questionario.
- Le note «da verificare» (zone degli stadi di Juventus, Leicester, Bochum, Leverkusen, Boavista, Brescia,
  Swansea, Burnley): le ho dalla memoria.
