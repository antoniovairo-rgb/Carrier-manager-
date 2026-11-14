# Rapporto giro 191 — rigori: PO-399 (rigore calciato due volte) e PO-403 (lotteria dopo il pareggio)

Ramo `sviluppo/giro191-rigori`, partito da `lavoro/194` (= 7.999.193 pubblicata). `GAME_VERSION` non toccata, roadmap non toccata
(le aggiorna chi rilascia). Ogni numero qui sotto è **misurato** con le sonde indicate; dove non lo è lo scrivo.

## 0. In breve

| Punto | Prima | Dopo | Rosso | Guardiano |
|---|---|---|---|---|
| PO-399, r187d-11 seme 12 (produzione) | rigore calciato **due volte**: compagno nel motore al 61', eroe in scena al 60' | **un calcio**, in scena, col motore che aspetta (`pen:42`) | `__CPM_NO_G191A` | `npm run rigore-191` |
| PO-403 B — stacco fra un rigore e l'altro | 0 cambi su 6 con stacco (telefono e PC) | 6/6 | `__CPM_NO_G191B` | `npm run lotteria-191` |
| PO-403 C — rigorista girato verso la porta prima della rincorsa | 2/6 entro 15°; fino a **151°** (telefono) / 153° (PC) | 6/6, **0°** | `__CPM_NO_G191C` | idem |
| PO-403 D — portiere del rigore precedente fuori dalla scena | nel quadro in 160 fotogrammi su 181 (telefono) e 143 su 178 (PC) | **0** | `__CPM_NO_G191D` | idem |

Foto prima/dopo: `docs/sviluppo/giro191/prima/` e `docs/sviluppo/giro191/dopo/` (telefono 375×812, PC 1280×800, corpi CH38 accesi).

## 1. PO-399 — lo stesso rigore dell'eroe calciato due volte

### Misura (sonda `sonda-rigore-139.mjs`, salvataggio 190, `RIG190_K=1`, velocità 2x)

Opzioni nuove della sonda: `CPM_PROD=1` (come in produzione: senza `__CPM_NO_G154`, il rigore fuori scena lo batte un compagno),
`CPM_ROSSO191=1` (accende `__CPM_NO_G191A`), e la misura `dopo191` = scena del rigore dell'eroe (`piazzato_giocato` entro 6' da
un'occasione da rigore) giocata quando il motore aveva già battuto quel rigore (una battuta fra occasione e scena, oppure dischetto vuoto).

- **r187d-11 seme 12, banco del 139** (eroe che batte anche nel motore): `59' rigore · 59' occasione_eroe* · 60' piazzato_giocato[nullo:volo] · 60' scena_gol · 61' battuta* 61' tiro*` — come nel giro 187.
- **r187d-11 seme 12, produzione:** `… 60' piazzato_giocato[nullo:volo] · 60' scena_gol · 61' battuta 61' tiro` — **il rigore lo calcia prima un compagno nel motore, poi l'eroe in scena**: due calci, due giocatori.
- **Lotto naturale in produzione, 32 partite** (`r191p-0…31`, semi 1-32, K=1): 32 giudicate, 22 rigori del motore, 12 battute dell'eroe in scena, **1 caso `dopo191`** (r191p-0: rigore al 44', occasione al 45', scena al 46' col dischetto già vuoto; la battuta del motore non è nel registro — ipotesi non verificata: è caduta a cavallo dell'intervallo). Quindi, con K=1 (quattro volte i rigori del gioco), **1 partita su 32, 1 battuta su 13 in scena**. Col K del gioco (0,25) non l'ho misurato: i rigori sono circa un quarto, la frequenza attesa per partita scala di conseguenza (stima, non misura).
- Il «doppio» del 139 segnato dalla sonda su r191p-13 (21' e 28') sono **due rigori diversi** concessi a 8 minuti di distanza, ciascuno battuto una volta in scena: falso positivo della finestra di 10' del giro 139, non un difetto.

**Causa (spia della sonda, `CPM_SPIA=1`).** Al 58' del motore il rigore è offerto (`_o27`=1). Al battito del 59' il live lo vede come
`occasione_eroe` ma **non lo inserisce** come scena extra: siamo all'ottava scena (`scenaExtraAmmessa`: tetto 9 per i rigori raggiunto,
`hl:7`), quindi nessuno chiama `attendiPiazzato`. Il fatto però diventa l'occasione corrente (`occEroe879Ref`). Il motore aspetta i suoi
40 passi (`_o27` 1→40 fra il 58' e il 59') e calcia. Al battito del 60' la **scena programmata** (percorso `motore-occasione`) si apre
con quel fatto, sceglie la scheda del rigore (`_pk27`) e l'eroe ricalcia.

### Correzione (`__CPM_NO_G191A` la spegne tutta)

