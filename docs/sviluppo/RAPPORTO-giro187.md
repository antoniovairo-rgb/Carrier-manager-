# RAPPORTO giro 187 — seguito della partita riproducibile (rigore-139 · solo-highlight-166 · riproduci-175)

Ramo `sviluppo/giro187-riproducibile-seguito`, partito da `lavoro/192` (`cfd047a`). `GAME_VERSION` **non toccata** (7.999.192).
Non toccati audio-161, tifosi-171, box-fischio-169 (giro 186).

## 0. In breve

<!-- IN-BREVE -->

## 1. Punto 3 — riproduci-175: il minuto del primo turno cambiava fra due ripetizioni (difetto del GIOCO)

**Sintomo (della madre):** «Livio Corradini» rip. 0≠1 alla voce 5: `{"causa":"motore-contrasto","ev":"turn","min":1}` contro lo
stesso evento con `"min":0`.

**Causa misurata.** Il battito del minuto (`_batt166`, src/15) apre il minuto nuovo dentro l'aggiornamento di `setClock` e scrive
`minBattito161Ref` (giro 161); `clockRef` invece si aggiorna in un `useEffect`, cioè **dopo il render**. I sotto-tick del motore
(22 al minuto, uno ogni ~39-77 ms secondo la velocità) che cadono fra il battito e il render passano al motore il minuto giusto
(`minBattito161Ref`, correzione del giro 161), ma gli specchi chiamano `setTurn616`, che annotava `clockRef.current` — ancora
il minuto chiuso. Quanto dura la finestra lo decide il processore.

Misura (sonda nuova `tests/visual/sonda-187.mjs`, «Livio Corradini», 1× · 1,5× · 2× in parallelo, fino al 15', due giri per
braccio, testimone `__CPM_W187` solo sotto `?cpmtest`): in **1 ripetizione su 3** (la 1,5×, in entrambi i giri) un sotto-tick è
caduto con minuto del battito 1 e `clockRef` 0, e il turno annotato lì era proprio `motore-contrasto` — l'evento del sintomo.
Nelle altre ripetizioni la finestra non si è aperta. Il contatore `ritardo` (sotto-tick col minuto diverso da quello aperto dal
battito, cioè `setClock` non ancora eseguito) è rimasto **0**: l'aggiornamento di `setClock` gira subito, il ritardo è solo del
render. Nel braccio rosso dello stesso giro la finestra **non** si è aperta (0 su 6): per questo il rosso si provoca (sotto).

**Correzione (src/15, rosso `window.__CPM_NO_G187`).** Il sotto-tick dichiara il minuto del suo passo (`minPasso187Ref`, lo stesso
valore che passa al motore) e lo ritira dopo gli specchi; `setTurn616` annota quel minuto nel libro mastro (`cpmEv("turn")`) e
nella memoria del Match State (`msMemRef`). Fuori dai sotto-tick (battito, debiti pagati, esiti di scena) resta `clockRef`, che lì
vale già lo stesso in ogni giro. **Nessuna taratura del motore cambia**: il motore riceveva già quel minuto; cambia solo
l'etichetta del turno annotato nella finestra, che ora è quella che avrebbe avuto senza finestra.

⚠️ La memoria del Match State (`msMemRef`) è letta dal cervello (`mem:` in src/15): prima del rimedio anche lei portava il minuto
sbagliato nella finestra, quindi la differenza poteva passare dal libro mastro alla partita. Non l'ho misurato separatamente.

