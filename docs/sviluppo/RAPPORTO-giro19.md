# Rapporto giro 19 — rilievi dei collaudi 164 e 165 (PO-242 … PO-247)

Ramo `sviluppo/rilievi-collaudo-242`, creato da `lavoro/167` (7.999.167). `GAME_VERSION` **non** cambiata e nessuna
nota aggiunta al suo commento (per non creare conflitti sulla riga di versione all'integrazione).
Decisione PO 14/10: «Terminiamo il prima possibile L1».
Zona G (carriera/classifica): **nessuna logica toccata**. Toccati solo testi del giornale (PO-244) e la sola lettura della
griglia del Calendario (PO-247 N6, vedi sotto). Il club «FC Kadıköy» (165 N10) **non** è stato toccato: è una decisione del PO.

Condizioni delle misure: headless (`/opt/pw-browsers/chromium`), `?cpmtest=1`, 412×915, una pagina nuova per braccio,
salvataggi `fixtures/save-190-s12-ovr93.json` (S12) e `fixtures/save-194-primavera-w38.json` (schede). GLB spento salvo
dove indicato. Build `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs` («IDENTICO BYTE PER BYTE»).

## Tabella

| Voce | Esito | Causa (file:riga sul ramo) | Interruttore rosso | Guardiano | Verde / rosso misurati |
|---|---|---|---|---|---|
| PO-242 «Conduci palla al piede e tira» | **corretta** | riga d'esito `src/15-live-match.jsx:8986` (`_cond70` senza l'esclusione del tiro che il riquadro ha dal 7.999.160) · 3D `src/12-three-match-view.jsx:4717` (ramo «conduzione persa» `BALL_CARRY` che salta l'arco di tiro) | `__CPM_NO_COND242` | `conduci-242` | v. sotto |
| PO-243 intervista dopo la Nazionale | **corretta** | `src/18-career-app.jsx`: i rami `euroMondiale_qualif`, `euroMondiale_group/ko`, `national/nationsCup`, `euro_group/ko` uscivano con `return` prima del blocco PO-231 | `__CPM_NO_IV243` | `intervista-231` (braccio Nazionale nuovo) | v. sotto |
| PO-246 scheda del mister aperta 22' | **non riprodotta per un giocatore**: è il pilota di collaudo | `src/15-live-match.jsx:4269` il blocco del cronometro con scheda aperta è saltato da `__CPM_AUTOPLAY_ON` (solo collaudo) | `__CPM_NO682F` (esistente) | `schede-246` | v. sotto |
| PO-244 giornale | **corretta** | `src/15-live-match.jsx:9984` (ramo Europeo/Mondiale che cattura Nazionale e Coppa delle Nazioni con un torneo già chiuso) · `src/15-live-match.jsx:11442` («G.» = settimana) · `src/13-prepartita-formazioni.jsx:232` (rassegna stampa, stesso schema) | `__CPM_NO_GIORN244` | `giornale-244` | v. sotto |
| PO-245 ingresso in campo | **corretta** | `src/12-three-match-view.jsx:1843` (tunnel ospiti `side*36` = linea opposta) · `src/12-three-match-view.jsx:3041` (avvicinamento esponenziale: velocità ∝ distanza) | `__CPM_NO_ING245` | `ingresso-245` | v. sotto |
| PO-247 avviso sopra la risposta (164 N4) | **corretta** | `src/11-ui-kit-highlight.jsx:105` toast in basso, dove l'intervista ha le risposte | `__CPM_NO_TOAST247` | `toast-247` | v. sotto |
| PO-247 coppa sparita dopo il prestito (164 N5) | **verificata, non toccata** (zona G) | `src/18-career-app.jsx:5700-5713`: comportamento voluto | — | — | — |
| PO-247 griglia ⚽ su settimane giocate (165 N6) | **corretta** (sola lettura) | `src/18-career-app.jsx:8833` (risultato cercato solo in `matchHistory`) | `__CPM_NO_CAL247` | `calendario-247` | v. sotto |
| PO-247 «Nazional…» e scudo grigio (165 N7) | **corretta** | `src/18-career-app.jsx:8626` (scudo di ripiego grigio: la Nazionale non è in `CLUBS`) e chip nella riga `nowrap` | `__CPM_NO_CAL247` | `calendario-247` | v. sotto |
| PO-247 «FC Kadıköy» (165 N10) | **non toccata** | decisione del PO | — | — | — |

## 1) PO-242 — «Conduci palla al piede e tira» fallito (alta)

**Misura prima della correzione** (`conduci-242`, scena «fra le linee» costruita dal motore con `scenaDalMotoreLinee`, come la
costruisce il gioco; azione «🏃 Conduci palla al piede e tira»; esito forzato fail con tipo saved / wide / blocked): in 3 esiti su
3 la riga sotto il titolo era «😖 Il difensore lo chiude: palla persa.» e il portiere non faceva nessun gesto (`__CPM_GK229` vuoto,
il cancello del portiere `__CPM_GKGATE` mai raggiunto). Il 3D mostrava un contrasto: `deriveHL` classifica l'azione `shot`, ma il
ramo «conduzione persa» (5.43.5) scattava sul pattern `BALL_CARRY` e saltava l'arco di tiro.

**Correzione.** (a) `src/15-live-match.jsx:8986`: la conduzione che finisce in tiro, se fallisce, non pesca più le frasi della
conduzione persa: la riga viene dallo stesso esito del motore del titolo (stessa regola che il riquadro ha dal 7.999.160, r. 427 di
`src/05`). (b) `src/12-three-match-view.jsx:79` nuova `_tiro242(P,t)` e `:4717`: un'azione con premio gol, etichetta da tiro ed esito
da tiro (saved/wide/out/post/blocked) va all'arco di tiro, dove il portiere reagisce. Rosso `__CPM_NO_COND242` (riporta entrambe).

**Dopo** (GLB spento e GLB acceso): parata → `gk_dive` armato e suonato; riga «Tiro fuori!» / mai «palla persa»; rosso: «palla
persa» 3 su 3 e portiere fermo. Guardiano `conduci-242` ✅ (GLB spento: 3 esiti; GLB acceso: parata).

⚠️ **Limite dello strumento, dichiarato.** `__CPM_FORCE_KIND` cambia l'esito *dopo* che la frase è stata scelta
(`src/15-live-match.jsx:9168`): in sonda titolo e riga raccontano l'esito naturale (qui sempre «fuori»), il 3D quello forzato. Per
questo il guardiano giudica la riga sul «non palla persa» e il portiere sul 3D forzato; che titolo e riga dicano la stessa famiglia
è garantito per costruzione (stesso `_outKind` alla stessa riga di codice), non misurato su una parata naturale.

## 2) PO-243 — intervista dopo la Nazionale

**Misura prima** (collaudi 164 N2, 165 K2): 0 interviste su 6 gare della Nazionale. **Causa** (`src/18-career-app.jsx`): i rami
`euroMondiale_qualif` (r. 3436), `euroMondiale_group/ko` (r. 3459), `national/nationsCup` (r. 3521), `euro_group/ko` (r. 3603)
chiudono con `return` prima del blocco PO-231. **Correzione:** il blocco diventa `_intervistaPost231()` (r. 3405) e quei rami
chiamano `_iv243()` prima di uscire (r. 3455, 3517, 3599, 3652); il ramo del campionato la chiama dove stava (r. 3813). L'intervista
aspetta anche la finestra della Coppa delle Nazioni (stessa coda del 24/09). Gancio di prova `__CPM_CAREER.apriNC243`.
Rosso `__CPM_NO_IV243`.

**Dopo** (`intervista-231`, braccio Nazionale nuovo: Coppa delle Nazioni con la forma della sonda del collaudo 164, giocata fino al
fischio): verde intervista comparsa (`data-ctx="loss"`); rosso nessuna intervista. Il braccio di club resta verde (`draw`) e il suo
rosso (`__CPM_NO_IV231`) si vede. ✅

## 3) PO-246 — scheda del mister aperta 22 minuti

**Misura** (`schede-246`, save-194, velocità 4, timer di scadenza 6 s, nessuna risposta):

| braccio | schede a schermo | arrivate al motore | minuti di gioco a scheda aperta |
|---|---|---|---|
| giocatore (blocco del cronometro attivo, `__CPM_SCFREEZE_TEST`) | 3 | 3 (`eroe_stanco@55`, `pari_75@75`, `misura_85@86`, auto) | **0** (55-55, 75-75, 86-86) |
| pilota (come la sonda del collaudo 165) | 3 | 3 | 3-4 (56-59, 76-79, 87-90) |
| rosso `__CPM_NO682F` (blocco tolto) | 3 | 3 | 4 (55-59, 75-79, 86-90) |

**Lettura.** Sulla 7.999.167 una scheda senza risposta **ferma la partita** finché il timer (35 s) non sceglie da sola, e la scelta
arriva al motore. Il difetto del collaudo nasce dal **pilota di collaudo**: `src/15-live-match.jsx:4269` salta il blocco del
cronometro quando `__CPM_AUTOPLAY_ON` è vero (gancio solo di collaudo, `src/15-live-match.jsx:2602`); con 35 s reali e il minuto a
1,7 s a 1× fanno ~20 minuti di gioco, cioè i 22' del collaudo (54'→76'). L'ultima scheda «fino al fischio» è la stessa cosa: col
pilota la partita arriva al 90' prima dei 35 s. **Nessuna modifica al gioco.** Guardiano `schede-246` sul comportamento vero
(rosso = l'interruttore esistente `__CPM_NO682F`). ✅ Suggerimento per i collaudi: con `__CPM_AUTOPLAY` armare anche
`__CPM_SCFREEZE_TEST=1`, altrimenti le schede si misurano a cronometro che corre.

## 4) PO-244 — giornale del dopo partita

**Cause.** (a) `src/15-live-match.jsx:9984`: il ramo Europeo/Mondiale (`isNatCtx && player.euroMondiale`) catturava anche
l'amichevole e la Coppa delle Nazioni appena il salvataggio portava un torneo già chiuso (`phase:"done"`, `koPhase:null`) →
«Fase a eliminazione». (b) `src/15-live-match.jsx:11442` stampava `G. {player.week}`; la rassegna stampa
`src/13-prepartita-formazioni.jsx:232` lo stesso con «Giornata».
**Correzione.** Amichevole: fase «Amichevole internazionale» (r. 9983); Coppa delle Nazioni: va al suo ramo (girone N/3 o Finale).
«G.» = numero della giornata letto dall'etichetta del turno (`_roundLabel`, che lo prende dal calendario per avversario); fuori dal
campionato «Sett. N» (la fase sta già nella testata). Rassegna stampa: giornata dalla voce di campionato della settimana, altrimenti
«Settimana N». Rosso `__CPM_NO_GIORN244`.

**Dopo** (`giornale-244`, partite vere fino al giornale): Coppa delle Nazioni girone 1 → «COPPA DELLE NAZIONI · FASE A GIRONI ·
GIORNATA 1/3», «Stag. 12 · Sett. 38»; campionato settimana 38 (34ª giornata) → «Stag. 12 · G. 34». Rosso: «G. 38» e «COPPA DELLE NAZIONI · FASE A ELIMINAZIONE». ✅ La rassegna stampa di `src/13` non è
coperta dal guardiano (non l'ho vista in gioco, come la collega del 165): corretta per lettura del codice.

## 5) PO-245 — ingresso in campo

**Misura prima** (`ingresso-245`, testimone `__CPM_WALK245` in tempo di scena, finestre ≥ 0,25 s): ospiti da z **+36** (casa
z −36); velocità massima **155–158 u/s** per gli ospiti e **160–207 u/s** anche per la coda della squadra di casa (GLB spento /
acceso). La causa della velocità è l'avvicinamento esponenziale di `animWalk` (`src/12-three-match-view.jsx:3041`, velocità
∝ distanza residua): il collaudo aveva misurato i primi tre di casa, che partono vicini (~2,8 u/s).
**Correzione** (`src/12-three-match-view.jsx:1843` e `:3041`): (a) le due squadre escono dallo stesso tunnel (z −36, lato
panchine); (b) tetto del passo 6,5 u/s; (c) esce per prima la testa della fila (chi va più lontano), così con il tetto tutti arrivano
entro l'ingresso (10,5 s di scena). Rosso `__CPM_NO_ING245`.
**Dopo:** stesso lato (z0 −36 / −36), velocità massima 6,5 / 6,5 u/s, 0 calciatori lontani dal posto a fine ingresso, GLB spento e
acceso. ✅ ⚠️ 6,5 u/s è un passo svelto, non una camminata: per una camminata vera (≈ 1,5–2 u/s) servirebbe una fila più corta o un
ingresso più lungo, cioè una scelta di regia che lascio al PO. Sul telefono **non** l'ho visto.

## 6) PO-247 — rilievi minori

- **Avviso sopra la terza risposta (164 N4).** `Notif` (`src/11-ui-kit-highlight.jsx:105`) accetta `alto`; `CareerApp` lo passa
  mentre l'intervista è aperta → il toast sta in alto. `toast-247`: verde 0 px² di sovrapposizione coi 3 bottoni (toast a y 16–71),
  rosso 6.389 px² (y 752–807). ✅ Foto `tests/visual/out/toast-247.png`: in alto copre per qualche secondo la riga del punteggio
  sopra la scena dell'intervista (non le risposte).
- **Coppa nazionale sparita dopo il prestito (164 N5).** Verificato nel codice, non toccato (zona G): al trasferimento il turno di
  coppa si ricolloca nel calendario del nuovo club (`src/18-career-app.jsx:5700-5714`); se non trova una settimana libera la coppa
  si chiude con «🏆 Coppa Nazionale: fuori dopo il trasferimento» (`active:false, eliminated:true`). È il comportamento scritto, non
  un guasto; se vada bene che un prestito faccia uscire dalla coppa è una **decisione del PO**.
- **Griglia ⚽ su settimane giocate (165 N6).** La casella legge anche la voce di calendario giocata quando manca quella
  dell'eroe (`src/18-career-app.jsx:8833`, sola lettura, nessun dato scritto). `calendario-247`: verde «1 HAR · c V 3-0 … 5 FOX ·
  c V 1-0», rosso «⚽» su tutte e 5. ✅
- **Riga della Nazionale (165 N7).** Scudo dai colori di `NAT_CLUB_DATA` (Portogallo verde/rosso) e chip «🏳️ Nazionale» nella
  seconda riga, che va a capo (`src/18-career-app.jsx:8626-8640`). Verde: prima riga «▶ vs Portogallo · in casa» intera, scudo col
  verde #006600; rosso: scudo grigio. ✅ (Nel mio rosso la prima riga non risultava troncata a 412 px: il troncamento del collaudo
  dipende dalla lunghezza della riga; il chip comunque non sta più lì.)
- **«FC Kadıköy» (165 N10):** non toccato, decisione del PO.

## Guardiani nuovi o estesi

`conduci-242` · `intervista-231` (braccio Nazionale) · `schede-246` · `giornale-244` · `ingresso-245` · `toast-247` ·
`calendario-247`. Tutti in `package.json` e nella mappa della catena mirata (`ci-runner.mjs`); i tre che giocano partite fra i lenti.

## Catena mirata

`node ci-runner.mjs mirata` sul commit 3b25443 (confronto con `main`: file toccati 07, 09, 11, 12, 13, 14, 15, 17, 18 — la base
`lavoro/167` porta anche i giri 13-15 → 62 passi): **61/62 verdi**, nessun passo «instabile». Registro in `docs/governo/STABILITA.json`.

- ❌ **`giornata-233`**, rosso **mio**: il suo braccio rosso non riconosceva più «1509ª giornata» perché il chip «🏳️ Nazionale»,
  spostato nella seconda riga, si attaccava al numero nel testo della pagina («Nazionale1509ª giornata»: `\b` non scatta fra lettera
  e cifra). Il verde del guardiano non era toccato. **Corretto** (uno spazio dopo il chip, `src/18-career-app.jsx`), ricostruito e
  rilanciato da solo sul build finale: `giornata-233` ✅ (rosso «Nazionale 1509ª giornata» riconosciuto), `calendario-247` ✅,
  `design-system` ✅, `typing-shortcuts` ✅, `test:logic` 43/43 ✅. La catena intera **non** è stata rifatta dopo questo ritocco di
  un carattere di testo: lo dichiaro.
- Verdi fra gli altri, rilevanti per queste modifiche: `fila-227` e `bambini-236` (ingresso), `esiti-218`, `lessico-218`,
  `cross-218`, `gk-dive-sync`, `gk-miss-229`, `goal-postarc`, `partita-vera`, `validate-situations`, `schede-234`,
  `interazioni-226`, `testata-209`, `finestra-230`, `popup-224`, `classifica-102`, `career-critical`, `save-compat`, e i sette
  guardiani di questo giro.
- Durante la catena `griglia-mobile` ha rigenerato le foto di `docs/collaudo-grafico/g0/`: ripristinate, non fanno parte del giro.

## Cosa resta aperto / domande per il PO

1. **PO-245:** il passo dell'ingresso è 6,5 u/s (svelto). Una camminata vera chiede una fila più corta o un ingresso più lungo.
2. **164 N5:** un prestito a metà stagione può far uscire dalla Coppa nazionale («fuori dopo il trasferimento»): va bene così?
3. **PO-246:** i collaudi col pilota automatico dovrebbero armare `__CPM_SCFREEZE_TEST=1`, altrimenti le schede del mister si
   misurano a cronometro che corre.
4. **PO-242:** il gancio `__CPM_FORCE_KIND` agisce dopo la scelta della frase d'esito (`src/15-live-match.jsx:9168`): le sonde che
   forzano l'esito vedono titolo e riga dell'esito naturale. Non l'ho spostato (toccherebbe tutte le sonde che lo usano).
5. BACKLOG e roadmap non aggiornati da questo ramo: nessuna versione spedita (nessun bump), l'integrazione li aggiornerà.
