# Rapporto giro 274 — salti-274: il colpo di testa su angolo col pallone sulla bandierina

Ramo `sviluppo/giro274-salti` da `lavoro/197` (a81ebb10). Decisione PO-516 (18/11 14:10): un rosso nato nella 197 si ripara prima dell'uscita.
**Gioco corretto** in `src/12-three-match-view.jsx` (un solo blocco), rosso `window.__CPM_NO_G274`. Nessun `GAME_VERSION`, nessuna soglia toccata, nessun asset nuovo. Motivazioni in `docs/governo/DECISIONI.md` (voce «giro 274»), invariante in `CLAUDE.md`.

## In breve

- Il rosso di `salti-274` sulla 197 è un **difetto del gioco che c'era già nella 196**: il blocco che lo produce non è cambiato nel lotto (zero righe di differenza fra 3076a1b7 e a81ebb10).
- Nella 197 lo si vede perché il giro 264 (commit **8f029f61**) cambia lo svolgimento della partita di prova: al 25' arriva un colpo di testa su azione d'angolo, che nella 196 la stessa partita non gioca.
- Corretto il gioco: il pallone lontano ora **vola** alla testa invece di essere trascinato. `salti-274` verde 2 volte di fila, rosso col rosso.

## Esiti

| Controllo | 7.999.196 (3076a1b7) | 197 prima (a81ebb10) | 197 dopo (questo ramo) |
|---|---|---|---|
| `salti-274`, partite intere | verifica V1a: verde (620 s), 0 salti · qui, sorgente 196 col banco della 197, solo «Ivo Mansi»: 0 salti | verifica V1a: rosso 2/2 · qui: **rosso 1/1**, «Ivo Mansi» 2 salti non spiegati (arco 13,4u/0,028s · 8,5u/0,029s), gli stessi numeri | **verde 2/2 di fila** (609 s · 646 s): Ivo Mansi 0, Nando Orsi 0; velocità massima nel caricamento 42,8 e 43,9 u/s (soglia 60) |
| `salti-274`, colpo di testa provocato (gi6, gi7) | non esiste (braccio nuovo) | col rosso `__CPM_NO_G274` (= comportamento di prima): 397,6 e 415,7 u/s, 1 salto non spiegato per scena | verde 2/2: 31,9 u/s in entrambe, 0 salti, pallone a 0,44 e 0,47 u dalla testa quando parte l'arco · **rosso cade** (40 s) |
| Stessa scena del 25' (sonda di diagnosi, 1 corsa) | la partita non passa da quella scena | pallone a 34,8 u dalla testa, trascinato in 5 fotogrammi: 34,8 → 21,4 → 12,9 → 7,6 → 4,4 u | 34,8 u in volo per 1,09 s di scena, 31,9 u/s, arriva a 0,63 u, 0 salti |
| `testa-146` (verde + rosso) | — | — | verde (262 s), il rosso si vede |
| `testa-143` (verde + rosso) | — | — | verde (273 s), il rosso si vede |
| `apertura-261` | — | — | verde (177 s): salti scoperti in conclusione 0, teletrasporti 0 |
| `goal-postarc` | — | — | verde (659 s) |
| `camera-241` | — | — | verde (747 s), verde col verde e rosso col rosso |
| `inquadra-273` | — | — | verde (669 s), 0,0% |
| `esiti-241` | — | — | verde (318 s), il rosso si vede |
| `test:logic` | — | — | 51/51 |
| `save-compat` | — | — | 12 pass · 0 fail |

«—» = non eseguito in questo giro su quella versione.

Guardiani della mappa mirata per `src/12`, limitati a salti, arco, conclusione, tiro e camera: `salti-274`, `apertura-261`, `goal-postarc`, `testa-143`, `camera-241`, `inquadra-273`, `esiti-241`; in più `testa-146`, che misura proprio il blocco toccato. `solo-highlight-166` e `battito-264` non eseguiti: `src/15` non è stato toccato. Non eseguiti, come da consegna: `highlight-95`, `ingresso-206`, `career-critical`. Gli altri guardiani della mappa di `src/12` (portiere, coreografie, tunnel, ingresso, stadi, pelle…) non sono stati eseguiti: fuori dal perimetro dato.

