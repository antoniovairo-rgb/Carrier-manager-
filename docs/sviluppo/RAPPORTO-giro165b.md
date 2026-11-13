# Rapporto giro 165b — «Vai al prossimo momento» da professionista, rifinitura

**PO-364 · 7.999.191 · decisioni PO dell'11/11 sera e della sessione madre**
Ramo `sviluppo/giro165-momento-pro` (sopra bff8562, giro 165). `GAME_VERSION` **non toccata**.
`SAVE_VERSION` resta 9: un solo campo nuovo, **additivo e facoltativo** (`rinnRif165b`, vedi §2.3), assente nei salvataggi vecchi
= «nessun rifiuto»; nessuna migrazione.
Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → «✓ IDENTICO BYTE PER BYTE — 7215786 byte ricomposti da 21 frammenti»
dopo ogni modifica a `src/`.

---

## 1. Misura prima / dopo

Strumento: il guardiano nuovo `momento-165b` (§3), sezione 2 — una stagione intera da professionista (FC Salento, prestigio 62,
stagione 3, W1 → W39) giocata col solo tasto. Il **prima** è il braccio rosso `__CPM_NO_G165B` (= comportamento del giro 165)
sullo stesso build e con lo stesso banco; il **dopo** è il braccio verde. In più il guardiano `momento-165` del giro 165, girato sul
build di partenza (bff8562) prima di toccare qualsiasi cosa, come seconda lettura del «prima».

| Misura (una stagione) | Prima — momento-165 su bff8562 | Prima — rosso `__CPM_NO_G165B` | **Dopo — verde** |
|---|---|---|---|
| Tocchi | 155 | 149 · 149 (build finale) | **93** · 98 (catena) · 92 (momento-165 in catena) |
| Corse del tasto | 50 | 48 · 48 | **30** · 32 · 29 |
| Fermate «scelta da fare» | 25 | 22 · 25 (tutte di routine: tipo «scelta») | **6** · 7 · 6 (tutte di storia) |
| Fermate «partita chiave» | 16 | 13 | 12 |
| Fermate «momento importante» | 5 | 6 | 5 |
| Fermate «intervista» | 3 | 5 | 5 |
| Fermate «mercato» | 1 | 2 | 2 |
| Scelte di routine fatte da sole (estrazione seedata) | — | 0 | **17** |

Dove una casella ha più numeri: prima lettura (fuori catena, build intermedio) · letture del build finale (rosso ripetuto, catena).
Le altre righe sono della prima lettura. Le 6 fermate «scelta da fare» del primo verde, per tipo: seguito 4, offerta 1, intervista 1.

⚠️ Due giri non giocano la stessa stagione (mercato, impulsi e risultati usano `Math.random`, come già scritto nel rapporto 165):
il confronto è fra **due stagioni dello stesso tipo**, non sulla stessa partita. La differenza grande (22-25 → 6 fermate di scelta,
148-155 → 93 tocchi) è ben oltre lo scarto fra le due letture del «prima» (149 contro 155 tocchi).

Classifica statica degli impulsi veri del gioco con almeno due scelte (sezione 1 del guardiano): **50 di storia, 80 di routine**
— storia per tipo: seguito 25, momento di carriera 12, mister 8, procuratore 2, offerta 2, intervista 1.

Comandi:
```bash
cd tests/visual
CPM_CHROME=/opt/pw-browsers/chromium npm run momento-165b                       # verde
CPM_ROSSO165B=1 CPM_CHROME=/opt/pw-browsers/chromium npm run momento-165b       # rosso (deve uscire 1)
CPM_SOLO165B=5 CPM_FOTO165B=../../docs/sviluppo/foto-giro165b CPM_CHROME=/opt/pw-browsers/chromium npm run momento-165b   # foto
```

---

## 2. Cosa ho cambiato (tutto in `src/18-career-app.jsx`, ricomposto in `CARRIER-MANAGER-AV.html`)

Interruttore rosso unico **`window.__CPM_NO_G165B`** (`_g165b()`, riga ~1476): riporta il comportamento del giro 165 per i punti
1, 3 e 4.

