# Rapporto giro 388 — PO-642 «Giro per la scheda» (il mister ti indica di allargarti)

Base `lavoro/201` (punta `29d758c8`), ramo `sviluppo/giro388-scheda-mister`. GAME_VERSION e `docs/governo` non toccati.

## Risposta in breve
La scheda non spostava l'eroe perché **in partita non usciva più**: viveva solo nel vecchio sistema delle schede (PO-226),
che dal PO-259 è spento quando il sistema nuovo è acceso (cioè sempre). E anche nel vecchio sistema «Seguo le indicazioni»
cambiava solo la voglia di tirare della squadra (+0,25): nessun canale verso la posizione dell'eroe né verso la richiesta
d'occasione. Ora la scheda esce dal sistema nuovo, «Seguo le indicazioni» tiene l'eroe sulla fascia per **10 minuti di gioco**
e la richiesta d'occasione dopo la scelta è **«fascia»**.

| Misura | Prima (rosso `__CPM_NO_G388`) | Dopo (verde) |
|---|---|---|
| Partite vere (8, salvataggio 194, semi diversi): schede `eroe_marcato` uscite | **0 su 8** (escono solo schede del 259) | esce quando l'eroe ha perso 2 duelli fra 25' e 65' con la partita in bilico |
| Partita vera con la scheda provocata al 25' (`__CPM_FORZA388`), «Seguo»: eroe dal centro nei 10' dopo (motore) | la scheda non esce | **2,2 → 25,5** |
| Stessa partita, prima richiesta d'occasione dopo la scelta | — | **«fascia»** (25', la richiesta aperta) |
| Banco, 2.000 partite per braccio, eroe dal centro nei 10' dopo la scelta | «Seguo» 9,1 (= «Testa mia») | **«Seguo» 21,1** · «Testa mia» 9,1 · «Mi abbasso» 9,6 |
| Banco, prima richiesta dopo la scelta = «fascia» | 27,0 % (la rotazione: 2 voci su 8) | **100 %** («Testa mia» e «Mi abbasso» restano alla rotazione, 27 %) |
| Banco, tiri nostri / loro nei 10' dopo | 1,18 / 1,63 | «Seguo» **1,33 / 1,53** · «Testa mia» 1,21 / 1,63 · «Mi abbasso» 1,14 / 1,57 |

## Misura e causa (No Blind Fix)
1. **La scheda non esce.** `misura-388.mjs` (nuova sonda, percorso di `misura-226`): 8 partite vere seedate, nessuna scheda
   `eroe_marcato`; l'unica scheda uscita è `eroe_stanco` del 259. In `src/15` il sistema 226 si accende solo se il 259 è
   spento (`_on226=INT226.attivo()&&!_on259`), e `eroe_marcato` stava solo in `INT226.FATTI`/`SCHEDE226`.
2. **Anche dove usciva, non agiva sulla posizione.** `scegli681` → `INT226.att` → `chiedi.ordine226('home', 0.25)`: solo la
   voglia di tirare; `ordine:null` (nessun ordine del mister). Nel motore la sola cosa che allarga l'eroe è la richiesta
   «fascia» del giro 345 (`_g345`), che la partita chiede a rotazione (2 voci su 8) senza sapere della scheda.
3. **Dopo il primo collegamento l'eroe rientrava lo stesso** (partita vera, profilo per minuto con lo stato del possesso):
   con la palla nostra l'eroe non portatore veniva preso dal **sostegno al portatore** (`_rif924`, i 2-3 compagni più vicini)
   e tornava dentro: restava a 16-20 dal centro. Tolto dal sostegno mentre vale l'indicazione: 26-28. Provato e **tolto**
   (effetto non misurabile, +0,5 al banco, nullo in partita vera): leggere il «lato opposto» del blocco 7.883 dalla corsia
   dell'eroe invece che dal suo posto centrale.

