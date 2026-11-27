# Rapporto giro 421 — PO-684 · la verifica trimestrale del mister

Ramo: `sviluppo/giro421-verifica-mister` (base `main` 49769fa). GAME_VERSION e `docs/governo` non toccati.

## Il difetto
Collaudo PO su 7.999.217 (FC Augusta, S.2 W.24, foto `docs/collaudo-po/217-verifica-trimestrale-mister.png`):
la verifica trimestrale di Mister Rossi diceva «I numeri parlano chiaro: sei tra i migliori… Il club è orgoglioso
di te», e il PO commenta: «un po' contraddittorio, il nuovo mister non mi vedeva di buon occhio». Fra le risposte
c'era anche «🎯 Merito anche del suo lavoro. Mi ha reso un giocatore migliore.».

## Causa (letta nel codice)
`pickCoachReview` (src/17) sceglie la battuta solo dalla fascia di rendimento (`perf`, dalla forma: ≥72 alto,
≥55 medio, sotto basso). Fiducia del mister (`coachTrust`) e arrivo recente del mister non entrano nella scelta,
né per le battute né per le risposte.

## Misura (No Blind Fix)
La sonda `verifica-mister-421.mjs` usa la scelta vera (`pickCoachReview`, hook `__CPM_CAREER.verifica421`) su
3 rendimenti × fiducia (75 / 40) × 4 situazioni del mister (di lunga data · esonero dell'anno · cambio di panchina
all'ultimo cambio di stagione · primo anno nel club). In totale sono 24 combinazioni da 16 verifiche ciascuna
(quattro stagioni, con la memoria delle battute già lette intrecciata come nel gioco).

| | calorose con mister freddo | calorose con mister nuovo e freddo | «reso migliore» con mister nuovo | battute «di lunga data» con mister nuovo |
|---|---|---|---|---|
| **prima** (rosso `__CPM_NO_G421`) | 52 (7 per combinazione ad alto rendimento) | **39** | 32 | 30 |
| **dopo** | **0** | **0** | **0** | **0** |

Il caso del PO (rendimento alto, mister nuovo e freddo) **prima** riproduce esattamente la battuta e la risposta
della foto. **Dopo** esce: «Sei in forma, si vede. Ma nel mio calcio conta anche come stai dentro il gruppo.», con
risposte coerenti («Allora continuerò finché non le farò cambiare idea.» · «Parlano i numeri, mister. Io continuo
così.» · «Accetto la critica. Mi faccia capire il suo sistema.»).
Foto: `docs/collaudo-po/421-verifica-mister-prima.png` → `docs/collaudo-po/421-verifica-mister-dopo.png` (vista da PC).

Con un mister caldo e di lunga data il mazzo resta quello di prima (il guardiano lo verifica: con rendimento alto
escono ancora battute calorose e la risposta «reso migliore»). La varietà resta: con mister freddo e rendimento
alto le battute distinte sono 8 in 16 verifiche (cioè tutta la nuova fascia), negli altri casi da 10 a 14.

## Correzione (alla fonte, src/17)
- `rapportoMister421(p)` deduce il rapporto **solo da campi che esistono già**, quindi vale anche per la carriera
  in corso del PO. Nessun campo nuovo nel salvataggio e nessun cambio di SAVE_VERSION.
  - **freddo** = fiducia < 50: è la stessa soglia con cui lo Storico allenatori colora un rapporto teso.
  - **nuovo** = mister arrivato in questa stagione. I casi sono tre: `coachSackSeason` uguale alla stagione
    corrente (esonero); l'ultima voce di `coachHistory` è della stagione prima con `coachChanged`; nessuna stagione
    in `history` col club attuale (trasferimento o prestito).
- `CALDE421`: le 11 battute calorose (orgoglio, fiducia dichiarata, «il nostro faro», «io in te credo ancora»…). Un
  mister freddo non le dice mai.
- `STORICHE421`: le 4 battute che presuppongono una storia insieme («Ti ho voluto io in questa rosa», «Ho difeso le
  tue scelte…»). Un mister nuovo non le dice mai.
- `VERIFICA_FREDDA421`: per rendimento alto con mister freddo c'è un riconoscimento a denti stretti, con 8 battute
  e 7 risposte proprie.
- Risposte: «Mi ha reso un giocatore migliore» è marcata `nonNuovo421`. Al mister nuovo si offre la sua gemella
  «🎯 Sto cercando di entrare subito nelle sue idee, mister.» (`soloNuovo421`).
- Rosso `window.__CPM_NO_G421`: rimette la scelta di prima.
- src/18: tre ganci solo-collaudo in `__CPM_CAREER`: `verifica421`, `insiemi421` e `apriVerifica421`, che apre la
  stessa finestra dell'handler con la stessa scelta e serve per le foto.

## Guardiano
`npm run verifica-mister-421` (circa 6 s). In una sola corsa gira due bracci, il verde e il rosso
(`__CPM_NO_G421`), con GLB acceso. Esce ≠0 in tre casi: se il verde ha un guasto, se il rosso non riproduce almeno
una battuta calorosa da un mister nuovo e diffidente (prova cieca), oppure se una combinazione resta «non
giudicata». Con `CPM_FOTO=1` rifà le due foto. Riga MAPPA: `src/1[17]` (la regola vive in src/17).

## Rituale
`node ci-runner.mjs giro verifica-mister-421` (guardiano + 17 sentinelle): esito in fondo a questo rapporto.
Il registro `docs/governo/STABILITA.json` che il runner aggiorna è stato riportato com'era: niente modifiche a
docs/governo.

## Dubbi per il PO (la prima opzione è quella consigliata ed è già applicata)

**1. Quando un mister è «nuovo»?**
- **(a) Arrivato in questa stagione (applicata).** È semplice, si deduce dal salvataggio ed è coerente con il
  «nuovo mister» del collaudo.
- (b) Per le prime 16 settimane insieme. È più fine, ma per gli arrivi a metà stagione (esonero, mercato
  invernale) la settimana d'arrivo non è salvata: servirebbe un campo nuovo (`misterDal`) scritto nei tre punti
  in cui il mister cambia.
- (c) Finché la fiducia non ha superato una soglia (per esempio 65). Lega il «nuovo» al rapporto invece che al
  tempo, però mescola due concetti che oggi il guardiano tiene separati.

**2. Soglia del mister «freddo»**
- **(a) fiducia < 50 (applicata)**: è la soglia dello Storico allenatori. Un esonero porta la fiducia a 48, quindi
  il mister subentrato parte freddo.
- (b) fiducia < 55. Copre anche chi arriva con un trasferimento da riserva (fiducia 50).
- (c) Tre fasce (fredda < 50, tiepida 50–64, calda ≥ 65), con una fascia «tiepida» di battute misurate. È la più
  ricca, ma richiede di scrivere un terzo mazzo.

**3. Cosa vede chi ha rendimento medio o basso con un mister freddo**
- **(a) Lo stesso mazzo senza le battute calorose (applicata)**: restano 12 battute per il rendimento medio e 11
  per il basso, tutte già severe.
- (b) Un mazzo dedicato «freddo e deluso», più duro.
- (c) Nessun filtro: quelle fasce sono già severe di loro.

## Fuori ambito, segnalato
Il diario scrive «Verifica trimestrale: media forma» anche quando il rendimento è **basso** (src/18, ternario
`excellent ? "ottima forma" : "media forma"`). È un difetto che c'era già, non toccato in questo giro.

## Esito del giro
`node ci-runner.mjs giro verifica-mister-421` sul commit 2ba3140 (build 7.999.217): **18/18 verdi**
(verifica-mister-421 · mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system ·
tema-unico · griglia-mobile · render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 ·
partita-vera · gk-dive-sync · schermate-97), nessun passo instabile. Il resto della mappa lo giudica il treno.
