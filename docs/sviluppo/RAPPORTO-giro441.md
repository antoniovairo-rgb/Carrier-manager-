# Giro 441 — unione del giro 421 (PO-684) sopra main 7.999.219

Ramo: `sviluppo/giro441-verifica-mister-219` · base `origin/main` 5b324ca (7.999.219) · unito `origin/sviluppo/giro421-verifica-mister` (7c22466).
GAME_VERSION e `docs/governo` non toccati.

## Conflitti e come li ho risolti

1. **`src/17-menu-creazione-pannelli.jsx`, prima di `pickCoachReview`.** I due blocchi di dichiarazioni non si sovrapponevano:
   ho tenuto **tutti e due** (giro 372: `SFIDUCIA372`, `FIDUCIA_PIENA372`, `rigaAmmessa372` · giro 421: `rapportoMister421`,
   `CALDE421`, `STORICHE421`, `VERIFICA_FREDDA421`). Il corpo di `pickCoachReview` git lo aveva già unito da solo e applica
   le due regole **in serie**: prima il 421 (fascia a denti stretti, via le battute calorose col mister freddo e quelle «di storia»
   col mister nuovo, risposte `nonNuovo421`/`soloNuovo421`), poi il 372 sul mazzo che resta. Quindi una battuta esce solo se la
   ammettono entrambi. Soglie invariate: 372 = gradini di `gradoFiducia372` (30/50/70/85); 421 = freddo < 50, nuovo = arrivato
   in questa stagione. I rossi restano separati: `__CPM_NO_G372` spegne solo `rigaAmmessa372` (e le `cond` 372 delle risposte),
   `__CPM_NO_G421` solo il ramo 421.
2. **`tests/visual/ci-runner.mjs`, MAPPA.** Tenute le righe di main (che avevano in più `esultanza-420` sulla riga `src/15-`);
   aggiunto `verifica-mister-421` in testa alla riga `src/1[17]-`. Diff verso main: una sola riga.
3. `CARRIER-MANAGER-AV.html` ricomposto (`CPM_FORZA_BUILD=1 node tools/build-src.mjs`, 21 frammenti), `node tools/check-src.mjs` verde.

## Contraddizione trovata e risolta (misurata)

Le due regole leggevano la fiducia in modo diverso:
- 372 (e la barra della fiducia in src/18, r. 10913): `coachTrust||60` → una fiducia salvata **0** si legge **60, «Fiducioso»**;
- 421: `coachTrust!=null ? coachTrust : 60` → la stessa fiducia 0 si leggeva **0, «freddo»**.

A fiducia salvata 0 lo stesso mister era quindi «freddo» per il 421 (fascia a denti stretti, niente calore) e «fiducioso» per il
372 (niente sfiducia, 6 battute della fascia bassa tolte): un mazzo che si contraddiceva e che smentiva la barra. **Applicato:** il
421 legge la fiducia come la barra e il 372 (`(p&&p.coachTrust)||60`). Tutto il resto del gioco tratta 0 allo stesso modo
(src/18 r. 220, 810, 1374: `(p.coachTrust||60)+…`).

## Misura su tutte le combinazioni

Sonda pura in node (estrae da src/08 e src/17 le funzioni vere, scratchpad `combo441.cjs`): fascia (alta/media/bassa) × fiducia
0..100 (ogni punto) × mister nuovo sì/no × 16 verifiche = **9.696 scelte**.
- violazioni del 421 o del 372 nella battuta scelta: **0**;
- risposte meno di tre: **0**;
- mazzo combinato più piccolo: **7 battute** (fascia bassa, fiducia ≥ 70, mister nuovo) → **nessun mazzo vuoto**, i ripieghi
  «mazzo vuoto → mazzo intero» di entrambe le regole non scattano mai.

Guardiani sulla pagina vera (GLB acceso come da harness):
- `npm run verifica-mister-421` **VERDE** (24 combinazioni rendimento × fiducia × mister, 16 verifiche ciascuna: 0 calorose, 0
  «reso migliore», denti stretti su rendimento alto) · rosso `__CPM_NO_G421` riprodotto (**27** calorose).
- `npm run giudizi-372` **VERDE** · rosso `__CPM_NO_G372` riprodotto (torna «Ti aspetta più panchina» e la sfiducia nella verifica
  con la fiducia alta).
- `node ci-runner.mjs giro verifica-mister-421 giudizi-372` (i due guardiani + 17 sentinelle, fra cui `career-critical`,
  `partita-vera`, `griglia-mobile`): **19/19 verdi**, nessun passo instabile.

## Dubbi per il PO

**D1 — fiducia salvata a 0: «Fiducioso» o «freddo»?**
1. *(consigliata, applicata)* Come la barra: 0 si legge 60. Le due regole e la barra dicono la stessa cosa; nessun cambio al 372.
2. Leggere 0 come 0 ovunque (barra, 372, 421 e i `+…` di src/18): più vero, ma tocca il 372 e la carriera (un giocatore a 0 oggi
   risale da 60 al primo aggiornamento) → catena carriera completa.
3. Lasciare le due letture diverse: il mazzo a 0 resta contraddittorio (sconsigliata).

**D2 — ordine dei filtri quando un mazzo si svuotasse.** Oggi ogni regola, se svuota il mazzo, ripiega su quello di prima.
1. *(consigliata, applicata: nessun codice nuovo)* Tenere i ripieghi: misurato che non scattano mai (minimo 7 battute).
2. Ripiego unico «se le due regole insieme svuotano, vince il 372» (la barra è ciò che il giocatore vede).
3. Aggiungere battute neutre di riserva per fascia, così il ripiego non servirebbe nemmeno in futuro.

**D3 — battute in entrambe le liste.** «Ho difeso le tue scelte…» e «Ti ho voluto io in questa rosa…» stanno in `CALDE421`/
`STORICHE421` e rispettivamente in `FIDUCIA_PIENA372`/`SFIDUCIA372`: ognuna esce solo col mister di lunga data e col gradino giusto.
1. *(consigliata, applicata)* Va bene così: doppio vincolo, entrambi sensati.
2. Scegliere una sola regola per ciascuna battuta, per semplicità di manutenzione.
3. Toglierle dal mazzo e riscriverle in versione neutra.

**D4 — guardiano 372 nella MAPPA.** `giudizi-372` non l'ho aggiunto alla riga `src/1[17]-`: il compito chiedeva solo il 421.
1. *(consigliata, applicata)* Lasciare la MAPPA com'è; il 372 resta dove main lo ha messo.
2. Aggiungerlo anche alla riga `src/1[17]-` (il suo filtro vive in src/17).
3. Farne una riga sola «mister» con 372 + 421.
