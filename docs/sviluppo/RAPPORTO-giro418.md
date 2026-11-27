# Rapporto giro 418 — riparazione del treno 7.999.218 (`barriera-73`)

Base: `lavoro/201` @ d75ded1 · ramo: `sviluppo/giro418-riparazione-218` · GAME_VERSION e docs/governo non toccati.

## Il rosso del treno

Corsa 45898863971, parte 13 di 32, **commit d75ded1** (lo stesso della base di questo giro):
`VERDE: 4 in barriera · larga 15.0u` — una sola misura, nessuna ripetizione.

## Misura (No Blind Fix)

| dove | `npm run barriera-73` (una misura a 3,6 s) | sonda `misura-418.mjs` (un campione ogni 0,7 s per 12 s) |
|---|---|---|
| base `lavoro/201` d75ded1, qui | verde 4,4u · rosso 14,4u | larghezza **4,4u solo in ~3 campioni su 10**; negli altri 13,0-16,3u |
| stessa base, CPU rallentata ×4 (CDP) | — | stesso quadro: 4,4u a tratti, 13-15u negli altri |
| `origin/sviluppo/giro375-barriera` da solo | verde 4,4u · rosso 20,8u | **stesso quadro**: 4,4u a tratti, 13,0-15,3u negli altri |

**Nessuna unione rompe la barriera.** Il difetto esiste già sul ramo del giro 375 da solo. Il verde dichiarato dal 375, e quello che
si ottiene qui, dipende dall'istante in cui cade l'unico campione. Il treno l'ha preso nella fase sbagliata.

### Che cosa si muove

I bersagli della barriera (`__CPM_MUR72`, giocatori 11-14) restano **larghi 4,4u in ogni campione**, e i corpi stanno fermi a
9,2-9,3 m dal pallone (la regola del giro 375). Cambia invece un quinto avversario, che **non fa parte della barriera**:

- i difensori 16 e 17 sono congelati dalla lettura a ~8,7 m dal pallone. L'«attesa attiva» (giro 147, ellisse del giro 334) li fa oscillare
  di ±1 u sulla linea verso il pallone: **7,6-9,7 m**, con un periodo di ~4,4 s;
- quando il 17 (y≈64-67) è più vicino del quarto uomo di barriera, il guardiano lo conta fra «i quattro più vicini nell'anello
  7-12u» e la fascia diventa larga 13-16u.

Prima del giro 375 la barriera stava più vicina al pallone e copriva il difetto. Spostandola correttamente a 9,15 m, è rimasta scoperta
una cosa che è anche **un errore di regolamento**: su punizione un avversario a 7,6 m dal pallone.

## Correzione (alla fonte, nel gioco)

`src/12-three-match-view.jsx`, fine del blocco della lettura (dopo il respiro 685 e l'attesa attiva 147/334): su punizione, ogni avversario
che difende (`away`, non portiere) e che **non è della barriera** viene proiettato in direzione radiale ad almeno **9,15 + 1 m** dal pallone,
misurati sul corpo nel mondo. La base congelata non cambia, quindi non c'è deriva. La barriera si riconosce dal **ruolo**
(`_w72` della scena) e non dalla bandiera `mur72`: così il rosso `__CPM_NO_MURO72` mostra la barriera rotta esattamente come prima.
Rosso nuovo: `window.__CPM_NO_G418`. La correzione vale solo nelle fasi di lettura sotto il teatro: sotto il gate (`_readFreeze`
spento) non cambia nessun fotogramma, e la firma golden resta invariata.

Dopo (sonda, 16-17 campioni per braccio): larghezza **4,4u in tutti i campioni**, a CPU ×1 e ×4. Il difensore 17 non scende più sotto **10,1 m**.

## La misura (soglia invariata: ≤ 6u)

`barriera-73.mjs` misurava **un solo istante** a 3,6 s di parete: una scena viva si giudica in più momenti (regola del giro 261).
Ora:
- **verde**: dieci momenti in 6 s, e deve stare ≤ 6u in **ognuno** (la misura diventa più severa, non più larga);
- **rosso `__CPM_NO_MURO72`**: come prima (≥ 9u);
- **rosso `__CPM_NO_G418`** (nuovo): deve superare 6u in almeno un momento. La scena forzata non nasce sempre dallo stesso punto: il pallone
  è stato misurato a (73,53), (70,54) e (81,36) su aperture diverse, e solo in alcune c'è un difensore congelato vicino ai 9 m. Per questo il braccio
  si ripete fino a **3 aperture, dichiarate nel testo** (`aperture n/3`). Nessuna apertura col difetto = non giudicato = rosso.

Esiti locali: 3 su 3 verdi (verde 4,4u nel peggiore dei dieci momenti · MURO72 14,9-22,8u · 418 14,4-15,3u, con 1-2 aperture).

## Foto (GLB acceso, gi81, teatro)

- `docs/collaudo-po/418-prima.png` / `418-dopo.png`: la camera del gioco. La barriera compatta si vede in entrambe; il difensore che
  invade resta **fuori dall'inquadratura**, quindi da sole queste foto non mostrano la differenza (lo dichiaro).
- `docs/collaudo-po/418-pianta-prima.png` / `418-pianta-dopo.png`: la pianta dall'alto ricostruita dalle posizioni misurate dei corpi
  (16 momenti, tratteggio = 9,15 m). Prima: un difensore entra nel cerchio, minimo 7,4-7,7 m. Dopo: scorre sul bordo, minimo 10,1 m.

## Catena

`node ci-runner.mjs giro barriera-73 barriera-375` (= i due guardiani del giro 375 + le 17 sentinelle): **19/19 verdi**, nessuna ripetizione
(barriera-73 62 s · barriera-375 114 s · partita-vera 645 s · career-critical 341 s). I file che la catena riscrive da sé
(`docs/governo/STABILITA.json`, le foto di `griglia-mobile` in `docs/collaudo-grafico`) sono stati ripristinati e non sono nel commit.
Riga della MAPPA: quella già presente per `src/12` (contiene `barriera-73` e `barriera-375`). Nessuna riga nuova.

## Dubbi per il PO

**1. A che distanza stanno gli avversari fuori dalla barriera?**
- **(consigliata, applicata)** almeno 9,15 + 1 m: la barriera è sempre la prima linea, e il regolamento è rispettato con margine;
- solo 9,15 m (la regola alla lettera): un difensore può stare sul cerchio alla stessa distanza della barriera, e la si legge peggio;
- nessun vincolo, e la misura riconosce la barriera dal ruolo: la misura diventa verde, ma resta in campo l'errore di regolamento (7,6 m).

**2. Il guardiano su più momenti.**
- **(consigliata, applicata)** dieci momenti in 6 s, ognuno ≤ 6u, più il braccio rosso 418 ripetuto fino a 3 aperture dichiarate;
- un solo istante come prima: costa meno, ma è verde o rosso secondo la fase dell'attesa (è il rosso del treno);
- rendere deterministico il punto da cui nasce la scena forzata, per non dover ripetere il braccio 418: tocca la messa in scena del banco,
  fuori dall'ambito di una riparazione.

**3. Il quinto uomo «in attesa attiva» vicino al pallone su un piazzato.**
- **(consigliata, applicata)** proiezione del corpo finale sul bordo dei 10,15 m: l'attesa continua, solo il tratto dentro il cerchio si appiattisce sul bordo;
- spingere fuori la BASE congelata: oscillazione intera, ma il corpo fa uno scatto di ~1,5 m all'inizio della lettura;
- spegnere l'attesa attiva per i difensori su punizione: più semplice, ma riporta «statue» nella scena (taccuino PO, codice 006).