## Che cosa succede (misurato)

Partita «Ivo Mansi», seme 7, 25': colpo di testa («Testa piazzata all'angolo», esito «fuori») su azione d'angolo. Quando l'esito si arma il pallone è ancora sulla bandierina (97; 97,5 in coordinate logiche), l'eroe è in area (87,6; 48,3): 34,8 u fra testa e pallone. L'attesa «il colpo aspetta il pallone» (giro 146, guadagno 14/s del giro 121) avvicina il pallone alla testa di una frazione fissa per fotogramma: con 34,8 u sono 13,4 u e poi 8,5 u in un fotogramma da 0,028 s, cioè circa 480 u/s. Sono i due salti che il controllo conta.

È lo stesso difetto del giro 53 (PO-274, «il pallone lontano vola al piede, non scivola»): allora fu riparato sul solo ramo del calcio, quello del colpo di testa mancava.

## Commit che lo fa nascere

**8f029f61** — «Giro 264: il battito della partita intera si applica per intero prima del successivo (flushSync)».

Come l'ho trovato: `git bisect` fra la base comune 12d8f0d4 (196) e a81ebb10, sui soli commit che toccano `src/`, giocando ogni volta la partita «Ivo Mansi» fino al 25' con la sonda di diagnosi (stessa regola di `salti-274` per i salti non spiegati).

| Commit | Salti non spiegati | Scene giocate (minuto: tipo) |
|---|---|---|
| 12d8f0d4 (196) | 0 | 3' tiro · 7' contrasto · 11' punizione · 19' colpo di testa (parato) |
| 92fbad81 (unione 235) | 0 | come sopra |
| d410bda8 (unione 255) | 0 | come sopra |
| 168f28a2 (unione 239), 2ª corsa a tempo pieno | 0 | come sopra, poi 42' passaggio |
| ba99108c (unione 259), genitore di 8f029f61 | 0 | come sopra |
| ba99108c, ripetuto come «genitore di 8f029f61» a tempo pieno | 0 | come sopra, poi 42' passaggio |
| **8f029f61 (giro 264)** | **2** | 3' tiro · 7' contrasto · **19' passaggio · 25' colpo di testa (fuori)** · 35' tiro |
| 5ce2419c, cf918922 (giro 264, seguito) | 2 | come 8f029f61 |
| a81ebb10 (197) | 2 | come 8f029f61 |
| a81ebb10 con `__CPM_NO_G264` | 0 | come la 196: 11' punizione · 19' colpo di testa (parato) · 42' passaggio |

Il giro 264 non tocca il colpo di testa: cambia i minuti e il tipo delle scene a parità di nome e seme, e la partita nuova passa da una scena che il difetto, già presente, rovina. I sospetti 265, 241, 261, 262/263, 257 e 251 sono esclusi dalla tabella (tutti dentro commit «buoni» o ininfluenti col 264 spento).

Limiti di questa ricerca:
- Una corsa per commit (due su 168f28a2 e ba99108c). Sulla 197 (a81ebb10) il risultato si è ripetuto identico in 2 corse mie su 2, con gli stessi numeri delle 2 corse della verifica V1a.
- La prima corsa su 168f28a2 era tagliata a 100 s, si è fermata prima del 25' e mostrava già «19' passaggio» senza la punizione dell'11': uno svolgimento diverso dalla seconda corsa sullo stesso commit. Lo svolgimento della partita di prova quindi **non è sempre identico** a parità di codice. Non ho misurato quanto spesso succede.

## Correzione

