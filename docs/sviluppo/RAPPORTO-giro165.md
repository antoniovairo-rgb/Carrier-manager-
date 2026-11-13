# Rapporto giro 165 — «Vai al prossimo momento» da professionista

**PO-364 · opzione B del giro 164 (decisione PO «B e C insieme»: qui solo la B; la C è del giro 166, motore partita non toccato)**
Ramo `sviluppo/giro165-momento-pro`, base `sviluppo/giro163-primavera-f3` (828d826). `GAME_VERSION` **non toccata** (7.999.190 nel file).
`SAVE_VERSION` resta 9: **nessun campo nuovo nel salvataggio** (regola pura, il tasto vive solo in memoria).
Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → «IDENTICO BYTE PER BYTE» dopo ogni modifica a `src/`.

---

## 1. Cosa ho misurato prima di cambiare

Sonda del giro 164 (`tests/visual/stagione-pro-164.mjs`, presa dal ramo `collaudo/giro164-stagione-pro`), quattro profili pro,
tre stagioni (la 3 non è rappresentativa: senza coppe, vedi §1 del 164). Ho aggiunto alla sonda **una sola cosa**: per ogni
partita registra anche `posta165(P, voce di calendario)` (campo `p165`) e il tipo di gara (`mdT`), così **prima e dopo si
leggono sulla stessa partita, nello stesso giro**. Conteggio: una partita = una voce (stagione, settimana, giornata, tipo);
le gare della Nazionale escluse da entrambe le colonne, come nel §5 del 164.

- **Prima** = regola §5 del 164: gara non di campionato, oppure `calcMatchWeight ≥ 5`.
- **Dopo** = `posta165` (sotto).

| Profilo (prestigio) | S3 (solo campionato) | **S4** | **S5** |
|---|---|---|---|
| basso-tit (FC Salento, 62) | 0 → 16 su 34 | **3 → 13** su 36 | **4 → 23** su 37 |
| medio-tit (FC Brenvar, 77) | 0 → 14 su 34 | **4 → 20** su 38 | **11 → 27** su 45 |
| alto-tit (Torino Athletic, 95) | 4 → 18 su 34 | **12 → 22** su 45 | **15 → 28** su 44 |
| alto-ris (Torino Athletic, riserva) | 6 → 15 su 34 | **12 → 26** su 45 | **12 → 29** su 45 |

Obiettivo indicativo «almeno 8-12 fermate a stagione anche per un club basso»: **raggiunto** (13-23 sulle stagioni 4-5).
Per i club medio e alto si va **oltre** il 12 (20-29): vedi domanda 2.

Da dove vengono le fermate (stagioni 4-5, giro definitivo): basso S5 «contratto in bilico» 8, «sfida alla capolista» 5,
«lotta salvezza» 3, coppa 3, rivale 2; medio S5 coppa europea 7, coppa 4, scontro diretto 4, capolista 3, «a un gol dai 50» 3;
alto-tit S5 coppa europea 9, corsa al titolo 8; alto-ris S5 contratto in bilico 8, coppa europea 7, coppa 4. Il «contratto in
bilico» compare nella stagione 5 perché i salvataggi sintetici hanno il contratto fino alla 6 (durata 1 nella 5) e la fiducia
del mister è scesa sotto 55.

⚠️ I «prima» di questo giro non coincidono con quelli del 164 (es. basso S5: 4 qui, 1 là): mercato, impulsi e risultati
usano `Math.random`, due giri non giocano la stessa stagione. Il confronto prima/dopo regge perché è sulla stessa partita.

