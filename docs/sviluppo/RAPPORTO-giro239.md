# Rapporto giro 239 — PO-497 · PO-498 · PO-507 (interviste, forma vera, ritocchi Rosa e rassegna)

Ramo `sviluppo/giro239-interviste-forma-ritocchi`, partito da `lavoro/197` (commit 9a5d8a6). `GAME_VERSION` non toccata (resta
7.999.197). Roadmap non aggiornata (giro su ramo, nessun rilascio). Rosso del giro: `window.__CPM_NO_G239` (spegne le quattro
correzioni insieme). File di gioco toccati: `src/07`, `src/09`, `src/15`, `src/18` (+ `CARRIER-MANAGER-AV.html` ricomposto,
`check-src` IDENTICO BYTE PER BYTE).

## PO-497 — sconfitta all'ultima giornata del girone che però qualifica

**Misura prima** (interviste-211 parte 6, braccio rosso = codice di prima): coppa europea girone WWWWW+L e WWWDW+L → domanda «Serata
europea amara. Cosa vi portate a casa da questa sconfitta?» con la risposta «Il girone è ancora aperto, ripartiamo dalla prossima»
(girone chiuso). Europeo 4 pt + L e 6 pt + L → «Con la maglia della Nazionale addosso cambia qualcosa…». Causa: `esitoTurno211`
(src/07) dava «nessuno» a chi si qualificava all'ultima giornata (decisione del giro 222: cambiava solo l'eliminazione).

**Correzione** (src/07): con la **stessa regola** che già decide l'eliminazione (`euroGroupKOPatch` per la coppa europea, 4 punti per
Europeo/Mondiale), una **sconfitta** all'ultima giornata che qualifica è l'esito nuovo `qualificato`:
- domanda dedicata (Europa e Nazionale): «Sconfitta, ma siete passati: sollievo o preoccupazione?» con tre risposte (diplomatico,
  diretto, umile);
- rilancio dedicato `RILANCIO239` (due per tono) sul passaggio arrivato perdendo («Agli ottavi però una serata così non basterà…»,
  «Passare perdendo: qualcuno dirà che siete stati fortunati…»), mai punti/classifica né girone aperto;
- «Serata europea amara» (e211 `nessuno`) non esce più in quel caso.
Vittorie e pareggi che qualificano restano «nessuno» (decisione del giro 222, verificato dal guardiano).

**Guardiano** `interviste-211` parte 6: 4 casi (2 coppa europea, 2 Europeo) + vittoria che qualifica invariata. Verde 46 ok · 0 ko;
rosso `CPM_ROSSO239=1` 42 ok · 4 ko (bocciato). Lo script npm ora esegue anche il rosso 239. Il guardiano ha trovato due difetti
nei miei testi alla prima stesura («i punti li abbiamo fatti prima» = punti fuori dal campionato; un rilancio che non citava il
passaggio): corretti, nessuna soglia toccata.

## PO-498 — la forma vera di ogni squadra

**Misura prima** (forma-239, braccio rosso): con un salvataggio vecchio senza sequenza, la grafica TV pre-partita mostrava per
l'avversario la striscia **inventata** «N P V V V» (bilancio 3V 1N 1P rimescolato).

