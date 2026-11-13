# Rapporto giro 182b (rifacimento del giro 182) — verso la 7.999.192

Ramo: `sviluppo/giro182-spogliatoio-nomi`, partito da `origin/lavoro/192` (34be8b7). `GAME_VERSION` non toccato (regola fissa).
Ogni punto è stato misurato prima di correggere, ha un braccio rosso e un guardiano verde col verde e rosso col rosso.

## A) PO-379 — «i 3 compagni dello spogliatoio dove li ha pescati?»

**Misura (prima della correzione, guardiano `spogliatoio-182`).** In Primavera **0 compagni su 3** stavano nella «Rosa»
mostrata, mentre da professionista erano 3 su 3. Causa confermata, come nell'ipotesi:
- alla creazione (`src/17`, `generateTeammates(newPlayerBase)`) il giocatore ha `club:null`, quindi i nomi vengono da una rosa
  fittizia «U18» (`generateTeamRoster({id:"u18"})`);
- `syncTeammateNames` (`src/08`) usciva subito se `proStatus` era `"u18"`: in Primavera i nomi non venivano mai riallineati
  alla rosa vera del club (il fix 7.106.3 copriva solo la prima squadra).

**Correzione.** `syncTeammateNames` ora riallinea anche in Primavera, sulla stessa rosa del pannello
(`generateTeamRoster(player.club, stagione)`, slot dell'eroe compreso perché il titolare spostato va in panchina).
Archetipi e legame restano quelli salvati; la migrazione (`migratePlayer`, al montaggio di CareerApp) è idempotente.
Rosso: `window.__CPM_NO_G182_SPOG` = comportamento di prima.

**Guardiano `npm run spogliatoio-182`** (3 casi: Primavera dalla creazione, Primavera stagione 2, professionista con nomi di
una stagione vecchia; nomi ⊂ rosa, archetipi/legame intatti, seconda migrazione senza cambi ai compagni, zero errori):
verde **15 ok / 0 ko**; rosso **13 ok / 2 ko** (i due casi Primavera). Registrato in `package.json`, catena `carriera`,
mappa `src/0[0-8]` e `src/1[17]`.

## B) PO-378 — nomi di squadra lunghi («SELEZIONE GRAN…»)

**(1) Dove si tronca — misura col braccio rosso** (censimento DOM ogni 250 ms, tutti i nomi di CLUBS, Primavera, avversari
dei provini, Selezione Granata; percorsi: provino vero — schermata, ingresso, barra — e carriera in Primavera col club dal nome
più lungo — cruscotto, classifica, calendario, coppe, club; a 375, 412, 768, 1280 px):
- barra della partita a **412 px**: «SELEZIONE GRANATA» 103 > 83 px e «POLISPORTIVA CENTRO» 114 > 85 px coi puntini
  (è la foto del PO: sotto i 400 px `_nomeBarra108` metteva già la sigla, da 400 in su il nome intero coi puntini);
- slot di salvataggio sulla home a 412 px: «Torino Athletic Primavera · S.1 W.3/38» 192 > 132 px.
- A 375, 768 e 1280 nessun nome tagliato sui percorsi visitati.

**(2-4) Correzione: funzione unica** in `src/11` — `abbreviaSquadra182(nome)` (dizionario del PO: Selezione→Sel.,
Polisportiva→Pol., Atletico→Atl., Sporting→Sp., Unione Sportiva→U.S., Associazione Calcio→A.C., Football Club→FC,
Deportivo→Dep.; «Real» resta Real), `candidatiSquadra182` (intero → dizionario → sigla) e il componente `NomeSquadra182`,
che misura sul posto (scrollWidth/clientWidth), scende di un gradino solo se il testo non ci sta, risale quando lo spazio
cresce (finestra, carattere caricato, contenitore più largo) e **non usa mai i puntini** (`text-overflow:clip`).
Applicato a: barra della partita e grafica d'ingresso (`src/15`), prepartita e formazioni (`src/13`, 6 punti), provino e
scelta del club (`src/17`), slot di salvataggio (`src/17`), prossima partita, tabella dei gironi, elenco offerte (`src/18`).
Rosso: `window.__CPM_NO_G182_NOMI` = nome intero coi puntini (e nella barra il vecchio `_nomeBarra108`).

**Guardiano `npm run nomi-182`**: verde **27 ok / 0 ko** — 0 nomi tagliati o coi puntini su 8 percorsi, 16 nomi visti dalla
funzione unica, 0 che non ci stanno, **0 abbreviazioni senza bisogno** (il gradino prima non ci sta nello spazio
disponibile), tutti i 296 nomi di club hanno un candidato che ci sta. Rosso **25 ok / 2 ko** (i tre tagli di sopra).
Tutti i club nella barra della partita (intero / dizionario / sigla): 375 px (58 px utili) 79/1/216 · 412 px (83 px)
242/3/51 · 768 px 296/0/0 · 1280 px 296/0/0.
Foto prima/dopo: `docs/sviluppo/foto-182/barra-provino-{375,412}-{prima,dopo}.png` (a 412 «SELEZIONE GRA…» → «SEL. GRANATA»;
a 375 «GRA» in entrambi, perché «SEL. GRANATA» misura 71 px contro 58 disponibili).

## C) Tasto «Vai al prossimo momento» — offerte della categoria «opportunità»

**Misura.** Con `C.storia165b` (la classificazione che decide se una scelta ferma la corsa da professionista) le offerte erano
tutte `null` = routine: il tasto **non** si fermava.

**Elenco della categoria «opportunità»** (19 scelte, misurate sul catalogo `WEEKLY_IMPULSES`) e decisione presa:

| id | cachet (ef.bank delle scelte) | ferma il tasto? | motivo |
|---|---|---|---|
| wi_videogioco | 25.000 / 0 | **sì (nuovo)** | nominato dal PO; cachet |
| wi_docufilm | 0 / 0 | **sì (nuovo)** | nominato dal PO (nessun cachet nel catalogo) |
| wi_biografia | 20.000 / 0 | **sì (nuovo)** | nominato dal PO; anticipo |
| wi_esports | 18.000 / 0 | **sì (nuovo)** | offerta con cachet |
| wi_bonus_gol_social | 8.000 / 0 | **sì (nuovo)** | offerta con cachet (sponsor sui social) |
| wi_scuola_calcio | −30.000 / 6.000 | **sì (nuovo)** | proposta d'affari con denaro in gioco in entrambe le scelte |
| wi_sponsor, wi_sponsor_auto, wi_sponsor_pers | 0 / 35.000 | sì (già) | regola del giro 173 |
| wi_prestito_inverno | 0 | sì (già) | regola «prestit/offert» del giro 165b |
| wi_media, wi_tv_primaserata | 0 | no | offerte d'immagine senza cachet — **dubbio per il PO** (simili al docufilm) |
| wi_personal_chef | −15.000 | no | servizio a pagamento, non un'offerta che porta soldi — **dubbio per il PO** |
| wi_amichevole, wi_giovane, wi_staff, wi_tifosi, wi_ct_radar, wi_nazionale_b | 0 | no | non economiche |

**Correzione** (`src/18`): elenco `OFFERTE182` in `_storia165b` → «offerta». Rosso `window.__CPM_NO_G182_OFFERTE`.
**`momento-173` aggiornato** (sezione 1, nuovo braccio `CPM_ROSSO182OFF=1`): sezione 1 verde **7/0**, rosso **6/1**.

## Catena eseguita

Vedi la sezione «Esiti» qui sotto (aggiornata a fine giro).

## Dubbi per il PO (nessuna decisione presa)

1. «Primavera» non è nel dizionario: «FC Kaiserslautern Primavera» dove non ci sta scende direttamente alla sigla (perdendo
   «Primavera»). Un'abbreviazione tipo «Prim.» andrebbe decisa dal PO.
2. wi_media e wi_tv_primaserata (offerte d'immagine senza cachet come il docufilm) e wi_personal_chef: restano routine.
3. A 375 px la barra della partita lascia 58 px al nome: 216 club su 296 scendono alla sigla (prima, sotto i 400 px, la sigla
   valeva per ogni nome oltre 7 caratteri). Allargare la barra è una scelta di disegno, non fatta.
4. La misura «tutti i club» copre i punti della funzione unica visibili alla fine dei percorsi (la barra); gli altri punti sono
   coperti dal censimento sui nomi realmente mostrati, non da tutti i 296 club.
5. La catena «mirata» automatica (base origin/lavoro/192) includerebbe le liste intere di src/15 e src/18 (partite vere, ore):
   col limite settimanale vicino ho eseguito la catena dell'area carriera+grafica elencata negli esiti.
