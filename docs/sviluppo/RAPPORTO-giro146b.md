# Rapporto giro 146b — le spalle senza gobba (seguito di PO-348)

Ramo `sviluppo/giro146b-spalle` (da `sviluppo/giro146-spalle`). Reazione del PO alle foto del giro 146
(`docs/sviluppo/giro146/dopo-1440x900-presentazione-provino0.jpg`, `dopo-1440x900-premiazione-provino0.jpg`):
«le spalle le hai modificate? sembra che ha lo scartello» (= sembra che abbia la gobba). Nessun campo nuovo nel salvataggio,
`GAME_VERSION` non toccato.

## 1. Come si misura (GLB acceso)

La sonda `tests/visual/spalle-146-misura.mjs` (`__misura146`) legge i vertici skinnati e le ossa di un corpo 3D vivo. Al giro 146 misurava
larghezze e lunghezze; ora misura anche la **postura**. Tutto è in frazione della statura H (o delle anche Aj) salvo gli angoli, quindi i
due formati danno lo stesso numero.

| grandezza | definizione |
|---|---|
| qS | quota delle teste degli omeri rispetto alla base del collo (`neck_01`); negativo = spalle sotto il collo. In tabella è in unità Aj |
| qA | quota dell'acromion (cima dei vertici di spalla nella metà esterna) rispetto alla base del collo |
| collo | collo visibile: mento (vertici della testa davanti all'osso `head`, il più basso) − cima del trapezio (vertici a dominante clavicola dentro le teste degli omeri). Più piccolo = collo affondato |
| pro | protrazione: teste degli omeri davanti al torace (`spine_03`) lungo l'avanti del corpo (dai piedi). Negativo = spalle dietro il torace |
| nuca | la testa (`head`) davanti alle spalle, lungo l'avanti. Alto = testa in avanti / dorso curvo (la «gobba» di profilo) |
| spiov / spiovV | inclinazione base del collo → testa dell'omero (articolazioni) / profilo **visibile** della pelle collo-trapezio → acromion. 0° = orizzontale |
| clav | inclinazione della clavicola (radice → testa dell'omero; positivo = sale verso il fuori) |
| tilt | dislivello fra le due teste degli omeri |
| cifo | tratto torace → collo (`spine_03 → neck_01`) dalla verticale, positivo in avanti |

Scene (`spalle-146-scene.mjs`): highlight dell'eroe (gi18 e gi3, scelta e gesto), premiazione all'alzata del trofeo, intro, serata di
presentazione e — nuova — **panchina** (scena 3D dell'ingresso dalla panchina, stesso percorso di `panchina-127`). Il provino (camera
vicina al corpo) ora fa tre foto: fronte, tre quarti e **profilo**.

Tre bracci: **prima** (= `lavoro/189`, rosso `__CPM_NO_G146`), **giro 146** (rosso `__CPM_NO_G146B`), **giro 146b**. Per sapere dove
sta la clip da sola ho misurato anche `__CPM_NO_G146` + `__CPM_NO_POSTURA23` (nessuna correzione).

## 2. La causa misurata

Eroe, mediane (360x800; 1440x900 entro il rumore salvo l'alzata, vedi sotto). Colonne: Sj/Aj · qS/Aj · pro · nuca · spiovV · collo.

| scena | prima | giro 146 | **giro 146b** |
|---|---|---|---|
| highlight | 2,39 · −0,49 · +0,005 · +0,030 · 18,6° · −0,030 | 2,40 · −0,50 · +0,009 · +0,029 · 19,8° · −0,027 | **2,38 · −0,50 · +0,011 · +0,027 · 21,4° · −0,029** |
| intro | 2,41 · −0,46 · −0,018 · −0,028 · 19,4° · −0,014 | 2,41 · −0,46 · −0,017 · −0,028 · 20,4° · −0,012 | **2,41 · −0,49 · −0,018 · −0,028 · 20,9° · −0,013** |
| **presentazione** | 2,00 · −0,84 · **+0,016** · **−0,007** · **45,1°** · −0,009 | 2,35 · −0,89 · **−0,006** · **+0,015** · 38,4° · −0,010 | **2,34 · −0,84 · +0,016 · −0,008 · 36,9° · −0,010** |
| presentazione (gli altri) | 1,97 · −0,82 · +0,023 · −0,007 · 43,5° · −0,013 | 2,35 · −0,87 · −0,005 · +0,020 · 37,2° · −0,014 | **2,34 · −0,82 · +0,023 · −0,006 · 36,1° · −0,014** |
| **alzata del trofeo** | 1,24 · **+0,40** · +0,009 · +0,005 · — · −0,049 | 2,34 · **+0,39** · +0,001 · +0,011 · — · −0,039 | **2,34 · +0,39 · +0,012 · −0,000 · — · −0,036** |
| panchina | 2,34 · −0,48 · +0,025 · −0,010 · 18,2° · −0,018 | 2,35 · −0,47 · +0,024 · −0,009 · 22,6° · −0,019 | **2,36 · −0,49 · +0,027 · +0,001 · 24,5° · −0,032** |

Le due cause della «gobba»:
1. **Presentazione.** La regola del giro 146 allargava ruotando la clavicola e **consumando prima la componente in avanti**: le teste degli
   omeri passavano da 0,016·H davanti al torace a 0,006·H **dietro**, e la testa finiva 0,015·H davanti alle spalle (prima −0,007). Di
   profilo il dorso alto sporgeva dietro il collo (foto `confronto-*-presentazione.jpg`, riga «profilo», colonna centrale).
2. **Alzata del trofeo.** La clip `mx-victory` porta già le teste degli omeri sopra la base del collo (clip da sola: +0,07·Aj); la postura
   del gioco (`_corrPostura23`, 7.999.21: clavicole +0,45 rad) le porta a +0,40·Aj. Il giro 146 non le ha alzate (quota uguale entro 0,01),
   ma le ha **allargate a quella quota**: prima erano strette accanto al collo (Sj/Aj 1,24), ora sono larghe e alte — l'effetto «spalle
   alle orecchie» della foto.

Da fermi nel gioco (highlight, intro, panchina, i compagni) la quota è −0,45/−0,55·Aj; nella serata di presentazione, che non ha la
postura del gioco, −0,84 (la quota della clip).

## 3. La correzione: la stessa regola (`_spalle146`, src/12), non una seconda

- La testa dell'omero si sposta **solo di lato** fino alla fascia [2,34 · 2,62]·Aj del giro 146: quota e avanti/indietro restano quelli
  che arrivano (clip, o clip + postura del gioco). Nessuna protrazione e **nessun arretramento** aggiunti. La clavicola ruota verso il
  punto nuovo e l'attacco del braccio si allunga o si accorcia quanto serve (tra 0,7 e 1,45 volte).
- **Tetto di quota**: la testa dell'omero non sta mai sopra −0,44·Aj rispetto alla base del collo, la quota delle spalle da fermi nel
  gioco (misurata −0,45/−0,55). La regola **non alza mai** le spalle: le abbassa se stanno sopra il tetto.
- **Le mani restano dove le mette la clip**: dopo lo spostamento della spalla omero e avambraccio si ripiegano col teorema del coseno nel
  piano del gomito della clip (IK a due ossa), e la mano riprende la rotazione di clip. Per questo la spalla scende verso il tetto **solo
  finché la mano della clip resta raggiungibile**.
- Rosso `__CPM_NO_G146B` = la regola del giro 146 com'era (`_spalle146a`, intatta). `__CPM_NO_G146` resta il rosso di tutto.
  `__CPM_PROVA146B_NOREACH` (solo prova) toglie il limite della portata: serve a riprodurre la misura del §4.

Il ritocco della postura del gioco (`_corrPostura23`) non è toccato.

## 4. L'alzata del trofeo: un limite geometrico, non risolto

Con le braccia tese sopra la testa e le mani ferme, la distanza spalla-mano è la lunghezza del braccio: **allargare le spalle obbliga a
tenerle alte** (o ad abbassare le mani). Misurato (360x800, stesso fotogramma della clip):

| variante | quota spalle (qS/H) | Sj/Aj | mani sopra i piedi | presa del trofeo |
|---|---|---|---|---|
| prima | +0,041 | 1,26 | 2,052 | 0,07 |
| giro 146 | +0,040 | 2,34 | 2,039 | 0,08 |
| **giro 146b** (mani ferme) | +0,040 | 2,34 | 2,048 | 0,07 |
| prova: spalle al tetto senza limite di portata | −0,046 | 2,34 | **1,917** (−13 cm) | **0,20** (coppa staccata dalle mani) |

Quindi nell'alzata il 146b resta, in quota, dove stava il giro 146; cambia solo che la testa non va più avanti (nuca +0,011 → 0,000) e
il collo visibile cresce di poco (−0,039 → −0,036). Quando la clip, in un altro istante del congelamento, lascia margine alla portata, la
regola abbassa davvero (corsa a 1440x900: qS −0,46·Aj, collo +0,005). ⚠️ L'alzata è un campione solo per corsa e l'istante di clip cambia
fra le corse: il confronto vale dentro la stessa corsa, non fra due corse.

## 5. Riferimenti realistici

- **Inclinazione delle spalle** (linea collo → acromion contro la linea fra gli acromion): 24,2 ± 3,6° (destra) e 25,1 ± 3,7° (sinistra) in
  362 atleti giapponesi (rivista della Japan Shoulder Society, 1998, vol. 22 n. 2, pp. 359-362,
  [J-STAGE](https://www.jstage.jst.go.jp/article/katakansetsu1977/22/2/22_359/_article/-char/en)); 18,7-21,9° in uomini adulti giapponesi
  ([hbg.repo.nii.ac.jp](https://hbg.repo.nii.ac.jp/records/3373)); 13,56 ± 3,70° da punti ossei in una popolazione sudafricana
  ([SciELO](https://sidalc.net/search/Search2Record/oai:scielo:S1681-150X2017000400007)). Letti dagli estratti dei risultati di ricerca, **non
  dai testi completi**; le definizioni non coincidono fra loro.
  Confronto: da fermi nel gioco spiovV 18-25° (dentro la banda degli atleti); **nella serata di presentazione 36-37°** (prima 45°): resta
  più spiovente del riferimento — vedi domande.
- **Testa in avanti** (angolo craniovertebrale trago-C7 sull'orizzontale): «normale» sopra 53-55°, in piedi 56,6 ± 2,7° nei soggetti
  normali ([WKU, IJESAB vol. 16 n. 3](https://digitalcommons.wku.edu/ijesab/vol16/iss3/53),
  [PMC11042887](https://pmc.ncbi.nlm.nih.gov/articles/PMC11042887)). **Non lo uso come soglia**: la sonda misura centri articolari
  (`neck_01`, `head`) e non trago e processo spinoso di C7, quindi l'angolo non è confrontabile. Uso solo il confronto fra bracci (nuca).
- Altezza delle spalle rispetto al collo, collo visibile e protrazione: **non ho trovato una fonte** che dia questi rapporti su centri
  articolari. Le soglie vengono dalla misura dei tre bracci, non da una norma.
- Larghezze (ANSUR II): vedi il rapporto del giro 146, §5.

## 6. Guardiano `npm run spalle-146` (esteso)

Cinque scene (+ panchina), tre bracci: verde, rosso `__CPM_NO_G146`, rosso `__CPM_NO_G146B`; i rossi devono cadere entrambi, stampati per
ultimi; «non giudicato» = rosso. Soglie del giro 146 invariate. Nuove soglie, fissate dopo la misura (verde · giro 146 · prima, 360x800 /
1440x900):

| controllo | soglia | verde | giro 146 | prima |
|---|---|---|---|---|
| quota da fermi (qS/Aj, ogni campione tranne alzata e gesto) | ≤ −0,43 | −0,439 / −0,449 | −0,384 / −0,409 | −0,409 / −0,382 |
| alzata: quota (qS/H) e collo | ≤ 0,045 e ≥ −0,045 | 0,040 · −0,036 | 0,040 · −0,039 | 0,041 · −0,049 |
| protrazione (ogni campione) | pro ≤ 0,035 | ≤ 0,028 | ≤ 0,028 | ≤ 0,035 |
| presentazione: niente spalle dietro il torace | pro ≥ 0,008 | ≥ 0,0156 | −0,0064 | ≥ 0,0156 |
| nuca dell'eroe (presentazione, intro, panchina) | ≤ 0,005 | ≤ 0,0013 | presentazione 0,015 | ≤ −0,006 |
| inclinazione visibile da fermi | ≤ 41° | ≤ 38,3° | ≤ 40,8° | ≤ 45,7° |
| dislivello fra le spalle da fermi | ≤ 12° | ≤ 9,0° | ≤ 11,2° | ≤ 10,7° |

La nuca dell'alzata non è nel guardiano: cambia con l'istante della clip (0,000 / 0,006 fra le due corse). `CPM_SOLO=verde|g146|g146b`.

Esito 360x800: ✅ verde; il rosso `__CPM_NO_G146` cade (larghezza, coerenza 1,93, quota, spiovenza 43-46° in presentazione); il rosso
`__CPM_NO_G146B` cade (presentazione: spalle dietro il torace su 21 campioni, nuca 0,014; quota alta su portiere e panchina).
Esito 1440x900: ✅ verde, cadono entrambi i rossi (il 146b anche su quota alta di compagni e panchina, arretramento e nuca 0,015 in presentazione).

## 7. Catena (un controllo alla volta, `CPM_CI_PAR=0`, memoria e disco controllati prima di ognuno)

| controllo | esito |
|---|---|
| spalle-146 360x800 · 1440x900 | ✅ · ✅ (cadono entrambi i rossi `__CPM_NO_G146` e `__CPM_NO_G146B`) |
| premiazione-132 | ✅ (il rosso cade) |
| presentazione-142 | ✅ (il rosso cade) |
| posa-sollevamento-191 | ✅ mani 2,10 sopra i piedi (soglia 2,0; giro 146: 2,09) · rosso 0,34 di clip |
| premiazione-palco-191 | ✅ (il rosso si vede) |
| intro-118 | ✅ |
| panchina-127 360x800 · 412x915 · 1440x900 | ✅ · ✅ · ✅ (il rosso si vede) |
| scena3d-96 tel · pc · tabv · tabo | ✅ 16/16 · ✅ 9/9 · ✅ 3/3 · ✅ 3/3, errori di pagina 0 |
| validate-situations | ✅ PASS 14/14, fingerprint 00001505, 0 failure |
| test:logic | ✅ 43 pass · 0 fail |
| save-compat | ✅ 12 pass · 0 fail |
| highlight-95 (completo) | ✅ verde 104 highlight · 0 difetti (il rosso si vede) |

## 8. Foto (`docs/sviluppo/giro146b/`)

- `confronto-<formato>-<scena>.jpg`: una tavola per scena, colonne prima · giro 146 · giro 146b, righe **fronte** e **profilo** (camera
  vicina al corpo). Scene: `highlight-scelta`, `highlight-gesto`, `intro`, `presentazione`, `premiazione`; formati 360x800 e 1440x900.
- Le singole foto: `<braccio>-<formato>-<scena>-fronte.jpg` / `-profilo.jpg`, e la schermata intera `<braccio>-<formato>-<scena>.jpg`
  (anche `panchina`).
- Misure grezze: `misura-<braccio>-<formato>.json`, e `misura-prova-senza-portata-360x800.json` (la prova del §4).

## 9. Fuori ambito e domande aperte per il PO

1. **Alzata del trofeo.** Con mani ferme e spalle larghe le spalle non possono scendere (§4). Le strade sono tre e sono una scelta
   d'aspetto: (a) lasciarla così (spalle larghe e alte, mani sul trofeo); (b) spalle meno larghe solo con le braccia alzate; (c) abbassare
   le spalle e con loro mani e trofeo (fino a 13 cm, da riallineare la coppa). Quale?
2. **Serata di presentazione.** Lì non c'è la postura del gioco: le spalle stanno alla quota della clip (−0,84·Aj, contro −0,45/−0,55 in
   partita) e il profilo visibile è più spiovente (36-37°, in partita 18-25°, riferimento atleti 24-25°). La regola non alza mai le
   spalle, come chiesto. Si vuole la stessa postura della partita anche nella serata (spalle più alte di ~0,035·H, meno spioventi)?
3. **Tetto di quota.** È fissato alla quota delle spalle da fermi **nel gioco** (con la postura 7.999.21), non a quella della clip pura
   (−0,8·Aj): usare la clip pura riabbasserebbe le spalle in tutte le partite e riaprirebbe le «spalle spioventi» del 7.999.21. Va bene così?
4. **Panchina:** misurato l'eroe nella scena d'ingresso; i compagni in panchina restano fuori dall'inquadratura di quella scena (e senza
   mixer finché non si vedono), quindi non sono misurati in questo giro.
5. Restano dal giro 146: mani del corpo di riserva «regular», corporatura non uniforme, panchina seduta, parata e festa non misurate.
