# Rapporto giro 412 — PO-612 (aspetto dei calciatori 3D rispetto alla figurina)

Ramo `sviluppo/giro412-aspetto-3d`, partito da `lavoro/202` (= 7.999.216 + giro 401). `GAME_VERSION` e `docs/governo` non toccati.
Rosso unico della parte applicata: `window.__CPM_NO_G412`.

Parole del PO (26/11): «Quando verrà migliorato l'aspetto dei calciatori rispetto alla statura, barba, capelli e altro? Il giocatore
3D deve essere simile alla relativa figurina».

**Tutte le misure sono sul banco (rendering software, headless), GLB acceso, ora congelata (notte), salvataggio
`tests/visual/fixtures/save-190-s12-ovr93.json`. Non sono misure del telefono del PO.**

## In breve

| voce | prima | dopo questo giro |
|---|---|---|
| statura dei 21 corpi non-eroe | **fissa** (1,8 dichiarato → ~189 cm suola-cima per tutti, scarto dalla figurina da −6 a +23 cm, ordine casuale: Spearman 0,18-0,20) | **dalla figurina** (ordine Spearman 0,98, proporzione costante: 3D = figurina +5…+12 cm, ±3% dalla mediana) |
| corporatura dei 21 corpi non-eroe | da un seme diverso da quello che dà il peso della figurina | **dalla figurina** (la stessa corporatura da cui la figurina calcola i kg) |
| statura dell'eroe | 206 cm in 3D per 179 cm dichiarati: il più alto in campo | **invariata** — proposta sotto (dubbio 1) |
| taglio/lunghezza dei capelli | una sola forma per tutti (4 colori) | invariato — proposta (calotte) |
| barba | nessuna (il volto è dipinto nella texture della testa) | invariato — **prova fatta** (barba come strato), proposta |
| carnagione | già dalla figurina (giro 240, `pelle-240`) | invariato (vedi nota su «scura») |

## File e funzioni toccati

- `src/12-three-match-view.jsx` (dentro `ThreeMatchView`, accanto a `_aspetto240`): nuove `_g412`, `_fig412`, `_eroe412`, `_corp412`;
  in `_replaceIntroLineupWithHyper` (la costruzione dei ventidue corpi CGTrader, che restano gli stessi per tutta la partita)
  `declaredHeight` = statura della figurina in metri (cm/100) per i non-eroe, e la corporatura passa da `_corp412`; stessa cosa
  nelle varianti di dettaglio (`_makeVariant`, che già ereditavano `host._h`). Testimone `visual.userData.g412` ({cm,kg,h,girth}).
- `CARRIER-MANAGER-AV.html` ricomposto (`node tools/build-src.mjs`).
- `tests/visual/misura-412.mjs` (sonda: tabella + foto affiancate), `tests/visual/aspetto-412.mjs` (guardiano),
  `tests/visual/prova-barba-412.mjs` (prova della barba, non guardiano), `tools/barba-412.py` (texture di prova della barba).
- `tests/visual/package.json`: script `aspetto-412`, `misura-412`. `tests/visual/ci-runner.mjs`: `aspetto-412` nella riga MAPPA
  che esiste già `src/12-|src/13-`.
- `docs/collaudo-po/412-confronto-{prima,dopo}-1..8.png`, `412-prova-barba-*.png`.

## 1. Misura (22 corpi, ingresso in campo)

Come si misura: la sonda si ferma all'ingresso in campo (i ventidue in fila, fermi, tutti con nome = chiave della figurina, attesa
dell'evento «teste pronte»). Statura 3D = dalla suola alla cima dei **vertici disegnati** (maglie deformate dallo scheletro), in
unità di scena = metri (la traversa è a 2,44). Statura/peso della figurina = `datiFigurina23('giocatore', nome)`, la funzione che
scrive i cm/kg sulla figurina. Capelli/barba/carnagione della figurina = manifest dei ritratti (`assets/portraits/ai/manifest.json`,
la descrizione con cui ogni volto è stato generato) attraverso il numero del volto (`aspettoFigurina225`).

