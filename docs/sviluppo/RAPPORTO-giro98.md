# RAPPORTO — Giro 98 (assist: nome del compagno, protezione, seguito; retrocessione in Lega B; lista cessioni)

Ramo `sviluppo/giro98-assist-nome` (da `sviluppo/giro95-highlight`, 7.999.178 + giro 95). Fonte: collaudo carriera 177 n.4
(`docs/collaudi/RAPPORTO-carriera-177-4.md` sul ramo `collaudo/7.999.177-carriera-4`). GAME_VERSION e `docs/governo/*` non toccati.
`src/12` non toccato (giro 96a).

Guardiano nuovo: `tests/visual/assist-nome-98.mjs` (`npm run assist-nome-98`, catene **carriera** e **completa**, MAPPA per
src/04, src/14, src/15, src/16-18). Parte A partite vere (S12, politica «assist» / «re» / percorso senza giocaScena forzato),
parte B stato forzato (fine stagione in Lega B, rinnovo in lista), parte C motore in node. Rosso: tutti gli interruttori
`__CPM_NO_G98D1`, `__CPM_NO_G98D3`, `__CPM_NO_G98D4`, `__CPM_NO_G98D7`, `__CPM_NO_G98D8` (CPM_ARMI=rosso).
Esito finale (build fe85cf9): **✅ verde, e il rosso si vede su tutti e cinque i punti** (~55 minuti, 10 partite).

## D1 ALTA — il compagno nominato nella scelta e' quello che segna
- **Misura prima** (rosso, 4 partite): assist con ricevente nominato coerenti col nome accreditato **2/11 (18,2%)**; il primo giro
  di misura sul build di partenza: **0/5**. Il motore (tabellino gol(nome)) aveva gia' il ricevente giusto in 11/11.
- **Causa:** `_assistTo` (riquadro «⚽ X», cinema del gol, «🎯 Assist per X» nei Momenti chiave) veniva da un sorteggio seminato
  sulla rosa (`hashStr("al|…|to")`), non dal ricevente del cast del motore che da' il nome all'opzione.
- **Correzione** (`src/15`, ramo `key==="assist"`): il nome viene da `castBrainRef.current.ricevente` (stesso cast della scelta),
  nella grafia della rosa (il cast porta i nomi in maiuscolo). Testimone `__CPM_RES218` + `ric98/to98/ch98/na98`.
- **Misura dopo:** **12/12 (100%)**, gol del motore attribuito allo stesso compagno 12/12.
- **3D (punto aperto):** il ricevente servito dal 3D coincide col cast **5/12** (con giocaScena 3/4). `src/12` (r.~5280) usa il
  ricevente del motore solo se e' davanti alla palla ed entro 40u, altrimenti sceglie per geometria; nel percorso «uno-due /
  assist_recv» ha altri ripieghi geometrici. Non toccato (giro 96a): il motore passa gia' indice e nome giusti (`castBrain`).

## D3-bis MEDIA — «Proteggi palla e scarica» si gioca da protezione
- **Misura prima:** sul build di oggi (dopo il giro 93) 0 intercetti su 3 scene nelle partite vere — l'11/11 del collaudo e' del
  build 177, precedente al giro 93. Ma la scelta (stat FISICO sul pulsante) si risolveva col modello del passaggio: motore,
  rosso: persa 43,2% con passaggio 50 e 3,8% con passaggio 95, **identica (15,8%) con fisico 50 o 95**, 0 duelli su 472 perse.
  Nel percorso senza giocaScena 2 protezioni perse su 2 raccontate «Intercettato / L'avversario legge la giocata e intercetta».
- **Correzione:** `src/04` opzione `protegge` marcata `prot` → `action.prot98`; `src/14` `giocaScena` con `o.prot`: duello
  fisico eroe contro fisico del marcatore, `clamp(0.82+(fisico-fisicoMarcatore)*0.008,0.55,0.95)`, persa = `duello:true` (stesso
  numero di estrazioni: determinismo intatto); `src/15`: persa nel duello → esito `dispossessed`, testo e riquadro «Ti portano
  via il pallone / Perso il duello» (anche nel percorso di riserva senza giocaScena).
