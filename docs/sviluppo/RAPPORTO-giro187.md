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

Esito (corsa del 13-14/11): <!-- SH166 -->

## 3. Punto 1 — rigore-139: battute e testimone dall'89'

<!-- RIG139 -->

## 4. Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` prima)

<!-- CONTROLLI -->

## 5. Dubbi e cose non chiuse

<!-- DUBBI -->
