# Rapporto giro 42 — highlight dell'eroe, residui PO-252

**15-16/10/2026 · ramo `sviluppo/highlight-252b-giro42` · base `lavoro/171-base` (7.999.170 + giro 22) · nessun cambio di
`GAME_VERSION`/`SAVE_VERSION` · toccati solo `src/12-three-match-view.jsx` (+ build `CARRIER-MANAGER-AV.html`) e `tests/visual/`.
Zona G non toccata.**

Compito: residui di PO-252 dopo il giro 22 (voce 1) e voci 7-10 non affrontate, poi banco `banco-highlight-248.mjs` rigiocato.
Regole seguite: misura prima di correggere, interruttore rosso per ogni correzione, GLB acceso, pagina nuova per scena (salvo dove
la sequenza di pagina È il difetto, dichiarato), giudizio in tempo di scena.

---

## 1. Esito per voce

| voce | esito | interruttore rosso | guardiano |
|---|---|---|---|
| 1 · piedi che pattinano | **tentativo misurato e revocato** (nessun effetto) | — | `piedi-252` (rigiocato verde) |
| 7 · eroe fuori quadro su punizione/tiro | **attribuito**, non corretto (scelta di regia) | — | sonda `sonda-quadro-42.mjs` |
| 8 · nessuna reazione avversaria oltre 9u | **corretto in parte** (reazione di movimento) | `__CPM_NO_REAZ252` | `reazione-252` (nuovo) |
| 9 · salto isolato della camera | **due cause attribuite, due correzioni** | `__CPM_NO_TAGLIA252`, `__CPM_NO_SNAP252` | `camera-252` (nuovo) |
| 10 · 001 in catena | **misurato su partite vere**: nessuna catena osservata; il 001 d'apertura esiste anche dal gioco fluido | — | sonda `sonda-001-42.mjs` |

### Voce 9 · salto isolato della camera — due cause

Strumento: testimone di sola prova `__CPM_CAMJ42` (`src/12-three-match-view.jsx`, accanto a `camera.lookAt`): per ogni
fotogramma posizione resa della camera, bersaglio `tP*`, mani della regia (`_tocc503`), soggetto (`_subjBall50`), eroe in quadro,
stacco nero vivo, e il bersaglio a quattro punti di controllo (`blend`, `preF6`, `arb`, `lerp`). Il banco accetta `CPM_CAMJ42=1`.

⚠️ Su pagina nuova il salto **non si riproduce** (sonda, 0/5): compare dalla seconda esecuzione sulla stessa pagina, come nel
banco (pag 2-4). La sequenza di pagina del banco è quindi parte della prova.

**Causa A — la taglia si spegneva in un fotogramma.** Su gi66 gol/sbaglia/parata il bersaglio della camera saltava di
**32-34u** in un fotogramma fra `preF6` e `lerp`: è la passata della taglia (F6, 7.505), che gira solo con `!_subjBall50`; quando
il soggetto passa al pallone si spegneva secca, e l'arbitro d'inerzia (7.521) tratta un salto oltre 25u come uno stacco voluto —
senza nero. **Correzione:** il peso della taglia (`_w252`) scende/sale con tau 0,35 s di scena al cambio di soggetto; si allinea
subito al cambio di scena, a ogni ingresso/uscita da highlight e su ogni stacco (la firma golden, catturata in lettura con l'eroe
soggetto, non cambia: gate 00001505).
⚠️ La prima stesura ripartiva da 0 all'ingresso in un highlight con la stessa chiave di scena: `hero-in-frame` lo ha mostrato
(gi138/gi133 al 100%, misura presa però con tre browser in concorrenza); allineando il peso all'ingresso, da solo è verde (0%/0%).

**Causa B — lo stacco d'esito corto saltava scoperto.** Nel banco (tiro) i salti isolati restanti erano 5,0-5,9u con i vicini
≤ 0,2u, sugli esiti «parata», con la mano `snap` nel fotogramma: è lo stacco d'esito del 7.63, che sopra 6u chiede il nero
(7.471) e **sotto 6u saltava senza nero**. **Correzione:** sotto i 6u lo stacco d'esito (`_cutSnap`, solo `hl_result`) non salta,
lo porta il lerp ordinario; l'apertura di scena (`_sceneCut`) resta com'era.

