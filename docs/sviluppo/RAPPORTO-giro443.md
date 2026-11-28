# Rapporto giro 443 — riparazione dei tre rossi della statura (treno grande, corsa 46091643062)

Ramo `sviluppo/giro443-riparazione-statura`, partito da `lavoro/204` (b14d8ad: main 7.999.219 + giri 422, 423, 424, 425, 431 con 412 e
414, 433). `GAME_VERSION` e `docs/governo` non toccati. Temi del giro 442 (prestacco-422, esultanza-420, fila-227, consegna-103) non toccati.
Rosso del giro: `window.__CPM_NO_G443`.

**Le misure sono del banco (rendering software, headless) con i corpi GLB accesi. Non sono misure del telefono del PO.**
«Prima» = `lavoro/204`, cioè il codice con `__CPM_NO_G443` (le righe nuove non fanno altro). «Main 7.999.219» = l'eroe con la statura del
seme, ottenuto su questo ramo con `__CPM_NO_G431`: è lo stesso percorso di main, perché il giro 431 restituisce la statura di prima sotto
quel rosso. Non ho misurato su un checkout di main separato.

## 1. Cosa cadeva, e perché

| guardiano | in CI (treno grande) | causa misurata | dove |
|---|---|---|---|
| `coppa-mani-191` | verde scarto 0,26 (soglia ≤ 0,20); rosso 0,19 (serve ≥ 0,35) | **gioco**: il tetto della testa nella premiazione era 1,85 m di scena fissi, tarato sull'eroe alto quanto il seme | `src/12`, regola «il volto non si copre» |
| `posa-sollevamento-191` | mani 1,92 (soglia ≥ 2,0) | **guardiano**: la posa è la stessa, l'eroe è più basso. Mani / statura = **1,129** sia a 1,70 m sia a 1,86 m | soglia in metri di scena assoluti |
| `statura-eroe-431` | «ingresso: suola dell'eroe 0,101 contro rosso −0,015 (tolleranza 2 cm)» | **guardiano**: la suola oscilla col passo nello stesso modo nei due bracci; il guardiano confrontava un solo istante per braccio | lettura della suola all'ingresso |

Il controllo che cadeva nel 431 **non** era nella parata (lì `corp null` è previsto: i corpi CGTrader delle cerimonie non hanno
corporatura, e il guardiano la giudica solo in partita). Il rapporto della parata (0,9944) era nel braccio rosso, che lì non si giudica.
Cadeva la riga «suola» dell'ingresso.

### Coppa (difetto vero)
Premiazione di campionato su una carriera nuova (sonda `tests/visual/misura-443b.mjs`, 33 campioni a metà sollevamento, clip 0,45):

| braccio | statura dichiarata | quota coppa | quota mani | scarto presa-mani (mediana) |
|---|---|---|---|---|
| main (seme, `__CPM_NO_G431`) | 1,86 | 3,15 | 3,15-3,17 | **0,077** |
| lavoro/204 (`__CPM_NO_G443`) | 1,70 | **3,15** (ferma) | 2,97-2,98 | **0,262** |
| giro 443 (verde) | 1,70 | 3,00 | 2,97-2,98 | **0,112** |

La coppa restava alla quota del corpo alto: la regola del 7.997 («il punto più basso della coppa non scende sotto la sommità della testa»)
usava una testa a 1,85 dal piano dell'eroe, misurata nel giro 191 sull'eroe di 1,86. Con l'eroe di 1,70 la testa vera è più bassa, la
regola credeva le mani «davanti al viso» e alzava la coppa sopra le mani.

### Posa (soglia in metri)
| braccio | statura | clip | piedi | mani sopra il piano | mani / statura |
|---|---|---|---|---|---|
| seme (`__CPM_NO_G431`) | 1,86 | 0,45 | 0,17 | 2,10 | 1,129 |
| verde | 1,70 | 0,45 | 0,15 | 1,92 | 1,129 |

### Suola all'ingresso (strumento)
Sonda `tests/visual/misura-443.mjs`, 24 letture in 15 s di walkout, salvataggio `save-190-s12-ovr93` (eroe 179 cm):
suola dell'eroe da −0,076 a +0,097 (verde) e da −0,086 a +0,107 (rosso `__CPM_NO_G431`), con la stessa forma nel tempo. Nei primi
secondi entrambi i bracci stanno a +0,07/+0,10: in CI la lettura del verde è caduta lì e quella del rosso no.

## 2. Correzione

