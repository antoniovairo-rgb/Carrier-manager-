# Giro 351 — PO-607 «queste offerte sono ridicole» (offerte di mercato)

Base: `lavoro/201` (= 7.999.208 pubblicata, 04d2b4b). Ramo di consegna: `sviluppo/giro351-offerte`. `GAME_VERSION` non toccato
(rilascio automatico). Ambito: solo `generateTransferOffer` in `src/06-archetipi-agenti-sponsor.jsx`; src/03, src/12, src/14, src/16
e src/18 non toccati.

**Esito in una riga:** le offerte assurde passano da **1.545 su 8.064 a 0**. Sono le offerte da un club più debole che propongono un
prestito o un ruolo peggiore a chi gioca. Ogni offerta adesso migliora almeno una cosa. Morale e crescita mostrati vengono
dall'offerta stessa, non più da un dado. Rituale `giro offerte-351 career-critical` + sentinelle: **18/18 verdi**.

## Da dove nascono (causa)

Tutte le offerte ufficiali di mercato (finestra estiva, mercato invernale, lista trasferimenti, saga «Radio mercato», tasto
dell'agente, sonda `forceOffer`) nascono da **una sola funzione**, `generateTransferOffer`. Le altre chiamate a
`setTransferOffer` rimettono a schermo un'offerta già generata (saga, offerta in sospeso del giro 201) oppure riguardano il salto
in prima squadra di un Primavera (giro 323, fuori da queste regole). Prima di questo giro la funzione:

- sceglieva il club fra quelli con prestigio nella fascia dell'OVR (`minP..maxP`) e credibili. **Non guardava mai** il prestigio
  del club di oggi né il ruolo del giocatore: un rotazione o un titolare di un club da 66 poteva ricevere un'offerta da un club
  da 50;
- sceglieva il tipo a caso in base al **solo OVR** (sopra 75: 3 offerte su 4 erano prestiti);
- tirava a caso minutaggio (prestito 30-70%, il ruolo «Riserva» del confronto), **morale `rng(5,20)` e crescita `rng(5,15)`**. Per
  questo l'offerta di FC Hannover poteva mostrare +16 di morale insieme a un ruolo da riserva in Deutsche Liga 2.

## Misura prima/dopo (No Blind Fix)

Sonda e guardiano: `tests/visual/offerte-351.mjs` (`npm run offerte-351`). La popolazione è **sintetica**: ogni club
professionistico di `CLUBS` × 4 ruoli (riserva, rotazione, titolare, leader) × 2 anzianità, con OVR coerente col ruolo e
contratto di oggi calcolato con lo stipendio del gioco (`_ovrToWageWeekly133`). Sono 2.016 giocatori, ciascuno con 4 chiamate
alla funzione vera. ⚠️ Non sono carriere giocate. `career-sim` produce poche offerte (tiro a caso settimanale) e non le
registra, mentre questa popolazione copre tutte le combinazioni di prestigio e ruolo. Quanto spesso capita ciascuna combinazione
in una carriera vera resta da misurare (dubbio 4).

| classe | prima (`__CPM_NO_G351`) | dopo |
|---|---|---|
| offerte generate | 8.064 | 8.064 |
| **A · assurde**: rotazione/titolare/leader, club ≤ −5 di prestigio, prestito o ruolo peggiore | **1.545 (19,2%)** | **0** |
| **B · senza guadagno**: niente prestigio +3, niente ruolo migliore, niente stipendio +10%, niente durata più lunga di un definitivo | **3.734 (46,3%)** | **0** |
| **C · effetti incoerenti**: morale ≥ 10 senza guadagno vero, oppure crescita ≥ 10 da un club più debole senza più minuti | **3.470 (43,0%)** | **0** |
| **D · caso della foto**: Augusta (66) rotazione → prestito da club ≤ 61 con ruolo Riserva | **68 su 400 (17%)** | **0 su 400** |
| prestiti da club più deboli di 5+ | 2.414 | 884 (solo a riserve, da rotazione/titolare) |
| tipi | prestito 5.551 · opzione 1.359 · obbligo 715 · definitivo 439 | prestito 4.553 · opzione 935 · obbligo 574 · definitivo 2.002 |

## Correzione (src/06, `generateTransferOffer`)

Le regole valgono per un professionista sotto contratto. Svincolati e Primavera restano come prima: per loro è già sempre un
trasferimento definitivo. Il club si sceglie come prima; cambiano i **termini**, in base al rapporto fra il prestigio del club
che offre e quello del club di oggi:

- **club più forte (+5 o più)**, ambizione: tipo e minuti come prima (un salto può valere anche la panchina). Lo stipendio non
  scende sotto quello di oggi; per un prestito non scende sotto il 90%.
- **club alla pari (±4)**: almeno lo stesso ruolo, e una riserva sale a rotazione. Se il ruolo non sale, lo stipendio cresce del
  10-25%.
- **club più debole (−5 o meno)**: a chi è in rotazione o titolare solo **trasferimento definitivo, da titolare**, con il **+15-35%
  di stipendio**. A una riserva anche un prestito, ma da giocatore in rotazione o titolare.
- **morale** = 2 + 0,5·(prestigio guadagnato) + 4·(gradini di ruolo guadagnati) + 15·(aumento di stipendio) − 3·(gradini persi)
  − 0,15·(prestigio perso), fra 1 e 20.
- **crescita** = 3 + 0,3·(prestigio guadagnato) + 2·(gradini di ruolo) + 2 se il club ha prestigio ≥ 80, fra 1 e 15.
- Il leader conta come titolare: il minutaggio dell'offerta arriva al massimo a «Titolare».

Il caso della foto, con le regole nuove: Hannover (50) contro Augusta (66), giocatore in rotazione. Esce un trasferimento
definitivo da titolare, con almeno il 70% di minuti e uno stipendio fra +15% e +35%. Il morale scende a circa +8 e la crescita a
+5 (prima +16 e +8 a caso).

Nessun campo nuovo nel salvataggio (`save-compat` verde). Un'offerta già in sospeso in un salvataggio (`offerta201`) resta con i
termini con cui era nata.

## Guardiano

`npm run offerte-351`, statico sul banco (~10 s), due bracci sulla stessa popolazione:
- **VERDE**: A = B = C = D = 0, con copertura ≥ 1.500 offerte, ≥ 40% dei giocatori con almeno un'offerta e ≥ 100 offerte per il
  caso della foto. Copertura insufficiente vuol dire non giudicato, quindi rosso.
- **ROSSO** `window.__CPM_NO_G351` (regole di prima): deve vedere A > 0 e B > 0, altrimenti il braccio è cieco e il guardiano è
  rosso. Misurato: A 1.545 · B 3.734.

Il guardiano è nella riga della MAPPA che esisteva già per `src/0[0-8]-`, quella che copre src/06. `npm run mappa-unica` è verde.

## Rituale

`node ci-runner.mjs giro offerte-351 career-critical` (+ 17 sentinelle) sul commit 5aacc0bc: **18/18 verdi**, nessun passo
ripetuto. Passi e tempi: offerte-351 (3s) · mappa-unica (0s) · test:logic (2s) · save-compat (1s) · replay (55s) · migrazione-194
(25s) · design-system (0s) · tema-unico (14s) · griglia-mobile (177s) · render-3d-023 (37s) · tunnel-285 (260s) · home-298 (119s) ·
web-237 (49s) · career-critical (424s) · battito-264 (415s) · partita-vera (697s) · gk-dive-sync (189s) · schermate-97 (117s).
Le foto riscritte da `griglia-mobile` in `docs/collaudo-grafico/` non sono state committate.

## Dubbi per il PO (applicata la prima opzione, la consigliata, salvo dove scritto)

1. **Un club più debole può ancora fare un'offerta a un titolare?**
   - (a, applicata) Sì, ma solo da trasferimento definitivo, da titolare, con stipendio +15-35%. È il passo «per i soldi e i
     minuti» che nel calcio vero esiste.
   - (b) No sotto −10 di prestigio: offerte solo da club pari o migliori.
   - (c) Sì, anche in prestito, purché il ruolo salga.
2. **Leader**: il confronto dell'offerta mostra «Leader → Titolare» in neutro.
   - (a, applicata) Il leader conta come titolare per le regole.
   - (b) Un club più debole deve promettere anche la fascia o il ruolo di leader (servono un campo nell'offerta e src/18).
   - (c) Nessuna offerta da club più deboli a un leader.
3. **Morale e crescita di un'offerta laterale**: oggi vanno da 1 a 20, mai negativi.
   - (a, applicata) Calcolati dai guadagni veri, con minimo 1: la riga «Morale: +1» resta, ma non promette più ciò che l'offerta
     non dà.
   - (b) Ammettere valori negativi (un'offerta che fa scendere di ruolo pesa sul morale), mostrandoli in rosso: tocca la scheda in
     src/18.
   - (c) Nascondere morale e crescita sotto una soglia (per esempio < 4).
4. **Misura su carriere giocate**: la popolazione del guardiano è sintetica e copre tutte le combinazioni, ma non pesa quanto
   spesso ciascuna capita.
   - (a, consigliata — NON applicata in questo giro: è un giro a sé) Aggiungere un registro delle offerte (`cpmEv("offerta")`) e
     misurarle su `career-sim`.
   - (b) Accontentarsi della popolazione sintetica.
   - (c) Chiedere al PO 3-4 foto di offerte dopo il rilascio.
