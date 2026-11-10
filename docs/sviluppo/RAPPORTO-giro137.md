# Rapporto giro 137 — PO-339 «Guarda la camera» · PO-340 «Tieni insieme club e W.N»

Ramo `sviluppo/giro137-capitano-wn` (da `lavoro/188`, 04a62ae). `GAME_VERSION` non toccata. Nessun campo nuovo nel salvataggio.

## PO-339 — il capitano guarda la camera in `lift` e `fest`
**Misura prima** (testimone `__CPM_G132`, a cui ho aggiunto per ogni compagno l'angolo `cam` fra il davanti del corpo 3D e la camera
vera; corpo CGTrader, 360x800, GLB acceso): col verso del giro 132 il capitano stava a **116° / 126° / 116°** dalla camera
(Nazionale / Coppa / campionato) in `lift`, 111-119° in `fest`.

**Correzione** (`src/12`, una riga): durante `lift` e `fest` il capitano torna al verso di prima del giro 132 (punto camera fisso
già usato negli altri beat). Il verso verso il podio resta solo come rosso `__CPM_NO_G137C`. I compagni dietro non cambiano.

**Dopo:** capitano **1-23° dalla camera** (CGTrader: lift 17-21°, fest 11-23°; regular: lift 10°, fest 1°), ~140-155° dal podio.

**Guardiano `premiazione-132` esteso:** capitano ≤ **40°** dalla camera in `lift` e in `fest` (soglia fissata dopo la misura: verde
1-23°, rosso 107-137°). Il `fest` si giudica dove il beat esiste: la Coppa nazionale si chiude sull'alzata (nessun `fest`). I compagni
restano giudicati ≤ 35° dal podio e le mani ≥ 0,15 m sopra la testa (soglie invariate); il capitano non entra più nel massimo dei
compagni. Capitano assente = non giudicato = rosso. Terzo braccio: `__CPM_NO_G137C` deve cadere sul capitano.

| braccio | CGTrader (int · cup · league) | regular (int) |
|---|---|---|
| verde | ✅ capitano 21°/11° · 19°/— · 19°/14° · compagni max 21° · mani 0,43 | ✅ capitano 10°/1° · compagni 11° · mani 0,21 |
| rosso `__CPM_NO_G132` | cade (compagni 67-88°) | cade (mani −0,35, compagni 104°) |
| rosso `__CPM_NO_G137C` | cade (capitano 113-124° lift, 129-137° fest) | cade (107° / 130°) |

## PO-340 — «<club> W.N» su una riga sola
**Misura prima** (`prossima-131`, `Range.getClientRects` dal nome del club alla cifra della settimana nel sottotitolo del comando):
a 360x800 il gruppo andava a capo in **4 casi Nazionale su 4** (Coppa Nazioni finale e girone, Europeo, amichevole), a 412x915 in **2 su 4**.

**Correzione** (`src/18`): helper unico `poiWN137(club, settimana)` con spazi non separabili (e trattino non separabile) usato dai
quattro sottotitoli «· poi: <club> W.N» (Coppa Nazioni, qualificazioni Euro/Mondiale, fase finale Euro/Mondiale, amichevole). Il
gruppo va a capo intero; il testo letto resta identico (il guardiano tratta NBSP come spazio). Rosso `__CPM_NO_G137W` (spazi normali).

**Guardiano `prossima-131` esteso:** formato 412x915 aggiunto ai predefiniti (ora 360 · 412 · 1440); nei casi Nazionale a 360 e 412 il
gruppo deve stare su una riga; sottotitolo senza «poi: <club> W.N» = non giudicato = rosso. Il rosso 137 deve cadere SOLO su questo controllo.

| braccio | esito |
|---|---|
| verde | ✅ 15 controlli, 0 rossi |
| `__CPM_NO_G131` | cade (9/15, primo caso nc-finale) |
| `__CPM_NO_G133` | cade (3/15, solo amichevole) |
| `__CPM_NO_G134A` | cade (3/15, solo amichevole) |
| `__CPM_NO_G137W` | cade (6/15, solo «<club> W.N» spezzato) |

## Foto — `docs/sviluppo/foto-giro137/` (360x800)
`prima-int-alzata-360x800.png` · `dopo-int-alzata-360x800.png` (GLB acceso, Nazionale a metà alzata: il n° 2 davanti al palco prima
di schiena, dopo verso la camera) · `prima/dopo-prossima-amichevole-360x800.png` · `prima/dopo-prossima-nc-finale-360x800.png`.

## Catena (un controllo alla volta, `CPM_CI_PAR=0`)
| controllo | esito |
|---|---|
| premiazione-132 (cg · regular, un corpo per chiamata) | ✅ verde, cadono `__CPM_NO_G132` e `__CPM_NO_G137C` |
| posa-sollevamento-191 | ✅ verde, il rosso si vede |
| premiazione-palco-191 | ✅ verde, il rosso si vede |
| prossima-131 (360 · 412 · 1440, cinque bracci) | ✅ verde 15/15, i quattro rossi cadono |
| griglia-mobile | ✅ eseguito (65 scatti); «prepartita non misurato» identico a HEAD di partenza; artefatti rigenerati non committati |
| design-system | ✅ SISTEMA GRAFICO OK |
| scena3d-96 tel · pc · tabv · tabo (un formato per chiamata) | ✅ 16/16 · 9/9 · 3/3 · 3/3, 0 errori di pagina |
| validate-situations | ✅ PASS, fingerprint 00001505, 0 failure |
| career-critical (due gruppi: 6 + 5) | ✅ tutti verdi |
| test:logic | ✅ |
| save-compat | ✅ 12 pass · 0 fail |

## Domande aperte per il PO
1. Il capitano guarda il punto-camera fisso usato prima del giro 132 (misurato 1-23° dalla camera vera). Va bene così o lo vuole
   agganciato alla camera che si muove (più preciso, ma è un comportamento nuovo e non «com'era»)?
2. Nel pulsante, a 360 px, «poi:» resta a fine riga e il gruppo «<club> W.N» va intero sulla riga sotto. Preferisce che vada a capo
   anche «poi:» insieme al club?