**Guardiano nuovo `npm run riproduci-187`** (in `ci-runner.mjs`: catena `completa` e mirata su `src/15-`). La finestra non si
aspetta, si **provoca**: `__CPM_FINESTRA187=n` (solo `?cpmtest`) fa vedere ai primi n sotto-tick di ogni minuto `clockRef` ancora al
minuto chiuso, e lo ripristina subito dopo gli specchi del passo — esattamente ciò che fa un render in ritardo, e nient'altro.
(Prima stesura scartata dalla sua misura: ritardare l'`useEffect` stesso teneva vecchio `clockRef` anche negli esiti di scena,
che nel gioco vero non succede, e separava il verde su un `esito` — strumento sbagliato, non gioco.)
Due nomi («Livio Corradini», «Tobia Ferrante»), due partite per nome al 2× fino al 20': senza finestra e con finestra n=6.
GIUDICATO solo se la finestra è stata attraversata da almeno un turno **dentro** il tratto confrontato (fino al 17').

| braccio | «Livio Corradini» | «Tobia Ferrante» |
|---|---|---|
| verde | 56 = 56 voci, **uguali** (8 turni nella finestra, minuti 1-15) | 51 = 51, **uguali** (5 turni, minuti 1-21) |
| rosso `__CPM_NO_G187` | si separano alla voce 5: `motore-contrasto` min 1 ≠ 0 (il sintomo) | si separano alla voce 5: `motore-intercetto` min 1 ≠ 0 |

(Con n=3 il rosso di «Tobia Ferrante» non si separava: l'unico turno nella finestra cadeva al 21', fuori dal confronto. Ho
reso il giudizio più severo — il turno deve stare nel tratto confrontato — e portato la finestra a 6 sotto-tick su 22.)

<!-- R175 -->

## 2. Punto 2 — solo-highlight-166, controllo 12

**Criterio vecchio:** «intervista post-partita chiesta, come nella partita intera»: `iv231 >= 1` nei soli highlight **e** stesso
conto nella partita intera. **Perché non regge più:** il giro 183 (PO-375 «Meno e più varie») fa uscire l'intervista solo dopo
una partita con posta, una tripletta o la sorpresa seedata (1 su 8); e la modalità soli highlight esiste **solo** per partite
senza posta. Il `>= 1` chiedeva quindi al gioco di disobbedire alla decisione del PO: da qui «soli highlight 0 · intera 0».

**Criterio nuovo** (stesso senso: la modalità si comporta come la partita intera):
- **12** — «interviste uguali a quelle della partita intera, con lo stesso seme»: stesso conto (`__CPM_IV231`) **e** stessa
  decisione (`__CPM_IV183`: sì/no, motivo, domanda), con la partita chiusa in entrambe (altrimenti NON GIUDICATO).
- **12b** — caso con l'intervista: un secondo paio intera + soli highlight con il nome «Collaudo Sorpresa 7», per cui la
  sorpresa seedata del giro 183 esce (stessa settimana e avversario: il calendario non dipende dal nome). Pretende
  `iv231 >= 1` in **entrambe**, decisione uguale con `si:true`, nessun errore di pagina. Il nome l'ho scelto con
  `tests/visual/sonda-iv187.mjs`, che calcola nella pagina, con `hashStr` del gioco, la stessa condizione di `intervista183`;
  la verifica vera la fa il guardiano. (Il «sorpresa» potrebbe in teoria diventare «tripletta» se l'eroe segnasse tre gol:
  il controllo pretende `si:true`, il motivo è stampato.)

**Non è più permissivo:** il conto resta confrontato, si aggiunge il confronto della **domanda**, e il `>= 1` resta, sul caso
dove il gioco deve davvero chiederla. La libreria `lib/partita-166.mjs` ora legge anche `__CPM_IV183` (solo lettura in più).

Esito (corsa del 13-14/11, dopo il punto 3): **VERDE PASSA, ROSSO CADE su 3, 7 e 8**. 12: soli highlight 0 · intera 0,
decisione `{"si":false,"motivo":"nessuna posta"}` in entrambe. 12b («Collaudo Sorpresa 7»): 1 · 1, decisione
`{"si":true,"motivo":"🎲 Sorpresa","q":"Il tuo gol ha messo la partita sulla strada giusta. Raccontaci quell'azione."}` in
entrambe, partite al 92'. Controllo 10 sul nome principale: 269/269 voci uguali, 1-0. Durata: intera 195,8 s, soli highlight
57,6 s.

## 3. Punto 1 — rigore-139: battute e testimone dall'89'

**Sintomo (della madre):** «NO verde GIUDICATO: battute di rigore dell'eroe 2 (minimo 3), testimone k1d-11 col rigore offerto
dall'89' false», quindi rosso non visto. Con la partita riproducibile le partite fisse del guardiano sono altre partite.

**Ricerca nel braccio rosso** (`sonda-rigore-139`, salvataggio 190, `__CPM_RIG190_K=1`, 2×; il nome cambia la partita):

| lotto | partite | battute dell'eroe | rigori offerti all'89'-90' | doppi del meccanismo 139 |
|---|---|---|---|---|
| r187a (0-31, PAR 4) | 32 | 12 | r187a-23 al 90' (il motore calcia da solo, nessuna scena) | 0 |
| r187b (0-47, PAR 8) | 48 (47 giudicate) | 24 | nessuno | 0 |
| r187d (0-39, PAR 8; fermato dal riavvio del container) | 40 | — | r187d-25 all'89' (una battuta, in scena, anche nel rosso) | 0 |
| r187d (40-92, PAR 8; fermato al tetto dei 30 minuti, 53/56) | 53 | 13 partite con battute | r187d-40 all'88' | 0 |

**173 partite naturali, zero doppi del giro 139.** (Un tentativo a PAR 12 ha esaurito la memoria — processi uccisi dal kernel,
aperture fallite — ed è stato fermato e scartato.) Il caso esiste ancora nel codice (sotto), ma nel gioco attuale è troppo raro
per una partita fissa naturale. `PROCESSO.md`: «ciò che il gioco non produce si provoca dalla sonda».

**La testimone è provocata.** Opzione nuova della sonda `CPM_PROVOCA=89`: al primo controllo con il motore al minuto ≥89, a gioco
fluido, la sonda chiede al motore un rigore per la squadra dell'eroe con l'eroe battitore (`chiedi.piazzato`, come carriera3-94
D2); offerta, attesa, scena e battuta seguono il gioco. «r187d-56», seme 57: **verde** `89' provocato · 90' rigore · 90'
occasione_eroe* · 91' piazzato_giocato[pen:37,tolto] · 91' scena_gol` (una battuta); **rosso** `__CPM_NO_G139` `… 90' occasione_eroe*
· 90' battuta* 90' tiro* · 91' piazzato_giocato[nullo:volo] · 91' scena_gol · 92' gol*` — lo stesso doppio di k1d-11 nel giro 139.

**Partite del guardiano ora:** verde = testimone provocata r187d-56/57 + tre naturali r187d-25/26 (rigore offerto all'89' **da
solo**), r187d-40/41, r187a-22/23; rosso = r187d-56/57 provocata con `__CPM_NO_G139`. Criterio (N = 5', ≥3 battute, testimone con
occasione dall'89', 0 doppi, rosso visto) **invariato**.

**Esito, 4 corse:** verde giudicato in tutte, battute **7 · 7 · 6 · 7**, 0 doppi, 0 errori; rosso visto in tutte (90' motore + 91'
scena). ⚠️ La corsa con 6 battute non l'ho attribuita a una partita (stampavo solo il riassunto): sospetto lo strumento — la
provocazione scatta al primo controllo della sonda (ogni 400 ms) col motore al minuto ≥89, quindi su un passo diverso a ogni corsa.
Non verificato.

**Difetto trovato e NON corretto (fuori dal mandato del punto 1): «r187d-11», seme 12, doppio anche nel VERDE.** `59' rigore ·
59' occasione_eroe* · 60' piazzato_giocato[nullo:volo] · 60' scena_gol · 61' battuta* 61' tiro*`, identico in tre corse (due rosse,
una verde). Spia della sonda (`CPM_SPIA=1`, campo nuovo `sc`/`rp`): richiesta dei piazzati accesa, scena mai aperta nel motore,
`_acc94` mai acceso, nessuna chiamata ad `attendiPiazzato`; il motore aspetta 40 passi (`_o27` 1→40 fra il 58' e il 59') e calcia.
La scena arriva al 60' dal percorso **`motore-occasione`** (scena programmata n.7, `evento:{min:59}`), che — a differenza del
percorso `brain-origine` (src/15, ~r.6384) — non chiama `attendiPiazzato`: è la classe del giro 94 D2 («misura 3») su un percorso
che quella correzione non copre. La sonda gira con `__CPM_NO_G154` (le battute del motore dell'eroe esistono solo così); **in
produzione** il motore farebbe calciare un compagno: lo stesso rigore battuto due volte, da due giocatori. Non misurato in
produzione. Va deciso chi lo corregge; il caso è pronto per un guardiano (nome e seme sopra).

## 4. Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` prima)

<!-- CONTROLLI -->

## 5. Dubbi e cose non chiuse

<!-- DUBBI -->
