# Rapporto giro 105 — riparazione mirata dei rossi della catena notte 179

Ramo `sviluppo/giro105-catena179`, base `lavoro/179` (ccea45f3, 7.999.179). Sessione figlia, nessuna decisione di prodotto.
`CPM_CHROME=/opt/pw-browsers/chromium`, un controllo alla volta.

**Esito in breve:** nessun rosso della catena 179 era un difetto del gioco introdotto dalla 179. Otto sonde non conoscevano
ancora il markup unico V2 (o avevano una corsa interna), una guardia analitica era rotta dal giro 102 (già nella 178).
Nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`: tutte le correzioni sono negli strumenti, e ogni braccio rosso
è stato rigiocato e resta visibile. Nessun interruttore `__CPM_NO_G105*` è stato necessario, perché non c'era niente da
correggere nel gioco. Resta aperto **carriera3-94 D2** (sezione 7).

## Tabella

| # | Guardiano | Misura | Gioco o strumento | Regressione 179? | Correzione | Dopo |
|---|---|---|---|---|---|---|
| 1 | validate-situations (data-coherence) | 1 guardia di consistenza fallita: `pass→assist_recv→assist_shot` | strumento | **no**: identica su 7.999.178 (b14ccf0f) | regex della guardia | (vedi rigioco) |
| 2 | squalifica-222 | 11 falliti, rosso riprodotto in locale | strumento | indiretta (PO-302) | clic sul Simula del prompt | verde |
| 3 | infortunio-263 | 17 falliti | strumento | indiretta (PO-302) | idem | verde |
| — | simulata-272 | stesso schema, non ancora caduto | strumento | — | idem (preventiva) | verde |
| 4 | crea-home-295 | «la creazione non si apre» a 412 e 1280 | strumento | indiretta (V2 tappa 3) | confronto senza maiuscole | verde, rosso visibile |
| 5 | convocazione-235 | «bottone NON primario» | strumento | indiretta (V2) | primario = `TINTE.testo` | verde, rosso bocciato |
| 6 | giornata-233 | verde senza «Amichevole Internazionale» | strumento | indiretta (V2 tappa 2b) | riga letta fino a «sett.» | verde, rosso «1509ª giornata» |
| 7 | carriera3-94 D1 | settimana letta 7 invece di 12 | strumento (corsa) | no | attesa dell'autosave | verde, rosso D1 visibile |
| 7 | carriera3-94 D2 | «cieco: nessun rigore» | **aperto** | **no**: identico su 178 | — | rosso (sez. 7) |
| — | titolo-110 (tronco 1) | `sopra:null`; rosso cieco | strumento | indiretta (V2 tappa 2/4) | card `prossima-v2`; rosso col tema di prova | verde, rosso visibile |
| 8 | portiere-252 | instabile, KO 0/7 in entrambi i bracci | solo annotato | — | — | — |

## Dettaglio

### 1. validate-situations — data-coherence
La suite analitica (`tests/situations-3d-validation.js`) non trova più `:"assist_shot";hlPostArcT=0`: il giro 102 (`b869b58`,
03/11 23:28) ha inserito `sr.current._cg102=(hlPostArcType==="cross_goal");` fra l'assegnazione e il reset. Misurato: la guardia
fallisce identica sul sorgente 7.999.178. Le catene 178 erano verdi perché hanno girato il 03/11 alle 21:09-21:48 su `4a4ff49`,
**prima** del giro 102. La guardia ora ammette **solo** quella marca (`(?:sr\.current\._cg102=\(…\);)?`): togliendo il reset in una
copia del sorgente la guardia cade (verde true / rosso false). Gli altri 10 «issue» del messaggio erano i `warn` stampati perché
`fails>0`, non fallimenti.

### 2-3. squalifica-222, infortunio-263 (e simulata-272)
PO-302 tappa 2 ha messo un tasto **Simula** sulla Home (`data-cpm="simula-v2"`) che apre lo stesso prompt. Le sonde cliccavano
«l'ultimo bottone con Simula nel testo» e prendevano quello della Home, che riapre il prompt: la settimana non avanzava. Ora
cliccano `[data-cpm="simula-conferma"]` (il bottone del prompt), con ripiego sul vecchio filtro che esclude `simula-v2`.
simulata-272 usava lo stesso filtro: corretta in via preventiva.

### 4. crea-home-295
Il titolo «Crea il tuo calciatore» è un `TitoloV2` in `text-transform:uppercase`: `innerText` restituisce il maiuscolo e la regex
case-sensitive non lo trovava. Confronto con `/i`. `CPM_PROVA_ROSSO=1`: il rosso è ancora riconosciuto.

### 5. convocazione-235
Nella V2 il `Btn` primario ha sfondo `TINTE.testo` (#f4f1ea), non più `TH.primary`. La sonda confrontava il bottone con
`TH.primary`. Ora usa `TINTE.testo` (ripiego `TH.primary` solo se `TINTE` manca). Foto del verde controllata a occhio:
«Gioca la partita» chiaro su fondo scuro, h48. Rosso (schermata di prima) ancora bocciato a 360 e 412.

### 6. giornata-233
Il verde era giusto nel gioco: la riga V2 è «vs Portogallo / CASA / 🏳️ NAZIONALE / Amichevole Internazionale · sett. N». I `TagV2`
sono blocchi propri in `innerText`, e la sonda leggeva solo le 2 righe dopo il nome. Ora legge fino alla riga col «sett.»
(tetto 6). Verde «Amichevole Internazionale», rosso «1509ª giornata».

### 7. carriera3-94
**D1.** Il salvataggio automatico è a debounce di 600 ms sul cambio di `player` (`src/18`). `passi()` incalza i passi senza
pause e la sonda leggeva `localStorage` subito dopo: una corsa. Strumentato: su entrambe le build **nessuna scrittura** durante i
passi; dopo 3 s il salvataggio è alla settimana 12 su entrambe. Sulla 179 i passi durano 4,4 s contro 4,8 s e la corsa si perde
sempre; sulla 178 si vince. Ora `passi()` aspetta che il salvataggio raggiunga la settimana viva (tetto 6 s). Verde; `CPM_ROSSO=D1`
ancora cade.

**D2 (aperto).** «Cieco: nessun rigore dell'eroe segnato in scena nelle partite 7, 13, 21». Misurato identico su 7.999.179 e su
7.999.178 (b14ccf0f); il seme 7 è cieco anche su `4a4ff49` (base delle catene 178). Sonda di diagnosi: la partita si gioca
(4-1, fischio a ~210 s), il motore emette eventi (`__CPM_EVM870` > 0), ma `__CPM_PEN94` resta vuoto — nemmeno i gol dell'eroe.
(Esito del D2 completo su `4a4ff49`: vedi sotto.)

### 8. portiere-252
Annotato soltanto, come chiesto: instabile nella catena (verde alla 3ª prova); nei log entrambi i bracci danno KO 0/7.

## Rossi del tronco 1 non in elenco
- **titolo-110**: la card V2 della prossima gara dice «Prossima · Premier Division · …» (`data-cpm="prossima-v2"`), non
  «Prossima partita»: la sonda non la trovava (`sopra:null`). Il braccio rosso `__CPM_NO_TITOLO110` rimette la crema cablata
  `#fef3c7`, illeggibile sul vecchio tema chiaro ma leggibile sul tema unico scuro: **rosso cieco**. Come prescrive l'invariante
  «tema unico», il rosso ora si fa col tema di prova sbiadito (`lib/tema-prova.mjs`): verde contrasto 8,78 / 14,79, rosso 2,27 / 2,12.
- **lento-103** (rosso «il difetto non si vede»), **riserva-103** e **contatto-103** (instabili): non toccati. Il giro 103 aveva
  dichiarato lento-103 «declassata a sonda (non deterministica)», ma la catena `completa` di `ci-runner.mjs` la contiene ancora:
  da decidere fuori da questa sessione.

## Rigioco finale
(vedi sezione aggiornata alla chiusura)