| `camera-252` (gi0 murata → gi66 gol/sbaglia/parata, stessa pagina, 2 pagine per braccio) | verde | rosso |
|---|---|---|
| passo massimo del bersaglio ai cambi di soggetto | 1,1-7,3u (4 corse) | 32,1-33,3u |
| passi oltre 15u | 0 | 2 |
| salti isolati della camera resa | 0 | 0 ⁽¹⁾ |

⁽¹⁾ lo snap scoperto **non si riproduce** in questa sequenza nemmeno col rosso: per la causa B la prova è il banco rigiocato
(§2), sullo stesso strumento che lo aveva contato: **3 salti nel «tiro» prima della correzione (banco intermedio di questo giro) → 0
su tutte le famiglie** dopo.

### Voce 8 · reazione avversaria oltre 9u

Misura: testimone `__CPM_REA42N` (perché nessun gesto: distanza del difensore più vicino ed esito). Su gi148 il più vicino sta a
10-15u. **Correzione** (`src/12-three-match-view.jsx`, accanto al canale 7.519): fra 9 e 24u il difensore più vicino riceve un
**bersaglio assoluto** verso il punto (fino a 7u, mai oltre 3u dal punto), che il driver off-ball usa al posto del suo bersaglio
per la sola scena; il bersaglio «commesso» (EMA 0,22 s) parte già sul punto e all'armo si toglie la sola componente di velocità
che **allontana** dal punto (le posizioni restano continue, nessun teletrasporto).
Tre stesure misurate e scartate prima: (a) offset sul bersaglio ordinario → mangiato dalla deriva del reparto (10 → 12u dal
punto); (b) bersaglio assoluto senza il bersaglio commesso → il difensore, con 6 u/s di inerzia nel verso opposto, invertiva solo
dopo ~1,4 s (traccia fotogramma per fotogramma); (c) bersaglio commesso senza togliere la velocità → accorciamento mediano 2,2u in
una corsa e **0,0u** in quella della catena (in 2,6 s di scena non arrivava a invertire): guardiano rosso, causa misurata, (c)
sostituita dalla versione finale.

| `reazione-252` (cross gi148, tre esiti) | verde | rosso |
|---|---|---|
| esecuzioni senza reazione | 0/3 | 2/3 |
| accorciamento verso il punto (movimento) | da 11,6-13,6u fino a 2,3-3,6u · mediana **9,6u**, 8,0u in catena (soglia 4u) | — |

⚠️ **Limiti dichiarati.** Il rosso vede il difetto in 1-3 esecuzioni su 3 secondo la corsa:
la distanza del difensore cambia fra un giro e l'altro (messa in scena), quindi il braccio rosso può uscire cieco — è un guardiano
da tenere d'occhio per la regola «instabile due volte si ripara». **gi66 fuori/murata** (il banco li conta senza reazione): con la
mia sonda il ramo delle reazioni non viene raggiunto (`__CPM_REA42N` vuoto) — **non riprodotti**, lasciati fuori dal guardiano.

### Voce 7 · eroe fuori quadro (attribuzione)

