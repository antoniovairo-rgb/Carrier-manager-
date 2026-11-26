# Rapporto giro 385 — PO-521: la festa a fine partita giudicata su partite GIOCATE

Ramo `sviluppo/giro385-festa`, partito da `lavoro/201` (punta `29d758c8`). `GAME_VERSION` e `docs/governo` non toccati.
Tutte le misure sono del banco (sessione cloud, Chromium headless, GLB spento, velocità 2×), nessuna è del telefono.

## La decisione da cui parte

Giro 266, dubbio 1 → DECISIONI 18/11 16:40 (PO-521): «Sì, controllo a parte», con partite vinte **giocando** (autoplay seedato,
nessun risultato forzato) e «persa → nessuna festa» come esito valido da verificare. Il giro 266 provocava sia la vittoria
(`__CPM_SALTA297`) sia le statistiche dell'eroe (`__CPM_FESTA942_FORCE`): il nuovo controllo non usa **nessuno dei due**.

## La regola che il guardiano giudica (src/15, `_goEndOrCeremony`, invariata)

Al fischio, in ordine: premiazione (`titleStakes`) → «big win» (finale KO o mw ≥ 9) → festa del 23/09: **vinta E (partita
importante: mw ≥ 7 o coppa/KO, OPPURE prestazione super: voto ≥ 8, ≥ 2 gol, gol+assist ≥ 3)** → altrimenti nessuna scena.
Quindi «vinta» da sola non basta: una vittoria 1-0 con voto 6,7 non fa festa, ed è giusto così (lo dice la regola del PO del 23/09).

## Cosa ho fatto

1. **Sonda/guardiano `tests/visual/festa-385.mjs`** (`npm run festa-385`). Ogni partita si gioca intera col pilota automatico
   seedato fino a `ended`, campionando la fase ogni 250–400 ms. Per partita legge: tabellone (`__CPM_SCORE`), se la fase è passata
   da `ceremony`, il punteggio **mostrato** nella fascia `[data-cpm="box-fischio"]` (DOM), gli ingressi della regola dal testimone
   già esistente `__CPM_FESTA942` (gol, assist, voto, mw) e il ramo del fischio dal testimone nuovo `__CPM_FESTA385`.
   - **verde** se: vinta con merito → festa, col punteggio a schermo uguale al tabellone (ordine casa–ospite); vinta senza merito,
     pari, persa → nessuna festa; **copertura** di almeno una vinta con festa e almeno una non vinta. Senza copertura, o con una
     partita senza testimoni, = non giudicato = rosso. Una cerimonia di titolo già deciso (`titleStakes.late`) è «non giudicata».
   - **rosso** (`CPM_ROSSO` interno al guardiano → `window.__CPM_PROVA385=1`): il gioco fa la festa su ogni partita e rovescia il
     punteggio della fascia; il guardiano esce 0 solo se il rosso lo vede.
2. **src/15** (`_goEndOrCeremony`, blocco dopo i rigori), due aggiunte, entrambe attive **solo con `?cpmtest=1`** (`_CPM_TEST`):
   - gancio di difetto provocato `__CPM_PROVA385` (condizione della festa e ordine del punteggio di `_fd47`);
   - testimone inerte `__CPM_FESTA385 = {ramo: nessuna|titolo|bigwin|festa, home, away, mw, late, ctx}`.
   Per i giocatori il comportamento è identico (nessun ramo nuovo raggiungibile). `CARRIER-MANAGER-AV.html` ricomposto con
   `build-src`, `check-src` allineato.
3. **MAPPA**: `festa-385` in testa alla riga esistente `[/src\/15-/ …]` di `ci-runner.mjs`; script in `package.json`.

**Nessun difetto del gioco trovato**: ogni partita giocata ha prodotto la scena che la regola prevede, quindi nessuna correzione
alla sorgente e nessun rosso `__CPM_NO_G385` (il rosso del guardiano è il difetto provocato `__CPM_PROVA385`).

## Semi ed esiti (partite giocate, nessun risultato forzato)

`c:N` = partita di campionato dal salvataggio del PO `fixtures/save-c177-s5w20.json` (stagione 5, giornata 20, attaccante OVR 74,
FC Frankfurt), nome dell'eroe + « F<N>», seme autoplay N. `p:N` = provino (`openMatch`, nome «Festa385-N», seme N).

| Seme | Tabellone | Eroe (gol · assist · voto) | Ramo | Festa a schermo | Giudizio |
|---|---|---|---|---|---|
| c:1 | 0-1 persa | 0 · 0 · 5,9 | nessuna | no | verde |
| c:2 | 4-0 vinta | 2 · 0 · 8,0 | festa | «4 – 0» | verde |
| c:3 | 1-1 pari | 1 · 0 · 7,3 | nessuna | no | verde |
| c:4 | 1-0 vinta | 0 · 0 · 6,7 | nessuna (vinta senza merito) | no | verde |
| p:1 | 2-0 vinta | 0 · 2 · 7,4 | nessuna (vinta senza merito) | no | verde |
| p:2 | 0-0 pari | 0 · 0 · 6,3 | nessuna | no | verde |
| p:3 | 2-0 vinta | 2 · 0 · 7,9 | festa | «2 – 0» | verde |