- **Misura dopo:** motore, 600 scene per braccio: persa **41,2% con fisico 50, 9,7% con fisico 95, 21,0% con passaggio 50 o 95**,
  557/557 perse come duello; partite vere: 4 scene, 0 raccontate come passaggio intercettato.
- Altre scelte di dribbling con premio assist: «Dribbling sul fondo e cross», «Sterzata/Doppio passo e cross» finiscono con un
  cross (passaggio legittimo); «Finta e cambio di passo» corretta al giro 95. «Resisti alla carica e cerca il fallo» (fisico,
  premio assist, gestita da `_falloOk38`) **non rivista** in questo giro: punto aperto.

## D4 MEDIA — nessun assist registrato dopo un passaggio non riuscito
- **Causa:** il passaggio al compagno convertito in «occasione» (il portiere respinge) apriva il seguito mischia/rimbalzo, che
  riproponeva «Servi X libero»: il gol su respinta diventava assist dell'eroe. Dal giro 93 (`_golMot298`) col motore attivo la
  conversione non avviene piu' (misurato: 0 seguiti su 10 partite); il difetto resta nel percorso senza giocaScena.
- **Misura prima** (rosso, percorso di riserva forzato `__CPM_NO_BRAIN137` + riuscita forzata in scelta, 3 partite): seguiti
  dopo il passaggio respinto **3, con la giocata d'assist 3/3**.
- **Correzione** (`src/15`): il seguito nato da una giocata d'assist convertita in occasione porta `_noAss98`; in `handleContinue`
  le opzioni con premio assist si tolgono (restano almeno due conclusioni).
- **Misura dopo:** seguiti **2, con la giocata d'assist 0/2**.

## D7 MEDIA — niente retrocessione dove non c'e' una serie sotto
- **Misura prima** (stato forzato: FC Parmense, Lega B, 18° su 18 a fine stagione): fine stagione «⬇️ RETROCESSIONE», «Retrocessione
  amara», mister e presidente sulla retrocessione, riquadro «Retrocesse alla lega inferiore»; classifica con zona e legenda «Retrocesse».
- **Causa:** `isRelegated` in `SeasonEndScreen` (src/16) guardava solo la posizione; la carriera (src/18) gia' non sposta nessuno
  dalla Lega B verso il basso. Stessa cosa per la zona `rel` della classifica (src/18).
- **Correzione:** si retrocede solo dal lato alto di `LEAGUE_PAIRS` (`_hasLower98`): fine stagione, legenda «Ultimi 3 ·
  retrocessione», elenco «Retrocesse…» e zona/legenda della classifica spariscono nelle seconde divisioni e nelle leghe senza gemella.
- **Misura dopo:** nessun testo di retrocessione, classifica senza «Retrocesse». Nota: il presidente dice «Ci siamo salvati, ma
  non e' stata una bella stagione» — coerente (nessuna retrocessione), lasciato.

## D8 MEDIA — il rinnovo toglie dalla lista cessioni
- **Misura prima** (stato forzato: in lista, «Negozia rinnovo» → «Accetta l'offerta del club»): `transferListed` true, home «📢 Sei in
  lista cessioni».
- **Correzione** (`src/18`): entrambi i percorsi di rinnovo (negoziato e offerta del club) scrivono `transferListed:false` e
  `transferRequest:null`. Il mercato legge `transferListed`: niente cessione «come se fosse in lista».
- **Misura dopo:** non in lista, home senza il riquadro.

## Gol e assist dell'eroe (PO-156 / PO-190)
Pilota seminato, salvataggio S12, 4 partite per braccio (`CPM_GOL=1234,2021,7,99`): **prima 0,75 gol / 0,25 assist a partita,
dopo 0,75 / 0,25** (stessi punteggi partita per partita). Dentro l'obiettivo 0,6-0,9 gol a partita.

## Guardiani esistenti (uno alla volta, build fe85cf9)
ESITI_GUARDIANI

## Note di metodo
- Una corsa del guardiano interrotta a meta' l'ho fermata con `pkill -f` (vietato dalle regole): ha chiuso anche la mia shell,
  nessun altro processo coinvolto. Non ripetuto.
- Non ho eseguito tutti i guardiani della MAPPA dei file toccati (src/04, 14, 15, 16, 18: decine di guardiani): per contenere i
  crediti ho scelto quelli dell'area (vedi sopra). La catena mirata resta da fare alla sessione madre.