- `src/01-bootstrap-tema-avatar.jsx`: `corpoEroe431` restituisce anche `seme` (la statura che l'eroe aveva prima del 431).
- `src/12-three-match-view.jsx`: il tetto della testa della premiazione vale `1,85 × statura / seme`. Col seme (rosso `__CPM_NO_G431`) resta
  1,85: il comportamento di main non cambia. Rosso `__CPM_NO_G443` = tetto fisso. Il testimone `__CPM_CER476.mani` porta anche
  `h443` (statura dichiarata) e `seme443`.
- `CARRIER-MANAGER-AV.html` ricomposto (`node tools/build-src.mjs`, `check-src` IDENTICO dopo il commit).

Residuo dichiarato: col corpo di 1,70 lo scarto è 0,112 contro 0,077 del corpo alto. È geometria: la coppa non si rimpicciolisce con
l'eroe e deve comunque stare sopra la testa, quindi rispetto alle mani resta un po' più alta. `faccia` = 0 in tutti i bracci.

## 3. Guardiani

- `coppa-mani-191`: verde giudicato a **due stature** (vera 1,70 e seme 1,86, le stesse soglie: ≤ 0,20 e volto libero). Il rosso del 191
  (`__CPM_NO_COPPA191`) gira alla statura del seme, quella per cui era stato misurato: con l'eroe di 1,70, togliere il tetto mette la coppa
  0,19 **sotto** le mani, che passerebbe la soglia del verde (il rosso non si vedrebbe più). Rosso nuovo `__CPM_NO_G443` alla statura vera:
  deve superare 0,20.
  Esito: verde 0,11 (1,70) · 0,08 (1,86) · rosso 191 **0,54** · rosso 443 **0,26** → ✅.
- `posa-sollevamento-191`: la soglia delle mani è la stessa proporzione, `2,0 × statura / 1,86` (a 1,86 vale esattamente 2,0), giudicata
  a due stature; la statura viene dal testimone, senza = non giudicato = rosso. Esito: 1,92 contro 1,828 · 2,10 contro 2,0 · rosso
  clip 0,34 → ✅.
- `statura-eroe-431`: all'ingresso fino a 40 letture ravvicinate per tutto il walkout (almeno 12, altrimenti non giudicato): la statura
  vale la più alta (come prima), la suola **la più bassa** (il piede in appoggio). Tolleranza invariata (2 cm). Prima stesura a 16 letture:
  nella catena è uscita «instabile» (−0,090 contro −0,068, 2,2 cm, verde alla seconda prova), quindi la finestra è stata allungata.
  Con 40 letture, tre corse: verde −0,089 / −0,090 / −0,083 contro rosso −0,094 / −0,099 / −0,096 → ✅ tre volte (scarto massimo 1,3 cm).
  ⚠️ Il margine è stretto (0,7 cm dalla soglia nella terza corsa): il corpo alto affonda un po' di più al passo. Vedi dubbio 3.

Nessuna soglia abbassata in senso stretto, ma due cambi di **metro** vanno dichiarati: la soglia della posa ora è in proporzione alla
statura, e la suola è un minimo su una finestra invece di un istante (dubbio 2).

## 4. Catena del giro

`node ci-runner.mjs giro coppa-mani-191 posa-sollevamento-191 statura-eroe-431 spalle-146 aspetto-412`: esito nella sezione 7.

## 5. Foto

- `docs/collaudo-po/443-prima-coppa.png` (lavoro/204, `__CPM_NO_G443`): il piatto galleggia sopra le mani.
- `docs/collaudo-po/443-dopo-coppa.png` (giro 443): le mani stringono il bordo del piatto.
- `docs/collaudo-po/443-confronto-coppa.png`: i due ritagli affiancati (prima a sinistra).
Le foto si rifanno con `CPM_FOTO=1 CPM_BRACCI=";__CPM_NO_G443" node misura-443b.mjs`.

## 6. Dubbi per il PO (la consigliata per prima, già applicata)

1. **Come si adatta la coppa alla statura.** (a) *Consigliata, applicata*: il tetto della testa misurato nel 191 scala con statura /
   seme (una riga, comportamento di main identico col seme); (b) leggere la testa dall'osso della testa del corpo (`_head145`) a ogni
   premiazione: più fedele, ma serve una seconda taratura (quanto sta la sommità sopra l'osso) e un altro giro di misure; (c) tenere la
   coppa alla quota fissa e rimettere l'eroe alto come prima nelle sole cerimonie (è il dubbio 1c del giro 431).
2. **I due guardiani della premiazione in proporzione.** (a) *Consigliata, applicata*: soglie in proporzione alla statura e verde
   giudicato sia alla statura vera sia a quella del seme, rosso del 191 alla statura per cui era stato tarato; (b) lasciare le soglie
   assolute e fissare nel guardiano un eroe alto 1,86 (il guardiano tornerebbe verde, ma non vedrebbe mai l'eroe vero); (c) aggiungere un
   terzo braccio con l'eroe più basso possibile (170 cm è già quello della carriera nuova: oggi coperto).
3. **Suola dell'ingresso.** (a) *Consigliata, applicata*: minimo su 12-40 letture ravvicinate (tutto il walkout), confrontato col rosso con la stessa
   tolleranza; (b) confrontare l'eroe con i compagni nello stesso fotogramma (mediana dei minimi dei 21): indipendente dal rosso, ma è un
   criterio nuovo; (c) togliere la suola dal 431 e lasciarla a `volano-366`, che è il guardiano dei piedi a terra.
4. **Lo scarto rimasto (0,11 contro 0,08 col corpo alto).** (a) *Consigliata, applicata*: accettarlo, è la coppa che non si rimpicciolisce;
   (b) rimpicciolire la coppa con l'eroe (cambia la proporzione coppa/uomo che il 7.997 aveva tarato); (c) lasciare coprire un po' la
   fronte ai corpi bassi.

## 7. Esito della catena

`node ci-runner.mjs giro coppa-mani-191 posa-sollevamento-191 statura-eroe-431 spalle-146 aspetto-412` sul build del commit 7637de5:
**22/22 verdi** (coppa-mani-191 100 s · posa-sollevamento-191 82 s · spalle-146 436 s · aspetto-412 110 s · le 17 sentinelle, fra cui
partita-vera, career-critical, griglia-mobile, web-237). Unico segnale: `statura-eroe-431` **instabile** (rosso alla prima prova, verde
alla seconda) con la stesura a 16 letture; il guardiano è stato poi corretto (40 letture) e rigirato tre volte da solo, verde tre su tre.
Il build del gioco (`CARRIER-MANAGER-AV.html`) non è cambiato fra la catena e la correzione del guardiano: è cambiato solo il file di prova.
Il treno sul ramo dirà l'ultima parola.