Comandi:
```bash
cd tests/visual
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node stagione-pro-164.mjs basso-tit medio-tit
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node stagione-pro-164.mjs alto-tit alto-ris
```
(Il conteggio l'ho fatto con uno script di appoggio fuori dal repo: deduplica per stagione/settimana/giornata/tipo e conta.)

---

## 2. Cosa ho cambiato

### 2.1 La regola di posta allargata — `posta165(p, md)` (`src/08-panchina-derby-meteo-cori.jsx`, in fondo, righe ~1016-1068)
Funzione **pura** (legge salvataggio e voce di calendario, non scrive, nessun sorteggio). Ritorna l'etichetta della fermata o
`null`. In ordine:
1. gara non di campionato → riusa `partitaChiave163` («🏆 Coppa», «🌍 Coppa europea», «🏳️ Nazionale»);
2. **derby** → l'etichetta del derby (`partitaChiave163`);
3. **ex club** («🔙 Ex club»): una stagione passata in un club diverso da quello di oggi (anche la Primavera da cui vieni), o la
   memoria `ex_club` del mondo;
4. **primo match dopo un infortunio** («🩹»): `justRecovered` e rientro in corso, e nessuna gara giocata da sano dopo lo stop;
5. **traguardi personali** a un passo: 50ª/100ª/150ª… presenza in carriera, a un gol dai 50/100/150… in carriera, record
   stagionale di lega a ≤ 2 gol (stessa fonte della card «Record watch»);
6. **contratto in bilico** («📋»): in scadenza, non rinnovato, dalla settimana 28, fiducia del mister sotto 55;
7. i rami di `calcMatchWeight`: **corsa al titolo** (W28+, fra le prime 4, a ≤ 9 punti), **lotta salvezza** (W25+, ultime 3),
   **finale di stagione** (W37-38);
8. **scontro al vertice / sfida a una delle prime tre** (`partitaChiave163`, la regola della «Prossima» sulla home);
9. **il tuo rivale**;
10. **scontro diretto in classifica** («📊»): dalla settimana 8, al massimo due posizioni e tre punti di distanza.

Le soglie dei punti 5 e 6 (50/100…, fiducia 55) e la finestra del punto 10 sono **mie**: da confermare (domanda 3).

### 2.2 Il tasto da professionista (`src/18-career-app.jsx`)
Non è un tasto nuovo né un quarto percorso: è il meccanismo del giro 163 (`salta163`), che a ogni passo chiama `liveCurrentWeek`,
il prompt della partita + `simulateAndAdvance`, oppure `doAdvanceWeek`. `tripath-chokepoint` verde senza modifiche.
- righe ~1460-1470: `_pro165` (professionista e rosso spento), `_chiave165` (da professionista la fermata «partita» usa
  `posta165`, in Primavera resta `partitaChiave163`), `_rinnovo165` (stesse condizioni della card «Il contratto scade»),
  `_rinnVisto165` (il rinnovo ferma una volta per stagione);
- `_saltaMotivo163`: da professionista il tasto non è più «solo in Primavera»; da svincolato «prima trova una squadra»; col
  confronto del procuratore aperto «chiudi prima la finestra aperta»;
- avvio: la corsa ricorda lo stato di partenza (`ps0`); si ferma se cambia (Primavera → pro come prima, «cambio di stato»);
- **si ferma su**: partita con posta (prompt Gioca/Simula **aperto**, gara non giocata) · **ogni scelta** della settimana (da
  professionista il riquadro con ≥ 2 scelte resta davanti al giocatore, nessuna scelta automatica) · offerta, trattativa,
  procuratore, saga (come il 163) · **rinnovo** (card del contratto in scadenza, una volta per stagione; contratto scaduto) ·
  chiamate della Nazionale · traguardi, momenti di carriera, verifiche del mister, interviste (come il 163) · infortunio nuovo ·
  fine stagione · **qualunque altra finestra in primo piano** (righe ~1525-1530: il velo `.cpm-velo150` — confronto col
  procuratore → «mercato», patto/spogliatoio → «scelta da fare», il resto → «momento importante»);
- card sulla home (righe ~7744-7775): da professionista la card «corsa163» porta **solo il tasto** («⏩ Vai al prossimo momento»,
  `data-g165="pro"`), niente Indice Primavera; il pannello di conferma ha il testo da professionista; il riepilogo ha la voce
  «📋 Rinnovo»;
- harness test-only: `chiave163` da professionista restituisce la posta allargata; nuovo `posta165(q, md)`.

**Rosso `__CPM_NO_G165`**: da professionista il tasto non c'è (comportamento del giro 163). La Primavera non cambia in nessun braccio.

### 2.3 Due difetti trovati dal guardiano e corretti (misura → correzione → rimisura)
1. **La corsa ripartiva sotto il confronto col procuratore.** Il 163 lo fa fermare una volta per settimana; alla ripartenza nella
   stessa settimana la corsa proseguiva con la finestra (non chiudibile) davanti. Misurato al 2° giro del guardiano (tasto coperto
   dal velo `confronto253` a W20). Ora da professionista il tasto è spento con la finestra aperta e la corsa si ferma su ogni
   velo. Rimisura: «veli che coprivano un tasto: []».
2. **Etichetta con «contro» doppio** nell'anteprima («⚔️ Contro il tuo rivale contro AC Dorvelli»): etichette ora «Il tuo
   rivale», «Ex club».

### 2.4 Test e strumenti
- **Nuovo guardiano `npm run momento-165`** (`tests/visual/momento-165.mjs`, in `package.json` e in `ci-runner.mjs` accanto a
  `salta-163`, catena `carriera` e mappe di `src/18` e `src/0[0-8]`).
- `salta-163.mjs`: il controllo 6 «da professionista il tasto non c'è» ora apre la pagina con `__CPM_NO_G165` (è il
  comportamento che quel controllo proteggeva; da professionista con il giro 165 acceso giudica `momento-165`).