Perché la statura non c'era: `declaredHeight=(index===0?_heroAppr.height:1.8)` — ogni non-eroe a 1,8; la statura della figurina
viene da `appearanceFromSeed(hash('giocatore/'+nome))`, mai letta dal 3D; la corporatura 3D veniva da `appearanceFromSeed(hash(club+'_'+posto))`.
La differenza 3D/figurina che resta dopo (+5…+12 cm, costante in proporzione) è la scala d'insieme dei corpi (`_scalaCorpo21` 0,9 ×
il rapporto maglia/scheletro, ~1,05): la media della squadra non cambia (la media dei semi della figurina è 180 cm = 1,8 di prima).
| # | giocatore | squadra | figurina cm / kg | 3D prima (cm) | 3D dopo (cm) | corporatura prima → dopo | testa 3D | capelli figurina | barba figurina | carnagione figurina |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Samuelito Vairo | eroe | 179 / 74 | 206 | 206 | 1.032 → 1.032 | black | neri rasati a zero | pizzetto | chiara |
| 2 | Sebastian Maxwell | casa | 187 / 74 | 190 | 197 | 0.979 → 0.949 | black | neri ricci corti | barba piena curata | ambrata |
| 3 | Isaac Hughes | casa | 171 / 69 | 188 | 179 | 0.985 → 1.049 | black | neri afro corti | barba piena curata | ambrata |
| 4 | Donald Wright | casa | 186 / 82 | 189 | 195 | 0.989 → 1.053 | brown | castani scuri ricci corti | rasato | ambrata |
| 5 | Dylan Gray | casa | 182 / 74 | 189 | 191 | 1.08 → 0.994 | black | neri rasati a zero | baffi sottili | ambrata |
| 6 | Norman Bailey | casa | 171 / 63 | 189 | 179 | 0.936 → 0.968 | auburn | rossi ricci medi | barba piena curata | chiara |
| 7 | Keith Thornton | casa | 167 / 64 | 190 | 177 | 1.079 → 1.024 | black | neri corti mossi | barba corta | chiara |
| 8 | Declan Russell | casa | 176 / 74 | 191 | 187 | 1.031 → 1.06 | brown | castani scuri corti lisci | baffi sottili | ambrata |
| 9 | Gary Howard | casa | 194 / 88 | 191 | 206 | 0.961 → 1.045 | black | neri ricci corti | baffi sottili | chiara |
| 10 | Rupert Hammond | casa | 195 / 87 | 191 | 207 | 0.943 → 1.023 | auburn | rossi corti lisci | barba piena curata | chiara |
| 11 | Carter Spencer | casa | 177 / 76 | 190 | 187 | 1.027 → 1.08 | black | neri afro corti | barba corta | chiara |
| 12 | Keith Carr | ospiti | 182 / 79 | 188 | 191 | 0.971 → 1.064 | brown | castani stempiati e corti | baffi sottili | olivastra |
| 13 | Stuart Ross | ospiti | 180 / 70 | 189 | 189 | 1.018 → 0.969 | auburn | rossi corti mossi | barba corta | chiara |
| 14 | Reece Pearce | ospiti | 172 / 65 | 189 | 181 | 1.055 → 0.987 | brown | castani scuri ricci corti | barba piena curata | ambrata |
| 15 | Noah Marshall | ospiti | 172 / 64 | 189 | 180 | 1.076 → 0.968 | brown | castani scuri stempiati e corti | barba piena curata | ambrata |
| 16 | Trevor Smith | ospiti | 179 / 74 | 190 | 189 | 0.989 → 1.029 | blond | biondi rasati a zero | barba piena curata | chiara |
| 17 | Connor Quinn | ospiti | 185 / 72 | 191 | 196 | 1.027 → 0.942 | brown | castani scuri afro corti | baffi sottili | scura |
| 18 | Aaron Lane | ospiti | 174 / 71 | 191 | 184 | 1.067 → 1.043 | brown | castani corti mossi | baffi sottili | olivastra |
| 19 | Jasper Mitchell | ospiti | 193 / 81 | 191 | 204 | 1.001 → 0.975 | auburn | rossi corti mossi | rasato | chiara |
| 20 | Oscar Hayes | ospiti | 191 / 78 | 189 | 201 | 0.997 → 0.951 | brown | castani scuri ricci medi | barba piena curata | scura |
| 21 | Jackson Burke | ospiti | 187 / 75 | 188 | 196 | 1 → 0.954 | brown | castani scuri corti mossi | rasato | ambrata |
| 22 | Daniel White | ospiti | 190 / 76 | 184 | 195 | 1.074 → 0.935 | blond | biondi rasati a zero | barba piena curata | chiara |