1. **src/14** — `ponte191(n)`: quando il live fa suo un piazzato dell'eroe come fatto corrente **senza** inserirlo, il motore lo tiene sul
   dischetto per altri n passi (il live chiede 60, circa due battiti). Se la scena non arriva, il motore calcia come prima.
   `piazzatoStato191()`: dice se il piazzato è ancora in attesa e qual è stato l'ultimo tiro del motore (lato, intento, esito, minuto;
   registrato in `tira()` in `S._ultTiro191`).
2. **src/15, apertura della scena** — se il fatto corrente è un rigore/punizione dell'eroe: col piazzato in attesa si chiama
   `attendiPiazzato` (come già fa il percorso `brain-origine` dal giro 94 D2); se il motore **ha davvero tirato** quel piazzato (ultimo
   tiro della nostra squadra con intento `penalty`/`freekick`, dal minuto dell'occasione −2 in poi) la scena del piazzato **non si apre**
   e il fatto cade (registro `cpmEv("piazzato191")` e `scena_negata191` nel testimone).
3. **Prima stesura sbagliata, trovata dai controlli:** negavo la scena col solo «dischetto vuoto». rigore-139 (r187d-25) ha mostrato che
   un'**altra** scena aperta nel frattempo svuota il fermo senza calcio: la scena veniva negata e il rigore **spariva**. Ora serve il tiro
   vero; r187d-25 torna a «90' piazzato_giocato · 90' scena_gol» (un calcio).

**Esito su r187d-11:** verde `59' rigore · 59' occasione_eroe* · 60' piazzato_giocato[pen:42] · 60' scena_gol` sia in produzione sia nel
banco del 139; rosso come prima (`nullo:volo` + battuta del compagno al 61'). r191p-0 rigiocata: `50' rigore · 50' occasione_eroe* ·
51' piazzato_giocato[pen:30,tolto] · 51' scena_gol`.

### Decisione della madre, applicata in parte — DA LEGGERE
La decisione era: «se il motore ha già calciato, la scena mostra QUEL calcio con il suo esito, mai un secondo calcio». Ho rispettato
«mai un secondo calcio», ma **non** «la scena mostra quel calcio»: quando il motore ha già calciato, la scena non si apre (il calcio
resta quello del motore, raccontato dalla cronaca). Motivo: in produzione quel calcio lo batte un **compagno** (giro 154), e la scena
del piazzato è un'interazione dell'eroe; mostrarlo richiederebbe una scena non interattiva con un altro battitore e la gestione del gol
già contato dal motore (che altrimenti entrerebbe due volte). Non l'ho fatto in questo giro. Con il ponte, nelle partite misurate il caso
«già calciato» **non si è più presentato** (r187d-11, r191p-0, r191p-3, r191p-13: tutti in attesa all'apertura): il ramo di negazione
nel verde non è esercitato da nessun guardiano; lo esercita solo il rosso di rigore-139 (vedi §3).

## 2. PO-403 — lotteria dei rigori dopo il pareggio

### Misura «prima» (`lotteria-191.mjs` in modalità sonda, serie vera di Coppa forzata con `__CPM_SO_FORCE`, corpi CH38)
Testimone nuovo `window.__CPM_SO191` (src/12, solo `?cpmtest`, a fine fotogramma dopo pose e giri): rigore in corso, tempo dal suo
avvio, angolo fra lo sguardo del corpo 3D del rigorista e il centro porta (48, 0), portieri **non di turno** visibili nel quadro. La sonda
campiona ogni 50 ms anche il nero dello stacco nel DOM.

| per cambio di rigore (6 cambi) | telefono | PC |
|---|---|---|
| stacco | 0/6 | 0/6 |
| sguardo ≤15° prima della rincorsa | 2/6 (137°, 7°, 152°, 10°, 103°, 26°) | 2/6 (138°, 7°, 153°, 12°, 105°, 29°) |
| portiere del rigore precedente nel quadro | 160 fotogrammi su 181 | 143 su 178 |

**Cause, lette nel codice (src/12, blocco `P.shootout`).** (B) il nuovo rigore parte nello stesso istante in cui finisce il precedente,
senza nessun taglio. (C) il rigorista viene spostato dalla fila al dischetto di colpo; il corpo 3D legge quel salto come una corsa e si
gira verso la direzione del salto (dalla fila degli ospiti quasi all'indietro), poi resta fermo e non si gira più fino alla rincorsa.
(D) il portiere che non è più di turno torna al suo posto **camminando** dalla linea di porta, attraversando l'inquadratura per tutto il
rigore successivo.

### Correzione
- **B (src/15 + src/12)** — dal secondo rigore: nero **500 ms** col tabellino ✓ ✗ sopra (tabellone «CALCI DI RIGORE», punteggio, «… sul
  dischetto»), sotto il nero il 3D rifà la scena; la linea del tempo del rigore nel 3D è spostata di **0,6 s** e l'esito nel tabellino
  arriva 600 ms più tardi, così i tempi relativi tiro/esito restano quelli di prima. Chi ha calciato prima torna in fila di colpo.
- **C (src/12)** — il rigorista nasce girato verso la porta, corpo 3D compreso, e il salto al dischetto non conta come corsa.
- **D (src/12)** — il portiere non di turno va subito al posto d'attesa (−8, ±14), fuori dal quadro.

Due misure di percorso: (1) col nero **uguale** allo spostamento (600/600) una corsa su due del guardiano aveva un cambio senza campioni
utili; portato a 500/600. (2) Col nero **opaco** il primo fotogramma dopo il nero durava ~0,7 s in headless e saltava tutta la finestra
ferma (`CPM_DUMP`: tempo del rigore fermo a −0,09 per 650 ms); col nero al **97%** in due corse 23 cambi su 24 hanno avuto campioni nella
finestra ferma. Confronto non rigoroso (corse diverse, non due bracci sulla stessa pagina); `__CPM_NERO191` rimette l'opaco per confrontare.
Il guardiano, se un fotogramma lungo salta comunque la finestra, giudica il **primo fotogramma disegnato dopo il nero prima del calcio**
e lo stampa («primo fotogramma dopo il nero»).

### Dopo
Telefono e PC: stacco 6/6, sguardo 0° in 6/6, portiere altrui 0 fotogrammi. Guardiano `lotteria-191`: verde telefono + verde PC, e
ciascun rosso mostra il suo difetto (B: stacco 0/6; C: sguardo fino a 151,5°; D: 178 fotogrammi col portiere altrui).

⚠️ L'angolo misurato è 0° esatto perché misura e correzione usano lo stesso bersaglio (centro porta): la misura dimostra che **nessuno
lo sovrascrive** fino alla rincorsa, non che il bersaglio sia quello giusto per un calciatore vero. Durante la rincorsa (diagonale da
(32,8; 1,1) a (34,6; 0)) il corpo si gira verso la corsa: lì l'angolo sale a 8-10° (visto sul primo fotogramma dopo il nero quando la
finestra ferma salta). Non è nel mandato e non l'ho toccato.

## 3. Controlli (uno alla volta, `CPM_CI_PAR=0` non serviva: lanciati a mano in sequenza, `free -m` e `df -h` prima)
`node tools/build-src.mjs` + `node tools/check-src.mjs` dopo ogni modifica a src/ (identico).

| controllo | esito |
|---|---|
| `rigore-191` (nuovo) | ✅ verde produzione + verde banco, rosso visto |
| `lotteria-191` (nuovo) | ✅ verde telefono e PC, tre rossi visti (corsa finale) — due corse precedenti rosse, cause sopra §2 |
| `rigore-79` | ✅ |
| `rigore-139` | ✅ verde giudicato, rosso visto — **il rosso ora spegne anche `__CPM_NO_G191A`** (con il solo `__CPM_NO_G139` il doppio non si vede più: `90' battuta* tiro* · 91' scena_negata191`, la nuova difesa lo ferma) |
| `rigori-190` | ✅ verde 0,11 · rosso 0,53 |
| `gesto-177` | ✅ verde 6/6, rosso 3/3 |
| `riproduci-175` | ✅ verde passa, rosso cade |
| `riproduci-187` | ✅ verde passa, rosso cade |
| `partita-vera` | ✅ 12/12 bande, 2/2 partite |
| `validate-situations` | vedi §5 |
| `highlight-95` | vedi §5 |
| `test:logic` | ✅ 51 pass · 0 fail |
| `save-compat` | ✅ 12 pass · 0 fail |

`ci-runner.mjs`: `rigore-191` e `lotteria-191` nella catena completa, fra i LENTI e nella mappa (src/12 → lotteria; src/14 → rigore;
src/15 → entrambi). `node --check` verde.

## 4. Dubbi e cose non chiuse
1. **Decisione della madre su PO-399 applicata in parte** (§1): quando il motore ha già calciato la scena non si apre, invece di mostrare
   quel calcio. Va deciso se serve la scena «di sola visione» del calcio del compagno.
2. **Il ramo «già calciato» nel verde non è esercitato** da alcun guardiano (il ponte lo previene nelle partite misurate).
3. **Variabilità fra corse della stessa partita:** r191p-0 (rigore al 44' nel lotto, al 50' rigiocata) e r187a-22 dentro rigore-139
   (rigore al 50' in una corsa, al 77' nella successiva) hanno dato partite diverse su build dove il percorso prima del rigore non è
   cambiato. Non attribuito; riproduci-175/187 sono verdi. Le sonde girano a PAR 3-7 su processore conteso.
4. **Tabellone della lotteria:** nelle foto (prima e dopo) dietro il punteggio «1 — 0» si vede in trasparenza il minuto «90'»/«91'».
   Preesistente, fuori mandato, non toccato.
5. **Frequenza naturale col K del gioco (0,25) non misurata**: solo K=1 (1/32 partite).
6. Il «tempo del rigore» nella lotteria è a orologio di parete (`performance.now`, preesistente dal 7.31): su un telefono lento un
   fotogramma lungo può mangiare il momento in cui il rigorista è fermo. Il nero al 97% lo riduce in headless; sul telefono non misurato.