**Correzione:**
- `src/09` `updateStandings`: ogni riga di classifica tiene i suoi ultimi 5 esiti di campionato nel campo **facoltativo** `f239`
  (stringa "W"/"D"/"L", il più recente in fondo), scritto in **un solo punto** a fine funzione dal confronto fra la riga di prima e
  quella di dopo (copre la tua partita, l'avversario speculare, il turno di riposo e le coppie simulate). Nuova `forma239(riga)`:
  restituisce le ultime min(5, gare) **solo se** `f239` le copre, altrimenti `null`.
- `src/15` `_tvTeamStat`: per le altre squadre la forma è `forma239`; se manca, **nessuna striscia** (la grafica TV mostra «—» al
  posto di «— esordio stagionale», il bilancio resta nelle righe sopra). La tua squadra resta sulle tue ultime 5 di campionato da
  `matchHistory`, come prima.
- Anteprima della rassegna (scheda 4): la striscia «Forma» torna, ma **solo con la forma vera** (`vera239`).
- Compatibilità: campo facoltativo, nessuna migrazione, **nessun cambio di `SAVE_VERSION`**. Un salvataggio vecchio mostra solo il
  bilancio finché le giornate nuove non coprono le ultime 5 (misurato: null subito, null dopo 4 giornate, vera alla 5ª).

**Guardiano nuovo** `forma-239` (≈ 6 min): L) logica su 10 giornate seedate, 18/18 squadre con la forma uguale a quella ricavata
dalla sonda in modo indipendente; salvataggio vecchio come sopra. T) grafica TV vera (fase walkout): avversario con `f239` WDLWW →
«V N P V V»; salvataggio vecchio → «—». A) anteprima della rassegna dopo una partita vera: striscia = forma salvata («V V N P V»).
Verde 6/6, rosso `__CPM_NO_G239` bocciato 3/3. Registrato in `package.json`, nelle catene `completa` e `carriera` e nella mappa di
`mirata` per `src/09` e `src/15` (una volta sola per catena, `node --check` ok).

**`anteprima-230` aggiornato:** il suo verde resta (classifica del banco senza `f239` → nessuna striscia); il rosso ora accende
`__CPM_NO_G230` **e** `__CPM_NO_G239`, perché la striscia inventata torna solo spegnendo anche il giro 239. Verde 3/3, rosso
bocciato.

## PO-507 (a) — Rosa: il ruolo intero al tocco

`SiglaRuolo239` (src/09, accanto a `siglaRuolo228`): la sigla diventa un tasto (`role="button"`, Invio/Spazio da tastiera); un tocco
apre un fumetto col ruolo intero (+ etichetta jolly/U21) sopra la sigla, in un portale sul `body` (il testo della riga resta la
sola sigla); si chiude con un tocco altrove, con lo scorrimento o dopo 3 s. In src/18 cambia **solo** il tag della sigla (la riga
del nome, dove il giro 257 mette la «R» del rigorista, non è toccata). Foto: `docs/sviluppo/giro239/rosa-fumetto-360.png`.

**`rosa-228` aggiornato:** 6 sigle toccate per braccio: fumetto aperto 6/6, ruolo giusto 6/6 (= aria-label), sopra la sigla e dentro
lo schermo 6/6, chiuso da un tocco altrove 6/6, testo della riga invariato 6/6; rosso `__CPM_NO_G239` 0/6 aperti (bocciato); rosso
228 invariato e bocciato. Nota di metodo: alla prima corsa una sigla risultava «non aperta» — misurato con `elementFromPoint`, era
coperta dal pulsante flottante «Idee e feedback» in fondo allo schermo (la sonda la toccava lì): ora la sonda porta la riga al centro.

## PO-507 (b) — rassegna: «4/4 · Tabellone»

`src/15` `_nav200`: se la scheda 4 mostra il tabellone (`rassegnaComp232` tipo `tabellone`, stessa chiamata pura della scheda),
l'etichetta in basso dice «4/4 · Tabellone» e il puntino «Tabellone e prossima partita».

**`rassegna-232` aggiornato:** in ogni partita vera si legge l'etichetta: campionato, girone europeo, Coppa delle Nazioni →
«Classifica»; coppa nazionale, Europeo KO → «Tabellone». Verde 27/27; rossi `__CPM_NO_G232` e nuovo `__CPM_NO_G239` (coppa,
etichetta torna «CLASSIFICA») bocciati 2/2.

## Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito |
|---|---|
| interviste-211 (npm: verde + rosso 222 + rosso 239) | ✅ |
| forma-239 (nuovo) | ✅ verde 6/6, rosso 3/3 |
| rosa-228 | ✅ (verde + rosso 228 + rosso 239) |
| rassegna-232 | ✅ 27/27, rossi 2/2 |
| anteprima-230 | ✅ 3/3, rosso bocciato |
| rassegna-224 | ✅ 10/10, rosso bocciato |
| save-compat | ✅ 12 pass · 0 fail |
| test:logic | ✅ |
| nucleo veloce: design-system, tema-unico, typing-shortcuts | ✅ |
| mappa: interviste-183, classifica-102, migrazione-194 | ✅ |
| mappa: classifica-194 | **non giudicato** (fermato dal mio tetto di 280 s, errore mio di strumento; non rieseguito) |
| mappa: intervista-231 | **non giudicato**: nessuna riga d'uscita in 26 min, fermato per PID (non so se è lento o appeso; non l'ho confrontato con `lavoro/197`) |

La mappa `mirata` per i quattro file toccati vale **162 passi** (src/15 e src/18 trascinano quasi tutto): non li ho eseguiti tutti.
Non eseguiti per regola: highlight-95, career-critical, ingresso-206. Gli altri passi della mappa restano alla verifica di rilascio.

## Dubbi per il PO (nessuna decisione presa)

1. **Solo la sconfitta.** «Qualificato» vale solo per la sconfitta che qualifica, come chiesto. Un **pareggio** all'ultima giornata
   che qualifica resta «nessuno» e può ancora ricevere domande neutre (non «Serata europea amara», che è solo per le sconfitte); se lo
   si vuole dedicato anche al pareggio è un'estensione di una riga.
2. **«Ottavi» nel rilancio.** Due rilanci nominano gli ottavi: è il turno dopo il girone sia nella coppa europea (`r16`) sia
   nell'Europeo/Mondiale (`koPhase` r16). La Coppa delle Nazioni non ha questo caso (il suo girone non passa da `esitoTurno211`).
3. **Forma solo di campionato.** `f239` registra le giornate di campionato (dove nasce la classifica); coppe e Europa non entrano,
   come per la tua squadra (che usa le ultime 5 di **campionato** da `matchHistory`).
4. **Salvataggi vecchi.** Per le squadre già a metà stagione la striscia ricompare dopo 5 giornate giocate con la versione nuova;
   fino ad allora la grafica TV mostra «—» e il bilancio. Alla stagione nuova la classifica riparte da zero e la forma con lei.
5. **Anteprima della rassegna e decisione del giro 230.** La decisione PO 16/11 era «Solo bilancio V/N/P»; PO-498 chiede la forma vera
   anche lì: la striscia torna solo quando è vera. Il bilancio resta nella riga «Classifica».
6. **Fumetto sopra la riga precedente.** Il fumetto si apre sopra la sigla e copre per 3 s la sigla/OVR della riga sopra (vedi foto).
   Sulla prima riga visibile ci sta comunque (il guardiano controlla che resti nello schermo). Se preferisci sotto, è un ritocco.
7. **Tasto piccolo.** La sigla è a misura `caption` (circa 26×16 px): toccabile ma piccola; non ho allargato l'area di tocco per non
   spostare l'impaginazione della riga misurata dal giro 228.
8. **Osservazione della sonda, non indagata.** Nella sonda della grafica TV, riscrivere **tutte** le righe di classifica a 10 gare
   alla settimana 2 faceva sì che «Gioca la partita» non montasse la partita (si tornava alla home). Con la sola riga
   dell'avversario modificata tutto funziona. Probabile controllo di coerenza calendario↔classifica, ma non l'ho misurato.
9. **Coordinamento col giro 259** (ordinamento della classifica, seme dell'intervista a sorpresa in src/07): non ho toccato l'ordinamento
   né `intervista183`/seme della sorpresa; in src/09 ho aggiunto righe **prima** del `return s.sort(...)` di `updateStandings`
   (riga invariata), in src/07 ho lavorato in `esitoTurno211`, nel catalogo e in `rilancio24`.
10. **Coordinamento col giro 257** («R» del rigorista nella Rosa): la sua «R» sta sulla riga del nome, io ho cambiato la riga
    successiva (tag della sigla). Le due modifiche sono su righe **adiacenti**: all'unione git potrebbe segnalare un conflitto
    banale da risolvere tenendo entrambe.
11. Controlli non giudicati: `classifica-194` e `intervista-231` (vedi tabella).
