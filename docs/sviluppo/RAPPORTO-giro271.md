# Rapporto giro 271 — riparazione di `portiere-252`, `esiti-241` e `validate-situations`

Ramo `sviluppo/giro271-portiere252-esiti`, partito da `lavoro/197` (7.999.197, d207a0e, contiene il giro 265).
`GAME_VERSION` non toccata. **Nessun file di `src/` toccato**: le tre cause misurate stanno negli strumenti, non nel gioco
(quindi nessun `window.__CPM_NO_G271`: non c'è una correzione del gioco da spegnere). `CARRIER-MANAGER-AV.html` invariato
(`build-src` + `check-src`: IDENTICO BYTE PER BYTE).

«Base» in tutto il rapporto = copia separata al commit **9ad0bd6**, il primo genitore dell'unione del giro 265 (cioè
`lavoro/197` senza il 265). «Attuale» = `lavoro/197` col 265 + questo giro.

## A) `portiere-252`: perché il braccio rosso non cadeva più

### Misura prima

Braccio rosso da solo (`CPM_SOLO=rosso`, dettagliato) sul ramo attuale: 0 KO su 5 giudicati, e in **tutte** le scene il
portiere all'armo del gesto sta a **x 47** (mondo), l'arco di tiri e punizioni finisce a **x 42-46,5**: il pallone si
ferma *prima* del piano del portiere. Il difetto che il rosso deve rimettere (lato e bersaglio del tuffo decisi sul punto
d'arrivo dell'arco invece che sul punto in cui il pallone gli passa) esiste solo se il pallone **attraversa** quel piano:
solo allora i due punti possono cadere da lati opposti del portiere. Col portiere dietro l'arrivo dell'arco i due punti
coincidono (testimone `__CPM_GKACT.d148`: `zq` = `zp` in tutte le scene) e il difetto non può nascere.

### Bisezione (fatta: 11 commit provati, storia approfondita con `git fetch --deepen`)

Stessa scena (gi13 punizione da x 88, y 14, braccio rosso) commit per commit:

| commit | portiere all'armo | esito del rosso |
|---|---|---|
| 4e9b715a — unione giro 148 (ultimo verde scritto nei rapporti: rosso 2 KO su 9) | x 41 | **KO 2 su 2** («verso») |
| 30e67ca9 — rilascio 7.999.191 | x 41 | — |
| 5a2b17e6 — unione giro 174 | x 41 | — |
| **878cc43c — unione giro 175 «partita riproducibile»** | **x 47** | KO 0 |
| f67cc49a, 501dbe38, 9c1275fa (192), f986f1a4 (194), 704570a8, 6b0ee486 (195), 61521914 (196), 9ad0bd6 (base) | x 47 | KO 0 |

**Causa.** Negli highlight il portiere sta alla x con cui è nato al calcio d'inizio (x logica 94 ± 4, tetto 97). Fino al
giro 174 quello scarto era `Math.random`, cioè il **seme fisso della sonda** (giro 111): usciva 91 (mondo 41), *davanti*
all'arrivo dell'arco. Il giro 175 ha legato lo scarto dei ventidue al **seme della partita** (avversario + stagione +
settimana + nome): nella partita «Validator» del banco esce 97 (mondo 47), *dietro* l'arrivo dell'arco.
Controprova sul ramo attuale: con `__CPM_NO_G175` il portiere torna a x 41 e il rosso torna a cadere (KO 2 su 2, gi13
angolato). Quindi: **il difetto non è stato tolto da un giro successivo e il rosso non spegne la cosa sbagliata**; è la
scena del banco che non mette più il portiere dove il difetto può nascere. Il giro 265 non c'entra (stessa misura con
`__CPM_NO_G265` e sulla base).

### Riparazione (solo strumento: `portiere-252.mjs`, `lib/scena-252.mjs`)

- Le 11 scene storiche girano in una partita il cui seme fa nascere il portiere ospite **avanzato** (nome «Portiere C» →
  x logica 91; di riserva «Portiere D», 91). È la geometria su cui il guardiano era stato tarato fino al giro 148. Il gioco
  non cambia: la sonda sceglie la partita, come già sceglieva il punto di partenza dell'eroe (giro 138).
- **La precondizione si legge dove nasce**: x del portiere all'armo del gesto (`d148.gx` ≤ 42,5). Letta prima della scena non
  basta (la partita scorre mentre la pagina carica: in esplorazione, in 1 scena su 22 nessuno dei tre nomi dava il portiere
  avanzato alla lettura fatta prima della scena). Se all'armo non è avanzato si riprova col nome successivo (3 pagine al più:
  nella corsa completa è servita la seconda pagina in 3 scene su 28); finiti i nomi la scena è **non giudicata col motivo
  scritto**, e conta.
