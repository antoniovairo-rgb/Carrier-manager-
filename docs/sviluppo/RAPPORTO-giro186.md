# Rapporto giro 186 — tre guardiani resi di nuovo giudicanti e stabili (7.999.192)

Ramo `sviluppo/giro186-strumenti`, partito da `lavoro/192` (cfd047a6). Toccati **solo** `tests/visual/audio-161.mjs`,
`tests/visual/tifosi-171.mjs` e `tests/visual/box-fischio-169.mjs`. `src/` e `GAME_VERSION` non toccati. **Nessuna soglia
cambiata.** I controlli sono stati eseguiti uno alla volta (`free -m` e `df -h` prima di ciascuno, `CPM_CHROME=/opt/pw-browsers/chromium`).

Commit: `93b0268` (audio-161) · `d033350` (tifosi-171) · `c08a799` (box-fischio-169) · più questo rapporto.

## 1) audio-161 — controllo 8 «non giudicato»

**Prima (misura della madre sulla 192):** verde NON PASSA solo sul controllo 8, «gol subiti nel libro mastro 0 · NON GIUDICATO».

**Causa misurata.** Con seme 7300 e nome `Pv` la partita di prova finisce **1-0**, zero gol subiti (sonda a parte, 262 voci).
Dal giro 175 la partita è riproducibile, quindi il risultato è sempre quello.

**Scelta del nome** (seme 7300 invariato, una partita per nome, sonda col solo braccio verde):

| nome | risultato | gol subiti |
|---|---|---|
| Pv | 1-0 | 0 |
| Fischi | 1-0 | 0 |
| Rossi | 2-0 | 0 |
| Leo | 1-0 | 0 |
| **Ga161** | **3-1** | **1** (emissione 1, sorgente `cronaca`) |
| Bianchi | 3-0 | 0 |
| Verdi | 1-0 | 0 |

Il valore predefinito diventa `CPM_A161_NOME='Ga161'` (seme 7300). Palo e tiro fuori nella partita **non li ho trovati**: il
libro mastro di `Ga161` registra gli esiti `miss` ×4, `through`, `goal`, `chance`, nessuna chiave palo/fuori distinta. I controlli
6 («ohh» su palo e tiro fuori) restano quelli sintetici del braccio sul sito, come prima.

**Dopo (stabilità):** la sonda a parte ha dato due partite identiche (la terza è stata interrotta dal tetto di 10 minuti
dell'attesa, non dal gioco). Poi **3 corse complete di `node audio-161.mjs`** di fila, tutte identiche:
verde PASSA, rosso CADE su 4-8; controllo 8 verde «1 gol subito · emissioni 1 {cronaca:1}», rosso «emissioni 0»;
controllo 9 «voci 278 vs 278 · risultato 3-1 vs 3-1».

## 2) tifosi-171 — «2D: testimoni assenti (canvas)» su PC

**Prima (misura della madre):** 1 misura su 8 fuori criterio sia nel verde sia nel rosso, coppia VEL v VAL su PC.

**Causa (dal codice, non riprodotta in una corsa rossa).** Il Campo2D viene montato **solo** in fase `playing`
(`src/15-live-match.jsx`, blocco `vista2d`: `_c2d = … && phase==="playing"`). La sonda aspettava `playing`, cliccava
«Nascondi» e poi faceva un'**attesa fissa di 1,5 s** prima di leggere: se nel frattempo partiva un highlight, la tela era
smontata (`__CPM_CAMPO2D_CV()` restituisce `cRef.current`, a quel punto nullo) mentre `__CPM_G141`/`__CPM_G171` restavano
quelli della tela di prima. **Non posso confermarlo con una corsa che fallisce:** non ho rieseguito la versione vecchia; la
causa viene dalla lettura del codice e corrisponde al sintomo («canvas» unico testimone mancante).

**Correzione** (nessun gancio nuovo; usa solo `__CPM_PHASE`, `__CPM_CAMPO2D_CV`, `__CPM_G141`, che esistono già): si aspetta
la **stessa tela** viva in `playing` per 1,5 s di fila (attesa sul battito del gioco, fino a 60 s) e la lettura parte **nello
stesso compito JS** in cui l'attesa la vede viva, quindi nessun render React in mezzo. Se in 60 s non succede: «non giudicato» = rosso.

**Dopo:** **3 corse di fila** (`CPM_PROVA_ROSSO=1 node tifosi-171.mjs`, verde + rosso), tutte uscita 0: verde 8/8 misure,
rosso cade 8/8 (2D con la maglia del giorno in 8/8, bandiere 3D senza il secondo colore in 8/8). VEL v VAL su PC, identica nelle
tre corse: verde curva club 96% su 1872 px, cartelloni 100% su 6; rosso 0% su 1868 px.

## 3) box-fischio-169 — instabile su PC/sconfitta

**Prima (DECISIONI 13/11 00:40):** rosso 2/4 sulla 191, 1/3 sul ramo del 169; «pixel 1,15» con «Passaggi»/«Precisione
passaggi» nella foto del rettangolo misurato.

**Causa misurata** (sonda 186 su PC 1440×900, lettura ogni ~200 ms): la cerimonia leggera forzata resta in fase `ceremony`
con il riquadro fermo (13,740,1025,52) per circa 7 s, **poi la partita passa a `ended`** e il riquadro sparisce: al suo posto
c'è la schermata di fine partita con le statistiche. La vecchia sequenza (trova il riquadro → 400 ms → rettangolo → foto)
poteva scattare la foto dopo quel passaggio. Non è il riquadro che si sposta: è la fase che cambia fra misura e foto.
(Nota: il riquadro ha `pointerEvents:none`, quindi `elementFromPoint` non serve a dire chi sta sopra.)

**Correzione:** si aspetta il riquadro di **questo** esito (contiene il suo punteggio) in `ceremony` con il rettangolo uguale su
due letture; lo si marca (`data-g186`); misura e foto; poi si ricontrolla che lo stesso nodo marcato sia ancora montato, in
`ceremony`, con lo stesso rettangolo. Se no si rifà la cerimonia (al massimo 3 tentativi); mai coerente = non giudicato = rosso.
Il ritentativo viene stampato.

**Dopo:** **4 corse di fila** (verde e poi `CPM_PROVA_ROSSO=1`), tutte come devono: verde PASS 54 testi giudicati, 0 sotto
soglia, B 12/12; rosso 45 sotto soglia, B 3/12 → «difetto riprodotto». In **6 bracci su 8** il nuovo controllo ha intercettato
proprio la corsa su PC/sconfitta («13,740,1025.2,52 → riquadro assente o fuori da ceremony») e ha misurato coerente al
2° tentativo: è il caso che prima produceva il rosso.

## Dubbi e osservazioni (nessuna decisione presa)

- audio-161: palo e tiro fuori nella partita vera non sono comparsi con nessuno dei sette nomi provati; resta coperto solo dal braccio sintetico (controllo 6).
- tifosi-171: la causa è ricavata dal codice; il rosso della vecchia sonda non è stato riprodotto in questo giro.
- tifosi-171: fra le coppie scelte il club di casa TAT compare due volte (TAT v FEL e TAT v SAR); la regola «club tutti diversi» registra solo gli ospiti dopo la prima coppia. Non toccato: fuori dal compito.
- box-fischio-169: la fase `ceremony` forzata che passa a `ended` da sola dopo ~7 s potrebbe essere voluta dal gioco; non l'ho giudicata.
- `ci-runner.mjs` e `package.json` non toccati.
