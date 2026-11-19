# Rapporto giro 254 — due controlli rossi sulla base `lavoro/197` (sigle-203 · voto-79)

Versione di riferimento: 7.999.197 (GAME_VERSION non toccata) · ramo `sviluppo/giro254-sigle-voto` (da `lavoro/197`,
poi unito di nuovo con `lavoro/197` a `a421dd9`, unione del giro 240). Origine: `RAPPORTO-giro248.md`, dubbi 6 e 7.

## A) `sigle-203`: «FC Lyon» 0,7 px fuori dalla casella a 360 px — corretto nel gioco

**Misura sulla base** (`CPM_VISTE=360,375,390 node sigle-203.mjs`, build `b00f40b`): 360 px → 1 nome fuori, FC Lyon
«FC Lyon» 0,7 px; 375 px → 0 sopra la soglia di allora, **ma massimo 0,5 px** (testo tagliato davvero, sotto la tolleranza
del guardiano); 390 px → 0.

**Causa** (sonda sul DOM, FC Lyon contro FC Monaco a 360 touch, campo normale e invertito, stessi numeri):

| nome | casella vera | testo vero (Range) | `clientWidth` | `scrollWidth` |
|---|---|---|---|---|
| «FC Lyon» | 40,70 px | 41,41 px | 41 | 41 |
| «Monaco» | 40,70 px | 41,16 px | 41 | 41 |

Il carattere (Barlow Condensed 13 px) e la scala dei nomi del giro 190/211 sono corretti: la scala scende di un gradino
solo se `scrollWidth > clientWidth + 0,5`. Ma `clientWidth` e `scrollWidth` sono **interi**, e con una casella frazionaria
(40,70 px) arrotondano entrambi a 41: il taglio di 0,7 px non si vede e il nome intero resta, ritagliato.

