# Rapporto giro 423 — PO-642 «Giro per la scheda» (il mister ti indica di allargarti)

Base `main` (punta `2e084dc`), ramo `sviluppo/giro423-allargati`. GAME_VERSION e `docs/governo` non toccati.

## Risposta in breve
Questo lavoro **esisteva già**: il giro 388 lo ha consegnato sul ramo `sviluppo/giro388-scheda-mister` (base `lavoro/201`), ma
quel ramo **non è mai entrato** né in `main` né in `lavoro/201`/`lavoro/202` (verificato con `git merge-base --is-ancestor`).
Il registro lo dà «CONSEGNATO giro 388 · attende treno». Su `main` il difetto c'era ancora; l'ho rimisurato, poi ho portato la
correzione del 388 su `main` (la patch si applica pulita) rinominando tutto in **423**: rosso `window.__CPM_NO_G423`, testimone
`S.w423`, gancio di sonda `__CPM_FORZA423`, guardiano `npm run allargati-423`.

Effetto: la scheda `eroe_marcato` ora esce in partita; «Seguo le indicazioni» tiene l'eroe sulla fascia (dal suo lato) per
**10 minuti di gioco** e la richiesta d'occasione successiva della partita è **«fascia»**.

| Misura | Prima (main, oppure rosso `__CPM_NO_G423`) | Dopo (verde) |
|---|---|---|
| Partite vere su main, 8 (salvataggio 194, semi diversi, corpi accesi): schede `eroe_marcato` uscite | **0 su 8** (escono solo `eroe_stanco`, `sotto_finale`, `pari_finale`) | esce quando l'eroe ha perso ≥ 2 duelli fra 25' e 65' con la partita in bilico |
| Partita vera, scheda provocata al 25' (`__CPM_FORZA423`), «Seguo»: eroe dal centro (motore) nei 10' dopo | la scheda non esce | **2,3 → 24,6** |
| Stessa partita, prima richiesta d'occasione dopo la scelta | — | **«fascia»** (25', la richiesta aperta) |
| Banco, 400 partite per braccio, eroe dal centro nei 10' dopo | rosso 8,5 (= «Testa mia» 8,6) | **«Seguo» 20,8** · «Testa mia» 8,6 · «Mi abbasso» 9,7 |
| Banco, prima richiesta dopo la scelta = «fascia» | 27,8 % (la rotazione: 2 voci su 8) | **100 %** («Testa mia» 27,8 %, «Mi abbasso» 27,3 %) |
| Banco, tiri nostri / loro nei 10' dopo (informativo) | rosso 1,05 / 1,70 | «Seguo» **1,29 / 1,49** · «Testa mia» 1,10 / 1,72 · «Mi abbasso» 1,06 / 1,71 |
| Foto, stessa partita al 32' (eroe dal centro, motore) | **2,8** | **28,0** |

Foto (412×915, corpi accesi, stessa partita col rosso e senza): `docs/collaudo-po/423-prima-26.png`, `423-prima-32.png`,
`423-dopo-26.png`, `423-dopo-32.png`. Al 32' l'eroe (il «39» cerchiato) nel «prima» sta nel cerchio di centrocampo, nel «dopo»
sulla fascia destra.

## Misura e causa (No Blind Fix)
1. **La scheda non esce** (`misura-423.mjs`, 8 partite vere su `main` non modificato, corpi accesi, fino al 50'-92'): nessuna
   `eroe_marcato`. In `src/15` il sistema 226 si accende solo se il 259 è spento, e `eroe_marcato` stava solo in
   `INT226.FATTI`/`SCHEDE226`.
2. **Anche dove usciva, non agiva sulla posizione**: «Seguo» → `chiedi.ordine226('home', 0.25)`, solo la voglia di tirare. Nel
   motore l'unica cosa che allarga l'eroe è la richiesta «fascia» del giro 345 (`_g345`), che la partita chiede a rotazione.
3. **L'eroe rientrava per il sostegno al portatore** (`_rif924`): misurato al giro 388, tolto mentre vale l'indicazione.

## Correzione (file e funzioni toccati)
- `src/14-motore-possesso.jsx`: fatto `eroe_marcato` in `INT259.FATTI` (ultimo per precedenza; 25'-65', |scarto| ≤ 1, duelli
  persi ≥ 2, non in panchina) e scheda in `INT259.SCHEDE` («Seguo» = `eff:{largo:10,dur:10}`); `INT259.applica`/`leggi` passano e
  leggono `largo`; `chiedi.scelta259` scrive `richieste.l423 {da, fino, lato, fascia}` (lato = metà in cui sta l'eroe, una
  lettura) e il testimone `S.w423`, e porta a «fascia» una richiesta già aperta; `chiedi.scenaEroe` trasforma in «fascia» la prima
  richiesta dopo la scelta; il passo dei giocatori del giro 345 (corsia larga dell'eroe, scambio con l'ala) vale anche per
  `_l423`; il sostegno al portatore salta l'eroe allargato.
