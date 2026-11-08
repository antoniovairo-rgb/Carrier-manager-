# Rapporto giro 123 — PO-323, il D3 di highlight-95 su «Tiro di potenza» (lotto 7.999.186)

Ramo `sviluppo/giro123-angolo-tiro`, base `sviluppo/giro121-angolo` (rimedi dei giri 117/119/121). `GAME_VERSION` non toccata.
`node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte a ogni commit.

## 1. Bisezione — il colpevole NON è un rimedio

Partita sola `CPM_SALVA=s12 CPM_SEMI=7 CPM_ARMI=verde CPM_POL=drib CPM_PAR=1 CPM_NO_SENZA=1 CPM_RIGHE=1 CPM_D3DIAG=1`
(~3 min 36 s a corsa), una alla volta, `free -m` e `df -h` prima di ciascuna. Scena giudicata: «💥 Tiro di potenza», parata,
«Conclusione centrale» (`hl1`). Configurazione «solo X» = X acceso, gli altri quattro interruttori `__CPM_NO_*` accesi.
«Fotogramma» = minimo portiere↔pallone per fotogramma della scena (testimone temporaneo nelle corse marcate †, poi `__CPM_GKMIN117`
reso attivo a GLB spento); «sonda» = il numero che la sonda usa per il D3 (interrogazione dopo l'esito).

| configurazione | corsa | sonda (u) | fotogramma (u) | origine dell'arco all'armo (x, z 3D) | G119P scattato |
|---|---|---|---|---|---|
| (a) tutti accesi | 1 | **5,3** | – | −5,99 · 0,54 | no |
| (a) tutti accesi | 2 | **5,7** | – | −5,99 · 0,54 | no |
| (a) tutti accesi | 3 † | 3,5 | – | −5,99 · 0,54 | no |
| (a) tutti accesi | 4 † | 1,7 | 1,73 | −4,30 · 0,10 | no |
| (b) tutti spenti | 1 | 0,3 | – | – | – |
| (b) tutti spenti | 2 | 1,3 | – | −7,64 · 0,93 | – |
| (b) tutti spenti | 3 † | 0,7 | 0,73 | −7,64 · 0,93 | – |
| (b) tutti spenti | 4 † | **5,6** | **7,38** | −7,64 · 0,93 | – |
| solo G117A | 1 | 0,5 | – | −7,64 · 0,93 | – |
| solo G119P | 1 | **5,8** | – | −5,99 · 0,54 | no |
| solo G119P | 2 † | 1,6 | 1,09 | −4,33 · 0,14 | no |
| G119P spento (gli altri accesi) | 1 † | **5,2** | – | −7,64 · 0,93 | – |
| solo G121H | 1 † | **5,9** | **7,02** | −5,99 · 0,54 | no |
| solo G121C | 1 † | **6,1** | **6,63** | −7,64 · 0,93 | no |
| solo G121M | 1 † | **5,2** | **5,84** | −7,64 · 0,93 | no |

Letture (misurate):
- con **tutti i rimedi spenti** la scena arriva a 5,6 u (sonda) e **7,38 u per fotogramma**: il difetto è pre-esistente;
- l'ipotesi principale (G119P vale per tutte le parate) è **smentita**: in nessuna corsa il ramo G119P scatta (`__CPM_PARATA119`
  vuoto). Qui il pallone all'armo è a 51 u dall'eroe, quindi `_far119` è vero e l'origine di calcolo è l'eroe (x 45,0), che sta
  *oltre* il portiere (x 43,2-44,8): la condizione `_ox119 < _gx258 − 0,2` è falsa. E il taglio 258 ha già portato il bersaglio sul
  piano del portiere, quindi `ballArcTgtX > _gx258 + 0,3` è falsa prima ancora;
- la prima coincidenza «G119P acceso ⇒ 5+ u» (4 corse su 4) si rompe alla quinta (G119P acceso 1,6/1,7; G119P spento 5,2).
  L'unica cosa che l'interruttore G119P sposta in modo stabile è l'origine dell'arco all'armo (−5,99 contro −7,64): non so dire
  perché (il ramo non scatta e non ha effetti collaterali) — **non posso confermarlo**; resta una nota, non pesa sul minimo;
- il minimo non dipende dalla configurazione: dipende da dove cade l'ultimo fotogramma dell'arco (sotto).

## 2. La causa (misurata, testimone per fotogramma)

All'armo della conclusione il pallone è a **centrocampo** (x 3D −4,3/−7,6) e l'eroe a (45,0; −11,8): 51 u. Col GLB spento il volo al
piede 274 non esiste (vive nel ramo `glbAvatars`, rapporto 119 §1), quindi l'arco parte da lì: 48 u in **0,23 s di scena** (durata
già accorciata dal taglio 258, u = 0,95-0,98). Traccia di una corsa cattiva (`solo G121H`): scena 5,08 → 5,38 s, x del pallone
−4,2 · 2,1 · 8,6 · 15,4 · 22,4 · 29,7 · **37,2**, bersaglio 43,6 — poi la respinta.

Il moto orizzontale dell'arco si scrive (src/12 ~r. 3957) **prima** che `ballArcT` avanzi (~r. 4235). Nel fotogramma in cui l'arco
finisce (`u >= 1`) il pallone resta dunque all'u del fotogramma precedente, e il post-arco (la respinta 7.514) parte da lì. Con
`aDt` 0,05 (cap headless) e durata 0,23 s l'ultima posizione scritta sta al ~78% della corda: **7 u prima del portiere** che «para».
Se invece l'ultimo campione cade a ridosso della fine (T = 0,24 contro 0,23), il pallone arriva a 1,7 u: ecco l'alternanza 0,3-7,4.

Seconda parte della misura sbagliata: la sonda guarda il portiere **dopo** la rivelazione dell'esito, ma qui il contatto cade
0,01-0,13 s **prima** (esito a 5,39-5,73 s di scena). Il testimone per fotogramma `__CPM_GKMIN117`, che il giro 117 ha introdotto per
questo, vive solo nel ramo GLB (rapporto 119 §1), e highlight-95 gira GLB spento.

## 3. Correzione (src/12, nessun sorteggio aggiunto o tolto, motore non toccato)

1. **`__CPM_NO_G123T` (rosso)**: sulla **parata della famiglia tiro** (shot/penalty/freekick/header, `hlSuccess === false`,
   `hlOutcomeKind` saved/save, scena dell'eroe non difensiva), se a `u >= 1` il pallone non è ancora sul bersaglio dell'arco (il piano
   del portiere del taglio 258, oltre 0,3 u) l'arco dura **un fotogramma in più**: la scrittura normale dell'arco (u = 1) ce lo porta
   con un passo solo, poi la respinta. Una volta per arco (chiave scena + origine + durata). Non tocca gol, pali, fuori, murati,
   passaggi, cross, difesa.
   **Prima stesura bocciata** (commit `Giro 123: la parata della famiglia tiro finisce sul bersaglio…`): nel fotogramma di fine arco
   il pallone veniva *spostato* sul bersaglio. scena3d-96 l'ha bocciata: **D11 salto del pallone 3,2 u in 0,050 s su gi15 parata
   (pc e tabv), scrittore `arco`** — due passi in un fotogramma. Sostituita dalla geometria qui sopra (commit successivo).
2. **`__CPM_GKMIN117` anche a modelli spenti** (sola lettura, solo `__CPM_REC`, spento da `__CPM_NO_GKMIN123`): stessa grandezza e
   stessa regola del giro 117 (minimo per fotogramma della scena `hl_result`, azzerato fuori), scritto solo se `glbAvatars` è nullo,
   così le due copie non si sommano. La soglia del D3 (6 u) e la finestra (1,5 s di scena) **non sono cambiate**.
3. Sonda: `CPM_D3SOGLIA` (default 4, come prima) per stampare la diagnosi anche sotto i 4 u; la diagnosi porta `gkmin` e `scT`.

Il pallone a centrocampo all'armo (GLB spento) **resta**: è la scena che apre col pallone lontano dall'eroe, codice 001; col GLB acceso
lo copre il volo 274. Fuori dal lavoro chiesto, lo lascio alla madre.

## 4. Dimostrazioni (una alla volta)

**Sul build finale** (geometria «un fotogramma in più»):

| controllo | esito |
|---|---|
| s12/7 «Tiro di potenza», verde ×3 | ✅ fotogramma **0,45 · 0,22 · 0,35 u** (sonda 0,5 · 0,2 · 0,4) |
| scena3d-96 | ✅ 31/31 scene, rossi per punto {}, 0 errori di pagina (gi15 parata: 0 salti in tutte e quattro le viste) · 24 min |
| test:logic | ✅ 43 pass · 0 fail |
| save-compat | ✅ 12 pass · 0 fail |
| volee-d3-119 | ✅ verde 0,65 · 0,67 · 0,52 u · rosso 4,26 · 4,57 (cross in area 0,63, caso di controllo) · 4 min |
| replay | ✅ 8 highlight, completi e coerenti |
| tabellone-117 | ✅ ripresa e percorso normale verdi, rosso visibile · 5 min |
| s12/7 rosso `__CPM_NO_G123T` | ⏳ non rieseguito sul build finale (le due corse sotto valgono per lo stesso interruttore sulla prima stesura) |
| angolo-117 ×2 | ⏳ **non rieseguito** sul build finale: tetto delle 5 ore |
| highlight-95 completo + corsa del solo verde | ⏳ **non rieseguiti** sul build finale: tetto delle 5 ore |
| partita-vera, validate-situations | ⏳ **non eseguiti**: tetto delle 5 ore |

**Sulla prima stesura (scatto sul bersaglio, poi bocciata da scena3d-96)** — valgono come misura del principio (il pallone che
arriva al portiere toglie il D3), non come verde del build finale:

| controllo | esito |
|---|---|
| s12/7 «Tiro di potenza», verde ×3 | ✅ fotogramma **0,45 · 0,36 · 0,45 u** (sonda 0,5 · 0,4 · 0,5) |
| s12/7, rosso `__CPM_NO_G123T` ×2 | 1,91 · **6,56 u** (sonda 1,9 · 6,0): il rosso dipende da dove cade l'ultimo fotogramma, come prima |
| angolo-117 corsa 1 | ✅ verde 8 casi (angoli 8 · 18 · 19 · 30 · 14 · 0 · 6 · 13, porta max 6,6, pallone max 0,58) · rosso G117A 6/6 · rosso g121 2/2 · 13 min |
| angolo-117 corsa 2 | ✅ verde 8 casi (15 · 8 · 24 · 26 · 4 · 16 · 8 · 14, porta max 6,3, pallone max 0,58) · rosso G117A 6/6 · rosso g121 2/2 · 13 min |
| volee-d3-119 | ✅ verde 0,65 · 0,67 · 0,64 u · rosso 3,6 · 5,54 (cross in area 0,62, caso di controllo) · 4 min |
| highlight-95 completo (`CPM_RIGHE=1 CPM_D3DIAG=1`) | ✅ verde 100 highlight, 29 passaggi (86,2%), 13 gol compagno = 13 assist, 19 parate giudicate, **0 difetti** (i quattro «Tiro di potenza»: 1,2 · 0,9 · 0,6 · 1,7 u) · rosso visibile (106 highlight, 194 difetti, D4 senza esito 5) · 63 min |
| highlight-95 solo braccio verde, corsa 2 | ✅ 91 highlight, 27 passaggi (88,9%), 14 gol compagno = 14 assist, 15 parate giudicate, **0 difetti** («Tiro di potenza»: 1,2 · 1,8 · 0,9 · 0,8 · 1,0 u) · 31 min |
| scena3d-96 | ❌ D11 salto 3,2 u su gi15 parata (pc, tabv) — causa della seconda stesura |

## 5. Cosa resta alla madre

1. Sul build finale: angolo-117 ×2, highlight-95 completo verde+rosso, una corsa del solo verde, partita-vera, validate-situations,
   e una corsa del rosso `__CPM_NO_G123T` sulla scena s12/7. Ordine consigliato: validate-situations (il gate gira GLB spento, cioè
   esattamente dove agisce il rimedio) prima di highlight-95.
2. La scena che apre col pallone a centrocampo e l'eroe a 51 u (GLB spento, nessun volo 274): l'arco del tiro attraversa mezzo campo in
   0,23 s. Il rimedio di questo giro fa arrivare il pallone al portiere, non sposta l'origine. Decisione della madre.
3. L'interruttore `__CPM_NO_G119P` sposta in modo stabile l'origine dell'arco all'armo di questa scena (−5,99 → −7,64) anche se il suo
   ramo non scatta mai: non so spiegarlo, non posso confermarne la causa (§1).
4. `GAME_VERSION` non toccata. Interruttori nuovi: `__CPM_NO_G123T` (rimedio), `__CPM_NO_GKMIN123` (testimone a GLB spento).
5. Metodo: le corse della bisezione sono una alla volta in primo piano; i controlli lunghi in un processo di sfondo con attesa in
   primo piano sul file (riga `FINE`), `free -m` e `df -h` registrati in testa a ogni log.