`src/12-three-match-view.jsx`, blocco «il colpo aspetta il pallone» (giro 146):
- se quando il colpo di testa si arma il pallone è **oltre 4 u** dalla testa (la soglia già usata dal volo al piede), il pallone fa una parabola fino alla testa a 32 u/s di scena e il colpo aspetta che arrivi;
- sotto 4 u resta l'attesa di prima (tetto 0,8 s, guadagno 14/s): le scene che `testa-146` misura non cambiano;
- finito il volo il colpo parte da dove il pallone è: non c'è più trascinamento;
- tetto del volo 6 s reali (quello della scena d'esito), non 2,4 s come nel calcio: sul banco, con 2,4 s, il volo di 28-30 u si fermava a 3,1-4,3 u dalla testa;
- `window.__CPM_NO_G274` rimette il comportamento di prima;
- `window.__CPM_TESTA274_LONTANO` (solo `?cpmtest=1`) è la provocazione di collaudo: mette il pallone sulla bandierina quando il colpo si arma. Fuori dal banco non esiste.

Testimone `window.__CPM_TESTA274` (solo banco, in entrambi i bracci): distanza all'armo, velocità di scena massima del pallone nell'attesa, distanza testa-pallone quando parte l'arco.

## Guardiano

`salti-274` resta com'era nelle partite e nelle soglie (0 salti non spiegati, velocità ≤ 60 u/s, «sonda cieca» se nessuna conclusione col pallone lontano). In più:
- due scene provocate, una pagina nuova per scena (gi6 e gi7 con `__CPM_TESTA274_LONTANO`), perché che una partita produca un colpo di testa su angolo dipende dal suo svolgimento;
- verde: ogni scena giudicata, 0 salti non spiegati da quando il colpo si arma, velocità ≤ 60 u/s, pallone a ≤ 1,0 u dalla testa quando parte l'arco;
- rosso (`__CPM_NO_G274`): velocità > 150 u/s in ogni scena;
- scena senza testimone = non giudicata = rosso (uscita 2);
- si aspetta l'evento (l'arco è partito), non un tempo fisso;
- `npm run salti-274` ora esegue verde e poi rosso. Nel braccio rosso del solo colpo di testa le partite intere si saltano e la sonda lo dichiara; il rosso storico `CPM_ROSSO=__CPM_NO_VOLO274` funziona come prima.

La sonda di diagnosi usata per la ricerca è nel ramo: `tests/visual/diag-274.mjs` (stessa partita di `salti-274`, con l'elenco delle scene; non è un guardiano e non è in nessuna catena).

`tests/visual/ci-runner.mjs` non è stato toccato (`salti-274` era già nella mappa di `src/12`); `node --check` passa.

## Dubbi per il PO

1. **Il giro 264 cambia la partita a parità di nome e seme.** Con `__CPM_NO_G264` la partita «Ivo Mansi» è quella della 196 (punizione all'11', colpo di testa al 19'); col 264 acceso diventa passaggio al 19' e colpo di testa su angolo al 25'. Non so se questo effetto fosse voluto dal 264 o sia un effetto collaterale. Non l'ho toccato: il lotto è chiuso e non è il controllo assegnato.
2. **Gesto e pallone sul colpo di testa da lontano.** Ora il pallone arriva alla testa dopo circa 1 s di scena (34,8 u). Non ho verificato a occhio se il gesto del colpo di testa cade sull'arrivo del pallone o prima: i numeri dicono solo che il pallone arriva (0,44-0,63 u) e non salta. Serve un'occhiata sul dispositivo.
3. **Tetto del volo a 6 s reali invece di 2,4 s.** È una scelta mia, motivata dalla misura sul banco (vedi «Correzione»). Sul calcio il tetto resta 2,4 s: su un dispositivo molto lento (sotto circa 9 fotogrammi al secondo) lì il volo può ancora fermarsi prima del piede. Non l'ho cambiato.
4. **Un altro salto, non di questo giro.** Sulla scena forzata gi6 c'è un salto di 7-8 u in un fotogramma **durante la costruzione dell'azione**, prima che il colpo si armi (scrittori «buildup-volo+testa»). C'è anche senza la provocazione e non dipende da questa correzione. Il nuovo braccio lo conta a parte («salti prima dell'armo») e non lo giudica. Non so se c'è anche sulla 196: non l'ho misurato lì.
5. **Svolgimento non sempre identico** (vedi i limiti della ricerca): una corsa su 168f28a2 ha dato una partita diversa dalla successiva sullo stesso commit. Se succede anche sul banco di rilascio, `salti-274` sulle partite intere può vedere scene diverse da un giro all'altro; le due scene provocate non ne dipendono.
6. **Altri guardiani della mappa di `src/12` non eseguiti** (perimetro dato dalla consegna). La modifica vive in un solo blocco, attivo solo sul colpo di testa col pallone oltre 4 u; non posso confermare con una misura che gli altri restino verdi.