- Tre scene in più **col portiere sulla linea** (partita «Validator»: gi13 fuori, gi13 parata, gi67 gol), per non perdere
  quella geometria nel braccio verde.
- Minimo di portieri giudicati nel verde alzato da 4 a **8** (misurati 11 su 14; prima della riparazione erano 5 su 11).
  Nessuna soglia abbassata, criterio `analizzaPortiere` invariato.
- `lib/scena-252.mjs`: `pagina252` accetta le opzioni di `openMatch` (quarto argomento, facoltativo: gli altri dieci
  script che la usano non cambiano).

### Misura dopo

| | prima (attuale e base) | dopo |
|---|---|---|
| braccio rosso | 0 KO su 4-5 giudicati | **2 KO su 11** (gi13@88,14 fuori e parata, «verso l'opposto») |
| braccio verde | 0 KO su 5 giudicati (6 scene su 11 non giudicate) | **0 KO su 11 giudicati** (3 non giudicate: «bruciapelo < 0,2 s», come nel giro 148) |
| portiere all'armo | x 47 | x 41-41,3 nelle 11 scene avanzate · x 45,2-47 nelle 3 sulla linea |
| durata | ~9 min | ~14 min (14 scene per braccio) |

**`portiere-252` non è superato da `portiere-223`/`portiere-265`**: quei due giudicano il tiro *sbagliato* col portiere
sul suo punto; `portiere-252` giudica parata e gol col pallone che attraversa il piano di un portiere avanzato, e il suo
rosso (`__CPM_NO_GK252` + `__CPM_NO_PARATA258`) è l'unico che rimette quel difetto. Resta.

## B) `esiti-241` e `validate-situations`: instabilità

### B1 — `esiti-241`

**Misura: 5 corse sulla base + 5 sull'attuale, alternate, una alla volta** (registro `giro271/serie-esiti271.txt`):
**10 verdi su 10** (317-339 s l'una). Il rosso del giro 265 («rosso G102: 0 consegne in area col portiere in tuffo su 2»)
**non si è ripresentato**. Non dipende dal 265.

Lo strumento ora stampa quanto tempo di scena ha davvero osservato: sempre 7,0-7,3 s di scena in 11-16 s reali (4,2-4,3 nelle
scene corte). La finestra non è il problema.

**Causa trovata (probabilistica).** Le scene della parte B corrono con «esito naturale». Su 60 consegne riuscite di
gi14/gi16, **4 non sono uscite «chance» ma «assist»** (il motore ha deciso il gol del compagno: `giocaScena`, giro 93;
3 su 20 nel braccio `__CPM_NO_G102`). Quella scena non è la consegna che rimbalza in area: nel braccio G102 non può
mostrare il difetto, nel braccio rosso toglie una contraddizione. Il momento in cui la sonda forza la scena dipende dai
tempi di caricamento, e con lui lo stato del motore: per questo cambia da una corsa all'altra. Nella corsa 5 sulla base
è successo due volte nella stessa corsa (braccio rosso gi14, braccio G102 gi16): verde per un sorteggio. Due sorteggi
così nello stesso braccio danno esattamente «0 su 2».
Non posso dimostrare che il rosso del 265 sia stato questo (non l'ho riprodotto): è l'unica sorgente di instabilità che
ho misurato.

**Riparazione (solo strumento, `esiti-241.mjs`). Ripetizione dichiarata:** una scena della parte B che non esce «chance»
si rifà su una pagina nuova, fino a 3 pagine; si giudica la prima uscita «chance». Nel braccio verde anche le pagine
scartate passano dal classificatore (una contraddizione lì è rossa lo stesso). Tre pagine senza «chance» = scena non
giudicata = rosso, col motivo. Braccio e motivo stampati per ultimi (regola PO-311). Soglie invariate.
Prova dello strumento (`CPM_SCARTA271=1`: la prima pagina di ogni scena si scarta): 9 pagine scartate (2 delle quali
«assist» vere, capitate da sole), ogni scena rifatta, verdetto verde col rosso visto — registro `giro271/esiti271-scarta.txt`.

### B2 — `validate-situations` (`post-highlight`, «gi0: salto camera 41,9 > 30»)

**Misura: 5 corse per parte, alternate** (registri `giro271/serie-gate271-blocco1.txt`, `giro271/catena271-1.txt`):

| | corse | rosse | motivo |
|---|---|---|---|
| base (senza 265) | 5 | **1** (la 2ª) | gi0, salto camera 45,3 |
| attuale (col 265), campionatore com'era | 5 | **2** (2ª e 3ª) | gi0, salto camera 42,4 e 41,9 |

Nella 5ª corsa attuale il salto c'era (42,2 u) ma la coppia di campioni era mal spaziata (259 ms) ed è stata scartata:
verde per caso. Sempre gi0, sempre 41,9-45,3 u, mai uno stacco nero vivo nella finestra. **Rosso anche sulla base: non
è il giro 265.**

**Causa (misurata con la sonda nuova `misura-271.mjs`: pagina nuova per prova, registratore di fotogrammi dentro la
pagina, 17 prove con esito fallito su gi0).** Sul banco lo stacco di scena è spento. Alla forzatura di gi0 l'eroe salta
al suo punto (40; 6,1), mentre il pallone — se in quel fotogramma non c'è un nero vivo — **ci arriva viaggiando** dalla
scena precedente (≈ 47 u, circa un secondo di scena). Il campionatore risolveva l'azione dopo **600 ms fissi**: in 10
prove su 17 il pallone era ancora in viaggio, a 30-40 u dall'eroe. Con esito fallito la camera del giro 241 («dietro
l'eroe sulla retta pallone→eroe») finisce allora dall'altra parte del campo, dietro la porta (x 52,5): stacco d'esito di
**41,7-49,2 u**; col pallone ai piedi lo stesso stacco è **8,6-9,8 u** (gol: 3,8-4,4). Il rosso esce quando capitano
insieme esito naturale fallito e pallone in viaggio.
Nel gioco fra l'apertura della scena e la scelta passano introduzione e movimento: il giocatore non può scegliere col
pallone in viaggio. È un artefatto dello strumento (regola PO-311: «si attende un evento, mai un tempo fisso»).

**Riparazione (solo strumento: `lib/harness.mjs` `samplePostHighlight`, `validate-situations.mjs`,
`checks/post-highlight.mjs`).** Prima di risolvere si aspetta l'**evento** «pallone fermo» (600 ms di quiete, tetto 6 s);
se il tetto scade la scena è **non giudicata = rosso** (issue del check, non avviso). Soglia 30 invariata, finestra e
campioni invariati. Il gate stampa per ogni scena la sequenza dei passi di camera (intervallo, passo, stacco, fase): un
rosso si legge dal registro. `CPM_PH_APRI=0` rimette l'attesa fissa (braccio rosso dello strumento).

**Misura dopo, col campionatore del gate su pagina nuova** (`CPM_MODO=gate node misura-271.mjs`, gi0 con esito fallito,
8 prove per braccio — registro `giro271/misura271-strumento.txt`):

| | salti scoperti > 30 | salto scoperto più grande |
|---|---|---|
| attesa fissa (com'era) | **1 su 8** (42,0) | 42,0 |
| evento (riparato) | **0 su 8** | 1,9 |

Sulle sei scene del check (2 prove l'una): 0 salti su 12, pallone fermo dopo 0,8-2,5 s, nessuna apertura al tetto.

**Serie dopo la riparazione, sull'attuale, una alla volta** (registri `giro271/catena271-1.txt` e `catena271-2.txt`):

| controllo | corse | verdi | rosso visto |
|---|---|---|---|
| `validate-situations` (14 categorie su 14) | 5 | **5 su 5** (845-869 s) — gi0: pallone fermo dopo 0,78-1,08 s, salto scoperto 0,4-0,9; lo stacco d'esito (7,6-8,8 u) cade dentro il nero | sì: lo stesso gate con `CPM_PH_APRI=0` (attesa fissa) è rosso 2 corse su 5, e sulla base 1 su 5 |
| `esiti-241` | 5 | **5 su 5** (313-349 s) — in 2 corse una scena uscita «assist» (gi16, una volta nel braccio G102 e una nel rosso) è stata scartata e rifatta | sì, in ogni corsa: rosso A 2/2 · 16/16 · tiro, rosso B 2/3 (2 corse) o 3/3 (3 corse), rosso C 0/2, rosso G102 2/2 |

## C) Righe doppie nella mappa mirata di `tests/visual/ci-runner.mjs` (dubbio 7 del 265) — **non ho scelto**

`MAPPA` (righe 25-93 del file) è letta con `MAPPA.find(...)`: per ogni file toccato **vale solo la prima riga** che lo
riconosce. Le doppie non riguardano solo `src/12`/`src/13`: tutte le chiavi tranne `src/19`, `src/03`, `src/04` sono
ripetute. Per ogni chiave: riga usata, righe ignorate e differenze. Tutti i guardiani «in più» esistono come script in
`package.json`. Non ho modificato il file.

**/src\/12-|src\/13-/** — 12 righe (vale la riga 26, 76 guardiani; unione di tutte: 84; presenti solo in righe non usate: `coreografie-252`, `avvio-233`, `camera-241`, `salienti-246`, `pelle-240`, `notte-206`, `ingresso-206`, `tpose-196`)

| riga | guardiani | mancano rispetto alla riga usata | in più rispetto alla riga usata |
|---|---|---|---|
| 26 (usata) | 76 | — | — |
| 27 | 73 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` | `coreografie-252` |
| 31 | 72 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` | nessuno |
| 34 | 71 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` `coreografie-244` `salienti-243` | `avvio-233` |
| 35 | 74 | `portiere-265` `rigorista-257` `formazioni-262` | `camera-241` |
| 36 | 74 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` | `coreografie-252` `camera-241` |
| 39 | 73 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` | `camera-241` |
| 42 | 72 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` `coreografie-244` `salienti-243` | `avvio-233` `camera-241` |
| 45 | 71 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` `coreografie-244` `salienti-243` | `camera-241` |
| 48 | 73 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` `coreografie-244` | `salienti-246` `camera-241` |
| 49 | 72 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` `coreografie-244` `salienti-243` | `pelle-240` `camera-241` |
| 56 | 67 | `portiere-265` `rigorista-257` `formazioni-262` `tunnel-245` `coreografie-244` `salienti-243` `guardalinee-222` `dribbling-226` `tocco3d-219` `lotteria-191` `piazzato-204` `pullman-204` | `notte-206` `ingresso-206` `tpose-196` |

**/src\/14-/** — 9 righe (vale la riga 28, 29 guardiani; unione di tutte: 32; presenti solo in righe non usate: `rigorista-249`, `rigorista-257`, `patto-238`)

| riga | guardiani | mancano rispetto alla riga usata | in più rispetto alla riga usata |
|---|---|---|---|
| 28 (usata) | 29 | — | — |
| 32 | 31 | nessuno | `rigorista-249` `rigorista-257` |
| 37 | 29 | nessuno | nessuno |
| 40 | 30 | nessuno | `rigorista-249` |
| 43 | 29 | nessuno | nessuno |
| 46 | 30 | nessuno | `patto-238` |
| 50 | 29 | nessuno | nessuno |
| 57 | 27 | `rigore-191` `piazzato-204` | nessuno |
| 81 | 26 | `rigore-191` `piazzato-204` `gol-eroe-154` | nessuno |

**/src\/15-/** — 15 righe (vale la riga 29, 71 guardiani; unione di tutte: 91; presenti solo in righe non usate: `forma-239`, `rigorista-249`, `rigorista-257`, `camera-241`, `avvio-233`, `patto-238`, `salienti-246`, `salienti-253`, `scelte-197`, `rassegna-202`, `rassegna-224`, `anteprima-230`, `ingresso-206`, `riserva2d-205`, `avviso3d-209`, `simula-215`, `solo-highlight-166`, `momento-173`, `riproduci-175`, `riproduci-187`)

| riga | guardiani | mancano rispetto alla riga usata | in più rispetto alla riga usata |
|---|---|---|---|
| 29 (usata) | 71 | — | — |
| 30 | 71 | `coerenza-235` | `forma-239` |
| 33 | 72 | `coerenza-235` | `rigorista-249` `rigorista-257` |
| 38 | 71 | `coerenza-235` | `camera-241` |
| 41 | 71 | `coerenza-235` | `rigorista-249` |
| 44 | 69 | `coerenza-235` `accessibilita-234` `salienti-243` | `avvio-233` |
| 47 | 69 | `coerenza-235` `accessibilita-234` `salienti-243` | `patto-238` |
| 51 | 72 | `coerenza-235` | `salienti-246` `salienti-253` |
| 52 | 63 | `coerenza-235` `accessibilita-234` `rassegna-232` `salienti-229` `salienti-243` `barra-221` `tabellone-214` `rassegna-200` `piazzato-204` | `scelte-197` |
| 53 | 69 | `coerenza-235` `accessibilita-234` `salienti-229` `salienti-243` `barra-221` `tabellone-214` `piazzato-204` | `rassegna-202` `rassegna-224` `anteprima-230` `ingresso-206` `riserva2d-205` |
| 54 | 70 | `coerenza-235` `accessibilita-234` `salienti-229` `salienti-243` `barra-221` `tabellone-214` `piazzato-204` | `rassegna-202` `rassegna-224` `anteprima-230` `riserva2d-205` `avviso3d-209` `simula-215` |
| 55 | 62 | `coerenza-235` `accessibilita-234` `rassegna-232` `salienti-229` `salienti-243` `barra-221` `tabellone-214` `rassegna-200` `piazzato-204` | nessuno |
| 58 | 60 | `coerenza-235` `accessibilita-234` `rassegna-232` `salienti-229` `salienti-243` `barra-221` `tabellone-214` `rassegna-200` `rigore-191` `lotteria-191` `piazzato-204` | nessuno |
| 82 | 61 | `coerenza-235` `accessibilita-234` `rassegna-232` `salienti-229` `salienti-243` `barra-221` `tabellone-214` `rassegna-200` `rigore-191` `lotteria-191` `piazzato-204` `nomi-182` | `solo-highlight-166` `momento-173` |
| 83 | 62 | `coerenza-235` `accessibilita-234` `rassegna-232` `salienti-229` `salienti-243` `barra-221` `tabellone-214` `rassegna-200` `rigore-191` `lotteria-191` `piazzato-204` `nomi-182` | `riproduci-175` `riproduci-187` `solo-highlight-166` |

**/src\/05-|src\/09-/** — 6 righe (vale la riga 59, 15 guardiani; unione di tutte: 16; presenti solo in righe non usate: `classifica-259`)

| riga | guardiani | mancano rispetto alla riga usata | in più rispetto alla riga usata |
|---|---|---|---|
| 59 (usata) | 15 | — | — |
| 60 | 15 | `forma-239` | `classifica-259` |
| 62 | 13 | `forma-239` `nomi-251` | nessuno |
| 64 | 12 | `forma-239` `nomi-248` `nomi-251` | nessuno |
| 73 | 12 | `forma-239` `nomi-248` `nomi-251` | nessuno |
| 84 | 12 | `forma-239` `nomi-248` `nomi-251` | nessuno |

**/src\/1[17]-/** — 10 righe (vale la riga 61, 38 guardiani; unione di tutte: 44; presenti solo in righe non usate: `coerenza-235`, `tunnel-245`, `avvio-233`, `patto-238`, `salienti-253`, `salienti-246`)

| riga | guardiani | mancano rispetto alla riga usata | in più rispetto alla riga usata |
|---|---|---|---|
| 61 (usata) | 38 | — | — |
| 63 | 39 | nessuno | `coerenza-235` |
| 65 | 38 | `nomi-248` | `tunnel-245` |
| 67 | 37 | `nomi-248` | nessuno |
| 69 | 37 | `nomi-248` `accessibilita-234` | `avvio-233` |
| 71 | 37 | `nomi-248` `accessibilita-234` | `patto-238` |
| 74 | 39 | `nomi-248` | `salienti-253` `salienti-246` |
| 76 | 36 | `nomi-248` `accessibilita-234` | nessuno |
| 79 | 32 | `nomi-248` `accessibilita-234` `calendario-218` `figurina-199` `spogliatoio-182` `nomi-182` | nessuno |
| 85 | 32 | `nomi-248` `accessibilita-234` `calendario-218` `figurina-199` `spogliatoio-182` `nomi-182` | nessuno |

**/src\/18-|src\/16-|src\/10-/** — 9 righe (vale la riga 66, 92 guardiani; unione di tutte: 105; presenti solo in righe non usate: `rigorista-249`, `rigorista-257`, `offerta-249`, `avvio-233`, `patto-238`, `rinnovo-238`, `salienti-246`, `serata-261`, `pelle-240`, `presentazione-225`, `scelte-201`, `interviste-183`, `solo-highlight-166`)

| riga | guardiani | mancano rispetto alla riga usata | in più rispetto alla riga usata |
|---|---|---|---|
| 66 (usata) | 92 | — | — |
| 68 | 90 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` | `rigorista-249` `rigorista-257` `offerta-249` |
| 70 | 86 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` `accessibilita-234` `salienti-243` | `avvio-233` |
| 72 | 87 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` `accessibilita-234` `salienti-243` | `patto-238` `rinnovo-238` |
| 75 | 88 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` | `salienti-246` |
| 77 | 88 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` `accessibilita-234` `salienti-243` | `serata-261` `pelle-240` `presentazione-225` |
| 78 | 79 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` `accessibilita-234` `interviste-211` `patto-227` `salienti-229` `salienti-243` `calendario-218` `rosa-228` `pullman-204` `rifiniture-200` | `scelte-201` |
| 80 | 72 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` `accessibilita-234` `interviste-211` `patto-227` `salienti-229` `salienti-243` `calendario-218` `rosa-228` `agente-198` `pullman-204` `svincolato-198` `home-199` `figurina-199` `rifiniture-200` `nomi-182` `momento-185` `gioca-188` | `interviste-183` |
| 86 | 67 | `pulsanti-263` `primavera-260` `podio-260` `store-236` `coerenza-235` `accessibilita-234` `interviste-211` `patto-227` `salienti-229` `salienti-243` `calendario-218` `rosa-228` `agente-198` `pullman-204` `svincolato-198` `home-199` `figurina-199` `rifiniture-200` `nomi-182` `indice-163` `salta-163` `momento-165` `momento-165b` `momento-173` `momento-185` `gioca-188` | `solo-highlight-166` |

**/src\/0[0-8]-/** — 3 righe (vale la riga 90, 33 guardiani; unione di tutte: 36; presenti solo in righe non usate: `coerenza-235`, `interviste-183`, `intervista-231`)

| riga | guardiani | mancano rispetto alla riga usata | in più rispetto alla riga usata |
|---|---|---|---|
| 90 (usata) | 33 | — | — |
| 91 | 33 | `nomi-251` | `coerenza-235` |
| 92 | 28 | `nomi-248` `nomi-251` `accessibilita-234` `interviste-211` `spogliatoio-182` `indice-163` `momento-185` | `interviste-183` `intervista-231` |

Lettura dei numeri (senza scegliere): per `src/12|13` la riga usata (26) è la più lunga, ma **8 guardiani stanno solo
in righe ignorate**: `coreografie-252`, `avvio-233`, `camera-241`, `salienti-246`, `pelle-240`, `notte-206`,
`ingresso-206`, `tpose-196`. Oggi chi tocca `src/12` e lancia la mirata non li esegue (tutti e 8 sono nella catena
`completa`). Per le altre chiavi i guardiani nella stessa condizione sono elencati in testa a ogni tabella; due di loro
(`momento-173`, `interviste-183`) non stanno nemmeno nella `completa`.
Le alternative che vedo, da decidere: (a) tenere la riga usata e togliere le altre; (b) sostituirla con l'unione di tutte
(84 guardiani per `src/12|13`); (c) unione meno i guardiani che la madre ha tolto apposta in qualche unione (non so
distinguerli da quelli persi: i commit «catene, rimesse … perse nell'unione» dicono che almeno una parte è stata persa).

## Controlli

Uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), memoria libera 15,2-15,5 GB, disco 28-29 GB.
`build-src` + `check-src` all'inizio: IDENTICO BYTE PER BYTE (nessun file di `src/` toccato, quindi la mappa mirata dei
file toccati è vuota: restano il nucleo e i controlli della consegna).

| Controllo | Esito | Durata | Ultima riga / numeri |
|---|---|---|---|
| `portiere-252` (verde + rosso), 2 corse complete con la sonda riparata | ✅ verde ×2 | 836 · 879 s | «✅ portiere-252 VERDE (seme 1; rosso visto…)» — 1ª: verde KO 0/11 · rosso KO 2/11 (gi13@88,14 fuori e parata) · 2ª: verde KO 0/11 · rosso KO 3/11 (gli stessi + gi9 fuori, tutti «verso») |
| `portiere-223` (verde + rosso `__CPM_NO_G223`) | ✅ verde | 422 s | «✅ VERDE — sui tiri sbagliati il pallone non attraversa il portiere…» · «❌ ROSSO (atteso: __CPM_NO_G223) — 13 difetti» |
| `esiti-241`, 5 corse sulla base + 5 sull'attuale, strumento com'era | ✅ verde ×10 | 317-339 s | «✅ esiti-241 verde … e il rosso si vede» |
| `esiti-241` riparato, 5 corse | ✅ verde ×5 | 313-349 s | «BRACCIO verde+rosso+rosso G102 · MOTIVO nessuno» (2 scene scartate e rifatte in tutto) |
| `validate-situations` com'era, 5 corse sulla base | ⚠️ 4 verdi, **1 rossa** | 851-876 s | rossa: «❌ FAIL — post-highlight», gi0 salto camera 45,3 |
| `validate-situations` com'era (`CPM_PH_APRI=0`), 5 corse sull'attuale | ⚠️ 3 verdi, **2 rosse** | 836-870 s | rosse: gi0 salto camera 42,4 · 41,9 |
| `validate-situations` riparato, 5 corse | ✅ verde ×5 | 845-869 s | «✅ PASS», 14 categorie su 14 |
| `parata-100`, 2 corse | ⚠️ **instabile: rosso, poi verde** | 1800 · 1795 s | 1ª: «❌ parata-100 · verde: 1 parate senza pallone al portiere» (regime prova, s5/7, «Uno-due con WENDEL», minGB 16,0; il braccio rosso vedeva: difetti 2) · 2ª (riprova unica): «✅ parata-100 verde · il rosso si vede» (verde: parate 5, difetti 0; rosso: difetti 2). Gioco e sonda non toccati da questo giro: vedi dubbio 13 |
| `test:logic` | ✅ verde | 2 s | 51 prove, 0 fallite |
| `save-compat` | ✅ verde | 1 s | «SAVE-COMPAT 12 pass · 0 fail · PASS» |
| `design-system` (nucleo) | ✅ verde | 1 s | «✅ SISTEMA GRAFICO OK» |
| `tema-unico` (nucleo) | ✅ verde | 17 s | «ROSSO ATTESO OK: col tema di prova armato cade P (fondo non notte)» |
| `typing-shortcuts` (nucleo) | ✅ verde | 15 s | «✅ PASS — chi scrive tiene la tastiera…» |
| `web-237` (nucleo) | ✅ verde | 56 s | «PROVA DEL ROSSO RIUSCITA: il guardiano vede la traduzione nel browser» |
| `node --check` su tutti i file `.mjs` toccati | ✅ | — | — |

Due corse non valgono e non sono in tabella: un'esplorazione di `portiere-252` tagliata dal tetto di dieci minuti a due
scene dalla fine (i risultati per scena letti fin lì sono riportati come esplorazione) e la sua attesa, fermata a mano.

Non eseguiti per regola: `highlight-95`, `ingresso-206`, `career-critical` (li esegue la verifica di rilascio).
`docs/governo/STABILITA.json` non toccato (non ho usato `ci-runner.mjs`). Nessuna foto di altri giri rigenerata in `docs/`.

## File toccati

`tests/visual/portiere-252.mjs` · `tests/visual/lib/scena-252.mjs` · `tests/visual/esiti-241.mjs` ·
`tests/visual/lib/harness.mjs` (`samplePostHighlight`) · `tests/visual/validate-situations.mjs` ·
`tests/visual/checks/post-highlight.mjs` · `tests/visual/misura-271.mjs` (nuovo, sonda di misura, non in catena) ·
`docs/sviluppo/RAPPORTO-giro271.md` · `docs/sviluppo/giro271/*.txt` (registri delle serie).
`ci-runner.mjs` e `package.json` non toccati.

## Dubbi per il PO

1. **Col portiere sulla linea, 5 scene base su 8 di `portiere-252` non sono giudicabili: «il pallone non arriva al
   portiere».** Nel braccio verde (gioco com'è), partita «Validator»: gi1 «parata» — l'arco finisce a x 43,9, il portiere
   è a x 47 e z −6,6 (i pali sono a ±3,35); gi9 x 43,2 contro 47; gi15 (punizione-cross «parata») x 42 contro 47. Cioè
   una «parata» col pallone che si ferma 3-5 u davanti al portiere. L'ho misurato solo nella partita «Validator» del banco
   (portiere nato a x 97); altre partite col portiere arretrato non le ho provate. Non so se il giocatore lo vede così (la sonda non guarda il gesto in foto) e
   nessun guardiano di questo giro lo giudica: `parata-258` e `highlight-95` D3 guardano casi vicini. Non l'ho toccato:
   è gioco, fuori dalla consegna.
2. **Il portiere negli highlight sta dove è nato al calcio d'inizio (x 91-97 secondo il seme della partita).** Da lì
   dipende se un tiro parato gli arriva addosso o si ferma prima. È voluto che cambi da partita a partita? Prima del giro
   175 cambiava a caso, ora è fisso per partita.
3. **z del portiere all'armo fra −3,8 e −6,6** (fuori dai pali) in più scene di `portiere-252`, in entrambi i bracci e
   anche sulla base: è lo scivolamento verso il pallone durante la scelta (dubbio 2 del giro 265). Confermato qui su
   altre scene, non toccato.
4. **`esiti-241`: il rosso del 265 non riprodotto.** 10 corse verdi su 10. La riparazione chiude la sola sorgente di
   instabilità che ho misurato (esito «assist» al posto di «chance», 4 scene su 60); se il rosso del 265 aveva un'altra
   causa (macchina sotto carico: in quella sessione il contenitore è stato riavviato), può tornare.
5. **`esiti-241`, braccio rosso B: margine sottile.** Pretende ≥ 2 scene contraddittorie su 3 e ne escono 2 o 3
   (nelle 5 corse finali: 2 su 3 due volte, 3 su 3 tre volte; gi16 dipende dal testo sorteggiato). Con la riparazione gi14 è sempre una
   «chance», quindi il 2 regge; ma è un margine di una scena. Non ho cambiato la soglia.
6. **Il testimone `__CPM_CUTLIVE` non usa lo stesso criterio del gioco.** Il gioco considera «nero vivo» anche la propria
   richiesta di stacco appena fatta (`_cutAt471`); il testimone legge solo il timbro scritto da LiveMatch, che arriva
   dopo. Misurato: uno stacco d'esito di 8,0-8,9 u visto «scoperto» dal check in 3 prove (sotto la soglia 30, quindi
   verde). È nel gioco (src/11, riga di sola prova): allinearlo è una modifica a `src/`, non l'ho fatta.
7. **Domanda di gioco che ne discende:** la camera salta 120 ms reali dopo aver *chiesto* lo stacco nero, non dopo che il
   nero è davvero a schermo. Su un telefono lento il nero potrebbe arrivare dopo il salto. Sul banco non l'ho misurato
   (servirebbe leggere il nero dal DOM); lo segnalo soltanto.
8. **Sul banco il pallone a inizio scena «viaggia» da dove era (47 u in vista) se in quel fotogramma non c'è un nero
   vivo** (10 prove su 17). Sul banco lo stacco di scena è spento, quindi è atteso; nel gioco vero (stacco acceso) non
   l'ho misurato. Se un fotogramma lento facesse scadere il nero, il pallone viaggerebbe in vista anche lì.
9. **Mappa mirata (parte C):** va decisa la riga giusta per ogni chiave. Fino ad allora chi tocca `src/12` non esegue
   8 guardiani (fra cui `camera-241` e `pelle-240`).
10. **`portiere-252` ora dura ~14 minuti** (14 scene per braccio invece di 11) e pretende 8 portieri giudicati invece di 4.
    Se un giro futuro cambia ancora come nasce il seme della partita, i nomi «Portiere C/D» smettono di dare il portiere
    avanzato: il guardiano lo dice («nessuna partita col portiere avanzato all'armo») e va rosso, non cieco.
11. **Il gate dura qualche secondo in più** (l'attesa dell'apertura: 0,8-2,5 s per le 6 scene di `post-highlight`).
12. **`sonda-motion-161.mjs`** usa lo stesso `samplePostHighlight`: ora aspetta anche lei il pallone fermo. Non è nelle
    catene di `ci-runner.mjs` e non l'ho eseguita.
13. **`parata-100` è uscito rosso una volta su due, e non l'ho riparato** (fuori dal lotto; questo giro non tocca né il
    gioco né quella sonda; nel giro 265 era verde 2 su 2). Che cosa ho visto, senza poterlo dimostrare: ogni partita della
    sonda è chiusa da un tetto di 480 s **reali**, e nessuna delle 12 partite delle due corse è arrivata al fischio
    («fine playing» o «fine hl_result» in tutte). Nella corsa rossa la partita col difetto (verde, prova, s5/7) è stata
    tagliata **dentro una scena** («fine hl_result»): se la scena tagliata è quella della parata, il pallone non aveva
    ancora raggiunto il portiere quando la misura è finita (minGB 16,0). Non ho la riga per scena di quella corsa, quindi
    resta un'ipotesi. Inoltre le stesse partite (stesso salvataggio, stesso seme) danno scene diverse da una corsa
    all'altra (s5/7 prova: 6 scene e 2 parate nella prima, 7 scene e 0 parate nella seconda): il guardiano non rigioca la
    stessa partita. Per la regola PO 13/10 alla seconda instabilità va riparato in un giro suo.