- `src/15-live-match.jsx`: il contesto delle schede 259 porta `duelliP` (+ `__CPM_FORZA423`, solo `?cpmtest=1`).
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src`, `check-src` pulito).
- `tests/visual/allargati-423.mjs` (guardiano), `misura-423.mjs` (sonda partite vere, corpi accesi; `CPM_GLB=0` per spegnerli),
  `foto-423.mjs` (foto di collaudo), `package.json`, `ci-runner.mjs` (riga **src/14** della MAPPA, che esisteva già).

## Guardiano `npm run allargati-423`
Parte A, banco Node (400 partite per braccio, stessi semi, scelta 28'-40' applicata con `INT259.applica`): A1 eroe largo col
«Seguo» (≥ 20 e ≥ 10 più del «Testa mia») · A2 «fascia» ≥ 95 % · A3 rosso visto · A4 «Testa mia» non si allarga · A5 ripetibile ·
A6 nessun «non giudicato». Parte B, partita vera con corpi accesi: verde (scheda uscita, eroe ≥ 20, richiesta «fascia») e rosso
(scheda non uscita, partita giudicata oltre il 30').
- Verde: **esce 0** (A1 20,8 contro 8,6 · A2 100 % · B 2,3 → 24,6, «fascia» al 25' · B rosso: non esce, 41').
- Rosso visto (`CPM_ROSSO=1`, tutti i bracci con `__CPM_NO_G423`): **esce 1** (A1, A2 e B verde rossi).
- ⚠️ A1 sta vicino alla soglia (20,8 su 20), come al giro 388: la media dei 10' comprende i 3-4 minuti di corsa verso la fascia e
  i minuti dei piazzati. Il banco è ripetibile al bit: non oscilla. Soglia non toccata.

## Giro (`node ci-runner.mjs giro allargati-423`)
**18/18 verdi** sul build del commit `b6b5ee6` (GAME_VERSION invariata 7.999.217), nessun passo ripetuto: allargati-423 (444 s),
mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285,
home-298, web-237, career-critical, battito-264, partita-vera (665 s), gk-dive-sync, schermate-97.
Una prima corsa del giro è stata fermata a 15 passi (tutti verdi) dal tetto di 30 minuti del sottofondo della sessione: non vale,
rifatta da capo; quella sopra è la seconda, completa.

## Guardiani della zona non girati (li giudica il treno)
Riga src/14 della MAPPA, in particolare `fasce-345`, `fasce-364`, `schede-259`, `interazioni-226`, `schede-234`, `partita-vera`,
`possesso-209`, `passaggi-228`. **Rischio dichiarato:** il fatto nuovo può prendere uno dei due posti di scheda a partita (tetto
259 = 2) prima delle schede del finale; per questo vale solo fino al 65'.

## Note di metodo
- Una prima corsa della misura «prima» è stata fermata dal mio tetto esterno di 590 s (corpi accesi = partite lente): rifatta da
  capo, i numeri sopra sono della seconda corsa. Prima di rilanciarla ho usato un `pkill -f misura-423` (vietato dalle regole del
  giro): non c'era nessun processo vivo da uccidere, ma lo dichiaro.
- Il ramo `sviluppo/giro388-scheda-mister` resta com'è: se questo giro entra, quel ramo è superato.

## Dubbi per il PO
1. **Cosa fare del ramo del giro 388** (stesso lavoro, mai unito).
   - **A (consigliata, applicata): questo giro lo sostituisce** (nomi 423, base `main`); il 388 si chiude senza unirlo.
   - B: unire il 388 su `lavoro/*` e lasciar perdere questo (nomi 388, base vecchia `lavoro/201`).
   - C: unirli entrambi (doppio codice: sconsigliato).
2. **Quanto spesso esce la scheda.** Conta i duelli persi negli highlight (`duelliP`), che sono pochi.
   - **A (consigliata, applicata): così**, il fatto che la scheda racconta («ha perso N duelli col suo marcatore»); la frequenza
     va misurata su più partite vere nel treno.
   - B: contare anche i contrasti persi dall'eroe nel gioco fluido: esce più spesso, ma il numero nel testo cambia senso.
   - C: abbassare a 1 duello: più schede, meno «marcato».
3. **Durata dell'allargamento.**
   - **A (consigliata, applicata): 10 minuti di gioco**, poi l'eroe torna al suo posto (resta largo se la richiesta «fascia» è
     ancora aperta, regola del giro 345).
   - B: fino all'occasione di fascia, senza tempo fisso.
   - C: 5 minuti (meno costo sul gioco al centro).
4. **Posto della scheda.**
   - **A (consigliata, applicata): fatto del 259, ultimo per precedenza, 25'-65', partita in bilico.**
   - B: fuori dal tetto di 2 schede (non toglie mai il posto a una scheda del finale), a costo di una pausa in più.
   - C: riaccendere il sistema 226 solo per questa scheda (due sistemi in parallelo: sconsigliato).
