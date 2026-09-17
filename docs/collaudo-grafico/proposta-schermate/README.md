# G1 · La direzione grafica extra partita — provino statico su tre schermate

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

## Le regole che il foglio applica, e che si possono contare

- **un solo accento**, speso in tre punti per schermata (azione, voce attiva, legame);
- **niente scatole dentro scatole**: una carta, e dentro solo righe separate da un filo da 1 px;
- **numeri tabellari** ovunque: nessun numero che balla di larghezza fra due righe;
- **zero emoji** come segnale di sezione: le sezioni si riconoscono dal cappello;
- **tema unico chiaro**, come chiesto: nessun secondo fondo, nessun interruttore;
- **corpo minimo 11 px** (il pavimento dichiarato della griglia mobile).

## La riga di classifica su due linee

A 412 px le otto colonne numeriche (G V P S GF GS DIFF PT) più il nome lasciano al club
**70 px**: cioè la sigla e basta — ed è quello che si vede oggi nel gioco. Su due linee
**non si toglie nessun numero** e il nome del club torna per intero.

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