Sintesi del campione (22, rosa di casa + avversari + eroe):

- **Statura**: prima 3D 184-191 cm per tutti i non-eroe (figurine 167-195): Keith Thornton 167 cm stava a 190 (+23), Rupert Hammond
  195 cm a 191 (−4); l'eroe 179 cm a **206**. Dopo: non-eroe 177-207, nell'ordine della figurina (Spearman 0,98, ogni corpo entro ±3%).
- **Capelli**: 7 tagli diversi nelle 22 figurine (corti mossi 5, rasati a zero 4, ricci corti 4, afro corti 3, ricci medi 2, corti
  lisci 2, stempiati 2); in 3D **una forma sola** (la testa CGTrader ha i capelli nella geometria della testa: una maglia, 1.825 vertici,
  materiale `Material.002`), cambia solo il colore (4 texture). Colore: 22 su 22 uguali alla classe della figurina (giro 240).
  Sui 930 volti di giocatore del manifest i tagli sono 8 (+ i colori): ricci corti, ricci medi, afro corti, corti mossi, corti lisci,
  stempiati e corti, lunghi raccolti, rasati a zero.
- **Barba**: nel campione 19 su 22 hanno barba o baffi in figurina (piena 9, baffi sottili 6, corta 3, pizzetto 1), in 3D nessuno.
  Sui 930 volti: rasato 26%, baffi sottili 27%, barba corta 17%, pizzetto 16%, barba piena 14%.
- **Carnagione**: dalla figurina dal giro 240 (guardiano `pelle-240`, soglia CIE76 12). Nota onesta dalle foto: Connor Quinn e Oscar
  Hayes («scura» in figurina) in primo piano notturno restano visibilmente più chiari del ritratto (foto `412-confronto-dopo-6.png`).
  Non l'ho misurato con lo strumento del giro 240 in questo giro: lo segnalo come dubbio 5.
- **Volto**: lineamenti, sopracciglia, naso, occhi identici per tutti (dipinti nella texture della testa e nella geometria).

Foto affiancate (figurina | corpo intero | primo piano del viso), prima e dopo, 8 giocatori scelti dal più basso al più alto più
l'eroe: `docs/collaudo-po/412-confronto-prima-1..8.png`, `412-confronto-dopo-1..8.png`.

## 2. Statura e corporatura applicate (decisione: sicura e piccola)

- Regola: statura dichiarata del corpo = statura della figurina / 100; corporatura = quella della figurina. Media della squadra
  invariata; corpi singoli fra −7% e +8% rispetto a prima, corporatura fra 0,93 e 1,08 (dentro il limite di `cgCorporatura`).
- Piedi a terra: la scala parte dallo stesso calcolo di prima (riquadro → poggiato a terra, `visual.position.y-=min.y`); suola più
  bassa/alta verde −0,097…−0,015 contro rosso −0,090…−0,012 (stessa posa di ingresso; il −9 cm c'è uguale nei due bracci ed è del
  campione dei vertici in camminata, non di questo giro). Nessuna clip ferma nuova: `_aTerra366` non entra in gioco.
- Compenetrazione: 8 scene forzate × 4 campioni in highlight (5 corpi visibili per campione): 0 coppie compenetrate nei due bracci.
- L'eroe non cambia (dubbio 1). Arbitro, panchine, mascotte, serata/parata/cerimonie non cambiano (non hanno una figurina con nome
  in partita, o sono altre scene: dubbio 4).

Guardiano `npm run aspetto-412` (verde + rosso nello stesso comando, ~100 s): A ingresso (≥20 corpi, testimone g412 = figurina, Spearman ≥ 0,90,
proporzione ±3%, suola entro 2 cm dal rosso) · B highlight (compenetrate verde ≤ rosso + 2, ≥5 scene, ≥4 corpi per campione).
Esito: verde Spearman 0,977-0,978 · 0 fuori · 0 compenetrate; rosso Spearman 0,196 · 13 fuori ±3% (il difetto si vede).
Riga MAPPA: `src/12-|src/13-` (quella che esiste già).