**Correzione** (`src/11-ui-kit-highlight.jsx`, `NomeSquadra182`): nuova `_ecc254(el)` che misura l'eccesso sub-pixel —
larghezza vera del testo (`Range`) contro la casella vera (rettangolo meno padding e bordi). La usano i tre punti che
prima usavano il confronto intero: la discesa di gradino, la riduzione del corpo del giro 203 (ora proporzionata alle
larghezze vere) e il `ResizeObserver`. Vale per ogni `NomeSquadra182`, non solo per la barra.
**Rosso `window.__CPM_NO_G254`** = il confronto intero di prima.
Dopo `node tools/build-src.mjs`, `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**.

**Guardiano `sigle-203`**: soglia d'eccesso **stretta** da 0,5 a 0,05 px (a 0,5 «Monaco» passava con 0,45 px tagliati) e
nuovo braccio `CPM_ROSSO254=1` (accende `__CPM_NO_G254` a 360 px e deve vedere il difetto). Aggiunto allo script npm
`sigle-203` dopo il rosso 203.

| corsa (build finale, unito con `lavoro/197` a421dd9) | esito |
|---|---|
| verde 360 · 375 · 390 touch | VERDE 18/0 — 520 nomi per vista, **fuori 0 (max 0 px)**, sotto lo stemma 0, corpo min 13 px |
| verde 1366 mouse | VERDE 8/0 — fuori 0 (max 0 px) |
| rosso 254 (360) | il difetto si vede: 6 nomi fuori, max 0,7 px |
| rosso 203 (360·375·390) | il difetto si vede: 520 fuori a 375 (max 9,2 px), 70 sotto lo stemma |

**Coi nomi del giro 251** (`sviluppo/giro251-nomi-tutti`, non ancora unito in `lavoro/197`): unione di prova **non
committata** (src unito senza conflitti, conflitto solo in `tests/visual/ci-runner.mjs`, build IDENTICO), sigle-203 verde
360·375·390 (18/0, max 0 px) e 1366 (8/0, max 0 px). Unione annullata, ramo di prova cancellato.

## B) `voto-79` «cieco» — sonda riparata

**Misura sulla base**: uscita 2, «B rosso senza render dopo l'interruttore»; e inoltre `pagellaTesto: null` in verde.
**Causa** (due, entrambe della sonda, il gioco è giusto):
1. dal giro 200 il pannello di fine gara è a **quattro schede** (puntini `data-cpm="puntino200"`): le fisarmoniche che la
   sonda cliccava per forzare un render («LE CONNESSIONI», «IL TUO TABELLINO»…) non ci sono più → dopo
   `__CPM_NO_VOTO79` nessun render, testimone `null`. Le schede nascoste sono `display:none`, quindi il loro testo non è
   in `innerText`.
2. dal giro 202 il voto sta **prima** dell'etichetta («6.2 / PAGELLA Sufficiente»): la regex cercava «PAGELLA / 6.2».
   Il controllo «pagella a schermo = motore» passava in silenzio senza giudicare.

**Riparazione** (`tests/visual/voto-79.mjs`, regole «Controlli instabili»: ciò che il gioco non produce si provoca dalla
sonda): la sonda visita le schede una per una coi puntini — raccoglie il testo di tutte e, cambiando scheda, **provoca**
il render (`setSk200`); le fisarmoniche restano come ripiego. Regex nei due ordini. **La pagella a schermo è ora
obbligatoria**: non letta = «misura non valida» = rosso.

Esito sul build finale: **verde, uscita 0** — (A) nessun «Enfant» a 17/18/19, rosso 3/3; (B) k12, 4 schede, verde
pagella a schermo 6,2 = testimone 6,2 = motore 6,2; rosso (formula) testimone **5,9 ≠ 6,2** → il rosso si vede.

## Controlli eseguiti (uno alla volta, CPM_CI_PAR=0, sul build finale)

| controllo | esito | durata |
|---|---|---|
| sigle-203 (verde 4 viste + rosso 254; rosso 203 sul build prima dell'unione 240) | verde / rossi visti | ~2,5 + 1 + 1 min |
| voto-79 | verde (uscita 0) | ~6 min |
| barra-221 | verde | 282 s |
| nomi-190 | verde | 52 s |
| nomi-211 | verde | 220 s |
| test:logic | verde | 2 s |
| save-compat | 12 pass · 0 fail | 11 s |
| nomi-248 (MAPPA src/11, sul build prima dell'unione 240) | verde + rosso 248 | 108 s |
| nomi-182 (MAPPA src/11, sul build prima dell'unione 240) | **ROSSO, identico sulla base** — vedi dubbio 1 | 242 s |

## Dubbi per il PO

1. **`nomi-182` è rosso anche sulla base `b00f40b`** (misurato sostituendo l'HTML con quello della base, poi ripristinato):
   a 375 px, calendario della carriera (`riga-cal-v2`, `src/18`), «▶ vs FC Milano Brera Primavera» è tagliato
   (167 > 165 px). Quella riga è testo semplice (`vs {md.opponentName}`), non passa da `NomeSquadra182`, quindi né la
   scala dei nomi né questa correzione la toccano. Nome del giro 248. Fuori dall'ambito di questo giro: non corretto.
2. **Correzione su tutti i `NomeSquadra182`**: la misura sub-pixel vale anche fuori dalla barra (slot dei club, liste).
   Nomi che prima restavano interi con meno di 1 px tagliato ora scendono di un gradino (es. abbreviato o sigla).
   È ciò che la regola del giro 182 chiede («si scende solo se il nome non ci sta davvero»), ma cambia il testo mostrato
   in qualche punto; nomi-182/190/211/248 e barra-221 restano verdi (salvo il dubbio 1, preesistente).
3. **Il conto «in sigla» di sigle-203 varia fra corse** (360 px: 346–363 su 520) a parità di build: dipende dall'ordine in
   cui le coppie passano sulla barra e dal ResizeObserver. Il guardiano non lo giudica (giudica fuori/sotto/pezzi), ma lo
   segnalo perché non sembri un effetto della correzione.
4. **voto-79: la riga «(voto X)» delle testate non compare in k12** (`votoTestata: null`): cercando «(voto » in `src/09` e `src/15` l'ho trovata
   solo sul titolo «decide — N reti» (eroe a segno). Il controllo resta «se la riga c'è»; il voto delle testate è giudicato
   dal testimone `__CPM_VOTO79`. Nel braccio rosso anche la pagella a schermo esce `null` (non giudicata lì, non serve al
   rosso): non ho indagato oltre.
5. **Controlli della MAPPA mirata per `src/11` non eseguiti**: 38 guardiani; ho eseguito quelli della consegna più
   `nomi-182` e `nomi-248` (gli unici legati ai nomi di squadra). Gli altri (fra cui `grafica-v2`, `partita-v2`,
   `carriera3-94`, `griglia-mobile`…) li lascio alla verifica di rilascio.
6. **Roadmap non aggiornata**: è un giro su ramo di sviluppo, nessuna versione spedita; come nei giri 245/248.
7. **Giro 251 ancora da unire**: quando sarà in `lavoro/197`, il conflitto di prova era solo in `tests/visual/ci-runner.mjs`.
