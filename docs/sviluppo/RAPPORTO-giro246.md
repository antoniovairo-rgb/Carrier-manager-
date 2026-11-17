# Rapporto giro 246 — seguito PO-508: «Gioca solo i momenti salienti» in un unico punto, in tutte le partite

Versione di riferimento 7.999.197 (GAME_VERSION non toccata, come da regole). Ramo `sviluppo/giro246-salienti-una-scelta`, partito da
`lavoro/197` (commit `d3c293f`, unione del giro 243).

## Le decisioni del PO (17/11, vincolanti)

- «Gioca solo salienti ci deve essere in tutte le partite e deve comparire in un unico punto, va standardizzato»: tutte le partite giocabili
  passano dalla stessa schermata pre-partita (`MatchdayCard`, `src/13-prepartita-formazioni.jsx`) col tasto nello stesso posto, stessa
  etichetta e stessa nota; nessun altro punto lo offre; un percorso che saltava la pre-partita ora ci passa.
- «Vedere sempre l'ingresso»: scegliendo i soli salienti si vedono formazioni e ingresso in campo (saltabili come oggi), poi la partita a
  soli salienti.

## Misura prima (codice di `d3c293f`)

### Chi monta `LiveMatch` (tutte le chiamate nel sorgente)

| Punto | File | Che cosa | Fase iniziale |
|---|---|---|---|
| Carriera | `src/18` ~6623 (`screen==="match"`) | **ogni** gara della carriera: campionato, coppa, Europa, Nazionale (amichevole, Coppa delle Nazioni, Europeo/Mondiale qualificazioni/gironi/KO), Primavera/U18, finali | `matchday` (pre-partita); `playing` solo nella ripresa dopo un'interruzione |
| Provino | `src/17` ~696 (`TrialFlow`, fase `match`) | i tre provini della creazione del giocatore | **`playing`**: saltava pre-partita, formazioni e ingresso |
| Visori di sviluppo | `src/19` ~133 e ~200 | strumenti di revisione delle scene (contesto `trial`) | `playing` (non sono partite del giocatore; invariati) |

Chi porta alla carriera (`setScreen("match")`): `startMatch` (prompt della settimana: «Gioca la partita», «Gioca · parti dalla panchina»,
tasto «Gioca» del calendario, tastiera, gancio `playMatch`), `startNationalMatch` (amichevole, dopo la convocazione), `startNationsCupMatch`
e `startEuroMondialeMatch` (tasto principale della home `avanza23` e lobby della scheda Nazionale), la chiusura della conferenza
stampa/discorso del mister (`src/18` ~712/718) e la ripresa (`src/18` ~1401). Amichevoli di precampionato del club: **non giocabili**
(il ritiro le simula coi motori puri `ritiroFriendlies`, `src/18` ~1228). Playoff/spareggi: nessun contesto proprio; le finali stanno nei
contesti coppa/Europa/Nazionale.

### Dove compariva la scelta (prima)

- `src/18` ~7413: tasto nel **prompt** della partita (`data-cpm="solo-166"`, da titolare, professionista).
- `src/18` ~12368 / ~12473: tasti nelle **lobby** della Coppa delle Nazioni e di Europeo/Mondiale (`solo-229-nc`, `solo-229-em`).
- `src/15` → `MatchdayCard`: tasto della **pre-partita** (giro 243, `solo-243`), solo professionisti, non provino; **saltava formazioni e
  ingresso** (`setPhase("playing")`).
- Convocazione della Nazionale: nessun tasto. Nessun altro punto (ricerca di «momenti salienti» in `src/`).

## Correzione

- `src/18-career-app.jsx`: `_g246()`; il tasto del prompt e i due delle lobby compaiono solo con `__CPM_NO_G246` (via dal prompt e dalle
  lobby; il prompt resta per giocare/simulare come prima del giro 229).