`sonda-quadro-42.mjs`, pagina nuova per scena, fotogrammi di `hl_result` dopo la scelta (punizioni gi15/gi78, tiri gi66/gi113):
**249/528 fotogrammi con l'eroe fuori quadro, di cui 238 (96%) con il soggetto della regia sul pallone**, mani quasi solo
`tribuna650`. Non è una passata anomala: è il passaggio deliberato del soggetto al pallone dopo il calcio (7.237/7.520). Cambiarlo
è una decisione di regia del PO (es. tenere l'eroe più a lungo sulle punizioni), non un difetto da correggere alla cieca.
Controllo della correzione 9 sullo stesso campione: rosso (taglia secca) 328/530, verde 249/528 — la dissolvenza **non peggiora** il
fuori quadro; la variabilità per scena è grande (gi78: 2% contro 58%), quindi non dichiaro un miglioramento.

### Voce 10 · 001 in catena

`sonda-001-42.mjs`: **3 partite vere** (autoplay seedato, nomi diversi, GLB e teatro accesi), stesso criterio del banco (pallone a
> 3u dal corpo più vicino, `__CPM_OWN`, finestra di scena 0,3-1,0 s dall'ingresso in `hl_intro`):
- **15 aperture, tutte dal gioco fluido: nessuna catena di highlight** comparsa in 3 partite;
- **5/15** con il pallone oltre 3u (mediane 2,6-7,5u), contro 1/24 della prima esecuzione forzata del banco.

Conclusione onesta: il «001 in catena» del banco **non è dimostrabile come difetto del gioco** — in partita vera la catena non si
è presentata. Il 001 d'apertura invece **compare anche dal gioco fluido** (1 apertura su 3), quindi non è solo la pagina stanca.
**Non posso confermare** che sia un difetto: nella finestra 0,3-1,0 s il pallone può essere in volo verso l'eroe (consegna);
servirebbe distinguere «in volo» da «fermo senza padrone», cosa che la sonda non fa. Proposta: riprenderlo col taccuino (codice 001).

### Voce 1 · piedi che pattinano

Ipotesi del giro 22: oltre ~8,8 u/s la clip di scatto satura al tetto di cadenza 2,5. Prova: tetto 2,5 → 3,2 (sincronizzata fino
a ~11 u/s), `piedi-252` braccio verde con e senza: mediana **0,253 col tetto 3,2 contro 0,220 col tetto 2,5** — nessun
miglioramento (dentro il rumore, anzi peggio). **Revocata** (No Blind Fix), nessuna modifica nel codice. Restano aperti, non
affrontati per tempo: passaggi fra clip a radice ferma (servirebbe un blocco del piede/IK) e la punizione (rincorsa).

---

## 2. Banco rigiocato a fine giro — verdetto PO-229 / PO-248 / PO-252

`banco-highlight-248.mjs` × 10 famiglie + `rapporto`, build finale `76607e0`, 16/10 02:43-03:36 UTC, GLB acceso, stesse scene e
stessi esiti dei giri 21 e 22. Copertura minima in tutte le famiglie (117/118 giudicate, come prima).

**Fonti delle colonne.** «Prima» = banco del giro 21 (`docs/sviluppo/BANCO-highlight-248.md`, misurato su base `lavoro/167`; il
compito lo chiama «169»: un banco misurato su 169 non l'ho trovato, **non posso confermarlo**). «Dopo giro 22» = tabella §2 di
`RAPPORTO-giro22.md` (su base `lavoro/168`). «Dopo giro 42» = questa corsa (base `lavoro/171-base` + giro 42): fra le ultime due
colonne cambiano anche i giri 23-30 della base, quindi la differenza non è tutta di questo giro.

| # | difetto | prima (giro 21) | dopo giro 22 | **dopo giro 42** | voce PO |
|---|---|---|---|---|---|
| 1 | piedi dell'eroe che pattinano (sopra 0,10) | 117/117 | 117/117 | **116/117** (mediane: tiro 0,18 · testa 0,55 · volée 0,17 · cross 0,27 · passaggio 0,58 · dribbling 0,35 · contrasto 0,54 · rigore 0,26 · punizione 0,50 · difesa 0,45) | PO-252/1 aperta |
| 2 | pallone che si teletrasporta in rete al gol | 4/13 gol | 0 | **0** | PO-252/2 chiusa |
| 3 | eroe immobile e senza gesto in difesa | 4/16 | 0/16 (senza gesto 1) | **0/16** (senza gesto 1) | PO-252/3 chiusa ⁽ᵃ⁾ |
| 4 | rinvio difensivo troppo veloce (> 40 u/s) | 5/16 | riusciti 0; max 58,6 (gol subito) | **riusciti 0/8** (max 30,7); 1/16 complessivo: gi133 «sbaglia» 99,5 u/s ⁽ᵇ⁾ | PO-252/4 chiusa sui rinvii |
| 5 | portiere tardi / lato opposto (111/112) | 8/43 | 4/43 ⁽ᶜ⁾ | **3/44** (volée gi1, cross gi67, punizione gi78) | PO-229 / PO-252/5 residuo |
| 6 | passo del pallone nel build-up aereo | 5/42 aeree | 0 | **0** | PO-252/6 chiusa |
| 7 | eroe fuori quadro nella conclusione | 15/117 | 13/117 | **12/117** (passaggio 5 = regia 7.522; tiro 3, punizione 3, dribbling 1) | attribuito: regia, decisione PO |
| 8 | nessuna reazione del reparto avversario | 5/54 | 5 | **0** (tiro 15/15 · testa 15/15 · cross 12/12 · rigore 10/10 · punizione 14/14) ⁽ᵈ⁾ | PO-252/8 chiusa sul banco |
| 9 | salto isolato della camera | 3/117 | 3/117 | **0/117** | PO-252/9 chiusa |
| 10 | 001 dopo un altro highlight (prima esecuzione) | 24/69 (1/24) | non riportato | **18/69 (1/24)** | non dimostrato difetto del gioco (§1, voce 10) |

Altro dal rapporto del banco: salti dell'eroe 0 · salti del pallone 1 (contrasto gi130 «sbaglia», 3,3u, scrittore `arco`, non
attribuito) · peso del gesto 0 · incoerenze riquadro↔motore↔3D 0 sulle esecuzioni a esito naturale · eroe «figurina» 2.

⁽ᵃ⁾ ma il guardiano `difesa-252` è oggi **rosso per cecità del braccio rosso** (vedi §3): il verde è buono (fermo 0,05-0,07).
⁽ᵇ⁾ gi133 «sbaglia» esce `deflected_out` (esito deciso dal gioco): non è un rinvio riuscito. Non attribuito; le correzioni di questo
giro non toccano gli highlight difensivi (reazione e snap sono esclusi su `hlDef`, la taglia è solo camera).
⁽ᶜ⁾ il banco del giro 22 era stato rigiocato prima della sua seconda e terza correzione del portiere.
⁽ᵈ⁾ ⚠️ il banco conta come «reazione» ogni voce del testimone `__CPM_REA519`, quindi da questo giro anche le reazioni **di
movimento** (marcate `mov:1`). Il risultato dice che c'è sempre qualcuno che reagisce, non che c'è sempre un gesto.

**Verdetto misurato per il PO.**
- **PO-248** (banco): dei 10 difetti, chiusi sul banco **2, 3, 6, 8, 9**; chiuso sui rinvii il **4**; ridotto il **5** (8 → 3);
  il **7** è regia; il **10** non è dimostrato come difetto; resta aperto il **1** (pattinamento, 116/117).
- **PO-252**: voci 2-6 (giro 22) confermate sul build attuale; 8 e 9 chiuse in questo giro; 1 aperta; 7 e 10 dichiarate.
- **PO-229** (portiere): residuo 3/44 esecuzioni (lato/tempo), stesso stato del giro 22 — non lavorato in questo giro.
- Tutto in headless: la resa (dissolvenza della taglia, reazione del difensore, niente snap corto) va guardata sul telefono.

---

## 3. Rituali sul build finale

Build finale `76607e0` (`node tools/check-src.mjs`: allineato). Una prova alla volta salvo dove detto; GLB acceso nei 252.

| prova | esito | numeri |
|---|---|---|
| `validate-situations` | ✅ PASS 14/14 | fingerprint **00001505**, 0 failure |
| `test:logic` | ✅ | 43/43 |
| `replay` | ✅ PASS | 8 highlight |
| `piedi-252` | ✅ | mediana verde 0,224 · rosso 0,518 |
| `rete-252` | ✅ | passo max verde 0,92u · rosso 4,44u |
| `difesa-252` | ❌ **rosso cieco** | verde fermo 0,05-0,07 (buono) · rosso 0,49-0,53 contro la soglia 0,8 ⁽¹⁾ |
| `rinvio-252` | ✅ | v max verde 25,1 · rosso 69,2 u/s |
| `portiere-252` | ✅ | KO verde 0/7 · rosso 2/7 |
| `aereo-252` | ✅ | salti verde 0/3 · rosso 3/3 |
| `reazione-252` (nuovo) | ✅ | verde 0 senza reazione, accorciamento mediano 8,0u · rosso 3/3 senza reazione |
| `camera-252` (nuovo) | ✅ | verde passo max 1,1u, 0 salti isolati · rosso 33,3u |
| `hero-in-frame` | ✅ | (una prima corsa con tre browser in concorrenza era rossa: vedi §1, voce 9) |
| `camera-hands` | ✅ | solo conteggio |
| `squad-react` | ✅ | tiro/testa/cross |
| `framing-guard` | ❌ **non attribuibile** | mediana 0,096 (soglia 0,11); **con i miei tre interruttori spenti 0,095**, stessa corsa da sola ⁽²⁾ |
| `seme-a` | ❌ **non attribuibile** | giri divergenti all'ingresso #486 al 17'; **identico coi miei tre interruttori spenti** ⁽³⁾ |

⁽¹⁾ Coi miei tre interruttori spenti il rosso resta cieco (0,49-0,53, eroe che percorre 6,7-8,7u nei primi 2 s): sulla base
`lavoro/171-base` l'eroe in difesa si muove anche col rimedio del giro 22 spento (è cambiato qualcosa nei giri 23-30, non
cercato). Il guardiano va ritarato (soglia o scene del braccio rosso) da chi possiede la base: **non l'ho toccato**.
⁽²⁾ La misura dipende dal carico: con due censimenti in parallelo i fotogrammi campionati si dimezzano (2.299 contro 4.624) e la
mediana scende a 0,087. Le due corse giudicate sono da sole. Non ho misurato la base pura `5eb5500`.
⁽³⁾ Corsa del braccio «spento» in parallelo ad altri test; il punto di divergenza coincide col verde. Non ho misurato la base pura.

⚠️ «Interruttori spenti» = comportamento di prima per le tre correzioni di questo giro; restano attivi solo i testimoni di prova,
che fuori dai loro flag non scrivono nulla (salvo l'annotazione `sr.current._sb42`, sola lettura). È lo stesso metodo di
attribuzione del giro 22 (§6), non una prova sulla base: **non posso confermare** che `framing-guard` e `seme-a` siano rossi anche
su `lavoro/171-base`, solo che non cambiano spegnendo questo giro.

Non eseguiti: catena `mirata`/`completa` di `ci-runner.mjs` per intero (tempo), `career-critical`/`save-compat` (zona carriera non
toccata). Nessun bump, nessuna promozione su `main`, nessuna riga di roadmap (ramo di sviluppo, non rilascio).

## 4. Strumenti lasciati

- Guardiani nuovi: `camera-252`, `reazione-252` (script npm, MAPPA `src/12-` e catena `completa` di `ci-runner.mjs`, accanto ai
  sei del giro 22).
- Sonde: `sonda-camera-42.mjs` (attribuzione dei salti di camera, `CPM_STESSA=1` per la sequenza di pagina), `sonda-quadro-42.mjs`
  (fuori quadro per soggetto e mani), `sonda-001-42.mjs` (aperture su partite vere).
- Testimoni di sola prova: `__CPM_CAMJ42` (camera per fotogramma), `__CPM_REA42N`/`__CPM_REA42M` (reazioni).
- `banco-highlight-248.mjs` accetta `CPM_CAMJ42=1`; `piedi-252` e `hero-in-frame` accettano `CPM_FLAGS` (bracci di attribuzione).

⚠️ Errori miei del giro, dichiarati: (1) tipi d'esito forzati scritti male nelle prime sonde (`save`/`block` invece di
`saved`/`blocked`), corretti; (2) una riga di testimone inserita fra `if` ed `else if` ha spento il ramo di movimento mentre il
testimone era acceso, corretta; (3) un `import` di prova di `ci-runner.mjs` lo ha avviato davvero (3 passi), fermato subito, nessun
file di registro toccato; (4) `seme-a` ha sforato i 10 minuti in concorrenza col banco.