- `indice-163.mjs`: il controllo «professionista» guardava la card intera (`corsa163`) mentre il commento dice «niente barra»;
  ora guarda la **barra** (`ip163`), che resta solo in Primavera. Nessuna soglia abbassata.
- `stagione-pro-164.mjs`: aggiunti i campi `p165`, `mdT`, `mdC` per settimana (sonda, non guardiano).

---

## 3. Guardiano `momento-165`

Giudica: la regola (ex club · primo match dopo l'infortunio e non dopo una gara già giocata · 99 presenze → 100ª · 49 gol →
«a un gol dai 50» · contratto in bilico con fiducia 45 e non con 80 · derby · scontro diretto · settimana 38 · coppa · partita
qualunque di metà classifica → null · stessa risposta due volte · salvataggio identico) · il tasto c'è da professionista a
375×812 e a 1280×800 · il primo tocco chiede e non cambia nulla · «Annulla» · **una stagione intera col solo tasto** (FC
Salento, prestigio 62): ogni gara simulata dal tasto era senza posta nell'istante (testimone `__CPM_SALTA153_SIM`), ogni fermata
«partita» lascia il prompt aperto e la gara non giocata, ogni fermata «scelta da fare» lascia davanti il riquadro con ≥ 2 scelte,
**almeno 8 fermate su partite con posta**, W39 con 34 gare di lega, una per settimana, calendario 34/34, classifica a 18, nessun
errore di pagina · rinnovo: fermata «rinnovo» con la card sulla home e non riferma nella stessa stagione · un'offerta ferma
la corsa · nessuno scorrimento orizzontale a 1280 · Primavera invariata (tasto e barra del 163).

| Braccio | Esito |
|---|---|
| verde (build definitivo, tre giri) | **33/33, uscita 0** ogni volta |
| rosso `CPM_ROSSO165=1` (`__CPM_NO_G165`) | 2 rossi (tasto assente → stagione non giocabile), **uscita 1** |

**Tocchi per una stagione da professionista** (misura dichiarata, non giudicata; due giri verdi):

| Giro | Tocchi | Corse del tasto | Fermate | Gare simulate dal tasto |
|---|---|---|---|---|
| 3° | 150 | 49 | 13 partite con posta, 27 scelte, 3 mercato, 5 momenti, 1 intervista | 21 |
| 4° | 148 | 48 | 13 partite con posta, 29 scelte, 2 mercato, 4 momenti | 21 |
| definitivo (dopo il ritocco delle etichette, con le foto) | 129 | 42 | 12 partite con posta, 20 scelte, 7 momenti, 2 interviste, 1 mercato | 22 |

Partite con posta del giro definitivo: scontro diretto 4, sfida alla capolista 4, finale di stagione 2, rivale 1, lotta salvezza 1.
Il conto è dominato dalle **scelte della settimana** (20-29 fermate, ognuna costa tasto + «Vai» + la scelta): vedi domanda 1.
I tocchi contano anche le finestre chiuse dal banco fra due corse (confronto col procuratore 2, finestra230 2).

---

## 4. Catena (un controllo alla volta, `CPM_CI_PAR=0`, memoria libera e disco letti prima di ognuno)

Memoria libera fra 15.181 e 15.525 MB, disco libero 29 GB in tutti i passi. Build `check-src` identico byte per byte.