- `src/15-live-match.jsx`:
  - il tasto della pre-partita c'è in ogni partita da titolare, **anche Primavera/U18 e provino** (prima: solo professionisti, mai nel
    provino); resta escluso dalla panchina e con infortunio, e con `__CPM_NO_G166`;
  - premuto, apre **formazioni → ingresso in campo** (`handleGoToFormations`, lo stesso di «Vedi le formazioni»), poi la partita a soli
    salienti; formazioni e ingresso restano saltabili coi tasti di oggi («Salta l'ingresso»);
  - nuovo prop `prePartita246`: il provino vero passa dalla pre-partita. **Sotto `?cpmtest=1` il provino resta dritto in campo** (tutte le
    sonde e il gate lo aprono così) salvo il gancio `window.__CPM_PREP246`, che il guardiano arma.
- `src/17-menu-creazione-pannelli.jsx`: il provino passa `prePartita246={true}` (i visori di `src/19` no).
- Rosso `window.__CPM_NO_G246`: torna il comportamento del giro 243 (tasti nel prompt e nelle lobby, tasto della pre-partita che salta
  formazioni e ingresso, niente tasto in Primavera e provino, provino dritto in campo).
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**.

## Tabella dei percorsi (misurata dal guardiano `salienti-246`, corsa finale verde+rosso)

Colonne: T = tasto nella pre-partita (con la nota) · U = nessun tasto dei salienti in altre schermate attraversate (prompt, convocazione,
lobby, home) · I = ingresso visto (fase `walkout`) prima della prima scena · S = partita a soli salienti (testimone `__CPM_LM166`
attiva+scelta243, velo, gioco fluido in ms reali per minuto di gioco su ≥ 20 minuti; la partita intera sta a ~1600).

| Percorso | Prima (giro 243) | Dopo — verde | Rosso `__CPM_NO_G246` |
|---|---|---|---|
| Campionato (prompt) | tasto nel prompt **e** nella pre-partita, senza ingresso | T U I S ✓ (98 ms/min) | cade: U (tasto nel prompt), I |
| Coppa nazionale (prompt) | idem | T U I S ✓ (117) | cade: U, I |
| Europa girone (prompt) | idem | T U I S ✓ (100) | cade: U, I |
| Europa eliminazione diretta (prompt) | idem | T U I S ✓ (137) | cade: U, I |
| Nazionale amichevole (prompt → convocazione) | idem | T U I S ✓ (82) | cade: U, I |
| **Primavera U18 (prompt)** | **nessun tasto** | T U I S ✓ (74) + **giocata fino al 92', registrata** (`matchHistory`) | cade: T, I, S |
| Coppa delle Nazioni (tasto della home) | pre-partita, senza ingresso | T U I S ✓ (74) | cade: I |
| Coppa delle Nazioni (lobby) | tasto nella lobby **e** nella pre-partita | T U I S ✓ (130) | cade: U (tasto nella lobby), I |
| Europeo qualificazioni (tasto della home) | pre-partita, senza ingresso | T U I S ✓ (145) | cade: I |
| Mondiale gironi (tasto della home, foto PO 196) | pre-partita, senza ingresso | T U I S ✓ + **giocata fino al 90', registrata** (`groupMatchIdx` 0→1) | cade: I |
| Mondiale gironi (lobby) | tasto nella lobby e nella pre-partita | T U I S ✓ (136) | cade: U, I |
| Mondiale eliminazione diretta (tasto della home) | pre-partita, senza ingresso | T U I S ✓ (89) | cade: I |
| **Provino (creazione)** | **niente pre-partita, niente tasto, niente ingresso** | T U I S ✓ (41 su tutta la partita) + **giocato fino al 92', «Risultati provino»** | cade: pre-partita saltata (fase `playing`) |
| Dalla panchina (prompt) | nessun tasto | nessun tasto ✓ | nessun tasto ✓ |
| Squalificato / infortunato | partita simulata / non giocabile | invariato (non misurato in questo giro) | — |
| Calendario («Gioca» della voce di settimana), tastiera, gancio `playMatch` | passano da `startMatch` | stessa pre-partita (non misurati a parte) | — |
| Ripresa dopo interruzione | rientra in campo nella modalità salvata | invariato (non rigiocato) | — |

Esito: **VERDE PASSA** (13/13 percorsi + panchina, 0 errori di pagina) · **ROSSO CADE su ogni percorso** (`salienti-246`, uscita 0).

## Guardiano `salienti-246` (nuovo)

`tests/visual/salienti-246.mjs`, `npm run salienti-246`; in `ci-runner.mjs` una volta nelle catene `completa` e `carriera`, fra i lenti,
e nella mappa mirata di `src/12|13`, `src/15`, `src/18|16|10` (accanto a `salienti-243`) e `src/11|17` (il provino). `node --check`
verde, nessun doppione. Gioca, non legge il sorgente: un percorso per pagina nuova (carriera da salvataggio sintetico; il provino dalla
creazione vera con `__CPM_PREP246`), giudizi T/U/I/S come sopra, tre partite fino al fischio (Primavera, Mondiale gironi, provino). Il
rosso pretende la pre-partita raggiunta (giudicato) salvo il provino, che deve cadere proprio perché la salta. `CPM_PARTE=verde|rosso`,
`CPM_SOLO=<pezzo del nome>` (anche `panchina`), `CPM_TRACE=1` per la traccia delle schermate.

Prima stesura, tre difetti della **sonda** trovati e riparati (nessuna soglia toccata):

1. la misura del passo «fino alla prima scena» era non giudicata dove la prima scena cade al 2'-5' → ora su una finestra di ≥ 20 minuti
   (sulle partite intere su tutta la partita);
2. il tasto della lobby di Europeo/Mondiale si chiama «⚽ Gioca Girone · Giornata…», non «Gioca Partita»;
3. **instabile, misurato**: 1 volta su 6 circa, nei due bracci, «Gioca» finiva su «Nessuna partita programmata questa settimana» —
   la giornata di lega della settimana risultava già giocata subito dopo l'apertura del salvataggio sintetico, e una toppa a
   `played:false` non teneva. Ora campionato/Primavera/panchina usano una gara di lega **nuova** nella stessa settimana (stesso
   avversario, `matchday` 996). Dopo: panchina 6/6 nel rosso, poi corsa completa verde e rosso puliti. La causa nel gioco non è
   individuata (dubbio 6).

## Controlli aggiornati (giudicavano il vecchio posto)

- `tests/visual/lib/partita-166.mjs` (`gioca166`): se il prompt non ha il tasto, preme «Gioca la partita» e alla pre-partita sceglie
  «Gioca solo i momenti salienti» (modo `solo`) o «Vedi le formazioni» (modo `intera`). Anche l'intera passa dalle formazioni perché i
  due modi restino confrontabili: le formazioni caricano la tattica avversaria (`generateOpponentTactic`, la cui `pressure` entra nella
  risoluzione delle scene). La usano molte sonde (rassegna-200, riproduci-175, …): ora funzionano con il tasto nel nuovo posto.
- `solo-highlight-166`, `salienti-229`, `momento-173`: la regola del **prompt** (posta, titolare, professionista) vive ora nel rosso
  `__CPM_NO_G246` ed è lì che si giudica — come il 166 già faceva col rosso del 229. `salienti-229` ha anche `CPM_G229_DUMP` per salvare
  le due schermate finali.

## Controlli

| Controllo | Esito |
|---|---|
| salienti-246 (verde + rosso) | verde PASSA · rosso CADE su ogni percorso |
| salienti-243 | verde PASSA · rosso CADE (i ✗ stampati sono del rosso) |
| salienti-229 | **instabile**: 5 corse sul ramo → 2 verdi pulite consecutive (ultime), 2 rosse su «C libro mastro e schermata finale identici» (voci 10/10, schermata finale 1865 contro 1864 caratteri), 1 rossa con la partita intera non arrivata al fischio (punteggio 2-4 dopo il pareggio forzato 1-1 al 3', NON GIUDICATO); rosso `__CPM_NO_G229` CADE. Sulla base `d3c293f`: 1 corsa, verde. Vedi dubbio 5 |
| solo-highlight-166 | VERDE PASSA (13/13; partita a soli salienti aperta dalla pre-partita con formazioni: 55,7 s contro 193,0 s; libro mastro 270/270 identico) · ROSSO `__CPM_NO_G166` CADE su 3, 7, 8 |
| barra-221 | VERDE (difetti 0, non giudicati 0) · rossi `__CPM_NO_G221` e `__CPM_NO_G229` bocciati come devono |
| momento-173 (toccato, nella mappa di src/18) | verde 20/20 · rosso `CPM_ROSSO173=1` 10 rossi, esce 1 come deve |
| test:logic | 51 pass · 0 fail |
| save-compat | 12 pass · 0 fail (serve `CPM_CHROME`: senza, il modulo cerca `chromium_headless_shell-1255`) |
| Mappa mirata completa di src/15, src/17, src/18 | **non eseguita** oltre ai controlli qui sopra (decine di guardiani; la consegna elencava quelli da eseguire) |

Prova fotografica (telefono 412×915, non nel repository): pre-partita e formazioni del provino in
`/tmp/claude-0/-home-user-Carrier-manager-/3685e46c-f160-5c4e-8643-415f203ccbe7/scratchpad/provino-prepartita-246.png` e
`…/provino-formazioni-246.png`.

## Dubbi per il PO

1. **Provino sotto `?cpmtest`.** Nel gioco vero il provino passa dalla pre-partita; sotto `?cpmtest=1` resta dritto in campo (salvo
   `__CPM_PREP246`), perché il gate e decine di sonde lo aprono aspettandosi `playing`. Il provino «da collaudo» quindi non è identico a
   quello vero. Se si preferisce l'identità, va adeguato il banco (`openMatch` e chi lo usa).
2. **Pre-partita del provino, impaginazione** (foto): la nota sotto «Gioca solo i momenti salienti» tocca il bordo sinistro dello schermo
   (il contenitore del provino ha padding 0) e nelle formazioni il tasto «Ingresso in campo» è tagliato in basso (resta premibile: il
   guardiano lo preme). Non corretto: è grafica, fuori da questo giro.
3. **Dalla panchina**: il tasto resta assente (come 166/229/243: «da titolare»). La decisione del 17/11 dice «tutte le partite»; da
   chiarire se include le gare in cui si parte dalla panchina.
4. **Formazioni e tattica avversaria**: «Vedi le formazioni» carica la tattica avversaria (pressione) e «Salta e gioca» no, quindi le due
   strade possono dare partite diverse. Ora la scelta dei salienti passa sempre dalle formazioni. Era già così prima di questo giro.
5. **`salienti-229` instabile** (vedi tabella). Il carattere diverso non è stato catturato: le due corse con `CPM_G229_DUMP` sono uscite
   verdi. Con `__CPM_NO_G246` il percorso del gioco è quello del giro 243, quindi non attribuisco la differenza alla correzione, ma con
   una sola corsa sulla base **non posso confermarlo**. Regola «instabile due volte si ripara»: da aprire come cantiere.
6. **Gara della settimana «già giocata»** subito dopo l'apertura del salvataggio sintetico (~1 su 6, entrambi i bracci): aggirata nella
   sonda, causa nel gioco non individuata (forse l'auto-risoluzione delle gare lasciate indietro mentre `apriCarriera166` cerca la
   settimana). Riguarda anche `salienti-243` (stessa funzione di apertura).
7. **Infortunato in Nazionale/Primavera**: il tasto sparisce con `player.injured`, come prima; non ho trovato un percorso in cui un
   infortunato arrivi davvero alla pre-partita, quindi non è misurato.
8. **Ripresa dopo interruzione**: la scelta fatta nella pre-partita resta salvata (`s166`, giro 243); non rigiocata.
