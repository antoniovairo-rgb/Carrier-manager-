# G1 · La direzione grafica extra partita — provino statico su tre schermate

## v2 — «buona base, ma puoi fare ancora meglio» (PO, 17/09)

v1 era corretta e **piatta**: leggeva come un foglio di calcolo ben impaginato. Tre leve, in v2:

1. **Un carattere vero, incorporato.** Barlow + Barlow Condensed, sottoinsieme latino,
   sei tagli in base64 (`caratteri.css`, 131 KB di woff2). Il condensato porta numeri ed
   etichette — è il carattere della grafica da trasmissione sportiva. Il gioco incorpora
   **già** un carattere così (`KWScript` in `src/00-head.html`): stessa strada. Il primo
   scatto di v2 usava un `<link>` a Google Fonts e **non è arrivato**: quello che si vedeva
   era il ripiego di sistema. Il gioco gira senza rete, il carattere va dentro il file.
2. **Il colore del club guida la pagina.** Il club ha **due** colori nel gioco
   (`mkT(...,c1,c2)`): la fascia di testata prende il primo, un filo da 3 px il secondo, e
   ogni scudo porta il secondo come banda verticale — legge come una riga della maglia.
   Non è decorazione: è ciò che distingue un gioco di calcio da una lista qualunque.
3. **Densità.** Con i numerali condensati la classifica sta su **una riga sola con tutte e
   otto le colonne e il nome del club per intero**: oggi nel gioco, a 412 px, si vede la
   sigla e basta. Non si toglie un numero e si guadagna il nome.

Resta tutto quello che v1 aveva guadagnato: tema unico chiaro, niente scatole dentro scatole,
zero emoji, pavimento 11 px, ogni tinta di testo ≥ 4,5:1 sul fondo su cui cade davvero.

---


**Non è codice di gioco.** Sono tre pagine HTML statiche a 412 px con i dati veri del gioco
(i club di Lega B con i loro colori reali da `src/02-club-leghe-albo.jsx`). Servono a far
giudicare la direzione **prima** di toccare una riga di `src/`.

Tre schermate e non una, perché il PO ha chiesto che **le schermate siano coerenti fra loro**:
una schermata sola non lo dimostra.

| file | schermata |
|---|---|
| `home.html` | Home / cruscotto |
| `stagione.html` | Stagione · Classifica |
| `club.html` | Club |
| `stile.css` | **il sistema**: un unico foglio, gli stessi componenti in tutte e tre |
| `caratteri.css` | i sei tagli di Barlow incorporati in base64 |

## Le regole che il foglio applica, e che si possono contare

- **un solo accento**, speso in tre punti per schermata (azione, voce attiva, legame);
- **niente scatole dentro scatole**: una carta, e dentro solo righe separate da un filo da 1 px;
- **numeri tabellari** ovunque: nessun numero che balla di larghezza fra due righe;
- **zero emoji** come segnale di sezione: le sezioni si riconoscono dal cappello;
- **tema unico chiaro**, come chiesto: nessun secondo fondo, nessun interruttore;
- **corpo minimo 11 px** (il pavimento dichiarato della griglia mobile).

## La riga di classifica su una linea sola

A 412 px le otto colonne numeriche (G V N P GF GS DR PT) coi numerali **tondi** lasciano al
club **70 px**: cioè la sigla e basta — ed è quello che si vede oggi nel gioco. Coi numerali
**condensati** quelle otto colonne costano 168 px invece di 224, e al nome ne restano oltre
150: «FC Empolese» ci sta comodo. **Non si toglie un numero e si guadagna il nome.**
(v1 risolveva lo stesso problema su due linee: funzionava, ma costava il doppio dell'altezza.)

## Lo scudo non impone il bianco

I colori dei club sono quelli del gioco e su un giallo (`#f59e0b`) il bianco fa **2,15:1**.
L'inchiostro della sigla è scelto per contrasto, scudo per scudo: sui dodici club della
classifica il minimo è **4,83:1**. Un bordo interno da 1 px tiene visibili gli scudi bianchi
(FC Spezzino, FC Pugliese) sulla carta bianca.

## Il metro

`node tests/visual/provino-schermate.mjs` misura queste pagine con **lo stesso codice di misura
della griglia mobile** (la funzione `MISURA` è letta da `tests/visual/griglia-mobile.mjs` e
iniettata nella pagina: due metri diversi darebbero due verità diverse, e la seconda sarebbe comoda).

Il **primo** provino, quello a una schermata sola, l'ha bocciato: `--terzo #8b95a5` faceva
**3,03:1** su bianco, **86** nodi sotto soglia e **31** testi sotto il pavimento di 11 px.
I colori sono stati poi scelti col calcolatore, non a occhio.

Stato oggi:

```
SCHERMATA                overflow  fuori  <10px  <11px  minFs  testi  contr<s  grad
Home                         0 px      0      0      0     11     48     0/48     0
Stagione · Classifica        0 px      0      0      0     11     96     0/96     0
Club                         0 px      0      0      0     11     60     0/60     0
TOTALE                       0 px      0      0      0           204        0     0
```

**DICHIARATO:** Chromium headless a 412×915, **non** l'Android del PO. Restano fuori il
rendering dei font di sistema Android, il tocco, la barra di sistema e il ritaglio del notch.