## 3. Prove delle opzioni

### 3a. Barba come strato — PROVA FATTA (solo banco, nulla cambia nel gioco)

`tools/barba-412.py` legge la testa del corpo CGTrader dal GLB (maglia con `Material.002`, LOD1), prende i triangoli di mento,
mascella e labbro superiore **per posizione 3D** (profilo misurato: mento 1,52-1,54 m, bocca 1,55-1,57, base del naso 1,59, punta
1,60), li riporta sulle UV e dipinge la barba (piena / corta a pelo rado / pizzetto / baffi) sulla texture dei capelli del colore
giusto. `prova-barba-412.mjs` mette la texture sul solo corpo scelto in partita e fotografa:
`docs/collaudo-po/412-prova-barba-piena.png` (Maxwell), `-baffi.png` (Gray), `-corta.png` (Thornton). Pizzetto non fotografato: nel
campione ce l'ha solo l'eroe, escluso dalla prova.

Cosa si vede, onestamente: la barba piena e i baffi **sono al posto giusto e si leggono** nel primo piano; la barba corta quasi non
si vede (pelo rado al 55%). Il disegno è grezzo (bordi a triangoli, nessuna direzione del pelo): serve una passata di disegno a mano
sulla maschera. Nella prova il viso esce **più pallido** perché la texture provata sostituisce quella già tinta dalla pelle della
figurina (giro 240): nella versione vera la barba va dipinta DOPO la tinta della pelle, non al posto. Peso misurato: 16 texture
(4 colori × 4 barbe) = 2,8 MB in WebP, ~175 KB l'una.

Costo sul telefono (calcolato, non misurato sul telefono): una texture della testa 2048² occupa ~21 MB di memoria grafica con le
mipmap. Oggi una partita ne usa al massimo 4 (un colore ciascuna); col campione misurato le combinazioni colore+barba sarebbero **11**
(+7 texture ≈ +147 MB): troppo per un telefono. Due rimedi, da misurare nel prossimo giro: texture della barba a 1024² (+7 × 5,6 ≈
+39 MB), oppure — consigliato — **strato separato**: una copia dei soli triangoli della barba (poche centinaia) sopra la testa, con
una maschera in bianco e nero 512² colorata dal materiale (4 maschere ≈ 1,3 MB di memoria, +1 disegno per corpo con barba).

Licenza: è una modifica della texture del pacchetto CGTrader «Soccer Player - Rigged» (licenza «Royalty Free (standard)» dichiarata
dal PO, `docs/governo/CREDITI-fonti.md`). Il testo della licenza non è nel repo: **non posso confermare** dal repo che la licenza
permetta di distribuire texture modificate; le texture del pacchetto sono già distribuite modificate (WebP del giro 233, tinta del
giro 240), stessa situazione. Nessun asset di terzi nuovo.

### 3b. Calotte di capelli intercambiabili — PROPOSTA (non provata)

Misurato: i capelli sono **dentro la geometria della testa** (una maglia sola con la texture HEAD, 1.825 vertici nel LOD1); i 4
«capelli» di oggi sono 4 colori della stessa forma. Per avere i tagli delle figurine (8 nel manifest: rasati a zero, corti lisci,
corti mossi, ricci corti, ricci medi, afro corti, stempiati, lunghi raccolti) servono: (1) una testa «rapata» (la calotta di oggi
schiacciata sul cranio o ridipinta pelle) e (2) 3-5 calotte modellate e agganciate all'osso `head`. **Nel repo non c'è nessuna calotta
con licenza verificata**: o si modellano (lavoro nostro, licenza nostra) o si comprano (licenza da leggere voce per voce prima di
usarle). Stima per calotta: 1-3 mila triangoli, 0,1-0,3 MB GLB, texture condivisa per colore; sul telefono +1 disegno per corpo.

### 3c. Variazioni di volto — PROPOSTA (non provata)

Il volto (occhi, naso, sopracciglia, rughe) è dipinto nella texture della testa e sta nella geometria: oggi è lo stesso per tutti.
Strade: piccole deformazioni delle ossa della testa (naso/mascella non hanno ossa nel corpo CGTrader: misurato solo `head` e `neck_01`
fra le ossa cercate) → poco efficace; texture del volto diverse (2048² ciascuna, stesso costo in memoria della barba incorporata);
un corpo diverso con forme del viso (blendshape) → cambio di modello, fuori portata. Consiglio: non ora.