## Correzione (file e funzioni toccati)
- `src/14-motore-possesso.jsx`
  - `INT259.FATTI`: nuovo fatto `eroe_marcato` (ultimo per precedenza; 25'-65', |scarto| ≤ 1, duelli persi ≥ 2, non in panchina);
    `INT259.no388()`.
  - `INT259.SCHEDE.eroe_marcato`: tre opzioni con premio/rischio scritti sui numeri del banco qui sopra («Mi abbasso» non
    promette meno tiri loro: lo scarto è sotto due errori). «Seguo» = `eff:{largo:10,dur:10}`.
  - `INT259.applica`: passa `largo` a `chiedi.scelta259`; `INT259.leggi`: legge anche `largo` (il testimone `__CPM_S259`
    ora dice «cambiato» anche per questa scelta).
  - `chiedi.scelta259`: scrive `richieste.l388 {da, fino, lato, fascia}` (lato = la metà in cui sta l'eroe, una lettura) e il
    testimone `S.w388`; se una richiesta d'occasione è aperta la porta subito a «fascia».
  - `chiedi.scenaEroe`: la prima richiesta aperta dopo la scelta diventa «fascia» (una volta sola).
  - helper `_no388/_l388/_largo388/_lato388`; `_g345` prende il lato dalla scheda; il passo dei giocatori (blocco del giro 345:
    corsia larga dell'eroe e scambio con l'ala) vale anche per `_l388`; sostegno al portatore senza l'eroe allargato.
- `src/15-live-match.jsx`: il contesto delle schede 259 porta `duelliP` (+ `__CPM_FORZA388`, solo `?cpmtest=1`).
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src`).
- `tests/visual/scheda-388.mjs` (guardiano, `npm run scheda-388`), `tests/visual/misura-388.mjs` (sonda delle partite vere,
  usata anche dal guardiano), `tests/visual/package.json`, `tests/visual/ci-runner.mjs` (riga **src/14** della MAPPA, che c'era già).

Rosso `window.__CPM_NO_G388`: niente fatto, niente canale, niente richiesta forzata, sostegno com'era. Col rosso il banco è
identico al comportamento di prima (eroe 9,1 = «Testa mia», «fascia» 27 %).

## Guardiano `npm run scheda-388`
Parte A, banco Node (~40 s, 400 partite per braccio sugli stessi semi, scelta al 28'-40' con `INT259.applica`): A1 eroe largo
col «Seguo» (≥ 20 e ≥ 10 più del «Testa mia») · A2 richiesta «fascia» ≥ 95 % · A3 rosso visto · A4 «Testa mia» non si allarga ·
A5 ripetibile · A6 nessun «non giudicato». Parte B, partita vera (~6 min): verde (scheda uscita, eroe ≥ 20, richiesta «fascia»)
e rosso (la scheda non esce, partita giudicata oltre il 30'). `CPM_ROSSO=1` → esce 1 (provato). `CPM_SOLO_A=1` salta il browser.
Esito sul build del commit: **verde** (A1 20,8 contro 8,6 · A2 100 % · B 2,2 → 25,5, richiesta «fascia»; rosso visto).
⚠️ A1 sta vicino alla soglia (20,8 su 20): la media dei 10' comprende i 3-4 minuti di corsa verso la fascia (8-11 u/min) e i
minuti dei piazzati e dei palloni in volo, in cui l'eroe ha altre guide. Il banco è ripetibile al bit: non oscilla.

## Giro (`node ci-runner.mjs giro scheda-388`)
**18/18 verdi** sul build del commit `eb40d675` (GAME_VERSION invariata 7.999.215): scheda-388 (413 s), mappa-unica,
test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285,
home-298, web-237, career-critical, battito-264, partita-vera (691 s), gk-dive-sync, schermate-97. Nessun passo ripetuto.

## Guardiani della zona NON girati (li giudica il treno)
Riga src/14 della MAPPA: in particolare `fasce-345` (stesso passo dell'eroe: col nuovo canale spento il codice è identico,
ma non l'ho rigirato), `schede-259`, `interazioni-226`, `schede-234`, `esito-280`, `promessa-226`, `partita-vera`,
`possesso-209`, `passaggi-228`. Riga src/15: tutti. **Rischio dichiarato:** il fatto nuovo può prendere uno dei due posti di
scheda a partita (tetto 259 = 2) prima delle schede del finale; per questo vale solo fino al 65'.

## Dubbi per il PO
1. **Quanto spesso esce la scheda.** Il fatto conta i duelli persi negli highlight (`duelliP`), che sono pochi: la scheda
   uscirà di rado.
   - **A (consigliata, applicata): così**, il fatto che la scheda racconta («ha perso N duelli col suo marcatore»); la frequenza
     va misurata su più partite vere nel treno o in un giro di sola misura.
   - B: contare anche i contrasti persi dall'eroe nel motore (gioco fluido): esce più spesso, ma il numero nel testo cambia senso.
   - C: abbassare a 1 duello: più schede, meno «marcato».
2. **Durata dell'allargamento.**
   - **A (consigliata, applicata): 10 minuti di gioco**, poi l'eroe torna al suo posto; se la richiesta «fascia» è ancora
     aperta resta largo per la regola del giro 345 finché non arriva l'occasione.
   - B: fino all'occasione di fascia (niente tempo fisso).
   - C: 5 minuti (meno costo sul gioco al centro).
3. **Posto nelle schede.**
   - **A (consigliata, applicata): fatto del 259, ultimo per precedenza, 25'-65', partita in bilico.**
   - B: fuori dal tetto di 2 schede (non toglie mai il posto a una scheda del finale), a costo di una pausa in più.
   - C: riaccendere il sistema 226 solo per questa scheda (due sistemi in parallelo: sconsigliato).
4. **Il testo delle tre opzioni** è nuovo (premio/rischio del 259): da leggere sul telefono.