### 2.1 Punto 1 — «Solo scelte di storia» (righe ~1477-1487 e ~1558)
- `_storia165b(wl)` — funzione **pura** (legge la finestra della settimana e il catalogo `WEEKLY_IMPULSES`, non scrive, nessun
  sorteggio). `null` = routine; altrimenti il tipo di storia, in quest'ordine:
  1. **seguito** — impulso con `seg` (la seconda puntata di una scelta già fatta, PO-154);
  2. **momento di carriera** — impulso `mile` (esclusa la famiglia «esordio», che il giro 163 ha misurato come routine) o di
     categoria `primopro`/`addio` (questi fermavano già);
  3. **procuratore** — «procurator» nell'id o nel testo;
  4. **offerta** — «prestit/offert/rinnov» nell'id, oppure «offert…» nel testo;
  5. **mister** — «mister» nell'id, oppure «mister/allenator…» nel testo (vale anche per i momenti dello spogliatoio);
  6. **intervista** — «intervist» nell'id.
- Nella corsa (riga ~1558): da professionista, con ≥ 2 scelte, la corsa si ferma («scelta da fare», con `storia:<tipo>` nel
  testimone) **solo se** `_storia165b` dà un tipo; altrimenti la scelta va **alla stessa estrazione seedata della Primavera**
  (`hashStr("ps153|scelta|"+nome+stagione+settimana+impulso)`, fra le scelte che il conto permette) e finisce nell'elenco
  «Scelte fatte da solo» del riepilogo. Mercato (regex già esistente sul testo, `wi_procuratore_push`, `wi_giornalista_mercato`)
  e `primopro`/`addio` continuano a fermarsi prima, com'erano.
- Testimone `__CPM_SALTA153`: ogni fermata porta ora anche `auto` (quante scelte la corsa ha fatto da sola).
- Harness test-only: `__CPM_CAREER.storia165b(wl)`.

### 2.2 Punto 2 — «Nessun tetto»
Nessuna modifica: `posta165` resta com'è.

### 2.3 Punto 3 — Rinnovo «finché non è risolto» (righe ~1488, ~1525, ~7345/7359/7370)
- La fermata «rinnovo» non ha più la memoria «una volta per stagione» (`_rinnVisto165`, che resta solo nel rosso): con la card
  «Il contratto scade» sulla home la corsa si ferma **a ogni corsa**, finché il rinnovo non è firmato (`renewalSeason` = stagione,
  la card sparisce già oggi) o **rifiutato**.