## 4. Tabella delle opzioni

| opzione | risultato | MB da scaricare | telefono (memoria grafica) | licenza | giri stimati |
|---|---|---|---|---|---|
| **Statura e corporatura dalla figurina** (applicata) | ordine 0,98, ±3%, nessuna compenetrazione, piedi come prima | 0 | 0 (stessi corpi, altra scala) | nessun asset nuovo | fatto |
| Eroe alla stessa regola (dubbio 1) | 206 → ~189 cm per 179 dichiarati (prova `__CPM_G412E` sul banco) | 0 | 0 | — | 1 (guardiani dell'inquadratura dell'eroe) |
| **Barba come strato separato** (consigliata fra le nuove) | come la prova, senza toccare la pelle | ~0,3 (4 maschere) | ~1,3 MB + 1 disegno per corpo con barba | modifica di asset CGTrader (vedi 3a) | 2 (strato + disegno a mano della maschera e guardiano) |
| Barba incorporata nella texture della testa | prova fatta (foto) | 2,8 (16 texture) | fino a +147 MB a 2048², +39 MB a 1024² | come sopra | 1-2 |
| Calotte di capelli (3-5 tagli + testa rapata) | da provare | 0,5-1,5 | +1 disegno per corpo, texture condivise | asset da modellare o comprare: licenza da leggere | 3-4 |
| Variazioni di volto | da provare | 2-10 | alto (una texture per volto) | asset nuovi | 4+ |

## 5. Dubbi per il PO (la consigliata per prima)

1. **L'eroe è alto 206 cm in 3D e la sua figurina dice 179.** Oggi è sempre il più alto in campo. Opzioni: (a) *consigliata*: la
   stessa regola degli altri (~189 cm, −8%), da accompagnare coi guardiani dell'inquadratura e dei gesti dell'eroe; (b) lasciarlo
   com'è (scelta di regia: l'eroe si vede meglio); (c) via di mezzo (metà strada). Non applicato: tocca l'inquadratura dell'eroe.
2. **Barba**: (a) *consigliata*: strato separato con maschera disegnata a mano, 4 tipi (piena, corta, pizzetto, baffi) colorati dai
   capelli della figurina; (b) barba incorporata nella texture a 1024² (più semplice, più memoria); (c) niente barba finché non si
   cambia il corpo. Va confermata la licenza CGTrader per le modifiche alla texture (vedi 3a).
3. **Tagli di capelli**: (a) *consigliata*: 3 calotte (rasato, corto, ricci/afro) che coprono 6 tagli su 8, modellate da noi;
   (b) 5 calotte acquistate (licenza da leggere prima); (c) restare con la forma unica e i 4 colori.
4. **Statura nelle altre scene** (serata di presentazione, parata, panchine): oggi usano altri semi; (a) *consigliata*: estendere la
   stessa regola dove il corpo ha un nome con figurina; (b) lasciarle come sono.
5. **Carnagione «scura»**: nelle foto notturne (`412-confronto-dopo-6.png`) Connor Quinn e Oscar Hayes restano più chiari del
   ritratto anche col giro 240 verde. (a) *consigliata*: un giro di misura col metodo di `pelle-240` sulle sole carnagioni scure;
   (b) va bene così.

## 6. Verifiche

- `npm run aspetto-412`: verde (Spearman 0,977, 0 fuori ±3%, 0 compenetrate) e rosso si vede (Spearman 0,196, 13 fuori).
- `node ci-runner.mjs giro aspetto-412`: **18/18 verdi** (aspetto-412 + 17 sentinelle) su 7.999.216 + giro 412.
- Effetti collaterali del rituale ripristinati prima del commit: le foto rigenerate da `griglia-mobile` in `docs/collaudo-grafico/`
  e `docs/governo/STABILITA.json` (scritto da `ci-runner.mjs`; `docs/governo` non va toccato in questo giro).
- Non verificato: telefono del PO; le altre scene 3D (serata, parata) non cambiano e non sono state rimisurate.