**Riproducibilità:** c:1, c:2, c:3, p:3 giocati due volte in due corse separate (ricerca e guardiano) → **stessi tabelloni e stesse
statistiche**. Due corse non bastano a dire che lo saranno sempre (tabellino-228 dichiara partite divergenti sul suo caso); per
questo il guardiano gioca la lista finché ha la copertura (12 semi, 3 in parallelo).

**Scartato:** il salvataggio S12 (`save-190-s12-ovr93`, giornata 38): è l'ultima giornata e la premiazione del titolo scatta anche
sulla sconfitta (`titleStakes.late`, misurato su c:2 di quella prova: 0-1 → `ceremony` senza festa). Non è un difetto della festa.

## Controlli

| Controllo | Esito | Durata |
|---|---|---|
| `festa-385` verde | 4 partite · 2 vinte con festa · 2 non vinte senza festa · 0 difetti · 0 non giudicate | ~6 min |
| `festa-385` rosso | 3 partite · 3 difetti visti (festa su persa 0-1; «0 – 2» contro 2-0; «0 – 4» contro 4-0) | ~5,5 min |
| `mappa-unica` | verde col verde, rosso con la mappa vecchia | <1 min |
| `node ci-runner.mjs giro festa-385` (guardiano + 17 sentinelle) | **18/18 verdi** | ~70 min |

`node ci-runner.mjs giro festa-385` sul commit del guardiano (build 7.999.215): **18/18 verdi** — festa-385 893 s · mappa-unica ·
test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile · render-3d-023 · tunnel-285 ·
home-298 · web-237 · career-critical · battito-264 · partita-vera · gk-dive-sync · schermate-97. Nessun passo instabile.
Foto rigenerate in `docs/collaudo-grafico/` e `docs/governo/STABILITA.json` scritti dal runner: rimessi con `git checkout --`, non
sono nel commit.

**Guardiani della zona NON girati da me** (li giudica il treno): gli altri della riga `src/15-` (fra cui `nomi-368`,
`partita-336`, `gigante-212`, `rigori-296`, `box-fischio-169`, `tabellino-228`) e la catena completa.

## Dubbi per il PO

1. **La festa vuole merito, quindi «vinta» non basta.** Misurato: 2 vittorie su 4 giocate (1-0 voto 6,7; 2-0 con 2 assist voto 7,4)
   non fanno festa, come dice la regola del 23/09. Opzioni:
   - **(consigliata, applicata)** il guardiano giudica la regola com'è: vinta con merito → festa, vinta senza merito → nessuna festa
     (esito valido come «persa»);
   - il guardiano pretende la festa su ogni vittoria → sarebbe rosso oggi e contraddirebbe la decisione del 23/09;
   - abbassare la soglia del merito nel gioco (es. 2 assist bastano) → decisione di gioco, non di controllo.
2. **mw = 1 anche nelle partite di campionato dal salvataggio** (testimoni `__CPM_FESTA942` e `__CPM_FESTA385`, tutte e quattro le
   `c:N`). Quindi il ramo «partita importante» (mw ≥ 7) e la «big win» (mw ≥ 9) **non sono stati esercitati giocando**. Non ho
   verificato se per quell'avversario 1 sia il valore giusto di `calcMatchWeight`. Opzioni:
   - **(consigliata, applicata)** dichiararlo qui e lasciare il guardiano sulla festa da prestazione super, l'unica che le partite
     giocate producono oggi; misurare `calcMatchWeight` in un giro a parte;
   - aggiungere un salvataggio con un big match/derby in calendario (mw ≥ 7) e un seme che lo vinca;
   - una coppa giocata dal salvataggio.
3. **Durata.** Un braccio gioca 3–4 partite intere (4–6 min l'una a 2×), 11–12 minuti verde + rosso. Opzioni:
   - **(consigliata, applicata)** guardiano nella riga `src/15-` com'è, 3 partite in parallelo, uscita alla copertura;
   - solo nel treno grande notturno (`SOLO_NOTTE_329`);
   - un solo seme per esito (3 partite): più corto, ma cieco se un seme cambia esito.
4. **Il gancio di prova sta nel gioco.** `__CPM_PROVA385` vive in src/15 sotto `_CPM_TEST`. Opzioni:
   - **(consigliata, applicata)** gancio nel gioco, spento fuori dal banco (stessa famiglia di `__CPM_SALTA297`);
   - un rosso solo lato sonda (rovesciare la lettura): non proverebbe che il guardiano vede un difetto del gioco.