| Controllo | Esito |
|---|---|
| test:vision | 43/43 |
| test:logic | 51/51 |
| typing-shortcuts | PASS (19 s) |
| tripath-chokepoint | PASS (3 percorsi, tutti i chokepoint) |
| design-system | SISTEMA GRAFICO OK |
| save-compat | PASS (10 s) |
| replay | PASS (46 s) |
| career-invariants | verde |
| stab-nat-trigger | verde |
| career-sim | CARRIERA OK, 2 stagioni |
| career-critical (11 passi, uno alla volta) | 11/11 verdi: recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera |
| salta-163 | verde 19/19 |
| indice-163 | verde 23/23 · rosso `CPM_ROSSO163=1` 3 rossi, uscita 1 |
| griglia-mobile | uscita 0 (235 s) |
| momento-165 | verde 33/33 · rosso 2 rossi, uscita 1 |
| validate-situations | **PASS**, fingerprint 00001505, 0 failure (709 s, in sottofondo con attesa in primo piano dentro il turno) |
| partita-vera | uscita 0, braccio verde, 12 bande su 12 tenute, partite finite 2/2 |

Gli scatti di griglia-mobile in `docs/collaudo-grafico/g0/` li ho riportati com'erano (non fanno parte del giro).
Una prima corsa di `indice-163` sul build definitivo è uscita **rossa** (22/23: «professionista: la card non c'è»): era il
controllo da adeguare descritto al §2.4, rifatta verde e rifatto il braccio rosso.

---

## 5. Foto (`docs/sviluppo/foto-giro165/`, scala 2)
- **prima** (giro 163, `__CPM_NO_G165`): `prima/tasto-telefono-schermo.png` — home da professionista a 375×812, nessun tasto;
- **dopo**, telefono 375×812: `tasto-telefono.png`, `conferma-telefono.png` (pannello con la prossima partita con posta),
  `corsa-telefono.png` (in corsa, «Ferma»), `riepilogo-telefono.png`;
- **dopo**, PC 1280×800: `tasto-pc.png`, `conferma-pc.png`, `riepilogo-pc.png` («Fermato da te»).
  (`*-schermo.png` = schermo intero.)

## 6. Fuori ambito (non fatto)
Opzione C (partite a soli highlight, giro 166) · motore partita · riga di roadmap e bump di versione (li fa la sessione di
rilascio) · il `Math.random` di mercato/impulsi · la stima del tempo di una stagione col tasto (non misurata in questo giro).

## 7. Domande per la sessione madre (nessuna decisa qui)
1. **Scelte della settimana.** Il mandato dice «si ferma a una scelta»: da professionista ogni riquadro con ≥ 2 scelte ferma la
   corsa. Misurato: 20-29 fermate a stagione su 42-49 corse, 129-150 tocchi. In Primavera (163) le scelte di routine si fanno da
   sole con estrazione seedata. Fermare solo sulle scelte «di storia» (mercato, procuratore, mister, `mile`) e scegliere da sole
   le altre come in Primavera?
2. **Quante fermate.** Club basso 13-23, medio 20-27, alto 22-29 partite con posta a stagione (obiettivo «almeno 8-12»). Se il PO
   vuole un tetto, le voci più frequenti sono coppe/coppe europee (tutte), «sfida alla capolista» (1-6), «scontro diretto» (1-7),
   «corsa al titolo» (8 quando si è in testa), «contratto in bilico» (8 nell'ultima stagione di contratto).
3. **Soglie mie:** traguardi a 50/100/150… presenze e gol (10 e 25 esclusi perché arrivano già in Primavera); contratto in
   bilico con fiducia < 55 dalla settimana 28; scontro diretto da W8, ≤ 2 posizioni e ≤ 3 punti; «finale di stagione» vale per
   W37 **e** W38 (come il +3 di `calcMatchWeight`). Vanno bene?
4. **Finestre in primo piano.** La fermata generica legge il DOM (`.cpm-velo150`) dall'effetto della corsa: robusta (prende anche
   finestre nuove) ma non pura. Accettabile, o si preferisce un elenco esplicito di stati?
5. **Primavera.** La correzione «tasto spento col confronto del procuratore aperto» e la fermata sui veli valgono solo da
   professionista (ambito del giro). In Primavera lo stesso caso è possibile se il giocatore ha un procuratore: estenderla?
6. Il rinnovo ferma **una volta per stagione** (alla prima settimana in cui appare la card); dopo, se il giocatore non rinnova,
   la corsa prosegue. Va bene, o deve fermare a ogni corsa finché il contratto non è risolto?