- «Rifiutato» non esisteva nel salvataggio (i pulsanti chiudevano soltanto la trattativa). Ora i tre pulsanti che chiudono la
  trattativa **senza firmare per decisione** scrivono `rinnRif165b = stagione` (`_rifiuta165b`): «Rifiuta» sulla contro-offerta
  del club, «Chiudi» dopo che il club ha respinto la richiesta (senza accettare l'offerta base), «Ho capito» quando il club non
  intende rinnovare. «Annulla» al primo passo **non** è un rifiuto (il rinnovo resta aperto). Il campo si scrive solo da
  professionista, con contratto non scaduto e rosso spento. La card sulla home resta (il giocatore può ancora firmare).
- Harness test-only: `__CPM_CAREER.rifiuta165b()`.

### 2.4 Punto 4 — Primavera (righe ~1496 e ~1548)
- Tasto spento («chiudi prima la finestra aperta») col confronto del procuratore aperto: ora anche in Primavera.
- Fermata su qualunque finestra col velo (`.cpm-velo150`) letta nel DOM: ora anche in Primavera.
- Il resto della Primavera (scelte seedate, fermate del 163) non cambia.

### 2.5 Punto 5 — Soglie del 165 e fermata sul velo
Nessuna modifica (traguardi 50/100/150, contratto in bilico con fiducia < 55 da W28, scontro diretto da W8, lettura del velo nel DOM).

---

## 3. Guardiano nuovo `npm run momento-165b` (`tests/visual/momento-165b.mjs`)

In `package.json` e in `ci-runner.mjs` accanto a `momento-165` (catena `carriera`, mappe di `src/18` e `src/0[0-8]`).
Sezioni (`CPM_SOLO165B=1,2,…` per girarne solo alcune):
1. **Classifica** (pura) sugli impulsi veri: seguito → storia · `wi_procuratore_push` → procuratore · `wi_figlia_mister` → mister ·
   `wi_intervista_sorpresa` → intervista · `wi_prestito_inverno` → offerta · `wi_pro_firma` → momento di carriera · auto di lusso,
   padel, cena di squadra → routine, e stessa risposta due volte · spogliatoio senza mister → routine, col mister → mister · il
   salvataggio non cambia.
2. **Stagione da professionista** col solo tasto: ogni fermata «scelta da fare» è di storia e lascia la scelta davanti · almeno
   una scelta di routine fatta da sola · W39 · 34 gare di lega, una per settimana · nessun errore di pagina. Dichiara tocchi, corse,
   fermate per tipo.
3. **Rinnovo**: due corse di fila → due fermate «rinnovo» con la card sulla home · rifiuto dal **pulsante vero** della trattativa
   (Negozia → «Chiedi +30%» → Rifiuta / Chiudi / Ho capito; il gancio `rifiuta165b` solo se il club accetta subito) → la corsa
   successiva non si ferma più sul rinnovo.
4. **Primavera**: col confronto del procuratore aperto il tasto è spento · una finestra col velo che compare durante la corsa la
   ferma (la sonda inserisce un velo `data-cpm="prova165b"`: il gioco non lo produce a comando in Primavera).
5. Foto (solo con `CPM_FOTO165B`).

| Braccio | Esito |
|---|---|
| verde, sezioni 1·3·4 | **16/16**, uscita 0 |
| verde, sezione 2 | **6/6**, uscita 0 (150 s) |
| rosso `CPM_ROSSO165B=1`, tutte le sezioni | **16 verdi, 6 rossi, uscita 1**: 22 fermate di routine · 0 scelte fatte da sole · seconda corsa ferma su «scelta da fare» invece che «rinnovo» · rinnovo non risolvibile (finestra davanti) · Primavera: tasto acceso col confronto aperto · Primavera: il velo non ferma (fermata «partita chiave») |

### 3.1 Adeguato `momento-165`
Il controllo «ripartendo, il rinnovo non riferma nella stessa stagione» proteggeva il comportamento del giro 165, che dal 165b vive
nel rosso: la pagina di quel controllo si apre ora con `__CPM_NO_G165B` (stessa scelta fatta per `salta-163` nel giro 165).
Nessuna soglia abbassata; il nuovo comportamento lo giudica `momento-165b` §3.

### 3.2 Riparato `salta-163` (guardiano instabile, trovato dalla catena)
Alla prima corsa della catena `salta-163` è uscito **rosso** (18/19): «saga già consegnata (senza card): nessuna fermata
«mercato»» → `["mercato"]`. Misurato in isolamento (sonda fuori dal repo, stessa scena: Primavera, W6, saga consegnata), 3 corse verdi + 2 rosse 165b, poi 6 verdi:
la fermata «mercato» compare **1 volta su 3 (prima sonda) e 1 su 6 (seconda)** nel verde, quando nella settimana esce un
**impulso di mercato** estratto a caso (prima sonda: finestra «Impulso della settimana» aperta al momento della fermata;
seconda sonda, col testimone riparato: `chi:"impulso wi_procuratore"`) —
regola del giro 163 (`_mk` sul testo dell'impulso), non toccata da questo giro e non legata alla saga. Il controllo non
distingueva le due sorgenti. (Le 2 corse col rosso 165b si sono fermate su «intervista»: non provano né smentiscono il
caso, che è un sorteggio.)
- Gioco: la fermata «mercato» da impulso porta ora nel testimone `chi:"impulso <id>"` (`src/18`, riga ~1557; solo il testimone
  e `saltaFine163`, il riepilogo non lo mostra).
- Guardiano: il controllo giudica solo la fermata «mercato» **senza** `chi` d'impulso (quella della saga). Nessuna soglia cambiata.
- Rimisura: 6 corse sulla stessa scena → 1 «mercato» con `chi:"impulso wi_procuratore"`, 5 altre fermate; il controllo
  riparato le passa tutte e boccerebbe una fermata dovuta alla saga.

---

## 4. Catena (uno alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` registrati prima di ogni passo)

Memoria libera (colonna «free») fra 13.075 e 13.454 MB, disco libero 29 GB in tutti i passi. Build `check-src` identico byte per
byte (7.215.963 byte). Esecutore: script di appoggio fuori dal repo (un passo per volta, `CPM_CI_PAR=0`, `free -m` e `df -h` scritti
nel registro prima di ogni passo), lanciato dentro il turno con attese in primo piano.

**Prima corsa — annullata.** Arrivata fino a `momento-165` sul build intermedio: tutto verde tranne `salta-163` (18/19, vedi §3.2).
Dopo la riparazione il build è cambiato, quindi la corsa non vale ed è stata **fermata e rifatta da capo** sul build finale.

**Seconda corsa (build finale, tutta verde):**

| Controllo | Esito |
|---|---|
| test:vision | 43/43 |
| test:logic | 51/51 |
| typing-shortcuts | PASS (16 s) |
| tripath-chokepoint | PASS (3 percorsi, tutti i chokepoint) |
| design-system | SISTEMA GRAFICO OK |
| save-compat | PASS, 12 pass · 0 fail (11 s) |
| replay | PASS (47 s) |
| career-invariants | tutti gli invarianti tengono, 0 pageerror |
| stab-nat-trigger | verde |
| career-sim | CARRIERA OK, 2 stagioni |
| career-critical (11 passi in catena `&&`) | uscita 0 = 11/11 (710 s) |
| salta-163 | **19/19** (dopo la riparazione §3.2) |
| indice-163 | 23/23 |
| momento-165 | 33/33 — stagione: 92 tocchi, 29 corse, fermate {partita chiave 13, momento importante 7, scelta da fare 6, intervista 2, mercato 1} |
| momento-165b | **22/22** — stagione: 98 tocchi, 32 corse, fermate {partita chiave 13, scelta da fare 7, momento importante 6, mercato 3, intervista 3}; storie {seguito 4, mister 2, offerta 1} |
| griglia-mobile | uscita 0, 14 schermate × 5 larghezze (217 s) |
| validate-situations | **PASS**, fingerprint 00001505, 0 failure (673 s) |
| partita-vera | uscita 0, braccio verde, 12 bande su 12 tenute, partite finite 2/2 (379 s) |

**Braccio rosso di `momento-165b` sul build finale** (`CPM_ROSSO165B=1`): 16 verdi, **6 rossi, uscita 1** — 25 fermate di
routine (tipo «scelta»), 0 scelte fatte da sole, seconda corsa ferma su «scelta da fare» invece che «rinnovo», rinnovo non
risolvibile, Primavera: tasto acceso col confronto aperto, velo che non ferma. Stagione del rosso: 149 tocchi, 48 corse.

Gli scatti che `griglia-mobile` riscrive in `docs/collaudo-grafico/g0/` (e cinque `prepartita.png` nuovi) li ho riportati com'erano:
non fanno parte del giro.

---

## 5. Foto (`docs/sviluppo/foto-giro165b/`, scala 2)
Riepilogo della corsa da professionista con le scelte fatte da sole, finestre chiuse:
- telefono 375×812: `riepilogo-telefono.png` (fermata «Momento importante», «Scelte fatte da solo: sett. 3 «🏥 Ci vado con i
  regali» · sett. 4 «🙈 Non mi immischio»»), `riepilogo-telefono-schermo.png`;
- PC 1280×800: `riepilogo-pc.png`, `riepilogo-pc-schermo.png`.

## 6. Fuori ambito (non fatto)
Riga di roadmap e bump di versione (sessione di rilascio) · motore partita · `posta165` e le sue soglie · il `Math.random` di
mercato/impulsi.

## 7. Domande per la sessione madre (nessuna decisa qui)
1. **Confine storia/routine.** La classifica è mia (§2.1): seguiti, mister, procuratore, offerte, interviste, momenti di carriera.
   Restano **routine** (scelte da sole) per esempio gli sponsor (`wi_sponsor*`, categoria «opportunità»), la beneficenza, il
   compagno che litiga (`wi_compagno_lite`), il tifoso fisso, le scommesse. Va bene, o qualche famiglia va spostata fra le storie
   (es. gli sponsor come «offerte»)?
2. **«Mister» letto dal testo.** Un impulso o un momento dello spogliatoio il cui testo nomina «mister/allenatore» ferma la corsa
   (8 impulsi). Alcuni sono di routine nel tono (es. giornata libera concessa dal mister, `wi_giornata_libera`; allenamento sotto la
   pioggia, `wi_pioggia_scelta`). Si preferisce un elenco esplicito di id?
3. **Cosa vale come «rifiuto» del rinnovo.** Oggi: «Rifiuta» (contro-offerta), «Chiudi» (richiesta respinta, offerta base non
   presa), «Ho capito» (il club non rinnova). «Annulla» al primo passo non vale. Dopo un rifiuto la card resta sulla home e il
   giocatore può ancora firmare; la corsa non lo ferma più in quella stagione (a fine stagione, se scaduto, il tasto è spento con
   «prima trova una squadra», come nel 165). Va bene?
4. **Rinnovo che ferma a ogni corsa.** Se il giocatore non risponde, ogni tocco del tasto si ferma subito su «📋 Rinnovo» senza far
   avanzare nulla. È la lettura letterale di «finché non è risolto»: va bene così, o il tasto deve essere spento con un motivo
   («prima rispondi al rinnovo»)?
