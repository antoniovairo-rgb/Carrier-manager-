/* ========================================================================
 * KORWARD ELITE — frammento n° 02  (dei 20, numerati da 00 a 19)
 * src/02-club-leghe-albo.jsx
 *
 * CLUB · LEGHE · ALBO D’ORO
 *
 * Il catalogo CLUBS (tutte le squadre di tutte le leghe), le derivate U18_CLUBS /
 * U18_CLUBS_P2 / ALL_U18_CLUBS, LEAGUE_PAIRS, LEAGUE_RECORDS, le sigle e i vincitori
 * delle coppe europee, CLUB_FOUNDED e le utility di mercato collegate.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 740-1325   ·   586 righe di 41427
 * La prima riga dopo questa intestazione è la riga 740 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 716 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
const CLUBS=[
  // -- ITALIA Lega A --
  mkT("juve","Torino Athletic","TAT",95,"#f5f5f5","#0f0f0f","🇮🇹","Lega A"),
  mkT("inter","FC Nerazzurri","NRZ",92,"#1d4ed8","#0f0f0f","🇮🇹","Lega A"),
  mkT("milan","AC Rossoneri","ACR",90,"#dc2626","#0f0f0f","🇮🇹","Lega A"),
  mkT("napoli","FC Partenope","PRT",88,"#38bdf8","#ffffff","🇮🇹","Lega A"),
  mkT("roma","FC Capitale","CAP",84,"#b91c1c","#f59e0b","🇮🇹","Lega A"),
  mkT("lazio","FC Biancoceleste","BIA",80,"#93c5fd","#ffffff","🇮🇹","Lega A"),
  mkT("ata","FC Bergamo","BRG",82,"#1d4ed8","#0f0f0f","🇮🇹","Lega A"),
  mkT("fio","FC Viola","VIO",77,"#7c3aed","#f5f5f5","🇮🇹","Lega A"),
  mkT("tor","FC Granata","GRA",70,"#6c1f2e","#f5f5f5","🇮🇹","Lega A"),
  mkT("bol","FC Felsineo","FEL",72,"#dc2626","#1d4ed8","🇮🇹","Lega A"),
  mkT("udi","FC Friulano","FRI",65,"#f5f5f5","#0f0f0f","🇮🇹","Lega A"),
  mkT("sas","FC Neroverde","NER",68,"#15803d","#0f0f0f","🇮🇹","Lega A"),
  mkT("cag","FC Sardo","SAR",65,"#dc2626","#1d4ed8","🇮🇹","Lega A"),
  mkT("sam","FC Blucerchiati","BLU",67,"#1d4ed8","#dc2626","🇮🇹","Lega A"),
  mkT("gen","FC Genova","GEN",66,"#dc2626","#1d4ed8","🇮🇹","Lega A"),
  mkT("ver","FC Scaligero","SCA",67,"#f59e0b","#1d4ed8","🇮🇹","Lega A"),
  mkT("mon2","FC Brianzolo","BRI",64,"#dc2626","#f5f5f5","🇮🇹","Lega A"),
  mkT("lec","FC Salento","SLN",62,"#f5c518","#dc2626","🇮🇹","Lega A"),
  // -- ENGLAND Premier Division --
  mkT("mcy","FC Manchester","MCH",98,"#93c5fd","#1a1a2e","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("liv","FC Merseyside","MER",96,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("ars","FC Islington","ISL",91,"#dc2626","#ffffff","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("che","FC Stamford","STA",90,"#1d4ed8","#ffffff","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("mun","Manchester Rovers","MCR",88,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("tot","FC Haringey","HAR",85,"#f5f5f5","#1e3a8a","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("new","FC Tyneside","TYN",84,"#0f0f0f","#ffffff","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("avl","FC Aston","AST",82,"#6c1f2e","#93c5fd","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("whu","FC Hammers","HAM",78,"#6c1f2e","#93c5fd","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("bha","FC Sussex","SUS",77,"#1d4ed8","#ffffff","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("eve","FC Goodison","GDS",74,"#1d4ed8","#ffffff","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("lei","FC Foxshire","FOX",73,"#1d4ed8","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("wol","FC Wolverhampton","WLV",72,"#f59e0b","#0f0f0f","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("cry","FC Selhurst","SEL",71,"#1d4ed8","#dc2626","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("ful","FC Craven","CRA",70,"#f5f5f5","#0f0f0f","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("bre","FC Griffin","GRI",69,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("nfo","FC Nottingham","NOT",68,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  mkT("bou","FC Dorset","DOR",67,"#dc2626","#0f0f0f","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Premier Division"),
  // -- SPAIN Primera División --
  mkT("rma","CF Madrid","CFM",99,"#f5f5f5","#f59e0b","🇪🇸","Liga Ibérica"),
  mkT("bar","FC Catalunya","CAT",97,"#1d4ed8","#dc2626","🇪🇸","Liga Ibérica"),
  mkT("atm","AT Manzanares","ATM",92,"#dc2626","#f5f5f5","🇪🇸","Liga Ibérica"),
  mkT("sev","FC Hispalense","HIS",84,"#f5f5f5","#dc2626","🇪🇸","Liga Ibérica"),
  mkT("vill","FC Submarino","SUB",80,"#f59e0b","#1d4ed8","🇪🇸","Liga Ibérica"),
  mkT("rsoc","FC Sociedad","SOC",78,"#1d4ed8","#f5f5f5","🇪🇸","Liga Ibérica"),
  mkT("bet","FC Verdiblanco","VER",76,"#15803d","#f5f5f5","🇪🇸","Liga Ibérica"),
  mkT("val","FC Valenciano","VAL",75,"#f5f5f5","#0f0f0f","🇪🇸","Liga Ibérica"),
  mkT("osa","FC Navarro","NAV",68,"#dc2626","#1d4ed8","🇪🇸","Liga Ibérica"),
  mkT("cel","FC Celeste","CEL",70,"#93c5fd","#ffffff","🇪🇸","Liga Ibérica"),
  mkT("ath","FC Bilbao","BIL",74,"#dc2626","#f5f5f5","🇪🇸","Liga Ibérica"),
  mkT("ray","FC Madrid Este","MAD",66,"#f5f5f5","#dc2626","🇪🇸","Liga Ibérica"),
  mkT("gir","FC Gironí","GIR",72,"#dc2626","#f5f5f5","🇪🇸","Liga Ibérica"),
  mkT("mall","FC Balear","BAL",65,"#dc2626","#0f0f0f","🇪🇸","Liga Ibérica"),
  mkT("get","FC Azulón","AZU",64,"#1d4ed8","#f5f5f5","🇪🇸","Liga Ibérica"),
  mkT("las","FC Canario","CNR",62,"#f59e0b","#1d4ed8","🇪🇸","Liga Ibérica"),
  mkT("alm","FC Indálico","IND",60,"#dc2626","#f5f5f5","🇪🇸","Liga Ibérica"),
  mkT("esp","FC Perico","PER",63,"#1d4ed8","#f5f5f5","🇪🇸","Liga Ibérica"),
  // -- GERMANY 1. Liga --
  mkT("bay","FC München","FCM",99,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("bvb","FC Goldwald","GLW",93,"#f59e0b","#0f0f0f","🇩🇪","Deutsche Liga"),
  mkT("rbl","FC Leipzig","FLZ",88,"#f5f5f5","#dc2626","🇩🇪","Deutsche Liga"),
  mkT("b04","FC Werkstadt","WRK",89,"#dc2626","#0f0f0f","🇩🇪","Deutsche Liga"),
  mkT("bsc","FC Berlin","FBL",80,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("fra","FC Frankfurt","FFT",79,"#0f0f0f","#dc2626","🇩🇪","Deutsche Liga"),
  mkT("fre","FC Friburgo","FRB",76,"#dc2626","#0f0f0f","🇩🇪","Deutsche Liga"),
  mkT("wob","FC Wolfstadt","WOL",75,"#15803d","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("mgb","FC Niederrhein","NIE",74,"#f5f5f5","#0f0f0f","🇩🇪","Deutsche Liga"),
  mkT("stu","FC Stuttgart","STG",76,"#f5f5f5","#dc2626","🇩🇪","Deutsche Liga"),
  mkT("aug","FC Augsburg","AUG",66,"#15803d","#dc2626","🇩🇪","Deutsche Liga"),
  mkT("mai","FC Mainz","MAI",68,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("hof","FC Kraichgau","KRA",70,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("kol","FC Köln","KOL",65,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("wer","FC Weser","WSR",72,"#15803d","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("dsc","FC Lilien","LLN",58,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("boc","FC Ruhrpott","RUH",60,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga"),
  mkT("ber","FC Berlin Nord","BNO",62,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga"),
  // -- FRANCE Ligue Nationale --
  mkT("psg","FC Paris","PRS",97,"#1d4ed8","#dc2626","🇫🇷","Ligue Nationale"),
  mkT("marse","FC Marseille","MSL",85,"#f5f5f5","#38bdf8","🇫🇷","Ligue Nationale"),
  mkT("mon","FC Monaco","MCO",82,"#dc2626","#f5f5f5","🇫🇷","Ligue Nationale"),
  mkT("lyon","FC Lyon","LYO",80,"#f5f5f5","#1d4ed8","🇫🇷","Ligue Nationale"),
  mkT("nice","FC Nizza","NIZ",76,"#dc2626","#0f0f0f","🇫🇷","Ligue Nationale"),
  mkT("lille","FC Lillese","LIL",78,"#dc2626","#f5f5f5","🇫🇷","Ligue Nationale"),
  mkT("ren","FC Rennese","REN",74,"#0f0f0f","#dc2626","🇫🇷","Ligue Nationale"),
  mkT("len","FC Artois","ART",72,"#f59e0b","#dc2626","🇫🇷","Ligue Nationale"),
  mkT("str","FC Strasburgo","STR",68,"#1d4ed8","#f5f5f5","🇫🇷","Ligue Nationale"),
  mkT("nan","FC Nantese","NAN",70,"#f59e0b","#15803d","🇫🇷","Ligue Nationale"),
  mkT("mtp","FC Montpel","MON",67,"#1d4ed8","#f97316","🇫🇷","Ligue Nationale"),
  mkT("rei","FC Remense","REM",66,"#dc2626","#f5f5f5","🇫🇷","Ligue Nationale"),
  mkT("tou","FC Tolosa","TOL",65,"#7c3aed","#f5f5f5","🇫🇷","Ligue Nationale"),
  mkT("lor","FC Morbihan","MOR",63,"#f97316","#0f0f0f","🇫🇷","Ligue Nationale"),
  mkT("bre2","FC Brest","BRT",62,"#dc2626","#f5f5f5","🇫🇷","Ligue Nationale"),
  mkT("cle","FC Clermont","CLE",60,"#dc2626","#1d4ed8","🇫🇷","Ligue Nationale"),
  mkT("hac","FC Le Havre","HAV",58,"#93c5fd","#1e3a8a","🇫🇷","Ligue Nationale"),
  mkT("metz","FC Mosella","MOS",57,"#6c1f2e","#f5f5f5","🇫🇷","Ligue Nationale"),
  // -- PORTUGAL Primeira Liga --
  mkT("ben","FC Lisboa","FLS",88,"#dc2626","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("por","FC Portomar","POR",87,"#1d4ed8","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("spo","FC Leões","LEO",85,"#15803d","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("bra","FC Minhoto","MIN",74,"#dc2626","#ffffff","🇵🇹","Liga Lusitana"),
  mkT("vsc","FC Vimaranense","VIM",68,"#f5f5f5","#0f0f0f","🇵🇹","Liga Lusitana"),
  mkT("rioave","FC Rio Verde","RIO",65,"#15803d","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("bav","FC Panteras","PAN",66,"#0f0f0f","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("estoril","FC Estoril","EST",62,"#f59e0b","#1d4ed8","🇵🇹","Liga Lusitana"),
  mkT("gviz","FC Vicente","VIC",63,"#dc2626","#1d4ed8","🇵🇹","Liga Lusitana"),
  mkT("fama","FC Famalar","FAM",61,"#1d4ed8","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("morei","FC Moreira","MOR",60,"#15803d","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("vize","FC Vizalta","VIZ",58,"#f59e0b","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("chav","FC Chaves","CHA",57,"#f59e0b","#15803d","🇵🇹","Liga Lusitana"),
  mkT("aroca","FC Aroalta","ARO",56,"#f59e0b","#0f0f0f","🇵🇹","Liga Lusitana"),
  mkT("casa","FC Lisboa Ovest","LIS",55,"#1d4ed8","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("scar","FC Clara","CLR",59,"#dc2626","#f5f5f5","🇵🇹","Liga Lusitana"),
  mkT("aves","FC Aves","AVS",54,"#f5f5f5","#0f0f0f","🇵🇹","Liga Lusitana"),
  mkT("farense","FC Farense","FAR",53,"#f59e0b","#dc2626","🇵🇹","Liga Lusitana"),
  // -- NETHERLANDS Eredivisie --
  mkT("ajax","FC Amsterdam","AMS",88,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("psv","FC Brabantia","BRB",86,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),/* [6.74.0 QA-P0] era "FC Eindhoven" = nome ESATTO di un club professionistico reale (id stabile → save-safe) */
  mkT("feye","FC Rotterdam","RTD",82,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("az","FC Alkmaar","ALK",78,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("utr","FC Utrecht","UTR",72,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("twe","FC Twente","TWE",74,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("vita","FC Arnhem","ARN",70,"#f59e0b","#0f0f0f","🇳🇱","Liga Oranje"),
  mkT("gron","FC Groningen","GRO",65,"#15803d","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("heer","FC Heerenveen","HEE",66,"#1d4ed8","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("wil","FC Tilburg","TIL",62,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("nec","FC Nijmegen","NIJ",64,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("her","FC Almelo","ALM",63,"#0f0f0f","#dc2626","🇳🇱","Liga Oranje"),
  mkT("gor","FC Deventer","DEV",60,"#f59e0b","#dc2626","🇳🇱","Liga Oranje"),
  mkT("spa","FC Havenstad","HVN",61,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("exc","FC Oostzijde","OOS",58,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  mkT("cam","FC Leeuwarden","LWR",57,"#f59e0b","#1d4ed8","🇳🇱","Liga Oranje"),
  mkT("volen","FC Volendam","VOL",55,"#f59e0b","#dc2626","🇳🇱","Liga Oranje"),
  mkT("emm","FC Emmen","EMM",54,"#dc2626","#f5f5f5","🇳🇱","Liga Oranje"),
  // -- BELGIO Pro League --
  mkT("club","FC Fiandria","FIA",80,"#1d4ed8","#0f0f0f","🇧🇪","Liga Belga"),/* [6.74.0 QA-P0] era "FC Bruges" (nome corrente FR del club reale) */
  mkT("and","FC Bruxella","BRX",78,"#7c3aed","#f5f5f5","🇧🇪","Liga Belga"),/* [6.74.0 QA-P0] era "FC Anderlecht" */
  mkT("genk","FC Genk","GNK",74,"#1d4ed8","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("gent","FC Gent","GNT",72,"#1d4ed8","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("std","FC Vallonia","VLA",70,"#dc2626","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("usj","FC Union","UNI",73,"#f59e0b","#1d4ed8","🇧🇪","Liga Belga"),
  mkT("ant","FC Antwerp","ANT",71,"#dc2626","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("krc","FC Westflandria","CER",66,"#15803d","#0f0f0f","🇧🇪","Liga Belga"),
  mkT("ohl","FC Leuven","LEU",65,"#dc2626","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("cha","FC Charleroi","CHR",64,"#0f0f0f","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("mec","FC Mechelen","MEC",63,"#f59e0b","#dc2626","🇧🇪","Liga Belga"),
  mkT("kor","FC Kortrijk","KOR",62,"#dc2626","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("stu2","FC Truiden","TRU",60,"#f59e0b","#1d4ed8","🇧🇪","Liga Belga"),
  mkT("wes","FC Westerlo","WES",59,"#f59e0b","#1d4ed8","🇧🇪","Liga Belga"),
  mkT("ser","FC Seraing","SER",55,"#dc2626","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("zul","FC Waregem","WAR",57,"#1d4ed8","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("bch","FC Anversa Sud","ANV",56,"#7c3aed","#f5f5f5","🇧🇪","Liga Belga"),
  mkT("eup","FC Eupen","EUP",54,"#f59e0b","#0f0f0f","🇧🇪","Liga Belga"),
  // -- TURCHIA Süper Lig --
  mkT("gal","FC Istanbul","FST",82,"#f59e0b","#dc2626","🇹🇷","Liga Anatolica"),
  mkT("fenk","FC Kadıköy","FKD",80,"#f59e0b","#1d4ed8","🇹🇷","Liga Anatolica"),
  mkT("bes","FC Kartal","KAR",78,"#0f0f0f","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("tra","FC Trabzon","TRA",72,"#6c1f2e","#38bdf8","🇹🇷","Liga Anatolica"),
  mkT("bas","FC Bosforo","BOS",70,"#f97316","#1e293b","🇹🇷","Liga Anatolica"),
  mkT("ada","FC Adana","ADA",66,"#1d4ed8","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("siv","FC Sivas","SIV",65,"#dc2626","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("kas","FC Kasimpasa","KAS",64,"#1d4ed8","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("ank","FC Ankara","ANK",62,"#f59e0b","#0f0f0f","🇹🇷","Liga Anatolica"),
  mkT("ant2","FC Antalya","ANA",63,"#dc2626","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("kon","FC Konya","KON",61,"#15803d","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("kay","FC Kayseri","KAY",60,"#dc2626","#f59e0b","🇹🇷","Liga Anatolica"),
  mkT("hat","FC Hatay","HAT",59,"#6c1f2e","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("riz","FC Rize","RIZ",58,"#15803d","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("ala","FC Alanya","ALA",62,"#f97316","#15803d","🇹🇷","Liga Anatolica"),
  mkT("kag","FC Fatih","FAT",61,"#dc2626","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("pen","FC Pendik","PEN",56,"#1d4ed8","#f5f5f5","🇹🇷","Liga Anatolica"),
  mkT("sam2","FC Samsun","SAM",57,"#dc2626","#f5f5f5","🇹🇷","Liga Anatolica"),
  // -- ITALIA Lega B (18 squadre) --
  mkT("par","FC Parmense","PAR",52,"#f59e0b","#1d4ed8","🇮🇹","Lega B"),
  mkT("cre","FC Cremona","CRE",48,"#dc2626","#9ca3af","🇮🇹","Lega B"),
  mkT("mod","FC Modenese","MOD",47,"#f59e0b","#1d4ed8","🇮🇹","Lega B"),
  mkT("pal","FC Sicania","SIC",50,"#f472b6","#0f0f0f","🇮🇹","Lega B"),
  mkT("cat","FC Calabro","CLB",44,"#f59e0b","#dc2626","🇮🇹","Lega B"),
  mkT("spe","FC Spezzino","SPE",49,"#f5f5f5","#0f0f0f","🇮🇹","Lega B"),
  mkT("bar2","FC Pugliese","PUG",49,"#f5f5f5","#dc2626","🇮🇹","Lega B"),
  mkT("ven","FC Laguna","LAG",51,"#0f0f0f","#f97316","🇮🇹","Lega B"),
  mkT("pis","FC Pisano","PIS",45,"#0f0f0f","#38bdf8","🇮🇹","Lega B"),
  mkT("fro","FC Ciociaro","CIO",47,"#f59e0b","#1d4ed8","🇮🇹","Lega B"),
  mkT("ces","FC Cesenate","CES",43,"#f5f5f5","#0f0f0f","🇮🇹","Lega B"),
  mkT("samp","FC Empolese","EMP",53,"#1e6fd0","#ffffff","🇮🇹","Lega B"),/* [7.8.2] era «FC Doria» = DUPLICATO di Sampdoria (sam=Blucerchiati): Doria e blucerchiati sono lo STESSO club → rinominato Empoli (azzurro), club reale non rappresentato. id stabile (save-safe via _syncClub70). */
  mkT("sal","FC Salernum","SAL",45,"#6c1f2e","#f5f5f5","🇮🇹","Lega B"),
  mkT("cit","FC Cittadino","CIT",42,"#6c1f2e","#f5f5f5","🇮🇹","Lega B"),
  mkT("sdt","FC Altoadige","ALT",40,"#f5f5f5","#dc2626","🇮🇹","Lega B"),
  mkT("cos","FC Bruzio","BRU",38,"#dc2626","#1d4ed8","🇮🇹","Lega B"),
  mkT("bres","FC Leonessa","LNS",50,"#60a5fa","#f5f5f5","🇮🇹","Lega B"),
  mkT("lec2","FC Lariano","LAR",38,"#60a5fa","#1d4ed8","🇮🇹","Lega B"),
  // -- ENGLAND Championship (18 squadre) --
  mkT("lut","FC Luton","LUT",51,"#f97316","#1e3a8a","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("mid","FC Teesside","TES",49,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("cov","FC Coventry","COV",50,"#93c5fd","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("swn","FC Swans","SWA",48,"#f5f5f5","#0f0f0f","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("shu","FC Steelers","STE",53,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("ips","FC Ipswich","IPS",52,"#1d4ed8","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("lee","FC Leeds","LEE",56,"#f5f5f5","#f59e0b","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("bur","FC Clarets","CLA",54,"#6c1f2e","#93c5fd","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("nor","FC Canaries","CAN",52,"#f59e0b","#15803d","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("wba","FC Albion","ALB",53,"#1d4ed8","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("bri","FC Bristol","BRS",48,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("milw","FC Dockers","DOC",47,"#1d4ed8","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("bla","FC Blackburn","BBR",50,"#1d4ed8","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("pre","FC Preston","PRE",46,"#f5f5f5","#1d4ed8","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("car","FC Bluebirds","BLB",49,"#1d4ed8","#dc2626","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("wat","FC Hornets","HOR",51,"#f59e0b","#0f0f0f","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("sto","FC Potters","POT",50,"#dc2626","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  mkT("qpr","FC Queensway","QUE",47,"#93c5fd","#f5f5f5","🏴󠁧󠁢󠁥󠁮󠁧󠁿","Championship"),
  // -- GERMANY 2. Liga (18 squadre) --
  mkT("hbu","FC Hamburg","HMB",54,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("han","FC Hannover","HAN",50,"#15803d","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("nub","FC Nürnberg","FCN",48,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("kar","FC Karlsruhe","KRL",44,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("kil","FC Kiel","KIE",46,"#1d4ed8","#dc2626","🇩🇪","Deutsche Liga 2"),
  mkT("kaa","FC Kaiserslautern","FCK",47,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("duf","FC Düsseldorf","FDF",51,"#dc2626","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("fur","FC Fürth","FUR",46,"#15803d","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("s04","FC Gelsenkirchen","FGK",55,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("mag","FC Magdeburg","MGB",44,"#1d4ed8","#f59e0b","🇩🇪","Deutsche Liga 2"),
  mkT("pad","FC Paderborn","PAD",42,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("ros","FC Rostock","ROS",43,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("brn","FC Braunschweig","BRA",39,"#f59e0b","#1d4ed8","🇩🇪","Deutsche Liga 2"),
  mkT("sar","FC Saarbrücken","FCS",41,"#1d4ed8","#0f0f0f","🇩🇪","Deutsche Liga 2"),
  mkT("dre","FC Dresden","DRE",44,"#f59e0b","#0f0f0f","🇩🇪","Deutsche Liga 2"),
  mkT("stp","FC Sankt Hafen","SAN",52,"#7c2d12","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("osn","FC Osnabrück","OSN",38,"#7c3aed","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  mkT("arm","FC Bielefeld","BIE",49,"#1d4ed8","#f5f5f5","🇩🇪","Deutsche Liga 2"),
  // -- FRANCE Ligue Nationale 2 (18 squadre) --
  mkT("gre","FC Grenoble","GRE",40,"#1d4ed8","#f5f5f5","🇫🇷","Ligue Nationale 2"),
  mkT("nic2","FC Niort","NIO",38,"#f5f5f5","#0f0f0f","🇫🇷","Ligue Nationale 2"),
  mkT("val2","FC Valencien","VAL",42,"#dc2626","#f5f5f5","🇫🇷","Ligue Nationale 2"),
  mkT("pau","FC Pau","PAU",37,"#1d4ed8","#f59e0b","🇫🇷","Ligue Nationale 2"),
  mkT("cae","FC Caen","CAE",51,"#dc2626","#1d4ed8","🇫🇷","Ligue Nationale 2"),
  mkT("lav","FC Laval","LAV",42,"#f97316","#0f0f0f","🇫🇷","Ligue Nationale 2"),
  mkT("ann","FC Annecy","ANN",43,"#dc2626","#f59e0b","🇫🇷","Ligue Nationale 2"),
  mkT("tro","FC Troyes","TRO",48,"#1d4ed8","#f5f5f5","🇫🇷","Ligue Nationale 2"),
  mkT("ami","FC Amiens","AMI",47,"#f5f5f5","#0f0f0f","🇫🇷","Ligue Nationale 2"),
  mkT("dun","FC Dunkerque","DUN",38,"#1d4ed8","#f5f5f5","🇫🇷","Ligue Nationale 2"),
  mkT("gui","FC Guingamp","GUI",49,"#dc2626","#0f0f0f","🇫🇷","Ligue Nationale 2"),
  mkT("rod","FC Rodez","ROD",40,"#dc2626","#f59e0b","🇫🇷","Ligue Nationale 2"),
  mkT("aja2","FC Ajaccio","AJA",44,"#dc2626","#f5f5f5","🇫🇷","Ligue Nationale 2"),
  mkT("bas2","FC Bastia","BAS",45,"#1d4ed8","#f5f5f5","🇫🇷","Ligue Nationale 2"),
  mkT("soch","FC Doubs","FCD",46,"#f59e0b","#1d4ed8","🇫🇷","Ligue Nationale 2"),/* [6.74.0 QA-P0] era "FC Sochaux" (nome comune del club reale) */
  mkT("aux","FC Auxerre","AUX",51,"#f5f5f5","#1d4ed8","🇫🇷","Ligue Nationale 2"),
  mkT("que","FC Rouen","ROU",35,"#dc2626","#f5f5f5","🇫🇷","Ligue Nationale 2"),
  mkT("con2","FC Concarneau","CON",37,"#f5f5f5","#1d4ed8","🇫🇷","Ligue Nationale 2"),
  // -- SPAIN Segunda División (18 squadre) --
  mkT("dep","FC Coruñés","COR",48,"#1d4ed8","#f5f5f5","🇪🇸","Liga Ibérica 2"),
  mkT("real2","FC Cántabro","CNT",46,"#f5f5f5","#15803d","🇪🇸","Liga Ibérica 2"),
  mkT("lev","FC Granota","GRN",50,"#6c1f2e","#1d4ed8","🇪🇸","Liga Ibérica 2"),
  mkT("tene","FC Tinerfeño","TIN",47,"#1d4ed8","#f5f5f5","🇪🇸","Liga Ibérica 2"),
  mkT("vld","FC Pucela","PUC",52,"#7c3aed","#f5f5f5","🇪🇸","Liga Ibérica 2"),
  mkT("hue","FC Oscense","OSC",47,"#1d4ed8","#dc2626","🇪🇸","Liga Ibérica 2"),
  mkT("bur2","FC Burgalés","BUR",44,"#f5f5f5","#0f0f0f","🇪🇸","Liga Ibérica 2"),
  mkT("zgz","FC Maño","MAO",53,"#f5f5f5","#1d4ed8","🇪🇸","Liga Ibérica 2"),
  mkT("mir","FC Mirandés","MIR",42,"#dc2626","#0f0f0f","🇪🇸","Liga Ibérica 2"),
  mkT("alb","FC Manchego","MNC",43,"#f5f5f5","#1d4ed8","🇪🇸","Liga Ibérica 2"),
  mkT("elx","FC Ilicitano","ILI",49,"#f5f5f5","#15803d","🇪🇸","Liga Ibérica 2"),
  mkT("mal","FC Malacitano","MAL",48,"#1d4ed8","#f5f5f5","🇪🇸","Liga Ibérica 2"),
  mkT("snd","FC Gijonés","GIJ",50,"#dc2626","#f5f5f5","🇪🇸","Liga Ibérica 2"),
  mkT("ovi","FC Carbayón","CAR",46,"#1d4ed8","#f5f5f5","🇪🇸","Liga Ibérica 2"),
  mkT("cad","FC Gaditano","GAD",51,"#f59e0b","#1d4ed8","🇪🇸","Liga Ibérica 2"),
  mkT("alm2","FC Almeriense","ALE",50,"#dc2626","#f5f5f5","🇪🇸","Liga Ibérica 2"),
  mkT("cor2","FC Califal","CAL",41,"#f5f5f5","#15803d","🇪🇸","Liga Ibérica 2"),
  mkT("fer","FC Ferrolano","FER",38,"#15803d","#f5f5f5","🇪🇸","Liga Ibérica 2"),
];
// (b04 prestige set inline above)

// Primavera 1 — tutte le 18 squadre di Lega A
const U18_CLUBS = CLUBS.filter(c=>c.lg==="Lega A").sort((a,b)=>b.p-a.p).map(c=>({
  ...c, n:`${c.n} Primavera`, isU18:true, p:Math.max(30,Math.min(80,c.p-12)), lg:"Primavera 1",
}));
// Primavera 2 — tutte le 18 squadre di Lega B
const U18_CLUBS_P2 = CLUBS.filter(c=>c.lg==="Lega B").sort((a,b)=>b.p-a.p).map(c=>({
  ...c, n:`${c.n} Primavera`, isU18:true, p:Math.max(20,Math.min(65,c.p-15)), lg:"Primavera 2",
}));
// Pool completo U18 per la schermata offerte
const ALL_U18_CLUBS = [...U18_CLUBS, ...U18_CLUBS_P2];

// Sprint 84: Paired leagues for promotion/relegation [upper, lower]
const LEAGUE_PAIRS=[["Lega A","Lega B"],["Premier Division","Championship"],["Deutsche Liga","Deutsche Liga 2"],["Ligue Nationale","Ligue Nationale 2"],["Liga Ibérica","Liga Ibérica 2"]];

// ===== LEAGUE_RECORDS — Sprint 49: fictional all-time data per league =====
const LEAGUE_RECORDS={
  // [5.96.0 DB-3] Deutsche Liga 2 / Ligue Nationale 2 / Liga Ibérica 2: prima cadevano sul
  //   fallback _LR_DEFAULT coi nomi ITALIANI (capocannoniere "Giovanni Caruso" in Germania…).
  "Deutsche Liga 2":{
    allTimeScorer:{name:"Horst Brandner",goals:214,club:"FC Hamburg",era:"1988–2004"},
    seasonRecord:{name:"Lukas Steinbach",goals:31,club:"FC Braunschweig",season:"2009-10"},
    topScorers:[
      {name:"Horst Brandner",goals:214},{name:"Uwe Lindemann",goals:188},
      {name:"Dieter Falkner",goals:171},{name:"Jonas Krebs",goals:156},{name:"Rainer Vogler",goals:149},
    ]
  },
  "Ligue Nationale 2":{
    allTimeScorer:{name:"Pascal Aubertin",goals:201,club:"FC Doubs",era:"1991–2007"},/* [6.74.0 QA-P0] */
    seasonRecord:{name:"Rémi Chastel",goals:29,club:"FC Tolone",season:"2015-16"},
    topScorers:[
      {name:"Pascal Aubertin",goals:201},{name:"Thierry Malard",goals:184},
      {name:"Olivier Ravel",goals:169},{name:"Julien Cordier",goals:151},{name:"Marc Feuillat",goals:140},
    ]
  },
  "Liga Ibérica 2":{
    allTimeScorer:{name:"Andrés Cobeña",goals:208,club:"FC Perico",era:"1990–2006"},
    seasonRecord:{name:"Iker Zubiaga",goals:30,club:"FC Celeste",season:"2012-13"},
    topScorers:[
      {name:"Andrés Cobeña",goals:208},{name:"Manolo Ledesmar",goals:182},
      {name:"PacoLedesma",goals:167},{name:"Xavi Morante",goals:150},{name:"Sergio Peñalver",goals:143},
    ]
  },
  "Lega A":{
    allTimeScorer:{name:"Silvio Calabretti",goals:325,club:"FC Capitale",era:"1974–1994"},
    seasonRecord:{name:"Roberto Macina",goals:38,club:"FC Partenope",season:"1987-88"},
    topScorers:[
      {name:"Silvio Calabretti",goals:325},{name:"Franco Melotti",goals:281},
      {name:"Dario Ferrucci",goals:248},{name:"Lorenzo Bianchi",goals:204},{name:"Marco Sabetti",goals:179},
    ]
  },
  "Premier Division":{
    allTimeScorer:{name:"Alan Fothergill",goals:292,club:"FC Manchester",era:"1992–2014"},
    seasonRecord:{name:"Jamie Perkins",goals:41,club:"FC Stamford",season:"2011-12"},
    topScorers:[
      {name:"Alan Fothergill",goals:292},{name:"Wayne Dobbins",goals:254},
      {name:"Frank Mclaren",goals:219},{name:"Terry Blackwood",goals:187},{name:"Steve Hodgson",goals:162},
    ]
  },
  "Liga Ibérica":{
    allTimeScorer:{name:"Raúl Bengoechea",goals:351,club:"CF Madrid",era:"1994–2015"},
    seasonRecord:{name:"Carlos Villanueva",goals:43,club:"FC Valenciano",season:"2011-12"},
    topScorers:[
      {name:"Raúl Bengoechea",goals:351},{name:"Carlos Villanueva",goals:302},
      {name:"Xavi Ballesteros",goals:247},{name:"Pedro Álvarez",goals:208},{name:"Diego Montiel",goals:174},
    ]
  },
  "Deutsche Liga":{
    allTimeScorer:{name:"Klaus Schreiber",goals:307,club:"FC München",era:"1975–1995"},
    seasonRecord:{name:"Dieter Krüger",goals:40,club:"FC Goldwald",season:"1999-00"},
    topScorers:[
      {name:"Klaus Schreiber",goals:307},{name:"Dieter Krüger",goals:268},
      {name:"Hans Mühlbauer",goals:231},{name:"Otto Bernhard",goals:195},{name:"Rudi Fassbender",goals:163},
    ]
  },
  "Ligue Nationale":{
    allTimeScorer:{name:"Pierre Delacroix",goals:274,club:"FC Paris",era:"1980–2002"},
    seasonRecord:{name:"Alain Mercier",goals:37,club:"FC Marseille",season:"1972-73"},
    topScorers:[
      {name:"Pierre Delacroix",goals:274},{name:"Jacques Fontaine",goals:238},
      {name:"Alain Mercier",goals:211},{name:"René Dubois",goals:183},{name:"Michel Garnier",goals:152},
    ]
  },
  "Liga Lusitana":{
    allTimeScorer:{name:"Rui Vilarinho",goals:289,club:"FC Lisboa",era:"1982–2003"},
    seasonRecord:{name:"João Figueiredo",goals:37,club:"FC Portomar",season:"1985-86"},/* [6.74.0 QA-P0] il club era già de-brandizzato in DB (764) ma il record era sfuggito */
    topScorers:[
      {name:"Rui Vilarinho",goals:289},{name:"Pedro Carvalho",goals:251},
      {name:"Manuel Salgado",goals:214},{name:"Carlos Rebelo",goals:181},{name:"Nuno Faria",goals:149},
    ]
  },
  "Liga Oranje":{
    allTimeScorer:{name:"Johan Bakker",goals:271,club:"FC Amsterdam",era:"1966–1985"},
    seasonRecord:{name:"Pieter de Groot",goals:35,club:"FC Brabantia",season:"1983-84"},/* [6.74.0 QA-P0] */
    topScorers:[
      {name:"Johan Bakker",goals:271},{name:"Pieter de Groot",goals:243},
      {name:"Frans Hoekstra",goals:204},{name:"Kees Westerhof",goals:176},{name:"Nico Vermeulen",goals:141},
    ]
  },
  "Liga Belga":{
    allTimeScorer:{name:"Marc Vandenberghe",goals:241,club:"FC Bruxella",era:"1985–2005"},/* [6.74.0 QA-P0] */
    seasonRecord:{name:"Luc Desmet",goals:32,club:"FC Fiandria",season:"1990-91"},/* [6.74.0 QA-P0] */
    topScorers:[
      {name:"Marc Vandenberghe",goals:241},{name:"Luc Desmet",goals:208},
      {name:"Koen Martens",goals:174},{name:"Didier Lemaire",goals:146},{name:"Pascal Dewaele",goals:121},
    ]
  },
  "Liga Anatolica":{
    allTimeScorer:{name:"Serkan Yılmaz",goals:258,club:"FC Istanbul",era:"1994–2014"},
    seasonRecord:{name:"Murat Demir",goals:34,club:"FC Kadıköy",season:"2006-07"},
    topScorers:[
      {name:"Serkan Yılmaz",goals:258},{name:"Murat Demir",goals:223},
      {name:"Hakan Çelik",goals:191},{name:"Ali Kaya",goals:162},{name:"Emre Şahin",goals:134},
    ]
  },
  "Lega B":{
    allTimeScorer:{name:"Adriano Valli",goals:178,club:"FC Parmense",era:"1984–2002"},
    seasonRecord:{name:"Marco Trevisan",goals:29,club:"FC Laguna",season:"2005-06"},
    topScorers:[
      {name:"Adriano Valli",goals:178},{name:"Roberto Cestaro",goals:149},
      {name:"Franco Gargiulo",goals:121},{name:"Luca Meneghetti",goals:95},{name:"Dario Osti",goals:78},
    ]
  },
  "Championship":{
    allTimeScorer:{name:"Dean Whitfield",goals:163,club:"FC Canaries",era:"1988–2006"},
    seasonRecord:{name:"Billy Horton",goals:34,club:"FC Foxshire",season:"2013-14"},
    topScorers:[
      {name:"Dean Whitfield",goals:163},{name:"Gary Pemberton",goals:141},
      {name:"Billy Horton",goals:119},{name:"Steve Charlton",goals:88},{name:"Tony Bainbridge",goals:72},
    ]
  },
};
const _LR_DEFAULT={
  allTimeScorer:{name:"Giovanni Caruso",goals:194,club:"–",era:"1985–2003"},
  seasonRecord:{name:"Pietro Rossi",goals:28,club:"–",season:"1998-99"},
  topScorers:[
    {name:"Giovanni Caruso",goals:194},{name:"Pietro Rossi",goals:167},
    {name:"Mario Bianchi",goals:141},{name:"Luigi Verdi",goals:114},{name:"Francesco Neri",goals:94},
  ]
};

// [6.74.0 QA-P0] Sigle DISPLAY delle coppe europee: le chiavi interne restano UCL/UEL/UECL (save-compat),
// ma l'utente vede solo le sigle di fantasia (le abbreviazioni correnti delle competizioni UEFA reali
// non devono comparire in UI — audit copyright). Nomi estesi già fantasia: Korward Champions/Europa/Conference Cup.
const EURO_SIGLA={UCL:"KCC",UEL:"KEC",UECL:"KCF"};
const euroSig=k=>EURO_SIGLA[k]||k||"";
/* [7.193.0 collaudo PO «non usare acronimi ufficiali delle competizioni (es. UEL)»] le chiavi interne delle coppe
   europee restano UCL/UEL/UECL (save-compat: i trofei già salvati le contengono), ma NESSUN punto della UI deve
   stamparle: compLbl è il filtro DISPLAY unico da applicare ovunque si renderizzi il nome di una competizione
   arrivato dai dati (trofei, timeline, palmarès, premi, notifiche). Converte la chiave nella sigla di fantasia
   (KCC/KEC/KCF) e lascia intatto qualunque altro nome (nomi di lega, «Coppa Nazionale», …). */
const compLbl=x=>{const v=String(x==null?"":x);return EURO_SIGLA[v]||v;};

// Sprint 137: historical continental competition winners
const EURO_COMP_WINNERS={
  UCL:[
    {s:2024,club:"CF Madrid",nat:"🇪🇸"},{s:2023,club:"FC Manchester",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    {s:2022,club:"CF Madrid",nat:"🇪🇸"},{s:2021,club:"FC Stamford",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    {s:2020,club:"FC München",nat:"🇩🇪"},{s:2019,club:"FC Merseyside",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    {s:2018,club:"CF Madrid",nat:"🇪🇸"},
  ],
  UEL:[
    {s:2024,club:"FC Bergamo",nat:"🇮🇹"},{s:2023,club:"FC Hispalense",nat:"🇪🇸"},
    {s:2022,club:"FC Frankfurt",nat:"🇩🇪"},{s:2021,club:"FC Submarino",nat:"🇪🇸"},
    {s:2020,club:"FC Hispalense",nat:"🇪🇸"},{s:2019,club:"FC Stamford",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    {s:2018,club:"AT Manzanares",nat:"🇪🇸"},
  ],
  UECL:[
    {s:2024,club:"FC Stamford",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},{s:2023,club:"FC Hammers",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    {s:2022,club:"FC Capitale",nat:"🇮🇹"},
  ],
};

/* [7.170.0 collaudo PO «i messaggi di esito azione hanno l'icona con sfondo non trasparente»] su Chromium/Android
   il text-shadow delle EMOJI bitmap viene disegnato come RETTANGOLO sfocato (non segue la sagoma del glifo) →
   ogni icona nei badge d'esito (⚽ GOL, 🧤 parata…) appariva dentro un riquadro colorato. EmoText isola le run
   di emoji in uno span SENZA textShadow (leggibilità via drop-shadow filter, che rispetta l'alpha). */
const _EMO_RUN=/(\p{Extended_Pictographic}(?:\p{Extended_Pictographic}|[\u200D\uFE0F\u20E3]|\p{Emoji_Modifier})*)/gu;
function EmoText({children}){
  if(typeof children!=="string")return children;
  let has=false;try{has=/\p{Extended_Pictographic}/u.test(children);}catch(e){}
  if(!has)return children;
  const parts=children.split(_EMO_RUN);
  return parts.map((p,i)=>(i%2===1)?<span key={i} style={{textShadow:"none",filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.55))"}}>{p}</span>:p);
}
/* [7.170.0] cognome per la cronaca: ultimo token del nome, ma i suffissi («Rossi jr» → jr) tengono anche il cognome vero */
/* [7.293.0 #119 collaudo PO «ma chi e' il rivale interno? deve esserci il cognome»] Il «Luca» dello screenshot
   NON era un nome proprio: era «Diego De Luca» TRONCATO. Prendere l'ultimo token spezza i cognomi con particella
   (De Luca · De Santis · De Rosa · Di Mauro · Di Stefano · De la Fuente · Del Rio nei pool ES) e quel che resta
   sembra un nome di battesimo — da cui il dubbio «e' davvero uno della rosa?». Ora la particella resta attaccata.
   Vale per OGNI consumatore del cognome (spogliatoio, cronaca, nome sulla maglia): un solo punto. */
const _SURN_PART=new Set(["de","de'","del","dell'","della","dello","dei","degli","di","da","dal","dalla","dalle","lo","la","li","van","von","der","den","ter","mac","mc","o'","saint","st.","du","le","dos","das","do","al","el","bin","ben"]);
const _surnBG=(n)=>{const t=String(n||"").trim().split(" ").filter(Boolean);let s=t.pop()||"";if(/^(jr|sr|ii|iii|iv)\.?$/i.test(s)&&t.length)s=t.pop()+" "+s;
  while(t.length>1&&_SURN_PART.has(String(t[t.length-1]).toLowerCase()))s=t.pop()+" "+s;/* t.length>1: il PRIMO token e' il nome di battesimo, non si mangia mai */
  return s;};
/* [7.181.0 collaudo PO «anziché NUCLEO 1942 usare l ANNO DI NASCITA del club, es. Salernitana 1919»] anni di
   fondazione degli analoghi reali per i club rappresentati; fallback deterministico plausibile (1897-1929). */
const CLUB_FOUNDED={sal:1919,juve:1897,inter:1908,milan:1899,nap:1926,rom:1927,laz:1900,fio:1926,tor:1906,ata:1907,bol:1909,gen:1893,sam:1946,cag:1920,ven:1907,par:1913,pal:1900,lec:1908,ver:1903,spe:1906,cre:1903,mod:1912,ces:1940,pis:1909,fro:1928,samp:1920,
  rma:1902,bar:1899,atm:1903,sev:1890,val:1919,bet:1907,ath:1898,liv:1892,mun:1878,mcy:1880,che:1905,ars:1886,tot:1882,new:1892,whu:1895,avl:1874,eve:1878,
  bay:1900,bvb:1909,psg:1970,marse:1899,lyon:1950,mon:1924,ben:1904,por:1893,spo:1906,ajax:1900,psv:1913,feye:1908,gal:1905,fenk:1907,bes:1903,tra:1967,and:1908,club:1891};
const clubFoundedYear=(id)=>CLUB_FOUNDED[id]||(1897+(Math.abs(hashStr("fnd|"+String(id||"club")))%33));
function TeamBadge({team,size=40}) {
  /* [7.168.0 collaudo PO «migliora e rendi più moderni gli scudetti/stemmi di tutte le squadre»] REDESIGN:
     - 3 FORME di scudo seedate per club (classico appuntito · francese arrotondato · roundel circolare) → identità;
     - interno PATTERN-AWARE da kitPatternFor (strisce/hoops/metà/sciarpa/fascia/maniche) → lo stemma rispecchia il kit;
     - gradiente verticale + gloss diagonale (look moderno «smaltato») + doppio bordo (scuro fuori, chiaro dentro);
     - sigla con paint-order stroke → leggibile su QUALSIASI pattern, anche a 18px (classifica). API invariata. */
  const c=team?.col||team?.c||"#2563eb", c2=team?.col2||team?.c2||"#fff";
  const ab=(team?.abbr||team?.a||"??").substring(0,3);
  const _uid=React.useId?React.useId().replace(/:/g,""):("tb"+Math.round(size));
  const _id=team?.id||team?.n||"x";
  const _h=(typeof hashStr==="function")?Math.abs(hashStr(_id+"_bdg")):7;
  const shape=_h%3;// 0 classico · 1 francese · 2 roundel
  const pat=(team&&team.id&&typeof kitPatternFor==="function")?(kitPatternFor(team)||"solid"):(team&&team.id&&typeof KIT_PATTERN!=="undefined"&&KIT_PATTERN[team.id])||"solid";
  // luminanza → colori derivati (bordo scuro, testo a contrasto)
  const _hex=(x)=>{const m=/^#?([0-9a-f]{6})/i.exec(String(x));return m?parseInt(m[1],16):0x444444;};
  const _ci=_hex(c),_r=(_ci>>16)&255,_g=(_ci>>8)&255,_b=_ci&255;
  const _lum=(0.299*_r+0.587*_g+0.114*_b)/255;
  const _dk=(f)=>"rgb("+Math.round(_r*f)+","+Math.round(_g*f)+","+Math.round(_b*f)+")";
  const _lt=(f)=>"rgb("+Math.min(255,Math.round(_r+(255-_r)*f))+","+Math.min(255,Math.round(_g+(255-_g)*f))+","+Math.min(255,Math.round(_b+(255-_b)*f))+")";
  /* [7.169.0 collaudo PO «occhio all'effetto scalino tra i due loghi nel prepartita»] le 3 forme sono NORMALIZZATE
     alla stessa banda ottica (x 8–92 · y 4–106): il francese era più stretto (80) e più basso in spalla, il roundel
     più largo di tutti (r49 → 98) → due stemmi affiancati leggevano come sfalsati/di taglia diversa. */
  const SHAPES=[
    "M50 4 L92 16 L92 56 Q92 88 50 106 Q8 88 8 56 L8 16 Z",                      // classico appuntito (riferimento 84×102)
    "M50 4 Q74 4 92 12 L92 58 Q92 90 50 106 Q8 90 8 58 L8 12 Q26 4 50 4 Z",     // francese arrotondato (stessa banda del classico)
    ""                                                                             // roundel (cerchi, raggio bilanciato all'area degli scudi)
  ];
  const d=SHAPES[shape];
  const isRound=shape===2;
  const txtFill=_lum>0.55?"#15181d":"#ffffff";
  const txtStroke=_lum>0.55?"rgba(255,255,255,0.85)":"rgba(10,12,16,0.75)";
  // interno pattern (clip alla forma)
  const patFill=(()=>{const el=[];
    if(pat==="stripes"){for(let i=0;i<3;i++)el.push(<rect key={"s"+i} x={20+i*24} y="0" width="12" height="110" fill={c2} opacity="0.95"/>);}
    else if(pat==="stripesw"){for(let i=0;i<2;i++)el.push(<rect key={"sw"+i} x={22+i*38} y="0" width="18" height="110" fill={c2} opacity="0.95"/>);}/* [7.328.0] strisce larghe (PSG): barre c2 più strette del fondo → colore sociale dominante */
    else if(pat==="hoops"){for(let i=0;i<3;i++)el.push(<rect key={"h"+i} x="0" y={18+i*26} width="100" height="11" fill={c2} opacity="0.95"/>);}
    else if(pat==="halves"||pat==="half"){el.push(<rect key="hf" x="50" y="0" width="50" height="110" fill={c2} opacity="0.95"/>);}/* [7.280.0] il ramo confrontava «half» ma kitPatternFor ritorna «halves»: era CODICE MORTO e i club a metà campo (Feyenoord, Cagliari, Monaco, Montpellier, Blackburn, Galatasaray) avevano lo stemma liscio */
    else if(pat==="vband"){/* [7.280.0] fascia verticale centrale: fondo c2, banda larga col colore sociale */
      el.push(<rect key="vb0" x="0" y="0" width="100" height="110" fill={c2}/>);
      el.push(<rect key="vb1" x="35" y="0" width="30" height="110" fill={c}/>);}
    else if(pat==="sash"){el.push(<polygon key="sa" points="8,10 30,4 92,84 92,106 74,106" fill={c2} opacity="0.95"/>);}
    else if(pat==="band"){el.push(<rect key="b1" x="0" y="44" width="100" height="24" fill="#f4f4f4"/>);el.push(<rect key="b2" x="0" y="44" width="100" height="3.5" fill="#15181d"/>);el.push(<rect key="b3" x="0" y="64.5" width="100" height="3.5" fill="#15181d"/>);el.push(<rect key="b4" x="0" y="51" width="100" height="10" fill={c2}/>);}
    else if(pat==="sleeves"){el.push(<rect key="sl" x="0" y="0" width="100" height="20" fill={c2} opacity="0.95"/>);}
    return el;})();
  return (
    <svg viewBox="0 0 100 110" width={size} height={size*1.1}>
      <defs>
        <linearGradient id={"tbg"+_uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={_lt(0.16)}/><stop offset="0.55" stopColor={c}/><stop offset="1" stopColor={_dk(0.72)}/>
        </linearGradient>
        <linearGradient id={"tbs"+_uid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.34)"/><stop offset="0.45" stopColor="rgba(255,255,255,0.06)"/><stop offset="1" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <clipPath id={"tbc"+_uid}>{isRound?<ellipse cx="50" cy="55" rx="43" ry="48"/>:<path d={d}/>}</clipPath>
      </defs>
      {isRound
        ?(<g>
          {/* [7.169.0 scalino] roundel = ELLISSE leggera: un cerchio non può coprire la banda 4–106 degli scudi senza sfondare in larghezza → rx/ry distinti = stessa altezza ottica affiancato a uno scudo */}
          <ellipse cx="50" cy="55" rx="46" ry="51" fill={_dk(0.45)}/>
          <ellipse cx="50" cy="55" rx="43" ry="48" fill={"url(#tbg"+_uid+")"}/>
          <g clipPath={"url(#tbc"+_uid+")"}>{patFill}<rect x="0" y="0" width="100" height="110" fill={"url(#tbs"+_uid+")"}/></g>
          <ellipse cx="50" cy="55" rx="43" ry="48" fill="none" stroke={c2} strokeWidth="3" opacity="0.9"/>
          <ellipse cx="50" cy="55" rx="37.5" ry="42" fill="none" stroke={_lum>0.55?"rgba(0,0,0,0.25)":"rgba(255,255,255,0.30)"} strokeWidth="1.6"/>
        </g>)
        :(<g>
          <path d={d} fill={_dk(0.45)} transform="translate(0,1.5)"/>
          <path d={d} fill={"url(#tbg"+_uid+")"}/>
          <g clipPath={"url(#tbc"+_uid+")"}>{patFill}<rect x="0" y="0" width="100" height="110" fill={"url(#tbs"+_uid+")"}/></g>
          <path d={d} fill="none" stroke={c2} strokeWidth="4" opacity="0.92"/>
          <path d={d} fill="none" stroke={_lum>0.55?"rgba(0,0,0,0.22)":"rgba(255,255,255,0.28)"} strokeWidth="1.4" transform="translate(0,0) scale(0.93)" transform-origin="50 55"/>
        </g>)}
      <text x="50" y={pat==="band"?"90":"60"} textAnchor="middle" dominantBaseline="central"
        fontSize={ab.length>2?"27":"31"} fontWeight="900" fill={txtFill} stroke={txtStroke} strokeWidth="2.6" paintOrder="stroke"
        fontFamily="'Barlow','Arial Narrow',sans-serif" letterSpacing="0.5">
        {ab}
      </text>
    </svg>
  );
}

/* ========================================
   WEEKLY EVENTS  (req #9)
======================================== */
/* [collaudo PO, screenshot W.33 S.22: «assurdo a poche settimane dal ritiro» — l'agente che vuole
   forzare un trasferimento a stampa] LA FAMIGLIA MERCATO TACE DOPO L'ANNUNCIO DEL RITIRO. Stessa
   regola del 7.438 sul procuratore (niente piu' proposte a chi ha annunciato): voci di mercato,
   agente che «valutera' offerte», flash di cessione e domande «vuoi essere ceduto» contraddicono
   l'addio che il giocatore ha gia' dichiarato — e sporcano la stagione d'addio curata dal 7.433. */
/* [7.471.0 collaudo PO, screenshot wi_procuratore_push a S.3 W.9 con l'eroe appena arrivato all'FC
   Rotterdam: «ma e' davvero l'agente a parlare? e' fuori luogo, l'eroe si e' trasferito poche settimane
   prima»] LA FAMIGLIA MERCATO TACE ANCHE PER CHI E' APPENA ARRIVATO. Il chokepoint del 7.444 guardava
   una sola estremita' della carriera — l'addio annunciato — e lasciava scoperta l'altra: il giocatore
   che ha appena firmato. Sono gli STESSI nove item («l'agente vuole forzare», «valutera' offerte a fine
   stagione», «possibile addio a fine anno», le voci dall'estero, il flash della big, «e' incedibile»,
   le voci che distraggono, il nome in chiave mercato, «vuoi essere ceduto?»): parlano tutti di ANDARSENE,
   e nelle prime settimane in un club nuovo non c'e' niente da cui andarsene — c'e' un giocatore che deve
   ambientarsi. L'anzianita' e' quella gia' usata dal 7.470 per l'impulso di leadership (le stagioni
   chiuse con questo club nella `history`, la stessa misura con cui si diventa bandiera); la scadenza del
   silenzio NON e' un numero inventato ma la finestra di mercato che il gioco gia' dichiara altrove
   (`wi_giornalista_mercato`: settimane 1-5 e 19-23) — si torna a parlare di cessioni quando riapre il
   mercato, cioe' dalla settimana 19. */
/* [7.472.0 collaudo PO «dopo una vittoria con gol e' strano. ma e' davvero l'agente che vuole
   rispondere o pesca da una lista scollegata di impulsi?»] C'E' QUALCOSA DA CRITICARE?
   La domanda del PO ha una risposta esatta e va data per intero: SI', il pescatore estrae a caso dal
   mazzo degli impulsi (`impulseFreshBucket` + `pick`, r.~30379) e l'UNICO filo che lega un impulso alla
   situazione e' la sua `cond`. Cioe' un impulso senza `cond` non e' «scollegato per sbaglio»: e'
   scollegato per costruzione, e su 17 impulsi di categoria «tensione» OTTO non ne avevano nessuna.
   Questo predicato esisteva gia' — parola per parola — dentro `wi_polemica`, scritto nel 7.35.2 per
   una nota del PO IDENTICA a questa («dopo una vittoria con l'Inter e' fuori luogo!»). Era stato messo
   sull'ISTANZA invece che sulla CLASSE, quindi il gemello `wi_opinionista` («un opinionista TV ti
   critica pesantemente») e' rimasto pescabile dopo una vittoria con gol, primo in classifica e morale
   100 — che e' esattamente lo screenshot di oggi. Un rimedio applicato a un esemplare invece che alla
   famiglia si ripresenta col nome del fratello. */
const _criticaOk=(p)=>{try{const l=(p.matchHistory||[]).slice(-1)[0];return !!l&&((l.rating||6.5)<6.1||(!l.won&&!l.drew&&(l.rating||6.5)<6.6));}catch(_e){return false;}};
const _mktFresh=(p)=>{try{if(typeof window!=='undefined'&&window.__CPM_NO471M)return false;/* prova del rosso del guardiano (sezione I di retire-announce): rimette la famiglia mercato in pescata per chi e' appena arrivato */const _cid=p.club&&(p.club.id||p.club.n);if(!_cid)return false;const _st=(p.history||[]).filter(h=>h&&h.clubId===_cid).length;return _st<1&&(p.week||1)<19;}catch(_e){return false;}};
const _mktOk=(p)=>p.retireAnnounced!==(p.season||1)&&!_mktFresh(p);
